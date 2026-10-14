## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Thiết kế dữ liệu mục tiêu và khoảng cách MySQL

## Migration 026: mục đích và xác nhận hoàn tất báo cáo

BanBaoCaoSanXuat thêm MucDichBaoCao, PhanTramTienDo, GuiBoPhanLapKeHoach và XacNhanHoanTat. Báo cáo SAN_XUAT cũ giữ NHU_CAU/gửi planner như quy trình trước; các báo cáo thành phẩm cũ giữ xác nhận NULL để không suy đoán. Hai view báo cáo vẫn trỏ một bảng vật lý với discriminator hiện hữu. Không sửa migration đã chạy, không xóa dữ liệu hay chứng từ.

## Migration 025: nguồn tùy chọn cho import

DonMuaHang.MaKeHoachKinhDoanh và ChiTietDonMuaHang.MaChiTietKeHoachKinhDoanh cho phép NULL cho REPORT/MANUAL. LoaiNguonDonMua có CHECK: PLAN phải có kế hoạch, REPORT có báo cáo và không có kế hoạch, MANUAL không có nguồn báo cáo/kế hoạch. Unique kế hoạch vẫn giữ một đơn PLAN/kế hoạch. Dữ liệu cũ mặc định PLAN, không tạo nguồn báo cáo giả.

PhieuYeuCauNhapXuat thêm LoaiNguonSanXuat mặc định REPORT. PLAN chỉ hợp lệ cho xuất NVL, phải có kế hoạch và không có báo cáo. Service kiểm tổng yêu cầu theo cùng kế hoạch giữa cả hai nguồn. Không sửa migration cũ; 025 giữ nguyên chứng từ/tồn đã có.

## Migration 024: hàng khách trả

LoHang loại TRA_VE/hướng KHACH_HANG thêm trạng thái trả, phiên bản, người lập, người nhận và kho nhận. ChiTietLoTraVe thêm FK dòng phiếu xuất gốc, dòng lô nhận mới và vị trí nhận. Nguồn một dòng trả phải là đúng một trong: ngoại lệ, QC hoặc dòng giao khách. PhieuKho và ChiTietPhieuKho nhận nguồn yêu cầu kho hoặc lô/dòng trả, đúng một nguồn; FK yêu cầu được nullable để không tạo yêu cầu giả. Unique MaLoTraVe bảo đảm một phiếu nhập cho mỗi lô trả.

Nhận trả tạo ChiTietLo mới và TonKho QUARANTINE, không tăng tồn AVAILABLE của lô gốc. Giữ dữ liệu và chứng từ đã có. Migration chạy qua cơ chế hiện tại, không cần xóa volume hay seed lại.

## Hiện trạng migration 019 — 11/10/2026

Đã nghiệm thu từ CSDL rỗng: ChiTietKeHoachSanXuat dùng chung loại thành phẩm/NVL; BanBaoCaoSanXuat/ChiTietBaoCaoSanXuat dùng chung loại báo cáo; LoHang 1–N ChiTietLo, 8 FK nghiệp vụ trỏ dòng lô; ChiTietLoBaoCaoSanXuat nối sản phẩm thực tế/dòng báo cáo. Hồ sơ kho và biên bản là view suy ra, kết luận nằm trên PhieuKiemKe.

BanDeXuatXuLyNgoaiLe 1–N KetQuaXuLyNgoaiLe lưu lịch sử duyệt, áp dụng riêng tạo BienDongKho. ChiTietLoTraVe ghi hướng trả trên đầu lô, dòng gốc, lượng và nguồn QC/đề xuất. ChungTuBuQC lưu phiên bản gốc và ảnh trước/sau; không tự sửa tồn của hàng đã nhập. NhanVien/BoPhan bổ sung hồ sơ nhân viên, không suy đoán phòng ban.

Schema nghiệm thu có 60 bảng và 8 view; bao gồm liên kết, kỹ thuật và LuuTru, không phải 60 entity domain. Bảng vật lý cũ đã áp dụng được giữ/lưu trữ bằng migration mới; không sửa schema gốc/checksum. Chi tiết và giới hạn hiện tại: IMPLEMENTATION_PROGRESS.md. Các nhận định khoảng cách ở bản đối chiếu 10/10 bên dưới cần đọc theo mốc lịch sử đó.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Không sửa hoặc chạy migration/seed trong lượt đồng bộ docs. Tên dưới là entity domain; DDL thực tế nằm trong `app/database/adminer/KhoHang.sql` và các migration, ánh xạ ở `src/config/vietnamese-sql.js`. Không dùng số bảng để chứng minh đủ nghiệp vụ. Schema hiện hành có các cấu trúc cũ, xem [DOMAIN_ALIGNMENT.md](DOMAIN_ALIGNMENT.md).

## Từ điển entity theo Word

Các trường được giữ từ mô hình đã chốt; ID/FK vật lý, nullable, enum và chỉ mục cần thiết kế sau khi chốt các quyết định còn mở. Không coi bảng dưới là DDL đã áp dụng.

| Entity | Thuộc tính trong domain Word |
| --- | --- |
| NguoiDung | MaNguoiDung, HoTen, MatKhau, SoDienThoai, Email, VaiTro, TrangThai |
| NhanVien | MaNhanVien, MaBoPhan, ChucVu |
| KhachHang | DiaChi, MaNguoiDung |
| VaiTro | MaVaiTro, TenVaiTro, MoTa |
| BoPhan | MaBoPhan, TenBoPhan, MoTa |
| DonHang | MaDonHang, NgayDat, TrangThai, NgayGiaoDuKien, GhiChu |
| ChiTietDonHang | MaMatHang, SoLuong, DonGia, TongTien |
| MatHang | MaMatHang, TenMatHang, MaLoaiHang, DonViTinh, DonGia, MoTa, TrangThai |
| LoaiHang | MaLoaiHang, TenLoaiHang, MoTa |
| Xuong | MaXuong, TenXuong, DiaDiem, NguoiQuanLy, TrangThai, MoTa |
| NhaCungCap | MaNhaCungCap, TenNhaCungCap, DiaChi, SoDienThoai, Email, TrangThai, GhiChu |
| KeHoachSanXuat | MaKeHoachSanXuat, NgayLap, NgayNhanDuKien, TrangThai, GhiChu |
| ChiTietKeHoachSanXuat | MaChiTietKeHoachSanXuat, MaMatHang, LoaiChiTiet, SoLuong, SoLuongCanThiet, SoLuongConThieu, GhiChu |
| BanBaoCaoSanXuat | MaBaoCao, MaKeHoachSanXuat, MaXuong, NgayLap, LoaiBaoCao, GhiChu |
| KeHoachMuaBan | MaKeHoachMuaBan, MaBaoCao, LoaiKeHoach, NgayLap, TrangThai, GhiChu |
| ChiTietKeHoachMuaBan | MaMatHang, SoLuong, DonGiaDuKien |
| DonMuaHang | MaDonMua, MaBaoCao, NgayLap, TrangThai, NgayGiaoDuKien, GhiChu |
| ChiTietDonMuaHang | MaMatHang, SoLuong, DonGia, TongTien |
| Kho | MaKho, TenKho, LoaiKho, TrangThai, DiaDiem, NguoiQuanLy, MoTa |
| PhieuYeuCauNhapXuat | MaPhieuYeuCau, LoaiYeuCau, MaBaoCao, MaXuong, NgayYeuCau, NgayThucHienDuKien, TrangThai, GhiChu |
| ChiTietPhieuYeuCauNhapXuat | MaMatHang, SoLuong, GhiChu |
| PhieuKho | MaPhieu, LoaiPhieu, MaKho, NgayLap, TrangThai, GhiChu |
| ChiTietPhieuKho | MaChiTietLo, SoLuong, DonGia, GhiChu |
| LoHang | MaLo, NgayTao, TrangThai, GhiChu |
| ChiTietLo | MaChiTietLo, MaLo, MaMatHang, SoLuong, DonGia, GhiChu |
| LoNguyenVatLieu | NgayNhan, MaNhaCungCap |
| LoThanhPham | NgaySanXuat, NgayXuat |
| LoHangTraVe | NgayTra, LyDoTra |
| TonKho | MaTonKho, MaKho, MaChiTietLo, SoLuongTon, MucTonToiThieu, NgayCapNhat |
| PhieuKiemKe | MaKiemKe, NgayKiemKe, MaKho, NguoiThucHien, TrangThai, KetLuan, GhiChu |
| ChiTietPhieuKiemKe | MaChiTietLo, SoLuongHeThong, SoLuongThucTe, ChenhLech, NguyenNhan, GhiChu |
| KetQuaKiemTraQCAC | MaKetQua, NgayKiemTra, KetQua, GhiChu |
| ChiTietKetQuaKiemTraQCAC | MaChiTietLo, SoLuongKiemTra, SoLuongDat, SoLuongLoi, TinhTrang, GhiChu |
| ChiTietBaoCaoSanXuat | MaChiTietBaoCao, MaMatHang, SoLuong, SoLuongCanThiet, SoLuongConThieu, SoLuongNVLSuDung, GhiChu |
| ChiTietLoBaoCaoSanXuat | MaChiTietLo, SoLuong, GhiChu |
| BanDeXuatXuLyNgoaiLe | MaDeXuat, NgayDeXuat, NoiDung, LyDo, TrangThai |
| KetQuaXuLyNgoaiLe | MaKetQuaXuLy, NgayXuLy, KetQua, NguoiXuLy, GhiChu |

## Quan hệ và tính toàn vẹn mục tiêu

| Quy tắc | Nội dung đã chốt và giới hạn |
| --- | --- |
| BR-01 Tiếp nhận đơn | UC-29 cập nhật trạng thái DonHang thành đã tiếp nhận, chờ UC-31 phê duyệt. Không tạo phiếu tiếp nhận riêng. |
| BR-02 Chi tiết kế hoạch và dự phòng | ChiTietKeHoachSanXuat chứa dòng THANH_PHAM và NGUYEN_VAT_LIEU qua LoaiChiTiet. Nhu cầu NVL dự kiến = nhu cầu gốc × 1,10, chỉ áp dụng một lần. Không có entity chi tiết NVL kế hoạch riêng. Quy tắc làm tròn cần chốt D-02. |
| BR-03 Báo cáo chung | BanBaoCaoSanXuat phân biệt SAN_XUAT và THANH_PHAM bằng LoaiBaoCao, liên kết KeHoachSanXuat và Xuong. SAN_XUAT được lập cả khi đủ và thiếu NVL; thiếu = max(0, nhu cầu thực tế − tồn khả dụng đối chiếu). Báo cáo không tự thay đổi tồn. |
| BR-04 Nguồn mua và bán | KeHoachMuaBan MUA lấy phần thiếu thực tế từ báo cáo SAN_XUAT; BAN lấy nguồn báo cáo THANH_PHAM và đối chiếu đơn khách, QC, tồn khả dụng. Không mua trực tiếp từ kế hoạch dự kiến; không cộng 10% lần nữa. |
| BR-05 Đơn mua và giới hạn cộng dồn | DonMuaHang chỉ tạo từ kế hoạch MUA đã duyệt, tham chiếu cùng MaBaoCao. Tổng lượng mua có hiệu lực theo báo cáo/mặt hàng không vượt phần thiếu; kiểm lại lúc tạo, sửa, duyệt và mua, trong transaction chống cạnh tranh. Chính sách tính đơn bị hủy/trả hàng và nhiều đơn cho một kế hoạch cần chốt D-04. |
| BR-06 Lô nhiều mặt hàng | LoHang 1–N ChiTietLo; mỗi dòng tham chiếu MatHang. LoNguyenVatLieu, LoThanhPham, LoHangTraVe là các chuyên biệt của LoHang trong domain Word; không phải ba cách gọi tùy ý của một mặt hàng. Lựa chọn bảng vật lý và ý nghĩa hàng trả cần chốt D-05. |
| BR-07 QC từng dòng | ChiTietKetQuaKiemTraQCAC tham chiếu ChiTietLo. Lượng kiểm tra = lượng đạt + lượng lỗi. Chỉ phần đạt được chuyển UC-10 nhập kho; tổng nhập không vượt phần đạt chưa nhập. Lỗi trả NCC hoặc xử lý ngoại lệ, không thuộc tồn khả dụng. Không tự giảm tồn cho lượng lỗi chưa từng nhập. |
| BR-08 Xuất NVL thực tế | UC-23 tạo PhieuYeuCauNhapXuat từ báo cáo SAN_XUAT; ChiTietPhieuYeuCauNhapXuat ghi lượng đề nghị theo mặt hàng. UC-11.01 ghi lượng và ChiTietLo thực xuất trong ChiTietPhieuKho. Chặn cấp trùng/vượt nhu cầu thực tế, xét cả phần đã cấp và cam kết đang có hiệu lực. SoLuongConThieu dùng mua, không phải lượng mặc nhiên xuất. |
| BR-09 Tồn và giữ chỗ | Tồn khả dụng = lượng đã nhập và đạt QC, còn hạn, đủ điều kiện giao dịch − lượng giữ chỗ có hiệu lực; phần lỗi/cách ly không cộng vào. Giữ chỗ chưa làm giảm tồn vật lý, ghi xuất giảm tồn và tiêu thụ giữ chỗ đúng một lần. Thời điểm giữ/giải phóng và phạm vi khóa kiểm kê còn cần chốt D-01/D-07; phương án ở mục dưới là đề xuất. |
| BR-10 Hồ sơ kho | UC-19/20 đọc tổng hợp từ PhieuKho và ChiTietPhieuKho, liên kết ChiTietLo/MatHang/Kho. Không entity hồ sơ riêng, không ghi movement hoặc số lượng lần hai khi tổng hợp. |
| BR-11 Kết luận kiểm kê | UC-28 do Ban kiểm kê hoặc Bộ phận QC/AC thực hiện trong phạm vi được phân công; lưu kết luận, nhận xét, trạng thái trên PhieuKiemKe. ChiTietPhieuKiemKe lưu số đếm theo dòng lô. Không entity biên bản riêng; vẫn giữ mã UC-15 và UC-28. |
| BR-12 Ngoại lệ và lịch sử | Thống nhất BanDeXuatXuLyNgoaiLe 1–N KetQuaXuLyNgoaiLe. UC-17 thuộc Ban giám đốc; mỗi quyết định lưu người, thời điểm, kết quả, lý do, phiên bản nguồn và phương án. Giữ lịch sử, không ghi đè quyết định cũ. Duyệt khác thực hiện vật lý; hạn mức UC-16 và vòng sửa/gửi lại cần chốt D-08/D-09. |

## Tồn khả dụng và giữ chỗ

[ĐÃ CHỐT] Tính theo kho/vị trí/ChiTietLo và đơn vị của MatHang. Không cộng chung các đơn vị khác nhau. Lượng đã giữ không thể được phân bổ lại cho yêu cầu khác. Kiểm nhu cầu nguồn và số dư phải thực hiện nguyên tử, không chỉ kiểm lúc mở form. Preview và báo cáo thiếu là ảnh đối chiếu tại thời điểm đọc, không chứng minh lượng tồn đã dành riêng cho xưởng.

[ĐỀ XUẤT, D-01] Chỉ giữ chỗ khi quản lý kho xác nhận phân bổ lô; xem preview/lưu nháp/gửi yêu cầu không giữ. Khóa nguồn nhu cầu, yêu cầu và các dòng tồn theo thứ tự ổn định, rồi kiểm `giữ mới <= tồn đủ điều kiện - giữ đang hiệu lực`. Khi xuất một phần: giảm tồn vật lý và giảm giữ tương ứng trong cùng transaction. Hủy hoặc đổi phân bổ chưa xuất: giải phóng phần chưa dùng đúng một lần; phần đã xuất giữ lịch sử, không hoàn tồn tự động. Hủy yêu cầu cần kiểm lượng đã xuất và phần cam kết còn lại. Lỗi transaction không tạo giữ/phiếu một phần. Không tự đặt thời hạn hết giữ hoặc giải phóng vì mất phiên khi chưa chốt.

[ĐỀ XUẤT, D-03] Theo mỗi báo cáo/mặt hàng: `nhu cầu còn cấp = nhu cầu thực tế - đã xuất hợp lệ - lượng yêu cầu khác đang cam kết`; cam kết nhu cầu khác giữ chỗ lô. Phải chốt trạng thái nào bắt đầu cam kết, cách hợp nhất nhiều báo cáo của cùng kế hoạch và ảnh hưởng hoàn trả NVL. Tồn bổ sung làm thay đổi khả năng cấp; không âm thầm viết lại báo cáo nguồn đã gửi.

## Lựa chọn lưu trữ cần chốt

- ChiTietKeHoachSanXuat là bảng chi tiết chung theo LoaiChiTiet; không tiếp tục một bảng nghiệp vụ NVL kế hoạch độc lập. Chuyển dữ liệu cũ phải bảo toàn số gốc và dấu vết đã áp dụng dự phòng, tránh nhân 1,10 khi không biết giá trị đã gồm dự phòng hay chưa.
- BanBaoCaoSanXuat/ChiTietBaoCaoSanXuat dùng chung hai loại; khóa báo cáo nguồn và nguồn nhu cầu lúc kiểm tổng mua/cấp. DonMuaHang.MaBaoCao phải khớp KeHoachMuaBan.MaBaoCao. FK báo cáo có tồn tại chưa đủ bảo đảm loại đúng và cùng nguồn.
- LoHang chứa thông tin đầu lô; ChiTietLo chứa mặt hàng/lượng. Các FK QC, TonKho, ChiTietPhieuKho và truy vết báo cáo phải chỉ đúng ChiTietLo. Chuyên biệt LoNguyenVatLieu/LoThanhPham/LoHangTraVe giữ như domain Word; bảng con hoặc discriminator là quyết định vật lý D-05, chưa tự tạo DDL.
- Hồ sơ là truy vấn/view/DTO từ PhieuKho, không entity HoSoKho. Kết luận nằm trên PhieuKiemKe, không bảng nghiệp vụ BienBanKiemKe. Cách tổ chức nhiều kho trong một đợt phải chốt D-07 trước chuyển dữ liệu.
- BanDeXuatXuLyNgoaiLe giữ nội dung nguồn/phương án và trạng thái; KetQuaXuLyNgoaiLe lưu lịch sử 1–N. Lịch sử duyệt bất biến không thay bằng cột người duyệt cuối trên đề xuất. Log kỹ thuật không thay lịch sử nghiệp vụ.
- [ĐỀ XUẤT] bảng/record giữ chỗ có khóa tới dòng yêu cầu/phân bổ, ChiTietLo, vị trí, số giữ còn lại, trạng thái, phiên bản. Đây là lưu trữ kỹ thuật để đáp ứng BR-09, chưa bổ sung một domain đã được duyệt vào Word.
- Giữ DECIMAL và truyền chuỗi, không float. Độ chính xác/làm tròn D-02. Unique/idempotency và thứ tự khóa ổn định; rollback toàn bộ phiếu, chi tiết, movement, số dư, giữ và tiến độ nguồn.

## Kiểm thử dữ liệu phải làm sau thay đổi code

Migration trên bản sao dữ liệu cũ, kiểm đối soát trước/sau và FK; lô nhiều mặt hàng; hai transaction cùng nhu cầu/tồn; QC một phần; hủy/ghi một phần/replay; ngoại lệ trước nhập; truy vết báo cáo/đơn mua; lịch sử nhiều quyết định. Chỉ chạy trên DB kiểm thử cô lập, không ghi vào dữ liệu người dùng.
# Bổ sung migration 022–023

TaiKiemChatLuong lưu các lần tái kiểm theo đề xuất và phiên bản nguồn, người QC, lượng, kết luận, ghi chú và thời điểm. Không ghi đè lịch sử; RELEASE tạo chứng từ bù QC riêng khi quản lý áp dụng, không tự phát sinh tồn kho.

PhanCongKetLuanKiemKe liên kết PhieuKiemKe với nhân viên QC/AC được giao lập kết luận. PhanCongKiemKe vẫn phân công người đếm; hai quyền được kiểm tra riêng. Bảng kết luận nghiệp vụ không được tạo thêm: nội dung vẫn nằm trên PhieuKiemKe.
