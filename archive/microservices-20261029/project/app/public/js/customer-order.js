window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#customer-order-form");
  if (!form) return;
  let key = crypto.randomUUID();
  const quantities = [...form.querySelectorAll("[data-order-item]")];
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  form.elements.latest_delivery_date.min = date.toISOString().slice(0, 10);
  form.addEventListener("input", () => {
    key = crypto.randomUUID();
    const total = quantities.reduce((sum, el) => sum + Number(el.value || 0) * Number(el.dataset.price), 0);
    document.querySelector("#order-total").textContent = total.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " đ";
  });
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
    try {
      const result = await api("customer-orders", "POST", { ...Object.fromEntries(new FormData(form)), lines }, key);
      location.assign("/records/customer-orders/" + encodeURIComponent(result.data.id));
    } catch (e) { error.textContent = e.message; button.disabled = false; }
  });
});
