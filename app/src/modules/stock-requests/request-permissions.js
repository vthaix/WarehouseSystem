// =============================================================================
// AI THẤY YÊU CẦU NÀO, VÀ ĐƯỢC BẤM NÚT GÌ
//
// Mọi điều kiện hiện nút ở đây phải khớp với kiểm tra trong StockRequestService
// (update/remove) và WarehouseFlowService (dispatch); nếu không, người dùng sẽ
// thấy nút nhưng bấm vào lại bị API từ chối.
// =============================================================================

const has = (user, role) => user.roles.includes(role);
/** Ban giám đốc và quản lý kho xem toàn bộ yêu cầu. */
const seesAll = (user) => has(user, "WAREHOUSE_MANAGER") || has(user, "DIRECTOR");

/** Người dùng có được xem yêu cầu này không (dùng khi mở chi tiết). */
function canView(user, row) {
  if (seesAll(user)) return true;
  if (has(user, "WORKSHOP_OWNER")) return user.workshop_ids.includes(String(row.workshop_id));
  if (has(user, "PLANNER")) return row.purpose === "MATERIAL_PURCHASE";
  return has(user, "WAREHOUSE_STAFF") && row.assignee_ids?.includes(String(user.id));
}

/** Điều kiện SQL giới hạn danh sách theo vai trò (cùng quy tắc với canView). */
function listScope(user) {
  if (seesAll(user)) return { where: [], params: [] };
  if (has(user, "WORKSHOP_OWNER")) {
    if (!user.workshop_ids.length) return { where: ["1=0"], params: [] };
    return {
      where: ["r.workshop_id IN (" + user.workshop_ids.map(() => "?").join(",") + ")"],
      params: [...user.workshop_ids],
    };
  }
  if (has(user, "PLANNER")) return { where: ["r.purpose='MATERIAL_PURCHASE'"], params: [] };
  if (has(user, "WAREHOUSE_STAFF"))
    return {
      where: ["EXISTS (SELECT 1 FROM stock_allocations a WHERE a.stock_request_id=r.id AND a.user_id=?)"],
      params: [user.id],
    };
  return { where: [], params: [] };
}

/**
 * Các nút thao tác trên một yêu cầu.
 * @param row        dòng stock_requests (còn ThoiDiemThucHien)
 * @param dispatched kho đã phân công người thực hiện chưa
 */
function actionsFor(user, row, dispatched) {
  const actions = [];

  // UC-24.1/24.2: chủ xưởng sửa/hủy khi yêu cầu còn chờ và kho chưa phân công.
  // Đợt nhập thành phẩm thủ công đã ghi lô nên chỉ được hủy, không sửa.
  const ownerMayChange =
    has(user, "WORKSHOP_OWNER") &&
    !has(user, "WAREHOUSE_MANAGER") &&
    user.workshop_ids.includes(String(row.workshop_id)) &&
    row.status === "PENDING" &&
    !dispatched;
  if (ownerMayChange) actions.push(...(row.production_source_mode === "MANUAL" ? ["delete"] : ["edit", "delete"]));

  // Quản lý kho phụ trách: phân công (hoặc sửa phân công) khi còn hàng chưa xử lý.
  const managerMayDispatch =
    has(user, "WAREHOUSE_MANAGER") &&
    String(row.manager_id) === String(user.id) &&
    row.purpose !== "MATERIAL_PURCHASE" &&
    ["PENDING", "PARTIALLY_FULFILLED"].includes(row.status);
  if (managerMayDispatch) actions.push("dispatch");

  if (!managerCancelBlocker(user, row)) actions.push("delete");
  return actions;
}

/**
 * Lý do quản lý kho KHÔNG được hủy yêu cầu, hoặc null nếu được hủy.
 * Dùng chung cho nút (actionsFor) và kiểm tra ở API (remove).
 */
function managerCancelBlocker(user, row) {
  const deny = (code, message) => ({ code, message });
  if (!has(user, "WAREHOUSE_MANAGER")) return deny("FORBIDDEN", "Chỉ quản lý kho phụ trách được hủy.");
  if (String(row.manager_id) !== String(user.id)) return deny("FORBIDDEN", "Không phụ trách yêu cầu này.");
  if (row.purpose === "MATERIAL_PURCHASE") return deny("INVALID_STATE", "Yêu cầu này không thuộc điều phối kho.");
  // Đã ghi phiếu một phần thì trạng thái là PARTIALLY_FULFILLED: không hủy toàn bộ được nữa.
  if (row.status !== "PENDING") return deny("INVALID_STATE", "Chỉ hủy được yêu cầu chưa ghi phiếu kho nào.");
  if (row.ThoiDiemThucHien && new Date(row.ThoiDiemThucHien).getTime() <= Date.now())
    return deny("INVALID_STATE", "Chỉ được hủy trước ngày giờ thực hiện.");
  return null;
}

module.exports = { canView, listScope, actionsFor, managerCancelBlocker };
