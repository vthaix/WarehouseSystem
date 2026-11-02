(()=>{
 const previousLoad=loadTable,previousCreate=createForm;let panelVersion=0;
 function entries(sources){
  const kind=current==='business-plans'?'MATERIAL':'FINISHED_PRODUCT',result=[];
  for(const source of sources){const groups=new Map();for(const l of source.lines.filter(l=>l.kind===kind&&Number(l.remaining_compensation_quantity)>0)){const key=kind==='MATERIAL'?'MATERIAL':l.customer_order_id+':'+l.workshop_id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l);}for(const lines of groups.values())result.push({source,lines,kind});}
  return result;
 }
 async function create(source,lines,kind){
  const production=kind==='FINISHED_PRODUCT';
  const order=production?(await api('customer-orders/'+lines[0].customer_order_id)).data:null;
  openModal(production?'Lập kế hoạch sản xuất bù':'Lập kế hoạch mua bù',formWrap('<div class="span2 notice">Nguồn: '+esc(source.code)+'. Chỉ bù phần thiếu chưa có kế hoạch. Kế hoạch vẫn cần phê duyệt.</div>'+(production?'<div class="span2">Đơn hàng: '+esc(order.code)+' · Xưởng phụ trách giữ theo lô nguồn.</div>'+inputField('start_date','date',true,[],calendarToday())+inputField('end_date','date',true,[],calendarToday()):inputField('planned_date','date',true,[],calendarToday()))+inputField('note','textarea',false,[],'Bù phần thiếu từ '+source.code)+lines.map((l,i)=>'<section class="span2 form-section"><h3>'+esc(l.item_name)+'</h3><p>Thiếu: '+esc(format(l.shortage_quantity))+' '+esc(l.unit)+' · Đã lập bù: '+esc(format(l.planned_compensation_quantity))+'</p><label for="comp-'+i+'">Số lượng lập bù *</label><input id="comp-'+i+'" data-comp-quantity type="number" required min="0.001" step="0.001" max="'+esc(l.remaining_compensation_quantity)+'" value="'+esc(l.remaining_compensation_quantity)+'"></section>').join('')));
  if(production&&order.latest_delivery_date){const end=document.querySelector('#f-end_date');end.max=String(order.latest_delivery_date).slice(0,10);document.querySelector('#f-start_date').max=end.max;}
  bindForm(d=>{const quantities=[...document.querySelectorAll('[data-comp-quantity]')].map((el,i)=>({item_id:lines[i].item_id,quantity:el.value}));return {...d,compensation_minute_id:source.id,...(production?{customer_order_id:lines[0].customer_order_id,workshop_id:lines[0].workshop_id,material_source:'RECIPE',outputs:quantities}:{type:'PURCHASE',lines:quantities.map(l=>({...l,unit_price:'0'}))})};},production?'production-plans':'business-plans');
 }
 async function panel(){
  if(!has(['PLANNER'])||!['business-plans','production-plans'].includes(current))return;
  const page=current,version=++panelVersion,sources=(await api('compensation-sources')).data;if(current!==page||version!==panelVersion)return;
  document.querySelector('#minute-compensations')?.remove();if(!sources.length)return;
  const section=document.createElement('section');section.id='minute-compensations';section.className='purchase-ready';section.innerHTML='<h2>Biên bản chờ lập kế hoạch bù</h2>';
  const kind=page==='business-plans'?'MATERIAL':'FINISHED_PRODUCT';let count=0;
  for(const source of sources){const groups=new Map();for(const l of source.lines.filter(l=>l.kind===kind&&Number(l.remaining_compensation_quantity)>0)){const key=kind==='MATERIAL'?'MATERIAL':l.customer_order_id+':'+l.workshop_id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l);}for(const lines of groups.values()){count++;const card=document.createElement('article');card.className='form-section record-pending';card.innerHTML='<h3>'+esc(source.code)+'</h3>'+tableData(lines)+'<button type="button" class="button primary">'+(kind==='MATERIAL'?'Lập kế hoạch mua bù':'Lập kế hoạch sản xuất bù')+'</button>';card.querySelector('button').onclick=()=>create(source,lines,kind).catch(e=>toast(e.message));section.append(card);}}
  if(count)document.querySelector('#content').prepend(section);
 }
 loadTable=async function(){await previousLoad();await panel();};
 createForm=async function(...args){
  if(!isMysql||!has(['PLANNER'])||!['business-plans','production-plans'].includes(current))return previousCreate(...args);
  const choices=entries((await api('compensation-sources')).data);if(!choices.length)return previousCreate(...args);
  openModal('Chọn nguồn lập kế hoạch',formWrap(inputField('planning_source','select',true,[{id:'',name:'Chọn nguồn lập kế hoạch'},{id:'STANDARD',name:'Đơn hàng / báo cáo sản xuất'},...choices.map((e,i)=>({id:String(i),name:'Biên bản '+e.source.code+(e.lines[0].customer_order_code?' · '+e.lines[0].customer_order_code:'')}))])));
  document.querySelector('label[for=f-planning_source]').textContent='Nguồn lập kế hoạch *';
  const form=document.querySelector('#data-form');form.querySelector('[type=submit]').textContent='Tiếp tục';form.querySelector('#cancel').onclick=()=>modal.close();
  form.onsubmit=async event=>{event.preventDefault();const value=form.querySelector('#f-planning_source').value;if(value==='')return;try{if(value==='STANDARD')await previousCreate(...args);else{const e=choices[Number(value)];await create(e.source,e.lines,e.kind);}}catch(error){toast(error.message);}};
 };
 window.addEventListener('DOMContentLoaded',()=>{if(user)panel().catch(e=>toast(e.message));});
 window.addEventListener('warehouse:pending-updated',()=>{if(user)panel().catch(()=>{});});
})();
