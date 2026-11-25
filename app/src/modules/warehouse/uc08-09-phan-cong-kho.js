const crypto = require("node:crypto");
const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const transaction = require("../../shared/transaction");
const codes = require("../../shared/readable-codes");
const positions = require("../../shared/assigned-positions");
const timeRules = require("../../shared/time-rules");
const allocationPlan = require("../../shared/warehouse-allocation-plan");
const check = require("./uc08-09-kiem-tra");

const amount = (value) => C.qty(String(value), false);
const isPending = (allocation) => amount(allocation.quantity) > amount(allocation.posted_quantity);
const unique = (values) => [...new Set(values)];

async function dispatchRequest(flow, user, requestId, body, key, auditId) {
  P.role(user, ["WAREHOUSE_MANAGER"]);
  const time = readInput(body, key);

  return transaction(flow.pool, async (db) => {
    const saved = await findSavedResult(db, user, requestId, body, key);
    if (saved.result) return saved.result;

    const request = await flow.requests.load(db, user, requestId, true);
    await check.warehouseNotCounting(db, request.warehouse_id);
    checkRequest(request, user, body.version);
    await check.productionSource(db, flow.requests, request);
    const detail = await flow.requests.get(user, requestId, db);
    const saleReportId = await check.saleSource(db, request);

    const current = await loadAllocations(db, requestId);
    checkStillEditable(request, current);

    let kept = current;
    if (body.allocation_mode === "REPLACE_PENDING") {
      if (current.length && allocationPlan.unchanged(current, body.allocations)) {
        const result = await confirmSame(db, user, request, requestId, current, time, auditId);
        return saveResult(db, saved.id, result);
      }
      kept = await cancelPending(db, user, requestId, current, auditId);
    }

    const assigneeIds = unique(body.allocations.map((line) => String(line.assignee_id)));
    await check.warehouseStaff(db, assigneeIds);
    if (!time.immediate) await check.noScheduleConflict(db, assigneeIds, time, requestId);
    await check.allocationLines(db, { request, detail, kept, lines: body.allocations, saleReportId });

    const tasks = [];
    for (const assigneeId of assigneeIds)
      tasks.push(await createTask(db, user, request, requestId, assigneeId, body.allocations, time));

    await db.execute("UPDATE stock_requests SET version=version+1 WHERE id=?", [requestId]);
    await audit(db, user, requestId, "DISPATCH", { tasks, count: body.allocations.length }, auditId);
    return saveResult(db, saved.id, { request_id: String(requestId), version: request.version + 1, tasks });
  });
}

function readInput(body, key) {
  C.fields(body, ["version", "start_at", "end_at", "allocations", "allocation_mode"]);
  C.fail(body.allocation_mode !== undefined && body.allocation_mode !== "REPLACE_PENDING",
    "VALIDATION_ERROR", "Cách lưu phân công không hợp lệ.");
  C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản yêu cầu.");
  const time = readTime(body);
  check.allocationCount(body.allocations);
  C.fail(typeof key !== "string" || key.length < 8 || key.length > 100, "VALIDATION_ERROR", "Cần Idempotency-Key hợp lệ.");
  check.allocationFormat(body.allocations);
  return time;
}

function readTime(body) {
  if (body.start_at === undefined && body.end_at === undefined)
    return { immediate: true, start: new Date(), end: new Date(Date.now() + 3600000) };
  const range = timeRules.range(body.start_at, body.end_at);
  return { immediate: false, start: new Date(range.start), end: new Date(range.end) };
}

async function findSavedResult(db, user, requestId, body, key) {
  const hash = crypto.createHash("sha256").update(JSON.stringify({ requestId: String(requestId), ...body })).digest("hex");
  await db.execute(
    "INSERT INTO idempotency_records (user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at)" +
      " VALUES (?,'stock-dispatch',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 1 DAY)) ON DUPLICATE KEY UPDATE id=id",
    [user.id, key, hash],
  );
  const [[record]] = await db.execute(
    "SELECT * FROM idempotency_records WHERE user_id=? AND operation='stock-dispatch' AND idempotency_key=? FOR UPDATE",
    [user.id, key],
  );
  C.fail(record.request_hash !== hash, "IDEMPOTENCY_CONFLICT", "Khóa yêu cầu đã dùng cho nội dung khác.", 409);
  if (record.response_status !== 200) return { id: record.id, result: null };
  const result = typeof record.response_body === "string" ? JSON.parse(record.response_body) : record.response_body;
  return { id: record.id, result };
}

async function saveResult(db, recordId, result) {
  await db.execute("UPDATE idempotency_records SET response_status=200,response_body=? WHERE id=?", [JSON.stringify(result), recordId]);
  return result;
}

function checkRequest(request, user, version) {
  C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Bạn không phụ trách yêu cầu này.", 403);
  C.version(request, version);
  C.state(request, ["PENDING", "PARTIALLY_FULFILLED"]);
  C.fail(request.purpose === "MATERIAL_PURCHASE", "INVALID_STATE", "Yêu cầu mua nguyên liệu không phân công kho.", 409);
}

function checkStillEditable(request, current) {
  const started = request.ThoiDiemThucHien && new Date(request.ThoiDiemThucHien).getTime() <= Date.now();
  C.fail(current.length > 0 && started, "INVALID_STATE", "Chỉ được sửa phân công trước ngày giờ thực hiện.", 409);
}

async function loadAllocations(db, requestId) {
  const [rows] = await db.execute(
    "SELECT a.*,t.code AS task_code FROM stock_allocations a JOIN tasks t ON t.id=a.task_id" +
      " WHERE a.stock_request_id=? AND t.status<>'CANCELLED'",
    [requestId],
  );
  return rows;
}

async function confirmSame(db, user, request, requestId, current, time, auditId) {
  const tasks = pendingTasks(current);
  if (!time.immediate) await check.noScheduleConflict(db, unique(tasks.map((task) => task.assignee_id)), time, requestId);

  const startNow = time.immediate ? "status='IN_PROGRESS'," : "";
  for (const task of tasks)
    await db.execute(
      `UPDATE tasks SET start_at=?,end_at=?,${startNow}version=version+1 WHERE id=? AND status IN ('PLANNED','IN_PROGRESS')`,
      [time.start, time.end, task.id],
    );
  await audit(db, user, requestId, "CONFIRM_DISPATCH", { tasks }, auditId);
  return { request_id: String(requestId), version: request.version, tasks };
}

function pendingTasks(allocations) {
  const tasks = new Map();
  for (const a of allocations.filter(isPending))
    tasks.set(String(a.task_id), { id: String(a.task_id), assignee_id: String(a.user_id), code: a.task_code });
  return [...tasks.values()];
}

async function cancelPending(db, user, requestId, current, auditId) {
  const taskIds = unique(current.filter(isPending).map((a) => String(a.task_id)));
  for (const taskId of taskIds)
    await db.execute(
      "UPDATE tasks SET status='CANCELLED',version=version+1 WHERE id=? AND stock_request_id=? AND status IN ('PLANNED','IN_PROGRESS')",
      [taskId, requestId],
    );
  if (taskIds.length) await audit(db, user, requestId, "REPLACE_PENDING_DISPATCH", { superseded_task_ids: taskIds }, auditId);
  return current.filter((a) => !taskIds.includes(String(a.task_id)));
}

async function createTask(db, user, request, requestId, assigneeId, allLines, time) {
  const task = await insertTask(db, user, request, requestId, time);
  await db.execute("INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)", [task.id, assigneeId]);

  const ownLines = allLines.filter((line) => String(line.assignee_id) === assigneeId);
  for (const line of ownLines) await insertAllocation(db, requestId, task.id, assigneeId, line);

  await notifyAssignee(db, request, assigneeId, task.id);
  return { id: String(task.id), assignee_id: assigneeId, code: task.code };
}

async function insertTask(db, user, request, requestId, time) {
  const prefix = request.type === "IN" ? "CV-NHAP" : "CV-XUAT";
  const code = await codes.next(db, "tasks", prefix, await codes.workshop(db, request.workshop_id));
  const [created] = await db.execute(
    "INSERT INTO tasks (code,title,description,start_at,end_at,priority,status,stocktake_id,purchase_order_id,stock_request_id,task_type,manager_id,created_by,version)" +
      " VALUES (?,?,?,?,?,'NORMAL',?,NULL,NULL,?,?,?, ?,1)",
    [code, `Xử lý yêu cầu kho ${request.code}`, null, time.start, time.end,
      time.immediate ? "IN_PROGRESS" : "PLANNED", requestId, `WAREHOUSE_${request.type}`, user.id, user.id],
  );
  return { id: created.insertId, code };
}

async function insertAllocation(db, requestId, taskId, assigneeId, line) {
  await db.execute(
    "INSERT INTO stock_allocations (stock_request_id,task_id,stock_request_line_id,user_id,lot_id,location_id,quality_bucket,quantity,posted_quantity)" +
      " VALUES (?,?,?,?,?,?,'AVAILABLE',?,0)",
    [requestId, taskId, line.stock_request_line_id, assigneeId, line.lot_id, line.location_id, C.decimal(C.qty(line.quantity))],
  );
}

async function notifyAssignee(db, request, assigneeId, taskId) {
  const isInbound = request.type === "IN";
  const where = positions.describe(await positions.load(db, { taskId }));
  const subject = "Phân công " + (isInbound ? "nhập" : "xuất") + " kho " + request.code;
  const text = "Vị trí " + (isInbound ? "nhập hàng" : "lấy hàng") + ": " + where +
    ". Đối chiếu giấy tờ và ghi lượng thực tế trong công việc được giao.";
  await db.execute(
    "INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'tasks',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",
    [assigneeId, subject, text.slice(0, 5000), taskId, "warehouse-task-" + taskId + "-assigned"],
  );
}

async function audit(db, user, requestId, action, data, auditId) {
  await db.execute(
    "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,?,?,?)",
    [user.id, requestId, action, JSON.stringify(data), auditId],
  );
}

async function cancelAllocation(flow, user, taskId, body, auditId) {
  P.role(user, ["WAREHOUSE_MANAGER"]);
  C.fields(body, ["version"]);
  const requestId = await findRequestOfTask(flow.pool, taskId);

  return transaction(flow.pool, async (db) => {
    const request = await flow.requests.load(db, user, requestId, true);
    C.fail(String(request.manager_id) !== String(user.id), "FORBIDDEN", "Không phụ trách yêu cầu.", 403);
    await db.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [request.warehouse_id]);
    const [[task]] = await db.execute("SELECT * FROM tasks WHERE id=? FOR UPDATE", [taskId]);
    C.version(task, body.version);
    C.state(task, ["PLANNED", "IN_PROGRESS"]);

    await db.execute("UPDATE tasks SET status='CANCELLED',version=version+1 WHERE id=?", [taskId]);
    await db.execute("UPDATE stock_requests SET version=version+1 WHERE id=?", [request.id]);
    await db.execute(
      "INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'tasks',?,'RELEASE_RESERVATION',?,?)",
      [user.id, taskId, JSON.stringify({ stock_request_id: String(request.id) }), auditId],
    );
    return { task_id: String(taskId), status: "CANCELLED" };
  });
}

async function findRequestOfTask(pool, taskId) {
  const [[task]] = await pool.execute("SELECT stock_request_id FROM tasks WHERE id=?", [taskId]);
  C.fail(!task?.stock_request_id, "NOT_FOUND", "Không tìm thấy phân công kho.", 404);
  return task.stock_request_id;
}

module.exports = { dispatchRequest, cancelAllocation };
