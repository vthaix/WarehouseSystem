const test=require('node:test'),assert=require('node:assert/strict');
const confirmation=require('../../src/shared/planning-confirmation');
test('planning excess requires explicit boolean confirmation',()=>{
  confirmation.validate({});confirmation.validate({confirm_plan_overage:true});
  for(const value of ['true',1,null])assert.throws(()=>confirmation.validate({confirm_plan_overage:value}),e=>e.code==='VALIDATION_ERROR');
  confirmation.check(false,false,'Vượt');
  assert.throws(()=>confirmation.check(true,false,'Vượt'),e=>e.status===409&&e.code==='PLAN_CONFIRMATION_REQUIRED');
  assert.throws(()=>confirmation.check(true,'true','Vượt'));
  confirmation.check(true,true,'Vượt');
});
