const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const storageQueue = require("../../shared/storage-queue");
const saleReportScope = require("../../shared/sale-report-scope");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const same = (a, b) => String(a) === String(b);
const withTextId = (row) => ({ ...row, id: String(row.id) });
const lotDto = (lot) => ({ ...lot, id: String(lot.id), item_id: String(lot.item_id) });
const balanceDto = (balance) => ({ ...balance, lot_id: String(balance.lot_id), location_id: String(balance.location_id) });

async function previewRequest(flow, user, requestId, query = {}) {
  P.role(user, ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]);
  C.fields(query, ["task_id"]);
  if (query.task_id) C.fail(!isId(query.task_id), "VALIDATION_ERROR", "Công việc không hợp lệ.");

  const db = flow.pool;
  const isManager = user.roles.includes("WAREHOUSE_MANAGER");
  const request = await flow.requests.load(db, user, requestId);
  C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không ghi phiếu kho.", 409);
  C.fail(isManager && !same(request.manager_id, user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);

  const detail = await flow.requests.get(user, requestId);
  const locations = await loadLocations(db, request.warehouse_id);
  const categoryOf = await loadItemCategories(db);
  const lots = await loadLots(db, request, requestId);
  await suggestLocations(db, lots, locations, categoryOf, request.warehouse_id);
  const balances = await loadBalances(db, request.warehouse_id);
  const allocations = await loadAllocations(db, requestId, query.task_id);
  const visible = isManager ? allocations : allocations.filter((a) => same(a.user_id, user.id));
  const frozen = await isCounting(db, request.warehouse_id);

  const view = { request, isManager, lots, locations, balances, visible, categoryOf };
  return {
    request: detail,
    frozen,
    lines: detail.lines
      .filter((line) => isManager || visible.some((a) => same(a.stock_request_line_id, line.id)))
      .map((line) => lineDto(line, view)),
    locations: locations.map(withTextId),
    eligible_lots: lots.filter((lot) => detail.lines.some((line) => line.item_id === String(lot.item_id))).map(lotDto),
    balances: balances.map(balanceDto),
    allocations: visible.map(allocationDto),
  };
}

function lineDto(line, view) {
  const assigned = view.visible.filter((a) => same(a.stock_request_line_id, line.id));
  const isLineLot = (lot) => String(lot.item_id) === line.item_id;
  const lotAllowed = (lot) => isLineLot(lot) && (view.isManager || assigned.some((a) => same(a.lot_id, lot.id)));
  const locationAllowed = (location) =>
    (view.isManager && zoneFits(view, line, location)) || assigned.some((a) => same(a.location_id, location.id));
  const balanceOfLine = (balance) => view.lots.some((lot) => same(lot.id, balance.lot_id) && isLineLot(lot));

  return {
    ...line,
    unit: line.unit || "",
    lots: view.lots.filter(lotAllowed).map(lotDto),
    locations: view.locations.filter(locationAllowed).map(withTextId),
    balances: view.balances.filter(balanceOfLine).map(balanceDto),
  };
}

function zoneFits(view, line, location) {
  if (view.request.type !== "IN" || location.zone_category_id == null) return true;
  return same(location.zone_category_id, view.categoryOf.get(String(line.item_id)));
}

function allocationDto(row) {
  const result = { ...row };
  for (const field of Object.keys(result))
    if (field === "id" || field.endsWith("_id")) result[field] = result[field] == null ? null : String(result[field]);
  return result;
}

async function loadLocations(db, warehouseId) {
  const [rows] = await db.execute(
    "SELECT id,code,name,zone_name,zone_category_id,depth FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 ORDER BY zone_name,depth,id",
    [warehouseId],
  );
  return rows;
}

async function loadItemCategories(db) {
  const [items] = await db.execute("SELECT id,category_id FROM items");
  return new Map(items.map((item) => [String(item.id), item.category_id]));
}

async function loadLots(db, request, requestId) {
  const source = lotSource(request, requestId);
  const [lots] = await db.execute(
    "SELECT l.id,l.code,l.item_id,l.expiry_date,l.received_quantity,l.qc_status,q.passed_quantity," +
      "(SELECT MIN(doc.posted_at) FROM stock_document_lines d JOIN stock_documents doc ON doc.id=d.stock_document_id" +
      " JOIN warehouse_locations pos ON pos.id=d.location_id WHERE d.lot_id=l.id AND doc.type='IN' AND pos.warehouse_id=?) AS first_received_at," +
      "COALESCE((SELECT SUM(d.quantity) FROM stock_document_lines d JOIN stock_documents doc ON doc.id=d.stock_document_id" +
      " WHERE d.lot_id=l.id AND doc.type='IN'),0) AS posted_quantity" +
      " FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id" +
      " JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED'" +
      " WHERE l.qc_status IN ('PASSED','PARTIAL')" +
      " AND (l.expiry_date IS NULL OR l.expiry_date>=DATE(DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 HOUR)))" + source.sql +
      " ORDER BY (l.expiry_date IS NULL),l.expiry_date,(first_received_at IS NULL),first_received_at,l.created_at,l.id LIMIT 500",
    [request.warehouse_id, ...source.params],
  );
  return lots.sort(storageQueue.compare);
}

function lotSource(request, requestId) {
  if (request.production_source_mode === "MANUAL")
    return { sql: " AND l.production_receipt_request_id=?", params: [requestId] };
  if (request.purpose === "PURCHASE_RECEIPT")
    return { sql: " AND l.purchase_order_line_id IN (SELECT id FROM purchase_order_lines WHERE purchase_order_id=?)", params: [request.purchase_order_id] };
  if (request.purpose === "PRODUCTION_RECEIPT")
    return { sql: " AND l.id IN (SELECT lot_id FROM finished_report_outputs WHERE finished_report_id=?)", params: [request.production_report_id] };
  if (request.purpose === "SALE_ISSUE")
    return {
      sql: " AND l.id IN (SELECT o.lot_id FROM finished_report_outputs o JOIN business_plans p ON p.id=? WHERE " +
        saleReportScope("o", "p.finished_report_id") + ")",
      params: [request.business_plan_id],
    };
  return { sql: "", params: [] };
}

async function suggestLocations(db, lots, locations, categoryOf, warehouseId) {
  const [stored] = await db.execute(
    "SELECT b.lot_id,l.item_id,l.expiry_date,b.location_id FROM inventory_balances b JOIN lots l ON l.id=b.lot_id" +
      " JOIN warehouse_locations loc ON loc.id=b.location_id WHERE loc.warehouse_id=? AND b.quantity>0",
    [warehouseId],
  );
  for (const lot of lots) {
    lot.expiry_date = storageQueue.date(lot.expiry_date);
    const category = categoryOf.get(String(lot.item_id));
    const choices = locations.filter((l) => l.zone_category_id == null || same(l.zone_category_id, category));
    const sameItem = stored.filter((row) => same(row.item_id, lot.item_id));
    const suggestion = storageQueue.recommend(lot, choices, sameItem);
    lot.suggested_location_id = suggestion.location_id;
    lot.suggested_location_ids = suggestion.location_ids;
    lot.storage_hint = suggestion.reason;
  }
}

async function loadBalances(db, warehouseId) {
  const reserved =
    "COALESCE((SELECT SUM(a.quantity-a.posted_quantity) FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
    " WHERE a.lot_id=b.lot_id AND a.location_id=b.location_id AND a.quality_bucket=b.quality_bucket" +
    " AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'),0)";
  const [rows] = await db.execute(
    `SELECT b.lot_id,b.location_id,b.quality_bucket,b.quantity,${reserved} AS reserved_quantity,` +
      `GREATEST(b.quantity-${reserved},0) AS available_quantity` +
      " FROM inventory_balances b JOIN warehouse_locations loc ON loc.id=b.location_id WHERE loc.warehouse_id=?",
    [warehouseId],
  );
  return rows;
}

async function loadAllocations(db, requestId, taskId) {
  const [rows] = await db.execute(
    "SELECT a.*,loc.code AS location_code,loc.name AS location_name,loc.zone_name,w.name AS warehouse_name" +
      " FROM stock_allocations a JOIN tasks t ON t.id=a.task_id JOIN warehouse_locations loc ON loc.id=a.location_id" +
      " JOIN warehouses w ON w.id=loc.warehouse_id WHERE a.stock_request_id=? AND t.status<>'CANCELLED'" +
      (taskId ? " AND a.task_id=?" : ""),
    taskId ? [requestId, taskId] : [requestId],
  );
  return rows;
}

async function isCounting(db, warehouseId) {
  const [rows] = await db.execute(
    "SELECT sw.id FROM stocktake_warehouses sw JOIN stocktakes s ON s.id=sw.stocktake_id" +
      " WHERE sw.warehouse_id=? AND sw.status IN ('COUNTING','COMPLETED') AND s.campaign_type='COUNT' LIMIT 1",
    [warehouseId],
  );
  return rows.length > 0;
}

module.exports = previewRequest;
