const { test } = require("node:test"), assert = require("node:assert/strict"), express = require("express");
const { enabled } = require("../../src/config/reset-tools");
const routes = require("../../src/shared/TestResetRoutes");
test("test reset requires development, opt-in, authentication, CSRF and exact confirmation; all actors can use it", async () => {
  const before = { ...process.env };
  process.env.NODE_ENV = "development";
  process.env.ENABLE_TEST_RESET = "true";
  process.env.INTERNAL_SECRET = "test-reset-unit-secret-32-characters-long";
  let called = 0;
  const app = express(), reset = routes(async () => {called++;return {cleared_tables:46,backup:'/backup/unit',message:'done'}});
  let releaseWrite, startedWrite;
  const writing = new Promise(r => { startedWrite = r; });
  app.use(reset.gate, express.json(), (req, _res, next) => {
    req.session = { csrf: "csrf-test", destroy: cb => cb() };
    if (req.get("actor")) req.user = { id: "1", roles: [req.get("actor")], session_version: 1 };
    next();
  }, reset.router);
  app.post("/api/v1/orders", async (_req, res) => {
    await new Promise(r => { releaseWrite = r; startedWrite(); });
    res.json({ done: true });
  });
  app.use((e, _req, res, _next) => res.status(e.status || 500).json({ error: e.code }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  async function call(actor, confirmation = "XOA DU LIEU TEST", csrf = "csrf-test") {
    return fetch("http://127.0.0.1:" + server.address().port + "/api/v1/test-data/reset", {
      method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf,
        "Idempotency-Key": require("node:crypto").randomUUID(), ...(actor ? { actor } : {}) },
      body: JSON.stringify({ confirmation }),
    });
  }
  try {
    assert.equal((await call()).status, 401);
    assert.equal((await call("CUSTOMER", "XOA DU LIEU TEST", "wrong")).status, 403);
    assert.equal((await call("CUSTOMER", "wrong")).status, 422);
    assert.equal(called, 0);
    for (const role of ["CUSTOMER", "PLANNER", "PURCHASER", "WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "QC_INSPECTOR", "STOCKTAKER", "WORKSHOP_OWNER", "DIRECTOR"])
      assert.equal((await call(role)).status, 200, role);
    assert.equal(called, 9);
    const base = "http://127.0.0.1:" + server.address().port;
    const write = fetch(base + "/api/v1/orders", { method: "POST" });
    await writing;
    const resetting = call("CUSTOMER");
    await new Promise(r => setTimeout(r, 30));
    assert.equal(called, 9, "Reset waits for in-flight requests");
    assert.equal((await fetch(base + "/api/v1/orders")).status, 503, "New requests are blocked during reset");
    releaseWrite();
    await write;
    assert.equal((await resetting).status, 200);
    assert.equal(called, 10);
    process.env.NODE_ENV = "production";
    assert.equal(enabled(), false);
    assert.equal((await call("DIRECTOR")).status, 404);
    process.env.NODE_ENV = "development";
    process.env.ENABLE_TEST_RESET = "false";
    assert.equal((await call("CUSTOMER")).status, 404);
    assert.equal(called, 10);
  } finally {
    await new Promise(r => server.close(r));
    for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key];
    Object.assign(process.env, before);
  }
});
