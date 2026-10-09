const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
async function migrate(pool) {
  const connection = await pool.getConnection();
  let locked = false;
  try {
    const [[lock]] = await connection.query(
      "SELECT GET_LOCK('warehouse:migrations',30) AS acquired",
    );
    if (Number(lock.acquired) !== 1)
      throw new Error("Không lấy được khóa migration.");
    locked = true;
    await connection.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(150) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB",
    );
    const directory = path.resolve(__dirname, "../../database/migrations");
    const migrations = [
      {
        name: "001_kho_hang.sql",
        file: path.resolve(__dirname, "../../database/adminer/KhoHang.sql"),
      },
      ...fs
        .readdirSync(directory)
        .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
        .sort()
        .map((name) => ({ name, file: path.join(directory, name) })),
    ];
    for (const { name, file } of migrations) {
      const sql = fs.readFileSync(file, "utf8"),
        checksum = crypto.createHash("sha256").update(sql).digest("hex");
      const [existing] = await connection.execute(
        "SELECT checksum FROM schema_migrations WHERE name = ?",
        [name],
      );
      if (existing.length) {
        if (existing[0].checksum !== checksum)
          throw new Error("Migration đã chạy bị thay đổi: " + name);
        continue;
      }
      // These migrations contain DDL only, no routines or semicolons inside strings.
      for (const statement of sql
        .split(/;\s*(?:\r?\n|$)/)
        .map((s) => s.trim())
        .filter(Boolean))
        await connection.query(statement);
      await connection.execute(
        "INSERT INTO schema_migrations (name,checksum) VALUES (?,?)",
        [name, checksum],
      );
      console.log(JSON.stringify({ event: "migration_applied", name }));
    }
  } finally {
    if (locked)
      await connection.query("SELECT RELEASE_LOCK('warehouse:migrations')");
    connection.release();
  }
}
async function status(pool) {
  const [rows] = await pool.query(
    "SELECT name,checksum,applied_at FROM schema_migrations ORDER BY name",
  );
  return rows;
}
module.exports = { migrate, status };
