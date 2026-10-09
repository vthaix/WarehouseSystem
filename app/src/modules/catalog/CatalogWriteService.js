const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");

const definitions = {
  categories: { table: "categories", create: ["code", "name", "description", "is_active"], edit: ["name", "description", "is_active"], required: ["code", "name"] },
  warehouses: { table: "warehouses", create: ["code", "name", "address", "is_active"], edit: ["name", "address", "is_active"], required: ["code", "name"] },
  "warehouse-locations": { table: "warehouse_locations", create: ["warehouse_id", "code", "name", "is_active"], edit: ["name", "is_active"], required: ["warehouse_id", "code", "name"] },
  suppliers: { table: "suppliers", create: ["code", "name", "phone", "email", "address", "tax_code", "is_active"], edit: ["name", "phone", "email", "address", "tax_code", "is_active"], required: ["code", "name"] },
  items: { table: "items", create: ["category_id", "unit_id", "code", "name", "kind", "description", "reference_price", "is_sample", "is_published", "is_active"], edit: ["version", "name", "description", "reference_price", "is_sample", "is_published", "is_active"], required: ["category_id", "unit_id", "code", "name", "kind", "reference_price"] },
};
const isId = (v) => /^[1-9]\d*$/.test(String(v));
const optionalText = new Set(["description", "address", "phone", "email", "tax_code"]);
const maxLength = { code: 40, name: 150, description: 5000, address: 500, phone: 20, email: 254, tax_code: 30 };

class CatalogWriteService {
  constructor(pool, repository) {
    this.pool = pool;
    this.repository = repository;
  }

  definition(resource) {
    const definition = definitions[resource];
    C.fail(!definition, "NOT_IMPLEMENTED", "Chức năng chưa được triển khai.", 501);
    return definition;
  }

  validate(resource, body, create) {
    const definition = this.definition(resource);
    C.fields(body, create ? definition.create : definition.edit);
    if (create) for (const field of definition.required)
      C.fail(body[field] === undefined || body[field] === null || body[field] === "", "VALIDATION_ERROR", `Thiếu ${field}.`);
    else C.fail(!Object.keys(body).some((field) => field !== "version"), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    const normalized = {};
    for (const [field, value] of Object.entries(body)) {
      if (field === "version") continue;
      if (["category_id", "unit_id", "warehouse_id"].includes(field)) {
        C.fail(!isId(value), "VALIDATION_ERROR", `Giá trị ${field} không hợp lệ.`);
        normalized[field] = String(value);
      } else if (["is_active", "is_sample", "is_published"].includes(field)) {
        C.fail(typeof value !== "boolean", "VALIDATION_ERROR", `${field} phải là boolean.`);
        normalized[field] = value ? 1 : 0;
      } else if (field === "reference_price") {
        normalized[field] = C.money(C.price(value));
      } else if (field === "kind") {
        C.fail(!["MATERIAL", "FINISHED_PRODUCT"].includes(value), "VALIDATION_ERROR", "Loại mặt hàng không hợp lệ.");
        normalized[field] = value;
      } else {
        C.text(value, field, maxLength[field] || 5000, !optionalText.has(field));
        if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          C.fail(true, "VALIDATION_ERROR", "Email không hợp lệ.");
        normalized[field] = value ? value.trim() : null;
      }
    }
    if (resource === "items") {
      const sample = normalized.is_sample;
      if (sample === 1 && normalized.kind && normalized.kind !== "FINISHED_PRODUCT")
        C.fail(true, "VALIDATION_ERROR", "Chỉ thành phẩm được đánh dấu hàng mẫu.");
      if (normalized.is_published === 1 && sample === 0)
        C.fail(true, "VALIDATION_ERROR", "Chỉ công bố mặt hàng mẫu.");
    }
    return normalized;
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
      if (error.code === "ER_DUP_ENTRY") throw new C.DomainError(409, "DUPLICATE", "Mã hoặc tên đã tồn tại.");
      if (error.code === "ER_ROW_IS_REFERENCED_2") throw new C.DomainError(409, "IN_USE", "Dữ liệu đang được sử dụng.");
      throw error;
    } finally {
      connection.release();
    }
  }

  async references(connection, resource, values) {
    const checks = resource === "items" ? [["categories", values.category_id], ["units", values.unit_id]]
      : resource === "warehouse-locations" ? [["warehouses", values.warehouse_id]] : [];
    for (const [table, id] of checks) {
      const [rows] = await connection.execute(`SELECT id FROM ${table} WHERE id=?${table === "units" ? "" : " AND is_active=1"}`, [id]);
      C.fail(!rows.length, "VALIDATION_ERROR", "Danh mục tham chiếu không tồn tại hoặc đã ngừng hoạt động.");
    }
  }

  async create(user, resource, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    const values = this.validate(resource, body, true);
    if (resource === "items") {
      if (values.is_sample === undefined) values.is_sample = 0;
      if (values.is_published === undefined) values.is_published = 0;
      C.fail(values.is_published === 1 && values.is_sample !== 1, "VALIDATION_ERROR", "Chỉ công bố hàng mẫu.");
      values.version = 1;
    }
    if (values.is_active === undefined) values.is_active = 1;
    const id = await this.transaction(async (connection) => {
      await this.references(connection, resource, values);
      const columns = Object.keys(values);
      const [result] = await connection.execute(
        `INSERT INTO ${definition.table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
        Object.values(values),
      );
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,?,?,'CREATE',?,?)", [user.id, resource, result.insertId, JSON.stringify(values), requestId]);
      return result.insertId;
    });
    return this.repository.get(resource, id);
  }

  async update(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    const values = this.validate(resource, body, false);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(`SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`, [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
      const current = rows[0];
      if (resource === "items") {
        C.version(current, body.version);
        C.fail(values.is_sample === 1 && current.kind !== "FINISHED_PRODUCT", "VALIDATION_ERROR", "Chỉ thành phẩm được đánh dấu hàng mẫu.");
        C.fail(values.is_published === 1 && (values.is_sample ?? current.is_sample) === 0, "VALIDATION_ERROR", "Chỉ công bố hàng mẫu.");
      }
      const columns = Object.keys(values);
      await connection.execute(`UPDATE ${definition.table} SET ${columns.map((key) => `${key}=?`).join(",")}${resource === "items" ? ",version=version+1" : ""} WHERE id=?`, [...Object.values(values), id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,?,?,'UPDATE',?,?,?)", [user.id, resource, id, JSON.stringify(current), JSON.stringify(values), requestId]);
    });
    return this.repository.get(resource, id);
  }

  async remove(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    C.fields(body || {}, resource === "items" ? ["version"] : []);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(`SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`, [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
      if (resource === "items") C.version(rows[0], body.version);
      await connection.execute(`DELETE FROM ${definition.table} WHERE id=?`, [id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,?,?,'DELETE',?,?)", [user.id, resource, id, JSON.stringify(rows[0]), requestId]);
    });
    return { id: String(id), deleted: true };
  }

  async createLot(user, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fields(body, ["code", "item_id", "purchase_order_id", "purchase_order_line_id", "received_quantity", "manufactured_date", "expiry_date"]);
    C.text(body.code, "code", 50);
    C.fail(!isId(body.purchase_order_line_id), "VALIDATION_ERROR", "Dòng đơn mua không hợp lệ.");
    if (body.item_id !== undefined) C.fail(!isId(body.item_id), "VALIDATION_ERROR", "Mặt hàng không hợp lệ.");
    if (body.purchase_order_id !== undefined) C.fail(!isId(body.purchase_order_id), "VALIDATION_ERROR", "Đơn mua không hợp lệ.");
    C.qty(body.received_quantity);
    if (body.manufactured_date) C.date(body.manufactured_date, "manufactured_date");
    if (body.expiry_date) C.date(body.expiry_date, "expiry_date");
    C.fail(body.expiry_date && body.manufactured_date && body.expiry_date < body.manufactured_date, "VALIDATION_ERROR", "Hạn sử dụng trước ngày sản xuất.");
    const id = await this.transaction(async (connection) => {
      const [lines] = await connection.execute(
        "SELECT l.*,p.status AS purchase_status,i.kind AS item_kind FROM purchase_order_lines l JOIN purchase_orders p ON p.id=l.purchase_order_id JOIN items i ON i.id=l.item_id WHERE l.id=? FOR UPDATE",
        [body.purchase_order_line_id],
      );
      C.fail(!lines.length, "NOT_FOUND", "Không tìm thấy dòng đơn mua.", 404);
      const line = lines[0];
      C.fail(body.purchase_order_id && String(body.purchase_order_id) !== String(line.purchase_order_id), "VALIDATION_ERROR", "Dòng không thuộc đơn mua.");
      C.fail(body.item_id && String(body.item_id) !== String(line.item_id), "VALIDATION_ERROR", "Mặt hàng không khớp dòng đơn mua.");
      C.fail(line.item_kind !== "MATERIAL" || !["PENDING", "PARTIALLY_RECEIVED"].includes(line.purchase_status), "INVALID_STATE", "Đơn mua không thể nhận lô nguyên liệu.", 409);
      const [[used]] = await connection.execute("SELECT COALESCE(SUM(received_quantity),0) AS quantity FROM lots WHERE purchase_order_line_id=?", [line.id]);
      C.fail(C.qty(String(used.quantity), false) + C.qty(body.received_quantity) > C.qty(String(line.quantity)), "SOURCE_LIMIT_EXCEEDED", "Tổng lô vượt lượng đơn mua.");
      const [created] = await connection.execute(
        "INSERT INTO lots (code,item_id,purchase_order_line_id,production_plan_id,manufactured_date,expiry_date,received_quantity,qc_status,version) VALUES (?,?,?,NULL,?,?,?,'PENDING',1)",
        [body.code.trim(), line.item_id, line.id, body.manufactured_date || null, body.expiry_date || null, body.received_quantity],
      );
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'lots',?,'CREATE',?,?)", [user.id, created.insertId, JSON.stringify(body), requestId]);
      return created.insertId;
    });
    return this.repository.get("lots", id);
  }

  async updateLot(user, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lô.", 404);
    C.fields(body, ["version", "manufactured_date", "expiry_date"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản lô.");
    C.fail(body.manufactured_date === undefined && body.expiry_date === undefined, "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.manufactured_date) C.date(body.manufactured_date, "manufactured_date");
    if (body.expiry_date) C.date(body.expiry_date, "expiry_date");
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute("SELECT * FROM lots WHERE id=? FOR UPDATE", [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lô.", 404);
      const lot = rows[0];
      C.version(lot, body.version);
      C.fail(lot.qc_status !== "PENDING", "INVALID_STATE", "Lô đã có kết quả QC.", 409);
      const date = body.manufactured_date ?? lot.manufactured_date;
      const expiry = body.expiry_date ?? lot.expiry_date;
      C.fail(date && expiry && String(expiry).slice(0, 10) < String(date).slice(0, 10), "VALIDATION_ERROR", "Hạn sử dụng trước ngày sản xuất.");
      await connection.execute("UPDATE lots SET manufactured_date=?,expiry_date=?,version=version+1 WHERE id=?", [date || null, expiry || null, id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'lots',?,'UPDATE',?,?,?)", [user.id, id, JSON.stringify(lot), JSON.stringify(body), requestId]);
    });
    return this.repository.get("lots", id);
  }

  async removeLot(user, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lô.", 404);
    C.fields(body || {}, ["version"]);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute("SELECT * FROM lots WHERE id=? FOR UPDATE", [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lô.", 404);
      C.version(rows[0], body.version);
      C.fail(rows[0].qc_status !== "PENDING", "INVALID_STATE", "Lô đã qua QC.", 409);
      await connection.execute("DELETE FROM lots WHERE id=?", [id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,'lots',?,'DELETE',?,?)", [user.id, id, JSON.stringify(rows[0]), requestId]);
    });
    return { id: String(id), deleted: true };
  }
}

module.exports = CatalogWriteService;
