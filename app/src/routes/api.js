const express = require("express");
const P = require("../services/domain/policy");
const { csrf } = require("../middlewares/csrf.middleware");
const { requireApiAuth } = require("../middlewares/auth.middleware");
const factory = require("../controllers/api/ResourceApiController");
module.exports = ({ service, repo, auth }) => {
  const router = express.Router();
  router.use("/auth", require("./auth.routes")(auth));
  router.use(csrf, requireApiAuth);
  router.use(require("./inventory.routes")(service, repo));
  for (const n of Object.keys(P.read)) {
    const c =
      n === "items"
        ? require("../controllers/api/ProductApiController")(service)
        : factory(service, n);
    router.get("/" + n, c.index);
    router.get("/" + n + "/:id", c.show);
    if (P.create[n]) router.post("/" + n, c.create);
    if (P.editable[n]) router.patch("/" + n + "/:id", c.edit);
    if (
      [
        ...P.masters,
        "business-plans",
        "stock-requests",
        "qc-inspections",
        "tasks",
      ].includes(n)
    )
      router.delete("/" + n + "/:id", c.delete);
    for (const [a, names] of Object.entries(P.actionResources))
      if (a !== "read" && names.includes(n))
        router.post("/" + n + "/:id/" + a, c.action(a));
  }
  return router;
};
