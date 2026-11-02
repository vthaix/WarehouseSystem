const test=require('node:test'),assert=require('node:assert/strict'),{unchanged}=require('../../src/shared/warehouse-allocation-plan');
const base={user_id:'6',stock_request_line_id:'10',lot_id:'20',location_id:'30',quality_bucket:'AVAILABLE',quantity:'4.400',posted_quantity:'1.000'};
const submitted={assignee_id:'6',stock_request_line_id:'10',lot_id:'20',location_id:'30',quality_bucket:'AVAILABLE',quantity:'3.4'};
test('confirm allocation compares outstanding quantity exactly, excluding posted documents',()=>{assert.equal(unchanged([base],[submitted]),true);assert.equal(unchanged([base],[{...submitted,quantity:'4.4'}]),false);});
test('allocation edits detect different employees, positions, lots and request lines',()=>{for(const key of ['assignee_id','stock_request_line_id','lot_id','location_id'])assert.equal(unchanged([base],[{...submitted,[key]:'99'}]),false);assert.equal(unchanged([{...base,posted_quantity:'4.4'}],[]),true);});
