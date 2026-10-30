// Counts are scoped to the authenticated user. Pending work remains visible until
// completed; opening a menu does not silently acknowledge an outstanding action.
module.exports=async function badges(pool,user){
  const result={},has=role=>user.roles.includes(role);
  const count=async(key,sql,args=[])=>{const [[r]]=await pool.execute(sql,args);result[key]=Number(r.total);};
  const [unread]=await pool.execute('SELECT resource_type,COUNT(*) AS total FROM notifications WHERE user_id=? AND read_at IS NULL GROUP BY resource_type',[user.id]);
  const aliases={'minute-exceptions':'exception-proposals','quality-campaigns':'stocktakes'};
  result.notifications=0;
  for(const r of unread){const n=Number(r.total);result.notifications+=n;const key=aliases[r.resource_type]||r.resource_type;if(key&&key!=='notifications')result[key]=(result[key]||0)+n;}
  if(result['stock-documents'])result['warehouse-records']=result['stock-documents'];
  await count('tasks',"SELECT COUNT(*) AS total FROM tasks t WHERE t.status IN ('PLANNED','IN_PROGRESS') AND (t.manager_id=? OR EXISTS(SELECT 1 FROM task_assignments a WHERE a.task_id=t.id AND a.user_id=?))",[user.id,user.id]);
  if(has('DIRECTOR')){
    await count('production-plans',"SELECT COUNT(*) AS total FROM production_plans WHERE status='DRAFT'");
    await count('business-plans',"SELECT COUNT(*) AS total FROM business_plans WHERE status='PENDING_APPROVAL'");
  }
  if(has('PLANNER'))await count('customer-orders',"SELECT COUNT(*) AS total FROM customer_orders WHERE status='SUBMITTED'");
  if(has('PURCHASER'))await count('purchase-orders',"SELECT COUNT(*) AS total FROM business_plans p WHERE p.type='PURCHASE' AND p.status='APPROVED' AND NOT EXISTS(SELECT 1 FROM purchase_orders o WHERE o.business_plan_id=p.id)");
  if(has('WAREHOUSE_MANAGER')||has('WAREHOUSE_STAFF'))for(const [key,type]of [['warehouse-inbound','IN'],['warehouse-outbound','OUT']]){
   if(has('WAREHOUSE_MANAGER'))await count(key,"SELECT COUNT(*) total FROM stock_requests WHERE type=? AND manager_id=? AND status IN ('PENDING','PARTIALLY_FULFILLED')",[type,user.id]);
   else await count(key,"SELECT COUNT(DISTINCT r.id) total FROM stock_requests r JOIN stock_allocations a ON a.stock_request_id=r.id JOIN tasks t ON t.id=a.task_id WHERE r.type=? AND a.user_id=? AND t.status IN ('PLANNED','IN_PROGRESS') AND a.quantity>a.posted_quantity",[type,user.id]);
  }
  if(has('STOCKTAKER'))await count('inspection-counts',"SELECT COUNT(DISTINCT t.id) AS total FROM tasks t JOIN task_assignments a ON a.task_id=t.id JOIN stocktakes s ON s.id=t.stocktake_id WHERE a.user_id=? AND t.task_type='LOT_INSPECTION' AND s.KiemSoLuong=1 AND s.status='IN_PROGRESS' AND EXISTS(SELECT 1 FROM quality_campaign_lots l WHERE l.campaign_id=s.id AND l.SoLuongDem IS NULL)",[user.id]);
  if(has('QC_INSPECTOR'))await count('qc-inspections',"SELECT COUNT(DISTINCT s.id) AS total FROM stocktakes s JOIN quality_campaign_assignments a ON a.campaign_id=s.id WHERE a.user_id=? AND s.KiemChatLuong=1 AND s.status='IN_PROGRESS' AND EXISTS(SELECT 1 FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id WHERE q.campaign_id=s.id AND l.qc_status='PENDING')",[user.id]);
  if(has('QC_INSPECTOR')||has('STOCKTAKER'))await count('stocktake-minutes',"SELECT COUNT(*) AS total FROM stocktakes WHERE NguoiLapBienBanDuocChon=? AND campaign_type='QUALITY_CHECK' AND status IN ('COMPLETED','CLOSED') AND BienBanTrangThai='DRAFT'",[user.id]);
  if(has('WAREHOUSE_MANAGER')){
    await count('exception-proposals',"SELECT COUNT(*) AS total FROM stocktakes WHERE BienBanTrangThai='SUBMITTED' AND NgoaiLeMoTa IS NOT NULL AND NgoaiLeTrangThai IN ('OPEN','APPROVED','REJECTED')");
  }else if(has('WORKSHOP_OWNER')){
    const ids=(user.workshop_ids||[]).map(String);
    result['exception-proposals']=0;
    if(ids.length)await count('exception-proposals',"SELECT COUNT(*) AS total FROM stocktakes WHERE NgoaiLeTrangThai='PENDING_APPROVAL' AND NgoaiLeMaXuong IN ("+ids.map(()=>'?').join(',')+')',ids);
  }
  return result;
};
