// =============================================================================
// HỖ TRỢ FORM "YÊU CẦU NHẬP/XUẤT" (UC-23)
//   execution() ngày giờ thực hiện của yêu cầu
//   options()   danh sách nguồn chủ xưởng được chọn trên form
//   resolve()   đổi lựa chọn trên form thành chứng từ nguồn cụ thể
//   lots()      lô hàng thuộc nguồn (để quản lý kho chọn khi phân công)
// =============================================================================
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");

const isId = (id) => /^[1-9]\d*$/.test(String(id));
const DEFAULT_TIME = "T08:00:00+07:00"; // 8 giờ sáng giờ Việt Nam
const toDay = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value));

/**
 * Ngày giờ thực hiện yêu cầu.
 *   - Có requested_at: dùng giờ đó (phải ghi rõ múi giờ, ví dụ +07:00).
 *   - Chỉ đổi ngày: lấy 8:00 sáng ngày đó.
 *   - Không đổi gì: giữ giờ cũ của yêu cầu.
 * Giờ thực hiện phải rơi vào đúng ngày yêu cầu và không ở quá khứ.
 *
 * @param body      dữ liệu gửi lên
 * @param existing  yêu cầu hiện có (khi sửa)
 */
function execution(body, existing = null) {
  const day = body.requested_date || existing?.requested_date;
  const text =
    body.requested_at ||
    (body.requested_date ? day + DEFAULT_TIME : existing?.ThoiDiemThucHien || day + DEFAULT_TIME);
  const value = text instanceof Date ? text : require("../../shared/time-rules").timestamp(text, "requested_at");

  const hasTimezone = typeof body.requested_at === "string" && /(Z|[+-]\d\d:\d\d)$/.test(body.requested_at);
  C.fail(
    !Number.isFinite(+value) || (body.requested_at !== undefined && !hasTimezone),
    "VALIDATION_ERROR",
    "Ngày giờ thực hiện không hợp lệ.",
  );
  const localDay = new Date(+value + 7 * 3600000).toISOString().slice(0, 10); // đổi sang ngày giờ Việt Nam
  C.fail(localDay !== toDay(day), "VALIDATION_ERROR", "Ngày giờ thực hiện phải cùng ngày yêu cầu.");
  C.date(localDay, "requested_at", true);
  return value;
}

/** Đổi các cột mã (id, *_id) sang chuỗi. */
const normalize = (rows) =>
  rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        (key === "id" || key.endsWith("_id")) && value !== null ? String(value) : value,
      ]),
    ),
  );

/** Nguồn mà chủ xưởng chọn được, chỉ trong các xưởng của họ. */
async function options(c, user) {
  P.role(user, ["WORKSHOP_OWNER"]);
  const ids = (user.workshop_ids || []).map(String);
  if (!ids.length) return { workshops: [], purchase_plans: [], production_plans: [], finished_reports: [], sale_plans: [] };
  const slots = ids.map(() => "?").join(",");

  const [workshops] = await c.execute(
    `SELECT id,code,name FROM workshops WHERE is_active=1 AND id IN (${slots}) ORDER BY name`,
    ids,
  );
  // KHSX đã duyệt / đang làm / đã xong.
  const [productionPlans] = await c.execute(
    `SELECT id,code,workshop_id,status FROM production_plans WHERE workshop_id IN (${slots})` +
      " AND status IN ('APPROVED','IN_PROGRESS','COMPLETED') ORDER BY id DESC LIMIT 200",
    ids,
  );
  // Báo cáo thành phẩm đã gửi.
  const [finishedReports] = await c.execute(
    "SELECT r.id,r.code,r.production_plan_id,p.workshop_id FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id" +
      ` WHERE p.workshop_id IN (${slots}) AND r.status='SUBMITTED' ORDER BY r.id DESC LIMIT 200`,
    ids,
  );
  // Kế hoạch mua đã duyệt có đơn mua đang chờ nhận. Xưởng của kế hoạch mua suy
  // ra từ báo cáo nhu cầu / yêu cầu mua / KHSX; không suy ra được thì xưởng nào cũng chọn được.
  const purchaseWorkshop = "COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id)";
  const [purchasePlans] = await c.execute(
    `SELECT b.id,b.code,p.id AS purchase_order_id,p.code AS purchase_order_code,${purchaseWorkshop} AS workshop_id` +
      " FROM business_plans b JOIN purchase_orders p ON p.business_plan_id=b.id" +
      " LEFT JOIN production_reports pr ON pr.id=b.production_report_id" +
      " LEFT JOIN production_plans ps ON ps.id=pr.production_plan_id" +
      " LEFT JOIN stock_requests r ON r.id=b.source_request_id" +
      " LEFT JOIN production_plans s ON s.id=b.production_plan_id" +
      " WHERE b.type='PURCHASE' AND b.status IN ('APPROVED','IN_PROGRESS','COMPLETED') AND p.status IN ('PENDING','PARTIALLY_RECEIVED')" +
      ` AND (${purchaseWorkshop} IS NULL OR ${purchaseWorkshop} IN (${slots})) ORDER BY b.id DESC LIMIT 200`,
    ids,
  );
  // Kế hoạch bán đã duyệt của các KHSX thuộc xưởng.
  const [salePlans] = await c.execute(
    "SELECT b.id,b.code,r.production_plan_id,p.workshop_id FROM business_plans b" +
      " JOIN finished_reports r ON r.id=b.finished_report_id JOIN production_plans p ON p.id=r.production_plan_id" +
      ` WHERE b.type='SALE' AND b.status IN ('APPROVED','IN_PROGRESS') AND p.workshop_id IN (${slots}) ORDER BY b.id DESC LIMIT 200`,
    ids,
  );
  // Đơn mua không qua kế hoạch (dữ liệu cũ): hiển thị với mã "ORDER:<id>".
  const [directOrders] = await c.execute(
    "SELECT id,code FROM purchase_orders WHERE business_plan_id IS NULL AND status IN ('PENDING','PARTIALLY_RECEIVED') ORDER BY id DESC LIMIT 100",
  );

  return {
    workshops: normalize(workshops),
    purchase_plans: [
      ...normalize(purchasePlans),
      ...directOrders.map((order) => ({
        id: "ORDER:" + order.id,
        code: "Đơn mua trực tiếp · " + order.code,
        purchase_order_id: String(order.id),
        workshop_id: null,
      })),
    ],
    production_plans: normalize(productionPlans),
    finished_reports: normalize(finishedReports),
    sale_plans: normalize(salePlans),
  };
}

/**
 * Đổi lựa chọn trên form (workflow_source_id) thành trường nguồn của yêu cầu.
 * Chỉ chấp nhận nguồn nằm trong options() của chính chủ xưởng.
 *   Nhập NVL  : kế hoạch mua → purchase_order_id
 *   Nhập TP   : báo cáo thành phẩm → production_report_id
 *   Xuất NVL  : KHSX → production_plan_id (chế độ PLAN)
 *   Xuất bán  : KHSX → kế hoạch bán của KHSX đó → business_plan_id
 */
async function resolve(c, user, purpose, sourceId, workshopId, salePlanId) {
  P.role(user, ["WORKSHOP_OWNER"]);
  const directOrder = purpose === "PURCHASE_RECEIPT" && /^ORDER:[1-9]\d*$/.test(String(sourceId));
  C.fail(
    (!isId(sourceId) && !directOrder) || !isId(workshopId) || !(user.workshop_ids || []).map(String).includes(String(workshopId)),
    "FORBIDDEN",
    "Nguồn hoặc xưởng không hợp lệ.",
    403,
  );
  const available = await options(c, user);
  const workshop = String(workshopId);

  if (purpose === "PURCHASE_RECEIPT") {
    const plan = available.purchase_plans.find((p) => p.id === String(sourceId));
    C.fail(!plan || (plan.workshop_id && plan.workshop_id !== workshop), "NOT_FOUND",
      "Kế hoạch mua chưa có đơn mua hợp lệ hoặc không thuộc xưởng.", 404);
    return { purchase_order_id: plan.purchase_order_id, production_source_mode: "REPORT" };
  }

  if (purpose === "PRODUCTION_RECEIPT") {
    const report = available.finished_reports.find((r) => r.id === String(sourceId) && r.workshop_id === workshop);
    C.fail(!report, "NOT_FOUND", "Không tìm thấy báo cáo thành phẩm đã gửi của xưởng.", 404);
    return { production_report_id: report.id, production_source_mode: "REPORT" };
  }

  const plan = available.production_plans.find((p) => p.id === String(sourceId) && p.workshop_id === workshop);
  C.fail(!plan, "NOT_FOUND", "Không tìm thấy KHSX thuộc xưởng.", 404);

  if (purpose === "PRODUCTION_ISSUE") {
    C.fail(plan.status === "COMPLETED", "INVALID_STATE", "KHSX đã hoàn tất, không xuất thêm nguyên vật liệu.", 409);
    return { production_plan_id: plan.id, production_source_mode: "PLAN" };
  }

  C.fail(purpose !== "SALE_ISSUE", "VALIDATION_ERROR", "Chọn đúng một trong bốn nhánh nhập/xuất.");
  // Một KHSX có thể có nhiều kế hoạch bán: phải chọn rõ nếu có hơn một.
  const sales = available.sale_plans.filter((s) => s.production_plan_id === plan.id);
  const sale = salePlanId ? sales.find((s) => s.id === String(salePlanId)) : sales.length === 1 ? sales[0] : null;
  C.fail(!sale, "SOURCE_REQUIRED",
    sales.length ? "KHSX có nhiều kế hoạch bán: chọn kế hoạch bán cần giao." : "KHSX chưa có kế hoạch bán đã duyệt liên quan.", 409);
  return { business_plan_id: sale.id, production_source_mode: "REPORT" };
}

/** Lô hàng của nguồn nhập (đơn mua hoặc báo cáo thành phẩm), kèm kết quả QC. */
async function lots(c, row) {
  let scope;
  let params;
  if (row.purpose === "PURCHASE_RECEIPT") {
    scope = "l.purchase_order_line_id IN (SELECT id FROM purchase_order_lines WHERE purchase_order_id=?)";
    params = [row.purchase_order_id];
  } else if (row.purpose === "PRODUCTION_RECEIPT" && row.production_source_mode !== "MANUAL") {
    scope = "l.id IN (SELECT lot_id FROM finished_report_outputs WHERE finished_report_id=?)";
    params = [row.production_report_id];
  } else {
    return [];
  }
  const [rows] = await c.execute(
    "SELECT l.id AS lot_id,h.code AS lot_header_code,l.code AS lot_code,l.item_id,i.name AS item_name,u.name AS unit," +
      "l.received_quantity,l.qc_status,q.passed_quantity,q.failed_quantity" +
      " FROM lots l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id" +
      " LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN qc_inspection_lines q ON q.lot_id=l.id" +
      " WHERE " + scope + " ORDER BY l.id",
    params,
  );
  return rows.map((r) => ({ ...r, lot_id: String(r.lot_id), item_id: String(r.item_id) }));
}

module.exports = { execution, options, resolve, lots };
