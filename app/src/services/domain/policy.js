const { fail } = require("./core");
const read = {
  "customer-orders": ["CUSTOMER", "PLANNER", "DIRECTOR"],
  "business-plans": [
    "PLANNER",
    "DIRECTOR",
    "PURCHASER",
    "WORKSHOP_OWNER",
    "WAREHOUSE_STAFF",
  ],
  "purchase-orders": [
    "PURCHASER",
    "WORKSHOP_OWNER",
    "WAREHOUSE_STAFF",
    "QC_INSPECTOR",
  ],
  categories: ["WAREHOUSE_MANAGER"],
  warehouses: ["WAREHOUSE_MANAGER"],
  "warehouse-locations": ["WAREHOUSE_MANAGER"],
  suppliers: ["WAREHOUSE_MANAGER"],
  items: ["WAREHOUSE_MANAGER"],
  lots: ["WAREHOUSE_MANAGER"],
  "stock-requests": ["WORKSHOP_OWNER", "WAREHOUSE_STAFF", "WAREHOUSE_MANAGER"],
  "stock-documents": [
    "WAREHOUSE_MANAGER",
    "WAREHOUSE_STAFF",
    "DIRECTOR",
    "WORKSHOP_OWNER",
  ],
  "qc-inspections": ["QC_INSPECTOR"],
  stocktakes: ["DIRECTOR", "STOCKTAKER", "WAREHOUSE_MANAGER"],
  "stocktake-minutes": ["STOCKTAKER", "DIRECTOR"],
  "exception-proposals": ["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR"],
  tasks: ["DIRECTOR"],
  "production-plans": [
    "PLANNER",
    "DIRECTOR",
    "WORKSHOP_OWNER",
    "WAREHOUSE_STAFF",
  ],
  "production-reports": ["WORKSHOP_OWNER", "PLANNER"],
  "finished-reports": ["WORKSHOP_OWNER", "DIRECTOR"],
  notifications: ["*"],
};
const create = {
  "customer-orders": ["CUSTOMER"],
  "business-plans": ["PLANNER"],
  "purchase-orders": ["PURCHASER"],
  "stock-requests": ["WORKSHOP_OWNER"],
  "stock-documents": ["WAREHOUSE_STAFF"],
  "qc-inspections": ["QC_INSPECTOR"],
  stocktakes: ["DIRECTOR"],
  "stocktake-minutes": ["STOCKTAKER"],
  "exception-proposals": ["WAREHOUSE_MANAGER"],
  tasks: ["DIRECTOR"],
  "production-plans": ["PLANNER"],
  "production-reports": ["WORKSHOP_OWNER"],
  "finished-reports": ["WORKSHOP_OWNER"],
};
const masters = [
  "categories",
  "warehouses",
  "warehouse-locations",
  "suppliers",
  "items",
  "lots",
];
for (const n of masters) create[n] = ["WAREHOUSE_MANAGER"];
const editable = {
  "customer-orders": ["CUSTOMER"],
  "business-plans": ["PLANNER"],
  "stock-requests": ["WORKSHOP_OWNER"],
  "qc-inspections": ["QC_INSPECTOR"],
  tasks: ["DIRECTOR"],
  "production-plans": ["PLANNER"],
  "production-reports": ["WORKSHOP_OWNER"],
  "finished-reports": ["WORKSHOP_OWNER"],
  "stocktake-minutes": ["STOCKTAKER"],
};
for (const n of masters) editable[n] = ["WAREHOUSE_MANAGER"];
const actionResources = {
  receive: ["customer-orders"],
  review: [
    "customer-orders",
    "business-plans",
    "production-plans",
    "exception-proposals",
  ],
  submit: ["production-reports", "finished-reports", "stocktake-minutes"],
  start: ["stocktakes"],
  close: ["stocktakes"],
  progress: ["tasks"],
  read: ["notifications"],
};
function role(u, a) {
  fail(!u, "UNAUTHENTICATED", "Vui lòng đăng nhập.", 401);
  fail(
    !a || (!a.includes("*") && !u.roles.some((r) => a.includes(r))),
    "FORBIDDEN",
    "Bạn không có quyền thực hiện thao tác.",
    403,
  );
}
function scope(u, r, n) {
  if (n === "notifications") return r.user_id === u.id;
  if (u.roles.includes("DIRECTOR") || u.roles.includes("WAREHOUSE_MANAGER"))
    return true;
  if (u.roles.includes("CUSTOMER"))
    return n === "customer-orders" && r.customer_id === u.id;
  if (u.roles.includes("WORKSHOP_OWNER") && r.workshop_id)
    return u.workshop_ids.includes(r.workshop_id);
  if (n === "stocktakes" && u.roles.includes("STOCKTAKER"))
    return r.warehouses.some((w) => w.assignee_ids.includes(u.id));
  if (n === "stocktake-minutes" && u.roles.includes("STOCKTAKER"))
    return r.assignee_ids.includes(u.id);
  return true;
}
read["qc-inspections"].push("DIRECTOR", "WORKSHOP_OWNER");
read["stocktakes"].push("QC_INSPECTOR");
read["stock-requests"].push("PLANNER");
read.tasks = [
  "DIRECTOR",
  "WAREHOUSE_MANAGER",
  "WAREHOUSE_STAFF",
  "QC_INSPECTOR",
  "STOCKTAKER",
];
editable.tasks = ["DIRECTOR", "WAREHOUSE_MANAGER"];
read["warehouse-records"] = ["WAREHOUSE_MANAGER", "DIRECTOR", "WORKSHOP_OWNER"];
create["warehouse-records"] = ["WAREHOUSE_MANAGER"];
create["exception-proposals"].push("QC_INSPECTOR");
actionResources.dispatch = ["stock-requests"];
actionResources.cancel = ["production-plans"];
module.exports = {
  read,
  create,
  editable,
  masters,
  actionResources,
  role,
  scope,
};
