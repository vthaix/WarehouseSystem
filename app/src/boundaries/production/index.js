module.exports = (pool) => ({
  productionPlans:
    new (require("../../services/business-service/modules/production/ProductionPlanService"))(pool),
  productionReports:
    new (require("../../services/business-service/modules/production/ProductionReportService"))(pool),
  finishedReports:
    new (require("../../services/business-service/modules/production/FinishedReportService"))(pool),
});
