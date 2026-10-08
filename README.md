# WarehouseSystem


```sh
docker compose up -d --build --wait
docker compose --profile dev up -d
docker compose ps
docker compose exec app node scripts/show-demo-login.cjs
```

Mở http://localhost:3000. Không cần cài Node/MySQL hoặc tạo `.env` để chạy thử. Lần đầu tải image cần Internet. `up` khởi động dịch vụ; `ps` xem trạng thái. [Docker Compose up](https://docs.docker.com/reference/cli/docker/compose/up/), [ps](https://docs.docker.com/reference/cli/docker/compose/ps/).

Mật khẩu sinh riêng cho mỗi máy, không nằm trong Git. Dữ liệu, session và secret lưu trong Docker volumes, còn sau `docker compose down`. `down -v` xóa cả dữ liệu và secret.

**Trạng thái:** Docker/MySQL, auth, RBAC, session, danh mục đọc và thông báo đã hoạt động. Nghiệp vụ kho/sản xuất còn chờ chuyển sang SQL và trả 501 rõ ràng. Bản demo bộ nhớ giữ các luồng để đối chiếu; chưa hoàn tất toàn bộ SRS.

- [Hướng dẫn Docker và cấu hình](app/docs/DOCKER.md)
- [Production, backup và rollback](app/docs/PRODUCTION.md)
- [Ma trận module → UC → bảng → route → màn hình](app/docs/MODULE_MATRIX.md)
- [Báo cáo triển khai](app/docs/DOCKER_IMPLEMENTATION.md)
- [SRS](app/docs/SRS.md)
