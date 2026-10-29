module.exports = (pages) => (req, res) =>
  res.render("layouts/main", {
    ...pages.context(req),
    view: "dashboard/index",
  });
