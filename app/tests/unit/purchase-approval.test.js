const test=require('node:test'),assert=require('node:assert/strict');
const Purchase=require('../../src/modules/purchasing/PurchaseOrderService');
test('purchaser cannot omit approved plan or select manual/report purchase mode before accessing database',async()=>{
 const service=new Purchase({getConnection(){throw Error('Database must not be reached')}}),user={id:'1',roles:['PURCHASER']};
 for(const source_mode of ['MANUAL','REPORT'])await assert.rejects(service.create(user,{source_mode,delivery_terms:'Test',lines:[]},'test'),e=>e.code==='PURCHASE_APPROVAL_REQUIRED'&&e.status===409);
 await assert.rejects(service.create(user,{source_mode:'PLAN',delivery_terms:'Test',lines:[]},'test'),e=>e.code==='VALIDATION_ERROR');
});
test('customer and planner cannot execute purchase UC even with a plan identifier',async()=>{
 const service=new Purchase({getConnection(){throw Error('Database must not be reached')}});
 for(const role of ['CUSTOMER','PLANNER','WAREHOUSE_MANAGER'])await assert.rejects(service.create({id:'1',roles:[role]},{source_mode:'PLAN',business_plan_id:'1'},'test'),e=>e.status===403);
});
