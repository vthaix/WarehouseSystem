const assert=require('node:assert/strict'),crypto=require('node:crypto');
if(!/^KhoHang_Acceptance_\d{8}_Gateway$/.test(process.env.DB_NAME||''))throw Error('Use an isolated acceptance database.');
function client(){let cookie='',csrf='';return {
 async call(route,method='GET',body){const r=await fetch('http://127.0.0.1:3000/api/v1/'+route,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...(await r.json())};},
 async login(username){csrf=(await this.call('auth/csrf')).data.csrf_token;const r=await this.call('auth/login','POST',{username,password:process.env.DEMO_PASSWORD});assert.equal(r.status,200,JSON.stringify(r));csrf=r.data.csrf_token;},
 async image(url){return fetch('http://127.0.0.1:3000'+url,{headers:{Cookie:cookie}});}
};}
(async()=>{const manager=client(),customer=client();await manager.login('manager');await customer.login('customer');
 const data_url='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1sAAAAASUVORK5CYII=';
 assert.equal((await customer.call('category-images','POST',{data_url})).status,403);
 assert.equal((await manager.call('category-images','POST',{data_url:'data:image/png;base64,PHNjcmlwdD4='})).status,422);
 const upload=await manager.call('category-images','POST',{data_url});assert.equal(upload.status,201,JSON.stringify(upload));
 const image=await manager.image(upload.data.image_path);assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);
 const code='IMG-'+crypto.randomBytes(6).toString('hex');
 const created=await manager.call('categories','POST',{code,name:code,description:'Image acceptance',image_path:upload.data.image_path,is_active:true});assert.equal(created.status,201,JSON.stringify(created));const id=created.data.id;
 try {
  assert.equal((await manager.call('categories/'+id)).data.image_path,upload.data.image_path);
  assert.equal((await manager.call('categories/'+id,'PATCH',{image_path:'/images/categories/../../secret'})).status,422);
  const edit=await manager.call('categories/'+id,'PATCH',{name:code+' EDIT'});assert.equal(edit.status,200);assert.equal(edit.data.image_path,upload.data.image_path);
  const clear=await manager.call('categories/'+id,'PATCH',{image_path:null});assert.equal(clear.status,200);assert.equal(clear.data.image_path,null);
 }finally{assert.equal((await manager.call('categories/'+id,'DELETE',{})).status,200);}
 console.log('CATEGORY IMAGE SQL PASS: RBAC, bytes/type validation, upload/read, image attribute persistence, partial edits, invalid path rejection and clear');
})().catch(e=>{console.error(e);process.exitCode=1;});
