const crypto = require("node:crypto");
const C = require("../services/domain/core");
function token(req) {
  return (req.session.csrf ||= crypto.randomBytes(24).toString("hex"));
}
function csrf(req, res, next) {
  const supplied = req.get("X-CSRF-Token") || req.body?._csrf;
  // Mất phiên đăng nhập (hết hạn / đã đăng xuất ở tab khác) khi đang gửi form:
  // báo đăng nhập lại thay vì báo lỗi form (ngoại lệ "phiên đăng nhập hết hạn" trong đặc tả).
  const signingIn = (req.originalUrl || "").startsWith("/api/v1/auth/");
  const signedIn = Boolean(req.user || req.session.user_id);
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !signingIn && !signedIn)
    return next(
      new C.DomainError(401, "UNAUTHENTICATED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
    );
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
