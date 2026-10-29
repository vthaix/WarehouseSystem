const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=result.databases['business-service'].database;
  const [cols]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='BanBaoCaoSanXuat' AND COLUMN_NAME='KieuThanhPham'",[db]);
  if(!cols.length)await c.query(`ALTER TABLE ${q(db)}.BanBaoCaoSanXuat ADD COLUMN KieuThanhPham VARCHAR(20) NOT NULL DEFAULT 'FINAL'`);
  const [[ddl]]=await c.query(`SHOW CREATE VIEW ${q(db)}.BaoCaoThanhPham`);
  let view=ddl['Create View'].replace(/DEFINER=`[^`]+`@`[^`]+`/,'').replace(/^CREATE /,'CREATE OR REPLACE ');
  if(!view.includes('KieuThanhPham'))view=view.replace(/ from /i,`,${q(db)}.BanBaoCaoSanXuat.KieuThanhPham AS KieuThanhPham from `);
  await c.query(view);
  for(const [service,entry]of Object.entries(result.databases)){
    if(service!=='business-service'){
      await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.BanBaoCaoSanXuat AS SELECT * FROM ${q(db)}.BanBaoCaoSanXuat`);
      await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.BaoCaoThanhPham AS SELECT * FROM ${q(db)}.BaoCaoThanhPham`);
    }
    await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('010_finished_report_parts',NOW(6))`);
  }
}
module.exports={migrate};
