# Đối chiếu domain cập nhật — 10/10/2026

Nguồn: DOMAIN_MODEL.md do chủ dự án cập nhật. Đây là báo cáo triển khai, không sửa đặc tả nguồn. Một cặp ngoặc trong use case có thể liệt kê nhiều entity; entity lặp lại ở các bước chỉ tính một lần. Class domain không tự động tương ứng một bảng: kế thừa, bảng nối, lịch sử và dữ liệu tổng hợp cần quyết định lưu trữ riêng.

## Bảng đã có

Sau migration 005/006, database KhoHang có 54 bảng, không còn chỉ 18 bảng nền tảng của bản đầu. Tên bảng/cột MySQL tiếng Việt không dấu; API/DTO giữ tên logic để giao diện và service hiện có tiếp tục hoạt động. Mapping nằm tại database/adminer/identifiers.json.

| Entity domain                                   | Bảng thực tế                                                     | Trạng thái                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| NguoiDung, VaiTro, KhachHang                    | NguoiDung, VaiTro, KhachHang                                     | Có; vai trò nhiều-nhiều qua NguoiDungVaiTro                                    |
| NhanVien, BoPhan                                | Chưa có bảng hồ sơ riêng                                         | Tài khoản/vai trò chưa thay thế đủ mã bộ phận/chức vụ                          |
| Xuong, NhaCungCap                               | Xuong, NhaCungCap                                                | Có; scope qua NguoiDungXuong                                                   |
| DonHang, ChiTietDonHang                         | DonHang, ChiTietDonHang                                          | SQL tạo/sửa/tiếp nhận/duyệt                                                    |
| MatHang, LoaiHang                               | MatHang, LoaiHang                                                | Có; đơn vị qua DonViTinh                                                       |
| KeHoachSanXuat                                  | KeHoachSanXuat                                                   | SQL tạo/sửa, duyệt cùng đơn                                                    |
| ChiTietKeHoachSanXuat                           | ChiTietKeHoachSanXuat                                            | Đã đổi từ ThanhPhamKeHoach                                                     |
| ChiTietNguyenLieuKeHoachSanXuat                 | ChiTietNguyenLieuKeHoachSanXuat                                  | Đã đổi từ NguyenLieuKeHoach                                                    |
| KeHoachMuaBan, ChiTietKeHoachMuaBan             | Cùng tên entity                                                  | Đã đổi tên, nối nguồn sản xuất/bổ sung NVL                                     |
| DonMuaHang, ChiTietDonMuaHang                   | Cùng tên entity                                                  | SQL tạo từ kế hoạch mua duyệt                                                  |
| PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat | Cùng tên entity                                                  | SQL yêu cầu theo mặt hàng; bổ sung NVL không ghi kho                           |
| PhieuKho, ChiTietPhieuKho, Kho, TonKho          | Cùng tên entity                                                  | SQL phân công/ghi phiếu; tồn từ phiếu đã ghi                                   |
| PhieuKiemKe, ChiTietPhieuKiemKe                 | Cùng tên entity                                                  | Có schema; service COUNT/đếm/biên bản vẫn pending                              |
| KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC     | Cùng tên entity                                                  | SQL QC hiện tại theo lô một mặt hàng                                           |
| DeXuatXuLyNgoaiLe / BanDeXuatXuLyNgoaiLe        | DeXuatXuLyNgoaiLe                                                | Có schema; nghiệp vụ phê duyệt ngoại lệ pending                                |
| KetQuaXuLyNgoaiLe / PheDuyetXuLyNgoaiLe         | Chưa có bảng lịch sử riêng                                       | Cột người duyệt/trạng thái trên đề xuất chưa đáp ứng lịch sử 1–N trong domain  |
| BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat          | BaoCaoSanXuat, ChiTietBaoCaoSanXuat; BaoCaoThanhPham và bảng con | SQL hiện tại tách báo cáo nhu cầu và thành phẩm, chưa hợp nhất LoaiBaoCao      |
| LoHang                                          | LoHang                                                           | Đã có nhưng mỗi row vẫn gắn một MatHang                                        |
| ChiTietLo                                       | Chưa có                                                          | Cần chuyển QC/phiếu/tồn sang dòng lô để hỗ trợ lô nhiều mặt hàng               |
| LoNguyenVatLieu, LoThanhPham, LoHangTraVe       | Chưa có bảng subtype riêng                                       | Nguồn mua/sản xuất hiện phân biệt trên LoHang; trả hàng chưa có chứng từ riêng |
| ChiTietLoBaoCaoSanXuat                          | Chưa có                                                          | Chưa truy vết NVL sử dụng theo dòng lô                                         |

Bảng hỗ trợ như ViTriKho, PhanCongKho, BienDongKho, LichSuCSDL, session, khóa replay không nhất thiết xuất hiện trong sơ đồ class. Do đó số bảng có thể lớn hơn số entity nhưng vẫn thiếu entity quan trọng.

## Luồng đã nối trong lượt này

KeHoachSanXuat đã duyệt → báo cáo nhu cầu SUBMITTED → yêu cầu MATERIAL_PURCHASE → KeHoachMuaBan PURCHASE → DonMuaHang. Kế hoạch mua có MaKeHoachSanXuat và MaYeuCauNguon; nguồn báo cáo truy qua yêu cầu. Cũng cho phép mua trực tiếp từ danh sách nguyên liệu của kế hoạch sản xuất. Không lấy khách/đơn làm nguồn trực tiếp của kế hoạch mua; kế hoạch bán vẫn gắn đơn.

API tạo kế hoạch mua nhận production_plan_id hoặc source_request_id. Nếu dùng yêu cầu, server tự suy ra production_plan_id và chặn ID không khớp. Server kiểm tra nguồn đã duyệt/gửi, loại NVL, lượng mua cộng dồn, revalidate khi sửa/duyệt và khóa nguồn để chống mua vượt khi đồng thời. Yêu cầu đã được dùng trong kế hoạch mua còn hiệu lực không được sửa/hủy. Kế hoạch mua thủ công cũ không tự gán nguồn suy đoán; vẫn xem/sửa được theo trạng thái hiện có.

Form MySQL cho chọn kế hoạch sản xuất hoặc yêu cầu bổ sung, điền dòng NVL từ nguồn; lookup yêu cầu trả chi tiết dòng. Giao diện memory giữ luồng cũ.

## Chưa hoàn thiện theo domain mới

- ChiTietLo và lô nhiều mặt hàng: cần migration dữ liệu, chuyển FK, service QC/ghi phiếu/tồn, bộ lọc và form trong cùng thay đổi; không chỉ thêm bảng rỗng.
- Báo cáo chung LoaiBaoCao và truy vết sử dụng NVL theo dòng lô.
- Hồ sơ nhân viên/bộ phận và lịch sử phê duyệt ngoại lệ.
- Tài liệu mới nói nhập ngay khi kết luận QC; service hiện tại vẫn QC → yêu cầu → quản lý phân công → nhân viên ghi phiếu. Chưa tự bỏ bước phân quyền/điều phối.
- Domain nói hồ sơ kho là tổng hợp; HoSoKho hiện lưu xác nhận tổng hợp theo yêu cầu, không lưu lại số lượng. Nội dung biên bản kiểm kê hiện tách BienBanKiemKe; cần thống nhất với phương án đặt KetLuan trên PhieuKiemKe.
- UC-11.01/UC-11.02 trong mô tả mới là hai luồng xuất NVL/thành phẩm của UC-11, không tự thêm UC gốc vào danh sách 48 UC.

Chưa thể kết luận toàn bộ CSDL/chương trình đã đủ domain mới chỉ dựa trên 54 bảng.
