const codes=require('../../src/shared/readable-codes');
async function up(c){await c.beginTransaction();try{
 const queries=[
  ['customer_orders','DH','SELECT o.id,o.code,c.name AS context FROM customer_orders o JOIN customers c ON c.id=o.customer_id'],
  ['production_plans','KHSX','SELECT p.id,p.code,c.name AS context FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id'],
  ['production_reports','BCSX','SELECT r.id,r.code,c.name AS context FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id'],
  ['finished_reports','BCTP','SELECT r.id,r.code,c.name AS context FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id'],
  ['purchase_orders','DM',"SELECT p.id,p.code,COALESCE(s.name,'NHIEU-NCC') AS context FROM purchase_orders p LEFT JOIN suppliers s ON s.id=p.supplier_id"],
  ['business_plans',null,"SELECT p.id,p.code,p.type,COALESCE(c.name,s.name,'NOI-BO') AS context FROM business_plans p LEFT JOIN customers c ON c.id=p.customer_id LEFT JOIN suppliers s ON s.id=p.supplier_id"],
 ];
 for(const [table,prefix,sql]of queries){const [rows]=await c.execute(sql+' ORDER BY id FOR UPDATE');for(const r of rows){
  if(!/[A-Fa-f0-9]{10,}|-(?:KH|NCC)\d+$/.test(r.code))continue;
  const [prior]=await c.execute('SELECT MaMoi FROM LichSuDoiMa WHERE BangDuLieu=? AND MaBanGhiNguon=?',[table,r.id]);if(prior.length)continue;
  const next=await codes.next(c,table,prefix||(r.type==='PURCHASE'?'KHMUA':'KHBAN'),r.context);
  await c.execute('INSERT INTO LichSuDoiMa(BangDuLieu,MaBanGhiNguon,MaCu,MaMoi) VALUES (?,?,?,?)',[table,r.id,r.code,next]);await c.execute(`UPDATE ${table} SET code=? WHERE id=?`,[next,r.id]);
  await c.execute('UPDATE notifications SET subject=REPLACE(subject,?,?),body=REPLACE(body,?,?) WHERE subject LIKE ? OR body LIKE ?',[r.code,next,r.code,next,'%'+r.code+'%','%'+r.code+'%']);
 }}await c.commit();}catch(e){await c.rollback();throw e;}}
module.exports={up};
