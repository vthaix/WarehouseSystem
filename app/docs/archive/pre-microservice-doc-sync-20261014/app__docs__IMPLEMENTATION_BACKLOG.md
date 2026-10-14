## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

# Việc code và CSDL sau khi chốt docs

Tiến độ code sau lượt docs-only được ghi riêng tại [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md). Nguồn đơn mua và form báo cáo MUA đã được triển khai/kiểm thử; bảng dưới vẫn là danh sách mục tiêu tổng thể, các phần còn lại chưa hoàn tất.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Không thực hiện các thay đổi dưới đây trong lượt này. Ưu tiên P0 bảo đảm đúng nguồn và đúng tồn trước mở luồng cho người dùng; mỗi mục phải chốt quyết định liên quan trước sửa migration/code.

| Ưu tiên | Phần việc | Code / CSDL ảnh hưởng | Thay đổi cần làm | Quyết định phụ thuộc | Kiểm thử nghiệm thu |
| --- | --- | --- | --- | --- | --- |
| P0 | Nguồn mua/bán và hạn mức | BusinessPlanService, PurchaseOrderService; FK/fields nguồn | BAN lấy báo cáo THANH_PHAM; DonMuaHang giữ cùng báo cáo kế hoạch MUA; bỏ fallback nguồn dự kiến cho nghiệp vụ mới; khóa nhu cầu và kiểm mua cộng dồn theo chính sách D-03/04. Xử lý kế hoạch cũ thiếu nguồn cần kế hoạch chuyển đổi, không tự gán. | D-03/04/14 | Hai giao dịch cạnh tranh, báo cáo sai loại, nguồn khác, hủy/mua bù, replay |
| P0 | Chi tiết kế hoạch và 10% | ProductionPlanService/ReportService; bảng NVL kế hoạch riêng | Hợp nhất vào ChiTietKeHoachSanXuat theo LoaiChiTiet. Ánh xạ nguồn cũ, ghi số gốc/dự phòng một lần; báo cáo/mua không nhân lại. | D-02/11/14 | 100→110→110, sửa/gửi nhiều lần, đối soát migration |
| P0 | Báo cáo chung | ProductionReportService, FinishedReportService và các bảng báo cáo | Hợp nhất BanBaoCaoSanXuat/chi tiết với LoaiBaoCao. SAN_XUAT đủ/thiếu đều lập; snapshot thực tế, version nguồn và truy vết dòng lô. | D-03/12/14 | Thiếu 0, hai báo cáo cùng nguồn, sửa báo cáo đã dùng |
| P0 | Lô nhiều mặt hàng và QC | CatalogWriteService, QualityService, WarehouseFlowService; tất cả FK lot_id | LoHang/ChiTietLo và subtype theo quyết định; chuyển QC/phiếu/tồn/nguồn sang ChiTietLo. Chỉ nhập phần đạt chưa nhập. | D-05/13/14 | Lô hai mặt hàng, QC một phần, nhập trùng, lỗi trước nhập không giảm tồn |
| P0 | Xuất NVL và chống cấp trùng | StockRequestService, WarehouseFlowService, allocations/balances | Nguồn SAN_XUAT thay kế hoạch dự kiến; đề nghị/giữ/thực xuất tách; khóa nguồn/tồn; giữ/giải phóng nguyên tử và hạn mức cả nhiều yêu cầu. | D-01/03/06/07/12 | Tồn 10 hai bên giữ 7; xuất một phần/hủy/đổi/retry/rollback |
| P1 | Hồ sơ tổng hợp | WarehouseRecordService, HoSoKho, ReportService | Thay tạo hồ sơ bằng truy vấn/DTO PhieuKho; giữ lịch sử dữ liệu cũ qua phương án chuyển đổi, không phát sinh entity hoặc movement riêng. | D-14 | Đọc tổng hợp/export không đổi tồn, scope theo xưởng |
| P1 | Kiểm kê và kết luận | stocktakes pending; PhieuKiemKe/ChiTietPhieuKiemKe/BienBanKiemKe | Triển khai COUNT/đếm/kết luận trên phiếu, nhiều kho và quyền QC/AC; bỏ entity biên bản riêng trong mục tiêu, đối soát dữ liệu cũ. | D-07/08/14 | Null khác 0, snapshot, chưa đếm xong không gửi, khóa/mở đúng phạm vi |
| P1 | Ngoại lệ và lịch sử | exceptions pending; DeXuatXuLyNgoaiLe cũ, lịch sử chưa có | Chuẩn hóa BanDeXuatXuLyNgoaiLe/KetQuaXuLyNgoaiLe 1–N, quyền giám đốc, phiên bản/quyết định bất biến và kết quả thực hiện tách. | D-08/09/13/14 | Duyệt hai lần/cạnh tranh, từ chối-gửi lại, lỗi chưa nhập, rollback áp dụng |
| P1 | Quyền và màn hình | policy/ModuleRoutes/navigation/EJS/public JS | UC-22 chủ xưởng; UC-28 QC/AC; UC-18 đủ actor Word. Cập nhật chọn báo cáo, nhiều dòng lô, giữ/khả dụng, lịch sử, trạng thái và thông báo. | D-06/12/14 | RBAC/scope bằng đổi ID, form và API cùng ràng buộc, 501 không báo thành công |
| P1 | Công việc và đơn sửa | tasks pending, OrderService, CongViec | Triển khai UC-25 và nhánh, hợp đồng class CongViec, sửa đơn và duyệt kế hoạch theo quyết định; không xem việc điều phối đã có là đủ UC-25. | D-10/11/15 | Quyền/sửa/hủy/lịch chồng/đơn phụ thuộc |
| P2 | Nghiệm thu bền vững | SQL isolated test DB, browser, migration/restore | Bổ sung kiểm thử end-to-end theo SRS, lỗi giữa transaction, rollback/concurrency; migration bản sao dữ liệu; ghi commit/môi trường/lệnh/kết quả rõ ràng. | Các quyết định ảnh hưởng phải chốt trước | Không dùng memory pass để công nhận SQL hoặc bộ 12 quy tắc hoàn thành |

## Trình tự chuyển đổi dữ liệu

[ĐỀ XUẤT] Sao lưu và kiểm restore trên DB cô lập → đo số lượng/nguồn/giá trị cũ → schema tương thích → chuyển dữ liệu có ánh xạ kiểm chứng → đối soát FK/tổng lô/phiếu/tồn/báo cáo → chuyển service/UI → kiểm đồng thời → đóng cấu trúc cũ theo kế hoạch. Bản ghi thiếu nguồn hoặc không rõ đã cộng 10% phải đưa danh sách cần xử lý thủ công, không suy đoán. Không sửa migration đã áp dụng; tạo migration mới sau khi được chốt.
# Cập nhật backlog hiện hành

Đã hoàn thiện điều kiện xuất TP sau hoàn tất sản xuất và đến ngày giao tại preview, lập/sửa YC, phân công và ghi phiếu; nghiệm thu MySQL đạt. Danh sách lịch sử phía dưới không phản ánh đầy đủ các phần đã hoàn tất; xem IMPLEMENTATION_PROGRESS.md. UC-23 nhập TP từng phần cùng một lô, liên kết các đợt đã nhập vào báo cáo tổng kết, xử lý QC đã dùng và xử lý hàng cách ly vẫn còn việc. Kiến trúc dữ liệu hiện là 6 schema/account trên cùng MySQL.

