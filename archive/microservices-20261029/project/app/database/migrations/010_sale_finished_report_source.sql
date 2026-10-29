ALTER TABLE KeHoachMuaBan
  ADD COLUMN MaBaoCaoThanhPham BIGINT UNSIGNED NULL,
  ADD CONSTRAINT FK_KeHoachMuaBan_ThanhPham FOREIGN KEY (MaBaoCaoThanhPham) REFERENCES BaoCaoThanhPham(MaBanGhi),
  ADD CONSTRAINT CK_KeHoachMuaBan_LoaiBaoCao CHECK (
    (Kieu='PURCHASE' AND MaBaoCaoThanhPham IS NULL)
    OR (Kieu='SALE' AND MaBaoCaoSanXuat IS NULL)
  );
