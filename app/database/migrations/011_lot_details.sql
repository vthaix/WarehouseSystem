-- All existing foreign keys follow the renamed detail table; IDs are preserved.
RENAME TABLE LoHang TO ChiTietLo;
-- statement-end
CREATE TABLE LoHang (
 MaBanGhi BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 Ma VARCHAR(50) NOT NULL UNIQUE,
 LoaiLo VARCHAR(24) NOT NULL,
 NgayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 GhiChu TEXT NULL,
 CONSTRAINT CK_LoHang_Loai CHECK (LoaiLo IN ('NGUYEN_VAT_LIEU','THANH_PHAM','TRA_VE'))
) ENGINE=InnoDB;
-- statement-end
INSERT INTO LoHang (MaBanGhi,Ma,LoaiLo,NgayTao)
SELECT MaBanGhi,Ma,IF(MaKeHoachSanXuat IS NULL,'NGUYEN_VAT_LIEU','THANH_PHAM'),NgayTao FROM ChiTietLo;
-- statement-end
ALTER TABLE ChiTietLo ADD COLUMN MaLoHang BIGINT UNSIGNED NULL,
 ADD CONSTRAINT FK_ChiTietLo_Header FOREIGN KEY (MaLoHang) REFERENCES LoHang(MaBanGhi);
-- statement-end
UPDATE ChiTietLo SET MaLoHang=MaBanGhi;
-- statement-end
ALTER TABLE BienDongKho RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE ChiTietKetQuaKiemTraQCAC RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE ChiTietPhieuKho RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE ChiTietPhieuKiemKe RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE LoLichKiemTra RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE PhanCongKho RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE ThanhPhamBaoCao RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
ALTER TABLE TonKho RENAME COLUMN MaLoHang TO MaChiTietLo;
-- statement-end
CREATE TRIGGER TaoHeaderLoTuongThich BEFORE INSERT ON ChiTietLo FOR EACH ROW
BEGIN
 IF NEW.MaLoHang IS NULL THEN
  INSERT INTO LoHang (Ma,LoaiLo) VALUES (NEW.Ma,IF(NEW.MaKeHoachSanXuat IS NULL,'NGUYEN_VAT_LIEU','THANH_PHAM'));
  SET NEW.MaLoHang=LAST_INSERT_ID();
 END IF;
END;
