# Ghi chú quy trình nghiệp vụ theo đặc tả use case

Nguồn: Tuan6_BaoCaoThucHanh_WarehouseTeam_Cô đã nhận xét.docx.

Tài liệu ghi lại quy trình theo đặc tả Word, giữ nguyên mã UC, không tự thêm hoặc bớt UC. Nhận xét giáo viên được ghi riêng với luồng đặc tả. Những liên kết chưa được mô tả được ghi rõ, không xem là bước nghiệp vụ đã có.

## 1. Đăng nhập

Người dùng nhập tên đăng nhập, mật khẩu tại **UC-01**. Hệ thống kiểm tra tài khoản và hiển thị màn hình theo vai trò. Dữ liệu được lấy từ `NguoiDung`, `VaiTro`; không tạo phiếu hoặc chứng từ nghiệp vụ.

## 2. Đặt hàng, tiếp nhận và phê duyệt đơn

| Bước | Actor | UC | Dữ liệu và chứng từ |
| --- | --- | --- | --- |
| Đặt đơn | Khách hàng | UC-02 | Chọn hàng mẫu từ MatHang, LoaiHang; nhập số lượng, địa chỉ, ngày nhận trễ nhất và ghi chú. Tạo DonHang, ChiTietDonHang với trạng thái chờ xử lý |
| Quản lý đơn | Khách hàng | UC-03 | Xem, tìm kiếm các đơn đã lưu của khách hàng |
| Sửa đơn | Khách hàng | UC-03.1 | Lấy đơn đang chọn; cập nhật và chuyển về chờ phê duyệt. Đơn đã được xử lý/duyệt không được sửa |
| Tiếp nhận đơn | Bộ phận lập kế hoạch | UC-29 | Lấy đơn chưa tiếp nhận, xem chi tiết hàng và khách; chuyển thành Đã tiếp nhận, chờ giám đốc phê duyệt |
| Phê duyệt đơn | Ban giám đốc | UC-31 | Lấy đơn chờ phê duyệt; duyệt thành Đã duyệt và thông báo planner, hoặc từ chối có lý do và thông báo khách |

**Nguồn chứng từ:** đơn khách hàng tạo tại UC-02; UC-03, UC-03.1, UC-29 và UC-31 sử dụng đơn này. `DonHang` là đơn khách đặt; `DonMuaHang` là đơn doanh nghiệp mua NVL từ NCC.

**Kế hoạch sản xuất:** UC-34 yêu cầu có kế hoạch sản xuất; nhận xét UC-23 cũng nhắc kế hoạch này. File Word chưa có luồng tạo kế hoạch sản xuất từ đơn khách hàng. Không xác định bước này là một phần UC-29 khi đặc tả chưa ghi.

## 3. Lập kế hoạch mua NVL, phê duyệt và mua hàng

| Bước | Actor | UC | Dữ liệu và chứng từ |
| --- | --- | --- | --- |
| Lập kế hoạch mua | Bộ phận lập kế hoạch | UC-04 | Chọn NCC, loại NVL, số lượng, ghi chú; hệ thống tính tổng tiền. Tạo KeHoachMuaBan, ChiTietKeHoachMuaBan chờ phê duyệt |
| Quản lý kế hoạch | Bộ phận lập kế hoạch | UC-05 | Xem, tìm kiếm kế hoạch đã lưu |
| Sửa kế hoạch | Bộ phận lập kế hoạch | UC-05.1 | Cập nhật kế hoạch chưa được duyệt/thực hiện |
| Xóa kế hoạch | Bộ phận lập kế hoạch | UC-05.2 | Xóa kế hoạch chưa được duyệt/thực hiện |
| Duyệt kế hoạch | Ban giám đốc | UC-32 | Lấy kế hoạch chờ duyệt, xem loại kế hoạch, NCC/khách, số lượng, tổng tiền; duyệt hoặc từ chối có lý do |
| Mua hàng | Bộ phận mua hàng | UC-27 | Chọn kế hoạch mua đã duyệt; nhập NCC, giá, điều kiện giao hàng. Tạo DonMuaHang, ChiTietDonMuaHang ở trạng thái Chờ xử lý và cập nhật trạng thái kế hoạch |
| Xem đơn mua | Bộ phận mua hàng | UC-14 | Hiển thị đơn mua đã tạo và NCC |

**Nguồn chứng từ:** kế hoạch mua tạo tại UC-04 → duyệt UC-32 → tạo đơn mua UC-27 → xem UC-14.

UC-04 có tên Lập kế hoạch mua/bán nhưng luồng cơ bản chỉ mô tả mua NVL. File chưa chỉ rõ kế hoạch mua được trích từ báo cáo UC-34 hay yêu cầu nào khác. UC-27 trực tiếp dùng kế hoạch mua đã duyệt, không mô tả phiếu yêu cầu mua độc lập.

## 4. Báo cáo sản xuất và thành phẩm

| Công việc | Actor | UC | Nguồn và nơi gửi |
| --- | --- | --- | --- |
| Lập phiếu báo cáo sản xuất | Chủ xưởng | UC-34 | Tiền điều kiện có kế hoạch sản xuất cần báo cáo. Nhập tồn kho, số lượng cần thiết và ghi chú yêu cầu nhập NVL; lưu phiếu, gửi bộ phận lập kế hoạch |
| Báo cáo thành phẩm | Chủ xưởng | UC-35 | Tiền điều kiện lô thành phẩm đã hoàn thành. Nhập số thành phẩm, NVL đã dùng, ngày hoàn thành, hạn sử dụng, ghi chú; lưu báo cáo, gửi ban giám đốc |

Hai đặc tả này chưa chỉ rõ tên entity lưu báo cáo. File cũng chưa nêu bước tự chuyển phiếu UC-34 thành kế hoạch mua UC-04 hoặc báo cáo UC-35 thành phiếu nhập thành phẩm.

## 5. Kiểm tra chất lượng và nhập kho

| Bước | Actor | UC | Dữ liệu và chứng từ |
| --- | --- | --- | --- |
| Thêm kết quả QC | QC/AC | UC-12.1 | Tiền điều kiện ghi Có phiếu nhập kho/mặt hàng cần kiểm tra. Form sử dụng LoHang, MatHang; nhập đạt/không đạt, ghi chú; lưu KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC |
| Quản lý kết quả | QC/AC | UC-12 | Xem, tìm kiếm/lọc kết quả đã lưu |
| Sửa kết quả | QC/AC | UC-12.2 | Cập nhật kết quả đang chọn |
| Xóa kết quả | QC/AC | UC-12.3 | Kiểm tra đã dùng làm căn cứ xử lý chưa; không xóa khi đã sử dụng |
| Nhập kho | Nhân viên kho | UC-10 | Chọn lô NVL đạt QC; nhập vị trí lưu kho, ngày nhập. Số lượng mặc định theo số đạt QC. Tạo PhieuKho, ChiTietPhieuKho và cập nhật TonKho |
| Quản lý nhập kho | Quản lý kho | UC-08 | Xem, tìm kiếm phiếu nhập đã có |
| Xem hồ sơ nhập | Ban giám đốc, chủ xưởng | UC-20 | Lọc theo kho, thời gian, mặt hàng; tổng hợp PhieuKho, ChiTietPhieuKho, MatHang, LoHang |

**Nguồn phiếu nhập:** tạo tại UC-10 từ lô đạt QC và thông tin thực nhập. UC-08, UC-20 sử dụng phiếu đã tạo.

UC-12.1 có nhắc phiếu nhập kho trong tiền điều kiện, nhưng UC-10 yêu cầu QC đạt trước nhập. File chưa thống nhất rõ chứng từ dùng khi kiểm tra trước nhập. File chưa mô tả rõ bước tạo thông tin lô giao nhận từ đơn mua để QC chọn.

## 6. Yêu cầu nhập/xuất và xuất kho

| Bước | Actor | UC | Dữ liệu và chứng từ |
| --- | --- | --- | --- |
| Tạo yêu cầu | Chủ xưởng | UC-23 | Tạo từ chứng từ mua NVL/chứng từ bán thành phẩm; tham chiếu DonMuaHang, KeHoachMuaBan, MatHang. Lưu YeuCauNhapXuat, ChiTietYeuCauNhapXuat, trạng thái Chờ duyệt, gửi bộ phận kho |
| Quản lý yêu cầu | Chủ xưởng | UC-24 | Xem, tìm kiếm yêu cầu đã gửi |
| Sửa yêu cầu | Chủ xưởng | UC-24.1 | Chỉ sửa khi chưa xử lý |
| Xóa/hủy yêu cầu | Chủ xưởng | UC-24.2 | Hủy yêu cầu chờ xử lý và thông báo bộ phận kho; không hủy khi đã xử lý |
| Xuất kho | Nhân viên kho | UC-11 | Kế hoạch xuất liên quan đã duyệt UC-32, thành phẩm đạt QC. Chọn yêu cầu, nhập thông tin thực xuất, kiểm tra tồn; tạo phiếu xuất, cập nhật tồn |
| Quản lý xuất kho | Quản lý kho | UC-09 | Xem, tìm kiếm phiếu xuất đã có |
| Xem hồ sơ xuất | Ban giám đốc, chủ xưởng | UC-19 | Tổng hợp PhieuKho, ChiTietPhieuKho, MatHang, LoHang theo bộ lọc |

**Nguồn phiếu xuất:** tạo tại UC-11 từ yêu cầu/kế hoạch chờ xuất, dữ liệu thực xuất và tồn kho. UC-09, UC-19 sử dụng phiếu này.

**Nhận xét giáo viên, không phải bước đã được cập nhật vào luồng:**

- Phiếu yêu cầu xuất NVL dựa vào kế hoạch sản xuất.
- Xuất thành phẩm phải lấy thông tin từ đơn hàng, có thể có phiếu yêu cầu, và thông tin điều phối; actor không tự nhập toàn bộ dữ liệu vào phiếu xuất.
- Nhận xét đặt câu hỏi UC nào xuất nguyên liệu vì UC-11 đang chỉ xuất thành phẩm.

File chưa đặc tả đầy đủ bước tạo thông tin điều phối. UC-08/UC-09 hiện mô tả xem và tìm kiếm phiếu, không mô tả phân công nhân viên.

## 7. Kiểm kê, lập biên bản và xử lý chênh lệch

| Bước | Actor | UC | Dữ liệu và chứng từ |
| --- | --- | --- | --- |
| Lập đợt kiểm kê | Ban giám đốc | UC-13 | Nhập thời gian, loại NVL/thành phẩm, danh sách kho, ngày kiểm kê; lưu CongViec, KiemKe và gửi ban kiểm kê |
| Thực hiện kiểm kê | Ban kiểm kê | UC-15 | Lấy đợt/khu vực được phân công và danh sách hàng; nhập số thực tế vào KiemKe, ChiTietKiemKe; xác nhận hoàn thành hoặc lưu tạm |
| Lập biên bản kiểm kê | Ban kiểm kê | UC-28 | Lấy kết quả đợt đã hoàn thành gồm số thực tế, số hệ thống, chênh lệch; nhập nhận xét/xác nhận; tạo biên bản, gửi giám đốc |
| Xử lý chênh lệch | Quản lý kho | UC-16 | Lấy dòng chênh lệch; nhập phương án, cập nhật tồn và lưu kết quả |
| Gửi đề xuất vượt hạn mức | Quản lý kho | Nhánh thay thế UC-16 | Tạo DeXuatXuLyNgoaiLe từ chênh lệch nghiêm trọng, chuyển chờ giám đốc duyệt |
| Phê duyệt ngoại lệ | Ban giám đốc | UC-17 | Lấy đề xuất và dữ liệu QC/kiểm kê liên quan; duyệt/từ chối; lưu PheDuyetXuLyNgoaiLe, cập nhật đề xuất và thay đổi liên quan |
| Xem báo cáo kiểm kê | Ban giám đốc | UC-21 | Tổng hợp KiemKe, ChiTietKiemKe, Kho, MatHang theo đợt, thời gian, khu vực |

**Nguồn biên bản:** kết quả UC-15 → lập biên bản UC-28. Đặc tả UC-28 tham chiếu KiemKe, ChiTietKiemKe, không nêu entity biên bản độc lập.

**Nguồn đề xuất ngoại lệ:** nhánh UC-16 mô tả tạo đề xuất từ chênh lệch. UC-17 còn dùng đề xuất hàng lỗi nhưng file chưa mô tả rõ bước tạo đề xuất đó từ QC. Chưa nêu hạn mức xử lý cụ thể.

**Nhận xét giáo viên:** cân nhắc gộp UC-28 với UC-15; lập biên bản theo từng kho, hiển thị hàng hóa và các lô. Đây là nhận xét, tài liệu này vẫn giữ cả hai UC.

## 8. Quản lý công việc

| Công việc | Actor | UC | Dữ liệu và điều kiện |
| --- | --- | --- | --- |
| Xem công việc | Ban giám đốc | UC-25 | CongViec và nhân viên được phân công |
| Sửa công việc | Ban giám đốc | UC-25.1 | Công việc đang chọn; kiểm tra ngày và lịch nhân viên khi thay đổi phân công |
| Xóa công việc | Ban giám đốc | UC-25.2 | Công việc đang chọn; không xóa khi đang thực hiện |

UC-13 có bước lưu CongViec; UC-25 và các UC con quản lý công việc đã có. Phản hồi trong file giải thích việc sửa/xóa để điều phối khi nhân viên gặp khó khăn hoặc lịch giao của NCC thay đổi.

## 9. Quản lý danh mục, dữ liệu và tra cứu

| Công việc | Actor | UC | Dữ liệu |
| --- | --- | --- | --- |
| Quản lý danh mục | Quản lý kho | UC-06 | Danh mục LoaiHang và dữ liệu liên quan |
| Thêm danh mục | Quản lý kho | UC-06.1 | Nhập tên, mô tả và lưu danh mục |
| Xóa danh mục | Quản lý kho | UC-06.2 | Kiểm tra danh mục có đang dùng trước khi xóa |
| Sửa danh mục | Quản lý kho | UC-06.3 | Cập nhật tên, mô tả của danh mục đang chọn |
| Quản lý dữ liệu danh mục | Quản lý kho | UC-07 | Dữ liệu thuộc danh mục; luồng chủ yếu tham chiếu MatHang |
| Thêm dữ liệu | Quản lý kho | UC-07.1 | Nhập theo các cột tương ứng, trừ mã/ngày tạo/ngày cập nhật |
| Xóa dữ liệu | Quản lý kho | UC-07.2 | Kiểm tra tồn kho/giao dịch trước khi xóa |
| Sửa dữ liệu | Quản lý kho | UC-07.3 | Cập nhật thông tin được phép sửa |
| Tra cứu kho | Quản lý kho | UC-22 | Kho, LoaiHang, MatHang, TonKho, lô NVL/thành phẩm |
| Xem tồn kho | Ban giám đốc | UC-18 | Tổng hợp tồn theo kho, thời gian, mặt hàng |

Các chức năng này sử dụng dữ liệu đã lưu, không tạo phiếu nhập hoặc phiếu xuất. Các trường cần nhập/sửa theo từng loại dữ liệu chưa được liệt kê đầy đủ trong file.

## 10. Truy nguồn chứng từ

Tên nơi lưu dưới đây là entity được đặc tả Word tham chiếu; không khẳng định bảng CSDL thực tế đã triển khai.

| Chứng từ | Nơi tạo | Nguồn dữ liệu | Nơi lưu/tham chiếu | Nơi sử dụng tiếp |
| --- | --- | --- | --- | --- |
| Đơn khách hàng | UC-02 | Hàng mẫu và thông tin khách nhập | DonHang, ChiTietDonHang | UC-03, 03.1, 29, 31 |
| Kế hoạch sản xuất | Chưa đặc tả bước tạo | Chưa mô tả rõ nguồn trong luồng tạo | Chưa thể hiện đầy đủ entity trong đặc tả Word | Tiền điều kiện UC-34; nhận xét UC-23 |
| Phiếu báo cáo sản xuất | UC-34 | Kế hoạch cần báo cáo, tồn và nhu cầu chủ xưởng nhập | Chưa nêu tên entity ở đặc tả này | Gửi bộ phận lập kế hoạch |
| Kế hoạch mua/bán | UC-04 | NCC, mặt hàng, số lượng, ghi chú | KeHoachMuaBan, ChiTietKeHoachMuaBan | UC-05, 05.1, 05.2, 32, 27, 23, 11 |
| Đơn mua NVL | UC-27 | Kế hoạch mua đã duyệt; NCC, giá, điều kiện giao hàng | DonMuaHang, ChiTietDonMuaHang | UC-14, 23 |
| Yêu cầu nhập/xuất | UC-23 | Chứng từ mua NVL/chứng từ bán thành phẩm | YeuCauNhapXuat, ChiTietYeuCauNhapXuat | UC-24, 24.1, 24.2, 11; gửi bộ phận kho |
| Công việc/đợt kiểm kê | UC-13 | Thời gian, phạm vi hàng/kho và thông tin đợt | CongViec, KiemKe | UC-25, 25.1, 25.2, 15, 28, 21 |
| Kết quả QC/AC | UC-12.1 | Lô, mặt hàng, kết quả kiểm tra thực tế | KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC | UC-12, 12.2, 12.3, 10; UC-11 yêu cầu đạt QC; UC-17 dùng dữ liệu QC làm căn cứ |
| Phiếu nhập | UC-10 | Lô NVL đạt QC và thông tin thực nhập | PhieuKho, ChiTietPhieuKho | UC-08, 20; cập nhật TonKho |
| Phiếu xuất | UC-11 | Yêu cầu/kế hoạch chờ xuất, thông tin thực xuất, tồn | PhieuKho, ChiTietPhieuKho | UC-09, 19; cập nhật TonKho |
| Báo cáo thành phẩm | UC-35 | Lô đã hoàn thành, thành phẩm và NVL thực dùng | Chưa nêu tên entity ở đặc tả này | Gửi ban giám đốc |
| Biên bản kiểm kê | UC-28 | Kết quả UC-15, số hệ thống, số thực tế, chênh lệch | KiemKe, ChiTietKiemKe được tham chiếu | Gửi giám đốc; UC-16 dùng kết quả chênh lệch; UC-21 xem báo cáo |
| Đề xuất ngoại lệ | Nhánh UC-16; nguồn QC chưa mô tả bước tạo | Chênh lệch hoặc vấn đề QC liên quan | DeXuatXuLyNgoaiLe | UC-17 |
| Quyết định ngoại lệ | UC-17 | Đề xuất và căn cứ QC/kiểm kê | PheDuyetXuLyNgoaiLe | Cập nhật trạng thái, áp dụng thay đổi liên quan |
| Hồ sơ nhập/xuất | UC-20/UC-19 tổng hợp để xem | Phiếu kho, chi tiết, mặt hàng và lô | Luồng dùng PhieuKho, ChiTietPhieuKho; chưa có bước tạo hồ sơ độc lập rõ | Giám đốc, chủ xưởng xem |

## 11. Hóa đơn và tài liệu ngoài các phiếu đã đặc tả

- **Hóa đơn:** không có UC tạo hoặc quản lý hóa đơn; không đồng nhất đơn mua UC-27 hay phiếu xuất UC-11 với hóa đơn.
- **Hợp đồng/đặt cọc:** UC-03.1 nhắc đền bù đặt cọc theo hợp đồng khi giảm số lượng; chưa nêu bước tạo/lưu hợp đồng và công thức đền bù.
- **Phiếu giao hàng NCC:** chưa có đặc tả tiếp nhận/lưu chứng từ riêng.
- **Phiếu yêu cầu mua độc lập:** UC-27 sử dụng kế hoạch mua đã duyệt, không đặc tả phiếu yêu cầu mua riêng.

## 12. Lưu ý về tên và phạm vi

- UC-08 có tiêu đề ngoài bảng Xem phiếu nhập kho, trong bảng là Quản lý nhập kho.
- UC-09 có tiêu đề ngoài bảng Xem phiếu xuất kho, trong bảng là Quản lý xuất kho. Nhánh tìm kiếm của UC-09 ghi nhầm phiếu nhập ở hai bước.
- UC-23 lưu Chờ duyệt; UC-24.2 dùng Chờ xử lý. Tài liệu này giữ cách diễn đạt nguồn, không tự thống nhất trạng thái.
- KeHoachSanXuat có trong domain của repo đã đối chiếu trước đó, nhưng không vì vậy mà xem file Word đã có đầy đủ đặc tả tạo kế hoạch sản xuất.
- Giữ nguyên 48 UC: 32 UC chính và 16 UC con. Không bổ sung UC-26, UC-30, UC-33 hoặc mã mới.
