-- Reference snapshot exported from the current service schema. No seed data; migration/checkpoint provisioning is separate.
-- Provision ALL databases before restoring cross-schema FKs/views.
CREATE DATABASE IF NOT EXISTS `KhoHang_Reporting` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `KhoHang_Reporting`;
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `LuuTruHoSoKhoTruoc013` (
  `MaBanGhi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `MaYeuCauKho` bigint unsigned NOT NULL,
  `MaNguoiPhuTrach` bigint unsigned NOT NULL,
  `GhiChu` text COLLATE utf8mb4_unicode_ci,
  `NgayTao` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `NgayCapNhat` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`MaBanGhi`),
  UNIQUE KEY `DuyNhat_HoSoKho_YeuCau` (`MaYeuCauKho`),
  KEY `KhoaNgoai_HoSoKho_Nguoi` (`MaNguoiPhuTrach`),
  CONSTRAINT `KhoaNgoai_HoSoKho_Nguoi` FOREIGN KEY (`MaNguoiPhuTrach`) REFERENCES `KhoHang_Identity`.`NguoiDung` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `KhoaNgoai_HoSoKho_YeuCau` FOREIGN KEY (`MaYeuCauKho`) REFERENCES `KhoHang_Warehouse`.`PhieuYeuCauNhapXuat` (`MaBanGhi`) ON DELETE RESTRICT ON UPDATE RESTRICT
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
CREATE ALGORITHM=UNDEFINED  SQL SECURITY INVOKER VIEW `KhoHang_Reporting`.`HoSoKho` AS select `r`.`MaBanGhi` AS `MaBanGhi`,`r`.`MaBanGhi` AS `MaYeuCauKho`,`r`.`MaNguoiPhuTrach` AS `MaNguoiPhuTrach`,`r`.`GhiChu` AS `GhiChu`,`r`.`NgayTao` AS `NgayTao`,`r`.`NgayCapNhat` AS `NgayCapNhat` from `KhoHang_Warehouse`.`PhieuYeuCauNhapXuat` `r` where exists(select 1 from `KhoHang_Warehouse`.`PhieuKho` `d` where (`d`.`MaYeuCauKho` = `r`.`MaBanGhi`));
SET FOREIGN_KEY_CHECKS=1;
