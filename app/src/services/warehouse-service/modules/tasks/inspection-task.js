const C=require('../../../domain/core');
const Sources=require('../quality/campaign-sources');
async function sources(pool){
  const lots=await Sources.actualLots(pool,null,1000);
  const [reports]=await pool.execute("SELECT r.id,r.code,r.completed_date,o.lot_id,l.lot_header_id,l.code AS lot_code,l.received_quantity,l.qc_status,i.name AS item_name,h.code AS lot_header_code FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id JOIN lots l ON l.id=o.lot_id JOIN items i ON i.id=l.item_id JOIN lot_headers h ON h.id=l.lot_header_id WHERE r.status='SUBMITTED' ORDER BY r.id DESC LIMIT 1000");
  const groups=new Map();
  for(const lot of lots.filter(l=>l.kind==='FINISHED_PRODUCT')){
    const key=String(lot.lot_header_id);
    if(!groups.has(key))groups.set(key,{id:key,code:lot.lot_header_code||lot.code,parts:[]});
  }
  for(const report of reports){
    const pending=lots.find(l=>l.id===String(report.lot_id));
    const lot=pending||{id:String(report.lot_id),lot_header_id:report.lot_header_id,code:report.lot_code,item_name:report.item_name,received_quantity:report.received_quantity,expected_date:report.completed_date instanceof Date?report.completed_date.toISOString().slice(0,10):String(report.completed_date).slice(0,10)};
    const key=String(lot.lot_header_id);if(!groups.has(key))groups.set(key,{id:key,code:report.lot_header_code,parts:[]});
    const group=groups.get(key);
    let part=group.parts.find(p=>p.id===String(report.id));
    if(!part){part={id:String(report.id),code:report.code,available:true,expected_date:lot.expected_date,lot_ids:[],lines:[]};group.parts.push(part);}
    if(!pending)part.available=false;
    part.expected_date=[part.expected_date,lot.expected_date].sort().at(-1);part.lot_ids.push(lot.id);part.lines.push({lot_id:lot.id,code:lot.code,item_name:lot.item_name,quantity:lot.received_quantity});
  }
  const material=new Map();
  for(const lot of lots.filter(l=>l.kind==='MATERIAL'&&l.purchase_plan_id)){
    const key='LOT:'+lot.lot_header_id;
    if(!material.has(key))material.set(key,{id:key,code:lot.lot_header_code||lot.code,purchase_plan_id:String(lot.purchase_plan_id),expected_date:lot.expected_date,lot_ids:[],lines:[]});
    material.get(key).lot_ids.push(lot.id);material.get(key).lines.push({lot_id:lot.id,item_name:lot.item_name,quantity:lot.received_quantity,code:lot.code});
  }
  const [plans]=await pool.execute("SELECT id,code,planned_date FROM business_plans WHERE type='PURCHASE' AND status IN ('APPROVED','IN_PROGRESS') ORDER BY id DESC LIMIT 100");
  for(const p of plans)material.set('PLAN:'+p.id,{id:'PLAN:'+p.id,code:'NVL dự kiến · '+p.code,purchase_plan_id:String(p.id),expected_date:p.planned_date instanceof Date?p.planned_date.toISOString().slice(0,10):p.planned_date,lot_ids:[],lines:[]});
  for(const group of material.values())group.eligible_lots=lots.filter(l=>l.kind==='MATERIAL'&&(group.id.startsWith('PLAN:')?String(l.purchase_plan_id)===group.purchase_plan_id:group.lot_ids.includes(l.id))).map(l=>({id:l.id,name:l.name,expected_date:l.expected_date}));
  return {finished_lots:[...groups.values()],material_lots:[...material.values()]};
}
async function create(pool,c,user,b,value,requestId){
  C.fail(!['MATERIAL','FINISHED_PRODUCT'].includes(b.inspection_type),'VALIDATION_ERROR','Chọn kiểm tra thành phẩm hoặc kiểm tra nguyên vật liệu.');
  const author=b.minute_author_id||(value.ids.length===1?value.ids[0]:null);
  C.fail(!value.ids.includes(String(author)),'VALIDATION_ERROR','Chọn một nhân viên được phân công để lập biên bản chung.');
  const options=await sources(c);let lotIds=[],mode='ACTUAL',planId=null;
  if(b.inspection_type==='FINISHED_PRODUCT'){
    const group=options.finished_lots.find(g=>g.id===String(b.lot_header_id));
    C.fail(!group||!Array.isArray(b.finished_report_ids)||!b.finished_report_ids.length||b.finished_report_ids.length>100||new Set(b.finished_report_ids.map(String)).size!==b.finished_report_ids.length,'VALIDATION_ERROR','Chọn lô và từng phần theo báo cáo thành phẩm đã gửi.');
    for(const id of b.finished_report_ids){const part=group.parts.find(p=>p.id===String(id));C.fail(!part||!part.available,'VALIDATION_ERROR','Phần được chọn không thuộc lô, chưa gửi báo cáo hoặc đã được giao kiểm tra.');lotIds.push(...part.lot_ids);}
  }else{
    const material=options.material_lots.find(g=>g.id===b.material_source);
    C.fail(!material,'VALIDATION_ERROR','Chọn lô NVL theo kế hoạch mua đã duyệt.');
    lotIds=material.lot_ids;
    if(b.material_lot_ids!==undefined){
      C.fail(!Array.isArray(b.material_lot_ids)||b.material_lot_ids.length>100||new Set(b.material_lot_ids.map(String)).size!==b.material_lot_ids.length,'VALIDATION_ERROR','Danh sách phần lô NVL không hợp lệ.');
      const eligible=new Set(material.eligible_lots.map(l=>l.id));
      C.fail(b.material_lot_ids.some(id=>!eligible.has(String(id))),'VALIDATION_ERROR','Phần lô không thuộc nguồn đã chọn, đã giao kiểm tra hoặc không còn chờ QC.');
      C.fail(material.eligible_lots.length>0&&!b.material_lot_ids.length,'VALIDATION_ERROR','Chọn ít nhất một phần lô NVL đã nhận.');
      lotIds=b.material_lot_ids.map(String);
    }
    if(material.id.startsWith('PLAN:')){mode='PURCHASE_PLAN';planId=material.purchase_plan_id;}
  }
  const campaign=await new (require('../quality/QualityCampaignService'))(pool).create(user,{
    campaign_type:'QUALITY_CHECK',quality_kind:b.inspection_type,source_mode:mode,...(planId?{source_plan_id:planId}:{}),
    lot_ids:lotIds,planned_date:require('../../../../shared/qc-schedule-dates').localDay(b.start_at),start_at:b.start_at,end_at:b.end_at,
    location:b.location||'Khu kiểm tra lô hàng',note:b.description||'',assignee_ids:value.ids,
  },requestId,c);
  await require('./inspection-scope').sync(c,campaign.id,value.ids);
  await c.execute('UPDATE stocktakes SET NguoiLapBienBanDuocChon=? WHERE id=?',[author,campaign.id]);
  return campaign;
}
module.exports={sources,create};
