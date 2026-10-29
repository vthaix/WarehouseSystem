const assert = require("node:assert/strict");
require("../src/config/env").loadEnv();
const { request, urlFor } = require("../src/services/shared/transport");
const { getPool, closePool } = require("../src/config/database");
(async () => {
  try {
    const raw = await fetch(
      urlFor("identity-service") + "/internal/v1/invoke",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "users",
          method: "get",
          args: ["users", "1"],
        }),
      },
    );
    assert.equal(raw.status, 401);
    const wrong = await request("business-service", "/internal/v1/invoke", {
      group: "users",
      method: "get",
      args: ["users", "1"],
    });
    assert.equal(wrong.status, 404);
    const forbidden = await request(
      "warehouse-service",
      "/internal/v1/invoke",
      { group: "pool", method: "query", args: ["SELECT 1"] },
    );
    assert.equal(forbidden.status, 404);
    const [[customer]] = await getPool().execute(
      "SELECT id FROM users WHERE username='customer'",
    );
    const userResponse = await request(
      "identity-service",
      "/internal/v1/invoke",
      { group: "users", method: "get", args: ["users", String(customer.id)] },
    );
    assert.equal(userResponse.status, 200);
    const user = (await userResponse.json()).data;
    assert.equal(user.password_hash, undefined);
    const spoof = await request("reporting-service", "/internal/v1/invoke", {
      group: "reports",
      method: "inventory",
      args: [
        {
          id: user.id,
          roles: ["DIRECTOR"],
          workshop_ids: [],
          session_version: user.session_version,
        },
        {},
      ],
    });
    assert.equal(spoof.status, 403);
    const stale = await request("warehouse-service", "/internal/v1/http", {
      url: "/stocktakes",
      method: "GET",
      actor: { id: user.id, session_version: Number(user.session_version) + 1 },
    });
    assert.equal(stale.status, 401);
    console.log(
      "SERVICE SECURITY PASS: unsigned/wrong-owner/raw-SQL rejected, user hash stripped, forged roles and stale sessions rejected",
    );
  } finally {
    await closePool();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
