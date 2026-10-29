module.exports = {
  name: "reporting",
  uc: ["UC-18", "UC-19", "UC-20", "UC-21"],
  tables: ["inventory_movements", "stock_documents", "stocktake_lines"],
  resources: [
    "reports/inventory",
    "reports/stock-documents",
    "reports/stocktakes",
  ],
  screen: "UI-24–26",
  status: "ready",
};
