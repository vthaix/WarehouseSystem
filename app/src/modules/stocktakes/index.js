module.exports = {
  name: "stocktakes",
  uc: ["UC-13", "UC-15", "UC-28"],
  tables: [
    "stocktakes",
    "stocktake_warehouses",
    "stocktake_assignments",
    "stocktake_lines",
    "stocktake_minutes",
  ],
  resources: ["stocktakes", "stocktake-minutes"],
  screen: "UI-19–21",
  status: "pending",
};
