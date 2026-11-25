// Dữ liệu cho từng UC. Mỗi UC có chừng 3 bản ghi riêng: làm thành công, làm nhánh lỗi/hủy, dự phòng.
// add() ghi lại mã các bản ghi để sinh bảng hướng dẫn docs/DU_LIEU_TEST_MAC_DINH.md.
const F = require("./flows.cjs");
const { api, item, user, warehouse } = F;

const guide = [];
// Công việc / đợt kiểm kê: ghi cả tiêu đề lẫn mã đợt vì mỗi màn hình hiện một kiểu.
function code(record) {
  if (record.title) return record.inspection ? `${record.title} (${record.inspection.code})` : record.title;
  return record.display_code || record.code;
}
function add(uc, name, account, screen, how, records) {
  guide.push({ uc, name, account, screen, how, records: records.map((r) => (typeof r === "string" ? r : code(r))) });
}
async function times(count, build) {
  const rows = [];
  for (let n = 1; n <= count; n++) rows.push(await build(n));
  return rows;
}
const step = (text) => console.log(new Date().toISOString().slice(11, 19), text);

// ------------------------------------------------------------- tồn kho và lịch sử
/** Tồn nguyên vật liệu lớn, hạn dùng dài: mọi UC xuất kho đều đủ hàng, không tranh nhau. */
async function openingStock() {
  step("Tồn kho nguyên vật liệu");
  const MATERIALS = ["NVL-001", "NVL-002", "NVL-003", "PK-001", "BB-002", "BB-TUI", "BB-DE", "NL-MEN", "NL-SUA-01", "NL-KEM", "NL-NHAN-02", "NL-NHAN-03"];
  for (const round of [1, 2]) {
    const stock = await F.checkedMaterial("Tồn kho đầu kỳ đợt " + round, MATERIALS.map((product) => ({ product, quantity: "500" })));
    const request = await F.stockRequest("Nhập tồn kho đầu kỳ đợt " + round, "PURCHASE_RECEIPT", "ORDER:" + stock.purchase.id);
    await F.fullyPosted(request);
  }
}
/** Các đơn đã giao xong, rải trong một tháng trước: có số liệu cho báo cáo, hồ sơ nhập/xuất, tra cứu. */
async function history(backdate) {
  const PRODUCTS = ["TP-001", "TP-003", "TP-004", "TP-CUPCAKE", "TP-MI-02", "TP-001"];
  const documents = [];
  for (const [index, days] of [28, 21, 14, 10, 6, 3].entries()) {
    step("Lịch sử giao hàng " + days + " ngày trước");
    await backdate(days, async () => {
      const note = "Đơn đã giao (lịch sử)";
      const plan = { product: PRODUCTS[index], quantity: String(10 + index * 5) };
      const sold = await F.delivered(note, plan);
      documents.push(sold.document, sold.deliveryDocument);
    });
  }
  return documents;
}

// --------------------------------------------------------------------- khách hàng
async function customerOrders() {
  step("UC-29, UC-03.1");
  add("UC-29", "Tiếp nhận đơn hàng", "planner", "Đơn hàng", "Mở đơn Chờ tiếp nhận rồi bấm Tiếp nhận. Đơn cuối có nhiều mặt hàng.", [
    await F.order("[UC-29] Đơn chờ tiếp nhận 1"),
    await F.order("[UC-29] Đơn chờ tiếp nhận 2", { product: "TP-003", quantity: "25" }),
    await F.order("[UC-29] Đơn nhiều mặt hàng", { lines: [{ item_id: item("TP-001"), quantity: "20" }, { item_id: item("TP-004"), quantity: "30" }, { item_id: item("TP-KEM-01"), quantity: "5" }] }),
  ]);
  const rejected = await F.receivedOrder("[UC-03] Đơn đã tiếp nhận");
  add("UC-03", "Quản lý đơn hàng khách hàng", "customer", "Đơn hàng", "Danh sách có đơn ở mọi trạng thái: chờ tiếp nhận, đã tiếp nhận, đã duyệt, đang làm, đã giao.", [rejected]);
  add("UC-03.1", "Sửa đơn hàng khách hàng", "customer", "Đơn hàng", "Hai đơn chờ tiếp nhận sửa được; đơn thứ ba đã tiếp nhận; đơn cuối đã duyệt nên không còn nút sửa.", [
    await F.order("[UC-03.1] Đơn để sửa 1"),
    await F.order("[UC-03.1] Đơn để sửa 2", { product: "TP-004", quantity: "40" }),
    await F.receivedOrder("[UC-03.1] Đơn đã tiếp nhận"),
    (await F.approvedPlan("[UC-03.1] Đơn đã duyệt, không sửa được")).order,
  ]);
}

// ---------------------------------------------------------------------- kế hoạch
async function plans() {
  step("UC-04 nguồn lập kế hoạch");
  add("UC-04", "Lập kế hoạch sản xuất", "planner", "Kế hoạch sản xuất", "Tạo mới, chọn đơn đã tiếp nhận.", await times(3, (n) => F.receivedOrder(`[UC-04] Đơn chờ lập KHSX ${n}`, { product: ["TP-001", "TP-003", "TP-004"][n - 1] })));
  add("UC-04", "Lập kế hoạch mua", "planner", "Kế hoạch mua / bán", "Tạo mới → Mua, chọn báo cáo thiếu nguyên vật liệu.", await times(3, async (n) => {
    const source = await F.approvedPlan(`[UC-04] KHSX thiếu NVL ${n}`);
    return F.productionReport(`[UC-04] Thiếu nguyên vật liệu ${n}`, source.plan);
  }));
  add("UC-04", "Lập kế hoạch bán", "planner", "Kế hoạch mua / bán", "Tạo mới → Bán, chọn báo cáo thành phẩm (hàng đã nhập kho).", await times(3, async (n) => (await F.stockedProduct(`[UC-04] Thành phẩm chờ bán ${n}`)).report));

  step("UC-05");
  add("UC-05 / 05.1", "Sửa kế hoạch", "planner", "Kế hoạch mua / bán", "Kế hoạch đang chờ duyệt: hai kế hoạch mua, một kế hoạch bán.", [
    await F.purchasePlan("[UC-05.1] Kế hoạch mua để sửa 1"),
    await F.purchasePlan("[UC-05.1] Kế hoạch mua để sửa 2", { lines: [{ product: "NVL-001", quantity: "50" }, { product: "NVL-002", quantity: "30", price: "22000" }] }),
    (await F.salePlan("[UC-05.1] Kế hoạch bán để sửa")).sale,
  ]);
  add("UC-05 / 05.2", "Xóa kế hoạch", "planner", "Kế hoạch mua / bán", "Ba kế hoạch chờ duyệt xóa được; kế hoạch cuối đã duyệt nên không còn nút xóa.", [
    await F.purchasePlan("[UC-05.2] Kế hoạch mua để xóa 1"),
    await F.purchasePlan("[UC-05.2] Kế hoạch mua để xóa 2"),
    (await F.salePlan("[UC-05.2] Kế hoạch bán để xóa")).sale,
    await F.purchasePlan("[UC-05.2] Đã duyệt, không xóa được", { approve: true }),
  ]);
  const refused = [];
  for (const n of [1, 2]) {
    const plan = await F.purchasePlan(`[UC-05.1] Kế hoạch bị từ chối ${n}`);
    refused.push(await api.post("director", `business-plans/${plan.id}/review`, { version: plan.version, decision: "REJECT", reason: "Số lượng chưa hợp lý, đề nghị điều chỉnh" }));
  }
  add("UC-05 / 05.1", "Sửa kế hoạch bị từ chối", "planner", "Kế hoạch mua / bán", "Kế hoạch bị ban giám đốc từ chối, sửa rồi gửi lại.", refused);

  step("UC-31, UC-32");
  const drafts = async (label, count) => (await times(count, (n) => F.draftPlan(`${label} ${n}`, { product: ["TP-001", "TP-003", "TP-004"][n - 1] }))).map((x) => x.plan);
  add("UC-05", "Sửa / hủy kế hoạch sản xuất", "planner", "Kế hoạch sản xuất", "KHSX nháp chưa duyệt.", await drafts("[UC-05] KHSX nháp", 2));
  add("UC-31", "Phê duyệt kế hoạch sản xuất", "director", "Kế hoạch sản xuất", "Duyệt hoặc từ chối KHSX đang nháp.", await drafts("[UC-31] KHSX chờ duyệt", 3));
  add("UC-32", "Phê duyệt kế hoạch mua", "director", "Kế hoạch mua / bán", "Duyệt hoặc từ chối (phải nhập lý do).", await times(3, (n) => F.purchasePlan(`[UC-32] Kế hoạch mua chờ duyệt ${n}`, { lines: [{ product: ["NVL-001", "NVL-002", "BB-002"][n - 1], quantity: "40" }] })));
  add("UC-32", "Phê duyệt kế hoạch bán", "director", "Kế hoạch mua / bán", "Duyệt hoặc từ chối (phải nhập lý do).", await times(3, async (n) => (await F.salePlan(`[UC-32] Kế hoạch bán chờ duyệt ${n}`)).sale));
}

// ---------------------------------------------------------------------- mua hàng
async function purchasing() {
  step("UC-27, UC-14");
  add("UC-27", "Mua hàng", "purchaser", "Đơn mua hàng", "Tạo mới, chọn kế hoạch mua đã duyệt; hoặc lập trực tiếp không cần kế hoạch.", [
    await F.purchasePlan("[UC-27] Kế hoạch mua đã duyệt 1", { approve: true }),
    await F.purchasePlan("[UC-27] Kế hoạch mua đã duyệt 2", { approve: true, lines: [{ product: "NVL-001", quantity: "60" }, { product: "NVL-003", quantity: "15", price: "180000" }, { product: "BB-002", quantity: "100", price: "5000" }] }),
    await F.purchasePlan("[UC-27] Kế hoạch mua đã duyệt 3", { approve: true, lines: [{ product: "NVL-002", quantity: "25", price: "22000" }] }),
  ]);
  const partial = await F.purchaseOrder("[UC-14] Đã nhận một phần", [{ product: "NVL-001", quantity: "30" }]);
  await F.receiveLots(partial, { [partial.lines[0].id]: "10" });
  add("UC-14", "Xem/Quản lý đơn hàng mua", "purchaser", "Đơn mua hàng", "Đơn chưa nhận, đơn nhận một phần và các đơn đã nhận đủ (tồn kho đầu kỳ).", [
    await F.purchaseOrder("[UC-14] Đơn mua chưa nhận 1", undefined, 150),
    await F.purchaseOrder("[UC-14] Đơn mua chưa nhận 2", [{ product: "NVL-002", quantity: "40" }, { product: "NVL-001", quantity: "40" }], 150),
    partial,
  ]);
  add("UC-07.1", "Ghi nhận lô hàng", "manager", "Lô hàng", "Tạo mới, chọn đơn mua đang chờ nhận.", await times(3, (n) => F.purchaseOrder(`[UC-07.1] Đơn mua chờ ghi nhận lô ${n}`, [{ product: ["NVL-001", "NVL-002", "NVL-003"][n - 1], quantity: "20" }], 150)));
}

// --------------------------------------------------------------------- báo cáo SX
async function workshopReports() {
  step("UC-34, UC-35");
  const ready = (label) => times(3, async (n) => (await F.approvedPlan(`${label} ${n}`, { product: ["TP-001", "TP-003", "TP-004"][n - 1] })).plan);
  add("UC-34", "Lập phiếu báo cáo sản xuất", "workshop", "Báo cáo sản xuất", "Tạo mới, chọn KHSX đã duyệt chưa có báo cáo.", await ready("[UC-34] KHSX chờ báo cáo"));
  const draftSource = await F.approvedPlan("[UC-34] KHSX có báo cáo nháp");
  add("UC-34", "Báo cáo sản xuất đang nháp", "workshop", "Báo cáo sản xuất", "Sửa hoặc gửi báo cáo nháp.", [await F.productionReport("[UC-34] Báo cáo nháp", draftSource.plan, { purpose: "TIEN_DO", submit: false })]);
  add("UC-35", "Báo cáo thành phẩm", "workshop", "Báo cáo thành phẩm", "Tạo mới, chọn KHSX đã được cấp nguyên vật liệu.", await times(3, async (n) => (await F.issuedPlan(`[UC-35] KHSX đã cấp NVL ${n}`, { product: ["TP-001", "TP-003", "TP-004"][n - 1] })).plan));
  const draft = await F.approvedPlan("[UC-35] KHSX có báo cáo thành phẩm nháp");
  add("UC-35", "Báo cáo thành phẩm đang nháp", "workshop", "Báo cáo thành phẩm", "Sửa hoặc gửi báo cáo nháp.", [await F.finishedReport("[UC-35] Báo cáo nháp", draft.plan, { submit: false })]);
}

// ----------------------------------------------------------------- công việc, kiểm kê
async function tasks() {
  step("UC-25");
  const general = (title) => api.post("director", "tasks", { title, description: "Việc chưa tới giờ bắt đầu", priority: "NORMAL", ...F.slot(130), assignee_ids: [user("stocktaker"), user("qc")] });
  const inspectionTask = async (title) => {
    const source = await F.approvedPlan(title);
    const report = await F.finishedReport(title, source.plan, { completed: false, quantity: "5" });
    return F.inspection(title, { reports: [report], assignees: ["qc2", "stocktaker2"], start: false });
  };
  const edit = [await general("[UC-25.1] Công việc để sửa 1"), await general("[UC-25.1] Công việc để sửa 2"), await inspectionTask("[UC-25.1] Đợt kiểm tra để sửa")];
  const remove = [await general("[UC-25.2] Công việc để xóa 1"), await general("[UC-25.2] Công việc để xóa 2"), await inspectionTask("[UC-25.2] Đợt kiểm tra để xóa")];
  let underway = await general("[UC-25.2] Đang thực hiện, không xóa được");
  underway = await api.post("stocktaker", `tasks/${underway.id}/progress`, { version: underway.version, status: "IN_PROGRESS" });
  add("UC-25", "Quản lý công việc", "director", "Quản lý công việc", "Xem danh sách, lọc theo trạng thái, mở chi tiết.", ["Toàn bộ công việc trong danh sách"]);
  add("UC-25.1", "Chỉnh sửa công việc", "director", "Quản lý công việc", "Giờ bắt đầu còn hơn 3 tháng nữa nên luôn sửa được.", edit);
  add("UC-25.2", "Xóa công việc", "director", "Quản lý công việc", "Ba việc đầu xóa được; việc cuối đang thực hiện nên hệ thống không cho xóa.", [...remove, underway]);
}
async function inspections() {
  step("UC-13");
  const waiting = [];
  for (const n of [1, 2]) {
    const source = await F.approvedPlan(`[UC-13] KHSX có thành phẩm chờ kiểm ${n}`, { quantity: "30" });
    const parts = [];
    for (const part of [1, 2, 3]) parts.push(await F.finishedReport(`[UC-13] Phần ${part}`, source.plan, { completed: false, quantity: "10" }));
    waiting.push(...parts);
  }
  add("UC-13", "Lập đợt kiểm kê thành phẩm", "director", "Lập đợt kiểm kê", "Hai lô thành phẩm, mỗi lô 3 phần chưa ai kiểm.", waiting.map((r) => `${code(r)} (lô ${r.outputs[0].lot_header_code})`));
  const materials = await times(2, async (n) => {
    const purchase = await F.purchaseOrder(`[UC-13] Đơn mua trực tiếp ${n}`, [{ product: "NVL-001", quantity: "30" }, { product: "NVL-002", quantity: "20" }]);
    await F.receiveLots(purchase);
    return purchase;
  });
  const planned = await F.purchasePlan("[UC-13] Kế hoạch mua chưa về hàng", { approve: true, planned: 90 });
  await F.purchaseOrderFromPlan("[UC-13]", planned);
  add("UC-13", "Lập đợt kiểm kê nguyên vật liệu", "director", "Lập đợt kiểm kê", "Hai đơn mua đã có lô; kế hoạch mua chưa về hàng (lập trước theo dự kiến).", [...materials, planned]);

  step("UC-12");
  const product = async (title, options) => {
    const source = await F.approvedPlan(title, options);
    return F.inspection(title, { reports: [await F.finishedReport(title, source.plan, { completed: false })], assignees: ["qc"] });
  };
  const material = async (title) => {
    const purchase = await F.purchaseOrder(title, [{ product: "NVL-001", quantity: "20" }]);
    const lots = await F.receiveLots(purchase);
    return F.inspection(title, { purchase, lotIds: lots.map((l) => l.id), assignees: ["qc"] });
  };
  const byPlan = async (title, assignees) => {
    const plan = await F.purchasePlan(title, { approve: true, planned: 90 });
    await F.purchaseOrderFromPlan(title, plan);
    return F.inspection(title, { purchasePlanId: plan.id, assignees });
  };
  add("UC-12 / 12.1", "Thêm kết quả QC/AC", "qc", "Kiểm tra QA / QC", "Đợt đang mở, lô chưa có kết quả.", [await product("[UC-12.1] Thành phẩm chờ QC 1"), await product("[UC-12.1] Thành phẩm chờ QC 2", { product: "TP-003" }), await material("[UC-12.1] Nguyên vật liệu chờ QC"), await byPlan("[UC-12.1] Thực kiểm theo kế hoạch mua", ["qc"])]);
  const results = async (label) => {
    const rows = [];
    for (const n of [1, 2]) rows.push(await F.recordQuality(`${label} ${n}`, await product(`${label} thành phẩm ${n}`), { failed: n === 2 ? 2 : 0 }));
    rows.push(await F.recordQuality(`${label} 3`, await material(`${label} nguyên vật liệu`)));
    return rows;
  };
  add("UC-12 / 12.2", "Sửa kết quả QC/AC", "qc", "Kiểm tra QA / QC", "Kết quả chưa lập biên bản, lô chưa nhập kho.", await results("[UC-12.2] Kết quả để sửa"));
  add("UC-12 / 12.3", "Xóa kết quả QC/AC", "qc", "Kiểm tra QA / QC", "Kết quả chưa lập biên bản, lô chưa nhập kho.", await results("[UC-12.3] Kết quả để xóa"));

  step("UC-15, UC-28");
  const counting = async (title, assignees = ["stocktaker"]) => {
    const source = await F.approvedPlan(title);
    return F.inspection(title, { reports: [await F.finishedReport(title, source.plan, { completed: false })], assignees, author: assignees[0] });
  };
  add("UC-15", "Thực hiện kiểm kê", "stocktaker", "Quản lý kiểm kê", "Đợt đang mở, chưa nhập số đếm.", [await counting("[UC-15] Đợt chờ đếm 1"), await counting("[UC-15] Đợt chờ đếm 2"), await counting("[UC-15] Đợt đếm và QC cùng làm", ["stocktaker", "qc"])]);
  const finished = async (title, { shortage = 0, failed = 0 } = {}) => {
    const task = await counting(title, ["stocktaker", "qc"]);
    await F.recordCount(task, { shortage });
    await F.recordQuality(title, task, { failed });
    return api.get("director", "tasks/" + task.id);
  };
  const stocktakerMinutes = [await finished("[UC-28] Đợt đủ số, chờ lập biên bản"), await finished("[UC-28] Đợt thiếu hàng, chờ lập biên bản", { shortage: 1 }), await finished("[UC-28] Đợt có hàng lỗi, chờ lập biên bản", { failed: 2 })];
  add("UC-28", "Lập biên bản kiểm kê", "stocktaker", "Biên bản kiểm kê", "Tạo mới, chọn đợt đã hoàn thành được giao lập biên bản.", stocktakerMinutes);
  const draftTask = await finished("[UC-28] Đợt có biên bản nháp");
  add("UC-28", "Biên bản đang lưu tạm", "stocktaker", "Biên bản kiểm kê", "Sửa hoặc gửi biên bản nháp.", [await F.minutes(draftTask, "Biên bản lưu tạm", { author: "stocktaker", submit: false })]);
  add("UC-28", "Đợt chưa hoàn thành", "stocktaker", "Biên bản kiểm kê", "Đợt còn chưa đếm xong nên chưa lập được biên bản.", [await counting("[UC-28] Đợt chưa hoàn thành")]);

  step("UC-16, UC-17, UC-21");
  const exception = async (title, options) => {
    const task = await finished(title, options);
    return F.minutes(task, "Biên bản " + title, { author: "stocktaker", exception: title.replace(/^\[.*?\] /, "") });
  };
  const open = [await exception("[UC-16] Thiếu 1 hộp so với báo cáo", { shortage: 1 }), await exception("[UC-16] Hai hộp bao bì rách", { failed: 2 }), await exception("[UC-16] Thiếu 2 hộp khi đếm", { shortage: 2 })];
  add("Kế hoạch bù", "Lập kế hoạch bù từ biên bản thiếu hàng", "planner", "Kế hoạch sản xuất", "Tạo mới, nguồn lập kế hoạch chọn biên bản thiếu hàng.", open);
  const exceptionCode = (minute) => "NL-" + minute.source_code;
  add("UC-16", "Xử lý chênh lệch kiểm kê", "manager", "Xử lý ngoại lệ", "Ngoại lệ chờ quản lý xử lý: tự xử lý hoặc gửi chủ xưởng duyệt.", open.map(exceptionCode));
  const propose = async (title, options) => {
    const minute = await exception(title, options);
    const row = await api.get("manager", "exception-proposals/" + minute.id);
    return api.post("manager", `exception-proposals/${minute.id}/apply`, {
      version: row.version,
      resolution_note: "Đề nghị sản xuất bù và kiểm tra lại quy trình đóng gói",
      request_approval: true,
      workshop_id: row.source_workshop.id,
    });
  };
  add("UC-17", "Phê duyệt đề xuất xử lý ngoại lệ", "workshop", "Xử lý ngoại lệ", "Đề xuất từ biên bản, đang chờ chủ xưởng duyệt hoặc từ chối.", [await propose("[UC-17] Thiếu hàng chờ duyệt 1", { shortage: 1 }), await propose("[UC-17] Hàng lỗi chờ duyệt 2", { failed: 1 }), await propose("[UC-17] Thiếu hàng chờ duyệt 3", { shortage: 2 })]);
  const review = async (title, decision) => {
    const row = await propose(title, { shortage: 1 });
    return api.post("workshop", `exception-proposals/${row.id}/review`, { version: row.version, decision, reason: decision === "REJECT" ? "Đếm lại rồi lập đề xuất khác" : "Đồng ý" });
  };
  add("UC-16", "Thực hiện phương án đã có ý kiến chủ xưởng", "manager", "Xử lý ngoại lệ", "Một ngoại lệ đã được duyệt, một bị từ chối kèm hướng xử lý của chủ xưởng.", [await review("[UC-16] Đã duyệt, chờ thực hiện", "APPROVE"), await review("[UC-16] Bị từ chối, chờ xử lý lại", "REJECT")]);

  const failures = await times(5, (n) => F.checkedProduct(n <= 3 ? `[UC-17] Thành phẩm QC lỗi ${n}` : `[UC-16] Thành phẩm QC lỗi ${n - 3}`, { failed: 2, completed: false }));
  const scrap = (source, text) => api.post("manager", "exception-proposals", { qc_inspection_line_id: String(source.quality.lines[0].id), action: "SCRAP", quantity: "2", reason: text, resolution_note: "Tiêu hủy phần lỗi sau khi được duyệt" });
  const proposals = [];
  for (const source of failures.slice(0, 3)) proposals.push(await scrap(source, "Bánh vỡ, bao bì rách"));
  add("UC-17", "Phê duyệt đề xuất hàng QC lỗi", "workshop", "Xử lý ngoại lệ", "Đề xuất tiêu hủy hàng lỗi đang chờ duyệt.", proposals);
  add("UC-16", "Lập đề xuất xử lý hàng QC lỗi", "manager", "Xử lý ngoại lệ", "Tạo mới, chọn kết quả QC có hàng lỗi chưa lập đề xuất.", failures.slice(3).map((s) => `${code(s.quality)} (lô ${s.report.outputs[0].lot_code})`));
  await finished("[UC-21] Đợt đã có biên bản 1").then((t) => F.minutes(t, "Đủ số lượng, đạt chất lượng", { author: "stocktaker" }));
  add("UC-21", "Xem báo cáo kiểm kê", "director", "Báo cáo kiểm kê", "Đợt đã đếm, đã có biên bản, đủ số và thiếu số; lọc theo thời gian, xuất CSV.", ["Toàn bộ đợt trong báo cáo"]);
}
/** Kiểm đếm tồn cả kho: dùng kho riêng vì kho đang kiểm kê không được nhập/xuất. */
async function warehouseCounts() {
  step("Kiểm đếm tồn kho (kho riêng)");
  const counted = [];
  for (const [index, stage] of ["PLANNED", "COUNTING", "COMPLETED", "DIFFERENCE", "PROPOSAL", "APPROVED", "CLOSED"].entries()) {
    const label = `[Kiểm đếm] Kho ${index + 1}`;
    const place = await api.post("manager", "warehouses", { code: "KHO-KD-" + (index + 1), name: label, address: "Kho riêng để thử kiểm đếm", is_active: true });
    const spot = await api.post("manager", "warehouse-locations", { warehouse_id: String(place.id), code: "VT-01", name: "Vị trí 1", is_active: true });
    const stock = await F.checkedMaterial(label + " hàng tồn", [{ product: "NVL-001", quantity: "20" }]);
    const request = await F.stockRequest(label + " nhập tồn", "PURCHASE_RECEIPT", "ORDER:" + stock.purchase.id, { warehouseId: String(place.id) });
    await F.fullyPosted(request, { location: String(spot.id) });
    const campaign = await api.post("director", "stocktakes", {
      campaign_type: "COUNT",
      planned_date: F.day(100),
      ...F.slot(),
      note: label,
      warehouses: [{ warehouse_id: String(place.id), assignee_ids: [user("stocktaker")], conclusion_assignee_ids: [user("qc")] }],
    });
    counted.push(campaign);
    if (stage === "PLANNED") continue;
    await api.post("director", `stocktakes/${campaign.id}/start`, { version: campaign.version });
    if (stage === "COUNTING") continue;
    const path = `stocktakes/${campaign.id}/warehouses/${place.id}`;
    const sheet = await api.get("stocktaker", path + "/lines");
    const saved = await api.patch("stocktaker", path + "/counts", { lines: sheet.lines.map((l) => ({ id: l.id, version: l.version, actual_quantity: stage === "CLOSED" ? l.system_quantity : "19" })) });
    await api.post("stocktaker", path + "/complete", { version: saved.version });
    if (stage === "COMPLETED") continue;
    const minute = await api.post("qc", "stocktake-minutes", { stocktake_id: String(campaign.id), warehouse_id: String(place.id), remarks: label + ": biên bản kiểm đếm" });
    await api.post("qc", `stocktake-minutes/${minute.id}/submit`, { version: minute.version });
    if (stage === "CLOSED") {
      const current = await api.get("director", "stocktakes/" + campaign.id);
      await api.post("director", `stocktakes/${campaign.id}/close`, { version: current.version });
      continue;
    }
    if (stage === "DIFFERENCE") continue;
    const [difference] = await api.get("manager", "stocktake-differences?stocktake_id=" + campaign.id);
    const proposal = await api.post("manager", "exception-proposals", { stocktake_id: String(campaign.id), warehouse_id: String(place.id), stocktake_line_id: String(difference.id), reason: "Thiếu 1 kg khi kiểm đếm", resolution_note: "Điều chỉnh tồn theo số thực đếm" });
    if (stage === "APPROVED") await api.post("workshop", `exception-proposals/${proposal.id}/review`, { version: proposal.version, decision: "APPROVE" });
  }
  add("UC-15 / 16 / 17 / 28", "Kiểm đếm tồn cả kho (kho riêng KHO-KD-1 … KHO-KD-7)", "director, stocktaker, qc, manager, workshop", "Lập đợt kiểm kê, Quản lý kiểm kê, Biên bản kiểm kê, Xử lý ngoại lệ", "Lần lượt: chưa bắt đầu, đang đếm, đếm xong chờ biên bản, có chênh lệch chưa xử lý, đề xuất chờ duyệt, đề xuất đã duyệt chờ thực hiện, đã đóng.", counted);
}

// --------------------------------------------------------------- yêu cầu nhập/xuất
async function stockRequests() {
  step("UC-23 nguồn yêu cầu");
  const material = (note) => F.checkedMaterial(note, [{ product: "NVL-001", quantity: "20" }]);
  add("UC-23", "Yêu cầu nhập nguyên vật liệu", "workshop", "Yêu cầu nhập / xuất", "Tạo mới → Nhập nguyên vật liệu, chọn đơn mua trực tiếp.", await times(3, async (n) => (await material(`[UC-23] Nguyên vật liệu đạt QC ${n}`)).purchase));
  add("UC-23", "Yêu cầu nhập thành phẩm", "workshop", "Yêu cầu nhập / xuất", "Tạo mới → Nhập thành phẩm, chọn báo cáo thành phẩm.", await times(3, async (n) => (await F.checkedProduct(`[UC-23] Thành phẩm đạt QC ${n}`)).report));
  add("UC-23", "Yêu cầu xuất nguyên vật liệu", "workshop", "Yêu cầu nhập / xuất", "Tạo mới → Xuất nguyên vật liệu, chọn KHSX.", await times(3, async (n) => (await F.approvedPlan(`[UC-23] KHSX chờ cấp NVL ${n}`)).plan));
  add("UC-23", "Yêu cầu xuất thành phẩm", "workshop", "Yêu cầu nhập / xuất", "Tạo mới → Xuất thành phẩm, chọn KHSX có kế hoạch bán đã duyệt (đã tới ngày giao).", await times(3, async (n) => (await F.salePlan(`[UC-23] Kế hoạch bán đã duyệt ${n}`, { approve: true, dueToday: true })).plan));

  // Mỗi loại yêu cầu một hàm dựng, dùng chung cho các UC bên dưới.
  const build = {
    importMaterial: async (note) => F.stockRequest(note, "PURCHASE_RECEIPT", "ORDER:" + (await material(note)).purchase.id),
    importProduct: async (note) => F.stockRequest(note, "PRODUCTION_RECEIPT", (await F.checkedProduct(note)).report.id),
    exportMaterial: async (note) => F.stockRequest(note, "PRODUCTION_ISSUE", (await F.approvedPlan(note)).plan.id),
    exportProduct: async (note) => F.stockRequest(note, "SALE_ISSUE", (await F.salePlan(note, { approve: true, dueToday: true })).plan.id),
  };
  const four = async (label) => [await build.importMaterial(label + " nhập NVL"), await build.importProduct(label + " nhập thành phẩm"), await build.exportMaterial(label + " xuất NVL"), await build.exportProduct(label + " xuất thành phẩm")];

  step("UC-24");
  const cancelled = await build.importMaterial("[UC-24] Yêu cầu đã hủy");
  await api.remove("workshop", "stock-requests/" + cancelled.id, { version: cancelled.version });
  const partial = await build.exportMaterial("[UC-24] Yêu cầu xử lý một phần");
  await F.postStock(await F.dispatch(partial), 0.5);
  add("UC-24", "Quản lý yêu cầu nhập xuất", "workshop", "Yêu cầu nhập / xuất", "Xem, lọc theo trạng thái. Bên cạnh là yêu cầu đã hủy và yêu cầu xử lý một phần; chờ xử lý và đã xử lý đủ thì có sẵn rất nhiều.", [cancelled, partial]);
  add("UC-24.1", "Sửa yêu cầu", "workshop", "Yêu cầu nhập / xuất", "Yêu cầu chờ xử lý, kho chưa phân công.", await four("[UC-24.1]"));
  add("UC-24.2", "Xóa yêu cầu", "workshop", "Yêu cầu nhập / xuất", "Yêu cầu chờ xử lý, kho chưa phân công.", await four("[UC-24.2]"));

  step("UC-08");
  const dispatched = async (request, options) => { await F.dispatch(request, options); return request; };
  add("UC-08", "Quản lý nhập kho – phân công mới", "manager", "Quản lý nhập kho", "Yêu cầu chờ phân công.", [await build.importMaterial("[UC-08] Nhập NVL chờ phân công 1"), await build.importMaterial("[UC-08] Nhập NVL chờ phân công 2"), await build.importProduct("[UC-08] Nhập thành phẩm chờ phân công 1"), await build.importProduct("[UC-08] Nhập thành phẩm chờ phân công 2")]);
  add("UC-08", "Sửa / hủy phân công nhập", "manager", "Quản lý nhập kho", "Đã phân công, giờ thực hiện còn hơn 3 tháng nên vẫn sửa, hủy được.", [await dispatched(await build.importMaterial("[UC-08] Nhập NVL đã phân công")), await dispatched(await build.importProduct("[UC-08] Nhập thành phẩm đã phân công"))]);
  step("UC-09");
  add("UC-09", "Quản lý xuất kho – phân công mới", "manager", "Quản lý xuất kho", "Yêu cầu chờ phân công, kho đủ hàng.", [await build.exportMaterial("[UC-09] Xuất NVL chờ phân công 1"), await build.exportMaterial("[UC-09] Xuất NVL chờ phân công 2"), await build.exportProduct("[UC-09] Xuất thành phẩm chờ phân công 1"), await build.exportProduct("[UC-09] Xuất thành phẩm chờ phân công 2")]);
  add("UC-09", "Sửa / hủy phân công xuất", "manager", "Quản lý xuất kho", "Đã phân công, giờ thực hiện còn hơn 3 tháng nên vẫn sửa, hủy được.", [await dispatched(await build.exportMaterial("[UC-09] Xuất NVL đã phân công")), await dispatched(await build.exportProduct("[UC-09] Xuất thành phẩm đã phân công"))]);
  step("UC-10, UC-11");
  add("UC-10", "Nhập kho", "staff", "Quản lý nhập kho", "Phiếu đã giao cho nhân viên kho, chưa ghi.", [await dispatched(await build.importMaterial("[UC-10] Nhập NVL 1")), await dispatched(await build.importMaterial("[UC-10] Nhập NVL 2")), await dispatched(await build.importProduct("[UC-10] Nhập thành phẩm 1")), await dispatched(await build.importProduct("[UC-10] Nhập thành phẩm 2"))]);
  add("UC-10", "Nhập kho (nhân viên 2)", "staff2", "Quản lý nhập kho", "Phiếu giao cho nhân viên khác; tài khoản staff không thấy.", [await dispatched(await build.importMaterial("[UC-10] Nhập NVL nhân viên 2"), { assignee: "staff2" })]);
  add("UC-11.01", "Xuất nguyên vật liệu", "staff", "Quản lý xuất kho", "Phiếu đã giao cho nhân viên kho, chưa ghi.", await times(3, async (n) => dispatched(await build.exportMaterial(`[UC-11.01] Xuất NVL ${n}`))));
  add("UC-11.02", "Xuất thành phẩm", "staff", "Quản lý xuất kho", "Phiếu đã giao cho nhân viên kho, đã tới ngày giao.", await times(3, async (n) => dispatched(await build.exportProduct(`[UC-11.02] Xuất thành phẩm ${n}`))));
}

// ------------------------------------------------------------------ hàng khách trả
async function customerReturns() {
  step("Hàng khách trả, kế hoạch bù");
  const sold = await times(10, (n) => F.delivered(`[Hàng trả] Đơn đã giao ${n}`));
  const create = async (source, text) => {
    const line = (await api.get("manager", "customer-return-deliveries?q=" + encodeURIComponent(source.deliveryDocument.code)))[0];
    return api.post("manager", "customer-returns", { warehouse_id: warehouse("KHO-03"), receiver_id: user("staff"), reason: text, lines: [{ original_stock_document_line_id: String(line.id), quantity: "2", location_id: F.ref.locations.get("KHO-03/A01") }] });
  };
  add("Hàng khách trả", "Lập phiếu hàng trả", "manager", "Hàng khách trả", "Tạo mới, chọn phiếu đã giao.", sold.slice(0, 3).map((s) => s.deliveryDocument));
  const waiting = [];
  for (const source of sold.slice(3, 6)) waiting.push(await create(source, "Khách báo bao bì hở"));
  add("Hàng khách trả", "Nhận hàng trả / hủy phiếu", "staff (nhận), manager (hủy)", "Hàng khách trả", "Phiếu trả chờ nhân viên kho nhận.", waiting);
  const received = async (source) => {
    const row = await create(source, "Khách báo bánh vỡ");
    const done = await api.post("staff", `customer-returns/${row.id}/receive`, { version: row.version });
    const campaign = await F.returnInspection("[Hàng trả] " + done.code, done.lines.map((l) => l.returned_lot_detail_id));
    return { done, campaign };
  };
  const toCheck = [await received(sold[6]), await received(sold[7])];
  add("Hàng khách trả", "QC hàng trả", "qc", "Kiểm tra QA / QC", "Hàng trả đã nhận vào khu cách ly, đợt kiểm tra đang mở.", toCheck.map((x) => `${x.done.code} (${x.campaign.code})`));
  const checked = [];
  for (const source of sold.slice(8)) {
    const { done, campaign } = await received(source);
    await api.post("qc", "qc-inspections", {
      campaign_id: String(campaign.id), inspected_at: new Date().toISOString(), note: "[Hàng trả] Kết quả kiểm tra",
      lines: done.lines.map((l) => ({ lot_id: String(l.returned_lot_detail_id), inspected_quantity: "2", passed_quantity: "1", failed_quantity: "1", issue: "Một hộp vỡ" })),
    });
    checked.push(done);
  }
  add("Hàng khách trả", "Xử lý hàng cách ly", "manager lập, workshop duyệt", "Xử lý ngoại lệ", "Tạo mới → Xử lý hàng cách ly: phần đạt giải phóng, phần lỗi tiêu hủy.", (await api.get("manager", "lookup/quarantine-lines")).map((l) => l.name.split(" · ").slice(0, 2).join(" · ")));
  add("Hàng đã nhập", "Điều chỉnh QC hàng đã nhập", "manager lập, workshop duyệt, qc tái kiểm", "Xử lý ngoại lệ", "Tạo mới → Điều chỉnh QC hàng đã nhập, chọn lô đang tồn.", ["Mọi lô còn tồn khả dụng"]);
}

// ----------------------------------------------------------------------- danh mục
async function catalog(db) {
  step("UC-06, UC-07");
  const categories = (label, count) => times(count, (n) => api.post("manager", "categories", { name: `${label} ${n}`, catalog_kind: n % 2 ? "FINISHED_PRODUCT" : "MATERIAL", description: "Danh mục để thử", is_active: true }));
  const names = (rows) => rows.map((r) => r.name);
  add("UC-06 / 06.1", "Quản lý, thêm danh mục kho", "manager", "Danh mục", "Thêm mới; thử trùng tên với danh mục bên dưới.", names(await categories("[UC-06.1] Danh mục có sẵn", 1)));
  const inUse = (await categories("[UC-06.2] Đang có mặt hàng, không xóa được", 1))[0];
  add("UC-06.2", "Xóa danh mục kho", "manager", "Danh mục", "Ba danh mục trống xóa được; danh mục cuối đang có mặt hàng nên bị chặn.", [...names(await categories("[UC-06.2] Danh mục để xóa", 3)), inUse.name]);
  add("UC-06.3", "Sửa danh mục kho", "manager", "Danh mục", "Sửa tên, mô tả, trạng thái.", names(await categories("[UC-06.3] Danh mục để sửa", 3)));
  const [[unit]] = await db.query("SELECT MaBanGhi id FROM DonViTinh ORDER BY MaBanGhi LIMIT 1");
  const [[group]] = await db.query("SELECT MaBanGhi id FROM LoaiHang WHERE Ma='BANH-QUY'");
  const product = (name, category = group.id) => api.post("manager", "items", { name, kind: "FINISHED_PRODUCT", category_id: String(category), unit_id: String(unit.id), reference_price: "20000", is_sample: true, is_published: false, is_active: true });
  await product("[UC-06.2] Mặt hàng đang dùng danh mục", inUse.id);
  const items = (label) => times(3, (n) => product(`${label} ${n}`));
  const places = (label, prefix) => times(2, (n) => api.post("manager", "warehouses", { code: `${prefix}-${n}`, name: `${label} ${n}`, address: "Kho để thử", is_active: true }));
  const suppliers = (label, prefix) => times(2, (n) => api.post("manager", "suppliers", { code: `${prefix}-${n}`, name: `${label} ${n}`, phone: "0901234567", email: "ncc@example.com", address: "TP Hồ Chí Minh", is_active: true }));
  const [home] = await places("Kho để thử vị trí", "KHO-THU-VT");
  const spots = (label, prefix) => times(2, (n) => api.post("manager", "warehouse-locations", { warehouse_id: String(home.id), code: `${prefix}-${n}`, name: `${label} ${n}`, is_active: true }));
  add("UC-07 / 07.1", "Quản lý, thêm dữ liệu danh mục", "manager", "Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp", "Thêm mới; thử trùng mã KHO-THU-VT-1.", [home.name]);
  add("UC-07.2", "Xóa dữ liệu danh mục", "manager", "Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp", "Dữ liệu chưa dùng ở đâu nên xóa được; thử xóa Bột mì, KHO-01 để thấy bị chặn.", names([...(await items("[UC-07.2] Mặt hàng để xóa")), ...(await places("[UC-07.2] Kho để xóa", "KHO-XOA")), ...(await spots("[UC-07.2] Vị trí để xóa", "VT-XOA")), ...(await suppliers("[UC-07.2] Nhà cung cấp để xóa", "NCC-XOA"))]));
  add("UC-07.3", "Sửa dữ liệu danh mục", "manager", "Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp", "Sửa thông tin rồi lưu.", names([...(await items("[UC-07.3] Mặt hàng để sửa")), ...(await places("[UC-07.3] Kho để sửa", "KHO-SUA")), ...(await spots("[UC-07.3] Vị trí để sửa", "VT-SUA")), ...(await suppliers("[UC-07.3] Nhà cung cấp để sửa", "NCC-SUA"))]));
}
async function accounts() {
  step("Tài khoản");
  const account = (username, full_name, status = "ACTIVE", role = "WAREHOUSE_STAFF") => api.post("admin", "accounts", { username, full_name, email: username + "@example.com", password: "123456", roles: [role], workshop_ids: [], status });
  add("UC-01", "Đăng nhập", "mọi tài khoản", "Đăng nhập", "Mật khẩu chung 123456. Tài khoản khoa01 đang bị khóa; sai mật khẩu 5 lần thì tạm khóa 15 phút (bấm Xóa dữ liệu test để mở lại ngay).", [(await account("khoa01", "Tài khoản đang bị khóa", "LOCKED")).username]);
  add("Tài khoản", "Quản lý tài khoản", "admin", "Quản lý tài khoản", "Sửa, khóa, xóa các tài khoản thử.", (await times(3, (n) => account("thu0" + n, "Tài khoản thử " + n))).map((a) => a.username));
}

/** Các UC chỉ xem: dùng chung dữ liệu lịch sử. */
function viewing() {
  add("UC-02", "Đặt đơn hàng", "customer2 (lần đầu), customer", "Đơn hàng", "Đặt mới. customer2 chưa có người nhận trong hồ sơ nên phải nhập.", ["Mọi mặt hàng đang bán"]);
  add("UC-18", "Xem danh sách hàng tồn kho", "director, workshop, manager", "Báo cáo tồn kho", "Có nguyên vật liệu, thành phẩm, hàng cách ly, nhiều lô với hạn dùng khác nhau.", ["Toàn bộ tồn kho"]);
  add("UC-19", "Xem hồ sơ xuất kho", "director, workshop", "Phiếu nhập / xuất", "Lọc theo thời gian (phiếu rải trong 1 tháng), xuất CSV.", ["Các phiếu xuất"]);
  add("UC-20", "Xem hồ sơ nhập kho", "director, workshop", "Phiếu nhập / xuất", "Lọc theo thời gian (phiếu rải trong 1 tháng), xuất CSV.", ["Các phiếu nhập"]);
  add("UC-22", "Tra cứu dữ liệu trong kho", "manager, workshop", "Tra cứu kho", "Tra theo mặt hàng, lô, vị trí.", ["Toàn bộ kho"]);
}

async function build({ db, backdate }) {
  await openingStock();
  await catalog(db);
  await F.loadReferences(db);
  await accounts();
  // Các ô chọn trên form chỉ hiện 100 bản ghi mới nhất: lịch sử và chuỗi phụ dựng trước, việc cần chọn dựng sau.
  await history(backdate);
  await stockRequests();
  await customerReturns();
  await plans();
  await workshopReports();
  await tasks();
  await inspections();
  await warehouseCounts();
  await purchasing();
  await customerOrders();
  viewing();
  return guide;
}
module.exports = { build };
