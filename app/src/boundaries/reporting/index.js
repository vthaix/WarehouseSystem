module.exports = (pool) => ({
  reports: new (require("../../modules/reporting/ReportService"))(pool),
});
