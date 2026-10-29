const C=require('../../services/domain/core');
module.exports=async function(c,planId){
  const [outputs]=await c.execute('SELECT l.item_id,SUM(o.quantity) AS quantity FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id JOIN finished_reports r ON r.id=o.finished_report_id WHERE r.production_plan_id=? GROUP BY l.item_id',[planId]);
  const [issued]=await c.execute("SELECT l.item_id,SUM(d.quantity) AS quantity FROM stock_document_lines d JOIN lots l ON l.id=d.lot_id JOIN stock_documents doc ON doc.id=d.stock_document_id JOIN stock_requests r ON r.id=doc.stock_request_id WHERE r.production_plan_id=? AND r.purpose='PRODUCTION_ISSUE' AND doc.type='OUT' AND doc.status='POSTED' GROUP BY l.item_id",[planId]);
  const [used]=await c.execute('SELECT m.item_id,SUM(m.used_quantity) AS quantity FROM finished_report_materials m JOIN finished_reports r ON r.id=m.finished_report_id WHERE r.production_plan_id=? GROUP BY m.item_id',[planId]);
  const quantities=rows=>rows.map(r=>({item_id:String(r.item_id),quantity:C.decimal(C.qty(String(r.quantity),false))}));
  return {reported_outputs:quantities(outputs),issued_materials:quantities(issued),reported_materials:quantities(used)};
};
