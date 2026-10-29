const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['warehouse-service'].database;
  for(const [name,type]of Object.entries({NgoaiLeMoTa:'TEXT NULL',NgoaiLeTrangThai:"VARCHAR(24) NOT NULL DEFAULT 'NONE'",NgoaiLeCachXuLy:'TEXT NULL',NgoaiLeMaXuong:'BIGINT UNSIGNED NULL',NgoaiLeNguoiXuLy:'BIGINT UNSIGNED NULL',NgoaiLeYKienPheDuyet:'TEXT NULL',NgoaiLeNguoiDuyet:'BIGINT UNSIGNED NULL'})){
    const [found]=await c.execute('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',[db,'DotKiemKe',name]);
    if(!found.length)await c.query(`ALTER TABLE ${q(db)}.DotKiemKe ADD COLUMN ${q(name)} ${type}`);
  }
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.DotKiemKe AS SELECT * FROM ${q(db)}.DotKiemKe`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('013_minute_exceptions',NOW(6))`);
  }
}
module.exports={migrate};
