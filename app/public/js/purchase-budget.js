(()=>{
 const previousCreate=createForm,previousEdit=editForm,previousDetail=detail;let observer;
 const money=v=>Number(v||0).toLocaleString('vi-VN',{maximumFractionDigits:2})+' đ';
 async function mount(record){
  if(current!=='business-plans'||!document.querySelector('#data-form'))return;
  const quotes=(await api('purchase-plan-price-options')).data,form=document.querySelector('#data-form');
  for(const key of ['customer_id','customer_order_id']){const field=form.querySelector('#f-'+key);if(field){field.disabled=true;field.required=false;field.closest('.field').hidden=true;}}
  const board=document.createElement('section');board.className='span2 form-section';board.id='purchase-estimate';form.querySelector('.form-grid').append(board);
  const draw=()=>{const purchase=(document.querySelector('#f-type')?.value||record?.type)==='PURCHASE';board.hidden=!purchase;if(!purchase)return;let total=0,low=0,high=0;
   const rows=[...form.querySelectorAll('#lines-rows .line-row')].map(row=>{const item=row.querySelector('[data-key="item_id"]'),quantity=row.querySelector('[data-key="quantity"]'),price=row.querySelector('[data-key="unit_price"]');const material=quotes.find(m=>m.id===item?.value),q=material?.estimate,n=Number(quantity?.value||0);if(q&&price){price.value=numericInputValue(q.unit_price);price.readOnly=true;total+=n*Number(q.unit_price);low+=n*Number(q.min_unit_price);high+=n*Number(q.max_unit_price);}else if(price)price.readOnly=false;
    return '<tr><td>'+esc(material?.name||'Chọn NVL')+'</td><td>'+esc(q?money(q.unit_price):'Chưa có báo giá NCC')+'</td><td>'+esc(q?money(q.min_unit_price)+' – '+money(q.max_unit_price):'—')+'</td><td>'+esc(q?q.offers.map(o=>o.supplier_name+': '+money(o.unit_price)).join('; '):'Bổ sung trong bảng giá NVL')+'</td></tr>';}).join('');
   board.innerHTML='<h3>Tổng tiền mua ước lượng: <strong>'+money(total)+'</strong></h3><p>Giá trung bình từ các NCC đang cung cấp đúng NVL. Khoảng dự toán: '+money(low)+' – '+money(high)+'. Giá mua thực tế do bộ phận mua hàng chốt.</p><div class="table-wrap"><table><thead><tr><th>NVL</th><th>Đơn giá tham khảo</th><th>Thấp nhất – cao nhất</th><th>Báo giá NCC</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  };
  form.addEventListener('input',draw);form.addEventListener('change',draw);observer?.disconnect();observer=new MutationObserver(records=>{if(records.some(r=>!board.contains(r.target)))draw();});observer.observe(form,{childList:true,subtree:true});draw();
 }
 createForm=async function(...args){await previousCreate(...args);try{await mount();}catch(e){toast(e.message);}};
 editForm=async function(r){await previousEdit(r);try{await mount(r);}catch(e){toast(e.message);}};
 detail=function(r){previousDetail(r);if(current!=='business-plans'||r.type!=='PURCHASE')return;const section=document.createElement('section');section.className='form-section';section.innerHTML='<h3>Tổng tiền ước lượng: '+esc(money(r.total_amount))+'</h3><p>Giá tham khảo được lưu tại thời điểm lập/sửa kế hoạch; không tự thay đổi khi NCC cập nhật giá.</p>'+(r.lines||[]).filter(l=>l.price_estimate).map(l=>'<details class="lot-summary"><summary>'+esc(l.item_name)+' · '+esc(money(l.unit_price))+'/đơn vị</summary><p>'+esc(l.price_estimate.offers.map(o=>o.supplier_name+': '+money(o.unit_price)).join('; '))+'</p></details>').join('');modalBody.querySelector('.detail-grid')?.after(section);};
})();
