module.exports = (pool, plans) => ({
  purchaseOrders:
    new (require("../../modules/purchasing/PurchaseOrderService"))(pool),
  businessPlans: require("../shared/plan-port")(plans, "PURCHASE"),
});
