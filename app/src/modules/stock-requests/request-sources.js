// =============================================================================
// NGUỒN CỦA YÊU CẦU NHẬP/XUẤT KHO (UC-23)
//
// Mỗi yêu cầu có một "mục đích" (purpose). Mục đích cho biết hàng được nhập/xuất
// dựa trên chứng từ nào và lượng tối đa được yêu cầu là bao nhiêu:
//
//   PURCHASE_RECEIPT   Nhập nguyên vật liệu   theo đơn mua hàng
//   PRODUCTION_ISSUE   Xuất nguyên vật liệu   theo báo cáo nhu cầu / KHSX
//   PRODUCTION_RECEIPT Nhập thành phẩm        theo báo cáo thành phẩm / KHSX
//   SALE_ISSUE         Xuất thành phẩm bán    theo kế hoạch bán
//   MATERIAL_PURCHASE  Đề nghị mua nguyên vật liệu (không đi qua kho)
// =============================================================================
const C = require("../../services/domain/core");

const isId = (value) => /^[1-9]\d*$/.test(String(value));

/**
 * Mô tả chứng từ nguồn của từng mục đích:
 *   type     IN (nhập) / OUT (xuất) / PROCUREMENT (đề nghị mua)
 *   field    cột trên stock_requests lưu mã chứng từ nguồn
 *   table    bảng chứng từ nguồn;  lines/lineKey: bảng dòng và khóa nối
 *   quantity cột số lượng trên bảng dòng (mặc định "quantity")
 *   states   trạng thái chứng từ nguồn cho phép lập yêu cầu
 *   kind     loại mặt hàng: MATERIAL (NVL) / FINISHED_PRODUCT (thành phẩm)
 */
const PURPOSES = {
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

/** Xuất NVL lấy thẳng định mức của KHSX đã duyệt (production_source_mode = PLAN). */
const ISSUE_BY_PLAN = {
  type: "OUT",
  field: "production_plan_id",
  table: "production_plans",
  lines: "production_plan_materials",
  lineKey: "production_plan_id",
  quantity: "required_quantity",
  states: ["APPROVED", "IN_PROGRESS"],
  kind: "MATERIAL",
};

/** Nhập thành phẩm từng phần do chủ xưởng tự nhập (production_source_mode = MANUAL). */
const MANUAL_RECEIPT = {
  type: "IN",
  field: "production_plan_id",
  table: "production_plans",
  lines: "production_plan_outputs",
  lineKey: "production_plan_id",
  states: ["APPROVED", "IN_PROGRESS", "COMPLETED"],
  kind: "FINISHED_PRODUCT",
};

/** Tiền tố mã chứng từ, ví dụ YC-NHAP-NVL-AHTOR-001. */
const CODE_PREFIX = {
  PURCHASE_RECEIPT: "YC-NHAP-NVL",
  PRODUCTION_ISSUE: "YC-XUAT-NVL",
  PRODUCTION_RECEIPT: "YC-NHAP-TP",
  SALE_ISSUE: "YC-XUAT-TP",
  MATERIAL_PURCHASE: "YC-MUA-NVL",
};

/** Trả về mô tả nguồn theo mục đích và chế độ nguồn sản xuất. */
function definition(purpose, mode = "REPORT") {
  if (purpose === "PRODUCTION_RECEIPT" && mode === "MANUAL") return MANUAL_RECEIPT;
  if (purpose === "PRODUCTION_ISSUE" && mode === "PLAN") return ISSUE_BY_PLAN;
  return PURPOSES[purpose];
}

/**
 * Khóa và kiểm tra chứng từ nguồn, rồi tính lượng tối đa còn được yêu cầu
 * cho từng mặt hàng.
 *
 * @returns {{definition, source, limits: Map<itemId, bigint>}}
 *          limits là lượng tối đa (đơn vị nghìn, kiểu BigInt của C.qty).
 */
async function load(c, purpose, sourceId, workshopId, mode = "REPORT") {
  const def = definition(purpose, mode);
  C.fail(!def || !isId(sourceId), "VALIDATION_ERROR", "Nguồn yêu cầu không hợp lệ.");

  // 1. Chứng từ nguồn phải tồn tại và đang ở trạng thái cho phép.
  const [rows] = await c.execute(`SELECT * FROM ${def.table} WHERE id=? FOR UPDATE`, [sourceId]);
  C.fail(
    !rows.length || !def.states.includes(rows[0].status),
    "INVALID_STATE",
    "Nguồn chưa sẵn sàng hoặc đã hoàn tất.",
    409,
  );
  const source = rows[0];

  // 2. Xuất NVL / đề nghị mua theo báo cáo: chỉ báo cáo loại "nhu cầu" mới hợp lệ.
  const usesDemandReport = ["PRODUCTION_ISSUE", "MATERIAL_PURCHASE"].includes(purpose) && mode !== "PLAN";
  C.fail(
    usesDemandReport && source.report_purpose !== "NHU_CAU",
    "INVALID_STATE",
    "Báo cáo tiến độ/sự cố không phải nguồn nhu cầu nguyên vật liệu.",
    409,
  );

  // Khi nguồn chính là KHSX thì mã KHSX là chính chứng từ đó.
  if (def === ISSUE_BY_PLAN || def === MANUAL_RECEIPT) source.production_plan_id = source.id;

  // 3. Xưởng lập yêu cầu phải là xưởng của nguồn hàng.
  const sourceWorkshop = await workshopOf(c, purpose, source);
  C.fail(
    sourceWorkshop && String(sourceWorkshop) !== String(workshopId),
    "VALIDATION_ERROR",
    "Xưởng không khớp nguồn.",
  );

  // 4. Xuất bán: nguồn phải là kế hoạch bán và đã đủ điều kiện giao.
  if (purpose === "SALE_ISSUE") {
    C.fail(source.type !== "SALE", "VALIDATION_ERROR", "Kế hoạch phải là kế hoạch bán.");
    await require("./sale-readiness").saleReadiness(c, source.id, workshopId);
  }

  // 5. Lượng tối đa theo từng mặt hàng.
  const limits = await limitsOf(c, purpose, mode, def, source, sourceId);
  return { definition: def, source, limits };
}

/** Xưởng sở hữu nguồn hàng, hoặc null nếu nguồn không gắn xưởng. */
async function workshopOf(c, purpose, source) {
  if (["PRODUCTION_ISSUE", "PRODUCTION_RECEIPT", "MATERIAL_PURCHASE"].includes(purpose)) {
    const [plans] = await c.execute(
      "SELECT p.workshop_id FROM production_plans p WHERE p.id=? FOR UPDATE",
      [source.production_plan_id],
    );
    return plans[0]?.workshop_id;
  }
  if (purpose === "PURCHASE_RECEIPT") {
    // Đơn mua → kế hoạch mua → (báo cáo nhu cầu | yêu cầu mua | KHSX) → xưởng.
    const [plans] = await c.execute(
      "SELECT COALESCE(ps.workshop_id,r.workshop_id,s.workshop_id) AS workshop_id" +
        " FROM business_plans p" +
        " LEFT JOIN production_reports pr ON pr.id=p.production_report_id" +
        " LEFT JOIN production_plans ps ON ps.id=pr.production_plan_id" +
        " LEFT JOIN stock_requests r ON r.id=p.source_request_id" +
        " LEFT JOIN production_plans s ON s.id=p.production_plan_id" +
        " WHERE p.id=?",
      [source.business_plan_id],
    );
    return plans[0]?.workshop_id || null;
  }
  return null;
}

/**
 * Lượng tối đa được yêu cầu cho từng mặt hàng:
 *   - mặc định: số lượng trên dòng chứng từ nguồn;
 *   - đề nghị mua: phần thiếu = cần dùng - đang có;
 *   - nhập NVL / nhập thành phẩm từng phần: không vượt lượng QC đạt;
 *   - xuất NVL theo KHSX: không vượt nhu cầu đã báo cáo (nếu có báo cáo).
 */
async function limitsOf(c, purpose, mode, def, source, sourceId) {
  const quantityColumn = def.quantity || "quantity";
  const extraColumn = purpose === "MATERIAL_PURCHASE" ? ",available_quantity" : "";
  const onlyFinishedRows = purpose === "PRODUCTION_RECEIPT" && mode !== "MANUAL" ? " AND detail_kind='THANH_PHAM'" : "";
  const [sourceLines] = await c.execute(
    `SELECT item_id,${quantityColumn} AS quantity${extraColumn} FROM ${def.lines} WHERE ${def.lineKey}=?${onlyFinishedRows}`,
    [sourceId],
  );
  const limits = new Map(
    sourceLines.map((line) => [
      String(line.item_id),
      purpose === "MATERIAL_PURCHASE"
        ? C.qty(String(line.quantity)) - C.qty(String(line.available_quantity), false)
        : C.qty(String(line.quantity)),
    ]),
  );

  const capByQualityPassed =
    purpose === "PURCHASE_RECEIPT" || (purpose === "PRODUCTION_RECEIPT" && source.KieuThanhPham === "PART");
  if (capByQualityPassed) {
    const passed = await qualityPassedByItem(c, purpose, sourceId);
    for (const [item, amount] of limits) {
      const good = passed.get(item) || 0n;
      limits.set(item, good < amount ? good : amount);
    }
  }

  if (def === ISSUE_BY_PLAN) {
    const [reported] = await c.execute(
      "SELECT l.item_id,l.required_quantity FROM production_report_lines l" +
        " JOIN production_reports r ON r.id=l.production_report_id" +
        " WHERE r.production_plan_id=? AND r.status='SUBMITTED'",
      [sourceId],
    );
    if (reported.length) {
      const required = new Map(reported.map((l) => [String(l.item_id), C.qty(String(l.required_quantity))]));
      for (const [item, quantity] of limits) {
        const need = required.get(item);
        limits.set(item, need === undefined ? 0n : need < quantity ? need : quantity);
      }
    }
  }
  return limits;
}

/** Tổng lượng QC đạt theo mặt hàng của đơn mua hoặc báo cáo thành phẩm. */
async function qualityPassedByItem(c, purpose, sourceId) {
  const recorded = "JOIN qc_inspection_lines q ON q.lot_id=l.id JOIN qc_inspections qi ON qi.id=q.qc_inspection_id AND qi.status='RECORDED'";
  const sql =
    purpose === "PURCHASE_RECEIPT"
      ? "SELECT l.item_id,SUM(q.passed_quantity) AS quantity FROM lots l " + recorded +
        " JOIN purchase_order_lines p ON p.id=l.purchase_order_line_id WHERE p.purchase_order_id=? GROUP BY l.item_id"
      : "SELECT l.item_id,SUM(q.passed_quantity) AS quantity FROM finished_report_outputs o JOIN lots l ON l.id=o.lot_id " + recorded +
        " WHERE o.finished_report_id=? GROUP BY l.item_id";
  const [rows] = await c.execute(sql, [sourceId]);
  return new Map(rows.map((row) => [String(row.item_id), C.qty(String(row.quantity), false)]));
}

module.exports = { PURPOSES, CODE_PREFIX, definition, load, isId };
