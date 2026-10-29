const { token } = require("../../middlewares/csrf.middleware");
module.exports = (auth) => ({
  login(req, res) {
    token(req);
    res.render("layouts/main", {
      view: "auth/login",
      title: "Đăng nhập",
      user: null,
      error: null,
      csrf: req.session.csrf,
      boot: JSON.stringify({ user: null, csrf: req.session.csrf }),
    });
  },
  async authenticate(req, res, next) {
    try {
      const user = await auth.authenticate(
        { username: req.body.username, password: req.body.password },
        req.ip,
        req.request_id,
      );
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user_id = user.id;
        req.session.born = Date.now();
        req.session.session_version = user.session_version;
        token(req);
        req.session.save((err) =>
          err ? next(err) : res.redirect(303, "/dashboard"),
        );
      });
    } catch (error) {
      if (error.status === 401 || error.status === 429)
        return res.status(error.status).render("layouts/main", {
          view: "auth/login",
          title: "Đăng nhập",
          user: null,
          error: error.message,
          csrf: req.session.csrf,
          boot: JSON.stringify({ user: null, csrf: req.session.csrf }),
        });
      next(error);
    }
  },
  logout(req, res, next) {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.redirect(303, "/login");
    });
  },
});
