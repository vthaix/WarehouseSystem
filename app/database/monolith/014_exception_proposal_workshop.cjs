// UC-17: lưu xưởng phụ trách vào từng đề xuất xử lý ngoại lệ để chủ xưởng
// của xưởng đó phê duyệt (quyết định ngày 18/11/2026, theo đặc tả).
// Đề xuất cũ được điền xưởng từ nguồn hàng; nếu không xác định được duy nhất
// thì để trống, Ban giám đốc vẫn xem được và quản lý kho lập lại nếu cần.
const proposalWorkshop = require("../../src/modules/exceptions/proposal-workshop");

async function up(c) {
  await c.query(
    "ALTER TABLE BanDeXuatXuLyNgoaiLe ADD COLUMN MaXuong BIGINT UNSIGNED NULL AFTER MaChiTietKiemKe," +
      " ADD CONSTRAINT FK_DeXuatXuLy_Xuong FOREIGN KEY (MaXuong) REFERENCES Xuong(MaBanGhi)",
  );
  const [proposals] = await c.execute(
    "SELECT id,qc_inspection_line_id,stocktake_line_id FROM exception_proposals WHERE workshop_id IS NULL",
  );
  for (const proposal of proposals) {
    const workshopId = await proposalWorkshop.resolve(c, proposal);
    if (workshopId)
      await c.execute("UPDATE exception_proposals SET workshop_id=? WHERE id=?", [workshopId, proposal.id]);
  }
}

module.exports = { up };
