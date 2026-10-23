# Xác nhận số lượng kế hoạch vượt nguồn

Cập nhật ngày 23/10/2026.

Khi tạo, sửa hoặc phê duyệt kế hoạch có số lượng vượt nguồn, hệ thống hỏi xác nhận thay vì chặn bắt buộc:

- Kế hoạch sản xuất vượt số lượng đơn hàng, tính cả các kế hoạch chưa hủy của đơn.
- Kế hoạch bán vượt số lượng đơn hàng hoặc lượng thành phẩm của báo cáo nguồn.
- Kế hoạch mua vượt nhu cầu nguyên vật liệu trong báo cáo/yêu cầu hoặc kế hoạch sản xuất nguồn.

Hộp xác nhận dùng modal trắng–đỏ cùng giao diện hệ thống. Chọn **Xác nhận tiếp tục** để lưu đúng số lượng đã nhập. Chọn **Quay lại chỉnh sửa**, dấu × hoặc Esc để giữ form và chỉnh sửa; chưa có dữ liệu được ghi ở lần hỏi xác nhận. Modal co giãn trên điện thoại, hỗ trợ bàn phím và đặt tiêu điểm ban đầu vào nút quay lại. Giám đốc xác nhận lại khi duyệt kế hoạch vượt nguồn. Xác nhận chỉ áp dụng cho lần gửi hiện tại, không tự lưu cho lần sửa tiếp theo.

API trả `409 PLAN_CONFIRMATION_REQUIRED`. Client gửi lại cùng nội dung và `confirm_plan_overage: true`, với Idempotency-Key mới nếu có dùng khóa. Backend chỉ nhận boolean, không chấp nhận chuỗi `"true"`. Giao dịch cảnh báo được rollback trước khi trả về. Thao tác thành công được ghi lịch sử; xác nhận không thay đổi số lượng đơn hàng nguồn.

Đây là nới giới hạn **số lượng dự kiến của kế hoạch**. Những kiểm tra khác vẫn có hiệu lực: phân quyền, trạng thái và phiên bản chứng từ, đúng nguồn/loại mặt hàng, ngày không quá khứ và không vượt ngày giao đã thống nhất, số dương hợp lệ, tồn khả dụng, lượng QC đạt, số lượng thực nhập/xuất và chống ghi trùng. Ví dụ lập kế hoạch bán nhiều hơn báo cáo không cho phép xuất số hàng chưa có hoặc chưa đạt QC.

Kiểm thử: `tests/unit/planning-confirmation.test.js`, `scripts/planning-confirmation-smoke.cjs` trên schema acceptance riêng và `e2e/planning-confirmation.cjs` với mutation giả lập.
