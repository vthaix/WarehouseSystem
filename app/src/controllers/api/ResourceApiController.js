const { ok } = require("../../utils/response");
module.exports = (service, n) => ({
  index: (req, res) => {
    const r = service.list(req.user, n, req.query);
    ok(req, res, r.data, 200, r.meta);
  },
  show: (req, res) =>
    ok(
      req,
      res,
      service.result(req.user, n, service.get(req.user, n, req.params.id)),
    ),
  create: (req, res) => {
    const data = service.run(
      req.user,
      n,
      "create",
      null,
      req.body,
      req.get("Idempotency-Key"),
    );
    res.set("Location", "/api/v1/" + n + "/" + data.id);
    ok(req, res, data, 201);
  },
  edit: (req, res) =>
    ok(
      req,
      res,
      service.run(
        req.user,
        n,
        "edit",
        req.params.id,
        req.body,
        req.get("Idempotency-Key"),
      ),
    ),
  delete: (req, res) => {
    service.run(
      req.user,
      n,
      "delete",
      req.params.id,
      req.body,
      req.get("Idempotency-Key"),
    );
    res.sendStatus(204);
  },
  action: (a) => (req, res) =>
    ok(
      req,
      res,
      service.run(
        req.user,
        n,
        a,
        req.params.id,
        req.body,
        req.get("Idempotency-Key"),
      ),
    ),
});
