## Cập nhật nghiệp vụ kho — 14/10/2026

Đã bổ sung xử lý hàng cách ly sau QC: đề xuất, giám đốc duyệt, quản lý giải phóng phần đạt hoặc loại bỏ phần lỗi. Điều chỉnh QC hàng đã nhập đi qua đề xuất cách ly, QC xác nhận và chứng từ bù/biến động tồn; không sửa phiếu nhập/giao cũ hoặc lượng đã giao. Giải phóng hàng điều chỉnh phải tái kiểm đạt. Không tự giao bù/hoàn tiền. Migration service hiện đến 006; chỉ làm nghiệp vụ kho, quản lý nhân viên/bộ phận ngoài phạm vi. Chi tiết API/quyền/quy trình: [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md).
## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

# Đặc tả màn hình theo Word

## UC-34/UC-35 mới nhất

Báo cáo sản xuất: mục đích tiến độ/sự cố/thiếu NVL, mô tả, tiến độ %, người nhận (BGĐ mặc định, thêm planner tùy chọn). Chỉ mục thiếu NVL hiện bảng NVL và lấy dự kiến từ kế hoạch; đổi mục đích xóa các dòng không còn áp dụng. Bảng danh sách hiển thị mục đích và tiến độ. BGĐ có menu đọc báo cáo; planner chỉ thấy báo cáo được chia sẻ.

Báo cáo thành phẩm: chọn kế hoạch, ngày hoàn tất, xác nhận đã hoàn tất toàn bộ, thành phẩm thực tế và NVL sử dụng. Nếu chưa xác nhận thì chưa lập/gửi báo cáo tổng kết. Khi gửi kế hoạch hoàn thành, không còn trong lựa chọn báo cáo tiến độ/sự cố mới.

## Tự điền chứng từ nguồn

Chọn đơn hàng trong kế hoạch SX tự điền thành phẩm còn cần lập; nút từ chi tiết đơn cũng kích hoạt tự điền. Chọn kế hoạch trong báo cáo SX tự điền NVL đã gồm dự phòng. Đơn mua có chế độ thủ công/báo cáo/kế hoạch mua; đổi chế độ xóa dòng nguồn cũ và không gửi các trường nguồn ẩn. Nhận lô NVL chọn đơn mua để lấy lượng chưa nhận.

Yêu cầu nhập/xuất có hai mục xuất rõ ràng: NVL sản xuất và thành phẩm bán. NVL chọn PLAN/REPORT; thành phẩm chọn báo cáo và kế hoạch bán đã duyệt tương ứng, hiển thị QC/tồn khả dụng/kết quả kiểm kê gần nhất. Nhập NVL lấy lượng đạt QC chưa yêu cầu nhập. Các dòng được sửa trước lưu; nguồn hết hạn mức hiển thị thông báo, không tạo dòng giả. Khi đang tải nguồn, khóa nút lưu và bỏ kết quả cũ nếu người dùng đổi lựa chọn.

## Màn hình bổ sung: hàng khách trả

Menu “Hàng khách trả” cho quản lý kho, nhân viên kho, QC và giám đốc. Quản lý chọn dòng giao gốc, số lượng, kho/vị trí nhận, người nhận và lý do. Chi tiết hiển thị nguồn giao, dòng lô nhận và phiếu nhập; nhân viên được giao có nút “Nhận vào khu cách ly”, quản lý lập có nút hủy khi chưa nhận. Form nêu rõ cách ly, không tự giao bù/hoàn tiền. Nhân viên chỉ thấy lô được giao; QC/giám đốc đọc và sử dụng nghiệp vụ QC hiện hữu.

## Cập nhật giao diện đã chạy — 11/10/2026

Express/EJS đã nối các trang công việc, kiểm kê, kết luận và ngoại lệ với MySQL. Form lô nhập nhiều dòng; MUA/BAN chọn báo cáo đúng loại; yêu cầu cấp NVL/nhập thành phẩm chọn báo cáo thực tế. Báo cáo nhu cầu chỉ nhập lượng cần, hệ thống tính tồn. Sửa kế hoạch hiển thị số gốc NVL để tránh cộng dự phòng lần hai.

Quản lý có nút giải phóng phân công, giám đốc duyệt đề xuất, quản lý có nút thực hiện riêng. Bảng đếm phân biệt trống/0; hoàn tất rồi lập/gửi kết luận từng kho, xử lý chênh lệch và đóng đợt. QC có form chứng từ bù và lịch sử, không nút sửa/xóa đè. Form COUNT và MUA/BAN đã kiểm thử trình duyệt; nghiệp vụ xuyên suốt kiểm thử HTTP/MySQL. Phạm vi chưa nghiệm thu toàn bộ màn hình/nhánh: IMPLEMENTATION_PROGRESS.md.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Các màn/route dưới là mục tiêu, không khẳng định hiện có. Chi tiết hình thức và các SUP cũ là đề xuất; quyền và nguồn nghiệp vụ theo Word/BR ưu tiên.

## 1 Mục tiêu thiết kế

Giao diện tiếng Việt, tập trung bảng dữ liệu và form nghiệp vụ, phù hợp desktop để quản lý kho; responsive từ 768px. Tài liệu mô tả màn hình, dữ liệu, thao tác, điều kiện và API, không phải bộ ảnh mockup đã dựng. Mỗi mã UI có thể gồm list/form/detail dùng chung layout; các UC thêm/sửa/xóa được thực hiện qua modal hoặc route form tương ứng.

Đề xuất View render trên server với JavaScript gọi API cùng origin. Route Web trong tài liệu chỉ render màn hình, không tự thay đổi dữ liệu. API tại `API.md` là hợp đồng mutation duy nhất hoặc được web controller gọi cùng service.

## 2 Bố cục và thành phần dùng chung

- Thanh trên: tên hệ thống, tên người dùng, vai trò đang xem, biểu tượng thông báo và menu Đăng xuất.
- Sidebar: chỉ menu có quyền; nhóm Đơn hàng, Kế hoạch, Mua hàng, Dữ liệu kho, Nhập xuất, Chất lượng, Sản xuất, Kiểm kê, Công việc, Phê duyệt, Báo cáo.
- Vùng nội dung: breadcrumb, tiêu đề rõ chức năng, nút chính, bộ lọc, bảng, pagination; form có phần thông tin chung và các bảng chi tiết.
- Detail: thông tin nguồn/trạng thái ở đầu, dòng chi tiết ở giữa, lịch sử tóm tắt và action hợp lệ ở cuối. Không dùng màu làm dấu hiệu trạng thái duy nhất.
- Modal xác nhận: nêu mã đối tượng, hành động và tác động; nút Hủy bên cạnh nút xác nhận có nhãn cụ thể như Tiếp nhận, Ghi phiếu xuất, Hủy yêu cầu.

Định dạng: ngày dd/MM/yyyy; thời gian dd/MM/yyyy HH:mm theo Asia/Ho_Chi_Minh; số lượng theo đơn vị và tối đa 3 chữ số thập phân; tiền VND có phân cách hàng nghìn. Input nội bộ chuẩn hóa thành decimal string với dấu chấm; không gửi chuỗi “1.000,5” trực tiếp cho API. Không làm tròn số tồn âm thầm. Các mã trạng thái dịch theo bảng dưới.

| Mã trạng thái | Nhãn tiếng Việt |
| --- | --- |
| SUBMITTED đơn | Chờ tiếp nhận |
| RECEIVED đơn khách | Đã tiếp nhận, chờ duyệt |
| APPROVED | Đã duyệt |
| REJECTED | Bị từ chối |
| IN_PROGRESS | Đang thực hiện |
| COMPLETED | Hoàn thành |
| PENDING_APPROVAL | Chờ phê duyệt |
| PENDING yêu cầu/đơn mua | Chờ xử lý |
| PARTIALLY_FULFILLED | Đã xử lý một phần |
| FULFILLED | Đã xử lý đủ |
| PARTIALLY_RECEIVED | Đã nhận một phần |
| RECEIVED đơn mua | Đã nhận đủ |
| POSTED | Đã ghi sổ |
| PLANNED | Đã lên lịch |
| COUNTING | Đang kiểm đếm |
| CLOSED | Đã đóng |
| CANCELLED | Đã hủy |
| VOID | Đã hủy kết quả |
| DRAFT | Bản nháp |
| SUBMITTED báo cáo/biên bản | Đã gửi |
| APPLIED | Đã duyệt và áp dụng |
| AVAILABLE | Khả dụng |
| QUARANTINE | Cách ly |
| PASSED / PARTIAL / FAILED QC | Đạt / Đạt một phần / Không đạt |

## 3 Trạng thái tương tác chung

| Tình huống | Cách hiển thị và xử lý |
| --- | --- |
| Đang tải | Loading/skeleton đúng vùng; không hiển thị dữ liệu cũ như dữ liệu mới mà không dấu hiệu |
| Chưa có dữ liệu | Thông báo cụ thể, CTA tạo khi có quyền |
| Bộ lọc không có kết quả | Giữ filter, nút Xóa bộ lọc; không báo lỗi server |
| Đang gửi | Disable nút mutation, spinner, giữ Idempotency-Key cho retry cùng payload |
| Validation 422 | Lỗi cạnh field/dòng; focus lỗi đầu; giữ input; summary ngắn nếu nhiều lỗi |
| Không quyền 403 | Thông báo Không có quyền; ngừng action, không tự thử bằng vai trò khác |
| Hết phiên 401 | Điều hướng login; giữ URL nội bộ; kiểm kê giữ input trong bộ nhớ trước điều hướng nếu an toàn |
| Xung đột 409 | Giải thích dữ liệu đã thay đổi, nút Tải lại; không ghi đè hoặc tự duyệt lại |
| Lỗi mạng | Chưa xác định mutation thành công hay chưa; retry cùng key khi có, tải lại resource để đối chiếu |
| Thành công | Hiện thông báo từ server, cập nhật status/version/actions và list; không chỉ toast mà giữ trạng thái cũ |
| Hủy thao tác | Form quay lại sau xác nhận nếu bẩn; không gọi API mutation |
| Kho đóng băng kiểm kê | Banner ghi rõ đợt đang khóa; nút ghi sổ disabled, server vẫn kiểm lại |

Pagination mặc định 20; table filter/sort server, debounce tìm kiếm đề xuất 300ms. Sort allowlist theo từng module. Khi đổi filter đưa page về 1. Link chi tiết bảo toàn query để quay về đúng danh sách.

## 4 Menu theo vai trò

| Vai trò | Menu chính |
| --- | --- |
| CUSTOMER | Đặt đơn, Đơn hàng của tôi, Thông báo |
| PLANNER | Tiếp nhận đơn, Kế hoạch mua/bán, Kế hoạch sản xuất SUP, Báo cáo nhu cầu, Thông báo |
| PURCHASER | Mua hàng, Đơn mua, Thông báo |
| WAREHOUSE_MANAGER | Danh mục, Dữ liệu kho, Tra cứu, Phiếu nhập/xuất, Chênh lệch kiểm kê, Đề xuất hàng lỗi SUP |
| WAREHOUSE_STAFF | Nhập kho, Xuất kho, Yêu cầu cần xử lý, Phiếu kho |
| QC_INSPECTOR | Kết quả QC/AC, Đề xuất hàng lỗi SUP |
| STOCKTAKER | Đợt được giao, Thực hiện kiểm kê, Biên bản theo kho |
| WORKSHOP_OWNER | Yêu cầu nhập/xuất, Báo cáo sản xuất, Báo cáo thành phẩm, Hồ sơ nhập/xuất |
| DIRECTOR | Duyệt đơn, Duyệt kế hoạch, Duyệt ngoại lệ, Lập đợt, Công việc, Báo cáo tồn/phiếu/kiểm kê |

Ẩn menu chỉ giúp tương tác; bảo vệ thực sự nằm ở server. Người có nhiều vai trò nhận union chức năng nhưng từng record vẫn xét scope.

## 5 Danh mục màn hình

| Mã | Màn hình | Vai trò | UC |
| --- | --- | --- | --- |
| UI-01 | Đăng nhập | PUBLIC | UC-01 |
| UI-02 | Đặt đơn và sửa đơn khách hàng | CUSTOMER | UC-02, UC-03.1 |
| UI-03 | Đơn hàng của tôi | CUSTOMER | UC-03, UC-03.1 |
| UI-04 | Tiếp nhận đơn hàng | PLANNER | UC-29 |
| UI-05 | Phê duyệt đơn hàng | DIRECTOR | UC-31 |
| UI-06 | Kế hoạch mua bán | PLANNER | UC-04, UC-05, UC-05.1, UC-05.2 |
| UI-07 | Phê duyệt kế hoạch | DIRECTOR | UC-32 |
| UI-08 | Mua hàng từ kế hoạch | PURCHASER | UC-27 |
| UI-09 | Đơn hàng mua | PURCHASER | UC-14 |
| UI-10 | Danh mục kho | WAREHOUSE_MANAGER | UC-06, UC-06.1, UC-06.2, UC-06.3 |
| UI-11 | Dữ liệu danh mục kho | WAREHOUSE_MANAGER | UC-07, UC-07.1, UC-07.2, UC-07.3 |
| UI-12 | Tra cứu dữ liệu trong kho | WAREHOUSE_MANAGER / WORKSHOP_OWNER | UC-22 |
| UI-13 | Quản lý phiếu nhập xuất | WAREHOUSE_MANAGER / WAREHOUSE_STAFF | UC-08, UC-09 |
| UI-14 | Nhập kho | WAREHOUSE_STAFF | UC-10 |
| UI-15 | Xuất kho | WAREHOUSE_STAFF | UC-11 |
| UI-16 | Lập yêu cầu nhập xuất | WORKSHOP_OWNER | UC-23 |
| UI-17 | Quản lý yêu cầu nhập xuất | WORKSHOP_OWNER | UC-24, UC-24.1, UC-24.2 |
| UI-18 | Quản lý kết quả QC AC | QC_INSPECTOR | UC-12, UC-12.1, UC-12.2, UC-12.3 |
| UI-19 | Lập đợt kiểm kê | DIRECTOR | UC-13 |
| UI-20 | Thực hiện kiểm kê | STOCKTAKER | UC-15 |
| UI-21 | Biên bản kiểm kê theo kho | STOCKTAKER / QC_INSPECTOR | UC-28 |
| UI-22 | Xử lý chênh lệch kiểm kê | WAREHOUSE_MANAGER | UC-16 |
| UI-23 | Phê duyệt xử lý ngoại lệ | DIRECTOR | UC-17 |
| UI-23B | Đề xuất xử lý hàng lỗi | QC_INSPECTOR / WAREHOUSE_MANAGER | SUP-02 |
| UI-24 | Báo cáo tồn kho | DIRECTOR / WORKSHOP_OWNER / WAREHOUSE_MANAGER | UC-18 |
| UI-25 | Hồ sơ nhập xuất kho | DIRECTOR / WORKSHOP_OWNER | UC-19, UC-20 |
| UI-26 | Báo cáo kiểm kê | DIRECTOR | UC-21 |
| UI-27 | Quản lý công việc | DIRECTOR | UC-25, UC-25.1, UC-25.2, SUP-03 |
| UI-28 | Phiếu báo cáo sản xuất | WORKSHOP_OWNER | UC-34 |
| UI-29 | Báo cáo thành phẩm | WORKSHOP_OWNER | UC-35 |
| UI-30 | Kế hoạch sản xuất tối thiểu | PLANNER / DIRECTOR | SUP-01 |
| UI-31 | Trang chính theo vai trò | AUTHENTICATED | SUP-DASHBOARD |
| UI-32 | Thông báo nội bộ | AUTHENTICATED | SUP-NOTIFICATION |

## 6 Đặc tả từng màn hình

### UI-01 Đăng nhập

**Route Web:** `/login`.
**Vai trò:** PUBLIC.
**Truy vết:** UC-01.

Truy cập chương trình theo quyền tài khoản.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| username | Text | Bắt buộc, 1..80 ký tự, autocomplete=username |
| password | Password | Bắt buộc, không trim hoặc hiện giá trị; autocomplete=current-password |

**Bảng và nội dung:** Không có bảng.

**Thao tác:** Đăng nhập; bật/tắt hiển thị mật khẩu. Enter gửi form; nút bị khóa khi đang gửi.

**Luồng và trạng thái:** Sai thông tin hiển thị thông báo chung. Tài khoản khóa hiện hướng dẫn liên hệ. Thành công về /dashboard hoặc URL nội bộ đã được kiểm tra quyền; không redirect URL ngoài.

**API liên quan:** `/api/v1/auth/login`, `/api/v1/auth/me`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-02 Đặt đơn và sửa đơn khách hàng

**Route Web:** `/customer/orders/new; /customer/orders/{id}/edit`.
**Vai trò:** CUSTOMER.
**Truy vết:** UC-02, UC-03.1.

Chọn hàng mẫu, nhập yêu cầu giao và gửi đơn.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| sample_items | Bộ chọn có tìm kiếm | Chỉ FINISHED_PRODUCT, is_sample=true, published và active; không có mẫu thì không mở form đặt |
| lines[].quantity | Decimal | >0, tối đa 3 số thập phân; không trùng mặt hàng |
| delivery_address | Textarea | Bắt buộc <=500, gợi ý từ hồ sơ nhưng snapshot vào đơn |
| latest_delivery_date | Date | Bắt buộc, không trước hôm nay |
| note | Textarea | Không bắt buộc <=5000 |
| quantity_change_acknowledged | Checkbox khi sửa | Bắt buộc nếu tăng/giảm số lượng; cảnh báo thời gian/đặt cọc chưa có công thức |

**Bảng và nội dung:** Ảnh mẫu, mã/tên thành phẩm, đơn vị, số lượng, đơn giá tham khảo chỉ đọc, thành tiền, nút bỏ dòng.

**Thao tác:** Thêm dòng, bỏ dòng, Xác nhận đặt/Lưu sửa, Quay lại. Khi sửa chỉ SUBMITTED/RECEIVED và đúng chủ đơn.

**Luồng và trạng thái:** Bố cục: danh sách mẫu bên trái, giỏ dòng và giao hàng bên phải; màn nhỏ xếp dọc. Giá/tổng là tham khảo đến response server. Khi sửa mở modal xác nhận cảnh báo đổi số lượng. 409 giữ form, yêu cầu tải lại, không tự ghi đè.

**API liên quan:** `/api/v1/sample-items`, `/api/v1/customer-orders`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-03 Đơn hàng của tôi

**Route Web:** `/customer/orders; /customer/orders/{id}`.
**Vai trò:** CUSTOMER.
**Truy vết:** UC-03, UC-03.1.

Theo dõi đơn và mở chi tiết.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| q | Search | Mã đơn, <=150 |
| status | Select | Trạng thái đơn |
| from/to | Date range | Từ không sau đến |

**Bảng và nội dung:** Mã đơn, ngày đặt, hạn giao, số dòng, tổng tham khảo, trạng thái, thao tác. Chi tiết có các dòng hàng, địa chỉ, ghi chú và lịch sử tiếp nhận/duyệt.

**Thao tác:** Xem, Sửa nếu được phép, Đặt đơn mới; không có nút xóa đơn vì UC không yêu cầu.

**Luồng và trạng thái:** Lọc giữ ở URL; đơn REJECTED hiển thị lý do. Danh sách rỗng có nút Đặt đơn; không tìm thấy do lọc có nút Xóa bộ lọc.

**API liên quan:** `/api/v1/customer-orders`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-04 Tiếp nhận đơn hàng

**Route Web:** `/orders/intake`.
**Vai trò:** PLANNER.
**Truy vết:** UC-29.

Phân loại đơn chưa được tiếp nhận và tiếp nhận có kiểm tra trạng thái.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| q | Search | Mã đơn hoặc tên khách |
| status | Select | Mặc định SUBMITTED; tab đã tiếp nhận để đối chiếu |

**Bảng và nội dung:** Mã đơn, khách, ngày đặt, hạn giao, số dòng, trạng thái. Panel chi tiết có hàng, số lượng, địa chỉ và ghi chú.

**Thao tác:** Xem chi tiết; Tiếp nhận khi SUBMITTED; modal xác nhận rồi POST receive với version.

**Luồng và trạng thái:** Bố cục bảng + panel chi tiết. Sau thành công chuyển RECEIVED, bỏ khỏi tab chưa tiếp nhận và thông báo chờ giám đốc duyệt; danh sách rỗng ghi Không có đơn hàng mới.

**API liên quan:** `/api/v1/customer-orders`, `/api/v1/customer-orders/{id}/receive`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-05 Phê duyệt đơn hàng

**Route Web:** `/approvals/orders`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-31.

Duyệt đơn đã tiếp nhận.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| status | Tabs | Mặc định RECEIVED; có lịch sử APPROVED/REJECTED |
| reason | Textarea trong modal từ chối | Bắt buộc 1..2000 |

**Bảng và nội dung:** Mã đơn, khách, ngày tiếp nhận, hạn giao, sản phẩm/số lượng, trạng thái. Chi tiết hiển thị toàn bộ giao hàng và nguồn nhận.

**Thao tác:** Phê duyệt; Từ chối; Xem chi tiết. Chỉ RECEIVED mới có action; mỗi lần duyệt gửi key/version.

**Luồng và trạng thái:** Modal phê duyệt tóm tắt mã/khách/số lượng, không cho sửa dòng trong modal. Hai người duyệt cạnh tranh hiển thị Đơn đã được xử lý khi 409.

**API liên quan:** `/api/v1/customer-orders`, `/api/v1/customer-orders/{id}/review`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-06 Kế hoạch mua bán

**Route Web:** `/plans; /plans/new; /plans/{id}; /plans/{id}/edit`.
**Vai trò:** PLANNER.
**Truy vết:** UC-04, UC-05, UC-05.1, UC-05.2.

[MỤC TIÊU] Chọn loại MUA/BAN và báo cáo nguồn đúng loại. MUA hiển thị cần thực tế, tồn đối chiếu, thiếu, đã phân bổ mua và còn được mua; BAN hiển thị báo cáo thành phẩm, đơn khách, QC, lượng đã nhập/đã bán và khả dụng. Không chọn kế hoạch dự kiến làm nguồn mua, không có nút cộng 10% lại. Nhánh lập kế hoạch sản xuất của UC-04 đi UI-30. Kiểm hạn mức lại trên server lúc lưu/sửa/duyệt.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-07 Phê duyệt kế hoạch

**Route Web:** `/approvals/plans`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-32.

[MỤC TIÊU] Chi tiết duyệt phải hiển thị báo cáo nguồn và loại, các dòng nguồn/đã phân bổ/còn lại. Ban giám đốc duyệt MUA hoặc BAN; không sửa nguồn khi duyệt. Duyệt MUA mở bước mua, BAN mở bước xuất bán; không tự nhập kho.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-08 Mua hàng từ kế hoạch

**Route Web:** `/purchases/new`.
**Vai trò:** PURCHASER.
**Truy vết:** UC-27.

[MỤC TIÊU] Chọn kế hoạch MUA đã duyệt. Hiển thị mã báo cáo SAN_XUAT nguồn chỉ đọc, phần thiếu thực tế, lượng đã mua cộng dồn và còn được mua. Đơn mua lấy cùng báo cáo từ server. Chặn vượt, nguồn khác và kế hoạch chưa duyệt; nhiều đơn/kế hoạch còn D-04.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-09 Đơn hàng mua

**Route Web:** `/purchases; /purchases/{id}`.
**Vai trò:** PURCHASER.
**Truy vết:** UC-14.

[MỤC TIÊU] Hiển thị đơn mua, kế hoạch duyệt, báo cáo SAN_XUAT nguồn, NCC, lượng đặt/nhận và lô/dòng lô liên quan. Nút quản lý theo quyền/trạng thái; không suy thêm UC sửa/xóa đơn mua.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-10 Danh mục kho

**Route Web:** `/catalog/categories`.
**Vai trò:** WAREHOUSE_MANAGER.
**Truy vết:** UC-06, UC-06.1, UC-06.2, UC-06.3.

Quản lý nhóm loại hàng.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| code | Text | 1..40, duy nhất, chỉ sửa khi chưa dùng nếu cho phép |
| name | Text | 1..150, duy nhất |
| description | Textarea | <=5000 |

**Bảng và nội dung:** Mã, tên, mô tả, ngày tạo/cập nhật, số dữ liệu, số chưa xuất bản; số đếm là dữ liệu tổng hợp server.

**Thao tác:** Thêm, Xem, Sửa, Xóa; modal xác nhận xóa. Form chỉ trường text, không thêm kiểm tra số không tồn tại.

**Luồng và trạng thái:** Danh mục đã dùng trả RESOURCE_IN_USE; giữ nguyên bảng. Thêm modal có Nhập lại reset các input; bản gốc dẫn nhầm bước được chuẩn hóa theo form hiện tại [ĐỀ XUẤT].

**API liên quan:** `/api/v1/categories`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-11 Dữ liệu danh mục kho

**Route Web:** `/catalog/data`.
**Vai trò:** WAREHOUSE_MANAGER.
**Truy vết:** UC-07, UC-07.1, UC-07.2, UC-07.3.

Hub dữ liệu theo tab và bộ form riêng từng loại.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| resource | Tabs | Kho, vị trí, NCC, nguyên liệu, thành phẩm, lô |
| category_id | Select | Áp dụng cho mặt hàng |
| q | Search | Tên/mã |
| dynamic_form | Form theo loại | Các trường cụ thể ở bảng dưới, không một form chung tùy ý |

**Bảng và nội dung:** Kho: mã/tên/địa chỉ/active; vị trí: kho/mã/tên; NCC: mã/tên/điện thoại; mặt hàng: mã/tên/danh mục/đơn vị/giá/published; lô: mã/nguồn và các ChiTietLo/mặt hàng/số lượng/QC/hạn dùng.

**Thao tác:** Thêm/Xem/Sửa/Xóa cho từng loại theo quyền; lô từ báo cáo thành phẩm có thể chỉ xem nguồn, không tạo thêm độc lập làm trùng sản lượng.

**Luồng và trạng thái:** Form tự ẩn mã auto, ngày tạo và ngày cập nhật. Mặt hàng khóa đơn vị/kind/mã khi đã dùng; lô khóa nguồn sau QC/chứng từ. Inventory là dữ liệu chỉ đọc, không có sửa số dư trực tiếp.

**API liên quan:** `/api/v1/catalog-data`, `/api/v1/warehouses`, `/api/v1/warehouse-locations`, `/api/v1/suppliers`, `/api/v1/items`, `/api/v1/lots`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-12 Tra cứu dữ liệu trong kho

**Route Web:** `/catalog/search`.
**Vai trò:** WAREHOUSE_MANAGER / WORKSHOP_OWNER.
**Truy vết:** UC-22.

Tìm kho, danh mục, nguyên liệu, thành phẩm, lô và tồn.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| resource | Select | Nhóm dữ liệu |
| q | Search | Tên/mã |
| warehouse_id | Select | Khi tra tồn/lô |
| category_id | Select | Khi tra mặt hàng |

**Bảng và nội dung:** Nhóm, mã, tên, thông tin tóm tắt; tồn có lô/vị trí/chất lượng/số dư; panel chi tiết loại tương ứng.

**Thao tác:** Tìm kiếm, Xóa lọc, Xem chi tiết; chỉ xem danh sách cũng có thể kết thúc.

**Luồng và trạng thái:** Không tìm thấy hiện thông báo và giữ filter. Mỗi record trả resource_type/id để mở đúng màn, tránh dùng ID lô như ID mặt hàng.

**API liên quan:** `/api/v1/catalog-data`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-13 Quản lý phiếu nhập xuất

**Route Web:** `/warehouse/documents; /warehouse/documents/{id}`.
**Vai trò:** WAREHOUSE_MANAGER / WAREHOUSE_STAFF.
**Truy vết:** UC-08, UC-09.

Xem phiếu đã ghi sổ.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| type | Tabs | IN/OUT |
| q | Search | Mã phiếu |
| warehouse_id | Select | Kho |
| from/to | Date range | Thời điểm ghi sổ |

**Bảng và nội dung:** Mã phiếu, loại, kho, yêu cầu nguồn, người ghi, thời điểm, trạng thái; chi tiết mặt hàng/lô/vị trí/bucket/số lượng/lý do lệch.

**Thao tác:** Xem chi tiết; link nguồn theo quyền. Không Sửa/Xóa phiếu POSTED.

**Luồng và trạng thái:** Nhãn tìm phiếu xuất dùng phiếu xuất, khắc phục nhầm phiếu nhập trong nguồn. Phiếu bất biến có thông báo cần xử lý bù nếu phát hiện sai.

**API liên quan:** `/api/v1/stock-documents`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-14 Nhập kho

**Route Web:** `/warehouse/receive`.
**Vai trò:** WAREHOUSE_STAFF.
**Truy vết:** UC-10.

[MỤC TIÊU] Nhân viên kho nhập theo ChiTietLo, nguồn và QC đạt. Bảng riêng lượng đạt, lỗi, đã nhập và đạt còn được nhập; quantity là thực nhập. Lỗi không có tùy chọn nhập AVAILABLE; cách ly/vật lý trả theo quyết định đã chốt. Xác nhận tạo PhieuKho/ChiTietPhieuKho và cập nhật tồn nguyên tử; không buộc QC đã có phiếu nhập.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-15 Xuất kho

**Route Web:** `/warehouse/issue`.
**Vai trò:** WAREHOUSE_STAFF.
**Truy vết:** UC-11.

[MỤC TIÊU] Hai luồng UC-11.01 NVL và UC-11.02 TP. NVL đọc báo cáo SAN_XUAT và phiếu đề nghị, hiển thị nhu cầu thực tế/đã cấp/cam kết/còn được cấp. TP đọc đơn, kế hoạch BAN đã duyệt và báo cáo THANH_PHAM. Chọn dòng lô/vị trí đủ điều kiện; hiển thị đề nghị, giữ chỗ và lượng thực xuất riêng. Preview không tự giữ theo đề xuất D-01; trạng thái giữ/hủy/giải phóng cần hiển thị sau chốt. Không mặc định phiếu yêu cầu bán khi D-06 chưa chốt.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-16 Lập yêu cầu nhập xuất

**Route Web:** `/workshop/requests/new`.
**Vai trò:** WORKSHOP_OWNER.
**Truy vết:** UC-23.

[MỤC TIÊU] UC-23 chọn xuất NVL từ SAN_XUAT hoặc nhập TP từ THANH_PHAM. Mã báo cáo/xưởng và chi tiết nguồn bắt buộc; không dùng kế hoạch dự kiến làm lượng xuất, không dùng phần thiếu làm lượng cần cấp. Bảng lượng thực tế, đã cấp/đã yêu cầu còn hiệu lực, còn được đề nghị. Nhãn Chờ duyệt/Chờ xử lý và actor duyệt còn D-06; không tự chọn một tên là đã chốt.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-17 Quản lý yêu cầu nhập xuất

**Route Web:** `/workshop/requests; /workshop/requests/{id}/edit`.
**Vai trò:** WORKSHOP_OWNER.
**Truy vết:** UC-24, UC-24.1, UC-24.2.

[MỤC TIÊU] Theo dõi báo cáo nguồn, lượng đề nghị, giữ chỗ, thực xuất/nhập, phần còn và lịch sử phiếu. Sửa/hủy phải kiểm nguồn, cam kết và phần đã xử lý; không xóa báo cáo hoặc phiếu đã ghi. Thời điểm giải phóng giữ khi hủy/sửa chưa chốt D-01/D-06.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-18 Quản lý kết quả QC AC

**Route Web:** `/quality/inspections; /quality/inspections/new; /quality/inspections/{id}/edit`.
**Vai trò:** QC_INSPECTOR.
**Truy vết:** UC-12, UC-12.1, UC-12.2, UC-12.3.

[MỤC TIÊU] QC chọn ChiTietLo, mỗi dòng hiển thị mặt hàng/đơn vị/nguồn, lượng kiểm/đạt/lỗi/ghi chú. Tổng đạt+lỗi=kiểm. Sau kết luận chuyển phần đạt UC-10; NVL lỗi trả NCC, TP lỗi/ngoại lệ theo quyết định. Sửa/xóa bị chặn khi đã dùng nhập/xử lý; tái kiểm D-13.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-19 Lập đợt kiểm kê

**Route Web:** `/stocktakes; /stocktakes/new; /stocktakes/{id}`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-13.

Lập phạm vi kho, loại hàng và phân công.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| planned_date | Date | >=hôm nay |
| item_kind | Select | Nguyên liệu/thành phẩm/cả hai |
| warehouses | Multi-select | Ít nhất một kho, không trùng |
| assignee_ids mỗi kho | Multi-select | STOCKTAKER, ít nhất một người |
| start_at/end_at | Datetime | Dự kiến công việc, end>start |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Danh sách đợt: mã/ngày/phạm vi/trạng thái; chi tiết kho/người/count progress/biên bản/chênh lệch.

**Thao tác:** Tạo, Nhập lại, Bắt đầu kiểm kê, Đóng đợt khi đủ điều kiện. Bắt đầu có modal cảnh báo kho bị khóa giao dịch.

**Luồng và trạng thái:** Tạo PLANNED và tasks; chưa khóa kho cho đến start. Nếu kho đã có kiểm kê hoạt động thì chặn start. Close chỉ khi biên bản gửi và chênh lệch xử lý, không dùng complete counts để mở kho.

**API liên quan:** `/api/v1/stocktakes`, `/api/v1/stocktakes/{id}/start`, `/api/v1/stocktakes/{id}/close`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-20 Thực hiện kiểm kê

**Route Web:** `/stocktakes/{id}/count?warehouse_id={id}`.
**Vai trò:** STOCKTAKER.
**Truy vết:** UC-15.

Nhập số thực tế theo kho, mặt hàng, lô và vị trí.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| warehouse_id | Select | Chỉ kho phân công |
| q | Search | Mã hàng/lô |
| actual_quantity từng dòng | Decimal | >=0; trống=null chưa đếm; 0 là hết hàng |
| cause | Textarea ngắn | Ghi chú/chênh lệch |
| line_version | Hidden | Version từng dòng |

**Bảng và nội dung:** Nhóm mặt hàng → lô → vị trí/bucket; đơn vị, số hệ thống snapshot, số thực tế, chênh lệch, trạng thái đã lưu. Header hiển thị đã đếm/tổng dòng.

**Thao tác:** Lưu tạm, Hoàn tất kho, Tiếp tục biên bản; complete bị khóa nếu còn null hoặc có thay đổi chưa lưu.

**Luồng và trạng thái:** Mất mạng giữ input trong bộ nhớ trang, hiện Chưa lưu và cảnh báo không đóng tab. [ĐỀ XUẤT] có thể tải bản nháp JSON thủ công, không tự đồng bộ nền. Khôi phục gửi cùng line version; xung đột tải mới và đối chiếu, không ghi đè. Sau complete form chỉ đọc; cần sửa sau hoàn tất chưa có nghiệp vụ mở lại trong MVP.

**API liên quan:** `/api/v1/stocktakes/{id}/warehouses/{warehouse_id}/lines`, `/api/v1/stocktakes/{id}/warehouses/{warehouse_id}/counts`, `/api/v1/stocktakes/{id}/warehouses/{warehouse_id}/complete`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-21 Biên bản kiểm kê theo kho

**Route Web:** `/stocktake-minutes; /stocktake-minutes/new?stocktake_warehouse_id={id}`.
**Vai trò:** STOCKTAKER / QC_INSPECTOR.
**Truy vết:** UC-28.

[MỤC TIÊU] Actor Ban kiểm kê và Bộ phận QC/AC trong phạm vi phân công. Đọc số đếm hoàn tất; nhập kết luận/nhận xét, lưu tạm hoặc gửi Quản lý kho trên PhieuKiemKe. Không entity biên bản riêng hoặc nhập lại số đếm. Nhiều kho/phiếu và sửa sau gửi còn D-07.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-22 Xử lý chênh lệch kiểm kê

**Route Web:** `/stocktake-differences`.
**Vai trò:** WAREHOUSE_MANAGER.
**Truy vết:** UC-16.

[MỤC TIÊU] Quản lý kho xem chênh lệch, nguyên nhân và phương án. Word cho xử lý trực tiếp hoặc gửi giám đốc khi nghiêm trọng nhưng chưa có hạn mức D-08. Không trình bày mọi chênh lệch bắt buộc giám đốc duyệt là quy tắc đã chốt; không tự cho một ngưỡng.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-23 Phê duyệt xử lý ngoại lệ

**Route Web:** `/approvals/exceptions`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-17.

[MỤC TIÊU] Ban giám đốc xem BanDeXuatXuLyNgoaiLe, nguồn và lịch sử KetQuaXuLyNgoaiLe. Duyệt/từ chối theo version; từ chối có lý do. Hiển thị kết quả duyệt riêng kết quả thực hiện, không báo đã đổi tồn khi chỉ phê duyệt. D-09 chốt gửi lại/áp dụng.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-23B Đề xuất xử lý hàng lỗi

**Route Web:** `/quality/exceptions/new`.
**Vai trò:** QC_INSPECTOR / WAREHOUSE_MANAGER.
**Truy vết:** SUP-02.

[MỤC TIÊU] Lập đề xuất từ dòng QC lỗi trước hoặc sau nhập; nêu rõ hàng đã vào kho chưa, nơi giữ và lượng lỗi chưa xử lý. Không bắt buộc có tồn cách ly cho lỗi chưa nhập. Không tạo movement giảm kho khi gửi đề xuất hoặc xử lý lượng chưa từng nhập. Trả NCC/tái kiểm theo D-13.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-24 Báo cáo tồn kho

**Route Web:** `/reports/inventory`.
**Vai trò:** DIRECTOR / WORKSHOP_OWNER / WAREHOUSE_MANAGER.
**Truy vết:** UC-18.

[MỤC TIÊU] Ban giám đốc, Chủ xưởng, Quản lý kho theo Word. Bảng theo kho/vị trí/ChiTietLo/mặt hàng: tồn vật lý, lượng đạt đủ điều kiện, lượng giữ, khả dụng và mốc đối chiếu; không trộn đơn vị. Phạm vi tồn kho dùng chung D-12, quyền đọc không cấp quyền sửa.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-25 Hồ sơ nhập xuất kho

**Route Web:** `/reports/stock-documents`.
**Vai trò:** DIRECTOR / WORKSHOP_OWNER.
**Truy vết:** UC-19, UC-20.

[MỤC TIÊU] Ban giám đốc/Chủ xưởng đọc hồ sơ tổng hợp PhieuKho/ChiTietPhieuKho, dòng lô và nguồn theo phạm vi. Không nút tạo entity hồ sơ hoặc ghi lại tồn; export cùng bộ lọc/quyền.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-26 Báo cáo kiểm kê

**Route Web:** `/reports/stocktakes`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-21.

[MỤC TIÊU] Báo cáo từ PhieuKiemKe/ChiTietPhieuKiemKe, kết luận trên phiếu và kết quả xử lý ngoại lệ. Null là chưa đếm; 0 là đã đếm hết. Không truy vấn bảng nghiệp vụ biên bản mới.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-27 Quản lý công việc

**Route Web:** `/tasks; /tasks/{id}/edit`.
**Vai trò:** DIRECTOR.
**Truy vết:** UC-25, UC-25.1, UC-25.2, SUP-03.

Điều phối lịch nhân viên và công việc.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| title | Text | 1..200 |
| description | Textarea | <=5000 |
| start_at/end_at | Datetime | End>start |
| priority | Select | LOW/NORMAL/HIGH |
| assignee_ids | Multi-select | Nhân viên phù hợp, kiểm trùng lịch |
| source | Readonly hoặc chọn khi tạo SUP | Đợt kiểm kê/đơn mua nếu liên quan |

**Bảng và nội dung:** Mã/tên, nguồn, bắt đầu/kết thúc, ưu tiên, trạng thái, nhân viên. Chi tiết lịch người được phân công.

**Thao tác:** Xem, Sửa, Hủy PLANNED; chuyển tiến độ SUP-03. Công việc kiểm kê tạo từ UI-19; Tạo việc khác là SUP-03.

**Luồng và trạng thái:** Modal xung đột lịch hiển thị khoảng thời gian và công việc liên quan theo quyền. Đang tiến hành cấm hủy nhưng có thể bổ sung người nếu lịch hợp lệ. Sửa phân công kiểm kê cập nhật cả quyền nhập đếm.

**API liên quan:** `/api/v1/tasks`, `/api/v1/tasks/{id}/progress`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-28 Phiếu báo cáo sản xuất

**Route Web:** `/production/reports; /production/reports/new`.
**Vai trò:** WORKSHOP_OWNER.
**Truy vết:** UC-34.

[MỤC TIÊU] Lập BanBaoCaoSanXuat loại SAN_XUAT từ kế hoạch/xưởng đã phân công. Hiển thị nhu cầu dự kiến đã gồm 10%, nhu cầu thực tế, tồn khả dụng đối chiếu và phần thiếu server tính. Đủ NVL vẫn cho lập/gửi; thiếu 0 không mở mua bổ sung. Không coi số chủ xưởng nhập là tồn hệ thống hoặc cộng 10% lại. Snapshot nguồn và sửa sau gửi D-03.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-29 Báo cáo thành phẩm

**Route Web:** `/production/finished-reports; /production/finished-reports/new`.
**Vai trò:** WORKSHOP_OWNER.
**Truy vết:** UC-35.

[MỤC TIÊU] Lập cùng BanBaoCaoSanXuat loại THANH_PHAM. Chi tiết sản lượng theo mặt hàng, NVL sử dụng và dòng lô khi phân bổ. Báo cáo là nguồn BAN; tạo/khai báo lô không tự QC đạt hoặc tăng tồn. Nhập phần TP đạt qua UC-10. Đối soát tiêu hao/tồn xưởng D-12.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-30 Kế hoạch sản xuất tối thiểu

**Route Web:** `/production/plans; /production/plans/new; /production/plans/{id}`.
**Vai trò:** PLANNER / DIRECTOR.
**Truy vết:** SUP-01.

[MỤC TIÊU] Màn hỗ trợ nhánh lập kế hoạch sản xuất của UC-04. ChiTietKeHoachSanXuat chứa hai loại dòng; thể hiện nhu cầu NVL gốc và sau dự phòng 10% một lần. Không nguồn mua/cấp trực tiếp. Không tạo mã UC mới; duyệt đơn/kế hoạch và trường chưa đủ ở Word cần D-11.

**API:** Xem hợp đồng tương ứng trong [API.md](API.md); các route/field chưa triển khai không được báo thành công. **Trạng thái:** [MODULE_MATRIX.md](MODULE_MATRIX.md).

### UI-31 Trang chính theo vai trò

**Route Web:** `/dashboard`.
**Vai trò:** AUTHENTICATED.
**Truy vết:** SUP-DASHBOARD.

Cung cấp lối vào các chức năng được cấp quyền.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| active_role | Select nếu nhiều vai trò | Chỉ lọc menu, không tự thay quyền session |
| quick_links | Navigation | Theo permission server |

**Bảng và nội dung:** Không cần dashboard số liệu mới trong MVP; danh sách liên kết và thông báo chưa đọc, tránh thêm KPI chưa có API.

**Thao tác:** Mở module, thông báo, đăng xuất.

**Luồng và trạng thái:** Chọn vai trò chỉ đổi cách trình bày; API vẫn xét toàn bộ quyền và scope. Không đưa chứng từ mọi người vào dashboard khách.

**API liên quan:** `/api/v1/auth/me`, `/api/v1/notifications`, `/api/v1/auth/logout`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-32 Thông báo nội bộ

**Route Web:** `/notifications`.
**Vai trò:** AUTHENTICATED.
**Truy vết:** SUP-NOTIFICATION.

Xem thông báo được gửi cho tài khoản.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| unread_only | Checkbox | Lọc chưa đọc |

**Bảng và nội dung:** Tiêu đề, nội dung ngắn, thời gian, đã đọc, đối tượng nguồn.

**Thao tác:** Mở nguồn nếu có quyền hiện tại; Đánh dấu đã đọc; quay lại.

**Luồng và trạng thái:** Nếu quyền nguồn đã thu hồi thì không mở link; vẫn cho đọc thông báo thuộc tài khoản. Không thêm gửi email thật.

**API liên quan:** `/api/v1/notifications`, `/api/v1/notifications/{id}/read`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

## 7 Trường riêng của form dữ liệu danh mục

| Loại dữ liệu UI-11 | Trường bắt buộc | Trường tùy chọn và readonly |
| --- | --- | --- |
| Kho | code, name | address, is_active; ID/ngày server |
| Vị trí | warehouse_id, code, name | is_active; kho cha khóa khi đã dùng |
| Nhà cung cấp | code, name | phone, email, address, tax_code, is_active |
| Nguyên vật liệu | code, name, category_id, unit_id, reference_price | description, is_published, is_active; kind=MATERIAL và is_sample=false do server |
| Thành phẩm | code, name, category_id, unit_id, reference_price | description, is_sample, is_published, is_active; kind=FINISHED_PRODUCT |
| Lô nguyên liệu | Mã lô và các ChiTietLo | Mỗi dòng mặt hàng/lượng/nguồn mua; metadata subtype cần D-05 |
| Lô thành phẩm | Tạo từ UI-29 theo báo cáo | UI-11 xem/sửa metadata trước QC; không cho tạo lô độc lập vượt báo cáo |

Không dùng trường “tên danh mục, mô tả danh mục” để sửa mọi loại dữ liệu. Sửa NCC hiển thị thông tin NCC; sửa lô hiển thị metadata lô. Cột chưa xuất bản đếm items.is_published=false trong category, không áp dụng vô nghĩa cho mọi loại dữ liệu.

## 8 Luồng điều hướng nghiệp vụ

- Đơn: UI-02/03 → UI-04 tiếp nhận → nhánh kế hoạch sản xuất UI-30 → UI-05 duyệt theo D-11.
- Mua: UI-28 SAN_XUAT có thiếu → UI-06 MUA → UI-07 → UI-08/09 → lô/dòng lô UI-11 → QC UI-18 → nhập phần đạt UI-14.
- Sản xuất: UI-28 cả đủ/thiếu → UI-16 đề nghị xuất → UI-15 NVL → UI-29 THANH_PHAM → QC/nhập phần đạt.
- Bán: UI-29 nguồn → UI-06 BAN → UI-07 → UI-15 TP → UI-13/25.
- Kiểm kê: UI-19 → UI-20 → UI-21 lưu kết luận trên phiếu → UI-22/23 xử lý theo hạn mức cần chốt → UI-26.

## 9 Yêu cầu kiểm thử giao diện

Mỗi màn có test loading/empty/error/success; tab và nút khớp quyền và state; field số/ngày lỗi được giữ input; các modal Hủy không mutation; pagination giữ filter. Test bàn phím tab order, label input và focus vào lỗi đầu. Test dữ liệu số 0 khi đếm không bị hiểu trống.

Test ghi sổ bị timeout bằng cách retry cùng key; UI không tạo key mới trong retry của cùng payload. Nếu người dùng đổi payload sau lỗi thì phát key mới và tải lại version trước khi gửi. Test số liệu export cùng bộ lọc và scope màn hình.

## 10 Giới hạn và quyết định còn mở

Màu sắc, font, framework/component library, logo và mockup độ chi tiết cao chưa được chốt. Dùng bộ component nhất quán khi triển khai, không xem tài liệu này là hình thiết kế pixel cuối cùng. Kế hoạch sản xuất, đề xuất hàng lỗi và tạo việc ngoài kiểm kê là SUP cần xác nhận phạm vi; nghiệp vụ tài khoản/quên mật khẩu, upload ảnh và mở lại kiểm kê chưa có UC/route hoàn chỉnh trong MVP.

## 11 Truy vết đủ 48 UC sang màn hình

| UC | Tên | Màn hình cụ thể |
| --- | --- | --- |
| UC-29 | Tiếp nhận đơn hàng | UI-04 |
| UC-06 | Quản lý danh mục kho | UI-10 |
| UC-06.1 | Thêm danh mục kho | UI-10 |
| UC-06.2 | Xóa danh mục kho | UI-10 |
| UC-06.3 | Sửa danh mục kho | UI-10 |
| UC-07 | Quản lý dữ liệu danh mục kho | UI-11 |
| UC-07.1 | Thêm dữ liệu danh mục kho | UI-11 |
| UC-07.2 | Xóa dữ liệu danh mục kho | UI-11 |
| UC-07.3 | Sửa dữ liệu danh mục kho | UI-11 |
| UC-08 | Quản lý nhập kho | UI-13 |
| UC-09 | Quản lý xuất kho | UI-13 |
| UC-13 | Lập đợt kiểm kê | UI-19 |
| UC-17 | Phê duyệt đề xuất xử lý ngoại lệ | UI-23 |
| UC-18 | Xem danh sách hàng tồn kho | UI-24 |
| UC-19 | Xem hồ sơ xuất kho | UI-25 |
| UC-20 | Xem hồ sơ nhập kho | UI-25 |
| UC-21 | Xem báo cáo kiểm kê | UI-26 |
| UC-25 | Quản lý công việc | UI-27 |
| UC-25.1 | Chỉnh sửa công việc | UI-27 |
| UC-25.2 | Xóa công việc | UI-27 |
| UC-31 | Phê duyệt đơn hàng | UI-05 |
| UC-14 | Xem/Quản lý đơn hàng mua | UI-09 |
| UC-23 | Yêu cầu nhập/xuất | UI-16 |
| UC-24 | Quản lý yêu cầu nhập xuất | UI-17 |
| UC-24.1 | Sửa yêu cầu | UI-17 |
| UC-24.2 | Xóa yêu cầu | UI-17 |
| UC-27 | Mua hàng | UI-08 |
| UC-04 | Lập kế hoạch mua/bán | UI-06 |
| UC-05 | Quản lý kế hoạch | UI-06 |
| UC-05.1 | Sửa kế hoạch | UI-06 |
| UC-05.2 | Xóa kế hoạch | UI-06 |
| UC-10 | Nhập kho | UI-14 |
| UC-11 | Xuất kho | UI-15 |
| UC-35 | Báo cáo thành phẩm | UI-29 |
| UC-01 | Đăng nhập | UI-01 |
| UC-12 | Quản lý kết quả kiểm tra QC/AC | UI-18 |
| UC-12.1 | Thêm kết quả kiểm tra QC/AC | UI-18 |
| UC-12.2 | Sửa kết quả kiểm tra QC/AC | UI-18 |
| UC-12.3 | Xóa kết quả kiểm tra QC/AC | UI-18 |
| UC-34 | Lập phiếu báo cáo sản xuất | UI-28 |
| UC-15 | Thực hiện kiểm kê | UI-20 |
| UC-28 | Lập biên bản kiểm kê | UI-21 |
| UC-32 | Phê duyệt kế hoạch mua/bán | UI-07 |
| UC-02 | Đặt đơn hàng | UI-02 |
| UC-03 | Quản lý đơn hàng khách hàng | UI-03 |
| UC-03.1 | Sửa đơn hàng khách hàng | UI-02, UI-03 |
| UC-22 | Tra cứu dữ liệu trong kho | UI-12 |
| UC-16 | Xử lý chênh lệch kiểm kê | UI-22 |
# Giao diện xưởng bánh — cập nhật 11/10/2026

Ứng dụng dùng nhận diện Sweet Bakery cho xưởng bánh ngọt đóng gói: bánh quy bơ, bánh quy chocolate, bánh bông lan vani và bánh bông lan cuộn. Giao diện EJS và JavaScript dùng cùng bảng màu hồng đậm #b82361, đen #201a20 và trắng; nền hồng nhạt, chữ nội dung 14–16 px, nút và trường nhập tối thiểu 42–44 px. Điều hướng tối, thẻ và bảng nền trắng, trạng thái luôn có nhãn chữ. Giữ bố cục responsive, focus bàn phím và hỗ trợ giảm chuyển động.

Migration 020 chuyển tên danh mục mẫu cũ theo mã và tên gốc, không ghi đè tên đã được người dùng chỉnh; giữ ID, đơn vị tính và chứng từ lịch sử. Seed mới dùng tên và giá mẫu ngành bánh. Dữ liệu tồn và giao dịch không được tạo giả bởi bước đổi nhận diện.
