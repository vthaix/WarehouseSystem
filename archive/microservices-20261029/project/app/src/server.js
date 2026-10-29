const { loadEnv, env } = require("./config/env");
const { createApp } = require("./app");
const { closePool } = require("./config/database");
async function start() {
  loadEnv();
  const config = env();
  let runtime;
  if (config.storage === "mysql")
    runtime = await require("./shared/runtime").createRuntime();
  else if (config.storage !== "memory")
    throw new Error("STORAGE_DRIVER chỉ nhận mysql hoặc memory.");
  const app = createApp(runtime ? { runtime } : {}),
    server = app.listen(config.port, config.host, () =>
      console.log(
        JSON.stringify({
          event: "listening",
          host: config.host,
          port: config.port,
          storage: config.storage,
          stage: runtime ? "foundation" : "demo",
        }),
      ),
    );
  let stopping = false;
  async function shutdown(signal) {
    if (stopping) return;
    stopping = true;
    console.log(JSON.stringify({ event: "shutdown", signal }));
    runtime?.stop();
    const timeout = setTimeout(() => process.exit(1), 15000);
    timeout.unref();
    server.close(async () => {
      await closePool();
      clearTimeout(timeout);
    });
    server.closeIdleConnections();
  }
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
  server.on("error", async (error) => {
    console.error(JSON.stringify({ event: "server_failed", code: error.code }));
    runtime?.stop();
    await closePool();
    process.exitCode = 1;
  });
  return { app, server, shutdown };
}
if (require.main === module)
  start().catch(async (error) => {
    console.error(
      JSON.stringify({
        event: "startup_failed",
        code: error.code || "CONFIG_ERROR",
        message: error.code
          ? "Không thể khởi động; kiểm tra cấu hình và trạng thái CSDL."
          : error.message,
      }),
    );
    await closePool();
    process.exitCode = 1;
  });
module.exports = { start };
