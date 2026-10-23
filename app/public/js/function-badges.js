(()=>{
  let counts={},busy=false,countsUser=null;
  function paint(){
    const activeUser=user?String(user.id):null;
    if(countsUser!==activeUser){counts={};countsUser=activeUser;if(user)queueMicrotask(refresh);}
    document.querySelectorAll('[data-nav],[data-go]').forEach(el=>{
      const key=el.dataset.nav||el.dataset.go,n=Number(counts[key]||0);
      let badge=el.querySelector(':scope > .function-badge');
      if(!n){if(badge)badge.remove();return;}
      if(!badge){badge=document.createElement('span');badge.className='function-badge';el.classList.add('has-function-badge');el.append(badge);}
      const value=n>99?'99+':String(n);if(badge.textContent!==value)badge.textContent=value;
      badge.setAttribute('aria-label',n+' mục mới hoặc chờ xử lý');
    });
  }
  async function refresh(){
    if(busy||!user||document.hidden)return;busy=true;const id=user.id;
    try{const r=await api('function-badges');if(user?.id===id){countsUser=String(id);counts=r.data;paint();}}
    catch(e){if(e.status===401){counts={};paint();}}
    finally{busy=false;}
  }
  const previousApi=api;
  api=async function(path,method='GET',body,key){const r=await previousApi(path,method,body,key);if(method!=='GET')queueMicrotask(refresh);return r;};
  new MutationObserver(paint).observe(document.querySelector('#app'),{childList:true,subtree:true});
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  window.addEventListener('DOMContentLoaded',refresh);
  setInterval(refresh,15000);refresh();
})();
