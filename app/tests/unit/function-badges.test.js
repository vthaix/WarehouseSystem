const test=require('node:test'),assert=require('node:assert/strict');
const badges=require('../../src/modules/notifications/function-badges');
function pool(){return {queries:[],async execute(sql,args){this.queries.push({sql,args});if(sql.startsWith('SELECT resource_type'))return [[{resource_type:'production-plans',total:3},{resource_type:'minute-exceptions',total:1}]];return [[{total:2}]];}};}
test('director badge uses pending plans instead of accumulated unread plan messages',async()=>{
  const p=pool(),r=await badges(p,{id:'7',roles:['DIRECTOR']});assert.equal(r.notifications,4);assert.equal(r['production-plans'],2);assert.ok(p.queries.some(q=>q.sql.includes("production_plans WHERE status='DRAFT'")));assert.deepEqual(p.queries[0].args,['7']);
});
test('workshop exception badges are scoped and an unassigned workshop sees none',async()=>{
  const p=pool(),r=await badges(p,{id:'8',roles:['WORKSHOP_OWNER'],workshop_ids:['12']});assert.equal(r['exception-proposals'],2);assert.deepEqual(p.queries.at(-1).args,['12']);
  const empty=pool();assert.equal((await badges(empty,{id:'8',roles:['WORKSHOP_OWNER'],workshop_ids:[]}))['exception-proposals'],0);assert.ok(!empty.queries.some(q=>q.sql.includes('NgoaiLeMaXuong')));
});
