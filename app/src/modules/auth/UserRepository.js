const C = require("../../services/domain/core");
class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }
  async hydrate(row, connection = this.pool) {
    if (!row) return null;
    const [roles] = await connection.execute(
      "SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ? ORDER BY r.code",
      [row.id],
    );
    const [workshops] = await connection.execute(
      "SELECT workshop_id FROM workshop_users WHERE user_id = ? ORDER BY workshop_id",
      [row.id],
    );
    return {
      ...row,
      id: String(row.id),
      roles: roles.map((r) => r.code),
      workshop_ids: workshops.map((r) => String(r.workshop_id)),
    };
  }
  async find(username, connection = this.pool) {
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    return this.hydrate(rows[0], connection);
  }
  async get(resource, id) {
    C.fail(
      resource !== "users",
      "NOT_FOUND",
      "Không tìm thấy tài nguyên.",
      404,
    );
    const [rows] = await this.pool.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    C.fail(
      !rows.length,
      "UNAUTHENTICATED",
      "Tài khoản không còn hiệu lực.",
      401,
    );
    return this.hydrate(rows[0]);
  }
}
module.exports = UserRepository;
