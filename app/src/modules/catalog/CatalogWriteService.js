const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const { RESOURCES, hasVersion, isId, readInput } = require("./catalog-input");
const store = require("./catalog-store");
const { addCategory, editCategory, deleteCategory } = require("./uc06-danh-muc");
const { addItem, editItem, deleteItem } = require("./uc07-mat-hang");

class CatalogWriteService {
  constructor(pool, repository, resources = Object.keys(RESOURCES)) {
    this.pool = pool;
    this.repository = repository;
    this.resources = new Set(resources);
  }

  async create(user, resource, body, requestId) {
    this.checkAllowed(user, resource);
    let id;
    if (resource === "categories") id = await addCategory(this.pool, user, body, requestId);
    else if (resource === "items") id = await addItem(this.pool, user, body, requestId);
    else id = await addOther(this.pool, user, resource, body, requestId);
    return this.repository.get(resource, id);
  }

  async update(user, resource, id, body, requestId) {
    this.checkAllowed(user, resource);
    checkId(id);
    if (resource === "categories") await editCategory(this.pool, user, id, body, requestId);
    else if (resource === "items") await editItem(this.pool, user, id, body, requestId);
    else await editOther(this.pool, user, resource, id, body, requestId);
    return this.repository.get(resource, id);
  }

  async remove(user, resource, id, body, requestId) {
    this.checkAllowed(user, resource);
    checkId(id);
    const input = body || {};
    C.fields(input, hasVersion(resource) ? ["version"] : []);
    if (resource === "categories") await deleteCategory(this.pool, user, id, input, requestId);
    else if (resource === "items") await deleteItem(this.pool, user, id, input, requestId);
    else await deleteOther(this.pool, user, resource, id, requestId);
    return { id: String(id), deleted: true };
  }

  checkAllowed(user, resource) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(!RESOURCES[resource] || !this.resources.has(resource), "NOT_IMPLEMENTED", "Chức năng chưa được triển khai.", 501);
  }
}

function checkId(id) {
  C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
}

async function addOther(pool, user, resource, body, requestId) {
  const values = readInput(resource, body, "create");
  values.is_active ??= 1;
  return store.transaction(pool, async (db) => {
    if (resource === "warehouse-locations") await checkWarehouse(db, values.warehouse_id);
    const id = await store.insertRow(db, resource, values);
    await store.audit(db, user, resource, id, "CREATE", null, values, requestId);
    return id;
  });
}

async function editOther(pool, user, resource, id, body, requestId) {
  const changes = readInput(resource, body, "edit");
  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, resource, id);
    await store.updateRow(db, resource, id, changes);
    await store.audit(db, user, resource, id, "UPDATE", current, changes, requestId);
  });
}

async function deleteOther(pool, user, resource, id, requestId) {
  await store.transaction(pool, async (db) => {
    const current = await store.lockRow(db, resource, id);
    await store.deleteRow(db, resource, id);
    await store.audit(db, user, resource, id, "DELETE", current, null, requestId);
  });
}

async function checkWarehouse(db, warehouseId) {
  const [[warehouse]] = await db.execute("SELECT id FROM warehouses WHERE id=? AND is_active=1", [warehouseId]);
  C.fail(!warehouse, "VALIDATION_ERROR", "Kho không tồn tại hoặc đã ngừng hoạt động.");
}

module.exports = CatalogWriteService;
