const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const statuses = [
  "SUBMITTED",
  "RECEIVED",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
];
const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

class OrderService {
  constructor(pool) {
    this.pool = pool;
  }

  async transaction(work) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  customerOnly(user) {
    return (
      user.roles.includes("CUSTOMER") &&
      !user.roles.includes("PLANNER") &&
      !user.roles.includes("DIRECTOR")
    );
  }

  present(user, row) {
    const result = { ...row };
    for (const name of ["id", "customer_id", "received_by", "reviewed_by"])
      if (result[name] != null) result[name] = String(result[name]);
    result.latest_delivery_date = asDate(result.latest_delivery_date);
    result.actions = [];
    if (
      user.roles.includes("CUSTOMER") &&
      String(result.customer_user_id) === String(user.id) &&
      ["SUBMITTED", "RECEIVED"].includes(result.status)
    )
      result.actions.push("edit");
    if (user.roles.includes("PLANNER") && result.status === "SUBMITTED")
      result.actions.push("receive");
    if (user.roles.includes("DIRECTOR") && result.status === "RECEIVED")
      result.actions.push("review");
    delete result.customer_user_id;
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["customer-orders"]);
    C.fields(query, ["page", "per_page", "q", "status", "from", "to", "sort"]);
    const pagination = paginate(query);
    const where = [],
      params = [];
    if (this.customerOnly(user)) {
      where.push("c.user_id = ?");
      params.push(user.id);
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("(o.code LIKE ? OR c.name LIKE ?)");
      params.push(`%${query.q}%`, `%${query.q}%`);
    }
    if (query.status) {
      C.fail(!statuses.includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
      where.push("o.status = ?");
      params.push(query.status);
    }
    if (query.from) {
      C.date(query.from, "from");
      where.push("DATE(o.created_at) >= ?");
      params.push(query.from);
    }
    if (query.to) {
      C.date(query.to, "to");
      where.push("DATE(o.created_at) <= ?");
      params.push(query.to);
    }
    C.fail(query.from && query.to && query.from > query.to, "VALIDATION_ERROR", "Khoảng ngày không hợp lệ.");
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM customer_orders o JOIN customers c ON c.id=o.customer_id" + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT o.*,c.name AS customer_name,c.user_id AS customer_user_id,(SELECT COUNT(*) FROM customer_order_lines l WHERE l.customer_order_id=o.id) AS line_count FROM customer_orders o JOIN customers c ON c.id=o.customer_id" +
        filter +
        " ORDER BY o.id DESC LIMIT ? OFFSET ?",
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

  async load(connection, user, id, locked = false) {
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    const scoped = this.customerOnly(user) ? " AND c.user_id = ?" : "";
    const [rows] = await connection.execute(
      "SELECT o.*,c.name AS customer_name,c.user_id AS customer_user_id FROM customer_orders o JOIN customers c ON c.id=o.customer_id WHERE o.id = ?" +
        scoped +
        (locked ? " FOR UPDATE" : ""),
      this.customerOnly(user) ? [id, user.id] : [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
    return rows[0];
  }

  async detail(connection, user, id, locked = false) {
    const row = await this.load(connection, user, id, locked);
    const [lines] = await connection.execute(
      "SELECT l.*,i.code AS item_code,i.name AS item_name,u.name AS unit_name FROM customer_order_lines l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id WHERE l.customer_order_id=? ORDER BY l.id",
      [id],
    );
    const result = this.present(user, row);
    delete result.customer_user_id;
    result.lines = lines.map((line) => ({
      ...line,
      id: String(line.id),
      customer_order_id: String(line.customer_order_id),
      item_id: String(line.item_id),
    }));
    if (!this.customerOnly(user)) {
      const [plans] = await connection.execute(
        "SELECT p.* FROM production_plans p WHERE p.customer_order_id=? ORDER BY p.id",
        [id],
      );
      result.production_plans = plans.map((plan) => ({
        ...plan,
        id: String(plan.id),
        customer_order_id: String(plan.customer_order_id),
        workshop_id: String(plan.workshop_id),
        start_date: asDate(plan.start_date),
        end_date: asDate(plan.end_date),
      }));
    }
    return result;
  }

  async get(user, id) {
    P.role(user, P.read["customer-orders"]);
    return this.detail(this.pool, user, id);
  }

  async validateLines(connection, lines) {
    C.fail(!Array.isArray(lines) || !lines.length || lines.length > 100, "VALIDATION_ERROR", "Đơn hàng cần 1 đến 100 dòng.");
    const ids = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", "quantity", "note"]);
      C.fail(!isId(line.item_id) || ids.has(String(line.item_id)), "VALIDATION_ERROR", "Mặt hàng trùng hoặc không hợp lệ.");
      ids.add(String(line.item_id));
      C.qty(line.quantity);
      if (line.note !== undefined) C.text(line.note, "note", 5000, false);
    }
    const [items] = await connection.execute(
      "SELECT id,code,name,kind,is_sample,is_published,is_active,reference_price FROM items WHERE id IN (" +
        [...ids].map(() => "?").join(",") +
        ") FOR SHARE",
      [...ids],
    );
    const byId = new Map(items.map((item) => [String(item.id), item]));
    let total = 0n;
    const normalized = lines.map((line) => {
      const item = byId.get(String(line.item_id));
      C.fail(
        !item || item.kind !== "FINISHED_PRODUCT" || !item.is_sample || !item.is_published || !item.is_active,
        "VALIDATION_ERROR",
        "Chỉ đặt thành phẩm mẫu đang công bố.",
      );
      const quantity = C.qty(line.quantity);
      total += (quantity * C.price(String(item.reference_price)) + 500n) / 1000n;
      return {
        item_id: String(item.id),
        quantity: C.decimal(quantity),
        unit_price: String(item.reference_price),
        note: line.note || null,
      };
    });
    C.fail(total > 9999999999999999999n, "VALIDATION_ERROR", "Tổng tiền vượt giới hạn.");
    return { lines: normalized, quoted_total: C.money(total) };
  }

  async audit(connection, user, orderId, action, before, after, requestId) {
    await connection.execute(
      "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'customer-orders',?,?,?,?,?)",
      [user.id, orderId, action, JSON.stringify(before), JSON.stringify(after), requestId],
    );
  }

  async notifyRole(connection, roleCode, orderId, subject, key) {
    await connection.execute(
      "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?, 'customer-orders',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code=? ON DUPLICATE KEY UPDATE id=notifications.id",
      [subject, subject, orderId, key, roleCode],
    );
  }

  async notifyUser(connection, userId, orderId, subject, key) {
    await connection.execute(
      "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'customer-orders',?,?) ON DUPLICATE KEY UPDATE id=id",
      [userId, subject, subject, orderId, key],
    );
  }

  async create(user, body, requestId) {
    P.role(user, ["CUSTOMER"]);
    C.fields(body, ["delivery_address", "latest_delivery_date", "note", "lines"]);
    C.text(body.delivery_address, "delivery_address", 500);
    C.date(body.latest_delivery_date, "latest_delivery_date", true);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const id = await this.transaction(async (connection) => {
      const [customers] = await connection.execute("SELECT id FROM customers WHERE user_id=?", [user.id]);
      C.fail(!customers.length, "FORBIDDEN", "Tài khoản chưa có hồ sơ khách hàng.", 403);
      const data = await this.validateLines(connection, body.lines);
      const code = "DH-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute(
        "INSERT INTO customer_orders (code,customer_id,delivery_address,latest_delivery_date,note,status,quoted_total,version) VALUES (?,?,?,?,?,'SUBMITTED',?,1)",
        [code, customers[0].id, body.delivery_address.trim(), body.latest_delivery_date, body.note || null, data.quoted_total],
      );
      for (const line of data.lines)
        await connection.execute(
          "INSERT INTO customer_order_lines (customer_order_id,item_id,quantity,unit_price,note) VALUES (?,?,?,?,?)",
          [created.insertId, line.item_id, line.quantity, line.unit_price, line.note],
        );
      await this.audit(connection, user, created.insertId, "CREATE", {}, { code, status: "SUBMITTED" }, requestId);
      await this.notifyRole(connection, "PLANNER", created.insertId, `Đơn hàng mới ${code}`, `order-${created.insertId}-created`);
      return created.insertId;
    });
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["CUSTOMER"]);
    C.fields(body, ["version", "delivery_address", "latest_delivery_date", "note", "lines", "quantity_change_acknowledged"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản đơn hàng.");
    C.fail(
      !["delivery_address", "latest_delivery_date", "note", "lines"].some((key) => Object.hasOwn(body, key)),
      "VALIDATION_ERROR",
      "Không có nội dung cần sửa.",
    );
    await this.transaction(async (connection) => {
      const order = await this.load(connection, user, id, true);
      C.fail(String(order.customer_user_id) !== String(user.id), "NOT_FOUND", "Không tìm thấy đơn hàng.", 404);
      C.version(order, body.version);
      C.state(order, ["SUBMITTED", "RECEIVED"]);
      const address = body.delivery_address === undefined ? order.delivery_address : C.text(body.delivery_address, "delivery_address", 500).trim();
      const date = body.latest_delivery_date === undefined ? asDate(order.latest_delivery_date) : C.date(body.latest_delivery_date, "latest_delivery_date", true);
      const note = body.note === undefined ? order.note : C.text(body.note, "note", 5000, false) || null;
      let total = order.quoted_total;
      if (body.lines !== undefined) {
        const current = await this.detail(connection, user, id);
        const next = await this.validateLines(connection, body.lines);
        const oldQuantities = new Map(current.lines.map((line) => [line.item_id, C.qty(String(line.quantity))]));
        const changed = next.lines.length !== oldQuantities.size || next.lines.some((line) => oldQuantities.get(line.item_id) !== C.qty(line.quantity));
        C.fail(changed && body.quantity_change_acknowledged !== true, "VALIDATION_ERROR", "Cần xác nhận thay đổi số lượng.");
        const [allocations] = await connection.execute(
          "SELECT po.item_id,po.quantity FROM production_plan_outputs po JOIN production_plans p ON p.id=po.production_plan_id WHERE p.customer_order_id=? AND p.status<>'CANCELLED'",
          [id],
        );
        const available = new Map(next.lines.map((line) => [line.item_id, C.qty(line.quantity)]));
        for (const allocation of allocations) {
          const key = String(allocation.item_id);
          const remaining = (available.get(key) || 0n) - C.qty(String(allocation.quantity));
          C.fail(remaining < 0n, "SOURCE_LIMIT_EXCEEDED", "Số lượng mới thấp hơn kế hoạch sản xuất đã lập.");
          available.set(key, remaining);
        }
        await connection.execute("DELETE FROM customer_order_lines WHERE customer_order_id=?", [id]);
        for (const line of next.lines)
          await connection.execute(
            "INSERT INTO customer_order_lines (customer_order_id,item_id,quantity,unit_price,note) VALUES (?,?,?,?,?)",
            [id, line.item_id, line.quantity, line.unit_price, line.note],
          );
        total = next.quoted_total;
      }
      await connection.execute(
        "UPDATE customer_orders SET delivery_address=?,latest_delivery_date=?,note=?,quoted_total=?,version=version+1 WHERE id=?",
        [address, date, note, total, id],
      );
      await this.audit(connection, user, id, "UPDATE", { version: order.version }, { version: order.version + 1 }, requestId);
    });
    return this.get(user, id);
  }

  async receive(user, id, body, requestId) {
    P.role(user, ["PLANNER"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản đơn hàng.");
    await this.transaction(async (connection) => {
      const order = await this.load(connection, user, id, true);
      C.version(order, body.version);
      C.state(order, ["SUBMITTED"]);
      await connection.execute(
        "UPDATE customer_orders SET status='RECEIVED',received_by=?,received_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
        [user.id, id],
      );
      await this.audit(connection, user, id, "RECEIVE", { status: "SUBMITTED" }, { status: "RECEIVED" }, requestId);
      await this.notifyRole(connection, "DIRECTOR", id, `Đơn hàng ${order.code} chờ phê duyệt`, `order-${id}-received`);
    });
    return this.get(user, id);
  }

  async review(user, id, body, key, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, ["version", "decision", "reason"]);
    C.fail(!Number.isInteger(body.version) || !["APPROVE", "REJECT"].includes(body.decision), "VALIDATION_ERROR", "Quyết định không hợp lệ.");
    if (body.decision === "REJECT") C.text(body.reason, "reason", 2000);
    else if (body.reason !== undefined) C.text(body.reason, "reason", 2000, false);
    C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
    const hash = crypto.createHash("sha256").update(JSON.stringify({ id: String(id), ...body })).digest("hex");
    return this.transaction(async (connection) => {
      await connection.execute(
        "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'customer-order-review',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
        [user.id, key, hash],
      );
      const [[record]] = await connection.execute(
        "SELECT * FROM idempotency_records WHERE user_id=? AND operation='customer-order-review' AND idempotency_key=? FOR UPDATE",
        [user.id, key],
      );
      C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
      if (record.response_status === 200)
        return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
      const order = await this.load(connection, user, id, true);
      C.version(order, body.version);
      C.state(order, ["RECEIVED"]);
      if (body.decision === "APPROVE") {
        const [plans] = await connection.execute(
          "SELECT id FROM production_plans WHERE customer_order_id=? AND status='DRAFT' FOR UPDATE",
          [id],
        );
        C.fail(!plans.length, "INVALID_STATE", "Cần lập kế hoạch sản xuất nháp trước khi duyệt đơn.", 409);
        const [limits] = await connection.execute(
          "SELECT l.item_id,l.quantity FROM customer_order_lines l WHERE l.customer_order_id=?",
          [id],
        );
        const remaining = new Map(limits.map((line) => [String(line.item_id), C.qty(String(line.quantity))]));
        const [outputs] = await connection.execute(
          "SELECT po.item_id,po.quantity FROM production_plan_outputs po JOIN production_plans p ON p.id=po.production_plan_id WHERE p.customer_order_id=? AND p.status IN ('DRAFT','APPROVED','IN_PROGRESS','COMPLETED')",
          [id],
        );
        for (const output of outputs) {
          const item = String(output.item_id);
          const rest = (remaining.get(item) || 0n) - C.qty(String(output.quantity));
          C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Kế hoạch sản xuất vượt số lượng đơn hàng.");
          remaining.set(item, rest);
        }
        await connection.execute(
          "UPDATE production_plans SET status='APPROVED',version=version+1 WHERE customer_order_id=? AND status='DRAFT'",
          [id],
        );
      }
      const status = body.decision === "APPROVE" ? "APPROVED" : "REJECTED";
      await connection.execute(
        "UPDATE customer_orders SET status=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP(6),rejection_reason=?,version=version+1 WHERE id=?",
        [status, user.id, body.decision === "REJECT" ? body.reason.trim() : null, id],
      );
      await this.audit(connection, user, id, "REVIEW", { status: "RECEIVED" }, { status, reason: body.reason || null }, requestId);
      await this.notifyUser(connection, order.customer_user_id, id, `Đơn hàng ${order.code}: ${status === "APPROVED" ? "đã tiếp nhận" : "bị từ chối"}`, `order-${id}-review-${status}`);
      await this.notifyRole(connection, "PLANNER", id, `Đơn hàng ${order.code}: ${status}`, `order-${id}-planner-${status}`);
      const result = await this.detail(connection, user, id);
      await connection.execute(
        "UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?",
        [JSON.stringify(result), record.id],
      );
      return result;
    });
  }
}

module.exports = OrderService;
