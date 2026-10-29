// Internal development utility; no public port and no database root secret in gateway.
const express = require("express"), fs = require("node:fs"), path = require("node:path"), mysql = require("mysql2/promise");
const { enabled } = require("../src/config/reset-tools");
const { verifier } = require("../src/services/shared/transport");
const C = require("../src/services/domain/core");
const { identifier: q } = require("../src/config/service-databases");
const { resetWorkflowData } = require("./reset-workflow-data.cjs");
require("../src/config/env").loadEnv();
const app = express();
app.disable("x-powered-by");
app.get("/health", (_req, res) => res.json({ status: "ok", enabled: enabled() }));
app.use(express.json({ limit: "8kb", verify: (req, _res, buffer) => { req.rawBody = buffer.toString("utf8"); } }));
app.post("/internal/v1/reset", verifier("test-reset"), async (req, res) => {
  C.fail(!enabled(), "NOT_FOUND", "Chức năng test đã tắt.", 404);
  C.fields(req.body, ["key", "actor"]);
  const { key, actor } = req.body;
  C.fail(!/^[a-f0-9-]{36}$/.test(key || "") || !/^[1-9]\d*$/.test(String(actor?.id)), "VALIDATION_ERROR", "Yêu cầu xóa không hợp lệ.");
  const source = process.env.DB_NAME || "KhoHang";
  const c = await mysql.createConnection({ host: process.env.DB_HOST || "mysql", user: "root", password: fs.readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8").trim() });
  let locked = false;
  const directory = "/var/backups/warehouse/test-reset-results/" + source;
  const file = path.join(directory, key + ".json");
  try {
    const [[lock]] = await c.execute("SELECT GET_LOCK(?,0) n", ["warehouse:test-reset:" + source]);
    C.fail(Number(lock.n) !== 1, "TEST_RESET_RUNNING", "Đang có yêu cầu xóa dữ liệu test.", 409);
    locked = true;
    const [[user]] = await c.execute(`SELECT TrangThai,PhienBanPhien FROM ${q(source + "_Identity")}.NguoiDung WHERE MaBanGhi=?`, [actor.id]);
    C.fail(!user || user.TrangThai !== "ACTIVE" || user.PhienBanPhien !== actor.session_version, "UNAUTHENTICATED", "Phiên đăng nhập không còn hiệu lực.", 401);
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (fs.existsSync(file)) {
      const prior = JSON.parse(fs.readFileSync(file, "utf8"));
      C.fail(prior.actor_id !== String(actor.id), "IDEMPOTENCY_CONFLICT", "Mã yêu cầu thuộc tài khoản khác.", 409);
      C.fail(prior.status !== "COMPLETE", "TEST_RESET_UNCERTAIN", "Lần xóa trước chưa xác định kết quả. Kiểm tra bản sao lưu trước khi xóa lại.", 409);
      return res.json({ data: prior.result });
    }
    fs.writeFileSync(file, JSON.stringify({ status: "STARTED", actor_id: String(actor.id), started_at: new Date().toISOString() }), { flag: "wx", mode: 0o600 });
    const result = await resetWorkflowData({ execute: true });
    const summary = { backup: result.backup, cleared_tables: result.cleared.length, message: "Đã xóa dữ liệu nghiệp vụ. Tài khoản và danh mục được giữ nguyên. Vui lòng đăng nhập lại." };
    fs.writeFileSync(file, JSON.stringify({ status: "COMPLETE", actor_id: String(actor.id), result: summary }));
    res.json({ data: summary });
  } finally {
    if (locked) await c.execute("SELECT RELEASE_LOCK(?)", ["warehouse:test-reset:" + source]);
    await c.end();
  }
});
app.use((error, _req, res, _next) => {
  console.error("test_reset_failed", error.code || "RESET_ERROR");
  res.status(error.status || 500).json({ error: { code: error.code || "TEST_RESET_FAILED", message: error instanceof C.DomainError ? error.message : "Không thể hoàn tất xóa dữ liệu. Kiểm tra bản sao lưu trước khi thử lại." } });
});
app.listen(Number(process.env.PORT || 3000), "0.0.0.0");
