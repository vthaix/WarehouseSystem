const { test } = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const D = require("../../src/shared/default-data");
const root = path.join(__dirname, "../..");

test("default data: the build day becomes yesterday and every date keeps its distance", () => {
  assert.equal(D.shiftDays("2026-11-25", "2026-11-25"), -1);
  assert.equal(D.shiftDays("2026-11-25", "2026-11-26"), 0);
  assert.equal(D.shiftDays("2026-11-25", "2027-03-01"), 95);
  assert.equal(D.shiftDate("2026-11-25", -1), "2026-11-24");
  assert.equal(D.shiftDate("2026-12-31 23:59:59.123456", 1), "2027-01-01 23:59:59.123456");
  assert.equal(D.shiftText('{"a":"2026-11-25T01:00:00.000Z","b":"25/11/2026"}', 1), '{"a":"2026-11-26T01:00:00.000Z","b":"26/11/2026"}');
  assert.equal(D.shiftText("DOT-KIEM-KE-001 99/99/2026 2026-99-99", 1), "DOT-KIEM-KE-001 99/99/2026 2026-99-99");
});

test("default data file: matches the migrations in the repository and is internally consistent", () => {
  const data = D.load();
  const files = fs.readdirSync(path.join(root, "database/monolith")).filter((f) => /^\d{3}_/.test(f)).sort();
  assert.deepEqual(data.migrations.map((m) => m.Ten).sort(), files, "Có migration mới: cần sinh lại bộ dữ liệu mặc định");
  for (const [table, { columns, rows }] of Object.entries(data.tables)) for (const row of rows) assert.equal(row.length, columns.length, table);
  for (const table of D.SKIPPED_TABLES) assert.equal(data.tables[table], undefined, table);
  const passwords = data.tables.NguoiDung.columns.indexOf("MatKhauBam");
  assert.ok(data.tables.NguoiDung.rows.every((row) => row[passwords] === ""), "Không lưu mật khẩu trong tệp");
});

/** CSDL giả: ghi lại các câu lệnh, đủ để kiểm thứ tự và việc dừng trước khi xóa. */
function fakeDatabase(data, { migrations = data.migrations } = {}) {
  const log = [];
  const schema = Object.entries(data.tables).flatMap(([t, { columns }]) => columns.map((f) => ({ t, f, type: "varchar" })));
  return { log, async query(sql, params) {
    if (sql.includes("information_schema.COLUMNS")) return [[...schema, { t: "PhienDangNhap", f: "Ma", type: "varchar" }, { t: "LichSuCSDL", f: "Ten", type: "varchar" }]];
    if (sql.startsWith("SELECT Ten,MaBam")) return [migrations];
    log.push({ sql, rows: params?.[0]?.length || 0 });
    return [{}];
  } };
}
test("default data restore: clears everything except migration history, then loads every row", async () => {
  const data = D.load(), db = fakeDatabase(data);
  const result = await D.restore(db, data, { today: "2026-11-26", password: "123456" });
  const deleted = db.log.filter((x) => x.sql.startsWith("DELETE")).map((x) => x.sql);
  assert.ok(deleted.includes("DELETE FROM `PhienDangNhap`"));
  assert.ok(!deleted.some((sql) => sql.includes("LichSuCSDL")));
  assert.equal(result.rows, Object.values(data.tables).reduce((n, t) => n + t.rows.length, 0));
  const loaded = db.log.filter((x) => x.sql.startsWith("INSERT INTO")).reduce((n, x) => n + x.rows, 0);
  assert.equal(loaded, result.rows + data.tables.KeHoachMuaBan.rows.length, "Kế hoạch mua bán được nạp hai lần để qua trigger của đơn mua");
  const at = (text) => db.log.findIndex((x) => x.sql.startsWith(text));
  assert.ok(at("INSERT INTO `KeHoachMuaBan`") < at("INSERT INTO `DonMuaHang`"));
  assert.ok(at("INSERT INTO `MatHang`") < at("INSERT INTO `NguyenVatLieu`"));
});
test("default data restore: refuses before deleting when the database does not match", async () => {
  const data = D.load(), db = fakeDatabase(data, { migrations: data.migrations.slice(1) });
  await assert.rejects(() => D.restore(db, data, {}), (e) => e.code === "DEFAULT_DATA_MISMATCH" && /chưa bị xóa/.test(e.message));
  assert.equal(db.log.length, 0);
});
