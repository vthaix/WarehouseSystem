const C = require("./domain/core");
class StockInService {
  constructor(domain) {
    this.domain = domain;
  }
  post(user, id, body, key) {
    const request = this.domain.get(user, "stock-requests", id);
    C.fail(
      request.type !== "IN",
      "VALIDATION_ERROR",
      "Yêu cầu không phải phiếu nhập.",
    );
    return this.domain.run(user, "stock-requests", "post", id, body, key);
  }
}
module.exports = StockInService;
