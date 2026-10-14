# Ảnh danh mục

Danh mục LoaiHang có cột DuongDanAnh (VARCHAR 255, NULL), JSON/API image_path. Một ảnh mỗi danh mục, không bắt buộc; bản cũ giữ NULL. Migration service 007_category_images giữ dữ liệu và làm mới view tương thích.

Thư mục trong src: src/images/categories/.gitkeep. Chạy Node trực tiếp lưu file tại đây; Docker mount named volume category_images vào /app/src/images. Gateway được ghi; Business chỉ đọc để kiểm đường dẫn trước lưu danh mục. Ảnh không đóng gói trong Git/image.

Form thêm/sửa danh mục có chọn PNG/JPEG/WebP tối đa 5 MB, xem trước và Bỏ ảnh. Danh sách/chi tiết có thumbnail. Lưu form mới tải ảnh, lưu lại cùng file khi lỗi chứng từ không tải ảnh thêm lần nữa. Bỏ ảnh đặt image_path=null; không xóa file có thể đang được tham chiếu.

POST /api/v1/category-images nhận {data_url}, yêu cầu đăng nhập WAREHOUSE_MANAGER và X-CSRF-Token; trả {image_path}. Kiểm kiểu/nội dung file và giới hạn byte, không dùng tên file người dùng làm đường dẫn. Lưu file UUID với đuôi theo nội dung. Không nhận SVG/HTML hoặc đường dẫn tùy ý.

GET /images/categories/:file yêu cầu đăng nhập. POST/PATCH /api/v1/categories nhận image_path của file đã tải, chặn đường dẫn không hợp lệ/không tồn tại. Nếu sửa các field khác mà không gửi image_path thì giữ ảnh cũ.

docker compose down và rebuild giữ ảnh trong volume; down -v xóa volume. Backup/restore phải giữ cả sáu CSDL và volume category_images, không chỉ snapshot SQL. File trong volume không tự xuất hiện trong thư mục src/images trên host.

Kiểm thử: unit định dạng/giới hạn/traversal, SQL acceptance trên namespace riêng kiểm upload/đọc/lưu/sửa/bỏ ảnh/RBAC, browser kiểm chọn/preview/body và bỏ ảnh với write mock. npm run test:category-images:browser.
