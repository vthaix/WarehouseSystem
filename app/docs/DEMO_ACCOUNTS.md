# Tài khoản đăng nhập và quyền

Cập nhật ngày 14/10/2026. Đăng nhập tại http://localhost:3000.

## Danh sách tài khoản mẫu

Dữ liệu test riêng từng UC (36 bộ chứng từ, gồm đơn chờ tiếp nhận) và nơi upload ảnh: [DEMO_FIXTURES.md](DEMO_FIXTURES.md).

| Tài khoản | Mật khẩu mẫu | Vai trò | Mã vai trò |
| --- | --- | --- | --- |
| `admin` | `123456` | Qu?n tr? h? th?ng | `ADMIN` |
| `customer` | `123456` | Khách hàng | `CUSTOMER` |
| `customer2` | `123456` | Khách hàng thứ hai | `CUSTOMER` |
| `planner` | `123456` | Bộ phận lập kế hoạch | `PLANNER` |
| `purchaser` | `123456` | Bộ phận mua hàng | `PURCHASER` |
| `manager` | `123456` | Quản lý kho | `WAREHOUSE_MANAGER` |
| `staff` | `123456` | Nhân viên kho | `WAREHOUSE_STAFF` |
| `staff2` | `123456` | Nhân viên kho thứ hai | `WAREHOUSE_STAFF` |
| `qc` | `123456` | Bộ phận QC/AC | `QC_INSPECTOR` |
| `qc2` | `123456` | Nguyễn Minh Anh — QC/AC | `QC_INSPECTOR` |
| `qc3` | `123456` | Trần Ngọc Hà — QC/AC | `QC_INSPECTOR` |
| `stocktaker` | `123456` | Ban kiểm kê | `STOCKTAKER` |
| `stocktaker2` | `123456` | Lê Hoàng Nam — Ban kiểm kê | `STOCKTAKER` |
| `stocktaker3` | `123456` | Phạm Thanh Mai — Ban kiểm kê | `STOCKTAKER` |
| `workshop` | `123456` | Chủ xưởng | `WORKSHOP_OWNER` |
| `director` | `123456` | Ban giám đốc | `DIRECTOR` |

Đây là tài khoản mẫu của môi trường phát triển. Mật khẩu được băm trong CSDL; không lưu chuỗi `123456` trực tiếp trong cột mật khẩu. Nếu đã đổi mật khẩu hoặc cấu hình `DEMO_PASSWORD` khác khi khởi tạo, dùng mật khẩu đã thiết lập. Seed không ghi đè mật khẩu tài khoản đã tồn tại.

## Actor tổng quát hóa trên sơ đồ UC

| Actor cha | Actor con kế thừa | Tài khoản hiện tại |
| --- | --- | --- |
| **Nhân sự kho** | Quản lý kho; Nhân viên kho | `manager`; `staff`, `staff2` |
| **Nhân viên kiểm tra** | Ban kiểm kê; Bộ phận QC/AC | `stocktaker`; `qc` |

Giữ nguyên bốn actor con và quyền chuyên biệt. Actor cha dùng trong mô hình UML, không phải tài khoản hoặc role mới. Sơ đồ và UC dùng chung xem [ACTOR_UC_GENERALIZATION.md](ACTOR_UC_GENERALIZATION.md).

## Quyền nghiệp vụ chính

| Vai trò | Quyền chính |
| --- | --- |
| Khách hàng | Đặt đơn; xem và sửa đơn của chính mình khi trạng thái cho phép. |
| Bộ phận lập kế hoạch | Tiếp nhận đơn; lập và quản lý kế hoạch sản xuất, kế hoạch mua/bán; xem báo cáo thành phẩm và báo cáo sản xuất được gửi đến bộ phận lập kế hoạch. |
| Bộ phận mua hàng | Lập và quản lý đơn mua NVL; nhập thủ công hoặc lấy dữ liệu từ nguồn được phép; xem kế hoạch mua liên quan. |
| Quản lý kho | Quản lý danh mục, ảnh danh mục, mặt hàng, kho, vị trí, nhà cung cấp và lô; điều phối yêu cầu kho; tiếp nhận hàng khách trả; quản lý hồ sơ kho; lập đề xuất ngoại lệ và thực hiện phương án đã được duyệt. |
| Nhân viên kho | Thực hiện nhập/xuất và ghi sổ theo yêu cầu/công việc được giao; chọn lô, vị trí thực tế; xử lý nhận hàng trả khi được phân công; tra cứu chứng từ liên quan. |
| Bộ phận QC/AC | Kiểm tra chất lượng; ghi kết quả đạt/lỗi; tái kiểm và xử lý nghiệp vụ QC liên quan hàng cách ly, hàng trả, ngoại lệ; tham gia kết luận kiểm kê theo phân công. |
| Ban kiểm kê | Kiểm đếm theo đợt được giao; ghi số thực tế; lập và gửi biên bản kiểm kê. |
| Chủ xưởng | Tra cứu danh mục và tồn kho; theo dõi kế hoạch của xưởng; lập yêu cầu nhập/xuất; nhập thành phẩm từng phần; lập báo cáo tiến độ/sự cố/thiếu NVL và báo cáo thành phẩm khi hoàn tất. |
| Ban giám đốc | Phê duyệt/từ chối đơn và kế hoạch sản xuất liên quan, kế hoạch mua/bán, đề xuất ngoại lệ; lập đợt kiểm kê và công việc; xem báo cáo sản xuất, thành phẩm, tồn kho, nhập/xuất và kiểm kê. |

Mọi tài khoản đã đăng nhập có thể xem thông báo dành cho mình. Quyền thao tác còn phụ thuộc trạng thái chứng từ, chủ sở hữu, xưởng, người được phân công và điều kiện nghiệp vụ. Có quyền xem không đồng nghĩa có quyền tạo, sửa, duyệt hoặc ghi sổ. Ban giám đốc không phải tài khoản quản trị toàn quyền.

## Tài khoản và mật khẩu các database MySQL

Các giá trị dưới đây là cấu hình mặc định trong `app/docker-compose.yml`, đối chiếu với `src/config/service-credentials.js`. Nếu đã ghi đè bằng biến môi trường hoặc `.env`, dùng cấu hình thực tế của môi trường đó.

| Service / mục đích | Database | Username (tài khoản) | Password (mật khẩu mặc định) |
| --- | --- | --- | --- |
| Identity — tài khoản và xác thực | `KhoHang_Identity` | `identity_db` | `identity123` |
| Business — đơn hàng, kế hoạch, sản xuất, mua hàng | `KhoHang_Business` | `business_db` | `business123` |
| Warehouse — kho, QC, nhập/xuất, kiểm kê | `KhoHang_Warehouse` | `warehouse_db` | `warehouse123` |
| Notification — thông báo | `KhoHang_Notification` | `notification_db` | `notification123` |
| Reporting — báo cáo | `KhoHang_Reporting` | `reporting_db` | `reporting123` |
| Web gateway — phiên đăng nhập | `KhoHang_Gateway` | `gateway_db` | `gateway123` |
| Database nguồn cũ / khởi tạo migration | `KhoHang` | `warehouse_app` | Không cố định; được lưu trong secret `db_password` |

`KhoHang` là database nguồn trước khi tách service, không phải nơi runtime hiện tại ghi đồng bộ toàn bộ dữ liệu. Các database `KhoHang_Acceptance_*` phục vụ kiểm thử, không dùng để đăng nhập và thao tác dữ liệu ứng dụng thường ngày. Tài khoản `root` dành cho khởi tạo/migration, mật khẩu được lưu trong secret `root_password`, không có mật khẩu mặc định cố định trong bảng này.

### Đăng nhập Adminer

- Địa chỉ: http://localhost:8080.
- Hệ thống: **MySQL**.
- Máy chủ (Server): **`mysql`**.
- Username, Password và Database: chọn cùng một dòng trong bảng trên.
- Port MySQL trong mạng Docker: **3306**; cấu hình mặc định không mở port MySQL ra máy host.

Ví dụ xem dữ liệu kho: Server `mysql`, Username `warehouse_db`, Password `warehouse123`, Database `KhoHang_Warehouse`.

Tên database trong bảng dùng tiền tố mặc định `DB_NAME=KhoHang`; nếu đổi `DB_NAME`, tiền tố của cả sáu database cũng thay đổi. Username MySQL là tài khoản kết nối CSDL, không dùng đăng nhập giao diện tại cổng 3000.

## Nguồn đối chiếu

- Tài khoản và vai trò mẫu: `src/repositories/seed.js`.
- Khởi tạo tài khoản MySQL: `database/seeders/foundation.js`.
- Mật khẩu mẫu mặc định: `scripts/setup-secrets.cjs`.
- Menu theo vai trò: `src/config/navigation.js`.
- Phân quyền: `src/services/domain/policy.js`, router và service của từng nghiệp vụ.

Tài khoản này dùng đăng nhập ứng dụng, khác với tài khoản MySQL của từng service. Thông tin tài khoản CSDL xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md).

Danh m?c b?nh, ??n v?/gi? nh? cung c?p v? quy?n qu?n tr?: [QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md](QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md).
