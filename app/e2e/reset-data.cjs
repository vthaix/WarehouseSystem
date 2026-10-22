const { chromium } = require("@playwright/test"), assert = require("node:assert/strict"), fs = require("node:fs");
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const executablePath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(p => fs.existsSync(p));
// Destructive endpoint is always mocked: never clear the manual-test database here.
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const errors = [];
  try {
    for (const username of ["customer", "customer2", "planner", "purchaser", "manager", "staff", "staff2", "qc", "stocktaker", "workshop", "director"]) {
      const context = await browser.newContext();
      const page = await context.newPage();
      page.on("pageerror", e => errors.push(e.message));
      let calls = 0;
      await page.route("**/api/v1/test-data/reset", route => {
        calls++;
        assert.equal(route.request().postDataJSON().confirmation, "XOA DU LIEU TEST");
        assert.ok(route.request().headers()["idempotency-key"]);
        return route.fulfill({ json: { data: { backup: "/backup/browser-mock", message: "Đã xóa dữ liệu test. Vui lòng đăng nhập lại." } } });
      });
      await page.goto(base + "/login");
      await page.locator("#username").fill(username);
      await page.locator("#password").fill(process.env.DEMO_PASSWORD || "123456");
      await page.locator("#login-form button").click();
      await page.waitForURL("**/dashboard");
      await page.waitForFunction(() => typeof api === "function" && !!user);
      assert.equal(await page.locator("#reset-test-data").count(), 1, username);
      await page.locator("#reset-test-data").click();
      await page.locator("#cancel-reset").click();
      assert.equal(calls, 0);
      if (username === "customer") {
        await page.locator("#reset-test-data").click();
        await page.locator("#reset-confirmation").fill("wrong");
        await page.locator('#test-reset-form button[type="submit"]').click();
        assert.equal(calls, 0);
        await page.locator("#reset-confirmation").fill("XOA DU LIEU TEST");
        await page.locator('#test-reset-form button[type="submit"]').click();
        await page.getByRole("link", { name: "Đăng nhập lại", exact: true }).waitFor();
        assert.equal(calls, 1);
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log("TEST RESET BROWSER PASS: button for 11 accounts, cancel, exact confirmation and success/login message; reset writes mocked.");
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
