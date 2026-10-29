# Ảnh danh mục

Danh mục LoaiHang có cột DuongDanAnh, JSON/API image_path. Một ảnh mỗi danh mục, không bắt buộc; giá trị chưa có ảnh là NULL. Schema hiện hành nằm trong database/monolith của một database warehouse_db.

Thư mục trong source là src/images/categories/.gitkeep. Node trực tiếp lưu tại đây; Docker gắn volume mono_images vào /app/src/images của ứng dụng mono. Không còn gateway hoặc service danh mục riêng. Ảnh người dùng tải lên không tự được đưa vào Git.

Form thêm/sửa danh mục có chọn PNG/JPEG/WebP tối đa 5 MB, xem trước và Bỏ ảnh. Danh sách/chi tiết có thumbnail. Lưu form mới tải ảnh, lưu lại cùng file khi lỗi chứng từ không tải ảnh thêm lần nữa. Bỏ ảnh đặt image_path=null; không xóa file có thể đang được tham chiếu.

POST /api/v1/category-images nhận {data_url}, yêu cầu đăng nhập WAREHOUSE_MANAGER và X-CSRF-Token; trả {image_path}. Kiểm kiểu/nội dung file và giới hạn byte, không dùng tên file người dùng làm đường dẫn. Lưu file UUID với đuôi theo nội dung. Không nhận SVG/HTML hoặc đường dẫn tùy ý.

GET /images/categories/:file yêu cầu đăng nhập. POST/PATCH /api/v1/categories nhận image_path của file đã tải, chặn đường dẫn không hợp lệ/không tồn tại. Nếu sửa các field khác mà không gửi image_path thì giữ ảnh cũ.

docker compose down và rebuild thông thường giữ ảnh trong volume mono_images. Backup/restore cần giữ cả warehouse_db và ảnh, vì bản sao SQL không chứa nội dung ảnh. Dùng docker compose cp app:/app/src/images ./backups/images để chép ảnh ra máy. Không xóa volume nếu còn muốn khôi phục ảnh danh mục.

Kiểm thử: unit định dạng/giới hạn/traversal, SQL acceptance trên namespace riêng kiểm upload/đọc/lưu/sửa/bỏ ảnh/RBAC, browser kiểm chọn/preview/body và bỏ ảnh với write mock. npm run test:category-images:browser.
