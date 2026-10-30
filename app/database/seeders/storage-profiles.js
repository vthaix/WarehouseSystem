const profiles=require('../../src/config/storage-profiles');
async function seed(pool){
 const [[done]]=await pool.execute("SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten='demo_storage_profiles_v1'");if(Number(done.total))return;
 const c=await pool.getConnection();try{
  await c.beginTransaction();
  for(const s of profiles.suppliers)await c.execute('INSERT INTO suppliers(code,name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name)',[s.code,s.name]);
  const [suppliers]=await c.execute('SELECT id,code FROM suppliers WHERE is_active=1');
  const [materials]=await c.execute("SELECT i.id,i.reference_price,c.code AS category_code FROM items i JOIN categories c ON c.id=i.category_id WHERE i.kind='MATERIAL' AND c.code IN ('BOT','DUONG-MUOI','BO-SUA-TRUNG','MEN-NO','NHAN','TRANG-TRI','BAO-BI')");
  for(const i of materials){const offers=profiles.suppliers.filter(s=>s.categories.includes(i.category_code)).map(s=>({supplier_id:String(suppliers.find(r=>r.code===s.code).id),unit_price:String(i.reference_price)}));await c.execute('UPDATE NguyenVatLieu SET BangGiaNCC=? WHERE MaMatHang=?',[JSON.stringify(offers),i.id]);}
  const [categories]=await c.execute('SELECT id,code,LoaiDanhMuc FROM categories WHERE is_active=1');
  const manifest=require('../../src/config/item-image-manifest'),catalog=require('../../src/config/bakery-catalog');
  for(const cat of categories){const first=catalog.items.find(i=>i[2]===cat.code);if(first&&manifest[first[0]])await c.execute("UPDATE categories SET image_path=? WHERE id=? AND (image_path IS NULL OR image_path='')",['/images/items/'+manifest[first[0]],cat.id]);}
  const [warehouses]=await c.execute("SELECT id,code FROM warehouses WHERE code IN ('KHO-01','KHO-02')");
  for(const cat of categories){const zone=profiles.zones[cat.code];if(!zone)continue;const wh=warehouses.find(w=>w.code===(cat.LoaiDanhMuc==='MATERIAL'?'KHO-01':'KHO-02'));if(!wh)continue;
   for(let depth=1;depth<=3;depth++)await c.execute('INSERT INTO warehouse_locations(warehouse_id,code,name,is_active,zone_name,zone_category_id,depth) VALUES (?,?,?,1,?,?,?) ON DUPLICATE KEY UPDATE id=id',[wh.id,'Z-'+cat.code+'-'+depth,zone+' · '+(depth===1?'Phía ngoài':depth===2?'Ở giữa':'Phía trong'),zone,cat.id,depth]);
  }
  // No specialization: each workshop supports the full production process.
  for(const [code,name]of [['XUONG-01','Xưởng ahtor'],['XUONG-02','Xưởng edxn'],['XUONG-03','Xưởng trnvnth']])await c.execute('UPDATE workshops SET name=? WHERE code=?',[name,code]);
  await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',['demo_storage_profiles_v1','0'.repeat(64)]);await c.commit();
 }catch(e){await c.rollback();throw e}finally{c.release()}
}
module.exports={seed};
