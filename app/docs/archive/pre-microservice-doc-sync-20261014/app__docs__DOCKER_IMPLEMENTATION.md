## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Hiện trạng nền tảng Docker và MySQL

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Có cấu hình Dockerfile/Compose, setup secrets, MySQL, Adminer development, migrations/seeders, SQL bootstrap và các script smoke trong repo. Đây là bằng chứng tệp/code có mặt, không phải xác nhận đã build/chạy/pass trong lượt docs-only.

Không có nghiệm thu Docker, MySQL, browser, persistence/restore hoặc tải tại commit ghi đầu tài liệu trong lượt này. Các số test pass/54 bảng và mô tả “catalog chỉ đọc, toàn bộ nghiệp vụ pending” của báo cáo giai đoạn cũ không đại diện source hiện hành. Một số service SQL đã có; chi tiết xem MODULE_MATRIX và DOMAIN_ALIGNMENT.

Cách clone/chạy được giữ ở DOCKER; production/backup/restore ở PRODUCTION. Lệnh migrate/seed/smoke có thể ghi DB, chỉ chạy sau khi người thực hiện chọn môi trường kiểm thử cô lập hoặc quy trình deploy phù hợp. Nền tảng chạy được không đồng nghĩa đáp ứng 48 UC và 12 BR mới.
