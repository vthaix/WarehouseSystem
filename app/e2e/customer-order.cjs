const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const executablePath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(p => fs.existsSync(p));
// Creates one labeled, pending demo order through the real UI; preserves it for manual intake testing.
(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    async function login(username) {
      await page.goto(base + "/login");
      await page.locator("#username").fill(username);
      await page.locator("#password").fill(process.env.DEMO_PASSWORD || "123456");
      await page.locator("#login-form button").click();
      await page.waitForURL("**/dashboard");
    }
    await login("customer");
    await page.locator('nav a[href="/customer/orders/create"]').click();
    assert.equal(await page.locator("h1").textContent(), "Đặt bánh");
    await page.waitForFunction(() => typeof api === "function" && !!user);
    const samples = (await page.evaluate(() => api("sample-items?per_page=100"))).data;
    const cakes = ["TP-DEMO-01", "TP-DEMO-02", "TP-DEMO-03"].map(code => samples.find(p => p.code === code));
    assert.ok(cakes.every(Boolean), "All three published demo cakes available");
    assert.equal(cakes[0].unit, "hộp");
    assert.equal(cakes[1].unit, "gói");
    assert.equal(cakes[2].unit, "hộp");
    await page.locator("#order-address").fill("[TEST UC-02] Địa chỉ kiểm tra đặt bánh");
    const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    await page.locator("#order-date").fill(date);
    await page.getByRole("button", { name: "Gửi đơn đặt hàng" }).click();
    assert.match(await page.locator("#order-error").textContent(), /ít nhất một/);
    await page.locator(`#cake-${cakes[0].id}`).fill("2");
    await page.locator(`#cake-${cakes[1].id}`).fill("3");
    await page.locator(`#cake-note-${cakes[0].id}`).fill("Đóng gói riêng");
    assert.match(await page.locator("#order-total").textContent(), /156\.000/);
    await page.locator("#order-note").fill("[TEST UC-02] Đơn mẫu để tiếp nhận sau kiểm tra giao diện");
    const response = page.waitForResponse(r => r.url().endsWith("/api/v1/customer-orders") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Gửi đơn đặt hàng" }).click();
    const createdResponse = await response;
    assert.equal(createdResponse.status(), 201);
    await page.waitForURL(/\/records\/customer-orders\/\d+$/);
    await page.waitForFunction(() => typeof api === "function" && !!user);
    const order = (await page.evaluate(id => api("customer-orders/" + id), page.url().split("/").pop())).data;
    assert.equal(order.lines.length, 2);
    assert.equal(order.status, "SUBMITTED");
    assert.equal(Number(order.quoted_total), 156000);
    await page.goto(base + "/customer/orders");
    await page.waitForFunction(() => typeof editForm === "function" && !!user);
    const updated = await page.evaluate(async ({ order, cakeId }) => {
      const result = await api("customer-orders/" + order.id, "PATCH", {
        version: order.version, quantity_change_acknowledged: true,
        lines: order.lines.map(line => ({ item_id: line.item_id, quantity: line.item_id === cakeId ? "100" : "3" })),
      }, crypto.randomUUID());
      await editForm(result.data);
      return result.data;
    }, { order, cakeId: cakes[0].id });
    const cakeRow = page.locator('[data-section="lines"]').filter({ has: page.locator(`option[value="${cakes[0].id}"]:checked`) });
    assert.equal(await cakeRow.locator('[data-key="quantity"]').inputValue(), "100");
    assert.match(await cakeRow.locator("option:checked").textContent(), /hộp/);
    await page.locator('[name="quantity_change_acknowledged"]').check();
    const reload = page.waitForResponse(r => r.url().includes("/api/v1/customer-orders?") && r.request().method() === "GET");
    await page.locator('#data-form button[type="submit"]').click();
    const reloaded = await reload;
    assert.equal(reloaded.status(), 200);
    assert.equal(new URL(reloaded.url()).searchParams.has("module"), false);
    assert.equal(await page.locator("#table .error").count(), 0);
    const saved = (await page.evaluate(id => api("customer-orders/" + id), updated.id)).data;
    assert.equal(Number(saved.lines.find(line => line.item_id === cakes[0].id).quantity), 100);
    await page.evaluate(() => api("auth/logout", "POST", {}));
    await login("planner");
    const visible = await page.evaluate(id => api("customer-orders/" + id), order.id);
    assert.equal(visible.data.id, order.id);
    const forbidden = await page.goto(base + "/customer/orders/create");
    assert.equal(forbidden.status(), 403);
    assert.deepEqual(errors, []);
    console.log("PASS UC-02: create, edit quantity 100, correct units, successful list reload without module, planner visibility, role guard. Order:", order.code);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
