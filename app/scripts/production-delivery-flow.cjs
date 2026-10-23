const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
module.exports = async function ({
  pool,
  workshop,
  manager,
  staff,
  director,
  planner,
  qc,
  productionPlanId,
  productionReportId,
  customerOrderId,
  workshopId,
  warehouseId,
  managerId,
  staffId,
  inspectorId,
  locationId,
  materialId,
  finishedItemId,
  lotId,
  date,
}) {
  const requests = [],
    documents = [],
    tasks = [],
    keys = [];
  const returns=[], quarantineProposals=[];
  let finished, finishedLot, finishedHeader, campaign, inspection, sale, releaseProposal, returnCampaign, returnInspection, importCountId, importCountWarehouse, materialCorrectionQC;
  const expect = (r, status) => {
    assert.equal(r.status, status, JSON.stringify(r));
    return r.data;
  };
  async function dispatch(request, lot, quantity, slot, expectedStatus=200) {
    const key = crypto.randomUUID();
    keys.push(key);
    const d = expect(
      await manager.call(
        "/api/v1/stock-requests/" + request.id + "/dispatch",
        "POST",
        {
          version: request.version,
          start_at: new Date(Date.now() + slot * 86400000).toISOString(),
          end_at: new Date(Date.now() + (slot + 0.25) * 86400000).toISOString(),
          allocations: [
            {
              assignee_id: staffId,
              stock_request_line_id: request.lines[0].id,
              lot_id: lot,
              location_id: locationId,
              quality_bucket: "AVAILABLE",
              quantity,
            },
          ],
        },
        key,
      ),
      expectedStatus,
    );
    if(expectedStatus!==200)return d;
    tasks.push(d.tasks[0].id);
    return d;
  }
  async function post(request, d, lot, quantity, expectedStatus=201) {
    const key = crypto.randomUUID();
    keys.push(key);
    const doc = expect(
      await staff.call(
        "/api/v1/stock-documents",
        "POST",
        {
          stock_request_id: request.id,
          request_version: d.version,
          task_id: d.tasks[0].id,
          allocations: [
            {
              stock_request_line_id: request.lines[0].id,
              lot_id: lot,
              location_id: locationId,
              quality_bucket: "AVAILABLE",
              quantity,
            },
          ],
        },
        key,
      ),
      expectedStatus,
    );
    if(expectedStatus!==201)return doc;
    documents.push(doc.id);
    return doc;
  }
  const requestBody = (purpose, source, item, quantity) => ({
    purpose,
    production_report_id: source,
    workshop_id: workshopId,
    warehouse_id: warehouseId,
    manager_id: managerId,
    requested_date: date,
    lines: [{ item_id: item, quantity }],
  });
  try {
    expect(
      await workshop.call("/api/v1/stock-requests", "POST", {
        ...requestBody(
          "PRODUCTION_ISSUE",
          productionReportId,
          materialId,
          "0.500",
        ),
        production_report_id: undefined,
        production_plan_id: productionPlanId,
      }),
      422,
    );
    const issue = expect(
      await workshop.call(
        "/api/v1/stock-requests",
        "POST",
        {...requestBody(
          "PRODUCTION_ISSUE",
          productionReportId,
          materialId,
          "0.500",
        ),production_report_id:undefined,production_plan_id:productionPlanId,production_source_mode:'PLAN'},
      ),
      201,
    );
    requests.push(issue.id);
    const materialPreview=expect(await workshop.call('/api/v1/source-imports/stock-requests?purpose=PRODUCTION_ISSUE&source_id='+productionReportId+'&warehouse_id='+warehouseId),200);
    assert.equal(materialPreview.lines.find(l=>l.item_id===materialId).quantity,'4.500');
    const planPreview=expect(await workshop.call('/api/v1/source-imports/stock-requests?purpose=PRODUCTION_ISSUE&production_source_mode=PLAN&source_id='+productionPlanId+'&warehouse_id='+warehouseId),200);
    assert.equal(planPreview.lines.find(l=>l.item_id===materialId).quantity,'4.500');
    expect(await workshop.call('/api/v1/stock-requests','POST',requestBody('PRODUCTION_ISSUE',productionReportId,materialId,'4.501')),422);
    let dispatched = await dispatch(issue, lotId, "0.500", 3);
    const task = expect(
      await manager.call("/api/v1/tasks/" + dispatched.tasks[0].id),
      200,
    );
    expect(
      await manager.call(
        "/api/v1/tasks/" + task.id + "/cancelAllocation",
        "POST",
        { version: task.version },
      ),
      200,
    );
    const refreshed = expect(
      await workshop.call("/api/v1/stock-requests/" + issue.id),
      200,
    );
    dispatched = await dispatch(refreshed, lotId, "0.500", 3);
    await post(issue, dispatched, lotId, "0.500");
    const outputs = [
      {
        item_id: finishedItemId,
        lot_code: "FLOW-FIN-" + crypto.randomBytes(6).toString("hex"),
        quantity: "1.000",
        manufactured_date: date,
      },
    ];
    expect(
      await workshop.call("/api/v1/finished-reports", "POST", {
        production_completed:true,
        production_plan_id: productionPlanId,
        completed_date: date,
        outputs,
        materials: [{ item_id: materialId, used_quantity: "0.501" }],
      }),
      422,
    );
    let report = expect(
      await workshop.call("/api/v1/finished-reports", "POST", {
        production_completed:true,
        production_plan_id: productionPlanId,
        completed_date: date,
        outputs,
        materials: [{ item_id: materialId, used_quantity: "0.500" }],
      }),
      201,
    );
    finished = report.id;
    finishedLot = report.outputs[0].lot_id;
    const [[l]] = await pool.execute(
      "SELECT lot_header_id FROM lots WHERE id=?",
      [finishedLot],
    );
    finishedHeader = l.lot_header_id;
    report = expect(
      await workshop.call(
        "/api/v1/finished-reports/" + finished + "/submit",
        "POST",
        { version: report.version },
      ),
      200,
    );
    expect(
      await workshop.call(
        "/api/v1/stock-requests",
        "POST",
        requestBody(
          "PRODUCTION_RECEIPT",
          productionReportId,
          finishedItemId,
          "1.000",
        ),
      ),
      409,
    );
    const q = expect(
      await director.call("/api/v1/quality-campaigns", "POST", {
        campaign_type: "QUALITY_CHECK",
        quality_kind: "FINISHED_PRODUCT",
        planned_date: date,
        start_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        end_at: new Date(Date.now() + 4.25 * 86400000).toISOString(),
        location: "Isolated production QC",
        assignee_ids: [inspectorId],
        lot_ids: [finishedLot],
      }),
      201,
    );
    campaign = q.id;
    expect(
      await director.call(
        "/api/v1/quality-campaigns/" + campaign + "/start",
        "POST",
        { version: q.version },
      ),
      200,
    );
    const quality = expect(
      await qc.call("/api/v1/qc-inspections", "POST", {
        campaign_id: campaign,
        inspected_at: new Date().toISOString(),
        lines: [
          {
            lot_id: finishedLot,
            inspected_quantity: "1.000",
            passed_quantity: "1.000",
            failed_quantity: "0.000",
          },
        ],
      }),
      201,
    );
    inspection = quality.id;
    expect(await qc.call('/api/v1/qc-inspections/'+inspection,'PATCH',{version:quality.version,note:'overwrite'}),409);
    let corrected=expect(await qc.call('/api/v1/qc-inspections/'+inspection+'/correct','POST',{version:quality.version,reason:'Fixture correction',lines:[{lot_id:finishedLot,passed_quantity:'0.900',failed_quantity:'0.100',issue:'Fixture issue'}]}),200);
    let proposal=expect(await manager.call('/api/v1/exception-proposals','POST',{qc_inspection_line_id:corrected.lines[0].id,action:'RELEASE',quantity:'0.100',reason:'Reinspect finished goods',resolution_note:'Release only after quality confirmation'}),201);
    releaseProposal=proposal.id;
    expect(await qc.call('/api/v1/exception-proposals/'+proposal.id+'/reinspect','POST',{version:proposal.version,result:'PASSED',note:'Not approved yet'}),409);
    proposal=expect(await director.call('/api/v1/exception-proposals/'+proposal.id+'/review','POST',{version:proposal.version,decision:'APPROVE'}),200);
    expect(await manager.call('/api/v1/exception-proposals/'+proposal.id+'/apply','POST',{version:proposal.version}),409);
    expect(await staff.call('/api/v1/exception-proposals/'+proposal.id+'/reinspect','POST',{version:proposal.version,result:'PASSED',note:'Wrong role'}),403);
    proposal=expect(await qc.call('/api/v1/exception-proposals/'+proposal.id+'/reinspect','POST',{version:proposal.version,result:'FAILED',note:'First reinspection failed'}),200);
    expect(await manager.call('/api/v1/exception-proposals/'+proposal.id+'/apply','POST',{version:proposal.version}),409);
    proposal=expect(await qc.call('/api/v1/exception-proposals/'+proposal.id+'/reinspect','POST',{version:proposal.version,result:'PASSED',note:'Second reinspection passed'}),200);
    const applied=expect(await manager.call('/api/v1/exception-proposals/'+proposal.id+'/apply','POST',{version:proposal.version}),200);
    assert.equal(applied.status,'APPLIED');assert.equal(applied.reinspections.length,2);
    expect(await manager.call('/api/v1/exception-proposals/'+proposal.id+'/apply','POST',{version:proposal.version}),409);
    corrected=expect(await qc.call('/api/v1/qc-inspections/'+inspection),200);
    assert.equal(corrected.lines[0].passed_quantity,'1.000');
    expect(await qc.call('/api/v1/qc-inspections/'+inspection+'/correct','POST',{version:corrected.version,reason:'Must not undo approved exception',lines:[{lot_id:finishedLot,passed_quantity:'0.900',failed_quantity:'0.100',issue:'Undo attempt'}]}),409);
    const [[preReceipt]]=await pool.execute('SELECT COUNT(*) AS total FROM inventory_movements WHERE lot_id=?',[finishedLot]);assert.equal(Number(preReceipt.total),0);
    assert.equal(corrected.compensations.length,2);
    const receipt = expect(
      await workshop.call(
        "/api/v1/stock-requests",
        "POST",
        requestBody("PRODUCTION_RECEIPT", finished, finishedItemId, "1.000"),
      ),
      201,
    );
    requests.push(receipt.id);
    await post(
      receipt,
      await dispatch(receipt, finishedLot, "1.000", 5),
      finishedLot,
      "1.000",
    );
    const [[order]] = await pool.execute(
      "SELECT customer_id FROM customer_orders WHERE id=?",
      [customerOrderId],
    );
    let sell = expect(
      await planner.call("/api/v1/business-plans", "POST", {
        type: "SALE",
        customer_order_id: customerOrderId,
        customer_id: String(order.customer_id),
        finished_report_id: finished,
        planned_date: date,
        lines: [
          { item_id: finishedItemId, quantity: "1.000", unit_price: "10.0000" },
        ],
      }),
      201,
    );
    sale = sell.id;
    const reviewKey = crypto.randomUUID();
    keys.push(reviewKey);
    sell = expect(
      await director.call(
        "/api/v1/business-plans/" + sale + "/review",
        "POST",
        { version: sell.version, decision: "APPROVE" },
        reviewKey,
      ),
      200,
    );
    const saleRequest = {
      ...requestBody("SALE_ISSUE", null, finishedItemId, "1.000"),
      workflow_source_id: productionPlanId,
    };
    delete saleRequest.production_report_id;
    const early = await workshop.call('/api/v1/stock-requests','POST',saleRequest);
    assert.equal(early.status,409,JSON.stringify(early));assert.equal(early.error.code,'DELIVERY_NOT_DUE');
    await pool.execute('UPDATE customer_orders SET latest_delivery_date=? WHERE id=?',[require('../src/services/domain/core').today(),customerOrderId]);
    await pool.execute("UPDATE production_plans SET status='IN_PROGRESS' WHERE id=?",[productionPlanId]);
    const unfinished = await workshop.call('/api/v1/stock-requests','POST',saleRequest);
    assert.equal(unfinished.status,409);assert.equal(unfinished.error.code,'PRODUCTION_NOT_COMPLETED');
    await pool.execute("UPDATE production_plans SET status='COMPLETED' WHERE id=?",[productionPlanId]);
    // A closed count fixture proves the preview joins the latest count of this lot/location.
    const [[countAuthor]]=await pool.execute("SELECT id FROM users WHERE username='director'");
    const countCode='COUNT-IMPORT-'+crypto.randomBytes(6).toString('hex');
    const [countHeader]=await pool.execute("INSERT INTO stocktakes(code,created_by,planned_date,item_kind,status,version,campaign_type) VALUES (?,?,?,'FINISHED_PRODUCT','CLOSED',1,'COUNT')",[countCode,countAuthor.id,date]);importCountId=countHeader.insertId;
    const [countWarehouse]=await pool.execute("INSERT INTO stocktake_warehouses(stocktake_id,warehouse_id,status,version,conclusion_status,remarks,created_by) VALUES (?,?,'CLOSED',1,'SUBMITTED','Count verified',?)",[importCountId,warehouseId,countAuthor.id]);importCountWarehouse=countWarehouse.insertId;
    await pool.execute("INSERT INTO stocktake_lines(stocktake_warehouse_id,lot_id,location_id,quality_bucket,system_quantity,actual_quantity,resolution_status,version) VALUES (?,?,?,'AVAILABLE','1.000','1.000','NONE',1)",[importCountWarehouse,finishedLot,locationId]);
    const salePreview=expect(await workshop.call('/api/v1/source-imports/stock-requests?purpose=SALE_ISSUE&source_id='+sale+'&workshop_id='+workshopId+'&warehouse_id='+warehouseId),200);
    assert.equal(salePreview.finished_report_id,finished);assert.equal(salePreview.lines[0].quantity,'1.000');assert.equal(salePreview.evidence[0].lot_id,finishedLot);assert.equal(salePreview.evidence[0].qc_status,'PASSED');
    assert.equal(salePreview.evidence[0].stocktake.code,countCode);assert.equal(salePreview.evidence[0].stocktake.actual_quantity,'1.000');assert.equal(salePreview.evidence[0].stocktake.status,'CLOSED');
    const delivery = expect(
      await workshop.call("/api/v1/stock-requests", "POST", saleRequest),
      201,
    );
    requests.push(delivery.id);
    await pool.execute('UPDATE customer_orders SET latest_delivery_date=? WHERE id=?',[date,customerOrderId]);
    await dispatch(delivery,finishedLot,'1.000',6,409);
    await pool.execute('UPDATE customer_orders SET latest_delivery_date=? WHERE id=?',[require('../src/services/domain/core').today(),customerOrderId]);
    const deliveryDispatch=await dispatch(delivery,finishedLot,'1.000',6);
    await pool.execute('UPDATE customer_orders SET latest_delivery_date=? WHERE id=?',[date,customerOrderId]);
    await post(delivery,deliveryDispatch,finishedLot,'1.000',409);
    const [[beforeDelivery]]=await pool.execute('SELECT quantity FROM inventory_balances WHERE lot_id=?',[finishedLot]);
    assert.equal(beforeDelivery.quantity,'1.000');
    await pool.execute('UPDATE customer_orders SET latest_delivery_date=? WHERE id=?',[require('../src/services/domain/core').today(),customerOrderId]);
    await post(delivery,deliveryDispatch,finishedLot,'1.000');
    const [[balance]] = await pool.execute(
      "SELECT quantity FROM inventory_balances WHERE lot_id=?",
      [finishedLot],
    );
    assert.equal(balance.quantity, "0.000");
    const [[customerOrder]] = await pool.execute(
      "SELECT status FROM customer_orders WHERE id=?",
      [customerOrderId],
    );
    assert.equal(customerOrder.status, "COMPLETED");
    const [[deliveredQC]]=await pool.execute('SELECT id FROM qc_inspection_lines WHERE lot_id=?',[finishedLot]);
    expect(await manager.call('/api/v1/exception-proposals','POST',{
      quarantine:true,qc_inspection_line_id:String(deliveredQC.id),action:'QUARANTINE',quantity:'0.100',
      reason:'Cannot adjust goods already delivered',resolution_note:'No stock available',
      allocations:[{location_id:locationId,quantity:'0.100'}],
    }),409);
    const deliveryLines=expect(await manager.call('/api/v1/customer-return-deliveries'),200);
    const source=deliveryLines.find(l=>String(l.lot_id)===String(finishedLot));assert.ok(source);
    const returnBody=(quantity,receiver=staffId)=>({warehouse_id:warehouseId,receiver_id:receiver,reason:'Customer returned packaged cakes',lines:[{original_stock_document_line_id:source.id,quantity,location_id:locationId}]});
    const races=await Promise.all([manager.call('/api/v1/customer-returns','POST',returnBody('0.600')),manager.call('/api/v1/customer-returns','POST',returnBody('0.600'))]);
    for(const r of races)if(r.status===201)returns.push(r.data.id);
    assert.deepEqual(races.map(r=>r.status).sort(),[201,409],JSON.stringify(races));
    let returned=races.find(r=>r.status===201).data;
    expect(await staff.call('/api/v1/customer-returns','POST',returnBody('0.100')),403);
    expect(await manager.call('/api/v1/customer-returns/'+returned.id+'/receive','POST',{version:returned.version}),403);
    const received=expect(await staff.call('/api/v1/customer-returns/'+returned.id+'/receive','POST',{version:returned.version}),200);
    const replayed=expect(await staff.call('/api/v1/customer-returns/'+returned.id+'/receive','POST',{version:returned.version}),200);
    assert.equal(replayed.stock_document_id,received.stock_document_id);
    const returnLot=received.lines[0].returned_lot_detail_id;
    const [[heldReturn]]=await pool.execute('SELECT quantity,quality_bucket FROM inventory_balances WHERE lot_id=?',[returnLot]);assert.equal(heldReturn.quantity,'0.600');assert.equal(heldReturn.quality_bucket,'QUARANTINE');
    const [[once]]=await pool.execute('SELECT COUNT(*) AS total FROM inventory_movements WHERE lot_id=?',[returnLot]);assert.equal(Number(once.total),1);
    expect(await manager.call('/api/v1/stock-documents/'+received.stock_document_id),200);
    expect(await manager.call('/api/v1/customer-returns/'+received.id+'/cancel','POST',{version:received.version}),409);
    const [[otherStaff]]=await pool.execute("SELECT id FROM users WHERE username='staff2'");
    let pendingReturn=expect(await manager.call('/api/v1/customer-returns','POST',returnBody('0.400',String(otherStaff.id))),201);returns.push(pendingReturn.id);
    expect(await staff.call('/api/v1/customer-returns/'+pendingReturn.id),404);
    expect(await staff.call('/api/v1/customer-returns/'+pendingReturn.id+'/receive','POST',{version:pendingReturn.version}),404);
    pendingReturn=expect(await manager.call('/api/v1/customer-returns/'+pendingReturn.id+'/cancel','POST',{version:pendingReturn.version}),200);assert.equal(pendingReturn.status,'CANCELLED');
    expect(await manager.call('/api/v1/customer-returns','POST',returnBody('0.401')),409);
    // Returned stock is inspected through the existing QC flow and stays quarantined.
    let cq=expect(await director.call('/api/v1/quality-campaigns','POST',{campaign_type:'QUALITY_CHECK',planned_date:date,start_at:new Date(Date.now()+15*86400000).toISOString(),end_at:new Date(Date.now()+15.25*86400000).toISOString(),quality_kind:'FINISHED_PRODUCT',location:'Returns quarantine',assignee_ids:[inspectorId],lot_ids:[returnLot]}),201);returnCampaign=cq.id;
    cq=expect(await director.call('/api/v1/quality-campaigns/'+cq.id+'/start','POST',{version:cq.version}),200);
    const rq=expect(await qc.call('/api/v1/qc-inspections','POST',{campaign_id:cq.id,inspected_at:new Date().toISOString(),lines:[{lot_id:returnLot,inspected_quantity:'0.600',passed_quantity:'0.400',failed_quantity:'0.200',issue:'Damaged packaging'}]}),201);returnInspection=rq.id;
    const [[afterQC]]=await pool.execute('SELECT quantity,quality_bucket FROM inventory_balances WHERE lot_id=?',[returnLot]);assert.equal(afterQC.quality_bucket,'QUARANTINE');assert.equal(afterQC.quantity,'0.600');
    const [[unchangedOrder]]=await pool.execute('SELECT status FROM customer_orders WHERE id=?',[customerOrderId]);assert.equal(unchangedOrder.status,'COMPLETED');
    const [[returnQC]]=await pool.execute('SELECT id FROM qc_inspection_lines WHERE qc_inspection_id=?',[returnInspection]);
    const disposition=(action,quantity)=>({quarantine:true,qc_inspection_line_id:String(returnQC.id),action,quantity,reason:'Inspect returned stock',resolution_note:'Approved stock disposition',allocations:[{location_id:locationId,quantity}]});
    expect(await staff.call('/api/v1/exception-proposals','POST',disposition('RELEASE','0.400')),403);
    expect(await manager.call('/api/v1/exception-proposals','POST',disposition('RELEASE','0.401')),409);
    const proposalRaces=await Promise.all([manager.call('/api/v1/exception-proposals','POST',disposition('RELEASE','0.300')),manager.call('/api/v1/exception-proposals','POST',disposition('RELEASE','0.300'))]);
    for(const r of proposalRaces)if(r.status===201)quarantineProposals.push(r.data.id);
    assert.deepEqual(proposalRaces.map(r=>r.status).sort(),[201,409],JSON.stringify(proposalRaces));
    let release=proposalRaces.find(r=>r.status===201).data;
    expect(await manager.call('/api/v1/exception-proposals/'+release.id+'/apply','POST',{version:release.version}),409);
    release=expect(await director.call('/api/v1/exception-proposals/'+release.id+'/review','POST',{version:release.version,decision:'APPROVE'}),200);
    expect(await staff.call('/api/v1/exception-proposals/'+release.id+'/apply','POST',{version:release.version}),403);
    await pool.execute("UPDATE stocktakes SET status='IN_PROGRESS' WHERE id=?",[importCountId]);
    await pool.execute("UPDATE stocktake_warehouses SET status='COUNTING' WHERE id=?",[importCountWarehouse]);
    const blocked=await manager.call('/api/v1/exception-proposals/'+release.id+'/apply','POST',{version:release.version});expect(blocked,409);assert.equal(blocked.error.code,'WAREHOUSE_FROZEN');
    await pool.execute("UPDATE stocktake_warehouses SET status='CLOSED' WHERE id=?",[importCountWarehouse]);
    await pool.execute("UPDATE stocktakes SET status='CLOSED' WHERE id=?",[importCountId]);
    expect(await manager.call('/api/v1/exception-proposals/'+release.id+'/apply','POST',{version:release.version}),200);
    expect(await manager.call('/api/v1/exception-proposals/'+release.id+'/apply','POST',{version:release.version}),409);
    for(const [action,quantity] of [['RELEASE','0.100'],['SCRAP','0.200']]) {
      let p=expect(await manager.call('/api/v1/exception-proposals','POST',disposition(action,quantity)),201);quarantineProposals.push(p.id);
      p=expect(await director.call('/api/v1/exception-proposals/'+p.id+'/review','POST',{version:p.version,decision:'APPROVE'}),200);
      expect(await manager.call('/api/v1/exception-proposals/'+p.id+'/apply','POST',{version:p.version}),200);
    }
    const [dispositionBalances]=await pool.execute('SELECT quality_bucket,quantity FROM inventory_balances WHERE lot_id=?',[returnLot]);
    assert.equal(dispositionBalances.find(b=>b.quality_bucket==='QUARANTINE').quantity,'0.000');
    assert.equal(dispositionBalances.find(b=>b.quality_bucket==='AVAILABLE').quantity,'0.400');
    const [[afterDispositionOrder]]=await pool.execute('SELECT status FROM customer_orders WHERE id=?',[customerOrderId]);assert.equal(afterDispositionOrder.status,'COMPLETED');
    const [[originalMaterialReceipt]]=await pool.execute("SELECT d.stock_request_id,d.task_id FROM stock_documents d JOIN stock_document_lines dl ON dl.stock_document_id=d.id WHERE dl.lot_id=? AND d.type='IN' ORDER BY d.id LIMIT 1",[lotId]);
    const materialRequest=expect(await staff.call('/api/v1/stock-requests/'+originalMaterialReceipt.stock_request_id),200);
    const extraReceipt=expect(await staff.call('/api/v1/stock-documents','POST',{
      stock_request_id:String(originalMaterialReceipt.stock_request_id),request_version:materialRequest.version,task_id:String(originalMaterialReceipt.task_id),
      allocations:[{stock_request_line_id:materialRequest.lines[0].id,lot_id:lotId,location_id:locationId,quality_bucket:'AVAILABLE',quantity:'0.100'}],
    },crypto.randomUUID()),201);documents.push(extraReceipt.id);
    const [[materialQC]]=await pool.execute('SELECT id,qc_inspection_id FROM qc_inspection_lines WHERE lot_id=?',[lotId]);materialCorrectionQC=materialQC.qc_inspection_id;
    const materialDisposition=action=>({quarantine:true,qc_inspection_line_id:String(materialQC.id),action,quantity:'0.100',reason:'Material defect found after receipt',resolution_note:'Return verified failed material',allocations:[{location_id:locationId,quantity:'0.100'}]});
    let materialCorrection=expect(await manager.call('/api/v1/exception-proposals','POST',materialDisposition('QUARANTINE')),201);quarantineProposals.push(materialCorrection.id);
    materialCorrection=expect(await director.call('/api/v1/exception-proposals/'+materialCorrection.id+'/review','POST',{version:materialCorrection.version,decision:'APPROVE'}),200);
    materialCorrection=expect(await qc.call('/api/v1/exception-proposals/'+materialCorrection.id+'/reinspect','POST',{version:materialCorrection.version,result:'FAILED',note:'Confirmed received material defect'}),200);
    expect(await manager.call('/api/v1/exception-proposals/'+materialCorrection.id+'/apply','POST',{version:materialCorrection.version}),200);
    let supplierReturn=expect(await manager.call('/api/v1/exception-proposals','POST',materialDisposition('RETURN_SUPPLIER')),201);quarantineProposals.push(supplierReturn.id);
    supplierReturn=expect(await director.call('/api/v1/exception-proposals/'+supplierReturn.id+'/review','POST',{version:supplierReturn.version,decision:'APPROVE'}),200);
    expect(await manager.call('/api/v1/exception-proposals/'+supplierReturn.id+'/apply','POST',{version:supplierReturn.version}),200);
    const [[supplierTrace]]=await pool.execute('SELECT r.quantity,h.return_direction,r.original_lot_detail_id FROM returned_lot_lines r JOIN lot_headers h ON h.id=r.lot_header_id WHERE r.exception_proposal_id=?',[supplierReturn.id]);
    assert.equal(supplierTrace.quantity,'0.100');assert.equal(supplierTrace.return_direction,'NCC');assert.equal(String(supplierTrace.original_lot_detail_id),lotId);
    const [[materialQuarantine]]=await pool.execute("SELECT quantity FROM inventory_balances WHERE lot_id=? AND location_id=? AND quality_bucket='QUARANTINE'",[lotId,locationId]);assert.equal(materialQuarantine.quantity,'0.000');
    console.log('POSTED MATERIAL RETURN PASS: verified QC correction, approved supplier return, quarantine reduction and original lot trace');
    console.log('QUARANTINE DISPOSITION PASS: QC limits, concurrent proposals, director approval, warehouse freeze, release/scrap, no duplicate movement or order changes');
    console.log('CUSTOMER RETURNS PASS: original delivery cap, concurrent returns, assignment, one-time quarantine receipt, cancellation, normal QC and unchanged order');
    console.log(
      "PRODUCTION DELIVERY PASS: actual report source, release/reallocate, issued material consumption cap, finished QC/receipt, approved sale and customer delivery",
    );
  } finally {
    for(const p of quarantineProposals) {
      const [returnHeaders]=await pool.execute('SELECT lot_header_id FROM returned_lot_lines WHERE exception_proposal_id=?',[p]);
      await pool.execute('DELETE FROM returned_lot_lines WHERE exception_proposal_id=?',[p]);
      for(const h of returnHeaders)await pool.execute('DELETE FROM lot_headers WHERE id=?',[h.lot_header_id]);
      await pool.execute('DELETE FROM TaiKiemChatLuong WHERE MaDeXuatXuLy=?',[p]);
      await pool.execute('DELETE FROM inventory_movements WHERE exception_proposal_id=?',[p]);
      await pool.execute('DELETE FROM exception_allocations WHERE exception_proposal_id=?',[p]);
      await pool.execute('DELETE FROM exception_decisions WHERE exception_proposal_id=?',[p]);
      await pool.execute('DELETE FROM exception_proposals WHERE id=?',[p]);
      await pool.execute("DELETE FROM audit_logs WHERE resource_type='exception-proposals' AND resource_id=?",[p]);
    }
    if(materialCorrectionQC)await pool.execute('DELETE FROM qc_compensations WHERE original_qc_id=?',[materialCorrectionQC]);
    if(importCountWarehouse){await pool.execute('DELETE FROM stocktake_lines WHERE stocktake_warehouse_id=?',[importCountWarehouse]);await pool.execute('DELETE FROM stocktake_warehouses WHERE id=?',[importCountWarehouse]);}
    if(importCountId)await pool.execute('DELETE FROM stocktakes WHERE id=?',[importCountId]);
    if(returnInspection){await pool.execute('DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?',[returnInspection]);await pool.execute('DELETE FROM qc_inspections WHERE id=?',[returnInspection]);}
    if(returnCampaign){await pool.execute('DELETE FROM quality_campaign_lots WHERE campaign_id=?',[returnCampaign]);await pool.execute('DELETE FROM quality_campaign_assignments WHERE campaign_id=?',[returnCampaign]);const [qt]=await pool.execute('SELECT id FROM tasks WHERE stocktake_id=?',[returnCampaign]);for(const t of qt)await pool.execute('DELETE FROM task_assignments WHERE task_id=?',[t.id]);await pool.execute('DELETE FROM tasks WHERE stocktake_id=?',[returnCampaign]);await pool.execute('DELETE FROM stocktakes WHERE id=?',[returnCampaign]);}
    for(const r of returns){
      const [returnedLots]=await pool.execute('SELECT returned_lot_detail_id FROM returned_lot_lines WHERE lot_header_id=?',[r]);
      const [docs]=await pool.execute('SELECT id FROM stock_documents WHERE return_header_id=?',[r]);
      for(const d of docs){await pool.execute('DELETE FROM inventory_movements WHERE stock_document_line_id IN (SELECT id FROM stock_document_lines WHERE stock_document_id=?)',[d.id]);await pool.execute('DELETE FROM stock_document_lines WHERE stock_document_id=?',[d.id]);await pool.execute('DELETE FROM stock_documents WHERE id=?',[d.id]);}
      await pool.execute('DELETE FROM returned_lot_lines WHERE lot_header_id=?',[r]);
      for(const l of returnedLots)if(l.returned_lot_detail_id){await pool.execute('DELETE FROM inventory_balances WHERE lot_id=?',[l.returned_lot_detail_id]);await pool.execute('DELETE FROM lots WHERE id=?',[l.returned_lot_detail_id]);}
      await pool.execute('DELETE FROM lot_headers WHERE id=?',[r]);await pool.execute("DELETE FROM audit_logs WHERE resource_type='customer-returns' AND resource_id=?",[r]);
    }
    for (const doc of documents) {
      await pool.execute(
        "DELETE FROM inventory_movements WHERE stock_document_line_id IN (SELECT id FROM stock_document_lines WHERE stock_document_id=?)",
        [doc],
      );
      await pool.execute(
        "DELETE FROM stock_document_lines WHERE stock_document_id=?",
        [doc],
      );
      await pool.execute("DELETE FROM stock_documents WHERE id=?", [doc]);
    }
    for (const t of tasks) {
      await pool.execute("DELETE FROM stock_allocations WHERE task_id=?", [t]);
      await pool.execute("DELETE FROM task_assignments WHERE task_id=?", [t]);
      await pool.execute("DELETE FROM tasks WHERE id=?", [t]);
    }
    for (const r of requests) {
      await pool.execute(
        "DELETE FROM stock_request_lines WHERE stock_request_id=?",
        [r],
      );
      await pool.execute("DELETE FROM stock_requests WHERE id=?", [r]);
    }
    if (sale) {
      await pool.execute(
        "DELETE FROM business_plan_lines WHERE business_plan_id=?",
        [sale],
      );
      await pool.execute("DELETE FROM business_plans WHERE id=?", [sale]);
    }
    if (inspection) {
      if(releaseProposal){
        await pool.execute('DELETE FROM TaiKiemChatLuong WHERE MaDeXuatXuLy=?',[releaseProposal]);
        await pool.execute('DELETE FROM exception_decisions WHERE exception_proposal_id=?',[releaseProposal]);
        await pool.execute('DELETE FROM exception_proposals WHERE id=?',[releaseProposal]);
        await pool.execute("DELETE FROM audit_logs WHERE resource_type='exception-proposals' AND resource_id=?",[releaseProposal]);
      }
      await pool.execute('DELETE FROM qc_compensations WHERE original_qc_id=?',[inspection]);
      await pool.execute(
        "DELETE FROM qc_inspection_lines WHERE qc_inspection_id=?",
        [inspection],
      );
      await pool.execute("DELETE FROM qc_inspections WHERE id=?", [inspection]);
    }
    if (campaign) {
      await pool.execute(
        "DELETE FROM quality_campaign_lots WHERE campaign_id=?",
        [campaign],
      );
      await pool.execute(
        "DELETE FROM quality_campaign_assignments WHERE campaign_id=?",
        [campaign],
      );
      const [qt] = await pool.execute(
        "SELECT id FROM tasks WHERE stocktake_id=?",
        [campaign],
      );
      for (const t of qt)
        await pool.execute("DELETE FROM task_assignments WHERE task_id=?", [
          t.id,
        ]);
      await pool.execute("DELETE FROM tasks WHERE stocktake_id=?", [campaign]);
      await pool.execute("DELETE FROM stocktakes WHERE id=?", [campaign]);
    }
    if (finished) {
      await pool.execute(
        "DELETE FROM finished_report_outputs WHERE finished_report_id=?",
        [finished],
      );
      await pool.execute(
        "DELETE FROM report_details WHERE production_report_id=?",
        [finished],
      );
      await pool.execute("DELETE FROM finished_reports WHERE id=?", [finished]);
    }
    if (finishedLot) {
      await pool.execute("DELETE FROM inventory_balances WHERE lot_id=?", [
        finishedLot,
      ]);
      await pool.execute("DELETE FROM lots WHERE id=?", [finishedLot]);
    }
    if (finishedHeader)
      await pool.execute("DELETE FROM lot_headers WHERE id=?", [
        finishedHeader,
      ]);
    for (const key of keys)
      await pool.execute(
        "DELETE FROM idempotency_records WHERE idempotency_key=?",
        [key],
      );
  }
};
