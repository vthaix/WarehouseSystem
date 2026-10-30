const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3310',out=path.resolve(__dirname,'../artifacts/workspace-ux');
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 const errors=[],results=[];
 try{
  for(const username of ['director','purchaser','manager','customer','workshop','qc','stocktaker','staff','admin']){
   const context=await browser.newContext(),page=await context.newPage();
   page.on('pageerror',e=>errors.push(username+': '+e.message));
   page.on('response',r=>{if(r.status()>=500)errors.push(username+': '+r.status()+' '+r.url());});
   await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
   await page.locator('.work-hero').waitFor();assert.ok(await page.locator('.work-stat').count());
   await page.screenshot({path:path.join(out,username+'-dashboard.png'),fullPage:true});
   if(username==='director'){
    const url=await page.evaluate(()=>warehouseNavigation.modules.find(m=>m[0]==='production-plans')[5]);await page.goto(base+url+'?module=production-plans');
    if(await page.locator('#table tbody tr').count()){await page.locator('.record-freshness').first().waitFor();}
   }
   if(username==='purchaser'){
    await page.goto(base+'/purchases?module=purchase-orders');await page.locator('.purchase-ready').waitFor();
    const buttons=page.locator('[data-order-plan]');assert.ok(await buttons.count(),'Seed a waiting approved purchase plan before this test');
    const id=await buttons.first().getAttribute('data-order-plan');await buttons.first().click();
    await page.waitForFunction(id=>document.querySelector('#f-business_plan_id')?.value===id,id);
    await page.waitForFunction(()=>!!document.querySelector('[data-key="supplier_id"]'));
    assert.equal(await page.locator('#f-business_plan_id').inputValue(),id);
    await page.screenshot({path:path.join(out,'purchase-from-plan.png'),fullPage:true});await page.locator('#close-modal').click();
   }
   if(username==='manager'){
    await page.goto(base+'/catalog/data?module=items');await page.waitForFunction(()=>!!document.querySelector('.item-thumb'));
    const images=await page.evaluate(async()=>{const rows=(await api('items?per_page=100')).data;return Promise.all(rows.filter(r=>r.image_path).map(async r=>({code:r.code,status:(await fetch(r.image_path)).status})));});
    assert.ok(images.length>=33);assert.ok(images.every(r=>r.status===200));
    const photoIndex=await page.evaluate(()=>cached.findIndex(r=>r.image_path));assert.ok(photoIndex>=0);await page.locator('[data-detail="'+photoIndex+'"]').click();await page.locator('.item-detail-photo').waitFor();
    await page.evaluate(()=>{const b=document.createElement('button');b.id='preserve-handler';b.textContent='Nested';b.onclick=()=>{window.preservedClicks=(window.preservedClicks||0)+1;openModal('Nested form',formWrap(inputField('name','text',true,[],'Child')));};modalBody.append(b);});
    await page.locator('#preserve-handler').click();await page.locator('[data-modal-back]').click();await page.locator('#preserve-handler').click();
    assert.equal(await page.evaluate(()=>window.preservedClicks),2);
    await page.locator('[data-modal-back]').click();
    await page.evaluate(()=>{openModal('Long form',formWrap(inputField('name','text',true,[],'Kept draft')+Array.from({length:45},(_,i)=>inputField('note'+i,'textarea',false)).join('')));modal.scrollTop=modal.scrollHeight;});
    const bounds=await page.locator('#close-modal').boundingBox();assert.ok(bounds.y>=0&&bounds.y<720,'Close stays visible while scrolling');
    await page.locator('[data-modal-back]').click();await page.locator('#close-modal').click();
    await page.locator('#create').click();await page.locator('#item-photo').waitFor();await page.locator('#f-name').fill('Draft preserved');
    await page.evaluate(()=>openModal('Another step',formWrap(inputField('note','textarea',false))));await page.locator('[data-modal-back]').click();assert.equal(await page.locator('#f-name').inputValue(),'Draft preserved');
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile-form.png'),fullPage:true});await page.locator('#close-modal').click();
   }
   if(username==='customer'){
    await page.goto(base+'/customer/orders/create');await page.locator('.customer-item-photo').first().waitFor();
    assert.equal(await page.locator('.customer-item-photo').count(),10);
   }
   results.push({username,status:'PASS'});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log('WORKSPACE UX PASS: 9 dashboards, approved-plan handoff, 33 photos, nested live DOM/back, sticky close, mobile, customer photos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
