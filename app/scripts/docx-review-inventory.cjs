const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/review-20261028');
const blocks=JSON.parse(fs.readFileSync(path.join(out,'original-blocks.json'),'utf8'));
const groups={
  auth:['identity-service/modules/auth/','shared/clients','shared/internal','../shared/Auth','../middlewares/'],
  orders:['business-service/modules/customer-orders/'],
  production:['business-service/modules/production/ProductionPlanService','../../shared/planning-dates','../../shared/production-recipes'],
  reports:['business-service/modules/production/ProductionReportService','../../shared/production-report'],
  finished:['business-service/modules/production/FinishedReportService','business-service/modules/production/finished-report-progress','warehouse-service/modules/stock-requests/partial'],
  plans:['business-service/modules/business-plans/','../../shared/planning-dates','../../shared/planning-confirmation'],
  catalog:['shared/catalog/','business-service/modules/purchasing/MaterialCatalog','warehouse-service/modules/warehouse/Lot','../../shared/CategoryImage','../../config/category-images'],
  purchasing:['business-service/modules/purchasing/PurchaseOrderService'],
  stock:['warehouse-service/modules/warehouse/','warehouse-service/modules/stock-requests/','../../shared/available-stock'],
  tasks:['warehouse-service/modules/tasks/','warehouse-service/modules/quality/QualityCampaignService','warehouse-service/modules/quality/campaign-sources','../../shared/qc-schedule-dates'],
  qc:['warehouse-service/modules/quality/'],
  minutes:['warehouse-service/modules/stocktakes/','warehouse-service/modules/tasks/inspection-scope'],
  exceptions:['warehouse-service/modules/exceptions/'],
  reporting:['reporting-service/modules/reporting/'],
};
const mapping={
  '01':['auth'],'02':['orders'],'03':['orders'],'03.1':['orders'],'29':['orders'],'31':['production','orders'],
  '04':['plans','production'],'05':['plans','production'],'05.1':['plans','production'],'05.2':['plans','production'],
  '06':['catalog'],'06.1':['catalog'],'06.2':['catalog'],'06.3':['catalog'],'07':['catalog'],'07.1':['catalog'],'07.2':['catalog'],'07.3':['catalog'],
  '08':['stock'],'09':['stock'],'10':['stock'],'11':['stock'],'11.01':['stock'],'11.02':['stock'],
  '12':['qc'],'12.1':['qc','tasks'],'12.2':['qc','exceptions'],'12.3':['qc'],'13':['tasks'],'14':['purchasing'],
  '15':['tasks','minutes'],'16':['exceptions','minutes'],'17':['exceptions'],'18':['reporting'],'19':['reporting','stock'],'20':['reporting','stock'],'21':['reporting','minutes'],'22':['reporting','production'],
  '23':['stock'],'24':['stock'],'24.1':['stock'],'24.2':['stock'],'25':['tasks'],'25.1':['tasks'],'25.2':['tasks'],
  '27':['purchasing','plans'],'28':['minutes','tasks'],'32':['plans'],'34':['reports','production'],'35':['finished','stock'],
};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function argumentsAt(s,start){let depth=1,quote='',escape=false,args=[],last=start,i=start;for(;i<s.length;i++){const c=s[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='('||c==='['||c==='{')depth++;if(c===')'||c===']'||c==='}')depth--;if(depth===0){args.push(s.slice(last,i).trim());return {args,end:i};}if(c===','&&depth===1){args.push(s.slice(last,i).trim());last=i+1;}}return null;}
function unquote(s){if(!s)return '';if(/^['"`]/.test(s)&&s[0]===s.at(-1))return s.slice(1,-1).replace(/\\n/g,' ').replace(/\\'/g,"'").replace(/\\"/g,'"');return s;}
const inventory=[];
for(const file of files(path.join(root,'src')).filter(p=>p.endsWith('.js'))){
 const relative=path.relative(root,file).replaceAll('\\','/'),s=fs.readFileSync(file,'utf8');
 const re=/\b(C\.fail|new C\.DomainError|throw new Error|throw Error|C\.state|C\.version|C\.fields|C\.date|C\.qty|C\.price|C\.text|P\.role|confirmation\.check)\s*\(/g;
 for(const m of s.matchAll(re)){const parsed=argumentsAt(s,m.index+m[0].length);if(!parsed)continue;const a=parsed.args,kind=m[1];let message='',code='',condition='';
 if(kind==='C.fail'){condition=a[0];code=unquote(a[1]);message=unquote(a[2]);}else if(kind==='new C.DomainError'){code=unquote(a[1]);message=unquote(a[2]);}else if(kind==='confirmation.check'){code='PLAN_CONFIRMATION_REQUIRED';message=unquote(a[2]);condition=a[0];}else if(kind.startsWith('throw')){code='TECHNICAL_ERROR';message=unquote(a[0]);}else {code=kind;message=a.join(' | ');}
 const line=s.slice(0,m.index).split('\n').length;
 const key=relative.replace(/^src\/services\//,'');const assigned=Object.keys(mapping).filter(uc=>mapping[uc].some(g=>groups[g].some(prefix=>prefix.startsWith('../')?relative.startsWith('src/'+prefix.replace(/^\.\.\/(\.\.\/)?/,'')):key.startsWith(prefix))));
 inventory.push({id:'BR-'+String(inventory.length+1).padStart(4,'0'),file:relative,line,kind,code,message,condition,ucs:assigned.map(u=>'UC-'+u),verification:'STATIC_REVIEW_ONLY; not proof of execution for this individual guard'});
 }
}
const ucs=blocks.filter(b=>b.type==='table').map(b=>{const title=b.rows[0].flat().join(' ').trim(),id=title.match(/UC-([\d.]+)/)?.[1];if(!mapping[id])throw Error('Unmapped UC '+title);return {id:'UC-'+id,block:b.index,title,groups:mapping[id],branches:inventory.filter(g=>g.ucs.includes('UC-'+id)).map(g=>g.id)};});
fs.writeFileSync(path.join(out,'branch-inventory.json'),JSON.stringify(inventory,null,2));
fs.writeFileSync(path.join(out,'uc-inventory.json'),JSON.stringify(ucs,null,2));
const unmatched=inventory.filter(g=>!g.ucs.length);
fs.writeFileSync(path.join(out,'STATIC_BRANCH_REVIEW.md'),'# Danh mục nhánh đối soát tĩnh\n\nKhông coi quét code là đã chạy test. Các nhánh bên dưới cần đối chiếu thêm báo cáo thực thi. Nhánh không gắn UC gốc thuộc hạ tầng, tính năng bổ sung hoặc cần phân loại thủ công.\n\n'+inventory.map(g=>`- **${g.id}** ${g.ucs.join(', ')||'CHUNG/BỔ SUNG'} — ${g.code}: ${g.message.replaceAll('\n',' ')} (${g.file}:${g.line}). Điều kiện: ${g.condition.replaceAll('\n',' ')||'theo lời gọi/hợp đồng hàm'}`).join('\n'));
console.log(JSON.stringify({ucs:ucs.length,guards:inventory.length,unmatched:unmatched.length}));
