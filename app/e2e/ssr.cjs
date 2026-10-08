const { chromium } = require("@playwright/test");
const { createApp } = require("../src/app");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const app = createApp({ password: "ssr-browser-password" }),
    server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const executablePath =
    process.env.BROWSER_PATH ||
    [
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    ].find((p) => fs.existsSync(p));
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 1440, height: 1000 },
      }),
      page = await context.newPage();
    await page.goto(base + "/dashboard");
    assert.ok(page.url().endsWith("/login"));
    await page.locator("#username").fill("manager");
    await page.locator("#password").fill("ssr-browser-password");
    await page.locator("#login-form button").click();
    await page.waitForURL("**/dashboard");
    assert.ok(
      await page.getByRole("heading", { name: "Không gian làm việc" }).count(),
    );
    await page.goto(base + "/products/create");
    await page.locator("#code").fill("SSR-BROWSER");
    await page.locator("#name").fill("Hàng tạo bằng EJS");
    await page.locator("#reference_price").fill("15000");
    await page.getByRole("button", { name: "Lưu thông tin" }).click();
    await page.waitForURL("**/products");
    assert.ok(
      await page.getByText("Hàng tạo bằng EJS", { exact: true }).count(),
    );
    const product = app.locals.repo
      .all("items")
      .find((x) => x.code === "SSR-BROWSER");
    await page.goto(base + "/products/" + product.id + "/edit");
    await page.locator("#name").fill("Hàng đã sửa bằng EJS");
    await page.getByRole("button", { name: "Lưu thông tin" }).click();
    await page.waitForURL("**/products");
    assert.equal(product.name, "Hàng đã sửa bằng EJS");
    await page.screenshot({
      path: "artifacts/products-ejs-no-javascript.png",
      fullPage: true,
    });
    await page.locator("#logout").click();
    await page.waitForURL("**/login");
    console.log(
      "Browser SSR PASS: login, dashboard, product list/create/edit and logout work with JavaScript disabled.",
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
