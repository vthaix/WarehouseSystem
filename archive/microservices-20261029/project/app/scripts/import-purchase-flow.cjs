const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
module.exports = async ({
  pool,
  client,
  reportId,
  materialId,
  finishedItemId,
  supplierId,
  date,
  planner,
  customer,
}) => {
  const purchaser = client(),
    manager = client();
  await purchaser.login("purchaser");
  await manager.login("manager");
  const orders = [],
    plans = [],
    lots = [];
  let header;
  const expect = (r, s) => {
    assert.equal(r.status, s, JSON.stringify(r));
    return r.data;
  };
  const body = (mode, quantity) => ({
    source_mode: mode,
    supplier_id: supplierId,
    ...(mode === "REPORT" ? { production_report_id: reportId } : {}),
    expected_delivery_date: date,
    delivery_terms: "Import acceptance",
    lines: [{ item_id: materialId, quantity, unit_price: "3.4567" }],
  });
  try {
    const options = expect(
      await purchaser.call("/api/v1/source-imports/purchase-report-options"),
      200,
    );
    assert.ok(options.some((r) => r.id === reportId));
    const initial = expect(
      await purchaser.call(
        "/api/v1/source-imports/purchase-orders?source_id=" + reportId,
      ),
      200,
    );
    assert.equal(
      initial.lines.find((l) => l.item_id === materialId).quantity,
      "3.000",
    );
    expect(
      await customer.call(
        "/api/v1/source-imports/purchase-orders?source_id=" + reportId,
      ),
      403,
    );
    expect(await purchaser.call("/api/v1/production-reports/" + reportId), 403);
    expect(await manager.call("/api/v1/purchase-orders"), 403);
    expect(
      await purchaser.call("/api/v1/purchase-orders", "POST", {
        ...body("MANUAL", "1.000"),
        production_report_id: reportId,
      }),
      422,
    );
    expect(
      await purchaser.call("/api/v1/purchase-orders", "POST", {
        ...body("MANUAL", "1.000"),
        lines: [
          { item_id: finishedItemId, quantity: "1.000", unit_price: "1.0000" },
        ],
      }),
      422,
    );
    expect(
      await purchaser.call("/api/v1/purchase-orders", "POST", {
        ...body("MANUAL", "1.000"),
        lines: [
          body("MANUAL", "1.000").lines[0],
          body("MANUAL", "1.000").lines[0],
        ],
      }),
      422,
    );
    const manual = expect(
      await purchaser.call(
        "/api/v1/purchase-orders",
        "POST",
        body("MANUAL", "2.123"),
      ),
      201,
    );
    orders.push(manual.id);
    assert.equal(manual.source_mode, "MANUAL");
    assert.equal(manual.business_plan_id, null);
    assert.equal(manual.production_report_id, null);
    assert.equal(manual.total_amount, "7.3386");
    assert.equal(manual.lines[0].business_plan_line_id, null);
    const importLot = expect(
      await manager.call("/api/v1/source-imports/lots?source_id=" + manual.id),
      200,
    );
    assert.equal(importLot.lines[0].quantity, "2.123");
    const lot = expect(
      await manager.call("/api/v1/lots", "POST", {
        code: "IMPORT-" + crypto.randomBytes(8).toString("hex"),
        lines: [
          {
            purchase_order_line_id: manual.lines[0].id,
            received_quantity: "0.500",
          },
        ],
      }),
      201,
    );
    header = lot.lot_header_id;
    lots.push(...lot.lines.map((l) => l.id));
    const afterLot = expect(
      await manager.call("/api/v1/source-imports/lots?source_id=" + manual.id),
      200,
    );
    assert.equal(afterLot.lines[0].quantity, "1.623");
    const races = await Promise.all([
      planner.call(
        "/api/v1/business-plans",
        "POST",
        {type:'PURCHASE',production_report_id:reportId,planned_date:date,lines:body('MANUAL','2.000').lines},
      ),
      planner.call(
        "/api/v1/business-plans",
        "POST",
        {type:'PURCHASE',production_report_id:reportId,planned_date:date,lines:body('MANUAL','2.000').lines},
      ),
    ]);
    for (const r of races) if (r.status === 201) plans.push(r.data.id);
    assert.deepEqual(
      races.map((r) => r.status).sort(),
      [201, 409],
      JSON.stringify(races),
    );
    const remaining = expect(
      await purchaser.call(
        "/api/v1/source-imports/purchase-orders?source_id=" + reportId,
      ),
      200,
    );
    assert.equal(
      remaining.lines.find((l) => l.item_id === materialId).quantity,
      "1.000",
    );
    const planBody = {
      type: "PURCHASE",
      production_report_id: reportId,
      supplier_id: supplierId,
      planned_date: date,
      lines: [{ item_id: materialId, quantity: "1.001", unit_price: "1.0000" }],
    };
    const warning=await planner.call("/api/v1/business-plans", "POST", planBody);
    expect(warning,409);assert.equal(warning.error.code,'PLAN_CONFIRMATION_REQUIRED');
    const extra=expect(await planner.call('/api/v1/business-plans','POST',{...planBody,confirm_plan_overage:true}),201);
    expect(await planner.call('/api/v1/business-plans/'+extra.id,'DELETE',{version:extra.version}),200);
    const plan = expect(
      await planner.call("/api/v1/business-plans", "POST", {
        ...planBody,
        lines: [{ ...planBody.lines[0], quantity: "1.000" }],
      }),
      201,
    );
    plans.push(plan.id);
    expect(
      await purchaser.call(
        "/api/v1/purchase-orders",
        "POST",
        body("REPORT", "0.001"),
      ),
      422,
    );
    const exhausted = expect(
      await purchaser.call(
        "/api/v1/source-imports/purchase-orders?source_id=" + reportId,
      ),
      200,
    );
    assert.deepEqual(exhausted.lines, []);
    console.log(
      "IMPORT PURCHASE PASS: manual purchases, plan source concurrency, disabled REPORT purchase mode, scoped previews, remaining quantities and exact money",
    );
  } finally {
    for (const id of lots)
      await pool.execute("DELETE FROM lots WHERE id=?", [id]);
    if (header)
      await pool.execute("DELETE FROM lot_headers WHERE id=?", [header]);
    for (const id of orders) {
      await pool.execute(
        "DELETE FROM purchase_order_lines WHERE purchase_order_id=?",
        [id],
      );
      await pool.execute("DELETE FROM purchase_orders WHERE id=?", [id]);
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='purchase-orders' AND resource_id=?",
        [id],
      );
    }
    for (const id of plans) {
      await pool.execute(
        "DELETE FROM business_plan_lines WHERE business_plan_id=?",
        [id],
      );
      await pool.execute("DELETE FROM business_plans WHERE id=?", [id]);
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='business-plans' AND resource_id=?",
        [id],
      );
    }
  }
};
