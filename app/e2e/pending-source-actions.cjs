const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});
 try{for(const username of ['manager','qc','stocktaker']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  page.setDefaultTimeout(8000);
  const uid=await page.evaluate(()=>user.id),manager=username==='manager',counting=username==='stocktaker';
  const campaign={id:'90101',code:'PENDING-TEST',source_code:'PLAN-TEST',source_plan_id:'90100',campaign_type:'QUALITY_CHECK',KiemTheoKeHoach:1,KiemChatLuong:1,KiemSoLuong:1,assignee_ids:[String(uid)],status:manager?'CLOSED':'IN_PROGRESS'};
  const line={purchase_order_line_id:'90102',item_name:'Flour',unit:'kg',planned_quantity:'20.000',remaining_quantity:'18.500',received_quantity:manager?'18.500':null,passed_quantity:manager?'18.500':null,failed_quantity:manager?'0':null,counted_quantity:null,lot_id:null,shelf_life_days:90,manufactured_date:new Date().toISOString().slice(0,10)};
  const sheet=()=>({...campaign,version:1,can_quality:!manager&&!counting,can_count:counting,lines:[line]});
  let submitted;
  await page.route('**/api/v1/quality-campaigns?*',r=>r.fulfill({json:{data:[campaign,campaign,{...campaign,id:'90109',code:'DONE-TEST',status:'CLOSED'}]}}));
  await page.route('**/api/v1/quality-campaigns/*/purchase-check',r=>{
   const done=r.request().url().includes('/90109/');
   if(r.request().method()==='POST'){submitted=r.request().postDataJSON();if(counting)line.counted_quantity=submitted.lines[0].counted_quantity;else{line.received_quantity=submitted.lines[0].received_quantity;line.passed_quantity=submitted.lines[0].passed_quantity;line.failed_quantity=submitted.lines[0].failed_quantity;}}
   return r.fulfill({json:{data:done?{...sheet(),lines:[{...line,received_quantity:'20',counted_quantity:'20',passed_quantity:'20',lot_id:'90110'}]}:sheet()}});
  });
  await page.route('**/api/v1/quality-campaigns/90101/material-lots',r=>{submitted=r.request().postDataJSON();line.lot_id='90111';return r.fulfill({json:{data:sheet()}});});
  const resource=manager?'lots':counting?'inspection-counts':'qc-inspections';
  await page.goto(base+(manager?'/catalog/data?module=lots':require('../src/config/navigation').modules.find(m=>m[0]===resource)[5]));
  await page.waitForFunction(()=>document.querySelectorAll('#purchase-plan-checks button').length===1);
  assert.ok(!(await page.locator('#purchase-plan-checks').innerText()).includes('DONE-TEST'));
  await page.locator('#create').click();await page.locator('#f-campaign_id').selectOption('90101');
  if(!manager)await page.locator('#f-qc_source_id').selectOption('90100');
  await page.locator('#data-form [type=submit]').click();await page.locator(manager?'#data-form .table-wrap':counting?'[data-check-key=counted_quantity]':'[data-check-key=received_quantity]').waitFor();
  if(!manager){const selector=counting?'[data-check-key=counted_quantity]':'[data-check-key=received_quantity]';assert.equal(Number((await page.locator(selector).inputValue()).replace(',','.')),18.5);}
  const manual=await page.locator('#data-form > .form-grid').innerText();await page.evaluate(()=>modal.close());
  await page.locator('#purchase-plan-checks button').click();await page.locator(manager?'#data-form .table-wrap':counting?'[data-check-key=counted_quantity]':'[data-check-key=received_quantity]').waitFor();assert.equal(await page.locator('#data-form > .form-grid').innerText(),manual);
  await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);
  await page.waitForFunction(()=>!document.querySelector('#purchase-plan-checks'));
  assert.ok(submitted);if(!manager)assert.equal(submitted.kind,counting?'COUNT':'QUALITY');
  await page.locator('#create').click();assert.equal(await page.locator('#f-campaign_id').count(),0);
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS: manager/QC/count manual Create and shortcut share form; duplicated and completed sources excluded; remaining 18.5 of 20 prefilled/editable; shortcuts disappear after save; finished source unavailable in Create. Live login; all writes mocked.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
