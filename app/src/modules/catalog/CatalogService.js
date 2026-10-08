const P = require("../../services/domain/policy");
const C = require("../../services/domain/core");
class CatalogService {
  constructor(repository) {
    this.repository = repository;
  }
  supports(resource) {
    return this.repository.supports(resource);
  }
  async list(user, resource, query) {
    P.role(
      user,
      resource === "units" ? ["WAREHOUSE_MANAGER"] : P.read[resource],
    );
    return this.repository.list(resource, query);
  }
  async get(user, resource, id) {
    P.role(user, P.read[resource]);
    return this.repository.get(resource, id);
  }
  async sampleItems(user, query = {}) {
    P.role(user, ["CUSTOMER"]);
    return this.repository.list("items", { ...query, sampleOnly: true });
  }
  async lookup(user, resource, query = {}) {
    P.role(user, ["WAREHOUSE_MANAGER"]);
    C.fail(
      !this.supports(resource),
      "NOT_IMPLEMENTED",
      "Dữ liệu chọn chưa được triển khai với MySQL.",
      501,
    );
    return (await this.repository.list(resource, { ...query, per_page: 100 }))
      .data;
  }
}
module.exports = CatalogService;
