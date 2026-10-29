# Kiến trúc mono hiện tại

Ứng dụng là modular monolith: một tiến trình Express chạy `src/server.js`, giao diện EJS và API trong cùng ứng dụng; các mô-đun gọi trực tiếp bằng hàm, không gọi HTTP nội bộ giữa service.

| Cấu hình MySQL | Giá trị mặc định |
| --- | --- |
| Server trong Docker | `mysql:3306` |
| Database duy nhất | `warehouse_db` |
| Username | `warehouse` |
| Password | `warehouse123` |

Chạy ở thư mục gốc bằng `docker compose up -d --build --wait`, vào `http://localhost:3000`. Adminer: `http://localhost:8080`, hệ quản trị MySQL, server `mysql`, tài khoản và database theo bảng trên. Docker tải các image công khai, build ứng dụng, tạo schema và dữ liệu danh mục/tài khoản trên máy mới.

## Cấu trúc đang chạy

```text
app/
  src/
    app.js, server.js
    modules/        # auth, catalog, customer-orders, business-plans,
                    # production, purchasing, warehouse, stock-requests,
                    # quality, stocktakes, tasks, exceptions, returns,
                    # notifications, reporting
    boundaries/     # ghép các mô-đun trong cùng tiến trình
    shared/         # router, session MySQL, migration và tiện ích dùng chung
    config/         # môi trường, kết nối MySQL, phân quyền, danh mục
    views/          # EJS
    images/         # ảnh danh mục và ảnh báo cáo
  public/           # CSS và JavaScript trình duyệt
  database/
    monolith/       # migration đang dùng
    seeders/        # tạo dữ liệu demo ban đầu, không ghi đè mật khẩu đã đổi
  Dockerfile        # một Dockerfile ứng dụng
  docker-compose.yml
  docker-compose.test.yml
archive/microservices-20261029/project/ # bản microservice giữ riêng
```

`src/services/domain` và repository bộ nhớ còn phục vụ kiểm thử nghiệp vụ; không phải các tiến trình microservice. Runtime MySQL dùng các lớp tại `src/modules`.

## Mặt hàng và lô

- `MatHang` chứa thuộc tính chung và loại nguyên vật liệu/thành phẩm. `NguyenVatLieu.MaMatHang` và `ThanhPham.MaMatHang` vừa là khóa chính vừa tham chiếu mặt hàng cha. Thêm mặt hàng tự tạo dòng con đúng loại. Tiêu chuẩn nhập lưu tại nguyên vật liệu; hạn sử dụng mặc định theo ngày lưu tại thành phẩm. Các thuộc tính riêng là tùy chọn.
- Không có bảng lô nguyên vật liệu và lô thành phẩm độc lập. `LoHang.LoaiLo` phân biệt nguyên vật liệu, thành phẩm, hàng trả. `ChiTietLo` lưu từng mặt hàng/phần giao nhận/ngày sản xuất/hạn dùng. Nhiều phần thành phẩm vẫn cùng đầu lô nhưng kiểm chất lượng và nhập kho riêng.
- Hướng trả và chứng từ gốc vẫn được giữ để kiểm soát lượng hàng trả. Các bảng tồn, phiếu kho, QC, kiểm kê, phân công và lịch sử là dữ liệu nghiệp vụ riêng, không phải bản sao của mặt hàng.
- Một số VIEW giữ tên báo cáo/chi tiết để dùng chung một bảng dữ liệu gốc; VIEW không tạo thêm bản sao dữ liệu. Danh sách SQL sinh từ migration ở `generated/DATABASE_OBJECTS.md`.

## Mua nguyên vật liệu bắt buộc duyệt

Bộ phận lập kế hoạch lập kế hoạch mua, có thể lập trực tiếp hoặc từ báo cáo nhu cầu. Ban giám đốc phê duyệt. Bộ phận mua hàng chỉ tạo đơn từ kế hoạch mua đã duyệt, chọn nhà cung cấp và giá từng dòng; lượng và ngày nhận lấy đúng kế hoạch. Không còn mua trực tiếp hoặc mua thẳng từ báo cáo để bỏ qua phê duyệt. Giao diện, API và trigger MySQL đều kiểm điều kiện này. Kế hoạch mua trực tiếp đã duyệt không bị buộc phải có báo cáo sản xuất.

## Dữ liệu và bản cũ

Compose dùng `mono_mysql_data`, không dùng lại hoặc xóa volume microservice cũ. Migration không chạy lại seed để thay mật khẩu hoặc xóa giao dịch mỗi lần khởi động. Không dùng `down -v` khi cần giữ dữ liệu.

Ảnh trong Docker lưu ở volume `mono_images`, gắn tại `/app/src/images` của ứng dụng. Upload qua giao diện, không cần chép ảnh thủ công. Để sao lưu ảnh ra máy: `docker compose cp app:/app/src/images ./backups/images`. Chạy Node trực tiếp thì ảnh ở `app/src/images` trên máy.

Mã microservice, schema và tài liệu trước chuyển đổi nằm trong `../../archive/microservices-20261029/`. Bản có cấu hình riêng tư nằm trong ZIP tại `../../backups/mono-refactor-20261029/`, không đưa lên Git. Bản mã nguồn không thay thế bản sao dữ liệu MySQL; không tự nhận đã chuyển dữ liệu thật từ các database cũ. Chưa xóa volume cũ.

## Kiểm thử an toàn

```powershell
docker compose -f app/docker-compose.yml -f app/docker-compose.test.yml -p warehouse-mono-review-20261029 up -d --build --wait
docker compose -f app/docker-compose.yml -f app/docker-compose.test.yml -p warehouse-mono-review-20261029 exec -T -e ACCEPTANCE_MONOLITH=true app node scripts/monolith-acceptance.cjs
```

Bản kiểm thử dùng project và volume riêng; giao diện ở cổng 3310. Chỉ chạy các bộ kiểm thử ghi dữ liệu trên bản thử riêng này. Xem báo cáo thực thi để biết bộ nào đã chạy đạt; không coi có đặc tả hoặc có mã là đã kiểm thử mọi trường hợp.
