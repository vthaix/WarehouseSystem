const mysql = require("mysql2/promise"),
  fs = require("node:fs"),
  { spawn } = require("node:child_process");
const { wrapSql } = require("../src/config/vietnamese-sql");
const { identifier: q } = require("../src/config/service-databases");
const {
  migrate,
} = require("../database/services/migrations/001_split_existing.cjs");
const { provision } = require("./split-service-databases.cjs");
const source =
  process.env.ACCEPTANCE_SPLIT_SOURCE || "KhoHang_Acceptance_20261013";
if (!/^KhoHang_Acceptance_\d{8}$/.test(source))
  throw Error("Use a dedicated acceptance database.");
(async () => {
  require("../src/config/env").loadEnv();
  process.env.SERVICE_DB_LAYOUT = "legacy";
  process.env.SEED_DEMO = "true";
  if (!process.env.DEMO_PASSWORD)
    process.env.DEMO_PASSWORD = fs
      .readFileSync("/run/warehouse-app-secrets/demo_password", "utf8")
      .trim();
  if (!process.env.SESSION_SECRET)
    process.env.SESSION_SECRET = fs
      .readFileSync("/run/warehouse-app-secrets/session_secret", "utf8")
      .trim();
  const password = fs
    .readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8")
    .trim();
  const admin = await mysql.createConnection({
    host: "mysql",
    user: "root",
    password,
    timezone: "Z",
  });
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS ${q(source)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await admin.query("USE " + q(source));
    const seedPool = mysql.createPool({
      host: "mysql",
      user: "root",
      password,
      database: source,
    });
    try {
      await require("../src/services/shared/database-bootstrap").prepareDatabase(
        wrapSql(seedPool),
      );
    } finally {
      await seedPool.end();
    }
    const result = await migrate(admin, source);
    await require("../database/services/migrations/002_qualified_views.cjs").migrate(
      admin,
      source,
      result,
    );
    await require("../database/services/migrations/003_auto_increment.cjs").migrate(
      admin,
      source,
      result,
    );
    await provision(admin, result);
    await require('../database/services/migrations/004_partial_receipts.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/005_quarantine_disposition.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/006_stock_qc_correction.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/007_category_images.cjs').migrate(admin,source,result);
    const reporting=q(result.databases['reporting-service'].database);
    await admin.query(`DELETE FROM ${reporting}.TrangThaiDichVu WHERE Ma='004_partial_receipts'`);
    await require('../database/services/migrations/004_partial_receipts.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/005_quarantine_disposition.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/006_stock_qc_correction.cjs').migrate(admin,source,result);
    await require('../database/services/migrations/007_category_images.cjs').migrate(admin,source,result);
    const [recovered]=await admin.query(`SELECT Ma FROM ${reporting}.TrangThaiDichVu WHERE Ma='004_partial_receipts'`);
    if(recovered.length!==1)throw Error('Partial migration checkpoint recovery failed.');
    for(const marker of ['005_quarantine_disposition','006_stock_qc_correction','007_category_images']) {
      await admin.query(`DELETE FROM ${reporting}.TrangThaiDichVu WHERE Ma=?`,[marker]);
      await require('../database/services/migrations/'+marker+'.cjs').migrate(admin,source,result);
      const [restored]=await admin.query(`SELECT Ma FROM ${reporting}.TrangThaiDichVu WHERE Ma=?`,[marker]);
      if(restored.length!==1)throw Error('Warehouse migration checkpoint recovery failed: '+marker);
    }
    for (const [service, entry] of Object.entries(result.databases)) {
      const credentials = require('../src/config/service-credentials').credentialsFor(service);
      const client = await mysql.createConnection({
        host: "mysql",
        user: credentials.user,
        password: credentials.password,
        database: entry.database,
      });
      try {
        await client.query("SELECT Ma FROM TrangThaiDichVu");
        const forbidden =
          service === "business-service"
            ? `UPDATE ${q(result.databases["warehouse-service"].database)}.TonKho SET SoLuong=SoLuong WHERE 1=0`
            : service === "web-gateway" || service === "reporting-service"
              ? `UPDATE ${q(result.databases["identity-service"].database)}.NguoiDung SET PhienBan=PhienBan WHERE 1=0`
              : null;
        if (forbidden) {
          let blocked = false;
          try {
            await client.query(forbidden);
          } catch (error) {
            if (error.code !== "ER_TABLEACCESS_DENIED_ERROR") throw error;
            blocked = true;
          }
          if (!blocked)
            throw Error("Unexpected foreign write permission: " + service);
        }
      } finally {
        await client.end();
      }
    }
    const gateway = q(result.databases["web-gateway"].database);
    const replayKey = "split-replay-" + Date.now();
    await admin.execute(
      `INSERT INTO ${gateway}.PhienDangNhap (MaPhien,HetHanLuc,DuLieu) VALUES (?,?,?)`,
      [replayKey, Date.now() + 60000, "{}"],
    );
    const replay = await migrate(admin, source);
    if (!replay.alreadyApplied)
      throw Error("Split replay must not copy data again.");
    const [preserved] = await admin.execute(
      `SELECT MaPhien FROM ${gateway}.PhienDangNhap WHERE MaPhien=?`,
      [replayKey],
    );
    if (!preserved.length) throw Error("Replay overwrote post-cutover data.");
    await admin.execute(
      `DELETE FROM ${gateway}.PhienDangNhap WHERE MaPhien=?`,
      [replayKey],
    );
    for (const object of result.objects.filter(
      (o) => o.type === "BASE TABLE" && o.name !== "LichSuCSDL",
    )) {
      const target = result.databases[result.byTable[object.name]].database;
      const [[r]] = await admin.query(
        `SELECT (SELECT COUNT(*) FROM ${q(source)}.${q(object.name)}) a,(SELECT COUNT(*) FROM ${q(target)}.${q(object.name)}) b`,
      );
      if (!result.alreadyApplied && String(r.a) !== String(r.b))
        throw Error("Preservation failed: " + object.name);
    }
    const [fks] = await admin.query(
      "SELECT REFERENCED_TABLE_SCHEMA s FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA IN (?) AND REFERENCED_TABLE_SCHEMA IS NOT NULL",
      [Object.values(result.databases).map((v) => v.database)],
    );
    if (fks.some((f) => f.s === source))
      throw Error("FK still references the archived source.");
    const childEnv = {
      ...process.env,
      ACCEPTANCE_SPLIT_SOURCE: source,
      DB_NAME: result.databases["web-gateway"].database,
      DB_USER: "root",
      DB_PASSWORD: password,
      SERVICE_DB_LAYOUT: "split",
    };
    for (const key of [
      "DB_PASSWORD",
      "SESSION_SECRET",
      "DEMO_PASSWORD",
      "INTERNAL_SECRET",
    ])
      if (childEnv[key]) delete childEnv[key + "_FILE"];
    await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ["scripts/isolated-acceptance.cjs"],
        { env: childEnv, stdio: "inherit" },
      );
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(Error("Split acceptance failed: " + code)),
      );
    });
    console.log(
      "SPLIT DATABASE ACCEPTANCE PASS: six service databases/accounts, copy preservation, replay, FKs, and business workflows.",
    );
  } finally {
    await admin.end();
  }
})().catch((error) => {
  console.error({
    event: "split_acceptance_failed",
    code: error.code,
    message: error.sqlMessage ? undefined : error.message,
  });
  process.exitCode = 1;
});
