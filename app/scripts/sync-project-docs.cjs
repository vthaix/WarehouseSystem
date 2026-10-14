const fs=require('node:fs'),path=require('node:path');
const {collect,outputs,root}=require('./project-manifest.cjs');
const manifest=collect();
for(const [name,content] of Object.entries(outputs(manifest))) {
  const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);
}
console.log(`Generated project manifest: ${manifest.services.length} services, ${manifest.serviceMigrations.length} service migrations, ${manifest.routes.length} API routes.`);
