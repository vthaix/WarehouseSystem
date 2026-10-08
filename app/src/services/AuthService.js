const crypto = require("node:crypto");
const C = require("./domain/core");
class AuthService {
  constructor(repo) {
    this.repo = repo;
    this.attempts = new Map();
    this.dummyHash = C.hashPassword(crypto.randomBytes(24).toString("hex"));
  }
  authenticate(body, ip) {
    C.fields(body, ["username", "password"]);
    C.text(body.username, "username", 80);
    C.text(body.password, "password", 128);
    const keys = ["ip:" + ip, "user:" + body.username.toLowerCase()],
      now = Date.now();
    for (const k of keys) {
      let a = this.attempts.get(k);
      if (a && now - a.start > 900000) {
        this.attempts.delete(k);
        a = null;
      }
      C.fail(
        a && a.count >= 5,
        "RATE_LIMITED",
        "Đăng nhập sai quá nhiều. Thử lại sau 15 phút.",
        429,
      );
    }
    const user = this.repo
      .all("users")
      .find((u) => u.username === body.username);
    const valid = C.verifyPassword(
      body.password,
      user?.password_hash || this.dummyHash,
    );
    if (!user || !valid) {
      for (const k of keys) {
        const a = this.attempts.get(k) || { count: 0, start: now };
        a.count++;
        this.attempts.set(k, a);
      }
      throw new C.DomainError(
        401,
        "UNAUTHENTICATED",
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    }
    return user;
  }
}
module.exports = AuthService;
