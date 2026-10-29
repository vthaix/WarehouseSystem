# WarehouseSystem

Máy mới chỉ cần **Git, Docker Desktop đã mở (Linux containers)** và Internet cho lần build đầu. Không cần cài Node.js, npm, MySQL hoặc tự tạo file `.env`/`deploy.env`.

```powershell
git clone https://github.com/vthaix/WarehouseSystem.git
cd WarehouseSystem
docker compose up -d --build --wait
```

Mở **http://localhost:3000**. Compose tự tải image Node/MySQL còn thiếu, cài dependency trong image, tạo secret, khởi tạo/migrate CSDL và tạo tài khoản/danh mục mẫu. Image ứng dụng được build từ mã nguồn, không cần đăng nhập registry riêng. Danh sách tài khoản mới nhất: [DEMO_ACCOUNTS.md](app/docs/DEMO_ACCOUNTS.md), gồm `admin`, `workshop`, `workshop2`, `workshop3`; mật khẩu mẫu `123456`.

Lần sau chạy `docker compose up -d`; sau `git pull` dùng lại lệnh có `--build`. Các image nội bộ có chính sách build nên `up` cũng kiểm tra build cache. Dữ liệu nằm trong volume trên từng máy, không tự đồng bộ dữ liệu đang dùng qua Git. `docker compose down` giữ dữ liệu; không dùng `down -v` nếu muốn giữ CSDL. Hướng dẫn máy mới và xử lý lỗi: [KHOI_DONG_MAY_MOI.md](app/docs/KHOI_DONG_MAY_MOI.md).

Máy mới chỉ cần **Git, Docker Desktop đã mở (Linux containers)** và Internet cho lần build đầu. Không cần cài Node.js, npm, MySQL hoặc tự tạo file `.env`/`deploy.env`.

```powershell
git clone https://github.com/vthaix/WarehouseSystem.git
cd WarehouseSystem
docker compose up -d --build --wait
```

Mở **http://localhost:3000**. Compose tự tải image Node/MySQL còn thiếu, cài dependency trong image, tạo secret, khởi tạo/migrate CSDL và tạo tài khoản/danh mục mẫu. Image ứng dụng được build từ mã nguồn, không cần đăng nhập registry riêng. Danh sách tài khoản mới nhất: [DEMO_ACCOUNTS.md](app/docs/DEMO_ACCOUNTS.md), gồm `admin`, `workshop`, `workshop2`, `workshop3`; mật khẩu mẫu `123456`.

Lần sau chạy `docker compose up -d`; sau `git pull` dùng lại lệnh có `--build`. Các image nội bộ có chính sách build nên `up` cũng kiểm tra build cache. Dữ liệu nằm trong volume trên từng máy, không tự đồng bộ dữ liệu đang dùng qua Git. `docker compose down` giữ dữ liệu; không dùng `down -v` nếu muốn giữ CSDL. Hướng dẫn máy mới và xử lý lỗi: [KHOI_DONG_MAY_MOI.md](app/docs/KHOI_DONG_MAY_MOI.md).

Ứng dụng quản lý kho và sản xuất bánh đóng gói, Express + EJS + MySQL. Cập nhật kiến trúc ngày 14/10/2026: **5 backend HTTP và 1 web gateway**, mỗi service có entrypoint/Dockerfile và database/tài khoản riêng. Sáu database vẫn nằm trên cùng MySQL 8.4 và còn phụ thuộc SQL xuyên schema.

# Tui không deploy database nên muốn xem trực tiếp phải chạy adminer của docker á

```powershell
docker compose --profile dev up -d adminer 
```

# Đăng nhập vào adminer bằng cái này nhé

| Service / mục đích | Database | Username (tài khoản) | Password (mật khẩu mặc định) |
| --- | --- | --- | --- |
| Identity — tài khoản và xác thực | `KhoHang_Identity` | `identity_db` | `identity123` |
| Business — đơn hàng, kế hoạch, sản xuất, mua hàng | `KhoHang_Business` | `business_db` | `business123` |
| Warehouse — kho, QC, nhập/xuất, kiểm kê | `KhoHang_Warehouse` | `warehouse_db` | `warehouse123` |
| Notification — thông báo | `KhoHang_Notification` | `notification_db` | `notification123` |
| Reporting — báo cáo | `KhoHang_Reporting` | `reporting_db` | `reporting123` |
| Web gateway — phiên đăng nhập | `KhoHang_Gateway` | `gateway_db` | `gateway123` |
| Database nguồn cũ / khởi tạo migration | `KhoHang` | `warehouse_app` | Không cố định; được lưu trong secret `db_password` |

# Danh sách tài khoản nhé

| Tài khoản | Mật khẩu mẫu | Vai trò | Mã vai trò |
| --- | --- | --- | --- |
| `customer` | `123456` | Khách hàng | `CUSTOMER` |
| `customer2` | `123456` | Khách hàng thứ hai | `CUSTOMER` |
| `planner` | `123456` | Bộ phận lập kế hoạch | `PLANNER` |
| `purchaser` | `123456` | Bộ phận mua hàng | `PURCHASER` |
| `manager` | `123456` | Quản lý kho | `WAREHOUSE_MANAGER` |
| `staff` | `123456` | Nhân viên kho | `WAREHOUSE_STAFF` |
| `staff2` | `123456` | Nhân viên kho thứ hai | `WAREHOUSE_STAFF` |
| `qc` | `123456` | Bộ phận QC/AC | `QC_INSPECTOR` |
| `stocktaker` | `123456` | Ban kiểm kê | `STOCKTAKER` |
| `workshop` | `123456` | Chủ xưởng | `WORKSHOP_OWNER` |
| `director` | `123456` | Ban giám đốc | `DIRECTOR` |


Giao diện: http://localhost:3000. Adminer: http://localhost:8080 khi bật profile dev. Backend và MySQL không publish cổng ra host. Không cần cài Node/MySQL riêng để chạy Docker.

## Quy ước mã chứng từ

Mã sinh mới gồm loại chứng từ, tên khách hàng hoặc nguồn liên quan đã bỏ dấu, và số thứ tự. Ví dụ đơn hàng thứ hai của Trần Văn A là `DH-TRANVANA-02`; kế hoạch sản xuất đầu tiên cho đơn đó là `KHSX-TRANVANA-02`. Nếu một đơn có nhiều kế hoạch, kế hoạch tiếp theo thêm số thứ tự kế hoạch, như `KHSX-TRANVANA-02-02`. Báo cáo sản xuất dùng `BCSX`, báo cáo thành phẩm dùng `BCTP`; các phiếu kho, kiểm kê, QC và công việc có tiền tố nghiệp vụ và phần nhận diện nguồn.

Giao diện trình bày mã dễ đọc cho các đơn hàng, kế hoạch và báo cáo cũ. Mã lưu trong lịch sử cũ được giữ nguyên để các thông báo và chứng từ đã phát hành vẫn đối chiếu được.

Tài khoản demo: customer, customer2, planner, purchaser, manager, staff, staff2, qc, stocktaker, workshop, director; mật khẩu mặc định 123456 khi khởi tạo mới. Dữ liệu lưu trong Docker volumes; `docker compose down` giữ dữ liệu. Build lại không reset database hoặc seed đè dữ liệu đang dùng.

- [Kiến trúc và giới hạn hiện tại](app/docs/ARCHITECTURE.md)
- [CSDL theo service](app/docs/SERVICE_DATABASES.md)
- [Chạy Docker](app/docs/DOCKER.md)
- [Tiến độ triển khai](app/docs/IMPLEMENTATION_PROGRESS.md)
- [Việc còn thiếu](app/docs/IMPLEMENTATION_BACKLOG.md)
- [Đặc tả nghiệp vụ](app/docs/SRS.md)
- [Danh mục tài liệu](app/docs/README.md)

Chưa công nhận hoàn thành toàn bộ UC hoặc sẵn sàng production. Runtime legacy còn trong mã để đối chiếu/test; Compose mặc định chạy các service riêng.
