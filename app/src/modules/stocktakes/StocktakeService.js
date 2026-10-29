const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const paginate = require("../../utils/pagination");
const recordCode = require("../../shared/record-code");
const id = (v) => /^[1-9]\d*$/.test(String(v));
const normalize = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k,
      (k === "id" || k.endsWith("_id")) && v != null ? String(v) : v,
    ]),
  );
class StocktakeService {
  constructor(pool, quality) {
    this.pool = pool;
    this.quality = quality;
  }
  async tx(work) {
    const c = await this.pool.getConnection();
    try {
      await c.beginTransaction();
      const r = await work(c);
      await c.commit();
      return r;
    } catch (e) {
      await c.rollback();
      throw e;
    } finally {
      c.release();
    }
  }
  async audit(c, u, r, action, request) {
    await c.execute(
      "INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stocktakes',?,?,?,?)",
      [u.id, r, action, JSON.stringify({ action }), request],
    );
  }
  async list(u, q = {}) {
    P.role(u, P.read.stocktakes);
    C.fields(q, ["page", "per_page", "q", "status", "sort", "campaign_type"]);
    const p = paginate(q),
      params = [],
      where = [];
    if (!u.roles.some((r) => ["DIRECTOR", "WAREHOUSE_MANAGER"].includes(r))) {
      where.push(
        "((s.campaign_type='COUNT' AND (EXISTS(SELECT 1 FROM stocktake_warehouses w JOIN stocktake_assignments a ON a.stocktake_warehouse_id=w.id WHERE w.stocktake_id=s.id AND a.user_id=?) OR EXISTS(SELECT 1 FROM stocktake_warehouses w JOIN PhanCongKetLuanKiemKe a ON a.MaPhieuKiemKe=w.id WHERE w.stocktake_id=s.id AND a.MaNguoiDung=?))) OR (s.campaign_type='QUALITY_CHECK' AND EXISTS(SELECT 1 FROM quality_campaign_assignments a WHERE a.campaign_id=s.id AND a.user_id=?)))",
      );
      params.push(u.id,u.id,u.id);
    }
    if (q.q) {
      C.text(q.q, "q", 150);
      where.push("s.code LIKE ?");
      params.push("%" + q.q + "%");
    }
    if (q.status) {
      where.push("s.status=?");
      params.push(q.status);
    }
    if (q.campaign_type) {
      where.push("s.campaign_type=?");
      params.push(q.campaign_type);
    }
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM stocktakes s" + filter,
      params,
    );
    const [rows] = await this.pool.execute(
      "SELECT s.* FROM stocktakes s" +
        filter +
        " ORDER BY s.id DESC LIMIT ? OFFSET ?",
      [...params, String(p.per_page), String(p.offset)],
    );
    return {
      data: rows.map((r) => ({
        ...normalize(r),
        actions: u.roles.includes("DIRECTOR")
          ? r.status === "PLANNED"
            ? ["start"]
            : ["IN_PROGRESS", "COMPLETED"].includes(r.status)
              ? ["close"]
              : []
          : [],
      })),
      meta: {
        ...p,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / p.per_page),
      },
    };
  }
  async scope(c, u, stocktake, warehouse, lock = false) {
    C.fail(
      !id(stocktake) || !id(warehouse),
      "NOT_FOUND",
      "Không tìm thấy phiếu kiểm kê.",
      404,
    );
    const [rows] = await c.execute(
      "SELECT w.* FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id WHERE w.stocktake_id=? AND w.warehouse_id=? AND s.campaign_type='COUNT'" +
        (lock ? " FOR UPDATE" : ""),
      [stocktake, warehouse],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy phiếu kiểm kê.", 404);
    const w = rows[0];
    const [a] = await c.execute(
      "SELECT user_id FROM stocktake_assignments WHERE stocktake_warehouse_id=?",
      [w.id],
    );
    w.assignee_ids = a.map((r) => String(r.user_id));
    const [reviewers]=await c.execute("SELECT MaNguoiDung FROM PhanCongKetLuanKiemKe WHERE MaPhieuKiemKe=?",[w.id]);
    w.conclusion_assignee_ids=reviewers.map(r=>String(r.user_id));
    C.fail(
      !u.roles.some((r) => ["DIRECTOR", "WAREHOUSE_MANAGER"].includes(r)) &&
        !w.assignee_ids.includes(String(u.id)) && !w.conclusion_assignee_ids.includes(String(u.id)),
      "NOT_FOUND",
      "Không tìm thấy phiếu được giao.",
      404,
    );
    return w;
  }
  async lines(u, s, w, c = this.pool) {
    P.role(u, ["DIRECTOR", "WAREHOUSE_MANAGER", "STOCKTAKER", "QC_INSPECTOR"]);
    const scope = await this.scope(c, u, s, w);
    const [rows] = await c.execute(
      "SELECT l.*,lot.item_id,lot.code AS lot_code,i.name AS item_name FROM stocktake_lines l JOIN lots lot ON lot.id=l.lot_id JOIN items i ON i.id=lot.item_id WHERE l.stocktake_warehouse_id=? ORDER BY l.id",
      [scope.id],
    );
    return { ...normalize(scope), lines: rows.map(normalize) };
  }
  async get(u, s) {
    P.role(u, P.read.stocktakes);
    C.fail(!id(s), "NOT_FOUND", "Không tìm thấy đợt.", 404);
    const [rows] = await this.pool.execute(
      "SELECT * FROM stocktakes WHERE id=?",
      [s],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy đợt.", 404);
    if (rows[0].campaign_type === "QUALITY_CHECK")
      return this.quality.get(u, s);
    const [warehouses] = await this.pool.execute(
      "SELECT warehouse_id FROM stocktake_warehouses WHERE stocktake_id=?",
      [s],
    );
    const result = [];
    for (const w of warehouses) {
      try {
        result.push(await this.lines(u, s, w.warehouse_id));
      } catch (e) {
        if (e.code !== "NOT_FOUND") throw e;
      }
    }
    C.fail(!result.length, "NOT_FOUND", "Không tìm thấy đợt được giao.", 404);
    return {
      ...normalize(rows[0]),
      warehouses: result,
      actions: u.roles.includes("DIRECTOR")
        ? rows[0].status === "PLANNED"
          ? ["start"]
          : ["IN_PROGRESS", "COMPLETED"].includes(rows[0].status)
            ? ["close"]
            : []
        : [],
    };
  }
  async create(u, b, request) {
    P.role(u, ["DIRECTOR"]);
    C.fields(b, [
      "campaign_type",
      "planned_date",
      "start_at",
      "end_at",
      "item_kind",
      "note",
      "warehouses",
    ]);
    C.date(b.planned_date, "planned_date", true);
    const start = new Date(b.start_at),
      end = new Date(b.end_at);
    C.fail(
      !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start,
      "VALIDATION_ERROR",
      "Thời gian không hợp lệ.",
    );
    C.fail(
      b.campaign_type && b.campaign_type !== "COUNT",
      "VALIDATION_ERROR",
      "Loại đợt không hợp lệ.",
    );
    C.fail(
      b.item_kind && !["MATERIAL", "FINISHED_PRODUCT"].includes(b.item_kind),
      "VALIDATION_ERROR",
      "Loại hàng không hợp lệ.",
    );
    if (b.note !== undefined) C.text(b.note, "note", 5000, false);
    C.fail(
      !Array.isArray(b.warehouses) ||
        !b.warehouses.length ||
        b.warehouses.length > 100,
      "VALIDATION_ERROR",
      "Cần kho kiểm kê.",
    );
    const seen = new Set();
    for (const w of b.warehouses) {
      C.fields(w, ["warehouse_id", "assignee_ids", "conclusion_assignee_ids"]);
      C.fail(w.conclusion_assignee_ids !== undefined && (!Array.isArray(w.conclusion_assignee_ids) || w.conclusion_assignee_ids.length>100 || w.conclusion_assignee_ids.some(v=>!id(v)) || new Set(w.conclusion_assignee_ids.map(String)).size!==w.conclusion_assignee_ids.length),"VALIDATION_ERROR","Người lập kết luận không hợp lệ.");
      C.fail(
        !id(w.warehouse_id) ||
          seen.has(String(w.warehouse_id)) ||
          !Array.isArray(w.assignee_ids) ||
          !w.assignee_ids.length ||
          w.assignee_ids.some((v) => !id(v)) ||
          new Set(w.assignee_ids.map(String)).size !== w.assignee_ids.length,
        "VALIDATION_ERROR",
        "Kho hoặc người đếm không hợp lệ.",
      );
      seen.add(String(w.warehouse_id));
    }
    const result = await this.tx(async (c) => {
      const [created] = await c.execute(
        "INSERT INTO stocktakes(code,created_by,planned_date,start_at,end_at,item_kind,status,note,version,campaign_type) VALUES (?,?,?,?,?,?,'PLANNED',?,1,'COUNT')",
        [
          await recordCode.next(c, 'stocktakes', 'KK', b.planned_date),
          u.id,
          b.planned_date,
          start,
          end,
          b.item_kind || null,
          b.note || null,
        ],
      );
      for (const w of b.warehouses) {
        const [warehouses] = await c.execute(
          "SELECT id FROM warehouses WHERE id=? AND is_active=1",
          [w.warehouse_id],
        );
        C.fail(!warehouses.length, "VALIDATION_ERROR", "Kho không hoạt động.");
        const [assigned] = await c.execute(
          "SELECT DISTINCT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code IN ('STOCKTAKER','QC_INSPECTOR') AND u.id IN (" +
            w.assignee_ids.map(() => "?").join(",") +
            ")",
          w.assignee_ids,
        );
        C.fail(
          assigned.length !== w.assignee_ids.length,
          "VALIDATION_ERROR",
          "Người đếm không đúng vai trò.",
        );
        const [sw] = await c.execute(
          "INSERT INTO stocktake_warehouses(stocktake_id,warehouse_id,status,version) VALUES (?,?,'PLANNED',1)",
          [created.insertId, w.warehouse_id],
        );
        for (const user of w.assignee_ids)
          await c.execute(
            "INSERT INTO stocktake_assignments(stocktake_warehouse_id,user_id) VALUES (?,?)",
            [sw.insertId, user],
          );
        for(const reviewer of w.conclusion_assignee_ids||[]){
          const [[valid]]=await c.execute("SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.id=? AND u.status='ACTIVE' AND r.code='QC_INSPECTOR'",[reviewer]);
          C.fail(!valid,"VALIDATION_ERROR","Người lập kết luận bổ sung phải thuộc QC/AC.");
          await c.execute("INSERT INTO PhanCongKetLuanKiemKe(MaPhieuKiemKe,MaNguoiDung) VALUES (?,?)",[sw.insertId,reviewer]);
        }
      }
      await this.audit(c, u, created.insertId, "CREATE", request);
      return created.insertId;
    });
    return this.get(u, result);
  }
  async action(u, s, b, action, request) {
    P.role(u, ["DIRECTOR"]);
    C.fields(b, ["version"]);
    C.fail(
      !Number.isInteger(b.version),
      "VALIDATION_ERROR",
      "Thiếu phiên bản.",
    );
    await this.tx(async (c) => {
      const [[r]] = await c.execute(
        "SELECT * FROM stocktakes WHERE id=? FOR UPDATE",
        [s],
      );
      C.fail(!r, "NOT_FOUND", "Không tìm thấy đợt.", 404);
      C.version(r, b.version);
      C.state(
        r,
        action === "start" ? ["PLANNED"] : ["IN_PROGRESS", "COMPLETED"],
      );
      const [warehouses] = await c.execute(
        "SELECT * FROM stocktake_warehouses WHERE stocktake_id=? ORDER BY warehouse_id FOR UPDATE",
        [s],
      );
      for (const w of warehouses) {
        await c.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [
          w.warehouse_id,
        ]);
        if (action === "start") {
          const [other] = await c.execute(
            "SELECT id FROM stocktake_warehouses WHERE warehouse_id=? AND status IN ('COUNTING','COMPLETED') AND id<>?",
            [w.warehouse_id, w.id],
          );
          C.fail(
            other.length,
            "WAREHOUSE_FROZEN",
            "Kho đang kiểm kê đợt khác.",
            409,
          );
          await c.execute(
            "INSERT INTO stocktake_lines(stocktake_warehouse_id,lot_id,location_id,quality_bucket,system_quantity,resolution_status,version) SELECT ?,b.lot_id,b.location_id,b.quality_bucket,b.quantity,'NONE',1 FROM inventory_balances b JOIN warehouse_locations loc ON loc.id=b.location_id JOIN lots l ON l.id=b.lot_id JOIN items i ON i.id=l.item_id WHERE loc.warehouse_id=?" +
              (r.item_kind ? " AND i.kind=?" : ""),
            r.item_kind
              ? [w.id, w.warehouse_id, r.item_kind]
              : [w.id, w.warehouse_id],
          );
          await c.execute(
            "UPDATE stocktake_warehouses SET status='COUNTING',snapshot_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
            [w.id],
          );
        } else {
          C.fail(
            w.status !== "COMPLETED" || w.conclusion_status !== "SUBMITTED",
            "INVALID_STATE",
            "Chưa hoàn tất đếm và gửi kết luận từng kho.",
            409,
          );
          const [[n]] = await c.execute(
            "SELECT COUNT(*) AS total FROM stocktake_lines WHERE stocktake_warehouse_id=? AND (actual_quantity IS NULL OR (actual_quantity<>system_quantity AND resolution_status<>'RESOLVED'))",
            [w.id],
          );
          C.fail(
            Number(n.total) > 0,
            "UNRESOLVED_DIFFERENCE",
            "Còn chênh lệch chưa xử lý.",
            409,
          );
          await c.execute(
            "UPDATE stocktake_warehouses SET status='CLOSED',version=version+1 WHERE id=?",
            [w.id],
          );
        }
      }
      await c.execute(
        "UPDATE stocktakes SET status=?,version=version+1 WHERE id=?",
        [action === "start" ? "IN_PROGRESS" : "CLOSED", s],
      );
      await this.audit(c, u, s, action.toUpperCase(), request);
    });
    return this.get(u, s);
  }
  async counts(u, s, w, b) {
    P.role(u, ["STOCKTAKER", "QC_INSPECTOR"]);
    C.fields(b, ["lines"]);
    C.fail(
      !Array.isArray(b.lines) || !b.lines.length || b.lines.length > 500,
      "VALIDATION_ERROR",
      "Cần dòng đếm.",
    );
    const seen = new Set();
    await this.tx(async (c) => {
      const scope = await this.scope(c, u, s, w, true);
      C.fail(
        !scope.assignee_ids.includes(String(u.id)),
        "FORBIDDEN",
        "Không được phân công.",
        403,
      );
      C.state(scope, ["COUNTING"]);
      for (const l of b.lines) {
        C.fields(l, ["id", "version", "actual_quantity", "cause"]);
        C.fail(
          !id(l.id) || seen.has(String(l.id)),
          "VALIDATION_ERROR",
          "Dòng đếm không hợp lệ.",
        );
        seen.add(String(l.id));
        C.qty(l.actual_quantity, false);
        if (l.cause !== undefined) C.text(l.cause, "cause", 5000, false);
        const [[r]] = await c.execute(
          "SELECT * FROM stocktake_lines WHERE id=? AND stocktake_warehouse_id=? FOR UPDATE",
          [l.id, scope.id],
        );
        C.fail(!r, "NOT_FOUND", "Dòng không thuộc phiếu.", 404);
        C.version(r, l.version);
        await c.execute(
          "UPDATE stocktake_lines SET actual_quantity=?,cause=?,counted_by=?,counted_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
          [
            C.decimal(C.qty(l.actual_quantity, false)),
            l.cause || null,
            u.id,
            l.id,
          ],
        );
      }
      await c.execute(
        "UPDATE stocktake_warehouses SET version=version+1 WHERE id=?",
        [scope.id],
      );
    });
    return this.lines(u, s, w);
  }
  async complete(u, s, w, b) {
    P.role(u, ["STOCKTAKER", "QC_INSPECTOR"]);
    C.fields(b, ["version"]);
    await this.tx(async (c) => {
      const scope = await this.scope(c, u, s, w, true);
      C.fail(
        !scope.assignee_ids.includes(String(u.id)),
        "FORBIDDEN",
        "Không được phân công.",
        403,
      );
      C.version(scope, b.version);
      C.state(scope, ["COUNTING"]);
      const [[n]] = await c.execute(
        "SELECT COUNT(*) AS total FROM stocktake_lines WHERE stocktake_warehouse_id=? AND actual_quantity IS NULL",
        [scope.id],
      );
      C.fail(Number(n.total), "INCOMPLETE_COUNT", "Còn dòng chưa đếm.", 409);
      await c.execute(
        "UPDATE stocktake_warehouses SET status='COMPLETED',completed_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
        [scope.id],
      );
    });
    return this.lines(u, s, w);
  }
  async minutesList(u, q = {}) {
    return require('./inspection-minutes').list(this,u,q);
  }
  minuteDTO(u, r) {
    return {
      ...normalize(r),
      code: "BB-" + (r.stocktake_code || r.stocktake_id) + "-" + (r.warehouse_code || r.warehouse_id),
      status: r.conclusion_status,
      actions:
        u.roles.some(role=>["STOCKTAKER","QC_INSPECTOR"].includes(role)) && r.conclusion_status === "DRAFT"
          ? ["edit", "submit"]
          : [],
    };
  }
  async minuteGet(u, minute) {
    if(/^LOT-[1-9]\d*$/.test(String(minute)))return require('./inspection-minutes').get(this,u,String(minute).slice(4));
    P.role(u, P.read["stocktake-minutes"]);
    const [[r]] = await this.pool.execute(
      "SELECT w.*,s.code AS stocktake_code,k.code AS warehouse_code FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id JOIN warehouses k ON k.id=w.warehouse_id WHERE w.id=? AND w.remarks IS NOT NULL",
      [minute],
    );
    C.fail(!r, "NOT_FOUND", "Không tìm thấy kết luận.", 404);
    await this.scope(this.pool, u, r.stocktake_id, r.warehouse_id);
    return this.minuteDTO(u, r);
  }
  async minuteWrite(u, minute, b, action, request) {
    if(b.inspection_campaign_id!==undefined||/^LOT-[1-9]\d*$/.test(String(minute)))return require('./inspection-minutes').write(this,u,minute?String(minute).slice(4):null,b,action,request);
    P.role(u, ["STOCKTAKER", "QC_INSPECTOR"]);
    C.fields(
      b,
      action === "create"
        ? ["stocktake_id", "warehouse_id", "remarks"]
        : action === "submit"
          ? ["version"]
          : ["version", "remarks"],
    );
    if (action !== "submit") C.text(b.remarks, "remarks", 5000);
    let target;
    await this.tx(async (c) => {
      let r;
      if (action === "create")
        r = await this.scope(c, u, b.stocktake_id, b.warehouse_id, true);
      else {
        const [[row]] = await c.execute(
          "SELECT * FROM stocktake_warehouses WHERE id=? FOR UPDATE",
          [minute],
        );
        C.fail(!row, "NOT_FOUND", "Không tìm thấy kết luận.", 404);
        r = await this.scope(c, u, row.stocktake_id, row.warehouse_id, true);
        C.version(r, b.version);
      }
      C.fail(
        !r.assignee_ids.includes(String(u.id)) && !r.conclusion_assignee_ids.includes(String(u.id)),
        "FORBIDDEN",
        "Không được phân công.",
        403,
      );
      C.state(r, ["COMPLETED"]);
      C.fail(
        r.conclusion_status !== "DRAFT" ||
          (action === "create" && r.remarks !== null),
        "INVALID_STATE",
        "Kết luận đã tồn tại hoặc đã gửi.",
        409,
      );
      C.fail(
        action === "submit" && !r.remarks,
        "INVALID_STATE",
        "Chưa có kết luận.",
        409,
      );
      await c.execute(
        "UPDATE stocktake_warehouses SET remarks=?,conclusion_status=?,submitted_at=IF(?='submit',UTC_TIMESTAMP(6),submitted_at),created_by=?,version=version+1 WHERE id=?",
        [
          action === "submit" ? r.remarks : b.remarks,
          action === "submit" ? "SUBMITTED" : "DRAFT",
          action,
          u.id,
          r.id,
        ],
      );
      target = r.id;
      await this.audit(
        c,
        u,
        r.stocktake_id,
        "CONCLUSION_" + action.toUpperCase(),
        request,
      );
    });
    return this.minuteGet(u, target);
  }
  async differences(u, q = {}) {
    P.role(u, ["DIRECTOR", "WAREHOUSE_MANAGER"]);
    C.fields(q, ["page", "per_page", "stocktake_id", "warehouse_id"]);
    const p = paginate(q),
      params = [],
      where = [
        "w.status='COMPLETED'",
        "l.actual_quantity IS NOT NULL",
        "l.actual_quantity<>l.system_quantity",
        "l.resolution_status<>'RESOLVED'",
      ];
    for (const k of ["stocktake_id", "warehouse_id"])
      if (q[k]) {
        C.fail(!id(q[k]), "VALIDATION_ERROR", "ID không hợp lệ.");
        where.push("w." + k + "=?");
        params.push(q[k]);
      }
    const base =
      " FROM stocktake_lines l JOIN stocktake_warehouses w ON w.id=l.stocktake_warehouse_id JOIN lots lot ON lot.id=l.lot_id WHERE " +
      where.join(" AND ");
    const [[n]] = await this.pool.execute(
      "SELECT COUNT(*) AS total" + base,
      params,
    );
    const [r] = await this.pool.execute(
      "SELECT l.*,w.stocktake_id,w.warehouse_id,lot.item_id" +
        base +
        " ORDER BY l.id LIMIT ? OFFSET ?",
      [...params, String(p.per_page), String(p.offset)],
    );
    return {
      data: r.map(normalize),
      meta: {
        ...p,
        total: Number(n.total),
        total_pages: Math.ceil(Number(n.total) / p.per_page),
      },
    };
  }
}
module.exports = StocktakeService;
