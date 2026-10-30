const assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3310';
function client(){let cookie='',csrf='';return {
 async call(route,method='GET',body){const r=await fetch(base+'/api/v1/'+route,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()};},
 async login(username){csrf=(await this.call('auth/csrf')).data.csrf_token;const r=await this.call('auth/login','POST',{username,password:'123456'});assert.equal(r.status,200);csrf=r.data.csrf_token;}
};}
(async()=>{
 assert.equal((await(await fetch(base+'/health')).json()).test_instance,true,'Use isolated test server only');
 const manager=client(),customer=client(),director=client(),purchaser=client(),anonymous=client();
 await Promise.all([manager.login('manager'),customer.login('customer'),director.login('director'),purchaser.login('purchaser')]);
 assert.equal((await anonymous.call('workspace/updates')).status,401);
 const row=(await manager.call('items?per_page=100')).data.find(r=>r.code==='TP-001');assert.ok(row.image_path);
 const code='PHOTO-'+crypto.randomBytes(5).toString('hex');
 const added=await manager.call('items','POST',{code,name:code,kind:'FINISHED_PRODUCT',category_id:row.category_id,unit_id:row.unit_id,reference_price:'15000',is_sample:false,is_published:false,image_path:row.image_path});
 assert.equal(added.status,201,JSON.stringify(added));let item=added.data;
 try{
  assert.equal(item.image_path,row.image_path);
  assert.equal((await customer.call('items/'+item.id,'PATCH',{version:item.version,image_path:null})).status,403);
  assert.equal((await manager.call('items/'+item.id,'PATCH',{version:item.version,image_path:'/images/items/../../secret'})).status,422);
  assert.equal((await manager.call('items/'+item.id,'PATCH',{version:item.version,image_path:'/images/items/not-there.jpg'})).status,422);
  const edit=await manager.call('items/'+item.id,'PATCH',{version:item.version,image_path:'/images/items/tem-nhan-sweet-taste.png'});assert.equal(edit.status,200,JSON.stringify(edit));item=edit.data;assert.equal(item.unit_id,row.unit_id);
  assert.equal((await manager.call('items/'+item.id,'PATCH',{version:item.version-1,image_path:null})).status,409);
  const clear=await manager.call('items/'+item.id,'PATCH',{version:item.version,image_path:null});assert.equal(clear.status,200);item=clear.data;assert.equal(item.image_path,null);
 }finally{assert.equal((await manager.call('items/'+item.id,'DELETE',{version:item.version})).status,200);}
 const otherBefore=(await purchaser.call('workspace/updates')).data;
 const own=(await director.call('workspace/updates')).data.find(r=>r.resource_type&&/^\d+$/.test(r.resource_id));assert.ok(own,'Seed demo notifications first');
 const badges=(await director.call('function-badges')).data;
 assert.equal((await director.call('workspace/seen','POST',{resource_type:own.resource_type,resource_id:own.resource_id,user_id:'1'})).status,422);
 assert.equal((await director.call('workspace/seen','POST',{resource_type:own.resource_type,resource_id:own.resource_id})).status,200);
 assert.ok(!(await director.call('workspace/updates')).data.some(r=>r.resource_type===own.resource_type&&r.resource_id===own.resource_id));
 assert.deepEqual((await purchaser.call('workspace/updates')).data,otherBefore,'Viewing one account cannot clear another account notifications');
 assert.equal((await director.call('function-badges')).data['production-plans'],badges['production-plans'],'Read does not approve plans or remove pending work');
 const ready=(await purchaser.call('source-imports/purchase-report-options')).data;assert.ok(ready.length);
 const orders=(await purchaser.call('purchase-orders?per_page=100')).data;
 assert.ok(ready.every(p=>!orders.some(o=>String(o.business_plan_id)===String(p.id))));
 console.log('WORKSPACE API PASS: item image create/edit/clear, RBAC, path safety, stale versions, account-scoped seen markers, pending queues preserved, unpurchased approved plans.');
})().catch(e=>{console.error(e);process.exitCode=1;});
