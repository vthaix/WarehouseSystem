const assert = require('node:assert/strict');
require('../src/config/env').loadEnv();
const db = require('../src/config/database');
const queue = require('../src/shared/storage-queue');
(async () => {
  const pool = db.getPool();
  const sql = `SELECT l.id,l.code,l.item_id,l.expiry_date,l.manufactured_date,b.quantity,b.location_id,
    loc.zone_name,loc.depth,pol.SoNgayHanDung AS shelf_life_days,
    (SELECT MIN(d.posted_at) FROM stock_documents d JOIN stock_document_lines dl ON dl.stock_document_id=d.id WHERE dl.lot_id=l.id AND d.type='IN') AS first_received_at,
    (SELECT SUM(m.quantity_delta) FROM inventory_movements m WHERE m.lot_id=l.id) AS movement_quantity
    FROM lots l JOIN inventory_balances b ON b.lot_id=l.id JOIN warehouse_locations loc ON loc.id=b.location_id
    JOIN purchase_order_lines pol ON pol.id=l.purchase_order_line_id WHERE l.code LIKE 'DEMO-Q-%' ORDER BY l.code`;
  const [before] = await pool.execute(sql);
  assert.equal(before.length, require('../database/seeders/queue-demo').definitions.length);
  await require('../database/seeders/queue-demo').seed(pool);
  const [rows] = await pool.execute(sql);
  assert.deepEqual(rows, before, 'Repeat seed must preserve balances and dates');
  for (const r of rows) {
    assert.equal(Number(r.quantity), Number(r.movement_quantity));
    assert.equal((new Date(r.expiry_date) - new Date(r.manufactured_date)) / 86400000, Number(r.shelf_life_days));
  }
  const flour = rows.filter(r => r.code.includes('BOT-')).sort(queue.compare);
  assert.deepEqual(flour.map(r => r.code), ['DEMO-Q-BOT-SOM','DEMO-Q-BOT-CUNG-HAN-1','DEMO-Q-BOT-CUNG-HAN-2','DEMO-Q-BOT-HAN-XA']);
  const [locations] = await pool.execute('SELECT id,zone_category_id,depth FROM warehouse_locations WHERE id IN (?,?)', [flour[0].location_id, flour[3].location_id]);
  assert.equal(queue.recommend({expiry_date:queue.date(flour[0].expiry_date)},locations,[flour[3]]).location_id,String(flour[0].location_id));
  assert.equal(queue.recommend({expiry_date:queue.date(flour[3].expiry_date)},locations,[flour[0]]).location_id,String(flour[3].location_id));
  console.log(JSON.stringify({result:'PASS',lots:rows.length,checks:['expiry per supplier','FEFO','FIFO for equal expiry','inbound near/far placement','movement balances','idempotent seed'],export_order:flour.map(r=>({code:r.code,expiry:queue.date(r.expiry_date),quantity:r.quantity,zone:r.zone_name}))},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.closePool());
