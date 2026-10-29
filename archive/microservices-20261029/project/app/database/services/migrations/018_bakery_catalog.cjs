const {identifier:q,tableNames}=require('../../../src/config/service-databases');
const {wrapSql}=require('../../../src/config/vietnamese-sql');
const data=require('../../../src/config/bakery-catalog');
async function migrate(c,source,result){
  const db=result.databases['business-service'].database;
  for(const [table,column,type]of [['LoaiHang','LoaiDanhMuc','VARCHAR(20) NULL'],['MatHang','BangGiaNCC','JSON NULL']]){
    const [found]=await c.execute('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',[db,table,column]);
    if(!found.length)await c.query(`ALTER TABLE ${q(db)}.${q(table)} ADD COLUMN ${q(column)} ${type}`);
  }
  const [[done]]=await c.execute(`SELECT COUNT(*) AS total FROM ${q(db)}.TrangThaiDichVu WHERE Ma='018_bakery_catalog'`);
  if(!Number(done.total)&&process.env.NODE_ENV!=='production'){
    const b=wrapSql(c,tableNames(db));
    await c.beginTransaction();
    try{
      // Retain referenced IDs and histories. Replace the visible demo catalogue;
      // do not purge orders, stock, QC or production records.
      await b.execute('UPDATE items SET is_active=0,is_published=0 WHERE is_active=1');
      await b.execute('UPDATE categories SET is_active=0 WHERE is_active=1');
      const units=new Map(),categories=new Map();
      for(const [code,name]of data.units){await b.execute('INSERT INTO units(code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',[code,name]);const [[r]]=await b.execute('SELECT id FROM units WHERE code=?',[code]);units.set(code,r.id);}
      for(const [code,name,kind]of data.categories){await b.execute('INSERT INTO categories(code,name,is_active,LoaiDanhMuc) VALUES (?,?,1,?) ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=1,LoaiDanhMuc=VALUES(LoaiDanhMuc)',[code,name,kind]);const [[r]]=await b.execute('SELECT id FROM categories WHERE code=?',[code]);categories.set(code,{id:r.id,kind});}
      const [suppliers]=await b.execute('SELECT id,code FROM suppliers WHERE is_active=1 ORDER BY code');
      for(const [code,name,category,unit,price]of data.items){
        const kind=categories.get(category).kind;
        const prices=kind==='MATERIAL'?suppliers.map((s,index)=>({supplier_id:String(s.id),unit_price:(Number(price)*(index===0?1:1.05)).toFixed(4)})):[];
        await b.execute('INSERT INTO items(code,name,category_id,unit_id,kind,reference_price,is_sample,is_published,is_active,version,BangGiaNCC) VALUES (?,?,?,?,?,?,?, ?,1,1,?) ON DUPLICATE KEY UPDATE name=VALUES(name),category_id=VALUES(category_id),unit_id=VALUES(unit_id),kind=VALUES(kind),reference_price=VALUES(reference_price),is_sample=VALUES(is_sample),is_published=VALUES(is_published),is_active=1,BangGiaNCC=VALUES(BangGiaNCC),version=version+1',[code,name,categories.get(category).id,units.get(unit),kind,price,kind==='FINISHED_PRODUCT'?1:0,kind==='FINISHED_PRODUCT'?1:0,JSON.stringify(prices)]);
      }
      for(const [code,name]of [['XUONG-01','Xưởng ahtor'],['XUONG-02','Xưởng edxn'],['XUONG-03','Xưởng trnvnth']])await b.execute('INSERT INTO workshops(code,name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=1',[code,name]);
      for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('018_bakery_catalog',NOW(6))`);
      await c.commit();
    }catch(e){await c.rollback();throw e;}
  }else for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('018_bakery_catalog',NOW(6))`);
}
module.exports={migrate};
