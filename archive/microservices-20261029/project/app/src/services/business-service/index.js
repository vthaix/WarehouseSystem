const { start } = require("../shared/host");
if (require.main === module)
  start("business-service").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "business-service",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("business-service") };
