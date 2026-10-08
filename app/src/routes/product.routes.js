const express = require("express");
const { requireWebAuth } = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const { csrf } = require("../middlewares/csrf.middleware");
const ProductService = require("../services/ProductService");
module.exports = ({ service, pages }) => {
  const router = express.Router(),
    controller = require("../controllers/web/ProductController")(
      new ProductService(service),
      pages,
    );
  router.use(requireWebAuth, role(["WAREHOUSE_MANAGER"]));
  router.get("/", (req, res) => {
    req.webModule = "items";
    require("../controllers/web/ResourceController")(pages)(req, res);
  });
  router.get("/create", controller.create);
  router.post("/", csrf, controller.store);
  router.get("/:id/edit", controller.edit);
  router.post("/:id", csrf, controller.update);
  return router;
};
