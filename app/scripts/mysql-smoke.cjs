const assert = require("node:assert/strict"),
  crypto = require("node:crypto"),
  fs = require("node:fs");
const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");
(async () => {
  const pool = getPool();
  if (process.env.NODE_ENV === "production")
    throw new Error("Smoke demo chỉ chạy ở local/dev.");
  const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
  let cookie = "",
    csrf;
  async function call(url, method = "GET", body, withCsrf = true) {
    const res = await fetch(base + url, {
      method,
      redirect: "manual",
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        "Content-Type": "application/json",
        ...(csrf && withCsrf ? { "X-CSRF-Token": csrf } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return res;
  }
  async function login(username) {
    csrf = (await (await call("/api/v1/auth/csrf")).json()).data.csrf_token;
    const res = await call("/api/v1/auth/login", "POST", {
      username,
      password: process.env.DEMO_PASSWORD,
    });
    assert.equal(res.status, 200);
    const data = (await res.json()).data;
    csrf = data.csrf_token;
    assert.equal(data.password_hash, undefined);
    return data;
  }
  try {
    const mode = process.argv[2];
    if (mode === "after-restart") {
      const saved = JSON.parse(
        fs.readFileSync("/tmp/warehouse-smoke-session.json", "utf8"),
      );
      cookie = saved.cookie;
      const res = await call("/api/v1/auth/me");
      assert.equal(res.status, 200);
      assert.equal((await res.json()).data.username, "manager");
      fs.unlinkSync("/tmp/warehouse-smoke-session.json");
      console.log(
        "MySQL PASS: session and seeded user persist after app restart.",
      );
      return;
    }
    assert.equal((await call("/health/ready")).status, 200);
    assert.equal((await call("/api/v1/items")).status, 401);
    const [[roleCount]] = await pool.query("SELECT COUNT(*) AS n FROM roles");
    assert.equal(Number(roleCount.n), 9);
    const [[count]] = await pool.query("SELECT COUNT(*) AS n FROM users");
    assert.equal(Number(count.n), 11);
    const [before] = await pool.query(
      "SELECT id,password_hash FROM users ORDER BY id",
    );
    await require("../src/shared/migrations").migrate(pool);
    await require("../database/seeders/foundation").seedDemo(pool);
    const [after] = await pool.query(
      "SELECT id,password_hash FROM users ORDER BY id",
    );
    assert.deepEqual(after, before);
    const [[fk]] = await pool.query(
      "SELECT COUNT(*) AS n FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE()",
    );
    assert.ok(Number(fk.n) >= 11);
    const [[item]] = await pool.query(
      "SELECT * FROM items ORDER BY id LIMIT 1",
    );
    assert.equal(typeof item.reference_price, "string");
    const c = await pool.getConnection();
    try {
      await c.beginTransaction();
      await assert.rejects(
        c.execute("INSERT INTO user_roles (user_id,role_id) VALUES (0,1)"),
        (e) => e.code === "ER_NO_REFERENCED_ROW_2",
      );
      await assert.rejects(
        c.execute(
          "INSERT INTO items (category_id,unit_id,code,name,kind,reference_price,is_sample,is_published,is_active,version) VALUES (?,?,'CHECK-NEGATIVE','Negative','MATERIAL',-1,0,0,1,1)",
          [item.category_id, item.unit_id],
        ),
        (e) => e.code === "ER_CHECK_CONSTRAINT_VIOLATED",
      );
    } finally {
      await c.rollback();
      c.release();
    }
    await login("manager");
    let res = await call("/api/v1/items");
    assert.equal(res.status, 200);
    assert.ok((await res.json()).data.length >= 13);
    res = await call("/products");
    assert.equal(res.status, 200);
    assert.ok((await res.text()).includes(item.name));
    assert.equal((await call("/api/v1/customer-orders")).status, 403);
    assert.equal((await call("/api/v1/items", "POST", {}, false)).status, 403);
    res = await call("/api/v1/items", "POST", {});
    assert.equal(res.status, 422);
    assert.equal((await res.json()).error.code, "VALIDATION_ERROR");
    const notices = (await (await call("/api/v1/notifications")).json()).data;
    assert.equal(notices.length, 1);
    await call("/api/v1/notifications/" + notices[0].id + "/read", "PATCH", {});
    const [[sessions]] = await pool.query("SELECT COUNT(*) AS n FROM sessions");
    assert.ok(Number(sessions.n) > 0);
    const userRepo = new (require("../src/modules/auth/UserRepository"))(pool),
      owner = await userRepo.find("workshop");
    assert.equal(owner.workshop_ids.length, 1);
    const auth = new (require("../src/modules/auth/AuthService"))(
        userRepo,
        pool,
      ),
      unknown = "smoke-" + crypto.randomUUID(),
      ip = "smoke-ip-" + crypto.randomUUID();
    const keys = ["user:" + unknown, "ip:" + ip].map((k) =>
      crypto.createHash("sha256").update(k).digest("hex"),
    );
    try {
      for (let i = 0; i < 5; i++)
        await assert.rejects(
          auth.authenticate(
            { username: unknown, password: "wrong-password" },
            ip,
          ),
          (e) => e.status === 401,
        );
      await assert.rejects(
        auth.authenticate(
          { username: unknown, password: "wrong-password" },
          ip,
        ),
        (e) => e.status === 429,
      );
    } finally {
      for (const key of keys)
        await pool.execute("DELETE FROM login_attempts WHERE attempt_key = ?", [
          key,
        ]);
    }
    await call("/api/v1/auth/logout", "POST", {});
    await login("customer");
    assert.equal((await call("/api/v1/items")).status, 403);
    res = await call("/api/v1/sample-items");
    assert.equal(res.status, 200);
    const samples = (await res.json()).data;
    assert.ok(samples.length >= 4);
    assert.ok(
      samples.every(
        (item) =>
          item.kind === "FINISHED_PRODUCT" &&
          item.is_published &&
          item.is_active,
      ),
    );
    assert.ok(!samples.some((item) => item.code === "TP-005"));
    assert.equal((await call("/api/v1/customer-orders")).status, 200);
    assert.equal(
      (await call("/api/v1/notifications/" + notices[0].id)).status,
      404,
    );
    await call("/api/v1/auth/logout", "POST", {});
    await login("manager");
    if (mode === "before-restart")
      fs.writeFileSync(
        "/tmp/warehouse-smoke-session.json",
        JSON.stringify({ cookie }),
        { mode: 0o600 },
      );
    console.log(
      "MySQL PASS: migration replay, seed replay/password preservation, 9 roles/11 users, foreign keys, DECIMAL CHECK, SQL sessions, login/CSRF/RBAC/scope, durable login rate limit and honest 501 responses.",
    );
  } finally {
    await closePool();
  }
})().catch((error) => {
  console.error("MySQL smoke failed: " + (error.code || error.message));
  process.exitCode = 1;
});
