const C = require("../services/domain/core");
const configuration = require("../config/production-recipes.json");
function calculate(outputs, items, config = configuration) {
  C.fail(
    !Array.isArray(outputs) || !outputs.length || outputs.length > 100,
    "VALIDATION_ERROR",
    "Chọn từ 1 đến 100 dòng thành phẩm.",
  );
  const byId = new Map(items.map((i) => [String(i.id), i]));
  const byCode = new Map(items.map((i) => [i.code, i]));
  const totals = new Map(),
    formulas = [];
  for (const output of outputs) {
    C.fields(output, ["item_id", "quantity"]);
    const product = byId.get(String(output.item_id));
    C.fail(
      !product || product.kind !== "FINISHED_PRODUCT" || !product.is_active,
      "VALIDATION_ERROR",
      "Thành phẩm không hợp lệ.",
    );
    const recipe = product && config.recipes[product.code];
    C.fail(
      !recipe,
      "RECIPE_MISSING",
      `Chưa cấu hình công thức cho ${product?.name || output.item_id}. Chọn nhập định lượng thủ công hoặc bổ sung công thức.`,
      422,
    );
    for (const [code, amount] of Object.entries(recipe)) {
      const material = byCode.get(code);
      C.fail(
        !material || material.kind !== "MATERIAL" || !material.is_active,
        "RECIPE_MISSING",
        `NVL ${code} trong công thức chưa hoạt động.`,
        422,
      );
      const key = String(material.id);
      totals.set(
        key,
        (totals.get(key) || 0n) +
          C.qty(String(output.quantity)) * C.qty(amount),
      );
      formulas.push({
        product_code: product.code,
        product_name: product.name,
        item_id: key,
        item_code: code,
        item_name: material.name,
        unit: material.unit_name,
        per_unit_quantity: amount,
        output_quantity: String(output.quantity),
      });
    }
  }
  return {
    version: config.version,
    description: config.description,
    formulas,
    materials: [...totals].map(([item_id, value]) => ({
      item_id,
      required_quantity: C.decimal((value + 999n) / 1000n),
    })),
  };
}
async function fromDatabase(connection, outputs) {
  const [items] = await connection.query(
    "SELECT i.id,i.code,i.name,i.kind,i.is_active,u.name AS unit_name FROM items i JOIN units u ON u.id=i.unit_id",
  );
  return calculate(outputs, items);
}
module.exports = { calculate, fromDatabase };
