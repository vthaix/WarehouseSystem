const test=require('node:test'),assert=require('node:assert/strict');
const {localDay,validateStart}=require('../../src/shared/qc-schedule-dates');
test('QC schedule accepts receipt day in Vietnam and rejects before newest selected receipt',()=>{
  assert.equal(localDay('2040-01-01T18:00:00Z'),'2040-01-02');
  const lots=[{received_date:'2040-01-01'},{received_date:'2040-01-02'}];
  assert.doesNotThrow(()=>validateStart('2040-01-01T17:00:00Z',lots));
  assert.throws(()=>validateStart('2040-01-01T16:59:00Z',lots),e=>e.code==='LOT_RECEIPT_DATE_REQUIRED');
});
