// Local domain composition for business-service; database splitting is deferred.
module.exports = (pool) => {
  const plans =
    new (require("./business-plans/BusinessPlanService"))(
      pool,
    );
  return {
    contexts: {
      catalog: require("../boundaries/catalog")(pool),
      sales: require("../boundaries/sales")(pool, plans),
      production: require("../boundaries/production")(pool),
      procurement: require("../boundaries/procurement")(pool, plans),
    },
    planImplementation: plans,
  };
};
