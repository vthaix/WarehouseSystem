const C=require('../services/domain/core');
function signature(line){return [line.assignee_id??line.user_id,line.stock_request_line_id,line.lot_id,line.location_id,line.quality_bucket].map(String).join(':');}
function quantities(rows,existing=false){const result=new Map();for(const row of rows){const n=C.qty(String(row.quantity),false)-(existing?C.qty(String(row.posted_quantity),false):0n);if(n>0n){const key=signature(row);result.set(key,(result.get(key)||0n)+n);}}return result;}
function unchanged(existing,submitted){const a=quantities(existing,true),b=quantities(submitted);return a.size===b.size&&[...a].every(([key,n])=>b.get(key)===n);}
module.exports={unchanged};
