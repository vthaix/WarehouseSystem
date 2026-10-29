const { identifier: q } = require('../../../src/config/service-databases');
async function migrate(c, source, result) {
  const marker = '008_purchase_line_suppliers';
  let complete = 0;
  for (const entry of Object.values(result.databases)) {
    const [rows] = await c.query(`SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma=?`, [marker]);
    complete += rows.length;
  }
  if (complete === Object.keys(result.databases).length) return;
  const db = result.databases['business-service'].database;
  const [checks] = await c.execute("SELECT CONSTRAINT_NAME name,CHECK_CLAUSE clause FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=?", [db]);
  for (const check of checks)
    if (check.clause.includes('MaNhaCungCap') && check.clause.includes('MaKhachHang') && check.name !== 'CK_KeHoach_DoiTac008')
      await c.query(`ALTER TABLE ${q(db)}.KeHoachMuaBan DROP CHECK ${q(check.name)}`);
  if (!checks.some(v => v.name === 'CK_KeHoach_DoiTac008'))
    await c.query(`ALTER TABLE ${q(db)}.KeHoachMuaBan ADD CONSTRAINT CK_KeHoach_DoiTac008 CHECK ((Kieu='PURCHASE' AND MaKhachHang IS NULL AND MaDonHang IS NULL) OR (Kieu='SALE' AND MaNhaCungCap IS NULL AND MaKhachHang IS NOT NULL AND MaDonHang IS NOT NULL))`);
  await c.query(`ALTER TABLE ${q(db)}.DonMuaHang MODIFY MaNhaCungCap BIGINT UNSIGNED NULL`);
  const [columns] = await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='ChiTietDonMuaHang' AND COLUMN_NAME='MaNhaCungCap'", [db]);
  if (!columns.length) await c.query(`ALTER TABLE ${q(db)}.ChiTietDonMuaHang ADD COLUMN MaNhaCungCap BIGINT UNSIGNED NULL`);
  await c.query(`UPDATE ${q(db)}.ChiTietDonMuaHang l JOIN ${q(db)}.DonMuaHang p ON p.MaBanGhi=l.MaDonMuaHang SET l.MaNhaCungCap=p.MaNhaCungCap WHERE l.MaNhaCungCap IS NULL`);
  const [keys] = await c.execute("SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME='ChiTietDonMuaHang' AND CONSTRAINT_NAME='FK_ChiTietDonMua_NCC008'", [db]);
  if (!keys.length) await c.query(`ALTER TABLE ${q(db)}.ChiTietDonMuaHang ADD CONSTRAINT FK_ChiTietDonMua_NCC008 FOREIGN KEY (MaNhaCungCap) REFERENCES ${q(db)}.NhaCungCap(MaBanGhi)`);
  for (const [service, entry] of Object.entries(result.databases)) {
    if (service !== 'business-service') await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.ChiTietDonMuaHang AS SELECT * FROM ${q(db)}.ChiTietDonMuaHang`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES (?,NOW(6))`, [marker]);
  }
}
module.exports = { migrate };
