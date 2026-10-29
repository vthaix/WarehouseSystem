# Dữ liệu test từng UC của bản mono

Mặc định máy mới có tài khoản, 3 xưởng và danh mục bánh. Các chứng từ mẫu chỉ được tạo khi chủ động chạy:

```powershell
docker compose exec -T -e SEED_DEMO=true app node scripts/seed-demo-workflows.cjs
docker compose exec -T app node scripts/verify-demo-fixtures.cjs
```

Công cụ dựng 36 bộ trạng thái bằng API thật. Đơn mua mẫu cũng phải có kế hoạch mua đã được duyệt. Chạy lại dùng checkpoint, không tự đặt lại trạng thái đã test. Nút xóa dữ liệu test sao lưu rồi xóa các chứng từ và chuyển checkpoint sang thư mục lưu; giữ tài khoản, danh mục và đơn vị hiện có.

Công cụ không đổi đơn vị của các mặt hàng đã có. Ba mặt hàng TP-DEMO tùy chọn dùng đơn vị hộp hoặc gói theo tên sản phẩm. Ảnh danh mục nằm trong `app/src/images/categories`; ảnh báo cáo trong `app/src/images/production-reports`.


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

Đã dựng đủ 36 nhóm trên project mono thử nghiệm, kiểm tra trạng thái nguồn, phiếu/tồn và chênh lệch kiểm kê. Chạy lại không tăng số dòng chứng từ nghiệp vụ; bộ đếm phiên, đăng nhập, nhật ký và thông báo được tách khỏi phép so sánh số chứng từ. Kết quả mới xem MONOLITH_TEST_RESULTS.md.

Ngay sau khi khởi tạo, trước khi tự thay đổi fixture, có thể kiểm tra:

```powershell
docker compose exec -T demo-fixtures node scripts/verify-demo-fixtures.cjs
```

Nếu đã tiếp nhận, duyệt hoặc xóa chứng từ mẫu, verifier có thể báo khác trạng thái ban đầu; đây không phải lệnh reset. Mỗi nhóm chỉ được dựng khi chưa có checkpoint của nhóm đó. Sau khi xóa dữ liệu test, công cụ tái sử dụng danh mục còn giữ thay vì tạo trùng mã danh mục.

## Ảnh upload ở đâu?

**Cách dùng thông thường:** đăng nhập manager → Danh mục → Thêm/Sửa → Chọn ảnh → Lưu. Bạn chọn ảnh từ bất kỳ thư mục nào trên máy, không cần tự chép vào source.

| Cách chạy | Nơi lưu file đã upload |
| --- | --- |
| Node trực tiếp | `app/src/images/categories/` mặc định; có thể cấu hình CATEGORY_IMAGE_DIR |
| Docker Compose | `/app/src/images/categories/` trong ứng dụng mono, lưu tại volume `mono_images` |

Ảnh tải lên trong Docker được lưu ở volume; dùng `docker compose cp app:/app/src/images ./backups/images` nếu muốn chép ra máy. Tên ảnh được hệ thống tạo ngẫu nhiên; đường dẫn trên danh mục là `/images/categories/<tên-file>`. Chỉ nhận PNG/JPEG/WebP tối đa 5 MB. Ứng dụng kiểm tra file trước khi lưu liên kết vào danh mục.

Không tự điền đường dẫn `C:\...` vào thuộc tính ảnh và không chỉ chép ảnh tùy tên vào thư mục rồi coi là đã liên kết với danh mục. Muốn máy khác có cùng ảnh đã upload, cần chuyển volume/bản sao ảnh riêng; Git chỉ giữ `.gitkeep`. Xem [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
