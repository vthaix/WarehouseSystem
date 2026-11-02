# Thao tác nhanh và số lượng điền sẵn

- Các mục phía trên danh sách chỉ hiển thị nguồn còn việc phải thực hiện. Xử lý xong thì ẩn mục đó; dữ liệu đã lưu vẫn xem trong danh sách và chi tiết.
- Nút Tạo mới chọn chứng từ nguồn; nút thao tác nhanh chọn sẵn nguồn. Cả hai dùng cùng form và cùng cách lưu.
- QC theo kế hoạch: còn dòng chưa ghi kết quả mới hiển thị thao tác nhanh, dù Ban kiểm kê vẫn đang làm.
- Ban kiểm kê: còn dòng chưa ghi số đếm mới hiển thị thao tác nhanh, dù QC vẫn đang làm.
- Lô hàng: nguồn đủ kết quả, còn lượng đạt chưa tạo lô mới xuất hiện. Đợt đã đóng nhưng còn phần đạt chưa tạo lô vẫn cần xử lý; trạng thái đóng đợt không đồng nghĩa đã tạo lô.
- Lô hàng → Tạo mới cho quản lý kho chọn kết quả kiểm tra, sau đó mở đúng form tạo lô như nút nhanh. Không sử dụng đường nhận lại toàn bộ đơn mua.
- Kế hoạch bù: nút nhanh và Tạo mới đều có thể chọn nguồn biên bản còn thiếu; khi đã lập bù đủ thì ẩn mục đó.
- Kế hoạch mua đã có đơn mua: bỏ thẻ chờ đặt mua. Khi hết nguồn chờ, ẩn cả khung thao tác nhanh.
- Các ô số lượng có nguồn điền sẵn lượng còn có thể thực hiện: yêu cầu/đơn mua sau khi trừ phần đã nhận, kế hoạch sau khi trừ phần đã báo cáo, lượng còn có thể phân công. Cho phép sửa theo thực tế.
- Khi sửa chứng từ, giữ số đã lưu; không ghi đè bằng giá trị tối đa mới. Lượng lỗi mặc định 0; số đạt cân đối theo số kiểm. Các số chưa có giới hạn nghiệp vụ như số lượng đặt hàng mới hoặc giá chưa có báo giá không tự đặt một giá trị tối đa giả định.
- Form phân công giữ nguyên. Số tự điền lấy tối đa theo nhu cầu còn lại và lượng của lô/vị trí dành cho yêu cầu đang xem, bao gồm phần đã giữ chỗ cho chính yêu cầu; loại trừ giữ chỗ của yêu cầu khác. Khi lưu vẫn kiểm tra quyền, tồn và lượng đã thực hiện; chỉ phần phân công chưa thực hiện được thay đổi, không ghi lại phiếu đã phát sinh.
- Kiểm tra bổ sung: `e2e/dispatch-default-quantity.cjs` bao gồm yêu cầu đã phân công đủ, chưa phân công, giữ chỗ bởi yêu cầu khác, đã xuất một phần và không còn tồn khả dụng.

## Xác nhận và chỉnh phân công

Form phân công không chọn ngày giờ, thời điểm thực hiện lấy lúc xác nhận. Chế độ `REPLACE_PENDING` lưu nội dung phân công chưa thực hiện của yêu cầu đang mở. Xác nhận lại cùng nội dung trả về các công việc hiện có, không cộng phân công lần thứ hai. Khi thay đổi, chỉ phần chưa thực hiện được thay thế trong cùng giao dịch; phiếu kho đã ghi và tồn đã phát sinh không bị xóa hay ghi lại. Nếu dữ liệu mới không hợp lệ, cả thay đổi được hoàn tác và phân công cũ còn nguyên. API cũ không gửi chế độ này tiếp tục có nghĩa thêm phân công.

Kiểm tra thực tế MySQL trên môi trường thử riêng: `node scripts/immediate-dispatch-smoke.cjs`. Bao gồm bỏ ngày giờ, xác nhận lặp, sửa lượng, đổi nhân viên, hoàn tác khi vượt nhu cầu và bảo toàn phiếu xuất một phần. Không chạy ghi thử trên hệ thống chính.

Kiểm tra liên quan: `e2e/pending-source-actions.cjs`, `e2e/finished-default-remaining.cjs`, `e2e/qc-create-routing.cjs`, `e2e/count-create-results.cjs`. Test thao tác lưu dùng phản hồi API có kiểm soát và chặn ghi; đăng nhập thật, không thay dữ liệu kho đang sử dụng.
