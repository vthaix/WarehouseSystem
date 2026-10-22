const express = require("express");
const { enabled } = require("../config/reset-tools");
const C = require("../services/domain/core");
const { csrf } = require("../middlewares/csrf.middleware");
const { requireApiAuth } = require("../middlewares/auth.middleware");
const { headers } = require("../services/shared/transport");
const { ok } = require("../utils/response");
module.exports = () => {
  const router = express.Router();
  let busy = false, pending = 0;
  function gate(req, res, next) {
    if (!enabled() || req.path === "/api/v1/test-data/reset" || req.path.startsWith("/health") ||
      /^\/(css|js|images)\//.test(req.path)) return next();
    if (busy) return next(new C.DomainError(503, "TEST_RESET_RUNNING", "Hệ thống đang xóa dữ liệu test. Vui lòng đợi và đăng nhập lại."));
    pending++;
    let ended = false;
    const finish = () => { if (!ended) { ended = true; pending--; } };
    res.once("finish", finish);
    res.once("close", finish);
    next();
  }
  router.post("/api/v1/test-data/reset", csrf, requireApiAuth, async (req, res) => {
    C.fail(!enabled(), "NOT_FOUND", "Chức năng test đã tắt.", 404);
    C.fields(req.body, ["confirmation"]);
    C.fail(req.body.confirmation !== "XOA DU LIEU TEST", "VALIDATION_ERROR", "Nhập đúng XOA DU LIEU TEST để xác nhận.");
    const key = req.get("Idempotency-Key");
    C.fail(!/^[a-f0-9-]{36}$/.test(key || ""), "VALIDATION_ERROR", "Thiếu mã yêu cầu xóa dữ liệu.");
    C.fail(busy, "TEST_RESET_RUNNING", "Đang có yêu cầu xóa dữ liệu test.", 409);
    busy = true;
    let uncertain = false;
    try {
      const deadline = Date.now() + 20000;
      while (pending > 0 && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 100));
      C.fail(pending > 0, "TEST_RESET_BUSY", "Còn thao tác đang chạy; chưa xóa dữ liệu. Vui lòng thử lại sau.", 409);
      const url = "/internal/v1/reset";
      const body = JSON.stringify({ key, actor: { id: req.user.id, session_version: req.user.session_version } });
      uncertain = true;
      const response = await fetch((process.env.TEST_RESET_URL || "http://test-reset:3000") + url, {
        method: "POST", headers: headers("test-reset", "POST", url, body), body,
        signal: AbortSignal.timeout(120000),
      });
      const result = await response.json();
      uncertain = response.status >= 500 || result.error?.code === "TEST_RESET_UNCERTAIN";
      C.fail(!response.ok, result.error?.code || "TEST_RESET_FAILED", result.error?.message || "Chưa xác định kết quả xóa. Kiểm tra trước khi thao tác lại.", response.status);
      await new Promise((resolve, reject) => req.session.destroy(e => e ? reject(e) : resolve()));
      ok(req, res, result.data);
    } finally { if (!uncertain) busy = false; }
  });
  return { router, gate };
};
