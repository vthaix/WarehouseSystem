async function dispatchForm(request) {
  try {
    const preview = (await api("stock-requests/" + request.id + "/allocations")).data;
    const users = await options("users");
    const staff = users.filter((user) => user.roles.includes("WAREHOUSE_STAFF"));
    warehouseDispatch.open({ request, preview, staff });
  } catch (error) {
    openModal("Phân công kho", errorHTML(error));
  }
}

const warehouseDispatch = (() => {
  const $ = (selector) => document.querySelector(selector);
  const same = (a, b) => String(a) === String(b);
  const allRows = () => [...document.querySelectorAll("[data-dispatch]")];
  const field = (row, key) => row.querySelector(`[data-key="${key}"]`);
  const zoneLabel = (zone) => (zone || "Khu chung").replace(/^Khu [A-Z] · /, "Khu ");
  const positionLabel = (location) => location.code + " · " + zoneLabel(location.zone_name);
  const newRetryKey = () => { retryKey = crypto.randomUUID(); };

  const toMilli = (value) => {
    const [whole, fraction = ""] = String(value || "0").split(".");
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
  };
  const fromMilli = (n) => `${n / 1000n}.${String(n % 1000n).padStart(3, "0")}`;
  const sum = (values) => values.reduce((total, value) => total + value, 0n);
  const pendingQuantity = (allocation) => toMilli(allocation.quantity) - toMilli(allocation.posted_quantity);

  function open(form) {
    const { request } = form;
    openModal("Phân công kho · " + request.code, formHTML(request));
    $("#f-start_at").onchange = () => { $("#f-end_at").min = $("#f-start_at").value; };
    $("#add-dispatch").onclick = () => { addRow(form); newRetryKey(); };

    const pending = currentAllocations(form).filter((a) => pendingQuantity(a) > 0n);
    pending.forEach((allocation) => addSavedRow(form, allocation));
    addMissingRows(form, pending);

    if (request.type === "OUT") addFillButton(form);
    bindForm((data) => readForm(data, form), "stock-requests/" + request.id + "/dispatch");
  }

  const currentAllocations = (form) => form.preview.allocations || [];

  function formHTML(request) {
    const lots = request.source_lots?.length ? tableData(request.source_lots) : "";
    return (
      '<div class="notice">Chọn nhân viên kho và kiểm tra lô, vị trí, số lượng được giao.</div>' +
      lots +
      formWrap(
        timeFieldsHTML(request) +
          '<div class="span2" id="dispatch-lines"></div>' +
          '<button class="button" type="button" id="add-dispatch">＋ Thêm phân bổ</button>',
      )
    );
  }

  function timeFieldsHTML(request) {
    const halfHour = 30 * 60000;
    const now = Math.ceil(Date.now() / halfHour) * halfHour;
    const requested = Date.parse(request.requested_at || "");
    const start = Number.isFinite(requested) && requested > now ? requested : now;
    const toInput = (ms) => new Date(ms + 7 * 3600000).toISOString().slice(0, 16);
    return (
      inputField("start_at", "datetime-local", true, [], toInput(start)) +
      inputField("end_at", "datetime-local", true, [], toInput(start + 2 * 3600000))
    );
  }

  function addSavedRow(form, allocation) {
    const row = addRow(form, String(allocation.stock_request_line_id), String(allocation.lot_id), String(allocation.location_id));
    field(row, "assignee_id").value = String(allocation.user_id);
    field(row, "quantity").value = fromMilli(pendingQuantity(allocation));
  }

  function addMissingRows(form, pending) {
    const waiting = form.preview.lines.filter(
      (line) => toMilli(line.remaining_quantity) > 0n && !pending.some((a) => same(a.stock_request_line_id, line.id)),
    );
    waiting.forEach((line) => addRow(form, line.id));
  }

  function addFillButton(form) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.textContent = "Bổ sung phân bổ theo hạn dùng và thứ tự nhập";
    $("#add-dispatch").after(button);
    button.onclick = () => {
      for (const line of form.preview.lines) for (const lot of line.lots) addLotIfNeeded(form, line, lot);
      newRetryKey();
    };
  }

  function addLotIfNeeded(form, line, lot) {
    if (!stockOf(form, line, lot.id).length) return;
    const row = addRow(form, line.id, lot.id);
    if (toMilli(field(row, "quantity").value) <= 0n) row.remove();
  }

  function readForm(data, form) {
    const toIso = (vietnamTime) => new Date(vietnamTime + "+07:00").toISOString();
    return {
      version: form.preview.request.version,
      allocation_mode: "REPLACE_PENDING",
      start_at: toIso(data.start_at),
      end_at: toIso(data.end_at),
      allocations: allRows().map(readRow),
    };
  }

  function readRow(row) {
    const inputs = [...row.querySelectorAll("[data-key]")];
    return Object.fromEntries(inputs.map((input) => [input.dataset.key, input.value]));
  }

  function freeQuantity(form, balance) {
    const available = toMilli(balance.available_quantity ?? balance.quantity);
    if (form.request.type !== "OUT") return available;
    const ownHeld = currentAllocations(form).filter(
      (a) => same(a.lot_id, balance.lot_id) && same(a.location_id, balance.location_id) && a.quality_bucket === "AVAILABLE",
    );
    return available + sum(ownHeld.map(pendingQuantity));
  }

  function stockOf(form, line, lotId) {
    return line.balances.filter(
      (b) => same(b.lot_id, lotId) && b.quality_bucket === "AVAILABLE" && freeQuantity(form, b) > 0n,
    );
  }

  function eligibleLots(form, line) {
    const usable = (lot) =>
      form.request.type === "IN"
        ? toMilli(lot.passed_quantity) > toMilli(lot.posted_quantity)
        : stockOf(form, line, lot.id).length > 0;
    return line.lots.filter(usable).sort(compareLots);
  }

  function compareLots(a, b) {
    const expiry = (lot) => String(lot.expiry_date || "9999-12-31").slice(0, 10);
    const received = (lot) => Date.parse(lot.first_received_at || "9999-12-31");
    return expiry(a).localeCompare(expiry(b)) || received(a) - received(b) || Number(a.id) - Number(b.id);
  }

  function addRow(form, lineId = null, lotId = null, locationId = null) {
    const row = document.createElement("div");
    row.className = "form-section";
    row.dataset.dispatch = "true";
    row.innerHTML = rowHTML(form);

    const state = { form, row, lotId, locationId, line: null, lots: [] };
    field(row, "stock_request_line_id").onchange = () => changeLine(state);
    field(row, "lot_id").onchange = () => changeLot(state);
    field(row, "location_id").onchange = () => updateQuantity(state);
    row.querySelector("button").onclick = () => { row.remove(); newRetryKey(); };

    $("#dispatch-lines").append(row);
    if (lineId) field(row, "stock_request_line_id").value = lineId;
    changeLine(state);
    return row;
  }

  function rowHTML(form) {
    const lineOptions = form.preview.lines
      .map((l) => `<option value="${l.id}">${esc(l.item_name)} · còn ${esc(format(l.remaining_quantity))} ${esc(l.unit || "")}</option>`)
      .join("");
    const staffOptions = form.staff.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("");
    const locationTitle = form.request.type === "IN" ? "Ô nhập hàng" : "Ô lấy hàng";
    return (
      '<div class="form-grid">' +
      `<div class="field"><label>Dòng hàng</label><select aria-label="Dòng hàng" data-key="stock_request_line_id">${lineOptions}</select></div>` +
      `<div class="field"><label>Nhân viên kho</label><select aria-label="Nhân viên kho" data-key="assignee_id">${staffOptions}</select></div>` +
      '<div class="field"><label>Lô</label><select aria-label="Lô phân công" data-key="lot_id"></select></div>' +
      `<div class="field"><label>${locationTitle}</label><select aria-label="Vị trí phân công" data-key="location_id"></select></div>` +
      '<div class="field"><label>Số lượng</label><input aria-label="Số lượng phân công" data-key="quantity" type="number" min="0.001" step="0.001" required value="1"></div>' +
      '<div class="field"><label>Chất lượng</label><input type="hidden" data-key="quality_bucket" value="AVAILABLE"><input aria-label="Chất lượng" value="Khả dụng" readonly></div>' +
      '</div><button class="button small danger" type="button">Xóa phân bổ</button>'
    );
  }

  const isInbound = (state) => state.form.request.type === "IN";
  const chosenLot = (state) => state.lots.find((lot) => lot.id === field(state.row, "lot_id").value);
  const chosenLocationId = (state) => field(state.row, "location_id").value;

  function changeLine(state) {
    const { form, row } = state;
    const lineId = field(row, "stock_request_line_id").value;
    state.line = form.preview.lines.find((line) => line.id === lineId);
    state.lots = eligibleLots(form, state.line);

    field(row, "lot_id").innerHTML = state.lots.map(lotOptionHTML).join("");
    if (state.lotId && state.lots.some((lot) => lot.id === state.lotId)) field(row, "lot_id").value = state.lotId;
    fillLocations(row, state.line.locations);
    if (state.locationId) field(row, "location_id").value = String(state.locationId);
    changeLot(state);
  }

  function lotOptionHTML(lot) {
    const expiry = lot.expiry_date ? " · HSD " + esc(format(lot.expiry_date, "expiry_date")) : " · Chưa có HSD";
    return `<option value="${lot.id}">${esc(lot.code)}${expiry}</option>`;
  }

  function fillLocations(row, locations) {
    field(row, "location_id").innerHTML = locations
      .map((location) => `<option value="${location.id}">${esc(positionLabel(location))}</option>`)
      .join("");
  }

  function changeLot(state) {
    const lot = chosenLot(state);
    if (isInbound(state) && lot?.suggested_location_id) field(state.row, "location_id").value = lot.suggested_location_id;
    if (!isInbound(state)) showStockedLocations(state, lot);
    updateQuantity(state);
    showHint(state, lot);
  }

  function showStockedLocations(state, lot) {
    const { form, row, line } = state;
    const current = chosenLocationId(state);
    const stocked = lot && stockOf(form, line, lot.id);
    const choices = lot ? line.locations.filter((l) => stocked.some((b) => same(b.location_id, l.id))) : line.locations;
    const has = (id) => choices.some((location) => same(location.id, id));

    fillLocations(row, choices);
    if (has(current)) field(row, "location_id").value = current;
    else if (state.locationId && has(state.locationId)) field(row, "location_id").value = String(state.locationId);
    else if (choices.length) field(row, "location_id").value = String(choices[0].id);
  }

  function showHint(state, lot) {
    let hint = state.row.querySelector(".queue-hint");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "queue-hint";
      state.row.append(hint);
    }
    hint.textContent = isInbound(state)
      ? lot?.storage_hint || "Chọn ô nhập hàng."
      : "Lô được xếp theo hạn dùng gần nhất; đây là gợi ý. Bạn có thể chọn lô khác còn khả dụng và vị trí có hàng.";
  }

  function updateQuantity(state) {
    const lot = chosenLot(state);
    if (!isInbound(state)) moveToStockedLocation(state, lot);

    const fromLot = lotQuantity(state, lot) - draftedOfLot(state, lot);
    const fromLine = toMilli(state.line.remaining_quantity) - draftedOfLine(state);
    let quantity = fromLine < fromLot ? fromLine : fromLot;
    if (quantity < 0n) quantity = 0n;

    const input = field(state.row, "quantity");
    input.value = fromMilli(quantity);
    input.max = fromMilli(quantity);
    showMap(state);
  }

  function moveToStockedLocation(state, lot) {
    if (!lot) return;
    const stocked = stockOf(state.form, state.line, lot.id);
    if (stocked.some((b) => same(b.location_id, chosenLocationId(state)))) return;
    if (stocked.length) field(state.row, "location_id").value = String(stocked[0].location_id);
  }

  function lotQuantity(state, lot) {
    if (!lot) return 0n;
    if (isInbound(state)) return toMilli(lot.passed_quantity) - toMilli(lot.posted_quantity);
    const balances = state.line.balances.filter(
      (b) => same(b.lot_id, lot.id) && same(b.location_id, chosenLocationId(state)) && b.quality_bucket === "AVAILABLE",
    );
    return sum(balances.map((b) => freeQuantity(state.form, b)));
  }

  const otherRows = (state) => allRows().filter((row) => row !== state.row);
  const drafted = (rows) => sum(rows.map((row) => toMilli(field(row, "quantity").value)));

  function draftedOfLot(state, lot) {
    const locationId = chosenLocationId(state);
    return drafted(otherRows(state).filter((row) =>
      field(row, "lot_id").value === lot?.id && (isInbound(state) || field(row, "location_id").value === locationId)));
  }

  function draftedOfLine(state) {
    return drafted(otherRows(state).filter((row) => field(row, "stock_request_line_id").value === state.line.id));
  }

  function showMap(state) {
    const holder = childOf(state.row.querySelector(".form-grid"), "warehouse-dispatch-map", "div");
    const fold = document.createElement("details");
    fold.className = "warehouse-position-picker";
    fold.open = holder.querySelector("details")?.open || false;
    fold.innerHTML = '<summary class="button small">Xem vị trí trong kho</summary>';
    fold.append(seatMap(state, holder));
    holder.replaceChildren(fold, captionOf(state));

    showItemTitle(state);
    if (!isInbound(state)) showLotQueue(state);
  }

  function childOf(parent, className, tag) {
    let child = parent.querySelector("." + className);
    if (!child) {
      child = document.createElement(tag);
      child.className = className;
      parent.append(child);
    }
    return child;
  }

  function seatMap(state, holder) {
    const { form, line } = state;
    const lot = chosenLot(state);
    const inbound = isInbound(state);
    const stockedIds = lot ? stockOf(form, line, lot.id).map((b) => String(b.location_id)) : [];
    const locations = line.locations.map((location) => ({
      ...location,
      stock: line.balances.filter((b) => same(b.location_id, location.id) && freeQuantity(form, b) > 0n),
      selectable: inbound || stockedIds.includes(String(location.id)),
    }));
    return createWarehouseSeatMap({
      locations,
      selectedId: chosenLocationId(state),
      suggestedId: inbound ? lot?.suggested_location_id : null,
      suggestedIds: inbound ? lot?.suggested_location_ids || [] : stockedIds,
      onSelect: (location) => {
        field(state.row, "location_id").value = String(location.id);
        updateQuantity(state);
        newRetryKey();
      },
      onZone: (name) => {
        holder.querySelector(".warehouse-dispatch-selection").textContent = name.replace(/^Khu [A-Z] · /, "Khu ");
      },
    });
  }

  function captionOf(state) {
    const location = state.line.locations.find((l) => String(l.id) === chosenLocationId(state));
    const caption = document.createElement("p");
    caption.className = "warehouse-dispatch-selection";
    caption.textContent = (isInbound(state) ? "Nhập vào: " : "Lấy hàng tại: ") + (location ? positionLabel(location) : "Chưa chọn ô");
    return caption;
  }

  function showItemTitle(state) {
    let title = state.row.querySelector(".dispatch-item-title");
    if (!title) {
      title = document.createElement("h3");
      title.className = "dispatch-item-title";
      state.row.prepend(title);
    }
    title.textContent = state.line.item_name;
  }

  function showLotQueue(state) {
    let queue = state.row.querySelector(".dispatch-line-queue");
    if (!queue) {
      queue = document.createElement("section");
      queue.className = "dispatch-line-queue";
      state.row.querySelector(".form-grid").after(queue);
    }
    queue.innerHTML =
      '<h4>Lô xuất đề xuất</h4><p class="queue-hint">Thứ tự ưu tiên gợi ý theo hạn dùng gần nhất; quản lý vẫn có thể chọn lô khác còn khả dụng.</p>' +
      '<div class="table-wrap"><table><thead><tr><th>Ưu tiên</th><th>Lô</th><th>Hạn dùng</th><th>Có thể xuất</th><th></th></tr></thead><tbody>' +
      state.lots.map((lot, index) => queueRowHTML(state, lot, index)).join("") +
      "</tbody></table></div>";
    queue.querySelectorAll("[data-queue-lot]").forEach((button) => {
      button.onclick = () => {
        const select = field(state.row, "lot_id");
        select.value = button.dataset.queueLot;
        select.dispatchEvent(new Event("change"));
      };
    });
  }

  function queueRowHTML(state, lot, index) {
    const chosen = lot.id === chosenLot(state)?.id;
    const balances = state.line.balances.filter((b) => same(b.lot_id, lot.id) && b.quality_bucket === "AVAILABLE");
    const available = sum(balances.map((b) => freeQuantity(state.form, b)));
    return (
      `<tr class="${chosen ? "queue-selected" : ""}">` +
      `<td>${index + 1}</td><td>${esc(lot.code)}</td>` +
      `<td>${esc(lot.expiry_date ? format(lot.expiry_date, "expiry_date") : "Chưa ghi nhận")}</td>` +
      `<td>${esc(format(fromMilli(available)))} ${esc(state.line.unit || "")}</td>` +
      `<td><button class="button small" type="button" data-queue-lot="${esc(lot.id)}">${chosen ? "Đang chọn" : "Chọn lô"}</button></td></tr>`
    );
  }

  return { open };
})();
