const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill('stocktaker');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  const uid=await page.evaluate(()=>user.id);
  const campaign={id:'90001',code:'KK-PLAN-TEST',campaign_type:'QUALITY_CHECK',KiemTheoKeHoach:1,KiemSoLuong:1,status:'IN_PROGRESS',assignee_ids:[String(uid)],source_plan_id:'90002',source_code:'KH-MUA-TEST'};
  const task={id:'90005',code:'CV-KK-TEST',title:'Kiem ke NVL',status:'IN_PROGRESS',start_at:'2026-11-02T00:00:00Z',version:1,inspection:campaign,inspection_lots:[],actions:['recordCount']};
  const line={purchase_order_line_id:'90004',item_name:'Bot mi',unit:'kg',planned_quantity:'20.000',counted_quantity:null,received_quantity:null};let sent;
  await page.route('**/api/v1/quality-campaigns?*',r=>r.fulfill({json:{data:[campaign]}}));
  await page.route('**/api/v1/inspection-counts?*',r=>r.fulfill({json:{data:[task],meta:{total:1,total_pages:1,page:1}}}));
  await page.route('**/api/v1/inspection-counts/90005',r=>r.fulfill({json:{data:task}}));
  await page.route('**/api/v1/quality-campaigns/90001/purchase-check',r=>{
   if(r.request().method()==='POST'){
    sent=r.request().postDataJSON();line.counted_quantity=sent.lines[0].counted_quantity;task.actions=[];
    task.inspection_lots=[{item_name:line.item_name,unit:'kg',planned_quantity:'20.000',counted_quantity:line.counted_quantity,counted_by_name:'Nhan vien kiem ke',counted_at:new Date().toISOString()}];
   }
   return r.fulfill({json:{data:{...campaign,version:1,can_count:true,can_quality:false,lines:[line]}}});
  });
  await page.goto(base+'/inspection-counts');await page.locator('#create').click();
  assert.equal(await page.locator('[data-plan-line]').count(),0);
  await page.locator('#f-campaign_id').selectOption('90001');await page.locator('#f-qc_source_id').selectOption('90002');await page.locator('#data-form [type=submit]').click();
  await page.locator('[data-check-key=counted_quantity]').fill('18,5');await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);
  assert.equal(sent.kind,'COUNT');assert.equal(Number(sent.lines[0].counted_quantity),18.5);
  await page.locator('#table [data-detail]').click();await page.locator('#modal[open] .form-section table').waitFor();
  assert.ok((await page.locator('#modal').innerText()).includes('18,5'));assert.ok((await page.locator('#modal').innerText()).includes('Nhan vien kiem ke'));
  await page.reload();await page.evaluate(()=>loadTable());await page.locator('#table [data-detail]').click();await page.locator('#modal[open] .form-section table').waitFor();assert.ok((await page.locator('#modal').innerText()).includes('18,5'));
  assert.deepEqual(errors,[]);
  console.log('PASS: stocktaker selects campaign/source before count sheet; COUNT submission uses decimal normalization; saved details and reload display counts and counter. API fixtures/writes mocked; live login.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
