const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const asDate = (value) => value instanceof Date ? value.toISOString() : value;

class WarehouseFlowService {
  constructor(pool, requests) { this.pool = pool; this.requests = requests; }

  async transaction(work) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async preview(user, requestId, query = {}) {
    P.role(user, ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]);
    C.fields(query, ["task_id"]);
    if (query.task_id) C.fail(!isId(query.task_id), "VALIDATION_ERROR", "Công việc không hợp lệ.");
    const request = await this.requests.load(this.pool, user, requestId);
    C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không ghi phiếu kho.", 409);
    C.fail(user.roles.includes("WAREHOUSE_MANAGER") && String(request.manager_id) !== String(user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);
    const detail = await this.requests.get(user, requestId);
    const [locations] = await this.pool.execute("SELECT id,code,name FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 ORDER BY id", [request.warehouse_id]);
    const [lots] = await this.pool.execute("SELECT l.id,l.code,l.item_id,l.received_quantity,l.qc_status,q.passed_quantity,COALESCE((SELECT SUM(d.quantity) FROM stock_document_lines d JOIN stock_documents doc ON doc.id=d.stock_document_id WHERE d.lot_id=l.id AND doc.type='IN'),0) AS posted_quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED' WHERE l.qc_status IN ('PASSED','PARTIAL') ORDER BY l.id LIMIT 500");
    const [balances] = await this.pool.execute("SELECT b.lot_id,b.location_id,b.quality_bucket,b.quantity FROM inventory_balances b JOIN warehouse_locations loc ON loc.id=b.location_id WHERE loc.warehouse_id=?", [request.warehouse_id]);
    const [allocations] = await this.pool.execute("SELECT * FROM stock_allocations WHERE stock_request_id=?" + (query.task_id ? " AND task_id=?" : ""), query.task_id ? [requestId, query.task_id] : [requestId]);
    const visibleAllocations = allocations.filter((row) => user.roles.includes("WAREHOUSE_MANAGER") || String(row.user_id) === String(user.id));
    const frozen = (await this.pool.execute("SELECT sw.id FROM stocktake_warehouses sw JOIN stocktakes s ON s.id=sw.stocktake_id WHERE sw.warehouse_id=? AND sw.status='COUNTING' AND s.campaign_type='COUNT' LIMIT 1", [request.warehouse_id]))[0].length > 0;
    return {
      request: detail,
      frozen,
      lines: detail.lines.filter((line) => user.roles.includes("WAREHOUSE_MANAGER") || visibleAllocations.some((allocation) => String(allocation.stock_request_line_id) === line.id)).map((line) => ({
        ...line,
        unit: "",
        lots: lots.filter((lot) => String(lot.item_id) === line.item_id && (user.roles.includes("WAREHOUSE_MANAGER") || visibleAllocations.some((allocation) => String(allocation.stock_request_line_id) === line.id && String(allocation.lot_id) === String(lot.id)))).map((row) => ({ ...row, id: String(row.id), item_id: String(row.item_id) })),
        locations: locations.filter((location) => user.roles.includes("WAREHOUSE_MANAGER") || visibleAllocations.some((allocation) => String(allocation.stock_request_line_id) === line.id && String(allocation.location_id) === String(location.id))).map((row) => ({ ...row, id: String(row.id) })),
        balances: balances.filter((balance) => lots.some((lot) => String(lot.id) === String(balance.lot_id) && String(lot.item_id) === line.item_id)).map((row) => ({ ...row, lot_id: String(row.lot_id), location_id: String(row.location_id) })),
      })),
      locations: locations.map((row) => ({ ...row, id: String(row.id) })),
      eligible_lots: lots.filter((lot) => detail.lines.some((line) => line.item_id === String(lot.item_id))).map((row) => ({ ...row, id: String(row.id), item_id: String(row.item_id) })),
      balances: balances.map((row) => ({ ...row, lot_id: String(row.lot_id), location_id: String(row.location_id) })),
      allocations: visibleAllocations.map(normalize),
    };
  }

  async dispatch(user, requestId, body, key, requestIdHeader) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fields(body, ["version", "start_at", "end_at", "allocations"]);
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản yêu cầu.");
    const start = Date.parse(body.start_at), end = Date.parse(body.end_at);
    C.fail(!Number.isFinite(start) || !Number.isFinite(end) || end <= start, "VALIDATION_ERROR", "Thời gian phân công không hợp lệ.");
    C.fail(!Array.isArray(body.allocations) || !body.allocations.length || body.allocations.length > 200, "VALIDATION_ERROR", "Phân công cần 1 đến 200 dòng.");
    C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
    const seen = new Set();
    for (const line of body.allocations) {
      C.fields(line, ["assignee_id", "stock_request_line_id", "lot_id", "location_id", "quality_bucket", "quantity"]);
      C.fail(["assignee_id", "stock_request_line_id", "lot_id", "location_id"].some((field) => !isId(line[field])) || line.quality_bucket !== "AVAILABLE", "VALIDATION_ERROR", "Phân công lô, vị trí hoặc nhân viên không hợp lệ.");
      C.qty(line.quantity);
      const tuple = [line.assignee_id, line.stock_request_line_id, line.lot_id, line.location_id, line.quality_bucket].join(":");
      C.fail(seen.has(tuple), "VALIDATION_ERROR", "Dòng phân công trùng.");
      seen.add(tuple);
    }
    const hash = crypto.createHash("sha256").update(JSON.stringify({ requestId: String(requestId), ...body })).digest("hex");
    return this.transaction(async (connection) => {
      await connection.execute("INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'stock-dispatch',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id", [user.id, key, hash]);
      const [[record]] = await connection.execute("SELECT * FROM idempotency_records WHERE user_id=? AND operation='stock-dispatch' AND idempotency_key=? FOR UPDATE", [user.id, key]);
      C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
      if (record.response_status === 200) return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
      const request = await this.requests.load(connection, user, requestId, true);
      C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);
      C.version(request, body.version); C.state(request, ["PENDING", "PARTIALLY_FULFILLED"]);
      C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không phân công kho.", 409);
      const detail = await this.requests.get(user, requestId, connection);
      const [old] = await connection.execute("SELECT stock_request_line_id,quantity,posted_quantity,lot_id,location_id FROM stock_allocations WHERE stock_request_id=?", [requestId]);
      const remaining = new Map(detail.lines.map((line) => [line.id, C.qty(line.remaining_quantity, false)]));
      for (const line of old) remaining.set(String(line.stock_request_line_id), (remaining.get(String(line.stock_request_line_id)) || 0n) - (C.qty(String(line.quantity)) - C.qty(String(line.posted_quantity), false)));
      const assignees = [...new Set(body.allocations.map((line) => String(line.assignee_id)))];
      const [users] = await connection.execute("SELECT DISTINCT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_STAFF' AND u.id IN (" + assignees.map(() => "?").join(",") + ")", assignees);
      C.fail(users.length !== assignees.length, "VALIDATION_ERROR", "Người được giao không phải nhân viên kho.");
      const lotIds = [...new Set(body.allocations.map((line) => String(line.lot_id)))].sort((a, b) => Number(a) - Number(b));
      const [lots] = await connection.execute("SELECT l.id,l.item_id,l.received_quantity,l.qc_status,l.purchase_order_line_id,l.production_plan_id,q.passed_quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.id IN (" + lotIds.map(() => "?").join(",") + ") ORDER BY l.id FOR UPDATE", lotIds);
      const lotMap = new Map(lots.map((lot) => [String(lot.id), lot]));
      const locationIds = [...new Set(body.allocations.map((line) => String(line.location_id)))];
      const [locations] = await connection.execute("SELECT id,warehouse_id FROM warehouse_locations WHERE is_active=1 AND id IN (" + locationIds.map(() => "?").join(",") + ")", locationIds);
      const locationMap = new Map(locations.map((row) => [String(row.id), row]));
      const newlyReserved = new Map();
      for (const line of body.allocations) {
        const requestLine = detail.lines.find((row) => row.id === String(line.stock_request_line_id));
        const lot = lotMap.get(String(line.lot_id));
        const location = locationMap.get(String(line.location_id));
        C.fail(!requestLine || !lot || !location || String(location.warehouse_id) !== String(request.warehouse_id) || String(lot.item_id) !== requestLine.item_id || !["PASSED", "PARTIAL"].includes(lot.qc_status), "VALIDATION_ERROR", "Lô hoặc vị trí không phù hợp yêu cầu.");
        if (request.purpose === "PURCHASE_RECEIPT") {
          const [source] = await connection.execute("SELECT id FROM purchase_order_lines WHERE id=? AND purchase_order_id=? AND item_id=?", [lot.purchase_order_line_id, request.purchase_order_id, lot.item_id]);
          C.fail(!source.length, "VALIDATION_ERROR", "Lô không thuộc đơn mua nguồn.");
        } else if (request.purpose === "PRODUCTION_RECEIPT") C.fail(String(lot.production_plan_id) !== String(request.production_plan_id), "VALIDATION_ERROR", "Lô không thuộc kế hoạch sản xuất.");
        const qty = C.qty(line.quantity);
        const rest = (remaining.get(requestLine.id) || 0n) - qty;
        C.fail(rest < 0n, "SOURCE_LIMIT_EXCEEDED", "Phân công vượt lượng yêu cầu còn lại.");
        remaining.set(requestLine.id, rest);
        if (request.type === "OUT") {
          const [balances] = await connection.execute("SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE' FOR UPDATE", [line.lot_id, line.location_id]);
          const available = balances.length ? C.qty(String(balances[0].quantity), false) : 0n;
          const [reserved] = await connection.execute("SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=? AND a.location_id=? AND a.quality_bucket='AVAILABLE' AND t.status<>'CANCELLED'", [line.lot_id, line.location_id]);
          const pending = C.qty(String(reserved[0].quantity), false);
          const reserveKey = `${line.lot_id}:${line.location_id}`;
          const newAmount = (newlyReserved.get(reserveKey) || 0n) + qty;
          C.fail(newAmount > available - pending, "INSUFFICIENT_STOCK", "Không đủ tồn khả dụng để phân công.", 409);
          newlyReserved.set(reserveKey, newAmount);
        } else {
          const [posted] = await connection.execute("SELECT COALESCE(SUM(dl.quantity),0) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE dl.lot_id=? AND d.type='IN'", [line.lot_id]);
          const [reserved] = await connection.execute("SELECT COALESCE(SUM(quantity-posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=? AND t.status<>'CANCELLED'", [line.lot_id]);
          const reserveKey = String(line.lot_id);
          const newAmount = (newlyReserved.get(reserveKey) || 0n) + qty;
          C.fail(newAmount > C.qty(String(lot.passed_quantity), false) - C.qty(String(posted[0].quantity), false) - C.qty(String(reserved[0].quantity), false), "SOURCE_LIMIT_EXCEEDED", "Lô không còn đủ lượng QC đạt để nhập.");
          newlyReserved.set(reserveKey, newAmount);
        }
      }
      const tasks = [];
      for (const assigneeId of assignees) {
        const code = "CVK-" + crypto.randomBytes(8).toString("hex").toUpperCase();
        const [created] = await connection.execute("INSERT INTO tasks (code,title,description,start_at,end_at,priority,status,stocktake_id,purchase_order_id,stock_request_id,task_type,manager_id,created_by,version) VALUES (?,?,?,?,?,'NORMAL','PLANNED',NULL,NULL,?,?,?, ?,1)", [code, `Xử lý yêu cầu kho ${request.code}`, null, new Date(start), new Date(end), requestId, `WAREHOUSE_${request.type}`, user.id, user.id]);
        await connection.execute("INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)", [created.insertId, assigneeId]);
        tasks.push({ id: String(created.insertId), assignee_id: assigneeId, code });
        for (const line of body.allocations.filter((entry) => String(entry.assignee_id) === assigneeId))
          await connection.execute("INSERT INTO stock_allocations (stock_request_id,task_id,stock_request_line_id,user_id,lot_id,location_id,quality_bucket,quantity,posted_quantity) VALUES (?,?,?,?,?,?,'AVAILABLE',?,0)", [requestId, created.insertId, line.stock_request_line_id, assigneeId, line.lot_id, line.location_id, C.decimal(C.qty(line.quantity))]);
      }
      await connection.execute("UPDATE stock_requests SET version=version+1 WHERE id=?", [requestId]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,'DISPATCH',?,?)", [user.id, requestId, JSON.stringify({ tasks, count: body.allocations.length }), requestIdHeader]);
      const result = { request_id: String(requestId), version: request.version + 1, tasks };
      await connection.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), record.id]);
      return result;
    });
  }

  async document(user, id, connection = this.pool) {
    P.role(user, P.read["stock-documents"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    const [rows] = await connection.execute("SELECT d.*,r.workshop_id,r.purpose,r.code AS stock_request_code FROM stock_documents d JOIN stock_requests r ON r.id=d.stock_request_id WHERE d.id=?", [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    const row = rows[0];
    C.fail(user.roles.includes("WORKSHOP_OWNER") && !user.workshop_ids.includes(String(row.workshop_id)), "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    C.fail(user.roles.includes("WAREHOUSE_STAFF") && !user.roles.includes("WAREHOUSE_MANAGER") && String(row.posted_by) !== String(user.id), "NOT_FOUND", "Không tìm thấy phiếu kho.", 404);
    const [lines] = await connection.execute("SELECT l.* FROM stock_document_lines l WHERE l.stock_document_id=? ORDER BY l.id", [id]);
    return { ...normalize(row), actions: [], lines: lines.map(normalize) };
  }

  async documents(user, query = {}) {
    P.role(user, P.read["stock-documents"]);
    C.fields(query, ["page", "per_page", "q", "type", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [], params = [];
    if (user.roles.includes("WORKSHOP_OWNER") && !user.roles.includes("DIRECTOR") && !user.roles.includes("WAREHOUSE_MANAGER")) {
      if (!user.workshop_ids.length) where.push("1=0");
      else { where.push("r.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")"); params.push(...user.workshop_ids); }
    } else if (user.roles.includes("WAREHOUSE_STAFF") && !user.roles.includes("WAREHOUSE_MANAGER") && !user.roles.includes("DIRECTOR")) { where.push("d.posted_by=?"); params.push(user.id); }
    if (query.q) { C.text(query.q, "q", 150); where.push("d.code LIKE ?"); params.push(`%${query.q}%`); }
    if (query.type) { C.fail(!["IN", "OUT"].includes(query.type), "VALIDATION_ERROR", "Loại phiếu không hợp lệ."); where.push("d.type=?"); params.push(query.type); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const base = " FROM stock_documents d JOIN stock_requests r ON r.id=d.stock_request_id" + (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total" + base, params);
    const [rows] = await this.pool.execute("SELECT d.*,r.workshop_id,r.purpose" + base + " ORDER BY d.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: rows.map((row) => ({ ...normalize(row), actions: [] })), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async post(user, body, key, requestIdHeader) {
    P.role(user, ["WAREHOUSE_STAFF"]);
    C.fields(body, ["stock_request_id", "request_version", "task_id", "note", "allocations"]);
    C.fail(!isId(body.stock_request_id) || !isId(body.task_id) || !Number.isInteger(body.request_version), "VALIDATION_ERROR", "Yêu cầu hoặc công việc không hợp lệ.");
    C.fail(!Array.isArray(body.allocations) || !body.allocations.length || body.allocations.length > 200, "VALIDATION_ERROR", "Phiếu kho cần 1 đến 200 dòng.");
    C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const seen = new Set();
    for (const line of body.allocations) {
      C.fields(line, ["allocation_id", "stock_request_line_id", "lot_id", "location_id", "quality_bucket", "quantity", "difference_reason"]);
      C.fail(["stock_request_line_id", "lot_id", "location_id"].some((field) => !isId(line[field])) || (line.allocation_id && !isId(line.allocation_id)) || line.quality_bucket !== "AVAILABLE", "VALIDATION_ERROR", "Dòng ghi sổ không hợp lệ.");
      C.qty(line.quantity);
      const tuple = [line.stock_request_line_id, line.lot_id, line.location_id, line.quality_bucket].join(":");
      C.fail(seen.has(tuple), "VALIDATION_ERROR", "Dòng ghi sổ trùng."); seen.add(tuple);
      if (line.difference_reason !== undefined) C.text(line.difference_reason, "difference_reason", 5000, false);
    }
    const hash = crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
    return this.transaction(async (connection) => {
      await connection.execute("INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'stock-post',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id", [user.id, key, hash]);
      const [[record]] = await connection.execute("SELECT * FROM idempotency_records WHERE user_id=? AND operation='stock-post' AND idempotency_key=? FOR UPDATE", [user.id, key]);
      C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
      if (record.response_status === 200) return typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
      const [requests] = await connection.execute("SELECT * FROM stock_requests WHERE id=? FOR UPDATE", [body.stock_request_id]);
      C.fail(!requests.length, "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
      const request = requests[0];
      C.version(request, body.request_version); C.state(request, ["PENDING", "PARTIALLY_FULFILLED"]);
      C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không ghi phiếu kho.", 409);
      const [taskRows] = await connection.execute("SELECT t.* FROM tasks t JOIN task_assignments a ON a.task_id=t.id WHERE t.id=? AND t.stock_request_id=? AND a.user_id=? FOR UPDATE", [body.task_id, body.stock_request_id, user.id]);
      C.fail(!taskRows.length || !["PLANNED", "IN_PROGRESS"].includes(taskRows[0].status), "FORBIDDEN", "Công việc không được giao hoặc đã hoàn tất.", 403);
      const [locks] = await connection.execute("SELECT sw.id FROM stocktake_warehouses sw JOIN stocktakes s ON s.id=sw.stocktake_id WHERE sw.warehouse_id=? AND sw.status='COUNTING' AND s.campaign_type='COUNT' LIMIT 1", [request.warehouse_id]);
      C.fail(locks.length, "WAREHOUSE_LOCKED", "Kho đang kiểm kê, chưa thể ghi sổ.", 409);
      const [assignments] = await connection.execute("SELECT a.*,l.item_id FROM stock_allocations a JOIN stock_request_lines l ON l.id=a.stock_request_line_id WHERE a.task_id=? AND a.user_id=? ORDER BY a.id FOR UPDATE", [body.task_id, user.id]);
      const used = new Set();
      const accepted = [];
      const newlyPosted = new Map();
      for (const line of body.allocations) {
        const assignment = assignments.find((row) => (line.allocation_id ? String(row.id) === String(line.allocation_id) : String(row.stock_request_line_id) === String(line.stock_request_line_id) && String(row.lot_id) === String(line.lot_id) && String(row.location_id) === String(line.location_id) && row.quality_bucket === line.quality_bucket));
        C.fail(!assignment || used.has(String(assignment.id)) || String(assignment.stock_request_line_id) !== String(line.stock_request_line_id) || String(assignment.lot_id) !== String(line.lot_id) || String(assignment.location_id) !== String(line.location_id), "FORBIDDEN", "Dòng không thuộc phân công của bạn.", 403);
        used.add(String(assignment.id));
        const quantity = C.qty(line.quantity);
        C.fail(quantity > C.qty(String(assignment.quantity)) - C.qty(String(assignment.posted_quantity), false), "SOURCE_LIMIT_EXCEEDED", "Vượt lượng phân công còn lại.");
        const [lots] = await connection.execute("SELECT l.*,q.passed_quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.id=? FOR UPDATE", [line.lot_id]);
        C.fail(!lots.length || String(lots[0].item_id) !== String(assignment.item_id) || !["PASSED", "PARTIAL"].includes(lots[0].qc_status), "INVALID_STATE", "Lô chưa đạt QC hoặc sai mặt hàng.", 409);
        const [locations] = await connection.execute("SELECT warehouse_id FROM warehouse_locations WHERE id=? AND is_active=1", [line.location_id]);
        C.fail(!locations.length || String(locations[0].warehouse_id) !== String(request.warehouse_id), "VALIDATION_ERROR", "Vị trí không thuộc kho.");
        if (request.type === "IN") {
          const [posted] = await connection.execute("SELECT COALESCE(SUM(dl.quantity),0) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE dl.lot_id=? AND d.type='IN'", [line.lot_id]);
          const lotKey = String(line.lot_id);
          const nextAmount = (newlyPosted.get(lotKey) || 0n) + quantity;
          C.fail(nextAmount > C.qty(String(lots[0].passed_quantity), false) - C.qty(String(posted[0].quantity), false), "SOURCE_LIMIT_EXCEEDED", "Vượt lượng QC đạt của lô.");
          newlyPosted.set(lotKey, nextAmount);
        } else {
          const [balance] = await connection.execute("SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE' FOR UPDATE", [line.lot_id, line.location_id]);
          C.fail(!balance.length || quantity > C.qty(String(balance[0].quantity), false), "INSUFFICIENT_STOCK", "Không đủ tồn khả dụng.", 409);
        }
        accepted.push({ ...line, allocation_id: assignment.id, quantity: C.decimal(quantity) });
      }
      const code = (request.type === "IN" ? "PN-" : "PX-") + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO stock_documents (code,type,stock_request_id,warehouse_id,posted_by,posted_at,status,note,idempotency_key,task_id) VALUES (?,?,?,?,?,UTC_TIMESTAMP(6),'POSTED',?,?,?)", [code, request.type, request.id, request.warehouse_id, user.id, body.note || null, key, body.task_id]);
      for (const line of accepted) {
        const [detail] = await connection.execute("INSERT INTO stock_document_lines (stock_document_id,stock_request_line_id,lot_id,location_id,quality_bucket,quantity,difference_reason,allocation_id) VALUES (?,?,?,?,'AVAILABLE',?,?,?)", [created.insertId, line.stock_request_line_id, line.lot_id, line.location_id, line.quantity, line.difference_reason || null, line.allocation_id]);
        const delta = request.type === "IN" ? C.qty(line.quantity) : -C.qty(line.quantity);
        if (request.type === "IN") await connection.execute("INSERT INTO inventory_balances (lot_id,location_id,quality_bucket,quantity,version) VALUES (?,?,'AVAILABLE',?,1) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity),version=version+1", [line.lot_id, line.location_id, line.quantity]);
        else await connection.execute("UPDATE inventory_balances SET quantity=quantity-?,version=version+1 WHERE lot_id=? AND location_id=? AND quality_bucket='AVAILABLE'", [line.quantity, line.lot_id, line.location_id]);
        await connection.execute("INSERT INTO inventory_movements (lot_id,location_id,quality_bucket,quantity_delta,stock_document_line_id,exception_proposal_id,stocktake_line_id,posted_at,created_by,operation_key) VALUES (?,?, 'AVAILABLE', ?, ?,NULL,NULL,UTC_TIMESTAMP(6),?,?)", [line.lot_id, line.location_id, C.decimal(delta), detail.insertId, user.id, `stock-document-${created.insertId}-${detail.insertId}`]);
        await connection.execute("UPDATE stock_allocations SET posted_quantity=posted_quantity+? WHERE id=?", [line.quantity, line.allocation_id]);
      }
      const [[taskRemaining]] = await connection.execute("SELECT COUNT(*) AS total FROM stock_allocations WHERE task_id=? AND posted_quantity<quantity", [body.task_id]);
      await connection.execute("UPDATE tasks SET status=?,version=version+1 WHERE id=?", [Number(taskRemaining.total) ? "IN_PROGRESS" : "COMPLETED", body.task_id]);
      const [requestLines] = await connection.execute("SELECT l.id,l.quantity,COALESCE(SUM(dl.quantity),0) AS posted FROM stock_request_lines l LEFT JOIN stock_document_lines dl ON dl.stock_request_line_id=l.id WHERE l.stock_request_id=? GROUP BY l.id", [request.id]);
      const allDone = requestLines.every((line) => C.qty(String(line.quantity)) === C.qty(String(line.posted), false));
      await connection.execute("UPDATE stock_requests SET status=?,version=version+1 WHERE id=?", [allDone ? "FULFILLED" : "PARTIALLY_FULFILLED", request.id]);
      if (request.purpose === "PURCHASE_RECEIPT") {
        const [purchaseLines] = await connection.execute("SELECT pl.id,pl.quantity,COALESCE(SUM(CASE WHEN d.type='IN' THEN dl.quantity ELSE 0 END),0) AS posted FROM purchase_order_lines pl LEFT JOIN lots l ON l.purchase_order_line_id=pl.id LEFT JOIN stock_document_lines dl ON dl.lot_id=l.id LEFT JOIN stock_documents d ON d.id=dl.stock_document_id WHERE pl.purchase_order_id=? GROUP BY pl.id", [request.purchase_order_id]);
        const purchaseDone = purchaseLines.length && purchaseLines.every((line) => C.qty(String(line.quantity)) === C.qty(String(line.posted), false));
        await connection.execute("UPDATE purchase_orders SET status=?,version=version+1 WHERE id=?", [purchaseDone ? "RECEIVED" : "PARTIALLY_RECEIVED", request.purchase_order_id]);
      }
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-documents',?,'POST',?,?)", [user.id, created.insertId, JSON.stringify({ code, stock_request_id: request.id }), requestIdHeader]);
      const result = await this.document(user, created.insertId, connection);
      await connection.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), record.id]);
      return result;
    });
  }
}

function normalize(row) {
  const result = { ...row };
  for (const field of Object.keys(result)) if (field === "id" || field.endsWith("_id")) result[field] = result[field] == null ? null : String(result[field]);
  result.posted_at = asDate(result.posted_at);
  return result;
}
module.exports = WarehouseFlowService;
