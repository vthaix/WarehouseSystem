const C = require('../../services/domain/core');

// Lock the lot used by receipt posting before reading its complete receipt history.
// A partially accepted lot can have its passed portion in stock while its failed
// portion remains outside stock. Current balance alone cannot distinguish them.
async function validate(c, lineId) {
  const [[line]] = await c.execute(
    'SELECT q.lot_id,q.passed_quantity FROM qc_inspection_lines q JOIN lots l ON l.id=q.lot_id WHERE q.id=? FOR UPDATE',
    [lineId],
  );
  C.fail(!line, 'NOT_FOUND', 'Không tìm thấy dòng QC.', 404);
  const [receipts] = await c.execute(
    "SELECT dl.quantity,dl.quality_bucket FROM stock_document_lines dl JOIN stock_documents d ON d.id=dl.stock_document_id WHERE dl.lot_id=? AND d.type='IN' AND d.status='POSTED'",
    [line.lot_id],
  );
  let received = 0n;
  for (const receipt of receipts) {
    C.fail(receipt.quality_bucket !== 'AVAILABLE', 'INVALID_STATE',
      'Hàng cách ly cần quy trình xử lý tồn riêng.', 409);
    received += C.qty(String(receipt.quantity), false);
  }
  C.fail(received > C.qty(String(line.passed_quantity), false), 'INVALID_STATE',
    'Lượng đã nhập vượt lượng QC đạt; cần đối soát tồn trước khi xử lý phần lỗi.', 409);
}

module.exports = { validate };
