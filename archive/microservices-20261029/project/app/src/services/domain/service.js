const crypto = require("node:crypto");
const C = require("./core");
const P = require("./policy");
class WarehouseService {
  constructor(repo) {
    this.repo = repo;
  }
  visible(u, r, n) {
    if (!P.scope(u, r, n)) return false;
    if (!u.roles.includes("WORKSHOP_OWNER") || u.roles.includes("DIRECTOR"))
      return true;
    if (n === "business-plans")
      return (
        r.type === "SALE" &&
        this.repo
          .all("production-plans")
          .some(
            (p) =>
              u.workshop_ids.includes(p.workshop_id) &&
              p.customer_order_id === r.customer_order_id,
          )
      );
    if (n === "purchase-orders")
      return r.workshop_ids?.some((id) => u.workshop_ids.includes(id));
    return (
      ![
        "stock-documents",
        "stock-requests",
        "production-plans",
        "production-reports",
        "finished-reports",
      ].includes(n) || u.workshop_ids.includes(r.workshop_id)
    );
  }
  get(u, n, id) {
    P.role(u, P.read[n]);
    const r = this.repo.get(n, id);
    C.fail(!this.visible(u, r, n), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    return r;
  }
  audit(u, a, n, r) {
    this.repo.add("audit", {
      user_id: u.id,
      action: a,
      resource: n,
      resource_id: r.id,
    });
  }
  notify(roles, title, source) {
    for (const u of this.repo
      .all("users")
      .filter((u) => u.roles.some((r) => roles.includes(r))))
      this.repo.add("notifications", {
        user_id: u.id,
        title,
        source,
        read_at: null,
      });
  }
  result(u, n, r) {
    return { ...structuredClone(r), actions: this.actions(u, n, r) };
  }
  actions(u, n, r) {
    const has = (roles) => u.roles.some((x) => roles?.includes(x)),
      out = [];
    if (
      has(P.editable[n]) &&
      ([
        "SUBMITTED",
        "RECEIVED",
        "PENDING_APPROVAL",
        "REJECTED",
        "PENDING",
        "DRAFT",
        "PLANNED",
        "RECORDED",
      ].includes(r.status) ||
        P.masters.includes(n))
    )
      out.push("edit");
    if (n === "customer-orders" && r.status === "SUBMITTED" && has(["PLANNER"]))
      out.push("receive");
    if (
      has(["DIRECTOR"]) &&
      ((n === "customer-orders" && r.status === "RECEIVED") ||
        (["business-plans", "exception-proposals"].includes(n) &&
          r.status === "PENDING_APPROVAL") ||
        (n === "production-plans" && r.status === "DRAFT"))
    )
      out.push("review");
    if (
      n === "stock-requests" &&
      ["PENDING", "PARTIALLY_FULFILLED"].includes(r.status) &&
      has(["WAREHOUSE_STAFF"])
    )
      out.push("post");
    if (n === "stocktakes" && has(["DIRECTOR"])) {
      if (r.status === "PLANNED") out.push("start");
      if (["IN_PROGRESS", "COMPLETED"].includes(r.status)) out.push("close");
    }
    if (
      ["production-reports", "finished-reports", "stocktake-minutes"].includes(
        n,
      ) &&
      r.status === "DRAFT" &&
      has(P.editable[n])
    )
      out.push("submit");
    if (
      n === "tasks" &&
      has(["DIRECTOR"]) &&
      ["PLANNED", "IN_PROGRESS"].includes(r.status)
    )
      out.push("progress");
    if (
      (P.masters.includes(n) && has(P.editable[n])) ||
      (["business-plans", "stock-requests", "qc-inspections", "tasks"].includes(
        n,
      ) &&
        out.includes("edit") &&
        r.status !== "IN_PROGRESS")
    )
      out.push("delete");
    return out;
  }
  list(u, n, q = {}) {
    P.role(u, P.read[n]);
    const pagination = require("../../utils/pagination")(q),
      page = pagination.page,
      per = pagination.per_page;
    let rows = this.repo.all(n).filter((r) => this.visible(u, r, n));
    if (q.q) {
      C.text(q.q, "q", 150);
      const term = q.q.toLocaleLowerCase("vi");
      rows = rows.filter((r) =>
        `${r.code} ${r.name || r.title || ""} ${r.id}`
          .toLocaleLowerCase("vi")
          .includes(term),
      );
    }
    for (const k of [
      "status",
      "type",
      "kind",
      "warehouse_id",
      "quality_bucket",
      "item_id",
      "lot_id",
    ])
      if (q[k]) rows = rows.filter((r) => r[k] === q[k]);
    if (q.unread_only === "true") rows = rows.filter((r) => !r.read_at);
    rows = rows.slice().reverse();
    return {
      data: rows
        .slice((page - 1) * per, page * per)
        .map((r) => this.result(u, n, r)),
      meta: {
        page,
        per_page: per,
        total: rows.length,
        total_pages: Math.ceil(rows.length / per),
      },
    };
  }
  replay(u, operation, b, key, mandatory, fn) {
    C.fail(mandatory && !key, "VALIDATION_ERROR", "Thiếu Idempotency-Key.");
    C.fail(
      key && !/^[A-Za-z0-9_-]{1,100}$/.test(key),
      "VALIDATION_ERROR",
      "Khóa thao tác không hợp lệ.",
    );
    const rk = key ? `${u.id}:${operation}:${key}` : null;
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(b))
      .digest("hex");
    if (rk && this.repo.replays.has(rk)) {
      const s = this.repo.replays.get(rk);
      C.fail(
        s.hash !== hash,
        "IDEMPOTENCY_CONFLICT",
        "Khóa đã dùng với nội dung khác.",
        409,
      );
      return structuredClone(s.result);
    }
    const result = this.repo.transaction(fn);
    if (rk)
      this.repo.replays.set(rk, { hash, result: structuredClone(result) });
    return result;
  }
  run(u, n, op, id, b, key) {
    let roles = op === "create" ? P.create[n] : P.editable[n];
    if (!["create", "edit", "delete"].includes(op)) {
      C.fail(
        !P.actionResources[op]?.includes(n),
        "NOT_FOUND",
        "Không có thao tác này.",
        404,
      );
      roles =
        op === "receive"
          ? ["PLANNER"]
          : ["review", "start", "close", "progress"].includes(op)
            ? ["DIRECTOR"]
            : op === "read"
              ? ["*"]
              : P.editable[n];
    }
    if (op === "delete")
      C.fail(
        ![
          ...P.masters,
          "business-plans",
          "stock-requests",
          "qc-inspections",
          "tasks",
        ].includes(n),
        "FORBIDDEN",
        "Không được xóa tài nguyên này.",
        403,
      );
    P.role(u, roles);
    return this.replay(
      u,
      `${n}:${op}:${id || ""}`,
      b,
      key,
      ["review", "start", "close", "submit"].includes(op) ||
        n === "stock-documents",
      () => {
        const r = id ? this.get(u, n, id) : null;
        const v =
          op === "create"
            ? this.create(u, n, b)
            : op === "edit"
              ? this.update(u, n, r, b)
              : op === "delete"
                ? this.cancel(u, n, r, b)
                : this.action(u, n, r, op, b);
        this.audit(u, op, n, v);
        return this.result(u, n, v);
      },
    );
  }
  lines(b, source, kind, priced = false) {
    C.fail(
      !Array.isArray(b.lines) || !b.lines.length || b.lines.length > 100,
      "VALIDATION_ERROR",
      "Chứng từ cần 1–100 dòng hàng.",
    );
    const seen = new Set();
    return b.lines.map((l, i) => {
      C.fields(l, ["item_id", "quantity", "unit_price", "note"]);
      const item = this.repo.get("items", l.item_id);
      C.fail(
        item.is_active === false || (kind && item.kind !== kind),
        "VALIDATION_ERROR",
        "Mặt hàng không phù hợp.",
      );
      C.fail(seen.has(item.id), "VALIDATION_ERROR", "Mặt hàng bị trùng.");
      seen.add(item.id);
      const quantity = C.decimal(
        C.qty(l.quantity, true, `lines.${i}.quantity`),
      );
      if (source)
        C.fail(
          !source.some((s) => s.item_id === item.id),
          "SOURCE_LIMIT_EXCEEDED",
          "Mặt hàng không thuộc nguồn.",
        );
      const unit_price = priced
        ? (l.unit_price ?? item.reference_price)
        : undefined;
      if (priced) C.price(unit_price);
      C.text(l.note, "note", 5000, false);
      return {
        id: crypto.randomUUID(),
        item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        quantity,
        ...(priced ? { unit_price } : {}),
        fulfilled_quantity: "0.000",
        note: l.note || "",
      };
    });
  }
  total(lines) {
    return C.money(
      lines.reduce(
        (n, l) =>
          n + (C.qty(l.quantity) * C.price(l.unit_price) + 500n) / 1000n,
        0n,
      ),
    );
  }
  lookup(u, n, q = {}) {
    const allow = {
      warehouses: [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF",
        "WORKSHOP_OWNER",
        "DIRECTOR",
        "STOCKTAKER",
      ],
      "warehouse-locations": ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"],
      suppliers: ["WAREHOUSE_MANAGER", "PLANNER", "PURCHASER"],
      categories: ["WAREHOUSE_MANAGER"],
      items: ["WAREHOUSE_MANAGER", "PLANNER", "WORKSHOP_OWNER"],
      lots: ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "QC_INSPECTOR"],
      units: ["WAREHOUSE_MANAGER"],
      customers: ["PLANNER"],
      users: ["DIRECTOR"],
      "customer-orders": ["PLANNER"],
      "business-plans": ["PURCHASER", "WORKSHOP_OWNER"],
      "purchase-orders": ["WORKSHOP_OWNER", "WAREHOUSE_MANAGER"],
      "production-plans": ["WORKSHOP_OWNER", "PLANNER"],
    };
    P.role(u, allow[n]);
    let rows = this.repo
      .all(n === "customers" ? "users" : n)
      .filter(
        (r) => r.is_active !== false && (!P.read[n] || this.visible(u, r, n)),
      );
    if (n === "customers")
      rows = rows.filter((r) => r.roles.includes("CUSTOMER"));
    if (
      n === "warehouses" &&
      u.roles.includes("STOCKTAKER") &&
      !u.roles.includes("DIRECTOR")
    )
      rows = rows.filter((w) =>
        this.repo
          .all("stocktakes")
          .some((s) =>
            s.warehouses.some(
              (x) => x.warehouse_id === w.id && x.assignee_ids.includes(u.id),
            ),
          ),
      );
    if (n === "users") rows = rows.filter((r) => !r.roles.includes("CUSTOMER"));
    if (q.q)
      rows = rows.filter((r) =>
        `${r.code} ${r.name || r.full_name || ""}`
          .toLowerCase()
          .includes(String(q.q).toLowerCase()),
      );
    return rows.slice(0, 50).map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name || r.full_name || r.code,
      roles: r.roles,
      kind: r.kind,
      warehouse_id: r.warehouse_id,
      status: r.status,
      customer_id: r.customer_id,
      lines: r.lines,
      outputs: r.outputs,
      materials: r.materials,
    }));
  }
}
Object.assign(
  WarehouseService.prototype,
  require("./workflows"),
  require("./inventory"),
);
require("./editing")(WarehouseService);
require("./business-flow")(WarehouseService);
Object.assign(WarehouseService.prototype, require("./dispatch"));
require("./lookup")(WarehouseService);
module.exports = { WarehouseService };
