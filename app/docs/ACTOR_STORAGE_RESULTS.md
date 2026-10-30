# Kết quả kiểm tra giao diện và bố trí kho — 30/10/2026

Môi trường nghiệp vụ: dự án Compose riêng `warehouse-mono-review-20261029`, cổng 3310. Bộ kiểm thử nghiệp vụ có xóa dữ liệu giao dịch của môi trường kiểm thử sau khi kiểm tra cờ `test_instance`; không chạy thao tác này trên dự án chính.

| Nhóm | Kết quả cuối |
| --- | --- |
| Kiểm thử đơn vị | 78/78 đạt |
| Cú pháp JavaScript | Đạt |
| Đồng bộ cấu trúc, migration, Compose và tài liệu sinh tự động | Đạt |
| API actor-storage | Đạt: phân quyền, tách nhập/xuất, nhà cung cấp phù hợp, từ chối sai khu và hoàn tác |
| Trình duyệt actor-storage | Đạt: 10 vai trò, trang bị cấm, ảnh vuông, nhãn cung ứng, lọc khu và màn hình nhỏ |
| MySQL monolith-acceptance | 12/12 nhóm đạt |

12 nhóm MySQL: monolith-schema, tasks, stocktake, order, production, commerce, partial-receipt, category-images, preproduction, finished-parts-task, accounts-catalog, planning-confirmation.

11 bộ kiểm tra trình duyệt hồi quy đều đạt: source-imports, warehouse-request-workflow, inspection-workflow, accounts-catalog, warehouse-lookup, preproduction, customer-order, warehouse-exceptions, admin-theme, category-images, workspace-ux. Bộ inspection-workflow được chạy lại sau khi sửa đường dẫn bài kiểm thử của nhân viên kho sang màn hình Nhập kho. Một số bộ giao diện giả lập thao tác ghi để kiểm tra biểu mẫu; việc ghi và ràng buộc thật được kiểm tra riêng qua API/MySQL.

Trong lần chạy đầu, preproduction chọn tùy ý nhà cung cấp nên bị ràng buộc cung ứng mới từ chối đúng. Bài kiểm thử đã được sửa để chọn trong danh sách cung ứng. Bài accounts-catalog cũng được sửa để khôi phục bảng giá mẫu sau khi kiểm tra cập nhật; sau đó chạy lại toàn bộ 12 nhóm MySQL thành công.

Ảnh chụp và kết quả 10 vai trò: `../artifacts/actor-storage/`. Đây là các kiểm tra đã chạy cho phạm vi cập nhật, không phải chứng nhận mọi nhánh của toàn bộ đặc tả đều đã được kiểm thử.

Điểm còn chờ: quyền purchaser ghi nhận hàng thực nhận theo UC-BS04 chưa thay đổi do bộ duyệt tự động yêu cầu xác nhận riêng. Chi tiết tại [RECEIPT_ACTOR_REVIEW.md](RECEIPT_ACTOR_REVIEW.md).
