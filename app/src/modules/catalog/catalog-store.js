const C = require("../../services/domain/core");
const runTransaction = require("../../shared/transaction");
const { RESOURCES, hasVersion } = require("./catalog-input");

const tableOf = (resource) => RESOURCES[resource].table;

async function transaction(pool, work) {
  try {
    return await runTransaction(pool, work);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Mã hoặc tên đã tồn tại.");
    if (error.code === "ER_ROW_IS_REFERENCED_2") throw new C.DomainError(409, "IN_USE", "Không thể xóa vì dữ liệu đang được sử dụng.");
    throw error;
  }
}

async function lockRow(db, resource, id) {
  const [[row]] = await db.execute(`SELECT * FROM ${tableOf(resource)} WHERE id=? FOR UPDATE`, [id]);
  C.fail(!row, "NOT_FOUND", `Không tìm thấy ${RESOURCES[resource].label}. Vui lòng tải lại danh sách.`, 404);
  return row;
}

async function insertRow(db, resource, values) {
  const columns = Object.keys(values);
  const marks = columns.map(() => "?");
  const [result] = await db.execute(
    `INSERT INTO ${tableOf(resource)} (${columns.join(",")}) VALUES (${marks.join(",")})`,
    Object.values(values),
  );
  return result.insertId;
}

async function updateRow(db, resource, id, values) {
  const sets = Object.keys(values).map((column) => `${column}=?`);
  if (hasVersion(resource)) sets.push("version=version+1");
  if (!sets.length) return;
  await db.execute(`UPDATE ${tableOf(resource)} SET ${sets.join(",")} WHERE id=?`, [...Object.values(values), id]);
}

async function deleteRow(db, resource, id) {
  await db.execute(`DELETE FROM ${tableOf(resource)} WHERE id=?`, [id]);
}

async function checkNameFree(db, resource, name, exceptId = 0) {
  if (!name) return;
  const [[same]] = await db.execute(`SELECT id FROM ${tableOf(resource)} WHERE name=? AND id<>? LIMIT 1`, [name, exceptId]);
  C.fail(same, "DUPLICATE", `Tên ${RESOURCES[resource].label} đã tồn tại. Vui lòng nhập tên khác.`, 409);
}

async function nextCode(db, resource, prefix) {
  const [rows] = await db.execute(`SELECT code FROM ${tableOf(resource)} WHERE code LIKE ?`, [prefix + "-%"]);
  const numbers = rows
    .map((row) => row.code.slice(prefix.length + 1))
    .filter((text) => /^\d+$/.test(text))
    .map(Number);
  return prefix + "-" + String(Math.max(0, ...numbers) + 1).padStart(3, "0");
}

async function audit(db, user, resource, id, action, before, after, requestId) {
  await db.execute(
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,?,?,?,?,?,?)",
    [user.id, resource, id, action, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, requestId],
  );
}

module.exports = { transaction, lockRow, insertRow, updateRow, deleteRow, checkNameFree, nextCode, audit };
