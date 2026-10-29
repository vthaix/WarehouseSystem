const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
const base='http://127.0.0.1:3310',out=path.resolve(__dirname,'../docs/review-20261028');
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})}),rows=[];try{
 for(const username of ['admin','customer','customer2','planner','purchaser','manager','staff','staff2','qc','qc2','qc3','stocktaker','stocktaker2','stocktaker3','workshop','workshop2','workshop3','director']){
  const context=await browser.newContext(),page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=500)errors.push('HTTP '+r.status()+' '+r.url());});
  await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  await page.waitForFunction(()=>typeof available==='function'&&!!user);const modules=await page.evaluate(()=>available().map(m=>({key:m[0],name:m[1],path:m[5]})));
  for(const module of modules){
   errors=[];const url=new URL(module.path,base);url.searchParams.set('module',module.key);const response=await page.goto(url.href);await page.waitForFunction(()=>typeof user!=='undefined'&&!!user);const result={username,module:module.key,title:module.name,url:url.pathname+url.search,status:response.status(),fields:[],createEnabled:false,createForm:null,errors};
   result.fields=await page.locator('#filters input,#filters select').evaluateAll(els=>els.map(e=>({name:e.name,type:e.type,options:e.tagName==='SELECT'?[...e.options].map(o=>({value:o.value,label:o.label})):undefined})));
   const create=page.locator('#create');if(await create.count()){
    // Assignment capability is loaded asynchronously; wait for its informational panel.
    if(module.key==='stocktake-minutes')await page.waitForFunction(()=>!!document.querySelector('#minute-assignment-info')?.textContent).catch(()=>{});
    result.createEnabled=await create.isEnabled();if(result.createEnabled){await create.click();await page.waitForFunction(()=>document.querySelector('#modal')?.open||getComputedStyle(document.querySelector('#toast')).display!=='none',{},{timeout:10000}).catch(()=>{});
     await page.waitForFunction(()=>!(/Đang chuẩn bị|Đang tải/.test(document.querySelector('#modal-body')?.textContent||'')),{},{timeout:10000}).catch(()=>{});
     result.createForm=await page.evaluate(()=>({open:!!document.querySelector('#modal')?.open,text:document.querySelector('#modal-body')?.textContent,fields:[...document.querySelectorAll('#modal-body input,#modal-body select,#modal-body textarea')].map(e=>({name:e.name||e.id,type:e.type,label:e.getAttribute('aria-label')||document.querySelector('label[for="'+e.id+'"]')?.textContent,required:e.required,disabled:e.disabled,min:e.min,max:e.max,step:e.step,options:e.tagName==='SELECT'?[...e.options].map(o=>({value:o.value,label:o.label})):undefined}))}));if(result.createForm.open)await page.keyboard.press('Escape');
    }
   }
   result.errors=[...errors];rows.push(result);fs.writeFileSync(path.join(out,'UI_ROLE_MATRIX.json'),JSON.stringify(rows,null,2));
  }
  await page.screenshot({path:path.join(out,'role-'+username+'.png'),fullPage:true});await context.close();console.log(username+': '+modules.length+' screens reviewed');
 }
 console.log('ROLE UI AUDIT COMPLETE: '+rows.length+' actor/screens; '+rows.filter(r=>r.status!==200||r.errors.length).length+' unexpected failures.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
