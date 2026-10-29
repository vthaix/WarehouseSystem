const test=require('node:test'),assert=require('node:assert/strict');
const lookup=require('../../src/modules/reporting/warehouse-lookup');
const C=require('../../src/services/domain/core');
test('warehouse map denies non-UC actors before querying stock',async()=>{
  for(const role of ['DIRECTOR','QC_INSPECTOR','STOCKTAKER','CUSTOMER','WAREHOUSE_STAFF','PLANNER','PURCHASER'])await assert.rejects(lookup({execute(){throw Error('SQL must not run');}},{roles:[role]}),e=>e.status===403);
});
test('warehouse map keeps empty locations and separates reserved, expired and quarantine stock',async()=>{
  const line=(overrides={})=>({location_id:1,lot_id:2,item_id:3,category_id:4,quantity:'10.000',reserved_quantity:'3.000',quality_bucket:'AVAILABLE',qc_status:'PASSED',expiry_date:null,...overrides});
  const pool={async execute(sql){if(sql.includes('FROM warehouses'))return [[{id:1,code:'K1',name:'Kho bánh'}]];if(sql.includes('FROM categories'))return [[]];if(sql.startsWith('SELECT id,code,name,is_active'))return [[{id:1,code:'A1',name:'Kệ A1',is_active:1},{id:2,code:'A2',name:'Kệ A2',is_active:1}]];return [[line(),line({lot_id:3,expiry_date:'2000-01-01'}),line({lot_id:4,quality_bucket:'QUARANTINE',reserved_quantity:'0.000'})]];}};
  const map=await lookup(pool,{roles:['WORKSHOP_OWNER']});assert.equal(map.locations.length,2);assert.deepEqual(map.locations[0].stock.map(l=>l.available_quantity),['7.000','0.000','0.000']);assert.deepEqual(map.locations[1].stock,[]);assert.ok(map.as_of);assert.equal(map.locations[0].stock[1].expired,true);assert.equal(map.warehouse_id,'1');
});
