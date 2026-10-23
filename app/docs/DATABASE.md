# Thiết kế dữ liệu hiện tại

Migration 016 chỉ đổi tên hai xưởng demo đã biết sang Xưởng bánh quy Sweet Bakery và Xưởng bánh bông lan Sweet Bakery; tên đã tùy chỉnh không bị ghi đè. Sơ đồ kho đọc Kho/ViTriKho/TonKho/ChiTietLo và phần giữ chỗ, không thêm vị trí hay tồn giả; số lượng tính bằng số thập phân chính xác.

Migration 015 thêm `DotKiemKe.NguoiLapBienBanDuocChon` cho người được giám đốc chỉ định lập biên bản chung. Người thực tế ghi lưu riêng ở BienBanNguoiLap. Đợt cũ chưa có biên bản phải phân công rõ; không chọn ngẫu nhiên. Chi tiết [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md).

Migration 010: `BanBaoCaoSanXuat.KieuThanhPham` phân biệt PART với báo cáo FINAL lịch sử; mỗi báo cáo thành phẩm PART có các ChiTietLo riêng, cùng LoHang của KHSX. CongViec dùng MaDotKiemKe để gắn lịch kiểm tra và phạm vi phần trong LoLichKiemTra. Không thêm quan hệ phần lô vào báo cáo tiến độ, không đoán liên kết cho dữ liệu cũ.

Migration service 009 bổ sung `DotKiemKe.MaKeHoachMuaQC` và `MaKeHoachSanXuatQC`, FK sang Business; cho phép lập QC trước khi hàng có thật. Lịch liên kết ChiTietLo qua LoLichKiemTra khi có từng đợt hàng, không gộp theo mã lô tổng. Không thay dữ liệu tồn khi chỉ lập lịch.

Cập nhật 14/10/2026. Bảng đã tách vật lý theo owner vào sáu database/tài khoản MySQL. Thiết kế, quyền và migration chi tiết: [SERVICE_DATABASES.md](SERVICE_DATABASES.md). Ánh xạ thực tế: database/services/ownership.json; snapshots: database/services/schemas.

Tên bảng/cột vật lý tiếng Việt không dấu; API/JSON giữ identifier tiếng Anh qua database/adminer/identifiers.json và src/config/vietnamese-sql.js. Số bảng gồm dữ liệu kỹ thuật/lưu trữ, không chứng minh số entity hoặc mức hoàn thành UC.

## Các cấu trúc nghiệp vụ chính

Cập nhật 22/10/2026, migration service 008: `ChiTietDonMuaHang.MaNhaCungCap` tham chiếu NCC từng NVL. Đầu đơn giữ NCC chung khi tất cả dòng cùng NCC, NULL khi nhiều NCC. Kế hoạch MUA không cần NCC; `NgayDuKien` là ngày mong nhận NVL do planner chọn. Đơn mới chỉ PLAN/MANUAL; REPORT còn trong schema để giữ lịch sử. Chi tiết [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md).

- Business: DonHang/ChiTietDonHang; KeHoachSanXuat/ChiTietKeHoachSanXuat phân loại thành phẩm/NVL; KeHoachMuaBan/chi tiết phân loại MUA/BAN; DonMuaHang/chi tiết có nguồn PLAN/REPORT/MANUAL.
- BanBaoCaoSanXuat và ChiTietBaoCaoSanXuat dùng chung báo cáo SAN_XUAT/THANH_PHAM. UC-34 báo tiến độ/sự cố/nhu cầu khi chưa xong; UC-35 xác nhận hoàn tất. ChiTietLoBaoCaoSanXuat truy vết sản lượng/NVL theo lô.
- Warehouse: LoHang 1–N ChiTietLo; QC theo dòng lô; yêu cầu kho khác phiếu thực nhập/xuất; TonKho tách AVAILABLE/QUARANTINE; BienDongKho giữ lịch sử.
- Nhập thành phẩm từng phần: LoHang.MaKeHoachNhapThanhPham duy nhất theo kế hoạch; ChiTietLo.MaYeuCauNhapThanhPham theo đợt. Tổng kết tái sử dụng lô, không ghi nhập lần hai.
- PhieuKiemKe/ChiTietPhieuKiemKe lưu số đếm/kết luận; BanDeXuatXuLyNgoaiLe 1–N KetQuaXuLyNgoaiLe lưu quyết định; áp dụng riêng.
- ChiTietLoTraVe liên kết nguồn giao/QC/ngoại lệ; hàng khách trả nhận một lần vào cách ly, không sửa lịch sử giao.
- Hồ sơ/biên bản suy ra bằng view hoặc nội dung trên chứng từ, không tự tạo entity mới.

## Migration

Nguồn legacy 001–026 giữ nguyên lịch sử. Migration service hiện 001_split_existing, 002_qualified_views, 003_auto_increment, 004_partial_receipts, 005_quarantine_disposition, 006_stock_qc_correction, 007_category_images. Runtime kiểm checkpoint đủ trước khởi động.

Migration mới phải giữ dữ liệu/ID/password hash/chứng từ/tồn, có phục hồi khi DDL gián đoạn, cập nhật compatibility views và đối soát. Snapshot không thay thế migration; seed không thay thế lưu trữ lâu dài.

## Giới hạn

Vẫn có FK, JOIN, view, transaction và grants xuyên database trên cùng server. Không chuyển từng database sang server riêng trước khi thay bằng API/events/claims và nghiệm thu invariant.

Source KhoHang không đồng bộ sau cutover. Backup production phải lấy dữ liệu hiện tại của sáu schema và khả năng restore đồng bộ; backup trước cutover chỉ dùng cho mốc trước chuyển đổi.

C?p nh?t danh m?c b?nh, ??n v?/gi? NVL v? qu?n tr? t?i kho?n: [QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md](QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md).
