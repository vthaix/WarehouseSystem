const { start } = require("../shared/host");
if (require.main === module)
  start("reporting-service").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "reporting-service",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("reporting-service") };
