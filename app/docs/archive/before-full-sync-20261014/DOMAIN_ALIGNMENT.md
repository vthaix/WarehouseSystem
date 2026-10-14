# Đối chiếu Word và hiện trạng repository

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

| Yêu cầu mục tiêu | Bằng chứng code/schema hiện hành | Khoảng cách |
| --- | --- | --- |
| DonHang tiếp nhận | OrderService có receive/review | Chưa chạy nghiệm thu hiện tại; không cần phiếu tiếp nhận mới |
| ChiTietKeHoachSanXuat chung | ProductionPlanService ghi production_plan_outputs và production_plan_materials; migration 005 đổi hai tên khác nhau | NVL vẫn riêng; chưa có LoaiChiTiet chung/dấu vết dự phòng |
| BanBaoCaoSanXuat hai loại | ProductionReportService/FinishedReportService ghi hai nhóm bảng | Chưa hợp nhất và truy vết ChiTietLoBaoCaoSanXuat |
| MUA từ thiếu báo cáo | Migration 007 thêm MaBaoCaoSanXuat vào KeHoachMuaBan; BusinessPlanService bắt báo cáo cho kế hoạch mua mới, tính thiếu từ report lines | Kế hoạch cũ vẫn fallback kế hoạch dự kiến; chưa nghiệm thu tổng mua/cam kết/sửa nguồn |
| BAN từ báo cáo TP | BusinessPlanService nhánh SALE đọc customer_orders và trả production_report_id null | Chưa nguồn báo cáo THANH_PHAM; lời gọi C.fail ở validateSource nhánh bán cần kiểm tra thứ tự tham số, chưa chạy test |
| DonMuaHang cùng MaBaoCao | PurchaseOrderService tạo từ APPROVED và một đơn/kế hoạch; INSERT purchase_orders chưa có report_id | Chưa tham chiếu báo cáo trực tiếp và tái kiểm hạn mức toàn nguồn trên đơn |
| Lô nhiều mặt hàng | lots/LoHang vẫn có item_id; QC, balances, allocations/phiếu dùng lot_id | Chưa ChiTietLo; tên bảng đổi không đồng nghĩa domain đã đủ |
| Phần QC đạt nhập | QualityService và WarehouseFlowService có logic QC/ghi kho | Vẫn theo lô một mặt hàng; chưa nghiệm thu QC từng dòng/tái kiểm/chứng từ trả |
| Xuất từ báo cáo thực tế | StockRequestService và WarehouseFlowService có nguồn/dispatch/stock-post | Cần đổi nguồn cấp/giới hạn cộng dồn/giữ theo BR-08/09; khóa code có mặt chưa chứng minh mọi race được chặn |
| Hồ sơ đọc từ phiếu | WarehouseRecordService ghi warehouse_records, ánh xạ HoSoKho | Mục tiêu bỏ entity hồ sơ; giữ đọc tổng hợp PhieuKho |
| Kết luận trên PhieuKiemKe | stocktakes/index.js pending, stocktake_minutes/BienBanKiemKe vẫn trong schema | COUNT/đếm/kết luận chưa hoàn tất; QUALITY_CHECK không thay COUNT |
| Hai entity ngoại lệ/lịch sử | exceptions/index.js pending, DeXuatXuLyNgoaiLe cũ; không lịch sử quyết định riêng | Chưa chuẩn tên và KetQuaXuLyNgoaiLe 1–N |
| Công việc | Dispatch/QC campaign tạo task, tasks/index.js vẫn pending | Không đồng nghĩa UC-25 và các nhánh quản lý đã triển khai |

Các nhận định là khảo sát source, không phải kết quả chạy SQL. Migration 007 chứa backfill dữ liệu trong repo nhưng không được chạy trong lượt này. Các tuyên bố pass trong docs cũ không dùng để công nhận bản mới; việc kiểm thử mục tiêu ở SRS/BACKLOG.
