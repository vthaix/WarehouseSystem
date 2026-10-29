const { identifier: q } = require('../../../src/config/service-databases');
async function migrate(c, source, result) {
  const warehouse = result.databases['warehouse-service'].database;
  let complete = 0;
  for (const entry of Object.values(result.databases)) {
    const [rows] = await c.query(`SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma='005_quarantine_disposition'`);
    complete += rows.length;
  }
  if (complete === Object.keys(result.databases).length) return;
  const table = `${q(warehouse)}.BanDeXuatXuLyNgoaiLe`;
  const [checks] = await c.execute("SELECT t.CONSTRAINT_NAME name,c.CHECK_CLAUSE clause FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA=t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME=t.CONSTRAINT_NAME WHERE t.CONSTRAINT_SCHEMA=? AND t.TABLE_NAME='BanDeXuatXuLyNgoaiLe' AND t.CONSTRAINT_TYPE='CHECK'", [warehouse]);
  for (const check of checks) {
    if (check.clause.includes('Kieu') && !check.clause.includes('QUARANTINE_DISPOSITION'))
      await c.query(`ALTER TABLE ${table} DROP CHECK ${q(check.name)}`);
  }
  if (!checks.some(x => x.name === 'CK_NgoaiLe_Loai005'))
    await c.query(`ALTER TABLE ${table} ADD CONSTRAINT CK_NgoaiLe_Loai005 CHECK (Kieu IN ('QC_FAILURE','STOCKTAKE_DIFFERENCE','QUARANTINE_DISPOSITION'))`);
  if (!checks.some(x => x.name === 'CK_NgoaiLe_Nguon005'))
    await c.query(`ALTER TABLE ${table} ADD CONSTRAINT CK_NgoaiLe_Nguon005 CHECK ((Kieu IN ('QC_FAILURE','QUARANTINE_DISPOSITION') AND MaChiTietKiemTraChatLuong IS NOT NULL AND MaChiTietKiemKe IS NULL) OR (Kieu='STOCKTAKE_DIFFERENCE' AND MaChiTietKiemTraChatLuong IS NULL AND MaChiTietKiemKe IS NOT NULL))`);
  for (const entry of Object.values(result.databases))
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('005_quarantine_disposition',NOW(6))`);
}
module.exports = { migrate };
