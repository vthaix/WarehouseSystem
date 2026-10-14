-- Preserve old PLAN orders and report-sourced requests. Never infer old sources.
ALTER TABLE DonMuaHang MODIFY MaKeHoachKinhDoanh BIGINT UNSIGNED NULL,
 ADD COLUMN LoaiNguonDonMua VARCHAR(20) NOT NULL DEFAULT 'PLAN',
 ADD CONSTRAINT CK_DonMua_Nguon CHECK (
  (LoaiNguonDonMua='PLAN' AND MaKeHoachKinhDoanh IS NOT NULL)
  OR (LoaiNguonDonMua='REPORT' AND MaKeHoachKinhDoanh IS NULL AND MaBaoCaoSanXuat IS NOT NULL)
  OR (LoaiNguonDonMua='MANUAL' AND MaKeHoachKinhDoanh IS NULL AND MaBaoCaoSanXuat IS NULL)
 );
ALTER TABLE ChiTietDonMuaHang MODIFY MaChiTietKeHoachKinhDoanh BIGINT UNSIGNED NULL;
ALTER TABLE PhieuYeuCauNhapXuat
 ADD COLUMN LoaiNguonSanXuat VARCHAR(20) NOT NULL DEFAULT 'REPORT',
 ADD CONSTRAINT CK_YeuCau_LoaiNguonSX CHECK (
  LoaiNguonSanXuat='REPORT'
  OR (LoaiNguonSanXuat='PLAN' AND PhuongThuc='PRODUCTION_ISSUE' AND MaKeHoachSanXuat IS NOT NULL AND MaBaoCaoSanXuat IS NULL)
 );
