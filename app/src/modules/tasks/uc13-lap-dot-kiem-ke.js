const C = require("../../services/domain/core");
const { actualLots } = require("../quality/campaign-sources");
const QualityCampaignService = require("../quality/QualityCampaignService");
const inspectionScope = require("./inspection-scope");
const scheduleDates = require("../../shared/qc-schedule-dates");

const DEFAULT_LOCATION = "Khu kiểm tra lô hàng";
const invalid = (condition, message) => C.fail(condition, "VALIDATION_ERROR", message);
const dateOnly = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);

async function loadSources(db) {
  const waitingLots = await actualLots(db, null, 1000);
  return {
    finished_lots: await groupFinishedLots(db, waitingLots),
    material_lots: await groupMaterialLots(db, waitingLots),
  };
}

async function groupFinishedLots(db, waitingLots) {
  const groups = new Map();
  const groupOf = (headerId, code) => {
    const key = String(headerId);
    if (!groups.has(key)) groups.set(key, { id: key, code, parts: [] });
    return groups.get(key);
  };

  for (const lot of waitingLots.filter((l) => l.kind === "FINISHED_PRODUCT"))
    groupOf(lot.lot_header_id, lot.lot_header_code || lot.code);

  for (const report of await submittedFinishedReports(db)) {
    const waiting = waitingLots.find((l) => l.id === String(report.lot_id));
    const lot = waiting || lotOfReport(report);
    const group = groupOf(lot.lot_header_id, report.lot_header_code);
    addLotToPart(group, report, lot, Boolean(waiting));
  }
  return [...groups.values()];
}

async function submittedFinishedReports(db) {
  const [reports] = await db.execute(
    "SELECT r.id,r.code,r.completed_date,o.lot_id,l.lot_header_id,l.code AS lot_code,l.received_quantity,l.qc_status," +
      "i.name AS item_name,h.code AS lot_header_code" +
      " FROM finished_reports r JOIN finished_report_outputs o ON o.finished_report_id=r.id" +
      " JOIN lots l ON l.id=o.lot_id JOIN items i ON i.id=l.item_id JOIN lot_headers h ON h.id=l.lot_header_id" +
      " WHERE r.status='SUBMITTED' ORDER BY r.id DESC LIMIT 1000",
  );
  return reports;
}

function lotOfReport(report) {
  return {
    id: String(report.lot_id),
    lot_header_id: report.lot_header_id,
    code: report.lot_code,
    item_name: report.item_name,
    received_quantity: report.received_quantity,
    expected_date: String(dateOnly(report.completed_date)).slice(0, 10),
  };
}

function addLotToPart(group, report, lot, isWaiting) {
  let part = group.parts.find((p) => p.id === String(report.id));
  if (!part) {
    part = { id: String(report.id), code: report.code, available: true, expected_date: lot.expected_date, lot_ids: [], lines: [] };
    group.parts.push(part);
  }
  if (!isWaiting) part.available = false;
  part.expected_date = laterDate(part.expected_date, lot.expected_date);
  part.lot_ids.push(lot.id);
  part.lines.push({ lot_id: lot.id, code: lot.code, item_name: lot.item_name, quantity: lot.received_quantity });
}

const laterDate = (a, b) => [a, b].sort().at(-1);

async function groupMaterialLots(db, waitingLots) {
  const materials = waitingLots.filter((l) => l.kind === "MATERIAL");
  return [...groupDirectPurchases(materials), ...(await groupPurchasePlans(db, materials))];
}

function groupDirectPurchases(materials) {
  const groups = new Map();
  for (const lot of materials.filter((l) => !l.purchase_plan_id && l.purchase_order_ref)) {
    const key = "PO:" + lot.purchase_order_ref;
    if (!groups.has(key))
      groups.set(key, {
        id: key,
        code: "đơn mua lập trực tiếp · " + lot.purchase_order_code,
        purchase_plan_id: null,
        expected_date: lot.expected_date,
        lot_ids: [],
        lines: [],
        eligible_lots: [],
      });
    const group = groups.get(key);
    group.lot_ids.push(lot.id);
    group.lines.push({ lot_id: lot.id, item_name: lot.item_name, quantity: lot.received_quantity, code: lot.code });
    group.eligible_lots.push(lotChoice(lot));
  }
  return [...groups.values()];
}

async function groupPurchasePlans(db, materials) {
  const [plans] = await db.execute(
    "SELECT id,code,planned_date FROM business_plans" +
      " WHERE type='PURCHASE' AND status IN ('APPROVED','IN_PROGRESS') ORDER BY id DESC LIMIT 100",
  );
  return plans.map((plan) => ({
    id: "PLAN:" + plan.id,
    code: "nguyên vật liệu dự kiến · " + plan.code,
    purchase_plan_id: String(plan.id),
    expected_date: dateOnly(plan.planned_date),
    lot_ids: [],
    lines: [],
    eligible_lots: materials.filter((l) => String(l.purchase_plan_id) === String(plan.id)).map(lotChoice),
  }));
}

const lotChoice = (lot) => ({ id: lot.id, name: lot.name, expected_date: lot.expected_date });

async function createCampaign(pool, db, user, body, assigneeIds, requestId) {
  invalid(!["MATERIAL", "FINISHED_PRODUCT"].includes(body.inspection_type), "Chọn kiểm tra thành phẩm hoặc kiểm tra nguyên vật liệu.");
  const author = chooseMinuteAuthor(body, assigneeIds);

  const sources = await loadSources(db);
  const chosen = body.inspection_type === "FINISHED_PRODUCT"
    ? chooseFinishedLots(sources.finished_lots, body)
    : chooseMaterialLots(sources.material_lots, body);

  const campaign = await new QualityCampaignService(pool).create(user, {
    campaign_type: "QUALITY_CHECK",
    quality_kind: body.inspection_type,
    ...chosen,
    planned_date: scheduleDates.localDay(body.start_at),
    start_at: body.start_at,
    end_at: body.end_at,
    location: body.location || DEFAULT_LOCATION,
    note: body.description || "",
    assignee_ids: assigneeIds,
  }, requestId, db);

  await inspectionScope.sync(db, campaign.id, assigneeIds);
  await db.execute("UPDATE stocktakes SET NguoiLapBienBanDuocChon=? WHERE id=?", [author, campaign.id]);
  return { ...campaign, NguoiLapBienBanDuocChon: String(author) };
}

function chooseMinuteAuthor(body, assigneeIds) {
  const onlyOne = assigneeIds.length === 1 ? assigneeIds[0] : null;
  const author = body.minute_author_id || onlyOne;
  invalid(!assigneeIds.includes(String(author)), "Chọn một nhân viên được phân công để lập biên bản chung.");
  return author;
}

function chooseFinishedLots(finishedLots, body) {
  const group = finishedLots.find((g) => g.id === String(body.lot_header_id));
  const reportIds = body.finished_report_ids;
  const validList = Array.isArray(reportIds) && reportIds.length > 0 && reportIds.length <= 100 && !hasDuplicate(reportIds);
  invalid(!group || !validList, "Chọn lô và từng phần theo báo cáo thành phẩm đã gửi.");

  const lotIds = [];
  for (const reportId of reportIds) {
    const part = group.parts.find((p) => p.id === String(reportId));
    invalid(!part || !part.available, "Phần được chọn không thuộc lô, chưa gửi báo cáo hoặc đã được giao kiểm tra.");
    lotIds.push(...part.lot_ids);
  }
  return { source_mode: "ACTUAL", lot_ids: lotIds };
}

function chooseMaterialLots(materialLots, body) {
  const material = materialLots.find((g) => g.id === body.material_source);
  invalid(!material, "Chọn lô nguyên vật liệu theo kế hoạch mua đã duyệt hoặc đơn mua lập trực tiếp.");

  let lotIds = material.lot_ids;
  if (body.material_lot_ids !== undefined) {
    checkMaterialLotIds(material, body.material_lot_ids);
    lotIds = body.material_lot_ids.map(String);
  }
  if (material.id.startsWith("PLAN:"))
    return { source_mode: "PURCHASE_PLAN", source_plan_id: material.purchase_plan_id, lot_ids: lotIds };
  return { source_mode: "ACTUAL", lot_ids: lotIds };
}

function checkMaterialLotIds(material, lotIds) {
  invalid(!Array.isArray(lotIds) || lotIds.length > 100 || hasDuplicate(lotIds), "Danh sách phần lô nguyên vật liệu không hợp lệ.");
  const eligibleIds = material.eligible_lots.map((lot) => lot.id);
  invalid(lotIds.some((id) => !eligibleIds.includes(String(id))),
    "Phần lô không thuộc nguồn đã chọn, đã giao kiểm tra hoặc không còn chờ QC.");
  invalid(eligibleIds.length > 0 && !lotIds.length, "Chọn ít nhất một phần lô nguyên vật liệu đã nhận.");
}

const hasDuplicate = (ids) => new Set(ids.map(String)).size !== ids.length;

module.exports = { loadSources, createCampaign };
