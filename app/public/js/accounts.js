(()=>{
  const previousCreate=createForm,previousEdit=editForm,previousDetail=detail,previousAction=actionForm;
  async function accountForm(record){
    const metadata=(await api('account-options')).data;
    if(record)record=(await api('accounts/'+record.id)).data;
    const selected=new Set(record?.roles||[]),scopes=new Set(record?.workshop_ids||[]);
    openModal(record?'Sửa tài khoản · '+record.username:'Thêm tài khoản',formWrap((record?'<div class="span2 notice">Tên đăng nhập: <strong>'+esc(record.username)+'</strong>. Để trống mật khẩu nếu giữ nguyên.</div>':inputField('username'))+inputField('full_name','text',true,[],record?.full_name||'')+inputField('email','email',false,[],record?.email||'')+inputField('password','password',!record)+inputField('status','select',true,[{id:'ACTIVE',name:'Đang hoạt động'},{id:'LOCKED',name:'Khóa truy cập'}],record?.status||'ACTIVE')+'<fieldset class="span2 account-role-list"><legend>Vai trò được cấp *</legend>'+metadata.roles.map(r=>'<label class="completion-toggle"><input type="checkbox" data-account-role value="'+esc(r.id)+'" '+(selected.has(r.id)?'checked':'')+'><span>'+esc(r.name)+'</span></label>').join('')+'</fieldset><fieldset class="span2 account-workshops"><legend>Xưởng phụ trách *</legend>'+metadata.workshops.map(w=>'<label class="completion-toggle"><input type="radio" name="account_workshop" data-account-workshop value="'+esc(w.id)+'" '+(scopes.has(w.id)?'checked':'')+'><span>'+esc(w.name)+'</span></label>').join('')+'</fieldset>'));
    document.querySelector('label[for="f-password"]').textContent=record?'Mật khẩu mới (tùy chọn)':'Mật khẩu *';
    if(record&&String(record.id)!==String(user.id)){const button=document.createElement('button');button.type='button';button.className='button danger';button.textContent='Xóa tài khoản';button.onclick=()=>actionForm(record,'delete');document.querySelector('#data-form .form-actions').prepend(button);}
    const roles=()=>[...document.querySelectorAll('[data-account-role]:checked')].map(i=>i.value);
    const sync=()=>{document.querySelector('.account-workshops').hidden=!roles().includes('WORKSHOP_OWNER');};document.querySelectorAll('[data-account-role]').forEach(i=>i.onchange=sync);sync();
    bindForm(d=>{const r=roles();if(!r.length)throw Error('Chọn ít nhất một vai trò.');delete d.account_workshop;return {...d,...(record?{version:record.version}:{}),roles:r,workshop_ids:r.includes('WORKSHOP_OWNER')?[...document.querySelectorAll('[data-account-workshop]:checked')].map(i=>i.value):[]};},record?'accounts/'+record.id:'accounts',record?'PATCH':'POST');
  }
  createForm=async function(){if(current!=='accounts')return previousCreate();try{await accountForm();}catch(e){openModal('Không thể mở tài khoản',errorHTML(e));}};
  editForm=async function(r){if(current!=='accounts')return previousEdit(r);try{await accountForm(r);}catch(e){openModal('Không thể sửa tài khoản',errorHTML(e));}};
  detail=function(r){if(current!=='accounts')return previousDetail(r);return editForm(r);};
  actionForm=async function(r,action){if(current!=='accounts'||action!=='delete')return previousAction(r,action);openModal('Xóa tài khoản',formWrap('<p class="span2">Xóa tài khoản <strong>'+esc(r.username)+'</strong>? Tài khoản sẽ bị khóa và ẩn khỏi danh sách; lịch sử chứng từ được giữ nguyên.</p>'));bindForm(()=>({version:r.version}),'accounts/'+r.id,'DELETE');};
  window.addEventListener('DOMContentLoaded',()=>{if(current==='accounts'){const select=document.querySelector('#status');if(select)select.innerHTML='<option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Khóa truy cập</option>';}});
})();
