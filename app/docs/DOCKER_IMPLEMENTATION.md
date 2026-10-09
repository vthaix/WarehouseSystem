# Báo cáo nền tảng Docker/MySQL

Đã đọc toàn bộ SRS và khảo sát code hiện có trước khi sửa. Giữ EJS, CSS/form dùng chung, policy/validator, controller xác thực và domain demo; thêm bootstrap SQL riêng thay vì trộn hai nơi lưu dữ liệu. [MODULE_MATRIX.md](MODULE_MATRIX.md) phân loại UC gốc, SUP và phần cần chốt; không thêm UC-26/30/33.

## Cây thư mục thực tế

```text
WarehouseSystem/
├── docker-compose.yml             # entry include app config
├── .env.example                   # override Compose, secrets để trống
├── README.md
└── app/
    ├── Dockerfile                 # runtime non-root, test stage
    ├── docker-compose.yml         # setup, mysql, app, Adminer profile dev
    ├── .dockerignore
    ├── package.json / package-lock.json
    ├── src/
    │   ├── config/                # env, database, session, navigation
    │   ├── modules/               # 14 module; metadata UC/bảng/route/UI
    │   │   ├── auth/              # SQL UserRepository/AuthService
    │   │   ├── catalog/           # SQL Repository/Service/API đọc
    │   │   ├── notifications/     # SQL scope/read
    │   │   └── ...                # module pending đăng ký route 501
    │   ├── shared/                # bootstrap, session store, migration, routes
    │   ├── controllers/           # web + api hiện có
    │   ├── services/domain/       # nghiệp vụ demo để đối chiếu
    │   ├── repositories/          # memory + adapter cũ
    │   ├── routes/ / middlewares/ / validators/ / utils/ / models/
    │   ├── views/                 # EJS layouts/partials/screens/pending
    │   ├── app.js
    │   └── server.js
    ├── database/
    │   ├── adminer/KhoHang.sql       # schema tiếng Việt dùng chung
    │   ├── legacy/001_foundation.sql # schema cũ, không còn chạy
    │   ├── migrations/              # thay đổi sau schema gốc
    │   └── seeders/foundation.js
    ├── public/                    # CSS, JS, images, uploads
    ├── scripts/                   # secret setup, DB commands, health, SQL smoke
    ├── tests/unit/ / tests/integration/
    ├── e2e/                       # memory + Docker browser
    ├── artifacts/                 # ảnh kiểm thử browser
    └── docs/                      # SRS, API, UI, matrix, vận hành
```

## Đã làm

- Một deploy app Express/EJS và một DB MySQL 8.4. Internal network, DB volume, DB/app healthcheck, startup retry, graceful shutdown, bind 0.0.0.0 trong container, logs JSON/request ID. Port host chỉ localhost.
- Secrets sinh ngẫu nhiên không commit, giữ qua restart, phân tách root secret khỏi app. Runtime chạy user node; Adminer chỉ profile dev.
- Ordered migrations/checksum/advisory lock, FK/CHECK/DECIMAL/utf8mb4; seed 9 roles, 11 users và catalog mẫu lặp an toàn, giữ password hash. Không ghi tồn mở đầu trực tiếp.
- SQL auth/RBAC/workshop/customer scope, scrypt, session store/revocation version, HttpOnly/SameSite cookie, CSRF, login rate limit bền vững và audit login.
- SQL danh mục **chỉ đọc**, mẫu sản phẩm khách được phép xem, thông báo theo user và đánh dấu đã đọc. Module pending xác thực/phân quyền rồi 501; chưa giả báo thành công.
- [Hướng dẫn clone/chạy](DOCKER.md), [production/backup/restore/update/rollback](PRODUCTION.md). Chưa deploy ra server thật.

## Kiểm chứng thực tế

- Docker Desktop/Compose: build runtime thành công; setup exit 0, mysql/app healthy. MySQL không publish port; Adminer chỉ bật khi kiểm thử dev.
- 25 tests Node pass, kiểm tra cú pháp toàn bộ JS pass. Phần lớn test nghiệp vụ là demo memory, không đại diện cho transaction SQL chưa có.
- SQL smoke thực tế pass: migration/seed lặp và password preservation, 9 roles/11 users, FK/CHECK, DECIMAL string, CSRF/RBAC/customer-workshop scope, SQL notifications/session, rate limit bền vững, endpoint pending 501.
- Restart app: cookie vẫn đăng nhập được từ session MySQL.
- Browser Docker pass: EJS login/danh mục với JavaScript tắt, 403 sai vai trò, Adminer truy cập schema. Ảnh: artifacts/docker-ejs-products.png và docker-adminer.png.
- Chưa thử backup restore hoặc HTTPS production, chưa kiểm thử tải/concurrency SQL nghiệp vụ.

## Còn phải hoàn thiện

CRUD danh mục và các module đơn/kế hoạch/mua/sản xuất/QC/nhập-xuất/kiểm kê/ngoại lệ/công việc/báo cáo; transaction/khóa hàng/rollback/idempotency/audit; cấp user production; kiểm thử đồng thời và backup restore. Schema nghiệp vụ đã có trong `KhoHang`, nhưng service chưa triển khai đầy đủ. Những điểm cần chốt về QC/campaign/dispatch/hồ sơ tổng hợp có trong MODULE_MATRIX. Nền tảng chạy được sau clone không đồng nghĩa toàn bộ chương trình đã hoàn thành.
