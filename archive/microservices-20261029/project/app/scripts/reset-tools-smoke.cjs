const assert = require("node:assert/strict"), fs = require("node:fs"), crypto = require("node:crypto"), { spawn } = require("node:child_process");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const { headers } = require("../src/services/shared/transport");
const { identifier: q } = require("../src/config/service-databases");
const source = process.env.ACCEPTANCE_SPLIT_SOURCE;
if (!/^KhoHang_Acceptance_\d{8}$/.test(source || "")) throw Error("Reset smoke requires isolated split acceptance schemas.");
(async () => {
  const pool = getPool();
  const raw = await require("mysql2/promise").createConnection({ host: process.env.DB_HOST || "mysql", user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  const child = spawn(process.execPath, ["scripts/reset-tools-server.cjs"], {
    env: { ...process.env, DB_NAME: source, NODE_ENV: "development", ENABLE_TEST_RESET: "true", PORT: "3288" }, stdio: ["ignore", "ignore", "inherit"],
  });
  const base = "http://127.0.0.1:3288", url = "/internal/v1/reset";
  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try { if ((await fetch(base + "/health")).ok) { ready = true; break; } } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(ready, "Internal reset worker ready");
    const [[user]] = await pool.query("SELECT id,session_version FROM users WHERE username='customer'");
    const body = JSON.stringify({ key: crypto.randomUUID(), actor: { id: String(user.id), session_version: user.session_version } });
    assert.equal((await fetch(base + url, { method: "POST", headers: { "Content-Type": "application/json" }, body })).status, 401);
    async function reset() {
      const response = await fetch(base + url, { method: "POST", headers: headers("test-reset", "POST", url, body), body });
      const data = await response.json();
      assert.equal(response.status, 200, JSON.stringify(data));
      return data.data;
    }
    const result = await reset();
    assert.equal(result.cleared_tables, 46);
    const snapshot = JSON.parse(fs.readFileSync(result.backup + "/reset-result.json", "utf8"));
    for (const t of [...snapshot.cleared, ...snapshot.retained]) {
      const [[{ n }]] = await raw.query(`SELECT COUNT(*) n FROM ${q(t.database)}.${q(t.name)}`);
      assert.equal(Number(n), snapshot.retained.includes(t) ? t.before : 0, t.name);
    }
    assert.equal(fs.readdirSync(result.backup).filter(f => f.endsWith(".sql")).length, 6);
    // A replay must never delete data created after the first successful reset.
    await pool.execute("INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,'reset replay sentinel','test','customer-orders',1,?)", [user.id, "reset-replay-" + crypto.randomUUID()]);
    const replay = await reset();
    assert.deepEqual(replay, result);
    const [[{ n }]] = await pool.query("SELECT COUNT(*) n FROM notifications");
    assert.equal(Number(n), 1);
    console.log("TEST RESET SQL PASS: signed internal worker, backup six schemas, clear 46 workflow tables, preserve catalog/identity, replay keeps newer data.");
  } finally {
    if (child.exitCode == null) {
      const exited = new Promise(r => child.once("exit", r));
      child.kill("SIGTERM");
      await exited;
    }
    await closePool();
    await raw.end();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
