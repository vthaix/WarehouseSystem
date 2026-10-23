const C=require('../../../domain/core'),P=require('../../../domain/policy'),paginate=require('../../../../utils/pagination');
const valid=v=>/^[1-9]\d*$/.test(String(v));
class AccountService{
  constructor(pool){this.pool=pool;this.users=new(require('./UserRepository'))(pool);}
  dto(row){return {id:String(row.id),username:row.username,full_name:row.full_name,email:row.email||'',status:row.status,roles:row.roles,workshop_ids:row.workshop_ids,version:row.version,created_at:row.created_at,deleted:!!row.DaXoa,actions:row.DaXoa?[]:['edit','delete']};}
  async metadata(user){P.role(user,['ADMIN']);const [roles]=await this.pool.execute('SELECT code AS id,name FROM roles ORDER BY name');const [workshops]=await this.pool.execute('SELECT id,code,name FROM workshops WHERE is_active=1 ORDER BY name');return {roles,workshops:workshops.map(w=>({...w,id:String(w.id)}))};}
  async get(user,id,c=this.pool){P.role(user,['ADMIN']);C.fail(!valid(id),'NOT_FOUND','Không tìm thấy tài khoản.',404);const [[r]]=await c.execute('SELECT * FROM users WHERE id=? AND DaXoa=0',[id]);C.fail(!r,'NOT_FOUND','Không tìm thấy tài khoản.',404);return this.dto(await this.users.hydrate(r,c));}
  async list(user,q={}){
    P.role(user,['ADMIN']);C.fields(q,['page','per_page','q','status','sort']);const p=paginate(q),where=['DaXoa=0'],args=[];
    if(q.q){C.text(q.q,'q',150);where.push('(username LIKE ? OR full_name LIKE ?)');args.push('%'+q.q+'%','%'+q.q+'%');}
    if(q.status){C.fail(!['ACTIVE','LOCKED'].includes(q.status),'VALIDATION_ERROR','Trạng thái tài khoản không hợp lệ.');where.push('status=?');args.push(q.status);}
    const base=' FROM users WHERE '+where.join(' AND ');const [[n]]=await this.pool.execute('SELECT COUNT(*) AS total'+base,args);
    const [rows]=await this.pool.execute('SELECT id'+base+' ORDER BY id DESC LIMIT ? OFFSET ?',[...args,String(p.per_page),String(p.offset)]);
    return {data:await Promise.all(rows.map(r=>this.get(user,r.id))),meta:{...p,total:Number(n.total),total_pages:Math.ceil(Number(n.total)/p.per_page)}};
  }
  validate(b,create){
    C.fields(b,create?['username','full_name','email','password','roles','workshop_ids','status']:['version','full_name','email','password','roles','workshop_ids','status']);
    if(create)C.fail(typeof b.username!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.-]{2,79}$/.test(b.username),'VALIDATION_ERROR','Tên đăng nhập gồm 3–80 chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.');
    C.text(b.full_name,'full_name',150);C.fail(b.email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||b.email.length>254),'VALIDATION_ERROR','Email không hợp lệ.');
    if(create||b.password)C.fail(typeof b.password!=='string'||b.password.length<6||b.password.length>128,'VALIDATION_ERROR','Mật khẩu cần từ 6 đến 128 ký tự.');
    C.fail(!Array.isArray(b.roles)||!b.roles.length||b.roles.length>10||b.roles.some(r=>typeof r!=='string')||new Set(b.roles).size!==b.roles.length,'VALIDATION_ERROR','Chọn ít nhất một vai trò, không chọn trùng.');
    C.fail(!['ACTIVE','LOCKED'].includes(b.status),'VALIDATION_ERROR','Trạng thái tài khoản không hợp lệ.');
    C.fail(!Array.isArray(b.workshop_ids)||b.workshop_ids.length>50||b.workshop_ids.some(id=>!valid(id))||new Set(b.workshop_ids.map(String)).size!==b.workshop_ids.length,'VALIDATION_ERROR','Danh sách xưởng không hợp lệ.');
    C.fail(b.roles.includes('WORKSHOP_OWNER')?b.workshop_ids.length!==1:!!b.workshop_ids.length,'VALIDATION_ERROR','Chủ xưởng phải có xưởng phụ trách; vai trò khác không được gắn xưởng.');
  }
  async tx(work){const c=await this.pool.getConnection();try{await c.beginTransaction();await c.execute("SELECT id FROM roles WHERE code='ADMIN' FOR UPDATE");const result=await work(c);await c.commit();return result;}catch(e){await c.rollback();if(e.code==='ER_DUP_ENTRY')throw new C.DomainError(409,'DUPLICATE','Tên đăng nhập hoặc email đã tồn tại.');throw e;}finally{c.release();}}
  async write(user,id,b,requestId){
    P.role(user,['ADMIN']);const create=id===null;this.validate(b,create);
    const result=await this.tx(async c=>{
      let old=null;
      if(!create){old=await this.get(user,id,c);const [[locked]]=await c.execute('SELECT * FROM users WHERE id=? FOR UPDATE',[id]);C.version(locked,b.version);
        C.fail(String(id)===String(user.id)&&(b.status!=='ACTIVE'||!b.roles.includes('ADMIN')),'FORBIDDEN','Không tự khóa hoặc gỡ quyền quản trị của chính mình.',403);
        if(old.roles.includes('ADMIN')&&(b.status!=='ACTIVE'||!b.roles.includes('ADMIN')))await this.keepAdmin(c,id);
      }
      const [roles]=await c.execute('SELECT id,code FROM roles WHERE code IN ('+b.roles.map(()=>'?').join(',')+')',b.roles);C.fail(roles.length!==b.roles.length,'VALIDATION_ERROR','Vai trò không tồn tại.');
      if(b.workshop_ids.length){const [workshops]=await c.execute('SELECT id FROM workshops WHERE is_active=1 AND id IN ('+b.workshop_ids.map(()=>'?').join(',')+')',b.workshop_ids);C.fail(workshops.length!==b.workshop_ids.length,'VALIDATION_ERROR','Xưởng không tồn tại hoặc ngừng hoạt động.');}
      if(create){const [r]=await c.execute("INSERT INTO users(username,password_hash,full_name,email,status,failed_login_count,session_version,version,DaXoa) VALUES (?,?,?,?,?,0,1,1,0)",[b.username,C.hashPassword(b.password),b.full_name.trim(),b.email||null,b.status]);id=String(r.insertId);}
      else{await c.execute('UPDATE users SET full_name=?,email=?,status=?,session_version=session_version+1,version=version+1'+(b.password?',password_hash=?':'')+' WHERE id=?',[b.full_name.trim(),b.email||null,b.status,...(b.password?[C.hashPassword(b.password)]:[]),id]);await c.execute('DELETE FROM user_roles WHERE user_id=?',[id]);await c.execute('DELETE FROM workshop_users WHERE user_id=?',[id]);}
      for(const role of roles)await c.execute('INSERT INTO user_roles(user_id,role_id) VALUES (?,?)',[id,role.id]);
      for(const workshop of b.workshop_ids)await c.execute('INSERT INTO workshop_users(workshop_id,user_id) VALUES (?,?)',[workshop,id]);
      if(b.roles.includes('CUSTOMER'))await c.execute("INSERT INTO customers(user_id,code,name) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)",[id,'KH-TK-'+id,b.full_name.trim()]);
      // Audit only public account fields; never store plaintext or hashes here.
      await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,after_data,request_id) VALUES (?,'accounts',?,?,?,?)",[user.id,id,create?'CREATE':'UPDATE',JSON.stringify({roles:b.roles,status:b.status,workshop_ids:b.workshop_ids,password_changed:!!b.password}),requestId]);return id;
    });return this.get(user,result);
  }
  async keepAdmin(c,id){const [[r]]=await c.execute("SELECT COUNT(*) AS total FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='ADMIN' AND u.status='ACTIVE' AND u.DaXoa=0 AND u.id<>?",[id]);C.fail(!Number(r.total),'INVALID_STATE','Phải giữ ít nhất một tài khoản quản trị đang hoạt động.',409);}
  async create(u,b,r){return this.write(u,null,b,r);}
  async update(u,id,b,r){return this.write(u,id,b,r);}
  async remove(user,id,b,requestId){P.role(user,['ADMIN']);C.fields(b,['version']);C.fail(String(id)===String(user.id),'FORBIDDEN','Không được xóa tài khoản đang đăng nhập.',403);await this.tx(async c=>{const row=await this.get(user,id,c);const [[locked]]=await c.execute('SELECT * FROM users WHERE id=? FOR UPDATE',[id]);C.version(locked,b.version);if(row.roles.includes('ADMIN'))await this.keepAdmin(c,id);await c.execute("UPDATE users SET DaXoa=1,status='LOCKED',session_version=session_version+1,version=version+1 WHERE id=?",[id]);await c.execute("INSERT INTO audit_logs(actor_id,resource_type,resource_id,action,request_id) VALUES (?,'accounts',?,'DELETE',?)",[user.id,id,requestId]);});return {id:String(id),deleted:true};}
}
module.exports=AccountService;
