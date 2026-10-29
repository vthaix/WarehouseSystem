// Same-server physical split. Compatibility views and cross-schema FKs retain
// existing transactions. Never delete source data or overwrite completed copies.
const {
  identifier: q,
  layout,
  owners,
} = require("../../../src/config/service-databases");
const crypto = require("node:crypto");
const migration = "001_split_existing";
async function migrate(connection, source) {
  const databases = layout(source),
    byTable = owners();
  const [objects] = await connection.execute(
    "SELECT TABLE_NAME name,TABLE_TYPE type FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME<>?",
    [source, "ChuyenDoiDichVu"],
  );
  for (const object of objects)
    if (object.name !== "LichSuCSDL" && !byTable[object.name])
      throw Error("Unmapped database object: " + object.name);
  for (const name of Object.keys(byTable))
    if (!objects.some((o) => o.name === name))
      throw Error("Missing source object: " + name);
  for (const entry of Object.values(databases))
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${q(entry.database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  await connection.query(
    `CREATE TABLE IF NOT EXISTS ${q(source)}.ChuyenDoiDichVu (Ma VARCHAR(100) PRIMARY KEY, TrangThai VARCHAR(20) NOT NULL, CauHinh CHAR(64) NOT NULL, DoiSoat JSON NULL, NgayHoanThanh DATETIME(6) NULL)`,
  );
  const [[previous]] = await connection.execute(
    `SELECT * FROM ${q(source)}.ChuyenDoiDichVu WHERE Ma=?`,
    [migration],
  );
  const fingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify(databases))
    .digest("hex");
  if (previous) {
    if (previous.CauHinh !== fingerprint)
      throw Error("Split ownership changed: create a new migration.");
    if (previous.TrangThai === "COMPLETE")
      return { databases, byTable, objects, alreadyApplied: true };
  } else {
    for (const { database } of Object.values(databases)) {
      const [[row]] = await connection.execute(
        "SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA=?",
        [database],
      );
      if (Number(row.n)) throw Error("Destination is not empty: " + database);
    }
    await connection.execute(
      `INSERT INTO ${q(source)}.ChuyenDoiDichVu VALUES (?, 'STARTED', ?, NULL, NULL)`,
      [migration, fingerprint],
    );
  }
  const destination = (name) => {
    if (!byTable[name]) throw Error("Unmapped referenced table: " + name);
    return `${q(databases[byTable[name]].database)}.${q(name)}`;
  };
  const tables = objects.filter(
    (o) => o.type === "BASE TABLE" && o.name !== "LichSuCSDL",
  );
  const foreignKeys = [],
    views = [];
  for (const { name } of tables) {
    const [[ddl]] = await connection.query(
      `SHOW CREATE TABLE ${q(source)}.${q(name)}`,
    );
    for (const line of ddl["Create Table"].split("\n"))
      if (/FOREIGN KEY/.test(line))
        foreignKeys.push({
          table: name,
          clause: line
            .trim()
            .replace(/,$/, "")
            .replace(
              /REFERENCES (?:`[^`]+`\.)?`([^`]+)`/g,
              (_s, parent) => "REFERENCES " + destination(parent),
            ),
        });
    await connection.query(
      `CREATE TABLE IF NOT EXISTS ${destination(name)} LIKE ${q(source)}.${q(name)}`,
    );
  }
  if (!previous || previous.TrangThai === "STARTED") {
    await connection.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await connection.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    try {
      const counts = {};
      for (const { name } of tables) {
        const [columns] = await connection.execute(
          "SELECT COLUMN_NAME name,EXTRA extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION",
          [source, name],
        );
        const cols = columns
          .filter((c) => !/(VIRTUAL|STORED) GENERATED/.test(c.extra))
          .map((c) => q(c.name))
          .join(",");
        const [[target]] = await connection.query(
          `SELECT COUNT(*) n FROM ${destination(name)}`,
        );
        if (Number(target.n))
          throw Error("Uncommitted split destination has data: " + name);
        await connection.query(
          `INSERT INTO ${destination(name)} (${cols}) SELECT ${cols} FROM ${q(source)}.${q(name)}`,
        );
        const [[a]] = await connection.query(
            `SELECT COUNT(*) n FROM ${q(source)}.${q(name)}`,
          ),
          [[b]] = await connection.query(
            `SELECT COUNT(*) n FROM ${destination(name)}`,
          );
        if (String(a.n) !== String(b.n))
          throw Error("Copy count mismatch: " + name);
        // Compare EVERY persisted column using NULL-safe equality and primary key.
        const [keys] = await connection.execute(
          "SELECT COLUMN_NAME name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION",
          [source, name],
        );
        if (!keys.length)
          throw Error("Source table lacks a primary key: " + name);
        const join = keys
          .map((c) => `s.${q(c.name)}=d.${q(c.name)}`)
          .join(" AND ");
        const compare = columns
          .map((c) => `BINARY s.${q(c.name)} <=> BINARY d.${q(c.name)}`)
          .join(" AND ");
        const [[mismatch]] = await connection.query(
          `SELECT COUNT(*) n FROM ${q(source)}.${q(name)} s LEFT JOIN ${destination(name)} d ON ${join} WHERE d.${q(keys[0].name)} IS NULL OR NOT (${compare})`,
        );
        if (Number(mismatch.n)) throw Error("Copy content mismatch: " + name);
        counts[name] = String(a.n);
      }
      await connection.execute(
        `UPDATE ${q(source)}.ChuyenDoiDichVu SET TrangThai='COPIED',DoiSoat=? WHERE Ma=?`,
        [JSON.stringify(counts), migration],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
  for (const { table, clause } of foreignKeys) {
    const constraint = clause.match(/^CONSTRAINT `([^`]+)`/)[1];
    const [exists] = await connection.execute(
      "SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME=? AND CONSTRAINT_NAME=?",
      [databases[byTable[table]].database, table, constraint],
    );
    if (!exists.length)
      await connection.query(`ALTER TABLE ${destination(table)} ADD ${clause}`);
  }
  for (const { name } of objects.filter((o) => o.type === "VIEW")) {
    const [[ddl]] = await connection.query(
      `SHOW CREATE VIEW ${q(source)}.${q(name)}`,
    );
    let sql = ddl["Create View"]
      .replace(/DEFINER=`[^`]+`@`[^`]+`/, "")
      .replace(/SQL SECURITY DEFINER/, "SQL SECURITY INVOKER");
    sql = sql.replace(/VIEW `[^`]+` AS/, `VIEW ${destination(name)} AS`);
    sql = sql.replaceAll(q(source) + ".", "__SOURCE__.");
    sql = sql.replace(/__SOURCE__\.`([^`]+)`/g, (_s, table) =>
      destination(table),
    );
    sql = sql.replace(/`([^`]+)`/g, (token, table, offset, text) =>
      byTable[table] && text[offset - 1] !== "." ? destination(table) : token,
    );
    views.push({ name, sql });
  }
  let pending = views;
  while (pending.length) {
    const failed = [];
    let last;
    for (const view of pending)
      try {
        await connection.query(
          view.sql.replace(/^CREATE /, "CREATE OR REPLACE "),
        );
      } catch (error) {
        failed.push(view);
        last = error;
      }
    if (failed.length === pending.length) throw last;
    pending = failed;
  }
  const [triggers] = await connection.execute(
    "SELECT TRIGGER_NAME name,EVENT_OBJECT_TABLE table_name,ACTION_TIMING timing,EVENT_MANIPULATION event,ACTION_STATEMENT body FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=?",
    [source],
  );
  for (const trigger of triggers) {
    const db = databases[byTable[trigger.table_name]].database;
    const [exists] = await connection.execute(
      "SELECT 1 FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=? AND TRIGGER_NAME=?",
      [db, trigger.name],
    );
    if (!exists.length) {
      await connection.query("USE " + q(db));
      await connection.query(
        `CREATE TRIGGER ${q(trigger.name)} ${trigger.timing} ${trigger.event} ON ${q(trigger.table_name)} FOR EACH ROW ${trigger.body}`,
      );
    }
  }
  for (const [service, entry] of Object.entries(databases)) {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS ${q(entry.database)}.LichSuCSDL LIKE ${q(source)}.LichSuCSDL`,
    );
    await connection.query(
      `INSERT IGNORE INTO ${q(entry.database)}.LichSuCSDL SELECT * FROM ${q(source)}.LichSuCSDL`,
    );
    for (const object of objects)
      if (object.name !== "LichSuCSDL" && byTable[object.name] !== service)
        await connection.query(
          `CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.${q(object.name)} AS SELECT * FROM ${destination(object.name)}`,
        );
    await connection.query(
      `CREATE TABLE IF NOT EXISTS ${q(entry.database)}.TrangThaiDichVu (Ma VARCHAR(100) PRIMARY KEY, NgayHoanThanh DATETIME(6) NOT NULL)`,
    );
    await connection.execute(
      `INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES (?,NOW(6))`,
      [migration],
    );
  }
  await connection.execute(
    `UPDATE ${q(source)}.ChuyenDoiDichVu SET TrangThai='COMPLETE',NgayHoanThanh=NOW(6) WHERE Ma=?`,
    [migration],
  );
  return { databases, byTable, objects, alreadyApplied: false };
}
module.exports = { migrate, migration };
