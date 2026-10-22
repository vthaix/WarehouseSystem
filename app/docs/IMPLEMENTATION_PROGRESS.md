# Tiến độ hiện tại — 14/10/2026

## Kiến trúc

Đã có năm backend HTTP + web-gateway, index/Dockerfile riêng; module theo owner. Sáu database/tài khoản MySQL đã tách; migration service 001–007. Còn FK/JOIN/view/transaction xuyên schema, chưa broker/outbox/inbox/projection/claims/saga. Xem ARCHITECTURE và SERVICE_DATABASES.

## Nghiệp vụ đã có code và nghiệm thu ở các đợt trước

- Auth/session/CSRF/RBAC/scope và thông báo.
- Đơn khách, tiếp nhận, kế hoạch SX, duyệt KHSX và tự cập nhật đơn; NVL dự phòng 10% một lần.
- Báo cáo tiến độ/sự cố/nhu cầu, tổng kết thành phẩm; loại báo cáo chung bảng.
- Kế hoạch MUA/BAN, đơn mua nguồn PLAN/REPORT/MANUAL, import nguồn và kiểm hạn mức.
- Lô/QC, giữ chỗ/phân công, phiếu nhập/xuất và biến động tồn; kiểm điều kiện giao thành phẩm.
- Kiểm kê theo kho, kết luận, duyệt ngoại lệ và áp dụng riêng; tái kiểm QC.
- Hàng khách trả theo dòng giao gốc, nhập một lần vào cách ly; chưa giao bù/hoàn tiền.
- Nhập thành phẩm từng phần theo KHSX: chung đầu lô, dòng lô riêng từng đợt; QC đạt mới nhập; tổng kết lấy lại lô cũ.

Đây là phạm vi luồng đã triển khai, không phải chứng nhận mọi nhánh của toàn bộ UC. Chi tiết nhập từng phần: PARTIAL_PRODUCTION_RECEIPTS.md.

## Bằng chứng và giới hạn

Đợt đồng bộ 14/10/2026: 48 Node tests và syntax đạt, check:sync đạt; acceptance MySQL qua sáu process/tài khoản runtime trên namespace riêng đạt; browser ngoại lệ/import/EJS/Adminer đạt. Đủ sáu service healthy. Báo cáo: [DOCS_SYNC.md](DOCS_SYNC.md).

Đã nghiệm thu xử lý phần lỗi ngoài kho khi phần đạt đã nhập; cách ly/giải phóng/loại bỏ hàng trả; điều chỉnh QC hàng đã nhập bằng chứng từ bù. 48 Node tests và syntax đạt; acceptance sáu service trên MySQL cô lập đạt. Browser form xử lý cách ly/điều chỉnh đạt. Chi tiết: WAREHOUSE_EXCEPTION_WORKFLOWS.md.

## Còn phải làm

Đối chiếu tất cả nhánh UC kho và ma trận nghiệm thu theo phiếu chấm; quản lý nhân viên/bộ phận ngoài phạm vi; hoàn thiện cơ chế độc lập dữ liệu và vận hành production. Backlog: IMPLEMENTATION_BACKLOG.md.

Lịch sử mô tả monolith và kết quả các mốc trước lưu trong archive/pre-microservice-doc-sync-20261014.

Đã hợp nhất toàn bộ đặc tả hiện hành và sinh manifest cấu trúc/CSDL/API; menu/nhãn browser dùng một nguồn chung với server. Không thêm migration sau 006 hoặc thay dữ liệu chính trong đợt đồng bộ.

Đợt ảnh danh mục: migration 007, image_path/DuongDanAnh và src/images/categories; volume bền vững. 50 Node tests, SQL acceptance và browser ảnh đạt. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).