const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");

const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "", csrf = "";
  async function call(path, method = "GET", body, key) {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { "X-CSRF-Token": csrf } : {}), ...(key ? { "Idempotency-Key": key } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
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
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true") throw new Error("Commerce smoke chỉ chạy với dữ liệu demo ngoài production.");
  const pool = getPool();
  let planId, purchaseId, lotId, campaignId, qcId, stockRequestId, taskId, documentId, reviewKey, dispatchKey, postKey;
  try {
    const planner = client(), director = client(), purchaser = client(), manager = client(), qc = client(), workshop = client(), staff = client();
    await planner.login("planner");
    const [items] = await pool.execute("SELECT id FROM items WHERE kind='MATERIAL' AND is_active=1 LIMIT 1");
    const [suppliers] = await pool.execute("SELECT id FROM suppliers WHERE is_active=1 LIMIT 1");
    assert.ok(items.length && suppliers.length);
    const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const plan = await planner.call("/api/v1/business-plans", "POST", {
      type: "PURCHASE", supplier_id: String(suppliers[0].id), planned_date: date,
      lines: [{ item_id: String(items[0].id), quantity: "5.000", unit_price: "10.0000" }],
    });
    assert.equal(plan.status, 201, JSON.stringify(plan));
    planId = plan.data.id;
    assert.equal(plan.data.total_amount, "50.0000");
    await director.login("director");
    reviewKey = crypto.randomUUID();
    const approved = await director.call(`/api/v1/business-plans/${planId}/review`, "POST", { version: plan.data.version, decision: "APPROVE" }, reviewKey);
    assert.equal(approved.status, 200, JSON.stringify(approved));
    assert.equal(approved.data.status, "APPROVED");
    const replay = await director.call(`/api/v1/business-plans/${planId}/review`, "POST", { version: plan.data.version, decision: "APPROVE" }, reviewKey);
    assert.equal(replay.status, 200, JSON.stringify(replay));
    await purchaser.login("purchaser");
    const purchase = await purchaser.call("/api/v1/purchase-orders", "POST", { business_plan_id: planId, expected_delivery_date: date, delivery_terms: "Giao tại kho." });
    assert.equal(purchase.status, 201, JSON.stringify(purchase));
    purchaseId = purchase.data.id;
    assert.equal(purchase.data.lines.length, 1);
    assert.equal((await purchaser.call("/api/v1/purchase-orders", "POST", { business_plan_id: planId, expected_delivery_date: date, delivery_terms: "Trùng" })).status, 409);
    await manager.login("manager");
    const code = "LOT-TEST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const lot = await manager.call("/api/v1/lots", "POST", { code, purchase_order_line_id: purchase.data.lines[0].id, purchase_order_id: purchaseId, received_quantity: "2.000" });
    assert.equal(lot.status, 201, JSON.stringify(lot));
    lotId = lot.data.id;
    assert.equal((await manager.call("/api/v1/lots", "POST", { code: code + "-OVER", purchase_order_line_id: purchase.data.lines[0].id, received_quantity: "4.000" })).status, 422);
    const [inspectors] = await pool.execute("SELECT id FROM users WHERE username='qc' LIMIT 1");
    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 2 * 86400000).toISOString();
    const schedule = await director.call("/api/v1/quality-campaigns", "POST", {
      campaign_type: "QUALITY_CHECK", quality_kind: "MATERIAL", planned_date: date,
      start_at: start, end_at: end, location: "Khu QC thử nghiệm",
      assignee_ids: [String(inspectors[0].id)], lot_ids: [lotId],
    });
    assert.equal(schedule.status, 201, JSON.stringify(schedule));
    campaignId = schedule.data.id;
    const started = await director.call(`/api/v1/quality-campaigns/${campaignId}/start`, "POST", { version: schedule.data.version });
    assert.equal(started.status, 200, JSON.stringify(started));
    await qc.login("qc");
    const inspected = await qc.call("/api/v1/qc-inspections", "POST", {
      campaign_id: campaignId, inspected_at: new Date().toISOString(),
      lines: [{ lot_id: lotId, inspected_quantity: "2.000", passed_quantity: "1.500", failed_quantity: "0.500", issue: "Hư hỏng khi vận chuyển" }],
    });
    assert.equal(inspected.status, 201, JSON.stringify(inspected));
    qcId = inspected.data.id;
    const completed = await director.call(`/api/v1/quality-campaigns/${campaignId}`);
    assert.equal(completed.data.status, "COMPLETED");
    const [[checkedLot]] = await pool.execute("SELECT qc_status FROM lots WHERE id=?", [lotId]);
    assert.equal(checkedLot.qc_status, "PARTIAL");
    await workshop.login("workshop");
    const [warehouses] = await pool.execute("SELECT id FROM warehouses WHERE is_active=1 LIMIT 1");
    const [managers] = await pool.execute("SELECT id FROM users WHERE username='manager' LIMIT 1");
    const request = await workshop.call("/api/v1/stock-requests", "POST", {
      purpose: "PURCHASE_RECEIPT", purchase_order_id: purchaseId, workshop_id: "1",
      warehouse_id: String(warehouses[0].id), manager_id: String(managers[0].id), requested_date: date,
      lines: [{ item_id: String(items[0].id), quantity: "1.500" }],
    });
    assert.equal(request.status, 201, JSON.stringify(request));
    stockRequestId = request.data.id;
    assert.equal(request.data.lines[0].remaining_quantity, "1.500");
    const [locations] = await pool.execute("SELECT id FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 LIMIT 1", [warehouses[0].id]);
    const [staffUsers] = await pool.execute("SELECT id FROM users WHERE username='staff' LIMIT 1");
    dispatchKey = crypto.randomUUID();
    const dispatch = await manager.call(`/api/v1/stock-requests/${stockRequestId}/dispatch`, "POST", {
      version: request.data.version, start_at: start, end_at: end,
      allocations: [{ assignee_id: String(staffUsers[0].id), stock_request_line_id: request.data.lines[0].id, lot_id: lotId, location_id: String(locations[0].id), quality_bucket: "AVAILABLE", quantity: "1.500" }],
    }, dispatchKey);
    assert.equal(dispatch.status, 200, JSON.stringify(dispatch));
    taskId = dispatch.data.tasks[0].id;
    await staff.login("staff");
    postKey = crypto.randomUUID();
    const posting = await staff.call("/api/v1/stock-documents", "POST", {
      stock_request_id: stockRequestId, request_version: dispatch.data.version, task_id: taskId,
      allocations: [{ stock_request_line_id: request.data.lines[0].id, lot_id: lotId, location_id: String(locations[0].id), quality_bucket: "AVAILABLE", quantity: "1.500" }],
    }, postKey);
    assert.equal(posting.status, 201, JSON.stringify(posting));
    documentId = posting.data.id;
    const replayPost = await staff.call("/api/v1/stock-documents", "POST", {
      stock_request_id: stockRequestId, request_version: dispatch.data.version, task_id: taskId,
      allocations: [{ stock_request_line_id: request.data.lines[0].id, lot_id: lotId, location_id: String(locations[0].id), quality_bucket: "AVAILABLE", quantity: "1.500" }],
    }, postKey);
    assert.equal(replayPost.status, 201, JSON.stringify(replayPost));
    assert.equal(replayPost.data.id, documentId);
    const [[balance]] = await pool.execute("SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE'", [lotId, locations[0].id]);
    assert.equal(String(balance.quantity), "1.500");
    console.log("COMMERCE PASS: purchase plan, order, QC, request, dispatch, one-time stock posting.");
  } finally {
    try {
      if (documentId) {
        await pool.execute("DELETE FROM inventory_movements WHERE stock_document_line_id IN (SELECT id FROM stock_document_lines WHERE stock_document_id=?)", [documentId]);
        await pool.execute("DELETE FROM stock_document_lines WHERE stock_document_id=?", [documentId]);
        await pool.execute("DELETE FROM stock_documents WHERE id=?", [documentId]);
      }
      if (lotId) await pool.execute("DELETE FROM inventory_balances WHERE lot_id=?", [lotId]);
      if (taskId) {
        await pool.execute("DELETE FROM stock_allocations WHERE task_id=?", [taskId]);
        await pool.execute("DELETE FROM task_assignments WHERE task_id=?", [taskId]);
        await pool.execute("DELETE FROM tasks WHERE id=?", [taskId]);
      }
      if (stockRequestId) {
        await pool.execute("DELETE FROM stock_request_lines WHERE stock_request_id=?", [stockRequestId]);
        await pool.execute("DELETE FROM stock_requests WHERE id=?", [stockRequestId]);
      }
      if (qcId) {
        await pool.execute("DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?", [qcId]);
        await pool.execute("DELETE FROM qc_inspections WHERE id=?", [qcId]);
      }
      if (campaignId) {
        await pool.execute("DELETE FROM quality_campaign_lots WHERE campaign_id=?", [campaignId]);
        await pool.execute("DELETE FROM quality_campaign_assignments WHERE campaign_id=?", [campaignId]);
        await pool.execute("DELETE FROM stocktakes WHERE id=?", [campaignId]);
      }
      if (lotId) await pool.execute("DELETE FROM lots WHERE id=?", [lotId]);
      if (purchaseId) {
        await pool.execute("DELETE FROM purchase_order_lines WHERE purchase_order_id=?", [purchaseId]);
        await pool.execute("DELETE FROM purchase_orders WHERE id=?", [purchaseId]);
      }
      if (planId) {
        await pool.execute("DELETE FROM business_plan_lines WHERE business_plan_id=?", [planId]);
        await pool.execute("DELETE FROM business_plans WHERE id=?", [planId]);
      }
      if (reviewKey) await pool.execute("DELETE FROM idempotency_records WHERE operation='business-plan-review' AND idempotency_key=?", [reviewKey]);
      if (dispatchKey) await pool.execute("DELETE FROM idempotency_records WHERE operation='stock-dispatch' AND idempotency_key=?", [dispatchKey]);
      if (postKey) await pool.execute("DELETE FROM idempotency_records WHERE operation='stock-post' AND idempotency_key=?", [postKey]);
      await pool.execute("DELETE FROM audit_logs WHERE (resource_type='business-plans' AND resource_id=?) OR (resource_type='purchase-orders' AND resource_id=?) OR (resource_type='lots' AND resource_id=?) OR (resource_type='stocktakes' AND resource_id=?) OR (resource_type='qc-inspections' AND resource_id=?) OR (resource_type='stock-requests' AND resource_id=?) OR (resource_type='stock-documents' AND resource_id=?)", [planId || 0, purchaseId || 0, lotId || 0, campaignId || 0, qcId || 0, stockRequestId || 0, documentId || 0]);
    } finally { await closePool(); }
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
