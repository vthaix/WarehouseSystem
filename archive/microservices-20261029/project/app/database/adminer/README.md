# Adminer và schema nguồn

KhoHang.sql là schema nguồn lịch sử dùng cho bootstrap/cutover, không phải toàn bộ database runtime hiện tại. Sau cutover dữ liệu hoạt động nằm trong sáu database owner; KhoHang giữ snapshot trước chuyển đổi.

Chạy từ root: docker compose --profile dev up -d adminer. Mở http://localhost:8080, chọn MySQL, server mysql. Chọn schema/tài khoản service tương ứng, ví dụ KhoHang_Warehouse / warehouse_db / warehouse123. Danh sách đầy đủ: [SERVICE_DATABASES.md](../../docs/SERVICE_DATABASES.md).

Không import KhoHang.sql lại vào database đã dùng. Không sửa schema gốc/migration đã áp dụng; thêm migration service cho thay đổi mới. identifiers.json ánh xạ tên bảng/cột vật lý tiếng Việt không dấu với identifier API/JSON.

Tài khoản runtime có quyền theo owner và compatibility grants, không dùng quyền root để chạy ứng dụng. Dữ liệu lưu trong volume, không phụ thuộc seed lại.
