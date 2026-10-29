# Phạm vi cần nghiệm thu tiếp — 29/10/2026

| Nhóm | Việc còn lại | Nghiệm thu cần có |
| --- | --- | --- |
| Hàng cách ly | Đã có giải phóng/loại bỏ theo duyệt; đối chiếu nhánh đặc biệt theo phiếu chấm | Chỉ quản lý áp dụng sau duyệt, lịch sử biến động, không tự giao bù/hoàn tiền |
| QC và chứng từ đã ghi | Đã có chứng từ bù và cách ly hàng đã nhập, chặn giữ chỗ; mở rộng theo yêu cầu phiếu chấm | Không sửa lịch sử, không âm tồn hoặc vượt QC, rollback và idempotency |
| Bao phủ UC | Đối chiếu từng UC/nhánh với route, UI, SQL và test thực tế | Không lấy CRUD hoặc một happy path làm hoàn thành UC |
| Sản xuất | Đối chiếu nhu cầu/định mức NVL và sản lượng thực tế theo yêu cầu tiếp theo | Dự phòng chỉ một lần, import không giả số thực tế |
| Triển khai chính thức | Cấu hình bảo mật, theo dõi vận hành, sao lưu warehouse_db cùng ảnh và thử khôi phục | Có đối soát dữ liệu, hướng dẫn khôi phục và kiểm thử sự cố vận hành |

Mã hiện tại là một ứng dụng mono và một database; không tiếp tục làm hạ tầng tách service như một phần việc còn thiếu. Các luồng nhập từng phần, kiểm kê, ngoại lệ và nguồn bán đã có kiểm thử ở mức hiện hành. Nhánh cần bổ sung phải xác nhận từ phiếu chấm hoặc bằng chứng thực tế, không suy ra đã hoàn tất mọi trường hợp chỉ từ số bài kiểm thử.

Hướng dẫn kiến trúc: ARCHITECTURE.md. Tiến độ và bằng chứng: IMPLEMENTATION_PROGRESS.md. Giữ quyết định đã được người dùng chốt trong BUSINESS_DECISIONS/SRS/USE_CASES.

Quản lý nhân viên/bộ phận ngoài phạm vi theo yêu cầu người dùng. Xem WAREHOUSE_EXCEPTION_WORKFLOWS.md cho nghiệp vụ mới.
