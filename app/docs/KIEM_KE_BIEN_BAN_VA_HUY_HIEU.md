# Kiểm kê, biên bản chung và số báo mới

Cập nhật theo yêu cầu ngày 23/10/2026. Luồng hiện hành cho kiểm tra lô NVL và từng phần lô thành phẩm; COUNT theo kho lịch sử vẫn giữ API riêng.

## Giám đốc phân công

Vào **Lập đợt kiểm kê → Tạo mới**, chọn lô/phần lô, thời gian, nhân viên QC/AC và/hoặc Ban kiểm kê. Chọn **Nhân viên lập biên bản chung** trong chính danh sách nhân viên được phân công. QC kiểm chất lượng; Ban kiểm kê kiểm số lượng; chọn cả hai thì cần đủ cả hai kết quả.

Đợt cũ chưa chọn người lập: mở **Quản lý công việc → Chi tiết → Phân công người lập biên bản**. Có thể đổi người lập trước khi gửi; không thay người sau khi gửi. Migration không chọn ngẫu nhiên nhân viên cho đợt cũ; nếu đã có biên bản thì giữ người thực sự lập.

## Ban kiểm kê nhập số đếm

Vào **Quản lý kiểm kê → Tạo mới**, chọn công việc đã bắt đầu và được giao. Form hiện tất cả dòng/phần lô trong công việc. Nhập số đếm thực tế cho toàn bộ dòng chưa ghi rồi xác nhận một lần. Số 0 hợp lệ, ô trống không phải số 0. Dòng đã ghi hiển thị chỉ đọc.

Backend kiểm lại phạm vi, quyền, trạng thái và version; thiếu dòng, trùng dòng hoặc dòng ngoài công việc bị từ chối. Toàn bộ lần ghi nằm trong một transaction. Hai nhân viên gửi cùng version thì chỉ lần hợp lệ đầu tiên được ghi. Nhập số đếm không tự thay tồn kho.

## Một biên bản chung

Sau khi đủ số đếm và QC theo phạm vi, người được chỉ định vào **Biên bản kiểm kê → Tạo mới**. Hệ thống tổng hợp số lượng ghi nhận, số đếm, chênh lệch, lượng QC đạt/lỗi và mô tả lỗi trong một biên bản của đợt. Người lập ghi kết luận, ngoại lệ nếu có, lưu nháp rồi gửi.

Nhân viên khác được giao vẫn xem được kết quả trong phạm vi nhưng không lập/sửa/gửi thay người được chỉ định. Biên bản đã gửi bất biến; giám đốc nhận thông báo.

## Quản lý xử lý

**Xử lý ngoại lệ** tự liệt kê ngoại lệ của biên bản đã gửi, có cột **Vấn đề cần xử lý**. Bấm **Chi tiết** của ngoại lệ đang chờ quản lý sẽ mở ngay form xử lý, có kết quả kiểm đếm và QC từ biên bản. Không cần lập một đề xuất khác để ngoại lệ xuất hiện.

Hàng QC lỗi còn cần xử lý hiện ở bảng riêng phía trên, có lô/mặt hàng, lượng lỗi và mô tả. Nút chi tiết/xử lý điền sẵn nguồn lỗi vào form đề xuất chứng từ cũ. Điều chỉnh tồn/cách ly theo chứng từ vẫn tuân thủ luồng phê duyệt hiện có; không tự sửa tồn từ mô tả ngoại lệ.

Ngoại lệ biên bản: quản lý nhập cách xử lý và xác nhận trực tiếp, hoặc tick gửi đề xuất cho chủ xưởng, chọn xưởng nhận. Chủ xưởng chỉ duyệt đề xuất thuộc xưởng mình; từ chối phải ghi phương án thay thế. Quản lý xác nhận đúng phương án đã được duyệt/chỉ định.

## Huy hiệu số đỏ

Sidebar, nút thông báo và thẻ chức năng có vòng tròn đỏ, số trắng; quá 99 hiện `99+`. API đếm theo tài khoản đăng nhập, cập nhật sau thao tác thành công, khi quay lại cửa sổ và mỗi 15 giây khi trang đang hiển thị.

| Chức năng | Cách tính |
| --- | --- |
| Thông báo | Tổng thông báo chưa đọc của chính tài khoản |
| Kế hoạch SX của giám đốc | KHSX DRAFT chờ giám đốc duyệt |
| Kế hoạch mua/bán của giám đốc | Kế hoạch PENDING_APPROVAL |
| Đơn khách của planner | Đơn SUBMITTED chờ tiếp nhận |
| Công việc | Công việc PLANNED/IN_PROGRESS được giao hoặc do tài khoản quản lý |
| Quản lý kiểm kê | Công việc được giao đã bắt đầu, còn dòng chưa ghi số đếm |
| QC/AC | Đợt được giao đã bắt đầu còn dòng chờ QC |
| Biên bản của nhân viên | Đợt hoàn tất mà người đó được chỉ định lập, chưa gửi biên bản |
| Ngoại lệ của quản lý | Ngoại lệ biên bản OPEN/APPROVED/REJECTED cần thực hiện |
| Ngoại lệ của chủ xưởng | Đề xuất PENDING_APPROVAL gửi đúng xưởng phụ trách |
| Giấy tờ/thông tin mới khác | Thông báo chưa đọc gắn chức năng; phiếu kho mới cũng báo ở Hồ sơ kho |

Mở chức năng không tự xóa số việc chờ. Thông báo chưa đọc giảm khi đánh dấu đã đọc. Không cộng thông báo cũ vào số việc của các chức năng có quy tắc riêng trong bảng.

## Kịch bản kiểm tra

1. Giám đốc tạo đợt có QC A và kiểm kê B, chọn A lập biên bản; bắt đầu đợt. B thấy công việc được giao, A thấy QC cần thực hiện.
2. B vào Quản lý kiểm kê/Tạo mới, chọn công việc nhiều dòng. Bỏ trống một dòng bị chặn; nhập đủ, gồm một dòng 0, rồi lưu một lần.
3. A ghi QC đủ các dòng. A có số báo ở Biên bản; B không được lập/sửa/gửi biên bản đó. A lập biên bản chung, ghi ngoại lệ và gửi.
4. Quản lý thấy ngay mô tả; Chi tiết mở form có kết quả hai bộ phận. Thử xử lý trực tiếp và gửi chủ xưởng ở hai đợt khác nhau.
5. Chủ xưởng từ chối phải nhập phương án thay thế. Quản lý xác nhận đúng phương án đó.
6. Planner tạo KHSX; số kế hoạch chờ duyệt của giám đốc tăng. Duyệt xong số giảm. Phiếu kho mới thông báo cho quản lý được giao, chủ xưởng đúng xưởng và giám đốc; nhân viên kho không liên quan không nhận.

Kiểm thử: `node --test`; `node e2e/inspection-workflow.cjs` đọc API thật, lưu browser được mock; split acceptance dùng database cách ly kiểm ghi MySQL thật.

Migration `015_inspection_minute_author` thêm `DotKiemKe.NguoiLapBienBanDuocChon`; runtime cần 15 marker. Không xóa dữ liệu hiện có.
