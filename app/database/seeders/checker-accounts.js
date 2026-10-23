const accounts = require('../../src/config/demo-checkers');
const { hashPassword } = require('../../src/services/domain/core');
const { identifier } = require('../../src/config/service-databases');
async function seedCheckers(connection,database,password) {
  if(process.env.NODE_ENV==='production') throw Error('Demo accounts are disabled in production.');
  if(!password || password.length<6) throw Error('Demo password is required.');
  const schema=identifier(database);
  await connection.beginTransaction();
  try {
    for(const [username,name,role] of accounts){
      await connection.execute(`INSERT INTO ${schema}.NguoiDung (TenDangNhap,MatKhauBam,HoTen,TrangThai,SoLanDangNhapSai,PhienBanPhien,PhienBan) VALUES (?,?,?,'ACTIVE',0,1,1) ON DUPLICATE KEY UPDATE MaBanGhi=MaBanGhi`,[username,hashPassword(password),name]);
      await connection.execute(`INSERT INTO ${schema}.NguoiDungVaiTro (MaNguoiDung,MaVaiTro) SELECT u.MaBanGhi,r.MaBanGhi FROM ${schema}.NguoiDung u JOIN ${schema}.VaiTro r ON r.Ma=? WHERE u.TenDangNhap=? ON DUPLICATE KEY UPDATE MaBanGhi=NguoiDungVaiTro.MaBanGhi`,[role,username]);
      await connection.execute(`INSERT IGNORE INTO ${schema}.NhanVien (MaNguoiDung,MaNhanVien) SELECT MaBanGhi,CONCAT('NV-',MaBanGhi) FROM ${schema}.NguoiDung WHERE TenDangNhap=?`,[username]);
    }
    await connection.commit();
  }catch(error){await connection.rollback();throw error;}
}
module.exports={seedCheckers};
