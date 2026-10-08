const C = require("./domain/core");
const { modules, labels, columnsFor } = require("../config/navigation");
const { safeUser } = require("../utils/response");
class PageService {
  constructor(service) {
    this.service = service;
    this.inventory = new (require("./InventoryService"))(service);
  }
  context(req, current = "dashboard") {
    const user = safeUser(req.user);
    const available = modules.filter(
      (m) => m[3].includes("*") || user.roles.some((r) => m[3].includes(r)),
    );
    const module = modules.find((m) => m[0] === current);
    C.fail(
      current !== "dashboard" && !available.includes(module),
      "FORBIDDEN",
      "Bạn không có quyền truy cập chức năng này.",
      403,
    );
    const query = Object.fromEntries(
      [
        "q",
        "status",
        "type",
        "page",
        "per_page",
        "warehouse_id",
        "as_of",
        "from",
        "to",
      ]
        .filter((k) => req.query[k] !== undefined)
        .map((k) => [k, req.query[k]]),
    );
    if (req.path === "/stock-in") query.type = "IN";
    if (req.path === "/stock-out") query.type = "OUT";
    if (query.as_of && !/[zZ]|[+-]\d{2}:\d{2}$/.test(query.as_of)) {
      const date = new Date(query.as_of + "+07:00");
      C.fail(
        Number.isNaN(date.getTime()),
        "VALIDATION_ERROR",
        "Mốc thời gian không hợp lệ.",
      );
      query.as_of = date.toISOString();
    }
    const result =
      current === "dashboard"
        ? this.service.list(req.user, "notifications", { per_page: 5 })
        : current === "reports/inventory"
          ? this.inventory.report(req.user, query)
          : current.startsWith("reports/")
            ? this.service.report(req.user, current.slice(8), query)
            : this.service.list(req.user, current, query);
    const context = {
      user,
      available,
      current,
      module,
      labels,
      columns: columnsFor(current),
      rows: result.data,
      meta: result.meta,
      query,
      title: module?.[1] || "Tổng quan",
      csrf: req.session.csrf,
      canCreate: !!module?.[4].some((r) => user.roles.includes(r)),
      format: formatValue,
      statusLabel: (s) =>
        current === "customer-orders"
          ? s === "APPROVED" && user.roles.includes("CUSTOMER")
            ? "Đã tiếp nhận"
            : s === "RECEIVED"
              ? "Chờ phê duyệt"
              : s === "SUBMITTED"
                ? "Chờ tiếp nhận"
                : labels[s] || s
          : labels[s] || s,
    };
    context.boot = JSON.stringify({
      user,
      csrf: context.csrf,
      current,
      rows: context.rows,
      meta: context.meta,
      page: Number(query.page || 1),
    });
    return context;
  }
}
function formatValue(v) {
  return v === null
    ? "Chưa đếm"
    : v === undefined
      ? "—"
      : typeof v === "boolean"
        ? v
          ? "Có"
          : "Không"
        : /^-?\d+\.\d+$/.test(String(v))
          ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 4 }).format(
              Number(v),
            )
          : labels[v] || v;
}
module.exports = PageService;
