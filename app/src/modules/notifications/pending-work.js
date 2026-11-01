// Work is derived from persisted state. Reading a notification cannot finish it.
module.exports=async function pendingWork(pool,user){
 const result={},has=r=>user.roles.includes(r);
 async function add(resource,reason,sql,args=[]){const [rows]=await pool.execute(sql,args);const list=result[resource]||(result[resource]=[]);for(const row of rows)if(!list.some(x=>x.id===String(row.id)))list.push({id:String(row.id),reason});}
 if(has('DIRECTOR')){
  await add('production-plans','Chờ phê duyệt',"SELECT id FROM production_plans WHERE status='DRAFT'");
  await add('business-plans','Chờ phê duyệt',"SELECT id FROM business_plans WHERE status='PENDING_APPROVAL'");
 }
 if(has('PLANNER')){
  await add('business-plans','Chờ điều chỉnh kế hoạch bị từ chối',"SELECT id FROM business_plans WHERE status='REJECTED'");
  await add('customer-orders','Chờ tiếp nhận',"SELECT id FROM customer_orders WHERE status='SUBMITTED'");
  await add('customer-orders','Chờ lập kế hoạch sản xuất',"SELECT o.id FROM customer_orders o WHERE o.status='RECEIVED' AND NOT EXISTS(SELECT 1 FROM production_plans p WHERE p.customer_order_id=o.id AND p.status<>'CANCELLED')");
  await add('production-reports','Chờ lập kế hoạch mua',"SELECT r.id FROM production_reports r WHERE r.status='SUBMITTED' AND r.send_to_planner=1 AND r.report_purpose='NHU_CAU' AND EXISTS(SELECT 1 FROM production_report_lines l WHERE l.production_report_id=r.id AND l.required_quantity-l.available_quantity>COALESCE((SELECT SUM(bl.quantity) FROM business_plans p JOIN business_plan_lines bl ON bl.business_plan_id=p.id WHERE p.production_report_id=r.id AND bl.item_id=l.item_id AND p.status NOT IN ('REJECTED','CANCELLED')),0))");
  await add('finished-reports','Chờ lập kế hoạch bán',"SELECT r.id FROM finished_reports r WHERE r.status='SUBMITTED' AND r.production_completed=1 AND NOT EXISTS(SELECT 1 FROM business_plans p WHERE p.finished_report_id=r.id AND p.status NOT IN ('REJECTED','CANCELLED'))");
  const sources=await require('../../shared/minute-compensations').list(pool,user);
  for(const [key,kind]of [['business-plans','MATERIAL'],['production-plans','FINISHED_PRODUCT']])for(const source of sources)if(source.lines.some(l=>l.kind===kind&&Number(l.remaining_compensation_quantity)>0))(result['compensation-'+key]||(result['compensation-'+key]=[])).push({id:source.id,reason:'Chờ lập kế hoạch bù'});
 }
 if(has('PURCHASER'))await add('business-plans','Chờ đặt mua nguyên vật liệu',"SELECT p.id FROM business_plans p WHERE p.type='PURCHASE' AND p.status='APPROVED' AND NOT EXISTS(SELECT 1 FROM purchase_orders o WHERE o.business_plan_id=p.id)");
 if(has('WAREHOUSE_MANAGER')){
  for(const [resource,type]of [['warehouse-inbound','IN'],['warehouse-outbound','OUT']])await add(resource,'Chờ điều phối / hoàn tất',"SELECT id FROM stock_requests WHERE manager_id=? AND type=? AND status IN ('PENDING','PARTIALLY_FULFILLED')",[user.id,type]);
  await add('exception-proposals','Chờ xử lý ngoại lệ',"SELECT CONCAT('LOT-',id) AS id FROM stocktakes WHERE BienBanTrangThai='SUBMITTED' AND NgoaiLeMoTa IS NOT NULL AND NgoaiLeTrangThai IN ('OPEN','APPROVED','REJECTED')");
  await add('purchase-checks','Chờ tạo lô phần đạt',"SELECT DISTINCT s.id FROM stocktakes s JOIN ThucKiemKeHoachMua x ON x.MaDot=s.id WHERE s.KiemTheoKeHoach=1 AND s.status IN ('COMPLETED','CLOSED') AND x.SoDat>0 AND x.MaLo IS NULL");
 }
 if(has('WAREHOUSE_STAFF'))for(const [resource,type]of [['warehouse-inbound','IN'],['warehouse-outbound','OUT']])await add(resource,'Chờ ghi phiếu kho',"SELECT DISTINCT r.id FROM stock_requests r JOIN stock_allocations a ON a.stock_request_id=r.id JOIN tasks t ON t.id=a.task_id WHERE r.type=? AND a.user_id=? AND t.status IN ('PLANNED','IN_PROGRESS') AND a.quantity>a.posted_quantity",[type,user.id]);
 if(user.roles.some(r=>['DIRECTOR','WAREHOUSE_MANAGER','WAREHOUSE_STAFF','QC_INSPECTOR','STOCKTAKER','WORKSHOP_OWNER','PLANNER','PURCHASER'].includes(r)))await add('tasks','Công việc chưa hoàn tất',"SELECT t.id FROM tasks t WHERE t.status IN ('PLANNED','IN_PROGRESS') AND (t.manager_id=? OR EXISTS(SELECT 1 FROM task_assignments a WHERE a.task_id=t.id AND a.user_id=?))",[user.id,user.id]);
 if(has('QC_INSPECTOR')||has('STOCKTAKER')){
  await add('stocktake-minutes','Được phân công lập / gửi biên bản',"SELECT CONCAT('LOT-',id) AS id FROM stocktakes WHERE NguoiLapBienBanDuocChon=? AND campaign_type='QUALITY_CHECK' AND status IN ('COMPLETED','CLOSED') AND BienBanTrangThai='DRAFT'",[user.id]);
  for(const [role,key,flag,column]of [['QC_INSPECTOR','qc-inspections','KiemChatLuong','ThucNhan'],['STOCKTAKER','inspection-counts','KiemSoLuong','SoDem']])if(has(role)){
   await add(key,'Chờ thực kiểm theo kế hoạch',"SELECT DISTINCT s.id FROM stocktakes s JOIN quality_campaign_assignments a ON a.campaign_id=s.id JOIN purchase_orders p ON p.business_plan_id=s.MaKeHoachMuaQC JOIN purchase_order_lines l ON l.purchase_order_id=p.id WHERE a.user_id=? AND s.KiemTheoKeHoach=1 AND s."+flag+"=1 AND s.status='IN_PROGRESS' AND NOT EXISTS(SELECT 1 FROM ThucKiemKeHoachMua x WHERE x.MaDot=s.id AND x.MaDongDonMua=l.id AND x."+column+' IS NOT NULL)',[user.id]);
   await add(key,'Chờ kiểm tra lô được phân công',"SELECT DISTINCT s.id FROM stocktakes s JOIN quality_campaign_assignments a ON a.campaign_id=s.id JOIN quality_campaign_lots q ON q.campaign_id=s.id JOIN lots l ON l.id=q.lot_id WHERE a.user_id=? AND s."+flag+"=1 AND s.status='IN_PROGRESS' AND "+(role==='QC_INSPECTOR'?"l.qc_status='PENDING'":'q.SoLuongDem IS NULL'),[user.id]);
  }
 }
 const ids=(user.workshop_ids||[]).map(String);
 if(has('WORKSHOP_OWNER')&&ids.length){const marks=ids.map(()=>'?').join(',');
  await add('production-plans','Chờ thực hiện sản xuất',"SELECT id FROM production_plans WHERE status IN ('APPROVED','IN_PROGRESS') AND workshop_id IN ("+marks+')',ids);
  await add('exception-proposals','Chờ quyết định của chủ xưởng',"SELECT CONCAT('LOT-',id) AS id FROM stocktakes WHERE NgoaiLeTrangThai='PENDING_APPROVAL' AND NgoaiLeMaXuong IN ("+marks+')',ids);
  await add('stock-requests','Yêu cầu chưa hoàn tất',"SELECT id FROM stock_requests WHERE workshop_id IN ("+marks+") AND status IN ('PENDING','PARTIALLY_FULFILLED')",ids);
 }
 return result;
};
