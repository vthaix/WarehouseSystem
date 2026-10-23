const C = require('../services/domain/core');
function localDay(value) {
  const date = new Date(value);
  C.fail(!Number.isFinite(date.getTime()), 'VALIDATION_ERROR', 'Thời gian bắt đầu không hợp lệ.');
  return new Date(date.getTime()+7*3600000).toISOString().slice(0,10);
}
function validateStart(start, lots) {
  const day=localDay(start);
  C.date(day,'start_at',true);
  const received=lots.map(l=>l.received_date).filter(Boolean).sort().at(-1);
  C.fail(received && day<received,'LOT_RECEIPT_DATE_REQUIRED','Ngày bắt đầu kiểm tra không được trước ngày nhận lô hàng.',422,{start_at:['Phải từ ngày nhận lô hàng trở đi']});
}
module.exports={localDay,validateStart};
