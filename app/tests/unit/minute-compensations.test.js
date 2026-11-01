const test=require('node:test'),assert=require('node:assert/strict'),{deficits}=require('../../src/shared/minute-compensations');
test('shortage uses usable goods without adding rejected goods twice',()=>{
 const [r]=deficits([{system_quantity:'55',inspected_quantity:'55',passed_quantity:'50',failed_quantity:'5'}]);assert.equal(r.shortage_quantity,'5.000');assert.equal(r.missing_received_quantity,'0.000');
});
test('count and QC use the smaller usable amount, missing data stays unknown',()=>{
 const rows=deficits([{system_quantity:'55',counted_quantity:'50',passed_quantity:'55'},{system_quantity:'55',counted_quantity:'0'},{system_quantity:'55'},{system_quantity:'55',inspected_quantity:'50',passed_quantity:'48',failed_quantity:'2'}]);
 assert.equal(rows[0].shortage_quantity,'5.000');assert.equal(rows[1].shortage_quantity,'55.000');assert.equal(rows[2].shortage_quantity,null);assert.equal(rows[3].shortage_quantity,'7.000');assert.equal(rows[3].missing_received_quantity,'5.000');
});
