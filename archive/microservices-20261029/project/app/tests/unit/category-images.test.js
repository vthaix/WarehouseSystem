const test=require('node:test'),assert=require('node:assert/strict');
const {decode,validatePath,validName}=require('../../src/config/category-images');
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1sAAAAASUVORK5CYII=';
test('category images accept PNG bytes and nullable paths',()=>{assert.equal(decode({data_url:'data:image/png;base64,'+png}).extension,'png');assert.equal(validatePath(null),null);assert.equal(validatePath(''),null);});
test('category images reject false MIME, SVG, invalid base64, oversized files and path traversal',()=>{
 for(const data_url of ['data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,PHNjcmlwdD4=','data:image/jpeg;base64,'+png,'data:image/png;base64,AAAA','data:image/png;base64,'+'A'.repeat(6990512)])assert.throws(()=>decode({data_url}),e=>e.code==='VALIDATION_ERROR');
 assert.equal(validName('../photo.png'),false);assert.throws(()=>validatePath('/images/categories/../../secret.png'),e=>e.code==='VALIDATION_ERROR');
});
