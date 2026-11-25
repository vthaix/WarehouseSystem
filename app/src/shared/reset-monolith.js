// Nút "Xóa dữ liệu test": sao lưu → xóa → nạp lại bộ dữ liệu mặc định (default-data.js).
// Chỉ chạy ở môi trường phát triển có bật ENABLE_TEST_RESET.
// RESET_DEFAULT_DATA=false: chỉ xóa dữ liệu nghiệp vụ, giữ tài khoản và danh mục (dùng cho các bài kiểm thử tự động).
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");
const defaultData = require("./default-data");

const q = (v) => {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(v)) throw Error("Invalid identifier");
  return "`" + v + "`";
};
// Các bảng giữ lại khi RESET_DEFAULT_DATA=false.
const retained = new Set(["NguoiDung", "VaiTro", "NguoiDungVaiTro", "NguoiDungXuong", "BoPhan", "NhanVien", "KhachHang", "Xuong", "NhaCungCap",
  "LoaiHang", "DonViTinh", "MatHang", "NguyenVatLieu", "ThanhPham", "Kho", "ViTriKho", "LichSuCSDL",
  "users", "roles", "user_roles", "customers", "workshops", "workshop_users", "suppliers", "warehouses", "warehouse_locations", "categories", "units", "items"]);

const connect = () => mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  dateStrings: true, supportBigNumbers: true, bigNumberStrings: true,
});

async function listTables(c) {
  const [rows] = await c.execute("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  return rows.map((r) => r.name);
}

/** Ghi toàn bộ CSDL ra tệp SQL có thể nạp lại. */
async function backup(c, file, tables) {
  const [views] = await c.execute("SELECT TABLE_NAME name FROM information_schema.VIEWS WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME");
  const [triggers] = await c.execute("SELECT TRIGGER_NAME name FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const fd = fs.openSync(file, "wx", 0o600);
  const write = (text) => fs.writeSync(fd, text);
  try {
    write("-- Backup before development reset\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n");
    await c.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    for (const table of tables) {
      const [[ddl]] = await c.query("SHOW CREATE TABLE " + q(table));
      write(ddl["Create Table"] + ";\n");
      const [columns] = await c.execute("SELECT COLUMN_NAME name,EXTRA extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [table]);
      const fields = columns.filter((x) => !/GENERATED/.test(x.extra) || /DEFAULT_GENERATED/.test(x.extra)).map((x) => x.name);
      const list = fields.map(q).join(",");
      const [rows] = await c.query("SELECT " + list + " FROM " + q(table));
      const value = (v) => c.escape(v && typeof v === "object" && !Buffer.isBuffer(v) ? JSON.stringify(v) : v);
      for (const row of rows) write("INSERT INTO " + q(table) + " (" + list + ") VALUES (" + fields.map((f) => value(row[f])).join(",") + ");\n");
    }
    for (const { name } of views) {
      const [[ddl]] = await c.query("SHOW CREATE VIEW " + q(name));
      write("DROP VIEW IF EXISTS " + q(name) + ";\n" + ddl["Create View"] + ";\n");
    }
    for (const { name } of triggers) {
      const [[ddl]] = await c.query("SHOW CREATE TRIGGER " + q(name));
      write("DROP TRIGGER IF EXISTS " + q(name) + ";\n" + ddl["SQL Original Statement"] + ";\n");
    }
    await c.commit();
    write("SET FOREIGN_KEY_CHECKS=1;\n");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

/** Chạy trong một giao dịch, tạm tắt kiểm tra khóa ngoại; lỗi thì dữ liệu cũ còn nguyên. */
async function replaceData(c, work) {
  await c.query("SET FOREIGN_KEY_CHECKS=0");
  await c.beginTransaction();
  try {
    const result = await work();
    await c.commit();
    return result;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    await c.query("SET FOREIGN_KEY_CHECKS=1");
  }
}

async function restoreDefault(c) {
  const data = defaultData.load();
  const { cleared_tables } = await replaceData(c, () => defaultData.restore(c, data));
  await defaultData.resetNumbering(c, data);
  return { cleared_tables, message: "Đã khôi phục bộ dữ liệu test mặc định (gồm cả tài khoản và danh mục). Vui lòng đăng nhập lại." };
}

async function clearOnly(c, tables) {
  const targets = tables.filter((t) => !retained.has(t));
  await replaceData(c, async () => { for (const table of targets) await c.query("DELETE FROM " + q(table)); });
  // Tồn kho đầu kỳ là một phần của dữ liệu ban đầu: bỏ dấu đã nạp rồi nạp lại.
  await c.execute("DELETE FROM LichSuCSDL WHERE Ten='demo_material_queue_v2'");
  await require("../../database/seeders/queue-demo").seed(require("../config/database").getPool());
  return { cleared_tables: targets.length, message: "Đã xóa dữ liệu nghiệp vụ. Tài khoản và danh mục được giữ nguyên. Vui lòng đăng nhập lại." };
}

/** Bỏ các mốc đã chạy của bộ seed-demo-workflows cũ (nếu có) vì dữ liệu của nó vừa bị xóa. */
function archiveCheckpoints(dir, key) {
  const checkpoints = path.join(dir, "demo-workflows");
  if (!fs.existsSync(checkpoints)) return;
  const saved = path.join(dir, "cleared-fixtures-" + key);
  fs.mkdirSync(saved, { recursive: true });
  for (const file of fs.readdirSync(checkpoints).filter((f) => /^[a-f0-9]{16}\.json$/.test(f)))
    fs.renameSync(path.join(checkpoints, file), path.join(saved, file));
}

async function reset({ key, actor }) {
  if (!require("../config/reset-tools").enabled()) throw Error("Test reset disabled");
  const c = await connect();
  const dir = process.env.BACKUP_DIRECTORY || "/var/backups/warehouse";
  const receipt = path.join(dir, "reset-" + key + ".json");
  let locked = false;
  try {
    const [[lock]] = await c.execute("SELECT GET_LOCK('warehouse:test-reset',0) n");
    if (Number(lock.n) !== 1) throw Error("Reset already running");
    locked = true;

    // Bấm lại cùng một lần (mất mạng giữa chừng): trả kết quả cũ, không chạy lần hai.
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    if (fs.existsSync(receipt)) {
      const previous = JSON.parse(fs.readFileSync(receipt));
      if (previous.actor !== String(actor.id)) throw Error("Reset key belongs to another account");
      return previous.result;
    }

    const tables = await listTables(c);
    const file = path.join(dir, "reset-" + key + ".sql");
    await backup(c, file, tables);
    const outcome = process.env.RESET_DEFAULT_DATA === "false" ? await clearOnly(c, tables) : await restoreDefault(c);
    archiveCheckpoints(dir, key);

    const result = { backup: file, ...outcome };
    fs.writeFileSync(receipt, JSON.stringify({ actor: String(actor.id), result }), { mode: 0o600 });
    return result;
  } finally {
    if (locked) await c.query("SELECT RELEASE_LOCK('warehouse:test-reset')");
    await c.end();
  }
}

module.exports = { reset, retained };
