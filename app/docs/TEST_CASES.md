# Test case — WarehouseSystem

Ngày lập: 14/10/2026. Nguồn chính: [DacTa_WarehouseSystem.md](DacTa_WarehouseSystem.md).

## 1. Phạm vi và cách sử dụng

Tài liệu thiết kế kiểm thử trước khi chạy: 50 đặc tả UC, 206 ca truy vết luồng cơ bản/thay thế/ngoại lệ và 27 ca bổ sung, tổng 233 ca. Chưa thực thi các ca này và chưa đánh giá Pass/Fail của ứng dụng. Không sửa code hoặc CSDL trong đợt lập tài liệu.

- P0: sai tồn, sai nguồn, sai quyền, mất/trùng dữ liệu; P1: chức năng và nhánh được đặc tả.
- Not Run: chưa chạy; Pass: đủ mọi kết quả mong đợi; Fail: sai ít nhất một kết quả; Blocked: thiếu điều kiện hoặc yêu cầu mâu thuẫn; N/A chỉ sau khi thống nhất bỏ yêu cầu.
- Mỗi ca chạy độc lập với fixture riêng. Trường hợp ghi “lần lượt” phải chạy từng bộ dữ liệu và ghi kết quả con; một bộ lỗi làm ca Fail.
- Đối chiếu cả giao diện, dữ liệu lưu, liên kết nguồn, trạng thái, tồn kho và thông báo. Chỉ thông báo thành công chưa đủ chứng minh Pass.
- Không coi hành vi code hiện tại là kết quả chuẩn nếu khác đặc tả. Ca Blocked giữ nguyên kỳ vọng nguồn để review, không tự sửa đặc tả.
- Ca ở mục 5 kế thừa actor/tiền điều kiện của UC, trừ điều kiện đang được cố ý vi phạm.

## 2. Môi trường, tài khoản và dữ liệu

Chạy trên môi trường kiểm thử có đủ service và migration; không dùng CSDL triển khai chính thức. URL mặc định http://localhost:3000; tài khoản ở [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md), mật khẩu mẫu 123456. Ghi commit, phiên bản migration và trình duyệt khi chạy.

| Fixture | Giá trị chuẩn |
| --- | --- |
| D | Ngày chạy theo Asia/Bangkok; D+1 là ngày kế tiếp |
| Danh mục | TEST-BAKERY, tên Bánh kiểm thử; thêm danh mục chưa tham chiếu và đã tham chiếu |
| Mặt hàng | Bột mì (kg), bánh quy đóng gói (gói); active; bánh là hàng mẫu đã công bố |
| Kho/vị trí | Kho NVL A, kho TP B; vị trí thuộc đúng kho; thêm vị trí cách ly |
| Nhà cung cấp/xưởng | Một NCC hoạt động; xưởng A thuộc workshop; xưởng B không thuộc workshop |
| Đơn khách | customer đặt 100 gói bánh ×35.000 =3.500.000; địa chỉ hợp lệ, hạn D+7; thêm đơn customer2 |
| KHSX | Đơn đã tiếp nhận; xưởng A; NVL gốc100 kg, dự phòng10%=110 kg; trạng thái tùy ca |
| Lô/QC | Lô nhận100 kg, kiểm100, đạt90, lỗi10; thêm lô TP đạt, lô cách ly và lô không khả dụng |
| Tồn | Tạo từ phiếu nhập đã ghi sổ; không sửa trực tiếp bảng tồn để thay nghiệp vụ |
| Báo cáo | SAN_XUAT tiến độ20%, thiếu40 kg; THANH_PHAM hoàn tất100 gói; nguồn khác để kiểm sai tham chiếu |
| Chứng từ | Tạo các bản riêng ở chờ xử lý/chờ duyệt/đã duyệt/đã thực hiện; không đổi trạng thái ngầm trong ca |
| Kiểm kê | Snapshot100; thực tế95/100/105; hai kho và phân công riêng |

## 3. Điểm cần thống nhất trước khi chấm

| Mã | Vấn đề trong nguồn | Ảnh hưởng kiểm thử |
| --- | --- | --- |
| Q01 | UC-17 ghi Chủ xưởng duyệt và áp dụng tồn ngay; quyết định trước đây là BGĐ duyệt, quản lý thực hiện riêng. UC-16 cũng cho cập nhật trực tiếp và gửi Chủ xưởng. | Blocked ca phê duyệt/điều chỉnh đến khi thống nhất actor và thời điểm thay tồn. |
| Q02 | UC-23 xuất NVL từ KHSX; UC-11.01 yêu cầu báo cáo SAN_XUAT làm nguồn. | Cần xác định một nguồn chuẩn hoặc quy định rõ hai chế độ; không ép tạo báo cáo chỉ để xuất. |
| Q03 | UC-23 ghi BAN từ KHSX, báo cáo TP chỉ để báo BGĐ; UC-04, UC-32, UC-35 và UC-11.02 lại dùng báo cáo TP làm nguồn bán. | Blocked luồng BAN/xuất TP liên quan nguồn, không chọn ngầm một phía. |
| Q04 | UC-27 chỉ mua theo kế hoạch đã duyệt; yêu cầu trước đây cho mua thủ công hoặc import. | Bổ sung nhánh mua thủ công và điều kiện của từng nguồn trước khi chấm toàn diện. |
| Q05 | UC-06.1/06.3 nói kiểm dữ liệu số nhưng form chỉ tên/mô tả; UC-07.3 sửa MatHang lại mô tả tên/mô tả danh mục. | Các ca số của danh mục chưa có trường mục tiêu; cần danh sách trường bắt buộc/chỉnh sửa. |
| Q06 | UC-09 tìm phiếu xuất nhưng phần thay thế ghi tìm/hiển thị phiếu nhập. | Kỳ vọng dự kiến là phiếu OUT; giữ ca nhánh Blocked để sửa lỗi văn bản. |
| Q07 | UC-12.2 cho sửa QC chung; quy tắc đã thống nhất QC đã dùng phải sửa bằng chứng từ bù. | Phân biệt QC chưa dùng/đã dùng, chính sách sửa/xóa và bảo toàn lịch sử. |
| Q08 | Chưa có độ dài, độ chính xác số, hạn mức xử lý chênh lệch, định dạng file xuất và quy tắc duy nhất mã/tên đầy đủ. | Không tự đặt ngưỡng. Ca biên có ngưỡng chưa rõ cần xác nhận trước Pass/Fail. |
| Q09 | Nguồn trùng số bước/nhánh; UC-29 thiếu bước hệ thống lưu sau xác nhận. | Truy vết bằng UC + loại luồng + tên nhánh, không chỉ số bước; hậu điều kiện UC-29 dùng làm chuẩn chuyển trạng thái. |
| Q10 | UC-03.1 đổi đơn sang chờ duyệt, chưa giải thích đơn chưa tiếp nhận/KHSX đang có sẽ xử lý thế nào. | Cần xác nhận cập nhật đơn có buộc tiếp nhận lại/tính lại KHSX trước duyệt không. |

Các nội dung ngoài nguồn như ảnh danh mục và mua thủ công được ghi rõ ở ca bổ sung; không đánh dấu là luồng vốn có trong DacTa. Chưa bao gồm bộ nghiệm thu đầy đủ cho hàng khách trả vì nguồn không có UC tương ứng.

## 4. Ma trận truy vết

| UC | Chức năng | Số ca theo đặc tả |
| --- | --- | --- |
| UC-29 | Tiếp nhận đơn hàng | 2 |
| UC-06 | Quản lý danh mục kho | 5 |
| UC-06.1 | Thêm danh mục kho | 6 |
| UC-06.2 | Xóa danh mục kho | 3 |
| UC-06.3 | Sửa danh mục kho | 6 |
| UC-07 | Quản lý dữ liệu danh mục kho | 6 |
| UC-07.1 | Thêm dữ liệu danh mục kho | 6 |
| UC-07.2 | Xóa dữ liệu danh mục kho | 3 |
| UC-07.3 | Sửa dữ liệu danh mục kho | 5 |
| UC-08 | Quản lý nhập kho | 3 |
| UC-09 | Quản lý xuất kho | 3 |
| UC-13 | Lập đợt kiểm kê | 3 |
| UC-17 | Phê duyệt đề xuất xử lý ngoại lệ | 5 |
| UC-18 | Xem danh sách hàng tồn kho | 4 |
| UC-19 | Xem hồ sơ xuất kho | 4 |
| UC-20 | Xem hồ sơ nhập kho | 4 |
| UC-21 | Xem báo cáo kiểm kê | 4 |
| UC-25 | Quản lý công việc | 4 |
| UC-25.1 | Chỉnh sửa công việc | 7 |
| UC-25.2 | Xóa công việc | 3 |
| UC-31 | Phê duyệt kế hoạch sản xuất | 4 |
| UC-14 | Xem/Quản lý đơn hàng mua | 2 |
| UC-23 | Yêu cầu nhập/xuất | 6 |
| UC-24 | Quản lý yêu cầu nhập xuất | 6 |
| UC-24.1 | Sửa yêu cầu | 4 |
| UC-24.2 | Xóa yêu cầu | 3 |
| UC-27 | Mua hàng | 4 |
| UC-04 | Lập kế hoạch mua/bán | 6 |
| UC-05 | Quản lý kế hoạch | 5 |
| UC-05.1 | Sửa kế hoạch | 3 |
| UC-05.2 | Xóa kế hoạch | 3 |
| UC-10 | Nhập kho | 3 |
| UC-11 | Xuất kho | 3 |
| UC-11.01 | Xuất nguyên vật liệu | 3 |
| UC-11.02 | Xuất thành phẩm | 3 |
| UC-35 | Báo cáo thành phẩm | 3 |
| UC-01 | Đăng nhập | 4 |
| UC-12 | Quản lý kết quả kiểm tra QC/AC | 7 |
| UC-12.1 | Thêm kết quả kiểm tra QC/AC | 4 |
| UC-12.2 | Sửa kết quả kiểm tra QC/AC | 4 |
| UC-12.3 | Xóa kết quả kiểm tra QC/AC | 3 |
| UC-34 | Lập phiếu báo cáo sản xuất | 5 |
| UC-15 | Thực hiện kiểm kê | 3 |
| UC-28 | Lập biên bản kiểm kê | 3 |
| UC-32 | Phê duyệt kế hoạch mua/bán | 5 |
| UC-02 | Đặt đơn hàng | 5 |
| UC-03 | Quản lý đơn hàng khách hàng | 4 |
| UC-03.1 | Sửa đơn hàng khách hàng | 6 |
| UC-22 | Tra cứu dữ liệu trong kho | 3 |
| UC-16 | Xử lý chênh lệch kiểm kê | 3 |

## 5. Ca kiểm thử theo từng UC

## UC-29 — Tiếp nhận đơn hàng

- Actor: Bộ phận lập kế hoạch. Tài khoản: planner.
- Tiền điều kiện chung: Bộ phận lập kế hoạch đăng nhập thành công vào hệ thống và có đơn hàng trong trạng thái chờ tiếp nhận.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-29-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-29 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem đơn hàng<br>3. Chọn một đơn hàng cần tiếp nhận (DonHang)<br>5. Chọn Tiếp nhận đơn hàng (DonHang) |
| Kết quả mong đợi | 2. Hiển thị danh sách các đơn hàng chưa được tiếp nhận (DonHang)<br>4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, KhachHang)<br>Hậu điều kiện: Đơn hàng được tiếp nhận và chuyển sang trạng thái đã tiếp nhận, chờ Ban giám đốc phê duyệt (UC-31 Phê duyệt kế hoạch sản xuất) |
| Trạng thái | Not Run |

### TC-29-02 — 2.1 Nếu không có đơn hàng nào

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-29 / Ngoại lệ / 2.1 Nếu không có đơn hàng nào |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tạo phạm vi không có bản ghi hoặc dùng mã TEST-NOT-FOUND; không xóa dữ liệu thật. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có đơn hàng mới (DonHang)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không có đơn hàng mới (DonHang)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-06 — Quản lý danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập và có quyền quản lý danh mục kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-06-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý danh mục kho<br>3. Chọn một danh mục để xem chi tiết (LoaiHang) |
| Kết quả mong đợi | 2. Hiển thị danh sách danh mục hiện có (LoaiHang)<br>4. Hiển thị chi tiết danh mục gồm (Mã danh mục, tên danh mục, mô tả, ngày tạo, ngày chỉnh sửa cuối cùng, số lượng dữ liệu hiện có, số lượng dữ liệu chưa được xuất bản) (LoaiHang, MatHang)<br>Hậu điều kiện: Danh sách danh mục kho (gồm khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) được hiển thị/chỉnh sửa/xoá theo yêu cầu |
| Trạng thái | Not Run |

### TC-06-02 — 3.1 Chọn Thêm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06 / Thay thế / 3.1 Chọn Thêm |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-06.1 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-06.1 |
| Trạng thái | Not Run |

### TC-06-03 — 4.1 Chọn Xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06 / Thay thế / 4.1 Chọn Xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-06.2 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-06.2 |
| Trạng thái | Not Run |

### TC-06-04 — 4.2 Chọn Sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06 / Thay thế / 4.2 Chọn Sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-06.3 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-06.3 |
| Trạng thái | Not Run |

### TC-06-05 — 2.1 Không có danh mục nào trong danh sách

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06 / Ngoại lệ / 2.1 Không có danh mục nào trong danh sách |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

## UC-06.1 — Thêm danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-06-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Thêm danh mục (LoaiHang)<br>3. Nhập tên danh mục, mô tả và xác nhận (LoaiHang) |
| Kết quả mong đợi | 2. Hiển thị form thêm danh mục gồm (Tên danh mục, mô tả) (LoaiHang)<br>4. Kiểm tra dữ liệu vừa được nhập (LoaiHang)<br>5. Lưu danh mục mới vào hệ thống và thông báo thêm thành công (LoaiHang)<br>Hậu điều kiện: Danh mục kho mới được thêm vào hệ thống |
| Trạng thái | Not Run |

### TC-06-1-02 — 3.1 Quản lý kho chọn nhập lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Thay thế / 3.1 Quản lý kho chọn nhập lại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Thông tin danh mục đã nhập bị xóa<br>2. Quay lại UC-06 bước 4 |
| Kết quả mong đợi | 1. Thông tin danh mục đã nhập bị xóa<br>2. Quay lại UC-06 bước 4 |
| Trạng thái | Not Run |

### TC-06-1-03 — 4.1 Tên danh mục đã tồn tại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Ngoại lệ / 4.1 Tên danh mục đã tồn tại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Một bản ghi tên TEST-BAKERY đã tồn tại; nhập lại đúng tên đó. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-06-1-04 — 4.2 Dữ liệu nhập bị bỏ trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Ngoại lệ / 4.2 Dữ liệu nhập bị bỏ trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-06-1-05 — 4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Ngoại lệ / 4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-06-1-06 — 4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1 / Ngoại lệ / 4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị số = -1; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.4.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 2 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-06.2 — Xóa danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-06-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xoá danh mục (LoaiHang)<br>3. Xác nhận xóa |
| Kết quả mong đợi | 2. Hệ thống yêu cầu xác nhận xóa (LoaiHang)<br>4. Hệ thống kiểm tra danh mục có đang được sử dụng hay không (LoaiHang, MatHang)<br>5. Hệ thống xóa danh mục khỏi danh sách và thông báo xoá danh mục thành công (LoaiHang)<br>Hậu điều kiện: Danh mục được xóa khỏi danh sách |
| Trạng thái | Not Run |

### TC-06-2-02 — 3.1 Hủy khi được yêu cầu xác nhận xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.2 / Thay thế / 3.1 Hủy khi được yêu cầu xác nhận xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-06-2-03 — 4.1 Danh mục đang được sử dụng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.2 / Ngoại lệ / 4.1 Danh mục đang được sử dụng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang, MatHang)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang, MatHang)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-06.3 — Sửa danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-06-3-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Sửa danh mục (LoaiHang)<br>3. Nhập thông tin muốn chỉnh sửa (LoaiHang)<br>4. Chọn xác nhận |
| Kết quả mong đợi | 2. Hệ thống hiển thị form với thông tin có thể sửa là tên danh mục và mô tả (LoaiHang)<br>5. Hệ thống kiểm tra dữ liệu vừa được nhập (LoaiHang)<br>6. Hệ thống lưu thông tin danh mục đã chỉnh sửa và thông báo chỉnh sửa thành công (LoaiHang)<br>Hậu điều kiện: Thông tin danh mục được cập nhật chính xác |
| Trạng thái | Not Run |

### TC-06-3-02 — 4.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Thay thế / 4.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-06-3-03 — 5.1 Tên danh mục đã tồn tại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Ngoại lệ / 5.1 Tên danh mục đã tồn tại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Một bản ghi tên TEST-BAKERY đã tồn tại; nhập lại đúng tên đó. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-06-3-04 — 5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Ngoại lệ / 5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-06-3-05 — 5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Ngoại lệ / 5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị số = -1; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-06-3-06 — 5.3 Nếu dữ liệu bị bỏ trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.3 / Ngoại lệ / 5.3 Nếu dữ liệu bị bỏ trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-07 — Quản lý dữ liệu danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập thành công và có quyền quản lý dữ liệu danh mục kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-07-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý dữ liệu danh mục kho<br>3. Chọn một danh mục để xem chi tiết dữ liệu (LoaiHang, MatHang) |
| Kết quả mong đợi | 2. Hiển thị danh sách danh mục (LoaiHang)<br>4. Hiển thị dữ liệu chi tiết (MatHang)<br>Hậu điều kiện: Danh sách dữ liệu gồm (khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) trong danh mục được hiển thị/chỉnh sửa/xóa theo yêu cầu |
| Trạng thái | Not Run |

### TC-07-02 — 3.1 Tìm kiếm dữ liệu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Thay thế / 3.1 Tìm kiếm dữ liệu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho tên dữ liệu cần tìm (MatHang)<br>2. Hệ thống hiển thị dữ liệu phù hợp (MatHang)<br>3. Kết thúc UC |
| Kết quả mong đợi | 1. Quản lý kho tên dữ liệu cần tìm (MatHang)<br>2. Hệ thống hiển thị dữ liệu phù hợp (MatHang)<br>3. Kết thúc UC |
| Trạng thái | Not Run |

### TC-07-03 — 3.2 Chọn Thêm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Thay thế / 3.2 Chọn Thêm |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-07.1 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-07.1 |
| Trạng thái | Not Run |

### TC-07-04 — 4.1 Chọn Xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Thay thế / 4.1 Chọn Xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-07.2 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-07.2 |
| Trạng thái | Not Run |

### TC-07-05 — 4.2 Chọn Sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Thay thế / 4.2 Chọn Sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-07.3 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-07.3 |
| Trạng thái | Not Run |

### TC-07-06 — 2.1 Không có dữ liệu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07 / Ngoại lệ / 2.1 Không có dữ liệu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-07.1 — Thêm dữ liệu danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-07-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Thêm dữ liệu (MatHang)<br>3. Nhập thông tin và xác nhận (MatHang) |
| Kết quả mong đợi | 2. Hiển thị form thêm dữ liệu yêu cầu nhập dữ liệu theo các cột tương ứng trong hệ thống ngoại trừ mã, ngày tạo, ngày cập nhật gần nhất (MatHang, LoaiHang)<br>4. Kiểm tra dữ liệu nhập (MatHang)<br>5. Lưu dữ liệu mới vào hệ thống và thông báo thêm thành công (MatHang)<br>Hậu điều kiện: Dữ liệu mới được thêm vào danh mục |
| Trạng thái | Not Run |

### TC-07-1-02 — 3.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Thay thế / 3.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-07-1-03 — 3.1 Tên đã tồn tại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Ngoại lệ / 3.1 Tên đã tồn tại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Một bản ghi tên TEST-BAKERY đã tồn tại; nhập lại đúng tên đó. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-07-1-04 — 3.2 Dữ liệu để trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Ngoại lệ / 3.2 Dữ liệu để trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-07-1-05 — 3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Ngoại lệ / 3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-07-1-06 — 3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.1 / Ngoại lệ / 3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị số = -1; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.4.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-07.2 — Xóa dữ liệu danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-07-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xóa (MatHang)<br>4. Xác nhận xóa |
| Kết quả mong đợi | 2. Hệ thống kiểm tra dữ liệu có còn tồn kho/phát sinh giao dịch hay không (MatHang, TonKho, ChiTietPhieuKho)<br>3. Hệ thống yêu cầu xác nhận xóa (MatHang)<br>5. Hệ thống xóa dữ liệu khỏi danh sách (MatHang)<br>Hậu điều kiện: Dữ liệu được xóa khỏi danh mục |
| Trạng thái | Not Run |

### TC-07-2-02 — 4.1 Hủy khi được yêu cầu xác nhận xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.2 / Thay thế / 4.1 Hủy khi được yêu cầu xác nhận xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-07-2-03 — 2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.2 / Ngoại lệ / 2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể xóa (MatHang)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể xóa (MatHang)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-07.3 — Sửa dữ liệu danh mục kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-07-3-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.3 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Sửa (MatHang)<br>3. Chỉnh sửa thông tin (tên danh mục, mô tả danh mục) và xác nhận (MatHang, LoaiHang) |
| Kết quả mong đợi | 2. Hệ thống mở form nhập cho phép chỉnh sửa các thông tin được phép chỉnh sửa (MatHang)<br>4. Hệ thống kiểm tra thông tin vừa được nhập (MatHang)<br>4. Hệ thống lưu thông tin mới vào hệ thống và thông báo chỉnh sửa thành công (MatHang)<br>Hậu điều kiện: Thông tin dữ liệu được cập nhật chính xác |
| Trạng thái | Not Run |

### TC-07-3-02 — 3.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.3 / Thay thế / 3.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Quản lý kho chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-07-3-03 — 4.1 Tên bị trùng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.3 / Ngoại lệ / 4.1 Tên bị trùng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Một bản ghi tên TEST-BAKERY đã tồn tại; nhập lại đúng tên đó. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-07-3-04 — 4.2 Nếu dữ liệu bị nhập sai định dạng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.3 / Ngoại lệ / 4.2 Nếu dữ liệu bị nhập sai định dạng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-07-3-05 — 4.3 Dữ liệu để trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-07.3 / Ngoại lệ / 4.3 Dữ liệu để trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-08 — Quản lý nhập kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-08-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-08 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý nhập kho<br>3. Chọn một phiếu nhập kho để xem chi tiết (PhieuKho) |
| Kết quả mong đợi | 2. Hiển thị danh sách phiếu nhập kho (PhieuKho)<br>4. Hiển thị thông tin chi tiết phiếu nhập kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang)<br>Hậu điều kiện: Danh sách chi tiết các phiếu nhập kho được hiển thị |
| Trạng thái | Not Run |

### TC-08-02 — 3.1 Tìm kiếm phiếu nhập kho

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-08 / Thay thế / 3.1 Tìm kiếm phiếu nhập kho |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)<br>2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)<br>3. Đi đến bước 3 |
| Kết quả mong đợi | 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)<br>2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)<br>3. Đi đến bước 3 |
| Trạng thái | Not Run |

### TC-08-03 — 2.1 Không có phiếu nhập kho

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-08 / Ngoại lệ / 2.1 Không có phiếu nhập kho |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

## UC-09 — Quản lý xuất kho

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đã đăng nhập.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-09-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-09 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý xuất kho<br>3. Chọn một phiếu xuất kho để xem chi tiết (PhieuKho) |
| Kết quả mong đợi | 2. Hiển thị danh sách phiếu xuất kho (PhieuKho)<br>4. Hiển thị thông tin chi tiết phiếu xuất kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang)<br>Hậu điều kiện: Danh sách phiếu xuất kho được hiển thị |
| Trạng thái | Not Run |

### TC-09-02 — 3.1 Tìm kiếm phiếu xuất kho

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-09 / Thay thế / 3.1 Tìm kiếm phiếu xuất kho |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)<br>2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)<br>3. Đi đến bước 3 |
| Kết quả mong đợi | 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)<br>2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)<br>3. Đi đến bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-09-03 — 2.1 Không có phiếu xuất kho phù hợp

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-09 / Ngoại lệ / 2.1 Không có phiếu xuất kho phù hợp |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho)<br>2. Quay lại bước 1 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-13 — Lập đợt kiểm kê

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-13-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-13 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Lập đợt kiểm kê<br>3. Nhập thông tin đợt kiểm kê (thời gian, loại nguyên vật liệu/thành phẩm, chọn danh sách các kho cần kiểm, ngày kiểm kê) (CongViec, PhieuKiemKe, Kho, MatHang)<br>5. Xác nhận lập đợt kiểm kê |
| Kết quả mong đợi | 2. Hiển thị form lập đợt kiểm kê (CongViec, Kho)<br>4. Kiểm tra thông tin đợt kiểm kê (CongViec, PhieuKiemKe, Kho)<br>6. Lưu đợt kiểm kê, gửi cho Ban kiểm kê và thông báo tạo thành công (CongViec, PhieuKiemKe)<br>Hậu điều kiện: Đợt kiểm kê mới được tạo, lưu vào hệ thống và gửi cho Ban kiểm kê |
| Trạng thái | Not Run |

### TC-13-02 — 5.1 Ban giám đốc chọn nhập lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-13 / Thay thế / 5.1 Ban giám đốc chọn nhập lại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>2. Hệ thống hủy thông tin đã nhập<br>3. Quay lại bước 3 |
| Kết quả mong đợi | 2. Hệ thống hủy thông tin đã nhập<br>3. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-13-03 — 4.1 Thời gian/phạm vi kiểm kê không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-13 / Ngoại lệ / 4.1 Thời gian/phạm vi kiểm kê không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (CongViec, PhieuKiemKe)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (CongViec, PhieuKiemKe)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

## UC-17 — Phê duyệt đề xuất xử lý ngoại lệ

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Có đề xuất xử lý hàng lỗi hoặc chênh lệch kiểm kê đang chờ phê duyệt.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-17-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-17 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Phê duyệt đề xuất xử lý ngoại lệ<br>3. Chọn một đề xuất để xem chi tiết (BanDeXuatXuLyNgoaiLe)<br>5. Chọn Phê duyệt (KetQuaXuLyNgoaiLe) |
| Kết quả mong đợi | 2. Hiển thị danh sách đề xuất đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)<br>4. Hiển thị thông tin chi tiết đề xuất, loại hàng, số lượng, hàng bị vấn đề gì (BanDeXuatXuLyNgoaiLe, MatHang, LoaiHang, ChiTietKetQuaKiemTraQCAC, ChiTietPhieuKiemKe)<br>6. Cập nhật trạng thái đề xuất đã duyệt và áp dụng thay đổi liên quan (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, TonKho)<br>Hậu điều kiện: Đề xuất được phê duyệt hoặc từ chối và trạng thái được cập nhật |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-17-02 — 5.1 Từ chối đề xuất và có nhập lý do

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-17 / Thay thế / 5.1 Từ chối đề xuất và có nhập lý do |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Từ chối và nhập lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống cập nhật trạng thái đề xuất bị từ chối và thông báo cho người đề xuất (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)<br>3. Quay lại bước 1 |
| Kết quả mong đợi | 1. Chủ xưởng chọn Từ chối và nhập lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống cập nhật trạng thái đề xuất bị từ chối và thông báo cho người đề xuất (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)<br>3. Quay lại bước 1 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-17-03 — 5.2 Từ chối đề xuất nhưng không nhập lý do

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-17 / Thay thế / 5.2 Từ chối đề xuất nhưng không nhập lý do |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Từ chối nhưng để trống lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KetQuaXuLyNgoaiLe)<br>3. Quay lại bước 4 |
| Kết quả mong đợi | 1. Chủ xưởng chọn Từ chối nhưng để trống lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KetQuaXuLyNgoaiLe)<br>3. Quay lại bước 4 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-17-04 — 2.1 Không có đề xuất nào đang chờ phê duyệt

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-17 / Ngoại lệ / 2.1 Không có đề xuất nào đang chờ phê duyệt |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)<br>2. Kết thúc use case |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-17-05 — 4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-17 / Ngoại lệ / 4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Mở cùng chứng từ ở hai phiên; phiên A xử lý trước, phiên B giữ màn hình cũ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo đề xuất không còn hiệu lực (BanDeXuatXuLyNgoaiLe)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo đề xuất không còn hiệu lực (BanDeXuatXuLyNgoaiLe)<br>2. Quay lại bước 1 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-18 — Xem danh sách hàng tồn kho

- Actor: Ban giám đốc, Chủ xưởng, Quản lý kho. Tài khoản: Ban giám đốc, Chủ xưởng, Quản lý kho (đối chiếu DEMO_ACCOUNTS.md).
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập và có quyền xem báo cáo tồn kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-18-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-18 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem danh sách hàng tồn kho<br>3. Chọn điều kiện lọc và xác nhận (Kho, MatHang) |
| Kết quả mong đợi | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang)<br>4. Tổng hợp và hiển thị danh sách hàng tồn kho tương ứng (TonKho, Kho, MatHang, LoHang, ChiTietLo)<br>Hậu điều kiện: Danh sách hàng tồn kho được hiển thị theo điều kiện lựa chọn |
| Trạng thái | Not Run |

### TC-18-02 — 2.1 Xuất báo cáo ra file

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-18 / Thay thế / 2.1 Xuất báo cáo ra file |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Xuất file (TonKho)<br>2. Hệ thống tạo và tải về file báo cáo (TonKho)<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Ban giám đốc chọn Xuất file (TonKho)<br>2. Hệ thống tạo và tải về file báo cáo (TonKho)<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-18-03 — 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-18 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (TonKho)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (TonKho)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-18-04 — 4.1 Không có dữ liệu phù hợp với điều kiện lọc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-18 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-19 — Xem hồ sơ xuất kho

- Actor: Ban giám đốc, Chủ xưởng. Tài khoản: Ban giám đốc, Chủ xưởng (đối chiếu DEMO_ACCOUNTS.md).
- Tiền điều kiện chung: Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-19-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-19 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem hồ sơ xuất kho<br>3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) |
| Kết quả mong đợi | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)<br>4. Tổng hợp và hiển thị hồ sơ xuất kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang, ChiTietLo)<br>Hậu điều kiện: Hồ sơ xuất kho được hiển thị theo điều kiện lựa chọn |
| Trạng thái | Not Run |

### TC-19-02 — 2.1 Xuất báo cáo ra file

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-19 / Thay thế / 2.1 Xuất báo cáo ra file |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-19-03 — 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-19 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-19-04 — 4.1 Không có dữ liệu phù hợp với điều kiện lọc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-19 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-20 — Xem hồ sơ nhập kho

- Actor: Ban giám đốc, Chủ xưởng. Tài khoản: Ban giám đốc, Chủ xưởng (đối chiếu DEMO_ACCOUNTS.md).
- Tiền điều kiện chung: Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-20-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-20 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem hồ sơ nhập kho<br>3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) |
| Kết quả mong đợi | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)<br>4. Tổng hợp và hiển thị hồ sơ nhập kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang, ChiTietLo)<br>Hậu điều kiện: Hồ sơ nhập kho được hiển thị theo điều kiện lựa chọn |
| Trạng thái | Not Run |

### TC-20-02 — 2.1 Xuất báo cáo ra file

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-20 / Thay thế / 2.1 Xuất báo cáo ra file |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-20-03 — 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-20 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-20-04 — 4.1 Không có dữ liệu phù hợp với điều kiện lọc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-20 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-21 — Xem báo cáo kiểm kê

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập và có quyền xem báo cáo kiểm kê.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-21-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-21 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem báo cáo kiểm kê<br>3. Chọn điều kiện lọc và xác nhận (PhieuKiemKe, CongViec, Kho) |
| Kết quả mong đợi | 2. Hiển thị form điều kiện lọc báo cáo (đợt kiểm kê, thời gian, khu vực) (PhieuKiemKe, CongViec, Kho)<br>4. Tổng hợp và hiển thị báo cáo kiểm kê tương ứng (bao gồm số liệu chênh lệch) (PhieuKiemKe, ChiTietPhieuKiemKe, Kho, MatHang)<br>Hậu điều kiện: Báo cáo kiểm kê được hiển thị theo điều kiện lựa chọn |
| Trạng thái | Not Run |

### TC-21-02 — 2.1 Xuất báo cáo ra file

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-21 / Thay thế / 2.1 Xuất báo cáo ra file |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Xuất file (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Ban giám đốc chọn Xuất file (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Hệ thống tạo và tải về file báo cáo (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-21-03 — 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-21 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-21-04 — 4.1 Không có dữ liệu phù hợp với điều kiện lọc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-21 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-25 — Quản lý công việc

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập và có quyền quản lý công việc.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-25-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý công việc<br>3. Chọn công việc cụ thể (CongViec) |
| Kết quả mong đợi | 2. Hiển thị danh sách công việc (CongViec)<br>4. Hiển thị thông tin chi tiết công việc gồm: tên công việc, mô tả, ngày bắt đầu, ngày kết thúc, độ ưu tiên, trạng thái, nhân viên được phân công (CongViec, NhanVien)<br>5. Kết thúc UC<br>Hậu điều kiện: Công việc được xem, cập nhật hoặc xoá theo thao tác của Ban giám đốc |
| Trạng thái | Not Run |

### TC-25-02 — 4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25 / Thay thế / 4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Đi đến UC-25.1 Chỉnh sửa công việc |
| Kết quả mong đợi | 1. Đi đến UC-25.1 Chỉnh sửa công việc |
| Trạng thái | Not Run |

### TC-25-03 — 4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25 / Thay thế / 4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Đi đến UC-25.2 Xóa công việc |
| Kết quả mong đợi | 1. Đi đến UC-25.2 Xóa công việc |
| Trạng thái | Not Run |

### TC-25-04 — 2.1 Nếu danh sách công việc hiện đang trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25 / Ngoại lệ / 2.1 Nếu danh sách công việc hiện đang trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tạo phạm vi không có bản ghi hoặc dùng mã TEST-NOT-FOUND; không xóa dữ liệu thật. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có công việc hiện tại (CongViec)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không có công việc hiện tại (CongViec)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-25.1 — Chỉnh sửa công việc

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần chỉnh sửa.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-25-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Chỉnh sửa công việc (CongViec)<br>3. Nhập thông tin muốn chỉnh sửa (CongViec, NhanVien) |
| Kết quả mong đợi | 2. Hiển thị form với thông tin hiện tại của công việc (CongViec, NhanVien)<br>4. Chọn Xác nhận<br>5. Kiểm tra dữ liệu nhập (CongViec)<br>6. Kiểm tra lịch trình nhân viên nếu có bổ sung/thay đổi nhân viên (NhanVien, CongViec)<br>7. Lưu thông tin công việc được cập nhật vào hệ thống và thông báo cập nhật thành công (CongViec, NhanVien)<br>Hậu điều kiện: Công việc được cập nhật theo đúng thông tin Ban giám đốc xác nhận |
| Trạng thái | Not Run |

### TC-25-1-02 — 4.1 Nếu giám đốc chọn Huỷ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Thay thế / 4.1 Nếu giám đốc chọn Huỷ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hủy thông tin đã chỉnh sửa<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống hủy thông tin đã chỉnh sửa<br>2. Kết thúc UC |
| Trạng thái | Not Run |

### TC-25-1-03 — 5.1 Nếu giám đốc nhập chữ vào ô nhập số

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Ngoại lệ / 5.1 Nếu giám đốc nhập chữ vào ô nhập số |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi định dạng (CongViec)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi định dạng (CongViec)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-25-1-04 — 5.2 Nếu giám đốc nhập số < 0

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Ngoại lệ / 5.2 Nếu giám đốc nhập số < 0 |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị số = -1; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo số phải lớn hơn 0 (CongViec)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo số phải lớn hơn 0 (CongViec)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-25-1-05 — 5.3 Nếu bỏ trống thông tin bắt buộc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Ngoại lệ / 5.3 Nếu bỏ trống thông tin bắt buộc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-25-1-06 — 5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Ngoại lệ / 5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.4.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo thời gian thực hiện công việc không hợp lệ (CongViec)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo thời gian thực hiện công việc không hợp lệ (CongViec)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-25-1-07 — 6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.1 / Ngoại lệ / 6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | staff đã có công việc 08:00–10:00; công việc mới 09:00–11:00 cùng ngày. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo nhân viên đang không trống lịch, yêu cầu chọn nhân viên khác (NhanVien, CongViec)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo nhân viên đang không trống lịch, yêu cầu chọn nhân viên khác (NhanVien, CongViec)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-25.2 — Xóa công việc

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần xoá.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-25-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xóa công việc muốn xoá (CongViec)<br>3. Chọn Xác nhận |
| Kết quả mong đợi | 2. Hệ thống yêu cầu xác nhận (CongViec)<br>4. Kiểm tra công việc có đang được thực hiện (CongViec)<br>5. Xóa công việc khỏi hệ thống và thông báo xoá thành công (CongViec)<br>Hậu điều kiện: Công việc được xoá khỏi hệ thống khi đáp ứng điều kiện xoá |
| Trạng thái | Not Run |

### TC-25-2-02 — 3.1 Nếu giám đốc chọn Huỷ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.2 / Thay thế / 3.1 Nếu giám đốc chọn Huỷ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hủy thao tác xoá<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống hủy thao tác xoá<br>2. Kết thúc UC |
| Trạng thái | Not Run |

### TC-25-2-03 — 4.1 Nếu công việc hiện đang được diễn ra

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-25.2 / Ngoại lệ / 4.1 Nếu công việc hiện đang được diễn ra |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo công việc đang được tiến hành, không thể xoá (CongViec)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo công việc đang được tiến hành, không thể xoá (CongViec)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

## UC-31 — Phê duyệt kế hoạch sản xuất

- Actor: Ban giám đốc (`director`). KHSX nháp gắn đơn đã tiếp nhận.
- Dùng CSDL acceptance riêng; không sinh đơn vào dữ liệu đang test thủ công.

### TC-31-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-31 / Luồng cơ bản |
| Ưu tiên | P1 |
| Thao tác | Tạo hai KHSX hợp lệ cùng đơn. Giám đốc mở KHSX thứ nhất và duyệt theo version kế hoạch. |
| Kết quả mong đợi | Chỉ KHSX thứ nhất APPROVED; đơn nguồn tự APPROVED; KHSX thứ hai vẫn DRAFT. Có thông báo khách/xưởng/planner và lịch sử. Đơn không có nút duyệt; API duyệt đơn cũ bị chặn. |
| Trạng thái | Not Run |

### TC-31-02 — 5.1 Từ chối kế hoạch sản xuất

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-31 / Thay thế / 5.1 Từ chối kế hoạch sản xuất |
| Ưu tiên | P1 |
| Thao tác | Chọn từ chối, kiểm tra thiếu lý do bị chặn; nhập lý do và gửi. Planner sửa rồi trình lại. |
| Kết quả mong đợi | KHSX vẫn DRAFT, version tăng, lý do lưu lịch sử, planner nhận thông báo. Đơn giữ RECEIVED và các KHSX khác không đổi. Duyệt bản sửa cập nhật đúng KHSX và đơn nguồn. |
| Trạng thái | Not Run |

### TC-31-03 — 2.1 Danh sách kế hoạch chờ phê duyệt rỗng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-31 / Ngoại lệ / 2.1 Danh sách kế hoạch chờ phê duyệt rỗng |
| Ưu tiên | P2 |
| Thao tác | Lọc trạng thái DRAFT khi không có kế hoạch phù hợp. |
| Kết quả mong đợi | Danh sách rỗng hợp lệ, không mutation. |
| Trạng thái | Not Run |

### TC-31-04 — 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt hoặc version cũ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-31 / Ngoại lệ / 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt hoặc version cũ |
| Ưu tiên | P1 |
| Thao tác | Duyệt bằng version cũ hoặc kế hoạch đã duyệt; gửi lại cùng key/nội dung; thử actor không phải director. |
| Kết quả mong đợi | Chặn stale/state/quyền, không cập nhật đơn ngoài transaction. Replay đúng key trả kết quả đã lưu, không lặp thông báo hay tăng version lần hai. |
| Trạng thái | Not Run |
## UC-14 — Xem/Quản lý đơn hàng mua

- Actor: Bộ phận mua hàng. Tài khoản: purchaser.
- Tiền điều kiện chung: Bộ phận mua hàng đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-14-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-14 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xem/Quản lý đơn hàng mua |
| Kết quả mong đợi | 2. Hiển thị danh sách đơn hàng đã đặt (DonMuaHang, NhaCungCap)<br>Hậu điều kiện: Hiển thị danh sách đơn mua hàng đã đặt |
| Trạng thái | Not Run |

### TC-14-02 — 2.1 Không có đơn hàng trong hệ thống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-14 / Ngoại lệ / 2.1 Không có đơn hàng trong hệ thống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonMuaHang)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonMuaHang)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

## UC-23 — Yêu cầu nhập/xuất

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Chủ xưởng đã đăng nhập và có quyền đối với xưởng..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-23-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Yêu cầu nhập/xuất.<br>3. Chọn loại nhập/xuất và loại hàng; nhập tay mặt hàng, lượng đề nghị, thông tin lô, kho, thời điểm và ghi chú. (MatHang, LoHang, ChiTietPhieuYeuCauNhapXuat)<br>5. Chọn Gửi yêu cầu. |
| Kết quả mong đợi | 2. Hiển thị form yêu cầu nhập/xuất.<br>4. Hiển thị các dòng dữ liệu đã nhập.<br>6. Kiểm tra thông tin bắt buộc và số lượng lớn hơn 0.<br>7. Kiểm tra quyền, lô, điều kiện nhập/xuất và lượng còn được phép; đối chiếu lượng đã thực hiện và các yêu cầu còn hiệu lực để chặn trùng hoặc vượt nhu cầu. (ChiTietPhieuKho, ChiTietPhieuYeuCauNhapXuat)<br>8. Lưu yêu cầu với trạng thái Chờ xử lý và tham chiếu nguồn nếu import. (PhieuYeuCauNhapXuat)<br>9. Lưu các dòng mặt hàng và lượng đề nghị. (ChiTietPhieuYeuCauNhapXuat)<br>10. Gửi thông báo đến bộ phận kho.<br>11. Hiển thị message “Tạo yêu cầu thành công”.<br>12. Kết thúc use case.<br>Hậu điều kiện: Yêu cầu hợp lệ được lưu ở trạng thái Chờ xử lý và thông báo đến bộ phận kho. Tạo yêu cầu không thay đổi tồn kho. |
| Trạng thái | Not Run |

### TC-23-02 — 3.1 Import dữ liệu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Thay thế / 3.1 Import dữ liệu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Import dữ liệu thay cho nhập tay.<br>2. Hệ thống hiển thị nguồn phù hợp với loại yêu cầu. (KeHoachMuaBan (MUA, BAN), KeHoachSanXuat)<br>3. Chủ xưởng chọn kế hoạch và lô/đợt nhận tương ứng.<br>4. Hệ thống lấy danh sách mặt hàng và lượng nguồn: nhập NVL từ kế hoạch MUA; xuất thành phẩm từ kế hoạch BAN; xuất NVL từ kế hoạch sản xuất. (ChiTietKeHoachMuaBan, ChiTietKeHoachSanXuat)<br>5. Hệ thống đối chiếu kết quả QC/AC cùng mặt hàng và lô/đợt nhận: nhập NVL chỉ lấy phần thực nhận đạt QC, trừ phần trả về; xuất thành phẩm chỉ lấy phần đạt QC đã nhập kho. (ChiTietKetQuaKiemTraQCAC)<br>6. Hệ thống điền dữ liệu nguồn vào form để chủ xưởng nhập lượng đề nghị, kho, thời điểm và ghi chú. Nhập thành phẩm từng phần sử dụng nhập tay và cùng mã lô sản xuất.<br>7. Đi đến bước 4 của luồng cơ bản. |
| Kết quả mong đợi | 1. Chủ xưởng chọn Import dữ liệu thay cho nhập tay.<br>2. Hệ thống hiển thị nguồn phù hợp với loại yêu cầu. (KeHoachMuaBan (MUA, BAN), KeHoachSanXuat)<br>3. Chủ xưởng chọn kế hoạch và lô/đợt nhận tương ứng.<br>4. Hệ thống lấy danh sách mặt hàng và lượng nguồn: nhập NVL từ kế hoạch MUA; xuất thành phẩm từ kế hoạch BAN; xuất NVL từ kế hoạch sản xuất. (ChiTietKeHoachMuaBan, ChiTietKeHoachSanXuat)<br>5. Hệ thống đối chiếu kết quả QC/AC cùng mặt hàng và lô/đợt nhận: nhập NVL chỉ lấy phần thực nhận đạt QC, trừ phần trả về; xuất thành phẩm chỉ lấy phần đạt QC đã nhập kho. (ChiTietKetQuaKiemTraQCAC)<br>6. Hệ thống điền dữ liệu nguồn vào form để chủ xưởng nhập lượng đề nghị, kho, thời điểm và ghi chú. Nhập thành phẩm từng phần sử dụng nhập tay và cùng mã lô sản xuất.<br>7. Đi đến bước 4 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-23-03 — 3.1 Nguồn hoặc lô không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Ngoại lệ / 3.1 Nguồn hoặc lô không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị message “Không có nguồn hợp lệ để lập yêu cầu”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị message “Không có nguồn hợp lệ để lập yêu cầu”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-23-04 — 5.1 Hủy trước khi gửi

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Ngoại lệ / 5.1 Hủy trước khi gửi |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị message “Hủy dữ liệu chưa lưu; không tạo yêu cầu”. Không lưu yêu cầu.<br>2. Đi đến bước 12 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị message “Hủy dữ liệu chưa lưu; không tạo yêu cầu”. Không lưu yêu cầu.<br>2. Đi đến bước 12 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-23-05 — 6.1 Thiếu thông tin hoặc số lượng không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Ngoại lệ / 6.1 Thiếu thông tin hoặc số lượng không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị message “Vui lòng nhập đầy đủ thông tin và số lượng lớn hơn 0”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị message “Vui lòng nhập đầy đủ thông tin và số lượng lớn hơn 0”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-23-06 — 7.1 Không đủ điều kiện, trùng hoặc vượt lượng được phép

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23 / Ngoại lệ / 7.1 Không đủ điều kiện, trùng hoặc vượt lượng được phép |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 7.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị message “Yêu cầu không đủ điều kiện hoặc lượng đề nghị vượt lượng còn được phép”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị message “Yêu cầu không đủ điều kiện hoặc lượng đề nghị vượt lượng còn được phép”. Không lưu yêu cầu.<br>2. Đi đến bước 3 của luồng cơ bản. |
| Trạng thái | Not Run |

## UC-24 — Quản lý yêu cầu nhập xuất

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Chủ xưởng đã đăng nhập; đã có yêu cầu được gửi (UC-23).
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-24-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý yêu cầu<br>3. Chọn một yêu cầu để xem chi tiết (PhieuYeuCauNhapXuat) |
| Kết quả mong đợi | 2. Hiển thị danh sách yêu cầu đã gửi của chủ xưởng (PhieuYeuCauNhapXuat)<br>4. Hiển thị thông tin và trạng thái xử lý yêu cầu (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, MatHang)<br>Hậu điều kiện: Danh sách yêu cầu của chủ xưởng được hiển thị/tìm kiếm theo yêu cầu |
| Trạng thái | Not Run |

### TC-24-02 — 1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Thay thế / 1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng nhập điều kiện tìm kiếm (PhieuYeuCauNhapXuat)<br>2. Hệ thống hiển thị yêu cầu phù hợp (PhieuYeuCauNhapXuat)<br>3. Quay lại bước 1 |
| Kết quả mong đợi | 1. Chủ xưởng nhập điều kiện tìm kiếm (PhieuYeuCauNhapXuat)<br>2. Hệ thống hiển thị yêu cầu phù hợp (PhieuYeuCauNhapXuat)<br>3. Quay lại bước 1 |
| Trạng thái | Not Run |

### TC-24-03 — 4.1 Chọn Sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Thay thế / 4.1 Chọn Sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-24.1 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-24.1 |
| Trạng thái | Not Run |

### TC-24-04 — 4.2 Chọn Xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Thay thế / 4.2 Chọn Xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-24.2 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-24.2 |
| Trạng thái | Not Run |

### TC-24-05 — 1.1 Tìm kiếm/lọc không có 1 t quả phù hợp

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Ngoại lệ / 1.1 Tìm kiếm/lọc không có 1 t quả phù hợp |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tạo phạm vi không có bản ghi hoặc dùng mã TEST-NOT-FOUND; không xóa dữ liệu thật. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (PhieuYeuCauNhapXuat)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (PhieuYeuCauNhapXuat)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

### TC-24-06 — 2.1 Không có yêu cầu trong hệ thống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24 / Ngoại lệ / 2.1 Không có yêu cầu trong hệ thống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy yêu cầu (PhieuYeuCauNhapXuat)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy yêu cầu (PhieuYeuCauNhapXuat)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-24.1 — Sửa yêu cầu

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Chủ xưởng đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-24-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Sửa (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>4. Chỉnh sửa thông tin muốn thay đổi (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>5. Chọn xác nhận |
| Kết quả mong đợi | 2. Kiểm tra yêu cầu chưa được xử lý (PhieuYeuCauNhapXuat)<br>3. Hiển thị form với thông tin hiện tại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>6. Hệ thống kiểm tra thông tin nhập (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>7. Hệ thống cập nhật thông tin sau khi chỉnh sửa (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>Hậu điều kiện: Thông tin yêu cầu được cập nhật chính xác |
| Trạng thái | Not Run |

### TC-24-1-02 — 5.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.1 / Thay thế / 5.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-24-1-03 — 2.1 Yêu cầu đã được xử lý

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.1 / Ngoại lệ / 2.1 Yêu cầu đã được xử lý |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

### TC-24-1-04 — 6.1 Thông tin không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.1 / Ngoại lệ / 6.1 Thông tin không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-24.2 — Xóa yêu cầu

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Yêu cầu đang ở trạng thái Chờ xử lý.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-24-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn một yêu cầu và chọn Xóa (PhieuYeuCauNhapXuat)<br>3. Xác nhận xóa |
| Kết quả mong đợi | 2. Hệ thống yêu cầu xác nhận xóa (PhieuYeuCauNhapXuat)<br>4. Hệ thống hủy yêu cầu và thông báo đến bộ phận kho (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)<br>Hậu điều kiện: Yêu cầu bị xóa/hủy khỏi danh sách |
| Trạng thái | Not Run |

### TC-24-2-02 — 3.1 Hủy trước khi xác nhận xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.2 / Thay thế / 3.1 Hủy trước khi xác nhận xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-24-2-03 — 3.1 Yêu cầu đã được xử lý

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-24.2 / Ngoại lệ / 3.1 Yêu cầu đã được xử lý |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-27 — Mua hàng

- Actor: Bộ phận mua hàng. Tài khoản: purchaser.
- Tiền điều kiện chung: Bộ phận mua hàng đăng nhập thành công vào hệ thống và kế hoạch mua hàng đã được duyệt.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-27-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-27 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Mua hàng<br>3. Chọn một kế hoạch mua để xem chi tiết (KeHoachMuaBan)<br>5. Nhập thông tin nhà cung cấp, giá, điều kiện giao hàng (DonMuaHang, ChiTietDonMuaHang, NhaCungCap)<br>7. Xác nhận mua hàng |
| Kết quả mong đợi | 2. Hiển thị kế hoạch loại MUA đã được duyệt, còn nhu cầu cần xử lý. (KeHoachMuaBan)<br>4. Hiển thị chi tiết kế hoạch và báo cáo sản xuất nguồn. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang)<br>6. Kiểm tra thông tin đơn mua, lượng đã mua và báo cáo nguồn phải là SAN_XUAT, trùng nguồn của kế hoạch MUA đã duyệt. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)<br>8. Tạo đơn mua và chi tiết, tham chiếu kế hoạch MUA và MaBaoCao nguồn; cập nhật trạng thái thực hiện kế hoạch. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan)<br>Hậu điều kiện: Đơn hàng mua (nguyên vật liệu) mới được tạo và đang trong trạng thái "Chờ xử lý" |
| Trạng thái | Not Run |

### TC-27-02 — 7.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-27 / Thay thế / 7.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 7.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Bộ phận mua hàng chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Bộ phận mua hàng chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-27-03 — 2.1 Không có kế hoạch mua hàng nào đang chờ xử lý

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-27 / Ngoại lệ / 2.1 Không có kế hoạch mua hàng nào đang chờ xử lý |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan)<br>2. Kết thúc UC. |
| Kết quả mong đợi | 1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan)<br>2. Kết thúc UC. |
| Trạng thái | Not Run |

### TC-27-04 — 6.1 Thông tin đơn hàng mua không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-27 / Ngoại lệ / 6.1 Thông tin đơn hàng mua không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)<br>2. Quay lại bước 5 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)<br>2. Quay lại bước 5 |
| Trạng thái | Not Run |

## UC-04 — Lập kế hoạch mua/bán

- Actor: Bộ phận lập kế hoạch. Tài khoản: planner.
- Tiền điều kiện chung: Bộ phận lập kế hoạch đã đăng nhập.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-04-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Lập kế hoạch mua/bán<br>3. Chọn kế hoạch MUA và báo cáo sản xuất có NVL còn thiếu. (KeHoachMuaBan, BanBaoCaoSanXuat)<br>4. Lấy danh sách NVL còn thiếu từ báo cáo; nhập giá dự kiến và ghi chú, đối chiếu lượng cần mua. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietKeHoachMuaBan, MatHang)<br>7. Chọn Xác nhận |
| Kết quả mong đợi | 2. Hiển thị form chọn loại kế hoạch và báo cáo nguồn. (KeHoachMuaBan, BanBaoCaoSanXuat)<br>5. Kiểm tra loại báo cáo, số lượng còn thiếu và thông tin kế hoạch. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>6. Tính tổng tiền dựa trên đơn giá * số lượng (ChiTietKeHoachMuaBan, MatHang)<br>8. Lưu kế hoạch MUA và chi tiết, tham chiếu MaBaoCao nguồn, chuyển sang Chờ phê duyệt; thông báo thành công. (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>Hậu điều kiện: Kế hoạch mua/bán mới được tạo, lưu vào hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-32 Phê duyệt kế hoạch mua/bán) |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-04-02 — 3.1 Chọn kế hoạch bán hàng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Thay thế / 3.1 Chọn kế hoạch bán hàng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chọn báo cáo THANH_PHAM; lấy thành phẩm thực tế, đối chiếu phần đạt QC đã nhập kho và tồn khả dụng, nhập lượng bán và ghi chú. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, TonKho, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Thực hiện kiểm tra và tính tổng tiền như bước 5–6; khi xác nhận, lưu kế hoạch BAN và chi tiết, tham chiếu báo cáo thành phẩm, trạng thái Chờ phê duyệt. (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
| Kết quả mong đợi | 1. Chọn báo cáo THANH_PHAM; lấy thành phẩm thực tế, đối chiếu phần đạt QC đã nhập kho và tồn khả dụng, nhập lượng bán và ghi chú. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, TonKho, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Thực hiện kiểm tra và tính tổng tiền như bước 5–6; khi xác nhận, lưu kế hoạch BAN và chi tiết, tham chiếu báo cáo thành phẩm, trạng thái Chờ phê duyệt. (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-04-03 — 3.2 Chọn kế hoạch sản xuất

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Thay thế / 3.2 Chọn kế hoạch sản xuất |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Bộ phận lập kế hoạch chọn đơn hàng cần sản xuất; hệ thống lấy thông tin từ đơn hàng gồm thành phẩm, số lượng và ngày giao dự kiến (KeHoachSanXuat, ChiTietKeHoachSanXuat, DonHang, ChiTietDonHang, MatHang)<br>2. Chọn xưởng, nhập ghi chú; hệ thống ước lượng NVL bằng thuật toán, cộng 10% từng loại và đối chiếu tồn khả dụng để xác định lượng thiếu dự kiến. Chi tiết kế hoạch gồm thành phẩm và NVL, phân biệt bằng LoaiChiTiet. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang, TonKho, ChiTietLo)<br>3. Kiểm tra đơn hàng, xưởng và lượng dự kiến; khi xác nhận, lưu kế hoạch sản xuất và chi tiết để trình duyệt cùng đơn hàng tại UC-31. Không lưu vào kế hoạch mua/bán ở nhánh này. (KeHoachSanXuat, ChiTietKeHoachSanXuat) |
| Kết quả mong đợi | 1. Bộ phận lập kế hoạch chọn đơn hàng cần sản xuất; hệ thống lấy thông tin từ đơn hàng gồm thành phẩm, số lượng và ngày giao dự kiến (KeHoachSanXuat, ChiTietKeHoachSanXuat, DonHang, ChiTietDonHang, MatHang)<br>2. Chọn xưởng, nhập ghi chú; hệ thống ước lượng NVL bằng thuật toán, cộng 10% từng loại và đối chiếu tồn khả dụng để xác định lượng thiếu dự kiến. Chi tiết kế hoạch gồm thành phẩm và NVL, phân biệt bằng LoaiChiTiet. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang, TonKho, ChiTietLo)<br>3. Kiểm tra đơn hàng, xưởng và lượng dự kiến; khi xác nhận, lưu kế hoạch sản xuất và chi tiết để trình duyệt cùng đơn hàng tại UC-31. Không lưu vào kế hoạch mua/bán ở nhánh này. (KeHoachSanXuat, ChiTietKeHoachSanXuat) |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-04-04 — 5.1 Nếu thông tin nhập là số và < 0

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Ngoại lệ / 5.1 Nếu thông tin nhập là số và < 0 |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị số = -1; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 4 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 4 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-04-05 — 5.2 Nếu thông tin nhập là số mà người dùng nhập chữ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Ngoại lệ / 5.2 Nếu thông tin nhập là số mà người dùng nhập chữ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 4 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 4 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-04-06 — 5.3 Kế hoạch sản xuất chưa chọn đơn hàng hoặc xưởng được phân công

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04 / Ngoại lệ / 5.3 Kế hoạch sản xuất chưa chọn đơn hàng hoặc xưởng được phân công |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachSanXuat, DonHang, Xuong)<br>2. Quay lại bước 4 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachSanXuat, DonHang, Xuong)<br>2. Quay lại bước 4 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-05 — Quản lý kế hoạch

- Actor: Bộ phận lập kế hoạch. Tài khoản: planner.
- Tiền điều kiện chung: Bộ phận lập kế hoạch đã đăng nhập và có quyền quản lý kế hoạch.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-05-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý kế hoạch<br>3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan) |
| Kết quả mong đợi | 2. Hiển thị danh sách kế hoạch hiện có (KeHoachMuaBan)<br>4. Hiển thị kế hoạch, chi tiết và báo cáo nguồn theo loại MUA/BAN. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang)<br>Hậu điều kiện: Danh sách kế hoạch mua/bán được hiển thị/tìm kiếm theo yêu cầu |
| Trạng thái | Not Run |

### TC-05-02 — 3.1 Tìm kiếm/lọc kế hoạch

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05 / Thay thế / 3.1 Tìm kiếm/lọc kế hoạch |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên nhập điều kiện tìm kiếm (loại kế hoạch, thời gian, trạng thái) (KeHoachMuaBan)<br>2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan)<br>3. Quay lại bước 1 |
| Kết quả mong đợi | 1. Nhân viên nhập điều kiện tìm kiếm (loại kế hoạch, thời gian, trạng thái) (KeHoachMuaBan)<br>2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan)<br>3. Quay lại bước 1 |
| Trạng thái | Not Run |

### TC-05-03 — 4.1 Chọn Sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05 / Thay thế / 4.1 Chọn Sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-05.1 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-05.1 |
| Trạng thái | Not Run |

### TC-05-04 — 4.2 Chọn Xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05 / Thay thế / 4.2 Chọn Xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-05.2 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-05.2 |
| Trạng thái | Not Run |

### TC-05-05 — 2.1 Không có kế hoạch nào

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05 / Ngoại lệ / 2.1 Không có kế hoạch nào |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-05.1 — Sửa kế hoạch

- Actor: Bộ phận lập kế hoạch. Tài khoản: planner.
- Tiền điều kiện chung: Kế hoạch được chọn chưa được duyệt/thực hiện.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-05-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Sửa (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>3. Nhập thông tin cần chỉnh sửa và xác nhận (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
| Kết quả mong đợi | 2. Hiển thị form với thông tin kế hoạch hiện tại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>4. Kiểm tra thông tin, trạng thái kế hoạch và lượng sửa so với báo cáo nguồn. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)<br>5. Lưu cập nhật vào hệ thống (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>6. Thông báo kế hoạch đã được cập nhật (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>Hậu điều kiện: Thông tin kế hoạch được cập nhật chính xác |
| Trạng thái | Not Run |

### TC-05-1-02 — 1.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.1 / Thay thế / 1.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập, quay lại UC-05 bước 4 |
| Kết quả mong đợi | 1. Nhân viên chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập, quay lại UC-05 bước 4 |
| Trạng thái | Not Run |

### TC-05-1-03 — 4.1 Thông tin nhập không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.1 / Ngoại lệ / 4.1 Thông tin nhập không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-05.2 — Xóa kế hoạch

- Actor: Bộ phận lập kế hoạch. Tài khoản: planner.
- Tiền điều kiện chung: Kế hoạch được chọn chưa được duyệt/thực hiện.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-05-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xóa (KeHoachMuaBan)<br>4. Xác nhận xóa |
| Kết quả mong đợi | 2. Hệ thống kiểm tra kế hoạch được chọn chưa được duyệt/thực hiện (KeHoachMuaBan)<br>3. Hệ thống yêu cầu xác nhận xóa (KeHoachMuaBan)<br>5. Hệ thống xóa kế hoạch khỏi danh sách và thông báo thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan)<br>Hậu điều kiện: Kế hoạch được xóa khỏi danh sách |
| Trạng thái | Not Run |

### TC-05-2-02 — 4.1 Hủy thao tác xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.2 / Thay thế / 4.1 Hủy thao tác xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên chọn Không đồng ý (KeHoachMuaBan)<br>2. Quay lại UC-05 bước 4 |
| Kết quả mong đợi | 1. Nhân viên chọn Không đồng ý (KeHoachMuaBan)<br>2. Quay lại UC-05 bước 4 |
| Trạng thái | Not Run |

### TC-05-2-03 — 2.1 Kế hoạch đã được duyệt/đang thực hiện

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-05.2 / Ngoại lệ / 2.1 Kế hoạch đã được duyệt/đang thực hiện |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-10 — Nhập kho

- Actor: Nhân viên kho. Tài khoản: staff (đối chiếu staff2).
- Tiền điều kiện chung: Nhân viên kho đã đăng nhập; có lô NVL hoặc thành phẩm được QC/AC kết luận đạt, còn lượng chưa nhập kho..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-10-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-10 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Nhập kho<br>3. Chọn dòng lô, nhập vị trí kho/ngày nhập; lượng mặc định là phần đạt QC chưa nhập. Nhập thành phẩm đối chiếu báo cáo và yêu cầu nhập liên quan. (ChiTietLo, Kho, ChiTietPhieuKho, ChiTietKetQuaKiemTraQCAC, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, BanBaoCaoSanXuat)<br>5. Xác nhận nhập kho |
| Kết quả mong đợi | 2. Hiển thị các dòng lô NVL/thành phẩm đạt QC còn chờ nhập. (LoHang, LoNguyenVatLieu, LoThanhPham, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>4. Kiểm tra kho, dòng lô và lượng thực nhập không vượt phần đạt còn chưa nhập. (ChiTietPhieuKho, Kho, ChiTietLo, ChiTietKetQuaKiemTraQCAC)<br>6. Cập nhật tồn kho và tạo phiếu nhập kho (TonKho, PhieuKho, ChiTietPhieuKho)<br>Hậu điều kiện: Hàng hóa được cập nhật vào tồn kho, phiếu nhập kho được tạo |
| Trạng thái | Not Run |

### TC-10-02 — 4.1 Số lượng thực nhập khác với kế hoạch

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-10 / Thay thế / 4.1 Số lượng thực nhập khác với kế hoạch |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống ghi nhận chênh lệch giữa số lượng thực nhập và kế hoạch (ChiTietPhieuKho, ChiTietPhieuYeuCauNhapXuat)<br>2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)<br>3. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống ghi nhận chênh lệch giữa số lượng thực nhập và kế hoạch (ChiTietPhieuKho, ChiTietPhieuYeuCauNhapXuat)<br>2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)<br>3. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-10-03 — 4.1 Thông tin nhập kho không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-10 / Ngoại lệ / 4.1 Thông tin nhập kho không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

## UC-11 — Xuất kho

- Actor: Nhân viên kho. Tài khoản: staff (đối chiếu staff2).
- Tiền điều kiện chung: Nhân viên kho đã đăng nhập hệ thống và có quyền xuất kho.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-11-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xuất kho |
| Kết quả mong đợi | 2. Hiển thị các loại xuất kho gồm: xuất nguyên vật liệu, xuất thành phẩm<br>Hậu điều kiện: Phiếu xuất kho được lập; tồn kho và trạng thái lô được cập nhật |
| Trạng thái | Not Run |

### TC-11-02 — 2.1 Chọn Xuất nguyên vật liệu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11 / Thay thế / 2.1 Chọn Xuất nguyên vật liệu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-11.01 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-11.01 |
| Trạng thái | Not Run |

### TC-11-03 — 2.2 Chọn Xuất thành phẩm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11 / Thay thế / 2.2 Chọn Xuất thành phẩm |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-11.02 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-11.02 |
| Trạng thái | Not Run |

## UC-11.01 — Xuất nguyên vật liệu

- Actor: Nhân viên kho. Tài khoản: staff (đối chiếu staff2).
- Tiền điều kiện chung: Nhân viên kho đã đăng nhập và chọn Xuất NVL (UC-11); có yêu cầu xuất từ báo cáo SAN_XUAT của xưởng, đang Chờ xử lý và đủ điều kiện xuất..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-11-01-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.01 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xuất nguyên vật liệu<br>3. Chọn phiếu yêu cầu<br>5. Xác nhận xuất kho |
| Kết quả mong đợi | 2. Hiển thị yêu cầu xuất NVL Chờ xử lý, chưa xuất hết và đủ điều kiện thực hiện. (PhieuYeuCauNhapXuat)<br>4. Lấy yêu cầu và báo cáo SAN_XUAT nguồn; đối chiếu lượng cần cấp, tự phân bổ lô khả dụng theo mặt hàng và lượng yêu cầu, hiển thị phiếu xuất dự thảo. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, LoNguyenVatLieu, ChiTietLo, TonKho, Kho)<br>6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoNguyenVatLieu)<br>7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho)<br>8. Cập nhật trạng thái lô và phiếu yêu cầu (LoNguyenVatLieu, PhieuYeuCauNhapXuat)<br>9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho<br>Hậu điều kiện: Phiếu xuất kho nguyên vật liệu được lập; tồn kho và trạng thái lô được cập nhật |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-11-01-02 — 4.1 Phiếu yêu cầu không thực hiện được trên thực tế (lô hỏng, thiếu hàng…)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.01 / Thay thế / 4.1 Phiếu yêu cầu không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đề nghị xuất 60; tồn khả dụng chỉ 50 hoặc lô bị cách ly sau khi mở form. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chọn Báo phiếu yêu cầu không thực hiện được và nêu lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống ghi nhận đề xuất, chuyển phiếu yêu cầu sang “Chờ duyệt lại” và kết thúc UC (BanDeXuatXuLyNgoaiLe, PhieuYeuCauNhapXuat) |
| Kết quả mong đợi | 1. Chọn Báo phiếu yêu cầu không thực hiện được và nêu lý do (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống ghi nhận đề xuất, chuyển phiếu yêu cầu sang “Chờ duyệt lại” và kết thúc UC (BanDeXuatXuLyNgoaiLe, PhieuYeuCauNhapXuat) |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-11-01-03 — 6.1 Tồn kho không đủ hoặc lô không còn khả dụng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.01 / Ngoại lệ / 6.1 Tồn kho không đủ hoặc lô không còn khả dụng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đề nghị xuất 60; tồn khả dụng chỉ 50 hoặc lô bị cách ly sau khi mở form. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoNguyenVatLieu)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoNguyenVatLieu)<br>2. Quay lại bước 2 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-11.02 — Xuất thành phẩm

- Actor: Nhân viên kho. Tài khoản: staff (đối chiếu staff2).
- Tiền điều kiện chung: Nhân viên kho đã đăng nhập và chọn Xuất thành phẩm (UC-11); đơn hàng và kế hoạch BAN liên quan đã được duyệt, có thành phẩm đạt QC và tồn khả dụng..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-11-02-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.02 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Xuất thành phẩm<br>3. Chọn đơn hàng và kế hoạch BAN để xuất giao.<br>5. Xác nhận xuất kho |
| Kết quả mong đợi | 2. Hiển thị đơn hàng và kế hoạch BAN đã duyệt còn lượng chờ giao. (DonHang, KeHoachMuaBan)<br>4. Lấy chi tiết đơn, kế hoạch BAN và báo cáo thành phẩm nguồn; phân bổ lô đạt chất lượng còn khả dụng, hiển thị phiếu xuất dự thảo. (DonHang, ChiTietDonHang, KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, LoThanhPham, ChiTietLo, TonKho, Kho)<br>6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoThanhPham)<br>7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho)<br>8. Cập nhật trạng thái lô, lượng đã giao của đơn và lượng đã thực hiện của kế hoạch BAN. (LoThanhPham, DonHang, KeHoachMuaBan)<br>9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho<br>Hậu điều kiện: Phiếu xuất kho thành phẩm được lập; tồn kho, trạng thái lô và đơn hàng được cập nhật |
| Trạng thái | Not Run |

### TC-11-02-02 — 4.1 Nhu cầu xuất không thực hiện được trên thực tế (lô hỏng, thiếu hàng…)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.02 / Thay thế / 4.1 Nhu cầu xuất không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đề nghị xuất 60; tồn khả dụng chỉ 50 hoặc lô bị cách ly sau khi mở form. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chọn Báo không thể xuất giao và nhập lý do. (BanDeXuatXuLyNgoaiLe)<br>2. Ghi nhận đề xuất, tạm dừng phần giao hàng chưa thực hiện và kết thúc UC. (BanDeXuatXuLyNgoaiLe, DonHang, KeHoachMuaBan) |
| Kết quả mong đợi | 1. Chọn Báo không thể xuất giao và nhập lý do. (BanDeXuatXuLyNgoaiLe)<br>2. Ghi nhận đề xuất, tạm dừng phần giao hàng chưa thực hiện và kết thúc UC. (BanDeXuatXuLyNgoaiLe, DonHang, KeHoachMuaBan) |
| Trạng thái | Not Run |

### TC-11-02-03 — 6.1 Tồn kho không đủ hoặc lô không còn khả dụng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.02 / Ngoại lệ / 6.1 Tồn kho không đủ hoặc lô không còn khả dụng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đề nghị xuất 60; tồn khả dụng chỉ 50 hoặc lô bị cách ly sau khi mở form. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 6.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoThanhPham)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoThanhPham)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

## UC-35 — Báo cáo thành phẩm

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Chủ xưởng đã đăng nhập hệ thống và lô thành phẩm đã hoàn thành sản xuất.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-35-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-35 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Báo cáo thành phẩm<br>3. Nhập lượng thành phẩm thực tế, lượng NVL đã sử dụng, ngày hoàn thành và ghi chú; phân bổ theo lô nếu có. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, ChiTietLo)<br>5. Xác nhận gửi báo cáo |
| Kết quả mong đợi | 2. Hiển thị kế hoạch sản xuất, xưởng và dữ liệu xuất NVL thực tế liên quan. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, PhieuKho, ChiTietPhieuKho, ChiTietLo)<br>4. Kiểm tra thông tin và tổng lượng phân bổ theo lô. (ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat)<br>6. Lưu báo cáo loại THANH_PHAM, liên kết kế hoạch và xưởng; lưu chi tiết và phân bổ lô nếu có, gửi cho Ban giám đốc và làm nguồn lập kế hoạch bán. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat)<br>Hậu điều kiện: Báo cáo thành phẩm thực tế được lưu, liên kết kế hoạch sản xuất và xưởng; làm nguồn lập kế hoạch bán. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat) |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-35-02 — 5.1 Hủy trước khi xác nhận gửi báo cáo

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-35 / Thay thế / 5.1 Hủy trước khi xác nhận gửi báo cáo |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thông tin báo cáo đã nhập<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Chủ xưởng chọn Hủy<br>2. Hệ thống hủy thông tin báo cáo đã nhập<br>3. Kết thúc use case |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-35-03 — 4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-35 / Ngoại lệ / 4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại<br>2. Quay lại bước 3 |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## UC-01 — Đăng nhập

- Actor: Người dùng. Tài khoản: từng tài khoản trong DEMO_ACCOUNTS.md.
- Tiền điều kiện chung: Người dùng đã được cấp tài khoản trong hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-01-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-01 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Truy cập màn hình đăng nhập<br>3. Nhập tên đăng nhập, mật khẩu và chọn Đăng nhập (NguoiDung)<br>5. Xem kết quả đăng nhập |
| Kết quả mong đợi | 2. Hiển thị form đăng nhập gồm tên đăng nhập và mật khẩu (NguoiDung)<br>4. Kiểm tra thông tin đăng nhập (NguoiDung)<br>6. Hiển thị màn hình chính theo quyền của người dùng (NguoiDung, VaiTro)<br>Hậu điều kiện: Người dùng đăng nhập thành công và truy cập được các chức năng theo quyền hạn được cấp |
| Trạng thái | Not Run |

### TC-01-02 — 3.1 Sai tên đăng nhập hoặc mật khẩu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-01 / Thay thế / 3.1 Sai tên đăng nhập hoặc mật khẩu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tên đăng nhập hoặc mật khẩu không đúng (NguoiDung)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo tên đăng nhập hoặc mật khẩu không đúng (NguoiDung)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-01-03 — 3.2 Bỏ trống thông tin đăng nhập

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-01 / Thay thế / 3.2 Bỏ trống thông tin đăng nhập |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)<br>2. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)<br>2. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-01-04 — 4.1 Tài khoản bị khóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-01 / Ngoại lệ / 4.1 Tài khoản bị khóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tài khoản thử nghiệm có trạng thái bị khóa; mật khẩu đúng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo tài khoản đã bị khóa, hướng dẫn liên hệ quản trị viên (NguoiDung)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo tài khoản đã bị khóa, hướng dẫn liên hệ quản trị viên (NguoiDung)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-12 — Quản lý kết quả kiểm tra QC/AC

- Actor: Bộ phận QC/AC. Tài khoản: qc.
- Tiền điều kiện chung: Bộ phận QC/AC đã đăng nhập.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-12-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý kết quả kiểm tra chất lượng<br>3. Chọn một kết quả để xem chi tiết (KetQuaKiemTraQCAC) |
| Kết quả mong đợi | 2. Hiển thị danh sách kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC)<br>4. Hiển thị chi tiết kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, MatHang, LoHang)<br>Hậu điều kiện: Danh sách kết quả kiểm tra chất lượng được hiển thị/tìm kiếm theo yêu cầu |
| Trạng thái | Not Run |

### TC-12-02 — 1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Thay thế / 1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên nhập điều kiện lọc (KetQuaKiemTraQCAC, PhieuKho)<br>2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC)<br>3. Quay lại bước 1 |
| Kết quả mong đợi | 1. Nhân viên nhập điều kiện lọc (KetQuaKiemTraQCAC, PhieuKho)<br>2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC)<br>3. Quay lại bước 1 |
| Trạng thái | Not Run |

### TC-12-03 — 2.1 Chọn Thêm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Thay thế / 2.1 Chọn Thêm |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-12.1 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-12.1 |
| Trạng thái | Not Run |

### TC-12-04 — 4.1 Chọn Sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Thay thế / 4.1 Chọn Sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-12.2 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-12.2 |
| Trạng thái | Not Run |

### TC-12-05 — 4.2 Chọn Xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Thay thế / 4.2 Chọn Xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-12.3 |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-12.3 |
| Trạng thái | Not Run |

### TC-12-06 — 4.3 Kết quả ghi nhận "không đạt"

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Thay thế / 4.3 Kết quả ghi nhận "không đạt" |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi |
| Kết quả mong đợi | 1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi |
| Trạng thái | Not Run |

### TC-12-07 — 1.1 Không có kết quả phù hợp

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12 / Ngoại lệ / 1.1 Không có kết quả phù hợp |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-12.1 — Thêm kết quả kiểm tra QC/AC

- Actor: Bộ phận QC/AC. Tài khoản: qc.
- Tiền điều kiện chung: Có lô và chi tiết lô NVL hoặc thành phẩm cần kiểm tra chất lượng trước khi nhập kho..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-12-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Thêm kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>3. Nhập lượng kiểm tra, lượng đạt, lượng lỗi và ghi chú của từng dòng lô; xác nhận. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| Kết quả mong đợi | 2. Hiển thị form và các dòng lô cần kiểm tra. (KetQuaKiemTraQCAC, LoHang, ChiTietLo, MatHang)<br>4. Kiểm tra lượng đạt + lượng lỗi bằng lượng kiểm tra; lưu kết quả. Chuyển phần đạt sang UC-10 để nhập kho; phần NVL lỗi xử lý trả NCC ngay, phần TP lỗi xử lý ngoại lệ khi cần. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietLo)<br>Hậu điều kiện: Kết quả kiểm tra chất lượng mới được lưu vào hệ thống |
| Trạng thái | Not Run |

### TC-12-1-02 — 3.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.1 / Thay thế / 3.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thông tin đã nhập<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-12-1-03 — 3.1 Thông tin nhập không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.1 / Ngoại lệ / 3.1 Thông tin nhập không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-12-1-04 — 3.2 Thông tin nhập bị bỏ trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.1 / Ngoại lệ / 3.2 Thông tin nhập bị bỏ trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-12.2 — Sửa kết quả kiểm tra QC/AC

- Actor: Bộ phận QC/AC. Tài khoản: qc.
- Tiền điều kiện chung: Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-12-2-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.2 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn một kết quả và chọn Sửa (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>3. Chỉnh sửa thông tin và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| Kết quả mong đợi | 2. Hệ thống hiển thị form với thông tin hiện tại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>4. Hệ thống kiểm tra và cập nhật kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>Hậu điều kiện: Kết quả kiểm tra chất lượng được cập nhật chính xác |
| Trạng thái | Not Run |

### TC-12-2-02 — 3.1 Hủy trước khi xác nhận

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.2 / Thay thế / 3.1 Hủy trước khi xác nhận |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thông tin đã chỉnh sửa<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-12-2-03 — 3.1 Thông tin nhập không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.2 / Ngoại lệ / 3.1 Thông tin nhập không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-12-2-04 — 3.2 Thông tin nhập bị bỏ trống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.2 / Ngoại lệ / 3.2 Thông tin nhập bị bỏ trống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-12.3 — Xóa kết quả kiểm tra QC/AC

- Actor: Bộ phận QC/AC. Tài khoản: qc.
- Tiền điều kiện chung: Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-12-3-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.3 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn một kết quả và chọn Xóa (KetQuaKiemTraQCAC)<br>4. Xác nhận xóa |
| Kết quả mong đợi | 2. Hệ thống kiểm tra kết quả đã được sử dụng làm căn cứ xử lý hay chưa (KetQuaKiemTraQCAC, BanDeXuatXuLyNgoaiLe)<br>3. Hệ thống yêu cầu xác nhận xóa (KetQuaKiemTraQCAC)<br>5. Hệ thống xóa kết quả khỏi danh sách (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)<br>Hậu điều kiện: Kết quả kiểm tra bị xóa khỏi danh sách |
| Trạng thái | Not Run |

### TC-12-3-02 — 4.1 Hủy khi được yêu cầu xác nhận xóa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.3 / Thay thế / 4.1 Hủy khi được yêu cầu xác nhận xóa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Bộ phận QC/AC chọn Hủy<br>2. Hệ thống hủy thao tác xóa<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-12-3-03 — 2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.3 / Ngoại lệ / 2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không thể xóa (KetQuaKiemTraQCAC)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không thể xóa (KetQuaKiemTraQCAC)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-34 — Lập phiếu báo cáo sản xuất

- Actor: Chủ xưởng. Tài khoản: workshop.
- Tiền điều kiện chung: Chủ xưởng đã đăng nhập; có kế hoạch sản xuất đã được phê duyệt, được phân công cho xưởng và tiến độ sản xuất chưa đạt 100%..
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-34-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Lập phiếu báo cáo sản xuất.<br>3. Chọn kế hoạch sản xuất cần báo cáo.<br>6. Nhập tiến độ sản xuất hiện tại.<br>7. Nhập mô tả tình hình sản xuất, vấn đề phát sinh hoặc nội dung cần báo cáo.<br>11. Chọn gửi thêm đến Bộ phận lập kế hoạch nếu cần.<br>12. Xác nhận gửi báo cáo. |
| Kết quả mong đợi | 2. Hiển thị form báo cáo sản xuất.<br>4. Hiển thị thông tin kế hoạch, xưởng và lượng NVL ước lượng cần dùng. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang)<br>5. Hiển thị lượng NVL hiện có khả dụng của xưởng. (TonKho, ChiTietLo)<br>8. Đối chiếu lượng NVL hiện có khả dụng với lượng NVL ước lượng cần dùng.<br>9. Tính lượng còn thiếu của từng NVL và xác định trạng thái “Đủ” hoặc “Không đủ”.<br>10. Hiển thị nội dung báo cáo và người nhận mặc định là Ban giám đốc.<br>13. Kiểm tra thông tin báo cáo, tiến độ và quyền đối với kế hoạch, xưởng.<br>14. Lưu báo cáo với LoaiBaoCao=SAN_XUAT, gồm thời gian lập, tiến độ, mô tả và trạng thái NVL; tham chiếu kế hoạch sản xuất và xưởng. (BanBaoCaoSanXuat)<br>15. Lưu các dòng NVL hiện có, NVL ước lượng cần dùng và NVL còn thiếu. (ChiTietBaoCaoSanXuat)<br>16. Gửi báo cáo đến Ban giám đốc.<br>17. Gửi thêm đến Bộ phận lập kế hoạch nếu chủ xưởng đã chọn ở bước 11.<br>18. Hiển thị thông báo “Gửi báo cáo thành công”.<br>19. Kết thúc use case.<br>Hậu điều kiện: Báo cáo loại SAN_XUAT được lưu, liên kết kế hoạch sản xuất và xưởng. Báo cáo mặc định gửi đến Ban giám đốc; chỉ gửi thêm đến Bộ phận lập kế hoạch khi chủ xưởng chủ động lựa chọn. Hủy hoặc thông tin không hợp lệ thì không lưu và không gửi báo cáo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat) |
| Trạng thái | Not Run |

### TC-34-02 — 12.1 Hủy trước khi gửi báo cáo

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34 / Thay thế / 12.1 Hủy trước khi gửi báo cáo |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 12.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Chủ xưởng chọn Hủy trước khi xác nhận gửi.<br>2. Hệ thống hủy dữ liệu đang nhập, không lưu và không gửi báo cáo.<br>3. Đi đến bước 19 của luồng cơ bản. |
| Kết quả mong đợi | 1. Chủ xưởng chọn Hủy trước khi xác nhận gửi.<br>2. Hệ thống hủy dữ liệu đang nhập, không lưu và không gửi báo cáo.<br>3. Đi đến bước 19 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-34-03 — 13.1 Thông tin báo cáo chưa đầy đủ hoặc không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34 / Ngoại lệ / 13.1 Thông tin báo cáo chưa đầy đủ hoặc không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lần lượt bỏ trống từng trường bắt buộc; thử chuỗi chỉ có khoảng trắng. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 13.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị thông báo về thông tin cần bổ sung hoặc chỉnh sửa; không lưu và không gửi báo cáo.<br>2. Quay lại bước 6 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị thông báo về thông tin cần bổ sung hoặc chỉnh sửa; không lưu và không gửi báo cáo.<br>2. Quay lại bước 6 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-34-04 — 13.2 Kế hoạch không hợp lệ hoặc không thuộc xưởng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34 / Ngoại lệ / 13.2 Kế hoạch không hợp lệ hoặc không thuộc xưởng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 13.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị thông báo “Kế hoạch sản xuất không hợp lệ hoặc không thuộc xưởng”; không lưu và không gửi báo cáo.<br>2. Quay lại bước 3 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị thông báo “Kế hoạch sản xuất không hợp lệ hoặc không thuộc xưởng”; không lưu và không gửi báo cáo.<br>2. Quay lại bước 3 của luồng cơ bản. |
| Trạng thái | Not Run |

### TC-34-05 — 13.3 Tiến độ sản xuất không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34 / Ngoại lệ / 13.3 Tiến độ sản xuất không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 13.3.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống hiển thị thông báo “Tiến độ báo cáo sản xuất phải từ 0% đến dưới 100%”; không lưu và không gửi báo cáo.<br>2. Quay lại bước 6 của luồng cơ bản. |
| Kết quả mong đợi | 1. Hệ thống hiển thị thông báo “Tiến độ báo cáo sản xuất phải từ 0% đến dưới 100%”; không lưu và không gửi báo cáo.<br>2. Quay lại bước 6 của luồng cơ bản. |
| Trạng thái | Not Run |

## UC-15 — Thực hiện kiểm kê

- Actor: Ban kiểm kê. Tài khoản: stocktaker.
- Tiền điều kiện chung: Ban kiểm kê đã được phân công cho đợt kiểm kê.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-15-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-15 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Thực hiện kiểm kê<br>3. Nhập số lượng thực tế đếm được cho từng mặt hàng (PhieuKiemKe, ChiTietPhieuKiemKe)<br>5. Xác nhận hoàn thành kiểm kê khu vực (PhieuKiemKe) |
| Kết quả mong đợi | 2. Hiển thị danh sách mặt hàng cần kiểm kê thuộc khu vực được phân công (CongViec, PhieuKiemKe, ChiTietPhieuKiemKe, MatHang, Kho)<br>4. Ghi nhận số liệu kiểm kê (PhieuKiemKe, ChiTietPhieuKiemKe)<br>6. Cập nhật trạng thái hoàn thành và lưu kết quả kiểm kê (PhieuKiemKe, ChiTietPhieuKiemKe)<br>Hậu điều kiện: Số lượng thực tế của hàng hóa được ghi nhận cho đợt kiểm kê |
| Trạng thái | Not Run |

### TC-15-02 — 2.1 Tạm dừng kiểm kê

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-15 / Thay thế / 2.1 Tạm dừng kiểm kê |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên chọn Lưu tạm để tiếp tục sau (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Hệ thống lưu tạm số liệu đã nhập (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Nhân viên chọn Lưu tạm để tiếp tục sau (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Hệ thống lưu tạm số liệu đã nhập (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-15-03 — 2.1 Mất kết nối trong khi nhập số liệu

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-15 / Ngoại lệ / 2.1 Mất kết nối trong khi nhập số liệu |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Giá trị trường số = abc; các trường còn lại hợp lệ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi kết nối và giữ lại số liệu đã nhập cục bộ (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Nhân viên thử lại khi có kết nối (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Quay lại bước 2 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi kết nối và giữ lại số liệu đã nhập cục bộ (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Nhân viên thử lại khi có kết nối (PhieuKiemKe, ChiTietPhieuKiemKe)<br>3. Quay lại bước 2 |
| Trạng thái | Not Run |

## UC-28 — Lập biên bản kiểm kê

- Actor: Ban kiểm kê, bộ phận QC/AC. Tài khoản: Ban kiểm kê, bộ phận QC/AC (đối chiếu DEMO_ACCOUNTS.md).
- Tiền điều kiện chung: Đợt kiểm kê đã hoàn thành.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-28-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-28 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Lập biên bản kiểm kê<br>3. Nhập nội dung biên bản (nhận xét, xác nhận) và xác nhận lập biên bản (PhieuKiemKe) |
| Kết quả mong đợi | 2. Hiển thị số liệu tổng hợp của đợt kiểm kê (số liệu thực tế, số liệu hệ thống, chênh lệch) (PhieuKiemKe, ChiTietPhieuKiemKe)<br>4. Lưu kết luận, nhận xét và trạng thái biên bản trên phiếu kiểm kê; gửi cho Quản lý kho. (PhieuKiemKe)<br>Hậu điều kiện: Biên bản kiểm kê được lập và gửi cho Quản lý kho |
| Trạng thái | Not Run |

### TC-28-02 — 3.1 Lưu tạm biên bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-28 / Thay thế / 3.1 Lưu tạm biên bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nhân viên chọn Lưu tạm (PhieuKiemKe)<br>2. Lưu tạm nội dung biên bản trên phiếu kiểm kê. (PhieuKiemKe)<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Nhân viên chọn Lưu tạm (PhieuKiemKe)<br>2. Lưu tạm nội dung biên bản trên phiếu kiểm kê. (PhieuKiemKe)<br>3. Kết thúc use case |
| Trạng thái | Not Run |

### TC-28-03 — 2.1 Đợt kiểm kê chưa hoàn thành

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-28 / Ngoại lệ / 2.1 Đợt kiểm kê chưa hoàn thành |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo còn khu vực chưa kiểm kê xong, chưa thể lập biên bản (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo còn khu vực chưa kiểm kê xong, chưa thể lập biên bản (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

## UC-32 — Phê duyệt kế hoạch mua/bán

- Actor: Ban giám đốc. Tài khoản: director.
- Tiền điều kiện chung: Ban giám đốc đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-32-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-32 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Phê duyệt kế hoạch mua/bán<br>3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan)<br>5. Chọn Phê duyệt (KeHoachMuaBan) |
| Kết quả mong đợi | 2. Hiển thị danh sách kế hoạch đang chờ phê duyệt (KeHoachMuaBan)<br>4. Hiển thị kế hoạch, chi tiết và báo cáo nguồn: MUA đối chiếu báo cáo SAN_XUAT; BAN đối chiếu báo cáo THANH_PHAM và tồn khả dụng. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, TonKho, ChiTietLo)<br>6. Cập nhật kế hoạch thành Đã duyệt: MUA cho phép lập đơn mua; BAN cho phép triển khai xuất bán. Việc nhập kho chỉ thực hiện sau nhận hàng và QC đạt. (KeHoachMuaBan)<br>Hậu điều kiện: Kế hoạch được phê duyệt hoặc từ chối và trạng thái kế hoạch được cập nhật |
| Trạng thái | Not Run |

### TC-32-02 — 5.1 Từ chối kế hoạch và có nhập lý do

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-32 / Thay thế / 5.1 Từ chối kế hoạch và có nhập lý do |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Từ chối và nhập lý do (KeHoachMuaBan)<br>2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (KeHoachMuaBan)<br>3. Kết thúc UC |
| Kết quả mong đợi | 1. Ban giám đốc chọn Từ chối và nhập lý do (KeHoachMuaBan)<br>2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (KeHoachMuaBan)<br>3. Kết thúc UC |
| Trạng thái | Not Run |

### TC-32-03 — 5.2 Từ chối kế hoạch và không nhập lý do

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-32 / Thay thế / 5.2 Từ chối kế hoạch và không nhập lý do |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Ban giám đốc chọn Từ chối và không nhập lý do (KeHoachMuaBan)<br>2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KeHoachMuaBan)<br>3. Quay lại bước 4 |
| Kết quả mong đợi | 1. Ban giám đốc chọn Từ chối và không nhập lý do (KeHoachMuaBan)<br>2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KeHoachMuaBan)<br>3. Quay lại bước 4 |
| Trạng thái | Not Run |

### TC-32-04 — 4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-32 / Ngoại lệ / 4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có kế hoạch đang chờ phê duyệt (KeHoachMuaBan)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo không có kế hoạch đang chờ phê duyệt (KeHoachMuaBan)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

### TC-32-05 — 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-32 / Ngoại lệ / 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác) |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Mở cùng chứng từ ở hai phiên; phiên A xử lý trước, phiên B giữ màn hình cũ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo kế hoạch không còn hiệu lực để phê duyệt (KeHoachMuaBan)<br>2. Quay lại bước 1 |
| Kết quả mong đợi | 1. Hệ thống thông báo kế hoạch không còn hiệu lực để phê duyệt (KeHoachMuaBan)<br>2. Quay lại bước 1 |
| Trạng thái | Not Run |

## UC-02 — Đặt đơn hàng

- Actor: Khách hàng. Tài khoản: customer (đối chiếu customer2).
- Tiền điều kiện chung: Khách hàng đã đăng nhập hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-02-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-02 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Đặt đơn hàng<br>3. Chọn sản phẩm, nhập số lượng, thông tin giao hàng gồm: địa chỉ, ngày nhận hàng trễ nhất, ghi chú (MatHang, ChiTietDonHang, DonHang, KhachHang)<br>4. Xác nhận đặt hàng |
| Kết quả mong đợi | 2. Hiển thị danh sách hàng mẫu để lựa chọn (MatHang, LoaiHang)<br>5. Kiểm tra thông tin đơn hàng (DonHang, ChiTietDonHang)<br>6. Lưu đơn hàng và thông báo đặt hàng thành công (DonHang, ChiTietDonHang, KhachHang)<br>Hậu điều kiện: Đơn hàng mới được tạo và lưu vào hệ thống với trạng thái “Chờ tiếp nhận” |
| Trạng thái | Not Run |

### TC-02-02 — 4.1 Khách hàng chọn Quay lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-02 / Thay thế / 4.1 Khách hàng chọn Quay lại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quay lại bước 2 |
| Kết quả mong đợi | 1. Quay lại bước 2 |
| Trạng thái | Not Run |

### TC-02-03 — 2.1 Danh sách hàng mẫu không có

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-02 / Ngoại lệ / 2.1 Danh sách hàng mẫu không có |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tạo phạm vi không có bản ghi hoặc dùng mã TEST-NOT-FOUND; không xóa dữ liệu thật. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo danh sách hàng mẫu đang rỗng (MatHang)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo danh sách hàng mẫu đang rỗng (MatHang)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

### TC-02-04 — 5.1 Thông tin đơn hàng không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-02 / Ngoại lệ / 5.1 Thông tin đơn hàng không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

### TC-02-05 — 5.2 Thông tin ngày nhận là ngày trong quá khứ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-02 / Ngoại lệ / 5.2 Thông tin ngày nhận là ngày trong quá khứ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Ngày nhận = D-1, D là ngày chạy kiểm thử theo Asia/Bangkok. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-03 — Quản lý đơn hàng khách hàng

- Actor: Khách hàng. Tài khoản: customer (đối chiếu customer2).
- Tiền điều kiện chung: Khách hàng đã đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-03-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Quản lý đơn hàng<br>3. Chọn một đơn hàng để xem chi tiết (DonHang) |
| Kết quả mong đợi | 2. Hiển thị danh sách đơn hàng hiện có của khách hàng (DonHang, KhachHang)<br>4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang)<br>Hậu điều kiện: Danh sách đơn hàng của khách hàng được hiển thị đúng thông tin và có thể thực hiện các chức năng mở rộng |
| Trạng thái | Not Run |

### TC-03-02 — 1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03 / Thay thế / 1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Từ ngày = D+2, đến ngày = D+1; thêm ngày không tồn tại 31/02. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Khách hàng nhập điều kiện tìm kiếm (DonHang)<br>2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang)<br>3. Quay lại bước 1 |
| Kết quả mong đợi | 1. Khách hàng nhập điều kiện tìm kiếm (DonHang)<br>2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang)<br>3. Quay lại bước 1 |
| Trạng thái | Not Run |

### TC-03-03 — 4.1 Chọn Sửa đơn hàng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03 / Thay thế / 4.1 Chọn Sửa đơn hàng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thực hiện UC-03.1 Sửa đơn hàng khách hàng |
| Kết quả mong đợi | 1. Hệ thống thực hiện UC-03.1 Sửa đơn hàng khách hàng |
| Trạng thái | Not Run |

### TC-03-04 — 2.1 Không có đơn hàng nào trong hệ thống

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03 / Ngoại lệ / 2.1 Không có đơn hàng nào trong hệ thống |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có đơn hàng nào (DonHang)<br>2. Kết thúc UC |
| Kết quả mong đợi | 1. Hệ thống thông báo không có đơn hàng nào (DonHang)<br>2. Kết thúc UC |
| Trạng thái | Not Run |

## UC-03.1 — Sửa đơn hàng khách hàng

- Actor: Khách hàng. Tài khoản: customer (đối chiếu customer2).
- Tiền điều kiện chung: Khách hàng đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-03-1-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn Sửa đơn hàng (DonHang)<br>3. Nhập thông tin muốn chỉnh sửa (số lượng, mô tả) (DonHang, ChiTietDonHang)<br>4. Chọn xác nhận |
| Kết quả mong đợi | 2. Hiển thị form với thông tin hiện tại của đơn hàng (DonHang, ChiTietDonHang)<br>5. Kiểm tra thông tin mới (DonHang, ChiTietDonHang)<br>6. Cập nhật đơn hàng lên hệ thống với trạng thái chờ phê duyệt (DonHang, ChiTietDonHang)<br>7. Thông báo đơn hàng đã được cập nhật và cần chờ phê duyệt (DonHang, ChiTietDonHang)<br>Hậu điều kiện: Thông tin đơn hàng khách hàng được cập nhật chính xác trong hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-31 Phê duyệt kế hoạch sản xuất) |
| Trạng thái | Not Run |

### TC-03-1-02 — 2.1 Khách hàng chọn Quay lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Thay thế / 2.1 Khách hàng chọn Quay lại |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Đi đến bước 4 của UC-03 (hủy thao tác sửa) |
| Kết quả mong đợi | 1. Đi đến bước 4 của UC-03 (hủy thao tác sửa) |
| Trạng thái | Not Run |

### TC-03-1-03 — 5.1 Nếu khách hàng tăng số lượng đơn hàng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Thay thế / 5.1 Nếu khách hàng tăng số lượng đơn hàng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đơn chưa duyệt, đổi số lượng bánh từ 100 lên 120. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo thời gian nhận hàng dự kiến có thể tăng tùy theo quy mô đơn hàng (DonHang)<br>2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)<br>3. Đi đến bước 6 |
| Kết quả mong đợi | 1. Hệ thống thông báo thời gian nhận hàng dự kiến có thể tăng tùy theo quy mô đơn hàng (DonHang)<br>2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)<br>3. Đi đến bước 6 |
| Trạng thái | Not Run |

### TC-03-1-04 — 5.2 Nếu khách hàng giảm số lượng đơn hàng

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Thay thế / 5.2 Nếu khách hàng giảm số lượng đơn hàng |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Đơn chưa duyệt, đổi số lượng bánh từ 100 xuống 80. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.2.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo việc giảm số lượng đơn hàng có thể phải chịu đền bù đặt cọc dựa vào hợp đồng (DonHang, ChiTietDonHang)<br>2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)<br>3. Đi đến bước 6 |
| Kết quả mong đợi | 1. Hệ thống thông báo việc giảm số lượng đơn hàng có thể phải chịu đền bù đặt cọc dựa vào hợp đồng (DonHang, ChiTietDonHang)<br>2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)<br>3. Đi đến bước 6 |
| Trạng thái | Not Run |

### TC-03-1-05 — 1.1 Đơn hàng không ở trạng thái cho phép sửa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Ngoại lệ / 1.1 Đơn hàng không ở trạng thái cho phép sửa |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 1.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

### TC-03-1-06 — 5.1 Thông tin nhập không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03.1 / Ngoại lệ / 5.1 Thông tin nhập không hợp lệ |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Lặp riêng với trường bắt buộc rỗng, số = abc, số = -1, tham chiếu không tồn tại; ghi kết quả từng bộ. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-22 — Tra cứu dữ liệu trong kho

- Actor: Quản lý kho, Chủ xưởng. Tài khoản: Quản lý kho, Chủ xưởng (đối chiếu DEMO_ACCOUNTS.md).
- Tiền điều kiện chung: Quản lý kho đăng nhập thành công vào hệ thống.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-22-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-22 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Tra cứu dữ liệu<br>3. Nhập tên (kho, danh mục, nguyên vật liệu, thành phẩm, tồn kho, lô nguyên vật liệu, lô thành phẩm) để tìm kiếm (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>5. Chọn một mục để xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |
| Kết quả mong đợi | 2. Hiển thị danh sách danh mục hàng hóa (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>4. Hiển thị các danh mục/dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>6. Hiển thị thông tin chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>Hậu điều kiện: Người dùng xem được thông tin danh mục/dữ liệu phù hợp với nhu cầu tra cứu |
| Trạng thái | Not Run |

### TC-22-02 — 5.1 Chỉ xem danh sách, không xem chi tiết

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-22 / Thay thế / 5.1 Chỉ xem danh sách, không xem chi tiết |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 5.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Quản lý kho chỉ xem danh sách phù hợp mà không chọn xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Quản lý kho chỉ xem danh sách phù hợp mà không chọn xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>2. Kết thúc use case |
| Trạng thái | Not Run |

### TC-22-03 — 3.1 Không tìm thấy dữ liệu phù hợp

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-22 / Ngoại lệ / 3.1 Không tìm thấy dữ liệu phù hợp |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Tạo phạm vi không có bản ghi hoặc dùng mã TEST-NOT-FOUND; không xóa dữ liệu thật. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 3.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>2. Quay lại bước 3 |
| Kết quả mong đợi | 1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)<br>2. Quay lại bước 3 |
| Trạng thái | Not Run |

## UC-16 — Xử lý chênh lệch kiểm kê

- Actor: Quản lý kho. Tài khoản: manager.
- Tiền điều kiện chung: Quản lý kho đăng nhập thành công vào hệ thống và đợt kiểm kê đã hoàn thành.
- Với ca ngoại lệ, thay đúng điều kiện đang kiểm thử; giữ các điều kiện khác hợp lệ.

### TC-16-01 — Luồng cơ bản

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-16 / Luồng cơ bản |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | 1. Chọn chức năng Xử lý chênh lệch kiểm kê<br>3. Chọn mặt hàng (ChiTietPhieuKiemKe, MatHang)<br>5. Nhập đề xuất xử lý (PhieuKiemKe, ChiTietPhieuKiemKe)<br>4. Xác nhận xử lý chênh lệch (ChiTietPhieuKiemKe) |
| Kết quả mong đợi | 2. Hiển thị danh sách mặt hàng có chênh lệch sau kiểm kê (ChiTietPhieuKiemKe, MatHang)<br>4. Hiển thị thông tin chi tiết mặt hàng gồm: loại hàng, số lượng, bị vấn đề gì (ChiTietPhieuKiemKe, MatHang, LoaiHang, LoHang)<br>6. Cập nhật tồn kho theo phương án xử lý và lưu kết quả (TonKho, ChiTietPhieuKiemKe)<br>Hậu điều kiện: Chênh lệch kiểm kê được ghi nhận nguyên nhân và phương án xử lý |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-16-02 — 4.1 Chênh lệch vượt hạn mức xử lý

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-16 / Thay thế / 4.1 Chênh lệch vượt hạn mức xử lý |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 4.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Nếu quản lý cảm thấy mức độ chênh lệch và độ nghiêm trọng cao có thể gửi đề xuất xử lý cho Chủ xưởng (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống chuyển đề xuất xử lý sang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)<br>3. Kết thúc use case |
| Kết quả mong đợi | 1. Nếu quản lý cảm thấy mức độ chênh lệch và độ nghiêm trọng cao có thể gửi đề xuất xử lý cho Chủ xưởng (BanDeXuatXuLyNgoaiLe)<br>2. Hệ thống chuyển đề xuất xử lý sang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)<br>3. Kết thúc use case |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

### TC-16-03 — 2.1 Không có chênh lệch cần xử lý

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-16 / Ngoại lệ / 2.1 Không có chênh lệch cần xử lý |
| Ưu tiên | P1 |
| Dữ liệu / điều kiện riêng | Dùng bộ dữ liệu TEST ở mục 2; đưa chứng từ vào đúng trạng thái mô tả trong tên ca và tiền điều kiện UC. |
| Thao tác | Thực hiện các bước luồng cơ bản đến điểm rẽ nhánh 2.1.<br>Thiết lập điều kiện riêng ở trên.<br>1. Hệ thống thông báo không có mặt hàng chênh lệch (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Kết thúc use case |
| Kết quả mong đợi | 1. Hệ thống thông báo không có mặt hàng chênh lệch (PhieuKiemKe, ChiTietPhieuKiemKe)<br>2. Kết thúc use case |
| Trạng thái | Blocked — cần thống nhất yêu cầu tại mục 3 |

## 6. Ca bổ sung về biên, quyền và tính toàn vẹn

### TC-BS-01 — Nhập TP từng phần cùng lô

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | KHSX đã duyệt; đợt 1 hoàn thành 40 bánh, đợt 2 hoàn thành 60 bánh. |
| Thao tác | workshop nhập tay hai yêu cầu cho cùng đợt sản xuất/mã lô; kiểm tra chi tiết. |
| Kết quả mong đợi | Hai yêu cầu cùng lô sản xuất; lượng mới 40 và 60, không cộng lại thành 140; tạo yêu cầu chưa tăng tồn. |
| Trạng thái | Not Run |

### TC-BS-02 — Nhập NVL theo phần QC đạt

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23, UC-10; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Thực nhận 100 kg; QC đạt 90, lỗi/trả NCC 10; đã nhập 30. |
| Thao tác | Import kế hoạch MUA và đúng lô; đề nghị 60 rồi thử 60.001. |
| Kết quả mong đợi | Phần tối đa còn nhập 60 kg; chặn 60.001; không trừ lỗi hai lần nếu phần đạt đã loại lỗi. |
| Trạng thái | Not Run |

### TC-BS-03 — Xuất TP đúng ngày và hoàn tất

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23, UC-11.02; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | BAN đã duyệt; TP đã nhập đạt QC; KHSX chưa hoàn tất hoặc ngày giao D+1. |
| Thao tác | Thử tạo yêu cầu hôm nay; hoàn tất KHSX rồi đến ngày giao thử lại. |
| Kết quả mong đợi | Chặn khi chưa hoàn tất hoặc chưa đến ngày giao; cho phép khi đủ cả hai. Nguồn BAN/KHSX và báo cáo còn mâu thuẫn: mục 3. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

### TC-BS-04 — Xuất NVL theo nhu cầu KHSX

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Nhu cầu KHSX 110 kg gồm dự phòng; đã cấp 30, yêu cầu hiệu lực 20. |
| Thao tác | Import KHSX; đề nghị 60, sau đó thử thêm 0.001. |
| Kết quả mong đợi | Còn được đề nghị 60 kg; không dùng lượng thiếu; không cộng 10% lần nữa; chặn vượt cam kết. |
| Trạng thái | Not Run |

### TC-BS-05 — Sửa yêu cầu không tự tính trùng chính nó

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23, UC-24.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Nhu cầu 100; yêu cầu đang sửa 40; yêu cầu khác 20; đã cấp 10. |
| Thao tác | Sửa 40 thành 70 rồi thử 70.001. |
| Kết quả mong đợi | Cho 70, chặn 70.001; không tính yêu cầu cũ 40 thêm lần nữa. |
| Trạng thái | Not Run |

### TC-BS-06 — Hai phiên cùng yêu cầu phần còn lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Nhu cầu còn 60; hai phiên cùng đề nghị 40. |
| Thao tác | Gửi gần đồng thời; xem lượng cam kết tổng. |
| Kết quả mong đợi | Không để tổng lượng hiệu lực vượt 60; giao dịch thất bại không có header/chi tiết rời. |
| Trạng thái | Not Run |

### TC-BS-07 — Nhập đúng một lần khi gửi lại

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-10; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Lô QC đạt còn nhập 90 kg. |
| Thao tác | staff ghi sổ 90; gửi lại cùng thao tác/khóa idempotency; tải lại. |
| Kết quả mong đợi | Chỉ một phiếu và một biến động; tồn +90, không +180. |
| Trạng thái | Not Run |

### TC-BS-08 — Xuất cạnh tranh không âm tồn

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-11.01, UC-11.02; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Tồn khả dụng 50; hai thao tác xuất 40 cùng lô. |
| Thao tác | Hai staff thực hiện gần đồng thời. |
| Kết quả mong đợi | Tổng xuất không vượt 50; không âm tồn; thao tác bị chặn không để lại phiếu ghi sổ một phần. |
| Trạng thái | Not Run |

### TC-BS-09 — Rollback khi lỗi ghi sổ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-10, UC-11; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Chứng từ nhiều dòng hợp lệ; môi trường test cho phép giả lập lỗi DB giữa giao dịch. |
| Thao tác | Gây lỗi sau ghi header hoặc trước cập nhật tồn rồi xác nhận. |
| Kết quả mong đợi | Toàn bộ phiếu/chi tiết/tồn/trạng thái rollback; không báo thành công giả. |
| Trạng thái | Not Run |

### TC-BS-10 — Phân hoạch QC

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Lô thực nhận 100. |
| Thao tác | Nhập các bộ kiểm/đạt/lỗi: 100/90/10; 100/90/11; 100/0/100; 100/100/0; 101/100/1. |
| Kết quả mong đợi | Chấp nhận bộ tổng đúng và không vượt thực nhận; chặn tổng sai và kiểm quá lô; phần lỗi không vào tồn khả dụng. |
| Trạng thái | Not Run |

### TC-BS-11 — QC đã dùng không phá lịch sử

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-12.2, UC-12.3; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | QC đã làm nguồn phiếu nhập hoặc đề xuất ngoại lệ. |
| Thao tác | Thử sửa số đạt hoặc xóa bằng UI và API. |
| Kết quả mong đợi | Không phá chứng từ/tồn đã ghi; chính sách sửa bằng chứng từ bù cần thống nhất với đặc tả: mục 3. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

### TC-BS-12 — Biên tiến độ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | KHSX đã duyệt thuộc xưởng, còn đang sản xuất. |
| Thao tác | Gửi riêng tiến độ 0; 99.999; 100; -0.001 và abc. |
| Kết quả mong đợi | 0 đến dưới 100 được chấp nhận nếu các trường khác đúng; 100/âm/chữ bị chặn, không lưu/gửi. Độ chính xác thập phân cần xác nhận. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

### TC-BS-13 — Báo sự cố chỉ gửi BGĐ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Tiến độ 40; mô tả Máy đóng gói bị hỏng; không chọn planner. |
| Thao tác | Gửi báo cáo; đăng nhập director và planner kiểm tra. |
| Kết quả mong đợi | director nhận/xem được; planner không nhận và không đọc nội dung qua URL/API khi không được gửi. |
| Trạng thái | Not Run |

### TC-BS-14 — Báo thiếu gửi thêm planner

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Cần 110 kg, khả dụng 70; tiến độ 20; chọn planner. |
| Thao tác | Gửi rồi xem chi tiết và thông báo ở director/planner. |
| Kết quả mong đợi | Thiếu 40 kg; cả hai nhận báo cáo; dữ liệu tồn lấy từ hệ thống, không bị thay bằng số giả phía client. |
| Trạng thái | Not Run |

### TC-BS-15 — Đủ NVL không tạo thiếu âm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Cần 110 kg; tồn khả dụng 110 rồi 120. |
| Thao tác | Lập báo cáo với mỗi bộ. |
| Kết quả mong đợi | Thiếu 0, trạng thái Đủ; không sinh nhu cầu mua từ lượng thiếu âm. |
| Trạng thái | Not Run |

### TC-BS-16 — Chưa hoàn tất không báo thành phẩm

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-35; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | KHSX chưa hoàn tất; mới nhận 40/100 bánh. |
| Thao tác | Thử gửi báo cáo thành phẩm rồi hoàn tất thực tế và thử lại. |
| Kết quả mong đợi | Chặn báo cáo kết thúc khi chưa hoàn tất; báo cáo hợp lệ có loại THANH_PHAM và gửi BGĐ. |
| Trạng thái | Not Run |

### TC-BS-17 — Đối chiếu tổng phân bổ lô

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-35; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Thành phẩm thực tế 100; hai dòng lô 40 và 60. |
| Thao tác | Gửi bộ 40+60; thử bộ 40+61. |
| Kết quả mong đợi | Tổng đúng được chấp nhận; tổng lệch bị chặn; báo cáo không tự nhập lại hàng đã nhập từng phần. |
| Trạng thái | Not Run |

### TC-BS-18 — Dự phòng NVL một lần

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | NVL gốc 100 kg. |
| Thao tác | Lập KHSX từ đơn, kiểm tra nhu cầu; import sang yêu cầu xuất. |
| Kết quả mong đợi | KHSX là 110 kg; xuất theo 110, không 121. Quy tắc làm tròn cần đối chiếu quyết định nghiệp vụ. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

### TC-BS-19 — Sai loại và sai báo cáo nguồn

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-04, UC-27; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Kế hoạch MUA nguồn báo cáo A; báo cáo B khác; có báo cáo THANH_PHAM. |
| Thao tác | Thử lập đơn mua với B hoặc loại THANH_PHAM; thử kế hoạch BAN cho mua NVL. |
| Kết quả mong đợi | Chặn tham chiếu không đúng loại/không trùng nguồn; không tạo đơn mua. |
| Trạng thái | Not Run |

### TC-BS-20 — Duyệt KHSX và tự cập nhật đơn đồng bộ

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-31; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Đơn và KHSX liên quan chờ duyệt. |
| Thao tác | director duyệt KHSX theo version kế hoạch; mô phỏng lỗi khi tự cập nhật đơn nguồn trong môi trường test. |
| Kết quả mong đợi | Thành công: cả hai duyệt; lỗi: cả hai giữ trạng thái cũ, không duyệt một nửa. |
| Trạng thái | Not Run |

### TC-BS-21 — Chênh lệch thiếu/đủ/thừa

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-15, UC-28; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Tồn snapshot 100; ba dòng đếm 95,100,105. |
| Thao tác | Lưu số đếm, hoàn thành và lập biên bản. |
| Kết quả mong đợi | Chênh lệch thực tế−hệ thống lần lượt -5,0,+5; lưu số snapshot; chỉ hiện dòng cần xử lý tương ứng. |
| Trạng thái | Not Run |

### TC-BS-22 — Phân công khu vực

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-15; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | stocktaker được giao kho A; không giao kho B. |
| Thao tác | Mở và gửi số đếm kho B bằng URL/API. |
| Kết quả mong đợi | Từ chối đọc/ghi vượt phân công; kho A thực hiện được. |
| Trạng thái | Not Run |

### TC-BS-23 — File xuất khớp bộ lọc

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-18, UC-19, UC-20, UC-21; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Hai kho, phiếu IN và OUT, nhiều ngày; lọc chỉ kho A/ngày D. |
| Thao tác | Xem bảng, xuất file và so từng dòng/tổng. |
| Kết quả mong đợi | File chỉ chứa đúng phạm vi; tiếng Việt/số thập phân đúng; hồ sơ IN không lẫn OUT và ngược lại. Định dạng file chưa quy định. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

### TC-BS-24 — Không truy cập đơn khách khác

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-03, UC-03.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Đơn thuộc customer; đăng nhập customer2. |
| Thao tác | Thử danh sách, URL chi tiết và API sửa bằng ID đơn của customer. |
| Kết quả mong đợi | Không lộ nội dung và không sửa được; đơn gốc giữ nguyên. |
| Trạng thái | Not Run |

### TC-BS-25 — Chưa đăng nhập và sai vai trò

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | Tất cả UC; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Không session; sau đó customer truy cập chức năng quản lý kho. |
| Thao tác | Mở URL trực tiếp và gọi API đọc/ghi; không chỉ kiểm menu. |
| Kết quả mong đợi | Yêu cầu đăng nhập hoặc từ chối quyền; không có biến động CSDL. |
| Trạng thái | Not Run |

### TC-BS-26 — Ảnh danh mục — yêu cầu bổ sung

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-06.1, UC-06.3; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | PNG/JPEG/WebP hợp lệ; tệp giả ảnh, SVG, ảnh >5 MB. |
| Thao tác | manager thêm/sửa/bỏ ảnh; workshop thử upload. |
| Kết quả mong đợi | Ảnh hợp lệ hiển thị và lưu tham chiếu; chặn tệp sai/quá dung lượng và người không có quyền; bỏ ảnh không xóa danh mục. |
| Trạng thái | Not Run |

### TC-BS-27 — Mua NVL thủ công — yêu cầu đã trao đổi

| Trường | Nội dung |
| --- | --- |
| Tham chiếu | UC-27; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ |
| Ưu tiên | P0 |
| Dữ liệu / tiền điều kiện | Không có báo cáo SX; nhà cung cấp và NVL hợp lệ. |
| Thao tác | purchaser chọn nhập thủ công và lập đơn. |
| Kết quả mong đợi | Cho phép theo yêu cầu người dùng trước đây; đặc tả UC-27 hiện chỉ có kế hoạch MUA: Blocked chờ đồng bộ. |
| Trạng thái | Blocked — cần làm rõ yêu cầu |

## 7. Kịch bản tích hợp nên chạy trước

| ID | Chuỗi thao tác | Đối chiếu cuối |
| --- | --- | --- |
| E2E-01 | customer đặt đơn → planner tiếp nhận → lập KHSX → director duyệt đơn/KHSX | Số lượng/khách/xưởng/nguồn đúng, hai trạng thái duyệt đồng bộ |
| E2E-02 | workshop báo thiếu và gửi planner → MUA → director duyệt → purchaser đặt mua → QC → YC nhập → staff nhập | Lượng thiếu/mua/đạt/thực nhập đúng, phần lỗi không vào tồn khả dụng |
| E2E-03 | KHSX → YC xuất NVL → staff cấp → workshop nhập TP từng phần cùng lô → QC → staff nhập → báo cáo hoàn tất | Tồn không trùng; báo cáo kết thúc không tạo nhập lần nữa; nguồn xuất cần Q02 |
| E2E-04 | Lập BAN → duyệt → đến ngày giao và SX hoàn tất → YC xuất → staff giao | Không vượt đơn/BAN/tồn đạt; lượng giao và tồn khớp; nguồn cần Q03 |
| E2E-05 | director lập kiểm kê → stocktaker đếm/lưu tạm/hoàn tất → biên bản → đề xuất → duyệt → thực hiện | Chênh lệch có lịch sử và áp dụng một lần; actor/thời điểm cần Q01 |

## 8. Phiếu ghi nhận kết quả

Sao chép dòng cho từng TC và từng bộ dữ liệu con; đính kèm ảnh hoặc log không chứa session/secret. Ghi rõ dữ liệu trước/sau cho ca thay tồn.

| Mã TC / bộ dữ liệu | Commit / migration | Người chạy / ngày | Kết quả thực tế | Trạng thái | Bằng chứng / mã lỗi |
| --- | --- | --- | --- | --- | --- |
| … | … | … | … | Not Run | … |

Điều kiện kết thúc đợt kiểm thử: mọi ca đã có kết quả hoặc lý do Blocked/N/A; không còn lỗi P0; các điểm Q01–Q10 được quyết định hoặc ghi rõ chưa nghiệm thu. Số lượng ca không tự chứng minh mọi UC đã hoàn chỉnh.

## Bổ sung 30/10/2026 — kho theo xưởng và thứ tự phân công

Các ca dưới đây mô tả kỳ vọng; không mặc định tất cả đã được chạy trong đợt sửa tài liệu.

| Mã | UC | Thiết lập/thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| KQ-01 | UC-22 | Đổi giữa ba xưởng | Mỗi xưởng hiển thị ba kho đúng loại; không nhầm ba loại kho với ba khu |
| KQ-02 | UC-22 | Mở kho NVL, chọn khu A | Có nhãn nhóm hàng, vị trí A01–A10; chọn vị trí xem tồn/giữ chỗ/khả dụng |
| KQ-03 | UC-08 | Nhập cùng NVL có hạn dùng xa hơn hàng đang có | Gợi ý khu đúng nhóm, phía trong; quản lý vẫn chọn nhân viên và xác nhận |
| KQ-04 | UC-08 | Lô nhập có hạn dùng gần hơn hoặc chưa rõ | Gợi ý phía ngoài; không tự chuyển hàng cũ |
| KQ-05 | UC-08 | Chọn vị trí của nhóm hàng khác | Từ chối phân công, không ghi phiếu/tăng tồn |
| KQ-06 | UC-09 | Hai lô có hạn dùng khác nhau, lô nhập sau lại hết hạn sớm hơn | Lô hết hạn sớm đứng trước |
| KQ-07 | UC-09 | Cùng hạn dùng, tạo lô A trước nhưng ghi nhập B trước | B đứng trước A, dùng phiếu nhập thực tế tại kho hiện tại |
| KQ-08 | UC-09 | Cùng hạn dùng và thời điểm nhập | Thứ tự ổn định theo bản ghi; không đổi ngẫu nhiên khi tải lại |
| KQ-09 | UC-09 | Có lô chưa ghi hạn dùng | Xếp sau lô có hạn dùng, hiển thị chưa có hạn dùng; không bỏ qua QC/tồn/nguồn |
| KQ-10 | UC-09 | Cần 10, lô đầu có 4 và lô sau có 6; bấm bổ sung phân bổ | Hai dòng 4 và 6 theo đúng thứ tự; không nhân đôi dòng cũ hoặc tạo lượng 0 |
| KQ-11 | UC-09 | Giao hai phần cho hai nhân viên | Mỗi nhân viên chỉ ghi được phần lô/vị trí/lượng được giao |
| KQ-12 | UC-08/09 | Hủy form, hoặc giải phóng phần chưa thực hiện | Hủy không lưu; giải phóng không sửa phiếu đã ghi sổ |
| KQ-13 | UC-10/11 | Nhân viên ghi một phần, rồi ghi phần còn lại | Cập nhật đúng từng lần, giữ lịch sử; không vượt phân công |
| KQ-14 | UC-09/11 | Lô hết hạn/cách ly, hàng đã giữ chỗ, nguồn sai hoặc kho khóa | Không cấp/ghi lượng không đủ điều kiện; không trừ tồn sai |

Bằng chứng đã chạy ở đợt code trước: 80 kiểm thử đơn vị (có so sánh hạn dùng/thời điểm nhập), bài trình duyệt phân công chia 4+6, bộ MySQL commerce. Bài workshop-storage kiểm tra ba xưởng × ba kho và mười vị trí/khu. Tài liệu này không chứng nhận thêm các ca chưa chạy riêng.
