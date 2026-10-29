const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../../src/app");
test("HTTP login, CSRF, ownership, session rotation and static UI", async (t) => {
  const app = createApp({ password: "test-password" }),
    server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "",
    csrf;
  async function call(path, method = "GET", body, useCsrf = true) {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        "Content-Type": "application/json",
        ...(useCsrf && csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const set = r.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return r;
  }
  assert.equal((await call("/health")).status, 200);
  assert.equal((await call("/api/v1/customer-orders")).status, 401);
  let r = await call("/api/v1/auth/csrf");
  csrf = (await r.json()).data.csrf_token;
  const prior = cookie;
  assert.equal(
    (
      await call(
        "/api/v1/auth/login",
        "POST",
        { username: "customer", password: "test-password" },
        false,
      )
    ).status,
    403,
  );
  r = await call("/api/v1/auth/login", "POST", {
    username: "customer",
    password: "test-password",
  });
  assert.equal(r.status, 200);
  const data = (await r.json()).data;
  csrf = data.csrf_token;
  assert.notEqual(cookie, prior);
  assert.equal(data.username, "customer");
  assert.equal(data.password_hash, undefined);
  assert.equal((await call("/api/v1/customer-orders")).status, 200);
  assert.equal((await call("/api/v1/tasks")).status, 403);
  assert.equal(
    (await call("/api/v1/customer-orders/1/start", "POST", { version: 1 }))
      .status,
    404,
  );
  assert.equal((await call("/api/v1/auth/logout", "POST", {})).status, 204);
  assert.equal((await call("/api/v1/auth/me")).status, 401);
  r = await call("/login");
  assert.equal(r.status, 200);
  assert.match(await r.text(), /lang="vi"/);
  assert.equal((await call("/js/forms.js")).status, 200);
});
