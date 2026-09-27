### Domain Model

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
        +MaMatHang
        +SoLuong
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
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : sản xuất

```

6. Nhóm Kế hoạch mua / bán và Đơn mua hàng

```mermaid
classDiagram

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +NgayLap
        +LoaiKeHoach
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

    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh

    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

```

7. Nhóm Yêu cầu và Phiếu nhập / xuất kho

```mermaid
classDiagram

    class YeuCauNhapXuat {
        +MaYeuCau
        +LoaiYeuCau
        +NgayYeuCau
        +NgayThucHienDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietYeuCauNhapXuat {
        +MaMatHang
        +SoLuong
        +GhiChu
    }

    class PhieuKho {
        +MaPhieu
        +LoaiPhieu
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuKho {
        +MaMatHang
        +MaLo
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

    YeuCauNhapXuat "1" --> "N" ChiTietYeuCauNhapXuat : gồm
    MatHang "1" --> "N" ChiTietYeuCauNhapXuat : yêu cầu

    YeuCauNhapXuat "1" --> "N" PhieuKho : phát sinh
    PhieuKho "1" --> "N" ChiTietPhieuKho : gồm
    MatHang "1" --> "N" ChiTietPhieuKho : nhập/xuất
    LoHang "1" --> "N" ChiTietPhieuKho : thuộc lô

    note for YeuCauNhapXuat "LoaiYeuCau: Nhập kho / Xuất kho"
    note for PhieuKho "LoaiPhieu: Phiếu nhập / Phiếu xuất"

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

    class TonKho {
        +MaTonKho
        +SoLuongTon
        +MucTonToiThieu
        +NgayCapNhat
    }

    Kho "1" --> "N" TonKho : theo dõi
    MatHang "1" --> "N" TonKho : tồn
    LoHang "1" --> "N" TonKho : theo lô

    note for Kho "LoaiKho: Kho NVL / Kho thành phẩm / Kho hàng trả về"

```

10. Nhóm Kiểm kê

```mermaid
classDiagram

    class KiemKe {
        +MaKiemKe
        +NgayKiemKe
        +MaKho
        +NguoiThucHien
        +TrangThai
        +KetLuan
        +GhiChu
    }

    class ChiTietKiemKe {
        +MaMatHang
        +MaLo
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

    Kho "1" --> "N" KiemKe : được kiểm kê
    KiemKe "1" --> "N" ChiTietKiemKe : gồm
    MatHang "1" --> "N" ChiTietKiemKe : kiểm kê
    LoHang "1" --> "N" ChiTietKiemKe : theo lô

```

11. Nhóm Kiểm tra QC/AC

```mermaid
classDiagram

    class KetQuaKiemTraQCAC {
        +MaKetQua
        +MaLo
        +NgayKiemTra
        +KetQua
        +GhiChu
    }

    class ChiTietKetQuaKiemTraQCAC {
        +MaMatHang
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

    LoHang "1" --> "N" KetQuaKiemTraQCAC : được kiểm tra
    KetQuaKiemTraQCAC "1" --> "N" ChiTietKetQuaKiemTraQCAC : gồm
    MatHang "1" --> "N" ChiTietKetQuaKiemTraQCAC : kiểm tra

```

12. Nhóm Báo cáo sản xuất / Thành phẩm

```mermaid
classDiagram

    class BaoCaoSanXuat {
        +MaBaoCao
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaMatHang
        +MaLo
        +SoLuong
        +SoLuongCanThiet
        +SoLuongNVLSuDung
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

    class LoThanhPham {
        +NgaySanXuat
        +NgayXuat
    }

    BaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    LoThanhPham "1" --> "N" ChiTietBaoCaoSanXuat : thành phẩm

    note for BaoCaoSanXuat "LoaiBaoCao: Báo cáo sản xuất / Báo cáo thành phẩm"

```

13. Nhóm Xử lý ngoại lệ

```mermaid
classDiagram

    class DeXuatXuLyNgoaiLe {
        +MaDeXuat
        +NgayDeXuat
        +NoiDung
        +LyDo
        +TrangThai
        +GhiChu
    }

    class PheDuyetXuLyNgoaiLe {
        +MaPheDuyet
        +NgayPheDuyet
        +KetQua
        +NguoiPheDuyet
        +GhiChu
    }

    DeXuatXuLyNgoaiLe "1" --> "N" PheDuyetXuLyNgoaiLe : được phê duyệt

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
        +MaMatHang
        +SoLuong
    }

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +NgayLap
        +LoaiKeHoach
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

    class YeuCauNhapXuat {
        +MaYeuCau
        +LoaiYeuCau
        +NgayYeuCau
        +NgayThucHienDuKien
        +TrangThai
        +GhiChu
    }

    class ChiTietYeuCauNhapXuat {
        +MaMatHang
        +SoLuong
        +GhiChu
    }

    class PhieuKho {
        +MaPhieu
        +LoaiPhieu
        +NgayLap
        +TrangThai
        +GhiChu
    }

    class ChiTietPhieuKho {
        +MaMatHang
        +MaLo
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
        +SoLuongTon
        +MucTonToiThieu
        +NgayCapNhat
    }

    class KiemKe {
        +MaKiemKe
        +NgayKiemKe
        +MaKho
        +NguoiThucHien
        +TrangThai
        +KetLuan
    }

    class ChiTietKiemKe {
        +MaMatHang
        +MaLo
        +SoLuongHeThong
        +SoLuongThucTe
        +ChenhLech
        +NguyenNhan
    }

    class KetQuaKiemTraQCAC {
        +MaKetQua
        +MaLo
        +NgayKiemTra
        +KetQua
        +GhiChu
    }

    class ChiTietKetQuaKiemTraQCAC {
        +MaMatHang
        +SoLuongKiemTra
        +SoLuongDat
        +SoLuongLoi
        +TinhTrang
    }

    class BaoCaoSanXuat {
        +MaBaoCao
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaMatHang
        +MaLo
        +SoLuong
        +SoLuongCanThiet
        +SoLuongNVLSuDung
    }

    class DeXuatXuLyNgoaiLe {
        +MaDeXuat
        +NgayDeXuat
        +NoiDung
        +LyDo
        +TrangThai
    }

    class PheDuyetXuLyNgoaiLe {
        +MaPheDuyet
        +NgayPheDuyet
        +KetQua
        +NguoiPheDuyet
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
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : sản xuất

    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh
    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

    YeuCauNhapXuat "1" --> "N" ChiTietYeuCauNhapXuat : gồm
    MatHang "1" --> "N" ChiTietYeuCauNhapXuat : yêu cầu

    YeuCauNhapXuat "1" --> "N" PhieuKho : phát sinh
    PhieuKho "1" --> "N" ChiTietPhieuKho : gồm
    MatHang "1" --> "N" ChiTietPhieuKho : nhập/xuất
    LoHang "1" --> "N" ChiTietPhieuKho : thuộc lô

    LoHang <|-- LoNguyenVatLieu
    LoHang <|-- LoThanhPham
    LoHang <|-- LoHangTraVe

    LoHang "1" --> "N" ChiTietLo : gồm
    MatHang "1" --> "N" ChiTietLo : thuộc lô

    Kho "1" --> "N" TonKho : theo dõi
    MatHang "1" --> "N" TonKho : tồn
    LoHang "1" --> "N" TonKho : theo lô

    Kho "1" --> "N" KiemKe : kiểm kê
    KiemKe "1" --> "N" ChiTietKiemKe : gồm
    MatHang "1" --> "N" ChiTietKiemKe : kiểm kê
    LoHang "1" --> "N" ChiTietKiemKe : theo lô

    LoHang "1" --> "N" KetQuaKiemTraQCAC : kiểm tra
    KetQuaKiemTraQCAC "1" --> "N" ChiTietKetQuaKiemTraQCAC : gồm
    MatHang "1" --> "N" ChiTietKetQuaKiemTraQCAC : kiểm tra

    BaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    LoHang "1" --> "N" ChiTietBaoCaoSanXuat : liên quan

    DeXuatXuLyNgoaiLe "1" --> "N" PheDuyetXuLyNgoaiLe : được phê duyệt
```
