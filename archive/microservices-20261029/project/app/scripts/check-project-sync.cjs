const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {collect,outputs,root}=require('./project-manifest.cjs');
const manifest=collect(),compose=fs.readFileSync(path.join(root,'docker-compose.yml'),'utf8');
assert.equal(manifest.services.length,6);
assert.ok(!manifest.routes.some(r=>r.pending),'Unexpected unimplemented API handler');
const frontend=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8'),layout=fs.readFileSync(path.join(root,'src/views/layouts/main.ejs'),'utf8');
for(const name of ['labels','modules','fieldNames'])assert.ok(frontend.includes('const '+name+' = warehouseNavigation.'+name+';'),'Frontend navigation must use canonical '+name);
assert.ok(layout.indexOf('/js/navigation-data.js')>=0&&layout.indexOf('/js/navigation-data.js')<layout.indexOf('/js/app.js'),'Load canonical navigation before app');
const tableOwners=require('../src/config/service-databases').owners();
for(const [alias,table] of Object.entries(require('../database/adminer/identifiers.json').tables))
  assert.ok(table==='LichSuCSDL'||tableOwners[table],'SQL alias has no owner: '+alias+' -> '+table);
for(const service of manifest.services) {
  for(const file of [service.entrypoint,service.dockerfile,'src/services/'+service.name+'/compose.js'])assert.ok(fs.existsSync(path.join(root,file)),file);
  assert.ok(compose.includes(service.dockerfile),'Compose Dockerfile: '+service.name);
  for(const object of service.objects)assert.notEqual(object.kind,'MISSING','Missing owner snapshot: '+object.name);
  const sql=fs.readFileSync(path.join(root,'database/services/schemas',service.name,'001_schema.sql'),'utf8');
  for(const match of sql.matchAll(/CREATE TABLE `([^`]+)`/g))
    if(!['LichSuCSDL','TrangThaiDichVu'].includes(match[1]))assert.equal(tableOwners[match[1]],service.name,'Foreign physical table in owner snapshot: '+match[1]);
  assert.ok(!/REFERENCES `KhoHang`\./.test(sql),'Foreign key points to archived source: '+service.name);
}
for(const marker of manifest.serviceMigrations.slice(1))
  for(const file of ['scripts/split-service-databases.cjs','scripts/split-acceptance.cjs','src/services/shared/runtime.js'])
    assert.ok(fs.readFileSync(path.join(root,file),'utf8').includes(marker),file+' missing '+marker);
const runtime=fs.readFileSync(path.join(root,'src/services/shared/runtime.js'),'utf8');
assert.ok(runtime.includes('ready.length !== '+manifest.serviceMigrations.length),'Runtime migration checkpoint count is stale');
assert.ok(!fs.existsSync(path.join(root,'src/modules')),'Old module directory must not remain active');
for(const [name,expected] of Object.entries(outputs(manifest)))assert.equal(fs.readFileSync(path.join(root,name),'utf8').replaceAll('\r\n','\n'),expected,'Stale generated docs: '+name+'; run npm run docs:sync');
const useCases=fs.readFileSync(path.join(root,'docs/USE_CASES.md'),'utf8'),matrix=fs.readFileSync(path.join(root,'docs/MODULE_MATRIX.md'),'utf8');
const codes=[...useCases.matchAll(/^## (UC-[\d.]+) /gm)].map(m=>m[1]);
assert.equal(codes.length,50);assert.equal(new Set(codes).size,50);
for(const code of codes)assert.ok(matrix.includes('| '+code+' |'),'Missing UC matrix: '+code);
const broken=[];
for(const entry of fs.readdirSync(path.join(root,'docs'),{withFileTypes:true})){
  if(!entry.isFile()||!entry.name.endsWith('.md'))continue;
  const file=path.join(root,'docs',entry.name),text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0];
    if(!target||/^(https?:|app:|\/)/.test(target)||/[<>]/.test(target))continue;
    if(!fs.existsSync(path.resolve(path.dirname(file),target)))broken.push(entry.name+': '+target);
  }
}
assert.deepEqual(broken,[]);
console.log('PROJECT SYNC PASS: service structure, Compose, migration wiring, owner snapshots, generated docs, 48 UC + two subflows and links.');
