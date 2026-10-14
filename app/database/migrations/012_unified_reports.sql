RENAME TABLE BaoCaoSanXuat TO BanBaoCaoSanXuat;
ALTER TABLE BanBaoCaoSanXuat ADD COLUMN LoaiBaoCao VARCHAR(20) NOT NULL DEFAULT 'SAN_XUAT',
 ADD COLUMN NgayHoanThanh DATE NULL, ADD COLUMN MaThanhPhamCu BIGINT UNSIGNED NULL UNIQUE,
 ADD CONSTRAINT CK_BaoCao_Loai CHECK (LoaiBaoCao IN ('SAN_XUAT','THANH_PHAM'));
INSERT INTO BanBaoCaoSanXuat (Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat,LoaiBaoCao,NgayHoanThanh,MaThanhPhamCu)
SELECT Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat,'THANH_PHAM',NgayHoanThanh,MaBanGhi FROM BaoCaoThanhPham;
ALTER TABLE KeHoachMuaBan DROP FOREIGN KEY FK_KeHoachMuaBan_ThanhPham;
ALTER TABLE ThanhPhamBaoCao DROP FOREIGN KEY KhoaNgoai_ThanhPhamBaoCao_MaBaoCaoThanhPham;
ALTER TABLE NguyenLieuSuDung DROP FOREIGN KEY KhoaNgoai_NguyenLieuSuDung_MaBaoCaoThanhPham;
UPDATE KeHoachMuaBan p JOIN BanBaoCaoSanXuat b ON b.MaThanhPhamCu=p.MaBaoCaoThanhPham SET p.MaBaoCaoThanhPham=b.MaBanGhi;
UPDATE ThanhPhamBaoCao p JOIN BanBaoCaoSanXuat b ON b.MaThanhPhamCu=p.MaBaoCaoThanhPham SET p.MaBaoCaoThanhPham=b.MaBanGhi;
UPDATE NguyenLieuSuDung p JOIN BanBaoCaoSanXuat b ON b.MaThanhPhamCu=p.MaBaoCaoThanhPham SET p.MaBaoCaoThanhPham=b.MaBanGhi;
ALTER TABLE KeHoachMuaBan ADD CONSTRAINT FK_KeHoachMuaBan_ThanhPham FOREIGN KEY (MaBaoCaoThanhPham) REFERENCES BanBaoCaoSanXuat(MaBanGhi);
ALTER TABLE ThanhPhamBaoCao ADD CONSTRAINT FK_ThanhPhamBaoCao_Chung FOREIGN KEY (MaBaoCaoThanhPham) REFERENCES BanBaoCaoSanXuat(MaBanGhi);
RENAME TABLE BaoCaoThanhPham TO LuuTruBaoCaoThanhPhamTruoc012;
ALTER TABLE ChiTietBaoCaoSanXuat MODIFY SoLuongHienCo DECIMAL(18,3) NULL, MODIFY SoLuongCan DECIMAL(18,3) NULL,
 ADD COLUMN LoaiChiTiet VARCHAR(24) NOT NULL DEFAULT 'NHU_CAU', ADD COLUMN SoLuong DECIMAL(18,3) NULL,
 ADD COLUMN SoLuongSuDung DECIMAL(18,3) NULL;
INSERT INTO ChiTietBaoCaoSanXuat (MaBaoCaoSanXuat,MaMatHang,LoaiChiTiet,SoLuong)
SELECT o.MaBaoCaoThanhPham,l.MaMatHang,'THANH_PHAM',SUM(o.SoLuong) FROM ThanhPhamBaoCao o JOIN ChiTietLo l ON l.MaBanGhi=o.MaChiTietLo GROUP BY o.MaBaoCaoThanhPham,l.MaMatHang;
INSERT INTO ChiTietBaoCaoSanXuat (MaBaoCaoSanXuat,MaMatHang,LoaiChiTiet,SoLuongSuDung,NgayTao,NgayCapNhat)
SELECT MaBaoCaoThanhPham,MaMatHang,'NVL_SU_DUNG',SoLuongSuDung,NgayTao,NgayCapNhat FROM NguyenLieuSuDung;
ALTER TABLE ThanhPhamBaoCao ADD COLUMN MaChiTietBaoCao BIGINT UNSIGNED NULL;
UPDATE ThanhPhamBaoCao o JOIN ChiTietLo l ON l.MaBanGhi=o.MaChiTietLo JOIN ChiTietBaoCaoSanXuat d ON d.MaBaoCaoSanXuat=o.MaBaoCaoThanhPham AND d.MaMatHang=l.MaMatHang SET o.MaChiTietBaoCao=d.MaBanGhi;
ALTER TABLE ThanhPhamBaoCao ADD CONSTRAINT FK_ChiTietLoBaoCao_Dong FOREIGN KEY (MaChiTietBaoCao) REFERENCES ChiTietBaoCaoSanXuat(MaBanGhi);
RENAME TABLE ThanhPhamBaoCao TO ChiTietLoBaoCaoSanXuat, NguyenLieuSuDung TO LuuTruNguyenLieuSuDungTruoc012;
CREATE VIEW BaoCaoSanXuat AS SELECT MaBanGhi,Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat FROM BanBaoCaoSanXuat WHERE LoaiBaoCao='SAN_XUAT' WITH CASCADED CHECK OPTION;
CREATE VIEW BaoCaoThanhPham AS SELECT MaBanGhi,Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat,NgayHoanThanh,LoaiBaoCao FROM BanBaoCaoSanXuat WHERE LoaiBaoCao='THANH_PHAM' WITH CASCADED CHECK OPTION;
CREATE VIEW ChiTietNhuCauSanXuat AS SELECT MaBanGhi,MaBaoCaoSanXuat,MaMatHang,SoLuongHienCo,SoLuongCan,NgayTao,NgayCapNhat FROM ChiTietBaoCaoSanXuat WHERE LoaiChiTiet='NHU_CAU' WITH CASCADED CHECK OPTION;
CREATE VIEW NguyenLieuSuDung AS SELECT MaBanGhi,MaBaoCaoSanXuat AS MaBaoCaoThanhPham,MaMatHang,SoLuongSuDung,LoaiChiTiet,NgayTao,NgayCapNhat FROM ChiTietBaoCaoSanXuat WHERE LoaiChiTiet='NVL_SU_DUNG' WITH CASCADED CHECK OPTION;
