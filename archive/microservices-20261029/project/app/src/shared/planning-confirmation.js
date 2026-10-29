const C=require('../services/domain/core');
function validate(body){
  C.fail(body.confirm_plan_overage!==undefined&&typeof body.confirm_plan_overage!=='boolean','VALIDATION_ERROR','Xác nhận vượt kế hoạch phải là giá trị đúng/sai.');
}
function check(exceeded,confirmed,message){
  if(exceeded&&confirmed!==true)throw new C.DomainError(409,'PLAN_CONFIRMATION_REQUIRED',message+' Bạn có muốn tiếp tục với số lượng này không?');
}
module.exports={validate,check};
