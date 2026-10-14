// Development catalog only. Never fabricate balances, posted documents or sessions.
async function seedSampleCatalog(c) {
  async function insert(table, fields, values) {
    await c.execute(
      `INSERT INTO ${table} (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")}) ON DUPLICATE KEY UPDATE id = id`,
      values,
    );
  }
  async function id(table, code) {
    if (table === 'units' && ['KG','CAI'].includes(code)) {
      const [[unit]] = await c.execute('SELECT id FROM units WHERE name = ? ORDER BY id LIMIT 1', [code === 'KG' ? 'kg' : 'cái']);
      if (!unit) throw new Error('Missing base unit');
      return unit.id;
    }
    const [[row]] = await c.execute(`SELECT id FROM ${table} WHERE code = ?`, [
      code,
    ]);
    if (!row) throw new Error("Missing sample catalog reference");
    return row.id;
  }
  for (const [code, name] of [
    ["M", "mét"],
    ["BO", "bộ"],
    ["HOP", "hộp"],
  ])
    await insert("units", ["code", "name"], [code, name]);
  for (const [code, name] of [
    ["BAO-BI", "Bao bì"],
    ["PHU-KIEN", "Phụ liệu làm bánh"],
  ])
    await insert(
      "categories",
      ["code", "name", "description", "is_active"],
      [code, name, "Danh mục mẫu phục vụ kiểm thử giao diện", 1],
    );
  await insert(
    "warehouses",
    ["code", "name", "address", "is_active"],
    [
      "KHO-03",
      "Kho bao bì đóng gói bánh",
      "Khu công nghiệp Sóng Thần, Bình Dương (địa chỉ mẫu)",
      1,
    ],
  );
  for (const [warehouse, code, name] of [
    ["KHO-01", "A-02", "Kệ A · Ô 02"],
    ["KHO-01", "A-03", "Kệ A · Ô 03"],
    ["KHO-02", "B-02", "Kệ B · Ô 02"],
    ["KHO-03", "C-01", "Kệ C · Ô 01"],
    ["KHO-03", "C-02", "Kệ C · Ô 02"],
  ])
    await insert(
      "warehouse_locations",
      ["warehouse_id", "code", "name", "is_active"],
      [await id("warehouses", warehouse), code, name, 1],
    );
  for (const [code, name] of [
    ["NCC-02", "Nhà cung cấp Bao bì Minh An"],
    ["NCC-03", "Nhà cung cấp Bơ sữa Đông Nam"],
    ["NCC-04", "Nhà cung cấp Bột và Đường Thành Công"],
  ])
    await insert(
      "suppliers",
      ["code", "name", "email", "address", "is_active"],
      [
        code,
        name,
        code.toLowerCase() + "@example.test",
        "Địa chỉ minh họa — không phải thông tin giao dịch thật",
        1,
      ],
    );
  await insert(
    "workshops",
    ["code", "name", "address", "is_active"],
    ["XUONG-02", "Xưởng nướng và đóng gói bánh", "Địa chỉ xưởng mẫu", 1],
  );
  const items = [
    [
      "NVL-002",
      "Đường trắng làm bánh",
      "NVL",
      "KG",
      "MATERIAL",
      "22000.0000",
      0,
      1,
      1,
    ],
    [
      "NVL-003",
      "Bơ lạt làm bánh",
      "NVL",
      "KG",
      "MATERIAL",
      "180000.0000",
      0,
      1,
      1,
    ],
    [
      "PK-001",
      "Trứng gà",
      "PHU-KIEN",
      "CAI",
      "MATERIAL",
      "2500.0000",
      0,
      1,
      1,
    ],
    [
      "PK-002",
      "Sữa bột nguyên kem",
      "PHU-KIEN",
      "KG",
      "MATERIAL",
      "95000.0000",
      0,
      1,
      1,
    ],
    [
      "BB-001",
      "Thùng carton đựng bánh",
      "BAO-BI",
      "CAI",
      "MATERIAL",
      "18000.0000",
      0,
      1,
      1,
    ],
    [
      "BB-002",
      "Hộp giấy đựng bánh",
      "BAO-BI",
      "HOP",
      "MATERIAL",
      "5000.0000",
      0,
      1,
      1,
    ],
    [
      "TP-002",
      "Bánh bông lan vani đóng gói 120 g",
      "TP",
      "CAI",
      "FINISHED_PRODUCT",
      "22000.0000",
      1,
      1,
      1,
    ],
    [
      "TP-003",
      "Bánh quy chocolate đóng gói 200 g",
      "TP",
      "CAI",
      "FINISHED_PRODUCT",
      "39000.0000",
      1,
      1,
      1,
    ],
    [
      "TP-004",
      "Bánh bông lan cuộn đóng gói 150 g",
      "TP",
      "CAI",
      "FINISHED_PRODUCT",
      "28000.0000",
      1,
      1,
      1,
    ],
    [
      "TP-005",
      "Bánh quy yến mạch thử nghiệm",
      "TP",
      "CAI",
      "FINISHED_PRODUCT",
      "0.0000",
      1,
      0,
      1,
    ],
    [
      "NVL-004",
      "Hương vani mẫu ngừng sử dụng",
      "NVL",
      "KG",
      "MATERIAL",
      "10000.0000",
      0,
      0,
      0,
    ],
  ];
  for (const [
    code,
    name,
    category,
    unit,
    kind,
    price,
    sample,
    published,
    active,
  ] of items)
    await insert(
      "items",
      [
        "category_id",
        "unit_id",
        "code",
        "name",
        "kind",
        "description",
        "reference_price",
        "is_sample",
        "is_published",
        "is_active",
        "version",
      ],
      [
        await id("categories", category),
        await id("units", unit),
        code,
        name,
        kind,
        "Dữ liệu mẫu để thử tìm kiếm, lọc và phân quyền hiển thị.",
        price,
        sample,
        published,
        active,
        1,
      ],
    );
}
module.exports = { seedSampleCatalog };
