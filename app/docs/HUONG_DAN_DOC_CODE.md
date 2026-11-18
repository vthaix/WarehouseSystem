# Hướng dẫn đọc code WarehouseSystem

Tài liệu này giúp từng thành viên tìm nhanh **logic nghiệp vụ, điều kiện và ràng buộc** của UC mình phụ trách. Đường dẫn tính từ thư mục `app/`.

Cập nhật: 18/11/2026.

---

## 1. Một thao tác đi qua những lớp nào

```
Trình duyệt (public/js/*.js)
   │  gọi api("đường-dẫn", "POST", dữ liệu)  →  /api/v1/...
   ▼
src/shared/ModuleRoutes.js        Khai báo route: URL nào gọi hàm nào, vai trò nào được gọi
   ▼
src/modules/<module>/*Service.js  LOGIC NGHIỆP VỤ: kiểm tra quyền, điều kiện, ràng buộc, ghi CSDL
   ▼
src/config/vietnamese-sql.js      Dịch tên bảng/cột tiếng Anh trong SQL sang tên tiếng Việt trong MySQL
   ▼
MySQL (database/monolith/*.sql|cjs = cấu trúc bảng và các migration)
```

**Muốn biết một ràng buộc nằm ở đâu, đọc file `*Service.js` của module trước.** Giao diện chỉ kiểm tra sơ bộ cho tiện người dùng. Mọi điều kiện bắt buộc đều được server kiểm tra lại.

---

## 2. Quy ước cần biết trước khi đọc

| Thấy trong code | Ý nghĩa |
|---|---|
| `P.role(user, ["DIRECTOR"])` | Chỉ vai trò trong danh sách được làm thao tác này (ngoại lệ "không có quyền"). Định nghĩa ở `src/services/domain/policy.js`. |
| `C.fail(điều_kiện, "MÃ_LỖI", "Thông báo", 409)` | Nếu điều kiện đúng thì dừng lại và báo lỗi cho người dùng. **Mỗi dòng `C.fail` là một ràng buộc nghiệp vụ**, nên đọc kỹ các dòng này. Định nghĩa ở `src/services/domain/core.js`. |
| `C.fields(body, [...])` | Chỉ nhận các trường được liệt kê; gửi trường lạ sẽ bị từ chối. |
| `C.version(bản_ghi, body.version)` | Chống ghi đè: dữ liệu đã bị người khác sửa thì báo "Dữ liệu đã thay đổi. Vui lòng tải lại." (ngoại lệ 3.3 trong đặc tả). |
| `C.state(bản_ghi, ["PENDING"])` | Chỉ thao tác khi chứng từ đang ở trạng thái cho phép. |
| `C.qty`, `C.price`, `C.date`, `C.text` | Kiểm tra số lượng (3 chữ số thập phân), đơn giá, ngày, chuỗi. |
| `this.transaction(async (c) => {...})` | Mọi thao tác ghi trong khối này thành công cùng nhau hoặc hủy cùng nhau. |
| `... FOR UPDATE` | Khóa bản ghi trong transaction để hai người không cùng sửa một lúc. |
| `Idempotency-Key` / `retryKey` | Bấm lại sau khi mất mạng không tạo thêm chứng từ mới (ngoại lệ "không kết nối được"). |
| `notifications` | Câu lệnh `INSERT INTO notifications` là nơi gửi thông báo cho người liên quan. |
| `audit_logs` | Nhật ký ai đã làm gì. |
| Tên bảng tiếng Anh trong SQL (`items`, `stock_requests`) | Được dịch sang tên thật (`MatHang`, `PhieuYeuCauNhapXuat`). Bảng dịch nằm ở `database/adminer/identifiers.json`. |

**Đầu mỗi file đã viết lại có khối chú thích** liệt kê UC nào nằm ở hàm nào (ví dụ `CatalogWriteService.js`, `StockRequestService.js`). Đọc khối đó trước.

---

## 3. Tra cứu theo UC

Cột "Giao diện" là file JavaScript vẽ form/màn hình. Cột "Nên đọc" là hàm hoặc ràng buộc chính.

### Trần Văn Thái — UC-29, UC-06.x, UC-07.x, UC-08, UC-09, UC-13

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-29 Tiếp nhận đơn hàng | `modules/customer-orders/OrderService.js` → `receive()`, `list()`, `detail()` | `public/js/order-receiving.js` | Chỉ Bộ phận lập kế hoạch; chỉ đơn `SUBMITTED` → `RECEIVED`; đơn đã tiếp nhận báo lỗi; danh sách lọc sẵn đơn chờ. |
| UC-06, 06.1–06.3 Danh mục kho | `modules/catalog/CatalogWriteService.js` → `create/update/remove("categories")` | `public/js/catalog-forms.js` → `categoryForm()`, `showCategoryCards()` | Bắt buộc tên và nhóm (NVL / thành phẩm); tên không trùng; mã tự sinh `DM-001`; đổi nhóm khi còn mặt hàng nhóm khác bị chặn; xóa khi còn mặt hàng / khu kho bị chặn; có `version` chống ghi đè. |
| UC-07, 07.1–07.3 Mặt hàng | Cùng file trên, `resource = "items"`; danh sách và tìm kiếm ở `modules/catalog/CatalogRepository.js` | `public/js/catalog-forms.js` → `itemForm()` | Mã tự sinh `NVL-…`/`TP-…`; danh mục phải cùng nhóm; giá phải là số ≥ 0; mặt hàng đã phát sinh chứng từ thì không đổi danh mục / ĐVT và không xóa được (`ITEM_USAGE`, `itemUsage()`). |
| UC-08 Quản lý nhập kho, UC-09 Quản lý xuất kho | `modules/warehouse/WarehouseFlowService.js` → `preview()` (dữ liệu form phân công), `dispatch()` (lưu phân công), `cancelAllocation()` (giải phóng), `assertNoScheduleConflict()` | `public/js/workflow-forms.js` → `dispatchForm()`, `dispatchTimeFields()`; phần "Phiếu đã ghi sổ" ở `public/js/actor-workspace.js` → `history()` | Chỉ quản lý phụ trách yêu cầu; kho đang kiểm kê thì không phân công; không vượt lượng còn lại / lượng QC đạt / tồn khả dụng; vị trí phải đúng kho và đúng khu nhóm hàng; lịch trùng nhân viên bị chặn. Thứ tự lô xuất (hạn dùng → ngày nhập đầu tiên → mã lô): `src/shared/storage-queue.js` → `compare()`. Gợi ý ô nhập theo hạn dùng: cùng file → `recommend()`. |
| UC-13 Lập đợt kiểm kê | `modules/tasks/TaskService.js` → `create()`, `validate()`; `modules/tasks/inspection-task.js` → `create()`; `modules/quality/QualityCampaignService.js` → `create()` | `public/js/task-inspection-forms.js` (form "Lập đợt kiểm kê") | Chỉ Ban giám đốc; nhân viên thuộc QC/AC hoặc Ban kiểm kê; người lập biên bản phải thuộc danh sách được giao; thời gian không ở quá khứ, kết thúc sau bắt đầu, không trước ngày nhận hàng; phần lô đã có đợt còn hiệu lực bị chặn; lịch trùng bị chặn. |

### Nguyễn Tiến Dũng — UC-02, UC-03, UC-03.1, UC-32, UC-16, UC-22

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-02 Đặt đơn hàng | `modules/customer-orders/OrderService.js` → `create()`, `validateLines()`; địa chỉ: `src/shared/vn-address.js` → `compose()` | `src/views/customer/order.ejs`, `public/js/customer-order.js`, `public/js/address-picker.js` | Chỉ khách hàng; 1–100 dòng; chỉ bánh mẫu đã công bố; địa chỉ chọn Tỉnh/Thành → Phường/Xã (phường phải thuộc tỉnh) + số nhà, tên đường. |
| UC-03, UC-03.1 Quản lý / sửa đơn | `OrderService.js` → `list()`, `get()`, `update()` | `public/js/forms.js` → `editForm()` nhánh `customer-orders` | Chỉ sửa khi `SUBMITTED`/`RECEIVED`; đổi số lượng phải tích xác nhận; không giảm dưới lượng đã lập KHSX; ngày nhận không trước ngày kết thúc KHSX. |
| UC-32 Duyệt kế hoạch mua/bán | `modules/business-plans/BusinessPlanService.js` → `review()` | `public/js/workflow-forms.js`, `public/js/forms.js` (`actionForm` "review") | Điều kiện duyệt / từ chối trong `review()`. |
| UC-16 Xử lý chênh lệch kiểm kê | `modules/exceptions/ExceptionService.js` → `create()`, `apply()`; `minute-exceptions.js` | `public/js/quality-problems.js`, `public/js/minute-exception-forms.js` | Đề xuất xử lý theo biên bản; áp dụng tồn sau khi được duyệt. |
| UC-22 Tra cứu kho | `modules/reporting/warehouse-lookup.js`, `ReportService.js` → `warehouseLookup()` | `public/js/warehouse-lookup.js`, `public/js/warehouse-seats.js` | Chỉ đọc; không tự chuyển hàng. |

### Vũ Uyên Thy — UC-17, UC-18 → UC-21, UC-25.x

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-17 Phê duyệt đề xuất ngoại lệ | `modules/exceptions/ExceptionService.js` → `review()`; `proposal-workshop.js` → `requireApprover()` | `public/js/quality-problems.js`, `public/js/workflow-forms.js` | **Chủ xưởng của xưởng liên quan** duyệt (quyết định 18/11/2026); xưởng lưu ở cột `MaXuong` (migration 014). |
| UC-18 Tồn kho, UC-19/20 Hồ sơ xuất/nhập, UC-21 Báo cáo kiểm kê | `modules/reporting/ReportService.js` → `inventory()`, `stockDocuments()`, `stocktakes()`, `csv()` | `public/js/app.js` (màn `reports/*`); phiếu: `WarehouseFlowService.js` → `documents()`, `document()` | Phạm vi xem theo vai trò; xuất CSV. |
| UC-25, 25.1, 25.2 Quản lý công việc | `modules/tasks/TaskService.js` → `list()`, `update()`, `remove()`, `validate()` | `public/js/forms.js` (nhánh `tasks`), `public/js/task-inspection-forms.js` | Không xóa công việc đã bắt đầu; giữ giờ bắt đầu cũ thì không kiểm tra "quá khứ"; lịch trùng; báo người được giao. |

### Trương Bảo Huy — UC-31, UC-14, UC-23, UC-24.x, UC-27

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-31 Duyệt KHSX | `modules/production/ProductionPlanService.js` → `review()` | `public/js/forms.js` (`actionForm` "review") | Duyệt KHSX thì tự cập nhật đơn hàng liên quan; từ chối cần lý do. |
| UC-14 Đơn mua, UC-27 Mua hàng | `modules/purchasing/PurchaseOrderService.js` → `list()`, `get()`, `create()`; `modules/quality/purchase-plan-check.js` | `public/js/material-prices.js`, `public/js/purchase-plan-check.js`, `public/js/purchase-budget.js` | Nguồn từ kế hoạch mua đã duyệt; giá NCC. |
| UC-23 Yêu cầu nhập/xuất | `modules/stock-requests/StockRequestService.js` → `create()`; `request-sources.js` (nguồn hợp lệ, hạn mức); `request-lines.js` → `validate()`; `sale-readiness.js` (điều kiện xuất bán); `partial-receipt.js` (nhập thành phẩm từng phần) | `public/js/stock-request-workflow.js` → `openRequestModal()`, `setupRequestForm()` | Không vượt lượng nguồn còn lại; xuất thành phẩm chỉ khi đã có báo cáo tổng kết và đã tới ngày giao. |
| UC-24, 24.1, 24.2 Quản lý / sửa / xóa yêu cầu | `StockRequestService.js` → `list()`, `get()`, `update()`, `remove()`; quyền: `request-permissions.js` | `public/js/stock-request-workflow.js` → `editForm()` | Chỉ sửa / hủy khi chưa thực hiện; quyền hủy của quản lý kho: `managerCancelBlocker()`. |

### Trần Quốc Tuấn — UC-04, UC-05.x, UC-10, UC-11.x, UC-35

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-04, 05, 05.1, 05.2 Kế hoạch mua/bán | `modules/business-plans/BusinessPlanService.js` → `create()`, `update()`, `remove()`, `validateLines()`, `validatePurchaseSource()` | `public/js/forms.js`, `public/js/workflow-forms.js`, `public/js/purchase-budget.js`, `public/js/minute-compensations.js` | Nguồn kế hoạch, dòng hàng, ngân sách. |
| UC-10 Nhập kho, UC-11 / 11.01 / 11.02 Xuất kho (nhân viên ghi phiếu) | `modules/warehouse/WarehouseFlowService.js` → `post()`; trạng thái yêu cầu: `stock-requests/partial-progress.js` | `public/js/stock-request-workflow.js` → `postForm()` | Chỉ ghi phần được phân công; không vượt lượng giao; xuất thì trừ tồn, nhập thì cộng tồn; xuất bán kiểm tra `sale-readiness.js`. |
| UC-35 Báo cáo thành phẩm | `modules/production/FinishedReportService.js` → `create()`, `update()`, `submit()`; `finished-report-progress.js` | `public/js/task-inspection-forms.js` (báo cáo từng phần), `public/js/workflow-forms.js` | Báo cáo từng phần (`PART`) và báo cáo tổng kết. |

### Trần Như Ý — UC-01, UC-12.x, UC-34, UC-15, UC-28

| UC | Server | Giao diện | Nên đọc |
|---|---|---|---|
| UC-01 Đăng nhập | `modules/auth/AuthService.js` → `authenticate()`; `src/routes/auth.routes.js`; phiên: `src/config/session.js` | `src/views/auth/*`, `public/js/admin-ui.js` | Khóa / sai mật khẩu; cookie `httpOnly`. |
| UC-12, 12.1–12.3 Kết quả QC/AC | `modules/quality/QualityService.js` → `create()`, `update()`, `remove()`, `validateLines()`, `editActions()` | `public/js/forms.js` (nhánh `qc-inspections`), `public/js/purchase-plan-check.js` | Chỉ xóa trước khi lập biên bản; lượng đạt + lỗi khớp lượng kiểm. |
| UC-34 Phiếu báo cáo sản xuất | `modules/production/ProductionReportService.js` → `create()`, `update()`, `submit()` | `public/js/production-report-forms.js` | Dòng nguyên liệu, gửi báo cáo. |
| UC-15 Thực hiện kiểm kê | `modules/stocktakes/StocktakeService.js` → `counts()`, `complete()`, `notifyCounters()` | `public/js/inspection-workflow.js`, `public/js/warehouse-count-assignments.js` | Chỉ nhân viên Ban kiểm kê được giao mới đếm. |
| UC-28 Lập biên bản kiểm kê | `StocktakeService.js` → `minuteWrite()`; `modules/stocktakes/inspection-minutes.js` | `public/js/inspection-workflow.js`, `public/js/minute-exception-forms.js` | Người lập biên bản được chỉ định; thiếu hàng thì sinh ngoại lệ. |

---

## 4. File dùng chung nên biết

| File | Nội dung |
|---|---|
| `src/services/domain/core.js` | Các hàm kiểm tra: `fail`, `qty`, `price`, `date`, `text`, `fields`, `version`, `state`. |
| `src/services/domain/policy.js` | Vai trò nào được xem / tạo / sửa từng loại dữ liệu (`P.read`, `P.create`, `P.editable`). |
| `src/shared/ModuleRoutes.js` | Bảng URL → hàm service. Tìm tên URL ở đây để biết hàm nào xử lý. |
| `src/shared/time-rules.js` | Quy tắc ngày giờ: phải có múi giờ, kết thúc sau bắt đầu, không ở quá khứ. |
| `src/shared/storage-queue.js` | Thứ tự lô xuất (FEFO) và gợi ý vị trí nhập theo hạn dùng. |
| `src/shared/vn-address.js` + `public/data/vn-address-units.json` | Danh mục 34 tỉnh/thành, 3.321 phường/xã; kiểm tra địa chỉ giao hàng. |
| `src/shared/readable-codes.js`, `record-code.js` | Sinh mã chứng từ dễ đọc (`YC-NHAP-…`, `CV-XUAT-…`). |
| `src/modules/notifications/pending-work.js` | "Công việc chờ xử lý" của từng vai trò. |
| `public/js/app.js` | Khung giao diện: `api()`, `esc()`, `openModal()`, danh sách, chi tiết. |
| `public/js/forms.js` | Form chung: `inputField()`, `formWrap()`, `bindForm()`, `createForm()`, `editForm()`, `actionForm()`. |
| `src/views/layouts/main.ejs` | Thứ tự nạp các file giao diện. File nạp sau có thể bọc (ghi đè) hàm của file nạp trước. |
| `database/monolith/` | Cấu trúc bảng (`001_schema.sql`) và các migration 002 → 016. |

---

## 5. An toàn: chống XSS và SQL injection

Kết quả rà soát ngày 18/11/2026: không còn chỗ nào ghép dữ liệu người dùng vào câu SQL. Một chỗ in dữ liệu chưa mã hóa ở `stock-request-workflow.js` đã được sửa. Bài kiểm thử tấn công thật đạt 18/18: chèn `<script>`/`onerror` vào tên, địa chỉ, ghi chú; chèn `' OR 1=1`, `DROP TABLE` vào ô tìm kiếm, id, phân trang và đăng nhập.

**Khi viết code mới, giữ đúng 4 quy tắc sau:**

1. **SQL luôn dùng dấu `?`**:
   ```js
   // ĐÚNG
   await c.execute("SELECT * FROM items WHERE name=?", [name]);
   // SAI – tuyệt đối không ghép chuỗi người dùng nhập
   await c.execute("SELECT * FROM items WHERE name='" + name + "'");
   ```
   Chỉ được ghép **tên bảng / tên cột cố định viết sẵn trong code** (ví dụ `definition.table`), không bao giờ ghép giá trị lấy từ `req.body` / `req.query`. Kết nối CSDL đã tắt chạy nhiều câu lệnh một lúc (`multipleStatements: false` trong `src/config/database.js`).
2. **Mọi giá trị đưa vào HTML phải qua `esc()`**:
   ```js
   html += `<td>${esc(item.name)}</td>`;   // ĐÚNG
   html += `<td>${item.name}</td>`;        // SAI
   ```
   Chữ thuần thì dùng `element.textContent = ...` (như `toast()`). Trong EJS dùng `<%= %>` (có mã hóa), không dùng `<%- %>` cho dữ liệu người dùng.
3. **Không viết script hoặc `onclick=` trong HTML.** Trang có CSP `script-src 'self'; script-src-attr 'none'` (cấu hình bằng `helmet` trong `src/shared/create-mysql-app.js`), nên script chèn vào trang không chạy được. Gắn sự kiện bằng `element.onclick = ...` trong file `.js`.
4. **Ảnh tải lên** chỉ nhận PNG / JPEG / WebP và được kiểm tra nội dung file (`src/config/category-images.js` → `decode()`); đường dẫn ảnh lưu trong CSDL cũng được kiểm tra lại (`validatePath()`).

---

## 6. Chạy thử và dữ liệu demo

- Tài khoản demo: `../DEMO_ACCOUNTS.md` ở thư mục gốc dự án (mật khẩu `123456`). Kịch bản dữ liệu mẫu: `docs/DEMO_FIXTURES.md`.
- Kiểm tra cú pháp: `npm run check`. Unit test: `npm test`.
- Kiểm thử giao diện: thư mục `e2e/` (Playwright).
- Bản code trước đợt viết lại cho dễ đọc được lưu ở `backups/pre-refactor-20261118/` (ngoài thư mục `app/`) để so sánh.
