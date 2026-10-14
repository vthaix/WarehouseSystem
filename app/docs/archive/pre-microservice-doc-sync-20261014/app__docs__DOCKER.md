## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Chạy sau khi clone

**Đã kiểm tra 11/10/2026:** migration đến 019, seed và nghiệm thu từ CSDL riêng rỗng pass; nâng cấp volume hiện có pass. Chạy lệnh từ repository root để dùng đúng tên project/volume. Lần đầu hoặc sau khi đổi code dùng `docker compose up -d --build --wait`; các lần bật lại dùng `docker compose up -d`. `docker compose ps` chỉ xem trạng thái. Ghi chú không thực thi ở bản 10/10 bên dưới là mốc lịch sử. Phạm vi tính năng đã nghiệm thu: IMPLEMENTATION_PROGRESS.md.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

**Phạm vi:** các lệnh dưới là hướng dẫn vận hành kế thừa, không được thực thi trong lượt này. Migration/seed/smoke có thể ghi dữ liệu; không phải chứng nhận chức năng đã hoàn thành.


Lệnh Docker chạy từ **repository root**. Cấu hình root include `app/docker-compose.yml`; cần Compose v2.20.3 trở lên. [Tài liệu include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/).

```sh
docker compose up -d --build --wait
docker compose ps
docker compose logs --tail=100 app mysql setup
docker compose exec app node scripts/show-demo-login.cjs
```

Ứng dụng http://localhost:3000. Demo: customer, customer2, planner, purchaser, manager, staff, staff2, qc, stocktaker, workshop, director. Lệnh xem login cũng hiển thị thông tin Adminer; đầu ra chứa mật khẩu, không chia sẻ công khai.

Không cần `.env` lần đầu. Service `setup` sinh password DB/root/demo và session secret ngẫu nhiên vào hai named volumes, giữ nguyên khi chạy lại. App không có root password. MySQL đợi setup, app đợi DB healthy rồi migration/seed. MySQL không mở port ra host; web bind localhost.

Adminer dành cho development:

```sh
docker compose --profile dev up -d --wait
```

Mở http://localhost:8080, chọn MySQL, server `mysql`, database `KhoHang`; lấy tài khoản từ lệnh xem login. Tài khoản `warehouse_app` có toàn quyền trên `KhoHang`; phân quyền người dùng sản phẩm được kiểm tra trong code. Tắt Adminer bằng `docker compose stop adminer`.

## Cấu hình và vòng đời

Đổi port: copy `.env.example` **root** thành `.env`, chỉnh APP_PORT. Root `.env` dùng cho Compose; `app/.env` dành cho Node chạy trực tiếp và không vào image. Nếu tự cung cấp secret, phải khớp volume hiện hữu; sửa env không tự đổi password MySQL hoặc user demo.

```sh
docker compose down
docker compose up -d --wait
docker compose exec app node scripts/database.cjs status
docker compose exec app node scripts/database.cjs migrate
docker compose exec app node scripts/database.cjs seed
```

`down` giữ volumes; `down -v` chỉ dùng khi chủ động xóa/reset dữ liệu thử. Schema gốc là `database/adminer/KhoHang.sql`; sau khi đã áp dụng, không sửa file này mà thêm migration số tăng dần trong `database/migrations`. Checksum kiểm tra lịch sử. DDL MySQL không rollback toàn bộ, migration cần chạy lại an toàn khi gián đoạn. Seed giữ password hash đã có, chỉ tạo dữ liệu nền/demo, không tự ghi tồn kho.

## Kiểm thử

```sh
docker build --target test -t warehouse-system-test ./app
docker run --rm warehouse-system-test
docker compose exec app node scripts/mysql-smoke.cjs before-restart
docker compose restart app
docker compose exec app node scripts/mysql-smoke.cjs after-restart
```

Đợi app healthy trước bước cuối. Smoke dành riêng cho development: migration/seed lặp, FK/CHECK/DECIMAL, scope/RBAC/CSRF, thông báo, SQL session, giới hạn login và 501. Cookie tạm nằm trong container, dùng `restart`, không recreate giữa hai bước.

Kiểm thử trình duyệt cần Node và Chrome/Edge hoặc Playwright Chromium:

```sh
docker compose --profile dev up -d --wait
cd app
npm ci
npm run check
npm test
npm run test:docker-browser
```

Browser SQL kiểm tra EJS khi tắt JavaScript và Adminer; `npm run test:browser` kiểm tra demo bộ nhớ đầy đủ. `/health` kiểm tra process; `/health/ready` truy vấn DB, lỗi trả 503. Healthcheck unhealthy không tự restart container; cần giám sát sự cố kéo dài.
