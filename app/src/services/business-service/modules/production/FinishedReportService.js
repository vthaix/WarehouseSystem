const crypto = require("node:crypto");
const C = require("../../../domain/core");
const P = require("../../../domain/policy");
const paginate = require("../../../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

class FinishedReportService {
  constructor(pool) {
    this.pool = pool;
  }

  visible(user, row) {
    return (
      user.roles.includes("DIRECTOR") ||
      user.roles.includes("PLANNER") ||
      (user.roles.includes("WORKSHOP_OWNER") &&
        user.workshop_ids.includes(String(row.workshop_id)))
    );
  }

  present(user, row) {
    const result = { ...row };
    result.production_completed=row.production_completed==null?null:Boolean(row.production_completed);
    for (const field of [
      "id",
      "production_plan_id",
      "created_by",
      "workshop_id",
    ])
      if (result[field] != null) result[field] = String(result[field]);
    result.completed_date = asDate(result.completed_date);
    result.actions =
      user.roles.includes("WORKSHOP_OWNER") &&
      user.workshop_ids.includes(String(row.workshop_id)) &&
      row.status === "DRAFT"
        ? ["edit", "submit"]
        : [];
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["finished-reports"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [],
      params = [];
    if (!user.roles.includes("DIRECTOR") && !user.roles.includes("PLANNER")) {
      if (!user.workshop_ids.length) where.push("1=0");
      else {
        where.push(
          "p.workshop_id IN (" +
            user.workshop_ids.map(() => "?").join(",") +
            ")",
        );
        params.push(...user.workshop_ids);
      }
    }
    if (query.status) {
      C.fail(
        !["DRAFT", "SUBMITTED"].includes(query.status),
        "VALIDATION_ERROR",
        "Trạng thái không hợp lệ.",
      );
      where.push("r.status=?");
      params.push(query.status);
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("r.code LIKE ?");
      params.push(`%${query.q}%`);
    }
    C.fail(
      query.sort && query.sort !== "newest",
      "VALIDATION_ERROR",
      "Cách sắp xếp không hợp lệ.",
    );
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const base =
      " FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total" + base + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT r.*,p.workshop_id,p.code AS production_plan_code" +
        base +
        filter +
        " ORDER BY r.id DESC LIMIT ? OFFSET ?",
      [...params, String(per_page), String(offset)],
    );
    return {
      data: rows.map((row) => this.present(user, row)),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["finished-reports"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
    const [rows] = await connection.execute(
      "SELECT r.*,p.workshop_id,p.code AS production_plan_code FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=?",
      [id],
    );
    C.fail(
      !rows.length || !this.visible(user, rows[0]),
      "NOT_FOUND",
      "Không tìm thấy báo cáo.",
      404,
    );
    const [outputs] = await connection.execute(
      "SELECT o.*,l.item_id,l.code AS lot_code,l.manufactured_date,l.expiry_date,l.qc_status,i.name AS item_name FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id JOIN items i ON i.id=l.item_id WHERE o.finished_report_id=? ORDER BY o.id",
      [id],
    );
    const [materials] = await connection.execute(
      "SELECT m.*,i.name AS item_name FROM finished_report_materials m JOIN items i ON i.id=m.item_id WHERE m.finished_report_id=? ORDER BY m.id",
      [id],
    );
    return {
      ...this.present(user, rows[0]),
      outputs: outputs.map((row) => ({
        ...row,
        id: String(row.id),
        lot_id: String(row.lot_id),
        item_id: String(row.item_id),
        manufactured_date: asDate(row.manufactured_date),
        expiry_date: asDate(row.expiry_date),
      })),
      materials: materials.map((row) => ({
        ...row,
        id: String(row.id),
        item_id: String(row.item_id),
      })),
    };
  }

  async validate(connection, plan, outputs, materials, excludedId = null) {
    const [partialLots]=await connection.execute("SELECT l.* FROM lots l JOIN stock_requests r ON r.id=l.production_receipt_request_id WHERE l.production_plan_id=? AND (r.status<>'CANCELLED' OR EXISTS(SELECT 1 FROM stock_documents d WHERE d.stock_request_id=r.id)) FOR UPDATE",[plan.id]);
    const partialByCode=new Map(partialLots.map(l=>[l.code,l]));
    C.fail(
      !Array.isArray(outputs) || !outputs.length || outputs.length > 100,
      "VALIDATION_ERROR",
      "Báo cáo cần 1 đến 100 lô thành phẩm.",
    );
    C.fail(
      !Array.isArray(materials) || materials.length > 100,
      "VALIDATION_ERROR",
      "Danh sách nguyên liệu không hợp lệ.",
    );
    const codes = new Set(),
      materialsSeen = new Set();
    for (const output of outputs) {
      C.fields(output, [
        "item_id",
        "lot_code",
        "quantity",
        "manufactured_date",
        "expiry_date",
      ]);
      C.fail(
        !isId(output.item_id),
        "VALIDATION_ERROR",
        "Thành phẩm không hợp lệ.",
      );
      C.text(output.lot_code, "lot_code", 50);
      C.fail(
        codes.has(output.lot_code),
        "VALIDATION_ERROR",
        "Mã lô trùng trong báo cáo.",
      );
      codes.add(output.lot_code);
      C.qty(output.quantity);
      const partial=partialByCode.get(output.lot_code);
      if(partial)C.fail(String(partial.item_id)!==String(output.item_id)||C.qty(String(partial.received_quantity))!==C.qty(output.quantity)||asDate(partial.manufactured_date)!==output.manufactured_date||(asDate(partial.expiry_date)||null)!==(output.expiry_date||null),'IMMUTABLE_LOT','Dòng lô nhập từng phần phải giữ nguyên mặt hàng, số lượng và ngày.',409);
      C.date(output.manufactured_date, "manufactured_date");
      if (output.expiry_date) C.date(output.expiry_date, "expiry_date");
      C.fail(
        output.expiry_date && output.expiry_date < output.manufactured_date,
        "VALIDATION_ERROR",
        "Hạn sử dụng trước ngày sản xuất.",
      );
    }
    for (const line of materials) {
      // Material usage remains checked against actual warehouse issues below.
      C.fields(line, ["item_id", "used_quantity"]);
      C.fail(
        !isId(line.item_id) || materialsSeen.has(String(line.item_id)),
        "VALIDATION_ERROR",
        "Nguyên liệu trùng hoặc không hợp lệ.",
      );
      materialsSeen.add(String(line.item_id));
      C.qty(line.used_quantity);
    }
    const [plannedOutputs] = await connection.execute(
      "SELECT item_id,quantity FROM production_plan_outputs WHERE production_plan_id=?",
      [plan.id],
    );
    C.fail(partialLots.some(l=>!codes.has(l.code)),'PARTIAL_LOTS_REQUIRED','Báo cáo tổng kết phải bao gồm mọi dòng lô đã ghi nhận của các đợt nhập.',409);
    const remaining = new Map(
      plannedOutputs.map((line) => [
        String(line.item_id),
        C.qty(String(line.quantity)),
      ]),
    );
    const [already] = await connection.execute(
      "SELECT l.item_id,o.quantity FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id JOIN finished_reports r ON r.id=o.finished_report_id WHERE r.production_plan_id=?" +
        (excludedId ? " AND r.id<>?" : ""),
      excludedId ? [plan.id, excludedId] : [plan.id],
    );
    for (const line of [...already, ...outputs]) {
      const key = String(line.item_id);
      const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
      C.fail(!remaining.has(key),'VALIDATION_ERROR','Thành phẩm không thuộc kế hoạch.');
      remaining.set(key, rest);
    }
    const [plannedMaterials] = await connection.execute(
      "SELECT item_id,required_quantity FROM production_plan_materials WHERE production_plan_id=? UNION SELECT d.item_id,d.required_quantity FROM production_report_lines d JOIN production_reports r ON r.id=d.production_report_id WHERE r.production_plan_id=? AND r.status='SUBMITTED'",
      [plan.id, plan.id],
    );
    const allowed = new Map(
      plannedMaterials.map((line) => [
        String(line.item_id),
        C.qty(String(line.required_quantity)),
      ]),
    );
    for (const line of materials)
      C.fail(
        !allowed.has(String(line.item_id)),
        "VALIDATION_ERROR",
        "Nguyên liệu chưa có trong kế hoạch.",
      );
    const [issued] = await connection.execute(
      "SELECT l.item_id,SUM(d.quantity) AS quantity FROM stock_document_lines d JOIN lots l ON l.id=d.lot_id JOIN stock_documents doc ON doc.id=d.stock_document_id JOIN stock_requests r ON r.id=doc.stock_request_id WHERE r.production_plan_id=? AND r.purpose='PRODUCTION_ISSUE' AND doc.type='OUT' GROUP BY l.item_id",
      [plan.id],
    );
    const available = new Map(
      issued.map((r) => [String(r.item_id), C.qty(String(r.quantity), false)]),
    );
    const [used] = await connection.execute(
      "SELECT m.item_id,m.used_quantity FROM finished_report_materials m JOIN finished_reports r ON r.id=m.finished_report_id WHERE r.production_plan_id=?" +
        (excludedId ? " AND r.id<>?" : ""),
      excludedId ? [plan.id, excludedId] : [plan.id],
    );
    for (const line of [...used, ...materials]) {
      const key = String(line.item_id),
        rest = (available.get(key) || 0n) - C.qty(String(line.used_quantity));
      C.fail(
        rest < 0n,
        "SOURCE_LIMIT_EXCEEDED",
        "Tiêu hao vượt lượng NVL thực tế đã cấp cho kế hoạch.",
      );
      available.set(key, rest);
    }
    return {
      outputs: outputs.map((line) => ({
        item_id: String(line.item_id),
        lot_code: line.lot_code.trim(),
        quantity: C.decimal(C.qty(line.quantity)),
        manufactured_date: line.manufactured_date,
        expiry_date: line.expiry_date || null,
        existing_lot_id: partialByCode.get(line.lot_code)?.id || null,
      })),
      materials: materials.map((line) => ({
        item_id: String(line.item_id),
        used_quantity: C.decimal(C.qty(line.used_quantity)),
      })),
    };
  }

  async saveLines(connection, reportId, planId, data) {
    for (const output of data.outputs) {
      let lot={insertId:output.existing_lot_id};
      if(!output.existing_lot_id) [lot] = await connection.execute(
        "INSERT INTO lots (code,item_id,purchase_order_line_id,production_plan_id,manufactured_date,expiry_date,received_quantity,qc_status,version) VALUES (?,?,NULL,?,?,?,?,'PENDING',1)",
        [
          output.lot_code,
          output.item_id,
          planId,
          output.manufactured_date,
          output.expiry_date,
          output.quantity,
        ],
      );
      await connection.execute(
        "INSERT INTO report_details (production_report_id,item_id,detail_kind,quantity) VALUES (?,?,'THANH_PHAM',?) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity)",
        [reportId, output.item_id, output.quantity],
      );
      const [[detail]] = await connection.execute(
        "SELECT id FROM report_details WHERE production_report_id=? AND item_id=?",
        [reportId, output.item_id],
      );
      await connection.execute(
        "INSERT INTO finished_report_outputs (finished_report_id,lot_id,quantity,report_detail_id) VALUES (?,?,?,?)",
        [reportId, lot.insertId, output.quantity, detail.id],
      );
    }
    for (const material of data.materials)
      await connection.execute(
        "INSERT INTO finished_report_materials (finished_report_id,item_id,used_quantity,detail_kind) VALUES (?,?,?,'NVL_SU_DUNG')",
        [reportId, material.item_id, material.used_quantity],
      );
  }

  async create(user, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, [
      "production_plan_id",
      "completed_date",
      "production_completed",
      "note",
      "outputs",
      "materials",
    ]);
    C.fail(
      !isId(body.production_plan_id),
      "VALIDATION_ERROR",
      "Kế hoạch sản xuất không hợp lệ.",
    );
    C.date(body.completed_date, "completed_date");
    C.fail(body.production_completed!==true,'VALIDATION_ERROR','Chỉ lập báo cáo thành phẩm khi đã hoàn tất toàn bộ sản xuất.');
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [plans] = await connection.execute(
        "SELECT * FROM production_plans WHERE id=? FOR UPDATE",
        [body.production_plan_id],
      );
      C.fail(
        !plans.length ||
          !user.workshop_ids.includes(String(plans[0].workshop_id)),
        "NOT_FOUND",
        "Không tìm thấy kế hoạch thuộc xưởng.",
        404,
      );
      C.state(plans[0], ["APPROVED", "IN_PROGRESS"]);
      const data = await this.validate(
        connection,
        plans[0],
        body.outputs,
        body.materials || [],
      );
      const code =
        "BCTP-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [existingFinal]=await connection.execute('SELECT id FROM finished_reports WHERE production_plan_id=? FOR UPDATE',[plans[0].id]);
      C.fail(existingFinal.length,'IN_USE','Kế hoạch đã có báo cáo thành phẩm tổng kết; hãy hoàn thiện báo cáo hiện có.',409);
      const [created] = await connection.execute(
        "INSERT INTO finished_reports (code,production_plan_id,created_by,completed_date,note,status,version,report_kind,production_completed) VALUES (?,?,?,?,?,'DRAFT',1,'THANH_PHAM',1)",
        [
          code,
          body.production_plan_id,
          user.id,
          body.completed_date,
          body.note || null,
        ],
      );
      id = created.insertId;
      await this.saveLines(connection, id, plans[0].id, data);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'finished-reports',?,'CREATE',?,?)",
        [
          user.id,
          id,
          JSON.stringify({ code, production_plan_id: body.production_plan_id }),
          requestId,
        ],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY")
        throw new C.DomainError(
          409,
          "DUPLICATE",
          "Mã lô hoặc báo cáo đã tồn tại.",
        );
      throw error;
    } finally {
      connection.release();
    }
    return this.get(user, id);
  }

  async update(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, [
      "version",
      "completed_date",
      "production_completed",
      "note",
      "outputs",
      "materials",
    ]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản báo cáo.",
    );
    C.fail(
      !["completed_date", "note", "outputs", "materials", "production_completed"].some((key) =>
        Object.hasOwn(body, key),
      ),
      "VALIDATION_ERROR",
      "Không có nội dung cần sửa.",
    );
    if (body.completed_date !== undefined)
      C.date(body.completed_date, "completed_date");
    C.fail(body.production_completed!==undefined&&body.production_completed!==true,'VALIDATION_ERROR','Báo cáo thành phẩm phải xác nhận hoàn tất sản xuất.');
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [source] = await connection.execute(
        "SELECT production_plan_id FROM finished_reports WHERE id=?",
        [id],
      );
      C.fail(!source.length, "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
      const [plans] = await connection.execute(
        "SELECT * FROM production_plans WHERE id=? FOR UPDATE",
        [source[0].production_plan_id],
      );
      C.fail(
        !plans.length ||
          !user.workshop_ids.includes(String(plans[0].workshop_id)),
        "NOT_FOUND",
        "Không tìm thấy báo cáo.",
        404,
      );
      const [rows] = await connection.execute(
        "SELECT * FROM finished_reports WHERE id=? FOR UPDATE",
        [id],
      );
      const report = rows[0];
      C.version(report, body.version);
      C.state(report, ["DRAFT"]);
      if(body.production_completed===true)await connection.execute('UPDATE finished_reports SET production_completed=1 WHERE id=?',[id]);
      if (body.outputs !== undefined || body.materials !== undefined) {
        const current = await this.get(user, id, connection);
        const outputs =
          body.outputs ||
          current.outputs.map((line) => ({
            item_id: line.item_id,
            lot_code: line.lot_code,
            quantity: String(line.quantity),
            manufactured_date: asDate(line.manufactured_date),
            expiry_date: asDate(line.expiry_date),
          }));
        const materials =
          body.materials ||
          current.materials.map((line) => ({
            item_id: line.item_id,
            used_quantity: String(line.used_quantity),
          }));
        const data = await this.validate(
          connection,
          plans[0],
          outputs,
          materials,
          id,
        );
        const [lots] = await connection.execute(
          "SELECT l.id,l.qc_status,l.production_receipt_request_id FROM lots l JOIN finished_report_outputs o ON o.lot_id=l.id WHERE o.finished_report_id=? FOR UPDATE",
          [id],
        );
        C.fail(
          lots.some((lot) => lot.qc_status !== "PENDING" && !lot.production_receipt_request_id),
          "INVALID_STATE",
          "Lô đã có kết quả QC.",
          409,
        );
        await connection.execute(
          "DELETE FROM finished_report_outputs WHERE finished_report_id=?",
          [id],
        );
        await connection.execute(
          "DELETE FROM finished_report_materials WHERE finished_report_id=?",
          [id],
        );
        await connection.execute(
          "DELETE FROM report_details WHERE production_report_id=?",
          [id],
        );
        for (const lot of lots.filter(l=>!l.production_receipt_request_id))
          await connection.execute("DELETE FROM lots WHERE id=?", [lot.id]);
        await this.saveLines(connection, id, plans[0].id, data);
      }
      await connection.execute(
        "UPDATE finished_reports SET completed_date=?,note=?,version=version+1 WHERE id=?",
        [
          body.completed_date || asDate(report.completed_date),
          body.note === undefined ? report.note : body.note || null,
          id,
        ],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'finished-reports',?,'UPDATE',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ version: report.version }),
          JSON.stringify(body),
          requestId,
        ],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_ROW_IS_REFERENCED_2")
        throw new C.DomainError(409, "IN_USE", "Lô đã được sử dụng.");
      if (error.code === "ER_DUP_ENTRY")
        throw new C.DomainError(409, "DUPLICATE", "Mã lô đã tồn tại.");
      throw error;
    } finally {
      connection.release();
    }
    return this.get(user, id);
  }

  async submit(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version"]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản báo cáo.",
    );
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT r.*,p.workshop_id FROM finished_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=? FOR UPDATE",
        [id],
      );
      C.fail(
        !rows.length ||
          !user.workshop_ids.includes(String(rows[0].workshop_id)),
        "NOT_FOUND",
        "Không tìm thấy báo cáo.",
        404,
      );
      const report = rows[0];
      C.version(report, body.version);
      C.state(report, ["DRAFT"]);
      C.fail(!report.production_completed,'INVALID_STATE','Cần xác nhận đã hoàn tất toàn bộ sản xuất trước khi gửi.',409);
      const [[count]] = await connection.execute(
        "SELECT COUNT(*) AS total FROM finished_report_outputs WHERE finished_report_id=?",
        [id],
      );
      C.fail(
        !Number(count.total),
        "INVALID_STATE",
        "Báo cáo chưa có lô thành phẩm.",
        409,
      );
      await connection.execute(
        "UPDATE finished_reports SET status='SUBMITTED',submitted_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
        [id],
      );
      await connection.execute(
        "UPDATE production_plans SET status='COMPLETED',version=version+1 WHERE id=? AND status IN ('APPROVED','IN_PROGRESS')",
        [report.production_plan_id],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'finished-reports',?,'SUBMIT',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ status: "DRAFT" }),
          JSON.stringify({ status: "SUBMITTED" }),
          requestId,
        ],
      );
      await connection.execute(
        "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?, 'finished-reports',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='DIRECTOR' ON DUPLICATE KEY UPDATE id=notifications.id",
        [
          `Báo cáo thành phẩm ${report.code} đã gửi`,
          `Báo cáo thành phẩm ${report.code} đã gửi`,
          id,
          `finished-${id}-submitted`,
        ],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(user, id);
  }
}

module.exports = FinishedReportService;
