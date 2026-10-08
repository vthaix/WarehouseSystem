const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
function provision(appDir, mysqlDir, env = process.env) {
  fs.mkdirSync(appDir, { recursive: true });
  fs.mkdirSync(mysqlDir, { recursive: true });
  function secret(file, supplied, min = 16) {
    if (fs.existsSync(file)) {
      const value = fs.readFileSync(file, "utf8").trim();
      if (supplied && supplied !== value)
        throw new Error(
          "Secret đã tồn tại: thay đổi cần quy trình xoay khóa, không ghi đè volume.",
        );
      if (value.length < min) throw new Error("Secret hiện tại không hợp lệ.");
      return value;
    }
    const value = supplied || crypto.randomBytes(32).toString("hex");
    if (value.length < min || /[\r\n\0]/.test(value))
      throw new Error("Secret không hợp lệ.");
    fs.writeFileSync(file, value, { flag: "wx", mode: 0o600 });
    return value;
  }
  const password = secret(path.join(appDir, "db_password"), env.DB_PASSWORD);
  const mysqlFile = path.join(mysqlDir, "db_password");
  secret(mysqlFile, password);
  fs.chmodSync(mysqlFile, 0o444);
  const rootFile = path.join(mysqlDir, "root_password");
  secret(rootFile, env.MYSQL_ROOT_PASSWORD);
  fs.chmodSync(rootFile, 0o444);
  secret(path.join(appDir, "session_secret"), env.SESSION_SECRET, 32);
  secret(path.join(appDir, "demo_password"), env.DEMO_PASSWORD, 8);
}
if (require.main === module) {
  try {
    provision(
      "/var/lib/warehouse-app-secrets",
      "/var/lib/warehouse-mysql-secrets",
    );
    console.log("Secrets ready; existing values preserved.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { provision };
