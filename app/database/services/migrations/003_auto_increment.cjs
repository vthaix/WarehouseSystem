const { identifier: q } = require("../../../src/config/service-databases");
async function migrate(c, source, result) {
  let completed = 0;
  for (const entry of Object.values(result.databases)) {
    const [rows] = await c.query(
      `SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma='003_auto_increment'`,
    );
    completed += rows.length;
  }
  if (completed === Object.keys(result.databases).length) return;
  for (const object of result.objects.filter(
    (o) => o.type === "BASE TABLE" && o.name !== "LichSuCSDL",
  )) {
    const target = result.databases[result.byTable[object.name]].database;
    const [rows] = await c.execute(
      "SELECT AUTO_INCREMENT n FROM information_schema.TABLES WHERE TABLE_NAME=? AND TABLE_SCHEMA IN (?,?)",
      [object.name, source, target],
    );
    const values = rows.map((r) => r.n).filter((v) => v !== null);
    if (values.length) {
      const next = values.reduce((a, b) => (BigInt(a) > BigInt(b) ? a : b));
      if (!/^\d+$/.test(String(next)))
        throw Error("Invalid auto-increment metadata.");
      await c.query(
        `ALTER TABLE ${q(target)}.${q(object.name)} AUTO_INCREMENT=${next}`,
      );
    }
  }
  for (const entry of Object.values(result.databases))
    await c.query(
      `INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('003_auto_increment',NOW(6))`,
    );
}
module.exports = { migrate };
