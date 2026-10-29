module.exports = (pool) => {
  const resources = ["categories", "units", "items", "suppliers"];
  const repository = new (require("../../modules/catalog/CatalogRepository"))(
    pool,
    resources,
  );
  return {
    catalog: new (require("../../modules/catalog/CatalogService"))(repository),
    catalogWrite: new (require("../../modules/catalog/CatalogWriteService"))(
      pool,
      repository,
      resources,
    ),
  };
};
