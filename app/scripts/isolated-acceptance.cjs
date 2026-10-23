const { spawn } = require("node:child_process");
const splitSource = process.env.ACCEPTANCE_SPLIT_SOURCE;
if (
  !/^KhoHang_Acceptance_\d{8}$/.test(splitSource || process.env.DB_NAME || "")
)
  throw Error("Use a dedicated acceptance database.");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const { serviceNames } = require("../src/services/shared/contracts");
const children = [];
let output = "";
const childEnv = { ...process.env };
for (const name of [
  "DB_PASSWORD",
  "SESSION_SECRET",
  "DEMO_PASSWORD",
  "INTERNAL_SECRET",
])
  if (childEnv[name]) delete childEnv[name + "_FILE"];
for (const [i, name] of serviceNames.entries())
  childEnv[name.replaceAll("-", "_").toUpperCase() + "_URL"] =
    "http://127.0.0.1:" + (3101 + i);
function start(name, port) {
  const serviceEnv = { ...childEnv };
  if (splitSource) {
    const entry = require("../src/config/service-databases").layout(
      splitSource,
    )[name];
    serviceEnv.DB_NAME = entry.database;
    const credentials = require('../src/config/service-credentials').credentialsFor(name);
    serviceEnv.DB_USER = credentials.user;
    serviceEnv.DB_PASSWORD = credentials.password;
    delete serviceEnv.DB_PASSWORD_FILE;
    serviceEnv.SERVICE_DB_LAYOUT = "split";
  }
  const child = spawn(
    process.execPath,
    ["src/services/" + name + "/index.js"],
    {
      env: { ...serviceEnv, HOST: "127.0.0.1", PORT: String(port) },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  child.stderr.on("data", (b) => {
    output += name + ": " + b.toString();
  });
  children.push(child);
  return child;
}
async function wait(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (r.ok) return;
    } catch {}
    if (children.some((c) => c.exitCode != null))
      throw Error("Service exited: " + output);
    await new Promise((r) => setTimeout(r, 500));
  }
  throw Error("Service not ready: " + output);
}
async function run(script) {
  await new Promise((resolve, reject) => {
    const c = spawn(process.execPath, [script], {
      env: { ...childEnv, PORT: "3000" },
      stdio: "inherit",
    });
    c.on("error", reject);
    c.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error(script + " failed: " + code)),
    );
  });
}
(async () => {
  try {
    if (!splitSource)
      await require("../src/services/shared/database-bootstrap").prepareDatabase(
        getPool(),
      );
    for (const [i, name] of serviceNames.entries()) start(name, 3101 + i);
    await Promise.all(
      serviceNames.map((_, i) =>
        wait("http://127.0.0.1:" + (3101 + i) + "/health/ready"),
      ),
    );
    start("web-gateway", 3000);
    await wait("http://127.0.0.1:3000/health/ready");
    for (const script of [
      "service-security-smoke",
      ...(splitSource ? [] : ["domain-schema-smoke"]),
      "tasks-smoke",
      "stocktake-smoke",
      "order-smoke",
      "production-smoke",
      "commerce-smoke",
      ...(splitSource ? ['partial-receipt-smoke','category-images-smoke'] : []),
      ...(splitSource ? ['preproduction-smoke'] : []),
      ...(splitSource ? ['finished-parts-task-smoke'] : []),
      ...(splitSource ? ['accounts-catalog-smoke','planning-confirmation-smoke'] : []),
      ...(splitSource ? ['reset-tools-smoke'] : []),
    ])
      await run("scripts/" + script + ".cjs");
    console.log(
      "ISOLATED MICROSERVICE MYSQL ACCEPTANCE PASS (six HTTP processes, dedicated database)",
    );
  } finally {
    for (const c of children) c.kill("SIGTERM");
    await Promise.all(
      children.map(
        (c) =>
          new Promise((resolve) => {
            if (c.exitCode != null) return resolve();
            c.once("exit", resolve);
            setTimeout(() => {
              c.kill("SIGKILL");
              resolve();
            }, 5000).unref();
          }),
      ),
    );
    await closePool();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
