// Đăng nhập và gọi chức năng của app bằng từng tài khoản mẫu.
// Lỗi ở bất kỳ bước nào thì dừng ngay: bộ dữ liệu mặc định không được dở dang.
const crypto = require("node:crypto");

const base = process.env.DEFAULT_DATA_URL || "http://127.0.0.1:3000";
const password = process.env.DEMO_PASSWORD || "123456";
const sessions = new Map();

async function send(session, path, method, body) {
  const response = await fetch(base + "/api/v1/" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: session.cookie,
      "X-CSRF-Token": session.csrf,
      "Idempotency-Key": crypto.randomUUID(),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const cookie = response.headers.get("set-cookie");
  if (cookie) session.cookie = cookie.split(";")[0];
  return { status: response.status, ...(await response.json()) };
}

async function login(username) {
  const session = { cookie: "", csrf: "" };
  session.csrf = (await send(session, "auth/csrf", "GET")).data.csrf_token;
  const result = await send(session, "auth/login", "POST", { username, password });
  if (result.status !== 200) throw Error("Không đăng nhập được " + username + ": " + JSON.stringify(result.error));
  session.csrf = result.data.csrf_token;
  return session;
}

/** Gọi một chức năng; trả về dữ liệu hoặc dừng cả bộ sinh nếu app từ chối. */
async function call(username, path, method = "GET", body) {
  if (!sessions.has(username)) sessions.set(username, await login(username));
  const result = await send(sessions.get(username), path, method, body);
  if (result.status >= 300)
    throw Error(`${username} ${method} ${path} → ${result.status} ${JSON.stringify(result.error)}\n${JSON.stringify(body)}`);
  return result.data;
}

module.exports = {
  get: (username, path) => call(username, path),
  post: (username, path, body) => call(username, path, "POST", body),
  patch: (username, path, body) => call(username, path, "PATCH", body),
  remove: (username, path, body) => call(username, path, "DELETE", body),
};
