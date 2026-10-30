# Bản sửa lại theo mẫu Word gốc — 29/10/2026

File bàn giao mới nhất: **Tuan6_WarehouseTeam_ChiDacTaUC_BoSungEntity.docx**. Bản `SuaDungMau.docx` giữ lại làm mốc trước khi bổ sung entity.

## Bổ sung entity theo yêu cầu mới nhất

Đã đối chiếu cách ghi entity trong bản gốc và bổ sung 669 bước của 58 bảng UC. Dùng `MatHang` cho thông tin chung, `NguyenVatLieu` / `ThanhPham` cho thông tin riêng; lô dùng `LoHang`, `ChiTietLo`, không dùng hai tên bảng lô cũ. Danh sách entity ở mỗi bước mô tả các dữ liệu liên quan theo nhánh; không có nghĩa mọi bảng được ghi cùng lúc. Chi tiết từng bước ở [DOI_CHIEU_ENTITY.md](DOI_CHIEU_ENTITY.md).

`entity-verification.json` xác nhận mọi câu chữ trước phần ngoặc đều giữ nguyên, không đổi cấu trúc XML và thuộc tính định dạng; 16 thành phần khác trong gói Word giữ nguyên nội dung. Chỉ thêm chữ vào các phần chữ đã tồn tại, không thêm đoạn, hàng, ô, bảng, ngắt dòng hoặc kiểu chữ. File gốc bên ngoài project không bị thay đổi. Độ dài văn bản tăng có thể làm Word tự ngắt trang khác.

Đã khôi phục file `Tuan6_WarehouseTeam_ChiDacTaUC.docx` ở thư mục người dùng cung cấp về đúng bản gốc trước lần sửa ngày 28/10. Bản sửa mới được giữ riêng để đối chiếu, không ghi đè bản gốc lần nữa. `khoi-phuc-file-goc.json` ghi nhận việc khôi phục; bản sửa trước không đúng mẫu được giữ làm lịch sử, không phải file bàn giao.

## Cách sửa lần này

- Dùng bản gốc 191.422 byte làm nền, không dùng bản sửa có phụ lục ngày 28/10.
- Giữ thứ tự 50 bảng UC gốc. Không thêm, xóa, gộp hoặc chia hàng, cột, ô, đoạn văn hay các phần bên trong bảng gốc. Giữ thuộc tính định dạng, các bảng lồng sẵn có, khổ giấy, lề, kiểu chữ và các thành phần khác của file.
- Chỉ sửa chữ trong ô và bổ sung dòng nội dung trong các phần luồng hiện có. Giữ các đoạn nguyên bản còn đúng; sửa những điều đã thay đổi theo nghiệp vụ và những mô tả không khớp với hành vi đã đối chiếu.
- Nhánh của UC được đặt trong chính bảng UC đó. Không có phụ lục liệt kê mã nguồn, mã lỗi, giao thức, bảng kiểm tra kỹ thuật hoặc nhánh chương trình trong Word.
- Giữ các nhãn Basic flow, Alternative flow và Exception flow như tài liệu gốc. Diễn đạt phần nội dung bằng tiếng Việt nghiệp vụ. Bản sửa trước đã bỏ nhầm tên entity; bản bàn giao mới nhất bổ sung lại tên entity trong ngoặc theo yêu cầu và mô hình hiện tại.
- Theo yêu cầu ban đầu, thêm 8 UC ở cuối, mỗi UC một bảng theo mẫu sẵn có: tài khoản, đơn vị và bảng giá, phân công nhập/xuất, thực nhận nguyên vật liệu, hàng khách trả, điều chỉnh chất lượng hàng đã nhập/cách ly, thông báo, công cụ xóa dữ liệu thử nghiệm.
- Không xóa vật lý bảng UC-12.3: ghi rõ thao tác xóa kết quả đã ghi không còn sử dụng, sửa sai qua UC-12.2. UC-31 đổi nội dung thành duyệt kế hoạch sản xuất; đơn hàng được cập nhật theo kế hoạch được duyệt. Ghi chú hai thay đổi này ở cuối phần gốc.

## Đối chiếu file

`kiem-tra-cau-truc.json` đối chiếu 101 thành phần gốc, bao gồm 50 bảng: cấu trúc gốc không đổi. Việc đối chiếu bỏ qua chữ và dấu xuống dòng trong nội dung; không bỏ qua cấu trúc bảng, hàng, ô, đoạn, phần chữ có định dạng, ô gộp hay thuộc tính trình bày.

`doi-chieu-dinh-dang.json` xác nhận chỉ phần nội dung chính của file thay đổi; các thành phần khác trong gói Word giữ nguyên. `kiem-tra-noi-dung.json` có 577 kiểm tra nội dung hiện diện và xác nhận file đọc được. Đã mở chuyển sang PDF bằng LibreOffice, dựng ảnh toàn bộ 105 trang và xem các trang mẫu của UC-13, UC-23, UC-35, UC-28, UC bổ sung và trang đầu. PDF chỉ dùng xem thử, không thay thế file Word; số trang có thể khác khi mở bằng Microsoft Word. Thêm nội dung làm thay đổi độ dài và vị trí ngắt trang tự động, không đồng nghĩa đổi mẫu bảng.

## Phạm vi kiểm thử

Lượt này sửa lại tài liệu và kiểm tra file Word, **không chạy lại toàn bộ hệ thống** và không sửa mã nghiệp vụ. Bằng chứng kiểm thử hệ thống nằm trong `../review-20261028/`: 77 kiểm thử đơn vị đạt, kiểm thử SQL đạt, 13/14 bộ kiểm thử trình duyệt đạt, 122 lượt màn hình theo tài khoản. Đây là kết quả đợt trước, không phải kết quả mới ngày 29/10.

Bốn lỗi phần mềm đã xác nhận vẫn cần xử lý riêng: đơn mua từ kế hoạch mua trực tiếp; đơn mua từ kế hoạch vượt nguồn đã xác nhận; nút tạo phiếu kho chung; nút tải báo cáo CSV. Không sửa đặc tả để coi các lỗi đó là quy trình đúng. Các trường hợp thiết kế trong tài liệu kiểm thử không được mặc định là đã chạy đạt. Không chứng nhận đã thực thi mọi trường hợp có thể xảy ra.
