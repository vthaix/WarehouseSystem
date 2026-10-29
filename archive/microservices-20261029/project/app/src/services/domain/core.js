const crypto = require("node:crypto");
class DomainError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    Object.assign(this, { status, code, fields });
  }
}
function fail(condition, code, message, status = 422, fields = {}) {
  if (condition) throw new DomainError(status, code, message, fields);
}
function qty(value, positive = true, field = "quantity") {
  fail(
    typeof value !== "string" || !/^\d{1,12}(\.\d{1,3})?$/.test(value),
    "VALIDATION_ERROR",
    "Số lượng phải là chuỗi số, tối đa 3 chữ số thập phân.",
    422,
    { [field]: ["Số lượng không hợp lệ"] },
  );
  const [a, b = ""] = value.split("."),
    n = BigInt(a) * 1000n + BigInt(b.padEnd(3, "0"));
  fail(
    positive ? n <= 0n : n < 0n,
    "VALIDATION_ERROR",
    "Số lượng không hợp lệ.",
  );
  return n;
}
function decimal(n) {
  const sign = n < 0n ? "-" : "";
  n = n < 0n ? -n : n;
  return `${sign}${n / 1000n}.${String(n % 1000n).padStart(3, "0")}`;
}
function price(v) {
  fail(
    typeof v !== "string" || !/^\d{1,12}(\.\d{1,4})?$/.test(v),
    "VALIDATION_ERROR",
    "Đơn giá không hợp lệ.",
  );
  const [a, b = ""] = v.split(".");
  return BigInt(a) * 10000n + BigInt(b.padEnd(4, "0"));
}
function money(n) {
  return `${n / 10000n}.${String(n % 10000n).padStart(4, "0")}`;
}
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function date(v, field = "date", future = false) {
  fail(
    typeof v !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
      !Number.isFinite(Date.parse(v)) ||
      new Date(v).toISOString().slice(0, 10) !== v ||
      (future && v < today()),
    "VALIDATION_ERROR",
    "Ngày không hợp lệ.",
    422,
    { [field]: ["Kiểm tra ngày nhập"] },
  );
  return v;
}
function text(v, field, max = 5000, required = true) {
  fail(
    (required && (typeof v !== "string" || !v.trim())) ||
      (v !== undefined && (typeof v !== "string" || v.length > max)),
    "VALIDATION_ERROR",
    `Kiểm tra trường ${field}.`,
    422,
    { [field]: ["Giá trị không hợp lệ"] },
  );
  return v;
}
function fields(b, allowed) {
  fail(
    !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).some((k) => !allowed.includes(k)),
    "VALIDATION_ERROR",
    "Request chứa trường không được phép.",
  );
}
function version(r, v) {
  fail(
    !Number.isInteger(v) || v !== r.version,
    "STALE_VERSION",
    "Dữ liệu đã thay đổi. Vui lòng tải lại.",
    409,
  );
}
function state(r, allowed) {
  fail(
    !allowed.includes(r.status),
    "INVALID_STATE",
    "Trạng thái hiện tại không cho phép thao tác.",
    409,
  );
}
function hashPassword(p, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(p, salt, 64).toString("hex")}`;
}
function verifyPassword(p, h) {
  const [salt, expected] = h.split(":");
  return crypto.timingSafeEqual(
    crypto.scryptSync(p, salt, 64),
    Buffer.from(expected, "hex"),
  );
}
module.exports = {
  DomainError,
  fail,
  qty,
  decimal,
  price,
  money,
  today,
  date,
  text,
  fields,
  version,
  state,
  hashPassword,
  verifyPassword,
};
