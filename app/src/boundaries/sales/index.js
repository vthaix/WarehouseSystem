module.exports = (pool, plans) => ({
  orders: new (require("../../modules/customer-orders/OrderService"))(pool),
  businessPlans: require("../shared/plan-port")(plans, "SALE"),
});
