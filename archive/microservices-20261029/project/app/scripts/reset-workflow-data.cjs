// Explicit development reset: keep catalog/identity and back up every active schema first.
const fs = require("node:fs"), path = require("node:path"), mysql = require("mysql2/promise");
const ownership = require("../database/services/ownership.json");
const { identifier: q } = require("../src/config/service-databases");
const { backup } = require("./split-service-databases.cjs");
async function resetWorkflowData({ execute = false } = {}) {
  if (!execute || process.env.NODE_ENV === "production")
    throw Error("Development only; requires --execute and stopped application services.");
  const source = process.env.DB_NAME || "KhoHang";
  q(source);
  const c = await mysql.createConnection({ host: process.env.DB_HOST || "mysql", user: "root",
    password: fs.readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8").trim(), dateStrings: true });
  const directory = "/var/backups/warehouse/reset-" + new Date().toISOString().replace(/[:.]/g, "-");
  const keep = new Set(["KhachHang", "Xuong", "NhaCungCap", "LoaiHang", "DonViTinh", "MatHang", "Kho", "ViTriKho"]);
  const system = new Set(["LichSuCSDL", "TrangThaiDichVu", "ChuyenDoiDichVu"]);
  const targets = [], retained = [];
  try {
    for (const [service, entry] of Object.entries(ownership)) {
      const database = source + "_" + entry.suffix;
      const [tables] = await c.execute("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE='BASE TABLE'", [database]);
      if (!tables.length) throw Error("Missing schema: " + database);
      for (const { name } of tables) {
        if (!entry.objects.includes(name) && !system.has(name)) throw Error("Unclassified table: " + database + "." + name);
        const [[{ n }]] = await c.query(`SELECT COUNT(*) n FROM ${q(database)}.${q(name)}`);
        (service === "identity-service" || keep.has(name) || system.has(name) ? retained : targets).push({ database, name, before: Number(n) });
      }
      await backup(c, database, directory);
    }
    // Services are stopped: delete all transactional rows atomically across the six schemas.
    await c.query("SET FOREIGN_KEY_CHECKS=0");
    await c.beginTransaction();
    try {
      for (const t of targets) await c.query(`DELETE FROM ${q(t.database)}.${q(t.name)}`);
      for (const t of [...targets, ...retained]) {
        const [[{ n }]] = await c.query(`SELECT COUNT(*) n FROM ${q(t.database)}.${q(t.name)}`);
        if (Number(n) !== (retained.includes(t) ? t.before : 0)) throw Error("Reset verification failed: " + t.name);
      }
      await c.commit();
    } catch (e) { await c.rollback(); throw e; }
    finally { await c.query("SET FOREIGN_KEY_CHECKS=1"); }
    const checkpoints = "/var/backups/warehouse/demo-workflows";
    if (fs.existsSync(checkpoints)) {
      for (const file of fs.readdirSync(checkpoints).filter(f => /^[a-f0-9]{16}\.json$/.test(f)))
        fs.renameSync(path.join(checkpoints, file), path.join(directory, "checkpoint-" + file));
    }
    const result = { backup: directory, cleared: targets, retained };
    fs.writeFileSync(path.join(directory, "reset-result.json"), JSON.stringify(result, null, 2));
    return result;
  } finally { await c.end(); }
}
if (require.main === module) resetWorkflowData({ execute: process.argv.includes("--execute") })
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { resetWorkflowData };
