const crypto = require("node:crypto");
const C = require("./core");
const P = require("./policy");
module.exports = {
  create(u, n, b) {
    if (P.masters.includes(n)) return this.master(u, n, b);
    let v = { ...b, status: "DRAFT", created_by: u.id };
    if (n === "customer-orders") {
      C.fields(b, [
        "delivery_address",
        "latest_delivery_date",
        "note",
        "lines",
      ]);
      C.text(b.delivery_address, "delivery_address", 500);
      C.date(b.latest_delivery_date, "latest_delivery_date", true);
      v.lines = this.lines(b, null, "FINISHED_PRODUCT", true);
      for (const l of v.lines) {
        const i = this.repo.get("items", l.item_id);
        C.fail(
          !i.is_sample || !i.is_published,
          "VALIDATION_ERROR",
          "Chỉ đặt thành phẩm mẫu đã công bố.",
        );
      }
      Object.assign(v, {
        customer_id: u.id,
        customer_name: u.full_name,
        status: "SUBMITTED",
        quoted_total: this.total(v.lines),
      });
    } else if (n === "business-plans") {
      C.fields(b, [
        "type",
        "supplier_id",
        "customer_id",
        "customer_order_id",
        "planned_date",
        "note",
        "lines",
        "source_request_id",
      ]);
      C.fail(
        !["PURCHASE", "SALE"].includes(b.type),
        "VALIDATION_ERROR",
        "Loại kế hoạch không hợp lệ.",
      );
      C.date(b.planned_date);
      let src;
      if (b.type === "PURCHASE") this.repo.get("suppliers", b.supplier_id);
      else {
        const o = this.repo.get("customer-orders", b.customer_order_id);
        C.state(o, ["APPROVED", "IN_PROGRESS"]);
        C.fail(
          b.customer_id !== o.customer_id,
          "VALIDATION_ERROR",
          "Khách hàng không khớp đơn.",
        );
        src = o.lines;
      }
      v.lines = this.lines(
        b,
        src,
        b.type === "PURCHASE" ? "MATERIAL" : "FINISHED_PRODUCT",
        true,
      );
      Object.assign(v, {
        status: "PENDING_APPROVAL",
        total_amount: this.total(v.lines),
      });
    } else if (n === "purchase-orders") {
      C.fields(b, [
        "business_plan_id",
        "expected_delivery_date",
        "delivery_terms",
        "workshop_ids",
      ]);
      const p = this.repo.get("business-plans", b.business_plan_id);
      C.state(p, ["APPROVED"]);
      C.fail(
        p.type !== "PURCHASE",
        "INVALID_STATE",
        "Nguồn phải là kế hoạch mua.",
        409,
      );
      C.fail(
        this.repo.all(n).some((x) => x.business_plan_id === p.id),
        "ALREADY_PROCESSED",
        "Kế hoạch đã có đơn mua.",
        409,
      );
      C.date(b.expected_delivery_date, "expected_delivery_date", true);
      C.text(b.delivery_terms, "delivery_terms");
      C.fail(
        b.workshop_ids &&
          (!Array.isArray(b.workshop_ids) ||
            b.workshop_ids.some((id) => !["1", "2"].includes(id))),
        "VALIDATION_ERROR",
        "Xưởng không hợp lệ.",
      );
      Object.assign(v, {
        supplier_id: p.supplier_id,
        lines: structuredClone(p.lines),
        total_amount: p.total_amount,
        status: "PENDING",
        workshop_ids: b.workshop_ids || ["1"],
      });
      p.status = "IN_PROGRESS";
      p.version++;
    } else if (n === "production-plans") {
      C.fields(b, [
        "customer_order_id",
        "workshop_id",
        "start_date",
        "end_date",
        "outputs",
        "materials",
        "note",
      ]);
      const o = this.repo.get("customer-orders", b.customer_order_id);
      C.state(o, ["RECEIVED", "APPROVED", "IN_PROGRESS"]);
      C.date(b.start_date);
      C.date(b.end_date);
      C.fail(
        b.end_date < b.start_date,
        "VALIDATION_ERROR",
        "Ngày kết thúc trước ngày bắt đầu.",
      );
      C.fail(
        !["1", "2"].includes(b.workshop_id),
        "VALIDATION_ERROR",
        "Xưởng không hợp lệ.",
      );
      v.outputs = this.lines({ lines: b.outputs }, o.lines, "FINISHED_PRODUCT");
      v.materials = (b.materials || []).length
        ? this.lines(
            {
              lines: (b.materials || []).map((m) => ({
                item_id: m.item_id,
                quantity: m.required_quantity,
              })),
            },
            null,
            "MATERIAL",
          ).map((l) => ({ ...l, required_quantity: l.quantity }))
        : [];
    } else if (n === "stock-requests") {
      C.fields(b, [
        "purpose",
        "warehouse_id",
        "workshop_id",
        "requested_date",
        "purchase_order_id",
        "business_plan_id",
        "production_plan_id",
        "note",
        "lines",
        "manager_id",
      ]);
      C.fail(
        !u.workshop_ids.includes(b.workshop_id),
        "NOT_FOUND",
        "Không tìm thấy xưởng.",
        404,
      );
      this.repo.get("warehouses", b.warehouse_id);
      C.date(b.requested_date);
      const map = {
          PURCHASE_RECEIPT: [
            "purchase-orders",
            "purchase_order_id",
            "IN",
            "MATERIAL",
          ],
          PRODUCTION_RECEIPT: [
            "production-plans",
            "production_plan_id",
            "IN",
            "FINISHED_PRODUCT",
          ],
          PRODUCTION_ISSUE: [
            "production-plans",
            "production_plan_id",
            "OUT",
            "MATERIAL",
          ],
          SALE_ISSUE: [
            "business-plans",
            "business_plan_id",
            "OUT",
            "FINISHED_PRODUCT",
          ],
        },
        s = map[b.purpose];
      C.fail(!s, "VALIDATION_ERROR", "Mục đích không hợp lệ.");
      C.fail(
        ["purchase_order_id", "business_plan_id", "production_plan_id"].filter(
          (k) => b[k],
        ).length !== 1,
        "VALIDATION_ERROR",
        "Cần đúng một nguồn.",
      );
      const src = this.get(u, s[0], b[s[1]]);
      C.state(src, [
        "APPROVED",
        "IN_PROGRESS",
        "PENDING",
        "PARTIALLY_RECEIVED",
      ]);
      if (b.purpose === "SALE_ISSUE")
        C.fail(
          src.type !== "SALE",
          "VALIDATION_ERROR",
          "Nguồn phải là kế hoạch bán.",
        );
      if (src.workshop_id)
        C.fail(
          src.workshop_id !== b.workshop_id,
          "NOT_FOUND",
          "Nguồn không thuộc xưởng.",
          404,
        );
      const lines =
        src.lines ||
        (b.purpose === "PRODUCTION_ISSUE" ? src.materials : src.outputs);
      v.lines = this.lines(b, lines, s[3]);
      for (const l of v.lines) {
        const limit = lines.find((x) => x.item_id === l.item_id);
        const requested = this.repo
          .all(n)
          .filter(
            (r) =>
              r.status !== "CANCELLED" &&
              r[s[1]] === src.id &&
              r.purpose === b.purpose,
          )
          .flatMap((r) => r.lines)
          .filter((x) => x.item_id === l.item_id)
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        C.fail(
          requested + C.qty(l.quantity) >
            C.qty(limit.required_quantity || limit.quantity),
          "SOURCE_LIMIT_EXCEEDED",
          "Tổng yêu cầu vượt lượng nguồn.",
        );
      }
      Object.assign(v, {
        status: "PENDING",
        type: s[2],
        source_code: src.code,
      });
    } else if (n === "stock-documents") return this.post(u, b);
    else if (n === "qc-inspections") {
      C.fields(b, ["inspected_at", "note", "lines"]);
      C.fail(
        !Number.isFinite(Date.parse(b.inspected_at)),
        "VALIDATION_ERROR",
        "Thời gian không hợp lệ.",
      );
      C.fail(
        !Array.isArray(b.lines) || !b.lines.length || b.lines.length > 100,
        "VALIDATION_ERROR",
        "Cần dòng kiểm tra.",
      );
      const seen = new Set();
      v.lines = b.lines.map((l) => {
        C.fields(l, [
          "lot_id",
          "inspected_quantity",
          "passed_quantity",
          "failed_quantity",
          "issue",
        ]);
        const lot = this.repo.get("lots", l.lot_id);
        C.fail(
          seen.has(lot.id) || lot.qc_status !== "PENDING",
          "RESOURCE_IN_USE",
          "Lô đã có QC hoặc bị trùng.",
          409,
        );
        seen.add(lot.id);
        if (lot.finished_report_id)
          C.state(this.repo.get("finished-reports", lot.finished_report_id), [
            "SUBMITTED",
          ]);
        const inspected = C.qty(l.inspected_quantity),
          passed = C.qty(l.passed_quantity, false),
          failed = C.qty(l.failed_quantity, false);
        C.fail(
          inspected !== passed + failed ||
            inspected !== C.qty(lot.received_quantity),
          "VALIDATION_ERROR",
          "Số kiểm phải bằng đạt + lỗi và lượng lô.",
        );
        if (failed > 0n) C.text(l.issue, "issue", 2000);
        lot.qc_status =
          failed === 0n ? "PASSED" : passed === 0n ? "FAILED" : "PARTIAL";
        lot.passed_quantity = C.decimal(passed);
        lot.failed_quantity = C.decimal(failed);
        return { ...l, id: crypto.randomUUID() };
      });
      v.status = "RECORDED";
    } else if (n === "stocktakes") {
      C.fields(b, [
        "planned_date",
        "warehouses",
        "start_at",
        "end_at",
        "item_kind",
        "note",
      ]);
      C.date(b.planned_date, "planned_date", true);
      C.fail(
        !Array.isArray(b.warehouses) || !b.warehouses.length,
        "VALIDATION_ERROR",
        "Chọn kho và kiểm kê viên.",
      );
      const seen = new Set();
      v.warehouses = b.warehouses.map((w) => {
        C.fields(w, ["warehouse_id", "assignee_ids"]);
        this.repo.get("warehouses", w.warehouse_id);
        C.fail(seen.has(w.warehouse_id), "VALIDATION_ERROR", "Kho bị trùng.");
        seen.add(w.warehouse_id);
        C.fail(
          !Array.isArray(w.assignee_ids) || !w.assignee_ids.length,
          "VALIDATION_ERROR",
          "Cần kiểm kê viên.",
        );
        for (const id of w.assignee_ids)
          C.fail(
            !this.repo.get("users", id).roles.includes("STOCKTAKER"),
            "VALIDATION_ERROR",
            "Người được giao không phải kiểm kê viên.",
          );
        return { ...w, status: "PLANNED", version: 1, lines: [] };
      });
      v.status = "PLANNED";
    } else if (n === "stocktake-minutes") {
      C.fields(b, ["stocktake_id", "warehouse_id", "remarks"]);
      const st = this.get(u, "stocktakes", b.stocktake_id),
        w = this.countScope(u, st, b.warehouse_id);
      C.state(w, ["COMPLETED"]);
      C.text(b.remarks, "remarks");
      C.fail(
        this.repo
          .all(n)
          .some(
            (m) =>
              m.stocktake_id === st.id && m.warehouse_id === w.warehouse_id,
          ),
        "ALREADY_PROCESSED",
        "Kho đã có biên bản.",
        409,
      );
      v.assignee_ids = w.assignee_ids;
    } else if (n === "exception-proposals") {
      C.fields(b, [
        "stocktake_id",
        "warehouse_id",
        "stocktake_line_id",
        "reason",
        "resolution_note",
      ]);
      const st = this.get(u, "stocktakes", b.stocktake_id),
        w = st.warehouses.find((w) => w.warehouse_id === b.warehouse_id);
      C.fail(!w, "NOT_FOUND", "Không tìm thấy kho.", 404);
      C.state(w, ["COMPLETED"]);
      const l = w.lines.find((l) => l.id === b.stocktake_line_id);
      C.fail(
        !l || l.actual_quantity === null,
        "VALIDATION_ERROR",
        "Dòng chưa đếm.",
      );
      C.fail(
        l.actual_quantity === l.system_quantity || l.resolved,
        "INVALID_STATE",
        "Không có chênh lệch cần xử lý.",
        409,
      );
      C.text(b.reason, "reason", 2000);
      C.text(b.resolution_note, "resolution_note");
      const delta =
        C.qty(l.actual_quantity, false) - C.qty(l.system_quantity, false);
      Object.assign(v, {
        type: "STOCKTAKE_DIFFERENCE",
        action: "ADJUST_TO_ACTUAL",
        status: "PENDING_APPROVAL",
        quantity: C.decimal(delta < 0n ? -delta : delta),
      });
    } else if (n === "tasks") {
      C.fields(b, [
        "title",
        "description",
        "start_at",
        "end_at",
        "priority",
        "assignee_ids",
      ]);
      this.checkTask(b);
      v.status = "PLANNED";
    } else if (n === "production-reports") {
      C.fields(b, ["production_plan_id", "note", "lines"]);
      const p = this.get(u, "production-plans", b.production_plan_id);
      C.state(p, ["APPROVED", "IN_PROGRESS"]);
      v.workshop_id = p.workshop_id;
      C.fail(
        !Array.isArray(b.lines) || !b.lines.length,
        "VALIDATION_ERROR",
        "Cần nguyên liệu.",
      );
      v.lines = b.lines.map((l) => {
        C.fields(l, ["item_id", "available_quantity", "required_quantity"]);
        C.fail(
          this.repo.get("items", l.item_id).kind !== "MATERIAL",
          "VALIDATION_ERROR",
          "Chỉ báo cáo nguyên liệu.",
        );
        C.qty(l.available_quantity, false);
        C.qty(l.required_quantity);
        return { ...l };
      });
    } else if (n === "finished-reports") {
      C.fields(b, [
        "production_plan_id",
        "completed_date",
        "outputs",
        "materials",
        "note",
      ]);
      const p = this.get(u, "production-plans", b.production_plan_id);
      C.state(p, ["APPROVED", "IN_PROGRESS"]);
      C.date(b.completed_date);
      C.fail(
        b.completed_date < p.start_date,
        "VALIDATION_ERROR",
        "Ngày hoàn thành trước bắt đầu.",
      );
      v.workshop_id = p.workshop_id;
      C.fail(
        !Array.isArray(b.outputs) || !b.outputs.length,
        "VALIDATION_ERROR",
        "Cần thành phẩm.",
      );
      const codes = new Set();
      v.outputs = b.outputs.map((o) => {
        C.fields(o, [
          "item_id",
          "quantity",
          "lot_code",
          "manufactured_date",
          "expiry_date",
        ]);
        const src = p.outputs.find((l) => l.item_id === o.item_id);
        C.fail(!src, "VALIDATION_ERROR", "Thành phẩm ngoài kế hoạch.");
        C.qty(o.quantity);
        C.text(o.lot_code, "lot_code", 50);
        C.date(o.manufactured_date);
        if (o.expiry_date) {
          C.date(o.expiry_date);
          C.fail(
            o.expiry_date < o.manufactured_date,
            "VALIDATION_ERROR",
            "Hạn dùng không hợp lệ.",
          );
        }
        C.fail(
          codes.has(o.lot_code) ||
            this.repo.all("lots").some((l) => l.code === o.lot_code),
          "VALIDATION_ERROR",
          "Mã lô bị trùng.",
        );
        codes.add(o.lot_code);
        const produced = this.repo
          .all(n)
          .filter((r) => r.production_plan_id === p.id)
          .flatMap((r) => r.outputs)
          .concat(
            b.outputs.filter(
              (x) => x !== o && b.outputs.indexOf(x) < b.outputs.indexOf(o),
            ),
          )
          .filter((l) => l.item_id === o.item_id)
          .reduce((sum, l) => sum + C.qty(l.quantity), 0n);
        C.fail(
          produced + C.qty(o.quantity) > C.qty(src.quantity),
          "SOURCE_LIMIT_EXCEEDED",
          "Sản lượng vượt kế hoạch.",
        );
        return { ...o };
      });
      v.materials = b.materials || [];
      for (const m of v.materials) {
        C.fields(m, ["item_id", "used_quantity"]);
        C.qty(m.used_quantity);
        C.fail(
          !p.materials.some((l) => l.item_id === m.item_id),
          "VALIDATION_ERROR",
          "Nguyên liệu ngoài kế hoạch.",
        );
      }
    } else C.fail(true, "NOT_FOUND", "Không có chức năng này.", 404);
    C.text(b.note, "note", 5000, false);
    const row = this.repo.add(n, v);
    if (n === "finished-reports")
      for (const o of row.outputs)
        o.lot_id = this.repo.add("lots", {
          code: o.lot_code,
          item_id: o.item_id,
          production_plan_id: b.production_plan_id,
          finished_report_id: row.id,
          received_quantity: o.quantity,
          manufactured_date: o.manufactured_date,
          expiry_date: o.expiry_date,
          qc_status: "PENDING",
          is_active: true,
        }).id;
    this.notify(
      n === "customer-orders" ? ["PLANNER"] : ["DIRECTOR"],
      `Mới: ${row.code}`,
      { resource: n, id: row.id },
    );
    return row;
  },
  master(u, n, b) {
    const allowed = {
      categories: ["code", "name", "description", "is_active"],
      warehouses: ["code", "name", "address", "is_active"],
      "warehouse-locations": ["code", "name", "warehouse_id", "is_active"],
      suppliers: [
        "code",
        "name",
        "phone",
        "email",
        "address",
        "tax_code",
        "is_active",
      ],
      items: [
        "code",
        "name",
        "category_id",
        "unit_id",
        "kind",
        "reference_price",
        "is_sample",
        "is_published",
        "is_active",
        "description",
      ],
      lots: [
        "code",
        "purchase_order_line_id",
        "purchase_order_id",
        "received_quantity",
        "manufactured_date",
        "expiry_date",
      ],
    };
    C.fields(b, allowed[n]);
    C.text(b.code, "code", 50);
    C.fail(
      this.repo
        .all(n)
        .some(
          (r) =>
            r.code === b.code &&
            (n !== "warehouse-locations" || r.warehouse_id === b.warehouse_id),
        ),
      "VALIDATION_ERROR",
      "Mã đã tồn tại.",
    );
    if (n !== "lots") C.text(b.name, "name", 150);
    let v = { ...b, is_active: b.is_active ?? true };
    for (const k of ["is_active", "is_sample", "is_published"])
      if (b[k] !== undefined)
        C.fail(
          typeof b[k] !== "boolean",
          "VALIDATION_ERROR",
          `${k} phải là boolean.`,
        );
    if (n === "warehouse-locations")
      this.repo.get("warehouses", b.warehouse_id);
    if (n === "items") {
      this.repo.get("categories", b.category_id);
      const unit = this.repo.get("units", b.unit_id);
      C.fail(
        !["MATERIAL", "FINISHED_PRODUCT"].includes(b.kind),
        "VALIDATION_ERROR",
        "Loại hàng không hợp lệ.",
      );
      C.fail(
        b.is_sample && b.kind !== "FINISHED_PRODUCT",
        "VALIDATION_ERROR",
        "Nguyên liệu không phải hàng mẫu.",
      );
      C.price(b.reference_price);
      v.unit = unit.name;
    }
    if (n === "lots") {
      const po = this.repo.get("purchase-orders", b.purchase_order_id),
        l = po.lines.find((l) => l.id === b.purchase_order_line_id);
      C.fail(!l, "VALIDATION_ERROR", "Dòng mua không hợp lệ.");
      const received = this.repo
        .all("lots")
        .filter((x) => x.purchase_order_line_id === l.id)
        .reduce((sum, x) => sum + C.qty(x.received_quantity), 0n);
      C.fail(
        received + C.qty(b.received_quantity) > C.qty(l.quantity),
        "SOURCE_LIMIT_EXCEEDED",
        "Lượng lô vượt đơn mua.",
      );
      if (b.manufactured_date) C.date(b.manufactured_date);
      if (b.expiry_date) {
        C.date(b.expiry_date);
        C.fail(
          b.manufactured_date && b.expiry_date < b.manufactured_date,
          "VALIDATION_ERROR",
          "Hạn dùng trước ngày sản xuất.",
        );
      }
      Object.assign(v, { item_id: l.item_id, qc_status: "PENDING" });
    }
    return this.repo.add(n, v);
  },
  update(u, n, r, b) {
    C.version(r, b.version);
    if (P.masters.includes(n)) {
      const allow = {
        categories: ["name", "description", "is_active"],
        warehouses: ["name", "address", "is_active"],
        "warehouse-locations": ["name", "is_active"],
        suppliers: [
          "name",
          "phone",
          "email",
          "address",
          "tax_code",
          "is_active",
        ],
        items: [
          "name",
          "description",
          "is_active",
          "is_sample",
          "is_published",
          "reference_price",
        ],
        lots: ["manufactured_date", "expiry_date"],
      };
      C.fields(b, ["version", ...allow[n]]);
      if (b.name !== undefined) C.text(b.name, "name", 150);
      if (n === "lots")
        C.fail(
          r.qc_status !== "PENDING",
          "RESOURCE_IN_USE",
          "Lô đã QC không sửa metadata.",
          409,
        );
      if (b.reference_price !== undefined) C.price(b.reference_price);
    } else if (n === "customer-orders") {
      C.state(r, ["SUBMITTED", "RECEIVED"]);
      C.fields(b, [
        "version",
        "delivery_address",
        "latest_delivery_date",
        "note",
        "lines",
        "quantity_change_acknowledged",
      ]);
      if (b.delivery_address)
        C.text(b.delivery_address, "delivery_address", 500);
      if (b.latest_delivery_date)
        C.date(b.latest_delivery_date, "latest_delivery_date", true);
      if (b.lines) {
        C.fail(
          b.quantity_change_acknowledged !== true,
          "VALIDATION_ERROR",
          "Cần xác nhận thay đổi số lượng.",
        );
        const lines = this.lines(b, null, "FINISHED_PRODUCT", true);
        for (const l of lines) {
          const i = this.repo.get("items", l.item_id);
          C.fail(
            !i.is_sample || !i.is_published,
            "VALIDATION_ERROR",
            "Hàng mẫu không hợp lệ.",
          );
        }
        r.lines = lines;
        r.quoted_total = this.total(lines);
      }
    } else if (n === "stock-requests") {
      C.state(r, ["PENDING"]);
      C.fields(b, ["version", "requested_date", "note"]);
      if (b.requested_date) C.date(b.requested_date);
    } else if (n === "tasks") {
      C.state(r, ["PLANNED", "IN_PROGRESS"]);
      C.fields(b, [
        "version",
        "title",
        "description",
        "start_at",
        "end_at",
        "priority",
        "assignee_ids",
      ]);
      this.checkTask({ ...r, ...b }, r.id);
    } else if (n === "stocktake-minutes") {
      C.state(r, ["DRAFT"]);
      C.fields(b, ["version", "remarks"]);
      C.text(b.remarks, "remarks");
    } else if (n === "qc-inspections") {
      C.state(r, ["RECORDED"]);
      this.qcUnused(r);
      C.fields(b, ["version", "note", "inspected_at"]);
    } else if (
      [
        "business-plans",
        "production-plans",
        "production-reports",
        "finished-reports",
      ].includes(n)
    ) {
      C.state(
        r,
        n === "business-plans" ? ["PENDING_APPROVAL", "REJECTED"] : ["DRAFT"],
      );
      C.fields(b, ["version", "note"]);
      if (n === "business-plans") r.status = "PENDING_APPROVAL";
    } else C.fail(true, "INVALID_STATE", "Không được sửa.", 409);
    C.text(b.note, "note", 5000, false);
    for (const [k, v] of Object.entries(b))
      if (!["version", "lines", "quantity_change_acknowledged"].includes(k))
        r[k] = v;
    r.version++;
    return r;
  },
  qcUnused(r) {
    const ids = r.lines.map((l) => l.lot_id);
    C.fail(
      this.repo
        .all("stock-documents")
        .some((d) => d.lines.some((l) => ids.includes(l.lot_id))),
      "RESOURCE_IN_USE",
      "QC đã được dùng trong phiếu kho.",
      409,
    );
  },
  cancel(u, n, r, b) {
    C.fields(b, ["version"]);
    C.version(r, b.version);
    if (P.masters.includes(n)) {
      const field = {
        items: "item_id",
        lots: "lot_id",
        categories: "category_id",
        suppliers: "supplier_id",
        "warehouse-locations": "location_id",
        warehouses: "warehouse_id",
      }[n];
      C.fail(
        Object.entries(this.repo.data).some(
          ([name, rows]) =>
            name !== n &&
            rows.some((x) =>
              JSON.stringify(x).includes(`"${field}":"${r.id}"`),
            ),
        ),
        "RESOURCE_IN_USE",
        "Dữ liệu đã được sử dụng.",
        409,
      );
      this.repo.remove(n, r.id);
      return r;
    }
    C.state(
      r,
      n === "business-plans"
        ? ["PENDING_APPROVAL", "REJECTED"]
        : n === "qc-inspections"
          ? ["RECORDED"]
          : n === "tasks"
            ? ["PLANNED"]
            : ["PENDING"],
    );
    if (n === "qc-inspections") {
      this.qcUnused(r);
      for (const l of r.lines) {
        const lot = this.repo.get("lots", l.lot_id);
        lot.qc_status = "PENDING";
        delete lot.passed_quantity;
        delete lot.failed_quantity;
      }
      r.status = "VOID";
    } else r.status = "CANCELLED";
    r.version++;
    return r;
  },
  action(u, n, r, op, b) {
    C.fields(
      b,
      op === "review"
        ? ["version", "decision", "reason"]
        : op === "progress"
          ? ["version", "status"]
          : op === "read"
            ? []
            : ["version"],
    );
    if (op === "read") {
      r.read_at = new Date().toISOString();
      return r;
    }
    C.version(r, b.version);
    if (op === "receive") {
      C.state(r, ["SUBMITTED"]);
      r.status = "RECEIVED";
    } else if (op === "review") {
      C.fail(
        !["APPROVE", "REJECT"].includes(b.decision),
        "VALIDATION_ERROR",
        "Quyết định không hợp lệ.",
      );
      if (b.decision === "REJECT") C.text(b.reason, "reason", 2000);
      C.state(
        r,
        n === "customer-orders"
          ? ["RECEIVED"]
          : n === "production-plans"
            ? ["DRAFT"]
            : ["PENDING_APPROVAL"],
      );
      if (b.decision === "APPROVE") {
        if (n === "business-plans" && r.type === "SALE")
          this.checkPlanLimit(r, "business-plans", r.lines);
        if (n === "production-plans")
          this.checkPlanLimit(r, "production-plans", r.outputs);
        if (n === "exception-proposals") this.applyException(u, r);
        else r.status = "APPROVED";
      } else r.status = n === "production-plans" ? "DRAFT" : "REJECTED";
      r.review_reason = b.reason || "";
    } else if (op === "submit") {
      C.state(r, ["DRAFT"]);
      r.status = "SUBMITTED";
      r.submitted_at = new Date().toISOString();
    } else if (op === "progress") {
      C.fail(
        !["IN_PROGRESS", "COMPLETED"].includes(b.status),
        "VALIDATION_ERROR",
        "Trạng thái không hợp lệ.",
      );
      C.state(r, b.status === "IN_PROGRESS" ? ["PLANNED"] : ["IN_PROGRESS"]);
      r.status = b.status;
    } else if (op === "start") {
      C.state(r, ["PLANNED"]);
      for (const w of r.warehouses) {
        C.fail(
          this.frozen(w.warehouse_id),
          "WAREHOUSE_FROZEN",
          "Kho đang thuộc đợt kiểm kê khác.",
          409,
        );
        w.status = "COUNTING";
        w.version++;
        w.lines = this.repo
          .all("inventory")
          .filter(
            (i) =>
              i.warehouse_id === w.warehouse_id &&
              (!r.item_kind ||
                this.repo.get("items", i.item_id).kind === r.item_kind),
          )
          .map((i) => ({
            ...i,
            id: crypto.randomUUID(),
            version: 1,
            system_quantity: i.quantity,
            actual_quantity: null,
            resolved: false,
          }));
      }
      r.status = "IN_PROGRESS";
    } else if (op === "close") {
      C.state(r, ["IN_PROGRESS", "COMPLETED"]);
      C.fail(
        r.warehouses.some(
          (w) =>
            w.status !== "COMPLETED" ||
            w.lines.some(
              (l) => l.actual_quantity !== l.system_quantity && !l.resolved,
            ) ||
            !this.repo
              .all("stocktake-minutes")
              .some(
                (m) =>
                  m.stocktake_id === r.id &&
                  m.warehouse_id === w.warehouse_id &&
                  m.status === "SUBMITTED",
              ),
        ),
        "INVALID_STATE",
        "Cần hoàn tất đếm, gửi biên bản và xử lý chênh lệch.",
        409,
      );
      for (const w of r.warehouses) {
        w.status = "CLOSED";
        w.version++;
      }
      r.status = "CLOSED";
    }
    r.version++;
    this.notify(["DIRECTOR", "PLANNER"], `${r.code}: ${r.status}`, {
      resource: n,
      id: r.id,
    });
    return r;
  },
  checkPlanLimit(r, n, lines) {
    const o = this.repo.get("customer-orders", r.customer_order_id);
    C.state(o, ["APPROVED", "IN_PROGRESS"]);
    for (const l of lines) {
      const src = o.lines.find((x) => x.item_id === l.item_id),
        allocated = this.repo
          .all(n)
          .filter(
            (p) =>
              p.id !== r.id &&
              p.customer_order_id === o.id &&
              ["APPROVED", "IN_PROGRESS", "COMPLETED"].includes(p.status),
          )
          .flatMap((p) => p.outputs || p.lines)
          .filter((x) => x.item_id === l.item_id)
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
      C.fail(
        !src || allocated + C.qty(l.quantity) > C.qty(src.quantity),
        "SOURCE_LIMIT_EXCEEDED",
        "Tổng kế hoạch vượt lượng đơn.",
      );
    }
  },
  checkTask(b, exclude) {
    C.text(b.title, "title", 200);
    const start = Date.parse(b.start_at),
      end = Date.parse(b.end_at);
    C.fail(
      !Number.isFinite(start) || !Number.isFinite(end) || end <= start,
      "VALIDATION_ERROR",
      "Khoảng thời gian không hợp lệ.",
    );
    C.fail(
      !Array.isArray(b.assignee_ids) || !b.assignee_ids.length,
      "VALIDATION_ERROR",
      "Chọn người thực hiện.",
    );
    for (const id of b.assignee_ids)
      C.fail(
        this.repo.get("users", id).roles.includes("CUSTOMER"),
        "VALIDATION_ERROR",
        "Không phân công khách hàng.",
      );
    C.fail(
      this.repo
        .all("tasks")
        .some(
          (t) =>
            t.id !== exclude &&
            ["PLANNED", "IN_PROGRESS"].includes(t.status) &&
            t.assignee_ids.some((id) => b.assignee_ids.includes(id)) &&
            Date.parse(t.start_at) < end &&
            Date.parse(t.end_at) > start,
        ),
      "SCHEDULE_CONFLICT",
      "Nhân viên đã có lịch trùng.",
      409,
    );
  },
};
