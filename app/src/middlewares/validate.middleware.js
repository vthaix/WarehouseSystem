module.exports = (validator) => (req, res, next) => {
  try {
    req.validated = validator(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
