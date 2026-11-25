const C = require("../../services/domain/core");
const { readInput } = require("./catalog-input");
const store = require("./catalog-store");

const ITEM_USAGE = [
  ["lots", "lô hàng / tồn kho"],
  ["stock_request_lines", "yêu cầu nhập xuất"],
  ["customer_order_lines", "đơn hàng"],
  ["purchase_order_lines", "đơn mua hàng"],
  ["business_plan_lines", "kế hoạch mua bán"],
  ["production_plan_lines", "kế hoạch sản xuất"],
  ["report_details", "báo cáo sản xuất"],
];

async function addItem(pool, user, body, requestId) {
  const item = readInput("items", body, "create");
  item.is_active ??= 1;
  item.is_sample ??= 0;
  item.is_published ??= 0;
  item.version = 1;
  checkSampleFlags(item.kind, item);
  const ownFields = takeOwnFields(item);

  return store.transaction(pool, async (db) => {
    await checkCategory(db, item.category_id, item.kind);
    await checkUnit(db, item.unit_id);
    await store.checkNameFree(db, "items", item.name);
    item.code ||= await store.nextCode(db, "items", item.kind === "MATERIAL" ? "NVL" : "TP");
    const id = await store.insertRow(db, "items", item);
    await saveOwnFields(db, id, item.kind, ownFields);
    await store.audit(db, user, "items", id, "CREATE", null, item, requestId);
    return id;
  });
}

async function editItem(pool, user, id, body, requestId) {
  const changes = readInput("items", body, "edit");
  const ownFields = takeOwnFields(changes);

  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, "items", id);
    C.version(current, body.version);
    checkSampleFlags(current.kind, { ...current, ...changes });
    await checkCategoryAndUnitChange(db, current, changes);
    await checkCategory(db, changes.category_id, current.kind);
    await checkUnit(db, changes.unit_id);
    await store.checkNameFree(db, "items", changes.name, id);
    await store.updateRow(db, "items", id, changes);
    await saveOwnFields(db, id, current.kind, ownFields);
    await store.audit(db, user, "items", id, "UPDATE", current, { ...changes, ...ownFields }, requestId);
  });
}

async function deleteItem(pool, user, id, body, requestId) {
  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, "items", id);
    C.version(current, body.version);
    const usedIn = await findUsage(db, id);
    C.fail(usedIn.length, "IN_USE", `Không thể xóa mặt hàng vì đã phát sinh ${usedIn.join(", ")}.`, 409);
    await store.deleteRow(db, "items", id);
    await store.audit(db, user, "items", id, "DELETE", current, null, requestId);
  });
}

function checkSampleFlags(kind, item) {
  C.fail(item.is_sample === 1 && kind !== "FINISHED_PRODUCT", "VALIDATION_ERROR", "Chỉ thành phẩm được đánh dấu hàng mẫu.");
  C.fail(item.is_published === 1 && item.is_sample !== 1, "VALIDATION_ERROR", "Chỉ công bố mặt hàng mẫu.");
}

async function checkCategory(db, categoryId, itemKind) {
  if (!categoryId) return;
  const [[category]] = await db.execute("SELECT is_active,LoaiDanhMuc FROM categories WHERE id=?", [categoryId]);
  C.fail(!category || !category.is_active, "VALIDATION_ERROR", "Danh mục không còn được sử dụng. Vui lòng chọn lại.");
  C.fail(category.LoaiDanhMuc && category.LoaiDanhMuc !== itemKind, "VALIDATION_ERROR", "Mặt hàng phải thuộc đúng nhóm của danh mục.");
}

async function checkUnit(db, unitId) {
  if (!unitId) return;
  const [[unit]] = await db.execute("SELECT id FROM units WHERE id=?", [unitId]);
  C.fail(!unit, "VALIDATION_ERROR", "Đơn vị tính không tồn tại. Vui lòng chọn lại.");
}

async function checkCategoryAndUnitChange(db, current, changes) {
  const changed = [];
  if (changes.category_id && changes.category_id !== String(current.category_id)) changed.push("danh mục");
  if (changes.unit_id && changes.unit_id !== String(current.unit_id)) changed.push("đơn vị tính");
  if (!changed.length) return;

  const usedIn = await findUsage(db, current.id);
  C.fail(usedIn.length, "IN_USE",
    `Không đổi được ${changed.join(" và ")} vì mặt hàng đã phát sinh ${usedIn.join(", ")}. Thông tin cũ được giữ nguyên.`, 409);
}

async function findUsage(db, itemId) {
  const usedIn = [];
  for (const [table, label] of ITEM_USAGE) {
    const [[row]] = await db.execute(`SELECT 1 AS used FROM ${table} WHERE item_id=? LIMIT 1`, [itemId]);
    if (row) usedIn.push(label);
  }
  return usedIn;
}

function takeOwnFields(item) {
  const ownFields = {};
  for (const field of ["material_quality_standard", "default_shelf_life_days"]) {
    if (!Object.hasOwn(item, field)) continue;
    ownFields[field] = item[field];
    delete item[field];
  }
  return ownFields;
}

async function saveOwnFields(db, itemId, kind, fields) {
  const isMaterial = kind === "MATERIAL", isProduct = kind === "FINISHED_PRODUCT";
  C.fail(!isMaterial && fields.material_quality_standard != null, "VALIDATION_ERROR", "Chỉ nguyên vật liệu có tiêu chuẩn nhập.");
  C.fail(!isProduct && fields.default_shelf_life_days != null, "VALIDATION_ERROR", "Chỉ thành phẩm có hạn sử dụng mặc định.");

  if (isMaterial && Object.hasOwn(fields, "material_quality_standard"))
    await db.execute("UPDATE NguyenVatLieu SET TieuChuanNhap=? WHERE MaMatHang=?", [fields.material_quality_standard, itemId]);
  if (isProduct && Object.hasOwn(fields, "default_shelf_life_days"))
    await db.execute("UPDATE ThanhPham SET HanSuDungMacDinhNgay=? WHERE MaMatHang=?", [fields.default_shelf_life_days, itemId]);
}

module.exports = { addItem, editItem, deleteItem };
