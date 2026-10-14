ALTER TABLE DonMuaHang
  ADD COLUMN MaBaoCaoSanXuat BIGINT UNSIGNED NULL,
  ADD CONSTRAINT FK_DonMuaHang_BaoCaoSanXuat FOREIGN KEY (MaBaoCaoSanXuat)
    REFERENCES BaoCaoSanXuat(MaBanGhi);

UPDATE DonMuaHang d JOIN KeHoachMuaBan p ON p.MaBanGhi=d.MaKeHoachKinhDoanh
SET d.MaBaoCaoSanXuat=p.MaBaoCaoSanXuat
WHERE d.MaBaoCaoSanXuat IS NULL AND p.MaBaoCaoSanXuat IS NOT NULL;
