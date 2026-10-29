const test = require("node:test"),
  assert = require("node:assert/strict");
const { boundaries, ownerOf } = require("../../src/boundaries/ownership");
const Repository = require("../../src/modules/catalog/CatalogRepository");
const Writer = require("../../src/modules/catalog/CatalogWriteService");
test("all registered resources have one logical owner; plans require a type", () => {
  assert.equal(Object.keys(boundaries).length, 8);
  for (const m of require("../../src/modules"))
    for (const r of m.resources) {
      if (r === "business-plans") {
        assert.equal(ownerOf(r, "SALE"), "sales");
        assert.equal(ownerOf(r, "PURCHASE"), "procurement");
      } else assert.ok(boundaries[ownerOf(r)]);
    }
  assert.throws(() => ownerOf("business-plans"));
  assert.throws(() => ownerOf("unknown"));
  assert.equal(ownerOf("lots"), "warehouse-quality");
  assert.equal(ownerOf("items"), "catalog");
});
test("catalog and warehouse repositories/writers reject resources outside their ownership before SQL", async () => {
  const pool = {
    execute: () => {
      throw Error("Unexpected SQL");
    },
  };
  const catalog = new Repository(pool, ["items", "suppliers"]);
  const warehouse = new Repository(pool, ["warehouses", "lots"]);
  assert.equal(catalog.supports("lots"), false);
  assert.equal(warehouse.supports("items"), false);
  await assert.rejects(
    catalog.list("warehouses"),
    (e) => e.code === "NOT_IMPLEMENTED",
  );
  const writer = new Writer(pool, catalog, ["items", "suppliers"]);
  await assert.rejects(
    writer.create({ roles: ["WAREHOUSE_MANAGER"] }, "warehouses", {}),
    (e) => e.code === "NOT_IMPLEMENTED",
  );
});
test("plan ports prevent writes through the wrong boundary and force list type", async () => {
  let updates = 0;
  const service = {
    get: async () => ({ id: "1", type: "SALE" }),
    list: async (_, q) => q,
    create: async (_, b) => b,
    update: async () => {
      updates++;
    },
  };
  const make = require("../../src/boundaries/shared/plan-port"),
    sales = make(service, "SALE"),
    procurement = make(service, "PURCHASE");
  assert.equal((await sales.list({}, { type: "PURCHASE" })).type, "SALE");
  await assert.rejects(
    procurement.update({}, "1", {}),
    (e) => e.code === "NOT_FOUND",
  );
  assert.equal(updates, 0);
  assert.throws(
    () => sales.create({}, { type: "PURCHASE" }),
    (e) => e.code === "VALIDATION_ERROR",
  );
  await sales.update({}, "1", {});
  assert.equal(updates, 1);
});
test("composition exposes all eight boundaries and legacy adapter routes catalogs by owner", () => {
  const composition = require("../../src/boundaries")({});
  const runtime = require("../../src/boundaries/legacy-adapter")(composition);
  assert.deepEqual(
    Object.keys(runtime.boundaries).sort(),
    Object.keys(boundaries).sort(),
  );
  assert.equal(runtime.boundaries.catalog.catalog.supports("lots"), false);
  assert.equal(
    runtime.boundaries["warehouse-quality"].catalog.supports("items"),
    false,
  );
  assert.equal(runtime.catalog.supports("items"), true);
  assert.equal(runtime.catalog.supports("lots"), true);
  assert.equal(typeof runtime.catalogWrite.createLot, "function");
  assert.equal(runtime.boundaries.catalog.catalogWrite.createLot, undefined);
});
