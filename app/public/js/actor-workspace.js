(()=>{
 const warehouseModules=['warehouse-inbound','warehouse-outbound'];
 const baseLoad=loadTable,baseDetail=detail,baseCreate=createForm,baseEdit=editForm;
 function itemCards(){
  if(current!=='items')return;const target=document.querySelector('#table');if(!target)return;
  const pagination=target.querySelector('.pagination');
  target.innerHTML='<div class="item-catalog-grid">'+cached.map((r,i)=>'<article class="item-catalog-card">'+(r.image_path?'<img class="item-thumb" src="'+esc(r.image_path)+'" alt="'+esc(r.name)+'" loading="lazy">':'<div class="item-no-photo">'+esc((r.name||'').slice(0,1))+'</div>')+'<div class="item-card-copy"><small>'+esc(r.code)+'</small><h2>'+esc(r.name)+'</h2><span>'+esc(labels[r.kind]||r.kind)+' · '+esc(r.unit||'')+'</span><strong>'+esc(format(r.reference_price,'reference_price'))+' đ / '+esc(r.unit||'đơn vị')+'</strong><button type="button" class="button small" data-detail="'+i+'">Xem mặt hàng →</button></div></article>').join('')+'</div>';
  if(!cached.length)target.innerHTML='<div class="empty">Chưa có mặt hàng phù hợp.</div>';
  if(pagination)target.append(pagination);
  target.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showDetail(cached[Number(b.dataset.detail)]));
 }
 function supplierLabels(){
  if(current!=='suppliers')return;const index=columnsFor('suppliers').findIndex(c=>c[0]==='name');
  document.querySelectorAll('#table tbody tr').forEach((row,i)=>{const cell=row.cells[index];if(!cell||cell.querySelector('.supplier-chips'))return;const box=document.createElement('div');box.className='supplier-chips';box.innerHTML=(cached[i]?.supplied_items||[]).map(m=>'<span>'+esc(m.name)+'</span>').join('')||'<small>Chưa khai báo mặt hàng cung cấp</small>';cell.append(box);});
 }
 async function history(){
  if(!warehouseModules.includes(current))return;
  let section=document.querySelector('#warehouse-posted-history');if(!section){section=document.createElement('section');section.id='warehouse-posted-history';section.className='work-panel';document.querySelector('#content').append(section);}
  section.innerHTML='<h2>Phiếu đã ghi sổ</h2><p class="subtitle">Đối chiếu kết quả thực hiện với các lần tiếp nhận và phân công phía trên.</p>';
  try{const direction=current==='warehouse-inbound'?'IN':'OUT',result=await api('stock-documents?type='+direction+'&per_page=10');
   if(!result.data.length){section.insertAdjacentHTML('beforeend','<p class="hint">Chưa có phiếu đã ghi sổ.</p>');return;}
   const list=document.createElement('div');list.className='posted-document-list';
   for(const r of result.data){const b=document.createElement('button');b.type='button';b.className='posted-document';b.innerHTML='<span><strong>'+esc(r.code)+'</strong><small>'+esc(format(r.posted_at,'posted_at'))+'</small></span><span>Xem phiếu →</span>';b.onclick=async()=>{try{detail((await api('stock-documents/'+r.id)).data);}catch(e){toast(e.message);}};list.append(b);}section.append(list);
  }catch(e){section.insertAdjacentHTML('beforeend',errorHTML(e));}
 }
 function lotGroups(){if(current!=='lots')return;const target=document.querySelector('#table'),pager=target?.querySelector('.pagination');if(!target)return;const groups=new Map();cached.forEach((r,index)=>{const key=r.lot_header_code||r.code;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({...r,index});});target.innerHTML=[...groups].map(([key,rows])=>'<details class="lot-summary"><summary><strong>'+esc(key)+'</strong><span>'+rows.length+' dòng · Xem trong lô</span></summary>'+rows.map(r=>'<div class="lot-line"><span>'+esc(r.item_name)+' · '+esc(format(r.received_quantity))+' · '+esc(labels[r.qc_status]||r.qc_status)+'</span><button class="button small" data-lot-detail="'+r.index+'">Chi tiết</button></div>').join('')+'</details>').join('');if(pager)target.append(pager);target.querySelectorAll('[data-lot-detail]').forEach(b=>b.onclick=()=>showDetail(cached[Number(b.dataset.lotDetail)]));
 for(const [index,entry]of [...groups].entries()){const details=target.querySelectorAll('.lot-summary')[index],header=entry[1][0].lot_header_id;details.ontoggle=async()=>{if(!details.open||details.dataset.loaded||!header)return;details.dataset.loaded='true';try{const result=await api('lots?lot_header_id='+encodeURIComponent(header)+'&per_page=100');details.querySelector('summary span').textContent=result.data.length+' dòng · Xem trong lô';details.querySelectorAll('.lot-line').forEach(n=>n.remove());for(const r of result.data){const line=document.createElement('div');line.className='lot-line';line.innerHTML='<span>'+esc(r.item_name)+' · '+esc(format(r.received_quantity))+' · '+esc(labels[r.qc_status]||r.qc_status)+'</span><button class="button small">Chi tiết</button>';line.querySelector('button').onclick=()=>showDetail(r);details.append(line);}}catch(e){delete details.dataset.loaded;toast(e.message);}};}
 }
 loadTable=async function(){await baseLoad();itemCards();supplierLabels();lotGroups();await history();};
 detail=function(r){baseDetail(r);if(current==='suppliers'){const box=document.createElement('section');box.className='form-section';box.innerHTML='<h3>Mặt hàng cung cấp</h3><div class="supplier-chips">'+(r.supplied_items||[]).map(i=>'<span>'+esc(i.name)+'</span>').join('')+'</div>';modalBody.querySelector('.detail-grid')?.after(box);}
 };
 async function locationFields(record={}){
  if(current!=='warehouse-locations'||!document.querySelector('#data-form'))return;
  const form=document.querySelector('#data-form');const categories=await options('categories');
  if(current!=='warehouse-locations'||!form?.isConnected||!modal.open)return;
  form.querySelector('.form-grid').insertAdjacentHTML('beforeend',inputField('zone_name','text',false,[],record.zone_name||'')+inputField('zone_category_id','select',false,[{id:'',name:'Khu chung / chưa phân loại'},...categories],record.zone_category_id||'')+inputField('depth','number',true,[],record.depth||1));
 }
 createForm=async function(...args){await baseCreate(...args);await locationFields();};
 editForm=async function(r){await baseEdit(r);await locationFields(r);};
 window.addEventListener('DOMContentLoaded',()=>{if(!user)return;itemCards();supplierLabels();lotGroups();history();});
})();
