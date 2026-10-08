module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  if (status === 500) console.error("[" + req.request_id + "]", err);
  const message =
    status === 500 ? "Có lỗi hệ thống. Vui lòng thử lại." : err.message;
  if (!req.path.startsWith("/api/"))
    return res.status(status).render("errors/index", {
      title: "Không thể thực hiện",
      status,
      message,
      requestId: req.request_id,
    });
  res.status(status).json({
    error: {
      code: err.code || (status === 400 ? "INVALID_JSON" : "INTERNAL_ERROR"),
      message,
      fields: err.fields || {},
    },
    meta: { request_id: req.request_id },
  });
};
