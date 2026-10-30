const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
try{
  async function login(username){
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill(process.env.DEMO_PASSWORD||'123456');await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
    const namedRole=await page.evaluate(()=>warehouseNavigation.labels[user.roles[0]]);assert.ok(namedRole&&namedRole.length>2);assert.ok((await page.locator('.topbar .profile').textContent()).includes(namedRole));
    return {context,page,errors};
  }
  for(const username of ['manager','workshop']){
    const {context,page,errors}=await login(username);assert.equal(await page.locator('.nav-link[data-nav="warehouse-lookup"]').count(),1);assert.equal(await page.locator('.nav-link[data-nav="stocktakes"]').count(),0);
    assert.equal((await page.goto(base+'/warehouse/lookup')).status(),200);await page.waitForLoadState('networkidle');assert.deepEqual(errors,[]);
    assert.ok(await page.locator('.warehouse-slot-grid').count(),JSON.stringify(await page.evaluate(()=>({current,boot:JSON.parse(app.dataset.boot).current,root:document.querySelector('#warehouse-map')?.innerHTML,scripts:[...document.scripts].map(s=>s.src)}))));
    const real=await page.evaluate(()=>api('warehouse-lookup'));assert.ok(Array.isArray(real.data.locations));
    if(username==='workshop'){assert.equal(await page.locator('.nav-link[data-nav="items"]').count(),0);assert.equal((await page.goto(base+'/catalog/categories')).status(),403);assert.deepEqual(errors,[]);await context.close();continue;}
    const fixture={warehouses:[{id:'1',name:'Kho thành phẩm Sweet Bakery'}],warehouse_id:'1',categories:[{id:'1',name:'Bánh quy đóng gói'},{id:'2',name:'Bánh bông lan'}],as_of:'2026-10-23T03:05:00Z',locations:Array.from({length:48},(_,i)=>({id:String(i+1),code:String.fromCharCode(65+Math.floor(i/12))+(i%12+1),name:'Kệ '+String.fromCharCode(65+Math.floor(i/12))+(i%12+1),is_active:1,stock:i===0?[{lot_id:'11',item_code:'BQ-01',item_name:'Bánh quy bơ hộp 200g',lot_code:'TP-001',kind:'FINISHED_PRODUCT',category_id:'1',quantity:'10.000',reserved_quantity:'3.000',available_quantity:'7.000',quality_bucket:'AVAILABLE',unit:'hộp',expiry_date:'2026-12-31',expired:false}]:[]}))};
    await page.route('**/api/v1/warehouse-lookup*',r=>r.fulfill({json:{data:fixture}}));await page.locator('#refresh-warehouse-map').click();await page.locator('[data-location="48"]').waitFor();
    assert.ok((await page.locator('.warehouse-map-main').textContent()).includes('10:05 - 23/10/2026'));assert.equal(await page.locator('.warehouse-slot').count(),48);
    assert.ok((await page.locator('.warehouse-map-detail').textContent()).includes('Bánh quy bơ hộp 200g'));assert.ok((await page.locator('.warehouse-map-detail').textContent()).includes('31/12/2026'));
    await page.locator('[data-location="2"]').click();assert.ok((await page.locator('.warehouse-map-detail').textContent()).includes('Vị trí chưa có hàng'));
    await page.locator('[data-location="1"]').click();await page.locator('[data-category="2"]').click();assert.ok((await page.locator('.warehouse-map-detail').textContent()).includes('Không có hàng phù hợp'));
    await page.locator('[data-category=""]').click();await page.screenshot({path:'.runtime/warehouse-lookup-preview.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);await context.close();
  }
  for(const username of ['director','qc','stocktaker','customer','planner','purchaser','staff']){
    const {context,page,errors}=await login(username);assert.equal(await page.locator('.nav-link[data-nav="warehouse-lookup"]').count(),0);
    assert.equal((await page.request.get(base+'/api/v1/warehouse-lookup')).status(),403);assert.equal((await page.goto(base+'/warehouse/lookup')).status(),403);
    assert.deepEqual(errors,[]);await context.close();
  }
  console.log('WAREHOUSE LOOKUP BROWSER PASS: two authorized roles, seven denied roles, canonical UC menus, named roles, local timestamps, 48-position mock selection/category/empty states, quantities/units, no mobile overflow. All database operations read-only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
