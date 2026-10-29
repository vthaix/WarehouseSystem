# Chạy Docker

Cập nhật 14/10/2026. Chạy từ root WarehouseSystem; root Compose include cấu hình trong app/.

```powershell
docker compose up -d --build --wait
docker compose ps
docker compose logs --tail=100 app identity-service business-service warehouse-service notification-service reporting-service
```

Lần sau bật lại: `docker compose up -d`. Khi thay code/image: thêm `--build`. `--wait` đợi service running/healthy; `ps` chỉ xem trạng thái.

Chuỗi bootstrap: setup → MySQL healthy → migrate nguồn legacy → split-databases → backend → gateway. Setup/migrate/split-databases là job một lần, exit 0 là bình thường. Runtime không tự chạy DDL.

Máy mới tự tải image công khai còn thiếu và build mọi image nội bộ từ mã nguồn. Node/npm/MySQL chỉ cần trong container; không cần cài trên host hay chuẩn bị secret thủ công. Các job dùng chung image gateway đều có khai báo build để không phụ thuộc image sẵn trên máy tác giả. Xem [KHOI_DONG_MAY_MOI.md](KHOI_DONG_MAY_MOI.md).

Mặc định có tài khoản/danh mục mẫu (`SEED_DEMO=true`), chưa tự tạo 36 bộ chứng từ (`SEED_WORKFLOWS=false`). Service demo-fixtures bỏ qua dựng chứng từ khi chưa bật cờ này. Có thể bật `SEED_WORKFLOWS=true` cho bộ UC độc lập; `--wait` chờ bước khởi tạo xong. Chi tiết: [DEMO_FIXTURES.md](DEMO_FIXTURES.md). Không seed demo trong production; chạy lại không reset fixture đã tạo.

Giao diện http://localhost:3000. Gateway có tên Compose `app`; năm backend và MySQL chỉ trong network nội bộ.

## Adminer

```powershell
docker compose --profile dev up -d adminer
```

Mở http://localhost:8080, hệ quản trị MySQL, server mysql. Chọn database và tài khoản theo bảng [SERVICE_DATABASES.md](SERVICE_DATABASES.md), ví dụ KhoHang_Warehouse / warehouse_db / warehouse123. KhoHang cũ là snapshot trước cutover, không phải dữ liệu đang hoạt động.

## Dữ liệu và migration

`docker compose down` dừng và bỏ container, giữ volumes dữ liệu/secret/backup. `down -v` xóa volumes, chỉ dùng khi chủ động bỏ dữ liệu. Build lại không xóa dữ liệu.

Clone mới tạo nguồn từ migration legacy/seed rồi chuyển sang sáu database. Sau cutover không copy/seed đè dữ liệu service. Thay schema mới phải thêm migration service, không chỉ sửa seed hay snapshot SQL. Hiện có migration service 001–019.

Không chạy migrate/seed/roles trên gateway: các thao tác này bị chặn với database service. Nâng cấp theo chuỗi job trong Compose và xem log:

```powershell
docker compose logs --tail=100 migrate split-databases
docker compose exec app node scripts/database.cjs status
```

## Kiểm thử

Từ app/: `npm test`, `npm run check`. Acceptance MySQL dùng database cô lập và các tài khoản service thật:

```powershell
docker compose build app
docker compose run --rm --no-deps -T split-databases node scripts/split-acceptance.cjs
```

Script tạo dữ liệu trong namespace acceptance, mở sáu process HTTP kiểm thử, không gọi backend dữ liệu chính. Kiểm thử browser cần Node và Edge/Chromium: `npm run test:imports:browser`, `npm run test:docker-browser`.

Cấu hình credentials/persistence: [SERVICE_DATABASES.md](SERVICE_DATABASES.md). Production: [PRODUCTION.md](PRODUCTION.md).
