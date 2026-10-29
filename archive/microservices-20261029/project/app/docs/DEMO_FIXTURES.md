# Dữ liệu dựng sẵn để test từng UC độc lập

Cập nhật 17/10/2026. Script `scripts/seed-demo-workflows.cjs` dựng **36 bộ dữ liệu theo trạng thái**, thông qua API thật sau khi các service đã sẵn sàng. Không cần làm lại toàn bộ luồng chỉ để thử tiếp nhận đơn, phê duyệt, QC hay nhập/xuất.

## Cách khởi tạo trên máy mới

Hiệu chỉnh đơn vị bánh mẫu: `TP-001`…`TP-005` là gói; `TP-DEMO-01` và `TP-DEMO-03` là hộp; `TP-DEMO-02` là gói. Job demo chỉ sửa nhãn đơn vị `cái` bị gán sai của các mã này, không quy đổi lượng và không thay đơn vị người dùng đã chỉnh sang loại khác. Phần tạo chứng từ vẫn giữ checkpoint như trước.

Bổ sung 22/10/2026: job demo tạo ba mặt hàng đang công bố để khách thử UC-02: `TP-DEMO-01` bánh quy bơ hộp 200g (45.000đ), `TP-DEMO-02` bánh bông lan đóng gói 120g (22.000đ), `TP-DEMO-03` bánh quy cacao hộp 200g (49.000đ). Mở **Đặt hàng** trên menu khách hàng hoặc `/customer/orders/create`. Các mặt hàng được tạo qua API, có checkpoint chống tạo lại; không ghi đè dữ liệu đã chỉnh sửa. Công thức trong `src/config/production-recipes.json` chỉ minh họa phục vụ kiểm thử kế hoạch SX, cần xác nhận định lượng thực tế trước sử dụng chính thức.

Tại thư mục gốc:

```powershell
$env:SEED_WORKFLOWS="true"
docker compose logs --tail=60 demo-fixtures
```

Đợi log **DEMO WORKFLOWS READY: 36 independent fixtures**. Service `demo-fixtures` chỉ báo healthy sau khi dựng xong, vì vậy `--wait` chờ cả dữ liệu sẵn sàng. Sau đó tiến trình chờ nhẹ để duy trì trạng thái health, không tiếp tục ghi hoặc reset dữ liệu.

Nếu cần chạy job bằng tay khi ứng dụng đã sẵn sàng:

```powershell
docker compose run --rm --no-deps -T -e SEED_DEMO=true demo-fixtures node scripts/seed-demo-workflows.cjs
```

Từ 22/10/2026, chứng từ mẫu mặc định TẮT (`SEED_WORKFLOWS=false`) để test từ đầu. Chỉ bật `SEED_WORKFLOWS=true` khi chủ động cần 36 bộ chứng từ. `SEED_DEMO` của migrate vẫn dùng cho tài khoản/danh mục nền. Nếu SEED_DEMO=false hoặc NODE_ENV=production thì bỏ qua và vẫn báo ready. Sau khi tạo thành công, chạy lại giữ nguyên dữ liệu đã test, không reset trạng thái hoặc tạo lại bản đã xóa. Checkpoint nằm trong volume database_backups, theo định danh lần khởi tạo CSDL.

## Chọn bộ dữ liệu theo UC

Đăng nhập bằng [tài khoản mẫu](DEMO_ACCOUNTS.md). Đơn hàng/kế hoạch/báo cáo có ghi chú hoặc địa chỉ bắt đầu bằng `[DEMO <nhãn>]`; lô/kho/danh mục có mã DEMO. Mã hệ thống và ID được sinh tự động, không cố định giữa các máy.

| Nhãn bộ dữ liệu | UC / chức năng test ngay | Tài khoản / trạng thái đã dựng |
| --- | --- | --- |
| CATALOG | UC-06/07 và các nhánh thêm/sửa/xóa | manager; danh mục DEMO-UC, danh mục DEMO-XOA chưa dùng; mặt hàng DEMO-XOA-TP chưa giao dịch |
| DON-CHO | UC-29 tiếp nhận; UC-03/03.1 xem/sửa đơn | planner/customer; đơn SUBMITTED, chưa tiếp nhận |
| DON-CHO-2 | Bản dự phòng để thử tiếp nhận/sửa riêng | planner/customer; đơn SUBMITTED độc lập |
| TAO-KHSX | Nhánh lập KHSX của UC-04 | planner; đơn RECEIVED, chưa có KHSX, còn lượng để import |
| DUYET-DON | UC-31 duyệt/từ chối KHSX; đơn tự cập nhật khi duyệt | director; đã tiếp nhận, có KHSX chưa duyệt |
| BAO-CAO-SX | UC-34 báo tiến độ/sự cố/nhu cầu | workshop; KHSX đã duyệt, chưa có báo cáo |
| MUA-NGUON | UC-04 lập MUA từ báo cáo thiếu | planner; báo cáo nhu cầu đã gửi, chưa lập kế hoạch mua |
| DUYET-MUA | UC-05/05.1/05.2/32 | planner/director; kế hoạch MUA PENDING_APPROVAL, chưa có đơn mua |
| LAP-DON-MUA | UC-27 lập đơn mua từ kế hoạch | purchaser; kế hoạch MUA APPROVED, chưa có đơn mua |
| NHAN-NVL | UC-14 xem đơn mua; ghi nhận lô từ đơn | purchaser/manager; đơn mua thủ công, chưa có lô |
| QC-NVL | UC-12.1 thêm kết quả QC NVL | qc; lô 20 kg, lịch QC đã bắt đầu, chưa có kết quả |
| QC-SUA | UC-12 xem QC, quy tắc UC-12.2/12.3 | qc; đã ghi QC đạt, chưa nhập kho; việc chỉnh sai/xóa vẫn theo luật bất biến hiện hành |
| YC-NHAP | UC-23 yêu cầu nhập NVL | workshop; QC đạt 20 kg, chưa có yêu cầu nhập |
| YC-SUA | UC-24/24.1/24.2 | workshop; yêu cầu nhập còn PENDING, chưa phân công |
| NHAP-KHO | UC-10 ghi sổ nhập | staff; yêu cầu 20 kg đã phân công, chưa nhập |
| TON-KHO | UC-08/18/20/22; dữ liệu tồn cho luồng xuất | manager/workshop/director; có phiếu nhập thực, 20 kg trước các lần cấp NVL tạo fixture khác |
| YC-XUAT-NVL | UC-23 yêu cầu xuất NVL từ KHSX | workshop; KHSX duyệt, có tồn thực tế trong DEMO-KHO |
| XUAT-NVL | UC-11/11.01 | staff; yêu cầu xuất 1 kg đã phân công, chưa ghi sổ |
| BAO-CAO-TP | UC-35 lập báo cáo TP | workshop; đã cấp 1 kg NVL cho KHSX, chưa có báo cáo kết thúc |
| NHAP-TP-TAY | UC-23 nhập TP từng phần thủ công | workshop; đã cấp NVL; KHSX riêng để nhập tay phần mới hoàn thành |
| TP-NHAP | Xem/sửa/gửi báo cáo thành phẩm | workshop; báo cáo THANH_PHAM còn DRAFT |
| QC-TP | UC-12.1 kiểm thành phẩm | qc; lô 10 bánh, lịch kiểm đã bắt đầu, chưa có QC |
| NGOAI-LE | UC-17 duyệt lỗi QC | director; QC TP 8 đạt/2 lỗi, đề xuất tiêu hủy 1 đơn vị lỗi đang chờ duyệt |
| LAP-BAN | UC-04 lập kế hoạch BAN | planner; 10 bánh đạt QC, đã nhập kho, báo cáo cuối đã gửi, chưa có BAN |
| DUYET-BAN | UC-05/32 kế hoạch bán | planner/director; kế hoạch BAN chưa duyệt |
| YC-XUAT-TP | UC-23 yêu cầu xuất TP | workshop; BAN duyệt, SX hoàn tất, đủ tồn và hạn giao là ngày dựng fixture |
| XUAT-TP | UC-11.02 ghi sổ giao bánh | staff; yêu cầu giao 10 bánh đã phân công, chưa xuất |
| DA-GIAO | UC-09/19, lịch sử đơn/giao hàng, hàng khách trả | manager/director/workshop; đã giao 10 bánh bằng phiếu xuất thật |
| CONG-VIEC | UC-25/25.1/25.2 | director; công việc phân công nhân viên Ban kiểm kê và QC/AC chưa bắt đầu, có thể thử sửa/xóa đúng điều kiện |
| KK-CHO | UC-13/15 xem đợt và bắt đầu | director; kho riêng đã nhập 20 kg, đợt PLANNED |
| KK-DEM | UC-15 đếm/lưu tạm/hoàn tất | stocktaker; kho riêng đang kiểm kê, snapshot 20 kg, chưa đếm |
| KK-BIEN-BAN | UC-28 lập biên bản | qc theo phân công; đã đếm 19 kg so với snapshot 20, chưa có biên bản |
| KK-BAO-CAO | UC-21 xem báo cáo | director; biên bản đã gửi, chênh lệch -1 kg |
| KK-CHENH-LECH | UC-16 lập đề xuất điều chỉnh | manager; biên bản đã gửi, chưa có đề xuất |
| KK-DUYET | UC-17 phê duyệt chênh lệch | director; đề xuất thiếu 1 kg chờ quyết định |
| KK-AP-DUNG | UC-16 thực hiện phương án đã duyệt | manager; đề xuất APPROVED, tồn chưa điều chỉnh |

UC-02 đặt hàng và các nhánh Thêm dùng dữ liệu danh mục sẵn có, không cần chứng từ đích tồn tại trước. Các chức năng xóa/sửa/duyệt là thao tác tiêu thụ hoặc thay đổi fixture: dùng đúng bộ riêng, không kỳ vọng một bản vừa xóa vẫn có thể dùng cho ca sau. Bảng này tạo tiền điều kiện để thử UC, không khẳng định mọi ca ngoại lệ đều đã được chạy đạt.

Xem chính xác ID/mã các bản đã tạo trên máy đang chạy:

```powershell
docker compose run --rm --no-deps -T -e SEED_DEMO=true demo-fixtures node scripts/seed-demo-workflows.cjs --list
```

Các kho kiểm kê là kho riêng DEMO-KK-…; những đợt đang mở khóa kho đó, không khóa kho DEMO-KHO đang dùng nhập/xuất. Các công việc/lịch QC được xếp vào các khoảng riêng để không trùng nhau. Ngày demo được chốt khi dựng lần đầu; không tự đổi ngày hoặc trạng thái trên chứng từ bạn đã dùng khi khởi động lại.

## Kiểm chứng dữ liệu khởi tạo

Đã chạy trên CSDL hiện có và một project Docker/volume mới độc lập: tạo đủ 36 nhóm, kiểm tra trạng thái nguồn, phiếu/tồn và chênh lệch kiểm kê. Chạy lại trên volume mới không thay đổi số dòng các bảng nghiệp vụ Business/Warehouse. Bộ nghiệm thu MySQL microservice và 51 test tự động tiếp tục đạt.

Ngay sau khi khởi tạo, trước khi tự thay đổi fixture, có thể kiểm tra:

```powershell
docker compose exec -T demo-fixtures node scripts/verify-demo-fixtures.cjs
```

Nếu đã tiếp nhận/duyệt/xóa chứng từ mẫu, verifier có thể báo khác trạng thái ban đầu; đó không phải lệnh reset. Trong quá trình dựng fixture đã sửa TaskService để khóa lịch bằng advisory lock và đọc dữ liệu Identity với quyền SELECT, thay cho khóa FOR UPDATE cần quyền ghi lên Identity; không cấp thêm quyền sửa tài khoản cho Warehouse.

## Ảnh upload ở đâu?

**Cách dùng thông thường:** đăng nhập manager → Danh mục → Thêm/Sửa → Chọn ảnh → Lưu. Bạn chọn ảnh từ bất kỳ thư mục nào trên máy, không cần tự chép vào source.

| Cách chạy | Nơi lưu file đã upload |
| --- | --- |
| Node trực tiếp | `app/src/images/categories/` mặc định; có thể cấu hình CATEGORY_IMAGE_DIR |
| Docker Compose | `/app/src/images/categories/` bên trong gateway, được lưu lâu dài trong named volume `warehouse-system_category_images` theo tên project mặc định |

Khi chạy Docker, ảnh không tự xuất hiện trong thư mục source trên Windows vì đó là named volume. Tên ảnh được hệ thống tạo ngẫu nhiên; đường dẫn lưu trên danh mục là `/images/categories/<tên-file>`. Chỉ nhận PNG/JPEG/WebP tối đa 5 MB. Business mount ảnh ở chế độ đọc để xác nhận file tồn tại.

Không tự điền đường dẫn `C:\...` vào thuộc tính ảnh và không chỉ chép ảnh tùy tên vào thư mục rồi coi là đã liên kết với danh mục. Muốn máy khác có cùng ảnh đã upload, cần chuyển volume/bản sao ảnh riêng; Git chỉ giữ `.gitkeep`. Xem [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
