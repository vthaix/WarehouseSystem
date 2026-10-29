const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { matchesChecksum } = require("../../src/shared/migrations");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
test("migration checksums accept Git line-ending conversion but reject SQL edits", () => {
  const sql = "ALTER TABLE Kho ADD COLUMN Demo INT;\n";
  assert.ok(matchesChecksum(sql.replace(/\n/g, "\r\n"), hash(sql)));
  assert.ok(matchesChecksum(sql, hash(sql.replace(/\n/g, "\r\n"))));
  assert.equal(matchesChecksum(sql.replace("INT", "TEXT"), hash(sql)), false);
});
