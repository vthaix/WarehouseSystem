// Run immediately after seeding on an untouched demo database. Read-only.
const fs = require("node:fs"),
  crypto = require("node:crypto"),
  assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const { wrapSql } = require("../src/config/vietnamese-sql");
const { tableNames, identifier } = require("../src/config/service-databases");
require("../src/config/env").loadEnv();
(async () => {
  assert.notEqual(process.env.NODE_ENV, "production");
  const source = process.env.DB_NAME || "KhoHang";
  identifier(source);
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || "mysql",
    user: "root",
    password: fs
      .readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8")
      .trim(),
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  const db = wrapSql(c, tableNames(source + "_Gateway"));
  try {
    const [[customer]] = await db.query(
      "SELECT id,created_at FROM users WHERE username='customer'",
    );
    const hash = crypto
      .createHash("sha256")
      .update(source + JSON.stringify(customer))
      .digest("hex")
      .slice(0, 16);
    const state = JSON.parse(
      fs.readFileSync(
        "/var/backups/warehouse/demo-workflows/" + hash + ".json",
        "utf8",
      ),
    );
    assert.equal(Object.keys(state.scenarios).length, 36);
    if (process.argv.includes("--counts")) {
      const ownership = require("../database/services/ownership.json");
      const counts = [];
      for (const [service, suffix] of [
        ["business-service", "Business"],
        ["warehouse-service", "Warehouse"],
      ]) {
        for (const table of ownership[service].objects) {
          const [[row]] = await c.query(
            "SELECT COUNT(*) AS n FROM " +
              identifier(source + "_" + suffix) +
              "." +
              identifier(table),
          );
          counts.push([service, table, String(row.n)]);
        }
      }
      console.log(
        crypto
          .createHash("sha256")
          .update(JSON.stringify(counts))
          .digest("hex"),
      );
      return;
    }
    async function status(name, record, table, expected, column = "status") {
      const id = state.scenarios[name].records[record].id;
      assert.match(String(id), /^\d+$/);
      const [[row]] = await db.execute(
        `SELECT ${column} AS actual FROM ${table} WHERE id=?`,
        [id],
      );
      assert.ok(row, name + " missing");
      assert.equal(row.actual, expected, name);
    }
    for (const name of ["DON-CHO", "DON-CHO-2"])
      await status(name, "order", "customer_orders", "SUBMITTED");
    await status("TAO-KHSX", "order", "customer_orders", "RECEIVED");
    await status("DUYET-DON", "plan", "production_plans", "DRAFT");
    await status("BAO-CAO-SX", "plan", "production_plans", "APPROVED");
    await status("MUA-NGUON", "report", "production_reports", "SUBMITTED");
    await status("DUYET-MUA", "buyPlan", "business_plans", "PENDING_APPROVAL");
    await status("LAP-DON-MUA", "buyPlan", "business_plans", "APPROVED");
    await status("QC-NVL", "lot", "lots", "PENDING", "qc_status");
    await status("QC-SUA", "lot", "lots", "PASSED", "qc_status");
    await status("YC-SUA", "request", "stock_requests", "PENDING");
    await status("TP-NHAP", "finished", "finished_reports", "DRAFT");
    await status("DUYET-BAN", "sale", "business_plans", "PENDING_APPROVAL");
    await status("YC-XUAT-TP", "sale", "business_plans", "APPROVED");
    await status("DA-GIAO", "order", "customer_orders", "COMPLETED");
    await status("CONG-VIEC", "task", "tasks", "PLANNED");
    await status("KK-CHO", "count", "stocktakes", "PLANNED");
    await status("KK-DEM", "count", "stocktakes", "IN_PROGRESS");
    await status("KK-AP-DUNG", "proposal", "exception_proposals", "APPROVED");
    for (const name of ["TON-KHO", "DA-GIAO"]) {
      const id = state.scenarios[name].records.document.id;
      const [[row]] = await db.execute(
        "SELECT COUNT(*) AS n FROM inventory_movements WHERE stock_document_line_id IN (SELECT id FROM stock_document_lines WHERE stock_document_id=?)",
        [id],
      );
      assert.ok(
        Number(row.n) > 0,
        name + " must originate in real stock movements",
      );
    }
    for (const name of [
      "KK-BIEN-BAN",
      "KK-CHENH-LECH",
      "KK-DUYET",
      "KK-AP-DUNG",
    ]) {
      const id = state.scenarios[name].records.count.id;
      const [[row]] = await db.execute(
        "SELECT COUNT(*) AS n FROM stocktake_lines l JOIN stocktake_warehouses w ON w.id=l.stocktake_warehouse_id WHERE w.stocktake_id=? AND l.system_quantity=20 AND l.actual_quantity=19",
        [id],
      );
      assert.ok(Number(row.n) > 0, name + " needs a real counted difference");
    }
    console.log(
      "DEMO FIXTURES VERIFY PASS: 36 scenarios, waiting orders, source states, posted movements and independent count differences.",
    );
  } finally {
    await c.end();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
