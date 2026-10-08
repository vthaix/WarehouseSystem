const path = require("node:path");
function loadEnv() {
  const file = path.resolve(__dirname, "../../.env");
  if (require("node:fs").existsSync(file)) process.loadEnvFile(file);
  for (const name of ["DB_PASSWORD", "SESSION_SECRET", "DEMO_PASSWORD"]) {
    const secretFile = process.env[name + "_FILE"];
    if (secretFile) {
      if (process.env[name])
        throw new Error("Chỉ cấu hình " + name + " hoặc " + name + "_FILE.");
      process.env[name] = require("node:fs")
        .readFileSync(secretFile, "utf8")
        .trim();
    }
  }
}
function env() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT không hợp lệ.");
  return {
    port,
    storage: process.env.STORAGE_DRIVER || "memory",
    password: process.env.DEMO_PASSWORD,
    host: process.env.HOST || "127.0.0.1",
  };
}
module.exports = { loadEnv, env };
