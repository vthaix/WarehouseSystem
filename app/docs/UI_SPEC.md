# Đặc tả giao diện và luồng màn hình hệ thống quản lý kho

**Trạng thái Docker/MySQL:** login, dashboard, danh mục đọc và thông báo đã dùng SQL; màn hình nghiệp vụ pending hiển thị trạng thái chưa hoàn thiện với HTTP 501. Bản demo memory giữ các form nghiệp vụ. Xem [MODULE_MATRIX.md](MODULE_MATRIX.md).

**Phiên bản:** 1.0 — bản thiết kế để triển khai và rà soát.  
**Ngày:** 08/10/2026.  
**Nguồn:** Báo cáo Tuần 6 Warehouse Team có nhận xét của giáo viên, gồm 48 đặc tả UC.  
**Định hướng đã xác nhận:** ứng dụng nguyên khối, mô hình MVC, CSDL MySQL, có giao diện.  
**Công nghệ người dùng đã chọn:** Express MVC + EJS, giao diện render từ server, toàn bộ ứng dụng trong `app/`. MySQL được chuẩn bị cho bước CSDL tiếp theo; bản chạy hiện tại dùng dữ liệu mẫu trong bộ nhớ. Cấu trúc và phạm vi đã triển khai xem [ARCHITECTURE.md](ARCHITECTURE.md) và [IMPLEMENTATION.md](IMPLEMENTATION.md).

Quy ước: **[GỐC]** là nghiệp vụ lấy từ đặc tả; **[ĐỀ XUẤT]** là quyết định bổ sung để có thể xây dựng chương trình; **[CẦN CHỐT]** là điểm chưa đủ thông tin. Các đề xuất được dùng nhất quán trong bốn tài liệu nhưng chưa có nghĩa đã được giáo viên hoặc chủ hệ thống phê duyệt.

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
| UI-12 | Tra cứu dữ liệu trong kho | WAREHOUSE_MANAGER | UC-22 |
| UI-13 | Quản lý phiếu nhập xuất | WAREHOUSE_MANAGER / WAREHOUSE_STAFF | UC-08, UC-09 |
| UI-14 | Nhập kho | WAREHOUSE_STAFF | UC-10 |
| UI-15 | Xuất kho | WAREHOUSE_STAFF | UC-11 |
| UI-16 | Lập yêu cầu nhập xuất | WORKSHOP_OWNER | UC-23 |
| UI-17 | Quản lý yêu cầu nhập xuất | WORKSHOP_OWNER | UC-24, UC-24.1, UC-24.2 |
| UI-18 | Quản lý kết quả QC AC | QC_INSPECTOR | UC-12, UC-12.1, UC-12.2, UC-12.3 |
| UI-19 | Lập đợt kiểm kê | DIRECTOR | UC-13 |
| UI-20 | Thực hiện kiểm kê | STOCKTAKER | UC-15 |
| UI-21 | Biên bản kiểm kê theo kho | STOCKTAKER | UC-28 |
| UI-22 | Xử lý chênh lệch kiểm kê | WAREHOUSE_MANAGER | UC-16 |
| UI-23 | Phê duyệt xử lý ngoại lệ | DIRECTOR | UC-17 |
| UI-23B | Đề xuất xử lý hàng lỗi | QC_INSPECTOR / WAREHOUSE_MANAGER | SUP-02 |
| UI-24 | Báo cáo tồn kho | DIRECTOR | UC-18 |
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

Lập, tìm, sửa hoặc hủy kế hoạch chưa thực hiện.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| type | Select | PURCHASE/SALE; chọn trước dòng |
| supplier_id | Search select | Bắt buộc khi mua; active |
| customer_order_id | Search select | Bắt buộc khi bán; đơn APPROVED/IN_PROGRESS thuộc khách |
| customer_id | Readonly | Lấy từ đơn nguồn khi bán |
| planned_date | Date | Bắt buộc |
| lines[].item_id | Search select | Mua MATERIAL; bán FINISHED_PRODUCT thuộc đơn |
| lines[].quantity | Decimal | >0, không vượt nguồn khi bán |
| lines[].unit_price | Decimal | >=0; snapshot và tính tổng server |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Danh sách: mã, loại, đối tác, ngày dự kiến, tổng, trạng thái. Form: mã/tên hàng, đơn vị, số lượng, đơn giá, thành tiền; bán thêm tồn khả dụng chỉ đọc.

**Thao tác:** Tạo, Xem, Sửa, Xóa/hủy; Nhập lại reset form nháp. Sửa/hủy theo BR-09; modal hủy không dùng chữ xóa vĩnh viễn.

**Luồng và trạng thái:** Loại kế hoạch đổi khi chưa lưu sẽ yêu cầu xác nhận xóa dòng hiện tại. Cảnh báo thiếu tồn khi bán không tự đổi số lượng. Lưu gửi PENDING_APPROVAL; nguồn bị thay đổi trả lỗi tại dòng.

**API liên quan:** `/api/v1/business-plans`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-07 Phê duyệt kế hoạch

**Route Web:** `/approvals/plans`.  
**Vai trò:** DIRECTOR.  
**Truy vết:** UC-32.

Xem nguồn và duyệt kế hoạch mua/bán.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| type | Select | Mua/bán/cả hai |
| status | Tabs | PENDING_APPROVAL mặc định |
| reason | Textarea modal | Bắt buộc khi từ chối |

**Bảng và nội dung:** Mã, loại, đối tác, ngày, tổng, người lập, trạng thái; chi tiết dòng hàng và đơn nguồn.

**Thao tác:** Duyệt; Từ chối; xem nguồn. Không sửa kế hoạch ở màn duyệt.

**Luồng và trạng thái:** Kế hoạch bán hiển thị số đặt, số đã phân bổ và số còn có thể duyệt. Response 409 nguồn vượt không cố gắng duyệt lại tự động.

**API liên quan:** `/api/v1/business-plans`, `/api/v1/business-plans/{id}/review`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-08 Mua hàng từ kế hoạch

**Route Web:** `/purchases/new`.  
**Vai trò:** PURCHASER.  
**Truy vết:** UC-27.

Tạo đơn mua từ kế hoạch mua được duyệt.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| business_plan_id | Search select | Chỉ PURCHASE APPROVED, chưa có đơn mua |
| supplier | Readonly | Nhà cung cấp kế hoạch; không đổi NCC sau duyệt trong MVP |
| expected_delivery_date | Date | >=hôm nay |
| delivery_terms | Textarea | Bắt buộc |
| lines[].unit_price | Decimal | >=0; item và quantity chỉ đọc từ kế hoạch |

**Bảng và nội dung:** Dòng kế hoạch: nguyên liệu, đơn vị, số lượng kế hoạch, đơn giá chốt, thành tiền.

**Thao tác:** Xác nhận mua, Hủy, Xem kế hoạch. Không chọn tùy ý hàng ngoài kế hoạch.

**Luồng và trạng thái:** Chọn kế hoạch tải chi tiết; tạo thành PENDING, chuyển kế hoạch IN_PROGRESS. Chưa có kế hoạch đủ điều kiện thì hiển thị danh sách rỗng, không cho tạo đơn không nguồn.

**API liên quan:** `/api/v1/business-plans`, `/api/v1/purchase-orders`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-09 Đơn hàng mua

**Route Web:** `/purchases; /purchases/{id}`.  
**Vai trò:** PURCHASER.  
**Truy vết:** UC-14.

Xem đơn mua đã đặt và tiến độ nhập.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| q | Search | Mã đơn mua/NCC |
| status | Select | PENDING/PARTIALLY_RECEIVED/RECEIVED/CANCELLED |
| from/to | Date range | Lọc ngày tạo |

**Bảng và nội dung:** Mã đơn mua, kế hoạch, NCC, ngày giao dự kiến, tổng, trạng thái; chi tiết số đặt và đã nhận tích lũy.

**Thao tác:** Xem chi tiết, Mua hàng mới. Không nút sửa/xóa khi chưa có UC tương ứng.

**Luồng và trạng thái:** Nguồn đơn và phiếu nhập hiển thị link theo quyền, không mở link vượt phạm vi. Rỗng ghi Chưa có đơn mua.

**API liên quan:** `/api/v1/purchase-orders`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

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

**Bảng và nội dung:** Kho: mã/tên/địa chỉ/active; vị trí: kho/mã/tên; NCC: mã/tên/điện thoại; mặt hàng: mã/tên/danh mục/đơn vị/giá/published; lô: mã/mặt hàng/nguồn/số lượng/QC/hạn dùng.

**Thao tác:** Thêm/Xem/Sửa/Xóa cho từng loại theo quyền; lô từ báo cáo thành phẩm có thể chỉ xem nguồn, không tạo thêm độc lập làm trùng sản lượng.

**Luồng và trạng thái:** Form tự ẩn mã auto, ngày tạo và ngày cập nhật. Mặt hàng khóa đơn vị/kind/mã khi đã dùng; lô khóa nguồn sau QC/chứng từ. Inventory là dữ liệu chỉ đọc, không có sửa số dư trực tiếp.

**API liên quan:** `/api/v1/catalog-data`, `/api/v1/warehouses`, `/api/v1/warehouse-locations`, `/api/v1/suppliers`, `/api/v1/items`, `/api/v1/lots`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-12 Tra cứu dữ liệu trong kho

**Route Web:** `/catalog/search`.  
**Vai trò:** WAREHOUSE_MANAGER.  
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

Ghi phiếu nhận nguyên liệu hoặc thành phẩm từ yêu cầu hợp lệ.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| stock_request_id | Search select | Type IN, PENDING/PARTIALLY_FULFILLED |
| lot_id | Select theo dòng | Đúng nguồn, QC hiện hành, quantity còn được nhập |
| location_id | Select | Vị trí thuộc kho yêu cầu |
| quality_bucket | Select giới hạn | AVAILABLE cho số đạt; QUARANTINE cho số lỗi thực nhận |
| quantity | Decimal | >0 và không vượt QC/source còn lại |
| difference_reason | Textarea | Bắt buộc khi phân bổ khác số dự kiến |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Mặt hàng, lô, số yêu cầu còn lại, QC đạt/lỗi, số đã nhập theo bucket, vị trí, số thực nhập. Ngày ghi sổ do server, không backdate.

**Thao tác:** Tải phân bổ, thêm/bỏ phân bổ, Xác nhận nhập, Hủy. Modal xác nhận tổng theo bucket trước POST.

**Luồng và trạng thái:** Mặc định quantity theo QC đạt còn lại và yêu cầu, không mặc định toàn lô. Kho đang kiểm kê hiện trạng thái khóa; vẫn kiểm lại server. Thành công mở chi tiết phiếu mới, không còn form có thể bấm lại.

**API liên quan:** `/api/v1/stock-requests`, `/api/v1/stock-requests/{id}/allocations`, `/api/v1/stock-documents`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-15 Xuất kho

**Route Web:** `/warehouse/issue`.  
**Vai trò:** WAREHOUSE_STAFF.  
**Truy vết:** UC-11.

Xuất nguyên liệu sản xuất hoặc thành phẩm bán từ nguồn hợp lệ.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| stock_request_id | Search select | OUT và chưa hoàn tất |
| purpose | Readonly | PRODUCTION_ISSUE/SALE_ISSUE từ nguồn |
| lot_id/location_id | Select phân bổ | Server gợi ý lô AVAILABLE còn hạn, đúng mặt hàng/kho |
| quantity | Decimal | >0, không quá tồn và remaining |
| difference_reason | Textarea | Bắt buộc khi lệch dự kiến |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Chứng từ nguồn, hàng/đơn vị, số yêu cầu còn, lô/hạn dùng/vị trí, tồn khả dụng hiện tại, lượng phân bổ.

**Thao tác:** Chọn nguồn, phân bổ lô, Xác nhận xuất, Hủy; không nhập tên hàng ngoài nguồn.

**Luồng và trạng thái:** Preview không giữ tồn. Hiện cảnh báo tồn có thể đổi; 409 yêu cầu tải lại. Gợi ý ưu tiên hạn dùng sớm [ĐỀ XUẤT], chưa tự cam kết FEFO bắt buộc. Không xuất QUARANTINE.

**API liên quan:** `/api/v1/stock-requests`, `/api/v1/stock-requests/{id}/allocations`, `/api/v1/stock-documents`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-16 Lập yêu cầu nhập xuất

**Route Web:** `/workshop/requests/new`.  
**Vai trò:** WORKSHOP_OWNER.  
**Truy vết:** UC-23.

Tạo yêu cầu từ đơn mua, kế hoạch bán hoặc kế hoạch sản xuất.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| purpose | Select | Bốn mục đích SRS |
| source | Search select | Đơn mua/kế hoạch bán/kế hoạch sản xuất đủ điều kiện và phạm vi |
| workshop_id | Select | Xưởng được giao; một xưởng thì tự chọn |
| warehouse_id | Select | Kho active |
| requested_date | Date | Bắt buộc |
| lines[].quantity | Decimal | >0, không quá nguồn remaining |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Mặt hàng từ nguồn, đơn vị, số nguồn, số đã yêu cầu/đã thực hiện, số còn và số xin xử lý.

**Thao tác:** Gửi yêu cầu, Hủy; mặt hàng chỉ chọn từ nguồn, không cho dòng tùy ý.

**Luồng và trạng thái:** Đổi purpose/source khi đã nhập hỏi xác nhận reset dòng. Khi gửi lưu PENDING, nhãn Chờ xử lý. Không có nguồn thì báo rõ phải có chứng từ hợp lệ.

**API liên quan:** `/api/v1/stock-requests`, `/api/v1/lookup/{resource}`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-17 Quản lý yêu cầu nhập xuất

**Route Web:** `/workshop/requests; /workshop/requests/{id}/edit`.  
**Vai trò:** WORKSHOP_OWNER.  
**Truy vết:** UC-24, UC-24.1, UC-24.2.

Theo dõi và sửa/hủy yêu cầu chưa xử lý.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| q/status/from/to | Filters | Theo mã, trạng thái, thời gian |
| edit_fields | Form | Ngày, kho, ghi chú, số lượng; không đổi purpose/source |
| version | Hidden | Version từ server, không cho nhập thủ công |

**Bảng và nội dung:** Mã, mục đích, kho, nguồn, ngày, trạng thái; chi tiết fulfilled/remaining và phiếu đã thực hiện.

**Thao tác:** Xem; Sửa/Hủy chỉ PENDING chưa phiếu; modal xác nhận Hủy yêu cầu giữ lịch sử.

**Luồng và trạng thái:** Chỉ yêu cầu xưởng được giao. Tìm không có kết quả khác danh sách chưa từng có; hủy gửi thông báo nội bộ cho kho, không xóa các phiếu liên quan.

**API liên quan:** `/api/v1/stock-requests`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-18 Quản lý kết quả QC AC

**Route Web:** `/quality/inspections; /quality/inspections/new; /quality/inspections/{id}/edit`.  
**Vai trò:** QC_INSPECTOR.  
**Truy vết:** UC-12, UC-12.1, UC-12.2, UC-12.3.

Ghi chất lượng theo từng lô và quản lý kết quả.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| lot_id | Search select | Lô chờ kiểm, nguồn đã hoàn thành/tiếp nhận |
| inspected_quantity | Readonly | received_quantity của lô trong MVP |
| passed_quantity | Decimal | >=0 |
| failed_quantity | Decimal | >=0; tổng bằng số kiểm |
| issue | Textarea | Bắt buộc nếu lỗi>0 |
| inspected_at | Datetime | Bắt buộc, có múi giờ |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Mã phiếu, ngày, người kiểm, mã lô/hàng, số đạt/lỗi, trạng thái; lọc thời gian, kết quả và nguồn.

**Thao tác:** Thêm, Xem, Sửa/Hủy chưa dùng; Tạo đề xuất xử lý hàng lỗi qua UI-23B [SUP-02].

**Luồng và trạng thái:** Form nhiều lô, không trùng. Tổng số bằng nhau hiển thị tức thời nhưng server kiểm lại. Không bắt phải có phiếu nhập trước QC. Phiếu đã dùng chỉ đọc, hiển thị lý do khóa.

**API liên quan:** `/api/v1/qc-inspections`, `/api/v1/lookup/lots`, `/api/v1/exception-proposals`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

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
**Vai trò:** STOCKTAKER.  
**Truy vết:** UC-28.

Tổng hợp số đếm đã hoàn thành, ghi nhận xét và gửi.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| stocktake_warehouse_id | Select | Kho đã COMPLETED và được phân công |
| remarks | Textarea | Bắt buộc 1..5000 khi lưu/gửi |

**Bảng và nội dung:** Mặt hàng/lô/vị trí/bucket, snapshot, thực tế, chênh lệch; tổng số dòng/chênh lệch. Không cộng số lượng của các đơn vị khác nhau thành một tổng vô nghĩa.

**Thao tác:** Lưu nháp, Gửi cho giám đốc, Quay lại kiểm kê chỉ đọc, Xem biên bản. Không nhập số đếm lần hai.

**Luồng và trạng thái:** Sau UI-20 dẫn thẳng theo kho, đáp ứng nhận xét của cô. Một biên bản/kho; đã SUBMITTED chỉ xem. Chưa hoàn tất kho báo lỗi và link về kiểm kê.

**API liên quan:** `/api/v1/stocktake-minutes`, `/api/v1/stocktake-minutes/{id}/submit`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-22 Xử lý chênh lệch kiểm kê

**Route Web:** `/stocktake-differences`.  
**Vai trò:** WAREHOUSE_MANAGER.  
**Truy vết:** UC-16.

Xem nguồn chênh lệch và lập phương án trình duyệt.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| stocktake_id/warehouse_id | Select filter | Đợt đã đếm xong |
| source_line | Readonly | Lô/vị trí/bucket và số snapshot/actual |
| quantity | Readonly | abs(actual-system) |
| reason | Textarea | Bắt buộc |
| resolution_note | Textarea | Bắt buộc, phương án |

**Bảng và nội dung:** Đợt/kho, hàng/lô, số hệ thống, số thực tế, chênh lệch có dấu, tình trạng xử lý, đề xuất hiện hành.

**Thao tác:** Xem, Gửi đề xuất ADJUST_TO_ACTUAL. Không có nút tự cập nhật tồn khi hạn mức chưa chốt.

**Luồng và trạng thái:** Mặc định tất cả chênh lệch chuyển PENDING_APPROVAL; không gọi update balance. Không tạo đề xuất thứ hai khi đã có đề xuất chờ hoặc áp dụng.

**API liên quan:** `/api/v1/stocktake-differences`, `/api/v1/exception-proposals`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-23 Phê duyệt xử lý ngoại lệ

**Route Web:** `/approvals/exceptions`.  
**Vai trò:** DIRECTOR.  
**Truy vết:** UC-17.

Duyệt và áp dụng xử lý từ nguồn QC hoặc kiểm kê.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| type/status | Filters | Loại nguồn và trạng thái |
| reason | Textarea modal từ chối | Bắt buộc |
| source_details | Readonly | Nguồn, mặt hàng/lô/vị trí, số lượng và vấn đề |

**Bảng và nội dung:** Mã đề xuất, người đề xuất, loại, nguồn, số xử lý, action, trạng thái; chi tiết phương án và phân bổ.

**Thao tác:** Phê duyệt và áp dụng; Từ chối; Xem nguồn. Modal duyệt ghi rõ tác động tồn tăng/giảm/chất lượng.

**Luồng và trạng thái:** Nếu lỗi transaction thì giữ PENDING_APPROVAL, không hiện đã duyệt. 409 nguồn hết hiệu lực tải lại. RELEASE chưa được phép tới khi chốt tái kiểm; không hiển thị nút giải phóng tự do.

**API liên quan:** `/api/v1/exception-proposals`, `/api/v1/exception-proposals/{id}/review`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-23B Đề xuất xử lý hàng lỗi

**Route Web:** `/quality/exceptions/new`.  
**Vai trò:** QC_INSPECTOR / WAREHOUSE_MANAGER.  
**Truy vết:** SUP-02.

Hoàn thiện nguồn đề xuất ngoại lệ hàng QC lỗi.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| qc_inspection_line_id | Search select | Kết quả lỗi đã có tồn QUARANTINE |
| action | Select | SCRAP hoặc RETURN_SUPPLIER |
| allocations[].location_id | Select | Vị trí đang giữ lô lỗi |
| allocations[].quantity | Decimal | >0, không quá số cách ly chưa xử lý |
| reason/resolution_note | Textarea | Bắt buộc |

**Bảng và nội dung:** Lô, mặt hàng, lỗi QC, số cách ly từng vị trí, số đề xuất và tổng.

**Thao tác:** Gửi đề xuất, Hủy. Không tự giảm tồn khi gửi.

**Luồng và trạng thái:** Hàng lỗi chưa nhập chỉ hiển thị thông tin và yêu cầu chốt quy trình xử lý trước nhập, không tạo movement giảm kho. SUP này phải được chấp nhận trước khi build ngoài phạm vi gốc.

**API liên quan:** `/api/v1/exception-proposals`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-24 Báo cáo tồn kho

**Route Web:** `/reports/inventory`.  
**Vai trò:** DIRECTOR.  
**Truy vết:** UC-18.

Xem tồn hiện tại hoặc lịch sử theo mốc thời gian.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| warehouse_id | Select | Một kho/tất cả được phép |
| as_of | Datetime | Mặc định hiện tại, không tương lai |
| kind/item_id/lot_id/quality_bucket | Filters | Phạm vi dữ liệu |

**Bảng và nội dung:** Kho, vị trí, hàng/đơn vị, lô/hạn dùng, nhóm chất lượng, số dư tại as_of. Tổng tách theo item/unit/bucket.

**Thao tác:** Xem báo cáo, Xuất CSV, Xóa lọc.

**Luồng và trạng thái:** Hiện mốc hiệu lực và generated_at. Không đổi as_of âm thầm khi export. Dữ liệu trước triển khai không có phải ghi rõ, không trả tồn hiện tại cho quá khứ.

**API liên quan:** `/api/v1/reports/inventory`, `/api/v1/reports/inventory/export`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-25 Hồ sơ nhập xuất kho

**Route Web:** `/reports/stock-documents`.  
**Vai trò:** DIRECTOR / WORKSHOP_OWNER.  
**Truy vết:** UC-19, UC-20.

Xem hồ sơ nhập/xuất theo phạm vi.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| type | Tabs | IN/OUT |
| warehouse_id/from/to/item_id | Filters | Kho, khoảng ngày, mặt hàng |

**Bảng và nội dung:** Mã phiếu, loại, kho, ngày ghi sổ, nguồn, mặt hàng/lô, lượng, người ghi. Chi tiết có phân bổ và link nguồn.

**Thao tác:** Xem báo cáo, Xem phiếu, Xuất CSV.

**Luồng và trạng thái:** Chủ xưởng chỉ thấy phiếu từ request/production nguồn của xưởng được giao; export cùng scope. Mỗi tab dùng đúng tên nhập/xuất.

**API liên quan:** `/api/v1/reports/stock-documents`, `/api/v1/reports/stock-documents/export`, `/api/v1/stock-documents/{id}`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-26 Báo cáo kiểm kê

**Route Web:** `/reports/stocktakes`.  
**Vai trò:** DIRECTOR.  
**Truy vết:** UC-21.

Theo dõi số đếm, biên bản và xử lý chênh lệch.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| stocktake_id/warehouse_id | Filters | Đợt và kho |
| status | Select | Tình trạng đếm/xử lý |

**Bảng và nội dung:** Đợt, kho, hàng/lô/vị trí/bucket, snapshot, thực tế, chênh lệch, trạng thái xử lý; link biên bản/đề xuất.

**Thao tác:** Xem, Xuất CSV, Mở biên bản nếu có.

**Luồng và trạng thái:** Thực tế null hiện Chưa đếm, không hiện 0. Sau điều chỉnh vẫn hiển thị snapshot ban đầu để bảo toàn báo cáo.

**API liên quan:** `/api/v1/reports/stocktakes`, `/api/v1/reports/stocktakes/export`, `/api/v1/stocktake-minutes`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

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

Báo cáo nguyên liệu hiện có và nhu cầu theo kế hoạch.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| production_plan_id | Search select | Kế hoạch xưởng được giao, đã duyệt/đang thực hiện |
| lines[].item_id | Readonly/select nguồn | Nguyên liệu kế hoạch |
| available_quantity | Decimal | >=0, số xưởng báo |
| required_quantity | Decimal | >0 |
| note | Textarea | Ghi chú yêu cầu |

**Bảng và nội dung:** Nguyên liệu, đơn vị, hiện có tại xưởng, cần thiết, thiếu dự kiến max(cần-hiện có,0) chỉ tham khảo.

**Thao tác:** Lưu nháp, Gửi cho planner, Hủy form; sửa chỉ DRAFT.

**Luồng và trạng thái:** Nhấn Gửi từ form mới thực hiện create DRAFT rồi submit cùng key; nếu submit lỗi giữ ID nháp để thử lại, không tạo nháp mới mỗi lần. Không cập nhật tồn kho trung tâm từ số xưởng nhập.

**API liên quan:** `/api/v1/production-reports`, `/api/v1/production-reports/{id}/submit`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-29 Báo cáo thành phẩm

**Route Web:** `/production/finished-reports; /production/finished-reports/new`.  
**Vai trò:** WORKSHOP_OWNER.  
**Truy vết:** UC-35.

Báo cáo sản lượng, lô hoàn thành và nguyên liệu sử dụng.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| production_plan_id | Search select | Kế hoạch thuộc xưởng |
| completed_date | Date | Không trước bắt đầu sản xuất |
| outputs[].item_id | Select nguồn | Thành phẩm kế hoạch |
| outputs[].lot_code | Text | Mã lô duy nhất |
| outputs[].quantity | Decimal | >0, kiểm tổng sản lượng kế hoạch |
| manufactured_date/expiry_date | Date | Expiry>=manufactured nếu có |
| materials[].used_quantity | Decimal | >0; nguyên liệu thuộc kế hoạch |
| note | Textarea | <=5000 |

**Bảng và nội dung:** Bảng thành phẩm/lô/số lượng/ngày/hạn dùng; bảng nguyên liệu/số sử dụng.

**Thao tác:** Lưu nháp, Gửi giám đốc, Hủy; sửa DRAFT chưa QC/phiếu.

**Luồng và trạng thái:** Tạo lô PENDING trong transaction; submit thông báo cho giám đốc, mở bước QC và yêu cầu nhập; không tự tăng tồn hoặc tự đánh QC đạt. Cần cảnh báo nguyên liệu báo sử dụng vượt lượng đã cấp; kiểm cứng nếu chốt sổ xưởng [CẦN CHỐT].

**API liên quan:** `/api/v1/finished-reports`, `/api/v1/finished-reports/{id}/submit`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

### UI-30 Kế hoạch sản xuất tối thiểu

**Route Web:** `/production/plans; /production/plans/new; /production/plans/{id}`.  
**Vai trò:** PLANNER / DIRECTOR.  
**Truy vết:** SUP-01.

Cấp nguồn cho sản xuất và yêu cầu xuất nguyên liệu.

| Trường/bộ lọc | Thành phần | Kiểm tra và hành vi |
| --- | --- | --- |
| customer_order_id | Select | Đơn APPROVED/IN_PROGRESS |
| workshop_id | Select | Xưởng |
| start_date/end_date | Date | End>=start |
| outputs | Bảng | Thành phẩm, số lượng >0 thuộc đơn |
| materials | Bảng | Nguyên liệu, required_quantity>0; nhập thủ công, chưa BOM |

**Bảng và nội dung:** Mã, đơn nguồn, xưởng, thời gian, trạng thái; hai bảng outputs/materials.

**Thao tác:** Planner tạo/sửa DRAFT; giám đốc duyệt. Từ chối giữ DRAFT kèm audit/notification lý do.

**Luồng và trạng thái:** Nhãn chức năng bổ sung thiết kế, không trình bày như UC gốc. Khi duyệt khóa đơn và kiểm tổng kế hoạch sản xuất đang duyệt không vượt số đơn; thay đổi nguồn sau duyệt bị cấm.

**API liên quan:** `/api/v1/production-plans`, `/api/v1/production-plans/{id}/review`. Method và body tra hợp đồng API; URI resource có thể đại diện cả list/detail/create/update.

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
| Lô nguyên liệu | code, purchase_order_line_id, received_quantity | item lấy từ dòng mua, manufactured_date/expiry_date; qc_status readonly |
| Lô thành phẩm | Tạo từ UI-29 theo báo cáo | UI-11 xem/sửa metadata trước QC; không cho tạo lô độc lập vượt báo cáo |

Không dùng trường “tên danh mục, mô tả danh mục” để sửa mọi loại dữ liệu. Sửa NCC hiển thị thông tin NCC; sửa lô hiển thị metadata lô. Cột chưa xuất bản đếm items.is_published=false trong category, không áp dụng vô nghĩa cho mọi loại dữ liệu.

## 8 Luồng điều hướng nghiệp vụ

| Luồng | Trình tự màn hình và điều kiện |
| --- | --- |
| Đơn khách | UI-02 → UI-03; planner UI-04 tiếp nhận; giám đốc UI-05 duyệt; thông báo về UI-03 |
| Mua và nhập | UI-06 kế hoạch mua → UI-07 duyệt → UI-08 mua → UI-09 → UI-11 tạo lô → UI-18 QC → UI-16 yêu cầu nhận → UI-14 nhập → UI-13 phiếu |
| Sản xuất và cấp nguyên liệu | UI-30 nguồn sản xuất → UI-28 nhu cầu → UI-16 PRODUCTION_ISSUE → UI-15 xuất nguyên liệu |
| Nhập thành phẩm | UI-29 báo cáo/lô → UI-18 QC → UI-16 PRODUCTION_RECEIPT → UI-14 nhập |
| Giao thành phẩm | UI-06 kế hoạch bán từ đơn → UI-07 duyệt → UI-16 SALE_ISSUE → UI-15 xuất → UI-13/25 đối chiếu |
| Kiểm kê | UI-19 lập/start → UI-20 chọn kho và đếm → UI-21 biên bản → UI-22 đề xuất → UI-23 duyệt/áp dụng → UI-19 close → UI-26 báo cáo |
| Hàng lỗi | UI-18 QC → UI-14 nhận cách ly nếu thực nhận → UI-23B đề xuất theo vị trí → UI-23 duyệt/áp dụng |

Các mũi chuyển trên là trình tự nghiệp vụ qua nhiều vai trò, không tự chuyển tài khoản hoặc tự thực hiện bước của bộ phận tiếp theo. Link chỉ hiện khi tài khoản có quyền; hệ thống gửi thông báo tới người có vai trò/phạm vi phù hợp.

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
