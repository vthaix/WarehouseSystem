const {
  modules,
  labels,
  columnsFor,
  fieldNames,
} = require("../config/navigation");
const { safeUser } = require("../utils/response");
const C = require("../services/domain/core");
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
      this.runtime.catalog.supports(current);
    if (current === "dashboard" || current === "notifications")
      result = await this.runtime.notifications.list(
        req.user,
        current === "dashboard" ? { per_page: 5 } : req.query,
      );
    else if (this.runtime.catalog.supports(current))
      result = await this.runtime.catalog.list(req.user, current, req.query);
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
      query: { q: req.query.q || "", page: req.query.page || 1 },
      title: module?.[1] || "Tổng quan",
      csrf: req.session.csrf,
      canCreate: false,
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
