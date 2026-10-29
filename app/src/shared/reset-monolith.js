const fs=require('node:fs'),path=require('node:path'),mysql=require('mysql2/promise');
const q=v=>{if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(v))throw Error('Invalid identifier');return '`'+v+'`'};
const retained=new Set(['NguoiDung','VaiTro','NguoiDungVaiTro','NguoiDungXuong','BoPhan','NhanVien','KhachHang','Xuong','NhaCungCap','LoaiHang','DonViTinh','MatHang','NguyenVatLieu','ThanhPham','Kho','ViTriKho','LichSuCSDL']);
async function reset({key,actor}){
 if(!require('../config/reset-tools').enabled())throw Error('Test reset disabled');
 const c=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,dateStrings:true,supportBigNumbers:true,bigNumberStrings:true});
 let locked=false;const dir=process.env.BACKUP_DIRECTORY||'/var/backups/warehouse';
 const receipt=path.join(dir,'reset-'+key+'.json');
 try{
  const [[lock]]=await c.execute("SELECT GET_LOCK('warehouse:test-reset',0) n");if(Number(lock.n)!==1)throw Error('Reset already running');locked=true;
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  if(fs.existsSync(receipt)){const previous=JSON.parse(fs.readFileSync(receipt));if(previous.actor!==String(actor.id))throw Error('Reset key belongs to another account');return previous.result}
  const [tables]=await c.execute("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const backup=path.join(dir,'reset-'+key+'.sql'),fd=fs.openSync(backup,'wx',0o600);
  try{
   fs.writeSync(fd,'-- Backup before development reset\nSET FOREIGN_KEY_CHECKS=0;\n');
   await c.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
   for(const {name}of tables){
    const [[ddl]]=await c.query('SHOW CREATE TABLE '+q(name));fs.writeSync(fd,ddl['Create Table']+';\n');
    const [columns]=await c.execute('SELECT COLUMN_NAME name,EXTRA extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION',[name]);
    const writable=columns.filter(x=>!/GENERATED/.test(x.extra));
    const [rows]=await c.query('SELECT '+writable.map(x=>q(x.name)).join(',')+' FROM '+q(name));
    for(const row of rows)fs.writeSync(fd,'INSERT INTO '+q(name)+' ('+writable.map(x=>q(x.name)).join(',')+') VALUES ('+writable.map(x=>c.escape(row[x.name]&&typeof row[x.name]==='object'&&!Buffer.isBuffer(row[x.name])?JSON.stringify(row[x.name]):row[x.name])).join(',')+');\n');
   }
   await c.commit();fs.writeSync(fd,'SET FOREIGN_KEY_CHECKS=1;\n');fs.fsyncSync(fd);
  }finally{fs.closeSync(fd)}
  await c.query('SET FOREIGN_KEY_CHECKS=0');await c.beginTransaction();
  const targets=tables.filter(t=>!retained.has(t.name));
  try{for(const {name}of targets)await c.query('DELETE FROM '+q(name));await c.commit()}catch(e){await c.rollback();throw e}finally{await c.query('SET FOREIGN_KEY_CHECKS=1')}
  const checkpoints=path.join(dir,'demo-workflows');
  if(fs.existsSync(checkpoints)){const saved=path.join(dir,'cleared-fixtures-'+key);fs.mkdirSync(saved,{recursive:true});for(const file of fs.readdirSync(checkpoints).filter(f=>/^[a-f0-9]{16}\.json$/.test(f)))fs.renameSync(path.join(checkpoints,file),path.join(saved,file));}
  const result={backup,cleared_tables:targets.length,message:'Đã xóa dữ liệu nghiệp vụ. Tài khoản và danh mục được giữ nguyên. Vui lòng đăng nhập lại.'};
  fs.writeFileSync(receipt,JSON.stringify({actor:String(actor.id),result}),{mode:0o600});return result;
 }finally{if(locked)await c.query("SELECT RELEASE_LOCK('warehouse:test-reset')");await c.end()}
}
module.exports={reset,retained};
