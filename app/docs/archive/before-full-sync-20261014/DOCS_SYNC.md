# Đồng bộ tài liệu — 14/10/2026

Đã viết lại README root/app/service, ARCHITECTURE, DATABASE, DOCKER, DOCKER_IMPLEMENTATION, IMPLEMENTATION, PRODUCTION, MICROSERVICE_MIGRATION và prompt bàn giao theo runtime hiện tại. Cập nhật tiến độ/backlog và đường dẫn module owner; thêm docs/README làm mục lục.

Bỏ mô tả monolith khỏi hướng dẫn hiện hành; bản trước đồng bộ lưu ở archive/pre-microservice-doc-sync-20261014 để truy vết. Không xóa đặc tả nghiệp vụ, lịch sử migration hoặc mã legacy trong lượt docs.

Hiện có sáu process HTTP và sáu database/tài khoản; vẫn cùng MySQL và phụ thuộc SQL xuyên schema. Chưa broker/outbox/inbox/projections/claims/saga, chưa công nhận toàn bộ UC hoặc production.

Đối chiếu code/Compose và liên kết tài liệu cục bộ. Không sửa CSDL, seed hoặc chạy migration trong lượt này. Docker daemon chưa khả dụng lúc kiểm tra; không tuyên bố containers đang healthy. Những thay đổi code tồn tại từ lượt trước được giữ nguyên, không thuộc đợt docs.
