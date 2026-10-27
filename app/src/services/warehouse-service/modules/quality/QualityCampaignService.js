const crypto = require("node:crypto");
const C = require("../../../domain/core");
const P = require("../../../domain/policy");
const paginate = require("../../../../utils/pagination");

const isId = (v) => /^[1-9]\d*$/.test(String(v));
const Sources=require('./campaign-sources');
class QualityCampaignService {
  constructor(pool) { this.pool = pool; }

  visible(user, row) {
    return user.roles.includes("DIRECTOR") || user.roles.includes("WAREHOUSE_MANAGER") ||
      (user.roles.some(r=>['QC_INSPECTOR','STOCKTAKER'].includes(r)) && row.assignee_ids.includes(String(user.id)));
  }

  async assignments(connection, campaignId) {
    const [rows] = await connection.execute("SELECT user_id FROM quality_campaign_assignments WHERE campaign_id=?", [campaignId]);
    return rows.map((row) => String(row.user_id));
  }

  async present(user, row, connection = this.pool) {
    const assignee_ids = await this.assignments(connection, row.id);
    const [lotRows] = await connection.execute("SELECT lot_id FROM quality_campaign_lots WHERE campaign_id=?", [row.id]);
    const sourceMode=row.MaKeHoachMuaQC?'PURCHASE_PLAN':row.MaKeHoachSanXuatQC?'PRODUCTION_PLAN':'ACTUAL';
    const sourceId=row.MaKeHoachMuaQC||row.MaKeHoachSanXuatQC;
    const planned=sourceId?await Sources.source(connection,sourceMode,sourceId):null;
    return {
      ...row, id: String(row.id), created_by: String(row.created_by), assignee_ids,
      assigned_minute_author:assignee_ids.includes(String(user.id))&&String(row.NguoiLapBienBanDuocChon)===String(user.id),
      can_create_minute:assignee_ids.includes(String(user.id))&&String(row.NguoiLapBienBanDuocChon)===String(user.id)&&['COMPLETED','CLOSED'].includes(row.status)&&row.BienBanKetLuan==null,
      source_mode:sourceMode,source_plan_id:sourceId?String(sourceId):null,source_code:planned?.code||null,expected_date:planned?.expected_date||null,
      lot_ids: lotRows.map((lot) => String(lot.lot_id)),
      planned_date: row.planned_date instanceof Date ? row.planned_date.toISOString().slice(0, 10) : row.planned_date,
      actions: user.roles.includes("DIRECTOR") && row.status === "PLANNED" ? [...(sourceId?['bindLots']:[]),...(lotRows.length?['start']:[])] : user.roles.includes("DIRECTOR") && row.status === "COMPLETED" ? ["close"] : [],
    };
  }

  async list(user, query = {}) {
    P.role(user, ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]);
    C.fields(query, ["page", "per_page", "q", "status", "sort"]);
    const { page, per_page, offset } = paginate(query);
    const where = ["s.campaign_type='QUALITY_CHECK'"], params = [];
    if (!user.roles.includes("DIRECTOR") && !user.roles.includes("WAREHOUSE_MANAGER")) {
      where.push("EXISTS (SELECT 1 FROM quality_campaign_assignments a WHERE a.campaign_id=s.id AND a.user_id=?)"); params.push(user.id);
    }
    if (query.status) { C.fail(!["PLANNED", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED"].includes(query.status), "VALIDATION_ERROR", "Trạng thái không hợp lệ."); where.push("s.status=?"); params.push(query.status); }
    if (query.q) { C.text(query.q, "q", 150); where.push("s.code LIKE ?"); params.push(`%${query.q}%`); }
    C.fail(query.sort && query.sort !== "newest", "VALIDATION_ERROR", "Cách sắp xếp không hợp lệ.");
    const filter = " WHERE " + where.join(" AND ");
    const [[count]] = await this.pool.execute("SELECT COUNT(*) AS total FROM stocktakes s" + filter, params);
    const [rows] = await this.pool.execute("SELECT s.* FROM stocktakes s" + filter + " ORDER BY s.id DESC LIMIT ? OFFSET ?", [...params, String(per_page), String(offset)]);
    return { data: await Promise.all(rows.map((row) => this.present(user, row))), meta: { page, per_page, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / per_page) } };
  }

  async get(user, id, connection = this.pool) {
    P.role(user, ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]);
    C.fail(!isId(id), "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const [rows] = await connection.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK'", [id]);
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const result = await this.present(user, rows[0], connection);
    C.fail(!this.visible(user, result), "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
    const [lots] = await connection.execute("SELECT l.id,l.code,h.code AS lot_header_code,l.received_quantity,l.qc_status,fr.code AS finished_report_code,i.name AS item_name,i.kind FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id JOIN items i ON i.id=l.item_id LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN finished_report_outputs fo ON fo.lot_id=l.id LEFT JOIN finished_reports fr ON fr.id=fo.finished_report_id WHERE q.campaign_id=? ORDER BY l.id", [id]);
    const [counts]=await connection.execute('SELECT lot_id,SoLuongDem,NguoiDem,ThoiDiemDem FROM quality_campaign_lots WHERE campaign_id=?',[id]);
    result.lots = lots.map((row) => {const count=counts.find(x=>String(x.lot_id)===String(row.id));return {...row,id:String(row.id),counted_quantity:count?.SoLuongDem??null,counted_by:count?.NguoiDem?String(count.NguoiDem):null,counted_at:count?.ThoiDiemDem||null};});
    if(!result.source_plan_id&&result.lot_ids.length){
      const [dates]=await connection.execute("SELECT COALESCE(sr.requested_date,CASE WHEN fr.KieuThanhPham='PART' THEN fr.completed_date ELSE NULL END,bp.planned_date,po.expected_delivery_date,DATE_FORMAT(DATE_ADD(l.created_at,INTERVAL 7 HOUR),'%Y-%m-%d')) AS expected_date FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id LEFT JOIN stock_requests sr ON sr.id=l.production_receipt_request_id LEFT JOIN finished_report_outputs fo ON fo.lot_id=l.id LEFT JOIN finished_reports fr ON fr.id=fo.finished_report_id LEFT JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id LEFT JOIN purchase_orders po ON po.id=pl.purchase_order_id LEFT JOIN business_plans bp ON bp.id=po.business_plan_id WHERE q.campaign_id=?",[id]);
      result.expected_date=dates.map(d=>d.expected_date instanceof Date?d.expected_date.toISOString().slice(0,10):String(d.expected_date).slice(0,10)).sort().at(-1);
    }
    if(result.source_plan_id&&user.roles.includes('DIRECTOR'))result.eligible_lots=(await Sources.actualLots(connection)).filter(l=>Sources.matches(l,result.source_mode,result.source_plan_id));
    return result;
  }

  async sources(user){
    P.role(user,['DIRECTOR']);
    const [purchase]=await this.pool.execute("SELECT id FROM business_plans WHERE type='PURCHASE' AND status IN ('APPROVED','IN_PROGRESS','COMPLETED') ORDER BY id DESC LIMIT 100");
    const [production]=await this.pool.execute("SELECT id FROM production_plans WHERE status IN ('APPROVED','IN_PROGRESS','COMPLETED') ORDER BY id DESC LIMIT 100");
    return {lots:await Sources.actualLots(this.pool),plans:[...await Promise.all(purchase.map(p=>Sources.source(this.pool,'PURCHASE_PLAN',p.id))),...await Promise.all(production.map(p=>Sources.source(this.pool,'PRODUCTION_PLAN',p.id)))]};
  }

  async create(user, body, requestId, connectionOverride=null) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, ["campaign_type", "quality_kind", "planned_date", "start_at", "end_at", "location", "assignee_ids", "lot_ids", "note",'source_mode','source_plan_id']);
    const mode=body.source_mode||'ACTUAL';
    C.fail(!['ACTUAL','PURCHASE_PLAN','PRODUCTION_PLAN'].includes(mode),'VALIDATION_ERROR','Hình thức chọn lô không hợp lệ.');
    C.fail(mode==='ACTUAL'&&body.source_plan_id,'VALIDATION_ERROR','Lô thực tế không chọn thêm nguồn dự kiến.');
    C.fail(body.campaign_type !== "QUALITY_CHECK" || !["MATERIAL", "FINISHED_PRODUCT"].includes(body.quality_kind), "VALIDATION_ERROR", "Loại lịch QC không hợp lệ.");
    C.date(body.planned_date, "planned_date", true);
    C.text(body.location, "location", 500);
    if (body.note !== undefined) C.text(body.note, "note", 5000, false);
    const start = Date.parse(body.start_at), end = Date.parse(body.end_at);
    C.fail(!Number.isFinite(start) || !Number.isFinite(end) || end <= start, "VALIDATION_ERROR", "Thời gian lịch QC không hợp lệ.");
    C.fail(!Array.isArray(body.assignee_ids) || !body.assignee_ids.length || body.assignee_ids.length > 50 || new Set(body.assignee_ids.map(String)).size !== body.assignee_ids.length || body.assignee_ids.some((id) => !isId(id)), "VALIDATION_ERROR", "Nhân viên QC không hợp lệ.");
    C.fail(!Array.isArray(body.lot_ids) || (mode==='ACTUAL'&&!body.lot_ids.length) || body.lot_ids.length > 100 || new Set(body.lot_ids.map(String)).size !== body.lot_ids.length || body.lot_ids.some((id) => !isId(id)), "VALIDATION_ERROR", "Chọn phần lô thực tế hoặc lập lịch dự kiến theo kế hoạch.");
    const connection = connectionOverride||await this.pool.getConnection();
    let id;
    try {
      if(!connectionOverride)await connection.beginTransaction();
      const [assignees] = await connection.execute("SELECT DISTINCT ur.user_id FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN users u ON u.id=ur.user_id WHERE r.code IN ('QC_INSPECTOR','STOCKTAKER') AND u.status='ACTIVE' AND ur.user_id IN (" + body.assignee_ids.map(() => "?").join(",") + ")", body.assignee_ids);
      C.fail(assignees.length !== body.assignee_ids.length, "VALIDATION_ERROR", "Người được giao không có vai trò QC.");
      const planned=mode!=='ACTUAL'?await Sources.source(connection,mode,body.source_plan_id,true):null;
      C.fail(planned&&planned.quality_kind!==body.quality_kind,'VALIDATION_ERROR','Loại hàng không khớp kế hoạch nguồn.');
      const lots=body.lot_ids.length?await Sources.actualLots(connection,body.lot_ids):[];
      C.fail(lots.length !== body.lot_ids.length || lots.some((lot) => lot.qc_status !== "PENDING" || lot.kind !== body.quality_kind), "VALIDATION_ERROR", "Lô không chờ QC hoặc sai loại.");
      C.fail(planned&&lots.some(lot=>!Sources.matches(lot,mode,planned.id)),'VALIDATION_ERROR','Phần lô thực tế không thuộc kế hoạch nguồn.');
      require('../../../../shared/qc-schedule-dates').validateStart(body.start_at,planned?[{received_date:planned.expected_date}]:lots.map(l=>({received_date:l.expected_date})));
      for (const lot of lots) {
        if (lot.production_plan_id) {
          const [reports] = await connection.execute("SELECT r.id FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id JOIN lots l ON l.id=o.lot_id WHERE l.id=? AND r.status='SUBMITTED' UNION ALL SELECT t.id FROM returned_lot_lines t JOIN lot_headers h ON h.id=t.lot_header_id JOIN stock_document_lines dl ON dl.id=t.original_stock_document_line_id JOIN stock_documents d ON d.id=dl.stock_document_id WHERE t.returned_lot_detail_id=? AND h.return_direction='KHACH_HANG' AND h.return_status='POSTED' AND d.type='OUT' AND d.status='POSTED'", [lot.id, lot.id]);
          const [partial]=await connection.execute("SELECT l.id FROM lots l JOIN stock_requests r ON r.id=l.production_receipt_request_id JOIN production_plans p ON p.id=l.production_plan_id WHERE l.id=? AND r.production_source_mode='MANUAL' AND r.purpose='PRODUCTION_RECEIPT' AND r.status<>'CANCELLED' AND p.status IN ('APPROVED','IN_PROGRESS','COMPLETED')",[lot.id]);
          C.fail(!reports.length&&!partial.length, "INVALID_STATE", "Lô thành phẩm chưa có báo cáo đã gửi hoặc đợt nhập hợp lệ.", 409);
        }
        const [scheduled] = await connection.execute("SELECT q.campaign_id FROM quality_campaign_lots q JOIN stocktakes s ON s.id=q.campaign_id WHERE q.lot_id=? AND s.status IN ('PLANNED','IN_PROGRESS')", [lot.id]);
        C.fail(scheduled.length, "DUPLICATE", "Lô đã có lịch QC đang hoạt động.", 409);
      }
      const code = "LQC-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const [created] = await connection.execute("INSERT INTO stocktakes (code,created_by,planned_date,start_at,end_at,item_kind,status,note,version,campaign_type,quality_kind,location) VALUES (?,?,?,?,?,?,'PLANNED',?,1,'QUALITY_CHECK',?,?)", [code, user.id, body.planned_date, new Date(start), new Date(end), body.quality_kind, body.note || null, body.quality_kind, body.location.trim()]);
      id = created.insertId;
      if(planned)await connection.execute('UPDATE stocktakes SET MaKeHoachMuaQC=?,MaKeHoachSanXuatQC=? WHERE id=?',[mode==='PURCHASE_PLAN'?planned.id:null,mode==='PRODUCTION_PLAN'?planned.id:null,id]);
      for (const lotId of body.lot_ids) await connection.execute("INSERT INTO quality_campaign_lots (campaign_id,lot_id) VALUES (?,?)", [id, lotId]);
      for (const userId of body.assignee_ids) await connection.execute("INSERT INTO quality_campaign_assignments (campaign_id,user_id) VALUES (?,?)", [id, userId]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stocktakes',?,'CREATE',?,?)", [user.id, id, JSON.stringify({ code, campaign_type: "QUALITY_CHECK" }), requestId]);
      if(!connectionOverride)await connection.commit();
    } catch (error) { if(!connectionOverride)await connection.rollback(); throw error; }
    finally { if(!connectionOverride)connection.release(); }
    return this.get(user, id,connectionOverride||this.pool);
  }

  async action(user, id, body, action, requestId) {
    P.role(user, ["DIRECTOR"]);
    C.fields(body, action==='start'?["version","simulate_early_start"]:["version"]);
    C.fail(body.simulate_early_start!==undefined&&typeof body.simulate_early_start!=='boolean','VALIDATION_ERROR','Lựa chọn giả lập phải là true hoặc false.');
    C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản lịch QC.");
    C.fail(!["start", "close"].includes(action), "NOT_FOUND", "Thao tác không hợp lệ.", 404);
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK' FOR UPDATE", [id]);
      C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy lịch QC.", 404);
      C.version(rows[0], body.version);
      C.state(rows[0], [action === "start" ? "PLANNED" : "COMPLETED"]);
      if(action==='start'){
        const [lots]=await connection.execute('SELECT lot_id FROM quality_campaign_lots WHERE campaign_id=?',[id]);
        C.fail(!lots.length,'ACTUAL_LOT_REQUIRED','Hàng chưa được ghi nhận. Chọn phần lô thực tế trước khi bắt đầu QC.',409);
        const mode=rows[0].MaKeHoachMuaQC?'PURCHASE_PLAN':'PRODUCTION_PLAN';
        const sourceId=rows[0].MaKeHoachMuaQC||rows[0].MaKeHoachSanXuatQC;
        if(sourceId){const planned=await Sources.source(connection,mode,sourceId,true);require('../../../../shared/qc-schedule-dates').validateStart(rows[0].start_at,[{received_date:planned.expected_date}]);C.fail(!body.simulate_early_start&&C.today()<planned.expected_date,'SOURCE_NOT_READY','Chưa đến ngày nhận hàng dự kiến của kế hoạch. Có thể chọn giả lập thử nghiệm để bắt đầu sớm.',409);}
      }
      const status = action === "start" ? "IN_PROGRESS" : "CLOSED";
      await connection.execute("UPDATE stocktakes SET status=?,version=version+1 WHERE id=?", [status, id]);
      if(action==='start')await connection.execute("UPDATE tasks SET status='IN_PROGRESS',version=version+1 WHERE stocktake_id=? AND task_type='LOT_INSPECTION' AND status='PLANNED'",[id]);
      await connection.execute("INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,before_data,after_data,request_id) VALUES (?,'stocktakes',?,?,?,?,?)", [user.id, id, action.toUpperCase(), JSON.stringify({ status: rows[0].status }), JSON.stringify({ status,...(action==='start'?{simulate_early_start:body.simulate_early_start===true}:{}) }), requestId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.get(user, id);
  }

  async bindLots(user,id,body,requestId){
    P.role(user,['DIRECTOR']);C.fields(body,['version','lot_ids']);
    C.fail(!Array.isArray(body.lot_ids)||!body.lot_ids.length||body.lot_ids.length>100||body.lot_ids.some(v=>!isId(v))||new Set(body.lot_ids.map(String)).size!==body.lot_ids.length,'VALIDATION_ERROR','Chọn từng phần lô thực tế hợp lệ.');
    const c=await this.pool.getConnection();
    try{
      await c.beginTransaction();
      const [[row]]=await c.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK' FOR UPDATE",[id]);
      C.fail(!row,'NOT_FOUND','Không tìm thấy lịch QC.',404);C.version(row,body.version);C.state(row,['PLANNED']);
      const mode=row.MaKeHoachMuaQC?'PURCHASE_PLAN':'PRODUCTION_PLAN',sourceId=row.MaKeHoachMuaQC||row.MaKeHoachSanXuatQC;
      C.fail(!sourceId,'INVALID_STATE','Lịch này không dùng nguồn kế hoạch.',409);
      await Sources.source(c,mode,sourceId,true);
      const lots=await Sources.actualLots(c,body.lot_ids);
      C.fail(lots.length!==body.lot_ids.length||lots.some(l=>l.kind!==row.quality_kind||!Sources.matches(l,mode,sourceId)),'VALIDATION_ERROR','Phần lô đã được phân công, đã kiểm tra hoặc không thuộc kế hoạch nguồn.');
      for(const lot of lots)if(lot.production_plan_id){
        const [ready]=await c.execute("SELECT r.id FROM stock_requests r WHERE r.id=? AND r.purpose='PRODUCTION_RECEIPT' AND r.production_source_mode='MANUAL' AND r.status<>'CANCELLED' UNION ALL SELECT r.id FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id WHERE o.lot_id=? AND r.status='SUBMITTED'",[lot.production_receipt_request_id||null,lot.id]);
        C.fail(!ready.length,'INVALID_STATE','Đợt thành phẩm chưa có yêu cầu nhập hợp lệ hoặc báo cáo đã gửi.',409);
      }
      for(const lot of lots)await c.execute('INSERT INTO quality_campaign_lots(campaign_id,lot_id) VALUES (?,?)',[id,lot.id]);
      await c.execute('UPDATE stocktakes SET version=version+1 WHERE id=?',[id]);
      await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stocktakes',?,'BIND_LOTS',?,?)",[user.id,id,JSON.stringify({lot_ids:body.lot_ids}),requestId]);
      await c.commit();
    }catch(e){await c.rollback();throw e;}finally{c.release();}
    return this.get(user,id);
  }
}

module.exports = QualityCampaignService;
