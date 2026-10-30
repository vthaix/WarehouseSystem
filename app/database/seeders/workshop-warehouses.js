const profiles=require('../../src/config/storage-profiles');
async function seed(pool){
 const [[done]]=await pool.execute("SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten='demo_workshop_warehouses_v1'");if(Number(done.total))return;
 const c=await pool.getConnection();try{await c.beginTransaction();
 const [workshops]=await c.execute('SELECT id,code,name FROM workshops WHERE is_active=1 ORDER BY code');
 const [categories]=await c.execute('SELECT id,code,LoaiDanhMuc FROM categories WHERE is_active=1');
 for(const [index,w]of workshops.entries())for(const [type,title,suffix]of [['MATERIAL','Kho nguyên vật liệu','NVL'],['FINISHED_PRODUCT','Kho thành phẩm','TP'],['RETURN','Kho hàng trả về','TRA']]){
  const code=index===0?(type==='MATERIAL'?'KHO-01':type==='FINISHED_PRODUCT'?'KHO-02':'KHO-03'):w.code+'-'+suffix;
  await c.execute('INSERT INTO warehouses(code,name,is_active,workshop_id,LoaiKho) VALUES (?,?,1,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),workshop_id=VALUES(workshop_id),LoaiKho=VALUES(LoaiKho)',[code,title,w.id,type]);
  const [[wh]]=await c.execute('SELECT id FROM warehouses WHERE code=?',[code]);
  const groups=type==='RETURN'?[{id:null,code:'CACH-LY',name:'Chờ kiểm tra'},{id:null,code:'XU-LY',name:'Chờ xử lý'},{id:null,code:'HOAN-TRA',name:'Chờ trả nhà cung cấp'}]:categories.filter(cat=>cat.LoaiDanhMuc===type).map(cat=>({...cat,name:profiles.zones[cat.code]})).filter(cat=>cat.name);
  for(const [groupIndex,cat]of groups.entries()){
   const letter=String.fromCharCode(65+groupIndex),zone='Khu '+letter+' · '+cat.name.replace(/^Khu /,'');
   for(let depth=1;depth<=10;depth++){
    const slot=letter+String(depth).padStart(2,'0');
    // Preserve existing lot/location references when replacing the old long codes.
    await c.execute('UPDATE warehouse_locations SET code=?,name=?,zone_name=?,depth=? WHERE warehouse_id=? AND code=?',[slot,slot+' · '+zone,zone,depth,wh.id,'Z-'+cat.code+'-'+depth]);
    await c.execute('INSERT INTO warehouse_locations(warehouse_id,code,name,is_active,zone_name,zone_category_id,depth) VALUES (?,?,?,1,?,?,?) ON DUPLICATE KEY UPDATE id=id',[wh.id,slot,slot+' · '+zone,zone,cat.id,depth]);
   }
  }
 }
 await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',['demo_workshop_warehouses_v1','0'.repeat(64)]);await c.commit();
 }catch(e){await c.rollback();throw e}finally{c.release()}
}
module.exports={seed};
