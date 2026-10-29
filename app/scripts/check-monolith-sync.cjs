const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {collect,outputs,root}=require('./project-manifest.cjs');
const manifest=collect(),compose=fs.readFileSync(path.join(root,'docker-compose.yml'),'utf8');
assert.equal(manifest.architecture,'modular-monolith');assert.equal(manifest.services.length,1);
assert.equal(manifest.services[0].database,'warehouse_db');assert.ok(!manifest.routes.some(r=>r.pending));
assert.ok(compose.includes('DB_NAME: warehouse_db'));assert.ok(compose.includes('DB_USER: warehouse'));assert.ok(!/SERVICE_URL|split-databases|SERVICE_DB_LAYOUT/.test(compose));
for(const f of ['src/server.js','src/app.js','src/modules/index.js','Dockerfile','database/monolith/001_schema.sql','database/monolith/002_item_inheritance.sql','database/monolith/003_purchase_approval.sql'])assert.ok(fs.existsSync(path.join(root,f)),f);
for(const [name,expected]of Object.entries(outputs(manifest)))assert.equal(fs.readFileSync(path.join(root,name),'utf8').replaceAll('\r\n','\n'),expected,'Generated file stale: '+name);
const schema=fs.readFileSync(path.join(root,'database/monolith/001_schema.sql'),'utf8');assert.ok(!/KhoHang_(Identity|Business|Warehouse|Reporting|Notification|Gateway)/.test(schema));
function inspect(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){inspect(file);continue}if(!/\.(js|cjs)$/.test(e.name))continue;const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){const target=path.resolve(path.dirname(file),m[1]);assert.ok(['','.js','.cjs','.json','/index.js'].some(ext=>fs.existsSync(target+ext)),file+' -> '+m[1])}}}
inspect(path.join(root,'src'));inspect(path.join(root,'tests'));
console.log('MONOLITH SYNC PASS: one process/database, local module imports, migrations, Compose and generated documentation.');
