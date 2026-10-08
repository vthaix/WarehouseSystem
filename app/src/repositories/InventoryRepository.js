class InventoryRepository {
  constructor(storage) {
    this.storage = storage;
  }
  all() {
    return this.storage.all("inventory");
  }
  static async byWarehouseSql(connection, warehouseId) {
    const [rows] = await connection.execute(
      "SELECT b.* FROM inventory_balances b JOIN warehouse_locations l ON l.id = b.location_id WHERE l.warehouse_id = ? ORDER BY b.id",
      [warehouseId],
    );
    return rows;
  }
}
module.exports = InventoryRepository;
