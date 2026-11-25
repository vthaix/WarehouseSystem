// Sinh bộ dữ liệu mặc định cho nút "Xóa dữ liệu test".
//
// CHỈ chạy trên bản review riêng (ACCEPTANCE_MONOLITH=true) với CSDL vừa migrate + seed, chưa có đơn hàng:
//   docker exec <app review> node scripts/build-default-data.cjs <thư mục ghi kết quả>
// Kết quả: default-data.json (chép vào database/seeders) và DU_LIEU_TEST_MAC_DINH.md (chép vào docs).
const fs = require("node:fs");
const path = require("node:path");
require("../src/config/env").loadEnv();
const mysql = require("mysql2/promise");
const F = require("./default-data/flows.cjs");
const scenarios = require("./default-data/scenarios.cjs");
const { dump } = require("./default-data/dump.cjs");
const { writeGuide } = require("./default-data/guide.cjs");

const connect = () =>
  mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    dateStrings: true, supportBigNumbers: true, bigNumberStrings: true,
  });

/** Bảng có khóa tự tăng MaBanGhi và các cột ngày của bảng đó. */
async function datedTables(db) {
  const [rows] = await db.query(
    "SELECT c.TABLE_NAME t,c.COLUMN_NAME f FROM information_schema.COLUMNS c JOIN information_schema.TABLES b" +
      " ON b.TABLE_SCHEMA=c.TABLE_SCHEMA AND b.TABLE_NAME=c.TABLE_NAME AND b.TABLE_TYPE='BASE TABLE'" +
      " WHERE c.TABLE_SCHEMA=DATABASE() AND c.DATA_TYPE IN ('date','datetime','timestamp') AND c.EXTRA NOT LIKE '%GENERATED'" +
      " AND EXISTS(SELECT 1 FROM information_schema.COLUMNS k WHERE k.TABLE_SCHEMA=c.TABLE_SCHEMA AND k.TABLE_NAME=c.TABLE_NAME AND k.COLUMN_NAME='MaBanGhi' AND k.EXTRA='auto_increment')",
  );
  const tables = new Map();
  for (const { t, f } of rows) tables.set(t, [...(tables.get(t) || []), f]);
  return tables;
}
const lastIds = async (db, tables) => {
  const result = new Map();
  for (const table of tables.keys()) result.set(table, (await db.query(`SELECT COALESCE(MAX(MaBanGhi),0) n FROM \`${table}\``))[0][0].n);
  return result;
};
/** Dựng một chuỗi nghiệp vụ rồi lùi toàn bộ ngày giờ của các dòng mới về N ngày trước. */
const backdater = (db, tables) => async (days, build) => {
  const before = await lastIds(db, tables);
  await build();
  for (const [table, fields] of tables) {
    const set = fields.map((f) => `\`${f}\`=DATE_SUB(\`${f}\`,INTERVAL ${Number(days)} DAY)`).join(",");
    await db.query(`UPDATE \`${table}\` SET ${set} WHERE MaBanGhi>?`, [before.get(table)]);
  }
};

/** Chỉnh cuối: chỉ đổi ngày hiển thị và trạng thái đã đọc, không đổi số lượng hay trạng thái nghiệp vụ. */
async function finish(db) {
  const today = F.today;
  // Lô còn tồn hoặc chờ xử lý có hạn ngắn (trứng, sữa, bơ…): kéo dài để vài tháng không bấm nút vẫn test được.
  await db.query("UPDATE ChiTietLo SET HanSuDung=DATE_ADD(HanSuDung,INTERVAL 60 DAY) WHERE Ma LIKE 'DEMO-Q-%' AND HanSuDung IS NOT NULL");
  await db.query("UPDATE ChiTietLo SET HanSuDung=DATE_ADD(?,INTERVAL 200 DAY) WHERE Ma NOT LIKE 'DEMO-Q-%' AND HanSuDung<DATE_ADD(?,INTERVAL 200 DAY)", [today, today]);
  // Việc đã xong thì hiện lịch của ngày lập thay vì ngày tương lai.
  const done = "CONCAT(DATE(NgayTao),' 01:00:00')", doneEnd = "CONCAT(DATE(NgayTao),' 09:00:00')";
  await db.query(`UPDATE CongViec SET BatDauLuc=${done},KetThucLuc=${doneEnd},NgayCapNhat=NgayCapNhat WHERE TrangThai IN ('COMPLETED','CANCELLED')`);
  await db.query(`UPDATE DotKiemKe SET BatDauLuc=${done},KetThucLuc=${doneEnd},NgayDuKien=DATE(NgayTao),NgayCapNhat=NgayCapNhat WHERE TrangThai IN ('COMPLETED','CLOSED')`);
  // Thông báo sinh ra khi dựng dữ liệu: giữ 15 cái mới nhất mỗi người và đã đọc, để thông báo mới khi test dễ nhận ra.
  await db.query("DELETE t FROM ThongBao t JOIN (SELECT MaBanGhi,ROW_NUMBER() OVER (PARTITION BY MaNguoiDung ORDER BY MaBanGhi DESC) thu FROM ThongBao) x ON x.MaBanGhi=t.MaBanGhi WHERE x.thu>15");
  await db.query("UPDATE ThongBao SET NgayDoc=COALESCE(NgayDoc,NgayTao)");
  for (const table of ["PhienDangNhap", "LanThuDangNhap", "YeuCauChongLap"]) await db.query(`DELETE FROM ${table}`);
  await db.query("DELETE FROM NhatKyHeThong WHERE HanhDong='LOGIN'");
  // Hồ sơ nhân viên của tài khoản mới: app tự thêm lúc khởi động, thêm luôn để khôi phục xong là đủ.
  await db.query("INSERT IGNORE INTO NhanVien (MaNguoiDung,MaNhanVien) SELECT DISTINCT u.MaBanGhi,CONCAT('NV-',u.MaBanGhi) FROM NguoiDung u JOIN NguoiDungVaiTro v ON v.MaNguoiDung=u.MaBanGhi JOIN VaiTro r ON r.MaBanGhi=v.MaVaiTro WHERE r.Ma<>'CUSTOMER'");
}

(async () => {
  if (process.env.ACCEPTANCE_MONOLITH !== "true" || process.env.NODE_ENV === "production") throw Error("Chỉ chạy trên bản review riêng.");
  const out = path.resolve(process.argv[2] || "/tmp/default-data");
  fs.mkdirSync(out, { recursive: true });
  const db = await connect();
  const [[{ n }]] = await db.query("SELECT COUNT(*) n FROM DonHang");
  if (Number(n)) throw Error("CSDL đã có đơn hàng. Cần CSDL vừa migrate + seed để bộ dữ liệu luôn giống nhau.");
  await F.loadReferences(db);
  const guide = await scenarios.build({ db, backdate: backdater(db, await datedTables(db)) });
  await finish(db);
  const data = await dump(db, F.today);
  fs.writeFileSync(path.join(out, "default-data.json"), data.text);
  fs.writeFileSync(path.join(out, "DU_LIEU_TEST_MAC_DINH.md"), writeGuide(guide));
  console.log(`XONG: ${data.tables} bảng, ${data.rows} dòng, ${(data.text.length / 1048576).toFixed(1)} MB → ${out}`);
  await db.end();
})().catch((e) => { console.error(e); process.exit(1); });
