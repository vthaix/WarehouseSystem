async function prepareDatabase(pool) {
  await pool.query("SELECT 1");
  const [[split]] = await pool.query(
    "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='ChuyenDoiDichVu'",
  );
  if (Number(split.n)) {
    const [complete] = await pool.query(
      "SELECT Ma FROM ChuyenDoiDichVu WHERE TrangThai='COMPLETE'",
    );
    if (complete.length) return; // Archived source must never be reseeded after cutover.
  }
  await require("../../shared/migrations").migrate(pool);
  const seed = require("../../../database/seeders/foundation");
  await seed.seedRoles(pool);
  if (process.env.SEED_DEMO === "true") await seed.seedDemo(pool);
  await pool.query(
    "INSERT IGNORE INTO NhanVien (MaNguoiDung,MaNhanVien) SELECT DISTINCT u.id,CONCAT('NV-',LEFT(UPPER(u.username),35)) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code<>'CUSTOMER'",
  );
}
module.exports = { prepareDatabase };
