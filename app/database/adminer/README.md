# Database KhoHang

`KhoHang` là **database dự án duy nhất** của ứng dụng và Adminer. [`KhoHang.sql`](KhoHang.sql) tạo 49 bảng tiếng Việt không dấu và 97 khóa ngoại; ứng dụng tạo thêm bảng `LichSuCSDL` để ghi migration. Ví dụ: `DonHang`, `ChiTietDonHang`, `MatHang`, `LoHang`, `PhieuKho`, `TonKho`. Tên cột, khóa và chỉ mục cũng dùng tiếng Việt không dấu.

## Xem và sửa dữ liệu trong Adminer

1. Chạy `docker compose --profile dev up -d --build --wait` tại thư mục `WarehouseSystem`.
2. Mở http://localhost:8080, chọn **MySQL**.
3. Nhập server `mysql`, user `warehouse_app`, database `KhoHang`. Mật khẩu MySQL được sinh riêng trên máy; xem bằng `docker compose exec app node scripts/show-demo-login.cjs` (dòng `Database password`).

Tài khoản `warehouse_app` có toàn quyền trên **KhoHang** để người thiết kế thao tác trong Adminer. Vai trò của người dùng sản phẩm (khách hàng, nhân viên kho, quản lý...) được kiểm tra trong code ứng dụng. Không tạo một database riêng cho từng vai trò.

Docker tự tạo schema và dữ liệu mẫu khi khởi động với volume mới. **Không import lại** `KhoHang.sql` vào database đã có bảng. Nếu tạo bằng MySQL/Adminer thủ công, trước tiên tạo database trống `KhoHang` với `utf8mb4` và `utf8mb4_unicode_ci`, sau đó import file SQL một lần.

Giá trị trạng thái như `ACTIVE`, `SUBMITTED`, `AVAILABLE` là mã nghiệp vụ, không phải tên bảng/cột và được giữ nguyên để ứng dụng xử lý. Các quy tắc liên bảng như quyền truy cập, tổng số lượng và chuyển trạng thái nằm trong transaction/service của ứng dụng.

`generate_schema.py` tạo lại `KhoHang.sql` và `identifiers.json` từ DDL tham chiếu trong `docs/DATABASE.md`. Chạy `python3 database/adminer/generate_schema.py` từ thư mục `app` khi thay đổi thiết kế.
