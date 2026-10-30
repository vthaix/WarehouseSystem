const path=require('node:path'),fs=require('node:fs');
const C=require('../services/domain/core');
const directory=path.resolve(__dirname,'../../public/images/items');
function validatePath(value){
 if(value===null||value==='')return null;
 if(typeof value==='string'&&value.startsWith('/images/categories/'))return require('./category-images').validatePath(value);
 C.fail(typeof value!=='string'||!/^\/images\/items\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(value),'VALIDATION_ERROR','Chọn ảnh mặt hàng hợp lệ.');
 C.fail(!fs.existsSync(path.join(directory,path.basename(value))),'VALIDATION_ERROR','Không tìm thấy ảnh mặt hàng.');
 return value;
}
module.exports={validatePath};
