module.exports = (pool) => {
  const resources = ["categories", "units", "items", "suppliers"];
  const repository = new (require("../../services/shared/catalog/CatalogRepository"))(
    pool,
    resources,
  );
  return {
    catalog: new (require("../../services/shared/catalog/CatalogService"))(repository),
    catalogWrite: new (require("../../services/shared/catalog/CatalogWriteService"))(
      pool,
      repository,
      resources,
    ),
  };
};
