(() => {
  const KIND_OPTIONS = [
    { id: "FINISHED_PRODUCT", name: "Thành phẩm" },
    { id: "MATERIAL", name: "Nguyên vật liệu / vật tư đóng gói" },
  ];
  const YES_NO = [{ id: "true", name: "Có" }, { id: "false", name: "Không" }];
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const params = new URLSearchParams(location.search);
  const pageKind = params.get("kind") || "FINISHED_PRODUCT";

  const previous = { createForm, editForm, loadTable };
  const ownsForm = () => current === "categories" || current === "items";

  createForm = async function () {
    if (current === "categories") return categoryForm();
    if (current === "items") return itemForm();
    return previous.createForm();
  };

  editForm = async function (record) {
    if (!ownsForm()) return previous.editForm(record);
    try {
      const fresh = (await api(current + "/" + record.id)).data;
      return current === "categories" ? categoryForm(fresh) : itemForm(fresh);
    } catch (error) {
      toast(error.message);
    }
  };

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

  async function itemForm(record = {}) {
    const isEdit = Boolean(record.id);
    const categories = await options("categories");
    const units = await options("units");
    const items = await options("items");
    const kind = record.kind || pageKind;
    const image = imagePicker("Ảnh mặt hàng", record.image_path);

    openModal(isEdit ? "Sửa mặt hàng" : "Thêm mặt hàng", formWrap(itemFormHTML(record, kind, units, image)));
    image.mount();

    const form = document.querySelector("#data-form");
    const kindSelect = form.querySelector("#f-kind");
    const categorySelect = form.querySelector("#f-category_id");
    const currentKind = () => (kindSelect ? kindSelect.value : kind);

    const refresh = () => {
      fillCategories(categorySelect, categories, currentKind(), record.category_id);
      showKindFields(currentKind());
      if (!isEdit) suggestUnit(form, categorySelect.value, currentKind(), units, items);
    };
    refresh();
    kindSelect?.addEventListener("change", refresh);
    categorySelect.addEventListener("change", () => {
      if (!isEdit) suggestUnit(form, categorySelect.value, currentKind(), units, items);
    });

    const path = isEdit ? "items/" + record.id : "items";
    const method = isEdit ? "PATCH" : "POST";
    bindForm(async (data) => {
      const body = readItemForm(data, currentKind(), await image.path());
      return isEdit ? { version: record.version, ...body } : { kind: data.kind, ...body, is_active: true };
    }, path, method);
  }

  function itemFormHTML(record, kind, units, image) {
    const isEdit = Boolean(record.id);
    const kindField = isEdit
      ? readOnlyField("Loại mặt hàng", KIND_OPTIONS.find((k) => k.id === kind)?.name)
      : inputField("kind", "select", true, KIND_OPTIONS, kind);
    const note = isEdit
      ? '<p class="span2 hint">Mặt hàng đã có lô, đơn hàng hoặc kế hoạch thì không đổi được danh mục và đơn vị tính.</p>'
      : "";
    return (
      inputField("name", "text", true, [], record.name || "") +
      kindField +
      inputField("category_id", "select", true, [], "") +
      inputField("unit_id", "select", true, units, record.unit_id || "") +
      inputField("reference_price", "number", true, [], record.reference_price ?? "") +
      inputField("material_quality_standard", "textarea", false, [], record.material_quality_standard || "") +
      inputField("default_shelf_life_days", "number", false, [], record.default_shelf_life_days ?? "") +
      inputField("is_sample", "select", true, YES_NO, String(Boolean(record.is_sample))) +
      inputField("is_published", "select", true, YES_NO, String(Boolean(record.is_published))) +
      inputField("description", "textarea", false, [], record.description || "") +
      image.html +
      note
    );
  }

  function readItemForm(data, kind, imagePath) {
    const isMaterial = kind === "MATERIAL";
    return {
      name: data.name,
      category_id: data.category_id,
      unit_id: data.unit_id,
      reference_price: data.reference_price,
      description: data.description || null,
      image_path: imagePath,
      material_quality_standard: isMaterial ? data.material_quality_standard || null : null,
      default_shelf_life_days: !isMaterial && data.default_shelf_life_days ? Number(data.default_shelf_life_days) : null,
      is_sample: !isMaterial && data.is_sample === "true",
      is_published: !isMaterial && data.is_published === "true",
    };
  }

  function fillCategories(categorySelect, categories, kind, savedCategoryId) {
    const selected = categorySelect.value || savedCategoryId || params.get("category_id");
    const sameGroup = categories.filter((c) => !c.catalog_kind || c.catalog_kind === kind);
    categorySelect.innerHTML = sameGroup.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    if (sameGroup.some((c) => c.id === selected)) categorySelect.value = selected;
  }

  function showKindFields(kind) {
    const isMaterial = kind === "MATERIAL";
    toggleField("material_quality_standard", isMaterial);
    for (const name of ["default_shelf_life_days", "is_sample", "is_published"]) toggleField(name, !isMaterial);
  }

  function suggestUnit(form, categoryId, kind, units, items) {
    const counts = {};
    for (const item of items.filter((i) => i.category_id === categoryId))
      counts[item.unit_id] = (counts[item.unit_id] || 0) + 1;
    const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const fallback = units.find((u) => u.code === (kind === "MATERIAL" ? "KG" : "CAI"))?.id;
    const unitId = mostUsed || fallback;
    if (unitId) form.querySelector("#f-unit_id").value = unitId;
  }

  function imagePicker(label, currentPath) {
    let keptPath = currentPath || null;
    let uploaded = null;
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

  function toggleField(name, visible) {
    const input = document.querySelector("#f-" + name);
    if (!input) return;
    input.closest(".field").hidden = !visible;
    input.disabled = !visible;
  }

  function showCategoryCards() {
    if (current !== "categories") return;
    const table = document.querySelector("#table");
    if (!table) return;
    const title = document.querySelector(".heading h1");
    if (title) title.textContent = "Danh mục " + (pageKind === "MATERIAL" ? "nguyên vật liệu" : "thành phẩm");
    const pagination = table.querySelector(".pagination");
    if (!cached.length) {
      table.innerHTML = '<div class="empty">Không tìm thấy danh mục nào. Chọn Tạo mới để thêm.</div>';
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

  window.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector("#content");
    if (!content) return;
    const toCards = () => {
      if (current === "categories" && document.querySelector("#table > .table-wrap, #table > table")) showCategoryCards();
    };
    toCards();
    new MutationObserver(toCards).observe(content, { childList: true, subtree: true });
  });
})();
