const C = require("../../services/domain/core");
const { readInput } = require("./catalog-input");
const store = require("./catalog-store");

async function addCategory(pool, user, body, requestId) {
  const category = readInput("categories", body, "create");
  category.is_active ??= 1;

  return store.transaction(pool, async (db) => {
    await store.checkNameFree(db, "categories", category.name);
    category.code ||= await store.nextCode(db, "categories", "DM");
    const id = await store.insertRow(db, "categories", category);
    await store.audit(db, user, "categories", id, "CREATE", null, category, requestId);
    return id;
  });
}

async function editCategory(pool, user, id, body, requestId) {
  const changes = readInput("categories", body, "edit");

  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, "categories", id);
    C.version(current, body.version);
    await checkGroupChange(db, id, changes.LoaiDanhMuc);
    await store.checkNameFree(db, "categories", changes.name, id);
    await store.updateRow(db, "categories", id, changes);
    await store.audit(db, user, "categories", id, "UPDATE", current, changes, requestId);
  });
}

async function deleteCategory(pool, user, id, body, requestId) {
  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, "categories", id);
    C.version(current, body.version);
    await checkNotUsed(db, id);
    await store.deleteRow(db, "categories", id);
    await store.audit(db, user, "categories", id, "DELETE", current, null, requestId);
  });
}

async function checkGroupChange(db, categoryId, newGroup) {
  if (!newGroup) return;
  const [[other]] = await db.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=? AND kind<>?", [categoryId, newGroup]);
  C.fail(Number(other.total) > 0, "IN_USE", "Không đổi được nhóm: danh mục đang chứa mặt hàng thuộc nhóm khác.", 409);
}

async function checkNotUsed(db, categoryId) {
  const [[items]] = await db.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=?", [categoryId]);
  const [[zones]] = await db.execute("SELECT COUNT(*) AS total FROM warehouse_locations WHERE zone_category_id=?", [categoryId]);
  C.fail(Number(items.total) > 0, "IN_USE", `Không thể xóa vì danh mục đang được sử dụng (${items.total} mặt hàng).`, 409);
  C.fail(Number(zones.total) > 0, "IN_USE", "Không thể xóa vì danh mục đang được gắn cho khu trong kho.", 409);
}

module.exports = { addCategory, editCategory, deleteCategory };
