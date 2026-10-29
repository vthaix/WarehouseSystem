ALTER TABLE PhieuKiemKe ADD COLUMN NhanXet TEXT NULL, ADD COLUMN TrangThaiBienBan VARCHAR(20) NOT NULL DEFAULT 'DRAFT', ADD COLUMN NgayGui DATETIME(6) NULL, ADD COLUMN MaNguoiTao BIGINT UNSIGNED NULL;
UPDATE PhieuKiemKe p JOIN BienBanKiemKe b ON b.MaKhoKiemKe=p.MaBanGhi SET p.NhanXet=b.NhanXet,p.TrangThaiBienBan=b.TrangThai,p.NgayGui=b.NgayGui,p.MaNguoiTao=b.MaNguoiTao;
RENAME TABLE BienBanKiemKe TO LuuTruBienBanKiemKeTruoc015;
CREATE VIEW BienBanKiemKe AS SELECT MaBanGhi,CONCAT('BB-',MaBanGhi) AS Ma,MaBanGhi AS MaKhoKiemKe,MaNguoiTao,TrangThaiBienBan AS TrangThai,NhanXet,NgayGui,PhienBan,NgayTao,NgayCapNhat FROM PhieuKiemKe WHERE NhanXet IS NOT NULL;
RENAME TABLE DeXuatXuLyNgoaiLe TO BanDeXuatXuLyNgoaiLe;
CREATE TABLE KetQuaXuLyNgoaiLe (
 MaBanGhi BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, MaDeXuatXuLy BIGINT UNSIGNED NOT NULL,
 PhienBanDeXuat INT NOT NULL, QuyetDinh VARCHAR(20) NOT NULL, MaNguoiDuyet BIGINT UNSIGNED NOT NULL,
 LyDo TEXT NULL, NgayDuyet DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT FK_KetQuaNgoaiLe_DeXuat FOREIGN KEY (MaDeXuatXuLy) REFERENCES BanDeXuatXuLyNgoaiLe(MaBanGhi),
 CONSTRAINT FK_KetQuaNgoaiLe_Nguoi FOREIGN KEY (MaNguoiDuyet) REFERENCES NguoiDung(MaBanGhi),
 CONSTRAINT CK_KetQuaNgoaiLe CHECK (QuyetDinh IN ('APPROVED','REJECTED')),
 UNIQUE KEY UQ_KetQuaNgoaiLe_PhienBan (MaDeXuatXuLy,PhienBanDeXuat)
) ENGINE=InnoDB;
ALTER TABLE ChiTietKeHoachSanXuat ADD COLUMN SoLuongGoc DECIMAL(18,3) NULL, ADD COLUMN TyLeDuPhong DECIMAL(5,2) NULL;
CREATE OR REPLACE VIEW ChiTietNguyenLieuKeHoachSanXuat AS SELECT MaBanGhi,MaKeHoachSanXuat,MaMatHang,SoLuongCan,LoaiChiTiet,SoLuongConThieu,SoLuongGoc,TyLeDuPhong,NgayTao,NgayCapNhat FROM ChiTietKeHoachSanXuat WHERE LoaiChiTiet='NGUYEN_VAT_LIEU' WITH CASCADED CHECK OPTION;
