const {identifier:q}=require('../../../src/config/service-databases');
async function migrate(c,source,result){
  const db=q(result.databases['business-service'].database);
  // Rename only the known demo labels; preserve names edited by the user.
  await c.execute(`UPDATE ${db}.Xuong SET Ten=? WHERE Ma=? AND Ten IN (?,?)`,['Xưởng bánh quy Sweet Bakery','XUONG-01','Xưởng bánh ngọt đóng gói','Xưởng 1']);
  await c.execute(`UPDATE ${db}.Xuong SET Ten=? WHERE Ma=? AND Ten IN (?,?)`,['Xưởng bánh bông lan Sweet Bakery','XUONG-02','Xưởng nướng và đóng gói bánh','Xưởng 2']);
  for(const entry of Object.values(result.databases))await c.query(`INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('016_workshop_display_names',NOW(6))`);
}
module.exports={migrate};
