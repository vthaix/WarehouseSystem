const { chromium } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const executablePath =
  process.env.BROWSER_PATH ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find((p) => fs.existsSync(p));
// Browser uses synthetic source documents; SQL acceptance tests validate the real writes.
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    async function pageFor(username, resource) {
      const context = await browser.newContext(),
        page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/login");
      await page.locator("#username").fill(username);
      await page
        .locator("#password")
        .fill(process.env.DEMO_PASSWORD || "123456");
      await page.locator("#login-form button").click();
      await page.waitForURL("**/dashboard");
      const url = require("../src/config/navigation").modules.find(
        (m) => m[0] === resource,
      )[5];
      assert.equal(
        (await page.goto(base + url + "?module=" + resource)).status(),
        200,
      );
      await page.waitForFunction(() => typeof api === "function");
      const items = (await page.evaluate(() => api("lookup/items"))).data,
        material = items.find((i) => i.kind === "MATERIAL"),
        finished = items.find((i) => i.kind === "FINISHED_PRODUCT");
      assert.ok(material && finished);
      return { context, page, errors, material, finished };
    }
    const mock = (page, path, data) =>
      page.route("**/api/v1/" + path, (r) => r.fulfill({ json: { data } }));
    async function capture(page, path) {
      let payload;
      await page.route("**/api/v1/" + path, (r) => {
        if (r.request().method() === "POST") {
          payload = r.request().postDataJSON();
          return r.fulfill({ json: { data: { id: "999999" } } });
        }
        return r.continue();
      });
      return async () => {
        const invalid = await page
          .locator("#data-form")
          .evaluate((f) =>
            [...f.elements]
              .filter((e) => !e.checkValidity())
              .map((e) => ({ name: e.name, value: e.value })),
          );
        assert.deepEqual(invalid, []);
        await page.locator("#data-form [type=submit]").click();
        await page.waitForFunction(
          () => !document.querySelector("#modal").open,
        );
        assert.ok(payload);
        return payload;
      };
    }
    {
      const { context, page, errors, finished } = await pageFor(
        "planner",
        "production-plans",
      );
      await mock(page, "lookup/customer-orders", [
        { id: "901", name: "ORDER-UI", status: "RECEIVED" },
        { id: "902", name: "ORDER-NEW", status: "RECEIVED" },
      ]);
      await page.route(
        "**/api/v1/source-imports/production-plans?*",
        async (r) => {
          const id = new URL(r.request().url()).searchParams.get("source_id");
          if (id === "901")
            await new Promise((resolve) => setTimeout(resolve, 250));
          return r.fulfill({
            json: {
              data: {
                source_code: "ORDER-" + id,
                outputs: [
                  {
                    item_id: finished.id,
                    quantity: id === "901" ? "2.000" : "3.000",
                  },
                ],
                warnings: [],
              },
            },
          });
        },
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-customer_order_id").selectOption("901");
      await page.locator("#f-customer_order_id").selectOption("902");
      await page.waitForFunction(
        () =>
          document.querySelector("[data-section=outputs] [data-key=quantity]")
            ?.value === "3.000",
      );
      await page.waitForTimeout(350);
      assert.equal(
        await page
          .locator("[data-section=outputs] [data-key=quantity]")
          .inputValue(),
        "3.000",
      );
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, material } = await pageFor(
        "workshop",
        "production-reports",
      );
      await mock(page, "lookup/production-plans", [
        { id: "901", code: "PLAN-UI", status: "APPROVED" },
      ]);
      await page.route("**/api/v1/source-imports/production-reports?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "PLAN-UI",
              lines: [{ item_id: material.id, required_quantity: "5.500" }],
              warnings: ["No second reserve"],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-report_purpose").selectOption("NHU_CAU");
      await page.locator("#f-production_plan_id").selectOption("901");
      await page.waitForFunction(
        () =>
          document.querySelector("[data-key=required_quantity]")?.value ===
          "5.500",
      );
      await page.locator("#f-report_purpose").selectOption("SU_CO");
      assert.equal(
        await page.locator("[data-key=required_quantity]").count(),
        0,
      );
      assert.equal(
        await page.locator("#f-send_to_planner").inputValue(),
        "false",
      );
      await page.locator("#f-note").fill("Packaging machine stopped");
      await page.locator("#f-progress_percentage").fill("35.50");
      const submit = await capture(page, "production-reports");
      const body = await submit();
      assert.equal(body.report_purpose, "SU_CO");
      assert.equal(body.send_to_planner, false);
      assert.equal(body.lines, undefined);
      assert.equal(body.progress_percentage, "35.50");
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, material } = await pageFor(
        "purchaser",
        "purchase-orders",
      );
      await mock(page, "source-imports/purchase-report-options", [
        { id: "901", name: "REPORT-UI" },
      ]);
      await mock(page, "lookup/business-plans", [
        { id: "902", code: "BUY-UI", type: "PURCHASE" },
      ]);
      await mock(page, "business-plans/902", {
        id: "902",
        lines: [
          {
            id: "903",
            item_id: material.id,
            item_name: "Flour",
            quantity: "2.000",
            unit_price: "10.0000",
          },
        ],
      });
      await page.route("**/api/v1/source-imports/purchase-orders?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "REPORT-UI",
              lines: [
                { item_id: material.id, quantity: "3.000", unit_price: "0" },
              ],
              warnings: [],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-source_mode").selectOption("REPORT");
      await page.locator("#f-production_report_id").selectOption("901");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "3.000",
      );
      await page.locator("#f-source_mode").selectOption("PLAN");
      await page.locator("#f-business_plan_id").selectOption("902");
      await page.waitForFunction(
        () =>
          document.querySelector("[data-key=unit_price]")?.value === "10.0000",
      );
      assert.equal(
        await page.locator("[data-key=item_id]").inputValue(),
        "903",
      );
      await page.locator("#f-source_mode").selectOption("MANUAL");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "1",
      );
      await page.locator("[data-key=item_id]").selectOption(material.id);
      await page.locator("[data-key=quantity]").fill("2.000");
      await page.locator("[data-key=unit_price]").fill("3.4567");
      await page.locator("#f-expected_delivery_date").fill("2026-12-20");
      await page.locator("#f-delivery_terms").fill("Manual buying");
      const submit = await capture(page, "purchase-orders");
      const body = await submit();
      assert.equal(body.source_mode, "MANUAL");
      assert.equal(body.production_report_id, undefined);
      assert.equal(body.business_plan_id, undefined);
      assert.equal(body.lines[0].quantity, "2.000");
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors } = await pageFor("manager", "lots");
      await mock(page, "lookup/purchase-order-lines", [
        { id: "902", purchase_order_id: "901", name: "BUY-UI / Flour" },
      ]);
      await page.route("**/api/v1/source-imports/lots?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "BUY-UI",
              lines: [
                { item_id: "902", quantity: "2.000", item_name: "Flour" },
              ],
              warnings: [],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-purchase_order_id").selectOption("901");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "2.000",
      );
      await page.locator("#f-code").fill("LOT-UI");
      const submit = await capture(page, "lots");
      const body = await submit();
      assert.equal(body.lines[0].purchase_order_line_id, "902");
      assert.equal(body.lines[0].received_quantity, "2.000");
      assert.equal(body.purchase_order_id, undefined);
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, material, finished } = await pageFor(
        "workshop",
        "stock-requests",
      );
      const workshopId = await page.evaluate(() => user.workshop_ids[0]);
      await mock(page, "lookup/production-plans", [
        { id: "901", code: "PLAN-UI", status: "APPROVED" },
      ]);
      await mock(page, "lookup/production-reports", [
        { id: "902", code: "REPORT-UI", status: "SUBMITTED" },
      ]);
      await mock(page, "lookup/finished-reports", [
        { id: "903", code: "FIN-UI", status: "SUBMITTED" },
      ]);
      await mock(page, "lookup/business-plans", [
        { id: "904", code: "SALE-UI", type: "SALE", finished_report_id: "903" },
      ]);
      await mock(page, "lookup/purchase-orders", [
        { id: "905", code: "BUY-UI", status: "PENDING" },
      ]);
      await page.route("**/api/v1/source-imports/stock-requests?*", (r) => {
        const params = new URL(r.request().url()).searchParams,
          purpose = params.get("purpose");
        return r.fulfill({
          json: {
            data: {
              source_code: "SOURCE-UI",
              workshop_id: workshopId,
              lines: [
                {
                  item_id: purpose === "SALE_ISSUE" ? finished.id : material.id,
                  quantity:
                    purpose === "SALE_ISSUE"
                      ? "1.000"
                      : purpose === "PURCHASE_RECEIPT"
                        ? "2.000"
                        : "5.500",
                },
              ],
              warnings: [],
              evidence:
                purpose === "SALE_ISSUE"
                  ? [
                      {
                        lot_code: "FIN-LOT",
                        qc_status: "PASSED",
                        available_quantity: "1.000",
                        stocktake: { code: "COUNT-UI", status: "CLOSED" },
                      },
                    ]
                  : [],
            },
          },
        });
      });
      await page.evaluate(() => createForm());
      await page.locator("#f-production_plan_id").selectOption("901");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "5.500",
      );
      assert.equal(
        await page.locator("#f-production_report_id").isVisible(),
        false,
      );
      await page.locator("#f-purpose").selectOption("SALE_ISSUE");
      await page.locator("#f-finished_report_id").selectOption("903");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "1.000",
      );
      assert.equal(
        await page.locator("#f-business_plan_id").inputValue(),
        "904",
      );
      assert.ok(
        (await page.locator("#import-info").innerText()).includes("COUNT-UI"),
      );
      await page.locator("#f-purpose").selectOption("PURCHASE_RECEIPT");
      await page.locator("#f-purchase_order_id").selectOption("905");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "2.000",
      );
      const submit = await capture(page, "stock-requests");
      const body = await submit();
      assert.equal(body.purpose, "PURCHASE_RECEIPT");
      assert.equal(body.purchase_order_id, "905");
      assert.equal(body.business_plan_id, undefined);
      assert.equal(body.production_plan_id, undefined);
      assert.equal(body.finished_report_id, undefined);
      assert.equal(body.production_source_mode, undefined);
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, finished } = await pageFor(
        "workshop",
        "stock-requests",
      );
      await mock(page, "lookup/production-plans", [
        { id: "9901", code: "PARTIAL-PLAN", status: "APPROVED" },
      ]);
      const workshopId=await page.evaluate(()=>user.workshop_ids[0]);
      await mock(page, "production-plans/9901", {
        id: "9901",
        workshop_id: workshopId,
        outputs: [{ item_id: finished.id, quantity: "2.000" }],
      });
      await page.locator("#create").click();
      await page
        .locator("#f-purpose")
        .selectOption("PARTIAL_PRODUCTION_RECEIPT");
      await page.locator("#f-production_plan_id").selectOption("9901");
      await page.locator('#lines-rows [data-key="quantity"]').fill("0.750");
      assert.equal(
        await page
          .locator('#lines-rows [data-key="manufactured_date"]')
          .getAttribute("type"),
        "date",
      );
      assert.equal(
        await page.locator("#f-production_report_id").isDisabled(),
        true,
      );
      let body;
      await page.route("**/api/v1/stock-requests", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: { id: "9902" } }),
        });
      });
      await page.locator("#data-form button[type=submit]").click();
      try {await page.waitForFunction(() => !document.querySelector("#modal").open,{}, {timeout:5000});} catch(e) {throw Error(JSON.stringify({body,errors,invalid:await page.locator('#data-form').evaluate(f=>[...f.elements].filter(e=>!e.checkValidity()).map(e=>({name:e.name,value:e.value}))),form_error:await page.locator('#form-error').innerText()}));}
      assert.equal(body.purpose, "PRODUCTION_RECEIPT");
      assert.equal(body.production_source_mode, "MANUAL");
      assert.equal(body.production_plan_id, "9901");
      assert.ok(body.receipt_key);
      assert.equal(body.production_report_id, undefined);
      assert.equal(body.lines[0].quantity, "0.750");
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, finished } = await pageFor(
        "workshop",
        "finished-reports",
      );
      await mock(page, "lookup/production-plans", [
        { id: "9901", code: "PARTIAL-PLAN", status: "APPROVED" },
      ]);
      await mock(page, "source-imports/finished-reports?*", {
        source_code: "PARTIAL-PLAN",
        production_plan_id: "9901",
        outputs: [
          {
            item_id: finished.id,
            lot_code: "TP-DOT-9902",
            quantity: "0.750",
            manufactured_date: "2026-10-13",
            expiry_date: null,
          },
        ],
        warnings: ["Keep existing batches"],
      });
      await page.locator("#create").click();
      await page.locator("#f-production_plan_id").selectOption("9901");
      await page.locator('#outputs-rows [data-key="lot_code"]').waitFor();
      assert.equal(
        await page.locator('#outputs-rows [data-key="lot_code"]').inputValue(),
        "TP-DOT-9902",
      );
      assert.equal(await page.locator("#materials-rows .line-row").count(), 0);
      await page.locator("#final-completed").check();
      let body;
      await page.route("**/api/v1/finished-reports", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: { id: "9903" } }),
        });
      });
      await page.locator("#data-form button[type=submit]").click();
      await page.waitForFunction(() => !document.querySelector("#modal").open);
      assert.equal(body.production_completed, true);
      assert.equal(body.outputs[0].lot_code, "TP-DOT-9902");
      assert.deepEqual(body.materials, []);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log(
      "SOURCE IMPORT BROWSER PASS: order/plan/report imports, stale response, purchase mode reset, receipt source and two dispatch purposes; writes mocked",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
