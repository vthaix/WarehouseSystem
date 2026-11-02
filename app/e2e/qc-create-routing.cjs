const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill('qc');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  const uid=await page.evaluate(()=>user.id);
  const campaign={id:'90001',code:'QC-PLAN-TEST',campaign_type:'QUALITY_CHECK',KiemTheoKeHoach:1,KiemChatLuong:1,status:'IN_PROGRESS',assignee_ids:[String(uid)],location:'Khu kiem tra',lot_ids:[]};
  const regular={...campaign,id:'90002',code:'QC-LOT-TEST',KiemTheoKeHoach:0,lot_ids:['90003']};
  let campaigns=[campaign],saved=null;
  await page.route('**/api/v1/quality-campaigns?*',r=>r.fulfill({json:{data:campaigns}}));
  await page.route('**/api/v1/lookup/lots',r=>r.fulfill({json:{data:[{id:'90003',name:'TP-TEST / Banh quy',received_quantity:'50.000',qc_status:'PENDING'}]}}));
  await page.route('**/api/v1/quality-campaigns/90001/purchase-check',r=>{
   if(r.request().method()==='POST'){saved=r.request().postDataJSON();return r.fulfill({json:{data:{id:'90001'}}});}
   return r.fulfill({json:{data:{...campaign,version:1,can_quality:true,lines:[{purchase_order_line_id:'90004',item_name:'Bot mi',unit:'kg',planned_quantity:'17.600',received_quantity:null,passed_quantity:null,failed_quantity:null,counted_quantity:null,shelf_life_days:90,manufactured_date:'2026-11-02',expiry_date:'2027-01-31'}]}}});
  });
  const route=require('../src/config/navigation').modules.find(m=>m[0]==='qc-inspections')[5];
  await page.goto(base+route);await page.locator('#create').click();
  assert.equal(await page.locator('[data-plan-line]').count(),0);
  assert.equal(await page.locator('#f-campaign_id').inputValue(),'');
  await page.locator('#f-campaign_id').selectOption('90001');
  await page.locator('#f-qc_source_id').selectOption('90001');
  await page.locator('#data-form [type=submit]').click();
  await page.locator('[data-plan-line]').waitFor();
  assert.equal(await page.locator('#f-lot_id').count(),0);
  assert.equal(Number((await page.locator('[data-check-key=received_quantity]').inputValue()).replace(',','.')),17.6);
  await page.locator('[data-check-key=failed_quantity]').fill('1.6');
  assert.equal(Number((await page.locator('[data-check-key=passed_quantity]').inputValue()).replace(',','.')),16);
  await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);
  assert.equal(saved.kind,'QUALITY');assert.equal(Number(saved.lines[0].failed_quantity),1.6);
  campaigns=[campaign,regular];await page.locator('#create').click();await page.locator('#f-campaign_id').selectOption('90002');await page.locator('#f-qc_source_id').selectOption('90003');await page.locator('#data-form [type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#f-lot_id')?.value==='90003');
  assert.equal(Number((await page.locator('#f-inspected_quantity').inputValue()).replace(',','.')),50);
  await page.locator('#cancel').click();if(await page.locator('#modal').evaluate(e=>e.open))await page.locator('#cancel').click();
  await page.locator('#create').click();await page.locator('#f-campaign_id').selectOption('90001');await page.locator('#f-qc_source_id').selectOption('90001');await page.locator('#data-form [type=submit]').click();await page.locator('[data-plan-line]').waitFor();
  assert.ok(!/Dấu nổi bật được giữ|không cần tạo lô trước|Chưa tạo lô hoặc tăng tồn|Quản lý tạo lô phần đạt khi kết quả hoàn tất/.test(await page.locator('body').innerText()));
  assert.deepEqual(errors,[]);
  console.log('PASS: Create QC routes plan checks to editable item sheet; mixed campaigns select correct form; existing lot inspection works; no developer notices or JS errors. API fixtures and writes mocked; live QC login.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
