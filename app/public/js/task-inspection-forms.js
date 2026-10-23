async function createFinishedPartForm(record=null){
  const plans=(await options('production-plans')).filter(p=>['APPROVED','IN_PROGRESS'].includes(p.status)||String(p.id)===String(record?.production_plan_id));
  const items=(await options('items')).filter(i=>i.kind==='FINISHED_PRODUCT');
  const materialItems=(await options('items')).filter(i=>i.kind==='MATERIAL');
  openModal('Báo cáo thành phẩm từng phần',formWrap(inputField('production_plan_id','select',true,[{id:'',name:'Chọn kế hoạch sản xuất'},...plans])+inputField('completed_date','date',true,[],calendarToday())+inputField('note','textarea',false)+'<div class="span2 field"><label class="completion-toggle"><input type="checkbox" id="part-final"><span>Đây là đợt cuối, đã hoàn tất toàn bộ kế hoạch</span></label></div><div class="span2 notice">Mỗi báo cáo tạo một phần trong cùng lô thành phẩm của KHSX. Gửi báo cáo để phần này xuất hiện trong Công việc. QC và nhập kho theo từng phần; báo cáo tiến độ không tạo phần lô.</div><div id="part-output-editor" class="span2"></div>'));
  document.querySelector('label[for="f-completed_date"]').textContent='Ngày hoàn thành phần này *';
  let seq=0,ready=false,refresh=()=>{};
  const qty=v=>{const s=String(v??'0');if(!/^\d{1,12}(\.\d{1,3})?$/.test(s))return null;const [a,b='']=s.split('.');return BigInt(a)*1000n+BigInt(b.padEnd(3,'0'));};
  const decimal=v=>{const sign=v<0n?'-':'';v=v<0n?-v:v;return sign+(v/1000n)+'.'+String(v%1000n).padStart(3,'0');};
  const total=(rows,id,key='quantity')=>(rows||[]).filter(r=>String(r.item_id)===String(id)).reduce((n,r)=>n+(qty(r[key])??0n),0n);
  const final=document.querySelector('#part-final');final.disabled=true;
  document.querySelector('#f-production_plan_id').onchange=async()=>{
    const token=++seq,id=document.querySelector('#f-production_plan_id').value;
    ready=false;final.disabled=true;final.checked=false;document.querySelector('#part-output-editor').innerHTML='';if(!id)return;
    try{
      const plan=(await api('production-plans/'+id)).data;if(token!==seq)return;
      const allowed=items.filter(i=>plan.outputs.some(o=>String(o.item_id)===String(i.id)));
      const progress=plan.finished_report_progress||{},remaining=new Map();
      for(const o of plan.outputs){const used=total(progress.reported_outputs,o.item_id)-total(record?.outputs,o.item_id);remaining.set(String(o.item_id),(qty(o.quantity)??0n)-used);}
      const initial=plan.outputs.filter(o=>(remaining.get(String(o.item_id))||0n)>0n||record?.outputs.some(r=>String(r.item_id)===String(o.item_id))).map(o=>({item_id:String(o.item_id),quantity:decimal(total(record?.outputs,o.item_id)),lot_code:record?.outputs.find(r=>String(r.item_id)===String(o.item_id))?.lot_code||'TP-PHAN-'+crypto.randomUUID().slice(0,18),manufactured_date:record?.outputs.find(r=>String(r.item_id)===String(o.item_id))?.manufactured_date||calendarToday(),expiry_date:record?.outputs.find(r=>String(r.item_id)===String(o.item_id))?.expiry_date||''}));
      const editor=lineEditor('Thành phẩm của phần này',allowed,'outputs',['quantity','lot_code','manufactured_date','expiry_date'],initial);
      const materialRows=(progress.issued_materials||[]).map(m=>({item_id:String(m.item_id),used_quantity:decimal(total(record?.materials,m.item_id,'used_quantity'))}));
      for(const m of record?.materials||[])if(!materialRows.some(r=>r.item_id===String(m.item_id)))materialRows.push({item_id:String(m.item_id),used_quantity:m.used_quantity});
      const materials=lineEditor('Đối chiếu NVL thực tế sử dụng',materialItems,'materials',['used_quantity'],materialRows);
      document.querySelector('#part-output-editor').innerHTML=editor.html+materials.html;editor.mount();materials.mount();
      if(!initial.length)document.querySelector('#outputs-rows').innerHTML='';
      if(!materialRows.length)document.querySelector('#materials-rows').innerHTML='<p>Chưa có phiếu xuất NVL đã ghi sổ cho kế hoạch này.</p>';
      document.querySelector('#add-outputs').remove();document.querySelector('#add-materials').remove();
      const rows=[...document.querySelectorAll('#outputs-rows .line-row')],materialInputs=[];
      for(const row of rows){
        row.classList.add('finished-output-row');row.querySelector('button').remove();row.querySelector('[data-key="item_id"]').disabled=true;
        const input=row.querySelector('[data-key="quantity"]'),itemId=row.querySelector('[data-key="item_id"]').value,max=remaining.get(itemId)??0n;
        input.min='0';input.max=decimal(max<0n?0n:max);
        input.parentElement.insertAdjacentHTML('afterend','<div><label>Còn lại</label><input type="text" data-remaining readonly aria-label="Còn lại"></div>');
        const info=document.createElement('small');info.className='quantity-context';info.textContent='Kế hoạch: '+format(plan.outputs.find(o=>String(o.item_id)===itemId)?.quantity)+' · Đã báo cáo: '+format(decimal(total(progress.reported_outputs,itemId)-total(record?.outputs,itemId)));input.parentElement.append(info);
      }
      for(const row of document.querySelectorAll('#materials-rows .line-row')){
        row.classList.add('finished-material-row');row.querySelector('button').remove();row.querySelector('[data-key="item_id"]').disabled=true;
        const itemId=row.querySelector('[data-key="item_id"]').value,input=row.querySelector('[data-key="used_quantity"]');
        const issued=total(progress.issued_materials,itemId),prior=total(progress.reported_materials,itemId)-total(record?.materials,itemId,'used_quantity'),available=issued-prior;
        input.max=decimal(available<0n?0n:available);input.min='0';
        row.insertAdjacentHTML('beforeend','<div><label>Đã xuất cho xưởng</label><input type="text" readonly value="'+esc(format(decimal(issued)))+'"></div><div><label>Đã báo cáo dùng trước</label><input type="text" readonly value="'+esc(format(decimal(prior)))+'"></div><div><label>Chưa dùng / cần đối chiếu trả kho</label><input type="text" data-material-rest readonly></div>');
        materialInputs.push({input,available,row,touched:Boolean(record?.materials.some(m=>String(m.item_id)===itemId))});
        input.oninput=()=>{materialInputs.find(m=>m.input===input).touched=true;refresh();};
      }
      const fillMaterials=()=>{for(const m of materialInputs)if(!m.touched)m.input.value=decimal(m.available<0n?0n:m.available);};
      refresh=()=>{
        let complete=rows.length>0;
        for(const row of rows){const input=row.querySelector('[data-key="quantity"]'),n=qty(input.value),max=remaining.get(row.querySelector('[data-key="item_id"]').value)??0n;row.querySelector('[data-remaining]').value=n===null?'':format(decimal(max-n));input.setCustomValidity(n===null?'Nhập số lượng hợp lệ, tối đa 3 chữ số thập phân.':n>max?'Số lượng vượt phần còn lại của kế hoạch.':'');if(n===null||max-n!==0n)complete=false;}
        const previous=final.checked;final.checked=complete;if(complete&&!previous)fillMaterials();
        for(const m of materialInputs){const n=qty(m.input.value);m.row.querySelector('[data-material-rest]').value=n===null?'':format(decimal(m.available-n));m.input.setCustomValidity(n===null?'Nhập số lượng hợp lệ.':n>m.available?'Lượng dùng vượt lượng NVL chưa quyết toán.':'');}
      };
      for(const row of rows)row.querySelector('[data-key="quantity"]').oninput=refresh;
      final.onchange=()=>{if(final.checked){for(const row of rows){const itemId=row.querySelector('[data-key="item_id"]').value;row.querySelector('[data-key="quantity"]').value=decimal(remaining.get(itemId)??0n);}fillMaterials();}refresh();};
      document.querySelector('#materials-rows').insertAdjacentHTML('afterend','<p class="material-reconciliation-note">Đợt cuối gợi ý dùng phần NVL đã xuất chưa được báo cáo. Hãy sửa theo thực tế; phần dư cần lập chứng từ nhập trả riêng, báo cáo này không tự cộng lại tồn kho.</p>');
      ready=true;final.disabled=!rows.length;refresh();
    }catch(e){document.querySelector('#form-error').innerHTML=errorHTML(e);}
  };
  bindForm(d=>{if(!ready)throw Error('Chọn kế hoạch và chờ dữ liệu đối chiếu tải xong.');refresh();const outputs=readLines('outputs').filter(l=>(qty(l.quantity)??0n)>0n);if(!outputs.length)throw Error('Nhập ít nhất một thành phẩm có số lượng lớn hơn 0.');return {...d,...(record?{version:record.version}:{report_mode:'PART'}),production_completed:final.checked,outputs,materials:readLines('materials').filter(l=>(qty(l.used_quantity)??0n)>0n)};}, record?'finished-reports/'+record.id:'finished-reports',record?'PATCH':'POST');
  if(record){
    document.querySelector('#f-note').value=record.note||'';document.querySelector('#f-completed_date').value=record.completed_date;document.querySelector('#part-final').checked=Boolean(record.production_completed);
    const select=document.querySelector('#f-production_plan_id');select.value=record.production_plan_id;select.disabled=true;await select.onchange();
  }
}
(()=>{
  const previousCreate=createForm,previousAction=actionForm;
  createForm=async function(){
    if(current==='tasks')return;
    if(!isMysql||current!=='stocktakes')return previousCreate();
    try{
      const sources=(await api('task-inspection-sources')).data,users=await options('users');
      openModal('Lập đợt kiểm kê',formWrap(inputField('inspection_type','select',true,[{id:'FINISHED_PRODUCT',name:'Thành phẩm'},{id:'MATERIAL',name:'Nguyên vật liệu'}])+'<div class="field"><label for="inspection-lot">Lô hàng *</label><select id="inspection-lot" required></select></div><div class="span2" id="inspection-parts"></div>'+inputField('title')+inputField('priority','select',true,['NORMAL','HIGH','LOW'])+inputField('start_at','datetime-local')+inputField('end_at','datetime-local')+inputField('location','text',true,[],'Khu kiểm tra lô hàng')+employeePicker(users)+'<div class="span2 notice">Ban kiểm kê kiểm số lượng; QC/AC kiểm chất lượng. Chọn cả hai bộ phận để thực hiện cả hai nội dung trong cùng đợt.</div>'+inputField('description','textarea',false)));
      document.querySelector('label[for="f-inspection_type"]').textContent='Nhóm hàng *';
      document.querySelector('label[for="f-title"]').textContent='Tên đợt kiểm kê *';
      const kind=()=>document.querySelector('#f-inspection_type').value;
      const selectedParts=()=>[...document.querySelectorAll('[data-finished-part]:checked')].map(i=>i.value);
      const group=()=> (kind()==='FINISHED_PRODUCT'?sources.finished_lots:sources.material_lots).find(g=>g.id===document.querySelector('#inspection-lot').value);
      const dates=()=>{
        const g=group();const day=kind()==='MATERIAL'?g?.expected_date:g?.parts.filter(p=>selectedParts().includes(p.id)).map(p=>p.expected_date).sort().at(-1);
        const value=[day||calendarToday(),calendarToday()].sort().at(-1);
        const start=document.querySelector('#f-start_at'),end=document.querySelector('#f-end_at');start.min=value+'T00:00';start.value=value+'T08:00';end.min=start.value;end.value=value+'T09:00';
      };
      const showParts=()=>{
        const g=group();document.querySelector('#inspection-parts').innerHTML=kind()==='FINISHED_PRODUCT'?'<div class="form-section"><h3>Các phần của lô theo báo cáo thành phẩm</h3>'+((g?.parts||[]).map(p=>'<label class="employee-profile"><input type="checkbox" data-finished-part value="'+esc(p.id)+'"><span><strong>'+esc(p.code)+'</strong><small>'+esc(p.lines.map(l=>l.item_name+': '+l.quantity).join(' · '))+' · '+esc(format(p.expected_date))+'</small></span></label>').join('')||'<p>Chưa có báo cáo thành phẩm đã gửi còn phần chờ kiểm tra trong lô này.</p>')+'</div>':'<div class="notice">Lô NVL được đối chiếu từ kế hoạch mua đã duyệt. '+esc(g?.expected_date?format(g.expected_date):'')+'</div>';
        document.querySelectorAll('[data-finished-part]').forEach(i=>{
          const part=g?.parts.find(p=>p.id===i.value);i.disabled=part?.available===false;
          if(i.disabled)i.closest('label').querySelector('small').insertAdjacentText('beforeend',' · Đã giao kiểm tra / đã có kết quả');
          i.onchange=dates;
        });
        if(kind()==='MATERIAL'){
          const eligible=g?.eligible_lots||[];
          document.querySelector('#inspection-parts').insertAdjacentHTML('beforeend','<div class="form-section"><h3>Chọn phần lô NVL đã nhận</h3><p class="material-reconciliation-note">Chỉ chọn các đợt đã ghi nhận thuộc đúng nguồn; không gộp số lượng cả lô tổng.</p>'+(eligible.length?'<div class="field"><label for="inspection-material-lots">Phần lô đang chờ QC *</label><select id="inspection-material-lots" multiple size="6" required>'+eligible.map(l=>'<option value="'+esc(l.id)+'">'+esc(l.name)+'</option>').join('')+'</select><small>Giữ Ctrl (hoặc Command) để chọn nhiều phần lô.</small></div>':'<div class="notice">Chưa có phần lô NVL thực tế chờ kiểm tra. Bạn vẫn có thể lập đợt dự kiến; khi hàng được ghi nhận, chọn bổ sung phần lô trong chi tiết công việc.</div>')+'</div>');
        }
        document.querySelector('#f-title').value=(kind()==='MATERIAL'?'Kiểm tra NVL ':'Kiểm tra thành phẩm ')+(g?.code||'');dates();
      };
      const sync=()=>{document.querySelector('#inspection-lot').innerHTML=(kind()==='FINISHED_PRODUCT'?sources.finished_lots:sources.material_lots).map(g=>'<option value="'+esc(g.id)+'">'+esc(g.code)+'</option>').join('');showParts();};
      document.querySelector('#f-inspection_type').onchange=sync;document.querySelector('#inspection-lot').onchange=showParts;
      document.querySelector('#f-start_at').onchange=()=>document.querySelector('#f-end_at').min=document.querySelector('#f-start_at').value;
      bindForm(d=>{const g=group();if(!g)throw Error('Chưa có lô phù hợp để kiểm tra.');const ids=selectedParts();if(kind()==='FINISHED_PRODUCT'&&!ids.length)throw Error('Chọn ít nhất một phần theo báo cáo thành phẩm.');const materialIds=[...document.querySelector('#inspection-material-lots')?.selectedOptions||[]].map(o=>o.value);if(kind()==='MATERIAL'&&g.eligible_lots?.length&&!materialIds.length)throw Error('Chọn ít nhất một phần lô NVL đã nhận.');return {...d,start_at:new Date(d.start_at+'+07:00').toISOString(),end_at:new Date(d.end_at+'+07:00').toISOString(),assignee_ids:selectedEmployees(),...(kind()==='FINISHED_PRODUCT'?{lot_header_id:g.id,finished_report_ids:ids}:{material_source:g.id,material_lot_ids:materialIds})};},'tasks');sync();
    }catch(e){openModal('Không thể lập đợt kiểm kê',errorHTML(e));}
  };
  actionForm=async function(r,action){
    if(action==='recordCount'){
      const lots=r.inspection.lots.filter(l=>l.counted_quantity===null);
      openModal('Ghi số lượng kiểm đếm',formWrap(inputField('lot_id','select',true,lots.map(l=>({id:l.id,name:l.code+' / '+l.item_name+' / Số lượng ghi nhận: '+l.received_quantity})))+inputField('counted_quantity','number',true)));
      bindForm(d=>({version:r.version,count_lines:[{lot_id:d.lot_id,counted_quantity:d.counted_quantity}]}),'tasks/'+r.id+'/progress');return;
    }
    if(current==='finished-reports'&&action==='edit'&&r.report_mode==='PART')return createFinishedPartForm(r);
    if(action==='bindInspection')return previousAction(r.inspection,'bindLots');
    if(action==='startInspection'||(current==='stocktakes'&&action==='start'&&r.campaign_type==='QUALITY_CHECK')){
      const campaign=r.inspection||r;
      openModal('Bắt đầu đợt kiểm kê',formWrap('<p class="span2">Xác nhận bắt đầu đợt '+esc(r.title||r.code)+'?</p>'));
      document.querySelector('#data-form .form-actions').insertAdjacentHTML('afterbegin','<label class="simulation-toggle" title="Cho phép bắt đầu trước ngày nhận dự kiến. Vẫn yêu cầu lô thực tế và đúng quyền."><input type="checkbox" id="simulate-early-start"><span>Giả lập thử nghiệm<small>Cho phép bắt đầu sớm</small></span></label>');
      bindForm(()=>({version:campaign.version,simulate_early_start:document.querySelector('#simulate-early-start').checked}),'quality-campaigns/'+campaign.id+'/start');return;
    }
    if(action==='recordInspection'){
      const lots=r.inspection.lots.filter(l=>l.qc_status==='PENDING');
      openModal('Ghi kết quả theo phần được giao',formWrap(inputField('lot_id','select',true,lots.map(l=>({id:l.id,name:(l.lot_header_code||'')+' / '+l.code+' / '+l.item_name+' / '+l.received_quantity})))+inputField('inspected_at','datetime-local',true,[],localInput(new Date().toISOString()))+inputField('inspected_quantity','number')+inputField('passed_quantity','number')+inputField('failed_quantity','number',true,[],'0')+inputField('issue','textarea',false)));
      const fill=()=>{const l=lots.find(l=>l.id===document.querySelector('#f-lot_id').value);document.querySelector('#f-inspected_quantity').value=numericInputValue(l?.received_quantity||'');document.querySelector('#f-passed_quantity').value=numericInputValue(l?.received_quantity||'');};
      document.querySelector('#f-lot_id').onchange=fill;fill();
      bindForm(d=>({campaign_id:String(r.stocktake_id),inspected_at:new Date(d.inspected_at+'+07:00').toISOString(),lines:[{lot_id:d.lot_id,inspected_quantity:d.inspected_quantity,passed_quantity:d.passed_quantity,failed_quantity:d.failed_quantity,issue:d.issue}]}),'qc-inspections');return;
    }
    return previousAction(r,action);
  };
})();
