const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const contracts={catalogResources:['categories','warehouses','warehouse-locations','suppliers','units','items','lots'],apiOwner:()=> 'warehouse-app'};
const policy=require('../src/services/domain/policy');
function collect() {
  const serviceMigrations=fs.readdirSync(path.join(root,'database/monolith')).filter(n=>/^\d{3}_.+\.sql$/.test(n)).sort();
  const runtime={catalog:{supports:r=>contracts.catalogResources.includes(r)}};
  const router=require('../src/shared/ModuleRoutes')(runtime);
  const routes=router.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path,owner:contracts.apiOwner(l.route.path),pending:l.route.stack.some(s=>s.handle.name==='pending')})));
  const authRouter=require('../src/routes/auth.routes')({});
  routes.unshift(...authRouter.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:'/auth'+l.route.path,owner:'warehouse-app',pending:false}))));
  const imageRouter=require('../src/shared/CategoryImageRoutes')();
  const productionImages=require('../src/shared/ProductionReportImageRoutes')({});
  const testReset=require('../src/shared/TestResetRoutes')().router;
  routes.push(...testReset.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path.slice('/api/v1'.length),owner:'warehouse-app',pending:false}))));
  routes.push(...productionImages.stack.filter(l=>l.route).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path.slice('/api/v1'.length),owner:'warehouse-app',pending:false}))));
  routes.push(...imageRouter.stack.filter(l=>l.route&&l.route.path.startsWith('/api/v1')).flatMap(l=>Object.keys(l.route.methods).map(method=>({method:method.toUpperCase(),path:l.route.path.slice('/api/v1'.length),owner:'warehouse-app',pending:false}))));
  const sql=serviceMigrations.map(n=>fs.readFileSync(path.join(root,'database/monolith',n),'utf8')).join('\n');
  const names=[...new Set([...sql.matchAll(/(?:CREATE TABLE|VIEW)\s+`?([A-Za-z][A-Za-z0-9_]*)/g)].map(m=>m[1]))];
  const objects=names.map(object=>{
      const escaped=object.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const block=sql.match(new RegExp('CREATE TABLE `?'+escaped+'`?\\s*\\(([\\s\\S]*?)\\n\\) ENGINE'));
      const view=new RegExp('VIEW (?:`[^`]+`\\.)?`'+escaped+'` AS').test(sql);
      return {name:object,kind:block?'TABLE':view?'VIEW':'MISSING',columns:block?[...block[1].matchAll(/^\s*`?([A-Za-z][A-Za-z0-9_]*)`?\s+([^\n]+)/gm)].filter(m=>!['PRIMARY','UNIQUE','KEY','CONSTRAINT','FOREIGN','CHECK'].includes(m[1])).map(m=>({name:m[1],definition:m[2].trim().replace(/,$/,'')})):[]};
    });
  for(const o of objects)if(o.kind==='MISSING'&&new RegExp('CREATE TABLE '+o.name+'\\s*\\(').test(sql))o.kind='TABLE';
  for(const m of sql.matchAll(/ALTER TABLE (\w+) DROP COLUMN (\w+)/g)){const obj=objects.find(o=>o.name===m[1]);if(obj)obj.columns=obj.columns.filter(c=>c.name!==m[2]);}
  for(const m of sql.matchAll(/ALTER TABLE (\w+) ([^;]+);/g)){const obj=objects.find(o=>o.name===m[1]);if(!obj)continue;for(const c of m[2].matchAll(/ADD COLUMN (\w+) ([^,;]+)/g))if(!obj.columns.some(v=>v.name===c[1]))obj.columns.push({name:c[1],definition:c[2]});}
  const services=[{name:'warehouse-app',database:'warehouse_db',user:'warehouse',entrypoint:'src/server.js',dockerfile:'Dockerfile',objects}];
  return {format:2,architecture:'modular-monolith',databaseIsolation:'single-mysql-database',serviceMigrations,services,routes,roles:{read:policy.read,create:policy.create,editable:policy.editable},screens:require('../src/config/navigation').modules};
}
function outputs(manifest) {
  let api='# Danh mục API sinh từ router\n\nSinh bằng `node scripts/sync-project-docs.cjs`. Tiền tố `/api/v1`; router xác thực, nghiệp vụ và ảnh chạy trong cùng ứng dụng Express. Quyền vẫn được kiểm trong middleware và mô-đun nghiệp vụ; cột ứng dụng xử lý không thay thế phân quyền.\n\n| Method | Route | Ứng dụng xử lý | Trạng thái |\n| --- | --- | --- | --- |\n';
  for(const r of manifest.routes)api+=`| ${r.method} | \`${r.path}\` | ${r.owner} | ${r.pending?'Chưa triển khai':'Có handler'} |\n`;
  let data='# Đối tượng SQL trong warehouse_db\n\nSinh từ migration mono. TABLE là bảng vật lý; VIEW là cách đọc dữ liệu gốc, không tạo thêm bộ dữ liệu riêng. Toàn bộ đối tượng thuộc một database.\n';
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
  }}inspect(path.join(root,'src/modules'));inspect(path.join(root,'src/services'));inspect(path.join(root,'src/shared'));
  return {'docs/generated/PROJECT_MANIFEST.json':JSON.stringify(manifest,null,2)+'\n','docs/generated/API_ROUTES.md':api,'docs/generated/DATABASE_OBJECTS.md':data,
    'docs/generated/API_CONTRACT_FIELDS.md':fields,
    'public/js/navigation-data.js':'// Generated from src/config/navigation.js by npm run docs:sync.\nconst warehouseNavigation = '+JSON.stringify({labels:nav.labels,modules:nav.modules,fieldNames:nav.fieldNames,roleLabels:nav.roleLabels},null,2)+';\n'};
}
module.exports={collect,outputs,root};
