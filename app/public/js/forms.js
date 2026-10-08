function inputField(k, type = "text", required = true, opts = [], value = "") {
  return `<div class="field"><label for="f-${k}">${esc(fieldLabel(k))}${required ? " *" : ""}</label>${type === "select" ? `<select id="f-${k}" name="${k}" ${required ? "required" : ""}>${opts.map((o) => `<option value="${esc(o.id ?? o)}" ${String(o.id ?? o) === String(value) ? "selected" : ""}>${esc(o.name || labels[o] || o)}</option>`).join("")}</select>` : type === "textarea" ? `<textarea id="f-${k}" name="${k}" rows="3" ${required ? "required" : ""}>${esc(value)}</textarea>` : `<input id="f-${k}" name="${k}" type="${type}" ${required ? "required" : ""} ${type === "number" ? 'min="0" step="0.001"' : ""} value="${esc(value)}">`}</div>`;
}
async function options(resource) {
  return (await api("lookup/" + resource)).data;
}
function formWrap(html) {
  return `<form id="data-form"><div class="form-grid">${html}</div><div class="form-actions"><button type="button" class="button" id="cancel">Hủy</button><button type="submit" class="button primary">Lưu thông tin</button></div></form>`;
}
function bindForm(builder, path, method = "POST") {
  retryKey = crypto.randomUUID();
  const form = document.querySelector("#data-form"),
    resource = current;
  document.querySelector("#cancel").onclick = () => modal.close();
  form.oninput = () => (retryKey = crypto.randomUUID());
  form.onsubmit = async (e) => {
    e.preventDefault();
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    try {
      const body = builder(Object.fromEntries(new FormData(form)));
      await api(path, method, body, retryKey);
      modal.close();
      toast("Đã lưu thông tin thành công.");
      if (resource === current) loadTable();
    } catch (error) {
      const region = document.querySelector("#form-error");
      if (region) region.innerHTML = errorHTML(error);
      const key = Object.keys(error.fields || {})[0];
      const target = key
        ? form.querySelector(`[name="${CSS.escape(key)}"]`)
        : null;
      (target || form.querySelector("input,select,textarea"))?.focus();
    } finally {
      submit.disabled = false;
    }
  };
}
function lineEditor(
  title,
  items,
  section = "lines",
  fields = ["quantity"],
  initial = [],
) {
  return {
    html: `<div class="span2 form-section"><h3>${esc(title)}</h3><div id="${section}-rows"></div><button class="button small" type="button" id="add-${section}">＋ Thêm dòng</button></div>`,
    mount() {
      const add = (r = {}) => {
        const row = document.createElement("div");
        row.className = "line-row";
        row.dataset.section = section;
        row.innerHTML = `<div><label>Mặt hàng *</label><select data-key="item_id" aria-label="Mặt hàng">${items.map((i) => `<option value="${i.id}" ${r.item_id === i.id ? "selected" : ""}>${esc(i.name || i.item_name)}</option>`).join("")}</select></div>${fields.map((k) => `<div><label>${esc(fieldLabel(k))}${k === "expiry_date" ? "" : " *"}</label><input aria-label="${esc(fieldLabel(k))}" data-key="${k}" type="${k.includes("date") ? "date" : k === "lot_code" ? "text" : "number"}" value="${esc(r[k] ?? (k === "unit_price" ? "0" : k.includes("quantity") ? "1" : ""))}" ${k.includes("quantity") || k === "unit_price" ? 'min="0" step="0.001"' : ""} ${k === "expiry_date" ? "" : "required"}></div>`).join("")}<button class="button small danger" type="button" aria-label="Xóa dòng">✕</button>`;
        row.querySelector("button").onclick = () => {
          row.remove();
          retryKey = crypto.randomUUID();
        };
        document.querySelector("#" + section + "-rows").append(row);
        retryKey = crypto.randomUUID();
      };
      document.querySelector("#add-" + section).onclick = () => add();
      if (initial.length) initial.forEach(add);
      else add();
    },
  };
}
function readLines(section = "lines") {
  return [...document.querySelectorAll(`[data-section="${section}"]`)].map(
    (r) =>
      Object.fromEntries(
        [...r.querySelectorAll("[data-key]")]
          .filter((el) => el.value !== "")
          .map((el) => [el.dataset.key, el.value]),
      ),
  );
}
async function createForm() {
  openModal(
    "Tạo mới · " + moduleInfo()[1],
    '<div class="loading">Đang chuẩn bị biểu mẫu…</div>',
  );
  try {
    let html = "",
      editors = [],
      builder = (d) => d;
    const f = inputField;
    if (current === "customer-orders") {
      const items = (await api("sample-items")).data;
      if (!items.length) throw new Error("Chưa có thành phẩm mẫu để đặt hàng.");
      const e = lineEditor("Hàng mẫu cần đặt", items);
      editors.push(e);
      html =
        f("delivery_address") +
        f("latest_delivery_date", "date") +
        f("note", "textarea", false) +
        e.html;
      builder = (d) => ({ ...d, lines: readLines() });
    } else if (current === "business-plans") {
      const items = await options("items"),
        suppliers = await options("suppliers"),
        orders = await options("customer-orders"),
        customers = await options("customers");
      const e = lineEditor("Chi tiết kế hoạch", items, "lines", [
        "quantity",
        "unit_price",
      ]);
      editors.push(e);
      html =
        f("type", "select", true, ["PURCHASE", "SALE"]) +
        f("supplier_id", "select", false, [
          { id: "", name: "Chọn nếu mua" },
          ...suppliers,
        ]) +
        f("customer_order_id", "select", false, [
          { id: "", name: "Chọn nếu bán" },
          ...orders,
        ]) +
        f("customer_id", "select", false, [
          { id: "", name: "Chọn nếu bán" },
          ...customers,
        ]) +
        f("planned_date", "date") +
        f("note", "textarea", false) +
        e.html;
      builder = (d) => {
        const b = { ...d, lines: readLines() };
        if (b.type === "PURCHASE") {
          delete b.customer_id;
          delete b.customer_order_id;
        } else delete b.supplier_id;
        return b;
      };
    } else if (current === "purchase-orders") {
      html =
        f(
          "business_plan_id",
          "select",
          true,
          (await options("business-plans")).filter(
            (p) => p.status === "APPROVED",
          ),
        ) +
        f("expected_delivery_date", "date") +
        f("delivery_terms", "textarea");
    } else if (["categories", "warehouses", "suppliers"].includes(current)) {
      html =
        f("code") +
        f("name") +
        (current === "categories"
          ? f("description", "textarea", false)
          : f("address", "textarea", false));
      if (current === "suppliers")
        html += f("phone", "text", false) + f("email", "email", false);
    } else if (current === "warehouse-locations")
      html =
        f("code") +
        f("name") +
        f("warehouse_id", "select", true, await options("warehouses"));
    else if (current === "items") {
      html =
        f("code") +
        f("name") +
        f("kind", "select", true, ["MATERIAL", "FINISHED_PRODUCT"]) +
        f("category_id", "select", true, await options("categories")) +
        f("unit_id", "select", true, await options("units")) +
        f("reference_price", "number") +
        f("is_sample", "select", true, [
          { id: "false", name: "Không" },
          { id: "true", name: "Có" },
        ]) +
        f("is_published", "select", true, [
          { id: "true", name: "Có" },
          { id: "false", name: "Không" },
        ]);
      builder = (d) => ({
        ...d,
        is_sample: d.is_sample === "true",
        is_published: d.is_published === "true",
        is_active: true,
      });
    } else if (current === "lots") {
      const purchase = await options("purchase-orders");
      html =
        f("code") +
        f("purchase_order_id", "select", true, purchase) +
        f(
          "purchase_order_line_id",
          "select",
          true,
          purchase.flatMap((p) =>
            (p.lines || []).map((l) => ({
              id: l.id,
              name: `${p.code} · ${l.item_name} (${l.quantity})`,
            })),
          ),
        ) +
        f("received_quantity", "number") +
        f("manufactured_date", "date", false) +
        f("expiry_date", "date", false);
      builder = (d) =>
        Object.fromEntries(Object.entries(d).filter(([, v]) => v !== ""));
    } else if (current === "stock-requests") {
      html =
        f("purpose", "select", true, [
          { id: "PURCHASE_RECEIPT", name: "Nhận hàng mua" },
          { id: "PRODUCTION_RECEIPT", name: "Nhập thành phẩm sản xuất" },
          { id: "PRODUCTION_ISSUE", name: "Cấp nguyên liệu sản xuất" },
          { id: "SALE_ISSUE", name: "Giao thành phẩm bán" },
        ]) +
        f("warehouse_id", "select", true, await options("warehouses")) +
        f(
          "workshop_id",
          "select",
          true,
          user.workshop_ids.map((id) => ({ id, name: "Xưởng " + id })),
        ) +
        f("requested_date", "date") +
        f("purchase_order_id", "select", false, [
          { id: "", name: "Chọn đơn mua" },
          ...(await options("purchase-orders")),
        ]) +
        f("business_plan_id", "select", false, [
          { id: "", name: "Chọn kế hoạch bán" },
          ...(await options("business-plans")),
        ]) +
        f("production_plan_id", "select", false, [
          { id: "", name: "Chọn kế hoạch sản xuất" },
          ...(await options("production-plans")),
        ]) +
        f("note", "textarea", false) +
        '<div class="span2 notice">Chọn nguồn rồi bấm “Lấy dòng nguồn”. Số lượng có thể điều chỉnh trong giới hạn chứng từ.</div><button type="button" class="button" id="source-lines">Lấy dòng nguồn</button><div class="span2" id="source-editor"></div>';
      builder = (d) => {
        const b = { ...d, lines: readLines() };
        const sourceField = {
          PURCHASE_RECEIPT: "purchase_order_id",
          SALE_ISSUE: "business_plan_id",
          PRODUCTION_RECEIPT: "production_plan_id",
          PRODUCTION_ISSUE: "production_plan_id",
        }[d.purpose];
        for (const k of [
          "purchase_order_id",
          "business_plan_id",
          "production_plan_id",
        ])
          if (k !== sourceField) delete b[k];
        return b;
      };
    } else if (current === "qc-inspections") {
      const lots = await options("lots");
      html =
        f("inspected_at", "datetime-local") +
        f("note", "textarea", false) +
        f("lot_id", "select", true, lots) +
        f("inspected_quantity", "number") +
        f("passed_quantity", "number") +
        f("failed_quantity", "number") +
        f("issue", "textarea", false);
      builder = (d) => ({
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
      });
    } else if (current === "production-plans") {
      const items = await options("items");
      const out = lineEditor(
          "Thành phẩm dự kiến",
          items.filter((i) => i.kind === "FINISHED_PRODUCT"),
          "outputs",
        ),
        mat = lineEditor(
          "Nguyên liệu cần dùng",
          items.filter((i) => i.kind === "MATERIAL"),
          "materials",
          ["required_quantity"],
        );
      editors.push(out, mat);
      html =
        f(
          "customer_order_id",
          "select",
          true,
          await options("customer-orders"),
        ) +
        f("workshop_id", "select", true, [
          { id: "1", name: "Xưởng 1" },
          { id: "2", name: "Xưởng 2" },
        ]) +
        f("start_date", "date") +
        f("end_date", "date") +
        out.html +
        mat.html;
      builder = (d) => ({
        ...d,
        outputs: readLines("outputs"),
        materials: readLines("materials"),
      });
    } else if (
      current === "production-reports" ||
      current === "finished-reports"
    ) {
      const plans = await options("production-plans");
      const materials = plans
        .flatMap((p) => p.materials || [])
        .filter((v, i, a) => a.findIndex((x) => x.item_id === v.item_id) === i)
        .map((i) => ({ id: i.item_id, name: i.item_name }));
      const outputs = plans
        .flatMap((p) => p.outputs || [])
        .filter((v, i, a) => a.findIndex((x) => x.item_id === v.item_id) === i)
        .map((i) => ({ id: i.item_id, name: i.item_name }));
      html =
        f("production_plan_id", "select", true, plans) +
        f("note", "textarea", false);
      if (current === "production-reports") {
        const e = lineEditor(
          "Nguyên liệu hiện có / nhu cầu",
          materials,
          "lines",
          ["available_quantity", "required_quantity"],
        );
        editors.push(e);
        html += e.html;
        builder = (d) => ({ ...d, lines: readLines() });
      } else {
        const out = lineEditor("Lô thành phẩm", outputs, "outputs", [
            "quantity",
            "lot_code",
            "manufactured_date",
            "expiry_date",
          ]),
          mat = lineEditor("Nguyên liệu sử dụng", materials, "materials", [
            "used_quantity",
          ]);
        editors.push(out, mat);
        html += f("completed_date", "date") + out.html + mat.html;
        builder = (d) => ({
          ...d,
          outputs: readLines("outputs"),
          materials: readLines("materials"),
        });
      }
    } else if (current === "stocktakes") {
      const ws = await options("warehouses"),
        users = (await options("users")).filter((u) =>
          u.roles.includes("STOCKTAKER"),
        );
      html =
        f("planned_date", "date") +
        f("start_at", "datetime-local") +
        f("end_at", "datetime-local") +
        f("warehouse_id", "select", true, ws) +
        f("assignee_ids", "select", true, users) +
        f("note", "textarea", false);
      builder = (d) => ({
        planned_date: d.planned_date,
        start_at: new Date(d.start_at + "+07:00").toISOString(),
        end_at: new Date(d.end_at + "+07:00").toISOString(),
        note: d.note,
        warehouses: [
          { warehouse_id: d.warehouse_id, assignee_ids: [d.assignee_ids] },
        ],
      });
    } else if (current === "stocktake-minutes") {
      const rows = (await api("stocktakes")).data;
      html =
        f(
          "stocktake_id",
          "select",
          true,
          rows.map((r) => ({ id: r.id, name: r.code })),
        ) +
        f("warehouse_id") +
        f("remarks", "textarea");
    } else if (current === "exception-proposals") {
      const rows = (await api("stocktake-differences")).data;
      html =
        f(
          "difference",
          "select",
          true,
          rows.map((r) => ({
            id: r.id,
            name: `Kho ${r.warehouse_id} · Hàng ${r.item_id} · ${r.system_quantity} → ${r.actual_quantity}`,
          })),
        ) +
        f("reason", "textarea") +
        f("resolution_note", "textarea");
      builder = (d) => {
        const r = rows.find((r) => r.id === d.difference);
        if (!r) throw new Error("Chưa có chênh lệch để đề xuất.");
        return {
          stocktake_id: r.stocktake_id,
          warehouse_id: r.warehouse_id,
          stocktake_line_id: r.id,
          reason: d.reason,
          resolution_note: d.resolution_note,
        };
      };
    } else if (current === "tasks") {
      html =
        f("title") +
        f("priority", "select", true, ["LOW", "NORMAL", "HIGH"]) +
        f("start_at", "datetime-local") +
        f("end_at", "datetime-local") +
        f("assignee_ids", "select", true, await options("users")) +
        f("description", "textarea", false);
      builder = (d) => ({
        ...d,
        start_at: new Date(d.start_at + "+07:00").toISOString(),
        end_at: new Date(d.end_at + "+07:00").toISOString(),
        assignee_ids: [d.assignee_ids],
      });
    } else throw new Error("Biểu mẫu này chưa được hỗ trợ.");
    openModal("Tạo mới · " + moduleInfo()[1], formWrap(html));
    editors.forEach((e) => e.mount());
    bindForm(builder, current);
    if (current === "business-plans") {
      const sync = () => {
        const purchase = document.querySelector("#f-type").value === "PURCHASE";
        for (const k of ["supplier_id", "customer_id", "customer_order_id"]) {
          const el = document.querySelector("#f-" + k);
          el.required = k === "supplier_id" ? purchase : !purchase;
          el.disabled = k === "supplier_id" ? !purchase : purchase;
        }
      };
      document.querySelector("#f-type").addEventListener("change", sync);
      sync();
    }
    if (current === "stock-requests")
      document.querySelector("#source-lines").onclick = async () => {
        try {
          const d = Object.fromEntries(
              new FormData(document.querySelector("#data-form")),
            ),
            specs = {
              PURCHASE_RECEIPT: ["purchase-orders", d.purchase_order_id],
              SALE_ISSUE: ["business-plans", d.business_plan_id],
              PRODUCTION_RECEIPT: ["production-plans", d.production_plan_id],
              PRODUCTION_ISSUE: ["production-plans", d.production_plan_id],
            },
            [resource, id] = specs[d.purpose],
            source = (await api(resource + "/" + id)).data,
            lines =
              source.lines ||
              (d.purpose === "PRODUCTION_ISSUE"
                ? source.materials
                : source.outputs),
            e = lineEditor(
              "Dòng từ " + source.code,
              lines.map((l) => ({ id: l.item_id, name: l.item_name })),
              "lines",
              ["quantity"],
              lines.map((l) => ({
                ...l,
                quantity: l.required_quantity || l.quantity,
              })),
            );
          document.querySelector("#source-editor").innerHTML = e.html;
          e.mount();
        } catch (error) {
          document.querySelector("#form-error").innerHTML = errorHTML(error);
        }
      };
  } catch (e) {
    openModal("Không thể tạo chứng từ", errorHTML(e));
  }
}
async function actionForm(r, action) {
  if (action === "post") return postForm(r);
  if (action === "edit") return editForm(r);
  let html = "",
    builder = (d) => ({ version: r.version, ...d }),
    method = "POST",
    path = current + "/" + r.id + "/" + action;
  const f = inputField;
  if (action === "review")
    html =
      '<div class="span2 notice">Phê duyệt sẽ khóa nội dung chứng từ. Từ chối cần nhập lý do.</div>' +
      f("decision", "select", true, [
        { id: "APPROVE", name: "Phê duyệt" },
        { id: "REJECT", name: "Từ chối" },
      ]) +
      f("reason", "textarea", false);
  else if (action === "progress")
    html = f(
      "status",
      "select",
      true,
      r.status === "PLANNED" ? ["IN_PROGRESS"] : ["COMPLETED"],
    );
  else if (action === "delete") {
    html = `<div class="span2 notice">Xác nhận hủy / xóa ${esc(r.code)}? Chứng từ đã sử dụng được hệ thống bảo vệ.</div>`;
    method = "DELETE";
    path = current + "/" + r.id;
  } else if (action === "edit") {
    method = "PATCH";
    path = current + "/" + r.id;
    if (
      [
        "categories",
        "warehouses",
        "warehouse-locations",
        "suppliers",
        "items",
      ].includes(current)
    )
      html =
        f("name", "text", true, [], r.name) +
        (current === "categories" || current === "items"
          ? f("description", "textarea", false, [], r.description || "")
          : "");
    else if (current === "lots")
      html =
        f("manufactured_date", "date", false, [], r.manufactured_date || "") +
        f("expiry_date", "date", false, [], r.expiry_date || "");
    else if (current === "customer-orders")
      html =
        f("delivery_address", "text", true, [], r.delivery_address) +
        f("latest_delivery_date", "date", true, [], r.latest_delivery_date) +
        f("note", "textarea", false, [], r.note || "");
    else if (current === "stocktake-minutes")
      html = f("remarks", "textarea", true, [], r.remarks);
    else if (current === "tasks") {
      html =
        f("title", "text", true, [], r.title) +
        f("start_at", "datetime-local", true, [], localInput(r.start_at)) +
        f("end_at", "datetime-local", true, [], localInput(r.end_at));
      builder = (d) => ({
        version: r.version,
        ...d,
        start_at: new Date(d.start_at + "+07:00").toISOString(),
        end_at: new Date(d.end_at + "+07:00").toISOString(),
      });
    } else html = f("note", "textarea", false, [], r.note || "");
  } else
    html = `<div class="span2 notice">Xác nhận ${esc({ receive: "tiếp nhận đơn", submit: "gửi chứng từ", start: "bắt đầu kiểm kê và khóa kho", close: "đóng đợt kiểm kê và mở kho" }[action] || action)} ${esc(r.code)}?</div>`;
  openModal(
    r.code +
      " · " +
      ({ review: "Phê duyệt", edit: "Sửa thông tin", delete: "Hủy / Xóa" }[
        action
      ] || action),
    formWrap(html),
  );
  bindForm(builder, path, method);
}
function localInput(v) {
  return v
    ? new Date(Date.parse(v) + 7 * 3600000).toISOString().slice(0, 16)
    : "";
}
async function postForm(r) {
  openModal(
    "Ghi phiếu · " + r.code,
    '<div class="loading">Đang tải phân bổ…</div>',
  );
  try {
    const p = (
      await api(
        "stock-requests/" +
          r.id +
          "/allocations" +
          (r.assigned_task_id ? "?task_id=" + r.assigned_task_id : ""),
      )
    ).data;
    if (p.frozen) throw new Error("Kho đang bị khóa để kiểm kê.");
    openModal(
      "Ghi phiếu " + (r.type === "IN" ? "nhập" : "xuất") + " · " + r.code,
      `<div class="notice">Chọn lô và vị trí cho từng dòng. Có thể ghi một phần; số lượng 0 được bỏ qua. Phiếu đã ghi sổ chỉ được xem.</div><form id="data-form">${p.lines.map((l, i) => `<div class="form-section" data-allocation="${l.id}"><h3>${esc(l.item_name)} · Còn ${format(l.remaining_quantity)} ${esc(l.unit)}</h3><div class="form-grid"><div class="field"><label for="lot-${i}">Lô</label><select id="lot-${i}" data-key="lot_id">${l.lots.map((t) => `<option value="${t.id}">${esc(t.code)} · ${esc(labels[t.qc_status])}</option>`).join("")}</select></div><div class="field"><label for="loc-${i}">Vị trí</label><select id="loc-${i}" data-key="location_id">${l.locations.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></div><div class="field"><label for="bucket-${i}">Chất lượng</label><select id="bucket-${i}" data-key="quality_bucket"><option value="AVAILABLE">Khả dụng</option>${r.type === "IN" ? '<option value="QUARANTINE">Cách ly</option>' : ""}</select></div><div class="field"><label for="qty-${i}">Số lượng</label><input id="qty-${i}" data-key="quantity" type="number" min="0" step="0.001" value="0" required></div></div><p class="hint">Tồn hiện tại: ${esc(l.balances.map((b) => `Lô ${b.lot_id} / vị trí ${b.location_id} / ${labels[b.quality_bucket]}: ${b.quantity}`).join("; ") || "Chưa có tồn")}</p></div>`).join("")}<div class="form-actions"><button class="button" id="cancel" type="button">Hủy</button><button class="button primary" type="submit">Xác nhận ghi sổ</button></div></form>`,
    );
    bindForm(
      () => ({
        stock_request_id: r.id,
        ...(r.assigned_task_id ? { task_id: r.assigned_task_id } : {}),
        request_version: p.request.version,
        allocations: [...document.querySelectorAll("[data-allocation]")]
          .map((row) => ({
            stock_request_line_id: row.dataset.allocation,
            ...Object.fromEntries(
              [...row.querySelectorAll("[data-key]")].map((el) => [
                el.dataset.key,
                el.value,
              ]),
            ),
          }))
          .filter((a) => Number(a.quantity) > 0),
      }),
      "stock-documents",
    );
  } catch (e) {
    openModal("Ghi phiếu", errorHTML(e));
  }
}
async function countForm(st, warehouse) {
  try {
    const w = (await api(`stocktakes/${st.id}/warehouses/${warehouse}/lines`))
      .data;
    openModal(
      `Kiểm đếm · Kho ${warehouse}`,
      `<div class="notice">Số 0 là đã đếm và không có hàng; trống là chưa đếm. Kho chỉ mở lại sau xử lý chênh lệch và đóng đợt.</div><form id="count-form"><div class="table-wrap"><table><thead><tr><th>Hàng / Lô / Vị trí</th><th>Snapshot</th><th>Thực tế</th></tr></thead><tbody>${w.lines.map((l, i) => `<tr><td>${esc(l.item_id)} / ${esc(l.lot_id)} / ${esc(l.location_id)} · ${badge(l.quality_bucket)}</td><td>${format(l.system_quantity)}</td><td><input type="number" min="0" step="0.001" aria-label="Số đếm dòng ${i + 1}" data-id="${l.id}" data-version="${l.version}" value="${esc(l.actual_quantity ?? "")}" ${w.status !== "COUNTING" ? "disabled" : ""}></td></tr>`).join("")}</tbody></table></div><div class="form-actions">${w.status === "COUNTING" ? '<button class="button" type="submit">Lưu số đếm</button><button class="button primary" type="button" id="complete-count">Hoàn tất đếm</button>' : '<span class="subtitle">Đã hoàn tất đếm. Có thể lập biên bản.</span>'}</div></form>`,
    );
    const form = document.querySelector("#count-form");
    form.oninput = () => {
      const complete = document.querySelector("#complete-count");
      if (complete) complete.disabled = true;
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      btn.disabled = true;
      const lines = [...modalBody.querySelectorAll("input[data-id]")]
        .filter((el) => el.value !== "")
        .map((el) => ({
          id: el.dataset.id,
          version: Number(el.dataset.version),
          actual_quantity: el.value,
        }));
      try {
        await api(
          `stocktakes/${st.id}/warehouses/${warehouse}/counts`,
          "PATCH",
          { lines },
        );
        toast("Đã lưu số đếm.");
        countForm(st, warehouse);
      } catch (err) {
        document.querySelector("#form-error").innerHTML = errorHTML(err);
        btn.disabled = false;
      }
    };
    let completeKey = crypto.randomUUID();
    if (document.querySelector("#complete-count"))
      document.querySelector("#complete-count").onclick = async (e) => {
        e.target.disabled = true;
        try {
          await api(
            `stocktakes/${st.id}/warehouses/${warehouse}/complete`,
            "POST",
            { version: w.version },
            completeKey,
          );
          modal.close();
          toast("Đã hoàn tất đếm.");
          loadTable();
        } catch (err) {
          document.querySelector("#form-error").innerHTML = errorHTML(err);
          e.target.disabled = false;
        }
      };
  } catch (e) {
    openModal("Kiểm đếm", errorHTML(e));
  }
}
async function editForm(r) {
  try {
    const f = inputField;
    let html = "",
      editors = [],
      builder = (d) => ({ version: r.version, ...d });
    if (
      [
        "categories",
        "warehouses",
        "warehouse-locations",
        "suppliers",
        "items",
        "lots",
      ].includes(current)
    ) {
      const fields = {
        categories: ["name", "description"],
        warehouses: ["name", "address"],
        "warehouse-locations": ["name"],
        suppliers: ["name", "phone", "email", "address", "tax_code"],
        items: ["name", "description", "reference_price"],
        lots: ["manufactured_date", "expiry_date"],
      }[current];
      html = fields
        .map((k) =>
          f(
            k,
            k.includes("date")
              ? "date"
              : k === "reference_price"
                ? "number"
                : k === "description"
                  ? "textarea"
                  : "text",
            k === "name" || k === "reference_price",
            [],
            r[k] || "",
          ),
        )
        .join("");
      if (current !== "lots")
        html += f(
          "is_active",
          "select",
          true,
          [
            { id: "true", name: "Có" },
            { id: "false", name: "Không" },
          ],
          String(r.is_active),
        );
      if (current === "items")
        html +=
          f(
            "is_sample",
            "select",
            true,
            [
              { id: "true", name: "Có" },
              { id: "false", name: "Không" },
            ],
            String(r.is_sample),
          ) +
          f(
            "is_published",
            "select",
            true,
            [
              { id: "true", name: "Có" },
              { id: "false", name: "Không" },
            ],
            String(r.is_published),
          );
      builder = (d) => ({
        version: r.version,
        ...Object.fromEntries(
          Object.entries(d)
            .filter(([k, v]) => v !== "" || !k.includes("date"))
            .map(([k, v]) => [k, k.startsWith("is_") ? v === "true" : v]),
        ),
      });
    } else if (current === "customer-orders") {
      const items = (await api("sample-items")).data;
      const e = lineEditor(
        "Chi tiết đơn hàng",
        items,
        "lines",
        ["quantity"],
        r.lines,
      );
      editors.push(e);
      html =
        f("delivery_address", "text", true, [], r.delivery_address) +
        f("latest_delivery_date", "date", true, [], r.latest_delivery_date) +
        f("note", "textarea", false, [], r.note || "") +
        e.html +
        '<div class="span2 notice">Thay đổi số lượng có thể ảnh hưởng thời gian giao hàng và điều khoản đền bù. Xác nhận sau khi đã kiểm tra yêu cầu.</div><div class="span2"><label><input type="checkbox" name="quantity_change_acknowledged" required> Tôi xác nhận thay đổi số lượng.</label></div>';
      builder = (d) => ({
        version: r.version,
        ...d,
        quantity_change_acknowledged: true,
        lines: readLines(),
      });
    } else if (current === "business-plans") {
      const e = lineEditor(
        "Chi tiết kế hoạch",
        await options("items"),
        "lines",
        ["quantity", "unit_price"],
        r.lines,
      );
      editors.push(e);
      html =
        f("planned_date", "date", true, [], r.planned_date) +
        f("note", "textarea", false, [], r.note || "") +
        (r.type === "PURCHASE"
          ? f(
              "supplier_id",
              "select",
              true,
              await options("suppliers"),
              r.supplier_id,
            )
          : "") +
        e.html;
      builder = (d) => ({ version: r.version, ...d, lines: readLines() });
    } else if (current === "stock-requests") {
      const source = r.purchase_order_id
        ? (await api("purchase-orders/" + r.purchase_order_id)).data
        : r.business_plan_id
          ? (await api("business-plans/" + r.business_plan_id)).data
          : (await api("production-plans/" + r.production_plan_id)).data;
      const src =
        source.lines ||
        (r.purpose === "PRODUCTION_ISSUE" ? source.materials : source.outputs);
      const e = lineEditor(
        "Dòng từ chứng từ nguồn",
        src.map((l) => ({ id: l.item_id, name: l.item_name })),
        "lines",
        ["quantity"],
        r.lines,
      );
      editors.push(e);
      html =
        f("requested_date", "date", true, [], r.requested_date) +
        f(
          "warehouse_id",
          "select",
          true,
          await options("warehouses"),
          r.warehouse_id,
        ) +
        f("note", "textarea", false, [], r.note || "") +
        e.html;
      builder = (d) => ({ version: r.version, ...d, lines: readLines() });
    } else if (current === "production-plans") {
      const items = await options("items"),
        out = lineEditor(
          "Thành phẩm dự kiến",
          items.filter((i) => i.kind === "FINISHED_PRODUCT"),
          "outputs",
          ["quantity"],
          r.outputs,
        ),
        mat = lineEditor(
          "Nguyên liệu cần dùng",
          items.filter((i) => i.kind === "MATERIAL"),
          "materials",
          ["required_quantity"],
          r.materials,
        );
      editors.push(out, mat);
      html =
        f("start_date", "date", true, [], r.start_date) +
        f("end_date", "date", true, [], r.end_date) +
        f("note", "textarea", false, [], r.note || "") +
        out.html +
        mat.html;
      builder = (d) => ({
        version: r.version,
        ...d,
        outputs: readLines("outputs"),
        materials: readLines("materials"),
      });
    } else if (
      current === "production-reports" ||
      current === "finished-reports"
    ) {
      const p = (await api("production-plans/" + r.production_plan_id)).data;
      const mats = p.materials.map((l) => ({
          id: l.item_id,
          name: l.item_name,
        })),
        outs = p.outputs.map((l) => ({ id: l.item_id, name: l.item_name }));
      html = f("note", "textarea", false, [], r.note || "");
      if (current === "production-reports") {
        const e = lineEditor(
          "Nguyên liệu hiện có / nhu cầu",
          mats,
          "lines",
          ["available_quantity", "required_quantity"],
          r.lines,
        );
        editors.push(e);
        html += e.html;
        builder = (d) => ({ version: r.version, ...d, lines: readLines() });
      } else {
        const o = lineEditor(
            "Lô thành phẩm",
            outs,
            "outputs",
            ["quantity", "lot_code", "manufactured_date", "expiry_date"],
            r.outputs,
          ),
          m = lineEditor(
            "Nguyên liệu sử dụng",
            mats,
            "materials",
            ["used_quantity"],
            r.materials,
          );
        editors.push(o, m);
        html +=
          f("completed_date", "date", true, [], r.completed_date) +
          o.html +
          m.html;
        builder = (d) => ({
          version: r.version,
          ...d,
          outputs: readLines("outputs"),
          materials: readLines("materials"),
        });
      }
    } else if (current === "qc-inspections") {
      html =
        f(
          "inspected_at",
          "datetime-local",
          true,
          [],
          localInput(r.inspected_at),
        ) + f("note", "textarea", false, [], r.note || "");
      html +=
        '<div class="span2">' +
        r.lines
          .map(
            (l, i) =>
              `<div class="form-section" data-qc="${l.lot_id}"><h3>Lô ${esc(l.lot_id)}</h3><div class="form-grid">${["inspected_quantity", "passed_quantity", "failed_quantity", "issue"].map((k) => `<div class="field"><label for="qc-${i}-${k}">${fieldLabel(k)}</label><input id="qc-${i}-${k}" data-key="${k}" type="${k === "issue" ? "text" : "number"}" ${k === "issue" ? "" : 'min="0" step="0.001" required'} value="${esc(l[k] || "")}"></div>`).join("")}</div></div>`,
          )
          .join("") +
        "</div>";
      builder = (d) => ({
        version: r.version,
        inspected_at: new Date(d.inspected_at + "+07:00").toISOString(),
        note: d.note,
        lines: [...document.querySelectorAll("[data-qc]")].map((el) => ({
          lot_id: el.dataset.qc,
          ...Object.fromEntries(
            [...el.querySelectorAll("[data-key]")].map((input) => [
              input.dataset.key,
              input.value,
            ]),
          ),
        })),
      });
    } else if (current === "tasks") {
      html =
        f("title", "text", true, [], r.title) +
        f("start_at", "datetime-local", true, [], localInput(r.start_at)) +
        f("end_at", "datetime-local", true, [], localInput(r.end_at)) +
        f(
          "assignee_ids",
          "select",
          true,
          await options("users"),
          r.assignee_ids[0],
        ) +
        f("description", "textarea", false, [], r.description || "");
      builder = (d) => ({
        version: r.version,
        ...d,
        start_at: new Date(d.start_at + "+07:00").toISOString(),
        end_at: new Date(d.end_at + "+07:00").toISOString(),
        assignee_ids: [d.assignee_ids],
      });
    } else if (current === "stocktake-minutes")
      html = f("remarks", "textarea", true, [], r.remarks);
    else throw new Error("Không được sửa chứng từ này.");
    openModal("Sửa · " + r.code, formWrap(html));
    editors.forEach((e) => e.mount());
    bindForm(builder, current + "/" + r.id, "PATCH");
  } catch (e) {
    openModal("Sửa chứng từ", errorHTML(e));
  }
}
