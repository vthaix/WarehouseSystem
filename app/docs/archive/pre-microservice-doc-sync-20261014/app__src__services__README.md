## MySQL theo service

Đã tách 6 database/tài khoản theo owner; source cũ giữ trước cutover. Vẫn có FK/view/transaction xuyên schema trên cùng MySQL. Hướng dẫn hiện hành: [SERVICE_DATABASES.md](../../docs/SERVICE_DATABASES.md). Các mô tả CSDL chưa tách bên dưới là lịch sử.

# Service chạy độc lập — CSDL dùng chung tạm thời

Đã chuyển từ composition in-process sang **5 backend HTTP + web-gateway**. Mỗi service có `index.js` và `Dockerfile` riêng trong thư mục này. Compose mặc định chạy tất cả, không dùng runtime monolith để xử lý API.

```text
app/src/services/
├── identity-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── compose.js
│   └── modules/auth/
├── business-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── compose.js
│   └── modules/{customer-orders,business-plans,purchasing,production}/
├── warehouse-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── compose.js
│   └── modules/{warehouse,quality,stock-requests,stocktakes,exceptions,tasks,returns}/
├── notification-service/{index.js,Dockerfile,compose.js,modules/notifications}/
├── reporting-service/{index.js,Dockerfile,compose.js,modules/reporting}/
├── web-gateway/{index.js,Dockerfile,compose.js}/
├── shared/{host.js,clients.js,transport.js,contracts.js,api-proxy.js,
│           runtime.js,database-bootstrap.js,registry.js,catalog}/
├── domain/                    # helpers và code demo cũ còn được sử dụng
├── AuthService.js             # auth demo bộ nhớ, không phải identity-service
└── WarehouseService.js        # demo bộ nhớ, không phải warehouse-service
```

`compose.js` chỉ tạo domain objects local của service. `index.js` mở server HTTP qua host chung; service khác được gọi bằng client HTTP, không import object domain từ process khác. Catalog repository/writer dùng chung implementation có resource scope; Business sở hữu hàng/NCC, Warehouse sở hữu kho/vị trí/lô. Source registry vẫn giữ mã UC hiện hữu.

## Chạy bằng Docker

Tại root WarehouseSystem:

```powershell
docker compose up -d --build --wait
docker compose ps
docker compose logs --tail=100 business-service
```

Gateway được giữ tên Compose `app` để URL/các công cụ hiện hữu vẫn hoạt động: http://localhost:3000. Năm backend chỉ có cổng trong network Docker, không publish ra host. Adminer: `docker compose --profile dev up -d adminer`, http://localhost:8080.

Build riêng: `docker compose build warehouse-service`. Dockerfile của mỗi service dùng build context `app/`, chia sẻ package-lock/dependencies hiện tại; không chạy `docker build .` từ thư mục service với context sai. `app/Dockerfile` là entrypoint gateway tương thích và có test stage; Compose chọn Dockerfile riêng dưới src/services.

`setup` tạo secret nếu chưa có, giữ secret cũ. `migrate` chạy migration/seed demo một lần trước backend; không để từng service tự migrate. MySQL giữ volume cũ. Schema vẫn đến **026**, chưa tách database/account hoặc đổi bảng. Không dùng `down -v` để nâng code.

## Giao tiếp

Browser giữ session/CSRF tại gateway. Gateway đăng nhập qua Identity, render EJS bằng HTTP clients và chuyển `/api/v1` đến owner theo `shared/contracts.js`. Assets/EJS và adapter routes hiện vẫn ở public/src/views/src/shared, chỉ gateway phục vụ UI.

Backend cung cấp `/health`, `/health/ready`, `/internal/v1/invoke` và `/internal/v1/http`. Request nội bộ ký HMAC bằng secret riêng `internal_secret`, bind audience/method/path/body, có timestamp và nonce chống replay trong cửa sổ hiện tại. Không đưa khóa vào browser. Backend lấy lại actor/quyền/session_version từ Identity; không tin roles do caller gửi. RPC có allowlist, không có API pool.query/transaction/SQL tùy ý; không trả password_hash của user.

Transport có timeout và không tự retry mutation. Timeout có thể chưa xác định kết quả; kiểm lại chứng từ và idempotency key trước khi gửi lại. Gateway readiness kiểm các backend. Identity mất kết nối thì thao tác cần xác thực không được tự fallback sang monolith.

Biến URL: IDENTITY_SERVICE_URL, BUSINESS_SERVICE_URL, WAREHOUSE_SERVICE_URL, NOTIFICATION_SERVICE_URL, REPORTING_SERVICE_URL. Trong Compose dùng DNS tên service; khi chạy Node riêng phải đặt URL/PORT từng process. INTERNAL_SECRET_FILE được bootstrap tự cấu hình trong Compose.

## Kiểm thử và phần CSDL để làm sau

- Node unit/integration: `npm test`; syntax: `npm run check`.
- Browser: `npm run test:imports:browser`, `npm run test:docker-browser`.
- SQL acceptance: `docker compose run --rm --no-deps -e DB_NAME=KhoHang_Acceptance_20261012 app node scripts/isolated-acceptance.cjs`. DB kiểm thử này phải được tạo/cấp quyền riêng trước; script từ chối DB_NAME không đúng mẫu.
- Acceptance mở **6 process HTTP** ở localhost trong container test, tất cả dùng DB kiểm thử; không gọi backend của DB chính. Kiểm cả chữ ký/owner, giả mạo vai trò/phiên và các luồng nghiệp vụ qua gateway.

**Chưa tách sở hữu dữ liệu vật lý:** các backend còn chung MySQL/schema/account, có JOIN/FK và một số cập nhật xuyên boundary. Business còn đăng ký lô/ghi thông báo trong transaction SQL hiện hữu; Reporting vẫn đọc dữ liệu nguồn trực tiếp, chưa có projection. Gateway còn session store SQL. Chưa có broker/outbox/inbox/source-claims/saga. Không coi việc có container riêng là đã đạt database-per-service hoặc độc lập dữ liệu hoàn toàn.

Phần tiếp theo theo yêu cầu người dùng: thiết kế CSDL từng service, thay truy vấn xuyên boundary bằng hợp đồng/claims/events, outbox/inbox và projections. Giữ những invariant đang được test; không phá transaction bằng cách chỉ bỏ FK. Kế hoạch chi tiết: [MICROSERVICE_MIGRATION.md](../../docs/MICROSERVICE_MIGRATION.md).
