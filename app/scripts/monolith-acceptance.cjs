const {spawn}=require('node:child_process'),fs=require('node:fs');
if(process.env.ACCEPTANCE_MONOLITH!=='true'||process.env.DB_NAME!=='warehouse_db'||process.env.NODE_ENV==='production')throw Error('Run only against the dedicated monolith acceptance Compose project.');
const scripts=['monolith-schema','tasks','stocktake','order','production','commerce','partial-receipt','category-images','preproduction','finished-parts-task','accounts-catalog','planning-confirmation'];
(async()=>{
 const base='http://127.0.0.1:3000';
 const health=await (await fetch(base+'/health')).json();
 if(health.stage!=='monolith'||health.test_instance!==true)throw Error('Refusing to reset a non-test application');
 const csrfResponse=await fetch(base+'/api/v1/auth/csrf');let cookie=csrfResponse.headers.get('set-cookie').split(';')[0];let csrf=(await csrfResponse.json()).data.csrf_token;
 const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({username:'admin',password:process.env.DEMO_PASSWORD})});
 if(!login.ok)throw Error('Test admin login failed');cookie=login.headers.get('set-cookie').split(';')[0];csrf=(await login.json()).data.csrf_token;
 const reset=await fetch(base+'/api/v1/test-data/reset',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':require('node:crypto').randomUUID()},body:JSON.stringify({confirmation:'XOA DU LIEU TEST'})});
 if(!reset.ok)throw Error('Test reset failed: '+await reset.text());
 console.log('MONOLITH RESET PASS: test instance only, backed up before clearing workflows.');
 const results=[];
 for(const name of scripts){const started=Date.now();const code=await new Promise(resolve=>{const child=spawn(process.execPath,['scripts/'+name+'-smoke.cjs'],{stdio:'inherit',env:{...process.env,SEED_DEMO:'true'}});child.on('error',e=>{console.error(e.message);resolve(1)});child.on('exit',c=>resolve(c??1))});results.push({name,code,ms:Date.now()-started});console.log('UC_SUITE_RESULT '+name+' '+code)}
 fs.mkdirSync('/var/backups/warehouse',{recursive:true});fs.writeFileSync('/var/backups/warehouse/mono-acceptance.json',JSON.stringify(results,null,2));if(results.some(r=>r.code))process.exitCode=1;console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
