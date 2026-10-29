const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base='http://127.0.0.1:3310/api/v1/',rows=[];
async function session(username){let cookie='',csrf='';async function call(p,body,method=body?'POST':'GET'){const r=await fetch(base+p,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':csrf},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const text=await r.text();let data;try{data=JSON.parse(text);}catch{}return {status:r.status,type:r.headers.get('content-type'),data,text};}csrf=(await call('auth/csrf')).data.data.csrf_token;const r=await call('auth/login',{username,password:'123456'});assert.equal(r.status,200);csrf=r.data.data.csrf_token;return call;}
(async()=>{try{
 const director=await session('director'),customer=await session('customer');
 for(const kind of ['inventory','stock-documents','stocktakes']){
  let r=await director('reports/'+kind);assert.equal(r.status,200);rows.push({case:'READ '+kind,expected:200,actual:r.status,status:'PASS'});
  r=await director('reports/'+kind+'/export?format=csv');assert.equal(r.status,200);assert.match(r.type,/text\/csv/);rows.push({case:'CSV with format '+kind,expected:200,actual:r.status,type:r.type,status:'PASS'});
  r=await director('reports/'+kind+'/export?page=1&per_page=20');rows.push({id:'R-04',case:'Export as current UI query '+kind,expected:'CSV download from UI',actual:r.status,error:r.data?.error,status:r.status===200?'PASS':'CONFIRMED_DEFECT'});
  r=await customer('reports/'+kind);assert.equal(r.status,403);rows.push({case:'Customer forbidden '+kind,expected:403,actual:r.status,status:'PASS'});
 }
 for(const q of ['reports/stock-documents?from=2040-02-01&to=2040-01-01','reports/inventory?as_of=2999-01-01T00:00:00Z','reports/inventory?quality_bucket=BAD','reports/inventory/export?format=xlsx']){const r=await director(q);assert.equal(r.status,422,JSON.stringify(r));rows.push({case:q,expected:422,actual:r.status,error:r.data?.error,status:'PASS'});}
 console.log(JSON.stringify(rows,null,2));
}finally{fs.writeFileSync(path.resolve(__dirname,'../docs/review-20261028/report-probe-results.json'),JSON.stringify(rows,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
