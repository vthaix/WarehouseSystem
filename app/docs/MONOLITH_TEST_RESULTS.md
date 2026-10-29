# Kết quả chuyển mono và kiểm thử — 29/10/2026

Đã chuyển mã đang chạy sang một ứng dụng Express/EJS và một database MySQL `warehouse_db`, tài khoản `warehouse`, mật khẩu mặc định `warehouse123`. Bản microservice trước chuyển đổi giữ riêng trong `archive/microservices-20261029/project` ở gốc repository; ZIP có cấu hình riêng tư và bảng kiểm tra tệp nằm trong `backups/mono-refactor-20261029`.

## Những thay đổi đã thực hiện

- Đưa mã nghiệp vụ về `src/modules`; một entrypoint `src/server.js`, một Dockerfile ứng dụng. Bỏ các host, proxy và giao tiếp HTTP nội bộ của bản microservice khỏi mã đang chạy.
- Tất cả mô-đun dùng cùng pool kết nối và schema. Migration mono nằm tại `database/monolith`; bản SQL để import vào database trống là `database/schema.sql`. Không chạy quy trình tách schema hoặc cấp tài khoản từng service khi khởi động.
- `MatHang` là bảng cha; `NguyenVatLieu` và `ThanhPham` dùng khóa chính đồng thời là khóa ngoại về cha. Tiêu chuẩn nhập và bảng giá nhà cung cấp nằm tại nguyên vật liệu, hạn dùng mặc định nằm tại thành phẩm. Khi thêm mặt hàng, tạo đúng dòng con. Kiểm tra và ngăn đổi loại trái cấu trúc.
- Lô vẫn dùng một `LoHang` có loại lô và các `ChiTietLo` theo phần nhận/hoàn thành; không chia bảng lô NVL và TP riêng. Giữ truy vết hàng trả, QC từng phần và lượng nhập/xuất cộng dồn.
- Mua NVL chỉ theo kế hoạch mua đã duyệt; bỏ lựa chọn mua trực tiếp. Kế hoạch mua có thể lập trực tiếp hoặc theo báo cáo nhưng phải qua duyệt. Backend và trigger MySQL chặn bỏ qua duyệt. Giữ chọn nhà cung cấp cho từng dòng.
- Sửa lỗi Node crypto khi duyệt/phân công, nối bảng giá vật tư vào runtime mono; sửa xuất CSV và bỏ nút tạo phiếu kho chung không đúng luồng. Ghi phiếu vẫn qua công việc được phân công.
- Reset thử nghiệm chạy trong ứng dụng mono, sao lưu trước khi xóa và giữ tài khoản/danh mục. Công cụ tạo mẫu tái sử dụng danh mục sau reset, không đổi đơn vị hiện có.

## Kết quả thực thi

| Hạng mục | Kết quả |
| --- | --- |
| Kiểm thử đơn vị hiện hành | **73/73 đạt** |
| Kiểm thử SQL và chuỗi nghiệp vụ | **12/12 bộ đạt** |
| Kiểm thử trình duyệt | **13/13 bộ đạt** |
| Rà soát theo tài khoản | **122 lượt màn hình, 18 tài khoản; 0 lỗi trang/JavaScript ngoài dự kiến** |
| Tải CSV bằng nút thật | **3/3 báo cáo trả HTTP 200** |
| Tạo dữ liệu thử độc lập | **36 bộ được tạo và kiểm tra trạng thái** |
| Chạy lại công cụ tạo mẫu | Số chứng từ nghiệp vụ không tăng; không so bộ đếm phiên/đăng nhập/nhật ký/thông báo |
| Reset rồi dựng lại mẫu | **Đạt**; danh mục được tái sử dụng, đơn vị các mặt hàng đã có giữ nguyên |
| Khởi tạo từ volume mono mới bằng Compose mặc định | **Đạt**; app/MySQL healthy, Adminer chạy; 18 tài khoản, 3 xưởng, 33 mặt hàng hoạt động |
| Cú pháp, import và đồng bộ tài liệu sinh từ mã | **Đạt** |

12 bộ SQL gồm schema/kế thừa, công việc, kiểm kê kho, đơn hàng, sản xuất, mua hàng–QC–nhập/xuất–giao hàng–hàng trả, thành phẩm từng phần, ảnh danh mục, tiền sản xuất, phân công kiểm tra từng phần, tài khoản/danh mục và xác nhận vượt lượng dự kiến.

Các ca mua hàng mới kiểm: mua trực tiếp hoặc từ báo cáo bị chặn; kế hoạch chưa duyệt bị chặn; chỉ lấy đúng dòng và lượng đã duyệt; nhà cung cấp không hợp lệ bị chặn; hai lần tạo cùng kế hoạch chỉ có một đơn; kế hoạch lập trực tiếp đã duyệt dùng được; kế hoạch vượt nguồn đã được xác nhận và duyệt vẫn mua được.

13 bộ trình duyệt gồm EJS không JavaScript, tài khoản/danh mục, giao diện desktop/mobile, ảnh, khách đặt hàng, kiểm tra lô, cảnh báo kế hoạch, tiền sản xuất, lấy dữ liệu nguồn, ngoại lệ, sơ đồ kho, điều phối yêu cầu kho và reset. Một số kiểm thử biểu mẫu dùng phản hồi giả để kiểm nội dung gửi; phần ghi thật được kiểm riêng qua SQL/API, không coi phản hồi giả là bằng chứng lưu CSDL.

Các bài kiểm thử giao tiếp giữa microservice không còn áp dụng cho bản mono và được giữ trong bản lưu cũ; vì vậy không so trực tiếp số bài Node mới với tổng cũ có kiểm thử transport. Các lượt thất bại trong quá trình chuyển đổi được giữ ở thư mục backup, không gộp vào kết quả đạt cuối.

## Bằng chứng và giới hạn

Tóm tắt có kiểm tra tự động và các bằng chứng của lượt cuối ở [monolith-review-20261029](monolith-review-20261029/). Ảnh màn hình đầy đủ nằm tại `app/artifacts/monolith-review`; log build/kiểm thử phát triển trong thư mục backup cục bộ.

Kiểm thử dùng project `warehouse-mono-review-20261029`, cổng 3310 và volume riêng. Bản chạy thông thường dùng project `warehouse-mono`, cổng 3000. Không chạy bộ kiểm thử ghi/xóa dữ liệu lên project thường. Công cụ nghiệm thu kiểm tra cờ nhận diện bản test trước khi reset.

Không khẳng định đã mô phỏng mọi sự cố máy chủ, mất điện, tải lớn, lỗi đĩa hoặc mọi tổ hợp đầu vào có thể xảy ra. Kết quả trên là những bộ đã thực thi. Chưa tự bổ sung các nghiệp vụ ngoài quyết định hiện có như hoàn tiền/giao bù tự động hay tự nhập trả NVL dư chỉ từ việc ghi báo cáo.

Các volume microservice cũ được giữ nguyên. Database mono mặc định là bản khởi tạo mới có tài khoản và danh mục, **không tự nhập lịch sử giao dịch từ các schema cũ**. Bản mã nguồn cũng không thay thế bản sao dữ liệu MySQL. Chưa commit hoặc push thay người dùng.
