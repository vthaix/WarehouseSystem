-- Report is the actual purchasing demand; production plans are estimates only.
ALTER TABLE KeHoachMuaBan
  ADD COLUMN MaBaoCaoSanXuat BIGINT UNSIGNED NULL,
  ADD CONSTRAINT FK_KeHoachMuaBan_BaoCaoSanXuat FOREIGN KEY (MaBaoCaoSanXuat)
    REFERENCES BaoCaoSanXuat(MaBanGhi),
  ADD INDEX IX_KeHoachMuaBan_BaoCaoSanXuat (MaBaoCaoSanXuat, Kieu, TrangThai);

UPDATE KeHoachMuaBan p
JOIN PhieuYeuCauNhapXuat r ON r.MaBanGhi=p.MaYeuCauNguon
SET p.MaBaoCaoSanXuat=r.MaBaoCaoSanXuat
WHERE p.MaBaoCaoSanXuat IS NULL;
