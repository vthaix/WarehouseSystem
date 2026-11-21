// =============================================================================
// CHỐNG TẠO TRÙNG CHO MỌI YÊU CẦU POST CÓ "Idempotency-Key"
// (ngoại lệ "không kết nối được khi xác nhận" có trong hầu hết đặc tả)
//
// Tình huống: người dùng bấm Lưu, máy chủ đã ghi xong nhưng mạng ngắt nên trình duyệt
// không nhận được phản hồi. Người dùng bấm Lưu lại với CÙNG khóa (form giữ nguyên khóa
// khi chưa sửa gì) → nếu không chặn sẽ tạo chứng từ thứ hai.
//
// Cách làm:
//   1. Khóa theo (người dùng, đường dẫn, khóa) bằng GET_LOCK để hai lần gửi cùng lúc chờ nhau.
//   2. Nếu khóa này đã có phản hồi thành công → trả lại đúng phản hồi cũ, không chạy lại.
//   3. Nếu chưa → chạy xử lý bình thường; khi thành công (2xx) thì lưu phản hồi lại.
//   4. Cùng khóa nhưng nội dung gửi khác → từ chối (409).
// Lỗi nghiệp vụ (4xx) không được lưu, nên người dùng sửa dữ liệu rồi gửi lại vẫn được xử lý.
// =============================================================================
const crypto = require("node:crypto");
const C = require("../services/domain/core");

function idempotency(pool) {
  return async function (req, res, next) {
    const key = req.get("Idempotency-Key");
    if (req.method !== "POST" || !key || !req.user) return next();
    if (typeof key !== "string" || key.length < 8 || key.length > 100)
      return next(new C.DomainError(422, "VALIDATION_ERROR", "Idempotency-Key không hợp lệ."));

    const operation = ("http:" + req.baseUrl + req.path).slice(0, 100);
    const hash = crypto.createHash("sha256").update(JSON.stringify(req.body ?? {})).digest("hex");
    const lockName = "idem:" + crypto.createHash("sha256").update(`${req.user.id}:${operation}:${key}`).digest("hex").slice(0, 56);
    const connection = await pool.getConnection();
    let released = false;
    const release = async () => {
      if (released) return;
      released = true;
      await connection.query("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => {});
      connection.release();
    };
    try {
      const [[lock]] = await connection.query("SELECT GET_LOCK(?,15) AS acquired", [lockName]);
      if (Number(lock.acquired) !== 1) {
        await release();
        return next(new C.DomainError(409, "IN_PROGRESS", "Yêu cầu trước đó đang được xử lý. Vui lòng kiểm tra lại sau giây lát."));
      }
      const [[saved]] = await connection.execute(
        "SELECT request_hash,response_status,response_body FROM idempotency_records WHERE user_id=? AND operation=? AND idempotency_key=?",
        [req.user.id, operation, key],
      );
      if (saved) {
        await release();
        if (saved.request_hash !== hash)
          return next(new C.DomainError(409, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác."));
        const body = typeof saved.response_body === "string" ? JSON.parse(saved.response_body) : saved.response_body;
        res.set("Idempotent-Replay", "true");
        return res.status(saved.response_status).json(body);
      }
      // Ghi lại phản hồi thành công trước khi gửi về trình duyệt.
      const send = res.json.bind(res);
      let responding = false;
      res.json = (body) => {
        responding = true;
        const status = res.statusCode;
        if (status >= 200 && status < 300)
          connection.execute(
            "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
            [req.user.id, operation, key, hash, status, JSON.stringify(body ?? null)],
          ).catch(() => {}).finally(release);
        else release();
        return send(body);
      };
      res.on("close", () => { if (!responding) release(); }); // phản hồi không phải JSON / client ngắt
      next();
    } catch (error) {
      await release();
      next(error);
    }
  };
}

module.exports = { idempotency };
