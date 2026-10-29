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
  const [objects] = await pool.query("SELECT TABLE_NAME,TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()");
  const objectTypes = new Map(objects.map(row => [row.TABLE_NAME, row.TABLE_TYPE]));
  for (const name of ['BanBaoCaoSanXuat', 'ChiTietBaoCaoSanXuat', 'ChiTietLoBaoCaoSanXuat', 'LoHang', 'ChiTietLo', 'NhanVien', 'BoPhan'])
    assert.equal(objectTypes.get(name), 'BASE TABLE', name);
  for (const name of ['BaoCaoSanXuat', 'BaoCaoThanhPham', 'ChiTietNhuCauSanXuat', 'NguyenLieuSuDung', 'HoSoKho'])
    assert.equal(objectTypes.get(name), 'VIEW', name);
  for (const name of ['BienDongKho', 'ChiTietKetQuaKiemTraQCAC', 'ChiTietPhieuKho', 'ChiTietPhieuKiemKe', 'LoLichKiemTra', 'PhanCongKho', 'ChiTietLoBaoCaoSanXuat', 'TonKho']) {
    const [[detailFk]] = await pool.execute("SELECT REFERENCED_TABLE_NAME AS target FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME='MaChiTietLo' AND REFERENCED_TABLE_NAME IS NOT NULL", [name]);
    assert.equal(detailFk?.target, 'ChiTietLo', name);
  }
  const [planTables] = await pool.execute("SELECT TABLE_NAME,TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('ChiTietKeHoachSanXuat','ChiTietNguyenLieuKeHoachSanXuat','ThanhPhamKeHoachTuongThich')");
  const types = new Map(planTables.map(row => [row.TABLE_NAME, row.TABLE_TYPE]));
  assert.equal(types.get('ChiTietKeHoachSanXuat'), 'BASE TABLE');
  assert.equal(types.get('ChiTietNguyenLieuKeHoachSanXuat'), 'VIEW');
  assert.equal(types.get('ThanhPhamKeHoachTuongThich'), 'VIEW');
  const [[counts]] = await pool.query("SELECT (SELECT COUNT(*) FROM production_plan_lines) AS all_count,(SELECT COUNT(*) FROM production_plan_outputs) AS output_count,(SELECT COUNT(*) FROM production_plan_materials) AS material_count");
  assert.equal(Number(counts.all_count), Number(counts.output_count) + Number(counts.material_count));
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
      " SQL objects (" + objects.filter(row => row.TABLE_TYPE === 'BASE TABLE').length + " tables, " + objects.filter(row => row.TABLE_TYPE === 'VIEW').length + " views), unified reports, lot-detail FKs, derived records, canonical names, migration replay preserve IDs/passwords/history.",
  );
})()
  .catch((error) => {
    console.error(error.code || error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
