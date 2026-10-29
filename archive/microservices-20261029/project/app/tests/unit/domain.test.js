const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../src/services/domain/core");
const {
  fixture,
  warehouse,
  production,
  planForOrder,
  dispatch,
} = require("../helpers/fixtures.cjs");
test("decimal and money arithmetic is exact", () => {
  assert.equal(C.decimal(C.qty("0.1") + C.qty("0.2")), "0.300");
  assert.throws(
    () => C.qty(1),
    (e) => e.code === "VALIDATION_ERROR",
  );
  assert.equal(C.qty("0", false), 0n);
});
test("customer ownership and client price tampering are blocked", () => {
  const { service, u } = fixture();
  assert.throws(
    () => service.get(u("customer2"), "customer-orders", "1"),
    (e) => e.status === 404,
  );
  assert.throws(
    () =>
      service.run(u("customer"), "customer-orders", "create", null, {
        delivery_address: "A",
        latest_delivery_date: C.today(),
        lines: [{ item_id: "2", quantity: "1.000", unit_price: "1" }],
      }),
    (e) => e.code === "VALIDATION_ERROR",
  );
});
test("order approval requires a production plan and approves it atomically", () => {
  const f = fixture(),
    { service, u, repo } = f;
  service.run(
    u("planner"),
    "customer-orders",
    "receive",
    "1",
    { version: 1 },
    "receive",
  );
  assert.throws(
    () =>
      service.run(
        u("director"),
        "customer-orders",
        "review",
        "1",
        { version: 2, decision: "APPROVE" },
        "approve",
      ),
    (e) => e.code === "INVALID_STATE",
  );
  const p = planForOrder(f);
  service.run(
    u("director"),
    "customer-orders",
    "review",
    "1",
    { version: 2, decision: "APPROVE" },
    "approve",
  );
  assert.equal(repo.get("production-plans", p.id).status, "APPROVED");
  assert.equal(repo.get("customer-orders", "1").status, "APPROVED");
});
test("approval validates role, version and exact replay payload", () => {
  const f = fixture(),
    { service, u } = f;
  service.run(
    u("planner"),
    "customer-orders",
    "receive",
    "1",
    { version: 1 },
    "receive",
  );
  planForOrder(f);
  const body = { version: 2, decision: "APPROVE" },
    result = service.run(
      u("director"),
      "customer-orders",
      "review",
      "1",
      body,
      "approve",
    );
  assert.deepEqual(
    service.run(
      u("director"),
      "customer-orders",
      "review",
      "1",
      body,
      "approve",
    ),
    result,
  );
  assert.throws(
    () =>
      service.run(
        u("director"),
        "customer-orders",
        "review",
        "1",
        { ...body, reason: "changed" },
        "approve",
      ),
    (e) => e.code === "IDEMPOTENCY_CONFLICT",
  );
  assert.throws(
    () =>
      service.run(
        u("customer"),
        "customer-orders",
        "review",
        "1",
        body,
        "other",
      ),
    (e) => e.status === 403,
  );
});
test("quality campaign never freezes warehouse inventory", () => {
  const f = warehouse();
  assert.equal(f.service.frozen("1"), false);
  const schedule = f.repo.all("stocktakes")[0];
  assert.equal(schedule.campaign_type, "QUALITY_CHECK");
  assert.equal(schedule.status, "COMPLETED");
  assert.equal(f.repo.all("inventory").length, 0);
});
test("material failures are returned before receipt and never enter inventory", () => {
  const { service, u, repo, body, lot, po } = warehouse("8.000");
  assert.equal(repo.get("lots", lot.id).returned_supplier_quantity, "2.000");
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  assert.equal(repo.all("inventory")[0].quantity, "8.000");
  assert.equal(
    repo.get("purchase-orders", po.id).status,
    "CLOSED_WITH_RETURNS",
  );
  assert.throws(() =>
    service.run(
      u("staff"),
      "stock-documents",
      "create",
      null,
      {
        ...body,
        allocations: [{ ...body.allocations[0], quality_bucket: "QUARANTINE" }],
      },
      "failed-receipt",
    ),
  );
});
test("receipt replay never duplicates stock or movements", () => {
  const { service, u, repo, body } = warehouse();
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  assert.equal(repo.all("inventory")[0].quantity, "10.000");
  assert.equal(repo.all("movements").length, 1);
  assert.equal(repo.all("stock-documents").length, 1);
});
test("injected failure after inventory change rolls back entire posting", () => {
  const { service, u, repo, body } = warehouse();
  const add = repo.add.bind(repo);
  repo.add = (n, v) => {
    if (n === "movements") throw new Error("injected write failure");
    return add(n, v);
  };
  assert.throws(
    () =>
      service.run(
        u("staff"),
        "stock-documents",
        "create",
        null,
        body,
        "broken",
      ),
    /injected/,
  );
  assert.equal(repo.all("inventory").length, 0);
  assert.equal(repo.all("stock-documents").length, 0);
  assert.equal(
    repo.get("stock-requests", body.stock_request_id).lines[0]
      .fulfilled_quantity,
    "0.000",
  );
});
test("staff only sees and posts their assigned lot/location/quantity", () => {
  const { service, u, repo, body, req } = warehouse();
  assert.throws(
    () => service.get(u("staff2"), "stock-requests", req.id),
    (e) => e.status === 404,
  );
  assert.throws(
    () =>
      service.run(
        u("staff2"),
        "stock-documents",
        "create",
        null,
        body,
        "unauthorized",
      ),
    (e) => e.status === 404,
  );
  assert.throws(
    () =>
      service.run(
        u("staff"),
        "stock-documents",
        "create",
        null,
        {
          ...body,
          allocations: [{ ...body.allocations[0], location_id: "2" }],
        },
        "bad-loc",
      ),
    (e) => e.status === 403,
  );
  assert.equal(repo.all("stock-documents").length, 0);
});
test("dispatch cannot reserve more QC-passed material", () => {
  const f = warehouse("5.000"),
    { service, u, repo, lot, req } = f;
  const loc = service.run(u("manager"), "warehouse-locations", "create", null, {
    warehouse_id: "1",
    code: "A-02",
    name: "Kệ A-02",
  });
  assert.throws(
    () =>
      service.run(
        u("manager"),
        "stock-requests",
        "dispatch",
        req.id,
        {
          version: repo.get("stock-requests", req.id).version,
          start_at: C.today() + "T12:00:00+07:00",
          end_at: C.today() + "T13:00:00+07:00",
          allocations: [
            {
              assignee_id: u("staff2").id,
              stock_request_line_id: req.lines[0].id,
              lot_id: lot.id,
              location_id: loc.id,
              quality_bucket: "AVAILABLE",
              quantity: "1.000",
            },
          ],
        },
        "over",
      ),
    (e) => e.code === "SOURCE_LIMIT_EXCEEDED",
  );
});
test("QC used by posted receipt is immutable", () => {
  const { service, u, repo, body } = warehouse();
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  const qc = repo.all("qc-inspections")[0];
  assert.throws(
    () =>
      service.run(u("qc"), "qc-inspections", "delete", qc.id, { version: 1 }),
    (e) => e.code === "RESOURCE_IN_USE",
  );
});
test("competing dispatches cannot oversubscribe stock", () => {
  const f = warehouse(),
    { service, u, repo, body } = f;
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  const p = production(f),
    requests = [];
  for (let i = 0; i < 2; i++)
    requests.push(
      service.run(
        u("workshop"),
        "stock-requests",
        "create",
        null,
        {
          purpose: "PRODUCTION_ISSUE",
          warehouse_id: "1",
          workshop_id: "1",
          requested_date: C.today(),
          production_plan_id: p.id,
          lines: [{ item_id: "1", quantity: "7.000" }],
        },
        "issue-req-" + i,
      ),
    );
  const task = dispatch(f, requests[0], f.lot, "7.000", "staff", 11);
  assert.throws(
    () => dispatch(f, requests[1], f.lot, "7.000", "staff2", 12),
    (e) => e.code === "INSUFFICIENT_STOCK",
  );
  service.run(
    u("staff"),
    "stock-documents",
    "create",
    null,
    {
      stock_request_id: requests[0].id,
      request_version: task.request.version,
      task_id: task.tasks[0].id,
      allocations: task.tasks[0].allocations.map(
        ({ assignee_id, fulfilled_quantity, ...a }) => a,
      ),
    },
    "issue",
  );
  assert.equal(repo.all("inventory")[0].quantity, "3.000");
});
test("stocktake blocks assigned posting; zero is counted; null blocks complete", () => {
  const f = warehouse(),
    { service, u, repo, body } = f;
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  const p = production(f),
    req = service.run(
      u("workshop"),
      "stock-requests",
      "create",
      null,
      {
        purpose: "PRODUCTION_ISSUE",
        warehouse_id: "1",
        workshop_id: "1",
        requested_date: C.today(),
        production_plan_id: p.id,
        lines: [{ item_id: "1", quantity: "1.000" }],
      },
      "issue-req",
    );
  const task = dispatch(f, req, f.lot, "1.000", "staff", 11);
  const st = service.run(
    u("director"),
    "stocktakes",
    "create",
    null,
    {
      planned_date: C.today(),
      warehouses: [{ warehouse_id: "1", assignee_ids: [u("stocktaker").id] }],
    },
    "count",
  );
  service.run(
    u("director"),
    "stocktakes",
    "start",
    st.id,
    { version: 1 },
    "start",
  );
  const w = repo.get("stocktakes", st.id).warehouses[0];
  assert.throws(
    () =>
      service.counts(
        u("stocktaker"),
        st.id,
        "1",
        { version: w.version },
        true,
        "complete",
      ),
    (e) => e.code === "INVALID_STATE",
  );
  assert.throws(
    () =>
      service.run(
        u("staff"),
        "stock-documents",
        "create",
        null,
        {
          stock_request_id: req.id,
          request_version: task.request.version,
          allocations: task.tasks[0].allocations.map(
            ({ assignee_id, fulfilled_quantity, ...a }) => a,
          ),
        },
        "issue",
      ),
    (e) => e.code === "WAREHOUSE_FROZEN",
  );
  service.counts(u("stocktaker"), st.id, "1", {
    lines: [{ id: w.lines[0].id, version: 1, actual_quantity: "0" }],
  });
  const result = service.counts(
    u("stocktaker"),
    st.id,
    "1",
    { version: 2 },
    true,
    "complete",
  );
  assert.equal(result.lines[0].actual_quantity, "0.000");
  assert.deepEqual(
    service.counts(
      u("stocktaker"),
      st.id,
      "1",
      { version: 2 },
      true,
      "complete",
    ),
    result,
  );
  assert.equal(service.frozen("1"), true);
});
test("adjustment needs approval and submitted minutes before close", () => {
  const { service, u, repo, body } = warehouse();
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  const st = service.run(
    u("director"),
    "stocktakes",
    "create",
    null,
    {
      planned_date: C.today(),
      warehouses: [{ warehouse_id: "1", assignee_ids: [u("stocktaker").id] }],
    },
    "count",
  );
  service.run(
    u("director"),
    "stocktakes",
    "start",
    st.id,
    { version: 1 },
    "start",
  );
  const w = repo.get("stocktakes", st.id).warehouses[0];
  service.counts(u("stocktaker"), st.id, "1", {
    lines: [{ id: w.lines[0].id, version: 1, actual_quantity: "8.000" }],
  });
  service.counts(u("stocktaker"), st.id, "1", { version: 2 }, true, "complete");
  const proposal = service.run(
    u("manager"),
    "exception-proposals",
    "create",
    null,
    {
      stocktake_id: st.id,
      warehouse_id: "1",
      stocktake_line_id: w.lines[0].id,
      reason: "Hao hụt",
      resolution_note: "Đối chiếu thực tế",
    },
    "proposal",
  );
  assert.equal(repo.all("inventory")[0].quantity, "10.000");
  service.run(
    u("director"),
    "exception-proposals",
    "review",
    proposal.id,
    { version: 1, decision: "APPROVE" },
    "apply",
  );
  assert.equal(repo.all("inventory")[0].quantity, "8.000");
  const m = service.run(
    u("stocktaker"),
    "stocktake-minutes",
    "create",
    null,
    { stocktake_id: st.id, warehouse_id: "1", remarks: "Kiểm kê xong" },
    "minutes",
  );
  service.run(
    u("stocktaker"),
    "stocktake-minutes",
    "submit",
    m.id,
    { version: 1 },
    "submit",
  );
  service.run(
    u("director"),
    "stocktakes",
    "close",
    st.id,
    { version: 3 },
    "close",
  );
  assert.equal(service.frozen("1"), false);
});
test("warehouse manager summarizes all employee documents without re-entry", () => {
  const { service, u, repo, body, req } = warehouse();
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  const record = service.run(
    u("manager"),
    "warehouse-records",
    "create",
    null,
    { stock_request_id: req.id, note: "Tổng hợp nhập" },
    "summary",
  );
  assert.equal(record.lines[0].quantity, "10.000");
  assert.equal(record.stock_document_ids.length, 1);
  assert.equal(
    service.get(u("workshop"), "warehouse-records", record.id).id,
    record.id,
  );
  assert.equal(repo.all("inventory")[0].quantity, "10.000");
});
test("workshop report defines material demand and procurement request feeds plan", () => {
  const f = fixture(),
    { service, u, repo } = f;
  service.run(
    u("planner"),
    "customer-orders",
    "receive",
    "1",
    { version: 1 },
    "receive",
  );
  const p = planForOrder(f, "1", "10.000", []);
  service.run(
    u("director"),
    "customer-orders",
    "review",
    "1",
    { version: 2, decision: "APPROVE" },
    "approve",
  );
  const report = service.run(
    u("workshop"),
    "production-reports",
    "create",
    null,
    {
      production_plan_id: p.id,
      note: "Cần thép",
      lines: [
        {
          item_id: "1",
          available_quantity: "2.000",
          required_quantity: "10.000",
        },
      ],
    },
    "report",
  );
  service.run(
    u("workshop"),
    "production-reports",
    "submit",
    report.id,
    { version: 1 },
    "submit",
  );
  assert.equal(
    repo.get("production-plans", p.id).materials[0].required_quantity,
    "10.000",
  );
  const req = service.run(
    u("workshop"),
    "stock-requests",
    "create",
    null,
    {
      purpose: "MATERIAL_PURCHASE",
      production_report_id: report.id,
      workshop_id: "1",
      requested_date: C.today(),
      lines: [{ item_id: "1", quantity: "8.000" }],
    },
    "demand",
  );
  const plan = service.run(
    u("planner"),
    "business-plans",
    "create",
    null,
    {
      type: "PURCHASE",
      source_request_id: req.id,
      supplier_id: "1",
      planned_date: C.today(),
      lines: [{ item_id: "1", quantity: "8.000", unit_price: "25000" }],
    },
    "buy",
  );
  assert.equal(plan.workshop_id, "1");
  assert.equal(repo.all("inventory").length, 0);
  assert.throws(
    () =>
      service.run(
        u("planner"),
        "business-plans",
        "create",
        null,
        {
          type: "PURCHASE",
          source_request_id: req.id,
          supplier_id: "1",
          planned_date: C.today(),
          lines: [{ item_id: "1", quantity: "1.000", unit_price: "25000" }],
        },
        "over-demand",
      ),
    (e) => e.code === "SOURCE_LIMIT_EXCEEDED",
  );
});
test("overlapping employee tasks are rejected", () => {
  const { service, u } = fixture();
  const b = {
    title: "Task",
    start_at: "2030-01-01T08:00:00+07:00",
    end_at: "2030-01-01T10:00:00+07:00",
    assignee_ids: [u("staff").id],
    priority: "NORMAL",
  };
  service.run(u("director"), "tasks", "create", null, b, "task1");
  assert.throws(
    () => service.run(u("director"), "tasks", "create", null, b, "task2"),
    (e) => e.code === "SCHEDULE_CONFLICT",
  );
});
test("inventory history derives from movement time", () => {
  const { service, u, repo, body } = warehouse();
  service.run(u("staff"), "stock-documents", "create", null, body, "receipt");
  repo.all("movements")[0].posted_at = new Date(
    Date.now() - 1000,
  ).toISOString();
  repo.started_at = new Date(Date.now() - 2000).toISOString();
  assert.equal(
    service.report(u("director"), "inventory", {
      as_of: new Date(Date.now() - 500).toISOString(),
    }).data[0].quantity,
    "10.000",
  );
  assert.equal(
    service.report(u("director"), "inventory", {
      as_of: new Date(Date.now() - 1500).toISOString(),
    }).data.length,
    0,
  );
});
