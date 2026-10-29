const CatalogService = require("../modules/catalog/CatalogService");
const { ownerOf } = require("./ownership");
const C = require("../services/domain/core");
// Compatibility for existing routes/EJS while each resource gains an owner.
module.exports = function legacyAdapter(composition) {
  const b = composition.contexts,
    w = b["warehouse-quality"];
  function catalogOwner(resource) {
    const owner = ownerOf(resource);
    if (!["catalog", "warehouse-quality"].includes(owner))
      throw new Error("Not a catalog endpoint: " + resource);
    return b[owner];
  }
  const repository = {
    supports: (r) => b.catalog.catalog.supports(r) || w.catalog.supports(r),
    list: (r, ...args) => catalogOwner(r).catalog.repository.list(r, ...args),
    get: (r, ...args) => catalogOwner(r).catalog.repository.get(r, ...args),
  };
  const catalogWrite = {};
  for (const method of ["create", "update", "remove"])
    catalogWrite[method] = (user, resource, ...args) =>
      catalogOwner(resource).catalogWrite[method](user, resource, ...args);
  for (const method of ["createLot", "updateLot", "removeLot"])
    catalogWrite[method] = (...args) => w.lots[method](...args);
  const plans = composition.planImplementation;
  const businessPlans = {
    list: (...args) => plans.list(...args),
    get: (...args) => plans.get(...args),
    create: (user, body, ...args) => {
      C.fail(
        !["SALE", "PURCHASE"].includes(body.type),
        "VALIDATION_ERROR",
        "Loại kế hoạch không hợp lệ.",
      );
      return b[ownerOf("business-plans", body.type)].businessPlans.create(
        user,
        body,
        ...args,
      );
    },
  };
  for (const method of ["update", "remove", "review", "cancel"])
    if (typeof plans[method] === "function")
      businessPlans[method] = async (user, id, ...args) => {
        const row = await plans.get(user, id);
        return b[ownerOf("business-plans", row.type)].businessPlans[method](
          user,
          id,
          ...args,
        );
      };
  return {
    ...b.identity,
    ...b.production,
    ...w,
    ...b.notification,
    ...b.reporting,
    orders: b.sales.orders,
    purchaseOrders: b.procurement.purchaseOrders,
    materialCatalog: new (require('../modules/purchasing/MaterialCatalogService'))(composition.planImplementation.pool),
    businessPlans,
    catalog: new CatalogService(repository),
    catalogWrite,
    boundaries: b,
  };
};
