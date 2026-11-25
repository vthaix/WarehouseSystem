(() => {
  const WAITING = "SUBMITTED";

  const oldLoadTable = loadTable;
  const oldActionForm = actionForm;
  let filterApplied = false;

  const isReceivingPage = () => current === "customer-orders" && has(["PLANNER"]);
  const statusFilter = () => document.querySelector("#status");

  function applyWaitingFilter() {
    if (!isReceivingPage() || filterApplied || !statusFilter()) return false;
    filterApplied = true;
    if (!statusFilter().value) statusFilter().value = WAITING;
    return true;
  }

  function showNoNewOrders() {
    const noNewOrders = isReceivingPage() && statusFilter()?.value === WAITING && cached.length === 0;
    const table = document.querySelector("#table");
    if (noNewOrders && table) table.innerHTML = '<div class="empty">Không có đơn hàng mới cần tiếp nhận.</div>';
  }

  loadTable = async function () {
    applyWaitingFilter();
    await oldLoadTable();
    showNoNewOrders();
  };

  window.addEventListener("DOMContentLoaded", () => {
    if (applyWaitingFilter()) loadTable();
  });

  actionForm = async function (record, action) {
    if (current === "customer-orders" && action === "receive") return openReceiveDialog(record);
    return oldActionForm(record, action);
  };

  function openReceiveDialog(order) {
    const code = order.display_code || order.code;
    openModal("Tiếp nhận đơn hàng " + code, receiveDialogHTML(order));

    const form = document.querySelector("#data-form");
    const retryKey = crypto.randomUUID();
    document.querySelector("#cancel").onclick = () => modal.close();
    form.onsubmit = (event) => {
      event.preventDefault();
      return sendReceive(order, code, form, retryKey);
    };
  }

  function receiveDialogHTML(order) {
    const summary = [
      ["Khách hàng", order.customer_name],
      ["Người nhận", order.recipient_name],
      ["Số điện thoại người nhận", order.recipient_phone],
      ["Hạn giao hàng", format(order.latest_delivery_date, "latest_delivery_date", order)],
      ["Tổng báo giá", format(order.quoted_total, "quoted_total", order)],
    ];
    const summaryHTML = summary
      .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value ?? "—")}</dd></div>`)
      .join("");

    return `
      <form id="data-form">
        <dl class="detail-grid">${summaryHTML}</dl>
        <p class="notice">Sau khi tiếp nhận, đơn chuyển sang "Đã tiếp nhận" để lập kế hoạch sản xuất.
          Ban giám đốc duyệt kế hoạch sản xuất (UC-31), không duyệt trực tiếp đơn hàng.</p>
        <div class="form-actions">
          <button type="button" class="button" id="cancel">Hủy</button>
          <button type="submit" class="button primary">Tiếp nhận đơn hàng</button>
        </div>
      </form>`;
  }

  async function sendReceive(order, code, form, retryKey) {
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    try {
      await api(`customer-orders/${order.id}/receive`, "POST", { version: order.version }, retryKey);
      modal.close();
      toast(`Đã tiếp nhận đơn hàng ${code}.`);
      loadTable();
    } catch (error) {
      document.querySelector("#form-error").innerHTML = errorHTML(error);
    } finally {
      button.disabled = false;
    }
  }
})();
