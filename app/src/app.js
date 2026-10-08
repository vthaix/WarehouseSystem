const express = require("express"),
  session = require("express-session"),
  helmet = require("helmet"),
  crypto = require("node:crypto"),
  path = require("node:path");
const C = require("./services/domain/core");
const { MemoryRepository } = require("./repositories/memory");
const { WarehouseService } = require("./services/WarehouseService");
const { seed } = require("./repositories/seed");
const AuthService = require("./services/AuthService");
const { sessionUser } = require("./middlewares/auth.middleware");
function createApp(options = {}) {
  if (options.runtime)
    return require("./shared/create-mysql-app")(options.runtime);
  const app = express(),
    repo = options.repo || new MemoryRepository(),
    password = options.password || process.env.DEMO_PASSWORD;
  C.fail(!password, "INTERNAL_ERROR", "Đặt DEMO_PASSWORD trước khi chạy.", 500);
  C.fail(
    process.env.STORAGE_DRIVER && process.env.STORAGE_DRIVER !== "memory",
    "INTERNAL_ERROR",
    "Adapter nghiệp vụ MySQL sẽ được nối sau khi chốt CSDL. Hiện dùng STORAGE_DRIVER=memory.",
    500,
  );
  C.fail(
    process.env.NODE_ENV === "production",
    "INTERNAL_ERROR",
    "Cần CSDL và session store bền vững trước production.",
    500,
  );
  if (!options.repo) seed(repo, password);
  const service = new WarehouseService(repo),
    auth = new AuthService(repo);
  Object.assign(app.locals, { service, repo });
  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(helmet());
  app.use((req, res, next) => {
    req.request_id = crypto.randomUUID();
    res.set("X-Request-Id", req.request_id);
    next();
  });
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "256kb" }));
  app.use(session(require("./config/session")()));
  app.use(sessionUser(repo));
  app.get("/health", (_req, res) =>
    res.json({ status: "ok", storage: "memory-demo", view_engine: "ejs" }),
  );
  app.use("/api/v1", require("./routes/api")({ service, repo, auth }));
  app.use("/api", (_req, res, next) =>
    next(new C.DomainError(404, "NOT_FOUND", "API không tồn tại.")),
  );
  app.use(express.static(path.join(__dirname, "../public"), { index: false }));
  app.use(require("./routes/web")({ service, repo, auth }));
  app.use((_req, res, next) =>
    next(new C.DomainError(404, "NOT_FOUND", "Không tìm thấy trang.")),
  );
  app.use(require("./middlewares/error.middleware"));
  return app;
}
module.exports = { createApp };
