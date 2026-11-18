// =============================================================================
// KIỂM TRA DÒNG HÀNG CỦA YÊU CẦU (UC-23 bước kiểm tra, UC-24.1 khi sửa)
//
// Một yêu cầu có 1–100 dòng, mỗi dòng một mặt hàng không trùng. Tổng lượng của
// mọi yêu cầu còn hiệu lực trên cùng nguồn không được vượt lượng tối đa của
// nguồn (limits do request-sources.load tính).
// =============================================================================
const C = require("../../services/domain/core");
const { PURPOSES, isId } = require("./request-sources");

/**
 * @param purpose    mục đích yêu cầu
 * @param lines      dòng người dùng gửi lên [{item_id, quantity, note}]
 * @param limits     Map mặt hàng → lượng tối đa của nguồn
 * @param sourceId   mã chứng từ nguồn
 * @param excludeId  mã yêu cầu đang sửa (không tính chính nó vào lượng đã dùng)
 * @param sourceInfo kết quả request-sources.load (để biết KHSX của nguồn)
 * @returns các dòng đã chuẩn hóa để ghi vào stock_request_lines
 */
async function validate(c, purpose, lines, limits, sourceId, excludeId = null, sourceInfo = null) {
  checkShape(lines);

  // Lượng đã được các yêu cầu khác (chưa hủy) dùng trên cùng nguồn.
  const definition = sourceInfo?.definition || PURPOSES[purpose];
  const used = await alreadyRequested(c, purpose, definition, sourceId, excludeId, sourceInfo);

  // Trừ dần: lượng đã dùng + lượng mới không được vượt lượng tối đa.
  const remaining = new Map(limits);
  for (const line of [...used, ...lines]) {
    const key = String(line.item_id);
    const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
    C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Yêu cầu vượt số lượng nguồn.");
    remaining.set(key, rest);
  }

  return lines.map((line) => ({
    item_id: String(line.item_id),
    quantity: C.decimal(C.qty(line.quantity)),
    note: line.note || null,
  }));
}

/** 1–100 dòng, mặt hàng hợp lệ và không trùng, số lượng > 0, ghi chú ≤ 5000 ký tự. */
function checkShape(lines) {
  C.fail(!Array.isArray(lines) || !lines.length || lines.length > 100, "VALIDATION_ERROR", "Yêu cầu cần 1 đến 100 dòng.");
  const seen = new Set();
  for (const line of lines) {
    C.fields(line, ["item_id", "quantity", "note"]);
    C.fail(!isId(line.item_id) || seen.has(String(line.item_id)), "VALIDATION_ERROR", "Mặt hàng trùng hoặc không hợp lệ.");
    seen.add(String(line.item_id));
    C.qty(line.quantity);
    if (line.note !== undefined) C.text(line.note, "note", 5000, false);
  }
}

/**
 * Các dòng của yêu cầu khác cùng nguồn, cùng mục đích, chưa hủy.
 * Xuất NVL / nhập thành phẩm cộng dồn theo cả KHSX (nhiều báo cáo cùng một
 * KHSX dùng chung hạn mức), trừ nhập thành phẩm từng phần tính theo từng báo cáo.
 */
async function alreadyRequested(c, purpose, definition, sourceId, excludeId, sourceInfo) {
  const byPlan =
    ["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT"].includes(purpose) &&
    sourceInfo &&
    !(purpose === "PRODUCTION_RECEIPT" && sourceInfo.source.KieuThanhPham === "PART");
  const column = byPlan ? "production_plan_id" : definition.field;
  const value = byPlan ? sourceInfo.source.production_plan_id : sourceId;
  const [rows] = await c.execute(
    `SELECT l.item_id,l.quantity FROM stock_request_lines l JOIN stock_requests r ON r.id=l.stock_request_id` +
      ` WHERE r.${column}=? AND r.purpose=? AND r.status<>'CANCELLED'${excludeId ? " AND r.id<>?" : ""} FOR UPDATE`,
    [value, purpose, ...(excludeId ? [excludeId] : [])],
  );
  return rows;
}

module.exports = { validate };
