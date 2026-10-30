const{chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.APP_URL||'http://127.0.0.1:3310',out=path.resolve(__dirname,'../artifacts/actor-storage');
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 assert.equal((await(await fetch(base+'/health')).json()).test_instance,true,'Use isolated test server');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})}),errors=[],results=[];
 try{for(const username of ['manager','staff','workshop','director','planner','purchaser','qc','stocktaker','customer','admin']){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(username+': '+e.message));page.on('response',r=>{if(r.status()>=500)errors.push(username+': '+r.status()+' '+r.url())});
  await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  const menu=await page.locator('nav [data-nav]').evaluateAll(nodes=>nodes.map(n=>({key:n.dataset.nav,text:n.textContent.trim()})));
  const keys=menu.map(m=>m.key);
  if(['manager','staff'].includes(username)){
   for(const key of ['warehouse-inbound','warehouse-outbound'])assert.ok(keys.includes(key));
   for(const key of ['stock-requests','tasks'])assert.ok(!keys.includes(key));
   assert.equal((await page.request.get(base+'/workshop/requests?module=stock-requests')).status(),403);
   await page.goto(base+'/warehouse/inbound');assert.match(await page.locator('h1').textContent(),username==='manager'?/Quản lý nhập kho/:/^Nhập kho$/);
   await page.locator('#warehouse-posted-history').waitFor();
  }
  if(username==='workshop'){assert.ok(keys.includes('stock-requests'));assert.ok(!keys.includes('warehouse-inbound'));assert.ok(!keys.includes('tasks'));}
  if(username==='director'){assert.ok(keys.includes('tasks'));assert.ok(!keys.includes('stocktake-minutes'));assert.ok(menu.some(m=>m.text.includes('Phê duyệt kế hoạch sản xuất')));}
  if(username==='purchaser'){assert.ok(!keys.includes('business-plans'));assert.equal((await page.request.get(base+'/plans?module=business-plans')).status(),403);}
  if(username==='manager'){
   await page.goto(base+'/catalog/data?module=items&q=NVL-001');await page.locator('.item-catalog-card').waitFor();
   const box=await page.locator('.item-catalog-card img').first().boundingBox();assert.equal(box.width,128);assert.equal(box.height,128);await page.screenshot({path:path.join(out,'item-cards-desktop.png'),fullPage:true});
   await page.goto(base+'/catalog/data?module=suppliers');await page.locator('.supplier-chips span').first().waitFor();assert.match(await page.locator('#table').textContent(),/Tâm Anh|Xuân Hoài/);await page.screenshot({path:path.join(out,'suppliers.png'),fullPage:true});
   await page.goto(base+'/warehouse/lookup');await page.locator('#lookup-zone').waitFor();const warehouse=await page.evaluate(async()=>((await api('warehouse-lookup')).data.warehouses.find(w=>w.code==='KHO-01')));await page.locator('#lookup-warehouse').selectOption(warehouse.id);await page.waitForFunction(()=>[...document.querySelectorAll('#lookup-zone option')].some(o=>o.label.includes('bột')));const flourZone=await page.locator('#lookup-zone option').evaluateAll(nodes=>nodes.find(n=>n.label.includes('bột')).value);await page.locator('#lookup-zone').selectOption(flourZone);assert.equal(await page.locator('[data-location]').count(),10);await page.screenshot({path:path.join(out,'warehouse-zones.png'),fullPage:true});
   await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  if(username==='customer'){
   await page.goto(base+'/customer/orders/create');await page.locator('.customer-item-photo').first().waitFor();const dimensions=await page.locator('.customer-item-photo').evaluateAll(images=>images.map(i=>({w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height})));assert.ok(dimensions.every(d=>d.w===128&&d.h===128));await page.screenshot({path:path.join(out,'customer-cards.png'),fullPage:true});
  }
  results.push({username,menu,status:'PASS'});await context.close();
 }assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log('ACTOR/STORAGE UI PASS: 10 roles, correct UC entries and denied pages, compact square photos, supply labels, warehouse zones, mobile.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
