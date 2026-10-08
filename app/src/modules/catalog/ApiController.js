const { ok } = require("../../utils/response");
module.exports = (catalog) => ({
  list: (resource) => async (req, res) => {
    const result = await catalog.list(req.user, resource, req.query);
    ok(req, res, result.data, 200, result.meta);
  },
  show: (resource) => async (req, res) =>
    ok(req, res, await catalog.get(req.user, resource, req.params.id)),
  samples: async (req, res) => {
    const r = await catalog.sampleItems(req.user, req.query);
    ok(req, res, r.data, 200, r.meta);
  },
  lookup: async (req, res) =>
    ok(
      req,
      res,
      await catalog.lookup(req.user, req.params.resource, req.query),
    ),
});
