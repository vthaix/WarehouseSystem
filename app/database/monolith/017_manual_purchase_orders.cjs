// UC-27 luồng phụ 3.1 "Lập đơn mua trực tiếp": cho phép đơn mua không gắn kế hoạch (LoaiNguonDonMua='MANUAL').
// Đơn theo kế hoạch (PLAN) vẫn bắt buộc kế hoạch MUA đã được Ban giám đốc duyệt như trigger cũ (003_purchase_approval.sql).
async function up(c) {
  await c.query("DROP TRIGGER IF EXISTS KiemDuyetDonMua");
  await c.query(
    "CREATE TRIGGER KiemDuyetDonMua BEFORE INSERT ON DonMuaHang FOR EACH ROW BEGIN" +
      " IF NEW.LoaiNguonDonMua='MANUAL' THEN" +
      "  IF NEW.MaKeHoachKinhDoanh IS NOT NULL OR NEW.MaBaoCaoSanXuat IS NOT NULL THEN" +
      "   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Don mua lap truc tiep khong gan ke hoach hoac bao cao';" +
      "  END IF;" +
      " ELSEIF NEW.LoaiNguonDonMua<>'PLAN' OR NEW.MaKeHoachKinhDoanh IS NULL OR" +
      "  NOT EXISTS (SELECT 1 FROM KeHoachMuaBan WHERE MaBanGhi=NEW.MaKeHoachKinhDoanh AND Kieu='PURCHASE' AND TrangThai='APPROVED') THEN" +
      "  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Chi mua NVL tu ke hoach da duoc phe duyet';" +
      " END IF;" +
      " END",
  );
}

module.exports = { up };
