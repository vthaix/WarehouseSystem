# Đồng bộ toàn bộ dự án — 14/10/2026

## Phạm vi hoàn tất

Đã hợp nhất SRS, USE_CASES, DOMAIN_MODEL, BUSINESS_DECISIONS, DOMAIN_ALIGNMENT, API và UI_SPEC thành bản hiện hành. Giữ 48 mã UC gốc và hai luồng UC-11.01/11.02; bản trước hợp nhất lưu trong archive/before-full-sync-20261014. Tài liệu hiện hành không dùng ghi chú mới đầu trang để ghi đè đặc tả cũ bên dưới.

Cấu trúc, vận hành, tiến độ/backlog và ma trận UC theo năm backend HTTP + web-gateway, sáu database/tài khoản MySQL. Quản lý nhân viên/bộ phận ngoài phạm vi; dữ liệu hồ sơ/quyền hiện có được giữ để không mất tham chiếu.

## Code và giao diện

Loại bộ menu/nhãn/field names riêng trong public/js/app.js. Server và browser dùng một nguồn src/config/navigation.js; public/js/navigation-data.js sinh bởi docs:sync. Sửa lệch quyền hiển thị ở báo cáo thành phẩm, ngoại lệ, công việc và báo cáo tồn để khớp menu server; backend vẫn kiểm quyền/scope riêng.

Không chuyển domain sang gateway, không xóa runtime legacy phục vụ test, không thay cơ chế transaction hoặc sửa luật nguồn đã chốt.

## CSDL và tài liệu sinh từ code

Xuất lại snapshot sáu database từ MySQL đang chạy sau migration 001–006. Không thêm DDL/migration trong đợt đồng bộ này, không sửa lịch sử migration 001–026, fingerprint ownership hoặc dữ liệu đang hoạt động.

Các artifact từ source:
- generated/PROJECT_MANIFEST.json: 6 service, database/account mặc định, owner/object/column, policy, menu và 140 API routes.
- generated/API_ROUTES.md: router thật, gồm auth gateway và ModuleRoutes.
- generated/API_CONTRACT_FIELDS.md: whitelist C.fields trích từ service/helper; trường động đọc validation gốc.
- generated/DATABASE_OBJECTS.md: owner, TABLE/VIEW và cột từ snapshot.
- public/js/navigation-data.js: cấu hình browser từ nguồn server.

## Kiểm chứng đã chạy

- 48 kiểm thử Node đạt; kiểm tra cú pháp JavaScript đạt.
- check:sync đạt: entrypoint/compose/Dockerfile, wiring/checkpoint migration, owner snapshots, artifact sinh, menu chung, đủ UC và liên kết docs.
- Acceptance MySQL trên namespace riêng qua 6 HTTP process/tài khoản service: auth/owner, công việc, kiểm kê, nhu cầu/mua, nhập/xuất/QC, hàng trả/cách ly, bù QC và trả NCC đạt.
- Browser form ngoại lệ/import đạt (write được mock); Docker browser EJS không JavaScript, form nguồn, quyền và Adminer đạt.
- Docker up --build --wait đạt; sáu service và MySQL healthy khi nghiệm thu.

SQL acceptance không tạo chứng từ thử trong database chính. Snapshot là schema tham chiếu, không phải lệnh restore đè. Dữ liệu và volumes hiện có được giữ.

## Cách duy trì

Từ app/: npm run docs:sync, npm run check:sync, npm test, npm run check. Thay schema phải thêm migration mới, xuất snapshot và kiểm SQL cô lập; thay form chạy browser test phù hợp. docs:sync chỉ sinh artifacts/menu, không tự ghi lại đặc tả nghiệp vụ thủ công.

## Giới hạn

Đồng bộ không chứng nhận mọi nhánh UC hoặc performance/production. Những chi tiết theo phiếu chấm còn đối chiếu tại MODULE_MATRIX/IMPLEMENTATION_BACKLOG. Sáu database vẫn trên một MySQL server với FK/JOIN/view/transaction xuyên schema; chưa broker/outbox/inbox/projections/claims/saga. Backup trước cutover không thay backup đồng bộ sáu schema production.


Đợt ảnh danh mục: migration 007, image_path/DuongDanAnh và src/images/categories; volume bền vững. 50 Node tests, SQL acceptance và browser ảnh đạt. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).