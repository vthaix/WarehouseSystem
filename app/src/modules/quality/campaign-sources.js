const C=require('../../services/domain/core');
const day=v=>v instanceof Date?v.toISOString().slice(0,10):String(v).slice(0,10);
async function source(c,mode,id,lock=false){
  C.fail(!['PURCHASE_PLAN','PRODUCTION_PLAN'].includes(mode)||!(/^[1-9]\d*$/.test(String(id))), 'VALIDATION_ERROR','Nguồn kế hoạch không hợp lệ.');
  const sql=mode==='PURCHASE_PLAN'
    ?"SELECT id,code,planned_date AS expected_date,status FROM business_plans WHERE id=? AND type='PURCHASE'"
    :"SELECT p.id,p.code,COALESCE(o.latest_delivery_date,p.end_date) AS expected_date,p.status FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id WHERE p.id=?";
  const [rows]=await c.execute(sql+(lock?' FOR UPDATE':''),[id]);
  C.fail(!rows.length||!['APPROVED','IN_PROGRESS','COMPLETED'].includes(rows[0].status),'INVALID_STATE','Kế hoạch nguồn chưa được duyệt hoặc đã hủy.',409);
  const [lines]=await c.execute(mode==='PURCHASE_PLAN'
    ?'SELECT l.item_id,i.name AS item_name,l.quantity FROM business_plan_lines l JOIN items i ON i.id=l.item_id WHERE l.business_plan_id=?'
    :'SELECT l.item_id,i.name AS item_name,l.quantity FROM production_plan_outputs l JOIN items i ON i.id=l.item_id WHERE l.production_plan_id=?',[id]);
  return {...rows[0],id:String(rows[0].id),expected_date:day(rows[0].expected_date),source_mode:mode,lines,quality_kind:mode==='PURCHASE_PLAN'?'MATERIAL':'FINISHED_PRODUCT'};
}
async function actualLots(c,ids=null,maxRows=100){
  const [rows]=await c.execute("SELECT l.*,h.code AS lot_header_code,i.name AS item_name,i.kind,po.business_plan_id AS purchase_plan_id,COALESCE(sr.requested_date,CASE WHEN fr.KieuThanhPham='PART' THEN fr.completed_date ELSE NULL END,bp.planned_date,po.expected_delivery_date,DATE_FORMAT(DATE_ADD(l.created_at,INTERVAL 7 HOUR),'%Y-%m-%d')) AS expected_date FROM lots l JOIN items i ON i.id=l.item_id LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN stock_requests sr ON sr.id=l.production_receipt_request_id LEFT JOIN finished_report_outputs fo ON fo.lot_id=l.id LEFT JOIN finished_reports fr ON fr.id=fo.finished_report_id LEFT JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id LEFT JOIN purchase_orders po ON po.id=pl.purchase_order_id LEFT JOIN business_plans bp ON bp.id=po.business_plan_id WHERE l.qc_status='PENDING'"+(ids?' AND l.id IN ('+ids.map(()=>'?').join(',')+')':'')+" AND NOT EXISTS(SELECT 1 FROM quality_campaign_lots q JOIN stocktakes s ON s.id=q.campaign_id WHERE q.lot_id=l.id AND s.status IN ('PLANNED','IN_PROGRESS')) ORDER BY l.id DESC"+(ids?' FOR UPDATE':' LIMIT '+Math.min(1000,Math.max(1,Number(maxRows)||100))),ids||[]);
  return rows.map(l=>({...l,id:String(l.id),expected_date:day(l.expected_date),name:`${l.lot_header_code||l.code} · ${l.code} · ${l.item_name} · ${l.received_quantity} · ${day(l.expected_date)}`}));
}
function matches(row,mode,id){return String(mode==='PURCHASE_PLAN'?row.purchase_plan_id:row.production_plan_id)===String(id);}
module.exports={source,actualLots,matches};
