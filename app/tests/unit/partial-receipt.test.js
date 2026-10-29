const test=require('node:test'),assert=require('node:assert/strict');
const {create}=require('../../src/modules/stock-requests/partial-receipt');
const C=require('../../src/services/domain/core');
const valid={purpose:'PRODUCTION_RECEIPT',production_source_mode:'MANUAL',production_plan_id:'1',workshop_id:'1',warehouse_id:'1',manager_id:'1',requested_date:C.today(),receipt_key:'1234567890123456',lines:[{item_id:'1',quantity:'1.000',manufactured_date:C.today()}]};
const service={pool:{getConnection:()=>{throw Error('SQL must not be called');}}};
test('partial receipts reject invalid keys, IDs, amounts, dates and duplicate items before SQL',async()=>{
  const user={workshop_ids:['1']};
  for(const body of [{...valid,receipt_key:''},{...valid,production_plan_id:undefined},{...valid,lines:[{...valid.lines[0],quantity:'0.000'}]},{...valid,lines:[{...valid.lines[0],manufactured_date:'9999-01-01'}]},{...valid,lines:[...valid.lines,...valid.lines]}])await assert.rejects(()=>create(service,user,body,'test'),e=>e.code==='VALIDATION_ERROR');
  await assert.rejects(()=>create(service,user,{...valid,workshop_id:'2'},'test'),e=>e.code==='FORBIDDEN');
});
