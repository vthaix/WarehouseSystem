RENAME TABLE HoSoKho TO LuuTruHoSoKhoTruoc013;
CREATE VIEW HoSoKho AS
SELECT r.MaBanGhi,r.MaBanGhi AS MaYeuCauKho,r.MaNguoiPhuTrach,r.GhiChu,r.NgayTao,r.NgayCapNhat
FROM PhieuYeuCauNhapXuat r WHERE EXISTS (SELECT 1 FROM PhieuKho d WHERE d.MaYeuCauKho=r.MaBanGhi);
