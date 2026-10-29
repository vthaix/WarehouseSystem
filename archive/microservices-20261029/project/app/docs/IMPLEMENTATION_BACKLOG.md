# Backlog hiện tại — 14/10/2026

| Nhóm | Việc còn lại | Nghiệm thu cần có |
| --- | --- | --- |
| Độc lập dữ liệu | Thay SQL/FK/view xuyên owner bằng API/events; outbox/inbox; projection; claims/compensation | Chạy database trên server riêng, lỗi mạng/restart/cạnh tranh không phá invariant |
| Hàng cách ly | Đã có giải phóng/loại bỏ theo duyệt; đối chiếu nhánh đặc biệt theo phiếu chấm | Chỉ quản lý áp dụng sau duyệt, lịch sử biến động, không tự giao bù/hoàn tiền |
| QC và chứng từ đã ghi | Đã có chứng từ bù và cách ly hàng đã nhập, chặn giữ chỗ; mở rộng theo yêu cầu phiếu chấm | Không sửa lịch sử, không âm tồn hoặc vượt QC, rollback và idempotency |
| Bao phủ UC | Đối chiếu từng UC/nhánh với route, UI, SQL và test thực tế | Không lấy CRUD hoặc một happy path làm hoàn thành UC |
| Sản xuất | Đối chiếu nhu cầu/định mức NVL và sản lượng thực tế theo yêu cầu tiếp theo | Dự phòng chỉ một lần, import không giả số thực tế |
| Production | Secrets thật, quan sát, phát hành, backup sáu schema, thử restore | Restore có đối soát, rollout/lỗi mạng và hồ sơ nghiệm thu |

Skeleton service, database owner, nhập từng phần, kiểm kê, ngoại lệ và nguồn bán đã triển khai ở mức luồng hiện tại; không lặp lại các việc này như module hoàn toàn chưa có. Các nhánh còn thiếu phải xác nhận bằng code/test.

Hướng dẫn kiến trúc: ARCHITECTURE.md. Tiến độ và bằng chứng: IMPLEMENTATION_PROGRESS.md. Giữ quyết định đã được người dùng chốt trong BUSINESS_DECISIONS/SRS/USE_CASES.

Quản lý nhân viên/bộ phận ngoài phạm vi theo yêu cầu người dùng. Xem WAREHOUSE_EXCEPTION_WORKFLOWS.md cho nghiệp vụ mới.