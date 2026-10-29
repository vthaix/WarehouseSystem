const P = require("../services/domain/policy");
module.exports = (roles) => (req, res, next) => {
  try {
    P.role(req.user, roles);
    next();
  } catch (error) {
    next(error);
  }
};
