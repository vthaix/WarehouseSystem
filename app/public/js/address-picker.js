// =============================================================================
// BỘ CHỌN ĐỊA CHỈ GIAO HÀNG (UC-02 đặt hàng, UC-03.1 sửa đơn của khách hàng)
//   1. Chọn Tỉnh/Thành phố  (34 đơn vị, từ 01/07/2025)
//   2. Chọn Phường/Xã thuộc tỉnh đã chọn
//   3. Nhập số nhà, tên đường
// Form gửi lên delivery_province_code, delivery_ward_code, delivery_street;
// server kiểm tra lại và ghép thành địa chỉ đầy đủ (src/shared/vn-address.js).
// Dùng: const picker = addressPicker.create(order); html += picker.html; ...; picker.mount();
// =============================================================================
const addressPicker = (() => {
  let unitsRequest = null; // tải danh mục một lần cho cả trang

  function loadUnits() {
    unitsRequest ||= fetch("/data/vn-address-units.json").then((response) => {
      if (!response.ok) throw new Error("Không tải được danh mục địa chỉ. Vui lòng tải lại trang.");
      return response.json();
    });
    return unitsRequest;
  }

  const option = (value, label) => `<option value="${esc(String(value))}">${esc(label)}</option>`;

  /** @param value đơn hàng đang sửa (có delivery_province_code, delivery_ward_code, delivery_street) hoặc {} khi đặt mới. */
  function create(value = {}) {
    return {
      html: `<div class="span2 form-section address-picker">
        <h3>Địa chỉ giao hàng *</h3>
        <div class="form-grid">
          <div class="field"><label for="f-delivery_province_code">Tỉnh / Thành phố *</label>
            <select id="f-delivery_province_code" name="delivery_province_code" required><option value="">Đang tải…</option></select></div>
          <div class="field"><label for="f-delivery_ward_code">Phường / Xã *</label>
            <select id="f-delivery_ward_code" name="delivery_ward_code" required disabled><option value="">Chọn Tỉnh / Thành phố trước</option></select></div>
          <div class="field span2"><label for="f-delivery_street">Số nhà, tên đường *</label>
            <input id="f-delivery_street" name="delivery_street" maxlength="300" required autocomplete="street-address"
              placeholder="Ví dụ: 12 Nguyễn Huệ" value="${esc(value.delivery_street || "")}"></div>
        </div>
        <p class="hint" id="address-preview">${value.delivery_address ? "Địa chỉ hiện tại: " + esc(value.delivery_address) : ""}</p>
      </div>`,

      async mount() {
        const province = document.querySelector("#f-delivery_province_code");
        const ward = document.querySelector("#f-delivery_ward_code");
        const street = document.querySelector("#f-delivery_street");
        const preview = document.querySelector("#address-preview");
        let units;
        try {
          units = await loadUnits();
        } catch (error) {
          province.innerHTML = option("", error.message);
          return;
        }
        const findProvince = () => units.provinces.find((p) => String(p.code) === province.value);

        // Bước 2: phường/xã chỉ gồm các đơn vị thuộc tỉnh đang chọn.
        function fillWards(selected = "") {
          const current = findProvince();
          ward.disabled = !current;
          ward.innerHTML = current
            ? option("", "Chọn Phường / Xã") + current.wards.map(([code, name]) => option(code, name)).join("")
            : option("", "Chọn Tỉnh / Thành phố trước");
          ward.value = String(selected || "");
        }
        // Hiện địa chỉ đầy đủ sẽ được lưu để khách kiểm tra lại.
        function showPreview() {
          const current = findProvince();
          const wardName = current?.wards.find(([code]) => String(code) === ward.value)?.[1];
          if (current && wardName && street.value.trim())
            preview.textContent = "Giao tới: " + [street.value.trim(), wardName, current.name].join(", ");
        }

        province.innerHTML = option("", "Chọn Tỉnh / Thành phố") + units.provinces.map((p) => option(p.code, p.name)).join("");
        province.value = String(value.delivery_province_code || "");
        fillWards(value.delivery_ward_code);
        province.onchange = () => { fillWards(); showPreview(); };
        ward.onchange = showPreview;
        street.oninput = showPreview;
      },
    };
  }

  return { create };
})();
