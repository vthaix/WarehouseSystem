# Dữ liệu mẫu MySQL

Ứng dụng và Adminer dùng chung một database `KhoHang`; xem [adminer/README.md](adminer/README.md) để biết cấu trúc và cách đăng nhập.

Seed development tự chạy khi `SEED_DEMO=true` (mặc định Docker). Nạp lại tại repository root:

```sh
docker compose exec app node scripts/database.cjs seed
```

Sau khi cập nhật mã seed, cần `docker compose up -d --build --wait` để image nhận thay đổi.

Trên DB mới, seed tạo 9 vai trò, 11 tài khoản, 2 khách hàng, 2 xưởng, 4 danh mục, 5 đơn vị, 3 kho, 7 vị trí kho, 4 nhà cung cấp và 13 mặt hàng. Bao gồm nguyên vật liệu, phụ kiện, bao bì, thành phẩm công bố, mẫu nội bộ chưa công bố và vật liệu ngừng sử dụng để thử bộ lọc/phân quyền. Thông tin liên hệ là minh họa, email dùng example.test.

Seed dùng mã nghiệp vụ và FK thực tế, chạy trong transaction/khóa seed; chạy lại không thêm trùng hoặc ghi đè dữ liệu đã có, kể cả password. Không tạo giả audit/session/login_attempts/idempotency hay số dư tồn kho. Các bảng nghiệp vụ khác đã có schema nhưng module ứng dụng còn đang phát triển nên chưa có dữ liệu mẫu SQL. Seed bị chặn ở production.
