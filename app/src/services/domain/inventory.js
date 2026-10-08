const crypto = require("node:crypto");
const C = require("./core");
const P = require("./policy");
module.exports = {
  frozen(id) {
    return this.repo
      .all("stocktakes")
      .some(
        (s) =>
          s.status !== "CLOSED" &&
          s.warehouses.some(
            (w) =>
              w.warehouse_id === id &&
              ["COUNTING", "COMPLETED"].includes(w.status),
          ),
      );
  },
  post(u, b) {
    C.fields(b, ["stock_request_id", "request_version", "allocations", "note"]);
    const r = this.get(u, "stock-requests", b.stock_request_id);
    C.version(r, b.request_version);
    C.state(r, ["PENDING", "PARTIALLY_FULFILLED"]);
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
    const seen = new Set(),
      lines = [];
    for (const a of b.allocations) {
      C.fields(a, [
        "stock_request_line_id",
        "lot_id",
        "location_id",
        "quality_bucket",
        "quantity",
        "difference_reason",
      ]);
      const amount = C.qty(a.quantity);
      C.fail(
        !["AVAILABLE", "QUARANTINE"].includes(a.quality_bucket),
        "VALIDATION_ERROR",
        "Nhóm chất lượng không hợp lệ.",
      );
      const k = [
        a.stock_request_line_id,
        a.lot_id,
        a.location_id,
        a.quality_bucket,
      ].join(":");
      C.fail(seen.has(k), "VALIDATION_ERROR", "Phân bổ bị trùng.");
      seen.add(k);
      const l = r.lines.find((l) => l.id === a.stock_request_line_id);
      C.fail(!l, "VALIDATION_ERROR", "Dòng không thuộc yêu cầu.");
      const lot = this.repo.get("lots", a.lot_id),
        loc = this.repo.get("warehouse-locations", a.location_id);
      C.fail(
        lot.item_id !== l.item_id ||
          loc.warehouse_id !== r.warehouse_id ||
          !loc.is_active,
        "VALIDATION_ERROR",
        "Lô/vị trí không phù hợp.",
      );
      C.fail(
        amount + C.qty(l.fulfilled_quantity, false) > C.qty(l.quantity),
        "SOURCE_LIMIT_EXCEEDED",
        "Vượt lượng còn lại.",
      );
      let bal = this.repo
        .all("inventory")
        .find(
          (i) =>
            i.warehouse_id === r.warehouse_id &&
            i.lot_id === lot.id &&
            i.location_id === loc.id &&
            i.quality_bucket === a.quality_bucket,
        );
      if (r.type === "IN") {
        C.fail(
          lot.qc_status === "PENDING",
          "INVALID_STATE",
          "Lô chưa có QC.",
          409,
        );
        C.fail(
          r.purpose === "PURCHASE_RECEIPT"
            ? lot.purchase_order_id !== r.purchase_order_id
            : lot.production_plan_id !== r.production_plan_id,
          "VALIDATION_ERROR",
          "Lô không thuộc nguồn nhận hàng.",
        );
        if (lot.finished_report_id)
          C.state(this.repo.get("finished-reports", lot.finished_report_id), [
            "SUBMITTED",
          ]);
        const prior = this.repo
          .all("stock-documents")
          .filter((d) => d.type === "IN")
          .flatMap((d) => d.lines)
          .concat(lines)
          .filter(
            (x) => x.lot_id === lot.id && x.quality_bucket === a.quality_bucket,
          )
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        C.fail(
          prior + amount >
            C.qty(
              a.quality_bucket === "AVAILABLE"
                ? lot.passed_quantity || "0.000"
                : lot.failed_quantity || "0.000",
              false,
            ),
          "QC_LIMIT_EXCEEDED",
          "Vượt số lượng QC cho phép.",
        );
        if (!bal)
          bal = this.repo.add("inventory", {
            warehouse_id: r.warehouse_id,
            item_id: l.item_id,
            lot_id: lot.id,
            location_id: loc.id,
            quality_bucket: a.quality_bucket,
            quantity: "0.000",
          });
        bal.quantity = C.decimal(C.qty(bal.quantity, false) + amount);
      } else {
        C.fail(
          a.quality_bucket !== "AVAILABLE" ||
            !["PASSED", "PARTIAL"].includes(lot.qc_status) ||
            (lot.expiry_date && lot.expiry_date < C.today()),
          "INVALID_STATE",
          "Chỉ xuất tồn khả dụng đạt QC và còn hạn.",
          409,
        );
        C.fail(
          !bal || C.qty(bal.quantity, false) < amount,
          "INSUFFICIENT_STOCK",
          "Tồn không đủ. Vui lòng tải lại.",
          409,
        );
        bal.quantity = C.decimal(C.qty(bal.quantity, false) - amount);
      }
      l.fulfilled_quantity = C.decimal(
        C.qty(l.fulfilled_quantity, false) + amount,
      );
      lines.push({
        ...a,
        item_id: l.item_id,
        item_name: l.item_name,
        quantity: C.decimal(amount),
      });
      this.repo.add("movements", {
        warehouse_id: r.warehouse_id,
        item_id: l.item_id,
        lot_id: lot.id,
        location_id: loc.id,
        quality_bucket: a.quality_bucket,
        delta: C.decimal(r.type === "IN" ? amount : -amount),
        posted_at: new Date().toISOString(),
      });
    }
    r.status = r.lines.every((l) => l.fulfilled_quantity === l.quantity)
      ? "FULFILLED"
      : "PARTIALLY_FULFILLED";
    r.version++;
    const doc = this.repo.add("stock-documents", {
      type: r.type,
      status: "POSTED",
      stock_request_id: r.id,
      warehouse_id: r.warehouse_id,
      workshop_id: r.workshop_id,
      source_code: r.source_code,
      lines,
      posted_by: u.id,
      posted_at: new Date().toISOString(),
    });
    if (r.purchase_order_id) {
      const p = this.repo.get("purchase-orders", r.purchase_order_id);
      for (const l of p.lines)
        l.fulfilled_quantity = C.decimal(
          this.repo
            .all("stock-requests")
            .filter((x) => x.purchase_order_id === p.id)
            .flatMap((x) => x.lines)
            .filter((x) => x.item_id === l.item_id)
            .reduce((sum, x) => sum + C.qty(x.fulfilled_quantity, false), 0n),
        );
      p.status = p.lines.every((l) => l.fulfilled_quantity === l.quantity)
        ? "RECEIVED"
        : "PARTIALLY_RECEIVED";
      p.version++;
      if (p.status === "RECEIVED") {
        const plan = this.repo.get("business-plans", p.business_plan_id);
        plan.status = "COMPLETED";
        plan.version++;
      }
    }
    if (r.purpose === "SALE_ISSUE") {
      const plan = this.repo.get("business-plans", r.business_plan_id);
      const deliveredPlan = this.repo
        .all("stock-requests")
        .filter((x) => x.business_plan_id === plan.id)
        .flatMap((x) => x.lines);
      plan.status = plan.lines.every(
        (l) =>
          deliveredPlan
            .filter((x) => x.item_id === l.item_id)
            .reduce((sum, x) => sum + C.qty(x.fulfilled_quantity, false), 0n) >=
          C.qty(l.quantity),
      )
        ? "COMPLETED"
        : "IN_PROGRESS";
      plan.version++;
      const o = this.repo.get("customer-orders", plan.customer_order_id);
      const delivered = this.repo
        .all("stock-documents")
        .filter(
          (d) =>
            d.type === "OUT" &&
            this.repo.get("stock-requests", d.stock_request_id).purpose ===
              "SALE_ISSUE" &&
            this.repo.get(
              "business-plans",
              this.repo.get("stock-requests", d.stock_request_id)
                .business_plan_id,
            ).customer_order_id === o.id,
        )
        .flatMap((d) => d.lines);
      o.status = o.lines.every(
        (l) =>
          delivered
            .filter((x) => x.item_id === l.item_id)
            .reduce((sum, x) => sum + C.qty(x.quantity), 0n) >=
          C.qty(l.quantity),
      )
        ? "COMPLETED"
        : "IN_PROGRESS";
      o.version++;
    }
    if (r.production_plan_id && r.type === "OUT") {
      const p = this.repo.get("production-plans", r.production_plan_id);
      p.status = "IN_PROGRESS";
      p.version++;
    }
    return doc;
  },
  allocations(u, id) {
    P.role(u, ["WAREHOUSE_STAFF"]);
    const r = this.get(u, "stock-requests", id);
    return {
      request: this.result(u, "stock-requests", r),
      frozen: this.frozen(r.warehouse_id),
      lines: r.lines.map((l) => ({
        ...l,
        remaining_quantity: C.decimal(
          C.qty(l.quantity) - C.qty(l.fulfilled_quantity, false),
        ),
        lots: this.repo
          .all("lots")
          .filter(
            (t) =>
              t.item_id === l.item_id &&
              t.qc_status !== "PENDING" &&
              (r.type === "OUT" ||
                (r.purpose === "PURCHASE_RECEIPT"
                  ? t.purchase_order_id === r.purchase_order_id
                  : t.production_plan_id === r.production_plan_id)),
          ),
        locations: this.repo
          .all("warehouse-locations")
          .filter((t) => t.warehouse_id === r.warehouse_id && t.is_active),
        balances: this.repo
          .all("inventory")
          .filter(
            (t) => t.warehouse_id === r.warehouse_id && t.item_id === l.item_id,
          ),
      })),
    };
  },
  countScope(u, st, id) {
    const w = st.warehouses.find((w) => w.warehouse_id === id);
    C.fail(!w, "NOT_FOUND", "Không tìm thấy kho.", 404);
    if (u.roles.includes("STOCKTAKER") && !u.roles.includes("DIRECTOR"))
      C.fail(
        !w.assignee_ids.includes(u.id),
        "NOT_FOUND",
        "Kho chưa được giao cho bạn.",
        404,
      );
    return w;
  },
  counts(u, id, warehouse, b, complete = false, key) {
    P.role(u, ["STOCKTAKER"]);
    return this.replay(
      u,
      `stocktakes:${id}:${warehouse}:${complete ? "complete" : "counts"}`,
      b,
      key,
      complete,
      () => {
        const st = this.get(u, "stocktakes", id),
          w = this.countScope(u, st, warehouse);
        C.state(w, ["COUNTING"]);
        if (complete) {
          C.fields(b, ["version"]);
          C.version(w, b.version);
          C.fail(
            w.lines.some((l) => l.actual_quantity === null),
            "INVALID_STATE",
            "Còn dòng chưa đếm.",
            409,
          );
          w.status = "COMPLETED";
          w.version++;
          if (st.warehouses.every((x) => x.status === "COMPLETED"))
            st.status = "COMPLETED";
          st.version++;
        } else {
          C.fields(b, ["lines"]);
          C.fail(
            !Array.isArray(b.lines) || !b.lines.length || b.lines.length > 200,
            "VALIDATION_ERROR",
            "Số dòng không hợp lệ.",
          );
          const seen = new Set();
          for (const x of b.lines) {
            C.fields(x, ["id", "version", "actual_quantity", "cause"]);
            C.fail(seen.has(x.id), "VALIDATION_ERROR", "Dòng bị trùng.");
            seen.add(x.id);
            const l = w.lines.find((l) => l.id === x.id);
            C.fail(!l, "NOT_FOUND", "Dòng không thuộc kho.", 404);
            C.version(l, x.version);
            l.actual_quantity = C.decimal(C.qty(x.actual_quantity, false));
            C.text(x.cause, "cause", 5000, false);
            l.cause = x.cause || "";
            l.version++;
          }
        }
        this.audit(u, complete ? "complete" : "counts", "stocktakes", st);
        return structuredClone(w);
      },
    );
  },
  applyException(u, r) {
    const st = this.repo.get("stocktakes", r.stocktake_id),
      w = st.warehouses.find((w) => w.warehouse_id === r.warehouse_id);
    C.state(w, ["COMPLETED"]);
    const l = w.lines.find((l) => l.id === r.stocktake_line_id);
    C.fail(l.resolved, "ALREADY_PROCESSED", "Chênh lệch đã được xử lý.", 409);
    const bal = this.repo
      .all("inventory")
      .find(
        (i) =>
          i.lot_id === l.lot_id &&
          i.location_id === l.location_id &&
          i.quality_bucket === l.quality_bucket,
      );
    C.fail(
      !bal || bal.quantity !== l.system_quantity,
      "STALE_VERSION",
      "Tồn đã thay đổi.",
      409,
    );
    const delta =
      C.qty(l.actual_quantity, false) - C.qty(l.system_quantity, false);
    bal.quantity = l.actual_quantity;
    this.repo.add("movements", {
      warehouse_id: w.warehouse_id,
      item_id: l.item_id,
      lot_id: l.lot_id,
      location_id: l.location_id,
      quality_bucket: l.quality_bucket,
      delta: C.decimal(delta),
      posted_at: new Date().toISOString(),
    });
    l.resolved = true;
    r.status = "APPLIED";
  },
  report(u, n, q = {}, exporting = false) {
    P.role(
      u,
      n === "stock-documents" ? ["DIRECTOR", "WORKSHOP_OWNER"] : ["DIRECTOR"],
    );
    let rows;
    const effective = q.as_of || new Date().toISOString();
    if (n === "inventory") {
      C.fail(
        !Number.isFinite(Date.parse(effective)) ||
          Date.parse(effective) > Date.now(),
        "VALIDATION_ERROR",
        "Mốc báo cáo không hợp lệ.",
      );
      C.fail(
        Date.parse(effective) < Date.parse(this.repo.started_at),
        "VALIDATION_ERROR",
        "Chưa có dữ liệu trước lúc khởi tạo môi trường mẫu.",
      );
      const grouped = new Map();
      for (const m of this.repo
        .all("movements")
        .filter((m) => Date.parse(m.posted_at) <= Date.parse(effective))) {
        const k = [
          m.warehouse_id,
          m.lot_id,
          m.location_id,
          m.quality_bucket,
        ].join(":");
        const r = grouped.get(k) || {
          warehouse_id: m.warehouse_id,
          item_id: m.item_id,
          lot_id: m.lot_id,
          location_id: m.location_id,
          quality_bucket: m.quality_bucket,
          quantity: "0.000",
        };
        const prev = r.quantity.startsWith("-")
          ? -C.qty(r.quantity.slice(1), false)
          : C.qty(r.quantity, false);
        const delta = m.delta.startsWith("-")
          ? -C.qty(m.delta.slice(1), false)
          : C.qty(m.delta, false);
        r.quantity = C.decimal(prev + delta);
        grouped.set(k, r);
      }
      rows = [...grouped.values()];
    } else if (n === "stock-documents")
      rows = this.repo.all(n).filter((r) => this.visible(u, r, n));
    else
      rows = this.repo.all("stocktakes").flatMap((st) =>
        st.warehouses.flatMap((w) =>
          w.lines.map((l) => ({
            ...l,
            stocktake_id: st.id,
            warehouse_id: w.warehouse_id,
            status: w.status,
            difference:
              l.actual_quantity === null
                ? null
                : C.decimal(
                    C.qty(l.actual_quantity, false) -
                      C.qty(l.system_quantity, false),
                  ),
          })),
        ),
      );
    if (q.from) C.date(q.from);
    if (q.to) C.date(q.to);
    C.fail(
      q.from && q.to && q.from > q.to,
      "VALIDATION_ERROR",
      "Khoảng ngày không hợp lệ.",
    );
    rows = rows.filter((r) =>
      [
        "warehouse_id",
        "item_id",
        "lot_id",
        "quality_bucket",
        "type",
        "stocktake_id",
      ].every((k) => !q[k] || r[k] === q[k]),
    );
    if (q.kind)
      rows = rows.filter(
        (r) => r.item_id && this.repo.get("items", r.item_id).kind === q.kind,
      );
    if (n === "stock-documents")
      rows = rows.filter(
        (r) =>
          (!q.from ||
            Date.parse(r.posted_at) >=
              Date.parse(`${q.from}T00:00:00+07:00`)) &&
          (!q.to ||
            Date.parse(r.posted_at) <
              Date.parse(`${q.to}T00:00:00+07:00`) + 86400000),
      );
    const total = rows.length,
      page = Number(q.page || 1),
      per = Number(q.per_page || 20);
    C.fail(
      !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(per) ||
        per < 1 ||
        per > 100,
      "VALIDATION_ERROR",
      "Phân trang không hợp lệ.",
    );
    if (!exporting) rows = rows.slice((page - 1) * per, page * per);
    return {
      data: rows.map((r) => ({
        ...r,
        item_name: r.item_id
          ? this.repo.get("items", r.item_id).name
          : undefined,
      })),
      meta: {
        generated_at: new Date().toISOString(),
        as_of: effective,
        total,
        page,
        per_page: per,
        total_pages: Math.ceil(total / per),
      },
    };
  },
};
