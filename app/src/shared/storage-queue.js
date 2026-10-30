const date=value=>value instanceof Date?value.toISOString().slice(0,10):value||null;
const timestamp=value=>value instanceof Date?value.getTime():value?Date.parse(value):Infinity;
function compare(a,b){
 const expiryA=date(a.expiry_date)||'9999-12-31',expiryB=date(b.expiry_date)||'9999-12-31';
 return expiryA.localeCompare(expiryB)||(timestamp(a.first_received_at)-timestamp(b.first_received_at)||0)||String(a.id).localeCompare(String(b.id),'en',{numeric:true});
}
function recommend(lot,locations,existing=[]){
 const expiry=date(lot.expiry_date),dates=existing.map(r=>date(r.expiry_date)).filter(Boolean).sort();
 const deep=!!expiry&&(!dates.length||expiry>=dates.at(-1));
 const ordered=[...locations].sort((a,b)=>Number(!!b.zone_category_id)-Number(!!a.zone_category_id)||(deep?Number(b.depth||1)-Number(a.depth||1):Number(a.depth||1)-Number(b.depth||1))||Number(a.id)-Number(b.id));
 return {location_id:ordered[0]?String(ordered[0].id):null,reason:expiry&&dates.includes(expiry)?'Cùng hạn dùng: xếp sau lô đã nhập trước để giữ thứ tự nhập trước, xuất trước.':deep?'Hạn dùng còn xa: ưu tiên vị trí phía trong.':'Hạn dùng gần hoặc chưa rõ: ưu tiên phía ngoài, dễ đối chiếu trước khi xuất.'};
}
module.exports={recommend,date,compare};
