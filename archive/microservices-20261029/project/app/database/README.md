# Database và migration

Runtime dùng sáu database theo owner trên cùng MySQL, không còn dùng KhoHang làm nguồn dữ liệu đang hoạt động. KhoHang được giữ làm snapshot/bootstrap trước cutover.

- adminer/KhoHang.sql và migrations/001–026: nguồn lịch sử, không sửa migration đã chạy.
- services/migrations/001–007: cutover, views, bộ đếm ID và nhập thành phẩm từng phần.
- services/ownership.json: owner vật lý; metadata đã fingerprint không sửa tùy ý.
- services/schemas/<service>/001_schema.sql: snapshot cấu trúc tham chiếu, không phải seed hoặc script nâng cấp.
- seeders/: dữ liệu demo cho bootstrap mới, không dùng để lưu chứng từ hoặc nạp đè dữ liệu sau cutover.

Chuỗi setup/migrate/split-databases do Compose điều phối. Không chạy seed/migrate trên gateway service schema. Nâng schema phải thêm migration service và kiểm thử cô lập; build không reset dữ liệu.

[Database theo service](../docs/SERVICE_DATABASES.md) · [Docker](../docs/DOCKER.md)
