function inspectionExceptionFields(record={}){
  return '<div class="span2" id="minute-exception-fields">'+inputField('exception_mode','select',true,[{id:'NONE',name:'Không có ngoại lệ'},{id:'DESCRIBE',name:'Nhập mô tả ngoại lệ'}],record.exception_mode||'NONE')+inputField('exception_description','textarea',false,[],record.exception_description||'')+'</div>';
}
function mountInspectionExceptionFields(){
  const mode=document.querySelector('#f-exception_mode'),description=document.querySelector('#f-exception_description');
  const sync=()=>{const enabled=!mode.disabled&&mode.value==='DESCRIBE';description.closest('.field').hidden=!enabled;description.disabled=!enabled;description.required=enabled;};
  mode.onchange=sync;sync();return sync;
}
(()=>{
  const previousEdit=editForm,previousAction=actionForm;
  editForm=async function(r){
    if(current!=='stocktake-minutes'||!String(r.id).startsWith('LOT-'))return previousEdit(r);
    openModal('Sửa biên bản kiểm tra lô',formWrap(inputField('remarks','textarea',true,[],r.remarks)+inspectionExceptionFields(r)));
    mountInspectionExceptionFields();bindForm(d=>({...d,version:r.version}),'stocktake-minutes/'+r.id,'PATCH');
  };
  actionForm=async function(r,action){
    if(action==='handleMinuteException'){
      const directed=['APPROVED','REJECTED'].includes(r.status),note=r.status==='REJECTED'?r.owner_instruction:r.resolution_note;
      openModal('Xử lý ngoại lệ từ biên bản',formWrap('<div class="span2 notice">'+esc(r.reason)+'</div>'+inputField('resolution_note','textarea',true,[],note||'')+'<div class="span2 field"><label class="completion-toggle"><input type="checkbox" id="request-owner-approval" '+(directed?'disabled':'')+'><span>Đề xuất xử lý và gửi chủ xưởng phê duyệt</span></label></div>'+inputField('workshop_id','select',false,[{id:'',name:'Chọn xưởng nhận đề xuất'},...(r.eligible_workshops||[])])));
      const checkbox=document.querySelector('#request-owner-approval'),workshop=document.querySelector('#f-workshop_id');
      if(r.minute_lines?.length)document.querySelector('#data-form .form-grid').insertAdjacentHTML('afterbegin','<div class="span2 table-wrap"><table><thead><tr><th>Lô / mặt hàng</th><th>Ghi nhận</th><th>Kiểm đếm</th><th>Chênh lệch</th><th>QC đạt / lỗi</th><th>Vấn đề QC</th></tr></thead><tbody>'+r.minute_lines.map(l=>'<tr><td>'+esc(l.lot_code)+'<br>'+esc(l.item_name)+'</td><td>'+esc(l.system_quantity)+'</td><td>'+esc(l.counted_quantity??'Không giao kiểm đếm')+'</td><td>'+esc(l.difference_quantity??'—')+'</td><td>'+esc(l.passed_quantity??'—')+' / '+esc(l.failed_quantity??'—')+'</td><td>'+esc(l.issue||'—')+'</td></tr>').join('')+'</tbody></table></div>');
      const sync=()=>{workshop.closest('.field').hidden=!checkbox.checked;workshop.disabled=!checkbox.checked;workshop.required=checkbox.checked;};checkbox.onchange=sync;sync();
      if(directed){document.querySelector('#f-resolution_note').readOnly=true;document.querySelector('label[for="f-resolution_note"]').textContent=r.status==='REJECTED'?'Phương án xử lý của chủ xưởng':'Phương án đã được phê duyệt';}
      document.querySelector('#data-form [type=submit]').textContent='Xác nhận';
      bindForm(d=>({...d,version:r.version,request_approval:checkbox.checked}),'exception-proposals/'+r.id+'/apply');return;
    }
    if(action==='reviewMinuteException'){
      openModal('Phê duyệt phương án xử lý ngoại lệ',formWrap('<div class="span2 notice">Ngoại lệ: '+esc(r.reason)+'<br>Đề xuất: '+esc(r.resolution_note)+'</div>'+inputField('decision','select',true,[{id:'APPROVE',name:'Đồng ý đề xuất'},{id:'REJECT',name:'Không đồng ý – chỉ định cách xử lý khác'}])+inputField('reason','textarea',false)));
      const sync=()=>{const rejected=document.querySelector('#f-decision').value==='REJECT';document.querySelector('#f-reason').required=rejected;document.querySelector('label[for="f-reason"]').textContent=rejected?'Phương án xử lý của chủ xưởng *':'Ý kiến phê duyệt (nếu có)';};document.querySelector('#f-decision').onchange=sync;sync();
      bindForm(d=>({...d,version:r.version}),'exception-proposals/'+r.id+'/review');return;
    }
    return previousAction(r,action);
  };
})();
