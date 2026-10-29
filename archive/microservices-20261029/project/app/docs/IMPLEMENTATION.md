# Hướng dẫn tiếp tục triển khai

Cập nhật 14/10/2026. Runtime hiện là năm backend HTTP và web-gateway, sáu database/tài khoản trên cùng MySQL. Không tạo lại skeleton service hoặc đưa nghiệp vụ về gateway.

Đọc [ARCHITECTURE.md](ARCHITECTURE.md), [SERVICE_DATABASES.md](SERVICE_DATABASES.md), [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md), sau đó SRS/USE_CASES/DOMAIN_MODEL và BUSINESS_DECISIONS trước sửa nghiệp vụ.

## Vị trí mã

- Module owner: src/services/<service>/modules.
- Khởi động và composition: index.js / compose.js trong mỗi service.
- Hợp đồng HTTP, host, client, transport: src/services/shared.
- SQL adapter/ownership/credentials: src/config và database/services.
- Web controller/routes/EJS: src/shared, src/controllers, src/views; assets: public.
- Domain policy/helpers: src/services/domain; boundary factories: src/boundaries.

Danh mục implementation dùng chung phải giới hạn resource theo owner. Không thêm SQL tùy ý qua RPC hoặc import domain object của process khác vào gateway.

## Thay đổi dữ liệu

Legacy migration 001–026 là lịch sử đã áp dụng; không sửa checksum. Migration hiện hành theo service ở database/services/migrations, hiện 001–007. Thay schema cần cập nhật marker bootstrap, compatibility views, identifiers, ownership/quyền nếu liên quan, snapshot schema và acceptance cô lập. Không dùng seed để lưu chứng từ hoặc reset tồn.

## Kiểm chứng

Chạy npm test và npm run check. Thay nghiệp vụ SQL cần acceptance trên namespace riêng; thay form cần browser test phù hợp. Không lấy test memory thay cho nghiệm thu SQL.

Báo cáo tiến độ phải phân biệt code có sẵn, kiểm thử đã chạy và việc chưa làm. Chưa hoàn thành toàn bộ UC hay độc lập dữ liệu hoàn toàn. Kế hoạch: [MICROSERVICE_MIGRATION.md](MICROSERVICE_MIGRATION.md).

Đồng bộ cấu trúc/tài liệu: [STRUCTURE.md](STRUCTURE.md). Chạy npm run docs:sync và npm run check:sync sau thay đổi source/schema. Menu/nhãn browser sinh từ cấu hình navigation dùng chung server.