const { MemoryRepository } = require("../../src/repositories/memory");
const { WarehouseService } = require("../../src/services/domain/service");
const { seed } = require("../../src/repositories/seed");
const C = require("../../src/services/domain/core");
function fixture() {
  const repo = new MemoryRepository();
  seed(repo, "test-password");
  const service = new WarehouseService(repo),
    u = (n) => repo.all("users").find((x) => x.username === n);
  return { repo, service, u };
}
function planForOrder(
  f,
  id = "1",
  quantity = "10.000",
  materials = [{ item_id: "1", required_quantity: "20.000" }],
) {
  return f.service.run(
    f.u("planner"),
    "production-plans",
    "create",
    null,
    {
      customer_order_id: id,
      workshop_id: "1",
      start_date: C.today(),
      end_date: C.today(),
      outputs: [{ item_id: "2", quantity }],
      materials,
    },
    "production-" + id,
  );
}
function production(f) {
  const { service, u } = f;
  service.run(
    u("planner"),
    "customer-orders",
    "receive",
    "1",
    { version: 1 },
    "receive",
  );
  const plan = planForOrder(f);
  service.run(
    u("director"),
    "customer-orders",
    "review",
    "1",
    { version: 2, decision: "APPROVE" },
    "approve-order",
  );
  return service.result(
    u("planner"),
    "production-plans",
    f.repo.get("production-plans", plan.id),
  );
}
function campaign(f, lot, kind = "MATERIAL") {
  return f.service.run(
    f.u("director"),
    "stocktakes",
    "create",
    null,
    {
      campaign_type: "QUALITY_CHECK",
      quality_kind: kind,
      planned_date: C.today(),
      start_at: C.today() + "T08:00:00+07:00",
      end_at: C.today() + "T09:00:00+07:00",
      location: "Khu tiếp nhận",
      assignee_ids: [f.u("qc").id],
      lot_ids: [lot.id],
    },
    "qc-campaign-" + lot.id,
  );
}
function dispatch(
  f,
  req,
  lot,
  quantity = "10.000",
  staff = "staff",
  hour = 10,
  location_id = "1",
) {
  return f.service.run(
    f.u("manager"),
    "stock-requests",
    "dispatch",
    req.id,
    {
      version: f.repo.get("stock-requests", req.id).version,
      start_at: C.today() + `T${String(hour).padStart(2, "0")}:00:00+07:00`,
      end_at: C.today() + `T${String(hour + 1).padStart(2, "0")}:00:00+07:00`,
      allocations: [
        {
          assignee_id: f.u(staff).id,
          stock_request_line_id: req.lines[0].id,
          lot_id: lot.id,
          location_id,
          quality_bucket: "AVAILABLE",
          quantity,
        },
      ],
    },
    "dispatch-" + req.id + "-" + staff,
  );
}
function warehouse(passed = "10.000") {
  const f = fixture(),
    { repo, service, u } = f;
  const plan = service.run(
    u("planner"),
    "business-plans",
    "create",
    null,
    {
      type: "PURCHASE",
      supplier_id: "1",
      planned_date: C.today(),
      lines: [{ item_id: "1", quantity: "10.000", unit_price: "25000.0000" }],
    },
    "buy-plan",
  );
  service.run(
    u("director"),
    "business-plans",
    "review",
    plan.id,
    { version: 1, decision: "APPROVE" },
    "approve-buy",
  );
  const po = service.run(
    u("purchaser"),
    "purchase-orders",
    "create",
    null,
    {
      business_plan_id: plan.id,
      expected_delivery_date: C.today(),
      delivery_terms: "Giao tại kho",
    },
    "purchase",
  );
  const lot = service.run(
    u("manager"),
    "lots",
    "create",
    null,
    {
      code: "LOT-01",
      purchase_order_id: po.id,
      purchase_order_line_id: po.lines[0].id,
      received_quantity: "10.000",
    },
    "lot",
  );
  const schedule = campaign(f, lot);
  service.run(
    u("qc"),
    "qc-inspections",
    "create",
    null,
    {
      campaign_id: schedule.id,
      inspected_at: new Date().toISOString(),
      lines: [
        {
          lot_id: lot.id,
          inspected_quantity: "10.000",
          passed_quantity: passed,
          failed_quantity: C.decimal(10000n - C.qty(passed)),
          issue: "Lỗi thử nghiệm",
        },
      ],
    },
    "qc",
  );
  const initial = service.run(
    u("workshop"),
    "stock-requests",
    "create",
    null,
    {
      purpose: "PURCHASE_RECEIPT",
      warehouse_id: "1",
      workshop_id: "1",
      requested_date: C.today(),
      purchase_order_id: po.id,
      lines: [{ item_id: "1", quantity: passed }],
    },
    "receipt-req",
  );
  const assignment = dispatch(f, initial, lot, passed),
    req = assignment.request;
  return {
    ...f,
    po,
    lot,
    req,
    task: assignment.tasks[0],
    body: {
      stock_request_id: req.id,
      request_version: req.version,
      allocations: [
        {
          stock_request_line_id: req.lines[0].id,
          lot_id: lot.id,
          location_id: "1",
          quality_bucket: "AVAILABLE",
          quantity: passed,
        },
      ],
    },
  };
}
module.exports = {
  fixture,
  warehouse,
  production,
  planForOrder,
  campaign,
  dispatch,
};
