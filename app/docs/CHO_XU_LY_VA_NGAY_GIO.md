# Việc chờ xử lý và ngày giờ

Cập nhật 01/11/2026. Giám đốc xem danh sách và chi tiết đơn hàng khách; không tạo, sửa, tiếp nhận hay duyệt trực tiếp đơn. Duyệt kế hoạch sản xuất vẫn cập nhật đơn liên quan.

## Việc chờ xử lý

Dấu nổi bật và số đếm lấy từ trạng thái nghiệp vụ, giữ sau khi mở xem, đọc thông báo hoặc tải lại trang. Cập nhật sau thao tác, trở lại cửa sổ và định kỳ. Dữ liệu lọc theo người được phân công, quản lý phụ trách hoặc xưởng gắn tài khoản. Thông tin chỉ đọc chưa xem được phân biệt với công việc chưa hoàn tất.

| Người nhận | Phần việc được theo dõi |
| --- | --- |
| Planner | Đơn chờ tiếp nhận; đơn tiếp nhận chưa có KHSX; nhu cầu NVL chưa lập đủ kế hoạch mua; kế hoạch bị từ chối cần chỉnh; báo cáo hoàn tất chưa lập bán; biên bản còn lượng cần lập bù |
| Giám đốc | KHSX và kế hoạch mua/bán chờ duyệt |
| Chủ xưởng | KHSX được giao chưa hoàn tất; yêu cầu nhập/xuất chưa hoàn tất; đề xuất cần quyết định |
| Purchaser | Kế hoạch mua đã duyệt chưa có đơn mua |
| QC/AC, Ban kiểm kê | Phần thực kiểm của mình chưa ghi đủ; biên bản được chỉ định chưa gửi |
| Quản lý kho | Yêu cầu phụ trách chưa hoàn tất; phần đạt chưa tạo lô; ngoại lệ cần xử lý |
| Nhân viên kho | Phân công còn lượng chưa ghi phiếu |

Kết quả QC đã ghi không bị nhầm là đợt đang chờ QC khi hai loại chứng từ trùng số định danh. Đọc thông báo không thay đổi trạng thái công việc.

## Ngày giờ

| Dữ liệu | Ràng buộc |
| --- | --- |
| Ngày nhận đơn, ngày kế hoạch, ngày yêu cầu | Ngày lịch hợp lệ; không trước hôm nay |
| KHSX | Kết thúc không trước bắt đầu, không vượt hạn giao đơn |
| Kế hoạch mua/bán gắn nguồn | Không vượt hạn sản xuất/giao của nguồn theo loại |
| Đơn mua | Ngày nhận lấy từ kế hoạch mua đã duyệt, không tùy ý đổi |
| Lịch công việc, kiểm kê, điều phối | Có múi giờ, ngày và giờ thực sự hợp lệ, kết thúc sau bắt đầu; ngày bắt đầu không quá khứ; kiểm lịch trùng nhân viên |
| Kiểm tra theo nguồn | Ngày bắt đầu không trước ngày nhận/hoàn thành nguồn; giả lập chỉ cho bắt đầu sớm để thử nghiệm |
| Yêu cầu nhập/xuất | Ngày giờ cùng ngày yêu cầu; không quá khứ theo ngày |
| QC thực tế | Không ở tương lai; dung sai đồng hồ tối đa một phút |
| Ngày sản xuất hàng nhận | Được nhập lịch sử; không ở tương lai |
| Báo cáo thành phẩm | Hoàn thành không tương lai, không trước bắt đầu KHSX và không sau hạn giao. Ngày sản xuất từng dòng nằm từ bắt đầu KHSX đến ngày hoàn thành báo cáo |
| Hạn dùng | Không trước NSX; NVL theo cấu hình đúng cặp NVL–NCC; lô lịch sử đã dùng giữ nguyên ngày |
| Xuất bán | Chỉ từ ngày giao trên đơn; sản xuất hoàn tất, nguồn đã gửi, hàng đạt/khả dụng |
| Hàng hết hạn | Ngày địa phương UTC+7 thống nhất ở JavaScript và SQL |

Ngày dự kiến được kiểm tra theo **ngày**, không tự đổi thành quy tắc “sau phút hiện tại”: giờ 08:00 cùng ngày có thể đã qua khi nhập lại từ giấy. Phân biệt lịch dự kiến với ngày thực tế; không ép ngày sản xuất thực tế phải ở tương lai. Giới hạn ở form được backend kiểm tra lại.

Không reset CSDL chính. Tài liệu và bằng chứng kiểm thử ở [review-20261101](review-20261101/README.md).
