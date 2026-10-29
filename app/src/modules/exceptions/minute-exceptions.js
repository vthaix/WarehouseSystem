const C=require('../../services/domain/core');
const P=require('../../services/domain/policy');
const paginate=require('../../utils/pagination');
const roles=['DIRECTOR','WAREHOUSE_MANAGER','WORKSHOP_OWNER'];
async function row(c,u,id,lock=false){
  P.role(u,roles);C.fail(!/^[1-9]\d*$/.test(String(id)),'NOT_FOUND','Không tìm thấy ngoại lệ.',404);
  const [[r]]=await c.execute("SELECT * FROM stocktakes WHERE id=? AND BienBanTrangThai='SUBMITTED' AND NgoaiLeMoTa IS NOT NULL"+(lock?' FOR UPDATE':''),[id]);
  C.fail(!r,'NOT_FOUND','Không tìm thấy ngoại lệ trong biên bản đã gửi.',404);
  if(!u.roles.some(x=>['DIRECTOR','WAREHOUSE_MANAGER'].includes(x)))C.fail(!(u.workshop_ids||[]).map(String).includes(String(r.NgoaiLeMaXuong)),'NOT_FOUND','Đề xuất không gửi cho xưởng của bạn.',404);
  return r;
}
async function get(service,u,id,c=service.pool){
  const r=await row(c,u,id);
  let minuteLines=r.BienBanDuLieu;if(typeof minuteLines==='string')minuteLines=JSON.parse(minuteLines);
  const [workshops]=u.roles.includes('WAREHOUSE_MANAGER')?await c.execute("SELECT DISTINCT w.id,w.name FROM workshops w JOIN workshop_users wu ON wu.workshop_id=w.id JOIN users u ON u.id=wu.user_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id WHERE u.status='ACTIVE' AND ro.code='WORKSHOP_OWNER' ORDER BY w.id"):[[]];
  const [history]=await c.execute("SELECT actor_id,action,after_data,created_at FROM audit_logs WHERE resource_type='minute-exceptions' AND resource_id=? ORDER BY id",[id]);
  const decisionHistory=history.map(h=>{const d=typeof h.after_data==='string'?JSON.parse(h.after_data):h.after_data||{};return {actor_id:String(h.actor_id),action:h.action,decision_status:d.status,resolution_note:d.description,workshop_id:d.workshop_id?String(d.workshop_id):null,created_at:h.created_at};});
  return {minute_lines:minuteLines||[],minute_conclusion:r.BienBanKetLuan,id:'LOT-'+r.id,code:'NL-'+r.code,type:'MINUTE_EXCEPTION',stocktake_id:String(r.id),minute_id:'LOT-'+r.id,reason:r.NgoaiLeMoTa,resolution_note:r.NgoaiLeCachXuLy||'',status:r.NgoaiLeTrangThai,workshop_id:r.NgoaiLeMaXuong?String(r.NgoaiLeMaXuong):null,owner_instruction:r.NgoaiLeYKienPheDuyet||'',version:r.version,eligible_workshops:workshops.map(w=>({id:String(w.id),name:w.name})),decision_history:decisionHistory,actions:u.roles.includes('WAREHOUSE_MANAGER')&&['OPEN','REJECTED','APPROVED'].includes(r.NgoaiLeTrangThai)?['handleMinuteException']:u.roles.includes('WORKSHOP_OWNER')&&(u.workshop_ids||[]).map(String).includes(String(r.NgoaiLeMaXuong))&&r.NgoaiLeTrangThai==='PENDING_APPROVAL'?['reviewMinuteException']:[]};
}
async function act(service,u,id,b,action,request){
  P.role(u,action==='review'?['WORKSHOP_OWNER']:['WAREHOUSE_MANAGER']);
  C.fields(b,action==='review'?['version','decision','reason']:['version','resolution_note','request_approval','workshop_id']);
  await service.tx(async c=>{
    const r=await row(c,u,id,true);C.version(r,b.version);
    let status,description,workshopId;
    if(action==='review'){
      C.fail(!(u.workshop_ids||[]).map(String).includes(String(r.NgoaiLeMaXuong)),'FORBIDDEN','Đề xuất không gửi cho xưởng của bạn.',403);
      C.state({...r,status:r.NgoaiLeTrangThai},['PENDING_APPROVAL']);
      C.fail(String(r.NgoaiLeNguoiXuLy)===String(u.id),'FORBIDDEN','Người đề xuất không tự phê duyệt.',403);
      C.fail(!['APPROVE','REJECT'].includes(b.decision),'VALIDATION_ERROR','Quyết định không hợp lệ.');
      C.text(b.reason||'','reason',5000,b.decision==='REJECT');
      status=b.decision==='APPROVE'?'APPROVED':'REJECTED';description=b.reason||null;
      await c.execute('UPDATE stocktakes SET NgoaiLeTrangThai=?,NgoaiLeYKienPheDuyet=?,NgoaiLeNguoiDuyet=?,version=version+1 WHERE id=?',[status,description,u.id,id]);
      await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) VALUES (?,?,?,'minute-exceptions',?,?) ON DUPLICATE KEY UPDATE id=notifications.id",[r.NgoaiLeNguoiXuLy,'Chủ xưởng đã phản hồi ngoại lệ '+r.code,description||'Đồng ý phương án đề xuất.',id,'minute-exception-'+id+'-review-'+r.version]);
    }else{
      C.state({...r,status:r.NgoaiLeTrangThai},['OPEN','REJECTED','APPROVED']);
      C.text(b.resolution_note,'resolution_note',5000);
      C.fail(b.request_approval!==undefined&&typeof b.request_approval!=='boolean','VALIDATION_ERROR','Lựa chọn đề xuất không hợp lệ.');
      if(r.NgoaiLeTrangThai==='REJECTED')C.fail(b.request_approval===true||b.resolution_note.trim()!==r.NgoaiLeYKienPheDuyet.trim(),'VALIDATION_ERROR','Cần thực hiện đúng phương án xử lý của chủ xưởng.');
      if(r.NgoaiLeTrangThai==='APPROVED')C.fail(b.request_approval===true||b.resolution_note.trim()!==r.NgoaiLeCachXuLy.trim(),'VALIDATION_ERROR','Cần thực hiện đúng phương án đã được duyệt.');
      status=b.request_approval===true?'PENDING_APPROVAL':'RESOLVED';description=b.resolution_note;
      workshopId=r.NgoaiLeMaXuong;
      if(b.request_approval===true){
        C.fail(!/^[1-9]\d*$/.test(String(b.workshop_id)),'VALIDATION_ERROR','Chọn xưởng nhận đề xuất.');
        const [owners]=await c.execute("SELECT wu.user_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id WHERE wu.workshop_id=? AND u.status='ACTIVE' AND ro.code='WORKSHOP_OWNER' AND u.id<>?",[b.workshop_id,u.id]);
        C.fail(!owners.length,'VALIDATION_ERROR','Xưởng chưa có chủ xưởng khác đang hoạt động để phê duyệt.');workshopId=b.workshop_id;
      }
      await c.execute('UPDATE stocktakes SET NgoaiLeTrangThai=?,NgoaiLeCachXuLy=?,NgoaiLeMaXuong=?,NgoaiLeNguoiXuLy=?,version=version+1 WHERE id=?',[status,description,workshopId,u.id,id]);
      if(b.request_approval===true)await c.execute("INSERT INTO notifications(user_id,subject,body,resource_type,resource_id,business_key) SELECT DISTINCT u.id,?,?,'minute-exceptions',?,? FROM workshop_users wu JOIN users u ON u.id=wu.user_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles ro ON ro.id=ur.role_id WHERE wu.workshop_id=? AND u.status='ACTIVE' AND ro.code='WORKSHOP_OWNER' AND u.id<>? ON DUPLICATE KEY UPDATE id=notifications.id",['Đề xuất xử lý ngoại lệ '+r.code,description,id,'minute-exception-'+id+'-proposal-'+r.version,workshopId,u.id]);
    }
    await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'minute-exceptions',?,?,?,?)",[u.id,id,action.toUpperCase(),JSON.stringify({status,description,workshop_id:workshopId||r.NgoaiLeMaXuong}),request]);
  });
  return get(service,u,id);
}
async function list(service,u,q){
  P.role(u,roles);C.fields(q,['page','per_page','q','status','sort']);const p=paginate(q),params=[];
  const workshopOnly=!u.roles.some(r=>['DIRECTOR','WAREHOUSE_MANAGER'].includes(r));
  const ids=(u.workshop_ids||[]).map(String);
  let scope='';if(workshopOnly){scope=ids.length?' AND s.NgoaiLeMaXuong IN ('+ids.map(()=>'?').join(',')+')':' AND 1=0';params.push(...ids);}
  let base=" FROM (SELECT CONCAT('LOT-',s.id) AS id,s.id AS sort_id,CONCAT('NL-',s.code) AS code,s.NgoaiLeTrangThai AS status FROM stocktakes s WHERE s.BienBanTrangThai='SUBMITTED' AND s.NgoaiLeMoTa IS NOT NULL"+scope+" UNION ALL SELECT CAST(p.id AS CHAR) AS id,p.id AS sort_id,p.code,p.status FROM exception_proposals p"+(workshopOnly?' WHERE 1=0':'')+') exceptions WHERE 1=1';
  if(q.q){C.text(q.q,'q',150);base+=' AND code LIKE ?';params.push('%'+q.q+'%');}if(q.status){base+=' AND status=?';params.push(q.status);}
  const [[n]]=await service.pool.execute('SELECT COUNT(*) AS total'+base,params);
  const [rows]=await service.pool.execute('SELECT id'+base+' ORDER BY sort_id DESC,id DESC LIMIT ? OFFSET ?',[...params,String(p.per_page),String(p.offset)]);
  return {data:await Promise.all(rows.map(r=>service.get(u,r.id))),meta:{...p,total:Number(n.total),total_pages:Math.ceil(Number(n.total)/p.per_page)}};
}
module.exports={get,act,list};
