const { getPool } = require("../config/database");
async function createRuntime() {
  const pool = getPool();
  let connected = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      break;
    } catch (error) {
      if (attempt === 14) throw error;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  if (!connected) throw new Error("CSDL chưa sẵn sàng.");
  if (process.env.AUTO_MIGRATE === "true")
    await require("./monolith-migrations").migrate(pool);
  await pool.query("SELECT name FROM schema_migrations");
  await require("../../database/seeders/foundation").seedRoles(pool);
  if (process.env.SEED_DEMO === "true")
    await require("../../database/seeders/monolith").seed(pool);
  await pool.query(
    "INSERT IGNORE INTO NhanVien (MaNguoiDung,MaNhanVien) SELECT DISTINCT u.id,CONCAT('NV-',u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code<>'CUSTOMER'",
  );
  const composition = require("../boundaries")(pool);
  const services = require("../boundaries/legacy-adapter")(composition);
  const { store } = services;
  await store.prune();
  const cleanup = setInterval(
    () =>
      store
        .prune()
        .catch(() =>
          console.error(JSON.stringify({ event: "session_cleanup_failed" })),
        ),
    60000,
  );
  cleanup.unref();
  return {
    pool,
    ...services,
    stop: () => clearInterval(cleanup),
  };
}
module.exports = { createRuntime };
