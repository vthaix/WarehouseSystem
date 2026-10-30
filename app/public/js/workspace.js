/* Shared interaction layer: preserve live form DOM, not HTML snapshots. */
(() => {
 const history=[];
 const baseOpen=openModal;
 function remember(){
  const fragment=document.createDocumentFragment();
  const entry={fragment,scroll:modal.scrollTop,focus:document.activeElement};
  while(modalBody.firstChild)fragment.append(modalBody.firstChild);
  history.push(entry);
 }
 function back(){
  const entry=history.pop();if(!entry){modal.close();return;}
  modalBody.replaceChildren(entry.fragment);modal.scrollTop=entry.scroll;
  if(entry.focus?.isConnected)entry.focus.focus({preventScroll:true});
  enhanceModal();
 }
 function enhanceModal(){
  const head=modalBody.querySelector('.dialog-head');
  if(head&&!head.querySelector('[data-modal-back]')&&history.length){
   const b=document.createElement('button');b.type='button';b.className='button small modal-back';b.dataset.modalBack='';b.textContent='← Quay lại';b.onclick=back;head.prepend(b);
  }
  modalBody.querySelectorAll('.form-section').forEach(section=>{
   if(section.matches('[data-ux-collapsed],details')||section.closest('details'))return;
   const title=section.querySelector(':scope > h3');
   if(!title||!/(lịch sử|chứng từ liên quan|phiếu liên quan|nguồn tham chiếu|thông tin bổ sung|kết quả tái kiểm)/i.test(title.textContent))return;
   const details=document.createElement('details');details.className='disclosure form-section';
   const summary=document.createElement('summary');summary.textContent=title.textContent;details.append(summary);title.remove();
   section.before(details);while(section.firstChild)details.append(section.firstChild);section.remove();
  });
  if(!['production-reports','finished-reports'].includes(current))modalBody.querySelectorAll('form .field').forEach(field=>{
   if(field.closest('details'))return;
   const input=field.querySelector('textarea[name="note"],textarea[name="description"]');
   if(!input||input.required)return;
   const block=document.createElement('details');block.className='disclosure span2';
   const summary=document.createElement('summary');summary.textContent=field.querySelector('label')?.textContent||'Ghi chú bổ sung';block.append(summary);field.before(block);block.append(field);
   if(input.value.trim())block.open=true;
  });
 }
 openModal=function(title,html){
  if(modal.open)remember();else history.length=0;
  baseOpen(title,html);modal.scrollTop=0;enhanceModal();
  requestAnimationFrame(()=>modalBody.querySelector('h2')?.focus({preventScroll:true}));
 };
 modal.addEventListener('cancel',event=>{if(history.length){event.preventDefault();back();}});
 modal.addEventListener('close',()=>{history.length=0;});
 modal.addEventListener('invalid',event=>{let parent=event.target.parentElement;while(parent&&parent!==modal){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}},true);
 modal.addEventListener('click',event=>{
  if(event.target.closest('#cancel')&&history.length){event.preventDefault();event.stopImmediatePropagation();back();}
 },true);
 new MutationObserver(enhanceModal).observe(modalBody,{childList:true,subtree:true});

 let updates=[],loading=false;
 const resources=new Set(['production-plans','business-plans','purchase-orders','customer-orders','production-reports','finished-reports','stock-requests','tasks','qc-inspections']);
 const unread=(resource,id)=>updates.some(n=>n.resource_type===resource&&String(n.resource_id)===String(id));
 function decorate(){
  const table=document.querySelector('#table');if(!table)return;
  if(current==='items'){
   const nameIndex=columnsFor(current).findIndex(c=>c[0]==='name');
   table.querySelectorAll('tbody tr').forEach((row,i)=>{const r=cached[i],cell=row.cells[nameIndex];if(!cell||!r?.image_path||cell.querySelector('.item-thumb'))return;const img=document.createElement('img');img.src=r.image_path;img.alt=r.name;img.className='item-thumb';img.loading='lazy';cell.prepend(img);});
  }
  if(!resources.has(current))return;
  table.querySelectorAll('tbody tr').forEach((row,i)=>{
   const record=cached[i];if(!record)return;
   row.classList.toggle('record-unread',unread(current,record.id));
   let marker=row.querySelector('.record-freshness');
   const text=unread(current,record.id)?'Chưa xem':(page===1&&i===0?'Mới nhất':'');
   if(!text){marker?.remove();return;}
   if(!marker){marker=document.createElement('span');marker.className='record-freshness';row.cells[0]?.append(marker);}
   if(marker.textContent!==text)marker.textContent=text;
  });
  document.querySelectorAll('[data-ready-plan]').forEach(el=>el.classList.toggle('record-unread',unread('business-plans',el.dataset.readyPlan)));
 }
 async function refresh(){
  if(!user||loading||document.hidden)return;loading=true;
  try{updates=(await api('workspace/updates')).data;decorate();}catch(e){/* Existing queues remain visible when updates cannot be loaded. */}finally{loading=false;}
 }
 const baseLoad=loadTable;
 loadTable=async function(){await baseLoad();decorate();};
 const baseDetail=detail;
 detail=function(record){
  baseDetail(record);
  if(!record.id||!resources.has(current))return;
  const resource=current;
  api('workspace/seen','POST',{resource_type:resource,resource_id:String(record.id)}).then(()=>{
   updates=updates.filter(n=>!(n.resource_type===resource&&String(n.resource_id)===String(record.id)));decorate();
  }).catch(()=>{});
 };
 async function orderFromPlan(id){
  await createForm();
  const select=document.querySelector('#f-business_plan_id');
  if(!select)return;
  if(![...select.options].some(o=>o.value===id)){toast('Kế hoạch này không còn chờ đặt mua. Vui lòng tải lại danh sách.');return;}
  select.value=id;await select.onchange?.();
  api('workspace/seen','POST',{resource_type:'business-plans',resource_id:id}).catch(()=>{});
 }
 window.addEventListener('DOMContentLoaded',()=>{
  if(!user)return;
  document.querySelectorAll('[data-order-plan]').forEach(button=>button.addEventListener('click',()=>orderFromPlan(button.dataset.orderPlan).catch(e=>toast(e.message))));
  const viewId=new URLSearchParams(location.search).get('view');
  if(viewId&&/^\d+$/.test(viewId))api(current+'/'+viewId).then(r=>detail(r.data)).catch(e=>toast(e.message));
  refresh();decorate();
 });
 window.addEventListener('focus',refresh);setInterval(refresh,20000);
 const parentApi=api;
 api=async function(path,method='GET',body,key){
  const result=await parentApi(path,method,body,key);
  if(path==='purchase-orders'&&method==='POST'&&body?.business_plan_id){
   document.querySelectorAll('[data-ready-plan]').forEach(row=>{if(row.dataset.readyPlan===String(body.business_plan_id))row.remove();});
   const count=document.querySelector('#purchase-ready-title .record-freshness');if(count)count.textContent=String(Math.max(0,Number(count.textContent)-1));
   const list=document.querySelector('.purchase-ready-list');if(list&&!list.children.length){const message=document.createElement('p');message.textContent='Đã xử lý các kế hoạch đang hiển thị. Tải lại trang để xem danh sách mới nhất.';list.append(message);}
  }
  return result;
 };

 // Images reuse the validated upload endpoint; IDs, versions and other form
 // builders remain owned by their existing modules.
 const baseCreate=createForm,baseEdit=editForm;
 function itemPhoto(record={}){
  const form=document.querySelector('#data-form');if(current!=='items'||!form)return;
  const section=document.createElement('div');section.className='field span2 item-photo-editor';
  section.innerHTML='<label for="item-photo">Ảnh mặt hàng</label><input id="item-photo" type="file" accept="image/png,image/jpeg,image/webp"><input type="hidden" name="image_path" value="'+esc(record.image_path||'')+'"><div class="item-photo-preview">'+(record.image_path?'<img src="'+esc(record.image_path)+'" alt="Ảnh mặt hàng">':'')+'</div><button type="button" class="button small" data-remove-photo>Bỏ ảnh</button><span class="hint">PNG, JPEG hoặc WebP · Tối đa 5 MB</span>';
  form.querySelector('.form-grid').append(section);
  const input=section.querySelector('input[type=file]'),hidden=section.querySelector('input[type=hidden]'),preview=section.querySelector('.item-photo-preview');
  let upload=null,invalid=false;
  input.onchange=()=>{
   const file=input.files[0];invalid=false;if(!file)return;
   if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){invalid=true;input.value='';toast('Chọn PNG, JPEG hoặc WebP tối đa 5 MB.');return;}
   upload=new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('Không đọc được ảnh.'));reader.onload=async()=>{try{const img=document.createElement('img');img.src=reader.result;img.alt='Ảnh mặt hàng đang chọn';preview.replaceChildren(img);const r=await api('category-images','POST',{data_url:reader.result});hidden.value=r.data.image_path;resolve();}catch(e){invalid=true;toast(e.message);reject(e);}};reader.readAsDataURL(file);});
   upload.catch(()=>{});
  };
  section.querySelector('[data-remove-photo]').onclick=()=>{if(upload){toast('Vui lòng chờ tải ảnh hoàn tất rồi bỏ ảnh.');return;}invalid=false;hidden.value='';input.value='';preview.replaceChildren();};
  const original=form.onsubmit;
  form.onsubmit=async event=>{event.preventDefault();try{if(upload){await upload;upload=null;}if(invalid)throw Error('Vui lòng chọn lại ảnh hợp lệ hoặc bỏ ảnh.');await original.call(form,event);}catch(e){toast(e.message);}};
 }
 createForm=async function(...args){await baseCreate(...args);itemPhoto();};
 editForm=async function(record){await baseEdit(record);itemPhoto(record);};
 const originalDetail=detail;
 detail=function(record){
  originalDetail(record);
  if(current==='notifications'&&record.resource_id){
   const aliases={'quality-campaigns':'stocktakes','minute-exceptions':'exception-proposals'},key=aliases[record.resource_type]||record.resource_type,m=available().find(m=>m[0]===key);
   if(m){const link=document.createElement('a');link.className='button primary';link.href=m[5]+'?module='+encodeURIComponent(key)+'&view='+encodeURIComponent(record.resource_id);link.textContent='Mở chứng từ liên quan →';modalBody.append(link);}
  }
  if(current==='items'&&record.image_path){const img=document.createElement('img');img.src=record.image_path;img.alt=record.name||'Ảnh mặt hàng';img.className='item-detail-photo';modalBody.querySelector('.detail-grid')?.before(img);}
  const grid=modalBody.querySelector('.detail-grid'),secondaryKeys=['created_at','updated_at','note','description','delivery_terms','image_path'];
  if(grid){
   const secondary=[...grid.children].filter(el=>secondaryKeys.some(k=>el.querySelector('dt')?.textContent===fieldLabel(k)));
   if(secondary.length){const block=document.createElement('details');block.className='disclosure';block.innerHTML='<summary>Thông tin bổ sung <small>'+secondary.length+' mục</small></summary><dl class="detail-grid"></dl>';secondary.forEach(el=>block.lastElementChild.append(el));grid.after(block);}
  }
  const optional=['allocations','decision_history','reinspections','source_lots','documents','document_lines'];
  modalBody.querySelectorAll('.form-section').forEach(section=>{
   const h=section.querySelector(':scope > h3');if(!h||!optional.some(k=>h.textContent===fieldLabel(k)))return;
   const block=document.createElement('details');block.className='disclosure';const summary=document.createElement('summary');summary.textContent=h.textContent;block.append(summary);h.remove();section.before(block);while(section.firstChild)block.append(section.firstChild);section.remove();
  });
 };
})();
