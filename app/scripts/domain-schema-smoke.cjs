const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const { migrate, applyStatement } = require("../src/shared/migrations");
const identifiers = require("../database/adminer/identifiers.json");
(async () => {
  if (process.env.NODE_ENV === "production")
    throw new Error("Schema smoke is development-only.");
  const pool = getPool();
  async function fingerprints() {
    const [users] = await pool.query(
      "SELECT id,username,password_hash FROM users ORDER BY id",
    );
    const [items] = await pool.query("SELECT id,code FROM items ORDER BY id");
    const [history] = await pool.query(
      "SELECT name,checksum FROM schema_migrations ORDER BY name",
    );
    return { users, items, history };
  }
  const before = await fingerprints();
  const [rows] = await pool.query("SHOW TABLES");
  const tables = new Set(rows.map((row) => Object.values(row)[0]));
  for (const table of Object.values(identifiers.tables))
    assert.ok(tables.has(table), "Missing table " + table);
  for (const old of [
    "KeHoachKinhDoanh",
    "ThanhPhamKeHoach",
    "YeuCauKho",
    "PhieuKiemTraChatLuong",
    "DeXuatXuLy",
    "KhoKiemKe",
  ])
    assert.ok(!tables.has(old), "Old table survived rename " + old);
  await migrate(pool);
  // Simulate rerunning the DDL after a crash before its ledger INSERT, without deleting history.
  const sql = fs.readFileSync(
    path.resolve(
      __dirname,
      "../database/migrations/005_domain_names_and_purchase_source.sql",
    ),
    "utf8",
  );
  for (const statement of sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean))
    await applyStatement(
      pool,
      statement,
      "005_domain_names_and_purchase_source.sql",
    );
  assert.deepEqual(await fingerprints(), before);
  const [[column]] = await pool.execute(
    "SELECT CHARACTER_MAXIMUM_LENGTH AS width FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?",
    ["PhieuYeuCauNhapXuat", "Kieu"],
  );
  assert.ok(Number(column.width) >= 11);
  const [[fk]] = await pool.execute(
    "SELECT REFERENCED_TABLE_NAME AS target FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=? AND REFERENCED_TABLE_NAME IS NOT NULL",
    ["KeHoachMuaBan", "MaKeHoachSanXuat"],
  );
  assert.equal(fk.target, "KeHoachSanXuat");
  console.log(
    "DOMAIN SCHEMA PASS: " +
      tables.size +
      " tables, canonical names, source FK, PROCUREMENT type, migration replay and DDL crash recovery preserve IDs/passwords/history.",
  );
})()
  .catch((error) => {
    console.error(error.code || error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
