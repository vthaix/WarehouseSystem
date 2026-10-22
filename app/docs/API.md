# API hiện hành

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

| Nhóm | Field/chế độ và quy tắc |
| --- | --- |
| KHSX | customer_order_id, workshop_id, start_date/end_date, outputs/materials/note; NVL gốc +10% một lần |
| Kế hoạch MUA/BAN | type PURCHASE/SALE, production_report_id theo đúng loại nguồn; liên kết đơn cho bán không thay nguồn tổng kết |
| Đơn mua | source_mode PLAN/REPORT/MANUAL; business_plan_id hoặc production_report_id theo chế độ, supplier_id, ngày/điều kiện giao, lines |
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
