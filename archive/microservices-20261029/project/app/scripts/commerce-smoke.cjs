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
      "Commerce smoke chỉ chạy với dữ liệu demo ngoài production.",
    );
  const pool = getPool();
  const [[assignedWorkshop]] = await pool.execute(
    "SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id JOIN workshops w ON w.id=wu.workshop_id WHERE u.username='workshop' AND w.is_active=1 ORDER BY wu.workshop_id LIMIT 1",
  );
  assert.ok(assignedWorkshop);
  const workshopId = String(assignedWorkshop.workshop_id);
  let planId,
    purchaseId,
    lotId,
    campaignId,
    qcId,
    stockRequestId,
    taskId,
    documentId,
    reviewKey,
    dispatchKey,
    postKey,
    customerOrderId,
    productionPlanId,
    orderReviewKey,
    productionReportId,
    groupedHeaderId,
    planOnlyRequestId;
  const groupedDetailIds = [];
  try {
    const planner = client(),
      director = client(),
      purchaser = client(),
      manager = client(),
      qc = client(),
      workshop = client(),
      staff = client();
    await planner.login("planner");
    const [items] = await pool.execute(
      "SELECT id FROM items WHERE kind='MATERIAL' AND is_active=1 LIMIT 2",
    );
    const [suppliers] = await pool.execute(
      "SELECT id FROM suppliers WHERE is_active=1 LIMIT 1",
    );
    assert.ok(items.length === 2 && suppliers.length);
    const date = new Date(Date.now() + 14 * 86400000)
      .toISOString()
      .slice(0, 10);
    const customer = client();
    await customer.login("customer");
    const samples = await customer.call("/api/v1/sample-items");
    const sample = samples.data[0];
    const order = await customer.call("/api/v1/customer-orders", "POST", {
      delivery_address: "Kiểm thử nguồn mua NVL",
      latest_delivery_date: date,
      lines: [{ item_id: sample.id, quantity: "1.000" }],
    });
    assert.equal(order.status, 201, JSON.stringify(order));
    customerOrderId = order.data.id;
    const received = await planner.call(
      `/api/v1/customer-orders/${customerOrderId}/receive`,
      "POST",
      { version: order.data.version },
    );
    assert.equal(received.status, 200, JSON.stringify(received));
    const importedOrder=await planner.call('/api/v1/source-imports/production-plans?source_id='+customerOrderId);
    assert.equal(importedOrder.status,200,JSON.stringify(importedOrder));assert.equal(importedOrder.data.outputs[0].quantity,'1.000');assert.equal(importedOrder.data.outputs[0].item_id,sample.id);
    const production = await planner.call("/api/v1/production-plans", "POST", {
      customer_order_id: customerOrderId,
      workshop_id: workshopId,
      start_date: date,
      end_date: date,
      outputs: [{ item_id: sample.id, quantity: "1.000" }],
      materials: [{ item_id: String(items[0].id), required_quantity: "5.000" }],
    });
    assert.equal(production.status, 201, JSON.stringify(production));
    productionPlanId = production.data.id;
    assert.equal(production.data.materials[0].base_quantity,'5.000');assert.equal(production.data.materials[0].required_quantity,'5.500');assert.equal(production.data.materials[0].estimated_shortage_quantity,'5.500');
    await director.login("director");
    orderReviewKey = crypto.randomUUID();
    const orderApproved = await director.call(
      `/api/v1/production-plans/${productionPlanId}/review`,
      "POST",
      { version: production.data.version, decision: "APPROVE" },
      orderReviewKey,
    );
    assert.equal(orderApproved.status, 200, JSON.stringify(orderApproved));
    await workshop.login("workshop");
    const importedMaterials=await workshop.call('/api/v1/source-imports/production-reports?source_id='+productionPlanId);
    assert.equal(importedMaterials.status,200,JSON.stringify(importedMaterials));assert.equal(importedMaterials.data.lines[0].required_quantity,'5.500');
    const remainingOrder=await planner.call('/api/v1/source-imports/production-plans?source_id='+customerOrderId);assert.equal(remainingOrder.status,200);assert.deepEqual(remainingOrder.data.outputs,[]);
    const [[earlyWarehouse]]=await pool.execute('SELECT id FROM warehouses WHERE is_active=1 LIMIT 1');
    const [[earlyManager]]=await pool.execute("SELECT id FROM users WHERE username='manager'");
    const planOnly=await workshop.call('/api/v1/stock-requests','POST',{purpose:'PRODUCTION_ISSUE',workflow_source_id:productionPlanId,workshop_id:workshopId,warehouse_id:String(earlyWarehouse.id),manager_id:String(earlyManager.id),requested_date:date,lines:[{item_id:String(items[0].id),quantity:'0.250'}]});
    assert.equal(planOnly.status,201,JSON.stringify(planOnly));planOnlyRequestId=planOnly.data.id;assert.equal(planOnly.data.production_report_id,null);
    const cancelledPlanOnly=await workshop.call('/api/v1/stock-requests/'+planOnlyRequestId,'DELETE',{version:planOnly.data.version});assert.equal(cancelledPlanOnly.status,200,JSON.stringify(cancelledPlanOnly));
    const actualReport = await workshop.call(
      "/api/v1/production-reports",
      "POST",
      {
        production_plan_id: productionPlanId,
        lines: [
          {
            item_id: String(items[0].id),
            available_quantity: "0.000",
            required_quantity: "5.000",
          },
          {
            item_id: String(items[1].id),
            available_quantity: "0.000",
            required_quantity: "1.000",
          },
        ],
      },
    );
    assert.equal(actualReport.status, 201, JSON.stringify(actualReport));
    productionReportId = actualReport.data.id;
    const sent = await workshop.call(
      `/api/v1/production-reports/${productionReportId}/submit`,
      "POST",
      { version: actualReport.data.version },
    );
    assert.equal(sent.status, 200, JSON.stringify(sent));
    const plan = await planner.call("/api/v1/business-plans", "POST", {
      type: "PURCHASE",
      supplier_id: String(suppliers[0].id),
      production_plan_id: productionPlanId,
      production_report_id: productionReportId,
      planned_date: date,
      lines: [
        {
          item_id: String(items[0].id),
          quantity: "5.000",
          unit_price: "10.0000",
        },
        {
          item_id: String(items[1].id),
          quantity: "1.000",
          unit_price: "0.0000",
        },
      ],
    });
    assert.equal(plan.status, 201, JSON.stringify(plan));
    planId = plan.data.id;
    assert.equal(plan.data.total_amount, "50.0000");
    await director.login("director");
    reviewKey = crypto.randomUUID();
    const approved = await director.call(
      `/api/v1/business-plans/${planId}/review`,
      "POST",
      { version: plan.data.version, decision: "APPROVE" },
      reviewKey,
    );
    assert.equal(approved.status, 200, JSON.stringify(approved));
    assert.equal(approved.data.status, "APPROVED");
    const replay = await director.call(
      `/api/v1/business-plans/${planId}/review`,
      "POST",
      { version: plan.data.version, decision: "APPROVE" },
      reviewKey,
    );
    assert.equal(replay.status, 200, JSON.stringify(replay));
    await purchaser.login("purchaser");
    const purchase = await purchaser.call("/api/v1/purchase-orders", "POST", {
      supplier_id: String(suppliers[0].id),
      business_plan_id: planId,
      expected_delivery_date: date,
      delivery_terms: "Giao tại kho.",
    });
    assert.equal(purchase.status, 201, JSON.stringify(purchase));
    purchaseId = purchase.data.id;
    assert.equal(purchase.data.lines.length, 2);
    assert.equal(
      (
        await purchaser.call("/api/v1/purchase-orders", "POST", {
          business_plan_id: planId,
          expected_delivery_date: date,
          delivery_terms: "Trùng",
        })
      ).status,
      409,
    );
    await manager.login("manager");
    const importReceipt=await manager.call('/api/v1/source-imports/lots?source_id='+purchaseId);assert.equal(importReceipt.status,200,JSON.stringify(importReceipt));assert.equal(importReceipt.data.lines[0].quantity,'5.000');
    const code =
      "LOT-TEST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const lot = await manager.call("/api/v1/lots", "POST", {
      code,
      purchase_order_line_id: purchase.data.lines[0].id,
      purchase_order_id: purchaseId,
      received_quantity: "2.000",
    });
    assert.equal(lot.status, 201, JSON.stringify(lot));
    lotId = lot.data.id;
    const remainingReceipt=await manager.call('/api/v1/source-imports/lots?source_id='+purchaseId);assert.equal(remainingReceipt.status,200);assert.equal(remainingReceipt.data.lines[0].quantity,'3.000');
    const grouped = await manager.call("/api/v1/lots", "POST", {
      code: code + "-GROUP",
      lines: [
        {
          purchase_order_line_id: purchase.data.lines[0].id,
          received_quantity: "1.000",
        },
        {
          purchase_order_line_id: purchase.data.lines[1].id,
          received_quantity: "1.000",
        },
      ],
    });
    assert.equal(grouped.status, 201, JSON.stringify(grouped));
    groupedHeaderId = grouped.data.lot_header_id;
    groupedDetailIds.push(...grouped.data.lines.map((r) => r.id));
    assert.equal(grouped.data.lines.length, 2);
    assert.equal(
      new Set(grouped.data.lines.map((r) => String(r.item_id))).size,
      2,
    );
    assert.ok(
      grouped.data.lines.every((r) => r.lot_header_id === groupedHeaderId),
    );
    const header = await manager.call("/api/v1/lot-headers/" + groupedHeaderId);
    assert.equal(header.data.details.length, 2);
    assert.equal(
      (
        await manager.call("/api/v1/lots", "POST", {
          code: code + "-OVER",
          purchase_order_line_id: purchase.data.lines[0].id,
          received_quantity: "4.000",
        })
      ).status,
      422,
    );
    const [inspectors] = await pool.execute(
      "SELECT id FROM users WHERE username='qc' LIMIT 1",
    );
    const start = date+'T08:00:00+07:00';
    const end = date+'T09:00:00+07:00';
    const schedule = await director.call("/api/v1/quality-campaigns", "POST", {
      campaign_type: "QUALITY_CHECK",
      quality_kind: "MATERIAL",
      planned_date: date,
      start_at: start,
      end_at: end,
      location: "Khu QC thử nghiệm",
      assignee_ids: [String(inspectors[0].id)],
      lot_ids: [lotId],
    });
    assert.equal(schedule.status, 201, JSON.stringify(schedule));
    campaignId = schedule.data.id;
    const started = await director.call(
      `/api/v1/quality-campaigns/${campaignId}/start`,
      "POST",
      { version: schedule.data.version },
    );
    assert.equal(started.status, 200, JSON.stringify(started));
    await qc.login("qc");
    const inspected = await qc.call("/api/v1/qc-inspections", "POST", {
      campaign_id: campaignId,
      inspected_at: new Date().toISOString(),
      lines: [
        {
          lot_id: lotId,
          inspected_quantity: "2.000",
          passed_quantity: "1.500",
          failed_quantity: "0.500",
          issue: "Hư hỏng khi vận chuyển",
        },
      ],
    });
    assert.equal(inspected.status, 201, JSON.stringify(inspected));
    qcId = inspected.data.id;
    const [returned]=await pool.execute("SELECT r.quantity,r.original_lot_detail_id,h.return_direction FROM returned_lot_lines r JOIN lot_headers h ON h.id=r.lot_header_id JOIN qc_inspection_lines q ON q.id=r.qc_inspection_line_id WHERE q.qc_inspection_id=?",[qcId]);
    assert.equal(returned.length,1);assert.equal(returned[0].quantity,'0.500');assert.equal(returned[0].return_direction,'NCC');assert.equal(String(returned[0].original_lot_detail_id),lotId);
    const completed = await director.call(
      `/api/v1/quality-campaigns/${campaignId}`,
    );
    assert.equal(completed.data.status, "COMPLETED");
    const [[checkedLot]] = await pool.execute(
      "SELECT qc_status FROM lots WHERE id=?",
      [lotId],
    );
    assert.equal(checkedLot.qc_status, "PARTIAL");
    await workshop.login("workshop");
    const [warehouses] = await pool.execute(
      "SELECT id FROM warehouses WHERE is_active=1 LIMIT 1",
    );
    const [managers] = await pool.execute(
      "SELECT id FROM users WHERE username='manager' LIMIT 1",
    );
    const qcReceipt=await workshop.call('/api/v1/source-imports/stock-requests?workflow_source=true&purpose=PURCHASE_RECEIPT&source_id='+planId+'&workshop_id='+workshopId+'&warehouse_id='+String(warehouses[0].id));
    assert.equal(qcReceipt.status,200,JSON.stringify(qcReceipt));assert.equal(qcReceipt.data.lines[0].quantity,'1.500');assert.equal(qcReceipt.data.lines.length,1);
    const request = await workshop.call("/api/v1/stock-requests", "POST", {
      purpose: "PURCHASE_RECEIPT",
      workflow_source_id: planId,
      workshop_id: workshopId,
      warehouse_id: String(warehouses[0].id),
      manager_id: String(managers[0].id),
      requested_date: date,
      requested_at:date+'T10:30:00+07:00',
      lines: [{ item_id: String(items[0].id), quantity: "1.500" }],
    });
    assert.equal(request.status, 201, JSON.stringify(request));
    assert.equal(request.data.requested_at,new Date(date+'T10:30:00+07:00').toISOString());
    assert.ok(request.data.source_lots.some(l=>l.lot_id===String(lotId)));
    stockRequestId = request.data.id;
    assert.equal(request.data.lines[0].remaining_quantity, "1.500");
    const [locations] = await pool.execute(
      "SELECT id FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 LIMIT 1",
      [warehouses[0].id],
    );
    const [staffUsers] = await pool.execute(
      "SELECT id FROM users WHERE username='staff' LIMIT 1",
    );
    dispatchKey = crypto.randomUUID();
    const dispatch = await manager.call(
      `/api/v1/stock-requests/${stockRequestId}/dispatch`,
      "POST",
      {
        version: request.data.version,
        start_at: start,
        end_at: end,
        allocations: [
          {
            assignee_id: String(staffUsers[0].id),
            stock_request_line_id: request.data.lines[0].id,
            lot_id: lotId,
            location_id: String(locations[0].id),
            quality_bucket: "AVAILABLE",
            quantity: "1.500",
          },
        ],
      },
      dispatchKey,
    );
    assert.equal(dispatch.status, 200, JSON.stringify(dispatch));
    taskId = dispatch.data.tasks[0].id;
    await staff.login("staff");
    postKey = crypto.randomUUID();
    const posting = await staff.call(
      "/api/v1/stock-documents",
      "POST",
      {
        stock_request_id: stockRequestId,
        request_version: dispatch.data.version,
        task_id: taskId,
        allocations: [
          {
            stock_request_line_id: request.data.lines[0].id,
            lot_id: lotId,
            location_id: String(locations[0].id),
            quality_bucket: "AVAILABLE",
            quantity: "0.500",
          },
        ],
      },
      postKey,
    );
    assert.equal(posting.status, 201, JSON.stringify(posting));
    documentId = posting.data.id;
    const replayPost = await staff.call(
      "/api/v1/stock-documents",
      "POST",
      {
        stock_request_id: stockRequestId,
        request_version: dispatch.data.version,
        task_id: taskId,
        allocations: [
          {
            stock_request_line_id: request.data.lines[0].id,
            lot_id: lotId,
            location_id: String(locations[0].id),
            quality_bucket: "AVAILABLE",
            quantity: "0.500",
          },
        ],
      },
      postKey,
    );
    assert.equal(replayPost.status, 201, JSON.stringify(replayPost));
    assert.equal(replayPost.data.id, documentId);
    const [[balance]] = await pool.execute(
      "SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE'",
      [lotId, locations[0].id],
    );
    assert.equal(String(balance.quantity), "0.500");
    const automaticRecords = await manager.call("/api/v1/warehouse-records");
    assert.ok(
      automaticRecords.data.some((r) => r.stock_request_id === stockRequestId),
    );
    const inventoryAccess = await workshop.call("/api/v1/reports/inventory");
    for(const resource of ['items','categories','warehouses','warehouse-locations','lots']){
      const read=await workshop.call('/api/v1/catalog-data?resource='+resource);assert.equal(read.status,200,JSON.stringify(read));
      assert.equal((await workshop.call('/api/v1/'+resource,'POST',{})).status,403);
    }
    assert.equal(inventoryAccess.status, 200, JSON.stringify(inventoryAccess));
    await require("./production-delivery-flow.cjs")({
      pool,
      workshop,
      manager,
      staff,
      director,
      planner,
      qc,
      productionPlanId,
      productionReportId,
      customerOrderId,
      workshopId,
      warehouseId: String(warehouses[0].id),
      managerId: String(managers[0].id),
      staffId: String(staffUsers[0].id),
      inspectorId: String(inspectors[0].id),
      locationId: String(locations[0].id),
      materialId: String(items[0].id),
      finishedItemId: sample.id,
      lotId,
      date,
    });
    console.log(
      "COMMERCE PASS: purchase plan, order, QC, request, dispatch, one-time stock posting.",
    );
  } finally {
    try {
      if(planOnlyRequestId){await pool.execute('DELETE FROM stock_request_lines WHERE stock_request_id=?',[planOnlyRequestId]);await pool.execute('DELETE FROM stock_requests WHERE id=?',[planOnlyRequestId]);await pool.execute("DELETE FROM audit_logs WHERE resource_type='stock-requests' AND resource_id=?",[planOnlyRequestId]);}
      if (documentId) {
        await pool.execute(
          "DELETE FROM inventory_movements WHERE stock_document_line_id IN (SELECT id FROM stock_document_lines WHERE stock_document_id=?)",
          [documentId],
        );
        await pool.execute(
          "DELETE FROM stock_document_lines WHERE stock_document_id=?",
          [documentId],
        );
        await pool.execute("DELETE FROM stock_documents WHERE id=?", [
          documentId,
        ]);
      }
      if (qcId) {
        const [returned] = await pool.execute(
          "SELECT r.lot_header_id FROM returned_lot_lines r JOIN qc_inspection_lines q ON q.id=r.qc_inspection_line_id WHERE q.qc_inspection_id=?",
          [qcId],
        );
        await pool.execute(
          "DELETE FROM returned_lot_lines WHERE qc_inspection_line_id IN (SELECT id FROM qc_inspection_lines WHERE qc_inspection_id=?)",
          [qcId],
        );
        for (const r of returned)
          await pool.execute("DELETE FROM lot_headers WHERE id=?", [
            r.lot_header_id,
          ]);
      }
      if (lotId)
        await pool.execute("DELETE FROM inventory_balances WHERE lot_id=?", [
          lotId,
        ]);
      if (taskId) {
        await pool.execute("DELETE FROM stock_allocations WHERE task_id=?", [
          taskId,
        ]);
        await pool.execute("DELETE FROM task_assignments WHERE task_id=?", [
          taskId,
        ]);
        await pool.execute("DELETE FROM tasks WHERE id=?", [taskId]);
      }
      if (stockRequestId) {
        await pool.execute(
          "DELETE FROM stock_request_lines WHERE stock_request_id=?",
          [stockRequestId],
        );
        await pool.execute("DELETE FROM stock_requests WHERE id=?", [
          stockRequestId,
        ]);
      }
      if (qcId) {
        await pool.execute(
          "DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?",
          [qcId],
        );
        await pool.execute("DELETE FROM qc_inspections WHERE id=?", [qcId]);
      }
      if (campaignId) {
        await pool.execute(
          "DELETE FROM quality_campaign_lots WHERE campaign_id=?",
          [campaignId],
        );
        await pool.execute(
          "DELETE FROM quality_campaign_assignments WHERE campaign_id=?",
          [campaignId],
        );
        await pool.execute("DELETE FROM stocktakes WHERE id=?", [campaignId]);
      }
      if (lotId) await pool.execute("DELETE FROM lots WHERE id=?", [lotId]);
      for (const id of groupedDetailIds) {
        await pool.execute(
          "DELETE FROM audit_logs WHERE resource_type='lots' AND resource_id=?",
          [id],
        );
        await pool.execute("DELETE FROM lots WHERE id=?", [id]);
      }
      if (groupedHeaderId)
        await pool.execute("DELETE FROM lot_headers WHERE id=?", [
          groupedHeaderId,
        ]);
      if (purchaseId) {
        await pool.execute(
          "DELETE FROM purchase_order_lines WHERE purchase_order_id=?",
          [purchaseId],
        );
        await pool.execute("DELETE FROM purchase_orders WHERE id=?", [
          purchaseId,
        ]);
      }
      if (planId) {
        await pool.execute(
          "DELETE FROM business_plan_lines WHERE business_plan_id=?",
          [planId],
        );
        await pool.execute("DELETE FROM business_plans WHERE id=?", [planId]);
      }
      if (productionPlanId) {
        if (productionReportId) {
          await pool.execute(
            "DELETE FROM production_report_lines WHERE production_report_id=?",
            [productionReportId],
          );
          await pool.execute("DELETE FROM production_reports WHERE id=?", [
            productionReportId,
          ]);
          await pool.execute(
            "DELETE FROM notifications WHERE resource_type='production-reports' AND resource_id=?",
            [productionReportId],
          );
          await pool.execute(
            "DELETE FROM audit_logs WHERE resource_type='production-reports' AND resource_id=?",
            [productionReportId],
          );
        }
        await pool.execute(
          "DELETE FROM notifications WHERE resource_type='production-plans' AND resource_id=?",
          [productionPlanId],
        );
        await pool.execute(
          "DELETE FROM production_plan_materials WHERE production_plan_id=?",
          [productionPlanId],
        );
        await pool.execute(
          "DELETE FROM production_plan_outputs WHERE production_plan_id=?",
          [productionPlanId],
        );
        await pool.execute("DELETE FROM production_plans WHERE id=?", [
          productionPlanId,
        ]);
        await pool.execute(
          "DELETE FROM audit_logs WHERE resource_type='production-plans' AND resource_id=?",
          [productionPlanId],
        );
      }
      if (customerOrderId) {
        await pool.execute(
          "DELETE FROM notifications WHERE resource_type='customer-orders' AND resource_id=?",
          [customerOrderId],
        );
        await pool.execute(
          "DELETE FROM customer_order_lines WHERE customer_order_id=?",
          [customerOrderId],
        );
        await pool.execute("DELETE FROM customer_orders WHERE id=?", [
          customerOrderId,
        ]);
        await pool.execute(
          "DELETE FROM audit_logs WHERE resource_type='customer-orders' AND resource_id=?",
          [customerOrderId],
        );
      }
      if (orderReviewKey)
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='production-plan-review' AND idempotency_key=?",
          [orderReviewKey],
        );
      if (reviewKey)
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='business-plan-review' AND idempotency_key=?",
          [reviewKey],
        );
      if (dispatchKey)
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='stock-dispatch' AND idempotency_key=?",
          [dispatchKey],
        );
      if (postKey)
        await pool.execute(
          "DELETE FROM idempotency_records WHERE operation='stock-post' AND idempotency_key=?",
          [postKey],
        );
      await pool.execute(
        "DELETE FROM audit_logs WHERE (resource_type='business-plans' AND resource_id=?) OR (resource_type='purchase-orders' AND resource_id=?) OR (resource_type='lots' AND resource_id=?) OR (resource_type='stocktakes' AND resource_id=?) OR (resource_type='qc-inspections' AND resource_id=?) OR (resource_type='stock-requests' AND resource_id=?) OR (resource_type='stock-documents' AND resource_id=?)",
        [
          planId || 0,
          purchaseId || 0,
          lotId || 0,
          campaignId || 0,
          qcId || 0,
          stockRequestId || 0,
          documentId || 0,
        ],
      );
    } finally {
      await closePool();
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
