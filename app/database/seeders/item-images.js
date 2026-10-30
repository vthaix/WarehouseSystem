const manifest=require('../../src/config/item-image-manifest');
async function seed(pool){
 const [[done]]=await pool.execute("SELECT COUNT(*) total FROM LichSuCSDL WHERE Ten='demo_item_images_v1'");if(Number(done.total))return;
 const images=Object.entries(manifest).map(([code,file])=>{const image='/images/items/'+file;require('../../src/config/item-images').validatePath(image);return[image,code];});
 const c=await pool.getConnection();
 try{
  await c.beginTransaction();
  // Upgrade once, preserving existing photos. The checkpoint also preserves
  // deliberately cleared photos on later restarts.
  for(const args of images)await c.execute("UPDATE items SET image_path=? WHERE code=? AND (image_path IS NULL OR image_path='')",args);
  await c.execute('INSERT INTO LichSuCSDL(Ten,MaBam) VALUES (?,?)',['demo_item_images_v1','0'.repeat(64)]);
  await c.commit();
 }catch(e){await c.rollback();throw e}finally{c.release();}
}
module.exports={seed};
