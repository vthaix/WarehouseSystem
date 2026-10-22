// Development-only API fixtures. Never fabricate inventory or bypass posting rules.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const mysql = require("mysql2/promise");
const { wrapSql } = require("../src/config/vietnamese-sql");
const { tableNames, identifier } = require("../src/config/service-databases");
require("../src/config/env").loadEnv();

async function main() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.SEED_DEMO !== "true"
  ) {
    console.log(
      "Demo workflows skipped (development + SEED_DEMO=true required).",
    );
    return;
  }
  const source = process.env.DB_NAME || "KhoHang";
  identifier(source);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "mysql",
    port: Number(process.env.DB_PORT || 3306),
    user: "root",
    password: fs
      .readFileSync("/run/warehouse-mysql-secrets/root_password", "utf8")
      .trim(),
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
  });
  const db = wrapSql(connection, tableNames(source + "_Gateway"));
  let locked = false;
  try {
    const [[lock]] = await connection.execute("SELECT GET_LOCK(?,30) n", [
      "warehouse:demo-workflows:" + source,
    ]);
    if (Number(lock.n) !== 1)
      throw Error("Cannot lock demo workflow initialization");
    locked = true;
    const [[fingerprint]] = await db.query(
      "SELECT id,created_at,password_hash FROM users WHERE username='customer'",
    );
    if (!fingerprint) throw Error("Seed demo users first");
    const legacyGeneration = crypto
      .createHash("sha256")
      .update(source + JSON.stringify(fingerprint))
      .digest("hex")
      .slice(0, 16);
    const generation = crypto
      .createHash("sha256")
      .update(
        source +
          JSON.stringify({
            id: fingerprint.id,
            created_at: fingerprint.created_at,
          }),
      )
      .digest("hex")
      .slice(0, 16);
    const directory =
      process.env.DEMO_STATE_DIRECTORY ||
      "/var/backups/warehouse/demo-workflows";
    fs.mkdirSync(directory, { recursive: true });
    const file = path.join(directory, generation + ".json");
    const legacyFile = path.join(directory, legacyGeneration + ".json");
    if (!fs.existsSync(file) && fs.existsSync(legacyFile))
      fs.renameSync(legacyFile, file);
    const state = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : {
          version: 1,
          date: require("../src/services/domain/core").today(),
          started: Date.now(),
          slot: 0,
          operations: {},
          scenarios: {},
        };
    const save = () => {
      fs.writeFileSync(file + ".tmp", JSON.stringify(state, null, 2));
      fs.renameSync(file + ".tmp", file);
    };
    if (process.argv.includes("--list")) {
      for (const [name, scenario] of Object.entries(state.scenarios)) {
        const records = Object.fromEntries(
          Object.entries(scenario.records)
            .filter(([, r]) => r && typeof r === "object" && r.id)
            .map(([key, r]) => [
              key,
              {
                id: r.id,
                code: r.code || r.title || null,
                status: r.status || null,
              },
            ]),
        );
        console.log(
          JSON.stringify({ name, description: scenario.description, records }),
        );
      }
      return;
    }
    const base = process.env.DEMO_API_URL || "http://app:3000";
    const sessions = {};
    const password = process.env.DEMO_PASSWORD;
    if (!password) throw Error("Demo password required");
    async function raw(user, endpoint, method = "GET", body, key) {
      const session = (sessions[user] ||= { cookie: "", csrf: "" });
      const r = await fetch(base + "/api/v1/" + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Cookie: session.cookie,
          "X-CSRF-Token": session.csrf,
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(30000),
      });
      const cookies = r.headers.getSetCookie();
      if (cookies.length)
        session.cookie = cookies.map((c) => c.split(";")[0]).join("; ");
      const data = await r.json();
      if (!r.ok)
        throw Error(
          `${user} ${method} ${endpoint}: ${r.status} ${JSON.stringify(data.error)}`,
        );
      return data.data;
    }
    async function login(user) {
      if (sessions[user]?.loggedIn) return;
      sessions[user] = { cookie: "", csrf: "" };
      sessions[user].csrf = (await raw(user, "auth/csrf")).csrf_token;
      const result = await raw(user, "auth/login", "POST", {
        username: user,
        password,
      });
      sessions[user].csrf = result.csrf_token;
      sessions[user].loggedIn = true;
    }
    async function op(name, user, endpoint, body, method = "POST") {
      if (state.operations[name]?.result) return state.operations[name].result;
      await login(user);
      const saved = (state.operations[name] ||= {
        key: crypto.randomUUID(),
        body,
        endpoint,
        method,
        user,
      });
      saved.body = body;
      save();
      saved.result = await raw(
        saved.user,
        saved.endpoint,
        saved.method,
        saved.body,
        saved.key,
      );
      save();
      return saved.result;
    }
    async function get(user, endpoint) {
      await login(user);
      return raw(user, endpoint);
    }
    async function scenario(name, description, build) {
      if (state.scenarios[name]) return state.scenarios[name].records;
      const records = await build();
      state.scenarios[name] = { description, records };
      save();
      console.log("DEMO READY: " + name + " — " + description);
      return records;
    }
    const [users] = await db.query(
      "SELECT id,username FROM users WHERE username IN ('manager','staff','staff2','qc','stocktaker','purchaser','customer')",
    );
    const ids = Object.fromEntries(
      users.map((r) => [r.username, String(r.id)]),
    );
    const [[assigned]] = await db.query(
      "SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id WHERE u.username='workshop' ORDER BY wu.workshop_id LIMIT 1",
    );
    const workshop = String(assigned.workshop_id);
    const [[material]] = await db.query(
      "SELECT id FROM items WHERE code='NVL-001'",
    );
    const [[finished]] = await db.query(
      "SELECT id FROM items WHERE code='TP-001'",
    );
    const [[supplier]] = await db.query(
      "SELECT id FROM suppliers WHERE code='NCC-01'",
    );
    const mat = String(material.id),
      cake = String(finished.id),
      ncc = String(supplier.id);
    const date = state.date;
    function slot(name) {
      const key = "slot:" + name;
      if (!state.operations[key]) {
        const start = state.started + (30 * 24 + state.slot++ * 3) * 3600000;
        state.operations[key] = {
          result: {
            start_at: new Date(start).toISOString(),
            end_at: new Date(start + 3600000).toISOString(),
          },
        };
        save();
      }
      return state.operations[key].result;
    }
    function note(name) {
      return "[DEMO " + name + "]";
    }
    const stock = await scenario(
      "CATALOG",
      "Danh mục riêng để thử thêm/sửa/xóa, kho tồn và kho kiểm kê độc lập",
      async () => {
        const category = await op("cat", "manager", "categories", {
          code: "DEMO-UC",
          name: "Danh mục thử UC",
          description: "Dữ liệu kiểm thử riêng",
          is_active: true,
        });
        const disposable = await op("cat-delete", "manager", "categories", {
          code: "DEMO-XOA",
          name: "Danh mục thử xóa",
          is_active: true,
        });
        const item = await op("item-delete", "manager", "items", {
          code: "DEMO-XOA-TP",
          name: "Bánh mẫu để thử sửa xóa",
          category_id: category.id,
          unit_id: String(
            (
              await db.query("SELECT unit_id FROM items WHERE id=?", [cake])
            )[0][0].unit_id,
          ),
          kind: "FINISHED_PRODUCT",
          reference_price: "10000.0000",
          is_sample: true,
          is_published: false,
          is_active: true,
        });
        const warehouse = await op("warehouse", "manager", "warehouses", {
          code: "DEMO-KHO",
          name: "Kho thử UC nhập xuất",
          is_active: true,
        });
        const location = await op(
          "location",
          "manager",
          "warehouse-locations",
          {
            code: "DEMO-VT",
            name: "Vị trí thử UC",
            warehouse_id: warehouse.id,
            is_active: true,
          },
        );
        return { category, disposable, item, warehouse, location };
      },
    );
    const wh = stock.warehouse.id,
      loc = stock.location.id;
    await db.query("INSERT INTO units (code,name) VALUES ('GOI','gói') ON DUPLICATE KEY UPDATE id=id");
    const [saleUnits] = await db.query("SELECT id,code FROM units WHERE code IN ('HOP','GOI')");
    const saleUnitIds = Object.fromEntries(saleUnits.map(u => [u.code, String(u.id)]));
    const [packagedCakes] = await db.query("SELECT id,code,unit_id FROM items WHERE code IN ('TP-001','TP-002','TP-003','TP-004','TP-005')");
    for (const item of packagedCakes) {
      if (String(item.unit_id) === saleUnitIds.GOI) continue;
      await db.query("UPDATE items SET unit_id=?,version=version+1 WHERE id=? AND unit_id IN (SELECT id FROM units WHERE name='cái')",
        [saleUnitIds.GOI, item.id]);
    }
    for (const [code, name, price] of [
      ["TP-DEMO-01", "Bánh quy bơ hộp 200g", "45000.0000"],
      ["TP-DEMO-02", "Bánh bông lan đóng gói 120g", "22000.0000"],
      ["TP-DEMO-03", "Bánh quy cacao hộp 200g", "49000.0000"],
    ]) {
      const unitId = saleUnitIds[code === "TP-DEMO-02" ? "GOI" : "HOP"];
      const created = await op("customer-shop:" + code, "manager", "items", {
        code, name, category_id: stock.category.id, unit_id: unitId,
        kind: "FINISHED_PRODUCT", reference_price: price,
        is_sample: true, is_published: true, is_active: true,
      });
      const currentItem = await get("manager", "items/" + created.id);
      if (String(currentItem.unit_id) !== unitId)
        await db.query("UPDATE items SET unit_id=?,version=version+1 WHERE id=? AND unit_id IN (SELECT id FROM units WHERE name='cái')",
          [unitId, created.id]);
    }
    async function production(name, stage = "APPROVED") {
      let order = await op(name + ":order", "customer", "customer-orders", {
        delivery_address: note(name) + " Cửa hàng bánh thử nghiệm",
        latest_delivery_date: date,
        note: note(name),
        lines: [{ item_id: cake, quantity: "10.000" }],
      });
      if (stage === "SUBMITTED") return { order };
      order = await op(
        name + ":receive",
        "planner",
        `customer-orders/${order.id}/receive`,
        { version: order.version },
      );
      if (stage === "RECEIVED") return { order };
      let plan = await op(name + ":plan", "planner", "production-plans", {
        customer_order_id: order.id,
        workshop_id: workshop,
        start_date: date,
        end_date: date,
        note: note(name),
        outputs: [{ item_id: cake, quantity: "10.000" }],
        materials: [{ item_id: mat, required_quantity: "1000.000" }],
      });
      if (stage === "PENDING") return { order, plan };
      plan = await op(
        name + ":approve",
        "director",
        `production-plans/${plan.id}/review`,
        { version: plan.version, decision: "APPROVE" },
      );
      order = await get("planner", `customer-orders/${order.id}`);
      plan = await get("planner", `production-plans/${plan.id}`);
      return { order, plan };
    }
    async function report(name, p) {
      let r = await op(name + ":report", "workshop", "production-reports", {
        production_plan_id: p.plan.id,
        report_purpose: "NHU_CAU",
        progress_percentage: "20",
        note: note(name) + " Thiếu bột mì",
        send_to_planner: true,
        lines: [{ item_id: mat, required_quantity: "1000.000" }],
      });
      r = await op(
        name + ":report-submit",
        "workshop",
        `production-reports/${r.id}/submit`,
        { version: r.version },
      );
      return r;
    }
    async function buyPlan(name, p, approved) {
      const r = await report(name, p);
      let b = await op(name + ":buyplan", "planner", "business-plans", {
        type: "PURCHASE",
        supplier_id: ncc,
        production_plan_id: p.plan.id,
        production_report_id: r.id,
        planned_date: date,
        note: note(name),
        lines: [{ item_id: mat, quantity: "10.000", unit_price: "25000.0000" }],
      });
      if (approved)
        b = await op(
          name + ":buyapprove",
          "director",
          `business-plans/${b.id}/review`,
          { version: b.version, decision: "APPROVE" },
        );
      return { ...p, report: r, buyPlan: b };
    }
    async function materialLot(name, stage = "QC_PENDING") {
      const purchase = await op(
        name + ":purchase",
        "purchaser",
        "purchase-orders",
        {
          source_mode: "MANUAL",
          supplier_id: ncc,
          expected_delivery_date: date,
          delivery_terms: note(name),
          lines: [
            { item_id: mat, quantity: "20.000", unit_price: "25000.0000" },
          ],
        },
      );
      if (stage === "PURCHASE") return { purchase };
      const lot = await op(name + ":lot", "manager", "lots", {
        code: "DEMO-" + name,
        purchase_order_id: purchase.id,
        purchase_order_line_id: purchase.lines[0].id,
        received_quantity: "20.000",
      });
      const inspection = await inspect(
        name,
        lot,
        "MATERIAL",
        stage === "QC_PENDING" ? "PENDING" : "PASS",
      );
      return { purchase, lot, ...inspection };
    }
    async function inspect(name, lot, kind, stage) {
      let campaign = await op(
        name + ":qc-campaign",
        "director",
        "quality-campaigns",
        {
          campaign_type: "QUALITY_CHECK",
          quality_kind: kind,
          planned_date: date,
          ...slot(name + ":qc"),
          location: note(name) + " Khu kiểm tra",
          assignee_ids: [ids.qc],
          lot_ids: [lot.id],
        },
      );
      campaign = await op(
        name + ":qc-start",
        "director",
        `quality-campaigns/${campaign.id}/start`,
        { version: campaign.version },
      );
      if (stage === "PENDING") return { campaign };
      const quantity = kind === "MATERIAL" ? "20.000" : "10.000";
      const quality = await op(name + ":qc-result", "qc", "qc-inspections", {
        campaign_id: campaign.id,
        inspected_at: new Date(state.started).toISOString(),
        note: note(name),
        lines: [
          {
            lot_id: lot.id,
            inspected_quantity: quantity,
            passed_quantity: stage === "FAIL" ? "8.000" : quantity,
            failed_quantity: stage === "FAIL" ? "2.000" : "0.000",
            ...(stage === "FAIL" ? { issue: "Bao bì lỗi kiểm thử" } : {}),
          },
        ],
      });
      return { campaign, quality };
    }
    async function request(name, purpose, sourceFields, item, quantity) {
      return op(name + ":request", "workshop", "stock-requests", {
        purpose,
        ...sourceFields,
        workshop_id: workshop,
        warehouse_id: wh,
        manager_id: ids.manager,
        requested_date: date,
        note: note(name),
        lines: [{ item_id: item, quantity }],
      });
    }
    async function execute(
      name,
      r,
      lot,
      quantity,
      post = true,
      targetLocation = loc,
    ) {
      const allocation = {
        stock_request_line_id: r.lines[0].id,
        lot_id: lot,
        location_id: targetLocation,
        quality_bucket: "AVAILABLE",
        quantity,
      };
      const dispatch = await op(
        name + ":dispatch",
        "manager",
        `stock-requests/${r.id}/dispatch`,
        {
          version: r.version,
          ...slot(name + ":staff"),
          allocations: [{ ...allocation, assignee_id: ids.staff }],
        },
      );
      if (!post) return { request: r, dispatch };
      const document = await op(name + ":post", "staff", "stock-documents", {
        stock_request_id: r.id,
        request_version: dispatch.version,
        task_id: dispatch.tasks[0].id,
        allocations: [allocation],
      });
      return { request: r, dispatch, document };
    }
    async function received(name, stage = "POSTED") {
      const m = await materialLot(name, "PASS");
      const r = await request(
        name,
        "PURCHASE_RECEIPT",
        { purchase_order_id: m.purchase.id },
        mat,
        "20.000",
      );
      if (stage === "REQUEST") return { ...m, request: r };
      return {
        ...m,
        ...(await execute(name, r, m.lot.id, "20.000", stage === "POSTED")),
      };
    }
    await scenario(
      "DON-CHO",
      "UC-29: đơn chờ tiếp nhận; UC-03.1: khách sửa đơn",
      () => production("DON-CHO", "SUBMITTED"),
    );
    await scenario(
      "DON-CHO-2",
      "Đơn chờ tiếp nhận dự phòng để thử độc lập",
      () => production("DON-CHO-2", "SUBMITTED"),
    );
    await scenario(
      "TAO-KHSX",
      "Đơn đã tiếp nhận, còn toàn bộ lượng để import KHSX",
      () => production("TAO-KHSX", "RECEIVED"),
    );
    await scenario("DUYET-DON", "UC-31: đơn và KHSX chờ duyệt", () =>
      production("DUYET-DON", "PENDING"),
    );
    await scenario("BAO-CAO-SX", "UC-34: KHSX đã duyệt, chưa có báo cáo", () =>
      production("BAO-CAO-SX"),
    );
    await scenario(
      "MUA-NGUON",
      "UC-04: báo cáo thiếu NVL đã gửi planner, chưa lập MUA",
      async () => {
        const p = await production("MUA-NGUON");
        return { ...p, report: await report("MUA-NGUON", p) };
      },
    );
    await scenario(
      "DUYET-MUA",
      "UC-05/32: kế hoạch MUA chờ duyệt, có thể thử sửa/xóa",
      async () => buyPlan("DUYET-MUA", await production("DUYET-MUA"), false),
    );
    await scenario(
      "LAP-DON-MUA",
      "UC-27: kế hoạch MUA đã duyệt, chưa có đơn mua",
      async () => buyPlan("LAP-DON-MUA", await production("LAP-DON-MUA"), true),
    );
    await scenario(
      "NHAN-NVL",
      "UC-14: đơn mua thủ công, chưa ghi nhận lô",
      () => materialLot("NHAN-NVL", "PURCHASE"),
    );
    await scenario("QC-NVL", "UC-12.1: lô NVL chờ QC; lịch đã bắt đầu", () =>
      materialLot("QC-NVL"),
    );
    await scenario("QC-SUA", "UC-12/12.2/12.3: QC đã ghi, chưa nhập kho", () =>
      materialLot("QC-SUA", "PASS"),
    );
    await scenario(
      "YC-NHAP",
      "UC-23 nhập NVL: phần đạt QC chưa có yêu cầu nhập",
      () => materialLot("YC-NHAP", "PASS"),
    );
    await scenario(
      "YC-SUA",
      "UC-24/24.1/24.2: yêu cầu nhập chờ điều phối",
      () => received("YC-SUA", "REQUEST"),
    );
    await scenario(
      "NHAP-KHO",
      "UC-10: yêu cầu đã phân công cho staff, chưa ghi sổ",
      () => received("NHAP-KHO", "ASSIGNED"),
    );
    const inventory = await scenario(
      "TON-KHO",
      "UC-08/18/19/20/22: có phiếu nhập và tồn thật",
      () => received("TON-KHO"),
    );
    await scenario(
      "YC-XUAT-NVL",
      "UC-23 xuất NVL: KHSX đã duyệt và tồn khả dụng",
      () => production("YC-XUAT-NVL"),
    );
    await scenario(
      "XUAT-NVL",
      "UC-11.01: yêu cầu xuất NVL đã giao staff",
      async () => {
        const p = await production("XUAT-NVL");
        const r = await request(
          "XUAT-NVL",
          "PRODUCTION_ISSUE",
          { production_plan_id: p.plan.id, production_source_mode: "PLAN" },
          mat,
          "1.000",
        );
        return {
          ...p,
          ...(await execute("XUAT-NVL", r, inventory.lot.id, "1.000", false)),
        };
      },
    );
    async function productionIssued(name) {
      const p = await production(name);
      const r = await request(
        name + ":issue",
        "PRODUCTION_ISSUE",
        { production_plan_id: p.plan.id, production_source_mode: "PLAN" },
        mat,
        "1.000",
      );
      return {
        ...p,
        ...(await execute(name + ":issue", r, inventory.lot.id, "1.000")),
      };
    }
    await scenario(
      "BAO-CAO-TP",
      "UC-35: đã cấp NVL; chủ xưởng có thể lập báo cáo hoàn tất",
      () => productionIssued("BAO-CAO-TP"),
    );
    await scenario(
      "NHAP-TP-TAY",
      "UC-23: KHSX để nhập thành phẩm từng phần thủ công",
      () => productionIssued("NHAP-TP-TAY"),
    );
    async function finishedReport(name, submitted = true) {
      const p = await productionIssued(name);
      let r = await op(name + ":finished", "workshop", "finished-reports", {
        production_plan_id: p.plan.id,
        production_completed: true,
        completed_date: date,
        note: note(name),
        outputs: [
          {
            item_id: cake,
            lot_code: "DEMO-" + name + "-TP",
            quantity: "10.000",
            manufactured_date: date,
          },
        ],
        materials: [{ item_id: mat, used_quantity: "1.000" }],
      });
      if (submitted)
        r = await op(
          name + ":finished-submit",
          "workshop",
          `finished-reports/${r.id}/submit`,
          { version: r.version },
        );
      return { ...p, finished: r, finishedLot: { id: r.outputs[0].lot_id } };
    }
    await scenario("TP-NHAP", "Báo cáo TP nháp để thử xem/sửa/gửi", () =>
      finishedReport("TP-NHAP", false),
    );
    await scenario("QC-TP", "Lô thành phẩm chờ QC để test riêng", async () => {
      const f = await finishedReport("QC-TP");
      return {
        ...f,
        ...(await inspect(
          "QC-TP",
          f.finishedLot,
          "FINISHED_PRODUCT",
          "PENDING",
        )),
      };
    });
    await scenario(
      "NGOAI-LE",
      "UC-17: đề xuất xử lý thành phẩm lỗi chờ BGĐ duyệt",
      async () => {
        const f = await finishedReport("NGOAI-LE");
        const q = await inspect(
          "NGOAI-LE",
          f.finishedLot,
          "FINISHED_PRODUCT",
          "FAIL",
        );
        const proposal = await op(
          "NGOAI-LE:proposal",
          "manager",
          "exception-proposals",
          {
            qc_inspection_line_id: q.quality.lines[0].id,
            action: "SCRAP",
            quantity: "1.000",
            reason: note("NGOAI-LE") + " Bánh lỗi",
            resolution_note: "Tiêu hủy phần lỗi sau duyệt",
          },
        );
        return { ...f, ...q, proposal };
      },
    );
    async function sale(name, stage) {
      const f = await finishedReport(name);
      const q = await inspect(name, f.finishedLot, "FINISHED_PRODUCT", "PASS");
      const r = await request(
        name + ":receipt",
        "PRODUCTION_RECEIPT",
        { production_report_id: f.finished.id },
        cake,
        "10.000",
      );
      const posted = await execute(
        name + ":receipt",
        r,
        f.finishedLot.id,
        "10.000",
      );
      if (stage === "SOURCE") return { ...f, ...q, receipt: posted };
      let b = await op(name + ":sale", "planner", "business-plans", {
        type: "SALE",
        customer_order_id: f.order.id,
        customer_id: f.order.customer_id,
        finished_report_id: f.finished.id,
        planned_date: date,
        note: note(name),
        lines: [
          { item_id: cake, quantity: "10.000", unit_price: "35000.0000" },
        ],
      });
      if (stage === "PENDING") return { ...f, ...q, sale: b };
      b = await op(
        name + ":sale-approve",
        "director",
        `business-plans/${b.id}/review`,
        { version: b.version, decision: "APPROVE" },
      );
      if (stage === "APPROVED") return { ...f, ...q, sale: b };
      const issue = await request(
        name + ":delivery",
        "SALE_ISSUE",
        { business_plan_id: b.id },
        cake,
        "10.000",
      );
      return {
        ...f,
        ...q,
        sale: b,
        ...(await execute(
          name + ":delivery",
          issue,
          f.finishedLot.id,
          "10.000",
          stage === "POSTED",
        )),
      };
    }
    await scenario(
      "LAP-BAN",
      "UC-04 BAN: TP đạt đã nhập, chưa có kế hoạch bán",
      () => sale("LAP-BAN", "SOURCE"),
    );
    await scenario("DUYET-BAN", "UC-32 BAN: kế hoạch bán chờ duyệt", () =>
      sale("DUYET-BAN", "PENDING"),
    );
    await scenario(
      "YC-XUAT-TP",
      "UC-23 xuất TP: BAN đã duyệt, đủ tồn và đến hạn",
      () => sale("YC-XUAT-TP", "APPROVED"),
    );
    await scenario(
      "XUAT-TP",
      "UC-11.02: phiếu giao đã phân công, chưa xuất",
      () => sale("XUAT-TP", "ASSIGNED"),
    );
    await scenario(
      "DA-GIAO",
      "Đơn đã giao để xem lịch sử/xử lý hàng khách trả",
      () => sale("DA-GIAO", "POSTED"),
    );
    await scenario(
      "CONG-VIEC",
      "UC-25/25.1/25.2: công việc chờ thực hiện để sửa/xóa",
      async () => {
        const task = await op("TASK:create", "director", "tasks", {
          title: "[DEMO CONG-VIEC] Liên hệ NCC kiểm tra lịch giao",
          description: "Công việc mẫu chưa bắt đầu",
          priority: "NORMAL",
          ...slot("generic-task"),
          assignee_ids: [ids.purchaser],
        });
        return { task };
      },
    );
    // Counts get independent real receipts, so freezes do not block other fixtures.
    async function count(name, stage) {
      const warehouse = await op(name + ":warehouse", "manager", "warehouses", {
        code: "DEMO-" + name,
        name: note(name) + " Kho kiểm kê riêng",
        is_active: true,
      });
      const location = await op(
        name + ":location",
        "manager",
        "warehouse-locations",
        {
          code: "DEMO-" + name + "-VT",
          name: "Vị trí kiểm kê riêng",
          warehouse_id: warehouse.id,
          is_active: true,
        },
      );
      const m = await materialLot(name + ":stock", "PASS");
      const receipt = await op(
        name + ":receipt",
        "workshop",
        "stock-requests",
        {
          purpose: "PURCHASE_RECEIPT",
          purchase_order_id: m.purchase.id,
          workshop_id: workshop,
          warehouse_id: warehouse.id,
          manager_id: ids.manager,
          requested_date: date,
          lines: [{ item_id: mat, quantity: "20.000" }],
        },
      );
      await execute(
        name + ":stock",
        receipt,
        m.lot.id,
        "20.000",
        true,
        location.id,
      );
      let c = await op(name + ":count", "director", "stocktakes", {
        campaign_type: "COUNT",
        planned_date: date,
        ...slot(name + ":count"),
        warehouses: [
          {
            warehouse_id: warehouse.id,
            assignee_ids: [ids.stocktaker],
            conclusion_assignee_ids: [ids.qc],
          },
        ],
      });
      if (stage === "PLANNED") return { warehouse, count: c };
      c = await op(
        name + ":count-start",
        "director",
        `stocktakes/${c.id}/start`,
        { version: c.version },
      );
      if (stage === "COUNTING") return { warehouse, count: c };
      const lines = await get(
        "stocktaker",
        `stocktakes/${c.id}/warehouses/${warehouse.id}/lines`,
      );
      const counted = await op(
        name + ":counts",
        "stocktaker",
        `stocktakes/${c.id}/warehouses/${warehouse.id}/counts`,
        {
          lines: lines.lines.map((l) => ({
            id: l.id,
            version: l.version,
            actual_quantity: "19.000",
          })),
        },
        "PATCH",
      );
      await op(
        name + ":count-complete",
        "stocktaker",
        `stocktakes/${c.id}/warehouses/${warehouse.id}/complete`,
        { version: counted.version },
      );
      if (stage === "COMPLETE") return { warehouse, count: c };
      let minutes = await op(name + ":minutes", "qc", "stocktake-minutes", {
        stocktake_id: c.id,
        warehouse_id: warehouse.id,
        remarks: note(name) + " Biên bản mẫu",
      });
      minutes = await op(
        name + ":minutes-submit",
        "qc",
        `stocktake-minutes/${minutes.id}/submit`,
        { version: minutes.version },
      );
      if (stage === "PROPOSAL" || stage === "APPROVED") {
        const differences = await get(
          "manager",
          `stocktake-differences?stocktake_id=${c.id}`,
        );
        let proposal = await op(
          name + ":proposal",
          "manager",
          "exception-proposals",
          {
            stocktake_id: c.id,
            warehouse_id: warehouse.id,
            stocktake_line_id: differences[0].id,
            reason: note(name) + " Thiếu 1 kg",
            resolution_note: "Điều chỉnh sau phê duyệt",
          },
        );
        if (stage === "APPROVED")
          proposal = await op(
            name + ":approve",
            "director",
            `exception-proposals/${proposal.id}/review`,
            { version: proposal.version, decision: "APPROVE" },
          );
        return { warehouse, count: c, minutes, proposal };
      }
      return { warehouse, count: c, minutes };
    }
    await scenario("KK-CHO", "UC-13/15: đợt kiểm kê chưa bắt đầu", () =>
      count("KK-CHO", "PLANNED"),
    );
    await scenario(
      "KK-DEM",
      "UC-15: kho kiểm kê đang mở, độc lập kho giao dịch",
      () => count("KK-DEM", "COUNTING"),
    );
    await scenario(
      "KK-BIEN-BAN",
      "UC-28: kho kiểm kê đã hoàn tất, chưa lập biên bản",
      () => count("KK-BIEN-BAN", "COMPLETE"),
    );
    await scenario("KK-BAO-CAO", "UC-21: biên bản đã gửi để xem báo cáo", () =>
      count("KK-BAO-CAO", "MINUTES"),
    );
    await scenario(
      "KK-CHENH-LECH",
      "UC-16: biên bản đã gửi, thiếu 1 kg chưa có đề xuất",
      () => count("KK-CHENH-LECH", "MINUTES"),
    );
    await scenario("KK-DUYET", "UC-17: đề xuất chênh lệch chờ duyệt", () =>
      count("KK-DUYET", "PROPOSAL"),
    );
    await scenario(
      "KK-AP-DUNG",
      "UC-16: đề xuất đã duyệt chưa áp dụng tồn",
      () => count("KK-AP-DUNG", "APPROVED"),
    );
    console.log(
      `DEMO WORKFLOWS READY: ${Object.keys(state.scenarios).length} independent fixtures; existing demo edits retained.`,
    );
  } finally {
    if (locked)
      await connection.execute("SELECT RELEASE_LOCK(?)", [
        "warehouse:demo-workflows:" + source,
      ]);
    await connection.end();
  }
}
const serve = process.argv.includes("--serve");
if (serve) fs.rmSync("/tmp/warehouse-demo-ready", { force: true });
main()
  .then(() => {
    if (serve) {
      fs.writeFileSync("/tmp/warehouse-demo-ready", "ready");
      setInterval(() => {}, 3600000);
    }
  })
  .catch((e) => {
    console.error("DEMO WORKFLOWS FAILED: " + e.message);
    process.exitCode = 1;
  });
