function enabled() {
  return process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_RESET === "true";
}
module.exports = { enabled };
