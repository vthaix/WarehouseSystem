const express = require("express");
const { modules } = require("../config/navigation");
const { token, csrf } = require("../middlewares/csrf.middleware");
const { requireWebAuth } = require("../middlewares/auth.middleware");
const PageService = require("../services/PageService");
const C = require("../services/domain/core");
module.exports = ({ service, auth }) => {
  const router = express.Router(),
    pages = new PageService(service),
    authController = require("../controllers/web/AuthController")(auth),
    resourceController = require("../controllers/web/ResourceController")(
      pages,
    );
  router.use((req, res, next) => {
    token(req);
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/login", authController.login);
  router.post("/login", csrf, authController.authenticate);
  router.post("/logout", requireWebAuth, csrf, authController.logout);
  router.get("/", (req, res) =>
    res.redirect(req.user ? "/dashboard" : "/login"),
  );
  router.get(
    "/dashboard",
    requireWebAuth,
    require("../controllers/web/DashboardController")(pages),
  );
  router.use("/products", require("./product.routes")({ service, pages }));
  router.get(
    "/records/:resource/:id",
    requireWebAuth,
    require("../controllers/web/RecordController")(service, pages),
  );
  router.get(
    "/inventory",
    requireWebAuth,
    require("../controllers/web/InventoryController")(pages),
  );
  const aliases = {
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
    router.get(url, requireWebAuth, (req, res, next) => {
      try {
        const choices = modules.filter((m) => m[5] === url);
        req.webModule = req.query.module || aliases[url] || choices[0]?.[0];
        C.fail(
          !modules.some(
            (m) =>
              m[0] === req.webModule && (m[5] === url || aliases[url] === m[0]),
          ),
          "NOT_FOUND",
          "Không tìm thấy chức năng.",
          404,
        );
        resourceController(req, res);
      } catch (error) {
        next(error);
      }
    });
  return router;
};
