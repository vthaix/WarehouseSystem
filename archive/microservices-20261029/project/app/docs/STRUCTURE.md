# Cấu trúc project hiện hành

Ứng dụng nằm trong app/. Root chỉ giữ README, cấu hình Compose include và cấu hình repository. Không có frontend độc lập: gateway render EJS.

Development có tiện ích quản trị tạm `test-reset` chạy `scripts/reset-tools-server.cjs` bằng image gateway, chỉ nối mạng backend và giữ secrets quản trị riêng. Gateway dùng `TestResetRoutes.js`, nút trong header và `public/js/reset-tools.js`. Không thêm database/domain owner; vẫn sáu service/schema nghiệp vụ hiện hành. Tắt bằng `ENABLE_TEST_RESET=false`, production tự tắt. Xem [RESET_DU_LIEU_TEST.md](RESET_DU_LIEU_TEST.md).

```text
WarehouseSystem/
  docker-compose.yml
  README.md
  app/
    docker-compose.yml
    Dockerfile                 # entry/test gateway tương thích
    package.json / package-lock.json
    src/
      services/
        identity-service/      # index.js, compose.js, Dockerfile, modules
        business-service/      # index.js, compose.js, Dockerfile, modules
        warehouse-service/     # index.js, compose.js, Dockerfile, modules
        notification-service/  # index.js, compose.js, Dockerfile, modules
        reporting-service/     # index.js, compose.js, Dockerfile, modules
        web-gateway/           # index.js, compose.js, Dockerfile
        shared/                # transport, contracts, host, clients, registry, catalog
        domain/                # policy/helpers và phần demo legacy
      boundaries/              # tám boundary logic/factories
      images/categories/       # file ảnh; Docker lưu volume riêng
      config/                  # env, DB, ownership adapter, credentials, navigation
      shared/                  # web/routes/adapters hỗ trợ runtime hiện hành
      controllers/ views/ middlewares/ validators/ utils/
      app.js / server.js       # entry legacy, không phải runtime Compose
    public/                    # CSS, JavaScript, assets
    database/
      adminer/                 # schema nguồn lịch sử và identifier mapping
      migrations/              # 001–026 lịch sử nguồn
      services/                # ownership, grants, migration 001–007, snapshot từng owner
      seeders/                 # chỉ bootstrap/demo
    scripts/ tests/ e2e/
    docs/
      generated/               # manifest, API routes, đối tượng SQL từ source
      archive/                 # bản trước đồng bộ, không là đặc tả hiện hành
```

Mỗi service có process/container và database/account riêng; chưa có package độc lập hoặc server MySQL riêng. Shared helpers/adapters không đồng nghĩa gateway xử lý domain thay backend. Module không còn ở src/modules.

Thay code/schema phải cập nhật migration/snapshot khi cần, npm run docs:sync, npm run check:sync và các kiểm thử liên quan. Không sửa migration/checksum đã áp dụng, không đổi fingerprint ownership cutover hoặc reset volume để nâng cấp.
