const assert=require('node:assert/strict'),crypto=require('node:crypto');
require('../src/config/env').loadEnv();
if(process.env.ACCEPTANCE_MONOLITH!=='true'||process.env.DB_NAME!=='warehouse_db')throw Error('Dedicated mono test instance only');
const {getPool,closePool}=require('../src/config/database');
(async()=>{
 const pool=getPool();
 const [foreign]=await pool.query('SELECT REFERENCED_TABLE_SCHEMA AS db FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_SCHEMA IS NOT NULL');assert.ok(foreign.length);assert.ok(foreign.every(r=>r.db==='warehouse_db'));
 const [[invalid]]=await pool.query("SELECT COUNT(*) AS total FROM MatHang m LEFT JOIN NguyenVatLieu n ON n.MaMatHang=m.MaBanGhi LEFT JOIN ThanhPham f ON f.MaMatHang=m.MaBanGhi WHERE (m.Loai='MATERIAL' AND (n.MaMatHang IS NULL OR f.MaMatHang IS NOT NULL)) OR (m.Loai='FINISHED_PRODUCT' AND (f.MaMatHang IS NULL OR n.MaMatHang IS NOT NULL))");assert.equal(Number(invalid.total),0);
 const [[item]]=await pool.query("SELECT id FROM items WHERE kind='FINISHED_PRODUCT' LIMIT 1");await assert.rejects(pool.execute('INSERT INTO NguyenVatLieu(MaMatHang) VALUES (?)',[item.id]),e=>e.code==='ER_SIGNAL_EXCEPTION');
 const base='http://127.0.0.1:3000/api/v1/';let cookie='',csrf='';
 async function call(route,method='GET',body){const r=await fetch(base+route,{method,headers:{Cookie:cookie,'X-CSRF-Token':csrf,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()}}
 csrf=(await call('auth/csrf')).data.csrf_token;const login=await call('auth/login','POST',{username:'manager',password:process.env.DEMO_PASSWORD});assert.equal(login.status,200);csrf=login.data.csrf_token;
 const [[source]]=await pool.query("SELECT category_id,unit_id FROM items WHERE kind='MATERIAL' AND is_active=1 LIMIT 1");
 const created=await call('items','POST',{code:'MONO-'+crypto.randomBytes(6).toString('hex'),name:'Nguyên vật liệu kiểm thử kế thừa',kind:'MATERIAL',category_id:String(source.category_id),unit_id:String(source.unit_id),reference_price:'1.0000',material_quality_standard:'Bao bì nguyên vẹn'});assert.equal(created.status,201,JSON.stringify(created));
 try{
  assert.equal(created.data.material_quality_standard,'Bao bì nguyên vẹn');
  const bad=await call('items/'+created.data.id,'PATCH',{version:created.data.version,default_shelf_life_days:10});assert.equal(bad.status,422);
  const good=await call('items/'+created.data.id,'PATCH',{version:created.data.version,material_quality_standard:'Khô, không ẩm mốc'});assert.equal(good.status,200,JSON.stringify(good));assert.equal(good.data.material_quality_standard,'Khô, không ẩm mốc');
  assert.equal((await call('items/'+good.data.id,'DELETE',{version:good.data.version})).status,200);
  const [[child]]=await pool.query('SELECT COUNT(*) AS total FROM NguyenVatLieu WHERE MaMatHang=?',[created.data.id]);assert.equal(Number(child.total),0);
 }finally{await pool.execute('DELETE FROM items WHERE id=?',[created.data.id])}
 console.log('MONOLITH SCHEMA PASS: local foreign keys, one matching subtype, wrong subtype rejected, subtype create/update/rollback and cascade delete.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(closePool);
