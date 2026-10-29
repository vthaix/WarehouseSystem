const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");
const recordCode = require("../../shared/record-code");

const isId = (value) => /^[1-9]\d*$/.test(String(value));
const sources = {
  PURCHASE_RECEIPT: {
    type: "IN",
    field: "purchase_order_id",
    table: "purchase_orders",
    lines: "purchase_order_lines",
    lineKey: "purchase_order_id",
    states: ["PENDING", "PARTIALLY_RECEIVED"],
    kind: "MATERIAL",
  },
  SALE_ISSUE: {
    type: "OUT",
    field: "business_plan_id",
    table: "business_plans",
    lines: "business_plan_lines",
    lineKey: "business_plan_id",
    states: ["APPROVED", "IN_PROGRESS"],
    kind: "FINISHED_PRODUCT",
  },
  PRODUCTION_ISSUE: {
    type: "OUT",
    field: "production_report_id",
    table: "production_reports",
    lines: "production_report_lines",
    lineKey: "production_report_id",
    quantity: "required_quantity",
    states: ["SUBMITTED"],
    kind: "MATERIAL",
  },
  PRODUCTION_RECEIPT: {
    type: "IN",
    field: "production_report_id",
    table: "finished_reports",
    lines: "report_details",
    lineKey: "production_report_id",
    states: ["SUBMITTED"],
    kind: "FINISHED_PRODUCT",
  },
  MATERIAL_PURCHASE: {
    type: "PROCUREMENT",
    field: "production_report_id",
    table: "production_reports",
    lines: "production_report_lines",
    lineKey: "production_report_id",
    quantity: "required_quantity",
    states: ["SUBMITTED"],
    kind: "MATERIAL",
  },
};
const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

class StockRequestService {
  constructor(pool) {
    this.pool = pool;
  }
  async workflowSources(user){return require('./request-workflow').options(this.pool,user);}

  visible(user, row) {
    if (
      user.roles.includes("WAREHOUSE_MANAGER") ||
      user.roles.includes("DIRECTOR")
    )
      return true;
    if (user.roles.includes("WORKSHOP_OWNER"))
      return user.workshop_ids.includes(String(row.workshop_id));
    if (user.roles.includes("PLANNER"))
      return row.purpose === "MATERIAL_PURCHASE";
    return (
      user.roles.includes("WAREHOUSE_STAFF") &&
      row.assignee_ids?.includes(String(user.id))
    );
  }

  present(user, row) {
    const result = { ...row };
    for (const field of [
      "id",
      "purchase_order_id",
      "business_plan_id",
      "production_plan_id",
      "production_report_id",
      "workshop_id",
      "warehouse_id",
      "created_by",
      "manager_id",
    ])
      if (result[field] != null) result[field] = String(result[field]);
    result.requested_date = asDate(result.requested_date);
    result.requested_at=result.ThoiDiemThucHien?new Date(result.ThoiDiemThucHien).toISOString():null;
    delete result.ThoiDiemThucHien;
    result.actions = [];
    if (
      user.roles.includes("WORKSHOP_OWNER") &&
      user.workshop_ids.includes(String(result.workshop_id)) &&
      result.status === "PENDING"
    )
      result.actions.push(...(result.production_source_mode==='MANUAL'?['delete']:['edit','delete']));
    if (
      user.roles.includes("WAREHOUSE_MANAGER") &&
      String(result.manager_id) === String(user.id) &&
      result.purpose !== "MATERIAL_PURCHASE" &&
      ["PENDING", "PARTIALLY_FULFILLED"].includes(result.status)
    )
      result.actions.push("dispatch");
    delete result.assignee_ids;
    return result;
  }

  async list(user, query = {}) {
    P.role(user, P.read["stock-requests"]);
    C.fields(query, ["page", "per_page", "q", "status", "purpose", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = [],
      params = [];
    if (
      user.roles.includes("WORKSHOP_OWNER") &&
      !user.roles.includes("WAREHOUSE_MANAGER") &&
      !user.roles.includes("DIRECTOR")
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
      user.roles.includes("PLANNER") &&
      !user.roles.includes("WAREHOUSE_MANAGER") &&
      !user.roles.includes("DIRECTOR")
    )
      where.push("r.purpose='MATERIAL_PURCHASE'");
    else if (
      user.roles.includes("WAREHOUSE_STAFF") &&
      !user.roles.includes("WAREHOUSE_MANAGER") &&
      !user.roles.includes("DIRECTOR")
    ) {
      where.push(
        "EXISTS (SELECT 1 FROM stock_allocations a WHERE a.stock_request_id=r.id AND a.user_id=?)",
      );
      params.push(user.id);
    }
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("r.code LIKE ?");
      params.push(`%${query.q}%`);
    }
    if (query.status) {
      C.fail(
        !["PENDING", "PARTIALLY_FULFILLED", "FULFILLED", "CANCELLED"].includes(
          query.status,
        ),
        "VALIDATION_ERROR",
        "Trạng thái không hợp lệ.",
      );
      where.push("r.status=?");
      params.push(query.status);
    }
    if (query.purpose) {
      C.fail(
        !sources[query.purpose],
        "VALIDATION_ERROR",
        "Phương thức không hợp lệ.",
      );
      where.push("r.purpose=?");
      params.push(query.purpose);
    }
    C.fail(
      query.sort && query.sort !== "newest",
      "VALIDATION_ERROR",
      "Cách sắp xếp không hợp lệ.",
    );
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM stock_requests r" + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT r.* FROM stock_requests r" +
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

  async load(connection, user, id, locked = false) {
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
    const [rows] = await connection.execute(
      "SELECT * FROM stock_requests WHERE id=?" + (locked ? " FOR UPDATE" : ""),
      [id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy yêu cầu kho.", 404);
    const row = rows[0];
    if (
      user.roles.includes("WAREHOUSE_STAFF") &&
      !user.roles.includes("WAREHOUSE_MANAGER") &&
      !user.roles.includes("DIRECTOR")
    ) {
      const [assignments] = await connection.execute(
        "SELECT id FROM stock_allocations WHERE stock_request_id=? AND user_id=? LIMIT 1",
        [id, user.id],
      );
      row.assignee_ids = assignments.length ? [String(user.id)] : [];
    }
    C.fail(
      !this.visible(user, row),
      "NOT_FOUND",
      "Không tìm thấy yêu cầu kho.",
      404,
    );
    return row;
  }

  async get(user, id, connection = this.pool) {
    P.role(user, P.read["stock-requests"]);
    const row = await this.load(connection, user, id);
    const [lines] = await connection.execute(
      "SELECT l.*,i.code AS item_code,i.name AS item_name,u.name AS unit FROM stock_request_lines l JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id WHERE l.stock_request_id=? ORDER BY l.id",
      [id],
    );
    const [posted] = await connection.execute(
      "SELECT dl.stock_request_line_id,SUM(dl.quantity) AS quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE d.stock_request_id=? GROUP BY dl.stock_request_line_id",
      [id],
    );
    const done = new Map(
      posted.map((line) => [
        String(line.stock_request_line_id),
        C.qty(String(line.quantity), false),
      ]),
    );
    const qcByItem=new Map();
    if(row.production_source_mode==='MANUAL') {
      const [quality]=await connection.execute('SELECT l.item_id,q.passed_quantity,q.failed_quantity FROM lots l LEFT JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.production_receipt_request_id=?',[id]);
      for(const q of quality)qcByItem.set(String(q.item_id),q);
    }
    const result = {
      ...this.present(user, row),
      source_lots:await require('./request-workflow').lots(connection,row),
      lines: lines.map((line) => ({
        ...line,
        id: String(line.id),
        stock_request_id: String(line.stock_request_id),
        item_id: String(line.item_id),
        fulfilled_quantity: C.decimal(done.get(String(line.id)) || 0n),
        remaining_quantity: C.decimal(
          C.qty(String(qcByItem.get(String(line.item_id))?.passed_quantity ?? line.quantity),false) - (done.get(String(line.id)) || 0n),
        ),
        ...(row.production_source_mode==='MANUAL'?{qc_passed_quantity:qcByItem.get(String(line.item_id))?.passed_quantity??null,qc_failed_quantity:qcByItem.get(String(line.item_id))?.failed_quantity??null}:{}),
      })),
    };
    if(row.production_source_mode==='MANUAL') {
      const [lots]=await connection.execute('SELECT id,code AS lot_code,lot_header_id,item_id,received_quantity,manufactured_date,expiry_date,qc_status FROM lots WHERE production_receipt_request_id=? ORDER BY id',[id]);
      result.lots=lots.map(l=>({...l,id:String(l.id),lot_header_id:String(l.lot_header_id),item_id:String(l.item_id),manufactured_date:asDate(l.manufactured_date),expiry_date:asDate(l.expiry_date)}));
    }
    if (user.roles.includes("WAREHOUSE_STAFF")) {
      const [tasks] = await connection.execute(
        "SELECT DISTINCT t.id FROM tasks t JOIN task_assignments a ON a.task_id=t.id WHERE t.stock_request_id=? AND a.user_id=? AND t.status IN ('PLANNED','IN_PROGRESS') ORDER BY t.id LIMIT 1",
        [id, user.id],
      );
      if (tasks.length) {
        result.assigned_task_id = String(tasks[0].id);
        result.actions.push("post");
      }
    }
    return result;
  }

  definition(purpose, mode = "REPORT") {
    if(purpose==='PRODUCTION_RECEIPT'&&mode==='MANUAL')return {type:'IN',field:'production_plan_id',table:'production_plans',lines:'production_plan_outputs',lineKey:'production_plan_id',states:['APPROVED','IN_PROGRESS','COMPLETED'],kind:'FINISHED_PRODUCT'};
    return purpose === "PRODUCTION_ISSUE" && mode === "PLAN" ? {type:"OUT",field:"production_plan_id",table:"production_plans",lines:"production_plan_materials",lineKey:"production_plan_id",quantity:"required_quantity",states:["APPROVED","IN_PROGRESS"],kind:"MATERIAL"} : sources[purpose];
  }

  async source(connection, purpose, sourceId, workshopId, mode = "REPORT") {
    const definition = this.definition(purpose, mode);
    C.fail(
      !definition || !isId(sourceId),
      "VALIDATION_ERROR",
      "Nguồn yêu cầu không hợp lệ.",
    );
    const [rows] = await connection.execute(
      `SELECT * FROM ${definition.table} WHERE id=? FOR UPDATE`,
      [sourceId],
    );
    C.fail(
      !rows.length || !definition.states.includes(rows[0].status),
      "INVALID_STATE",
      "Nguồn chưa sẵn sàng hoặc đã hoàn tất.",
      409,
    );
    const source = rows[0];
    C.fail(['PRODUCTION_ISSUE','MATERIAL_PURCHASE'].includes(purpose)&&mode!=='PLAN'&&source.report_purpose!=='NHU_CAU','INVALID_STATE','Báo cáo tiến độ/sự cố không phải nguồn nhu cầu nguyên vật liệu.',409);
    if ((purpose === "PRODUCTION_ISSUE" && mode === "PLAN") || (purpose==='PRODUCTION_RECEIPT'&&mode==='MANUAL')) source.production_plan_id = source.id;
    let sourceWorkshop = null;
    if (
      ["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT", "MATERIAL_PURCHASE"].includes(
        purpose,
      )
    ) {
      const [plans] = await connection.execute(
        "SELECT p.workshop_id FROM production_plans p WHERE p.id=? FOR UPDATE",
        [source.production_plan_id],
      );
      sourceWorkshop = plans[0]?.workshop_id;
    }
    if (purpose === "PURCHASE_RECEIPT") {
      const [plans] = await connection.execute(
        "SELECT COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id) AS workshop_id FROM business_plans p LEFT JOIN production_reports pr ON pr.id=p.production_report_id LEFT JOIN production_plans ps ON ps.id=pr.production_plan_id LEFT JOIN stock_requests r ON r.id=p.source_request_id LEFT JOIN production_plans s ON s.id=p.production_plan_id WHERE p.id=?",
        [source.business_plan_id],
      );
      sourceWorkshop = plans[0]?.workshop_id || null;
    }
    C.fail(
      sourceWorkshop && String(sourceWorkshop) !== String(workshopId),
      "VALIDATION_ERROR",
      "Xưởng không khớp nguồn.",
    );
    if (purpose === "SALE_ISSUE")
      C.fail(
        source.type !== "SALE",
        "VALIDATION_ERROR",
        "Kế hoạch phải là kế hoạch bán.",
      );
    if (purpose === 'SALE_ISSUE') await require('./sale-readiness').saleReadiness(connection,source.id,workshopId);
    const quantityField = definition.quantity || "quantity";
    const [sourceLines] = await connection.execute(
      `SELECT item_id,${quantityField} AS quantity${purpose === "MATERIAL_PURCHASE" ? ",available_quantity" : ""} FROM ${definition.lines} WHERE ${definition.lineKey}=?${purpose === "PRODUCTION_RECEIPT" && mode!=='MANUAL' ? " AND detail_kind='THANH_PHAM'" : ""}`,
      [sourceId],
    );
    const limits = new Map(
      sourceLines.map((line) => [
        String(line.item_id),
        purpose === "MATERIAL_PURCHASE"
          ? C.qty(String(line.quantity)) -
            C.qty(String(line.available_quantity), false)
          : C.qty(String(line.quantity)),
      ]),
    );
    if(purpose==='PURCHASE_RECEIPT'||(purpose==='PRODUCTION_RECEIPT'&&source.KieuThanhPham==='PART')){
      const [passed]=await connection.execute(purpose==='PURCHASE_RECEIPT'
        ?"SELECT l.item_id,SUM(q.passed_quantity) AS quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED' JOIN purchase_order_lines p ON p.id=l.purchase_order_line_id WHERE p.purchase_order_id=? GROUP BY l.item_id"
        :"SELECT l.item_id,SUM(q.passed_quantity) AS quantity FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id JOIN qc_inspection_lines q ON q.lot_id=l.id JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED' WHERE o.finished_report_id=? GROUP BY l.item_id",[sourceId]);
      const quality=new Map(passed.map(l=>[String(l.item_id),C.qty(String(l.quantity),false)]));
      for(const [item,amount]of limits){const good=quality.get(item)||0n;limits.set(item,good<amount?good:amount);}
    }
    if (purpose === "PRODUCTION_ISSUE" && mode === "PLAN") {
      const [actual] = await connection.execute("SELECT l.item_id,l.required_quantity FROM production_report_lines l JOIN production_reports r ON r.id=l.production_report_id WHERE r.production_plan_id=? AND r.status='SUBMITTED'", [sourceId]);
      if (actual.length) {
        const reported=new Map(actual.map(l=>[String(l.item_id),C.qty(String(l.required_quantity))]));
        for (const [item,quantity] of limits) limits.set(item,reported.has(item)?(reported.get(item)<quantity?reported.get(item):quantity):0n);
      }
    }
    return { definition, source, limits };
  }

  async validateLines(
    connection,
    purpose,
    lines,
    limits,
    sourceId,
    excludeId = null,
    sourceInfo = null,
  ) {
    C.fail(
      !Array.isArray(lines) || !lines.length || lines.length > 100,
      "VALIDATION_ERROR",
      "Yêu cầu cần 1 đến 100 dòng.",
    );
    const seen = new Set();
    for (const line of lines) {
      C.fields(line, ["item_id", "quantity", "note"]);
      C.fail(
        !isId(line.item_id) || seen.has(String(line.item_id)),
        "VALIDATION_ERROR",
        "Mặt hàng trùng hoặc không hợp lệ.",
      );
      seen.add(String(line.item_id));
      C.qty(line.quantity);
      if (line.note !== undefined) C.text(line.note, "note", 5000, false);
    }
    const definition = sourceInfo?.definition || sources[purpose];
    const aggregateByPlan = ['PRODUCTION_ISSUE','PRODUCTION_RECEIPT'].includes(purpose) && sourceInfo && !(purpose==='PRODUCTION_RECEIPT'&&sourceInfo.source.KieuThanhPham==='PART');
    const [allocated] = await connection.execute(
      `SELECT l.item_id,l.quantity FROM stock_request_lines l JOIN stock_requests r ON r.id=l.stock_request_id WHERE r.${aggregateByPlan ? "production_plan_id" : definition.field}=? AND r.purpose=? AND r.status<>'CANCELLED'${excludeId ? " AND r.id<>?" : ""} FOR UPDATE`,
      [aggregateByPlan ? sourceInfo.source.production_plan_id : sourceId, purpose, ...(excludeId ? [excludeId] : [])],
    );
    const remaining = new Map(limits);
    for (const line of [...allocated, ...lines]) {
      const key = String(line.item_id);
      const rest = (remaining.get(key) || 0n) - C.qty(String(line.quantity));
      C.fail(
        rest < 0n,
        "SOURCE_LIMIT_EXCEEDED",
        "Yêu cầu vượt số lượng nguồn.",
      );
      remaining.set(key, rest);
    }
    return lines.map((line) => ({
      item_id: String(line.item_id),
      quantity: C.decimal(C.qty(line.quantity)),
      note: line.note || null,
    }));
  }

  async manager(connection, id) {
    if (!id) return null;
    C.fail(!isId(id), "VALIDATION_ERROR", "Quản lý kho không hợp lệ.");
    const [rows] = await connection.execute(
      "SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.id=? AND u.status='ACTIVE' AND r.code='WAREHOUSE_MANAGER'",
      [id],
    );
    C.fail(
      !rows.length,
      "VALIDATION_ERROR",
      "Người được chọn không phải quản lý kho.",
    );
    return String(id);
  }

  async assertNotUsedForPurchase(connection, row) {
    if (row.purpose !== "MATERIAL_PURCHASE") return;
    const [plans] = await connection.execute(
      "SELECT id FROM business_plans WHERE source_request_id=? AND status NOT IN ('REJECTED','CANCELLED') LIMIT 1 FOR UPDATE",
      [row.id],
    );
    C.fail(
      plans.length,
      "IN_USE",
      "Yêu cầu đã được dùng để lập kế hoạch mua, không thể sửa hoặc hủy.",
      409,
    );
  }

  async create(user, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    if(body.workflow_source_id!==undefined){
      C.fields(body,['purpose','workflow_source_id','sale_plan_id','workshop_id','warehouse_id','manager_id','requested_date','requested_at','note','lines']);
      const {workflow_source_id,sale_plan_id,...rest}=body;
      const source=await require('./request-workflow').resolve(this.pool,user,body.purpose,workflow_source_id,body.workshop_id,sale_plan_id);
      return this.create(user,{...rest,...source},requestId);
    }
    if(body.purpose==='PRODUCTION_RECEIPT'&&body.production_source_mode==='MANUAL')return require('./partial-receipt').create(this,user,body,requestId);
    C.fields(body, [
      "purpose",
      "warehouse_id",
      "workshop_id",
      "manager_id",
      "requested_date",
      "requested_at",
      "purchase_order_id",
      "business_plan_id",
      "production_plan_id",
      "production_report_id",
      "production_source_mode",
      "note",
      "lines",
    ]);
    const mode=body.production_source_mode || "REPORT";
    C.fail(!["PLAN","REPORT"].includes(mode) || (mode === "PLAN" && body.purpose !== "PRODUCTION_ISSUE"), "VALIDATION_ERROR", "Nguồn sản xuất không hợp lệ.");
    const definition = this.definition(body.purpose,mode);
    C.fail(
      !definition,
      "VALIDATION_ERROR",
      "Phương thức yêu cầu không hợp lệ.",
    );
    C.fail(
      !isId(body.workshop_id) ||
        !user.workshop_ids.includes(String(body.workshop_id)) ||
        !isId(body.warehouse_id),
      "FORBIDDEN",
      "Xưởng hoặc kho không hợp lệ.",
      403,
    );
    C.date(body.requested_date, "requested_date", true);
    const executionAt=require('./request-workflow').execution(body);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    for (const field of [
      "purchase_order_id",
      "business_plan_id",
      "production_plan_id",
      "production_report_id",
    ])
      C.fail(
        field !== definition.field && body[field] !== undefined,
        "VALIDATION_ERROR",
        "Chỉ chọn một nguồn yêu cầu.",
      );
    const sourceId = body[definition.field];
    const connection = await this.pool.getConnection();
    let id;
    try {
      await connection.beginTransaction();
      const [warehouses] = await connection.execute(
        "SELECT id FROM warehouses WHERE id=? AND is_active=1",
        [body.warehouse_id],
      );
      C.fail(!warehouses.length, "VALIDATION_ERROR", "Kho không hoạt động.");
      const managerId =
        body.purpose === "MATERIAL_PURCHASE"
          ? null
          : await this.manager(connection, body.manager_id);
      C.fail(
        body.purpose !== "MATERIAL_PURCHASE" && !managerId,
        "VALIDATION_ERROR",
        "Cần chỉ định quản lý kho.",
      );
      const source = await this.source(
        connection,
        body.purpose,
        sourceId,
        body.workshop_id,
        mode,
      );
      const lines = await this.validateLines(
        connection,
        body.purpose,
        body.lines,
        source.limits,
        sourceId,
        null,
        source,
      );
      const code = await recordCode.next(connection, 'stock_requests', 'YCK', `${body.purpose}-${source.source.code}`);
      const ids = {
        purchase_order_id: null,
        business_plan_id: null,
        production_plan_id: null,
        production_report_id: null,
        [definition.field]: sourceId,
      };
      if (["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT"].includes(body.purpose))
        ids.production_plan_id = source.source.production_plan_id;
      const [created] = await connection.execute(
        "INSERT INTO stock_requests (code,type,purpose,purchase_order_id,business_plan_id,production_plan_id,production_report_id,workshop_id,warehouse_id,created_by,manager_id,requested_date,status,note,version,production_source_mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'PENDING',?,1,?)",
        [
          code,
          definition.type,
          body.purpose,
          ids.purchase_order_id,
          ids.business_plan_id,
          ids.production_plan_id,
          ids.production_report_id,
          body.workshop_id,
          body.warehouse_id,
          user.id,
          managerId,
          body.requested_date,
          body.note || null,
          mode,
        ],
      );
      id = created.insertId;
      await connection.execute('UPDATE stock_requests SET ThoiDiemThucHien=? WHERE id=?',[executionAt,id]);
      for (const line of lines)
        await connection.execute(
          "INSERT INTO stock_request_lines (stock_request_id,item_id,quantity,note) VALUES (?,?,?,?)",
          [id, line.item_id, line.quantity, line.note],
        );
      if(managerId)await connection.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'stock-requests',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",[managerId,'Yêu cầu '+code+' cần phân công','Chủ xưởng đề nghị '+(definition.type==='IN'?'nhập':'xuất')+' kho; xem lô hàng và ngày giờ thực hiện.',id,'stock-request-'+id+'-created']);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,'CREATE',?,?)",
        [
          user.id,
          id,
          JSON.stringify({ code, purpose: body.purpose }),
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
      "requested_date",
      "requested_at",
      "warehouse_id",
      "manager_id",
      "note",
      "lines",
    ]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản yêu cầu.",
    );
    C.fail(
      !["requested_date", "requested_at", "warehouse_id", "manager_id", "note", "lines"].some(
        (field) => Object.hasOwn(body, field),
      ),
      "VALIDATION_ERROR",
      "Không có nội dung cần sửa.",
    );
    if (body.requested_date !== undefined)
      C.date(body.requested_date, "requested_date", true);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [source] = await connection.execute(
        "SELECT * FROM stock_requests WHERE id=?",
        [id],
      );
      C.fail(
        !source.length ||
          !user.workshop_ids.includes(String(source[0].workshop_id)),
        "NOT_FOUND",
        "Không tìm thấy yêu cầu.",
        404,
      );
      const definition = this.definition(source[0].purpose,source[0].production_source_mode);
      const executionAt=body.requested_date!==undefined||body.requested_at!==undefined?require('./request-workflow').execution(body,source[0]):null;
      C.fail(source[0].production_source_mode==='MANUAL','IMMUTABLE_RECEIPT','Đợt nhập đã ghi lô; hủy đợt chưa dùng rồi tạo lại thay vì sửa số lượng.',409);
      const sourceInfo = await this.source(
        connection,
        source[0].purpose,
        source[0][definition.field],
        source[0].workshop_id,
        source[0].production_source_mode,
      );
      const row = await this.load(connection, user, id, true);
      C.version(row, body.version);
      C.state(row, ["PENDING"]);
      await this.assertNotUsedForPurchase(connection, row);
      const [[tasks]] = await connection.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE stock_request_id=? AND status<>'CANCELLED'",
        [id],
      );
      C.fail(
        Number(tasks.total) > 0,
        "INVALID_STATE",
        "Yêu cầu đã được phân công.",
        409,
      );
      if (body.lines !== undefined) {
        const lines = await this.validateLines(
          connection,
          row.purpose,
          body.lines,
          sourceInfo.limits,
          row[definition.field],
          id,
          sourceInfo,
        );
        await connection.execute(
          "DELETE FROM stock_request_lines WHERE stock_request_id=?",
          [id],
        );
        for (const line of lines)
          await connection.execute(
            "INSERT INTO stock_request_lines (stock_request_id,item_id,quantity,note) VALUES (?,?,?,?)",
            [id, line.item_id, line.quantity, line.note],
          );
      }
      if (body.warehouse_id !== undefined) {
        C.fail(
          !isId(body.warehouse_id),
          "VALIDATION_ERROR",
          "Kho không hợp lệ.",
        );
        const [warehouses] = await connection.execute(
          "SELECT id FROM warehouses WHERE id=? AND is_active=1",
          [body.warehouse_id],
        );
        C.fail(!warehouses.length, "VALIDATION_ERROR", "Kho không hoạt động.");
      }
      const managerId =
        body.manager_id === undefined
          ? row.manager_id
          : await this.manager(connection, body.manager_id);
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
      if(executionAt)await connection.execute('UPDATE stock_requests SET ThoiDiemThucHien=? WHERE id=?',[executionAt,id]);
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stock-requests',?,'UPDATE',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ version: row.version }),
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

  async remove(user, id, body, requestId) {
    P.role(user, ["WORKSHOP_OWNER"]);
    C.fields(body, ["version"]);
    C.fail(
      !Number.isInteger(body.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản yêu cầu.",
    );
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const row = await this.load(connection, user, id, true);
      C.version(row, body.version);
      C.state(row, ["PENDING"]);
      await this.assertNotUsedForPurchase(connection, row);
      const [[tasks]] = await connection.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE stock_request_id=? AND status<>'CANCELLED'",
        [id],
      );
      C.fail(
        Number(tasks.total) > 0,
        "INVALID_STATE",
        "Yêu cầu đã được phân công.",
        409,
      );
      if(row.production_source_mode==='MANUAL') {
        const [used]=await connection.execute('SELECT o.id FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id WHERE l.production_receipt_request_id=? LIMIT 1',[id]);
        C.fail(used.length,'IN_USE','Đợt nhập đã được dùng trong báo cáo tổng kết.',409);
        const [quality]=await connection.execute("SELECT q.id FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id WHERE l.production_receipt_request_id=? UNION ALL SELECT q.lot_id FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id JOIN stocktakes s ON s.id=q.campaign_id WHERE l.production_receipt_request_id=? AND s.status IN ('PLANNED','IN_PROGRESS')",[id,id]);
        C.fail(quality.length,'IN_USE','Đợt nhập đã được lên lịch hoặc ghi kết quả QC, không hủy dữ liệu nguồn.',409);
      }
      await connection.execute(
        "UPDATE stock_requests SET status='CANCELLED',version=version+1 WHERE id=?",
        [id],
      );
      await connection.execute(
        "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stock-requests',?,'CANCEL',?,?,?)",
        [
          user.id,
          id,
          JSON.stringify({ status: row.status }),
          JSON.stringify({ status: "CANCELLED" }),
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
}

module.exports = StockRequestService;
