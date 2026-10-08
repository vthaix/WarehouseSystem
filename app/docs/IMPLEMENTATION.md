# Thiết kế triển khai Express theo mô tả công việc mới

Ngày: 08/10/2026. Nguồn ưu tiên: phần **Mô tả công việc** đầu `SRS.md`. Công nghệ Express MVC + EJS + MySQL. Phần dưới ghi thiết kế và hành vi demo bộ nhớ đã xây dựng trước. Theo yêu cầu Docker mới, nền tảng SQL đã được triển khai riêng; trạng thái thực tế nằm ở [DOCKER_IMPLEMENTATION.md](DOCKER_IMPLEMENTATION.md) và [MODULE_MATRIX.md](MODULE_MATRIX.md). Chưa chuyển các nghiệp vụ kho/sản xuất sang SQL.

## Kiến trúc

Một ứng dụng Express cùng origin. HTTP controller → validator/policy → service → repository. Web routes gọi controller render EJS bằng dữ liệu từ service/repository. JavaScript tăng tương tác cho form nghiệp vụ và gọi JSON API trong cùng Express; không có frontend độc lập. Repository bộ nhớ được thay bằng adapter bền vững sau khi có schema được chốt; backend không ghi SQL trong controller/view.

Session cookie HttpOnly, SameSite=Lax; chống CSRF cả login và mutation. Mật khẩu băm bằng scrypt. Login sai giới hạn 5 lần/15 phút theo tên đăng nhập và IP; phiên idle 30 phút và tuyệt đối 8 giờ. Ghi sổ/duyệt dùng version và Idempotency-Key. Tiền/số lượng tính bằng BigInt theo thang thập phân; không tính bằng float.

## Thay đổi nghiệp vụ và màn hình

| Nghiệp vụ              | Thay đổi từ thiết kế trước                                                                            | Giao diện / module                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Tiếp nhận và duyệt đơn | Planner nhận đơn rồi lập kế hoạch nháp; director duyệt đơn kèm kế hoạch trong một transaction         | Đơn hàng → Kế hoạch sản xuất → Phê duyệt      |
| Trạng thái khách       | APPROVED hiển thị Đã tiếp nhận; RECEIVED nội bộ là Chờ phê duyệt                                      | Đơn hàng khách                                |
| Ước lượng NVL          | Chủ xưởng chọn NVL và báo lượng hiện có/cần, không buộc planner biết định mức trước                   | Báo cáo sản xuất                              |
| Bổ sung NVL            | Yêu cầu mua từ báo cáo SUBMITTED, khác với yêu cầu ghi phiếu nhập                                     | Yêu cầu nhập/xuất: MATERIAL_PURCHASE          |
| Mua NVL                | Kế hoạch mua có nguồn yêu cầu; giới hạn lượng theo nhu cầu thiếu, nguồn truyền sang xưởng của đơn mua | Kế hoạch mua/bán → Đơn mua                    |
| Lập đợt                | COUNT chụp snapshot/khóa kho; QUALITY_CHECK phân công QC theo lô và địa điểm, không khóa kho          | Kiểm kê kho / QC                              |
| NVL lỗi                | Ghi lượng trả NCC trước nhập, không đưa vào QUARANTINE                                                | Kết quả QC/AC                                 |
| Thành phẩm lỗi         | Ghi chú tạo đề xuất QC_FAILURE để director review; phê duyệt trước nhập không đổi tồn                 | QC → Xử lý ngoại lệ                           |
| Điều phối kho          | Manager phân công nhân viên, dòng hàng, lô, vị trí, lượng, thời gian                                  | Yêu cầu → Phân công kho → Công việc nhân viên |
| Hồ sơ kho              | Tổng hợp các phiếu nhân viên theo yêu cầu đã xử lý đủ, không nhập lại số lượng                        | Hồ sơ kho tổng hợp                            |
| Kiểm kê thông thường   | Giữ null/0 khác nhau, snapshot bất biến và duyệt điều chỉnh trước mở kho                              | Kiểm kê → Biên bản → Ngoại lệ                 |

## Hợp đồng API cập nhật

Base `/api/v1`. ID header là chuỗi số, dòng chi tiết tạm dùng UUID trong repository bộ nhớ; số lượng/tiền là chuỗi thập phân. Actor/scope/status vẫn được kiểm tra trên server, kể cả khi UI ẩn nút.

- `POST /production-plans`: nhận customer_order_id ở RECEIVED/APPROVED/IN_PROGRESS, workshop_id, start_date, end_date, outputs; materials có thể rỗng để xưởng ước lượng sau.
- `POST /customer-orders/{id}/review`: phải có kế hoạch sản xuất DRAFT; APPROVE duyệt các kế hoạch nháp cùng transaction và kiểm tổng lượng nguồn.
- `POST /production-plans/{id}/cancel`: planner hủy DRAFT bằng version; không xóa chứng từ đã duyệt.
- `POST /production-reports/{id}/submit`: cập nhật nhu cầu NVL của kế hoạch và thông báo planner; không cập nhật tồn.
- `POST /stock-requests` với purpose=MATERIAL_PURCHASE: production_report_id, workshop_id, requested_date, note, lines theo shortage_quantity. type=PROCUREMENT; không gọi ghi phiếu cho loại này.
- `POST /business-plans`: PURCHASE có thể nhận source_request_id để lấy nhu cầu/xưởng, chống tổng kế hoạch vượt yêu cầu.
- `POST /stocktakes` với campaign_type=QUALITY_CHECK: quality_kind, planned_date, start_at, end_at, location, assignee_ids thuộc QC_INSPECTOR, lot_ids thuộc đúng nguồn/loại. Tạo công việc QC; không có snapshot tồn.
- `POST /qc-inspections`: thêm campaign_id của lịch được phân công; ghi cả số lỗi, số đạt và issue. Director và chủ xưởng liên quan được đọc; nhân viên QC đọc kết quả theo lịch được giao.
- `POST /stock-requests` thông thường: thêm manager_id. Chỉ một nguồn mua/sản xuất/bán, thuộc xưởng được phép.
- `GET /stock-requests/{id}/allocations`: manager xem phân bổ có thể giao; staff chỉ thấy phần được giao. Có thể lọc thêm task_id.
- `POST /stock-requests/{id}/dispatch`: version, start_at, end_at, allocations:[{assignee_id, stock_request_line_id, lot_id, location_id, quality_bucket:AVAILABLE, quantity}]. Manager phụ trách; cần Idempotency-Key; kiểm tồn/QC và các lượng đang phân công.
- `POST /stock-documents`: thêm task_id khi chọn công việc; staff phải đúng người được giao, đúng lô/vị trí và không vượt lượng còn lại. QUARANTINE không được nhận theo luồng mới.
- `GET /tasks`: director xem công việc; manager xem công việc kho phụ trách; staff/QC/stocktaker chỉ xem việc được giao. Sửa/hủy/progress vẫn kiểm quyền riêng.
- `POST /warehouse-records`: manager nhận stock_request_id đã FULFILLED và note; tổng hợp stock_document_ids và lines từ phiếu đã ghi.
- `GET /warehouse-records`, `GET /warehouse-records/{id}`: manager/director/chủ xưởng liên quan xem hồ sơ tổng hợp.

Các endpoint cũ không mâu thuẫn vẫn theo `API.md`. Các endpoint lookup bổ sung chỉ trả dữ liệu theo vai trò/phạm vi. Lịch QC có PLANNED → IN_PROGRESS → COMPLETED → CLOSED; nhập đủ kết quả tự hoàn tất lịch. COUNT vẫn dùng vòng kiểm đếm và xử lý chênh lệch.

## Ràng buộc trọng yếu

1. Không duyệt đơn chưa có kế hoạch/xưởng; nếu tổng kế hoạch vượt đơn, rollback cả duyệt đơn lẫn kế hoạch.
2. Yêu cầu bổ sung NVL chỉ từ lượng thiếu trong báo cáo đã gửi; không biến yêu cầu mua thành nhập tồn.
3. Chỉ nhân viên QC được phân công được ghi kết quả theo lịch. NVL lỗi trả NCC; thành phẩm lỗi giữ thông tin/phương án chờ director.
4. Manager không giao quá tồn/QC hoặc quá lượng yêu cầu; cộng cả phần phân công chưa ghi sổ của các công việc khác.
5. Staff không đổi hàng/lô/vị trí được giao; ghi một phần chỉ tăng tiến độ tương ứng; đủ lượng mới hoàn thành công việc/yêu cầu.
6. Công việc kho không được chuyển COMPLETED thủ công khi chưa ghi đủ phiếu. Công việc IN_PROGRESS không được hủy.
7. Hồ sơ tổng hợp không phát sinh movement thứ hai; một yêu cầu có một hồ sơ.
8. Việc khóa kho chỉ áp dụng COUNT. QC và dữ liệu lô trước nhập không tạo tồn giả.
9. Duyệt ghi chú lỗi thành phẩm trước nhập chỉ chốt quyết định, không tự tạo phiếu giảm một lượng chưa nhập.
10. Giao một phần không hoàn tất đơn. Báo cáo lịch sử tính từ movement, xuất CSV giữ mốc hiển thị.

## Kiểm thử và giới hạn

Kiểm thử domain/HTTP bao phủ quyền, state/version/replay, rollback, giới hạn nguồn/QC, phân công nhiều người, trả NCC, ngoại lệ thành phẩm, kiểm kê và hồ sơ tổng hợp. Kiểm thử Edge xuyên suốt tạo/sửa đơn → kế hoạch → nhu cầu → mua → QC NVL → điều phối/nhập → sản xuất → QC thành phẩm → điều phối/xuất từng phần → hồ sơ → kiểm kê.

Đã chuẩn bị mysql2 pool/transaction và truy vấn đọc repository có tham số; chưa nối nghiệp vụ vào MySQL, chưa có migration/schema chốt, session store bền vững, locking đa tiến trình hay triển khai production. Xem README để chạy và biết giới hạn của bản mẫu.
