// UC-02 / UC-03.1: lưu riêng các phần của địa chỉ giao hàng (tỉnh/thành, phường/xã,
// số nhà tên đường) để form sửa đơn chọn lại đúng. DiaChiGiaoHang vẫn giữ địa chỉ đầy đủ
// để các màn hình khác hiển thị như cũ. Đơn cũ để trống các cột mới.
async function up(c) {
  await c.query(
    "ALTER TABLE DonHang ADD COLUMN MaTinhThanhGiao INT NULL AFTER DiaChiGiaoHang," +
      " ADD COLUMN MaPhuongXaGiao INT NULL AFTER MaTinhThanhGiao," +
      " ADD COLUMN SoNhaTenDuongGiao VARCHAR(300) NULL AFTER MaPhuongXaGiao",
  );
}

module.exports = { up };
