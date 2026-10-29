const C = require("../../../domain/core");
const P = require("../../../domain/policy");
const paginate = require("../../../../utils/pagination");
const BusinessPlanService = require("../business-plans/BusinessPlanService");
const recordCode = require("../../../../shared/record-code");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

class PurchaseOrderService {
  constructor(pool) {
    this.pool = pool;
  }

  present(row) {
    const result = { ...row, actions: [] };
    if (row.purchase_sequence != null) result.display_code = recordCode.displayCode(row.code, recordCode.code('DM', row.supplier_id ? row.supplier_name : 'NHIEUNHACUNGCAP', Number(row.purchase_sequence)));
    for (const field of [
      "id",
      "business_plan_id",
      "supplier_id",
      "created_by",
      "production_report_id",
    ])
      if (result[field] != null) result[field] = String(result[field]);
    result.expected_delivery_date = asDate(result.expected_delivery_date);
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["purchase-orders"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [],
      params = [];
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("p.code LIKE ?");
      params.push(`%${query.q}%`);
    }
    if (query.status) {
      C.fail(
        !["PENDING", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].includes(
          query.status,
        ),
        "VALIDATION_ERROR",
        "Trạng thái không hợp lệ.",
      );
      where.push("p.status=?");
      params.push(query.status);
    }
    C.fail(
      query.sort && query.sort !== "newest",
      "VALIDATION_ERROR",
      "Cách sắp xếp không hợp lệ.",
    );
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM purchase_orders p" + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT p.*,COALESCE(s.name,'Nhiều nhà cung cấp') AS supplier_name,(SELECT COUNT(*) FROM purchase_orders prior WHERE (prior.supplier_id=p.supplier_id OR (prior.supplier_id IS NULL AND p.supplier_id IS NULL)) AND prior.id<=p.id) AS purchase_sequence FROM purchase_orders p LEFT JOIN suppliers s ON s.id=p.supplier_id" +
        filter +
        " ORDER BY p.id DESC LIMIT ? OFFSET ?",
      [...params, String(per_page), String(offset)],
    );
    return {
      data: rows.map((row) => this.present(row)),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["purchase-orders"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy đơn mua.", 404);
    const [rows] = await connection.execute(
      "SELECT p.*,COALESCE(s.name,'Nhiều nhà cung cấp') AS supplier_name,(SELECT COUNT(*) FROM purchase_orders prior WHERE (prior.supplier_id=p.supplier_id OR (prior.supplier_id IS NULL AND p.supplier_id IS NULL)) AND prior.id<=p.id) AS purchase_sequence FROM purchase_orders p LEFT JOIN suppliers s ON s.id=p.supplier_id WHERE p.id=?",
      [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy đơn mua.", 404);
    const [lines] = await connection.execute(
      "SELECT l.*,i.code AS item_code,i.name AS item_name,u.name AS unit_name,s.name AS supplier_name FROM purchase_order_lines l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id LEFT JOIN suppliers s ON s.id=l.supplier_id WHERE l.purchase_order_id=? ORDER BY l.id",
      [id],
    );
    return {
      ...this.present(rows[0]),
      lines: lines.map((line) => ({
        ...line,
        id: String(line.id),
        item_id: String(line.item_id),
        supplier_id: line.supplier_id == null ? null : String(line.supplier_id),
        purchase_order_id: String(line.purchase_order_id),
        business_plan_line_id: line.business_plan_line_id == null ? null : String(line.business_plan_line_id),
      })),
    };
  }

  async create(user, body, requestId) {
    P.role(user, ['PURCHASER']);
    C.fields(body, ['source_mode','supplier_id','business_plan_id','production_report_id','expected_delivery_date','delivery_terms','lines']);
    const mode = body.source_mode || (body.business_plan_id ? 'PLAN' : 'MANUAL');
    C.fail(!['PLAN','MANUAL'].includes(mode), 'VALIDATION_ERROR', 'Chỉ chọn Tự nhập hoặc Kế hoạch mua nguyên vật liệu đã duyệt.');
    C.fail(mode === 'MANUAL' && (body.business_plan_id != null || body.production_report_id != null), 'VALIDATION_ERROR', 'Đơn tự nhập không gắn nguồn báo cáo/kế hoạch.');
    if (mode === 'PLAN') C.fail(!isId(body.business_plan_id), 'VALIDATION_ERROR', 'Chọn kế hoạch mua đã duyệt.');
    C.text(body.delivery_terms, 'delivery_terms', 5000);
    const c = await this.pool.getConnection();
    let id;
    try {
      await c.beginTransaction();
      let plan = null, sourceLines = null, date = body.expected_delivery_date;
      if (mode === 'PLAN') {
        const [[found]] = await c.execute('SELECT * FROM business_plans WHERE id=? FOR UPDATE', [body.business_plan_id]);
        C.fail(!found, 'NOT_FOUND', 'Không tìm thấy kế hoạch mua.', 404);
        plan = found;
        C.fail(plan.type !== 'PURCHASE' || plan.status !== 'APPROVED', 'INVALID_STATE', 'Kế hoạch mua nguyên vật liệu chưa được duyệt.', 409);
        C.fail(!plan.production_report_id, 'INVALID_STATE', 'Kế hoạch mua thiếu báo cáo nguồn.', 409);
        C.fail(body.production_report_id != null && String(body.production_report_id) !== String(plan.production_report_id), 'VALIDATION_ERROR', 'Báo cáo nguồn không khớp kế hoạch.');
        date = asDate(plan.planned_date);
        C.fail(body.expected_delivery_date != null && body.expected_delivery_date !== date, 'VALIDATION_ERROR', 'Ngày nhận nguyên vật liệu phải theo kế hoạch mua của bộ phận lập kế hoạch.');
        await require('../../../../shared/planning-dates').businessDate(c, plan, date);
        const [exists] = await c.execute('SELECT id FROM purchase_orders WHERE business_plan_id=?', [plan.id]);
        C.fail(exists.length, 'DUPLICATE', 'Kế hoạch đã có đơn mua.', 409);
        [sourceLines] = await c.execute('SELECT * FROM business_plan_lines WHERE business_plan_id=? ORDER BY id', [plan.id]);
        const businessPlans = new BusinessPlanService(this.pool);
        const source = await businessPlans.source(c, {}, plan);
        await businessPlans.validatePurchaseSource(c, source, sourceLines, plan.id);
      }
      C.date(date, 'expected_delivery_date', true);
      const input = body.lines || (sourceLines?.map(l => ({ business_plan_line_id: String(l.id), unit_price: String(l.unit_price), supplier_id: body.supplier_id })));
      C.fail(!Array.isArray(input) || !input.length || input.length > 100, 'VALIDATION_ERROR', 'Đơn mua cần 1–100 dòng nguyên vật liệu.');
      const seen = new Set();
      const lines = input.map(l => {
        C.fields(l, mode === 'PLAN' ? ['business_plan_line_id','supplier_id','unit_price','quantity'] : ['item_id','quantity','unit_price','supplier_id']);
        const source = mode === 'PLAN' ? sourceLines.find(v => String(v.id) === String(l.business_plan_line_id)) : null;
        C.fail(mode === 'PLAN' && !source, 'VALIDATION_ERROR', 'Dòng kế hoạch mua không hợp lệ.');
        const item = source ? String(source.item_id) : l.item_id;
        const supplier = l.supplier_id || body.supplier_id;
        C.fail(!isId(item) || seen.has(String(item)) || !isId(supplier), 'VALIDATION_ERROR', 'Mỗi nguyên vật liệu cần một nhà cung cấp, không trùng mặt hàng.');
        seen.add(String(item));
        if (source && l.quantity != null) C.fail(C.qty(l.quantity) !== C.qty(String(source.quantity)), 'VALIDATION_ERROR', 'Số lượng phải đúng kế hoạch mua.');
        return { item_id: String(item), supplier_id: String(supplier), business_plan_line_id: source ? String(source.id) : null,
          quantity: C.decimal(C.qty(source ? String(source.quantity) : l.quantity)), unit_price: C.money(C.price(l.unit_price)) };
      });
      C.fail(sourceLines && lines.length !== sourceLines.length, 'VALIDATION_ERROR', 'Đơn mua phải đủ các dòng kế hoạch.');
      const supplierIds = [...new Set(lines.map(l => l.supplier_id))];
      const [suppliers] = await c.execute('SELECT id FROM suppliers WHERE is_active=1 AND id IN (' + supplierIds.map(() => '?').join(',') + ')', supplierIds);
      C.fail(suppliers.length !== supplierIds.length, 'VALIDATION_ERROR', 'Nhà cung cấp không tồn tại hoặc ngừng hoạt động.');
      const itemIds = [...seen];
      const [items] = await c.execute("SELECT id FROM items WHERE kind='MATERIAL' AND is_active=1 AND id IN (" + itemIds.map(() => '?').join(',') + ')', itemIds);
      C.fail(items.length !== itemIds.length, 'VALIDATION_ERROR', 'Chỉ mua nguyên vật liệu đang hoạt động.');
      let total = 0n;
      for (const l of lines) total += (C.qty(l.quantity) * C.price(l.unit_price) + 500n) / 1000n;
      C.fail(total > 9999999999999999999n, 'VALIDATION_ERROR', 'Tổng tiền vượt giới hạn.');
      const [namedSuppliers] = await c.execute('SELECT id,name FROM suppliers WHERE id IN (' + supplierIds.map(() => '?').join(',') + ') ORDER BY id FOR UPDATE', supplierIds);
      const supplierName = namedSuppliers.length === 1 ? namedSuppliers[0].name : 'NHIEUNHACUNGCAP';
      const [[sequence]] = await c.execute('SELECT COUNT(*) AS total FROM purchase_orders WHERE ' + (supplierIds.length === 1 ? 'supplier_id=?' : 'supplier_id IS NULL'), supplierIds.length === 1 ? [supplierIds[0]] : []);
      const proposedCode = recordCode.code('DM', supplierName, Number(sequence.total) + 1);
      const code = supplierIds.length === 1 ? await recordCode.distinguishNames(c, 'purchase_orders', proposedCode, supplierIds[0], 'NCC') : proposedCode;
      const [created] = await c.execute("INSERT INTO purchase_orders (code,business_plan_id,production_report_id,source_mode,supplier_id,created_by,expected_delivery_date,delivery_terms,status,total_amount,version) VALUES (?,?,?,?,?,?,?,?,'PENDING',?,1)",
        [code, plan?.id || null, plan?.production_report_id || null, mode, supplierIds.length === 1 ? supplierIds[0] : null, user.id, date, body.delivery_terms.trim(), C.money(total)]);
      id = created.insertId;
      for (const l of lines) await c.execute('INSERT INTO purchase_order_lines (purchase_order_id,business_plan_line_id,item_id,quantity,unit_price,supplier_id) VALUES (?,?,?,?,?,?)',
        [id,l.business_plan_line_id,l.item_id,l.quantity,l.unit_price,l.supplier_id]);
      await c.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'purchase-orders',?,'CREATE',?,?)",
        [user.id,id,JSON.stringify({code,source_mode:mode,business_plan_id:plan?.id || null,suppliers:supplierIds}),requestId]);
      await c.commit();
    } catch(e) {
      await c.rollback();
      if (e.code === 'ER_DUP_ENTRY') throw new C.DomainError(409,'DUPLICATE','Kế hoạch đã có đơn mua.');
      throw e;
    } finally { c.release(); }
    return this.get(user,id);
  }
}
module.exports = PurchaseOrderService;
