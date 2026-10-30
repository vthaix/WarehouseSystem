const date=value=>value instanceof Date?value.toISOString().slice(0,10):value||null;
function recommend(lot,locations,existing=[]){
 const expiry=date(lot.expiry_date),dates=existing.map(r=>date(r.expiry_date)).filter(Boolean).sort();
 const deep=!!expiry&&(!dates.length||expiry>=dates.at(-1));
 const ordered=[...locations].sort((a,b)=>Number(!!b.zone_category_id)-Number(!!a.zone_category_id)||(deep?Number(b.depth||1)-Number(a.depth||1):Number(a.depth||1)-Number(b.depth||1))||Number(a.id)-Number(b.id));
 return {location_id:ordered[0]?String(ordered[0].id):null,reason:deep?'Hạn dùng còn xa: ưu tiên vị trí phía trong.':'Hạn dùng gần hoặc chưa rõ: ưu tiên phía ngoài, dễ đối chiếu trước khi xuất.'};
}
module.exports={recommend,date};
