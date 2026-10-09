module.exports = {
  name: "warehouse",
  uc: ["UC-08", "UC-09", "UC-10", "UC-11"],
  tables: [
    "stock_documents",
    "stock_document_lines",
    "inventory_balances",
    "inventory_movements",
    "warehouse_records",
  ],
  resources: ["stock-documents", "warehouse-records"],
  screen: "UI-13–15",
  status: "partial",
};
