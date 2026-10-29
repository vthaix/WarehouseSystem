const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const out=path.resolve(__dirname,'../docs/review-20261028');
const files=['browser','ssr','accounts-catalog','admin-theme','category-images','customer-order','inspection-workflow','planning-confirmation','preproduction','reset-data','source-imports','warehouse-exceptions','warehouse-lookup','warehouse-request-workflow'];
const results=[];
for(const name of files){
  const start=new Date().toISOString(),r=spawnSync(process.execPath,['e2e/'+name+'.cjs'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,APP_URL:'http://127.0.0.1:3310',DEMO_PASSWORD:'123456'},encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
  fs.writeFileSync(path.join(out,'browser-'+name+'.log'),(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:''));
  results.push({name,start,end:new Date().toISOString(),status:r.status===0?'PASS':'FAIL',exit:r.status,error:r.error?.message||null});
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));
  console.log(name+': '+results.at(-1).status);
}
process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
