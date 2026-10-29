const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['warehouse-service'].database;
  for(const [table,columns] of Object.entries({DotKiemKe:{KiemSoLuong:'BOOLEAN NOT NULL DEFAULT FALSE',KiemChatLuong:'BOOLEAN NOT NULL DEFAULT TRUE'},LoLichKiemTra:{SoLuongDem:'DECIMAL(18,3) NULL',NguoiDem:'BIGINT UNSIGNED NULL',ThoiDiemDem:'DATETIME(6) NULL'}})){
    for(const [column,type]of Object.entries(columns)){
      const [found]=await c.execute('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',[db,table,column]);
      if(!found.length)await c.query(`ALTER TABLE ${q(db)}.${q(table)} ADD COLUMN ${q(column)} ${type}`);
    }
    for(const [service,entry]of Object.entries(result.databases))if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.${q(table)} AS SELECT * FROM ${q(db)}.${q(table)}`);
  }
  for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('011_inspection_assignment_scope',NOW(6))`);
}
module.exports={migrate};
