# Đối chiếu domain — code — CSDL

Hợp nhất 14/10/2026 theo working tree hiện hành; các nhận định pending/501 ở bản khảo sát cũ đã lưu riêng.

| Quy tắc | Implementation / schema | Bằng chứng và giới hạn |
| --- | --- | --- |
| Đơn/tiếp nhận/duyệt cùng kế hoạch | business-service customer-orders/production | Acceptance SQL, không tạo phiếu tiếp nhận |
| Chi tiết KHSX chung | ChiTietKeHoachSanXuat + views, ProductionPlanService | 10% một lần, kiểm nguồn/giới hạn |
| Báo cáo chung | BanBaoCaoSanXuat/ChiTietBaoCaoSanXuat + views | TIEN_DO/SU_CO/NHU_CAU/THANH_PHAM; final xác nhận hoàn tất |
| Mua linh hoạt | DonMuaHang + PurchaseOrderService | PLAN/REPORT/MANUAL, hạn mức đồng thời |
| Lô nhiều dòng/nhập từng phần | LoHang/ChiTietLo + partial-receipt | Đầu lô theo KHSX, từng đợt QC, tổng kết không tạo trùng |
| Phiếu/giữ chỗ/tồn | WarehouseFlowService, PhanCongKho/TonKho/BienDongKho | Ghi thực tế một lần, không âm, kho kiểm kê chặn |
| Kiểm kê/kết luận | StocktakeService, DotKiemKe/PhieuKiemKe/chi tiết | Null khác 0; từng kho; không bảng biên bản mới |
| Ngoại lệ/bù/hàng trả | ExceptionService/quarantine, CustomerReturnService | Duyệt/tái kiểm/áp dụng riêng, phiếu gốc bất biến |
| Công việc | TaskService | Lịch/RBAC/CRUD theo trạng thái, việc kho cần ghi phiếu |
| Hồ sơ/báo cáo | WarehouseRecordService, ReportService, HoSoKho view | Đọc nguồn trực tiếp, chưa projection độc lập |

Kiểm tra tự động npm run check:sync đối chiếu structure/Compose/migration/snapshot/generated docs/UC/links. Nghiệm thu SQL/browser riêng; không lấy check tài liệu làm chứng nhận nghiệp vụ. Trạng thái: [MODULE_MATRIX.md](MODULE_MATRIX.md), [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).
