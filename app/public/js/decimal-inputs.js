// =============================================================================
// Ô NHẬP SỐ: hiện và nhận số theo chuẩn Việt Nam (xem number-format.js).
// Mỗi <input type="number"> được đổi thành ô chữ: người dùng thấy "1.500,5", còn code
// đọc/ghi input.value và gửi biểu mẫu vẫn dùng số máy "1500.5".
// =============================================================================
(function(){
  const N=typeof module==='object'&&module.exports?require('./number-format'):window.warehouseNumber;
  /** Giá trị gửi lên máy chủ: giữ số máy, đổi số gõ theo chuẩn Việt Nam, báo lỗi nếu sai. */
  function canonical(value){
    if(typeof value!=='string')return value;
    const raw=value.trim();
    return N.isCanonical(raw)?raw:N.parse(raw);
  }
  if(typeof module==='object'&&module.exports){module.exports={canonical};return;}
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  function attach(input){
    if(input.type!=='number'||input.dataset.decimalInput)return;
    const initial=N.display(descriptor.get.call(input));
    input.type='text';input.inputMode='decimal';input.dataset.decimalInput='true';
    input.setAttribute('value',initial); // để nút đặt lại biểu mẫu không hiện lại số máy
    input.setAttribute('title','Dấu . phân cách hàng nghìn, dấu , là phần thập phân. Ví dụ 1.250 hoặc 1,25');
    const read=()=>{const raw=descriptor.get.call(input);try{return N.parse(raw);}catch{return raw;}};
    Object.defineProperty(input,'value',{configurable:true,get:read,set(v){descriptor.set.call(input,N.display(v));validate();}});
    function validate(){
      if(input.disabled||input.readOnly){input.setCustomValidity('');return;}
      const raw=descriptor.get.call(input);if(!raw.trim()){input.setCustomValidity('');return;}
      let number;try{number=N.parse(raw);}catch(e){input.setCustomValidity(e.message);return;}
      const step=input.getAttribute('step')||'',precision=step==='1'?0:step.split('.')[1]?.length;
      let message=precision!==undefined&&(number.split('.')[1]||'').length>precision?(precision?'Tối đa '+precision+' chữ số thập phân.':'Nhập số nguyên.'):'';
      if(input.min!==''&&Number(number)<Number(input.min))message='Giá trị nhỏ nhất là '+N.display(input.min)+'.';
      if(input.max!==''&&Number(number)>Number(input.max))message='Giá trị lớn nhất là '+N.display(input.max)+'.';
      input.setCustomValidity(message);
    }
    // Rời ô thì thêm dấu phân cách nghìn cho dễ đọc; đang gõ thì giữ nguyên.
    input.addEventListener('blur',()=>{try{descriptor.set.call(input,N.display(N.parse(descriptor.get.call(input))));}catch{/* sai chuẩn: giữ để người dùng sửa */}});
    input.addEventListener('input',validate,true);descriptor.set.call(input,initial);validate();
  }
  const scan=root=>{if(root instanceof HTMLInputElement)attach(root);root.querySelectorAll?.('input[type="number"]').forEach(attach);};
  const observer=new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1)scan(node);});
  observer.observe(document.body,{subtree:true,childList:true});scan(document.body);
  // Biểu mẫu đọc bằng FormData lấy chữ đang hiện trên ô: đổi về số máy.
  document.addEventListener('formdata',event=>{
    for(const input of event.target.querySelectorAll('input[data-decimal-input][name]'))if(!input.disabled)event.formData.set(input.name,input.value);
  });
  const normalize=(value,key='')=>Array.isArray(value)?value.map(v=>normalize(v,key)):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v,k)])):typeof value==='string'&&/(quantity|price|percentage|reserve_rate)$/.test(key)&&value!==''?canonical(value):value;
  const previousApi=api;api=async function(path,method='GET',body,key){return previousApi(path,method,body?normalize(body):body,key);};
})();
