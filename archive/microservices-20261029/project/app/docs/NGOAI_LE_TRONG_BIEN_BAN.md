# Ngoại lệ trong biên bản kiểm tra lô

Quy tắc xác nhận ngày 23/10/2026.

## Phân quyền

- QC/AC và Ban kiểm kê chỉ ghi ngoại lệ trong biên bản được phân công. Không có menu, quyền lập đề xuất hoặc quản lý xử lý ngoại lệ.
- Quản lý kho xem ngoại lệ của biên bản đã gửi, ghi cách xử lý trực tiếp hoặc đề xuất gửi chủ xưởng.
- Chủ xưởng chỉ xem đề xuất được gửi tới xưởng mình và phê duyệt hoặc chỉ định phương án khác.
- Giám đốc xem hồ sơ. Ngoại lệ từ biên bản ở luồng này do chủ xưởng nhận đề xuất quyết định; các đề xuất điều chỉnh tồn/cách ly theo chứng từ cũ vẫn giữ luồng phê duyệt riêng.

## Ghi và gửi biên bản

Biên bản kiểm tra lô có lựa chọn **Không có ngoại lệ / Nhập mô tả ngoại lệ**. Chọn nhập mô tả thì hiện textarea bắt buộc. Lưu nháp chưa phát sinh hồ sơ xử lý. Khi gửi biên bản có ngoại lệ, hệ thống mở hồ sơ OPEN và thông báo cho quản lý kho. Biên bản không ngoại lệ không xuất hiện trong danh sách xử lý.

Chỉ người được giám đốc chỉ định lập biên bản chung (QC/AC hoặc Ban kiểm kê trong nhóm phân công) được lập/sửa/gửi. Biên bản tổng hợp cả hai bộ phận; đã gửi thì không sửa. Nội dung ngoại lệ lưu cùng biên bản, không yêu cầu hai bộ phận lập đề xuất xử lý riêng.

## Quản lý xử lý

Vào **Xử lý ngoại lệ** tự thấy mô tả ngoại lệ của biên bản đã gửi. **Chi tiết** mở ngay form xử lý, kèm số đếm/chênh lệch/kết quả QC. Hàng QC lỗi còn lại hiển thị ở bảng nguồn riêng phía trên. Nội dung cách xử lý bắt buộc:

1. Không tick đề xuất: nhập cách đã xử lý và xác nhận → RESOLVED.
2. Tick **Đề xuất xử lý và gửi chủ xưởng phê duyệt**: chọn xưởng nhận, nhập phương án và xác nhận → PENDING_APPROVAL; chủ xưởng đang hoạt động của xưởng nhận được thông báo. Người lập không tự duyệt.

## Chủ xưởng quyết định

Chủ xưởng vào **Xử lý ngoại lệ**, mở hồ sơ gửi tới mình → **Phê duyệt phương án**:

- Đồng ý: chuyển APPROVED; quản lý xác nhận thực hiện đúng phương án đã được duyệt → RESOLVED.
- Không đồng ý: bắt buộc nhập **Phương án xử lý của chủ xưởng** → REJECTED; thông báo lại quản lý. Quản lý thấy phương án này ở chế độ chỉ đọc, xác nhận thực hiện đúng phương án → RESOLVED. Backend cũng chặn gửi phương án khác hoặc tự đề xuất lại để ghi đè chỉ đạo.

Lịch sử giữ nội dung đề xuất, quyết định và phương án thay thế. Mọi mutation cần version hiện hành và giao dịch có khóa hồ sơ; không cho hai thao tác cùng ghi trên một phiên bản.

## Dữ liệu và tương thích

Migration `013_minute_exceptions` thêm trường ngoại lệ trên DotKiemKe. Không tạo entity đề xuất từ QC/AC/Ban kiểm kê; hồ sơ xử lý tham chiếu chính đợt/biên bản, dùng ID `LOT-<id đợt>` trong API `exception-proposals` để phân biệt hồ sơ cũ có ID số.

Biên bản lô gửi `exception_mode=NONE|DESCRIBE`, `exception_description` khi cần. Quản lý dùng `/exception-proposals/LOT-<id>/apply` với version, resolution_note, request_approval và workshop_id khi đề xuất. Chủ xưởng dùng `/review` với version, decision=APPROVE|REJECT, reason; REJECT bắt buộc reason là phương án xử lý thay thế.

Xác nhận xử lý này ghi nhận kết quả nghiệp vụ, không tự điều chỉnh tồn, trả hàng hay ghi phiếu kho từ nội dung văn bản. Các nghiệp vụ đó tiếp tục dùng chứng từ và quyền tương ứng. API tái kiểm chất lượng cũ vẫn phục vụ QC ghi kết quả chuyên môn có kiểm tra nguồn; không cấp lại quyền quản lý ngoại lệ cho QC.

Luồng lựa chọn ngoại lệ hiện áp dụng cho biên bản kiểm tra lô mới (ID LOT-). Biên bản kiểm đếm tồn kho COUNT lịch sử tiếp tục dùng nguồn chênh lệch và cơ chế chứng từ cũ.
