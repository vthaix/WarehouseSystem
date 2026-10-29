const test=require('node:test'),assert=require('node:assert/strict');
const {validate}=require('../../src/modules/exceptions/quarantine');
const valid={quarantine:true,qc_inspection_line_id:'1',action:'RELEASE',quantity:'0.600',allocations:[{location_id:'2',quantity:'0.200'},{location_id:'3',quantity:'0.400'}]};
test('quarantine accepts exact multi-location quantities',()=>validate(valid));
test('quarantine rejects duplicate locations, invalid sources/actions and mismatched totals',()=>{
  for(const body of [{...valid,action:'INVALID'},{...valid,stocktake_line_id:'4'},
    {...valid,qc_inspection_line_id:'0'},{...valid,quarantine:false},{...valid,quantity:'0.601'},
    {...valid,allocations:[]},{...valid,allocations:[valid.allocations[0],valid.allocations[0]]},
    {...valid,allocations:[{location_id:'2',quantity:'-0.600'}]}])
    assert.throws(()=>validate(body),e=>e.code==='VALIDATION_ERROR');
});
