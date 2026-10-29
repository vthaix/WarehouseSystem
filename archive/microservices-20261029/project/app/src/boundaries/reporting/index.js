module.exports = (pool) => ({
  reports: new (require("../../services/reporting-service/modules/reporting/ReportService"))(pool),
});
