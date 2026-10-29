# Tài khoản quản trị và danh mục bánh

Cập nhật ngày 23/10/2026.

## Tài khoản quản trị

Đăng nhập `admin` / `123456`, mở Quản lý tài khoản để thêm, sửa, khóa, xóa và phân quyền. Xóa tài khoản là khóa và ẩn khỏi danh sách, giữ tham chiếu trên chứng từ. Thay đổi quyền hoặc mật khẩu làm mất hiệu lực phiên đăng nhập cũ. Không được tự xóa, tự khóa, tự bỏ quyền quản trị hoặc loại bỏ quản trị viên hoạt động cuối cùng.

Quyền ADMIN quản lý tài khoản; quyền nghiệp vụ kho được cấp bằng các vai trò tương ứng. Seed chỉ tạo tài khoản mẫu chưa tồn tại, không khôi phục quyền hoặc mật khẩu đã được quản trị viên chỉnh sửa.

## Danh mục mẫu

Danh mục có hai nhánh: **Thành phẩm** và **Nguyên vật liệu**. Vật tư đóng gói nằm trong nhánh Nguyên vật liệu, danh mục Bao bì. Bấm một danh mục để xem mặt hàng của danh mục đó; khi tạo mặt hàng mới từ đây, nhóm và danh mục được chọn sẵn.

| Nhánh | Danh mục | Số mặt hàng | Đơn vị |
| --- | --- | ---: | --- |
| Nguyên vật liệu | Bột | 3 | kg |
| Nguyên vật liệu | Đường, muối | 3 | kg |
| Nguyên vật liệu | Bơ, sữa, trứng | 4 | kg, lít, quả |
| Nguyên vật liệu | Men và chất tạo nở | 2 | g |
| Nguyên vật liệu | Nhân bánh | 4 | kg |
| Nguyên vật liệu | Kem và trang trí | 3 | lít, kg |
| Nguyên vật liệu | Bao bì | 4 | cái |
| Thành phẩm | Bánh mì | 2 | ổ, cái |
| Thành phẩm | Bánh bông lan | 2 | cái |
| Thành phẩm | Bánh quy | 2 | hộp |
| Thành phẩm | Bánh kem | 2 | cái |
| Thành phẩm | Bánh nhân | 2 | cái |

Tổng cộng **12 danh mục, 33 mặt hàng đang hoạt động**. Ba xưởng mẫu: **Xưởng ahtor**, **Xưởng edxn**, **Xưởng trnvnth**. Danh sách nguồn tại `src/config/bakery-catalog.js`.

Migration `018_bakery_catalog` thay danh mục hiển thị một lần trong môi trường phát triển: ngừng sử dụng danh mục/mặt hàng cũ, cập nhật các mã được tái sử dụng và bổ sung dữ liệu mới. Không xóa đơn hàng, tồn kho, QC hay chứng từ sản xuất; bản ghi cũ còn trong CSDL để giữ lịch sử. Khởi động lại không ghi đè những chỉnh sửa danh mục sau migration. Môi trường production chỉ cập nhật cấu trúc, không nạp bộ mẫu này. Bộ chứng từ demo tùy chọn có thể bổ sung mặt hàng phục vụ kiểm thử riêng.

## Đơn vị và giá nguyên vật liệu

Quản lý kho mở **Đơn vị và giá NVL** để chỉnh đơn vị, giá tham khảo và giá từng nhà cung cấp. Bộ phận mua hàng xem và nhận giá gợi ý khi chọn NVL/nhà cung cấp; vẫn được sửa giá thỏa thuận trên đơn mua. Giá mẫu không phải báo giá thực tế. Không đổi đơn vị của mặt hàng đã được sử dụng trong lô hoặc chứng từ mua/kế hoạch.

Ô số hiển thị dấu phẩy thập phân, ví dụ `1,25`; số nguyên hiển thị `100`. Backend nhận dạng chuẩn `1.25` để tính toán chính xác. Giá nhà cung cấp không được đưa vào dữ liệu danh mục khách hàng.

## Kiểm tra

- `node --test`: 76 ca đạt.
- Split MySQL acceptance: đạt qua 18 migration, gồm phân quyền tài khoản, thu hồi phiên, giá NVL và lọc danh mục.
- `node e2e/accounts-catalog.cjs`: đạt luồng giao diện quản trị, danh mục và dấu phẩy thập phân. Các thao tác ghi của browser được giả lập; kiểm ghi thật nằm trong schema acceptance riêng.

Migration `017_admin_accounts` bổ sung quyền quản trị và cờ xóa mềm. Không cần xóa Docker volume để áp dụng thay đổi.

Migration `019_workshop_accounts` b? sung `workshop2` ? X??ng edxn v? `workshop3` ? X??ng trnvnth; `workshop` ph? tr?ch X??ng ahtor. M?t kh?u hai t?i kho?n m?i l? `123456`. T?i kho?n ?? t?n t?i gi? nguy?n m?t kh?u v? ph?n c?ng do admin ch?nh. Form qu?n tr? v? backend y?u c?u ch? x??ng ch?n ??ng m?t x??ng.
