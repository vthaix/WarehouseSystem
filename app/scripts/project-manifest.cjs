const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ownership=require('../database/services/ownership.json');
const contracts=require('../src/services/shared/contracts');
const policy=require('../src/services/domain/policy');
function collect() {
  const serviceMigrations=fs.readdirSync(path.join(root,'database/services/migrations')).filter(n=>/^\d{3}_.+\.cjs$/.test(n)).sort().map(n=>n.replace(/\.cjs$/,''));
  const runtime={catalog:{supports:r=>contracts.catalogResources.includes(r)}};
  const router=require('../src/shared/ModuleRoutes')(runtime);
  const routes=router.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path,owner:contracts.apiOwner(l.route.path),pending:l.route.stack.some(s=>s.handle.name==='pending')})));
  const authRouter=require('../src/routes/auth.routes')({});
  routes.unshift(...authRouter.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:'/auth'+l.route.path,owner:'web-gateway / identity-service',pending:false}))));
  const imageRouter=require('../src/shared/CategoryImageRoutes')();
  routes.push(...imageRouter.stack.filter(l=>l.route&&l.route.path.startsWith('/api/v1')).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path.slice('/api/v1'.length),owner:'web-gateway',pending:false}))));
  const services=Object.entries(ownership).map(([name,entry])=>{
    const sql=fs.readFileSync(path.join(root,'database/services/schemas',name,'001_schema.sql'),'utf8');
    const objects=entry.objects.map(object=>{
      const escaped=object.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const block=sql.match(new RegExp('CREATE TABLE `'+escaped+'` \\(([\\s\\S]*?)\\n\\) ENGINE'));
      const view=new RegExp('VIEW (?:`[^`]+`\\.)?`'+escaped+'` AS').test(sql);
      return {name:object,kind:block?'TABLE':view?'VIEW':'MISSING',columns:block?[...block[1].matchAll(/^\s*`([^`]+)`\s+([^\n]+)/gm)].map(m=>({name:m[1],definition:m[2].trim().replace(/,$/,'')})):[]};
    });
    return {name,database:'KhoHang_'+entry.suffix,user:require('../src/config/service-credentials').credentialsFor(name,{}).user,entrypoint:'src/services/'+name+'/index.js',dockerfile:'src/services/'+name+'/Dockerfile',objects};
  });
  return {format:1,architecture:'five-backends-and-web-gateway',databaseIsolation:'shared-mysql-with-cross-schema-dependencies',serviceMigrations,services,routes,roles:{read:policy.read,create:policy.create,editable:policy.editable},screens:require('../src/config/navigation').modules};
}
function outputs(manifest) {
  let api='# Danh mục API sinh từ router\n\nSinh bằng `node scripts/sync-project-docs.cjs`. Tiền tố `/api/v1`; quyền/scope vẫn kiểm trong middleware/service. Bao gồm auth router tại gateway và ModuleRoutes của các backend. Owner của lookup/source-imports phụ thuộc resource/target, không lấy owner mặc định trong bảng làm quyền truy cập.\n\n| Method | Route | Owner mặc định | Trạng thái |\n| --- | --- | --- | --- |\n';
  for(const r of manifest.routes)api+=`| ${r.method} | \`${r.path}\` | ${r.owner} | ${r.pending?'Chưa triển khai':'Có handler'} |\n`;
  let data='# Đối tượng SQL theo owner\n\nSinh từ ownership.json và snapshot DDL. TABLE là bảng vật lý; VIEW là đối tượng suy ra/tương thích. Bảng LuuTru giữ lịch sử, không phải entity hoạt động. Các view cùng tên tại owner khác không phải bản sao dữ liệu.\n';
  for(const service of manifest.services){
    data+=`\n## ${service.name} — ${service.database}\n\nTài khoản runtime: \`${service.user}\`.\n\n| Đối tượng | Loại | Cột vật lý |\n| --- | --- | --- |\n`;
    for(const o of service.objects)data+=`| ${o.name} | ${o.kind} | ${o.columns.map(c=>'`'+c.name+'`').join(', ')} |\n`;
  }
  const nav=require('../src/config/navigation');
  let fields='# Whitelist dữ liệu từ code\n\nDanh sách trích từ C.fields trong service/helper. Đây là các field được chấp nhận, không nói tất cả bắt buộc hoặc cùng cấp: đọc đường dẫn/method và validation tương ứng để phân biệt body, query và dòng con.\n\n| File | Method gần nhất | Đối tượng | Fields |\n| --- | --- | --- | --- |\n';
  function inspect(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);if(entry.isDirectory()){inspect(file);continue;}if(!entry.name.endsWith('.js'))continue;
    const source=fs.readFileSync(file,'utf8');
    for(const match of source.matchAll(/C\.fields\(\s*([\w.]+)\s*,\s*\[([^\]]*)\]/g)){
      const methods=[...source.slice(0,match.index).matchAll(/(?:async\s+(?:function\s+)?)(\w+)\s*\(/g)];
      const keys=[...match[2].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
      fields+=`| ${path.relative(root,file).replaceAll('\\','/')} | ${methods.at(-1)?.[1]||'helper'} | ${match[1]} | ${keys.join(', ')} |\n`;
    }
  }}inspect(path.join(root,'src/services'));inspect(path.join(root,'src/shared'));
  return {'docs/generated/PROJECT_MANIFEST.json':JSON.stringify(manifest,null,2)+'\n','docs/generated/API_ROUTES.md':api,'docs/generated/DATABASE_OBJECTS.md':data,
    'docs/generated/API_CONTRACT_FIELDS.md':fields,
    'public/js/navigation-data.js':'// Generated from src/config/navigation.js by npm run docs:sync.\nconst warehouseNavigation = '+JSON.stringify({labels:nav.labels,modules:nav.modules,fieldNames:nav.fieldNames},null,2)+';\n'};
}
module.exports={collect,outputs,root};
