# Trạng thái triển khai Docker

Cập nhật 14/10/2026, đối chiếu cấu hình và code.

Đã cấu hình sáu process/container HTTP: identity-service, business-service, warehouse-service, notification-service, reporting-service, web-gateway (Compose app). Mỗi service có index.js, compose.js, Dockerfile riêng; build context chung app/. Gateway publish 3000; backend/MySQL không publish cổng ra host.

Setup quản lý secret; migrate khởi tạo nguồn; split-databases backup/chuyển dữ liệu/migrate service/cấp tài khoản. Backend đợi job thành công; gateway đợi backend qua readiness. MySQL và secret/backup dùng named volumes.

Database đã tách theo owner và tài khoản, nhưng FK/JOIN/view/transaction xuyên schema vẫn yêu cầu một MySQL server. Chưa có broker/outbox/inbox/projection/saga; chưa chứng nhận production hay toàn bộ UC.

Đợt đồng bộ 14/10/2026: 48 Node tests, syntax, project-sync, acceptance split MySQL và các browser tests đạt. Docker đã khởi động; đủ sáu service và MySQL healthy sau up --build --wait. Chi tiết: [DOCS_SYNC.md](DOCS_SYNC.md).

Hướng dẫn hiện hành: [DOCKER.md](DOCKER.md), [ARCHITECTURE.md](ARCHITECTURE.md), [SERVICE_DATABASES.md](SERVICE_DATABASES.md).
