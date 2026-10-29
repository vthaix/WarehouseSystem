const crypto = require("node:crypto");
const C = require("../domain/core");
function signature(secret, audience, method, url, timestamp, nonce, body) {
  return crypto
    .createHmac("sha256", secret)
    .update([audience, method, url, timestamp, nonce, body].join("\n"))
    .digest("hex");
}
function headers(audience, method, url, body) {
  const secret = process.env.INTERNAL_SECRET;
  C.fail(
    !secret || secret.length < 32,
    "CONFIG_ERROR",
    "Thiếu khóa giao tiếp nội bộ.",
    500,
  );
  const timestamp = String(Date.now()),
    nonce = crypto.randomUUID();
  return {
    "Content-Type": "application/json",
    "X-Service-Time": timestamp,
    "X-Service-Nonce": nonce,
    "X-Service-Signature": signature(
      secret,
      audience,
      method,
      url,
      timestamp,
      nonce,
      body,
    ),
  };
}
function verifier(audience) {
  const seen = new Map();
  return (req, res, next) => {
    try {
      const time = req.get("X-Service-Time"),
        nonce = req.get("X-Service-Nonce"),
        mac = req.get("X-Service-Signature"),
        now = Date.now();
      C.fail(
        !/^\d{13}$/.test(time || "") ||
          Math.abs(now - Number(time)) > 30000 ||
          !nonce ||
          nonce.length > 80 ||
          !/^[a-f0-9]{64}$/.test(mac || ""),
        "UNAUTHENTICATED",
        "Yêu cầu nội bộ không hợp lệ.",
        401,
      );
      const expected = signature(
        process.env.INTERNAL_SECRET,
        audience,
        req.method,
        req.originalUrl,
        time,
        nonce,
        req.rawBody || "",
      );
      C.fail(
        !crypto.timingSafeEqual(
          Buffer.from(expected, "hex"),
          Buffer.from(mac, "hex"),
        ),
        "UNAUTHENTICATED",
        "Chữ ký nội bộ không hợp lệ.",
        401,
      );
      for (const [key, until] of seen) if (until < now) seen.delete(key);
      C.fail(
        seen.has(nonce),
        "REPLAY_REJECTED",
        "Yêu cầu nội bộ đã được sử dụng.",
        409,
      );
      C.fail(
        seen.size > 10000,
        "RATE_LIMITED",
        "Quá nhiều yêu cầu nội bộ.",
        429,
      );
      seen.set(nonce, now + 60000);
      next();
    } catch (e) {
      next(e);
    }
  };
}
function urlFor(service) {
  const key = service.replaceAll("-", "_").toUpperCase() + "_URL";
  return process.env[key] || "http://" + service + ":3000";
}
async function request(service, path, body) {
  const text = JSON.stringify(body);
  let response;
  try {
    response = await fetch(urlFor(service) + path, {
      method: "POST",
      headers: headers(service, "POST", path, text),
      body: text,
      signal: AbortSignal.timeout(
        Number(process.env.SERVICE_TIMEOUT_MS || 15000),
      ),
    });
  } catch (e) {
    throw new C.DomainError(
      e.name === "TimeoutError" ? 504 : 503,
      "SERVICE_UNAVAILABLE",
      "Dịch vụ chưa sẵn sàng hoặc kết quả thao tác chưa xác định. Không tự tạo yêu cầu mới.",
    );
  }
  return response;
}
async function invoke(service, group, method, args) {
  const clean = args.filter(
    (a) => !(a && typeof a === "object" && typeof a.execute === "function"),
  );
  const response = await request(service, "/internal/v1/invoke", {
    group,
    method,
    args: clean,
  });
  const data = await response.json();
  if (!response.ok)
    throw new C.DomainError(
      response.status,
      data.error?.code || "SERVICE_ERROR",
      data.error?.message || "Lỗi dịch vụ.",
      data.error?.fields || {},
    );
  return data.data;
}
module.exports = { signature, headers, verifier, urlFor, request, invoke };
