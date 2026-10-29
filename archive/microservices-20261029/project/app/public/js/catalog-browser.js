(()=>{
  const previousCreate=createForm,previousEdit=editForm,previousLoad=loadTable;
  const params=new URLSearchParams(location.search),kind=params.get('kind')||'FINISHED_PRODUCT';
  createForm=async function(){
    const itemOptions=current==='items'?await Promise.all([options('categories'),options('units')]):null;
    await previousCreate();
    if(current==='categories'&&document.querySelector('#data-form'))document.querySelector('#data-form .form-grid').insertAdjacentHTML('afterbegin',inputField('catalog_kind','select',true,[{id:'FINISHED_PRODUCT',name:'Thành phẩm'},{id:'MATERIAL',name:'Nguyên vật liệu / vật tư đóng gói'}],kind));
    if(current==='items'&&document.querySelector('#data-form')){
      const [categories,units]=itemOptions,select=document.querySelector('#f-kind'),category=document.querySelector('#f-category_id');
      if(!select||!category)return;const selectedCategory=params.get('category_id');
      const sync=()=>{const currentValue=category.value;category.innerHTML=categories.filter(c=>!c.catalog_kind||c.catalog_kind===select.value).map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');if([...category.options].some(o=>o.value===currentValue))category.value=currentValue;};
      select.value=kind;select.addEventListener('change',sync);sync();if(selectedCategory&&[...category.options].some(o=>o.value===selectedCategory))category.value=selectedCategory;
      const suggestUnit=()=>{const c=categories.find(c=>c.id===category.value),code=({'BOT':'KG','DUONG-MUOI':'KG','BO-SUA-TRUNG':'KG','MEN-NO':'G','NHAN':'KG','TRANG-TRI':'LIT','BAO-BI':'CAI','BANH-MI':'O','BONG-LAN':'CAI','BANH-QUY':'HOP','BANH-KEM':'CAI','BANH-NHAN':'CAI'})[c?.code]||(select.value==='MATERIAL'?'KG':'CAI');const unit=units.find(u=>u.code===code);if(unit)document.querySelector('#f-unit_id').value=unit.id;};category.addEventListener('change',suggestUnit);select.addEventListener('change',suggestUnit);suggestUnit();
    }
  };
  editForm=async function(r){await previousEdit(r);if(current==='categories'&&document.querySelector('#data-form'))document.querySelector('#data-form .form-grid').insertAdjacentHTML('afterbegin',inputField('catalog_kind','select',true,[{id:'FINISHED_PRODUCT',name:'Thành phẩm'},{id:'MATERIAL',name:'Nguyên vật liệu / vật tư đóng gói'}],r.catalog_kind||kind));};
  function cards(){
    if(current!=='categories')return;const table=document.querySelector('#table');if(!table)return;
    const pagination=table.querySelector('.pagination');
    table.innerHTML='<div class="catalog-category-grid">'+cached.map(r=>'<article class="catalog-category-card"><a href="/catalog/data?module=items&kind='+esc(r.catalog_kind||kind)+'&category_id='+esc(r.id)+'">'+(r.image_path?'<img src="'+esc(r.image_path)+'" alt="'+esc(r.name)+'">':'<span class="catalog-category-icon" aria-hidden="true">▦</span>')+'<h2>'+esc(r.name)+'</h2><p>'+esc(r.description||'Xem các mặt hàng trong danh mục')+'</p><span>Xem mặt hàng →</span></a><div class="inline-actions"><button class="button small" data-category-edit="'+esc(r.id)+'">Sửa danh mục</button><button class="button small danger" data-category-delete="'+esc(r.id)+'">Xóa</button></div></article>').join('')+'</div>'+(cached.length?'':'<div class="empty">Chưa có danh mục. Chọn Tạo mới để thêm.</div>');
    if(pagination)table.append(pagination);
    table.querySelectorAll('[data-category-edit]').forEach(b=>b.onclick=()=>editForm(cached.find(r=>r.id===b.dataset.categoryEdit)));
    table.querySelectorAll('[data-category-delete]').forEach(b=>b.onclick=()=>actionForm(cached.find(r=>r.id===b.dataset.categoryDelete),'delete'));
  }
  loadTable=async function(){await previousLoad();cards();};
  window.addEventListener('DOMContentLoaded',()=>{
    if(current==='categories'){const title=document.querySelector('.heading h1');if(title)title.textContent='Danh mục '+(kind==='MATERIAL'?'nguyên vật liệu':'thành phẩm');cards();}
  });
})();
