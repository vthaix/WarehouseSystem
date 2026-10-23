const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['warehouse-service'].database;
  const [found]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='PhieuYeuCauNhapXuat' AND COLUMN_NAME='ThoiDiemThucHien'",[db]);
  if(!found.length)await c.query(`ALTER TABLE ${q(db)}.PhieuYeuCauNhapXuat ADD COLUMN ThoiDiemThucHien DATETIME(6) NULL`);
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.PhieuYeuCauNhapXuat AS SELECT * FROM ${q(db)}.PhieuYeuCauNhapXuat`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('014_stock_request_execution_time',NOW(6))`);
  }
}
module.exports={migrate};
