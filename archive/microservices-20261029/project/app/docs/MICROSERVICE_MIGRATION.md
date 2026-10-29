# Lộ trình hoàn thiện microservice

Cập nhật 14/10/2026. Skeleton, HTTP runtime và tách database theo owner đã triển khai; tài liệu này mô tả phần chuyển tiếp còn lại.

## Đã có

- Năm backend HTTP và gateway, entrypoint/Dockerfile riêng dưới src/services.
- Tám boundary logic; bốn boundary kinh doanh cùng business-service.
- HMAC transport, allowlist, kiểm actor từ Identity, timeout và không retry mutation.
- Sáu database/tài khoản, bảng vật lý theo owner; migration 001–004, backup trước cutover, đối soát và checkpoint.
- Acceptance chạy sáu process với database cô lập và tài khoản runtime.

## Còn phụ thuộc

Database cùng một MySQL server; FK/JOIN/view/transaction và quyền ghi xuyên schema chưa bỏ. Business còn đăng ký lô/ghi thông báo trực tiếp; Reporting chưa có projection. Các image dùng chung package/dependencies và code helpers. Tách process đã có; độc lập dữ liệu/deploy chưa hoàn chỉnh.

## Các giai đoạn tiếp theo

| Giai đoạn | Việc cần làm | Điều kiện hoàn tất |
| --- | --- | --- |
| Hợp đồng owner | Kiểm kê SQL xuyên owner, DTO/version/error/idempotency, API nguồn | Không expose SQL tùy ý; hợp đồng có test và quyền scope |
| Sự kiện bền vững | Outbox của owner, inbox/dedup, retry có kiểm soát | Crash giữa commit/publish không mất hoặc lặp tác động |
| Reporting/Notification | Projection và event consumers | Không còn đọc/ghi trực tiếp database nghiệp vụ khác |
| Nhu cầu/giữ chỗ | Claims và compensation cho nguồn mua/cấp/giao | Cạnh tranh, timeout, cancel không vượt nhu cầu hoặc âm tồn |
| Database độc lập | Bỏ view/FK/ghi SQL xuyên schema, thu hồi grants | Acceptance chạy được với MySQL instance riêng |
| Vận hành | Trace/correlation, quản lý secrets, backup/restore, phát hành | Nghiệm thu restart/lỗi mạng/restore và diễn tập rollout |

Không bỏ FK trước khi có cơ chế thay thế, không biến transaction đang đảm bảo invariant thành chuỗi HTTP dễ mất tính nhất quán.

Giữ các quyết định nghiệp vụ hiện hành: đơn/kế hoạch duyệt liên quan; dự phòng NVL chỉ cộng một lần; giữ chỗ không TTL; kho kiểm kê khóa; báo cáo nguồn bất biến; nhập từng phần chung đầu lô; hàng khách trả cách ly, không tự hoàn tiền/giao bù. Chi tiết trong SRS/USE_CASES/DOMAIN_MODEL/BUSINESS_DECISIONS và PARTIAL_PRODUCTION_RECEIPTS.

Hiện trạng: [ARCHITECTURE.md](ARCHITECTURE.md). Dữ liệu: [SERVICE_DATABASES.md](SERVICE_DATABASES.md). Backlog nghiệp vụ vẫn cần đối chiếu từng UC, không coi lộ trình kiến trúc thay thế nghiệm thu nghiệp vụ.
