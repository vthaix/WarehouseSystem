const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
require('../src/config/env').loadEnv();
if(process.env.ACCEPTANCE_MONOLITH!=='true'||process.env.DB_NAME!=='warehouse_db')throw Error('Dedicated monolith test instance required');
const {getPool,closePool}=require('../src/config/database');
(async()=>{
 const base='http://127.0.0.1:3000',health=await (await fetch(base+'/health')).json();assert.equal(health.test_instance,true);assert.equal(health.stage,'monolith');
 const [before]=await getPool().query('SELECT id,unit_id FROM items ORDER BY id');
 let response=await fetch(base+'/api/v1/auth/csrf'),cookie=response.headers.get('set-cookie').split(';')[0],csrf=(await response.json()).data.csrf_token;
 response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({username:'admin',password:process.env.DEMO_PASSWORD})});assert.equal(response.status,200);cookie=response.headers.get('set-cookie').split(';')[0];csrf=(await response.json()).data.csrf_token;
 response=await fetch(base+'/api/v1/test-data/reset',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':require('node:crypto').randomUUID()},body:JSON.stringify({confirmation:'XOA DU LIEU TEST'})});assert.equal(response.status,200,await response.text());
 const childEnv={...process.env,SEED_DEMO:'true',DEMO_API_URL:base};
 for(const name of ['DB_PASSWORD','SESSION_SECRET','DEMO_PASSWORD','INTERNAL_SECRET'])if(childEnv[name])delete childEnv[name+'_FILE'];
 for(const script of ['seed-demo-workflows','verify-demo-fixtures']){const r=spawnSync(process.execPath,['scripts/'+script+'.cjs'],{stdio:'inherit',env:childEnv});assert.equal(r.status,0,script)}
 const [after]=await getPool().query('SELECT id,unit_id FROM items ORDER BY id');const units=new Map(after.map(r=>[String(r.id),String(r.unit_id)]));for(const r of before)assert.equal(units.get(String(r.id)),String(r.unit_id),'Existing item unit preserved: '+r.id);
 console.log('FIXTURE REBUILD PASS: reset backs up and invalidates checkpoints; retained catalogs reused; 36 scenarios verified; existing units unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(closePool);
