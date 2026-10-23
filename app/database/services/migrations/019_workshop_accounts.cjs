const {identifier:q}=require('../../../src/config/service-databases');
const {hashPassword}=require('../../../src/services/domain/core');
async function migrate(c,source,result){
  const identity=q(result.databases['identity-service'].database),business=q(result.databases['business-service'].database);
  const [[done]]=await c.query(`SELECT COUNT(*) total FROM ${identity}.TrangThaiDichVu WHERE Ma='019_workshop_accounts'`);
  if(Number(done.total))return;
  await c.beginTransaction();
  try{
    if(process.env.NODE_ENV!=='production'){
      for(const [username,code,name] of [['workshop','XUONG-01','Chủ xưởng ahtor'],['workshop2','XUONG-02','Chủ xưởng edxn'],['workshop3','XUONG-03','Chủ xưởng trnvnth']]){
        const [[workshop]]=await c.execute(`SELECT MaBanGhi id FROM ${business}.Xuong WHERE Ma=?`,[code]);
        if(!workshop)throw Error('Thiếu xưởng '+code);
        const [[existing]]=await c.execute(`SELECT MaBanGhi id FROM ${identity}.NguoiDung WHERE TenDangNhap=?`,[username]);
        if(existing){
          // Existing accounts and administrator-assigned scopes are preserved.
          if(username==='workshop')await c.execute(`UPDATE ${identity}.NguoiDung SET HoTen=? WHERE MaBanGhi=? AND HoTen='Chủ xưởng'`,[name,existing.id]);
          continue;
        }
        const [u]=await c.execute(`INSERT INTO ${identity}.NguoiDung(TenDangNhap,MatKhauBam,HoTen,TrangThai,SoLanDangNhapSai,PhienBanPhien,PhienBan) VALUES (?,?,?,'ACTIVE',0,1,1)`,[username,hashPassword('123456'),name]);
        await c.execute(`INSERT INTO ${identity}.NguoiDungVaiTro(MaNguoiDung,MaVaiTro) SELECT ?,MaBanGhi FROM ${identity}.VaiTro WHERE Ma='WORKSHOP_OWNER'`,[u.insertId]);
        await c.execute(`INSERT INTO ${identity}.NguoiDungXuong(MaXuong,MaNguoiDung) VALUES (?,?)`,[workshop.id,u.insertId]);
      }
    }
    for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('019_workshop_accounts',NOW(6))`);
    await c.commit();
  }catch(e){await c.rollback();throw e;}
}
module.exports={migrate};
