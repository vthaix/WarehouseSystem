const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");
(async () => {
  try {
    const command = process.argv[2],
      pool = getPool();
    if (command === "migrate")
      await require("../src/shared/migrations").migrate(pool);
    else if (command === "seed")
      await require("../database/seeders/foundation").seedDemo(pool);
    else if (command === "roles")
      await require("../database/seeders/foundation").seedRoles(pool);
    else if (command === "status")
      console.log(
        JSON.stringify(await require("../src/shared/migrations").status(pool)),
      );
    else throw new Error("Dùng: database.cjs migrate | seed | roles | status");
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "database_command_failed",
        code: error.code || "CONFIG_ERROR",
        message: error.code ? "Lệnh CSDL thất bại." : error.message,
      }),
    );
    process.exitCode = 1;
  } finally {
    await closePool();
  }
})();
