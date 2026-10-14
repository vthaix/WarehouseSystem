const C = require("../services/domain/core");

// All writers acquire warehouse locks before balances; snapshot excludes expired,
// quarantined and already reserved quantities.
async function availableStock(connection, itemIds) {
  await connection.query("SELECT id FROM warehouses ORDER BY id FOR UPDATE");
  const [rows] = await connection.execute(
    `SELECT b.lot_id,b.location_id,b.quantity,l.item_id,
    COALESCE((SELECT SUM(a.quantity-a.posted_quantity) FROM stock_allocations a JOIN tasks t ON t.id=a.task_id
      WHERE a.lot_id=b.lot_id AND a.location_id=b.location_id AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'),0) AS reserved
    FROM inventory_balances b JOIN lots l ON l.id=b.lot_id JOIN warehouse_locations loc ON loc.id=b.location_id
    JOIN warehouses w ON w.id=loc.warehouse_id WHERE b.quality_bucket='AVAILABLE' AND w.is_active=1
    AND l.qc_status IN ('PASSED','PARTIAL') AND (l.expiry_date IS NULL OR l.expiry_date>=CURRENT_DATE)
    AND l.item_id IN (${itemIds.map(() => "?").join(",")}) ORDER BY b.lot_id,b.location_id FOR UPDATE`,
    itemIds,
  );
  const quantities = new Map(itemIds.map((id) => [String(id), 0n]));
  for (const row of rows) {
    const value =
      C.qty(String(row.quantity), false) - C.qty(String(row.reserved), false);
    if (value > 0n)
      quantities.set(
        String(row.item_id),
        quantities.get(String(row.item_id)) + value,
      );
  }
  return quantities;
}
module.exports = availableStock;
