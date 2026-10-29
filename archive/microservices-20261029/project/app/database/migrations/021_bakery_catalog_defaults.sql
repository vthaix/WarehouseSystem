-- Reference prices for unchanged demo defaults only; document prices stay unchanged.
UPDATE MatHang SET DonGiaThamKhao=35000,PhienBan=PhienBan+1 WHERE Ma='TP-001' AND Ten='Bánh quy bơ đóng gói 200 g' AND DonGiaThamKhao=1250000;
UPDATE MatHang SET DonGiaThamKhao=22000,PhienBan=PhienBan+1 WHERE Ma='TP-002' AND Ten='Bánh bông lan vani đóng gói 120 g' AND DonGiaThamKhao=1850000;
UPDATE MatHang SET DonGiaThamKhao=39000,PhienBan=PhienBan+1 WHERE Ma='TP-003' AND Ten='Bánh quy chocolate đóng gói 200 g' AND DonGiaThamKhao=3200000;
UPDATE MatHang SET DonGiaThamKhao=28000,PhienBan=PhienBan+1 WHERE Ma='TP-004' AND Ten='Bánh bông lan cuộn đóng gói 150 g' AND DonGiaThamKhao=2100000;
UPDATE MatHang SET DonGiaThamKhao=22000,PhienBan=PhienBan+1 WHERE Ma='NVL-002' AND Ten='Đường trắng làm bánh' AND DonGiaThamKhao=85000;
UPDATE MatHang SET DonGiaThamKhao=180000,PhienBan=PhienBan+1 WHERE Ma='NVL-003' AND Ten='Bơ lạt làm bánh' AND DonGiaThamKhao=120000;
UPDATE MatHang SET DonGiaThamKhao=95000,PhienBan=PhienBan+1 WHERE Ma='PK-002' AND Ten='Sữa bột nguyên kem' AND DonGiaThamKhao=45000;
-- Change demo units only before any document has referenced the item.
UPDATE MatHang SET MaDonViTinh=(SELECT MaBanGhi FROM DonViTinh WHERE Ten='kg' ORDER BY MaBanGhi LIMIT 1),PhienBan=PhienBan+1 WHERE ((Ma='NVL-002' AND Ten='Đường trắng làm bánh') OR (Ma='PK-002' AND Ten='Sữa bột nguyên kem')) AND MaDonViTinh IN (SELECT MaBanGhi FROM DonViTinh WHERE Ten IN ('mét','bộ')) AND EXISTS (SELECT 1 FROM DonViTinh WHERE Ten='kg')
AND NOT EXISTS (SELECT 1 FROM ChiTietBaoCaoSanXuat r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietDonHang r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietDonMuaHang r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietKeHoachMuaBan r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietKeHoachSanXuat r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietLo r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM ChiTietPhieuYeuCauNhapXuat r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM LuuTruNguyenLieuKeHoachTruoc009 r WHERE r.MaMatHang=MatHang.MaBanGhi)
AND NOT EXISTS (SELECT 1 FROM LuuTruNguyenLieuSuDungTruoc012 r WHERE r.MaMatHang=MatHang.MaBanGhi);
