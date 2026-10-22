const specs = {
  users: { owner: "identity-service", methods: ["get", "hydrate"] },
  auth: { owner: "identity-service", methods: ["authenticate"] },
  orders: {
    owner: "business-service",
    methods: ["list", "get", "create", "update", "receive", "review"],
  },
  businessPlans: {
    owner: "business-service",
    methods: ["list", "get", "create", "update", "remove", "review"],
  },
  productionPlans: {
    owner: "business-service",
    methods: ["list", "get", "create", "update", "cancel", "review", "materialComparison"],
  },
  productionReports: {
    owner: "business-service",
    methods: ["list", "get", "create", "update", "submit"],
  },
  finishedReports: {
    owner: "business-service",
    methods: ["list", "get", "create", "update", "submit"],
  },
  purchaseOrders: {
    owner: "business-service",
    methods: ["list", "get", "create"],
  },
  stockRequests: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "update", "remove"],
  },
  warehouseFlow: {
    owner: "warehouse-service",
    methods: [
      "preview",
      "dispatch",
      "post",
      "document",
      "documents",
      "cancelAllocation",
    ],
  },
  warehouseRecords: {
    owner: "warehouse-service",
    methods: ["list", "get", "create"],
  },
  quality: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "update", "remove", "correct"],
  },
  qualityCampaigns: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "action"],
  },
  stocktakes: {
    owner: "warehouse-service",
    methods: [
      "list",
      "get",
      "create",
      "action",
      "lines",
      "counts",
      "complete",
      "minutesList",
      "minuteGet",
      "minuteWrite",
      "differences",
    ],
  },
  exceptions: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "review", "apply", "reinspect"],
  },
  tasks: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "update", "remove", "progress"],
  },
  customerReturns: {
    owner: "warehouse-service",
    methods: ["list", "get", "create", "action", "deliveries"],
  },
  notifications: {
    owner: "notification-service",
    methods: ["list", "get", "read"],
  },
  reports: {
    owner: "reporting-service",
    methods: ["inventory", "stockDocuments", "stocktakes", "run", "csv"],
  },
};
const catalogResources = [
  "categories",
  "units",
  "items",
  "suppliers",
  "warehouses",
  "warehouse-locations",
  "lots",
];
const catalogOwner = (r) =>
  ["warehouses", "warehouse-locations", "lots"].includes(r)
    ? "warehouse-service"
    : "business-service";
const serviceNames = [
  "identity-service",
  "business-service",
  "warehouse-service",
  "notification-service",
  "reporting-service",
];
function apiOwner(url) {
  const u = new URL(url, "http://internal"),
    parts = u.pathname.split("/").filter(Boolean);
  let r = parts[0];
  if (r === "lookup") {
    r = parts[1];
    if (r === "users") return "identity-service";
    if (
      [
        "lots",
        "warehouses",
        "warehouse-locations",
        "purchase-order-lines",
        "warehouse-managers",
        "quality-campaigns",
        "stock-requests",
        "qc-failed-lines",
        "quarantine-lines",
        "stock-qc-lines",
      ].includes(r)
    )
      return "warehouse-service";
    return "business-service";
  }
  if (r === "source-imports")
    return ["stock-requests", "lots"].includes(parts[1])
      ? "warehouse-service"
      : "business-service";
  if (r === "catalog-data") {
    const resource = u.searchParams.get("resource") || "inventory";
    return resource === "inventory"
      ? "reporting-service"
      : catalogOwner(resource);
  }
  if (r === "reports") return "reporting-service";
  if (r === "notifications") return "notification-service";
  if (
    [
      "customer-orders",
      "business-plans",
      "production-plans",
      "production-reports",
      "finished-reports",
      "purchase-orders",
      "sample-items",
      "modules",
    ].includes(r)
  )
    return "business-service";
  if (catalogResources.includes(r)) return catalogOwner(r);
  return "warehouse-service";
}
module.exports = {
  specs,
  catalogResources,
  catalogOwner,
  serviceNames,
  apiOwner,
};
