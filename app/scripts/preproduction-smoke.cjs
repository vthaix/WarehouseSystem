const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const pool = getPool(),
  base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "",
    csrf = "";
  return {
    async call(p, method = "GET", body) {
      const r = await fetch(base + "/api/v1/" + p, {
        method,
        headers: {
          Cookie: cookie,
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const cookies = r.headers.getSetCookie();
      if (cookies.length)
        cookie = cookies.map((c) => c.split(";")[0]).join("; ");
      const data = await r.json();
      return { status: r.status, ...data };
    },
    async login(username) {
      csrf = (await this.call("auth/csrf")).data.csrf_token;
      const r = await this.call("auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(r.status, 200);
      csrf = r.data.csrf_token;
    },
    async image(p) {
      return fetch(base + p, { headers: { Cookie: cookie } });
    },
  };
}
function ok(r, status = 200) {
  assert.equal(r.status, status, JSON.stringify(r));
  return r.data;
}
(async () => {
  assert.equal(process.env.ACCEPTANCE_MONOLITH, "true"); assert.equal(process.env.DB_NAME, "warehouse_db");
  const customer = client(),
    planner = client(),
    director = client(),
    workshop = client(),
    staff = client();
  for (const [c, u] of [
    [customer, "customer"],
    [planner, "planner"],
    [director, "director"],
    [workshop, "workshop"],
    [staff, "staff"],
  ])
    await c.login(u);
  const [items] = await pool.query(
    "SELECT id,code FROM items WHERE code IN ('TP-001','TP-002','NVL-001')",
  );
  const byCode = Object.fromEntries(items.map((i) => [i.code, String(i.id)]));
  const [[w]] = await pool.query(
    "SELECT wu.workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id WHERE u.username='workshop' LIMIT 1",
  );
  const date = require("../src/services/domain/core").today();
  const outputs = [
    { item_id: byCode["TP-001"], quantity: "100.000" },
    { item_id: byCode["TP-002"], quantity: "50.000" },
  ];
  let order = ok(
    await customer.call("customer-orders", "POST", {
      delivery_address: "PREPRODUCTION multi-product fixture",
      latest_delivery_date: date,
      note: "Hai loại bánh cùng đơn",
      lines: outputs,
    }),
    201,
  );
  assert.equal(order.lines.length, 2);
  order = ok(
    await planner.call(`customer-orders/${order.id}/receive`, "POST", {
      version: order.version,
    }),
  );
  const estimate = ok(
    await planner.call("production-plans/recipe-estimate", "POST", { outputs }),
  );
  const shiftDay = days => new Date(Date.parse(date + 'T00:00:00Z') + days*86400000).toISOString().slice(0,10);
  for (const dates of [{start_date:shiftDay(-1),end_date:date},{start_date:date,end_date:shiftDay(1)}]) {
    const invalid = await planner.call('production-plans','POST',{customer_order_id:order.id,workshop_id:String(w.workshop_id),...dates,outputs,materials:[]});
    assert.equal(invalid.status,422,JSON.stringify(invalid));
  }
  assert.equal(
    estimate.materials.find((l) => l.item_id === byCode["NVL-001"])
      .required_quantity,
    "16.000",
  );
  const plan = ok(
    await planner.call("production-plans", "POST", {
      customer_order_id: order.id,
      workshop_id: String(w.workshop_id),
      start_date: date,
      end_date: date,
      material_source: "RECIPE",
      outputs,
    }),
    201,
  );
  assert.equal(plan.order_lines.length, 2);
  assert.equal((await planner.call('production-plans/'+plan.id,'PATCH',{version:plan.version,end_date:shiftDay(1)})).status,422);
  assert.equal(plan.delivery_address, "PREPRODUCTION multi-product fixture");
  assert.equal(
    plan.materials.find((l) => l.item_id === byCode["NVL-001"])
      .required_quantity,
    "17.600",
  );
  assert.equal(
    (await workshop.call("production-plans/" + plan.id)).status,
    404,
  );
  ok(
    await director.call(`production-plans/${plan.id}/review`, "POST", {
      version: plan.version,
      decision: "APPROVE",
    }),
  );
  const [[notice]] = await pool.execute(
    "SELECT COUNT(*) n FROM notifications WHERE business_key=?",
    ["plan-" + plan.id + "-approved"],
  );
  assert.ok(Number(notice.n) > 0);
  const comparison = ok(
    await workshop.call(`production-plans/${plan.id}/material-comparison`),
  );
  assert.equal(comparison.outputs.length, 2);
  assert.equal(comparison.lines.length, plan.materials.length);
  for (const l of comparison.lines) {
    const C = require("../src/services/domain/core");
    assert.equal(
      l.shortage_quantity,
      C.decimal(
        C.qty(l.required_quantity) > C.qty(l.available_quantity, false)
          ? C.qty(l.required_quantity) - C.qty(l.available_quantity, false)
          : 0n,
      ),
    );
  }
  assert.equal(
    (await staff.call(`production-plans/${plan.id}/material-comparison`))
      .status,
    403,
  );
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1sAAAAASUVORK5CYII=";
  assert.equal(
    (
      await staff.call("production-report-images", "POST", {
        data_url: "data:image/png;base64," + png,
      })
    ).status,
    403,
  );
  const image = ok(
    await workshop.call("production-report-images", "POST", {
      data_url: "data:image/png;base64," + png,
    }),
    201,
  );
  const report = ok(
    await workshop.call("production-reports", "POST", {
      production_plan_id: plan.id,
      report_purpose: "NHU_CAU",
      progress_percentage: "0",
      send_to_planner: false,
      note: "Thiếu NVL\n![Ảnh báo cáo](" + image.image_path + ")",
      lines: comparison.lines.map((l) => ({
        item_id: l.item_id,
        required_quantity: "999.000",
      })),
    }),
    201,
  );
  const imagePath = `/api/v1/production-reports/${report.id}/images/${image.image_path.split("/").at(-1)}`;
  assert.equal((await planner.image(imagePath)).status, 404);
  assert.equal((await director.image(imagePath)).status, 200);
  const sent = ok(
    await workshop.call(`production-reports/${report.id}/submit`, "POST", {
      version: report.version,
    }),
  );
  assert.equal(sent.send_to_planner, true);
  assert.equal((await planner.image(imagePath)).status, 200);
  assert.equal((await staff.image(imagePath)).status, 403);
  const [[supplier]] = await pool.query(
    "SELECT id FROM suppliers WHERE is_active=1 ORDER BY id LIMIT 1",
  );
  const manualBuy = ok(await planner.call('business-plans', 'POST', {
    type: 'PURCHASE', planned_date: date, note: 'Manual purchasing plan',
    lines: [{ item_id: comparison.lines[0].item_id, quantity: '1.000', unit_price: '1000.0000' }],
  }), 201);
  assert.equal(manualBuy.production_report_id, null);
  assert.equal(manualBuy.production_plan_id, null);
  assert.equal(manualBuy.supplier_id, null);
  const buy = ok(
    await planner.call("business-plans", "POST", {
      type: "PURCHASE",
      production_report_id: report.id,
      supplier_id: String(supplier.id),
      planned_date: date,
      lines: [
        {
          item_id: comparison.lines[0].item_id,
          quantity: "1.000",
          unit_price: "1000.0000",
        },
        {item_id:comparison.lines[1].item_id,quantity:'1.000',unit_price:'2000.0000'},
      ],
    }),
    201,
  );
  assert.equal(buy.supplier_id,null,'Planner does not select the supplier');
  assert.equal((await planner.call('business-plans/'+buy.id,'PATCH',{version:buy.version,planned_date:shiftDay(1)})).status,422);
  ok(
    await director.call(`business-plans/${buy.id}/review`, "POST", {
      version: buy.version,
      decision: "APPROVE",
    }),
  );
  const [[purchaseNotice]] = await pool.execute(
    "SELECT COUNT(*) n FROM notifications WHERE business_key=?",
    ["buy-plan-" + buy.id + "-approved"],
  );
  assert.ok(Number(purchaseNotice.n) > 0);
  const purchaser=client(), manager=client();
  await purchaser.login('purchaser'); await manager.login('manager');
  const [suppliers]=await pool.query('SELECT id FROM suppliers WHERE is_active=1 ORDER BY id LIMIT 2');
  assert.equal(suppliers.length,2);
  const materialCatalogue=ok(await manager.call('material-prices?per_page=100'));
  const assignedSuppliers=new Set();
  const purchaseBody={source_mode:'PLAN',business_plan_id:buy.id,delivery_terms:'NCC theo tung NVL',
    lines:buy.lines.map(line=>{
      const material=materialCatalogue.find(m=>String(m.id)===String(line.item_id));
      const offers=[...material.supplier_prices].reverse();
      const offer=offers.find(o=>!assignedSuppliers.has(String(o.supplier_id)))||offers[0];
      assert.ok(offer,'Fixture material must have a configured supplier');
      assignedSuppliers.add(String(offer.supplier_id));
      return {business_plan_line_id:line.id,unit_price:'1000.0000',supplier_id:String(offer.supplier_id)};
    })};
  assert.equal((await purchaser.call('purchase-orders','POST',{...purchaseBody,expected_delivery_date:shiftDay(1)})).status,422);
  assert.equal((await purchaser.call('purchase-orders','POST',{source_mode:'REPORT',production_report_id:report.id})).status,409);
  assert.equal((await purchaser.call('purchase-orders','POST',{...purchaseBody,lines:purchaseBody.lines.map((l,i)=>i?{...l,supplier_id:'999999999999'}:l)})).status,422);
  assert.equal((await purchaser.call('purchase-orders','POST',{source_mode:'MANUAL',expected_delivery_date:shiftDay(-1),delivery_terms:'Past date rejected',lines:[{item_id:comparison.lines[0].item_id,quantity:'1',unit_price:'1',supplier_id:String(suppliers[0].id)}]})).status,409);
  const bought=ok(await purchaser.call('purchase-orders','POST',purchaseBody),201);
  assert.equal(bought.supplier_id,null);
  assert.equal(bought.expected_delivery_date,date);
  assert.equal(new Set(bought.lines.map(l=>l.supplier_id)).size,2);
  assert.ok(bought.lines.every(l=>l.supplier_name));
  const mixed=await manager.call('lots','POST',{code:'MIXED-'+crypto.randomBytes(5).toString('hex'),lines:bought.lines.map(l=>({purchase_order_line_id:l.id,received_quantity:'1.000'}))});
  assert.equal(mixed.status,422,'A received lot cannot mix suppliers');
  const [[inspector]]=await pool.execute("SELECT id FROM users WHERE username='qc'");
  const plannedQcBody={campaign_type:'QUALITY_CHECK',quality_kind:'MATERIAL',source_mode:'PURCHASE_PLAN',source_plan_id:buy.id,planned_date:date,start_at:date+'T08:00:00+07:00',end_at:date+'T09:00:00+07:00',location:'QC dự kiến từ kế hoạch mua',assignee_ids:[String(inspector.id)],lot_ids:[]};
  const plannedQc=ok(await director.call('quality-campaigns','POST',plannedQcBody),201);
  assert.equal(plannedQc.source_plan_id,buy.id);assert.deepEqual(plannedQc.lot_ids,[]);
  assert.equal((await director.call('quality-campaigns/'+plannedQc.id+'/start','POST',{version:plannedQc.version})).status,409);
  assert.equal((await director.call('quality-campaigns','POST',{...plannedQcBody,start_at:shiftDay(-1)+'T08:00:00+07:00'})).status,422);
  const futureBuy=ok(await planner.call('business-plans','POST',{type:'PURCHASE',planned_date:shiftDay(2),lines:[{item_id:comparison.lines[0].item_id,quantity:'1.000',unit_price:'1.0000'}]}),201);
  ok(await director.call('business-plans/'+futureBuy.id+'/review','POST',{version:futureBuy.version,decision:'APPROVE'}));
  const tooEarly=await director.call('quality-campaigns','POST',{...plannedQcBody,source_plan_id:futureBuy.id,start_at:date+'T08:00:00+07:00'});
  assert.equal(tooEarly.status,422,'QC may not start before the purchase plan receipt date');
  assert.equal((await director.call('quality-campaigns/'+plannedQc.id+'/bind-lots','POST',{version:plannedQc.version,lot_ids:['999999999']})).status,422);
  const receivedLots=[];
  for (const l of bought.lines) {
    const shipment=ok(await manager.call('lots','POST',{code:'NCC-'+crypto.randomBytes(5).toString('hex'),lines:[{purchase_order_line_id:l.id,received_quantity:'1.000'}]}),201);
    receivedLots.push(shipment.lines[0].id);
  }
  const available=ok(await director.call('quality-campaigns/'+plannedQc.id));
  assert.ok(receivedLots.every(id=>available.eligible_lots.some(l=>l.id===id)));
  const bound=ok(await director.call('quality-campaigns/'+plannedQc.id+'/bind-lots','POST',{version:available.version,lot_ids:receivedLots}));
  assert.deepEqual(new Set(bound.lot_ids),new Set(receivedLots));
  assert.equal((await director.call('quality-campaigns/'+plannedQc.id+'/bind-lots','POST',{version:available.version,lot_ids:receivedLots})).status,409);
  const productionSources=ok(await director.call('quality-campaign-sources'));
  const expectedFinished=productionSources.plans.find(p=>p.source_mode==='PRODUCTION_PLAN'&&p.id===plan.id);
  assert.ok(expectedFinished);
  const futureFinished=ok(await director.call('quality-campaigns','POST',{...plannedQcBody,quality_kind:'FINISHED_PRODUCT',source_mode:'PRODUCTION_PLAN',source_plan_id:plan.id,planned_date:expectedFinished.expected_date,start_at:expectedFinished.expected_date+'T08:00:00+07:00',end_at:expectedFinished.expected_date+'T09:00:00+07:00'}),201);
  assert.equal(futureFinished.expected_date,expectedFinished.expected_date);
  assert.equal(
    (
      await workshop.call("production-report-images", "POST", {
        data_url: "data:image/svg+xml;base64,PHN2Zz4=",
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await workshop.call("production-reports", "POST", {
        production_plan_id: plan.id,
        report_purpose: "TIEN_DO",
        note: "![Ảnh](/images/production-reports/00000000-0000-4000-8000-000000000000.png)",
        send_to_planner: false,
      })
    ).status,
    422,
  );
  const incident = ok(
    await workshop.call("production-reports", "POST", {
      production_plan_id: plan.id,
      report_purpose: "SU_CO",
      progress_percentage: "35",
      note: "Máy đóng gói hỏng",
      send_to_planner: false,
    }),
    201,
  );
  ok(
    await workshop.call(`production-reports/${incident.id}/submit`, "POST", {
      version: incident.version,
    }),
  );
  assert.equal(
    (await planner.call("production-reports/" + incident.id)).status,
    404,
  );
  console.log(
    "PREPRODUCTION SQL PASS: multi-item order, recipe multiplication/reserve once, full source details, approval notification, stock comparison, image upload/access, automatic shortage sharing and private incidents.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closePool);
