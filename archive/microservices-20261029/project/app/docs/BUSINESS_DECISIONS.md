# Quyết định nghiệp vụ hiện hành

Cập nhật 23/10/2026: giới hạn số lượng dự kiến của KHSX và kế hoạch mua/bán so với nguồn chuyển thành cảnh báo xác nhận, áp dụng cả tạo, sửa và duyệt. Không thay đổi giới hạn tồn kho/QC khi ghi nhận thực tế hoặc ràng buộc ngày đã thống nhất. Quy tắc này thay thế các mô tả cũ yêu cầu chặn tuyệt đối số lượng kế hoạch vượt nguồn. Xem [XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md](XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md).

Hợp nhất 14/10/2026. Những lựa chọn dưới đã được chủ dự án chấp thuận hoặc yêu cầu trực tiếp; không đặt chúng lại thành câu hỏi còn mở.

| Mã | Quy tắc hiện hành |
| --- | --- |
| BR-01 | Khách đặt đơn; planner tiếp nhận trên DonHang. Chỉ sửa trước duyệt. Giám đốc duyệt từng KHSX; duyệt thành công tự cập nhật đơn nguồn sang APPROVED trong cùng transaction. Không duyệt trực tiếp đơn, không tự duyệt các KHSX khác. |
| BR-02 | Cập nhật 22/10: KHSX tính NVL gốc theo công thức cấu hình × lượng bánh, cộng gộp NVL chung; vẫn cho nhập tay. Cộng 10% đúng một lần, làm tròn lên 3 chữ số. Lưu vào chi tiết hiện có; công thức hiện là mẫu minh họa. |
| BR-03 | Một báo cáo nhu cầu hiệu lực/KHSX. Nguồn đã gửi/đã sử dụng bất biến; tồn/thiếu lấy hệ thống, không tự khai tồn. |
| BR-04 | Kế hoạch MUA lấy báo cáo SAN_XUAT mục đích NHU_CAU; kế hoạch BAN lấy tổng kết THANH_PHAM. Không dùng tiến độ/sự cố làm nguồn nhu cầu. |
| BR-05 | Đơn mua mới chỉ PLAN/MANUAL; PLAN tối đa một đơn/kế hoạch, ngày nhận lấy từ MUA đã duyệt. Planner không chọn NCC; purchaser chọn NCC riêng từng NVL. REPORT lịch sử giữ nguyên, không tạo mới. MANUAL không tự đáp ứng báo cáo. |
| BR-06 | LoHang là đầu lô, ChiTietLo là dòng hàng. QC kiểm toàn bộ mỗi dòng, kiểm=đạt+lỗi; chỉ phần đạt được nhập AVAILABLE. Lỗi NVL trước nhập ghi trả NCC theo kết luận. |
| BR-07 | Ngoại lệ: lập → giám đốc duyệt/từ chối → quản lý áp dụng riêng; người lập không tự duyệt. Điều chỉnh hàng đã nhập cần xác nhận QC và chứng từ bù, giữ phiếu gốc. |
| BR-08 | Yêu cầu NVL PLAN hoặc REPORT; tổng yêu cầu/cấp đối chiếu cùng KHSX. Nếu đã có báo cáo nhu cầu gửi, PLAN không vượt nhu cầu thực tế. Yêu cầu không có bước duyệt riêng. |
| BR-09 | Quản lý phân công tạo giữ chỗ, không TTL. Khả dụng là lượng AVAILABLE hợp lệ trừ phần giữ chưa xuất; hủy chỉ giải phóng phần chưa ghi. Không xuất hàng cách ly/hết hạn hoặc tồn âm. |
| BR-10 | UC-34 khi chưa hoàn tất: BGĐ luôn nhận; NHU_CAU còn thiếu tự gửi planner, tiến độ/sự cố thêm planner tùy chọn. Hỗ trợ ảnh mô tả và chụp bảng đối chiếu. UC-35 chỉ tổng kết khi hoàn tất toàn bộ, sản lượng là thực tế. |
| BR-11 | Kiểm kê khóa từng kho, snapshot và đếm theo dòng lô/vị trí/bucket; trống khác 0. Kết luận từng kho, mọi chênh lệch qua giám đốc duyệt, quản lý áp dụng rồi đóng đợt. |
| BR-12 | Phiếu đã ghi, biến động và lịch sử duyệt không ghi đè. Hàng khách trả theo dòng giao gốc, nhận đúng một lần vào cách ly; chưa tự giao bù/hoàn tiền. Trả NCC chưa tự tạo mua bù. |

## Những lựa chọn cụ thể

- Nhập thành phẩm từng phần theo KHSX, cùng một đầu lô; tổng kết chỉ khi xong toàn bộ.
- Giữ tên API/JSON tiếng Anh; bảng/cột SQL tiếng Việt không dấu qua adapter. Không đoán nguồn hoặc hoàn tất cho dữ liệu lịch sử.
- QC một kết quả toàn bộ mỗi dòng lô, sai sót qua chứng từ bù; hàng đã nhập cần phê duyệt/xác nhận QC trước chuyển bucket.
- Hàng khách trả không tự hoàn tiền/giao bù; phần đạt có thể giải phóng sau duyệt. NVL lỗi sau nhập có thể cách ly rồi trả NCC, chưa tự mua bù.
- Quyền đọc kho chung của chủ xưởng không cấp quyền quản lý danh mục hay phiếu của xưởng khác.
- Quản lý nhân viên/bộ phận ngoài phạm vi nghiệp vụ cần hoàn thiện; bảng kỹ thuật/hồ sơ hiện có vẫn giữ để không mất tham chiếu.

## Giới hạn cần đối chiếu theo phiếu chấm

Chưa tự áp dụng chính sách thay thế/bổ sung báo cáo nguồn đã dùng, giao diện CRUD/versioning công thức, lịch giao riêng, thanh toán/bồi thường/hoàn tiền, giao bù/mua bù tự động. Tính định lượng từ công thức cấu hình đã bổ sung ngày 22/10; xem [LUONG_DAT_HANG_TIEN_SAN_XUAT.md](LUONG_DAT_HANG_TIEN_SAN_XUAT.md).

Ngày giao đang dùng latest_delivery_date; nếu phiếu chấm yêu cầu lịch giao khác thì thiết kế trường/quy trình riêng. Database độc lập theo server cần hợp đồng/events thay SQL xuyên schema, không chỉ bỏ FK.
