const { apiOwner } = require("./contracts");
const { request } = require("./transport");
module.exports = () => async (req, res, next) => {
  try {
    const owner = apiOwner(req.url);
    const response = await request(owner, "/internal/v1/http", {
      url: req.url,
      method: req.method,
      body: req.body,
      actor: { id: req.user.id, session_version: req.user.session_version },
      request_id: req.request_id,
      idempotency_key: req.get("Idempotency-Key"),
    });
    for (const name of ["content-type", "content-disposition", "location"])
      if (response.headers.has(name)) res.set(name, response.headers.get(name));
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    next(e);
  }
};
