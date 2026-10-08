const C = require("./domain/core");
class StockOutService {
  constructor(domain) {
    this.domain = domain;
  }
  post(user, id, body, key) {
    const request = this.domain.get(user, "stock-requests", id);
    C.fail(
      request.type !== "OUT",
      "VALIDATION_ERROR",
      "Yêu cầu không phải phiếu xuất.",
    );
    return this.domain.run(user, "stock-requests", "post", id, body, key);
  }
}
module.exports = StockOutService;
