# Thực kiểm theo kế hoạch mua — 31/10/2026

## Luồng mới

1. Bộ phận lập kế hoạch lập kế hoạch mua; giám đốc duyệt; bộ phận mua hàng đặt mua từ kế hoạch đã duyệt.
2. Giám đốc lập đợt kiểm kê, chọn nguyên vật liệu và kế hoạch mua, nhân viên QC/AC, Ban kiểm kê, người lập biên bản và lịch. Không cần quản lý tạo lô trước.
3. Giám đốc bắt đầu đợt. Cần có đơn mua thuộc kế hoạch; giữ kiểm tra ngày nhận và cơ chế giả lập đã có. Đợt mới không gắn lô cũ được chuyển sang thực kiểm theo kế hoạch.
4. Ban kiểm kê mở **Thực hiện kiểm kê**, chọn đợt trong khối **Thực kiểm theo kế hoạch mua nguyên vật liệu**, ghi số đếm thực tế cho từng dòng. Số 0 hợp lệ; chênh lệch được giữ để xem xét, không tự sửa tồn.
5. QC/AC mở quản lý kết quả QC, chọn đợt trong cùng khối, ghi lượng thực kiểm, lượng đạt, lượng lỗi và mô tả. Tổng đạt + lỗi phải bằng thực kiểm. Không lấy số kế hoạch làm số thực tế mặc định.
6. Khi đủ các phần được phân công, đợt hoàn tất. Người lập biên bản được thông báo; quản lý kho nhận thông báo kết quả thực kiểm.
7. Quản lý mở **Lô hàng**, chọn kết quả thực kiểm, xem số kế hoạch/đếm/đạt/lỗi, ghi ngày sản xuất và hạn dùng rồi chọn **Tạo lô phần đạt**. Mã lô do máy chủ sinh. Mỗi lô tổng cùng nhà cung cấp; phần lỗi vẫn ở kết quả gốc. Không tạo lại phần đã có lô.
8. Chủ xưởng gửi yêu cầu nhập phần đạt; quản lý phân công nhân viên theo khu; nhân viên ghi phiếu thực nhập mới tăng tồn. Kết quả QC của phần đạt được dẫn từ thực kiểm, không bắt QC nhập lại cho cùng lượng đã xác nhận.

Dữ liệu thực kiểm trước khi có lô được lưu tại `ThucKiemKeHoachMua`, liên kết đợt và dòng đơn mua. `DotKiemKe.KiemTheoKeHoach` phân biệt luồng này với những đợt gắn lô cũ. Không xóa, chuyển đổi hoặc tự tạo lại chứng từ lịch sử.

## Các điều chỉnh đi kèm

- Ngoại lệ gửi chủ xưởng lấy xưởng từ kế hoạch nguồn, yêu cầu nhập hoặc kho liên quan. Không tự chọn một xưởng khác. Nếu chưa xác định duy nhất xưởng thì chưa cho gửi phê duyệt; vẫn có thể xử lý đơn giản theo quyền hiện hành.
- Mã lô NVL tự sinh ở máy chủ; không cần nhập mã trên form. Nút Chứng từ bù QC được bỏ; lịch sử và dữ liệu cũ vẫn giữ.
- Danh sách lô và nguồn lô trong form yêu cầu dùng phần xổ chi tiết. Mở lô tổng sẽ tải các dòng của chính lô đó, không chỉ các dòng tình cờ nằm trên trang danh sách hiện tại.
- Số lượng xuất NVL gợi ý lấy lượng nhỏ hơn giữa nhu cầu còn lại và tồn khả dụng tại kho chọn. Ví dụ nhu cầu 37 kg nhưng khả dụng 35 kg thì gợi ý 35 kg. Hàng giữ chỗ, lỗi, cách ly, hết hạn không tính vào khả dụng. Chưa có tồn thì không tự điền toàn bộ lượng kế hoạch.
- Điều phối nhập hiển thị tên khu có ý nghĩa; không hiển thị các ô kệ A01… trên sơ đồ. Các vị trí kỹ thuật cũ vẫn tồn tại để bảo toàn lịch sử và phân công, giao diện quy về khu tương ứng.

## Thành phẩm từng phần

Báo cáo thành phẩm từng phần đã gửi tạo phần lô chờ QC. Phải kiểm đúng phần đó trước khi nhập; không chờ hoàn tất toàn bộ kế hoạch sản xuất. Nếu vẫn chờ QC, form giải thích rõ cần giám đốc lập đợt kiểm phần báo cáo và QC ghi lượng đạt, thay thông báo nguồn trống chung chung. Không bỏ qua QC để tăng tồn.

Hai phần lô trong `BCTP-KHACHHANG-01` ở môi trường chính được kiểm tra ở thời điểm bắt đầu sửa đều đang `PENDING`, chưa có lượng đạt. Không tự thay kết quả thật của người dùng thành đạt.

## Kịch bản kiểm tra

Kế hoạch mua 37 kg bột, QC và kiểm kê cùng đợt: ghi số đếm 37; QC thực kiểm 37, đạt 35, lỗi 2, ghi lý do. Quản lý tạo lô nhận 35 kg, kết quả lỗi 2 vẫn giữ riêng. Tạo lô lần hai bị từ chối. Chỉ sau phiếu nhập của nhân viên, tồn mới có 35 kg để xuất. Với nhu cầu 37, form xuất gợi ý tối đa 35 nếu không có giữ chỗ.

Đã chạy: `scripts/purchase-plan-check-smoke.cjs` (API thật, từ kế hoạch đến lô đạt, phân quyền, tổng lượng, thông báo, mã tự sinh và chống tạo lặp); `e2e/purchase-plan-check.cjs` (form QC/đếm, người nhận cố định, lô xổ chi tiết, chỉ hiển thị khu; thao tác ghi biểu mẫu giả lập); kiểm thử đơn vị và các bộ MySQL hồi quy. Kết quả cuối được ghi khi hoàn tất kiểm tra bản triển khai.

Luồng cũ qua API vẫn hỗ trợ dữ liệu đã có lô và đợt QC gắn lô. Đợt mới từ kế hoạch dùng luồng trên; không tự suy đoán hoặc sửa nguồn của đợt lịch sử. Các hình sequence trong bản Word ngày 30/10 chưa được vẽ lại trong đợt code này.

## Kết quả cuối

- 82/82 kiểm thử đơn vị đạt; cú pháp và đồng bộ cấu trúc/migration/tài liệu sinh tự động đạt.
- 12/12 nhóm MySQL hồi quy đạt. Các kỳ vọng cũ về lượng xuất theo kế hoạch được sửa để kiểm tra riêng nhu cầu còn lại và lượng gợi ý theo tồn thực có.
- API thực kiểm mới đạt: chưa có lô trước QC, kiểm quyền người được phân công, tổng đạt/lỗi, thông báo quản lý, tạo lô phần đạt có mã tự sinh và chặn tạo lặp.
- Trình duyệt purchase-plan-check, source-imports, warehouse-request-workflow, inspection-workflow, workspace-ux đạt. Các bài form giả lập thao tác ghi; phần ghi thật được kiểm riêng bằng API/MySQL.
- Dự án chính đã build, migration 008 đã chạy, ứng dụng healthy. Dấu kiểm tra tám nhóm dữ liệu đơn/kế hoạch/lô/yêu cầu/phiếu/tồn/báo cáo trước và sau cập nhật trùng nhau. Không reset dữ liệu chính.
