const C = require("../../services/domain/core");
const saleReportScope = require("../../shared/sale-report-scope");
const { saleReadiness } = require("../stock-requests/sale-readiness");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const amount = (value) => C.qty(String(value), false);
const unique = (values) => [...new Set(values)];
const marks = (values) => values.map(() => "?").join(",");
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

function allocationCount(lines) {
  invalid(!Array.isArray(lines) || !lines.length || lines.length > 200, "Phân công cần 1 đến 200 dòng.");
}

function allocationFormat(lines) {
  const seen = new Set();
  for (const line of lines) {
    C.fields(line, ["assignee_id", "stock_request_line_id", "lot_id", "location_id", "quality_bucket", "quantity"]);
    const ids = [line.assignee_id, line.stock_request_line_id, line.lot_id, line.location_id];
    invalid(ids.some((id) => !isId(id)) || line.quality_bucket !== "AVAILABLE", "Phân công lô, vị trí hoặc nhân viên không hợp lệ.");
    C.qty(line.quantity);

    const key = ids.join(":");
    invalid(seen.has(key), "Dòng phân công trùng.");
    seen.add(key);
  }
}

async function warehouseNotCounting(db, warehouseId) {
  await db.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [warehouseId]);
  const [counting] = await db.execute(
    "SELECT id FROM stocktake_warehouses WHERE warehouse_id=? AND status IN ('COUNTING','COMPLETED') LIMIT 1",
    [warehouseId],
  );
  C.fail(counting.length, "WAREHOUSE_FROZEN", "Kho đang kiểm kê.", 409);
}

async function productionSource(db, requests, request) {
  if (!["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT"].includes(request.purpose)) return;
  const byPlan = ["PLAN", "MANUAL"].includes(request.production_source_mode);
  C.fail(!request.production_report_id && !byPlan, "SOURCE_REQUIRED",
    "Yêu cầu lịch sử thiếu báo cáo nguồn; không được suy đoán lượng xuất.", 409);
  const sourceId = byPlan ? request.production_plan_id : request.production_report_id;
  await requests.source(db, request.purpose, sourceId, request.workshop_id, request.production_source_mode);
}

async function saleSource(db, request) {
  if (request.purpose !== "SALE_ISSUE") return null;
  await saleReadiness(db, request.business_plan_id, request.workshop_id);
  const [[plan]] = await db.execute("SELECT * FROM business_plans WHERE id=? FOR UPDATE", [request.business_plan_id]);
  const approved = plan && plan.finished_report_id && ["APPROVED", "IN_PROGRESS"].includes(plan.status);
  C.fail(!approved, "INVALID_STATE", "Cần kế hoạch bán đã duyệt có nguồn báo cáo.", 409);
  return plan.finished_report_id;
}

async function warehouseStaff(db, assigneeIds) {
  const [users] = await db.execute(
    "SELECT DISTINCT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id" +
      ` WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_STAFF' AND u.id IN (${marks(assigneeIds)})`,
    assigneeIds,
  );
  invalid(users.length !== assigneeIds.length, "Người được giao không phải nhân viên kho.");
}

async function noScheduleConflict(db, assigneeIds, time, requestId) {
  if (!assigneeIds.length) return;
  const [busy] = await db.execute(
    "SELECT t.code,u.full_name FROM tasks t JOIN task_assignments a ON a.task_id=t.id JOIN users u ON u.id=a.user_id" +
      ` WHERE a.user_id IN (${marks(assigneeIds)})` +
      " AND t.status IN ('PLANNED','IN_PROGRESS') AND t.start_at<? AND t.end_at>?" +
      " AND (t.stock_request_id IS NULL OR t.stock_request_id<>?) LIMIT 1",
    [...assigneeIds, time.end, time.start, requestId],
  );
  C.fail(busy.length, "SCHEDULE_CONFLICT",
    `Lịch trùng: ${busy[0]?.full_name} đã có công việc ${busy[0]?.code} trong khung giờ này. Chọn giờ hoặc nhân viên khác.`, 409);
}

async function allocationLines(db, { request, detail, kept, lines, saleReportId }) {
  const remaining = remainingByLine(detail, kept);
  const lots = await loadLots(db, lines);
  const locations = await loadLocations(db, lines);
  const reserved = new Map();

  for (const line of lines) {
    const requestLine = detail.lines.find((row) => row.id === String(line.stock_request_line_id));
    const lot = lots.get(String(line.lot_id));
    const location = locations.get(String(line.location_id));

    if (saleReportId) await lotInSaleSource(db, saleReportId, line.lot_id);
    lotFitsRequest(request, requestLine, lot, location);
    zoneFitsItem(request, lot, location);
    lotNotExpired(lot);
    await lotInRequestSource(db, request, lot);

    const quantity = C.qty(line.quantity);
    takeRemaining(remaining, requestLine.id, quantity);
    if (request.type === "OUT") await enoughStock(db, line, quantity, reserved);
    else await enoughPassedQuantity(db, line, lot, quantity, reserved);
  }
}

function remainingByLine(detail, kept) {
  const remaining = new Map(detail.lines.map((line) => [line.id, amount(line.remaining_quantity)]));
  for (const a of kept) {
    const lineId = String(a.stock_request_line_id);
    const assigned = C.qty(String(a.quantity)) - amount(a.posted_quantity);
    remaining.set(lineId, (remaining.get(lineId) || 0n) - assigned);
  }
  return remaining;
}

function takeRemaining(remaining, lineId, quantity) {
  const rest = (remaining.get(lineId) || 0n) - quantity;
  C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Phân công vượt lượng yêu cầu còn lại.");
  remaining.set(lineId, rest);
}

async function loadLots(db, lines) {
  const ids = unique(lines.map((line) => String(line.lot_id))).sort((a, b) => Number(a) - Number(b));
  const [rows] = await db.execute(
    "SELECT l.id,l.item_id,i.category_id,l.received_quantity,l.expiry_date,l.qc_status,l.purchase_order_line_id,l.production_plan_id,q.passed_quantity" +
      " FROM lots l JOIN items i ON i.id=l.item_id JOIN qc_inspection_lines q ON q.lot_id=l.id" +
      ` WHERE l.id IN (${marks(ids)}) ORDER BY l.id FOR UPDATE`,
    ids,
  );
  return new Map(rows.map((lot) => [String(lot.id), lot]));
}

async function loadLocations(db, lines) {
  const ids = unique(lines.map((line) => String(line.location_id)));
  const [rows] = await db.execute(
    `SELECT id,warehouse_id,zone_category_id FROM warehouse_locations WHERE is_active=1 AND id IN (${marks(ids)})`,
    ids,
  );
  return new Map(rows.map((row) => [String(row.id), row]));
}

function lotFitsRequest(request, requestLine, lot, location) {
  const fits = requestLine && lot && location &&
    String(location.warehouse_id) === String(request.warehouse_id) &&
    String(lot.item_id) === requestLine.item_id &&
    ["PASSED", "PARTIAL"].includes(lot.qc_status);
  invalid(!fits, "Lô hoặc vị trí không phù hợp yêu cầu.");
}

function zoneFitsItem(request, lot, location) {
  const wrongZone = request.type === "IN" && location.zone_category_id != null &&
    String(location.zone_category_id) !== String(lot.category_id);
  C.fail(wrongZone, "ZONE_ITEM_MISMATCH", "Vị trí không thuộc khu của mặt hàng này. Chọn đúng khu khi phân công nhập.", 422);
}

function lotNotExpired(lot) {
  const today = new Date().toISOString().slice(0, 10);
  const expired = lot.expiry_date && lot.expiry_date.toISOString().slice(0, 10) < today;
  C.fail(expired, "INVALID_STATE", "Dòng lô đã hết hạn.", 409);
}

async function lotInSaleSource(db, saleReportId, lotId) {
  const [found] = await db.execute(
    "SELECT o.id FROM finished_report_outputs o WHERE " + saleReportScope("o") + " AND o.lot_id=?",
    [saleReportId, lotId],
  );
  invalid(!found.length, "Dòng lô không thuộc nguồn kế hoạch bán.");
}

async function lotInRequestSource(db, request, lot) {
  if (request.purpose === "PURCHASE_RECEIPT") return lotInPurchaseOrder(db, request, lot);
  if (request.purpose === "PRODUCTION_RECEIPT") return lotInProduction(db, request, lot);
}

async function lotInPurchaseOrder(db, request, lot) {
  const [found] = await db.execute(
    "SELECT id FROM purchase_order_lines WHERE id=? AND purchase_order_id=? AND item_id=?",
    [lot.purchase_order_line_id, request.purchase_order_id, lot.item_id],
  );
  invalid(!found.length, "Lô không thuộc đơn mua nguồn.");
}

async function lotInProduction(db, request, lot) {
  invalid(String(lot.production_plan_id) !== String(request.production_plan_id), "Lô không thuộc kế hoạch sản xuất.");
  if (request.production_source_mode === "MANUAL") {
    const [found] = await db.execute("SELECT id FROM lots WHERE id=? AND production_receipt_request_id=?", [lot.id, request.id]);
    invalid(!found.length, "Lô không thuộc đợt nhập thành phẩm này.");
    return;
  }
  const [found] = await db.execute(
    "SELECT id FROM finished_report_outputs WHERE finished_report_id=? AND lot_id=?",
    [request.production_report_id, lot.id],
  );
  invalid(!found.length, "Dòng lô không thuộc báo cáo thành phẩm nguồn.");
}

async function enoughStock(db, line, quantity, reserved) {
  const [balances] = await db.execute(
    "SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE' FOR UPDATE",
    [line.lot_id, line.location_id],
  );
  const [[held]] = await db.execute(
    "SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      " WHERE a.lot_id=? AND a.location_id=? AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'",
    [line.lot_id, line.location_id],
  );
  const inStock = balances.length ? amount(balances[0].quantity) : 0n;
  const wanted = addReserved(reserved, `${line.lot_id}:${line.location_id}`, quantity);
  C.fail(wanted > inStock - amount(held.quantity), "INSUFFICIENT_STOCK", "Không đủ tồn khả dụng để phân công.", 409);
}

async function enoughPassedQuantity(db, line, lot, quantity, reserved) {
  const [[posted]] = await db.execute(
    "SELECT COALESCE(SUM(dl.quantity),0) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id" +
      " WHERE dl.lot_id=? AND d.type='IN'",
    [line.lot_id],
  );
  const [[held]] = await db.execute(
    "SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      " WHERE a.lot_id=? AND t.task_type='WAREHOUSE_IN' AND t.status<>'CANCELLED'",
    [line.lot_id],
  );
  const left = amount(lot.passed_quantity) - amount(posted.quantity) - amount(held.quantity);
  const wanted = addReserved(reserved, String(line.lot_id), quantity);
  C.fail(wanted > left, "SOURCE_LIMIT_EXCEEDED", "Lô không còn đủ lượng QC đạt để nhập.");
}

function addReserved(reserved, key, quantity) {
  const total = (reserved.get(key) || 0n) + quantity;
  reserved.set(key, total);
  return total;
}

module.exports = {
  allocationCount, allocationFormat, warehouseNotCounting, productionSource, saleSource,
  warehouseStaff, noScheduleConflict, allocationLines,
};
