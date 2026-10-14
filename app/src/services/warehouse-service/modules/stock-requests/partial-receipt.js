const crypto = require("node:crypto"),
  C = require("../../../domain/core");
async function create(service, user, body, requestId) {
  C.fields(body, [
    "purpose",
    "production_source_mode",
    "production_plan_id",
    "workshop_id",
    "warehouse_id",
    "manager_id",
    "requested_date",
    "note",
    "lines",
    "receipt_key",
  ]);
  C.fail(
    ["production_plan_id", "workshop_id", "warehouse_id", "manager_id"].some(
      (k) => !/^[1-9]\d*$/.test(String(body[k] || "")),
    ),
    "VALIDATION_ERROR",
    "Chọn kế hoạch, xưởng, kho và quản lý hợp lệ.",
  );
  C.fail(
    !/^[a-zA-Z0-9-]{16,80}$/.test(body.receipt_key || ""),
    "VALIDATION_ERROR",
    "Thiếu khóa chống trùng cho đợt nhập.",
  );
  C.fail(
    !user.workshop_ids.includes(String(body.workshop_id)),
    "FORBIDDEN",
    "Xưởng ngoài phạm vi.",
    403,
  );
  C.date(body.requested_date, "requested_date");
  if (body.note !== undefined) C.text(body.note, "note", 5000, false);
  C.fail(
    !Array.isArray(body.lines) || !body.lines.length || body.lines.length > 100,
    "VALIDATION_ERROR",
    "Cần 1 đến 100 dòng thành phẩm.",
  );
  const seen = new Set();
  for (const line of body.lines) {
    C.fields(line, [
      "item_id",
      "quantity",
      "manufactured_date",
      "expiry_date",
      "note",
    ]);
    C.qty(line.quantity);
    C.date(line.manufactured_date, "manufactured_date");
    C.fail(
      line.manufactured_date > C.today(),
      "VALIDATION_ERROR",
      "Ngày sản xuất không được ở tương lai.",
    );
    if (line.expiry_date) C.date(line.expiry_date, "expiry_date");
    C.fail(
      line.expiry_date && line.expiry_date < line.manufactured_date,
      "VALIDATION_ERROR",
      "Hạn sử dụng trước ngày sản xuất.",
    );
    C.fail(
      seen.has(String(line.item_id)),
      "VALIDATION_ERROR",
      "Mặt hàng bị trùng.",
    );
    seen.add(String(line.item_id));
    if (line.note !== undefined) C.text(line.note, "note", 5000, false);
  }
  const c = await service.pool.getConnection();
  let id;
  try {
    await c.beginTransaction();
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");
    await c.execute(
      "INSERT INTO idempotency_records(user_id,operation,idempotency_key,request_hash,response_status,response_body,expires_at) VALUES (?,'partial-production-receipt',?,?,0,'{}',DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 10 YEAR)) ON DUPLICATE KEY UPDATE id=id",
      [user.id, body.receipt_key, hash],
    );
    const [[record]] = await c.execute(
      "SELECT * FROM idempotency_records WHERE user_id=? AND operation='partial-production-receipt' AND idempotency_key=? FOR UPDATE",
      [user.id, body.receipt_key],
    );
    C.fail(
      record.request_hash !== hash,
      "IDEMPOTENCY_CONFLICT",
      "Khóa đợt nhập đã dùng cho nội dung khác.",
      409,
    );
    if (record.response_status === 201) {
      id = (
        typeof record.response_body === "string"
          ? JSON.parse(record.response_body)
          : record.response_body
      ).id;
    } else {
      const [[plan]] = await c.execute(
        "SELECT * FROM production_plans WHERE id=? FOR UPDATE",
        [body.production_plan_id],
      );
      C.fail(
        !plan || String(plan.workshop_id) !== String(body.workshop_id),
        "NOT_FOUND",
        "Không tìm thấy kế hoạch thuộc xưởng.",
        404,
      );
      C.state(plan, ["APPROVED", "IN_PROGRESS"]);
      const [final] = await c.execute(
        "SELECT id FROM finished_reports WHERE production_plan_id=? FOR UPDATE",
        [plan.id],
      );
      C.fail(
        final.length,
        "IN_USE",
        "Đã lập báo cáo tổng kết, không thêm đợt nhập.",
        409,
      );
      const [[warehouse]] = await c.execute(
        "SELECT id FROM warehouses WHERE id=? AND is_active=1",
        [body.warehouse_id],
      );
      C.fail(!warehouse, "VALIDATION_ERROR", "Kho không hoạt động.");
      const manager = await service.manager(c, body.manager_id);
      C.fail(!manager, "VALIDATION_ERROR", "Cần chọn quản lý kho.");
      const [planned] = await c.execute(
        "SELECT p.item_id FROM production_plan_outputs p JOIN items i ON i.id=p.item_id WHERE p.production_plan_id=? AND i.kind='FINISHED_PRODUCT' AND i.is_active=1",
        [plan.id],
      );
      const allowed = new Set(planned.map((x) => String(x.item_id)));
      for (const line of body.lines)
        C.fail(
          !allowed.has(String(line.item_id)),
          "VALIDATION_ERROR",
          "Thành phẩm không thuộc kế hoạch.",
        );
      const [request] = await c.execute(
        "INSERT INTO stock_requests(code,type,purpose,production_plan_id,workshop_id,warehouse_id,created_by,manager_id,requested_date,status,note,version,production_source_mode) VALUES (?,'IN','PRODUCTION_RECEIPT',?,?,?,?,?,?,'PENDING',?,1,'MANUAL')",
        [
          "YCTP-" + crypto.randomBytes(8).toString("hex"),
          plan.id,
          body.workshop_id,
          body.warehouse_id,
          user.id,
          manager,
          body.requested_date,
          body.note || null,
        ],
      );
      id = request.insertId;
      await c.execute(
        "INSERT INTO lot_headers(code,lot_kind,partial_production_plan_id) VALUES (?,'THANH_PHAM',?) ON DUPLICATE KEY UPDATE id=id",
        ["TP-SX-" + plan.id, plan.id],
      );
      const [[header]] = await c.execute(
        "SELECT id FROM lot_headers WHERE partial_production_plan_id=?",
        [plan.id],
      );
      for (const line of body.lines) {
        await c.execute(
          "INSERT INTO stock_request_lines(stock_request_id,item_id,quantity,note) VALUES (?,?,?,?)",
          [
            id,
            line.item_id,
            C.decimal(C.qty(line.quantity)),
            line.note || null,
          ],
        );
        await c.execute(
          "INSERT INTO lots(code,lot_header_id,item_id,production_plan_id,production_receipt_request_id,manufactured_date,expiry_date,received_quantity,qc_status,version) VALUES (?,?,?,?,?,?,?,?,'PENDING',1)",
          [
            "TP-DOT-" + id + "-" + line.item_id,
            header.id,
            line.item_id,
            plan.id,
            id,
            line.manufactured_date,
            line.expiry_date || null,
            C.decimal(C.qty(line.quantity)),
          ],
        );
      }
      await c.execute(
        "INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'stock-requests',?,'PARTIAL_RECEIPT',?,?)",
        [
          user.id,
          id,
          JSON.stringify({
            production_plan_id: String(plan.id),
            lot_header_id: String(header.id),
          }),
          requestId,
        ],
      );
      await c.execute(
        "UPDATE idempotency_records SET response_status=201,response_body=? WHERE id=?",
        [JSON.stringify({ id: String(id) }), record.id],
      );
    }
    await c.commit();
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
  return service.get(user, id);
}
module.exports = { create };
