# API hiện hành

Đính chính 22/10/2026: Công việc tạo trực tiếp hai loại kiểm tra. `GET /task-inspection-sources` trả lô TP và các phần theo **báo cáo thành phẩm đã gửi**, cùng nguồn NVL theo kế hoạch MUA. `POST /tasks` nhận `inspection_type=FINISHED_PRODUCT` với `lot_header_id`, `finished_report_ids`, hoặc `inspection_type=MATERIAL` với `material_source`; giữ tên/lịch/ưu tiên/nhân viên. Công việc và lịch QC tạo atomically, trạng thái đồng bộ khi bắt đầu/QC hoàn tất. `POST /finished-reports` nhận `report_mode=PART`, `production_completed=false` cho phần thường hoặc true cho phần cuối; mỗi báo cáo tạo dòng lô mới cùng lô tổng/KHSX, không tự cộng tồn. Bỏ report_mode giữ FINAL cho dữ liệu/API cũ. Báo cáo tiến độ không tạo phần lô. Chi tiết [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md).

Hợp nhất 14/10/2026 theo router, service owner và validation thực tế. Browser gọi cùng origin /api/v1 qua gateway; EJS không xử lý domain thay backend.

## Auth và bảo vệ request

GET /auth/csrf lấy token; POST /auth/login nhận username/password và X-CSRF-Token; GET /auth/me lấy user an toàn; POST /auth/logout hủy phiên. Gateway quản lý session/CSRF; Identity xác thực và hydrate actor/quyền/phạm vi. Backend không nhận actor từ browser mà kiểm lại qua Identity, request nội bộ ký HMAC và allowlist.

Không trả hash mật khẩu. Sai quyền/scope bị chặn kể cả UI có nút; không tin customer_id, role, giá hay trạng thái client tự gửi.

## Danh mục API và owner

Development-only POST `/test-data/reset`: mọi tài khoản đã đăng nhập, CSRF, header `Idempotency-Key` UUID và body `{ "confirmation": "XOA DU LIEU TEST" }`. Chỉ bật khi `ENABLE_TEST_RESET=true` và `NODE_ENV=development`. Xóa nghiệp vụ toàn hệ thống, giữ danh mục/tài khoản; trả đường dẫn backup, số bảng đã dọn và yêu cầu đăng nhập lại. Gateway gọi tiện ích nội bộ riêng, không cấp quyền SQL root cho gateway. Chi tiết [RESET_DU_LIEU_TEST.md](RESET_DU_LIEU_TEST.md).

UC-31: POST `/production-plans/:id/review` nhận `version` của KHSX, `decision=APPROVE|REJECT`, `reason` bắt buộc khi từ chối và header `Idempotency-Key`. Chỉ DIRECTOR. APPROVE duyệt đúng một KHSX và tự cập nhật đơn RECEIVED sang APPROVED trong cùng transaction; các KHSX khác không đổi. REJECT giữ DRAFT, tăng version, lưu lý do và thông báo planner để sửa; không từ chối đơn nguồn. API cũ `/customer-orders/:id/review` bị chặn 409 `PLAN_REVIEW_REQUIRED` (sai vai trò vẫn 403).

Cập nhật 22/10/2026: thêm POST `/production-plans/recipe-estimate`, GET `/production-plans/:id/material-comparison`, POST `/production-report-images`, GET `/production-reports/:id/images/:file`. KHSX nhận `material_source=RECIPE|MANUAL`; ảnh báo cáo là liên kết trong note, không nhận HTML. Hợp đồng và giới hạn: [LUONG_DAT_HANG_TIEN_SAN_XUAT.md](LUONG_DAT_HANG_TIEN_SAN_XUAT.md).

Danh sách method/path sinh từ Express router: [generated/API_ROUTES.md](generated/API_ROUTES.md). Lookup/source-imports chọn owner theo resource/target; bảng owner mặc định cho path biến không thay kiểm quyền. Các resource danh mục kho/lô thuộc Warehouse; hàng/loại hàng/NCC thuộc Business; báo cáo tổng hợp thuộc Reporting.

Whitelist request/query/dòng con trích từ code: [generated/API_CONTRACT_FIELDS.md](generated/API_CONTRACT_FIELDS.md). Policy read/create/edit và module owner: [generated/PROJECT_MANIFEST.json](generated/PROJECT_MANIFEST.json). Fields được liệt kê không đồng nghĩa tất cả bắt buộc; validation tại method là nguồn chuẩn.

## Quy ước dữ liệu

ID là chuỗi số nguyên dương. Lượng là decimal string, tối đa 3 chữ số thập phân; giá tối đa 4 chữ số. Ngày YYYY-MM-DD; thời điểm cần timezone khi validator yêu cầu. Các field không thuộc whitelist bị từ chối; không gửi field nguồn ẩn của chế độ trước.

Response thành công dùng data, meta khi phân trang và request_id theo helper. Lỗi có code/message/fields; thông thường validation 422, chưa đăng nhập 401, không quyền 403, không tồn tại 404, xung đột version/trạng thái/nguồn 409. Mã cụ thể giữ code hiện hữu, không đổi IN_USE thành RESOURCE_IN_USE chỉ theo tài liệu cũ.

Có version thì mutation phải gửi bản hiện hành. Idempotency-Key chỉ bắt buộc tại endpoint có cơ chế này (duyệt kế hoạch/điều phối/ghi phiếu theo implementation), không yêu cầu blanket cho mọi POST. Nhập TP MANUAL dùng receipt_key trong body. Timeout không tự retry; đối soát resource và gửi cùng key/payload khi endpoint hỗ trợ.

## Nguồn nghiệp vụ

Cập nhật mua NVL 22/10/2026: chỉ tạo PLAN/MANUAL. Dòng đơn mua nhận `supplier_id`; PLAN nhận `business_plan_line_id`, giá và NCC từng dòng, số lượng phải khớp nguồn. PLAN tự lấy `expected_delivery_date=planned_date`, không bắt buộc client gửi lại; gửi khác nguồn bị chặn. Header supplier_id chỉ là giá trị chung suy ra (NULL nếu nhiều NCC). `supplier_id` gửi vào kế hoạch MUA không còn quyết định NCC. Xem [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md).

| Nhóm | Field/chế độ và quy tắc |
| --- | --- |
| KHSX | customer_order_id, workshop_id, start_date/end_date, outputs/materials/note; NVL gốc +10% một lần |
| Kế hoạch MUA/BAN | type PURCHASE/SALE, production_report_id theo đúng loại nguồn; liên kết đơn cho bán không thay nguồn tổng kết |
| Đơn mua | source_mode PLAN/MANUAL; business_plan_id ở PLAN; lines[].supplier_id chọn từng NVL, ngày PLAN tự lấy planned_date, điều kiện giao/đơn giá do purchaser nhập |
| Báo cáo đang SX | production_plan_id, report_purpose TIEN_DO/SU_CO/NHU_CAU, note/progress_percentage/send_to_planner; chỉ NHU_CAU có dòng NVL |
| Tổng kết TP | production_plan_id, production_completed=true, completed_date, outputs/materials thực tế; gửi chuyển KHSX COMPLETED |
| Yêu cầu NVL | purpose PRODUCTION_ISSUE, production_source_mode PLAN/REPORT; cùng hạn mức KHSX |
| Yêu cầu TP từng phần | purpose PRODUCTION_RECEIPT, production_source_mode MANUAL, KHSX/xưởng/kho/quản lý, receipt_key, lượng/ngày thực từng dòng |
| Xuất bán | purpose SALE_ISSUE, BAN đã duyệt/tổng kết hoàn tất/đơn trùng nguồn/ngày giao/tồn QC đạt |
| Phiếu thực ghi | stock_request_id/request_version/task_id/allocations và Idempotency-Key; chỉ người được giao |
| Kiểm kê | scope từng kho; b.lines gồm id/version/actual_quantity/cause; 0 là đếm, trống là chưa đếm |
| Ngoại lệ | nguồn dòng QC hoặc dòng kiểm kê; cách ly thêm quarantine=true/allocations, hành động và lượng; review/reinspect/apply tách |

JSON/enum tiếng Anh giữ tương thích. Tên bảng/cột SQL tiếng Việt không dấu, không gửi tên cột vật lý làm JSON field thay alias hiện hành.

## Hàng trả, cách ly, bù QC

Hàng khách trả theo dòng phiếu giao gốc, nhận đúng một lần QUARANTINE; không tự giao bù/hoàn tiền. Xử lý cách ly RELEASE/SCRAP hoặc RETURN_SUPPLIER khi có nguồn mua phù hợp. QUARANTINE hàng đã nhập cần giám đốc duyệt, QC xác nhận FAILED, quản lý áp dụng; giải phóng lại hàng điều chỉnh cần QC PASSED. Ghi lịch sử bù và biến động, không sửa phiếu gốc.

Chi tiết body/API/quyền: [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md). Nhập từng phần: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). POST /tasks/:id/postTask dùng cơ chế ghi phiếu, task_id phải khớp URL; không phải endpoint hoàn tất công việc tùy ý.

## Web và kiểm thử

Web menu/route ở navigation.js/FoundationWebRoutes; API là mutation backend. SSR/form tiêu chuẩn và JavaScript đều phải giữ CSRF/version/quyền. Test SQL qua gateway vào service trên namespace riêng; test form mock mutation không chứng minh SQL.

Xem [UI_SPEC.md](UI_SPEC.md), [MODULE_MATRIX.md](MODULE_MATRIX.md), [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).


Ảnh danh mục: LoaiHang.DuongDanAnh / image_path, chọn/xem trước/bỏ ảnh, PNG/JPEG/WebP ≤5 MB. Migration service 007; file ở src/images/categories, Docker lưu volume category_images. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
# Nguồn kế hoạch và đợt hàng thực tế của lịch QC (22/10/2026)

- `GET /api/v1/quality-campaign-sources`: chỉ DIRECTOR; trả `plans` và `lots` đang chờ QC/chưa được lịch khác chọn. Dòng có `lot_header_code`, `code`, `received_quantity`, `expected_date`; tên phân biệt từng đợt cùng lô tổng.
- Tạo qua `POST /api/v1/quality-campaigns` hoặc nhánh QUALITY_CHECK của `/stocktakes`: `source_mode=ACTUAL` và `lot_ids` không rỗng, hoặc `source_mode=PURCHASE_PLAN|PRODUCTION_PLAN`, `source_plan_id`, `lot_ids=[]`. Giữ trường lịch/phân công hiện có. Chỉ nguồn đã duyệt/còn hiệu lực, đúng loại hàng; không tạo lô/tồn cho hàng chưa có.
- `POST /api/v1/quality-campaigns/:id/bind-lots`: DIRECTOR, body `{ "version": 1, "lot_ids": ["123"] }`; chỉ lịch PLANNED có nguồn kế hoạch, bổ sung các dòng thực tế thuộc nguồn. Kiểm tra version, trạng thái QC, chống phân công trùng; audit BIND_LOTS. ID là ChiTietLo, không phải đầu lô.
- Chi tiết trả `source_mode`, `source_plan_id`, `source_code`, `expected_date`, `lot_ids`, `lots`; DIRECTOR có thêm `eligible_lots`. Hành động `bindLots` cho lịch dự kiến; `start` chỉ khi đã gắn hàng, backend kiểm tra lại.

Ngày dự kiến NVL lấy MUA; ngày TP dự kiến lấy ngày giao của đơn gắn KHSX. Đợt TP hiện có lấy ngày yêu cầu nhập phần đó, được QC sớm trước ngày giao cuối. Mặc định không trước hôm nay/ngày nguồn; lịch dự kiến chưa đến ngày nguồn không bắt đầu được. QC ghi theo từng ChiTietLo, không theo lượng kế hoạch hoặc tổng LoHang. Xem [KICH_BAN_TEST_QCAC_KIEM_KE.md](KICH_BAN_TEST_QCAC_KIEM_KE.md).
