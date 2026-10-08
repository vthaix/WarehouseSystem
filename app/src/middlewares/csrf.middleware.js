const crypto = require("node:crypto");
const C = require("../services/domain/core");
function token(req) {
  return (req.session.csrf ||= crypto.randomBytes(24).toString("hex"));
}
function csrf(req, res, next) {
  const supplied = req.get("X-CSRF-Token") || req.body?._csrf;
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    (!req.session.csrf || supplied !== req.session.csrf)
  )
    return next(
      new C.DomainError(
        403,
        "CSRF_INVALID",
        "Phiên form đã hết hạn. Vui lòng tải lại.",
      ),
    );
  next();
}
module.exports = { token, csrf };
