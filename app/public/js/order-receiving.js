// =============================================================================
// UC-29 TIẾP NHẬN ĐƠN HÀNG — giao diện của Bộ phận lập kế hoạch
//   Bước 1-2  Mở "Tiếp nhận đơn hàng": danh sách lọc sẵn các đơn Chờ tiếp nhận
//             (vẫn chọn được "Tất cả trạng thái" để xem đơn cũ).
//   Bước 3-4  Chọn đơn → xem chi tiết (dùng màn hình chi tiết chung).
//   Bước 5-7  Bấm "Tiếp nhận" → hộp xác nhận → gọi API → báo tiếp nhận thành công.
//   Ngoại lệ 2.1  Không có đơn chờ: báo "Không có đơn hàng mới".
//   Ngoại lệ 5.1-5.3  Lỗi từ server (đã tiếp nhận, hết quyền, dữ liệu đổi) hiện ngay trên hộp xác nhận.
// =============================================================================
(() => {
  const WAITING = "SUBMITTED";
  const isPlannerOnOrders = () => current === "customer-orders" && has(["PLANNER"]);
  const previous = { actionForm, loadTable };
  let waitingFilterApplied = false;

  // Lần đầu mở trang: chọn sẵn bộ lọc "Chờ tiếp nhận" rồi tải lại danh sách.
  function applyWaitingFilter() {
    if (!isPlannerOnOrders() || waitingFilterApplied) return false;
    const status = document.querySelector("#status");
    if (!status) return false;
    waitingFilterApplied = true;
    if (!status.value) status.value = WAITING;
    return true;
  }

  loadTable = async function () {
    applyWaitingFilter();
    await previous.loadTable();
    showNoNewOrders();
  };

  // Ngoại lệ 2.1: đang lọc đơn chờ mà không có đơn nào.
  function showNoNewOrders() {
    if (!isPlannerOnOrders() || document.querySelector("#status")?.value !== WAITING || cached.length) return;
    const table = document.querySelector("#table");
    if (table) table.innerHTML = '<div class="empty">Không có đơn hàng mới cần tiếp nhận.</div>';
  }

  // Trang có thể đã tải danh sách trước khi file này được nạp: áp bộ lọc và tải lại.
  window.addEventListener("DOMContentLoaded", () => {
    if (applyWaitingFilter()) loadTable();
  });

  actionForm = async function (record, action) {
    if (current === "customer-orders" && action === "receive") return receiveForm(record);
    return previous.actionForm(record, action);
  };

  // Bước 5: hộp xác nhận tiếp nhận, tóm tắt đơn để người lập kế hoạch kiểm tra lại.
  function receiveForm(order) {
    const code = order.display_code || order.code;
    const summary = [
      ["Khách hàng", order.customer_name],
      ["Người nhận", order.recipient_name],
      ["Số điện thoại người nhận", order.recipient_phone],
      ["Hạn giao hàng", format(order.latest_delivery_date, "latest_delivery_date", order)],
      ["Tổng báo giá", format(order.quoted_total, "quoted_total", order)],
    ];
    openModal("Tiếp nhận đơn hàng " + code, `
      <form id="data-form">
        <dl class="detail-grid">${summary.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value ?? "—")}</dd></div>`).join("")}</dl>
        <p class="notice">Sau khi tiếp nhận, đơn chuyển sang "Đã tiếp nhận" để lập kế hoạch sản xuất.
          Ban giám đốc duyệt kế hoạch sản xuất (UC-31), không duyệt trực tiếp đơn hàng.</p>
        <div class="form-actions">
          <button type="button" class="button" id="cancel">Hủy</button>
          <button type="submit" class="button primary">Tiếp nhận đơn hàng</button>
        </div>
      </form>`);
    const form = document.querySelector("#data-form");
    const retry = crypto.randomUUID(); // bấm lại sau khi mất kết nối không tạo thao tác mới (ngoại lệ 5.4)
    document.querySelector("#cancel").onclick = () => modal.close();
    form.onsubmit = async (event) => {
      event.preventDefault();
      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      try {
        await api(`customer-orders/${order.id}/receive`, "POST", { version: order.version }, retry);
        modal.close();
        toast(`Đã tiếp nhận đơn hàng ${code}.`); // bước 7
        loadTable();
      } catch (error) {
        document.querySelector("#form-error").innerHTML = errorHTML(error);
      } finally {
        button.disabled = false;
      }
    };
  }
})();
