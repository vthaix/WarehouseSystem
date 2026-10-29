const mysql = require("mysql2/promise"),
  fs = require("node:fs"),
  path = require("node:path");
const { layout, identifier: q } = require("../src/config/service-databases");
(async () => {
  const source = process.env.DB_NAME || "KhoHang",
    databases = layout(source);
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || "mysql",
    user: "root",
    password: fs
      .readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8")
      .trim(),
  });
  try {
    for (const [service, entry] of Object.entries(databases)) {
      const directory = "/var/backups/warehouse/schemas/" + service;
      fs.mkdirSync(directory, { recursive: true });
      let sql = `-- Reference snapshot exported from the current service schema. No seed data; migration/checkpoint provisioning is separate.\n-- Provision ALL databases before restoring cross-schema FKs/views.\nCREATE DATABASE IF NOT EXISTS ${q(entry.database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE ${q(entry.database)};\nSET FOREIGN_KEY_CHECKS=0;\n`;
      const views = [];
      for (const name of [...entry.objects, "LichSuCSDL", "TrangThaiDichVu"]) {
        const [[ddl]] = await c.query(
          `SHOW CREATE TABLE ${q(entry.database)}.${q(name)}`,
        );
        if (ddl["Create Table"]) sql += ddl["Create Table"] + ";\n";
        else
          views.push(
            ddl["Create View"].replace(/DEFINER=`[^`]+`@`[^`]+`/, "") + ";\n",
          );
      }
      sql += views.join("");
      const [triggers] = await c.execute(
        "SELECT TRIGGER_NAME name,EVENT_OBJECT_TABLE table_name,ACTION_TIMING timing,EVENT_MANIPULATION event,ACTION_STATEMENT body FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=?",
        [entry.database],
      );
      for (const t of triggers)
        sql += `DELIMITER $$\nCREATE TRIGGER ${q(t.name)} ${t.timing} ${t.event} ON ${q(t.table_name)} FOR EACH ROW ${t.body}$$\nDELIMITER ;\n`;
      fs.writeFileSync(
        path.join(directory, "001_schema.sql"),
        sql + "SET FOREIGN_KEY_CHECKS=1;\n",
      );
    }
    console.log("Service schema reference snapshots exported.");
  } finally {
    await c.end();
  }
})().catch((e) => {
  console.error({ event: "schema_export_failed", code: e.code });
  process.exitCode = 1;
});
