const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
require("../src/config/env").loadEnv();
const { getPool, closePool } = require("../src/config/database");
const base = "http://127.0.0.1:" + (process.env.PORT || 3000);
function client() {
  let cookie = "",
    csrf = "";
  const call = async (path, method = "GET", body) => {
    const response = await fetch(base + "/api/v1/" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        "X-CSRF-Token": csrf,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (response.headers.get("set-cookie"))
      cookie = response.headers.get("set-cookie").split(";")[0];
    return { status: response.status, ...(await response.json()) };
  };
  return {
    call,
    async login(username) {
      csrf = (await call("auth/csrf")).data.csrf_token;
      const r = await call("auth/login", "POST", {
        username,
        password: process.env.DEMO_PASSWORD,
      });
      assert.equal(r.status, 200);
      csrf = r.data.csrf_token;
    },
  };
}
(async () => {
  if (!/^KhoHang_Acceptance_\d{8}(?:_Gateway)?$/.test(process.env.DB_NAME || ""))
    throw Error("Use isolated acceptance DB for count fixture.");
  const pool = getPool(),
    director = client(),
    manager = client(),
    counter = client(),
    staff = client(), qc = client();
  await director.login("director");
  await manager.login("manager");
  await counter.login("stocktaker");
  await staff.login("staff");
  await qc.login("qc");
  const [[inspector]]=await pool.execute("SELECT id FROM users WHERE username='qc'");
  const [[item]] = await pool.execute(
    "SELECT id FROM items WHERE kind='FINISHED_PRODUCT' AND is_active=1 LIMIT 1",
  );
  const [[loc]] = await pool.execute(
    "SELECT id,warehouse_id FROM warehouse_locations WHERE is_active=1 LIMIT 1",
  );
  const [[person]] = await pool.execute(
    "SELECT id FROM users WHERE username='stocktaker'",
  );
  const code = "TEST-COUNT-" + crypto.randomBytes(6).toString("hex");
  let lot, header, count, proposal, minute,order,plan;
  try {
    const [[customer]]=await pool.execute('SELECT id FROM customers LIMIT 1');
    const [[workshop]]=await pool.execute('SELECT id FROM workshops LIMIT 1');
    const [o]=await pool.execute("INSERT INTO customer_orders(code,customer_id,delivery_address,latest_delivery_date,status,quoted_total,version) VALUES (?,?,'fixture',CURRENT_DATE,'APPROVED',0,1)",[code,customer.id]);order=o.insertId;
    const [p]=await pool.execute("INSERT INTO production_plans(code,customer_order_id,workshop_id,created_by,start_date,end_date,status,version) VALUES (?,?,?,?,CURRENT_DATE,CURRENT_DATE,'IN_PROGRESS',1)",[code,order,workshop.id,person.id]);plan=p.insertId;
    const [created] = await pool.execute(
      "INSERT INTO lots(code,item_id,production_plan_id,received_quantity,qc_status,version) VALUES (?,?,?,2,'PASSED',1)",
      [code, item.id,plan],
    );
    lot = created.insertId;
    const [[row]] = await pool.execute(
      "SELECT lot_header_id FROM lots WHERE id=?",
      [lot],
    );
    header = row.lot_header_id;
    await pool.execute(
      "INSERT INTO inventory_balances(lot_id,location_id,quality_bucket,quantity,version) VALUES (?,?,'AVAILABLE',2,1)",
      [lot, loc.id],
    );
    let r = await director.call("stocktakes", "POST", {
      campaign_type: "COUNT",
      planned_date: require('../src/services/domain/core').today(),
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 3600000).toISOString(),
      warehouses: [
        {
          warehouse_id: String(loc.warehouse_id),
          assignee_ids: [String(person.id), String(inspector.id)],
          conclusion_assignee_ids: [String(inspector.id)],
        },
      ],
    });
    assert.equal(r.status, 201, JSON.stringify(r));
    count = r.data.id;
    assert.equal((await staff.call("stocktakes/" + count)).status, 403);
    r = await director.call("stocktakes/" + count + "/start", "POST", {
      version: r.data.version,
    });
    assert.equal(r.status, 200, JSON.stringify(r));
    const path = "stocktakes/" + count + "/warehouses/" + loc.warehouse_id;
    assert.equal((await qc.call('stocktakes/'+count)).status,200);
    assert.equal((await qc.call(path+'/lines')).status,200);
    assert.equal((await qc.call('stocktake-minutes','POST',{stocktake_id:count,warehouse_id:String(loc.warehouse_id),remarks:'Before completion'})).status,409);
    let w = (await counter.call(path + "/lines")).data;
    assert.equal(
      (await counter.call(path + "/complete", "POST", { version: w.version }))
        .status,
      409,
    );
    r = await qc.call(path + "/counts", "PATCH", {
      lines: w.lines.map((l) => ({
        id: l.id,
        version: l.version,
        actual_quantity:
          String(l.lot_id) === String(lot) ? "0.000" : l.system_quantity,
      })),
    });
    assert.equal(r.status, 200, JSON.stringify(r));
    w = r.data;
    r = await counter.call(path + "/complete", "POST", { version: w.version });
    assert.equal(r.status, 200, JSON.stringify(r));
    r = await qc.call("stocktake-minutes", "POST", {
      stocktake_id: count,
      warehouse_id: String(loc.warehouse_id),
      remarks: "Isolated fixture conclusion",
    });
    assert.equal(r.status, 201, JSON.stringify(r));
    minute = r.data.id;
    assert.equal(
      (
        await qc.call("stocktake-minutes/" + minute + "/submit", "POST", {
          version: r.data.version,
        })
      ).status,
      200,
    );
    const diff = (
      await manager.call("stocktake-differences?stocktake_id=" + count)
    ).data.find((l) => String(l.lot_id) === String(lot));
    assert.ok(diff);
    r = await manager.call("exception-proposals", "POST", {
      stocktake_id: count,
      warehouse_id: String(loc.warehouse_id),
      stocktake_line_id: diff.id,
      reason: "Count is zero",
      resolution_note: "Adjust after approval",
    });
    assert.equal(r.status, 201, JSON.stringify(r));
    proposal = r.data.id;
    assert.equal(
      (
        await manager.call(
          "exception-proposals/" + proposal + "/apply",
          "POST",
          { version: r.data.version },
        )
      ).status,
      409,
    );
    r = await director.call(
      "exception-proposals/" + proposal + "/review",
      "POST",
      { version: r.data.version, decision: "APPROVED" },
    );
    assert.equal(r.status, 200, JSON.stringify(r));
    assert.equal(r.data.decision_history.length, 1);
    let [[balance]] = await pool.execute(
      "SELECT quantity FROM inventory_balances WHERE lot_id=?",
      [lot],
    );
    assert.equal(balance.quantity, "2.000");
    assert.equal(
      (
        await director.call(
          "exception-proposals/" + proposal + "/apply",
          "POST",
          { version: r.data.version },
        )
      ).status,
      403,
    );
    r = await manager.call(
      "exception-proposals/" + proposal + "/apply",
      "POST",
      { version: r.data.version },
    );
    assert.equal(r.status, 200, JSON.stringify(r));
    assert.ok(
      [409, 422].includes(
        (
          await manager.call(
            "exception-proposals/" + proposal + "/apply",
            "POST",
            { version: r.data.version },
          )
        ).status,
      ),
    );
    [[balance]] = await pool.execute(
      "SELECT quantity FROM inventory_balances WHERE lot_id=?",
      [lot],
    );
    assert.equal(balance.quantity, "0.000");
    const [[moves]] = await pool.execute(
      "SELECT COUNT(*) AS n FROM inventory_movements WHERE exception_proposal_id=?",
      [proposal],
    );
    assert.equal(Number(moves.n), 1);
    r = await director.call("stocktakes/" + count);
    r = await director.call("stocktakes/" + count + "/close", "POST", {
      version: r.data.version,
    });
    assert.equal(r.status, 200, JSON.stringify(r));
    console.log(
      "STOCKTAKE SQL PASS: scope, null versus zero, warehouse conclusion, separate approval/application, decision history, exactly-once adjustment, close",
    );
  } finally {
    if (proposal) {
      await pool.execute(
        "DELETE FROM inventory_movements WHERE exception_proposal_id=?",
        [proposal],
      );
      await pool.execute(
        "DELETE FROM exception_decisions WHERE exception_proposal_id=?",
        [proposal],
      );
      await pool.execute("DELETE FROM exception_proposals WHERE id=?", [
        proposal,
      ]);
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='exception-proposals' AND resource_id=?",
        [proposal],
      );
    }
    if (count) {
      const [w] = await pool.execute(
        "SELECT id FROM stocktake_warehouses WHERE stocktake_id=?",
        [count],
      );
      for (const x of w) {
        await pool.execute("DELETE FROM PhanCongKetLuanKiemKe WHERE MaPhieuKiemKe=?",[x.id]);
        await pool.execute(
          "DELETE FROM stocktake_lines WHERE stocktake_warehouse_id=?",
          [x.id],
        );
        await pool.execute(
          "DELETE FROM stocktake_assignments WHERE stocktake_warehouse_id=?",
          [x.id],
        );
      }
      await pool.execute(
        "DELETE FROM stocktake_warehouses WHERE stocktake_id=?",
        [count],
      );
      await pool.execute("DELETE FROM stocktakes WHERE id=?", [count]);
      await pool.execute(
        "DELETE FROM audit_logs WHERE resource_type='stocktakes' AND resource_id=?",
        [count],
      );
    }
    if (lot) {
      await pool.execute("DELETE FROM inventory_balances WHERE lot_id=?", [
        lot,
      ]);
      await pool.execute("DELETE FROM lots WHERE id=?", [lot]);
    }
    if (header)
      await pool.execute("DELETE FROM lot_headers WHERE id=?", [header]);
    if(plan)await pool.execute('DELETE FROM production_plans WHERE id=?',[plan]);
    if(order)await pool.execute('DELETE FROM customer_orders WHERE id=?',[order]);
  }
})()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(closePool);
