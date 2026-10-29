const test=require('node:test'),assert=require('node:assert/strict');
const display=require('../../public/js/presentation');
test('Vietnam timestamps use fixed local timezone and calendar dates retain their day',()=>{
  assert.equal(display.format('2026-10-23T03:05:00.000Z'),'10:05 - 23/10/2026');
  assert.equal(display.format('2026-10-23T23:59:00Z'),'06:59 - 24/10/2026');
  assert.equal(display.format('2026-10-23'),'23/10/2026');
  assert.equal(display.format('TP-2026-10-23'),'TP-2026-10-23');
});
test('role labels, enums, booleans and reference names are readable without changing numeric input values',()=>{
  assert.equal(display.format(['WORKSHOP_OWNER'],'roles'),'Chủ xưởng');assert.equal(display.format('HIGH'),'Cao');
  assert.equal(display.format(1,'is_active'),'Có');assert.equal(display.format('0','is_active'),'Không');
  assert.equal(display.format('2','workshop_id',{workshop_name:'Xưởng bánh quy Sweet Bakery'}),'Xưởng bánh quy Sweet Bakery');
  assert.equal(display.format('100.000'),'100');assert.equal(display.fieldLabel('workshop_name'),'Xưởng phụ trách');
});
test('business details show readable references and exact order value',()=>{
  const row={code:'KSX-B1059C67896A0487',display_code:'KHSX-TRANVANA-02',customer_order_code:'DH-7EAE62C6D16CCE32',customer_order_display_code:'DH-TRANVANA-02'};
  assert.equal(display.format(row.code,'code',row),'KHSX-TRANVANA-02');
  assert.equal(display.format(row.customer_order_code,'customer_order_code',row),'DH-TRANVANA-02');
  assert.equal(display.format('1234567.2500','order_total',row),'1.234.567,25 ₫');
  assert.equal(display.format('Thiếu NVL','note',row),'Thiếu nguyên vật liệu');
});
test('UC navigation only exposes permitted entry points, independently of source lookup read rights',()=>{
  const {modules}=require('../../src/config/navigation'),find=id=>modules.find(m=>m[0]===id);
  assert.deepEqual(find('stocktakes')[3],['DIRECTOR']);assert.deepEqual(find('warehouse-lookup')[3],['WAREHOUSE_MANAGER','WORKSHOP_OWNER']);
  assert.deepEqual(find('qc-inspections')[3],['QC_INSPECTOR']);assert.deepEqual(find('purchase-orders')[3],['PURCHASER']);
  assert.deepEqual(find('warehouse-records')[4],[]);assert.ok(!find('items')[3].includes('WORKSHOP_OWNER'));
});
