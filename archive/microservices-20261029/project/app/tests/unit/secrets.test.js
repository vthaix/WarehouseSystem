const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { provision } = require("../../scripts/setup-secrets.cjs");
test("secret bootstrap preserves existing keys and refuses accidental rotation", () => {
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
      ]).size,
      3,
    );
    assert.equal(read(app, "demo_password"), "123456");
    provision(app, mysql, {});
    assert.equal(read(app, "db_password"), original);
    assert.equal(read(app, "demo_password"), "123456");
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

test("existing demo password survives a rerun without an override", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "warehouse-secrets-"));
  const app = path.join(root, "app"),
    mysql = path.join(root, "mysql");
  try {
    provision(app, mysql, { DEMO_PASSWORD: "custom-demo-password" });
    provision(app, mysql, {});
    assert.equal(
      fs.readFileSync(path.join(app, "demo_password"), "utf8"),
      "custom-demo-password",
    );
    assert.throws(
      () => provision(app, mysql, { DEMO_PASSWORD: "another-password" }),
      /Secret/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
