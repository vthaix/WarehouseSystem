// =============================================================================
// ĐIỀU KIỆN XUẤT THÀNH PHẨM BÁN (UC-23 nhánh xuất bán, UC-11.02)
// Chỉ xuất khi: đã hoàn tất sản xuất và gửi báo cáo tổng kết, và đã tới ngày
// giao ghi trên đơn của khách.
// =============================================================================
const C = require("../../services/domain/core");

/** Kiểm tra một dòng đã đọc từ saleReadiness(); lỗi nếu chưa đủ điều kiện. */
function assertReady(row, today = C.today()) {
  C.fail(
    !row ||
      row.report_status !== "SUBMITTED" ||
      Number(row.production_completed) !== 1 ||
      row.production_status !== "COMPLETED",
    "PRODUCTION_NOT_COMPLETED",
    "Chỉ xuất thành phẩm sau khi hoàn tất sản xuất và gửi báo cáo tổng kết.",
    409,
  );
  const date =
    row.latest_delivery_date instanceof Date
      ? row.latest_delivery_date.toISOString().slice(0, 10)
      : String(row.latest_delivery_date || "");
  C.fail(
    !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today,
    "DELIVERY_NOT_DUE",
    'Chưa đến ngày giao hàng của đơn khách'+(/^\d{4}-\d{2}-\d{2}$/.test(date)?' ('+date.split('-').reverse().join('/')+')':'')+'. Chỉ xuất từ ngày giao đã ghi trên đơn.',
    409,
  );
  return row;
}
/**
 * Đọc (và khóa) kế hoạch bán cùng báo cáo thành phẩm, KHSX, đơn khách liên quan;
 * kiểm tra đủ điều kiện xuất và kế hoạch bán thuộc đúng xưởng.
 * Báo cáo từng phần (PART) được xem là hoàn tất nếu KHSX đã có báo cáo tổng kết.
 */
async function saleReadiness(connection, businessPlanId, workshopId) {
  const [[row]] = await connection.execute(
    "SELECT r.status AS report_status,CASE WHEN r.KieuThanhPham='PART' AND EXISTS(SELECT 1 FROM finished_reports final WHERE final.production_plan_id=r.production_plan_id AND final.production_completed=1 AND final.status='SUBMITTED') THEN 1 ELSE r.production_completed END AS production_completed,p.status AS production_status,p.workshop_id,o.latest_delivery_date FROM business_plans b JOIN finished_reports r ON r.id=b.finished_report_id JOIN production_plans p ON p.id=r.production_plan_id JOIN customer_orders o ON o.id=b.customer_order_id WHERE b.id=? AND b.type='SALE' AND b.status IN ('APPROVED','IN_PROGRESS') AND p.customer_order_id=o.id FOR UPDATE",
    [businessPlanId],
  );
  assertReady(row);
  C.fail(
    String(row.workshop_id) !== String(workshopId),
    "FORBIDDEN",
    "Kế hoạch bán không thuộc xưởng nhận yêu cầu.",
    403,
  );
  return row;
}
module.exports = { saleReadiness, assertReady };
