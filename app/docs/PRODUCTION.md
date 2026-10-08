# Kế hoạch triển khai sau khi hoàn tất nghiệp vụ SQL

Hiện tại mới hoàn thành nền tảng, chưa triển khai production. Cần hoàn thiện các module pending trong MODULE_MATRIX, migration nghiệp vụ, transaction/khóa hàng/idempotency/audit và kiểm thử nghiệm thu trước khi sử dụng thật.

## Môi trường

Máy Linux có Docker Engine/Compose, DNS domain trỏ tới máy, reverse proxy TLS trên host (Nginx/Caddy), firewall chỉ mở SSH/80/443. Giữ APP_BIND_ADDRESS=127.0.0.1 và không publish MySQL/Adminer. Backup phải lưu ngoài máy và được mã hóa.

Root `.env` production (không commit):

```dotenv
NODE_ENV=production
SEED_DEMO=false
AUTO_MIGRATE=false
COOKIE_SECURE=true
TRUST_PROXY=1
APP_BIND_ADDRESS=127.0.0.1
APP_PORT=3000
APP_IMAGE_TAG=release-commit-sha
```

TRUST_PROXY=1 chỉ phù hợp một proxy tin cậy, app không truy cập trực tiếp từ Internet. Proxy phải ghi đè X-Forwarded-For/Proto/Host. TLS kết thúc tại proxy, chuyển tới http://127.0.0.1:3000; chuyển HTTP sang HTTPS. Kiểm tra Secure cookie qua HTTPS và readiness trước chuyển traffic. Không dùng volume demo để production. Không có seed tài khoản thật tự động; cần quy trình cấp user/hash/password riêng khi chốt quản trị tài khoản.

Build image release, provision secrets/DB, chạy migration trước app:

```sh
docker compose build app setup
docker compose up -d mysql
docker compose run --rm --no-deps app node scripts/database.cjs migrate
docker compose run --rm --no-deps app node scripts/database.cjs roles
docker compose up -d --wait app
```

Giữ secrets volumes qua deploy. Xoay password cần đổi tài khoản MySQL, cập nhật file secret rồi recreate app theo quy trình riêng; setup cố tình từ chối ghi đè. Tách migration user có quyền DDL khỏi runtime user chỉ có quyền cần thiết khi cấu hình production; compose hiện tại dùng DB user chung cho foundation.

## Backup và thử restore

Ví dụ **Bash trên Linux host**, tại root repository. Password đọc trong container, không đặt trên command line:

```sh
mkdir -p backups
chmod 700 backups
umask 077
docker compose exec -T mysql sh -c 'MYSQL_PWD="$(cat /run/warehouse-mysql-secrets/db_password)" exec mysqldump --single-transaction --no-tablespaces --skip-lock-tables -u"$MYSQL_USER" "$MYSQL_DATABASE"' > backups/warehouse.sql
test -s backups/warehouse.sql
```

Kiểm tra exit code trước lưu bản backup, checksum, chuyển sang nơi lưu trữ khác. Backup logical DB không chứa secrets volumes; sao lưu bảo mật secret riêng nếu cần giữ phiên/tài khoản DB khi khôi phục. Không chạy migration/DDL đồng thời với dump. Khi có file upload, backup cả uploads theo cùng mốc.

Thử restore vào **project cô lập**, không ghi đè DB đang dùng. Tạo file compose phục hồi không có `name`, không include cấu hình root có `name`; dùng bản sao cấu hình `app/docker-compose.yml` ở root, chỉnh build.context=`./app`, port khác và AUTO_MIGRATE=false, SEED_DEMO=false. Khởi động bằng `docker compose -p warehouse-restore -f compose.restore.yml up -d mysql`, xác nhận volume có prefix warehouse-restore. Sau đó dùng:

```sh
docker compose -p warehouse-restore -f compose.restore.yml exec -T mysql sh -c 'MYSQL_PWD="$(cat /run/warehouse-mysql-secrets/db_password)" exec mysql -u"$MYSQL_USER" "$MYSQL_DATABASE"' < backups/warehouse.sql
```

Kiểm tra schema_migrations, số dòng, FK, đăng nhập bằng tài khoản backup và luồng nghiệp vụ đã ghi sổ trước khi công nhận backup sử dụng được. Chưa thực hiện thử restore trong đợt nền tảng này.

## Update và rollback

Backup trước release; ghi commit/image tag và checksum migration. Migration phải tương thích phiên bản app cũ trong cửa sổ rollback. Áp dụng migration bằng job riêng, chạy health/smoke, sau đó chuyển traffic. Rollback app bằng image release trước đã lưu và không chạy migration cũ lại. Nếu schema không tương thích, cần maintenance và restore backup đã thử; rollback DB có thể mất dữ liệu mới, phải quyết định dựa trên mốc backup. Không dùng `down -v` trong deploy.

Theo dõi JSON logs/request ID, readiness, lỗi DB/session, dung lượng volume và backup. SIGTERM ngừng nhận request, đóng connection/pool; Compose cho 20 giây để shutdown. Chưa có SMTP, cloud storage hoặc observability dịch vụ ngoài trong scope này.
