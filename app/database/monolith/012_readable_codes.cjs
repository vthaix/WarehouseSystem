const codes=require('../../src/shared/readable-codes');
async function up(c){
 await c.beginTransaction();
 try{
  async function rename(table,row,prefix,name){
   const [prior]=await c.execute('SELECT MaMoi FROM LichSuDoiMa WHERE BangDuLieu=? AND MaBanGhiNguon=?',[table,row.id]);if(prior.length)return;
   const code=await codes.next(c,table,prefix,name);
   await c.execute('INSERT INTO LichSuDoiMa(BangDuLieu,MaBanGhiNguon,MaCu,MaMoi) VALUES (?,?,?,?)',[table,row.id,row.code,code]);
   await c.execute(`UPDATE ${table} SET code=? WHERE id=?`,[code,row.id]);
   if(table==='stock_requests')await c.execute('UPDATE tasks SET title=REPLACE(title,?,?) WHERE stock_request_id=?',[row.code,code,row.id]);
   await c.execute('UPDATE notifications SET subject=REPLACE(subject,?,?),body=REPLACE(body,?,?) WHERE subject LIKE ? OR body LIKE ?',[row.code,code,row.code,code,'%'+row.code+'%','%'+row.code+'%']);
  }
  const [headers]=await c.execute(`SELECT h.id,h.code,h.lot_kind,h.return_direction,w.name AS workshop_name,
   (SELECT s.name FROM lots l JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id JOIN purchase_orders po ON po.id=pl.purchase_order_id JOIN suppliers s ON s.id=COALESCE(pl.supplier_id,po.supplier_id) WHERE l.lot_header_id=h.id ORDER BY l.id LIMIT 1) AS supplier_name
   FROM lot_headers h LEFT JOIN production_plans p ON p.id=h.partial_production_plan_id LEFT JOIN workshops w ON w.id=p.workshop_id ORDER BY h.id FOR UPDATE`);
  for(const h of headers)if(!h.code.startsWith('DEMO-Q-'))await rename('lot_headers',h,h.lot_kind==='NGUYEN_VAT_LIEU'?'LO-NVL':h.lot_kind==='THANH_PHAM'?'LO-TP':'LO-TRA',h.supplier_name||h.workshop_name||(h.return_direction==='KHACH_HANG'?'KHACH-HANG':'NCC'));
  const [lots]=await c.execute(`SELECT l.id,l.code,i.name AS item_name,w.name AS workshop_name,h.lot_kind,s.name AS supplier_name FROM lots l JOIN items i ON i.id=l.item_id
   LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN production_plans p ON p.id=l.production_plan_id LEFT JOIN workshops w ON w.id=p.workshop_id
   LEFT JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id LEFT JOIN purchase_orders po ON po.id=pl.purchase_order_id LEFT JOIN suppliers s ON s.id=COALESCE(pl.supplier_id,po.supplier_id) ORDER BY l.id FOR UPDATE`);
  for(const l of lots)if(!l.code.startsWith('DEMO-Q-'))await rename('lots',l,l.lot_kind==='TRA_VE'?'TRA':l.supplier_name?'NVL':'TP',codes.words(l.supplier_name||l.workshop_name||'HANG')+'-'+codes.words(l.item_name));
  const definitions=[
   ['stock_requests',"SELECT r.id,r.code,r.purpose,w.name AS context FROM stock_requests r JOIN workshops w ON w.id=r.workshop_id",r=>({PURCHASE_RECEIPT:'YC-NHAP-NVL',PRODUCTION_RECEIPT:'YC-NHAP-TP',PRODUCTION_ISSUE:'YC-XUAT-NVL',SALE_ISSUE:'YC-XUAT-TP',MATERIAL_PURCHASE:'YC-MUA-NVL'}[r.purpose]||'YC-KHO')],
   ['tasks',"SELECT t.id,t.code,t.task_type,COALESCE(w.name,t.title) AS context FROM tasks t LEFT JOIN stock_requests r ON r.id=t.stock_request_id LEFT JOIN workshops w ON w.id=r.workshop_id",r=>r.task_type==='WAREHOUSE_IN'?'CV-NHAP':r.task_type==='WAREHOUSE_OUT'?'CV-XUAT':'CV'],
   ['qc_inspections',"SELECT q.id,q.code,s.quality_kind,s.location AS context FROM qc_inspections q LEFT JOIN stocktakes s ON s.id=q.campaign_id",r=>r.quality_kind==='MATERIAL'?'QC-NVL':'QC-TP'],
   ['stocktakes',"SELECT id,code,quality_kind,location AS context FROM stocktakes",r=>r.quality_kind==='MATERIAL'?'DOT-KIEM-NVL':r.quality_kind==='FINISHED_PRODUCT'?'DOT-KIEM-TP':'DOT-KIEM'],
   ['stock_documents',"SELECT d.id,d.code,d.type,w.name AS context FROM stock_documents d JOIN warehouses k ON k.id=d.warehouse_id LEFT JOIN workshops w ON w.id=k.workshop_id",r=>r.type==='IN'?'PHIEU-NHAP':'PHIEU-XUAT'],
   ['exception_proposals',"SELECT id,code,'KHO' AS context FROM exception_proposals",()=> 'DE-XUAT'],
  ];
  for(const [table,sql,prefix]of definitions){
   const [rows]=await c.execute(sql+' ORDER BY id FOR UPDATE');
   for(const r of rows)if(/(?:[A-F0-9]{10,}|PRODUCTION|PURCHASE|FINISHED|MATERIAL|STOCK_|\bTP-SX-\d|^LQC-|^QC-\d+-[A-Fa-f0-9]+$)/.test(r.code))await rename(table,r,prefix(r),r.context||'KHO');
  }
  await c.commit();
 }catch(e){await c.rollback();throw e;}
}
module.exports={up};
