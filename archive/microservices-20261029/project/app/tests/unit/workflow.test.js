const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../src/services/domain/core");
const {
  fixture,
  warehouse,
  production,
  campaign,
} = require("../helpers/fixtures.cjs");
test("QC task editing retains QC role and synchronizes assigned schedule", () => {
  const f = warehouse(),
    { service, u, repo } = f;
  const lot = repo.add("lots", {
    code: "SECOND-LOT",
    item_id: "1",
    purchase_order_id: f.po.id,
    purchase_order_line_id: f.po.lines[0].id,
    received_quantity: "1.000",
    qc_status: "PENDING",
  });
  const schedule = campaign(f, lot);
  const task = repo.get("tasks", schedule.task_id);
  service.run(u("director"), "tasks", "edit", task.id, {
    version: task.version,
    title: "QC lịch cập nhật",
    start_at: C.today() + "T09:00:00+07:00",
    end_at: C.today() + "T10:00:00+07:00",
    assignee_ids: [u("qc").id],
  });
  assert.equal(
    repo.get("stocktakes", schedule.id).start_at,
    C.today() + "T09:00:00+07:00",
  );
  assert.throws(
    () =>
      service.run(u("director"), "tasks", "edit", task.id, {
        version: task.version,
        assignee_ids: [u("staff").id],
      }),
    (e) => e.code === "VALIDATION_ERROR",
  );
});
test("finished-product failures create a reviewable exception without stock movement", () => {
  const f = fixture(),
    { service, u, repo } = f;
  const p = production(f),
    report = service.run(
      u("workshop"),
      "finished-reports",
      "create",
      null,
      {
        production_plan_id: p.id,
        completed_date: C.today(),
        outputs: [
          {
            item_id: "2",
            lot_code: "FG-FAIL",
            quantity: "10.000",
            manufactured_date: C.today(),
          },
        ],
        materials: [{ item_id: "1", used_quantity: "5.000" }],
      },
      "finished",
    );
  service.run(
    u("workshop"),
    "finished-reports",
    "submit",
    report.id,
    { version: 1 },
    "submit-finished",
  );
  const lot = repo.get("lots", report.outputs[0].lot_id),
    schedule = campaign(f, lot, "FINISHED_PRODUCT");
  const qc = service.run(
    u("qc"),
    "qc-inspections",
    "create",
    null,
    {
      campaign_id: schedule.id,
      inspected_at: new Date().toISOString(),
      note: "Đề nghị xử lý riêng phần lỗi",
      lines: [
        {
          lot_id: lot.id,
          inspected_quantity: "10.000",
          passed_quantity: "8.000",
          failed_quantity: "2.000",
          issue: "Lỗi bề mặt",
        },
      ],
    },
    "fg-qc",
  );
  const exception = repo.all("exception-proposals")[0];
  assert.equal(exception.status, "PENDING_APPROVAL");
  assert.equal(exception.quantity, "2.000");
  service.run(
    u("director"),
    "exception-proposals",
    "review",
    exception.id,
    { version: 1, decision: "APPROVE" },
    "resolve-fg",
  );
  assert.equal(repo.get("lots", lot.id).failure_disposition, "APPROVED_NOTE");
  assert.equal(repo.all("inventory").length, 0);
  assert.equal(repo.all("movements").length, 0);
  assert.throws(
    () =>
      service.run(u("qc"), "qc-inspections", "edit", qc.id, {
        version: 1,
        note: "Thay đổi",
      }),
    (e) => e.code === "RESOURCE_IN_USE",
  );
});
test("two warehouse employees receive separate assignments and manager consolidates both", () => {
  const f = warehouse(),
    { service, u, repo, req, lot } = f;
  service.run(
    u("manager"),
    "tasks",
    "delete",
    f.task.id,
    { version: f.task.version },
    "cancel-old",
  );
  const result = service.run(
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
          assignee_id: u("staff").id,
          stock_request_line_id: req.lines[0].id,
          lot_id: lot.id,
          location_id: "1",
          quality_bucket: "AVAILABLE",
          quantity: "6.000",
        },
        {
          assignee_id: u("staff2").id,
          stock_request_line_id: req.lines[0].id,
          lot_id: lot.id,
          location_id: "1",
          quality_bucket: "AVAILABLE",
          quantity: "4.000",
        },
      ],
    },
    "split",
  );
  for (const task of result.tasks) {
    const staff = repo.get("users", task.assignee_ids[0]);
    service.run(
      staff,
      "stock-documents",
      "create",
      null,
      {
        stock_request_id: req.id,
        task_id: task.id,
        request_version: repo.get("stock-requests", req.id).version,
        allocations: task.allocations.map(
          ({ assignee_id, fulfilled_quantity, ...a }) => a,
        ),
      },
      "post-" + staff.id,
    );
  }
  const record = service.run(
    u("manager"),
    "warehouse-records",
    "create",
    null,
    { stock_request_id: req.id },
    "summary",
  );
  assert.equal(record.stock_document_ids.length, 2);
  assert.equal(record.lines.length, 2);
  assert.equal(repo.all("inventory")[0].quantity, "10.000");
});
test("warehouse tasks cannot be completed without recording assigned quantities", () => {
  const { service, u, task } = warehouse();
  service.run(
    u("manager"),
    "tasks",
    "progress",
    task.id,
    { version: 1, status: "IN_PROGRESS" },
    "start-task",
  );
  assert.throws(
    () =>
      service.run(
        u("manager"),
        "tasks",
        "progress",
        task.id,
        { version: 2, status: "COMPLETED" },
        "complete-task",
      ),
    (e) => e.code === "INVALID_STATE",
  );
});
