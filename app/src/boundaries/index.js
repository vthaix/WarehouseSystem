const { ownerOf } = require("./ownership");
module.exports = function composeBoundaries(pool) {
  const business = require("../modules/compose-business")(pool);
  const contexts = {
    identity: require("./identity")(pool),
    ...business.contexts,
    "warehouse-quality": require("./warehouse-quality")(pool),
    notification: require("./notification")(pool),
    reporting: require("./reporting")(pool),
  };
  return { contexts, planImplementation: business.planImplementation, ownerOf };
};
