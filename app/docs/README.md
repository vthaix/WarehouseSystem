# Danh mục tài liệu hiện hành

Cập nhật 14/10/2026. Toàn bộ đặc tả và tài liệu kiến trúc/vận hành đã hợp nhất theo runtime hiện hành; báo cáo kiểm chứng trong DOCS_SYNC.md. SRS/UC/domain/API/UI đã hợp nhất thành bản hiện hành; bản trước hợp nhất ở archive/before-full-sync-20261014, bản vận hành cũ ở archive/pre-microservice-doc-sync-20261014, chỉ để truy vết, không dùng làm hướng dẫn chạy.

| Nội dung | Tài liệu |
| --- | --- |
| Kiến trúc đang chạy và giới hạn | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Owner, database, tài khoản, migration | [SERVICE_DATABASES.md](SERVICE_DATABASES.md), [DATABASE.md](DATABASE.md) |
| Chạy và nâng cấp Docker | [DOCKER.md](DOCKER.md) |
| Tài khoản mẫu, mật khẩu và quyền | [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md) |
| Test case theo đặc tả UC | [TEST_CASES.md](TEST_CASES.md) |
| Phiếu chấm 10 module nghiệp vụ | [PHIEU_CHAM.md](PHIEU_CHAM.md) |
| Kết quả kiểm thử và ma trận thực thi | [TEST_RESULTS.md](TEST_RESULTS.md), [TEST_EXECUTION_MATRIX.md](TEST_EXECUTION_MATRIX.md) |
| Triển khai tiếp / production | [IMPLEMENTATION.md](IMPLEMENTATION.md), [PRODUCTION.md](PRODUCTION.md) |
| Chuyển tiếp sang độc lập dữ liệu | [MICROSERVICE_MIGRATION.md](MICROSERVICE_MIGRATION.md) |
| Prompt bàn giao | [MICROSERVICE_HANDOFF_PROMPT.md](MICROSERVICE_HANDOFF_PROMPT.md) |
| Tiến độ / backlog | [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md), [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) |
| Yêu cầu và quy trình | [SRS.md](SRS.md), [USE_CASES.md](USE_CASES.md), [DOMAIN_MODEL.md](DOMAIN_MODEL.md), [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md) |
| API / giao diện | [API.md](API.md), [UI_SPEC.md](UI_SPEC.md) |
| Ngoại lệ / cách ly / bù QC | [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md) |
| Nhập từng phần | [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md) |
| Đồng bộ tài liệu | [DOCS_SYNC.md](DOCS_SYNC.md) |

Bản hiện hành không chứa các đặc tả cũ để ghi đè bằng ghi chú đầu trang. Lịch sử chỉ trong archive. Kiến trúc deploy theo ARCHITECTURE/SERVICE_DATABASES; mức nghiệm thu theo IMPLEMENTATION_PROGRESS, chưa chứng nhận tất cả nhánh UC.

- [Cấu trúc hiện hành](STRUCTURE.md)
- [API routes từ router](generated/API_ROUTES.md)
- [Whitelist request từ code](generated/API_CONTRACT_FIELDS.md)
- [Đối tượng CSDL theo owner](generated/DATABASE_OBJECTS.md)

Sau thay đổi nguồn: npm run docs:sync, sau đó npm run check:sync. Cấu hình menu browser cũng được sinh từ navigation.js.
- [Ảnh danh mục và lưu trữ](CATEGORY_IMAGES.md)
