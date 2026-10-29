async function prepareDatabase(pool) {
  await pool.query("SELECT 1");
  await require("./monolith-migrations").migrate(pool);
  const seed = require("../../database/seeders/foundation");
  await seed.seedRoles(pool);
  if (process.env.SEED_DEMO === "true") await require('../../database/seeders/monolith').seed(pool);
  await pool.query(
    "INSERT IGNORE INTO NhanVien (MaNguoiDung,MaNhanVien) SELECT DISTINCT u.id,CONCAT('NV-',LEFT(UPPER(u.username),35)) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code<>'CUSTOMER'",
  );
}
module.exports = { prepareDatabase };
