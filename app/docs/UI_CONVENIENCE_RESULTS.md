# Kết quả cập nhật giao diện — 30/10/2026

Đã cập nhật bản chính với dashboard theo vai trò, form có quay lại và thanh điều khiển cố định, thông tin mở rộng dạng xổ xuống, nhấn mạnh chứng từ mới/chưa xem, khu vực kế hoạch mua đã duyệt chờ đặt mua và ảnh 33 mặt hàng.

| Kiểm tra đã thực thi | Kết quả |
| --- | --- |
| Unit hiện hành | 73/73 đạt |
| Bộ trình duyệt hiện hành | 13/13 có kết quả đạt cuối cùng |
| Bộ giao diện mới | Đạt: dashboard của 9 vai trò, chọn kế hoạch mua vào form, 33 ảnh truy cập được, quay lại giữ DOM/sự kiện/bản nháp, X cố định khi cuộn, điện thoại, ảnh khách đặt hàng |
| Bộ API mới | Đạt: thêm/sửa/bỏ ảnh thật; quyền khách hàng bị chặn; đường dẫn không hợp lệ, ảnh không tồn tại và phiên bản cũ bị chặn; đánh dấu đã xem chỉ ảnh hưởng tài khoản hiện tại; không làm mất việc chờ duyệt; nguồn mua chưa có đơn |
| Seed ảnh chạy lại | Đạt: ảnh đã chủ động bỏ không tự được điền lại; hoàn trả ảnh thử sau kiểm tra |
| Cú pháp JavaScript | Đạt |
| Đồng bộ router, module và tài liệu sinh từ mã | Đạt |

Kết quả mới: `app/artifacts/workspace-ux/results.json`, `regression-final.json`, ảnh dashboard theo tài khoản, form mua và form điện thoại. Bộ mới chạy trên project riêng `warehouse-mono-review-20261029`, không chạy reset lên bản chính.

Các lần đầu của bộ trình duyệt cũ vẫn được giữ làm log phát triển. Các ca dashboard, kho, lịch sử ngoại lệ và ghi chú được cập nhật để kiểm tra đúng bố cục/thao tác mới, không bỏ kiểm tra nội dung hoặc quyền. Bộ tra cứu kho chạy lại riêng lần cuối và đạt cho 2 vai trò được phép, 7 vai trò bị chặn; kết quả cuối kết hợp với 12 bộ đã đạt ở lượt chạy đầy đủ. DB test có bông lan cuộn mang đơn vị cũ `gói`; chỉ dữ liệu đó trên DB test được đưa về `cái` theo seed trước khi chạy lại ca khách đặt hàng. Không dùng việc này để thay đổi đơn vị trên DB chính.

Không cần thêm cột CSDL vì `MatHang.DuongDanAnh` đã có. Seed chỉ bổ sung ảnh một lần, giữ chứng từ và ảnh đã chọn. Không thay đổi bản microservice lưu trữ hoặc file đặc tả Word trong đợt giao diện này.

Phân biệt **Mới nhất** với **Chưa xem**: Mới nhất là dòng đầu trong kết quả đã sắp xếp; Chưa xem dựa vào thông báo chưa đọc của tài khoản. Không có thông báo tương ứng thì không tự suy đoán người dùng chưa xem. Dashboard lấy dữ liệu khi tải trang; số việc mới tự làm mới định kỳ. Biểu đồ là khối lượng theo chức năng, không phải lịch sử doanh thu hoặc tỷ lệ hoàn thành sản xuất.

Thiết kế ảnh và hướng dẫn sử dụng: [UI_CONVENIENCE.md](UI_CONVENIENCE.md). Các kiểm tra trên không khẳng định bao quát mọi tổ hợp đầu vào hoặc mọi sự cố hạ tầng.
