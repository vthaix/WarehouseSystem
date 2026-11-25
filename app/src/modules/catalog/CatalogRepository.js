const C = require("../../services/domain/core");
const paginate = require("../../utils/pagination");

const tables = {
  categories: "categories",
  warehouses: "warehouses",
  "warehouse-locations": "warehouse_locations",
  suppliers: "suppliers",
  units: "units",
  items: "items",
  lots: "lots",
};

const LIST_COLUMNS = {
  items: "t.*,u.name AS unit,n.TieuChuanNhap AS material_quality_standard,f.HanSuDungMacDinhNgay AS default_shelf_life_days",
  lots: "t.*,i.name AS item_name,h.code AS lot_header_code",
};
const LIST_JOINS = {
  items: " JOIN units u ON u.id = t.unit_id" +
    " LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id",
  lots: " JOIN items i ON i.id=t.item_id LEFT JOIN lot_headers h ON h.id=t.lot_header_id",
};

const DETAIL_SQL = {
  items: "SELECT t.*,u.name AS unit,c.name AS category_name,n.TieuChuanNhap AS material_quality_standard," +
    "f.HanSuDungMacDinhNgay AS default_shelf_life_days" +
    " FROM items t JOIN units u ON u.id=t.unit_id JOIN categories c ON c.id=t.category_id" +
    " LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id WHERE t.id=?",
  lots: "SELECT t.*,i.name AS item_name,h.code AS lot_header_code,u.name AS unit,s.name AS supplier_name,w.name AS workshop_name" +
    " FROM lots t JOIN items i ON i.id=t.item_id JOIN units u ON u.id=i.unit_id" +
    " LEFT JOIN lot_headers h ON h.id=t.lot_header_id" +
    " LEFT JOIN purchase_order_lines pl ON pl.id=t.purchase_order_line_id" +
    " LEFT JOIN purchase_orders po ON po.id=pl.purchase_order_id" +
    " LEFT JOIN suppliers s ON s.id=COALESCE(pl.supplier_id,po.supplier_id)" +
    " LEFT JOIN production_plans pp ON pp.id=t.production_plan_id" +
    " LEFT JOIN workshops w ON w.id=pp.workshop_id WHERE t.id=?",
  warehouses: "SELECT t.*,(SELECT name FROM workshops WHERE id=t.workshop_id) AS workshop_name FROM warehouses t WHERE t.id=?",
  "warehouse-locations": "SELECT t.*,(SELECT name FROM warehouses WHERE id=t.warehouse_id) AS warehouse_name," +
    "(SELECT name FROM categories WHERE id=t.zone_category_id) AS category_name FROM warehouse_locations t WHERE t.id=?",
};

const KINDS = ["MATERIAL", "FINISHED_PRODUCT"];
const isId = (value) => /^[1-9]\d*$/.test(String(value));
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

class CatalogRepository {
  constructor(pool, resources = Object.keys(tables)) {
    this.pool = pool;
    this.resources = new Set(resources);
  }

  supports(resource) {
    return Object.hasOwn(tables, resource) && this.resources.has(resource);
  }

  checkSupported(resource) {
    C.fail(!this.supports(resource), "NOT_IMPLEMENTED", "Chức năng chưa được triển khai với MySQL.", 501);
  }

  async list(resource, query = {}) {
    this.checkSupported(resource);
    const { page, per_page, offset } = paginate(query);
    const { where, values } = buildFilter(resource, query);

    const [[count]] = await this.pool.execute(`SELECT COUNT(*) AS total FROM ${tables[resource]} t${where}`, values);
    const [rows] = await this.pool.execute(
      `SELECT ${LIST_COLUMNS[resource] || "t.*"} FROM ${tables[resource]} t${LIST_JOINS[resource] || ""}${where}` +
        " ORDER BY t.id DESC LIMIT ? OFFSET ?",
      [...values, String(per_page), String(offset)],
    );

    let data = rows.map(normalize);
    if (resource === "suppliers") data = await this.withSupplies(data);
    const total = Number(count.total);
    return { data, meta: { page, per_page, total, total_pages: Math.ceil(total / per_page) } };
  }

  async get(resource, id) {
    this.checkSupported(resource);
    C.fail(!/^\d+$/.test(String(id)), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    const sql = DETAIL_SQL[resource] || `SELECT * FROM ${tables[resource]} WHERE id = ?`;
    const [rows] = await this.pool.execute(sql, [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);

    const row = normalize(rows[0]);
    if (resource !== "suppliers") return row;
    const [supplier] = await this.withSupplies([row]);
    return supplier;
  }

  async withSupplies(suppliers) {
    const [materials] = await this.pool.execute(
      "SELECT i.id,i.name,n.BangGiaNCC FROM items i JOIN NguyenVatLieu n ON n.MaMatHang=i.id WHERE i.is_active=1",
    );
    return suppliers.map((supplier) => ({
      ...supplier,
      supplied_items: materials
        .filter((material) => readOffers(material).some((offer) => String(offer.supplier_id) === String(supplier.id)))
        .map((material) => ({ id: String(material.id), name: material.name })),
    }));
  }
}

function buildFilter(resource, query) {
  const conditions = [], values = [];
  const add = (condition, ...params) => {
    conditions.push(condition);
    values.push(...params);
  };

  if (["items", "categories"].includes(resource) && query.include_inactive !== "true") add("t.is_active=1");
  if (resource === "categories" && query.kind) {
    invalid(!KINDS.includes(query.kind), "Nhóm danh mục không hợp lệ.");
    add("t.LoaiDanhMuc=?", query.kind);
  }
  if (resource === "items" && query.category_id) {
    invalid(!isId(query.category_id), "Danh mục không hợp lệ.");
    add("t.category_id=?", String(query.category_id));
  }
  if (resource === "lots" && query.lot_header_id) {
    invalid(!isId(query.lot_header_id), "Lô tổng không hợp lệ.");
    add("t.lot_header_id=?", String(query.lot_header_id));
  }
  if (query.q) {
    C.text(query.q, "q", 150);
    const text = "%" + query.q + "%";
    if (resource === "lots") add("t.code LIKE ?", text);
    else add("(t.code LIKE ? OR t.name LIKE ?)", text, text);
  }
  if (resource === "items" && query.kind) {
    invalid(!KINDS.includes(query.kind), "Loại mặt hàng không hợp lệ.");
    add("t.kind = ?", query.kind);
  }
  if (query.sampleOnly)
    add("t.kind = 'FINISHED_PRODUCT' AND t.is_sample = 1 AND t.is_published = 1 AND t.is_active = 1");

  return { where: conditions.length ? " WHERE " + conditions.join(" AND ") : "", values };
}

function readOffers(material) {
  if (typeof material.BangGiaNCC === "string") return JSON.parse(material.BangGiaNCC);
  return material.BangGiaNCC || [];
}

function normalize(row) {
  const result = { ...row, actions: [] };
  delete result.BangGiaNCC;
  if (Object.hasOwn(result, "LoaiDanhMuc")) {
    result.catalog_kind = result.LoaiDanhMuc;
    delete result.LoaiDanhMuc;
  }
  for (const key of Object.keys(result)) {
    if (key === "id" || key.endsWith("_id")) result[key] = result[key] === null ? null : String(result[key]);
    if (key.startsWith("is_")) result[key] = Boolean(result[key]);
  }
  return result;
}

module.exports = CatalogRepository;
