const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['warehouse-service'].database;
  for(const [column,type]of Object.entries({BienBanKetLuan:'TEXT NULL',BienBanTrangThai:"VARCHAR(20) NOT NULL DEFAULT 'DRAFT'",BienBanNguoiLap:'BIGINT UNSIGNED NULL',BienBanNgayGui:'DATETIME(6) NULL',BienBanDuLieu:'JSON NULL'})){
    const [found]=await c.execute('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',[db,'DotKiemKe',column]);
    if(!found.length)await c.query(`ALTER TABLE ${q(db)}.DotKiemKe ADD COLUMN ${q(column)} ${type}`);
  }
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.DotKiemKe AS SELECT * FROM ${q(db)}.DotKiemKe`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('012_inspection_minutes',NOW(6))`);
  }
}
module.exports={migrate};
