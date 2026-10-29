document.addEventListener('DOMContentLoaded',()=>{
  const layout=document.querySelector('.layout'),toggle=document.querySelector('#sidebar-toggle'),input=document.querySelector('#nav-search'),results=document.querySelector('#nav-search-results');
  if(toggle)toggle.setAttribute('aria-expanded',String(!matchMedia('(max-width:767px)').matches));
  if(toggle&&layout)toggle.addEventListener('click',()=>{
    const mobile=matchMedia('(max-width:767px)').matches;
    layout.classList.toggle(mobile?'sidebar-open':'sidebar-collapsed');
    toggle.setAttribute('aria-expanded',String(mobile?layout.classList.contains('sidebar-open'):!layout.classList.contains('sidebar-collapsed')));
  });
  if(!input||!results)return;
  const boot=JSON.parse(document.querySelector('#app').dataset.boot||'{}'),roles=boot.user?.roles||[];
  const entries=warehouseNavigation.modules.filter(m=>m[3].includes('*')||roles.some(role=>m[3].includes(role)));
  const normalize=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d');
  function search(){
    results.replaceChildren();const query=input.value.trim();results.hidden=!query;if(!query)return;
    const matches=entries.filter(m=>normalize(m[1]).includes(normalize(query))).slice(0,7);
    if(!matches.length){const p=document.createElement('p');p.textContent='Không tìm thấy chức năng.';results.append(p);return;}
    for(const m of matches){const a=document.createElement('a');a.href=m[5]+'?module='+encodeURIComponent(m[0]);a.textContent=m[1];results.append(a);}
  }
  input.addEventListener('input',search);input.addEventListener('focus',search);
  input.addEventListener('keydown',event=>{if(event.key==='Escape'){results.hidden=true;input.blur();}if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('a')?.focus();}if(event.key==='Enter'){const first=results.querySelector('a');if(first){event.preventDefault();location.assign(first.href);}}});
  document.addEventListener('click',event=>{if(!event.target.closest('.quick-search'))results.hidden=true;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){results.hidden=true;layout?.classList.remove('sidebar-open');if(matchMedia('(max-width:767px)').matches)toggle?.setAttribute('aria-expanded','false');}});
  matchMedia('(max-width:767px)').addEventListener('change',()=>{layout?.classList.remove('sidebar-open','sidebar-collapsed');toggle?.setAttribute('aria-expanded',String(!matchMedia('(max-width:767px)').matches));});
});
