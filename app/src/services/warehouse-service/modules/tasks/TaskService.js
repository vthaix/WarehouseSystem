const crypto = require("node:crypto");
const C = require("../../../domain/core");
const P = require("../../../domain/policy");
const paginate = require("../../../../utils/pagination");
const isId = (v) => /^[1-9]\d*$/.test(String(v));
class TaskService {
  constructor(pool) {
    this.pool = pool;
  }
  async inspectionSources(user){P.role(user,['DIRECTOR']);return require('./inspection-task').sources(this.pool);}
  async transaction(work) {
    const c = await this.pool.getConnection();
    c.taskScheduleLocks = [];
    try {
      await c.beginTransaction();
      const result = await work(c);
      await c.commit();
      return result;
    } catch (e) {
      await c.rollback();
      throw e;
    } finally {
      try {
        for (const key of c.taskScheduleLocks) {
          await c.query("SELECT RELEASE_LOCK(?)", [key]);
        }
      } finally {
        c.release();
      }
    }
  }
  async counts(user,query={}) { P.role(user,['STOCKTAKER']);return this.list(user,query,true); }
  async setMinuteAuthor(user,id,b,requestId){
    P.role(user,['DIRECTOR']);C.fields(b,['version','minute_author_id']);
    await this.transaction(async c=>{
      const [[task]]=await c.execute('SELECT * FROM tasks WHERE id=? FOR UPDATE',[id]);
      C.fail(!task||task.task_type!=='LOT_INSPECTION','NOT_FOUND','Không tìm thấy công việc kiểm kê.',404);C.version(task,b.version);
      const [[campaign]]=await c.execute('SELECT * FROM stocktakes WHERE id=? FOR UPDATE',[task.stocktake_id]);
      C.fail(task.status==='CANCELLED'||campaign.BienBanTrangThai!=='DRAFT','INVALID_STATE','Chỉ phân công người lập trước khi gửi biên bản.',409);
      const [assigned]=await c.execute('SELECT user_id FROM task_assignments WHERE task_id=?',[id]);
      C.fail(!assigned.some(a=>String(a.user_id)===String(b.minute_author_id)),'VALIDATION_ERROR','Người lập biên bản phải thuộc danh sách được phân công.');
      await c.execute('UPDATE stocktakes SET NguoiLapBienBanDuocChon=?,version=version+1 WHERE id=?',[b.minute_author_id,task.stocktake_id]);
      await c.execute('UPDATE tasks SET version=version+1 WHERE id=?',[id]);
      await this.audit(c,user,id,'ASSIGN_MINUTE_AUTHOR',b,requestId);
    });return this.get(user,id);
  }
  async list(user, query = {}, countsOnly=false) {
    P.role(user, P.read.tasks);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query),
      params = [],
      where = [];
    if (!user.roles.includes("DIRECTOR")) {
      where.push(
        "(t.manager_id=? OR EXISTS(SELECT 1 FROM task_assignments a WHERE a.task_id=t.id AND a.user_id=?))",
      );
      params.push(user.id, user.id);
    }
    if(countsOnly)where.push("t.task_type='LOT_INSPECTION' AND EXISTS(SELECT 1 FROM stocktakes s WHERE s.id=t.stocktake_id AND s.KiemSoLuong=1)");
    if (query.q) {
      C.text(query.q, "q", 150);
      where.push("t.title LIKE ?");
      params.push("%" + query.q + "%");
    }
    if (query.status) {
      C.fail(
        !["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
          query.status,
        ),
        "VALIDATION_ERROR",
        "Trạng thái không hợp lệ.",
      );
      where.push("t.status=?");
      params.push(query.status);
    }
    const base =
      " FROM tasks t" + (where.length ? " WHERE " + where.join(" AND ") : "");
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total" + base,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT t.*" + base + " ORDER BY t.id DESC LIMIT ? OFFSET ?",
      [...params, String(per_page), String(offset)],
    );
    return {
      data: await Promise.all(rows.map((r) => this.get(user, String(r.id)))),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }
  async get(user, id, c = this.pool) {
    P.role(user, P.read.tasks);
    C.fail(!isId(id), "NOT_FOUND", "Không có công việc.", 404);
    const [rows] = await c.execute("SELECT * FROM tasks WHERE id=?", [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không có công việc.", 404);
    const row = rows[0];
    const [assigned] = await c.execute(
      "SELECT user_id FROM task_assignments WHERE task_id=? ORDER BY user_id",
      [id],
    );
    const ids = assigned.map((a) => String(a.user_id));
    C.fail(
      !user.roles.includes("DIRECTOR") &&
        String(row.manager_id) !== user.id &&
        !ids.includes(user.id),
      "NOT_FOUND",
      "Không có công việc.",
      404,
    );
    const actions = [];
    if (
      row.stock_request_id &&
      user.roles.includes("WAREHOUSE_MANAGER") &&
      String(row.manager_id) === String(user.id) &&
      ["PLANNED", "IN_PROGRESS"].includes(row.status)
    )
      actions.push("cancelAllocation");
    if (
      user.roles.includes("DIRECTOR") &&
      !row.stock_request_id &&
      (!row.stocktake_id||(row.task_type==='LOT_INSPECTION'&&row.status==='PLANNED')) &&
      !["COMPLETED", "CANCELLED"].includes(row.status)
    )
      actions.push("edit", "delete");
    if (
      !row.stock_request_id &&
      !row.stocktake_id &&
      ids.includes(user.id) &&
      ["PLANNED", "IN_PROGRESS"].includes(row.status)
    )
      actions.push("progress");
    if (
      row.stock_request_id &&
      ids.includes(user.id) &&
      ["PLANNED", "IN_PROGRESS"].includes(row.status)
    )
      actions.push("postTask");
    const inspection=row.task_type==='LOT_INSPECTION'?await new(require('../quality/QualityCampaignService'))(this.pool).get(user,row.stocktake_id,c):null;
    if(inspection){
      if(user.roles.includes('DIRECTOR')&&row.status!=='CANCELLED'&&inspection.BienBanTrangThai==='DRAFT')actions.push('assignMinuteAuthor');
      if(user.roles.includes('DIRECTOR')&&inspection.status==='PLANNED'){
        if(inspection.lot_ids.length)actions.push('startInspection');
        if(inspection.source_plan_id)actions.push('bindInspection');
      }
      if(user.roles.includes('QC_INSPECTOR')&&ids.includes(String(user.id))&&inspection.status==='IN_PROGRESS')actions.push('recordInspection');
      if(!inspection.KiemChatLuong){const i=actions.indexOf('recordInspection');if(i>=0)actions.splice(i,1);}
      if(inspection.KiemSoLuong&&user.roles.includes('STOCKTAKER')&&ids.includes(String(user.id))&&inspection.status==='IN_PROGRESS'&&inspection.lots.some(l=>l.counted_quantity===null))actions.push('recordCount');
    }
    return {
      ...row,
      ...(inspection?{inspection,inspection_type:inspection.quality_kind,inspection_lots:inspection.lots}:{}),
      id: String(row.id),
      assignee_ids: ids,
      minute_author_id:inspection?.NguoiLapBienBanDuocChon?String(inspection.NguoiLapBienBanDuocChon):null,
      start_at: row.start_at.toISOString(),
      end_at: row.end_at.toISOString(),
      actions,
    };
  }
  async validate(c, b, exclude = null) {
    C.text(b.title, "title", 200);
    C.text(b.description || "", "description", 5000, false);
    C.fail(
      !["LOW", "NORMAL", "HIGH"].includes(b.priority),
      "VALIDATION_ERROR",
      "Ưu tiên không hợp lệ.",
    );
    const start = new Date(b.start_at),
      end = new Date(b.end_at);
    C.fail(
      !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start,
      "VALIDATION_ERROR",
      "Khoảng thời gian không hợp lệ.",
    );
    const localDay = value => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh', year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
    C.fail(localDay(start) < C.today(), 'VALIDATION_ERROR', 'Ngày phân công không được trong quá khứ.');
    C.fail(
      !Array.isArray(b.assignee_ids) ||
        !b.assignee_ids.length ||
        b.assignee_ids.length > 50 ||
        new Set(b.assignee_ids).size !== b.assignee_ids.length ||
        b.assignee_ids.some((id) => !isId(id)),
      "VALIDATION_ERROR",
      "Danh sách phân công không hợp lệ.",
    );
    const ids = b.assignee_ids
      .map(String)
      .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
    // Identity rows are read-only to this service. Serialize assignments locally
    // without requiring UPDATE permission on the Identity database.
    const [[schema]] = await c.query("SELECT DATABASE() AS schedule_database");
    for (const id of ids) {
      const key =
        "task:" +
        crypto
          .createHash("sha256")
          .update(schema.schedule_database + ":" + id)
          .digest("hex")
          .slice(0, 56);
      if (c.taskScheduleLocks.includes(key)) continue;
      const [[lock]] = await c.query("SELECT GET_LOCK(?,10) AS acquired", [
        key,
      ]);
      C.fail(
        Number(lock.acquired) !== 1,
        "SCHEDULE_CONFLICT",
        "Lịch đang được cập nhật. Vui lòng thử lại.",
        409,
      );
      c.taskScheduleLocks.push(key);
    }
    const [users] = await c.execute(
      "SELECT id FROM users WHERE status='ACTIVE' AND EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=users.id AND r.code IN ('STOCKTAKER','QC_INSPECTOR')) AND id IN (" +
        ids.map(() => "?").join(",") +
        ") ORDER BY id",
      ids,
    );
    C.fail(
      users.length !== ids.length,
      "VALIDATION_ERROR",
      "Chỉ được phân công nhân viên đang hoạt động thuộc Ban kiểm kê hoặc QC/AC.",
    );
    const [overlap] = await c.execute(
      "SELECT t.id FROM tasks t JOIN task_assignments a ON a.task_id=t.id WHERE a.user_id IN (" +
        ids.map(() => "?").join(",") +
        ") AND t.status IN ('PLANNED','IN_PROGRESS') AND t.start_at<? AND t.end_at>?" +
        (exclude ? " AND t.id<>?" : "") +
        " FOR UPDATE",
      [...ids, end, start, ...(exclude ? [exclude] : [])],
    );
    C.fail(
      overlap.length,
      "SCHEDULE_CONFLICT",
      "Lịch công việc bị trùng.",
      409,
    );
    return { start, end, ids };
  }
  async audit(c, user, id, action, data, requestId) {
    await c.execute(
      "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'tasks',?,?,?,?)",
      [user.id, id, action, JSON.stringify(data), requestId],
    );
  }
  async create(user, b, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(b, [
      "title",
      "description",
      "priority",
      "start_at",
      "end_at",
      "assignee_ids",
      "inspection_type","lot_header_id","finished_report_ids","material_source","material_lot_ids","location","minute_author_id",
    ]);
    const id = await this.transaction(async (c) => {
      const value = await this.validate(c, b);
      const inspection=b.inspection_type?await require('./inspection-task').create(this.pool,c,user,b,value,requestId):null;
      const [created] = await c.execute(
        "INSERT INTO tasks (code,title,description,priority,start_at,end_at,status,created_by,version) VALUES (?,?,?,?,?,?,'PLANNED',?,1)",
        [
          "CV-" + crypto.randomBytes(8).toString("hex"),
          b.title,
          b.description || null,
          b.priority,
          value.start,
          value.end,
          user.id,
        ],
      );
      if(inspection)await c.execute("UPDATE tasks SET stocktake_id=?,task_type='LOT_INSPECTION' WHERE id=?",[inspection.id,created.insertId]);
      for (const id of value.ids)
        await c.execute(
          "INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)",
          [created.insertId, id],
        );
      await this.audit(c, user, created.insertId, "CREATE", b, requestId);
      for(const who of value.ids)await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'tasks',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",[who,'Công việc mới: '+b.title,b.description||'Bạn được phân công thực hiện công việc.',created.insertId,'task-'+created.insertId+'-assigned']);
      return created.insertId;
    });
    return this.get(user, String(id));
  }
  async update(user, id, b, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(b, [
      "version",
      "title",
      "description",
      "priority",
      "start_at",
      "end_at",
      "assignee_ids",
      "minute_author_id",
    ]);
    await this.transaction(async (c) => {
      const row = await this.get(user, id, c);
      const [locked] = await c.execute(
        "SELECT * FROM tasks WHERE id=? FOR UPDATE",
        [id],
      );
      C.version(locked[0], b.version);
      C.fail(
        !row.actions.includes("edit"),
        "INVALID_STATE",
        "Công việc liên kết phải sửa từ nguồn.",
        409,
      );
      const next = { ...row, ...b };
      const value = await this.validate(c, next, id);
      if(row.task_type==='LOT_INSPECTION'){
        const [[campaign]]=await c.execute('SELECT * FROM stocktakes WHERE id=? FOR UPDATE',[row.stocktake_id]);C.state(campaign,['PLANNED']);
        require('../../../../shared/qc-schedule-dates').validateStart(next.start_at,row.inspection.expected_date?[{received_date:row.inspection.expected_date}]:[]);
        await c.execute('UPDATE stocktakes SET start_at=?,end_at=?,planned_date=?,version=version+1 WHERE id=?',[value.start,value.end,require('../../../../shared/qc-schedule-dates').localDay(next.start_at),row.stocktake_id]);
        await c.execute('DELETE FROM quality_campaign_assignments WHERE campaign_id=?',[row.stocktake_id]);
        for(const who of value.ids)await c.execute('INSERT INTO quality_campaign_assignments(campaign_id,user_id) VALUES (?,?)',[row.stocktake_id,who]);
        await require('./inspection-scope').sync(c,row.stocktake_id,value.ids);
        const author=next.minute_author_id||campaign.NguoiLapBienBanDuocChon;
        C.fail(!value.ids.includes(String(author)),'VALIDATION_ERROR','Chọn người lập biên bản trong danh sách được phân công.');
        await c.execute('UPDATE stocktakes SET NguoiLapBienBanDuocChon=? WHERE id=?',[author,row.stocktake_id]);
        await c.execute('UPDATE stocktakes SET note=? WHERE id=?',[next.description||null,row.stocktake_id]);
      }
      await c.execute(
        "UPDATE tasks SET title=?,description=?,priority=?,start_at=?,end_at=?,version=version+1 WHERE id=?",
        [
          next.title,
          next.description || null,
          next.priority,
          value.start,
          value.end,
          id,
        ],
      );
      await c.execute("DELETE FROM task_assignments WHERE task_id=?", [id]);
      for (const who of value.ids)
        await c.execute(
          "INSERT INTO task_assignments (task_id,user_id) VALUES (?,?)",
          [id, who],
        );
      await this.audit(c, user, id, "UPDATE", b, requestId);
    });
    return this.get(user, id);
  }
  async remove(user, id, b, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(b, ["version"]);
    await this.transaction(async (c) => {
      const row = await this.get(user, id, c);
      const [locked] = await c.execute(
        "SELECT * FROM tasks WHERE id=? FOR UPDATE",
        [id],
      );
      C.version(locked[0], b.version);
      C.fail(
        !row.actions.includes("delete"),
        "INVALID_STATE",
        "Công việc không được hủy ở trạng thái này.",
        409,
      );
      await c.execute(
        "UPDATE tasks SET status='CANCELLED',version=version+1 WHERE id=?",
        [id],
      );
      await this.audit(c, user, id, "CANCEL", b, requestId);
      if(row.task_type==='LOT_INSPECTION')await c.execute("UPDATE stocktakes SET status='CANCELLED',version=version+1 WHERE id=? AND status='PLANNED'",[row.stocktake_id]);
    });
    return this.get(user, id);
  }
  async progress(user, id, b, requestId) {
    C.fields(b, ["version", "status", "count_lines"]);
    await this.transaction(async (c) => {
      const row = await this.get(user, id, c);
      const [locked] = await c.execute(
        "SELECT * FROM tasks WHERE id=? FOR UPDATE",
        [id],
      );
      C.version(locked[0], b.version);
      if(b.count_lines!==undefined){
        C.fail(b.status!==undefined,'VALIDATION_ERROR','Ghi số đếm không đồng thời đổi trạng thái.');
        await require('./inspection-scope').record(c,user,row,b);
        await this.audit(c,user,id,'RECORD_COUNT',b,requestId);
        return;
      }
      C.fail(
        !row.actions.includes("progress") ||
          !["IN_PROGRESS", "COMPLETED"].includes(b.status) ||
          (locked[0].status === "PLANNED" && b.status !== "IN_PROGRESS"),
        "INVALID_STATE",
        "Chuyển trạng thái không hợp lệ.",
        409,
      );
      await c.execute(
        "UPDATE tasks SET status=?,version=version+1 WHERE id=?",
        [b.status, id],
      );
      await this.audit(c, user, id, "PROGRESS", b, requestId);
    });
    return this.get(user, id);
  }
}
module.exports = TaskService;
