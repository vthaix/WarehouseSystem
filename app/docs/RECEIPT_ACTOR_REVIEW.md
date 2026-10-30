# Điểm cần xác nhận: actor ghi nhận hàng thực nhận

Theo `review-20261029/Tuan6_WarehouseTeam_ChiDacTaUC_BoSungEntity.docx`, UC-BS04 có actor chính **Bộ phận mua hàng**. Hậu điều kiện: lưu phần hàng thực nhận và lô chờ kiểm tra chất lượng, **chưa tăng tồn kho**.

Hiện `LotService.createLot` chỉ nhận vai trò Quản lý kho. Đây là quyền hiện hành được giữ nguyên; các bản vá chuyển actor dưới đây đã bị bộ duyệt tự động từ chối và chưa áp dụng.

Thay đổi đề xuất để khớp đặc tả:

1. Trong chi tiết đơn mua của purchaser có nút Ghi nhận nguyên vật liệu thực nhận.
2. Purchaser chọn nhà cung cấp của đơn, nhập mã lô, lượng giao lần này và ngày; không được nhận dòng của đơn khác hoặc vượt lượng đã mua.
3. Lưu lô với trạng thái chờ QC. Không tạo phiếu kho, không tăng tồn, không dành hàng và không tự kết luận đạt chất lượng.
4. QC, yêu cầu nhập của chủ xưởng, phân công của quản lý và ghi phiếu nhập của nhân viên kho giữ nguyên.
5. Không cấp purchaser quyền sửa/xóa lô, phân công kho hoặc ghi sổ nhập/xuất.

Backend dự kiến: endpoint `POST /api/v1/purchase-orders/:id/receipts` chỉ cho PURCHASER, kiểm các dòng thuộc đơn nguồn trước khi gọi nghiệp vụ tạo lô hiện có. Không đổi quyền của các endpoint ghi tồn kho.

Bộ duyệt tự động yêu cầu người dùng xác nhận rõ sau thông báo về thay đổi phân quyền. Chưa coi UC-BS04 đã đồng bộ hoàn toàn trong khi chưa được phép áp dụng thay đổi này.
