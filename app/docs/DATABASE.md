# Thiết kế cơ sở dữ liệu MySQL cho hệ thống quản lý kho

**Trạng thái thực tế:** DDL bên dưới là thiết kế tham chiếu. Chỉ tập foundation đã được chọn vào `database/migrations/001_foundation.sql`, cộng sessions/login_attempts/schema_migrations. Không chạy toàn bộ DDL dưới đây như schema production. Bảng nghiệp vụ còn chờ chỉnh theo mô tả mới; xem [MODULE_MATRIX.md](MODULE_MATRIX.md). QC nguyên vật liệu lỗi trả trước nhập, không tự đưa vào QUARANTINE khi có mâu thuẫn với mô tả cũ.

**Phiên bản:** 1.0 — bản thiết kế để triển khai và rà soát.  
**Ngày:** 08/10/2026.  
**Nguồn:** Báo cáo Tuần 6 Warehouse Team có nhận xét của giáo viên, gồm 48 đặc tả UC.  
**Định hướng đã xác nhận:** ứng dụng nguyên khối, mô hình MVC, CSDL MySQL, có giao diện.  
**Chưa được chọn:** ngôn ngữ/framework, thư viện giao diện, môi trường triển khai. Tài liệu không coi Laravel, Spring hoặc Express là quyết định đã được anh Thái xác nhận.

Quy ước: **[GỐC]** là nghiệp vụ lấy từ đặc tả; **[ĐỀ XUẤT]** là quyết định bổ sung để có thể xây dựng chương trình; **[CẦN CHỐT]** là điểm chưa đủ thông tin. Các đề xuất được dùng nhất quán trong bốn tài liệu nhưng chưa có nghĩa đã được giáo viên hoặc chủ hệ thống phê duyệt.

## 1 Phạm vi và quy ước

[ĐỀ XUẤT] Target schema MySQL 8.4, InnoDB, utf8mb4, collation utf8mb4_unicode_ci. Anh đã chọn MySQL; phiên bản 8.4 là mục tiêu của thiết kế, cần kiểm tra môi trường trước khi chạy migration. Schema dưới đây không phải CSDL đã tạo hoặc đã kiểm thử trên MySQL thật.

Một database `warehouse_system`; tên bảng/cột snake_case, số khóa BIGINT UNSIGNED AUTO_INCREMENT. Mọi bảng có id, created_at và updated_at. created_at/updated_at dùng DATETIME(6), ứng dụng ghi UTC. SQL minh họa DEFAULT CURRENT_TIMESTAMP(6) yêu cầu connection timezone `+00:00`; ngày lịch nghiệp vụ dùng DATE.

Số lượng DECIMAL(18,3); tiền/đơn giá DECIMAL(19,4); dùng chuỗi trong JSON. Mã nghiệp vụ VARCHAR có UNIQUE. Không dựa vào MAX(id)+1 để sinh mã: sinh từ ID sau INSERT trong transaction hoặc dùng UUID ngắn và retry xung đột. Độ lớn mã và quy tắc prefix được giữ trong service.

BOOLEAN là cờ 0/1; service bắt buộc kiểm tra giá trị. VARCHAR trạng thái có CHECK. Các CHECK chỉ kiểm tra cùng bản ghi; quan hệ kiểu mặt hàng, nguồn chứng từ, quyền, giới hạn tích lũy và lịch giao nhau phải do service kiểm tra trong transaction.

Không dùng deleted_at đại trà. Master data chưa dùng có thể DELETE; đã tham chiếu bị RESTRICT và UI báo không thể xóa. Chứng từ chỉ chuyển CANCELLED/VOID khi còn được phép; stock_documents POSTED, inventory_movements và audit_logs bất biến. FK dùng ON DELETE RESTRICT ON UPDATE RESTRICT để tránh mất lịch sử.

## 2 Nhóm bảng và quan hệ

| Nhóm | Bảng chủ chốt | Quan hệ |
| --- | --- | --- |
| Người dùng | users, roles, user_roles, customers, workshops, workshop_users | User nhiều vai trò; khách có một tài khoản; user có phạm vi xưởng |
| Dữ liệu kho | warehouses, warehouse_locations, suppliers, categories, units, items, lots | Kho nhiều vị trí; danh mục nhiều mặt hàng; mặt hàng nhiều lô |
| Đặt hàng và kế hoạch | customer_orders, customer_order_lines, business_plans, business_plan_lines | Đơn có nhiều dòng; kế hoạch bán tham chiếu đơn duyệt |
| Mua hàng | purchase_orders, purchase_order_lines | Một đơn mua/kế hoạch mua; dòng mua trỏ dòng kế hoạch |
| Sản xuất hỗ trợ | production_plans, production_plan_outputs, production_plan_materials | Nguồn thành phẩm và nhu cầu nguyên liệu, SUP-01 |
| Chất lượng | qc_inspections, qc_inspection_lines | Một kết quả hiện hành/lô; phiếu có nhiều lô |
| Kho | stock_requests, stock_request_lines, stock_documents, stock_document_lines | Yêu cầu có nhiều phiếu thực hiện từng phần; phiếu chứa phân bổ lô/vị trí |
| Tồn | inventory_balances, inventory_movements | Balance là bản tổng hợp; ledger là nguồn biến động bất biến |
| Kiểm kê | stocktakes, stocktake_warehouses, stocktake_assignments, stocktake_lines, stocktake_minutes | Đợt nhiều kho; kho nhiều lô/vị trí; một biên bản/kho |
| Ngoại lệ | exception_proposals, exception_allocations | Nguồn QC lỗi hoặc chênh lệch; phân bổ lỗi theo vị trí |
| Công việc | tasks, task_assignments | Một công việc nhiều nhân viên, kiểm tra lịch trong service |
| Báo cáo sản xuất | production_reports, production_report_lines, finished_reports, finished_report_outputs, finished_report_materials | Báo cáo nhu cầu và kết quả sản xuất không tự ghi tồn |
| Hỗ trợ | notifications, audit_logs, idempotency_records | Thông báo, lịch sử và chống request lặp |

`notifications.resource_type/resource_id` và `audit_logs.resource_type/resource_id` là tham chiếu logic đa loại, không FK đa hình giả. Service dùng allowlist resource_type và kiểm tra đối tượng trước khi tạo/link. Các chứng từ nghiệp vụ dùng FK nguồn riêng, không dùng cặp source_type/source_id không ràng buộc.

## 3 Từ điển dữ liệu

Cột chung của mỗi bảng: **id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT**, **created_at DATETIME(6) NOT NULL**, **updated_at DATETIME(6) NOT NULL**. Bảng không có version không dùng optimistic lock trực tiếp; các thao tác sửa được kiểm soát qua bảng cha có version hoặc khóa hàng trong transaction.

Ký hiệu: “Không” trong Nullable nghĩa là bắt buộc. Bảng mang [ĐỀ XUẤT HỖ TRỢ] là phần bổ sung phục vụ chương trình, không phải một UC mới đã có trong nguồn.

### users

Tài khoản đăng nhập.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| username | VARCHAR(80) | Không | — | Tên đăng nhập duy nhất |
| password_hash | VARCHAR(255) | Không | — | Mật khẩu đã băm, tuyệt đối không lưu mật khẩu gốc |
| full_name | VARCHAR(150) | Không | — | Họ tên hiển thị |
| email | VARCHAR(254) | Có | — | Email liên hệ |
| status | VARCHAR(20) | Không | — | ACTIVE hoặc LOCKED |
| failed_login_count | INT | Không | — | Số lần đăng nhập thất bại, mặc định 0 |
| locked_until | DATETIME(6) | Có | — | Thời điểm hết khóa tạm |
| session_version | INT | Không | — | Phiên bản phiên để thu hồi đăng nhập |
| version | INT | Không | — | Phiên bản bản ghi, mặc định 1 |

UNIQUE: `username`; `email`.

CHECK: `status IN ('ACTIVE','LOCKED')`; `failed_login_count >= 0`.

### roles

Vai trò nghiệp vụ.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã vai trò duy nhất |
| name | VARCHAR(100) | Không | — | Tên vai trò |

UNIQUE: `code`.

### user_roles

Quan hệ tài khoản và vai trò.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| user_id | BIGINT UNSIGNED | Không | users.id | Tài khoản |
| role_id | BIGINT UNSIGNED | Không | roles.id | Vai trò |

UNIQUE: `user_id, role_id`.

### customers

Hồ sơ khách hàng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| user_id | BIGINT UNSIGNED | Không | users.id | Tài khoản khách hàng |
| code | VARCHAR(40) | Không | — | Mã khách hàng |
| name | VARCHAR(150) | Không | — | Tên khách hàng |
| phone | VARCHAR(20) | Có | — | Điện thoại |
| address | VARCHAR(500) | Có | — | Địa chỉ mặc định |

UNIQUE: `user_id`; `code`.

### workshops

Xưởng sản xuất.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã xưởng |
| name | VARCHAR(150) | Không | — | Tên xưởng |
| address | VARCHAR(500) | Có | — | Địa chỉ |
| is_active | BOOLEAN | Không | — | Còn hoạt động |

UNIQUE: `code`.

### workshop_users

Phạm vi chủ xưởng và nhân viên.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| workshop_id | BIGINT UNSIGNED | Không | workshops.id | Xưởng |
| user_id | BIGINT UNSIGNED | Không | users.id | Người được phân quyền |

UNIQUE: `workshop_id, user_id`.

### suppliers

Nhà cung cấp.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã nhà cung cấp |
| name | VARCHAR(150) | Không | — | Tên nhà cung cấp |
| phone | VARCHAR(20) | Có | — | Điện thoại |
| email | VARCHAR(254) | Có | — | Email |
| address | VARCHAR(500) | Có | — | Địa chỉ |
| tax_code | VARCHAR(30) | Có | — | Mã số thuế |
| is_active | BOOLEAN | Không | — | Còn sử dụng |

UNIQUE: `code`.

### warehouses

Kho và khu vực kho.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã kho |
| name | VARCHAR(150) | Không | — | Tên kho |
| address | VARCHAR(500) | Có | — | Địa chỉ |
| is_active | BOOLEAN | Không | — | Còn sử dụng |

UNIQUE: `code`.

### warehouse_locations

Vị trí lưu kho.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| warehouse_id | BIGINT UNSIGNED | Không | warehouses.id | Kho cha |
| code | VARCHAR(40) | Không | — | Mã vị trí trong kho |
| name | VARCHAR(150) | Không | — | Tên kệ hoặc khu vực |
| is_active | BOOLEAN | Không | — | Còn sử dụng |

UNIQUE: `warehouse_id, code`.

### categories

Danh mục loại hàng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã danh mục |
| name | VARCHAR(150) | Không | — | Tên danh mục |
| description | TEXT | Có | — | Mô tả |
| is_active | BOOLEAN | Không | — | Còn sử dụng |

UNIQUE: `code`; `name`.

### units

Đơn vị tính. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(20) | Không | — | Mã đơn vị tính |
| name | VARCHAR(80) | Không | — | Tên đơn vị |

UNIQUE: `code`.

### items

Mặt hàng chung cho nguyên vật liệu và thành phẩm.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| category_id | BIGINT UNSIGNED | Không | categories.id | Danh mục |
| unit_id | BIGINT UNSIGNED | Không | units.id | Đơn vị tính |
| code | VARCHAR(40) | Không | — | Mã mặt hàng |
| name | VARCHAR(150) | Không | — | Tên mặt hàng |
| kind | VARCHAR(20) | Không | — | MATERIAL hoặc FINISHED_PRODUCT |
| description | TEXT | Có | — | Mô tả |
| reference_price | DECIMAL(19,4) | Không | — | Đơn giá tham khảo, mặc định 0 |
| is_sample | BOOLEAN | Không | — | Được hiển thị trong danh sách hàng mẫu |
| image_path | VARCHAR(500) | Có | — | Đường dẫn ảnh nội bộ |
| is_published | BOOLEAN | Không | — | Dữ liệu đã xuất bản |
| is_active | BOOLEAN | Không | — | Còn sử dụng |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`; `category_id, name`.

CHECK: `kind IN ('MATERIAL','FINISHED_PRODUCT')`; `reference_price >= 0`.

### customer_orders

Đơn hàng khách hàng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã đơn hàng |
| customer_id | BIGINT UNSIGNED | Không | customers.id | Chủ đơn hàng |
| delivery_address | VARCHAR(500) | Không | — | Địa chỉ giao hàng snapshot |
| latest_delivery_date | DATE | Không | — | Ngày nhận trễ nhất |
| note | TEXT | Có | — | Ghi chú |
| status | VARCHAR(30) | Không | — | SUBMITTED RECEIVED APPROVED REJECTED IN_PROGRESS COMPLETED |
| received_by | BIGINT UNSIGNED | Có | users.id | Người tiếp nhận |
| received_at | DATETIME(6) | Có | — | Thời gian tiếp nhận |
| reviewed_by | BIGINT UNSIGNED | Có | users.id | Người duyệt |
| reviewed_at | DATETIME(6) | Có | — | Thời gian duyệt |
| rejection_reason | TEXT | Có | — | Lý do từ chối |
| quoted_total | DECIMAL(19,4) | Không | — | Tổng giá tham khảo từ chi tiết |
| version | INT | Không | — | Phiên bản kiểm soát sửa đồng thời |

UNIQUE: `code`.

INDEX: `customer_id, status, created_at`; `status, created_at`.

CHECK: `status IN ('SUBMITTED','RECEIVED','APPROVED','REJECTED','IN_PROGRESS','COMPLETED')`; `quoted_total >= 0`.

### customer_order_lines

Chi tiết đơn hàng khách hàng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| customer_order_id | BIGINT UNSIGNED | Không | customer_orders.id | Đơn cha |
| item_id | BIGINT UNSIGNED | Không | items.id | Thành phẩm mẫu |
| quantity | DECIMAL(18,3) | Không | — | Số lượng đặt |
| unit_price | DECIMAL(19,4) | Không | — | Đơn giá snapshot |
| note | TEXT | Có | — | Mô tả chi tiết |

UNIQUE: `customer_order_id, item_id`.

CHECK: `quantity > 0`; `unit_price >= 0`.

### business_plans

Kế hoạch mua hoặc bán.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã kế hoạch |
| type | VARCHAR(10) | Không | — | PURCHASE hoặc SALE |
| supplier_id | BIGINT UNSIGNED | Có | suppliers.id | Nhà cung cấp với kế hoạch mua |
| customer_id | BIGINT UNSIGNED | Có | customers.id | Khách hàng với kế hoạch bán |
| customer_order_id | BIGINT UNSIGNED | Có | customer_orders.id | Đơn hàng nguồn của kế hoạch bán |
| planned_date | DATE | Không | — | Ngày dự kiến |
| note | TEXT | Có | — | Ghi chú |
| status | VARCHAR(30) | Không | — | PENDING_APPROVAL APPROVED REJECTED IN_PROGRESS COMPLETED CANCELLED |
| created_by | BIGINT UNSIGNED | Không | users.id | Người lập |
| reviewed_by | BIGINT UNSIGNED | Có | users.id | Người duyệt |
| reviewed_at | DATETIME(6) | Có | — | Thời gian duyệt |
| rejection_reason | TEXT | Có | — | Lý do từ chối |
| total_amount | DECIMAL(19,4) | Không | — | Tổng tiền kế hoạch |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

INDEX: `type, status, planned_date`.

CHECK: `type IN ('PURCHASE','SALE')`; `status IN ('PENDING_APPROVAL','APPROVED','REJECTED','IN_PROGRESS','COMPLETED','CANCELLED')`; `total_amount >= 0`; `(type='PURCHASE' AND supplier_id IS NOT NULL AND customer_id IS NULL AND customer_order_id IS NULL) OR (type='SALE' AND supplier_id IS NULL AND customer_id IS NOT NULL AND customer_order_id IS NOT NULL)`.

### business_plan_lines

Chi tiết kế hoạch mua bán.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| business_plan_id | BIGINT UNSIGNED | Không | business_plans.id | Kế hoạch |
| item_id | BIGINT UNSIGNED | Không | items.id | Mặt hàng |
| quantity | DECIMAL(18,3) | Không | — | Số lượng |
| unit_price | DECIMAL(19,4) | Không | — | Đơn giá snapshot |

UNIQUE: `business_plan_id, item_id`.

CHECK: `quantity > 0`; `unit_price >= 0`.

### purchase_orders

Đơn mua nguyên vật liệu.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã đơn mua |
| business_plan_id | BIGINT UNSIGNED | Không | business_plans.id | Kế hoạch mua đã duyệt |
| supplier_id | BIGINT UNSIGNED | Không | suppliers.id | Nhà cung cấp |
| created_by | BIGINT UNSIGNED | Không | users.id | Người mua |
| expected_delivery_date | DATE | Không | — | Ngày giao dự kiến |
| delivery_terms | TEXT | Không | — | Điều kiện giao hàng |
| status | VARCHAR(30) | Không | — | PENDING PARTIALLY_RECEIVED RECEIVED CANCELLED |
| total_amount | DECIMAL(19,4) | Không | — | Tổng giá trị |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`; `business_plan_id`.

CHECK: `status IN ('PENDING','PARTIALLY_RECEIVED','RECEIVED','CANCELLED')`; `total_amount >= 0`.

### purchase_order_lines

Chi tiết đơn mua.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| purchase_order_id | BIGINT UNSIGNED | Không | purchase_orders.id | Đơn mua |
| business_plan_line_id | BIGINT UNSIGNED | Không | business_plan_lines.id | Dòng kế hoạch nguồn |
| item_id | BIGINT UNSIGNED | Không | items.id | Nguyên vật liệu |
| quantity | DECIMAL(18,3) | Không | — | Số lượng đặt |
| unit_price | DECIMAL(19,4) | Không | — | Đơn giá chốt |

UNIQUE: `purchase_order_id, item_id`.

CHECK: `quantity > 0`; `unit_price >= 0`.

### production_plans

Kế hoạch sản xuất tối thiểu để làm nguồn yêu cầu xuất nguyên liệu. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã kế hoạch sản xuất |
| customer_order_id | BIGINT UNSIGNED | Không | customer_orders.id | Đơn khách hàng đã duyệt |
| workshop_id | BIGINT UNSIGNED | Không | workshops.id | Xưởng thực hiện |
| created_by | BIGINT UNSIGNED | Không | users.id | Người lập kế hoạch |
| start_date | DATE | Không | — | Ngày bắt đầu |
| end_date | DATE | Không | — | Ngày kết thúc |
| status | VARCHAR(30) | Không | — | DRAFT APPROVED IN_PROGRESS COMPLETED CANCELLED |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `end_date >= start_date`; `status IN ('DRAFT','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED')`.

### production_plan_outputs

Thành phẩm dự kiến của kế hoạch sản xuất. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| production_plan_id | BIGINT UNSIGNED | Không | production_plans.id | Kế hoạch |
| item_id | BIGINT UNSIGNED | Không | items.id | Thành phẩm |
| quantity | DECIMAL(18,3) | Không | — | Số lượng dự kiến |

UNIQUE: `production_plan_id, item_id`.

CHECK: `quantity > 0`.

### production_plan_materials

Nhu cầu nguyên vật liệu theo kế hoạch sản xuất. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| production_plan_id | BIGINT UNSIGNED | Không | production_plans.id | Kế hoạch |
| item_id | BIGINT UNSIGNED | Không | items.id | Nguyên vật liệu |
| required_quantity | DECIMAL(18,3) | Không | — | Số lượng cần cấp |

UNIQUE: `production_plan_id, item_id`.

CHECK: `required_quantity > 0`.

### lots

Lô nguyên liệu hoặc thành phẩm.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(50) | Không | — | Mã lô |
| item_id | BIGINT UNSIGNED | Không | items.id | Mặt hàng |
| purchase_order_line_id | BIGINT UNSIGNED | Có | purchase_order_lines.id | Dòng đơn mua nguồn |
| production_plan_id | BIGINT UNSIGNED | Có | production_plans.id | Kế hoạch sản xuất nguồn |
| manufactured_date | DATE | Có | — | Ngày sản xuất |
| expiry_date | DATE | Có | — | Hạn sử dụng |
| received_quantity | DECIMAL(18,3) | Không | — | Số lượng lô tiếp nhận hoặc sản xuất |
| qc_status | VARCHAR(20) | Không | — | PENDING PASSED PARTIAL FAILED |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `received_quantity > 0`; `qc_status IN ('PENDING','PASSED','PARTIAL','FAILED')`; `expiry_date IS NULL OR manufactured_date IS NULL OR expiry_date >= manufactured_date`; `(purchase_order_line_id IS NOT NULL AND production_plan_id IS NULL) OR (purchase_order_line_id IS NULL AND production_plan_id IS NOT NULL)`.

### qc_inspections

Phiếu kết quả QC/AC.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã phiếu kiểm tra |
| inspector_id | BIGINT UNSIGNED | Không | users.id | Người kiểm tra |
| inspected_at | DATETIME(6) | Không | — | Thời gian kiểm tra |
| note | TEXT | Có | — | Ghi chú |
| status | VARCHAR(20) | Không | — | RECORDED hoặc VOID |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `status IN ('RECORDED','VOID')`.

### qc_inspection_lines

Kết quả QC theo từng lô.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| qc_inspection_id | BIGINT UNSIGNED | Không | qc_inspections.id | Phiếu QC |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô kiểm tra |
| inspected_quantity | DECIMAL(18,3) | Không | — | Tổng số lượng kiểm |
| passed_quantity | DECIMAL(18,3) | Không | — | Số lượng đạt |
| failed_quantity | DECIMAL(18,3) | Không | — | Số lượng không đạt |
| issue | TEXT | Có | — | Mô tả vấn đề |

UNIQUE: `qc_inspection_id, lot_id`; `lot_id`.

CHECK: `inspected_quantity > 0`; `passed_quantity >= 0`; `failed_quantity >= 0`; `inspected_quantity = passed_quantity + failed_quantity`.

### stock_requests

Yêu cầu nhập hoặc xuất.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã yêu cầu |
| type | VARCHAR(10) | Không | — | IN hoặc OUT |
| purpose | VARCHAR(30) | Không | — | PURCHASE_RECEIPT PRODUCTION_RECEIPT PRODUCTION_ISSUE SALE_ISSUE |
| purchase_order_id | BIGINT UNSIGNED | Có | purchase_orders.id | Nguồn mua nguyên liệu |
| business_plan_id | BIGINT UNSIGNED | Có | business_plans.id | Nguồn kế hoạch bán |
| production_plan_id | BIGINT UNSIGNED | Có | production_plans.id | Nguồn kế hoạch sản xuất |
| workshop_id | BIGINT UNSIGNED | Không | workshops.id | Xưởng yêu cầu |
| warehouse_id | BIGINT UNSIGNED | Không | warehouses.id | Kho xử lý |
| created_by | BIGINT UNSIGNED | Không | users.id | Chủ yêu cầu |
| requested_date | DATE | Không | — | Ngày yêu cầu |
| status | VARCHAR(30) | Không | — | PENDING PARTIALLY_FULFILLED FULFILLED CANCELLED |
| note | TEXT | Có | — | Ghi chú |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

INDEX: `warehouse_id, type, status`; `created_by, created_at`.

CHECK: `status IN ('PENDING','PARTIALLY_FULFILLED','FULFILLED','CANCELLED')`; `(purpose='PURCHASE_RECEIPT' AND type='IN' AND purchase_order_id IS NOT NULL AND business_plan_id IS NULL AND production_plan_id IS NULL) OR (purpose='SALE_ISSUE' AND type='OUT' AND purchase_order_id IS NULL AND business_plan_id IS NOT NULL AND production_plan_id IS NULL) OR (purpose='PRODUCTION_ISSUE' AND type='OUT' AND purchase_order_id IS NULL AND business_plan_id IS NULL AND production_plan_id IS NOT NULL) OR (purpose='PRODUCTION_RECEIPT' AND type='IN' AND purchase_order_id IS NULL AND business_plan_id IS NULL AND production_plan_id IS NOT NULL)`.

### stock_request_lines

Chi tiết yêu cầu kho.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| stock_request_id | BIGINT UNSIGNED | Không | stock_requests.id | Yêu cầu |
| item_id | BIGINT UNSIGNED | Không | items.id | Mặt hàng |
| quantity | DECIMAL(18,3) | Không | — | Số lượng yêu cầu |
| note | TEXT | Có | — | Ghi chú |

UNIQUE: `stock_request_id, item_id`.

CHECK: `quantity > 0`.

### stock_documents

Phiếu nhập xuất đã ghi sổ.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã phiếu |
| type | VARCHAR(10) | Không | — | IN hoặc OUT |
| stock_request_id | BIGINT UNSIGNED | Không | stock_requests.id | Yêu cầu nguồn |
| warehouse_id | BIGINT UNSIGNED | Không | warehouses.id | Kho |
| posted_by | BIGINT UNSIGNED | Không | users.id | Nhân viên ghi sổ |
| posted_at | DATETIME(6) | Không | — | Thời điểm biến động hiệu lực |
| status | VARCHAR(20) | Không | — | POSTED |
| note | TEXT | Có | — | Ghi chú |
| idempotency_key | VARCHAR(100) | Không | — | Khóa chống ghi sổ lặp |

UNIQUE: `code`; `idempotency_key`.

INDEX: `warehouse_id, type, posted_at`.

CHECK: `type IN ('IN','OUT')`; `status='POSTED'`.

### stock_document_lines

Chi tiết phiếu theo lô và vị trí.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| stock_document_id | BIGINT UNSIGNED | Không | stock_documents.id | Phiếu kho |
| stock_request_line_id | BIGINT UNSIGNED | Không | stock_request_lines.id | Dòng yêu cầu nguồn |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô |
| location_id | BIGINT UNSIGNED | Không | warehouse_locations.id | Vị trí |
| quality_bucket | VARCHAR(20) | Không | — | AVAILABLE hoặc QUARANTINE |
| quantity | DECIMAL(18,3) | Không | — | Số lượng thực nhập hoặc xuất |
| difference_reason | TEXT | Có | — | Lý do lệch so với phân bổ |

UNIQUE: `stock_document_id, stock_request_line_id, lot_id, location_id, quality_bucket`.

CHECK: `quantity > 0`; `quality_bucket IN ('AVAILABLE','QUARANTINE')`.

### inventory_balances

Số dư hiện tại theo lô vị trí và chất lượng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô |
| location_id | BIGINT UNSIGNED | Không | warehouse_locations.id | Vị trí kho |
| quality_bucket | VARCHAR(20) | Không | — | AVAILABLE hoặc QUARANTINE |
| quantity | DECIMAL(18,3) | Không | — | Số dư hiện tại |
| version | INT | Không | — | Phiên bản |

UNIQUE: `lot_id, location_id, quality_bucket`.

CHECK: `quantity >= 0`; `quality_bucket IN ('AVAILABLE','QUARANTINE')`.

### stocktakes

Đợt kiểm kê.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã đợt |
| created_by | BIGINT UNSIGNED | Không | users.id | Giám đốc lập |
| planned_date | DATE | Không | — | Ngày dự kiến |
| start_at | DATETIME(6) | Có | — | Thời điểm chốt số liệu |
| end_at | DATETIME(6) | Có | — | Thời điểm kết thúc |
| item_kind | VARCHAR(20) | Có | — | Phạm vi MATERIAL hoặc FINISHED_PRODUCT; null là cả hai |
| status | VARCHAR(30) | Không | — | PLANNED IN_PROGRESS COMPLETED CLOSED CANCELLED |
| note | TEXT | Có | — | Ghi chú |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `status IN ('PLANNED','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED')`; `item_kind IS NULL OR item_kind IN ('MATERIAL','FINISHED_PRODUCT')`.

### stocktake_warehouses

Phạm vi kho và khóa nghiệp vụ khi kiểm kê.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| stocktake_id | BIGINT UNSIGNED | Không | stocktakes.id | Đợt |
| warehouse_id | BIGINT UNSIGNED | Không | warehouses.id | Kho |
| status | VARCHAR(20) | Không | — | PLANNED COUNTING COMPLETED CLOSED |
| snapshot_at | DATETIME(6) | Có | — | Mốc số liệu hệ thống |
| completed_at | DATETIME(6) | Có | — | Hoàn tất đếm |
| version | INT | Không | — | Phiên bản phạm vi kho kiểm kê |

UNIQUE: `stocktake_id, warehouse_id`.

CHECK: `status IN ('PLANNED','COUNTING','COMPLETED','CLOSED')`.

### stocktake_assignments

Người được phân công kiểm kê từng kho.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| stocktake_warehouse_id | BIGINT UNSIGNED | Không | stocktake_warehouses.id | Phạm vi |
| user_id | BIGINT UNSIGNED | Không | users.id | Thành viên ban kiểm kê |

UNIQUE: `stocktake_warehouse_id, user_id`.

### stocktake_lines

Số lượng hệ thống và thực tế theo lô vị trí.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| stocktake_warehouse_id | BIGINT UNSIGNED | Không | stocktake_warehouses.id | Kho trong đợt |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô |
| location_id | BIGINT UNSIGNED | Không | warehouse_locations.id | Vị trí |
| quality_bucket | VARCHAR(20) | Không | — | AVAILABLE hoặc QUARANTINE |
| system_quantity | DECIMAL(18,3) | Không | — | Snapshot khi bắt đầu |
| actual_quantity | DECIMAL(18,3) | Có | — | Số lượng đếm; null là chưa đếm |
| counted_by | BIGINT UNSIGNED | Có | users.id | Người nhập |
| counted_at | DATETIME(6) | Có | — | Thời gian nhập |
| cause | TEXT | Có | — | Nguyên nhân chênh lệch |
| resolution_status | VARCHAR(30) | Không | — | NONE PENDING_APPROVAL RESOLVED |
| version | INT | Không | — | Phiên bản |

UNIQUE: `stocktake_warehouse_id, lot_id, location_id, quality_bucket`.

CHECK: `system_quantity >= 0`; `actual_quantity IS NULL OR actual_quantity >= 0`; `quality_bucket IN ('AVAILABLE','QUARANTINE')`; `resolution_status IN ('NONE','PENDING_APPROVAL','RESOLVED')`.

### stocktake_minutes

Biên bản kiểm kê theo kho.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã biên bản |
| stocktake_warehouse_id | BIGINT UNSIGNED | Không | stocktake_warehouses.id | Kho đã đếm xong |
| created_by | BIGINT UNSIGNED | Không | users.id | Người lập |
| status | VARCHAR(20) | Không | — | DRAFT hoặc SUBMITTED |
| remarks | TEXT | Không | — | Nhận xét và xác nhận |
| submitted_at | DATETIME(6) | Có | — | Thời gian gửi |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`; `stocktake_warehouse_id`.

CHECK: `status IN ('DRAFT','SUBMITTED')`.

### exception_proposals

Đề xuất xử lý hàng lỗi hoặc chênh lệch.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã đề xuất |
| type | VARCHAR(30) | Không | — | QC_FAILURE hoặc STOCKTAKE_DIFFERENCE |
| qc_inspection_line_id | BIGINT UNSIGNED | Có | qc_inspection_lines.id | Kết quả hàng lỗi nguồn |
| stocktake_line_id | BIGINT UNSIGNED | Có | stocktake_lines.id | Chênh lệch nguồn |
| created_by | BIGINT UNSIGNED | Không | users.id | Người đề xuất |
| action | VARCHAR(30) | Không | — | ADJUST_TO_ACTUAL SCRAP RETURN_SUPPLIER RELEASE |
| quantity | DECIMAL(18,3) | Không | — | Số lượng xử lý |
| reason | TEXT | Không | — | Nguyên nhân |
| resolution_note | TEXT | Không | — | Phương án |
| status | VARCHAR(30) | Không | — | PENDING_APPROVAL APPROVED REJECTED APPLIED |
| reviewed_by | BIGINT UNSIGNED | Có | users.id | Người duyệt |
| reviewed_at | DATETIME(6) | Có | — | Thời gian duyệt |
| rejection_reason | TEXT | Có | — | Lý do từ chối |
| applied_at | DATETIME(6) | Có | — | Thời gian thực thi |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `quantity > 0`; `type IN ('QC_FAILURE','STOCKTAKE_DIFFERENCE')`; `action IN ('ADJUST_TO_ACTUAL','SCRAP','RETURN_SUPPLIER','RELEASE')`; `status IN ('PENDING_APPROVAL','APPROVED','REJECTED','APPLIED')`; `(type='QC_FAILURE' AND qc_inspection_line_id IS NOT NULL AND stocktake_line_id IS NULL) OR (type='STOCKTAKE_DIFFERENCE' AND qc_inspection_line_id IS NULL AND stocktake_line_id IS NOT NULL)`.

### exception_allocations

Phân bổ hàng lỗi cần xử lý theo vị trí. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| exception_proposal_id | BIGINT UNSIGNED | Không | exception_proposals.id | Đề xuất |
| location_id | BIGINT UNSIGNED | Không | warehouse_locations.id | Vị trí đang giữ lô lỗi |
| quantity | DECIMAL(18,3) | Không | — | Số lượng xử lý từ vị trí |

UNIQUE: `exception_proposal_id, location_id`.

CHECK: `quantity > 0`.

### inventory_movements

Sổ biến động tồn kho bất biến.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô |
| location_id | BIGINT UNSIGNED | Không | warehouse_locations.id | Vị trí |
| quality_bucket | VARCHAR(20) | Không | — | AVAILABLE hoặc QUARANTINE |
| quantity_delta | DECIMAL(18,3) | Không | — | Tăng dương giảm âm |
| stock_document_line_id | BIGINT UNSIGNED | Có | stock_document_lines.id | Chi tiết phiếu nguồn |
| exception_proposal_id | BIGINT UNSIGNED | Có | exception_proposals.id | Đề xuất đã duyệt nguồn |
| stocktake_line_id | BIGINT UNSIGNED | Có | stocktake_lines.id | Điều chỉnh trực tiếp nguồn |
| posted_at | DATETIME(6) | Không | — | Mốc hiệu lực |
| created_by | BIGINT UNSIGNED | Không | users.id | Người thực hiện |
| operation_key | VARCHAR(150) | Không | — | Khóa duy nhất mỗi biến động |

UNIQUE: `operation_key`.

INDEX: `lot_id, location_id, posted_at`; `posted_at`.

CHECK: `quantity_delta <> 0`; `quality_bucket IN ('AVAILABLE','QUARANTINE')`; `(stock_document_line_id IS NOT NULL) + (exception_proposal_id IS NOT NULL) + (stocktake_line_id IS NOT NULL) = 1`.

### tasks

Công việc điều phối.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã công việc |
| title | VARCHAR(200) | Không | — | Tên công việc |
| description | TEXT | Có | — | Mô tả |
| start_at | DATETIME(6) | Không | — | Bắt đầu |
| end_at | DATETIME(6) | Không | — | Kết thúc |
| priority | VARCHAR(20) | Không | — | LOW NORMAL HIGH |
| status | VARCHAR(20) | Không | — | PLANNED IN_PROGRESS COMPLETED CANCELLED |
| stocktake_id | BIGINT UNSIGNED | Có | stocktakes.id | Đợt kiểm kê nếu liên quan |
| purchase_order_id | BIGINT UNSIGNED | Có | purchase_orders.id | Đơn mua nếu liên quan |
| created_by | BIGINT UNSIGNED | Không | users.id | Người tạo |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `end_at > start_at`; `priority IN ('LOW','NORMAL','HIGH')`; `status IN ('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED')`.

### task_assignments

Phân công nhân viên vào công việc.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| task_id | BIGINT UNSIGNED | Không | tasks.id | Công việc |
| user_id | BIGINT UNSIGNED | Không | users.id | Nhân viên |

UNIQUE: `task_id, user_id`.

### production_reports

Phiếu báo cáo sản xuất và nhu cầu nguyên liệu.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã phiếu |
| production_plan_id | BIGINT UNSIGNED | Không | production_plans.id | Kế hoạch sản xuất |
| created_by | BIGINT UNSIGNED | Không | users.id | Chủ xưởng |
| note | TEXT | Có | — | Ghi chú |
| status | VARCHAR(20) | Không | — | DRAFT hoặc SUBMITTED |
| submitted_at | DATETIME(6) | Có | — | Thời gian gửi |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `status IN ('DRAFT','SUBMITTED')`.

### production_report_lines

Chi tiết nhu cầu trong báo cáo sản xuất.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| production_report_id | BIGINT UNSIGNED | Không | production_reports.id | Phiếu báo cáo |
| item_id | BIGINT UNSIGNED | Không | items.id | Nguyên vật liệu |
| available_quantity | DECIMAL(18,3) | Không | — | Số lượng hiện có tại xưởng snapshot |
| required_quantity | DECIMAL(18,3) | Không | — | Số lượng cần thiết |

UNIQUE: `production_report_id, item_id`.

CHECK: `available_quantity >= 0`; `required_quantity > 0`.

### finished_reports

Báo cáo hoàn thành thành phẩm.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| code | VARCHAR(40) | Không | — | Mã báo cáo |
| production_plan_id | BIGINT UNSIGNED | Không | production_plans.id | Kế hoạch |
| created_by | BIGINT UNSIGNED | Không | users.id | Chủ xưởng |
| completed_date | DATE | Không | — | Ngày hoàn thành |
| note | TEXT | Có | — | Ghi chú |
| status | VARCHAR(20) | Không | — | DRAFT hoặc SUBMITTED |
| submitted_at | DATETIME(6) | Có | — | Thời gian gửi |
| version | INT | Không | — | Phiên bản |

UNIQUE: `code`.

CHECK: `status IN ('DRAFT','SUBMITTED')`.

### finished_report_outputs

Thành phẩm và lô báo cáo.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| finished_report_id | BIGINT UNSIGNED | Không | finished_reports.id | Báo cáo |
| lot_id | BIGINT UNSIGNED | Không | lots.id | Lô thành phẩm đã tạo |
| quantity | DECIMAL(18,3) | Không | — | Số lượng thành phẩm |

UNIQUE: `finished_report_id, lot_id`; `lot_id`.

CHECK: `quantity > 0`.

### finished_report_materials

Nguyên liệu đã sử dụng.

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| finished_report_id | BIGINT UNSIGNED | Không | finished_reports.id | Báo cáo |
| item_id | BIGINT UNSIGNED | Không | items.id | Nguyên vật liệu |
| used_quantity | DECIMAL(18,3) | Không | — | Số lượng sử dụng |

UNIQUE: `finished_report_id, item_id`.

CHECK: `used_quantity > 0`.

### notifications

Thông báo nội bộ hệ thống. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| user_id | BIGINT UNSIGNED | Không | users.id | Người nhận |
| subject | VARCHAR(200) | Không | — | Tiêu đề |
| body | TEXT | Không | — | Nội dung |
| resource_type | VARCHAR(50) | Không | — | Loại chứng từ tham chiếu logic |
| resource_id | BIGINT UNSIGNED | Không | — | ID tham chiếu logic kiểm tra ở service |
| read_at | DATETIME(6) | Có | — | Đã đọc |
| business_key | VARCHAR(150) | Không | — | Khóa chống thông báo lặp |

UNIQUE: `user_id, business_key`.

INDEX: `user_id, read_at, created_at`.

### audit_logs

Nhật ký nghiệp vụ bất biến. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| actor_id | BIGINT UNSIGNED | Có | users.id | Người thực hiện |
| resource_type | VARCHAR(50) | Không | — | Loại đối tượng |
| resource_id | BIGINT UNSIGNED | Không | — | ID tham chiếu logic |
| action | VARCHAR(50) | Không | — | Hành động |
| before_data | JSON | Có | — | Dữ liệu trước đã loại bí mật |
| after_data | JSON | Có | — | Dữ liệu sau đã loại bí mật |
| request_id | VARCHAR(50) | Không | — | Mã truy vết |

INDEX: `resource_type, resource_id, created_at`.

### idempotency_records

Kết quả chống gửi lặp của thao tác ghi sổ và duyệt. **[ĐỀ XUẤT HỖ TRỢ]**

| Cột | Kiểu MySQL | Nullable | Tham chiếu | Ý nghĩa |
| --- | --- | --- | --- | --- |
| user_id | BIGINT UNSIGNED | Không | users.id | Người gửi |
| operation | VARCHAR(100) | Không | — | Tên thao tác và ID nguồn |
| idempotency_key | VARCHAR(100) | Không | — | Khóa client gửi |
| request_hash | CHAR(64) | Không | — | Băm request chuẩn hóa |
| response_status | SMALLINT | Không | — | HTTP status đã trả |
| response_body | JSON | Không | — | Kết quả để trả lại |
| expires_at | DATETIME(6) | Không | — | Ngày hết hạn lưu, đề xuất 7 ngày |

UNIQUE: `user_id, operation, idempotency_key`.

## 4 Ràng buộc liên bảng bắt buộc ở service

1. Mặt hàng dòng mua/kế hoạch mua phải MATERIAL; dòng đơn khách/bán/đầu ra sản xuất phải FINISHED_PRODUCT; vật liệu sản xuất phải MATERIAL. Đơn giá server đọc và chụp snapshot, client chỉ được đề xuất giá ở mua hàng/planner có quyền. Nếu code bỏ trống, service sinh UUID/mã tạm trước INSERT rồi mã hóa từ ID nếu cần; không INSERT NULL vào cột code NOT NULL.
2. Nhà cung cấp đơn mua phải khớp kế hoạch; business_plan_line_id phải thuộc kế hoạch đó và item_id khớp. Tổng số lượng mua bằng dòng kế hoạch trong MVP; thay đổi cần sửa kế hoạch và duyệt lại.
3. Khách và đơn nguồn của kế hoạch bán phải khớp; khóa đơn và các phân bổ hiện hành khi kiểm tra tổng kế hoạch bán APPROVED/IN_PROGRESS/COMPLETED không vượt số đặt. Kế hoạch chờ duyệt có thể cảnh báo, nhưng kiểm tra cứng lúc duyệt.
4. Source của request phải cùng xưởng/phạm vi quyền và đúng mục đích; quantity không vượt số còn từ kế hoạch/đơn. Nhiều yêu cầu cùng nguồn phải được kiểm tra bằng khóa parent source để không phân bổ vượt.
5. Lô nguyên liệu có purchase_order_line_id; lô thành phẩm có production_plan_id. Service kiểm tra nguồn phù hợp kind và sản phẩm có trong production_plan_outputs. Tổng lot nguyên liệu không vượt số mua; tổng lot thành phẩm khớp các dòng finished_report_outputs, được tạo cùng transaction báo cáo. Kế hoạch sản xuất duyệt khóa đơn khách và kiểm tổng outputs APPROVED/IN_PROGRESS/COMPLETED không vượt số lượng đơn theo item; không cộng kế hoạch DRAFT.
6. QC inspected_quantity phải bằng số lượng lot.received_quantity trong phiên bản kiểm toàn lô; số đạt/lỗi cộng đúng số kiểm. Một phiếu nhiều dòng, không trùng lô. Khi VOID, xóa các qc_inspection_lines chưa dùng để có thể kiểm lại, giữ header và audit.
7. location_id phải thuộc warehouse của phiếu/phạm vi kiểm kê; lot.item_id phải khớp request_line.item_id. Warehouse của phiếu phải bằng request.warehouse_id; type phải bằng request.type.
8. Tổng đã nhận/đã cấp là SUM stock_document_lines của phiếu POSTED theo request_line. Không lưu thêm fulfilled_quantity có thể lệch. Nếu tổng đạt hết mới FULFILLED.
9. Tổng AVAILABLE nhập theo lô ≤ passed_quantity; tổng QUARANTINE nhập ≤ failed_quantity. Xuất thông thường chỉ AVAILABLE. QUARANTINE chỉ giảm qua đề xuất SCRAP/RETURN_SUPPLIER đã duyệt.
10. Số dư ≥0; request IN với PRODUCTION_RECEIPT chỉ chọn lô thuộc báo cáo SUBMITTED của production plan tương ứng. Không lấy báo cáo DRAFT làm chứng từ đã hoàn thành.
11. inventory_movements có đúng một nguồn: dòng phiếu, đề xuất hoặc dòng kiểm kê trực tiếp. Mặc định BR-23 không cho nguồn stocktake_line_id trực tiếp; trường này chuẩn bị cho hạn mức được chốt sau. Không cùng một chênh lệch vừa đi đề xuất vừa ghi trực tiếp.
12. Một dòng kiểm kê chỉ có một đề xuất PENDING_APPROVAL/APPLIED; một nguồn QC có thể có nhiều đề xuất xử lý phần khác nhau nhưng tổng đã áp dụng không vượt số lỗi còn trong QUARANTINE. Khóa dòng nguồn khi tạo/duyệt để thực thi.
13. QC_INSPECTOR chỉ tạo đề xuất QC_FAILURE thuộc kết quả được phép xử lý; WAREHOUSE_MANAGER tạo STOCKTAKE_DIFFERENCE hoặc QC_FAILURE. Loại source là một phần policy, không chỉ role route. Đề xuất ADJUST_TO_ACTUAL dùng chênh lệch có dấu từ stocktake_lines, quantity là trị tuyệt đối để đối chiếu. Không cho client gửi delta tự do. QC SCRAP/RETURN_SUPPLIER giảm QUARANTINE; RELEASE chuyển hai movement QUARANTINE âm, AVAILABLE dương sau xác nhận QC tái kiểm [CẦN CHỐT]. Mặc định RELEASE bị vô hiệu cho tới khi có quy trình tái kiểm.
14. exception_allocations tổng bằng proposal.quantity, vị trí có lô nguồn và đủ số cách ly. Hàng lỗi chưa nhập kho được ghi nhận ngoại lệ và xử lý bên ngoài tồn, không tạo movement giảm một số dư chưa tồn tại; luồng xử lý trước nhập cần chốt riêng.
15. users được phân công có STOCKTAKER; workshop_users người chủ xưởng hợp lệ. Không cho người duyệt đồng thời tự thay nguồn/số lượng trong request duyệt.
16. Mã và đơn vị tính master data đã phát sinh chứng từ bị khóa sửa. Không tự đổi item.kind hoặc lot nguồn sau QC/chứng từ.

## 5 Transaction và kiểm soát đồng thời

### Ghi sổ kho

- Bắt đầu transaction; giành khóa idempotency theo user/operation/key hoặc đọc replay. Cùng key khác hash trả lỗi.
- Khóa warehouse row bằng FOR UPDATE, kiểm tra không có stocktake_warehouses COUNTING/COMPLETED của kho. Mọi thao tác ghi kho/điều chỉnh/bắt đầu kiểm kê đều khóa cùng warehouse row; kiểm tra UI không thay thế khóa server.
- Khóa nguồn kế hoạch/đơn, request và các lot/QC liên quan theo thứ tự ID tăng dần. Đọc lại version, giới hạn nguồn và cộng dồn.
- Với balance chưa tồn tại, tạo hàng 0 bằng insert có xử lý UNIQUE race, rồi SELECT FOR UPDATE hàng hiện hành. Không chỉ khóa một hàng không tồn tại và giả là đã bảo vệ số dư.
- Kiểm tra AVAILABLE còn hạn và đủ số dư; tăng/giảm balance; tạo header, lines, movements với operation_key duy nhất. Không nhận quantity_delta từ API ghi phiếu.
- Cập nhật request và nguồn theo lượng tích lũy; ghi audit và notifications; lưu kết quả idempotency trong cùng transaction; commit. Lỗi ở bất kỳ bước nào rollback toàn bộ.

### Bắt đầu kiểm kê

Khóa các warehouse theo ID tăng dần, kiểm tra chưa có phạm vi kiểm kê hoạt động; tạo snapshot từ các balance khớp item_kind trong đợt, kể cả số dư 0 đã tồn tại nếu cần truy vết; tạo stocktake_lines theo lot/location/bucket, actual_quantity=null. Chuyển phạm vi thành COUNTING trong cùng transaction trước khi mở form đếm. Những kho chưa có hàng vẫn có phạm vi và có thể hoàn tất với danh sách rỗng sau xác nhận.

### Duyệt chênh lệch

Khóa warehouse và stocktake_line/proposal/balance, kiểm tra kho đã COMPLETED, version không đổi, chưa RESOLVED. Delta = actual_quantity − system_quantity. Vì kho đã khóa nghiệp vụ, balance phải khớp snapshot; lệch thì trả 409 và điều tra, không ghi đè. Cập nhật balance bằng delta, tạo movement từ proposal, đặt line RESOLVED, proposal APPLIED, ghi audit/notification và commit.

### Lịch nhân viên

Khóa users của các nhân viên theo ID tăng dần trước khi kiểm tra lịch và thay phân công. Hai lịch giao nhau nếu existing.start_at < new.end_at AND existing.end_at > new.start_at, với PLANNED/IN_PROGRESS và khác task hiện tại. Khi sửa task liên quan kiểm kê, cập nhật stocktake_assignments và công việc đồng bộ, không chỉ sửa bảng task riêng.

Transaction ngắn; tránh thực hiện tải file hoặc gọi mạng ngoài khi đang giữ khóa. Retry deadlock có giới hạn, đề xuất tối đa 3 lần với backoff; hết giới hạn trả lỗi có thể thử lại, không đánh dấu thành công.

Tham khảo kỹ thuật: [MySQL 8.4 Locking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html) và [Deadlocks in InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html). Locking read FOR UPDATE được dùng trong transaction; thứ tự khóa thống nhất và transaction ngắn giúp giảm deadlock. Đây là căn cứ cơ chế, không phải bằng chứng schema đã chạy.

## 6 Chỉ mục và báo cáo

Các FK được thêm sau CREATE TABLE; InnoDB có thể tạo index phục vụ FK. Composite indexes được khai báo riêng cho truy vấn phổ biến. Không tạo index cho mọi cột văn bản; LIKE '%từ khóa%' không được coi là đã tối ưu chỉ nhờ B-tree.

Báo cáo tồn tại mốc T: SUM quantity_delta WHERE posted_at <= T, GROUP BY lot_id, location_id, quality_bucket. Tồn hiện tại dùng balances; đối soát định kỳ SUM ledger = balance. Ledger chỉ bắt đầu khi hệ thống vận hành; nhập tồn ban đầu phải có phiếu nguồn. Không thể báo cáo lịch sử trước thời điểm triển khai nếu không nhập dữ liệu lịch sử.

Báo cáo kiểm kê dùng snapshot và số đếm, không lấy balances sau điều chỉnh để thay system_quantity. Báo cáo phiếu lọc theo posted_at chứ không theo ngày tạo bản nháp vì phiên bản này không lưu nháp phiếu.

## 7 DDL nền để chuyển thành migration

DDL sau định nghĩa đầy đủ các bảng trong tài liệu. Không gồm stored procedures/triggers, seed hay bảo đảm các quy tắc liên bảng; service vẫn bắt buộc triển khai phần 4–5. DDL không tự tạo tài khoản MySQL hoặc cấu hình backup.

```sql
CREATE DATABASE IF NOT EXISTS warehouse_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE warehouse_system;
SET time_zone = '+00:00';
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NULL,
  status VARCHAR(20) NOT NULL,
  failed_login_count INT NOT NULL,
  locked_until DATETIME(6) NULL,
  session_version INT NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_users_1 CHECK (status IN ('ACTIVE','LOCKED')),
  CONSTRAINT ck_users_2 CHECK (failed_login_count >= 0),
  CONSTRAINT uq_users_1 UNIQUE (username),
  CONSTRAINT uq_users_2 UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_roles_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_user_roles_1 UNIQUE (user_id, role_id)
) ENGINE=InnoDB;

CREATE TABLE customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(500) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_customers_1 UNIQUE (user_id),
  CONSTRAINT uq_customers_2 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE workshops (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_workshops_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE workshop_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  workshop_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_workshop_users_1 UNIQUE (workshop_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE suppliers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(254) NULL,
  address VARCHAR(500) NULL,
  tax_code VARCHAR(30) NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_suppliers_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE warehouses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_warehouses_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE warehouse_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_warehouse_locations_1 UNIQUE (warehouse_id, code)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_categories_1 UNIQUE (code),
  CONSTRAINT uq_categories_2 UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(80) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_units_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  unit_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(150) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  description TEXT NULL,
  reference_price DECIMAL(19,4) NOT NULL,
  is_sample BOOLEAN NOT NULL,
  image_path VARCHAR(500) NULL,
  is_published BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_items_1 CHECK (kind IN ('MATERIAL','FINISHED_PRODUCT')),
  CONSTRAINT ck_items_2 CHECK (reference_price >= 0),
  CONSTRAINT uq_items_1 UNIQUE (code),
  CONSTRAINT uq_items_2 UNIQUE (category_id, name)
) ENGINE=InnoDB;

CREATE TABLE customer_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  latest_delivery_date DATE NOT NULL,
  note TEXT NULL,
  status VARCHAR(30) NOT NULL,
  received_by BIGINT UNSIGNED NULL,
  received_at DATETIME(6) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME(6) NULL,
  rejection_reason TEXT NULL,
  quoted_total DECIMAL(19,4) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_customer_orders_1 CHECK (status IN ('SUBMITTED','RECEIVED','APPROVED','REJECTED','IN_PROGRESS','COMPLETED')),
  CONSTRAINT ck_customer_orders_2 CHECK (quoted_total >= 0),
  CONSTRAINT uq_customer_orders_1 UNIQUE (code),
  INDEX ix_customer_orders_1 (customer_id, status, created_at),
  INDEX ix_customer_orders_2 (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE customer_order_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_order_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_price DECIMAL(19,4) NOT NULL,
  note TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_customer_order_lines_1 CHECK (quantity > 0),
  CONSTRAINT ck_customer_order_lines_2 CHECK (unit_price >= 0),
  CONSTRAINT uq_customer_order_lines_1 UNIQUE (customer_order_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE business_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  type VARCHAR(10) NOT NULL,
  supplier_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  customer_order_id BIGINT UNSIGNED NULL,
  planned_date DATE NOT NULL,
  note TEXT NULL,
  status VARCHAR(30) NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME(6) NULL,
  rejection_reason TEXT NULL,
  total_amount DECIMAL(19,4) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_business_plans_1 CHECK (type IN ('PURCHASE','SALE')),
  CONSTRAINT ck_business_plans_2 CHECK (status IN ('PENDING_APPROVAL','APPROVED','REJECTED','IN_PROGRESS','COMPLETED','CANCELLED')),
  CONSTRAINT ck_business_plans_3 CHECK (total_amount >= 0),
  CONSTRAINT ck_business_plans_4 CHECK ((type='PURCHASE' AND supplier_id IS NOT NULL AND customer_id IS NULL AND customer_order_id IS NULL) OR (type='SALE' AND supplier_id IS NULL AND customer_id IS NOT NULL AND customer_order_id IS NOT NULL)),
  CONSTRAINT uq_business_plans_1 UNIQUE (code),
  INDEX ix_business_plans_1 (type, status, planned_date)
) ENGINE=InnoDB;

CREATE TABLE business_plan_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_plan_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_price DECIMAL(19,4) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_business_plan_lines_1 CHECK (quantity > 0),
  CONSTRAINT ck_business_plan_lines_2 CHECK (unit_price >= 0),
  CONSTRAINT uq_business_plan_lines_1 UNIQUE (business_plan_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE purchase_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  business_plan_id BIGINT UNSIGNED NOT NULL,
  supplier_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  expected_delivery_date DATE NOT NULL,
  delivery_terms TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  total_amount DECIMAL(19,4) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_purchase_orders_1 CHECK (status IN ('PENDING','PARTIALLY_RECEIVED','RECEIVED','CANCELLED')),
  CONSTRAINT ck_purchase_orders_2 CHECK (total_amount >= 0),
  CONSTRAINT uq_purchase_orders_1 UNIQUE (code),
  CONSTRAINT uq_purchase_orders_2 UNIQUE (business_plan_id)
) ENGINE=InnoDB;

CREATE TABLE purchase_order_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  business_plan_line_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_price DECIMAL(19,4) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_purchase_order_lines_1 CHECK (quantity > 0),
  CONSTRAINT ck_purchase_order_lines_2 CHECK (unit_price >= 0),
  CONSTRAINT uq_purchase_order_lines_1 UNIQUE (purchase_order_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE production_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  customer_order_id BIGINT UNSIGNED NOT NULL,
  workshop_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_production_plans_1 CHECK (end_date >= start_date),
  CONSTRAINT ck_production_plans_2 CHECK (status IN ('DRAFT','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED')),
  CONSTRAINT uq_production_plans_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE production_plan_outputs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  production_plan_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_production_plan_outputs_1 CHECK (quantity > 0),
  CONSTRAINT uq_production_plan_outputs_1 UNIQUE (production_plan_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE production_plan_materials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  production_plan_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  required_quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_production_plan_materials_1 CHECK (required_quantity > 0),
  CONSTRAINT uq_production_plan_materials_1 UNIQUE (production_plan_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE lots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  purchase_order_line_id BIGINT UNSIGNED NULL,
  production_plan_id BIGINT UNSIGNED NULL,
  manufactured_date DATE NULL,
  expiry_date DATE NULL,
  received_quantity DECIMAL(18,3) NOT NULL,
  qc_status VARCHAR(20) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_lots_1 CHECK (received_quantity > 0),
  CONSTRAINT ck_lots_2 CHECK (qc_status IN ('PENDING','PASSED','PARTIAL','FAILED')),
  CONSTRAINT ck_lots_3 CHECK (expiry_date IS NULL OR manufactured_date IS NULL OR expiry_date >= manufactured_date),
  CONSTRAINT ck_lots_4 CHECK ((purchase_order_line_id IS NOT NULL AND production_plan_id IS NULL) OR (purchase_order_line_id IS NULL AND production_plan_id IS NOT NULL)),
  CONSTRAINT uq_lots_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE qc_inspections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  inspector_id BIGINT UNSIGNED NOT NULL,
  inspected_at DATETIME(6) NOT NULL,
  note TEXT NULL,
  status VARCHAR(20) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_qc_inspections_1 CHECK (status IN ('RECORDED','VOID')),
  CONSTRAINT uq_qc_inspections_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE qc_inspection_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  qc_inspection_id BIGINT UNSIGNED NOT NULL,
  lot_id BIGINT UNSIGNED NOT NULL,
  inspected_quantity DECIMAL(18,3) NOT NULL,
  passed_quantity DECIMAL(18,3) NOT NULL,
  failed_quantity DECIMAL(18,3) NOT NULL,
  issue TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_qc_inspection_lines_1 CHECK (inspected_quantity > 0),
  CONSTRAINT ck_qc_inspection_lines_2 CHECK (passed_quantity >= 0),
  CONSTRAINT ck_qc_inspection_lines_3 CHECK (failed_quantity >= 0),
  CONSTRAINT ck_qc_inspection_lines_4 CHECK (inspected_quantity = passed_quantity + failed_quantity),
  CONSTRAINT uq_qc_inspection_lines_1 UNIQUE (qc_inspection_id, lot_id),
  CONSTRAINT uq_qc_inspection_lines_2 UNIQUE (lot_id)
) ENGINE=InnoDB;

CREATE TABLE stock_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  type VARCHAR(10) NOT NULL,
  purpose VARCHAR(30) NOT NULL,
  purchase_order_id BIGINT UNSIGNED NULL,
  business_plan_id BIGINT UNSIGNED NULL,
  production_plan_id BIGINT UNSIGNED NULL,
  workshop_id BIGINT UNSIGNED NOT NULL,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  requested_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stock_requests_1 CHECK (status IN ('PENDING','PARTIALLY_FULFILLED','FULFILLED','CANCELLED')),
  CONSTRAINT ck_stock_requests_2 CHECK ((purpose='PURCHASE_RECEIPT' AND type='IN' AND purchase_order_id IS NOT NULL AND business_plan_id IS NULL AND production_plan_id IS NULL) OR (purpose='SALE_ISSUE' AND type='OUT' AND purchase_order_id IS NULL AND business_plan_id IS NOT NULL AND production_plan_id IS NULL) OR (purpose='PRODUCTION_ISSUE' AND type='OUT' AND purchase_order_id IS NULL AND business_plan_id IS NULL AND production_plan_id IS NOT NULL) OR (purpose='PRODUCTION_RECEIPT' AND type='IN' AND purchase_order_id IS NULL AND business_plan_id IS NULL AND production_plan_id IS NOT NULL)),
  CONSTRAINT uq_stock_requests_1 UNIQUE (code),
  INDEX ix_stock_requests_1 (warehouse_id, type, status),
  INDEX ix_stock_requests_2 (created_by, created_at)
) ENGINE=InnoDB;

CREATE TABLE stock_request_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stock_request_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  note TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stock_request_lines_1 CHECK (quantity > 0),
  CONSTRAINT uq_stock_request_lines_1 UNIQUE (stock_request_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE stock_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  type VARCHAR(10) NOT NULL,
  stock_request_id BIGINT UNSIGNED NOT NULL,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  posted_by BIGINT UNSIGNED NOT NULL,
  posted_at DATETIME(6) NOT NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT NULL,
  idempotency_key VARCHAR(100) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stock_documents_1 CHECK (type IN ('IN','OUT')),
  CONSTRAINT ck_stock_documents_2 CHECK (status='POSTED'),
  CONSTRAINT uq_stock_documents_1 UNIQUE (code),
  CONSTRAINT uq_stock_documents_2 UNIQUE (idempotency_key),
  INDEX ix_stock_documents_1 (warehouse_id, type, posted_at)
) ENGINE=InnoDB;

CREATE TABLE stock_document_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stock_document_id BIGINT UNSIGNED NOT NULL,
  stock_request_line_id BIGINT UNSIGNED NOT NULL,
  lot_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  quality_bucket VARCHAR(20) NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  difference_reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stock_document_lines_1 CHECK (quantity > 0),
  CONSTRAINT ck_stock_document_lines_2 CHECK (quality_bucket IN ('AVAILABLE','QUARANTINE')),
  CONSTRAINT uq_stock_document_lines_1 UNIQUE (stock_document_id, stock_request_line_id, lot_id, location_id, quality_bucket)
) ENGINE=InnoDB;

CREATE TABLE inventory_balances (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lot_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  quality_bucket VARCHAR(20) NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_inventory_balances_1 CHECK (quantity >= 0),
  CONSTRAINT ck_inventory_balances_2 CHECK (quality_bucket IN ('AVAILABLE','QUARANTINE')),
  CONSTRAINT uq_inventory_balances_1 UNIQUE (lot_id, location_id, quality_bucket)
) ENGINE=InnoDB;

CREATE TABLE stocktakes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  planned_date DATE NOT NULL,
  start_at DATETIME(6) NULL,
  end_at DATETIME(6) NULL,
  item_kind VARCHAR(20) NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stocktakes_1 CHECK (status IN ('PLANNED','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED')),
  CONSTRAINT ck_stocktakes_2 CHECK (item_kind IS NULL OR item_kind IN ('MATERIAL','FINISHED_PRODUCT')),
  CONSTRAINT uq_stocktakes_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE stocktake_warehouses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stocktake_id BIGINT UNSIGNED NOT NULL,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  snapshot_at DATETIME(6) NULL,
  completed_at DATETIME(6) NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stocktake_warehouses_1 CHECK (status IN ('PLANNED','COUNTING','COMPLETED','CLOSED')),
  CONSTRAINT uq_stocktake_warehouses_1 UNIQUE (stocktake_id, warehouse_id)
) ENGINE=InnoDB;

CREATE TABLE stocktake_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stocktake_warehouse_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_stocktake_assignments_1 UNIQUE (stocktake_warehouse_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE stocktake_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stocktake_warehouse_id BIGINT UNSIGNED NOT NULL,
  lot_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  quality_bucket VARCHAR(20) NOT NULL,
  system_quantity DECIMAL(18,3) NOT NULL,
  actual_quantity DECIMAL(18,3) NULL,
  counted_by BIGINT UNSIGNED NULL,
  counted_at DATETIME(6) NULL,
  cause TEXT NULL,
  resolution_status VARCHAR(30) NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stocktake_lines_1 CHECK (system_quantity >= 0),
  CONSTRAINT ck_stocktake_lines_2 CHECK (actual_quantity IS NULL OR actual_quantity >= 0),
  CONSTRAINT ck_stocktake_lines_3 CHECK (quality_bucket IN ('AVAILABLE','QUARANTINE')),
  CONSTRAINT ck_stocktake_lines_4 CHECK (resolution_status IN ('NONE','PENDING_APPROVAL','RESOLVED')),
  CONSTRAINT uq_stocktake_lines_1 UNIQUE (stocktake_warehouse_id, lot_id, location_id, quality_bucket)
) ENGINE=InnoDB;

CREATE TABLE stocktake_minutes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  stocktake_warehouse_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  remarks TEXT NOT NULL,
  submitted_at DATETIME(6) NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_stocktake_minutes_1 CHECK (status IN ('DRAFT','SUBMITTED')),
  CONSTRAINT uq_stocktake_minutes_1 UNIQUE (code),
  CONSTRAINT uq_stocktake_minutes_2 UNIQUE (stocktake_warehouse_id)
) ENGINE=InnoDB;

CREATE TABLE exception_proposals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  type VARCHAR(30) NOT NULL,
  qc_inspection_line_id BIGINT UNSIGNED NULL,
  stocktake_line_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  action VARCHAR(30) NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  reason TEXT NOT NULL,
  resolution_note TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME(6) NULL,
  rejection_reason TEXT NULL,
  applied_at DATETIME(6) NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_exception_proposals_1 CHECK (quantity > 0),
  CONSTRAINT ck_exception_proposals_2 CHECK (type IN ('QC_FAILURE','STOCKTAKE_DIFFERENCE')),
  CONSTRAINT ck_exception_proposals_3 CHECK (action IN ('ADJUST_TO_ACTUAL','SCRAP','RETURN_SUPPLIER','RELEASE')),
  CONSTRAINT ck_exception_proposals_4 CHECK (status IN ('PENDING_APPROVAL','APPROVED','REJECTED','APPLIED')),
  CONSTRAINT ck_exception_proposals_5 CHECK ((type='QC_FAILURE' AND qc_inspection_line_id IS NOT NULL AND stocktake_line_id IS NULL) OR (type='STOCKTAKE_DIFFERENCE' AND qc_inspection_line_id IS NULL AND stocktake_line_id IS NOT NULL)),
  CONSTRAINT uq_exception_proposals_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE exception_allocations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  exception_proposal_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_exception_allocations_1 CHECK (quantity > 0),
  CONSTRAINT uq_exception_allocations_1 UNIQUE (exception_proposal_id, location_id)
) ENGINE=InnoDB;

CREATE TABLE inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lot_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,
  quality_bucket VARCHAR(20) NOT NULL,
  quantity_delta DECIMAL(18,3) NOT NULL,
  stock_document_line_id BIGINT UNSIGNED NULL,
  exception_proposal_id BIGINT UNSIGNED NULL,
  stocktake_line_id BIGINT UNSIGNED NULL,
  posted_at DATETIME(6) NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  operation_key VARCHAR(150) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_inventory_movements_1 CHECK (quantity_delta <> 0),
  CONSTRAINT ck_inventory_movements_2 CHECK (quality_bucket IN ('AVAILABLE','QUARANTINE')),
  CONSTRAINT ck_inventory_movements_3 CHECK ((stock_document_line_id IS NOT NULL) + (exception_proposal_id IS NOT NULL) + (stocktake_line_id IS NOT NULL) = 1),
  CONSTRAINT uq_inventory_movements_1 UNIQUE (operation_key),
  INDEX ix_inventory_movements_1 (lot_id, location_id, posted_at),
  INDEX ix_inventory_movements_2 (posted_at)
) ENGINE=InnoDB;

CREATE TABLE tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  start_at DATETIME(6) NOT NULL,
  end_at DATETIME(6) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  stocktake_id BIGINT UNSIGNED NULL,
  purchase_order_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_tasks_1 CHECK (end_at > start_at),
  CONSTRAINT ck_tasks_2 CHECK (priority IN ('LOW','NORMAL','HIGH')),
  CONSTRAINT ck_tasks_3 CHECK (status IN ('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  CONSTRAINT uq_tasks_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE task_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_task_assignments_1 UNIQUE (task_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE production_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  production_plan_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  note TEXT NULL,
  status VARCHAR(20) NOT NULL,
  submitted_at DATETIME(6) NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_production_reports_1 CHECK (status IN ('DRAFT','SUBMITTED')),
  CONSTRAINT uq_production_reports_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE production_report_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  production_report_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  available_quantity DECIMAL(18,3) NOT NULL,
  required_quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_production_report_lines_1 CHECK (available_quantity >= 0),
  CONSTRAINT ck_production_report_lines_2 CHECK (required_quantity > 0),
  CONSTRAINT uq_production_report_lines_1 UNIQUE (production_report_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE finished_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  production_plan_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  completed_date DATE NOT NULL,
  note TEXT NULL,
  status VARCHAR(20) NOT NULL,
  submitted_at DATETIME(6) NULL,
  version INT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_finished_reports_1 CHECK (status IN ('DRAFT','SUBMITTED')),
  CONSTRAINT uq_finished_reports_1 UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE finished_report_outputs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  finished_report_id BIGINT UNSIGNED NOT NULL,
  lot_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_finished_report_outputs_1 CHECK (quantity > 0),
  CONSTRAINT uq_finished_report_outputs_1 UNIQUE (finished_report_id, lot_id),
  CONSTRAINT uq_finished_report_outputs_2 UNIQUE (lot_id)
) ENGINE=InnoDB;

CREATE TABLE finished_report_materials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  finished_report_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  used_quantity DECIMAL(18,3) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_finished_report_materials_1 CHECK (used_quantity > 0),
  CONSTRAINT uq_finished_report_materials_1 UNIQUE (finished_report_id, item_id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id BIGINT UNSIGNED NOT NULL,
  read_at DATETIME(6) NULL,
  business_key VARCHAR(150) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_notifications_1 UNIQUE (user_id, business_key),
  INDEX ix_notifications_1 (user_id, read_at, created_at)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  request_id VARCHAR(50) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX ix_audit_logs_1 (resource_type, resource_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE idempotency_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  operation VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(100) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response_status SMALLINT NOT NULL,
  response_body JSON NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_idempotency_records_1 UNIQUE (user_id, operation, idempotency_key)
) ENGINE=InnoDB;

ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customers ADD CONSTRAINT fk_customers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE workshop_users ADD CONSTRAINT fk_workshop_users_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE workshop_users ADD CONSTRAINT fk_workshop_users_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE warehouse_locations ADD CONSTRAINT fk_warehouse_locations_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE items ADD CONSTRAINT fk_items_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE items ADD CONSTRAINT fk_items_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer_orders ADD CONSTRAINT fk_customer_orders_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer_orders ADD CONSTRAINT fk_customer_orders_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer_orders ADD CONSTRAINT fk_customer_orders_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer_order_lines ADD CONSTRAINT fk_customer_order_lines_customer_order_id FOREIGN KEY (customer_order_id) REFERENCES customer_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer_order_lines ADD CONSTRAINT fk_customer_order_lines_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plans ADD CONSTRAINT fk_business_plans_supplier_id FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plans ADD CONSTRAINT fk_business_plans_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plans ADD CONSTRAINT fk_business_plans_customer_order_id FOREIGN KEY (customer_order_id) REFERENCES customer_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plans ADD CONSTRAINT fk_business_plans_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plans ADD CONSTRAINT fk_business_plans_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plan_lines ADD CONSTRAINT fk_business_plan_lines_business_plan_id FOREIGN KEY (business_plan_id) REFERENCES business_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE business_plan_lines ADD CONSTRAINT fk_business_plan_lines_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_business_plan_id FOREIGN KEY (business_plan_id) REFERENCES business_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_supplier_id FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_order_lines ADD CONSTRAINT fk_purchase_order_lines_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_order_lines ADD CONSTRAINT fk_purchase_order_lines_business_plan_line_id FOREIGN KEY (business_plan_line_id) REFERENCES business_plan_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE purchase_order_lines ADD CONSTRAINT fk_purchase_order_lines_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plans ADD CONSTRAINT fk_production_plans_customer_order_id FOREIGN KEY (customer_order_id) REFERENCES customer_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plans ADD CONSTRAINT fk_production_plans_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plans ADD CONSTRAINT fk_production_plans_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plan_outputs ADD CONSTRAINT fk_production_plan_outputs_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plan_outputs ADD CONSTRAINT fk_production_plan_outputs_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plan_materials ADD CONSTRAINT fk_production_plan_materials_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_plan_materials ADD CONSTRAINT fk_production_plan_materials_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE lots ADD CONSTRAINT fk_lots_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE lots ADD CONSTRAINT fk_lots_purchase_order_line_id FOREIGN KEY (purchase_order_line_id) REFERENCES purchase_order_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE lots ADD CONSTRAINT fk_lots_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE qc_inspections ADD CONSTRAINT fk_qc_inspections_inspector_id FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE qc_inspection_lines ADD CONSTRAINT fk_qc_inspection_lines_qc_inspection_id FOREIGN KEY (qc_inspection_id) REFERENCES qc_inspections(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE qc_inspection_lines ADD CONSTRAINT fk_qc_inspection_lines_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_business_plan_id FOREIGN KEY (business_plan_id) REFERENCES business_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_requests ADD CONSTRAINT fk_stock_requests_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_request_lines ADD CONSTRAINT fk_stock_request_lines_stock_request_id FOREIGN KEY (stock_request_id) REFERENCES stock_requests(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_request_lines ADD CONSTRAINT fk_stock_request_lines_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_documents ADD CONSTRAINT fk_stock_documents_stock_request_id FOREIGN KEY (stock_request_id) REFERENCES stock_requests(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_documents ADD CONSTRAINT fk_stock_documents_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_documents ADD CONSTRAINT fk_stock_documents_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_document_lines ADD CONSTRAINT fk_stock_document_lines_stock_document_id FOREIGN KEY (stock_document_id) REFERENCES stock_documents(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_document_lines ADD CONSTRAINT fk_stock_document_lines_stock_request_line_id FOREIGN KEY (stock_request_line_id) REFERENCES stock_request_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_document_lines ADD CONSTRAINT fk_stock_document_lines_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stock_document_lines ADD CONSTRAINT fk_stock_document_lines_location_id FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_balances ADD CONSTRAINT fk_inventory_balances_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_balances ADD CONSTRAINT fk_inventory_balances_location_id FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktakes ADD CONSTRAINT fk_stocktakes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_warehouses ADD CONSTRAINT fk_stocktake_warehouses_stocktake_id FOREIGN KEY (stocktake_id) REFERENCES stocktakes(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_warehouses ADD CONSTRAINT fk_stocktake_warehouses_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_assignments ADD CONSTRAINT fk_stocktake_assignments_stocktake_warehouse_id FOREIGN KEY (stocktake_warehouse_id) REFERENCES stocktake_warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_assignments ADD CONSTRAINT fk_stocktake_assignments_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_lines ADD CONSTRAINT fk_stocktake_lines_stocktake_warehouse_id FOREIGN KEY (stocktake_warehouse_id) REFERENCES stocktake_warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_lines ADD CONSTRAINT fk_stocktake_lines_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_lines ADD CONSTRAINT fk_stocktake_lines_location_id FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_lines ADD CONSTRAINT fk_stocktake_lines_counted_by FOREIGN KEY (counted_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_minutes ADD CONSTRAINT fk_stocktake_minutes_stocktake_warehouse_id FOREIGN KEY (stocktake_warehouse_id) REFERENCES stocktake_warehouses(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE stocktake_minutes ADD CONSTRAINT fk_stocktake_minutes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_proposals ADD CONSTRAINT fk_exception_proposals_qc_inspection_line_id FOREIGN KEY (qc_inspection_line_id) REFERENCES qc_inspection_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_proposals ADD CONSTRAINT fk_exception_proposals_stocktake_line_id FOREIGN KEY (stocktake_line_id) REFERENCES stocktake_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_proposals ADD CONSTRAINT fk_exception_proposals_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_proposals ADD CONSTRAINT fk_exception_proposals_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_allocations ADD CONSTRAINT fk_exception_allocations_exception_proposal_id FOREIGN KEY (exception_proposal_id) REFERENCES exception_proposals(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE exception_allocations ADD CONSTRAINT fk_exception_allocations_location_id FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_location_id FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_stock_document_line_id FOREIGN KEY (stock_document_line_id) REFERENCES stock_document_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_exception_proposal_id FOREIGN KEY (exception_proposal_id) REFERENCES exception_proposals(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_stocktake_line_id FOREIGN KEY (stocktake_line_id) REFERENCES stocktake_lines(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_movements_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_stocktake_id FOREIGN KEY (stocktake_id) REFERENCES stocktakes(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE task_assignments ADD CONSTRAINT fk_task_assignments_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE task_assignments ADD CONSTRAINT fk_task_assignments_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_reports ADD CONSTRAINT fk_production_reports_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_reports ADD CONSTRAINT fk_production_reports_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_report_lines ADD CONSTRAINT fk_production_report_lines_production_report_id FOREIGN KEY (production_report_id) REFERENCES production_reports(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE production_report_lines ADD CONSTRAINT fk_production_report_lines_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_reports ADD CONSTRAINT fk_finished_reports_production_plan_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_reports ADD CONSTRAINT fk_finished_reports_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_report_outputs ADD CONSTRAINT fk_finished_report_outputs_finished_report_id FOREIGN KEY (finished_report_id) REFERENCES finished_reports(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_report_outputs ADD CONSTRAINT fk_finished_report_outputs_lot_id FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_report_materials ADD CONSTRAINT fk_finished_report_materials_finished_report_id FOREIGN KEY (finished_report_id) REFERENCES finished_reports(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE finished_report_materials ADD CONSTRAINT fk_finished_report_materials_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_actor_id FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE idempotency_records ADD CONSTRAINT fk_idempotency_records_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
```

## 8 Seed và kiểm tra migration

Thứ tự seed: roles → users/user_roles → customers/workshops/workshop_users → units/categories/items → warehouses/locations/suppliers → chứng từ mẫu qua service. Cờ is_active/is_published/is_sample, các version và counter phải được seed/service gán cụ thể vì DDL không ngầm mặc định nghiệp vụ cho các cột này.

Seed role codes đúng SRS. Không dùng cùng một tài khoản để nghiệm thu mọi vai trò vì có thể che lỗi RBAC. Tài khoản demo không được coi là dữ liệu thật.

Trước triển khai: chạy migration trên MySQL target, kiểm tra FK/CHECK/UNIQUE, thử insert số lượng âm, nguồn mâu thuẫn, parent bị xóa, rollback, race nhập/xuất, đối soát ledger và backup/restore. Tài liệu đã kiểm tra cấu trúc và tham chiếu bằng script; chưa chạy DDL trên MySQL tại thời điểm bàn giao.
