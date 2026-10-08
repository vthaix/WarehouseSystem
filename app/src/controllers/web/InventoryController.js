module.exports = (pages) => (req, res) =>
  res.render("layouts/main", {
    ...pages.context(req, "reports/inventory"),
    view: "inventory/index",
  });
