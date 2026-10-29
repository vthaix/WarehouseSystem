# Bù QC và chọn lô khi lập đợt kiểm kê

## Nhập nhanh số lượng kiểm kê

Trong bảng Ghi số lượng kiểm kê, tick **Đạt** ở từng dòng để điền số đếm bằng số lượng ghi nhận; **Đạt tất cả** điền toàn bộ các dòng chưa ghi nhận. Đây là khớp số lượng, không phải kết luận đạt chất lượng QC. Vẫn phải bấm Lưu để ghi kết quả. Sửa số đếm khác lượng ghi nhận sẽ tự bỏ tick; bỏ tick bằng tay xóa số gợi ý để nhập lại. Dòng đã ghi nhận không bị thay đổi bởi các nút này.

## Chứng từ bù QC là gì?

Đây là nhánh của **UC-12.2 – Sửa kết quả kiểm tra QC/AC**, không phải một UC có số riêng và không phải chứng từ nhập bù hàng. QC sửa số đạt/lỗi của một kết quả đã ghi; hệ thống lưu lý do, bản trước/sau trong `qc_compensations`, tăng phiên bản và cập nhật trạng thái QC của dòng lô. Không xóa lịch sử để sửa đè âm thầm.

Người thực hiện phải là QC đã lập kết quả gốc. Đạt cộng lỗi mới phải bằng lượng kiểm ban đầu. Khi có lượng lỗi, phải mô tả lỗi. Nhập **kết quả mới**, không nhập số chênh lệch.

## Kịch bản test bù trực tiếp

1. Chủ xưởng gửi một báo cáo thành phẩm từng phần, ví dụ 100 hộp bánh, để tạo phần lô thực tế.
2. Giám đốc lập đợt kiểm kê, chọn phần lô đó và giao cho `qc`; chọn người lập biên bản theo phân công. Bắt đầu đợt khi đủ điều kiện; có thể dùng tùy chọn giả lập bắt đầu sớm trong môi trường test.
3. `qc` ghi kết quả: kiểm 100, đạt 100, lỗi 0. **Chưa phân bổ kho, chưa ghi phiếu nhập, chưa trả hàng và chưa lập đề xuất ngoại lệ cho dòng này.**
4. Chính tài khoản `qc` mở chi tiết kết quả → **Chứng từ bù QC**. Chọn dòng thành phẩm, sửa đạt 98, lỗi 2; mô tả “Bao bì rách”, lý do “Nhập nhầm kết quả ban đầu”; lưu.
5. Mở lại kết quả: đạt 98, lỗi 2, trạng thái lô PARTIAL. Lịch sử trước/sau và lý do được lưu trong CSDL; có thể xem mảng `compensations` trong phản hồi `GET /api/v1/qc-inspections/:id` bằng tài khoản có quyền xem kết quả. Tồn kho không tự tăng hoặc giảm.
6. Thử đạt 99 + lỗi 2 trên lượng kiểm 100: phải bị chặn. Bỏ lý do hoặc bỏ mô tả khi có lỗi: phải bị chặn. QC khác không được bù kết quả của người lập gốc.

Nếu biên bản đã gửi trước khi sửa QC, biên bản là ảnh chụp kết quả tại thời điểm gửi, không tự viết lại theo kết quả mới.

## Khi không dùng được bù trực tiếp

- Đã có dòng phiếu kho, phân bổ còn hiệu lực, hàng trả hoặc đề xuất ngoại lệ chưa bị từ chối: dùng luồng ngoại lệ/điều chỉnh tương ứng, không sửa trực tiếp bằng nút này.
- NVL có nguồn đơn mua mà kết quả mới có lượng lỗi: đường bù trực tiếp này bị chặn; hàng lỗi cần chứng từ trả theo kết luận. Nên dùng **thành phẩm chưa nhập kho** để test ví dụ 100 → 98/2 ở trên.
- Hàng đã nhập kho cần sửa kết luận: quản lý lập ngoại lệ loại điều chỉnh QC hàng đã nhập; giám đốc duyệt, QC xác nhận và quản lý thực hiện theo luồng hiện có. Xem `WAREHOUSE_EXCEPTION_WORKFLOWS.md`.

## Chọn NVL trực tiếp trong Lập đợt kiểm kê

Giám đốc mở **Lập đợt kiểm kê → Nguyên vật liệu → nguồn lô/kế hoạch mua**. Ngay trong form có **Chọn phần lô NVL đã nhận**, giống ô chọn phần lô trong chi tiết công việc. Chọn một hoặc nhiều phần đang chờ QC, chọn nhân viên và người lập biên bản rồi lưu. Đợt tạo xong đã gắn đúng các phần đã chọn, không cần mở Công việc để gắn lần nữa.

Chỉ hiển thị phần thực tế đúng nguồn, chưa được giao vào đợt PLANNED/IN_PROGRESS và còn chờ QC. Chọn kế hoạch chưa có phần thực tế thì form thông báo rõ và cho lập đợt dự kiến; khi hàng được ghi nhận mới bổ sung lô. Không coi đặt mua là đã nhận hàng và không tạo lô giả.
