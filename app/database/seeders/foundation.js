const { MemoryRepository } = require("../../src/repositories/memory");
const { seed } = require("../../src/repositories/seed");
const { labels } = require("../../src/config/navigation");
const roleCodes = [
  "CUSTOMER",
  "PLANNER",
  "PURCHASER",
  "WAREHOUSE_MANAGER",
  "WAREHOUSE_STAFF",
  "QC_INSPECTOR",
  "STOCKTAKER",
  "WORKSHOP_OWNER",
  "DIRECTOR",
];
async function seedRoles(pool) {
  for (const code of roleCodes)
    await pool.execute(
      "INSERT INTO roles (code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE id = id",
      [code, labels[code]],
    );
}
async function seedDemo(pool) {
  if (process.env.NODE_ENV === "production")
    throw new Error("Không seed tài khoản demo trong production.");
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8)
    throw new Error("DEMO_PASSWORD phải có ít nhất 8 ký tự.");
  const memory = new MemoryRepository();
  seed(memory, password);
  const c = await pool.getConnection();
  let locked = false;
  try {
    const [[lock]] = await c.query(
      "SELECT GET_LOCK('warehouse:seed',30) AS acquired",
    );
    if (Number(lock.acquired) !== 1)
      throw new Error("Không lấy được khóa seed.");
    locked = true;
    await c.beginTransaction();
    for (const code of roleCodes)
      await c.execute(
        "INSERT INTO roles (code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE id = id",
        [code, labels[code]],
      );
    await c.execute(
      "INSERT INTO workshops (code,name,is_active) VALUES ('XUONG-01','Xưởng sản xuất 1',1) ON DUPLICATE KEY UPDATE id = id",
    );
    const [[workshop]] = await c.execute(
      "SELECT id FROM workshops WHERE code='XUONG-01'",
    );
    for (const u of memory.all("users")) {
      await c.execute(
        "INSERT INTO users (username,password_hash,full_name,status,failed_login_count,session_version,version) VALUES (?,?,?,'ACTIVE',0,1,1) ON DUPLICATE KEY UPDATE id = id",
        [u.username, u.password_hash, u.full_name],
      );
      const [[user]] = await c.execute(
        "SELECT id FROM users WHERE username = ?",
        [u.username],
      );
      for (const role of u.roles)
        await c.execute(
          "INSERT INTO user_roles (user_id,role_id) SELECT ?,id FROM roles WHERE code = ? ON DUPLICATE KEY UPDATE id = user_roles.id",
          [user.id, role],
        );
      if (u.roles.includes("CUSTOMER"))
        await c.execute(
          "INSERT INTO customers (user_id,code,name) VALUES (?,?,?) ON DUPLICATE KEY UPDATE id = id",
          [user.id, "KH-" + u.username, u.full_name],
        );
      if (u.roles.includes("WORKSHOP_OWNER"))
        await c.execute(
          "INSERT INTO workshop_users (workshop_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE id = id",
          [workshop.id, user.id],
        );
      await c.execute(
        "INSERT INTO notifications (user_id,subject,body,resource_type,resource_id,business_key) VALUES (?, 'Chào mừng đến hệ thống', 'Bạn có thể sử dụng các chức năng theo vai trò được cấp.', 'users', ?, 'foundation-welcome-v1') ON DUPLICATE KEY UPDATE id = id",
        [user.id, user.id],
      );
    }
    const maps = {};
    for (const resource of ["categories", "units", "warehouses", "suppliers"]) {
      maps[resource] = {};
      for (const r of memory.all(resource)) {
        const code = r.code || (r.name === "kg" ? "KG" : "CAI");
        if (resource === "units")
          await c.execute(
            "INSERT INTO units (code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE id = id",
            [code, r.name],
          );
        else
          await c.execute(
            "INSERT INTO " +
              resource +
              " (code,name,is_active) VALUES (?,?,1) ON DUPLICATE KEY UPDATE id = id",
            [code, r.name],
          );
        const [[saved]] = await c.execute(
          "SELECT id FROM " + resource + " WHERE code = ?",
          [code],
        );
        maps[resource][r.id] = saved.id;
      }
    }
    for (const r of memory.all("warehouse-locations"))
      await c.execute(
        "INSERT INTO warehouse_locations (warehouse_id,code,name,is_active) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE id = id",
        [maps.warehouses[r.warehouse_id], r.code, r.name],
      );
    for (const r of memory.all("items"))
      await c.execute(
        "INSERT INTO items (category_id,unit_id,code,name,kind,reference_price,is_sample,is_published,is_active,version) VALUES (?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE id = id",
        [
          maps.categories[r.category_id],
          maps.units[r.unit_id],
          r.code,
          r.name,
          r.kind,
          r.reference_price,
          Number(r.is_sample),
          Number(r.is_published),
          1,
        ],
      );
    await require("./sample-catalog").seedSampleCatalog(c);
    await c.commit();
    console.log(
      JSON.stringify({
        event: "demo_seed_complete",
        opening_inventory: "none",
        existing_users: "preserved",
      }),
    );
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    if (locked) await c.query("SELECT RELEASE_LOCK('warehouse:seed')");
    c.release();
  }
}
module.exports = { seedRoles, seedDemo };
