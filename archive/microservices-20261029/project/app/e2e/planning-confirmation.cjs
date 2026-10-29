const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const executablePath=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});try{
  const page=await browser.newPage();await page.goto((process.env.APP_URL||'http://127.0.0.1:3000')+'/login');await page.locator('#username').fill('planner');await page.locator('#password').fill('123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  for(const resource of ['production-plans','business-plans']){
    const requests=[];await page.route('**/api/v1/'+resource+'/999999',route=>{const body=route.request().postDataJSON();requests.push({body,key:route.request().headers()['idempotency-key']});return body.confirm_plan_overage===true?route.fulfill({status:200,json:{data:{saved:true}}}):route.fulfill({status:409,json:{error:{code:'PLAN_CONFIRMATION_REQUIRED',message:'Số lượng vượt nguồn. Bạn có muốn tiếp tục không?'}}});});
    await page.evaluate(r=>{openModal('Kế hoạch đang chỉnh sửa','<input id="preserved-quantity" value="150">');window.pendingConfirmation=api(r+'/999999','PATCH',{version:1,outputs:[]},'original-key');},resource);
    await page.getByRole('dialog',{name:'Số lượng vượt mức dự kiến'}).waitFor();
    assert.equal(await page.locator('[data-confirm-cancel]').evaluate(el=>el===document.activeElement),true);
    if(resource==='production-plans'){await page.screenshot({path:'e2e/planning-confirmation-desktop.png'});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'e2e/planning-confirmation-mobile.png'});}
    await page.locator('[data-confirm-accept]').click();const result=await page.evaluate(()=>window.pendingConfirmation);assert.equal(result.data.saved,true);assert.equal(requests.length,2);assert.equal(requests[0].body.confirm_plan_overage,undefined);assert.equal(requests[1].body.confirm_plan_overage,true);assert.notEqual(requests[0].key,requests[1].key);
    assert.equal(await page.locator('#modal').evaluate(el=>el.open),true);assert.equal(await page.locator('#preserved-quantity').inputValue(),'150');
    for(const cancelMode of ['button','escape','close']){
      requests.length=0;await page.evaluate(r=>{window.pendingConfirmation=api(r+'/999999','PATCH',{version:1},'cancel-key').then(()=>false,e=>e.code);},resource);
      await page.locator('.planning-confirm-dialog').waitFor();
      if(cancelMode==='escape')await page.keyboard.press('Escape');else await page.locator(cancelMode==='button'?'[data-confirm-cancel]':'.planning-confirm-close').click();
      const cancelled=await page.evaluate(()=>window.pendingConfirmation);assert.equal(cancelled,'CONFIRMATION_CANCELLED');assert.equal(requests.length,1);assert.equal(await page.locator('#preserved-quantity').inputValue(),'150');
    }
    await page.evaluate(()=>modal.close());
  }
  console.log('PLANNING CONFIRMATION BROWSER PASS: accept retries with explicit flag/new key; cancel sends no second write for production and business plans. Writes mocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
