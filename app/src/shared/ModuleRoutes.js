const express = require("express");
const C = require("../services/domain/core");
const P = require("../services/domain/policy");
const role = require("../middlewares/role.middleware");
const { ok } = require("../utils/response");
const registry = require("../modules");
const reportRoles = {
  "reports/inventory": ["DIRECTOR", "WAREHOUSE_MANAGER", "WORKSHOP_OWNER"],
  "reports/stock-documents": ["DIRECTOR", "WORKSHOP_OWNER"],
  "reports/stocktakes": ["DIRECTOR"],
};
function pending(req, res, next) {
  next(
    new C.DomainError(
      501,
      "NOT_IMPLEMENTED",
      "Chức năng này chưa được triển khai với MySQL.",
    ),
  );
}
module.exports = (runtime) => {
  const router = express.Router(),
    catalog = require("../modules/catalog/ApiController")(runtime.catalog);
  const sourceImports = new (require('./SourceImportService'))(runtime);
  for(const resource of ['warehouse-inbound','warehouse-outbound']){
   router.get('/'+resource,role(['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']),async(req,res)=>{const r=await require('./warehouse-management').list(runtime,req.user,resource,req.query);ok(req,res,r.data,200,r.meta);});
   router.get('/'+resource+'/:id',role(['WAREHOUSE_MANAGER','WAREHOUSE_STAFF']),async(req,res)=>ok(req,res,await require('./warehouse-management').get(runtime,req.user,resource,req.params.id)));
  }
  router.get('/workspace/updates',async(req,res)=>ok(req,res,await runtime.notifications.updates(req.user)));
  router.post('/workspace/seen',async(req,res)=>ok(req,res,await runtime.notifications.seen(req.user,req.body)));
  router.get('/material-price-options',role(['WAREHOUSE_MANAGER','PURCHASER']),async(req,res)=>ok(req,res,await runtime.materialCatalog.metadata(req.user)));
  router.get('/material-prices',role(['WAREHOUSE_MANAGER','PURCHASER']),async(req,res)=>{const r=await runtime.materialCatalog.list(req.user,req.query);ok(req,res,r.data,200,r.meta);});
  router.get('/material-prices/:id',role(['WAREHOUSE_MANAGER','PURCHASER']),async(req,res)=>ok(req,res,await runtime.materialCatalog.get(req.user,req.params.id)));
  router.patch('/material-prices/:id',role(['WAREHOUSE_MANAGER']),async(req,res)=>ok(req,res,await runtime.materialCatalog.update(req.user,req.params.id,req.body,req.request_id)));
  router.get('/account-options',role(['ADMIN']),async(req,res)=>ok(req,res,await runtime.accounts.metadata(req.user)));
  router.get('/accounts',role(['ADMIN']),async(req,res)=>{const r=await runtime.accounts.list(req.user,req.query);ok(req,res,r.data,200,r.meta);});
  router.get('/accounts/:id',role(['ADMIN']),async(req,res)=>ok(req,res,await runtime.accounts.get(req.user,req.params.id)));
  router.post('/accounts',role(['ADMIN']),async(req,res)=>ok(req,res,await runtime.accounts.create(req.user,req.body,req.request_id),201));
  router.patch('/accounts/:id',role(['ADMIN']),async(req,res)=>ok(req,res,await runtime.accounts.update(req.user,req.params.id,req.body,req.request_id)));
  router.delete('/accounts/:id',role(['ADMIN']),async(req,res)=>ok(req,res,await runtime.accounts.remove(req.user,req.params.id,req.body,req.request_id)));
  router.get('/warehouse-lookup',role(['WAREHOUSE_MANAGER','WORKSHOP_OWNER']),async(req,res)=>ok(req,res,await runtime.reports.warehouseLookup(req.user,req.query)));
  router.get('/stock-request-workflow-sources',role(['WORKSHOP_OWNER']),async(req,res)=>ok(req,res,await runtime.stockRequests.workflowSources(req.user)));
  router.get('/source-imports/purchase-report-options',async(req,res)=>ok(req,res,await sourceImports.purchaseReports(req.user)));
  router.get('/source-imports/:target',async(req,res)=>ok(req,res,await sourceImports.preview(req.user,req.params.target,req.query)));
  router.get('/customer-return-deliveries',role(['WAREHOUSE_MANAGER']),async(req,res)=>ok(req,res,await runtime.customerReturns.deliveries(req.user,req.query)));
  router.get('/customer-returns',role(P.read['customer-returns']),async(req,res)=>{const r=await runtime.customerReturns.list(req.user,req.query);ok(req,res,r.data,200,r.meta);});
  router.get('/customer-returns/:id',role(P.read['customer-returns']),async(req,res)=>ok(req,res,await runtime.customerReturns.get(req.user,req.params.id)));
  router.post('/customer-returns',role(P.create['customer-returns']),async(req,res)=>ok(req,res,await runtime.customerReturns.create(req.user,req.body,req.request_id),201));
  for(const action of ['receive','cancel'])router.post('/customer-returns/:id/'+action,role(action==='receive'?['WAREHOUSE_STAFF']:['WAREHOUSE_MANAGER']),async(req,res)=>ok(req,res,await runtime.customerReturns.action(req.user,req.params.id,req.body,action,req.request_id)));
  router.get(
    "/lot-headers",
    role(["WAREHOUSE_MANAGER", "QC_INSPECTOR", "DIRECTOR"]),
    async (req, res) => {
      C.fields(req.query, ["page", "per_page"]);
      const paginate = require("../utils/pagination");
      const { page, per_page, offset } = paginate(req.query);
      const [[count]] = await runtime.pool.query(
        "SELECT COUNT(*) AS total FROM lot_headers",
      );
      const [rows] = await runtime.pool.execute(
        "SELECT * FROM lot_headers ORDER BY id DESC LIMIT ? OFFSET ?",
        [String(per_page), String(offset)],
      );
      ok(
        req,
        res,
        rows.map((r) => ({ ...r, id: String(r.id) })),
        200,
        { page, per_page, total: Number(count.total) },
      );
    },
  );
  router.get(
    "/lot-headers/:id",
    role(["WAREHOUSE_MANAGER", "QC_INSPECTOR", "DIRECTOR"]),
    async (req, res) => {
      C.fail(
        !/^[1-9]\d*$/.test(req.params.id),
        "NOT_FOUND",
        "Không có lô.",
        404,
      );
      const [rows] = await runtime.pool.execute(
        "SELECT * FROM lot_headers WHERE id=?",
        [req.params.id],
      );
      C.fail(!rows.length, "NOT_FOUND", "Không có lô.", 404);
      const [details] = await runtime.pool.execute(
        "SELECT d.*,i.name AS item_name FROM lots d JOIN items i ON i.id=d.item_id WHERE d.lot_header_id=? ORDER BY d.id",
        [req.params.id],
      );
      ok(req, res, {
        ...rows[0],
        id: String(rows[0].id),
        details: details.map((r) => ({
          ...r,
          id: String(r.id),
          lot_header_id: String(r.lot_header_id),
        })),
      });
    },
  );
  router.get('/function-badges',async(req,res)=>ok(req,res,await runtime.notifications.badges(req.user)));
  router.get('/inspection-counts',role(['STOCKTAKER']),async(req,res)=>{const r=await runtime.tasks.counts(req.user,req.query);ok(req,res,r.data,200,r.meta);});
  router.get('/inspection-counts/:id',role(['STOCKTAKER']),async(req,res)=>ok(req,res,await runtime.tasks.get(req.user,req.params.id)));
  router.post('/tasks/:id/minute-author',role(['DIRECTOR']),async(req,res)=>ok(req,res,await runtime.tasks.setMinuteAuthor(req.user,req.params.id,req.body,req.request_id)));
  router.get("/tasks", role(P.read.tasks), async (req, res) => {
    const result = await runtime.tasks.list(req.user, req.query);
    ok(req, res, result.data, 200, result.meta);
  });
  router.get("/tasks/:id", role(P.read.tasks), async (req, res) =>
    ok(req, res, await runtime.tasks.get(req.user, req.params.id)),
  );
  router.post("/tasks", role(["DIRECTOR"]), async (req, res) =>
    ok(
      req,
      res,
      await runtime.tasks.create(req.user, req.body, req.request_id),
      201,
    ),
  );
  router.patch("/tasks/:id", role(["DIRECTOR"]), async (req, res) =>
    ok(
      req,
      res,
      await runtime.tasks.update(
        req.user,
        req.params.id,
        req.body,
        req.request_id,
      ),
    ),
  );
  router.delete("/tasks/:id", role(["DIRECTOR"]), async (req, res) =>
    ok(
      req,
      res,
      await runtime.tasks.remove(
        req.user,
        req.params.id,
        req.body,
        req.request_id,
      ),
    ),
  );
  router.post("/tasks/:id/progress", role(P.read.tasks), async (req, res) =>
    ok(
      req,
      res,
      await runtime.tasks.progress(
        req.user,
        req.params.id,
        req.body,
        req.request_id,
      ),
    ),
  );
  router.get(
    "/catalog-data",
    role(["WAREHOUSE_MANAGER", "WORKSHOP_OWNER"]),
    async (req, res) => {
      const query={...req.query},resource=query.resource||"inventory";delete query.resource;
      C.fail(!["inventory","items","categories","warehouses","warehouse-locations","lots"].includes(resource),"VALIDATION_ERROR","Loại dữ liệu tra cứu không hợp lệ.");
      if(resource!=="inventory")C.fields(query,["page","per_page","q","kind","sort"]);
      const result = resource==="inventory" ? await runtime.reports.inventory(req.user, query) : await runtime.catalog.list(req.user,resource,query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get("/modules", (req, res) =>
    ok(
      req,
      res,
      registry
        .filter((m) =>
          m.resources.some((r) =>
            (P.read[r] || reportRoles[r] || []).some(
              (role) => role === "*" || req.user.roles.includes(role),
            ),
          ),
        )
        .map((m) => ({ name: m.name, status: m.status, uc: m.uc })),
    ),
  );
  router.get("/sample-items", catalog.samples);
  router.get("/lookup/:resource", async (req, res) => {
    if(['quarantine-lines','stock-qc-lines'].includes(req.params.resource)) {
      P.role(req.user,['WAREHOUSE_MANAGER','DIRECTOR']);
      const bucket=req.params.resource==='stock-qc-lines'?'AVAILABLE':'QUARANTINE';
      const [rows]=await runtime.pool.execute("SELECT q.id,q.lot_id,q.passed_quantity,q.failed_quantity,b.location_id,b.quantity,CONCAT(l.code,' · ',i.name,' · vị trí ',b.location_id,' · tồn ',b.quantity) AS name FROM qc_inspection_lines q JOIN qc_inspections qc ON qc.id=q.qc_inspection_id JOIN lots l ON l.id=q.lot_id JOIN lot_headers h ON h.id=l.lot_header_id JOIN items i ON i.id=l.item_id JOIN inventory_balances b ON b.lot_id=l.id WHERE qc.status='RECORDED' AND (h.return_direction IS NULL OR h.return_direction<>'KHACH_HANG' OR h.return_status='POSTED') AND b.quality_bucket=? AND b.quantity>0"+(bucket==='AVAILABLE'?" AND (h.return_direction IS NULL OR h.return_direction<>'KHACH_HANG')":"")+" ORDER BY q.id DESC,b.location_id LIMIT 500",[bucket]);
      return ok(req,res,rows.map(r=>({...r,id:String(r.id)+'-'+String(r.location_id),qc_inspection_line_id:String(r.id),lot_id:String(r.lot_id),location_id:String(r.location_id)})));
    }
    if(req.params.resource === 'workshops') {
      P.role(req.user,['PLANNER','WORKSHOP_OWNER']);
      const [rows]=await runtime.pool.query('SELECT id,name FROM workshops WHERE is_active=1 ORDER BY id');
      return ok(req,res,rows.filter(r=>req.user.roles.includes('PLANNER')||req.user.workshop_ids.includes(String(r.id))).map(r=>({...r,id:String(r.id)})));
    }
    if (req.params.resource === "qc-failed-lines") {
      P.role(req.user, ["WAREHOUSE_MANAGER", "QC_INSPECTOR", "DIRECTOR"]);
      const [rows] = await runtime.pool.query(
        "SELECT q.id,q.lot_id,q.issue,(q.failed_quantity-COALESCE((SELECT SUM(p.quantity) FROM exception_proposals p WHERE p.qc_inspection_line_id=q.id AND p.type='QC_FAILURE' AND p.action IN ('SCRAP','RETURN_SUPPLIER') AND p.status='APPLIED'),0)) AS failed_quantity,CONCAT(l.code,' - ',i.name) AS name FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id JOIN items i ON i.id=l.item_id WHERE q.failed_quantity>0 AND NOT EXISTS(SELECT 1 FROM returned_lot_lines r WHERE r.original_lot_detail_id=q.lot_id) AND NOT EXISTS(SELECT 1 FROM exception_proposals p WHERE p.qc_inspection_line_id=q.id AND (p.status IN ('PENDING_APPROVAL','APPROVED') OR (p.type<>'QC_FAILURE' AND p.status<>'REJECTED'))) HAVING failed_quantity>0 ORDER BY q.id DESC LIMIT 100",
      );
      return ok(
        req,
        res,
        rows.map((r) => ({ ...r, id: String(r.id), lot_id: String(r.lot_id) })),
      );
    }
    if (req.params.resource === "customer-orders") {
      P.role(req.user, ["PLANNER"]);
      const result = await runtime.orders.list(req.user, { per_page: 100 });
      return ok(
        req,
        res,
        result.data
          .filter((order) =>
            ["RECEIVED", "APPROVED", "IN_PROGRESS"].includes(order.status),
          )
          .map((order) => ({
            id: order.id,
            code: order.code,
            status: order.status,
            name: `${order.code} · ${order.customer_name}`,
          })),
      );
    }
    const lookupRoles = {
      items: ["PLANNER", "PURCHASER", "WAREHOUSE_MANAGER", "WORKSHOP_OWNER"],
      suppliers: ["PLANNER", "PURCHASER", "WAREHOUSE_MANAGER"],
      warehouses: [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF",
        "WORKSHOP_OWNER",
        "DIRECTOR",
      ],
      "warehouse-locations": ["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"],
      categories: ["WAREHOUSE_MANAGER"],
      units: ["WAREHOUSE_MANAGER"],
    };
    if (lookupRoles[req.params.resource]) {
      P.role(req.user, lookupRoles[req.params.resource]);
      const result = await runtime.catalog.repository.list(
        req.params.resource,
        { per_page: 100, q: req.query.q },
      );
      return ok(
        req,
        res,
        result.data.filter((row) => row.is_active !== false),
      );
    }
    if (req.params.resource === "lots") {
      P.role(req.user, [
        "WAREHOUSE_MANAGER",
        "WAREHOUSE_STAFF",
        "QC_INSPECTOR",
        "DIRECTOR",
      ]);
      const [rows] = await runtime.pool.execute(
        "SELECT l.*,DATE_FORMAT(DATE_ADD(l.created_at,INTERVAL 7 HOUR),'%Y-%m-%d') AS received_date,i.kind,i.name AS item_name,CONCAT(COALESCE(h.code,l.code),' / ',l.code,' / ',i.name,' / ',l.received_quantity) AS name FROM lots l JOIN items i ON i.id=l.item_id LEFT JOIN lot_headers h ON h.id=l.lot_header_id ORDER BY l.id DESC LIMIT 100",
      );
      return ok(
        req,
        res,
        rows.map((row) => ({
          ...row,
          id: String(row.id),
          item_id: String(row.item_id),
        })),
      );
    }
    if (req.params.resource === "purchase-order-lines") {
      P.role(req.user, ["WAREHOUSE_MANAGER"]);
      const [rows] = await runtime.pool.query(
        "SELECT l.*,CONCAT(p.code,' / ',i.name) AS name FROM purchase_order_lines l JOIN purchase_orders p ON p.id=l.purchase_order_id JOIN items i ON i.id=l.item_id WHERE p.status IN ('PENDING','PARTIALLY_RECEIVED') ORDER BY l.id DESC LIMIT 100",
      );
      return ok(
        req,
        res,
        rows.map((r) => ({
          ...r,
          id: String(r.id),
          item_id: String(r.item_id),
        })),
      );
    }
    if (req.params.resource === "customers") {
      P.role(req.user, ["PLANNER"]);
      const [rows] = await runtime.pool.execute(
        "SELECT id,code,name FROM customers ORDER BY id DESC LIMIT 100",
      );
      return ok(
        req,
        res,
        rows.map((row) => ({ ...row, id: String(row.id) })),
      );
    }
    if (req.params.resource === "business-plans") {
      P.role(req.user, [
        "PURCHASER",
        "WORKSHOP_OWNER",
        "WAREHOUSE_STAFF",
        "PLANNER",
      ]);
      const result = await runtime.businessPlans.list(req.user, {
        per_page: 100,
      });
      return ok(
        req,
        res,
        result.data.filter((row) => row.status === "APPROVED"),
      );
    }
    if (req.params.resource === "purchase-orders") {
      P.role(req.user, P.read["purchase-orders"]);
      const result = await runtime.purchaseOrders.list(req.user, {
        per_page: 100,
      });
      return ok(
        req,
        res,
        await Promise.all(
          result.data.map((row) =>
            runtime.purchaseOrders.get(req.user, row.id),
          ),
        ),
      );
    }
    if (req.params.resource === "production-plans") {
      P.role(req.user, P.read["production-plans"]);
      const result = await runtime.productionPlans.list(req.user, {
        per_page: 100,
      });
      return ok(
        req,
        res,
        await Promise.all(
          result.data.map((row) =>
            runtime.productionPlans.get(req.user, row.id),
          ),
        ),
      );
    }
    if (req.params.resource === "users") {
      P.role(req.user, ["DIRECTOR", "WAREHOUSE_MANAGER"]);
      const [rows] = await runtime.pool.execute(
        "SELECT id,username,full_name FROM users WHERE status='ACTIVE' ORDER BY id LIMIT 100",
      );
      return ok(
        req,
        res,
        await Promise.all(
          rows.map(async (row) => {
            const user = await runtime.users.hydrate(row);
            return {
              id: user.id,
              name: user.full_name,
              username: user.username,
              roles: user.roles,
            };
          }),
        ),
      );
    }
    if (req.params.resource === "quality-campaigns") {
      P.role(req.user, ["QC_INSPECTOR", "DIRECTOR"]);
      const result = await runtime.qualityCampaigns.list(req.user, {
        status: "IN_PROGRESS",
        per_page: 100,
      });
      return ok(
        req,
        res,
        await Promise.all(
          result.data.map((row) =>
            runtime.qualityCampaigns.get(req.user, row.id),
          ),
        ),
      );
    }
    if (req.params.resource === "warehouse-managers") {
      P.role(req.user, ["WORKSHOP_OWNER", "WAREHOUSE_MANAGER"]);
      const [rows] = await runtime.pool.execute(
        "SELECT DISTINCT u.id,u.full_name AS name FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.status='ACTIVE' AND r.code='WAREHOUSE_MANAGER' ORDER BY u.id LIMIT 100",
      );
      return ok(
        req,
        res,
        rows.map((row) => ({ ...row, id: String(row.id) })),
      );
    }
    if (req.params.resource === "finished-reports") {
      P.role(req.user, P.read["finished-reports"]);
      const result = await runtime.finishedReports.list(req.user, {
        status: "SUBMITTED",
        per_page: 100,
      });
      const reports = await Promise.all(
        result.data.map((row) => runtime.finishedReports.get(req.user, row.id)),
      );
      return ok(req, res, reports);
    }
    if (req.params.resource === "production-reports") {
      P.role(req.user, P.read["production-reports"]);
      const result = await runtime.productionReports.list(req.user, {
        status: "SUBMITTED",
        per_page: 100,
      });
      const reports = await Promise.all(
        result.data.map((row) =>
          runtime.productionReports.get(req.user, row.id),
        ),
      );
      return ok(req, res, reports.filter(r=>r.report_purpose==='NHU_CAU'));
    }
    if (req.params.resource === "stock-requests") {
      P.role(req.user, ["PLANNER", "WAREHOUSE_MANAGER"]);
      const result = await runtime.stockRequests.list(req.user, {
        per_page: 100,
      });
      return ok(
        req,
        res,
        await Promise.all(
          result.data.map((row) => runtime.stockRequests.get(req.user, row.id)),
        ),
      );
    }
    return catalog.lookup(req, res);
  });
  router.get(
    "/customer-orders",
    role(P.read["customer-orders"]),
    async (req, res) => {
      const result = await runtime.orders.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/customer-orders/:id",
    role(P.read["customer-orders"]),
    async (req, res) =>
      ok(req, res, await runtime.orders.get(req.user, req.params.id)),
  );
  router.post(
    "/customer-orders",
    role(P.create["customer-orders"]),
    async (req, res) => {
      const result = await runtime.orders.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/customer-orders/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.patch(
    "/customer-orders/:id",
    role(P.editable["customer-orders"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.orders.update(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post(
    "/customer-orders/:id/receive",
    role(["PLANNER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.orders.receive(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post(
    "/customer-orders/:id/review",
    role(["DIRECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.orders.review(
          req.user,
          req.params.id,
          req.body,
          req.get("Idempotency-Key"),
          req.request_id,
        ),
      ),
  );
  router.get(
    "/production-plans",
    role(P.read["production-plans"]),
    async (req, res) => {
      const result = await runtime.productionPlans.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get('/production-plans/:id/material-comparison',role(['WORKSHOP_OWNER','PLANNER','DIRECTOR']),async(req,res)=>ok(req,res,await runtime.productionPlans.materialComparison(req.user,req.params.id)));
  router.post('/production-plans/recipe-estimate',role(['PLANNER']),async(req,res)=>{C.fields(req.body,['outputs']);ok(req,res,await require('./production-recipes').fromDatabase(runtime.pool,req.body.outputs));});
  router.get(
    "/production-plans/:id",
    role(P.read["production-plans"]),
    async (req, res) =>
      ok(req, res, await runtime.productionPlans.get(req.user, req.params.id)),
  );
  router.post(
    "/production-plans",
    role(P.create["production-plans"]),
    async (req, res) => {
      const result = await runtime.productionPlans.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/production-plans/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.post(
    "/production-plans/:id/cancel",
    role(["PLANNER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.productionPlans.cancel(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.patch("/production-plans/:id", role(["PLANNER"]), async (req, res) =>
    ok(
      req,
      res,
      await runtime.productionPlans.update(
        req.user,
        req.params.id,
        req.body,
        req.request_id,
      ),
    ),
  );
  router.post(
    "/production-plans/:id/review",
    role(["DIRECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.productionPlans.review(
          req.user,
          req.params.id,
          req.body,
          req.get("Idempotency-Key"),
          req.request_id,
        ),
      ),
  );
  router.get(
    "/business-plans",
    role(P.read["business-plans"]),
    async (req, res) => {
      const result = await runtime.businessPlans.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/business-plans/:id",
    role(P.read["business-plans"]),
    async (req, res) =>
      ok(req, res, await runtime.businessPlans.get(req.user, req.params.id)),
  );
  router.post(
    "/business-plans",
    role(P.create["business-plans"]),
    async (req, res) => {
      const result = await runtime.businessPlans.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/business-plans/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.patch(
    "/business-plans/:id",
    role(P.editable["business-plans"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.businessPlans.update(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.delete(
    "/business-plans/:id",
    role(P.editable["business-plans"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.businessPlans.remove(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post(
    "/business-plans/:id/review",
    role(["DIRECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.businessPlans.review(
          req.user,
          req.params.id,
          req.body,
          req.get("Idempotency-Key"),
          req.request_id,
        ),
      ),
  );
  router.get(
    "/purchase-orders",
    role(P.read["purchase-orders"]),
    async (req, res) => {
      const result = await runtime.purchaseOrders.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/purchase-orders/:id",
    role(P.read["purchase-orders"]),
    async (req, res) =>
      ok(req, res, await runtime.purchaseOrders.get(req.user, req.params.id)),
  );
  router.post(
    "/purchase-orders",
    role(P.create["purchase-orders"]),
    async (req, res) => {
      const result = await runtime.purchaseOrders.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/purchase-orders/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  for (const [resource, service] of [
    ["production-reports", runtime.productionReports],
    ["finished-reports", runtime.finishedReports],
  ]) {
    router.get("/" + resource, role(P.read[resource]), async (req, res) => {
      const result = await service.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    });
    router.get(
      "/" + resource + "/:id",
      role(P.read[resource]),
      async (req, res) =>
        ok(req, res, await service.get(req.user, req.params.id)),
    );
    router.post("/" + resource, role(P.create[resource]), async (req, res) => {
      const result = await service.create(req.user, req.body, req.request_id);
      res.set("Location", `/api/v1/${resource}/${result.id}`);
      ok(req, res, result, 201);
    });
    router.patch(
      "/" + resource + "/:id",
      role(P.editable[resource]),
      async (req, res) =>
        ok(
          req,
          res,
          await service.update(
            req.user,
            req.params.id,
            req.body,
            req.request_id,
          ),
        ),
    );
    router.post(
      "/" + resource + "/:id/submit",
      role(["WORKSHOP_OWNER"]),
      async (req, res) =>
        ok(
          req,
          res,
          await service.submit(
            req.user,
            req.params.id,
            req.body,
            req.request_id,
          ),
        ),
    );
  }
  for (const kind of ["inventory", "stock-documents", "stocktakes"]) {
    const resource = "reports/" + kind;
    router.get(
      "/" + resource,
      role(reportRoles[resource]),
      async (req, res) => {
        const result = await runtime.reports.run(req.user, kind, req.query);
        ok(req, res, result.data, 200, result.meta);
      },
    );
    router.get(
      "/" + resource + "/export",
      role(reportRoles[resource]),
      async (req, res) => {
        const csv = await runtime.reports.csv(req.user, kind, req.query);
        res.set("Content-Type", "text/csv; charset=utf-8");
        res.set("Content-Disposition", `attachment; filename="${kind}.csv"`);
        res.send(csv);
      },
    );
  }
  router.get(
    "/quality-campaigns",
    role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]),
    async (req, res) => {
      const result = await runtime.qualityCampaigns.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get('/quality-campaign-sources',role(['DIRECTOR']),async(req,res)=>ok(req,res,await runtime.qualityCampaigns.sources(req.user)));
  router.get('/task-inspection-sources',role(['DIRECTOR']),async(req,res)=>ok(req,res,await runtime.tasks.inspectionSources(req.user)));
  router.post('/quality-campaigns/:id/bind-lots',role(['DIRECTOR']),async(req,res)=>ok(req,res,await runtime.qualityCampaigns.bindLots(req.user,req.params.id,req.body,req.request_id)));
  router.get(
    "/quality-campaigns/:id",
    role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]),
    async (req, res) =>
      ok(req, res, await runtime.qualityCampaigns.get(req.user, req.params.id)),
  );
  router.post("/quality-campaigns", role(["DIRECTOR"]), async (req, res) => {
    const result = await runtime.qualityCampaigns.create(
      req.user,
      req.body,
      req.request_id,
    );
    res.set("Location", `/api/v1/quality-campaigns/${result.id}`);
    ok(req, res, result, 201);
  });
  for (const action of ["start", "close"])
    router.post(
      `/quality-campaigns/:id/${action}`,
      role(["DIRECTOR"]),
      async (req, res) =>
        ok(
          req,
          res,
          await runtime.qualityCampaigns.action(
            req.user,
            req.params.id,
            req.body,
            action,
            req.request_id,
          ),
        ),
    );
  router.post("/stocktakes", role(["DIRECTOR"]), async (req, res, next) => {
    if (req.body?.campaign_type !== "QUALITY_CHECK")
      return ok(
        req,
        res,
        await runtime.stocktakes.create(req.user, req.body, req.request_id),
        201,
      );
    const result = await runtime.qualityCampaigns.create(
      req.user,
      req.body,
      req.request_id,
    );
    res.set("Location", `/api/v1/quality-campaigns/${result.id}`);
    ok(req, res, result, 201);
  });
  router.post(
    "/qc-inspections/:id/correct",
    role(["QC_INSPECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.quality.correct(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post(
    "/tasks/:id/cancelAllocation",
    role(["WAREHOUSE_MANAGER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.warehouseFlow.cancelAllocation(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.get(
    "/stocktakes",
    role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]),
    async (req, res) => {
      const result = await runtime.stocktakes.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/stocktakes/:id",
    role(["DIRECTOR", "WAREHOUSE_MANAGER", "QC_INSPECTOR", "STOCKTAKER"]),
    async (req, res) =>
      ok(req, res, await runtime.stocktakes.get(req.user, req.params.id)),
  );
  for (const action of ["start", "close"])
    router.post(
      "/stocktakes/:id/" + action,
      role(["DIRECTOR"]),
      async (req, res) => {
        const row = await runtime.stocktakes.get(req.user, req.params.id),
          service =
            row.campaign_type === "QUALITY_CHECK"
              ? runtime.qualityCampaigns
              : runtime.stocktakes;
        ok(
          req,
          res,
          await service.action(
            req.user,
            req.params.id,
            req.body,
            action,
            req.request_id,
          ),
        );
      },
    );
  router.get(
    "/stocktake-minutes",
    role(P.read["stocktake-minutes"]),
    async (req, res) => {
      const r = await runtime.stocktakes.minutesList(req.user, req.query);
      ok(req, res, r.data, 200, r.meta);
    },
  );
  router.get(
    "/stocktake-minutes/:id",
    role(P.read["stocktake-minutes"]),
    async (req, res) =>
      ok(req, res, await runtime.stocktakes.minuteGet(req.user, req.params.id)),
  );
  router.post("/stocktake-minutes", role(P.create["stocktake-minutes"]), async (req, res) =>
    ok(
      req,
      res,
      await runtime.stocktakes.minuteWrite(
        req.user,
        null,
        req.body,
        "create",
        req.request_id,
      ),
      201,
    ),
  );
  router.patch(
    "/stocktake-minutes/:id",
    role(P.editable["stocktake-minutes"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stocktakes.minuteWrite(
          req.user,
          req.params.id,
          req.body,
          "edit",
          req.request_id,
        ),
      ),
  );
  router.post(
    "/stocktake-minutes/:id/submit",
    role(P.editable["stocktake-minutes"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stocktakes.minuteWrite(
          req.user,
          req.params.id,
          req.body,
          "submit",
          req.request_id,
        ),
      ),
  );
  router.get(
    "/exception-proposals",
    role(P.read["exception-proposals"]),
    async (req, res) => {
      const r = await runtime.exceptions.list(req.user, req.query);
      ok(req, res, r.data, 200, r.meta);
    },
  );
  router.get(
    "/exception-proposals/:id",
    role(P.read["exception-proposals"]),
    async (req, res) =>
      ok(req, res, await runtime.exceptions.get(req.user, req.params.id)),
  );
  router.post(
    "/exception-proposals",
    role(P.create["exception-proposals"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.exceptions.create(req.user, req.body, req.request_id),
        201,
      ),
  );
  router.post(
    "/exception-proposals/:id/review",
    role(["DIRECTOR","WORKSHOP_OWNER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.exceptions.review(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post(
    "/exception-proposals/:id/apply",
    role(["WAREHOUSE_MANAGER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.exceptions.apply(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.post("/exception-proposals/:id/reinspect", role(["QC_INSPECTOR"]), async (req,res) =>
    ok(req,res,await runtime.exceptions.reinspect(req.user,req.params.id,req.body,req.request_id)));
  router.get(
    "/stocktake-differences",
    role(["WAREHOUSE_MANAGER", "DIRECTOR"]),
    async (req, res) => {
      const r = await runtime.stocktakes.differences(req.user, req.query);
      ok(req, res, r.data, 200, r.meta);
    },
  );
  router.get(
    "/stocktakes/:id/warehouses/:warehouse/lines",
    role(["STOCKTAKER", "QC_INSPECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stocktakes.lines(
          req.user,
          req.params.id,
          req.params.warehouse,
        ),
      ),
  );
  router.patch(
    "/stocktakes/:id/warehouses/:warehouse/counts",
    role(["STOCKTAKER", "QC_INSPECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stocktakes.counts(
          req.user,
          req.params.id,
          req.params.warehouse,
          req.body,
        ),
      ),
  );
  router.post(
    "/stocktakes/:id/warehouses/:warehouse/complete",
    role(["STOCKTAKER", "QC_INSPECTOR"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stocktakes.complete(
          req.user,
          req.params.id,
          req.params.warehouse,
          req.body,
        ),
      ),
  );
  router.get(
    "/qc-inspections",
    role(P.read["qc-inspections"]),
    async (req, res) => {
      const result = await runtime.quality.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/qc-inspections/:id",
    role(P.read["qc-inspections"]),
    async (req, res) =>
      ok(req, res, await runtime.quality.get(req.user, req.params.id)),
  );
  router.post(
    "/qc-inspections",
    role(P.create["qc-inspections"]),
    async (req, res) => {
      const result = await runtime.quality.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/qc-inspections/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.patch(
    "/qc-inspections/:id",
    role(P.editable["qc-inspections"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.quality.update(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.delete(
    "/qc-inspections/:id",
    role(P.editable["qc-inspections"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.quality.remove(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.get(
    "/stock-requests",
    role(P.read["stock-requests"]),
    async (req, res) => {
      const result = await runtime.stockRequests.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/stock-requests/:id",
    role(P.read["stock-requests"]),
    async (req, res) =>
      ok(req, res, await runtime.stockRequests.get(req.user, req.params.id)),
  );
  router.post(
    "/stock-requests",
    role(P.create["stock-requests"]),
    async (req, res) => {
      const result = await runtime.stockRequests.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/stock-requests/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.patch(
    "/stock-requests/:id",
    role(P.editable["stock-requests"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stockRequests.update(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.delete(
    "/stock-requests/:id",
    role(P.editable["stock-requests"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.stockRequests.remove(
          req.user,
          req.params.id,
          req.body,
          req.request_id,
        ),
      ),
  );
  router.get(
    "/stock-requests/:id/allocations",
    role(["WAREHOUSE_MANAGER", "WAREHOUSE_STAFF"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.warehouseFlow.preview(req.user, req.params.id, req.query),
      ),
  );
  router.post(
    "/stock-requests/:id/dispatch",
    role(["WAREHOUSE_MANAGER"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.warehouseFlow.dispatch(
          req.user,
          req.params.id,
          req.body,
          req.get("Idempotency-Key"),
          req.request_id,
        ),
      ),
  );
  router.get(
    "/stock-documents",
    role(P.read["stock-documents"]),
    async (req, res) => {
      const result = await runtime.warehouseFlow.documents(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/stock-documents/:id",
    role(P.read["stock-documents"]),
    async (req, res) =>
      ok(
        req,
        res,
        await runtime.warehouseFlow.document(req.user, req.params.id),
      ),
  );
  router.post(
    "/stock-documents",
    role(P.create["stock-documents"]),
    async (req, res) => {
      const result = await runtime.warehouseFlow.post(
        req.user,
        req.body,
        req.get("Idempotency-Key"),
        req.request_id,
      );
      res.set("Location", `/api/v1/stock-documents/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  router.get(
    "/warehouse-records",
    role(P.read["warehouse-records"]),
    async (req, res) => {
      const result = await runtime.warehouseRecords.list(req.user, req.query);
      ok(req, res, result.data, 200, result.meta);
    },
  );
  router.get(
    "/warehouse-records/:id",
    role(P.read["warehouse-records"]),
    async (req, res) =>
      ok(req, res, await runtime.warehouseRecords.get(req.user, req.params.id)),
  );
  router.post(
    "/warehouse-records",
    role(P.create["warehouse-records"]),
    async (req, res) => {
      const result = await runtime.warehouseRecords.create(
        req.user,
        req.body,
        req.request_id,
      );
      res.set("Location", `/api/v1/warehouse-records/${result.id}`);
      ok(req, res, result, 201);
    },
  );
  for (const module of registry)
    for (const resource of module.resources) {
      if (
        [
          "auth",
          "customer-returns",
          "customer-orders",
          "production-plans",
          "business-plans",
          "purchase-orders",
          "production-reports",
          "finished-reports",
          "qc-inspections",
          "stock-requests",
          "stock-documents",
          "warehouse-records",
          "stocktake-minutes",
          "exception-proposals",
          "stocktakes",
          "tasks",
        ].includes(resource) ||
        resource.startsWith("reports/")
      )
        continue;
      const roles = P.read[resource] || reportRoles[resource];
      if (runtime.catalog.supports(resource)) {
        router.get("/" + resource, catalog.list(resource));
        router.get("/" + resource + "/:id", catalog.show(resource));
        if (resource !== "lots") {
          router.post(
            "/" + resource,
            role(P.create[resource]),
            async (req, res) => {
              const result = await runtime.catalogWrite.create(
                req.user,
                resource,
                req.body,
                req.request_id,
              );
              res.set("Location", `/api/v1/${resource}/${result.id}`);
              ok(req, res, result, 201);
            },
          );
          router.patch(
            "/" + resource + "/:id",
            role(P.editable[resource]),
            async (req, res) =>
              ok(
                req,
                res,
                await runtime.catalogWrite.update(
                  req.user,
                  resource,
                  req.params.id,
                  req.body,
                  req.request_id,
                ),
              ),
          );
          router.delete(
            "/" + resource + "/:id",
            role(P.editable[resource]),
            async (req, res) =>
              ok(
                req,
                res,
                await runtime.catalogWrite.remove(
                  req.user,
                  resource,
                  req.params.id,
                  req.body,
                  req.request_id,
                ),
              ),
          );
        } else {
          router.post("/lots", role(P.create.lots), async (req, res) => {
            const result = await runtime.catalogWrite.createLot(
              req.user,
              req.body,
              req.request_id,
            );
            res.set("Location", `/api/v1/lots/${result.id}`);
            ok(req, res, result, 201);
          });
          router.patch("/lots/:id", role(P.editable.lots), async (req, res) =>
            ok(
              req,
              res,
              await runtime.catalogWrite.updateLot(
                req.user,
                req.params.id,
                req.body,
                req.request_id,
              ),
            ),
          );
          router.delete("/lots/:id", role(P.editable.lots), async (req, res) =>
            ok(
              req,
              res,
              await runtime.catalogWrite.removeLot(
                req.user,
                req.params.id,
                req.body,
                req.request_id,
              ),
            ),
          );
        }
      } else if (resource === "notifications") {
        router.get("/notifications", async (req, res) => {
          const r = await runtime.notifications.list(req.user, req.query);
          ok(req, res, r.data, 200, r.meta);
        });
        router.get("/notifications/:id", async (req, res) =>
          ok(
            req,
            res,
            await runtime.notifications.get(req.user, req.params.id),
          ),
        );
        router.patch("/notifications/:id/read", async (req, res) =>
          ok(
            req,
            res,
            await runtime.notifications.read(req.user, req.params.id),
          ),
        );
      } else {
        router.get("/" + resource, role(roles), pending);
        router.get("/" + resource + "/:id", role(roles), pending);
      }
      if (P.create[resource] && !runtime.catalog.supports(resource))
        router.post("/" + resource, role(P.create[resource]), pending);
      if (P.editable[resource] && !runtime.catalog.supports(resource))
        router.patch(
          "/" + resource + "/:id",
          role(P.editable[resource]),
          pending,
        );
      if (
        [
          ...P.masters,
          "business-plans",
          "stock-requests",
          "qc-inspections",
          "tasks",
        ].includes(resource) &&
        !runtime.catalog.supports(resource)
      )
        router.delete(
          "/" + resource + "/:id",
          role(P.editable[resource]),
          pending,
        );
      for (const [action, names] of Object.entries(P.actionResources))
        if (action !== "read" && names.includes(resource)) {
          const actionRoles =
            action === "receive"
              ? ["PLANNER"]
              : action === "dispatch"
                ? ["WAREHOUSE_MANAGER"]
                : action === "cancel"
                  ? ["PLANNER"]
                  : action === "submit"
                    ? P.editable[resource]
                    : action === "progress"
                      ? ["DIRECTOR", "WAREHOUSE_MANAGER"]
                      : ["DIRECTOR"];
          router.post(
            "/" + resource + "/:id/" + action,
            role(actionRoles),
            pending,
          );
        }
      if (resource.startsWith("reports/"))
        router.get("/" + resource + "/export", role(roles), pending);
    }
  router.post('/tasks/:id/postTask',role(['WAREHOUSE_STAFF']),async(req,res)=>{
    C.fail(!/^[1-9]\d*$/.test(req.params.id),'NOT_FOUND','Không có công việc.',404);
    C.fail(req.body.task_id!==undefined && String(req.body.task_id)!==req.params.id,'VALIDATION_ERROR','Công việc trong URL và phiếu không khớp.');
    const result=await runtime.warehouseFlow.post(req.user,{...req.body,task_id:req.params.id},req.get('Idempotency-Key'),req.request_id);
    res.set('Location','/api/v1/stock-documents/'+result.id);
    ok(req,res,result,201);
  });
  return router;
};
