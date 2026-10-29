const P = require("../services/domain/policy");
function ok(req, res, data, status = 200, meta = {}) {
  return res
    .status(status)
    .json({ data, meta: { ...meta, request_id: req.request_id } });
}
function safeUser(u) {
  return {
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    roles: u.roles,
    workshop_ids: u.workshop_ids,
    permissions: [
      ...Object.entries(P.read)
        .filter(
          ([, r]) => r.includes("*") || u.roles.some((x) => r.includes(x)),
        )
        .map(([n]) => "read:" + n),
      ...Object.entries(P.create)
        .filter(([, r]) => u.roles.some((x) => r.includes(x)))
        .map(([n]) => "create:" + n),
    ],
  };
}
module.exports = { ok, safeUser };
