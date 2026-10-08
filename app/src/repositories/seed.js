const { hashPassword, today } = require("../services/domain/core");
function seed(repo, password) {
  const roles = [
    "CUSTOMER",
    "PLANNER",
    "PURCHASER",
    "WAREHOUSE_MANAGER",
    "WAREHOUSE_STAFF",
    "QC_INSPECTOR",
    "STOCKTAKER",
    "WORKSHOP_OWNER",
    "DIRECTOR",
  ];
  const names = [
    "Khách hàng",
    "Lập kế hoạch",
    "Mua hàng",
    "Quản lý kho",
    "Nhân viên kho",
    "Kiểm tra QC/AC",
    "Ban kiểm kê",
    "Chủ xưởng",
    "Giám đốc",
  ];
  const users = [
    "customer",
    "planner",
    "purchaser",
    "manager",
    "staff",
    "qc",
    "stocktaker",
    "workshop",
    "director",
  ];
  roles.forEach((r, i) =>
    repo.add("users", {
      username: users[i],
      full_name: names[i],
      roles: [r],
      workshop_ids: r === "WORKSHOP_OWNER" ? ["1"] : [],
      password_hash: hashPassword(password),
    }),
  );
  repo.add("users", {
    username: "customer2",
    full_name: "Khách hàng thứ hai",
    roles: ["CUSTOMER"],
    workshop_ids: [],
    password_hash: hashPassword(password),
  });
  repo.add("categories", {
    code: "NVL",
    name: "Nguyên vật liệu",
    is_active: true,
  });
  repo.add("categories", { code: "TP", name: "Thành phẩm", is_active: true });
  repo.add("units", { name: "kg" });
  repo.add("units", { name: "cái" });
  repo.add("warehouses", {
    code: "KHO-01",
    name: "Kho trung tâm",
    is_active: true,
  });
  repo.add("warehouses", {
    code: "KHO-02",
    name: "Kho thành phẩm",
    is_active: true,
  });
  repo.add("warehouse-locations", {
    code: "A-01",
    name: "Kệ A · Ô 01",
    warehouse_id: "1",
    is_active: true,
  });
  repo.add("warehouse-locations", {
    code: "B-01",
    name: "Kệ B · Ô 01",
    warehouse_id: "2",
    is_active: true,
  });
  repo.add("suppliers", {
    code: "NCC-01",
    name: "Công ty Nguyên liệu Việt",
    is_active: true,
  });
  repo.add("items", {
    code: "NVL-001",
    name: "Thép tấm",
    kind: "MATERIAL",
    category_id: "1",
    unit_id: "1",
    unit: "kg",
    reference_price: "25000.0000",
    is_active: true,
    is_sample: false,
    is_published: true,
  });
  repo.add("items", {
    code: "TP-001",
    name: "Kệ kho tiêu chuẩn",
    kind: "FINISHED_PRODUCT",
    category_id: "2",
    unit_id: "2",
    unit: "cái",
    reference_price: "1250000.0000",
    is_active: true,
    is_sample: true,
    is_published: true,
  });
  repo.add("customer-orders", {
    code: "DH-0001",
    customer_id: "1",
    customer_name: "Khách hàng",
    delivery_address: "Xưởng cơ khí, TP. Hồ Chí Minh",
    latest_delivery_date: today(),
    status: "SUBMITTED",
    quoted_total: "12500000.0000",
    lines: [
      {
        id: "order-line-1",
        item_id: "2",
        item_name: "Kệ kho tiêu chuẩn",
        unit: "cái",
        quantity: "10.000",
        unit_price: "1250000.0000",
      },
    ],
  });
  repo.add("users", {
    username: "staff2",
    full_name: "Nhân viên kho 2",
    roles: ["WAREHOUSE_STAFF"],
    workshop_ids: [],
    password_hash: hashPassword(password),
  });
  // Opening inventory is empty; every balance must originate from a posted receipt.
}
module.exports = { seed };
