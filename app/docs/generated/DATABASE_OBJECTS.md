# Đối tượng SQL theo owner

Sinh từ ownership.json và snapshot DDL. TABLE là bảng vật lý; VIEW là đối tượng suy ra/tương thích. Bảng LuuTru giữ lịch sử, không phải entity hoạt động. Các view cùng tên tại owner khác không phải bản sao dữ liệu.

## identity-service — KhoHang_Identity

Tài khoản runtime: `identity_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| NguoiDung | TABLE | `MaBanGhi`, `TenDangNhap`, `MatKhauBam`, `HoTen`, `ThuDienTu`, `TrangThai`, `SoLanDangNhapSai`, `KhoaDen`, `PhienBanPhien`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| VaiTro | TABLE | `MaBanGhi`, `Ma`, `Ten`, `NgayTao`, `NgayCapNhat` |
| NguoiDungVaiTro | TABLE | `MaBanGhi`, `MaNguoiDung`, `MaVaiTro`, `NgayTao`, `NgayCapNhat` |
| NguoiDungXuong | TABLE | `MaBanGhi`, `MaXuong`, `MaNguoiDung`, `NgayTao`, `NgayCapNhat` |
| BoPhan | TABLE | `MaBanGhi`, `Ma`, `Ten`, `MoTa` |
| NhanVien | TABLE | `MaNguoiDung`, `MaNhanVien`, `MaBoPhan`, `ChucVu` |
| LanThuDangNhap | TABLE | `KhoaLanThu`, `BatDauCuaSo`, `SoLan` |

## business-service — KhoHang_Business

Tài khoản runtime: `business_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| KhachHang | TABLE | `MaBanGhi`, `MaNguoiDung`, `Ma`, `Ten`, `SoDienTho`, `DiaChi`, `NgayTao`, `NgayCapNhat` |
| Xuong | TABLE | `MaBanGhi`, `Ma`, `Ten`, `DiaChi`, `ConHoatDong`, `NgayTao`, `NgayCapNhat` |
| NhaCungCap | TABLE | `MaBanGhi`, `Ma`, `Ten`, `SoDienTho`, `ThuDienTu`, `DiaChi`, `MaSoThue`, `ConHoatDong`, `NgayTao`, `NgayCapNhat` |
| LoaiHang | TABLE | `MaBanGhi`, `Ma`, `Ten`, `MoTa`, `ConHoatDong`, `NgayTao`, `NgayCapNhat`, `DuongDanAnh` |
| DonViTinh | TABLE | `MaBanGhi`, `Ma`, `Ten`, `NgayTao`, `NgayCapNhat` |
| MatHang | TABLE | `MaBanGhi`, `MaLoaiHang`, `MaDonViTinh`, `Ma`, `Ten`, `Loai`, `MoTa`, `DonGiaThamKhao`, `LaHangMau`, `DuongDanAnh`, `DaCongBo`, `ConHoatDong`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| DonHang | TABLE | `MaBanGhi`, `Ma`, `MaKhachHang`, `DiaChiGiaoHang`, `NgayGiaoChamNhat`, `GhiChu`, `TrangThai`, `MaNguoiTiepNhan`, `NgayTiepNhan`, `MaNguoiDuyet`, `NgayDuyet`, `LyDoTuChoi`, `TongTienBaoGia`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| ChiTietDonHang | TABLE | `MaBanGhi`, `MaDonHang`, `MaMatHang`, `SoLuong`, `DonGia`, `GhiChu`, `NgayTao`, `NgayCapNhat` |
| KeHoachMuaBan | TABLE | `MaBanGhi`, `Ma`, `Kieu`, `MaNhaCungCap`, `MaKhachHang`, `MaDonHang`, `NgayDuKien`, `GhiChu`, `TrangThai`, `MaNguoiTao`, `MaNguoiDuyet`, `NgayDuyet`, `LyDoTuChoi`, `TongTien`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaYeuCauNguon`, `MaKeHoachSanXuat`, `MaBaoCaoSanXuat`, `MaBaoCaoThanhPham` |
| ChiTietKeHoachMuaBan | TABLE | `MaBanGhi`, `MaKeHoachKinhDoanh`, `MaMatHang`, `SoLuong`, `DonGia`, `NgayTao`, `NgayCapNhat` |
| DonMuaHang | TABLE | `MaBanGhi`, `Ma`, `MaKeHoachKinhDoanh`, `MaNhaCungCap`, `MaNguoiTao`, `NgayGiaoDuKien`, `DieuKhoanGiaoHang`, `TrangThai`, `TongTien`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaBaoCaoSanXuat`, `LoaiNguonDonMua` |
| ChiTietDonMuaHang | TABLE | `MaBanGhi`, `MaDonMuaHang`, `MaChiTietKeHoachKinhDoanh`, `MaMatHang`, `SoLuong`, `DonGia`, `NgayTao`, `NgayCapNhat` |
| KeHoachSanXuat | TABLE | `MaBanGhi`, `Ma`, `MaDonHang`, `MaXuong`, `MaNguoiTao`, `NgayBatDau`, `NgayKetThuc`, `TrangThai`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `GhiChu` |
| ChiTietKeHoachSanXuat | TABLE | `MaBanGhi`, `MaKeHoachSanXuat`, `MaMatHang`, `SoLuong`, `NgayTao`, `NgayCapNhat`, `LoaiChiTiet`, `SoLuongCan`, `SoLuongConThieu`, `MaNguyenLieuCu`, `SoLuongGoc`, `TyLeDuPhong` |
| BanBaoCaoSanXuat | TABLE | `MaBanGhi`, `Ma`, `MaKeHoachSanXuat`, `MaNguoiTao`, `GhiChu`, `TrangThai`, `NgayGui`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `LoaiBaoCao`, `NgayHoanThanh`, `MaThanhPhamCu`, `MucDichBaoCao`, `PhanTramTienDo`, `GuiBoPhanLapKeHoach`, `XacNhanHoanTat` |
| ChiTietBaoCaoSanXuat | TABLE | `MaBanGhi`, `MaBaoCaoSanXuat`, `MaMatHang`, `SoLuongHienCo`, `SoLuongCan`, `NgayTao`, `NgayCapNhat`, `LoaiChiTiet`, `SoLuong`, `SoLuongSuDung` |
| ChiTietLoBaoCaoSanXuat | TABLE | `MaBanGhi`, `MaBaoCaoThanhPham`, `MaChiTietLo`, `SoLuong`, `NgayTao`, `NgayCapNhat`, `MaChiTietBaoCao` |
| BaoCaoSanXuat | VIEW |  |
| BaoCaoThanhPham | VIEW |  |
| ChiTietNhuCauSanXuat | VIEW |  |
| NguyenLieuSuDung | VIEW |  |
| ThanhPhamKeHoachTuongThich | VIEW |  |
| ChiTietNguyenLieuKeHoachSanXuat | VIEW |  |
| LuuTruBaoCaoThanhPhamTruoc012 | TABLE | `MaBanGhi`, `Ma`, `MaKeHoachSanXuat`, `MaNguoiTao`, `NgayHoanThanh`, `GhiChu`, `TrangThai`, `NgayGui`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| LuuTruNguyenLieuKeHoachTruoc009 | TABLE | `MaBanGhi`, `MaKeHoachSanXuat`, `MaMatHang`, `SoLuongCan`, `NgayTao`, `NgayCapNhat` |
| LuuTruNguyenLieuSuDungTruoc012 | TABLE | `MaBanGhi`, `MaBaoCaoThanhPham`, `MaMatHang`, `SoLuongSuDung`, `NgayTao`, `NgayCapNhat` |

## warehouse-service — KhoHang_Warehouse

Tài khoản runtime: `warehouse_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| Kho | TABLE | `MaBanGhi`, `Ma`, `Ten`, `DiaChi`, `ConHoatDong`, `NgayTao`, `NgayCapNhat` |
| ViTriKho | TABLE | `MaBanGhi`, `MaKho`, `Ma`, `Ten`, `ConHoatDong`, `NgayTao`, `NgayCapNhat` |
| LoHang | TABLE | `MaBanGhi`, `Ma`, `LoaiLo`, `NgayTao`, `GhiChu`, `HuongTra`, `TrangThaiTra`, `PhienBanTra`, `MaNguoiNhanTra`, `MaKhoNhanTra`, `MaNguoiLapTra`, `MaKeHoachNhapThanhPham` |
| ChiTietLo | TABLE | `MaBanGhi`, `Ma`, `MaMatHang`, `MaChiTietDonMuaHang`, `MaKeHoachSanXuat`, `NgaySanXuat`, `HanSuDung`, `SoLuongNhan`, `TrangThaiKiemTra`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaLoHang`, `MaYeuCauNhapThanhPham` |
| KetQuaKiemTraQCAC | TABLE | `MaBanGhi`, `Ma`, `MaNguoiKiemTra`, `NgayKiemTra`, `GhiChu`, `TrangThai`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaLichKiemTra` |
| ChiTietKetQuaKiemTraQCAC | TABLE | `MaBanGhi`, `MaPhieuKiemTraChatLuong`, `MaChiTietLo`, `SoLuongKiemTra`, `SoLuongDat`, `SoLuongLoi`, `Loi`, `NgayTao`, `NgayCapNhat` |
| PhieuYeuCauNhapXuat | TABLE | `MaBanGhi`, `Ma`, `Kieu`, `PhuongThuc`, `MaDonMuaHang`, `MaKeHoachKinhDoanh`, `MaKeHoachSanXuat`, `MaXuong`, `MaKho`, `MaNguoiTao`, `NgayYeuCau`, `TrangThai`, `GhiChu`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaBaoCaoSanXuat`, `MaNguoiPhuTrach`, `LoaiNguonSanXuat` |
| ChiTietPhieuYeuCauNhapXuat | TABLE | `MaBanGhi`, `MaYeuCauKho`, `MaMatHang`, `SoLuong`, `GhiChu`, `NgayTao`, `NgayCapNhat` |
| PhieuKho | TABLE | `MaBanGhi`, `Ma`, `Kieu`, `MaYeuCauKho`, `MaKho`, `MaNguoiGhiSo`, `NgayGhiSo`, `TrangThai`, `GhiChu`, `KhoaChongLap`, `NgayTao`, `NgayCapNhat`, `MaCongViec`, `MaLoTraVe` |
| ChiTietPhieuKho | TABLE | `MaBanGhi`, `MaPhieuKho`, `MaChiTietYeuCauKho`, `MaChiTietLo`, `MaViTriKho`, `NhomChatLuong`, `SoLuong`, `LyDoChenhLech`, `NgayTao`, `NgayCapNhat`, `MaPhanCongKho`, `MaChiTietTraVe` |
| TonKho | TABLE | `MaBanGhi`, `MaChiTietLo`, `MaViTriKho`, `NhomChatLuong`, `SoLuong`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| BienDongKho | TABLE | `MaBanGhi`, `MaChiTietLo`, `MaViTriKho`, `NhomChatLuong`, `BienDongSoLuong`, `MaChiTietPhieuKho`, `MaDeXuatXuLy`, `MaChiTietKiemKe`, `NgayGhiSo`, `MaNguoiTao`, `KhoaNghiepVu`, `NgayTao`, `NgayCapNhat` |
| DotKiemKe | TABLE | `MaBanGhi`, `Ma`, `MaNguoiTao`, `NgayDuKien`, `BatDauLuc`, `KetThucLuc`, `LoaiMatHang`, `TrangThai`, `GhiChu`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `LoaiDot`, `LoaiKiemTra`, `DiaDiem` |
| PhieuKiemKe | TABLE | `MaBanGhi`, `MaDotKiemKe`, `MaKho`, `TrangThai`, `NgayChotSo`, `NgayHoanTat`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `NhanXet`, `TrangThaiBienBan`, `NgayGui`, `MaNguoiTao` |
| PhanCongKiemKe | TABLE | `MaBanGhi`, `MaKhoKiemKe`, `MaNguoiDung`, `NgayTao`, `NgayCapNhat` |
| ChiTietPhieuKiemKe | TABLE | `MaBanGhi`, `MaKhoKiemKe`, `MaChiTietLo`, `MaViTriKho`, `NhomChatLuong`, `SoLuongHeThong`, `SoLuongThucTe`, `MaNguoiDem`, `NgayDem`, `NguyenNhan`, `TrangThaiXuLy`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| BienBanKiemKe | VIEW |  |
| PhanCongKetLuanKiemKe | TABLE | `MaBanGhi`, `MaPhieuKiemKe`, `MaNguoiDung` |
| BanDeXuatXuLyNgoaiLe | TABLE | `MaBanGhi`, `Ma`, `Kieu`, `MaChiTietKiemTraChatLuong`, `MaChiTietKiemKe`, `MaNguoiTao`, `HanhDong`, `SoLuong`, `LyDo`, `GhiChuXuLy`, `TrangThai`, `MaNguoiDuyet`, `NgayDuyet`, `LyDoTuChoi`, `NgayApDung`, `PhienBan`, `NgayTao`, `NgayCapNhat` |
| KetQuaXuLyNgoaiLe | TABLE | `MaBanGhi`, `MaDeXuatXuLy`, `PhienBanDeXuat`, `QuyetDinh`, `MaNguoiDuyet`, `LyDo`, `NgayDuyet` |
| PhanBoXuLy | TABLE | `MaBanGhi`, `MaDeXuatXuLy`, `MaViTriKho`, `SoLuong`, `NgayTao`, `NgayCapNhat` |
| ChiTietLoTraVe | TABLE | `MaBanGhi`, `MaLoHang`, `MaChiTietLoGoc`, `SoLuong`, `MaDeXuatXuLy`, `NgayTao`, `MaChiTietKiemTraChatLuong`, `MaChiTietPhieuXuat`, `MaChiTietLoNhan`, `MaViTriNhan` |
| ChungTuBuQC | TABLE | `MaBanGhi`, `MaKetQuaKiemTra`, `PhienBanGoc`, `MaNguoiTao`, `LyDo`, `DuLieuTruoc`, `DuLieuSau`, `NgayTao` |
| TaiKiemChatLuong | TABLE | `MaBanGhi`, `MaDeXuatXuLy`, `PhienBanDeXuat`, `MaNguoiKiemTra`, `SoLuong`, `KetLuan`, `GhiChu`, `NgayTao` |
| CongViec | TABLE | `MaBanGhi`, `Ma`, `TieuDe`, `MoTa`, `BatDauLuc`, `KetThucLuc`, `MucDoUuTien`, `TrangThai`, `MaDotKiemKe`, `MaDonMuaHang`, `MaNguoiTao`, `PhienBan`, `NgayTao`, `NgayCapNhat`, `MaYeuCauKho`, `LoaiCongViec`, `MaNguoiPhuTrach` |
| PhanCongCongViec | TABLE | `MaBanGhi`, `MaCongViec`, `MaNguoiDung`, `NgayTao`, `NgayCapNhat` |
| LoLichKiemTra | TABLE | `MaBanGhi`, `MaLichKiemTra`, `MaChiTietLo`, `NgayTao`, `NgayCapNhat` |
| PhanCongLichKiemTra | TABLE | `MaBanGhi`, `MaLichKiemTra`, `MaNguoiDung`, `NgayTao`, `NgayCapNhat` |
| PhanCongKho | TABLE | `MaBanGhi`, `MaYeuCauKho`, `MaCongViec`, `MaChiTietYeuCauKho`, `MaNguoiDung`, `MaChiTietLo`, `MaViTriKho`, `NhomChatLuong`, `SoLuong`, `SoLuongDaGhi`, `NgayTao`, `NgayCapNhat` |
| YeuCauChongLap | TABLE | `MaBanGhi`, `MaNguoiDung`, `ThaoTac`, `KhoaChongLap`, `MaBamYeuCau`, `MaPhanHoi`, `NoiDungPhanHoi`, `HetHanLuc`, `NgayTao`, `NgayCapNhat` |
| NhatKyHeThong | TABLE | `MaBanGhi`, `MaNguoiThucHien`, `LoaiTaiNguyen`, `MaTaiNguyen`, `HanhDong`, `DuLieuTruoc`, `DuLieuSau`, `MaYeuCau`, `NgayTao`, `NgayCapNhat` |
| LuuTruBienBanKiemKeTruoc015 | TABLE | `MaBanGhi`, `Ma`, `MaKhoKiemKe`, `MaNguoiTao`, `TrangThai`, `NhanXet`, `NgayGui`, `PhienBan`, `NgayTao`, `NgayCapNhat` |

## notification-service — KhoHang_Notification

Tài khoản runtime: `notification_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| ThongBao | TABLE | `MaBanGhi`, `MaNguoiDung`, `TieuDeThongBao`, `NoiDung`, `LoaiTaiNguyen`, `MaTaiNguyen`, `NgayDoc`, `KhoaThongBao`, `NgayTao`, `NgayCapNhat` |

## reporting-service — KhoHang_Reporting

Tài khoản runtime: `reporting_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| HoSoKho | VIEW |  |
| LuuTruHoSoKhoTruoc013 | TABLE | `MaBanGhi`, `MaYeuCauKho`, `MaNguoiPhuTrach`, `GhiChu`, `NgayTao`, `NgayCapNhat` |

## web-gateway — KhoHang_Gateway

Tài khoản runtime: `gateway_db`.

| Đối tượng | Loại | Cột vật lý |
| --- | --- | --- |
| PhienDangNhap | TABLE | `MaPhien`, `HetHanLuc`, `DuLieu` |
