const C = require("../../../domain/core");
const P = require("../../../domain/policy");
const paginate = require("../../../../utils/pagination");
const recordCode = require("../../../../shared/record-code");
const id = (v) => /^[1-9]\d*$/.test(String(v));
const norm = (r) =>
  Object.fromEntries(
    Object.entries(r).map(([k, v]) => [
      k,
      (k === "id" || k.endsWith("_id")) && v != null ? String(v) : v,
    ]),
  );
class ExceptionService {
  constructor(pool, counts) {
    this.pool = pool;
    this.counts = counts;
  }
  async tx(work) {
    return this.counts.tx(work);
  }
  async audit(c, u, r, action, request) {
    await c.execute(
      "INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'exception-proposals',?,?,?,?)",
      [u.id, r, action, JSON.stringify({ action }), request],
    );
  }
  dto(u, r) {
    return {
      ...norm(r),
      actions:
        r.status === "PENDING_APPROVAL" && u.roles.includes("DIRECTOR")
          ? ["review"]
          : r.status === "APPROVED" && (r.action === 'QUARANTINE' || r.action === "RELEASE") && u.roles.includes("QC_INSPECTOR")
            ? ["reinspect"]
          : r.status === "APPROVED" && u.roles.includes("WAREHOUSE_MANAGER")
            ? ["apply"]
            : [],
    };
  }
  async list(u,q={}) { return require('./minute-exceptions').list(this,u,q); }
  async get(u, r) {
    if(/^LOT-[1-9]\d*$/.test(String(r)))return require('./minute-exceptions').get(this,u,String(r).slice(4));
    C.fail(!u.roles.some(x=>['DIRECTOR','WAREHOUSE_MANAGER','QC_INSPECTOR'].includes(x)),'NOT_FOUND','Không tìm thấy đề xuất thuộc xưởng của bạn.',404);
    P.role(u, P.read["exception-proposals"]);
    return this.legacyGet(u,r);
  }
  async legacyGet(u,r) {
    C.fail(!id(r), "NOT_FOUND", "Không tìm thấy đề xuất.", 404);
    const [[row]] = await this.pool.execute(
      "SELECT * FROM exception_proposals WHERE id=?",
      [r],
    );
    C.fail(!row, "NOT_FOUND", "Không tìm thấy đề xuất.", 404);
    const [history] = await this.pool.execute(
      "SELECT * FROM exception_decisions WHERE exception_proposal_id=? ORDER BY id",
      [r],
    );
    const [reinspections] = await this.pool.execute(
      "SELECT * FROM TaiKiemChatLuong WHERE MaDeXuatXuLy=? ORDER BY MaBanGhi", [r],
    );
    const [allocations] = await this.pool.execute('SELECT * FROM exception_allocations WHERE exception_proposal_id=? ORDER BY location_id',[r]);
    return { ...this.dto(u, row), allocations: allocations.map(norm), decision_history: history.map(norm), reinspections: reinspections.map(r=>({...norm(r),result:r.KetLuan,KetLuan:undefined})) };
  }
  async create(u, b, request) {
    P.role(u, ["WAREHOUSE_MANAGER"]);
    C.fields(b, [
      "stocktake_id",
      "warehouse_id",
      "stocktake_line_id",
      "qc_inspection_line_id",
      "action",
      "quantity",
      "reason",
      "resolution_note",
      "quarantine",
      "allocations",
    ]);
    C.text(b.reason, "reason", 5000);
    C.text(b.resolution_note, "resolution_note", 5000);
    if (b.quarantine === true) return require('./quarantine').create(this,u,b,request);
    C.fail(b.quarantine !== undefined || b.allocations !== undefined,'VALIDATION_ERROR','Phân bổ chỉ dùng cho xử lý cách ly.');
    C.fail(
      Boolean(b.stocktake_line_id) === Boolean(b.qc_inspection_line_id),
      "VALIDATION_ERROR",
      "Chọn đúng một dòng nguồn.",
    );
    let target;
    await this.tx(async (c) => {
      let quantity, type, action;
      if (b.stocktake_line_id) {
        P.role(u, ["WAREHOUSE_MANAGER"]);
        const scope = await this.counts.scope(
          c,
          u,
          b.stocktake_id,
          b.warehouse_id,
          true,
        );
        C.state(scope, ["COMPLETED"]);
        const [[line]] = await c.execute(
          "SELECT * FROM stocktake_lines WHERE id=? AND stocktake_warehouse_id=? FOR UPDATE",
          [b.stocktake_line_id, scope.id],
        );
        C.fail(
          !line || line.actual_quantity === null,
          "NOT_FOUND",
          "Không tìm thấy dòng đã đếm.",
          404,
        );
        const delta =
          C.qty(String(line.actual_quantity), false) -
          C.qty(String(line.system_quantity), false);
        C.fail(
          !delta || line.resolution_status === "RESOLVED",
          "INVALID_STATE",
          "Dòng không còn chênh lệch.",
          409,
        );
        quantity = C.decimal(delta < 0n ? -delta : delta);
        type = "STOCKTAKE_DIFFERENCE";
        action = "ADJUST_TO_ACTUAL";
      } else {
        C.fail(
          !id(b.qc_inspection_line_id),
          "VALIDATION_ERROR",
          "Dòng QC không hợp lệ.",
        );
        const [[line]] = await c.execute(
          "SELECT l.*,q.status,q.inspector_id FROM qc_inspection_lines l JOIN qc_inspections q ON q.id=l.qc_inspection_id WHERE l.id=? FOR UPDATE",
          [b.qc_inspection_line_id],
        );
        C.fail(
          !line || line.status !== "RECORDED",
          "INVALID_STATE",
          "QC chưa có kết luận.",
          409,
        );
        C.fail(!u.roles.includes('WAREHOUSE_MANAGER')&&String(line.inspector_id)!==String(u.id),'FORBIDDEN','QC chỉ lập đề xuất từ kết quả của mình.',403);
        const [returned]=await c.execute('SELECT id FROM returned_lot_lines WHERE original_lot_detail_id=?',[line.lot_id]);
        C.fail(returned.length,'IN_USE','Hàng đã có chứng từ trả; không xử lý lần nữa.',409);
        C.fail(
          !["SCRAP", "RETURN_SUPPLIER", "RELEASE"].includes(b.action),
          "VALIDATION_ERROR",
          "Phương án không hợp lệ.",
        );
        C.qty(b.quantity);
        await require('./remaining-failure').validate(c,line,b.quantity);
        C.fail(
          C.qty(b.quantity) > C.qty(String(line.failed_quantity), false),
          "SOURCE_LIMIT_EXCEEDED",
          "Vượt lượng lỗi.",
        );
        quantity = b.quantity;
        type = "QC_FAILURE";
        action = b.action;
      }
      const sourceField =
          type === "QC_FAILURE" ? "qc_inspection_line_id" : "stocktake_line_id",
        sourceId = b[sourceField];
      const [existing] = await c.execute(
        "SELECT id FROM exception_proposals WHERE " +
          sourceField +
          "=? AND "+(type==='QC_FAILURE'?"(status IN ('PENDING_APPROVAL','APPROVED') OR (type<>'QC_FAILURE' AND status<>'REJECTED'))":"status<>'REJECTED'")+" LIMIT 1 FOR UPDATE",
        [sourceId],
      );
      C.fail(
        existing.length,
        "IN_USE",
        "Dòng đã có đề xuất đang hiệu lực.",
        409,
      );
      const [r] = await c.execute(
        "INSERT INTO exception_proposals(code,type,qc_inspection_line_id,stocktake_line_id,created_by,action,quantity,reason,resolution_note,status,version) VALUES (?,?,?,?,?,?,?,?,?,'PENDING_APPROVAL',1)",
        [
          await recordCode.next(c, 'exception_proposals', 'DX', `${type}-${b.reason}`),
          type,
          b.qc_inspection_line_id || null,
          b.stocktake_line_id || null,
          u.id,
          action,
          quantity,
          b.reason,
          b.resolution_note,
        ],
      );
      target = r.insertId;
      if (type === "STOCKTAKE_DIFFERENCE")
        await c.execute(
          "UPDATE stocktake_lines SET resolution_status='PENDING_APPROVAL',version=version+1 WHERE id=?",
          [sourceId],
        );
      await this.audit(c, u, target, "CREATE", request);
    });
    return this.get(u, target);
  }
  async review(u, r, b, request) {
    if(/^LOT-[1-9]\d*$/.test(String(r)))return require('./minute-exceptions').act(this,u,String(r).slice(4),b,'review',request);
    P.role(u, ["DIRECTOR"]);
    C.fields(b, ["version", "decision", "reason"]);
    b = {
      ...b,
      decision:
        { APPROVE: "APPROVED", REJECT: "REJECTED" }[b.decision] || b.decision,
    };
    C.fail(
      !["APPROVED", "REJECTED"].includes(b.decision),
      "VALIDATION_ERROR",
      "Quyết định không hợp lệ.",
    );
    if (b.decision === "REJECTED") C.text(b.reason, "reason", 5000);
    else if (b.reason !== undefined) C.text(b.reason, "reason", 5000, false);
    await this.tx(async (c) => {
      const [[row]] = await c.execute(
        "SELECT * FROM exception_proposals WHERE id=? FOR UPDATE",
        [r],
      );
      C.fail(!row, "NOT_FOUND", "Không tìm thấy đề xuất.", 404);
      C.version(row, b.version);
      C.state(row, ["PENDING_APPROVAL"]);
      C.fail(
        String(row.created_by) === String(u.id),
        "FORBIDDEN",
        "Người lập không tự duyệt đề xuất.",
        403,
      );
      await c.execute(
        "INSERT INTO exception_decisions(exception_proposal_id,proposal_version,decision,reviewed_by,reason) VALUES (?,?,?,?,?)",
        [r, row.version, b.decision, u.id, b.reason || null],
      );
      await c.execute(
        "UPDATE exception_proposals SET status=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP(6),rejection_reason=?,version=version+1 WHERE id=?",
        [b.decision, u.id, b.decision === "REJECTED" ? b.reason : null, r],
      );
      if (b.decision === "REJECTED" && row.stocktake_line_id)
        await c.execute(
          "UPDATE stocktake_lines SET resolution_status='NONE',version=version+1 WHERE id=?",
          [row.stocktake_line_id],
        );
      await this.audit(c, u, r, "REVIEW_" + b.decision, request);
    });
    return this.get(u, r);
  }
  async apply(u, r, b, request) {
    if(/^LOT-[1-9]\d*$/.test(String(r)))return require('./minute-exceptions').act(this,u,String(r).slice(4),b,'apply',request);
    P.role(u, ["WAREHOUSE_MANAGER"]);
    C.fields(b, ["version"]);
    await this.tx(async (c) => {
      const [[row]] = await c.execute(
        "SELECT * FROM exception_proposals WHERE id=? FOR UPDATE",
        [r],
      );
      C.fail(!row, "NOT_FOUND", "Không tìm thấy đề xuất.", 404);
      C.version(row, b.version);
      C.state(row, ["APPROVED"]);
      if (row.type === "STOCKTAKE_DIFFERENCE") {
        const [[line]] = await c.execute(
          "SELECT l.*,w.warehouse_id,w.status AS warehouse_status,w.conclusion_status FROM stocktake_lines l JOIN stocktake_warehouses w ON w.id=l.stocktake_warehouse_id WHERE l.id=? FOR UPDATE",
          [row.stocktake_line_id],
        );
        C.fail(
          !line ||
            line.warehouse_status !== "COMPLETED" ||
            line.conclusion_status !== "SUBMITTED",
          "INVALID_STATE",
          "Cần kết luận đã gửi trước khi điều chỉnh.",
          409,
        );
        await c.execute("SELECT id FROM warehouses WHERE id=? FOR UPDATE", [
          line.warehouse_id,
        ]);
        const [[balance]] = await c.execute(
          "SELECT * FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket=? FOR UPDATE",
          [line.lot_id, line.location_id, line.quality_bucket],
        );
        C.fail(
          !balance ||
            C.qty(String(balance.quantity), false) !==
              C.qty(String(line.system_quantity), false),
          "SNAPSHOT_CONFLICT",
          "Tồn đã đổi sau snapshot.",
          409,
        );
        const actual = C.qty(String(line.actual_quantity), false),
          delta = actual - C.qty(String(balance.quantity), false);
        C.fail(
          (delta < 0n ? -delta : delta) !== C.qty(String(row.quantity)),
          "SOURCE_LIMIT_EXCEEDED",
          "Chênh lệch không khớp đề xuất.",
          409,
        );
        const [[held]] = await c.execute(
          "SELECT COALESCE(SUM(a.quantity-a.posted_quantity),0) AS quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=? AND a.location_id=? AND a.quality_bucket=? AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'",
          [line.lot_id, line.location_id, line.quality_bucket],
        );
        C.fail(
          actual < C.qty(String(held.quantity), false),
          "RESERVATION_CONFLICT",
          "Cần giải phóng phân công trước khi giảm tồn dưới lượng giữ chỗ.",
          409,
        );
        await c.execute(
          "UPDATE inventory_balances SET quantity=?,version=version+1 WHERE id=?",
          [C.decimal(actual), balance.id],
        );
        await c.execute(
          "INSERT INTO inventory_movements(lot_id,location_id,quality_bucket,quantity_delta,exception_proposal_id,posted_at,created_by,operation_key) VALUES (?,?,?,?,?,UTC_TIMESTAMP(6),?,?)",
          [
            line.lot_id,
            line.location_id,
            line.quality_bucket,
            C.decimal(delta),
            r,
            u.id,
            "exception-" + r,
          ],
        );
        await c.execute(
          "UPDATE stocktake_lines SET resolution_status='RESOLVED',version=version+1 WHERE id=?",
          [line.id],
        );
      } else if (row.type === 'QUARANTINE_DISPOSITION') {
        await require('./quarantine').apply(c,u,row);
      } else {
        await require('./unreceived-failure').validate(c, row.qc_inspection_line_id);
        if (row.action === "RELEASE") {
          await this.release(c, u, row, request);
        } else {
        const [[line]] = await c.execute(
          "SELECT q.*,l.purchase_order_line_id FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id WHERE q.id=? FOR UPDATE",
          [row.qc_inspection_line_id],
        );
        C.fail(!line, "NOT_FOUND", "Không tìm thấy dòng QC.", 404);
        await require('./remaining-failure').validate(c,line,row.quantity);
        C.fail(
          C.qty(String(row.quantity)) >
            C.qty(String(line.failed_quantity), false),
          "SOURCE_LIMIT_EXCEEDED",
          "Vượt lượng QC lỗi.",
        );
        if (row.action === "RETURN_SUPPLIER") {
          C.fail(
            !line.purchase_order_line_id,
            "INVALID_STATE",
            "Thành phẩm không có nguồn mua để trả NCC.",
            409,
          );
          const [header] = await c.execute(
            "INSERT INTO lot_headers(code,lot_kind,return_direction,note) VALUES (?,'TRA_VE','NCC',?)",
            [
              await recordCode.next(c, 'lot_headers', 'TRANCC', row.code),
              row.resolution_note,
            ],
          );
          await c.execute(
            "INSERT INTO returned_lot_lines(lot_header_id,original_lot_detail_id,quantity,exception_proposal_id) VALUES (?,?,?,?)",
            [header.insertId, line.lot_id, row.quantity, r],
          );
        }
        }
      }
      await c.execute(
        "UPDATE exception_proposals SET status='APPLIED',applied_at=UTC_TIMESTAMP(6),version=version+1 WHERE id=?",
        [r],
      );
      await this.audit(c, u, r, "APPLY", request);
    });
    return this.get(u, r);
  }

  async reinspect(u, r, b, request) {
    P.role(u, ["QC_INSPECTOR"]);
    C.fields(b, ["version", "result", "note"]);
    C.text(b.note, "note", 5000);
    C.fail(!["PASSED", "FAILED"].includes(b.result), "VALIDATION_ERROR", "Chọn kết luận đạt hoặc không đạt.");
    await this.tx(async c => {
      const [[row]] = await c.execute("SELECT * FROM exception_proposals WHERE id=? FOR UPDATE", [r]);
      C.fail(!row, "NOT_FOUND", "Không tìm thấy đề xuất.", 404);
      C.version(row, b.version);
      C.state(row, ["APPROVED"]);
      C.fail(!((row.action==='RELEASE' && ['QC_FAILURE','QUARANTINE_DISPOSITION'].includes(row.type)) || (row.action==='QUARANTINE' && row.type==='QUARANTINE_DISPOSITION')), "INVALID_STATE", "Đề xuất không yêu cầu tái kiểm.", 409);
      const [[source]] = await c.execute("SELECT q.inspector_id FROM qc_inspection_lines l JOIN qc_inspections q ON q.id=l.qc_inspection_id WHERE l.id=?", [row.qc_inspection_line_id]);
      C.fail(!source || String(source.inspector_id) !== String(u.id), "FORBIDDEN", "Chỉ người QC phụ trách kết quả nguồn được tái kiểm.", 403);
      await c.execute("INSERT INTO TaiKiemChatLuong(MaDeXuatXuLy,PhienBanDeXuat,MaNguoiKiemTra,SoLuong,KetLuan,GhiChu) VALUES (?,?,?,?,?,?)", [r,row.version,u.id,row.quantity,b.result,b.note]);
      await c.execute("UPDATE exception_proposals SET version=version+1 WHERE id=?", [r]);
      await this.audit(c, u, r, "REINSPECT_"+b.result, request);
    });
    return this.legacyGet(u, r);
  }

  async release(c, u, row, request) {
    const [[check]] = await c.execute("SELECT * FROM TaiKiemChatLuong WHERE MaDeXuatXuLy=? ORDER BY MaBanGhi DESC LIMIT 1", [row.id]);
    C.fail(!check || check.KetLuan !== "PASSED" || C.qty(String(check.quantity)) !== C.qty(String(row.quantity)), "REINSPECTION_REQUIRED", "Cần kết quả tái kiểm đạt đúng lượng được duyệt.", 409);
    const [[source]] = await c.execute("SELECT * FROM qc_inspection_lines WHERE id=?", [row.qc_inspection_line_id]);
    C.fail(!source, "NOT_FOUND", "Không tìm thấy kết quả nguồn.", 404);
    const [[report]] = await c.execute("SELECT * FROM qc_inspections WHERE id=? FOR UPDATE", [source.qc_inspection_id]);
    const [before] = await c.execute("SELECT * FROM qc_inspection_lines WHERE qc_inspection_id=? ORDER BY id FOR UPDATE", [report.id]);
    const line = before.find(l => String(l.id) === String(source.id));
    const [[lot]] = await c.execute("SELECT * FROM lots WHERE id=? FOR UPDATE", [line.lot_id]);
    const [returned] = await c.execute("SELECT id FROM returned_lot_lines WHERE original_lot_detail_id=?", [line.lot_id]);
    C.fail(returned.length, "IN_USE", "Hàng đã trả không thể đưa về lượng đạt bằng tái kiểm.", 409);
    C.fail(lot.expiry_date && new Date(lot.expiry_date).toISOString().slice(0,10) < C.today(), "LOT_EXPIRED", "Không sử dụng lại hàng hết hạn.", 409);
    const amount = C.qty(String(row.quantity)), failed = C.qty(String(line.failed_quantity), false);
    await require('./remaining-failure').validate(c,line,row.quantity);
    C.fail(amount > failed, "SOURCE_LIMIT_EXCEEDED", "Vượt lượng lỗi còn lại.", 409);
    const newFailed=failed-amount, newPassed=C.qty(String(line.passed_quantity),false)+amount;
    await c.execute("UPDATE qc_inspection_lines SET passed_quantity=?,failed_quantity=? WHERE id=?", [C.decimal(newPassed),C.decimal(newFailed),line.id]);
    const [after] = await c.execute("SELECT * FROM qc_inspection_lines WHERE qc_inspection_id=? ORDER BY id", [report.id]);
    await c.execute("INSERT INTO qc_compensations(original_qc_id,original_version,created_by,reason,before_data,after_data) VALUES (?,?,?,?,?,?)", [report.id,report.version,u.id,"RELEASE "+row.code+": "+check.note,JSON.stringify(before),JSON.stringify(after)]);
    await c.execute("UPDATE qc_inspections SET version=version+1 WHERE id=?", [report.id]);
    await c.execute("UPDATE lots SET qc_status=?,version=version+1 WHERE id=?", [newFailed===0n?"PASSED":"PARTIAL",lot.id]);
    await require('../stock-requests/partial-progress').refresh(c,[lot.id]);
    // The released portion was never received. Receiving it still needs the normal stock request and receipt.
    await this.audit(c,u,row.id,"RELEASE_QC",request);
  }
}
module.exports = ExceptionService;
