const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function migrate(pool){
 const c=await pool.getConnection();let locked=false;
 try{
  const [[lock]]=await c.query("SELECT GET_LOCK('warehouse:mono-migrations',30) acquired");
  if(Number(lock.acquired)!==1)throw Error('Migration lock unavailable');locked=true;
  await c.query('CREATE TABLE IF NOT EXISTS LichSuCSDL (Ten VARCHAR(150) PRIMARY KEY, MaBam CHAR(64) NOT NULL, NgayApDung DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB');
  const dir=path.resolve(__dirname,'../../database/monolith');
  for(const name of fs.readdirSync(dir).filter(n=>/^\d+_.*\.sql$/.test(n)).sort()){
   const sql=fs.readFileSync(path.join(dir,name),'utf8'),checksum=crypto.createHash('sha256').update(sql.replaceAll('\r\n','\n')).digest('hex');
   const [done]=await c.execute('SELECT MaBam FROM LichSuCSDL WHERE Ten=?',[name]);
   if(done.length){if((done[0].checksum||done[0].MaBam)!==checksum)throw Error('Applied migration changed: '+name);continue}
   for(const statement of sql.split(/-- statement-end\s*/).map(s=>s.trim()).filter(s=>s&&!/^--[^\n]*$/.test(s)))await c.query(statement.replace(/;\s*$/,''));
   await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',[name,checksum]);
   console.log(JSON.stringify({event:'mono_migration_applied',name}));
  }
 }finally{await c.query('SET FOREIGN_KEY_CHECKS=1');if(locked)await c.query("SELECT RELEASE_LOCK('warehouse:mono-migrations')");c.release()}
}
module.exports={migrate};
