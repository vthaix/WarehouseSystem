// =============================================================================
// YÊU CẦU NHẬP / XUẤT KHO
//   UC-23   Yêu cầu nhập/xuất           → create()
//   UC-24   Quản lý yêu cầu nhập xuất   → list(), get()
//   UC-24.1 Sửa yêu cầu                 → update()
//   UC-24.2 Xóa (hủy) yêu cầu           → remove()
//
// Các phần chi tiết nằm ở file riêng:
//   request-sources.js     yêu cầu lấy hàng từ chứng từ nào, tối đa bao nhiêu
//   request-lines.js       kiểm tra dòng hàng không vượt nguồn
//   request-permissions.js ai xem được, nút nào hiện
//   request-workflow.js    dữ liệu cho form, ngày giờ thực hiện, lô nguồn
//   partial-receipt.js     nhập thành phẩm từng phần do chủ xưởng tự nhập
// =============================================================================
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");
const codes = require("../../shared/readable-codes");
const sources = require("./request-sources");
const requestLines = require("./request-lines");
const permissions = require("./request-permissions");
const workflow = require("./request-workflow");

const { isId } = sources;
const asDate = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

// Số công việc kho còn hiệu lực của yêu cầu r: > 0 nghĩa là kho đã phân công.
const ACTIVE_TASK_COUNT =
  "(SELECT COUNT(*) FROM tasks t WHERE t.stock_request_id=r.id AND t.status<>'CANCELLED') AS active_task_count";

// Các cột mã (BIGINT) được trả về dạng chuỗi để trình duyệt so sánh an toàn.
const ID_FIELDS = [
  "id", "purchase_order_id", "business_plan_id", "production_plan_id",
  "production_report_id", "workshop_id", "warehouse_id", "created_by", "manager_id",
];
const SOURCE_FIELDS = ["purchase_order_id", "business_plan_id", "production_plan_id", "production_report_id"];
const STATUSES = ["PENDING", "PARTIALLY_FULFILLED", "FULFILLED", "CANCELLED"];

class StockRequestService {
  constructor(pool) {
    this.pool = pool;
  }

  // ---------------------------------------------------------------------------
  // Hàm dùng chung cho module khác (WarehouseFlowService, SourceImportService…)
  // ---------------------------------------------------------------------------
  definition(purpose, mode = "REPORT") {
    return sources.definition(purpose, mode);
  }
  source(connection, purpose, sourceId, workshopId, mode = "REPORT") {
    return sources.load(connection, purpose, sourceId, workshopId, mode);
  }
  validateLines(connection, purpose, lines, limits, sourceId, excludeId = null, sourceInfo = null) {
    return requestLines.validate(connection, purpose, lines, limits, sourceId, excludeId, sourceInfo);
  }
  visible(user, row) {
    return permissions.canView(user, row);
  }
  /** Danh sách KHSX, kế hoạch mua/bán… mà chủ xưởng chọn được trên form. */
  workflowSources(user) {
    return workflow.options(this.pool, user);
  }

  /** Chuyển một dòng stock_requests thành dữ liệu trả cho giao diện. */
  present(user, row) {
    const result = { ...row };
    for (const field of ID_FIELDS) if (result[field] != null) result[field] = String(result[field]);
    result.requested_date = asDate(result.requested_date);
    result.requested_at = row.ThoiDiemThucHien ? new Date(row.ThoiDiemThucHien).toISOString() : null;
    result.dispatch_saved = Number(row.active_task_count || 0) > 0;
    result.actions = permissions.actionsFor(user, row, result.dispatch_saved);
    delete result.ThoiDiemThucHien;
    delete result.active_task_count;
    delete result.assignee_ids;
    return result;
  }

  // ---------------------------------------------------------------------------
  // UC-24: danh sách và chi tiết
  // ---------------------------------------------------------------------------
  async list(user, query = {}) {
    P.role(user, P.read["stock-requests"]);
    C.fields(query, ["page", "per_page", "q", "status", "purpose", "sort", "type"]);
    const { page, per_page, offset } = paginate(query);
    const { where, params } = permissions.listScope(user);

    if (query.type) {
      C.fail(!["IN", "OUT"].includes(query.type), "VALIDATION_ERROR", "Loại nghiệp vụ không hợp lệ.");
      where.unshift("r.type=?");
      params.unshift(query.type);
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("r.code LIKE ?");
      params.push(`%${query.q}%`);
    }
    if (query.status) {
      C.fail(!STATUSES.includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ.");
      where.push("r.status=?");
      params.push(query.status);
    }
    if (query.purpose) {
      C.fail(!sources.PURPOSES[query.purpose], "VALIDATION_ERROR", "Phương thức không hợp lệ.");
      where.push("r.purpose=?");
      params.push(query.purpose);
    }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");

    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM stock_requests r" + filter, params);
    // Yêu cầu còn việc (chờ / xử lý một phần) lên đầu, sau đó mới nhất trước.
    const [rows] = await this.pool.execute(
      "SELECT r.*," + ACTIVE_TASK_COUNT + " FROM stock_requests r" + filter +
        " ORDER BY CASE WHEN r.status IN ('PENDING','PARTIALLY_FULFILLED') THEN 0 ELSE 1 END, r.id DESC LIMIT ? OFFSET ?",
      [...params, String(per_page), String(offset)],
    );
    const total = Number(count.total);
    return {
      data: rows.map((row) => this.present(user, row)),
      meta: { page, per_page, total, total_pages: Math.ceil(total / per_page) },
    };
  }

  /** Đọc một yêu cầu (kèm tên kho, xưởng, người…) và kiểm tra quyền xem. */
  async load(connection, user, id, locked = false) {
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
    const [rows] = await connection.execute(
      "SELECT r.*," + ACTIVE_TASK_COUNT +
        ",(SELECT name FROM warehouses WHERE id=r.warehouse_id) AS warehouse_name" +
        ",(SELECT name FROM workshops WHERE id=r.workshop_id) AS workshop_name" +
        ",(SELECT full_name FROM users WHERE id=r.manager_id) AS manager_name" +
        ",(SELECT full_name FROM users WHERE id=r.created_by) AS created_by_name" +
        ",(SELECT code FROM production_plans WHERE id=r.production_plan_id) AS production_plan_code" +
        ",(SELECT code FROM purchase_orders WHERE id=r.purchase_order_id) AS purchase_order_code" +
        " FROM stock_requests r WHERE r.id=?" + (locked ? " FOR UPDATE" : ""),
      [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
    const row = rows[0];

    // Nhân viên kho chỉ xem yêu cầu mình được phân công.
    if (has(user, "WAREHOUSE_STAFF") && !has(user, "WAREHOUSE_MANAGER") && !has(user, "DIRECTOR")) {
      const [assignments] = await connection.execute(
        "SELECT id FROM stock_allocations WHERE stock_request_id=? AND user_id=? LIMIT 1",
        [id, user.id],
      );
      row.assignee_ids = assignments.length ? [String(user.id)] : [];
    }
    C.fail(!permissions.canView(user, row), "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
    return row;
  }

  /** Chi tiết yêu cầu: dòng hàng kèm lượng đã xử lý / còn lại, lô nguồn, nút thao tác. */
  async get(user, id, connection = this.pool) {
    P.role(user, P.read["stock-requests"]);
    const row = await this.load(connection, user, id);
    const result = {
      ...this.present(user, row),
      source_lots: await workflow.lots(connection, row),
      lines: await this.linesWithProgress(connection, row),
    };
    if (row.production_source_mode === "MANUAL") result.lots = await this.manualReceiptLots(connection, id);

    // Nhân viên kho đang có công việc với yêu cầu này thì được ghi phiếu.
    if (has(user, "WAREHOUSE_STAFF")) {
      const [tasks] = await connection.execute(
        "SELECT DISTINCT t.id FROM tasks t JOIN task_assignments a ON a.task_id=t.id" +
          " WHERE t.stock_request_id=? AND a.user_id=? AND t.status IN ('PLANNED','IN_PROGRESS') ORDER BY t.id LIMIT 1",
        [id, user.id],
      );
      if (tasks.length) {
        result.assigned_task_id = String(tasks[0].id);
        result.actions.push("post");
      }
    }
    return result;
  }

  /**
   * Dòng hàng kèm:
   *   fulfilled_quantity  lượng đã ghi phiếu kho
   *   remaining_quantity  lượng còn phải xử lý (nhập thủ công: tính trên lượng QC đạt)
   */
  async linesWithProgress(connection, row) {
    const [lines] = await connection.execute(
      "SELECT l.*,i.code AS item_code,i.name AS item_name,u.name AS unit FROM stock_request_lines l" +
        " JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id WHERE l.stock_request_id=? ORDER BY l.id",
      [row.id],
    );
    const [posted] = await connection.execute(
      "SELECT dl.stock_request_line_id,SUM(dl.quantity) AS quantity FROM stock_document_lines dl" +
        " JOIN stock_documents d ON d.id=dl.stock_document_id WHERE d.stock_request_id=? GROUP BY dl.stock_request_line_id",
      [row.id],
    );
    const done = new Map(posted.map((p) => [String(p.stock_request_line_id), C.qty(String(p.quantity), false)]));

    const manual = row.production_source_mode === "MANUAL";
    const qualityByItem = new Map();
    if (manual) {
      const [quality] = await connection.execute(
        "SELECT l.item_id,q.passed_quantity,q.failed_quantity FROM lots l" +
          " LEFT JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.production_receipt_request_id=?",
        [row.id],
      );
      for (const q of quality) qualityByItem.set(String(q.item_id), q);
    }

    return lines.map((line) => {
      const quality = qualityByItem.get(String(line.item_id));
      const fulfilled = done.get(String(line.id)) || 0n;
      const target = C.qty(String(quality?.passed_quantity ?? line.quantity), false);
      return {
        ...line,
        id: String(line.id),
        stock_request_id: String(line.stock_request_id),
        item_id: String(line.item_id),
        fulfilled_quantity: C.decimal(fulfilled),
        remaining_quantity: C.decimal(target - fulfilled),
        ...(manual
          ? { qc_passed_quantity: quality?.passed_quantity ?? null, qc_failed_quantity: quality?.failed_quantity ?? null }
          : {}),
      };
    });
  }

  /** Lô thành phẩm do đợt nhập thủ công tạo ra. */
  async manualReceiptLots(connection, id) {
    const [lots] = await connection.execute(
      "SELECT id,code AS lot_code,lot_header_id,item_id,received_quantity,manufactured_date,expiry_date,qc_status" +
        " FROM lots WHERE production_receipt_request_id=? ORDER BY id",
      [id],
    );
    return lots.map((lot) => ({
      ...lot,
      id: String(lot.id),
      lot_header_id: String(lot.lot_header_id),
      item_id: String(lot.item_id),
      manufactured_date: asDate(lot.manufactured_date),
      expiry_date: asDate(lot.expiry_date),
    }));
  }

  // ---------------------------------------------------------------------------
  // UC-23: lập yêu cầu
  // ---------------------------------------------------------------------------
  async create(user, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);

    // Form hiện tại gửi "workflow_source_id" (một KHSX / kế hoạch / báo cáo):
    // quy đổi ra chứng từ nguồn cụ thể rồi tạo như bình thường.
    if (body.workflow_source_id !== undefined) {
      C.fields(body, ["purpose", "workflow_source_id", "sale_plan_id", "workshop_id", "warehouse_id",
        "manager_id", "requested_date", "requested_at", "note", "lines"]);
      const { workflow_source_id, sale_plan_id, ...rest } = body;
      const source = await workflow.resolve(this.pool, user, body.purpose, workflow_source_id, body.workshop_id, sale_plan_id);
      return this.create(user, { ...rest, ...source }, requestId);
    }

    // Nhập thành phẩm từng phần thủ công: tạo lô ngay khi lập yêu cầu.
    if (body.purpose === "PRODUCTION_RECEIPT" && body.production_source_mode === "MANUAL")
      return require("./partial-receipt").create(this, user, body, requestId);

    // 1. Kiểm tra dữ liệu gửi lên (chưa cần đọc database).
    C.fields(body, ["purpose", "warehouse_id", "workshop_id", "manager_id", "requested_date", "requested_at",
      ...SOURCE_FIELDS, "production_source_mode", "note", "lines"]);
    const mode = body.production_source_mode || "REPORT";
    C.fail(
      !["PLAN", "REPORT"].includes(mode) || (mode === "PLAN" && body.purpose !== "PRODUCTION_ISSUE"),
      "VALIDATION_ERROR",
      "Nguồn sản xuất không hợp lệ.",
    );
    const definition = sources.definition(body.purpose, mode);
    C.fail(!definition, "VALIDATION_ERROR", "Phương thức yêu cầu không hợp lệ.");
    C.fail(
      !isId(body.workshop_id) || !user.workshop_ids.includes(String(body.workshop_id)) || !isId(body.warehouse_id),
      "FORBIDDEN",
      "Xưởng hoặc kho không hợp lệ.",
      403,
    );
    C.date(body.requested_date, "requested_date", true);
    const executionAt = workflow.execution(body);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    for (const field of SOURCE_FIELDS)
      C.fail(field !== definition.field && body[field] !== undefined, "VALIDATION_ERROR", "Chỉ chọn một nguồn yêu cầu.");
    const sourceId = body[definition.field];

    // 2. Kiểm tra với dữ liệu hiện có và ghi trong một giao dịch.
    const id = await this.transaction(async (connection) => {
      await assertActiveWarehouse(connection, body.warehouse_id);
      const procurement = body.purpose === "MATERIAL_PURCHASE"; // đề nghị mua: không qua quản lý kho
      const managerId = procurement ? null : await this.manager(connection, body.manager_id);
      C.fail(!procurement && !managerId, "VALIDATION_ERROR", "Cần chỉ định quản lý kho.");

      const source = await sources.load(connection, body.purpose, sourceId, body.workshop_id, mode);
      const lines = await requestLines.validate(connection, body.purpose, body.lines, source.limits, sourceId, null, source);

      const prefix = sources.CODE_PREFIX[body.purpose] || "YC-KHO";
      const code = await codes.next(connection, "stock_requests", prefix, await codes.workshop(connection, body.workshop_id));
      const links = { purchase_order_id: null, business_plan_id: null, production_plan_id: null, production_report_id: null };
      links[definition.field] = sourceId;
      if (["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT"].includes(body.purpose))
        links.production_plan_id = source.source.production_plan_id;

      const [created] = await connection.execute(
        "INSERT INTO stock_requests (code,type,purpose,purchase_order_id,business_plan_id,production_plan_id,production_report_id," +
          "workshop_id,warehouse_id,created_by,manager_id,requested_date,status,note,version,production_source_mode)" +
          " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'PENDING',?,1,?)",
        [code, definition.type, body.purpose, links.purchase_order_id, links.business_plan_id, links.production_plan_id,
          links.production_report_id, body.workshop_id, body.warehouse_id, user.id, managerId, body.requested_date,
          body.note || null, mode],
      );
      const newId = created.insertId;
      await connection.execute("UPDATE stock_requests SET ThoiDiemThucHien=? WHERE id=?", [executionAt, newId]);
      await insertLines(connection, newId, lines);

      if (managerId)
        await notify(connection, managerId, "Yêu cầu " + code + " cần phân công",
          "Chủ xưởng đề nghị " + (definition.type === "IN" ? "nhập" : "xuất") + " kho; xem lô hàng và ngày giờ thực hiện.",
          newId, "stock-request-" + newId + "-created");
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,'CREATE',?,?)",
        [user.id, newId, JSON.stringify({ code, purpose: body.purpose }), requestId],
      );
      return newId;
    });
    return this.get(user, id);
  }

  // ---------------------------------------------------------------------------
  // UC-24.1: sửa yêu cầu
  // ---------------------------------------------------------------------------
  async update(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version", "requested_date", "requested_at", "warehouse_id", "manager_id", "note", "lines"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản yêu cầu.");
    const editable = ["requested_date", "requested_at", "warehouse_id", "manager_id", "note", "lines"];
    C.fail(!editable.some((field) => Object.hasOwn(body, field)), "VALIDATION_ERROR", "Không có nội dung cần sửa.");
    if (body.requested_date !== undefined) C.date(body.requested_date, "requested_date", true);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);

    await this.transaction(async (connection) => {
      // 1. Yêu cầu phải thuộc xưởng của chủ xưởng.
      const [found] = await connection.execute("SELECT * FROM stock_requests WHERE id=?", [id]);
      C.fail(!found.length || !user.workshop_ids.includes(String(found[0].workshop_id)), "NOT_FOUND", "Không tìm thấy yêu cầu.", 404);
      const original = found[0];
      const definition = sources.definition(original.purpose, original.production_source_mode);
      const changesTime = body.requested_date !== undefined || body.requested_at !== undefined;
      const executionAt = changesTime ? workflow.execution(body, original) : null;
      C.fail(original.production_source_mode === "MANUAL", "IMMUTABLE_RECEIPT",
        "Đợt nhập đã ghi lô; hủy đợt chưa dùng rồi tạo lại thay vì sửa số lượng.", 409);

      // 2. Khóa nguồn và yêu cầu; yêu cầu phải còn chờ, chưa dùng, chưa phân công.
      const sourceInfo = await sources.load(connection, original.purpose, original[definition.field],
        original.workshop_id, original.production_source_mode);
      const row = await this.load(connection, user, id, true);
      C.version(row, body.version);
      C.state(row, ["PENDING"]);
      await this.assertNotUsedForPurchase(connection, row);
      await this.assertNotDispatched(connection, id);

      // 3. Ghi thay đổi.
      if (body.lines !== undefined) {
        const lines = await requestLines.validate(connection, row.purpose, body.lines, sourceInfo.limits,
          row[definition.field], id, sourceInfo);
        await connection.execute("DELETE FROM stock_request_lines WHERE stock_request_id=?", [id]);
        await insertLines(connection, id, lines);
      }
      if (body.warehouse_id !== undefined) {
        C.fail(!isId(body.warehouse_id), "VALIDATION_ERROR", "Kho không hợp lệ.");
        await assertActiveWarehouse(connection, body.warehouse_id);
      }
      const managerId = body.manager_id === undefined ? row.manager_id : await this.manager(connection, body.manager_id);
      await connection.execute(
        "UPDATE stock_requests SET requested_date=?,warehouse_id=?,manager_id=?,note=?,version=version+1 WHERE id=?",
        [
          body.requested_date || asDate(row.requested_date),
          body.warehouse_id || row.warehouse_id,
          managerId,
          body.note === undefined ? row.note : body.note || null,
          id,
        ],
      );
      if (executionAt) await connection.execute("UPDATE stock_requests SET ThoiDiemThucHien=? WHERE id=?", [executionAt, id]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stock-requests',?,'UPDATE',?,?,?)",
        [user.id, id, JSON.stringify({ version: row.version }), JSON.stringify(body), requestId],
      );
    });
    return this.get(user, id);
  }

  // ---------------------------------------------------------------------------
  // UC-24.2: hủy yêu cầu
  //   - Chủ xưởng: khi yêu cầu còn chờ và kho chưa phân công.
  //   - Quản lý kho phụ trách: khi chưa ghi phiếu nào và chưa tới giờ thực hiện;
  //     các công việc kho đi kèm bị hủy theo.
  //   Sau khi hủy, những người liên quan được thông báo.
  // ---------------------------------------------------------------------------
  async remove(user, id, body, requestId) {
    const byManager = has(user, "WAREHOUSE_MANAGER");
    if (!byManager) P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản yêu cầu.");

    await this.transaction(async (connection) => {
      const row = await this.load(connection, user, id, true);
      C.version(row, body.version);
      if (byManager) {
        const blocker = permissions.managerCancelBlocker(user, row);
        C.fail(blocker, blocker?.code, blocker?.message, 409);
      } else {
        C.state(row, ["PENDING"]);
        await this.assertNotDispatched(connection, id);
      }
      await this.assertSourceNotUsed(connection, row);

      const cancelledTasks = await cancelWarehouseTasks(connection, id);
      await connection.execute("UPDATE stock_requests SET status='CANCELLED',version=version+1 WHERE id=?", [id]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stock-requests',?,'CANCEL',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ status: row.status }),
          JSON.stringify({
            status: "CANCELLED",
            by: byManager ? "WAREHOUSE_MANAGER" : "WORKSHOP_OWNER",
            cancelled_task_ids: cancelledTasks.map((t) => t.id),
          }),
          requestId,
        ],
      );
      await notifyCancelled(connection, user, row, cancelledTasks);
    });
    return this.get(user, id);
  }

  // ---------------------------------------------------------------------------
  // Kiểm tra dùng chung
  // ---------------------------------------------------------------------------

  /** Quản lý kho được chỉ định phải đang hoạt động. Không chỉ định thì trả về null. */
  async manager(connection, id) {
    if (!id) return null;
    C.fail(!isId(id), "VALIDATION_ERROR", "Quản lý kho không hợp lệ.");
    const [rows] = await connection.execute(
      "SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id" +
        " WHERE u.id=? AND u.status='ACTIVE' AND r.code='WAREHOUSE_MANAGER'",
      [id],
    );
    C.fail(!rows.length, "VALIDATION_ERROR", "Người được chọn không phải quản lý kho.");
    return String(id);
  }

  /** Đề nghị mua đã được lập thành kế hoạch mua thì không sửa/hủy được nữa. */
  async assertNotUsedForPurchase(connection, row) {
    if (row.purpose !== "MATERIAL_PURCHASE") return;
    const [plans] = await connection.execute(
      "SELECT id FROM business_plans WHERE source_request_id=? AND status NOT IN ('REJECTED','CANCELLED') LIMIT 1 FOR UPDATE",
      [row.id],
    );
    C.fail(plans.length, "IN_USE", "Yêu cầu đã được dùng để lập kế hoạch mua, không thể sửa hoặc hủy.", 409);
  }

  /** Chủ xưởng chỉ sửa/hủy được khi kho chưa phân công người thực hiện. */
  async assertNotDispatched(connection, id) {
    const [[tasks]] = await connection.execute(
      "SELECT COUNT(*) AS total FROM tasks WHERE stock_request_id=? AND status<>'CANCELLED'",
      [id],
    );
    C.fail(Number(tasks.total) > 0, "INVALID_STATE", "Yêu cầu đã được phân công; liên hệ quản lý kho.", 409);
  }

  /** Dữ liệu nguồn của yêu cầu chưa được dùng ở nghiệp vụ sau. */
  async assertSourceNotUsed(connection, row) {
    await this.assertNotUsedForPurchase(connection, row);
    if (row.production_source_mode !== "MANUAL") return;
    const [used] = await connection.execute(
      "SELECT o.id FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id WHERE l.production_receipt_request_id=? LIMIT 1",
      [row.id],
    );
    C.fail(used.length, "IN_USE", "Đợt nhập đã được dùng trong báo cáo tổng kết.", 409);
    const [quality] = await connection.execute(
      "SELECT q.id FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id WHERE l.production_receipt_request_id=?" +
        " UNION ALL SELECT q.lot_id FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id JOIN stocktakes s ON s.id=q.campaign_id" +
        " WHERE l.production_receipt_request_id=? AND s.status IN ('PLANNED','IN_PROGRESS')",
      [row.id, row.id],
    );
    C.fail(quality.length, "IN_USE", "Đợt nhập đã được lên lịch hoặc ghi kết quả QC, không hủy dữ liệu nguồn.", 409);
  }

  /** Chạy công việc trong một giao dịch: lỗi ở bất kỳ bước nào thì hoàn tác tất cả. */
  async transaction(work) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

// -----------------------------------------------------------------------------
// Hàm phụ (không cần trạng thái của service)
// -----------------------------------------------------------------------------
const has = (user, role) => user.roles.includes(role);

async function assertActiveWarehouse(connection, warehouseId) {
  const [warehouses] = await connection.execute("SELECT id FROM warehouses WHERE id=? AND is_active=1", [warehouseId]);
  C.fail(!warehouses.length, "VALIDATION_ERROR", "Kho không hoạt động.");
}

async function insertLines(connection, requestId, lines) {
  for (const line of lines)
    await connection.execute(
      "INSERT INTO stock_request_lines (stock_request_id,item_id,quantity,note) VALUES (?,?,?,?)",
      [requestId, line.item_id, line.quantity, line.note],
    );
}

async function notify(connection, userId, subject, body, requestId, key) {
  await connection.execute(
    "INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'stock-requests',?,?)" +
      " ON DUPLICATE KEY UPDATE id=notifications.id",
    [userId, subject, body, requestId, key],
  );
}

/** Hủy các công việc kho chưa xong của yêu cầu; trả về danh sách để báo nhân viên. */
async function cancelWarehouseTasks(connection, requestId) {
  const [tasks] = await connection.execute(
    "SELECT DISTINCT t.id,t.code,a.user_id FROM tasks t JOIN stock_allocations a ON a.task_id=t.id" +
      " WHERE t.stock_request_id=? AND t.status IN ('PLANNED','IN_PROGRESS') FOR UPDATE",
    [requestId],
  );
  if (tasks.length)
    await connection.execute(
      "UPDATE tasks SET status='CANCELLED',version=version+1 WHERE stock_request_id=? AND status IN ('PLANNED','IN_PROGRESS')",
      [requestId],
    );
  return tasks.map((t) => ({ id: String(t.id), code: t.code, user_id: String(t.user_id) }));
}

/**
 * UC-24.2 bước 4: báo hủy cho quản lý kho phụ trách, chủ xưởng của xưởng và
 * nhân viên kho có công việc bị hủy (trừ chính người hủy).
 */
async function notifyCancelled(connection, user, row, cancelledTasks) {
  const recipients = new Set();
  if (row.manager_id) recipients.add(String(row.manager_id));
  const [owners] = await connection.execute(
    "SELECT DISTINCT wu.user_id FROM workshop_users wu JOIN user_roles ur ON ur.user_id=wu.user_id JOIN roles r ON r.id=ur.role_id" +
      " WHERE wu.workshop_id=? AND r.code='WORKSHOP_OWNER'",
    [row.workshop_id],
  );
  owners.forEach((owner) => recipients.add(String(owner.user_id)));
  cancelledTasks.forEach((task) => recipients.add(task.user_id));
  recipients.delete(String(user.id));

  const taskCodes = [...new Set(cancelledTasks.map((t) => t.code))].join(", ");
  const body = (user.full_name || "Người phụ trách") + " đã hủy yêu cầu" +
    (cancelledTasks.length ? "; các công việc kho " + taskCodes + " cũng bị hủy." : ".");
  for (const recipient of recipients)
    await notify(connection, recipient, "Yêu cầu " + row.code + " đã bị hủy", body, row.id,
      "stock-request-" + row.id + "-cancelled-" + recipient);
}

module.exports = StockRequestService;
