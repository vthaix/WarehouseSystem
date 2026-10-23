# MySQL theo service

Cập nhật 22/10/2026: migration 009 bổ sung FK nguồn QC trên DotKiemKe; migration **010_finished_report_parts** thêm `BanBaoCaoSanXuat.KieuThanhPham` và cập nhật view để báo cáo thành phẩm tạo các phần trong cùng lô. Runtime yêu cầu đủ **10** marker. Không xóa/copy lại source KhoHang, không thêm database. Luồng hiện hành [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md).

Hiện trạng: bảng đã tách vật lý thành **6 database trên cùng MySQL 8.4**, mỗi runtime dùng database và tài khoản riêng. Đây là bước tách từ schema có sẵn, giữ nghiệp vụ và dữ liệu; vẫn có view tương thích, FK, JOIN và transaction xuyên schema. Chưa thể chuyển các database sang MySQL server riêng mà không thay các phụ thuộc này bằng API/events.

| Service | Database mặc định | Tài khoản | Dữ liệu sở hữu |
| --- | --- | --- | --- |
| Identity | KhoHang_Identity | identity_db | NguoiDung, VaiTro, NguoiDungVaiTro, NguoiDungXuong, NhanVien, BoPhan, LanThuDangNhap |
| Business | KhoHang_Business | business_db | KhachHang, Xuong, danh mục hàng/NCC, DonHang và chi tiết, kế hoạch mua/bán/SX, đơn mua, báo cáo SX/thành phẩm và chi tiết |
| Warehouse | KhoHang_Warehouse | warehouse_db | Kho, ViTriKho, lô, QC, yêu cầu/phiếu kho, tồn, biến động, kiểm kê, ngoại lệ, hàng trả, công việc; audit/idempotency dùng chung tạm thời |
| Notification | KhoHang_Notification | notification_db | ThongBao |
| Reporting | KhoHang_Reporting | reporting_db | View HoSoKho và lưu trữ hồ sơ cũ; báo cáo vẫn đọc nguồn trực tiếp |
| Web Gateway | KhoHang_Gateway | gateway_db | PhienDangNhap |

Ánh xạ đầy đủ, kể cả bảng lưu trữ và 8 view cũ: [ownership.json](../database/services/ownership.json). `LichSuCSDL` được sao chép vào mỗi database để truy vết migration 001–026; `TrangThaiDichVu` ghi mốc chuyển đổi. Một bảng nghiệp vụ chỉ có **một bản vật lý đang dùng**; đối tượng cùng tên ở database khác là view trỏ về owner, không phải bản sao cần đồng bộ.

`DB_NAME` tại Compose là tiền tố/source, mặc định `KhoHang`; các service dùng `<DB_NAME>_Identity`, `_Business`, `_Warehouse`, `_Notification`, `_Reporting`, `_Gateway`. Không đổi tiền tố sau cutover để nâng cấp code. Tài khoản/password mặc định từng service đặt trong docker-compose.yml theo yêu cầu: identity_db/identity123, business_db/business123, warehouse_db/warehouse123, notification_db/notification123, reporting_db/reporting123, gateway_db/gateway123. Có thể override bằng biến môi trường tương ứng. Job split-databases tạo/cập nhật tài khoản trong MySQL khi chạy lại. Chỉ job chuyển đổi được mount root secret, backend/gateway không có root secret.

## Migration và dữ liệu

Chuỗi khởi động: **setup → MySQL → migrate legacy → split-databases → backend → gateway**.

- Migration 001–026 cũ không bị sửa. Với clone mới, tạo schema nguồn, chạy đầy đủ migration và seed demo, sau đó tách. Với volume có dữ liệu, dùng schema nguồn hiện có.
- `001_split_existing.cjs` kiểm tra mọi object có owner; từ chối đích có dữ liệu không thuộc lần chuyển đổi đang phục hồi. Clone cấu trúc, giữ PK, password hash, số lượng, ngày tạo/cập nhật, generated columns, index/check, AUTO_INCREMENT; sao chép và đối soát mọi cột trong transaction. Không dùng INSERT IGNORE để bỏ qua dữ liệu lỗi.
- FK được dựng lại đến **database owner mới**, giữ ON DELETE/ON UPDATE; trigger lô được tạo trong Warehouse. Không còn FK trỏ về schema nguồn.
- View discriminator và view tổng hợp được chuyển về owner, tham chiếu database mới; `002_qualified_views.cjs` chuẩn hóa tên schema trong view, có thể chạy lại. Các view tương thích dùng SQL SECURITY INVOKER, không mượn quyền root.
- `003_auto_increment.cjs` giữ bộ đếm ID của nguồn, không chỉ max ID còn tồn tại; không giảm bộ đếm hiện tại và không chạy lại sau khi đủ checkpoint.
- Migration service 004 nhập TP từng phần; 005 mở xử lý cách ly; 006 mở QUARANTINE/bù QC hàng đã nhập. Runtime yêu cầu đủ sáu marker 001–006 tại mỗi schema.
- Checkpoint nguồn `ChuyenDoiDichVu`: STARTED → COPIED → COMPLETE. Dữ liệu và COPIED commit cùng transaction; lỗi DDL sau đó có thể chạy lại. Khi COMPLETE, không copy/seed đè dữ liệu hoạt động. Job tiếp tục kiểm tra tài khoản và cập nhật view tương thích; chỉ cho backend chạy khi job thành công.
- `KhoHang` cũ được giữ làm bản nguồn trước chuyển đổi; **không phải CSDL đang ghi và không đồng bộ sau cutover**. Seed/migration legacy không được chạy lại trên database của service. Không chỉnh sửa dữ liệu ở schema nguồn để mong thay đổi giao diện.

Migration thực thi: [database/services/migrations](../database/services/migrations). Các file [schemas](../database/services/schemas) là snapshot DDL theo owner để review, không có dữ liệu/secret và **không chạy chồng lên database hiện có**. Boot dùng migration JavaScript lấy cấu trúc nguồn thực tế, không phụ thuộc snapshot này. Các thay đổi schema tiếp theo cần migration mới theo owner, không sửa các migration đã áp dụng hoặc sửa ownership của lần cutover đã hoàn tất.

## Quyền tương thích

Migration service mới nhất `008_purchase_line_suppliers`: NCC ở từng `ChiTietDonMuaHang`; đầu đơn NCC chung được NULL khi có nhiều NCC; kế hoạch MUA không cần NCC. Backfill từ đầu đơn lịch sử, giữ dữ liệu và FK theo owner, refresh view liên quan. Runtime yêu cầu tám checkpoint. Snapshot DDL đã xuất lại từ schema hiện hành; xem [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md).

Tài khoản có SELECT qua các view để giữ các JOIN hiện hữu. DML chỉ cấp cho bảng sở hữu và danh sách ngoại lệ trong [compatibility-grants.json](../database/services/compatibility-grants.json): Business còn đăng ký lô thành phẩm, ghi notification/audit/idempotency; Warehouse cập nhật trạng thái đơn mua/đơn khách/kế hoạch bán và notification; Identity ghi audit. Reporting không ghi nghiệp vụ; Gateway chỉ ghi session. Service không có CREATE/ALTER/DROP/GRANT.

Đây là quyền chuyển tiếp có chủ đích, **chưa phải cách ly quyền đọc hoàn toàn**. Cần loại bỏ foreign writes/read views và FK xuyên schema khi chuyển sang các MySQL instance độc lập. Không bỏ FK hoặc tách transaction hiện hữu trước khi có cơ chế chống mua/cấp/giao trùng thay thế.

SQL adapter định danh bảng bằng database owner, giữ alias JSON/API cũ. Business và Warehouse được cấp LOCK TABLES trên schema nguồn liên quan để SELECT FOR UPDATE vẫn khóa đúng dòng khi đối chiếu tồn/nhu cầu; không cấp UPDATE tồn kho cho Business chỉ để vượt lỗi quyền khóa. Đây vẫn là phụ thuộc giao dịch trên cùng MySQL.

## Chạy và backup

Lệnh chạy từ repository root. **Nâng lần đầu từ schema dùng chung phải dừng writer cũ trước khi copy**:

```powershell
docker compose stop app identity-service business-service warehouse-service notification-service reporting-service
docker compose up -d --build --wait
docker compose ps
docker compose logs --tail=50 split-databases
```

Clone mới hoặc các lần build sau chỉ cần `docker compose up -d --build --wait`. Lần bật lại dùng `docker compose up -d`. Không chạy `down -v` để nâng code.

Job lưu SQL backup trước cutover tại `/var/backups/warehouse/KhoHang-before-service-split-v3.sql` trong named volume `database_backups` (tiền tố thay theo DB_NAME). File chứa dữ liệu và password hash, không đưa vào Git. Sao chép ra máy để giữ ngoài Docker:

```powershell
New-Item -ItemType Directory -Force app/backups
docker compose cp split-databases:/var/backups/warehouse/KhoHang-before-service-split-v3.sql app/backups/
```

Backup này là mốc **trước cutover**, không thay thế backup định kỳ 6 database đang hoạt động. Sau khi đã có ghi mới, không rollback bằng cách quay về KhoHang cũ vì sẽ mất các cập nhật mới. Phục hồi vào môi trường biệt lập, kiểm tra trước khi cutover; không restore đè môi trường đang dùng.

Adminer: `docker compose --profile dev up -d adminer`, http://localhost:8080. Chọn đúng database owner khi xem/sửa dữ liệu. Tài khoản app cũ chỉ được thêm SELECT trên database mới; dùng account service cho dữ liệu thuộc quyền của service đó.

## Kiểm tra

`npm test`, `npm run check`; kiểm thử SQL trên database riêng, không tạo chứng từ thử trong dữ liệu chính:

```powershell
docker compose run --rm --no-deps -T split-databases node scripts/split-acceptance.cjs
```

Test tạo source `KhoHang_Acceptance_20261013` và 6 database con, chạy 6 HTTP process với tài khoản service thật. Kết nối SQL trực tiếp của bộ test dùng root trong môi trường test để dựng/đối soát dữ liệu; root không được dùng bởi runtime service. Test kiểm tra replay, FK, bảo toàn dữ liệu và các luồng nghiệp vụ. Browser tests vẫn chạy qua gateway tại cổng 3000.

Bằng chứng đợt nghiệp vụ kho: 48 test Node và syntax đạt; migration từ source mới và nghiệm thu qua 6 tài khoản thật đạt. Kiểm thử quyền xác nhận Business không được UPDATE TonKho, Gateway/Reporting không được UPDATE NguoiDung; replay giữ dữ liệu đã ghi sau cutover. Backup v3 đã restore vào database biệt lập và đối soát đủ 62 bảng nguồn, từng cột, gồm ngày/JSON/password hash. Test restore chỉ tạo database mới, không ghi đè source:

```powershell
docker compose run --rm --no-deps -T split-databases node scripts/verify-service-backup.cjs
```

Database test/restore được giữ riêng để xem kết quả, không phải dữ liệu sản xuất. Khi cần cập nhật snapshot DDL, chạy `scripts/export-service-schemas.cjs` qua job split-databases; snapshot chỉ chứa cấu trúc thuộc owner, không chứa compatibility view của service khác.

Sau build cuối, cả 6 service healthy; browser import và EJS/Adminer đều đạt với cấu hình database mới. Các kiểm thử này xác minh bước tách schema hiện tại, không chứng nhận độc lập dữ liệu giữa các MySQL server hay mọi UC còn trong backlog.

Tham khảo hành vi MySQL: [CREATE TABLE LIKE](https://dev.mysql.com/doc/refman/8.4/en/create-table-like.html) không giữ FK; migration dựng FK lại. [CREATE VIEW](https://dev.mysql.com/doc/refman/8.4/en/create-view.html) hỗ trợ tham chiếu database khác và SQL SECURITY INVOKER.

Danh mục owner/TABLE/VIEW/cột sinh từ snapshot: [generated/DATABASE_OBJECTS.md](generated/DATABASE_OBJECTS.md). Kiểm tự động structure/migration/docs: npm run docs:sync và npm run check:sync.

Ảnh danh mục: LoaiHang.DuongDanAnh / image_path, chọn/xem trước/bỏ ảnh, PNG/JPEG/WebP ≤5 MB. Migration service 007; file ở src/images/categories, Docker lưu volume category_images. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
