(function(){
  function canonical(value){
    if(typeof value!=='string')return value;
    const raw=value.trim();if(!/^\d+(?:[.,]\d+)?$/.test(raw))throw Error('Nhập số thập phân hợp lệ, ví dụ 1,25; không dùng dấu phân cách hàng nghìn.');
    return raw.replace(',','.');
  }
  if(typeof module==='object'&&module.exports){module.exports={canonical};return;}
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  function attach(input){
    if(input.type!=='number'||input.dataset.decimalInput)return;
    const initial=descriptor.get.call(input);input.type='text';input.inputMode='decimal';input.dataset.decimalInput='true';
    input.setAttribute('title','Nhập số thập phân bằng dấu phẩy, ví dụ 1,25');
    const display=v=>String(v??'').replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1').replace('.',',');
    // The component renders a comma but exposes the canonical decimal to the
    // existing calculations. FormData/API normalization below covers native forms.
    Object.defineProperty(input,'value',{configurable:true,get(){return descriptor.get.call(this).replace(',','.');},set(v){descriptor.set.call(this,display(v));validate();}});
    function validate(){
      if(input.disabled||input.readOnly){input.setCustomValidity('');return;}
      const raw=descriptor.get.call(input);if(!raw){input.setCustomValidity('');return;}
      let number;try{number=canonical(raw);}catch(e){input.setCustomValidity(e.message);return;}
      if(raw.includes('.')&&!raw.includes(','))descriptor.set.call(input,raw.replace('.',','));
      const precision=(input.getAttribute('step')||'').split('.')[1]?.length;
      let message=precision&&number.split('.')[1]?.length>precision?'Tối đa '+precision+' chữ số thập phân.':'';
      if(input.min!==''&&Number(number)<Number(input.min))message='Giá trị nhỏ nhất là '+display(input.min)+'.';
      if(input.max!==''&&Number(number)>Number(input.max))message='Giá trị lớn nhất là '+display(input.max)+'.';
      input.setCustomValidity(message);
    }
    input.addEventListener('input',validate,true);descriptor.set.call(input,display(initial));validate();
  }
  const scan=root=>{if(root instanceof HTMLInputElement)attach(root);root.querySelectorAll?.('input[type="number"]').forEach(attach);};
  const observer=new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1)scan(node);});
  observer.observe(document.body,{subtree:true,childList:true});scan(document.body);
  const normalize=(value,key='')=>Array.isArray(value)?value.map(v=>normalize(v,key)):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v,k)])):typeof value==='string'&&/(quantity|price|percentage|reserve_rate)$/.test(key)&&value!==''?canonical(value):value;
  const previousApi=api;api=async function(path,method='GET',body,key){return previousApi(path,method,body?normalize(body):body,key);};
})();
