const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
class WarehouseRecordService {
  constructor(pool) { this.pool = pool; }

  visible(user, row) {
    return user.roles.includes("DIRECTOR") || user.roles.includes("WAREHOUSE_MANAGER") ||
      (user.roles.includes("WORKSHOP_OWNER") && user.workshop_ids.includes(String(row.workshop_id)));
  }

  async list(user, query = {}) {
    P.role(user, P.read["warehouse-records"]);
    C.fields(query, ["page", "per_page", "q", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (user.roles.includes("WORKSHOP_OWNER") && !user.roles.includes("DIRECTOR") && !user.roles.includes("WAREHOUSE_MANAGER")) {
      if (!user.workshop_ids.length) where.push("1=0");
      else { where.push("r.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")"); params.push(...user.workshop_ids); }
    }
    if (query.q) { C.text(query.q, "q", 150); where.push("r.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const base = " FROM warehouse_records x JOIN stock_requests r ON r.id=x.stock_request_id" + (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total" + base, params);
    const [rows] = await this.pool.execute("SELECT x.*,r.code AS stock_request_code,r.workshop_id,r.warehouse_id,r.type,r.status AS request_status" + base + " ORDER BY x.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map(normalize), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["warehouse-records"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy hồ sơ kho.", 404);
    const [rows] = await connection.execute("SELECT x.*,r.code AS stock_request_code,r.workshop_id,r.warehouse_id,r.type,r.status AS request_status FROM warehouse_records x JOIN stock_requests r ON r.id=x.stock_request_id WHERE x.id=?", [id]);
    C.fail(!rows.length || !this.visible(user, rows[0]), "NOT_FOUND", "Không tìm thấy hồ sơ kho.", 404);
    const [documents] = await connection.execute("SELECT id,code,type,posted_at,posted_by FROM stock_documents WHERE stock_request_id=? ORDER BY posted_at,id", [rows[0].stock_request_id]);
    const [lines] = await connection.execute("SELECT r.item_id,i.code AS item_code,i.name AS item_name,r.quantity AS requested_quantity,COALESCE(SUM(d.quantity),0) AS posted_quantity FROM stock_request_lines r JOIN items i ON i.id=r.item_id LEFT JOIN stock_document_lines d ON d.stock_request_line_id=r.id WHERE r.stock_request_id=? GROUP BY r.id ORDER BY r.id", [rows[0].stock_request_id]);
    return { ...normalize(rows[0]), documents: documents.map(normalize), lines: lines.map(normalize) };
  }

  async create(user, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fields(body, ["stock_request_id", "note"]);
    C.fail(!isId(body.stock_request_id), "VALIDATION_ERROR", "Yêu cầu kho không hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [requests] = await connection.execute("SELECT * FROM stock_requests WHERE id=? FOR UPDATE", [body.stock_request_id]);
      C.fail(!requests.length, "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
      const request = requests[0];
      C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);
      C.fail(request.status !== "FULFILLED", "INVALID_STATE", "Yêu cầu chưa được xử lý đủ.", 409);
      const [exists] = await connection.execute("SELECT id FROM warehouse_records WHERE stock_request_id=?", [request.id]);
      C.fail(exists.length, "DUPLICATE", "Yêu cầu đã có hồ sơ tổng hợp.", 409);
      const [created] = await connection.execute("INSERT INTO warehouse_records (stock_request_id,manager_id,note) VALUES (?,?,?)", [request.id, user.id, body.note || null]);
      id = created.insertId;
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'warehouse-records',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ stock_request_id: request.id }), requestId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Yêu cầu đã có hồ sơ tổng hợp.");
      throw error;
    } finally { connection.release(); }
    return this.get(user, id);
  }
}

function normalize(row) {
  const result = { ...row, actions: [] };
  for (const key of Object.keys(result)) if (key === "id" || key.endsWith("_id")) result[key] = result[key] == null ? null : String(result[key]);
  return result;
}
module.exports = WarehouseRecordService;
