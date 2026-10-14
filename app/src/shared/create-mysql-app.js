const express = require("express"),
  session = require("express-session"),
  helmet = require("helmet"),
  path = require("node:path"),
  crypto = require("node:crypto");
const {
  requireApiAuth,
  sessionUser,
} = require("../middlewares/auth.middleware");
const { csrf } = require("../middlewares/csrf.middleware");
const C = require("../services/domain/core");
module.exports = function createMysqlApp(runtime) {
  const app = express();
  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.resolve(__dirname, "../views"));
  const trust = process.env.TRUST_PROXY || "0";
  if (/^\d+$/.test(trust)) {
    C.fail(Number(trust) > 5, "CONFIG_ERROR", "TRUST_PROXY tối đa 5 hop.", 500);
    app.set("trust proxy", Number(trust));
  } else {
    C.fail(
      !trust
        .split(",")
        .every((v) => ["loopback", "linklocal", "uniquelocal"].includes(v)),
      "CONFIG_ERROR",
      "TRUST_PROXY không hợp lệ.",
      500,
    );
    app.set("trust proxy", trust.split(","));
  }
  C.fail(
    !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32,
    "CONFIG_ERROR",
    "SESSION_SECRET cần ít nhất 32 ký tự.",
    500,
  );
  C.fail(
    process.env.NODE_ENV === "production" &&
      process.env.COOKIE_SECURE !== "true",
    "CONFIG_ERROR",
    "Production yêu cầu cookie Secure và HTTPS.",
    500,
  );
  app.use(
    helmet({
      strictTransportSecurity: process.env.NODE_ENV === "production",
      contentSecurityPolicy: {
        directives: {
          "upgrade-insecure-requests":
            process.env.NODE_ENV === "production" ? [] : null,
        },
      },
    }),
  );
  app.use((req, res, next) => {
    req.request_id = crypto.randomUUID();
    res.set("X-Request-Id", req.request_id);
    const start = Date.now();
    res.on("finish", () => {
      if (process.env.REQUEST_LOG !== "false")
        console.log(
          JSON.stringify({
            event: "http",
            request_id: req.request_id,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration_ms: Date.now() - start,
          }),
        );
    });
    next();
  });
  app.get("/health", (_req, res) =>
    res.json({
      status: "ok",
      storage: "mysql",
      stage: runtime.remote ? 'microservices-shared-database' : 'foundation',
      view_engine: "ejs",
    }),
  );
  app.get("/health/ready", async (_req, res) => {
    try {
      await runtime.pool.query("SELECT 1");
      if(runtime.remote)await Promise.all(require('../services/shared/contracts').serviceNames.map(async name=>{const response=await fetch(require('../services/shared/transport').urlFor(name)+'/health/ready',{signal:AbortSignal.timeout(3000)});if(!response.ok)throw Error('Service not ready');}));
      res.json({ status: "ready", storage: "mysql", stage: "foundation" });
    } catch {
      res.status(503).json({ status: "not_ready" });
    }
  });
  app.use(express.json({ limit: "256kb",type:req=>req.path!=='/api/v1/category-images'&&Boolean(req.is('application/json')) }));
  app.use(express.urlencoded({ extended: false, limit: "256kb" }));
  app.use(session(require("../config/session")(runtime.store)));
  app.use(sessionUser(runtime.users));
  app.use(require('./CategoryImageRoutes')());
  app.use("/api/v1/auth", require("../routes/auth.routes")(runtime.auth));
  app.use("/api/v1", csrf, requireApiAuth, runtime.remote ? require('../services/shared/api-proxy')(runtime) : require("./ModuleRoutes")(runtime));
  app.use("/api", (_req, res, next) =>
    next(new C.DomainError(404, "NOT_FOUND", "API không tồn tại.")),
  );
  app.use(
    express.static(path.resolve(__dirname, "../../public"), { index: false }),
  );
  app.use(require("./FoundationWebRoutes")(runtime));
  app.use((_req, res, next) =>
    next(new C.DomainError(404, "NOT_FOUND", "Không tìm thấy trang.")),
  );
  app.use(require("../middlewares/error.middleware"));
  app.locals.runtime = runtime;
  return app;
};
