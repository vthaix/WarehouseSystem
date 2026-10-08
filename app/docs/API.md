# Thiết kế MVC và đặc tả route API hệ thống quản lý kho

**Trạng thái triển khai Docker/MySQL:** đây là hợp đồng thiết kế, không phải toàn bộ endpoint đã dùng SQL. Xem [MODULE_MATRIX.md](MODULE_MATRIX.md); module pending trả 501 sau kiểm tra quyền. Nền tảng auth/catalog đọc/notifications đã hoạt động trên MySQL.

**Phiên bản:** 1.0 — bản thiết kế để triển khai và rà soát.  
**Ngày:** 08/10/2026.  
**Nguồn:** Báo cáo Tuần 6 Warehouse Team có nhận xét của giáo viên, gồm 48 đặc tả UC.  
**Định hướng đã xác nhận:** ứng dụng nguyên khối, mô hình MVC, CSDL MySQL, có giao diện.  
**Công nghệ người dùng đã chọn:** Express MVC + EJS, toàn bộ ứng dụng trong `app/`, controllers tách Web và API. MySQL được chuẩn bị cho bước CSDL tiếp theo; hiện dùng repository bộ nhớ. Xem [ARCHITECTURE.md](ARCHITECTURE.md) và [IMPLEMENTATION.md](IMPLEMENTATION.md) để đối chiếu bản triển khai.

Quy ước: **[GỐC]** là nghiệp vụ lấy từ đặc tả; **[ĐỀ XUẤT]** là quyết định bổ sung để có thể xây dựng chương trình; **[CẦN CHỐT]** là điểm chưa đủ thông tin. Các đề xuất được dùng nhất quán trong bốn tài liệu nhưng chưa có nghĩa đã được giáo viên hoặc chủ hệ thống phê duyệt.

## 1 Kiến trúc ứng dụng

[ĐỀ XUẤT] Một ứng dụng MVC cùng origin, View render trên server và JavaScript gọi API cho bảng/form tương tác; một MySQL, một cấu hình triển khai. UI và API gọi cùng service nghiệp vụ. Chưa khóa vào framework; nếu chọn Laravel thì Controller/FormRequest/Policy/Model/Service/View có thể ánh xạ theo tên tương đương; không cần chia microservice.

| Thành phần | Trách nhiệm | Không đặt tại đây |
| --- | --- | --- |
| Router/Middleware | Định tuyến, session, CSRF, request_id, rate limit | Tính tồn, tính giá |
| Controller | Nhận dữ liệu đã validate, gọi policy/service, trả JSON hoặc view | SQL tự do, transaction phân tán qua nhiều controller |
| Request/Validator | Kiểu dữ liệu, required, enum, độ dài; báo lỗi theo field | Quyết định duyệt hoặc tồn cuối cùng |
| Policy/Scope | Vai trò và phạm vi bản ghi/xưởng/kho | Chỉ kiểm tra nút ẩn trên frontend |
| Service | Quy tắc SRS, state machine, transaction, lock, audit, idempotency | Render HTML |
| Model/Repository | ORM/query, quan hệ, thao tác dữ liệu trong transaction | Chọn thông báo hoặc điều hướng UI |
| View/Presenter | Layout, form, table; định dạng ngày/số; trạng thái nút | Tự sửa inventory_balances |

Thư mục đề xuất: app/Controllers/Web, app/Controllers/Api, app/Requests, app/Policies, app/Services, app/Models, app/Repositories (chỉ khi cần), app/Support; routes/web và routes/api; views theo module; database/migrations và database/seeders; tests/features và tests/integration. Đây là danh sách logic trung lập framework, không phải cấu trúc code đã có.

Modules: Auth, Catalog, CustomerOrder, BusinessPlan, Purchasing, Production, Quality, StockRequest, Warehouse, Stocktake, Exception, Task, Reporting, Notification. Mỗi module có controller, validator, policy và service riêng; có thể nằm cùng app, không buộc tạo package độc lập.

## 2 Phiên đăng nhập và bảo vệ request

Session cookie cùng origin, HttpOnly, SameSite=Lax và Secure khi HTTPS. Login chống CSRF bằng token trên form đăng nhập; sau thành công rotate session ID. API dùng cookie session, không dùng JWT chỉ vì có API. Web render meta csrf-token hoặc endpoint framework tương đương để JS gửi X-CSRF-Token.

Frontend gửi credentials cùng origin. Mutation POST/PATCH/DELETE phải có CSRF hợp lệ; GET không làm thay đổi nghiệp vụ. Tài khoản LOCKED/hết phiên/thu hồi session_version bị chặn. Đăng xuất hủy phiên; không ghi token vào localStorage. Cấu hình timeout/rate limit lấy NFR SRS.

## 3 Quy ước HTTP

Base URL `/api/v1`; path trong bảng dưới đây là phần nối sau base. Dùng Content-Type application/json cho request có body. GET dùng query, không body. DELETE resource có version gửi body version và phải được kiểm tra proxy/framework hỗ trợ; nếu môi trường không hỗ trợ, đổi nhất quán sang POST /{id}/cancel, không duy trì hai cách mutation độc lập.

ID là số nguyên dương, output trả chuỗi ID để không gặp giới hạn số JavaScript. Ngày DATE là YYYY-MM-DD; datetime ISO8601 có offset; server trả UTC kết thúc Z. DECIMAL luôn là chuỗi như "12.500", tiền "100000.0000". Các array tối đa được nêu trong contract; string note mặc định tối đa 5000, reason 2000, query 150. Không nhận field ngoài allowlist; tránh mass assignment status/created_by/customer_id.

| HTTP | Trường hợp |
| --- | --- |
| 200 | GET, PATCH, xử lý action thành công; POST ghi sổ replay trả nguyên status ban đầu |
| 201 | Tạo tài nguyên mới; Location trỏ API resource vừa tạo |
| 204 | DELETE/hủy hoặc logout thành công, không body |
| 400 | JSON hỏng, query không hợp lệ cấu trúc |
| 401 | Chưa đăng nhập hoặc phiên hết hạn |
| 403 | Không có quyền hoặc CSRF sai |
| 404 | Không tồn tại hoặc nằm ngoài phạm vi được phép biết |
| 409 | Version lỗi thời, sai trạng thái, tồn thay đổi, trùng xử lý, lịch trùng hoặc kho đóng băng |
| 422 | Validation nghiệp vụ/field, mã/tên trùng khi tạo, vượt số nguồn đã biết |
| 429 | Vượt giới hạn đăng nhập/request |
| 500 | Lỗi ngoài dự kiến, rollback, thông báo chung và request_id |

Mẫu success: `{ "data": { ... }, "meta": { "request_id": "..." } }`. List thêm `meta.page`, `per_page`, `total`, `total_pages`; rỗng trả data=[] và total=0, không trả 404.

Mẫu lỗi:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vui lòng kiểm tra thông tin",
    "fields": {"lines.0.quantity": ["Số lượng phải lớn hơn 0"]}
  },
  "meta": {"request_id": "req-..."}
}
```

Các mã lỗi thống nhất: VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, CSRF_INVALID, NOT_FOUND, STALE_VERSION, INVALID_STATE, RESOURCE_IN_USE, INSUFFICIENT_STOCK, WAREHOUSE_FROZEN, QC_LIMIT_EXCEEDED, SOURCE_LIMIT_EXCEEDED, SCHEDULE_CONFLICT, IDEMPOTENCY_CONFLICT, ALREADY_PROCESSED, INTERNAL_ERROR.

Mutation thành công trả tài nguyên sau thao tác gồm status, version mới và actions được phép; quyền actions chỉ hỗ trợ UI, server vẫn tự kiểm tra request kế tiếp. Tên field output snake_case để khớp CSDL/contract. Lược bỏ password_hash, session_version nội bộ, audit nhạy cảm và thông tin người ngoài phạm vi.

## 4 Danh mục route API

Vai trò trong bảng là allowlist chức năng, sau đó phải áp dụng ownership/scope SRS. INTERNAL_AUTHENTICATED không bao gồm khách hàng và không đồng nghĩa mọi nhân viên đọc mọi lookup. SUP là chức năng hỗ trợ đề xuất ngoài UC gốc.

| STT | Method | Route sau /api/v1 | Vai trò | UC | Contract | Xử lý |
| --- | --- | --- | --- | --- | --- | --- |
| API-001 | POST | `/auth/login` | PUBLIC | UC-01 | LOGIN | Đăng nhập |
| API-002 | POST | `/auth/logout` | AUTHENTICATED | SUP-SESSION | NONE | Đăng xuất và hủy phiên |
| API-003 | GET | `/auth/me` | AUTHENTICATED | UC-01 | NONE | Thông tin người dùng và quyền |
| API-004 | GET | `/customer-orders` | CUSTOMER / PLANNER / DIRECTOR | UC-03, UC-29, UC-31 | LIST | Danh sách theo phạm vi |
| API-005 | POST | `/customer-orders` | CUSTOMER | UC-02 | ORDER | Đặt đơn |
| API-006 | GET | `/customer-orders/{id}` | CUSTOMER / PLANNER / DIRECTOR | UC-03, UC-29, UC-31 | NONE | Chi tiết |
| API-007 | PATCH | `/customer-orders/{id}` | CUSTOMER | UC-03.1 | ORDER_EDIT | Sửa đơn |
| API-008 | POST | `/customer-orders/{id}/receive` | PLANNER | UC-29 | VERSION | Tiếp nhận |
| API-009 | POST | `/customer-orders/{id}/review` | DIRECTOR | UC-31 | REVIEW | Duyệt hoặc từ chối |
| API-010 | GET | `/sample-items` | CUSTOMER | UC-02 | LIST | Danh sách thành phẩm mẫu công khai với khách đã đăng nhập |
| API-011 | GET | `/business-plans` | PLANNER / DIRECTOR / PURCHASER / WORKSHOP_OWNER / WAREHOUSE_STAFF | UC-05, UC-27, UC-32 | LIST | Danh sách |
| API-012 | POST | `/business-plans` | PLANNER | UC-04 | PLAN | Lập kế hoạch |
| API-013 | GET | `/business-plans/{id}` | PLANNER / DIRECTOR / PURCHASER / WORKSHOP_OWNER / WAREHOUSE_STAFF | UC-05, UC-27, UC-32 | NONE | Chi tiết |
| API-014 | PATCH | `/business-plans/{id}` | PLANNER | UC-05.1 | PLAN_EDIT | Sửa |
| API-015 | DELETE | `/business-plans/{id}` | PLANNER | UC-05.2 | VERSION | Hủy |
| API-016 | POST | `/business-plans/{id}/review` | DIRECTOR | UC-32 | REVIEW | Duyệt/từ chối |
| API-017 | GET | `/purchase-orders` | PURCHASER / WORKSHOP_OWNER / WAREHOUSE_STAFF / QC_INSPECTOR | UC-14 | LIST | Danh sách |
| API-018 | GET | `/purchase-orders/{id}` | PURCHASER / WORKSHOP_OWNER / WAREHOUSE_STAFF / QC_INSPECTOR | UC-14 | NONE | Chi tiết |
| API-019 | POST | `/purchase-orders` | PURCHASER | UC-27 | PURCHASE | Tạo từ kế hoạch duyệt |
| API-020 | GET | `/categories` | WAREHOUSE_MANAGER | UC-06 | LIST | Danh mục |
| API-021 | POST | `/categories` | WAREHOUSE_MANAGER | UC-06.1 | CATEGORY | Thêm |
| API-022 | GET | `/categories/{id}` | WAREHOUSE_MANAGER | UC-06 | NONE | Chi tiết |
| API-023 | PATCH | `/categories/{id}` | WAREHOUSE_MANAGER | UC-06.3 | CATEGORY_EDIT | Sửa |
| API-024 | DELETE | `/categories/{id}` | WAREHOUSE_MANAGER | UC-06.2 | NONE | Xóa chưa dùng |
| API-025 | GET | `/warehouses` | WAREHOUSE_MANAGER | UC-07, UC-22 | LIST | Danh sách |
| API-026 | POST | `/warehouses` | WAREHOUSE_MANAGER | UC-07.1 | WAREHOUSE | Thêm |
| API-027 | GET | `/warehouses/{id}` | WAREHOUSE_MANAGER | UC-07, UC-22 | NONE | Chi tiết |
| API-028 | PATCH | `/warehouses/{id}` | WAREHOUSE_MANAGER | UC-07.3 | WAREHOUSE_EDIT | Sửa |
| API-029 | DELETE | `/warehouses/{id}` | WAREHOUSE_MANAGER | UC-07.2 | NONE | Xóa chưa dùng |
| API-030 | GET | `/warehouse-locations` | WAREHOUSE_MANAGER | UC-07, UC-22 | LIST | Danh sách |
| API-031 | POST | `/warehouse-locations` | WAREHOUSE_MANAGER | UC-07.1 | LOCATION | Thêm |
| API-032 | GET | `/warehouse-locations/{id}` | WAREHOUSE_MANAGER | UC-07, UC-22 | NONE | Chi tiết |
| API-033 | PATCH | `/warehouse-locations/{id}` | WAREHOUSE_MANAGER | UC-07.3 | LOCATION_EDIT | Sửa |
| API-034 | DELETE | `/warehouse-locations/{id}` | WAREHOUSE_MANAGER | UC-07.2 | NONE | Xóa chưa dùng |
| API-035 | GET | `/suppliers` | WAREHOUSE_MANAGER | UC-07, UC-22 | LIST | Danh sách |
| API-036 | POST | `/suppliers` | WAREHOUSE_MANAGER | UC-07.1 | SUPPLIER | Thêm |
| API-037 | GET | `/suppliers/{id}` | WAREHOUSE_MANAGER | UC-07, UC-22 | NONE | Chi tiết |
| API-038 | PATCH | `/suppliers/{id}` | WAREHOUSE_MANAGER | UC-07.3 | SUPPLIER_EDIT | Sửa |
| API-039 | DELETE | `/suppliers/{id}` | WAREHOUSE_MANAGER | UC-07.2 | NONE | Xóa chưa dùng |
| API-040 | GET | `/items` | WAREHOUSE_MANAGER | UC-07, UC-22 | LIST | Danh sách |
| API-041 | POST | `/items` | WAREHOUSE_MANAGER | UC-07.1 | ITEM | Thêm |
| API-042 | GET | `/items/{id}` | WAREHOUSE_MANAGER | UC-07, UC-22 | NONE | Chi tiết |
| API-043 | PATCH | `/items/{id}` | WAREHOUSE_MANAGER | UC-07.3 | ITEM_EDIT | Sửa |
| API-044 | DELETE | `/items/{id}` | WAREHOUSE_MANAGER | UC-07.2 | NONE | Xóa chưa dùng |
| API-045 | GET | `/lots` | WAREHOUSE_MANAGER | UC-07, UC-22 | LIST | Danh sách |
| API-046 | POST | `/lots` | WAREHOUSE_MANAGER | UC-07.1 | LOT | Thêm |
| API-047 | GET | `/lots/{id}` | WAREHOUSE_MANAGER | UC-07, UC-22 | NONE | Chi tiết |
| API-048 | PATCH | `/lots/{id}` | WAREHOUSE_MANAGER | UC-07.3 | LOT_EDIT | Sửa |
| API-049 | DELETE | `/lots/{id}` | WAREHOUSE_MANAGER | UC-07.2 | NONE | Xóa chưa dùng |
| API-050 | GET | `/catalog-data` | WAREHOUSE_MANAGER | UC-07, UC-22 | CATALOG_SEARCH | Tra cứu các nhóm dữ liệu, trả type và id |
| API-051 | GET | `/lookup/{resource}` | INTERNAL_AUTHENTICATED | SUP-LOOKUP | LOOKUP | Danh sách chọn theo quyền, resource allowlist |
| API-052 | GET | `/stock-requests` | WORKSHOP_OWNER / WAREHOUSE_STAFF / WAREHOUSE_MANAGER | UC-24, UC-10, UC-11 | LIST | Danh sách |
| API-053 | POST | `/stock-requests` | WORKSHOP_OWNER | UC-23 | STOCK_REQUEST | Gửi yêu cầu |
| API-054 | GET | `/stock-requests/{id}` | WORKSHOP_OWNER / WAREHOUSE_STAFF / WAREHOUSE_MANAGER | UC-24, UC-10, UC-11 | NONE | Chi tiết |
| API-055 | PATCH | `/stock-requests/{id}` | WORKSHOP_OWNER | UC-24.1 | STOCK_REQUEST_EDIT | Sửa |
| API-056 | DELETE | `/stock-requests/{id}` | WORKSHOP_OWNER | UC-24.2 | VERSION | Hủy |
| API-057 | GET | `/stock-requests/{id}/allocations` | WAREHOUSE_STAFF | UC-10, UC-11 | NONE | Gợi ý lô/vị trí, lượng còn có thể ghi sổ |
| API-058 | POST | `/stock-documents` | WAREHOUSE_STAFF | UC-10, UC-11 | POST_STOCK | Ghi sổ nhập hoặc xuất |
| API-059 | GET | `/stock-documents` | WAREHOUSE_MANAGER / WAREHOUSE_STAFF / DIRECTOR / WORKSHOP_OWNER | UC-08, UC-09, UC-19, UC-20 | LIST | Danh sách hồ sơ |
| API-060 | GET | `/stock-documents/{id}` | WAREHOUSE_MANAGER / WAREHOUSE_STAFF / DIRECTOR / WORKSHOP_OWNER | UC-08, UC-09, UC-19, UC-20 | NONE | Chi tiết phiếu bất biến |
| API-061 | GET | `/qc-inspections` | QC_INSPECTOR | UC-12 | LIST | Danh sách |
| API-062 | POST | `/qc-inspections` | QC_INSPECTOR | UC-12.1 | QC | Thêm |
| API-063 | GET | `/qc-inspections/{id}` | QC_INSPECTOR | UC-12 | NONE | Chi tiết |
| API-064 | PATCH | `/qc-inspections/{id}` | QC_INSPECTOR | UC-12.2 | QC_EDIT | Sửa chưa dùng |
| API-065 | DELETE | `/qc-inspections/{id}` | QC_INSPECTOR | UC-12.3 | VERSION | Hủy chưa dùng |
| API-066 | POST | `/stocktakes` | DIRECTOR | UC-13 | STOCKTAKE | Lập đợt, phạm vi, phân công và công việc |
| API-067 | GET | `/stocktakes` | DIRECTOR / STOCKTAKER / WAREHOUSE_MANAGER | UC-13, UC-15, UC-28 | LIST | Danh sách theo phạm vi |
| API-068 | GET | `/stocktakes/{id}` | DIRECTOR / STOCKTAKER / WAREHOUSE_MANAGER | UC-15, UC-28 | NONE | Chi tiết đợt |
| API-069 | POST | `/stocktakes/{id}/start` | DIRECTOR | SUP-STOCKTAKE | VERSION | Khóa kho và chụp snapshot |
| API-070 | GET | `/stocktakes/{id}/warehouses/{warehouse_id}/lines` | STOCKTAKER / DIRECTOR / WAREHOUSE_MANAGER | UC-15, UC-28 | LIST | Các dòng theo kho và lô |
| API-071 | PATCH | `/stocktakes/{id}/warehouses/{warehouse_id}/counts` | STOCKTAKER | UC-15 | COUNTS | Lưu số đếm tạm lên server |
| API-072 | POST | `/stocktakes/{id}/warehouses/{warehouse_id}/complete` | STOCKTAKER | UC-15 | VERSION | Hoàn tất đếm của kho |
| API-073 | GET | `/stocktake-minutes` | STOCKTAKER / DIRECTOR | UC-28, UC-21 | LIST | Danh sách biên bản |
| API-074 | POST | `/stocktake-minutes` | STOCKTAKER | UC-28 | MINUTES | Lưu biên bản theo kho |
| API-075 | GET | `/stocktake-minutes/{id}` | STOCKTAKER / DIRECTOR | UC-28, UC-21 | NONE | Chi tiết |
| API-076 | PATCH | `/stocktake-minutes/{id}` | STOCKTAKER | UC-28 | MINUTES_EDIT | Sửa biên bản nháp |
| API-077 | POST | `/stocktake-minutes/{id}/submit` | STOCKTAKER | UC-28 | VERSION | Gửi biên bản cho giám đốc |
| API-078 | GET | `/stocktake-differences` | WAREHOUSE_MANAGER / DIRECTOR | UC-16 | LIST | Chênh lệch chưa xử lý |
| API-079 | POST | `/exception-proposals` | WAREHOUSE_MANAGER / QC_INSPECTOR | UC-16, SUP-02 | EXCEPTION | Tạo đề xuất xử lý |
| API-080 | GET | `/exception-proposals` | DIRECTOR / WAREHOUSE_MANAGER / QC_INSPECTOR | UC-17, UC-16 | LIST | Danh sách |
| API-081 | GET | `/exception-proposals/{id}` | DIRECTOR / WAREHOUSE_MANAGER / QC_INSPECTOR | UC-17, UC-16 | NONE | Chi tiết |
| API-082 | POST | `/exception-proposals/{id}/review` | DIRECTOR | UC-17 | REVIEW | Duyệt và áp dụng hoặc từ chối |
| API-083 | POST | `/stocktakes/{id}/close` | DIRECTOR | SUP-STOCKTAKE | VERSION | Đóng đợt, mở lại kho sau đối soát |
| API-084 | GET | `/tasks` | DIRECTOR | UC-25 | LIST | Danh sách |
| API-085 | GET | `/tasks/{id}` | DIRECTOR | UC-25 | NONE | Chi tiết |
| API-086 | PATCH | `/tasks/{id}` | DIRECTOR | UC-25.1 | TASK_EDIT | Sửa và phân công |
| API-087 | DELETE | `/tasks/{id}` | DIRECTOR | UC-25.2 | VERSION | Hủy chưa thực hiện |
| API-088 | POST | `/tasks` | DIRECTOR | SUP-03 | TASK | Tạo công việc điều phối |
| API-089 | POST | `/tasks/{id}/progress` | DIRECTOR | SUP-03 | TASK_PROGRESS | Cập nhật tiến độ |
| API-090 | GET | `/production-reports` | WORKSHOP_OWNER / PLANNER | UC-34 | LIST | Danh sách |
| API-091 | POST | `/production-reports` | WORKSHOP_OWNER | UC-34 | PRODUCTION_REPORT | Lưu nháp |
| API-092 | GET | `/production-reports/{id}` | WORKSHOP_OWNER / PLANNER | UC-34 | NONE | Chi tiết |
| API-093 | PATCH | `/production-reports/{id}` | WORKSHOP_OWNER | UC-34 | PRODUCTION_REPORT_EDIT | Sửa nháp |
| API-094 | POST | `/production-reports/{id}/submit` | WORKSHOP_OWNER | UC-34 | VERSION | Gửi báo cáo |
| API-095 | GET | `/finished-reports` | WORKSHOP_OWNER / DIRECTOR | UC-35 | LIST | Danh sách |
| API-096 | POST | `/finished-reports` | WORKSHOP_OWNER | UC-35 | FINISHED_REPORT | Lưu nháp |
| API-097 | GET | `/finished-reports/{id}` | WORKSHOP_OWNER / DIRECTOR | UC-35 | NONE | Chi tiết |
| API-098 | PATCH | `/finished-reports/{id}` | WORKSHOP_OWNER | UC-35 | FINISHED_REPORT_EDIT | Sửa nháp |
| API-099 | POST | `/finished-reports/{id}/submit` | WORKSHOP_OWNER | UC-35 | VERSION | Gửi báo cáo |
| API-100 | GET | `/production-plans` | PLANNER / DIRECTOR / WORKSHOP_OWNER / WAREHOUSE_STAFF | SUP-01 | LIST | Danh sách |
| API-101 | POST | `/production-plans` | PLANNER | SUP-01 | PRODUCTION_PLAN | Lập kế hoạch tối thiểu |
| API-102 | GET | `/production-plans/{id}` | PLANNER / DIRECTOR / WORKSHOP_OWNER / WAREHOUSE_STAFF | SUP-01 | NONE | Chi tiết |
| API-103 | PATCH | `/production-plans/{id}` | PLANNER | SUP-01 | PRODUCTION_PLAN_EDIT | Sửa nháp |
| API-104 | POST | `/production-plans/{id}/review` | DIRECTOR | SUP-01 | REVIEW | Duyệt/từ chối nháp |
| API-105 | GET | `/reports/inventory` | DIRECTOR | UC-18 | REPORT | Báo cáo có điều kiện lọc |
| API-106 | GET | `/reports/inventory/export` | DIRECTOR | UC-18 | REPORT_EXPORT | Xuất CSV cùng phạm vi và điều kiện |
| API-107 | GET | `/reports/stock-documents` | DIRECTOR / WORKSHOP_OWNER | UC-19, UC-20 | REPORT | Báo cáo có điều kiện lọc |
| API-108 | GET | `/reports/stock-documents/export` | DIRECTOR / WORKSHOP_OWNER | UC-19, UC-20 | REPORT_EXPORT | Xuất CSV cùng phạm vi và điều kiện |
| API-109 | GET | `/reports/stocktakes` | DIRECTOR | UC-21 | REPORT | Báo cáo có điều kiện lọc |
| API-110 | GET | `/reports/stocktakes/export` | DIRECTOR | UC-21 | REPORT_EXPORT | Xuất CSV cùng phạm vi và điều kiện |
| API-111 | GET | `/notifications` | AUTHENTICATED | SUP-NOTIFICATION | LIST | Thông báo của người dùng |
| API-112 | PATCH | `/notifications/{id}/read` | AUTHENTICATED | SUP-NOTIFICATION | NONE | Đánh dấu đã đọc |

## 5 Hợp đồng dữ liệu request

### LOGIN

username:string(1..80), password:string(1..128). Không trả password_hash; thành công tạo session, trả user và permissions.

### NONE

Không có body; path id là số nguyên dương. Request đọc không cần Idempotency-Key.

### LIST

Query page:int>=1, per_page:int 1..100 mặc định 20, q:string<=150, status:string thuộc enum, from/to:YYYY-MM-DD, sort:string allowlist. Các filter không có ở resource bị từ chối thay vì biến thành SQL tùy ý.

### VERSION

Body {version:int>=1}; DELETE cũng gửi JSON version nếu resource có version. Mutation dữ liệu lỗi thời trả 409 STALE_VERSION. Với complete theo kho, version là stocktake_warehouses.version; start/close là stocktakes.version; submit dùng version của báo cáo/biên bản; ID và scope từ path phải khớp.

### REVIEW

version:int, decision:APPROVE|REJECT, reason:string 1..2000 bắt buộc khi REJECT. APPROVE không cho thay chi tiết nguồn. Idempotency-Key bắt buộc. Kế hoạch sản xuất REJECT giữ DRAFT, lưu lý do trong audit/notification, không tạo enum REJECTED chưa có trong bảng.

### ORDER

delivery_address:string(1..500), latest_delivery_date:DATE>=hôm nay, note?:string<=5000, lines:[{item_id:int, quantity:decimal_string>0}], ít nhất 1 và tối đa 100 dòng, không trùng item. Server lấy customer từ session, lấy giá hiện hành và tính quoted_total.

### ORDER_EDIT

version:int, delivery_address?:string, latest_delivery_date?:DATE, note?:string, lines?:[{item_id,quantity,note?}], quantity_change_acknowledged:boolean nếu thay số lượng. Body chỉ được sửa trường cho phép, không cho customer_id/status/unit_price. Khi thay lines gửi toàn bộ danh sách mới.

### PLAN

type:PURCHASE|SALE, supplier_id?:int, customer_id?:int, customer_order_id?:int, planned_date:DATE, note?:string, lines:[{item_id:int,quantity:decimal_string>0,unit_price:decimal_string>=0}]. PURCHASE yêu cầu supplier, SALE yêu cầu customer và order phù hợp; tổng server tính.

### PLAN_EDIT

version:int và các trường PLAN được sửa; type/source không đổi khi đã phát sinh chứng từ. Sửa bị từ chối gửi lại chờ duyệt; gửi toàn bộ lines khi thay chi tiết.

### PURCHASE

business_plan_id:int, expected_delivery_date:DATE>=hôm nay, delivery_terms:string 1..5000, lines:[{business_plan_line_id:int,unit_price:decimal_string>=0}]. Supplier/item/quantity lấy từ kế hoạch. Nếu chọn NCC khác sau kế hoạch đã duyệt, không được sửa trực tiếp trong phiên bản MVP: phải hủy/chốt thay đổi kế hoạch theo quy trình bổ sung được duyệt. Không ngầm sửa APPROVED vì BR-09 cấm. Có thể sửa NCC trước lúc duyệt.

### CATEGORY

code:string 1..40 duy nhất, name:string 1..150 duy nhất, description?:string<=5000. is_active mặc định true; mã có thể auto nếu client bỏ code theo cấu hình service.

### CATEGORY_EDIT

name?:string, description?:string, is_active?:boolean. Không sửa code sau khi được dùng; không có version, service khóa row và kiểm tra UNIQUE trong transaction.

### WAREHOUSE

code:string 1..40 duy nhất, name:string 1..150, address?:string<=500, is_active?:boolean mặc định true.

### LOCATION

warehouse_id:int, code:string 1..40 duy nhất trong kho, name:string 1..150, is_active?:boolean. Không đổi kho khi đã dùng.

### SUPPLIER

code:string 1..40 duy nhất, name:string 1..150, phone?:string<=20, email?:email<=254, address?:string<=500, tax_code?:string<=30, is_active?:boolean.

### ITEM

category_id:int, unit_id:int, code:string 1..40 duy nhất, name:string 1..150 duy nhất trong category, kind:MATERIAL|FINISHED_PRODUCT, description?:string, reference_price:decimal_string>=0, is_sample:boolean chỉ true với FINISHED_PRODUCT, is_published:boolean, is_active:boolean. image_path không nhận đường dẫn tùy ý từ client; upload ảnh chưa có route trong MVP, có thể dùng ảnh seed.

### LOT

code:string 1..50 duy nhất, item_id:int, purchase_order_line_id?:int, production_plan_id?:int, manufactured_date?:DATE, expiry_date?:DATE, received_quantity:decimal_string>0. Chính xác một nguồn; type nguồn khớp item.kind. qc_status=PENDING do server, không nhận status client. POST /lots chỉ tạo lô nguyên liệu từ purchase_order_line_id; lô thành phẩm được tạo nguyên tử qua FINISHED_REPORT, từ chối tạo độc lập dù schema LOT có trường production_plan_id cho dùng nội bộ.

### CATALOG_SEARCH

Query resource:warehouses|suppliers|materials|finished-products|lots|inventory, q:string, category_id?:int, warehouse_id?:int, page/per_page. items lọc theo kind; inventory chỉ đọc, không CRUD số dư.

### LOOKUP

Path resource thuộc allowlist: warehouses, warehouse-locations, suppliers, categories, items, lots, units, customers, users, customer-orders, business-plans, purchase-orders, production-plans. Query q, limit<=50, purpose? và parent_id?. Không trả toàn bộ bảng. CUSTOMERS chỉ tra sample-items và hồ sơ chính mình; STOCKTAKER chỉ kho phân công; nội bộ mỗi resource kiểm tra quyền chức năng riêng.

### STOCK_REQUEST

purpose:PURCHASE_RECEIPT|PRODUCTION_RECEIPT|PRODUCTION_ISSUE|SALE_ISSUE, warehouse_id:int, workshop_id:int thuộc phạm vi, requested_date:DATE, purchase_order_id?:int, business_plan_id?:int, production_plan_id?:int, note?:string, lines:[{item_id:int,quantity:decimal_string>0,note?:string}]. Type IN/OUT và nguồn được suy ra/kiểm tra purpose; không nhận status.

### STOCK_REQUEST_EDIT

version:int, requested_date?:DATE, warehouse_id?:int, note?:string, lines?:toàn bộ dòng. Chỉ PENDING, chưa phiếu; không đổi purpose hoặc chứng từ nguồn.

### POST_STOCK

stock_request_id:int, request_version:int, note?:string, allocations:[{stock_request_line_id:int,lot_id:int,location_id:int,quality_bucket:AVAILABLE|QUARANTINE,quantity:decimal_string>0,difference_reason?:string}]. Tối đa 200 phân bổ, không trùng bộ khóa dòng/lô/vị trí/bucket. Type và warehouse server lấy từ request. posted_at server gán thời điểm commit nghiệp vụ, không cho ghi lùi trước snapshot. Idempotency-Key bắt buộc.

### QC

inspected_at:ISO8601 có offset, note?:string, lines:[{lot_id:int,inspected_quantity:decimal_string>0,passed_quantity:decimal_string>=0,failed_quantity:decimal_string>=0,issue?:string}]. inspected=passed+failed=received_quantity; failed>0 yêu cầu issue. inspector từ session.

### QC_EDIT

version:int và các trường QC. Chỉ chưa dùng; khi lines thay gửi toàn bộ. Không sửa inspector/status tùy ý.

### STOCKTAKE

planned_date:DATE>=hôm nay, item_kind?:MATERIAL|FINISHED_PRODUCT, note?:string, warehouses:[{warehouse_id:int,assignee_ids:[int]}], start_at/end_at:ISO8601 cho công việc dự kiến. Mỗi kho có ít nhất một kiểm kê viên, không trùng kho/user trong kho; server tạo tasks và assignments trong cùng transaction.

### COUNTS

lines:[{id:int,version:int,actual_quantity:decimal_string>=0,cause?:string}]. id phải thuộc đợt/kho path; cập nhật cả batch nguyên tử, tối đa 200 dòng; lỗi chỉ rõ dòng. Lưu tạm lên server, không đổi trạng thái complete. Null không được gửi để giả đã đếm.

### MINUTES

stocktake_warehouse_id:int, remarks:string 1..5000. Server kiểm tra kho đã COMPLETED, tạo DRAFT; không nhận system/actual/difference từ client.

### MINUTES_EDIT

version:int, remarks:string 1..5000; chỉ DRAFT.

### EXCEPTION

type:STOCKTAKE_DIFFERENCE|QC_FAILURE, stocktake_line_id?:int, qc_inspection_line_id?:int, action:ADJUST_TO_ACTUAL|SCRAP|RETURN_SUPPLIER, quantity:decimal_string>0, reason:string 1..2000, resolution_note:string 1..5000, allocations?:[{location_id:int,quantity:decimal_string>0}]. Chênh lệch quantity=abs(actual-system), action=ADJUST_TO_ACTUAL; hàng lỗi yêu cầu phân bổ đủ tổng. RELEASE tạm không hỗ trợ.

### TASK

title:string 1..200, description?:string, start_at/end_at:ISO8601, priority:LOW|NORMAL|HIGH, assignee_ids:[int], stocktake_id?:int hoặc purchase_order_id?:int. End>start và không trùng lịch.

### TASK_EDIT

version:int và các trường TASK được phép sửa; không sửa COMPLETED/CANCELLED. Công việc đang thực hiện cho bổ sung người/lùi hạn có kiểm tra lịch, không cho hủy.

### TASK_PROGRESS

version:int, status:IN_PROGRESS|COMPLETED; chỉ chuyển theo SRS, không dùng route này để hủy.

### PRODUCTION_PLAN

customer_order_id:int đã duyệt, workshop_id:int, start_date/end_date:DATE, outputs:[{item_id:int,quantity:decimal_string>0}], materials:[{item_id:int,required_quantity:decimal_string>0}]. Server tạo code và status=DRAFT; chưa suy ra BOM.

### PRODUCTION_PLAN_EDIT

version:int và trường PRODUCTION_PLAN, chỉ DRAFT. Không sửa nguồn sau duyệt.

### PRODUCTION_REPORT

production_plan_id:int, note?:string, lines:[{item_id:int,available_quantity:decimal_string>=0,required_quantity:decimal_string>0}]. Chỉ nguyên liệu thuộc kế hoạch; available là số chủ xưởng báo tại xưởng, không tự ghi đè tồn trung tâm.

### PRODUCTION_REPORT_EDIT

version:int và trường PRODUCTION_REPORT, chỉ DRAFT.

### FINISHED_REPORT

production_plan_id:int, completed_date:DATE, note?:string, outputs:[{item_id:int,lot_code:string,quantity:decimal_string>0,manufactured_date:DATE,expiry_date?:DATE}], materials:[{item_id:int,used_quantity:decimal_string>0}]. Item phải thuộc kế hoạch; service tạo lot PENDING và link outputs nguyên tử, không tăng inventory.

### FINISHED_REPORT_EDIT

version:int và trường FINISHED_REPORT, chỉ DRAFT, các lot chưa QC/chứng từ; sửa output cập nhật lot nguồn đồng bộ.

### REPORT

Query warehouse_id?:int, item_id?:int, kind?:MATERIAL|FINISHED_PRODUCT, lot_id?:int, quality_bucket?:AVAILABLE|QUARANTINE, as_of?:ISO8601 cho inventory; from/to:DATE và type:IN|OUT cho stock-documents; stocktake_id/warehouse_id cho stocktakes. Pagination 20..100. Không chấp nhận from>to, as_of trong tương lai.

### REPORT_EXPORT

Như REPORT, thêm format=csv. Export cùng quyền và filter, không áp dụng page/per_page, tối đa 50.000 dòng; trả text/csv UTF-8 BOM, escape công thức spreadsheet (= + - @ ở đầu text).

### WAREHOUSE_EDIT

PATCH chỉ nhận tập con trường của WAREHOUSE. Khóa row khi cập nhật. Mã/nguồn/đơn vị/kind không đổi sau khi dùng; kiểm tra các ràng buộc tham chiếu. Không cho sửa số dư hoặc QC status.

### LOCATION_EDIT

PATCH chỉ nhận tập con trường của LOCATION. Khóa row khi cập nhật. Mã/nguồn/đơn vị/kind không đổi sau khi dùng; kiểm tra các ràng buộc tham chiếu. Không cho sửa số dư hoặc QC status.

### SUPPLIER_EDIT

PATCH chỉ nhận tập con trường của SUPPLIER. Khóa row khi cập nhật. Mã/nguồn/đơn vị/kind không đổi sau khi dùng; kiểm tra các ràng buộc tham chiếu. Không cho sửa số dư hoặc QC status.

### ITEM_EDIT

PATCH chỉ nhận tập con trường của ITEM. Bắt buộc version:int. Mã/nguồn/đơn vị/kind không đổi sau khi dùng; kiểm tra các ràng buộc tham chiếu. Không cho sửa số dư hoặc QC status.

### LOT_EDIT

PATCH chỉ nhận tập con trường của LOT. Bắt buộc version:int. Mã/nguồn/đơn vị/kind không đổi sau khi dùng; kiểm tra các ràng buộc tham chiếu. Không cho sửa số dư hoặc QC status.

## 6 Dữ liệu response theo nhóm

| Nhóm | Dữ liệu tối thiểu trả về |
| --- | --- |
| Auth | id, username, full_name, roles:[code], permissions:[action], workshop_ids; không trả hash |
| Master data | id, code, name, is_active; item có kind, category, unit, reference_price, is_sample, is_published; lot có nguồn và qc_status; version nếu bảng có |
| CustomerOrder | id, code, customer, delivery_address, latest_delivery_date, quoted_total, status, version, review thông tin, lines:[id,item,quantity,unit_price,note], actions |
| BusinessPlan/PurchaseOrder | id, code, type nếu có, nguồn, đối tác, dates, total_amount, status, version, lines cùng quantity/unit_price, actions |
| StockRequest | id, code, type, purpose, source, warehouse, workshop, requested_date, status, version, lines:[id,item,quantity,fulfilled_quantity,remaining_quantity], actions. fulfilled/remaining là field tính toán |
| Allocation preview | request/version, từng line: remaining, eligible_lots, locations, AVAILABLE/QUARANTINE balances và QC remaining. Chỉ gợi ý, phải kiểm lại lúc ghi sổ |
| StockDocument | id, code, type, request/source, warehouse, posted_by/at, status, lines:[lot,location,quality_bucket,quantity,difference_reason]. Không có action sửa/xóa |
| QC | header/version, lines gồm lot, inspected/passed/failed, issue, in_use và actions |
| Stocktake | id, code, dates, item_kind, status, version, warehouses:[id,warehouse,status,version,assignees,counted_lines,total_lines], actions |
| Stocktake lines | id, version, item/unit, lot, location, quality_bucket, system_quantity, actual_quantity nullable, difference nullable, resolution_status. Difference chỉ có khi actual không null |
| Minutes | id, code, warehouse/stocktake, status, version, remarks, tổng hợp từ lines, submitted_at |
| Exception | nguồn, type, action, quantity, reason, resolution_note, allocations, status, version, reviewed/applied thông tin, actions |
| Task | id, code, title, dates, priority, status, version, assignees và nguồn liên quan |
| Production reports | header/source, status/version, lines hoặc outputs/materials, submitted_at, actions |
| Reports | data rows, totals cùng phạm vi filter, generated_at và as_of/period; không trộn tổng mọi trang với tổng trang mà không ghi rõ |

Chi tiết GET có quan hệ được giới hạn số dòng; nếu >200 dòng cung cấp endpoint phân trang bổ sung trước khi mở rộng quy mô, không trả response khổng lồ không kiểm soát. Phiên bản MVP giới hạn các chứng từ tạo mới tối đa 100 dòng nên GET đầy đủ khả thi.

## 7 Transaction của action quan trọng

WarehouseService.postDocument triển khai DB phần 5; ExceptionService.reviewAndApply duyệt và áp dụng cùng transaction. StocktakeService.start khóa kho, tạo snapshot; StocktakeService.completeWarehouse chỉ đánh dấu đếm xong, không mở lại kho; close chỉ khi biên bản gửi và mọi chênh lệch khác 0 resolved; dòng không chênh lệch không cần đề xuất. complete increments stocktake_warehouses.version; mọi thay đổi trạng thái header tăng stocktakes.version. Khi nhập batch counts chỉ tăng line version, không làm header thay đổi bất ngờ.

CustomerOrderService.receive/review khóa parent, kiểm tra state và version. BusinessPlanService.review khóa đơn nguồn khi SALE để kiểm tổng phân bổ; PurchasingService.create khóa kế hoạch và UNIQUE business_plan_id chống hai đơn mua. QualityService.update khóa lot/header, kiểm chứng từ dùng trước khi sửa.

StockRequestService lấy nguồn và phân bổ remaining trong transaction; khi sửa request không nhận source mới. FinishedReportService.create/update tạo/sửa lô đồng bộ, nhưng chỉ submit mới cho QC chọn lô báo cáo đó. ProductionPlanService.review giữ DRAFT khi từ chối và ghi audit; approve chuyển APPROVED.

TaskService.update khóa users của người được phân công, kiểm lịch giao nhau, cập nhật stocktake_assignments nếu có liên quan. ReportService chạy truy vấn read-only cùng scope và snapshot thời gian export; không gọi mutation service.

Idempotency-Key bắt buộc với review, stock-documents, stocktake start/complete/close, submit báo cáo/biên bản. Key 1..100 ký tự allowlist chữ số/chữ cái/dấu gạch, giữ 7 ngày [ĐỀ XUẤT]. Request cùng key và hash replay cùng response; sau hết hạn vẫn kiểm state/UNIQUE/operation_key để không ghi nghiệp vụ hai lần. Các POST tạo đơn/yêu cầu cũng nên gửi key; nếu chưa bắt buộc, UI vẫn disable nút và server dựa uniqueness, không coi disable là bảo đảm chống trùng.

## 8 Ví dụ hợp đồng ghi sổ

Request:
```http
POST /api/v1/stock-documents
Content-Type: application/json
X-CSRF-Token: <token của phiên>
Idempotency-Key: stock-post-demo-001
```
```json
{
  "stock_request_id": 21,
  "request_version": 3,
  "allocations": [
    {"stock_request_line_id": 45, "lot_id": 18, "location_id": 2,
     "quality_bucket": "AVAILABLE", "quantity": "5.000"}
  ]
}
```

Response 201 minh họa, không phải dữ liệu thực:
```json
{
  "data": {
    "id": "101", "code": "PX-101", "type": "OUT", "status": "POSTED",
    "stock_request_id": "21", "warehouse_id": "1",
    "posted_at": "2026-10-08T11:00:00Z",
    "lines": [{"lot_id": "18", "location_id": "2", "quality_bucket": "AVAILABLE", "quantity": "5.000"}],
    "actions": []
  },
  "meta": {"request_id": "req-demo-001"}
}
```

Thiếu tồn sau preview trả 409 INSUFFICIENT_STOCK; frontend giữ form, tải lại phân bổ, không tự gửi lại với số lượng lớn cũ.

## 9 Route Web và ánh xạ MVC

Web GET render view; JavaScript gọi API với CSRF. Nếu chọn form POST thuần server, controller web phải gọi cùng validator/policy/service; không viết lại logic. Route static như /reports/export hoặc /catalog-data phải được đăng ký trước route /{id} khi router phụ thuộc thứ tự.

| Prefix Web | Controller và View | API module |
| --- | --- | --- |
| /login, /dashboard | AuthWebController, auth/login và dashboard | Auth và lookup tóm tắt có scope |
| /customer/orders, /orders/intake, /approvals/orders | CustomerOrderWebController, orders/list/form/detail | CustomerOrder |
| /plans, /approvals/plans | PlanWebController, plans/list/form/detail | BusinessPlan |
| /purchases | PurchaseWebController, purchases/list/form/detail | Purchasing |
| /catalog/categories, /catalog/data, /catalog/search | CatalogWebController, catalog/list/form/detail | Catalog |
| /warehouse/documents, /warehouse/receive, /warehouse/issue | WarehouseWebController, warehouse/list/post/detail | Warehouse |
| /workshop/requests | StockRequestWebController, requests/list/form/detail | StockRequest |
| /quality/inspections | QualityWebController, quality/list/form/detail | Quality |
| /stocktakes, /stocktakes/{id}/count, /stocktake-minutes | StocktakeWebController, stocktakes/list/count/minutes | Stocktake |
| /stocktake-differences, /approvals/exceptions | ExceptionWebController, exceptions/list/detail | Exception |
| /tasks | TaskWebController, tasks/list/form/detail | Task |
| /production/plans, /production/reports, /production/finished-reports | ProductionWebController, production/list/form/detail | Production |
| /reports/inventory, /reports/stock-documents, /reports/stocktakes | ReportWebController, reports/filter/table | Reporting |
| /notifications | NotificationWebController, notifications/list | Notification |

## 10 Kiểm thử và ranh giới tài liệu

Test policy ownership bằng cách thay ID; test input tampering status/customer/source; test version và idempotency; test hai transaction cạnh tranh; test rollback giữa chừng. Test API và form web cùng gọi service và trả cùng lỗi nghiệp vụ. Các contract trên đủ làm đầu vào viết OpenAPI nhưng tài liệu này chưa phải YAML OpenAPI hoặc code controller đã triển khai.

## 11 Truy vết đủ 48 UC

| UC | Module | API tương ứng | Màn hình |
| --- | --- | --- | --- |
| UC-29 | CustomerOrder | API-004, API-006, API-008 | UI-04 / UI-05 |
| UC-06 | Catalog | API-020, API-022 | UI-10 |
| UC-06.1 | Catalog | API-021 | UI-10 |
| UC-06.2 | Catalog | API-024 | UI-10 |
| UC-06.3 | Catalog | API-023 | UI-10 |
| UC-07 | Catalog | API-025, API-027, API-030, API-032, API-035, API-037, API-040, API-042, API-045, API-047, API-050 | UI-11 / UI-12 |
| UC-07.1 | Catalog | API-026, API-031, API-036, API-041, API-046 | UI-11 / UI-12 |
| UC-07.2 | Catalog | API-029, API-034, API-039, API-044, API-049 | UI-11 / UI-12 |
| UC-07.3 | Catalog | API-028, API-033, API-038, API-043, API-048 | UI-11 / UI-12 |
| UC-08 | Warehouse | API-059, API-060 | UI-13 |
| UC-09 | Warehouse | API-059, API-060 | UI-13 |
| UC-13 | Stocktake | API-066, API-067 | UI-19 |
| UC-17 | Exception | API-080, API-081, API-082 | UI-22 / UI-23 |
| UC-18 | Reporting | API-105, API-106 | UI-24 / UI-25 / UI-26 |
| UC-19 | Reporting | API-059, API-060, API-107, API-108 | UI-24 / UI-25 / UI-26 |
| UC-20 | Reporting | API-059, API-060, API-107, API-108 | UI-24 / UI-25 / UI-26 |
| UC-21 | Reporting | API-073, API-075, API-109, API-110 | UI-24 / UI-25 / UI-26 |
| UC-25 | Task | API-084, API-085 | UI-27 |
| UC-25.1 | Task | API-086 | UI-27 |
| UC-25.2 | Task | API-087 | UI-27 |
| UC-31 | CustomerOrder | API-004, API-006, API-009 | UI-04 / UI-05 |
| UC-14 | Purchasing | API-017, API-018 | UI-08 / UI-09 |
| UC-23 | StockRequest | API-053 | UI-16 / UI-17 |
| UC-24 | StockRequest | API-052, API-054 | UI-16 / UI-17 |
| UC-24.1 | StockRequest | API-055 | UI-16 / UI-17 |
| UC-24.2 | StockRequest | API-056 | UI-16 / UI-17 |
| UC-27 | Purchasing | API-011, API-013, API-019 | UI-08 / UI-09 |
| UC-04 | BusinessPlan | API-012 | UI-06 / UI-07 |
| UC-05 | BusinessPlan | API-011, API-013 | UI-06 / UI-07 |
| UC-05.1 | BusinessPlan | API-014 | UI-06 / UI-07 |
| UC-05.2 | BusinessPlan | API-015 | UI-06 / UI-07 |
| UC-10 | Warehouse | API-052, API-054, API-057, API-058 | UI-14 / UI-15 |
| UC-11 | Warehouse | API-052, API-054, API-057, API-058 | UI-14 / UI-15 |
| UC-35 | Production | API-095, API-096, API-097, API-098, API-099 | UI-28 / UI-29 |
| UC-01 | Auth | API-001, API-003 | UI-01 |
| UC-12 | Quality | API-061, API-063 | UI-18 |
| UC-12.1 | Quality | API-062 | UI-18 |
| UC-12.2 | Quality | API-064 | UI-18 |
| UC-12.3 | Quality | API-065 | UI-18 |
| UC-34 | Production | API-090, API-091, API-092, API-093, API-094 | UI-28 / UI-29 |
| UC-15 | Stocktake | API-067, API-068, API-070, API-071, API-072 | UI-20 |
| UC-28 | Stocktake | API-067, API-068, API-070, API-073, API-074, API-075, API-076, API-077 | UI-21 |
| UC-32 | BusinessPlan | API-011, API-013, API-016 | UI-06 / UI-07 |
| UC-02 | CustomerOrder | API-005, API-010 | UI-02 / UI-03 |
| UC-03 | CustomerOrder | API-004, API-006 | UI-02 / UI-03 |
| UC-03.1 | CustomerOrder | API-007 | UI-02 / UI-03 |
| UC-22 | Catalog | API-025, API-027, API-030, API-032, API-035, API-037, API-040, API-042, API-045, API-047, API-050 | UI-11 / UI-12 |
| UC-16 | Exception | API-078, API-079, API-080, API-081 | UI-22 / UI-23 |
