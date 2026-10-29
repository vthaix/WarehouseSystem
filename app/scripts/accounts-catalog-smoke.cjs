const assert=require('node:assert/strict'),crypto=require('node:crypto');
if (!(process.env.ACCEPTANCE_MONOLITH === "true" && process.env.DB_NAME === "warehouse_db"))throw Error('Isolated acceptance DB only.');
require('../src/config/env').loadEnv();const {getPool,closePool}=require('../src/config/database');
function client(){let cookie='',csrf='';return {async call(path,method='GET',body){const r=await fetch('http://127.0.0.1:3000/api/v1/'+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID()},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()};},async login(username,password=process.env.DEMO_PASSWORD){csrf=(await this.call('auth/csrf')).data.csrf_token;const r=await this.call('auth/login','POST',{username,password});assert.equal(r.status,200,JSON.stringify(r));csrf=r.data.csrf_token;return r.data;}};}
const ok=(r,s=200)=>{assert.equal(r.status,s,JSON.stringify(r));return r.data;};
(async()=>{const pool=getPool(),admin=client(),manager=client(),purchaser=client(),customer=client(),temp=client();try{
  await admin.login('admin','123456');await manager.login('manager');await purchaser.login('purchaser');await customer.login('customer');
  for(const c of [manager,purchaser,customer])assert.equal((await c.call('accounts')).status,403);
  const meta=ok(await admin.call('account-options'));assert.ok(meta.roles.some(r=>r.id==='ADMIN'));assert.equal(meta.workshops.length,3);
  const username='account-'+crypto.randomBytes(5).toString('hex'),base={username,full_name:'Tài khoản thử nghiệm',email:'',password:'123456',roles:['CUSTOMER'],workshop_ids:[],status:'ACTIVE'};
  assert.equal((await admin.call('accounts','POST',{...base,roles:['UNKNOWN']})).status,422);
  let account=ok(await admin.call('accounts','POST',base),201);assert.ok(!JSON.stringify(account).includes('password'));assert.equal((await admin.call('accounts','POST',base)).status,409);
  const logged=await temp.login(username,'123456');assert.deepEqual(logged.roles,['CUSTOMER']);
  const [[profile]]=await pool.execute('SELECT user_id FROM customers WHERE user_id=?',[account.id]);assert.equal(String(profile.user_id),account.id);
  const change={version:account.version,full_name:base.full_name,email:'',password:'newpass123',roles:['QC_INSPECTOR'],workshop_ids:[],status:'ACTIVE'};
  account=ok(await admin.call('accounts/'+account.id,'PATCH',change));assert.equal((await temp.call('notifications')).status,401);assert.equal((await admin.call('accounts/'+account.id,'PATCH',change)).status,409);
  await temp.login(username,'newpass123');assert.equal((await temp.call('accounts')).status,403);
  ok(await admin.call('accounts/'+account.id,'DELETE',{version:account.version}));assert.equal((await temp.call('notifications')).status,401);assert.equal((await admin.call('accounts/'+account.id)).status,404);
  const adminRow=ok(await admin.call('accounts?per_page=100')).find(a=>a.username==='admin');
  assert.equal((await admin.call('accounts/'+adminRow.id,'DELETE',{version:adminRow.version})).status,403);
  assert.equal((await admin.call('accounts/'+adminRow.id,'PATCH',{version:adminRow.version,full_name:adminRow.full_name,email:'',roles:['CUSTOMER'],workshop_ids:[],status:'ACTIVE'})).status,403);
  const [audits]=await pool.execute("SELECT after_data FROM audit_logs WHERE resource_type='accounts' AND resource_id=?",[account.id]);assert.ok(audits.length>=2);for(const a of audits){const text=JSON.stringify(a.after_data);assert.ok(!text.includes('newpass123')&&!text.includes('123456')&&!text.includes('password_hash'));}
  const materials=ok(await manager.call('material-prices?per_page=100'));assert.ok(materials.some(m=>m.unit==='lít'));assert.ok(materials.some(m=>m.unit==='g'));assert.ok(materials.some(m=>m.unit==='quả'));
  const material=materials.find(m=>m.code==='NVL-001'),priceMeta=ok(await manager.call('material-price-options'));
  assert.ok(material.supplier_prices.length);assert.equal((await customer.call('material-prices')).status,403);
  let saved=ok(await manager.call('material-prices/'+material.id,'PATCH',{version:material.version,unit_id:material.unit_id,reference_price:'18000.0000',supplier_prices:[{supplier_id:priceMeta.suppliers[0].id,unit_price:'18500.2500'}]}));assert.equal(saved.supplier_prices[0].unit_price,'18500.2500');
  assert.equal((await purchaser.call('material-prices/'+material.id,'PATCH',{version:saved.version})).status,403);
  assert.ok(ok(await customer.call('sample-items')).every(i=>!Object.hasOwn(i,'BangGiaNCC')&&!Object.hasOwn(i,'supplier_prices')));
  const categories=ok(await manager.call('categories?kind=MATERIAL&per_page=100'));assert.ok(categories.length>=7);assert.ok(categories.every(c=>c.catalog_kind==='MATERIAL'));
  const flour=categories.find(c=>c.code==='BOT');const items=ok(await manager.call('items?category_id='+flour.id+'&per_page=100'));assert.equal(items.length,3);assert.ok(items.every(i=>i.category_id===flour.id&&i.unit==='kg'));
  console.log('ACCOUNTS/CATALOG SQL PASS: admin-only CRUD, roles, customer profile, session revocation, stale versions, self-protection, safe audit, supplier prices and grouped catalogue.');
}finally{await closePool();}})().catch(e=>{console.error(e);process.exitCode=1;});
