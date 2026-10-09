### Domain Model

> **Quy ước chung**
> - Số lượng cần thiết (kế hoạch, báo cáo) tính theo **mặt hàng**, kèm đơn vị tính của mặt hàng. Ví dụ: 10 kg đường.
> - **Lô chỉ là thông tin chi tiết đi kèm** khi thực tế phát sinh. Ví dụ: 4 kg đường lô A + 6 kg đường lô B.
> - Chuỗi quan hệ của lô: **Mặt hàng → Chi tiết lô ← Lô hàng**. Mọi bảng chi tiết, tồn kho hay phiếu liên quan đến lô đều tham chiếu `MaChiTietLo`.

---

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

    class ChiTietNguyenLieuKeHoachSanXuat {
        +MaMatHang
        +SoLuongCanThiet
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
    KeHoachSanXuat "1" --> "N" ChiTietNguyenLieuKeHoachSanXuat : cần nguyên liệu
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : sản xuất
    MatHang "1" --> "N" ChiTietNguyenLieuKeHoachSanXuat : là nguyên liệu

    note for ChiTietKeHoachSanXuat "MaMatHang: thành phẩm cần sản xuất"
    note for ChiTietNguyenLieuKeHoachSanXuat "Nguyên vật liệu cần theo mặt hàng, đơn vị tính lấy từ MatHang. Ví dụ: 10 kg đường (chưa gắn lô)"

```

6. Nhóm Kế hoạch mua / bán và Đơn mua hàng

Kế hoạch mua được phát sinh từ Kế hoạch sản xuất, không phụ thuộc vào khách hàng hay đơn hàng.

```mermaid
classDiagram

    class KeHoachSanXuat {
        +MaKeHoachSanXuat
        +NgayLap
        +TrangThai
    }

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +MaKeHoachSanXuat
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

    KeHoachSanXuat "1" --> "N" KeHoachMuaBan : phát sinh
    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh

    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

    note for ChiTietKeHoachMuaBan "Danh sách nguyên vật liệu lấy từ chi tiết nguyên liệu của Kế hoạch sản xuất"

```

7. Nhóm Phiếu yêu cầu xuất/nhập và Phiếu kho

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
        +MaKeHoachSanXuat
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

    KeHoachSanXuat "1" --> "N" PhieuYeuCauNhapXuat : phát sinh
    Xuong "1" --> "N" PhieuYeuCauNhapXuat : yêu cầu bởi
    PhieuYeuCauNhapXuat "1" --> "N" ChiTietPhieuYeuCauNhapXuat : gồm
    MatHang "1" --> "N" ChiTietPhieuYeuCauNhapXuat : yêu cầu

    PhieuYeuCauNhapXuat "1" --> "N" PhieuKho : phát sinh
    Kho "1" --> "N" PhieuKho : thực hiện tại
    PhieuKho "1" --> "N" ChiTietPhieuKho : gồm

    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietPhieuKho : nhập/xuất

    note for PhieuYeuCauNhapXuat "LoaiYeuCau: Xuất nguyên vật liệu / Nhập thành phẩm. Liên kết Kế hoạch sản xuất và Xưởng áp dụng cho 2 loại này"
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

    class BaoCaoSanXuat {
        +MaBaoCao
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaChiTietBaoCao
        +MaMatHang
        +SoLuong
        +SoLuongCanThiet
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

    BaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    ChiTietBaoCaoSanXuat "1" --> "N" ChiTietLoBaoCaoSanXuat : chia theo lô

    MatHang "1" --> "N" ChiTietLo : thuộc lô
    LoHang "1" --> "N" ChiTietLo : gồm
    ChiTietLo "1" --> "N" ChiTietLoBaoCaoSanXuat : lô được báo cáo

    note for BaoCaoSanXuat "LoaiBaoCao: Báo cáo sản xuất / Báo cáo thành phẩm"
    note for ChiTietBaoCaoSanXuat "SoLuongCanThiet, SoLuongNVLSuDung tính theo mặt hàng + đơn vị tính. Ví dụ: cần 10 kg đường"
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
        +MaMatHang
        +SoLuong
    }

    class ChiTietNguyenLieuKeHoachSanXuat {
        +MaMatHang
        +SoLuongCanThiet
        +GhiChu
    }

    class KeHoachMuaBan {
        +MaKeHoachMuaBan
        +MaKeHoachSanXuat
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
        +MaKeHoachSanXuat
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

    class BaoCaoSanXuat {
        +MaBaoCao
        +NgayLap
        +LoaiBaoCao
        +GhiChu
    }

    class ChiTietBaoCaoSanXuat {
        +MaChiTietBaoCao
        +MaMatHang
        +SoLuong
        +SoLuongCanThiet
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
    MatHang "1" --> "N" ChiTietKeHoachSanXuat : sản xuất
    KeHoachSanXuat "1" --> "N" ChiTietNguyenLieuKeHoachSanXuat : cần nguyên liệu
    MatHang "1" --> "N" ChiTietNguyenLieuKeHoachSanXuat : là nguyên liệu

    KeHoachSanXuat "1" --> "N" KeHoachMuaBan : phát sinh
    KeHoachMuaBan "1" --> "N" ChiTietKeHoachMuaBan : gồm
    MatHang "1" --> "N" ChiTietKeHoachMuaBan : kế hoạch
    KeHoachMuaBan "1" --> "N" DonMuaHang : phát sinh
    NhaCungCap "1" --> "N" DonMuaHang : cung cấp
    DonMuaHang "1" --> "N" ChiTietDonMuaHang : gồm
    MatHang "1" --> "N" ChiTietDonMuaHang : mua

    KeHoachSanXuat "1" --> "N" PhieuYeuCauNhapXuat : phát sinh
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

    BaoCaoSanXuat "1" --> "N" ChiTietBaoCaoSanXuat : gồm
    MatHang "1" --> "N" ChiTietBaoCaoSanXuat : báo cáo
    ChiTietBaoCaoSanXuat "1" --> "N" ChiTietLoBaoCaoSanXuat : chia theo lô
    ChiTietLo "1" --> "N" ChiTietLoBaoCaoSanXuat : lô được báo cáo

    DeXuatXuLyNgoaiLe "1" --> "N" PheDuyetXuLyNgoaiLe : được phê duyệt
```
