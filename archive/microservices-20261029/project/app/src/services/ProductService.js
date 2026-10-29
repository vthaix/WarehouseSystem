const ProductRepository = require("../repositories/ProductRepository");
class ProductService {
  constructor(domain) {
    this.domain = domain;
    this.repository = new ProductRepository(domain.repo);
  }
  find(user, id) {
    const P = require("./domain/policy"),
      C = require("./domain/core");
    P.role(user, P.read.items);
    const product = this.repository.find(id);
    C.fail(
      !this.domain.visible(user, product, "items"),
      "NOT_FOUND",
      "Không tìm thấy mặt hàng.",
      404,
    );
    return product;
  }
  save(user, id, body, key) {
    return this.domain.run(
      user,
      "items",
      id ? "edit" : "create",
      id,
      body,
      key,
    );
  }
  formOptions(user) {
    return {
      categories: this.domain.lookup(user, "categories"),
      units: this.domain.lookup(user, "units"),
    };
  }
}
module.exports = ProductService;
