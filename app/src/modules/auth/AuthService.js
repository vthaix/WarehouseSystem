const crypto = require("node:crypto");
const C = require("../../services/domain/core");
class AuthService {
  constructor(users, pool) {
    this.users = users;
    this.pool = pool;
    this.dummyHash = C.hashPassword(crypto.randomBytes(24).toString("hex"));
  }
  async authenticate(body, ip, requestId = "bootstrap") {
    C.fields(body, ["username", "password"]);
    C.text(body.username, "username", 80);
    C.text(body.password, "password", 128);
    const keys = ["ip:" + ip, "user:" + body.username.toLowerCase()]
        .map((k) => crypto.createHash("sha256").update(k).digest("hex"))
        .sort(),
      now = Date.now(),
      connection = await this.pool.getConnection();
    let result;
    try {
      await connection.beginTransaction();
      const counters = [];
      for (const key of keys) {
        await connection.execute(
          "INSERT INTO login_attempts (attempt_key,window_start,attempts) VALUES (?,?,0) ON DUPLICATE KEY UPDATE attempt_key = attempt_key",
          [key, now],
        );
        const [[counter]] = await connection.execute(
          "SELECT * FROM login_attempts WHERE attempt_key = ? FOR UPDATE",
          [key],
        );
        if (now - Number(counter.window_start) > 900000) {
          await connection.execute(
            "UPDATE login_attempts SET window_start = ?, attempts = 0 WHERE attempt_key = ?",
            [now, key],
          );
          counter.attempts = 0;
        }
        counters.push(counter);
      }
      if (counters.some((c) => c.attempts >= 5))
        result = {
          error: new C.DomainError(
            429,
            "RATE_LIMITED",
            "Đăng nhập sai quá nhiều. Thử lại sau 15 phút.",
          ),
        };
      else {
        const user = await this.users.find(body.username, connection),
          valid = C.verifyPassword(
            body.password,
            user?.password_hash || this.dummyHash,
          );
        if (!valid || !user || user.status !== "ACTIVE") {
          for (const key of keys)
            await connection.execute(
              "UPDATE login_attempts SET attempts = attempts + 1 WHERE attempt_key = ?",
              [key],
            );
          result = {
            error: new C.DomainError(
              401,
              "UNAUTHENTICATED",
              "Tên đăng nhập hoặc mật khẩu không đúng.",
            ),
          };
        } else {
          await connection.execute(
            "INSERT INTO audit_logs (actor_id,resource_type,resource_id,action,request_id) VALUES (?,'users',?,'LOGIN',?)",
            [user.id, user.id, requestId],
          );
          result = { user };
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    if (result.error) throw result.error;
    return result.user;
  }
}
module.exports = AuthService;
