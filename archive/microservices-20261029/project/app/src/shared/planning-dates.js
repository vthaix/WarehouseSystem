const C = require('../services/domain/core');
const asDate = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
function window(start, end, deadline) {
  C.date(start, 'start_date', true);
  C.date(end, 'end_date', true);
  C.fail(end < start, 'VALIDATION_ERROR', 'Ngày kết thúc phải từ ngày bắt đầu trở đi.');
  C.fail(end > asDate(deadline), 'DELIVERY_DEADLINE_EXCEEDED', 'Ngày kết thúc KHSX không được vượt ngày giao thành phẩm của đơn hàng.', 422, { end_date: ['Vượt ngày giao thành phẩm'] });
}
async function businessDate(connection, source, date) {
  C.date(date, 'planned_date', true);
  let rows;
  if (source.type === 'PURCHASE' && source.production_plan_id) {
    [rows] = await connection.execute('SELECT p.end_date,o.latest_delivery_date FROM production_plans p JOIN customer_orders o ON o.id=p.customer_order_id WHERE p.id=?', [source.production_plan_id]);
  } else if (source.type === 'SALE' && source.customer_order_id) {
    [rows] = await connection.execute('SELECT latest_delivery_date FROM customer_orders WHERE id=?', [source.customer_order_id]);
  }
  if (rows?.length) {
    const limit = rows[0].end_date ? [asDate(rows[0].end_date), asDate(rows[0].latest_delivery_date)].sort()[0] : asDate(rows[0].latest_delivery_date);
    C.fail(date > limit, 'DELIVERY_DEADLINE_EXCEEDED', 'Ngày kế hoạch không được vượt hạn sản xuất / giao thành phẩm của đơn nguồn.');
  }
}
module.exports = { window, businessDate, asDate };
