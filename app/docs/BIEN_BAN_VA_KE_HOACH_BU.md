# Phần thiếu trong biên bản và kế hoạch bù

Biên bản kiểm kê/kiểm tra theo lô hoặc kế hoạch mua ghi lượng cần, thực đếm, thực kiểm, đạt, lỗi, lượng dùng được và còn thiếu. Cần 55, thực kiểm 55, đạt 50 và lỗi 5 thì thiếu 5. Nếu thực nhận 50 và đạt 48 thì thiếu 7, gồm 5 giao thiếu và 2 lỗi. Khi có cả kiểm đếm và QC, lượng dùng được không vượt số đếm. Chưa có kết quả không được coi là số 0.

Khi nhân viên được phân công gửi biên bản có thiếu, hệ thống tự ghi phần thiếu vào nội dung ngoại lệ (nếu chưa có mô tả), thông báo quản lý kho và bộ phận lập kế hoạch. Không tự tạo hoặc tự phê duyệt kế hoạch.

Planner mở **Kế hoạch mua/bán** để xem nguồn biên bản thiếu NVL và chọn **Lập kế hoạch mua bù**. Mở **Kế hoạch sản xuất** để lập bù thành phẩm cho đúng đơn hàng và xưởng nguồn. Số lượng đề xuất là phần thiếu chưa có kế hoạch bù; có thể giảm để lập nhiều lần. Ngày lập và thời hạn kế hoạch vẫn áp dụng quy tắc hiện hành.

Kế hoạch lưu liên kết `MaBienBanBu` tới biên bản đã gửi. Tổng các kế hoạch bù đang hiệu lực không vượt phần thiếu, kể cả nhiều người thao tác đồng thời. Kế hoạch mua bị từ chối và kế hoạch sản xuất bị hủy không chiếm lượng bù; khi sửa/gửi lại phải kiểm tra lại giới hạn. Kế hoạch mua bù vẫn phải được giám đốc duyệt trước khi purchaser đặt mua. Kế hoạch sản xuất bù cũng cần giám đốc duyệt.

Biên bản đã gửi giữ kết quả tại thời điểm gửi; lịch sử cũ không bị tự sửa. Không tự sinh kế hoạch bù cho các chứng từ chưa gửi hoặc không có kết quả xác định phần thiếu.
