# Cấu hình kết nối CSDL và chuyển MySQL lên host

Đối chiếu code ngày 17/10/2026. Đây là hướng dẫn vị trí cấu hình; chưa thay đổi kết nối đang chạy.

## Cần mở file nào?

| File | Vai trò / khi nào chỉnh |
| --- | --- |
| `app/docker-compose.yml` | Cấu hình đang dùng khi chạy Docker: host/port chung trong `x-service-env`, database/user/password riêng ở `environment` của sáu service |
| `docker-compose.yml` ở thư mục gốc | Đặt tên project và include Compose của app; không chứa cấu hình kết nối chi tiết |
| `app/.env.example` | Mẫu biến môi trường; sửa file này không làm thay đổi kết nối thực tế |
| `app/.env` | Được `src/config/env.js` đọc khi chạy Node trực tiếp; giữ ngoài Git |
| `app/src/config/database.js` | Tạo pool mysql2 từ DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD; chỉ sửa khi cần bổ sung khả năng kết nối như TLS |
| `app/src/config/env.js` | Đọc `.env` và các biến `*_FILE` chứa secret |
| `app/src/config/service-credentials.js` | Mặc định user/password của từng service và hỗ trợ ghi đè bằng biến môi trường |
| `app/src/config/service-databases.js` | Ánh xạ tên schema/owner, dùng cho truy vấn liên schema; không phải nơi điền host/password |
| `app/database/services/migrations/` | Migration cấu trúc CSDL; không dùng thay cấu hình host |

## Khi vẫn chạy ứng dụng bằng Docker

Hiện `app/docker-compose.yml` ghi cố định:

```yaml
x-service-env: &service-env
  DB_HOST: mysql
  DB_PORT: "3306"
```

Vì vậy **chỉ thêm DB_HOST vào .env chưa đổi được host của container**. Khi triển khai DB ngoài Docker, sửa hai dòng thành biến môi trường hoặc ghi đè chúng bằng cấu hình Compose triển khai:

```yaml
  DB_HOST: ${DB_HOST:-mysql}
  DB_PORT: ${DB_PORT:-3306}
```

File mẫu có sẵn tại `deploy.env.example` ở thư mục gốc WarehouseSystem. Tạo file cấu hình riêng bằng PowerShell tại thư mục gốc:

```powershell
Copy-Item deploy.env.example deploy.env
```

Sau đó mở `deploy.env` và điền thông tin host thực tế. File này được Git bỏ qua để không commit mật khẩu. Đây là mẫu chuẩn bị cấu hình, chưa phải cấu hình deploy hoàn chỉnh; vẫn cần các thay đổi Compose được mô tả bên dưới.

Ví dụ nội dung file môi trường riêng `deploy.env`:

```dotenv
DB_HOST=mysql.example.com
DB_PORT=3306
DB_NAME=KhoHang
IDENTITY_DB_USER=identity_db
IDENTITY_DB_PASSWORD=replace-with-host-password
BUSINESS_DB_USER=business_db
BUSINESS_DB_PASSWORD=replace-with-host-password
WAREHOUSE_DB_USER=warehouse_db
WAREHOUSE_DB_PASSWORD=replace-with-host-password
NOTIFICATION_DB_USER=notification_db
NOTIFICATION_DB_PASSWORD=replace-with-host-password
REPORTING_DB_USER=reporting_db
REPORTING_DB_PASSWORD=replace-with-host-password
GATEWAY_DB_USER=gateway_db
GATEWAY_DB_PASSWORD=replace-with-host-password
```

Khi đọc file để thay biến Compose, dùng tùy chọn rõ ràng `docker compose --env-file deploy.env ...`. Đường dẫn `app/.env` tự động được Node đọc không đồng nghĩa mọi cách gọi Compose đều lấy cùng file. Không thêm mật khẩu host vào `.env.example` hay file tài khoản demo.

Trong Compose, `DB_NAME=KhoHang` là **tiền tố**: sáu service tự dùng KhoHang_Identity, KhoHang_Business, KhoHang_Warehouse, KhoHang_Notification, KhoHang_Reporting và KhoHang_Gateway. Nếu host cấp tên khác, cần đối chiếu quy tắc suffix và mapping trước khi thay, không điền một tên DB duy nhất cho cả sáu service.

**Chưa thể chỉ đổi hai dòng rồi chạy Compose hiện tại như production:** cấu hình còn phụ thuộc MySQL nội bộ, job migrate/split và secret/provisioning. Cần cấu hình deploy riêng để chuyển dependency/job sang đúng DB ngoài; không chạy job cấp quyền/cắt chuyển bằng thông tin DB mới khi chưa kiểm tra phạm vi tác động. Cấu hình Adminer cũng cần chọn server ngoài nếu muốn xem DB host.

## Khi chạy Node trực tiếp trên host

Mỗi tiến trình service cần cấu hình riêng, ví dụ warehouse-service:

```dotenv
STORAGE_DRIVER=mysql
SERVICE_DB_LAYOUT=split
DB_HOST=mysql.example.com
DB_PORT=3306
DB_NAME=KhoHang_Warehouse
DB_USER=warehouse_db
DB_PASSWORD=replace-with-host-password
```

Các tiến trình khác dùng database/tài khoản tương ứng. Các URL service và secret xác thực nội bộ vẫn phải cấu hình theo môi trường deploy. Không dùng một `app/.env` với DB_NAME của Warehouse cho tất cả tiến trình.

Nếu dùng `DB_PASSWORD` trực tiếp, không đồng thời đặt `DB_PASSWORD_FILE`. Loader từ chối khi cả hai cùng được cấu hình. Các service split trong Compose hiện đã xóa giá trị DB_PASSWORD_FILE để nhận mật khẩu riêng.

## Điều kiện của host MySQL

- Runtime hiện dùng **sáu schema trên cùng một MySQL server**, có JOIN/FK/view và quyền truy cập liên schema. Host cần hỗ trợ mô hình này; không thể chuyển tùy ý thành sáu server độc lập bằng cách đổi host.
- Cần chuyển cả schema, dữ liệu, migration/checkpoint và cấp đúng quyền cho sáu tài khoản; thay host không tự chuyển dữ liệu. Thư mục seed không phải bản sao dữ liệu đang sử dụng.
- `database.js` hiện chưa cấu hình TLS/CA. Nếu nhà cung cấp bắt buộc TLS, phải bổ sung tùy chọn kết nối phù hợp và cấu hình CA trước khi kết nối.
- Kiểm tra host/port truy cập được từ nơi chạy service, tên schema thực tế và quyền tài khoản. Shared hosting chỉ cho một database hoặc cấm truy vấn liên schema có thể không phù hợp với cấu trúc hiện tại.
- Sao lưu/khôi phục dữ liệu trước cắt chuyển. Ảnh danh mục nằm ở volume riêng, không nằm trong bản dump MySQL; cần chuyển ảnh nếu chuyển cả ứng dụng.

Sau khi chuẩn bị cấu hình deploy và chuyển dữ liệu, kiểm tra health của các service, đăng nhập, đọc danh mục/tồn và chạy luồng [kiểm tra thực tế](LUONG_KIEM_TRA_THUC_TE.md). Xem thêm [SERVICE_DATABASES.md](SERVICE_DATABASES.md) và [PRODUCTION.md](PRODUCTION.md).
