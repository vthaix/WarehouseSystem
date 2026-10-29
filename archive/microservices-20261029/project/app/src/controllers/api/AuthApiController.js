const { ok, safeUser } = require("../../utils/response");
const { token } = require("../../middlewares/csrf.middleware");
const crypto = require("node:crypto");
module.exports = (auth) => ({
  csrf: (req, res) => ok(req, res, { csrf_token: token(req) }),
  login: async (req, res, next) => {
    try {
      const user = await auth.authenticate(req.body, req.ip, req.request_id);
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user_id = user.id;
        req.session.born = Date.now();
        req.session.session_version = user.session_version;
        req.session.csrf = crypto.randomBytes(24).toString("hex");
        ok(req, res, { ...safeUser(user), csrf_token: req.session.csrf });
      });
    } catch (e) {
      next(e);
    }
  },
  me: (req, res) => ok(req, res, safeUser(req.user)),
  logout: (req, res, next) =>
    req.session.destroy((e) => {
      if (e) return next(e);
      res.clearCookie("connect.sid");
      res.sendStatus(204);
    }),
});
