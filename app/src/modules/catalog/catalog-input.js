const C = require("../../services/domain/core");

const RESOURCES = {
  categories: {
    table: "categories",
    label: "danh mục",
    create: ["code", "name", "catalog_kind", "description", "image_path", "is_active"],
    edit: ["version", "name", "catalog_kind", "description", "image_path", "is_active"],
    required: ["name", "catalog_kind"],
    autoCode: true,
  },
  items: {
    table: "items",
    label: "mặt hàng",
    create: ["code", "name", "kind", "category_id", "unit_id", "reference_price", "description", "image_path",
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    edit: ["version", "name", "category_id", "unit_id", "reference_price", "description", "image_path",
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    required: ["name", "kind", "category_id", "unit_id", "reference_price"],
    autoCode: true,
  },
  warehouses: {
    table: "warehouses",
    label: "kho",
    create: ["code", "name", "address", "is_active"],
    edit: ["name", "address", "is_active"],
    required: ["code", "name"],
  },
  "warehouse-locations": {
    table: "warehouse_locations",
    label: "vị trí kho",
    create: ["warehouse_id", "code", "name", "zone_name", "zone_category_id", "depth", "is_active"],
    edit: ["name", "zone_name", "zone_category_id", "depth", "is_active"],
    required: ["warehouse_id", "code", "name"],
  },
  suppliers: {
    table: "suppliers",
    label: "nhà cung cấp",
    create: ["code", "name", "phone", "email", "address", "tax_code", "is_active"],
    edit: ["name", "phone", "email", "address", "tax_code", "is_active"],
    required: ["code", "name"],
  },
};

const LABELS = {
  code: "Mã", name: "Tên", description: "Mô tả", catalog_kind: "Nhóm danh mục", kind: "Loại mặt hàng",
  category_id: "Danh mục", unit_id: "Đơn vị tính", reference_price: "Giá tham khảo", warehouse_id: "Kho",
  address: "Địa chỉ", phone: "Số điện thoại", email: "Email", tax_code: "Mã số thuế", zone_name: "Tên khu",
  material_quality_standard: "Tiêu chuẩn nhập", default_shelf_life_days: "Hạn sử dụng mặc định",
};
const MAX_LENGTH = { code: 40, name: 150, address: 500, phone: 20, email: 254, tax_code: 30, zone_name: 120 };
const OPTIONAL_TEXT = ["description", "address", "phone", "email", "tax_code"];

const labelOf = (field) => LABELS[field] || field;
const isId = (value) => /^[1-9]\d*$/.test(String(value));
const isBlank = (value) => value === undefined || value === null || (typeof value === "string" && !value.trim());
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);

const hasVersion = (resource) => RESOURCES[resource].edit.includes("version");

function readKind(value) {
  invalid(!["MATERIAL", "FINISHED_PRODUCT"].includes(value), "Chọn nhóm Nguyên vật liệu hoặc Thành phẩm.");
  return value;
}

function readId(value, field) {
  invalid(!isId(value), `${labelOf(field)} không hợp lệ.`);
  return String(value);
}

function readZoneCategory(value) {
  if (isBlank(value)) return null;
  invalid(!isId(value), "Nhóm hàng của khu không hợp lệ.");
  return String(value);
}

function readDepth(value) {
  const depth = Number(value);
  invalid(!Number.isInteger(depth) || depth < 1 || depth > 100, "Độ sâu vị trí phải từ 1 đến 100.");
  return depth;
}

function readPrice(value) {
  const text = typeof value === "number" ? String(value) : value;
  invalid(typeof text !== "string" || !/^-?\d+(\.\d+)?$/.test(text.trim()), "Giá tham khảo phải là số. Vui lòng nhập lại.");
  invalid(text.trim().startsWith("-"), "Giá tham khảo không được nhỏ hơn 0. Vui lòng nhập lại.");
  return C.money(C.price(text.trim()));
}

function readShelfLife(value) {
  const wrong = value !== null && (!Number.isInteger(value) || value < 1 || value > 36500);
  invalid(wrong, "Hạn sử dụng mặc định phải là số ngày từ 1 đến 36500.");
  return value;
}

function readQualityStandard(value) {
  if (isBlank(value)) return null;
  invalid(typeof value !== "string" || value.length > 1000, "Tiêu chuẩn nhập không hợp lệ hoặc quá dài.");
  return value.trim();
}

function readImage(value, field, resource) {
  const images = resource === "items" ? require("../../config/item-images") : require("../../config/category-images");
  return images.validatePath(value);
}

function readFlag(value, field) {
  invalid(typeof value !== "boolean", `${field} phải là true hoặc false.`);
  return value ? 1 : 0;
}

function readText(value, field) {
  const required = !OPTIONAL_TEXT.includes(field);
  invalid(required && isBlank(value), `Vui lòng nhập đầy đủ thông tin: ${labelOf(field)}.`);
  const maxLength = MAX_LENGTH[field] || 5000;
  invalid(value != null && (typeof value !== "string" || value.length > maxLength), `${labelOf(field)} không hợp lệ hoặc quá dài.`);
  const wrongEmail = field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  invalid(wrongEmail, "Email không hợp lệ.");
  return value ? value.trim() : null;
}

const FIELD_RULES = {
  catalog_kind: readKind,
  kind: readKind,
  category_id: readId,
  unit_id: readId,
  warehouse_id: readId,
  zone_category_id: readZoneCategory,
  depth: readDepth,
  reference_price: readPrice,
  default_shelf_life_days: readShelfLife,
  material_quality_standard: readQualityStandard,
  image_path: readImage,
  is_active: readFlag,
  is_sample: readFlag,
  is_published: readFlag,
};

function readInput(resource, body, mode) {
  C.fields(body, RESOURCES[resource][mode]);
  if (mode === "create") checkRequired(resource, body);
  else checkHasChange(body);

  const values = {};
  for (const [field, value] of Object.entries(body)) {
    if (field === "version") continue;
    if (field === "code" && RESOURCES[resource].autoCode && isBlank(value)) continue;
    const column = field === "catalog_kind" ? "LoaiDanhMuc" : field;
    const readField = FIELD_RULES[field] || readText;
    values[column] = readField(value, field, resource);
  }
  return values;
}

function checkRequired(resource, body) {
  const missing = RESOURCES[resource].required.filter((field) => isBlank(body[field]));
  invalid(missing.length, "Vui lòng nhập đầy đủ thông tin: " + missing.map(labelOf).join(", ") + ".");
}

function checkHasChange(body) {
  const changed = Object.keys(body).filter((field) => field !== "version");
  invalid(!changed.length, "Không có nội dung cần sửa.");
}

module.exports = { RESOURCES, hasVersion, isId, readInput };
