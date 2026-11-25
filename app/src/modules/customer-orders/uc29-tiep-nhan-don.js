const C = require("../../services/domain/core");
const P = require("../../services/domain/policy");
const transaction = require("../../shared/transaction");

async function receiveOrder(orders, user, orderId, body, requestId) {
  P.role(user, ["PLANNER"]);
  checkInput(body);

  await transaction(orders.pool, async (db) => {
    const order = await orders.load(db, user, orderId, true);
    checkStillWaiting(order);
    C.version(order, body.version);
    await markReceived(db, user, orderId);
    await orders.audit(db, user, orderId, "RECEIVE", { status: "SUBMITTED" }, { status: "RECEIVED" }, requestId);
  });

  return orders.get(user, orderId);
}

function checkInput(body) {
  C.fields(body, ["version"]);
  C.fail(!Number.isInteger(body.version), "VALIDATION_ERROR", "Thiếu phiên bản đơn hàng.");
}

function checkStillWaiting(order) {
  const waiting = order.status === "SUBMITTED";
  C.fail(!waiting, "INVALID_STATE",
    "Đơn hàng đã được tiếp nhận hoặc không còn được phép tiếp nhận. Vui lòng tải lại danh sách và chọn đơn khác.", 409);
}

async function markReceived(db, user, orderId) {
  await db.execute(
    `UPDATE customer_orders
        SET status = 'RECEIVED', received_by = ?, received_at = UTC_TIMESTAMP(6), version = version + 1
      WHERE id = ?`,
    [user.id, orderId],
  );
}

module.exports = receiveOrder;
