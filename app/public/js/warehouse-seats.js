// Shared location map for lookup and warehouse dispatch.
window.createWarehouseSeatMap=function({locations,selectedId=null,selectedZone=null,suggestedId=null,suggestedIds=[],onSelect=()=>{},onZone=()=>{}}){
 const recommended=new Set([...suggestedIds,suggestedId].filter(v=>v!=null).map(String));
 const root=document.createElement('div');root.className='warehouse-seat-map';
 root.innerHTML='<div class="warehouse-seat-direction">Phía trong</div><div class="warehouse-seat-aisles"></div><div class="warehouse-seat-direction warehouse-seat-entry">Lối nhập / xuất · Phía ngoài</div>';
 const groups=new Map();for(const l of locations){const name=l.zone_name||'Khu chung';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(l);}
 for(const [name,rows]of groups){
  const aisle=document.createElement('section');aisle.className='warehouse-seat-aisle';
  const heading=document.createElement('button');heading.type='button';heading.className='warehouse-seat-zone'+(selectedZone===name?' selected':'');heading.dataset.seatZone=name;heading.textContent=name.replace(/^Khu [A-Z] · /,'Khu ');heading.setAttribute('aria-pressed',String(selectedZone===name));heading.onclick=()=>onZone(name);aisle.append(heading);
  const ordered=rows.sort((a,b)=>Number(a.depth||1)-Number(b.depth||1)||String(a.code).localeCompare(String(b.code),'vi',{numeric:true}));
  const sections=[{label:'Trên 6 tháng',band:2},{label:'3 – 6 tháng',band:1},{label:'Dưới 3 tháng',band:0}];
  for(const section of sections){
   const group=document.createElement('div');group.className='warehouse-seat-band';const label=document.createElement('small');label.className='warehouse-seat-band-label';label.textContent=section.label;group.append(label);
   const slots=document.createElement('div');slots.className='warehouse-seat-cells';
   ordered.forEach((l,index)=>{
    const band=Math.min(2,Math.floor(index*3/ordered.length));if(band!==section.band)return;
    const b=document.createElement('button'),stock=l.stock||[];b.type='button';
    b.className='warehouse-slot warehouse-seat'+(stock.length?' occupied':'')+(String(selectedId)===String(l.id)?' selected':'')+(recommended.has(String(l.id))?' recommended':'');
    b.dataset.location=String(l.id);b.disabled=l.is_active===false||l.is_active===0||l.selectable===false;
    b.setAttribute('aria-pressed',String(String(selectedId)===String(l.id)));b.title=(l.name||l.code)+' · '+section.label;
    b.innerHTML='<strong>'+esc(l.code)+'</strong><small>'+(recommended.has(String(l.id))?'Đề xuất':stock.length?stock.length+' lô':'Trống')+'</small>';
    b.onclick=()=>onSelect(l);slots.prepend(b);
   });
   if(slots.children.length){group.append(slots);aisle.append(group);}
  }
  root.querySelector('.warehouse-seat-aisles').append(aisle);
 }
 return root;
};
