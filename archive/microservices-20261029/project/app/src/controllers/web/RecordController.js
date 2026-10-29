const { fieldNames } = require("../../config/navigation");
const C = require("../../services/domain/core");
module.exports = (domain, pages) => (req, res) => {
  const context = pages.context(req, req.params.resource);
  const record = domain.result(
    req.user,
    req.params.resource,
    domain.get(req.user, req.params.resource, req.params.id),
  );
  C.fail(
    req.params.resource.startsWith("reports/"),
    "NOT_FOUND",
    "Không tìm thấy chứng từ.",
    404,
  );
  res.render("layouts/main", {
    ...context,
    view: "resources/show",
    record,
    fieldNames,
    boot: JSON.stringify({
      user: context.user,
      csrf: context.csrf,
      current: context.current,
      form: true,
    }),
  });
};
