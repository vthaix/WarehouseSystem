// =============================================================================
// VỊ TRÍ TRONG KHO ĐƯỢC PHÂN CÔNG (UC-08/09 phân công → UC-10/11 nhân viên thực hiện)
// Mỗi phần phân công còn hiệu lực: mặt hàng, lô, kho, khu, ô và số lượng.
// Dùng cho chi tiết yêu cầu / nhập xuất kho, chi tiết công việc, biểu mẫu ghi phiếu và thông báo.
// =============================================================================
const C = require("../services/domain/core");
const numbers = require("../../public/js/number-format");

const zoneLabel = (zone) => (zone || "Khu chung").replace(/^Khu [A-Z] · /, "Khu ");
const positionLabel = (row) => [row.location_code, row.location_name].filter((v, i, all) => v && all.indexOf(v) === i).join(" · ");

/** @param scope { requestId | taskId, userId? } — userId: chỉ lấy phần giao cho nhân viên đó. */
async function load(connection, { requestId, taskId, userId }) {
  const where = ["t.status<>'CANCELLED'"], params = [];
  if (requestId) { where.push("a.stock_request_id=?"); params.push(requestId); }
  if (taskId) { where.push("a.task_id=?"); params.push(taskId); }
  if (userId) { where.push("a.user_id=?"); params.push(userId); }
  const [rows] = await connection.execute(
    "SELECT a.quantity,a.posted_quantity,i.name AS item_name,un.name AS unit,l.code AS lot_code,w.name AS warehouse_name," +
      "loc.zone_name,loc.code AS location_code,loc.name AS location_name,us.full_name AS assignee_name" +
      " FROM stock_allocations a JOIN tasks t ON t.id=a.task_id JOIN lots l ON l.id=a.lot_id JOIN items i ON i.id=l.item_id" +
      " JOIN units un ON un.id=i.unit_id JOIN warehouse_locations loc ON loc.id=a.location_id JOIN warehouses w ON w.id=loc.warehouse_id" +
      " JOIN users us ON us.id=a.user_id WHERE " + where.join(" AND ") + " ORDER BY a.id",
    params,
  );
  return rows.map((row) => ({
    item_name: row.item_name,
    zone_name: zoneLabel(row.zone_name),
    location_name: positionLabel(row),
    quantity: C.decimal(C.qty(String(row.quantity), false)),
    remaining_quantity: C.decimal(C.qty(String(row.quantity), false) - C.qty(String(row.posted_quantity), false)),
    unit: row.unit,
    lot_code: row.lot_code,
    warehouse_name: row.warehouse_name,
    ...(userId ? {} : { assignee_name: row.assignee_name }), // nhân viên chỉ xem phần của mình
  }));
}

/** Câu mô tả ngắn cho thông báo: "Bột mì: 56 kg tại Kho A › Khu bột › A-01". */
function describe(positions) {
  return positions
    .map((p) => `${p.item_name}: ${numbers.display(p.quantity)} ${p.unit} tại ${p.warehouse_name} › ${p.zone_name} › ${p.location_name}`)
    .join("; ");
}

module.exports = { load, describe, zoneLabel, positionLabel };
