const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value;

class PurchaseOrderService {
  constructor(pool) { this.pool = pool; }

  present(row) {
    const result = { ...row, actions: [] };
    for (const field of ["id", "business_plan_id", "supplier_id", "created_by"])
      if (result[field] != null) result[field] = String(result[field]);
    result.expected_delivery_date = asDate(result.expected_delivery_date);
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["purchase-orders"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (query.q) { C.text(query.q, "q", 150); where.push("p.code LIKE ?"); params.push(`%${query.q}%`); }
    if (query.status) {
      C.fail(!["PENDING", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
      where.push("p.status=?"); params.push(query.status);
    }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM purchase_orders p" + filter, params);
    const [rows] = await this.pool.execute("SELECT p.*,s.name AS supplier_name FROM purchase_orders p JOIN suppliers s ON s.id=p.supplier_id" + filter + " ORDER BY p.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map((row) => this.present(row)), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["purchase-orders"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy đơn mua.", 404);
    const [rows] = await connection.execute("SELECT p.*,s.name AS supplier_name FROM purchase_orders p JOIN suppliers s ON s.id=p.supplier_id WHERE p.id=?", [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy đơn mua.", 404);
    const [lines] = await connection.execute("SELECT l.*,i.code AS item_code,i.name AS item_name FROM purchase_order_lines l JOIN items i ON i.id=l.item_id WHERE l.purchase_order_id=? ORDER BY l.id", [id]);
    return { ...this.present(rows[0]), lines: lines.map((line) => ({ ...line, id: String(line.id), item_id: String(line.item_id), purchase_order_id: String(line.purchase_order_id), business_plan_line_id: String(line.business_plan_line_id) })) };
  }

  async create(user, body, requestId) {
    P.role(user, ["PURCHASER"]);
    C.fields(body, ["business_plan_id", "expected_delivery_date", "delivery_terms", "lines"]);
    C.fail(!isId(body.business_plan_id), "VALIDATION_ERROR", "Kế hoạch mua không hợp lệ.");
    C.date(body.expected_delivery_date, "expected_delivery_date", true);
    C.text(body.delivery_terms, "delivery_terms", 5000);
    if (body.lines !== undefined) {
      C.fail(!Array.isArray(body.lines), "VALIDATION_ERROR", "Chi tiết đơn mua không hợp lệ.");
      for (const line of body.lines) {
        C.fields(line, ["business_plan_line_id", "unit_price"]);
        C.fail(!isId(line.business_plan_line_id), "VALIDATION_ERROR", "Dòng kế hoạch không hợp lệ.");
        C.price(line.unit_price);
      }
    }
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [plans] = await connection.execute("SELECT * FROM business_plans WHERE id=? FOR UPDATE", [body.business_plan_id]);
      C.fail(!plans.length, "NOT_FOUND", "Không tìm thấy kế hoạch.", 404);
      const plan = plans[0];
      C.fail(plan.type !== "PURCHASE" || plan.status !== "APPROVED", "INVALID_STATE", "Kế hoạch mua chưa được duyệt.", 409);
      const [exists] = await connection.execute("SELECT id FROM purchase_orders WHERE business_plan_id=?", [plan.id]);
      C.fail(exists.length, "DUPLICATE", "Kế hoạch đã có đơn mua.", 409);
      const [planLines] = await connection.execute("SELECT * FROM business_plan_lines WHERE business_plan_id=? ORDER BY id", [plan.id]);
      C.fail(!planLines.length, "INVALID_STATE", "Kế hoạch không có mặt hàng.", 409);
      const prices = new Map((body.lines || []).map((line) => [String(line.business_plan_line_id), line.unit_price]));
      C.fail(prices.size !== (body.lines || []).length || (body.lines && prices.size !== planLines.length), "VALIDATION_ERROR", "Chi tiết đơn mua phải khớp toàn bộ kế hoạch.");
      let total = 0n;
      const lines = planLines.map((line) => {
        C.fail(body.lines && !prices.has(String(line.id)), "VALIDATION_ERROR", "Thiếu dòng kế hoạch trong đơn mua.");
        const price = body.lines ? prices.get(String(line.id)) : String(line.unit_price);
        total += (C.qty(String(line.quantity)) * C.price(price) + 500n) / 1000n;
        return { ...line, price: C.money(C.price(price)) };
      });
      C.fail(total > 9999999999999999999n, "VALIDATION_ERROR", "Tổng tiền vượt giới hạn.");
      const code = "DM-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO purchase_orders (code,business_plan_id,supplier_id,created_by,expected_delivery_date,delivery_terms,status,total_amount,version) VALUES (?,?,?,?,?,?,'PENDING',?,1)", [code, plan.id, plan.supplier_id, user.id, body.expected_delivery_date, body.delivery_terms.trim(), C.money(total)]);
      id = created.insertId;
      for (const line of lines) await connection.execute("INSERT INTO purchase_order_lines (purchase_order_id,business_plan_line_id,item_id,quantity,unit_price) VALUES (?,?,?,?,?)", [id, line.id, line.item_id, line.quantity, line.price]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'purchase-orders',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ code, business_plan_id: plan.id }), requestId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Kế hoạch đã có đơn mua.");
      throw error;
    } finally { connection.release(); }
    return this.get(user, id);
  }
}

module.exports = PurchaseOrderService;
