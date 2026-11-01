async function seed(pool){
 const [[done]]=await pool.execute("SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten='demo_supplier_terms_v1'");if(Number(done.total))return;
 const c=await pool.getConnection();try{await c.beginTransaction();const [rows]=await c.execute("SELECT n.MaMatHang AS id,n.BangGiaNCC,cat.code AS category_code FROM NguyenVatLieu n JOIN items i ON i.id=n.MaMatHang JOIN categories cat ON cat.id=i.category_id WHERE i.is_active=1");
 const defaults={BOT:180,'DUONG-MUOI':365,'BO-SUA-TRUNG':30,'MEN-NO':180,NHAN:90,'TRANG-TRI':30,'BAO-BI':730};
 for(const r of rows){if(!defaults[r.category_code])continue;const offers=typeof r.BangGiaNCC==='string'?JSON.parse(r.BangGiaNCC):r.BangGiaNCC||[];let changed=false;for(const o of offers)if(o.shelf_life_days==null){o.shelf_life_days=defaults[r.category_code];changed=true;}if(changed)await c.execute('UPDATE NguyenVatLieu SET BangGiaNCC=? WHERE MaMatHang=?',[JSON.stringify(offers),r.id]);}
 await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',['demo_supplier_terms_v1','0'.repeat(64)]);await c.commit();}catch(e){await c.rollback();throw e}finally{c.release()}
}
module.exports={seed};
