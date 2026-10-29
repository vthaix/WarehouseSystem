// Explicit one-time upgrade from the original 18-table database. Source stays intact.
const mysql = require("mysql2/promise");
const assert = require("node:assert/strict");
require("../src/config/env").loadEnv();
const identifiers = require("../database/adminer/identifiers.json");
const source = process.argv[2] || "warehouse_system";
const target = process.env.DB_NAME;
const tables = [
  "users",
  "roles",
  "user_roles",
  "customers",
  "workshops",
  "workshop_users",
  "suppliers",
  "warehouses",
  "warehouse_locations",
  "categories",
  "units",
  "items",
  "notifications",
  "audit_logs",
  "idempotency_records",
  "sessions",
  "login_attempts",
];
const quote = (value) => {
  assert.match(value, /^[A-Za-z][A-Za-z0-9_]*$/);
  return "`" + value + "`";
};
(async () => {
  if (source === target) throw new Error("Source and target must differ.");
  quote(source);
  quote(target);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: target,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  try {
    const [[lock]] = await connection.query(
      "SELECT GET_LOCK('warehouse:seed',30) AS acquired",
    );
    if (Number(lock.acquired) !== 1)
      throw new Error("Cannot lock data import.");
    await connection.beginTransaction();
    const counts = {};
    for (const table of tables) {
      const destination = identifiers.tables[table];
      const [[existing]] = await connection.query(
        `SELECT COUNT(*) AS n FROM ${quote(target)}.${quote(destination)}`,
      );
      if (Number(existing.n) !== 0)
        throw new Error(
          "Target is not empty: " + destination + ". Import before demo seed.",
        );
      const [columns] = await connection.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION",
        [source, table],
      );
      if (!columns.length) throw new Error("Missing legacy table: " + table);
      const names = columns.map((row) => row.COLUMN_NAME);
      const mapped = names.map((name) => {
        if (!identifiers.columns[name])
          throw new Error("Unmapped legacy column: " + table + "." + name);
        return identifiers.columns[name];
      });
      await connection.query(
        `INSERT INTO ${quote(target)}.${quote(destination)} (${mapped.map(quote).join(",")}) SELECT ${names.map(quote).join(",")} FROM ${quote(source)}.${quote(table)}`,
      );
      const [[before]] = await connection.query(
        `SELECT COUNT(*) AS n FROM ${quote(source)}.${quote(table)}`,
      );
      const [[after]] = await connection.query(
        `SELECT COUNT(*) AS n FROM ${quote(target)}.${quote(destination)}`,
      );
      assert.equal(String(before.n), String(after.n));
      counts[destination] = Number(after.n);
    }
    await connection.commit();
    console.log(
      JSON.stringify({
        event: "legacy_import_complete",
        source,
        target,
        source_preserved: true,
        counts,
      }),
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query("SELECT RELEASE_LOCK('warehouse:seed')");
    await connection.end();
  }
})().catch((error) => {
  console.error(
    JSON.stringify({
      event: "legacy_import_failed",
      code: error.code || "IMPORT_ERROR",
      message: error.code
        ? "Database import failed; source preserved."
        : error.message,
    }),
  );
  process.exitCode = 1;
});
