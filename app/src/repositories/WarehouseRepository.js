class WarehouseRepository {
  constructor(storage) {
    this.storage = storage;
  }
  find(id) {
    return this.storage.get("warehouses", id);
  }
  static async findSql(connection, id) {
    const [rows] = await connection.execute(
      "SELECT * FROM warehouses WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }
}
module.exports = WarehouseRepository;
