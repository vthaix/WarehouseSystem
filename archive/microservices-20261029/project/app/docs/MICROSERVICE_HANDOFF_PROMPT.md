# Prompt bàn giao microservice

Cập nhật 14/10/2026. Sao chép nội dung dưới để tiếp tục dự án.

```text
Tiếp tục WarehouseSystem trong app/, không tạo lại dự án và không reset dữ liệu.

Đọc app/docs/README.md, ARCHITECTURE.md, SERVICE_DATABASES.md,
IMPLEMENTATION_PROGRESS.md, IMPLEMENTATION_BACKLOG.md, SRS.md,
USE_CASES.md, DOMAIN_MODEL.md, BUSINESS_DECISIONS.md, API.md, UI_SPEC.md;
đối chiếu root/app Compose và code trước sửa.

Hiện có 5 backend HTTP + web-gateway trong app/src/services/.
Mỗi service có index.js/compose.js/Dockerfile; module nằm dưới owner/modules.
Compose app là gateway. Sáu database/tài khoản đã tách, cùng MySQL 8.4.
Còn FK/JOIN/view/transaction/quyền ghi xuyên schema; chưa có broker,
outbox/inbox, projections, source claims hoặc saga.
Không tuyên bố database độc lập hoàn toàn và không tạo lại skeleton.

Giữ API/JSON hiện hữu, tên bảng tiếng Việt không dấu và dữ liệu/password hash.
Không sửa migration legacy 001–026 đã chạy. Migration service hiện 001–007;
thêm migration mới, cập nhật bootstrap/checkpoint/views/identifiers/snapshot.
Không seed đè dữ liệu hoạt động sau cutover.

Ưu tiên kiểm kê phụ thuộc SQL, thiết kế hợp đồng owner, outbox/inbox,
projection Reporting/Notification, claims/compensation trước bỏ FK.
Giữ invariant nhu cầu, giữ chỗ, QC, nhập từng phần và lịch sử chứng từ.
Hàng khách trả vẫn cách ly; chưa tự giao bù hoặc hoàn tiền.
Không import domain object của backend vào gateway; dùng HTTP contracts.

Kiểm thử npm test, npm run check và acceptance split trên database cô lập.
Thay giao diện chạy browser test phù hợp. Báo rõ kiểm thử đã chạy,
giới hạn và phần còn thiếu; không công nhận toàn bộ UC khi chưa nghiệm thu.
Không tự push/deploy/xóa volume.
```
