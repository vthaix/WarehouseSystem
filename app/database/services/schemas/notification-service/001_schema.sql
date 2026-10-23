-- Reference snapshot exported from the current service schema. No seed data; migration/checkpoint provisioning is separate.
-- Provision ALL databases before restoring cross-schema FKs/views.
CREATE DATABASE IF NOT EXISTS `KhoHang_Notification` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `KhoHang_Notification`;
SET FOREIGN_KEY_CHECKS=0;
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
  CONSTRAINT `KhoaNgoai_ThongBao_MaNguoiDung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `KhoHang_Identity`.`NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=976 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
