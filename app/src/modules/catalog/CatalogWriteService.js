const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");

const definitions = {
  categories: {
    table: "categories",
    create: ["code", "name", "description", "is_active", "image_path", "catalog_kind"],
    edit: ["name", "description", "is_active", "image_path", "catalog_kind"],
    required: ["code", "name"],
  },
  warehouses: {
    table: "warehouses",
    create: ["code", "name", "address", "is_active"],
    edit: ["name", "address", "is_active"],
    required: ["code", "name"],
  },
  "warehouse-locations": {
    table: "warehouse_locations",
    create: ["warehouse_id", "code", "name", "is_active"],
    edit: ["name", "is_active"],
    required: ["warehouse_id", "code", "name"],
  },
  suppliers: {
    table: "suppliers",
    create: [
      "code",
      "name",
      "phone",
      "email",
      "address",
      "tax_code",
      "is_active",
    ],
    edit: ["name", "phone", "email", "address", "tax_code", "is_active"],
    required: ["code", "name"],
  },
  items: {
    table: "items",
    create: [
      "category_id",
      "unit_id",
      "code",
      "name",
      "kind",
      "description",
      "reference_price",
      "is_sample",
      "is_published",
      "is_active",
    ],
    edit: [
      "version",
      "name",
      "description",
      "reference_price",
      "is_sample",
      "is_published",
      "is_active",
    ],
    required: [
      "category_id",
      "unit_id",
      "code",
      "name",
      "kind",
      "reference_price",
    ],
  },
};
const isId = (v) => /^[1-9]\d*$/.test(String(v));
for(const action of ['create','edit'])definitions.items[action].push('material_quality_standard','default_shelf_life_days','image_path');
const optionalText = new Set([
  "description",
  "address",
  "phone",
  "email",
  "tax_code",
]);
const maxLength = {
  code: 40,
  name: 150,
  description: 5000,
  address: 500,
  phone: 20,
  email: 254,
  tax_code: 30,
};

class CatalogWriteService {
  constructor(pool, repository, resources = Object.keys(definitions)) {
    this.pool = pool;
    this.repository = repository;
    this.resources=new Set(resources);
  }

  definition(resource) {
    const definition = definitions[resource];
    C.fail(
      !definition || !this.resources.has(resource),
      "NOT_IMPLEMENTED",
      "Chức năng chưa được triển khai.",
      501,
    );
    return definition;
  }

  validate(resource, body, create) {
    const definition = this.definition(resource);
    C.fields(body, create ? definition.create : definition.edit);
    if (create)
      for (const field of definition.required)
        C.fail(
          body[field] === undefined ||
            body[field] === null ||
            body[field] === "",
          "VALIDATION_ERROR",
          `Thiếu ${field}.`,
        );
    else
      C.fail(
        !Object.keys(body).some((field) => field !== "version"),
        "VALIDATION_ERROR",
        "Không có nội dung cần sửa.",
      );
    const normalized = {};
    for (const [field, value] of Object.entries(body)) {
      if(field==='material_quality_standard'){C.text(value,field,1000,false);normalized[field]=value?.trim()||null;continue;}
      if(field==='default_shelf_life_days'){C.fail(value!==null&&(!Number.isInteger(value)||value<1||value>36500),'VALIDATION_ERROR','Hạn sử dụng mặc định phải là số ngày từ 1 đến 36500.');normalized[field]=value;continue;}
      if(field==='catalog_kind'){C.fail(!['MATERIAL','FINISHED_PRODUCT'].includes(value),'VALIDATION_ERROR','Chọn nhóm Thành phẩm hoặc Nguyên vật liệu.');normalized.LoaiDanhMuc=value;continue;}
      if(field==='image_path'){normalized[field]=require(resource==='items'?'../../config/item-images':'../../config/category-images').validatePath(value);continue;}
      if (field === "version") continue;
      if (["category_id", "unit_id", "warehouse_id"].includes(field)) {
        C.fail(
          !isId(value),
          "VALIDATION_ERROR",
          `Giá trị ${field} không hợp lệ.`,
        );
        normalized[field] = String(value);
      } else if (["is_active", "is_sample", "is_published"].includes(field)) {
        C.fail(
          typeof value !== "boolean",
          "VALIDATION_ERROR",
          `${field} phải là boolean.`,
        );
        normalized[field] = value ? 1 : 0;
      } else if (field === "reference_price") {
        normalized[field] = C.money(C.price(value));
      } else if (field === "kind") {
        C.fail(
          !["MATERIAL", "FINISHED_PRODUCT"].includes(value),
          "VALIDATION_ERROR",
          "Loại mặt hàng không hợp lệ.",
        );
        normalized[field] = value;
      } else {
        C.text(
          value,
          field,
          maxLength[field] || 5000,
          !optionalText.has(field),
        );
        if (
          field === "email" &&
          value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        )
          C.fail(true, "VALIDATION_ERROR", "Email không hợp lệ.");
        normalized[field] = value ? value.trim() : null;
      }
    }
    if (resource === "items") {
      const sample = normalized.is_sample;
      if (
        sample === 1 &&
        normalized.kind &&
        normalized.kind !== "FINISHED_PRODUCT"
      )
        C.fail(
          true,
          "VALIDATION_ERROR",
          "Chỉ thành phẩm được đánh dấu hàng mẫu.",
        );
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
      if (error.code === "ER_DUP_ENTRY")
        throw new C.DomainError(409, "DUPLICATE", "Mã hoặc tên đã tồn tại.");
      if (error.code === "ER_ROW_IS_REFERENCED_2")
        throw new C.DomainError(409, "IN_USE", "Dữ liệu đang được sử dụng.");
      throw error;
    } finally {
      connection.release();
    }
  }

  async references(connection, resource, values) {
    if(resource==='items'&&values.category_id){const [[category]]=await connection.execute('SELECT LoaiDanhMuc FROM categories WHERE id=?',[values.category_id]);C.fail(category?.LoaiDanhMuc&&category.LoaiDanhMuc!==values.kind,'VALIDATION_ERROR','Mặt hàng phải thuộc đúng nhóm của danh mục.');}
    const checks =
      resource === "items"
        ? [
            ["categories", values.category_id],
            ["units", values.unit_id],
          ]
        : resource === "warehouse-locations"
          ? [["warehouses", values.warehouse_id]]
          : [];
    for (const [table, id] of checks) {
      const [rows] = await connection.execute(
        `SELECT id FROM ${table} WHERE id=?${table === "units" ? "" : " AND is_active=1"}`,
        [id],
      );
      C.fail(
        !rows.length,
        "VALIDATION_ERROR",
        "Danh mục tham chiếu không tồn tại hoặc đã ngừng hoạt động.",
      );
    }
  }

  async create(user, resource, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    const values = this.validate(resource, body, true);
    const subtype={};for(const key of ['material_quality_standard','default_shelf_life_days'])if(Object.hasOwn(values,key)){subtype[key]=values[key];delete values[key];}
    if (resource === "items") {
      if (values.is_sample === undefined) values.is_sample = 0;
      if (values.is_published === undefined) values.is_published = 0;
      C.fail(
        values.is_published === 1 && values.is_sample !== 1,
        "VALIDATION_ERROR",
        "Chỉ công bố hàng mẫu.",
      );
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
      if(resource==='items')await this.saveSubtype(connection,result.insertId,values.kind,subtype);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,?,?,'CREATE',?,?)",
        [user.id, resource, result.insertId, JSON.stringify(values), requestId],
      );
      return result.insertId;
    });
    return this.repository.get(resource, id);
  }

  async update(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    const values = this.validate(resource, body, false);
    const subtype={};for(const key of ['material_quality_standard','default_shelf_life_days'])if(Object.hasOwn(values,key)){subtype[key]=values[key];delete values[key];}
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(
        `SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`,
        [id],
      );
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
      const current = rows[0];
      if(resource==='categories'&&values.LoaiDanhMuc){const [[mixed]]=await connection.execute('SELECT COUNT(*) AS total FROM items WHERE category_id=? AND is_active=1 AND kind<>?',[id,values.LoaiDanhMuc]);C.fail(Number(mixed.total)>0,'IN_USE','Danh mục đang chứa mặt hàng thuộc nhóm khác.',409);}
      if (resource === "items") {
        C.version(current, body.version);
        C.fail(
          values.is_sample === 1 && current.kind !== "FINISHED_PRODUCT",
          "VALIDATION_ERROR",
          "Chỉ thành phẩm được đánh dấu hàng mẫu.",
        );
        C.fail(
          values.is_published === 1 &&
            (values.is_sample ?? current.is_sample) === 0,
          "VALIDATION_ERROR",
          "Chỉ công bố hàng mẫu.",
        );
      }
      const columns = Object.keys(values);
      await connection.execute(
        `UPDATE ${definition.table} SET ${[...columns.map((key) => `${key}=?`),...(resource === 'items'?['version=version+1']:[])].join(',')} WHERE id=?`,
        [...Object.values(values), id],
      );
      if(resource==='items')await this.saveSubtype(connection,id,current.kind,subtype);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,?,?,'UPDATE',?,?,?)",
        [
          user.id,
          resource,
          id,
          JSON.stringify(current),
          JSON.stringify(values),
          requestId,
        ],
      );
    });
    return this.repository.get(resource, id);
  }

  async saveSubtype(connection,id,kind,values){
    C.fail(kind!=='MATERIAL'&&values.material_quality_standard!=null,'VALIDATION_ERROR','Chỉ nguyên vật liệu có tiêu chuẩn nhập.');
    C.fail(kind!=='FINISHED_PRODUCT'&&values.default_shelf_life_days!=null,'VALIDATION_ERROR','Chỉ thành phẩm có hạn sử dụng mặc định.');
    if(Object.hasOwn(values,'material_quality_standard')&&kind==='MATERIAL')await connection.execute('UPDATE NguyenVatLieu SET TieuChuanNhap=? WHERE MaMatHang=?',[values.material_quality_standard,id]);
    if(Object.hasOwn(values,'default_shelf_life_days')&&kind==='FINISHED_PRODUCT')await connection.execute('UPDATE ThanhPham SET HanSuDungMacDinhNgay=? WHERE MaMatHang=?',[values.default_shelf_life_days,id]);
  }

  async remove(user, resource, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    const definition = this.definition(resource);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    C.fields(body || {}, resource === "items" ? ["version"] : []);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(
        `SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`,
        [id],
      );
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
      if (resource === "items") C.version(rows[0], body.version);
      await connection.execute(`DELETE FROM ${definition.table} WHERE id=?`, [
        id,
      ]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,?,?,'DELETE',?,?)",
        [user.id, resource, id, JSON.stringify(rows[0]), requestId],
      );
    });
    return { id: String(id), deleted: true };
  }

}
module.exports = CatalogWriteService;
