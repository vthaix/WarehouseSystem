const C=require('../../../domain/core'),P=require('../../../domain/policy');
module.exports=async function lookup(pool,user,query={}){
  // UC-22 explicitly allows owners to read shared warehouse stock (see
  // docs/BUSINESS_DECISIONS.md and USE_CASES.md). This read-only DTO exposes no
  // other workshop's orders, reports, staff or warehouse documents.
  P.role(user,['WAREHOUSE_MANAGER','WORKSHOP_OWNER']);C.fields(query,['warehouse_id']);
  if(query.warehouse_id!==undefined)C.fail(!/^[1-9]\d*$/.test(String(query.warehouse_id)),'VALIDATION_ERROR','Kho được chọn không hợp lệ.');
  const [warehouses]=await pool.execute('SELECT id,code,name FROM warehouses WHERE is_active=1 ORDER BY code');
  const warehouse=query.warehouse_id?warehouses.find(w=>String(w.id)===String(query.warehouse_id)):warehouses[0];
  C.fail(query.warehouse_id&&!warehouse,'NOT_FOUND','Kho không tồn tại hoặc đã ngừng hoạt động.',404);
  const [categories]=await pool.execute('SELECT id,code,name,image_path FROM categories WHERE is_active=1 ORDER BY name');
  if(!warehouse)return {warehouses:[],categories,warehouse_id:null,locations:[],as_of:new Date().toISOString()};
  const [locations]=await pool.execute('SELECT id,code,name,is_active FROM warehouse_locations WHERE warehouse_id=? ORDER BY code',[warehouse.id]);
  const [stock]=await pool.execute("SELECT b.location_id,b.lot_id,b.quality_bucket,b.quantity,l.code AS lot_code,l.qc_status,l.expiry_date,i.id AS item_id,i.code AS item_code,i.name AS item_name,i.kind,i.category_id,u.name AS unit,c.image_path AS category_image,CASE WHEN b.quality_bucket='AVAILABLE' THEN COALESCE((SELECT SUM(a.quantity-a.posted_quantity) FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=b.lot_id AND a.location_id=b.location_id AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'),0) ELSE 0 END AS reserved_quantity FROM inventory_balances b JOIN warehouse_locations w ON w.id=b.location_id JOIN lots l ON l.id=b.lot_id JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id LEFT JOIN categories c ON c.id=i.category_id WHERE w.warehouse_id=? AND b.quantity>0 ORDER BY w.code,i.name,l.code,b.quality_bucket",[warehouse.id]);
  const quantities=require('../../../domain/core');
  for(const line of stock){
    const expiry=line.expiry_date instanceof Date?line.expiry_date.toISOString().slice(0,10):line.expiry_date;
    line.expiry_date=expiry;line.expired=!!expiry&&expiry<C.today();
    const available=quantities.qty(String(line.quantity),false)-quantities.qty(String(line.reserved_quantity),false);
    line.available_quantity=line.quality_bucket==='AVAILABLE'&&!line.expired&&['PASSED','PARTIAL'].includes(line.qc_status)&&available>0n?quantities.decimal(available):'0.000';
  }
  const normalize=r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,k==='id'||k.endsWith('_id')?v==null?null:String(v):v]));
  return {warehouses:warehouses.map(normalize),categories:categories.map(normalize),warehouse_id:String(warehouse.id),locations:locations.map(l=>({...normalize(l),stock:stock.filter(s=>String(s.location_id)===String(l.id)).map(normalize)})),as_of:new Date().toISOString()};
};
