const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const pool = getPool(),
  base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "",
    csrf = "";
  return {
    async call(p, method = "GET", body) {
      const r = await fetch(base + "/api/v1/" + p, {
        method,
        headers: {
          Cookie: cookie,
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const cookies = r.headers.getSetCookie();
      if (cookies.length)
        cookie = cookies.map((c) => c.split(";")[0]).join("; ");
      const data = await r.json();
      return { status: r.status, ...data };
    },
    async login(username) {
      csrf = (await this.call("auth/csrf")).data.csrf_token;
      const r = await this.call("auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(r.status, 200);
      csrf = r.data.csrf_token;
    },
    async image(p) {
      return fetch(base + p, { headers: { Cookie: cookie } });
    },
  };
}
function ok(r, status = 200) {
  assert.equal(r.status, status, JSON.stringify(r));
  return r.data;
}
(async () => {
  assert.match(process.env.DB_NAME, /^KhoHang_Acceptance_\d{8}(?:_Gateway)?$/);
  const customer = client(),
    planner = client(),
    director = client(),
    workshop = client(),
    staff = client();
  for (const [c, u] of [
    [customer, "customer"],
    [planner, "planner"],
    [director, "director"],
    [workshop, "workshop"],
    [staff, "staff"],
  ])
    await c.login(u);
  const [items] = await pool.query(
    "SELECT id,code FROM items WHERE code IN ('TP-001','TP-002','NVL-001')",
  );
  const byCode = Object.fromEntries(items.map((i) => [i.code, String(i.id)]));
  const [[w]] = await pool.query(
    "SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id WHERE u.username='workshop' LIMIT 1",
  );
  const date = require("../src/services/domain/core").today();
  const outputs = [
    { item_id: byCode["TP-001"], quantity: "100.000" },
    { item_id: byCode["TP-002"], quantity: "50.000" },
  ];
  let order = ok(
    await customer.call("customer-orders", "POST", {
      delivery_address: "PREPRODUCTION multi-product fixture",
      latest_delivery_date: date,
      note: "Hai loại bánh cùng đơn",
      lines: outputs,
    }),
    201,
  );
  assert.equal(order.lines.length, 2);
  order = ok(
    await planner.call(`customer-orders/${order.id}/receive`, "POST", {
      version: order.version,
    }),
  );
  const estimate = ok(
    await planner.call("production-plans/recipe-estimate", "POST", { outputs }),
  );
  assert.equal(
    estimate.materials.find((l) => l.item_id === byCode["NVL-001"])
      .required_quantity,
    "16.000",
  );
  const plan = ok(
    await planner.call("production-plans", "POST", {
      customer_order_id: order.id,
      workshop_id: String(w.workshop_id),
      start_date: date,
      end_date: date,
      material_source: "RECIPE",
      outputs,
    }),
    201,
  );
  assert.equal(plan.order_lines.length, 2);
  assert.equal(plan.delivery_address, "PREPRODUCTION multi-product fixture");
  assert.equal(
    plan.materials.find((l) => l.item_id === byCode["NVL-001"])
      .required_quantity,
    "17.600",
  );
  assert.equal(
    (await workshop.call("production-plans/" + plan.id)).status,
    404,
  );
  ok(
    await director.call(`production-plans/${plan.id}/review`, "POST", {
      version: plan.version,
      decision: "APPROVE",
    }),
  );
  const [[notice]] = await pool.execute(
    "SELECT COUNT(*) n FROM notifications WHERE business_key=?",
    ["plan-" + plan.id + "-approved"],
  );
  assert.ok(Number(notice.n) > 0);
  const comparison = ok(
    await workshop.call(`production-plans/${plan.id}/material-comparison`),
  );
  assert.equal(comparison.outputs.length, 2);
  assert.equal(comparison.lines.length, plan.materials.length);
  for (const l of comparison.lines) {
    const C = require("../src/services/domain/core");
    assert.equal(
      l.shortage_quantity,
      C.decimal(
        C.qty(l.required_quantity) > C.qty(l.available_quantity, false)
          ? C.qty(l.required_quantity) - C.qty(l.available_quantity, false)
          : 0n,
      ),
    );
  }
  assert.equal(
    (await staff.call(`production-plans/${plan.id}/material-comparison`))
      .status,
    403,
  );
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1sAAAAASUVORK5CYII=";
  assert.equal(
    (
      await staff.call("production-report-images", "POST", {
        data_url: "data:image/png;base64," + png,
      })
    ).status,
    403,
  );
  const image = ok(
    await workshop.call("production-report-images", "POST", {
      data_url: "data:image/png;base64," + png,
    }),
    201,
  );
  const report = ok(
    await workshop.call("production-reports", "POST", {
      production_plan_id: plan.id,
      report_purpose: "NHU_CAU",
      progress_percentage: "0",
      send_to_planner: false,
      note: "Thiếu NVL\n![Ảnh báo cáo](" + image.image_path + ")",
      lines: comparison.lines.map((l) => ({
        item_id: l.item_id,
        required_quantity: "999.000",
      })),
    }),
    201,
  );
  const imagePath = `/api/v1/production-reports/${report.id}/images/${image.image_path.split("/").at(-1)}`;
  assert.equal((await planner.image(imagePath)).status, 404);
  assert.equal((await director.image(imagePath)).status, 200);
  const sent = ok(
    await workshop.call(`production-reports/${report.id}/submit`, "POST", {
      version: report.version,
    }),
  );
  assert.equal(sent.send_to_planner, true);
  assert.equal((await planner.image(imagePath)).status, 200);
  assert.equal((await staff.image(imagePath)).status, 403);
  const [[supplier]] = await pool.query(
    "SELECT id FROM suppliers WHERE is_active=1 ORDER BY id LIMIT 1",
  );
  const buy = ok(
    await planner.call("business-plans", "POST", {
      type: "PURCHASE",
      production_report_id: report.id,
      supplier_id: String(supplier.id),
      planned_date: date,
      lines: [
        {
          item_id: comparison.lines[0].item_id,
          quantity: "1.000",
          unit_price: "1000.0000",
        },
      ],
    }),
    201,
  );
  ok(
    await director.call(`business-plans/${buy.id}/review`, "POST", {
      version: buy.version,
      decision: "APPROVE",
    }),
  );
  const [[purchaseNotice]] = await pool.execute(
    "SELECT COUNT(*) n FROM notifications WHERE business_key=?",
    ["buy-plan-" + buy.id + "-approved"],
  );
  assert.ok(Number(purchaseNotice.n) > 0);
  assert.equal(
    (
      await workshop.call("production-report-images", "POST", {
        data_url: "data:image/svg+xml;base64,PHN2Zz4=",
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await workshop.call("production-reports", "POST", {
        production_plan_id: plan.id,
        report_purpose: "TIEN_DO",
        note: "![Ảnh](/images/production-reports/00000000-0000-4000-8000-000000000000.png)",
        send_to_planner: false,
      })
    ).status,
    422,
  );
  const incident = ok(
    await workshop.call("production-reports", "POST", {
      production_plan_id: plan.id,
      report_purpose: "SU_CO",
      progress_percentage: "35",
      note: "Máy đóng gói hỏng",
      send_to_planner: false,
    }),
    201,
  );
  ok(
    await workshop.call(`production-reports/${incident.id}/submit`, "POST", {
      version: incident.version,
    }),
  );
  assert.equal(
    (await planner.call("production-reports/" + incident.id)).status,
    404,
  );
  console.log(
    "PREPRODUCTION SQL PASS: multi-item order, recipe multiplication/reserve once, full source details, approval notification, stock comparison, image upload/access, automatic shortage sharing and private incidents.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closePool);
