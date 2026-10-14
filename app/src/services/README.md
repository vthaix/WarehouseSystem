# Service runtime

Hiện có năm backend HTTP và web-gateway, mỗi thư mục service có index.js, compose.js, Dockerfile và modules theo owner. Cập nhật 14/10/2026.

| Service | Module chính |
| --- | --- |
| identity-service | auth, hồ sơ/quyền |
| business-service | customer-orders, business-plans, purchasing, production, catalog theo owner |
| warehouse-service | warehouse, quality, stock-requests, stocktakes, exceptions, tasks, returns |
| notification-service | notifications |
| reporting-service | reporting |
| web-gateway | EJS/session/CSRF/API proxy |

shared/ chứa host, clients, transport, contracts, runtime và catalog implementation giới hạn owner. domain/ giữ policy/helpers và mã demo legacy còn được dùng/test.

Chạy từ root: `docker compose up -d --build --wait`. Gateway có tên Compose app, URL http://localhost:3000. Backend chỉ trong network Docker. Build riêng: `docker compose build warehouse-service`; build context app/, không dùng thư mục service làm context.

Sáu database/tài khoản đã tách, source KhoHang giữ snapshot trước cutover. Migration nguồn 001–026, service 001–007. Job split-databases làm DDL, runtime không có quyền DDL/root. Còn FK/view/JOIN/transaction xuyên schema trên một MySQL server.

Giao tiếp nội bộ dùng HTTP có chữ ký HMAC, actor kiểm lại qua Identity, allowlist RPC và timeout; không tự retry mutation. Gateway không xử lý domain local từ backend khác.

Kiểm thử Node: npm test / npm run check. Acceptance từ root:
`docker compose run --rm --no-deps -T split-databases node scripts/split-acceptance.cjs`.
Chỉ dùng namespace acceptance cô lập; không chạy bộ legacy với database service chính.

Runtime `start:legacy` chỉ để đối chiếu/test, không dùng Compose. Broker/outbox/inbox/projections/claims/saga chưa triển khai.

[Kiến trúc](../../docs/ARCHITECTURE.md) · [Database](../../docs/SERVICE_DATABASES.md) · [Docker](../../docs/DOCKER.md)

Đồng bộ cấu trúc/tài liệu: [STRUCTURE.md](../../docs/STRUCTURE.md). Chạy npm run docs:sync và npm run check:sync sau thay đổi source/schema. Menu/nhãn browser sinh từ cấu hình navigation dùng chung server.