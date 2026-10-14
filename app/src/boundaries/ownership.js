// Logical ownership; deployment groups stay larger during extraction.
const boundaries = Object.freeze({
  identity: {
    service: "identity-service",
    resources: ["auth", "users", "roles", "employees", "departments"],
  },
  catalog: {
    service: "business-service",
    resources: ["categories", "units", "items", "customers", "suppliers"],
  },
  sales: { service: "business-service", resources: ["customer-orders"] },
  production: {
    service: "business-service",
    resources: [
      "production-plans",
      "production-reports",
      "finished-reports",
      "workshops",
    ],
  },
  procurement: { service: "business-service", resources: ["purchase-orders"] },
  "warehouse-quality": {
    service: "warehouse-service",
    resources: [
      "warehouses",
      "warehouse-locations",
      "lots",
      "lot-headers",
      "stock-requests",
      "stock-documents",
      "warehouse-records",
      "qc-inspections",
      "quality-campaigns",
      "stocktakes",
      "stocktake-minutes",
      "exception-proposals",
      "customer-returns",
      "tasks",
    ],
  },
  notification: {
    service: "notification-service",
    resources: ["notifications"],
  },
  reporting: {
    service: "reporting-service",
    resources: [
      "reports/inventory",
      "reports/stock-documents",
      "reports/stocktakes",
    ],
  },
});
function ownerOf(resource, type) {
  if (resource === "business-plans") {
    if (type === "SALE") return "sales";
    if (type === "PURCHASE") return "procurement";
    throw new Error("Business plan ownership requires SALE or PURCHASE.");
  }
  const matches = Object.entries(boundaries).filter(([, v]) =>
    v.resources.includes(resource),
  );
  if (matches.length !== 1)
    throw new Error("No unique boundary for resource: " + resource);
  return matches[0][0];
}
module.exports = { boundaries, ownerOf };
