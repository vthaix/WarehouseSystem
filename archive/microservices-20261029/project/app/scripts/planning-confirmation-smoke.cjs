const assert=require('node:assert/strict'),crypto=require('node:crypto');
if(!/^KhoHang_Acceptance_\d{8}_Gateway$/.test(process.env.DB_NAME||''))throw Error('Isolated acceptance DB only.');
require('../src/config/env').loadEnv();
const {getPool,closePool}=require('../src/config/database');
function client(){let cookie='',csrf='';return {async call(path,method='GET',body){const r=await fetch('http://127.0.0.1:3000/api/v1/'+path,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':crypto.randomUUID()},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()};},async login(username){csrf=(await this.call('auth/csrf')).data.csrf_token;const r=await this.call('auth/login','POST',{username,password:process.env.DEMO_PASSWORD});assert.equal(r.status,200,JSON.stringify(r));csrf=r.data.csrf_token;}};}
const ok=(r,status=200)=>{assert.equal(r.status,status,JSON.stringify(r));return r.data;};
(async()=>{try{
  const pool=getPool(),customer=client(),planner=client(),director=client();
  for(const [c,u]of [[customer,'customer'],[planner,'planner'],[director,'director']])await c.login(u);
  const item=ok(await customer.call('sample-items'))[0];
  const [[w]]=await pool.query("SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id WHERE u.username='workshop' LIMIT 1");
  const date=require('../src/services/domain/core').today();
  const order=ok(await customer.call('customer-orders','POST',{delivery_address:'Planning confirmation acceptance',latest_delivery_date:date,lines:[{item_id:item.id,quantity:'10'}]}),201);
  ok(await planner.call('customer-orders/'+order.id+'/receive','POST',{version:order.version}));
  const body={customer_order_id:order.id,workshop_id:String(w.workshop_id),start_date:date,end_date:date,outputs:[{item_id:item.id,quantity:'12'}],materials:[]};
  let r=await planner.call('production-plans','POST',body);assert.equal(r.status,409);assert.equal(r.error.code,'PLAN_CONFIRMATION_REQUIRED');
  const [[before]]=await pool.execute('SELECT COUNT(*) total FROM production_plans WHERE customer_order_id=?',[order.id]);assert.equal(Number(before.total),0);
  let plan=ok(await planner.call('production-plans','POST',{...body,confirm_plan_overage:true}),201);
  const update={version:plan.version,outputs:[{item_id:item.id,quantity:'15'}]};
  r=await planner.call('production-plans/'+plan.id,'PATCH',update);assert.equal(r.error.code,'PLAN_CONFIRMATION_REQUIRED');
  assert.equal(ok(await planner.call('production-plans/'+plan.id)).version,plan.version);
  plan=ok(await planner.call('production-plans/'+plan.id,'PATCH',{...update,confirm_plan_overage:true}));assert.equal(plan.outputs[0].quantity,'15.000');
  const review={version:plan.version,decision:'APPROVE'};
  r=await director.call('production-plans/'+plan.id+'/review','POST',review);assert.equal(r.error.code,'PLAN_CONFIRMATION_REQUIRED');
  plan=ok(await director.call('production-plans/'+plan.id+'/review','POST',{...review,confirm_plan_overage:true}));assert.equal(plan.status,'APPROVED');
  assert.equal(ok(await customer.call('customer-orders/'+order.id)).status,'APPROVED');
  console.log('PLANNING CONFIRMATION SQL PASS: create/update/review above order, no writes before confirmation, exact saved quantity and linked order approval.');
}finally{await closePool();}})().catch(e=>{console.error(e);process.exitCode=1;});
