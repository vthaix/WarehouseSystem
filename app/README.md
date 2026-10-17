# WarehouseSystem — ứng dụng

Express + EJS + MySQL, gồm năm backend HTTP và web-gateway dưới src/services. Mỗi service có index.js, compose.js và Dockerfile riêng; sáu database/tài khoản trên cùng MySQL 8.4. Còn phụ thuộc SQL xuyên schema, chưa độc lập dữ liệu hoàn toàn.

Chạy từ root repository: `docker compose up -d --build --wait`. Giao diện http://localhost:3000. Gateway có tên Compose app; backend không publish ra host. Dữ liệu lưu trong named volumes, không seed đè sau cutover.

Từ thư mục app: `npm test`, `npm run check`. `npm start` chỉ chạy gateway; chạy Node riêng cần đủ backend/URL/credentials. `start:legacy` dành cho đối chiếu/test.

- [Danh mục tài liệu](docs/README.md)
- [Kiến trúc](docs/ARCHITECTURE.md)
- [Chạy Docker](docs/DOCKER.md)
- [Dữ liệu mẫu để test trên máy mới](docs/DU_LIEU_TEST_MAY_MOI.md)
- [CSDL theo owner](docs/SERVICE_DATABASES.md)
- [Tiến độ](docs/IMPLEMENTATION_PROGRESS.md)

Đồng bộ cấu trúc/tài liệu: [STRUCTURE.md](docs/STRUCTURE.md). Chạy npm run docs:sync và npm run check:sync sau thay đổi source/schema. Menu/nhãn browser sinh từ cấu hình navigation dùng chung server.
