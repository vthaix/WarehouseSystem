// UC-17: Chủ xưởng phê duyệt đề xuất xử lý ngoại lệ.
//
// Mỗi đề xuất (hàng QC lỗi, xử lý hàng cách ly, chênh lệch kiểm kê) phải có
// đúng một xưởng phụ trách để biết chủ xưởng nào được duyệt. Xưởng được suy ra
// từ nguồn hàng, theo thứ tự ưu tiên:
//   1. Kho nơi đếm chênh lệch thuộc xưởng nào (chỉ với chênh lệch kiểm kê).
//   2. Lô thành phẩm: xưởng của kế hoạch sản xuất đã làm ra lô.
//   3. Lô nguyên vật liệu: xưởng đã yêu cầu nhập đơn mua của lô.
//   4. Kho đang giữ lô thuộc xưởng nào.
// Bước nào cho ra đúng một xưởng thì dùng xưởng đó. Không xác định được thì
// trả về null để nơi gọi báo lỗi, thay vì đoán.
const C = require("../../services/domain/core");

function single(rows) {
  const ids = [...new Set(rows.map((row) => row.workshop_id).filter((id) => id != null).map(String))];
  return ids.length === 1 ? ids[0] : null;
}

async function workshopOfLot(c, lotId) {
  const [fromProduction] = await c.execute(
    "SELECT p.workshop_id FROM lots l JOIN production_plans p ON p.id=l.production_plan_id WHERE l.id=?",
    [lotId],
  );
  if (single(fromProduction)) return single(fromProduction);

  const [fromPurchase] = await c.execute(
    "SELECT r.workshop_id FROM lots l" +
      " JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id" +
      " JOIN stock_requests r ON r.purchase_order_id=pl.purchase_order_id" +
      " WHERE l.id=? AND r.purpose='PURCHASE_RECEIPT' AND r.status<>'CANCELLED'",
    [lotId],
  );
  if (single(fromPurchase)) return single(fromPurchase);

  const [fromStorage] = await c.execute(
    "SELECT w.workshop_id FROM inventory_balances b" +
      " JOIN warehouse_locations loc ON loc.id=b.location_id" +
      " JOIN warehouses w ON w.id=loc.warehouse_id" +
      " WHERE b.lot_id=? AND b.quantity>0",
    [lotId],
  );
  return single(fromStorage);
}

/**
 * @param c kết nối (đã bọc dịch tên bảng)
 * @param source { qc_inspection_line_id } hoặc { stocktake_line_id }
 * @returns mã xưởng (chuỗi) hoặc null nếu không xác định được duy nhất
 */
async function resolve(c, source) {
  if (source.stocktake_line_id) {
    const [[line]] = await c.execute(
      "SELECT l.lot_id,w.workshop_id FROM stocktake_lines l" +
        " JOIN stocktake_warehouses sw ON sw.id=l.stocktake_warehouse_id" +
        " JOIN warehouses w ON w.id=sw.warehouse_id WHERE l.id=?",
      [source.stocktake_line_id],
    );
    if (!line) return null;
    if (line.workshop_id != null) return String(line.workshop_id);
    return workshopOfLot(c, line.lot_id);
  }
  const [[line]] = await c.execute(
    "SELECT lot_id FROM qc_inspection_lines WHERE id=?",
    [source.qc_inspection_line_id],
  );
  return line ? workshopOfLot(c, line.lot_id) : null;
}

/**
 * Dùng khi lập đề xuất: bắt buộc có xưởng phụ trách và xưởng đó có chủ xưởng
 * đang hoạt động (khác người lập) để phê duyệt.
 */
async function requireApprover(c, source, creatorId) {
  const workshopId = await resolve(c, source);
  C.fail(
    !workshopId,
    "SOURCE_REQUIRED",
    "Chưa xác định duy nhất xưởng phụ trách nguồn hàng (kho, kế hoạch sản xuất hoặc yêu cầu nhập). Kiểm tra nguồn trước khi lập đề xuất.",
    409,
  );
  const owners = await ownersOf(c, workshopId, creatorId);
  C.fail(!owners.length, "VALIDATION_ERROR", "Xưởng phụ trách chưa có chủ xưởng đang hoạt động để phê duyệt.");
  return workshopId;
}

async function ownersOf(c, workshopId, excludeUserId = 0) {
  const [rows] = await c.execute(
    "SELECT DISTINCT u.id FROM workshop_users wu" +
      " JOIN users u ON u.id=wu.user_id" +
      " JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id" +
      " WHERE wu.workshop_id=? AND u.status='ACTIVE' AND ro.code='WORKSHOP_OWNER' AND u.id<>?",
    [workshopId, excludeUserId],
  );
  return rows.map((row) => String(row.id));
}

module.exports = { resolve, requireApprover, ownersOf };
