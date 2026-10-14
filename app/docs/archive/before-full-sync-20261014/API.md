## Cập nhật nghiệp vụ kho — 14/10/2026

Đã bổ sung xử lý hàng cách ly sau QC: đề xuất, giám đốc duyệt, quản lý giải phóng phần đạt hoặc loại bỏ phần lỗi. Điều chỉnh QC hàng đã nhập đi qua đề xuất cách ly, QC xác nhận và chứng từ bù/biến động tồn; không sửa phiếu nhập/giao cũ hoặc lượng đã giao. Giải phóng hàng điều chỉnh phải tái kiểm đạt. Không tự giao bù/hoàn tiền. Migration service hiện đến 006; chỉ làm nghiệp vụ kho, quản lý nhân viên/bộ phận ngoài phạm vi. Chi tiết API/quyền/quy trình: [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md).
## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

# API theo nghiệp vụ đã chốt

## Báo cáo UC-34/UC-35 — migration 026

POST production-reports thêm report_purpose TIEN_DO/SU_CO/NHU_CAU, note, progress_percentage tùy chọn (0–dưới 100), send_to_planner boolean. TIEN_DO/SU_CO yêu cầu mô tả, không yêu cầu lines; NHU_CAU giữ dòng nhu cầu và tính tồn hệ thống. API cũ có lines nhưng không gửi purpose được hiểu NHU_CAU. Nhiều báo cáo tiến độ/sự cố được lập theo thời điểm, chỉ một hồ sơ nhu cầu mỗi kế hoạch. PATCH nháp sửa mô tả/tiến độ/người nhận, không đổi mục đích.

Submit luôn tạo thông báo BGĐ, chỉ tạo thông báo planner nếu send_to_planner=true. BGĐ đọc báo cáo; planner chỉ đọc báo cáo được gửi thêm cho mình. Lookup làm nguồn NVL chỉ trả NHU_CAU; tiến độ/sự cố bị chặn khi dùng nguồn mua/cấp.

POST finished-reports bắt buộc production_completed:true để xác nhận đã hoàn tất toàn bộ. Sản lượng là số thực tế, không bắt bằng số kế hoạch; vẫn kiểm không vượt kế hoạch và tiêu hao không vượt đã cấp. Một báo cáo tổng kết mới mỗi kế hoạch. PATCH nháp có thể xác nhận báo cáo lịch sử bằng production_completed:true. Submit yêu cầu xác nhận và chuyển kế hoạch COMPLETED. Không tự suy đoán xác nhận cho dữ liệu cũ. Tên JSON/API hiện tại được giữ.

## Tự lấy nguồn và nguồn mua/xuất NVL tùy chọn (migration 025)

`GET /api/v1/source-imports/:target?source_id=...` trả đề xuất chỉ đọc. target: production-plans (PLANNER), production-reports (WORKSHOP_OWNER), purchase-orders (PURCHASER), lots (WAREHOUSE_MANAGER), stock-requests (WORKSHOP_OWNER). Stock-requests thêm purpose, production_source_mode PLAN/REPORT, workshop_id, warehouse_id. Kết quả có outputs hoặc lines, warnings; xuất thành phẩm có evidence QC/kiểm kê. Dữ liệu còn lại là gợi ý tại thời điểm đọc; lưu/ghi phiếu kiểm tra lại.

`GET /api/v1/source-imports/purchase-report-options`: PURCHASER chỉ lấy mã/ID báo cáo SUBMITTED để import; không mở quyền đọc API báo cáo tổng quát. Lô nhận tương tự chỉ đọc trường cần thiết của đơn mua qua API import dành cho quản lý kho.

- POST purchase-orders PLAN giữ hợp đồng cũ; source_mode có thể bỏ để tương thích nếu có business_plan_id.
- POST purchase-orders REPORT: `{source_mode:'REPORT', production_report_id, supplier_id, expected_delivery_date, delivery_terms, lines:[{item_id, quantity, unit_price}]}`. Hạn mức chia sẻ với kế hoạch mua có hiệu lực và đơn REPORT; đơn PLAN không đếm hai lần.
- POST purchase-orders MANUAL: cùng hợp đồng dòng, không gửi business_plan_id/production_report_id; không gán nhu cầu báo cáo ngầm.
- POST stock-requests PRODUCTION_ISSUE PLAN: gửi production_source_mode:'PLAN', production_plan_id, các trường kho/xưởng/quản lý/ngày và lines như cũ; không gửi production_report_id. REPORT giữ hợp đồng cũ. Tổng yêu cầu tính cùng kế hoạch để tránh cấp trùng giữa hai cách.

Các đoạn mô tả bắt buộc mọi đơn mua/xuất NVL có nguồn báo cáo bên dưới là quy tắc trước cập nhật này.

## Hàng khách trả (MySQL)

- `GET /api/v1/customer-return-deliveries`: quản lý chọn dòng giao còn hạn mức trả; trả `id`, `delivery_code`, `item_name`, `quantity`, `returned_quantity`, `customer_order_id`.
- `GET /api/v1/customer-returns` và `GET /api/v1/customer-returns/:id`: quản lý, giám đốc, QC đọc; nhân viên kho chỉ đọc lô được giao.
- `POST /api/v1/customer-returns`: quản lý gửi `{warehouse_id, receiver_id, reason, lines:[{original_stock_document_line_id, quantity, location_id}]}`. Dòng nguồn là phiếu OUT giao khách đã ghi; cùng đơn hàng; vị trí thuộc kho nhận. Lượng chờ và đã nhận cộng dồn không vượt lượng giao.
- `POST /api/v1/customer-returns/:id/receive`: nhân viên được giao gửi `{version}`; tạo phiếu IN và tồn QUARANTINE một lần. Gửi lại trả kết quả đã nhận.
- `POST /api/v1/customer-returns/:id/cancel`: quản lý lập gửi `{version}`, chỉ khi PENDING.

QC dùng lịch/kết quả hiện hữu. QC đạt vẫn giữ cách ly. Không đổi lượng giao lịch sử hay trạng thái đơn; chưa tự giao bù/hoàn tiền. Ngoại lệ QC trên hàng đã nhập còn tồn chưa được áp dụng tự động.

## Bổ sung triển khai 11/10/2026

Hiện trạng đã chạy MySQL nằm tại IMPLEMENTATION_PROGRESS.md; bảng đặc tả bên dưới vẫn là phạm vi mục tiêu.

- POST stock-requests: PRODUCTION_ISSUE dùng production_report_id của báo cáo SAN_XUAT đã gửi; PRODUCTION_RECEIPT dùng cùng trường nhưng ID báo cáo THANH_PHAM. Kế hoạch/xưởng được đối chiếu từ nguồn, không nhận kế hoạch dự kiến thay báo cáo. Các ID đều là chuỗi. Nguồn cũ thiếu báo cáo không được tự backfill.
- POST production-plans / PATCH: materials[].required_quantity là số gốc đầu vào; server cộng 10%, ceil đến 3 chữ số, trả base_quantity/reserve_rate/required_quantity/estimated_shortage_quantity. Khi sửa phải gửi số gốc, không gửi lại số đã cộng dự phòng. Dữ liệu cũ không có base_quantity cần nhập số gốc rõ ràng.
- POST production-reports: lines[].available_quantity giữ tương thích nhưng server không dùng số client làm tồn; tự tính và chụp lại lúc submit. Mỗi kế hoạch có một báo cáo nhu cầu; hoàn thiện bản DRAFT rồi gửi. Báo cáo đã gửi bất biến.
- POST lots nhận {code,lines:[{purchase_order_line_id,received_quantity,manufactured_date?,expiry_date?}]} để tạo một đầu lô nhiều mặt hàng cùng NCC. lot_id là dòng ChiTietLo; lot_header_id là đầu LoHang. GET lot-headers và lot-headers/:id đọc đầu/dòng.
- POST tasks/:id/cancelAllocation nhận {version}, quản lý phụ trách giải phóng phần chưa ghi; phiếu đã ghi giữ nguyên. Giữ chỗ không có TTL.
- stocktakes hỗ trợ COUNT bên cạnh QUALITY_CHECK. POST :id/start và :id/close nhận {version}; GET :id/warehouses/:warehouse/lines, PATCH counts {lines:[{id,version,actual_quantity,cause?}]}, POST complete {version}. Kho bị khóa cả COUNTING và COMPLETED đến CLOSED.
- stocktake-minutes là giao diện tương thích với kết luận trên PhieuKiemKe, ID bằng ID phiếu từng kho. POST {stocktake_id,warehouse_id,remarks}; PATCH :id {version,remarks}; POST :id/submit {version}.
- POST exception-proposals cho chênh lệch nhận {stocktake_id,warehouse_id,stocktake_line_id,reason,resolution_note}; lỗi QC nhận {qc_inspection_line_id,action,quantity,reason,resolution_note}. POST :id/review {version,decision,reason?} chỉ ghi quyết định/lịch sử, chưa đổi tồn; POST :id/apply {version} dành cho quản lý. decision hỗ trợ APPROVE/REJECT và APPROVED/REJECTED. Mỗi lần áp dụng chỉ tạo một biến động; kiểm snapshot và giữ chỗ trước khi giảm tồn.
- QC đã ghi không sửa/xóa trực tiếp. POST qc-inspections/:id/correct {version,reason,lines:[{lot_id,passed_quantity,failed_quantity,issue?}]} lưu chứng từ bù và ảnh trước/sau, trả compensations. Chỉ xử lý dòng chưa nhập/phân bổ/trả; đã sử dụng trả 409, phải xử lý ngoại lệ/điều chỉnh riêng.
- QC NVL lỗi tạo chứng từ TRA_VE/NCC liên kết dòng QC và dòng lô gốc, không nhập phần lỗi và không tự mua bù. Giao hàng cập nhật trạng thái đơn khách theo lượng ghi phiếu thực tế.

Mọi URL ở trên có tiền tố /api/v1; mutation vẫn cần session, CSRF, quyền, version và Idempotency-Key cho duyệt kế hoạch/phân công/ghi phiếu như API hiện có.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Toàn bộ bảng route dưới đây là thiết kế mục tiêu kế thừa, không phải danh sách endpoint đã nghiệm thu. /stocktake-minutes, /warehouse-records và purpose cũ cần được ánh xạ lại; không dùng URI để suy ra entity riêng. Framework thực tế Express/EJS; cấu trúc MVC trung lập bên dưới mô tả trách nhiệm, không phải cây file đã triển khai.

## 1 Kiến trúc ứng dụng

[ĐỀ XUẤT] Một ứng dụng MVC cùng origin, View render trên server và JavaScript gọi API cho bảng/form tương tác; một MySQL, một cấu hình triển khai. UI và API gọi cùng service nghiệp vụ. Code hiện dùng Express/EJS; trách nhiệm MVC bên dưới dùng cho việc triển khai tiếp trong cùng ứng dụng.

| Thành phần | Trách nhiệm | Không đặt tại đây |
| --- | --- | --- |
| Router/Middleware | Định tuyến, session, CSRF, request_id, rate limit | Tính tồn, tính giá |
| Controller | Nhận dữ liệu đã validate, gọi policy/service, trả JSON hoặc view | SQL tự do, transaction phân tán qua nhiều controller |
| Request/Validator | Kiểu dữ liệu, required, enum, độ dài; báo lỗi theo field | Quyết định duyệt hoặc tồn cuối cùng |
| Policy/Scope | Vai trò và phạm vi bản ghi/xưởng/kho | Chỉ kiểm tra nút ẩn trên frontend |
| Service | Quy tắc SRS, state machine, transaction, lock, audit, idempotency | Render HTML |
| Model/Repository | ORM/query, quan hệ, thao tác dữ liệu trong transaction | Chọn thông báo hoặc điều hướng UI |
| View/Presenter | Layout, form, table; định dạng ngày/số; trạng thái nút | Tự sửa inventory_balances |

Cấu trúc hiện hành: src/services/<owner>/modules, src/shared, src/controllers, src/views, src/validators, src/middlewares, database và tests. Xem ARCHITECTURE.md; không tạo cây thư mục framework khác chỉ vì tài liệu cũ dùng tên trung lập.

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

[MỤC TIÊU] type MUA/BAN (ánh xạ PURCHASE/SALE ở code hiện hành), report_id/MaBaoCao bắt buộc: MUA→SAN_XUAT, BAN→THANH_PHAM. Dòng lấy mặt hàng từ báo cáo; MUA không vượt phần thiếu còn được phân bổ, BAN đối chiếu đơn/QC/tồn. customer_order_id là liên kết giao hàng, không thay báo cáo thành phẩm làm nguồn. Không nhận production_plan_id làm nguồn mua độc lập. Tên JSON report_id và hợp nhất endpoint cần chốt D-14.

### PLAN_EDIT

version:int và các trường PLAN được sửa; type/source không đổi khi đã phát sinh chứng từ. Sửa bị từ chối gửi lại chờ duyệt; gửi toàn bộ lines khi thay chi tiết.

### PURCHASE

[MỤC TIÊU] business_plan_id bắt buộc là MUA đã duyệt; report_id do server lấy từ kế hoạch và lưu cùng nguồn trên đơn mua, không tin ID nguồn client. Mặt hàng/số lượng đối chiếu kế hoạch và hạn mức thiếu thực tế cộng dồn; không cộng dự phòng. Chốt nhiều đơn/kế hoạch và phần hủy ở D-04.

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

[MỤC TIÊU] Header lô và lines:[{item_id,quantity,source_line_id,...}] ánh xạ LoHang/ChiTietLo. Metadata subtype theo domain, quan hệ trả hàng D-05/D-13. Không item_id đơn lẻ đại diện toàn lô. Tên field/endpoints là thiết kế chưa được chứng minh triển khai.

### CATALOG_SEARCH

Query resource:warehouses|suppliers|materials|finished-products|lots|inventory, q:string, category_id?:int, warehouse_id?:int, page/per_page. items lọc theo kind; inventory chỉ đọc, không CRUD số dư.

### LOOKUP

Path resource thuộc allowlist: warehouses, warehouse-locations, suppliers, categories, items, lots, units, customers, users, customer-orders, business-plans, purchase-orders, production-plans. Query q, limit<=50, purpose? và parent_id?. Không trả toàn bộ bảng. CUSTOMERS chỉ tra sample-items và hồ sơ chính mình; STOCKTAKER chỉ kho phân công; nội bộ mỗi resource kiểm tra quyền chức năng riêng.

### STOCK_REQUEST

[MỤC TIÊU] UC-23 xuất NVL dùng báo cáo SAN_XUAT; nhập TP dùng THANH_PHAM. report_id, workshop_id và lines theo mặt hàng/lượng đề nghị. Nhu cầu xuất không lấy shortage_quantity hoặc kế hoạch dự kiến. Kiểm đã cấp + cam kết để tránh trùng/vượt. UC xuất bán đối chiếu đơn/kế hoạch BAN; có cần phiếu yêu cầu riêng chưa chốt D-06. Các purpose/enum hiện hành không tự mở rộng actor được chấp thuận.

### STOCK_REQUEST_EDIT

version:int, requested_date?:DATE, warehouse_id?:int, note?:string, lines?:toàn bộ dòng. Chỉ PENDING, chưa phiếu; không đổi purpose hoặc chứng từ nguồn.

### POST_STOCK

[MỤC TIÊU] Dòng ghi sổ tham chiếu lot_line_id/ChiTietLo, vị trí và lượng thực nhập/xuất; khác request_line_id và lượng đề nghị. Nhập chỉ phần QC đạt chưa nhập; xuất chỉ tồn đủ điều kiện sau giữ chỗ. Cập nhật phiếu/chi tiết/tồn/giữ/nguồn/idempotency nguyên tử. lot_id cũ chưa đủ cho lô nhiều hàng; tên JSON cần chốt D-14.

### QC

[MỤC TIÊU] lines theo lot_line_id/ChiTietLo, inspected_quantity, passed_quantity, failed_quantity; inspected=passed+failed. Không buộc có phiếu nhập trước QC. Tần suất kiểm/tái kiểm D-13. Phần đạt chuyển UC-10; phần lỗi không nhập khả dụng và không tự trừ lượng chưa nhập.

### QC_EDIT

version:int và các trường QC. Chỉ chưa dùng; khi lines thay gửi toàn bộ. Không sửa inspector/status tùy ý.

### STOCKTAKE

planned_date:DATE>=hôm nay, item_kind?:MATERIAL|FINISHED_PRODUCT, note?:string, warehouses:[{warehouse_id:int,assignee_ids:[int]}], start_at/end_at:ISO8601 cho công việc dự kiến. Mỗi kho có ít nhất một kiểm kê viên, không trùng kho/user trong kho; server tạo tasks và assignments trong cùng transaction.

### COUNTS

lines:[{id:int,version:int,actual_quantity:decimal_string>=0,cause?:string}]. id phải thuộc đợt/kho path; cập nhật cả batch nguyên tử, tối đa 200 dòng; lỗi chỉ rõ dòng. Lưu tạm lên server, không đổi trạng thái complete. Null không được gửi để giả đã đếm.

### MINUTES

[MỤC TIÊU] Lưu nhận xét/kết luận/version trên PhieuKiemKe đã hoàn tất đếm; không POST tạo entity biên bản riêng. /stocktake-minutes cũ có thể giữ compatibility bằng adapter sau D-14, không tạo bảng mới.

### MINUTES_EDIT

[MỤC TIÊU] Sửa nội dung kết luận/nhận xét của PhieuKiemKe theo quyền và trạng thái cho phép, không nhập lại số đếm. Chính sách sau gửi cần chốt D-07.

### EXCEPTION

[MỤC TIÊU] BanDeXuatXuLyNgoaiLe có nguồn QC hoặc kiểm kê; KetQuaXuLyNgoaiLe là lịch sử quyết định. Duyệt bởi Ban giám đốc, lưu người/thời điểm/quyết định/lý do/phiên bản, chống xử lý hai lần. Tác động tồn tùy hàng đã nhập hay chưa; hạn mức và duyệt/áp dụng D-08/D-09.

### TASK

title:string 1..200, description?:string, start_at/end_at:ISO8601, priority:LOW|NORMAL|HIGH, assignee_ids:[int], stocktake_id?:int hoặc purchase_order_id?:int. End>start và không trùng lịch.

### TASK_EDIT

version:int và các trường TASK được phép sửa; không sửa COMPLETED/CANCELLED. Công việc đang thực hiện cho bổ sung người/lùi hạn có kiểm tra lịch, không cho hủy.

### TASK_PROGRESS

version:int, status:IN_PROGRESS|COMPLETED; chỉ chuyển theo SRS, không dùng route này để hủy.

### PRODUCTION_PLAN

[MỤC TIÊU] lines chung ChiTietKeHoachSanXuat, LoaiChiTiet THANH_PHAM/NGUYEN_VAT_LIEU; NVL ghi nhu cầu gốc và nhu cầu gồm dự phòng 10% một lần. outputs/materials nếu giữ ở JSON chỉ là hai nhóm trình bày trên một chi tiết domain. Không làm nguồn mua/cấp thực tế.

### PRODUCTION_PLAN_EDIT

version:int và trường PRODUCTION_PLAN, chỉ DRAFT. Không sửa nguồn sau duyệt.

### PRODUCTION_REPORT

[MỤC TIÊU] BanBaoCaoSanXuat LoaiBaoCao=SAN_XUAT; source kế hoạch/xưởng, lines nhu cầu thực tế và tồn khả dụng đối chiếu theo mặt hàng. Thiếu max(0,cần-khả dụng) do server đối chiếu, không cập nhật tồn từ input. Báo cáo thiếu 0 vẫn hợp lệ; không cộng 10% lại. Chính sách snapshot/cam kết D-01/D-03.

### PRODUCTION_REPORT_EDIT

version:int và trường PRODUCTION_REPORT, chỉ DRAFT.

### FINISHED_REPORT

[MỤC TIÊU] Cùng BanBaoCaoSanXuat LoaiBaoCao=THANH_PHAM; ChiTietBaoCaoSanXuat ghi sản lượng và NVL sử dụng; ChiTietLoBaoCaoSanXuat truy vết dòng lô khi có. Báo cáo làm nguồn BAN; chưa QC/nhập không tăng tồn khả dụng. Endpoint tách ở code chưa chứng minh lưu trữ báo cáo chung.

### FINISHED_REPORT_EDIT

version:int và trường FINISHED_REPORT, chỉ DRAFT, các lot chưa QC/chứng từ; sửa output cập nhật lot nguồn đồng bộ.

### REPORT

Query warehouse_id?:int, item_id?:int, kind?:MATERIAL|FINISHED_PRODUCT, lot_line_id?:int, quality_bucket?:AVAILABLE|QUARANTINE, as_of?:ISO8601 cho inventory; from/to:DATE và type:IN|OUT cho stock-documents; stocktake_id/warehouse_id cho stocktakes. Pagination 20..100. Không chấp nhận from>to, as_of trong tương lai.

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

## 6 Response và transaction mục tiêu

Response trình bày report_id và loại báo cáo nguồn, lot_line_id cho dòng lô, requested/actual/reserved/remaining riêng biệt. Hồ sơ kho là kết quả đọc PhieuKho; kết luận kiểm kê là dữ liệu PhieuKiemKe; ngoại lệ kèm danh sách quyết định. Không bổ sung response entity hồ sơ/biên bản nghiệp vụ riêng.

Giữ session/CSRF/RBAC/scope/version và idempotency; khóa nguồn nhu cầu, đề nghị và số dư, kiểm lại hạn mức tại commit, rollback toàn bộ. Hợp đồng mới là mục tiêu để code tiếp; không suy từ tài liệu API rằng endpoint đã có hoặc pass MySQL. [MODULE_MATRIX.md](MODULE_MATRIX.md) ghi bằng chứng; [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md) ghi tên endpoint/field còn mở.

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
# Bổ sung nghiệp vụ tái kiểm và phân công kết luận

- POST /api/v1/exception-proposals nhận action=RELEASE cho QC_FAILURE chưa trả hàng.
- POST /api/v1/exception-proposals/:id/reinspect: QC phụ trách nguồn gửi {version,result:"PASSED"|"FAILED",note}; chỉ sau giám đốc duyệt, lưu lịch sử và tăng version, không đổi tồn.
- POST /api/v1/exception-proposals/:id/apply: quản lý thực hiện RELEASE khi kết luận mới nhất đạt, còn hạn và lượng đúng nguồn; tạo chứng từ bù QC và cập nhật phần đạt, không tự ghi phiếu nhập.
- GET chi tiết đề xuất có reinspections; mọi thao tác kiểm version, không ghi đè quyết định/kết luận lịch sử.
- POST /api/v1/stocktakes, mỗi warehouses[] có conclusion_assignee_ids tùy chọn gồm tài khoản QC/AC hoạt động. Người này chỉ xem và lập/sửa/gửi kết luận kho được giao sau khi đếm xong; không nhập số đếm.
- GET /api/v1/catalog-data mặc định báo cáo tồn; resource=items|categories|warehouses|warehouse-locations|lots trả danh mục cho quản lý/chủ xưởng. Chủ xưởng chỉ đọc.
# Điều kiện xuất thành phẩm

SALE_ISSUE yêu cầu kế hoạch bán đã duyệt, nguồn báo cáo TP đã gửi/xác nhận hoàn tất, KHSX COMPLETED, đúng đơn khách/xưởng và ngày hiện tại đã đến latest_delivery_date. Các endpoint preview/create/update/dispatch/post kiểm tra lại trong transaction. Lỗi 409 PRODUCTION_NOT_COMPLETED hoặc DELIVERY_NOT_DUE; sai xưởng 403 FORBIDDEN. Requested_date không thay thế ngày hệ thống; ngày giao hiện lấy từ trường ngày giao muộn nhất của đơn vì chưa có ngày giao dự kiến riêng.
