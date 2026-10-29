const C = require('../../../domain/core');
const P = require('../../../domain/policy');
const recordCode = require('../../../../shared/record-code');
const id = v => /^[1-9]\d*$/.test(String(v));

function validate(body) {
  C.fail(body.quarantine !== true || !id(body.qc_inspection_line_id) || body.stocktake_line_id ||
    !['SCRAP','RELEASE','QUARANTINE','RETURN_SUPPLIER'].includes(body.action), 'VALIDATION_ERROR', 'Chọn dòng QC và phương án xử lý cách ly hợp lệ.');
  const amount = C.qty(body.quantity);
  C.fail(!Array.isArray(body.allocations) || !body.allocations.length || body.allocations.length > 100,
    'VALIDATION_ERROR', 'Chọn 1–100 vị trí hàng cách ly.');
  let total = 0n;
  const seen = new Set();
  for (const line of body.allocations) {
    C.fields(line, ['location_id','quantity']);
    C.fail(!id(line.location_id) || seen.has(String(line.location_id)), 'VALIDATION_ERROR', 'Vị trí không hợp lệ hoặc trùng.');
    seen.add(String(line.location_id)); total += C.qty(line.quantity);
  }
  C.fail(total !== amount, 'VALIDATION_ERROR', 'Tổng phân bổ phải bằng lượng đề xuất.');
}

async function source(c, lineId) {
  const [[line]] = await c.execute("SELECT q.*,r.code AS inspection_code,r.status AS inspection_status,l.code AS lot_code,l.expiry_date,l.purchase_order_line_id,h.return_direction,h.return_status FROM qc_inspection_lines q JOIN qc_inspections r ON r.id=q.qc_inspection_id JOIN lots l ON l.id=q.lot_id JOIN lot_headers h ON h.id=l.lot_header_id WHERE q.id=? FOR UPDATE", [lineId]);
  C.fail(!line || line.inspection_status !== 'RECORDED' ||
    (line.return_direction === 'KHACH_HANG' && line.return_status !== 'POSTED'),
    'INVALID_STATE', 'Nguồn phải có kết luận QC; hàng khách trả phải đã nhận.', 409);
  return line;
}

async function create(service, u, b, request) {
  P.role(u, ['WAREHOUSE_MANAGER']); validate(b);
  let target;
  await service.tx(async c => {
    const line = await source(c, b.qc_inspection_line_id);
    C.fail(b.action==='QUARANTINE' && line.return_direction==='KHACH_HANG','INVALID_STATE','Hàng khách trả dùng kết luận QC và luồng cách ly hiện có.',409);
    C.fail(b.action==='RETURN_SUPPLIER' && (!line.purchase_order_line_id || line.return_direction==='KHACH_HANG'),'INVALID_STATE','Chỉ trả NCC hàng có dòng mua gốc.',409);
    await capacity(c, line, b.action, C.qty(b.quantity));
    for (const allocation of b.allocations) {
      const bucket=b.action==='QUARANTINE'?'AVAILABLE':'QUARANTINE';
      const [[balance]] = await c.execute("SELECT b.quantity FROM inventory_balances b WHERE b.lot_id=? AND b.location_id=? AND b.quality_bucket=? FOR UPDATE", [line.lot_id,allocation.location_id,bucket]);
      const [[held]] = await c.execute("SELECT COALESCE(SUM(a.quantity),0) quantity FROM exception_allocations a JOIN exception_proposals p ON p.id=a.exception_proposal_id JOIN qc_inspection_lines q ON q.id=p.qc_inspection_line_id WHERE q.lot_id=? AND a.location_id=? AND p.type='QUARANTINE_DISPOSITION' AND p.status IN ('PENDING_APPROVAL','APPROVED') AND (p.action='QUARANTINE')=?", [line.lot_id,allocation.location_id,b.action==='QUARANTINE'?1:0]);
      const reserved=b.action==='QUARANTINE'?await reservedQuantity(c,line.lot_id,allocation.location_id):0n;
      C.fail(!balance || C.qty(allocation.quantity)+C.qty(String(held.quantity),false)+reserved>C.qty(String(balance.quantity),false),
        'SOURCE_LIMIT_EXCEEDED','Vượt lượng cách ly còn có thể đề xuất tại vị trí.',409);
    }
    const [r] = await c.execute("INSERT INTO exception_proposals(code,type,qc_inspection_line_id,created_by,action,quantity,reason,resolution_note,status,version) VALUES (?,'QUARANTINE_DISPOSITION',?,?,?,?,?,?,'PENDING_APPROVAL',1)",
      [await recordCode.next(c,'exception_proposals','XLCL',`${line.inspection_code}-${line.lot_code}`),b.qc_inspection_line_id,u.id,b.action,C.decimal(C.qty(b.quantity)),b.reason,b.resolution_note]);
    target = r.insertId;
    for (const a of b.allocations) await c.execute('INSERT INTO exception_allocations(exception_proposal_id,location_id,quantity) VALUES (?,?,?)',[target,a.location_id,C.decimal(C.qty(a.quantity))]);
    await service.audit(c,u,target,'CREATE_QUARANTINE',request);
  });
  return service.get(u,target);
}

async function capacity(c,line,action,amount,exclude) {
  const customer=line.return_direction==='KHACH_HANG';
  const condition=customer?"action=? AND status<>'REJECTED'":action==='QUARANTINE'?"action=? AND status IN ('PENDING_APPROVAL','APPROVED')":"((action IN ('SCRAP','RETURN_SUPPLIER') AND status<>'REJECTED') OR (action='RELEASE' AND status IN ('PENDING_APPROVAL','APPROVED')))";
  const params=[line.id,...(customer||action==='QUARANTINE'?[action]:[]),exclude||0];
  const [[used]] = await c.execute("SELECT COALESCE(SUM(quantity),0) quantity FROM exception_proposals WHERE qc_inspection_line_id=? AND type='QUARANTINE_DISPOSITION' AND "+condition+" AND id<>?", params);
  const limit=C.qty(String(action==='QUARANTINE'||(customer&&action==='RELEASE')?line.passed_quantity:line.failed_quantity),false);
  C.fail(amount+C.qty(String(used.quantity),false)>limit,'SOURCE_LIMIT_EXCEEDED',action==='RELEASE'?'Vượt lượng QC đạt chưa giải phóng.':'Vượt lượng QC lỗi chưa loại bỏ.',409);
}

async function apply(c,u,row) {
  const line=await source(c,row.qc_inspection_line_id), amount=C.qty(String(row.quantity));
  await capacity(c,line,row.action,amount,row.id);
  C.fail(!['RELEASE','SCRAP','QUARANTINE','RETURN_SUPPLIER'].includes(row.action),'INVALID_STATE','Phương án cách ly không hợp lệ.',409);
  C.fail(row.action==='RETURN_SUPPLIER' && (!line.purchase_order_line_id || line.return_direction==='KHACH_HANG'),'INVALID_STATE','Chỉ trả NCC hàng có dòng mua gốc.',409);
  if(row.action==='QUARANTINE'||(row.action==='RELEASE'&&line.return_direction!=='KHACH_HANG')) {
    const [[check]]=await c.execute('SELECT * FROM TaiKiemChatLuong WHERE MaDeXuatXuLy=? ORDER BY MaBanGhi DESC LIMIT 1',[row.id]);
    const expected=row.action==='QUARANTINE'?'FAILED':'PASSED';
    C.fail(!check||check.KetLuan!==expected||C.qty(String(check.quantity))!==amount,'REINSPECTION_REQUIRED','Cần QC xác nhận đúng lượng và kết luận xử lý.',409);
  }
  if(row.action==='RELEASE') C.fail(line.expiry_date && new Date(line.expiry_date).toISOString().slice(0,10)<C.today(),'LOT_EXPIRED','Không giải phóng hàng đã hết hạn.',409);
  const [allocations]=await c.execute('SELECT a.*,l.warehouse_id,l.is_active AS location_active FROM exception_allocations a JOIN warehouse_locations l ON l.id=a.location_id WHERE a.exception_proposal_id=? ORDER BY a.location_id FOR UPDATE',[row.id]);
  C.fail(allocations.reduce((sum,a)=>sum+C.qty(String(a.quantity)),0n)!==amount,'INVALID_STATE','Phân bổ không khớp đề xuất.',409);
  const warehouses=[...new Set(allocations.map(a=>String(a.warehouse_id)))].sort((a,b)=>BigInt(a)<BigInt(b)?-1:1);
  for(const warehouseId of warehouses) {
    const [[warehouse]]=await c.execute('SELECT id,is_active FROM warehouses WHERE id=? FOR UPDATE',[warehouseId]);
    C.fail(!warehouse || !warehouse.is_active,'INVALID_STATE','Kho không hoạt động.',409);
    const [[frozen]]=await c.execute("SELECT COUNT(*) total FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id WHERE w.warehouse_id=? AND s.campaign_type='COUNT' AND w.status IN ('COUNTING','COMPLETED') AND s.status<>'CLOSED'",[warehouseId]);
    C.fail(Number(frozen.total)>0,'WAREHOUSE_FROZEN','Kho đang kiểm kê.',409);
  }
  for(const a of allocations) {
    C.fail(!a.location_active,'INVALID_STATE','Vị trí không hoạt động.',409);
    const sourceBucket=row.action==='QUARANTINE'?'AVAILABLE':'QUARANTINE';
    const [[balance]]=await c.execute("SELECT * FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket=? FOR UPDATE",[line.lot_id,a.location_id,sourceBucket]);
    const quantity=C.qty(String(a.quantity));
    C.fail(!balance || C.qty(String(balance.quantity),false)<quantity,'SOURCE_LIMIT_EXCEEDED','Tồn cách ly không đủ.',409);
    if(row.action==='QUARANTINE') C.fail(C.qty(String(balance.quantity),false)-quantity<await reservedQuantity(c,line.lot_id,a.location_id),'RESERVATION_CONFLICT','Cần giải phóng phân công trước khi cách ly lượng đã giữ chỗ.',409);
    await c.execute('UPDATE inventory_balances SET quantity=?,version=version+1 WHERE id=?',[C.decimal(C.qty(String(balance.quantity),false)-quantity),balance.id]);
    await movement(c,u,row,line,a,-quantity,sourceBucket);
    if(['QUARANTINE','RELEASE'].includes(row.action)) {
      const targetBucket=row.action==='QUARANTINE'?'QUARANTINE':'AVAILABLE';
      await c.execute("INSERT INTO inventory_balances(lot_id,location_id,quality_bucket,quantity,version) VALUES (?,?,?,?,1) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity),version=version+1",[line.lot_id,a.location_id,targetBucket,C.decimal(quantity)]);
      await movement(c,u,row,line,a,quantity,targetBucket);
    }
  }
  if(row.action==='RETURN_SUPPLIER') {
    const [header]=await c.execute("INSERT INTO lot_headers(code,lot_kind,return_direction,note) VALUES (?,'TRA_VE','NCC',?)",[await recordCode.next(c,'lot_headers','TRANCC',row.code),row.resolution_note]);
    await c.execute('INSERT INTO returned_lot_lines(lot_header_id,original_lot_detail_id,quantity,exception_proposal_id) VALUES (?,?,?,?)',[header.insertId,line.lot_id,row.quantity,row.id]);
  }
  if(row.action==='QUARANTINE'||(row.action==='RELEASE'&&line.return_direction!=='KHACH_HANG')) {
    const [[report]]=await c.execute('SELECT * FROM qc_inspections WHERE id=? FOR UPDATE',[line.qc_inspection_id]);
    const [before]=await c.execute('SELECT * FROM qc_inspection_lines WHERE qc_inspection_id=? ORDER BY id FOR UPDATE',[report.id]);
    const delta=row.action==='QUARANTINE'?-amount:amount;
    const passed=C.qty(String(line.passed_quantity),false)+delta,failed=C.qty(String(line.failed_quantity),false)-delta;
    C.fail(passed<0n||failed<0n,'SOURCE_LIMIT_EXCEEDED','Kết luận QC không đủ lượng để bù.',409);
    await c.execute('UPDATE qc_inspection_lines SET passed_quantity=?,failed_quantity=?,issue=? WHERE id=?',[C.decimal(passed),C.decimal(failed),failed>0n?row.reason:line.issue,line.id]);
    const [after]=await c.execute('SELECT * FROM qc_inspection_lines WHERE qc_inspection_id=? ORDER BY id',[report.id]);
    await c.execute('INSERT INTO qc_compensations(original_qc_id,original_version,created_by,reason,before_data,after_data) VALUES (?,?,?,?,?,?)',[report.id,report.version,u.id,row.code+': '+row.reason,JSON.stringify(before),JSON.stringify(after)]);
    await c.execute('UPDATE qc_inspections SET version=version+1 WHERE id=?',[report.id]);
    await c.execute('UPDATE lots SET qc_status=?,version=version+1 WHERE id=?',[failed===0n?'PASSED':passed===0n?'FAILED':'PARTIAL',line.lot_id]);
    await require('../stock-requests/partial-progress').refresh(c,[line.lot_id]);
  }
}
async function reservedQuantity(c,lot,location) {
  const [[row]]=await c.execute("SELECT COALESCE(SUM(a.quantity-a.posted_quantity),0) quantity FROM stock_allocations a JOIN tasks t ON t.id=a.task_id WHERE a.lot_id=? AND a.location_id=? AND a.quality_bucket='AVAILABLE' AND t.task_type='WAREHOUSE_OUT' AND t.status<>'CANCELLED'",[lot,location]);
  return C.qty(String(row.quantity),false);
}
async function movement(c,u,row,line,a,delta,bucket) {
  await c.execute('INSERT INTO inventory_movements(lot_id,location_id,quality_bucket,quantity_delta,exception_proposal_id,posted_at,created_by,operation_key) VALUES (?,?,?,?,?,UTC_TIMESTAMP(6),?,?)',
    [line.lot_id,a.location_id,bucket,C.decimal(delta),row.id,u.id,'quarantine-'+row.id+'-'+a.location_id+'-'+bucket]);
}
module.exports={validate,create,apply};
