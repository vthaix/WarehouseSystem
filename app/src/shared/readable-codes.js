function words(value){
 return String(value||'CHUNG').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'D')
  .replace(/^(cong ty\s+)?(tnhh\s+)?(nguyen vat lieu|nguyen lieu|thuc pham|nha cung cap|xuong)\s+/i,'')
  .toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'')||'CHUNG';
}
async function next(c,table,prefix,context){
 if(!/^[a-z_]+$/.test(table))throw Error('Invalid code table');
 const limit=['lots','lot_headers'].includes(table)?50:40;
 const label=words(context).slice(0,Math.max(6,limit-prefix.length-8)).replace(/-$/,'');
 const stem=prefix+'-'+label,group=table+':'+stem;
 for(;;){
  await c.execute('INSERT INTO BoDemMaNghiepVu(Nhom,SoThuTu) VALUES (?,1) ON DUPLICATE KEY UPDATE SoThuTu=SoThuTu+1',[group]);
  const [[row]]=await c.execute('SELECT SoThuTu AS ordinal FROM BoDemMaNghiepVu WHERE Nhom=? FOR UPDATE',[group]);
  const result=stem+'-'+String(row.ordinal).padStart(3,'0');
  const [exists]=await c.execute(`SELECT id FROM ${table} WHERE code=? FOR UPDATE`,[result]);if(!exists.length)return result;
 }
}
async function supplier(c,id){const [[r]]=await c.execute('SELECT name FROM suppliers WHERE id=?',[id]);return words(r?.name||'NCC');}
async function workshop(c,id){const [[r]]=await c.execute('SELECT name FROM workshops WHERE id=?',[id]);return words(r?.name||'XUONG');}
async function item(c,id){const [[r]]=await c.execute('SELECT name FROM items WHERE id=?',[id]);return words(r?.name||'MAT-HANG');}
async function finishedHeader(c,planId){
 const [[prior]]=await c.execute('SELECT id FROM lot_headers WHERE partial_production_plan_id=? FOR UPDATE',[planId]);if(prior)return prior.id;
 const [[plan]]=await c.execute('SELECT workshop_id FROM production_plans WHERE id=?',[planId]);
 const code=await next(c,'lot_headers','LO-TP',await workshop(c,plan.workshop_id));
 const [h]=await c.execute("INSERT INTO lot_headers(code,lot_kind,partial_production_plan_id) VALUES (?,'THANH_PHAM',?)",[code,planId]);return h.insertId;
}
async function finishedLot(c,planId,itemId){
 const [[r]]=await c.execute('SELECT i.name,w.name AS workshop_name FROM items i JOIN production_plans p ON p.id=? JOIN workshops w ON w.id=p.workshop_id WHERE i.id=?',[planId,itemId]);
 return next(c,'lots','TP',words(r.workshop_name)+'-'+words(r.name));
}
async function supplierReturn(c,lotId){
 const [[r]]=await c.execute('SELECT COALESCE(pl.supplier_id,po.supplier_id) AS supplier_id FROM lots l JOIN purchase_order_lines pl ON pl.id=l.purchase_order_line_id JOIN purchase_orders po ON po.id=pl.purchase_order_id WHERE l.id=?',[lotId]);
 return next(c,'lot_headers','LO-TRA-NCC',r?await supplier(c,r.supplier_id):'NCC');
}
module.exports={words,next,supplier,workshop,item,finishedHeader,finishedLot,supplierReturn};
