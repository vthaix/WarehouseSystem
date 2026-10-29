const { start } = require("../shared/host");
if (require.main === module)
  start("notification-service").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "notification-service",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("notification-service") };
