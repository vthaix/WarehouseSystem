-- Keep applied schema/checksums intact. Rename existing tables without deleting data.
RENAME TABLE KeHoachKinhDoanh TO KeHoachMuaBan,
  ChiTietKeHoachKinhDoanh TO ChiTietKeHoachMuaBan,
  ThanhPhamKeHoach TO ChiTietKeHoachSanXuat,
  NguyenLieuKeHoach TO ChiTietNguyenLieuKeHoachSanXuat,
  YeuCauKho TO PhieuYeuCauNhapXuat,
  ChiTietYeuCauKho TO ChiTietPhieuYeuCauNhapXuat,
  PhieuKiemTraChatLuong TO KetQuaKiemTraQCAC,
  ChiTietKiemTraChatLuong TO ChiTietKetQuaKiemTraQCAC,
  DeXuatXuLy TO DeXuatXuLyNgoaiLe,
  KhoKiemKe TO PhieuKiemKe,
  ChiTietKiemKe TO ChiTietPhieuKiemKe;

ALTER TABLE KeHoachMuaBan
  ADD COLUMN MaKeHoachSanXuat BIGINT UNSIGNED NULL,
  ADD CONSTRAINT KhoaNgoai_KeHoachMuaBan_SanXuat FOREIGN KEY (MaKeHoachSanXuat) REFERENCES KeHoachSanXuat(MaBanGhi) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT KiemTra_KeHoachMuaBan_NguonBan CHECK (Kieu='PURCHASE' OR (MaKeHoachSanXuat IS NULL AND MaYeuCauNguon IS NULL)),
  ADD INDEX ChiMuc_KeHoachMuaBan_SanXuat (MaKeHoachSanXuat,TrangThai);
