const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
class QualityService {
  constructor(pool) { this.pool = pool; }

  async visible(connection, user, row) {
    if (user.roles.includes("DIRECTOR")) return true;
    if (user.roles.includes("QC_INSPECTOR")) {
      const [assigned] = await connection.execute("SELECT id FROM quality_campaign_assignments WHERE campaign_id=? AND user_id=?", [row.campaign_id, user.id]);
      if (assigned.length) return true;
    }
    if (user.roles.includes("WORKSHOP_OWNER")) {
      const [plans] = await connection.execute("SELECT DISTINCT p.workshop_id FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id JOIN production_plans p ON p.id=l.production_plan_id WHERE q.qc_inspection_id=?", [row.id]);
      return plans.some((plan) => user.workshop_ids.includes(String(plan.workshop_id)));
    }
    return false;
  }

  present(user, row) {
    const result = { ...row };
    for (const field of ["id", "inspector_id", "campaign_id"])
      if (result[field] != null) result[field] = String(result[field]);
    result.actions = user.roles.includes("QC_INSPECTOR") && String(row.inspector_id) === String(user.id) && row.status === "RECORDED" ? ["edit", "delete"] : [];
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["qc-inspections"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (!user.roles.includes("DIRECTOR")) {
      const scopes = [];
      if (user.roles.includes("QC_INSPECTOR")) { scopes.push("EXISTS (SELECT 1 FROM quality_campaign_assignments a WHERE a.campaign_id=q.campaign_id AND a.user_id=?)"); params.push(user.id); }
      if (user.roles.includes("WORKSHOP_OWNER") && user.workshop_ids.length) { scopes.push("EXISTS (SELECT 1 FROM qc_inspection_lines x JOIN lots l ON l.id=x.lot_id JOIN production_plans p ON p.id=l.production_plan_id WHERE x.qc_inspection_id=q.id AND p.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + "))"); params.push(...user.workshop_ids); }
      where.push(scopes.length ? "(" + scopes.join(" OR ") + ")" : "1=0");
    }
    if (query.status) { C.fail(!["RECORDED", "VOID"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ."); where.push("q.status=?"); params.push(query.status); }
    if (query.q) { C.text(query.q, "q", 150); where.push("q.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM qc_inspections q" + filter, params);
    const [rows] = await this.pool.execute("SELECT q.* FROM qc_inspections q" + filter + " ORDER BY q.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map((row) => this.present(user, row)), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["qc-inspections"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kết quả QC.", 404);
    const [rows] = await connection.execute("SELECT * FROM qc_inspections WHERE id=?", [id]);
    C.fail(!rows.length || !(await this.visible(connection, user, rows[0])), "NOT_FOUND", "Không tìm thấy kết quả QC.", 404);
    const [lines] = await connection.execute("SELECT q.*,l.code AS lot_code,i.name AS item_name,i.kind FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id JOIN items i ON i.id=l.item_id WHERE q.qc_inspection_id=? ORDER BY q.id", [id]);
    return { ...this.present(user, rows[0]), lines: lines.map((line) => ({ ...line, id: String(line.id), lot_id: String(line.lot_id), qc_inspection_id: String(line.qc_inspection_id) })) };
  }

  async campaign(connection, user, id) {
    C.fail(!isId(id), "VALIDATION_ERROR", "Lịch QC không hợp lệ.");
    const [rows] = await connection.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK' FOR UPDATE", [id]);
    C.fail(!rows.length || rows[0].status !== "IN_PROGRESS", "INVALID_STATE", "Lịch QC chưa bắt đầu hoặc đã hoàn tất.", 409);
    const [assigned] = await connection.execute("SELECT id FROM quality_campaign_assignments WHERE campaign_id=? AND user_id=?", [id, user.id]);
    C.fail(!assigned.length, "FORBIDDEN", "Bạn không được phân công lịch QC này.", 403);
    return rows[0];
  }

  async validateLines(connection, campaign, lines, excludeId = null) {
    C.fail(!Array.isArray(lines) || !lines.length || lines.length > 100, "VALIDATION_ERROR", "Phiếu QC cần 1 đến 100 dòng.");
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["lot_id", "inspected_quantity", "passed_quantity", "failed_quantity", "issue"]);
      C.fail(!isId(line.lot_id) || seen.has(String(line.lot_id)), "VALIDATION_ERROR", "Lô trùng hoặc không hợp lệ.");
      seen.add(String(line.lot_id));
      const inspected = C.qty(line.inspected_quantity), passed = C.qty(line.passed_quantity, false), failed = C.qty(line.failed_quantity, false);
      C.fail(inspected !== passed + failed, "VALIDATION_ERROR", "Số đạt và lỗi không bằng số kiểm tra.");
      if (failed > 0n) C.text(line.issue, "issue", 5000);
      else if (line.issue !== undefined) C.text(line.issue, "issue", 5000, false);
    }
    const [lots] = await connection.execute("SELECT l.id,l.received_quantity,l.qc_status,i.kind FROM lots l JOIN items i ON i.id=l.item_id JOIN quality_campaign_lots q ON q.lot_id=l.id WHERE q.campaign_id=? AND l.id IN (" + [...seen].map(() => "?").join(",") + ") FOR UPDATE", [campaign.id, ...seen]);
    C.fail(lots.length !== lines.length, "VALIDATION_ERROR", "Lô không thuộc lịch QC.");
    const byId = new Map(lots.map((lot) => [String(lot.id), lot]));
    for (const line of lines) {
      const lot = byId.get(String(line.lot_id));
      C.fail(lot.kind !== campaign.quality_kind || (lot.qc_status !== "PENDING" && !excludeId), "INVALID_STATE", "Lô đã được kiểm tra hoặc sai loại.", 409);
      C.fail(C.qty(line.inspected_quantity) !== C.qty(String(lot.received_quantity)), "VALIDATION_ERROR", "Phải kiểm tra toàn bộ lượng lô.");
      if (excludeId) {
        const [used] = await connection.execute("SELECT id FROM stock_document_lines WHERE lot_id=? LIMIT 1", [lot.id]);
        C.fail(used.length, "IN_USE", "Lô đã được ghi phiếu kho.", 409);
      }
    }
    return lines.map((line) => ({ lot_id: String(line.lot_id), inspected_quantity: C.decimal(C.qty(line.inspected_quantity)), passed_quantity: C.decimal(C.qty(line.passed_quantity, false)), failed_quantity: C.decimal(C.qty(line.failed_quantity, false)), issue: line.issue || null }));
  }

  async finishCampaign(connection, campaignId) {
    const [[count]] = await connection.execute("SELECT COUNT(*) AS pending FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id WHERE q.campaign_id=? AND l.qc_status='PENDING'", [campaignId]);
    if (Number(count.pending) === 0) await connection.execute("UPDATE stocktakes SET status='COMPLETED',version=version+1 WHERE id=? AND status='IN_PROGRESS'", [campaignId]);
  }

  async create(user, body, requestId) {
    P.role(user, ["QC_INSPECTOR"]);
    C.fields(body, ["campaign_id", "inspected_at", "note", "lines"]);
    C.fail(typeof body.inspected_at !== "string" || !Number.isFinite(Date.parse(body.inspected_at)) || !/(Z|[+-]\d\d:\d\d)$/.test(body.inspected_at), "VALIDATION_ERROR", "Thời điểm kiểm tra không hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const campaign = await this.campaign(connection, user, body.campaign_id);
      const lines = await this.validateLines(connection, campaign, body.lines);
      const code = "QC-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO qc_inspections (code,inspector_id,inspected_at,note,status,version,campaign_id) VALUES (?,?,?,?,'RECORDED',1,?)", [code, user.id, new Date(body.inspected_at), body.note || null, campaign.id]);
      id = created.insertId;
      for (const line of lines) {
        await connection.execute("INSERT INTO qc_inspection_lines (qc_inspection_id,lot_id,inspected_quantity,passed_quantity,failed_quantity,issue) VALUES (?,?,?,?,?,?)", [id, line.lot_id, line.inspected_quantity, line.passed_quantity, line.failed_quantity, line.issue]);
        const status = C.qty(line.failed_quantity, false) === 0n ? "PASSED" : C.qty(line.passed_quantity, false) === 0n ? "FAILED" : "PARTIAL";
        await connection.execute("UPDATE lots SET qc_status=?,version=version+1 WHERE id=?", [status, line.lot_id]);
      }
      await this.finishCampaign(connection, campaign.id);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'qc-inspections',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ code, campaign_id: campaign.id }), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Lô đã có kết quả QC."); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["QC_INSPECTOR"]);
    C.fields(body, ["version", "inspected_at", "note", "lines"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản phiếu QC.");
    C.fail(!["inspected_at", "note", "lines"].some((key) => Object.hasOwn(body, key)), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.inspected_at !== undefined) C.fail(!Number.isFinite(Date.parse(body.inspected_at)) || !/(Z|[+-]\d\d:\d\d)$/.test(body.inspected_at), "VALIDATION_ERROR", "Thời điểm kiểm tra không hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT * FROM qc_inspections WHERE id=? FOR UPDATE", [id]);
      C.fail(!rows.length || String(rows[0].inspector_id) !== String(user.id), "NOT_FOUND", "Không tìm thấy phiếu QC.", 404);
      const report = rows[0];
      C.version(report, body.version); C.state(report, ["RECORDED"]);
      const campaign = await this.campaign(connection, user, report.campaign_id);
      if (body.lines !== undefined) {
        const lines = await this.validateLines(connection, campaign, body.lines, id);
        const [old] = await connection.execute("SELECT lot_id FROM qc_inspection_lines WHERE qc_inspection_id=?", [id]);
        for (const line of old) {
          const [used] = await connection.execute("SELECT id FROM stock_document_lines WHERE lot_id=? LIMIT 1", [line.lot_id]);
          C.fail(used.length, "IN_USE", "Lô đã được ghi phiếu kho.", 409);
        }
        await connection.execute("DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?", [id]);
        for (const line of old) await connection.execute("UPDATE lots SET qc_status='PENDING',version=version+1 WHERE id=?", [line.lot_id]);
        for (const line of lines) {
          await connection.execute("INSERT INTO qc_inspection_lines (qc_inspection_id,lot_id,inspected_quantity,passed_quantity,failed_quantity,issue) VALUES (?,?,?,?,?,?)", [id, line.lot_id, line.inspected_quantity, line.passed_quantity, line.failed_quantity, line.issue]);
          const status = C.qty(line.failed_quantity, false) === 0n ? "PASSED" : C.qty(line.passed_quantity, false) === 0n ? "FAILED" : "PARTIAL";
          await connection.execute("UPDATE lots SET qc_status=?,version=version+1 WHERE id=?", [status, line.lot_id]);
        }
      }
      await connection.execute("UPDATE qc_inspections SET inspected_at=?,note=?,version=version+1 WHERE id=?", [body.inspected_at ? new Date(body.inspected_at) : report.inspected_at, body.note === undefined ? report.note : body.note || null, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'qc-inspections',?,'UPDATE',?,?,?)", [user.id, id, JSON.stringify({ version: report.version }), JSON.stringify(body), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async remove(user, id, body, requestId) {
    P.role(user, ["QC_INSPECTOR"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản phiếu QC.");
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT * FROM qc_inspections WHERE id=? FOR UPDATE", [id]);
      C.fail(!rows.length || String(rows[0].inspector_id) !== String(user.id), "NOT_FOUND", "Không tìm thấy phiếu QC.", 404);
      const report = rows[0];
      C.version(report, body.version); C.state(report, ["RECORDED"]);
      const [campaigns] = await connection.execute("SELECT status FROM stocktakes WHERE id=? FOR UPDATE", [report.campaign_id]);
      C.fail(!campaigns.length || campaigns[0].status === "CLOSED", "INVALID_STATE", "Lịch QC đã đóng.", 409);
      const [lines] = await connection.execute("SELECT lot_id FROM qc_inspection_lines WHERE qc_inspection_id=?", [id]);
      for (const line of lines) {
        const [used] = await connection.execute("SELECT id FROM stock_document_lines WHERE lot_id=? LIMIT 1", [line.lot_id]);
        C.fail(used.length, "IN_USE", "Lô đã được ghi phiếu kho.", 409);
      }
      await connection.execute("DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?", [id]);
      await connection.execute("DELETE FROM qc_inspections WHERE id=?", [id]);
      for (const line of lines) await connection.execute("UPDATE lots SET qc_status='PENDING',version=version+1 WHERE id=?", [line.lot_id]);
      await connection.execute("UPDATE stocktakes SET status='IN_PROGRESS',version=version+1 WHERE id=? AND status='COMPLETED'", [report.campaign_id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,'qc-inspections',?,'DELETE',?,?)", [user.id, id, JSON.stringify(report), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return { id: String(id), deleted: true };
  }
}

module.exports = QualityService;
