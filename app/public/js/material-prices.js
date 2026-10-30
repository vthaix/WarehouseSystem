(()=>{
  const previousEdit=editForm,previousDetail=detail,previousCreate=createForm;
  let catalogue=[];
  async function priceForm(record){
    const r=(await api('material-prices/'+record.id)).data,meta=(await api('material-price-options')).data;
    const prices=new Map(r.supplier_prices.map(p=>[String(p.supplier_id),p.unit_price]));
    openModal('Đơn vị và đơn giá · '+r.name,formWrap(inputField('unit_id','select',true,meta.units,r.unit_id)+inputField('reference_price','number',true,[],r.reference_price)+'<div class="span2 notice">Đơn giá tính theo một đơn vị nguyên vật liệu được chọn. Giá nhập kho thực tế được giữ trên từng dòng đơn mua.</div><div class="span2 table-wrap"><table><thead><tr><th>Nhà cung cấp</th><th>Đơn giá (đồng / đơn vị)</th></tr></thead><tbody>'+meta.suppliers.map(s=>'<tr><td>'+esc(s.name)+'</td><td><input type="number" min="0" step="0.0001" data-supplier-price="'+esc(s.id)+'" value="'+esc(numericInputValue(prices.get(s.id)||''))+'" aria-label="Đơn giá '+esc(s.name)+'" placeholder="Chưa có báo giá"></td></tr>').join('')+'</tbody></table></div>'));
    document.querySelector('#data-form .notice').append(' Chỉ những nhà cung cấp có đơn giá trong bảng dưới mới được chọn khi mua nguyên vật liệu này. Để trống nếu nhà cung cấp không cung cấp mặt hàng.');
    document.querySelector('#data-form [type=submit]').hidden=!has(['WAREHOUSE_MANAGER']);
    if(!has(['WAREHOUSE_MANAGER'])){document.querySelectorAll('#data-form input,#data-form select').forEach(i=>i.disabled=true);document.querySelector('#cancel').onclick=()=>modal.close();return;}
    bindForm(d=>({...d,version:r.version,supplier_prices:[...document.querySelectorAll('[data-supplier-price]')].filter(i=>i.value!=='').map(i=>({supplier_id:i.dataset.supplierPrice,unit_price:i.value}))}),'material-prices/'+r.id,'PATCH');
  }
  editForm=async function(r){if(current!=='material-prices')return previousEdit(r);try{await priceForm(r);}catch(e){openModal('Không thể mở đơn giá',errorHTML(e));}};
  detail=function(r){if(current==='material-prices')return editForm(r);return previousDetail(r);};
  function suggest(row){
    const item=row.querySelector('[data-key="item_id"]'),supplier=row.querySelector('[data-key="supplier_id"]'),price=row.querySelector('[data-key="unit_price"]');if(!item||!supplier||!price)return;
    const material=catalogue.find(i=>String(i.id)===item.value),offer=material?.supplier_prices.find(p=>String(p.supplier_id)===supplier.value);
    if(offer)price.value=numericInputValue(offer.unit_price);
  }
  createForm=async function(){await previousCreate();if(current==='purchase-orders'){try{catalogue=(await api('material-prices?per_page=100')).data;document.querySelectorAll('#purchase-lines [data-section]').forEach(suggest);}catch(e){toast('Chưa tải được bảng giá; bạn vẫn có thể nhập giá mua thực tế.');}}};
  document.addEventListener('change',e=>{if(current==='purchase-orders'&&['supplier_id','item_id'].includes(e.target.dataset.key)){const row=e.target.closest('[data-section="lines"]');if(row)suggest(row);}});
})();
