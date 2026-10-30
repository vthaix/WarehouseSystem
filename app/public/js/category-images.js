(() => {
 const baseCreate=createForm,baseEdit=editForm;
 const baseLoad=loadTable,baseDetail=detail;
 function thumbnail(element,value){element.replaceChildren();if(typeof value!=='string'||!/^\/images\/(?:categories\/[a-f0-9-]{36}|items\/[a-z0-9-]+)\.(png|jpg|jpeg|webp)$/.test(value)){element.textContent='—';return;}const img=document.createElement('img');img.src=value;img.alt='Ảnh danh mục';img.className='category-thumbnail';element.append(img);}
 loadTable=async function(){await baseLoad();if(current==='categories')document.querySelectorAll('#table tbody tr').forEach((row,i)=>{if(row.cells[0])thumbnail(row.cells[0],cached[i]?.image_path);});};
 detail=function(record){baseDetail(record);if(current==='categories'&&record.image_path){const label=[...document.querySelectorAll('#modal-body dt')].find(el=>el.textContent===fieldLabel('image_path'));if(label)thumbnail(label.nextElementSibling,record.image_path);}};
 const readFile=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Không đọc được ảnh.'));reader.readAsDataURL(file);});
 function form(record={}){
  let cachedFile,cachedPath;
  openModal(record.id?'Sửa danh mục':'Thêm danh mục',formWrap(
   (!record.id?inputField('code'):'')+inputField('name','text',true,[],record.name||'')+
   inputField('description','textarea',false,[],record.description||'')+
   inputField('is_active','select',true,[{id:'true',name:'Có'},{id:'false',name:'Không'}],String(record.is_active??true))+
   `<div class="field span2"><label for="category-image-file">Ảnh danh mục</label><input id="category-image-file" type="file" accept="image/png,image/jpeg,image/webp"><input id="category-image-path" name="image_path" type="hidden" value="${esc(record.image_path||'')}"><div class="category-image-preview"><img id="category-image-preview" alt="Ảnh danh mục" ${record.image_path?'src="'+esc(record.image_path)+'"':'hidden'}><button class="button small" type="button" id="category-image-remove">Bỏ ảnh</button></div><span class="hint">PNG, JPEG hoặc WebP, tối đa 5 MB. Ảnh không bắt buộc.</span></div>`
  ));
  const fileInput=document.querySelector('#category-image-file'),pathInput=document.querySelector('#category-image-path'),preview=document.querySelector('#category-image-preview');
  fileInput.onchange=async()=>{const file=fileInput.files[0];if(!file)return;
    if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){fileInput.value='';toast('Chọn PNG, JPEG hoặc WebP tối đa 5 MB.');return;}
    try{const data=await readFile(file);if(fileInput.files[0]===file){preview.src=data;preview.hidden=false;}}catch(error){toast(error.message);}
  };
  document.querySelector('#category-image-remove').onclick=()=>{fileInput.value='';pathInput.value='';preview.removeAttribute('src');preview.hidden=true;cachedFile=null;cachedPath=null;};
  bindForm(async data=>{
    const file=fileInput.files[0];
    if(file){if(cachedFile!==file){const result=await api('category-images','POST',{data_url:await readFile(file)});cachedFile=file;cachedPath=result.data.image_path;}data.image_path=cachedPath;}
    else data.image_path=pathInput.value||null;
    return {...data,is_active:data.is_active==='true'};
  },record.id?'categories/'+record.id:'categories',record.id?'PATCH':'POST');
 }
 createForm=async function(){if(current==='categories'&&isMysql)return form();return baseCreate();};
 editForm=async function(record){if(current==='categories'&&isMysql){try{return form((await api('categories/'+record.id)).data);}catch(error){toast(error.message);return;}}return baseEdit(record);};
})();
