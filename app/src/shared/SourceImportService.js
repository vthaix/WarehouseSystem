const C = require("../services/domain/core");
const P = require("../services/domain/policy");
const validId = (v) => /^[1-9]\d*$/.test(String(v));
const q = (v) => C.qty(String(v), false);
const positive = (rows) => rows.filter((r) => q(r.quantity) > 0n);
const sum = (rows) => {
  const m = new Map();
  for (const r of rows)
    m.set(String(r.item_id), (m.get(String(r.item_id)) || 0n) + q(r.quantity));
  return m;
};
const remaining = (a, b) => C.decimal(a > b ? a - b : 0n);

// Scoped import data only. Save/post independently validates the live source.
class SourceImportService {
  constructor(runtime) {
    this.r = runtime;
    this.pool = runtime.pool;
  }
  async purchaseReports(user) {
    P.role(user, ["PURCHASER"]);
    const [rows] = await this.pool.execute(
      "SELECT id,code FROM business_plans WHERE type='PURCHASE' AND status='APPROVED' ORDER BY id DESC LIMIT 100",
    );
    return rows.map((r) => ({ ...r, id: String(r.id), name: r.code }));
  }
  async preview(user, target, body) {
    C.fields(body, [
      "source_id",
      "purpose",
      "production_source_mode",
      "workshop_id",
      "warehouse_id",
      "workflow_source","sale_plan_id",
    ]);
    C.fail(
      !validId(body.source_id)&&!(target==='stock-requests'&&body.workflow_source==='true'&&body.purpose==='PURCHASE_RECEIPT'&&/^ORDER:[1-9]\d*$/.test(String(body.source_id))),
      "VALIDATION_ERROR",
      "Chọn chứng từ nguồn.",
    );
    const id = body.source_id;
    if(body.workflow_source!==undefined){
      C.fail(target!=='stock-requests'||body.workflow_source!=='true','VALIDATION_ERROR','Nguồn luồng nhập/xuất không hợp lệ.');
      const helper=require('../modules/stock-requests/request-workflow');
      const source=await helper.resolve(this.pool,user,body.purpose,id,body.workshop_id,body.sale_plan_id);
      const field=body.purpose==='PURCHASE_RECEIPT'?'purchase_order_id':body.purpose==='SALE_ISSUE'?'business_plan_id':body.purpose==='PRODUCTION_ISSUE'?'production_plan_id':'production_report_id';
      const result=await this.preview(user,target,{source_id:source[field],purpose:body.purpose,production_source_mode:source.production_source_mode,workshop_id:body.workshop_id,...(body.warehouse_id?{warehouse_id:body.warehouse_id}:{})});
      return {...result,workflow_source_id:String(id),source_lots:await helper.lots(this.pool,{purpose:body.purpose,...source})};
    }
    if(target==='finished-reports') {
      P.role(user,['WORKSHOP_OWNER']);
      const plan=await this.r.productionPlans.get(user,id);C.state(plan,['APPROVED','IN_PROGRESS']);
      const [lots]=await this.pool.execute("SELECT l.item_id,l.code AS lot_code,l.received_quantity AS quantity,l.manufactured_date,l.expiry_date FROM lots l JOIN stock_requests r ON r.id=l.production_receipt_request_id WHERE l.production_plan_id=? AND (r.status<>'CANCELLED' OR EXISTS(SELECT 1 FROM stock_documents d WHERE d.stock_request_id=r.id)) ORDER BY l.id",[id]);
      const date=v=>v instanceof Date?v.toISOString().slice(0,10):v;
      return {production_plan_id:String(id),source_code:plan.code,outputs:lots.map(l=>({...l,item_id:String(l.item_id),manufactured_date:date(l.manufactured_date),expiry_date:date(l.expiry_date)})),warnings:['Đã lấy các dòng lô từ từng đợt nhập. Giữ nguyên các dòng này; chỉ thêm thành phẩm thực tế chưa ghi nhận. Nhập nguyên vật liệu thực dùng và xác nhận hoàn tất toàn bộ trước khi gửi tổng kết.']};
    }
    if (target === "production-plans") {
      P.role(user, ["PLANNER"]);
      const order = await this.r.orders.get(user, id);
      C.state(order, ["RECEIVED", "APPROVED", "IN_PROGRESS"]);
      const [allocated] = await this.pool.execute(
        "SELECT l.item_id,l.quantity FROM production_plan_outputs l JOIN production_plans p ON p.id=l.production_plan_id WHERE p.customer_order_id=? AND p.status<>'CANCELLED'",
        [id],
      );
      const used = sum(allocated);
      return {
        source_code: order.code,
        customer_order_id: String(id),
        customer_name:order.customer_name,
        delivery_address:order.delivery_address,
        latest_delivery_date:order.latest_delivery_date,
        customer_note:order.note,
        order_lines:order.lines,
        outputs: positive(
          order.lines.map((l) => ({
            item_id: String(l.item_id),
            item_name: l.item_name,
            quantity: remaining(
              q(l.quantity),
              used.get(String(l.item_id)) || 0n,
            ),
          })),
        ),
        warnings: ["Chọn xưởng, thời gian và nguyên vật liệu trước khi lưu."],
      };
    }
    if (target === "production-reports") {
      P.role(user, ["WORKSHOP_OWNER"]);
      const plan = await this.r.productionPlans.get(user, id);
      C.state(plan, ["APPROVED", "IN_PROGRESS"]);
      return {
        source_code: plan.code,
        production_plan_id: String(id),
        workshop_id: plan.workshop_id,
        lines: plan.materials.map((l) => ({
          item_id: l.item_id,
          item_name: l.item_name,
          required_quantity: l.required_quantity,
        })),
        warnings: [
          "nguyên vật liệu đã gồm dự phòng của kế hoạch; không cộng thêm 10%. Có thể sửa theo nhu cầu thực tế.",
        ],
      };
    }
    if (target === "purchase-orders") {
      P.role(user, ["PURCHASER"]);
      const plan=await this.r.businessPlans.get(user,id);
      C.fail(plan.type!=='PURCHASE'||plan.status!=='APPROVED','PURCHASE_APPROVAL_REQUIRED','Chỉ chọn kế hoạch mua nguyên vật liệu đã được phê duyệt.',409);
      return {
        source_code: plan.code,
        business_plan_id: String(id),
        expected_delivery_date:plan.planned_date,
        lines:
          plan.lines.map((l) => ({
            item_id: String(l.item_id),
            item_name: l.item_name,
            business_plan_line_id:String(l.id),
            quantity:l.quantity,
            unit_price: l.unit_price,
          })),
        warnings: [
          "Số lượng và ngày nhận theo kế hoạch đã duyệt. Chọn nhà cung cấp cho từng nguyên vật liệu.",
        ],
      };
    }
    if (target === "lots") {
      P.role(user, ["WAREHOUSE_MANAGER"]);
      const [[order]] = await this.pool.execute(
        "SELECT id,code FROM purchase_orders WHERE id=? AND status IN ('PENDING','PARTIALLY_RECEIVED')",
        [id],
      );
      C.fail(!order, "NOT_FOUND", "Đơn mua không còn chờ nhận.", 404);
      const [lines] = await this.pool.execute(
        "SELECT p.id,i.name AS item_name,p.supplier_id,s.name AS supplier_name,p.quantity,COALESCE((SELECT SUM(l.received_quantity) FROM lots l WHERE l.purchase_order_line_id=p.id),0) AS received FROM purchase_order_lines p JOIN items i ON i.id=p.item_id LEFT JOIN suppliers s ON s.id=p.supplier_id WHERE p.purchase_order_id=?",
        [id],
      );
      return {
        source_code: order.code,
        purchase_order_id: String(id),
        lines: positive(
          lines.map((l) => ({
            item_id: String(l.id),
            purchase_order_line_id: String(l.id),
            item_name: l.item_name,
            supplier_id: l.supplier_id == null ? null : String(l.supplier_id),
            supplier_name: l.supplier_name,
            quantity: remaining(q(l.quantity), q(l.received)),
          })),
        ),
        warnings: [
          "Hàng thực nhận chờ QC. Tồn khả dụng chỉ tăng khi ghi phiếu nhập phần đạt QC.",
        ],
      };
    }
    C.fail(
      target !== "stock-requests",
      "NOT_FOUND",
      "Không có luồng nhập nguồn này.",
      404,
    );
    P.role(user, ["WORKSHOP_OWNER"]);
    const mode = body.production_source_mode || "REPORT";
    C.fail(
      !["REPORT", "PLAN"].includes(mode) ||
        (mode === "PLAN" && body.purpose !== "PRODUCTION_ISSUE"),
      "VALIDATION_ERROR",
      "Nguồn xuất nguyên vật liệu không hợp lệ.",
    );
    const def = this.r.stockRequests.definition(body.purpose, mode);
    C.fail(!def, "VALIDATION_ERROR", "Chọn loại nhập/xuất.");
    let workshop = body.workshop_id;
    if (
      ["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT", "MATERIAL_PURCHASE"].includes(
        body.purpose,
      )
    ) {
      const src =
        mode === "PLAN"
          ? await this.r.productionPlans.get(user, id)
          : body.purpose === "PRODUCTION_RECEIPT"
            ? await this.r.finishedReports.get(user, id)
            : await this.r.productionReports.get(user, id);
      workshop = src.workshop_id;
    }
    C.fail(
      !validId(workshop) || !user.workshop_ids.includes(String(workshop)),
      "FORBIDDEN",
      "Nguồn ngoài xưởng được giao.",
      403,
    );
    if (body.warehouse_id)
      C.fail(
        !validId(body.warehouse_id),
        "VALIDATION_ERROR",
        "Kho không hợp lệ.",
      );
    const c = await this.pool.getConnection();
    try {
      await c.beginTransaction();
      const info = await this.r.stockRequests.source(
        c,
        body.purpose,
        id,
        workshop,
        mode,
      );
      const byPlan = ['PRODUCTION_ISSUE','PRODUCTION_RECEIPT'].includes(body.purpose)&&!(body.purpose==='PRODUCTION_RECEIPT'&&info.source.KieuThanhPham==='PART');
      if (body.purpose === "SALE_ISSUE") {
        const report = await this.r.finishedReports.get(
          user,
          info.source.finished_report_id,
          c,
        );
        C.fail(
          String(report.workshop_id) !== String(workshop),
          "FORBIDDEN",
          "Báo cáo thành phẩm ngoài xưởng được chọn.",
          403,
        );
      }
      const [requested] = await c.execute(
        `SELECT l.item_id,l.quantity FROM stock_request_lines l JOIN stock_requests r ON r.id=l.stock_request_id WHERE r.${byPlan ? "production_plan_id" : def.field}=? AND r.purpose=? AND r.status<>'CANCELLED'`,
        [byPlan ? info.source.production_plan_id : id, body.purpose],
      );
      const used = sum(requested);
      let caps = new Map(info.limits),
        evidence = [];
      const warnings = [];
      if (body.purpose === "PURCHASE_RECEIPT") {
        const [passed] = await c.execute(
          "SELECT l.item_id,q.passed_quantity AS quantity FROM lots l JOIN qc_inspection_lines q ON q.lot_id=l.id JOIN purchase_order_lines p ON p.id=l.purchase_order_line_id WHERE p.purchase_order_id=?",
          [id],
        );
        caps = sum(passed);
        warnings.push("Chỉ lấy lượng nguyên vật liệu đã đạt QC và chưa được yêu cầu nhập.");
      }
      const lines = [];
      for (const [item, limit] of caps) {
        const n = limit - (used.get(item) || 0n);
        if (n > 0n) lines.push({ item_id: item, quantity: C.decimal(n) });
      }
      if (body.purpose === "SALE_ISSUE") {
        C.fail(
          !info.source.finished_report_id,
          "SOURCE_REQUIRED",
          "Kế hoạch bán chưa có báo cáo thành phẩm nguồn.",
          409,
        );
        const [stock] = await c.execute(
          "SELECT l.id AS lot_id,l.item_id,l.code AS lot_code,l.qc_status,b.location_id,b.quantity,loc.warehouse_id,COALESCE((SELECT SUM(a.quantity-a.posted_quantity) FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=b.lot_id AND a.location_id=b.location_id AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'),0) AS reserved FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id JOIN inventory_balances b ON b.lot_id=l.id JOIN warehouse_locations loc ON loc.id=b.location_id JOIN warehouses w ON w.id=loc.warehouse_id WHERE o.finished_report_id=? AND b.quality_bucket='AVAILABLE' AND l.qc_status IN ('PASSED','PARTIAL') AND (l.expiry_date IS NULL OR l.expiry_date>=CURRENT_DATE) AND loc.is_active=1 AND w.is_active=1" +
            (body.warehouse_id ? " AND loc.warehouse_id=?" : ""),
          [
            info.source.finished_report_id,
            ...(body.warehouse_id ? [body.warehouse_id] : []),
          ],
        );
        const available = new Map();
        for (const s of stock) {
          const n = q(s.quantity) - q(s.reserved);
          if (n <= 0n) continue;
          available.set(
            String(s.item_id),
            (available.get(String(s.item_id)) || 0n) + n,
          );
          const [[count]] = await c.execute(
            "SELECT sw.id AS stocktake_warehouse_id,s.code,sw.conclusion_status,s.status,sl.actual_quantity,sl.resolution_status FROM stocktake_lines sl JOIN stocktake_warehouses sw ON sw.id=sl.stocktake_warehouse_id JOIN stocktakes s ON s.id=sw.stocktake_id WHERE sl.lot_id=? AND sl.location_id=? AND sl.quality_bucket='AVAILABLE' AND s.campaign_type='COUNT' ORDER BY s.id DESC LIMIT 1",
            [s.lot_id, s.location_id],
          );
          evidence.push({
            ...s,
            lot_id: String(s.lot_id),
            item_id: String(s.item_id),
            location_id: String(s.location_id),
            warehouse_id: String(s.warehouse_id),
            available_quantity: C.decimal(n),
            stocktake: count || null,
          });
        }
        for (const l of lines) {
          const n = available.get(l.item_id) || 0n;
          if (q(l.quantity) > n) l.quantity = C.decimal(n);
        }
        warnings.push(
          "Đối chiếu báo cáo thành phẩm, QC và tồn sau điều chỉnh kiểm kê. Nếu chưa có kiểm kê, không tạo số đếm giả.",
        );
      }
      if (body.warehouse_id) {
        const [[frozen]] = await c.execute(
          "SELECT COUNT(*) AS total FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id WHERE w.warehouse_id=? AND s.campaign_type='COUNT' AND w.status IN ('COUNTING','COMPLETED') AND s.status<>'CLOSED'",
          [body.warehouse_id],
        );
        if (Number(frozen.total))
          warnings.push("Kho đang khóa kiểm kê: chưa thể phân công/ghi phiếu.");
      }
      const itemIds = lines.map((l) => l.item_id);
      const [items] = itemIds.length
        ? await c.execute(
            "SELECT id,name FROM items WHERE id IN (" +
              itemIds.map(() => "?").join(",") +
              ")",
            itemIds,
          )
        : [[]];
      const names = new Map(items.map((i) => [String(i.id), i.name]));
      return {
        source_code: info.source.code,
        purpose: body.purpose,
        [def.field]: String(id),
        production_source_mode: mode,
        workshop_id: String(workshop),
        finished_report_id: info.source.finished_report_id
          ? String(info.source.finished_report_id)
          : null,
        lines: positive(lines).map((l) => ({
          ...l,
          item_name: names.get(l.item_id),
        })),
        evidence,
        warnings,
      };
    } finally {
      await c.rollback();
      c.release();
    }
  }
}
module.exports = SourceImportService;
