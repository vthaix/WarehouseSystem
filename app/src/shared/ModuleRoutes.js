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
  router.get("/lookup/:resource", async (req, res) => {
    if (req.params.resource === "customer-orders") {
      P.role(req.user, ["PLANNER"]);
      const result = await runtime.orders.list(req.user, { per_page: 100 });
      return ok(
        req,
        res,
        result.data.filter((order) => ["RECEIVED", "APPROVED", "IN_PROGRESS"].includes(order.status)).map((order) => ({
          id: order.id,
          code: order.code,
          status: order.status,
          name: `${order.code} · ${order.customer_name}`,
        })),
      );
    }
    const lookupRoles = {
      items: ["PLANNER", "PURCHASER", "WAREHOUSE_MANAGER", "WORKSHOP_OWNER"],
      suppliers: ["PLANNER", "PURCHASER", "WAREHOUSE_MANAGER"],
      warehouses: ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "WORKSHOP_OWNER", "DIRECTOR"],
      "warehouse-locations": ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"],
      categories: ["WAREHOUSE_MANAGER"],
      units: ["WAREHOUSE_MANAGER"],
    };
    if (lookupRoles[req.params.resource]) {
      P.role(req.user, lookupRoles[req.params.resource]);
      const result = await runtime.catalog.repository.list(req.params.resource, { per_page: 100, q: req.query.q });
      return ok(req, res, result.data.filter((row) => row.is_active !== false));
    }
    if (req.params.resource === "lots") {
      P.role(req.user, ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "QC_INSPECTOR", "DIRECTOR"]);
      const [rows] = await runtime.pool.execute("SELECT l.*,i.kind,i.name AS item_name,i.name AS name FROM lots l JOIN items i ON i.id=l.item_id ORDER BY l.id DESC LIMIT 100");
      return ok(req, res, rows.map((row) => ({ ...row, id: String(row.id), item_id: String(row.item_id) })));
    }
    if (req.params.resource === "customers") {
      P.role(req.user, ["PLANNER"]);
      const [rows] = await runtime.pool.execute("SELECT id,code,name FROM customers ORDER BY id DESC LIMIT 100");
      return ok(req, res, rows.map((row) => ({ ...row, id: String(row.id) })));
    }
    if (req.params.resource === "business-plans") {
      P.role(req.user, ["PURCHASER", "WORKSHOP_OWNER", "WAREHOUSE_STAFF", "PLANNER"]);
      const result = await runtime.businessPlans.list(req.user, { per_page: 100 });
      return ok(req, res, result.data.filter((row) => row.status === "APPROVED"));
    }
    if (req.params.resource === "purchase-orders") {
      P.role(req.user, P.read["purchase-orders"]);
      const result = await runtime.purchaseOrders.list(req.user, { per_page: 100 });
      return ok(req, res, await Promise.all(result.data.map((row) => runtime.purchaseOrders.get(req.user, row.id))));
    }
    if (req.params.resource === "production-plans") {
      P.role(req.user, P.read["production-plans"]);
      const result = await runtime.productionPlans.list(req.user, { per_page: 100 });
      return ok(req, res, await Promise.all(result.data.map((row) => runtime.productionPlans.get(req.user, row.id))));
    }
    if (req.params.resource === "users") {
      P.role(req.user, ["DIRECTOR", "WAREHOUSE_MANAGER"]);
      const [rows] = await runtime.pool.execute("SELECT id,username,full_name FROM users WHERE status='ACTIVE' ORDER BY id LIMIT 100");
      return ok(req, res, await Promise.all(rows.map(async (row) => {
        const user = await runtime.users.hydrate(row);
        return { id: user.id, name: user.full_name, username: user.username, roles: user.roles };
      })));
    }
    if (req.params.resource === "quality-campaigns") {
      P.role(req.user, ["QC_INSPECTOR", "DIRECTOR"]);
      const result = await runtime.qualityCampaigns.list(req.user, { status: "IN_PROGRESS", per_page: 100 });
      return ok(req, res, await Promise.all(result.data.map((row) => runtime.qualityCampaigns.get(req.user, row.id))));
    }
    if (req.params.resource === "warehouse-managers") {
      P.role(req.user, ["WORKSHOP_OWNER", "WAREHOUSE_MANAGER"]);
      const [rows] = await runtime.pool.execute("SELECT DISTINCT u.id,u.full_name AS name FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_MANAGER' ORDER BY u.id LIMIT 100");
      return ok(req, res, rows.map((row) => ({ ...row, id: String(row.id) })));
    }
    if (req.params.resource === "production-reports") {
      P.role(req.user, P.read["production-reports"]);
      const result = await runtime.productionReports.list(req.user, { status: "SUBMITTED", per_page: 100 });
      return ok(req, res, result.data);
    }
    if (req.params.resource === "stock-requests") {
      P.role(req.user, ["PLANNER", "WAREHOUSE_MANAGER"]);
      const result = await runtime.stockRequests.list(req.user, { per_page: 100 });
      return ok(req, res, result.data);
    }
    return catalog.lookup(req, res);
  });
  router.get("/customer-orders", role(P.read["customer-orders"]), async (req, res) => {
    const result = await runtime.orders.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/customer-orders/:id", role(P.read["customer-orders"]), async (req, res) =>
    ok(req, res, await runtime.orders.get(req.user, req.params.id)),
  );
  router.post("/customer-orders", role(P.create["customer-orders"]), async (req, res) => {
    const result = await runtime.orders.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/customer-orders/${result.id}`);
    ok(req, res, result, 201);
  });
  router.patch("/customer-orders/:id", role(P.editable["customer-orders"]), async (req, res) =>
    ok(req, res, await runtime.orders.update(req.user, req.params.id, req.body, req.request_id)),
  );
  router.post("/customer-orders/:id/receive", role(["PLANNER"]), async (req, res) =>
    ok(req, res, await runtime.orders.receive(req.user, req.params.id, req.body, req.request_id)),
  );
  router.post("/customer-orders/:id/review", role(["DIRECTOR"]), async (req, res) =>
    ok(req, res, await runtime.orders.review(req.user, req.params.id, req.body, req.get("Idempotency-Key"), req.request_id)),
  );
  router.get("/production-plans", role(P.read["production-plans"]), async (req, res) => {
    const result = await runtime.productionPlans.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/production-plans/:id", role(P.read["production-plans"]), async (req, res) =>
    ok(req, res, await runtime.productionPlans.get(req.user, req.params.id)),
  );
  router.post("/production-plans", role(P.create["production-plans"]), async (req, res) => {
    const result = await runtime.productionPlans.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/production-plans/${result.id}`);
    ok(req, res, result, 201);
  });
  router.post("/production-plans/:id/cancel", role(["PLANNER"]), async (req, res) =>
    ok(req, res, await runtime.productionPlans.cancel(req.user, req.params.id, req.body, req.request_id)),
  );
  router.patch("/production-plans/:id", role(["PLANNER"]), async (req, res) =>
    ok(req, res, await runtime.productionPlans.update(req.user, req.params.id, req.body, req.request_id)),
  );
  router.post("/production-plans/:id/review", role(["DIRECTOR"]), async (req, res) =>
    ok(req, res, await runtime.productionPlans.review(req.user, req.params.id, req.body, req.get("Idempotency-Key"), req.request_id)),
  );
  router.get("/business-plans", role(P.read["business-plans"]), async (req, res) => {
    const result = await runtime.businessPlans.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/business-plans/:id", role(P.read["business-plans"]), async (req, res) =>
    ok(req, res, await runtime.businessPlans.get(req.user, req.params.id)),
  );
  router.post("/business-plans", role(P.create["business-plans"]), async (req, res) => {
    const result = await runtime.businessPlans.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/business-plans/${result.id}`);
    ok(req, res, result, 201);
  });
  router.patch("/business-plans/:id", role(P.editable["business-plans"]), async (req, res) =>
    ok(req, res, await runtime.businessPlans.update(req.user, req.params.id, req.body, req.request_id)),
  );
  router.delete("/business-plans/:id", role(P.editable["business-plans"]), async (req, res) =>
    ok(req, res, await runtime.businessPlans.remove(req.user, req.params.id, req.body, req.request_id)),
  );
  router.post("/business-plans/:id/review", role(["DIRECTOR"]), async (req, res) =>
    ok(req, res, await runtime.businessPlans.review(req.user, req.params.id, req.body, req.get("Idempotency-Key"), req.request_id)),
  );
  router.get("/purchase-orders", role(P.read["purchase-orders"]), async (req, res) => {
    const result = await runtime.purchaseOrders.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/purchase-orders/:id", role(P.read["purchase-orders"]), async (req, res) =>
    ok(req, res, await runtime.purchaseOrders.get(req.user, req.params.id)),
  );
  router.post("/purchase-orders", role(P.create["purchase-orders"]), async (req, res) => {
    const result = await runtime.purchaseOrders.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/purchase-orders/${result.id}`);
    ok(req, res, result, 201);
  });
  for (const [resource, service] of [["production-reports", runtime.productionReports], ["finished-reports", runtime.finishedReports]]) {
    router.get("/" + resource, role(P.read[resource]), async (req, res) => {
      const result = await service.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    });
    router.get("/" + resource + "/:id", role(P.read[resource]), async (req, res) =>
      ok(req, res, await service.get(req.user, req.params.id)),
    );
    router.post("/" + resource, role(P.create[resource]), async (req, res) => {
      const result = await service.create(req.user, req.body, req.request_id);
      res.set("Location", `/api/v1/${resource}/${result.id}`);
      ok(req, res, result, 201);
    });
    router.patch("/" + resource + "/:id", role(P.editable[resource]), async (req, res) =>
      ok(req, res, await service.update(req.user, req.params.id, req.body, req.request_id)),
    );
    router.post("/" + resource + "/:id/submit", role(["WORKSHOP_OWNER"]), async (req, res) =>
      ok(req, res, await service.submit(req.user, req.params.id, req.body, req.request_id)),
    );
  }
  for (const kind of ["inventory", "stock-documents", "stocktakes"]) {
    const resource = "reports/" + kind;
    router.get("/" + resource, role(reportRoles[resource]), async (req, res) => {
      const result = await runtime.reports.run(req.user, kind, req.query);
      ok(req, res, result.data, 200, result.meta);
    });
    router.get("/" + resource + "/export", role(reportRoles[resource]), async (req, res) => {
      const csv = await runtime.reports.csv(req.user, kind, req.query);
      res.set("Content-Type", "text/csv; charset=utf-8");
      res.set("Content-Disposition", `attachment; filename="${kind}.csv"`);
      res.send(csv);
    });
  }
  router.get("/quality-campaigns", role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]), async (req, res) => {
    const result = await runtime.qualityCampaigns.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/quality-campaigns/:id", role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]), async (req, res) =>
    ok(req, res, await runtime.qualityCampaigns.get(req.user, req.params.id)),
  );
  router.post("/quality-campaigns", role(["DIRECTOR"]), async (req, res) => {
    const result = await runtime.qualityCampaigns.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/quality-campaigns/${result.id}`);
    ok(req, res, result, 201);
  });
  for (const action of ["start", "close"])
    router.post(`/quality-campaigns/:id/${action}`, role(["DIRECTOR"]), async (req, res) =>
      ok(req, res, await runtime.qualityCampaigns.action(req.user, req.params.id, req.body, action, req.request_id)),
    );
  router.post("/stocktakes", role(["DIRECTOR"]), async (req, res, next) => {
    if (req.body?.campaign_type !== "QUALITY_CHECK") return pending(req, res, next);
    const result = await runtime.qualityCampaigns.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/quality-campaigns/${result.id}`);
    ok(req, res, result, 201);
  });
  router.get("/stocktakes", role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]), async (req, res) => {
    const result = await runtime.qualityCampaigns.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/stocktakes/:id", role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]), async (req, res) =>
    ok(req, res, await runtime.qualityCampaigns.get(req.user, req.params.id)),
  );
  router.post("/stocktakes/:id/start", role(["DIRECTOR"]), async (req, res) =>
    ok(req, res, await runtime.qualityCampaigns.action(req.user, req.params.id, req.body, "start", req.request_id)),
  );
  router.post("/stocktakes/:id/close", role(["DIRECTOR"]), async (req, res) =>
    ok(req, res, await runtime.qualityCampaigns.action(req.user, req.params.id, req.body, "close", req.request_id)),
  );
  router.get("/qc-inspections", role(P.read["qc-inspections"]), async (req, res) => {
    const result = await runtime.quality.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/qc-inspections/:id", role(P.read["qc-inspections"]), async (req, res) =>
    ok(req, res, await runtime.quality.get(req.user, req.params.id)),
  );
  router.post("/qc-inspections", role(P.create["qc-inspections"]), async (req, res) => {
    const result = await runtime.quality.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/qc-inspections/${result.id}`);
    ok(req, res, result, 201);
  });
  router.patch("/qc-inspections/:id", role(P.editable["qc-inspections"]), async (req, res) =>
    ok(req, res, await runtime.quality.update(req.user, req.params.id, req.body, req.request_id)),
  );
  router.delete("/qc-inspections/:id", role(P.editable["qc-inspections"]), async (req, res) =>
    ok(req, res, await runtime.quality.remove(req.user, req.params.id, req.body, req.request_id)),
  );
  router.get("/stock-requests", role(P.read["stock-requests"]), async (req, res) => {
    const result = await runtime.stockRequests.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/stock-requests/:id", role(P.read["stock-requests"]), async (req, res) =>
    ok(req, res, await runtime.stockRequests.get(req.user, req.params.id)),
  );
  router.post("/stock-requests", role(P.create["stock-requests"]), async (req, res) => {
    const result = await runtime.stockRequests.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/stock-requests/${result.id}`);
    ok(req, res, result, 201);
  });
  router.patch("/stock-requests/:id", role(P.editable["stock-requests"]), async (req, res) =>
    ok(req, res, await runtime.stockRequests.update(req.user, req.params.id, req.body, req.request_id)),
  );
  router.delete("/stock-requests/:id", role(P.editable["stock-requests"]), async (req, res) =>
    ok(req, res, await runtime.stockRequests.remove(req.user, req.params.id, req.body, req.request_id)),
  );
  router.get("/stock-requests/:id/allocations", role(["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]), async (req, res) =>
    ok(req, res, await runtime.warehouseFlow.preview(req.user, req.params.id, req.query)),
  );
  router.post("/stock-requests/:id/dispatch", role(["WAREHOUSE_MANAGER"]), async (req, res) =>
    ok(req, res, await runtime.warehouseFlow.dispatch(req.user, req.params.id, req.body, req.get("Idempotency-Key"), req.request_id)),
  );
  router.get("/stock-documents", role(P.read["stock-documents"]), async (req, res) => {
    const result = await runtime.warehouseFlow.documents(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/stock-documents/:id", role(P.read["stock-documents"]), async (req, res) =>
    ok(req, res, await runtime.warehouseFlow.document(req.user, req.params.id)),
  );
  router.post("/stock-documents", role(P.create["stock-documents"]), async (req, res) => {
    const result = await runtime.warehouseFlow.post(req.user, req.body, req.get("Idempotency-Key"), req.request_id);
    res.set("Location", `/api/v1/stock-documents/${result.id}`);
    ok(req, res, result, 201);
  });
  router.get("/warehouse-records", role(P.read["warehouse-records"]), async (req, res) => {
    const result = await runtime.warehouseRecords.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/warehouse-records/:id", role(P.read["warehouse-records"]), async (req, res) =>
    ok(req, res, await runtime.warehouseRecords.get(req.user, req.params.id)),
  );
  router.post("/warehouse-records", role(P.create["warehouse-records"]), async (req, res) => {
    const result = await runtime.warehouseRecords.create(req.user, req.body, req.request_id);
    res.set("Location", `/api/v1/warehouse-records/${result.id}`);
    ok(req, res, result, 201);
  });
  for (const module of registry)
    for (const resource of module.resources) {
      if (["auth", "customer-orders", "production-plans", "business-plans", "purchase-orders", "production-reports", "finished-reports", "qc-inspections", "stock-requests", "stock-documents", "warehouse-records", "stocktakes"].includes(resource) || resource.startsWith("reports/")) continue;
      const roles = P.read[resource] || reportRoles[resource];
      if (runtime.catalog.supports(resource)) {
        router.get("/" + resource, catalog.list(resource));
        router.get("/" + resource + "/:id", catalog.show(resource));
        if (resource !== "lots") {
          router.post("/" + resource, role(P.create[resource]), async (req, res) => {
            const result = await runtime.catalogWrite.create(req.user, resource, req.body, req.request_id);
            res.set("Location", `/api/v1/${resource}/${result.id}`);
            ok(req, res, result, 201);
          });
          router.patch("/" + resource + "/:id", role(P.editable[resource]), async (req, res) =>
            ok(req, res, await runtime.catalogWrite.update(req.user, resource, req.params.id, req.body, req.request_id)),
          );
          router.delete("/" + resource + "/:id", role(P.editable[resource]), async (req, res) =>
            ok(req, res, await runtime.catalogWrite.remove(req.user, resource, req.params.id, req.body, req.request_id)),
          );
        } else {
          router.post("/lots", role(P.create.lots), async (req, res) => {
            const result = await runtime.catalogWrite.createLot(req.user, req.body, req.request_id);
            res.set("Location", `/api/v1/lots/${result.id}`);
            ok(req, res, result, 201);
          });
          router.patch("/lots/:id", role(P.editable.lots), async (req, res) =>
            ok(req, res, await runtime.catalogWrite.updateLot(req.user, req.params.id, req.body, req.request_id)),
          );
          router.delete("/lots/:id", role(P.editable.lots), async (req, res) =>
            ok(req, res, await runtime.catalogWrite.removeLot(req.user, req.params.id, req.body, req.request_id)),
          );
        }
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
      if (P.create[resource] && !runtime.catalog.supports(resource))
        router.post("/" + resource, role(P.create[resource]), pending);
      if (P.editable[resource] && !runtime.catalog.supports(resource))
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
        ].includes(resource) && !runtime.catalog.supports(resource)
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
