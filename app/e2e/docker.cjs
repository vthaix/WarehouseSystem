const { chromium } = require("@playwright/test"),
  { spawnSync } = require("node:child_process"),
  fs = require("node:fs"),
  assert = require("node:assert/strict"),
  path = require("node:path");
(async () => {
  const result = spawnSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "app",
      "node",
      "-e",
      "require('./src/config/env').loadEnv();console.log(JSON.stringify({password:process.env.DEMO_PASSWORD,dbPassword:process.env.DB_PASSWORD,dbUser:process.env.DB_USER,dbName:process.env.DB_NAME}))",
    ],
    { cwd: path.resolve(__dirname, "../.."), encoding: "utf8" },
  );
  if (result.status !== 0)
    throw new Error("Không đọc được cấu hình kiểm thử trong container.");
  const secrets = JSON.parse(result.stdout.trim());
  const executablePath =
    process.env.BROWSER_PATH ||
    [
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    ].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 1440, height: 1000 },
      }),
      page = await context.newPage();
    await page.goto(
      "http://127.0.0.1:" + (process.env.APP_PORT || 3000) + "/login",
    );
    await page.locator("#username").fill("manager");
    await page.locator("#password").fill(secrets.password);
    await page.locator("#login-form button").click();
    await page.waitForURL("**/dashboard");
    await page.goto(
      "http://127.0.0.1:" + (process.env.APP_PORT || 3000) + "/products",
    );
    assert.ok((await page.locator("#table tbody tr").count()) >= 13);
    await page.screenshot({
      path: "artifacts/docker-ejs-products.png",
      fullPage: true,
    });
    const response = await page.goto(
      "http://127.0.0.1:" + (process.env.APP_PORT || 3000) + "/customer/orders",
    );
    assert.equal(response.status(), 403);
    const interactive = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const planning = await interactive.newPage(),
      errors = [];
    planning.on("pageerror", (error) => errors.push(error.message));
    const base = "http://127.0.0.1:" + (process.env.APP_PORT || 3000);
    await planning.goto(base + "/login");
    await planning.locator("#username").fill("planner");
    await planning.locator("#password").fill(secrets.password);
    await planning.locator("#login-form button").click();
    await planning.waitForURL("**/dashboard");
    const planningUrl = require("../src/config/navigation").modules.find(
      (m) => m[0] === "business-plans",
    )[5];
    await planning.goto(base + planningUrl + "?module=business-plans");
    await planning.locator("#create").click();
    await planning.locator("#f-production_plan_id").waitFor();
    assert.equal(
      await planning
        .locator("#f-production_plan_id")
        .evaluate((el) => el.required),
      true,
    );
    await planning.locator("#f-type").selectOption("SALE");
    assert.equal(
      await planning.locator("#f-production_plan_id").isDisabled(),
      true,
    );
    assert.equal(
      await planning.locator("#f-source_request_id").isDisabled(),
      true,
    );
    await planning.locator("#f-type").selectOption("PURCHASE");
    assert.equal(
      await planning.locator("#f-production_plan_id").isDisabled(),
      false,
    );
    assert.equal(
      await planning
        .locator("#f-production_plan_id")
        .evaluate((el) => el.required),
      true,
    );
    assert.deepEqual(errors, []);
    await planning.screenshot({
      path: "artifacts/docker-purchase-source.png",
      fullPage: true,
    });
    await interactive.close();
    await page.goto("http://127.0.0.1:" + (process.env.ADMINER_PORT || 8080));
    await page.locator('input[name="auth[server]"]').fill("mysql");
    await page.locator('input[name="auth[username]"]').fill(secrets.dbUser);
    await page.locator('input[name="auth[password]"]').fill(secrets.dbPassword);
    await page.locator('input[name="auth[db]"]').fill(secrets.dbName);
    await page.locator("input[type=submit][value=Login]").click();
    await page
      .getByRole("link", { name: "LichSuCSDL", exact: true })
      .first()
      .waitFor();
    assert.ok((await page.locator("body").innerText()).includes("LichSuCSDL"));
    await page.screenshot({
      path: "artifacts/docker-adminer.png",
      fullPage: true,
    });
    console.log(
      "Docker Browser PASS: EJS without JavaScript, SQL purchase-source form with JavaScript and SALE/PURCHASE validation, access control, and Vietnamese schema in Adminer.",
    );
  } catch (error) {
    let message = String(error);
    for (const value of [secrets.password, secrets.dbPassword])
      message = message.replaceAll(value, "[redacted]");
    throw new Error(message);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
