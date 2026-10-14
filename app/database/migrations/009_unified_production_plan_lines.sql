-- Preserve output IDs. Old material IDs are retained as migration provenance.
ALTER TABLE ChiTietKeHoachSanXuat
  MODIFY COLUMN SoLuong DECIMAL(18,3) NULL,
  ADD COLUMN LoaiChiTiet VARCHAR(24) NOT NULL DEFAULT 'THANH_PHAM',
  ADD COLUMN SoLuongCan DECIMAL(18,3) NULL,
  ADD COLUMN SoLuongConThieu DECIMAL(18,3) NULL,
  ADD COLUMN MaNguyenLieuCu BIGINT UNSIGNED NULL,
  ADD CONSTRAINT CK_ChiTietKeHoachSanXuat_Loai CHECK (
    (LoaiChiTiet='THANH_PHAM' AND SoLuong IS NOT NULL AND SoLuong>0 AND SoLuongCan IS NULL AND SoLuongConThieu IS NULL)
    OR (LoaiChiTiet='NGUYEN_VAT_LIEU' AND SoLuong IS NULL AND SoLuongCan IS NOT NULL AND SoLuongCan>0 AND (SoLuongConThieu IS NULL OR (SoLuongConThieu>=0 AND SoLuongConThieu<=SoLuongCan)))
  ),
  ADD UNIQUE KEY UQ_ChiTietKeHoachSanXuat_NguonCu (MaNguyenLieuCu);

INSERT INTO ChiTietKeHoachSanXuat
  (MaKeHoachSanXuat,MaMatHang,LoaiChiTiet,SoLuongCan,MaNguyenLieuCu,NgayTao,NgayCapNhat)
SELECT MaKeHoachSanXuat,MaMatHang,'NGUYEN_VAT_LIEU',SoLuongCan,MaBanGhi,NgayTao,NgayCapNhat
FROM ChiTietNguyenLieuKeHoachSanXuat;

RENAME TABLE ChiTietNguyenLieuKeHoachSanXuat TO LuuTruNguyenLieuKeHoachTruoc009;

CREATE VIEW ThanhPhamKeHoachTuongThich AS
SELECT MaBanGhi,MaKeHoachSanXuat,MaMatHang,SoLuong,NgayTao,NgayCapNhat
FROM ChiTietKeHoachSanXuat WHERE LoaiChiTiet='THANH_PHAM' WITH CASCADED CHECK OPTION;

CREATE VIEW ChiTietNguyenLieuKeHoachSanXuat AS
SELECT MaBanGhi,MaKeHoachSanXuat,MaMatHang,SoLuongCan,LoaiChiTiet,SoLuongConThieu,NgayTao,NgayCapNhat
FROM ChiTietKeHoachSanXuat WHERE LoaiChiTiet='NGUYEN_VAT_LIEU' WITH CASCADED CHECK OPTION;
