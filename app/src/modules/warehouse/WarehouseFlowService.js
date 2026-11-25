const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");
const recordCode = require("../../shared/record-code");
const transaction = require("../../shared/transaction");
const previewRequest = require("./uc08-09-xem-truoc");
const { dispatchRequest, cancelAllocation } = require("./uc08-09-phan-cong-kho");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) => (value instanceof Date ? value.toISOString() : value);

class WarehouseFlowService {
  constructor(pool, requests) {
    this.pool = pool;
    this.requests = requests;
  }

  transaction(work) {
    return transaction(this.pool, work);
  }

  preview(user, requestId, query) {
    return previewRequest(this, user, requestId, query);
  }

  dispatch(user, requestId, body, key, auditId) {
    return dispatchRequest(this, user, requestId, body, key, auditId);
  }

  cancelAllocation(user, taskId, body, auditId) {
    return cancelAllocation(this, user, taskId, body, auditId);
  }

  async document(user, id, connection = this.pool) {
    P.role(user, P.read["stock-documents"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    const [rows] = await connection.execute(
      "SELECT d.*,r.workshop_id,r.purpose,r.code AS stock_request_code,k.name AS warehouse_name,w.name AS workshop_name,u.full_name AS posted_by_name FROM stock_documents d LEFT JOIN stock_requests r ON r.id=d.stock_request_id JOIN warehouses k ON k.id=d.warehouse_id LEFT JOIN workshops w ON w.id=r.workshop_id JOIN users u ON u.id=d.posted_by WHERE d.id=?",
      [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    const row = rows[0];
    C.fail(
      user.roles.includes("WORKSHOP_OWNER") &&
        !user.workshop_ids.includes(String(row.workshop_id)),
      "NOT_FOUND",
      "Không tìm thấy phiếu kho.",
      404,
    );
    C.fail(
      user.roles.includes("WAREHOUSE_STAFF") &&
        !user.roles.includes("WAREHOUSE_MANAGER") &&
        String(row.posted_by) !== String(user.id),
      "NOT_FOUND",
      "Không tìm thấy phiếu kho.",
      404,
    );
    const [lines] = await connection.execute(
      "SELECT l.*,lot.code AS lot_code,i.name AS item_name,u.name AS unit,pos.code AS location_code,pos.zone_name AS location_name FROM stock_document_lines l JOIN lots lot ON lot.id=l.lot_id JOIN items i ON i.id=lot.item_id JOIN units u ON u.id=i.unit_id JOIN warehouse_locations pos ON pos.id=l.location_id WHERE l.stock_document_id=? ORDER BY l.id",
      [id],
    );
    return { ...normalize(row), actions: [], lines: lines.map(normalize) };
  }

  /** UC-19/20 Hồ sơ xuất / nhập kho: lọc theo loại phiếu, trạng thái, kho, mặt hàng, khoảng ngày ghi sổ; exportMode trả toàn bộ để xuất CSV. */
  async documents(user, query = {}, exportMode = false) {
    P.role(user, P.read["stock-documents"]);
    C.fields(query, ["page", "per_page", "q", "type", "sort", "status", "warehouse_id", "item_id", "from", "to", ...(exportMode ? ["format"] : [])]);
    if (exportMode) C.fail(query.format !== "csv", "VALIDATION_ERROR", "Chỉ hỗ trợ CSV.");
    const { page, per_page, offset } = paginate(query);
    const where = [],
      params = [];
    if (
      user.roles.includes("WORKSHOP_OWNER") &&
      !user.roles.includes("DIRECTOR") &&
      !user.roles.includes("WAREHOUSE_MANAGER")
    ) {
      if (!user.workshop_ids.length) where.push("1=0");
      else {
        where.push(
          "r.workshop_id IN (" +
            user.workshop_ids.map(() => "?").join(",") +
            ")",
        );
        params.push(...user.workshop_ids);
      }
    } else if (
      user.roles.includes("WAREHOUSE_STAFF") &&
      !user.roles.includes("WAREHOUSE_MANAGER") &&
      !user.roles.includes("DIRECTOR")
    ) {
      where.push("d.posted_by=?");
      params.push(user.id);
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("d.code LIKE ?");
      params.push(`%${query.q}%`);
    }
    if (query.type) {
      C.fail(
        !["IN", "OUT"].includes(query.type),
        "VALIDATION_ERROR",
        "Loại phiếu không hợp lệ.",
      );
      where.push("d.type=?");
      params.push(query.type);
    }
    if (query.status) {
      C.fail(!["POSTED", "CANCELLED", "DRAFT"].includes(query.status), "VALIDATION_ERROR", "Trạng thái phiếu không hợp lệ.");
      where.push("d.status=?");
      params.push(query.status);
    }
    for (const name of ["warehouse_id", "item_id"])
      if (query[name] !== undefined) C.fail(!isId(query[name]), "VALIDATION_ERROR", (name === "warehouse_id" ? "Kho" : "Mặt hàng") + " không hợp lệ.");
    if (query.warehouse_id) {
      where.push("d.warehouse_id=?");
      params.push(query.warehouse_id);
    }
    if (query.item_id) {
      where.push("EXISTS(SELECT 1 FROM stock_document_lines dl JOIN lots lot ON lot.id=dl.lot_id WHERE dl.stock_document_id=d.id AND lot.item_id=?)");
      params.push(query.item_id);
    }
    if (query.from) C.date(query.from, "from");
    if (query.to) C.date(query.to, "to");
    C.fail(query.from && query.to && query.from > query.to, "VALIDATION_ERROR", "Khoảng ngày không hợp lệ: Từ ngày phải trước hoặc bằng Đến ngày.");
    // Ngày ghi sổ tính theo giờ Việt Nam (UTC+7).
    if (query.from) {
      where.push("DATE(DATE_ADD(d.posted_at,INTERVAL 7 HOUR))>=?");
      params.push(query.from);
    }
    if (query.to) {
      where.push("DATE(DATE_ADD(d.posted_at,INTERVAL 7 HOUR))<=?");
      params.push(query.to);
    }
    C.fail(
      query.sort && query.sort !== "newest",
      "VALIDATION_ERROR",
      "Cách sắp xếp không hợp lệ.",
    );
    const base =
      " FROM stock_documents d LEFT JOIN stock_requests r ON r.id=d.stock_request_id LEFT JOIN warehouses w ON w.id=d.warehouse_id" +
      (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total" + base,
      params,
    );
    if (exportMode) {
      C.fail(Number(count.total) > 50000, "EXPORT_TOO_LARGE", "Hồ sơ vượt 50.000 phiếu; thu hẹp điều kiện lọc.", 422);
      const [lines] = await this.pool.execute(
        "SELECT d.code,d.type,d.status,d.posted_at,w.name AS warehouse_name,r.code AS request_code,r.purpose,i.code AS item_code,i.name AS item_name,lot.code AS lot_code,loc.code AS location_code,dl.quantity" +
          base.replace(" FROM stock_documents d", " FROM stock_documents d JOIN stock_document_lines dl ON dl.stock_document_id=d.id JOIN lots lot ON lot.id=dl.lot_id JOIN items i ON i.id=lot.item_id LEFT JOIN warehouse_locations loc ON loc.id=dl.location_id") +
          " ORDER BY d.posted_at DESC,d.id DESC,dl.id",
        params,
      );
      return { data: lines };
    }
    const [rows] = await this.pool.execute(
      "SELECT d.*,r.workshop_id,r.purpose,w.name AS warehouse_name" +
        base +
        " ORDER BY d.id DESC LIMIT ? OFFSET ?",
      [...params, String(per_page), String(offset)],
    );
    return {
      data: rows.map((row) => ({ ...normalize(row), actions: [] })),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }

  async post(user, body, key, requestIdHeader) {
    P.role(user, ["WAREHOUSE_STAFF"]);
    C.fields(body, [
      "stock_request_id",
      "request_version",
      "task_id",
      "note",
      "allocations",
    ]);
    C.fail(
      !isId(body.stock_request_id) ||
        !isId(body.task_id) ||
        !Number.isInteger(body.request_version),
      "VALIDATION_ERROR",
      "Yêu cầu hoặc công việc không hợp lệ.",
    );
    C.fail(
      !Array.isArray(body.allocations) ||
        !body.allocations.length ||
        body.allocations.length > 200,
      "VALIDATION_ERROR",
      "Phiếu kho cần 1 đến 200 dòng.",
    );
    C.fail(
      typeof key !== "string" || key.length < 8 || key.length > 100,
      "VALIDATION_ERROR",
      "Cần Idempotency-Key hợp lệ.",
    );
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const seen = new Set();
    for (const line of body.allocations) {
      C.fields(line, [
        "allocation_id",
        "stock_request_line_id",
        "lot_id",
        "location_id",
        "quality_bucket",
        "quantity",
        "difference_reason",
      ]);
      C.fail(
        ["stock_request_line_id", "lot_id", "location_id"].some(
          (field) => !isId(line[field]),
        ) ||
          (line.allocation_id && !isId(line.allocation_id)) ||
          line.quality_bucket !== "AVAILABLE",
        "VALIDATION_ERROR",
        "Dòng ghi sổ không hợp lệ.",
      );
      C.qty(line.quantity);
      const tuple = [
        line.stock_request_line_id,
        line.lot_id,
        line.location_id,
        line.quality_bucket,
      ].join(":");
      C.fail(seen.has(tuple), "VALIDATION_ERROR", "Dòng ghi sổ trùng.");
      seen.add(tuple);
      if (line.difference_reason !== undefined)
        C.text(line.difference_reason, "difference_reason", 5000, false);
    }
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");
    return this.transaction(async (connection) => {
      await connection.execute(
        "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'stock-post',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
        [user.id, key, hash],
      );
      const [[record]] = await connection.execute(
        "SELECT * FROM idempotency_records WHERE user_id=? AND operation='stock-post' AND idempotency_key=? FOR UPDATE",
        [user.id, key],
      );
      C.fail(
        record.request_hash !== hash,
        "IDEMPOTENCY_CONFLICT",
        "Khóa yêu cầu đã dùng cho nội dung khác.",
        409,
      );
      if (record.response_status === 200)
        return typeof record.response_body === "string"
          ? JSON.parse(record.response_body)
          : record.response_body;
      const [requests] = await connection.execute(
        "SELECT * FROM stock_requests WHERE id=? FOR UPDATE",
        [body.stock_request_id],
      );
      C.fail(!requests.length, "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
      const request = requests[0];
      if(request.purpose==='SALE_ISSUE')await require('../stock-requests/sale-readiness').saleReadiness(connection,request.business_plan_id,request.workshop_id);
      C.fail(['PRODUCTION_ISSUE','PRODUCTION_RECEIPT'].includes(request.purpose)&&!request.production_report_id&&!['PLAN','MANUAL'].includes(request.production_source_mode),'SOURCE_REQUIRED','Yêu cầu lịch sử thiếu báo cáo nguồn.',409);
      await connection.execute(
        "SELECT id FROM warehouses WHERE id=? FOR UPDATE",
        [request.warehouse_id],
      );
      C.version(request, body.request_version);
      C.state(request, ["PENDING", "PARTIALLY_FULFILLED"]);
      C.fail(
        request.purpose === "MATERIAL_PURCHASE",
        "INVALID_STATE",
        "Yêu cầu mua nguyên liệu không ghi phiếu kho.",
        409,
      );
      const [taskRows] = await connection.execute(
        "SELECT t.* FROM tasks t JOIN task_assignments a ON a.task_id=t.id WHERE t.id=? AND t.stock_request_id=? AND a.user_id=? FOR UPDATE",
        [body.task_id, body.stock_request_id, user.id],
      );
      C.fail(
        !taskRows.length ||
          !["PLANNED", "IN_PROGRESS"].includes(taskRows[0].status),
        "FORBIDDEN",
        "Công việc không được giao hoặc đã hoàn tất.",
        403,
      );
      const [locks] = await connection.execute(
        "SELECT sw.id FROM stocktake_warehouses sw JOIN stocktakes s ON s.id=sw.stocktake_id WHERE sw.warehouse_id=? AND sw.status IN ('COUNTING','COMPLETED') AND s.campaign_type='COUNT' LIMIT 1",
        [request.warehouse_id],
      );
      C.fail(
        locks.length,
        "WAREHOUSE_LOCKED",
        "Kho đang kiểm kê, chưa thể ghi sổ.",
        409,
      );
      const [assignments] = await connection.execute(
        "SELECT a.*,l.item_id FROM stock_allocations a JOIN stock_request_lines l ON l.id=a.stock_request_line_id WHERE a.task_id=? AND a.user_id=? ORDER BY a.id FOR UPDATE",
        [body.task_id, user.id],
      );
      const used = new Set();
      const accepted = [];
      const newlyPosted = new Map();
      for (const line of body.allocations) {
        const assignment = assignments.find((row) =>
          line.allocation_id
            ? String(row.id) === String(line.allocation_id)
            : String(row.stock_request_line_id) ===
                String(line.stock_request_line_id) &&
              String(row.lot_id) === String(line.lot_id) &&
              String(row.location_id) === String(line.location_id) &&
              row.quality_bucket === line.quality_bucket,
        );
        C.fail(
          !assignment ||
            used.has(String(assignment.id)) ||
            String(assignment.stock_request_line_id) !==
              String(line.stock_request_line_id) ||
            String(assignment.lot_id) !== String(line.lot_id) ||
            String(assignment.location_id) !== String(line.location_id),
          "FORBIDDEN",
          "Dòng không thuộc phân công của bạn.",
          403,
        );
        used.add(String(assignment.id));
        const quantity = C.qty(line.quantity);
        C.fail(
          quantity >
            C.qty(String(assignment.quantity)) -
              C.qty(String(assignment.posted_quantity), false),
          "SOURCE_LIMIT_EXCEEDED",
          "Vượt lượng phân công còn lại.",
        );
        const [lots] = await connection.execute(
          "SELECT l.*,q.passed_quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.id=? FOR UPDATE",
          [line.lot_id],
        );
        C.fail(
          lots[0]?.expiry_date &&
            lots[0].expiry_date.toISOString().slice(0, 10) <
              new Date().toISOString().slice(0, 10),
          "INVALID_STATE",
          "Dòng lô đã hết hạn.",
          409,
        );
        C.fail(
          !lots.length ||
            String(lots[0].item_id) !== String(assignment.item_id) ||
            !["PASSED", "PARTIAL"].includes(lots[0].qc_status),
          "INVALID_STATE",
          "Lô chưa đạt QC hoặc sai mặt hàng.",
          409,
        );
        const [locations] = await connection.execute(
          "SELECT warehouse_id FROM warehouse_locations WHERE id=? AND is_active=1",
          [line.location_id],
        );
        C.fail(
          !locations.length ||
            String(locations[0].warehouse_id) !== String(request.warehouse_id),
          "VALIDATION_ERROR",
          "Vị trí không thuộc kho.",
        );
        if (request.type === "IN") {
          const [posted] = await connection.execute(
            "SELECT COALESCE(SUM(dl.quantity),0) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE dl.lot_id=? AND d.type='IN'",
            [line.lot_id],
          );
          const lotKey = String(line.lot_id);
          const nextAmount = (newlyPosted.get(lotKey) || 0n) + quantity;
          C.fail(
            nextAmount >
              C.qty(String(lots[0].passed_quantity), false) -
                C.qty(String(posted[0].quantity), false),
            "SOURCE_LIMIT_EXCEEDED",
            "Vượt lượng QC đạt của lô.",
          );
          newlyPosted.set(lotKey, nextAmount);
        } else {
          const [balance] = await connection.execute(
            "SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE' FOR UPDATE",
            [line.lot_id, line.location_id],
          );
          C.fail(
            !balance.length ||
              quantity > C.qty(String(balance[0].quantity), false),
            "INSUFFICIENT_STOCK",
            "Không đủ tồn khả dụng.",
            409,
          );
        }
        accepted.push({
          ...line,
          allocation_id: assignment.id,
          quantity: C.decimal(quantity),
        });
      }
      const code=await require('../../shared/readable-codes').next(connection,'stock_documents',request.type==='IN'?'PHIEU-NHAP':'PHIEU-XUAT',await require('../../shared/readable-codes').workshop(connection,request.workshop_id));
      const [created] = await connection.execute(
        "INSERT INTO stock_documents (code,type,stock_request_id,warehouse_id,posted_by,posted_at,status,note,idempotency_key,task_id) VALUES (?,?,?,?,?,UTC_TIMESTAMP(6),'POSTED',?,?,?)",
        [
          code,
          request.type,
          request.id,
          request.warehouse_id,
          user.id,
          body.note || null,
          key,
          body.task_id,
        ],
      );
      for (const line of accepted) {
        const [detail] = await connection.execute(
          "INSERT INTO stock_document_lines (stock_document_id,stock_request_line_id,lot_id,location_id,quality_bucket,quantity,difference_reason,allocation_id) VALUES (?,?,?,?,'AVAILABLE',?,?,?)",
          [
            created.insertId,
            line.stock_request_line_id,
            line.lot_id,
            line.location_id,
            line.quantity,
            line.difference_reason || null,
            line.allocation_id,
          ],
        );
        const delta =
          request.type === "IN" ? C.qty(line.quantity) : -C.qty(line.quantity);
        if (request.type === "IN")
          await connection.execute(
            "INSERT INTO inventory_balances (lot_id,location_id,quality_bucket,quantity,version) VALUES (?,?,'AVAILABLE',?,1) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity),version=version+1",
            [line.lot_id, line.location_id, line.quantity],
          );
        else
          await connection.execute(
            "UPDATE inventory_balances SET quantity=quantity-?,version=version+1 WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE'",
            [line.quantity, line.lot_id, line.location_id],
          );
        await connection.execute(
          "INSERT INTO inventory_movements (lot_id,location_id,quality_bucket,quantity_delta,stock_document_line_id,exception_proposal_id,stocktake_line_id,posted_at,created_by,operation_key) VALUES (?,?, 'AVAILABLE', ?, ?,NULL,NULL,UTC_TIMESTAMP(6),?,?)",
          [
            line.lot_id,
            line.location_id,
            C.decimal(delta),
            detail.insertId,
            user.id,
            `stock-document-${created.insertId}-${detail.insertId}`,
          ],
        );
        await connection.execute(
          "UPDATE stock_allocations SET posted_quantity=posted_quantity+? WHERE id=?",
          [line.quantity, line.allocation_id],
        );
      }
      const [[taskRemaining]] = await connection.execute(
        "SELECT COUNT(*) AS total FROM stock_allocations WHERE task_id=? AND posted_quantity<quantity",
        [body.task_id],
      );
      await connection.execute(
        "UPDATE tasks SET status=?,version=version+1 WHERE id=?",
        [
          Number(taskRemaining.total) ? "IN_PROGRESS" : "COMPLETED",
          body.task_id,
        ],
      );
      const [requestLines] = await connection.execute(
        "SELECT l.id,l.quantity,COALESCE(SUM(dl.quantity),0) AS posted FROM stock_request_lines l LEFT JOIN stock_document_lines dl ON dl.stock_request_line_id=l.id WHERE l.stock_request_id=? GROUP BY l.id",
        [request.id],
      );
      const allDone = requestLines.every(
        (line) =>
          C.qty(String(line.quantity)) === C.qty(String(line.posted), false),
      );
      await connection.execute(
        "UPDATE stock_requests SET status=?,version=version+1 WHERE id=?",
        [allDone ? "FULFILLED" : "PARTIALLY_FULFILLED", request.id],
      );
      if(request.production_source_mode==='MANUAL')await require('../stock-requests/partial-progress').refresh(connection,accepted.map(l=>l.lot_id));
      if (request.purpose === "PURCHASE_RECEIPT") {
        const [purchaseLines] = await connection.execute(
          "SELECT pl.id,pl.quantity,COALESCE(SUM(CASE WHEN d.type='IN' THEN dl.quantity ELSE 0 END),0) AS posted FROM purchase_order_lines pl LEFT JOIN lots l ON l.purchase_order_line_id=pl.id LEFT JOIN stock_document_lines dl ON dl.lot_id=l.id LEFT JOIN stock_documents d ON d.id=dl.stock_document_id WHERE pl.purchase_order_id=? GROUP BY pl.id",
          [request.purchase_order_id],
        );
        const purchaseDone =
          purchaseLines.length &&
          purchaseLines.every(
            (line) =>
              C.qty(String(line.quantity)) ===
              C.qty(String(line.posted), false),
          );
        await connection.execute(
          "UPDATE purchase_orders SET status=?,version=version+1 WHERE id=?",
          [
            purchaseDone ? "RECEIVED" : "PARTIALLY_RECEIVED",
            request.purchase_order_id,
          ],
        );
      }
      if (request.purpose === "SALE_ISSUE") {
        const [[plan]] = await connection.execute(
          "SELECT * FROM business_plans WHERE id=? FOR UPDATE",
          [request.business_plan_id],
        );
        C.fail(
          !plan || !["APPROVED", "IN_PROGRESS"].includes(plan.status),
          "INVALID_STATE",
          "Kế hoạch bán không còn hiệu lực.",
          409,
        );
        const [[order]] = await connection.execute(
          "SELECT * FROM customer_orders WHERE id=? FOR UPDATE",
          [plan.customer_order_id],
        );
        C.fail(
          !order || !["APPROVED", "IN_PROGRESS"].includes(order.status),
          "INVALID_STATE",
          "Đơn khách không còn được giao.",
          409,
        );
        const [delivery] = await connection.execute(
          "SELECT ol.item_id,ol.quantity,COALESCE((SELECT SUM(dl.quantity) FROM stock_document_lines dl JOIN lots lot ON lot.id=dl.lot_id JOIN stock_documents d ON d.id=dl.stock_document_id JOIN stock_requests r ON r.id=d.stock_request_id JOIN business_plans p ON p.id=r.business_plan_id WHERE r.purpose='SALE_ISSUE' AND d.type='OUT' AND p.customer_order_id=ol.customer_order_id AND lot.item_id=ol.item_id),0) AS delivered FROM customer_order_lines ol WHERE ol.customer_order_id=?",
          [order.id],
        );
        C.fail(
          delivery.some(
            (l) =>
              C.qty(String(l.delivered), false) > C.qty(String(l.quantity)),
          ),
          "SOURCE_LIMIT_EXCEEDED",
          "Lượng giao vượt đơn khách.",
          409,
        );
        const completed =
          delivery.length &&
          delivery.every(
            (l) =>
              C.qty(String(l.delivered), false) === C.qty(String(l.quantity)),
          );
        await connection.execute(
          "UPDATE customer_orders SET status=?,version=version+1 WHERE id=?",
          [completed ? "COMPLETED" : "IN_PROGRESS", order.id],
        );
        // Kế hoạch bán chỉ hoàn thành khi mọi dòng kế hoạch đã giao đủ (cộng mọi phiếu xuất bán của kế hoạch),
        // không phải khi riêng yêu cầu này xong — kế hoạch có thể giao làm nhiều yêu cầu.
        const [planLines] = await connection.execute(
          "SELECT l.item_id,SUM(l.quantity) AS quantity,COALESCE((SELECT SUM(dl.quantity) FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id JOIN stock_requests r ON r.id=d.stock_request_id JOIN lots lot ON lot.id=dl.lot_id WHERE r.business_plan_id=l.business_plan_id AND r.purpose='SALE_ISSUE' AND d.type='OUT' AND lot.item_id=l.item_id),0) AS delivered FROM business_plan_lines l WHERE l.business_plan_id=? GROUP BY l.business_plan_id,l.item_id",
          [plan.id],
        );
        const planDone =
          planLines.length &&
          planLines.every(
            (l) => C.qty(String(l.delivered), false) >= C.qty(String(l.quantity)),
          );
        await connection.execute(
          "UPDATE business_plans SET status=?,version=version+1 WHERE id=?",
          [planDone ? "COMPLETED" : "IN_PROGRESS", plan.id],
        );
      }
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-documents',?,'POST',?,?)",
        [
          user.id,
          created.insertId,
          JSON.stringify({ code, stock_request_id: request.id }),
          requestIdHeader,
        ],
      );
      const result = await this.document(user, created.insertId, connection);
      await connection.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?,'stock-documents',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id WHERE u.status='ACTIVE' AND (ro.code='DIRECTOR' OR (ro.code='WAREHOUSE_MANAGER' AND u.id=?) OR (ro.code='WORKSHOP_OWNER' AND EXISTS(SELECT 1 FROM workshop_users wu WHERE wu.user_id=u.id AND wu.workshop_id=?))) ON DUPLICATE KEY UPDATE id=notifications.id",['Phiếu '+(request.type==='IN'?'nhập':'xuất')+' kho mới: '+code,'Nhân viên đã ghi lượng thực tế; hồ sơ kho được cập nhật.',created.insertId,'stock-document-'+created.insertId+'-posted',request.manager_id,request.workshop_id]);
      await connection.execute(
        "UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?",
        [JSON.stringify(result), record.id],
      );
      return result;
    });
  }
}

function normalize(row) {
  const result = { ...row };
  for (const field of Object.keys(result))
    if (field === "id" || field.endsWith("_id"))
      result[field] = result[field] == null ? null : String(result[field]);
  result.posted_at = asDate(result.posted_at);
  return result;
}
module.exports = WarehouseFlowService;
