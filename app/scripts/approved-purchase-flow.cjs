const assert=require('node:assert/strict'),crypto=require('node:crypto');
module.exports=async({pool,client,reportId,materialId,supplierId,date,planner,customer})=>{
 const purchaser=client(),director=client(),manager=client();
 await purchaser.login('purchaser');await director.login('director');await manager.login('manager');
 const plans=[],orders=[],lots=[];let header;
 const ok=(r,s=200)=>{assert.equal(r.status,s,JSON.stringify(r));return r.data};
 const createPlan=async(report,quantity,confirmed=false)=>{const p=ok(await planner.call('/api/v1/business-plans','POST',{type:'PURCHASE',...(report?{production_report_id:report}:{}),planned_date:date,lines:[{item_id:materialId,quantity,unit_price:'3.4567'}],...(confirmed?{confirm_plan_overage:true}:{})}),201);plans.push(p.id);return p};
 const buying=p=>({source_mode:'PLAN',business_plan_id:p.id,expected_delivery_date:date,delivery_terms:'Theo yêu cầu đã được duyệt',lines:p.lines.map(l=>({business_plan_line_id:l.id,quantity:l.quantity,unit_price:'3.4567',supplier_id:supplierId}))});
 try{
  for(const mode of ['MANUAL','REPORT']){const r=await purchaser.call('/api/v1/purchase-orders','POST',{source_mode:mode,production_report_id:reportId,expected_delivery_date:date,delivery_terms:'Không được bỏ qua phê duyệt',lines:[{item_id:materialId,quantity:'1.000',unit_price:'1',supplier_id:supplierId}]});ok(r,409);assert.equal(r.error.code,'PURCHASE_APPROVAL_REQUIRED')}
  const plan=await createPlan(reportId,'2.123');
  ok(await purchaser.call('/api/v1/purchase-orders','POST',buying(plan)),409);
  ok(await director.call('/api/v1/business-plans/'+plan.id+'/review','POST',{version:plan.version,decision:'APPROVE'},crypto.randomUUID()));
  const preview=ok(await purchaser.call('/api/v1/source-imports/purchase-orders?source_id='+plan.id));assert.equal(preview.business_plan_id,plan.id);assert.equal(preview.lines[0].quantity,'2.123');
  ok(await customer.call('/api/v1/source-imports/purchase-orders?source_id='+plan.id),403);
  ok(await purchaser.call('/api/v1/purchase-orders','POST',{...buying(plan),lines:[{...buying(plan).lines[0],quantity:'2.124'}]}),422);
  ok(await purchaser.call('/api/v1/purchase-orders','POST',{...buying(plan),lines:[{...buying(plan).lines[0],supplier_id:'999999999'}]}),422);
  const race=await Promise.all([purchaser.call('/api/v1/purchase-orders','POST',buying(plan)),purchaser.call('/api/v1/purchase-orders','POST',buying(plan))]);assert.deepEqual(race.map(r=>r.status).sort(),[201,409]);const order=race.find(r=>r.status===201).data;orders.push(order.id);assert.equal(order.total_amount,'7.3386');
  const received=ok(await manager.call('/api/v1/lots','POST',{code:'APPROVED-'+crypto.randomBytes(6).toString('hex'),lines:[{purchase_order_line_id:order.lines[0].id,received_quantity:'0.500'}]}),201);header=received.lot_header_id;lots.push(...received.lines.map(l=>l.id));
  assert.equal(ok(await manager.call('/api/v1/source-imports/lots?source_id='+order.id)).lines[0].quantity,'1.623');
  const direct=await createPlan(null,'1.000');ok(await director.call('/api/v1/business-plans/'+direct.id+'/review','POST',{version:direct.version,decision:'APPROVE'},crypto.randomUUID()));orders.push(ok(await purchaser.call('/api/v1/purchase-orders','POST',buying(direct)),201).id);
  const over=await createPlan(reportId,'4.000',true);ok(await director.call('/api/v1/business-plans/'+over.id+'/review','POST',{version:over.version,decision:'APPROVE',confirm_plan_overage:true},crypto.randomUUID()));orders.push(ok(await purchaser.call('/api/v1/purchase-orders','POST',buying(over)),201).id);
  console.log('APPROVED PURCHASE PASS: manual/report bypass denied; pending denied; exact approved lines, concurrency, supplier validation, receipt remainder, approved direct plan and confirmed overage.');
 }finally{
  for(const id of lots)await pool.execute('DELETE FROM lots WHERE id=?',[id]);if(header)await pool.execute('DELETE FROM lot_headers WHERE id=?',[header]);
  for(const id of orders){await pool.execute('DELETE FROM purchase_order_lines WHERE purchase_order_id=?',[id]);await pool.execute('DELETE FROM purchase_orders WHERE id=?',[id])}
  for(const id of plans){await pool.execute('DELETE FROM business_plan_lines WHERE business_plan_id=?',[id]);await pool.execute('DELETE FROM business_plans WHERE id=?',[id])}
 }
};
