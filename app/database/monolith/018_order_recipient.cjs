// UC-02 / UC-03.1: tên và số điện thoại người nhận của từng đơn hàng.
// Hồ sơ khách hàng giữ người nhận mặc định: TenNguoiNhan (mới) và SoDienTho (cột số điện thoại đã có).
// Tên khách hàng (KhachHang.Ten) không đổi vì được dùng để đặt mã chứng từ. Đơn cũ để trống các cột mới.
async function up(c) {
  await c.query("ALTER TABLE KhachHang ADD COLUMN TenNguoiNhan VARCHAR(150) NULL AFTER Ten");
  await c.query(
    "ALTER TABLE DonHang ADD COLUMN TenNguoiNhan VARCHAR(150) NULL AFTER MaKhachHang," +
      " ADD COLUMN SoDienThoaiNguoiNhan VARCHAR(20) NULL AFTER TenNguoiNhan",
  );
}

module.exports = { up };
