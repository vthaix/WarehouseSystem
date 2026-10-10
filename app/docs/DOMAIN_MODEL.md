# Domain Model đã chỉnh sửa

Kế hoạch sản xuất là dự kiến ban đầu, phát sinh từ đơn hàng và phân công cho xưởng. `ChiTietKeHoachSanXuat` chứa cả dòng thành phẩm và dòng NVL cần/còn thiếu, phân biệt bằng `LoaiChiTiet`; không có entity chi tiết NVL kế hoạch riêng.

Xưởng đối chiếu kế hoạch với tồn kho để lập báo cáo sản xuất thực tế. Báo cáo sản xuất liên kết kế hoạch sản xuất, làm nguồn lập kế hoạch MUA, đơn mua NVL và yêu cầu xuất NVL cho sản xuất. Đơn mua vẫn liên kết kế hoạch MUA đã phê duyệt và đồng thời tham chiếu chính báo cáo nguồn đó.

Báo cáo thành phẩm ghi nhận kết quả sản xuất thực tế và làm nguồn lập kế hoạch BAN. Hai loại báo cáo tiếp tục dùng chung `BanBaoCaoSanXuat`, phân biệt bằng `LoaiBaoCao`; hai loại kế hoạch dùng chung `KeHoachMuaBan`, phân biệt bằng `LoaiKeHoach`. Các quan hệ có điều kiện theo loại phải được kiểm tra khi triển khai.

Trong sơ đồ, `N` biểu diễn nhiều. Các trường liên kết `MaBaoCao` tham chiếu báo cáo nguồn; số lượng báo cáo là dữ liệu thực tế, còn số lượng trong kế hoạch sản xuất là dự kiến. Các nhóm ngoài phạm vi sửa được giữ nguyên; tên báo cáo và xử lý ngoại lệ trong sơ đồ tổng thể được thống nhất với các nhóm chi tiết của file nguồn.

1. Nhóm Tài khoản / Người dùng

```mermaid
classDiagram

    class NguoiDung {
        +MaNguoiDung
        +HoTen
        +MatKhau
        +SoDienThoai
        +Email
        +VaiTro
        +TrangThai
    }

    class NhanVien {
        +MaNhanVien
        +MaBoPhan
        +ChucVu
    }

    class KhachHang {
        +DiaChi
    }

    class VaiTro {
        +MaVaiTro
        +TenVaiTro
        +MoTa
    }

    class BoPhan {
        +MaBoPhan
        +TenBoPhan
        +MoTa
    }

    NguoiDung <|-- NhanVien
    NguoiDung <|-- KhachHang
    VaiTro "1" --> "N" NguoiDung : có
    BoPhan "1" --> "N" NhanVien : quản lý

```

2. Nhóm Đơn hàng khách hàng

```mermaid
classDiagram

    class KhachHang {
        +MaNguoiDung
        +DiaChi
    }

    class DonHang {
        +MaDonHang
        +NgayDat
        +TrangThai
        +NgayGiaoDuKien
        +GhiChu
    }

    class ChiTietDonHang {
        +MaMatHang
        +SoLuong
        +DonGia
        +TongTien
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +MoTa
        +TrangThai
    }

    KhachHang "1" --> "N" DonHang : đặt
    DonHang "1" --> "N" ChiTietDonHang : gồm
    MatHang "1" --> "N" ChiTietDonHang : xuất hiện trong

```

3. Nhóm Mặt hàng / Loại hàng

```mermaid
classDiagram

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +MoTa
        +TrangThai
    }

    class LoaiHang {
        +MaLoaiHang
        +TenLoaiHang
        +MoTa
    }

    LoaiHang "1" --> "N" MatHang : phân loại

    note for LoaiHang "Có thể gồm: Nguyên vật liệu, Thành phẩm, Hàng trả về"

```

4. Nhóm Xưởng / Nhà cung cấp

```mermaid
classDiagram

    class Xuong {
        +MaXuong
        +TenXuong
        +DiaDiem
        +NguoiQuanLy
        +TrangThai
        +MoTa
    }

    class NhaCungCap {
        +MaNhaCungCap
        +TenNhaCungCap
        +DiaChi
        +SoDienThoai
        +Email
        +TrangThai
        +GhiChu
    }

    class BoPhan {
        +MaBoPhan
        +TenBoPhan
        +MoTa
    }

```

5. Nhóm Kế hoạch sản xuất

```mermaid
classDiagram

    class DonHang {
        +MaDonHang
        +NgayDat
        +TrangThai
        +NgayGiaoDuKien
    }

    class Xuong {
        +MaXuong
        +TenXuong
        +DiaDiem
        +TrangThai
    }

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +NgayNhanDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietKeHoachSanXuat {
        +MaChiTietKeHoachSanXuat
        +MaMatHang
        +LoaiChiTiet
        +SoLuong
        +SoLuongCanThiet
        +SoLuongConThieu
        +GhiChu
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    DonHang "1" --> "N" KeHoachSanXuat : phát sinh
    Xuong "1" --> "N" KeHoachSanXuat : thực hiện tại
    KeHoachSanXuat "1" --> "N" ChiTietKeHoachSanXuat : gồm
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : thành phẩm hoặc NVL

    note for ChiTietKeHoachSanXuat "LoaiChiTiet: THANH_PHAM / NGUYEN_VAT_LIEU. Thành phẩm dùng SoLuong; NVL dùng SoLuongCanThiet và SoLuongConThieu. Đơn vị tính lấy từ MatHang; đây là dữ liệu dự kiến ban đầu."

```

6. Nhóm Kế hoạch mua / bán và Đơn mua hàng

Kế hoạch mua lấy nhu cầu thiếu thực tế từ báo cáo sản xuất; kế hoạch bán lấy thành phẩm thực tế từ báo cáo thành phẩm. Hai loại báo cáo dùng chung BanBaoCaoSanXuat, phân biệt bằng LoaiBaoCao.

```mermaid
classDiagram

    class BanBaoCaoSanXuat {
        +MaBaoCao
        +MaKeHoachSanXuat
        +MaXuong
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +TrangThai
    }

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +MaBaoCao
        +LoaiKeHoach
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietKeHoachMuaBan {
        +MaMatHang
        +SoLuong
        +DonGiaDuKien
    }

    class DonMuaHang {
        +MaDonMua
        +MaBaoCao
        +NgayLap
        +TrangThai
        +NgayGiaoDuKien
        +GhiChu
    }

    class ChiTietDonMuaHang {
        +MaMatHang
        +SoLuong
        +DonGia
        +TongTien
    }

    class NhaCungCap {
        +MaNhaCungCap
        +TenNhaCungCap
        +DiaChi
        +SoDienThoai
        +Email
        +TrangThai
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    KeHoachSanXuat "1" --> "N" BanBaoCaoSanXuat : đối chiếu thực tế
    BanBaoCaoSanXuat "1" --> "N" KeHoachMuaBan : nguồn lập theo loại báo cáo
    BanBaoCaoSanXuat "1" --> "N" DonMuaHang : căn cứ nhu cầu NVL
    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh

    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

    note for KeHoachMuaBan "LoaiKeHoach=MUA: MaBaoCao trỏ báo cáo sản xuất; LoaiKeHoach=BAN: MaBaoCao trỏ báo cáo thành phẩm. Mỗi kế hoạch chỉ thuộc một loại."
    note for DonMuaHang "MaBaoCao phải trỏ báo cáo sản xuất và cùng báo cáo nguồn của kế hoạch MUA liên quan. Không tạo đơn mua từ kế hoạch BAN."
    note for ChiTietKeHoachMuaBan "MUA: lấy NVL còn thiếu từ ChiTietBaoCaoSanXuat. BAN: lấy thành phẩm thực tế từ ChiTietBaoCaoSanXuat."

```

7. Nhóm Phiếu yêu cầu xuất/nhập và Phiếu kho

```mermaid
classDiagram

    class BanBaoCaoSanXuat {
        +MaBaoCao
        +MaKeHoachSanXuat
        +MaXuong
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +TrangThai
    }

    class Xuong {
        +MaXuong
        +TenXuong
        +DiaDiem
        +TrangThai
    }

    class Kho {
        +MaKho
        +TenKho
        +LoaiKho
        +TrangThai
    }

    class PhieuYeuCauNhapXuat {
        +MaPhieuYeuCau
        +LoaiYeuCau
        +MaBaoCao
        +MaXuong
        +NgayYeuCau
        +NgayThucHienDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuYeuCauNhapXuat {
        +MaMatHang
        +SoLuong
        +GhiChu
    }

    class PhieuKho {
        +MaPhieu
        +LoaiPhieu
        +MaKho
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuKho {
        +MaChiTietLo
        +SoLuong
        +DonGia
        +GhiChu
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
        +GhiChu
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
    }

    BanBaoCaoSanXuat "1" --> "N" PhieuYeuCauNhapXuat : căn cứ thực tế
    Xuong "1" --> "N" PhieuYeuCauNhapXuat : yêu cầu bởi
    PhieuYeuCauNhapXuat "1" --> "N" ChiTietPhieuYeuCauNhapXuat : gồm
    MatHang "1" --> "N" ChiTietPhieuYeuCauNhapXuat : yêu cầu

    PhieuYeuCauNhapXuat "1" --> "N" PhieuKho : phát sinh
    Kho "1" --> "N" PhieuKho : thực hiện tại
    PhieuKho "1" --> "N" ChiTietPhieuKho : gồm

    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietPhieuKho : nhập/xuất

    note for PhieuYeuCauNhapXuat "Xuất NVL: lấy dữ liệu báo cáo sản xuất thực tế. Nhập thành phẩm: lấy dữ liệu báo cáo thành phẩm. MaBaoCao phải khớp loại yêu cầu và xưởng; không lấy trực tiếp từ kế hoạch ban đầu."
    note for ChiTietPhieuYeuCauNhapXuat "Yêu cầu theo mặt hàng, chưa gắn lô"
    note for PhieuKho "LoaiPhieu: Phiếu nhập / Phiếu xuất"
    note for ChiTietPhieuKho "Phiếu kho ghi nhận thực tế theo lô. Ví dụ: xuất 4 kg đường lô A + 6 kg đường lô B"

```

8. Nhóm Lô hàng

```mermaid
classDiagram

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
        +GhiChu
    }

    class LoNguyenVatLieu {
        +NgayNhan
        +MaNhaCungCap
    }

    class LoThanhPham {
        +NgaySanXuat
        +NgayXuat
    }

    class LoHangTraVe {
        +NgayTra
        +LyDoTra
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
        +DonGia
        +GhiChu
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    LoHang <|-- LoNguyenVatLieu
    LoHang <|-- LoThanhPham
    LoHang <|-- LoHangTraVe

    LoHang "1" --> "N" ChiTietLo : gồm
    MatHang "1" --> "N" ChiTietLo : thuộc lô

    note for ChiTietLo "Một lô có thể gồm nhiều mặt hàng; mỗi mặt hàng có số lượng riêng"

```

9. Nhóm Kho và Tồn kho

```mermaid
classDiagram

    class Kho {
        +MaKho
        +TenKho
        +LoaiKho
        +DiaDiem
        +NguoiQuanLy
        +TrangThai
        +MoTa
    }

    class TonKho {
        +MaTonKho
        +MaKho
        +MaChiTietLo
        +SoLuongTon
        +MucTonToiThieu
        +NgayCapNhat
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
    }

    Kho "1" --> "N" TonKho : theo dõi
    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" TonKho : tồn theo lô

    note for Kho "LoaiKho: Kho NVL / Kho thành phẩm / Kho hàng trả về"

```

10. Nhóm Phiếu kiểm kê

```mermaid
classDiagram

    class PhieuKiemKe {
        +MaKiemKe
        +NgayKiemKe
        +MaKho
        +NguoiThucHien
        +TrangThai
        +KetLuan
        +GhiChu
    }

    class ChiTietPhieuKiemKe {
        +MaChiTietLo
        +SoLuongHeThong
        +SoLuongThucTe
        +ChenhLech
        +NguyenNhan
        +GhiChu
    }

    class Kho {
        +MaKho
        +TenKho
        +LoaiKho
        +DiaDiem
        +TrangThai
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +TrangThai
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
    }

    Kho "1" --> "N" PhieuKiemKe : được kiểm kê
    PhieuKiemKe "1" --> "N" ChiTietPhieuKiemKe : gồm
    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietPhieuKiemKe : được kiểm kê

```

11. Nhóm Kiểm tra QC/AC

```mermaid
classDiagram

    class KetQuaKiemTraQCAC {
        +MaKetQua
        +NgayKiemTra
        +KetQua
        +GhiChu
    }

    class ChiTietKetQuaKiemTraQCAC {
        +MaChiTietLo
        +SoLuongKiemTra
        +SoLuongDat
        +SoLuongLoi
        +TinhTrang
        +GhiChu
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +TrangThai
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
    }

    KetQuaKiemTraQCAC "1" --> "N" ChiTietKetQuaKiemTraQCAC : gồm
    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietKetQuaKiemTraQCAC : được kiểm tra

```

12. Nhóm Báo cáo sản xuất / Thành phẩm

Số lượng cần thiết và số lượng NVL sử dụng được tính **theo mặt hàng** (kèm đơn vị tính). Phần chia theo lô nằm ở bảng chi tiết riêng `ChiTietLoBaoCaoSanXuat`.

```mermaid
classDiagram

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +TrangThai
    }

    class Xuong {
        +MaXuong
        +TenXuong
    }

    class BanBaoCaoSanXuat {
        +MaBaoCao
        +MaKeHoachSanXuat
        +MaXuong
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaChiTietBaoCao
        +MaMatHang
        +SoLuong
        +SoLuongCanThiet
        +SoLuongConThieu
        +SoLuongNVLSuDung
        +GhiChu
    }

    class ChiTietLoBaoCaoSanXuat {
        +MaChiTietLo
        +SoLuong
        +GhiChu
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +TrangThai
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
    }

    KeHoachSanXuat "1" --> "N" BanBaoCaoSanXuat : đối chiếu thực tế
    Xuong "1" --> "N" BanBaoCaoSanXuat : lập báo cáo
    BanBaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    ChiTietBaoCaoSanXuat "1" --> "N" ChiTietLoBaoCaoSanXuat : chia theo lô

    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietLoBaoCaoSanXuat : lô được báo cáo

    note for BanBaoCaoSanXuat "LoaiBaoCao: SAN_XUAT / THANH_PHAM. Cùng một entity: SAN_XUAT làm căn cứ mua NVL và yêu cầu xuất NVL; THANH_PHAM làm căn cứ kế hoạch bán."
    note for ChiTietBaoCaoSanXuat "Báo cáo sản xuất ghi nhu cầu NVL và phần thiếu thực tế bằng SoLuongCanThiet, SoLuongConThieu. Báo cáo thành phẩm ghi SoLuong thành phẩm và SoLuongNVLSuDung. Đơn vị tính lấy từ MatHang."
    note for ChiTietLoBaoCaoSanXuat "Phân bổ theo lô. Ví dụ: 4 kg đường lô A + 6 kg đường lô B. Tổng các dòng = SoLuongNVLSuDung (hoặc SoLuong với thành phẩm)"

```

13. Nhóm Xử lý ngoại lệ

```mermaid
classDiagram

    class BanDeXuatXuLyNgoaiLe {
        +MaDeXuat
        +NgayDeXuat
        +NoiDung
        +LyDo
        +TrangThai
    }

    class KetQuaXuLyNgoaiLe {
        +MaKetQuaXuLy
        +NgayXuLy
        +KetQua
        +NguoiXuLy
        +GhiChu
    }

    BanDeXuatXuLyNgoaiLe "1" --> "N" KetQuaXuLyNgoaiLe : được phê duyệt

```

14. Sơ đồ tổng thể

```mermaid
classDiagram

    class NguoiDung {
        +MaNguoiDung
        +HoTen
        +MatKhau
        +SoDienThoai
        +Email
        +VaiTro
        +TrangThai
    }

    class NhanVien {
        +MaNhanVien
        +MaBoPhan
        +ChucVu
    }

    class KhachHang {
        +DiaChi
    }

    class VaiTro {
        +MaVaiTro
        +TenVaiTro
        +MoTa
    }

    class BoPhan {
        +MaBoPhan
        +TenBoPhan
        +MoTa
    }

    class DonHang {
        +MaDonHang
        +NgayDat
        +TrangThai
        +NgayGiaoDuKien
        +GhiChu
    }

    class ChiTietDonHang {
        +MaMatHang
        +SoLuong
        +DonGia
        +TongTien
    }

    class MatHang {
        +MaMatHang
        +TenMatHang
        +MaLoaiHang
        +DonViTinh
        +DonGia
        +MoTa
        +TrangThai
    }

    class LoaiHang {
        +MaLoaiHang
        +TenLoaiHang
        +MoTa
    }

    class Xuong {
        +MaXuong
        +TenXuong
        +DiaDiem
        +NguoiQuanLy
        +TrangThai
    }

    class NhaCungCap {
        +MaNhaCungCap
        +TenNhaCungCap
        +DiaChi
        +SoDienThoai
        +Email
        +TrangThai
    }

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +NgayNhanDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietKeHoachSanXuat {
        +MaChiTietKeHoachSanXuat
        +MaMatHang
        +LoaiChiTiet
        +SoLuong
        +SoLuongCanThiet
        +SoLuongConThieu
        +GhiChu
    }

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +MaBaoCao
        +LoaiKeHoach
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietKeHoachMuaBan {
        +MaMatHang
        +SoLuong
        +DonGiaDuKien
    }

    class DonMuaHang {
        +MaDonMua
        +MaBaoCao
        +NgayLap
        +TrangThai
        +NgayGiaoDuKien
        +GhiChu
    }

    class ChiTietDonMuaHang {
        +MaMatHang
        +SoLuong
        +DonGia
        +TongTien
    }

    class PhieuYeuCauNhapXuat {
        +MaPhieuYeuCau
        +LoaiYeuCau
        +MaBaoCao
        +MaXuong
        +NgayYeuCau
        +NgayThucHienDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuYeuCauNhapXuat {
        +MaMatHang
        +SoLuong
        +GhiChu
    }

    class PhieuKho {
        +MaPhieu
        +LoaiPhieu
        +MaKho
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuKho {
        +MaChiTietLo
        +SoLuong
        +DonGia
        +GhiChu
    }

    class LoHang {
        +MaLo
        +NgayTao
        +TrangThai
        +GhiChu
    }

    class LoNguyenVatLieu {
        +NgayNhan
        +MaNhaCungCap
    }

    class LoThanhPham {
        +NgaySanXuat
        +NgayXuat
    }

    class LoHangTraVe {
        +NgayTra
        +LyDoTra
    }

    class ChiTietLo {
        +MaChiTietLo
        +MaLo
        +MaMatHang
        +SoLuong
        +DonGia
        +GhiChu
    }

    class Kho {
        +MaKho
        +TenKho
        +LoaiKho
        +DiaDiem
        +NguoiQuanLy
        +TrangThai
    }

    class TonKho {
        +MaTonKho
        +MaKho
        +MaChiTietLo
        +SoLuongTon
        +MucTonToiThieu
        +NgayCapNhat
    }

    class PhieuKiemKe {
        +MaKiemKe
        +NgayKiemKe
        +MaKho
        +NguoiThucHien
        +TrangThai
        +KetLuan
    }

    class ChiTietPhieuKiemKe {
        +MaChiTietLo
        +SoLuongHeThong
        +SoLuongThucTe
        +ChenhLech
        +NguyenNhan
    }

    class KetQuaKiemTraQCAC {
        +MaKetQua
        +NgayKiemTra
        +KetQua
        +GhiChu
    }

    class ChiTietKetQuaKiemTraQCAC {
        +MaChiTietLo
        +SoLuongKiemTra
        +SoLuongDat
        +SoLuongLoi
        +TinhTrang
    }

    class BanBaoCaoSanXuat {
        +MaBaoCao
        +MaKeHoachSanXuat
        +MaXuong
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaChiTietBaoCao
        +MaMatHang
        +SoLuong
        +SoLuongCanThiet
        +SoLuongConThieu
        +SoLuongNVLSuDung
    }

    class ChiTietLoBaoCaoSanXuat {
        +MaChiTietLo
        +SoLuong
    }

    class BanDeXuatXuLyNgoaiLe {
        +MaDeXuat
        +NgayDeXuat
        +NoiDung
        +LyDo
        +TrangThai
    }

    class KetQuaXuLyNgoaiLe {
        +MaKetQuaXuLy
        +NgayXuLy
        +KetQua
        +NguoiXuLy
        +GhiChu
    }

    NguoiDung <|-- NhanVien
    NguoiDung <|-- KhachHang

    VaiTro "1" --> "N" NguoiDung : có
    BoPhan "1" --> "N" NhanVien : có

    LoaiHang "1" --> "N" MatHang : phân loại

    KhachHang "1" --> "N" DonHang : đặt
    DonHang "1" --> "N" ChiTietDonHang : gồm
    MatHang "1" --> "N" ChiTietDonHang : xuất hiện trong

    DonHang "1" --> "N" KeHoachSanXuat : phát sinh
    Xuong "1" --> "N" KeHoachSanXuat : thực hiện tại
    KeHoachSanXuat "1" --> "N" ChiTietKeHoachSanXuat : gồm
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : thành phẩm hoặc NVL

    KeHoachSanXuat "1" --> "N" BanBaoCaoSanXuat : đối chiếu thực tế
    BanBaoCaoSanXuat "1" --> "N" KeHoachMuaBan : nguồn lập theo loại báo cáo
    BanBaoCaoSanXuat "1" --> "N" DonMuaHang : căn cứ nhu cầu NVL
    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh
    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

    BanBaoCaoSanXuat "1" --> "N" PhieuYeuCauNhapXuat : căn cứ thực tế
    Xuong "1" --> "N" PhieuYeuCauNhapXuat : yêu cầu bởi
    PhieuYeuCauNhapXuat "1" --> "N" ChiTietPhieuYeuCauNhapXuat : gồm
    MatHang "1" --> "N" ChiTietPhieuYeuCauNhapXuat : yêu cầu
    PhieuYeuCauNhapXuat "1" --> "N" PhieuKho : phát sinh
    Kho "1" --> "N" PhieuKho : thực hiện tại
    PhieuKho "1" --> "N" ChiTietPhieuKho : gồm
    ChiTietLo "1" --> "N" ChiTietPhieuKho : nhập/xuất

    LoHang <|-- LoNguyenVatLieu
    LoHang <|-- LoThanhPham
    LoHang <|-- LoHangTraVe

    LoHang "1" --> "N" ChiTietLo : gồm
    MatHang "1" --> "N" ChiTietLo : thuộc lô

    Kho "1" --> "N" TonKho : theo dõi
    ChiTietLo "1" --> "N" TonKho : tồn theo lô

    Kho "1" --> "N" PhieuKiemKe : được kiểm kê
    PhieuKiemKe "1" --> "N" ChiTietPhieuKiemKe : gồm
    ChiTietLo "1" --> "N" ChiTietPhieuKiemKe : được kiểm kê

    KetQuaKiemTraQCAC "1" --> "N" ChiTietKetQuaKiemTraQCAC : gồm
    ChiTietLo "1" --> "N" ChiTietKetQuaKiemTraQCAC : được kiểm tra

    Xuong "1" --> "N" BanBaoCaoSanXuat : lập báo cáo
    BanBaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    ChiTietBaoCaoSanXuat "1" --> "N" ChiTietLoBaoCaoSanXuat : chia theo lô
    ChiTietLo "1" --> "N" ChiTietLoBaoCaoSanXuat : lô được báo cáo

    BanDeXuatXuLyNgoaiLe "1" --> "N" KetQuaXuLyNgoaiLe : được phê duyệt
    note for ChiTietKeHoachSanXuat "Gồm thành phẩm và NVL dự kiến; NVL cần và còn thiếu nằm ngay trong entity này."
    note for BanBaoCaoSanXuat "SAN_XUAT: căn cứ mua và xuất NVL. THANH_PHAM: căn cứ kế hoạch bán."
    note for KeHoachMuaBan "MUA dùng báo cáo SAN_XUAT; BAN dùng báo cáo THANH_PHAM."
    note for DonMuaHang "Liên kết báo cáo SAN_XUAT; phải khớp báo cáo nguồn của kế hoạch MUA."
    note for PhieuYeuCauNhapXuat "Xuất NVL lấy dữ liệu báo cáo SAN_XUAT; không lấy trực tiếp từ kế hoạch sản xuất."
```
