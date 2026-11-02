// Read-only regression against an environment containing a saved plan QC check.
const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const client=require('../tests/support/live-client.cjs'),base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const qc=client(base);await qc.login('qc');
 const list=await qc.call('qc-inspections?per_page=100');assert.equal(list.status,200,JSON.stringify(list));
 const row=list.data.find(r=>r.record_source==='PURCHASE_PLAN');assert.ok(row,'A saved purchase-plan QC fixture is required');
 const detail=await qc.call('qc-inspections/'+row.id);assert.equal(detail.status,200,JSON.stringify(detail));assert.ok(detail.data.lines.length);
 for(const l of detail.data.lines)assert.equal(Number(l.inspected_quantity),Number(l.passed_quantity)+Number(l.failed_quantity));
 const filtered=await qc.call('qc-inspections?status=RECORDED&q='+encodeURIComponent(row.code));assert.equal(filtered.status,200);assert.ok(filtered.data.some(r=>r.id===row.id));
 const customer=client(base);await customer.login('customer');assert.equal((await customer.call('qc-inspections/'+row.id)).status,403);
 const other=client(base);await other.login('qc3');
 const campaigns=await other.call('quality-campaigns?per_page=100');
 if(!campaigns.data.some(c=>String(c.id)===String(row.campaign_id))){assert.equal((await other.call('qc-inspections/'+row.id)).status,404);assert.ok(!(await other.call('qc-inspections?per_page=100')).data.some(r=>r.id===row.id));}
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill('qc');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  await page.goto(base+require('../src/config/navigation').modules.find(m=>m[0]==='qc-inspections')[5]);
  const tr=page.locator('#table tbody tr').filter({hasText:row.code});await tr.locator('[data-detail]').click();
  await page.locator('#modal[open] .form-section table').waitFor();
  const text=await page.locator('#modal').innerText();for(const l of detail.data.lines)assert.ok(text.includes(l.item_name));
  assert.ok(text.includes(detail.data.inspector_name));assert.deepEqual(errors,[]);
  await page.reload();await page.locator('#table tbody tr').filter({hasText:row.code}).waitFor();
  console.log('PASS: saved plan QC appears in list, filters and reload; detail contains all quantities and inspector; permission boundaries verified; live MySQL, no data writes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
