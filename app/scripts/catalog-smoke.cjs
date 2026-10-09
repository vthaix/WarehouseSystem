const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { loadEnv } = require("../src/config/env");
loadEnv();
const { getPool, closePool } = require("../src/config/database");

(async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO !== "true")
    throw new Error("Catalog smoke chỉ chạy với dữ liệu demo ngoài production.");
  const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
  let cookie = "", csrf = "", categoryId, itemId;
  const call = async (path, method = "GET", body) => {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { "X-CSRF-Token": csrf } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return { status: response.status, ...(await response.json()) };
  };
  try {
    csrf = (await call("/api/v1/auth/csrf")).data.csrf_token;
    const login = await call("/api/v1/auth/login", "POST", { username: "manager", password: process.env.DEMO_PASSWORD });
    assert.equal(login.status, 200, JSON.stringify(login));
    csrf = login.data.csrf_token;
    const code = "TEST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
    const created = await call("/api/v1/categories", "POST", { code, name: code, description: "Danh mục thử nghiệm" });
    assert.equal(created.status, 201, JSON.stringify(created));
    categoryId = created.data.id;
    const duplicate = await call("/api/v1/categories", "POST", { code, name: code });
    assert.equal(duplicate.status, 409);
    const updated = await call(`/api/v1/categories/${categoryId}`, "PATCH", { name: code + "-EDIT" });
    assert.equal(updated.status, 200, JSON.stringify(updated));
    const units = await call("/api/v1/lookup/units");
    assert.equal(units.status, 200, JSON.stringify(units));
    const item = await call("/api/v1/items", "POST", {
      category_id: categoryId, unit_id: units.data[0].id, code: code + "-ITEM", name: code + "-ITEM",
      kind: "MATERIAL", reference_price: "10.0000", is_sample: false, is_published: false,
    });
    assert.equal(item.status, 201, JSON.stringify(item));
    itemId = item.data.id;
    assert.equal((await call(`/api/v1/categories/${categoryId}`, "DELETE", {})).status, 409);
    assert.equal((await call(`/api/v1/items/${itemId}`, "PATCH", { version: 99, name: "Sai phiên bản" })).status, 409);
    assert.equal((await call(`/api/v1/items/${itemId}`, "DELETE", { version: item.data.version })).status, 200);
    itemId = undefined;
    assert.equal((await call(`/api/v1/categories/${categoryId}`, "DELETE", {})).status, 200);
    categoryId = undefined;
    console.log("CATALOG PASS: create, duplicate, edit, references, version, delete.");
  } finally {
    const pool = getPool();
    try {
      if (itemId) await pool.execute("DELETE FROM items WHERE id=?", [itemId]);
      if (categoryId) await pool.execute("DELETE FROM categories WHERE id=?", [categoryId]);
    } finally { await closePool(); }
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
