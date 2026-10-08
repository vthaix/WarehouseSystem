const C = require("./core");
const P = require("./policy");
module.exports = {
  dispatch(u, id, b) {
    C.fields(b, ["version", "start_at", "end_at", "allocations"]);
    const r = this.get(u, "stock-requests", id);
    C.version(r, b.version);
    C.state(r, ["PENDING", "PARTIALLY_FULFILLED"]);
    C.fail(
      r.manager_id !== u.id || r.purpose === "MATERIAL_PURCHASE",
      "NOT_FOUND",
      "Yêu cầu không thuộc quản lý kho.",
      404,
    );
    C.fail(
      this.frozen(r.warehouse_id),
      "WAREHOUSE_FROZEN",
      "Kho đang kiểm kê.",
      409,
    );
    C.fail(
      !Array.isArray(b.allocations) ||
        !b.allocations.length ||
        b.allocations.length > 200,
      "VALIDATION_ERROR",
      "Cần 1–200 phân bổ.",
    );
    const open = this.repo
      .all("tasks")
      .filter(
        (t) =>
          t.stock_request_id && ["PLANNED", "IN_PROGRESS"].includes(t.status),
      )
      .flatMap((t) =>
        t.allocations.map((a) => ({
          ...a,
          request_id: t.stock_request_id,
          remaining: C.qty(a.quantity) - C.qty(a.fulfilled_quantity, false),
        })),
      );
    const lineTotals = new Map(),
      stockTotals = new Map(),
      seen = new Set(),
      byEmployee = new Map();
    for (const a of b.allocations) {
      C.fields(a, [
        "assignee_id",
        "stock_request_line_id",
        "lot_id",
        "location_id",
        "quantity",
        "quality_bucket",
      ]);
      const employee = this.repo.get("users", a.assignee_id);
      C.fail(
        !employee.roles.includes("WAREHOUSE_STAFF"),
        "VALIDATION_ERROR",
        "Phải chọn nhân viên kho.",
      );
      const line = r.lines.find((l) => l.id === a.stock_request_line_id);
      C.fail(!line, "VALIDATION_ERROR", "Dòng không thuộc yêu cầu.");
      const lot = this.repo.get("lots", a.lot_id),
        loc = this.repo.get("warehouse-locations", a.location_id),
        amount = C.qty(a.quantity);
      C.fail(
        lot.item_id !== line.item_id ||
          loc.warehouse_id !== r.warehouse_id ||
          !loc.is_active ||
          a.quality_bucket !== "AVAILABLE",
        "VALIDATION_ERROR",
        "Lô, vị trí hoặc chất lượng không phù hợp.",
      );
      C.fail(
        !["PASSED", "PARTIAL"].includes(lot.qc_status) ||
          (lot.expiry_date && lot.expiry_date < C.today()),
        "INVALID_STATE",
        "Lô cần đạt QC và còn hạn.",
        409,
      );
      const allocationKey = [
        a.assignee_id,
        a.stock_request_line_id,
        a.lot_id,
        a.location_id,
      ].join(":");
      C.fail(
        seen.has(allocationKey),
        "VALIDATION_ERROR",
        "Phân công bị trùng.",
      );
      seen.add(allocationKey);
      const reservedLine = open
        .filter(
          (x) => x.request_id === r.id && x.stock_request_line_id === line.id,
        )
        .reduce((sum, x) => sum + x.remaining, 0n);
      lineTotals.set(line.id, (lineTotals.get(line.id) || 0n) + amount);
      C.fail(
        reservedLine + lineTotals.get(line.id) >
          C.qty(line.quantity) - C.qty(line.fulfilled_quantity, false),
        "SOURCE_LIMIT_EXCEEDED",
        "Tổng phân công vượt lượng chưa xử lý.",
      );
      const stockKey = [lot.id, loc.id, a.quality_bucket].join(":");
      stockTotals.set(stockKey, (stockTotals.get(stockKey) || 0n) + amount);
      if (r.type === "OUT") {
        const balance = this.repo
          .all("inventory")
          .find(
            (x) =>
              x.warehouse_id === r.warehouse_id &&
              x.lot_id === lot.id &&
              x.location_id === loc.id &&
              x.quality_bucket === "AVAILABLE",
          );
        const reservedStock = open
          .filter(
            (x) =>
              x.lot_id === lot.id &&
              x.location_id === loc.id &&
              this.repo.get("stock-requests", x.request_id).type === "OUT",
          )
          .reduce((sum, x) => sum + x.remaining, 0n);
        C.fail(
          !balance ||
            reservedStock + stockTotals.get(stockKey) >
              C.qty(balance.quantity, false),
          "INSUFFICIENT_STOCK",
          "Không đủ tồn khả dụng chưa phân công.",
          409,
        );
      } else {
        C.fail(
          r.purpose === "PURCHASE_RECEIPT"
            ? lot.purchase_order_id !== r.purchase_order_id
            : lot.production_plan_id !== r.production_plan_id,
          "VALIDATION_ERROR",
          "Lô ngoài chứng từ nguồn.",
        );
        const posted = this.repo
          .all("stock-documents")
          .filter((d) => d.type === "IN")
          .flatMap((d) => d.lines)
          .filter(
            (x) => x.lot_id === lot.id && x.quality_bucket === "AVAILABLE",
          )
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        const reserved = open
          .filter(
            (x) =>
              x.lot_id === lot.id &&
              this.repo.get("stock-requests", x.request_id).type === "IN",
          )
          .reduce((sum, x) => sum + x.remaining, 0n);
        const newLot = b.allocations
          .filter((x) => x.lot_id === lot.id)
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        C.fail(
          posted + reserved + newLot > C.qty(lot.passed_quantity, false),
          "QC_LIMIT_EXCEEDED",
          "Phân công nhập vượt lượng QC đạt.",
        );
      }
      const list = byEmployee.get(employee.id) || [];
      list.push({
        ...a,
        quantity: C.decimal(amount),
        fulfilled_quantity: "0.000",
      });
      byEmployee.set(employee.id, list);
    }
    const tasks = [];
    for (const [employee, allocations] of byEmployee) {
      const data = {
        title: `${r.type === "IN" ? "Nhập" : "Xuất"} kho ${r.code}`,
        task_type: `WAREHOUSE_${r.type}`,
        stock_request_id: r.id,
        manager_id: u.id,
        start_at: b.start_at,
        end_at: b.end_at,
        priority: "NORMAL",
        assignee_ids: [employee],
        allocations,
        status: "PLANNED",
        warehouse_id: r.warehouse_id,
        workshop_id: r.workshop_id,
      };
      this.checkTask(data);
      const task = this.repo.add("tasks", data);
      tasks.push(task);
      this.notifyUsers(
        [employee],
        `Được giao ${task.title}: ${allocations.map((a) => `${a.quantity} · lô ${a.lot_id} · vị trí ${a.location_id}`).join("; ")}`,
        { resource: "tasks", id: task.id },
      );
    }
    r.version++;
    this.audit(u, "dispatch", "stock-requests", r);
    return {
      request: this.result(u, "stock-requests", r),
      tasks: tasks.map((t) => this.result(u, "tasks", t)),
    };
  },
  reconcilePurchase(id) {
    const p = this.repo.get("purchase-orders", id);
    for (const l of p.lines) {
      l.returned_supplier_quantity = C.decimal(
        this.repo
          .all("lots")
          .filter((t) => t.purchase_order_id === id && t.item_id === l.item_id)
          .reduce(
            (sum, t) =>
              sum + C.qty(t.returned_supplier_quantity || "0.000", false),
            0n,
          ),
      );
    }
    const done = p.lines.every(
      (l) =>
        C.qty(l.fulfilled_quantity || "0.000", false) +
          C.qty(l.returned_supplier_quantity, false) >=
        C.qty(l.quantity),
    );
    if (done) {
      p.status = p.lines.some(
        (l) => C.qty(l.returned_supplier_quantity, false) > 0n,
      )
        ? "CLOSED_WITH_RETURNS"
        : "RECEIVED";
      p.version++;
      const plan = this.repo.get("business-plans", p.business_plan_id);
      plan.status = "COMPLETED";
      plan.version++;
    }
  },
};
