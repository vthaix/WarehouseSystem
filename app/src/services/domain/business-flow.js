// Latest user-written SRS workflow takes precedence over earlier proposed rules.
const C = require("./core");
const P = require("./policy");
module.exports = function install(Service) {
  const baseCheckTask = Service.prototype.checkTask;
  Service.prototype.checkTask = function (b, exclude) {
    C.fail(
      !Array.isArray(b.assignee_ids) ||
        b.assignee_ids.length > 50 ||
        new Set(b.assignee_ids).size !== b.assignee_ids.length,
      "VALIDATION_ERROR",
      "Danh sách phân công không hợp lệ.",
    );
    C.fail(
      b.priority !== undefined &&
        !["LOW", "NORMAL", "HIGH"].includes(b.priority),
      "VALIDATION_ERROR",
      "Ưu tiên không hợp lệ.",
    );
    return baseCheckTask.call(this, b, exclude);
  };
  const baseCreate = Service.prototype.create,
    baseAction = Service.prototype.action,
    baseVisible = Service.prototype.visible,
    baseActions = Service.prototype.actions,
    baseRun = Service.prototype.run,
    basePost = Service.prototype.post,
    baseAllocations = Service.prototype.allocations,
    baseUpdate = Service.prototype.update,
    baseQcUnused = Service.prototype.qcUnused,
    baseCancel = Service.prototype.cancel;
  Service.prototype.notifyUsers = function (ids, title, source) {
    for (const id of new Set(ids))
      this.repo.add("notifications", {
        user_id: id,
        title,
        source,
        read_at: null,
      });
  };
  Service.prototype.workshopUsers = function (id) {
    return this.repo
      .all("users")
      .filter(
        (u) =>
          u.roles.includes("WORKSHOP_OWNER") && u.workshop_ids.includes(id),
      )
      .map((u) => u.id);
  };
  Service.prototype.visible = function (u, r, n) {
    if (u.roles.includes("DIRECTOR")) return true;
    if (n === "qc-inspections" && u.roles.includes("QC_INSPECTOR"))
      return (
        !!r.campaign_id &&
        this.repo.get("stocktakes", r.campaign_id).assignee_ids.includes(u.id)
      );
    if (n === "qc-inspections" && u.roles.includes("WORKSHOP_OWNER"))
      return r.lines.every((l) => {
        const lot = this.repo.get("lots", l.lot_id);
        return lot.production_plan_id
          ? u.workshop_ids.includes(
              this.repo.get("production-plans", lot.production_plan_id)
                .workshop_id,
            )
          : this.repo
              .get("purchase-orders", lot.purchase_order_id)
              .workshop_ids.some((id) => u.workshop_ids.includes(id));
      });
    if (n === "tasks") {
      if (u.roles.includes("WAREHOUSE_MANAGER"))
        return (
          r.task_type?.startsWith("WAREHOUSE_") &&
          (!r.manager_id || r.manager_id === u.id)
        );
      return r.assignee_ids.includes(u.id);
    }
    if (n === "stocktakes" && r.campaign_type === "QUALITY_CHECK")
      return (
        u.roles.includes("WAREHOUSE_MANAGER") ||
        (u.roles.includes("QC_INSPECTOR") && r.assignee_ids.includes(u.id))
      );
    if (
      u.roles.includes("WAREHOUSE_STAFF") &&
      !u.roles.includes("WAREHOUSE_MANAGER")
    ) {
      if (n === "stock-requests")
        return this.repo
          .all("tasks")
          .some(
            (t) => t.stock_request_id === r.id && t.assignee_ids.includes(u.id),
          );
      if (n === "stock-documents") return r.posted_by === u.id;
    }
    if (n === "stock-requests" && u.roles.includes("PLANNER"))
      return r.purpose === "MATERIAL_PURCHASE";
    if (n === "warehouse-records" && u.roles.includes("WORKSHOP_OWNER"))
      return u.workshop_ids.includes(r.workshop_id);
    return baseVisible.call(this, u, r, n);
  };
  Service.prototype.actions = function (u, n, r) {
    let a = baseActions.call(this, u, n, r);
    if (
      n === "production-plans" &&
      u.roles.includes("PLANNER") &&
      r.status === "DRAFT"
    )
      a.push("cancel");
    if (n === "stock-requests" && r.purpose === "MATERIAL_PURCHASE")
      a = a.filter((x) => x !== "post");
    if (
      n === "stock-requests" &&
      this.repo
        .all("tasks")
        .some((t) => t.stock_request_id === r.id && t.status !== "CANCELLED")
    )
      a = a.filter((x) => !["edit", "delete"].includes(x));
    if (
      n === "stock-requests" &&
      u.roles.includes("WAREHOUSE_MANAGER") &&
      r.purpose !== "MATERIAL_PURCHASE" &&
      ["PENDING", "PARTIALLY_FULFILLED"].includes(r.status) &&
      r.manager_id === u.id
    )
      a.push("dispatch");
    if (
      n === "tasks" &&
      r.status === "IN_PROGRESS" &&
      (u.roles.includes("DIRECTOR") || u.roles.includes("WAREHOUSE_MANAGER"))
    )
      a.push("edit");
    if (
      n === "tasks" &&
      u.roles.includes("WAREHOUSE_MANAGER") &&
      ["PLANNED", "IN_PROGRESS"].includes(r.status)
    )
      a.push("progress");
    if (
      n === "tasks" &&
      r.stock_request_id &&
      u.roles.includes("WAREHOUSE_STAFF") &&
      r.assignee_ids.includes(u.id) &&
      ["PLANNED", "IN_PROGRESS"].includes(r.status)
    )
      a.push("postTask");
    return [...new Set(a)];
  };
  Service.prototype.create = function (u, n, b) {
    if (n === "production-plans") {
      C.fail(
        b.materials !== undefined && !Array.isArray(b.materials),
        "VALIDATION_ERROR",
        "Danh sách NVL không hợp lệ.",
      );
      const row = baseCreate.call(this, u, n, {
        ...b,
        materials: b.materials || [],
      });
      this.notifyUsers(
        this.workshopUsers(row.workshop_id),
        `Kế hoạch sản xuất mới ${row.code}`,
        { resource: n, id: row.id },
      );
      return row;
    }
    if (n === "production-reports") {
      const row = baseCreate.call(this, u, n, b);
      row.lines.forEach(
        (l) =>
          (l.shortage_quantity = C.decimal(
            C.qty(l.required_quantity) - C.qty(l.available_quantity, false) > 0n
              ? C.qty(l.required_quantity) - C.qty(l.available_quantity, false)
              : 0n,
          )),
      );
      return row;
    }
    if (n === "stock-requests" && b.purpose === "MATERIAL_PURCHASE") {
      C.fields(b, [
        "purpose",
        "production_report_id",
        "workshop_id",
        "requested_date",
        "note",
        "lines",
      ]);
      const report = this.get(u, "production-reports", b.production_report_id);
      C.state(report, ["SUBMITTED"]);
      C.fail(
        report.workshop_id !== b.workshop_id,
        "NOT_FOUND",
        "Báo cáo không thuộc xưởng.",
        404,
      );
      C.date(b.requested_date);
      const source = report.lines.map((l) => ({
        item_id: l.item_id,
        quantity: l.shortage_quantity,
      }));
      const lines = this.lines(b, source, "MATERIAL");
      for (const l of lines) {
        const total = this.repo
          .all(n)
          .filter(
            (r) =>
              r.production_report_id === report.id && r.status !== "CANCELLED",
          )
          .flatMap((r) => r.lines)
          .filter((x) => x.item_id === l.item_id)
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        C.fail(
          total + C.qty(l.quantity) >
            C.qty(source.find((x) => x.item_id === l.item_id).quantity, false),
          "SOURCE_LIMIT_EXCEEDED",
          "Yêu cầu mua vượt lượng thiếu trong báo cáo.",
        );
      }
      const row = this.repo.add(n, {
        ...b,
        lines,
        type: "PROCUREMENT",
        status: "PENDING",
        created_by: u.id,
        source_code: report.code,
      });
      this.notify(["PLANNER"], `Yêu cầu bổ sung NVL ${row.code}`, {
        resource: n,
        id: row.id,
      });
      return row;
    }
    if (n === "business-plans" && b.source_request_id) {
      C.fail(
        b.type !== "PURCHASE",
        "VALIDATION_ERROR",
        "Nguồn bổ sung NVL chỉ áp dụng kế hoạch mua.",
      );
      const req = this.get(u, "stock-requests", b.source_request_id);
      C.fail(
        req.purpose !== "MATERIAL_PURCHASE" ||
          !["PENDING", "PLANNED"].includes(req.status),
        "INVALID_STATE",
        "Yêu cầu mua không hợp lệ.",
        409,
      );
      const row = baseCreate.call(this, u, n, b);
      for (const l of row.lines) {
        const src = req.lines.find((x) => x.item_id === l.item_id);
        const reserved = this.repo
          .all(n)
          .filter(
            (p) =>
              p.id !== row.id &&
              p.source_request_id === req.id &&
              !["CANCELLED", "REJECTED"].includes(p.status),
          )
          .flatMap((p) => p.lines)
          .filter((x) => x.item_id === l.item_id)
          .reduce((sum, x) => sum + C.qty(x.quantity), 0n);
        C.fail(
          !src || reserved + C.qty(l.quantity) > C.qty(src.quantity),
          "SOURCE_LIMIT_EXCEEDED",
          "Kế hoạch mua vượt yêu cầu bổ sung NVL.",
        );
      }
      row.workshop_id = req.workshop_id;
      return row;
    }
    if (n === "purchase-orders") {
      const p = this.repo.get("business-plans", b.business_plan_id);
      return baseCreate.call(this, u, n, {
        ...b,
        ...(p.workshop_id ? { workshop_ids: [p.workshop_id] } : {}),
      });
    }
    if (n === "stocktakes" && b.campaign_type === "QUALITY_CHECK") {
      C.fields(b, [
        "campaign_type",
        "quality_kind",
        "planned_date",
        "start_at",
        "end_at",
        "location",
        "assignee_ids",
        "lot_ids",
        "purchase_order_id",
        "finished_report_id",
        "note",
      ]);
      C.fail(
        !["MATERIAL", "FINISHED_PRODUCT"].includes(b.quality_kind),
        "VALIDATION_ERROR",
        "Chọn loại hàng kiểm tra QC.",
      );
      C.date(b.planned_date, "planned_date", true);
      C.text(b.location, "location", 500);
      C.fail(
        !Array.isArray(b.assignee_ids) ||
          !b.assignee_ids.length ||
          !Array.isArray(b.lot_ids) ||
          !b.lot_ids.length,
        "VALIDATION_ERROR",
        "Chọn nhân viên QC và các lô cần kiểm tra.",
      );
      for (const id of b.assignee_ids)
        C.fail(
          !this.repo.get("users", id).roles.includes("QC_INSPECTOR"),
          "VALIDATION_ERROR",
          "Cần phân công nhân viên QC/AC.",
        );
      for (const id of b.lot_ids) {
        const lot = this.repo.get("lots", id);
        C.fail(
          this.repo.get("items", lot.item_id).kind !== b.quality_kind ||
            lot.qc_status !== "PENDING",
          "VALIDATION_ERROR",
          "Lô không phù hợp với lịch QC.",
        );
        if (b.purchase_order_id)
          C.fail(
            lot.purchase_order_id !== b.purchase_order_id,
            "VALIDATION_ERROR",
            "Lô ngoài đơn mua.",
          );
        if (b.finished_report_id)
          C.fail(
            lot.finished_report_id !== b.finished_report_id,
            "VALIDATION_ERROR",
            "Lô ngoài báo cáo thành phẩm.",
          );
      }
      const task = {
        title: `Kiểm tra QC ${b.quality_kind === "MATERIAL" ? "nguyên liệu" : "thành phẩm"}`,
        start_at: b.start_at,
        end_at: b.end_at,
        priority: "NORMAL",
        assignee_ids: b.assignee_ids,
        task_type: "QUALITY_CHECK",
        status: "PLANNED",
      };
      this.checkTask(task);
      const row = this.repo.add(n, {
        ...b,
        warehouses: [],
        status: "PLANNED",
        created_by: u.id,
      });
      row.task_id = this.repo.add("tasks", {
        ...task,
        stocktake_id: row.id,
        location: b.location,
      }).id;
      this.notifyUsers(
        b.assignee_ids,
        `Lịch QC ${row.code} tại ${b.location}`,
        { resource: n, id: row.id },
      );
      return row;
    }
    if (n === "stocktakes") {
      const { campaign_type, ...data } = b;
      C.fail(
        campaign_type && campaign_type !== "COUNT",
        "VALIDATION_ERROR",
        "Loại đợt không hợp lệ.",
      );
      const row = baseCreate.call(this, u, n, data);
      row.campaign_type = "COUNT";
      return row;
    }
    if (n === "qc-inspections") {
      C.fields(b, ["campaign_id", "inspected_at", "note", "lines"]);
      const { campaign_id, ...data } = structuredClone(b);
      C.fail(
        !Array.isArray(data.lines) ||
          !data.lines.length ||
          data.lines.length > 100,
        "VALIDATION_ERROR",
        "Cần 1–100 dòng QC.",
      );
      const ids = data.lines.map((l) => l.lot_id);
      const campaign = campaign_id
        ? this.get(u, "stocktakes", campaign_id)
        : this.repo
            .all("stocktakes")
            .find(
              (s) =>
                s.campaign_type === "QUALITY_CHECK" &&
                ["PLANNED", "IN_PROGRESS", "COMPLETED"].includes(s.status) &&
                s.assignee_ids.includes(u.id) &&
                ids.every((id) => s.lot_ids.includes(id)),
            );
      C.fail(
        !campaign ||
          campaign.campaign_type !== "QUALITY_CHECK" ||
          !campaign.assignee_ids.includes(u.id),
        "NOT_FOUND",
        "Chưa có lịch QC được phân công cho các lô này.",
        404,
      );
      C.state(campaign, ["PLANNED", "IN_PROGRESS", "COMPLETED"]);
      C.fail(
        ids.some((id) => !campaign.lot_ids.includes(id)),
        "VALIDATION_ERROR",
        "Lô không thuộc lịch QC.",
      );
      for (const l of data.lines) {
        l.inspected_quantity = C.decimal(C.qty(l.inspected_quantity));
        l.passed_quantity = C.decimal(C.qty(l.passed_quantity, false));
        l.failed_quantity = C.decimal(C.qty(l.failed_quantity, false));
      }
      const row = baseCreate.call(this, u, n, data);
      row.campaign_id = campaign.id;
      for (const l of row.lines) {
        const lot = this.repo.get("lots", l.lot_id),
          item = this.repo.get("items", lot.item_id);
        if (item.kind === "MATERIAL") {
          l.returned_supplier_quantity = l.failed_quantity;
          lot.returned_supplier_quantity = l.failed_quantity;
        } else if (C.qty(l.failed_quantity, false) > 0n) {
          const proposal = this.repo.add("exception-proposals", {
            type: "QC_FAILURE",
            action: "RESOLVE_BEFORE_RECEIPT",
            qc_inspection_id: row.id,
            qc_inspection_line_id: l.id,
            lot_id: lot.id,
            quantity: l.failed_quantity,
            reason: l.issue,
            resolution_note: row.note || l.issue,
            status: "PENDING_APPROVAL",
            created_by: u.id,
          });
          this.notify(["DIRECTOR"], `Ngoại lệ thành phẩm ${proposal.code}`, {
            resource: "exception-proposals",
            id: proposal.id,
          });
        }
      }
      campaign.status = campaign.lot_ids.every(
        (id) => this.repo.get("lots", id).qc_status !== "PENDING",
      )
        ? "COMPLETED"
        : "IN_PROGRESS";
      campaign.version++;
      const task = this.repo.get("tasks", campaign.task_id);
      task.status =
        campaign.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
      task.version++;
      for (const id of new Set(
        ids
          .map((id) => this.repo.get("lots", id).purchase_order_id)
          .filter(Boolean),
      ))
        this.reconcilePurchase(id);
      this.notifyUsers(
        this.workshopUsers(
          this.repo.get("lots", ids[0]).production_plan_id
            ? this.repo.get(
                "production-plans",
                this.repo.get("lots", ids[0]).production_plan_id,
              ).workshop_id
            : this.repo.get(
                "purchase-orders",
                this.repo.get("lots", ids[0]).purchase_order_id,
              ).workshop_ids[0],
        ),
        `Kết quả QC ${row.code}`,
        { resource: n, id: row.id },
      );
      return row;
    }
    if (n === "stock-requests") {
      const manager = this.repo.get(
        "users",
        b.manager_id ||
          this.repo
            .all("users")
            .find((x) => x.roles.includes("WAREHOUSE_MANAGER")).id,
      );
      C.fail(
        !manager.roles.includes("WAREHOUSE_MANAGER"),
        "VALIDATION_ERROR",
        "Người nhận phải là quản lý kho.",
      );
      const row = baseCreate.call(this, u, n, { ...b, manager_id: manager.id });
      this.notifyUsers(
        [manager.id],
        `Yêu cầu ${row.type === "IN" ? "nhập" : "xuất"} kho ${row.code}`,
        { resource: n, id: row.id },
      );
      return row;
    }
    if (n === "warehouse-records") {
      C.fields(b, ["stock_request_id", "note"]);
      const req = this.get(u, "stock-requests", b.stock_request_id);
      C.fail(
        req.manager_id !== u.id,
        "NOT_FOUND",
        "Yêu cầu không thuộc quản lý kho.",
        404,
      );
      C.state(req, ["FULFILLED"]);
      C.fail(
        this.repo.all(n).some((r) => r.stock_request_id === req.id),
        "ALREADY_PROCESSED",
        "Yêu cầu đã có hồ sơ tổng hợp.",
        409,
      );
      const docs = this.repo
        .all("stock-documents")
        .filter((d) => d.stock_request_id === req.id);
      const row = this.repo.add(n, {
        ...b,
        type: req.type,
        status: "POSTED",
        warehouse_id: req.warehouse_id,
        workshop_id: req.workshop_id,
        source_code: req.source_code,
        stock_document_ids: docs.map((d) => d.id),
        lines: docs.flatMap((d) =>
          d.lines.map((l) => ({
            ...l,
            stock_document_code: d.code,
            posted_by: d.posted_by,
          })),
        ),
        created_by: u.id,
      });
      this.notify(["DIRECTOR"], `Hồ sơ kho ${row.code}`, {
        resource: n,
        id: row.id,
      });
      this.notifyUsers(
        this.workshopUsers(req.workshop_id),
        `Hồ sơ kho ${row.code}`,
        { resource: n, id: row.id },
      );
      return row;
    }
    return baseCreate.call(this, u, n, b);
  };
  Service.prototype.action = function (u, n, r, op, b) {
    if (n === "tasks" && op === "progress" && b.status === "COMPLETED") {
      if (r.stock_request_id)
        C.fail(
          r.allocations.some((a) => a.quantity !== a.fulfilled_quantity),
          "INVALID_STATE",
          "Công việc kho chỉ hoàn thành khi đã ghi đủ phiếu cho phần hàng được giao.",
          409,
        );
      if (r.stocktake_id) {
        const campaign = this.repo.get("stocktakes", r.stocktake_id);
        C.fail(
          !["COMPLETED", "CLOSED"].includes(campaign.status),
          "INVALID_STATE",
          "Cần hoàn tất kiểm đếm hoặc ghi kết quả QC trước.",
          409,
        );
      }
    }
    if (n === "customer-orders" && op === "review") {
      const plans = this.repo
        .all("production-plans")
        .filter((p) => p.customer_order_id === r.id && p.status === "DRAFT");
      C.fail(
        !plans.length,
        "INVALID_STATE",
        "Cần lập kế hoạch sản xuất và chọn xưởng trước khi duyệt đơn.",
        409,
      );
      const result = baseAction.call(this, u, n, r, op, b);
      if (b.decision === "APPROVE")
        for (const p of plans) {
          this.checkPlanLimit(p, "production-plans", p.outputs);
          p.status = "APPROVED";
          p.version++;
          this.notifyUsers(
            this.workshopUsers(p.workshop_id),
            `Đơn đã tiếp nhận, thực hiện kế hoạch ${p.code}`,
            { resource: "production-plans", id: p.id },
          );
        }
      return result;
    }
    if (n === "production-reports" && op === "submit") {
      const result = baseAction.call(this, u, n, r, op, b),
        p = this.repo.get("production-plans", r.production_plan_id);
      for (const l of r.lines) {
        const existing = p.materials.find((m) => m.item_id === l.item_id),
          item = this.repo.get("items", l.item_id);
        if (existing) {
          if (C.qty(l.required_quantity) > C.qty(existing.required_quantity)) {
            existing.required_quantity = l.required_quantity;
            existing.quantity = l.required_quantity;
          }
        } else
          p.materials.push({
            item_id: l.item_id,
            item_name: item.name,
            unit: item.unit,
            quantity: l.required_quantity,
            required_quantity: l.required_quantity,
            fulfilled_quantity: "0.000",
          });
      }
      p.version++;
      this.notify(["PLANNER"], `Nhu cầu NVL ${r.code}`, {
        resource: n,
        id: r.id,
      });
      return result;
    }
    if (n === "business-plans" && op === "review") {
      const result = baseAction.call(this, u, n, r, op, b);
      if (b.decision === "APPROVE" && r.type === "PURCHASE") {
        if (r.source_request_id) {
          const req = this.repo.get("stock-requests", r.source_request_id);
          req.status = "PLANNED";
          req.version++;
        }
        this.notify(["PURCHASER"], `Kế hoạch mua đã duyệt ${r.code}`, {
          resource: n,
          id: r.id,
        });
      }
      return result;
    }
    if (n === "stocktakes" && r.campaign_type === "QUALITY_CHECK") {
      C.fields(b, ["version"]);
      C.version(r, b.version);
      const task = this.repo.get("tasks", r.task_id);
      if (op === "start") {
        C.state(r, ["PLANNED"]);
        r.status = "IN_PROGRESS";
        task.status = "IN_PROGRESS";
      } else if (op === "close") {
        C.state(r, ["COMPLETED"]);
        r.status = "CLOSED";
      } else C.fail(true, "NOT_FOUND", "Lịch QC không có thao tác này.", 404);
      r.version++;
      task.version++;
      return r;
    }
    if (
      n === "exception-proposals" &&
      r.type === "QC_FAILURE" &&
      op === "review"
    ) {
      C.fields(b, ["version", "decision", "reason"]);
      C.version(r, b.version);
      C.state(r, ["PENDING_APPROVAL"]);
      C.fail(
        !["APPROVE", "REJECT"].includes(b.decision),
        "VALIDATION_ERROR",
        "Quyết định không hợp lệ.",
      );
      if (b.decision === "REJECT") C.text(b.reason, "reason", 2000);
      r.status = b.decision === "APPROVE" ? "APPLIED" : "REJECTED";
      r.review_reason = b.reason || "";
      r.version++;
      if (b.decision === "APPROVE") {
        const lot = this.repo.get("lots", r.lot_id);
        lot.failure_disposition = "APPROVED_NOTE";
        lot.failure_resolution = r.resolution_note;
      }
      return r;
    }
    const result = baseAction.call(this, u, n, r, op, b);
    if (n === "stocktakes" && r.campaign_type === "COUNT") {
      for (const task of this.repo
        .all("tasks")
        .filter((t) => t.stocktake_id === r.id)) {
        task.task_type = "COUNT";
        task.status =
          op === "start"
            ? "IN_PROGRESS"
            : op === "close"
              ? "COMPLETED"
              : task.status;
        task.version++;
      }
    }
    return result;
  };
  Service.prototype.run = function (u, n, op, id, b, key) {
    C.fields(b, Object.keys(b || {}));
    if (op === "dispatch") {
      P.role(u, ["WAREHOUSE_MANAGER"]);
      return this.replay(u, `dispatch:${id}`, b, key, true, () =>
        this.dispatch(u, id, b),
      );
    }
    if (op === "cancel") {
      P.role(u, ["PLANNER"]);
      return this.replay(u, `delete-production:${id}`, b, key, false, () => {
        const p = this.get(u, "production-plans", id);
        C.fields(b, ["version"]);
        C.version(p, b.version);
        C.state(p, ["DRAFT"]);
        p.status = "CANCELLED";
        p.version++;
        this.audit(u, "cancel", n, p);
        return this.result(u, n, p);
      });
    }
    if (n === "tasks" && u.roles.includes("WAREHOUSE_MANAGER")) {
      P.role(u, ["WAREHOUSE_MANAGER"]);
      return this.replay(
        u,
        `${n}:${op}:${id}`,
        b,
        key,
        op === "progress",
        () => {
          const task = this.get(u, n, id);
          C.fail(
            !["edit", "delete", "progress"].includes(op),
            "FORBIDDEN",
            "Quản lý kho chỉ điều phối công việc kho.",
            403,
          );
          const row =
            op === "edit"
              ? this.update(u, n, task, b)
              : op === "delete"
                ? this.cancel(u, n, task, b)
                : this.action(u, n, task, op, b);
          this.audit(u, op, n, row);
          return this.result(u, n, row);
        },
      );
    }
    return baseRun.call(this, u, n, op, id, b, key);
  };
  Service.prototype.cancel = function (u, n, r, b) {
    if (n === "stock-requests" && r.purpose === "MATERIAL_PURCHASE")
      C.fail(
        this.repo
          .all("business-plans")
          .some(
            (p) =>
              p.source_request_id === r.id &&
              !["CANCELLED", "REJECTED"].includes(p.status),
          ),
        "RESOURCE_IN_USE",
        "Yêu cầu đã có kế hoạch mua.",
        409,
      );
    if (n === "stock-requests")
      C.fail(
        this.repo
          .all("tasks")
          .some((t) => t.stock_request_id === r.id && t.status !== "CANCELLED"),
        "RESOURCE_IN_USE",
        "Yêu cầu đã được phân công, hủy công việc chưa thực hiện trước.",
        409,
      );
    const result = baseCancel.call(this, u, n, r, b);
    if (n === "tasks" && r.stock_request_id) {
      this.repo.get("stock-requests", r.stock_request_id).version++;
      this.notifyUsers(r.assignee_ids, `Đã hủy công việc ${r.code}`, {
        resource: n,
        id: r.id,
      });
    }
    if (n === "tasks" && r.stocktake_id) {
      const campaign = this.repo.get("stocktakes", r.stocktake_id);
      C.state(campaign, ["PLANNED"]);
      campaign.status = "CANCELLED";
      campaign.version++;
      for (const task of this.repo
        .all("tasks")
        .filter((t) => t.stocktake_id === campaign.id && t.id !== r.id)) {
        task.status = "CANCELLED";
        task.version++;
      }
      for (const w of campaign.warehouses) w.status = "CANCELLED";
    }
    if (n === "qc-inspections") {
      for (const proposal of this.repo
        .all("exception-proposals")
        .filter(
          (p) => p.qc_inspection_id === r.id && p.status === "PENDING_APPROVAL",
        )) {
        proposal.status = "CANCELLED";
        proposal.version++;
      }
      for (const line of r.lines)
        delete this.repo.get("lots", line.lot_id).returned_supplier_quantity;
      if (r.campaign_id) {
        const campaign = this.repo.get("stocktakes", r.campaign_id);
        C.fail(
          campaign.status === "CLOSED",
          "RESOURCE_IN_USE",
          "Lịch QC đã đóng.",
          409,
        );
        campaign.status = "PLANNED";
        campaign.version++;
        const task = this.repo.get("tasks", campaign.task_id);
        task.status = "PLANNED";
        task.version++;
      }
    }
    return result;
  };
  Service.prototype.qcUnused = function (r) {
    baseQcUnused.call(this, r);
    C.fail(
      this.repo
        .all("exception-proposals")
        .some((p) => p.qc_inspection_id === r.id && p.status === "APPLIED"),
      "RESOURCE_IN_USE",
      "QC đã có đề xuất ngoại lệ.",
      409,
    );
  };
  Service.prototype.update = function (u, n, r, b) {
    if (n === "stock-requests" && r.purpose === "MATERIAL_PURCHASE")
      C.fail(
        this.repo
          .all("business-plans")
          .some(
            (p) =>
              p.source_request_id === r.id &&
              !["CANCELLED", "REJECTED"].includes(p.status),
          ),
        "RESOURCE_IN_USE",
        "Yêu cầu đã có kế hoạch mua.",
        409,
      );
    if (
      n === "tasks" &&
      r.stocktake_id &&
      this.repo.get("stocktakes", r.stocktake_id).campaign_type ===
        "QUALITY_CHECK"
    ) {
      C.fields(b, [
        "version",
        "title",
        "description",
        "start_at",
        "end_at",
        "priority",
        "assignee_ids",
      ]);
      C.version(r, b.version);
      C.state(r, ["PLANNED", "IN_PROGRESS"]);
      const data = { ...r, ...b };
      for (const id of data.assignee_ids)
        C.fail(
          !this.repo.get("users", id).roles.includes("QC_INSPECTOR"),
          "VALIDATION_ERROR",
          "Lịch QC phải giao nhân viên QC/AC.",
        );
      this.checkTask(data, r.id);
      Object.assign(r, data, { version: r.version + 1 });
      const campaign = this.repo.get("stocktakes", r.stocktake_id);
      campaign.assignee_ids = [...r.assignee_ids];
      campaign.start_at = r.start_at;
      campaign.end_at = r.end_at;
      campaign.version++;
      this.notifyUsers(r.assignee_ids, `Cập nhật lịch QC ${campaign.code}`, {
        resource: "stocktakes",
        id: campaign.id,
      });
      return r;
    }
    if (n === "qc-inspections")
      for (const p of this.repo
        .all("exception-proposals")
        .filter(
          (p) => p.qc_inspection_id === r.id && p.status === "PENDING_APPROVAL",
        )) {
        p.status = "CANCELLED";
        p.version++;
      }
    if (n === "stock-requests" && r.purpose === "MATERIAL_PURCHASE") {
      C.version(r, b.version);
      C.state(r, ["PENDING"]);
      C.fields(b, ["version", "requested_date", "note", "lines"]);
      const previous = this.repo.all(n).indexOf(r);
      this.repo.data[n].splice(previous, 1);
      const row = this.create(u, n, {
        purpose: r.purpose,
        production_report_id: r.production_report_id,
        workshop_id: r.workshop_id,
        requested_date: b.requested_date || r.requested_date,
        note: b.note ?? r.note,
        lines: (b.lines || r.lines).map((l) => ({
          item_id: l.item_id,
          quantity: l.quantity,
        })),
      });
      this.repo.remove(n, row.id);
      Object.assign(r, row, { id: r.id, code: r.code, version: r.version + 1 });
      this.repo.all(n).push(r);
      return r;
    }
    if (n === "stock-requests" && r.purpose === "MATERIAL_PURCHASE")
      C.fail(
        this.repo
          .all("business-plans")
          .some(
            (p) =>
              p.source_request_id === r.id &&
              !["CANCELLED", "REJECTED"].includes(p.status),
          ),
        "RESOURCE_IN_USE",
        "Yêu cầu đã có kế hoạch mua.",
        409,
      );
    if (n === "stock-requests")
      C.fail(
        this.repo
          .all("tasks")
          .some((t) => t.stock_request_id === r.id && t.status !== "CANCELLED"),
        "RESOURCE_IN_USE",
        "Yêu cầu đã phân công, cần hủy công việc trước khi sửa.",
        409,
      );
    if (n === "tasks" && r.stock_request_id && b.assignee_ids) {
      C.fail(
        !Array.isArray(b.assignee_ids) || b.assignee_ids.length !== 1,
        "VALIDATION_ERROR",
        "Mỗi công việc kho có một nhân viên phụ trách.",
      );
      C.fail(
        !this.repo
          .get("users", b.assignee_ids[0])
          .roles.includes("WAREHOUSE_STAFF"),
        "VALIDATION_ERROR",
        "Cần nhân viên kho.",
      );
      C.fail(
        r.status !== "PLANNED" &&
          JSON.stringify(b.assignee_ids) !== JSON.stringify(r.assignee_ids),
        "INVALID_STATE",
        "Công việc đang thực hiện chỉ sửa thời gian/ghi chú.",
        409,
      );
    }
    const result = baseUpdate.call(this, u, n, r, b);
    if (n === "tasks" && r.stock_request_id) {
      const req = this.repo.get("stock-requests", r.stock_request_id);
      req.version++;
      this.notifyUsers(r.assignee_ids, `Cập nhật công việc ${r.code}`, {
        resource: n,
        id: r.id,
      });
    }
    return result;
  };
  Service.prototype.post = function (u, b) {
    const { task_id, ...body } = b;
    const req = this.get(u, "stock-requests", body.stock_request_id);
    C.fail(
      req.purpose === "MATERIAL_PURCHASE",
      "INVALID_STATE",
      "Yêu cầu bổ sung NVL chưa phải yêu cầu ghi phiếu.",
      409,
    );
    const task = task_id
      ? this.repo.get("tasks", task_id)
      : this.repo
          .all("tasks")
          .find(
            (t) =>
              t.stock_request_id === req.id &&
              t.assignee_ids.includes(u.id) &&
              ["PLANNED", "IN_PROGRESS"].includes(t.status),
          );
    C.fail(
      !task ||
        task.stock_request_id !== req.id ||
        !task.assignee_ids.includes(u.id),
      "NOT_FOUND",
      "Bạn chưa được phân công phần hàng này.",
      404,
    );
    C.state(task, ["PLANNED", "IN_PROGRESS"]);
    const pending = new Map();
    for (const a of body.allocations || []) {
      C.fail(
        a.quality_bucket !== "AVAILABLE",
        "INVALID_STATE",
        "Hàng lỗi không nhập kho theo luồng SRS mới.",
        409,
      );
      const key = [
        a.stock_request_line_id,
        a.lot_id,
        a.location_id,
        a.quality_bucket,
      ].join(":");
      const assigned = task.allocations.find(
        (x) =>
          [
            x.stock_request_line_id,
            x.lot_id,
            x.location_id,
            x.quality_bucket,
          ].join(":") === key,
      );
      C.fail(
        !assigned,
        "FORBIDDEN",
        "Phân bổ không thuộc phần hàng được giao.",
        403,
      );
      const total = (pending.get(key) || 0n) + C.qty(a.quantity);
      pending.set(key, total);
      C.fail(
        total >
          C.qty(assigned.quantity) - C.qty(assigned.fulfilled_quantity, false),
        "SOURCE_LIMIT_EXCEEDED",
        "Vượt phần hàng nhân viên được giao.",
      );
    }
    const doc = basePost.call(this, u, body);
    doc.task_id = task.id;
    for (const a of doc.lines) {
      const assigned = task.allocations.find(
        (x) =>
          x.stock_request_line_id === a.stock_request_line_id &&
          x.lot_id === a.lot_id &&
          x.location_id === a.location_id &&
          x.quality_bucket === a.quality_bucket,
      );
      assigned.fulfilled_quantity = C.decimal(
        C.qty(assigned.fulfilled_quantity, false) + C.qty(a.quantity),
      );
    }
    task.status = task.allocations.every(
      (a) => a.quantity === a.fulfilled_quantity,
    )
      ? "COMPLETED"
      : "IN_PROGRESS";
    task.version++;
    if (req.purchase_order_id) this.reconcilePurchase(req.purchase_order_id);
    this.notifyUsers([req.manager_id], `Đã ghi phiếu ${doc.code}`, {
      resource: "stock-documents",
      id: doc.id,
    });
    return doc;
  };
  Service.prototype.allocations = function (u, id, task_id) {
    P.role(u, ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]);
    const proxy = u.roles.includes("WAREHOUSE_MANAGER")
      ? { ...u, roles: [...u.roles, "WAREHOUSE_STAFF"] }
      : u;
    const p = baseAllocations.call(this, proxy, id);
    if (
      u.roles.includes("WAREHOUSE_STAFF") &&
      !u.roles.includes("WAREHOUSE_MANAGER")
    ) {
      const assigned = this.repo
        .all("tasks")
        .filter(
          (t) =>
            t.stock_request_id === id &&
            (!task_id || t.id === task_id) &&
            t.assignee_ids.includes(u.id) &&
            ["PLANNED", "IN_PROGRESS"].includes(t.status),
        )
        .flatMap((t) => t.allocations);
      p.lines = p.lines
        .filter((l) => assigned.some((a) => a.stock_request_line_id === l.id))
        .map((l) => ({
          ...l,
          remaining_quantity: C.decimal(
            assigned
              .filter((a) => a.stock_request_line_id === l.id)
              .reduce(
                (sum, a) =>
                  sum + C.qty(a.quantity) - C.qty(a.fulfilled_quantity, false),
                0n,
              ),
          ),
          lots: l.lots.filter((x) => assigned.some((a) => a.lot_id === x.id)),
          locations: l.locations.filter((x) =>
            assigned.some((a) => a.location_id === x.id),
          ),
          balances: l.balances.filter((x) =>
            assigned.some(
              (a) => a.lot_id === x.lot_id && a.location_id === x.location_id,
            ),
          ),
          assigned_allocations: assigned.filter(
            (a) => a.stock_request_line_id === l.id,
          ),
        }));
    }
    return p;
  };
};
