const test=require('node:test'),assert=require('node:assert/strict');
const {record}=require('../../src/services/warehouse-service/modules/tasks/inspection-scope');
function connection(){const writes=[];return {writes,async execute(sql,args){
  if(sql==='SELECT status FROM stocktakes WHERE id=? FOR UPDATE')return [[{status:'IN_PROGRESS'}]];
  if(sql.startsWith('SELECT lot_id FROM quality_campaign_lots'))return [[{lot_id:11},{lot_id:12}]];
  if(sql.startsWith('SELECT SoLuongDem'))return [[{SoLuongDem:null}]];
  if(sql.startsWith('SELECT KiemSoLuong'))return [[{KiemSoLuong:1,KiemChatLuong:1}]];
  if(sql.startsWith('SELECT COUNT(*)'))return [[{total:2,count_pending:0,quality_pending:1}]];
  if(sql.startsWith('UPDATE')){writes.push({sql,args});return [{affectedRows:1}];}
  throw Error('Unexpected SQL: '+sql);
}};}
const row={id:'1',stocktake_id:'2',actions:['recordCount']};
test('batch count rejects missing, duplicate and foreign lot rows before writing',async()=>{
  for(const lines of [[{lot_id:'11',counted_quantity:'1'}],[{lot_id:'11',counted_quantity:'1'},{lot_id:'11',counted_quantity:'2'}],[{lot_id:'11',counted_quantity:'1'},{lot_id:'99',counted_quantity:'2'}],[null]]){
    const c=connection();await assert.rejects(record(c,{id:'3'},row,{count_lines:lines}),e=>e.code==='VALIDATION_ERROR');assert.equal(c.writes.length,0);
  }
});
test('batch count records all lots including zero and waits for pending QC',async()=>{
  const c=connection();await record(c,{id:'3'},row,{count_lines:[{lot_id:'11',counted_quantity:'0.000'},{lot_id:'12',counted_quantity:'12.500'}]});
  assert.equal(c.writes.length,3);assert.deepEqual(c.writes.slice(0,2).map(w=>w.args[0]),['0.000','12.500']);assert.ok(!c.writes.some(w=>w.sql.includes("status='COMPLETED'")));
});
