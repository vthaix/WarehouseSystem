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
    const data = await response.json();
    return { status: response.status, ...data };
  }
  return {
    call,
    async page(path) {
      return fetch(base + path, { headers: { Cookie: cookie } });
    },
    async login(username) {
      csrf = (await call("/api/v1/auth/csrf")).data.csrf_token;
      const response = await call("/api/v1/auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(response.status, 200, JSON.stringify(response));
      csrf = response.data.csrf_token;
    },
  };
}

(async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true")
    throw new Error("Order smoke chỉ chạy với dữ liệu demo ngoài production.");
  const pool = getPool();
  let orderId,
    planId,
    replayKey,
    rejectedId,
    rejectKey;
  try {
    const customer = client(),
      otherCustomer = client(),
      planner = client(),
      director = client();
    await customer.login("customer");
    const samples = await customer.call("/api/v1/sample-items");
    assert.equal(samples.status, 200);
    const item = samples.data[0];
    assert.ok(item);
    const delivery = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const created = await customer.call("/api/v1/customer-orders", "POST", {
      delivery_address: "Địa chỉ thử nghiệm",
      latest_delivery_date: delivery,
      note: "Kiểm thử luồng đơn hàng",
      lines: [{ item_id: item.id, quantity: "2.000" }],
    });
    assert.equal(created.status, 201, JSON.stringify(created));
    orderId = created.data.id;
    assert.equal(created.data.status, "SUBMITTED");
    const page = await customer.page("/customer/orders");
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes("Đơn hàng"));
    await otherCustomer.login("customer2");
    assert.equal((await otherCustomer.call(`/api/v1/customer-orders/${orderId}`)).status, 404);
    const stale = await customer.call(`/api/v1/customer-orders/${orderId}`, "PATCH", {
      version: 999,
      note: "Không được ghi",
    });
    assert.equal(stale.status, 409);
    const unacknowledged = await customer.call(`/api/v1/customer-orders/${orderId}`, "PATCH", {
      version: created.data.version,
      lines: [{ item_id: item.id, quantity: "3.000" }],
    });
    assert.equal(unacknowledged.status, 422);
    const edited = await customer.call(`/api/v1/customer-orders/${orderId}`, "PATCH", {
      version: created.data.version,
      lines: [{ item_id: item.id, quantity: "3.000" }],
      quantity_change_acknowledged: true,
    });
    assert.equal(edited.status, 200, JSON.stringify(edited));
    await planner.login("planner");
    const received = await planner.call(`/api/v1/customer-orders/${orderId}/receive`, "POST", {
      version: edited.data.version,
    });
    assert.equal(received.status, 200, JSON.stringify(received));
    const lookup = await planner.call("/api/v1/lookup/items");
    assert.equal(lookup.status, 200, JSON.stringify(lookup));
    await director.login("director");
    const withoutPlan = await director.call(
      `/api/v1/customer-orders/${orderId}/review`,
      "POST",
      { version: received.data.version, decision: "APPROVE" },
      crypto.randomUUID(),
    );
    assert.equal(withoutPlan.status, 409);
    const oversized = await planner.call("/api/v1/production-plans", "POST", {
      customer_order_id: orderId,
      workshop_id: "1",
      start_date: delivery,
      end_date: delivery,
      outputs: [{ item_id: item.id, quantity: "4.000" }],
      materials: [],
    });
    assert.equal(oversized.status, 422);
    const plan = await planner.call("/api/v1/production-plans", "POST", {
      customer_order_id: orderId,
      workshop_id: "1",
      start_date: delivery,
      end_date: delivery,
      outputs: [{ item_id: item.id, quantity: "3.000" }],
      materials: [],
      note: "Kế hoạch thử nghiệm",
    });
    assert.equal(plan.status, 201, JSON.stringify(plan));
    planId = plan.data.id;
    const planPage = await planner.page("/production/plans");
    assert.equal(planPage.status, 200);
    replayKey = crypto.randomUUID();
    const approved = await director.call(
      `/api/v1/customer-orders/${orderId}/review`,
      "POST",
      { version: received.data.version, decision: "APPROVE", reason: "" },
      replayKey,
    );
    assert.equal(approved.status, 200, JSON.stringify(approved));
    assert.equal(approved.data.status, "APPROVED");
    const replay = await director.call(
      `/api/v1/customer-orders/${orderId}/review`,
      "POST",
      { version: received.data.version, decision: "APPROVE", reason: "" },
      replayKey,
    );
    assert.equal(replay.status, 200, JSON.stringify(replay));
    assert.equal(replay.data.version, approved.data.version);
    const finalPlan = await planner.call(`/api/v1/production-plans/${planId}`);
    assert.equal(finalPlan.data.status, "APPROVED");
    assert.equal((await customer.call(`/api/v1/customer-orders/${orderId}/review`, "POST", {}, crypto.randomUUID())).status, 403);
    const second = await customer.call("/api/v1/customer-orders", "POST", {
      delivery_address: "Địa chỉ thử nghiệm 2",
      latest_delivery_date: delivery,
      lines: [{ item_id: item.id, quantity: "1.000" }],
    });
    assert.equal(second.status, 201, JSON.stringify(second));
    rejectedId = second.data.id;
    const secondReceived = await planner.call(`/api/v1/customer-orders/${rejectedId}/receive`, "POST", {
      version: second.data.version,
    });
    assert.equal(secondReceived.status, 200, JSON.stringify(secondReceived));
    rejectKey = crypto.randomUUID();
    const rejected = await director.call(`/api/v1/customer-orders/${rejectedId}/review`, "POST", {
      version: secondReceived.data.version,
      decision: "REJECT",
      reason: "Không đáp ứng thời hạn giao.",
    }, rejectKey);
    assert.equal(rejected.status, 200, JSON.stringify(rejected));
    assert.equal(rejected.data.status, "REJECTED");
    assert.equal(rejected.data.rejection_reason, "Không đáp ứng thời hạn giao.");
    console.log("ORDER PASS: create, ownership, stale version, edit, receive, plan, approve, reject, replay, RBAC.");
  } finally {
    if (orderId) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        if (planId) {
          await connection.execute("DELETE FROM production_plan_materials WHERE production_plan_id=?", [planId]);
          await connection.execute("DELETE FROM production_plan_outputs WHERE production_plan_id=?", [planId]);
          await connection.execute("DELETE FROM production_plans WHERE id=?", [planId]);
        }
        for (const id of [orderId, rejectedId].filter(Boolean)) {
          await connection.execute("DELETE FROM customer_order_lines WHERE customer_order_id=?", [id]);
          await connection.execute("DELETE FROM customer_orders WHERE id=?", [id]);
        }
        await connection.execute("DELETE FROM notifications WHERE resource_type IN ('customer-orders','production-plans') AND resource_id IN (?,?,?)", [orderId, rejectedId || 0, planId || 0]);
        await connection.execute("DELETE FROM audit_logs WHERE resource_type IN ('customer-orders','production-plans') AND resource_id IN (?,?,?)", [orderId, rejectedId || 0, planId || 0]);
        if (replayKey)
          await connection.execute("DELETE FROM idempotency_records WHERE operation='customer-order-review' AND idempotency_key=?", [replayKey]);
        if (rejectKey)
          await connection.execute("DELETE FROM idempotency_records WHERE operation='customer-order-review' AND idempotency_key=?", [rejectKey]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
    await closePool();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
