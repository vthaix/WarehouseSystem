const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value;

class BusinessPlanService {
  constructor(pool) { this.pool = pool; }

  async transaction(work) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const value = await work(connection);
      await connection.commit();
      return value;
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Kế hoạch đã tồn tại.");
      if (error.code === "ER_ROW_IS_REFERENCED_2") throw new C.DomainError(409, "IN_USE", "Kế hoạch đã được sử dụng.");
      throw error;
    } finally { connection.release(); }
  }

  present(user, row) {
    const result = { ...row };
    for (const field of ["id", "supplier_id", "customer_id", "customer_order_id", "created_by", "reviewed_by"])
      if (result[field] != null) result[field] = String(result[field]);
    result.planned_date = asDate(result.planned_date);
    result.actions = [];
    if (user.roles.includes("PLANNER") && ["PENDING_APPROVAL", "REJECTED"].includes(result.status)) result.actions.push("edit", "delete");
    if (user.roles.includes("DIRECTOR") && result.status === "PENDING_APPROVAL") result.actions.push("review");
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["business-plans"]);
    C.fields(query, ["page", "per_page", "q", "status", "type", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (query.status) {
      C.fail(!["PENDING_APPROVAL", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
      where.push("p.status=?"); params.push(query.status);
    }
    if (query.type) {
      C.fail(!["PURCHASE", "SALE"].includes(query.type), "VALIDATION_ERROR", "Loại kế hoạch không hợp lệ.");
      where.push("p.type=?"); params.push(query.type);
    }
    if (query.q) { C.text(query.q, "q", 150); where.push("p.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM business_plans p" + filter, params);
    const [rows] = await this.pool.execute("SELECT p.* FROM business_plans p" + filter + " ORDER BY p.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map((row) => this.present(user, row)), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async load(connection, id, locked = false) {
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    const [rows] = await connection.execute("SELECT * FROM business_plans WHERE id=?" + (locked ? " FOR UPDATE" : ""), [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    return rows[0];
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["business-plans"]);
    const plan = await this.load(connection, id);
    const [lines] = await connection.execute("SELECT l.*,i.code AS item_code,i.name AS item_name FROM business_plan_lines l JOIN items i ON i.id=l.item_id WHERE l.business_plan_id=? ORDER BY l.id", [id]);
    return { ...this.present(user, plan), lines: lines.map((line) => ({ ...line, id: String(line.id), item_id: String(line.item_id), business_plan_id: String(line.business_plan_id) })) };
  }

  async validateLines(connection, type, lines, orderId, excludeId = null) {
    C.fail(!Array.isArray(lines) || !lines.length || lines.length > 100, "VALIDATION_ERROR", "Kế hoạch cần 1 đến 100 dòng.");
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", "quantity", "unit_price"]);
      C.fail(!isId(line.item_id) || seen.has(String(line.item_id)), "VALIDATION_ERROR", "Mặt hàng trùng hoặc không hợp lệ.");
      seen.add(String(line.item_id));
      C.qty(line.quantity); C.price(line.unit_price);
    }
    const [items] = await connection.execute("SELECT id,kind,is_active FROM items WHERE id IN (" + [...seen].map(() => "?").join(",") + ") FOR SHARE", [...seen]);
    const itemMap = new Map(items.map((item) => [String(item.id), item]));
    const normalized = lines.map((line) => {
      const item = itemMap.get(String(line.item_id));
      C.fail(!item || !item.is_active || item.kind !== (type === "PURCHASE" ? "MATERIAL" : "FINISHED_PRODUCT"), "VALIDATION_ERROR", "Mặt hàng không phù hợp loại kế hoạch.");
      return { item_id: String(line.item_id), quantity: C.decimal(C.qty(line.quantity)), unit_price: C.money(C.price(line.unit_price)) };
    });
    if (type === "SALE") {
      const [orderLines] = await connection.execute("SELECT item_id,quantity FROM customer_order_lines WHERE customer_order_id=?", [orderId]);
      const remaining = new Map(orderLines.map((line) => [String(line.item_id), C.qty(String(line.quantity))]));
      const [allocated] = await connection.execute(
        "SELECT l.item_id,l.quantity FROM business_plan_lines l JOIN business_plans p ON p.id=l.business_plan_id WHERE p.customer_order_id=? AND p.status NOT IN ('REJECTED','CANCELLED')" + (excludeId ? " AND p.id<>?" : ""),
        excludeId ? [orderId, excludeId] : [orderId],
      );
      for (const line of [...allocated, ...normalized]) {
        const key = String(line.item_id);
        const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
        C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Kế hoạch bán vượt số lượng đơn hàng.");
        remaining.set(key, rest);
      }
    }
    let total = 0n;
    for (const line of normalized) total += (C.qty(line.quantity) * C.price(line.unit_price) + 500n) / 1000n;
    C.fail(total > 9999999999999999999n, "VALIDATION_ERROR", "Tổng tiền vượt giới hạn.");
    return { lines: normalized, total_amount: C.money(total) };
  }

  async source(connection, body, existing = null) {
    const type = existing?.type || body.type;
    C.fail(!["PURCHASE", "SALE"].includes(type), "VALIDATION_ERROR", "Loại kế hoạch không hợp lệ.");
    if (type === "PURCHASE") {
      const supplierId = body.supplier_id || existing?.supplier_id;
      C.fail(!isId(supplierId) || body.customer_id || body.customer_order_id, "VALIDATION_ERROR", "Kế hoạch mua cần nhà cung cấp.");
      const [rows] = await connection.execute("SELECT id FROM suppliers WHERE id=? AND is_active=1", [supplierId]);
      C.fail(!rows.length, "VALIDATION_ERROR", "Nhà cung cấp không hoạt động.");
      return { type, supplier_id: supplierId, customer_id: null, customer_order_id: null };
    }
    const orderId = body.customer_order_id || existing?.customer_order_id;
    C.fail(!isId(orderId) || !isId(body.customer_id || existing?.customer_id) || body.supplier_id, "VALIDATION_ERROR", "Kế hoạch bán cần khách hàng và đơn hàng.");
    const [rows] = await connection.execute("SELECT customer_id,status FROM customer_orders WHERE id=? FOR UPDATE", [orderId]);
    C.fail(!rows.length || !["APPROVED", "IN_PROGRESS"].includes(rows[0].status) || String(rows[0].customer_id) !== String(body.customer_id || existing?.customer_id), "INVALID_STATE", "Đơn hàng không hợp lệ hoặc chưa duyệt.", 409);
    return { type, supplier_id: null, customer_id: rows[0].customer_id, customer_order_id: orderId };
  }

  async create(user, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body, ["type", "supplier_id", "customer_id", "customer_order_id", "planned_date", "note", "lines"]);
    C.date(body.planned_date, "planned_date");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const id = await this.transaction(async (connection) => {
      const source = await this.source(connection, body);
      const data = await this.validateLines(connection, source.type, body.lines, source.customer_order_id);
      const code = "KH-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute(
        "INSERT INTO business_plans (code,type,supplier_id,customer_id,customer_order_id,planned_date,note,status,created_by,total_amount,version) VALUES (?,?,?,?,?,?,?,'PENDING_APPROVAL',?,?,1)",
        [code, source.type, source.supplier_id, source.customer_id, source.customer_order_id, body.planned_date, body.note || null, user.id, data.total_amount],
      );
      for (const line of data.lines) await connection.execute("INSERT INTO business_plan_lines (business_plan_id,item_id,quantity,unit_price) VALUES (?,?,?,?)", [created.insertId, line.item_id, line.quantity, line.unit_price]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'business-plans',?,'CREATE',?,?)", [user.id, created.insertId, JSON.stringify({ code, type: source.type }), requestId]);
      return created.insertId;
    });
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body, ["version", "supplier_id", "planned_date", "note", "lines"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản kế hoạch.");
    C.fail(!["supplier_id", "planned_date", "note", "lines"].some((field) => Object.hasOwn(body, field)), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.planned_date !== undefined) C.date(body.planned_date, "planned_date");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    await this.transaction(async (connection) => {
      const current = await this.load(connection, id, true);
      C.version(current, body.version);
      C.state(current, ["PENDING_APPROVAL", "REJECTED"]);
      C.fail(body.supplier_id && current.type !== "PURCHASE", "VALIDATION_ERROR", "Không thể đổi nguồn kế hoạch bán.");
      const source = await this.source(connection, body, current);
      let total = current.total_amount;
      if (body.lines !== undefined) {
        const data = await this.validateLines(connection, current.type, body.lines, current.customer_order_id, id);
        total = data.total_amount;
        await connection.execute("DELETE FROM business_plan_lines WHERE business_plan_id=?", [id]);
        for (const line of data.lines) await connection.execute("INSERT INTO business_plan_lines (business_plan_id,item_id,quantity,unit_price) VALUES (?,?,?,?)", [id, line.item_id, line.quantity, line.unit_price]);
      }
      await connection.execute("UPDATE business_plans SET supplier_id=?,planned_date=?,note=?,total_amount=?,status='PENDING_APPROVAL',rejection_reason=NULL,version=version+1 WHERE id=?", [source.supplier_id, body.planned_date || asDate(current.planned_date), body.note === undefined ? current.note : body.note || null, total, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'business-plans',?,'UPDATE',?,?,?)", [user.id, id, JSON.stringify({ version: current.version }), JSON.stringify(body), requestId]);
    });
    return this.get(user, id);
  }

  async review(user, id, body, key, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, ["version", "decision", "reason"]);
    C.fail(!Number.isInteger(body.version) || !["APPROVE", "REJECT"].includes(body.decision), "VALIDATION_ERROR", "Quyết định không hợp lệ.");
    if (body.decision === "REJECT") C.text(body.reason, "reason", 2000);
    C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
    const hash = crypto.createHash("sha256").update(JSON.stringify({ id: String(id), ...body })).digest("hex");
    return this.transaction(async (connection) => {
      await connection.execute("INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'business-plan-review',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id", [user.id, key, hash]);
      const [[record]] = await connection.execute("SELECT * FROM idempotency_records WHERE user_id=? AND operation='business-plan-review' AND idempotency_key=? FOR UPDATE", [user.id, key]);
      C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
      if (record.response_status === 200) return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
      const plan = await this.load(connection, id, true);
      C.version(plan, body.version); C.state(plan, ["PENDING_APPROVAL"]);
      if (body.decision === "APPROVE" && plan.type === "SALE") {
        await this.source(connection, {}, plan);
        const [lines] = await connection.execute("SELECT item_id,quantity,unit_price FROM business_plan_lines WHERE business_plan_id=?", [id]);
        await this.validateLines(connection, plan.type, lines.map((line) => ({ item_id: String(line.item_id), quantity: String(line.quantity), unit_price: String(line.unit_price) })), plan.customer_order_id, id);
      }
      const status = body.decision === "APPROVE" ? "APPROVED" : "REJECTED";
      await connection.execute("UPDATE business_plans SET status=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP(6),rejection_reason=?,version=version+1 WHERE id=?", [status, user.id, status === "REJECTED" ? body.reason.trim() : null, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'business-plans',?,'REVIEW',?,?,?)", [user.id, id, JSON.stringify({ status: plan.status }), JSON.stringify({ status, reason: body.reason || null }), requestId]);
      const result = await this.get(user, id, connection);
      await connection.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), record.id]);
      return result;
    });
  }

  async remove(user, id, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body || {}, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản kế hoạch.");
    await this.transaction(async (connection) => {
      const plan = await this.load(connection, id, true);
      C.version(plan, body.version); C.state(plan, ["PENDING_APPROVAL", "REJECTED"]);
      await connection.execute("DELETE FROM business_plan_lines WHERE business_plan_id=?", [id]);
      await connection.execute("DELETE FROM business_plans WHERE id=?", [id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,'business-plans',?,'DELETE',?,?)", [user.id, id, JSON.stringify(plan), requestId]);
    });
    return { id: String(id), deleted: true };
  }
}

module.exports = BusinessPlanService;
