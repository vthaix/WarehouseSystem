const C = require("../../services/domain/core");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const reportRoles = {
  inventory: ["DIRECTOR"],
  "stock-documents": ["DIRECTOR", "WORKSHOP_OWNER"],
  stocktakes: ["DIRECTOR"],
};
class ReportService {
  constructor(pool) { this.pool = pool; }

  validate(user, kind, query, exportMode) {
    C.fail(!reportRoles[kind] || !user.roles.some((role) => reportRoles[kind].includes(role)), "FORBIDDEN", "Bạn không có quyền xem báo cáo.", 403);
    const common = ["warehouse_id", "page", "per_page", "sort"];
    const extra = kind === "inventory" ? ["item_id", "kind", "lot_id", "quality_bucket", "as_of"]
      : kind === "stock-documents" ? ["from", "to", "type"]
      : ["stocktake_id"];
    C.fields(query, [...common, ...extra, ...(exportMode ? ["format"] : [])]);
    for (const name of ["warehouse_id", "item_id", "lot_id", "stocktake_id"])
      if (query[name] !== undefined) C.fail(!isId(query[name]), "VALIDATION_ERROR", `${name} không hợp lệ.`);
    if (query.kind) C.fail(!["MATERIAL", "FINISHED_PRODUCT"].includes(query.kind), "VALIDATION_ERROR", "Loại mặt hàng không hợp lệ.");
    if (query.quality_bucket) C.fail(!["AVAILABLE", "QUARANTINE"].includes(query.quality_bucket), "VALIDATION_ERROR", "Nhóm chất lượng không hợp lệ.");
    if (query.type) C.fail(!["IN", "OUT"].includes(query.type), "VALIDATION_ERROR", "Loại phiếu không hợp lệ.");
    if (query.from) C.date(query.from, "from");
    if (query.to) C.date(query.to, "to");
    C.fail(query.from && query.to && query.from > query.to, "VALIDATION_ERROR", "Khoảng ngày không hợp lệ.");
    if (query.as_of) {
      C.fail(typeof query.as_of !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(query.as_of) || !Number.isFinite(Date.parse(query.as_of)) || Date.parse(query.as_of) > Date.now(), "VALIDATION_ERROR", "Mốc thời gian không hợp lệ.");
    }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    if (exportMode) C.fail(query.format !== "csv", "VALIDATION_ERROR", "Chỉ hỗ trợ CSV.");
  }

  async inventory(user, query = {}, exportMode = false) {
    this.validate(user, "inventory", query, exportMode);
    const filters = ["m.posted_at<=?"], params = [query.as_of ? new Date(query.as_of) : new Date()];
    if (query.warehouse_id) { filters.push("w.id=?"); params.push(query.warehouse_id); }
    if (query.item_id) { filters.push("i.id=?"); params.push(query.item_id); }
    if (query.lot_id) { filters.push("l.id=?"); params.push(query.lot_id); }
    if (query.kind) { filters.push("i.kind=?"); params.push(query.kind); }
    if (query.quality_bucket) { filters.push("m.quality_bucket=?"); params.push(query.quality_bucket); }
    const base = " FROM inventory_movements m JOIN lots l ON l.id=m.lot_id JOIN items i ON i.id=l.item_id JOIN warehouse_locations wl ON wl.id=m.location_id JOIN warehouses w ON w.id=wl.warehouse_id WHERE " + filters.join(" AND ");
    const grouped = "SELECT l.id AS lot_id,l.code AS lot_code,i.id AS item_id,i.code AS item_code,i.name AS item_name,i.kind,w.id AS warehouse_id,w.name AS warehouse_name,wl.id AS location_id,wl.code AS location_code,m.quality_bucket,SUM(m.quantity_delta) AS quantity" + base + " GROUP BY l.id,i.id,w.id,wl.id,m.quality_bucket HAVING SUM(m.quantity_delta)<>0";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total,COALESCE(SUM(quantity),0) AS total_quantity FROM (" + grouped + ") x", params);
    const { page, per_page, offset } = paginate(query);
    const [rows] = await this.pool.execute("SELECT * FROM (" + grouped + ") x ORDER BY warehouse_id,location_id,item_id,lot_id" + (exportMode ? " LIMIT 50001" : " LIMIT ? OFFSET ?"), exportMode ? params : [...params, String(per_page), String(offset)]);
    C.fail(exportMode && rows.length > 50000, "EXPORT_TOO_LARGE", "Báo cáo vượt 50.000 dòng.", 422);
    return { data: rows.map(normalize), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page), total_quantity: String(count.total_quantity), as_of: params[0].toISOString() } };
  }

  async stockDocuments(user, query = {}, exportMode = false) {
    this.validate(user, "stock-documents", query, exportMode);
    const where = [], params = [];
    if (!user.roles.includes("DIRECTOR")) {
      if (!user.workshop_ids.length) where.push("1=0");
      else { where.push("r.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")"); params.push(...user.workshop_ids); }
    }
    if (query.warehouse_id) { where.push("d.warehouse_id=?"); params.push(query.warehouse_id); }
    if (query.type) { where.push("d.type=?"); params.push(query.type); }
    if (query.from) { where.push("DATE(d.posted_at)>=?"); params.push(query.from); }
    if (query.to) { where.push("DATE(d.posted_at)<=?"); params.push(query.to); }
    const base = " FROM stock_documents d JOIN stock_requests r ON r.id=d.stock_request_id JOIN warehouses w ON w.id=d.warehouse_id" + (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total" + base, params);
    const { page, per_page, offset } = paginate(query);
    const [rows] = await this.pool.execute("SELECT d.id,d.code,d.type,d.posted_at,d.status,d.stock_request_id,r.code AS stock_request_code,r.workshop_id,w.name AS warehouse_name,d.warehouse_id" + base + " ORDER BY d.posted_at DESC,d.id DESC" + (exportMode ? " LIMIT 50001" : " LIMIT ? OFFSET ?"), exportMode ? params : [...params, String(per_page), String(offset)]);
    C.fail(exportMode && rows.length > 50000, "EXPORT_TOO_LARGE", "Báo cáo vượt 50.000 dòng.", 422);
    return { data: rows.map(normalize), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page), generated_at: new Date().toISOString() } };
  }

  async stocktakes(user, query = {}, exportMode = false) {
    this.validate(user, "stocktakes", query, exportMode);
    const where = [], params = [];
    if (query.warehouse_id) { where.push("sw.warehouse_id=?"); params.push(query.warehouse_id); }
    if (query.stocktake_id) { where.push("s.id=?"); params.push(query.stocktake_id); }
    const base = " FROM stocktake_lines l JOIN stocktake_warehouses sw ON sw.id=l.stocktake_warehouse_id JOIN stocktakes s ON s.id=sw.stocktake_id JOIN lots lot ON lot.id=l.lot_id JOIN items i ON i.id=lot.item_id" + (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total" + base, params);
    const { page, per_page, offset } = paginate(query);
    const [rows] = await this.pool.execute("SELECT s.id AS stocktake_id,s.code AS stocktake_code,sw.warehouse_id,lot.code AS lot_code,i.code AS item_code,l.location_id,l.quality_bucket,l.system_quantity,l.actual_quantity,l.resolution_status,l.counted_at" + base + " ORDER BY s.id DESC,l.id" + (exportMode ? " LIMIT 50001" : " LIMIT ? OFFSET ?"), exportMode ? params : [...params, String(per_page), String(offset)]);
    C.fail(exportMode && rows.length > 50000, "EXPORT_TOO_LARGE", "Báo cáo vượt 50.000 dòng.", 422);
    return { data: rows.map(normalize), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page), generated_at: new Date().toISOString() } };
  }

  async run(user, kind, query, exportMode = false) {
    if (kind === "inventory") return this.inventory(user, query, exportMode);
    if (kind === "stock-documents") return this.stockDocuments(user, query, exportMode);
    if (kind === "stocktakes") return this.stocktakes(user, query, exportMode);
    throw new C.DomainError(404, "NOT_FOUND", "Không tìm thấy báo cáo.");
  }

  async csv(user, kind, query) {
    const result = await this.run(user, kind, query, true);
    const keys = result.data.length ? Object.keys(result.data[0]) : kind === "inventory" ? ["warehouse_id", "location_id", "item_id", "lot_id", "quality_bucket", "quantity"] : ["id", "code", "status"];
    const escape = (value) => {
      let string = value == null ? "" : String(value);
      if (/^[=+\-@]/.test(string)) string = "'" + string;
      return '"' + string.replaceAll('"', '""') + '"';
    };
    return "\uFEFF" + keys.map(escape).join(",") + "\r\n" + result.data.map((row) => keys.map((key) => escape(row[key])).join(",")).join("\r\n") + "\r\n";
  }
}

function normalize(row) {
  const result = { ...row };
  for (const field of Object.keys(result)) if (field === "id" || field.endsWith("_id")) result[field] = result[field] == null ? null : String(result[field]);
  return result;
}
module.exports = ReportService;
