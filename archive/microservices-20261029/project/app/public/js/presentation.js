(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('../../src/config/navigation'));
  else root.warehousePresentation=factory(warehouseNavigation);
})(typeof globalThis!=='undefined'?globalThis:this,function(nav){
  const labels={...nav.labels,NORMAL:'Bình thường',HIGH:'Cao',LOW:'Thấp',ACTIVE:'Đang hoạt động',INACTIVE:'Ngừng hoạt động',LOCKED:'Đã khóa',MANUAL:'Lập trực tiếp',PLAN:'Theo kế hoạch',REPORT:'Theo báo cáo',ACTUAL:'Lô thực tế',PURCHASE_PLAN:'Kế hoạch mua nguyên vật liệu',PRODUCTION_PLAN:'Kế hoạch sản xuất',NONE:'Không có',DESCRIBE:'Có mô tả ngoại lệ',APPROVE:'Đồng ý',REJECT:'Không đồng ý',OUTPUT:'Thành phẩm',INPUT:'Nguyên vật liệu',WAREHOUSE_IN:'Nhập kho',WAREHOUSE_OUT:'Xuất kho',PURCHASE_RECEIPT:'Nhập nguyên vật liệu',PRODUCTION_RECEIPT:'Nhập thành phẩm',PRODUCTION_ISSUE:'Xuất nguyên vật liệu sản xuất',SALE_ISSUE:'Xuất thành phẩm giao khách',LOT_INSPECTION:'Kiểm tra lô hàng',READY:'Sẵn sàng',RETURNED:'Đã trả',SUPPLIER:'Nhà cung cấp',CUSTOMER_RETURN:'Hàng khách trả',FINISHED_PART:'Phần lô thành phẩm'};
  const fields={...nav.fieldNames,roles:'Vai trò',role_id:'Vai trò',role_name:'Vai trò',full_name:'Họ và tên',username:'Tên đăng nhập',customer_name:'Khách hàng',supplier_name:'Nhà cung cấp',workshop_name:'Xưởng phụ trách',warehouse_name:'Tên kho',location_name:'Vị trí',location_code:'Mã vị trí',item_code:'Mã mặt hàng',category_name:'Loại hàng',production_plan_code:'Mã kế hoạch sản xuất',customer_order_code:'Mã đơn khách hàng',business_plan_code:'Mã kế hoạch mua / bán',purchase_order_code:'Mã đơn mua',stock_request_code:'Mã yêu cầu kho',stocktake_code:'Mã đợt kiểm kê',unit_name:'Đơn vị tính',unit_id:'Đơn vị tính',created_by:'Người lập',updated_at:'Cập nhật lúc',updated_by:'Người cập nhật',submitted_at:'Thời điểm gửi',submitted_by:'Người gửi',approved_at:'Thời điểm duyệt',approved_by:'Người duyệt',received_at:'Thời điểm tiếp nhận',received_by:'Người tiếp nhận',posted_by:'Người ghi phiếu',rejection_reason:'Lý do từ chối',decision_at:'Thời điểm quyết định',decision_by:'Người quyết định',actor_id:'Người thực hiện',action:'Thao tác',task_id:'Công việc',total_quantity:'Tổng số lượng',line_id:'Dòng chứng từ',quality_bucket:'Nhóm chất lượng',reserved_quantity:'Đang giữ chỗ',available_quantity:'Tồn khả dụng',system_quantity:'Số lượng ghi nhận',difference_reason:'Lý do chênh lệch',remaining_quantity:'Số lượng còn lại',fulfilled_quantity:'Số lượng đã thực hiện',posted_quantity:'Số lượng đã ghi phiếu',allocated_quantity:'Số lượng đã phân công',expected_date:'Ngày dự kiến nhận',source_plan_id:'Kế hoạch nguồn',source_plan_code:'Mã kế hoạch nguồn',source_type:'Loại nguồn',resource_type:'Nghiệp vụ liên quan',resource_id:'Chứng từ liên quan',body:'Nội dung thông báo',subject:'Tiêu đề',read_at:'Đã đọc lúc',remarks:'Kết luận biên bản',conclusion_status:'Trạng thái biên bản',resolution_status:'Trạng thái xử lý',production_receipt_request_id:'Yêu cầu nhập thành phẩm',workshop_id:'Xưởng phụ trách',inspection_campaign_id:'Đợt kiểm tra',production_report_code:'Mã báo cáo sản xuất',finished_report_code:'Mã báo cáo thành phẩm',stocktake_warehouse_id:'Phạm vi kiểm kê',stock_document_id:'Phiếu kho',stock_document_line_id:'Dòng phiếu kho',stock_request_line_id:'Dòng yêu cầu kho',qc_inspection_id:'Phiếu QC/AC',qc_inspection_line_id:'Dòng kết quả QC/AC',original_lot_detail_id:'Dòng lô gốc',original_stock_document_id:'Phiếu giao gốc',sale_plan_id:'Kế hoạch bán',manager_name:'Quản lý kho phụ trách',assignee_name:'Nhân viên được giao',receiver_name:'Nhân viên nhận',address:'Địa chỉ',phone:'Số điện thoại',email:'Địa chỉ email',value:'Giá trị',date:'Ngày',count:'Số lượng',lots:'Các dòng lô',stock:'Hàng tại vị trí',lot_ids:'Các dòng lô được giao',assignee_ids:'Nhân viên được giao',eligible_lots:'Lô có thể chọn',eligible_workshops:'Xưởng có thể nhận đề xuất',inspection:'Kết quả đợt kiểm tra',finished_report_progress:'Đối chiếu tiến độ thành phẩm',reported_outputs:'Thành phẩm đã báo cáo',issued_materials:'nguyên vật liệu đã xuất',reported_materials:'nguyên vật liệu đã báo cáo sử dụng',order_lines:'Chi tiết đơn hàng',created_date:'Ngày lập',expiry_date:'Hạn sử dụng',manufactured_date:'Ngày sản xuất',unit_price:'Đơn giá',line_total:'Thành tiền',total:'Tổng cộng',note:'Ghi chú',KiemSoLuong:'Kiểm số lượng',KiemChatLuong:'Kiểm chất lượng',NguoiLapBienBanDuocChon:'Nhân viên được chỉ định lập biên bản',BienBanKetLuan:'Kết luận biên bản',BienBanTrangThai:'Trạng thái biên bản',BienBanNguoiLap:'Người lập biên bản',BienBanNgayGui:'Ngày gửi biên bản',NgoaiLeMoTa:'Mô tả ngoại lệ',NgoaiLeTrangThai:'Trạng thái ngoại lệ',NgoaiLeCachXuLy:'Cách xử lý ngoại lệ',NgoaiLeYKienPheDuyet:'Ý kiến của chủ xưởng'};
  for(const item of nav.modules)labels[item[0]]=item[1];
  fields.item_kind='Nhóm mặt hàng';
  Object.assign(fields,{catalog_kind:'Nhóm danh mục',supplier_prices:'Đơn giá theo nhà cung cấp',password:'Mật khẩu',deleted:'Đã xóa',workshop_ids:'Xưởng phụ trách',LoaiDanhMuc:'Nhóm danh mục',created_by_name:'Người lập',order_total:'Tổng giá trị đơn hàng',send_to_planner:'Gửi bộ phận lập kế hoạch',return_warehouse_name:'Kho nhận',return_receiver_name:'Nhân viên nhận'});
  Object.assign(labels,{CREATE:'Tạo mới',UPDATE:'Cập nhật',DELETE:'Hủy / xóa',SUBMIT:'Gửi',REVIEW:'Phê duyệt',APPLY:'Thực hiện',POST:'Ghi phiếu',START:'Bắt đầu',CLOSE:'Đóng đợt',COUNTING:'Đang kiểm đếm',DECIDED:'Đã có kết luận',PENDING_QC:'Chờ QC/AC',SAN_XUAT:'Sản xuất',THANH_PHAM:'Thành phẩm',NGUYEN_VAT_LIEU:'Nguyên vật liệu',TRẢ_VỀ:'Hàng trả',TRA_VE:'Hàng trả'});
  function fieldLabel(key){return fields[key]||'Thông tin bổ sung';}
  function date(value){
    if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)){const [y,m,d]=value.split('-');return d+'/'+m+'/'+y;}
    if(!(value instanceof Date)&&!(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)))return null;
    const normalized=typeof value==='string'&&!/(Z|[+-]\d{2}:\d{2})$/.test(value)?value.replace(' ','T')+'Z':value;
    const parsed=new Date(normalized);if(!Number.isFinite(+parsed))return null;
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(parsed).map(p=>[p.type,p.value]));
    return parts.hour+':'+parts.minute+' - '+parts.day+'/'+parts.month+'/'+parts.year;
  }
  function format(value,key='',record={}){
    if(value==null)return key==='counted_quantity'||key==='actual_quantity'?'Chưa kiểm đếm':'—';
    if(key==='code' && record.display_code)return record.display_code;
    if(key==='customer_order_code' && record.customer_order_display_code)return record.customer_order_display_code;
    if(key==='production_plan_code' && record.production_plan_display_code)return record.production_plan_display_code;
    if(['order_total','quoted_total','total_amount','line_total'].includes(key)){
      const [whole, decimals='']=String(value).split('.');
      const fraction=decimals.replace(/0+$/,'');
      return new Intl.NumberFormat('vi-VN').format(BigInt(whole))+(fraction?','+fraction:'')+' ₫';
    }
    if(key==='note' && typeof value==='string'){
      let note=value.replace(/\bNVL\b(?!-)/g,'nguyên vật liệu');
      if(record.production_plan_code && record.production_plan_display_code)note=note.replaceAll(record.production_plan_code,record.production_plan_display_code);
      if(record.customer_order_code && record.customer_order_display_code)note=note.replaceAll(record.customer_order_code,record.customer_order_display_code);
      return note;
    }
    if(key.endsWith('_id')){const name=record[key.slice(0,-3)+'_name'];if(name)return name;}
    if(key==='roles')return (Array.isArray(value)?value:[value]).map(v=>labels[v]||'Vai trò được phân công').join(', ');
    if(typeof value==='boolean'||['is_active','is_sample','is_published','production_completed','send_to_planner','KiemSoLuong','KiemChatLuong'].includes(key))return value===true||value===1||value==='1'?'Có':'Không';
    const time=date(value);if(time)return time;
    if(labels[value])return labels[value];
    if(typeof value==='string'&&/^-?\d+\.\d+$/.test(value))return new Intl.NumberFormat('vi-VN',{maximumFractionDigits:4}).format(Number(value));
    if(typeof value==='object')return Array.isArray(value)?value.map(v=>format(v,key)).join(', '):value.name||value.full_name||value.code||'Thông tin chi tiết';
    return value;
  }
  Object.assign(nav.labels,labels);Object.assign(nav.fieldNames,fields);
  return {labels:nav.labels,fields:nav.fieldNames,fieldLabel,format,date};
});
