# SOFTWARE REQUIREMENTS SPECIFICATION

SRS – WAREHOUSE MANAGEMENT SYSTEM

Hệ thống quản lý kho hàng cho doanh nghiệp sản xuất

Phiên bản 1.1 – Cập nhật theo nghiệp vụ đã thống nhất ngày 23/09/2026

| Thông tin | Giá trị |
| --- | --- |
| Tên hệ thống | Warehouse Management System (WMS) |
| Tài liệu | Software Requirements Specification (SRS) |
| Phiên bản | 1.1 |
| Phạm vi | Quản lý kho, mua NVL, QC NVL, kế hoạch sản xuất, xuất/nhập, kiểm kê |
| Sản xuất thực tế | Ngoài hệ thống; hệ thống chỉ quản lý kế hoạch và nhu cầu NVL |
| Cơ sở | Tài liệu tuần 4, danh sách domain/use case và kịch bản nghiệp vụ đã cập nhật |

Ghi chú nguồn: Repo GitHub được người dùng cung cấp nhưng môi trường hiện tại không truy cập trực tiếp được nội dung repo; vì vậy bản SRS này được biên soạn từ tài liệu đã đính kèm trong cuộc hội thoại và các thay đổi nghiệp vụ mà người dùng vừa xác nhận. Những điểm bổ sung để khép kín workflow được đánh dấu rõ trong mục “Quy ước/ bổ sung thiết kế”.

## LỊCH SỬ PHIÊN BẢN

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 1.0 | Trước 23/09/2026 | Khung UC và domain ban đầu của hệ thống kho. |
| 1.1 | 23/09/2026 | Tách Bộ phận sản xuất khỏi Ban giám đốc; thêm UC lập kế hoạch sản xuất và quyết định mua NVL; Nhà cung cấp là entity riêng; Ban giám đốc lập đợt kiểm kê; cập nhật workflow QC và kiểm kê. |

## MỤC LỤC

1. Giới thiệu và mục tiêu

2. Phạm vi hệ thống

3. Actor và quyền nghiệp vụ

4. Quy trình nghiệp vụ tổng thể

5. Quy tắc trạng thái

6. Mô hình dữ liệu nghiệp vụ

7. Danh sách Use Case

8. Đặc tả Use Case chi tiết

9. Yêu cầu chức năng (Functional Requirements)

10. Business Rules và validation

11. Yêu cầu phi chức năng

12. Thông báo, audit và bảo mật

13. Phạm vi ngoài hệ thống

14. Ma trận truy vết

15. Tiêu chí nghiệm thu tổng quát

## 1. GIỚI THIỆU VÀ MỤC TIÊU

Mục tiêu của WMS là quản lý dữ liệu và quy trình kho của doanh nghiệp sản xuất, bao gồm đơn hàng thành phẩm, tính nhu cầu nguyên vật liệu (NVL), mua bổ sung NVL khi được Ban giám đốc cho phép, kiểm tra chất lượng NVL, nhập/xuất kho, tra cứu tồn kho và kiểm kê định kỳ. Phần sản xuất vật lý không được hiện thực chi tiết trong hệ thống; hệ thống chỉ quản lý kế hoạch sản xuất và phần nghiệp vụ kho liên quan.

SRS này là tài liệu tham chiếu chính cho thiết kế database, API/backend, giao diện và kiểm thử. Mỗi Use Case quy định actor, điều kiện, luồng xử lý, dữ liệu vào/ra và ràng buộc để giảm diễn giải khác nhau khi code.

## 2. PHẠM VI HỆ THỐNG

| Nhóm | Trong phạm vi | Ngoài phạm vi |
| --- | --- | --- |
| Dữ liệu nền | Kho, danh mục kho, dữ liệu danh mục, sản phẩm, lô, nhà cung cấp, khách hàng, công thức sản xuất | ERP kế toán tổng thể |
| Bán thành phẩm | Đặt đơn, tiếp nhận, phê duyệt, kế hoạch sản xuất, chuẩn bị giao | Thanh toán, vận chuyển bên ngoài |
| Sản xuất | Lập kế hoạch, tính nhu cầu NVL, đối chiếu tồn kho, tạo yêu cầu mua sau khi BGĐ cho phép | Điều độ máy móc, công đoạn sản xuất, nhân công, MES |
| Mua NVL | Kế hoạch mua, phê duyệt, chọn nhà cung cấp, tạo đơn mua | Thanh toán nhà cung cấp, trả hàng thực tế |
| QC | QC NVL trước nhập kho và quản lý kết quả | Quy trình phòng thí nghiệm chuyên sâu |
| Kho | Nhập, xuất, theo dõi phiếu, tra cứu tồn | Vận chuyển/logistics |
| Kiểm kê | Lập đợt, điều phối, phân công, thực hiện, xử lý chênh lệch, phê duyệt ngoại lệ, biên bản, báo cáo | Kiểm toán độc lập ngoài doanh nghiệp |

## 3. ACTOR VÀ QUYỀN NGHIỆP VỤ

| Actor | Trách nhiệm |
| --- | --- |
| Người dùng | Đăng nhập; mỗi tài khoản gắn với một vai trò. |
| Khách hàng | Đặt đơn hàng mua thành phẩm. |
| Bộ phận lập kế hoạch | Tiếp nhận đơn hàng; lập và quản lý kế hoạch mua/bán; tiếp nhận yêu cầu mua NVL. |
| Ban giám đốc | Phê duyệt đơn hàng; quyết định mua NVL từ kế hoạch sản xuất; phê duyệt kế hoạch mua/bán; lập đợt kiểm kê; phân công công việc; xem hồ sơ/báo cáo; phê duyệt ngoại lệ kiểm kê. |
| Bộ phận sản xuất | Tiếp nhận đơn hàng đã duyệt để lập kế hoạch sản xuất; tính nhu cầu NVL; đối chiếu tồn kho; gửi ước lượng/chênh lệch NVL cho BGĐ. |
| Bộ phận mua hàng | Xử lý kế hoạch mua đã duyệt; chọn nhà cung cấp; nhập giá/điều kiện giao; tạo đơn mua; xem đơn mua. |
| Chủ xưởng | Tạo yêu cầu nhập/xuất từ chứng từ có sẵn; quản lý yêu cầu của chính mình. |
| Bộ phận QC/AC | Kiểm tra chất lượng NVL trước nhập kho; thêm/sửa/xóa kết quả QC. |
| Nhân viên kho | Nhập kho và xuất kho. |
| Quản lý kho | Quản lý danh mục/dữ liệu danh mục; theo dõi phiếu nhập/xuất; xử lý chênh lệch kiểm kê; tra cứu. |
| Ban kiểm kê | Thực hiện kiểm kê; lập biên bản kiểm kê. |
| Điều phối kiểm kê | Điều phối lịch/nhân sự kiểm kê; có thể là thành viên được BGĐ giao nhiệm vụ. |
| Nhân viên nghiệp vụ | Tra cứu dữ liệu kho theo quyền được cấp. |
| Bộ phận kinh doanh/kho | Cập nhật đơn hàng khách hàng, chuẩn bị giao. |

## 4. QUY TRÌNH NGHIỆP VỤ TỔNG THỂ

Giai đoạn 0 – Dữ liệu nền: Quản lý kho tạo danh mục kho và dữ liệu chi tiết danh mục.

Giai đoạn 1 – Đặt hàng và lập kế hoạch sản xuất: Khách hàng đặt đơn → Bộ phận lập kế hoạch tiếp nhận → BGĐ phê duyệt → Bộ phận sản xuất lập kế hoạch sản xuất, tính ước lượng NVL và chênh lệch → BGĐ quyết định mua NVL hoặc không mua.

Giai đoạn 2 – Mua NVL: Nếu BGĐ cho phép mua: Bộ phận lập kế hoạch lập kế hoạch mua → rà soát → BGĐ duyệt → Bộ phận mua hàng chọn nhà cung cấp và tạo đơn mua → Chủ xưởng tạo yêu cầu nhập/xuất từ chứng từ mua → QC kiểm tra → Kho nhập phần đạt.

Giai đoạn 3 – Sản xuất ngoài hệ thống và xuất kho: Khi NVL đủ: sản xuất thực tế diễn ra ngoài hệ thống → thành phẩm phải ở trạng thái đủ điều kiện QC/xuất → Bộ phận kinh doanh/kho chuẩn bị giao → Nhân viên kho xuất kho.

Giai đoạn 4 – Tra cứu giữa kỳ: BGĐ xem tồn kho; nhân viên nghiệp vụ tra cứu dữ liệu theo quyền.

Giai đoạn 5 – Kiểm kê cuối kỳ: BGĐ lập đợt kiểm kê → điều phối → BGĐ phân công → Ban kiểm kê thực hiện → Quản lý kho xử lý chênh lệch → BGĐ phê duyệt ngoại lệ nếu cần → lập biên bản → BGĐ xem báo cáo.

Chuỗi chính khi thiếu NVL: Đơn hàng đã duyệt → Kế hoạch sản xuất → Nhu cầu NVL ước lượng → Đối chiếu tồn kho → BGĐ quyết định mua → Yêu cầu mua NVL → Kế hoạch mua → Phê duyệt kế hoạch mua → Đơn mua → QC → Nhập kho → kiểm tra lại tồn kho → sẵn sàng sản xuất.

Chuỗi chính khi đủ NVL: Đơn hàng đã duyệt → Kế hoạch sản xuất → Đối chiếu tồn kho cho thấy đủ → Đủ NVL – sẵn sàng sản xuất → sản xuất ngoài hệ thống → thành phẩm đủ điều kiện xuất → xuất kho.

## 5. QUY TẮC TRẠNG THÁI

| Đối tượng | Trạng thái đề nghị | Ý nghĩa |
| --- | --- | --- |
| Đơn hàng bán | CHUA_TIEP_NHAN | Khách hàng đã đặt; chờ bộ phận lập kế hoạch tiếp nhận. |
| Đơn hàng bán | DA_TIEP_NHAN | Bộ phận lập kế hoạch đã tiếp nhận; chờ BGĐ phê duyệt. |
| Đơn hàng bán | DA_DUYET | BGĐ đã phê duyệt; có thể lập kế hoạch sản xuất. |
| Đơn hàng bán – sản xuất | CHUA_LAP_KE_HOACH | Đã duyệt nhưng chưa lập kế hoạch sản xuất. |
| Đơn hàng bán – sản xuất | CHO_QUYET_DINH_MUA | Đã tính nhu cầu NVL và còn thiếu; chờ BGĐ quyết định. |
| Đơn hàng bán – sản xuất | CHO_BO_SUNG_NVL | BGĐ cho phép mua; đang chờ NVL về. |
| Đơn hàng bán – sản xuất | DU_NVL_SAN_SANG_SAN_XUAT | Tồn kho đáp ứng nhu cầu. |
| Đơn hàng bán | CHUAN_BI_GIAO | Đủ điều kiện xuất và đang chuẩn bị giao. |
| Đơn hàng bán | HOAN_THANH | Đã xuất đủ theo đơn. |
| Kế hoạch mua/bán | CHO_DUYET | Chờ BGĐ phê duyệt. |
| Kế hoạch mua/bán | DA_DUYET | Đã được BGĐ duyệt. |
| Kế hoạch mua/bán | TU_CHOI | BGĐ từ chối. |
| Yêu cầu mua NVL | CHO_XU_LY | Mới tạo/gửi đến bộ phận lập kế hoạch. |
| Yêu cầu mua NVL | DA_LAP_KE_HOACH | Đã được đưa vào kế hoạch mua. |
| Yêu cầu mua NVL | DA_MUA | Đã phát sinh đơn mua. |
| Yêu cầu nhập/xuất | MOI | Mới tạo. |
| Yêu cầu nhập/xuất | DA_TIEP_NHAN | Đã được kho tiếp nhận xử lý. |
| Phiếu nhập/xuất | CHO_XU_LY | Đã tạo nhưng chưa hoàn tất. |
| Phiếu nhập/xuất | HOAN_TAT | Đã ghi nhận giao dịch kho. |
| Đợt kiểm kê | MOI | Được BGĐ lập. |
| Đợt kiểm kê | DA_DIEU_PHOI | Đã điều phối. |
| Đợt kiểm kê | DANG_KIEM_KE | Ban kiểm kê đang thực hiện. |
| Đợt kiểm kê | DA_HOAN_THANH | Đã kiểm kê xong. |
| Đợt kiểm kê | DA_XU_LY_CHENH_LECH | Đã xử lý các chênh lệch cần xử lý. |
| Đề xuất ngoại lệ | CHO_DUYET | Đề xuất chênh lệch kiểm kê chờ BGĐ. |
| Đề xuất ngoại lệ | DA_DUYET | BGĐ chấp thuận phương án. |
| Đề xuất ngoại lệ | TU_CHOI | BGĐ từ chối phương án. |

## 6. MÔ HÌNH DỮ LIỆU NGHIỆP VỤ

Thiết kế dưới đây giữ tên và ý nghĩa của domain hiện có, đồng thời bổ sung các entity cần thiết để workflow mới có thể triển khai đầy đủ.

| Entity | Thuộc tính chính | Mục đích |
| --- | --- | --- |
| NguoiDung | maNguoiDung, hoTen, tenDangNhap, matKhau, trangThai, maVaiTro | Tài khoản hệ thống. |
| VaiTro | maVaiTro, tenVaiTro | Vai trò/nhóm quyền. |
| KhachHang | maKhachHang, tenKhachHang, diaChi, lienHe | Chủ thể đặt đơn bán. |
| NhaCungCap | maNhaCungCap, tenNhaCungCap, diaChi, lienHe, maSoThue, trangThai | BẢNG RIÊNG; được tham chiếu bởi đơn mua. |
| ChuXuong | maChuXuong, tenChuXuong, diaChi, lienHe | Chủ xưởng. |
| SanPham | maSanPham, tenSanPham, donViTinh, loaiSanPham | Entity cha; loaiSanPham=NVL/TP. |
| NguyenVatLieu | maSanPham, ... | Kế thừa SanPham. |
| ThanhPham | maSanPham, ... | Kế thừa SanPham. |
| LoHang | maLo, maSanPham, maKho, ngaySanXuat, hanSuDung, soLuongHienTai, trangThaiQC | Entity cha của lô NVL/TP. |
| Kho | maKho, tenKho, diaChi, loaiKho | Kho vật lý. |
| DanhMucKho | maDanhMuc, tenDanhMuc, moTa, ngayTao, ngayCapNhat | Nhóm dữ liệu master. |
| DuLieuDanhMuc | maDuLieu, maDanhMuc, tenThuocTinh, giaTri, trangThai | Dữ liệu chi tiết danh mục. |
| DonHang | maDonHang, loaiDonHang, maKhachHang, maNhaCungCap, ngayDat, trangThai, trangThaiSanXuat, ngayTiepNhanSanXuat, nguoiTiepNhanSanXuat | Đơn bán/mua; khóa ngoại khách hàng hoặc nhà cung cấp tùy loại. |
| ChiTietDonHang | maDonHang, maSanPham, soLuong, donGia | Chi tiết đơn. |
| KeHoachSanXuat | maKeHoachSanXuat, maDonHang, ngayLap, trangThai, nguoiLap, ngayQuyetDinh, nguoiQuyetDinh, quyetDinhMuaNVL | Kế hoạch sản xuất cho đúng 1 đơn hàng. |
| ChiTietKeHoachSanXuat | maKeHoachSanXuat, maThanhPham, soLuongCanSanXuat | Số lượng TP cần sản xuất. |
| ChiTietNhuCauNVL | maKeHoachSanXuat, maNguyenVatLieu, soLuongNhuCauUocLuong, soLuongTonKho, soLuongThieu, trangThai | Kết quả tính toán NVL. |
| KeHoachMuaBan | maKeHoach, loaiKeHoach, trangThai, nguoiPheDuyet, ngayPheDuyet, maYeuCauMuaNVL | Kế hoạch mua/bán. |
| ChiTietKeHoach | maKeHoach, maSanPham, soLuongDuKien | Chi tiết kế hoạch. |
| YeuCauMuaNVL | maYeuCau, maKeHoachSanXuat, ngayYeuCau, trangThai, nguoiTao | Chỉ tạo sau quyết định cho phép mua của BGĐ. |
| ChiTietYeuCauMuaNVL | maYeuCau, maNguyenVatLieu, soLuongThieu | Chi tiết NVL thiếu. |
| DonHangMua / dữ liệu đơn mua | maDonHang, maNhaCungCap, maKeHoach, gia/điều kiện giao, trangThai | Có thể triển khai bằng DonHang loai=Mua nếu codebase chọn mô hình đơn dùng chung. |
| YeuCauNhapXuat | maYeuCau, maChuXuong, loaiYeuCau, trangThai | Yêu cầu do Chủ xưởng tạo. |
| PhieuNhapKho | maPhieu, maKho, ngayNhap, trangThai | Phiếu nhập. |
| ChiTietPhieuNhap | maPhieu, maLo, soLuong | Chi tiết nhập. |
| PhieuXuatKho | maPhieu, maKho, ngayXuat, trangThai | Phiếu xuất. |
| ChiTietPhieuXuat | maPhieu, maLo, soLuong | Chi tiết xuất. |
| KetQuaKiemTraQC | maKetQua, maLo, ngayKiemTra, soLuongKiemTra, soLuongDat, soLuongKhongDat, nguoiKiemTra | Kết quả QC; hàng không đạt chỉ ghi nhận và báo cáo BGĐ. |
| CongThucSanXuat | maCongThuc, maThanhPham | Công thức của TP. |
| ChiTietCongThuc | maCongThuc, maNguyenVatLieu, dinhMucChoMotDonViThanhPham | Định mức NVL/1 TP. |
| DotKiemKe | maDot, ngayBatDau, ngayKetThuc, kho/PhamViKho, trangThai, nguoiLap | Theo xác nhận mới: BGĐ lập đợt. |
| BanKiemKe | maBan, maDotKiemKe | Ban kiểm kê của một đợt. |
| ThanhVienBanKiemKe | maBan, maNguoiDung, vaiTroTrongBan | Thành viên ban. |
| ChiTietKiemKe | maDotKiemKe, maLo, soLuongSoSach, soLuongThucTe | Kết quả đếm. |
| ChenhLechKiemKe | maChiTietKiemKe, soLuongChenhLech, nguyenNhan | Chênh lệch sau kiểm kê. |
| DeXuatXuLyNgoaiLe | maChenhLech, noiDungDeXuat, trangThai, nguoiPheDuyet | CHỈ dùng cho chênh lệch kiểm kê. |
| BienBanKiemKe | maDot, noiDungTongHop, ngayLap, nguoiLap | Biên bản. |
| CongViec | maCongViec, tenCongViec, trangThai | Công việc do BGĐ quản lý. |
| PhanCongCongViec | maCongViec, nguoiDuocPhanCong, nguoiPhanCong, ngayPhanCong | Phân công. |
| ThongBao | maThongBao, nguoiNhan, loai, noiDung, daDoc, ngayTao | Bổ sung để quản lý thông báo workflow. |
| AuditLog | maLog, nguoiDung, hanhDong, doiTuong, idDoiTuong, thoiGian, duLieuCu, duLieuMoi | Khuyến nghị bổ sung để truy vết thay đổi. |

### 6.1 Quan hệ chính

| Quan hệ | Quy tắc |
| --- | --- |
| VaiTro 1 – NguoiDung 0..* | Một vai trò có nhiều tài khoản; mỗi tài khoản thuộc một vai trò. |
| KhachHang 1 – DonHang 0..* | Một khách hàng có nhiều đơn bán. |
| NhaCungCap 1 – DonHang(Mua) 0..* | Nhà cung cấp được lưu thành bảng riêng và được tham chiếu bởi đơn mua. |
| DonHang 1 – ChiTietDonHang 1..* | Mỗi đơn có ít nhất một dòng chi tiết. |
| DonHang 1 – KeHoachSanXuat 0..1 | Một đơn hàng bán đã duyệt có tối đa một kế hoạch sản xuất đang hiệu lực. |
| KeHoachSanXuat 1 – ChiTietNhuCauNVL 1..* | Một kế hoạch có một hoặc nhiều NVL ước lượng. |
| KeHoachSanXuat 0..1 – YeuCauMuaNVL 0..1 | Chỉ tạo yêu cầu mua khi BGĐ cho phép mua. |
| CongThucSanXuat 1 – ChiTietCongThuc 1..* | Một công thức gồm một hoặc nhiều NVL. |
| Kho 1 – LoHang 0..* | Một kho chứa nhiều lô. |
| LoHang 1 – KetQuaKiemTraQC 0..* | Một lô có thể có nhiều lần QC. |
| DotKiemKe 1 – ChiTietKiemKe 1..* | Một đợt có nhiều dòng kiểm kê. |
| ChiTietKiemKe 1 – ChenhLechKiemKe 0..1 | Chỉ tạo khi số lượng sổ sách khác thực tế. |
| ChenhLechKiemKe 1 – DeXuatXuLyNgoaiLe 0..* | Có thể có một hoặc nhiều đề xuất, nhưng UC-17 chỉ dành cho chênh lệch kiểm kê. |

## 7. DANH SÁCH USE CASE

| UC | Tên | Actor chính |
| --- | --- | --- |
| UC-01 | Đăng nhập | Người dùng |
| UC-02 | Đặt đơn hàng | Khách hàng |
| UC-03 | Quản lý đơn hàng khách hàng | Bộ phận kinh doanh/kho |
| UC-04 | Lập kế hoạch mua/bán | Bộ phận lập kế hoạch |
| UC-05 | Quản lý kế hoạch | Bộ phận lập kế hoạch |
| UC-06 | Quản lý danh mục kho | Quản lý kho |
| UC-07 | Quản lý dữ liệu danh mục kho | Quản lý kho |
| UC-08 | Theo dõi phiếu nhập kho | Quản lý kho |
| UC-09 | Theo dõi phiếu xuất kho | Quản lý kho |
| UC-10 | Nhập kho | Nhân viên kho |
| UC-11 | Xuất kho | Nhân viên kho |
| UC-12 | Quản lý kết quả kiểm tra QC/AC | Bộ phận QC/AC |
| UC-13 | Lập đợt kiểm kê | Ban giám đốc |
| UC-14 | Xem đơn hàng đã đặt | Bộ phận mua hàng |
| UC-15 | Thực hiện kiểm kê | Ban kiểm kê |
| UC-16 | Xử lý chênh lệch kiểm kê | Quản lý kho |
| UC-17 | Phê duyệt đề xuất xử lý ngoại lệ | Ban giám đốc |
| UC-18 | Xem danh sách hàng tồn kho | Ban giám đốc |
| UC-19 | Xem hồ sơ xuất kho | Ban giám đốc |
| UC-20 | Xem hồ sơ nhập kho | Ban giám đốc |
| UC-21 | Xem báo cáo kiểm kê | Ban giám đốc |
| UC-22 | Tra cứu dữ liệu | Nhân viên nghiệp vụ/Quản lý kho |
| UC-23 | Yêu cầu nhập xuất | Chủ xưởng |
| UC-24 | Quản lý yêu cầu của chủ xưởng | Chủ xưởng |
| UC-25 | Quản lý công việc | Ban giám đốc |
| UC-26 | Điều phối kiểm kê | Điều phối kiểm kê |
| UC-27 | Mua hàng | Bộ phận mua hàng |
| UC-28 | Lập biên bản kiểm kê | Ban kiểm kê |
| UC-29 | Tiếp nhận đơn hàng | Bộ phận lập kế hoạch |
| UC-30 | Kiểm tra chất lượng NVL trước khi nhập kho | Bộ phận QC/AC |
| UC-31 | Phê duyệt đơn hàng | Ban giám đốc |
| UC-32 | Phê duyệt kế hoạch mua/bán | Ban giám đốc |
| UC-33 | Tiếp nhận đơn hàng để sản xuất / đối chiếu NVL | Bộ phận sản xuất |
| UC-34 | Lập kế hoạch sản xuất | Bộ phận sản xuất |
| UC-35 | Quyết định mua NVL từ kế hoạch sản xuất | Ban giám đốc |
| UC-36* | Kiểm tra chất lượng thành phẩm (bổ sung để khép kín điều kiện xuất) | Bộ phận QC/AC |

* UC-36 là bổ sung thiết kế để đáp ứng điều kiện “thành phẩm đã QC đạt” trước khi xuất. Nếu hệ thống thực tế nhận trạng thái QC thành phẩm từ một hệ thống khác, UC-36 có thể loại khỏi phạm vi triển khai và thay bằng cơ chế đồng bộ/import trạng thái.

## 8. ĐẶC TẢ USE CASE CHI TIẾT

### UC-01 – Đăng nhập

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Người dùng |
| Tiền điều kiện | Tài khoản tồn tại và đang hoạt động. |
| Hậu điều kiện | Phiên đăng nhập hợp lệ. |

Basic Flow

1. Người dùng mở chức năng đăng nhập.

2. Hệ thống hiển thị form tên đăng nhập và mật khẩu.

3. Người dùng nhập thông tin và xác nhận.

4. Hệ thống xác thực tài khoản.

5. Hệ thống tạo phiên đăng nhập và nạp quyền theo vai trò.

Alternative / Exception Flow

- 4a. Sai thông tin → thông báo lỗi; không tạo phiên.

- 4b. Tài khoản bị khóa/ngưng hoạt động → từ chối đăng nhập.

### UC-02 – Đặt đơn hàng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Khách hàng |
| Tiền điều kiện | Khách hàng được phép đặt hàng. |
| Hậu điều kiện | Đơn hàng mới ở trạng thái CHUA_TIEP_NHAN. |

Basic Flow

1. Khách hàng chọn đặt đơn.

2. Hệ thống hiển thị form đơn hàng.

3. Khách hàng chọn thành phẩm, số lượng và thông tin giao nhận.

4. Hệ thống kiểm tra dữ liệu.

5. Hệ thống tạo đơn và mã đơn.

6. Hệ thống thông báo đặt thành công.

Alternative / Exception Flow

- 3a. Thành phẩm không tồn tại/không kinh doanh → không cho thêm.

- 4a. Số lượng ≤ 0 → báo lỗi.

### UC-03 – Quản lý đơn hàng khách hàng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận kinh doanh/kho |
| Tiền điều kiện | Đã đăng nhập và có quyền. |
| Hậu điều kiện | Thông tin đơn hàng được cập nhật đúng trạng thái. |

Basic Flow

1. Mở danh sách đơn hàng.

2. Tìm/chọn đơn.

3. Xem chi tiết.

4. Cập nhật trường được phép theo trạng thái.

5. Hệ thống kiểm tra và lưu.

Alternative / Exception Flow

- 4a. Đơn đã hoàn thành → không cho sửa các trường ảnh hưởng lịch sử.

- 4b. Không tồn tại đơn → báo lỗi.

### UC-04 – Lập kế hoạch mua/bán

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận lập kế hoạch |
| Tiền điều kiện | Có nhu cầu mua/bán tự phát hiện hoặc có YeuCauMuaNVL hợp lệ. |
| Hậu điều kiện | Kế hoạch ở CHO_DUYET. |

Basic Flow

1. Chọn lập kế hoạch.

2. Chọn nguồn nhu cầu.

3. Hệ thống hiển thị các dòng nhu cầu.

4. Người dùng nhập/chỉnh số lượng dự kiến.

5. Xác nhận.

6. Hệ thống lưu kế hoạch và gửi chờ BGĐ.

Alternative / Exception Flow

- 2a. Không có nhu cầu → thông báo.

- 4a. Số lượng không hợp lệ → không lưu.

### UC-05 – Quản lý kế hoạch

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận lập kế hoạch |
| Tiền điều kiện | Kế hoạch tồn tại. |
| Hậu điều kiện | Kế hoạch được xem/sửa/xóa theo trạng thái. |

Basic Flow

1. Mở danh sách kế hoạch.

2. Xem chi tiết.

3. Có thể chọn Sửa hoặc Xóa nếu kế hoạch chưa được duyệt.

4. Hệ thống kiểm tra ràng buộc.

5. Lưu thay đổi hoặc xóa.

Alternative / Exception Flow

- 3a. Kế hoạch đã DA_DUYET → không cho sửa/xóa.

- 3b. Hủy thao tác → giữ nguyên.

### UC-06 – Quản lý danh mục kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Quản lý kho |
| Tiền điều kiện | Đã đăng nhập và có quyền quản lý master data. |
| Hậu điều kiện | Danh mục được thêm/sửa/xóa hợp lệ. |

Basic Flow

1. Mở danh mục kho.

2. Hệ thống hiển thị danh sách.

3. Chọn danh mục để xem chi tiết.

4. Chọn Thêm/Sửa/Xóa theo quyền.

5. Hệ thống thực hiện UC-06.1/06.2/06.3 tương ứng.

Alternative / Exception Flow

- 3a. Không có danh mục → thông báo.

### UC-07 – Quản lý dữ liệu danh mục kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Quản lý kho |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Dữ liệu master được cập nhật. |

Basic Flow

1. Chọn danh mục.

2. Xem dữ liệu.

3. Tìm kiếm khi cần.

4. Thêm/Sửa/Xóa dữ liệu.

5. Hệ thống kiểm tra trùng, rỗng, kiểu dữ liệu và ràng buộc sử dụng.

6. Lưu kết quả.

Alternative / Exception Flow

- 4a. Dữ liệu đang được sử dụng → không cho xóa.

- 4b. Dữ liệu trùng → báo lỗi.

### UC-08 – Theo dõi phiếu nhập kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Quản lý kho |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Danh sách/chi tiết phiếu nhập được hiển thị. |

Basic Flow

1. Mở theo dõi phiếu nhập.

2. Xem danh sách.

3. Tìm theo mã hoặc bộ lọc.

4. Chọn phiếu.

5. Hệ thống hiển thị chi tiết.

Alternative / Exception Flow

- 2a. Không có phiếu → thông báo.

### UC-09 – Theo dõi phiếu xuất kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Quản lý kho |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Danh sách/chi tiết phiếu xuất được hiển thị. |

Basic Flow

1. Mở theo dõi phiếu xuất.

2. Xem danh sách.

3. Tìm kiếm/lọc.

4. Xem chi tiết.

Alternative / Exception Flow

- 2a. Không có phiếu → thông báo.

### UC-10 – Nhập kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Nhân viên kho |
| Tiền điều kiện | Có chứng từ nhập hợp lệ và phần NVL đã QC đạt. |
| Hậu điều kiện | Phiếu nhập hoàn tất; tồn kho tăng đúng số lượng đạt. |

Basic Flow

1. Chọn Nhập kho.

2. Hệ thống hiển thị chứng từ/lô đủ điều kiện nhập.

3. Chọn kho và lô NVL.

4. Nhập số lượng thực nhập.

5. Hệ thống kiểm tra số lượng không vượt phần đã QC đạt/chưa nhập.

6. Xác nhận.

7. Hệ thống tạo phiếu nhập và cập nhật tồn kho.

Alternative / Exception Flow

- 3a. Lô chưa QC → không cho nhập.

- 5a. Số lượng vượt số lượng được phép → báo lỗi.

### UC-11 – Xuất kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Nhân viên kho |
| Tiền điều kiện | Đơn bán đã duyệt; kế hoạch xuất liên quan đã duyệt nếu áp dụng; thành phẩm đủ điều kiện QC; tồn kho đủ. |
| Hậu điều kiện | Phiếu xuất hoàn tất; tồn kho giảm. |

Basic Flow

1. Chọn Xuất kho.

2. Chọn đơn hàng/chứng từ đủ điều kiện.

3. Hệ thống đề xuất các lô thành phẩm có thể xuất.

4. Người dùng chọn lô và số lượng.

5. Hệ thống kiểm tra tồn kho và điều kiện QC.

6. Xác nhận.

7. Hệ thống tạo phiếu xuất và trừ tồn.

8. Hệ thống cập nhật trạng thái đơn hàng khi xuất đủ.

Alternative / Exception Flow

- 5a. Không đủ tồn → không cho xuất.

- 5b. Thành phẩm chưa đạt điều kiện QC → không cho xuất.

### UC-12 – Quản lý kết quả kiểm tra QC/AC

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận QC/AC |
| Tiền điều kiện | Đã có kết quả QC được ghi nhận hoặc cần bổ sung/chỉnh sửa. |
| Hậu điều kiện | Bản ghi QC được cập nhật hợp lệ. |

Basic Flow

1. Mở quản lý kết quả QC.

2. Xem danh sách.

3. Chọn Thêm/Sửa/Xóa.

4. Nhập/điều chỉnh số lượng kiểm tra, đạt, không đạt.

5. Hệ thống kiểm tra tổng đạt + không đạt = kiểm tra.

6. Lưu và ghi audit.

Alternative / Exception Flow

- 4a. Dữ liệu âm/không phải số → báo lỗi.

- 4b. Xóa bản ghi QC đã làm phát sinh nhập kho → từ chối hoặc yêu cầu quyền quản trị theo policy.

### UC-13 – Lập đợt kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đã đăng nhập và có quyền lập đợt kiểm kê. |
| Hậu điều kiện | Đợt kiểm kê được tạo và gửi sang khâu điều phối. |

Basic Flow

1. BGĐ chọn Lập đợt kiểm kê.

2. Hệ thống hiển thị form.

3. BGĐ nhập khoảng thời gian/phạm vi kho/loại hàng/ngày kiểm.

4. Hệ thống kiểm tra phạm vi và ngày hợp lệ.

5. BGĐ xác nhận.

6. Hệ thống tạo đợt và thông báo cho điều phối.

Alternative / Exception Flow

- 3a. Phạm vi trùng đợt đang diễn ra → cảnh báo và không cho tạo nếu xung đột.

- 4a. Ngày kết thúc < ngày bắt đầu → báo lỗi.

### UC-14 – Xem đơn hàng đã đặt

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận mua hàng |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Danh sách đơn mua/đơn cần xử lý hiển thị. |

Basic Flow

1. Mở chức năng.

2. Hệ thống hiển thị đơn mua đã tạo.

3. Lọc/tìm.

4. Xem chi tiết đơn.

Alternative / Exception Flow

- 2a. Không có đơn → thông báo.

### UC-15 – Thực hiện kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban kiểm kê |
| Tiền điều kiện | Đợt kiểm kê đã được điều phối và phân công. |
| Hậu điều kiện | Chi tiết kiểm kê ghi nhận số lượng thực tế. |

Basic Flow

1. Mở đợt được phân công.

2. Hệ thống hiển thị danh sách lô và số lượng sổ sách tại thời điểm chốt.

3. Ban kiểm kê nhập số lượng thực tế.

4. Hệ thống tính chênh lệch.

5. Xác nhận kết quả.

6. Hệ thống cập nhật trạng thái đợt.

Alternative / Exception Flow

- 3a. Số lượng âm → báo lỗi.

- 2a. Lô không còn tồn tại → đánh dấu ngoại lệ dữ liệu.

### UC-16 – Xử lý chênh lệch kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Quản lý kho |
| Tiền điều kiện | Đợt kiểm kê đã hoàn thành hoặc có dữ liệu chênh lệch sẵn sàng xử lý. |
| Hậu điều kiện | Chênh lệch có nguyên nhân và phương án xử lý; tồn kho được điều chỉnh theo policy. |

Basic Flow

1. Mở danh sách chênh lệch.

2. Chọn một chênh lệch.

3. Xem số sổ sách, thực tế, mức chênh.

4. Nhập nguyên nhân và phương án xử lý.

5. Nếu không cần phê duyệt: xác nhận và cập nhật tồn kho.

6. Nếu cần BGĐ: tạo đề xuất ngoại lệ CHO_DUYET.

Alternative / Exception Flow

- 2a. Không có chênh lệch → thông báo.

- 4a. Thiếu nguyên nhân/phương án → không lưu.

### UC-17 – Phê duyệt đề xuất xử lý ngoại lệ

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Có đề xuất ngoại lệ từ chênh lệch kiểm kê ở CHO_DUYET. |
| Hậu điều kiện | Đề xuất DA_DUYET hoặc TU_CHOI. |

Basic Flow

1. BGĐ mở danh sách đề xuất.

2. Xem chênh lệch và phương án.

3. Chọn phê duyệt hoặc từ chối.

4. Nhập ghi chú nếu cần.

5. Hệ thống lưu quyết định và thông báo Quản lý kho.

Alternative / Exception Flow

- 2a. Đề xuất không còn hiệu lực → từ chối thao tác.

### UC-18 – Xem danh sách hàng tồn kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Báo cáo tồn kho theo kho/lô/sản phẩm. |

Basic Flow

1. Mở tồn kho.

2. Hệ thống hiển thị số lượng hiện tại.

3. Lọc theo kho, loại hàng, sản phẩm, lô.

4. Xem chi tiết tồn.

### UC-19 – Xem hồ sơ xuất kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Xem được phiếu xuất và chi tiết. |

Basic Flow

1. Mở hồ sơ xuất.

2. Lọc/tìm.

3. Xem phiếu và các dòng lô.

### UC-20 – Xem hồ sơ nhập kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Xem được phiếu nhập và chi tiết. |

Basic Flow

1. Mở hồ sơ nhập.

2. Lọc/tìm.

3. Xem phiếu, lô, số lượng và nguồn chứng từ.

### UC-21 – Xem báo cáo kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đợt kiểm kê có dữ liệu. |
| Hậu điều kiện | Báo cáo chênh lệch và trạng thái xử lý. |

Basic Flow

1. Chọn đợt kiểm kê.

2. Hệ thống tổng hợp sổ sách/thực tế/chênh lệch.

3. Hiển thị nguyên nhân, phương án, quyết định ngoại lệ.

4. Có thể xem/ xuất báo cáo.

### UC-22 – Tra cứu dữ liệu

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Nhân viên nghiệp vụ/Quản lý kho |
| Tiền điều kiện | Đã đăng nhập và có quyền dữ liệu tương ứng. |
| Hậu điều kiện | Kết quả tra cứu theo bộ lọc. |

Basic Flow

1. Nhập từ khóa/bộ lọc.

2. Chọn loại dữ liệu (NVL, TP, tồn kho, lô, nhà cung cấp, chứng từ...).

3. Hệ thống truy vấn dữ liệu.

4. Hiển thị kết quả và chi tiết khi chọn.

Alternative / Exception Flow

- 3a. Không có kết quả → thông báo.

### UC-23 – Yêu cầu nhập xuất

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Chủ xưởng |
| Tiền điều kiện | Chủ xưởng đã đăng nhập; có chứng từ gốc hợp lệ. |
| Hậu điều kiện | Yêu cầu nhập/xuất được tạo. |

Basic Flow

1. Chọn Yêu cầu nhập/xuất.

2. Chọn loại nhập hoặc xuất.

3. Chọn chứng từ căn cứ.

4. Nhập kho/lô/số lượng cần xử lý.

5. Hệ thống kiểm tra và tạo yêu cầu.

Alternative / Exception Flow

- 4a. Chứng từ gốc không hợp lệ → không tạo.

### UC-24 – Quản lý yêu cầu của chủ xưởng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Chủ xưởng |
| Tiền điều kiện | Có yêu cầu do chính mình tạo. |
| Hậu điều kiện | Yêu cầu được xem/sửa/xóa theo trạng thái. |

Basic Flow

1. Xem danh sách yêu cầu của mình.

2. Chọn yêu cầu.

3. Sửa hoặc xóa nếu chưa được tiếp nhận xử lý.

4. Hệ thống lưu thay đổi.

Alternative / Exception Flow

- 3a. Yêu cầu đã được kho tiếp nhận → không cho sửa/xóa.

### UC-25 – Quản lý công việc

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Công việc được tạo/cập nhật/xóa. |

Basic Flow

1. BGĐ mở quản lý công việc.

2. Tạo hoặc xem danh sách.

3. Chọn chỉnh sửa/xóa.

4. Hệ thống lưu thay đổi.

Alternative / Exception Flow

- 4a. Công việc đã hoàn tất → chỉ cho sửa trường cho phép.

### UC-26 – Điều phối kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Điều phối kiểm kê |
| Tiền điều kiện | Đợt kiểm kê đã được BGĐ lập. |
| Hậu điều kiện | Lịch kiểm kê và danh sách nhân sự được điều phối. |

Basic Flow

1. Mở đợt kiểm kê.

2. Chọn ngày/ca/khu vực.

3. Sắp xếp nhân sự theo công việc.

4. Xác nhận điều phối.

5. Hệ thống thông báo đến nhân sự.

Alternative / Exception Flow

- 3a. Một người bị trùng ca → cảnh báo.

### UC-27 – Mua hàng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận mua hàng |
| Tiền điều kiện | Kế hoạch mua đã DA_DUYET. |
| Hậu điều kiện | Đơn mua được tạo với nhà cung cấp riêng. |

Basic Flow

1. Mở kế hoạch mua đã duyệt.

2. Chọn nhà cung cấp từ bảng NhaCungCap.

3. Nhập giá, điều kiện giao hàng và thông tin đơn mua.

4. Hệ thống kiểm tra.

5. Tạo đơn mua CHO_XU_LY.

6. Lưu liên kết với kế hoạch mua.

Alternative / Exception Flow

- 2a. Nhà cung cấp không tồn tại/ngưng hoạt động → không cho chọn.

- 3a. Giá/số lượng không hợp lệ → báo lỗi.

### UC-28 – Lập biên bản kiểm kê

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban kiểm kê |
| Tiền điều kiện | Đợt kiểm kê đã hoàn thành và có dữ liệu. |
| Hậu điều kiện | Biên bản được lưu. |

Basic Flow

1. Chọn Lập biên bản.

2. Hệ thống tổng hợp dữ liệu kiểm kê.

3. Ban kiểm kê bổ sung nội dung tổng hợp.

4. Xác nhận.

5. Hệ thống tạo biên bản và gắn người lập.

### UC-29 – Tiếp nhận đơn hàng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận lập kế hoạch |
| Tiền điều kiện | Đã đăng nhập. |
| Hậu điều kiện | Đơn hàng từ CHUA_TIEP_NHAN → DA_TIEP_NHAN. |

Basic Flow

1. Chọn Xem đơn hàng chưa tiếp nhận.

2. Hệ thống hiển thị danh sách.

3. Chọn đơn.

4. Xem chi tiết.

5. Chọn Tiếp nhận.

6. Hệ thống cập nhật trạng thái và thông báo thành công.

Alternative / Exception Flow

- 1a. Không có đơn mới → thông báo.

### UC-30 – Kiểm tra chất lượng NVL trước khi nhập kho

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận QC/AC |
| Tiền điều kiện | Có lô NVL từ nhà cung cấp theo đơn/kế hoạch mua đã duyệt và đang chờ QC. |
| Hậu điều kiện | Kết quả QC được lưu; phần đạt chờ nhập kho; phần không đạt chỉ ghi nhận và báo BGĐ. |

Basic Flow

1. Mở danh sách lô chờ QC.

2. Chọn lô.

3. Nhập số lượng kiểm tra, đạt, không đạt.

4. Hệ thống kiểm tra đạt + không đạt = kiểm tra.

5. Xác nhận.

6. Lưu kết quả.

7. Phần đạt chuyển CHO_NHAP_KHO.

8. Nếu có phần không đạt: hệ thống tự động tạo thông báo/báo cáo cho BGĐ.

Alternative / Exception Flow

- 3a. Số âm/không phải số → báo lỗi.

- 4a. Tổng không khớp → báo lỗi.

- 2a. Không có lô chờ QC → thông báo.

### UC-31 – Phê duyệt đơn hàng

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Đơn hàng ở DA_TIEP_NHAN. |
| Hậu điều kiện | Đơn hàng DA_DUYET hoặc TU_CHOI. |

Basic Flow

1. BGĐ mở danh sách đơn chờ duyệt.

2. Chọn đơn và xem chi tiết.

3. Chọn Phê duyệt hoặc Từ chối.

4. Hệ thống ghi quyết định và thời điểm.

5. Nếu phê duyệt: cho phép UC-34/UC-33.

### UC-32 – Phê duyệt kế hoạch mua/bán

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Kế hoạch ở CHO_DUYET. |
| Hậu điều kiện | Kế hoạch DA_DUYET hoặc TU_CHOI. |

Basic Flow

1. BGĐ mở kế hoạch chờ duyệt.

2. Xem chi tiết và nguồn nhu cầu.

3. Chọn duyệt/từ chối.

4. Hệ thống lưu quyết định.

5. Nếu duyệt mua: cho phép UC-27.

### UC-33 – Tiếp nhận đơn hàng để sản xuất / đối chiếu NVL

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận sản xuất |
| Tiền điều kiện | Đơn hàng đã DA_DUYET. |
| Hậu điều kiện | Kế hoạch sản xuất/đối chiếu NVL được khởi tạo; trạng thái sản xuất xác định. |

Basic Flow

1. Bộ phận sản xuất mở danh sách đơn đã duyệt.

2. Chọn một đơn hàng.

3. Hệ thống tạo hoặc mở kế hoạch sản xuất cho đúng đơn hàng đó.

4. Hệ thống tra cứu công thức sản xuất.

5. Tính nhu cầu NVL.

6. Đối chiếu với tồn kho.

7. Xác định đủ/thiếu và chuyển trạng thái tương ứng.

8. Nếu thiếu: chuyển CHO_QUYET_DINH_MUA và gửi kết quả cho BGĐ.

Alternative / Exception Flow

- 4a. Không có công thức → không hoàn tất kế hoạch.

- 6a. NVL đủ → DU_NVL_SAN_SANG_SAN_XUAT.

### UC-34 – Lập kế hoạch sản xuất

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận sản xuất |
| Tiền điều kiện | Đơn hàng đã DA_DUYET và chưa có kế hoạch sản xuất hiệu lực. |
| Hậu điều kiện | Kế hoạch sản xuất được lưu cùng bảng nhu cầu NVL. |

Basic Flow

1. Chọn Lập kế hoạch sản xuất.

2. Chọn đơn hàng.

3. Hệ thống khóa phạm vi đúng 1 đơn hàng.

4. Xác định số lượng TP cần sản xuất.

5. Tra cứu công thức.

6. Tính NVL ước lượng = tổng(định mức x số lượng TP).

7. Lấy tồn kho khả dụng.

8. Tính số lượng thiếu = max(0, nhu cầu - tồn).

9. Người lập kiểm tra.

10. Xác nhận.

11. Hệ thống lưu kế hoạch và gửi kết quả cho BGĐ.

Alternative / Exception Flow

- 5a. Công thức thiếu dòng NVL → cảnh báo.

- 7a. Không có tồn kho → coi tồn = 0.

- 8a. Không thiếu NVL → không tạo Yêu cầu mua.

### UC-35 – Quyết định mua NVL từ kế hoạch sản xuất

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Ban giám đốc |
| Tiền điều kiện | Kế hoạch sản xuất có ít nhất một dòng NVL thiếu và đang CHO_QUYET_DINH_MUA. |
| Hậu điều kiện | Quyết định mua được lưu; nếu cho phép thì Yêu cầu mua NVL được tạo. |

Basic Flow

1. BGĐ mở kế hoạch sản xuất chờ quyết định.

2. Hệ thống hiển thị nhu cầu ước lượng, tồn kho và số lượng thiếu.

3. BGĐ chọn Cho phép mua NVL hoặc Không mua NVL.

4. Hệ thống lưu quyết định, thời điểm và người quyết định.

5. Nếu Cho phép: tạo YeuCauMuaNVL và chi tiết số lượng thiếu.

6. Gửi yêu cầu cho Bộ phận lập kế hoạch.

Alternative / Exception Flow

- 3a. Không mua → không tạo yêu cầu mua; kế hoạch giữ trạng thái chờ theo quyết định nghiệp vụ.

- 5a. Yêu cầu đã tồn tại → không tạo trùng.

### UC-36* – Kiểm tra chất lượng thành phẩm (bổ sung)

| Mục | Đặc tả |
| --- | --- |
| Actor chính | Bộ phận QC/AC |
| Tiền điều kiện | Có lô thành phẩm mới sản xuất và cần xác định điều kiện xuất kho. |
| Hậu điều kiện | Lô thành phẩm đạt/không đạt; chỉ lô đạt đủ điều kiện xuất. |

Basic Flow

1. Chọn lô thành phẩm chờ QC.

2. Nhập số lượng kiểm tra và kết quả.

3. Hệ thống kiểm tra tính nhất quán.

4. Lưu kết quả.

5. Gắn trạng tháiQC cho lô.

Alternative / Exception Flow

- 4a. Nếu dự án quyết định QC thành phẩm nằm ngoài phạm vi: thay bằng trường trạng thái xác nhận từ hệ thống khác.

## 8.2 Các Use Case con CRUD

| UC | Tên | Actor | Tiền điều kiện | Hậu điều kiện |
| --- | --- | --- | --- | --- |
| UC-06.1 | Thêm danh mục kho | Quản lý kho | Tên/mô tả hợp lệ; không trùng tên. | Tạo danh mục. |
| UC-06.2 | Xóa danh mục kho | Quản lý kho | Danh mục không được sử dụng. | Danh mục bị xóa. |
| UC-06.3 | Sửa danh mục kho | Quản lý kho | Danh mục tồn tại; dữ liệu mới hợp lệ. | Thông tin được cập nhật. |
| UC-07.1 | Thêm dữ liệu danh mục kho | Quản lý kho | Đã chọn danh mục. | Dữ liệu mới được thêm. |
| UC-07.2 | Xóa dữ liệu danh mục kho | Quản lý kho | Bản ghi không còn được tham chiếu/giao dịch. | Bản ghi bị xóa hoặc vô hiệu hóa. |
| UC-07.3 | Sửa dữ liệu danh mục kho | Quản lý kho | Bản ghi tồn tại. | Thông tin được cập nhật. |
| UC-24.1 | Sửa yêu cầu của chủ xưởng | Chủ xưởng | Yêu cầu do chính mình tạo và chưa tiếp nhận. | Yêu cầu được cập nhật. |
| UC-24.2 | Xóa yêu cầu của chủ xưởng | Chủ xưởng | Yêu cầu do chính mình tạo và chưa tiếp nhận. | Yêu cầu bị xóa. |
| UC-25.1 | Chỉnh sửa công việc | Ban giám đốc | Công việc tồn tại. | Công việc cập nhật. |
| UC-25.2 | Xóa công việc | Ban giám đốc | Công việc không bị khóa bởi dữ liệu khác. | Công việc bị xóa. |
| UC-05.1 | Sửa kế hoạch | Bộ phận lập kế hoạch | Kế hoạch CHO_DUYET. | Kế hoạch cập nhật. |
| UC-05.2 | Xóa kế hoạch | Bộ phận lập kế hoạch | Kế hoạch CHO_DUYET. | Kế hoạch xóa. |
| UC-12.1 | Thêm kết quả QC | QC/AC | Lô và số lượng hợp lệ. | Kết quả QC tạo mới. |
| UC-12.2 | Sửa kết quả QC | QC/AC | Kết quả tồn tại. | Kết quả cập nhật. |
| UC-12.3 | Xóa kết quả QC | QC/AC | Không vi phạm lịch sử nhập kho. | Kết quả xóa/void theo policy. |

Quy tắc chung CRUD: dữ liệu bắt buộc không được rỗng; số phải đúng kiểu và không âm; mã sinh tự động; dữ liệu master đang được tham chiếu bởi giao dịch không được xóa vật lý nếu làm mất tính toàn vẹn lịch sử, nên dùng trạng thái ngừng hoạt động/soft delete.

## 9. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

Phần này định nghĩa các yêu cầu chức năng ở mức có thể dùng trực tiếp làm căn cứ thiết kế backend/API/UI và kiểm thử. Mỗi FR được gắn với một hoặc nhiều UC; UC mô tả workflow, còn FR mô tả hệ thống bắt buộc phải cung cấp chức năng gì.

### 9.1. Xác thực và phân quyền

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-01 | Hệ thống phải cho phép người dùng đăng nhập bằng tên đăng nhập và mật khẩu hợp lệ. | UC-01 |
| FR-02 | Hệ thống phải từ chối đăng nhập khi thông tin xác thực sai hoặc tài khoản không hoạt động. | UC-01 |
| FR-03 | Hệ thống phải xác định vai trò của người dùng sau khi đăng nhập để kiểm soát quyền truy cập. | UC-01 |
| FR-04 | Hệ thống phải chỉ cho phép actor thực hiện các UC/chức năng tương ứng với quyền được cấp. | Tất cả UC |

### 9.2. Khách hàng và đơn hàng

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-05 | Hệ thống phải cho phép khách hàng tạo đơn hàng mua thành phẩm. | UC-02 |
| FR-06 | Hệ thống phải tạo mã đơn hàng duy nhất và gán trạng thái CHUA_TIEP_NHAN khi đơn được tạo. | UC-02 |
| FR-07 | Hệ thống phải cho phép bộ phận lập kế hoạch xem các đơn hàng chưa tiếp nhận và chuyển đơn sang DA_TIEP_NHAN. | UC-29 |
| FR-08 | Hệ thống phải cho phép Ban giám đốc xem chi tiết và phê duyệt hoặc từ chối đơn hàng đã tiếp nhận. | UC-31 |
| FR-09 | Hệ thống phải lưu người phê duyệt và thời điểm phê duyệt/từ chối đơn hàng. | UC-31 |
| FR-10 | Hệ thống phải cho phép bộ phận kinh doanh/kho cập nhật đơn hàng theo trạng thái và quyền được cấp. | UC-03 |

### 9.3. Kế hoạch sản xuất và nhu cầu NVL

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-11 | Hệ thống phải chỉ cho phép lập kế hoạch sản xuất từ đơn hàng đã DA_DUYET. | UC-33, UC-34 |
| FR-12 | Hệ thống phải bảo đảm một đơn hàng bán chỉ có tối đa một kế hoạch sản xuất hiệu lực. | UC-33, UC-34 |
| FR-13 | Hệ thống phải tự động lấy thành phẩm và số lượng cần sản xuất từ đơn hàng được chọn. | UC-33, UC-34 |
| FR-14 | Hệ thống phải tra cứu công thức sản xuất tương ứng với thành phẩm cần sản xuất. | UC-33, UC-34 |
| FR-15 | Hệ thống phải tính nhu cầu từng NVL theo số lượng thành phẩm và định mức NVL trong công thức. | UC-33, UC-34 |
| FR-16 | Hệ thống phải lấy tồn kho khả dụng của từng NVL để đối chiếu với nhu cầu ước lượng. | UC-33, UC-34 |
| FR-17 | Hệ thống phải tính số lượng NVL thiếu theo từng loại NVL. | UC-33, UC-34 |
| FR-18 | Hệ thống phải hiển thị tối thiểu các giá trị: nhu cầu ước lượng, tồn kho khả dụng và số lượng thiếu. | UC-34, UC-35 |
| FR-19 | Hệ thống phải lưu kế hoạch sản xuất, người lập và thời điểm lập. | UC-34 |
| FR-20 | Hệ thống phải gửi kết quả ước lượng/chênh lệch NVL của kế hoạch sản xuất đến Ban giám đốc. | UC-34 |
| FR-21 | Khi NVL đủ, hệ thống phải chuyển trạng thái sản xuất sang DU_NVL_SAN_SANG_SAN_XUAT và không tạo yêu cầu mua NVL. | UC-33, UC-34 |
| FR-22 | Khi NVL thiếu, hệ thống phải chuyển kế hoạch/đơn hàng sang trạng thái chờ quyết định mua của Ban giám đốc. | UC-33, UC-34 |
| FR-23 | Hệ thống phải cho phép Ban giám đốc xem kế hoạch sản xuất đang chờ quyết định mua NVL. | UC-35 |
| FR-24 | Hệ thống phải cho phép Ban giám đốc chọn Cho phép mua NVL hoặc Không mua NVL. | UC-35 |
| FR-25 | Hệ thống phải lưu người quyết định, thời điểm và quyết định mua NVL. | UC-35 |
| FR-26 | Khi Ban giám đốc cho phép mua, hệ thống phải tạo Yêu cầu mua NVL với các dòng số lượng thiếu tương ứng. | UC-35 |
| FR-27 | Hệ thống không được tự động tạo Yêu cầu mua NVL chỉ từ kết quả thiếu NVL nếu chưa có quyết định Cho phép mua của Ban giám đốc. | UC-35 |
| FR-28 | Hệ thống phải ngăn tạo trùng Yêu cầu mua NVL cho cùng một kế hoạch/quyết định mua đã tồn tại. | UC-35 |

### 9.4. Kế hoạch mua/bán và mua hàng

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-29 | Hệ thống phải cho phép bộ phận lập kế hoạch tạo kế hoạch mua/bán từ nhu cầu hợp lệ, bao gồm Yêu cầu mua NVL. | UC-04 |
| FR-30 | Hệ thống phải cho phép sửa và xóa kế hoạch khi kế hoạch chưa được phê duyệt. | UC-05, UC-05.1, UC-05.2 |
| FR-31 | Hệ thống không được cho phép sửa/xóa kế hoạch đã DA_DUYET. | UC-05 |
| FR-32 | Hệ thống phải cho phép Ban giám đốc phê duyệt hoặc từ chối kế hoạch mua/bán và lưu người/thời điểm quyết định. | UC-32 |
| FR-33 | Hệ thống phải chỉ cho phép Bộ phận mua hàng tạo đơn mua từ kế hoạch mua đã DA_DUYET. | UC-27 |
| FR-34 | Hệ thống phải cho phép chọn Nhà cung cấp từ danh mục Nhà cung cấp đang hoạt động. | UC-27 |
| FR-35 | Hệ thống phải lưu nhà cung cấp, giá, điều kiện giao hàng và liên kết đơn mua với kế hoạch mua. | UC-27 |
| FR-36 | Hệ thống phải cho phép Bộ phận mua hàng xem các đơn hàng mua đã đặt. | UC-14 |
| FR-37 | Hệ thống phải cho phép quản lý thông tin Nhà cung cấp độc lập với đơn mua. | UC-27, UC-22 |

### 9.5. Yêu cầu nhập/xuất, nhập kho và xuất kho

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-38 | Hệ thống phải cho phép Chủ xưởng tạo Yêu cầu nhập/xuất dựa trên chứng từ hợp lệ. | UC-23 |
| FR-39 | Hệ thống phải chỉ cho phép Chủ xưởng xem/sửa/xóa các yêu cầu do chính mình tạo và chưa được tiếp nhận. | UC-24, UC-24.1, UC-24.2 |
| FR-40 | Hệ thống phải cho phép Nhân viên kho tạo phiếu nhập từ nguồn chứng từ hợp lệ và phần NVL đã QC đạt. | UC-10 |
| FR-41 | Hệ thống phải không cho nhập phần NVL chưa QC đạt. | UC-10, UC-30 |
| FR-42 | Hệ thống phải cập nhật tồn kho khi phiếu nhập hoàn tất. | UC-10 |
| FR-43 | Hệ thống phải cho phép Nhân viên kho xuất thành phẩm khi thỏa các điều kiện nghiệp vụ của đơn hàng, kế hoạch xuất và QC. | UC-11 |
| FR-44 | Hệ thống phải kiểm tra tồn kho trước khi xuất và không cho tạo giao dịch làm tồn âm. | UC-11 |
| FR-45 | Hệ thống phải cập nhật tồn kho khi phiếu xuất hoàn tất. | UC-11 |
| FR-46 | Hệ thống phải cho phép Quản lý kho xem danh sách và chi tiết phiếu nhập. | UC-08 |
| FR-47 | Hệ thống phải cho phép Quản lý kho xem danh sách và chi tiết phiếu xuất. | UC-09 |
| FR-48 | Hệ thống phải cho phép Ban giám đốc xem hồ sơ nhập kho và xuất kho. | UC-19, UC-20 |

### 9.6. Kiểm tra chất lượng

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-49 | Hệ thống phải hiển thị các lô NVL đang chờ QC trước khi nhập kho. | UC-30 |
| FR-50 | Hệ thống phải cho phép QC/AC ghi nhận số lượng kiểm tra, đạt và không đạt theo từng lô. | UC-30, UC-12 |
| FR-51 | Hệ thống phải kiểm tra tổng số lượng đạt + không đạt bằng số lượng kiểm tra. | UC-30 |
| FR-52 | Hệ thống phải chuyển phần đạt sang trạng thái chờ nhập kho. | UC-30 |
| FR-53 | Khi có phần không đạt, hệ thống phải ghi nhận số lượng không đạt và tự động gửi thông báo/báo cáo cho Ban giám đốc. | UC-30 |
| FR-54 | Hệ thống không được tạo workflow phê duyệt xử lý hàng lỗi theo UC-17; việc trả hàng nhà cung cấp nằm ngoài hệ thống. | UC-30, UC-17 |
| FR-55 | Hệ thống phải cho phép QC/AC thêm, sửa, xóa kết quả QC theo quyền và chính sách lịch sử giao dịch. | UC-12, UC-12.1, UC-12.2, UC-12.3 |

### 9.7. Tra cứu và tồn kho

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-56 | Hệ thống phải cho phép Ban giám đốc xem danh sách hàng tồn kho theo kho, sản phẩm, lô và các bộ lọc được hỗ trợ. | UC-18 |
| FR-57 | Hệ thống phải cho phép nhân viên nghiệp vụ/Quản lý kho tra cứu dữ liệu kho theo từ khóa và bộ lọc được cấp quyền. | UC-22 |
| FR-58 | Kết quả tra cứu phải hỗ trợ xem chi tiết bản ghi liên quan như NVL, thành phẩm, tồn kho, lô, nhà cung cấp và chứng từ. | UC-22 |

### 9.8. Kiểm kê

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-59 | Hệ thống phải cho phép Ban giám đốc lập đợt kiểm kê với thời gian, phạm vi kho và phạm vi hàng cần kiểm kê. | UC-13 |
| FR-60 | Hệ thống phải cho phép điều phối kiểm kê sắp xếp lịch/khu vực/nhân sự cho đợt đã lập. | UC-26 |
| FR-61 | Hệ thống phải cho phép Ban giám đốc phân công công việc kiểm kê và quản lý các công việc liên quan. | UC-25 |
| FR-62 | Hệ thống phải cho phép Ban kiểm kê ghi nhận số lượng sổ sách và số lượng thực tế cho từng lô/hàng được kiểm kê. | UC-15 |
| FR-63 | Hệ thống phải tự động xác định chênh lệch giữa số lượng sổ sách và số lượng thực tế. | UC-15, UC-16 |
| FR-64 | Hệ thống phải cho phép Quản lý kho ghi nhận nguyên nhân và phương án xử lý chênh lệch. | UC-16 |
| FR-65 | Khi chênh lệch thuộc trường hợp cần phê duyệt, hệ thống phải tạo/chuyển Đề xuất xử lý ngoại lệ sang CHO_DUYET cho Ban giám đốc. | UC-16, UC-17 |
| FR-66 | Hệ thống phải cho phép Ban giám đốc duyệt hoặc từ chối đề xuất xử lý ngoại lệ kiểm kê và lưu quyết định. | UC-17 |
| FR-67 | Hệ thống phải cho phép Ban kiểm kê lập biên bản kiểm kê từ dữ liệu của đợt kiểm kê. | UC-28 |
| FR-68 | Hệ thống phải cho phép Ban giám đốc xem báo cáo tổng hợp kiểm kê, chênh lệch và phương án/ quyết định xử lý. | UC-21 |

### 9.9. Công việc và thông báo

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-69 | Hệ thống phải cho phép Ban giám đốc tạo công việc và phân công công việc cho người dùng phù hợp. | UC-25 |
| FR-70 | Hệ thống phải cho phép Ban giám đốc sửa/xóa công việc theo trạng thái và quyền. | UC-25.1, UC-25.2 |
| FR-71 | Hệ thống phải lưu người phân công và thời điểm phân công. | UC-25 |
| FR-72 | Hệ thống phải tạo thông báo cho các sự kiện workflow quan trọng như duyệt đơn, quyết định mua, yêu cầu mua, QC không đạt, kiểm kê và ngoại lệ. | UC-31, UC-35, UC-30, UC-17, UC-13 |

### 9.10. Quản lý danh mục và dữ liệu master

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-73 | Hệ thống phải cho phép Quản lý kho thêm, sửa và xóa danh mục kho theo quyền. | UC-06, UC-06.1, UC-06.2, UC-06.3 |
| FR-74 | Hệ thống phải kiểm tra trùng tên, dữ liệu bắt buộc, kiểu dữ liệu và giá trị số trước khi lưu danh mục. | UC-06.1, UC-06.3 |
| FR-75 | Hệ thống phải cho phép Quản lý kho thêm, sửa và xóa dữ liệu thuộc danh mục. | UC-07, UC-07.1, UC-07.2, UC-07.3 |
| FR-76 | Hệ thống phải không cho xóa dữ liệu master đang được sử dụng làm dữ liệu tham chiếu hoặc đã phát sinh giao dịch; có thể dùng cơ chế ngừng hoạt động/soft delete. | UC-07.2, UC-06.2 |
| FR-77 | Hệ thống phải cho phép tra cứu danh mục và dữ liệu danh mục bằng tìm kiếm/lọc. | UC-06, UC-07 |

### 9.11. Yêu cầu dữ liệu và tính nhất quán giao dịch

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-78 | Hệ thống phải sử dụng mã định danh duy nhất cho các entity nghiệp vụ và duy trì liên kết khóa ngoại giữa các chứng từ. | Tất cả UC giao dịch |
| FR-79 | Hệ thống phải đảm bảo giao dịch nhập/xuất cập nhật tồn kho và dữ liệu chứng từ trong cùng transaction. | UC-10, UC-11 |
| FR-80 | Hệ thống phải từ chối giao dịch nếu dữ liệu tham chiếu bắt buộc không tồn tại hoặc không còn hiệu lực. | Tất cả UC |
| FR-81 | Hệ thống phải duy trì lịch sử các giao dịch kho, QC và kiểm kê để phục vụ truy vết. | UC-08, UC-09, UC-12, UC-16, UC-20, UC-21 |

### 9.12. Phạm vi QC thành phẩm

| Mã FR | Yêu cầu | UC liên quan |
| --- | --- | --- |
| FR-82 | Nếu QC thành phẩm nằm trong phạm vi hệ thống, hệ thống phải cho phép ghi nhận trạng thái QC của lô thành phẩm và chỉ cho phép xuất phần đạt. | UC-36*, UC-11 |
| FR-83 | Nếu QC thành phẩm nằm ngoài phạm vi hệ thống, hệ thống phải tiếp nhận một trạng thái/nguồn xác nhận “đủ điều kiện xuất” từ nguồn tích hợp hoặc trường nghiệp vụ tương đương. | UC-11 |

Ghi chú: FR-82 và FR-83 là hai phương án loại trừ nhau ở mức triển khai. Quyết định cuối cùng phải thống nhất trước khi code phần xuất thành phẩm.

## 10. BUSINESS RULES VÀ VALIDATION

| Mã | Quy tắc |
| --- | --- |
| BR-01 | Bộ phận sản xuất và Ban giám đốc là hai actor/role nghiệp vụ độc lập. |
| BR-02 | BGĐ duyệt đơn hàng là điều kiện đủ để được coi là đã duyệt sản xuất; không có bước duyệt sản xuất riêng. |
| BR-03 | Mỗi đơn hàng bán chỉ có một kế hoạch sản xuất hiệu lực tại một thời điểm; không gộp nhiều đơn hàng vào một lần tính NVL. |
| BR-04 | Kế hoạch sản xuất tính nhu cầu NVL dựa trên công thức sản xuất và số lượng thành phẩm cần sản xuất. |
| BR-05 | Công thức: nhu cầu NVL = Σ(định mức NVL cho 1 đơn vị TP × số lượng TP cần sản xuất). |
| BR-06 | Thiếu NVL = max(0, nhu cầu ước lượng − tồn kho khả dụng). |
| BR-07 | Bộ phận sản xuất chỉ gửi số lượng thiếu/ước lượng cho BGĐ; không tự ý tạo đơn mua. |
| BR-08 | Yêu cầu mua NVL chỉ được tạo sau khi BGĐ xác nhận Cho phép mua NVL. |
| BR-09 | Một kế hoạch sản xuất có thể tạo tối đa một yêu cầu mua NVL hiệu lực cho một quyết định mua; tránh tạo trùng. |
| BR-10 | Nhà cung cấp là entity/bảng riêng và đơn mua tham chiếu bằng khóa ngoại. |
| BR-11 | Kế hoạch mua/bán chỉ được sửa/xóa khi chưa được BGĐ duyệt. |
| BR-12 | Đơn mua chỉ được tạo từ kế hoạch mua đã được BGĐ duyệt. |
| BR-13 | Nhập kho NVL chỉ nhận phần đã QC đạt. |
| BR-14 | QC NVL: số lượng đạt + không đạt = số lượng kiểm tra; tất cả đều không âm. |
| BR-15 | Hàng không đạt QC chỉ được ghi nhận và báo cáo tự động cho BGĐ; không có UC phê duyệt hàng lỗi. |
| BR-16 | UC-17 chỉ áp dụng cho chênh lệch kiểm kê. |
| BR-17 | Lập đợt kiểm kê do BGĐ thực hiện theo nghiệp vụ mới. |
| BR-18 | Một đợt kiểm kê có một ban kiểm kê; một ban có một hoặc nhiều thành viên. |
| BR-19 | Xuất kho phải kiểm tra tồn kho đủ và các điều kiện nghiệp vụ của đơn hàng/kế hoạch xuất/QC. |
| BR-20 | Không được làm tồn kho âm. |
| BR-21 | Mọi thay đổi trạng thái duyệt/từ chối/nhập/xuất/kiểm kê phải ghi người thao tác và thời điểm. |
| BR-22 | Giao dịch lịch sử kho không được xóa vật lý làm mất khả năng truy vết. |
| BR-23 | Khi lô không còn tồn kho, dữ liệu lô vẫn phải tồn tại để phục vụ lịch sử. |
| BR-24 | Ngày kết thúc phải >= ngày bắt đầu; số lượng phải > 0 đối với các dòng giao dịch. |
| BR-25 | Nếu không có tồn kho cho một NVL, số lượng tồn khả dụng được xem là 0 khi tính thiếu. |

### 9.1 Validation dữ liệu

| Trường hợp | Yêu cầu |
| --- | --- |
| Mã định danh | Tự sinh, duy nhất, không sửa thủ công. |
| Tên | Không rỗng; kiểm tra trùng trong cùng phạm vi master. |
| Số lượng | Numeric/decimal tùy DVT; >0 ở giao dịch; >=0 ở số dư. |
| Giá | >=0; nếu có currency phải xác định rõ đơn vị tiền. |
| Ngày | Đúng định dạng; bảo đảm thứ tự thời gian. |
| Tổng QC | soLuongDat + soLuongKhongDat = soLuongKiemTra. |
| Tồn kho | Không thể xuất quá tồn khả dụng. |
| Tham chiếu | Không xóa master đang được FK tham chiếu hoặc đã phát sinh giao dịch. |

## 11. YÊU CẦU PHI CHỨC NĂNG

| Mã | Nhóm | Yêu cầu |
| --- | --- | --- |
| NFR-01 | Bảo mật | Mật khẩu không lưu plaintext; đăng nhập và phân quyền theo vai trò. |
| NFR-02 | Phân quyền | Mỗi UC chỉ hiển thị/thao tác khi actor có quyền tương ứng. |
| NFR-03 | Toàn vẹn dữ liệu | Dùng PK/FK/unique/check constraint và transaction cho giao dịch kho. |
| NFR-04 | Audit | Các hành động duyệt, từ chối, nhập, xuất, QC, kiểm kê, điều chỉnh tồn phải có log. |
| NFR-05 | Hiệu năng | Danh sách lớn phải hỗ trợ phân trang, tìm kiếm và lọc server-side. |
| NFR-06 | Khả dụng | Lỗi validation phải trả thông báo dễ hiểu và không làm mất dữ liệu đã nhập hợp lệ. |
| NFR-07 | Tính nhất quán | Các thao tác ảnh hưởng đồng thời tồn kho phải chạy trong transaction và khóa/kiểm tra số dư đúng cách. |
| NFR-08 | Khả năng bảo trì | Trạng thái và loại nghiệp vụ nên dùng enum/constants; logic tính NVL tách service/use-case. |
| NFR-09 | Sao lưu | Database phải có cơ chế backup định kỳ phù hợp môi trường triển khai. |

## 12. THÔNG BÁO, AUDIT VÀ BẢO MẬT

Các sự kiện cần tạo thông báo tối thiểu: đơn hàng chờ BGĐ duyệt; kế hoạch sản xuất có NVL thiếu; BGĐ cần quyết định mua NVL; yêu cầu mua NVL mới đến Bộ phận lập kế hoạch; kế hoạch mua chờ duyệt; lô NVL chờ QC; có NVL không đạt QC; đợt kiểm kê mới; đề xuất ngoại lệ kiểm kê chờ BGĐ; kết quả phê duyệt/từ chối.

AuditLog nên lưu: người thao tác, hành động, loại đối tượng, mã đối tượng, thời gian, dữ liệu trước và sau (khi phù hợp). Đặc biệt không xóa hoặc sửa trực tiếp audit log bằng UI nghiệp vụ thông thường.

## 13. PHẠM VI NGOÀI HỆ THỐNG

- Sản xuất thực tế: máy móc, công đoạn, định mức tiêu hao thực tế theo ca, năng suất, nhân công.

- Thanh toán công nợ nhà cung cấp/khách hàng.

- Vận chuyển/giao hàng vật lý.

- Trả hàng nhà cung cấp đối với NVL không đạt QC; hệ thống chỉ ghi nhận và báo cáo.

- Các bước kế toán tài chính không được nêu trong UC.

## 14. MA TRẬN TRUY VẾT NGHIỆP VỤ

| Luồng | Use Case | Dữ liệu kết quả |
| --- | --- | --- |
| Đặt đơn → duyệt | UC-02 → UC-29 → UC-31 | Đơn hàng DA_DUYET |
| Lập kế hoạch sản xuất | UC-33/UC-34 | KeHoachSanXuat + ChiTietNhuCauNVL |
| Thiếu NVL → quyết định | UC-35 | YeuCauMuaNVL nếu cho phép |
| Mua NVL | UC-04 → UC-05 → UC-32 → UC-27 → UC-14 | KeHoachMuaBan + DonHang(Mua) + NhaCungCap |
| QC NVL → nhập | UC-30 → UC-10 → UC-08/20 | KetQuaKiemTraQC + PhieuNhapKho |
| Sản xuất ngoài hệ thống → xuất | UC-03 → UC-11 → UC-09/19 | PhieuXuatKho + trạng thái đơn hàng |
| Tra cứu | UC-18/22 | Tồn kho, master, lô, chứng từ |
| Kiểm kê | UC-13 → UC-26 → UC-25 → UC-15 → UC-16 → UC-17 → UC-28 → UC-21 | DotKiemKe + chênh lệch + đề xuất + biên bản |

## 15. TIÊU CHÍ NGHIỆM THU TỔNG QUÁT

1. Không thể lập kế hoạch sản xuất cho đơn hàng chưa được BGĐ phê duyệt.

2. Hệ thống tính đúng nhu cầu NVL theo công thức và số lượng thành phẩm.

3. Khi thiếu NVL, hệ thống gửi phần thiếu/ước lượng cho BGĐ và chưa tạo yêu cầu mua.

4. Chỉ khi BGĐ cho phép mua thì Yêu cầu mua NVL mới được tạo.

5. Bộ phận mua hàng chỉ tạo đơn mua từ kế hoạch mua đã duyệt và chọn nhà cung cấp từ bảng riêng.

6. Không thể nhập kho phần NVL chưa QC đạt.

7. QC không đạt không tạo workflow phê duyệt hàng lỗi; chỉ lưu kết quả và báo cáo BGĐ.

8. BGĐ là actor lập đợt kiểm kê.

9. UC-17 chỉ xử lý ngoại lệ do chênh lệch kiểm kê.

10. Không thể làm tồn kho âm.

11. Lịch sử nhập/xuất/QC/kiểm kê phải truy vết được người và thời gian thực hiện.

12. Quyền thao tác phải phù hợp actor/role của UC.

## PHỤ LỤC A – GỢI Ý CẤU TRÚC DB CHO CODE

Không bắt buộc tên bảng phải giống tuyệt đối tên entity, nhưng quan hệ và ràng buộc phải bảo toàn.

- users (NguoiDung), roles (VaiTro), customers (KhachHang), suppliers (NhaCungCap), warehouse_owners (ChuXuong).

- warehouses (Kho), catalogues (DanhMucKho), catalogue_values (DuLieuDanhMuc), products (SanPham), material/finished-product detail tables nếu dùng inheritance.

- lots (LoHang), production_formulas (CongThucSanXuat), production_formula_items (ChiTietCongThuc).

- sales/purchase orders (DonHang), order_items (ChiTietDonHang).

- production_plans (KeHoachSanXuat), production_plan_items (ChiTietKeHoachSanXuat), material_requirements (ChiTietNhuCauNVL).

- purchase_requests (YeuCauMuaNVL), purchase_request_items (ChiTietYeuCauMuaNVL), procurement_plans (KeHoachMuaBan), procurement_plan_items (ChiTietKeHoach).

- inbound_requests/outbound_requests (YeuCauNhapXuat), inbound_receipts (PhieuNhapKho), inbound_receipt_items (ChiTietPhieuNhap), outbound_receipts (PhieuXuatKho), outbound_receipt_items (ChiTietPhieuXuat).

- qc_results (KetQuaKiemTraQC), inventory_count_batches (DotKiemKe), inventory_count_teams (BanKiemKe), inventory_count_members (ThanhVienBanKiemKe), inventory_count_lines (ChiTietKiemKe), inventory_variances (ChenhLechKiemKe), exception_proposals (DeXuatXuLyNgoaiLe), inventory_count_reports (BienBanKiemKe).

- work_items (CongViec), assignments (PhanCongCongViec), notifications (ThongBao), audit_logs (AuditLog).

## PHỤ LỤC B – CÔNG THỨC TÍNH NVL

Với mỗi thành phẩm TP trong một kế hoạch sản xuất:

NhuCauNVL_i = SoLuongTP × DinhMucNVL_i

ThieuNVL_i = max(0, NhuCauNVL_i − TonKhoKhaDung_i)

Tổng số lượng cần mua cho NVL i chỉ lấy phần ThieuNVL_i và chỉ được phát sinh thành YeuCauMuaNVL sau khi Ban giám đốc chọn “Cho phép mua”.
