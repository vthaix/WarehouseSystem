const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill('manager');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  await page.goto(base+'/warehouse/lookup');await page.locator('.warehouse-seat').first().waitFor();
  fs.mkdirSync(require('node:path').join(__dirname,'../artifacts/warehouse-seats'),{recursive:true});await page.screenshot({path:require('node:path').join(__dirname,'../artifacts/warehouse-seats/lookup.png'),fullPage:true});
  const map=await page.evaluate(()=>JSON.parse(document.querySelector('#app').dataset.boot).warehouseMap);
  const locations=Array.from({length:10},(_,i)=>({id:String(99001+i),code:'A'+String(i+1).padStart(2,'0'),name:'A'+String(i+1).padStart(2,'0'),zone_name:'Khu test',zone_category_id:'1',depth:i+1,is_active:1,stock:[]}));
  const stock=name=>({item_name:name,item_code:name,lot_code:name,quantity:'10',reserved_quantity:'0',available_quantity:'10',unit:'kg',kind:'MATERIAL',quality_bucket:'AVAILABLE',expiry_date:'2027-12-01'});
  locations[0].stock=[stock('Flour A')];locations[1].stock=[stock('Flour B')];
  await page.route('**/api/v1/warehouse-lookup?*',r=>r.fulfill({json:{data:{...map,locations}}}));
  await page.locator('#refresh-warehouse-map').click();await page.locator('[data-seat-zone="Khu test"]').waitFor();
  await page.locator('[data-seat-zone="Khu test"]').click();assert.equal(await page.locator('#warehouse-location-stock .warehouse-stock-card').count(),2);
  await page.locator('[data-location="99001"]').click();assert.equal(await page.locator('#warehouse-location-stock .warehouse-stock-card').count(),1);assert.ok((await page.locator('#warehouse-location-stock').innerText()).includes('Flour A'));assert.ok(!(await page.locator('#warehouse-location-stock').innerText()).includes('Flour B'));
  await page.locator('[data-seat-zone="Khu test"]').click();assert.equal(await page.locator('#warehouse-location-stock .warehouse-stock-card').count(),2);
  assert.equal(await page.locator('.warehouse-seat-band-label').count(),3);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Lookup must not overflow viewport');await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+require('../src/config/navigation').modules.find(m=>m[0]==='warehouse-inbound')[5]);
  // Actual dispatch form code; controlled preview and intercepted writes.
  let saved,mode='IN';
  const lot={id:'99100',code:'LOT-TEST',item_id:'1',passed_quantity:'10',posted_quantity:'0',expiry_date:'2027-01-01',suggested_location_id:'99001',suggested_location_ids:['99001','99002','99003'],first_received_at:'2026-11-01T00:00:00Z'};
  const balances=[{lot_id:'99100',location_id:'99002',quality_bucket:'AVAILABLE',quantity:'10'}];
  await page.route('**/api/v1/lookup/users',r=>r.fulfill({json:{data:[{id:'999',name:'Staff test',roles:['WAREHOUSE_STAFF']}]}}));
  await page.route('**/api/v1/stock-requests/99999/allocations',r=>r.fulfill({json:{data:{request:{version:1},lines:[{id:'99200',item_id:'1',item_name:'Flour test',remaining_quantity:'10',lots:[lot],locations,balances}],allocations:[],locations,balances}}}));
  await page.route('**/api/v1/stock-requests/99999/dispatch',r=>{saved=r.request().postDataJSON();return r.fulfill({json:{data:{id:'99999'}}});});
  const open=async type=>{mode=type;await page.evaluate(async type=>{const date=new Date(Date.now()+86400000).toISOString().slice(0,10);await dispatchForm({id:'99999',code:'DISPATCH-TEST',type,requested_date:date});},type);assert.equal(await page.locator('.warehouse-dispatch-map .warehouse-seat').first().isVisible(),false);assert.equal(await page.locator('#f-start_at,#f-end_at').count(),0);await page.locator('.warehouse-position-picker summary').first().click();await page.locator('.warehouse-dispatch-map .warehouse-seat').first().waitFor();};
  await open('IN');assert.equal(await page.locator('.warehouse-dispatch-map .recommended').count(),3);assert.equal(await page.getByLabel('Chất lượng',{exact:true}).inputValue(),'Khả dụng');await page.locator('.warehouse-dispatch-map [data-location="99003"]').click();assert.equal(await page.locator('[data-key=location_id]').inputValue(),'99003');
  await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);assert.equal(saved.allocation_mode,'REPLACE_PENDING');assert.equal(saved.start_at,undefined);assert.equal(saved.end_at,undefined);assert.equal(saved.allocations[0].location_id,'99003');assert.equal(saved.allocations[0].assignee_id,'999');
  await open('OUT');assert.equal(await page.locator('.warehouse-dispatch-map [data-location="99001"]').isDisabled(),true);assert.equal(await page.locator('.warehouse-dispatch-map [data-location="99002"]').isDisabled(),false);await page.locator('.warehouse-dispatch-map [data-location="99002"]').click();await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);assert.equal(saved.allocations[0].location_id,'99002');
  assert.deepEqual(errors,[]);
  console.log('PASS: live lookup loads seats; zone/cell scopes distinct; three expiry bands; mobile fits; inbound clicked cell and employee sent exactly; outbound only stocked cell enabled. Controlled preview and dispatch writes mocked.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
