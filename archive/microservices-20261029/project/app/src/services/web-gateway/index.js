const { start } = require("../shared/host");
if (require.main === module)
  start("web-gateway").catch((error) => {
    console.error({
      event: "startup_failed",
      service: "web-gateway",
      code: error.code || "CONFIG_ERROR",
    });
    process.exitCode = 1;
  });
module.exports = { start: () => start("web-gateway") };
