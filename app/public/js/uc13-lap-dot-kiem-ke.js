(() => {
  const $ = (selector) => document.querySelector(selector);
  const oldCreateForm = createForm;

  createForm = async function () {
    if (!isMysql || current !== "stocktakes") return oldCreateForm();
    try {
      const sources = (await api("task-inspection-sources")).data;
      const users = await options("users");
      openForm(sources, users);
    } catch (error) {
      openModal("Không thể lập đợt kiểm kê", errorHTML(error));
    }
  };

  function openForm(sources, users) {
    openModal("Lập đợt kiểm kê", formWrap(formHTML(users)));
    $('label[for="f-inspection_type"]').textContent = "Nhóm hàng *";
    $('label[for="f-title"]').textContent = "Tên đợt kiểm kê *";

    $("#f-inspection_type").onchange = () => fillLots(sources);
    $("#inspection-lot").onchange = () => showParts(sources);
    $("#f-start_at").onchange = () => { $("#f-end_at").min = $("#f-start_at").value; };
    bindForm((data) => readForm(data, sources), "tasks");
    fillLots(sources);
  }

  function formHTML(users) {
    const kinds = [{ id: "FINISHED_PRODUCT", name: "Thành phẩm" }, { id: "MATERIAL", name: "Nguyên vật liệu" }];
    return (
      inputField("inspection_type", "select", true, kinds) +
      '<div class="field"><label for="inspection-lot">Lô hàng *</label><select id="inspection-lot" required></select></div>' +
      '<div class="span2" id="inspection-parts"></div>' +
      inputField("title") +
      inputField("priority", "select", true, ["NORMAL", "HIGH", "LOW"]) +
      inputField("start_at", "datetime-local") +
      inputField("end_at", "datetime-local") +
      inputField("location", "text", true, [], "Khu kiểm tra lô hàng") +
      employeePicker(users) +
      '<div class="span2 notice">Ban kiểm kê kiểm số lượng; QA/QC kiểm chất lượng. Chọn cả hai bộ phận để thực hiện cả hai nội dung trong cùng đợt.</div>' +
      inputField("description", "textarea", false)
    );
  }

  const isFinished = () => $("#f-inspection_type").value === "FINISHED_PRODUCT";
  const lotsOf = (sources) => (isFinished() ? sources.finished_lots : sources.material_lots);
  const chosenLot = (sources) => lotsOf(sources).find((lot) => lot.id === $("#inspection-lot").value);
  const partBoxes = () => [...document.querySelectorAll("[data-finished-part]")];
  const chosenParts = () => partBoxes().filter((box) => box.checked).map((box) => box.value);
  const chosenMaterialLots = () => [...($("#inspection-material-lots")?.selectedOptions || [])].map((option) => option.value);

  function fillLots(sources) {
    $("#inspection-lot").innerHTML = lotsOf(sources)
      .map((lot) => `<option value="${esc(lot.id)}">${esc(lot.code)}</option>`)
      .join("");
    showParts(sources);
  }

  function showParts(sources) {
    const lot = chosenLot(sources);
    if (isFinished()) showFinishedParts(lot, sources);
    else showMaterialParts(lot);
    $("#f-title").value = (isFinished() ? "Kiểm tra thành phẩm " : "Kiểm tra nguyên vật liệu ") + (lot?.code || "");
    suggestDates(sources);
  }

  function showFinishedParts(lot, sources) {
    const parts = lot?.parts || [];
    $("#inspection-parts").innerHTML =
      '<div class="form-section"><h3>Các phần của lô theo báo cáo thành phẩm</h3>' +
      (parts.map(finishedPartHTML).join("") ||
        "<p>Chưa có báo cáo thành phẩm đã gửi còn phần chờ kiểm tra trong lô này.</p>") +
      "</div>";
    for (const box of partBoxes()) {
      const part = parts.find((p) => p.id === box.value);
      box.disabled = part?.available === false;
      if (box.disabled)
        box.closest("label").querySelector("small").insertAdjacentText("beforeend", " · Đã giao kiểm tra / đã có kết quả");
      box.onchange = () => suggestDates(sources);
    }
  }

  function finishedPartHTML(part) {
    const lines = part.lines.map((line) => line.item_name + ": " + format(line.quantity)).join(" · ");
    return (
      `<label class="employee-profile"><input type="checkbox" data-finished-part value="${esc(part.id)}">` +
      `<span><strong>${esc(part.code)}</strong><small>${esc(lines)} · ${esc(format(part.expected_date))}</small></span></label>`
    );
  }

  function showMaterialParts(lot) {
    const source = lot?.id?.startsWith("PO:")
      ? "Lô nguyên vật liệu của đơn mua lập trực tiếp. "
      : "Lô nguyên vật liệu được đối chiếu từ kế hoạch mua đã duyệt. ";
    const expected = lot?.expected_date ? format(lot.expected_date) : "";
    const eligible = lot?.eligible_lots || [];
    $("#inspection-parts").innerHTML =
      `<div class="notice">${source}${esc(expected)}</div>` +
      '<div class="form-section"><h3>Chọn phần lô nguyên vật liệu đã nhận</h3>' +
      '<p class="material-reconciliation-note">Chỉ chọn các đợt đã ghi nhận thuộc đúng nguồn; không gộp số lượng cả lô tổng.</p>' +
      (eligible.length ? materialLotsHTML(eligible) : noMaterialLotsHTML()) +
      "</div>";
  }

  function materialLotsHTML(lots) {
    const choices = lots.map((lot) => `<option value="${esc(lot.id)}">${esc(lot.name)}</option>`).join("");
    return (
      '<div class="field"><label for="inspection-material-lots">Phần lô đang chờ QC *</label>' +
      `<select id="inspection-material-lots" multiple size="6" required>${choices}</select>` +
      "<small>Giữ Ctrl (hoặc Command) để chọn nhiều phần lô.</small></div>"
    );
  }

  function noMaterialLotsHTML() {
    return '<div class="notice">Chưa có phần lô nguyên vật liệu thực tế chờ kiểm tra. Bạn vẫn có thể lập đợt dự kiến; khi hàng được ghi nhận, chọn bổ sung phần lô trong chi tiết công việc.</div>';
  }

  function suggestDates(sources) {
    const lot = chosenLot(sources);
    const received = isFinished()
      ? latest((lot?.parts || []).filter((part) => chosenParts().includes(part.id)).map((part) => part.expected_date))
      : lot?.expected_date;
    const day = latest([received || calendarToday(), calendarToday()]);
    const start = $("#f-start_at"), end = $("#f-end_at");
    start.min = day + "T00:00";
    start.value = day + "T08:00";
    end.min = start.value;
    end.value = day + "T09:00";
  }

  const latest = (days) => days.sort().at(-1);

  const toIso = (vietnamTime) => new Date(vietnamTime + "+07:00").toISOString();

  function readForm(data, sources) {
    const lot = chosenLot(sources);
    if (!lot) throw Error("Chưa có lô phù hợp để kiểm tra.");
    const chosen = isFinished() ? readFinishedLot(lot) : readMaterialLot(lot);
    return {
      ...data,
      start_at: toIso(data.start_at),
      end_at: toIso(data.end_at),
      assignee_ids: selectedEmployees(),
      ...chosen,
    };
  }

  function readFinishedLot(lot) {
    const parts = chosenParts();
    if (!parts.length) throw Error("Chọn ít nhất một phần theo báo cáo thành phẩm.");
    return { lot_header_id: lot.id, finished_report_ids: parts };
  }

  function readMaterialLot(lot) {
    const lotIds = chosenMaterialLots();
    if (lot.eligible_lots?.length && !lotIds.length) throw Error("Chọn ít nhất một phần lô nguyên vật liệu đã nhận.");
    return { material_source: lot.id, material_lot_ids: lotIds };
  }
})();
