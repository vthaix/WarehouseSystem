const C=require('../../../domain/core');
const P=require('../../../domain/policy');
const paginate=require('../../../../utils/pagination');
const valid=id=>/^[1-9]\d*$/.test(String(id));
async function campaign(service,c,u,id,lock=false){
  C.fail(!valid(id),'NOT_FOUND','Không tìm thấy đợt kiểm tra.',404);
  const [[row]]=await c.execute("SELECT * FROM stocktakes WHERE id=? AND campaign_type='QUALITY_CHECK'"+(lock?' FOR UPDATE':''),[id]);
  C.fail(!row,'NOT_FOUND','Không tìm thấy đợt kiểm tra.',404);
  const [assigned]=await c.execute('SELECT user_id FROM quality_campaign_assignments WHERE campaign_id=?',[id]);
  const allowed=assigned.some(a=>String(a.user_id)===String(u.id));
  C.fail(!u.roles.includes('DIRECTOR')&&!allowed,'NOT_FOUND','Không tìm thấy đợt kiểm tra được phân công.',404);
  return {row,allowed,author:allowed&&String(row.NguoiLapBienBanDuocChon)===String(u.id)};
}
async function lines(c,id){
  const [rows]=await c.execute("SELECT l.id AS lot_id,h.code AS lot_header_code,l.code AS lot_code,i.name AS item_name,u.name AS unit,l.received_quantity AS system_quantity,q.SoLuongDem AS counted_quantity,(q.SoLuongDem-l.received_quantity) AS difference_quantity,q.NguoiDem AS counted_by,q.ThoiDiemDem AS counted_at,l.qc_status,x.inspected_quantity,x.passed_quantity,x.failed_quantity,x.issue FROM quality_campaign_lots q JOIN lots l ON l.id=q.lot_id JOIN items i ON i.id=l.item_id JOIN units u ON u.id=i.unit_id LEFT JOIN lot_headers h ON h.id=l.lot_header_id LEFT JOIN (SELECT d.* FROM qc_inspection_lines d JOIN qc_inspections r ON r.id=d.qc_inspection_id WHERE r.status='RECORDED') x ON x.lot_id=l.id WHERE q.campaign_id=? ORDER BY l.id",[id]);
  return rows.map(r=>({...r,lot_id:String(r.lot_id),counted_by:r.counted_by?String(r.counted_by):null}));
}
async function get(service,u,id,c=service.pool){
  P.role(u,P.read['stocktake-minutes']);
  const {row,author:allowed}=await campaign(service,c,u,id);
  C.fail(row.BienBanKetLuan===null,'NOT_FOUND','Đợt chưa lập biên bản.',404);
  let snapshot=row.BienBanDuLieu;
  if(typeof snapshot==='string')snapshot=JSON.parse(snapshot);
  const exception={exception_mode:row.NgoaiLeMoTa?'DESCRIBE':'NONE',exception_description:row.NgoaiLeMoTa||'',exception_status:row.NgoaiLeTrangThai};
  return {...exception,id:'LOT-'+row.id,code:'BB-'+row.code,stocktake_id:String(row.id),source_kind:'LOT_INSPECTION',source_code:row.code,remarks:row.BienBanKetLuan,status:row.BienBanTrangThai,created_by:row.BienBanNguoiLap?String(row.BienBanNguoiLap):null,submitted_at:row.BienBanNgayGui,version:row.version,lines:snapshot||await lines(c,id),actions:allowed&&u.roles.some(r=>['QC_INSPECTOR','STOCKTAKER'].includes(r))&&row.BienBanTrangThai==='DRAFT'?['edit','submit']:[]};
}
async function write(service,u,id,b,action,request){
  P.role(u,['STOCKTAKER','QC_INSPECTOR']);
  C.fields(b,action==='create'?['inspection_campaign_id','remarks','exception_mode','exception_description']:action==='submit'?['version']:['version','remarks','exception_mode','exception_description']);
  if(action!=='submit')C.text(b.remarks,'remarks',5000);
  const target=action==='create'?b.inspection_campaign_id:id;
  await service.tx(async c=>{
    const {row,author:allowed}=await campaign(service,c,u,target,true);
    C.fail(!allowed,'FORBIDDEN','Bạn không được phân công lập biên bản đợt này.',403);
    C.state(row,['COMPLETED','CLOSED']);
    if(action!=='create')C.version(row,b.version);
    C.fail(row.BienBanTrangThai!=='DRAFT'||(action==='create'?row.BienBanKetLuan!==null:row.BienBanKetLuan===null),'INVALID_STATE','Biên bản đã tồn tại, chưa được lập hoặc đã gửi.',409);
    const snapshot=action==='submit'?await lines(c,target):null;
    if(action!=='submit'){
      const mode=b.exception_mode??(row.NgoaiLeMoTa?'DESCRIBE':'NONE');
      C.fail(!['NONE','DESCRIBE'].includes(mode),'VALIDATION_ERROR','Lựa chọn ngoại lệ không hợp lệ.');
      const description=mode==='DESCRIBE'?(b.exception_description??row.NgoaiLeMoTa):null;
      if(mode==='DESCRIBE')C.text(description,'exception_description',5000);
      await c.execute('UPDATE stocktakes SET NgoaiLeMoTa=? WHERE id=?',[description,target]);
    }else {
      await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?,'stocktake-minutes',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='DIRECTOR' ON DUPLICATE KEY UPDATE id=notifications.id",['Biên bản kiểm kê mới: '+row.code,row.BienBanKetLuan,target,'minute-'+target+'-submitted']);
      await c.execute("UPDATE stocktakes SET NgoaiLeTrangThai=IF(NgoaiLeMoTa IS NULL,'NONE','OPEN') WHERE id=?",[target]);
      if(row.NgoaiLeMoTa)await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?,'minute-exceptions',?,? FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_MANAGER' ON DUPLICATE KEY UPDATE id=notifications.id",['Biên bản '+row.code+' có ngoại lệ',row.NgoaiLeMoTa,target,'minute-exception-'+target+'-submitted']);
    }
    await c.execute('UPDATE stocktakes SET BienBanKetLuan=?,BienBanTrangThai=?,BienBanNguoiLap=?,BienBanNgayGui=IF(?,UTC_TIMESTAMP(6),NULL),BienBanDuLieu=?,version=version+1 WHERE id=?',[action==='submit'?row.BienBanKetLuan:b.remarks,action==='submit'?'SUBMITTED':'DRAFT',u.id,action==='submit',snapshot?JSON.stringify(snapshot):null,target]);
    await service.audit(c,u,target,'INSPECTION_MINUTE_'+action.toUpperCase(),request);
  });
  return get(service,u,target);
}
async function list(service,u,q){
  P.role(u,P.read['stocktake-minutes']);C.fields(q,['page','per_page','q','sort','status']);
  const p=paginate(q),params=[],director=u.roles.includes('DIRECTOR');
  const legacy=director?'':" AND (EXISTS(SELECT 1 FROM stocktake_assignments a WHERE a.stocktake_warehouse_id=w.id AND a.user_id=?) OR EXISTS(SELECT 1 FROM PhanCongKetLuanKiemKe a WHERE a.MaPhieuKiemKe=w.id AND a.MaNguoiDung=?))";
  if(!director)params.push(u.id,u.id);
  const modern=director?'':' AND EXISTS(SELECT 1 FROM quality_campaign_assignments a WHERE a.campaign_id=s.id AND a.user_id=?)';
  if(!director)params.push(u.id);
  let base=" FROM (SELECT CAST(w.id AS CHAR) AS id,w.id AS sort_id,CONCAT('BB-',s.code,'-',k.code) AS code,w.conclusion_status AS status FROM stocktake_warehouses w JOIN stocktakes s ON s.id=w.stocktake_id JOIN warehouses k ON k.id=w.warehouse_id WHERE w.remarks IS NOT NULL"+legacy+" UNION ALL SELECT CONCAT('LOT-',s.id) AS id,s.id AS sort_id,CONCAT('BB-',s.code) AS code,s.BienBanTrangThai AS status FROM stocktakes s WHERE s.campaign_type='QUALITY_CHECK' AND s.BienBanKetLuan IS NOT NULL"+modern+') minutes WHERE 1=1';
  if(q.q){C.text(q.q,'q',150);base+=' AND code LIKE ?';params.push('%'+q.q+'%');}
  if(q.status){base+=' AND status=?';params.push(q.status);}
  const [[n]]=await service.pool.execute('SELECT COUNT(*) AS total'+base,params);
  const [rows]=await service.pool.execute('SELECT id'+base+' ORDER BY sort_id DESC,id DESC LIMIT ? OFFSET ?',[...params,String(p.per_page),String(p.offset)]);
  return {data:await Promise.all(rows.map(r=>service.minuteGet(u,r.id))),meta:{...p,total:Number(n.total),total_pages:Math.ceil(Number(n.total)/p.per_page)}};
}
module.exports={get,write,list};
