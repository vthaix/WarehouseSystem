const express = require("express"),
  crypto = require("node:crypto");
const C = require("../domain/core");
const { specs, apiOwner, catalogOwner, serviceNames } = require("./contracts");
const { verifier, urlFor } = require("./transport");
const { loadEnv, env } = require("../../config/env");
const { closePool } = require("../../config/database");
const { createRuntime } = require("./runtime");
const cleanUser = (u) => {
  const { password_hash, ...safe } = u;
  return safe;
};
async function actor(runtime, input) {
  C.fail(!input?.id, "UNAUTHENTICATED", "Thiếu người thực hiện.", 401);
  const user = await runtime.users.get("users", input.id);
  C.fail(
    user.status !== "ACTIVE" ||
      (input.session_version != null &&
        input.session_version !== user.session_version),
    "UNAUTHENTICATED",
    "Phiên không còn hiệu lực.",
    401,
  );
  return cleanUser(user);
}
function descriptor(group, method, args) {
  if (Object.hasOwn(specs, group) && specs[group].methods.includes(method))
    return specs[group].owner;
  if (["catalog", "catalogRepository", "catalogWrite"].includes(group)) {
    const methods =
      group === "catalog"
        ? ["list", "get", "lookup", "sampleItems"]
        : group === "catalogRepository"
          ? ["list", "get"]
          : ["create", "update", "remove"];
    C.fail(
      !methods.includes(method),
      "NOT_FOUND",
      "Không có phương thức nội bộ.",
      404,
    );
    return method === "sampleItems"
      ? "business-service"
      : catalogOwner(args[group === "catalogRepository" ? 0 : 1]);
  }
  if (
    group === "lots" &&
    ["createLot", "updateLot", "removeLot"].includes(method)
  )
    return "warehouse-service";
  throw new C.DomainError(404, "NOT_FOUND", "Không có phương thức nội bộ.");
}
function backendApp(runtime) {
  const app = express();
  app.disable("x-powered-by");
  app.get("/health", (_q, r) =>
    r.json({ status: "ok", service: runtime.serviceName }),
  );
  app.get("/health/ready", async (_q, r) => {
    try {
      await runtime.pool.query("SELECT 1");
      r.json({ status: "ready", service: runtime.serviceName });
    } catch {
      r.status(503).json({ status: "not_ready" });
    }
  });
  app.use(
    express.json({
      limit: "256kb",
      verify: (req, _res, buffer) => {
        req.rawBody = buffer.toString("utf8");
      },
    }),
  );
  app.use("/internal", verifier(runtime.serviceName));
  app.post("/internal/v1/invoke", async (req, res) => {
    req.request_id = crypto.randomUUID();
    const { group, method, args } = req.body;
    C.fail(
      !Array.isArray(args) || args.length > 8,
      "VALIDATION_ERROR",
      "Tham số nội bộ không hợp lệ.",
    );
    C.fail(
      descriptor(group, method, args) !== runtime.serviceName,
      "NOT_FOUND",
      "Sai dịch vụ sở hữu.",
      404,
    );
    let target =
      group === "catalogRepository"
        ? runtime.local.catalog.repository
        : runtime.local[group];
    C.fail(
      !target || typeof target[method] !== "function",
      "NOT_FOUND",
      "Phương thức chưa triển khai.",
      404,
    );
    const input = [...args];
    if (!["users", "auth", "catalogRepository"].includes(group))
      input[0] = await actor(runtime, input[0]);
    let result;
    if (group === "users" && method === "hydrate")
      result = await target.get("users", input[0]?.id);
    else result = await target[method](...input);
    if (["users", "auth"].includes(group)) result = cleanUser(result);
    res.json({ data: result });
  });
  const routes = require("../../shared/ModuleRoutes")(runtime);
  app.post("/internal/v1/http", async (req, res, next) => {
    const packet = req.body;
    C.fail(
      !["GET", "POST", "PATCH", "DELETE"].includes(packet.method) ||
        typeof packet.url !== "string" ||
        !packet.url.startsWith("/") ||
        packet.url.startsWith("//"),
      "VALIDATION_ERROR",
      "Đường dẫn nội bộ không hợp lệ.",
    );
    C.fail(
      apiOwner(packet.url) !== runtime.serviceName,
      "NOT_FOUND",
      "Sai dịch vụ sở hữu.",
      404,
    );
    req.user = await actor(runtime, packet.actor);
    req.request_id = packet.request_id || crypto.randomUUID();
    req.method = packet.method;
    req.url = packet.url;
    req.originalUrl = "/api/v1" + packet.url;
    req.body = packet.body || {};
    if (packet.idempotency_key)
      req.headers["idempotency-key"] = packet.idempotency_key;
    routes(req, res, next);
  });
  app.use((_q, _r, next) =>
    next(new C.DomainError(404, "NOT_FOUND", "Không tìm thấy endpoint.")),
  );
  app.use((e, req, res, _next) => {
    if (res.headersSent) return;
    const status = e.status || 500;
    if (status >= 500)
      console.error({
        event: "service_error",
        service: runtime.serviceName,
        code: e.code || "INTERNAL_ERROR",
        request_id: req.request_id,
      });
    res
      .status(status)
      .json({
        error: {
          code: e.code || "INTERNAL_ERROR",
          message: status === 500 ? "Lỗi xử lý dịch vụ." : e.message,
          fields: e.fields || {},
        },
        meta: { request_id: req.request_id },
      });
  });
  return app;
}
async function start(serviceName) {
  try {
    loadEnv();
    C.fail(
      !process.env.INTERNAL_SECRET || process.env.INTERNAL_SECRET.length < 32,
      "CONFIG_ERROR",
      "Thiếu khóa giao tiếp nội bộ.",
      500,
    );
    const runtime = await createRuntime(serviceName),
      config = env();
    let app;
    if (serviceName === "web-gateway") {
      app = require("../web-gateway/compose")(runtime);
      // Existing readiness already checks the session DB; this check covers HTTP peers.
      app.locals.serviceName = serviceName;
    } else app = backendApp(runtime);
    const server = app.listen(config.port, config.host, () =>
      console.log({
        event: "listening",
        service: serviceName,
        port: config.port,
      }),
    );
    let stopping = false;
    const shutdown = () => {
      if (stopping) return;
      stopping = true;
      runtime.stop();
      const timer = setTimeout(() => process.exit(1), 15000);
      timer.unref();
      server.close(async () => {
        await closePool();
        clearTimeout(timer);
      });
      server.closeIdleConnections();
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
    server.on("error", async (e) => {
      console.error({
        event: "server_failed",
        service: serviceName,
        code: e.code,
      });
      runtime.stop();
      await closePool();
      process.exitCode = 1;
    });
    return { app, server, runtime, shutdown };
  } catch (error) {
    await closePool();
    throw error;
  }
}
module.exports = { start, backendApp, descriptor };
