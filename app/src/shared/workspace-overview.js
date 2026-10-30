// Reuses scoped application services for work queues; no global inventory totals
// are shown to actors who cannot read inventory.
module.exports=async function overview(runtime,user,available){
 const counts=await runtime.notifications.badges(user);
 const can=key=>available.some(m=>m[0]===key);
 let purchaseReady=[];
 if(user.roles.includes('PURCHASER')){
  const [rows]=await runtime.pool.execute("SELECT p.id,p.code,p.planned_date,p.created_at,(SELECT COUNT(*) FROM business_plan_lines l WHERE l.business_plan_id=p.id) AS line_count FROM business_plans p WHERE p.type='PURCHASE' AND p.status='APPROVED' AND NOT EXISTS(SELECT 1 FROM purchase_orders o WHERE o.business_plan_id=p.id) ORDER BY p.id DESC LIMIT 6");
  purchaseReady=rows.map(r=>({...r,id:String(r.id)}));
  const [[n]]=await runtime.pool.execute("SELECT COUNT(*) total FROM business_plans p WHERE p.type='PURCHASE' AND p.status='APPROVED' AND NOT EXISTS(SELECT 1 FROM purchase_orders o WHERE o.business_plan_id=p.id)");
  counts['purchase-orders']=Number(n.total);
 }
 const titles={'production-plans':'Kế hoạch sản xuất chờ duyệt','business-plans':'Kế hoạch mua / bán chờ duyệt','customer-orders':'Đơn hàng cần tiếp nhận','purchase-orders':'Kế hoạch chờ đặt mua','stock-requests':'Yêu cầu nhập / xuất cần xem','tasks':'Công việc đang thực hiện','qc-inspections':'Đợt chờ kiểm chất lượng','inspection-counts':'Công việc chờ kiểm đếm','stocktake-minutes':'Biên bản cần lập','exception-proposals':'Ngoại lệ cần xử lý'};
 if(user.roles.includes('WAREHOUSE_MANAGER')){
  const result=await runtime.stockRequests.list(user,{status:'PENDING',per_page:1});counts['stock-requests']=result.meta.total;
 }
 if(user.roles.includes('CUSTOMER')){
  const result=await runtime.orders.list(user,{per_page:1});counts['customer-orders']=result.meta.total;titles['customer-orders']='Đơn hàng của bạn';
 }
 titles['warehouse-inbound']='Nhập kho cần thực hiện';titles['warehouse-outbound']='Xuất kho cần thực hiện';
 const priority=user.roles.includes('DIRECTOR')?['production-plans','business-plans','tasks','exception-proposals']:user.roles.includes('PURCHASER')?['purchase-orders','tasks']:user.roles.some(r=>['WAREHOUSE_MANAGER','WAREHOUSE_STAFF'].includes(r))?['warehouse-inbound','warehouse-outbound','exception-proposals']:Object.keys(titles);
 const tiles=priority.filter(k=>can(k)&&Object.hasOwn(counts,k)).map(key=>{const m=available.find(m=>m[0]===key);return {key,label:titles[key],count:Number(counts[key]||0),url:m[5]+'?module='+key,icon:m[2]};}).slice(0,3);
 tiles.push({key:'notifications',label:'Thông báo chưa đọc',count:Number(counts.notifications||0),url:'/notifications',icon:'♧'});
 return {tiles,counts,purchaseReady};
};
