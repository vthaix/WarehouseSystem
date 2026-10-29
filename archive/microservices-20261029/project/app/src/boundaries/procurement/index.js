module.exports = (pool, plans) => ({
  purchaseOrders:
    new (require("../../services/business-service/modules/purchasing/PurchaseOrderService"))(pool),
  businessPlans: require("../shared/plan-port")(plans, "PURCHASE"),
});
