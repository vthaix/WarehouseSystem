const { ownerOf } = require("./ownership");
module.exports = function composeBoundaries(pool) {
  const business = require("../services/business-service/compose")(pool);
  const contexts = {
    identity: require("../services/identity-service/compose")(pool),
    ...business.contexts,
    "warehouse-quality": require("../services/warehouse-service/compose")(pool),
    notification: require("../services/notification-service/compose")(pool),
    reporting: require("../services/reporting-service/compose")(pool),
  };
  return { contexts, planImplementation: business.planImplementation, ownerOf };
};
