const { getPool } = require("../../config/database");
const clients = require("./clients");
function localRuntime(serviceName, pool) {
  if (serviceName === "business-service") {
    const business = require("../business-service/compose")(pool);
    return {
      catalog: business.contexts.catalog.catalog,
      catalogWrite: business.contexts.catalog.catalogWrite,
      orders: business.contexts.sales.orders,
      ...business.contexts.production,
      purchaseOrders: business.contexts.procurement.purchaseOrders,
      businessPlans: business.planImplementation,
    };
  }
  return require("../" + serviceName + "/compose")(pool);
}
async function createRuntime(serviceName) {
  const pool = getPool();
  await pool.query("SELECT name FROM schema_migrations LIMIT 1");
  if (process.env.SERVICE_DB_LAYOUT === "split") {
    const [ready] = await pool.query(
      "SELECT Ma FROM TrangThaiDichVu WHERE Ma IN ('001_split_existing','002_qualified_views','003_auto_increment','004_partial_receipts','005_quarantine_disposition','006_stock_qc_correction','007_category_images')",
    );
    if (ready.length !== 7)
      throw Error("Service database migration is incomplete.");
  }
  const local =
    serviceName === "web-gateway" ? {} : localRuntime(serviceName, pool);
  const runtime = { ...clients(local, serviceName), pool, local, serviceName };
  if (serviceName === "web-gateway") {
    runtime.store = new (require("../../shared/MySqlSessionStore"))(pool);
    await runtime.store.prune();
    const timer = setInterval(
      () => runtime.store.prune().catch(() => {}),
      60000,
    );
    timer.unref();
    runtime.stop = () => clearInterval(timer);
    runtime.remote = true;
  } else runtime.stop = () => {};
  return runtime;
}
module.exports = { createRuntime };
