# Warehouse System — Express MVC + EJS

Cấu trúc, luồng request và trạng thái MySQL: [ARCHITECTURE.md](docs/ARCHITECTURE.md). Các lệnh bên dưới chạy từ thư mục `app/`.

Giao diện tiếng Việt và backend Express theo mô tả công việc mới ở đầu `docs/SRS.md`. **Docker/MySQL đã có nền tảng chạy được:** auth, RBAC, session, danh mục đọc và thông báo dùng SQL; nghiệp vụ kho/sản xuất còn pending. Xem [DOCKER.md](docs/DOCKER.md), [MODULE_MATRIX.md](docs/MODULE_MATRIX.md) và [báo cáo triển khai](docs/DOCKER_IMPLEMENTATION.md). Các lệnh Node bên dưới dành cho bản demo `STORAGE_DRIVER=memory`, dữ liệu mất khi restart; không dùng production.

## Chạy trên Windows

```powershell
.\scripts\start.ps1
```

Script dùng Node.js trong `.runtime` đã chuẩn bị cho workspace này; nếu không có sẽ dùng Node.js từ PATH. Khi chưa đặt `DEMO_PASSWORD`, script hỏi mật khẩu chung cho các tài khoản mẫu, không lưu mật khẩu vào Git. Mở http://localhost:3000. Dừng bằng Ctrl+C.

Nếu đã cài Node.js (22 trở lên):

```powershell
npm ci
$env:DEMO_PASSWORD = 'mat-khau-thu-nghiem-do-ban-chon'
npm start
```

Tài khoản: `customer`, `customer2`, `planner`, `purchaser`, `manager`, `staff`, `staff2`, `qc`, `stocktaker`, `workshop`, `director`. Mật khẩu chung lấy từ `DEMO_PASSWORD`. Không có tài khoản quản trị toàn quyền; mỗi vai trò thực hiện đúng bước nghiệp vụ của mình.

`.env.example` tại app mô tả cấu hình Node trực tiếp. Ứng dụng đọc `app/.env`, biến môi trường đã đặt được ưu tiên. Bản memory sinh session secret nếu chưa đặt và chặn production. Bản MySQL yêu cầu secret bền vững; production yêu cầu Secure cookie. Docker tự cấp các secret qua volumes.

Nếu dùng `.env`: sao chép `.env.example` thành `.env`, đặt password/secret của bạn, rồi chạy `npm start`. File được Git bỏ qua. DB_* được dùng khi STORAGE_DRIVER=mysql; cần chạy migration và chuẩn bị DB trước. Cách Docker từ root đơn giản hơn.

## Kiểm thử

```powershell
.\scripts\test.ps1
.\scripts\test.ps1 -Browser
```

Hoặc dùng `npm test`, `npm run check`, `npm run test:browser`. Kiểm thử trình duyệt dùng Edge/Chrome có sẵn trên Windows; có thể cấu hình `BROWSER_PATH`. Nếu không có trình duyệt này, cài Chromium cho Playwright trước. Ảnh giao diện và kết quả kiểm thử nằm trong `artifacts/`.

## Luồng theo SRS mới

1. Khách đặt đơn → planner tiếp nhận, lập kế hoạch sản xuất và chọn xưởng → director duyệt đơn cùng các kế hoạch nháp. Khách nhìn thấy **Đã tiếp nhận** sau khi duyệt; không đồng nhất với bước planner nhận đơn.
2. Chủ xưởng báo cáo NVL hiện có/cần thiết → gửi báo cáo → lập yêu cầu **Bổ sung NVL / yêu cầu mua** từ lượng thiếu → planner lập kế hoạch mua liên kết yêu cầu → director duyệt → purchaser tạo đơn mua.
3. Manager tạo metadata lô dự kiến theo đơn mua, chưa phát sinh tồn → director lập đợt **Kiểm tra chất lượng** và giao QC → QC ghi lượng đạt/lỗi. NVL lỗi được ghi là trả NCC trước nhập; chỉ phần đạt mới được yêu cầu nhập.
4. Chủ xưởng lập yêu cầu nhập/xuất, chọn quản lý kho → manager phân công từng dòng/lô/vị trí/số lượng và nhân viên → nhân viên xem **Công việc** và **Ghi phần hàng được giao**. Người khác không được đọc/ghi phần hàng này.
5. Chủ xưởng báo cáo thành phẩm, tạo lô → gửi báo cáo → director lên lịch QC thành phẩm → QC ghi kết quả. Phần lỗi tạo đề xuất để director duyệt ghi chú xử lý; chưa ghi sổ nên duyệt ghi chú không tự tạo biến động giảm kho.
6. Thành phẩm đạt được nhập kho rồi giao từ kế hoạch bán/yêu cầu xuất. Giao một phần giữ đơn **Đang thực hiện**; đủ tổng lượng đơn mới **Hoàn thành**.
7. Sau khi nhân viên ghi đủ phiếu, manager lưu **Hồ sơ kho tổng hợp** từ các phiếu đó; director và chủ xưởng xem hồ sơ theo quyền.
8. Đợt **Kiểm đếm tồn kho** khóa kho và chụp snapshot. Stocktaker lưu số đếm/hoàn tất/lập biên bản → manager đề xuất chênh lệch → director duyệt và đóng đợt. Lịch QC không khóa tồn kho.

## Các quyết định triển khai

- Ưu tiên mô tả công việc mới trước các quy tắc đề xuất cũ đang mâu thuẫn trong phần sau của SRS; không sửa đoạn mô tả người dùng vừa thêm.
- “Lô về nhưng chưa đưa vào hệ thống” được triển khai là **chưa nhập tồn**. Metadata lô vẫn cần để liên kết lịch QC, kết quả và chứng từ nguồn.
- QC thành phẩm lỗi trước nhập: phê duyệt ghi chú/phương án; không giả tạo phiếu giảm kho. Công đoạn xử lý vật lý, QC lại và thu hồi hàng đã giao chưa được mô tả đầy đủ nên chưa tự động hóa.
- Chưa có hạn mức xử lý chênh lệch cụ thể: mọi điều chỉnh vẫn cần director duyệt, theo BR-23 hiện có.
- Không suy ra BOM hay tự tăng tồn từ số xưởng báo cáo.

## Cấu trúc

- `src/app.js`: ghép cấu hình, middleware và routes.
- `src/routes/`, `src/controllers/web/`, `src/controllers/api/`: URL, render EJS và JSON API.
- `src/views/`: layout, partials, đăng nhập, dashboard và bảng/form EJS.
- `src/config/`: `.env`, session, navigation và MySQL pool.
- `src/models/`, `src/validators/`, `src/utils/`: metadata thực thể, kiểm tra form và tiện ích.
- `src/services/domain/service.js`: service façade, phân quyền và transaction/replay.
- `src/services/domain/workflows.js`, `inventory.js`: chứng từ, nhập/xuất, kiểm đếm, báo cáo.
- `src/services/domain/editing.js`: sửa chi tiết chứng từ và đồng bộ lô.
- `src/services/domain/business-flow.js`, `dispatch.js`, `lookup.js`: luồng SRS mới, điều phối và phạm vi dữ liệu.
- `src/repositories/`: adapter bộ nhớ và seed. Tồn ban đầu rỗng; chỉ phiếu nhập mới tạo tồn.
- `public/css/`, `public/js/`: CSS và JavaScript tăng tương tác cho trang EJS, cùng origin.
- `tests/`: kiểm thử nghiệp vụ và HTTP; `e2e/`: kiểm thử trình duyệt xuyên suốt.
- `docs/IMPLEMENTATION.md`: ánh xạ triển khai và khác biệt hợp đồng API.

## Phần chờ CSDL và giới hạn

MySQL foundation có migration, SQL session/auth/catalog đọc/thông báo và locking cho login/migration/seed. Adapter transaction nghiệp vụ vẫn chưa hoàn thiện; transaction demo dùng snapshot đồng bộ, không thay thế kiểm thử concurrency MySQL. Backup/restore mới có hướng dẫn, chưa thử phục hồi thực tế. Xem DOCKER_IMPLEMENTATION.md để phân biệt phần đã làm và pending.

Giao diện render tại server bằng EJS. Đăng nhập, dashboard, xem danh sách/chi tiết và tạo/sửa mặt hàng hoạt động khi tắt JavaScript. Các form nghiệp vụ nhiều dòng dùng JavaScript cùng API để chọn nguồn, phân công và ghi sổ. Form lịch/đợt hiện chọn một kho hoặc một lô và một người, API có thể nhận nhiều; nhập số đếm tối đa 200 dòng/lần. Xuất CSV không áp dụng phân trang và giữ cùng mốc/bộ lọc báo cáo. Chi tiết dòng dùng UUID tạm trong adapter bộ nhớ; khóa lưu trữ cuối cùng chưa chốt.

Chưa nghiệm thu toàn bộ 48 UC ở môi trường triển khai thực. Không có email/SMS thật, quản trị tài khoản, quên mật khẩu, ảnh upload, thanh toán hay kế toán. Các tài liệu nghiệp vụ/CSDL gốc được giữ để đối chiếu.
