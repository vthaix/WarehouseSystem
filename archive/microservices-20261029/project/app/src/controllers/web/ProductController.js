const crypto = require("node:crypto");
const validate = require("../../validators/product.validator");
module.exports = (products, pages) => {
  function form(req, res, id, error = null, status = 200) {
    const context = pages.context(req, "items"),
      product = id
        ? structuredClone(products.find(req.user, id))
        : { is_active: true, kind: "MATERIAL", reference_price: "0" };
    if (error)
      Object.assign(
        product,
        Object.fromEntries(
          Object.entries(req.body).filter(([k]) => !k.startsWith("_")),
        ),
      );
    res.status(status).render("layouts/main", {
      ...context,
      ...products.formOptions(req.user),
      view: id ? "products/edit" : "products/create",
      product,
      error,
      key: req.body?._key || crypto.randomUUID(),
      boot: JSON.stringify({
        user: context.user,
        csrf: context.csrf,
        current: "items",
        form: true,
      }),
    });
  }
  return {
    create: (req, res) => form(req, res, null),
    edit: (req, res) => form(req, res, req.params.id),
    store: (req, res, next) => {
      try {
        products.save(req.user, null, validate(req.body), req.body._key);
        res.redirect(303, "/products");
      } catch (error) {
        if ([400, 409, 422].includes(error.status))
          return form(req, res, null, error.message, error.status);
        next(error);
      }
    },
    update: (req, res, next) => {
      try {
        products.save(
          req.user,
          req.params.id,
          validate(req.body, true),
          req.body._key,
        );
        res.redirect(303, "/products");
      } catch (error) {
        if ([400, 409, 422].includes(error.status))
          return form(req, res, req.params.id, error.message, error.status);
        next(error);
      }
    },
  };
};
