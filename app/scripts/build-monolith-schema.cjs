const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),tables=new Map(),views=new Map(),triggers=new Map();
function local(sql){return sql.replace(/`KhoHang_(?:Identity|Business|Warehouse|Notification|Reporting|Gateway)`\./g,'').replace(/ AUTO_INCREMENT=\d+/g,'')}
for(const name of ['identity-service','business-service','warehouse-service','notification-service','reporting-service','web-gateway']){
 const sql=fs.readFileSync(path.join(root,'../archive/microservices-20261029/project/app/database/services/schemas',name,'001_schema.sql'),'utf8');
 for(const m of sql.matchAll(/CREATE TABLE `([^`]+)`[\s\S]*?;(?=\r?\n|$)/g))if(!/^(LuuTru|TrangThaiDichVu|LichSuCSDL)/.test(m[1])){if(tables.has(m[1]))throw Error('Duplicate physical table '+m[1]);tables.set(m[1],local(m[0]))}
 for(const m of sql.matchAll(/CREATE ALGORITHM=[^\n]+/g)){const statement=local(m[0]),name=statement.match(/VIEW `([^`]+)`/)[1];views.set(name,statement.trim())}
 for(const m of sql.matchAll(/CREATE TRIGGER `([^`]+)`[\s\S]*?END\$\$/g))triggers.set(m[1],local(m[0]).replace(/\$\$$/,';'));
}
const directory=path.join(root,'database/monolith');fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,'001_schema.sql'),'-- Single database; Vietnamese SQL identifiers.\n-- statement-end\nSET FOREIGN_KEY_CHECKS=0;\n-- statement-end\n'+[...tables.values(),...views.values(),...triggers.values()].join('\n-- statement-end\n')+'\n-- statement-end\nSET FOREIGN_KEY_CHECKS=1;\n');
console.log(`Single schema: ${tables.size} tables, ${views.size} compatibility views, ${triggers.size} triggers.`);
