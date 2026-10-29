const { identifier:q }=require('../../../src/config/service-databases');
async function migrate(c,source,result) {
  let complete=0;
  for(const entry of Object.values(result.databases)) {
    const [rows]=await c.query(`SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma='006_stock_qc_correction'`);
    complete+=rows.length;
  }
  if(complete===Object.keys(result.databases).length)return;
  const database=result.databases['warehouse-service'].database;
  const [checks]=await c.execute("SELECT t.CONSTRAINT_NAME name,c.CHECK_CLAUSE clause FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA=t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME=t.CONSTRAINT_NAME WHERE t.CONSTRAINT_SCHEMA=? AND t.TABLE_NAME='BanDeXuatXuLyNgoaiLe' AND t.CONSTRAINT_TYPE='CHECK'",[database]);
  for(const check of checks)
    if(check.clause.includes('HanhDong')&&!check.clause.includes("'QUARANTINE'"))
      await c.query(`ALTER TABLE ${q(database)}.BanDeXuatXuLyNgoaiLe DROP CHECK ${q(check.name)}`);
  if(!checks.some(x=>x.name==='CK_NgoaiLe_HanhDong006'))
    await c.query(`ALTER TABLE ${q(database)}.BanDeXuatXuLyNgoaiLe ADD CONSTRAINT CK_NgoaiLe_HanhDong006 CHECK (HanhDong IN ('ADJUST_TO_ACTUAL','SCRAP','RETURN_SUPPLIER','RELEASE','QUARANTINE'))`);
  for(const entry of Object.values(result.databases))
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('006_stock_qc_correction',NOW(6))`);
}
module.exports={migrate};
