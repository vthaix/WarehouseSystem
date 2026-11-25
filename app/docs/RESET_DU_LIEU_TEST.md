# Nút xóa dữ liệu test

## Nút hiện hành (từ 25/11/2026): khôi phục bộ dữ liệu test mặc định

Trong môi trường development, mọi tài khoản đăng nhập đều có **Xóa dữ liệu test** cạnh **Đăng xuất**. Bấm nút, đọc phạm vi, nhập chính xác `XOA DU LIEU TEST` rồi xác nhận. Toàn bộ CSDL trở về đúng bộ dữ liệu mặc định: chứng từ, tồn kho, danh mục, mặt hàng, kho, nhà cung cấp và tài khoản. Dữ liệu tự thêm hoặc tự sửa sẽ mất; hệ thống sao lưu trước vào `/var/backups/warehouse`. Mọi người đăng nhập lại.

Bộ dữ liệu có gì, test UC nào thì dùng bản ghi nào: xem [DU_LIEU_TEST_MAC_DINH.md](DU_LIEU_TEST_MAC_DINH.md).

- Dữ liệu nằm ở `database/seeders/default-data.json`, do `src/shared/default-data.js` nạp lại. Ngày sinh dữ liệu được dời thành hôm trước của ngày bấm nút, các ngày khác dời theo.
- Xóa và nạp trong một giao dịch: lỗi giữa chừng thì dữ liệu cũ còn nguyên. CSDL thiếu migration so với bộ dữ liệu thì báo lỗi và không xóa gì.
- Sinh lại bộ dữ liệu (khi thêm migration hoặc đổi quy tắc): trên bản review riêng có `ACCEPTANCE_MONOLITH=true`, CSDL vừa migrate + seed, chạy `node scripts/build-default-data.cjs <thư mục>` rồi chép `default-data.json` vào `database/seeders`, `DU_LIEU_TEST_MAC_DINH.md` vào `docs`. Nội dung từng UC ở `scripts/default-data/scenarios.cjs`.
- Các bài kiểm thử tự động cần CSDL trống (`monolith-acceptance`, `rebuild-monolith-fixtures-test`, `queue-demo-check`): đặt `RESET_DEFAULT_DATA=false`, khi đó nút chỉ xóa chứng từ và giữ tài khoản, danh mục như trước.

Chức năng bắt buộc đồng thời `NODE_ENV=development` và `ENABLE_TEST_RESET=true`; production luôn tắt.

## Ghi chép cũ (bản nhiều service, tháng 10/2026)

Phần dưới giữ để tra cứu, không còn đúng với nút hiện hành.

Gateway tạm chặn yêu cầu mới và đợi yêu cầu đang chạy xong. Tiện ích nội bộ `test-reset` sao lưu đủ sáu schema vào volume `database_backups`, xóa trong transaction rồi đối chiếu dữ liệu. Thành công hiển thị đường dẫn backup và nút **Đăng nhập lại**; mọi phiên cũ đã bị xóa. Gửi lại cùng mã yêu cầu trả kết quả cũ, không xóa dữ liệu vừa tạo sau lần xóa trước. Không tự chạy chức năng này khi khởi động.

Gateway không có mật khẩu root. Tiện ích quản trị chạy riêng trong mạng backend, không mở cổng ra máy, chỉ nhận yêu cầu ký HMAC, kiểm tra tài khoản đang hoạt động và phiên. Chức năng bắt buộc đồng thời `NODE_ENV=development` và `ENABLE_TEST_RESET=true`; production luôn tắt. Tiện ích này là công cụ test tạm thời, không phải service nghiệp vụ mới.

Để tắt nút và endpoint khi hoàn thành:

```powershell
$env:ENABLE_TEST_RESET="false"
docker compose up -d --wait app test-reset
```

Khi kết quả bị gián đoạn/không xác định, gateway giữ trạng thái bảo trì; kiểm tra `docker compose logs test-reset`, file kết quả trong `/var/backups/warehouse/test-reset-results/` và dữ liệu trước khi khởi động lại gateway. Không tự gửi mã xóa mới để xử lý timeout. Công cụ hỗ trợ cấu hình hiện hành một gateway; không dùng với nhiều gateway độc lập.

Kiểm chứng: `tests/unit/test-reset.test.js` kiểm quyền chung, CSRF, xác nhận, chờ yêu cầu đang chạy, chặn yêu cầu mới và cờ tắt/production; `scripts/reset-tools-smoke.cjs` chạy cuối split acceptance trên CSDL riêng; `e2e/reset-data.cjs` kiểm tra nút trên 11 tài khoản với API xóa được mock để giữ nguyên dữ liệu test tay.

## Lần dọn dữ liệu ban đầu

Ngày 22/10/2026 đã dọn toàn bộ chứng từ nghiệp vụ trên sáu schema service, giữ tài khoản/quyền/xưởng phụ trách, khách hàng, mặt hàng, loại hàng, đơn vị, nhà cung cấp, xưởng, kho và vị trí. Tồn kho bắt đầu bằng 0. Phiên đăng nhập cũ đã xóa, cần đăng nhập lại.

Đã sao lưu sáu schema trước khi xóa, tại volume `database_backups`, đường dẫn `/var/backups/warehouse/reset-2026-10-22T07-36-06-522Z`. File `reset-result.json` ghi các bảng đã xóa, số dòng trước xóa và danh mục giữ lại. Database nguồn cũ `KhoHang` không phải dữ liệu runtime, giữ nguyên cho lịch sử migration.

Chạy như bình thường: `docker compose up -d --build --wait`. `demo-fixtures` mặc định dùng `SEED_WORKFLOWS=false`, không tự dựng lại đơn/kế hoạch/tồn. Không chạy browser test tạo đơn nếu đang muốn giữ dữ liệu trống.

Chỉ khi muốn dựng lại 36 kịch bản demo, chủ động đặt `$env:SEED_WORKFLOWS="true"` trước khi chạy Compose. Để trở về mặc định trong PowerShell: `Remove-Item Env:SEED_WORKFLOWS -ErrorAction SilentlyContinue`. Bật lại sẽ sinh chứng từ; checkpoint trước lần reset đã được chuyển vào thư mục backup.

Script quản trị `scripts/reset-workflow-data.cjs --execute` yêu cầu dừng các service ứng dụng trước, chỉ dùng môi trường development. Nó sao lưu trước, kiểm tra bảng thuộc phạm vi, xóa trong transaction và đối chiếu số dòng; không xóa danh mục, không drop database, không sửa migration. Số ID không quay về 1 để tránh tái sử dụng mã cũ.
