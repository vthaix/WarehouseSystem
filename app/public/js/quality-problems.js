(()=>{
  const previousLoad=loadTable;
  loadTable=async function(){
    await previousLoad();
    if(current!=='exception-proposals'||!has(['WAREHOUSE_MANAGER']))return;
    const target=document.querySelector('#table');
    try{
      const rows=(await api('lookup/qc-failed-lines')).data;
      if(current!=='exception-proposals'||document.querySelector('#table')!==target)return;
      target.querySelector('#quality-problems')?.remove();if(!rows.length)return;
      const panel=document.createElement('section');panel.id='quality-problems';panel.className='form-section';
      panel.innerHTML='<h3>Hàng QC lỗi còn cần xử lý</h3><p>Kết quả QC đã ghi nhận; các ngoại lệ trong biên bản đã gửi nằm ở danh sách bên dưới.</p><div class="table-wrap"><table><thead><tr><th>Lô / mặt hàng</th><th>Lượng lỗi còn lại</th><th>Vấn đề</th><th>Thao tác</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.failed_quantity)+'</td><td>'+esc(r.issue||'QC ghi nhận hàng không đạt')+'</td><td><button class="button small" data-quality-problem="'+i+'">Chi tiết / xử lý</button></td></tr>').join('')+'</tbody></table></div>';
      target.prepend(panel);
      panel.querySelectorAll('[data-quality-problem]').forEach(button=>button.onclick=async()=>{
        const row=rows[Number(button.dataset.qualityProblem)];await createForm();const type=document.querySelector('#f-type');if(!type)return;
        type.value='QC_FAILURE';type.dispatchEvent(new Event('change'));document.querySelector('#f-qc_inspection_line_id').value=row.id;document.querySelector('#f-quantity').value=numericInputValue(row.failed_quantity);document.querySelector('#f-reason').value=row.issue||'QC ghi nhận hàng không đạt: '+row.name;
      });
    }catch(e){if(current==='exception-proposals'&&document.querySelector('#table')===target)target.insertAdjacentHTML('afterbegin',errorHTML(e));}
  };
  window.addEventListener('DOMContentLoaded',()=>{if(user&&current==='exception-proposals'&&has(['WAREHOUSE_MANAGER']))loadTable();});
})();
