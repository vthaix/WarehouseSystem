const {
  modules,
  labels,
  columnsFor,
  fieldNames,
} = require("../config/navigation");
const { safeUser } = require("../utils/response");
const C = require("../services/domain/core");
const P = require("../services/domain/policy");
class FoundationPageController {
  constructor(runtime) {
    this.runtime = runtime;
  }
  async context(req, current = "dashboard") {
    const user = safeUser(req.user),
      available = modules.filter(
        (m) => m[3].includes("*") || user.roles.some((r) => m[3].includes(r)),
      ),
      module = modules.find((m) => m[0] === current);
    C.fail(
      current !== "dashboard" && !available.includes(module),
      "FORBIDDEN",
      "Bạn không có quyền truy cập chức năng này.",
      403,
    );
    let result = { data: [], meta: { page: 1, total: 0, total_pages: 0 } };
    const supported =
      current === "dashboard" ||
      current === "notifications" ||
      current === "customer-orders" ||
      current === "production-plans" ||
      current === "business-plans" ||
      current === "purchase-orders" ||
      current === "production-reports" ||
      current === "finished-reports" ||
      current === "qc-inspections" ||
      current === "stock-requests" ||
      current === "stock-documents" ||
      current === "warehouse-records" ||
      current.startsWith("reports/") ||
      this.runtime.catalog.supports(current);
    if (current === "dashboard" || current === "notifications")
      result = await this.runtime.notifications.list(
        req.user,
        current === "dashboard" ? { per_page: 5 } : req.query,
      );
    else if (this.runtime.catalog.supports(current))
      result = await this.runtime.catalog.list(req.user, current, req.query);
    else if (current === "customer-orders")
      result = await this.runtime.orders.list(req.user, req.query);
    else if (current === "production-plans")
      result = await this.runtime.productionPlans.list(req.user, req.query);
    else if (current === "business-plans")
      result = await this.runtime.businessPlans.list(req.user, req.query);
    else if (current === "purchase-orders")
      result = await this.runtime.purchaseOrders.list(req.user, req.query);
    else if (current === "production-reports")
      result = await this.runtime.productionReports.list(req.user, req.query);
    else if (current === "finished-reports")
      result = await this.runtime.finishedReports.list(req.user, req.query);
    else if (current === "qc-inspections")
      result = await this.runtime.quality.list(req.user, req.query);
    else if (current === "stock-requests")
      result = await this.runtime.stockRequests.list(req.user, req.query);
    else if (current === "stock-documents")
      result = await this.runtime.warehouseFlow.documents(req.user, req.query);
    else if (current === "warehouse-records")
      result = await this.runtime.warehouseRecords.list(req.user, req.query);
    else if (current.startsWith("reports/"))
      result = await this.runtime.reports.run(req.user, current.slice("reports/".length), req.query);
    const context = {
      user,
      available,
      current,
      module,
      labels,
      fieldNames,
      columns: columnsFor(current),
      rows: result.data,
      meta: result.meta,
      query: {
        q: req.query.q || "",
        page: req.query.page || 1,
        status: req.query.status || "",
        from: req.query.from || "",
        to: req.query.to || "",
      },
      title: module?.[1] || "Tổng quan",
      csrf: req.session.csrf,
      canCreate: (P.create[current] || []).some((role) => user.roles.includes(role)) && supported,
      supported,
      statusLabel: (s) => labels[s] || s,
      format: (v) =>
        v === null
          ? "Chưa đếm"
          : v === undefined
            ? "—"
            : typeof v === "boolean"
              ? v
                ? "Có"
                : "Không"
              : labels[v] || v,
    };
    context.boot = JSON.stringify({
      user,
      csrf: context.csrf,
      current,
      rows: context.rows,
      meta: context.meta,
      page: Number(req.query.page || 1),
      form: !supported,
    });
    return context;
  }
  async page(req, res) {
    const current = req.webModule || "dashboard",
      context = await this.context(req, current);
    const view =
      current === "dashboard"
        ? "dashboard/index"
        : context.supported
          ? "resources/index"
          : "foundation/pending";
    res
      .status(context.supported ? 200 : 501)
      .render("layouts/main", { ...context, view });
  }
  async show(req, res) {
    const context = await this.context(req, req.params.resource);
    C.fail(
      !context.supported,
      "NOT_IMPLEMENTED",
      "Chức năng này chưa được triển khai với MySQL.",
      501,
    );
    const record =
      req.params.resource === "notifications"
        ? await this.runtime.notifications.get(req.user, req.params.id)
        : req.params.resource === "customer-orders"
          ? await this.runtime.orders.get(req.user, req.params.id)
          : req.params.resource === "production-plans"
            ? await this.runtime.productionPlans.get(req.user, req.params.id)
          : req.params.resource === "business-plans"
            ? await this.runtime.businessPlans.get(req.user, req.params.id)
          : req.params.resource === "purchase-orders"
            ? await this.runtime.purchaseOrders.get(req.user, req.params.id)
          : req.params.resource === "production-reports"
            ? await this.runtime.productionReports.get(req.user, req.params.id)
          : req.params.resource === "finished-reports"
            ? await this.runtime.finishedReports.get(req.user, req.params.id)
          : req.params.resource === "qc-inspections"
            ? await this.runtime.quality.get(req.user, req.params.id)
          : req.params.resource === "stock-requests"
            ? await this.runtime.stockRequests.get(req.user, req.params.id)
          : req.params.resource === "stock-documents"
            ? await this.runtime.warehouseFlow.document(req.user, req.params.id)
          : req.params.resource === "warehouse-records"
            ? await this.runtime.warehouseRecords.get(req.user, req.params.id)
        : await this.runtime.catalog.get(
            req.user,
            req.params.resource,
            req.params.id,
          );
    res.render("layouts/main", {
      ...context,
      view: "resources/show",
      record,
      boot: JSON.stringify({
        user: context.user,
        csrf: context.csrf,
        current: context.current,
        form: true,
      }),
    });
  }
}
module.exports = FoundationPageController;
