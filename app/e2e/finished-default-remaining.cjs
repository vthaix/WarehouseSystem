const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,executablePath});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/login');await page.locator('#username').fill('workshop');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
 await page.route('**/api/v1/lookup/production-plans',r=>r.fulfill({json:{data:[{id:'99101',code:'PLAN-MAX-TEST',status:'APPROVED'}]}}));
 await page.route('**/api/v1/lookup/items',r=>r.fulfill({json:{data:[{id:'99102',name:'Cake test',kind:'FINISHED_PRODUCT',unit:'cai'}]}}));
 await page.route('**/api/v1/production-plans/99101',r=>r.fulfill({json:{data:{id:'99101',code:'PLAN-MAX-TEST',outputs:[{item_id:'99102',quantity:'100.000'}],finished_report_progress:{reported_outputs:[{item_id:'99102',quantity:'40.000'}],issued_materials:[],reported_materials:[]}}}}));
 await page.goto(base+require('../src/config/navigation').modules.find(m=>m[0]==='finished-reports')[5]);await page.locator('#create').click();await page.locator('#f-production_plan_id').selectOption('99101');
 const input=page.locator('#outputs-rows [data-key=quantity]');await input.waitFor();assert.equal(Number((await input.inputValue()).replace(',','.')),60);assert.equal(await page.locator('#part-final').isChecked(),true);assert.equal(await page.locator('[data-remaining]').inputValue(),'0');
 await input.fill('20');assert.equal(await page.locator('[data-remaining]').inputValue(),'40');assert.equal(await page.locator('#part-final').isChecked(),false);
 await page.evaluate(()=>createFinishedPartForm({id:'99103',production_plan_id:'99101',completed_date:calendarToday(),outputs:[{item_id:'99102',quantity:'10',lot_code:'LOT-EDIT',manufactured_date:calendarToday()}],materials:[]}));
 await page.waitForFunction(()=>document.querySelector('#outputs-rows [data-key=quantity]')?.value==='10');assert.equal(Number((await page.locator('#outputs-rows [data-key=quantity]').inputValue()).replace(',','.')),10);assert.deepEqual(errors,[]);
 console.log('PASS: new finished report defaults to remaining 60 of 100 after 40 reported; user can reduce; remaining/final marker recalculate; editing preserves saved quantity. Live login, read fixtures, no writes.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
