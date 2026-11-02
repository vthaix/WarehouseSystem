const assert=require('node:assert/strict');require('../src/config/env').loadEnv();
const db=require('../src/config/database');
(async()=>{
 assert.equal(process.env.ACCEPTANCE_MONOLITH,'true','Use an isolated test database');assert.notEqual(process.env.NODE_ENV,'production');
 const pool=db.getPool(),[aliases]=await pool.execute('SELECT BangDuLieu AS source_table,MaBanGhiNguon AS source_id,MaMoi AS new_code FROM LichSuDoiMa');assert.ok(aliases.length);
 const allowed=new Set(['lots','lot_headers','stock_requests','tasks','qc_inspections','stocktakes','stock_documents','exception_proposals','customer_orders','production_plans','production_reports','finished_reports','purchase_orders','business_plans']);
 for(const r of aliases){assert.ok(allowed.has(r.source_table));const [[row]]=await pool.execute(`SELECT code FROM ${r.source_table} WHERE id=?`,[r.source_id]);assert.ok(row,'Original record ID must still exist');assert.equal(row.code,r.new_code);assert.ok(!/[A-F0-9]{12,}|PRODUCTIONISSU|TP-PHAN-/i.test(row.code));}
 const c=await pool.getConnection();try{await c.beginTransaction();const codes=require('../src/shared/readable-codes');const a=await codes.next(c,'lots','NVL','Tâm Anh Bột mì'),b=await codes.next(c,'lots','NVL','Tâm Anh Bột mì');assert.match(a,/^NVL-TAM-ANH-BOT-MI-\d{3,}$/);assert.notEqual(a,b);await c.rollback();}finally{c.release();}
 const before=aliases.length;await require('../src/shared/monolith-migrations').migrate(pool);const [[after]]=await pool.execute('SELECT COUNT(*) AS total FROM LichSuDoiMa');assert.equal(Number(after.total),before);
 console.log('PASS: '+before+' old code references mapped; original IDs and links retained; readable Vietnamese references; monotonic ordinal; re-running migration makes no further changes.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.closePool());
