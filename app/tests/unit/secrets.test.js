const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { provision } = require("../../scripts/setup-secrets.cjs");
test("secret bootstrap generates distinct strong keys, survives rerun and refuses accidental rotation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "warehouse-secrets-"));
  const app = path.join(root, "app"),
    mysql = path.join(root, "mysql");
  try {
    provision(app, mysql, {});
    const read = (dir, name) => fs.readFileSync(path.join(dir, name), "utf8");
    const original = read(app, "db_password");
    assert.equal(original.length, 64);
    assert.equal(read(mysql, "db_password"), original);
    assert.equal(
      new Set([
        original,
        read(mysql, "root_password"),
        read(app, "session_secret"),
        read(app, "demo_password"),
      ]).size,
      4,
    );
    provision(app, mysql, {});
    assert.equal(read(app, "db_password"), original);
    assert.throws(
      () =>
        provision(app, mysql, {
          DB_PASSWORD: "different-password-for-rotation",
        }),
      /Secret/,
    );
    assert.equal(read(app, "db_password"), original);
    assert.equal(read(mysql, "db_password"), original);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
