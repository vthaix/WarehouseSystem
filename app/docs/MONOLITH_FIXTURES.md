# Dữ liệu test từng UC của bản mono

Mặc định máy mới có tài khoản, 3 xưởng và danh mục bánh. Các chứng từ mẫu chỉ được tạo khi chủ động chạy:

```powershell
docker compose exec -T -e SEED_DEMO=true app node scripts/seed-demo-workflows.cjs
docker compose exec -T app node scripts/verify-demo-fixtures.cjs
```

Công cụ dựng 36 bộ trạng thái bằng API thật. Đơn mua mẫu cũng phải có kế hoạch mua đã được duyệt. Chạy lại dùng checkpoint, không tự đặt lại trạng thái đã test. Nút xóa dữ liệu test sao lưu rồi xóa các chứng từ và chuyển checkpoint sang thư mục lưu; giữ tài khoản, danh mục và đơn vị hiện có.

Công cụ không đổi đơn vị của các mặt hàng đã có. Ba mặt hàng TP-DEMO tùy chọn dùng đơn vị hộp hoặc gói theo tên sản phẩm. Ảnh danh mục nằm trong `app/src/images/categories`; ảnh báo cáo trong `app/src/images/production-reports`.

Danh sách 36 bộ và tài khoản thao tác được giữ trong [DEMO_FIXTURES.md](DEMO_FIXTURES.md).
