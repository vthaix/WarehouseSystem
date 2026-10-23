# Đính chính: Lập đợt kiểm kê và Quản lý công việc

Yêu cầu được chủ dự án đính chính ngày 22/10/2026. Đây là yêu cầu nghiệp vụ cần đối chiếu khi cập nhật đặc tả và kiểm thử, không phải xác nhận phần mềm đã triển khai đầy đủ.

## Phân chia use case

- **UC-13 – Lập đợt kiểm kê**: Ban giám đốc tạo đợt kiểm kê, xác định phạm vi, lịch và chọn từng nhân viên thuộc Ban kiểm kê hoặc QC/AC; có thể chọn đồng thời cả hai bộ phận. Công việc tương ứng được ghi nhận để quản lý và theo dõi.
- **Quản lý công việc**: xem danh sách, xem chi tiết, sửa và xóa công việc theo quyền và trạng thái được phép. Danh sách bao gồm công việc của các đợt kiểm kê và có thể bổ sung loại công việc khác về sau. Không coi chức năng này là UC tạo đợt kiểm kê.
- Việc thực hiện kiểm đếm, ghi kết quả QC và lập biên bản vẫn theo UC và quyền chuyên môn tương ứng; được phân công vào cùng đợt không mặc nhiên được ghi mọi loại kết quả.

## Luồng mong muốn

**Ban giám đốc → Lập đợt kiểm kê → chọn phạm vi/lô/phần, lịch, nhân viên → lưu đợt và công việc tương ứng → Quản lý công việc để xem, sửa, xóa theo điều kiện.**

Giữ yêu cầu đã xác nhận về việc chọn lô NVL theo kế hoạch mua và chọn từng phần của lô thành phẩm theo báo cáo thành phẩm. Không đổi sang báo cáo tiến độ tạo phần lô. Phải phân biệt phạm vi kiểm đếm tồn kho và kiểm tra chất lượng khi mô tả kết quả thực hiện.

## Triển khai ngày 22/10/2026

Điểm tạo chuyển sang Lập đợt kiểm kê; Quản lý công việc bỏ nút Tạo mới ở cả render server và trình duyệt. Form không có lựa chọn loại đợt. Backend suy nội dung từ nhân viên: Ban kiểm kê đếm số lượng, QC/AC kiểm chất lượng, cả hai cùng thực hiện thì chờ đủ cả hai kết quả. Mô tả lưu trên công việc và đợt liên kết, sửa phân công khi chưa bắt đầu cập nhật lại phạm vi chuyên môn.

Migration `011_inspection_assignment_scope` bổ sung cờ nội dung trên đợt và số đếm/người đếm/thời điểm trên dòng lô. Không xóa dữ liệu; các lịch QC cũ giữ mặc định kiểm chất lượng để không tự suy lại lịch sử. Đếm lô không tự điều chỉnh tồn kho. API cũ còn phục vụ tương thích, không phải một lựa chọn loại đợt trong form mới.

Tài liệu này thay thế cách mô tả điểm tạo “Công việc → Tạo mới” trong `CONG_VIEC_KIEM_TRA_LO.md`; các quy tắc phần lô, chất lượng và tồn kho không mâu thuẫn vẫn được giữ lại.
