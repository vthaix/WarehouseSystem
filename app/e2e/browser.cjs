const { chromium } = require("@playwright/test");
const { createApp } = require("../src/app");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const app = createApp({ password: "browser-test-password" }),
    server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath =
    process.env.BROWSER_PATH ||
    [
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    ].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    }),
    context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  fs.mkdirSync("artifacts", { recursive: true });
  const wait = () =>
    page.waitForFunction(() => !document.querySelector("#table .loading"));
  const login = async (n) => {
    await page.goto(base + "/login");
    if (await page.locator("#logout").count())
      await page.locator("#logout").click();
    await page.locator("#username").fill(n);
    await page.locator("#password").fill("browser-test-password");
    await page.locator("#login-form button[type=submit]").click();
    await page.locator("#logout").waitFor();
  };
  const nav = async (n) => {
    await page.locator(`.sidebar [data-nav="${n}"]`).click();
    await wait();
  };
  const create = async () => {
    await page.locator("#create").click();
    await page.locator("#data-form").waitFor();
  };
  const save = async () => {
    await page.locator("#data-form button[type=submit]").click();
    await page.waitForFunction(() => !document.querySelector("#modal").open);
    await wait();
  };
  const first = () => page.locator("#table tbody tr").first();
  const detail = async () => first().locator("[data-detail]").click();
  const action = async (a) => {
    await detail();
    await page.locator(`[data-action="${a}"]`).click();
  };
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    expiry = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const stockRequest = async (
    purpose,
    sourceField,
    id,
    warehouse,
    quantity,
  ) => {
    await nav("stock-requests");
    await create();
    await page.locator("#f-purpose").selectOption(purpose);
    await page.locator("#f-" + sourceField).selectOption(id);
    await page.locator("#f-requested_date").fill(date);
    if (warehouse)
      await page.locator("#f-warehouse_id").selectOption(warehouse);
    await page.locator("#source-lines").click();
    await page.locator('[data-section="lines"]').waitFor();
    await page.locator('[data-key="quantity"]').fill(quantity);
    await save();
    return app.locals.repo.all("stock-requests").at(-1);
  };
  const dispatch = async (quantity, hour) => {
    await action("dispatch");
    await page.locator("#f-start_at").fill(date + `T${hour}:00`);
    await page
      .locator("#f-end_at")
      .fill(date + `T${String(Number(hour) + 1).padStart(2, "0")}:00`);
    await page.locator('[data-dispatch] [data-key="quantity"]').fill(quantity);
    await save();
  };
  const postTask = async (qty) => {
    await nav("tasks");
    await action("postTask");
    await page.locator('[data-allocation] [data-key="quantity"]').fill(qty);
    await save();
  };
  const quality = async (kind, lot, hour) => {
    await nav("stocktakes");
    await create();
    await page.locator("#f-campaign_type").selectOption("QUALITY_CHECK");
    await page.locator("#f-quality_kind").selectOption(kind);
    await page.locator("#f-lot_ids").selectOption(lot.id);
    await page.locator("#f-planned_date").fill(date);
    await page.locator("#f-start_at").fill(date + `T${hour}:00`);
    await page
      .locator("#f-end_at")
      .fill(date + `T${String(Number(hour) + 1).padStart(2, "0")}:00`);
    await page.locator("#f-location").fill("Khu kiểm tra " + kind);
    await save();
    return app.locals.repo.all("stocktakes").at(-1);
  };
  try {
    await page.goto(base + "/login");
    await page.locator("#login-form").waitFor();
    await page.screenshot({
      path: "artifacts/login-desktop.png",
      fullPage: true,
    });
    await login("customer");
    await nav("customer-orders");
    await create();
    await page.locator("#f-delivery_address").fill("Địa chỉ giao kiểm thử");
    await page.locator("#f-latest_delivery_date").fill(date);
    await page.locator('[data-key="quantity"]').fill("10");
    await save();
    const order = app.locals.repo.all("customer-orders").at(-1);
    await action("edit");
    await page.locator('[data-key="quantity"]').fill("12");
    await page.locator('[name="quantity_change_acknowledged"]').check();
    await save();
    await login("planner");
    await nav("customer-orders");
    await action("receive");
    await save();
    await nav("production-plans");
    await create();
    await page.locator("#f-customer_order_id").selectOption(order.id);
    await page.locator("#f-start_date").fill(date);
    await page.locator("#f-end_date").fill(date);
    await page
      .locator('[data-section="outputs"] [data-key="quantity"]')
      .fill("12");
    await page.locator('[data-section="materials"] button').click();
    await save();
    const production = app.locals.repo.all("production-plans").at(-1);
    await login("director");
    await nav("customer-orders");
    await action("review");
    await save();
    assert.equal(
      app.locals.repo.get("production-plans", production.id).status,
      "APPROVED",
    );
    await login("workshop");
    await nav("production-reports");
    await create();
    await page.locator('[data-key="available_quantity"]').fill("2");
    await page.locator('[data-key="required_quantity"]').fill("10");
    await save();
    await action("submit");
    await save();
    const report = app.locals.repo.all("production-reports").at(-1);
    const demand = await stockRequest(
      "MATERIAL_PURCHASE",
      "production_report_id",
      report.id,
      null,
      "8",
    );
    await login("planner");
    await nav("business-plans");
    await create();
    await page.locator("#f-source_request_id").selectOption(demand.id);
    await page.locator("#f-supplier_id").selectOption("1");
    await page.locator("#f-planned_date").fill(date);
    await page.locator('[data-key="unit_price"]').fill("25000");
    await save();
    const buy = app.locals.repo.all("business-plans").at(-1);
    assert.equal(buy.lines[0].quantity, "8.000");
    await login("director");
    await nav("business-plans");
    await action("review");
    await save();
    await login("purchaser");
    await nav("purchase-orders");
    await create();
    await page.locator("#f-business_plan_id").selectOption(buy.id);
    await page.locator("#f-expected_delivery_date").fill(date);
    await page.locator("#f-delivery_terms").fill("Giao tại kho");
    await save();
    const po = app.locals.repo.all("purchase-orders").at(-1);
    await login("manager");
    await nav("lots");
    await create();
    await page.locator("#f-code").fill("LO-NVL-E2E");
    await page.locator("#f-purchase_order_id").selectOption(po.id);
    await page
      .locator("#f-purchase_order_line_id")
      .selectOption(po.lines[0].id);
    await page.locator("#f-received_quantity").fill("8");
    await save();
    const material = app.locals.repo.all("lots").at(-1);
    await login("director");
    const materialQC = await quality("MATERIAL", material, "08");
    await login("qc");
    await nav("qc-inspections");
    await create();
    await page.locator("#f-campaign_id").selectOption(materialQC.id);
    await page.locator("#f-passed_quantity").fill("7");
    await page.locator("#f-failed_quantity").fill("1");
    await page.locator("#f-issue").fill("Lỗi, đã trả NCC");
    await save();
    assert.equal(
      app.locals.repo.get("lots", material.id).returned_supplier_quantity,
      "1.000",
    );
    assert.equal(app.locals.service.frozen("1"), false);
    await login("workshop");
    const receipt = await stockRequest(
      "PURCHASE_RECEIPT",
      "purchase_order_id",
      po.id,
      "1",
      "7",
    );
    await login("manager");
    await nav("stock-requests");
    await dispatch("7", "10");
    await login("staff2");
    await nav("stock-requests");
    assert.equal(await page.locator("#table tbody tr").count(), 0);
    await login("staff");
    await postTask("7");
    assert.equal(app.locals.repo.all("inventory")[0].quantity, "7.000");
    await login("manager");
    await nav("warehouse-records");
    await create();
    await page.locator("#f-stock_request_id").selectOption(receipt.id);
    await save();
    await login("workshop");
    await stockRequest(
      "PRODUCTION_ISSUE",
      "production_plan_id",
      production.id,
      "1",
      "7",
    );
    await login("manager");
    await nav("stock-requests");
    await dispatch("7", "11");
    await login("staff");
    await postTask("7");
    assert.equal(app.locals.repo.all("inventory")[0].quantity, "0.000");
    await login("workshop");
    await nav("finished-reports");
    await create();
    await page.locator("#f-completed_date").fill(date);
    await page
      .locator('[data-section="outputs"] [data-key="quantity"]')
      .fill("12");
    await page.locator('[data-key="lot_code"]').fill("LO-TP-E2E");
    await page.locator('[data-key="manufactured_date"]').fill(date);
    await page.locator('[data-key="expiry_date"]').fill(expiry);
    await page.locator('[data-key="used_quantity"]').fill("7");
    await save();
    await action("submit");
    await save();
    const finished = app.locals.repo.all("lots").at(-1);
    await login("director");
    const productQC = await quality("FINISHED_PRODUCT", finished, "12");
    await login("qc");
    await nav("qc-inspections");
    await create();
    await page.locator("#f-campaign_id").selectOption(productQC.id);
    await save();
    await login("workshop");
    await stockRequest(
      "PRODUCTION_RECEIPT",
      "production_plan_id",
      production.id,
      "2",
      "12",
    );
    await login("manager");
    await nav("stock-requests");
    await dispatch("12", "13");
    await login("staff");
    await postTask("12");
    await login("planner");
    await nav("business-plans");
    await create();
    await page.locator("#f-type").selectOption("SALE");
    await page.locator("#f-customer_order_id").selectOption(order.id);
    await page.locator("#f-customer_id").selectOption("1");
    await page.locator("#f-planned_date").fill(date);
    await page.locator('[data-key="item_id"]').selectOption("2");
    await page.locator('[data-key="quantity"]').fill("12");
    await page.locator('[data-key="unit_price"]').fill("1250000");
    await save();
    const sale = app.locals.repo.all("business-plans").at(-1);
    await login("director");
    await nav("business-plans");
    await action("review");
    await save();
    await login("workshop");
    const shipment = await stockRequest(
      "SALE_ISSUE",
      "business_plan_id",
      sale.id,
      "2",
      "12",
    );
    await login("manager");
    await nav("stock-requests");
    await dispatch("12", "14");
    await login("staff");
    await postTask("5");
    assert.equal(
      app.locals.repo.get("customer-orders", order.id).status,
      "IN_PROGRESS",
    );
    await postTask("7");
    assert.equal(
      app.locals.repo.get("customer-orders", order.id).status,
      "COMPLETED",
    );
    await login("manager");
    await nav("warehouse-records");
    await create();
    await page.locator("#f-stock_request_id").selectOption(shipment.id);
    await save();
    await page.screenshot({
      path: "artifacts/warehouse-records-desktop.png",
      fullPage: true,
    });
    await login("director");
    await nav("reports/inventory");
    await page.screenshot({
      path: "artifacts/inventory-desktop.png",
      fullPage: true,
    });
    await nav("stocktakes");
    await create();
    await page.locator("#f-planned_date").fill(date);
    await page.locator("#f-start_at").fill(date + "T08:00");
    await page.locator("#f-end_at").fill(date + "T17:00");
    await save();
    const stocktake = app.locals.repo.all("stocktakes").at(-1);
    await action("start");
    await save();
    await login("stocktaker");
    await nav("stocktakes");
    await detail();
    await page.locator("[data-count]").click();
    await page.locator("#count-form input[data-id]").fill("2");
    await page.locator("#count-form button[type=submit]").click();
    await page.waitForFunction(() =>
      document.querySelector('#count-form input[data-version="2"]'),
    );
    await page.locator("#complete-count").click();
    await page.waitForFunction(() => !document.querySelector("#modal").open);
    await nav("stocktake-minutes");
    await create();
    await page.locator("#f-stocktake_id").selectOption(stocktake.id);
    await page.locator("#f-warehouse_id").fill("1");
    await page.locator("#f-remarks").fill("Kiểm đếm thực tế 2 kg");
    await save();
    await action("submit");
    await save();
    await login("manager");
    await nav("exception-proposals");
    await create();
    await page.locator("#f-reason").fill("Thừa nguyên liệu sau đối chiếu");
    await page.locator("#f-resolution_note").fill("Điều chỉnh theo thực tế");
    await save();
    await login("director");
    await nav("exception-proposals");
    await action("review");
    await save();
    await nav("stocktakes");
    await action("close");
    await save();
    assert.equal(app.locals.service.frozen("1"), false);
    await login("manager");
    await nav("items");
    await page.screenshot({
      path: "artifacts/items-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await page.screenshot({
      path: "artifacts/items-tablet.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login("director");
    await page.screenshot({
      path: "artifacts/dashboard-desktop.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "Browser PASS: latest SRS order/production/demand/procurement/QC/dispatch/receipt/production/finished-QC/partial-delivery/warehouse-summary/stocktake workflow, ownership and tablet layout.",
    );
  } catch (e) {
    await page.screenshot({
      path: "artifacts/browser-failure.png",
      fullPage: true,
    });
    console.error(
      "Form error:",
      await page
        .locator("#form-error")
        .textContent()
        .catch(() => ""),
    );
    throw e;
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
