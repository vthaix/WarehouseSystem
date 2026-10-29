# Tài khoản demo của bản mono

Đăng nhập tại `http://localhost:3000`. Các tài khoản mới được tạo với mật khẩu `123456`; nếu đã tự đổi mật khẩu thì dùng mật khẩu đã đổi, seed không đặt lại mật khẩu.

| Username | Mật khẩu ban đầu | Vai trò |
| --- | --- | --- |
| `admin` | `123456` | Quản trị tài khoản, phân quyền |
| `customer`, `customer2` | `123456` | Khách hàng |
| `planner` | `123456` | Bộ phận lập kế hoạch |
| `purchaser` | `123456` | Bộ phận mua hàng; chỉ mua theo kế hoạch đã duyệt |
| `manager` | `123456` | Quản lý kho |
| `staff`, `staff2` | `123456` | Nhân viên kho |
| `qc`, `qc2`, `qc3` | `123456` | Nhân viên QC/AC |
| `stocktaker`, `stocktaker2`, `stocktaker3` | `123456` | Nhân viên Ban kiểm kê |
| `workshop` | `123456` | Chủ Xưởng ahtor |
| `workshop2` | `123456` | Chủ Xưởng edxn |
| `workshop3` | `123456` | Chủ Xưởng trnvnth |
| `director` | `123456` | Ban giám đốc |

Actor cha trên sơ đồ vẫn là Nhân sự kho (Quản lý kho, Nhân viên kho) và Nhân viên kiểm tra (QC/AC, Ban kiểm kê). Không gộp quyền của các actor con thành quyền thao tác chung. Mỗi chủ xưởng chỉ được thao tác kế hoạch và yêu cầu thuộc xưởng được gắn với tài khoản.

## Tài khoản CSDL duy nhất

| Server trong Docker | Database | Username | Password |
| --- | --- | --- | --- |
| `mysql:3306` | `warehouse_db` | `warehouse` | `warehouse123` |

Adminer ở `http://localhost:8080`, chọn MySQL, server `mysql`, nhập thông tin trên. Tài khoản CSDL khác tài khoản đăng nhập giao diện.

Không còn dùng các database Identity/Business/Warehouse/Notification/Reporting/Gateway trong bản đang chạy. Chúng thuộc bản microservice đã giữ riêng trong `archive/microservices-20261029/project` ở gốc repository.
