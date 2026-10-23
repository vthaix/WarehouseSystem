(()=>{
  const previousCreate=createForm,previousEdit=editForm,previousAction=actionForm,previousDetail=detail;
  function mountAuthor(value){
    const employees=document.querySelector('#f-assignee_ids');if(!employees)return;
    employees.closest('.employee-picker').insertAdjacentHTML('afterend',inputField('minute_author_id','select',true,[]));
    document.querySelector('label[for="f-minute_author_id"]').textContent='Nhân viên lập biên bản chung *';
    const author=document.querySelector('#f-minute_author_id');
    const sync=()=>{const keep=author.value||String(value||'');author.innerHTML='<option value="">Chọn người lập biên bản</option>'+[...employees.selectedOptions].map(o=>'<option value="'+esc(o.value)+'">'+esc(o.textContent)+'</option>').join('');author.value=keep;};
    employees.addEventListener('input',sync);sync();
  }
  function countForm(tasks,selected){
    openModal('Ghi số lượng kiểm kê',formWrap(inputField('task_id','select',true,tasks.map(t=>({id:t.id,name:t.code+' · '+t.title})),selected||tasks[0].id)+'<div class="span2" id="count-sheet"></div>'));
    const select=document.querySelector('#f-task_id');
    document.querySelector('label[for="f-task_id"]').textContent='Công việc được phân công *';
    const sync=()=>{
      const task=tasks.find(t=>t.id===select.value),lots=task.inspection.lots;
      document.querySelector('#count-sheet').innerHTML='<div class="notice">Nhập đầy đủ số đếm thực tế cho các dòng lô chưa kiểm. Số 0 là kết quả kiểm đếm hợp lệ.</div><div class="count-sheet-toolbar"><span>Tick Đạt nếu số đếm khớp số lượng ghi nhận.</span><button type="button" class="button small" id="count-all-matched">✓ Đạt tất cả</button></div><div class="table-wrap"><table><thead><tr><th>Lô / mặt hàng</th><th>Số lượng ghi nhận</th><th>Số đếm thực tế</th><th>Khớp số lượng</th></tr></thead><tbody>'+lots.map(l=>'<tr><td>'+esc(l.code)+'<br>'+esc(l.item_name)+'</td><td>'+esc(format(l.received_quantity))+'</td><td>'+(l.counted_quantity===null?'<input type="number" min="0" step="0.001" required data-count-lot="'+esc(l.id)+'" aria-label="Số đếm '+esc(l.code)+'">':esc(format(l.counted_quantity))+' · Đã ghi nhận')+'</td><td>'+(l.counted_quantity===null?'<label class="count-match-toggle"><input type="checkbox" data-count-match="'+esc(l.id)+'" aria-label="Đạt '+esc(l.code)+'"><span>Đạt</span></label>':'—')+'</td></tr>').join('')+'</tbody></table></div>';
      const inputs=[...document.querySelectorAll('[data-count-lot]')];
      const all=document.querySelector('#count-all-matched');all.disabled=!inputs.length;
      for(const input of inputs){
        const lot=lots.find(l=>String(l.id)===input.dataset.countLot),tick=document.querySelector('[data-count-match="'+CSS.escape(input.dataset.countLot)+'"]');
        input.addEventListener('input',()=>{const value=input.value.replace(',','.');tick.checked=/^\d+(\.\d+)?$/.test(value)&&Number(value)===Number(lot.received_quantity);});
        tick.onchange=()=>{input.value=tick.checked?numericInputValue(lot.received_quantity):'';input.dispatchEvent(new Event('input',{bubbles:true}));};
      }
      all.onclick=()=>{for(const input of inputs){input.value=numericInputValue(lots.find(l=>String(l.id)===input.dataset.countLot).received_quantity);input.dispatchEvent(new Event('input',{bubbles:true}));}};
      bindForm(()=>({version:task.version,count_lines:[...document.querySelectorAll('[data-count-lot]')].map(i=>({lot_id:i.dataset.countLot,counted_quantity:i.value}))}),'tasks/'+task.id+'/progress');
    };
    select.onchange=sync;sync();
  }
  createForm=async function(){
    if(current==='inspection-counts'){
      try{const rows=(await api('inspection-counts?per_page=100')).data.filter(t=>t.actions.includes('recordCount'));if(!rows.length){toast('Chưa có công việc đã bắt đầu cần nhập số đếm.');return;}countForm(rows);}
      catch(e){openModal('Không thể mở bảng kiểm kê',errorHTML(e));}return;
    }
    await previousCreate();if(current==='stocktakes')mountAuthor();
  };
  editForm=async function(r){await previousEdit(r);if(current==='tasks'&&r.task_type==='LOT_INSPECTION')mountAuthor(r.minute_author_id);};
  actionForm=async function(r,action){
    if(action==='recordCount'){countForm([r],r.id);return;}
    if(action==='assignMinuteAuthor'){
      const users=(await options('users')).filter(u=>r.assignee_ids.map(String).includes(String(u.id)));
      openModal('Phân công người lập biên bản chung',formWrap(inputField('minute_author_id','select',true,users,r.minute_author_id||'')+'<p class="span2">Người được chọn lập một biên bản tổng hợp cả kết quả QC/AC và số đếm kiểm kê.</p>'));
      document.querySelector('label[for="f-minute_author_id"]').textContent='Nhân viên lập biên bản *';
      bindForm(d=>({...d,version:r.version}),'tasks/'+r.id+'/minute-author');return;
    }
    return previousAction(r,action);
  };
  detail=function(r){
    if(current==='exception-proposals'&&(r.actions||[]).includes('handleMinuteException'))return actionForm(r,'handleMinuteException');
    const assign=(r.actions||[]).includes('assignMinuteAuthor');
    const result=previousDetail(assign?{...r,actions:r.actions.filter(a=>a!=='assignMinuteAuthor')}:r);
    if(assign){const button=document.createElement('button');button.className='button';button.textContent='Phân công người lập biên bản';button.onclick=()=>actionForm(r,'assignMinuteAuthor');document.querySelector('#modal-body .form-actions')?.append(button);}
    return result;
  };
})();
