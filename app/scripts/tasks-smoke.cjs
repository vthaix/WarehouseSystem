const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const TaskService = require("../src/services/warehouse-service/modules/tasks/TaskService");
(async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true")
    throw Error("Demo only");
  const pool = getPool(),
    service = new TaskService(pool),
    marker = "SQL-TASK-" + crypto.randomUUID();
  try {
    const [users] = await pool.query(
      "SELECT id,username FROM users WHERE username IN ('director','purchaser','customer')",
    );
    const ids = new Map(users.map((r) => [r.username, String(r.id)]));
    const director = {
        id: ids.get("director"),
        roles: ["DIRECTOR"],
        workshop_ids: [],
      },
      worker = {
        id: ids.get("purchaser"),
        roles: ["PURCHASER"],
        workshop_ids: [],
      },
      customer = {
        id: ids.get("customer"),
        roles: ["CUSTOMER"],
        workshop_ids: [],
      };
    const b = {
      title: marker,
      priority: "NORMAL",
      start_at: "2040-01-01T00:00:00Z",
      end_at: "2040-01-01T01:00:00Z",
      assignee_ids: [worker.id],
    };
    await assert.rejects(
      () => service.create(worker, b, crypto.randomUUID()),
      (e) => e.status === 403 || e.statusCode === 403,
    );
    const results = await Promise.allSettled([
      service.create(director, b, crypto.randomUUID()),
      service.create(director, b, crypto.randomUUID()),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const task = results.find((r) => r.status === "fulfilled").value;
    assert.equal(
      (await service.get(worker, task.id)).assignee_ids[0],
      worker.id,
    );
    await assert.rejects(() => service.get(customer, task.id));
    await assert.rejects(() =>
      service.update(
        director,
        task.id,
        { version: 0, title: marker },
        crypto.randomUUID(),
      ),
    );
    const started = await service.progress(
      worker,
      task.id,
      { version: task.version, status: "IN_PROGRESS" },
      crypto.randomUUID(),
    );
    const done = await service.progress(
      worker,
      task.id,
      { version: started.version, status: "COMPLETED" },
      crypto.randomUUID(),
    );
    assert.equal(done.status, "COMPLETED");
    await assert.rejects(() =>
      service.remove(
        director,
        task.id,
        { version: done.version },
        crypto.randomUUID(),
      ),
    );
    console.log(
      "TASKS SQL PASS: role/scope, concurrent overlap, stale version, progress and immutable completion",
    );
  } finally {
    const [owned] = await pool.execute("SELECT id FROM tasks WHERE title=?", [
      marker,
    ]);
    for (const r of owned) {
      await pool.execute("DELETE FROM task_assignments WHERE task_id=?", [
        r.id,
      ]);
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='tasks' AND resource_id=?",
        [r.id],
      );
      await pool.execute("DELETE FROM tasks WHERE id=?", [r.id]);
    }
    await closePool();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
