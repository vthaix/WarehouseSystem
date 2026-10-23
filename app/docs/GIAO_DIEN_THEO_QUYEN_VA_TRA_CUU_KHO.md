# Giao diện theo quyền và tra cứu kho

Cập nhật 23/10/2026. Không thay đổi lịch sử đơn hàng, chứng từ hoặc tồn kho.

## Quyền trên giao diện

Menu, thẻ chức năng và tìm chức năng dùng cùng `src/config/navigation.js`. Màn hình web kiểm lại actor, không chỉ ẩn liên kết; nút ghi vẫn dựa trên `actions` do backend trả theo người dùng, nguồn và trạng thái chứng từ.

| Màn hình | Actor có lối vào |
| --- | --- |
| Đơn hàng / tiếp nhận | Khách hàng, bộ phận lập kế hoạch |
| Kế hoạch mua / bán | Lập kế hoạch, giám đốc, mua hàng |
| Đơn mua NVL | Bộ phận mua hàng |
| Quản lý danh mục, mặt hàng, kho, vị trí, nhà cung cấp, lô | Quản lý kho |
| Tra cứu kho (UC-22) | Quản lý kho, chủ xưởng |
| Kế hoạch sản xuất | Lập kế hoạch, giám đốc, chủ xưởng |
| Báo cáo SX / thành phẩm | Chủ xưởng, giám đốc, lập kế hoạch; dữ liệu vẫn giới hạn theo nguồn và người nhận |
| Yêu cầu nhập / xuất | Chủ xưởng, quản lý kho, nhân viên kho được phân công |
| Kiểm tra QC/AC | QC/AC |
| Lập đợt kiểm kê | Giám đốc |
| Quản lý kiểm kê | Ban kiểm kê |
| Biên bản kiểm kê | Người được chỉ định thuộc QC/AC hoặc Ban kiểm kê; giám đốc xem |
| Xử lý ngoại lệ | Quản lý kho, chủ xưởng nhận đề xuất, giám đốc xem |
| Công việc | Các actor nội bộ; chỉ thấy phần việc thuộc phạm vi; quyền sửa/hủy riêng |
| Báo cáo tồn kho | Giám đốc, quản lý kho, chủ xưởng |
| Báo cáo nhập / xuất | Giám đốc, chủ xưởng đúng phạm vi |
| Báo cáo kiểm kê | Giám đốc |
| Hồ sơ kho | Quản lý kho, giám đốc, chủ xưởng đúng phạm vi |
| Thông báo | Mọi tài khoản đã đăng nhập, chỉ thông báo của mình |

Quyền đọc nguồn khi lập chứng từ không tự tạo menu quản lý nguồn đó. Ví dụ chủ xưởng tra cứu kho chung theo UC-22, không có menu sửa danh mục; QC chọn nguồn lô trong công việc mà không có menu mua hàng. Các API nguồn liên quan vẫn áp dụng quyền đọc và scope hiện hành.

## Nhãn, vai trò, ngày giờ

`public/js/presentation.js` dùng chung cho EJS và JavaScript: bổ sung nhãn tiếng Việt vào cấu hình navigation, định dạng số và ngày giờ. Chi tiết chỉ hiện các trường có nhãn nghiệp vụ, không đổ toàn bộ tên cột kỹ thuật lên giao diện. Ô vai trò ở tổng quan hiển thị tên vai trò thay vì số lượng vai trò.

- Timestamp: `HH:mm - dd/MM/yyyy`, múi giờ `Asia/Ho_Chi_Minh`; ví dụ `03:05Z` thành `10:05 - 23/10/2026`.
- Trường chỉ có ngày: `dd/MM/yyyy`, không tự thêm giờ chưa được ghi nhận.
- Giá trị gửi API và điều khiển nhập ngày vẫn dùng chuẩn ISO; định dạng hiển thị không đổi ngày/giờ lưu, min/max hoặc nghiệp vụ.
- Số lượng hiển thị tiếng Việt; giá trị nhập số không nhận dấu phân cách hàng nghìn từ phần hiển thị.

Migration `016_workshop_display_names` đổi hai tên demo cũ đã biết sang **Xưởng bánh quy Sweet Bakery** và **Xưởng bánh bông lan Sweet Bakery**. Tên người dùng đã tự sửa được giữ nguyên. Seed mới dùng các tên này. Runtime cần 16 marker migration.

## Sơ đồ kho

Đường dẫn `/warehouse/lookup`, API đọc `GET /api/v1/warehouse-lookup?warehouse_id=<id>` thuộc reporting-service. Chỉ quản lý kho/chủ xưởng được dùng. Theo quyết định nghiệp vụ hiện hành, chủ xưởng được đọc tồn kho chung; API không trả đơn hàng, báo cáo hay thông tin nhân sự xưởng khác.

Bên trái chọn kho, nhóm nguyên liệu/thành phẩm, loại hàng và tìm tên/mã hàng hoặc mã lô. Sơ đồ chỉ gồm vị trí thật trong CSDL. Màu nhạt là có hàng, trắng là trống, đỏ là vị trí đang chọn. Bộ đếm là số vị trí có hàng trên tổng vị trí, không giả định sức chứa của kệ.

Bên phải hiện mặt hàng, mã lô, đơn vị, hạn dùng, lượng đang có, giữ chỗ và khả dụng. Khả dụng trừ phân công xuất chưa thực hiện; phần cách ly, hết hạn hoặc QC không đủ điều kiện có khả dụng 0. Không cộng lượng khác đơn vị thành một tổng chung. Vị trí trống và bộ lọc không khớp có thông báo riêng. Có tải lại, mở rộng sơ đồ và bố cục điện thoại.

## Kiểm thử

`npm run test:lookup:browser` đọc API thật để kiểm hai actor được phép, bảy actor bị chặn, tên vai trò và menu UC. Phần tương tác sơ đồ dùng response mock 48 vị trí để kiểm chọn vị trí, lọc loại hàng, vị trí trống, đơn vị, ngày giờ và màn hình 390px; không thêm vị trí hoặc tồn giả vào CSDL thật.

Unit kiểm múi giờ qua ngày, ngày không có giờ, nhãn enum, vai trò, số, quyền UC và cách tính khả dụng/cách ly/hết hạn. Full split acceptance kiểm số liệu từ phiếu nhập thật 38 đơn vị, vị trí/đơn vị đúng, quyền API và kho không tồn tại trên database riêng.
