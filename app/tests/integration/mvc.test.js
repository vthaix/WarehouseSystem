const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { createApp } = require("../../src/app");
test("EJS renders data and normal HTML login/product forms preserve CSRF, version and replay", async (t) => {
  const app = createApp({ password: "mvc-test-password" }),
    server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = "http://127.0.0.1:" + server.address().port;
  let cookie = "";
  const call = async (url, body) => {
    const res = await fetch(base + url, {
      redirect: "manual",
      method: body ? "POST" : "GET",
      headers: {
        cookie,
        ...(body
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
      },
      ...(body ? { body: new URLSearchParams(body) } : {}),
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return res;
  };
  let res = await call("/dashboard");
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/login");
  res = await call("/login");
  let html = await res.text();
  assert.match(html, /action="\/login"/);
  const csrf = html.match(/name="_csrf" value="([^"]+)"/)[1];
  const before = cookie;
  res = await call("/login", {
    username: "manager",
    password: "mvc-test-password",
    _csrf: "wrong",
  });
  assert.equal(res.status, 403);
  res = await call("/login", {
    username: "manager",
    password: "mvc-test-password",
    _csrf: csrf,
  });
  assert.equal(res.status, 303);
  assert.notEqual(cookie, before);
  res = await call("/products");
  html = await res.text();
  assert.equal(res.status, 200);
  assert.ok(html.includes(app.locals.repo.get("items", "1").name));
  assert.match(html, /<table>/);
  res = await call("/products/create");
  html = await res.text();
  assert.equal(res.status, 200);
  const token = html.match(/name="_csrf" value="([^"]+)"/)[1];
  const key = crypto.randomUUID();
  const body = {
    _csrf: token,
    _key: key,
    code: "MVC-01",
    name: "<script>alert(1)</script>",
    category_id: "1",
    unit_id: "1",
    kind: "MATERIAL",
    reference_price: "25000.1250",
    is_sample: "false",
    is_published: "false",
    is_active: "true",
    description: "SSR",
  };
  res = await call("/products", body);
  assert.equal(res.status, 303);
  const product = app.locals.repo.all("items").find((x) => x.code === "MVC-01");
  assert.ok(product);
  res = await call("/products", body);
  assert.equal(res.status, 303);
  assert.equal(
    app.locals.repo.all("items").filter((x) => x.code === "MVC-01").length,
    1,
  );
  res = await call("/products");
  html = await res.text();
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  res = await call("/products/" + product.id + "/edit");
  assert.equal(res.status, 200);
  const edit = {
    _csrf: token,
    _key: crypto.randomUUID(),
    version: String(product.version),
    name: "Mặt hàng MVC",
    reference_price: "30000",
    is_sample: "false",
    is_published: "false",
    is_active: "true",
    description: "Đã sửa",
  };
  res = await call("/products/" + product.id, edit);
  assert.equal(res.status, 303);
  assert.equal(product.name, "Mặt hàng MVC");
  res = await call("/products/" + product.id, {
    ...edit,
    _key: crypto.randomUUID(),
  });
  assert.equal(res.status, 409);
  res = await call("/records/items/" + product.id);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Mặt hàng MVC/);
  res = await call("/logout", { _csrf: token });
  assert.equal(res.status, 303);
  res = await call("/login");
  html = await res.text();
  const customerToken = html.match(/name="_csrf" value="([^"]+)"/)[1];
  await call("/login", {
    username: "customer",
    password: "mvc-test-password",
    _csrf: customerToken,
  });
  assert.equal((await call("/products")).status, 403);
  assert.equal((await call("/catalog/data?module=items")).status, 403);
});
