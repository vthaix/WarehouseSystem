-- Single database; Vietnamese SQL identifiers.
-- statement-end
SET FOREIGN_KEY_CHECKS=0;
-- statement-end
CREATE TABLE `NguoiDung` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MatKhauBam` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `HoTen` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ThuDienTu` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLanDangNhapSai` int NOT NULL,
  `KhoaDen` datetime(6) DEFAULT NULL,
  `PhienBanPhien` int NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `DaXoa` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_NguoiDung_1` (`TenDangNhap`),
  UNIQUE KEY `DuyNhat_NguoiDung_2` (`ThuDienTu`),
  CONSTRAINT `NguoiDung_chk_1` CHECK ((`TrangThai` in (_utf8mb4'ACTIVE',_utf8mb4'LOCKED'))),
  CONSTRAINT `NguoiDung_chk_2` CHECK ((`SoLanDangNhapSai` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `VaiTro` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_VaiTro_1` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `NguoiDungVaiTro` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `MaVaiTro` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_NguoiDungVaiTro_1` (`MaNguoiDung`,`MaVaiTro`),
  KEY `KhoaNgoai_NguoiDungVaiTro_MaVaiTro` (`MaVaiTro`),
  CONSTRAINT `KhoaNgoai_NguoiDungVaiTro_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_NguoiDungVaiTro_MaVaiTro` FOREIGN KEY (`MaVaiTro`) REFERENCES `VaiTro` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `NguoiDungXuong` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaXuong` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_NguoiDungXuong_1` (`MaXuong`,`MaNguoiDung`),
  KEY `KhoaNgoai_NguoiDungXuong_MaNguoiDung` (`MaNguoiDung`),
  CONSTRAINT `KhoaNgoai_NguoiDungXuong_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_NguoiDungXuong_MaXuong` FOREIGN KEY (`MaXuong`) REFERENCES `Xuong` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `BoPhan` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `Ma` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `NhanVien` (
  `MaNguoiDung` bigint unsigned NOT NULL,
  `MaNhanVien` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaBoPhan` bigint unsigned DEFAULT NULL,
  `ChucVu` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaNguoiDung`),
  UNIQUE KEY `MaNhanVien` (`MaNhanVien`),
  KEY `FK_NhanVien_BoPhan` (`MaBoPhan`),
  CONSTRAINT `FK_NhanVien_BoPhan` FOREIGN KEY (`MaBoPhan`) REFERENCES `BoPhan` (`MaBanGhi`),
  CONSTRAINT `FK_NhanVien_NguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `LanThuDangNhap` (
  `KhoaLanThu` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BatDauCuaSo` bigint unsigned NOT NULL,
  `SoLan` int unsigned NOT NULL,
  PRIMARY KEY (`KhoaLanThu`),
  KEY `ChiMuc_LanThuDangNhap_BatDauCuaSo` (`BatDauCuaSo`),
  CONSTRAINT `LanThuDangNhap_chk_1` CHECK ((`SoLan` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `KhachHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoDienTho` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_KhachHang_1` (`MaNguoiDung`),
  UNIQUE KEY `DuyNhat_KhachHang_2` (`Ma`),
  CONSTRAINT `KhoaNgoai_KhachHang_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `Xuong` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DiaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ConHoatDong` tinyint(1) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_Xuong_1` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `NhaCungCap` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoDienTho` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ThuDienTu` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MaSoThue` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ConHoatDong` tinyint(1) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_NhaCungCap_1` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `LoaiHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  `ConHoatDong` tinyint(1) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `DuongDanAnh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LoaiDanhMuc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_LoaiHang_1` (`Ma`),
  UNIQUE KEY `DuyNhat_LoaiHang_2` (`Ten`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `DonViTinh` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_DonViTinh_1` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `MatHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaLoaiHang` bigint unsigned NOT NULL,
  `MaDonViTinh` bigint unsigned NOT NULL,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Loai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  `DonGiaThamKhao` decimal(19,4) NOT NULL,
  `LaHangMau` tinyint(1) NOT NULL,
  `DuongDanAnh` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DaCongBo` tinyint(1) NOT NULL,
  `ConHoatDong` tinyint(1) NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `BangGiaNCC` json DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_MatHang_1` (`Ma`),
  UNIQUE KEY `DuyNhat_MatHang_2` (`MaLoaiHang`,`Ten`),
  KEY `KhoaNgoai_MatHang_MaDonViTinh` (`MaDonViTinh`),
  CONSTRAINT `KhoaNgoai_MatHang_MaDonViTinh` FOREIGN KEY (`MaDonViTinh`) REFERENCES `DonViTinh` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_MatHang_MaLoaiHang` FOREIGN KEY (`MaLoaiHang`) REFERENCES `LoaiHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `MatHang_chk_1` CHECK ((`Loai` in (_utf8mb4'MATERIAL',_utf8mb4'FINISHED_PRODUCT'))),
  CONSTRAINT `MatHang_chk_2` CHECK ((`DonGiaThamKhao` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `DonHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaKhachHang` bigint unsigned NOT NULL,
  `DiaChiGiaoHang` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayGiaoChamNhat` date NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiTiepNhan` bigint unsigned DEFAULT NULL,
  `NgayTiepNhan` datetime(6) DEFAULT NULL,
  `MaNguoiDuyet` bigint unsigned DEFAULT NULL,
  `NgayDuyet` datetime(6) DEFAULT NULL,
  `LyDoTuChoi` text COLLATE utf8mb4_unicode_ci,
  `TongTienBaoGia` decimal(19,4) NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_DonHang_1` (`Ma`),
  KEY `ChiMuc_DonHang_1` (`MaKhachHang`,`TrangThai`,`NgayTao`),
  KEY `ChiMuc_DonHang_2` (`TrangThai`,`NgayTao`),
  KEY `KhoaNgoai_DonHang_MaNguoiDuyet` (`MaNguoiDuyet`),
  KEY `KhoaNgoai_DonHang_MaNguoiTiepNhan` (`MaNguoiTiepNhan`),
  CONSTRAINT `KhoaNgoai_DonHang_MaKhachHang` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DonHang_MaNguoiDuyet` FOREIGN KEY (`MaNguoiDuyet`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DonHang_MaNguoiTiepNhan` FOREIGN KEY (`MaNguoiTiepNhan`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `DonHang_chk_1` CHECK ((`TrangThai` in (_utf8mb4'SUBMITTED',_utf8mb4'RECEIVED',_utf8mb4'APPROVED',_utf8mb4'REJECTED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED'))),
  CONSTRAINT `DonHang_chk_2` CHECK ((`TongTienBaoGia` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietDonHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDonHang` bigint unsigned NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `DonGia` decimal(19,4) NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietDonHang_1` (`MaDonHang`,`MaMatHang`),
  KEY `KhoaNgoai_ChiTietDonHang_MaMatHang` (`MaMatHang`),
  CONSTRAINT `KhoaNgoai_ChiTietDonHang_MaDonHang` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietDonHang_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietDonHang_chk_1` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `ChiTietDonHang_chk_2` CHECK ((`DonGia` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `KeHoachMuaBan` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Kieu` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNhaCungCap` bigint unsigned DEFAULT NULL,
  `MaKhachHang` bigint unsigned DEFAULT NULL,
  `MaDonHang` bigint unsigned DEFAULT NULL,
  `NgayDuKien` date NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `MaNguoiDuyet` bigint unsigned DEFAULT NULL,
  `NgayDuyet` datetime(6) DEFAULT NULL,
  `LyDoTuChoi` text COLLATE utf8mb4_unicode_ci,
  `TongTien` decimal(19,4) NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaYeuCauNguon` bigint unsigned DEFAULT NULL,
  `MaKeHoachSanXuat` bigint unsigned DEFAULT NULL,
  `MaBaoCaoSanXuat` bigint unsigned DEFAULT NULL,
  `MaBaoCaoThanhPham` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_KeHoachKinhDoanh_1` (`Ma`),
  KEY `ChiMuc_KeHoachKinhDoanh_1` (`Kieu`,`TrangThai`,`NgayDuKien`),
  KEY `ChiMuc_KeHoachMuaBan_SanXuat` (`MaKeHoachSanXuat`,`TrangThai`),
  KEY `IX_KeHoachMuaBan_BaoCaoSanXuat` (`MaBaoCaoSanXuat`,`Kieu`,`TrangThai`),
  KEY `FK_KeHoachMuaBan_ThanhPham` (`MaBaoCaoThanhPham`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_MaDonHang` (`MaDonHang`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_MaKhachHang` (`MaKhachHang`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_MaNguoiDuyet` (`MaNguoiDuyet`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_MaNguoiTao` (`MaNguoiTao`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_MaNhaCungCap` (`MaNhaCungCap`),
  KEY `KhoaNgoai_KeHoachKinhDoanh_YeuCauNguon` (`MaYeuCauNguon`),
  CONSTRAINT `FK_KeHoachMuaBan_BaoCaoSanXuat` FOREIGN KEY (`MaBaoCaoSanXuat`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`),
  CONSTRAINT `FK_KeHoachMuaBan_ThanhPham` FOREIGN KEY (`MaBaoCaoThanhPham`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_MaDonHang` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_MaKhachHang` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_MaNguoiDuyet` FOREIGN KEY (`MaNguoiDuyet`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_MaNhaCungCap` FOREIGN KEY (`MaNhaCungCap`) REFERENCES `NhaCungCap` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachKinhDoanh_YeuCauNguon` FOREIGN KEY (`MaYeuCauNguon`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachMuaBan_SanXuat` FOREIGN KEY (`MaKeHoachSanXuat`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `CK_KeHoach_DoiTac008` CHECK ((((`Kieu` = _utf8mb4'PURCHASE') and (`MaKhachHang` is null) and (`MaDonHang` is null)) or ((`Kieu` = _utf8mb4'SALE') and (`MaNhaCungCap` is null) and (`MaKhachHang` is not null) and (`MaDonHang` is not null)))),
  CONSTRAINT `KeHoachMuaBan_chk_1` CHECK ((((`Kieu` = _utf8mb4'PURCHASE') and (`MaBaoCaoThanhPham` is null)) or ((`Kieu` = _utf8mb4'SALE') and (`MaBaoCaoSanXuat` is null)))),
  CONSTRAINT `KeHoachMuaBan_chk_2` CHECK ((`Kieu` in (_utf8mb4'PURCHASE',_utf8mb4'SALE'))),
  CONSTRAINT `KeHoachMuaBan_chk_3` CHECK ((`TrangThai` in (_utf8mb4'PENDING_APPROVAL',_utf8mb4'APPROVED',_utf8mb4'REJECTED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `KeHoachMuaBan_chk_4` CHECK ((`TongTien` >= 0)),
  CONSTRAINT `KeHoachMuaBan_chk_6` CHECK (((`Kieu` = _utf8mb4'PURCHASE') or ((`MaKeHoachSanXuat` is null) and (`MaYeuCauNguon` is null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietKeHoachMuaBan` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKeHoachKinhDoanh` bigint unsigned NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `DonGia` decimal(19,4) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietKeHoachKinhDoanh_1` (`MaKeHoachKinhDoanh`,`MaMatHang`),
  KEY `KhoaNgoai_ChiTietKeHoachKinhDoanh_MaMatHang` (`MaMatHang`),
  CONSTRAINT `KhoaNgoai_ChiTietKeHoachKinhDoanh_MaKeHoachKinhDoanh` FOREIGN KEY (`MaKeHoachKinhDoanh`) REFERENCES `KeHoachMuaBan` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietKeHoachKinhDoanh_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietKeHoachMuaBan_chk_1` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `ChiTietKeHoachMuaBan_chk_2` CHECK ((`DonGia` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `DonMuaHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaKeHoachKinhDoanh` bigint unsigned DEFAULT NULL,
  `MaNhaCungCap` bigint unsigned DEFAULT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `NgayGiaoDuKien` date NOT NULL,
  `DieuKhoanGiaoHang` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TongTien` decimal(19,4) NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaBaoCaoSanXuat` bigint unsigned DEFAULT NULL,
  `LoaiNguonDonMua` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLAN',
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_DonMuaHang_1` (`Ma`),
  UNIQUE KEY `DuyNhat_DonMuaHang_2` (`MaKeHoachKinhDoanh`),
  KEY `FK_DonMuaHang_BaoCaoSanXuat` (`MaBaoCaoSanXuat`),
  KEY `KhoaNgoai_DonMuaHang_MaNguoiTao` (`MaNguoiTao`),
  KEY `KhoaNgoai_DonMuaHang_MaNhaCungCap` (`MaNhaCungCap`),
  CONSTRAINT `FK_DonMuaHang_BaoCaoSanXuat` FOREIGN KEY (`MaBaoCaoSanXuat`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_DonMuaHang_MaKeHoachKinhDoanh` FOREIGN KEY (`MaKeHoachKinhDoanh`) REFERENCES `KeHoachMuaBan` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DonMuaHang_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DonMuaHang_MaNhaCungCap` FOREIGN KEY (`MaNhaCungCap`) REFERENCES `NhaCungCap` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `DonMuaHang_chk_1` CHECK ((((`LoaiNguonDonMua` = _utf8mb4'PLAN') and (`MaKeHoachKinhDoanh` is not null)) or ((`LoaiNguonDonMua` = _utf8mb4'REPORT') and (`MaKeHoachKinhDoanh` is null) and (`MaBaoCaoSanXuat` is not null)) or ((`LoaiNguonDonMua` = _utf8mb4'MANUAL') and (`MaKeHoachKinhDoanh` is null) and (`MaBaoCaoSanXuat` is null)))),
  CONSTRAINT `DonMuaHang_chk_2` CHECK ((`TrangThai` in (_utf8mb4'PENDING',_utf8mb4'PARTIALLY_RECEIVED',_utf8mb4'RECEIVED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `DonMuaHang_chk_3` CHECK ((`TongTien` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietDonMuaHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDonMuaHang` bigint unsigned NOT NULL,
  `MaChiTietKeHoachKinhDoanh` bigint unsigned DEFAULT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `DonGia` decimal(19,4) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaNhaCungCap` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietDonMuaHang_1` (`MaDonMuaHang`,`MaMatHang`),
  KEY `KhoaNgoai_ChiTietDonMuaHang_MaChiTietKeHoachKinhDoanh` (`MaChiTietKeHoachKinhDoanh`),
  KEY `KhoaNgoai_ChiTietDonMuaHang_MaMatHang` (`MaMatHang`),
  KEY `FK_ChiTietDonMua_NCC008` (`MaNhaCungCap`),
  CONSTRAINT `FK_ChiTietDonMua_NCC008` FOREIGN KEY (`MaNhaCungCap`) REFERENCES `NhaCungCap` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_ChiTietDonMuaHang_MaChiTietKeHoachKinhDoanh` FOREIGN KEY (`MaChiTietKeHoachKinhDoanh`) REFERENCES `ChiTietKeHoachMuaBan` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietDonMuaHang_MaDonMuaHang` FOREIGN KEY (`MaDonMuaHang`) REFERENCES `DonMuaHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietDonMuaHang_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietDonMuaHang_chk_1` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `ChiTietDonMuaHang_chk_2` CHECK ((`DonGia` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `KeHoachSanXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaDonHang` bigint unsigned NOT NULL,
  `MaXuong` bigint unsigned NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `NgayBatDau` date NOT NULL,
  `NgayKetThuc` date NOT NULL,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_KeHoachSanXuat_1` (`Ma`),
  KEY `KhoaNgoai_KeHoachSanXuat_MaDonHang` (`MaDonHang`),
  KEY `KhoaNgoai_KeHoachSanXuat_MaNguoiTao` (`MaNguoiTao`),
  KEY `KhoaNgoai_KeHoachSanXuat_MaXuong` (`MaXuong`),
  CONSTRAINT `KhoaNgoai_KeHoachSanXuat_MaDonHang` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachSanXuat_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KeHoachSanXuat_MaXuong` FOREIGN KEY (`MaXuong`) REFERENCES `Xuong` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KeHoachSanXuat_chk_1` CHECK ((`NgayKetThuc` >= `NgayBatDau`)),
  CONSTRAINT `KeHoachSanXuat_chk_2` CHECK ((`TrangThai` in (_utf8mb4'DRAFT',_utf8mb4'APPROVED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietKeHoachSanXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKeHoachSanXuat` bigint unsigned NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) DEFAULT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `LoaiChiTiet` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'THANH_PHAM',
  `SoLuongCan` decimal(18,3) DEFAULT NULL,
  `SoLuongConThieu` decimal(18,3) DEFAULT NULL,
  `MaNguyenLieuCu` bigint unsigned DEFAULT NULL,
  `SoLuongGoc` decimal(18,3) DEFAULT NULL,
  `TyLeDuPhong` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ThanhPhamKeHoach_1` (`MaKeHoachSanXuat`,`MaMatHang`),
  UNIQUE KEY `UQ_ChiTietKeHoachSanXuat_NguonCu` (`MaNguyenLieuCu`),
  KEY `KhoaNgoai_ThanhPhamKeHoach_MaMatHang` (`MaMatHang`),
  CONSTRAINT `KhoaNgoai_ThanhPhamKeHoach_MaKeHoachSanXuat` FOREIGN KEY (`MaKeHoachSanXuat`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ThanhPhamKeHoach_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietKeHoachSanXuat_chk_1` CHECK ((((`LoaiChiTiet` = _utf8mb4'THANH_PHAM') and (`SoLuong` is not null) and (`SoLuong` > 0) and (`SoLuongCan` is null) and (`SoLuongConThieu` is null)) or ((`LoaiChiTiet` = _utf8mb4'NGUYEN_VAT_LIEU') and (`SoLuong` is null) and (`SoLuongCan` is not null) and (`SoLuongCan` > 0) and ((`SoLuongConThieu` is null) or ((`SoLuongConThieu` >= 0) and (`SoLuongConThieu` <= `SoLuongCan`)))))),
  CONSTRAINT `ChiTietKeHoachSanXuat_chk_2` CHECK ((`SoLuong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `BanBaoCaoSanXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaKeHoachSanXuat` bigint unsigned NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayGui` datetime(6) DEFAULT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `LoaiBaoCao` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SAN_XUAT',
  `NgayHoanThanh` date DEFAULT NULL,
  `MaThanhPhamCu` bigint unsigned DEFAULT NULL,
  `MucDichBaoCao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhanTramTienDo` decimal(5,2) DEFAULT NULL,
  `GuiBoPhanLapKeHoach` tinyint(1) NOT NULL DEFAULT '0',
  `XacNhanHoanTat` tinyint(1) DEFAULT NULL,
  `KieuThanhPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FINAL',
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_BaoCaoSanXuat_1` (`Ma`),
  UNIQUE KEY `MaThanhPhamCu` (`MaThanhPhamCu`),
  KEY `KhoaNgoai_BaoCaoSanXuat_MaKeHoachSanXuat` (`MaKeHoachSanXuat`),
  KEY `KhoaNgoai_BaoCaoSanXuat_MaNguoiTao` (`MaNguoiTao`),
  CONSTRAINT `KhoaNgoai_BaoCaoSanXuat_MaKeHoachSanXuat` FOREIGN KEY (`MaKeHoachSanXuat`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BaoCaoSanXuat_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `BanBaoCaoSanXuat_chk_1` CHECK ((`LoaiBaoCao` in (_utf8mb4'SAN_XUAT',_utf8mb4'THANH_PHAM'))),
  CONSTRAINT `BanBaoCaoSanXuat_chk_2` CHECK (((`MucDichBaoCao` is null) or (`MucDichBaoCao` in (_utf8mb4'NHU_CAU',_utf8mb4'TIEN_DO',_utf8mb4'SU_CO')))),
  CONSTRAINT `BanBaoCaoSanXuat_chk_3` CHECK (((`PhanTramTienDo` is null) or (`PhanTramTienDo` between 0 and 100))),
  CONSTRAINT `BanBaoCaoSanXuat_chk_4` CHECK ((`TrangThai` in (_utf8mb4'DRAFT',_utf8mb4'SUBMITTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietBaoCaoSanXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaBaoCaoSanXuat` bigint unsigned NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuongHienCo` decimal(18,3) DEFAULT NULL,
  `SoLuongCan` decimal(18,3) DEFAULT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `LoaiChiTiet` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NHU_CAU',
  `SoLuong` decimal(18,3) DEFAULT NULL,
  `SoLuongSuDung` decimal(18,3) DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietBaoCaoSanXuat_1` (`MaBaoCaoSanXuat`,`MaMatHang`),
  KEY `KhoaNgoai_ChiTietBaoCaoSanXuat_MaMatHang` (`MaMatHang`),
  CONSTRAINT `KhoaNgoai_ChiTietBaoCaoSanXuat_MaBaoCaoSanXuat` FOREIGN KEY (`MaBaoCaoSanXuat`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietBaoCaoSanXuat_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietBaoCaoSanXuat_chk_1` CHECK ((((`LoaiChiTiet` = _utf8mb4'NHU_CAU') and (`SoLuongCan` is not null) and (`SoLuongCan` > 0) and (`SoLuongHienCo` is not null) and (`SoLuongHienCo` >= 0) and (`SoLuong` is null) and (`SoLuongSuDung` is null)) or ((`LoaiChiTiet` = _utf8mb4'THANH_PHAM') and (`SoLuong` is not null) and (`SoLuong` > 0) and (`SoLuongCan` is null) and (`SoLuongHienCo` is null) and (`SoLuongSuDung` is null)) or ((`LoaiChiTiet` = _utf8mb4'NVL_SU_DUNG') and (`SoLuongSuDung` is not null) and (`SoLuongSuDung` > 0) and (`SoLuongCan` is null) and (`SoLuongHienCo` is null) and (`SoLuong` is null)))),
  CONSTRAINT `ChiTietBaoCaoSanXuat_chk_2` CHECK ((`SoLuongHienCo` >= 0)),
  CONSTRAINT `ChiTietBaoCaoSanXuat_chk_3` CHECK ((`SoLuongCan` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietLoBaoCaoSanXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaBaoCaoThanhPham` bigint unsigned NOT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaChiTietBaoCao` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ThanhPhamBaoCao_1` (`MaBaoCaoThanhPham`,`MaChiTietLo`),
  UNIQUE KEY `DuyNhat_ThanhPhamBaoCao_2` (`MaChiTietLo`),
  KEY `FK_ChiTietLoBaoCao_Dong` (`MaChiTietBaoCao`),
  CONSTRAINT `FK_ChiTietLoBaoCao_Dong` FOREIGN KEY (`MaChiTietBaoCao`) REFERENCES `ChiTietBaoCaoSanXuat` (`MaBanGhi`),
  CONSTRAINT `FK_ThanhPhamBaoCao_Chung` FOREIGN KEY (`MaBaoCaoThanhPham`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_ThanhPhamBaoCao_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietLoBaoCaoSanXuat_chk_1` CHECK ((`SoLuong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `Kho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DiaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ConHoatDong` tinyint(1) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_Kho_1` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ViTriKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKho` bigint unsigned NOT NULL,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ConHoatDong` tinyint(1) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ViTriKho_1` (`MaKho`,`Ma`),
  CONSTRAINT `KhoaNgoai_ViTriKho_MaKho` FOREIGN KEY (`MaKho`) REFERENCES `Kho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `LoHang` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `LoaiLo` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `HuongTra` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThaiTra` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhienBanTra` int NOT NULL DEFAULT '1',
  `MaNguoiNhanTra` bigint unsigned DEFAULT NULL,
  `MaKhoNhanTra` bigint unsigned DEFAULT NULL,
  `MaNguoiLapTra` bigint unsigned DEFAULT NULL,
  `MaKeHoachNhapThanhPham` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `Ma` (`Ma`),
  UNIQUE KEY `MaKeHoachNhapThanhPham` (`MaKeHoachNhapThanhPham`),
  KEY `FK_TraHang_Kho` (`MaKhoNhanTra`),
  KEY `FK_TraHang_NguoiLap` (`MaNguoiLapTra`),
  KEY `FK_TraHang_NguoiNhan` (`MaNguoiNhanTra`),
  CONSTRAINT `FK_LoHang_NhapThanhPham` FOREIGN KEY (`MaKeHoachNhapThanhPham`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`),
  CONSTRAINT `FK_TraHang_Kho` FOREIGN KEY (`MaKhoNhanTra`) REFERENCES `Kho` (`MaBanGhi`),
  CONSTRAINT `FK_TraHang_NguoiLap` FOREIGN KEY (`MaNguoiLapTra`) REFERENCES `NguoiDung` (`MaBanGhi`),
  CONSTRAINT `FK_TraHang_NguoiNhan` FOREIGN KEY (`MaNguoiNhanTra`) REFERENCES `NguoiDung` (`MaBanGhi`),
  CONSTRAINT `LoHang_chk_1` CHECK (((`HuongTra` is null) or ((`LoaiLo` = _utf8mb4'TRA_VE') and (`HuongTra` in (_utf8mb4'NCC',_utf8mb4'KHACH_HANG'))))),
  CONSTRAINT `LoHang_chk_2` CHECK ((`LoaiLo` in (_utf8mb4'NGUYEN_VAT_LIEU',_utf8mb4'THANH_PHAM',_utf8mb4'TRA_VE'))),
  CONSTRAINT `LoHang_chk_3` CHECK (((`TrangThaiTra` is null) or ((`LoaiLo` = _utf8mb4'TRA_VE') and (`HuongTra` = _utf8mb4'KHACH_HANG') and (`TrangThaiTra` in (_utf8mb4'PENDING',_utf8mb4'POSTED',_utf8mb4'CANCELLED')) and (`MaNguoiNhanTra` is not null) and (`MaKhoNhanTra` is not null) and (`MaNguoiLapTra` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietLo` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `MaChiTietDonMuaHang` bigint unsigned DEFAULT NULL,
  `MaKeHoachSanXuat` bigint unsigned DEFAULT NULL,
  `NgaySanXuat` date DEFAULT NULL,
  `HanSuDung` date DEFAULT NULL,
  `SoLuongNhan` decimal(18,3) NOT NULL,
  `TrangThaiKiemTra` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaLoHang` bigint unsigned DEFAULT NULL,
  `MaYeuCauNhapThanhPham` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_LoHang_1` (`Ma`),
  KEY `FK_ChiTietLo_Header` (`MaLoHang`),
  KEY `KhoaNgoai_LoHang_MaChiTietDonMuaHang` (`MaChiTietDonMuaHang`),
  KEY `KhoaNgoai_LoHang_MaKeHoachSanXuat` (`MaKeHoachSanXuat`),
  KEY `KhoaNgoai_LoHang_MaMatHang` (`MaMatHang`),
  KEY `FK_Lo_NhapThanhPham` (`MaYeuCauNhapThanhPham`),
  CONSTRAINT `FK_ChiTietLo_Header` FOREIGN KEY (`MaLoHang`) REFERENCES `LoHang` (`MaBanGhi`),
  CONSTRAINT `FK_Lo_NhapThanhPham` FOREIGN KEY (`MaYeuCauNhapThanhPham`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_LoHang_MaChiTietDonMuaHang` FOREIGN KEY (`MaChiTietDonMuaHang`) REFERENCES `ChiTietDonMuaHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_LoHang_MaKeHoachSanXuat` FOREIGN KEY (`MaKeHoachSanXuat`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_LoHang_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietLo_chk_1` CHECK ((`SoLuongNhan` > 0)),
  CONSTRAINT `ChiTietLo_chk_2` CHECK ((`TrangThaiKiemTra` in (_utf8mb4'PENDING',_utf8mb4'PASSED',_utf8mb4'PARTIAL',_utf8mb4'FAILED'))),
  CONSTRAINT `ChiTietLo_chk_3` CHECK (((`HanSuDung` is null) or (`NgaySanXuat` is null) or (`HanSuDung` >= `NgaySanXuat`))),
  CONSTRAINT `ChiTietLo_chk_4` CHECK ((((`MaChiTietDonMuaHang` is not null) and (`MaKeHoachSanXuat` is null)) or ((`MaChiTietDonMuaHang` is null) and (`MaKeHoachSanXuat` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `KetQuaKiemTraQCAC` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiKiemTra` bigint unsigned NOT NULL,
  `NgayKiemTra` datetime(6) NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaLichKiemTra` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhieuKiemTraChatLuong_1` (`Ma`),
  KEY `KhoaNgoai_PhieuKiemTraChatLuong_Lich` (`MaLichKiemTra`),
  KEY `KhoaNgoai_PhieuKiemTraChatLuong_MaNguoiKiemTra` (`MaNguoiKiemTra`),
  CONSTRAINT `KhoaNgoai_PhieuKiemTraChatLuong_Lich` FOREIGN KEY (`MaLichKiemTra`) REFERENCES `DotKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhieuKiemTraChatLuong_MaNguoiKiemTra` FOREIGN KEY (`MaNguoiKiemTra`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KetQuaKiemTraQCAC_chk_1` CHECK ((`TrangThai` in (_utf8mb4'RECORDED',_utf8mb4'VOID')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietKetQuaKiemTraQCAC` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaPhieuKiemTraChatLuong` bigint unsigned NOT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `SoLuongKiemTra` decimal(18,3) NOT NULL,
  `SoLuongDat` decimal(18,3) NOT NULL,
  `SoLuongLoi` decimal(18,3) NOT NULL,
  `Loi` text COLLATE utf8mb4_unicode_ci,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietKiemTraChatLuong_1` (`MaPhieuKiemTraChatLuong`,`MaChiTietLo`),
  UNIQUE KEY `DuyNhat_ChiTietKiemTraChatLuong_2` (`MaChiTietLo`),
  CONSTRAINT `KhoaNgoai_ChiTietKiemTraChatLuong_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietKiemTraChatLuong_MaPhieuKiemTraChatLuong` FOREIGN KEY (`MaPhieuKiemTraChatLuong`) REFERENCES `KetQuaKiemTraQCAC` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietKetQuaKiemTraQCAC_chk_1` CHECK ((`SoLuongKiemTra` > 0)),
  CONSTRAINT `ChiTietKetQuaKiemTraQCAC_chk_2` CHECK ((`SoLuongDat` >= 0)),
  CONSTRAINT `ChiTietKetQuaKiemTraQCAC_chk_3` CHECK ((`SoLuongLoi` >= 0)),
  CONSTRAINT `ChiTietKetQuaKiemTraQCAC_chk_4` CHECK ((`SoLuongKiemTra` = (`SoLuongDat` + `SoLuongLoi`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhieuYeuCauNhapXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Kieu` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhuongThuc` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaDonMuaHang` bigint unsigned DEFAULT NULL,
  `MaKeHoachKinhDoanh` bigint unsigned DEFAULT NULL,
  `MaKeHoachSanXuat` bigint unsigned DEFAULT NULL,
  `MaXuong` bigint unsigned NOT NULL,
  `MaKho` bigint unsigned NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `NgayYeuCau` date NOT NULL,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaBaoCaoSanXuat` bigint unsigned DEFAULT NULL,
  `MaNguoiPhuTrach` bigint unsigned DEFAULT NULL,
  `LoaiNguonSanXuat` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REPORT',
  `ThoiDiemThucHien` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_YeuCauKho_1` (`Ma`),
  KEY `ChiMuc_YeuCauKho_1` (`MaKho`,`Kieu`,`TrangThai`),
  KEY `ChiMuc_YeuCauKho_2` (`MaNguoiTao`,`NgayTao`),
  KEY `KhoaNgoai_YeuCauKho_BaoCao` (`MaBaoCaoSanXuat`),
  KEY `KhoaNgoai_YeuCauKho_MaDonMuaHang` (`MaDonMuaHang`),
  KEY `KhoaNgoai_YeuCauKho_MaKeHoachKinhDoanh` (`MaKeHoachKinhDoanh`),
  KEY `KhoaNgoai_YeuCauKho_MaKeHoachSanXuat` (`MaKeHoachSanXuat`),
  KEY `KhoaNgoai_YeuCauKho_MaXuong` (`MaXuong`),
  KEY `KhoaNgoai_YeuCauKho_NguoiPhuTrach` (`MaNguoiPhuTrach`),
  CONSTRAINT `KhoaNgoai_YeuCauKho_BaoCao` FOREIGN KEY (`MaBaoCaoSanXuat`) REFERENCES `BanBaoCaoSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaDonMuaHang` FOREIGN KEY (`MaDonMuaHang`) REFERENCES `DonMuaHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaKeHoachKinhDoanh` FOREIGN KEY (`MaKeHoachKinhDoanh`) REFERENCES `KeHoachMuaBan` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaKeHoachSanXuat` FOREIGN KEY (`MaKeHoachSanXuat`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaKho` FOREIGN KEY (`MaKho`) REFERENCES `Kho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_MaXuong` FOREIGN KEY (`MaXuong`) REFERENCES `Xuong` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_YeuCauKho_NguoiPhuTrach` FOREIGN KEY (`MaNguoiPhuTrach`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `CK_NguonNhapThanhPham004` CHECK (((`LoaiNguonSanXuat` = _utf8mb4'REPORT') or ((`LoaiNguonSanXuat` = _utf8mb4'PLAN') and (`PhuongThuc` = _utf8mb4'PRODUCTION_ISSUE') and (`MaKeHoachSanXuat` is not null) and (`MaBaoCaoSanXuat` is null)) or ((`LoaiNguonSanXuat` = _utf8mb4'MANUAL') and (`PhuongThuc` = _utf8mb4'PRODUCTION_RECEIPT') and (`Kieu` = _utf8mb4'IN') and (`MaKeHoachSanXuat` is not null) and (`MaBaoCaoSanXuat` is null)))),
  CONSTRAINT `PhieuYeuCauNhapXuat_chk_2` CHECK ((((`PhuongThuc` = _utf8mb4'PURCHASE_RECEIPT') and (`Kieu` = _utf8mb4'IN') and (`MaDonMuaHang` is not null) and (`MaKeHoachKinhDoanh` is null) and (`MaKeHoachSanXuat` is null) and (`MaBaoCaoSanXuat` is null)) or ((`PhuongThuc` = _utf8mb4'SALE_ISSUE') and (`Kieu` = _utf8mb4'OUT') and (`MaDonMuaHang` is null) and (`MaKeHoachKinhDoanh` is not null) and (`MaKeHoachSanXuat` is null) and (`MaBaoCaoSanXuat` is null)) or ((`PhuongThuc` in (_utf8mb4'PRODUCTION_ISSUE',_utf8mb4'PRODUCTION_RECEIPT')) and (((`PhuongThuc` = _utf8mb4'PRODUCTION_ISSUE') and (`Kieu` = _utf8mb4'OUT')) or ((`PhuongThuc` = _utf8mb4'PRODUCTION_RECEIPT') and (`Kieu` = _utf8mb4'IN'))) and (`MaDonMuaHang` is null) and (`MaKeHoachKinhDoanh` is null) and (`MaKeHoachSanXuat` is not null)) or ((`PhuongThuc` = _utf8mb4'MATERIAL_PURCHASE') and (`Kieu` = _utf8mb4'PROCUREMENT') and (`MaDonMuaHang` is null) and (`MaKeHoachKinhDoanh` is null) and (`MaKeHoachSanXuat` is null) and (`MaBaoCaoSanXuat` is not null)))),
  CONSTRAINT `PhieuYeuCauNhapXuat_chk_3` CHECK ((`TrangThai` in (_utf8mb4'PENDING',_utf8mb4'PARTIALLY_FULFILLED',_utf8mb4'FULFILLED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietPhieuYeuCauNhapXuat` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaYeuCauKho` bigint unsigned NOT NULL,
  `MaMatHang` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietYeuCauKho_1` (`MaYeuCauKho`,`MaMatHang`),
  KEY `KhoaNgoai_ChiTietYeuCauKho_MaMatHang` (`MaMatHang`),
  CONSTRAINT `KhoaNgoai_ChiTietYeuCauKho_MaMatHang` FOREIGN KEY (`MaMatHang`) REFERENCES `MatHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietYeuCauKho_MaYeuCauKho` FOREIGN KEY (`MaYeuCauKho`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietPhieuYeuCauNhapXuat_chk_1` CHECK ((`SoLuong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhieuKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Kieu` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaYeuCauKho` bigint unsigned DEFAULT NULL,
  `MaKho` bigint unsigned NOT NULL,
  `MaNguoiGhiSo` bigint unsigned NOT NULL,
  `NgayGhiSo` datetime(6) NOT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `KhoaChongLap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaCongViec` bigint unsigned DEFAULT NULL,
  `MaLoTraVe` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhieuKho_1` (`Ma`),
  UNIQUE KEY `DuyNhat_PhieuKho_2` (`KhoaChongLap`),
  UNIQUE KEY `UQ_PhieuKho_LoTraVe` (`MaLoTraVe`),
  KEY `ChiMuc_PhieuKho_1` (`MaKho`,`Kieu`,`NgayGhiSo`),
  KEY `KhoaNgoai_PhieuKho_CongViec` (`MaCongViec`),
  KEY `KhoaNgoai_PhieuKho_MaNguoiGhiSo` (`MaNguoiGhiSo`),
  KEY `KhoaNgoai_PhieuKho_MaYeuCauKho` (`MaYeuCauKho`),
  CONSTRAINT `FK_PhieuKho_LoTraVe` FOREIGN KEY (`MaLoTraVe`) REFERENCES `LoHang` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_PhieuKho_CongViec` FOREIGN KEY (`MaCongViec`) REFERENCES `CongViec` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhieuKho_MaKho` FOREIGN KEY (`MaKho`) REFERENCES `Kho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhieuKho_MaNguoiGhiSo` FOREIGN KEY (`MaNguoiGhiSo`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhieuKho_MaYeuCauKho` FOREIGN KEY (`MaYeuCauKho`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `PhieuKho_chk_1` CHECK ((((`MaYeuCauKho` is not null) + (`MaLoTraVe` is not null)) = 1)),
  CONSTRAINT `PhieuKho_chk_2` CHECK ((`Kieu` in (_utf8mb4'IN',_utf8mb4'OUT'))),
  CONSTRAINT `PhieuKho_chk_3` CHECK ((`TrangThai` = _utf8mb4'POSTED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietPhieuKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaPhieuKho` bigint unsigned NOT NULL,
  `MaChiTietYeuCauKho` bigint unsigned DEFAULT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `NhomChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `LyDoChenhLech` text COLLATE utf8mb4_unicode_ci,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaPhanCongKho` bigint unsigned DEFAULT NULL,
  `MaChiTietTraVe` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietPhieuKho_1` (`MaPhieuKho`,`MaChiTietYeuCauKho`,`MaChiTietLo`,`MaViTriKho`,`NhomChatLuong`),
  KEY `FK_PhieuKho_DongTra` (`MaChiTietTraVe`),
  KEY `KhoaNgoai_ChiTietPhieuKho_MaChiTietYeuCauKho` (`MaChiTietYeuCauKho`),
  KEY `KhoaNgoai_ChiTietPhieuKho_MaLoHang` (`MaChiTietLo`),
  KEY `KhoaNgoai_ChiTietPhieuKho_MaViTriKho` (`MaViTriKho`),
  KEY `KhoaNgoai_ChiTietPhieuKho_PhanCong` (`MaPhanCongKho`),
  CONSTRAINT `FK_PhieuKho_DongTra` FOREIGN KEY (`MaChiTietTraVe`) REFERENCES `ChiTietLoTraVe` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_ChiTietPhieuKho_MaChiTietYeuCauKho` FOREIGN KEY (`MaChiTietYeuCauKho`) REFERENCES `ChiTietPhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietPhieuKho_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietPhieuKho_MaPhieuKho` FOREIGN KEY (`MaPhieuKho`) REFERENCES `PhieuKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietPhieuKho_MaViTriKho` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietPhieuKho_PhanCong` FOREIGN KEY (`MaPhanCongKho`) REFERENCES `PhanCongKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietPhieuKho_chk_1` CHECK ((((`MaChiTietYeuCauKho` is not null) + (`MaChiTietTraVe` is not null)) = 1)),
  CONSTRAINT `ChiTietPhieuKho_chk_2` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `ChiTietPhieuKho_chk_3` CHECK ((`NhomChatLuong` in (_utf8mb4'AVAILABLE',_utf8mb4'QUARANTINE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `TonKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `NhomChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_TonKho_1` (`MaChiTietLo`,`MaViTriKho`,`NhomChatLuong`),
  KEY `KhoaNgoai_TonKho_MaViTriKho` (`MaViTriKho`),
  CONSTRAINT `KhoaNgoai_TonKho_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_TonKho_MaViTriKho` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `TonKho_chk_1` CHECK ((`SoLuong` >= 0)),
  CONSTRAINT `TonKho_chk_2` CHECK ((`NhomChatLuong` in (_utf8mb4'AVAILABLE',_utf8mb4'QUARANTINE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `BienDongKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `NhomChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BienDongSoLuong` decimal(18,3) NOT NULL,
  `MaChiTietPhieuKho` bigint unsigned DEFAULT NULL,
  `MaDeXuatXuLy` bigint unsigned DEFAULT NULL,
  `MaChiTietKiemKe` bigint unsigned DEFAULT NULL,
  `NgayGhiSo` datetime(6) NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `KhoaNghiepVu` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_BienDongKho_1` (`KhoaNghiepVu`),
  KEY `ChiMuc_BienDongKho_1` (`MaChiTietLo`,`MaViTriKho`,`NgayGhiSo`),
  KEY `ChiMuc_BienDongKho_2` (`NgayGhiSo`),
  KEY `KhoaNgoai_BienDongKho_MaChiTietKiemKe` (`MaChiTietKiemKe`),
  KEY `KhoaNgoai_BienDongKho_MaChiTietPhieuKho` (`MaChiTietPhieuKho`),
  KEY `KhoaNgoai_BienDongKho_MaDeXuatXuLy` (`MaDeXuatXuLy`),
  KEY `KhoaNgoai_BienDongKho_MaNguoiTao` (`MaNguoiTao`),
  KEY `KhoaNgoai_BienDongKho_MaViTriKho` (`MaViTriKho`),
  CONSTRAINT `KhoaNgoai_BienDongKho_MaChiTietKiemKe` FOREIGN KEY (`MaChiTietKiemKe`) REFERENCES `ChiTietPhieuKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BienDongKho_MaChiTietPhieuKho` FOREIGN KEY (`MaChiTietPhieuKho`) REFERENCES `ChiTietPhieuKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BienDongKho_MaDeXuatXuLy` FOREIGN KEY (`MaDeXuatXuLy`) REFERENCES `BanDeXuatXuLyNgoaiLe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BienDongKho_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BienDongKho_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_BienDongKho_MaViTriKho` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `BienDongKho_chk_1` CHECK ((`BienDongSoLuong` <> 0)),
  CONSTRAINT `BienDongKho_chk_2` CHECK ((`NhomChatLuong` in (_utf8mb4'AVAILABLE',_utf8mb4'QUARANTINE'))),
  CONSTRAINT `BienDongKho_chk_3` CHECK (((((`MaChiTietPhieuKho` is not null) + (`MaDeXuatXuLy` is not null)) + (`MaChiTietKiemKe` is not null)) = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `DotKiemKe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `NgayDuKien` date NOT NULL,
  `BatDauLuc` datetime(6) DEFAULT NULL,
  `KetThucLuc` datetime(6) DEFAULT NULL,
  `LoaiMatHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `LoaiDot` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COUNT',
  `LoaiKiemTra` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiaDiem` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MaKeHoachMuaQC` bigint unsigned DEFAULT NULL,
  `MaKeHoachSanXuatQC` bigint unsigned DEFAULT NULL,
  `KiemSoLuong` tinyint(1) NOT NULL DEFAULT '0',
  `KiemChatLuong` tinyint(1) NOT NULL DEFAULT '1',
  `BienBanKetLuan` text COLLATE utf8mb4_unicode_ci,
  `BienBanTrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `BienBanNguoiLap` bigint unsigned DEFAULT NULL,
  `BienBanNgayGui` datetime(6) DEFAULT NULL,
  `BienBanDuLieu` json DEFAULT NULL,
  `NgoaiLeMoTa` text COLLATE utf8mb4_unicode_ci,
  `NgoaiLeTrangThai` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE',
  `NgoaiLeCachXuLy` text COLLATE utf8mb4_unicode_ci,
  `NgoaiLeMaXuong` bigint unsigned DEFAULT NULL,
  `NgoaiLeNguoiXuLy` bigint unsigned DEFAULT NULL,
  `NgoaiLeYKienPheDuyet` text COLLATE utf8mb4_unicode_ci,
  `NgoaiLeNguoiDuyet` bigint unsigned DEFAULT NULL,
  `NguoiLapBienBanDuocChon` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_DotKiemKe_1` (`Ma`),
  KEY `KhoaNgoai_DotKiemKe_MaNguoiTao` (`MaNguoiTao`),
  KEY `FK_QC009_MaKeHoachMuaQC` (`MaKeHoachMuaQC`),
  KEY `FK_QC009_MaKeHoachSanXuatQC` (`MaKeHoachSanXuatQC`),
  CONSTRAINT `FK_QC009_MaKeHoachMuaQC` FOREIGN KEY (`MaKeHoachMuaQC`) REFERENCES `KeHoachMuaBan` (`MaBanGhi`),
  CONSTRAINT `FK_QC009_MaKeHoachSanXuatQC` FOREIGN KEY (`MaKeHoachSanXuatQC`) REFERENCES `KeHoachSanXuat` (`MaBanGhi`),
  CONSTRAINT `KhoaNgoai_DotKiemKe_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `DotKiemKe_chk_1` CHECK ((`TrangThai` in (_utf8mb4'PLANNED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CLOSED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `DotKiemKe_chk_2` CHECK (((`LoaiMatHang` is null) or (`LoaiMatHang` in (_utf8mb4'MATERIAL',_utf8mb4'FINISHED_PRODUCT')))),
  CONSTRAINT `DotKiemKe_chk_3` CHECK ((`LoaiDot` in (_utf8mb4'COUNT',_utf8mb4'QUALITY_CHECK'))),
  CONSTRAINT `DotKiemKe_chk_4` CHECK (((`LoaiKiemTra` is null) or (`LoaiKiemTra` in (_utf8mb4'MATERIAL',_utf8mb4'FINISHED_PRODUCT'))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhieuKiemKe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDotKiemKe` bigint unsigned NOT NULL,
  `MaKho` bigint unsigned NOT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayChotSo` datetime(6) DEFAULT NULL,
  `NgayHoanTat` datetime(6) DEFAULT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `NhanXet` text COLLATE utf8mb4_unicode_ci,
  `TrangThaiBienBan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `NgayGui` datetime(6) DEFAULT NULL,
  `MaNguoiTao` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_KhoKiemKe_1` (`MaDotKiemKe`,`MaKho`),
  KEY `KhoaNgoai_KhoKiemKe_MaKho` (`MaKho`),
  CONSTRAINT `KhoaNgoai_KhoKiemKe_MaDotKiemKe` FOREIGN KEY (`MaDotKiemKe`) REFERENCES `DotKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_KhoKiemKe_MaKho` FOREIGN KEY (`MaKho`) REFERENCES `Kho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `PhieuKiemKe_chk_1` CHECK ((`TrangThai` in (_utf8mb4'PLANNED',_utf8mb4'COUNTING',_utf8mb4'COMPLETED',_utf8mb4'CLOSED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanCongKiemKe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKhoKiemKe` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhanCongKiemKe_1` (`MaKhoKiemKe`,`MaNguoiDung`),
  KEY `KhoaNgoai_PhanCongKiemKe_MaNguoiDung` (`MaNguoiDung`),
  CONSTRAINT `KhoaNgoai_PhanCongKiemKe_MaKhoKiemKe` FOREIGN KEY (`MaKhoKiemKe`) REFERENCES `PhieuKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKiemKe_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietPhieuKiemKe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKhoKiemKe` bigint unsigned NOT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `NhomChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLuongHeThong` decimal(18,3) NOT NULL,
  `SoLuongThucTe` decimal(18,3) DEFAULT NULL,
  `MaNguoiDem` bigint unsigned DEFAULT NULL,
  `NgayDem` datetime(6) DEFAULT NULL,
  `NguyenNhan` text COLLATE utf8mb4_unicode_ci,
  `TrangThaiXuLy` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ChiTietKiemKe_1` (`MaKhoKiemKe`,`MaChiTietLo`,`MaViTriKho`,`NhomChatLuong`),
  KEY `KhoaNgoai_ChiTietKiemKe_MaLoHang` (`MaChiTietLo`),
  KEY `KhoaNgoai_ChiTietKiemKe_MaNguoiDem` (`MaNguoiDem`),
  KEY `KhoaNgoai_ChiTietKiemKe_MaViTriKho` (`MaViTriKho`),
  CONSTRAINT `KhoaNgoai_ChiTietKiemKe_MaKhoKiemKe` FOREIGN KEY (`MaKhoKiemKe`) REFERENCES `PhieuKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietKiemKe_MaLoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietKiemKe_MaNguoiDem` FOREIGN KEY (`MaNguoiDem`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_ChiTietKiemKe_MaViTriKho` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ChiTietPhieuKiemKe_chk_1` CHECK ((`SoLuongHeThong` >= 0)),
  CONSTRAINT `ChiTietPhieuKiemKe_chk_2` CHECK (((`SoLuongThucTe` is null) or (`SoLuongThucTe` >= 0))),
  CONSTRAINT `ChiTietPhieuKiemKe_chk_3` CHECK ((`NhomChatLuong` in (_utf8mb4'AVAILABLE',_utf8mb4'QUARANTINE'))),
  CONSTRAINT `ChiTietPhieuKiemKe_chk_4` CHECK ((`TrangThaiXuLy` in (_utf8mb4'NONE',_utf8mb4'PENDING_APPROVAL',_utf8mb4'RESOLVED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanCongKetLuanKiemKe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaPhieuKiemKe` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `UQ_KetLuan_PhanCong` (`MaPhieuKiemKe`,`MaNguoiDung`),
  KEY `FK_KetLuan_PhanCong_Nguoi` (`MaNguoiDung`),
  CONSTRAINT `FK_KetLuan_PhanCong_Nguoi` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`),
  CONSTRAINT `FK_KetLuan_PhanCong_Phieu` FOREIGN KEY (`MaPhieuKiemKe`) REFERENCES `PhieuKiemKe` (`MaBanGhi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `BanDeXuatXuLyNgoaiLe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Kieu` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaChiTietKiemTraChatLuong` bigint unsigned DEFAULT NULL,
  `MaChiTietKiemKe` bigint unsigned DEFAULT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `HanhDong` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `LyDo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `GhiChuXuLy` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `TrangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiDuyet` bigint unsigned DEFAULT NULL,
  `NgayDuyet` datetime(6) DEFAULT NULL,
  `LyDoTuChoi` text COLLATE utf8mb4_unicode_ci,
  `NgayApDung` datetime(6) DEFAULT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_DeXuatXuLy_1` (`Ma`),
  KEY `KhoaNgoai_DeXuatXuLy_MaChiTietKiemKe` (`MaChiTietKiemKe`),
  KEY `KhoaNgoai_DeXuatXuLy_MaChiTietKiemTraChatLuong` (`MaChiTietKiemTraChatLuong`),
  KEY `KhoaNgoai_DeXuatXuLy_MaNguoiDuyet` (`MaNguoiDuyet`),
  KEY `KhoaNgoai_DeXuatXuLy_MaNguoiTao` (`MaNguoiTao`),
  CONSTRAINT `KhoaNgoai_DeXuatXuLy_MaChiTietKiemKe` FOREIGN KEY (`MaChiTietKiemKe`) REFERENCES `ChiTietPhieuKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DeXuatXuLy_MaChiTietKiemTraChatLuong` FOREIGN KEY (`MaChiTietKiemTraChatLuong`) REFERENCES `ChiTietKetQuaKiemTraQCAC` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DeXuatXuLy_MaNguoiDuyet` FOREIGN KEY (`MaNguoiDuyet`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_DeXuatXuLy_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `BanDeXuatXuLyNgoaiLe_chk_1` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `BanDeXuatXuLyNgoaiLe_chk_4` CHECK ((`TrangThai` in (_utf8mb4'PENDING_APPROVAL',_utf8mb4'APPROVED',_utf8mb4'REJECTED',_utf8mb4'APPLIED'))),
  CONSTRAINT `CK_NgoaiLe_HanhDong006` CHECK ((`HanhDong` in (_utf8mb4'ADJUST_TO_ACTUAL',_utf8mb4'SCRAP',_utf8mb4'RETURN_SUPPLIER',_utf8mb4'RELEASE',_utf8mb4'QUARANTINE'))),
  CONSTRAINT `CK_NgoaiLe_Loai005` CHECK ((`Kieu` in (_utf8mb4'QC_FAILURE',_utf8mb4'STOCKTAKE_DIFFERENCE',_utf8mb4'QUARANTINE_DISPOSITION'))),
  CONSTRAINT `CK_NgoaiLe_Nguon005` CHECK ((((`Kieu` in (_utf8mb4'QC_FAILURE',_utf8mb4'QUARANTINE_DISPOSITION')) and (`MaChiTietKiemTraChatLuong` is not null) and (`MaChiTietKiemKe` is null)) or ((`Kieu` = _utf8mb4'STOCKTAKE_DIFFERENCE') and (`MaChiTietKiemTraChatLuong` is null) and (`MaChiTietKiemKe` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `KetQuaXuLyNgoaiLe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDeXuatXuLy` bigint unsigned NOT NULL,
  `PhienBanDeXuat` int NOT NULL,
  `QuyetDinh` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiDuyet` bigint unsigned NOT NULL,
  `LyDo` text COLLATE utf8mb4_unicode_ci,
  `NgayDuyet` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `UQ_KetQuaNgoaiLe_PhienBan` (`MaDeXuatXuLy`,`PhienBanDeXuat`),
  KEY `FK_KetQuaNgoaiLe_Nguoi` (`MaNguoiDuyet`),
  CONSTRAINT `FK_KetQuaNgoaiLe_DeXuat` FOREIGN KEY (`MaDeXuatXuLy`) REFERENCES `BanDeXuatXuLyNgoaiLe` (`MaBanGhi`),
  CONSTRAINT `FK_KetQuaNgoaiLe_Nguoi` FOREIGN KEY (`MaNguoiDuyet`) REFERENCES `NguoiDung` (`MaBanGhi`),
  CONSTRAINT `KetQuaXuLyNgoaiLe_chk_1` CHECK ((`QuyetDinh` in (_utf8mb4'APPROVED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanBoXuLy` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDeXuatXuLy` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhanBoXuLy_1` (`MaDeXuatXuLy`,`MaViTriKho`),
  KEY `KhoaNgoai_PhanBoXuLy_MaViTriKho` (`MaViTriKho`),
  CONSTRAINT `KhoaNgoai_PhanBoXuLy_MaDeXuatXuLy` FOREIGN KEY (`MaDeXuatXuLy`) REFERENCES `BanDeXuatXuLyNgoaiLe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanBoXuLy_MaViTriKho` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `PhanBoXuLy_chk_1` CHECK ((`SoLuong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChiTietLoTraVe` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaLoHang` bigint unsigned NOT NULL,
  `MaChiTietLoGoc` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `MaDeXuatXuLy` bigint unsigned DEFAULT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `MaChiTietKiemTraChatLuong` bigint unsigned DEFAULT NULL,
  `MaChiTietPhieuXuat` bigint unsigned DEFAULT NULL,
  `MaChiTietLoNhan` bigint unsigned DEFAULT NULL,
  `MaViTriNhan` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `UQ_LoTraVe_DeXuat` (`MaDeXuatXuLy`),
  UNIQUE KEY `UQ_TraVe_QC` (`MaChiTietKiemTraChatLuong`),
  UNIQUE KEY `UQ_TraKhach_LoNhan` (`MaChiTietLoNhan`),
  KEY `FK_LoTraVe_Goc` (`MaChiTietLoGoc`),
  KEY `FK_LoTraVe_Header` (`MaLoHang`),
  KEY `FK_TraKhach_PhieuXuat` (`MaChiTietPhieuXuat`),
  KEY `FK_TraKhach_ViTri` (`MaViTriNhan`),
  CONSTRAINT `FK_LoTraVe_DeXuat` FOREIGN KEY (`MaDeXuatXuLy`) REFERENCES `BanDeXuatXuLyNgoaiLe` (`MaBanGhi`),
  CONSTRAINT `FK_LoTraVe_Goc` FOREIGN KEY (`MaChiTietLoGoc`) REFERENCES `ChiTietLo` (`MaBanGhi`),
  CONSTRAINT `FK_LoTraVe_Header` FOREIGN KEY (`MaLoHang`) REFERENCES `LoHang` (`MaBanGhi`),
  CONSTRAINT `FK_TraKhach_LoNhan` FOREIGN KEY (`MaChiTietLoNhan`) REFERENCES `ChiTietLo` (`MaBanGhi`),
  CONSTRAINT `FK_TraKhach_PhieuXuat` FOREIGN KEY (`MaChiTietPhieuXuat`) REFERENCES `ChiTietPhieuKho` (`MaBanGhi`),
  CONSTRAINT `FK_TraKhach_ViTri` FOREIGN KEY (`MaViTriNhan`) REFERENCES `ViTriKho` (`MaBanGhi`),
  CONSTRAINT `FK_TraVe_QC` FOREIGN KEY (`MaChiTietKiemTraChatLuong`) REFERENCES `ChiTietKetQuaKiemTraQCAC` (`MaBanGhi`),
  CONSTRAINT `ChiTietLoTraVe_chk_1` CHECK ((`SoLuong` > 0)),
  CONSTRAINT `ChiTietLoTraVe_chk_2` CHECK (((((`MaDeXuatXuLy` is not null) + (`MaChiTietKiemTraChatLuong` is not null)) + (`MaChiTietPhieuXuat` is not null)) = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ChungTuBuQC` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaKetQuaKiemTra` bigint unsigned NOT NULL,
  `PhienBanGoc` int NOT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `LyDo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `DuLieuTruoc` json NOT NULL,
  `DuLieuSau` json NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `UQ_BuQC_PhienBan` (`MaKetQuaKiemTra`,`PhienBanGoc`),
  KEY `FK_BuQC_Nguoi` (`MaNguoiTao`),
  CONSTRAINT `FK_BuQC_KetQua` FOREIGN KEY (`MaKetQuaKiemTra`) REFERENCES `KetQuaKiemTraQCAC` (`MaBanGhi`),
  CONSTRAINT `FK_BuQC_Nguoi` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `TaiKiemChatLuong` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaDeXuatXuLy` bigint unsigned NOT NULL,
  `PhienBanDeXuat` int NOT NULL,
  `MaNguoiKiemTra` bigint unsigned NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `KetLuan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `UQ_TaiKiem_PhienBan` (`MaDeXuatXuLy`,`PhienBanDeXuat`),
  KEY `FK_TaiKiem_Nguoi` (`MaNguoiKiemTra`),
  CONSTRAINT `FK_TaiKiem_DeXuat` FOREIGN KEY (`MaDeXuatXuLy`) REFERENCES `BanDeXuatXuLyNgoaiLe` (`MaBanGhi`),
  CONSTRAINT `FK_TaiKiem_Nguoi` FOREIGN KEY (`MaNguoiKiemTra`) REFERENCES `NguoiDung` (`MaBanGhi`),
  CONSTRAINT `TaiKiemChatLuong_chk_1` CHECK ((`KetLuan` in (_utf8mb4'PASSED',_utf8mb4'FAILED'))),
  CONSTRAINT `TaiKiemChatLuong_chk_2` CHECK ((`SoLuong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `CongViec` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TieuDe` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  `BatDauLuc` datetime(6) NOT NULL,
  `KetThucLuc` datetime(6) NOT NULL,
  `MucDoUuTien` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaDotKiemKe` bigint unsigned DEFAULT NULL,
  `MaDonMuaHang` bigint unsigned DEFAULT NULL,
  `MaNguoiTao` bigint unsigned NOT NULL,
  `PhienBan` int NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `MaYeuCauKho` bigint unsigned DEFAULT NULL,
  `LoaiCongViec` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MaNguoiPhuTrach` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_CongViec_1` (`Ma`),
  KEY `KhoaNgoai_CongViec_MaDonMuaHang` (`MaDonMuaHang`),
  KEY `KhoaNgoai_CongViec_MaDotKiemKe` (`MaDotKiemKe`),
  KEY `KhoaNgoai_CongViec_MaNguoiTao` (`MaNguoiTao`),
  KEY `KhoaNgoai_CongViec_NguoiPhuTrach` (`MaNguoiPhuTrach`),
  KEY `KhoaNgoai_CongViec_YeuCauKho` (`MaYeuCauKho`),
  CONSTRAINT `KhoaNgoai_CongViec_MaDonMuaHang` FOREIGN KEY (`MaDonMuaHang`) REFERENCES `DonMuaHang` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_CongViec_MaDotKiemKe` FOREIGN KEY (`MaDotKiemKe`) REFERENCES `DotKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_CongViec_MaNguoiTao` FOREIGN KEY (`MaNguoiTao`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_CongViec_NguoiPhuTrach` FOREIGN KEY (`MaNguoiPhuTrach`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_CongViec_YeuCauKho` FOREIGN KEY (`MaYeuCauKho`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `CongViec_chk_1` CHECK ((`KetThucLuc` > `BatDauLuc`)),
  CONSTRAINT `CongViec_chk_2` CHECK ((`MucDoUuTien` in (_utf8mb4'LOW',_utf8mb4'NORMAL',_utf8mb4'HIGH'))),
  CONSTRAINT `CongViec_chk_3` CHECK ((`TrangThai` in (_utf8mb4'PLANNED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanCongCongViec` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaCongViec` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhanCongCongViec_1` (`MaCongViec`,`MaNguoiDung`),
  KEY `KhoaNgoai_PhanCongCongViec_MaNguoiDung` (`MaNguoiDung`),
  CONSTRAINT `KhoaNgoai_PhanCongCongViec_MaCongViec` FOREIGN KEY (`MaCongViec`) REFERENCES `CongViec` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongCongViec_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `LoLichKiemTra` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaLichKiemTra` bigint unsigned NOT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `SoLuongDem` decimal(18,3) DEFAULT NULL,
  `NguoiDem` bigint unsigned DEFAULT NULL,
  `ThoiDiemDem` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_LoLichKiemTra` (`MaLichKiemTra`,`MaChiTietLo`),
  KEY `KhoaNgoai_LoLichKiemTra_LoHang` (`MaChiTietLo`),
  CONSTRAINT `KhoaNgoai_LoLichKiemTra_DotKiemKe` FOREIGN KEY (`MaLichKiemTra`) REFERENCES `DotKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_LoLichKiemTra_LoHang` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanCongLichKiemTra` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaLichKiemTra` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_PhanCongLichKiemTra` (`MaLichKiemTra`,`MaNguoiDung`),
  KEY `KhoaNgoai_PhanCongLichKiemTra_NguoiDung` (`MaNguoiDung`),
  CONSTRAINT `KhoaNgoai_PhanCongLichKiemTra_DotKiemKe` FOREIGN KEY (`MaLichKiemTra`) REFERENCES `DotKiemKe` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongLichKiemTra_NguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhanCongKho` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaYeuCauKho` bigint unsigned NOT NULL,
  `MaCongViec` bigint unsigned NOT NULL,
  `MaChiTietYeuCauKho` bigint unsigned NOT NULL,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `MaChiTietLo` bigint unsigned NOT NULL,
  `MaViTriKho` bigint unsigned NOT NULL,
  `NhomChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoLuong` decimal(18,3) NOT NULL,
  `SoLuongDaGhi` decimal(18,3) NOT NULL DEFAULT '0.000',
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  KEY `ChiMuc_PhanCongKho_YeuCau` (`MaYeuCauKho`,`MaChiTietYeuCauKho`),
  KEY `ChiMuc_PhanCongKho_Ton` (`MaChiTietLo`,`MaViTriKho`,`NhomChatLuong`),
  KEY `KhoaNgoai_PhanCongKho_CongViec` (`MaCongViec`),
  KEY `KhoaNgoai_PhanCongKho_Dong` (`MaChiTietYeuCauKho`),
  KEY `KhoaNgoai_PhanCongKho_Nguoi` (`MaNguoiDung`),
  KEY `KhoaNgoai_PhanCongKho_ViTri` (`MaViTriKho`),
  CONSTRAINT `KhoaNgoai_PhanCongKho_CongViec` FOREIGN KEY (`MaCongViec`) REFERENCES `CongViec` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKho_Dong` FOREIGN KEY (`MaChiTietYeuCauKho`) REFERENCES `ChiTietPhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKho_Lo` FOREIGN KEY (`MaChiTietLo`) REFERENCES `ChiTietLo` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKho_Nguoi` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKho_ViTri` FOREIGN KEY (`MaViTriKho`) REFERENCES `ViTriKho` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_PhanCongKho_YeuCauKho` FOREIGN KEY (`MaYeuCauKho`) REFERENCES `PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `PhanCongKho_chk_1` CHECK ((`NhomChatLuong` = _utf8mb4'AVAILABLE')),
  CONSTRAINT `PhanCongKho_chk_2` CHECK (((`SoLuong` > 0) and (`SoLuongDaGhi` >= 0) and (`SoLuongDaGhi` <= `SoLuong`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `YeuCauChongLap` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `ThaoTac` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `KhoaChongLap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaBamYeuCau` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaPhanHoi` smallint NOT NULL,
  `NoiDungPhanHoi` json NOT NULL,
  `HetHanLuc` datetime(6) NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_YeuCauChongLap_1` (`MaNguoiDung`,`ThaoTac`,`KhoaChongLap`),
  CONSTRAINT `KhoaNgoai_YeuCauChongLap_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `NhatKyHeThong` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaNguoiThucHien` bigint unsigned DEFAULT NULL,
  `LoaiTaiNguyen` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaTaiNguyen` bigint unsigned NOT NULL,
  `HanhDong` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DuLieuTruoc` json DEFAULT NULL,
  `DuLieuSau` json DEFAULT NULL,
  `MaYeuCau` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  KEY `ChiMuc_NhatKyHeThong_1` (`LoaiTaiNguyen`,`MaTaiNguyen`,`NgayTao`),
  KEY `KhoaNgoai_NhatKyHeThong_MaNguoiThucHien` (`MaNguoiThucHien`),
  CONSTRAINT `KhoaNgoai_NhatKyHeThong_MaNguoiThucHien` FOREIGN KEY (`MaNguoiThucHien`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `ThongBao` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaNguoiDung` bigint unsigned NOT NULL,
  `TieuDeThongBao` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NoiDung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `LoaiTaiNguyen` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaTaiNguyen` bigint unsigned NOT NULL,
  `NgayDoc` datetime(6) DEFAULT NULL,
  `KhoaThongBao` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_ThongBao_1` (`MaNguoiDung`,`KhoaThongBao`),
  KEY `ChiMuc_ThongBao_1` (`MaNguoiDung`,`NgayDoc`,`NgayTao`),
  CONSTRAINT `KhoaNgoai_ThongBao_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE TABLE `PhienDangNhap` (
  `MaPhien` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `HetHanLuc` bigint unsigned NOT NULL,
  `DuLieu` json NOT NULL,
  PRIMARY KEY (`MaPhien`),
  KEY `ChiMuc_PhienDangNhap_HetHanLuc` (`HetHanLuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `BaoCaoSanXuat` AS select `BanBaoCaoSanXuat`.`MaBanGhi` AS `MaBanGhi`,`BanBaoCaoSanXuat`.`Ma` AS `Ma`,`BanBaoCaoSanXuat`.`MaKeHoachSanXuat` AS `MaKeHoachSanXuat`,`BanBaoCaoSanXuat`.`MaNguoiTao` AS `MaNguoiTao`,`BanBaoCaoSanXuat`.`GhiChu` AS `GhiChu`,`BanBaoCaoSanXuat`.`TrangThai` AS `TrangThai`,`BanBaoCaoSanXuat`.`NgayGui` AS `NgayGui`,`BanBaoCaoSanXuat`.`PhienBan` AS `PhienBan`,`BanBaoCaoSanXuat`.`NgayTao` AS `NgayTao`,`BanBaoCaoSanXuat`.`NgayCapNhat` AS `NgayCapNhat`,`BanBaoCaoSanXuat`.`MucDichBaoCao` AS `MucDichBaoCao`,`BanBaoCaoSanXuat`.`PhanTramTienDo` AS `PhanTramTienDo`,`BanBaoCaoSanXuat`.`GuiBoPhanLapKeHoach` AS `GuiBoPhanLapKeHoach` from `BanBaoCaoSanXuat` where (`BanBaoCaoSanXuat`.`LoaiBaoCao` = 'SAN_XUAT') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `BaoCaoThanhPham` AS select `BanBaoCaoSanXuat`.`MaBanGhi` AS `MaBanGhi`,`BanBaoCaoSanXuat`.`Ma` AS `Ma`,`BanBaoCaoSanXuat`.`MaKeHoachSanXuat` AS `MaKeHoachSanXuat`,`BanBaoCaoSanXuat`.`MaNguoiTao` AS `MaNguoiTao`,`BanBaoCaoSanXuat`.`GhiChu` AS `GhiChu`,`BanBaoCaoSanXuat`.`TrangThai` AS `TrangThai`,`BanBaoCaoSanXuat`.`NgayGui` AS `NgayGui`,`BanBaoCaoSanXuat`.`PhienBan` AS `PhienBan`,`BanBaoCaoSanXuat`.`NgayTao` AS `NgayTao`,`BanBaoCaoSanXuat`.`NgayCapNhat` AS `NgayCapNhat`,`BanBaoCaoSanXuat`.`NgayHoanThanh` AS `NgayHoanThanh`,`BanBaoCaoSanXuat`.`LoaiBaoCao` AS `LoaiBaoCao`,`BanBaoCaoSanXuat`.`XacNhanHoanTat` AS `XacNhanHoanTat`,`BanBaoCaoSanXuat`.`KieuThanhPham` AS `KieuThanhPham` from `BanBaoCaoSanXuat` where (`BanBaoCaoSanXuat`.`LoaiBaoCao` = 'THANH_PHAM') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `ChiTietNhuCauSanXuat` AS select `ChiTietBaoCaoSanXuat`.`MaBanGhi` AS `MaBanGhi`,`ChiTietBaoCaoSanXuat`.`MaBaoCaoSanXuat` AS `MaBaoCaoSanXuat`,`ChiTietBaoCaoSanXuat`.`MaMatHang` AS `MaMatHang`,`ChiTietBaoCaoSanXuat`.`SoLuongHienCo` AS `SoLuongHienCo`,`ChiTietBaoCaoSanXuat`.`SoLuongCan` AS `SoLuongCan`,`ChiTietBaoCaoSanXuat`.`NgayTao` AS `NgayTao`,`ChiTietBaoCaoSanXuat`.`NgayCapNhat` AS `NgayCapNhat` from `ChiTietBaoCaoSanXuat` where (`ChiTietBaoCaoSanXuat`.`LoaiChiTiet` = 'NHU_CAU') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `NguyenLieuSuDung` AS select `ChiTietBaoCaoSanXuat`.`MaBanGhi` AS `MaBanGhi`,`ChiTietBaoCaoSanXuat`.`MaBaoCaoSanXuat` AS `MaBaoCaoThanhPham`,`ChiTietBaoCaoSanXuat`.`MaMatHang` AS `MaMatHang`,`ChiTietBaoCaoSanXuat`.`SoLuongSuDung` AS `SoLuongSuDung`,`ChiTietBaoCaoSanXuat`.`LoaiChiTiet` AS `LoaiChiTiet`,`ChiTietBaoCaoSanXuat`.`NgayTao` AS `NgayTao`,`ChiTietBaoCaoSanXuat`.`NgayCapNhat` AS `NgayCapNhat` from `ChiTietBaoCaoSanXuat` where (`ChiTietBaoCaoSanXuat`.`LoaiChiTiet` = 'NVL_SU_DUNG') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `ThanhPhamKeHoachTuongThich` AS select `ChiTietKeHoachSanXuat`.`MaBanGhi` AS `MaBanGhi`,`ChiTietKeHoachSanXuat`.`MaKeHoachSanXuat` AS `MaKeHoachSanXuat`,`ChiTietKeHoachSanXuat`.`MaMatHang` AS `MaMatHang`,`ChiTietKeHoachSanXuat`.`SoLuong` AS `SoLuong`,`ChiTietKeHoachSanXuat`.`NgayTao` AS `NgayTao`,`ChiTietKeHoachSanXuat`.`NgayCapNhat` AS `NgayCapNhat` from `ChiTietKeHoachSanXuat` where (`ChiTietKeHoachSanXuat`.`LoaiChiTiet` = 'THANH_PHAM') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `ChiTietNguyenLieuKeHoachSanXuat` AS select `ChiTietKeHoachSanXuat`.`MaBanGhi` AS `MaBanGhi`,`ChiTietKeHoachSanXuat`.`MaKeHoachSanXuat` AS `MaKeHoachSanXuat`,`ChiTietKeHoachSanXuat`.`MaMatHang` AS `MaMatHang`,`ChiTietKeHoachSanXuat`.`SoLuongCan` AS `SoLuongCan`,`ChiTietKeHoachSanXuat`.`LoaiChiTiet` AS `LoaiChiTiet`,`ChiTietKeHoachSanXuat`.`SoLuongConThieu` AS `SoLuongConThieu`,`ChiTietKeHoachSanXuat`.`SoLuongGoc` AS `SoLuongGoc`,`ChiTietKeHoachSanXuat`.`TyLeDuPhong` AS `TyLeDuPhong`,`ChiTietKeHoachSanXuat`.`NgayTao` AS `NgayTao`,`ChiTietKeHoachSanXuat`.`NgayCapNhat` AS `NgayCapNhat` from `ChiTietKeHoachSanXuat` where (`ChiTietKeHoachSanXuat`.`LoaiChiTiet` = 'NGUYEN_VAT_LIEU') WITH CASCADED CHECK OPTION;
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `BienBanKiemKe` AS select `PhieuKiemKe`.`MaBanGhi` AS `MaBanGhi`,concat('BB-',`PhieuKiemKe`.`MaBanGhi`) AS `Ma`,`PhieuKiemKe`.`MaBanGhi` AS `MaKhoKiemKe`,`PhieuKiemKe`.`MaNguoiTao` AS `MaNguoiTao`,`PhieuKiemKe`.`TrangThaiBienBan` AS `TrangThai`,`PhieuKiemKe`.`NhanXet` AS `NhanXet`,`PhieuKiemKe`.`NgayGui` AS `NgayGui`,`PhieuKiemKe`.`PhienBan` AS `PhienBan`,`PhieuKiemKe`.`NgayTao` AS `NgayTao`,`PhieuKiemKe`.`NgayCapNhat` AS `NgayCapNhat` from `PhieuKiemKe` where (`PhieuKiemKe`.`NhanXet` is not null);
-- statement-end
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `HoSoKho` AS select `r`.`MaBanGhi` AS `MaBanGhi`,`r`.`MaBanGhi` AS `MaYeuCauKho`,`r`.`MaNguoiPhuTrach` AS `MaNguoiPhuTrach`,`r`.`GhiChu` AS `GhiChu`,`r`.`NgayTao` AS `NgayTao`,`r`.`NgayCapNhat` AS `NgayCapNhat` from `PhieuYeuCauNhapXuat` `r` where exists(select 1 from `PhieuKho` `d` where (`d`.`MaYeuCauKho` = `r`.`MaBanGhi`));
-- statement-end
CREATE TRIGGER `TaoHeaderLoTuongThich` BEFORE INSERT ON `ChiTietLo` FOR EACH ROW BEGIN
 IF NEW.MaLoHang IS NULL THEN
  INSERT INTO LoHang (Ma,LoaiLo) VALUES (NEW.Ma,IF(NEW.MaKeHoachSanXuat IS NULL,'NGUYEN_VAT_LIEU','THANH_PHAM'));
  SET NEW.MaLoHang=LAST_INSERT_ID();
 END IF;
END;
-- statement-end
SET FOREIGN_KEY_CHECKS=1;
