const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
if (!(process.env.ACCEPTANCE_MONOLITH === "true" && process.env.DB_NAME === "warehouse_db"))
  throw Error("Use an isolated split acceptance database.");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database"),
  C = require("../src/services/domain/core");
function client() {
  let cookie = "",
    csrf = "";
  return {
    async call(path, method = "GET", body, key) {
      const r = await fetch("http://127.0.0.1:3000/api/v1/" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
          "X-CSRF-Token": csrf,
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (r.headers.get("set-cookie"))
        cookie = r.headers.get("set-cookie").split(";")[0];
      return { status: r.status, ...(await r.json()) };
    },
    async login(username) {
      csrf = (await this.call("auth/csrf")).data.csrf_token;
      const r = await this.call("auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(r.status, 200, JSON.stringify(r));
      csrf = r.data.csrf_token;
    },
  };
}
const ok = (r, s = 200) => {
  assert.equal(r.status, s, JSON.stringify(r));
  return r.data;
};
(async () => {
  const pool = getPool(),
    customer = client(),
    planner = client(),
    director = client(),
    workshop = client(),
    manager = client(),
    staff = client(),
    qc = client();
  try {
    for (const [c, name] of [
      [customer, "customer"],
      [planner, "planner"],
      [director, "director"],
      [workshop, "workshop"],
      [manager, "manager"],
      [staff, "staff"],
      [qc, "qc"],
    ])
      await c.login(name);
    const [[w]] = await pool.query(
      "SELECT workshop_id FROM workshop_users wu JOIN users u ON u.id=wu.user_id WHERE u.username='workshop' LIMIT 1",
    );
    const [[warehouse]] = await pool.query(
      "SELECT id FROM warehouses WHERE is_active=1 LIMIT 1",
    );
    const [[location]] = await pool.execute(
      "SELECT id FROM warehouse_locations WHERE warehouse_id=? AND is_active=1 LIMIT 1",
      [warehouse.id],
    );
    const [users] = await pool.query(
      "SELECT id,username FROM users WHERE username IN ('manager','staff','qc')",
    );
    const ids = Object.fromEntries(
      users.map((u) => [u.username, String(u.id)]),
    );
    const sample = ok(await customer.call("sample-items"))[0],
      future = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      today = C.today();
    const order = ok(
      await customer.call("customer-orders", "POST", {
        delivery_address: "Isolated partial production receipt",
        latest_delivery_date: future,
        lines: [{ item_id: sample.id, quantity: "2.000" }],
      }),
      201,
    );
    ok(
      await planner.call("customer-orders/" + order.id + "/receive", "POST", {
        version: order.version,
      }),
    );
    const plan = ok(
      await planner.call("production-plans", "POST", {
        customer_order_id: order.id,
        workshop_id: String(w.workshop_id),
        start_date: today,
        end_date: future,
        outputs: [{ item_id: sample.id, quantity: "2.000" }],
        materials: [],
      }),
      201,
    );
    const live = ok(await director.call("customer-orders/" + order.id));
    ok(
      await director.call(
        "production-plans/" + plan.id + "/review",
        "POST",
        { version: plan.version, decision: "APPROVE" },
        crypto.randomUUID(),
      ),
    );
    const receipt = (quantity) => ({
      purpose: "PRODUCTION_RECEIPT",
      production_source_mode: "MANUAL",
      production_plan_id: plan.id,
      workshop_id: String(w.workshop_id),
      warehouse_id: String(warehouse.id),
      manager_id: ids.manager,
      requested_date: today,
      receipt_key: crypto.randomUUID(),
      lines: [
        {
          item_id: sample.id,
          quantity,
          manufactured_date: today,
          expiry_date: future,
        },
      ],
    });
    const firstBody = receipt("0.750");
    const [a, b] = await Promise.all([
      workshop.call("stock-requests", "POST", firstBody),
      workshop.call("stock-requests", "POST", firstBody),
    ]);
    const first = ok(a, 201);
    assert.equal(ok(b, 201).id, first.id);
    const conflict = await workshop.call("stock-requests", "POST", {
      ...firstBody,
      note: "different",
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.error.code, "IDEMPOTENCY_CONFLICT");
    const second = ok(
      await workshop.call("stock-requests", "POST", receipt("1.250")),
      201,
    );
    assert.equal(first.lots[0].lot_header_id, second.lots[0].lot_header_id);
    assert.notEqual(first.lots[0].id, second.lots[0].id);
    const third = ok(
      await workshop.call("stock-requests", "POST", receipt("0.100")),
      201,
    );
    assert.equal(third.lots[0].lot_header_id, first.lots[0].lot_header_id);
    const sourceOptions=ok(await director.call('quality-campaign-sources'));
    const parts=sourceOptions.lots.filter(l=>[first.lots[0].id,second.lots[0].id,third.lots[0].id].includes(l.id));
    assert.equal(parts.length,3);assert.equal(new Set(parts.map(l=>l.lot_header_code)).size,1);
    assert.equal(new Set(parts.map(l=>l.name)).size,3);
    assert.ok(parts.every(l=>l.expected_date===today));
    const [[before]] = await pool.execute(
      "SELECT COUNT(*) n FROM inventory_balances WHERE lot_id IN (?,?)",
      [first.lots[0].id, second.lots[0].id],
    );
    assert.equal(Number(before.n), 0);
    const [[schedule]] = await pool.query(
      "SELECT MAX(end_at) last FROM tasks WHERE status IN ('PLANNED','IN_PROGRESS')",
    );
    const start =
      Math.max(
        Date.now(),
        schedule.last ? new Date(schedule.last).getTime() : 0,
      ) + 3600000;
    const dispatch = (request, lot, at) =>
      manager.call(
        "stock-requests/" + request.id + "/dispatch",
        "POST",
        {
          version: request.version,
          start_at: new Date(at).toISOString(),
          end_at: new Date(at + 1800000).toISOString(),
          allocations: [
            {
              assignee_id: ids.staff,
              stock_request_line_id: request.lines[0].id,
              lot_id: lot,
              location_id: String(location.id),
              quality_bucket: "AVAILABLE",
              quantity: request.lines[0].remaining_quantity,
            },
          ],
        },
        crypto.randomUUID(),
      );
    assert.notEqual(
      (await dispatch(first, first.lots[0].id, start)).status,
      200,
    );
    const camp = ok(
      await director.call("quality-campaigns", "POST", {
        campaign_type: "QUALITY_CHECK",
        quality_kind: "FINISHED_PRODUCT",
        planned_date: today,
        start_at: new Date(start).toISOString(),
        end_at: new Date(start + 1800000).toISOString(),
        location: "Partial receipt fixture",
        assignee_ids: [ids.qc],
        lot_ids: [first.lots[0].id, second.lots[0].id, third.lots[0].id],
      }),
      201,
    );
    ok(
      await director.call("quality-campaigns/" + camp.id + "/start", "POST", {
        version: camp.version,
      }),
    );
    ok(
      await qc.call("qc-inspections", "POST", {
        campaign_id: camp.id,
        inspected_at: new Date().toISOString(),
        lines: [
          {
            lot_id: first.lots[0].id,
            inspected_quantity: "0.750",
            passed_quantity: "0.750",
            failed_quantity: "0.000",
          },
          {
            lot_id: second.lots[0].id,
            inspected_quantity: "1.250",
            passed_quantity: "1.000",
            failed_quantity: "0.250",
            issue: "Packaging fault",
          },
          {
            lot_id: third.lots[0].id,
            inspected_quantity: "0.100",
            passed_quantity: "0.000",
            failed_quantity: "0.100",
            issue: "All damaged",
          },
        ],
      }),
      201,
    );
    Object.assign(first, ok(await workshop.call("stock-requests/" + first.id)));
    Object.assign(
      second,
      ok(await workshop.call("stock-requests/" + second.id)),
    );
    const allocationPreview=ok(await manager.call('stock-requests/'+first.id+'/allocations'));
    assert.deepEqual(allocationPreview.eligible_lots.map(l=>l.id),[first.lots[0].id]);
    const failed = ok(await workshop.call("stock-requests/" + third.id));
    assert.equal(failed.status, "FULFILLED");
    assert.equal(failed.lines[0].remaining_quantity, "0.000");
    assert.equal(
      (await dispatch(first, second.lots[0].id, start + 3600000)).status,
      422,
    );
    for (const [i, request] of [first, second].entries()) {
      const d = ok(
        await dispatch(request, request.lots[0].id, start + (i + 1) * 3600000),
      );
      const postBody = {
          stock_request_id: request.id,
          request_version: d.version,
          task_id: d.tasks[0].id,
          allocations: [
            {
              stock_request_line_id: request.lines[0].id,
              lot_id: request.lots[0].id,
              location_id: String(location.id),
              quality_bucket: "AVAILABLE",
              quantity: request.lines[0].remaining_quantity,
            },
          ],
        },
        key = crypto.randomUUID();
      const posted = ok(
        await staff.call('tasks/'+d.tasks[0].id+'/postTask', "POST", postBody, key),
        201,
      );
      assert.equal(
        ok(await staff.call("stock-documents", "POST", postBody, key), 201).id,
        posted.id,
      );
    }
    assert.equal(
      ok(await workshop.call("stock-requests/" + second.id)).status,
      "FULFILLED",
    );
    const [[failedLine]]=await pool.execute('SELECT id FROM qc_inspection_lines WHERE lot_id=?',[second.lots[0].id]);
    let exception=ok(await manager.call('exception-proposals','POST',{
      qc_inspection_line_id:String(failedLine.id),action:'SCRAP',quantity:'0.100',
      reason:'Partial production packaging failure',resolution_note:'Discard the unreceived failed portion',
    }),201);
    exception=ok(await director.call('exception-proposals/'+exception.id+'/review','POST',{version:exception.version,decision:'APPROVE'}));
    ok(await manager.call('exception-proposals/'+exception.id+'/apply','POST',{version:exception.version}));
    const remainingLookup=ok(await manager.call('lookup/qc-failed-lines'));
    assert.equal(remainingLookup.find(r=>r.id===String(failedLine.id)).failed_quantity,'0.150');
    const remainingBody={qc_inspection_line_id:String(failedLine.id),action:'SCRAP',quantity:'0.151',reason:'Dispose remaining failure',resolution_note:'Second disposal'};
    assert.equal((await manager.call('exception-proposals','POST',remainingBody)).status,409);
    exception=ok(await manager.call('exception-proposals','POST',{...remainingBody,quantity:'0.150'}),201);
    exception=ok(await director.call('exception-proposals/'+exception.id+'/review','POST',{version:exception.version,decision:'APPROVE'}));
    ok(await manager.call('exception-proposals/'+exception.id+'/apply','POST',{version:exception.version}));
    const [[passedBalance]]=await pool.execute("SELECT quantity FROM inventory_balances WHERE lot_id=? AND quality_bucket='AVAILABLE'",[second.lots[0].id]);
    assert.equal(passedBalance.quantity,'1.000');
    const imported = ok(
      await workshop.call(
        "source-imports/finished-reports?source_id=" + plan.id,
      ),
    );
    assert.equal(imported.outputs.length, 3);
    const reportBody = {
      production_plan_id: plan.id,
      production_completed: true,
      completed_date: today,
      outputs: imported.outputs,
      materials: [],
    };
    ok(
      await workshop.call("finished-reports", "POST", {
        ...reportBody,
        outputs: [reportBody.outputs[0]],
      }),
      409,
    );
    const final = ok(
      await workshop.call("finished-reports", "POST", reportBody),
      201,
    );
    assert.deepEqual(
      final.outputs.map((o) => o.lot_id).sort(),
      [first.lots[0].id, second.lots[0].id, third.lots[0].id].sort(),
    );
    const [[count]] = await pool.execute(
      "SELECT COUNT(*) n FROM lots WHERE production_plan_id=?",
      [plan.id],
    );
    assert.equal(Number(count.n), 3);
    const changed = { ...reportBody.outputs[0], quantity: "0.700" };
    ok(
      await workshop.call("finished-reports/" + final.id, "PATCH", {
        version: final.version,
        outputs: [changed, ...reportBody.outputs.slice(1)],
      }),
      409,
    );
    const updated = ok(
      await workshop.call("finished-reports/" + final.id, "PATCH", {
        version: final.version,
        materials: [],
      }),
      200,
    );
    ok(
      await workshop.call("finished-reports/" + final.id + "/submit", "POST", {
        version: updated.version,
      }),
    );
    ok(await workshop.call("stock-requests", "POST", receipt("0.100")), 409);
    const reportReceipt = {
      purpose: "PRODUCTION_RECEIPT",
      production_report_id: final.id,
      workshop_id: String(w.workshop_id),
      warehouse_id: String(warehouse.id),
      manager_id: ids.manager,
      requested_date: today,
      lines: [{ item_id: sample.id, quantity: "0.100" }],
    };
    const double = await workshop.call("stock-requests", "POST", reportReceipt);
    assert.equal(double.status, 422, JSON.stringify(double));
    assert.equal(double.error.code, "SOURCE_LIMIT_EXCEEDED");
    const [[stock]] = await pool.execute(
      "SELECT SUM(quantity) quantity FROM inventory_balances WHERE lot_id IN (?,?)",
      [first.lots[0].id, second.lots[0].id],
    );
    assert.equal(stock.quantity, "1.750");
    const [[sourceQC]]=await pool.execute('SELECT id,qc_inspection_id FROM qc_inspection_lines WHERE lot_id=?',[first.lots[0].id]);
    const body=(action,quantity)=>({quarantine:true,qc_inspection_line_id:String(sourceQC.id),action,quantity,
      reason:'Post-receipt packaging defect',resolution_note:'Correct quality through approved compensation',
      allocations:[{location_id:String(location.id),quantity}]});
    let correction=ok(await manager.call('exception-proposals','POST',body('QUARANTINE','0.100')),201);
    correction=ok(await director.call('exception-proposals/'+correction.id+'/review','POST',{version:correction.version,decision:'APPROVE'}));
    const noCheck=await manager.call('exception-proposals/'+correction.id+'/apply','POST',{version:correction.version});
    assert.equal(noCheck.status,409);assert.equal(noCheck.error.code,'REINSPECTION_REQUIRED');
    correction=ok(await qc.call('exception-proposals/'+correction.id+'/reinspect','POST',{version:correction.version,result:'FAILED',note:'Defect confirmed'}));
    ok(await manager.call('exception-proposals/'+correction.id+'/apply','POST',{version:correction.version}));
    let release=ok(await manager.call('exception-proposals','POST',body('RELEASE','0.040')),201);
    release=ok(await director.call('exception-proposals/'+release.id+'/review','POST',{version:release.version,decision:'APPROVE'}));
    release=ok(await qc.call('exception-proposals/'+release.id+'/reinspect','POST',{version:release.version,result:'PASSED',note:'Rechecked accepted portion'}));
    ok(await manager.call('exception-proposals/'+release.id+'/apply','POST',{version:release.version}));
    let scrap=ok(await manager.call('exception-proposals','POST',body('SCRAP','0.060')),201);
    scrap=ok(await director.call('exception-proposals/'+scrap.id+'/review','POST',{version:scrap.version,decision:'APPROVE'}));
    ok(await manager.call('exception-proposals/'+scrap.id+'/apply','POST',{version:scrap.version}));
    const [correctedBalances]=await pool.execute('SELECT quality_bucket,quantity FROM inventory_balances WHERE lot_id=?',[first.lots[0].id]);
    assert.equal(correctedBalances.find(r=>r.quality_bucket==='AVAILABLE').quantity,'0.690');
    assert.equal(correctedBalances.find(r=>r.quality_bucket==='QUARANTINE').quantity,'0.000');
    const [[correctedQC]]=await pool.execute('SELECT passed_quantity,failed_quantity FROM qc_inspection_lines WHERE id=?',[sourceQC.id]);
    assert.equal(correctedQC.passed_quantity,'0.690');assert.equal(correctedQC.failed_quantity,'0.060');
    const [[compensation]]=await pool.execute('SELECT COUNT(*) n FROM qc_compensations WHERE original_qc_id=?',[sourceQC.qc_inspection_id]);
    assert.equal(Number(compensation.n),2);
    const [[originalReceipt]]=await pool.execute("SELECT SUM(dl.quantity) quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE dl.lot_id=? AND d.type='IN'",[first.lots[0].id]);
    assert.equal(originalReceipt.quantity,'0.750');
    assert.equal(ok(await workshop.call('stock-requests/'+first.id)).status,'FULFILLED');
    console.log('POSTED QC CORRECTION PASS: director approval, mandatory QC verification, quarantine/release/scrap, immutable receipt and compensation history');
    console.log(
      "PARTIAL RECEIPT PASS: shared header, separate QC, replay, exact stock, immutable lot reuse in final report and no duplicate report receipt.",
    );
  } finally {
    await closePool();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
