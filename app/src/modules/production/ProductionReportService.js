const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");
const recordCode = require("../../shared/record-code");

const isId = (v) => /^[1-9]\d*$/.test(String(v));
class ProductionReportService {
  constructor(pool) {
    this.pool = pool;
  }

  visible(user, row) {
    return (
      (user.roles.includes("PLANNER") && Boolean(row.send_to_planner)) ||
      user.roles.includes("DIRECTOR") ||
      (user.roles.includes("WORKSHOP_OWNER") &&
        user.workshop_ids.includes(String(row.workshop_id)))
    );
  }

  present(user, row) {
    const result = { ...row };
    if (row.report_sequence != null) result.display_code = recordCode.displayCode(row.code, recordCode.code('BCSX', row.customer_name, Number(row.report_sequence)));
    if (row.order_sequence != null) result.production_plan_display_code = recordCode.displayCode(row.production_plan_code,recordCode.code('KHSX', row.customer_name, Number(row.order_sequence)) + (Number(row.plan_sequence) > 1 ? `-${String(row.plan_sequence).padStart(2, '0')}` : ''));
    result.send_to_planner = Boolean(row.send_to_planner);
    for (const field of [
      "id",
      "production_plan_id",
      "created_by",
      "workshop_id",
    ])
      if (result[field] != null) result[field] = String(result[field]);
    result.actions =
      user.roles.includes("WORKSHOP_OWNER") &&
      user.workshop_ids.includes(String(row.workshop_id)) &&
      row.status === "DRAFT"
        ? ["edit", "submit"]
        : [];
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["production-reports"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [],
      params = [];
    if (
      user.roles.includes("PLANNER") &&
      !user.roles.includes("DIRECTOR") &&
      !user.roles.includes("WORKSHOP_OWNER")
    )
      where.push("r.send_to_planner=1");
    if (!user.roles.includes("PLANNER") && !user.roles.includes("DIRECTOR")) {
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
      " FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total" + base + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT r.*,p.workshop_id,p.code AS production_plan_code,c.name AS customer_name,(SELECT COUNT(*) FROM customer_orders prior WHERE prior.customer_id=o.customer_id AND prior.id<=o.id) AS order_sequence,(SELECT COUNT(*) FROM production_plans prior WHERE prior.customer_order_id=p.customer_order_id AND prior.id<=p.id) AS plan_sequence,(SELECT COUNT(*) FROM production_reports prior JOIN production_plans pp ON pp.id=prior.production_plan_id JOIN customer_orders oo ON oo.id=pp.customer_order_id WHERE oo.customer_id=o.customer_id AND prior.id<=r.id) AS report_sequence,w.name AS workshop_name,u.full_name AS created_by_name" +
        base +
        " JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id JOIN workshops w ON w.id=p.workshop_id JOIN users u ON u.id=r.created_by" +
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
    P.role(user, P.read["production-reports"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy báo cáo.", 404);
    const [rows] = await connection.execute(
      "SELECT r.*,p.workshop_id,p.code AS production_plan_code,c.name AS customer_name,(SELECT COUNT(*) FROM customer_orders prior WHERE prior.customer_id=o.customer_id AND prior.id<=o.id) AS order_sequence,(SELECT COUNT(*) FROM production_plans prior WHERE prior.customer_order_id=p.customer_order_id AND prior.id<=p.id) AS plan_sequence,(SELECT COUNT(*) FROM production_reports prior JOIN production_plans pp ON pp.id=prior.production_plan_id JOIN customer_orders oo ON oo.id=pp.customer_order_id WHERE oo.customer_id=o.customer_id AND prior.id<=r.id) AS report_sequence,w.name AS workshop_name,u.full_name AS created_by_name FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id JOIN workshops w ON w.id=p.workshop_id JOIN users u ON u.id=r.created_by WHERE r.id=?",
      [id],
    );
    C.fail(
      !rows.length || !this.visible(user, rows[0]),
      "NOT_FOUND",
      "Không tìm thấy báo cáo.",
      404,
    );
    const [lines] = await connection.execute(
      "SELECT l.*,i.name AS item_name,i.code AS item_code,u.name AS unit_name FROM production_report_lines l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id WHERE l.production_report_id=? ORDER BY l.id",
      [id],
    );
    return {
      ...this.present(user, rows[0]),
      lines: lines.map((line) => ({
        ...line,
        id: String(line.id),
        item_id: String(line.item_id),
        production_report_id: String(line.production_report_id),
        shortage_quantity: C.decimal(
          C.qty(String(line.required_quantity)) >
            C.qty(String(line.available_quantity), false)
            ? C.qty(String(line.required_quantity)) -
                C.qty(String(line.available_quantity), false)
            : 0n,
        ),
      })),
    };
  }

  async validateLines(connection, lines) {
    C.fail(
      !Array.isArray(lines) || !lines.length || lines.length > 100,
      "VALIDATION_ERROR",
      "Báo cáo cần 1 đến 100 dòng nguyên liệu.",
    );
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", "available_quantity", "required_quantity"]);
      C.fail(
        !isId(line.item_id) || seen.has(String(line.item_id)),
        "VALIDATION_ERROR",
        "Nguyên liệu trùng hoặc không hợp lệ.",
      );
      seen.add(String(line.item_id));
      if (line.available_quantity !== undefined)
        C.qty(line.available_quantity, false);
      C.qty(line.required_quantity);
    }
    const [items] = await connection.execute(
      "SELECT id,kind,is_active FROM items WHERE id IN (" +
        [...seen].map(() => "?").join(",") +
        ") FOR SHARE",
      [...seen],
    );
    const byId = new Map(items.map((item) => [String(item.id), item]));
    const available = await require("../../shared/available-stock")(
      connection,
      [...seen],
    );
    return lines.map((line) => {
      const item = byId.get(String(line.item_id));
      C.fail(
        !item || item.kind !== "MATERIAL" || !item.is_active,
        "VALIDATION_ERROR",
        "Chỉ chọn nguyên liệu đang hoạt động.",
      );
      return {
        item_id: String(line.item_id),
        available_quantity: C.decimal(
          available.get(String(line.item_id)) || 0n,
        ),
        required_quantity: C.decimal(C.qty(line.required_quantity)),
      };
    });
  }

  async create(user, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, [
      "production_plan_id",
      "note",
      "lines",
      "report_purpose",
      "progress_percentage",
      "send_to_planner",
    ]);
    const purpose =
      body.report_purpose || (body.lines?.length ? "NHU_CAU" : "TIEN_DO");
    const shared = body.send_to_planner ?? purpose === "NHU_CAU";
    this.validateMetadata(purpose, body.note, body.progress_percentage, shared);
    C.fail(
      !isId(body.production_plan_id),
      "VALIDATION_ERROR",
      "Kế hoạch sản xuất không hợp lệ.",
    );
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
      require("../../config/production-report-images").validate(
        user,
        body.note,
      );
      const [existing] = await connection.execute(
        "SELECT id FROM production_reports WHERE production_plan_id=? AND report_purpose='NHU_CAU' LIMIT 1",
        [body.production_plan_id],
      );
      C.fail(
        purpose === "NHU_CAU" && existing.length,
        "IN_USE",
        "Kế hoạch đã có báo cáo nhu cầu; hãy hoàn thiện báo cáo hiện có.",
        409,
      );
      const lines =
        purpose === "NHU_CAU"
          ? await this.validateLines(connection, body.lines)
          : [];
      C.fail(
        purpose !== "NHU_CAU" && body.lines?.length,
        "VALIDATION_ERROR",
        "Báo cáo tiến độ/sự cố không có dòng nhu cầu nguyên vật liệu.",
      );
      const [[customer]] = await connection.execute("SELECT c.id,c.name FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id JOIN customers c ON c.id=o.customer_id WHERE p.id=? FOR UPDATE", [body.production_plan_id]);
      const [[sequence]] = await connection.execute("SELECT COUNT(*) AS total FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id JOIN customer_orders o ON o.id=p.customer_order_id WHERE o.customer_id=?", [customer.id]);
      const code = await recordCode.distinguishNames(connection, 'production_reports', recordCode.code("BCSX", customer.name, Number(sequence.total) + 1), customer.id);
      const [created] = await connection.execute(
        "INSERT INTO production_reports (code,production_plan_id,created_by,note,status,version,report_purpose,progress_percentage,send_to_planner) VALUES (?,?,?,?,'DRAFT',1,?,?,?)",
        [
          code,
          body.production_plan_id,
          user.id,
          body.note || null,
          purpose,
          body.progress_percentage ?? null,
          shared,
        ],
      );
      id = created.insertId;
      for (const line of lines)
        await connection.execute(
          "INSERT INTO production_report_lines (production_report_id,item_id,available_quantity,required_quantity) VALUES (?,?,?,?)",
          [id, line.item_id, line.available_quantity, line.required_quantity],
        );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'production-reports',?,'CREATE',?,?)",
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
      "note",
      "lines",
      "progress_percentage",
      "send_to_planner",
    ]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản báo cáo.",
    );
    C.fail(
      body.note === undefined &&
        body.lines === undefined &&
        body.progress_percentage === undefined &&
        body.send_to_planner === undefined,
      "VALIDATION_ERROR",
      "Không có nội dung cần sửa.",
    );
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT r.*,p.workshop_id FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=? FOR UPDATE",
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
      require("../../config/production-report-images").validate(
        user,
        body.note ?? report.note,
        report.note,
      );
      this.validateMetadata(
        report.report_purpose,
        body.note ?? report.note,
        body.progress_percentage ?? report.progress_percentage,
        body.send_to_planner ?? Boolean(report.send_to_planner),
      );
      const [[activePlan]] = await connection.execute(
        "SELECT status FROM production_plans WHERE id=?",
        [report.production_plan_id],
      );
      C.state(activePlan, ["APPROVED", "IN_PROGRESS"]);
      C.fail(
        report.report_purpose !== "NHU_CAU" && body.lines?.length,
        "VALIDATION_ERROR",
        "Tiến độ/sự cố không có dòng nhu cầu nguyên vật liệu.",
      );
      if (body.lines !== undefined) {
        const lines =
          report.report_purpose === "NHU_CAU"
            ? await this.validateLines(connection, body.lines)
            : [];
        await connection.execute(
          "DELETE FROM production_report_lines WHERE production_report_id=?",
          [id],
        );
        for (const line of lines)
          await connection.execute(
            "INSERT INTO production_report_lines (production_report_id,item_id,available_quantity,required_quantity) VALUES (?,?,?,?)",
            [id, line.item_id, line.available_quantity, line.required_quantity],
          );
      }
      await connection.execute(
        "UPDATE production_reports SET note=?,progress_percentage=?,send_to_planner=?,version=version+1 WHERE id=?",
        [
          body.note === undefined ? report.note : body.note || null,
          body.progress_percentage ?? report.progress_percentage,
          body.send_to_planner ?? Boolean(report.send_to_planner),
          id,
        ],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-reports',?,'UPDATE',?,?,?)",
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
        "SELECT r.*,p.workshop_id FROM production_reports r JOIN production_plans p ON p.id=r.production_plan_id WHERE r.id=? FOR UPDATE",
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
      const [[activePlan]] = await connection.execute(
        "SELECT status FROM production_plans WHERE id=? FOR UPDATE",
        [report.production_plan_id],
      );
      C.state(activePlan, ["APPROVED", "IN_PROGRESS"]);
      const [lines] = await connection.execute(
        "SELECT item_id,required_quantity FROM production_report_lines WHERE production_report_id=?",
        [id],
      );
      C.fail(
        report.report_purpose === "NHU_CAU" && !lines.length,
        "INVALID_STATE",
        "Báo cáo chưa có nguyên liệu.",
        409,
      );
      const available = lines.length
        ? await require("../../shared/available-stock")(
            connection,
            lines.map((line) => String(line.item_id)),
          )
        : new Map();
      const sendToPlanner =
        Boolean(report.send_to_planner) ||
        (report.report_purpose === "NHU_CAU" &&
          lines.some(
            (line) =>
              C.qty(String(line.required_quantity)) >
              (available.get(String(line.item_id)) || 0n),
          ));
      for (const line of lines)
        await connection.execute(
          "UPDATE production_report_lines SET available_quantity=? WHERE production_report_id=? AND item_id=?",
          [
            C.decimal(available.get(String(line.item_id)) || 0n),
            id,
            line.item_id,
          ],
        );
      await connection.execute(
        "UPDATE production_reports SET status='SUBMITTED',send_to_planner=?,submitted_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
        [sendToPlanner, id],
      );
      await connection.execute(
        "UPDATE production_plans SET status='IN_PROGRESS',version=version+1 WHERE id=? AND status='APPROVED'",
        [report.production_plan_id],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'production-reports',?,'SUBMIT',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ status: "DRAFT" }),
          JSON.stringify({ status: "SUBMITTED" }),
          requestId,
        ],
      );
      await connection.execute(
        "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?, 'production-reports',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND (r.code='DIRECTOR' OR (r.code='PLANNER' AND ?=1)) ON DUPLICATE KEY UPDATE id=notifications.id",
        [
          `Báo cáo sản xuất ${report.code} đã gửi`,
          `Báo cáo sản xuất ${report.code} đã gửi`,
          id,
          `report-${id}-submitted`,
          sendToPlanner,
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
  validateMetadata(purpose, note, progress, shared) {
    C.fail(
      !["NHU_CAU", "TIEN_DO", "SU_CO"].includes(purpose) ||
        typeof shared !== "boolean",
      "VALIDATION_ERROR",
      "Mục đích hoặc người nhận báo cáo không hợp lệ.",
    );
    if (purpose !== "NHU_CAU") C.text(note, "note", 5000);
    C.fail(
      progress != null &&
        (!/^\d{1,2}(\.\d{1,2})?$/.test(String(progress)) ||
          Number(progress) >= 100),
      "VALIDATION_ERROR",
      "Tiến độ khi đang sản xuất phải từ 0 đến dưới 100%.",
    );
  }
}

module.exports = ProductionReportService;
