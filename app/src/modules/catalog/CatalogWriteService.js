// =============================================================================
// GHI DỮ LIỆU DANH MỤC KHO
//   UC-06.1 Thêm danh mục        → create("categories")
//   UC-06.3 Sửa danh mục         → update("categories")
//   UC-06.2 Xóa danh mục         → remove("categories")
//   UC-07.1 Thêm mặt hàng        → create("items")
//   UC-07.3 Sửa mặt hàng         → update("items")
//   UC-07.2 Xóa mặt hàng         → remove("items")
// Kho, vị trí kho và nhà cung cấp dùng chung cách ghi này.
// Chỉ Quản lý kho được ghi. Mọi thao tác chạy trong một transaction và ghi nhật ký.
// =============================================================================
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");

const KINDS = ["MATERIAL", "FINISHED_PRODUCT"]; // Nguyên vật liệu / Thành phẩm

// Mỗi loại dữ liệu: bảng, tên hiển thị, trường được gửi khi thêm/sửa, trường bắt buộc khi thêm.
// "code" của danh mục và mặt hàng không bắt buộc: bỏ trống thì hệ thống tự sinh mã.
const RESOURCES = {
  categories: {
    table: "categories",
    label: "danh mục",
    create: ["code", "name", "catalog_kind", "description", "image_path", "is_active"],
    edit: ["version", "name", "catalog_kind", "description", "image_path", "is_active"],
    required: ["name", "catalog_kind"],
    codePrefix: () => "DM",
  },
  items: {
    table: "items",
    label: "mặt hàng",
    create: ["code", "name", "kind", "category_id", "unit_id", "reference_price", "description", "image_path",
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    edit: ["version", "name", "category_id", "unit_id", "reference_price", "description", "image_path",
      "material_quality_standard", "default_shelf_life_days", "is_sample", "is_published", "is_active"],
    required: ["name", "kind", "category_id", "unit_id", "reference_price"],
    codePrefix: (values) => (values.kind === "MATERIAL" ? "NVL" : "TP"),
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

// Tên tiếng Việt của trường, dùng trong thông báo lỗi.
const LABELS = {
  code: "Mã", name: "Tên", description: "Mô tả", catalog_kind: "Nhóm danh mục", kind: "Loại mặt hàng",
  category_id: "Danh mục", unit_id: "Đơn vị tính", reference_price: "Giá tham khảo", warehouse_id: "Kho",
  address: "Địa chỉ", phone: "Số điện thoại", email: "Email", tax_code: "Mã số thuế", zone_name: "Tên khu",
  material_quality_standard: "Tiêu chuẩn nhập", default_shelf_life_days: "Hạn sử dụng mặc định",
};
const MAX_LENGTH = { code: 40, name: 150, address: 500, phone: 20, email: 254, tax_code: 30, zone_name: 120 };
const OPTIONAL_TEXT = new Set(["description", "address", "phone", "email", "tax_code"]);

// Nơi một mặt hàng được dùng tới. Có một dòng ở đây thì không xóa được mặt hàng,
// cũng không đổi được danh mục / đơn vị tính (UC-07.2 bước 2, UC-07.3 ngoại lệ 4.4).
const ITEM_USAGE = [
  ["lots", "lô hàng / tồn kho"],
  ["stock_request_lines", "yêu cầu nhập xuất"],
  ["customer_order_lines", "đơn hàng"],
  ["purchase_order_lines", "đơn mua hàng"],
  ["business_plan_lines", "kế hoạch mua bán"],
  ["production_plan_lines", "kế hoạch sản xuất"],
  ["report_details", "báo cáo sản xuất"],
];

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const isBlank = (value) => value === undefined || value === null || (typeof value === "string" && !value.trim());

class CatalogWriteService {
  constructor(pool, repository, resources = Object.keys(RESOURCES)) {
    this.pool = pool;
    this.repository = repository;
    this.resources = new Set(resources);
  }

  // ---------------------------------------------------------------------------
  // UC-06.1 / UC-07.1: THÊM
  // ---------------------------------------------------------------------------
  async create(user, resource, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    const values = this.validate(resource, body, true);
    // Mặc định: còn hoạt động; mặt hàng mới không phải hàng mẫu, chưa công bố.
    if (values.is_active === undefined) values.is_active = 1;
    if (resource === "items") {
      values.is_sample ??= 0;
      values.is_published ??= 0;
      values.version = 1;
      this.checkSampleFlags(values.kind, values);
    }
    const subtype = takeSubtypeFields(values);

    const id = await this.transaction(async (connection) => {
      await this.checkReferences(connection, resource, values, values.kind);
      await this.assertNameFree(connection, resource, values.name);
      if (definition.codePrefix && !values.code)
        values.code = await this.nextCode(connection, definition, values);

      const columns = Object.keys(values);
      const [result] = await connection.execute(
        `INSERT INTO ${definition.table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
        Object.values(values),
      );
      if (resource === "items") await this.saveSubtype(connection, result.insertId, values.kind, subtype);
      await this.audit(connection, user, resource, result.insertId, "CREATE", null, values, requestId);
      return result.insertId;
    });
    return this.repository.get(resource, id);
  }

  // ---------------------------------------------------------------------------
  // UC-06.3 / UC-07.3: SỬA
  // ---------------------------------------------------------------------------
  async update(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    const values = this.validate(resource, body, false);
    const subtype = takeSubtypeFields(values);

    await this.transaction(async (connection) => {
      const current = await this.lockRow(connection, definition, id);
      if (definition.edit.includes("version")) C.version(current, body.version); // ngoại lệ 3.3: không ghi đè bản mới hơn

      if (resource === "categories" && values.LoaiDanhMuc)
        await this.assertGroupChangeAllowed(connection, id, values.LoaiDanhMuc);
      if (resource === "items") {
        this.checkSampleFlags(current.kind, { ...current, ...values });
        await this.assertItemChangeAllowed(connection, current, values);
        await this.checkReferences(connection, resource, values, current.kind);
      }
      if (values.name !== undefined) await this.assertNameFree(connection, resource, values.name, id);

      const sets = Object.keys(values).map((column) => `${column}=?`);
      if (definition.edit.includes("version")) sets.push("version=version+1");
      if (sets.length)
        await connection.execute(`UPDATE ${definition.table} SET ${sets.join(",")} WHERE id=?`, [...Object.values(values), id]);
      if (resource === "items") await this.saveSubtype(connection, id, current.kind, subtype);
      await this.audit(connection, user, resource, id, "UPDATE", current, { ...values, ...subtype }, requestId);
    });
    return this.repository.get(resource, id);
  }

  // ---------------------------------------------------------------------------
  // UC-06.2 / UC-07.2: XÓA (chỉ khi chưa được sử dụng)
  // ---------------------------------------------------------------------------
  async remove(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    const input = body || {};
    C.fields(input, definition.edit.includes("version") ? ["version"] : []);

    await this.transaction(async (connection) => {
      const current = await this.lockRow(connection, definition, id);
      if (definition.edit.includes("version")) C.version(current, input.version);
      if (resource === "categories") await this.assertCategoryUnused(connection, id);
      if (resource === "items") {
        const usedIn = await this.itemUsage(connection, id);
        C.fail(usedIn.length, "IN_USE", `Không thể xóa mặt hàng vì đã phát sinh ${usedIn.join(", ")}.`, 409);
      }
      await connection.execute(`DELETE FROM ${definition.table} WHERE id=?`, [id]);
      await this.audit(connection, user, resource, id, "DELETE", current, null, requestId);
    });
    return { id: String(id), deleted: true };
  }

  // ---------------------------------------------------------------------------
  // KIỂM TRA DỮ LIỆU NHẬP
  // ---------------------------------------------------------------------------

  /** Loại dữ liệu có được phép ghi qua service này không. */
  definition(resource) {
    const definition = RESOURCES[resource];
    C.fail(!definition || !this.resources.has(resource), "NOT_IMPLEMENTED", "Chức năng chưa được triển khai.", 501);
    return definition;
  }

  /** Kiểm tra trường gửi lên và chuẩn hóa giá trị để ghi vào bảng. */
  validate(resource, body, isCreate) {
    const definition = this.definition(resource);
    C.fields(body, isCreate ? definition.create : definition.edit);
    if (isCreate) {
      // Ngoại lệ "dữ liệu bị bỏ trống": liệt kê các trường còn thiếu.
      const missing = definition.required.filter((field) => isBlank(body[field]));
      C.fail(missing.length, "VALIDATION_ERROR",
        "Vui lòng nhập đầy đủ thông tin: " + missing.map((field) => LABELS[field] || field).join(", ") + ".");
    } else {
      C.fail(!Object.keys(body).some((field) => field !== "version"), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    }
    const values = {};
    for (const [field, value] of Object.entries(body)) {
      if (field === "version") continue;
      if (field === "code" && definition.codePrefix && isBlank(value)) continue; // để trống → hệ thống tự sinh mã
      const column = field === "catalog_kind" ? "LoaiDanhMuc" : field; // nhóm danh mục chưa có tên cột tiếng Anh
      values[column] = this.normalize(resource, field, value);
    }
    return values;
  }

  /** Chuẩn hóa một trường; báo lỗi rõ ràng nếu sai định dạng. */
  normalize(resource, field, value) {
    const label = LABELS[field] || field;
    switch (field) {
      case "catalog_kind":
      case "kind":
        C.fail(!KINDS.includes(value), "VALIDATION_ERROR", "Chọn nhóm Nguyên vật liệu hoặc Thành phẩm.");
        return value;
      case "category_id":
      case "unit_id":
      case "warehouse_id":
        C.fail(!isId(value), "VALIDATION_ERROR", `${label} không hợp lệ.`);
        return String(value);
      case "zone_category_id":
        if (isBlank(value)) return null;
        C.fail(!isId(value), "VALIDATION_ERROR", "Nhóm hàng của khu không hợp lệ.");
        return String(value);
      case "depth":
        C.fail(!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 100,
          "VALIDATION_ERROR", "Độ sâu vị trí phải từ 1 đến 100.");
        return Number(value);
      case "reference_price":
        return normalizePrice(value);
      case "default_shelf_life_days":
        C.fail(value !== null && (!Number.isInteger(value) || value < 1 || value > 36500),
          "VALIDATION_ERROR", "Hạn sử dụng mặc định phải là số ngày từ 1 đến 36500.");
        return value;
      case "material_quality_standard":
        if (isBlank(value)) return null;
        C.fail(typeof value !== "string" || value.length > 1000, "VALIDATION_ERROR", "Tiêu chuẩn nhập không hợp lệ hoặc quá dài.");
        return value.trim();
      case "image_path": // ngoại lệ "ảnh không hợp lệ": chỉ nhận ảnh đã tải lên hệ thống
        return require(resource === "items" ? "../../config/item-images" : "../../config/category-images").validatePath(value);
      case "is_active":
      case "is_sample":
      case "is_published":
        C.fail(typeof value !== "boolean", "VALIDATION_ERROR", `${field} phải là true hoặc false.`);
        return value ? 1 : 0;
      default: {
        // Trường chữ: tên, mã, mô tả, địa chỉ...
        const required = !OPTIONAL_TEXT.has(field);
        C.fail(required && isBlank(value), "VALIDATION_ERROR", `Vui lòng nhập đầy đủ thông tin: ${label}.`);
        C.fail(value != null && (typeof value !== "string" || value.length > (MAX_LENGTH[field] || 5000)),
          "VALIDATION_ERROR", `${label} không hợp lệ hoặc quá dài.`);
        C.fail(field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "VALIDATION_ERROR", "Email không hợp lệ.");
        return value ? value.trim() : null;
      }
    }
  }

  /** Hàng mẫu chỉ áp dụng cho thành phẩm; chỉ hàng mẫu mới được công bố cho khách. */
  checkSampleFlags(kind, values) {
    C.fail(values.is_sample === 1 && kind !== "FINISHED_PRODUCT", "VALIDATION_ERROR", "Chỉ thành phẩm được đánh dấu hàng mẫu.");
    C.fail(values.is_published === 1 && values.is_sample !== 1, "VALIDATION_ERROR", "Chỉ công bố mặt hàng mẫu.");
  }

  /**
   * Danh mục, đơn vị tính, kho được chọn phải còn tồn tại và còn hoạt động;
   * danh mục của mặt hàng phải cùng nhóm (UC-07.1 ngoại lệ 4.1).
   */
  async checkReferences(connection, resource, values, itemKind) {
    if (resource === "items" && values.category_id) {
      const [[category]] = await connection.execute("SELECT is_active,LoaiDanhMuc FROM categories WHERE id=?", [values.category_id]);
      C.fail(!category || !category.is_active, "VALIDATION_ERROR", "Danh mục không còn được sử dụng. Vui lòng chọn lại.");
      C.fail(category.LoaiDanhMuc && category.LoaiDanhMuc !== itemKind, "VALIDATION_ERROR", "Mặt hàng phải thuộc đúng nhóm của danh mục.");
    }
    if (resource === "items" && values.unit_id) {
      const [[unit]] = await connection.execute("SELECT id FROM units WHERE id=?", [values.unit_id]);
      C.fail(!unit, "VALIDATION_ERROR", "Đơn vị tính không tồn tại. Vui lòng chọn lại.");
    }
    if (resource === "warehouse-locations" && values.warehouse_id) {
      const [[warehouse]] = await connection.execute("SELECT id FROM warehouses WHERE id=? AND is_active=1", [values.warehouse_id]);
      C.fail(!warehouse, "VALIDATION_ERROR", "Kho không tồn tại hoặc đã ngừng hoạt động.");
    }
  }

  /** Ngoại lệ "tên đã tồn tại" (UC-06.1 4.1, UC-06.3 5.1, UC-07.1 3.1, UC-07.3 4.1). */
  async assertNameFree(connection, resource, name, exceptId = 0) {
    if (!["categories", "items"].includes(resource) || !name) return;
    const definition = RESOURCES[resource];
    const [[same]] = await connection.execute(`SELECT id FROM ${definition.table} WHERE name=? AND id<>? LIMIT 1`, [name, exceptId]);
    C.fail(same, "DUPLICATE", `Tên ${definition.label} đã tồn tại. Vui lòng nhập tên khác.`, 409);
  }

  /** Mã tự sinh khi người dùng để trống: DM-001, NVL-001, TP-001... (số tiếp theo của tiền tố). */
  async nextCode(connection, definition, values) {
    const prefix = definition.codePrefix(values);
    const [rows] = await connection.execute(`SELECT code FROM ${definition.table} WHERE code LIKE ?`, [prefix + "-%"]);
    const numbers = rows.map((row) => row.code.slice(prefix.length + 1)).filter((n) => /^\d+$/.test(n)).map(Number);
    return prefix + "-" + String(Math.max(0, ...numbers) + 1).padStart(3, "0");
  }

  // ---------------------------------------------------------------------------
  // KIỂM TRA DỮ LIỆU ĐÃ ĐƯỢC SỬ DỤNG
  // ---------------------------------------------------------------------------

  /** UC-06.3 ngoại lệ 5.2: không đổi nhóm khi danh mục đang chứa mặt hàng thuộc nhóm khác. */
  async assertGroupChangeAllowed(connection, categoryId, newKind) {
    const [[other]] = await connection.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=? AND kind<>?", [categoryId, newKind]);
    C.fail(Number(other.total) > 0, "IN_USE", "Không đổi được nhóm: danh mục đang chứa mặt hàng thuộc nhóm khác.", 409);
  }

  /** UC-06.2 ngoại lệ 4.1: danh mục còn mặt hàng hoặc đang gắn cho khu trong kho thì không xóa. */
  async assertCategoryUnused(connection, categoryId) {
    const [[items]] = await connection.execute("SELECT COUNT(*) AS total FROM items WHERE category_id=?", [categoryId]);
    const [[zones]] = await connection.execute("SELECT COUNT(*) AS total FROM warehouse_locations WHERE zone_category_id=?", [categoryId]);
    C.fail(Number(items.total) > 0, "IN_USE", `Không thể xóa vì danh mục đang được sử dụng (${items.total} mặt hàng).`, 409);
    C.fail(Number(zones.total) > 0, "IN_USE", "Không thể xóa vì danh mục đang được gắn cho khu trong kho.", 409);
  }

  /** UC-07.3 ngoại lệ 4.4: mặt hàng đã phát sinh chứng từ thì giữ nguyên danh mục và đơn vị tính. */
  async assertItemChangeAllowed(connection, current, values) {
    const changed = [];
    if (values.category_id && values.category_id !== String(current.category_id)) changed.push("danh mục");
    if (values.unit_id && values.unit_id !== String(current.unit_id)) changed.push("đơn vị tính");
    if (!changed.length) return;
    const usedIn = await this.itemUsage(connection, current.id);
    C.fail(usedIn.length, "IN_USE",
      `Không đổi được ${changed.join(" và ")} vì mặt hàng đã phát sinh ${usedIn.join(", ")}. Thông tin cũ được giữ nguyên.`, 409);
  }

  /** Danh sách nơi mặt hàng đã được dùng (rỗng = chưa phát sinh gì). */
  async itemUsage(connection, itemId) {
    const usedIn = [];
    for (const [table, label] of ITEM_USAGE) {
      const [[row]] = await connection.execute(`SELECT 1 AS used FROM ${table} WHERE item_id=? LIMIT 1`, [itemId]);
      if (row) usedIn.push(label);
    }
    return usedIn;
  }

  // ---------------------------------------------------------------------------
  // HỖ TRỢ GHI
  // ---------------------------------------------------------------------------

  /** Đọc và khóa bản ghi; báo không tồn tại nếu đã bị xóa (ngoại lệ 3.3). */
  async lockRow(connection, definition, id) {
    const [[row]] = await connection.execute(`SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`, [id]);
    C.fail(!row, "NOT_FOUND", `Không tìm thấy ${definition.label}. Vui lòng tải lại danh sách.`, 404);
    return row;
  }

  /** Tiêu chuẩn nhập (nguyên vật liệu) và hạn dùng mặc định (thành phẩm) nằm ở bảng con. */
  async saveSubtype(connection, itemId, kind, values) {
    C.fail(kind !== "MATERIAL" && values.material_quality_standard != null, "VALIDATION_ERROR", "Chỉ nguyên vật liệu có tiêu chuẩn nhập.");
    C.fail(kind !== "FINISHED_PRODUCT" && values.default_shelf_life_days != null, "VALIDATION_ERROR", "Chỉ thành phẩm có hạn sử dụng mặc định.");
    if (kind === "MATERIAL" && Object.hasOwn(values, "material_quality_standard"))
      await connection.execute("UPDATE NguyenVatLieu SET TieuChuanNhap=? WHERE MaMatHang=?", [values.material_quality_standard, itemId]);
    if (kind === "FINISHED_PRODUCT" && Object.hasOwn(values, "default_shelf_life_days"))
      await connection.execute("UPDATE ThanhPham SET HanSuDungMacDinhNgay=? WHERE MaMatHang=?", [values.default_shelf_life_days, itemId]);
  }

  async audit(connection, user, resource, id, action, before, after, requestId) {
    await connection.execute(
      "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,?,?,?,?,?,?)",
      [user.id, resource, id, action, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, requestId],
    );
  }

  /** Chạy trong transaction; đổi lỗi ràng buộc của MySQL thành thông báo dễ hiểu. */
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
      if (error.code === "ER_ROW_IS_REFERENCED_2") throw new C.DomainError(409, "IN_USE", "Không thể xóa vì dữ liệu đang được sử dụng.");
      throw error;
    } finally {
      connection.release();
    }
  }
}

/** Tách các trường của bảng con (NguyenVatLieu / ThanhPham) khỏi trường của bảng items. */
function takeSubtypeFields(values) {
  const subtype = {};
  for (const key of ["material_quality_standard", "default_shelf_life_days"])
    if (Object.hasOwn(values, key)) {
      subtype[key] = values[key];
      delete values[key];
    }
  return subtype;
}

/** UC-07.1 ngoại lệ 3.3 (nhập chữ) và 3.4 (giá trị âm). Lưu dạng chuỗi 4 chữ số thập phân. */
function normalizePrice(value) {
  const text = typeof value === "number" ? String(value) : value;
  C.fail(typeof text !== "string" || !/^-?\d+(\.\d+)?$/.test(text.trim()), "VALIDATION_ERROR", "Giá tham khảo phải là số. Vui lòng nhập lại.");
  C.fail(text.trim().startsWith("-"), "VALIDATION_ERROR", "Giá tham khảo không được nhỏ hơn 0. Vui lòng nhập lại.");
  return C.money(C.price(text.trim()));
}

module.exports = CatalogWriteService;
