const C = require("../services/domain/core");
module.exports = function counts(body) {
  C.fields(body, ["lines"]);
  C.fail(
    !Array.isArray(body.lines) ||
      body.lines.length < 1 ||
      body.lines.length > 200,
    "VALIDATION_ERROR",
    "Nhập từ 1 đến 200 dòng số đếm.",
  );
  for (const line of body.lines) {
    C.fields(line, ["id", "version", "actual_quantity", "cause"]);
    C.fail(
      !Number.isInteger(line.version) || line.version < 1,
      "VALIDATION_ERROR",
      "Phiên bản không hợp lệ.",
    );
    C.qty(line.actual_quantity, false);
  }
  return body;
};
