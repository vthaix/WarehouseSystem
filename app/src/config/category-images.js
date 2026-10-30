const path=require('node:path'),fs=require('node:fs');
const C=require('../services/domain/core');
const directory=()=>path.resolve(process.env.CATEGORY_IMAGE_DIR||path.join(__dirname,'../images/categories'));
const validName=name=>typeof name==='string'&&/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(name);
function validatePath(value){
  if(typeof value==='string'&&value.startsWith('/images/items/'))return require('./item-images').validatePath(value);
  if(value===null||value==='')return null;
  C.fail(typeof value!=='string'||!value.startsWith('/images/categories/'),'VALIDATION_ERROR','Chọn ảnh danh mục đã tải lên.');
  const name=value.slice('/images/categories/'.length);
  C.fail(!validName(name)||!fs.existsSync(path.join(directory(),name)),'VALIDATION_ERROR','Ảnh không tồn tại hoặc đường dẫn không hợp lệ.');
  return value;
}
function decode(body){
  C.fields(body,['data_url']);
  C.fail(typeof body.data_url!=='string','VALIDATION_ERROR','Chọn một ảnh để tải lên.');
  const match=body.data_url.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  C.fail(!match||match[2].length>6990510,'VALIDATION_ERROR','Chỉ nhận ảnh PNG, JPEG hoặc WebP tối đa 5 MB.');
  const bytes=Buffer.from(match[2],'base64');
  C.fail(!bytes.length||bytes.length>5*1024*1024||bytes.toString('base64')!==match[2],'VALIDATION_ERROR','Dữ liệu ảnh không hợp lệ hoặc vượt 5 MB.');
  const type=match[1];
  const valid=type==='png'?bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
    type==='jpeg'?bytes.length>=4&&bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217:
    bytes.length>=16&&bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'&&bytes.readUInt32LE(4)===bytes.length-8;
  C.fail(!valid,'VALIDATION_ERROR','Nội dung file không khớp định dạng ảnh.');
  return {bytes,extension:type==='jpeg'?'jpg':type};
}
module.exports={directory,validName,validatePath,decode};
