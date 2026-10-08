const express = require("express");
const { token, csrf } = require("../middlewares/csrf.middleware");
const { requireWebAuth } = require("../middlewares/auth.middleware");
const C = require("../services/domain/core");
const { modules } = require("../config/navigation");
module.exports = (runtime) => {
  const router = express.Router(),
    auth = require("../controllers/web/AuthController")(runtime.auth),
    pages = new (require("./FoundationPageController"))(runtime);
  router.use((req, res, next) => {
    token(req);
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/login", auth.login);
  router.post("/login", csrf, auth.authenticate);
  router.post("/logout", requireWebAuth, csrf, auth.logout);
  router.get("/", (req, res) =>
    res.redirect(req.user ? "/dashboard" : "/login"),
  );
  router.get("/dashboard", requireWebAuth, (req, res) => pages.page(req, res));
  router.get("/records/:resource/:id", requireWebAuth, (req, res) =>
    pages.show(req, res),
  );
  const aliases = {
    "/products": "items",
    "/orders/intake": "customer-orders",
    "/approvals/orders": "customer-orders",
    "/approvals/plans": "business-plans",
    "/catalog/search": "items",
    "/warehouse/receive": "stock-requests",
    "/warehouse/issue": "stock-requests",
    "/stocktake-differences": "exception-proposals",
    "/inventory": "reports/inventory",
    "/stock-in": "stock-documents",
    "/stock-out": "stock-documents",
  };
  for (const url of [
    ...new Set([...modules.map((m) => m[5]), ...Object.keys(aliases)]),
  ])
    router.get(url, requireWebAuth, (req, res) => {
      const candidates = modules.filter((m) => m[5] === url);
      req.webModule = req.query.module || aliases[url] || candidates[0]?.[0];
      C.fail(
        !modules.some(
          (m) =>
            m[0] === req.webModule && (m[5] === url || aliases[url] === m[0]),
        ),
        "NOT_FOUND",
        "Không tìm thấy chức năng.",
        404,
      );
      return pages.page(req, res);
    });
  router.get(
    ["/products/create", "/products/:id/edit"],
    requireWebAuth,
    require("../middlewares/role.middleware")(["WAREHOUSE_MANAGER"]),
    (req, res) => {
      res
        .status(501)
        .render("errors/index", {
          title: "Chức năng đang được hoàn thiện",
          status: 501,
          message: "Tạo/sửa mặt hàng chưa được triển khai với MySQL.",
          requestId: req.request_id,
        });
    },
  );
  return router;
};
