const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (v) => /^[1-9]\d*$/.test(String(v));
class ProductionReportService {
  constructor(pool) { this.pool = pool; }

  visible(user, row) {
    return user.roles.includes("PLANNER") || user.roles.includes("DIRECTOR") ||
      (user.roles.includes("WORKSHOP_OWNER") && user.workshop_ids.includes(String(row.workshop_id)));
  }

  present(user, row) {
    const result = { ...row };
    for (const field of ["id", "production_plan_id", "created_by", "workshop_id"])
      if (result[field] != null) result[field] = String(result[field]);
    result.actions = user.roles.includes("WORKSHOP_OWNER") && user.workshop_ids.includes(String(row.workshop_id)) && row.status === "DRAFT" ? ["edit", "submit"] : [];
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["production-reports"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (!user.roles.includes("PLANNER") && !user.roles.includes("DIRECTOR")) {
      if (!user.workshop_ids.length) where.push("1=0");
      else { where.push("p.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")"); params.push(...user.workshop_ids); }
    }
    if (query.status) { C.fail(!["DRAFT", "SUBMITTED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ."); where.push("r.status=?"); params.push(query.status); }
    if (query.q) { C.text(query.q, "q", 150); where.push("r.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const base = " FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total" + base + filter, params);
    const [rows] = await this.pool.execute("SELECT r.*,p.workshop_id,p.code AS production_plan_code" + base + filter + " ORDER BY r.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map((row) => this.present(user, row)), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["production-reports"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
    const [rows] = await connection.execute("SELECT r.*,p.workshop_id,p.code AS production_plan_code FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=?", [id]);
    C.fail(!rows.length || !this.visible(user, rows[0]), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
    const [lines] = await connection.execute("SELECT l.*,i.name AS item_name,i.code AS item_code FROM production_report_lines l JOIN items i ON i.id=l.item_id WHERE l.production_report_id=? ORDER BY l.id", [id]);
    return { ...this.present(user, rows[0]), lines: lines.map((line) => ({ ...line, id: String(line.id), item_id: String(line.item_id), production_report_id: String(line.production_report_id), shortage_quantity: C.decimal(C.qty(String(line.required_quantity)) > C.qty(String(line.available_quantity), false) ? C.qty(String(line.required_quantity)) - C.qty(String(line.available_quantity), false) : 0n) })) };
  }

  async validateLines(connection, lines) {
    C.fail(!Array.isArray(lines) || !lines.length || lines.length > 100, "VALIDATION_ERROR", "Báo cáo cần 1 đến 100 dòng nguyên liệu.");
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", "available_quantity", "required_quantity"]);
      C.fail(!isId(line.item_id) || seen.has(String(line.item_id)), "VALIDATION_ERROR", "Nguyên liệu trùng hoặc không hợp lệ.");
      seen.add(String(line.item_id));
      C.qty(line.available_quantity, false);
      C.qty(line.required_quantity);
    }
    const [items] = await connection.execute("SELECT id,kind,is_active FROM items WHERE id IN (" + [...seen].map(() => "?").join(",") + ") FOR SHARE", [...seen]);
    const byId = new Map(items.map((item) => [String(item.id), item]));
    return lines.map((line) => {
      const item = byId.get(String(line.item_id));
      C.fail(!item || item.kind !== "MATERIAL" || !item.is_active, "VALIDATION_ERROR", "Chỉ chọn nguyên liệu đang hoạt động.");
      return { item_id: String(line.item_id), available_quantity: C.decimal(C.qty(line.available_quantity, false)), required_quantity: C.decimal(C.qty(line.required_quantity)) };
    });
  }

  async create(user, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["production_plan_id", "note", "lines"]);
    C.fail(!isId(body.production_plan_id), "VALIDATION_ERROR", "Kế hoạch sản xuất không hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [plans] = await connection.execute("SELECT * FROM production_plans WHERE id=? FOR UPDATE", [body.production_plan_id]);
      C.fail(!plans.length || !user.workshop_ids.includes(String(plans[0].workshop_id)), "NOT_FOUND", "Không tìm thấy kế hoạch thuộc xưởng.", 404);
      C.state(plans[0], ["APPROVED", "IN_PROGRESS"]);
      const lines = await this.validateLines(connection, body.lines);
      const code = "BCSX-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO production_reports (code,production_plan_id,created_by,note,status,version) VALUES (?,?,?,?,'DRAFT',1)", [code, body.production_plan_id, user.id, body.note || null]);
      id = created.insertId;
      for (const line of lines) await connection.execute("INSERT INTO production_report_lines (production_report_id,item_id,available_quantity,required_quantity) VALUES (?,?,?,?)", [id, line.item_id, line.available_quantity, line.required_quantity]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'production-reports',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ code, production_plan_id: body.production_plan_id }), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version", "note", "lines"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản báo cáo.");
    C.fail(body.note === undefined && body.lines === undefined, "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT r.*,p.workshop_id FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=? FOR UPDATE", [id]);
      C.fail(!rows.length || !user.workshop_ids.includes(String(rows[0].workshop_id)), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
      const report = rows[0];
      C.version(report, body.version); C.state(report, ["DRAFT"]);
      if (body.lines !== undefined) {
        const lines = await this.validateLines(connection, body.lines);
        await connection.execute("DELETE FROM production_report_lines WHERE production_report_id=?", [id]);
        for (const line of lines) await connection.execute("INSERT INTO production_report_lines (production_report_id,item_id,available_quantity,required_quantity) VALUES (?,?,?,?)", [id, line.item_id, line.available_quantity, line.required_quantity]);
      }
      await connection.execute("UPDATE production_reports SET note=?,version=version+1 WHERE id=?", [body.note === undefined ? report.note : body.note || null, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-reports',?,'UPDATE',?,?,?)", [user.id, id, JSON.stringify({ version: report.version }), JSON.stringify(body), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async submit(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản báo cáo.");
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT r.*,p.workshop_id FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=? FOR UPDATE", [id]);
      C.fail(!rows.length || !user.workshop_ids.includes(String(rows[0].workshop_id)), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
      const report = rows[0];
      C.version(report, body.version); C.state(report, ["DRAFT"]);
      const [lines] = await connection.execute("SELECT item_id,required_quantity FROM production_report_lines WHERE production_report_id=?", [id]);
      C.fail(!lines.length, "INVALID_STATE", "Báo cáo chưa có nguyên liệu.", 409);
      for (const line of lines) await connection.execute("INSERT INTO production_plan_materials (production_plan_id,item_id,required_quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE required_quantity=VALUES(required_quantity)", [report.production_plan_id, line.item_id, line.required_quantity]);
      await connection.execute("UPDATE production_reports SET status='SUBMITTED',submitted_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?", [id]);
      await connection.execute("UPDATE production_plans SET status='IN_PROGRESS',version=version+1 WHERE id=? AND status='APPROVED'", [report.production_plan_id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-reports',?,'SUBMIT',?,?,?)", [user.id, id, JSON.stringify({ status: "DRAFT" }), JSON.stringify({ status: "SUBMITTED" }), requestId]);
      await connection.execute("INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?, 'production-reports',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='PLANNER' ON DUPLICATE KEY UPDATE id=notifications.id", [`Báo cáo sản xuất ${report.code} đã gửi`, `Báo cáo sản xuất ${report.code} đã gửi`, id, `report-${id}-submitted`]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }
}

module.exports = ProductionReportService;
