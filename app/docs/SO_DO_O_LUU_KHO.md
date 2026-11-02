# Sơ đồ ô lưu kho

- Mỗi cột dọc là một khu. Phía trong nằm trên sơ đồ, lối nhập/xuất nằm dưới.
- Bấm tên khu để xem hàng của toàn khu; bấm mã ô để chỉ xem hàng trong ô đó.
- Theo chiều từ ngoài vào: hạn còn lại dưới 3 tháng; từ 3 đến hết 6 tháng; trên 6 tháng. Mốc tháng tính theo lịch và ngày Việt Nam, không dùng cố định 90/180 ngày.
- Queue xuất vẫn ưu tiên hạn hết trước, cùng hạn thì thời gian nhập kho trước. Nhãn ô hướng dẫn xếp hàng, không thay thế thứ tự queue.
- Điều phối nhập kho: bấm ô hoặc chọn vị trí để phân công. Mã ô được gửi bằng `location_id` và lưu trên phân công; nhân viên ghi nhập theo ô đó.
- Trong form điều phối, sơ đồ mặc định thu gọn. Bấm **Xem vị trí trong kho** để mở; ô đang chọn luôn hiển thị bên ngoài. Tra cứu kho vẫn hiển thị sơ đồ đầy đủ.
- Điều phối xuất kho: chỉ bật các ô có tồn khả dụng của lô đang chọn. Bấm ô để chọn vị trí lấy hàng.
- Nhãn là hướng dẫn bố trí. Hệ thống không tự chuyển tồn hiện có sang ô khác khi cập nhật giao diện, không tự thay đổi lịch sử nhập/xuất.

Kiểm tra: `node --test tests/unit/storage-queue.test.js`; `node e2e/warehouse-seats.cjs` (trong thư mục app, ứng dụng chạy tại localhost:3000). Test trình duyệt dùng dữ liệu giả lập cho phần điều phối và chặn ghi, không tạo phân công trên kho thật.
