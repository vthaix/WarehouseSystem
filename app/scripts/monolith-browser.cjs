const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const base=process.env.APP_URL||'http://127.0.0.1:3310',root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/monolith-review');
const suites=['ssr','accounts-catalog','admin-theme','category-images','customer-order','inspection-workflow','planning-confirmation','preproduction','source-imports','warehouse-exceptions','warehouse-lookup','warehouse-request-workflow','reset-data'];
(async()=>{
 const health=await (await fetch(base+'/health')).json();if(health.stage!=='monolith'||health.test_instance!==true)throw Error('Browser acceptance requires isolated monolith test instance');
 fs.mkdirSync(out,{recursive:true});const results=[];
 for(const name of suites){const start=Date.now();const r=spawnSync(process.execPath,['e2e/'+name+'.cjs'],{cwd:root,env:{...process.env,APP_URL:base,DEMO_PASSWORD:'123456'},encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});fs.writeFileSync(path.join(out,name+'.log'),(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:''));results.push({name,status:r.status===0?'PASS':'FAIL',exit:r.status,ms:Date.now()-start});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(name+': '+results.at(-1).status)}
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
