# Chuẩn bị production

Cập nhật 14/10/2026. Chưa chứng nhận hệ thống sẵn sàng production hoặc độc lập dữ liệu hoàn toàn.

Deploy hiện tại cần một MySQL server chứa sáu schema; không tách thành sáu server khi còn FK/JOIN/view/transaction xuyên schema. Chỉ gateway được expose qua reverse proxy HTTPS; backend/MySQL không publish.

Cấu hình production: NODE_ENV=production, SEED_DEMO=false, COOKIE_SECURE=true, TRUST_PROXY phù hợp số proxy tin cậy, APP_BIND_ADDRESS=127.0.0.1 và tag image cố định theo release. Thay credentials mặc định development của cả sáu service, quản lý secret ngoài Git; cấp tài khoản người dùng thật qua quy trình được nghiệm thu.

Chạy từ root: docker compose up -d --build --wait. Chuỗi migration đi qua migrate và split-databases, không chạy DDL/seed trên gateway. Kiểm log job và health của đủ sáu runtime trước chuyển traffic.

## Backup và restore

Backup trước cutover do split-databases tạo chỉ phản ánh mốc chuyển đổi. Production phải backup đồng bộ sáu schema hoạt động, views/triggers/FK và các volume secret liên quan; giữ bản ngoài host, mã hóa và diễn tập restore vào môi trường riêng.

Không restore KhoHang snapshot cũ rồi coi đó là dữ liệu mới nhất. Không rollback bằng chép schema nguồn lên các owner đang hoạt động. Cần kế hoạch rollback theo migration và snapshot đồng bộ đã kiểm chứng; chạy đối soát ID, số lượng, chứng từ, hash và tham chiếu sau restore.

Chưa có quy trình tự động backup/restore production sáu schema được nghiệm thu. Đây là hạng mục còn phải hoàn thiện trước dùng dữ liệu thật.

Hướng dẫn Docker: DOCKER.md. Migration/quyền/backup cutover: SERVICE_DATABASES.md. Backlog: IMPLEMENTATION_BACKLOG.md.

Ảnh danh mục lưu trong volume category_images; backup/restore phải giữ volume ảnh cùng dữ liệu đường dẫn trong Business. Không chạy down -v để nâng cấp.
