const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

class ProductionPlanService {
  constructor(pool) {
    this.pool = pool;
  }

  visible(user, plan) {
    if (user.roles.includes("DIRECTOR") || user.roles.includes("PLANNER"))
      return true;
    if (user.roles.includes("WORKSHOP_OWNER"))
      return user.workshop_ids.includes(String(plan.workshop_id));
    return false;
  }

  present(user, row) {
    return {
      ...row,
      id: String(row.id),
      customer_order_id: String(row.customer_order_id),
      workshop_id: String(row.workshop_id),
      created_by: String(row.created_by),
      start_date: asDate(row.start_date),
      end_date: asDate(row.end_date),
      actions:
        user.roles.includes("PLANNER") && row.status === "DRAFT"
          ? ["edit", "cancel"]
          : user.roles.includes("DIRECTOR") && row.status === "DRAFT"
            ? ["review"]
            : [],
    };
  }

  async list(user, query = {}) {
    P.role(user, P.read["production-plans"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const pagination = paginate(query);
    const where = [],
      params = [];
    if (!user.roles.includes("PLANNER") && !user.roles.includes("DIRECTOR")) {
      if (!user.roles.includes("WORKSHOP_OWNER") || !user.workshop_ids.length)
        where.push("1=0");
      else {
        where.push("p.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")");
        params.push(...user.workshop_ids);
      }
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("(p.code LIKE ? OR o.code LIKE ?)");
      params.push(`%${query.q}%`, `%${query.q}%`);
    }
    if (query.status) {
      C.fail(!["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
      where.push("p.status=?");
      params.push(query.status);
    }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id" + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT p.*,o.code AS customer_order_code,w.name AS workshop_name FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id JOIN workshops w ON w.id=p.workshop_id" +
        filter +
        " ORDER BY p.id DESC LIMIT ? OFFSET ?",
      [...params, String(pagination.per_page), String(pagination.offset)],
    );
    return {
      data: rows.map((row) => this.present(user, row)),
      meta: {
        page: pagination.page,
        per_page: pagination.per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / pagination.per_page),
      },
    };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["production-plans"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    const [rows] = await connection.execute(
      "SELECT p.*,o.code AS customer_order_code,w.name AS workshop_name FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id JOIN workshops w ON w.id=p.workshop_id WHERE p.id=?",
      [id],
    );
    C.fail(!rows.length || !this.visible(user, rows[0]), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    const [outputs] = await connection.execute(
      "SELECT po.*,i.name AS item_name,i.code AS item_code FROM production_plan_outputs po JOIN items i ON i.id=po.item_id WHERE po.production_plan_id=? ORDER BY po.id",
      [id],
    );
    const [materials] = await connection.execute(
      "SELECT pm.*,i.name AS item_name,i.code AS item_code FROM production_plan_materials pm JOIN items i ON i.id=pm.item_id WHERE pm.production_plan_id=? ORDER BY pm.id",
      [id],
    );
    return {
      ...this.present(user, rows[0]),
      outputs: outputs.map((row) => ({ ...row, id: String(row.id), item_id: String(row.item_id) })),
      materials: materials.map((row) => ({ ...row, id: String(row.id), item_id: String(row.item_id) })),
    };
  }

  async validateLines(connection, lines, kind, quantityField) {
    C.fail(!Array.isArray(lines) || (kind === "FINISHED_PRODUCT" && !lines.length) || lines.length > 100, "VALIDATION_ERROR", "Danh sách mặt hàng không hợp lệ.");
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", quantityField]);
      C.fail(!isId(line.item_id) || seen.has(String(line.item_id)), "VALIDATION_ERROR", "Mặt hàng trùng hoặc không hợp lệ.");
      seen.add(String(line.item_id));
      C.qty(line[quantityField]);
    }
    if (!lines.length) return [];
    const [items] = await connection.execute(
      "SELECT id,kind,is_active FROM items WHERE id IN (" + [...seen].map(() => "?").join(",") + ") FOR SHARE",
      [...seen],
    );
    const byId = new Map(items.map((item) => [String(item.id), item]));
    return lines.map((line) => {
      const item = byId.get(String(line.item_id));
      C.fail(!item || item.kind !== kind || !item.is_active, "VALIDATION_ERROR", "Loại mặt hàng không phù hợp kế hoạch.");
      return { item_id: String(line.item_id), [quantityField]: C.decimal(C.qty(line[quantityField])) };
    });
  }

  async create(user, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body, ["customer_order_id", "workshop_id", "start_date", "end_date", "outputs", "materials", "note"]);
    C.fail(!isId(body.customer_order_id) || !isId(body.workshop_id), "VALIDATION_ERROR", "Đơn hàng hoặc xưởng không hợp lệ.");
    C.date(body.start_date, "start_date");
    C.date(body.end_date, "end_date");
    C.fail(body.end_date < body.start_date, "VALIDATION_ERROR", "Ngày kết thúc trước ngày bắt đầu.");
    C.fail(body.materials !== undefined && !Array.isArray(body.materials), "VALIDATION_ERROR", "Danh sách nguyên liệu không hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [[order]] = await connection.execute(
        "SELECT * FROM customer_orders WHERE id=? FOR UPDATE",
        [body.customer_order_id],
      );
      C.fail(!order, "NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
      C.state(order, ["RECEIVED", "APPROVED", "IN_PROGRESS"]);
      const [workshops] = await connection.execute("SELECT id FROM workshops WHERE id=? AND is_active=1", [body.workshop_id]);
      C.fail(!workshops.length, "VALIDATION_ERROR", "Xưởng không hoạt động.");
      const outputs = await this.validateLines(connection, body.outputs, "FINISHED_PRODUCT", "quantity");
      const materials = await this.validateLines(connection, body.materials || [], "MATERIAL", "required_quantity");
      const [orderLines] = await connection.execute("SELECT item_id,quantity FROM customer_order_lines WHERE customer_order_id=?", [body.customer_order_id]);
      const remaining = new Map(orderLines.map((line) => [String(line.item_id), C.qty(String(line.quantity))]));
      const [allocated] = await connection.execute(
        "SELECT po.item_id,po.quantity FROM production_plan_outputs po JOIN production_plans p ON p.id=po.production_plan_id WHERE p.customer_order_id=? AND p.status<>'CANCELLED'",
        [body.customer_order_id],
      );
      for (const line of [...allocated, ...outputs]) {
        const key = String(line.item_id);
        const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
        C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Tổng kế hoạch vượt số lượng đơn hàng.");
        remaining.set(key, rest);
      }
      const code = "KSX-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute(
        "INSERT INTO production_plans (code,customer_order_id,workshop_id,created_by,start_date,end_date,note,status,version) VALUES (?,?,?,?,?,?,?,'DRAFT',1)",
        [code, body.customer_order_id, body.workshop_id, user.id, body.start_date, body.end_date, body.note || null],
      );
      id = created.insertId;
      for (const line of outputs)
        await connection.execute(
          "INSERT INTO production_plan_outputs (production_plan_id,item_id,quantity) VALUES (?,?,?)",
          [id, line.item_id, line.quantity],
        );
      for (const line of materials)
        await connection.execute(
          "INSERT INTO production_plan_materials (production_plan_id,item_id,required_quantity) VALUES (?,?,?)",
          [id, line.item_id, line.required_quantity],
        );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'production-plans',?,'CREATE',?,?)",
        [user.id, id, JSON.stringify({ code, customer_order_id: body.customer_order_id }), requestId],
      );
      await connection.execute(
        "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) SELECT wu.user_id,?,?, 'production-plans',?,? FROM workshop_users wu JOIN user_roles ur ON ur.user_id=wu.user_id JOIN roles r ON r.id=ur.role_id WHERE wu.workshop_id=? AND r.code='WORKSHOP_OWNER' ON DUPLICATE KEY UPDATE id=notifications.id",
        [`Kế hoạch sản xuất mới ${code}`, `Kế hoạch sản xuất mới ${code}`, id, `plan-${id}-created`, body.workshop_id],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(user, id);
  }

  async cancel(user, id, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản kế hoạch.");
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT * FROM production_plans WHERE id=? FOR UPDATE", [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
      C.version(rows[0], body.version);
      C.state(rows[0], ["DRAFT"]);
      await connection.execute("UPDATE production_plans SET status='CANCELLED',version=version+1 WHERE id=?", [id]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-plans',?,'CANCEL',?,?,?)",
        [user.id, id, JSON.stringify({ status: "DRAFT" }), JSON.stringify({ status: "CANCELLED" }), requestId],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    C.fields(body, ["version", "workshop_id", "start_date", "end_date", "outputs", "materials", "note"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản kế hoạch.");
    C.fail(!["workshop_id", "start_date", "end_date", "outputs", "materials", "note"].some((key) => Object.hasOwn(body, key)), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.workshop_id !== undefined) C.fail(!isId(body.workshop_id), "VALIDATION_ERROR", "Xưởng không hợp lệ.");
    if (body.start_date !== undefined) C.date(body.start_date, "start_date");
    if (body.end_date !== undefined) C.date(body.end_date, "end_date");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [source] = await connection.execute("SELECT customer_order_id FROM production_plans WHERE id=?", [id]);
      C.fail(!source.length, "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
      const [orders] = await connection.execute("SELECT * FROM customer_orders WHERE id=? FOR UPDATE", [source[0].customer_order_id]);
      C.fail(!orders.length, "NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
      const [rows] = await connection.execute("SELECT * FROM production_plans WHERE id=? FOR UPDATE", [id]);
      const plan = rows[0];
      C.version(plan, body.version);
      C.state(plan, ["DRAFT"]);
      const workshopId = body.workshop_id || plan.workshop_id;
      const [workshops] = await connection.execute("SELECT id FROM workshops WHERE id=? AND is_active=1", [workshopId]);
      C.fail(!workshops.length, "VALIDATION_ERROR", "Xưởng không hoạt động.");
      const start = body.start_date || asDate(plan.start_date);
      const end = body.end_date || asDate(plan.end_date);
      C.fail(end < start, "VALIDATION_ERROR", "Ngày kết thúc trước ngày bắt đầu.");
      const outputs = body.outputs === undefined ? null : await this.validateLines(connection, body.outputs, "FINISHED_PRODUCT", "quantity");
      const materials = body.materials === undefined ? null : await this.validateLines(connection, body.materials, "MATERIAL", "required_quantity");
      if (outputs) {
        const [orderLines] = await connection.execute("SELECT item_id,quantity FROM customer_order_lines WHERE customer_order_id=?", [plan.customer_order_id]);
        const remaining = new Map(orderLines.map((line) => [String(line.item_id), C.qty(String(line.quantity))]));
        const [allocated] = await connection.execute("SELECT po.item_id,po.quantity FROM production_plan_outputs po JOIN production_plans p ON p.id=po.production_plan_id WHERE p.customer_order_id=? AND p.id<>? AND p.status<>'CANCELLED'", [plan.customer_order_id, id]);
        for (const line of [...allocated, ...outputs]) {
          const key = String(line.item_id);
          const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
          C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Tổng kế hoạch vượt số lượng đơn hàng.");
          remaining.set(key, rest);
        }
        await connection.execute("DELETE FROM production_plan_outputs WHERE production_plan_id=?", [id]);
        for (const line of outputs) await connection.execute("INSERT INTO production_plan_outputs (production_plan_id,item_id,quantity) VALUES (?,?,?)", [id, line.item_id, line.quantity]);
      }
      if (materials) {
        await connection.execute("DELETE FROM production_plan_materials WHERE production_plan_id=?", [id]);
        for (const line of materials) await connection.execute("INSERT INTO production_plan_materials (production_plan_id,item_id,required_quantity) VALUES (?,?,?)", [id, line.item_id, line.required_quantity]);
      }
      await connection.execute("UPDATE production_plans SET workshop_id=?,start_date=?,end_date=?,note=?,version=version+1 WHERE id=?", [workshopId, start, end, body.note === undefined ? plan.note : body.note || null, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-plans',?,'UPDATE',?,?,?)", [user.id, id, JSON.stringify({ version: plan.version }), JSON.stringify(body), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async review(user, id, body, key, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
    C.fields(body, ["version", "decision", "reason"]);
    C.fail(!Number.isInteger(body.version) || !["APPROVE", "REJECT"].includes(body.decision), "VALIDATION_ERROR", "Quyết định không hợp lệ.");
    if (body.decision === "REJECT") C.text(body.reason, "reason", 2000);
    C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
    const hash = crypto.createHash("sha256").update(JSON.stringify({ id: String(id), ...body })).digest("hex");
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute("INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'production-plan-review',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id", [user.id, key, hash]);
      const [[record]] = await connection.execute("SELECT * FROM idempotency_records WHERE user_id=? AND operation='production-plan-review' AND idempotency_key=? FOR UPDATE", [user.id, key]);
      C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
      if (record.response_status === 200) {
        await connection.commit();
        return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
      }
      const [source] = await connection.execute("SELECT customer_order_id FROM production_plans WHERE id=?", [id]);
      C.fail(!source.length, "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
      const [orders] = await connection.execute("SELECT * FROM customer_orders WHERE id=? FOR UPDATE", [source[0].customer_order_id]);
      const [rows] = await connection.execute("SELECT * FROM production_plans WHERE id=? FOR UPDATE", [id]);
      const plan = rows[0];
      C.version(plan, body.version); C.state(plan, ["DRAFT"]);
      if (body.decision === "APPROVE") {
        C.fail(!orders.length || !["APPROVED", "IN_PROGRESS"].includes(orders[0].status), "INVALID_STATE", "Đơn hàng chưa được duyệt.", 409);
        const [orderLines] = await connection.execute("SELECT item_id,quantity FROM customer_order_lines WHERE customer_order_id=?", [plan.customer_order_id]);
        const remaining = new Map(orderLines.map((line) => [String(line.item_id), C.qty(String(line.quantity))]));
        const [allocated] = await connection.execute("SELECT po.item_id,po.quantity FROM production_plan_outputs po JOIN production_plans p ON p.id=po.production_plan_id WHERE p.customer_order_id=? AND p.status<>'CANCELLED'", [plan.customer_order_id]);
        for (const line of allocated) {
          const key = String(line.item_id);
          const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
          C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Kế hoạch vượt số lượng đơn hàng.");
          remaining.set(key, rest);
        }
        await connection.execute("UPDATE production_plans SET status='APPROVED',version=version+1 WHERE id=?", [id]);
      }
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-plans',?,'REVIEW',?,?,?)", [user.id, id, JSON.stringify({ status: plan.status }), JSON.stringify({ decision: body.decision, reason: body.reason || null }), requestId]);
      const result = await this.get(user, id, connection);
      await connection.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), record.id]);
      await connection.commit();
      return result;
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
}

module.exports = ProductionPlanService;
