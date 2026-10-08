module.exports = (pages) => (req, res) => {
  const context = pages.context(req, req.webModule);
  const view =
    context.current === "items"
      ? "products/index"
      : context.current === "warehouses"
        ? "warehouses/index"
        : context.current === "reports/inventory"
          ? "inventory/index"
          : context.current === "stock-documents"
            ? req.path === "/stock-out"
              ? "stock-out/index"
              : "stock-in/index"
            : "resources/index";
  res.render("layouts/main", { ...context, view });
};
