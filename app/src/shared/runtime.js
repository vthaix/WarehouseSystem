const { getPool } = require("../config/database");
async function createRuntime() {
  const pool = getPool();
  let connected = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      break;
    } catch (error) {
      if (attempt === 14) throw error;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  if (!connected) throw new Error("CSDL chưa sẵn sàng.");
  if (process.env.AUTO_MIGRATE === "true")
    await require("./migrations").migrate(pool);
  await pool.query("SELECT name FROM schema_migrations");
  await require("../../database/seeders/foundation").seedRoles(pool);
  if (process.env.SEED_DEMO === "true")
    await require("../../database/seeders/foundation").seedDemo(pool);
  const UserRepository = require("../modules/auth/UserRepository"),
    users = new UserRepository(pool);
  const auth = new (require("../modules/auth/AuthService"))(users, pool);
  const catalog = new (require("../modules/catalog/CatalogService"))(
    new (require("../modules/catalog/CatalogRepository"))(pool),
  );
  const catalogWrite = new (require("../modules/catalog/CatalogWriteService"))(pool, catalog.repository);
  const orders = new (require("../modules/customer-orders/OrderService"))(pool);
  const productionPlans = new (require("../modules/production/ProductionPlanService"))(pool);
  const businessPlans = new (require("../modules/business-plans/BusinessPlanService"))(pool);
  const purchaseOrders = new (require("../modules/purchasing/PurchaseOrderService"))(pool);
  const productionReports = new (require("../modules/production/ProductionReportService"))(pool);
  const finishedReports = new (require("../modules/production/FinishedReportService"))(pool);
  const reports = new (require("../modules/reporting/ReportService"))(pool);
  const qualityCampaigns = new (require("../modules/quality/QualityCampaignService"))(pool);
  const quality = new (require("../modules/quality/QualityService"))(pool);
  const stockRequests = new (require("../modules/stock-requests/StockRequestService"))(pool);
  const warehouseFlow = new (require("../modules/warehouse/WarehouseFlowService"))(pool, stockRequests);
  const warehouseRecords = new (require("../modules/warehouse/WarehouseRecordService"))(pool);
  const notifications =
    new (require("../modules/notifications/NotificationService"))(pool);
  const store = new (require("./MySqlSessionStore"))(pool);
  await store.prune();
  const cleanup = setInterval(
    () =>
      store
        .prune()
        .catch(() =>
          console.error(JSON.stringify({ event: "session_cleanup_failed" })),
        ),
    60000,
  );
  cleanup.unref();
  return {
    pool,
    users,
    auth,
    catalog,
    catalogWrite,
    orders,
    productionPlans,
    businessPlans,
    purchaseOrders,
    productionReports,
    finishedReports,
    reports,
    qualityCampaigns,
    quality,
    stockRequests,
    warehouseFlow,
    warehouseRecords,
    notifications,
    store,
    stop: () => clearInterval(cleanup),
  };
}
module.exports = { createRuntime };
