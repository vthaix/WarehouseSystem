const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  layout,
  owners,
  identifier,
} = require("../../src/config/service-databases");
const aliases = require("../../database/adminer/identifiers.json");
const grants = require("../../database/services/compatibility-grants.json");
test('service credentials share the Compose naming convention and support overrides',()=>{
  const {credentialsFor}=require('../../src/config/service-credentials');
  for(const service of Object.keys(require('../../database/services/ownership.json'))){
    const prefix=service==='web-gateway'?'gateway':service.replace('-service','');
    assert.deepEqual(credentialsFor(service,{}),{user:prefix+'_db',password:prefix+'123'});
  }
  assert.deepEqual(credentialsFor('identity-service',{IDENTITY_DB_USER:'custom_identity',IDENTITY_DB_PASSWORD:'different123'}),{user:'custom_identity',password:'different123'});
  assert.throws(()=>credentialsFor('identity-service',{IDENTITY_DB_USER:'bad;sql'}));
});
test("SQL targets owner schemas without changing string literals", () => {
  const { translateSql } = require("../../src/config/vietnamese-sql");
  const { tableNames } = require("../../src/config/service-databases");
  const result = translateSql(
    "SELECT u.id FROM users u JOIN customer_orders o ON o.customer_id=u.id WHERE u.username='users'",
    tableNames("KhoHang_Warehouse"),
  );
  assert.equal(
    result,
    "SELECT u.MaBanGhi FROM `KhoHang_Identity`.`NguoiDung` u JOIN `KhoHang_Business`.`DonHang` o ON o.MaKhachHang=u.MaBanGhi WHERE u.TenDangNhap='users'",
  );
  assert.equal(
    translateSql("SELECT * FROM `TonKho`", tableNames("KhoHang_Business")),
    "SELECT * FROM `KhoHang_Warehouse`.`TonKho`",
  );
});
test("backup parser handles quotes, semicolons and trigger delimiters", () => {
  const { statements } = require("../../scripts/verify-service-backup.cjs");
  const sql =
    "INSERT INTO x VALUES ('a; b');\nDELIMITER $$\nCREATE TRIGGER t BEFORE INSERT ON x FOR EACH ROW BEGIN SET NEW.v=1; END$$\nDELIMITER ;\nSELECT 1;\n";
  const result = statements(sql);
  assert.equal(result.length, 3);
  assert.ok(result[1].endsWith("END"));
  assert.equal(result[2], "SELECT 1");
  assert.throws(() => statements("SELECT 'unterminated"));
});
test("all existing SQL objects have a single service owner and six distinct databases/accounts", () => {
  const map = owners(),
    databases = layout("KhoHang");
  for (const table of Object.values(aliases.tables))
    if (table !== "LichSuCSDL") assert.ok(map[table], table);
  assert.equal(
    new Set(Object.values(databases).map((v) => v.database)).size,
    6,
  );
  assert.equal(new Set(Object.values(databases).map((v) => v.user)).size, 6);
  assert.equal(map.PhienDangNhap, "web-gateway");
  assert.equal(map.TonKho, "warehouse-service");
  assert.equal(map.BanBaoCaoSanXuat, "business-service");
  assert.equal(map.NguoiDung, "identity-service");
});
test("schema names cannot inject SQL or exceed MySQL limits", () => {
  for (const input of [
    "KhoHang;DROP DATABASE x",
    "a`",
    "../x",
    "x".repeat(64),
    "",
  ])
    assert.throws(() => layout(input));
  assert.equal(identifier("KhoHang_Identity"), "`KhoHang_Identity`");
});
test("foreign writes are explicit and reporting/gateway have no foreign mutation grants", () => {
  const map = owners();
  for (const [service, tables] of Object.entries(grants))
    for (const [table, permissions] of Object.entries(tables)) {
      assert.ok(map[table]);
      assert.notEqual(map[table], service);
      assert.ok(permissions.length);
      assert.ok(
        permissions.every((v) => ["INSERT", "UPDATE", "DELETE"].includes(v)),
      );
    }
  assert.deepEqual(grants["reporting-service"], {});
  assert.deepEqual(grants["web-gateway"], {});
});
