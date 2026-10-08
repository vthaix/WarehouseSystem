const express = require("express");
const C = require("../services/domain/core");
const P = require("../services/domain/policy");
const role = require("../middlewares/role.middleware");
const { ok } = require("../utils/response");
const registry = require("../modules/registry");
const reportRoles = {
  "reports/inventory": ["DIRECTOR"],
  "reports/stock-documents": ["DIRECTOR", "WORKSHOP_OWNER"],
  "reports/stocktakes": ["DIRECTOR"],
};
function pending(req, res, next) {
  next(
    new C.DomainError(
      501,
      "NOT_IMPLEMENTED",
      "Chức năng này chưa được triển khai với MySQL.",
    ),
  );
}
module.exports = (runtime) => {
  const router = express.Router(),
    catalog = require("../modules/catalog/ApiController")(runtime.catalog);
  router.get("/modules", (req, res) =>
    ok(
      req,
      res,
      registry
        .filter((m) =>
          m.resources.some((r) =>
            (P.read[r] || reportRoles[r] || []).some(
              (role) => role === "*" || req.user.roles.includes(role),
            ),
          ),
        )
        .map((m) => ({ name: m.name, status: m.status, uc: m.uc })),
    ),
  );
  router.get("/sample-items", catalog.samples);
  router.get("/lookup/:resource", catalog.lookup);
  for (const module of registry)
    for (const resource of module.resources) {
      if (resource === "auth") continue;
      const roles = P.read[resource] || reportRoles[resource];
      if (runtime.catalog.supports(resource)) {
        router.get("/" + resource, catalog.list(resource));
        router.get("/" + resource + "/:id", catalog.show(resource));
      } else if (resource === "notifications") {
        router.get("/notifications", async (req, res) => {
          const r = await runtime.notifications.list(req.user, req.query);
          ok(req, res, r.data, 200, r.meta);
        });
        router.get("/notifications/:id", async (req, res) =>
          ok(
            req,
            res,
            await runtime.notifications.get(req.user, req.params.id),
          ),
        );
        router.patch("/notifications/:id/read", async (req, res) =>
          ok(
            req,
            res,
            await runtime.notifications.read(req.user, req.params.id),
          ),
        );
      } else {
        router.get("/" + resource, role(roles), pending);
        router.get("/" + resource + "/:id", role(roles), pending);
      }
      if (P.create[resource])
        router.post("/" + resource, role(P.create[resource]), pending);
      if (P.editable[resource])
        router.patch(
          "/" + resource + "/:id",
          role(P.editable[resource]),
          pending,
        );
      if (
        [
          ...P.masters,
          "business-plans",
          "stock-requests",
          "qc-inspections",
          "tasks",
        ].includes(resource)
      )
        router.delete(
          "/" + resource + "/:id",
          role(P.editable[resource]),
          pending,
        );
      for (const [action, names] of Object.entries(P.actionResources))
        if (action !== "read" && names.includes(resource)) {
          const actionRoles =
            action === "receive"
              ? ["PLANNER"]
              : action === "dispatch"
                ? ["WAREHOUSE_MANAGER"]
                : action === "cancel"
                  ? ["PLANNER"]
                  : action === "submit"
                    ? P.editable[resource]
                    : action === "progress"
                      ? ["DIRECTOR", "WAREHOUSE_MANAGER"]
                      : ["DIRECTOR"];
          router.post(
            "/" + resource + "/:id/" + action,
            role(actionRoles),
            pending,
          );
        }
      if (resource.startsWith("reports/"))
        router.get("/" + resource + "/export", role(roles), pending);
    }
  router.get("/catalog-data", role(["WAREHOUSE_MANAGER"]), pending);
  router.get(
    "/stock-requests/:id/allocations",
    role(["WAREHOUSE_STAFF", "WAREHOUSE_MANAGER"]),
    pending,
  );
  router.post("/tasks/:id/postTask", role(["WAREHOUSE_STAFF"]), pending);
  router.get(
    "/stocktakes/:id/warehouses/:warehouse/lines",
    role(["STOCKTAKER"]),
    pending,
  );
  router.patch(
    "/stocktakes/:id/warehouses/:warehouse/counts",
    role(["STOCKTAKER"]),
    pending,
  );
  router.post(
    "/stocktakes/:id/warehouses/:warehouse/complete",
    role(["STOCKTAKER"]),
    pending,
  );
  router.get(
    "/stocktake-differences",
    role(["WAREHOUSE_MANAGER", "DIRECTOR"]),
    pending,
  );
  return router;
};
