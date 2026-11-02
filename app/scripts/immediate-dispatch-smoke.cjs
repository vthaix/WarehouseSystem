const assert=require('node:assert/strict'),client=require('../tests/support/live-client.cjs');
const base=process.env.APP_URL||'http://127.0.0.1:3310';
const ok=(r,status=200)=>{assert.equal(r.status,status,JSON.stringify(r));return r.data;};
(async()=>{
 assert.equal((await(await fetch(base+'/health')).json()).test_instance,true,'An isolated test instance is required');
 const actors={};for(const name of ['customer','planner','director','workshop','manager','staff','staff2']){actors[name]=client(base);await actors[name].login(name);}
 const {customer,planner,director,workshop,manager,staff,staff2}=actors;
 const users=ok(await manager.call('lookup/users')),who=name=>users.find(u=>u.username===name).id;
 const me=ok(await workshop.call('auth/me')),wid=String(me.workshop_ids[0]);
 let map=ok(await manager.call('warehouse-lookup'));
 const warehouse=map.warehouses.find(w=>String(w.workshop_id)===wid&&w.warehouse_type==='MATERIAL');assert.ok(warehouse);
 map=ok(await manager.call('warehouse-lookup?warehouse_id='+warehouse.id));
 const stored=map.locations.flatMap(l=>l.stock.map(s=>({...s,location_id:l.id}))).find(s=>s.kind==='MATERIAL'&&s.quality_bucket==='AVAILABLE'&&!s.expired&&Number(s.available_quantity)>=2);assert.ok(stored,'Need 2 units of available demo material');
 const item=ok(await customer.call('sample-items'))[0],today=new Date(Date.now()+7*3600000).toISOString().slice(0,10),future=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 let order=ok(await customer.call('customer-orders','POST',{delivery_address:'Immediate dispatch regression',latest_delivery_date:future,lines:[{item_id:item.id,quantity:'1'}]}),201);
 await planner.call('customer-orders/'+order.id+'/receive','POST',{version:order.version});
 let plan=ok(await planner.call('production-plans','POST',{customer_order_id:order.id,workshop_id:wid,start_date:today,end_date:future,material_source:'MANUAL',outputs:[{item_id:item.id,quantity:'1'}],materials:[{item_id:stored.item_id,required_quantity:'2'}]}),201);
 ok(await director.call('production-plans/'+plan.id+'/review','POST',{version:plan.version,decision:'APPROVE'}));
 let req=ok(await workshop.call('stock-requests','POST',{purpose:'PRODUCTION_ISSUE',production_source_mode:'PLAN',production_plan_id:plan.id,workshop_id:wid,warehouse_id:warehouse.id,manager_id:who('manager'),requested_date:today,lines:[{item_id:stored.item_id,quantity:'2'}]}),201);
 const p=ok(await manager.call('stock-requests/'+req.id+'/allocations'));
 const allocation={assignee_id:who('staff'),stock_request_line_id:p.lines[0].id,lot_id:String(stored.lot_id),location_id:String(stored.location_id),quality_bucket:'AVAILABLE',quantity:'2'};
 async function save(line){req=ok(await manager.call('stock-requests/'+req.id));return manager.call('stock-requests/'+req.id+'/dispatch','POST',{version:req.version,allocation_mode:'REPLACE_PENDING',allocations:[line]});}
 let result=ok(await save(allocation));const first=result.tasks[0].id;
 let task=ok(await staff.call('tasks/'+first));assert.equal(task.status,'IN_PROGRESS');assert.ok(Math.abs(Date.parse(task.start_at)-Date.now())<60000);
 result=ok(await save(allocation));assert.equal(result.tasks[0].id,first);assert.equal(ok(await manager.call('stock-requests/'+req.id+'/allocations')).allocations.length,1);
 result=ok(await save({...allocation,quantity:'1'}));assert.notEqual(result.tasks[0].id,first);assert.equal(ok(await manager.call('tasks/'+first)).status,'CANCELLED');
 const retained=result.tasks[0].id;
 const failed=await save({...allocation,quantity:'99'});assert.equal(failed.status,422);const current=ok(await manager.call('stock-requests/'+req.id+'/allocations'));assert.equal(current.allocations.length,1);assert.equal(String(current.allocations[0].task_id),retained);assert.equal(Number(current.allocations[0].quantity),1);
 result=ok(await save({...allocation,assignee_id:who('staff2')}));const second=result.tasks[0].id;assert.notEqual(second,retained);
 req=ok(await workshop.call('stock-requests/'+req.id));
 const document=ok(await staff2.call('tasks/'+second+'/postTask','POST',{stock_request_id:req.id,request_version:req.version,task_id:second,allocations:[{stock_request_line_id:allocation.stock_request_line_id,lot_id:allocation.lot_id,location_id:allocation.location_id,quality_bucket:'AVAILABLE',quantity:'1'}]}),201);
 result=ok(await save({...allocation,assignee_id:who('staff2'),quantity:'1'}));assert.equal(result.tasks[0].id,second,'Remaining allocation is confirmed without reissuing the posted unit');
 assert.equal(Number(ok(await manager.call('stock-documents/'+document.id)).lines[0].quantity),1);
 console.log('PASS: live isolated MySQL: immediate dispatch without dates; repeat confirm creates no duplicates; edits replace pending allocations; invalid edits roll back; employee reassignment; partial posted history preserved. Fixture request '+req.id);
})().catch(e=>{console.error(e);process.exitCode=1;});
