const { specs, catalogResources, catalogOwner } = require("./contracts");
const { invoke } = require("./transport");
module.exports = function clients(local = {}, serviceName = "web-gateway") {
  const runtime = {};
  for (const [group, spec] of Object.entries(specs)) {
    runtime[group] =
      local[group] ||
      Object.fromEntries(
        spec.methods.map((method) => [
          method,
          (...args) => invoke(spec.owner, group, method, args),
        ]),
      );
  }
  const catalogCall = (group, method, resource, args) => {
    const owner = catalogOwner(resource);
    if (owner === serviceName) {
      const target =
        group === "catalogRepository" ? local.catalog.repository : local[group];
      return target[method](...args);
    }
    return invoke(owner, group, method, args);
  };
  runtime.catalog = {
    supports: (r) => catalogResources.includes(r),
    list: (u, r, ...a) => catalogCall("catalog", "list", r, [u, r, ...a]),
    get: (u, r, ...a) => catalogCall("catalog", "get", r, [u, r, ...a]),
    lookup: (u, r, ...a) => catalogCall("catalog", "lookup", r, [u, r, ...a]),
    sampleItems: (...a) =>
      serviceName === "business-service"
        ? local.catalog.sampleItems(...a)
        : invoke("business-service", "catalog", "sampleItems", a),
    repository: {
      list: (r, ...a) => catalogCall("catalogRepository", "list", r, [r, ...a]),
      get: (r, ...a) => catalogCall("catalogRepository", "get", r, [r, ...a]),
    },
  };
  runtime.catalogWrite = {};
  for (const m of ["create", "update", "remove"])
    runtime.catalogWrite[m] = (u, r, ...a) =>
      catalogCall("catalogWrite", m, r, [u, r, ...a]);
  for (const m of ["createLot", "updateLot", "removeLot"])
    runtime.catalogWrite[m] = (...a) =>
      serviceName === "warehouse-service"
        ? local.lots[m](...a)
        : invoke("warehouse-service", "lots", m, a);
  return runtime;
};
