const { start } = require("../shared/host");
if (require.main === module)
  start("identity-service").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "identity-service",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("identity-service") };
