ALTER TABLE NguyenVatLieu ADD COLUMN BangGiaNCC JSON NULL;
-- statement-end
UPDATE NguyenVatLieu n JOIN MatHang m ON m.MaBanGhi=n.MaMatHang SET n.BangGiaNCC=m.BangGiaNCC;
-- statement-end
ALTER TABLE MatHang DROP COLUMN BangGiaNCC;
