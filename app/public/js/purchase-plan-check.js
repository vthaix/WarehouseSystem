(()=>{
 const previousLoad=loadTable,previousAction=actionForm,previousCreate=createForm;
 let panelVersion=0;
 const suggestedQuantity=l=>{const cap=l.remaining_quantity??l.planned_quantity;return l.counted_quantity!=null&&Number(l.counted_quantity)<Number(cap)?l.counted_quantity:cap;};
 const needsWork=(c,data,resource)=>resource==='lots'
  ?has(['WAREHOUSE_MANAGER'])&&['COMPLETED','CLOSED'].includes(c.status)&&data.lines.some(l=>!l.lot_id&&Number(l.passed_quantity)>0)
  :c.status==='IN_PROGRESS'&&(c.assignee_ids||[]).map(String).includes(String(user.id))&&(resource==='inspection-counts'?data.can_count&&data.lines.some(l=>l.counted_quantity===null):data.can_quality&&data.lines.some(l=>l.received_quantity===null));
 async function planSources(resource){
  const rows=(await api('quality-campaigns?per_page=100')).data.filter(c=>c.KiemTheoKeHoach&&['IN_PROGRESS','COMPLETED','CLOSED'].includes(c.status));
  const unique=[...new Map(rows.map(c=>[String(c.id),c])).values()];
  const checked=await Promise.all(unique.map(async c=>{const data=(await api('quality-campaigns/'+c.id+'/purchase-check')).data;return needsWork(c,data,resource)?c:null;}));
  return checked.filter(Boolean);
 }
 async function sheet(campaign,requestedKind){
  const data=(await api('quality-campaigns/'+campaign.id+'/purchase-check')).data;
  if(has(['WAREHOUSE_MANAGER'])){
   openModal('Kết quả kiểm tra · '+data.code,formWrap('<div class="span2">'+tableData(data.lines)+'</div>'));
   const submit=document.querySelector('#data-form [type=submit]');submit.textContent='Tạo lô phần đạt';submit.disabled=!['COMPLETED','CLOSED'].includes(data.status)||!data.lines.some(l=>!l.lot_id&&Number(l.passed_quantity)>0);if(submit.disabled)submit.textContent=data.lines.some(l=>l.lot_id)?'Lô phần đạt đã được tạo':'Chưa đủ kết quả để tạo lô';bindForm(d=>({...d,version:data.version}),'quality-campaigns/'+data.id+'/material-lots');return;
  }
  const kind=requestedKind||(current==='inspection-counts'?'COUNT':has(['QC_INSPECTOR'])&&data.can_quality?'QUALITY':'COUNT');
  const lines=data.lines.filter(l=>kind==='QUALITY'?l.received_quantity===null:l.counted_quantity===null);
  if(!lines.length){openModal('Kết quả đã ghi nhận',tableData(data.lines));return;}
  openModal((kind==='QUALITY'?'Kiểm tra chất lượng':'Kiểm đếm')+' theo kế hoạch · '+data.code,formWrap(data.lines.map(l=>'<section class="span2 form-section" data-plan-line="'+esc(l.purchase_order_line_id)+'"><h3>'+esc(l.item_name)+'</h3><p>Theo đơn mua: '+esc(format(l.planned_quantity))+' '+esc(l.unit)+'</p>'+(kind==='QUALITY'?'<div class="form-grid">'+[['received_quantity','Thực kiểm'],['passed_quantity','Đạt'],['failed_quantity','Lỗi']].map(([key,label])=>'<div class="field"><label>'+label+'</label><input type="number" min="0" step="0.001" required data-check-key="'+key+'" value="'+esc(l[key]??(key==='failed_quantity'?'0':suggestedQuantity(l)))+'"></div>').join('')+'<div class="field span2"><label>Mô tả lỗi / chênh lệch</label><textarea data-check-key="issue">'+esc(l.issue||'')+'</textarea></div></div>':'<label>Số đếm thực tế</label><input type="number" min="0" step="0.001" required data-check-key="counted_quantity" value="'+esc(l.counted_quantity??l.remaining_quantity??l.planned_quantity)+'">')+'</section>').join('')));
  if(kind==='QUALITY')for(const row of document.querySelectorAll('[data-plan-line]')){wireQcQuantities(row,'[data-check-key=received_quantity]','[data-check-key=passed_quantity]','[data-check-key=failed_quantity]');const line=data.lines.find(l=>l.purchase_order_line_id===row.dataset.planLine);row.querySelector('p').insertAdjacentHTML('afterend','<div class="form-grid"><div class="field"><label>Ngày sản xuất trên hàng nhận *</label><input type="date" required max="'+calendarToday()+'" data-check-key="manufactured_date" value="'+esc(line.manufactured_date||calendarToday())+'"></div><div class="field"><label>Hạn dùng theo NCC · '+esc(line.shelf_life_days??'Chưa cấu hình')+' ngày</label><input type="date" readonly data-life-expiry value="'+esc(line.expiry_date||'')+'"></div></div>');const input=row.querySelector('[data-check-key="manufactured_date"]');input.onchange=()=>{const date=new Date(input.value+'T00:00:00Z');if(Number.isFinite(+date)&&line.shelf_life_days){date.setUTCDate(date.getUTCDate()+Number(line.shelf_life_days));row.querySelector('[data-life-expiry]').value=date.toISOString().slice(0,10);}};}
  bindForm(()=>({version:data.version,kind,lines:[...document.querySelectorAll('[data-plan-line]')].map(row=>({purchase_order_line_id:row.dataset.planLine,...Object.fromEntries([...row.querySelectorAll('[data-check-key]')].map(el=>[el.dataset.checkKey,el.value]))}))}),'quality-campaigns/'+data.id+'/purchase-check');
 }
 async function panel(){
  if(!['qc-inspections','inspection-counts','lots'].includes(current))return;
  const resource=current,version=++panelVersion,rows=await planSources(resource);if(current!==resource||version!==panelVersion)return;
  let section=document.querySelector('#purchase-plan-checks');if(section)section.remove();if(!rows.length)return;section=document.createElement('section');section.id='purchase-plan-checks';section.className='purchase-ready';section.innerHTML='<h2>'+(resource==='lots'?'Kết quả kiểm tra chờ tạo lô':resource==='inspection-counts'?'Đợt chờ kiểm kê':'Đợt chờ kiểm tra chất lượng')+'</h2>';
  for(const c of rows){const b=document.createElement('button');b.type='button';b.className='button';b.dataset.pendingResource=has(['WAREHOUSE_MANAGER'])?'purchase-checks':current;b.dataset.pendingId=String(c.id);b.textContent=c.code+' · '+(resource==='lots'?'Chờ tạo lô':(labels[c.status]||c.status));b.onclick=()=>sheet(c).catch(e=>toast(e.message));section.append(b);}document.querySelector('#content').prepend(section);
 }
 loadTable=async function(){await previousLoad();await panel();};
 createForm=async function(...args){
  if(current==='lots'&&isMysql&&has(['WAREHOUSE_MANAGER'])){
   const rows=await planSources('lots');
   if(!rows.length){openModal('Tạo lô hàng','<div class="empty">Không có kết quả kiểm tra chờ tạo lô.</div>');return;}
   openModal('Tạo lô hàng',formWrap(inputField('campaign_id','select',true,[{id:'',name:'Chọn chứng từ kiểm tra'},...rows.map(c=>({id:c.id,name:(c.source_code?c.source_code+' · ':'')+c.code}))])));
   document.querySelector('label[for=f-campaign_id]').textContent='Chứng từ kiểm tra *';
   const form=document.querySelector('#data-form');form.querySelector('[type=submit]').textContent='Tiếp tục';form.querySelector('#cancel').onclick=()=>modal.close();
   form.onsubmit=async e=>{e.preventDefault();const selected=rows.find(c=>String(c.id)===form.querySelector('#f-campaign_id').value);if(selected)try{await sheet(selected);}catch(error){toast(error.message);}};return;
  }
  if(!['qc-inspections','inspection-counts'].includes(current)||!isMysql)return previousCreate(...args);
  const counting=current==='inspection-counts',flag=counting?'KiemSoLuong':'KiemChatLuong';
  const ready=await planSources(current),readyIds=new Set(ready.map(c=>String(c.id)));
  const lots=counting?[]:await options('lots');
  const tasks=counting?(await api('inspection-counts?per_page=100')).data:[];
  const campaigns=(await api('quality-campaigns?per_page=100&status=IN_PROGRESS')).data.filter(c=>c.campaign_type==='QUALITY_CHECK'&&c.status==='IN_PROGRESS'&&(c.assignee_ids||[]).map(String).includes(String(user.id))&&c[flag]!==false&&c[flag]!==0&&(c.KiemTheoKeHoach?readyIds.has(String(c.id)):counting?tasks.some(t=>String(t.inspection?.id)===String(c.id)&&(t.actions||[]).includes('recordCount')):lots.some(l=>(c.lot_ids||[]).map(String).includes(String(l.id))&&l.qc_status==='PENDING')));
  if(!campaigns.length){openModal(counting?'Ghi kết quả kiểm kê':'Ghi kết quả QA/QC','<div class="empty">Không có đợt chờ thực hiện.</div>');return;}
  openModal(counting?'Chọn đối tượng kiểm kê':'Chọn đối tượng kiểm tra QA/QC',formWrap(inputField('campaign_id','select',true,[{id:'',name:'Chọn đợt kiểm tra'},...campaigns.map(c=>({id:c.id,name:c.code+(c.location?' · '+c.location:'')}))])+inputField('qc_source_id','select',true,[])));
  const form=document.querySelector('#data-form');form.querySelector('[type=submit]').textContent='Tiếp tục';
  form.querySelector('#cancel').onclick=()=>modal.close();
  const source=form.querySelector('#f-qc_source_id'),next=form.querySelector('[type=submit]');
  const sync=()=>{
   const selected=campaigns.find(c=>String(c.id)===form.querySelector('#f-campaign_id').value);
   form.querySelector('label[for=f-qc_source_id]').textContent=selected?.KiemTheoKeHoach?'Kế hoạch mua nguyên vật liệu *':'Dòng lô *';
   const rows=!selected?[]:selected.KiemTheoKeHoach?[{id:String(selected.source_plan_id||selected.id),name:selected.source_code||selected.code}]:counting?[{id:String(selected.id),name:selected.source_code||'Các lô được phân công'}]:lots.filter(l=>(selected.lot_ids||[]).map(String).includes(String(l.id))&&l.qc_status==='PENDING');
   if(counting&&!selected?.KiemTheoKeHoach)form.querySelector('label[for=f-qc_source_id]').textContent='Lô kiểm kê *';
   source.innerHTML='<option value="">'+(selected?.KiemTheoKeHoach?'Chọn kế hoạch mua':'Chọn dòng lô')+'</option>'+rows.map(l=>'<option value="'+esc(l.id)+'">'+esc(optionLabel(l))+'</option>').join('');
   source.disabled=!selected||!rows.length;next.disabled=!selected||!rows.length;
  };
  form.querySelector('#f-campaign_id').onchange=sync;sync();
  form.onsubmit=async event=>{event.preventDefault();const selected=campaigns.find(c=>String(c.id)===form.querySelector('#f-campaign_id').value),sourceId=source.value;if(!selected||!sourceId)return;try{if(selected.KiemTheoKeHoach)await sheet(selected,counting?'COUNT':'QUALITY');else if(counting){const tasks=(await api('inspection-counts?per_page=100')).data;const task=tasks.find(t=>String(t.inspection?.id)===String(selected.id)&&(t.actions||[]).includes('recordCount'));if(!task){toast('Không còn lô chờ kiểm kê trong đợt này.');return;}await previousAction(task,'recordCount');}else{await previousCreate(...args);const select=document.querySelector('#f-campaign_id');if(select){select.value=String(selected.id);select.dispatchEvent(new Event('change'));const lot=document.querySelector('#f-lot_id');if(lot){lot.value=sourceId;lot.dispatchEvent(new Event('change'));}}}}catch(e){toast(e.message);}};
 };
 actionForm=async function(r,action){if(['recordInspection','recordCount'].includes(action)&&r.inspection?.KiemTheoKeHoach)return sheet(r.inspection,action==='recordCount'?'COUNT':'QUALITY');return previousAction(r,action);};
 window.addEventListener('DOMContentLoaded',()=>{if(user)panel().catch(e=>toast(e.message));});
 window.addEventListener('focus',()=>{if(user)panel().catch(()=>{});});
 window.addEventListener('warehouse:pending-updated',()=>{if(user)panel().catch(()=>{});});
})();
