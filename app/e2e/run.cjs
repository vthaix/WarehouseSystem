const { spawnSync } = require("node:child_process");
for (const file of ["e2e/browser.cjs", "e2e/ssr.cjs"]) {
  const result = spawnSync(process.execPath, [file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
