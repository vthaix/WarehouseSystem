# Cơ sở dữ liệu của bản mono

Một MySQL, một database `warehouse_db`, tài khoản `warehouse`, mật khẩu mặc định `warehouse123`. Cấu hình Docker tại `app/docker-compose.yml`; chạy Node trực tiếp thì dùng `app/.env` theo `.env.example`. Kết nối tạo tại `src/config/database.js`.

Migration đang chạy nằm trong `database/monolith`, được áp dụng bởi `src/shared/monolith-migrations.js`. Các tệp SQL cũ không còn là đường khởi tạo mặc định. Không sửa nội dung migration đã chạy; thêm migration mới cho lần thay đổi tiếp theo. Bảng `LichSuCSDL` lưu lần áp dụng và mã kiểm tra.

## Cấu trúc mặt hàng

| Bảng | Nội dung |
| --- | --- |
| `MatHang` | Mã, tên, danh mục, loại, đơn vị, giá tham khảo, mô tả, ảnh, trạng thái |
| `NguyenVatLieu` | `MaMatHang` vừa là khóa chính vừa tham chiếu bảng cha; tiêu chuẩn nhập riêng |
| `ThanhPham` | `MaMatHang` vừa là khóa chính vừa tham chiếu bảng cha; hạn sử dụng mặc định riêng |

Thêm mặt hàng tự tạo đúng dòng con. API không cho đưa tiêu chuẩn nguyên vật liệu vào thành phẩm hoặc hạn dùng mặc định của thành phẩm vào nguyên vật liệu. Tồn kho và các dòng chứng từ tiếp tục tham chiếu mặt hàng chung. Đơn vị tính, danh mục và giá theo nhà cung cấp vẫn có vai trò riêng. Giá thực tế nằm trên chứng từ; không lấy giá hiện tại để sửa giá lịch sử.

## Cấu trúc lô

`LoHang` chứa mã lô và loại `NGUYEN_VAT_LIEU`, `THANH_PHAM`, `TRA_VE`. `ChiTietLo` chứa mặt hàng, lượng thực nhận hoặc hoàn thành, phần lô, ngày sản xuất, hạn dùng, nguồn và trạng thái chất lượng. Không tạo bảng lô nguyên vật liệu, lô thành phẩm riêng.

Hàng trả giữ hướng trả, dòng giao gốc và lượng trả. Các phần nhỏ của một lô thành phẩm được kiểm tra và nhập riêng; không dùng tổng đầu lô để nhập lại nhiều lần.

## Duyệt trước khi mua

Đơn mua mới phải gắn kế hoạch loại Mua đã duyệt. Kiểm tra được thực hiện trong `src/modules/purchasing/PurchaseOrderService.js` và trigger `KiemDuyetDonMua`. Kế hoạch có thể lập trực tiếp hoặc theo báo cáo nhu cầu, nhưng cả hai đều phải qua duyệt. Nhà cung cấp chọn theo từng dòng ở bước mua.

## Lưu dữ liệu

Volume mới `mono_mysql_data` giữ dữ liệu sau khi build hoặc `down` thông thường. Seed demo chỉ khởi tạo một lần và không đặt lại mật khẩu tài khoản đã có. Tài khoản demo, 3 xưởng và danh mục bánh được cung cấp cho máy mới.

Volume và database của microservice cũ không bị xóa hay đổi tên. Dữ liệu cũ không tự xuất hiện trong volume mono mới. Cần sao lưu và chuyển dữ liệu riêng nếu muốn tiếp tục sử dụng lịch sử cũ; không dùng việc đổi tên biến môi trường làm thao tác chuyển dữ liệu.

Danh mục bảng và VIEW hiện hành: [DATABASE_OBJECTS.md](generated/DATABASE_OBJECTS.md). VIEW là cách đọc dữ liệu gốc, không phải một bộ bảng trùng dữ liệu.
