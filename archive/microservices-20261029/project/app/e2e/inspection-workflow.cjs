const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
try{
  async function pageFor(username,resource){
    const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill(process.env.DEMO_PASSWORD||'123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
    const path=require('../src/config/navigation').modules.find(m=>m[0]===resource)[5];assert.equal((await page.goto(base+path)).status(),200);
    const counts=await page.evaluate(()=>api('function-badges'));assert.ok(Number.isInteger(counts.data.notifications));
    return {context,page,errors};
  }
  async function capture(page,path){let body;await page.route('**/api/v1/'+path,r=>{if(r.request().method()==='POST'){body=r.request().postDataJSON();return r.fulfill({status:201,json:{data:{id:'999999'}}});}return r.continue();});await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);assert.ok(body);return body;}
  {
    const {context,page,errors}=await pageFor('director','stocktakes');
    await page.route('**/api/v1/task-inspection-sources',r=>r.fulfill({json:{data:{finished_lots:[{id:'101',code:'TP-101',parts:[{id:'102',code:'BCTP-102',available:true,expected_date:'2040-01-01',lines:[{item_name:'Banh quy',quantity:'20.000'}]}]}],material_lots:[]}}}));
    const users=(await page.evaluate(()=>api('lookup/users'))).data,qc=users.find(u=>u.username==='qc'),counter=users.find(u=>u.username==='stocktaker');
    await page.evaluate(()=>createForm());await page.locator('[data-finished-part]').check();
    await page.evaluate(ids=>{const select=document.querySelector('#f-assignee_ids');for(const o of select.options)o.selected=ids.includes(o.value);select.dispatchEvent(new Event('input',{bubbles:true}));},[qc.id,counter.id]);
    assert.equal(await page.locator('#f-minute_author_id option').count(),3);await page.locator('#f-minute_author_id').selectOption(qc.id);
    const body=await capture(page,'tasks');assert.equal(body.minute_author_id,qc.id);assert.deepEqual(new Set(body.assignee_ids),new Set([qc.id,counter.id]));assert.deepEqual(errors,[]);await context.close();
  }
  {
    const {context,page,errors}=await pageFor('director','stocktakes');
    await page.route('**/api/v1/task-inspection-sources',r=>r.fulfill({json:{data:{finished_lots:[],material_lots:[{id:'PLAN:700',code:'NVL theo KH-700',expected_date:'2040-01-01',eligible_lots:[{id:'701',name:'LO-A · Bột mì · 40 kg'},{id:'702',name:'LO-B · Bột mì · 60 kg'}]}]}}}));
    const qc=(await page.evaluate(()=>api('lookup/users'))).data.find(u=>u.username==='qc');
    await page.evaluate(()=>createForm());await page.locator('#f-inspection_type').selectOption('MATERIAL');
    assert.equal(await page.locator('#inspection-material-lots option').count(),2);
    assert.equal(await page.locator('#inspection-material-lots').evaluate(el=>el.checkValidity()),false);
    await page.locator('#inspection-material-lots').selectOption('702');
    await page.evaluate(id=>{const s=document.querySelector('#f-assignee_ids');for(const o of s.options)o.selected=o.value===id;s.dispatchEvent(new Event('input',{bubbles:true}));},qc.id);
    await page.locator('#f-minute_author_id').selectOption(qc.id);
    const body=await capture(page,'tasks');assert.equal(body.material_source,'PLAN:700');assert.deepEqual(body.material_lot_ids,['702']);assert.deepEqual(errors,[]);await context.close();
  }
  {
    const {context,page,errors}=await pageFor('stocktaker','inspection-counts');
    const task={id:'201',code:'CV-201',title:'Kiem hai dong lo',version:3,actions:['recordCount'],inspection:{lots:[{id:'211',code:'LO-A',item_name:'Banh quy',received_quantity:'20.000',counted_quantity:null},{id:'212',code:'LO-B',item_name:'Banh bong lan',received_quantity:'15.000',counted_quantity:null}]}};
    await page.route('**/api/v1/inspection-counts?*',r=>r.fulfill({json:{data:[task],meta:{total:1,total_pages:1}}}));
    await page.evaluate(()=>createForm());assert.equal(await page.locator('[data-count-lot]').count(),2);
    await page.locator('[data-count-match="211"]').check();assert.equal(await page.locator('[data-count-lot="211"]').inputValue(),'20');
    await page.locator('#count-all-matched').click();assert.equal(await page.locator('[data-count-lot="212"]').inputValue(),'15');assert.equal(await page.locator('[data-count-match]:checked').count(),2);
    await page.locator('[data-count-match="212"]').uncheck();assert.equal(await page.locator('[data-count-lot="212"]').inputValue(),'');
    await page.locator('[data-count-lot="211"]').fill('0');assert.equal(await page.locator('#data-form').evaluate(f=>f.checkValidity()),false);
    assert.equal(await page.locator('[data-count-match="211"]').isChecked(),false);
    await page.locator('[data-count-lot="212"]').fill('12.5');const body=await capture(page,'tasks/201/progress');assert.deepEqual(body,{version:3,count_lines:[{lot_id:'211',counted_quantity:'0'},{lot_id:'212',counted_quantity:'12.5'}]});
    await page.route('**/api/v1/function-badges',r=>r.fulfill({json:{data:{'inspection-counts':2,notifications:3}}}));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await page.locator('.nav-link[data-nav="inspection-counts"] > .function-badge').waitFor();assert.equal(await page.locator('.nav-link[data-nav="inspection-counts"] > .function-badge').textContent(),'2');
    const color=await page.locator('.function-badge').first().evaluate(el=>getComputedStyle(el).color);assert.equal(color,'rgb(255, 255, 255)');assert.deepEqual(errors,[]);await context.close();
  }
  {
    const {context,page,errors}=await pageFor('manager','exception-proposals');
    const record={id:'LOT-301',code:'NL-301',version:2,status:'OPEN',reason:'Bao bi rach',resolution_note:'',actions:['handleMinuteException'],eligible_workshops:[{id:'1',name:'Xuong banh'}],minute_lines:[{lot_code:'LO-A',item_name:'Banh quy',system_quantity:'20',counted_quantity:'19',difference_quantity:'-1',passed_quantity:'18',failed_quantity:'2',issue:'Rach bao bi'}]};
    await page.evaluate(r=>detail(r),record);assert.equal(await page.locator('#f-resolution_note').count(),1);assert.ok((await page.locator('#modal-body').textContent()).includes('Rach bao bi'));
    await page.locator('#f-resolution_note').fill('De xuat dong goi lai');await page.locator('#request-owner-approval').check();await page.locator('#f-workshop_id').selectOption('1');
    const body=await capture(page,'exception-proposals/LOT-301/apply');assert.equal(body.request_approval,true);assert.equal(body.workshop_id,'1');assert.deepEqual(errors,[]);await context.close();
  }
  for(const [username,author]of [['qc',true],['stocktaker',false]]){
    const {context,page,errors}=await pageFor(username,'stocktake-minutes');
    await page.route('**/api/v1/quality-campaigns?*',r=>r.fulfill({json:{data:[{id:'990',code:'DOT-990',status:'COMPLETED',assigned_minute_author:author,can_create_minute:author,BienBanKetLuan:null}]}}));
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await page.waitForFunction(expected=>document.querySelector('#minute-assignment-info')?.textContent.includes(expected),author?'DOT-990':'Bạn chưa được chỉ định');
    assert.equal(await page.locator('#create').isDisabled(),!author);assert.equal(await page.locator('#table').count(),1);assert.deepEqual(errors,[]);await context.close();
  }
  for(const [username,resource]of [['qc','qc-inspections'],['workshop','exception-proposals'],['planner','production-plans'],['purchaser','purchase-orders'],['staff','tasks'],['customer','customer-orders']]){const {context,errors}=await pageFor(username,resource);assert.deepEqual(errors,[]);await context.close();}
  console.log('INSPECTION BROWSER PASS: designated author; whole-task two-lot counts with zero; manager detail opens handling/evidence/proposal; numeric white-on-red badges; live badge API for all nine actor roles. Writes mocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
