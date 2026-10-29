const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['warehouse-service'].database;
  const [found]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='DotKiemKe' AND COLUMN_NAME='NguoiLapBienBanDuocChon'",[db]);
  if(!found.length)await c.query(`ALTER TABLE ${q(db)}.DotKiemKe ADD COLUMN NguoiLapBienBanDuocChon BIGINT UNSIGNED NULL`);
  // Preserve the actual author of an existing draft/submitted minute. Campaigns
  // without a minute remain unassigned until the director explicitly chooses.
  await c.query(`UPDATE ${q(db)}.DotKiemKe SET NguoiLapBienBanDuocChon=BienBanNguoiLap WHERE NguoiLapBienBanDuocChon IS NULL AND BienBanNguoiLap IS NOT NULL AND BienBanKetLuan IS NOT NULL`);
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.DotKiemKe AS SELECT * FROM ${q(db)}.DotKiemKe`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('015_inspection_minute_author',NOW(6))`);
  }
}
module.exports={migrate};
