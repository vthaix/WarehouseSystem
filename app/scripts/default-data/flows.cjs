// Các bước nghiệp vụ dùng lại khi dựng dữ liệu: đặt hàng → KHSX → báo cáo → QC → nhập kho → bán → xuất kho.
// Mỗi hàm gọi đúng chức năng của app nên chứng từ nguồn, số lượng và trạng thái luôn khớp quy tắc.
const api = require("./api.cjs");

// ---------------------------------------------------------------- thời gian
// "today" là ngày sinh dữ liệu. Khi bấm Xóa dữ liệu test, ngày này được dời thành HÔM QUA.
const DAY = 86400000;
const day = (offset) => new Date(Date.now() + 7 * 3600000 + offset * DAY).toISOString().slice(0, 10);
const today = day(0);
const FAR = { delivery: 240, planEnd: 180, planStart: 120, planned: 150 }; // các mốc để xa cho dễ thao tác

// Mỗi lần gọi trả về một khung giờ riêng, cách xa hôm nay: không ai bị trùng lịch.
let slotIndex = 0;
function slot(fromDay = 100) {
  const n = slotIndex++;
  const date = day(fromDay + Math.floor(n / 8));
  const hour = String(1 + (n % 8)).padStart(2, "0"); // 8h–16h giờ Việt Nam
  return { start_at: `${date}T${hour}:00:00.000Z`, end_at: `${date}T${hour}:50:00.000Z` };
}
// Mỗi yêu cầu nhập/xuất một ngày giờ thực hiện riêng, từ 100 ngày tới.
let requestIndex = 0;
function executionTime() {
  const n = requestIndex++;
  const date = day(100 + Math.floor(n / 4));
  return { requested_date: date, requested_at: `${date}T0${1 + (n % 4) * 2}:00:00.000Z` };
}

// ----------------------------------------------------------- dữ liệu danh mục
const ref = { items: new Map(), users: new Map(), warehouses: new Map(), locations: new Map(), workshops: new Map(), suppliers: new Map() };
async function loadReferences(db) {
  const read = async (map, sql) => { for (const [key, id] of (await db.query({ sql, rowsAsArray: true }))[0]) map.set(key, String(id)); };
  await read(ref.items, "SELECT Ma,MaBanGhi FROM MatHang");
  await read(ref.users, "SELECT TenDangNhap,MaBanGhi FROM NguoiDung");
  await read(ref.warehouses, "SELECT Ma,MaBanGhi FROM Kho");
  await read(ref.locations, "SELECT CONCAT(k.Ma,'/',v.Ma),v.MaBanGhi FROM ViTriKho v JOIN Kho k ON k.MaBanGhi=v.MaKho");
  await read(ref.workshops, "SELECT Ma,MaBanGhi FROM Xuong");
  await read(ref.suppliers, "SELECT Ma,MaBanGhi FROM NhaCungCap");
}
const item = (code) => ref.items.get(code);
const user = (name) => ref.users.get(name);
const warehouse = (code) => ref.warehouses.get(code);

// ------------------------------------------------------- đơn hàng, kế hoạch SX
const ADDRESS = { delivery_province_code: "79", delivery_ward_code: "26740" };
async function order(note, { product = "TP-001", quantity = "10", delivery = FAR.delivery, customer = "customer", lines } = {}) {
  return api.post(customer, "customer-orders", {
    ...ADDRESS,
    delivery_street: "12 Lê Lợi",
    recipient_name: "Nguyễn Thị Hoa",
    recipient_phone: "0901234567",
    latest_delivery_date: day(delivery),
    note,
    lines: lines || [{ item_id: item(product), quantity }],
  });
}
async function receivedOrder(note, options) {
  const created = await order(note, options);
  return api.post("planner", `customer-orders/${created.id}/receive`, { version: created.version });
}
/** KHSX nháp (chờ ban giám đốc duyệt). */
async function draftPlan(note, { start = FAR.planStart, end = FAR.planEnd, workshop = "XUONG-01", ...options } = {}) {
  const source = await receivedOrder(note, options);
  const plan = await api.post("planner", "production-plans", {
    customer_order_id: source.id,
    workshop_id: ref.workshops.get(workshop),
    start_date: day(start),
    end_date: day(end),
    note,
    material_source: "RECIPE",
    outputs: source.lines.map((line) => ({ item_id: String(line.item_id), quantity: String(line.quantity) })),
  });
  return { order: source, plan };
}
/** KHSX đã duyệt. Mặc định bắt đầu hôm nay để lập được báo cáo ngay. */
async function approvedPlan(note, options = {}) {
  const draft = await draftPlan(note, { start: 0, ...options });
  await api.post("director", `production-plans/${draft.plan.id}/review`, { version: draft.plan.version, decision: "APPROVE" });
  const plan = await api.get("planner", "production-plans/" + draft.plan.id);
  return { order: draft.order, plan };
}

// ----------------------------------------------------------------- báo cáo
async function productionReport(note, plan, { purpose = "NHU_CAU", submit = true, progress = "20" } = {}) {
  const report = await api.post("workshop", "production-reports", {
    production_plan_id: plan.id,
    report_purpose: purpose,
    progress_percentage: progress,
    note,
    send_to_planner: true,
    ...(purpose === "NHU_CAU"
      ? { lines: plan.materials.map((m) => ({ item_id: String(m.item_id), required_quantity: String(Number(m.required_quantity) * 1000) })) }
      : {}),
  });
  if (!submit) return report;
  return api.post("workshop", `production-reports/${report.id}/submit`, { version: report.version });
}
async function finishedReport(note, plan, { quantity = "10", product, completed = true, submit = true, materials = [], owner = "workshop" } = {}) {
  const report = await api.post(owner, "finished-reports", {
    production_plan_id: plan.id,
    report_mode: "PART",
    production_completed: completed,
    completed_date: today,
    note,
    outputs: [{ item_id: product ? item(product) : String(plan.outputs[0].item_id), quantity, manufactured_date: today, expiry_date: day(365) }],
    materials,
  });
  if (!submit) return report;
  await api.post(owner, `finished-reports/${report.id}/submit`, { version: report.version });
  return api.get(owner, "finished-reports/" + report.id);
}

// ------------------------------------------------------------------ mua hàng
async function purchasePlan(note, { lines = [{ product: "NVL-001", quantity: "20" }], approve = false, report, planned = FAR.planned } = {}) {
  const plan = await api.post("planner", "business-plans", {
    type: "PURCHASE",
    planned_date: day(planned),
    note,
    ...(report ? { production_plan_id: report.production_plan_id, production_report_id: report.id } : {}),
    lines: lines.map((l) => ({ item_id: l.item_id || item(l.product), quantity: l.quantity, unit_price: l.price || "18000" })),
  });
  return approve ? api.post("director", `business-plans/${plan.id}/review`, { version: plan.version, decision: "APPROVE" }) : plan;
}
let materialPrices = null;
async function supplierOf(itemId) {
  if (!materialPrices) materialPrices = await api.get("purchaser", "material-prices?per_page=100");
  const offer = materialPrices.find((m) => String(m.id) === String(itemId)).supplier_prices[0];
  return { supplier_id: String(offer.supplier_id), unit_price: String(offer.unit_price) };
}
/** Đơn mua lập trực tiếp, chưa nhận hàng. expected: số ngày nữa hàng về (đơn sẽ kiểm ngay thì để 0). */
async function purchaseOrder(note, lines = [{ product: "NVL-001", quantity: "20" }], expected = 0) {
  const rows = [];
  for (const line of lines) {
    const id = item(line.product);
    rows.push({ item_id: id, quantity: line.quantity, ...(await supplierOf(id)) });
  }
  return api.post("purchaser", "purchase-orders", {
    source_mode: "MANUAL",
    expected_delivery_date: day(expected),
    delivery_terms: note + " Giao tại kho",
    lines: rows,
  });
}
/** Đơn mua theo kế hoạch mua đã duyệt. */
async function purchaseOrderFromPlan(note, plan) {
  const lines = [];
  for (const line of plan.lines) {
    const offer = await supplierOf(line.item_id);
    lines.push({ business_plan_line_id: String(line.id), supplier_id: offer.supplier_id, unit_price: String(line.unit_price) });
  }
  return api.post("purchaser", "purchase-orders", { source_mode: "PLAN", business_plan_id: plan.id, delivery_terms: note + " Giao tại kho", lines });
}
/** Ghi nhận lô cho các dòng của đơn mua (mặc định nhận đủ); mỗi nhà cung cấp một lô tổng. */
async function receiveLots(purchase, quantities = {}) {
  const bySupplier = new Map();
  for (const line of purchase.lines) {
    const key = String(line.supplier_id || purchase.supplier_id);
    if (!bySupplier.has(key)) bySupplier.set(key, []);
    bySupplier.get(key).push(line);
  }
  const lots = [];
  for (const lines of bySupplier.values()) {
    const header = await api.post("manager", "lots", {
      lines: lines.map((line) => ({
        purchase_order_line_id: String(line.id),
        received_quantity: quantities[line.id] || String(line.quantity),
        manufactured_date: today,
      })),
    });
    lots.push(...header.lines);
  }
  return lots;
}

// ------------------------------------------------------- đợt kiểm kê / QC (UC-13)
/**
 * Lập đợt kiểm kê cho phần thành phẩm (reports) hoặc lô nguyên vật liệu (purchase/plan).
 * start: bắt đầu ngay để nhân viên ghi được kết quả.
 */
async function inspection(title, { reports, purchase, purchasePlanId, lotIds, assignees = ["qc"], author = assignees[0], start = true }) {
  const sources = await api.get("director", "task-inspection-sources");
  const body = { title, priority: "NORMAL", description: title, ...slot(), assignee_ids: assignees.map(user), minute_author_id: user(author) };
  if (reports) {
    const ids = reports.map((r) => String(r.id));
    const group = sources.finished_lots.find((g) => g.parts.some((p) => p.available && ids.includes(p.id)));
    if (!group) throw Error("Không có phần thành phẩm chờ kiểm: " + title);
    Object.assign(body, { inspection_type: "FINISHED_PRODUCT", lot_header_id: group.id, finished_report_ids: ids });
  } else {
    const id = purchasePlanId ? "PLAN:" + purchasePlanId : "PO:" + purchase.id;
    Object.assign(body, {
      inspection_type: "MATERIAL",
      material_source: id,
      ...(lotIds ? { material_lot_ids: lotIds.map(String) } : purchasePlanId ? { material_lot_ids: [] } : {}),
    });
  }
  let task = await api.post("director", "tasks", body);
  if (start) {
    const campaign = await api.get("director", "quality-campaigns/" + task.stocktake_id);
    await api.post("director", `quality-campaigns/${campaign.id}/start`, { version: campaign.version, simulate_early_start: true });
    task = await api.get("director", "tasks/" + task.id);
  }
  return task;
}
const lotsOf = (task) => task.inspection.lots;
/** QC ghi kết quả; failed: lượng lỗi của lô đầu tiên. */
async function recordQuality(note, task, { failed = 0, inspector = "qc" } = {}) {
  return api.post(inspector, "qc-inspections", {
    campaign_id: String(task.stocktake_id),
    inspected_at: new Date().toISOString(),
    note,
    lines: lotsOf(task).map((lot, index) => {
      const total = Number(lot.received_quantity), bad = index === 0 ? failed : 0;
      return {
        lot_id: String(lot.id),
        inspected_quantity: String(total),
        passed_quantity: String(total - bad),
        failed_quantity: String(bad),
        issue: bad ? "Bao bì bị rách, hàng ẩm" : "",
      };
    }),
  });
}
/** Ban kiểm kê ghi số đếm; shortage: lượng thiếu của lô đầu tiên. */
async function recordCount(task, { shortage = 0, counter = "stocktaker" } = {}) {
  const current = await api.get(counter, "tasks/" + task.id);
  return api.post(counter, `tasks/${task.id}/progress`, {
    version: current.version,
    count_lines: lotsOf(task).map((lot, index) => ({
      lot_id: String(lot.id),
      counted_quantity: String(Number(lot.received_quantity) - (index === 0 ? shortage : 0)),
    })),
  });
}
/** Biên bản của đợt đã hoàn tất. */
async function minutes(task, remarks, { author = "qc", exception, submit = true } = {}) {
  const created = await api.post(author, "stocktake-minutes", {
    inspection_campaign_id: String(task.stocktake_id),
    remarks,
    exception_mode: exception ? "DESCRIBE" : "NONE",
    ...(exception ? { exception_description: exception } : {}),
  });
  return submit ? api.post(author, `stocktake-minutes/${created.id}/submit`, { version: created.version }) : created;
}

/** Đợt QC cho lô khách trả đang nằm khu cách ly. */
async function returnInspection(note, lotIds, assignee = "qc") {
  const campaign = await api.post("director", "quality-campaigns", {
    campaign_type: "QUALITY_CHECK",
    quality_kind: "FINISHED_PRODUCT",
    planned_date: day(100),
    ...slot(),
    location: "Khu cách ly hàng trả",
    note,
    assignee_ids: [user(assignee)],
    lot_ids: lotIds.map(String),
  });
  return api.post("director", `quality-campaigns/${campaign.id}/start`, { version: campaign.version, simulate_early_start: true });
}

// ------------------------------------------------- yêu cầu nhập/xuất và phiếu kho
/**
 * purpose: PURCHASE_RECEIPT | PRODUCTION_RECEIPT | PRODUCTION_ISSUE | SALE_ISSUE
 * source: mã nguồn mà chủ xưởng chọn trên form (ORDER:<đơn mua>, KH mua, báo cáo TP, KHSX).
 */
async function stockRequest(note, purpose, source, { warehouseId: chosen, lines } = {}) {
  const workshopId = ref.workshops.get("XUONG-01");
  const warehouseId = chosen || warehouse(["PURCHASE_RECEIPT", "PRODUCTION_ISSUE"].includes(purpose) ? "KHO-01" : "KHO-02");
  let wanted = lines;
  if (!wanted) {
    const query = new URLSearchParams({ workflow_source: "true", source_id: source, purpose, workshop_id: workshopId, warehouse_id: warehouseId });
    const preview = await api.get("workshop", "source-imports/stock-requests?" + query);
    wanted = preview.lines.map((l) => ({ item_id: String(l.item_id), quantity: String(l.quantity) }));
  }
  return api.post("workshop", "stock-requests", {
    purpose,
    workflow_source_id: String(source),
    workshop_id: workshopId,
    warehouse_id: warehouseId,
    manager_id: user("manager"),
    ...executionTime(),
    note,
    lines: wanted,
  });
}
/** Quản lý kho phân công: chọn lô còn đủ lượng, hạn dùng xa nhất trước. */
async function dispatch(request, { assignee = "staff", location } = {}) {
  const preview = await api.get("manager", `stock-requests/${request.id}/allocations`);
  const allocations = [];
  for (const line of preview.lines) {
    let left = Number(line.remaining_quantity);
    const add = (lot, location, quantity) => {
      allocations.push({ assignee_id: user(assignee), stock_request_line_id: line.id, lot_id: lot, location_id: location, quality_bucket: "AVAILABLE", quantity: round(quantity) });
      left = Number(round(left - quantity));
    };
    if (request.type === "IN") {
      for (const lot of line.lots) {
        const ready = Number(lot.passed_quantity) - Number(lot.posted_quantity);
        if (left > 0 && ready > 0) add(lot.id, location || lot.suggested_location_id, Math.min(left, ready));
      }
    } else {
      const expiry = new Map(line.lots.map((lot) => [lot.id, lot.expiry_date || "9999"]));
      const stock = line.balances
        .filter((b) => b.quality_bucket === "AVAILABLE" && expiry.has(b.lot_id))
        .sort((a, b) => expiry.get(b.lot_id).localeCompare(expiry.get(a.lot_id)));
      for (const balance of stock)
        if (left > 0 && Number(balance.available_quantity) > 0) add(balance.lot_id, balance.location_id, Math.min(left, Number(balance.available_quantity)));
    }
    if (left > 0.0005) throw Error(`Không đủ hàng cho ${request.code} – ${line.item_name}: còn thiếu ${left}`);
  }
  const start = request.requested_at;
  const result = await api.post("manager", `stock-requests/${request.id}/dispatch`, {
    version: request.version,
    start_at: start,
    end_at: new Date(Date.parse(start) + 3600000).toISOString(),
    allocations,
  });
  return { request, version: result.version, task: result.tasks[0], allocations, assignee };
}
const round = (n) => (Math.round(Number(n) * 1000) / 1000).toString();
/** Nhân viên kho ghi phiếu lượng được phân công (share: phần ghi lần này, mặc định ghi đủ). */
async function postStock(assigned, share = 1) {
  const strip = ({ assignee_id, ...line }) => ({ ...line, quantity: round(line.quantity * share) });
  return api.post(assigned.assignee, "stock-documents", {
    stock_request_id: assigned.request.id,
    request_version: assigned.version,
    task_id: assigned.task.id,
    allocations: assigned.allocations.map(strip),
  });
}
async function fullyPosted(request, options) {
  return postStock(await dispatch(request, options));
}

// --------------------------------------------------------------- chuỗi trọn gói
// QC của các chuỗi chuẩn bị do qc3 làm, để qc chỉ thấy đúng các đợt dành cho UC-12.
const HELPER = "qc3";
/** QC xong thì lập luôn biên bản; có hàng lỗi thì để lại cho UC xử lý ngoại lệ. */
async function checkedBy(note, target, failed) {
  const task = await inspection(note, { ...target, assignees: [HELPER] });
  const quality = await recordQuality(note, task, { failed, inspector: HELPER });
  if (!failed) await minutes(task, "Hàng đủ số lượng, đạt chất lượng", { author: HELPER });
  return { task, quality };
}
/** Đơn mua → lô → QC đạt. */
async function checkedMaterial(note, lines, { failed = 0 } = {}) {
  const purchase = await purchaseOrder(note, lines);
  const lots = await receiveLots(purchase);
  return { purchase, lots, ...(await checkedBy(note, { purchase, lotIds: lots.map((l) => l.id) }, failed)) };
}
/** KHSX → cấp nguyên vật liệu đã ghi phiếu. */
async function issuedPlan(note, options) {
  const source = await approvedPlan(note, options);
  const request = await stockRequest(note, "PRODUCTION_ISSUE", source.plan.id);
  await fullyPosted(request);
  return { ...source, issue: request, used: request.lines.map((l) => ({ item_id: String(l.item_id), used_quantity: String(l.quantity) })) };
}
/** KHSX → báo cáo thành phẩm → QC (đạt hết hoặc có lỗi). */
async function checkedProduct(note, { failed = 0, completed = true, quantity = "10", ...options } = {}) {
  const source = await approvedPlan(note, { quantity, ...options });
  const report = await finishedReport(note, source.plan, { quantity, completed });
  return { ...source, report, ...(await checkedBy(note, { reports: [report] }, failed)) };
}
/** … → đã nhập kho thành phẩm: nguồn để lập kế hoạch bán. */
async function stockedProduct(note, options) {
  const product = await checkedProduct(note, options);
  const request = await stockRequest(note, "PRODUCTION_RECEIPT", product.report.id);
  const document = await fullyPosted(request);
  return { ...product, receipt: request, document };
}
/** … → kế hoạch bán. dueToday: hạn giao là hôm nay để xuất bán được ngay. */
async function salePlan(note, { approve = false, dueToday = false, quantity = "10", ...options } = {}) {
  const dates = dueToday ? { delivery: 0, start: 0, end: 0 } : {};
  const product = await stockedProduct(note, { quantity, ...dates, ...options });
  let plan = await api.post("planner", "business-plans", {
    type: "SALE",
    customer_order_id: product.order.id,
    customer_id: String(product.order.customer_id),
    finished_report_id: product.report.id,
    planned_date: day(dueToday ? 0 : FAR.planned),
    note,
    lines: [{ item_id: String(product.plan.outputs[0].item_id), quantity, unit_price: "45000" }],
  });
  if (approve) plan = await api.post("director", `business-plans/${plan.id}/review`, { version: plan.version, decision: "APPROVE" });
  return { ...product, sale: plan };
}
/** … → đã giao khách. */
async function delivered(note, options) {
  const source = await salePlan(note, { approve: true, dueToday: true, ...options });
  const request = await stockRequest(note, "SALE_ISSUE", source.plan.id);
  const document = await fullyPosted(request);
  return { ...source, delivery: request, deliveryDocument: document };
}

module.exports = {
  api, day, today, slot, FAR, ref, loadReferences, item, user, warehouse,
  order, receivedOrder, draftPlan, approvedPlan, productionReport, finishedReport,
  purchasePlan, purchaseOrder, purchaseOrderFromPlan, receiveLots,
  inspection, lotsOf, recordQuality, recordCount, minutes,
  returnInspection, stockRequest, dispatch, postStock, fullyPosted,
  checkedMaterial, issuedPlan, checkedProduct, stockedProduct, salePlan, delivered,
};
