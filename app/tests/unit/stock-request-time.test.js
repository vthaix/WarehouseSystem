const test=require('node:test'),assert=require('node:assert/strict');
const {execution}=require('../../src/services/warehouse-service/modules/stock-requests/request-workflow');
test('request execution preserves exact local date/time and supplies legacy default',()=>{
  assert.equal(execution({requested_date:'2099-01-01',requested_at:'2099-01-01T10:30:00+07:00'}).toISOString(),'2099-01-01T03:30:00.000Z');
  assert.equal(execution({requested_date:'2099-01-01'}).toISOString(),'2099-01-01T01:00:00.000Z');
});
test('execution rejects missing timezone, mismatched date and past dates',()=>{
  for(const body of [{requested_date:'2099-01-01',requested_at:'2099-01-01T10:30'},{requested_date:'2099-01-01',requested_at:'2099-01-02T10:30:00+07:00'},{requested_date:'2000-01-01',requested_at:'2000-01-01T10:30:00+07:00'}])assert.throws(()=>execution(body),e=>e.code==='VALIDATION_ERROR');
});
