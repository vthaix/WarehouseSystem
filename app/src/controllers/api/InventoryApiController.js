const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const { ok } = require("../../utils/response");
module.exports = (service, repo) => ({
  sampleItems: (req, res) => {
    P.role(req.user, ["CUSTOMER"]);
    ok(
      req,
      res,
      repo
        .all("items")
        .filter(
          (i) =>
            i.kind === "FINISHED_PRODUCT" &&
            i.is_sample &&
            i.is_published &&
            i.is_active,
        ),
    );
  },
  lookup: (req, res) =>
    ok(req, res, service.lookup(req.user, req.params.resource, req.query)),
  catalogData: (req, res) => {
    P.role(req.user, ["WAREHOUSE_MANAGER"]);
    const map = {
        warehouses: "warehouses",
        suppliers: "suppliers",
        materials: "items",
        "finished-products": "items",
        lots: "lots",
        inventory: "inventory",
      },
      name = map[req.query.resource];
    C.fail(!name, "VALIDATION_ERROR", "Loại dữ liệu không hợp lệ.");
    if (name === "inventory") return ok(req, res, repo.all(name));
    const q = {
      ...req.query,
      ...(req.query.resource === "materials"
        ? { kind: "MATERIAL" }
        : req.query.resource === "finished-products"
          ? { kind: "FINISHED_PRODUCT" }
          : {}),
    };
    const r = service.list(req.user, name, q);
    ok(req, res, r.data, 200, r.meta);
  },
  allocations: (req, res) =>
    ok(
      req,
      res,
      service.allocations(req.user, req.params.id, req.query.task_id),
    ),
  countLines: (req, res) => {
    const st = service.get(req.user, "stocktakes", req.params.id);
    ok(req, res, service.countScope(req.user, st, req.params.warehouse));
  },
  saveCounts: (req, res) =>
    ok(
      req,
      res,
      service.counts(req.user, req.params.id, req.params.warehouse, req.body),
    ),
  completeCounts: (req, res) =>
    ok(
      req,
      res,
      service.counts(
        req.user,
        req.params.id,
        req.params.warehouse,
        req.body,
        true,
        req.get("Idempotency-Key"),
      ),
    ),
  stocktakeDifferences: (req, res) => {
    P.role(req.user, ["WAREHOUSE_MANAGER", "DIRECTOR"]);
    ok(
      req,
      res,
      repo.all("stocktakes").flatMap((st) =>
        st.warehouses.flatMap((w) =>
          w.lines
            .filter(
              (l) =>
                l.actual_quantity !== null &&
                l.actual_quantity !== l.system_quantity &&
                !l.resolved,
            )
            .map((l) => ({
              ...l,
              stocktake_id: st.id,
              warehouse_id: w.warehouse_id,
            })),
        ),
      ),
    );
  },
  exportInventory: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query, true);
    C.fail(
      r.data.length > 50000,
      "VALIDATION_ERROR",
      "Giới hạn xuất 50.000 dòng.",
    );
    const headers = [...new Set(r.data.flatMap((x) => Object.keys(x)))];
    const cell = (v) => {
      let s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replaceAll('"', '""')}"`;
    };
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="${n}.csv"`);
    res.send(
      "\ufeff" +
        [
          headers.map(cell).join(","),
          ...r.data.map((x) => headers.map((k) => cell(x[k])).join(",")),
        ].join("\r\n"),
    );
  })("inventory"),
  inventoryReport: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query);
    ok(req, res, r.data, 200, r.meta);
  })("inventory"),
  exportStockDocuments: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query, true);
    C.fail(
      r.data.length > 50000,
      "VALIDATION_ERROR",
      "Giới hạn xuất 50.000 dòng.",
    );
    const headers = [...new Set(r.data.flatMap((x) => Object.keys(x)))];
    const cell = (v) => {
      let s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replaceAll('"', '""')}"`;
    };
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="${n}.csv"`);
    res.send(
      "\ufeff" +
        [
          headers.map(cell).join(","),
          ...r.data.map((x) => headers.map((k) => cell(x[k])).join(",")),
        ].join("\r\n"),
    );
  })("stock-documents"),
  stockDocumentsReport: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query);
    ok(req, res, r.data, 200, r.meta);
  })("stock-documents"),
  exportStocktakes: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query, true);
    C.fail(
      r.data.length > 50000,
      "VALIDATION_ERROR",
      "Giới hạn xuất 50.000 dòng.",
    );
    const headers = [...new Set(r.data.flatMap((x) => Object.keys(x)))];
    const cell = (v) => {
      let s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replaceAll('"', '""')}"`;
    };
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="${n}.csv"`);
    res.send(
      "\ufeff" +
        [
          headers.map(cell).join(","),
          ...r.data.map((x) => headers.map((k) => cell(x[k])).join(",")),
        ].join("\r\n"),
    );
  })("stocktakes"),
  stocktakesReport: ((n) => (req, res) => {
    const r = service.report(req.user, n, req.query);
    ok(req, res, r.data, 200, r.meta);
  })("stocktakes"),
  readNotification: (req, res) =>
    ok(
      req,
      res,
      service.run(req.user, "notifications", "read", req.params.id, {}, null),
    ),
});
