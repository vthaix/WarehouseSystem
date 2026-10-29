# Clone và chạy trên máy mới

Cập nhật 24/10/2026. Cấu hình mặc định phục vụ chạy thử cục bộ.

## Chuẩn bị một lần

Cài Git và Docker Desktop, mở Docker Desktop và đợi engine chạy. Trên Windows dùng Linux containers, hoàn tất WSL 2/ảo hóa theo hướng dẫn của Docker Desktop nếu được yêu cầu. Dùng Docker Compose hiện hành đi kèm Docker Desktop; cấu hình root sử dụng `include`. Máy cần Internet để tải image/package ở lần đầu, đủ dung lượng trống và cổng 3000 còn trống.

Compose tải phần mềm bên trong container; không tự cài Docker Desktop, Git hoặc bật ảo hóa của máy. Không cần cài Node.js/npm/MySQL riêng, import SQL, tạo secret hoặc sao chép `node_modules`.

## Một lệnh khởi động

```powershell
git clone https://github.com/vthaix/WarehouseSystem.git
cd WarehouseSystem
docker compose up -d --build --wait
```

Mở http://localhost:3000. Không cần `.env` hay `deploy.env`: cấu hình có giá trị mặc định cho môi trường demo. Không copy cấu hình DB host cũ sang máy mới nếu muốn dùng MySQL Docker cục bộ.

Compose tự thực hiện:

1. Build image các service từ source và lockfile; tải base image Node/package npm khi cache chưa có.
2. Tạo secret ngẫu nhiên trong volume; giữ secret đã có ở lần chạy sau.
3. Tải và khởi tạo MySQL 8.4 trong volume mới.
4. Chạy migration nguồn, tách sáu CSDL/service user và áp dụng migration service.
5. Chạy backend rồi gateway sau khi các phụ thuộc healthy.
6. Khởi tạo tài khoản/danh mục demo. Bộ chứng từ UC tùy chọn dùng `SEED_WORKFLOWS=true`; mặc định chưa bật.

Các image ứng dụng nội bộ dùng `pull_policy: build`, không pull từ registry riêng. Các helper setup/migrate/split/reset/fixtures đều có build definition đầy đủ. MySQL/Adminer dùng image công khai và tải khi thiếu. Cache Docker giúp những lần build sau nhanh hơn; lần đầu có thể mất vài phút.

Tài khoản: [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md). Admin `admin` / `123456`; ba chủ xưởng `workshop`, `workshop2`, `workshop3` / `123456` trên CSDL mới. Không ghi đè mật khẩu đã chỉnh trên CSDL hiện hữu.

## Dùng lại và cập nhật

```powershell
docker compose up -d
git pull
docker compose up -d --build --wait
docker compose ps -a
docker compose down
```

`ps` chỉ xem trạng thái. Setup/migrate/split chạy xong có trạng thái Exited (0) là bình thường. `down` giữ dữ liệu. Không dùng `down -v` hoặc xóa volume nếu cần giữ CSDL, ảnh và secret. Git chỉ mang mã nguồn/migration/seed; dữ liệu phát sinh và ảnh upload trên máy tác giả không tự xuất hiện ở máy clone. Muốn chuyển dữ liệu thực phải backup/restore riêng.

## Khi gặp lỗi

- Không tìm thấy Docker engine/pipe: mở Docker Desktop, đợi engine chạy rồi chạy lại lệnh.
- Không tải được image/npm: kiểm tra Internet/proxy/VPN hoặc dung lượng Docker, chạy lại; không cần cài npm trên host.
- Cổng 3000 đang dùng: đặt `APP_PORT=3001` trong `.env` tại root rồi mở http://localhost:3001.
- Build không thấy source/lockfile/migration: người gửi cần commit và push đầy đủ file nguồn, không chỉ Compose. Kiểm tra `git status` trước khi push.
- Service không healthy: xem `docker compose logs --tail=100 setup mysql migrate split-databases app`.

Adminer tùy chọn: `docker compose --profile dev up -d adminer`, mở http://localhost:8080; server `mysql`. Thông tin DB trong [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md).
