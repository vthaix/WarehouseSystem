ALTER TABLE PhieuYeuCauNhapXuat DROP CHECK KiemTra_YeuCauKho_Nguon;
ALTER TABLE PhieuYeuCauNhapXuat ADD CONSTRAINT CK_YeuCauKho_NguonBaoCao CHECK (
 (PhuongThuc='PURCHASE_RECEIPT' AND Kieu='IN' AND MaDonMuaHang IS NOT NULL AND MaKeHoachKinhDoanh IS NULL AND MaKeHoachSanXuat IS NULL AND MaBaoCaoSanXuat IS NULL)
 OR (PhuongThuc='SALE_ISSUE' AND Kieu='OUT' AND MaDonMuaHang IS NULL AND MaKeHoachKinhDoanh IS NOT NULL AND MaKeHoachSanXuat IS NULL AND MaBaoCaoSanXuat IS NULL)
 OR (PhuongThuc IN ('PRODUCTION_ISSUE','PRODUCTION_RECEIPT') AND ((PhuongThuc='PRODUCTION_ISSUE' AND Kieu='OUT') OR (PhuongThuc='PRODUCTION_RECEIPT' AND Kieu='IN')) AND MaDonMuaHang IS NULL AND MaKeHoachKinhDoanh IS NULL AND MaKeHoachSanXuat IS NOT NULL)
 OR (PhuongThuc='MATERIAL_PURCHASE' AND Kieu='PROCUREMENT' AND MaDonMuaHang IS NULL AND MaKeHoachKinhDoanh IS NULL AND MaKeHoachSanXuat IS NULL AND MaBaoCaoSanXuat IS NOT NULL)
);
-- Historical production requests retain NULL report source, without guessed backfill.
