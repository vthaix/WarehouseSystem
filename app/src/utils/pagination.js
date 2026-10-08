const C = require("../services/domain/core");
module.exports = function pagination(query = {}) {
  const page = Number(query.page || 1),
    perPage = Number(query.per_page || 20);
  C.fail(
    !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(perPage) ||
      perPage < 1 ||
      perPage > 100,
    "VALIDATION_ERROR",
    "Phân trang không hợp lệ.",
  );
  return { page, per_page: perPage, offset: (page - 1) * perPage };
};
