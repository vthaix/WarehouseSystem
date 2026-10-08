# Chạy sau khi clone

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

Mở http://localhost:8080, chọn MySQL, server `mysql`; lấy tài khoản từ lệnh xem login. Tắt bằng `docker compose stop adminer`.

## Cấu hình và vòng đời

Đổi port: copy `.env.example` **root** thành `.env`, chỉnh APP_PORT. Root `.env` dùng cho Compose; `app/.env` dành cho Node chạy trực tiếp và không vào image. Nếu tự cung cấp secret, phải khớp volume hiện hữu; sửa env không tự đổi password MySQL hoặc user demo.

```sh
docker compose down
docker compose up -d --wait
docker compose exec app node scripts/database.cjs status
docker compose exec app node scripts/database.cjs migrate
docker compose exec app node scripts/database.cjs seed
```

`down` giữ volumes; `down -v` chỉ dùng khi chủ động xóa/reset dữ liệu thử. Không sửa migration đã áp dụng: thêm file số tăng dần. Checksum kiểm tra lịch sử. DDL MySQL không rollback toàn bộ, migration cần chạy lại an toàn khi gián đoạn. Seed giữ password hash đã có, chỉ tạo dữ liệu nền/demo, không tự ghi tồn kho.

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
