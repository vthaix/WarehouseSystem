const { Store } = require("express-session");
class MySqlSessionStore extends Store {
  constructor(pool) {
    super();
    this.pool = pool;
  }
  get(sid, callback) {
    this.pool
      .execute(
        "SELECT data FROM sessions WHERE session_id = ? AND expires_at > ?",
        [sid, Date.now()],
      )
      .then(
        ([rows]) => callback(null, rows.length ? parse(rows[0].data) : null),
        callback,
      );
  }
  set(sid, data, callback = () => {}) {
    const expires = Date.now() + (data.cookie?.originalMaxAge || 1800000);
    this.pool
      .execute(
        "INSERT INTO sessions (session_id, expires_at, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), data = VALUES(data)",
        [sid, expires, JSON.stringify(data)],
      )
      .then(() => callback(), callback);
  }
  touch(sid, data, callback = () => {}) {
    this.pool
      .execute("UPDATE sessions SET expires_at = ? WHERE session_id = ?", [
        Date.now() + (data.cookie?.originalMaxAge || 1800000),
        sid,
      ])
      .then(() => callback(), callback);
  }
  destroy(sid, callback = () => {}) {
    this.pool
      .execute("DELETE FROM sessions WHERE session_id = ?", [sid])
      .then(() => callback(), callback);
  }
  async prune() {
    await this.pool.execute("DELETE FROM sessions WHERE expires_at <= ?", [
      Date.now(),
    ]);
  }
}
function parse(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}
module.exports = MySqlSessionStore;
