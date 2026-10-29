const test=require('node:test');
const assert=require('node:assert/strict');
const Service=require('../../src/modules/quality/QualityCampaignService');
function fixture(hasLots=true){
  const writes=[];
  const c={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{},execute:async(sql,args)=>{
    if(sql.startsWith('SELECT * FROM stocktakes'))return [[{id:1,version:1,status:'PLANNED',MaKeHoachMuaQC:2,start_at:new Date('2099-01-01T01:00:00Z')}]];
    if(sql.startsWith('SELECT lot_id'))return [hasLots?[{lot_id:3}]:[]];
    if(sql.startsWith('SELECT id,code,planned_date'))return [[{id:2,code:'MUA-2',expected_date:'2099-01-01',status:'APPROVED'}]];
    if(sql.startsWith('SELECT l.item_id'))return [[]];
    writes.push({sql,args});return [{}];
  }};
  const service=new Service({getConnection:async()=>c});service.get=async()=>({id:'1',status:'IN_PROGRESS'});
  return {service,writes};
}
const director={id:'1',roles:['DIRECTOR']};
test('early inspection remains blocked by default and when simulation is unchecked',async()=>{
  for(const body of [{version:1},{version:1,simulate_early_start:false}]){
    const {service,writes}=fixture();
    await assert.rejects(service.action(director,'1',body,'start','req'),e=>e.code==='SOURCE_NOT_READY');
    assert.equal(writes.length,0);
  }
});
test('explicit simulation permits early start and records consent in audit',async()=>{
  const {service,writes}=fixture();
  await service.action(director,'1',{version:1,simulate_early_start:true},'start','req');
  const audit=writes.find(w=>w.sql.startsWith('INSERT INTO audit_logs'));
  assert.equal(JSON.parse(audit.args[4]).simulate_early_start,true);
});
test('simulation cannot replace actual lots or director permission',async()=>{
  const {service}=fixture(false);
  await assert.rejects(service.action(director,'1',{version:1,simulate_early_start:true},'start','req'),e=>e.code==='ACTUAL_LOT_REQUIRED');
  await assert.rejects(service.action({id:'2',roles:['QC_INSPECTOR']},'1',{version:1,simulate_early_start:true},'start','req'),e=>e.code==='FORBIDDEN');
});
test('simulation rejects truthy strings and is not accepted when closing',async()=>{
  const {service}=fixture();
  await assert.rejects(service.action(director,'1',{version:1,simulate_early_start:'false'},'start','req'),e=>e.code==='VALIDATION_ERROR');
  await assert.rejects(service.action(director,'1',{version:1,simulate_early_start:true},'close','req'));
});
