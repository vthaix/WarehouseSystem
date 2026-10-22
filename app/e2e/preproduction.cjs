const { chromium } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const executablePath = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find((p) => fs.existsSync(p));
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    const page = await browser.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/login");
    await page.locator("#username").fill("workshop");
    await page.locator("#password").fill(process.env.DEMO_PASSWORD || "123456");
    await page.locator("#login-form button").click();
    await page.waitForURL("**/dashboard");
    await page.goto(base + "/production/plans?module=production-plans");
    const items = (await page.evaluate(() => api("lookup/items"))).data;
    const material = items.find((i) => i.kind === "MATERIAL");
    const comparison = {
      production_plan_id: "99001",
      production_plan_code: "KSX-UI-TEST",
      checked_at: new Date().toISOString(),
      has_shortage: true,
      notice: "Tồn khả dụng, không phải kiểm kê vật lý",
      outputs: [],
      lines: [
        {
          item_id: material.id,
          item_name: material.name,
          unit: "kg",
          required_quantity: "11.000",
          available_quantity: "3.000",
          shortage_quantity: "8.000",
        },
      ],
    };
    await page.route(
      "**/api/v1/production-plans/99001/material-comparison",
      (r) => r.fulfill({ json: { data: comparison } }),
    );
    await page.route("**/api/v1/lookup/production-plans", (r) =>
      r.fulfill({
        json: {
          data: [{ id: "99001", name: "KSX-UI-TEST", status: "APPROVED" }],
        },
      }),
    );
    await page.route("**/api/v1/source-imports/production-reports?*", (r) =>
      r.fulfill({ json: { data: { lines: comparison.lines } } }),
    );
    let uploads = 0,
      submitted;
    await page.route("**/api/v1/production-report-images", (r) => {
      uploads++;
      const body = r.request().postDataJSON();
      assert.match(body.data_url, /^data:image\/png;base64,/);
      return r.fulfill({
        json: {
          data: {
            image_path:
              "/images/production-reports/" +
              String(uploads).padStart(8, "0") +
              "-1111-4111-8111-111111111111.png",
          },
        },
      });
    });
    await page.route("**/api/v1/production-reports", (r) => {
      if (r.request().method() === "POST") {
        submitted = r.request().postDataJSON();
        return r.fulfill({ json: { data: { id: "99999" } } });
      }
      return r.continue();
    });
    await page.evaluate(() =>
      detail({
        id: "99001",
        code: "KSX-UI-TEST",
        status: "APPROVED",
        actions: [],
      }),
    );
    await page.locator("#compare-plan-stock").click();
    await page.locator("#material-comparison-table").waitFor();
    assert.match(
      await page.locator("#material-comparison-table").innerText(),
      /8\.000/,
    );
    await page.locator("#report-from-comparison").click();
    await page.waitForURL("**/production/reports?module=production-reports");
    await page.locator("#data-form").waitFor();
    assert.equal(
      await page.locator("#f-report_purpose").inputValue(),
      "NHU_CAU",
    );
    assert.equal(await page.locator("#f-send_to_planner").inputValue(), "true");
    assert.equal(
      await page.locator("#f-production_plan_id").inputValue(),
      "99001",
    );
    await page.locator("#capture-comparison").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#f-note")
        .value.includes("/images/production-reports/"),
    );
    await page.evaluate(() => {
      const data = new DataTransfer();
      const bytes = Uint8Array.from(
        atob(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1sAAAAASUVORK5CYII=",
        ),
        (c) => c.charCodeAt(0),
      );
      data.items.add(new File([bytes], "paste.png", { type: "image/png" }));
      document.querySelector("#f-note").dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".report-image-previews img").length === 2,
    );
    await page.locator("#f-progress_percentage").fill("10");
    await page.locator("#data-form [type=submit]").click();
    await page.waitForFunction(() => !document.querySelector("#modal").open);
    assert.equal(uploads, 2);
    assert.equal(submitted.production_plan_id, "99001");
    assert.equal(submitted.send_to_planner, true);
    assert.equal(submitted.lines[0].required_quantity, "11");
    assert.match(submitted.note, /Ảnh báo cáo/);
    assert.deepEqual(errors, []);
    async function rolePage(username) {
      const p = await browser.newPage();
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(base + "/login");
      await p.locator("#username").fill(username);
      await p.locator("#password").fill(process.env.DEMO_PASSWORD || "123456");
      await p.locator("#login-form button").click();
      await p.waitForURL("**/dashboard");
      await p.goto(base + "/production/plans?module=production-plans");
      return p;
    }
    const planner = await rolePage("planner");
    await planner.route("**/api/v1/lookup/customer-orders", (r) =>
      r.fulfill({
        json: {
          data: [{ id: "99002", name: "DH-UI-RECIPE", status: "RECEIVED" }],
        },
      }),
    );
    const finished = items.find((i) => i.kind === "FINISHED_PRODUCT");
    await planner.route("**/api/v1/source-imports/production-plans?*", (r) =>
      r.fulfill({
        json: {
          data: {
            customer_name: "Khách nhiều mặt hàng",
            delivery_address: "Địa chỉ đơn nguồn",
            latest_delivery_date: "2026-12-01",
            customer_note: "Gói riêng",
            outputs: [{ item_id: finished.id, quantity: "10.000" }],
            warnings: [],
          },
        },
      }),
    );
    await planner.route("**/api/v1/production-plans/recipe-estimate", (r) =>
      r.fulfill({
        json: {
          data: {
            description: "Công thức minh họa kiểm thử",
            formulas: [
              {
                product_name: finished.name,
                output_quantity: "10.000",
                per_unit_quantity: "0.100",
                unit: "kg",
                item_name: material.name,
              },
            ],
          },
        },
      }),
    );
    let planBody;
    await planner.route("**/api/v1/production-plans", (r) => {
      if (r.request().method() === "POST") {
        planBody = r.request().postDataJSON();
        return r.fulfill({ json: { data: { id: "99998" } } });
      }
      return r.continue();
    });
    await planner.evaluate(() => createForm());
    await planner.locator("#f-customer_order_id").selectOption("99002");
    await planner.locator("#import-outputs [data-key=quantity]").waitFor();
    assert.match(
      await planner.locator("#import-info").innerText(),
      /Địa chỉ đơn nguồn/,
    );
    assert.equal(
      await planner.locator("#f-material_source").inputValue(),
      "RECIPE",
    );
    const today = new Date().toISOString().slice(0, 10);
    await planner.locator("#f-start_date").fill(today);
    await planner.locator("#f-end_date").fill(today);
    await planner.locator("#recipe-estimate").click();
    await planner.waitForFunction(() =>
      document
        .querySelector("#recipe-result")
        .textContent.includes("Công thức minh họa"),
    );
    await planner.locator("#data-form [type=submit]").click();
    await planner.waitForFunction(() => !document.querySelector("#modal").open);
    assert.equal(planBody.material_source, "RECIPE");
    assert.equal(planBody.materials, undefined);
    const director = await rolePage("director");
    let reviewBody;
    await director.route("**/api/v1/customer-orders/99003", (r) =>
      r.fulfill({
        json: {
          data: {
            id: "99003",
            code: "DH-UI-DUYET",
            status: "RECEIVED",
            version: 7,
          },
        },
      }),
    );
    await director.route("**/api/v1/production-plans/99004/review", (r) => {
      reviewBody = r.request().postDataJSON();
      return r.fulfill({ json: { data: { id: "99003", status: "APPROVED" } } });
    });
    await director.evaluate(() =>
      actionForm(
        {
          id: "99004",
          customer_order_id: "99003",
          status: "DRAFT",
          version: 2,
        },
        "review",
      ),
    );
    await director.locator("#data-form [type=submit]").click();
    await director.waitForFunction(
      () => !document.querySelector("#modal").open,
    );
    assert.equal(reviewBody.version, 2);
    assert.equal(reviewBody.decision, "APPROVE");
    assert.deepEqual(errors, []);
    console.log(
      "PREPRODUCTION BROWSER PASS: compare plan inventory, carry comparison across navigation, shortage recipient preset, capture table, paste image and report payload; writes mocked.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
