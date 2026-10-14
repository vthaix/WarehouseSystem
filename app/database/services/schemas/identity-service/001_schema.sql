-- Reference snapshot exported from the current service schema. No seed data; migration/checkpoint provisioning is separate.
-- Provision ALL databases before restoring cross-schema FKs/views.
CREATE DATABASE IF NOT EXISTS `KhoHang_Identity` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `KhoHang_Identity`;
SET FOREIGN_KEY_CHECKS=0;
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
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_NguoiDung_1` (`TenDangNhap`),
  UNIQUE KEY `DuyNhat_NguoiDung_2` (`ThuDienTu`),
  CONSTRAINT `NguoiDung_chk_1` CHECK ((`TrangThai` in (_utf8mb4'ACTIVE',_utf8mb4'LOCKED'))),
  CONSTRAINT `NguoiDung_chk_2` CHECK ((`SoLanDangNhapSai` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=739 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `VaiTro` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_VaiTro_1` (`Ma`)
) ENGINE=InnoDB AUTO_INCREMENT=1180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=727 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  CONSTRAINT `KhoaNgoai_NguoiDungXuong_MaXuong` FOREIGN KEY (`MaXuong`) REFERENCES `KhoHang_Business`.`Xuong` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `BoPhan` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Ma` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `Ma` (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
CREATE TABLE `LanThuDangNhap` (
  `KhoaLanThu` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BatDauCuaSo` bigint unsigned NOT NULL,
  `SoLan` int unsigned NOT NULL,
  PRIMARY KEY (`KhoaLanThu`),
  KEY `ChiMuc_LanThuDangNhap_BatDauCuaSo` (`BatDauCuaSo`),
  CONSTRAINT `LanThuDangNhap_chk_1` CHECK ((`SoLan` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `LichSuCSDL` (
  `Ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaBam` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayApDung` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Ten`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `TrangThaiDichVu` (
  `Ma` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayHoanThanh` datetime(6) NOT NULL,
  PRIMARY KEY (`Ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS=1;
