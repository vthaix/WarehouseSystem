module.exports = (pool) => {
  const resources = ["warehouses", "warehouse-locations", "lots"];
  const repository = new (require("../../services/shared/catalog/CatalogRepository"))(
    pool,
    resources,
  );
  const qualityCampaigns =
    new (require("../../services/warehouse-service/modules/quality/QualityCampaignService"))(pool);
  const stockRequests =
    new (require("../../services/warehouse-service/modules/stock-requests/StockRequestService"))(pool);
  const stocktakes = new (require("../../services/warehouse-service/modules/stocktakes/StocktakeService"))(
    pool,
    qualityCampaigns,
  );
  return {
    catalog: new (require("../../services/shared/catalog/CatalogService"))(repository),
    catalogWrite: new (require("../../services/shared/catalog/CatalogWriteService"))(
      pool,
      repository,
      resources,
    ),
    lots: new (require("../../services/warehouse-service/modules/warehouse/LotService"))(pool, repository),
    qualityCampaigns,
    stockRequests,
    stocktakes,
    quality: new (require("../../services/warehouse-service/modules/quality/QualityService"))(pool),
    warehouseFlow:
      new (require("../../services/warehouse-service/modules/warehouse/WarehouseFlowService"))(
        pool,
        stockRequests,
      ),
    warehouseRecords:
      new (require("../../services/warehouse-service/modules/warehouse/WarehouseRecordService"))(pool),
    tasks: new (require("../../services/warehouse-service/modules/tasks/TaskService"))(pool),
    exceptions: new (require("../../services/warehouse-service/modules/exceptions/ExceptionService"))(
      pool,
      stocktakes,
    ),
    customerReturns:
      new (require("../../services/warehouse-service/modules/returns/CustomerReturnService"))(
        pool,
        stocktakes,
      ),
  };
};
