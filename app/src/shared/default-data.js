// =============================================================================
// BỘ DỮ LIỆU MẶC ĐỊNH (nút "Xóa dữ liệu test")
//   Tệp database/seeders/default-data.json là ảnh chụp toàn bộ CSDL, sinh bằng
//   scripts/build-default-data.cjs. Khôi phục xong, CSDL giống hệt tệp này,
//   chỉ khác: ngày tháng được dời theo ngày bấm nút.
// =============================================================================
const fs = require("node:fs");
const path = require("node:path");
const C = require("../services/domain/core");

const FILE = path.join(__dirname, "../../database/seeders/default-data.json");
const SKIPPED_TABLES = new Set(["PhienDangNhap", "LanThuDangNhap", "YeuCauChongLap"]); // luôn để trống
const KEPT_TABLES = new Set(["LichSuCSDL"]); // lịch sử migration của máy đang chạy
const BATCH = 200;
const DAY = 86400000;
const name = (value) => {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) throw Error("Invalid identifier");
  return "`" + value + "`";
};

const load = (file = FILE) => JSON.parse(fs.readFileSync(file, "utf8"));

// ------------------------------------------------------------------ dời ngày
/** Số ngày cần cộng để ngày sinh dữ liệu trở thành HÔM QUA: không có giờ nào rơi vào tương lai ngoài ý muốn. */
function shiftDays(baseDate, today = C.today()) {
  return Math.round((Date.parse(today) - Date.parse(baseDate)) / DAY) - 1;
}
/** "2026-11-25" hoặc "2026-11-25 08:00:00" cộng thêm N ngày, giữ nguyên giờ. */
function shiftDate(value, days) {
  const moved = new Date(Date.parse(value.slice(0, 10) + "T00:00:00Z") + days * DAY).toISOString().slice(0, 10);
  return moved + value.slice(10);
}
/** Dời các ngày nằm trong đoạn chữ hoặc JSON (2026-11-25… và 25/11/2026). */
function shiftText(text, days) {
  return text
    .replace(/\b20\d\d-\d\d-\d\d(?!\d|-)/g, (date) => (Number.isNaN(Date.parse(date)) ? date : shiftDate(date, days)))
    .replace(/\b(\d\d)\/(\d\d)\/(20\d\d)\b/g, (whole, d, m, y) => {
      if (Number.isNaN(Date.parse(`${y}-${m}-${d}`))) return whole;
      return shiftDate(`${y}-${m}-${d}`, days).split("-").reverse().join("/");
    });
}

// -------------------------------------------------------- kiểm tra trước khi xóa
/** Cột của từng bảng thật trong CSDL: Map(bảng → Map(cột → kiểu)). */
async function readSchema(c) {
  const [rows] = await c.query(
    "SELECT c.TABLE_NAME t,c.COLUMN_NAME f,c.DATA_TYPE type FROM information_schema.COLUMNS c JOIN information_schema.TABLES b" +
      " ON b.TABLE_SCHEMA=c.TABLE_SCHEMA AND b.TABLE_NAME=c.TABLE_NAME AND b.TABLE_TYPE='BASE TABLE' WHERE c.TABLE_SCHEMA=DATABASE()",
  );
  const schema = new Map();
  for (const { t, f, type } of rows) {
    if (!schema.has(t)) schema.set(t, new Map());
    schema.get(t).set(f, type);
  }
  return schema;
}
const mismatch = (condition, message) => C.fail(condition, "DEFAULT_DATA_MISMATCH", message + ". Dữ liệu hiện tại chưa bị xóa.", 409);
/** Dừng trước khi xóa bất kỳ dữ liệu nào nếu tệp không khớp cấu trúc CSDL. */
async function assertFits(c, data, schema) {
  const [applied] = await c.query("SELECT Ten,MaBam FROM LichSuCSDL");
  const hashes = new Map(applied.map((m) => [m.Ten, m.MaBam]));
  const missing = data.migrations.filter((m) => hashes.get(m.Ten) !== m.MaBam).map((m) => m.Ten);
  mismatch(missing.length, "CSDL chưa đúng phiên bản của bộ dữ liệu mặc định: " + missing.join(", "));
  for (const [table, { columns }] of Object.entries(data.tables)) {
    const real = schema.get(table);
    mismatch(!real, "Bộ dữ liệu mặc định không khớp CSDL: thiếu bảng " + table);
    const unknown = columns.filter((f) => !real.has(f));
    mismatch(unknown.length, `Bộ dữ liệu mặc định không khớp CSDL: bảng ${table} thiếu cột ${unknown.join(", ")}`);
  }
}

// ----------------------------------------------------------------- khôi phục
async function insertRows(c, table, columns, rows) {
  const sql = `INSERT INTO ${name(table)} (${columns.map(name).join(",")}) VALUES ?`;
  for (let at = 0; at < rows.length; at += BATCH) await c.query(sql, [rows.slice(at, at + BATCH)]);
}

function prepareRows(table, { columns, rows }, types, days, passwordHash) {
  const change = columns.map((field) => {
    const type = types.get(field);
    if (table === "NguoiDung" && field === "MatKhauBam") return () => passwordHash;
    if (["date", "datetime", "timestamp"].includes(type)) return (v) => shiftDate(v, days);
    if (type === "json" || (table === "ThongBao" && ["varchar", "text", "longtext"].includes(type))) return (v) => shiftText(v, days);
    return null;
  });
  return rows.map((row) => row.map((value, i) => (change[i] && value !== null ? change[i](value) : value)));
}

/**
 * Thay toàn bộ dữ liệu bằng bộ mặc định. Người gọi mở giao dịch và tắt kiểm tra
 * khóa ngoại; lỗi giữa chừng thì hoàn tác là dữ liệu cũ còn nguyên.
 */
async function restore(c, data, { today = C.today(), password = process.env.DEMO_PASSWORD || "123456" } = {}) {
  const schema = await readSchema(c);
  await assertFits(c, data, schema);
  const days = shiftDays(data.base_date, today);
  const passwordHash = C.hashPassword(password);
  const rowsOf = (table) => prepareRows(table, data.tables[table], schema.get(table), days, passwordHash);
  const insert = (table, rows = rowsOf(table)) => insertRows(c, table, data.tables[table].columns, rows);

  const cleared = [...schema.keys()].filter((table) => !KEPT_TABLES.has(table));
  for (const table of cleared) await c.query("DELETE FROM " + name(table));

  // Ba bảng có trigger nên phải nạp theo thứ tự riêng:
  // - Thêm MatHang thì CSDL tự tạo NguyenVatLieu/ThanhPham: bỏ dòng tự tạo rồi nạp dòng thật.
  await insert("MatHang");
  for (const table of ["NguyenVatLieu", "ThanhPham"]) {
    await c.query("DELETE FROM " + name(table));
    await insert(table);
  }
  // - Thêm DonMuaHang đòi kế hoạch mua đang ở trạng thái đã duyệt: nạp tạm là đã duyệt, sau đó nạp lại trạng thái thật.
  const plans = rowsOf("KeHoachMuaBan");
  const status = data.tables.KeHoachMuaBan.columns.indexOf("TrangThai");
  await insert("KeHoachMuaBan", plans.map((row) => row.map((v, i) => (i === status ? "APPROVED" : v))));
  await insert("DonMuaHang");
  await c.query("DELETE FROM KeHoachMuaBan");
  await insert("KeHoachMuaBan", plans);

  const done = new Set(["MatHang", "NguyenVatLieu", "ThanhPham", "KeHoachMuaBan", "DonMuaHang"]);
  for (const table of Object.keys(data.tables)) if (!done.has(table)) await insert(table);

  // Đánh dấu dữ liệu mẫu ban đầu đã có, để khởi động lại không nạp chồng lên.
  if (data.markers.length) await c.query("INSERT IGNORE INTO LichSuCSDL(Ten,MaBam) VALUES ?", [data.markers.map((m) => [m.Ten, m.MaBam])]);
  return { cleared_tables: cleared.length, rows: Object.values(data.tables).reduce((n, t) => n + t.rows.length, 0) };
}

/** Sau khi đã lưu: mã số của bản ghi mới tiếp nối bộ mặc định, không tiếp nối dữ liệu vừa xóa. */
async function resetNumbering(c, data) {
  const [rows] = await c.query("SELECT TABLE_NAME t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND EXTRA='auto_increment'");
  await c.query("SET SESSION lock_wait_timeout=5");
  for (const { t } of rows) if (data.tables[t]) await c.query(`ALTER TABLE ${name(t)} AUTO_INCREMENT=1`);
}

module.exports = { FILE, SKIPPED_TABLES, KEPT_TABLES, load, restore, resetNumbering, shiftDays, shiftDate, shiftText };
