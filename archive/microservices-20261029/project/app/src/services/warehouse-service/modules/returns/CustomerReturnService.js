const C = require('../../../domain/core');
const P = require('../../../domain/policy');
const paginate = require('../../../../utils/pagination');
const recordCode = require('../../../../shared/record-code');
const isId = v => /^[1-9]\d*$/.test(String(v));
const norm = r => Object.fromEntries(Object.entries(r).map(([k,v])=>[k,(k==='id'||k.endsWith('_id'))&&v!=null?String(v):v]));
const headerSelect = "SELECT h.*,h.return_status AS status,h.return_version AS version,w.name AS return_warehouse_name,u.full_name AS return_receiver_name FROM lot_headers h LEFT JOIN warehouses w ON w.id=h.return_warehouse_id LEFT JOIN users u ON u.id=h.return_receiver_id";
class CustomerReturnService {
  constructor(pool, transactions){this.pool=pool;this.transactions=transactions;}
  tx(work){return this.transactions.tx(work);}
  dto(u,r){return {...norm(r),actions:r.status==='PENDING' ? (u.roles.includes('WAREHOUSE_MANAGER')?['cancelReturn']:String(r.return_receiver_id)===String(u.id)&&u.roles.includes('WAREHOUSE_STAFF')?['receiveReturn']:[]) : []};}
  scope(u,r){C.fail(u.roles.includes('WAREHOUSE_STAFF')&&!u.roles.some(role=>['DIRECTOR','WAREHOUSE_MANAGER','QC_INSPECTOR'].includes(role))&&String(r.return_receiver_id)!==String(u.id),'NOT_FOUND','Không tìm thấy hàng trả được giao.',404);}
  async audit(c,u,r,action,request){await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,request_id) VALUES (?,'customer-returns',?,?,?)",[u.id,r,action,request]);}
  async list(u,q={}){
    P.role(u,P.read['customer-returns']);C.fields(q,['page','per_page','q','status','sort']);const p=paginate(q),params=[],where=["h.return_direction='KHACH_HANG'","h.return_status IS NOT NULL"];
    if(u.roles.includes('WAREHOUSE_STAFF')&&!u.roles.some(role=>['DIRECTOR','WAREHOUSE_MANAGER','QC_INSPECTOR'].includes(role))){where.push('h.return_receiver_id=?');params.push(u.id);}
    if(q.q){C.text(q.q,'q',150);where.push('h.code LIKE ?');params.push('%'+q.q+'%');}
    if(q.status){C.fail(!['PENDING','POSTED','CANCELLED'].includes(q.status),'VALIDATION_ERROR','Trạng thái trả không hợp lệ.');where.push('h.return_status=?');params.push(q.status);}
    const clause=' WHERE '+where.join(' AND ');const [[n]]=await this.pool.execute('SELECT COUNT(*) AS total FROM lot_headers h'+clause,params);
    const [rows]=await this.pool.execute(headerSelect+clause+' ORDER BY h.id DESC LIMIT ? OFFSET ?',[...params,String(p.per_page),String(p.offset)]);
    return {data:rows.map(r=>this.dto(u,r)),meta:{...p,total:Number(n.total),total_pages:Math.ceil(Number(n.total)/p.per_page)}};
  }
  async get(u,id,c=this.pool){
    P.role(u,P.read['customer-returns']);C.fail(!isId(id),'NOT_FOUND','Không tìm thấy hàng trả.',404);
    const [[r]]=await c.execute(headerSelect+" WHERE h.id=? AND h.return_direction='KHACH_HANG' AND h.return_status IS NOT NULL",[id]);C.fail(!r,'NOT_FOUND','Không tìm thấy hàng trả.',404);this.scope(u,r);
    const [lines]=await c.execute('SELECT t.*,i.name AS item_name,i.unit_id,l.code AS original_lot_code,d.code AS original_delivery_code,p.customer_order_id FROM returned_lot_lines t JOIN lots l ON l.id=t.original_lot_detail_id JOIN items i ON i.id=l.item_id JOIN stock_document_lines dl ON dl.id=t.original_stock_document_line_id JOIN stock_documents d ON d.id=dl.stock_document_id JOIN stock_requests rq ON rq.id=d.stock_request_id JOIN business_plans p ON p.id=rq.business_plan_id WHERE t.lot_header_id=? ORDER BY t.id',[id]);
    const [[doc]]=await c.execute('SELECT id FROM stock_documents WHERE return_header_id=?',[id]);
    return {...this.dto(u,r),lines:lines.map(norm),stock_document_id:doc?String(doc.id):null};
  }
  async deliveries(u,q={}){
    P.role(u,['WAREHOUSE_MANAGER']);C.fields(q,['q']);const params=[];let filter='';if(q.q){C.text(q.q,'q',150);filter=' AND (d.code LIKE ? OR i.name LIKE ?)';params.push('%'+q.q+'%','%'+q.q+'%');}
    const [rows]=await this.pool.execute("SELECT dl.id,dl.lot_id,dl.quantity,i.name AS item_name,d.code AS delivery_code,p.customer_order_id,COALESCE((SELECT SUM(t.quantity) FROM returned_lot_lines t JOIN lot_headers h ON h.id=t.lot_header_id WHERE t.original_stock_document_line_id=dl.id AND h.return_status<>'CANCELLED'),0) AS returned_quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id JOIN stock_requests r ON r.id=d.stock_request_id JOIN business_plans p ON p.id=r.business_plan_id JOIN lots l ON l.id=dl.lot_id JOIN items i ON i.id=l.item_id WHERE d.type='OUT' AND r.purpose='SALE_ISSUE' AND d.status='POSTED'"+filter+' ORDER BY dl.id DESC LIMIT 100',params);
    return rows.map(norm).filter(r=>C.qty(String(r.quantity))>C.qty(String(r.returned_quantity),false));
  }
  async create(u,b,request){
    P.role(u,['WAREHOUSE_MANAGER']);C.fields(b,['warehouse_id','receiver_id','reason','lines']);C.text(b.reason,'reason',5000);
    C.fail(!isId(b.warehouse_id)||!isId(b.receiver_id)||!Array.isArray(b.lines)||!b.lines.length||b.lines.length>100,'VALIDATION_ERROR','Chọn kho, người nhận và 1–100 dòng trả.');
    const seen=new Set();for(const line of b.lines){C.fields(line,['original_stock_document_line_id','quantity','location_id']);C.fail(!isId(line.original_stock_document_line_id)||!isId(line.location_id)||seen.has(String(line.original_stock_document_line_id)),'VALIDATION_ERROR','Dòng giao gốc trùng hoặc không hợp lệ.');C.qty(line.quantity);seen.add(String(line.original_stock_document_line_id));}
    const id=await this.tx(async c=>{
      const [[warehouse]]=await c.execute('SELECT id FROM warehouses WHERE id=? AND is_active=1 FOR UPDATE',[b.warehouse_id]);C.fail(!warehouse,'VALIDATION_ERROR','Kho không hoạt động.');
      const [[receiver]]=await c.execute("SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.id=? AND u.status='ACTIVE' AND r.code='WAREHOUSE_STAFF'",[b.receiver_id]);C.fail(!receiver,'VALIDATION_ERROR','Người nhận phải là nhân viên kho hoạt động.');
      const sourceIds=[...seen].sort((a,b)=>BigInt(a)<BigInt(b)?-1:1);
      const [sources]=await c.execute("SELECT dl.id,dl.lot_id,dl.quantity,p.customer_order_id FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id JOIN stock_requests r ON r.id=d.stock_request_id JOIN business_plans p ON p.id=r.business_plan_id WHERE dl.id IN ("+sourceIds.map(()=>'?').join(',')+") AND d.type='OUT' AND r.purpose='SALE_ISSUE' AND d.status='POSTED' ORDER BY dl.id FOR UPDATE",sourceIds);
      C.fail(sources.length!==b.lines.length,'VALIDATION_ERROR','Nguồn phải là dòng phiếu giao khách đã ghi sổ.');
      C.fail(new Set(sources.map(s=>String(s.customer_order_id))).size!==1,'VALIDATION_ERROR','Một lô trả chỉ nhận các dòng cùng đơn hàng.');
      for(const line of b.lines){
        const [[location]]=await c.execute('SELECT id FROM warehouse_locations WHERE id=? AND warehouse_id=? AND is_active=1',[line.location_id,b.warehouse_id]);C.fail(!location,'VALIDATION_ERROR','Vị trí không thuộc kho nhận.');
        const source=sources.find(s=>String(s.id)===String(line.original_stock_document_line_id));
        const [[sum]]=await c.execute("SELECT COALESCE(SUM(t.quantity),0) AS total FROM returned_lot_lines t JOIN lot_headers h ON h.id=t.lot_header_id WHERE t.original_stock_document_line_id=? AND h.return_status<>'CANCELLED' FOR UPDATE",[source.id]);
        C.fail(C.qty(line.quantity)+C.qty(String(sum.total),false)>C.qty(String(source.quantity)),'SOURCE_LIMIT_EXCEEDED','Tổng trả không được vượt lượng đã giao.',409);
      }
      const [[order]]=await c.execute('SELECT code FROM customer_orders WHERE id=?',[sources[0].customer_order_id]);
      const [h]=await c.execute("INSERT INTO lot_headers(code,lot_kind,return_direction,note,return_status,return_version,return_receiver_id,return_warehouse_id,return_creator_id) VALUES (?,'TRA_VE','KHACH_HANG',?,'PENDING',1,?,?,?)",[await recordCode.next(c,'lot_headers','TRAKH',order.code),b.reason,b.receiver_id,b.warehouse_id,u.id]);
      for(const line of b.lines){const source=sources.find(s=>String(s.id)===String(line.original_stock_document_line_id));await c.execute('INSERT INTO returned_lot_lines(lot_header_id,original_lot_detail_id,quantity,original_stock_document_line_id,return_location_id) VALUES (?,?,?,?,?)',[h.insertId,source.lot_id,C.decimal(C.qty(line.quantity)),source.id,line.location_id]);}
      await this.audit(c,u,h.insertId,'CREATE',request);return h.insertId;
    });return this.get(u,id);
  }
  async action(u,id,b,action,request){
    P.role(u,action==='receive'?['WAREHOUSE_STAFF']:['WAREHOUSE_MANAGER']);C.fields(b,['version']);
    await this.tx(async c=>{
      const [[h]]=await c.execute(headerSelect+" WHERE h.id=? AND h.return_direction='KHACH_HANG' AND h.return_status IS NOT NULL FOR UPDATE",[id]);C.fail(!h,'NOT_FOUND','Không tìm thấy hàng trả.',404);this.scope(u,h);
      // Receipt has a fixed saved destination and quantity; replay never posts twice.
      if(action==='receive'&&h.status==='POSTED')return;
      C.version(h,b.version);C.state(h,['PENDING']);
      if(action==='cancel'){C.fail(String(h.return_creator_id)!==String(u.id),'FORBIDDEN','Chỉ người lập được hủy hàng trả chưa nhận.',403);await c.execute("UPDATE lot_headers SET return_status='CANCELLED',return_version=return_version+1 WHERE id=?",[id]);await this.audit(c,u,id,'CANCEL',request);return;}
      C.fail(String(h.return_receiver_id)!==String(u.id),'FORBIDDEN','Không được phân công nhận lô trả.',403);
      const [[warehouse]]=await c.execute('SELECT id FROM warehouses WHERE id=? AND is_active=1 FOR UPDATE',[h.return_warehouse_id]);C.fail(!warehouse,'INVALID_STATE','Kho không hoạt động.',409);
      const [[frozen]]=await c.execute("SELECT COUNT(*) AS total FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id WHERE w.warehouse_id=? AND s.campaign_type='COUNT' AND w.status IN ('COUNTING','COMPLETED') AND s.status<>'CLOSED'",[h.return_warehouse_id]);C.fail(Number(frozen.total)>0,'WAREHOUSE_FROZEN','Kho đang kiểm kê.',409);
      const [lines]=await c.execute('SELECT t.*,l.item_id,l.production_plan_id,l.manufactured_date,l.expiry_date FROM returned_lot_lines t JOIN lots l ON l.id=t.original_lot_detail_id WHERE t.lot_header_id=? ORDER BY t.id FOR UPDATE',[id]);
      const [doc]=await c.execute("INSERT INTO stock_documents(code,type,stock_request_id,return_header_id,warehouse_id,posted_by,posted_at,status,note,idempotency_key) VALUES (?,'IN',NULL,?,?,?,UTC_TIMESTAMP(6),'POSTED',?,?)",[await recordCode.next(c,'stock_documents','PNTRA',h.code),id,h.return_warehouse_id,u.id,h.note,'customer-return-'+id]);
      for(const line of lines){
        const [[loc]]=await c.execute('SELECT id FROM warehouse_locations WHERE id=? AND warehouse_id=? AND is_active=1',[line.return_location_id,h.return_warehouse_id]);C.fail(!loc,'INVALID_STATE','Vị trí nhận không còn hoạt động.',409);
        C.fail(!line.production_plan_id,'INVALID_STATE','Dòng giao gốc không phải thành phẩm.',409);
        const [lot]=await c.execute("INSERT INTO lots(code,lot_header_id,item_id,production_plan_id,manufactured_date,expiry_date,received_quantity,qc_status,version) VALUES (?,?,?,?,?,?,?,'PENDING',1)",[await recordCode.next(c,'lots','LOTRA',h.code),id,line.item_id,line.production_plan_id,line.manufactured_date,line.expiry_date,line.quantity]);
        await c.execute('UPDATE returned_lot_lines SET returned_lot_detail_id=? WHERE id=?',[lot.insertId,line.id]);
        const [dl]=await c.execute("INSERT INTO stock_document_lines(stock_document_id,stock_request_line_id,return_line_id,lot_id,location_id,quality_bucket,quantity) VALUES (?,NULL,?,?,?,'QUARANTINE',?)",[doc.insertId,line.id,lot.insertId,line.return_location_id,line.quantity]);
        await c.execute("INSERT INTO inventory_balances(lot_id,location_id,quality_bucket,quantity,version) VALUES (?,?,'QUARANTINE',?,1)",[lot.insertId,line.return_location_id,line.quantity]);
        await c.execute("INSERT INTO inventory_movements(lot_id,location_id,quality_bucket,quantity_delta,stock_document_line_id,posted_at,created_by,operation_key) VALUES (?,?,'QUARANTINE',?,?,UTC_TIMESTAMP(6),?,?)",[lot.insertId,line.return_location_id,line.quantity,dl.insertId,u.id,'customer-return-line-'+line.id]);
      }
      await c.execute("UPDATE lot_headers SET return_status='POSTED',return_version=return_version+1 WHERE id=?",[id]);await this.audit(c,u,id,'RECEIVE_QUARANTINE',request);
    });return this.get(u,id);
  }
}
module.exports=CustomerReturnService;
