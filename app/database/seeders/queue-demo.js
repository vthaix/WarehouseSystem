// Small, traceable opening-stock fixture. Never replenish it on restart.
const marker = 'demo_material_queue_v1';
const definitions = [
  ['BOT-SOM', 'NVL-001', 'NCC-01', 90, 15, 12, 20],
  ['BOT-CUNG-HAN-1', 'NVL-001', 'NCC-03', 180, 45, 10, 15],
  ['BOT-CUNG-HAN-2', 'NVL-001', 'NCC-03', 180, 45, 5, 15],
  ['BOT-HAN-XA', 'NVL-001', 'NCC-03', 180, 120, 2, 30],
  ['BO-SOM', 'NVL-003', 'NCC-02', 60, 10, 8, 10],
  ['BO-HAN-XA', 'NVL-003', 'NCC-02', 60, 40, 1, 15],
];
const day = (origin, offset) => new Date(Date.parse(origin + 'T00:00:00Z') + offset * 86400000).toISOString().slice(0, 10);
async function seed(pool) {
  if (process.env.NODE_ENV === 'production') throw Error('Queue demo seed is disabled in production.');
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    // Serialize concurrent seed commands without changing existing workflow data.
    await c.query('SELECT id FROM warehouses ORDER BY id FOR UPDATE');
    const [[done]] = await c.execute('SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten=?', [marker]);
    if (Number(done.total)) { await c.commit(); return; }
    const [[clock]] = await c.execute("SELECT DATE_FORMAT(DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 HOUR),'%Y-%m-%d') AS today");
    const today = clock.today;
    async function id(table, field, value) {
      const [[r]] = await c.execute(`SELECT id FROM ${table} WHERE ${field}=?`, [value]);
      if (!r) throw Error('Missing queue demo reference: ' + table + '/' + value);
      return r.id;
    }
    async function insert(table, row) {
      const keys = Object.keys(row);
      const [r] = await c.execute(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(row));
      return r.insertId;
    }
    const users = {};
    for (const u of ['planner', 'director', 'purchaser', 'workshop', 'manager', 'staff', 'qc']) users[u] = await id('users', 'username', u);
    const warehouse = await id('warehouses', 'code', 'KHO-01');
    const workshop = await id('workshops', 'code', 'XUONG-01');
    // Distinct terms per material/supplier; keep prices and all other offers.
    for (const [code, terms] of [['NVL-001', {'NCC-01':90,'NCC-03':180}], ['NVL-003', {'NCC-02':60}]]) {
      const item = await id('items', 'code', code);
      const [[r]] = await c.execute('SELECT BangGiaNCC FROM NguyenVatLieu WHERE MaMatHang=?', [item]);
      const offers = typeof r.BangGiaNCC === 'string' ? JSON.parse(r.BangGiaNCC) : r.BangGiaNCC;
      for (const [supplierCode, days] of Object.entries(terms)) {
        const supplier = await id('suppliers', 'code', supplierCode);
        const offer = offers.find(o => String(o.supplier_id) === String(supplier));
        if (!offer) throw Error('Missing supplier offer for ' + code + '/' + supplierCode);
        offer.shelf_life_days = days;
      }
      await c.execute('UPDATE NguyenVatLieu SET BangGiaNCC=? WHERE MaMatHang=?', [JSON.stringify(offers), item]);
    }
    for (const [suffix, code, supplierCode, shelf, remaining, age, quantity] of definitions) {
      const key = 'DEMO-Q-' + suffix, item = await id('items', 'code', code), supplier = await id('suppliers', 'code', supplierCode);
      const [[material]] = await c.execute('SELECT category_id,reference_price FROM items WHERE id=?', [item]);
      const [[loc]] = await c.execute('SELECT id FROM warehouse_locations WHERE warehouse_id=? AND zone_category_id=? AND is_active=1 ORDER BY ABS(depth-?),id LIMIT 1', [warehouse, material.category_id, remaining<90?1:remaining<=180?6:10]);
      if (!loc) throw Error('Missing compatible demo storage zone');
      const expiry = day(today, remaining), manufactured = day(expiry, -shelf), received = day(today, -age), posted = received + ' 02:00:00';
      const total = (Number(material.reference_price) * quantity).toFixed(4);
      const note = 'Dữ liệu mẫu queue: tồn đầu kỳ đã kiểm tra và nhập kho; không tự bổ sung khi đã xuất.';
      const plan = await insert('business_plans', {code:key,type:'PURCHASE',planned_date:received,status:'APPROVED',created_by:users.planner,reviewed_by:users.director,reviewed_at:posted,total_amount:total,version:1,note});
      const pl = await insert('business_plan_lines', {business_plan_id:plan,item_id:item,quantity,unit_price:material.reference_price});
      const po = await insert('purchase_orders', {code:key,business_plan_id:plan,supplier_id:supplier,created_by:users.purchaser,expected_delivery_date:received,delivery_terms:note,status:'RECEIVED',total_amount:total,version:1});
      const pol = await insert('purchase_order_lines', {purchase_order_id:po,business_plan_line_id:pl,item_id:item,supplier_id:supplier,quantity,unit_price:material.reference_price,SoNgayHanDung:shelf});
      const header = await insert('lot_headers', {code:key,lot_kind:'NGUYEN_VAT_LIEU',note});
      const lot = await insert('lots', {code:key,item_id:item,purchase_order_line_id:pol,manufactured_date:manufactured,expiry_date:expiry,received_quantity:quantity,qc_status:'PASSED',version:1,lot_header_id:header});
      const qc = await insert('qc_inspections', {code:key,inspector_id:users.qc,inspected_at:posted,status:'RECORDED',version:1,note});
      await insert('qc_inspection_lines', {qc_inspection_id:qc,lot_id:lot,inspected_quantity:quantity,passed_quantity:quantity,failed_quantity:0});
      const request = await insert('stock_requests', {code:key,type:'IN',purpose:'PURCHASE_RECEIPT',purchase_order_id:po,workshop_id:workshop,warehouse_id:warehouse,created_by:users.workshop,requested_date:received,status:'FULFILLED',manager_id:users.manager,version:1,note});
      const line = await insert('stock_request_lines', {stock_request_id:request,item_id:item,quantity});
      const doc = await insert('stock_documents', {code:key,type:'IN',stock_request_id:request,warehouse_id:warehouse,posted_by:users.staff,posted_at:posted,status:'POSTED',note,idempotency_key:key});
      const dl = await insert('stock_document_lines', {stock_document_id:doc,stock_request_line_id:line,lot_id:lot,location_id:loc.id,quality_bucket:'AVAILABLE',quantity});
      await insert('inventory_balances', {lot_id:lot,location_id:loc.id,quality_bucket:'AVAILABLE',quantity,version:1});
      await insert('inventory_movements', {lot_id:lot,location_id:loc.id,quality_bucket:'AVAILABLE',quantity_delta:quantity,stock_document_line_id:dl,posted_at:posted,created_by:users.staff,operation_key:key});
      await c.execute("UPDATE business_plans SET status='COMPLETED' WHERE id=?", [plan]);
    }
    await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)', [marker, '0'.repeat(64)]);
    await c.commit();
  } catch (e) { await c.rollback(); throw e; } finally { c.release(); }
}
module.exports = {seed, definitions, day};
