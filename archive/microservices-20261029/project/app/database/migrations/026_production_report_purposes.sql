-- Shared report header; preserve old demand reports and historical finished reports.
ALTER TABLE BanBaoCaoSanXuat
 ADD COLUMN MucDichBaoCao VARCHAR(20) NULL,
 ADD COLUMN PhanTramTienDo DECIMAL(5,2) NULL,
 ADD COLUMN GuiBoPhanLapKeHoach BOOLEAN NOT NULL DEFAULT 0,
 ADD COLUMN XacNhanHoanTat BOOLEAN NULL,
 ADD CONSTRAINT CK_BaoCao_MucDich CHECK (MucDichBaoCao IS NULL OR MucDichBaoCao IN ('NHU_CAU','TIEN_DO','SU_CO')),
 ADD CONSTRAINT CK_BaoCao_TienDo CHECK (PhanTramTienDo IS NULL OR PhanTramTienDo BETWEEN 0 AND 100);
UPDATE BanBaoCaoSanXuat SET MucDichBaoCao='NHU_CAU',GuiBoPhanLapKeHoach=1 WHERE LoaiBaoCao='SAN_XUAT';
CREATE OR REPLACE VIEW BaoCaoSanXuat AS SELECT MaBanGhi,Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat,MucDichBaoCao,PhanTramTienDo,GuiBoPhanLapKeHoach FROM BanBaoCaoSanXuat WHERE LoaiBaoCao='SAN_XUAT' WITH CASCADED CHECK OPTION;
CREATE OR REPLACE VIEW BaoCaoThanhPham AS SELECT MaBanGhi,Ma,MaKeHoachSanXuat,MaNguoiTao,GhiChu,TrangThai,NgayGui,PhienBan,NgayTao,NgayCapNhat,NgayHoanThanh,LoaiBaoCao,XacNhanHoanTat FROM BanBaoCaoSanXuat WHERE LoaiBaoCao='THANH_PHAM' WITH CASCADED CHECK OPTION;
