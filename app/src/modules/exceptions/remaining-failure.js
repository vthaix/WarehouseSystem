const C=require('../../services/domain/core');
async function validate(c,line,quantity) {
  const [[used]]=await c.execute("SELECT COALESCE(SUM(quantity),0) quantity FROM exception_proposals WHERE qc_inspection_line_id=? AND type='QC_FAILURE' AND action IN ('SCRAP','RETURN_SUPPLIER') AND status='APPLIED'",[line.id]);
  C.fail(C.qty(String(quantity))+C.qty(String(used.quantity),false)>C.qty(String(line.failed_quantity),false),
    'SOURCE_LIMIT_EXCEEDED','Vượt lượng lỗi còn lại chưa xử lý.',409);
}
module.exports={validate};
