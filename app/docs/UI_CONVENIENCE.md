# Giao diện thuận tiện và ảnh mặt hàng — 30/10/2026

## Sử dụng

- Form mở từ một form khác có **Quay lại**. Quay lại giữ nguyên các ô đã nhập, lựa chọn, sự kiện và vị trí cuộn của form trước. Escape quay về form trước; X đóng toàn bộ phiên form. Hủy form con quay lại form trước; lưu thành công vẫn đóng và tải lại dữ liệu như trước.
- Tiêu đề và nút X cố định khi cuộn; các nút lưu/xác nhận ở cuối form được giữ trong tầm nhìn. Bố cục thu gọn cho điện thoại.
- Chi tiết hiển thị phần chính trước. Thông tin bổ sung, ghi chú không bắt buộc và một số bảng lịch sử mở bằng phần xổ xuống; nội dung ghi chú đã có được mở sẵn khi chỉnh sửa. Trường báo cáo sản xuất quan trọng không bị tự thu gọn. Trường không hợp lệ trong phần thu gọn được mở ra khi kiểm tra biểu mẫu.
- Danh sách chứng từ có **Mới nhất** cho dòng đầu trang đầu của kết quả đang xem, theo thứ tự mới nhất của từng nghiệp vụ. **Chưa xem** và nền đỏ nhạt dùng thông báo chưa đọc của chính tài khoản. Xem chi tiết đánh dấu thông báo tương ứng đã đọc ở máy chủ, không tự phê duyệt, ghi phiếu hoặc hoàn thành công việc; các số việc chờ xử lý vẫn giữ đến khi xử lý xong.
- Bộ phận mua hàng thấy **Kế hoạch đã duyệt chờ đặt mua** ngay khi vào Đơn mua hàng. Nút **Đặt mua theo kế hoạch** mở form với đúng nguồn, số lượng và ngày nhận; người mua chọn nhà cung cấp cho từng dòng. Nguồn đã có đơn mua không xuất hiện trong bộ chọn mới. Điều kiện tạo đơn ở backend vẫn được kiểm tra lại khi lưu.
- Dashboard theo quyền: các thẻ số liệu, khối lượng công việc theo chức năng, cập nhật gần đây có liên kết chứng từ và truy cập nhanh. Biểu đồ dùng số liệu thực trong phạm vi tài khoản, không dùng số minh họa. Số liệu tải khi mở trang; huy hiệu chờ xử lý tự làm mới như trước.

## Ảnh và seed

33 mã mặt hàng được ánh xạ ở `src/config/item-image-manifest.js`. Ảnh nguồn người dùng nằm trong `app/img`; ảnh chạy trong ứng dụng nằm ở `app/public/images/items` và được đóng gói vào Docker image. Không phụ thuộc ảnh nằm trên máy người phát triển.

Ảnh túi và tem mới:

- `app/img/tui-banh-sweet-taste.png`
- `app/img/tem-nhan-sweet-taste.png`

Hai file trên có bản tương ứng trong `app/public/images/items`. Ảnh túi gốc `tui-banh.jpg` giữ nguyên. Các tên như `banh-nahn-dau-do.webp`, `cup-cake.jpg`, `sicula.jpg` được ánh xạ rõ theo mã, không đổi tên ảnh người dùng.

`MatHang.DuongDanAnh` đã có trong schema; lần này dùng lại cột đó, không tách ảnh sang bảng nguyên vật liệu/thành phẩm. `database/seeders/item-images.js` bổ sung ảnh một lần, chỉ điền ảnh còn trống, giữ ảnh đã được người dùng chọn. Mốc `demo_item_images_v1` giữ cả quyết định bỏ ảnh của người dùng ở các lần khởi động sau. Không đặt lại danh mục, giá, đơn vị, tài khoản hoặc chứng từ cũ.

Quản lý kho có thể chọn/bỏ ảnh trong form thêm hoặc sửa mặt hàng. Tải ảnh dùng endpoint đã có, chỉ Quản lý kho được tải. PNG/JPEG/WebP tối đa 5 MB, kiểm tra nội dung file và đường dẫn; không chấp nhận đường dẫn tùy ý. Ảnh hiện ở danh sách, chi tiết và trang khách đặt bánh.

Chạy bản cập nhật tại thư mục gốc:

```powershell
docker compose up -d --build --wait
```

Không xóa volume để cập nhật ảnh hoặc giao diện.

## Thiết kế tài sản hình ảnh

Dùng skill `imagegen` và công cụ image_gen tích hợp, không dùng CLI/API key. Ảnh hộp bánh là tham chiếu phong cách; ảnh túi ban đầu là đối tượng chỉnh sửa. Hai ảnh kết quả đã xem để kiểm tra chữ Sweet Taste và tính thống nhất họa tiết trước khi đưa vào seed. Đây là ảnh sản phẩm minh họa, không phải file khuôn in kỹ thuật.

Prompt túi: “Edit target: image 2, plain kraft bakery bag photo. Reference: image 1 bakery box artwork. Create one polished square catalog product photograph of ONE upright kraft paper bakery bag on pure white background, entire bag visible with comfortable margins. Keep realistic kraft paper material, gussets, folded bottom and open mouth of the bag. Decorate the upper half with subtle repeating whimsical hand-drawn party/bakery doodles matching the box: navy blue fine outlines, mustard yellow accents, pale cream, balloons, small cakes, wrapped sweets, stars, bunting. On a pale cream horizontal label across the lower front print exactly 'Sweet Taste' in elegant readable navy handwritten script matching reference box. Tasteful sparse premium layout, soft studio shadow, no other text, no watermarks. Not a collage. This is the finished bag image used for the bakery material catalog.”

Prompt tem: “Reference image: bakery box for visual identity only. Generate one square photorealistic catalog product image on pure white background: a small neat stack of round bakery packaging adhesive paper labels, front label fully visible facing camera with a slight studio perspective, others subtly offset behind. Main sticker warm ivory/cream with a very fine navy double-line circular border. Center text exactly 'Sweet Taste' in large elegant legible navy handwritten script matching reference box. Around the perimeter tasteful sparse small navy hand-drawn birthday cake, wrapped sweets, balloon, stars and bunting with mustard-yellow and tiny orange highlights matching the box's whimsical artwork. Generous blank cream center around the text, premium printed matte paper texture, soft realistic shadow. Show actual round stickers, not a box, no extra text, no logo watermark, no collage. This is the tem nhan product image for the Sweet Taste bakery inventory.”

## Kiểm tra

- `node e2e/workspace-ux.cjs`: 9 vai trò/dashboard, luồng chọn kế hoạch mua, ảnh 33 mã mặt hàng, form con/quay lại giữ sự kiện và bản nháp, nút X khi cuộn, màn hình điện thoại, ảnh trang đặt hàng. Kết quả và ảnh: `app/artifacts/workspace-ux`.
- `node scripts/workspace-ux-smoke.cjs`: chỉ chấp nhận bản server test; kiểm tra lưu/sửa/bỏ ảnh thật, phân quyền, đường dẫn không hợp lệ, phiên bản cũ, đánh dấu đã xem theo tài khoản và giữ công việc chờ xử lý.
- Bộ unit hiện hành và bộ kiểm thử trình duyệt có sẵn được chạy lại sau thay đổi; xem báo cáo kết quả bàn giao.

Các bài ghi dữ liệu chạy trên project Docker test riêng; không chạy công cụ xóa dữ liệu trên project đang sử dụng.
