const originalCreateForm = createForm,
  originalActionForm = actionForm,
  originalDetail = detail;
createForm = async function () {
  try {
    const f = inputField;
    if (current === "stocktakes") {
      const warehouses = await options("warehouses"),
        users = await options("users"),
        lots = (await options("lots")).filter((l) => l.qc_status === "PENDING");
      openModal(
        "Lập đợt kiểm kê / QC",
        formWrap(
          f("campaign_type", "select", true, ["COUNT", "QUALITY_CHECK"]) +
            f("planned_date", "date") +
            f("start_at", "datetime-local") +
            f("end_at", "datetime-local") +
            '<div class="span2" id="campaign-fields"></div>',
        ),
      );
      const fields = () => {
        const qc =
          document.querySelector("#f-campaign_type").value === "QUALITY_CHECK";
        document.querySelector("#campaign-fields").innerHTML =
          '<div class="form-grid">' +
          (qc
            ? f("quality_kind", "select", true, [
                "MATERIAL",
                "FINISHED_PRODUCT",
              ]) +
              f("location") +
              f(
                "assignee_ids",
                "select",
                true,
                users.filter((u) => u.roles.includes("QC_INSPECTOR")),
              ) +
              f(
                "lot_ids",
                "select",
                true,
                lots.filter((l) => l.kind === "MATERIAL"),
              )
            : f("item_kind", "select", false, [
                { id: "", name: "Tất cả" },
                { id: "MATERIAL", name: "Nguyên liệu" },
                { id: "FINISHED_PRODUCT", name: "Thành phẩm" },
              ]) +
              f("warehouse_id", "select", true, warehouses) +
              f(
                "assignee_ids",
                "select",
                true,
                users.filter((u) => u.roles.includes("STOCKTAKER")),
              )) +
          f("note", "textarea", false) +
          "</div>";
        if (qc)
          document.querySelector("#f-quality_kind").onchange = () => {
            document.querySelector("#f-lot_ids").innerHTML = lots
              .filter(
                (l) =>
                  l.kind === document.querySelector("#f-quality_kind").value,
              )
              .map((l) => `<option value="${l.id}">${esc(l.name)}</option>`)
              .join("");
          };
      };
      document.querySelector("#f-campaign_type").onchange = fields;
      fields();
      bindForm(
        (d) => ({
          campaign_type: d.campaign_type,
          planned_date: d.planned_date,
          start_at: new Date(d.start_at + "+07:00").toISOString(),
          end_at: new Date(d.end_at + "+07:00").toISOString(),
          note: d.note,
          ...(d.campaign_type === "QUALITY_CHECK"
            ? {
                quality_kind: d.quality_kind,
                location: d.location,
                assignee_ids: [d.assignee_ids],
                lot_ids: [d.lot_ids],
              }
            : {
                ...(d.item_kind ? { item_kind: d.item_kind } : {}),
                warehouses: [
                  {
                    warehouse_id: d.warehouse_id,
                    assignee_ids: [d.assignee_ids],
                  },
                ],
              }),
        }),
        current,
      );
      return;
    }
    if (current === "qc-inspections") {
      const campaigns = (await api("stocktakes")).data.filter(
          (s) =>
            s.campaign_type === "QUALITY_CHECK" &&
            s.assignee_ids.includes(user.id) &&
            s.status === "IN_PROGRESS",
        ),
        lots = await options("lots");
      if (!campaigns.length)
        throw new Error("Chưa có lịch QC được giám đốc phân công.");
      openModal(
        "Ghi kết quả kiểm tra QC/AC",
        formWrap(
          f(
            "campaign_id",
            "select",
            true,
            campaigns.map((c) => ({
              id: c.id,
              name: c.code + " · " + c.location,
            })),
          ) +
            f(
              "inspected_at",
              "datetime-local",
              true,
              [],
              localInput(new Date().toISOString()),
            ) +
            f("lot_id", "select", true, []) +
            f("inspected_quantity", "number") +
            f("passed_quantity", "number") +
            f("failed_quantity", "number", true, [], "0") +
            f("issue", "textarea", false) +
            f("note", "textarea", false),
        ),
      );
      const sync = () => {
        const campaign = campaigns.find(
          (c) => c.id === document.querySelector("#f-campaign_id").value,
        );
        const eligible = lots.filter(
          (l) => campaign.lot_ids.includes(l.id) && l.qc_status === "PENDING",
        );
        document.querySelector("#f-lot_id").innerHTML = eligible
          .map((l) => `<option value="${l.id}">${esc(l.name)}</option>`)
          .join("");
        fillQuantity();
      };
      const fillQuantity = () => {
        const lot = lots.find(
          (l) => l.id === document.querySelector("#f-lot_id").value,
        );
        document.querySelector("#f-inspected_quantity").value =
          lot?.received_quantity || "";
        document.querySelector("#f-passed_quantity").value =
          lot?.received_quantity || "";
      };
      document.querySelector("#f-campaign_id").onchange = sync;
      document.querySelector("#f-lot_id").onchange = fillQuantity;
      sync();
      bindForm(
        (d) => ({
          campaign_id: d.campaign_id,
          inspected_at: new Date(d.inspected_at + "+07:00").toISOString(),
          note: d.note,
          lines: [
            {
              lot_id: d.lot_id,
              inspected_quantity: d.inspected_quantity,
              passed_quantity: d.passed_quantity,
              failed_quantity: d.failed_quantity,
              issue: d.issue,
            },
          ],
        }),
        current,
      );
      return;
    }
    if (current === "stock-requests") {
      const warehouses = await options("warehouses"),
        managers = await options("warehouse-managers"),
        reports = (await options("production-reports")).filter(
          (r) => r.status === "SUBMITTED",
        ),
        purchases = await options("purchase-orders"),
        plans = await options("business-plans"),
        production = await options("production-plans");
      openModal(
        "Lập yêu cầu theo nguồn",
        formWrap(
          f("purpose", "select", true, [
            { id: "MATERIAL_PURCHASE", name: "Bổ sung NVL / yêu cầu mua" },
            { id: "PURCHASE_RECEIPT", name: "Nhập NVL đạt QC từ đơn mua" },
            { id: "PRODUCTION_ISSUE", name: "Cấp NVL cho sản xuất" },
            { id: "PRODUCTION_RECEIPT", name: "Nhập thành phẩm đạt QC" },
            { id: "SALE_ISSUE", name: "Xuất thành phẩm giao khách" },
          ]) +
            f(
              "workshop_id",
              "select",
              true,
              user.workshop_ids.map((id) => ({ id, name: "Xưởng " + id })),
            ) +
            f("requested_date", "date") +
            f("production_report_id", "select", true, reports) +
            f("purchase_order_id", "select", true, purchases) +
            f(
              "business_plan_id",
              "select",
              true,
              plans.filter((p) => p.type !== "PURCHASE"),
            ) +
            f("production_plan_id", "select", true, production) +
            f("warehouse_id", "select", true, warehouses) +
            f("manager_id", "select", true, managers) +
            f("note", "textarea", false) +
            '<div class="span2"><button class="button" type="button" id="source-lines">Lấy dòng nguồn</button><div id="source-editor"></div></div>',
        ),
      );
      const sourceField = (purpose) =>
        ({
          MATERIAL_PURCHASE: "production_report_id",
          PURCHASE_RECEIPT: "purchase_order_id",
          SALE_ISSUE: "business_plan_id",
          PRODUCTION_ISSUE: "production_plan_id",
          PRODUCTION_RECEIPT: "production_plan_id",
        })[purpose];
      const sync = () => {
        const purpose = document.querySelector("#f-purpose").value;
        for (const k of [
          "production_report_id",
          "purchase_order_id",
          "business_plan_id",
          "production_plan_id",
          "warehouse_id",
          "manager_id",
        ]) {
          const enabled =
            k === sourceField(purpose) ||
            k === "warehouse_id" ||
            (k === "manager_id" && purpose !== "MATERIAL_PURCHASE");
          const el = document.querySelector("#f-" + k);
          el.disabled = !enabled;
          el.required = enabled;
          el.parentElement.hidden = !enabled;
        }
        document.querySelector("#source-editor").innerHTML = "";
      };
      document.querySelector("#f-purpose").onchange = sync;
      sync();
      document.querySelector("#source-lines").onclick = async () => {
        try {
          const d = Object.fromEntries(
              new FormData(document.querySelector("#data-form")),
            ),
            name = {
              production_report_id: "production-reports",
              purchase_order_id: "purchase-orders",
              business_plan_id: "business-plans",
              production_plan_id: "production-plans",
            }[sourceField(d.purpose)],
            source = (await api(name + "/" + d[sourceField(d.purpose)])).data;
          let lines =
            source.lines ||
            (d.purpose === "PRODUCTION_ISSUE"
              ? source.materials
              : source.outputs);
          if (d.purpose === "MATERIAL_PURCHASE")
            lines = lines
              .filter((l) => Number(l.shortage_quantity) > 0)
              .map((l) => ({ ...l, quantity: l.shortage_quantity }));
          else
            lines = lines.map((l) => ({
              ...l,
              quantity: l.required_quantity || l.quantity,
            }));
          if (!lines.length)
            throw new Error("Nguồn chưa có lượng hàng cần yêu cầu.");
          const items = await options("items");
          const e = lineEditor(
            "Dòng từ " + source.code,
            lines.map((l) => ({
              id: l.item_id,
              name: l.item_name || items.find((i) => i.id === l.item_id)?.name,
            })),
            "lines",
            ["quantity"],
            lines,
          );
          document.querySelector("#source-editor").innerHTML = e.html;
          e.mount();
        } catch (e) {
          document.querySelector("#form-error").innerHTML = errorHTML(e);
        }
      };
      bindForm((d) => { const body = { ...d, lines: readLines() }; if (body.purpose === "MATERIAL_PURCHASE") { delete body.warehouse_id; delete body.manager_id; } return body; }, current);
      return;
    }
    if (current === "production-reports") {
      const plans = (await options("production-plans")).filter((p) =>
          ["APPROVED", "IN_PROGRESS"].includes(p.status),
        ),
        items = (await options("items")).filter((i) => i.kind === "MATERIAL"),
        e = lineEditor(
          "Ước lượng NVL và lượng hiện có tại xưởng",
          items,
          "lines",
          ["available_quantity", "required_quantity"],
        );
      openModal(
        "Báo cáo nhu cầu NVL",
        formWrap(
          f("production_plan_id", "select", true, plans) +
            f("note", "textarea", false) +
            e.html,
        ),
      );
      e.mount();
      bindForm((d) => ({ ...d, lines: readLines() }), current);
      return;
    }
    if (current === "warehouse-records") {
      const requests = (await options("stock-requests")).filter(
        (r) => r.status === "FULFILLED" && r.manager_id === user.id,
      );
      const production = (await options("production-plans")).filter((p) =>
        ["APPROVED", "IN_PROGRESS"].includes(p.status),
      );
      openModal(
        "Lưu hồ sơ kho tổng hợp",
        formWrap(
          f("stock_request_id", "select", true, requests) +
            f("note", "textarea", false) +
            '<div class="span2 notice">Hồ sơ lấy toàn bộ phiếu đã ghi từ các nhân viên của yêu cầu này. Không nhập lại số lượng.</div>',
        ),
      );
      bindForm((d) => d, current);
      return;
    }
    await originalCreateForm();
    if (current === "business-plans" && document.querySelector("#data-form")) {
      const reports = isMysql ? (await options("production-reports")).filter(r => r.status === "SUBMITTED") : [];
      const requests = (await options("stock-requests")).filter(
        (r) =>
          r.purpose === "MATERIAL_PURCHASE" &&
          ["PENDING", "PLANNED"].includes(r.status),
      );
      const grid = document.querySelector("#data-form .form-grid");
      grid.insertAdjacentHTML(
        "afterbegin",
        (isMysql ? f("production_report_id", "select", false, [{ id: "", name: "Chọn báo cáo nhu cầu thực tế" }, ...reports]) : "") +
        (isMysql
          ? f("production_plan_id", "select", false, [
              { id: "", name: "Chọn kế hoạch sản xuất nguồn" },
              ...production,
            ])
          : "") +
          f("source_request_id", "select", false, [
            { id: "", name: "Chọn yêu cầu bổ sung NVL" },
            ...requests,
          ]),
      );
      const sync = () => {
        const el = document.querySelector("#f-source_request_id");
        el.disabled = document.querySelector("#f-type").value !== "PURCHASE";
        el.parentElement.hidden = el.disabled;
        const plan = document.querySelector("#f-production_plan_id");
        if (plan) {
          plan.disabled = el.disabled;
          plan.parentElement.hidden = el.disabled;
          plan.required = false;
        }
        const report = document.querySelector("#f-production_report_id");
        if (report) { report.disabled = el.disabled; report.parentElement.hidden = el.disabled; report.required = !el.disabled && !el.value; }
      };
      document.querySelector("#f-type").addEventListener("change", sync);
      sync();
      if (isMysql) document.querySelector("#f-production_report_id").onchange = () => {
        const report = reports.find(r => r.id === document.querySelector("#f-production_report_id").value);
        document.querySelector("#f-source_request_id").value = "";
        if (report) {
          document.querySelector("#f-production_plan_id").value = report.production_plan_id;
          document.querySelector("#lines-rows").innerHTML = "";
          const lines = report.lines.filter(l => Number(l.shortage_quantity) > 0).map(l => ({ ...l, quantity: l.shortage_quantity, unit_price: "0" }));
          lineEditor("NVL thiếu thực tế", lines.map(l => ({id:l.item_id,name:l.item_name || l.item_id})), "lines", ["quantity","unit_price"], lines).mount();
        }
        sync();
      };
      document.querySelector("#f-source_request_id").onchange = () => {
        const req = requests.find(
          (r) => r.id === document.querySelector("#f-source_request_id").value,
        );
        sync();
        if (req) {
          if (isMysql)
            document.querySelector("#f-production_plan_id").value = "";
          document.querySelector("#lines-rows").innerHTML = "";
          const e = lineEditor(
            "NVL cần mua",
            req.lines.map((l) => ({ id: l.item_id, name: l.item_name })),
            "lines",
            ["quantity", "unit_price"],
            req.lines.map((l) => ({ ...l, unit_price: "0" })),
          );
          e.mount();
        }
      };
      if (isMysql)
        document.querySelector("#f-production_plan_id").onchange = () => {
          const plan = production.find(
            (p) =>
              p.id === document.querySelector("#f-production_plan_id").value,
          );
          document.querySelector("#f-source_request_id").value = "";
          sync();
          if (plan) {
            document.querySelector("#lines-rows").innerHTML = "";
            const e = lineEditor(
              "NVL theo kế hoạch sản xuất",
              plan.materials.map((l) => ({
                id: l.item_id,
                name: l.item_name || l.item_id,
              })),
              "lines",
              ["quantity", "unit_price"],
              plan.materials.map((l) => ({
                item_id: l.item_id,
                quantity: l.required_quantity,
                unit_price: "0",
              })),
            );
            e.mount();
          }
        };
      bindForm((d) => {
        const b = { ...d, lines: readLines() };
        if (b.type === "PURCHASE") {
          delete b.customer_id;
          delete b.customer_order_id;
          if (!b.source_request_id) delete b.source_request_id;
          if (!b.production_plan_id) delete b.production_plan_id;
          if (!b.production_report_id) delete b.production_report_id;
        } else {
          delete b.supplier_id;
          delete b.source_request_id;
          delete b.production_plan_id;
          delete b.production_report_id;
        }
        return b;
      }, current);
    }
  } catch (e) {
    openModal("Không thể tạo chứng từ", errorHTML(e));
  }
};
actionForm = async function (r, action) {
  if (action === "dispatch") return dispatchForm(r);
  if (action === "postTask") {
    try {
      const req = (await api("stock-requests/" + r.stock_request_id)).data;
      req.assigned_task_id = r.id;
      return postForm(req);
    } catch (e) {
      openModal("Công việc được giao", errorHTML(e));
      return;
    }
  }
  if (action === "cancel") {
    openModal(
      "Hủy kế hoạch · " + r.code,
      formWrap(
        '<div class="span2 notice">Hủy kế hoạch sản xuất chưa được duyệt?</div>',
      ),
    );
    bindForm(() => ({ version: r.version }), current + "/" + r.id + "/cancel");
    return;
  }
  return originalActionForm(r, action);
};
detail = function (r) {
  originalDetail(r);
  if (r.production_plans) {
    const div = document.createElement("div");
    div.className = "form-section";
    div.innerHTML =
      "<h3>Kế hoạch sản xuất của đơn</h3>" +
      tableData(
        r.production_plans.map((p) => ({
          code: p.code,
          workshop_id: p.workshop_id,
          start_date: p.start_date,
          end_date: p.end_date,
          status: p.status,
        })),
      );
    modalBody.querySelector(".form-actions").before(div);
  }
  if (
    current === "customer-orders" &&
    has(["PLANNER"]) &&
    r.status === "RECEIVED"
  ) {
    const btn = document.createElement("button");
    btn.className = "button primary";
    btn.textContent = "Lập kế hoạch sản xuất";
    btn.onclick = async () => {
      modal.close();
      navigate("production-plans");
      await createForm();
      document.querySelector("#f-customer_order_id")?.value &&
        (document.querySelector("#f-customer_order_id").value = r.id);
    };
    modalBody.querySelector(".form-actions").append(btn);
  }
};
async function dispatchForm(req) {
  try {
    const preview = (await api("stock-requests/" + req.id + "/allocations"))
        .data,
      staff = (await options("users")).filter((u) =>
        u.roles.includes("WAREHOUSE_STAFF"),
      );
    openModal(
      "Phân công kho · " + req.code,
      `<div class="notice">Phân công cụ thể nhân viên, dòng hàng, lô, vị trí và số lượng. Mỗi nhân viên chỉ được ghi phiếu cho phần hàng của mình.</div>${formWrap(inputField("start_at", "datetime-local", true, [], req.requested_date + "T08:00") + inputField("end_at", "datetime-local", true, [], req.requested_date + "T09:00") + '<div class="span2" id="dispatch-lines"></div><button class="button" type="button" id="add-dispatch">＋ Thêm phân bổ</button>')}`,
    );
    const add = () => {
      const row = document.createElement("div");
      row.className = "form-section";
      row.dataset.dispatch = "true";
      row.innerHTML =
        '<div class="form-grid">' +
        `<div class="field"><label>Dòng hàng</label><select aria-label="Dòng hàng" data-key="stock_request_line_id">${preview.lines.map((l) => `<option value="${l.id}">${esc(l.item_name)} · còn ${l.remaining_quantity}</option>`).join("")}</select></div><div class="field"><label>Nhân viên kho</label><select aria-label="Nhân viên kho" data-key="assignee_id">${staff.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></div><div class="field"><label>Lô</label><select aria-label="Lô phân công" data-key="lot_id"></select></div><div class="field"><label>Vị trí</label><select aria-label="Vị trí phân công" data-key="location_id"></select></div><div class="field"><label>Số lượng</label><input aria-label="Số lượng phân công" data-key="quantity" type="number" min="0.001" step="0.001" required value="1"></div><div class="field"><label>Chất lượng</label><input aria-label="Chất lượng" data-key="quality_bucket" value="AVAILABLE" readonly></div></div><button class="button small danger" type="button">Xóa phân bổ</button>`;
      const sync = () => {
        const l = preview.lines.find(
          (l) =>
            l.id ===
            row.querySelector('[data-key="stock_request_line_id"]').value,
        );
        row.querySelector('[data-key="lot_id"]').innerHTML = l.lots
          .map((t) => `<option value="${t.id}">${esc(t.code)}</option>`)
          .join("");
        row.querySelector('[data-key="location_id"]').innerHTML = l.locations
          .map((t) => `<option value="${t.id}">${esc(t.name)}</option>`)
          .join("");
      };
      row.querySelector('[data-key="stock_request_line_id"]').onchange = sync;
      row.querySelector("button").onclick = () => {
        row.remove();
        retryKey = crypto.randomUUID();
      };
      document.querySelector("#dispatch-lines").append(row);
      sync();
    };
    document.querySelector("#add-dispatch").onclick = () => {
      add();
      retryKey = crypto.randomUUID();
    };
    add();
    bindForm(
      (d) => ({
        version: preview.request.version,
        start_at: new Date(d.start_at + "+07:00").toISOString(),
        end_at: new Date(d.end_at + "+07:00").toISOString(),
        allocations: [...document.querySelectorAll("[data-dispatch]")].map(
          (row) =>
            Object.fromEntries(
              [...row.querySelectorAll("[data-key]")].map((el) => [
                el.dataset.key,
                el.value,
              ]),
            ),
        ),
      }),
      "stock-requests/" + req.id + "/dispatch",
    );
  } catch (e) {
    openModal("Phân công kho", errorHTML(e));
  }
}
