# Luồng kiểm tra hệ thống thực tế

Ngày lập: 17/10/2026. Dùng cùng [phiếu chấm 10 module](PHIEU_CHAM.md), [tài khoản](DEMO_ACCOUNTS.md) và [test case](TEST_CASES.md).

## Chuẩn bị

1. Mở Docker Desktop; tại thư mục gốc WarehouseSystem chạy `docker compose up -d --build --wait` nếu có cập nhật code. Những lần khởi động bình thường dùng `docker compose up -d`.
2. Mở http://localhost:3000. Đăng nhập bằng các tài khoản mẫu; dùng cửa sổ riêng hoặc đăng xuất khi đổi vai trò.
3. Tạo bộ dữ liệu có tiền tố `TEST-` để phân biệt dữ liệu thật. Ghi mã đơn, kế hoạch, yêu cầu, lô và phiếu xuyên suốt đợt kiểm tra.
4. Dùng một đơn 100 gói bánh quy, giá 35.000/gói, hạn giao phù hợp lịch thử. Chuẩn bị NVL bột mì, bao bì, NCC, xưởng, kho và vị trí hoạt động.
5. Trước và sau bước ghi sổ, ghi lại tồn theo mặt hàng/lô/kho/vị trí; có thể đối chiếu Adminer tại http://localhost:8080. Không sửa trực tiếp số tồn để thay nghiệp vụ nhập/xuất.

Đăng nhập là bước chuẩn bị, không phải module chấm riêng. Kết quả kiểm thử cũ không thay thế việc quan sát ở phiên bản đang kiểm tra.

## 10 module cần kiểm tra

| Module | Tài khoản | Thao tác và kết quả cần kiểm tra |
| --- | --- | --- |
| 1. Quản lý hàng trong kho | manager | Tạo/sửa danh mục và ảnh, bánh mẫu, NVL, NCC, kho, vị trí; tra cứu dữ liệu; chặn xóa dữ liệu đang dùng |
| 2. Đặt hàng | customer, customer2 | Đặt 100 gói bánh, xem/sửa đơn đúng trạng thái; tổng 3.500.000; customer2 không xem/sửa được đơn customer |
| 3. Tiếp nhận đơn và KHSX | planner, director | Tiếp nhận đúng đơn, import thành phẩm/số lượng sang KHSX, chọn xưởng, nhu cầu NVL/dự phòng; duyệt hoặc từ chối đồng bộ đơn/KHSX |
| 4. Công việc | director, manager, người được giao | Phân công đúng vai trò/phạm vi; theo dõi tiến độ; sửa/hủy đúng trạng thái; chặn trùng lịch và xem việc người khác |
| 5. Báo cáo sản xuất | workshop, director, planner | Báo tiến độ/sự cố/thiếu NVL khi chưa hoàn tất; BGĐ luôn nhận; planner chỉ nhận/đọc khi được gửi thêm |
| 6. Mua NVL | planner, director, purchaser | Lập/duyệt kế hoạch mua; đơn mua lấy nguồn hoặc nhập thủ công; NCC, số lượng, giá và nguồn đúng; không mua trùng/vượt nhu cầu |
| 7. Nhập kho | workshop, qc, manager, staff | NVL thực nhận → QC → yêu cầu → phân công → ghi sổ; TP nhập tay từng phần cùng lô sản xuất; chỉ phần đạt vào tồn khả dụng |
| 8. Xuất kho | workshop, manager, staff | Xuất NVL để SX và xuất TP giao khách; đúng nguồn/phân công; đủ tồn khả dụng; ghi phiếu và cập nhật lượng đã cấp/giao |
| 9. Báo cáo thành phẩm | workshop, director | Chỉ báo hoàn tất khi SX xong toàn bộ; sản lượng/NVL/lô đúng; gửi BGĐ; không tạo nhập kho trùng phần đã nhập |
| 10. Kiểm kê | director, stocktaker, qc, manager | Lập đợt, phân công, snapshot, đếm/lưu tạm, biên bản, chênh lệch, đề xuất/duyệt/áp dụng, đóng đợt và báo cáo |

Các actor cha Nhân sự kho và Nhân viên kiểm tra là tổng quát hóa UML. Khi chạy thực tế vẫn dùng các tài khoản con được phân quyền, không dùng chung quyền giữa manager/staff hoặc qc/stocktaker.

## Trình tự chạy xuyên suốt

### Chặng A — Chuẩn bị và nhận đơn

1. **manager:** tạo/kiểm tra dữ liệu nền ở module 1; công bố bánh mẫu cho khách.
2. **customer:** đặt đơn module 2, ghi mã đơn; mở lại kiểm tra chi tiết; thử customer2 truy cập đơn này phải bị từ chối.
3. **planner:** tiếp nhận đơn, tạo KHSX từ đơn, chọn xưởng và nhu cầu NVL. Kiểm tra dự phòng chỉ cộng một lần.
4. **director:** xem và duyệt đơn/KHSX; hai trạng thái phải đồng bộ. Với nhánh từ chối, dùng một bộ chứng từ khác để không phá luồng chính.

### Chặng B — Bổ sung và nhập NVL

1. **workshop:** lập báo cáo thiếu NVL, chọn gửi thêm planner. Kiểm tra director và planner nhận/xem đúng báo cáo.
2. **planner:** lập kế hoạch MUA theo phần thiếu; **director** duyệt; **purchaser** lập đơn mua từ nguồn.
3. Kiểm tra thêm chế độ mua thủ công bằng bộ dữ liệu riêng; không yêu cầu báo cáo khi chọn chế độ thủ công theo quy tắc đã thống nhất.
4. Ghi nhận lô thực nhận và phân công QC; người có quyền bắt đầu công việc/lịch trước khi ghi kết quả.
5. **qc:** ví dụ kiểm 100 kg, đạt 90 kg, lỗi 10 kg. Phần lỗi không được nhập vào tồn khả dụng, ghi nhận xử lý trả NCC theo luồng hệ thống.
6. **workshop:** lập yêu cầu nhập NVL từ nguồn hợp lệ. **manager** phân công; **staff** thực hiện ghi sổ vào đúng vị trí.
7. Đối chiếu phiếu và tồn tăng đúng 90 kg nếu nhập toàn bộ phần đạt; thử gửi lại không tăng thêm lần nữa.

### Chặng C — Sản xuất và nhập bánh từng phần

1. **workshop:** yêu cầu xuất NVL theo nhu cầu sản xuất; kiểm tra không dùng lượng thiếu thay nhu cầu, không cộng dự phòng thêm lần nữa.
2. **manager:** phân bổ/phân công; **staff:** xuất thực tế. Kiểm tra tồn giảm và lượng đã cấp tăng tương ứng.
3. **workshop:** khi có sự cố/tiến độ mới, gửi báo cáo SAN_XUAT; không chọn planner thì planner không được nhận/đọc báo cáo.
4. Khi hoàn thành đợt 1, nhập tay yêu cầu cho 40 gói bánh; đợt 2 cho 60 gói, cùng mã lô sản xuất.
5. Thực hiện QC và nhập kho từng phần. Tồn chỉ tăng theo lượng đạt thực nhập, không tự tăng ngay khi tạo yêu cầu.
6. Hoàn tất toàn bộ sản xuất rồi gửi báo cáo THANH_PHAM. Báo cáo dùng lại các lô đã có, không nhập thêm 100 gói lần nữa.

### Chặng D — Giao khách

1. **planner/director:** lập và duyệt kế hoạch BAN theo quy tắc nguồn đã thống nhất.
2. **workshop:** yêu cầu xuất TP khi SX hoàn tất, đến ngày giao và còn hàng đạt QC đã nhập.
3. **manager/staff:** phân công, chọn lô khả dụng và ghi sổ giao hàng.
4. Kiểm tra phiếu xuất, tồn giảm, lượng đã giao của đơn và lượng thực hiện kế hoạch bán. Giao một phần thì phần còn lại phải đúng; không xuất vượt đơn hoặc tồn.

### Chặng E — Kiểm kê

1. **director:** lập đợt, giao kho/phạm vi/người thực hiện; kiểm tra khóa giao dịch trong phạm vi kiểm kê theo quy tắc hệ thống.
2. **stocktaker:** thử số đếm bằng snapshot, thấp hơn và cao hơn; thử 0 và chưa nhập; lưu tạm rồi mở lại.
3. Hoàn thành số đếm; **stocktaker/qc** lập biên bản theo phân công.
4. **manager:** ghi nguyên nhân/đề xuất; **director:** duyệt; **manager:** thực hiện điều chỉnh riêng. Chỉ cập nhật tồn một lần khi áp dụng hợp lệ.
5. Đóng đợt, đối chiếu báo cáo và lịch sử trước/sau điều chỉnh.

## Kiểm tra chung cho mọi module

- Luồng đúng: thao tác xong, tải lại trang và đối chiếu dữ liệu lưu thật.
- Luồng sai: thiếu trường, dữ liệu không hợp lệ, sai nguồn/trạng thái; không phát sinh dữ liệu dở dang.
- Quyền: mở URL/API bằng tài khoản không được phép, không chỉ dựa vào việc ẩn nút/menu.
- Trùng lặp: gửi lại hoặc hai phiên thao tác cùng nguồn không tạo phiếu/tồn/cam kết vượt giới hạn.
- Hủy: không thay dữ liệu; chứng từ đã thực hiện không bị sửa/xóa tùy tiện.

Nguồn xuất NVL, nguồn BAN và người duyệt ngoại lệ đang có điểm khác nhau giữa các tài liệu. Đối chiếu Q01–Q10 trong TEST_CASES.md; nếu chưa chốt kỳ vọng thì ghi Blocked, không tự kết luận Pass/Fail dựa riêng vào hành vi đang chạy.

## Ghi kết quả

| Module / chặng | Mã chứng từ | Thao tác | Kết quả thực tế | Pass / Fail / Blocked | Ảnh / lỗi cần sửa |
| --- | --- | --- | --- | --- | --- |
| … | … | … | … | … | … |

Ghi điểm tại PHIEU_CHAM.md sau khi đủ bằng chứng. Khi nghỉ dùng `docker compose down`; giữ volume dữ liệu, không thêm `-v`.
