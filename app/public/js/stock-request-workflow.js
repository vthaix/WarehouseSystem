// =============================================================================
// GIAO DIỆN YÊU CẦU NHẬP / XUẤT KHO
//   createForm  UC-23   Chủ xưởng gửi yêu cầu nhập/xuất
//   editForm    UC-24.1 Chủ xưởng sửa yêu cầu
//   postForm    UC-10/11 Nhân viên kho ghi phiếu nhập/xuất theo phần được giao
//
// Cách các file JS phối hợp: app.js định nghĩa createForm/editForm/postForm
// mặc định; mỗi file sau "bọc" lại hàm đó: xử lý trường hợp của mình, còn lại
// gọi về hàm cũ (previousCreate…). File này chỉ xử lý trang stock-requests.
// =============================================================================
(() => {
  const previousCreate = createForm;
  const previousEdit = editForm;
  const previousPost = postForm;

  /** Giá trị ô nhập có id "f-<key>" trong form đang mở. */
  const value = (key) => document.querySelector("#f-" + key)?.value;
  const $ = (selector) => document.querySelector(selector);

  /** Mục đích theo hướng nhập/xuất. */
  const PURPOSES = {
    IN: [
      { id: "PURCHASE_RECEIPT", name: "Nhập nguyên vật liệu từ kế hoạch mua" },
      { id: "PRODUCTION_RECEIPT", name: "Nhập thành phẩm từ báo cáo thành phẩm" },
    ],
    OUT: [
      { id: "PRODUCTION_ISSUE", name: "Xuất nguyên vật liệu để sản xuất" },
      { id: "SALE_ISSUE", name: "Xuất thành phẩm để giao hàng" },
    ],
  };
  const SOURCE_LABEL = {
    PURCHASE_RECEIPT: "Kế hoạch mua nguyên vật liệu",
    PRODUCTION_RECEIPT: "Báo cáo thành phẩm",
  };
  const optionsHTML = (rows, label = (row) => row.code) =>
    rows.map((row) => '<option value="' + esc(row.id) + '">' + esc(label(row)) + "</option>").join("");

  /** Ngày giờ trên ô datetime-local (giờ Việt Nam) → ISO UTC. */
  const toIso = (local) => new Date(local + "+07:00").toISOString();

  /** Khóa các dòng hàng: không thêm/xóa mặt hàng, chỉ sửa số lượng. */
  function lockLineItems(maxByItem = null) {
    $("#add-request-lines")?.remove();
    for (const row of document.querySelectorAll("#request-lines-rows .line-row")) {
      row.querySelector("button").remove();
      const item = row.querySelector("select");
      item.disabled = true;
      if (maxByItem) row.querySelector('[data-key="quantity"]').max = maxByItem.get(item.value);
    }
  }

  /** Dòng hàng có số lượng > 0 để gửi lên API. */
  const requestLines = () => readLines("request-lines").filter((line) => Number(line.quantity) > 0);

  // ---------------------------------------------------------------------------
  // UC-23: form gửi yêu cầu
  // Luồng: chọn Nhập/Xuất → chọn mục đích → chọn nguồn (KHSX, kế hoạch mua,
  // báo cáo) → hệ thống tải lượng còn được yêu cầu → chủ xưởng nhập số lượng.
  // ---------------------------------------------------------------------------
  createForm = async function () {
    if (!isMysql || current !== "stock-requests") return previousCreate();
    try {
      const [sources, warehouses, managers, items] = await Promise.all([
        api("stock-request-workflow-sources").then((r) => r.data),
        options("warehouses"),
        options("warehouse-managers"),
        options("items"),
      ]);
      openRequestModal(sources, warehouses, managers);
      await setupRequestForm(sources, warehouses, items);
    } catch (e) {
      openModal("Không thể lập yêu cầu kho", errorHTML(e));
    }
  };

  function openRequestModal(sources, warehouses, managers) {
    openModal(
      "Gửi yêu cầu nhập / xuất kho",
      formWrap(
        inputField("request_direction", "select", true, [{ id: "IN", name: "Nhập kho" }, { id: "OUT", name: "Xuất kho" }]) +
          inputField("purpose", "select", true, PURPOSES.IN) +
          inputField("workflow_source_id", "select", true, []) +
          inputField("sale_plan_id", "select", false, []) +
          inputField("workshop_id", "select", true, sources.workshops || []) +
          inputField("warehouse_id", "select", true, warehouses) +
          inputField("manager_id", "select", true, managers) +
          inputField("requested_at", "datetime-local", true, [], localInput(new Date().toISOString())) +
          inputField("note", "textarea", false) +
          '<div class="span2" id="request-source-info"></div><div class="span2" id="request-quantity-lines"></div>',
      ),
    );
    // Chủ xưởng chỉ quản lý một xưởng thì chọn sẵn và khóa ô xưởng.
    if (sources.workshops?.length === 1) {
      $("#f-workshop_id").value = sources.workshops[0].id;
      $("#f-workshop_id").disabled = true;
    }
    $('label[for="f-request_direction"]').textContent = "Thao tác *";
    $('label[for="f-requested_at"]').textContent = "Ngày giờ đề nghị thực hiện *";
    $("#f-requested_at").min = calendarToday() + "T00:00";
    $("#data-form [type=submit]").textContent = "Gửi yêu cầu";
  }

  function setupRequestForm(sources, warehouses, items) {
    let loadSequence = 0; // bỏ kết quả của lần tải cũ nếu người dùng đã đổi lựa chọn
    let preview = null;   // lượng còn được yêu cầu của nguồn đang chọn

    /** Nguồn chọn được theo mục đích. Xuất bán cần KHSX đã hoàn tất; xuất NVL cần KHSX chưa hoàn tất. */
    const candidates = () => {
      const purpose = value("purpose");
      if (purpose === "PURCHASE_RECEIPT") return sources.purchase_plans;
      if (purpose === "PRODUCTION_RECEIPT") return sources.finished_reports;
      return sources.production_plans.filter((plan) =>
        purpose === "SALE_ISSUE" ? plan.status === "COMPLETED" : plan.status !== "COMPLETED",
      );
    };

    /** Chỉ kho đúng xưởng và đúng loại hàng (NVL / thành phẩm). */
    const fillWarehouses = () => {
      const select = $("#f-warehouse_id");
      const previous = select.value;
      const kind = ["PURCHASE_RECEIPT", "PRODUCTION_ISSUE"].includes(value("purpose")) ? "MATERIAL" : "FINISHED_PRODUCT";
      const eligible = warehouses.filter((w) => {
        const type = w.warehouse_type || w.LoaiKho;
        const rightWorkshop = !w.workshop_id || String(w.workshop_id) === value("workshop_id");
        return rightWorkshop && (!type || type === kind);
      });
      select.innerHTML = optionsHTML(eligible, (w) => w.name);
      if (eligible.some((w) => String(w.id) === previous)) select.value = previous;
    };

    /** Kế hoạch bán của KHSX đang chọn; chỉ hiện ô chọn khi có nhiều hơn một. Trả về danh sách. */
    const fillSalePlans = (source) => {
      const select = $("#f-sale_plan_id");
      const previous = select.value;
      const sales = sources.sale_plans.filter((plan) => plan.production_plan_id === source?.id);
      select.innerHTML = (sales.length > 1 ? '<option value="">Chọn kế hoạch bán cần giao</option>' : "") + optionsHTML(sales);
      if (sales.some((s) => s.id === previous)) select.value = previous;
      const show = value("purpose") === "SALE_ISSUE" && sales.length > 1;
      select.closest(".field").hidden = !show;
      select.disabled = !show;
      select.required = show;
      return sales;
    };

    /** Tải lượng còn được yêu cầu của nguồn đang chọn và dựng bảng nhập số lượng. */
    const load = async () => {
      const token = ++loadSequence;
      preview = null;
      $("#request-quantity-lines").innerHTML = "";
      $("#request-source-info").innerHTML = "";
      const submit = $("#data-form [type=submit]");
      submit.disabled = true;

      const source = candidates().find((s) => s.id === value("workflow_source_id"));
      if (source?.workshop_id) $("#f-workshop_id").value = source.workshop_id;
      fillWarehouses();
      const sales = fillSalePlans(source);

      if (!source) {
        $("#request-source-info").innerHTML =
          '<p class="notice">Chưa có nguồn phù hợp. Nhập nguyên vật liệu cần đơn mua; nhập thành phẩm cần báo cáo đã gửi.</p>';
        return;
      }
      if (value("purpose") === "SALE_ISSUE" && !sales.length) {
        $("#request-source-info").innerHTML = '<p class="notice">KHSX chưa có kế hoạch bán đã duyệt liên quan.</p>';
        return;
      }
      const salePlan = value("sale_plan_id");
      if (!$("#f-sale_plan_id").disabled && !salePlan) return; // chờ chọn kế hoạch bán

      try {
        const query = new URLSearchParams({
          workflow_source: "true",
          source_id: source.id,
          purpose: value("purpose"),
          workshop_id: value("workshop_id"),
          warehouse_id: value("warehouse_id"),
          ...(value("purpose") === "SALE_ISSUE" && salePlan ? { sale_plan_id: salePlan } : {}),
        });
        const data = (await api("source-imports/stock-requests?" + query)).data;
        if (token !== loadSequence) return;
        preview = data;
        showSourceInfo(source, data);
        if (!data.lines.length) return showNothingLeft(data);

        const editor = lineEditor("Mặt hàng đề nghị", items.filter((i) => data.lines.some((l) => l.item_id === i.id)),
          "request-lines", ["quantity"], data.lines);
        $("#request-quantity-lines").innerHTML = editor.html;
        editor.mount();
        lockLineItems(new Map(data.lines.map((line) => [line.item_id, line.quantity])));
        submit.disabled = false;
      } catch (e) {
        if (token === loadSequence) $("#request-source-info").innerHTML = errorHTML(e);
      }
    };

    const chooseSource = () => {
      $("#f-workflow_source_id").innerHTML = optionsHTML(candidates());
      $('label[for="f-workflow_source_id"]').textContent = (SOURCE_LABEL[value("purpose")] || "Kế hoạch sản xuất") + " *";
      return load();
    };

    $("#f-request_direction").onchange = () => {
      $("#f-purpose").innerHTML = PURPOSES[value("request_direction")]
        .map((p) => '<option value="' + esc(p.id) + '">' + esc(p.name) + "</option>").join("");
      return chooseSource();
    };
    $("#f-purpose").onchange = chooseSource;
    $("#f-workflow_source_id").onchange = load;
    for (const key of ["workshop_id", "warehouse_id", "sale_plan_id"]) $("#f-" + key).onchange = load;

    bindForm(() => {
      if (!preview) throw Error("Chờ tải và đối chiếu nguồn hợp lệ trước khi gửi.");
      const time = value("requested_at");
      return {
        purpose: value("purpose"),
        workflow_source_id: value("workflow_source_id"),
        ...(value("purpose") === "SALE_ISSUE" && value("sale_plan_id") ? { sale_plan_id: value("sale_plan_id") } : {}),
        workshop_id: value("workshop_id"),
        warehouse_id: value("warehouse_id"),
        manager_id: value("manager_id"),
        requested_date: time.slice(0, 10),
        requested_at: toIso(time),
        note: value("note"),
        lines: requestLines(),
      };
    }, "stock-requests");
    return chooseSource();
  }

  /** Thông tin nguồn, cảnh báo, lô hàng và lô thành phẩm khả dụng. */
  function showSourceInfo(source, data) {
    $("#request-source-info").innerHTML =
      '<div class="notice">Nguồn: ' + esc(source.code) + " · " + esc(data.source_code || "") + "</div>" +
      (data.warnings || []).map((w) => '<p class="hint">' + esc(w) + "</p>").join("") +
      ((data.source_lots || []).length ? "<h3>Thông tin lô hàng</h3>" + groupedLotHTML(data.source_lots) : "") +
      ((data.evidence || []).length ? "<h3>Lô thành phẩm khả dụng</h3>" + tableData(data.evidence) : "");
  }

  /** Nguồn không còn lượng nào để yêu cầu: giải thích lý do. */
  function showNothingLeft(data) {
    const waitingQc = (data.source_lots || []).some((lot) => lot.qc_status === "PENDING");
    $("#request-quantity-lines").innerHTML =
      '<p class="notice">' +
      (waitingQc
        ? "Phần lô đang chờ QC. Ban giám đốc lập đợt kiểm tra cho đúng phần báo cáo; sau khi QC ghi lượng đạt, tải lại để yêu cầu nhập."
        : "Phần đạt đã được yêu cầu hết hoặc kho chưa có lượng khả dụng. Kiểm tra kết quả QC, nguồn và kho đã chọn.") +
      "</p>";
  }

  // ---------------------------------------------------------------------------
  // UC-24.1: sửa yêu cầu (ngày giờ, kho, quản lý kho, ghi chú, số lượng)
  // ---------------------------------------------------------------------------
  editForm = async function (r) {
    if (!isMysql || current !== "stock-requests") return previousEdit(r);
    try {
      const [warehouses, managers, items] = await Promise.all([
        options("warehouses"),
        options("warehouse-managers"),
        options("items"),
      ]);
      const editor = lineEditor("Mặt hàng đề nghị", items.filter((i) => r.lines.some((l) => l.item_id === i.id)),
        "request-lines", ["quantity"], r.lines);
      openModal(
        "Sửa yêu cầu kho " + r.code,
        formWrap(
          inputField("requested_at", "datetime-local", true, [], localInput(r.requested_at || r.requested_date + "T08:00:00+07:00")) +
            inputField("warehouse_id", "select", true, warehouses, r.warehouse_id) +
            inputField("manager_id", "select", true, managers, r.manager_id) +
            inputField("note", "textarea", false, [], r.note || "") +
            editor.html,
        ),
      );
      editor.mount();
      lockLineItems();
      $("#f-requested_at").min = calendarToday() + "T00:00";
      bindForm(() => ({
        version: r.version,
        requested_date: value("requested_at").slice(0, 10),
        requested_at: toIso(value("requested_at")),
        warehouse_id: value("warehouse_id"),
        manager_id: value("manager_id"),
        note: value("note"),
        lines: requestLines(),
      }), "stock-requests/" + r.id, "PATCH");
    } catch (e) {
      openModal("Không thể sửa yêu cầu", errorHTML(e));
    }
  };

  // ---------------------------------------------------------------------------
  // UC-10/UC-11: nhân viên kho ghi phiếu theo phần được phân công.
  // Số lượng gợi ý = phần được giao còn lại; được ghi ít hơn rồi ghi tiếp sau.
  // ---------------------------------------------------------------------------
  /** Số thập phân 3 chữ số ↔ số nguyên (đơn vị 1/1000) để so sánh chính xác. */
  const toMilli = (v) => {
    const [whole, fraction = ""] = String(v).split(".");
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
  };
  const fromMilli = (n) => `${n / 1000n}.${String(n % 1000n).padStart(3, "0")}`;
  const remainingOf = (allocation) => toMilli(allocation.quantity) - toMilli(allocation.posted_quantity);

  postForm = async function (r) {
    if (!isMysql) return previousPost(r);
    try {
      const data = (await api("stock-requests/" + r.id + "/allocations" + (r.assigned_task_id ? "?task_id=" + r.assigned_task_id : ""))).data;
      if (data.frozen) throw Error("Kho đang khóa kiểm kê, chưa thể ghi phiếu.");

      // Công việc của tôi: theo yêu cầu, hoặc phần phân công đầu tiên còn lượng.
      const mine = (a) => String(a.user_id) === String(user.id) && remainingOf(a) > 0n;
      const taskId = r.assigned_task_id || data.request.assigned_task_id || String(data.allocations.find(mine)?.task_id || "");
      const pending = data.allocations.filter((a) => mine(a) && String(a.task_id) === String(taskId));
      if (!pending.length) throw Error("Không còn phân công nhập/xuất nào của bạn cần ghi phiếu.");

      const verb = r.type === "IN" ? "nhập" : "xuất";
      openModal(
        "Ghi phiếu " + verb + " · " + r.code,
        formWrap(
          '<div class="span2 notice">Đối chiếu giấy tờ thực tế trước khi xác nhận. Số lượng gợi ý là phần còn lại được phân công; có thể sửa giảm và ghi tiếp phần còn lại sau.</div>' +
            pending.map((allocation, index) => postLineHTML(data, allocation, index, verb)).join("") +
            inputField("note", "textarea", false),
        ),
      );
      mountPositionMaps(data, pending, verb);
      $('label[for="f-note"]').textContent = "Số phiếu giấy / ghi chú chung";
      $("#data-form [type=submit]").textContent = "Xác nhận ghi sổ";

      bindForm(() => {
        const allocations = [...document.querySelectorAll("[data-post-index]")]
          .map((row) => {
            const a = pending[Number(row.dataset.postIndex)];
            return {
              allocation_id: String(a.id),
              stock_request_line_id: String(a.stock_request_line_id),
              lot_id: String(a.lot_id),
              location_id: String(a.location_id),
              quality_bucket: "AVAILABLE",
              quantity: row.querySelector("[data-actual-quantity]").value,
              difference_reason: row.querySelector("[data-difference-reason]").value,
            };
          })
          .filter((a) => Number(a.quantity) > 0);
        if (!allocations.length) throw Error("Nhập ít nhất một số lượng thực tế lớn hơn 0.");
        return { stock_request_id: r.id, task_id: String(taskId), request_version: data.request.version, note: value("note"), allocations };
      }, "stock-documents");
    } catch (e) {
      openModal("Không thể ghi phiếu kho", errorHTML(e));
    }
  };

  /** Vị trí được phân công: Kho › Khu › Ô. */
  function positionText(allocation) {
    const zone = (allocation.zone_name || "Khu chung").replace(/^Khu [A-Z] · /, "Khu ");
    const cell = [allocation.location_code, allocation.location_name].filter((v, i, all) => v && all.indexOf(v) === i).join(" · ");
    return [allocation.warehouse_name, zone, cell].filter(Boolean).join(" › ");
  }

  /** Sơ đồ kho đánh dấu ô được phân công của từng dòng (chỉ để xem). */
  function mountPositionMaps(data, pending, verb) {
    for (const section of document.querySelectorAll("[data-post-index]")) {
      const allocation = pending[Number(section.dataset.postIndex)];
      const fold = document.createElement("details");
      fold.className = "warehouse-position-picker";
      fold.innerHTML = '<summary class="button small">Xem vị trí ' + verb + " trên sơ đồ kho</summary>";
      const locations = data.locations.map((l) => ({
        ...l,
        stock: data.balances.filter((b) => String(b.location_id) === l.id && Number(b.quantity) > 0),
      }));
      fold.append(createWarehouseSeatMap({ locations, selectedId: String(allocation.location_id) }));
      section.querySelector("[data-position-map]").append(fold);
    }
  }

  /** Một phần được phân công: mặt hàng, lô, vị trí, ô nhập số lượng thực tế. */
  function postLineHTML(data, allocation, index, verb) {
    const line = data.lines.find((l) => l.id === String(allocation.stock_request_line_id));
    const lot = line?.lots.find((l) => l.id === String(allocation.lot_id));
    const remaining = fromMilli(remainingOf(allocation));
    return (
      '<section class="span2 form-section" data-post-index="' + index + '">' +
      "<h3>" + esc(line?.item_name || "Mặt hàng") + "</h3>" +
      '<p class="assigned-position"><strong>' + (verb === "nhập" ? "Nhập vào: " : "Lấy hàng tại: ") + esc(positionText(allocation)) + "</strong></p>" +
      "<p>Lô: " + esc(lot?.code || "—") + " · Còn được giao: " + esc(format(remaining)) + " " + esc(line?.unit || "") + "</p>" +
      "<div data-position-map></div>" +
      "<label>Số lượng thực " + verb + "</label>" +
      '<input data-actual-quantity type="number" min="0" max="' + remaining + '" step="0.001" required value="' + remaining + '">' +
      "<label>Ghi chú theo giấy tờ / chênh lệch</label><textarea data-difference-reason></textarea>" +
      "</section>"
    );
  }
})();
