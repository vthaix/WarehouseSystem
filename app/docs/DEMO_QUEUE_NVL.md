# Dữ liệu mẫu queue nhập / xuất NVL

Seed tự chạy khi `docker compose up -d --build`. Chỉ thêm một lần, không xóa dữ liệu hiện có, không hoàn lại lượng đã xuất. Không chạy trong môi trường production.

Kho mẫu: **Kho nguyên vật liệu của xưởng ahtor (KHO-01)**. Hai mặt hàng có sẵn: bột mì và bơ lạt; không tạo thêm danh mục.

| Mã lô | NVL | Nhà cung cấp | Hạn dùng từ NSX | Hạn còn lại lúc seed | Nhập trước ngày seed | Tồn ban đầu |
|---|---|---|---:|---:|---:|---:|
| DEMO-Q-BOT-SOM | Bột mì | Tâm Anh | 90 ngày | 15 ngày | 12 ngày | 20 kg |
| DEMO-Q-BOT-CUNG-HAN-1 | Bột mì | Minh Châu | 180 ngày | 45 ngày | 10 ngày | 15 kg |
| DEMO-Q-BOT-CUNG-HAN-2 | Bột mì | Minh Châu | 180 ngày | 45 ngày | 5 ngày | 15 kg |
| DEMO-Q-BOT-HAN-XA | Bột mì | Minh Châu | 180 ngày | 120 ngày | 2 ngày | 30 kg |
| DEMO-Q-BO-SOM | Bơ lạt | Xuân Hoài | 60 ngày | 10 ngày | 8 ngày | 10 kg |
| DEMO-Q-BO-HAN-XA | Bơ lạt | Xuân Hoài | 60 ngày | 40 ngày | 1 ngày | 15 kg |

NSX = ngày hết hạn trừ số ngày hạn dùng của đúng cặp NVL / NCC. Ngày hết hạn tính tương đối tại lần seed đầu, **không tự dời ngày khi khởi động lại**. Các NVL khác giữ cấu hình hiện tại. Mỗi lô có nguồn kế hoạch mua đã duyệt, đơn mua, QC đạt, yêu cầu nhập đã hoàn thành, phiếu nhập và biến động tồn tương ứng.

## Demo xuất theo queue

1. Đăng nhập chủ xưởng ahtor (`workshop`), lập yêu cầu xuất bột mì từ kế hoạch sản xuất phù hợp.
2. Đăng nhập quản lý kho (`manager`), mở **Quản lý xuất kho**, chọn yêu cầu và điều phối.
3. Queue ưu tiên `BOT-SOM` → `BOT-CUNG-HAN-1` → `BOT-CUNG-HAN-2` → `BOT-HAN-XA`. Nếu yêu cầu 40 kg và chưa xuất lô mẫu nào, đề xuất tương ứng **20 + 15 + 5 kg**.
4. Hai lô cùng hạn chứng minh ưu tiên lô nhập trước. Lô hết hạn hoặc đã giữ chỗ không được tính vào lượng khả dụng. Nếu kho có lô khác, các lô đó cùng tham gia sắp xếp theo hạn và ngày nhập thực tế.

## Demo đề xuất khu nhập

1. Tạo nhu cầu mua bột mì, duyệt kế hoạch, mua đúng NCC; QC ghi nhận thực nhận và phần đạt; quản lý xác nhận lô mới.
2. Chủ xưởng gửi yêu cầu nhập, quản lý mở điều phối nhập kho.
3. NVL được đề xuất vào **Khu bột**; bơ vào **Khu bơ, sữa và trứng**. Lô hạn gần được đề xuất phía ngoài, hạn xa phía trong theo dữ liệu tồn cùng mặt hàng. Giao diện hiển thị tên khu; thứ tự trong khu phục vụ queue.
4. Đổi NCC bột mì Tâm Anh / Minh Châu để kiểm tra hạn dùng 90 / 180 ngày, tính từ NSX thực nhận.

Kiểm tra dữ liệu: `docker compose exec app node scripts/queue-demo-check.cjs`. Kiểm tra này phù hợp ngay sau seed, trước khi xuất các lô mẫu. Dữ liệu chỉ có một bộ nhỏ, không tự tái tạo nếu dùng chức năng xóa dữ liệu test.
