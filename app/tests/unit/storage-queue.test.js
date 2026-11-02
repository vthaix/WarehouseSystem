const test=require('node:test'),assert=require('node:assert/strict');
const {recommend}=require('../../src/shared/storage-queue');
test('FEFO then FIFO uses actual warehouse receipt rather than lot creation',()=>{
 const {compare}=require('../../src/shared/storage-queue');
 const rows=[{id:'1',expiry_date:'2027-02-01',first_received_at:'2026-10-01'},{id:'2',expiry_date:'2027-01-01',first_received_at:'2026-10-25'},{id:'3',expiry_date:'2027-01-01',first_received_at:'2026-10-20'},{id:'4',expiry_date:null,first_received_at:'2026-01-01'}];
 assert.deepEqual(rows.sort(compare).map(r=>r.id),['3','2','1','4']);
 assert.ok(compare({id:'1',expiry_date:'2027-01-01',first_received_at:null},{id:'2',expiry_date:'2027-01-01',first_received_at:'2026-10-01'})>0);
});
const slots=[{id:'1',zone_category_id:'8',depth:1},{id:'2',zone_category_id:'8',depth:2},{id:'3',zone_category_id:'8',depth:3},{id:'4',zone_category_id:null,depth:1}];
test('more than six months is placed inside the same area',()=>assert.equal(recommend({expiry_date:'2027-07-01'},slots,[{expiry_date:'2026-12-01'}],'2026-11-02').location_id,'3'));
test('less than three months stays outside',()=>assert.equal(recommend({expiry_date:'2026-12-01'},slots,[{expiry_date:'2027-12-01'}],'2026-11-02').location_id,'1'));
test('three through six calendar months belongs to middle positions',()=>{
 for(const expiry_date of ['2027-02-02','2027-05-02'])assert.equal(recommend({expiry_date},slots,[],'2026-11-02').location_id,'2');
 assert.equal(recommend({expiry_date:'2027-05-03'},slots,[],'2026-11-02').location_id,'3');
 const {addMonths}=require('../../src/shared/storage-queue');assert.equal(addMonths('2026-11-30',3),'2027-02-28');
});
test('missing expiration stays at front and does not imply long shelf life',()=>assert.equal(recommend({expiry_date:null},slots).location_id,'1'));
test('no compatible positions produces no invented location',()=>assert.equal(recommend({expiry_date:'2027-01-01'},[]).location_id,null));
test('warehouse actors have their UC entry points, not workshop requests or director management',()=>{const {modules}=require('../../src/config/navigation');const allowed=role=>modules.filter(m=>m[3].includes(role)||m[3].includes('*')).map(m=>m[0]);for(const role of ['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']){assert.ok(allowed(role).includes('warehouse-inbound'));assert.ok(allowed(role).includes('warehouse-outbound'));assert.ok(!allowed(role).includes('stock-requests'));assert.ok(!allowed(role).includes('tasks'));}assert.ok(allowed('WORKSHOP_OWNER').includes('stock-requests'));assert.ok(allowed('DIRECTOR').includes('tasks'));assert.ok(!allowed('PURCHASER').includes('business-plans'));});
