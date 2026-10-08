const C = require("../services/domain/core");
function requireApiAuth(req, res, next) {
  if (!req.user)
    return next(
      new C.DomainError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập."),
    );
  next();
}
function requireWebAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}
function sessionUser(repo) {
  return async (req, res, next) => {
    try {
      if (req.session.user_id) {
        if (Date.now() - (req.session.born || 0) > 8 * 3600000)
          return req.session.destroy(() =>
            next(
              new C.DomainError(401, "UNAUTHENTICATED", "Phiên đã hết hạn."),
            ),
          );
        req.user = await repo.get("users", req.session.user_id);
        if (
          req.user.status === "LOCKED" ||
          (req.session.session_version !== undefined &&
            req.user.session_version !== req.session.session_version)
        ) {
          return req.session.destroy(() =>
            next(
              new C.DomainError(
                401,
                "UNAUTHENTICATED",
                "Phiên đăng nhập không còn hiệu lực.",
              ),
            ),
          );
        }
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
module.exports = { requireApiAuth, requireWebAuth, sessionUser };
