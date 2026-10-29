const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dir=path.resolve(__dirname,'../database/monolith');
let sql='-- WarehouseSystem monolith: import into an EMPTY warehouse_db. No demo passwords/data.\nCREATE DATABASE IF NOT EXISTS warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE warehouse_db;\nCREATE TABLE LichSuCSDL (Ten VARCHAR(150) PRIMARY KEY, MaBam CHAR(64) NOT NULL, NgayApDung DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB;\n';
for(const name of fs.readdirSync(dir).filter(n=>/^\d+_.*\.sql$/.test(n)).sort()){
 const content=fs.readFileSync(path.join(dir,name),'utf8'),checksum=crypto.createHash('sha256').update(content.replaceAll('\r\n','\n')).digest('hex');
 for(const s of content.split(/-- statement-end\s*/).map(s=>s.trim()).filter(s=>s&&!/^--[^\n]*$/.test(s))){const statement=s.replace(/;\s*$/,'');sql+=/CREATE TRIGGER/i.test(statement)?'DELIMITER $$\n'+statement+'$$\nDELIMITER ;\n':statement+';\n'}
 sql+=`INSERT INTO LichSuCSDL(Ten,MaBam) VALUES ('${name}','${checksum}');\n`;
}
fs.writeFileSync(path.resolve(dir,'../schema.sql'),sql);console.log('Exported database/schema.sql with migration ledger.');
