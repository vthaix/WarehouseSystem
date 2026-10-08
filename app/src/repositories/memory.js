const { fail } = require("../services/domain/core");
const resources = [
  "users",
  "categories",
  "warehouses",
  "warehouse-locations",
  "suppliers",
  "units",
  "items",
  "lots",
  "customer-orders",
  "business-plans",
  "purchase-orders",
  "production-plans",
  "production-reports",
  "finished-reports",
  "stock-requests",
  "stock-documents",
  "warehouse-records",
  "qc-inspections",
  "stocktakes",
  "stocktake-minutes",
  "exception-proposals",
  "tasks",
  "notifications",
  "inventory",
  "movements",
  "audit",
];
class MemoryRepository {
  constructor() {
    this.data = Object.fromEntries(resources.map((r) => [r, []]));
    this.seq = {};
    this.replays = new Map();
    this.started_at = new Date().toISOString();
  }
  all(n) {
    fail(!this.data[n], "NOT_FOUND", "Không tìm thấy tài nguyên.", 404);
    return this.data[n];
  }
  get(n, id) {
    const r = this.all(n).find((r) => r.id === String(id));
    fail(!r, "NOT_FOUND", "Không tìm thấy dữ liệu.", 404);
    return r;
  }
  add(n, v) {
    const id = String((this.seq[n] = (this.seq[n] || 0) + 1));
    const r = {
      id,
      code: `${n.toUpperCase().slice(0, 3)}-${id.padStart(4, "0")}`,
      version: 1,
      created_at: new Date().toISOString(),
      ...v,
    };
    this.all(n).push(r);
    return r;
  }
  remove(n, id) {
    this.data[n] = this.all(n).filter((r) => r.id !== String(id));
  }
  transaction(fn) {
    const snapshot = structuredClone({ data: this.data, seq: this.seq });
    try {
      const result = fn();
      fail(
        result instanceof Promise,
        "INTERNAL_ERROR",
        "Transaction bộ nhớ phải đồng bộ.",
        500,
      );
      return result;
    } catch (e) {
      this.data = snapshot.data;
      this.seq = snapshot.seq;
      throw e;
    }
  }
}
module.exports = { MemoryRepository };
