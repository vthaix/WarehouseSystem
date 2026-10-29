module.exports = {
  name: "production",
  uc: ["UC-34", "UC-35", "SUP-01"],
  tables: [
    "production_plans",
    "production_plan_outputs",
    "production_plan_materials",
    "production_reports",
    "finished_reports",
  ],
  resources: ["production-plans", "production-reports", "finished-reports"],
  screen: "UI-28–29",
  status: "partial",
};
