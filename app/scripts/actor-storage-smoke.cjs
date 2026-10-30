const assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.env.APP_URL||'http://127.0.0.1:3310';
function client(){let cookie='',csrf='';return{async call(route,method='GET',body){const r=await fetch(base+'/api/v1/'+route,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID()},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return{status:r.status,...await r.json()};},async login(username){csrf=(await this.call('auth/csrf')).data.csrf_token;const r=await this.call('auth/login','POST',{username,password:'123456'});assert.equal(r.status,200);csrf=r.data.csrf_token;}};}
const ok=(r,status=200)=>{assert.equal(r.status,status,JSON.stringify(r));return r.data;};
(async()=>{
 assert.equal((await(await fetch(base+'/health')).json()).test_instance,true);
 const manager=client(),planner=client(),director=client(),purchaser=client(),customer=client();await Promise.all([[manager,'manager'],[planner,'planner'],[director,'director'],[purchaser,'purchaser'],[customer,'customer']].map(([c,u])=>c.login(u)));
 for(const resource of ['warehouse-inbound','warehouse-outbound'])assert.equal((await customer.call(resource)).status,403);
 const material=ok(await purchaser.call('material-prices?per_page=100')).find(m=>m.code==='NVL-001');
 const meta=ok(await purchaser.call('material-price-options'));
 const allowed=new Set(material.supplier_prices.map(o=>o.supplier_id)),valid=meta.suppliers.find(s=>allowed.has(s.id)),invalid=meta.suppliers.find(s=>!allowed.has(s.id));assert.ok(valid&&invalid);
 const date=new Date(Date.now()+86400000).toISOString().slice(0,10);
 let plan=ok(await planner.call('business-plans','POST',{type:'PURCHASE',planned_date:date,lines:[{item_id:material.id,quantity:'1.000',unit_price:'1000'}]}),201);
 plan=ok(await director.call('business-plans/'+plan.id+'/review','POST',{version:plan.version,decision:'APPROVE'}));
 plan=ok(await purchaser.call('business-plans/'+plan.id));
 const buying=s=>({source_mode:'PLAN',business_plan_id:plan.id,expected_delivery_date:date,delivery_terms:'Theo kế hoạch kiểm thử cung ứng',lines:plan.lines.map(l=>({business_plan_line_id:l.id,quantity:l.quantity,unit_price:'1000',supplier_id:s.id}))});
 const bad=await purchaser.call('purchase-orders','POST',buying(invalid));assert.equal(bad.status,422);assert.equal(bad.error.code,'SUPPLIER_ITEM_MISMATCH');
 const order=ok(await purchaser.call('purchase-orders','POST',buying(valid)),201);assert.ok(order.id);
 const inbound=ok(await manager.call('warehouse-inbound?status=PENDING&per_page=100'));assert.ok(inbound.every(r=>r.type==='IN'));
 const outbound=ok(await manager.call('warehouse-outbound?per_page=100'));assert.ok(outbound.every(r=>r.type==='OUT'));
 if(inbound.length)assert.equal((await manager.call('warehouse-outbound/'+inbound[0].id)).status,404);
 let checked=false;
 for(const candidate of inbound){
  if(candidate.purpose!=='PURCHASE_RECEIPT')continue;
  const request=ok(await manager.call('warehouse-inbound/'+candidate.id));const preview=ok(await manager.call('stock-requests/'+request.id+'/allocations'));
  const line=preview.lines.find(l=>l.lots.length);if(!line)continue;
  const item=ok(await manager.call('items/'+line.item_id));const categories=ok(await manager.call('categories?per_page=100'));const wrong=categories.find(c=>c.id!==item.category_id);assert.ok(wrong);
  const code='WRONG-ZONE-'+crypto.randomBytes(4).toString('hex');const location=ok(await manager.call('warehouse-locations','POST',{warehouse_id:request.warehouse_id,code,name:code,is_active:true,zone_name:'Khu thử chặn sai nhóm',zone_category_id:wrong.id,depth:1}),201);
  try{
   const staff=ok(await manager.call('lookup/users')).find(u=>u.roles.includes('WAREHOUSE_STAFF'));
   const rejected=await manager.call('stock-requests/'+request.id+'/dispatch','POST',{version:request.version,start_at:new Date(Date.now()+3600000).toISOString(),end_at:new Date(Date.now()+7200000).toISOString(),allocations:[{stock_request_line_id:line.id,assignee_id:staff.id,lot_id:line.lots[0].id,location_id:location.id,quantity:'0.001',quality_bucket:'AVAILABLE'}]});
   assert.equal(rejected.status,422,JSON.stringify(rejected));assert.equal(rejected.error.code,'ZONE_ITEM_MISMATCH');
   assert.equal(ok(await manager.call('warehouse-inbound/'+request.id)).version,request.version);checked=true;
  }finally{ok(await manager.call('warehouse-locations/'+location.id,'DELETE',{}));}break;
 }
 assert.ok(checked,'Need a pending QC-passed purchase receipt fixture for zone test');
 console.log('ACTOR/STORAGE API PASS: actor guards, direction isolation, allowed supplier succeeds, unrelated supplier rejected, wrong receiving area rejected with rollback.');
})().catch(e=>{console.error(e);process.exitCode=1;});
