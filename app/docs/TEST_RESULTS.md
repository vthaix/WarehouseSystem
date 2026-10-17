# Kết quả kiểm thử WarehouseSystem

Ngày chạy: 14/10/2026. Bộ ca thiết kế: [TEST_CASES.md](TEST_CASES.md). Đặc tả nguồn: [DacTa_WarehouseSystem.md](DacTa_WarehouseSystem.md).

## Kết quả đợt chạy

Bổ sung ngày 17/10/2026: đã dựng và xác minh 36 nhóm chứng từ mẫu trên CSDL hiện có và một project Docker có volume mới. Kiểm tra lặp lại giữ nguyên số dòng các bảng Business/Warehouse. Bộ nghiệm thu split MySQL và 51 test tự động chạy lại đạt. Đã sửa lỗi khóa lịch TaskService trên tài khoản Warehouse chỉ có SELECT đối với Identity; không mở quyền UPDATE lên tài khoản người dùng. Chi tiết [DEMO_FIXTURES.md](DEMO_FIXTURES.md). Kết quả này không thay thế nghiệm thu từng ca trong 233 ca thiết kế bên dưới.

Đã chạy toàn bộ nhóm kiểm thử tự động có trong project: unit/HTTP, cú pháp, đồng bộ project, nghiệm thu MySQL microservice và các bộ trình duyệt. Hệ thống microservice vượt qua các bộ nghiệm thu hiện có. Bộ trình duyệt backend bộ nhớ cũ vẫn thất bại ở form tạo hồ sơ kho tổng hợp. Không kết luận 233 ca trong đặc tả đều Pass: các script hiện có chưa tương ứng đầy đủ từng thao tác và từng nhánh của 233 ca.

| Bộ kiểm thử | Kết quả thực tế | Phạm vi / giới hạn |
| --- | --- | --- |
| `node --test` | **51/51 Pass**, không skip | Nghiệp vụ, HTTP, phân quyền, rollback, giữ chỗ, chống trùng, nguồn, QC, cấu trúc service; nhiều ca dùng backend bộ nhớ hoặc kiểm tra thành phần |
| `node scripts/check.cjs` | Pass | Cú pháp JavaScript trong src/public/tests/e2e/scripts/database |
| `node scripts/check-project-sync.cjs` | Pass | Cấu trúc service, Compose, migration, owner/schema, tài liệu sinh, UC và liên kết |
| `docker compose build app split-databases` | Pass | Image chứa nguồn kiểm thử hiện tại; không reset volume |
| `docker compose run --rm --no-deps -T split-databases node scripts/split-acceptance.cjs` | **Pass** | Sáu tiến trình HTTP và sáu schema/tài khoản MySQL dành riêng cho acceptance |
| Đăng nhập API localhost:3000 | **11/11 Pass** | customer/customer2/planner/purchaser/manager/staff/staff2/qc/stocktaker/workshop/director với mật khẩu mẫu; kiểm tra session bằng auth/me |
| `node e2e/docker.cjs` | Pass | EJS không JavaScript; form nguồn đơn mua với JavaScript; loại MUA/BAN, quyền, schema trong Adminer |
| `node e2e/ssr.cjs` | Pass sau sửa selector | Đăng nhập, dashboard, thêm/sửa mặt hàng, đăng xuất khi tắt JavaScript; backend bộ nhớ |
| `node e2e/source-imports.cjs` | Pass | Import đơn/kế hoạch/báo cáo, phản hồi cũ, đổi chế độ mua, nguồn nhập và hai loại xuất; **request ghi được mock** |
| `node e2e/warehouse-exceptions.cjs` | Pass | Form/payload giải phóng, tiêu hủy, điều chỉnh QC đã nhập; **request ghi được mock** |
| `node e2e/admin-theme.cjs` | Pass | Dashboard, trắng/đỏ, tìm kiếm, sidebar desktop, drawer mobile, không tràn ngang |
| `node e2e/category-images.cjs` | Pass | Chọn/preview/upload/edit/bỏ ảnh; **request ghi được mock**, lưu thật kiểm tra riêng ở SQL acceptance |
| `node e2e/browser.cjs` | **Fail** | Workflow trình duyệt backend bộ nhớ cũ; lần cuối dừng ở tạo hồ sơ kho tổng hợp vì lỗi quyền |

`e2e/run.cjs` là wrapper chạy browser.cjs rồi ssr.cjs. Lần đầu dừng tại browser.cjs; các bộ con đã được chạy riêng để không bỏ qua bộ phía sau.

## Chi tiết nghiệm thu MySQL đã đạt

Các dòng dưới đây là kết quả do bộ acceptance trả về, không phải suy luận từ trạng thái container:

| Nhóm | Nội dung đạt |
| --- | --- |
| Bảo mật service | Từ chối chữ ký thiếu/sai, sai owner, truy cập SQL thô, giả role và session cũ; không trả password hash |
| Công việc | Vai trò/phạm vi, lịch trùng đồng thời, phiên bản cũ, tiến độ, không sửa công việc đã hoàn tất |
| Kiểm kê | Phân công; phân biệt chưa đếm và số 0; kết luận kho; duyệt và áp dụng riêng; lịch sử quyết định; điều chỉnh một lần; đóng đợt |
| Báo cáo sản xuất | Nhiều báo cáo tiến độ/sự cố; NVL không bắt buộc cho mọi mục đích; BGĐ nhận; planner chỉ đọc khi được gửi; gửi rồi bất biến |
| Import và mua | Mua thủ công/báo cáo; preview đúng phạm vi; lượng còn lại; tiền chính xác; cạnh tranh nguồn; hạn mức chung kế hoạch/đơn mua |
| Sản xuất | Nhu cầu/thiếu NVL, truy vết mua, lookup, vượt nhu cầu rollback, giới hạn đồng thời, duyệt và lô thành phẩm |
| Trả NCC sau nhập | Điều chỉnh QC có xác minh; trả được duyệt; giảm cách ly; truy vết lô gốc |
| Xử lý cách ly | Hạn mức QC, đề xuất đồng thời, BGĐ duyệt, khóa kiểm kê, giải phóng/tiêu hủy, không trùng biến động |
| Hàng khách trả | Không vượt phiếu giao gốc; cạnh tranh; phân công; nhập cách ly một lần; hủy; QC; giữ lịch sử đơn |
| Sản xuất và giao hàng | Nguồn báo cáo thực tế, giải phóng/phân bổ lại, hạn mức NVL tiêu hao, QC/nhập TP, kế hoạch bán duyệt và giao khách |
| Nhập/xuất | Kế hoạch mua → đơn mua → QC → yêu cầu → phân bổ → ghi sổ một lần |
| Điều chỉnh QC đã nhập | BGĐ duyệt; QC bắt buộc xác minh; cách ly/giải phóng/tiêu hủy; phiếu nhập bất biến và chứng từ bù |
| Nhập TP từng phần | Chung header lô, QC riêng từng phần, replay, tồn chính xác, báo cáo cuối dùng lô có sẵn và không nhập lại |
| Ảnh danh mục | Quyền, loại/bytes ảnh, upload/read, lưu thuộc tính thật, sửa từng phần, từ chối đường dẫn sai, bỏ ảnh |
| Tách schema | Sao chép bảo toàn dữ liệu; replay migration; FK; tài khoản/schema riêng; khôi phục checkpoint migration |

Acceptance dùng namespace `KhoHang_Acceptance_20261013` và các schema service con. Không xóa/reset CSDL ứng dụng, không chạy `docker compose down -v`. Các bộ trình duyệt Docker có đăng nhập và đọc dữ liệu; các bộ form mock không ghi chứng từ thật vào CSDL người dùng.

## Lỗi phát hiện và thay đổi trong kiểm thử

| Mã | Phát hiện | Xử lý / trạng thái |
| --- | --- | --- |
| T01 | ssr.cjs còn tìm heading “Không gian làm việc”, giao diện đã đổi thành “Tổng quan vận hành”. | Sửa selector trong test; chạy lại **Pass**. Không đổi giao diện để chiều theo test cũ. |
| T02 | browser.cjs tạo lịch QC nhưng chưa bắt đầu lịch, sau đó mở form ghi QC bị chặn. | Bổ sung thao tác Start của director trong fixture trình duyệt; chạy lại vượt qua bước QC và nhập NVL. |
| T03 | browser.cjs, bước tạo hồ sơ kho tổng hợp sau nhập NVL: form báo “Bạn không có quyền thực hiện thao tác”; không hiện data-form. | **Chưa sửa**. Tái hiện tại backend bộ nhớ của createApp; ảnh `artifacts/browser-failure.png`. Chưa có bằng chứng lỗi này xảy ra ở runtime MySQL. |

Không sửa luật nghiệp vụ/CSDL để tự giải quyết các mâu thuẫn Q01–Q10 trong TEST_CASES.md.

## Khoảng trống so với 233 ca

Ma trận chi tiết của từng ca nằm ở [TEST_EXECUTION_MATRIX.md](TEST_EXECUTION_MATRIX.md). Trạng thái Blocked giữ theo tài liệu thiết kế; Not Run nghĩa là chưa có bằng chứng hoàn tất toàn bộ ca. Có script kiểm tra một phần cùng nghiệp vụ không tự chuyển cả ca sang Pass.

Các phần còn cần chạy hoặc bổ sung fixture/assertion riêng:

- Toàn bộ nhánh tìm kiếm/lọc/không có dữ liệu và xuất file theo đặc tả, đối chiếu nội dung từng file.
- Validation từng trường và từng bộ dữ liệu của form thêm/sửa/xóa, tên trùng, hủy/nhập lại, cảnh báo tăng/giảm đơn.
- UC-15 mất mạng và phục hồi dữ liệu cục bộ; số liệu lưu tạm và biên bản lưu tạm qua đăng xuất/đăng nhập.
- Đối chiếu từng bước nguồn của UC-23/11.01/11.02/04/35 sau khi thống nhất Q02/Q03; actor duyệt và thời điểm điều chỉnh theo Q01.
- Giao diện lỗi/khôi phục khi service hoặc DB gián đoạn và rollback nhiều dòng cần fixture gây lỗi có kiểm soát cho từng luồng.
- Khắc phục/tách rõ bộ trình duyệt legacy bị lỗi T03 trước khi tuyên bố toàn bộ script xanh.

Chưa nghiệm thu toàn bộ đặc tả. Bước tiếp theo là giải quyết các mâu thuẫn yêu cầu và bổ sung chạy từng ca còn Not Run; các kết quả tự động ở trên là bằng chứng nền để tiếp tục.
