module.exports = (pool) => {
  const resources = ["warehouses", "warehouse-locations", "lots"];
  const repository = new (require("../../modules/catalog/CatalogRepository"))(
    pool,
    resources,
  );
  const qualityCampaigns =
    new (require("../../modules/quality/QualityCampaignService"))(pool);
  const stockRequests =
    new (require("../../modules/stock-requests/StockRequestService"))(pool);
  const stocktakes = new (require("../../modules/stocktakes/StocktakeService"))(
    pool,
    qualityCampaigns,
  );
  return {
    catalog: new (require("../../modules/catalog/CatalogService"))(repository),
    catalogWrite: new (require("../../modules/catalog/CatalogWriteService"))(
      pool,
      repository,
      resources,
    ),
    lots: new (require("../../modules/warehouse/LotService"))(pool, repository),
    qualityCampaigns,
    stockRequests,
    stocktakes,
    quality: new (require("../../modules/quality/QualityService"))(pool),
    warehouseFlow:
      new (require("../../modules/warehouse/WarehouseFlowService"))(
        pool,
        stockRequests,
      ),
    warehouseRecords:
      new (require("../../modules/warehouse/WarehouseRecordService"))(pool),
    tasks: new (require("../../modules/tasks/TaskService"))(pool),
    exceptions: new (require("../../modules/exceptions/ExceptionService"))(
      pool,
      stocktakes,
    ),
    customerReturns:
      new (require("../../modules/returns/CustomerReturnService"))(
        pool,
        stocktakes,
      ),
  };
};
