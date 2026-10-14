# WarehouseSystem

Ứng dụng quản lý kho và sản xuất bánh đóng gói, Express + EJS + MySQL. Cập nhật kiến trúc ngày 14/10/2026: **5 backend HTTP và 1 web gateway**, mỗi service có entrypoint/Dockerfile và database/tài khoản riêng. Sáu database vẫn nằm trên cùng MySQL 8.4 và còn phụ thuộc SQL xuyên schema.

Chạy từ thư mục repository:

```powershell
docker compose up -d --build --wait
docker compose ps
docker compose --profile dev up -d adminer
```

Giao diện: http://localhost:3000. Adminer: http://localhost:8080 khi bật profile dev. Backend và MySQL không publish cổng ra host. Không cần cài Node/MySQL riêng để chạy Docker.

Tài khoản demo: customer, customer2, planner, purchaser, manager, staff, staff2, qc, stocktaker, workshop, director; mật khẩu mặc định 123456 khi khởi tạo mới. Dữ liệu lưu trong Docker volumes; `docker compose down` giữ dữ liệu. Build lại không reset database hoặc seed đè dữ liệu đang dùng.

- [Kiến trúc và giới hạn hiện tại](app/docs/ARCHITECTURE.md)
- [CSDL theo service](app/docs/SERVICE_DATABASES.md)
- [Chạy Docker](app/docs/DOCKER.md)
- [Tiến độ triển khai](app/docs/IMPLEMENTATION_PROGRESS.md)
- [Việc còn thiếu](app/docs/IMPLEMENTATION_BACKLOG.md)
- [Đặc tả nghiệp vụ](app/docs/SRS.md)
- [Danh mục tài liệu](app/docs/README.md)

Chưa công nhận hoàn thành toàn bộ UC hoặc sẵn sàng production. Runtime legacy còn trong mã để đối chiếu/test; Compose mặc định chạy các service riêng.
