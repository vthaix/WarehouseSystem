const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const isId = (v) => /^[1-9]\d*$/.test(String(v));
class LotService {
  constructor(pool, repository) {
    this.pool = pool;
    this.repository = repository;
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

  async createLot(user, body, requestId, connectionOverride = null) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    body={...body,code:connectionOverride?body.code:'AUTO'};
    if (body.lines !== undefined) {
      C.fields(body, ["code", "lines"]);
      C.text(body.code, "code", 50);
      C.fail(
        !Array.isArray(body.lines) ||
          !body.lines.length ||
          body.lines.length > 100,
        "VALIDATION_ERROR",
        "Lô cần từ 1 đến 100 dòng.",
      );
      const id = await this.transaction(async (connection) => {
        const [[first]]=await connection.execute('SELECT COALESCE(l.supplier_id,p.supplier_id) AS supplier_id FROM purchase_order_lines l JOIN purchase_orders p ON p.id=l.purchase_order_id WHERE l.id=?',[body.lines[0].purchase_order_line_id]);
        C.fail(!first,'NOT_FOUND','Không tìm thấy đơn mua.');
        body.code=await require('../../shared/readable-codes').next(connection,'lot_headers','LO-NVL',await require('../../shared/readable-codes').supplier(connection,first.supplier_id));
        const [created] = await connection.execute(
          "INSERT INTO lot_headers (code,lot_kind) VALUES (?,'NGUYEN_VAT_LIEU')",
          [body.code.trim()],
        );
        let supplier = null;
        for (const [index, line] of body.lines.entries()) {
          C.fields(line, [
            "purchase_order_line_id",
            "received_quantity",
            "manufactured_date",
            "expiry_date",
          ]);
          const [[source]] = await connection.execute(
            "SELECT COALESCE(l.supplier_id,p.supplier_id) AS supplier_id FROM purchase_order_lines l JOIN purchase_orders p ON p.id=l.purchase_order_id WHERE l.id=? FOR UPDATE",
            [line.purchase_order_line_id],
          );
          C.fail(
            !source ||
              (supplier && String(supplier) !== String(source.supplier_id)),
            "VALIDATION_ERROR",
            "Các dòng lô phải cùng nhà cung cấp.",
          );
          supplier = source.supplier_id;
          await this.createLot(
            user,
            {
              ...line,
              code: body.code.slice(0, 40) + "-" + (index + 1),
              lot_header_id: String(created.insertId),
            },
            requestId,
            connection,
          );
        }
        return created.insertId;
      });
      const [lines] = await this.pool.execute(
        "SELECT * FROM lots WHERE lot_header_id=? ORDER BY id",
        [id],
      );
      return {
        id: String(id),
        code: body.code,
        lot_header_id: String(id),
        lines: lines.map((row) => ({
          ...row,
          id: String(row.id),
          lot_header_id: String(row.lot_header_id),
        })),
      };
    }
    C.fields(body, [
      "code",
      "item_id",
      "purchase_order_id",
      "purchase_order_line_id",
      "received_quantity",
      "manufactured_date",
      "expiry_date",
      ...(connectionOverride ? ["lot_header_id"] : []),
    ]);
    C.text(body.code, "code", 50);
    C.fail(
      !isId(body.purchase_order_line_id),
      "VALIDATION_ERROR",
      "Dòng đơn mua không hợp lệ.",
    );
    if (body.item_id !== undefined)
      C.fail(!isId(body.item_id), "VALIDATION_ERROR", "Mặt hàng không hợp lệ.");
    if (body.purchase_order_id !== undefined)
      C.fail(
        !isId(body.purchase_order_id),
        "VALIDATION_ERROR",
        "Đơn mua không hợp lệ.",
      );
    C.qty(body.received_quantity);
    if (body.manufactured_date)
      require('../../shared/time-rules').actualDate(body.manufactured_date, "manufactured_date");
    if (body.expiry_date) C.date(body.expiry_date, "expiry_date", true);
    C.fail(
      body.expiry_date &&
        body.manufactured_date &&
        body.expiry_date < body.manufactured_date,
      "VALIDATION_ERROR",
      "Hạn sử dụng trước ngày sản xuất.",
    );
    const run = connectionOverride
      ? async (work) => work(connectionOverride)
      : this.transaction.bind(this);
    const id = await run(async (connection) => {
      const [lines] = await connection.execute(
        "SELECT l.*,p.status AS purchase_status,COALESCE(l.supplier_id,p.supplier_id) AS receiving_supplier_id,i.kind AS item_kind,i.name AS item_name FROM purchase_order_lines l JOIN purchase_orders p ON p.id=l.purchase_order_id JOIN items i ON i.id=l.item_id WHERE l.id=? FOR UPDATE",
        [body.purchase_order_line_id],
      );
      C.fail(!lines.length, "NOT_FOUND", "Không tìm thấy dòng đơn mua.", 404);
      const line = lines[0];
      const [[materialTerms]]=await connection.execute('SELECT BangGiaNCC FROM NguyenVatLieu WHERE MaMatHang=?',[line.item_id]);
      const terms=require('../../shared/supplier-terms'),offer=terms.parse(materialTerms?.BangGiaNCC).find(o=>String(o.supplier_id)===String(line.receiving_supplier_id)),life=line.SoNgayHanDung??offer?.shelf_life_days;
      if(life){body.manufactured_date=body.manufactured_date||C.today();body.expiry_date=terms.expiry(body.manufactured_date,life);C.fail(body.expiry_date<C.today(),'LOT_EXPIRED','Lô đã hết hạn theo thông tin NVL/NCC.');}
      C.fail(
        body.purchase_order_id &&
          String(body.purchase_order_id) !== String(line.purchase_order_id),
        "VALIDATION_ERROR",
        "Dòng không thuộc đơn mua.",
      );
      C.fail(
        body.item_id && String(body.item_id) !== String(line.item_id),
        "VALIDATION_ERROR",
        "Mặt hàng không khớp dòng đơn mua.",
      );
      C.fail(
        line.item_kind !== "MATERIAL" ||
          !["PENDING", "PARTIALLY_RECEIVED"].includes(line.purchase_status),
        "INVALID_STATE",
        "Đơn mua không thể nhận lô nguyên liệu.",
        409,
      );
      const [[used]] = await connection.execute(
        "SELECT COALESCE(SUM(received_quantity),0) AS quantity FROM lots WHERE purchase_order_line_id=?",
        [line.id],
      );
      const [[checked]]=await connection.execute('SELECT COALESCE(SUM(IF(MaLo IS NULL,ThucNhan,SoLoi)),0) AS quantity FROM ThucKiemKeHoachMua WHERE MaDongDonMua=?',[line.id]);
      C.fail(
        C.qty(String(used.quantity), false) + C.qty(String(checked.quantity),false) + C.qty(body.received_quantity) >
          C.qty(String(line.quantity)),
        "SOURCE_LIMIT_EXCEEDED",
        line.item_name+': đơn mua '+C.decimal(C.qty(String(line.quantity)))+', đã ghi nhận '+C.decimal(C.qty(String(used.quantity),false)+C.qty(String(checked.quantity),false))+'. Không tạo thêm lô cho lượng đã ghi nhận. Tải lại lượng còn được nhận trước khi lưu.',
      );
      const readable=require('../../shared/readable-codes'),supplierName=await readable.supplier(connection,line.receiving_supplier_id);
      body.code=await readable.next(connection,'lots','NVL',supplierName+'-'+line.item_name);
      if(!connectionOverride){const [h]=await connection.execute("INSERT INTO lot_headers(code,lot_kind) VALUES (?,'NGUYEN_VAT_LIEU')",[await readable.next(connection,'lot_headers','LO-NVL',supplierName)]);body.lot_header_id=h.insertId;}
      const [created] = await connection.execute(
        "INSERT INTO lots (code,item_id,purchase_order_line_id,production_plan_id,manufactured_date,expiry_date,received_quantity,qc_status,version,lot_header_id) VALUES (?,?,?,NULL,?,?,?,'PENDING',1,?)",
        [
          body.code.trim(),
          line.item_id,
          line.id,
          body.manufactured_date || null,
          body.expiry_date || null,
          body.received_quantity,
          body.lot_header_id || null,
        ],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'lots',?,'CREATE',?,?)",
        [user.id, created.insertId, JSON.stringify(body), requestId],
      );
      return created.insertId;
    });
    if (connectionOverride) return { id: String(id) };
    return this.repository.get("lots", id);
  }

  async updateLot(user, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lô.", 404);
    C.fields(body, ["version", "manufactured_date", "expiry_date"]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản lô.",
    );
    C.fail(
      body.manufactured_date === undefined && body.expiry_date === undefined,
      "VALIDATION_ERROR",
      "Không có nội dung cần sửa.",
    );
    if (body.manufactured_date)
      require('../../shared/time-rules').actualDate(body.manufactured_date, "manufactured_date");
    if (body.expiry_date) C.date(body.expiry_date, "expiry_date", true);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(
        "SELECT * FROM lots WHERE id=? FOR UPDATE",
        [id],
      );
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lô.", 404);
      const lot = rows[0];
      C.version(lot, body.version);
      C.fail(
        lot.qc_status !== "PENDING",
        "INVALID_STATE",
        "Lô đã có kết quả QC.",
        409,
      );
      const date = body.manufactured_date ?? lot.manufactured_date;
      const expiry = body.expiry_date ?? lot.expiry_date;
      C.fail(
        date &&
          expiry &&
          String(expiry).slice(0, 10) < String(date).slice(0, 10),
        "VALIDATION_ERROR",
        "Hạn sử dụng trước ngày sản xuất.",
      );
      await connection.execute(
        "UPDATE lots SET manufactured_date=?,expiry_date=?,version=version+1 WHERE id=?",
        [date || null, expiry || null, id],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'lots',?,'UPDATE',?,?,?)",
        [user.id, id, JSON.stringify(lot), JSON.stringify(body), requestId],
      );
    });
    return this.repository.get("lots", id);
  }

  async removeLot(user, id, body, requestId) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lô.", 404);
    C.fields(body || {}, ["version"]);
    await this.transaction(async (connection) => {
      const [rows] = await connection.execute(
        "SELECT * FROM lots WHERE id=? FOR UPDATE",
        [id],
      );
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lô.", 404);
      C.version(rows[0], body.version);
      C.fail(
        rows[0].qc_status !== "PENDING",
        "INVALID_STATE",
        "Lô đã qua QC.",
        409,
      );
      await connection.execute("DELETE FROM lots WHERE id=?", [id]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,request_id) VALUES (?,'lots',?,'DELETE',?,?)",
        [user.id, id, JSON.stringify(rows[0]), requestId],
      );
    });
    return { id: String(id), deleted: true };
  }
}
module.exports = LotService;
