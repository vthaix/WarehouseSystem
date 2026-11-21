// =============================================================================
// CHỐNG GHI TRÙNG KHI GỬI LẠI (ngoại lệ "không kết nối được khi xác nhận")
// Trình duyệt gửi kèm header Idempotency-Key, giữ nguyên khi người dùng bấm gửi lại.
// Lần đầu: chạy thao tác và lưu kết quả theo (người dùng, loại thao tác, khóa).
// Lần sau cùng khóa, cùng nội dung: trả lại kết quả cũ, không tạo chứng từ mới.
// Cùng khóa nhưng nội dung khác: từ chối.
// Không có khóa (script cũ, API): chạy bình thường.
// =============================================================================
const crypto = require("node:crypto");
const C = require("../services/domain/core");

/**
 * Chạy work() đúng một lần cho một khóa, trong transaction đang mở của connection.
 * @param work async () => giá trị JSON được lưu lại để trả cho lần gửi lặp.
 */
async function once(connection, userId, operation, key, body, work) {
  if (key === undefined || key === null || key === "") return work();
  C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Idempotency-Key không hợp lệ.");
  const hash = crypto.createHash("sha256").update(JSON.stringify(body ?? {})).digest("hex");
  await connection.execute(
    "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,?,?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
    [userId, operation, key, hash],
  );
  // Khóa bản ghi: hai lần gửi đồng thời cùng khóa sẽ chờ nhau, lần sau thấy kết quả của lần trước.
  const [[record]] = await connection.execute(
    "SELECT * FROM idempotency_records WHERE user_id=? AND operation=? AND idempotency_key=? FOR UPDATE",
    [userId, operation, key],
  );
  C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
  if (record.response_status === 200)
    return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
  const result = await work();
  await connection.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result ?? null), record.id]);
  return result;
}

module.exports = { once };
