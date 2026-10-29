const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
 let complete=0;for(const entry of Object.values(result.databases)){const [rows]=await c.query(`SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma='007_category_images'`);complete+=rows.length;}
 if(complete===Object.keys(result.databases).length)return;
 const business=result.databases['business-service'].database;
 const [columns]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='LoaiHang' AND COLUMN_NAME='DuongDanAnh'",[business]);
 if(!columns.length)await c.query(`ALTER TABLE ${q(business)}.LoaiHang ADD COLUMN DuongDanAnh VARCHAR(255) NULL`);
 for(const [service,entry] of Object.entries(result.databases)){
   if(service!=='business-service')await c.query(`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.LoaiHang AS SELECT * FROM ${q(business)}.LoaiHang`);
   await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('007_category_images',NOW(6))`);
 }
}
module.exports={migrate};
