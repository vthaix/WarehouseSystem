# Bản kiến trúc microservice trước khi chuyển mono

`project/` chứa bản mã **trước khi di chuyển các mô-đun**, lấy từ bản sao lưu đã kiểm tra bằng SHA-256: 409 tệp mã/cấu hình/kiểm thử và các tài liệu trong `app/docs`. Có đầy đủ Docker Compose, Dockerfile từng service, schema, migration, seed và mã nguồn microservice. Các thay đổi mono ở thư mục làm việc chính không được đưa ngược vào bản lưu này.

Tệp môi trường chứa thông tin riêng không đưa vào Git. Bản sao đầy đủ có cả tệp môi trường nằm tại `backups/mono-refactor-20261029/before-refactor.zip`, với danh sách kiểm tra `manifest.json`; thư mục này được Git bỏ qua. Khi sao lưu sang máy khác, hãy chép riêng bản ZIP đó nếu cần giữ cấu hình cá nhân.

Để chạy lại mã microservice độc lập:

```powershell
cd archive/microservices-20261029/project
docker compose -p warehouse-micro-backup up -d --build --wait
```

Lệnh trên dùng project và volume riêng, không tự lấy dữ liệu volume của lần chạy cũ. Nếu cổng 3000 đang được bản mono sử dụng, đặt `APP_PORT=3001` trong môi trường trước khi chạy. Muốn khôi phục dữ liệu cũ phải dùng đúng bản sao SQL hoặc volume cũ; bản mã nguồn không phải bản sao dữ liệu MySQL.

Các volume MySQL cũ được giữ nguyên. Không chạy `docker compose down -v` hoặc xóa volume cũ khi chưa sao lưu dữ liệu. Khi Docker hoạt động trở lại, cần xuất dữ liệu thật riêng trước khi chuyển dữ liệu từ các schema cũ sang `warehouse_db`. Việc thử nghiệm bản mono dùng volume riêng.
