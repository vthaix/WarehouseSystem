const Product = require("../models/Product");
class ProductRepository {
  constructor(storage) {
    this.storage = storage;
  }
  all() {
    return this.storage.all(Product.resource);
  }
  find(id) {
    return this.storage.get(Product.resource, id);
  }
  static async findSql(connection, id) {
    const [rows] = await connection.execute(
      "SELECT * FROM items WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }
  static async listSql(connection, { limit = 20, offset = 0 } = {}) {
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isInteger(offset) ||
      offset < 0
    )
      throw new Error("Phân trang không hợp lệ.");
    const [rows] = await connection.execute(
      "SELECT * FROM items ORDER BY id DESC LIMIT ? OFFSET ?",
      [String(limit), String(offset)],
    );
    return rows;
  }
}
module.exports = ProductRepository;
