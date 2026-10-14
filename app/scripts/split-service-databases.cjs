const fs = require("node:fs"),
  path = require("node:path"),
  mysql = require("mysql2/promise");
const { identifier: q } = require("../src/config/service-databases");
const {
  migrate,
  migration,
} = require("../database/services/migrations/001_split_existing.cjs");
const grants = require("../database/services/compatibility-grants.json");
const {credentialsFor} = require('../src/config/service-credentials');
async function backup(c, source, directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, source + "-before-service-split-v3.sql");
  if (fs.existsSync(file)) return file;
  const temporary = file + ".partial",
    fd = fs.openSync(temporary, "w", 0o600);
  try {
    fs.writeSync(
      fd,
      `CREATE DATABASE IF NOT EXISTS ${q(source)} CHARACTER SET utf8mb4;\nUSE ${q(source)};\nSET FOREIGN_KEY_CHECKS=0;\n`,
    );
    const [objects] = await c.execute(
      "SELECT TABLE_NAME name,TABLE_TYPE type FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME",
      [source],
    );
    await c.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    for (const { name } of objects.filter((o) => o.type === "BASE TABLE")) {
      const [[ddl]] = await c.query(
        `SHOW CREATE TABLE ${q(source)}.${q(name)}`,
      );
      fs.writeSync(fd, ddl["Create Table"] + ";\n");
      const [columns] = await c.execute(
        "SELECT COLUMN_NAME name,EXTRA extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION",
        [source, name],
      );
      const writable = columns.filter(
          (v) => !/(VIRTUAL|STORED) GENERATED/.test(v.extra),
        ),
        cols = writable.map((v) => q(v.name)).join(",");
      for (let offset = 0; ; offset += 500) {
        const [rows] = await c.query(
          `SELECT ${cols} FROM ${q(source)}.${q(name)} LIMIT 500 OFFSET ${offset}`,
        );
        for (const row of rows)
          fs.writeSync(
            fd,
            `INSERT INTO ${q(name)} (${cols}) VALUES (${writable.map((v) => c.escape(row[v.name] && typeof row[v.name] === "object" && !Buffer.isBuffer(row[v.name]) ? JSON.stringify(row[v.name]) : row[v.name])).join(",")});\n`,
          );
        if (rows.length < 500) break;
      }
    }
    for (const { name } of objects.filter((o) => o.type === "VIEW")) {
      const [[ddl]] = await c.query(`SHOW CREATE VIEW ${q(source)}.${q(name)}`);
      fs.writeSync(
        fd,
        ddl["Create View"].replace(/DEFINER=`[^`]+`@`[^`]+`/, "") + ";\n",
      );
    }
    const [triggers] = await c.execute(
      "SELECT TRIGGER_NAME name,EVENT_OBJECT_TABLE table_name,ACTION_TIMING timing,EVENT_MANIPULATION event,ACTION_STATEMENT body FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=?",
      [source],
    );
    for (const t of triggers)
      fs.writeSync(
        fd,
        `DELIMITER $$\nCREATE TRIGGER ${q(t.name)} ${t.timing} ${t.event} ON ${q(t.table_name)} FOR EACH ROW ${t.body}$$\nDELIMITER ;\n`,
      );
    await c.commit();
    fs.writeSync(fd, "SET FOREIGN_KEY_CHECKS=1;\n");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.renameSync(temporary, file);
    return file;
  } catch (error) {
    await c.rollback();
    fs.closeSync(fd);
    throw error;
  }
}
async function provision(
  c,
  result,
  { legacyUser } = {},
) {
  for (const [service, entry] of Object.entries(result.databases)) {
    const {user,password} = credentialsFor(service);
    const account = c.escape(user) + "@'%'";
    await c.query(
      `CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${c.escape(password)}`,
    );
    await c.query(`ALTER USER ${account} IDENTIFIED BY ${c.escape(password)}`);
    await c.query(`GRANT SELECT ON ${q(entry.database)}.* TO ${account}`);
    if (service === "business-service")
      await c.query(
        `GRANT LOCK TABLES ON ${q(result.databases["warehouse-service"].database)}.* TO ${account}`,
      );
    if (service === "warehouse-service")
      await c.query(
        `GRANT LOCK TABLES ON ${q(result.databases["business-service"].database)}.* TO ${account}`,
      );
    for (const object of result.objects)
      if (object.name !== "LichSuCSDL") {
        const owner = result.databases[result.byTable[object.name]];
        await c.query(
          `GRANT SELECT ON ${q(owner.database)}.${q(object.name)} TO ${account}`,
        );
        if (
          result.byTable[object.name] === service &&
          object.type === "BASE TABLE"
        )
          await c.query(
            `GRANT INSERT,UPDATE,DELETE ON ${q(owner.database)}.${q(object.name)} TO ${account}`,
          );
        if (
          result.byTable[object.name] === service &&
          object.type === "VIEW" &&
          service === "business-service"
        )
          await c.query(
            `GRANT INSERT,UPDATE,DELETE ON ${q(owner.database)}.${q(object.name)} TO ${account}`,
          );
      }
    // INVOKER views need DML on both the compatibility view and base object.
    const writes = { ...grants[service] };
    for (const object of result.objects)
      if (
        result.byTable[object.name] === service &&
        object.type === "BASE TABLE"
      )
        writes[object.name] = ["INSERT", "UPDATE", "DELETE"];
    for (const [table, permissions] of Object.entries(writes)) {
      const owner = result.databases[result.byTable[table]];
      await c.query(
        `GRANT ${permissions.join(",")} ON ${q(owner.database)}.${q(table)} TO ${account}`,
      );
      if (owner.database !== entry.database)
        await c.query(
          `GRANT ${permissions.join(",")} ON ${q(entry.database)}.${q(table)} TO ${account}`,
        );
    }
    // Business compatibility discriminator views must also be writable locally.
    if (service === "business-service")
      for (const table of [
        "BaoCaoSanXuat",
        "BaoCaoThanhPham",
        "ChiTietNhuCauSanXuat",
        "NguyenLieuSuDung",
      ])
        await c.query(
          `GRANT INSERT,UPDATE,DELETE ON ${q(entry.database)}.${q(table)} TO ${account}`,
        );
  }
  if (legacyUser)
    for (const entry of Object.values(result.databases))
      await c.query(
        `GRANT SELECT ON ${q(entry.database)}.* TO ${c.escape(legacyUser)}@'%'`,
      );
}
async function run() {
  require("../src/config/env").loadEnv();
  const source = process.env.SOURCE_DB_NAME || process.env.DB_NAME || "KhoHang";
  q(source);
  const password = fs
    .readFileSync(
      process.env.MYSQL_ROOT_PASSWORD_FILE ||
        "/run/warehouse-mysql-secrets/root_password",
      "utf8",
    )
    .trim();
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || "mysql",
    user: "root",
    password,
    database: source,
    timezone: "Z",
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  let locked = false;
  try {
    const [[lock]] = await c.query("SELECT GET_LOCK(?,60) acquired", [
      "warehouse:split:" + source,
    ]);
    if (Number(lock.acquired) !== 1)
      throw Error("Cannot acquire split migration lock.");
    locked = true;
    const file = await backup(
      c,
      source,
      process.env.BACKUP_DIRECTORY || "/var/backups/warehouse",
    );
    const result = await migrate(c, source);
    await require("../database/services/migrations/002_qualified_views.cjs").migrate(
      c,
      source,
      result,
    );
    await require("../database/services/migrations/003_auto_increment.cjs").migrate(
      c,
      source,
      result,
    );
    await provision(c, result, { legacyUser: process.env.DB_USER });
    await require('../database/services/migrations/004_partial_receipts.cjs').migrate(c,source,result);
    await require('../database/services/migrations/005_quarantine_disposition.cjs').migrate(c,source,result);
    await require('../database/services/migrations/006_stock_qc_correction.cjs').migrate(c,source,result);
    await require('../database/services/migrations/007_category_images.cjs').migrate(c,source,result);
    for (const [service, entry] of Object.entries(result.databases)) {
      const {user,password} = credentialsFor(service);
      const test = await mysql.createConnection({
        host: process.env.DB_HOST || "mysql",
        user,
        password,
        database: entry.database,
      });
      try {
        await test.query("SELECT * FROM TrangThaiDichVu");
      } finally {
        await test.end();
      }
    }
    console.log(
      JSON.stringify({
        event: "service_databases_ready",
        migration,
        already_applied: result.alreadyApplied,
        databases: Object.values(result.databases).map((v) => v.database),
        backup: file,
      }),
    );
  } finally {
    if (locked)
      await c.query("SELECT RELEASE_LOCK(?)", ["warehouse:split:" + source]);
    await c.end();
  }
}
if (require.main === module)
  run().catch((error) => {
    console.error({
      event: "service_database_migration_failed",
      code: error.code || "SPLIT_ERROR",
      message: error.sqlMessage ? undefined : error.message,
    });
    process.exitCode = 1;
  });
module.exports = { backup, provision, run };
