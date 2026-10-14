const test=require('node:test'),assert=require('node:assert/strict');
const {signature,headers,verifier}=require('../../src/services/shared/transport');
const {apiOwner}=require('../../src/services/shared/contracts');
test('internal signatures bind audience/body/path and reject replay',()=>{
  const previous=process.env.INTERNAL_SECRET;process.env.INTERNAL_SECRET='a'.repeat(64);
  try{const body=JSON.stringify({group:'users',method:'get',args:['users','1']}),path='/internal/v1/invoke',signed=headers('identity-service','POST',path,body),guard=verifier('identity-service');
    const req={method:'POST',originalUrl:path,rawBody:body,get:n=>signed[n]};let error;
    guard(req,{},e=>{error=e;});assert.equal(error,undefined);guard(req,{},e=>{error=e;});assert.equal(error.code,'REPLAY_REJECTED');
    verifier('business-service')(req,{},e=>{error=e;});assert.equal(error.code,'UNAUTHENTICATED');
    assert.notEqual(signature('a'.repeat(64),'identity-service','POST',path,signed['X-Service-Time'],signed['X-Service-Nonce'],body),signature('a'.repeat(64),'identity-service','POST',path,signed['X-Service-Time'],signed['X-Service-Nonce'],body+' '));
  }finally{if(previous==null)delete process.env.INTERNAL_SECRET;else process.env.INTERNAL_SECRET=previous;}
});
test('gateway routes lookups/imports and reports to their owners',()=>{
  assert.equal(apiOwner('/lookup/users'),'identity-service');assert.equal(apiOwner('/lookup/purchase-order-lines'),'warehouse-service');assert.equal(apiOwner('/source-imports/production-reports?source_id=1'),'business-service');assert.equal(apiOwner('/source-imports/stock-requests?source_id=1'),'warehouse-service');assert.equal(apiOwner('/catalog-data?resource=inventory'),'reporting-service');assert.equal(apiOwner('/catalog-data?resource=items'),'business-service');assert.equal(apiOwner('/reports/inventory/export'),'reporting-service');assert.equal(apiOwner('/notifications/1/read'),'notification-service');
});
test('internal RPC never exposes transaction/pool/raw SQL methods',()=>{
  const {descriptor}=require('../../src/services/shared/host');assert.throws(()=>descriptor('orders','transaction',[]),e=>e.code==='NOT_FOUND');assert.throws(()=>descriptor('pool','query',[]),e=>e.code==='NOT_FOUND');assert.equal(descriptor('catalogWrite','create',[{},'warehouses']),'warehouse-service');assert.equal(descriptor('catalogWrite','create',[{},'items']),'business-service');
});
