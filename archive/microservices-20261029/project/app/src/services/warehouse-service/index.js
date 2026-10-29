const { start } = require("../shared/host");
if (require.main === module)
  start("warehouse-service").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "warehouse-service",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("warehouse-service") };
