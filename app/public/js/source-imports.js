(() => {
  const previousCreate = createForm;
  const field = inputField;
  const pick = (name, rows, text) =>
    field(name, "select", true, [{ id: "", name: text }, ...rows]);
  const today = calendarToday;
  const value = (name) => document.querySelector("#f-" + name)?.value || "";
  const notice = (r) =>
    '<div class="notice">' +
    (r.warnings || []).map(esc).join("<br>") +
    "</div>";
  function rowsAt(slot, title, items, section, fields, rows, manual = false) {
    const el = document.querySelector("#" + slot);
    if (!manual && !rows.length) {
      el.innerHTML =
        '<div class="notice">Nguồn không còn lượng đủ điều kiện để lấy.</div>';
      return;
    }
    const editor = lineEditor(title, items, section, fields, rows);
    el.innerHTML = editor.html;
    editor.mount();
  }
  function importer(work, slots) {
    let seq = 0;
    return async () => {
      const attempt = ++seq,
        form = document.querySelector("#data-form");
      for (const slot of slots)
        document.querySelector("#" + slot).innerHTML = "";
      const save = form.querySelector("[type=submit]");
      save.disabled = true;
      document.querySelector("#form-error").innerHTML = "";
      try {
        await work(() => attempt === seq && form.isConnected);
      } catch (e) {
        if (attempt === seq && form.isConnected)
          document.querySelector("#form-error").innerHTML = errorHTML(e);
      } finally {
        if (attempt === seq && form.isConnected) save.disabled = false;
      }
    };
  }
  async function preview(target, params) {
    return (
      await api("source-imports/" + target + "?" + new URLSearchParams(params))
    ).data;
  }
  createForm = async function () {
    if (
      !isMysql ||
      ![
        "production-plans",
        "production-reports",
        "purchase-orders",
        "lots",
        "stock-requests",
        "finished-reports",
      ].includes(current)
    )
      return previousCreate();
    try {
      const target = current;
      if (target === "finished-reports") return createFinishedPartForm();
      if (target === "production-plans") {
        const items = await options("items"),
          orders = await options("customer-orders"),
          workshops = await options("workshops");
        const mat = lineEditor(
          "nguyên vật liệu dự kiến (nhập lượng gốc, hệ thống cộng 10% một lần)",
          items.filter((i) => i.kind === "MATERIAL"),
          "materials",
          ["required_quantity"],
        );
        openModal(
          "Lập kế hoạch sản xuất từ đơn hàng",
          formWrap(
            pick("customer_order_id", orders, "Chọn đơn hàng đã tiếp nhận") +
              field("workshop_id", "select", true, workshops) +
              field("start_date", "date") +
              field("end_date", "date") +
              field("material_source", "select", true, [
                { id: "RECIPE", name: "Tự tính nguyên vật liệu theo công thức bánh" },
                { id: "MANUAL", name: "Nhập định lượng gốc thủ công" },
              ]) +
              '<div class="span2" id="import-info"></div><div class="span2" id="import-outputs"></div>' +
              '<div class="span2" id="manual-recipe">' +
              mat.html +
              '</div><div class="span2"><button type="button" class="button" id="recipe-estimate">Xem nguyên vật liệu theo công thức</button><div id="recipe-result"></div></div>',
          ),
        );
        mat.mount();
        const syncRecipe = () => {
          const manual = value("material_source") === "MANUAL";
          document.querySelector("#manual-recipe").hidden = !manual;
          document
            .querySelectorAll(
              "#manual-recipe input,#manual-recipe select,#manual-recipe button",
            )
            .forEach((e) => (e.disabled = !manual));
        };
        document.querySelector("#f-material_source").onchange = syncRecipe;
        syncRecipe();
        document.querySelector("#recipe-estimate").onclick = async () => {
          try {
            const r = (
              await api("production-plans/recipe-estimate", "POST", {
                outputs: readLines("outputs"),
              })
            ).data;
            document.querySelector("#recipe-result").innerHTML =
              "<p>" +
              esc(r.description) +
              "</p><pre>" +
              esc(
                r.formulas
                  .map(
                    (l) =>
                      `${l.product_name}: ${l.output_quantity} × ${l.per_unit_quantity} ${l.unit} ${l.item_name}`,
                  )
                  .join("\n"),
              ) +
              "</pre><p>Lưu kế hoạch sẽ cộng dự phòng 10% một lần vào tổng lượng gốc.</p>";
          } catch (e) {
            document.querySelector("#recipe-result").textContent = e.message;
          }
        };
        const load = importer(
          async (fresh) => {
            if (!value("customer_order_id")) return;
            const r = await preview(target, {
              source_id: value("customer_order_id"),
            });
            if (!fresh()) return;
            const startInput = document.querySelector('#f-start_date'), endInput = document.querySelector('#f-end_date');
            startInput.max = r.latest_delivery_date;
            endInput.max = r.latest_delivery_date;
            startInput.onchange = () => { endInput.min = startInput.value || calendarToday(); };
            document.querySelector("#import-info").innerHTML =
              notice(r) +
              "<dl><dt>Khách hàng</dt><dd>" +
              esc(r.customer_name || "") +
              "</dd><dt>Địa chỉ giao</dt><dd>" +
              esc(r.delivery_address || "") +
              "</dd><dt>Ngày muốn nhận</dt><dd>" +
              esc(r.latest_delivery_date || "") +
              "</dd><dt>Ghi chú khách hàng</dt><dd>" +
              esc(r.customer_note || "") +
              "</dd></dl>";
            rowsAt(
              "import-outputs",
              "Thành phẩm còn cần sản xuất",
              items.filter((i) => i.kind === "FINISHED_PRODUCT"),
              "outputs",
              ["quantity"],
              r.outputs,
            );
          },
          ["import-outputs", "import-info"],
        );
        document.querySelector("#f-customer_order_id").onchange = load;
        bindForm(
          (d) => ({
            ...d,
            outputs: readLines("outputs"),
            materials:
              d.material_source === "RECIPE"
                ? undefined
                : readLines("materials"),
          }),
          target,
        );
        return;
      }
      if (target === "production-reports") {
        const plans = (await options("production-plans")).filter((p) =>
            ["APPROVED", "IN_PROGRESS"].includes(p.status),
          ),
          items = (await options("items")).filter((i) => i.kind === "MATERIAL");
        openModal(
          "Báo cáo sản xuất từ kế hoạch",
          formWrap(
            pick("production_plan_id", plans, "Chọn kế hoạch sản xuất") +
              field("note", "textarea", false) +
              '<div class="span2" id="import-info"></div><div class="span2" id="import-lines"></div>',
          ),
        );
        document.querySelector("#f-production_plan_id").onchange = importer(
          async (fresh) => {
            if (!value("production_plan_id")) return;
            const r = await preview(target, {
              source_id: value("production_plan_id"),
            });
            if (!fresh()) return;
            document.querySelector("#import-info").innerHTML = notice(r);
            rowsAt(
              "import-lines",
              "Nhu cầu nguyên vật liệu thực tế — có thể điều chỉnh",
              items,
              "lines",
              ["required_quantity"],
              r.lines,
            );
          },
          ["import-lines", "import-info"],
        );
        bindForm((d) => ({ ...d, lines: readLines() }), target);
        return;
      }
      if (target === "purchase-orders") {
        const items = (await options('items')).filter(i => i.kind === 'MATERIAL');
        const suppliers = (await api('material-price-options')).data.suppliers;
        const materialOffers=(await api('material-prices?per_page=100')).data;
        const plans = (await api('source-imports/purchase-report-options')).data;
        openModal('Mua nguyên vật liệu', formWrap(
          field('source_mode','select',true,[{id:'PLAN',name:'Theo kế hoạch mua nguyên vật liệu đã duyệt'}]) +
          pick('business_plan_id',plans,'Chọn kế hoạch mua nguyên vật liệu') + field('expected_delivery_date','date') +
          field('delivery_terms','textarea') + '<div class="span2" id="import-info"></div><div class="span2" id="import-lines"></div>'
        ));
        function mountPurchaseLines(lines, planMode) {
          document.querySelector('#import-lines').innerHTML = '<h3>nguyên vật liệu cần mua — chọn nhà cung cấp cho từng loại</h3><div id="purchase-lines"></div>' + (planMode ? '' : '<button type="button" class="button small" id="add-purchase-line">＋ Thêm nguyên vật liệu</button>');
          function add(l = {}) {
            const row = document.createElement('div'); row.className='form-section'; row.dataset.section='lines';
            const allowedIds=new Set((materialOffers.find(m=>String(m.id)===String(l.item_id))?.supplier_prices||[]).map(p=>String(p.supplier_id)));
            const eligibleSuppliers=suppliers.filter(s=>allowedIds.has(String(s.id)));
            row.innerHTML = '<div class="form-grid"><div class="field"><label>Nguyên vật liệu / đơn vị *</label><select data-key="item_id" aria-label="Nguyên vật liệu" '+(planMode?'disabled':'')+'>'+items.map(i=>'<option value="'+esc(i.id)+'" '+(String(i.id)===String(l.item_id)?'selected':'')+'>'+esc(i.name+' · '+(i.unit || i.unit_name || ''))+'</option>').join('')+'</select></div>' +
              '<div class="field"><label>Số lượng *</label><input aria-label="Số lượng" data-key="quantity" type="number" min="0.001" step="0.001" required '+(planMode?'readonly':'')+' value="'+esc(numericInputValue(l.quantity || '1'))+'"></div>' +
              '<div class="field"><label>Nhà cung cấp *</label><select aria-label="Nhà cung cấp" data-key="supplier_id" required><option value="">'+(eligibleSuppliers.length?'Chọn nhà cung cấp phù hợp':'Chưa có nhà cung cấp cho nguyên vật liệu này')+'</option>'+eligibleSuppliers.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>').join('')+'</select><small class="supplier-coverage">'+eligibleSuppliers.map(s=>esc(s.name)+': '+esc((s.supplied_items||[]).map(i=>i.name).join(', '))).join('<br>')+'</small></div>' +
              '<div class="field"><label>Đơn giá mua *</label><input aria-label="Đơn giá mua" data-key="unit_price" type="number" min="0" step="0.0001" required value="'+esc(numericInputValue(l.unit_price || '0'))+'"></div></div>' +
              (planMode ? '<input type="hidden" data-key="business_plan_line_id" value="'+esc(l.id)+'">' : '<button class="button small danger" type="button">Xóa dòng</button>');
            if (!planMode) row.querySelector('button').onclick=()=>{row.remove();retryKey=crypto.randomUUID();};
            document.querySelector('#purchase-lines').append(row);
          }
          lines.forEach(add);
          if (!planMode) { if (!lines.length) add(); document.querySelector('#add-purchase-line').onclick=()=>add(); }
        }
        const sync = importer(async fresh => {
          const planMode=value('source_mode')==='PLAN', select=document.querySelector('#f-business_plan_id'), date=document.querySelector('#f-expected_delivery_date');
          select.disabled=!planMode;select.required=planMode;select.parentElement.hidden=!planMode;
          date.readOnly=planMode;
          if (!planMode) { mountPurchaseLines([],false); return; }
          if (!select.value) {date.value='';return;}
          const p=(await api('business-plans/'+select.value)).data;
          if(!fresh())return;
          date.value=p.planned_date;
          document.querySelector('#import-info').innerHTML='<div class="notice">Số lượng và ngày mong nhận nguyên vật liệu lấy từ kế hoạch '+esc(p.code)+'. Bộ phận mua hàng chọn NCC và giá cho từng dòng.</div>';
          mountPurchaseLines(p.lines,true);
        },['import-info','import-lines']);
        document.querySelector('#f-source_mode').onchange=()=>{document.querySelector('#f-business_plan_id').value='';document.querySelector('#f-expected_delivery_date').value='';return sync();};
        document.querySelector('#f-business_plan_id').onchange=sync;
        bindForm(d=>({source_mode:d.source_mode,...(d.source_mode==='PLAN'?{business_plan_id:d.business_plan_id}:{}),expected_delivery_date:d.expected_delivery_date,delivery_terms:d.delivery_terms,
          lines:readLines().map(l=>d.source_mode==='PLAN'?{business_plan_line_id:l.business_plan_line_id,quantity:l.quantity,supplier_id:l.supplier_id,unit_price:l.unit_price}:l)}),target);
        await sync();return;
      }      if (target === "lots") {
        const sourceLines = await options("purchase-order-lines"),
          orders = [
            ...new Map(
              sourceLines.map((l) => [
                String(l.purchase_order_id),
                {
                  id: String(l.purchase_order_id),
                  name: l.name.split(" / ")[0],
                },
              ]),
            ).values(),
          ];
        openModal(
          "Nhận nguyên vật liệu theo đơn mua",
          formWrap(
            pick("purchase_order_id", orders, "Chọn đơn mua") +
              field("code") +
              field("manufactured_date", "date", false) +
              field("expiry_date", "date", false) +
              '<div class="span2" id="import-info"></div><div class="span2" id="import-lines"></div>',
          ),
        );
        document.querySelector("#f-purchase_order_id").onchange = importer(
          async (fresh) => {
            if (!value("purchase_order_id")) return;
            const r = await preview(target, {
              source_id: value("purchase_order_id"),
            });
            if (!fresh()) return;
            const suppliers = [...new Map(r.lines.map(l => [l.supplier_id, {id:l.supplier_id,name:l.supplier_name || 'Nhà cung cấp'}])).values()];
            document.querySelector("#import-info").innerHTML = notice(r) + '<p>Mỗi lô thực nhận thuộc một nhà cung cấp.</p>' + field('receiving_supplier_id','select',true,suppliers);
            const draw = () => {
              const lines=r.lines.filter(l=>l.supplier_id===value('receiving_supplier_id'));
              rowsAt('import-lines','Lượng thực nhận theo NCC — điều chỉnh theo hàng giao',lines.map(l=>({id:l.item_id,name:l.item_name})), 'lines',['quantity'],lines);
            };
            document.querySelector('#f-receiving_supplier_id').onchange=draw;
            draw();
          },
          ["import-lines", "import-info"],
        );
        bindForm(
          (d) => ({
            code: d.code,
            lines: readLines().map((l) => ({
              purchase_order_line_id: l.item_id,
              received_quantity: l.quantity,
              ...(d.manufactured_date
                ? { manufactured_date: d.manufactured_date }
                : {}),
              ...(d.expiry_date ? { expiry_date: d.expiry_date } : {}),
            })),
          }),
          target,
        );
        return;
      }
      // Both material and finished-product dispatch use the same stock-request flow.
      const warehouses = await options("warehouses"),
        managers = await options("warehouse-managers"),
        reports = await options("production-reports"),
        finished = await options("finished-reports"),
        production = (await options("production-plans")).filter((p) =>
          ["APPROVED", "IN_PROGRESS"].includes(p.status),
        ),
        purchases = (await options("purchase-orders")).filter((p) =>
          ["PENDING", "PARTIALLY_RECEIVED"].includes(p.status),
        ),
        sales = (await options("business-plans")).filter(
          (p) => p.type === "SALE",
        );
      const items = await options("items");
      openModal(
        "Nhập / xuất kho theo nguồn",
        formWrap(
          field("purpose", "select", true, [
            { id: "PRODUCTION_ISSUE", name: "Xuất nguyên vật liệu để sản xuất" },
            { id: "SALE_ISSUE", name: "Xuất thành phẩm để bán" },
            { id: "PURCHASE_RECEIPT", name: "Nhập nguyên vật liệu đạt QC từ đơn mua" },
            { id: "PRODUCTION_RECEIPT", name: "Nhập thành phẩm đạt QC" },
            {
              id: "PARTIAL_PRODUCTION_RECEIPT",
              name: "Nhập thành phẩm từng phần — tự ghi số lượng",
            },
            { id: "MATERIAL_PURCHASE", name: "Yêu cầu mua bổ sung nguyên vật liệu" },
          ]) +
            field("production_source_mode", "select", true, [
              { id: "PLAN", name: "Lấy từ kế hoạch sản xuất" },
              { id: "REPORT", name: "Lấy từ báo cáo nhu cầu thực tế" },
            ]) +
            pick("production_plan_id", production, "Chọn kế hoạch sản xuất") +
            pick("production_report_id", reports, "Chọn báo cáo") +
            pick("purchase_order_id", purchases, "Chọn đơn mua") +
            pick("finished_report_id", finished, "Chọn báo cáo thành phẩm") +
            pick("business_plan_id", sales, "Chọn kế hoạch bán đã duyệt") +
            field(
              "workshop_id",
              "select",
              true,
              user.workshop_ids.map((id) => ({ id, name: "Xưởng " + id })),
            ) +
            field("warehouse_id", "select", true, warehouses) +
            field("manager_id", "select", true, managers) +
            field("requested_date", "date", true, [], today()) +
            field("note", "textarea", false) +
            '<div class="span2" id="import-info"></div><div class="span2" id="import-lines"></div>',
        ),
      );
      let previousPurpose = "";
      const sourceField = () =>
        ({
          PRODUCTION_ISSUE:
            value("production_source_mode") === "PLAN"
              ? "production_plan_id"
              : "production_report_id",
          PRODUCTION_RECEIPT: "production_report_id",
          PARTIAL_PRODUCTION_RECEIPT: "production_plan_id",
          SALE_ISSUE: "business_plan_id",
          PURCHASE_RECEIPT: "purchase_order_id",
          MATERIAL_PURCHASE: "production_report_id",
        })[value("purpose")];
      const load = importer(
        async (fresh) => {
          const purpose = value("purpose"),
            src = sourceField();
          if (previousPurpose !== purpose) {
            const el = document.querySelector("#f-production_report_id");
            el.innerHTML = pick(
              "production_report_id",
              purpose === "PRODUCTION_RECEIPT" ? finished : reports,
              "Chọn báo cáo",
            ).match(/<select[^>]*>([\s\S]*)<\/select>/)[1];
            previousPurpose = purpose;
          }
          for (const key of [
            "production_source_mode",
            "production_plan_id",
            "production_report_id",
            "purchase_order_id",
            "finished_report_id",
            "business_plan_id",
            "manager_id",
          ]) {
            const el = document.querySelector("#f-" + key),
              on =
                key === src ||
                (key === "production_source_mode" &&
                  purpose === "PRODUCTION_ISSUE") ||
                (key === "finished_report_id" && purpose === "SALE_ISSUE") ||
                (key === "manager_id" && purpose !== "MATERIAL_PURCHASE");
            el.disabled = !on;
            el.required = on;
            el.parentElement.hidden = !on;
          }
          if (purpose === "SALE_ISSUE") {
            const el = document.querySelector("#f-business_plan_id"),
              selected = el.value,
              available = sales.filter(
                (p) =>
                  String(p.finished_report_id) === value("finished_report_id"),
              );
            el.innerHTML = [{ id: "", name: "Chọn kế hoạch bán" }, ...available]
              .map(
                (p) =>
                  '<option value="' +
                  esc(p.id) +
                  '">' +
                  esc(p.name || p.code) +
                  "</option>",
              )
              .join("");
            if (available.some((p) => p.id === selected)) el.value = selected;
            else if (available.length === 1) el.value = available[0].id;
          }
          if (!value(src)) return;
          if (purpose === "PARTIAL_PRODUCTION_RECEIPT") {
            const plan = (await api("production-plans/" + value(src))).data;
            if (!fresh()) return;
            document.querySelector("#f-workshop_id").value = plan.workshop_id;
            document.querySelector("#import-info").innerHTML =
              '<div class="notice">Ghi lượng thực tế vừa sản xuất. Các đợt của kế hoạch dùng chung một lô; mỗi đợt có dòng lô riêng để QC. Chưa ghi tồn kho khi tạo yêu cầu. Quản lý chỉ phân công nhập phần đạt QC.</div>';
            rowsAt(
              "import-lines",
              "Thành phẩm đợt này",
              items.filter((i) =>
                plan.outputs.some((o) => String(o.item_id) === String(i.id)),
              ),
              "lines",
              ["quantity", "manufactured_date", "expiry_date"],
              plan.outputs.map((o) => ({
                item_id: o.item_id,
                quantity: "",
                manufactured_date: today(),
                expiry_date: "",
              })),
              true,
            );
            return;
          }
          const r = await preview(target, {
            source_id: value(src),
            purpose,
            production_source_mode:
              purpose === "PRODUCTION_ISSUE"
                ? value("production_source_mode")
                : "REPORT",
            workshop_id: value("workshop_id"),
            warehouse_id: value("warehouse_id"),
          });
          if (!fresh()) return;
          document.querySelector("#f-workshop_id").value = r.workshop_id;
          document.querySelector("#import-info").innerHTML =
            notice(r) +
            (r.evidence || [])
              .map(
                (e) =>
                  '<div class="notification">' +
                  esc(e.lot_code) +
                  " · QC " +
                  esc(labels[e.qc_status] || e.qc_status) +
                  " · khả dụng " +
                  esc(e.available_quantity) +
                  " · kiểm kê " +
                  esc(
                    e.stocktake
                      ? e.stocktake.code +
                          " / " +
                          (labels[e.stocktake.status] || e.stocktake.status) +
                          " · số đếm " +
                          (e.stocktake.actual_quantity ?? "chưa đếm") +
                          " · kết luận " +
                          (labels[e.stocktake.conclusion_status] ||
                            e.stocktake.conclusion_status ||
                            "—")
                      : "chưa có",
                  ) +
                  "</div>",
              )
              .join("");
          rowsAt(
            "import-lines",
            "Dòng nguồn còn lại — có thể điều chỉnh",
            items,
            "lines",
            ["quantity"],
            r.lines,
          );
        },
        ["import-lines", "import-info"],
      );
      for (const key of [
        "purpose",
        "production_source_mode",
        "production_plan_id",
        "production_report_id",
        "purchase_order_id",
        "finished_report_id",
        "business_plan_id",
        "warehouse_id",
        "workshop_id",
      ])
        document.querySelector("#f-" + key).onchange = load;
      bindForm(
        (d) => ({
          purpose:
            d.purpose === "PARTIAL_PRODUCTION_RECEIPT"
              ? "PRODUCTION_RECEIPT"
              : d.purpose,
          workshop_id: d.workshop_id,
          warehouse_id: d.warehouse_id,
          requested_date: d.requested_date,
          note: d.note,
          ...(d.purpose !== "MATERIAL_PURCHASE"
            ? { manager_id: d.manager_id }
            : {}),
          ...(d.purpose === "PRODUCTION_ISSUE"
            ? { production_source_mode: d.production_source_mode }
            : {}),
          ...(d.purpose === "PARTIAL_PRODUCTION_RECEIPT"
            ? { production_source_mode: "MANUAL", receipt_key: retryKey }
            : {}),
          [sourceField()]: d[sourceField()],
          lines: readLines(),
        }),
        target,
      );
      await load();
    } catch (e) {
      toast(e.message);
    }
  };
})();
