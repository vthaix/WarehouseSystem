const test = require("node:test"),
  assert = require("node:assert/strict");
const { calculate } = require("../../src/shared/production-recipes");
const items = [
  {
    id: "1",
    code: "A",
    name: "Bánh A",
    kind: "FINISHED_PRODUCT",
    is_active: 1,
  },
  {
    id: "2",
    code: "B",
    name: "Bánh B",
    kind: "FINISHED_PRODUCT",
    is_active: 1,
  },
  {
    id: "3",
    code: "BOT",
    name: "Bột",
    kind: "MATERIAL",
    is_active: 1,
    unit_name: "kg",
  },
];
const config = {
  version: "TEST",
  recipes: { A: { BOT: "0.120" }, B: { BOT: "0.080" } },
};
test("recipes aggregate multiple ordered cakes into exact base quantities, without reserve", () => {
  const r = calculate(
    [
      { item_id: "1", quantity: "100.000" },
      { item_id: "2", quantity: "50.000" },
    ],
    items,
    config,
  );
  assert.deepEqual(r.materials, [
    { item_id: "3", required_quantity: "16.000" },
  ]);
  assert.equal(r.formulas.length, 2);
});
test("recipes round up only after aggregating fractional material contributions", () => {
  const r = calculate(
    [
      { item_id: "1", quantity: "0.001" },
      { item_id: "2", quantity: "0.001" },
    ],
    items,
    config,
  );
  assert.equal(r.materials[0].required_quantity, "0.001");
});
test("recipes reject missing formulas, inactive ingredients and invalid quantities", () => {
  assert.throws(
    () => calculate([{ item_id: "2", quantity: "1" }], items, { recipes: {} }),
    (e) => e.code === "RECIPE_MISSING",
  );
  assert.throws(
    () =>
      calculate(
        [{ item_id: "1", quantity: "1" }],
        items.map((i) => (i.id === "3" ? { ...i, is_active: 0 } : i)),
        config,
      ),
    (e) => e.code === "RECIPE_MISSING",
  );
  for (const quantity of ["-1", "0", "abc"])
    assert.throws(() => calculate([{ item_id: "1", quantity }], items, config));
});
