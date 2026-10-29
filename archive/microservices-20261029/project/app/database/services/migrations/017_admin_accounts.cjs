const {identifier:q}=require('../../../src/config/service-databases'),C=require('../../../src/services/domain/core');
async function migrate(c,source,result){
  const db=result.databases['identity-service'].database;
  const [found]=await c.execute("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='NguoiDung' AND COLUMN_NAME='DaXoa'",[db]);
  if(!found.length)await c.query(`ALTER TABLE ${q(db)}.NguoiDung ADD COLUMN DaXoa TINYINT(1) NOT NULL DEFAULT 0`);
  await c.execute(`INSERT INTO ${q(db)}.VaiTro (Ma,Ten) VALUES ('ADMIN','Quản trị hệ thống') ON DUPLICATE KEY UPDATE Ten=VALUES(Ten)`);
  // Insert this requested demo account once; never reset an existing password
  // or re-grant roles that an administrator has deliberately removed.
  if(process.env.NODE_ENV!=='production'){
    const [existing]=await c.execute(`SELECT MaBanGhi FROM ${q(db)}.NguoiDung WHERE TenDangNhap='admin'`);
    if(!existing.length){
      const [u]=await c.execute(`INSERT INTO ${q(db)}.NguoiDung(TenDangNhap,MatKhauBam,HoTen,TrangThai,SoLanDangNhapSai,PhienBanPhien,PhienBan) VALUES ('admin',?,'Quản trị hệ thống','ACTIVE',0,1,1)`,[C.hashPassword('123456')]);
      await c.execute(`INSERT INTO ${q(db)}.NguoiDungVaiTro(MaNguoiDung,MaVaiTro) SELECT ?,MaBanGhi FROM ${q(db)}.VaiTro WHERE Ma='ADMIN'`,[u.insertId]);
    }
  }
  // No new account-data views or read grants. Only Identity needs DaXoa.
  for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('017_admin_accounts',NOW(6))`);
}
module.exports={migrate};
