const { chromium } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const base = process.env.APP_URL || "http://127.0.0.1:3000";
const executablePath =
  process.env.BROWSER_PATH ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find((p) => fs.existsSync(p));
// Browser uses synthetic source documents; SQL acceptance tests validate the real writes.
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    for(const [username,,role] of require('../src/config/demo-checkers')){
      const context=await browser.newContext();
      const csrf=(await (await context.request.get(base+'/api/v1/auth/csrf')).json()).data.csrf_token;
      const response=await context.request.post(base+'/api/v1/auth/login',{headers:{'X-CSRF-Token':csrf},data:{username,password:process.env.DEMO_PASSWORD||'123456'}});
      assert.equal(response.status(),200,'Demo login '+username);
      const body=await response.json();
      assert.ok(body.data.roles.includes(role));
      await context.close();
    }
    async function pageFor(username, resource) {
      const context = await browser.newContext(),
        page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/login");
      await page.locator("#username").fill(username);
      await page
        .locator("#password")
        .fill(process.env.DEMO_PASSWORD || "123456");
      await page.locator("#login-form button").click();
      await page.waitForURL("**/dashboard");
      const url = require("../src/config/navigation").modules.find(
        (m) => m[0] === resource,
      )[5];
      assert.equal(
        (await page.goto(base + url + "?module=" + resource)).status(),
        200,
      );
      await page.waitForFunction(() => typeof api === "function");
      if(['stocktakes','qc-inspections'].includes(resource)) return {context,page,errors};
      const items = (await page.evaluate(() => api("lookup/items"))).data,
        material = items.find((i) => i.kind === "MATERIAL"),
        finished = items.find((i) => i.kind === "FINISHED_PRODUCT");
      assert.ok(material && finished);
      return { context, page, errors, material, finished };
    }
    const mock = (page, path, data) =>
      page.route("**/api/v1/" + path, (r) => r.fulfill({ json: { data } }));
    async function capture(page, path) {
      let payload;
      await page.route("**/api/v1/" + path, (r) => {
        if (r.request().method() === "POST") {
          payload = r.request().postDataJSON();
          return r.fulfill({ json: { data: { id: "999999" } } });
        }
        return r.continue();
      });
      return async () => {
        const invalid = await page
          .locator("#data-form")
          .evaluate((f) =>
            [...f.elements]
              .filter((e) => !e.checkValidity())
              .map((e) => ({ name: e.name, value: e.value })),
          );
        assert.deepEqual(invalid, []);
        await page.locator("#data-form [type=submit]").click();
        await page.waitForFunction(
          () => !document.querySelector("#modal").open,
        );
        assert.ok(payload);
        return payload;
      };
    }
    {
      const {context,page,errors}=await pageFor('director','stocktakes');
      await mock(page,'lookup/users',[
        {id:'7101',name:'Kiem ke A',roles:['STOCKTAKER']},
        {id:'7102',name:'Kiem ke B',roles:['STOCKTAKER']},
        {id:'7103',name:'QC A',roles:['QC_INSPECTOR']},
        {id:'7104',name:'QC B',roles:['QC_INSPECTOR']},
        {id:'7105',name:'Mua hang',roles:['PURCHASER']},
      ]);
      await mock(page,'lookup/lots',[{id:'7990',name:'Lo QC',kind:'MATERIAL',qc_status:'PENDING',received_date:'2040-01-02'}]);
      await mock(page,'task-inspection-sources',{finished_lots:[],material_lots:[]});
      await mock(page,'quality-campaign-sources',{lots:[{id:'7990',name:'Lo QC / dot 1',kind:'MATERIAL',qc_status:'PENDING',expected_date:'2040-01-02'}],plans:[{id:'7901',code:'MUA-DU-KIEN',source_mode:'PURCHASE_PLAN',expected_date:'2040-01-03',lines:[]},{id:'7902',code:'SX-DU-KIEN',source_mode:'PRODUCTION_PLAN',expected_date:'2040-01-05',lines:[]}]});
      await page.evaluate(()=>createForm());
      assert.equal(await page.locator('#f-assignee_ids option').count(),4);
      const choose=async(role,ids)=>{
        await page.locator('[data-pick-employees="'+role+'"]').click();
        for(const id of ids)await page.locator('.employee-dialog input[value="'+id+'"]').check();
        await page.locator('.employee-dialog button[value="confirm"]').click();
        await page.locator('.employee-dialog').waitFor({state:'detached'});
      };
      await choose('STOCKTAKER',['7101','7102']);
      await choose('QC_INSPECTOR',['7103','7104']);
      assert.deepEqual(await page.evaluate(()=>selectedEmployees()),['7101','7102','7103','7104']);
      assert.equal(await page.locator('.employee-name').count(),4);
      await page.locator('[data-pick-employees="QC_INSPECTOR"]').click();
      await page.locator('.employee-dialog input[value="7103"]').uncheck();
      await page.locator('.employee-dialog button[value="cancel"]').last().click();
      await page.locator('.employee-dialog').waitFor({state:'detached'});
      assert.deepEqual(await page.evaluate(()=>selectedEmployees()),['7101','7102','7103','7104']);
      const taskPath=require('../src/config/navigation').modules.find(m=>m[0]==='tasks')[5];
      await mock(page,'task-inspection-sources',{finished_lots:[{id:'8100',code:'TP-LO-CHUNG',parts:[{id:'8101',code:'BCTP-PHAN-1',available:false,expected_date:'2040-01-02',lines:[{item_name:'Banh quy',quantity:'40.000'}]},{id:'8102',code:'BCTP-PHAN-2',expected_date:'2040-01-03',lines:[{item_name:'Banh quy',quantity:'60.000'}]}]}],material_lots:[{id:'PLAN:8200',code:'NVL theo KH-MUA-8200',expected_date:'2040-01-04'}]});
      await page.goto(base+taskPath+'?module=tasks');
      assert.equal(await page.locator('#create').count(),0);
      await page.goto(base+'/stocktakes');
      await page.evaluate(()=>createForm());
      assert.equal(await page.locator('#f-inspection_type option').count(),2);
      assert.equal(await page.locator('#f-campaign_type').count(),0);
      assert.equal(await page.locator('[data-finished-part]').count(),2);
      assert.equal(await page.locator('[data-finished-part][value="8101"]').isDisabled(),true);
      await page.locator('[data-finished-part][value="8102"]').check();
      assert.equal(await page.locator('#f-start_at').inputValue(),'2040-01-03T08:00');
      assert.equal(await page.locator('#f-assignee_ids option').count(),4);
      await choose('STOCKTAKER',['7101']);
      await choose('QC_INSPECTOR',['7103']);
      assert.deepEqual(await page.evaluate(()=>selectedEmployees()),['7101','7103']);
      await page.locator('#f-minute_author_id').selectOption('7103');
      const saveTask=await capture(page,'tasks');const taskBody=await saveTask();
      assert.equal(taskBody.inspection_type,'FINISHED_PRODUCT');assert.equal(taskBody.lot_header_id,'8100');assert.deepEqual(taskBody.finished_report_ids,['8102']);
      await page.evaluate(()=>createForm());await page.locator('#f-inspection_type').selectOption('MATERIAL');
      assert.equal(await page.locator('[data-finished-part]').count(),0);
      assert.equal(await page.locator('#f-start_at').inputValue(),'2040-01-04T08:00');
      await choose('QC_INSPECTOR',['7103']);
      await page.locator('#f-minute_author_id').selectOption('7103');
      const saveMaterial=await capture(page,'tasks');const materialTask=await saveMaterial();
      assert.equal(materialTask.material_source,'PLAN:8200');assert.equal(materialTask.finished_report_ids,undefined);
      await page.goto(base+taskPath+'?module=tasks');
      await page.evaluate(()=>editForm({id:'7000',code:'CV-7000',title:'Kiem ke',version:1,start_at:'2040-01-01T01:00:00Z',end_at:'2040-01-01T02:00:00Z',assignee_ids:['7101','7102','7103','7104']}));
      assert.deepEqual(await page.evaluate(()=>selectedEmployees()),['7101','7102','7103','7104']);
      for(const simulated of [false,true]){
        await page.evaluate(()=>actionForm({id:'7000',title:'Dot thu nghiem',stocktake_id:'8300',inspection:{id:'8300',version:2}},'startInspection'));
        assert.equal(await page.locator('#simulate-early-start').isChecked(),false);
        assert.equal(await page.locator('#data-form .form-actions .simulation-toggle').count(),1);
        if(simulated)await page.locator('#simulate-early-start').check();
        const saveStart=await capture(page,'quality-campaigns/8300/start');
        const startBody=await saveStart();assert.equal(startBody.simulate_early_start,simulated);assert.equal(startBody.version,2);
      }
      assert.deepEqual(errors,[]);await context.close();
    }
    {
      const {context,page,errors,material}=await pageFor('planner','business-plans');
      const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'});
      await mock(page,'lookup/production-reports',[{id:'8801',code:'BC-NHU-CAU-UI',status:'SUBMITTED',production_plan_id:'8802',report_purpose:'NHU_CAU',send_to_planner:true,lines:[{item_id:material.id,item_name:material.name,shortage_quantity:'2.000'}]}]);
      await mock(page,'lookup/production-plans',[{id:'8802',code:'KHSX-UI',status:'APPROVED',end_date:day,latest_delivery_date:day}]);
      await page.evaluate(()=>createForm());
      assert.doesNotMatch(await page.locator('#f-production_report_id').textContent(),/\[object Object\]/);
      assert.match(await page.locator('#f-production_report_id').textContent(),/BC-NHU-CAU-UI/);
      assert.equal(await page.locator('#f-supplier_id').isVisible(),false);
      await page.locator('#purchase-plan-mode').selectOption('REPORT');
      await page.locator('#f-production_report_id').selectOption('8801');
      assert.equal(await page.locator('#f-planned_date').getAttribute('min'),day);
      assert.equal(await page.locator('#f-planned_date').getAttribute('max'),day);
      await page.locator('#f-planned_date').fill(day);
      const submit=await capture(page,'business-plans');const body=await submit();
      assert.equal(body.supplier_id,undefined);assert.equal(body.production_report_id,'8801');
      await page.evaluate(()=>createForm());
      assert.equal(await page.locator('#purchase-plan-mode').inputValue(),'MANUAL');
      assert.equal(await page.locator('#f-production_report_id').isVisible(),false);
      await page.locator('#purchase-plan-mode').selectOption('REPORT');
      await page.locator('#f-production_report_id').selectOption('8801');
      await page.locator('#purchase-plan-mode').selectOption('MANUAL');
      assert.equal(await page.locator('#f-production_report_id').inputValue(),'');
      await page.locator('#f-planned_date').fill(day);
      const saveManual=await capture(page,'business-plans'); const manual=await saveManual();
      assert.equal(manual.production_report_id,undefined);
      assert.equal(manual.production_plan_id,undefined);
      const reportPath=require('../src/config/navigation').modules.find(m=>m[0]==='production-reports')[5];
      await page.goto(base+reportPath+'?module=production-reports');
      await page.evaluate(()=>detail({id:'8801',code:'BC-NHU-CAU-UI',status:'SUBMITTED',report_purpose:'NHU_CAU',send_to_planner:true,actions:[]}));
      await page.getByRole('button',{name:'Tạo kế hoạch mua nguyên vật liệu',exact:true}).click();
      await page.waitForURL(url=>url.searchParams.get('module')==='business-plans');
      await page.waitForFunction(()=>document.querySelector('#f-production_report_id')?.value==='8801');
      assert.equal(await page.locator('#purchase-plan-mode').inputValue(),'REPORT');
      assert.equal(await page.locator('#lines-rows [data-key="quantity"]').inputValue(),'2');
      assert.deepEqual(errors,[]);await context.close();
    }
    {
      const { context, page, errors, finished, material } = await pageFor(
        "planner",
        "production-plans",
      );
      await mock(page, "lookup/customer-orders", [
        { id: "901", name: "ORDER-UI", status: "RECEIVED" },
        { id: "902", name: "ORDER-NEW", status: "RECEIVED" },
      ]);
      await page.route(
        "**/api/v1/source-imports/production-plans?*",
        async (r) => {
          const id = new URL(r.request().url()).searchParams.get("source_id");
          if (id === "901")
            await new Promise((resolve) => setTimeout(resolve, 250));
          return r.fulfill({
            json: {
              data: {
                source_code: "ORDER-" + id,
                outputs: [
                  {
                    item_id: finished.id,
                    quantity: id === "901" ? "2" : "3",
                  },
                ],
                warnings: [],
              },
            },
          });
        },
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-customer_order_id").selectOption("901");
      await page.locator("#f-customer_order_id").selectOption("902");
      await page.waitForFunction(
        () =>
          document.querySelector("[data-section=outputs] [data-key=quantity]")
            ?.value === "3",
      );
      await page.waitForTimeout(350);
      assert.equal(
        await page
          .locator("[data-section=outputs] [data-key=quantity]")
          .inputValue(),
        "3",
      );
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, material } = await pageFor(
        "workshop",
        "production-reports",
      );
      await mock(page, "lookup/production-plans", [
        { id: "901", code: "PLAN-UI", status: "APPROVED" },
      ]);
      await page.route("**/api/v1/source-imports/production-reports?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "PLAN-UI",
              lines: [{ item_id: material.id, required_quantity: "5.5" }],
              warnings: ["No second reserve"],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-report_purpose").selectOption("NHU_CAU");
      await page.locator("#f-production_plan_id").selectOption("901");
      await page.waitForFunction(
        () =>
          document.querySelector("[data-key=required_quantity]")?.value ===
          "5.5",
      );
      await page.locator("#f-report_purpose").selectOption("SU_CO");
      assert.equal(
        await page.locator("[data-key=required_quantity]").count(),
        0,
      );
      assert.equal(
        await page.locator("#f-send_to_planner").inputValue(),
        "false",
      );
      await page.locator("#f-note").fill("Packaging machine stopped");
      await page.locator("#f-progress_percentage").fill("35.50");
      const submit = await capture(page, "production-reports");
      const body = await submit();
      assert.equal(body.report_purpose, "SU_CO");
      assert.equal(body.send_to_planner, false);
      assert.equal(body.lines, undefined);
      assert.equal(body.progress_percentage, "35.50");
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors, material } = await pageFor(
        "purchaser",
        "purchase-orders",
      );
      await mock(page, "source-imports/purchase-report-options", [
        { id: "901", name: "REPORT-UI" },
      ]);
      await mock(page, "lookup/business-plans", [
        { id: "902", code: "BUY-UI", type: "PURCHASE" },
      ]);
      await mock(page, "business-plans/902", {
        id: "902",
        code: "BUY-UI",
        planned_date: new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}),
        lines: [
          {
            id: "903",
            item_id: material.id,
            item_name: "Flour",
            quantity: "2",
            unit_price: "10",
          },
        ],
      });
      await page.route("**/api/v1/source-imports/purchase-orders?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "REPORT-UI",
              lines: [
                { item_id: material.id, quantity: "3", unit_price: "0" },
              ],
              warnings: [],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      assert.deepEqual(await page.locator('#f-source_mode option').evaluateAll(opts=>opts.map(o=>o.value)),['PLAN']);
      await page.locator('#f-source_mode').selectOption('PLAN');
      await page.locator('#f-business_plan_id').selectOption('902');
      await page.waitForFunction(()=>document.querySelector('[data-key=unit_price]')?.value==='10');
      assert.equal(await page.locator('[data-key=item_id]').inputValue(),material.id);
      assert.equal(await page.locator('[data-key=business_plan_line_id]').inputValue(),'903');
      assert.equal(await page.locator('#f-expected_delivery_date').evaluate(el=>el.readOnly),true);
      assert.equal(await page.locator('[data-key=quantity]').evaluate(el=>el.readOnly),true);
      assert.equal(await page.locator('[data-key=item_id]').isDisabled(),true);
      const suppliers = (await page.evaluate(()=>api("lookup/suppliers"))).data;
      await page.evaluate(()=>createForm());
      await page.locator('#f-source_mode').selectOption('PLAN');
      await page.locator('#f-business_plan_id').selectOption('902');
      await page.waitForFunction(()=>document.querySelector('[data-key=business_plan_line_id]')?.value==='903');
      await page.locator('[data-key=supplier_id]').selectOption(suppliers[0].id);
      await page.locator('#f-delivery_terms').fill('Plan buying');
      const submitPlan=await capture(page,'purchase-orders');const planPayload=await submitPlan();
      assert.equal(planPayload.source_mode,'PLAN');assert.equal(planPayload.lines[0].supplier_id,suppliers[0].id);
      assert.equal(planPayload.lines[0].business_plan_line_id,'903');
      assert.equal(planPayload.expected_delivery_date,new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}));
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const { context, page, errors } = await pageFor("manager", "lots");
      await mock(page, "lookup/purchase-order-lines", [
        { id: "902", purchase_order_id: "901", name: "BUY-UI / Flour" },
      ]);
      await page.route("**/api/v1/source-imports/lots?*", (r) =>
        r.fulfill({
          json: {
            data: {
              source_code: "BUY-UI",
              lines: [
                { item_id: "902", quantity: "2", item_name: "Flour", supplier_id:"901", supplier_name:"NCC-UI" },
              ],
              warnings: [],
            },
          },
        }),
      );
      await page.evaluate(() => createForm());
      await page.locator("#f-purchase_order_id").selectOption("901");
      await page.waitForFunction(
        () => document.querySelector("[data-key=quantity]")?.value === "2",
      );
      await page.locator("#f-code").fill("LOT-UI");
      const submit = await capture(page, "lots");
      const body = await submit();
      assert.equal(body.lines[0].purchase_order_line_id, "902");
      assert.equal(body.lines[0].received_quantity, "2");
      assert.equal(body.purchase_order_id, undefined);
      assert.deepEqual(errors, []);
      await context.close();
    }
    // Four stock-request branches are covered by warehouse-request-workflow.cjs.
    {
      const { context, page, errors, finished, material } = await pageFor(
        "workshop",
        "finished-reports",
      );
      await mock(page,'production-plans/9901',{id:'9901',outputs:[{item_id:finished.id,quantity:'100.000'}]});
      await mock(page, "lookup/production-plans", [
        { id: "9901", code: "PARTIAL-PLAN", status: "APPROVED" },
      ]);
      await mock(page, "source-imports/finished-reports?*", {
        source_code: "PARTIAL-PLAN",
        production_plan_id: "9901",
        outputs: [
          {
            item_id: finished.id,
            lot_code: "TP-DOT-9902",
            quantity: "0.75",
            manufactured_date: "2026-10-13",
            expiry_date: null,
          },
        ],
        warnings: ["Keep existing batches"],
      });
      await page.locator("#create").click();
      await page.locator("#f-production_plan_id").selectOption("9901");
      await page.locator('#outputs-rows [data-key="lot_code"]').waitFor();
      assert.match(await page.locator('#outputs-rows [data-key="lot_code"]').inputValue(),/^TP-PHAN-/);
      await page.locator('#outputs-rows [data-key="lot_code"]').fill('TP-PHAN-9902');
      await page.locator('#outputs-rows [data-key="quantity"]').fill('50');
      assert.equal(await page.locator('#outputs-rows [data-remaining]').inputValue(),'50');
      await page.locator('#part-final').check();
      assert.equal(await page.locator('#outputs-rows [data-key="quantity"]').inputValue(),'100');
      assert.equal(await page.locator('#outputs-rows [data-remaining]').inputValue(),'0');
      await page.locator('#outputs-rows [data-key="quantity"]').fill('40');
      assert.equal(await page.locator('#part-final').isChecked(),false);
      assert.equal(await page.locator('#outputs-rows [data-remaining]').inputValue(),'60');
      await page.locator('#f-completed_date').fill(new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}));
      let body;
      await page.route("**/api/v1/finished-reports", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: { id: "9903" } }),
        });
      });
      await page.locator("#data-form button[type=submit]").click();
      await page.waitForFunction(() => !document.querySelector("#modal").open);
      assert.equal(body.production_completed, false);
      assert.equal(body.report_mode,'PART');
      assert.equal(body.outputs[0].lot_code, "TP-PHAN-9902");
      assert.deepEqual(body.materials, []);
      await mock(page,'production-plans/9901',{id:'9901',outputs:[{item_id:finished.id,quantity:'100.000'}],finished_report_progress:{reported_outputs:[{item_id:finished.id,quantity:'40.000'}],issued_materials:[{item_id:material.id,quantity:'5000.000'}],reported_materials:[{item_id:material.id,quantity:'1000.000'}]}});
      await page.evaluate(()=>createForm());await page.locator('#f-production_plan_id').selectOption('9901');
      await page.locator('#outputs-rows [data-remaining]').waitFor();
      assert.equal(await page.locator('#outputs-rows [data-remaining]').inputValue(),'60');
      await page.locator('#outputs-rows [data-key="quantity"]').fill('60');
      assert.equal(await page.locator('#part-final').isChecked(),true);
      assert.equal(await page.locator('#materials-rows [data-key="used_quantity"]').inputValue(),'4000');
      await page.locator('#materials-rows [data-key="used_quantity"]').fill('3900');
      assert.equal(await page.locator('#materials-rows [data-material-rest]').inputValue(),'100');
      const saveFinal=await capture(page,'finished-reports');const finalBody=await saveFinal();
      assert.equal(finalBody.production_completed,true);assert.equal(finalBody.outputs[0].quantity,'60');assert.equal(finalBody.materials[0].used_quantity,'3900');
      const extra={id:'999001',name:'Banh thu hai',kind:'FINISHED_PRODUCT',unit:'hop'};
      await mock(page,'lookup/items',[finished,material,extra]);
      await mock(page,'production-plans/9901',{id:'9901',outputs:[{item_id:finished.id,quantity:'100.000'},{item_id:extra.id,quantity:'2.250'}],finished_report_progress:{reported_outputs:[{item_id:finished.id,quantity:'40.000'},{item_id:extra.id,quantity:'0.250'}],issued_materials:[],reported_materials:[]}});
      await page.evaluate(()=>createForm());await page.locator('#f-production_plan_id').selectOption('9901');
      await page.locator('#outputs-rows [data-remaining]').first().waitFor();
      assert.equal(await page.locator('#outputs-rows .line-row').count(),2);
      await page.locator('#outputs-rows [data-key="quantity"]').first().fill('60');
      assert.equal(await page.locator('#part-final').isChecked(),false);
      await page.locator('#part-final').check();
      assert.equal(await page.locator('#outputs-rows [data-key="quantity"]').nth(1).inputValue(),'2');
      assert.equal(await page.locator('#outputs-rows [data-remaining]').nth(1).inputValue(),'0');
      await page.locator('#outputs-rows [data-key="quantity"]').nth(1).fill('1.999');
      assert.equal(await page.locator('#part-final').isChecked(),false);
      assert.equal(await page.locator('#outputs-rows [data-remaining]').nth(1).inputValue(),'0,001');
      assert.deepEqual(errors, []);
      await context.close();
    }
    {
      const {context,page,errors}=await pageFor('qc','qc-inspections');
      const qcId=await page.evaluate(()=>String(user.id));
      await mock(page,'stocktakes',[{id:'8400',campaign_type:'QUALITY_CHECK',status:'IN_PROGRESS'}]);
      await mock(page,'quality-campaigns?per_page=100&status=IN_PROGRESS',[
        {id:'8400',campaign_type:'QUALITY_CHECK',status:'IN_PROGRESS'},
        {id:'8401',code:'DOT-QC-8401',location:'Khu QC',campaign_type:'QUALITY_CHECK',status:'IN_PROGRESS',assignee_ids:[qcId],lot_ids:['8402'],KiemChatLuong:1},
      ]);
      await mock(page,'lookup/lots',[{id:'8402',name:'NVL test',received_quantity:'10.000',qc_status:'PENDING'}]);
      await page.evaluate(()=>createForm());
      assert.equal(await page.locator('#f-campaign_id').inputValue(),'8401');
      assert.equal(await page.locator('#f-lot_id').inputValue(),'8402');
      await page.locator('#f-inspected_quantity').fill('10');await page.locator('#f-passed_quantity').fill('10');
      const saveQC=await capture(page,'qc-inspections');const body=await saveQC();
      assert.equal(body.campaign_id,'8401');assert.equal(body.lines[0].lot_id,'8402');
      await mock(page,'stocktakes?per_page=100',[]);
      await mock(page,'quality-campaigns?per_page=100',[{id:'8401',code:'DOT-QC-8401',status:'COMPLETED',assignee_ids:[qcId],NguoiLapBienBanDuocChon:qcId,BienBanKetLuan:null}]);
      const minutesPath=require('../src/config/navigation').modules.find(m=>m[0]==='stocktake-minutes')[5];
      await page.goto(base+minutesPath);await page.evaluate(()=>createForm());
      assert.equal(await page.locator('#f-stocktake_id').inputValue(),'LOT-8401');
      assert.equal(await page.locator('#f-warehouse_id').isVisible(),false);
      await page.locator('#f-remarks').fill('Da kiem tra chat luong, lo dat yeu cau');
      assert.equal(await page.locator('#f-exception_description').isVisible(),false);
      await page.locator('#f-exception_mode').selectOption('DESCRIBE');
      assert.equal(await page.locator('#f-exception_description').isVisible(),true);
      assert.equal(await page.locator('#f-exception_description').getAttribute('required'),'');
      await page.locator('#f-exception_description').fill('Bao bi bi loi, can quan ly xu ly');
      const saveMinute=await capture(page,'stocktake-minutes');const minuteBody=await saveMinute();
      assert.equal(minuteBody.inspection_campaign_id,'8401');assert.equal(minuteBody.warehouse_id,undefined);
      assert.equal(minuteBody.exception_mode,'DESCRIBE');assert.equal(minuteBody.exception_description,'Bao bi bi loi, can quan ly xu ly');
      assert.equal(await page.evaluate(()=>available().some(m=>m[0]==='exception-proposals')),false);
      assert.deepEqual(errors,[]);await context.close();
    }
    {
      const {context,page,errors}=await pageFor('manager','exception-proposals');
      const record={id:'LOT-8401',version:2,status:'OPEN',reason:'Bao bi loi',resolution_note:'',eligible_workshops:[{id:'1',name:'Xuong banh'}]};
      await page.evaluate(r=>actionForm(r,'handleMinuteException'),record);
      await page.locator('#f-resolution_note').fill('Thay nhan bao bi');
      const saveSimple=await capture(page,'exception-proposals/LOT-8401/apply');const simple=await saveSimple();assert.equal(simple.request_approval,false);
      await page.evaluate(r=>actionForm(r,'handleMinuteException'),record);
      await page.locator('#f-resolution_note').fill('De xuat thay bao bi');await page.locator('#request-owner-approval').check();await page.locator('#f-workshop_id').selectOption('1');
      const saveProposal=await capture(page,'exception-proposals/LOT-8401/apply');const proposal=await saveProposal();assert.equal(proposal.request_approval,true);assert.equal(proposal.workshop_id,'1');
      await page.evaluate(r=>actionForm(r,'handleMinuteException'),{...record,status:'REJECTED',owner_instruction:'Kiem tra may dong goi truoc'});
      assert.equal(await page.locator('#f-resolution_note').inputValue(),'Kiem tra may dong goi truoc');assert.equal(await page.locator('#f-resolution_note').getAttribute('readonly'),'');
      assert.equal(await page.locator('#request-owner-approval').isDisabled(),true);
      assert.deepEqual(errors,[]);await context.close();
    }
    {
      const {context,page,errors}=await pageFor('workshop','exception-proposals');
      await page.evaluate(()=>actionForm({id:'LOT-8401',version:3,reason:'Bao bi loi',resolution_note:'Thay bao bi'},'reviewMinuteException'));
      await page.locator('#f-decision').selectOption('REJECT');assert.equal(await page.locator('#f-reason').getAttribute('required'),'');
      await page.locator('#f-reason').fill('Kiem tra may dong goi truoc');
      const saveReview=await capture(page,'exception-proposals/LOT-8401/review');const review=await saveReview();assert.equal(review.decision,'REJECT');assert.equal(review.reason,'Kiem tra may dong goi truoc');
      assert.deepEqual(errors,[]);await context.close();
    }
    console.log(
      "SOURCE IMPORT BROWSER PASS: order/plan/report imports, stale response, purchase mode reset, receipt source and two dispatch purposes; writes mocked",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
