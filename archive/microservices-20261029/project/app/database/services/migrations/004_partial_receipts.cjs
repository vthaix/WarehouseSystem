const { identifier: q } = require("../../../src/config/service-databases");
async function migrate(c, source, result) {
  const warehouse = result.databases["warehouse-service"].database,
    business = result.databases["business-service"].database;
  let completed=0;
  for(const entry of Object.values(result.databases)) {
    const [done]=await c.query(`SELECT Ma FROM ${q(entry.database)}.TrangThaiDichVu WHERE Ma='004_partial_receipts'`);
    completed+=done.length;
  }
  if(completed===Object.keys(result.databases).length)return;
  for (const [table, column, ddl] of [
    ["LoHang", "MaKeHoachNhapThanhPham", "BIGINT UNSIGNED NULL UNIQUE"],
    ["ChiTietLo", "MaYeuCauNhapThanhPham", "BIGINT UNSIGNED NULL"],
  ]) {
    const [columns] = await c.execute(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?",
      [warehouse, table, column],
    );
    if (!columns.length)
      await c.query(
        `ALTER TABLE ${q(warehouse)}.${q(table)} ADD COLUMN ${q(column)} ${ddl}`,
      );
  }
  for (const [table, name, column, parent] of [
    [
      "LoHang",
      "FK_LoHang_NhapThanhPham",
      "MaKeHoachNhapThanhPham",
      `${q(business)}.KeHoachSanXuat`,
    ],
    [
      "ChiTietLo",
      "FK_Lo_NhapThanhPham",
      "MaYeuCauNhapThanhPham",
      `${q(warehouse)}.PhieuYeuCauNhapXuat`,
    ],
  ]) {
    const [exists] = await c.execute(
      "SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME=? AND CONSTRAINT_NAME=?",
      [warehouse, table, name],
    );
    if (!exists.length)
      await c.query(
        `ALTER TABLE ${q(warehouse)}.${q(table)} ADD CONSTRAINT ${q(name)} FOREIGN KEY (${q(column)}) REFERENCES ${parent}(MaBanGhi)`,
      );
  }
  const [checks] = await c.execute(
    "SELECT t.CONSTRAINT_NAME name,c.CHECK_CLAUSE clause FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA=t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME=t.CONSTRAINT_NAME WHERE t.CONSTRAINT_SCHEMA=? AND t.TABLE_NAME='PhieuYeuCauNhapXuat' AND t.CONSTRAINT_TYPE='CHECK'",
    [warehouse],
  );
  for (const check of checks)
    if (
      check.clause.includes("LoaiNguonSanXuat") &&
      !check.clause.includes("MANUAL")
    )
      await c.query(
        `ALTER TABLE ${q(warehouse)}.PhieuYeuCauNhapXuat DROP CHECK ${q(check.name)}`,
      );
  if (!checks.some((x) => x.name === "CK_NguonNhapThanhPham004"))
    await c.query(
      `ALTER TABLE ${q(warehouse)}.PhieuYeuCauNhapXuat ADD CONSTRAINT CK_NguonNhapThanhPham004 CHECK (LoaiNguonSanXuat='REPORT' OR (LoaiNguonSanXuat='PLAN' AND PhuongThuc='PRODUCTION_ISSUE' AND MaKeHoachSanXuat IS NOT NULL AND MaBaoCaoSanXuat IS NULL) OR (LoaiNguonSanXuat='MANUAL' AND PhuongThuc='PRODUCTION_RECEIPT' AND Kieu='IN' AND MaKeHoachSanXuat IS NOT NULL AND MaBaoCaoSanXuat IS NULL))`,
    );
  for (const [service, entry] of Object.entries(result.databases)) {
    for (const object of result.objects)
      if (
        object.name !== "LichSuCSDL" &&
        result.byTable[object.name] !== service
      )
        await c.query(
          `CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW ${q(entry.database)}.${q(object.name)} AS SELECT * FROM ${q(result.databases[result.byTable[object.name]].database)}.${q(object.name)}`,
        );
    await c.query(
      `INSERT IGNORE INTO ${q(entry.database)}.TrangThaiDichVu VALUES ('004_partial_receipts',NOW(6))`,
    );
  }
}
module.exports = { migrate };
