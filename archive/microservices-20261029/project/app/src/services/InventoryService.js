class InventoryService {
  constructor(domain) {
    this.domain = domain;
  }
  report(user, query) {
    return this.domain.report(user, "inventory", query);
  }
}
module.exports = InventoryService;
