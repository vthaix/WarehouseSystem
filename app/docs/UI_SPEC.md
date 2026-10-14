# Giao diện hiện hành

Hợp nhất 14/10/2026. Giao diện cập nhật theo mẫu dashboard người dùng cung cấp: sidebar trắng, thanh trên gọn, nền trắng/xám nhạt, đỏ vừa làm điểm nhấn và chữ đen. Xưởng bánh ngọt đóng gói; bảng/form responsive và cuộn ngang khi cần. Gateway render EJS; JavaScript bổ sung tương tác, không có ứng dụng frontend riêng.

Theme chung trong public/css/admin.css, áp dụng sau CSS cơ sở. Dashboard có ba thẻ đếm nghiệp vụ/vai trò/thông báo từ dữ liệu thật; không dùng số liệu doanh thu hay biểu đồ minh họa làm dữ liệu vận hành. Thanh tìm chức năng lọc theo quyền, sidebar thu gọn trên desktop và mở dạng drawer trên điện thoại. Kiểm thử giao diện: npm run test:theme:browser.

## Nguồn cấu hình

Menu, vai trò, nhãn và field names lấy src/config/navigation.js. Browser dùng public/js/navigation-data.js được sinh bởi npm run docs:sync; không giữ một bộ menu/vai trò khác với server. API vẫn kiểm quyền/scope độc lập.

Danh sách module/route/vai trò hiện hành nằm ở [generated/PROJECT_MANIFEST.json](generated/PROJECT_MANIFEST.json). UI-01…UI-32 và UI-23B là mã truy vết trong MODULE_MATRIX; nhiều mã dùng chung list/detail/modal, không giả định mỗi mã có URL riêng. Hàng khách trả là màn bổ sung hiện có, không tự đổi số UC.

## Màn hình và thao tác chính

| Nhóm | Dữ liệu / thao tác |
| --- | --- |
| Đăng nhập/dashboard | Login theo session/CSRF, menu đúng actor, đăng xuất; không tự chọn vai trò để vượt quyền |
| Đơn hàng | Khách tạo/xem/sửa trước duyệt; planner tiếp nhận; BGĐ xem KHSX liên quan rồi duyệt |
| Kế hoạch | SX lấy đơn, nhập NVL gốc; MUA/BAN lấy báo cáo đúng loại; sửa/hủy theo trạng thái |
| Mua/nhận lô | PLAN/REPORT/MANUAL; đổi chế độ xóa nguồn cũ; nhận lô theo đơn mua và lượng chưa nhận |
| Yêu cầu nhập/xuất | Bốn nhánh rõ ràng: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán |
| Phân công/phiếu/công việc | Quản lý chọn lô/vị trí/người/lượng; nhân viên chỉ ghi phần được giao; hủy phân bổ chưa ghi |
| QC | Lịch/phân công, kiểm từng dòng lô, đạt+lỗi=kiểm; bù/tái kiểm có lịch sử |
| Kiểm kê/kết luận | Snapshot theo kho, đếm phân biệt trống/0, hoàn tất/gửi kết luận từng kho, chênh lệch và đóng |
| Ngoại lệ | Nguồn/lượng/vị trí/phương án; giám đốc duyệt, QC xác nhận khi cần, quản lý thực hiện |
| Báo cáo SX | TIEN_DO/SU_CO/NHU_CAU khi chưa xong; BGĐ mặc định, planner tùy chọn; chỉ nhu cầu có bảng NVL |
| Tổng kết TP | Xác nhận xong toàn bộ, lấy lô từng đợt đã có; ghi lượng thực/NVL dùng và gửi |
| Hàng khách trả | Dòng giao gốc, kho/vị trí/người nhận, nhận cách ly một lần; chưa tự hoàn tiền/giao bù |
| Tra cứu/báo cáo | Tồn/hồ sơ/kiểm kê theo quyền/bộ lọc, export trong giới hạn, không tạo entity hồ sơ mới |
| Thông báo | Danh sách/chi tiết/đánh dấu đọc đúng người nhận |

## Form nhập từng phần và lấy nguồn

Nhập TP theo KHSX: số lượng để người dùng nhập thực tế, ngày sản xuất/hạn dùng, không tự bằng kế hoạch; cùng đầu lô, dòng riêng từng đợt. Form tổng kết lấy lại các dòng lô này, không tạo trùng.

Chọn nguồn chỉ tự điền form, không lưu/ghi tồn. Đổi nguồn bỏ phản hồi cũ; đang tải nguồn khóa lưu. Trước gửi người dùng kiểm/chỉnh sửa; backend kiểm lại nhu cầu/tồn/QC/trạng thái trong transaction.

NVL xuất có PLAN/REPORT; thành phẩm xuất có BAN/tổng kết hoàn tất, QC/tồn và kết quả kiểm kê gần nhất nếu có. Không bắt kiểm kê mới cho mỗi lần giao và không cộng số đếm vào tồn.

## Trạng thái và lỗi

Form có label, trường bắt buộc, lỗi giữ input; dữ liệu rỗng và không kết quả có thông báo rõ. Trong khi gửi tránh gửi trùng. Version cũ yêu cầu tải lại, không ghi đè. Lỗi mạng có thể chưa xác định kết quả, không tự retry mutation.

Phiếu đã ghi/báo cáo đã gửi không cho sửa đè; action theo server. Kho kiểm kê/hết hạn/giữ chỗ được chặn ở backend dù UI thiếu banner. APPLIED nghĩa đã thực hiện, APPROVED chỉ đã duyệt.

Chi tiết ngoại lệ hiển thị phân bổ, lịch sử quyết định và tái kiểm. Bộ nhãn lấy chung server/browser; không dùng màu thay chữ trạng thái.

## Mức nghiệm thu

Đã có test form import, nhập từng phần, tổng kết, cách ly/tiêu hủy/trả NCC/điều chỉnh QC và lịch sử. Chưa chứng nhận mọi nhánh keyboard/mobile/bộ lọc/xuất báo cáo hoặc toàn bộ yêu cầu phiếu chấm. Test browser mock write được kết hợp acceptance SQL riêng.

API: [API.md](API.md). Tiến độ: [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md). Không có UI quản lý nhân viên/bộ phận trong phạm vi hoàn thiện.


Ảnh danh mục: LoaiHang.DuongDanAnh / image_path, chọn/xem trước/bỏ ảnh, PNG/JPEG/WebP ≤5 MB. Migration service 007; file ở src/images/categories, Docker lưu volume category_images. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).