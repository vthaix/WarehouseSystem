const C = require("../../services/domain/core");
const paginate = require("../../utils/pagination");
class NotificationService {
  constructor(pool) {
    this.pool = pool;
  }
  async list(user, query = {}) {
    const { page, per_page, offset } = paginate(query);
    const unread = query.unread_only === "true" ? " AND read_at IS NULL" : "";
    const [[count]] = await this.pool.execute(
      "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?" + unread,
      [user.id],
    );
    const [rows] = await this.pool.execute(
      "SELECT *,subject AS title FROM notifications WHERE user_id = ?" +
        unread +
        " ORDER BY id DESC LIMIT ? OFFSET ?",
      [user.id, String(per_page), String(offset)],
    );
    return {
      data: rows.map((r) => ({
        ...r,
        id: String(r.id),
        user_id: String(r.user_id),
        actions: [],
      })),
      meta: {
        page,
        per_page,
        total: Number(count.total),
        total_pages: Math.ceil(Number(count.total) / per_page),
      },
    };
  }
  async get(user, id) {
    const [rows] = await this.pool.execute(
      "SELECT *,subject AS title FROM notifications WHERE id = ? AND user_id = ?",
      [id, user.id],
    );
    C.fail(!rows.length, "NOT_FOUND", "Không tìm thấy thông báo.", 404);
    return {
      ...rows[0],
      id: String(rows[0].id),
      user_id: String(rows[0].user_id),
      actions: [],
    };
  }
  async read(user, id) {
    await this.get(user, id);
    await this.pool.execute(
      "UPDATE notifications SET read_at = COALESCE(read_at, UTC_TIMESTAMP(6)) WHERE id = ? AND user_id = ?",
      [id, user.id],
    );
    return this.get(user, id);
  }
}
module.exports = NotificationService;
