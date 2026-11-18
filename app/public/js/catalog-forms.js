// =============================================================================
// GIAO DIỆN DANH MỤC KHO
//   UC-06   Quản lý danh mục kho      → danh sách dạng thẻ (showCategoryCards)
//   UC-06.1 / UC-06.3 Thêm / sửa danh mục   → categoryForm(record)
//   UC-07.1 / UC-07.3 Thêm / sửa mặt hàng   → itemForm(record)
//   UC-06.2 / UC-07.2 Xóa                  → dùng hộp xác nhận chung actionForm(r,'delete')
// Mã danh mục và mã mặt hàng do hệ thống tự sinh nên không có ô nhập mã.
// Mọi kiểm tra cuối cùng (trùng tên, đang sử dụng, sai nhóm...) do server thực hiện.
// =============================================================================
(() => {
  const KIND_OPTIONS = [
    { id: "FINISHED_PRODUCT", name: "Thành phẩm" },
    { id: "MATERIAL", name: "Nguyên vật liệu / vật tư đóng gói" },
  ];
  const YES_NO = [{ id: "true", name: "Có" }, { id: "false", name: "Không" }];
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  // Nhóm đang xem lấy từ đường dẫn (?kind=MATERIAL), mặc định là Thành phẩm.
  const params = new URLSearchParams(location.search);
  const pageKind = params.get("kind") || "FINISHED_PRODUCT";

  const previous = { createForm, editForm, loadTable };
  const ownsForm = () => current === "categories" || current === "items";

  // Mở form thêm của trang hiện tại; trang khác giữ form cũ.
  createForm = async function () {
    if (current === "categories") return categoryForm();
    if (current === "items") return itemForm();
    return previous.createForm();
  };

  // Mở form sửa với dữ liệu mới nhất từ server (lấy đúng phiên bản để chống ghi đè).
  editForm = async function (record) {
    if (!ownsForm()) return previous.editForm(record);
    try {
      const fresh = (await api(current + "/" + record.id)).data;
      return current === "categories" ? categoryForm(fresh) : itemForm(fresh);
    } catch (error) {
      toast(error.message);
    }
  };

  // ---------------------------------------------------------------------------
  // UC-06.1 / UC-06.3: FORM DANH MỤC
  // Trường: tên, nhóm (NVL / thành phẩm), mô tả, ảnh, trạng thái hoạt động.
  // ---------------------------------------------------------------------------
  function categoryForm(record = {}) {
    const isEdit = Boolean(record.id);
    const image = imagePicker("Ảnh danh mục", record.image_path);
    openModal(isEdit ? "Sửa danh mục" : "Thêm danh mục", formWrap(
      inputField("name", "text", true, [], record.name || "") +
      inputField("catalog_kind", "select", true, KIND_OPTIONS, record.catalog_kind || pageKind) +
      inputField("description", "textarea", false, [], record.description || "") +
      inputField("is_active", "select", true, YES_NO, String(record.is_active ?? true)) +
      image.html,
    ));
    image.mount();
    bindForm(async (data) => ({
      ...(isEdit ? { version: record.version } : {}),
      name: data.name,
      catalog_kind: data.catalog_kind,
      description: data.description || null,
      is_active: data.is_active === "true",
      image_path: await image.path(),
    }), isEdit ? "categories/" + record.id : "categories", isEdit ? "PATCH" : "POST");
  }

  // ---------------------------------------------------------------------------
  // UC-07.1 / UC-07.3: FORM MẶT HÀNG
  // Trường: tên, loại, danh mục (lọc theo loại), đơn vị tính, giá, mô tả, ảnh;
  // NVL có tiêu chuẩn nhập, thành phẩm có hạn dùng mặc định và cờ hàng mẫu.
  // Khi sửa: loại mặt hàng giữ nguyên; đổi danh mục/ĐVT chỉ được khi chưa phát sinh chứng từ.
  // ---------------------------------------------------------------------------
  async function itemForm(record = {}) {
    const isEdit = Boolean(record.id);
    const [categories, units, items] = await Promise.all([options("categories"), options("units"), options("items")]);
    const kind = record.kind || pageKind;
    const image = imagePicker("Ảnh mặt hàng", record.image_path);

    openModal(isEdit ? "Sửa mặt hàng" : "Thêm mặt hàng", formWrap(
      inputField("name", "text", true, [], record.name || "") +
      (isEdit
        ? readOnlyField("Loại mặt hàng", KIND_OPTIONS.find((k) => k.id === kind)?.name)
        : inputField("kind", "select", true, KIND_OPTIONS, kind)) +
      inputField("category_id", "select", true, [], "") +
      inputField("unit_id", "select", true, units, record.unit_id || "") +
      inputField("reference_price", "number", true, [], record.reference_price ?? "") +
      inputField("material_quality_standard", "textarea", false, [], record.material_quality_standard || "") +
      inputField("default_shelf_life_days", "number", false, [], record.default_shelf_life_days ?? "") +
      inputField("is_sample", "select", true, YES_NO, String(Boolean(record.is_sample))) +
      inputField("is_published", "select", true, YES_NO, String(Boolean(record.is_published))) +
      inputField("description", "textarea", false, [], record.description || "") +
      image.html +
      (isEdit ? '<p class="span2 hint">Mặt hàng đã có lô, đơn hàng hoặc kế hoạch thì không đổi được danh mục và đơn vị tính.</p>' : ""),
    ));
    image.mount();

    const form = document.querySelector("#data-form");
    const kindSelect = form.querySelector("#f-kind");
    const categorySelect = form.querySelector("#f-category_id");
    const currentKind = () => (kindSelect ? kindSelect.value : kind);

    // Danh mục chỉ hiện các danh mục cùng nhóm với loại mặt hàng (UC-07.1 ngoại lệ 4.1).
    function fillCategories() {
      const selected = categorySelect.value || record.category_id || params.get("category_id");
      const sameGroup = categories.filter((c) => !c.catalog_kind || c.catalog_kind === currentKind());
      categorySelect.innerHTML = sameGroup.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
      if (sameGroup.some((c) => c.id === selected)) categorySelect.value = selected;
    }
    // Trường riêng: tiêu chuẩn nhập chỉ cho NVL; hạn dùng và hàng mẫu chỉ cho thành phẩm.
    function showKindFields() {
      const material = currentKind() === "MATERIAL";
      toggleField("material_quality_standard", material);
      for (const name of ["default_shelf_life_days", "is_sample", "is_published"]) toggleField(name, !material);
    }
    // Khi thêm mới: gợi ý đơn vị tính hay dùng nhất của các mặt hàng cùng danh mục
    // (ví dụ danh mục Bột → kg); danh mục chưa có mặt hàng thì NVL gợi ý kg, thành phẩm gợi ý cái.
    function suggestUnit() {
      if (isEdit) return;
      const counts = {};
      for (const item of items.filter((i) => i.category_id === categorySelect.value))
        counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
      const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const fallback = units.find((u) => u.code === (currentKind() === "MATERIAL" ? "KG" : "CAI"))?.id;
      const unitId = mostUsed || fallback;
      if (unitId) form.querySelector("#f-unit_id").value = unitId;
    }
    fillCategories();
    showKindFields();
    suggestUnit();
    kindSelect?.addEventListener("change", () => { fillCategories(); showKindFields(); suggestUnit(); });
    categorySelect.addEventListener("change", suggestUnit);

    bindForm(async (data) => {
      const material = currentKind() === "MATERIAL";
      const body = {
        name: data.name,
        category_id: data.category_id,
        unit_id: data.unit_id,
        reference_price: data.reference_price,
        description: data.description || null,
        image_path: await image.path(),
        material_quality_standard: material ? data.material_quality_standard || null : null,
        default_shelf_life_days: !material && data.default_shelf_life_days ? Number(data.default_shelf_life_days) : null,
        is_sample: !material && data.is_sample === "true",
        is_published: !material && data.is_published === "true",
      };
      return isEdit ? { version: record.version, ...body } : { kind: data.kind, ...body, is_active: true };
    }, isEdit ? "items/" + record.id : "items", isEdit ? "PATCH" : "POST");
  }

  // ---------------------------------------------------------------------------
  // CHỌN ẢNH (dùng chung cho danh mục và mặt hàng)
  // Ảnh được kiểm tra loại/dung lượng ở trình duyệt, tải lên khi bấm Lưu;
  // server kiểm tra lại nội dung file (UC-06.1 ngoại lệ 4.4).
  // ---------------------------------------------------------------------------
  function imagePicker(label, currentPath) {
    let keptPath = currentPath || null; // ảnh đang có; null khi người dùng bỏ ảnh
    let uploaded = null;                // { file, path } của lần tải lên gần nhất
    return {
      html: `<div class="field span2 item-photo-editor"><label for="image-file">${esc(label)}</label>
        <input id="image-file" type="file" accept="${IMAGE_TYPES.join(",")}">
        <div class="item-photo-preview" id="image-preview">${keptPath ? `<img src="${esc(keptPath)}" alt="${esc(label)}">` : ""}</div>
        <button type="button" class="button small" id="image-remove">Bỏ ảnh</button>
        <span class="hint">PNG, JPEG hoặc WebP, tối đa 5 MB. Ảnh không bắt buộc.</span></div>`,
      mount() {
        const input = document.querySelector("#image-file");
        const preview = document.querySelector("#image-preview");
        input.onchange = () => {
          const file = input.files[0];
          if (!file) return;
          if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
            input.value = "";
            toast("Ảnh không được chấp nhận. Chọn PNG, JPEG hoặc WebP tối đa 5 MB.");
            return;
          }
          preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Ảnh đang chọn">`;
        };
        document.querySelector("#image-remove").onclick = () => {
          input.value = "";
          keptPath = null;
          preview.replaceChildren();
        };
      },
      // Trả về đường dẫn ảnh để gửi kèm form; tải ảnh mới lên nếu có.
      async path() {
        const file = document.querySelector("#image-file").files[0];
        if (!file) return keptPath;
        if (uploaded?.file !== file) {
          const result = await api("category-images", "POST", { data_url: await readAsDataUrl(file) });
          uploaded = { file, path: result.data.image_path };
        }
        return uploaded.path;
      },
    };
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(Error("Không đọc được ảnh."));
      reader.readAsDataURL(file);
    });
  }

  function readOnlyField(label, value) {
    return `<div class="field"><label>${esc(label)}</label><input value="${esc(value || "")}" disabled></div>`;
  }

  // Ẩn trường không áp dụng; trường ẩn cũng bị bỏ khỏi dữ liệu gửi đi.
  function toggleField(name, visible) {
    const input = document.querySelector("#f-" + name);
    if (!input) return;
    input.closest(".field").hidden = !visible;
    input.disabled = !visible;
  }

  // ---------------------------------------------------------------------------
  // UC-06: DANH SÁCH DANH MỤC DẠNG THẺ
  // Mỗi thẻ: ảnh, tên, mô tả, liên kết "Xem mặt hàng" (UC-06 bước 4) và nút Sửa / Xóa.
  // ---------------------------------------------------------------------------
  function showCategoryCards() {
    if (current !== "categories") return;
    const table = document.querySelector("#table");
    if (!table) return;
    const title = document.querySelector(".heading h1");
    if (title) title.textContent = "Danh mục " + (pageKind === "MATERIAL" ? "nguyên vật liệu" : "thành phẩm");
    const pagination = table.querySelector(".pagination");
    if (!cached.length) {
      table.innerHTML = '<div class="empty">Không tìm thấy danh mục nào. Chọn Tạo mới để thêm.</div>'; // UC-06 ngoại lệ 2.1
      return;
    }
    table.innerHTML = '<div class="catalog-category-grid">' + cached.map(categoryCard).join("") + "</div>";
    if (pagination) table.append(pagination);
    table.querySelectorAll("[data-category-edit]").forEach((button) => {
      button.onclick = () => editForm(cached.find((r) => r.id === button.dataset.categoryEdit));
    });
    table.querySelectorAll("[data-category-delete]").forEach((button) => {
      button.onclick = () => actionForm(cached.find((r) => r.id === button.dataset.categoryDelete), "delete");
    });
  }

  function categoryCard(category) {
    const itemsUrl = "/catalog/data?module=items&kind=" + encodeURIComponent(category.catalog_kind || pageKind) +
      "&category_id=" + encodeURIComponent(category.id);
    const picture = category.image_path
      ? `<img src="${esc(category.image_path)}" alt="${esc(category.name)}">`
      : '<span class="catalog-category-icon" aria-hidden="true">▦</span>';
    return `<article class="catalog-category-card">
      <a href="${esc(itemsUrl)}">${picture}<h2>${esc(category.name)}</h2>
        <p>${esc(category.description || "Xem các mặt hàng trong danh mục")}</p><span>Xem mặt hàng →</span></a>
      <div class="inline-actions">
        <button class="button small" data-category-edit="${esc(category.id)}">Sửa danh mục</button>
        <button class="button small danger" data-category-delete="${esc(category.id)}">Xóa</button>
      </div></article>`;
  }

  loadTable = async function () {
    await previous.loadTable();
    showCategoryCards();
  };

  // Lần tải đầu tiên của trang có thể chạy trước khi file này được nạp, nên theo dõi
  // thêm vùng #content: hễ danh sách danh mục vừa được vẽ dạng bảng thì đổi sang thẻ.
  window.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector("#content");
    if (!content) return;
    const toCards = () => {
      if (current === "categories" && document.querySelector("#table > .table-wrap, #table > table")) showCategoryCards();
    };
    toCards(); // bảng có thể đã được vẽ xong trước khi trang nạp xong
    new MutationObserver(toCards).observe(content, { childList: true, subtree: true });
  });
})();
