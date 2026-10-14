const mysql = require("mysql2/promise"),
  fs = require("node:fs");
const { identifier: q } = require("../src/config/service-databases");
function statements(sql) {
  const result = [];
  let buffer = "",
    quote = null,
    delimiter = ";";
  for (let i = 0; i < sql.length; i++) {
    if (!quote && (i === 0 || sql[i - 1] === "\n")) {
      const command = sql.slice(i).match(/^DELIMITER ([^\r\n]+)\r?\n/);
      if (command) {
        delimiter = command[1].trim();
        i += command[0].length - 1;
        continue;
      }
    }
    const ch = sql[i];
    if (quote) {
      buffer += ch;
      if (ch === "\\" && quote !== "`" && i + 1 < sql.length)
        buffer += sql[++i];
      else if (ch === quote) {
        if (sql[i + 1] === quote) buffer += sql[++i];
        else quote = null;
      }
    } else if (["'", '"', "`"].includes(ch)) {
      quote = ch;
      buffer += ch;
    } else if (sql.startsWith(delimiter, i)) {
      if (buffer.trim()) result.push(buffer.trim());
      buffer = "";
      i += delimiter.length - 1;
    } else buffer += ch;
  }
  if (quote || buffer.trim()) throw Error("Incomplete backup SQL.");
  return result;
}
async function main() {
  const source = process.env.SOURCE_DB_NAME || process.env.DB_NAME || "KhoHang";
  q(source);
  const target = source + "_Restore_" + Date.now();
  q(target);
  const file =
    "/var/backups/warehouse/" + source + "-before-service-split-v3.sql";
  const c = await mysql.createConnection({
    host: "mysql",
    user: "root",
    password: fs
      .readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8")
      .trim(),
    dateStrings: true,
  });
  try {
    const [[exists]] = await c.execute(
      "SELECT COUNT(*) n FROM information_schema.SCHEMATA WHERE SCHEMA_NAME=?",
      [target],
    );
    if (Number(exists.n)) throw Error("Restore destination exists.");
    for (let sql of statements(fs.readFileSync(file, "utf8"))) {
      sql = sql.replace(
        /^CREATE DATABASE IF NOT EXISTS `[^`]+`/,
        `CREATE DATABASE ${q(target)}`,
      );
      sql = sql.replace(/^USE `[^`]+`$/, `USE ${q(target)}`);
      if (/^CREATE .*VIEW /s.test(sql))
        sql = sql.replaceAll(q(source) + ".", q(target) + ".");
      await c.query(sql);
    }
    const [tables] = await c.execute(
      "SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE='BASE TABLE' AND TABLE_NAME<>'ChuyenDoiDichVu'",
      [source],
    );
    for (const { name } of tables) {
      const [[counts]] = await c.query(
        `SELECT (SELECT COUNT(*) FROM ${q(source)}.${q(name)}) a,(SELECT COUNT(*) FROM ${q(target)}.${q(name)}) b`,
      );
      if (String(counts.a) !== String(counts.b))
        throw Error("Backup count mismatch: " + name);
      const [columns] = await c.execute(
        "SELECT COLUMN_NAME name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
        [source, name],
      );
      const [keys] = await c.execute(
        "SELECT COLUMN_NAME name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION",
        [source, name],
      );
      const join = keys
          .map((k) => `s.${q(k.name)}=d.${q(k.name)}`)
          .join(" AND "),
        compare = columns
          .map((k) => `BINARY s.${q(k.name)} <=> BINARY d.${q(k.name)}`)
          .join(" AND ");
      const [[mismatch]] = await c.query(
        `SELECT COUNT(*) n FROM ${q(source)}.${q(name)} s LEFT JOIN ${q(target)}.${q(name)} d ON ${join} WHERE d.${q(keys[0].name)} IS NULL OR NOT (${compare})`,
      );
      if (Number(mismatch.n)) throw Error("Backup content mismatch: " + name);
    }
    console.log(
      JSON.stringify({
        event: "backup_restore_verified",
        database: target,
        tables: tables.length,
        source_retained: true,
      }),
    );
  } finally {
    await c.end();
  }
}
if (require.main === module)
  main().catch((e) => {
    console.error({
      event: "backup_restore_failed",
      code: e.code,
      message: e.sqlMessage ? undefined : e.message,
    });
    process.exitCode = 1;
  });
module.exports = { statements };
