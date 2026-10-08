const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
function check(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) check(file);
    else if (/\.(cjs|js)$/.test(file)) {
      const result = spawnSync(process.execPath, ["--check", file], {
        stdio: "inherit",
      });
      if (result.status !== 0) process.exit(result.status || 1);
    }
  }
}
for (const dir of ["src", "public", "tests", "e2e", "scripts", "database"])
  check(dir);
console.log("All JavaScript syntax checks passed.");
