-- Reference snapshot exported from the current service schema. No seed data; migration/checkpoint provisioning is separate.
-- Provision ALL databases before restoring cross-schema FKs/views.
CREATE DATABASE IF NOT EXISTS `KhoHang_Gateway` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `KhoHang_Gateway`;
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `PhienDangNhap` (
  `MaPhien` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `HetHanLuc` bigint unsigned NOT NULL,
  `DuLieu` json NOT NULL,
  PRIMARY KEY (`MaPhien`),
  KEY `ChiMuc_PhienDangNhap_HetHanLuc` (`HetHanLuc`)
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
