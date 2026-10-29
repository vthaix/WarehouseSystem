const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
  const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
  try {
    const page=await browser.newPage(),errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/login');
    await page.locator('#username').fill('manager');await page.locator('#password').fill(process.env.DEMO_PASSWORD||'123456');
    await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
    const mock=(path,data)=>page.route('**/api/v1/'+path,r=>r.fulfill({json:{data}}));
    await mock('stocktake-differences',[]);await mock('lookup/qc-failed-lines',[]);
    const source={id:'9001-9002',qc_inspection_line_id:'9001',location_id:'9002',name:'Bánh thử · vị trí 9002',quantity:'0.600',passed_quantity:'0.400',failed_quantity:'0.200'};
    await mock('lookup/quarantine-lines',[source]);await mock('lookup/stock-qc-lines',[source]);
    await page.route('**/api/v1/exception-proposals*',r=>{
      if(r.request().method()==='POST') {writes.push(r.request().postDataJSON());return r.fulfill({status:201,json:{data:{id:'9003'}}});}
      return r.fulfill({json:{data:[],meta:{page:1,per_page:20,total:0,total_pages:0}}});
    });
    await page.goto(base+'/approvals/exceptions?module=exception-proposals');
    for(const [type,action,quantity] of [['QUARANTINE_DISPOSITION','RELEASE','0.400'],['QUARANTINE_DISPOSITION','SCRAP','0.200'],['QUARANTINE_DISPOSITION','RETURN_SUPPLIER','0.100'],['STOCK_QC_CORRECTION','QUARANTINE','0.100']]) {
      await page.locator('#create').click();await page.locator('#f-type').selectOption(type);
      await page.locator('#f-action').selectOption(action);await page.locator('#f-quantity').fill(quantity);
      await page.locator('#f-reason').fill('Kiểm tra giao diện kho');await page.locator('#f-resolution_note').fill('Duyệt trước thực hiện');
      await page.locator('#data-form button[type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);
      assert.deepEqual(writes.at(-1),{quarantine:true,qc_inspection_line_id:'9001',action,quantity,reason:'Kiểm tra giao diện kho',resolution_note:'Duyệt trước thực hiện',allocations:[{location_id:'9002',quantity}]});
    }
    await page.evaluate(()=>detail({code:'XL-TEST',decision_history:[{decision:'APPROVED',reason:'Đã duyệt'}],reinspections:[{result:'FAILED',note:'Lỗi đã xác nhận'}],actions:[]}));
    await assert.equal(await page.locator('#modal-body').getByRole('heading',{name:'Lịch sử phê duyệt'}).count(),1);
    await assert.equal(await page.locator('#modal-body').getByRole('heading',{name:'Lịch sử tái kiểm'}).count(),1);
    await assert.equal(await page.locator('#modal-body').getByText('Lỗi đã xác nhận',{exact:true}).count(),1);
    assert.deepEqual(errors,[]);
    console.log('WAREHOUSE EXCEPTIONS BROWSER PASS: release/scrap/posted-QC forms and payloads; writes mocked');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
