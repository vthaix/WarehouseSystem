const C=require('../../../domain/core');
const P=require('../../../domain/policy');
const valid=id=>/^[1-9]\d*$/.test(String(id));
function execution(body,existing=null){
  const day=body.requested_date||existing?.requested_date;
  const text=body.requested_at||(body.requested_date?day+'T08:00:00+07:00':existing?.ThoiDiemThucHien||day+'T08:00:00+07:00');
  const value=new Date(text);
  C.fail(!Number.isFinite(+value)||(body.requested_at!==undefined&&(typeof body.requested_at!=='string'||!/(Z|[+-]\d\d:\d\d)$/.test(body.requested_at))),'VALIDATION_ERROR','Ngày giờ thực hiện không hợp lệ.');
  const local=new Date(+value+7*3600000).toISOString().slice(0,10);
  const expected=day instanceof Date?day.toISOString().slice(0,10):String(day);
  C.fail(local!==expected,'VALIDATION_ERROR','Ngày giờ thực hiện phải cùng ngày yêu cầu.');C.date(local,'requested_at',true);
  return value;
}
async function options(c,u){
  P.role(u,['WORKSHOP_OWNER']);
  const ids=(u.workshop_ids||[]).map(String);if(!ids.length)return {purchase_plans:[],production_plans:[],finished_reports:[],sale_plans:[]};
  const slots=ids.map(()=>'?').join(',');
  const [production]=await c.execute("SELECT id,code,workshop_id,status FROM production_plans WHERE workshop_id IN ("+slots+") AND status IN ('APPROVED','IN_PROGRESS','COMPLETED') ORDER BY id DESC LIMIT 200",ids);
  const [reports]=await c.execute("SELECT r.id,r.code,r.production_plan_id,p.workshop_id FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE p.workshop_id IN ("+slots+") AND r.status='SUBMITTED' ORDER BY r.id DESC LIMIT 200",ids);
  const [purchases]=await c.execute("SELECT b.id,b.code,p.id AS purchase_order_id,p.code AS purchase_order_code,COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id) AS workshop_id FROM business_plans b JOIN purchase_orders p ON p.business_plan_id=b.id LEFT JOIN production_reports pr ON pr.id=b.production_report_id LEFT JOIN production_plans ps ON ps.id=pr.production_plan_id LEFT JOIN stock_requests r ON r.id=b.source_request_id LEFT JOIN production_plans s ON s.id=b.production_plan_id WHERE b.type='PURCHASE' AND b.status IN ('APPROVED','IN_PROGRESS','COMPLETED') AND p.status IN ('PENDING','PARTIALLY_RECEIVED') AND (COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id) IS NULL OR COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id) IN ("+slots+')) ORDER BY b.id DESC LIMIT 200',ids);
  const [sales]=await c.execute("SELECT b.id,b.code,r.production_plan_id,p.workshop_id FROM business_plans b JOIN finished_reports r ON r.id=b.finished_report_id JOIN production_plans p ON p.id=r.production_plan_id WHERE b.type='SALE' AND b.status IN ('APPROVED','IN_PROGRESS') AND p.workshop_id IN ("+slots+') ORDER BY b.id DESC LIMIT 200',ids);
  const [direct]=await c.execute("SELECT id,code FROM purchase_orders WHERE business_plan_id IS NULL AND status IN ('PENDING','PARTIALLY_RECEIVED') ORDER BY id DESC LIMIT 100");
  const normalize=rows=>rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,(k==='id'||k.endsWith('_id'))&&v!==null?String(v):v])));
  return {purchase_plans:[...normalize(purchases),...direct.map(p=>({id:'ORDER:'+p.id,code:'Đơn mua trực tiếp · '+p.code,purchase_order_id:String(p.id),workshop_id:null}))],production_plans:normalize(production),finished_reports:normalize(reports),sale_plans:normalize(sales)};
}
async function resolve(c,u,purpose,sourceId,workshopId,salePlanId){
  P.role(u,['WORKSHOP_OWNER']);C.fail((!valid(sourceId)&&!(purpose==='PURCHASE_RECEIPT'&&/^ORDER:[1-9]\d*$/.test(String(sourceId))))||!valid(workshopId)||!(u.workshop_ids||[]).map(String).includes(String(workshopId)),'FORBIDDEN','Nguồn hoặc xưởng không hợp lệ.',403);
  const sources=await options(c,u);
  if(purpose==='PURCHASE_RECEIPT'){
    const plan=sources.purchase_plans.find(p=>p.id===String(sourceId));C.fail(!plan||(plan.workshop_id&&plan.workshop_id!==String(workshopId)),'NOT_FOUND','Kế hoạch mua chưa có đơn mua hợp lệ hoặc không thuộc xưởng.',404);
    return {purchase_order_id:plan.purchase_order_id,production_source_mode:'REPORT'};
  }
  if(purpose==='PRODUCTION_RECEIPT'){
    const report=sources.finished_reports.find(r=>r.id===String(sourceId)&&r.workshop_id===String(workshopId));C.fail(!report,'NOT_FOUND','Không tìm thấy báo cáo thành phẩm đã gửi của xưởng.',404);
    return {production_report_id:report.id,production_source_mode:'REPORT'};
  }
  const plan=sources.production_plans.find(p=>p.id===String(sourceId)&&p.workshop_id===String(workshopId));C.fail(!plan,'NOT_FOUND','Không tìm thấy KHSX thuộc xưởng.',404);
  if(purpose==='PRODUCTION_ISSUE'){C.fail(plan.status==='COMPLETED','INVALID_STATE','KHSX đã hoàn tất, không xuất thêm NVL.',409);return {production_plan_id:plan.id,production_source_mode:'PLAN'};}
  C.fail(purpose!=='SALE_ISSUE','VALIDATION_ERROR','Chọn đúng một trong bốn nhánh nhập/xuất.');
  const sales=sources.sale_plans.filter(s=>s.production_plan_id===plan.id);
  const sale=salePlanId?sales.find(s=>s.id===String(salePlanId)):sales.length===1?sales[0]:null;
  C.fail(!sale,'SOURCE_REQUIRED',sales.length?'KHSX có nhiều kế hoạch bán: chọn kế hoạch bán cần giao.':'KHSX chưa có kế hoạch bán đã duyệt liên quan.',409);
  return {business_plan_id:sale.id,production_source_mode:'REPORT'};
}
async function lots(c,row){
  let scope='',params=[];
  if(row.purpose==='PURCHASE_RECEIPT'){scope='l.purchase_order_line_id IN (SELECT id FROM purchase_order_lines WHERE purchase_order_id=?)';params=[row.purchase_order_id];}
  else if(row.purpose==='PRODUCTION_RECEIPT'&&row.production_source_mode!=='MANUAL'){scope='l.id IN (SELECT lot_id FROM finished_report_outputs WHERE finished_report_id=?)';params=[row.production_report_id];}
  else return [];
  const [rows]=await c.execute('SELECT l.id AS lot_id,h.code AS lot_header_code,l.code AS lot_code,l.item_id,i.name AS item_name,u.name AS unit,l.received_quantity,l.qc_status,q.passed_quantity,q.failed_quantity FROM lots l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE '+scope+' ORDER BY l.id',params);
  return rows.map(r=>({...r,lot_id:String(r.lot_id),item_id:String(r.item_id)}));
}
module.exports={execution,options,resolve,lots};
