const test=require('node:test'),assert=require('node:assert/strict');
const {validate}=require('../../src/services/warehouse-service/modules/exceptions/remaining-failure');
const c={execute:async()=>[[{quantity:'0.100'}]]};
test('partial disposal permits exactly the unprocessed remainder and rejects duplicate use',async()=>{
  await validate(c,{id:'1',failed_quantity:'0.250'},'0.150');
  await assert.rejects(()=>validate(c,{id:'1',failed_quantity:'0.250'},'0.151'),e=>e.code==='SOURCE_LIMIT_EXCEEDED');
});
