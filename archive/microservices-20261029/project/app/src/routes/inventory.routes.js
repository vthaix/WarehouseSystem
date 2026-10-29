const express = require("express");
const controllerFactory = require("../controllers/api/InventoryApiController");
module.exports = (service, repo) => {
  const router = express.Router(),
    controller = controllerFactory(service, repo);
  router.get("/sample-items", controller.sampleItems);
  router.get("/lookup/:resource", controller.lookup);
  router.get("/catalog-data", controller.catalogData);
  router.get("/stock-requests/:id/allocations", controller.allocations);
  router.get(
    "/stocktakes/:id/warehouses/:warehouse/lines",
    controller.countLines,
  );
  router.patch(
    "/stocktakes/:id/warehouses/:warehouse/counts",
    require("../middlewares/validate.middleware")(
      require("../validators/inventory.validator"),
    ),
    controller.saveCounts,
  );
  router.post(
    "/stocktakes/:id/warehouses/:warehouse/complete",
    controller.completeCounts,
  );
  router.get("/stocktake-differences", controller.stocktakeDifferences);
  router.get("/reports/inventory/export", controller.exportInventory);
  router.get("/reports/inventory", controller.inventoryReport);
  router.get(
    "/reports/stock-documents/export",
    controller.exportStockDocuments,
  );
  router.get("/reports/stock-documents", controller.stockDocumentsReport);
  router.get("/reports/stocktakes/export", controller.exportStocktakes);
  router.get("/reports/stocktakes", controller.stocktakesReport);
  router.patch("/notifications/:id/read", controller.readNotification);
  return router;
};
