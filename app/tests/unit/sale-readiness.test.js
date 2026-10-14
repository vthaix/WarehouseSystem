const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  assertReady,
  saleReadiness,
} = require("../../src/services/warehouse-service/modules/stock-requests/sale-readiness");
const ready = {
  report_status: "SUBMITTED",
  production_completed: 1,
  production_status: "COMPLETED",
  latest_delivery_date: "2026-10-13",
  workshop_id: "1",
};
test("dispatch requires completed production, submitted confirmed report and due delivery date", () => {
  assert.equal(assertReady(ready, "2026-10-13"), ready);
  assert.equal(
    assertReady({ ...ready, latest_delivery_date: "2026-10-12" }, "2026-10-13")
      .production_completed,
    1,
  );
  for (const row of [
    null,
    { ...ready, report_status: "DRAFT" },
    { ...ready, production_completed: 0 },
    { ...ready, production_status: "IN_PROGRESS" },
  ])
    assert.throws(
      () => assertReady(row, "2026-10-13"),
      (e) => e.code === "PRODUCTION_NOT_COMPLETED",
    );
  for (const date of ["2026-10-14", null])
    assert.throws(
      () => assertReady({ ...ready, latest_delivery_date: date }, "2026-10-13"),
      (e) => e.code === "DELIVERY_NOT_DUE",
    );
});
test("sale plan from another workshop is rejected even when production is complete", async () => {
  const connection = {
    execute: async () => [[{ ...ready, latest_delivery_date: "2000-01-01" }]],
  };
  await assert.rejects(
    () => saleReadiness(connection, "1", "2"),
    (e) => e.code === "FORBIDDEN",
  );
});
