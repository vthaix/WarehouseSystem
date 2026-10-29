const C = require("../../services/domain/core");
async function refresh(c, lotIds) {
  if (!lotIds.length) return;
  const [requests] = await c.execute(
    `SELECT DISTINCT r.id FROM stock_requests r JOIN lots l ON l.production_receipt_request_id=r.id WHERE r.production_source_mode='MANUAL' AND r.status<>'CANCELLED' AND l.id IN (${lotIds.map(() => "?").join(",")}) ORDER BY r.id`,
    lotIds,
  );
  for (const { id } of requests) {
    const [[request]] = await c.execute(
      "SELECT status FROM stock_requests WHERE id=? FOR UPDATE",
      [id],
    );
    const [[totals]] = await c.execute(
      "SELECT SUM(q.passed_quantity) passed,SUM(q.id IS NULL) pending FROM lots l LEFT JOIN qc_inspection_lines q ON q.lot_id=l.id WHERE l.production_receipt_request_id=?",
      [id],
    );
    const [[posted]] = await c.execute(
      "SELECT COALESCE(SUM(dl.quantity),0) quantity FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE d.stock_request_id=? AND d.type='IN'",
      [id],
    );
    const done = C.qty(String(posted.quantity), false),
      passed = C.qty(String(totals.passed || "0"), false);
    const status =
      !Number(totals.pending) && done >= passed
        ? "FULFILLED"
        : done > 0n
          ? "PARTIALLY_FULFILLED"
          : "PENDING";
    if (status !== request.status)
      await c.execute(
        "UPDATE stock_requests SET status=?,version=version+1 WHERE id=?",
        [status, id],
      );
  }
}
module.exports = { refresh };
