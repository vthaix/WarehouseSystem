## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Prompt bàn giao chuyển microservice

> Cập nhật: runtime đã tách thành 5 backend HTTP và web-gateway tại `app/src/services/`, mỗi service có index.js và Dockerfile riêng. Compose chạy đủ 6 process. CSDL vẫn dùng chung schema/volume hiện có; bước tiếp theo là thiết kế và tách dữ liệu, không tạo lại cấu trúc service. Khi dùng prompt bên dưới, ưu tiên hiện trạng này và [README service](../src/services/README.md) hơn các mô tả monolith lịch sử.

Sao chép phần dưới cho người/agent triển khai trong repository này. Kế hoạch chi tiết tại [MICROSERVICE_MIGRATION.md](MICROSERVICE_MIGRATION.md).

```text
Bạn tiếp tục phát triển WarehouseSystem hiện có, không tạo dự án khác bỏ dữ liệu cũ.

Trước sửa code, đọc toàn bộ:
app/docs/MICROSERVICE_MIGRATION.md
app/docs/IMPLEMENTATION_PROGRESS.md
app/docs/SRS.md
app/docs/USE_CASES.md
app/docs/DOMAIN_MODEL.md
app/docs/BUSINESS_DECISIONS.md
app/docs/API.md
app/docs/DATABASE.md
app/docs/UI_SPEC.md
app/README.md và compose ở root/app.

Ưu tiên phần cập nhật mới nhất; các ghi chú lịch sử trong docs không đại diện
trạng thái hiện tại. Kiểm tra working tree, đừng chỉ đọc HEAD be92b4e.
Code hiện là Express/EJS/mysql2 monolith; migrations đến 026. Nghiệm thu trước
có 26 Node tests và SQL/browser pass, không phải chứng nhận mọi UC.

Mục tiêu: chuyển dần sang microservice theo ranh giới đề xuất:
web-gateway Express/EJS; identity-service; business-service;
warehouse-service (giữ QC/tồn/kiểm kê/ngoại lệ/lịch công việc cùng nhau);
notification-service; reporting-service projection.
Tất cả mã ứng dụng ở app/. Giữ giao diện xưởng bánh hồng–đen–trắng và API
JSON tiếng Anh; CSDL tên Việt không dấu. Không tách một service mỗi bảng/UC.

Bắt đầu P0/P1: xác minh baseline và backup/restore trên DB riêng; lập manifest
ownership; tách routers/repositories/UnitOfWork và hợp đồng source clients.
Sau đó triển khai từng giai đoạn theo tài liệu, có test và checkpoint review.
Không thay compose đang chạy bằng bộ microservice chưa có code/images/test.

Service owner độc quyền ghi DB riêng. Không JOIN/FK/pool xuyên service đích.
Không import class nghiệp vụ từ service khác. Local transaction + outbox/inbox,
consumer idempotent, claim nguồn và saga/reconciliation cho thao tác liên service.
Không tin projection chậm để chống vượt tồn, nhu cầu hay tiêu hao. HTTP timeout
có thể là kết quả chưa xác định; tra operation_id, không tự hủy/quyết định retry mới.

Giữ các quy tắc đã chọn: duyệt đơn cùng KHSX; một đơn PLAN/kế hoạch mua;
mua PLAN/REPORT/MANUAL; hạn mức mua REPORT chung với kế hoạch;
NVL gốc +10% một lần, ceil 3 chữ số; xuất PLAN/REPORT cùng tổng theo KHSX;
giữ chỗ khi phân công, không tự hết hạn; QC theo dòng lô; không xuất hàng
cách ly/hết hạn; kiểm kê khóa theo kho; BGĐ duyệt, quản lý áp dụng chênh lệch;
chứng từ/báo cáo đã gửi bất biến; hàng khách trả cách ly, không tự giao bù/hoàn tiền.

UC-34: báo cáo tiến độ/sự cố/thiếu NVL khi đang sản xuất, BGĐ luôn nhận khi gửi,
planner chỉ xem/nhận khi được chọn thêm; tiến độ/sự cố không bắt NVL và không
làm nguồn mua/cấp. UC-35: tổng kết khi chủ xưởng xác nhận hoàn tất toàn bộ,
sản lượng thực tế không bắt bằng kế hoạch; gửi chuyển KHSX COMPLETED.
Hai loại vẫn chung bảng báo cáo, discriminator SAN_XUAT/THANH_PHAM.

Không coi backlog là đã xong: UC-23 nhập TP tay từng phần cùng lô chưa triển khai
(code vẫn lấy báo cáo tổng kết đã gửi); xuất TP chưa đủ gate hoàn tất + ngày giao;
QC/bù trên hàng đã nhập/phân bổ/trả và xử lý tồn cách ly chưa hoàn chỉnh;
CRUD phòng ban/chức danh và nghiệm thu mọi nhánh UC còn thiếu. BOM chưa có.
Không âm thầm đổi các quy tắc để làm việc tách service dễ hơn.

Không xóa volume, reset/reseed DB thật hay sửa migrations đã áp dụng.
Bảo toàn ID, hash mật khẩu, lượng/tiền/lịch sử và nguồn; không suy đoán dữ liệu cũ.
Chỉ một writer/aggregate trong từng giai đoạn. Cutover phải có backup, đối soát,
đồng bộ delta và rollback bảo toàn các ghi mới; không bật legacy từ snapshot cũ.

Thực hiện test SQL cô lập, contract/API, UI và failure/concurrency/replay cần thiết.
Chuyển các kịch bản acceptance cũ sang gateway/owner; không dùng memory pass
để tuyên bố microservice SQL hoàn tất. Ghi lại tệp đổi, lệnh/kết quả test,
giai đoạn hoàn thành, giới hạn và các việc còn lại; chưa commit/push/deploy nếu
chưa được yêu cầu.
```
