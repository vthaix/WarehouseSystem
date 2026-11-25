// Ghi toàn bộ CSDL ra một tệp JSON: mỗi dòng dữ liệu một dòng chữ để dễ so sánh thay đổi trên git.
const { SKIPPED_TABLES } = require("../../src/shared/default-data");

async function dump(db, baseDate) {
  const [tables] = await db.query("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const [history] = await db.query("SELECT Ten,MaBam FROM LichSuCSDL ORDER BY Ten");
  const parts = [];
  let total = 0;
  for (const { name } of tables) {
    if (SKIPPED_TABLES.has(name) || name === "LichSuCSDL") continue;
    const [columns] = await db.query(
      "SELECT COLUMN_NAME name,DATA_TYPE type,EXTRA extra,COLUMN_KEY k FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [name]);
    const writable = columns.filter((c) => !/GENERATED/.test(c.extra) || /DEFAULT_GENERATED/.test(c.extra));
    const key = columns.filter((c) => c.k === "PRI").map((c) => "`" + c.name + "`").join(",") || "1";
    const [rows] = await db.query(`SELECT ${writable.map((c) => "`" + c.name + "`").join(",")} FROM \`${name}\` ORDER BY ${key}`);
    total += rows.length;
    // Không lưu mật khẩu: khi khôi phục dùng mật khẩu mẫu chung.
    if (name === "NguoiDung") for (const row of rows) row.MatKhauBam = "";
    const values = rows.map((r) => JSON.stringify(writable.map((c) => (c.type === "json" && r[c.name] !== null && typeof r[c.name] !== "string" ? JSON.stringify(r[c.name]) : r[c.name]))));
    parts.push(`${JSON.stringify(name)}:{"columns":${JSON.stringify(writable.map((c) => c.name))},"rows":[${values.length ? "\n" + values.join(",\n") + "\n" : ""}]}`);
  }
  const migrations = history.filter((h) => !h.Ten.startsWith("demo_"));
  const markers = history.filter((h) => h.Ten.startsWith("demo_"));
  const text = `{"base_date":${JSON.stringify(baseDate)},\n"migrations":${JSON.stringify(migrations)},\n"markers":${JSON.stringify(markers)},\n"tables":{\n${parts.join(",\n")}\n}}\n`;
  return { text, tables: parts.length, rows: total };
}
module.exports = { dump };
