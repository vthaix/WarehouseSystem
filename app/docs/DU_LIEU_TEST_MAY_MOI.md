# Dữ liệu test khi clone trên máy mới

Máy mới không cần bản SQL trong backups để bắt đầu kiểm tra. Docker mặc định bật `SEED_DEMO=true`: job migrate tạo dữ liệu nền, job split chuyển vào các database service, sau đó job demo-fixtures dựng chứng từ qua API khi ứng dụng đã sẵn sàng. Danh sách 36 bộ theo trạng thái xem [DEMO_FIXTURES.md](DEMO_FIXTURES.md).

## Cách chạy

```powershell
git clone https://github.com/vthaix/WarehouseSystem.git
cd WarehouseSystem
docker compose up -d --build --wait
```

Mở http://localhost:3000. Không dùng `--env-file deploy.env`; file đó là bản chuẩn bị cho host ngoài. Dùng cấu hình development mặc định, không đặt NODE_ENV=production hoặc SEED_DEMO=false khi muốn khởi tạo tài khoản mẫu.

## Dữ liệu có sẵn trên volume mới

| Dữ liệu | Nội dung |
| --- | --- |
| Tài khoản | 11 tài khoản: customer, customer2, planner, purchaser, manager, staff, staff2, qc, stocktaker, workshop, director; mật khẩu mặc định 123456 |
| Danh mục | NVL, thành phẩm, bao bì, phụ liệu làm bánh |
| Mặt hàng | Bột mì, đường, bơ, trứng, sữa bột, thùng carton, hộp giấy; bánh quy bơ, bánh bông lan vani, bánh quy chocolate, bánh cuộn |
| Trường hợp đặc biệt | Bánh mẫu chưa công bố và NVL ngừng sử dụng để thử lọc/quyền lựa chọn |
| Kho | Kho nguyên liệu, kho bánh đóng gói, kho bao bì |
| Vị trí | A-01/A-02/A-03, B-01/B-02, C-01/C-02 |
| Nhà cung cấp | 4 NCC mẫu: nguyên liệu, bao bì, bơ sữa, bột/đường |
| Xưởng | Xưởng bánh ngọt đóng gói và xưởng nướng/đóng gói; tài khoản workshop được phân công theo seed |
| Đơn vị | kg, cái, mét, bộ, hộp |

Mật khẩu có thể khác nếu người khởi tạo đã ghi đè DEMO_PASSWORD. Xem [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md).

## Bắt đầu test thế nào?

1. customer đăng nhập, xem bánh mẫu đã công bố và đặt đơn.
2. planner tiếp nhận, tạo kế hoạch; director duyệt.
3. Thực hiện các bước mua/QC/nhập/xuất/sản xuất/kiểm kê theo [LUONG_KIEM_TRA_THUC_TE.md](LUONG_KIEM_TRA_THUC_TE.md).

**Có chứng từ mẫu để thử từng UC độc lập:** đơn chờ tiếp nhận, kế hoạch chờ duyệt, QC, yêu cầu nhập/xuất đã phân công, báo cáo thành phẩm, phiếu đã ghi sổ và các giai đoạn kiểm kê. Tồn được tạo qua phiếu nhập thật, không gán số dư trực tiếp. Đợi log `DEMO WORKFLOWS READY` của demo-fixtures trước khi kiểm tra; xem bảng nhãn/UC ở DEMO_FIXTURES.md.

Nếu muốn máy khác mở lên thấy chính các chứng từ/tồn hiện có của máy nguồn, cần chuyển bản backup sáu database và ảnh riêng. Đó là lựa chọn khác với khởi tạo bộ dữ liệu mẫu; không import đè bản backup vào CSDL đã seed khi chưa có quy trình restore tương ứng.

## File dữ liệu được đưa lên Git

- `app/src/repositories/seed.js`: tài khoản và dữ liệu nền ban đầu.
- `app/database/seeders/foundation.js`: khởi tạo dữ liệu mẫu MySQL.
- `app/database/seeders/sample-catalog.js`: danh mục bánh, NVL, kho, NCC, xưởng mở rộng.
- `app/docker-compose.yml`: mặc định bật seed ở job khởi tạo.
- `app/scripts/seed-demo-workflows.cjs`: dựng các bộ chứng từ và trạng thái qua API; lưu checkpoint để chạy lại không reset dữ liệu đã dùng.

Các file trên là source của dự án và cần commit/push cùng code. Thư mục backups và volume Docker không cần đưa lên Git để máy mới có dữ liệu nền.

Seed không ghi đè mật khẩu người dùng đã tồn tại. Sau khi đã tách database, hệ thống không seed lại database nguồn cũ để tránh ghi đè/cắt chuyển lại dữ liệu. Volume đã sử dụng không được coi là máy mới; build lại không reset dữ liệu. Không chạy `down -v` trên máy có dữ liệu cần giữ.
