const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>fs.existsSync(p));
(async()=>{
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login');await page.locator('#username').fill('manager');await page.locator('#password').fill(process.env.DEMO_PASSWORD||'123456');
  await page.locator('#login-form button').click();await page.waitForURL('**/dashboard');
  assert.equal(await page.locator('.work-stat').count(),4);
  assert.equal(await page.locator('.work-hero').count(),1);
  assert.ok(await page.locator('.work-meter').count());
  assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  await page.locator('#nav-search').fill('mat hang');await page.locator('#nav-search-results a').first().waitFor();
  assert.ok((await page.locator('#nav-search-results a').allTextContents()).length>0);
  await page.locator('#nav-search').press('Escape');assert.equal(await page.locator('#nav-search-results').isVisible(),false);
  await page.locator('#sidebar-toggle').click();assert.equal(await page.locator('.sidebar').isVisible(),false);await page.locator('#sidebar-toggle').click();
  fs.mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/red-white-dashboard-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.sidebar').isVisible(),false);
  await page.locator('#sidebar-toggle').click();assert.equal(await page.locator('.sidebar').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.sidebar').isVisible(),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile page must not overflow');
  await page.screenshot({path:'artifacts/red-white-dashboard-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/products?module=items');
  await page.screenshot({path:'artifacts/red-white-products-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('ADMIN THEME BROWSER PASS: real dashboard summaries, white sidebar, accent, search, desktop collapse, mobile drawer and no overflow');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
