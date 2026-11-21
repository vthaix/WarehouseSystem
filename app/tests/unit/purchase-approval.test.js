const test=require('node:test'),assert=require('node:assert/strict');
const Purchase=require('../../src/modules/purchasing/PurchaseOrderService');
// UC-27: hai hình thức PLAN (theo kế hoạch mua đã duyệt) và MANUAL (lập trực tiếp, luồng 3.1); hình thức khác bị từ chối.
test('purchaser chooses PLAN or MANUAL; invalid modes and missing plan are rejected before accessing database',async()=>{
 const service=new Purchase({getConnection(){throw Error('Database must not be reached')}}),user={id:'1',roles:['PURCHASER']};
 await assert.rejects(service.create(user,{source_mode:'REPORT',delivery_terms:'Test',lines:[]},'test'),e=>e.code==='VALIDATION_ERROR');
 await assert.rejects(service.create(user,{source_mode:'MANUAL',business_plan_id:'1',delivery_terms:'Test',lines:[]},'test'),e=>e.code==='VALIDATION_ERROR');
 await assert.rejects(service.create(user,{source_mode:'PLAN',delivery_terms:'Test',lines:[]},'test'),e=>e.code==='VALIDATION_ERROR');
});
test('customer and planner cannot execute purchase UC even with a plan identifier',async()=>{
 const service=new Purchase({getConnection(){throw Error('Database must not be reached')}});
 for(const role of ['CUSTOMER','PLANNER','WAREHOUSE_MANAGER'])await assert.rejects(service.create({id:'1',roles:[role]},{source_mode:'PLAN',business_plan_id:'1'},'test'),e=>e.status===403);
});
