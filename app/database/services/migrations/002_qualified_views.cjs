const { identifier: q } = require("../../../src/config/service-databases");
async function migrate(c, source, result) {
  const dest = (name) =>
    q(result.databases[result.byTable[name]].database) + "." + q(name);
  for (const { name } of result.objects.filter((o) => o.type === "VIEW")) {
    const [[ddl]] = await c.query(`SHOW CREATE VIEW ${q(source)}.${q(name)}`);
    let sql = ddl["Create View"]
      .replace(/DEFINER=`[^`]+`@`[^`]+`/, "")
      .replace(/SQL SECURITY DEFINER/, "SQL SECURITY INVOKER");
    sql = sql.replace(/VIEW (?:`[^`]+`\.)?`[^`]+` AS/, `VIEW ${dest(name)} AS`);
    sql = sql
      .replaceAll(q(source) + ".", "__SOURCE__.")
      .replace(/__SOURCE__\.`([^`]+)`/g, (_s, t) => dest(t));
    sql = sql.replace(/`([^`]+)`/g, (token, t, offset, text) =>
      result.byTable[t] && text[offset - 1] !== "." ? dest(t) : token,
    );
    await c.query(sql.replace(/^CREATE /, "CREATE OR REPLACE "));
  }
  for (const entry of Object.values(result.databases))
    await c.query(
      `INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('002_qualified_views',NOW(6))`,
    );
}
module.exports = { migrate };
