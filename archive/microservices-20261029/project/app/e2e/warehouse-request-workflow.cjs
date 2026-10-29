const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
try{
  async function pageFor(username,resource){const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill(process.env.DEMO_PASSWORD||'123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');const path=require('../src/config/navigation').modules.find(m=>m[0]===resource)[5];assert.equal((await page.goto(base+path)).status(),200);return {context,page,errors};}
  const mock=(page,path,data)=>page.route('**/api/v1/'+path,r=>r.fulfill({json:{data}}));
  async function capture(page,path){let body;await page.route('**/api/v1/'+path,r=>{if(r.request().method()==='POST'){body=r.request().postDataJSON();return r.fulfill({status:201,json:{data:{id:'999999'}}});}return r.continue();});await page.locator('#data-form [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);assert.ok(body);return body;}
  {
    const {context,page,errors}=await pageFor('workshop','stock-requests');const workshopId=await page.evaluate(()=>user.workshop_ids[0]);
    const items=(await page.evaluate(()=>api('lookup/items'))).data,material=items.find(i=>i.kind==='MATERIAL'),finished=items.find(i=>i.kind==='FINISHED_PRODUCT');
    await mock(page,'stock-request-workflow-sources',{workshops:[{id:workshopId,code:'XUONG-01',name:'Workshop ahtor'}],purchase_plans:[{id:'901',code:'KH-MUA-901',workshop_id:workshopId}],finished_reports:[{id:'903',code:'BC-TP-903',workshop_id:workshopId}],production_plans:[{id:'904',code:'KH-SX-904',workshop_id:workshopId,status:'APPROVED'},{id:'905',code:'KH-SX-905',workshop_id:workshopId,status:'COMPLETED'}],sale_plans:[{id:'906',code:'KH-BAN-906',production_plan_id:'905'}]});
    await page.route('**/api/v1/source-imports/stock-requests?*',r=>{const query=new URL(r.request().url()).searchParams,purpose=query.get('purpose');assert.equal(query.get('workflow_source'),'true');const item=['SALE_ISSUE','PRODUCTION_RECEIPT'].includes(purpose)?finished:material;return r.fulfill({json:{data:{source_code:'NGUON-TEST',workshop_id:workshopId,lines:[{item_id:item.id,quantity:'10.000'}],source_lots:[{lot_code:'LO-TEST',item_name:item.name,qc_status:'PASSED',passed_quantity:'10.000'}],warnings:[],evidence:[]}}});});
    for(const [direction,purpose,source]of [['IN','PURCHASE_RECEIPT','901'],['IN','PRODUCTION_RECEIPT','903'],['OUT','PRODUCTION_ISSUE','904'],['OUT','SALE_ISSUE','905']]){
      await page.evaluate(()=>createForm());assert.equal(await page.locator('#f-workshop_id').isDisabled(),true);assert.equal(await page.locator('#f-workshop_id option:checked').textContent(),'XUONG-01 \u00b7 Workshop ahtor');await page.locator('#f-request_direction').selectOption(direction);await page.locator('#f-purpose').selectOption(purpose);await page.locator('#f-workflow_source_id').selectOption(source);await page.locator('#request-lines-rows [data-key="quantity"]').waitFor();
      assert.equal(await page.locator('#request-lines-rows [data-key="quantity"]').inputValue(),'10');await page.locator('#f-requested_at').fill('2040-01-01T10:30');
      const body=await capture(page,'stock-requests');assert.equal(body.purpose,purpose);assert.equal(body.workflow_source_id,source);assert.equal(body.requested_at,'2040-01-01T03:30:00.000Z');assert.equal(body.requested_date,'2040-01-01');assert.equal(body.lines[0].quantity,'10');
      assert.equal(body.purchase_order_id,undefined);if(purpose==='SALE_ISSUE')assert.equal(body.sale_plan_id,'906');
    }
    assert.deepEqual(errors,[]);await context.close();
  }
  const request={id:'7000',code:'YCK-7000',version:3,type:'IN',purpose:'PURCHASE_RECEIPT',requested_date:'2040-01-01',requested_at:'2040-01-01T03:30:00.000Z'};
  const line={id:'7001',item_name:'Bot mi',remaining_quantity:'10.000',unit:'kg',lots:[{id:'7002',code:'LO-NVL',qc_status:'PASSED',passed_quantity:'10.000',posted_quantity:'0.000'}],locations:[{id:'7003',name:'Ke A'}],balances:[]};
  {
    const {context,page,errors}=await pageFor('manager','stock-requests');await mock(page,'stock-requests/7000/allocations',{request,frozen:false,lines:[line],allocations:[]});
    await page.evaluate(r=>dispatchForm(r),request);assert.equal(await page.locator('#f-start_at').inputValue(),'2040-01-01T10:30');assert.equal(await page.locator('[data-dispatch] [data-key="quantity"]').inputValue(),'10');
    const body=await capture(page,'stock-requests/7000/dispatch');assert.equal(body.start_at,'2040-01-01T03:30:00.000Z');assert.equal(body.allocations[0].quantity,'10');assert.deepEqual(errors,[]);await context.close();
  }
  {
    const {context,page,errors}=await pageFor('staff','tasks');const userId=await page.evaluate(()=>String(user.id));
    const allocation={id:'7004',stock_request_line_id:'7001',task_id:'7005',user_id:userId,lot_id:'7002',location_id:'7003',quantity:'10.000',posted_quantity:'0.000'};
    await mock(page,'stock-requests/7000/allocations?task_id=7005',{request:{...request,version:4},frozen:false,lines:[line],allocations:[allocation]});
    await page.evaluate(r=>postForm(r),{...request,assigned_task_id:'7005'});assert.equal(await page.locator('[data-actual-quantity]').inputValue(),'10');await page.locator('[data-actual-quantity]').fill('8');await page.locator('#f-note').fill('Phieu giay NK-001');
    const body=await capture(page,'stock-documents');assert.equal(body.allocations[0].quantity,'8');assert.equal(body.allocations[0].allocation_id,'7004');assert.equal(body.task_id,'7005');assert.equal(body.note,'Phieu giay NK-001');
    await mock(page,'stock-requests/7000/allocations?task_id=7005',{request:{...request,version:5},frozen:false,lines:[line],allocations:[{...allocation,posted_quantity:'8.000'}]});
    await page.evaluate(r=>postForm(r),{...request,assigned_task_id:'7005'});assert.equal(await page.locator('[data-actual-quantity]').inputValue(),'2');assert.deepEqual(errors,[]);await context.close();
  }
  console.log('WAREHOUSE REQUEST BROWSER PASS: all four sources, execution datetime, manager allocation defaults, employee actual quantity edits and remaining assignment; writes mocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
