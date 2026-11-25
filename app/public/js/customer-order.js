window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#customer-order-form");
  if (!form) return;
  let key = crypto.randomUUID();
  let profileChoice = null; // đã trả lời câu hỏi cập nhật hồ sơ; gửi lại sau khi mất mạng không hỏi lần nữa
  // Địa chỉ giao hàng: chọn Tỉnh/Thành → Phường/Xã, rồi nhập số nhà, tên đường.
  const address = addressPicker.create();
  document.querySelector("#delivery-address-picker").outerHTML = address.html;
  address.mount();
  const quantities = [...form.querySelectorAll("[data-order-item]")];
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  form.elements.latest_delivery_date.min = date.toISOString().slice(0, 10);
  form.addEventListener("input", () => {
    key = crypto.randomUUID();
    profileChoice = null;
    const total = quantities.reduce((sum, el) => sum + Number(el.value || 0) * Number(el.dataset.price), 0);
    document.querySelector("#order-total").textContent = total.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " đ";
  });
  // Người nhận: so với hồ sơ đã lưu (data-saved). Số điện thoại chỉ so phần chữ số.
  const recipientName = form.elements.recipient_name, recipientPhone = form.elements.recipient_phone;
  const cleanName = (text) => text.trim().replace(/\s+/g, " ");
  const cleanPhone = (text) => text.replace(/[\s.\-()]/g, "").replace(/^\+?84(?=\d{9,10}$)/, "0");
  const checkPhone = () => recipientPhone.setCustomValidity(
    !recipientPhone.value.trim() || /^0\d{9,10}$/.test(cleanPhone(recipientPhone.value)) ? "" : "Số điện thoại gồm 10–11 số, bắt đầu bằng 0.");
  recipientPhone.addEventListener("input", checkPhone);

  /** Danh sách thay đổi so với hồ sơ; rỗng nếu hồ sơ chưa có hoặc không đổi. */
  function profileChanges() {
    if (!recipientName.dataset.saved || !recipientPhone.dataset.saved) return [];
    return [
      ["Tên người nhận", recipientName.dataset.saved, cleanName(recipientName.value)],
      ["Số điện thoại", recipientPhone.dataset.saved, cleanPhone(recipientPhone.value)],
    ].filter(([, saved, entered]) => saved !== entered);
  }

  /** Hỏi có cập nhật hồ sơ không. Trả về "update" | "keep" | "cancel" (đóng hộp thoại: quay lại sửa đơn). */
  function askUpdateProfile(changes) {
    return new Promise((resolve) => {
      const dialog = document.createElement("dialog");
      dialog.className = "planning-confirm-dialog";
      dialog.id = "update-profile-dialog";
      dialog.setAttribute("aria-labelledby", "update-profile-title");
      dialog.innerHTML = `<div class="planning-confirm-content">
          <button type="button" class="planning-confirm-close" data-choice="cancel" aria-label="Đóng thông báo">×</button>
          <span class="planning-confirm-eyebrow">THÔNG TIN NGƯỜI NHẬN</span>
          <h2 id="update-profile-title">Bạn có muốn cập nhật lại hồ sơ không?</h2>
          <p>Thông tin người nhận của đơn này khác với hồ sơ đã lưu:</p>
          <div class="planning-confirm-note">${changes.map(([label, saved, entered]) =>
            `<div>${esc(label)}: ${esc(saved)} → <strong>${esc(entered)}</strong></div>`).join("")}</div>
        </div><div class="planning-confirm-actions">
          <button type="button" class="button" data-choice="keep">Chỉ dùng cho đơn này</button>
          <button type="button" class="button primary" data-choice="update" autofocus>Cập nhật hồ sơ</button>
        </div>`;
      dialog.querySelectorAll("[data-choice]").forEach((el) => { el.onclick = () => dialog.close(el.dataset.choice); });
      dialog.addEventListener("close", () => { dialog.remove(); resolve(dialog.returnValue || "cancel"); }, { once: true });
      document.body.append(dialog);
      dialog.showModal();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("[type=submit]");
    const error = document.querySelector("#order-error");
    error.textContent = "";
    const lines = quantities.filter(el => Number(el.value) > 0).map(el => ({
      item_id: el.dataset.orderItem, quantity: el.value,
      note: form.querySelector(`[data-item-note="${el.dataset.orderItem}"]`).value,
    }));
    if (!lines.length) { error.textContent = "Vui lòng chọn ít nhất một loại bánh với số lượng lớn hơn 0."; return; }
    button.disabled = true;
    const changes = profileChanges();
    profileChoice ||= changes.length ? await askUpdateProfile(changes) : "keep";
    if (profileChoice === "cancel") { profileChoice = null; button.disabled = false; return; }
    try {
      await api("customer-orders", "POST", { ...Object.fromEntries(new FormData(form)), update_profile: profileChoice === "update", lines }, key);
      // Keep the customer on the order list after submission. The detail view
      // remains available through the explicit “Chi tiết đơn hàng” action.
      location.assign("/customer/orders?module=customer-orders");
    } catch (e) { error.textContent = e.message; button.disabled = false; }
  });
});
