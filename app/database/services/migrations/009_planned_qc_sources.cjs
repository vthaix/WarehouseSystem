const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const marker='009_planned_qc_sources';
  const db=result.databases['warehouse-service'].database;
  for(const column of ['MaKeHoachMuaQC','MaKeHoachSanXuatQC']){
    const [rows]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='DotKiemKe' AND COLUMN_NAME=?",[db,column]);
    if(!rows.length)await c.query(`ALTER TABLE ${q(db)}.DotKiemKe ADD COLUMN ${q(column)} BIGINT UNSIGNED NULL`);
  }
  const business=result.databases['business-service'].database;
  for(const [column,parent] of [['MaKeHoachMuaQC','KeHoachMuaBan'],['MaKeHoachSanXuatQC','KeHoachSanXuat']]){
    const name='FK_QC009_'+column;
    const [keys]=await c.execute('SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME=\'DotKiemKe\' AND CONSTRAINT_NAME=?',[db,name]);
    if(!keys.length)await c.query(`ALTER TABLE ${q(db)}.DotKiemKe ADD CONSTRAINT ${q(name)} FOREIGN KEY (${q(column)}) REFERENCES ${q(business)}.${q(parent)}(MaBanGhi)`);
  }
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='warehouse-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.DotKiemKe AS SELECT * FROM ${q(db)}.DotKiemKe`);
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES (?,NOW(6))`,[marker]);
  }
}
module.exports={migrate};
