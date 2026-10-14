# Migration nguồn lịch sử

Thư mục này chứa migration 001–026 của schema nguồn trước cutover. Giữ nguyên file và checksum đã chạy. Không thêm thay đổi runtime service vào schema nguồn rồi kỳ vọng dữ liệu owner tự cập nhật.

Sau cutover, migration mới ở database/services/migrations (hiện 001–006), cần wiring bootstrap/checkpoint, snapshot và kiểm thử database riêng. Xem [SERVICE_DATABASES.md](../../docs/SERVICE_DATABASES.md).
