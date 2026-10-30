const data=require('../../src/config/bakery-catalog');
const {hashPassword}=require('../../src/services/domain/core');
async function seed(pool){
 await require('./foundation').seedRoles(pool);
 const [[done]]=await pool.execute("SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten='demo_monolith_v1'");
 if(Number(done.total)){await require('./item-images').seed(pool);await require('./storage-profiles').seed(pool);return;}
 await require('./foundation').seedDemo(pool);
 const c=await pool.getConnection();
 try{
  await c.beginTransaction();
  await c.execute('UPDATE items SET is_active=0,is_published=0');await c.execute('UPDATE categories SET is_active=0');
  const units=new Map(),categories=new Map();
  for(const [code,name]of data.units){await c.execute('INSERT INTO units(code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',[code,name]);const [[r]]=await c.execute('SELECT id FROM units WHERE code=?',[code]);units.set(code,r.id)}
  for(const [code,name,kind]of data.categories){await c.execute('INSERT INTO categories(code,name,is_active,LoaiDanhMuc) VALUES (?,?,1,?) ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=1,LoaiDanhMuc=VALUES(LoaiDanhMuc)',[code,name,kind]);const [[r]]=await c.execute('SELECT id FROM categories WHERE code=?',[code]);categories.set(code,{id:r.id,kind})}
  const [suppliers]=await c.execute('SELECT id FROM suppliers WHERE is_active=1 ORDER BY id');
  for(const [code,name,category,unit,price]of data.items){
   const kind=categories.get(category).kind,finished=kind==='FINISHED_PRODUCT';const prices=finished?[]:suppliers.map((s,i)=>({supplier_id:String(s.id),unit_price:(Number(price)*(i?1.05:1)).toFixed(4)}));
   await c.execute('INSERT INTO items(code,name,category_id,unit_id,kind,reference_price,is_sample,is_published,is_active,version) VALUES (?,?,?,?,?,?,?,?,1,1) ON DUPLICATE KEY UPDATE name=VALUES(name),category_id=VALUES(category_id),unit_id=VALUES(unit_id),reference_price=VALUES(reference_price),is_sample=VALUES(is_sample),is_published=VALUES(is_published),is_active=1',[code,name,categories.get(category).id,units.get(unit),kind,price,Number(finished),Number(finished)]);
   if(!finished)await c.execute('UPDATE NguyenVatLieu n JOIN items i ON i.id=n.MaMatHang SET n.BangGiaNCC=? WHERE i.code=?',[JSON.stringify(prices),code]);
  }
  for(const [code,name]of [['XUONG-01','Xưởng ahtor'],['XUONG-02','Xưởng edxn'],['XUONG-03','Xưởng trnvnth']])await c.execute('INSERT INTO workshops(code,name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name)',[code,name]);
  for(const [username,role,name,workshop]of [['qc2','QC_INSPECTOR','QC/AC Nguyễn Minh Anh'],['qc3','QC_INSPECTOR','QC/AC Trần Hoàng'],['stocktaker2','STOCKTAKER','Kiểm kê Lê Minh'],['stocktaker3','STOCKTAKER','Kiểm kê Phạm An'],['staff2','WAREHOUSE_STAFF','Nhân viên kho thứ hai'],['workshop2','WORKSHOP_OWNER','Chủ xưởng edxn','XUONG-02'],['workshop3','WORKSHOP_OWNER','Chủ xưởng trnvnth','XUONG-03']]){
   const [[exists]]=await c.execute('SELECT id FROM users WHERE username=?',[username]);if(exists)continue;
   const [u]=await c.execute("INSERT INTO users(username,password_hash,full_name,status,failed_login_count,session_version,version) VALUES (?,?,?,'ACTIVE',0,1,1)",[username,hashPassword(process.env.DEMO_PASSWORD||'123456'),name]);
   await c.execute('INSERT INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE code=?',[u.insertId,role]);if(workshop)await c.execute('INSERT INTO workshop_users(workshop_id,user_id) SELECT id,? FROM workshops WHERE code=?',[u.insertId,workshop]);
  }
  await c.execute("UPDATE users SET full_name='Chủ xưởng ahtor' WHERE username='workshop' AND full_name='Chủ xưởng'");
  await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',['demo_monolith_v1','0'.repeat(64)]);await c.commit();
 }catch(e){await c.rollback();throw e}finally{c.release()}
 await require('./item-images').seed(pool);
 await require('./storage-profiles').seed(pool);
}
module.exports={seed};
