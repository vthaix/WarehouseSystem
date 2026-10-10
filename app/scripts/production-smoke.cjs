const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");

const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "",
    csrf = "";
  async function call(path, method = "GET", body, key) {
    const response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return { status: response.status, ...(await response.json()) };
  }
  return {
    call,
    async login(username) {
      csrf = (await call("/api/v1/auth/csrf")).data.csrf_token;
      const result = await call("/api/v1/auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(result.status, 200, JSON.stringify(result));
      csrf = result.data.csrf_token;
    },
  };
}

(async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true")
    throw new Error(
      "Production smoke chỉ chạy với dữ liệu demo ngoài production.",
    );
  const pool = getPool();
  const [[assignedWorkshop]] = await pool.execute(
    "SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id JOIN workshops w ON w.id=wu.workshop_id WHERE u.username='workshop' AND w.is_active=1 ORDER BY wu.workshop_id LIMIT 1",
  );
  assert.ok(assignedWorkshop);
  const workshopId = String(assignedWorkshop.workshop_id);
  let orderId,
    planId,
    productionId,
    finishedId,
    lotId,
    reviewKey,
    materialRequestId;
  const purchasePlanIds = [];
  try {
    const customer = client(),
      planner = client(),
      director = client(),
      workshop = client();
    await customer.login("customer");
    const samples = await customer.call("/api/v1/sample-items");
    const item = samples.data[0];
    assert.ok(item);
    const [materials] = await pool.execute(
      "SELECT id FROM items WHERE kind='MATERIAL' AND is_active=1 LIMIT 1",
    );
    assert.ok(materials.length);
    const delivery = new Date(Date.now() + 14 * 86400000)
      .toISOString()
      .slice(0, 10);
    const created = await customer.call("/api/v1/customer-orders", "POST", {
      delivery_address: "Kiểm thử sản xuất",
      latest_delivery_date: delivery,
      lines: [{ item_id: item.id, quantity: "2.000" }],
    });
    assert.equal(created.status, 201, JSON.stringify(created));
    orderId = created.data.id;
    await planner.login("planner");
    const received = await planner.call(
      `/api/v1/customer-orders/${orderId}/receive`,
      "POST",
      { version: created.data.version },
    );
    assert.equal(received.status, 200, JSON.stringify(received));
    const plan = await planner.call("/api/v1/production-plans", "POST", {
      customer_order_id: orderId,
      workshop_id: workshopId,
      start_date: delivery,
      end_date: delivery,
      outputs: [{ item_id: item.id, quantity: "2.000" }],
      materials: [],
    });
    assert.equal(plan.status, 201, JSON.stringify(plan));
    planId = plan.data.id;
    await director.login("director");
    reviewKey = crypto.randomUUID();
    const approved = await director.call(
      `/api/v1/customer-orders/${orderId}/review`,
      "POST",
      { version: received.data.version, decision: "APPROVE" },
      reviewKey,
    );
    assert.equal(approved.status, 200, JSON.stringify(approved));
    await workshop.login("workshop");
    const production = await workshop.call(
      "/api/v1/production-reports",
      "POST",
      {
        production_plan_id: planId,
        lines: [
          {
            item_id: String(materials[0].id),
            available_quantity: "1.000",
            required_quantity: "3.000",
          },
        ],
      },
    );
    assert.equal(production.status, 201, JSON.stringify(production));
    productionId = production.data.id;
    assert.equal(production.data.lines[0].shortage_quantity, "2.000");
    const submitted = await workshop.call(
      `/api/v1/production-reports/${productionId}/submit`,
      "POST",
      { version: production.data.version },
    );
    assert.equal(submitted.status, 200, JSON.stringify(submitted));
    assert.equal(submitted.data.status, "SUBMITTED");
    const [[warehouse]] = await pool.execute(
      "SELECT id FROM warehouses WHERE is_active=1 LIMIT 1",
    );
    const request = await workshop.call("/api/v1/stock-requests", "POST", {
      purpose: "MATERIAL_PURCHASE",
      production_report_id: productionId,
      workshop_id: workshopId,
      warehouse_id: String(warehouse.id),
      requested_date: delivery,
      lines: [{ item_id: String(materials[0].id), quantity: "2.000" }],
    });
    assert.equal(request.status, 201, JSON.stringify(request));
    materialRequestId = request.data.id;
    const lookup = await planner.call("/api/v1/lookup/stock-requests");
    const requestOption = lookup.data.find((r) => r.id === materialRequestId);
    assert.equal(requestOption.lines[0].item_id, String(materials[0].id));
    const [[supplier]] = await pool.execute(
      "SELECT id FROM suppliers WHERE is_active=1 LIMIT 1",
    );
    const payload = {
      type: "PURCHASE",
      supplier_id: String(supplier.id),
      source_request_id: materialRequestId,
      planned_date: delivery,
      lines: [
        {
          item_id: String(materials[0].id),
          quantity: "0.500",
          unit_price: "10.0000",
        },
      ],
    };
    const missingSource = { ...payload };
    delete missingSource.source_request_id;
    assert.equal(
      (await planner.call("/api/v1/business-plans", "POST", missingSource))
        .status,
      422,
    );
    assert.equal(
      (
        await planner.call("/api/v1/business-plans", "POST", {
          ...payload,
          production_plan_id: "999999999",
        })
      ).status,
      422,
    );
    const purchasePlan = await planner.call(
      "/api/v1/business-plans",
      "POST",
      payload,
    );
    assert.equal(purchasePlan.status, 201, JSON.stringify(purchasePlan));
    purchasePlanIds.push(purchasePlan.data.id);
    assert.equal(purchasePlan.data.production_plan_id, planId);
    assert.equal(purchasePlan.data.source_request_id, materialRequestId);
    assert.equal(
      (
        await workshop.call(
          `/api/v1/stock-requests/${materialRequestId}`,
          "PATCH",
          {
            version: request.data.version,
            lines: [{ item_id: String(materials[0].id), quantity: "0.100" }],
          },
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await workshop.call(
          `/api/v1/stock-requests/${materialRequestId}`,
          "DELETE",
          { version: request.data.version },
        )
      ).status,
      409,
    );
    const overPurchase = await planner.call("/api/v1/business-plans", "POST", {
      ...payload,
      lines: [{ ...payload.lines[0], quantity: "2.000" }],
    });
    assert.equal(overPurchase.status, 422);
    const invalidEdit = await planner.call(
      `/api/v1/business-plans/${purchasePlan.data.id}`,
      "PATCH",
      {
        version: purchasePlan.data.version,
        lines: [{ ...payload.lines[0], quantity: "2.001" }],
      },
    );
    assert.equal(invalidEdit.status, 422);
    const competing = await Promise.all(
      [1, 2].map(() =>
        planner.call("/api/v1/business-plans", "POST", {
          ...payload,
          lines: [{ ...payload.lines[0], quantity: "1.500" }],
        }),
      ),
    );
    for (const result of competing)
      if (result.status === 201) purchasePlanIds.push(result.data.id);
    assert.deepEqual(
      competing.map((r) => r.status).sort(),
      [201, 422],
      JSON.stringify(competing),
    );
    const reviewedPurchase = await director.call(
      `/api/v1/business-plans/${purchasePlan.data.id}/review`,
      "POST",
      { version: purchasePlan.data.version, decision: "APPROVE" },
      crypto.randomUUID(),
    );
    assert.equal(
      reviewedPurchase.status,
      200,
      JSON.stringify(reviewedPurchase),
    );
    const code =
      "FIN-TEST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const finished = await workshop.call("/api/v1/finished-reports", "POST", {
      production_plan_id: planId,
      completed_date: delivery,
      outputs: [
        {
          item_id: item.id,
          lot_code: code,
          quantity: "2.000",
          manufactured_date: delivery,
        },
      ],
      materials: [{ item_id: String(materials[0].id), used_quantity: "1.000" }],
    });
    assert.equal(finished.status, 201, JSON.stringify(finished));
    finishedId = finished.data.id;
    lotId = finished.data.outputs[0].lot_id;
    const over = await workshop.call("/api/v1/finished-reports", "POST", {
      production_plan_id: planId,
      completed_date: delivery,
      outputs: [
        {
          item_id: item.id,
          lot_code: code + "-OVER",
          quantity: "1.000",
          manufactured_date: delivery,
        },
      ],
      materials: [],
    });
    assert.equal(over.status, 422);
    const done = await workshop.call(
      `/api/v1/finished-reports/${finishedId}/submit`,
      "POST",
      { version: finished.data.version },
    );
    assert.equal(done.status, 200, JSON.stringify(done));
    assert.equal(done.data.status, "SUBMITTED");
    const [balances] = await pool.execute(
      "SELECT id FROM inventory_balances WHERE lot_id=?",
      [lotId],
    );
    assert.equal(balances.length, 0);
    console.log(
      "PRODUCTION PASS: material report/shortage, purchase source trace, lookup/UI data, over-demand rollback, concurrent source limits, approval, finished lot, no inventory posting.",
    );
  } finally {
    try {
      for (const id of purchasePlanIds) {
        await pool.execute(
          "DELETE FROM business_plan_lines WHERE business_plan_id=?",
          [id],
        );
        await pool.execute("DELETE FROM business_plans WHERE id=?", [id]);
        await pool.execute(
          "DELETE FROM audit_logs WHERE resource_type='business-plans' AND resource_id=?",
          [id],
        );
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='business-plan-review' AND JSON_UNQUOTE(JSON_EXTRACT(response_body,'$.id'))=?",
          [id],
        );
      }
      if (materialRequestId) {
        await pool.execute(
          "DELETE FROM stock_request_lines WHERE stock_request_id=?",
          [materialRequestId],
        );
        await pool.execute("DELETE FROM stock_requests WHERE id=?", [
          materialRequestId,
        ]);
        await pool.execute(
          "DELETE FROM audit_logs WHERE resource_type='stock-requests' AND resource_id=?",
          [materialRequestId],
        );
      }
      if (finishedId) {
        await pool.execute(
          "DELETE FROM finished_report_outputs WHERE finished_report_id=?",
          [finishedId],
        );
        await pool.execute(
          "DELETE FROM finished_report_materials WHERE finished_report_id=?",
          [finishedId],
        );
        await pool.execute("DELETE FROM finished_reports WHERE id=?", [
          finishedId,
        ]);
      }
      if (lotId) await pool.execute("DELETE FROM lots WHERE id=?", [lotId]);
      if (productionId) {
        await pool.execute(
          "DELETE FROM production_report_lines WHERE production_report_id=?",
          [productionId],
        );
        await pool.execute("DELETE FROM production_reports WHERE id=?", [
          productionId,
        ]);
      }
      if (planId) {
        await pool.execute(
          "DELETE FROM production_plan_materials WHERE production_plan_id=?",
          [planId],
        );
        await pool.execute(
          "DELETE FROM production_plan_outputs WHERE production_plan_id=?",
          [planId],
        );
        await pool.execute("DELETE FROM production_plans WHERE id=?", [planId]);
      }
      if (orderId) {
        await pool.execute(
          "DELETE FROM customer_order_lines WHERE customer_order_id=?",
          [orderId],
        );
        await pool.execute("DELETE FROM customer_orders WHERE id=?", [orderId]);
      }
      if (reviewKey)
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='customer-order-review' AND idempotency_key=?",
          [reviewKey],
        );
      await pool.execute(
        "DELETE FROM audit_logs WHERE (resource_type='customer-orders' AND resource_id=?) OR (resource_type='production-plans' AND resource_id=?) OR (resource_type='production-reports' AND resource_id=?) OR (resource_type='finished-reports' AND resource_id=?)",
        [orderId || 0, planId || 0, productionId || 0, finishedId || 0],
      );
      await pool.execute(
        "DELETE FROM notifications WHERE (resource_type='customer-orders' AND resource_id=?) OR (resource_type='production-plans' AND resource_id=?) OR (resource_type='production-reports' AND resource_id=?) OR (resource_type='finished-reports' AND resource_id=?)",
        [orderId || 0, planId || 0, productionId || 0, finishedId || 0],
      );
    } finally {
      await closePool();
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
