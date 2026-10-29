// One-time relocation requested by the user. Recover old files from the verified
// backups/mono-refactor-20261029/before-refactor.zip and manifest.json if needed.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
if(!fs.existsSync(path.resolve(root,'../backups/mono-refactor-20261029/manifest.json')))throw Error('Verified backup required');
const mappings=[];
for(const service of ['identity','business','warehouse','notification','reporting']){
 const base=`src/services/${service}-service/modules`;
 for(const entry of fs.readdirSync(path.join(root,base),{withFileTypes:true}))if(entry.isDirectory())mappings.push([`${base}/${entry.name}`,`src/modules/${entry.name}`]);
}
mappings.push(['src/services/shared/catalog','src/modules/catalog'],['src/services/shared/registry.js','src/modules/index.js'],['src/services/shared/database-bootstrap.js','src/shared/database-bootstrap.js'],['src/services/business-service/compose.js','src/modules/compose-business.js']);
for(const [from,to]of mappings){const a=path.join(root,from),b=path.join(root,to);if(!a.startsWith(root+path.sep)||!b.startsWith(root+path.sep)||!fs.existsSync(a)||fs.existsSync(b))throw Error('Unsafe relocation '+from)}
if(!process.argv.includes('--execute')){console.log(JSON.stringify(mappings,null,2));process.exit(0)}
function relocated(file){for(const [old,dest]of mappings){if(file===old||file.startsWith(old+'/'))return dest+file.slice(old.length)}return file}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'||e.name==='.runtime'||e.name==='.git'?[]:walk(path.join(dir,e.name))):[path.join(dir,e.name)])}
const files=['src','tests','scripts','e2e','database'].flatMap(dir=>walk(path.join(root,dir))).filter(f=>/\.(?:js|cjs)$/.test(f)&&f!==__filename&&!f.includes('review-2026'));
for(const absolute of files){
 const file=path.relative(root,absolute).replaceAll('\\','/'),newFile=relocated(file);
 const old=fs.readFileSync(absolute,'utf8');
 const text=old.replace(/require\((['"])(\.[^'"]*)\1\)/g,(match,quote,target)=>{
  const oldTarget=path.relative(root,path.resolve(path.dirname(absolute),target)).replaceAll('\\','/'),newTarget=relocated(oldTarget);
  if(file===newFile&&oldTarget===newTarget)return match;
  let next=path.relative(path.dirname(path.join(root,newFile)),path.join(root,newTarget)).replaceAll('\\','/');if(!next.startsWith('.'))next='./'+next;
  return `require(${quote}${next}${quote})`;
 });
 if(text!==old)fs.writeFileSync(absolute,text);
}
for(const [from,to]of mappings){fs.mkdirSync(path.dirname(path.join(root,to)),{recursive:true});fs.renameSync(path.join(root,from),path.join(root,to))}
console.log('Relocated domain modules into src/modules; relative imports updated.');
