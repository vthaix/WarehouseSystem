const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");

const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "", csrf = "";
  async function call(path, method = "GET", body, key) {
    const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { "X-CSRF-Token": csrf } : {}), ...(key ? { "Idempotency-Key": key } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return { status: response.status, ...(await response.json()) };
  }
  return { call, async login(username) {
    csrf = (await call("/api/v1/auth/csrf")).data.csrf_token;
    const result = await call("/api/v1/auth/login", "POST", { username, password: process.env.DEMO_PASSWORD });
    assert.equal(result.status, 200, JSON.stringify(result));
    csrf = result.data.csrf_token;
  } };
}

(async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true") throw new Error("Production smoke chỉ chạy với dữ liệu demo ngoài production.");
  const pool = getPool();
  let orderId, planId, productionId, finishedId, lotId, reviewKey;
  try {
    const customer = client(), planner = client(), director = client(), workshop = client();
    await customer.login("customer");
    const samples = await customer.call("/api/v1/sample-items");
    const item = samples.data[0];
    assert.ok(item);
    const [materials] = await pool.execute("SELECT id FROM items WHERE kind='MATERIAL' AND is_active=1 LIMIT 1");
    assert.ok(materials.length);
    const delivery = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const created = await customer.call("/api/v1/customer-orders", "POST", { delivery_address: "Kiểm thử sản xuất", latest_delivery_date: delivery, lines: [{ item_id: item.id, quantity: "2.000" }] });
    assert.equal(created.status, 201, JSON.stringify(created));
    orderId = created.data.id;
    await planner.login("planner");
    const received = await planner.call(`/api/v1/customer-orders/${orderId}/receive`, "POST", { version: created.data.version });
    assert.equal(received.status, 200, JSON.stringify(received));
    const plan = await planner.call("/api/v1/production-plans", "POST", { customer_order_id: orderId, workshop_id: "1", start_date: delivery, end_date: delivery, outputs: [{ item_id: item.id, quantity: "2.000" }], materials: [] });
    assert.equal(plan.status, 201, JSON.stringify(plan));
    planId = plan.data.id;
    await director.login("director");
    reviewKey = crypto.randomUUID();
    const approved = await director.call(`/api/v1/customer-orders/${orderId}/review`, "POST", { version: received.data.version, decision: "APPROVE" }, reviewKey);
    assert.equal(approved.status, 200, JSON.stringify(approved));
    await workshop.login("workshop");
    const production = await workshop.call("/api/v1/production-reports", "POST", { production_plan_id: planId, lines: [{ item_id: String(materials[0].id), available_quantity: "1.000", required_quantity: "3.000" }] });
    assert.equal(production.status, 201, JSON.stringify(production));
    productionId = production.data.id;
    assert.equal(production.data.lines[0].shortage_quantity, "2.000");
    const submitted = await workshop.call(`/api/v1/production-reports/${productionId}/submit`, "POST", { version: production.data.version });
    assert.equal(submitted.status, 200, JSON.stringify(submitted));
    assert.equal(submitted.data.status, "SUBMITTED");
    const code = "FIN-TEST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const finished = await workshop.call("/api/v1/finished-reports", "POST", { production_plan_id: planId, completed_date: delivery, outputs: [{ item_id: item.id, lot_code: code, quantity: "2.000", manufactured_date: delivery }], materials: [{ item_id: String(materials[0].id), used_quantity: "1.000" }] });
    assert.equal(finished.status, 201, JSON.stringify(finished));
    finishedId = finished.data.id;
    lotId = finished.data.outputs[0].lot_id;
    const over = await workshop.call("/api/v1/finished-reports", "POST", { production_plan_id: planId, completed_date: delivery, outputs: [{ item_id: item.id, lot_code: code + "-OVER", quantity: "1.000", manufactured_date: delivery }], materials: [] });
    assert.equal(over.status, 422);
    const done = await workshop.call(`/api/v1/finished-reports/${finishedId}/submit`, "POST", { version: finished.data.version });
    assert.equal(done.status, 200, JSON.stringify(done));
    assert.equal(done.data.status, "SUBMITTED");
    const [balances] = await pool.execute("SELECT id FROM inventory_balances WHERE lot_id=?", [lotId]);
    assert.equal(balances.length, 0);
    console.log("PRODUCTION PASS: material report, shortage, finished lot, source limit, submit, no inventory posting.");
  } finally {
    try {
      if (finishedId) {
        await pool.execute("DELETE FROM finished_report_outputs WHERE finished_report_id=?", [finishedId]);
        await pool.execute("DELETE FROM finished_report_materials WHERE finished_report_id=?", [finishedId]);
        await pool.execute("DELETE FROM finished_reports WHERE id=?", [finishedId]);
      }
      if (lotId) await pool.execute("DELETE FROM lots WHERE id=?", [lotId]);
      if (productionId) {
        await pool.execute("DELETE FROM production_report_lines WHERE production_report_id=?", [productionId]);
        await pool.execute("DELETE FROM production_reports WHERE id=?", [productionId]);
      }
      if (planId) {
        await pool.execute("DELETE FROM production_plan_materials WHERE production_plan_id=?", [planId]);
        await pool.execute("DELETE FROM production_plan_outputs WHERE production_plan_id=?", [planId]);
        await pool.execute("DELETE FROM production_plans WHERE id=?", [planId]);
      }
      if (orderId) {
        await pool.execute("DELETE FROM customer_order_lines WHERE customer_order_id=?", [orderId]);
        await pool.execute("DELETE FROM customer_orders WHERE id=?", [orderId]);
      }
      if (reviewKey) await pool.execute("DELETE FROM idempotency_records WHERE operation='customer-order-review' AND idempotency_key=?", [reviewKey]);
      await pool.execute("DELETE FROM audit_logs WHERE (resource_type='customer-orders' AND resource_id=?) OR (resource_type='production-plans' AND resource_id=?) OR (resource_type='production-reports' AND resource_id=?) OR (resource_type='finished-reports' AND resource_id=?)", [orderId || 0, planId || 0, productionId || 0, finishedId || 0]);
      await pool.execute("DELETE FROM notifications WHERE (resource_type='customer-orders' AND resource_id=?) OR (resource_type='production-plans' AND resource_id=?) OR (resource_type='production-reports' AND resource_id=?) OR (resource_type='finished-reports' AND resource_id=?)", [orderId || 0, planId || 0, productionId || 0, finishedId || 0]);
    } finally { await closePool(); }
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
