module.exports = (pool, plans) => ({
  orders: new (require("../../services/business-service/modules/customer-orders/OrderService"))(pool),
  businessPlans: require("../shared/plan-port")(plans, "SALE"),
});
