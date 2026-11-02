const test=require('node:test'),assert=require('node:assert/strict'),codes=require('../../src/shared/readable-codes');
test('business references use Vietnamese supplier, workshop and material words',()=>{
 assert.equal(codes.words('Nguyên liệu Tâm Anh'),'TAM-ANH');assert.equal(codes.words('Thực phẩm Xuân Hoài'),'XUAN-HOAI');assert.equal(codes.words('Xưởng ahtor'),'AHTOR');assert.equal(codes.words('Bột mì'),'BOT-MI');
});
test('readable codes use a transactional ordinal and skip existing references',async()=>{
 let ordinal=0;const c={async execute(sql,values){if(sql.startsWith('INSERT INTO BoDem')){ordinal++;return[{}];}if(sql.startsWith('SELECT SoThuTu'))return[[{ordinal}]];if(sql.startsWith('SELECT id FROM lots'))return[values[0].endsWith('001')?[{id:7}]:[]];throw Error(sql);}};
 assert.equal(await codes.next(c,'lots','NVL','Tâm Anh Bột mì'),'NVL-TAM-ANH-BOT-MI-002');assert.equal(await codes.next(c,'lots','NVL','Tâm Anh Bột mì'),'NVL-TAM-ANH-BOT-MI-003');
});
test('document reference lengths respect database limits and reject dynamic table injection',async()=>{
 const c={async execute(sql){return sql.startsWith('SELECT SoThuTu')?[[{ordinal:1000}]]:[[]];}};
 assert.ok((await codes.next(c,'tasks','CV-XUAT','Một tên xưởng rất dài để kiểm tra độ dài')).length<=40);await assert.rejects(codes.next(c,'lots;DROP','NVL','A'));
});
