const C=require('../services/domain/core');
function timestamp(value,field){
 const match=typeof value==='string'&&value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/);
 C.fail(!match,'VALIDATION_ERROR','Ngày giờ phải hợp lệ và có múi giờ.',422,{[field]:['Kiểm tra ngày giờ']});
 C.date(match[1],field);const offset=match[5]==='Z'?'00:00':match[5].slice(1),[h,m]=offset.split(':').map(Number);
 C.fail(Number(match[2])>23||Number(match[3])>59||Number(match[4]||0)>59||h>14||m>59||(h===14&&m!==0)||!Number.isFinite(Date.parse(value)),'VALIDATION_ERROR','Ngày giờ không hợp lệ.',422,{[field]:['Kiểm tra ngày giờ']});return new Date(value);
}
function actualDate(value,field){C.date(value,field);C.fail(value>C.today(),'VALIDATION_ERROR','Ngày thực tế không được ở tương lai.',422,{[field]:['Không được sau ngày hôm nay']});return value;}
function range(start,end){const a=timestamp(start,'start_at'),b=timestamp(end,'end_at');C.fail(+b<=+a,'VALIDATION_ERROR','Thời gian kết thúc phải sau bắt đầu.');C.fail(require('./qc-schedule-dates').localDay(a)<C.today(),'VALIDATION_ERROR','Ngày bắt đầu không được trong quá khứ.');return {start:a,end:b};}
module.exports={timestamp,actualDate,range};
