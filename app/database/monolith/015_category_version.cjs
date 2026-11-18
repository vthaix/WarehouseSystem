// UC-06.3 / UC-06.2: thêm phiên bản cho danh mục (LoaiHang) để khi hai người
// cùng sửa, người lưu sau được báo "dữ liệu đã thay đổi" thay vì ghi đè
// (luồng ngoại lệ 3.3 của đặc tả). Danh mục cũ bắt đầu từ phiên bản 1.
async function up(c) {
  await c.query("ALTER TABLE LoaiHang ADD COLUMN PhienBan INT NOT NULL DEFAULT 1 AFTER LoaiDanhMuc");
}

module.exports = { up };
