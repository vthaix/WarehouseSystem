const P = require("./policy");
module.exports = function install(Service) {
  const base = Service.prototype.lookup,
    baseResult = Service.prototype.result;
  Service.prototype.lookup = function (u, n, q = {}) {
    if (n === "stock-requests" && u.roles.includes("PLANNER")) {
      return this.repo
        .all(n)
        .filter((row) => row.purpose === "MATERIAL_PURCHASE")
        .map((row) => ({
          id: row.id,
          code: row.code,
          name: row.code,
          status: row.status,
          purpose: row.purpose,
          lines: row.lines,
        }));
    }
    if (n === "warehouse-managers") {
      P.role(u, ["WORKSHOP_OWNER", "DIRECTOR", "WAREHOUSE_MANAGER"]);
      return this.repo
        .all("users")
        .filter(
          (row) =>
            row.status !== "LOCKED" && row.roles.includes("WAREHOUSE_MANAGER"),
        )
        .map((row) => ({ id: row.id, name: row.full_name, roles: row.roles }));
    }
    if (n === "users") {
      P.role(u, ["DIRECTOR", "WAREHOUSE_MANAGER", "WORKSHOP_OWNER"]);
      let rows = this.repo
        .all("users")
        .filter((x) => !x.roles.includes("CUSTOMER"));
      if (!u.roles.includes("DIRECTOR"))
        rows = rows.filter((x) =>
          x.roles.includes(
            u.roles.includes("WORKSHOP_OWNER")
              ? "WAREHOUSE_MANAGER"
              : "WAREHOUSE_STAFF",
          ),
        );
      return rows.map((x) => ({ id: x.id, name: x.full_name, roles: x.roles }));
    }
    if (
      n === "lots" &&
      (u.roles.includes("DIRECTOR") || u.roles.includes("QC_INSPECTOR"))
    ) {
      let rows = this.repo.all("lots");
      if (!u.roles.includes("DIRECTOR"))
        rows = rows.filter((l) =>
          this.repo
            .all("stocktakes")
            .some(
              (s) =>
                s.campaign_type === "QUALITY_CHECK" &&
                s.assignee_ids.includes(u.id) &&
                s.lot_ids.includes(l.id),
            ),
        );
      return rows.map((l) => ({
        id: l.id,
        name: l.code,
        code: l.code,
        item_id: l.item_id,
        kind: this.repo.get("items", l.item_id).kind,
        qc_status: l.qc_status,
        purchase_order_id: l.purchase_order_id,
        finished_report_id: l.finished_report_id,
        received_quantity: l.received_quantity,
      }));
    }
    if (
      [
        "production-reports",
        "stock-requests",
        "finished-reports",
        "qc-inspections",
      ].includes(n)
    ) {
      P.role(u, P.read[n]);
      return this.repo
        .all(n)
        .filter((r) => this.visible(u, r, n))
        .map((r) => ({
          id: r.id,
          code: r.code,
          name: r.code,
          status: r.status,
          purpose: r.purpose,
          workshop_id: r.workshop_id,
          manager_id: r.manager_id,
          lines: r.lines,
          outputs: r.outputs,
          production_plan_id: r.production_plan_id,
        }));
    }
    return base.call(this, u, n, q);
  };
  Service.prototype.result = function (u, n, r) {
    const row = baseResult.call(this, u, n, r);
    if (
      n === "customer-orders" &&
      u.roles.some((x) => ["PLANNER", "DIRECTOR"].includes(x))
    )
      row.production_plans = this.repo
        .all("production-plans")
        .filter((p) => p.customer_order_id === r.id && p.status !== "CANCELLED")
        .map((p) => ({
          id: p.id,
          code: p.code,
          status: p.status,
          workshop_id: p.workshop_id,
          start_date: p.start_date,
          end_date: p.end_date,
          outputs: p.outputs,
        }));
    return row;
  };
};
