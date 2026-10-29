module.exports = (pool) => ({
  productionPlans:
    new (require("../../modules/production/ProductionPlanService"))(pool),
  productionReports:
    new (require("../../modules/production/ProductionReportService"))(pool),
  finishedReports:
    new (require("../../modules/production/FinishedReportService"))(pool),
});
