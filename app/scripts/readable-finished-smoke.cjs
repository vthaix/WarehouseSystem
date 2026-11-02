const assert=require('node:assert/strict'),client=require('../tests/support/live-client.cjs'),base=process.env.APP_URL||'http://127.0.0.1:3310';
const ok=(r,n=200)=>{assert.equal(r.status,n,JSON.stringify(r));return r.data;};
(async()=>{
 assert.equal((await(await fetch(base+'/health')).json()).test_instance,true);
 const actors={};for(const name of ['customer','planner','director','workshop']){actors[name]=client(base);await actors[name].login(name);}const {customer,planner,director,workshop}=actors;
 const sample=ok(await customer.call('sample-items'))[0],me=ok(await workshop.call('auth/me')),today=new Date(Date.now()+7*3600000).toISOString().slice(0,10),future=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 const order=ok(await customer.call('customer-orders','POST',{delivery_address:'Readable references regression',latest_delivery_date:future,lines:[{item_id:sample.id,quantity:'1'}]}),201);ok(await planner.call('customer-orders/'+order.id+'/receive','POST',{version:order.version}));
 const plan=ok(await planner.call('production-plans','POST',{customer_order_id:order.id,workshop_id:String(me.workshop_ids[0]),start_date:today,end_date:future,material_source:'MANUAL',outputs:[{item_id:sample.id,quantity:'1'}],materials:[]}),201);ok(await director.call('production-plans/'+plan.id+'/review','POST',{version:plan.version,decision:'APPROVE'}));
 const report=ok(await workshop.call('finished-reports','POST',{report_mode:'PART',production_plan_id:plan.id,completed_date:today,production_completed:true,outputs:[{item_id:sample.id,quantity:'1',lot_code:'',manufactured_date:today,expiry_date:future}],materials:[]}),201);
 assert.match(report.outputs[0].lot_code,/^TP-AHTOR-[A-Z0-9-]+-\d{3,}$/);assert.match(report.outputs[0].lot_header_code,/^LO-TP-AHTOR-\d{3,}$/);assert.ok(!/[a-f0-9]{8}-[a-f0-9]{4}/i.test(report.outputs[0].lot_code));
 console.log('PASS: finished report saved without a caller-provided lot code; server generated '+report.outputs[0].lot_header_code+' / '+report.outputs[0].lot_code+'; correct shared production lot and item retained.');
})().catch(e=>{console.error(e);process.exitCode=1;});
