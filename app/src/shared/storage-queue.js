const date=value=>value instanceof Date?value.toISOString().slice(0,10):value||null;
const timestamp=value=>value instanceof Date?value.getTime():value?Date.parse(value):Infinity;
function compare(a,b){
 const expiryA=date(a.expiry_date)||'9999-12-31',expiryB=date(b.expiry_date)||'9999-12-31';
 return expiryA.localeCompare(expiryB)||(timestamp(a.first_received_at)-timestamp(b.first_received_at)||0)||String(a.id).localeCompare(String(b.id),'en',{numeric:true});
}
function addMonths(value,months){
 const origin=new Date(value+'T00:00:00Z'),day=origin.getUTCDate();origin.setUTCDate(1);origin.setUTCMonth(origin.getUTCMonth()+months);
 const last=new Date(Date.UTC(origin.getUTCFullYear(),origin.getUTCMonth()+1,0)).getUTCDate();origin.setUTCDate(Math.min(day,last));return origin.toISOString().slice(0,10);
}
function expiryBand(expiry,today=new Date(Date.now()+7*3600000).toISOString().slice(0,10)){
 if(!expiry||date(expiry)<addMonths(today,3))return 0;
 return date(expiry)<=addMonths(today,6)?1:2;
}
function recommend(lot,locations,existing=[],today){
 const expiry=date(lot.expiry_date),dates=existing.map(r=>date(r.expiry_date)).filter(Boolean).sort();
 const deep=!!expiry&&(!dates.length||expiry>=dates.at(-1));
 const target=expiryBand(expiry,today),groups=new Map(),bands=new Map();
 for(const l of locations){const key=l.zone_name||String(l.zone_category_id||'general');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l);}
 for(const group of groups.values())group.sort((a,b)=>Number(a.depth||1)-Number(b.depth||1)||String(a.code||a.id).localeCompare(String(b.code||b.id),'vi',{numeric:true})).forEach((l,index)=>bands.set(String(l.id),Math.min(2,Math.floor(index*3/group.length))));
 const ordered=locations.filter(l=>l.is_active!==false&&l.is_active!==0).sort((a,b)=>Number(!!b.zone_category_id)-Number(!!a.zone_category_id)||Math.abs(bands.get(String(a.id))-target)-Math.abs(bands.get(String(b.id))-target)||(deep?Number(b.depth||1)-Number(a.depth||1):Number(a.depth||1)-Number(b.depth||1))||Number(a.id)-Number(b.id));
 return {location_id:ordered[0]?String(ordered[0].id):null,location_ids:ordered.filter(l=>bands.get(String(l.id))===target&&Number(!!l.zone_category_id)===Number(!!ordered[0]?.zone_category_id)).map(l=>String(l.id)),reason:!expiry?'Chưa có hạn dùng: ưu tiên ô phía ngoài.':['Hạn dùng dưới 3 tháng · Ô phía ngoài.','Hạn dùng từ 3 đến 6 tháng · Ô ở giữa.','Hạn dùng trên 6 tháng · Ô phía trong.'][target]};
}
module.exports={recommend,date,compare,expiryBand,addMonths};
