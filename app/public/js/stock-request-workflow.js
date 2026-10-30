(()=>{
  const previousCreate=createForm,previousEdit=editForm,previousPost=postForm;
  const value=k=>document.querySelector('#f-'+k)?.value;
  const purposes={IN:[{id:'PURCHASE_RECEIPT',name:'Nhập nguyên vật liệu từ kế hoạch mua'},{id:'PRODUCTION_RECEIPT',name:'Nhập thành phẩm từ báo cáo thành phẩm'}],OUT:[{id:'PRODUCTION_ISSUE',name:'Xuất nguyên vật liệu để sản xuất'},{id:'SALE_ISSUE',name:'Xuất thành phẩm để giao hàng'}]};
  createForm=async function(){
    if(!isMysql||current!=='stock-requests')return previousCreate();
    try{
      const [sources,warehouses,managers,items]=await Promise.all([api('stock-request-workflow-sources').then(r=>r.data),options('warehouses'),options('warehouse-managers'),options('items')]);
      openModal('Gửi yêu cầu nhập / xuất kho',formWrap(inputField('request_direction','select',true,[{id:'IN',name:'Nhập kho'},{id:'OUT',name:'Xuất kho'}])+inputField('purpose','select',true,purposes.IN)+inputField('workflow_source_id','select',true,[])+inputField('sale_plan_id','select',false,[])+inputField('workshop_id','select',true,sources.workshops||[])+inputField('warehouse_id','select',true,warehouses)+inputField('manager_id','select',true,managers)+inputField('requested_at','datetime-local',true,[],localInput(new Date().toISOString()))+inputField('note','textarea',false)+'<div class="span2" id="request-source-info"></div><div class="span2" id="request-quantity-lines"></div>'));
      const workshop=document.querySelector('#f-workshop_id');if(sources.workshops?.length===1){workshop.value=sources.workshops[0].id;workshop.disabled=true;}
      document.querySelector('label[for="f-request_direction"]').textContent='Thao tác *';
      document.querySelector('label[for="f-requested_at"]').textContent='Ngày giờ đề nghị thực hiện *';document.querySelector('#f-requested_at').min=calendarToday()+'T00:00';
      document.querySelector('#data-form [type=submit]').textContent='Gửi yêu cầu';
      let sequence=0,preview=null;
      const candidates=()=>value('purpose')==='PURCHASE_RECEIPT'?sources.purchase_plans:value('purpose')==='PRODUCTION_RECEIPT'?sources.finished_reports:sources.production_plans.filter(p=>value('purpose')==='SALE_ISSUE'?p.status==='COMPLETED':p.status!=='COMPLETED');
      const load=async()=>{
        const token=++sequence;preview=null;document.querySelector('#request-quantity-lines').innerHTML='';document.querySelector('#request-source-info').innerHTML='';
        const submit=document.querySelector('#data-form [type=submit]');submit.disabled=true;
        const source=candidates().find(s=>s.id===value('workflow_source_id'));
        if(source?.workshop_id)document.querySelector('#f-workshop_id').value=source.workshop_id;
        const warehouseSelect=document.querySelector('#f-warehouse_id'),previousWarehouse=warehouseSelect.value;
        const requiredType=['PURCHASE_RECEIPT','PRODUCTION_ISSUE'].includes(value('purpose'))?'MATERIAL':'FINISHED_PRODUCT';
        const eligibleWarehouses=warehouses.filter(w=>(!w.workshop_id||String(w.workshop_id)===value('workshop_id'))&&(!(w.warehouse_type||w.LoaiKho)||(w.warehouse_type||w.LoaiKho)===requiredType));
        warehouseSelect.innerHTML=eligibleWarehouses.map(w=>'<option value="'+esc(w.id)+'">'+esc(w.name)+'</option>').join('');
        if(eligibleWarehouses.some(w=>String(w.id)===previousWarehouse))warehouseSelect.value=previousWarehouse;
        const sales=sources.sale_plans.filter(p=>p.production_plan_id===source?.id),sale=document.querySelector('#f-sale_plan_id');
        const previousSale=sale.value;sale.innerHTML=(sales.length>1?'<option value="">Chọn kế hoạch bán cần giao</option>':'')+sales.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.code)+'</option>').join('');
        if(sales.some(s=>s.id===previousSale))sale.value=previousSale;
        const showSale=value('purpose')==='SALE_ISSUE'&&sales.length>1;sale.closest('.field').hidden=!showSale;sale.disabled=!showSale;sale.required=showSale;
        if(!source){document.querySelector('#request-source-info').innerHTML='<p class="notice">Chưa có nguồn phù hợp. Nhập nguyên vật liệu cần đơn mua; nhập thành phẩm cần báo cáo đã gửi.</p>';return;}
        if(value('purpose')==='SALE_ISSUE'&&!sales.length){document.querySelector('#request-source-info').innerHTML='<p class="notice">KHSX chưa có kế hoạch bán đã duyệt liên quan.</p>';return;}
        if(showSale&&!sale.value)return;
        try{
          const query=new URLSearchParams({workflow_source:'true',source_id:source.id,purpose:value('purpose'),workshop_id:value('workshop_id'),warehouse_id:value('warehouse_id'),...(value('purpose')==='SALE_ISSUE'&&sale.value?{sale_plan_id:sale.value}:{})});
          const data=(await api('source-imports/stock-requests?'+query)).data;if(token!==sequence)return;preview=data;
          document.querySelector('#request-source-info').innerHTML='<div class="notice">Nguồn: '+esc(source.code)+' · '+esc(data.source_code||'')+'</div>'+(data.warnings||[]).map(w=>'<p class="hint">'+esc(w)+'</p>').join('')+((data.source_lots||[]).length?'<h3>Thông tin lô hàng</h3>'+tableData(data.source_lots):'')+((data.evidence||[]).length?'<h3>Lô thành phẩm khả dụng</h3>'+tableData(data.evidence):'');
          if(!data.lines.length){document.querySelector('#request-quantity-lines').innerHTML='<p class="notice">Nguồn chưa có lượng đủ điều kiện hoặc đã được yêu cầu hết.</p>';return;}
          const editor=lineEditor('Mặt hàng đề nghị',items.filter(i=>data.lines.some(l=>l.item_id===i.id)),'request-lines',['quantity'],data.lines);
          document.querySelector('#request-quantity-lines').innerHTML=editor.html;editor.mount();document.querySelector('#add-request-lines').remove();
          for(const row of document.querySelectorAll('#request-lines-rows .line-row')){row.querySelector('button').remove();row.querySelector('select').disabled=true;row.querySelector('[data-key="quantity"]').max=data.lines.find(l=>l.item_id===row.querySelector('select').value).quantity;}
          submit.disabled=false;
        }catch(e){if(token===sequence)document.querySelector('#request-source-info').innerHTML=errorHTML(e);}
      };
      const chooseSource=()=>{
        const options=candidates();document.querySelector('#f-workflow_source_id').innerHTML=options.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.code)+'</option>').join('');
        document.querySelector('label[for="f-workflow_source_id"]').textContent=(value('purpose')==='PURCHASE_RECEIPT'?'Kế hoạch mua nguyên vật liệu':value('purpose')==='PRODUCTION_RECEIPT'?'Báo cáo thành phẩm':'Kế hoạch sản xuất')+' *';return load();
      };
      document.querySelector('#f-request_direction').onchange=()=>{document.querySelector('#f-purpose').innerHTML=purposes[value('request_direction')].map(p=>'<option value="'+p.id+'">'+p.name+'</option>').join('');return chooseSource();};
      document.querySelector('#f-purpose').onchange=chooseSource;document.querySelector('#f-workflow_source_id').onchange=load;
      for(const key of ['workshop_id','warehouse_id','sale_plan_id'])document.querySelector('#f-'+key).onchange=load;
      bindForm(()=>{
        if(!preview)throw Error('Chờ tải và đối chiếu nguồn hợp lệ trước khi gửi.');
        const time=value('requested_at');return {purpose:value('purpose'),workflow_source_id:value('workflow_source_id'),...(value('purpose')==='SALE_ISSUE'&&value('sale_plan_id')?{sale_plan_id:value('sale_plan_id')}:{ }),workshop_id:value('workshop_id'),warehouse_id:value('warehouse_id'),manager_id:value('manager_id'),requested_date:time.slice(0,10),requested_at:new Date(time+'+07:00').toISOString(),note:value('note'),lines:readLines('request-lines').filter(l=>Number(l.quantity)>0)};
      },'stock-requests');await chooseSource();
    }catch(e){openModal('Không thể lập yêu cầu kho',errorHTML(e));}
  };
  editForm=async function(r){
    if(!isMysql||current!=='stock-requests')return previousEdit(r);
    try{
      const [warehouses,managers,items]=await Promise.all([options('warehouses'),options('warehouse-managers'),options('items')]);
      const editor=lineEditor('Mặt hàng đề nghị',items.filter(i=>r.lines.some(l=>l.item_id===i.id)),'request-lines',['quantity'],r.lines);
      openModal('Sửa yêu cầu kho '+r.code,formWrap(inputField('requested_at','datetime-local',true,[],localInput(r.requested_at||r.requested_date+'T08:00:00+07:00'))+inputField('warehouse_id','select',true,warehouses,r.warehouse_id)+inputField('manager_id','select',true,managers,r.manager_id)+inputField('note','textarea',false,[],r.note||'')+editor.html));editor.mount();document.querySelector('#add-request-lines').remove();
      for(const row of document.querySelectorAll('#request-lines-rows .line-row')){row.querySelector('button').remove();row.querySelector('select').disabled=true;}
      document.querySelector('#f-requested_at').min=calendarToday()+'T00:00';
      bindForm(()=>({version:r.version,requested_date:value('requested_at').slice(0,10),requested_at:new Date(value('requested_at')+'+07:00').toISOString(),warehouse_id:value('warehouse_id'),manager_id:value('manager_id'),note:value('note'),lines:readLines('request-lines').filter(l=>Number(l.quantity)>0)}),'stock-requests/'+r.id,'PATCH');
    }catch(e){openModal('Không thể sửa yêu cầu',errorHTML(e));}
  };
  postForm=async function(r){
    if(!isMysql)return previousPost(r);
    try{
      const data=(await api('stock-requests/'+r.id+'/allocations'+(r.assigned_task_id?'?task_id='+r.assigned_task_id:''))).data;
      if(data.frozen)throw Error('Kho đang khóa kiểm kê, chưa thể ghi phiếu.');
      const q=v=>{const [a,b='']=String(v).split('.');return BigInt(a)*1000n+BigInt(b.padEnd(3,'0'));};
      const taskId=r.assigned_task_id||data.request.assigned_task_id||String(data.allocations.find(a=>String(a.user_id)===String(user.id)&&q(a.quantity)>q(a.posted_quantity))?.task_id||'');
      const pending=data.allocations.filter(a=>String(a.user_id)===String(user.id)&&String(a.task_id)===String(taskId)&&q(a.quantity)>q(a.posted_quantity));
      if(!pending.length)throw Error('Không còn phân công nhập/xuất nào của bạn cần ghi phiếu.');
      const decimal=n=>`${n/1000n}.${String(n%1000n).padStart(3,'0')}`;
      openModal('Ghi phiếu '+(r.type==='IN'?'nhập':'xuất')+' · '+r.code,formWrap('<div class="span2 notice">Đối chiếu giấy tờ thực tế trước khi xác nhận. Số lượng gợi ý là phần còn lại được phân công; có thể sửa giảm và ghi tiếp phần còn lại sau.</div>'+pending.map((a,i)=>{
        const line=data.lines.find(l=>l.id===String(a.stock_request_line_id)),lot=line?.lots.find(l=>l.id===String(a.lot_id)),location=line?.locations.find(l=>l.id===String(a.location_id)),remaining=decimal(q(a.quantity)-q(a.posted_quantity));
        return '<section class="span2 form-section" data-post-index="'+i+'"><h3>'+esc(line?.item_name||'Mặt hàng')+'</h3><p>'+esc(lot?.code||a.lot_id)+' · '+esc(location?.name||a.location_id)+' · Còn được giao: '+esc(format(remaining))+'</p><label>Số lượng thực '+(r.type==='IN'?'nhập':'xuất')+'</label><input data-actual-quantity type="number" min="0" max="'+remaining+'" step="0.001" required value="'+remaining+'"><label>Ghi chú theo giấy tờ / chênh lệch</label><textarea data-difference-reason></textarea></section>';
      }).join('')+inputField('note','textarea',false)));
      document.querySelector('label[for="f-note"]').textContent='Số phiếu giấy / ghi chú chung';document.querySelector('#data-form [type=submit]').textContent='Xác nhận ghi sổ';
      bindForm(()=>{
        const allocations=[...document.querySelectorAll('[data-post-index]')].map(row=>{const a=pending[Number(row.dataset.postIndex)];return {allocation_id:String(a.id),stock_request_line_id:String(a.stock_request_line_id),lot_id:String(a.lot_id),location_id:String(a.location_id),quality_bucket:'AVAILABLE',quantity:row.querySelector('[data-actual-quantity]').value,difference_reason:row.querySelector('[data-difference-reason]').value};}).filter(a=>Number(a.quantity)>0);
        if(!allocations.length)throw Error('Nhập ít nhất một số lượng thực tế lớn hơn 0.');
        return {stock_request_id:r.id,task_id:String(taskId),request_version:data.request.version,note:value('note'),allocations};
      },'stock-documents');
    }catch(e){openModal('Không thể ghi phiếu kho',errorHTML(e));}
  };
})();
