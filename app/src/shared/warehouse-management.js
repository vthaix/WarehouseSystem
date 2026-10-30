const C=require('../services/domain/core'),P=require('../services/domain/policy');
const direction=resource=>resource==='warehouse-inbound'?'IN':'OUT';
async function list(runtime,user,resource,query){
 P.role(user,['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']);
 return runtime.stockRequests.list(user,{...query,type:direction(resource)});
}
async function get(runtime,user,resource,id){
 P.role(user,['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']);
 const row=await runtime.stockRequests.get(user,id);
 C.fail(row.type!==direction(resource),'NOT_FOUND','Không tìm thấy hồ sơ trong nghiệp vụ này.',404);return row;
}
module.exports={direction,list,get};
