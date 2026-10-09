const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (v) => /^[1-9]\d*$/.test(String(v));
class QualityCampaignService {
  constructor(pool) { this.pool = pool; }

  visible(user, row) {
    return user.roles.includes("DIRECTOR") || user.roles.includes("WAREHOUSE_MANAGER") ||
      (user.roles.includes("QC_INSPECTOR") && row.assignee_ids.includes(String(user.id)));
  }

  async assignments(connection, campaignId) {
    const [rows] = await connection.execute("SELECT user_id FROM quality_campaign_assignments WHERE campaign_id=?", [campaignId]);
    return rows.map((row) => String(row.user_id));
  }

  async present(user, row, connection = this.pool) {
    const assignee_ids = await this.assignments(connection, row.id);
    const [lotRows] = await connection.execute("SELECT lot_id FROM quality_campaign_lots WHERE campaign_id=?", [row.id]);
    return {
      ...row, id: String(row.id), created_by: String(row.created_by), assignee_ids,
      lot_ids: lotRows.map((lot) => String(lot.lot_id)),
      planned_date: row.planned_date instanceof Date ? row.planned_date.toISOString().slice(0, 10) : row.planned_date,
      actions: user.roles.includes("DIRECTOR") && row.status === "PLANNED" ? ["start"] : user.roles.includes("DIRECTOR") && row.status === "COMPLETED" ? ["close"] : [],
    };
  }

  async list(user, query = {}) {
    P.role(user, ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = ["s.campaign_type='QUALITY_CHECK'"], params = [];
    if (user.roles.includes("QC_INSPECTOR") && !user.roles.includes("DIRECTOR") && !user.roles.includes("WAREHOUSE_MANAGER")) {
      where.push("EXISTS (SELECT 1 FROM quality_campaign_assignments a WHERE a.campaign_id=s.id AND a.user_id=?)"); params.push(user.id);
    }
    if (query.status) { C.fail(!["PLANNED", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ."); where.push("s.status=?"); params.push(query.status); }
    if (query.q) { C.text(query.q, "q", 150); where.push("s.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = " WHERE " + where.join(" AND ");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM stocktakes s" + filter, params);
    const [rows] = await this.pool.execute("SELECT s.* FROM stocktakes s" + filter + " ORDER BY s.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: await Promise.all(rows.map((row) => this.present(user, row))), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const [rows] = await connection.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK'", [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const result = await this.present(user, rows[0], connection);
    C.fail(!this.visible(user, result), "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const [lots] = await connection.execute("SELECT l.id,l.code,l.received_quantity,l.qc_status,i.name AS item_name,i.kind FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id JOIN items i ON i.id=l.item_id WHERE q.campaign_id=? ORDER BY l.id", [id]);
    result.lots = lots.map((row) => ({ ...row, id: String(row.id) }));
    return result;
  }

  async create(user, body, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, ["campaign_type", "quality_kind", "planned_date", "start_at", "end_at", "location", "assignee_ids", "lot_ids", "note"]);
    C.fail(body.campaign_type !== "QUALITY_CHECK" || !["MATERIAL", "FINISHED_PRODUCT"].includes(body.quality_kind), "VALIDATION_ERROR", "Loại lịch QC không hợp lệ.");
    C.date(body.planned_date, "planned_date", true);
    C.text(body.location, "location", 500);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const start = Date.parse(body.start_at), end = Date.parse(body.end_at);
    C.fail(!Number.isFinite(start) || !Number.isFinite(end) || end <= start, "VALIDATION_ERROR", "Thời gian lịch QC không hợp lệ.");
    C.fail(!Array.isArray(body.assignee_ids) || !body.assignee_ids.length || body.assignee_ids.length > 50 || new Set(body.assignee_ids.map(String)).size !== body.assignee_ids.length || body.assignee_ids.some((id) => !isId(id)), "VALIDATION_ERROR", "Nhân viên QC không hợp lệ.");
    C.fail(!Array.isArray(body.lot_ids) || !body.lot_ids.length || body.lot_ids.length > 100 || new Set(body.lot_ids.map(String)).size !== body.lot_ids.length || body.lot_ids.some((id) => !isId(id)), "VALIDATION_ERROR", "Danh sách lô không hợp lệ.");
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [assignees] = await connection.execute("SELECT DISTINCT ur.user_id FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN users u ON u.id=ur.user_id WHERE r.code='QC_INSPECTOR' AND u.status='ACTIVE' AND ur.user_id IN (" + body.assignee_ids.map(() => "?").join(",") + ")", body.assignee_ids);
      C.fail(assignees.length !== body.assignee_ids.length, "VALIDATION_ERROR", "Người được giao không có vai trò QC.");
      const [lots] = await connection.execute("SELECT l.id,l.qc_status,i.kind,l.production_plan_id FROM lots l JOIN items i ON i.id=l.item_id WHERE l.id IN (" + body.lot_ids.map(() => "?").join(",") + ") FOR UPDATE", body.lot_ids);
      C.fail(lots.length !== body.lot_ids.length || lots.some((lot) => lot.qc_status !== "PENDING" || lot.kind !== body.quality_kind), "VALIDATION_ERROR", "Lô không chờ QC hoặc sai loại.");
      for (const lot of lots) {
        if (lot.production_plan_id) {
          const [reports] = await connection.execute("SELECT r.id FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id JOIN lots l ON l.id=o.lot_id WHERE l.id=? AND r.status='SUBMITTED'", [lot.id]);
          C.fail(!reports.length, "INVALID_STATE", "Lô thành phẩm chưa có báo cáo đã gửi.", 409);
        }
        const [scheduled] = await connection.execute("SELECT q.campaign_id FROM quality_campaign_lots q JOIN stocktakes s ON s.id=q.campaign_id WHERE q.lot_id=? AND s.status IN ('PLANNED','IN_PROGRESS')", [lot.id]);
        C.fail(scheduled.length, "DUPLICATE", "Lô đã có lịch QC đang hoạt động.", 409);
      }
      const code = "LQC-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO stocktakes (code,created_by,planned_date,start_at,end_at,item_kind,status,note,version,campaign_type,quality_kind,location) VALUES (?,?,?,?,?,?,'PLANNED',?,1,'QUALITY_CHECK',?,?)", [code, user.id, body.planned_date, new Date(start), new Date(end), body.quality_kind, body.note || null, body.quality_kind, body.location.trim()]);
      id = created.insertId;
      for (const lotId of body.lot_ids) await connection.execute("INSERT INTO quality_campaign_lots (campaign_id,lot_id) VALUES (?,?)", [id, lotId]);
      for (const userId of body.assignee_ids) await connection.execute("INSERT INTO quality_campaign_assignments (campaign_id,user_id) VALUES (?,?)", [id, userId]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stocktakes',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ code, campaign_type: "QUALITY_CHECK" }), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async action(user, id, body, action, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản lịch QC.");
    C.fail(!["start", "close"].includes(action), "NOT_FOUND", "Thao tác không hợp lệ.", 404);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK' FOR UPDATE", [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
      C.version(rows[0], body.version);
      C.state(rows[0], [action === "start" ? "PLANNED" : "COMPLETED"]);
      const status = action === "start" ? "IN_PROGRESS" : "CLOSED";
      await connection.execute("UPDATE stocktakes SET status=?,version=version+1 WHERE id=?", [status, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stocktakes',?,?,?,?,?)", [user.id, id, action.toUpperCase(), JSON.stringify({ status: rows[0].status }), JSON.stringify({ status }), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }
}

module.exports = QualityCampaignService;
