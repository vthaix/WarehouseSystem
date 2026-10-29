const C = require("./core");
const P = require("./policy");
module.exports = function install(Service) {
  const basic = Service.prototype.update;
  Service.prototype.update = function (u, n, r, b) {
    if (
      [
        "business-plans",
        "production-plans",
        "production-reports",
        "finished-reports",
        "qc-inspections",
        "stock-requests",
      ].includes(n)
    ) {
      C.version(r, b.version);
      C.state(
        r,
        n === "business-plans"
          ? ["PENDING_APPROVAL", "REJECTED"]
          : n === "qc-inspections"
            ? ["RECORDED"]
            : n === "stock-requests"
              ? ["PENDING"]
              : ["DRAFT"],
      );
      const allow = {
        "business-plans": [
          "type",
          "supplier_id",
          "customer_id",
          "customer_order_id",
          "planned_date",
          "note",
          "lines",
          "source_request_id",
        ],
        "production-plans": [
          "customer_order_id",
          "workshop_id",
          "start_date",
          "end_date",
          "outputs",
          "materials",
          "note",
        ],
        "production-reports": ["production_plan_id", "note", "lines"],
        "finished-reports": [
          "production_plan_id",
          "completed_date",
          "outputs",
          "materials",
          "note",
        ],
        "qc-inspections": ["inspected_at", "note", "lines"],
        "stock-requests": ["requested_date", "warehouse_id", "note", "lines"],
      }[n];
      C.fields(b, ["version", ...allow]);
      if (n === "qc-inspections") {
        this.qcUnused(r);
        for (const l of r.lines) {
          const lot = this.repo.get("lots", l.lot_id);
          lot.qc_status = "PENDING";
          delete lot.passed_quantity;
          delete lot.failed_quantity;
        }
      }
      if (n === "finished-reports") {
        for (const o of r.outputs) {
          const lot = this.repo.get("lots", o.lot_id);
          C.fail(
            lot.qc_status !== "PENDING" ||
              this.repo
                .all("stock-documents")
                .some((d) => d.lines.some((l) => l.lot_id === lot.id)),
            "RESOURCE_IN_USE",
            "Báo cáo đã có QC hoặc phiếu kho.",
            409,
          );
          this.repo.remove("lots", lot.id);
        }
      }
      const createFields = { ...r, ...b };
      const allowedCreate =
        n === "stock-requests"
          ? [
              "purpose",
              "warehouse_id",
              "workshop_id",
              "requested_date",
              "purchase_order_id",
              "business_plan_id",
              "production_plan_id",
              "note",
              "lines",
            ]
          : allow;
      const data = Object.fromEntries(
        allowedCreate
          .filter((k) => createFields[k] !== undefined)
          .map((k) => [k, createFields[k]]),
      );
      if (["business-plans", "stock-requests"].includes(n) && data.lines)
        data.lines = data.lines.map((l) => ({
          item_id: l.item_id,
          quantity: l.quantity,
          ...(n === "business-plans" ? { unit_price: l.unit_price } : {}),
          note: l.note || "",
        }));
      if (n === "production-plans") {
        data.outputs = data.outputs.map((l) => ({
          item_id: l.item_id,
          quantity: l.quantity,
        }));
        data.materials = data.materials.map((l) => ({
          item_id: l.item_id,
          required_quantity: l.required_quantity,
        }));
      }
      if (n === "finished-reports")
        data.outputs = data.outputs.map((o) =>
          Object.fromEntries(
            [
              "item_id",
              "quantity",
              "lot_code",
              "manufactured_date",
              "expiry_date",
            ]
              .filter((k) => o[k] !== undefined)
              .map((k) => [k, o[k]]),
          ),
        );
      if (n === "qc-inspections")
        data.lines = data.lines.map((l) =>
          Object.fromEntries(
            [
              "lot_id",
              "inspected_quantity",
              "passed_quantity",
              "failed_quantity",
              "issue",
            ]
              .filter((k) => l[k] !== undefined)
              .map((k) => [k, l[k]]),
          ),
        );
      this.repo.remove(n, r.id);
      const noticeLength = this.repo.all("notifications").length;
      const replacement = this.create(u, n, data);
      this.repo.remove(n, replacement.id);
      this.repo.data.notifications = this.repo
        .all("notifications")
        .slice(0, noticeLength);
      const identity = {
        id: r.id,
        code: r.code,
        version: r.version + 1,
        created_at: r.created_at,
        created_by: r.created_by,
      };
      Object.assign(r, replacement, identity);
      this.repo.all(n).push(r);
      if (n === "finished-reports")
        for (const o of r.outputs)
          this.repo.get("lots", o.lot_id).finished_report_id = r.id;
      return r;
    }
    if (n === "customer-orders" && b.lines)
      for (const l of b.lines) C.fields(l, ["item_id", "quantity", "note"]);
    if (P.masters.includes(n)) {
      for (const key of ["is_active", "is_sample", "is_published"])
        if (b[key] !== undefined)
          C.fail(
            typeof b[key] !== "boolean",
            "VALIDATION_ERROR",
            `${key} phải là boolean.`,
          );
      if (n === "items")
        C.fail(
          b.is_sample && r.kind !== "FINISHED_PRODUCT",
          "VALIDATION_ERROR",
          "Nguyên liệu không phải hàng mẫu.",
        );
      if (n === "lots") {
        if (b.manufactured_date) C.date(b.manufactured_date);
        if (b.expiry_date) C.date(b.expiry_date);
        C.fail(
          (b.expiry_date || r.expiry_date) &&
            (b.manufactured_date || r.manufactured_date) &&
            (b.expiry_date || r.expiry_date) <
              (b.manufactured_date || r.manufactured_date),
          "VALIDATION_ERROR",
          "Hạn dùng trước ngày sản xuất.",
        );
      }
    }
    const updated = basic.call(this, u, n, r, b);
    if (n === "tasks" && r.stocktake_id && b.assignee_ids) {
      const st = this.repo.get("stocktakes", r.stocktake_id),
        w = st.warehouses.find((w) => w.warehouse_id === r.warehouse_id);
      C.state(w, ["PLANNED", "COUNTING"]);
      for (const id of b.assignee_ids)
        C.fail(
          !this.repo.get("users", id).roles.includes("STOCKTAKER"),
          "VALIDATION_ERROR",
          "Cần phân công kiểm kê viên.",
        );
      w.assignee_ids = [...b.assignee_ids];
      w.version++;
      st.version++;
    }
    return updated;
  };
  const originalCreate = Service.prototype.create;
  Service.prototype.create = function (u, n, b) {
    if (n === "customer-orders" && Array.isArray(b.lines))
      for (const l of b.lines) C.fields(l, ["item_id", "quantity", "note"]);
    const row = originalCreate.call(this, u, n, b);
    if (n === "stocktakes") {
      const start = b.start_at || `${b.planned_date}T08:00:00+07:00`,
        end = b.end_at || `${b.planned_date}T17:00:00+07:00`;
      for (const w of row.warehouses) {
        const task = {
          title: `Kiểm kê ${row.code} · Kho ${w.warehouse_id}`,
          start_at: start,
          end_at: end,
          priority: "NORMAL",
          assignee_ids: w.assignee_ids,
          status: "PLANNED",
          stocktake_id: row.id,
          warehouse_id: w.warehouse_id,
        };
        this.checkTask(task);
        this.repo.add("tasks", task);
      }
    }
    return row;
  };
  const originalResult = Service.prototype.result;
  Service.prototype.result = function (u, n, r) {
    const result = originalResult.call(this, u, n, r);
    if (
      n === "stocktakes" &&
      u.roles.includes("STOCKTAKER") &&
      !u.roles.includes("DIRECTOR")
    )
      result.warehouses = result.warehouses.filter((w) =>
        w.assignee_ids.includes(u.id),
      );
    return result;
  };
};
