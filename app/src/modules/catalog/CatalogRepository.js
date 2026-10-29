const tables = {
  categories: "categories",
  warehouses: "warehouses",
  "warehouse-locations": "warehouse_locations",
  suppliers: "suppliers",
  units: "units",
  items: "items",
  lots: "lots",
};
const C = require("../../services/domain/core");
const paginate = require("../../utils/pagination");
class CatalogRepository {
  constructor(pool, resources = Object.keys(tables)) {
    this.pool = pool;
    this.resources=new Set(resources);
  }
  supports(resource) {
    return Object.hasOwn(tables, resource) && this.resources.has(resource);
  }
  async list(resource, query = {}) {
    C.fail(
      !this.supports(resource),
      "NOT_IMPLEMENTED",
      "Chức năng chưa được triển khai với MySQL.",
      501,
    );
    const { page, per_page, offset } = paginate(query);
    const where = [],
      values = [];
    if(['items','categories'].includes(resource)&&query.include_inactive!=='true')where.push('t.is_active=1');
    if(resource==='categories'&&query.kind){C.fail(!['MATERIAL','FINISHED_PRODUCT'].includes(query.kind),'VALIDATION_ERROR','Nhóm danh mục không hợp lệ.');where.push('t.LoaiDanhMuc=?');values.push(query.kind);}
    if(resource==='items'&&query.category_id){C.fail(!/^[1-9]\d*$/.test(String(query.category_id)),'VALIDATION_ERROR','Danh mục không hợp lệ.');where.push('t.category_id=?');values.push(String(query.category_id));}
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push(resource === "lots" ? "t.code LIKE ?" : "(t.code LIKE ? OR t.name LIKE ?)");
      values.push("%" + query.q + "%");
      if (resource !== "lots") values.push("%" + query.q + "%");
    }
    if (resource === "items" && query.kind) {
      C.fail(
        !["MATERIAL", "FINISHED_PRODUCT"].includes(query.kind),
        "VALIDATION_ERROR",
        "Loại mặt hàng không hợp lệ.",
      );
      where.push("t.kind = ?");
      values.push(query.kind);
    }
    if (query.sampleOnly) {
      where.push(
        "t.kind = 'FINISHED_PRODUCT' AND t.is_sample = 1 AND t.is_published = 1 AND t.is_active = 1",
      );
    }
    const clause = where.length ? " WHERE " + where.join(" AND ") : "";
    const select = resource === "items" ? "t.*,u.name AS unit,n.TieuChuanNhap AS material_quality_standard,f.HanSuDungMacDinhNgay AS default_shelf_life_days" : resource === "lots" ? "t.*,i.name AS item_name" : "t.*",
      join = resource === "items" ? " JOIN units u ON u.id = t.unit_id LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id" : resource === "lots" ? " JOIN items i ON i.id=t.item_id" : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM " + tables[resource] + " t" + clause,
      values,
    );
    const [rows] = await this.pool.execute(
      "SELECT " +
        select +
        " FROM " +
        tables[resource] +
        " t" +
        join +
        clause +
        " ORDER BY t.id DESC LIMIT ? OFFSET ?",
      [...values, String(per_page), String(offset)],
    );
    return {
      data: rows.map(normalize),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }
  async get(resource, id) {
    C.fail(
      !this.supports(resource),
      "NOT_IMPLEMENTED",
      "Chức năng chưa được triển khai với MySQL.",
      501,
    );
    C.fail(
      !/^\d+$/.test(String(id)),
      "NOT_FOUND",
      "Không tìm thấy dữ liệu.",
      404,
    );
    const [rows] = await this.pool.execute(
      resource === 'items' ? 'SELECT t.*,n.TieuChuanNhap AS material_quality_standard,f.HanSuDungMacDinhNgay AS default_shelf_life_days FROM items t LEFT JOIN NguyenVatLieu n ON n.MaMatHang=t.id LEFT JOIN ThanhPham f ON f.MaMatHang=t.id WHERE t.id=?' : resource === "lots" ? "SELECT t.*,i.name AS item_name FROM lots t JOIN items i ON i.id=t.item_id WHERE t.id=?" : "SELECT * FROM " + tables[resource] + " WHERE id = ?",
      [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    return normalize(rows[0]);
  }
}
function normalize(row) {
  const result = { ...row, actions: [] };
  delete result.BangGiaNCC;
  if(Object.hasOwn(result,'LoaiDanhMuc')){result.catalog_kind=result.LoaiDanhMuc;delete result.LoaiDanhMuc;}
  for (const key of Object.keys(result)) {
    if (key === "id" || key.endsWith("_id"))
      result[key] = result[key] === null ? null : String(result[key]);
    if (key.startsWith("is_")) result[key] = Boolean(result[key]);
  }
  return result;
}
module.exports = CatalogRepository;
