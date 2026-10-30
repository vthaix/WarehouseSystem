# Cập nhật đặc tả kho — 30/10/2026

Bản đã sửa: [Tuan6_DacTaUC_KemSequence_CapNhatKho_20261030.docx](Tuan6_DacTaUC_KemSequence_CapNhatKho_20261030.docx).

Nguồn: `Tuan6_DacTaUC_KemSequence_ChuDen_KyHieuXanh.docx` người dùng cung cấp. Bản sao nguyên trạng lưu tại `NGUON_GOC.docx`; tệp nguồn bên ngoài dự án không bị ghi đè.

## Nội dung thay đổi

| UC | Nội dung |
| --- | --- |
| UC-08 Quản lý nhập kho | Yêu cầu nhập và phiếu đã ghi sổ; phân công nhân viên theo phần lô, lượng và vị trí; gợi ý khu/độ sâu theo hạn dùng; giải phóng phần chưa thực hiện; các trường hợp không đủ điều kiện |
| UC-09 Quản lý xuất kho | Hạn dùng sớm trước; cùng hạn dùng dùng thời điểm nhập thực tế tại kho sớm trước; bảng ưu tiên, bổ sung phân bổ qua nhiều lô, nhiều nhân viên, điều chỉnh lựa chọn hợp lệ và các nhánh thiếu hàng/sai điều kiện |
| UC-23 Yêu cầu nhập/xuất | Xưởng gắn tài khoản, chọn kho theo xưởng/mục đích; ba kho gồm NVL, thành phẩm, hàng trả về |
| UC-10 Nhập kho | Nhân viên ghi đúng vị trí đã giao; không tự đổi ngoài phân công; thời điểm ghi phiếu làm căn cứ nhập trước/xuất trước khi cùng hạn dùng |
| UC-11 Xuất kho | Công việc của nhân viên theo phần lô/vị trí/lượng quản lý đã giao |
| UC-11.01 và UC-11.02 | Nhân viên xuất NVL/thành phẩm theo phân công quản lý xác nhận, không tự chọn lại lô ngoài phân công |
| UC-22 Tra cứu dữ liệu trong kho | Xưởng → ba kho → khu A/B/C có nhãn → vị trí A01–A10; xem tồn, giữ chỗ và khả dụng, không tự chuyển hàng |

Không thêm hoặc bỏ UC. Không thay actor và quyền purchaser đang chờ xác nhận. Không tạo entity Khu hoặc hàng đợi mới: khu nằm trên ViTriKho, thứ tự được tính từ lô và phiếu nhập. Giữ MatHang cùng hai bảng con NguyenVatLieu/ThanhPham; không tách lại bảng lô riêng.

Nội dung dùng tiếng Việt và giữ chú thích entity trong ngoặc. Gợi ý không bị mô tả thành ràng buộc bắt buộc chọn lô đầu tiên; quản lý vẫn xác nhận lựa chọn hợp lệ. Phân công chưa làm thay đổi tồn kho; nhân viên ghi phiếu mới cập nhật tồn.

## Bảo toàn tài liệu

Chỉ thay giá trị văn bản trong 30 đoạn thuộc tám UC. Đã so sánh toàn bộ cấu trúc XML sau khi bỏ giá trị chữ: giống bản gốc. Vẫn có 50 bảng và 3.195 đoạn; không thêm/xóa hàng, ô, đoạn, run, ảnh; không đổi thuộc tính định dạng, màu, kiểu chữ, trang hoặc quan hệ ảnh. 783 thành phần khác trong gói Word giữ nguyên từng byte sau giải nén, gồm 767 ảnh.

Các hình sequence nhúng sẵn được giữ nguyên, **chưa vẽ lại theo các nhánh vừa bổ sung**. Vì vậy đây là bản cập nhật nội dung đặc tả, không tuyên bố các hình sequence đã đồng bộ hoàn toàn. Tăng độ dài nội dung có thể làm Word tự dàn lại trang; không cố định số trang bằng cách đổi form.

Kiểm tra máy: [KIEM_TRA_BAO_TOAN.json](KIEM_TRA_BAO_TOAN.json). Đối chiếu trước/sau từng đoạn: [THAY_DOI_NOI_DUNG.json](THAY_DOI_NOI_DUNG.json).

Đã mở bản xuất qua LibreOffice và xuất PDF để kiểm tra khả năng đọc, đồng thời xem mẫu các trang UC-08/09/22. Không lưu ngược bản LibreOffice vào Word để tránh thay đổi định dạng gốc. Bản xem: [PDF](render/Tuan6_DacTaUC_KemSequence_CapNhatKho_20261030.pdf).

Các tệp Markdown đã cập nhật: SRS.md, USE_CASES.md, UI_SPEC.md, DOMAIN_MODEL.md, TEST_CASES.md. Bổ sung 14 ca kỳ vọng; không gán trạng thái đã đạt cho các ca chưa được chạy riêng trong đợt sửa tài liệu. Không sửa code nghiệp vụ hoặc dữ liệu khi làm đợt tài liệu này.
