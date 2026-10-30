# Đối chiếu entity bổ sung trong đặc tả

Chỉ bổ sung tên entity trong ngoặc sau bước có dữ liệu; giữ nguyên câu chữ trước ngoặc, bảng, ô, đoạn, ngắt dòng và định dạng của bản SuaDungMau.

Mô hình hiện tại: `MatHang` giữ thông tin chung; `NguyenVatLieu`, `ThanhPham` giữ thông tin riêng. `LoHang`, `ChiTietLo` thay cho các tên bảng lô nguyên vật liệu/thành phẩm cũ. Biên bản được lưu trên `PhieuKiemKe` hoặc `LoLichKiemTra` tùy loại đợt, không tạo bảng biên bản mới.

Các entity liệt kê theo nhánh được thực hiện; một bước có nhiều loại nguồn không đồng nghĩa mọi bảng đều được ghi trong cùng một lần. Trường hợp điều hướng, kết thúc, hủy chưa lưu hoặc thông báo lỗi kết nối không tự phát sinh entity.

Đã bổ sung 669 bước trong 58 bảng UC.

## UC-29 Tiếp nhận đơn hàng

- 1. Chọn chức năng Xem đơn hàng (DonHang)
- 2. Hiển thị danh sách các đơn hàng chưa được tiếp nhận (DonHang)
- 3. Chọn một đơn hàng cần tiếp nhận (DonHang)
- 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, ThanhPham, KhachHang)
- 5. Chọn Tiếp nhận đơn hàng (DonHang)
- 6. Cập nhật trạng thái đơn hàng thành Đã tiếp nhận. (DonHang)
- 1. Hệ thống thông báo không có đơn hàng mới (DonHang)
- 1. Hệ thống thông báo không thể tiếp nhận lại đơn hàng. (DonHang)
- 2. Bộ phận lập kế hoạch tải lại danh sách và chọn đơn hàng khác. (DonHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonHang)

## UC-06 Quản lý danh mục kho

- 1. Chọn chức năng Quản lý danh mục kho (LoaiHang)
- 2. Hiển thị danh sách danh mục hiện có (LoaiHang)
- 3. Chọn một danh mục để xem chi tiết (LoaiHang)
- 4. Hiển thị tên, nhóm nguyên vật liệu hoặc thành phẩm, mô tả, ảnh nếu có và danh sách mặt hàng thuộc danh mục đã chọn. (LoaiHang, MatHang, NguyenVatLieu, ThanhPham)
- 2. Hệ thống hiển thị các danh mục của nhóm được chọn. (LoaiHang)
- 1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (LoaiHang)

## UC-06.1 Thêm danh mục kho

- 1. Chọn Thêm danh mục (LoaiHang)
- 2. Hiển thị form thêm danh mục gồm tên danh mục, nhóm nguyên vật liệu hoặc thành phẩm, mô tả và ảnh nếu có. (LoaiHang)
- 3. Nhập tên danh mục, mô tả và xác nhận (LoaiHang)
- 4. Kiểm tra dữ liệu vừa được nhập (LoaiHang)
- 5. Lưu danh mục mới vào hệ thống và thông báo thêm thành công (LoaiHang)
- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (LoaiHang)

## UC-06.2 Xóa danh mục kho

- 1. Chọn Xoá danh mục (LoaiHang)
- 2. Hệ thống yêu cầu xác nhận xóa (LoaiHang)
- 3. Xác nhận xóa (LoaiHang)
- 4. Hệ thống kiểm tra danh mục có đang được sử dụng hay không (LoaiHang, MatHang)
- 5. Hệ thống xóa danh mục khỏi danh sách và thông báo xoá danh mục thành công (LoaiHang)
- 2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục (LoaiHang)
- 1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (LoaiHang)

## UC-06.3 Sửa danh mục kho

- 1. Chọn Sửa danh mục (LoaiHang)
- 2. Hiển thị form với tên danh mục, nhóm hàng, mô tả và ảnh hiện tại để chỉnh sửa theo các trường được phép. (LoaiHang)
- 3. Nhập thông tin muốn chỉnh sửa (LoaiHang)
- 4. Chọn xác nhận (LoaiHang)
- 5. Hệ thống kiểm tra dữ liệu vừa được nhập (LoaiHang)
- 6. Hệ thống lưu thông tin danh mục đã chỉnh sửa và thông báo chỉnh sửa thành công (LoaiHang)
- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (LoaiHang)

## UC-07 Quản lý dữ liệu danh mục kho

- 1. Chọn chức năng Quản lý dữ liệu danh mục kho (LoaiHang, MatHang, NguyenVatLieu, ThanhPham)
- 2. Hiển thị danh sách danh mục (LoaiHang)
- 3. Chọn một danh mục để xem chi tiết dữ liệu (LoaiHang)
- 4. Hiển thị dữ liệu chi tiết (LoaiHang, MatHang, NguyenVatLieu, ThanhPham, DonViTinh)
- 1. Quản lý kho nhập tên dữ liệu cần tìm. (MatHang, NguyenVatLieu, ThanhPham)
- 2. Hệ thống hiển thị dữ liệu phù hợp (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (MatHang, NguyenVatLieu, ThanhPham)

## UC-07.1 Thêm dữ liệu danh mục kho

- 1. Chọn Thêm dữ liệu (MatHang, NguyenVatLieu, ThanhPham)
- 2. Hiển thị form của loại dữ liệu đang thêm. Đối với mặt hàng, hiển thị tên, danh mục, đơn vị tính, giá, ảnh, mô tả và trạng thái theo các trường được phép nhập; mã và thời điểm tạo do hệ thống ghi nhận. (MatHang, NguyenVatLieu, ThanhPham, LoaiHang, DonViTinh)
- 3. Nhập thông tin và xác nhận (MatHang, NguyenVatLieu, ThanhPham)
- 4. Kiểm tra dữ liệu nhập (MatHang, NguyenVatLieu, ThanhPham, LoaiHang, DonViTinh)
- 5. Lưu dữ liệu mới vào hệ thống và thông báo thêm thành công (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang, NguyenVatLieu, ThanhPham)
- 2. Quản lý kho chọn lại dữ liệu đang được sử dụng rồi xác nhận. (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (MatHang, NguyenVatLieu, ThanhPham)

## UC-07.2 Xóa dữ liệu danh mục kho

- 1. Chọn Xóa (MatHang, NguyenVatLieu, ThanhPham)
- 2. Hệ thống kiểm tra dữ liệu có còn tồn kho/phát sinh giao dịch hay không (MatHang, NguyenVatLieu, ThanhPham, TonKho, ChiTietPhieuKho, ChiTietDonHang, ChiTietDonMuaHang, ChiTietKeHoachSanXuat, ChiTietKeHoachMuaBan)
- 3. Hệ thống yêu cầu xác nhận xóa (MatHang, NguyenVatLieu, ThanhPham)
- 4. Xác nhận xóa (MatHang, NguyenVatLieu, ThanhPham)
- 5. Hệ thống xóa dữ liệu khỏi danh sách (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (MatHang, NguyenVatLieu, ThanhPham)

## UC-07.3 Sửa dữ liệu danh mục kho

- 1. Chọn Sửa (MatHang, NguyenVatLieu, ThanhPham)
- 2. Hệ thống mở form nhập cho phép chỉnh sửa các thông tin được phép chỉnh sửa (MatHang, NguyenVatLieu, ThanhPham, LoaiHang, DonViTinh)
- 3. Chỉnh sửa các thông tin được phép của dữ liệu đang chọn, như tên mặt hàng, danh mục, đơn vị tính, giá, ảnh hoặc mô tả, rồi xác nhận. (MatHang, NguyenVatLieu, ThanhPham, LoaiHang, DonViTinh)
- 4. Hệ thống kiểm tra thông tin vừa được nhập (MatHang, NguyenVatLieu, ThanhPham, LoaiHang, DonViTinh)
- 5. Hệ thống lưu thông tin mới và thông báo chỉnh sửa thành công. (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống kiểm tra các chứng từ liên quan. (MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (MatHang, NguyenVatLieu, ThanhPham)

## UC-08 Quản lý nhập kho

- 2. Hiển thị danh sách phiếu nhập kho (PhieuKho)
- 3. Chọn một phiếu nhập kho để xem chi tiết (PhieuKho)
- 4. Hiển thị thông tin chi tiết phiếu nhập kho (PhieuKho, ChiTietPhieuKho, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo, Kho, ViTriKho)
- 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKho, ChiTietPhieuKho)

## UC-09 Quản lý xuất kho

- 2. Hiển thị danh sách phiếu xuất kho (PhieuKho)
- 3. Chọn một phiếu xuất kho để xem chi tiết (PhieuKho)
- 4. Hiển thị thông tin chi tiết phiếu xuất kho (PhieuKho, ChiTietPhieuKho, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo, Kho, ViTriKho)
- 1. Nhập mã phiếu để tìm kiếm phiếu xuất kho. (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống hiển thị các phiếu xuất kho phù hợp. (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKho, ChiTietPhieuKho)

## UC-13 Lập đợt kiểm kê

- 1. Chọn chức năng Lập đợt kiểm kê. (DotKiemKe, CongViec, LoLichKiemTra)
- 2. Hiển thị form gồm tên đợt, mô tả, lô cần kiểm, thời gian, danh sách nhân viên và người lập biên bản. (KeHoachMuaBan, KeHoachSanXuat, LoHang, ChiTietLo, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, NguoiDung, NguoiDungVaiTro, VaiTro, NhanVien, BoPhan)
- 3. Chọn lô nguyên vật liệu từ kế hoạch mua hoặc chọn lô thành phẩm và từng phần thành phẩm cần kiểm. Chọn thời gian, mô tả, từng nhân viên thuộc QC/AC, Ban kiểm kê và một người lập biên bản trong những người đã chọn. (KeHoachMuaBan, KeHoachSanXuat, LoHang, ChiTietLo, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, NguoiDung, NguoiDungVaiTro, VaiTro)
- 4. Hiển thị nhân viên theo hai nhóm QC/AC và Ban kiểm kê; cho phép chọn nhiều người của một nhóm hoặc cả hai nhóm. Kiểm tra lô, phần lô, ngày nhận và phân công. (NguoiDung, NguoiDungVaiTro, VaiTro, LoHang, ChiTietLo, LoLichKiemTra, PhanCongLichKiemTra, PhanCongCongViec)
- 6. Lưu đợt kiểm kê; thông báo đến từng người được giao; thông báo tạo thành công. Người thuộc QC/AC kiểm chất lượng, người thuộc Ban kiểm kê kiểm số lượng. (DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra, ThongBao)
- 1. Ban giám đốc mở danh sách nhân viên của nhóm QC/AC hoặc Ban kiểm kê. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)
- 2. Hệ thống hiển thị thông tin nhân viên để lựa chọn. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, DotKiemKe, LoLichKiemTra, PhanCongLichKiemTra)
- 3. Ban giám đốc chọn từng người rồi xác nhận; hệ thống hiển thị tên dưới nhóm tương ứng. (DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 1. Ban giám đốc chọn lô thành phẩm. (LoHang, ChiTietLo, MatHang, ThanhPham)
- 2. Hệ thống hiển thị các phần đã được tạo từ báo cáo thành phẩm của lô. (MatHang, ThanhPham, DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 3. Ban giám đốc chọn phần cần kiểm; không lấy lại tổng số lượng cả lô cho mỗi phần. (LoHang, ChiTietLo, DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 1. Ban giám đốc chọn kế hoạch mua phù hợp. (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Hệ thống lấy ngày nhận dự kiến làm ngày bắt đầu gợi ý. (DotKiemKe, CongViec, LoLichKiemTra)
- 3. Chỉ khi đã ghi nhận phần hàng thực nhận mới chọn được phần lô đó để thực hiện kiểm tra. (LoHang, ChiTietLo, DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 1. Khi chưa đến thời gian bắt đầu, người có quyền chọn ô xác nhận giả lập tại thao tác bắt đầu. (DotKiemKe, CongViec, LoLichKiemTra)
- 3. Nếu không chọn giả lập, giữ ràng buộc thời gian thông thường; việc giả lập không tạo thêm hàng thực nhận và không bỏ qua quyền phân công. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 1. Hệ thống yêu cầu chọn nhân viên thuộc QC/AC hoặc Ban kiểm kê và người lập biên bản hợp lệ. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra)
- 1. Hệ thống thông báo không thể chọn phần lô này. (LoHang, ChiTietLo)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DotKiemKe, CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)

## UC-17 Phê duyệt đề xuất xử lý ngoại lệ

- 1. Chọn chức năng Phê duyệt đề xuất xử lý ngoại lệ (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 2. Hiển thị danh sách đề xuất đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)
- 3. Chọn một đề xuất để xem chi tiết (BanDeXuatXuLyNgoaiLe)
- 4. Hiển thị thông tin chi tiết đề xuất, loại hàng, số lượng, hàng bị vấn đề gì (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham, LoaiHang)
- 5. Chọn Phê duyệt (BanDeXuatXuLyNgoaiLe)
- 6. Lưu quyết định phê duyệt và thông báo cho Quản lý kho. Việc phê duyệt không tự thay đổi số lượng tồn kho; Quản lý kho thực hiện phương án được chấp thuận ở bước xử lý riêng. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, ThongBao)
- 2. Hệ thống lưu quyết định, lý do và hướng xử lý; thông báo cho Quản lý kho để thực hiện. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, ThongBao)
- 2. Hệ thống yêu cầu bổ sung nội dung; chưa gửi quyết định. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 1. Hệ thống thông báo đề xuất không còn hiệu lực (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)

## UC-18 Xem danh sách hàng tồn kho

- 1. Chọn chức năng Xem danh sách hàng tồn kho (TonKho, PhanCongKho)
- 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang)
- 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang)
- 4. Tổng hợp và hiển thị danh sách hàng tồn kho tương ứng (TonKho, Kho, ViTriKho, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham, DonViTinh)
- 1. Ban giám đốc chọn Xuất file (TonKho)
- 1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho, PhanCongKho)
- 2. Người dùng vẫn xem được dữ liệu trên màn hình nếu danh sách đã tải thành công; kiểm tra lại và thử tải file sau. (TonKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (TonKho)

## UC-19 Xem hồ sơ xuất kho

- 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)
- 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho)
- 4. Tổng hợp và hiển thị hồ sơ xuất kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, ThanhPham, NguyenVatLieu, LoHang, ChiTietLo, Kho, ViTriKho)
- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống chỉ hiển thị phiếu thuộc xưởng mà tài khoản phụ trách. (Xuong, PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Người dùng vẫn xem được dữ liệu trên màn hình nếu danh sách đã tải thành công; kiểm tra lại và thử tải file sau. (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKho, ChiTietPhieuKho)

## UC-20 Xem hồ sơ nhập kho

- 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)
- 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho)
- 4. Tổng hợp và hiển thị hồ sơ nhập kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, ThanhPham, NguyenVatLieu, LoHang, ChiTietLo, Kho, ViTriKho)
- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống chỉ hiển thị phiếu thuộc xưởng mà tài khoản phụ trách. (Xuong, PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Người dùng vẫn xem được dữ liệu trên màn hình nếu danh sách đã tải thành công; kiểm tra lại và thử tải file sau. (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKho, ChiTietPhieuKho)

## UC-21 Xem báo cáo kiểm kê

- 2. Hiển thị form điều kiện lọc báo cáo (đợt kiểm kê, thời gian, khu vực) (DotKiemKe, CongViec, PhieuKiemKe, Kho)
- 3. Chọn điều kiện lọc và xác nhận (DotKiemKe, PhieuKiemKe, Kho)
- 4. Tổng hợp và hiển thị báo cáo kiểm kê tương ứng (bao gồm số liệu chênh lệch) (PhieuKiemKe, ChiTietPhieuKiemKe, DotKiemKe, Kho, MatHang, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Ban giám đốc chọn Xuất file (PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Người dùng vẫn xem được dữ liệu trên màn hình nếu danh sách đã tải thành công; kiểm tra lại và thử tải file sau. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKiemKe, ChiTietPhieuKiemKe)

## UC-25 Quản lý công việc

- 2. Hiển thị danh sách công việc (CongViec)
- 3. Chọn công việc cụ thể (CongViec)
- 4. Hiển thị thông tin chi tiết công việc gồm: tên công việc, mô tả, ngày bắt đầu, ngày kết thúc, độ ưu tiên, trạng thái, nhân viên được phân công (CongViec, PhanCongCongViec, NguoiDung, NhanVien)
- 2. Hệ thống hiển thị nội dung, thời gian, lô hoặc phần lô và các thao tác theo nhiệm vụ. (LoHang, ChiTietLo, CongViec, PhanCongCongViec)
- 2. Không tạo đợt kiểm kê hoặc đợt kiểm tra QC/AC mới trong chức năng Quản lý công việc. (DotKiemKe, CongViec, LoLichKiemTra, PhanCongCongViec)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (CongViec, PhanCongCongViec)

## UC-25.1 Chỉnh sửa công việc

- 1. Chọn Chỉnh sửa công việc (CongViec)
- 2. Hiển thị form với thông tin hiện tại của công việc (CongViec, PhanCongCongViec, NguoiDung)
- 3. Nhập thông tin muốn chỉnh sửa và chọn Xác nhận. (CongViec)
- 4. Hệ thống kiểm tra công việc còn được phép chỉnh sửa. (CongViec)
- 5. Kiểm tra dữ liệu nhập (CongViec)
- 6. Kiểm tra nhân viên được giao, người lập biên bản và phạm vi lô khi có thay đổi; với đợt kiểm kê, chỉ chọn nhân viên QC/AC hoặc Ban kiểm kê. (CongViec, PhanCongCongViec, NguoiDung, NguoiDungVaiTro, VaiTro, LoLichKiemTra, PhanCongLichKiemTra, LoHang, ChiTietLo)
- 7. Lưu thông tin công việc được cập nhật vào hệ thống và thông báo cập nhật thành công (CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra, ThongBao)
- 1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec, PhanCongCongViec)
- 1. Hệ thống yêu cầu chọn nhân viên đúng nhóm và người lập biên bản thuộc danh sách được giao. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra)
- 1. Hệ thống thông báo và không lưu thay đổi. (CongViec, PhanCongCongViec)
- 2. Ban giám đốc tải lại chi tiết để xem trạng thái mới; không đổi lô, nhân viên hoặc biên bản đã được ghi nhận trái điều kiện. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (CongViec, PhanCongCongViec)

## UC-25.2 Xóa công việc

- 1. Chọn Xóa công việc muốn xoá (CongViec)
- 2. Hệ thống yêu cầu xác nhận (CongViec)
- 3. Chọn Xác nhận (CongViec)
- 4. Kiểm tra công việc có đang được thực hiện (CongViec)
- 5. Xóa công việc khỏi hệ thống và thông báo xoá thành công (CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 2. Giữ nguyên công việc và các kết quả đã ghi nhận. (CongViec, PhanCongCongViec)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (CongViec, PhanCongCongViec)

## UC-31 Phê duyệt kế hoạch sản xuất

- 1. Chọn chức năng Phê duyệt kế hoạch sản xuất. (KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 2. Hiển thị danh sách kế hoạch sản xuất đang chờ phê duyệt. (KeHoachSanXuat)
- 3. Chọn kế hoạch sản xuất để xem chi tiết. (KeHoachSanXuat)
- 4. Hiển thị đơn hàng, kế hoạch sản xuất và xưởng liên quan.  (KeHoachSanXuat, ChiTietKeHoachSanXuat, DonHang, ChiTietDonHang, MatHang, ThanhPham, NguyenVatLieu, Xuong)
- 5. Chọn Phê duyệt kế hoạch sản xuất. (KeHoachSanXuat)
- 6. Kiểm tra lại kế hoạch, ngày thực hiện và đơn hàng liên quan; lưu quyết định phê duyệt kế hoạch, cập nhật trạng thái đơn hàng theo quyết định và thông báo cho Bộ phận lập kế hoạch, Chủ xưởng phụ trách. (KeHoachSanXuat, DonHang, NguoiDungXuong, ThongBao)
- 2. Hệ thống lưu kế hoạch bị từ chối cùng lý do, cập nhật thông tin liên quan và thông báo cho Bộ phận lập kế hoạch. Không coi việc từ chối một kế hoạch là hủy mọi kế hoạch hoặc chứng từ của đơn hàng. (DonHang, ThongBao, KeHoachSanXuat)
- 1. Hệ thống hiển thị nội dung vượt số lượng để Ban giám đốc xem xét. (KeHoachSanXuat, DonHang)
- 2. Nếu chọn Tiếp tục, hệ thống kiểm tra các điều kiện còn lại và phê duyệt. (KeHoachSanXuat, DonHang)
- 1. Hệ thống thông báo không có kế hoạch sản xuất cần phê duyệt. (KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachSanXuat, DonHang)

## UC-14 Xem/Quản lý đơn hàng mua

- 1. Chọn chức năng Xem/Quản lý đơn hàng mua (DonMuaHang, ChiTietDonMuaHang)
- 2. Hiển thị danh sách đơn hàng đã đặt (DonMuaHang)
- 1. Bộ phận mua hàng chọn đơn mua. (DonMuaHang, ChiTietDonMuaHang)
- 2. Hệ thống hiển thị từng nguyên vật liệu, nhà cung cấp, số lượng, đơn vị, đơn giá, ngày nhận, điều kiện giao hàng, kế hoạch nguồn nếu có và trạng thái. (MatHang, NguyenVatLieu, DonViTinh, NhaCungCap, DonMuaHang, ChiTietDonMuaHang)
- 1. Bộ phận mua hàng mở đơn mua còn lượng chưa nhận và chọn ghi nhận hàng về. (DonMuaHang, ChiTietDonMuaHang)
- 2. Nhập từng mặt hàng, số lượng thực nhận, thông tin lô và ngày nhận. (MatHang, DonMuaHang, ChiTietDonMuaHang)
- 3. Hệ thống kiểm tra lượng đã nhận cộng lượng mới, lưu phần lô chờ kiểm tra chất lượng. (LoHang, ChiTietLo, DonMuaHang, ChiTietDonMuaHang)
- 4. Việc đặt mua hoặc đến ngày nhận dự kiến không tự tạo hàng thực nhận, không tự tăng tồn kho. (TonKho, PhanCongKho)
- 1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonHang, DonMuaHang, ChiTietDonMuaHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonMuaHang, ChiTietDonMuaHang)

## UC-23 Yêu cầu nhập/xuất

- 2. Hiển thị form chọn Nhập kho hoặc Xuất kho, mục đích, nguồn hàng, kho, Quản lý kho phụ trách, ngày giờ thực hiện và ghi chú. Xưởng mặc định là xưởng gắn với tài khoản Chủ xưởng. (NguoiDungXuong, Xuong, Kho, NguoiDung, NguoiDungVaiTro, KeHoachMuaBan, DonMuaHang, KeHoachSanXuat, BanBaoCaoSanXuat)
- 3. Chọn nhập hoặc xuất, mục đích và nguồn phù hợp; xem các mặt hàng, phần lô và lượng còn được yêu cầu; chọn kho, Quản lý kho phụ trách, ngày giờ và ghi chú. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, KeHoachMuaBan, DonMuaHang, KeHoachSanXuat, BanBaoCaoSanXuat, LoHang, ChiTietLo, Kho, NguoiDung)
- 4. Hiển thị thông tin nguồn, xưởng phụ trách và danh sách mặt hàng của yêu cầu. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, KeHoachMuaBan, DonMuaHang, KeHoachSanXuat, BanBaoCaoSanXuat, Xuong, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo)
- 6. Kiểm tra thông tin bắt buộc và số lượng lớn hơn 0. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 7. Kiểm tra quyền đối với xưởng, nguồn, phần lô, ngày giờ và lượng còn được phép; không tính lại lượng đã thực hiện hoặc đã nằm trong yêu cầu còn hiệu lực. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, NguoiDungXuong, PhanCongKho, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 8. Lưu yêu cầu Chờ xử lý kèm nguồn đã chọn. (PhieuYeuCauNhapXuat)
- 9. Lưu các dòng mặt hàng và lượng đề nghị.  (ChiTietPhieuYeuCauNhapXuat)
- 10. Gửi thông báo đến bộ phận kho. (ThongBao)
- 1. Chủ xưởng chọn Nhập kho, mục đích Nhập nguyên vật liệu từ kế hoạch mua. (KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang, NguyenVatLieu)
- 2. Chọn kế hoạch mua có đơn mua và phần hàng thực nhận phù hợp. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 3. Hệ thống hiển thị lô nguyên vật liệu, phần đạt chất lượng còn chưa nhập và số lượng được phép yêu cầu; phần lỗi hoặc đã trả nhà cung cấp không được tính vào lượng đạt. (LoHang, ChiTietLo, MatHang, NguyenVatLieu, NhaCungCap, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Chủ xưởng chọn Nhập kho, mục đích Nhập thành phẩm, rồi chọn báo cáo thành phẩm đã gửi. (MatHang, ThanhPham)
- 2. Hệ thống hiển thị đúng phần thành phẩm của báo cáo, cùng mã lô sản xuất; lấy phần đạt chất lượng còn chưa nhập. (LoHang, ChiTietLo, MatHang, ThanhPham, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Chủ xưởng chọn Xuất kho, mục đích Xuất nguyên vật liệu để sản xuất, rồi chọn kế hoạch sản xuất của xưởng. (KeHoachSanXuat, ChiTietKeHoachSanXuat, MatHang, NguyenVatLieu, Xuong)
- 2. Hệ thống lấy nhu cầu nguyên vật liệu, trừ lượng đã cấp và lượng đã được yêu cầu còn hiệu lực; không cộng thêm 10% lần nữa. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, MatHang, NguyenVatLieu)
- 1. Chủ xưởng chọn Xuất kho, mục đích Giao thành phẩm, rồi chọn kế hoạch sản xuất. (KeHoachSanXuat, ChiTietKeHoachSanXuat, MatHang, ThanhPham)
- 2. Hệ thống đối chiếu đơn hàng, kế hoạch bán đã được duyệt, sản lượng hoàn tất và thành phẩm đạt chất lượng đã nhập kho còn có thể xuất. (DonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang, ThanhPham, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo không có nguồn hợp lệ để lập yêu cầu; không lưu yêu cầu. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo chưa có dữ liệu nguồn phù hợp; không tự tạo lô chỉ vì đã có kế hoạch hoặc đến ngày dự kiến. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 2. Chủ xưởng kiểm tra lại việc ghi nhận hàng về hoặc gửi báo cáo rồi thực hiện lại. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống yêu cầu nhập đầy đủ thông tin và số lượng lớn hơn 0; không lưu yêu cầu. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo yêu cầu không đủ điều kiện hoặc lượng đề nghị vượt lượng còn được phép; không lưu yêu cầu. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Xưởng được lấy từ tài khoản Chủ xưởng: Xưởng ahtor, Xưởng edxn hoặc Xưởng trnvnth. Chủ xưởng không tự chọn thay xưởng ngoài quyền phụ trách. (Xuong)
- 2. Thành phẩm được báo cáo từng phần; mỗi phần thuộc cùng lô sản xuất nhưng chỉ được yêu cầu nhập trong lượng của chính phần đó. (LoHang, ChiTietLo, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 3. Báo cáo thành phẩm đã gửi là nguồn cho yêu cầu nhập phần thành phẩm. Xuất thành phẩm được đối chiếu với kế hoạch sản xuất, đơn hàng và kế hoạch bán theo điều kiện giao hàng. (DonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang, ThanhPham)
- 4. Nhu cầu xuất nguyên vật liệu lấy từ kế hoạch sản xuất; nếu sử dụng báo cáo nhu cầu theo lựa chọn được cung cấp thì lấy đúng nhu cầu được phép của báo cáo. Không lấy lượng thiếu cần mua làm toàn bộ lượng xuất sản xuất. (KeHoachSanXuat, ChiTietKeHoachSanXuat, MatHang, NguyenVatLieu, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 5. Gửi yêu cầu chưa làm thay đổi tồn kho. Quản lý kho phân công nhân viên và phần lô thực hiện; Nhân viên kho ghi phiếu thực nhập hoặc thực xuất mới cập nhật tồn kho. (LoHang, ChiTietLo, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, TonKho, PhanCongKho, NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)

## UC-24 Quản lý yêu cầu nhập xuất

- 2. Hiển thị danh sách yêu cầu đã gửi của chủ xưởng (PhieuYeuCauNhapXuat)
- 3. Chọn một yêu cầu để xem chi tiết (PhieuYeuCauNhapXuat)
- 4. Hiển thị thông tin và trạng thái xử lý yêu cầu (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, MatHang, LoHang, ChiTietLo, PhanCongKho, CongViec)
- 2. Hệ thống hiển thị yêu cầu phù hợp (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo không tìm thấy yêu cầu (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

## UC-24.1 Sửa yêu cầu

- 1. Chọn Sửa (PhieuYeuCauNhapXuat)
- 2. Kiểm tra yêu cầu chưa được xử lý (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho, CongViec)
- 3. Hiển thị form với thông tin hiện tại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 4. Chỉnh sửa thông tin muốn thay đổi (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 5. Chọn xác nhận (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 6. Hệ thống kiểm tra thông tin nhập (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 7. Hệ thống cập nhật thông tin sau khi chỉnh sửa (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống thông báo không thể lưu nội dung sửa. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 2. Chủ xưởng tải lại yêu cầu và liên hệ Quản lý kho nếu cần điều chỉnh phần đã phân công. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

## UC-24.2 Xóa yêu cầu

- 1. Chọn một yêu cầu và chọn Xóa (PhieuYeuCauNhapXuat)
- 2. Hệ thống yêu cầu xác nhận xóa (PhieuYeuCauNhapXuat)
- 3. Xác nhận xóa (PhieuYeuCauNhapXuat)
- 4. Hệ thống hủy yêu cầu và thông báo đến bộ phận kho (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, ThongBao)
- 1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

## UC-27 Mua hàng

- 3. Chọn Theo kế hoạch mua nguyên vật liệu và chọn kế hoạch đã được duyệt. (KeHoachMuaBan)
- 4. Hiển thị danh sách nguyên vật liệu, số lượng và ngày nhận mong muốn của kế hoạch; hiển thị báo cáo nguồn nếu kế hoạch có báo cáo. (KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang, NguyenVatLieu, DonViTinh, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 5. Chọn nhà cung cấp cho từng nguyên vật liệu; kiểm tra đơn vị, nhập giá thỏa thuận, điều kiện giao hàng và ghi chú. (MatHang, NguyenVatLieu, NhaCungCap, DonViTinh)
- 6. Kiểm tra mặt hàng, nhà cung cấp từng dòng, lượng mua, đơn giá, ngày nhận và kế hoạch nguồn. Ngày nhận của đơn theo kế hoạch được lấy từ kế hoạch mua. (KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang, NguyenVatLieu, NhaCungCap, DonViTinh, DonMuaHang, ChiTietDonMuaHang)
- 8. Tạo đơn mua và các dòng nguyên vật liệu, nhà cung cấp tương ứng; ghi nhận kế hoạch và báo cáo nguồn nếu có; thông báo mua hàng thành công. Chưa tạo hàng thực nhận hoặc tăng tồn kho. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan, BanBaoCaoSanXuat)
- 2. Chọn từng nguyên vật liệu, số lượng, nhà cung cấp, đơn giá, ngày nhận mong muốn, điều kiện giao hàng và ghi chú. (MatHang, NguyenVatLieu, NhaCungCap)
- 3. Hệ thống kiểm tra dữ liệu; tiếp tục bước 7. Không bắt buộc có kế hoạch sản xuất hoặc báo cáo nhu cầu. (KeHoachSanXuat, ChiTietKeHoachSanXuat, DonMuaHang, ChiTietDonMuaHang)
- 1. Bộ phận mua hàng chọn nhà cung cấp của từng dòng. (NhaCungCap)
- 3. Một đơn có thể có các nhà cung cấp khác nhau ở các dòng; quay lại bước 5. (NhaCungCap)
- 1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonMuaHang, ChiTietDonMuaHang)

## UC-04 Lập kế hoạch mua/bán

- 1. Chọn chức năng Lập kế hoạch mua/bán (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Hiển thị form lập kế hoạch với loại kế hoạch và nguồn phù hợp; đối với kế hoạch mua nguyên vật liệu, có hai hình thức Lập trực tiếp và Theo báo cáo sản xuất. (BanBaoCaoSanXuat, KeHoachSanXuat, DonHang)
- 3. Chọn kế hoạch mua nguyên vật liệu, hình thức Theo báo cáo sản xuất và báo cáo nhu cầu đã gửi có nguyên vật liệu còn thiếu. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 4. Hệ thống lấy danh sách nguyên vật liệu và lượng thiếu; Bộ phận lập kế hoạch kiểm tra lượng mua, đơn giá dự kiến, chọn ngày nhận mong muốn và nhập ghi chú. Không chọn nhà cung cấp ở bước lập kế hoạch. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, NguyenVatLieu, DonViTinh)
- 5. Kiểm tra loại báo cáo, số lượng còn thiếu và thông tin kế hoạch.  (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 6. Tính tổng tiền dựa trên đơn giá * số lượng (ChiTietKeHoachMuaBan)
- 8. Lưu kế hoạch và chi tiết, ghi nhận báo cáo nguồn nếu có, chuyển sang Chờ phê duyệt và thông báo thành công. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ThongBao)
- 1. Chọn báo cáo thành phẩm đã gửi phù hợp; lấy thành phẩm thực tế, đối chiếu phần đạt chất lượng đã nhập kho và lượng còn có thể sử dụng, nhập lượng bán và ghi chú. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, TonKho, PhanCongKho, MatHang, ThanhPham, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Kiểm tra và tính tổng tiền như bước 5 đến bước 6; khi xác nhận, lưu kế hoạch bán và các dòng, gắn với báo cáo thành phẩm nguồn, trạng thái Chờ phê duyệt. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, ThanhPham)
- 1. Bộ phận lập kế hoạch chọn đơn hàng cần sản xuất; hệ thống lấy thông tin từ đơn hàng gồm thành phẩm, số lượng và ngày giao dự kiến (DonHang, MatHang, ThanhPham, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Chọn xưởng, ngày bắt đầu, ngày kết thúc và ghi chú; hệ thống tính nguyên vật liệu dự kiến từ công thức và số lượng thành phẩm, cộng dự phòng 10% một lần cho từng loại. Đối chiếu lượng có thể cấp để hiển thị phần thiếu dự kiến; kế hoạch có cả danh sách thành phẩm và nguyên vật liệu. (KeHoachSanXuat, ChiTietKeHoachSanXuat, TonKho, PhanCongKho, MatHang, NguyenVatLieu, ThanhPham, Xuong, DotKiemKe, CongViec, LoLichKiemTra, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 3. Kiểm tra đơn hàng, xưởng, ngày bắt đầu, ngày kết thúc và lượng dự kiến; khi xác nhận, lưu kế hoạch sản xuất để Ban giám đốc phê duyệt tại UC-31. Kế hoạch sản xuất được lưu riêng với kế hoạch mua hoặc bán. (DonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, Xuong, DotKiemKe, CongViec, LoLichKiemTra)
- 1. Bộ phận lập kế hoạch chọn loại Mua nguyên vật liệu và hình thức Lập trực tiếp. (MatHang, NguyenVatLieu)
- 2. Chọn nguyên vật liệu, nhập lượng cần mua, giá dự kiến, ngày nhận mong muốn và ghi chú. (MatHang, NguyenVatLieu, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 4. Tiếp tục kiểm tra và xác nhận như bước 5 đến bước 8. (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Bộ phận lập kế hoạch mở báo cáo nhu cầu đã nhận và chọn Tạo kế hoạch mua nguyên vật liệu. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, NguyenVatLieu)
- 2. Hệ thống mở form đã chọn báo cáo và điền các nguyên vật liệu còn thiếu. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, NguyenVatLieu)
- 1. Hệ thống hiển thị cảnh báo phần vượt so với đơn hàng hoặc báo cáo nguồn. (DonHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Nếu ngày kết thúc trước ngày bắt đầu, hoặc lịch vượt ngày nhận trễ nhất của đơn hàng, hệ thống không lưu. (DonHang, DotKiemKe, CongViec, LoLichKiemTra, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Hệ thống thông báo không thể dùng báo cáo này. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Chọn lại báo cáo nhu cầu để mua hoặc báo cáo thành phẩm phù hợp để bán. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan)

## UC-05 Quản lý kế hoạch

- 2. Hiển thị các kế hoạch của chức năng đang chọn cùng trạng thái và nguồn liên quan. (KeHoachMuaBan, KeHoachSanXuat)
- 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan, KeHoachSanXuat)
- 4. Hiển thị kế hoạch và các dòng chi tiết; kế hoạch sản xuất có đơn hàng, xưởng và nguyên vật liệu; kế hoạch mua hoặc bán có báo cáo nguồn nếu được lập từ báo cáo. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat, DonHang, ChiTietDonHang, Xuong, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, NguyenVatLieu, ThanhPham)
- 2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)

## UC-05.1 Sửa kế hoạch

- 1. Chọn Sửa (KeHoachMuaBan, KeHoachSanXuat)
- 2. Hiển thị form với thông tin kế hoạch hiện tại (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 3. Nhập thông tin cần chỉnh sửa và xác nhận (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 4. Kiểm tra thông tin, trạng thái kế hoạch và lượng sửa so với báo cáo nguồn.  (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 5. Lưu cập nhật vào hệ thống (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 6. Thông báo kế hoạch đã được cập nhật (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống hiển thị cảnh báo và yêu cầu xác nhận phần vượt. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 2. Nếu đồng ý, tiếp tục kiểm tra và lưu; nếu không đồng ý, giữ nguyên kế hoạch cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)

## UC-05.2 Xóa kế hoạch

- 1. Chọn Xóa (KeHoachMuaBan, KeHoachSanXuat)
- 2. Hệ thống kiểm tra kế hoạch được chọn chưa được duyệt/thực hiện (KeHoachMuaBan, KeHoachSanXuat, DonMuaHang, BanBaoCaoSanXuat, PhieuYeuCauNhapXuat)
- 3. Hệ thống yêu cầu xác nhận xóa (KeHoachMuaBan, KeHoachSanXuat)
- 4. Xác nhận xóa (KeHoachMuaBan, KeHoachSanXuat)
- 5. Hệ thống xóa kế hoạch khỏi danh sách và thông báo thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan, KeHoachSanXuat, ChiTietKeHoachSanXuat)

## UC-10 Nhập kho

- 2. Hiển thị công việc nhập kho được giao, yêu cầu nguồn, lô hoặc phần lô và lượng còn được thực hiện. (CongViec, PhanCongCongViec, PhanCongKho, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, LoHang, ChiTietLo)
- 3. Chọn công việc, đối chiếu giấy tờ thực nhập; kiểm tra lượng hệ thống gợi ý và điều chỉnh lượng thực nhập, vị trí, ngày nhập hoặc ghi chú theo thực tế. (CongViec, PhanCongCongViec, PhanCongKho, LoHang, ChiTietLo, ViTriKho)
- 4. Kiểm tra đúng người được phân công, kho, vị trí, dòng lô và lượng nhập không vượt lượng được giao hoặc phần đạt chất lượng còn chưa nhập. (CongViec, PhanCongCongViec, PhanCongKho, Kho, ViTriKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietPhieuKho)
- 6. Ghi phiếu nhập kho, tăng tồn theo lượng thực nhập, cập nhật lượng đã thực hiện và trạng thái công việc; thông báo thành công. Hồ sơ được cung cấp cho người có quyền xem. (PhieuKho, ChiTietPhieuKho, TonKho, BienDongKho, PhanCongKho, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, CongViec)
- 2. Hệ thống ghi nhận đúng lượng thực nhập; lượng còn lại chưa được coi là đã nhập. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Hệ thống thông báo không thể nhập lượng đã chọn. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Nhân viên kho kiểm tra lại hoặc liên hệ Quản lý kho. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Nhân viên chọn vị trí hợp lệ hoặc chờ kho đủ điều kiện. (ViTriKho, Kho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)

## UC-11 Xuất kho

- 2. Hiển thị công việc xuất kho được giao gồm xuất nguyên vật liệu để sản xuất hoặc xuất thành phẩm để giao hàng. (CongViec, PhanCongCongViec, PhanCongKho, PhieuYeuCauNhapXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (CongViec, PhanCongCongViec, PhanCongKho)

## UC-11.01 Xuất nguyên vật liệu

- 1. Chọn Xuất nguyên vật liệu (MatHang, NguyenVatLieu)
- 2. Hiển thị các công việc xuất đúng mục đích được giao cho nhân viên, còn lượng chưa thực hiện. (CongViec, PhanCongCongViec, PhanCongKho)
- 3. Chọn công việc và đối chiếu giấy tờ thực xuất; kiểm tra số lượng gợi ý, nhập lượng thực xuất và ghi chú thực tế. (CongViec, PhanCongCongViec, PhanCongKho)
- 4. Hiển thị yêu cầu xuất cho kế hoạch sản xuất hoặc nguồn nhu cầu được phép, cùng lô, vị trí và lượng Quản lý kho đã phân công. Kiểm tra lượng chưa cấp; không tự phân bổ lại lô thay Quản lý kho. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, KeHoachSanXuat, ChiTietKeHoachSanXuat, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, LoHang, ChiTietLo, ViTriKho, PhanCongKho)
- 6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoHang, ChiTietLo, PhanCongKho)
- 7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho, BienDongKho, PhanCongKho)
- 8. Cập nhật trạng thái lô và phiếu yêu cầu (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho, CongViec)
- 9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho (PhieuKho, ChiTietPhieuKho)
- 1. Nhân viên kho không xác nhận xuất khi thiếu hàng hoặc phát hiện hàng không đủ điều kiện; liên hệ Quản lý kho để kiểm tra và điều chỉnh theo quyền. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Khi chưa ghi phiếu, hệ thống không trừ tồn. Nếu cần xử lý ngoại lệ, Quản lý kho thực hiện tại UC-16; không tự tạo đề xuất hoặc tự đổi yêu cầu sang Chờ duyệt lại. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Nhân viên kho nhập lượng thực xuất nhỏ hơn lượng còn được phép. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Hệ thống cập nhật đúng lượng thực xuất, giữ phần chưa xuất để xử lý tiếp. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)

## UC-11.02 Xuất thành phẩm

- 1. Chọn Xuất thành phẩm (MatHang, ThanhPham)
- 2. Hiển thị các công việc xuất đúng mục đích được giao cho nhân viên, còn lượng chưa thực hiện. (CongViec, PhanCongCongViec, PhanCongKho)
- 3. Chọn công việc và đối chiếu giấy tờ thực xuất; kiểm tra số lượng gợi ý, nhập lượng thực xuất và ghi chú thực tế. (CongViec, PhanCongCongViec, PhanCongKho)
- 4. Hiển thị yêu cầu, đơn hàng, kế hoạch sản xuất, kế hoạch bán và các phần thành phẩm đạt chất lượng mà Quản lý kho đã phân công. Kiểm tra điều kiện hoàn tất sản xuất, ngày giao và lượng còn được giao. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, PhanCongKho)
- 6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoHang, ChiTietLo, PhanCongKho)
- 7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho, BienDongKho, PhanCongKho)
- 8. Cập nhật trạng thái lô, lượng đã giao của đơn và lượng đã thực hiện của kế hoạch BAN.  (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho, CongViec, DonHang, KeHoachMuaBan)
- 9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho (PhieuKho, ChiTietPhieuKho)
- 1. Nhân viên kho không xác nhận xuất khi thiếu hàng hoặc phát hiện hàng không đủ điều kiện; liên hệ Quản lý kho để kiểm tra và điều chỉnh theo quyền. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Khi chưa ghi phiếu, hệ thống không trừ tồn. Nếu cần xử lý ngoại lệ, Quản lý kho thực hiện tại UC-16; không tự tạo đề xuất hoặc tự đổi yêu cầu sang Chờ duyệt lại. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Nhân viên kho nhập lượng thực xuất nhỏ hơn lượng còn được phép. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Hệ thống cập nhật đúng lượng thực xuất, giữ phần chưa xuất để xử lý tiếp. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)

## UC-35 Báo cáo thành phẩm

- 1. Chọn chức năng Báo cáo thành phẩm (MatHang, ThanhPham)
- 2. Hiển thị kế hoạch, xưởng, số lượng thành phẩm theo kế hoạch, đã báo cáo, còn lại và nguyên vật liệu đã xuất cho sản xuất. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, PhieuKho, ChiTietPhieuKho, MatHang, ThanhPham, NguyenVatLieu)
- 3. Nhập lượng thành phẩm mới hoàn thành của phần này, thông tin phần lô, ngày sản xuất, hạn dùng nếu có và ghi chú. Khi báo cáo đợt cuối, kiểm tra và nhập lượng nguyên vật liệu thực tế đã dùng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, LoHang, ChiTietLo)
- 4. Cập nhật lượng còn lại theo lượng đang nhập; kiểm tra tổng các phần thành phẩm, lô, ngày và lượng nguyên vật liệu sử dụng. Các phần của cùng kế hoạch dùng chung mã lô sản xuất nhưng có thông tin phần riêng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, LoHang, ChiTietLo, KeHoachSanXuat, ChiTietKeHoachSanXuat, PhieuKho, ChiTietPhieuKho)
- 6. Lưu và gửi báo cáo thành phẩm; ghi nhận phần lô tương ứng, thông báo cho người nhận. Chỉ đợt cuối đủ điều kiện mới hoàn tất kế hoạch; không tự nhập tồn hoặc tự kết luận chất lượng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, LoHang, ChiTietLo, KeHoachSanXuat, ThongBao)
- 1. Chủ xưởng chọn ô điền lượng còn lại của mặt hàng. (MatHang)
- 2. Hệ thống điền lượng chưa báo cáo vào số lượng của phần này, đồng thời cập nhật cột Còn lại về 0. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Khi lượng còn lại của tất cả thành phẩm bằng 0, hệ thống tự chọn Đợt cuối. (MatHang, ThanhPham)
- 2. Khi chọn Đợt cuối, hệ thống gợi ý lượng nguyên vật liệu chưa quyết toán từ tổng lượng đã xuất, trừ lượng đã báo sử dụng ở các phần trước. (MatHang, NguyenVatLieu)
- 3. Chủ xưởng kiểm tra và sửa lượng thực dùng rồi tiếp tục bước 5. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Ví dụ đã xuất 5.000, thực dùng 4.900 thì báo cáo ghi đúng 4.900; phần 100 còn dư phải được đối chiếu riêng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Chủ xưởng lưu báo cáo để kiểm tra lại. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống không lưu hoặc gửi báo cáo không hợp lệ. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Chủ xưởng kiểm tra lại các phần trước và lượng còn lại. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống yêu cầu đối chiếu lại phiếu xuất và lượng đã báo sử dụng. (PhieuKho, ChiTietPhieuKho)
- 1. Hệ thống không cho sửa đè hoặc xóa báo cáo đã làm căn cứ cho bước tiếp theo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Chủ xưởng xem lại báo cáo đã gửi để tránh lập trùng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

## UC-01 Đăng nhập

- 4. Kiểm tra thông tin đăng nhập (NguoiDung, NguoiDungVaiTro, VaiTro, LanThuDangNhap)
- 6. Hiển thị màn hình chính theo quyền của người dùng (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong, PhienDangNhap)
- 1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)
- 1. Hệ thống không cho đăng nhập bằng tài khoản không hoạt động; hiển thị thông báo tên đăng nhập hoặc mật khẩu không đúng. Người dùng liên hệ quản trị viên để kiểm tra tài khoản. (NguoiDung)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (NguoiDung)

## UC-12 Quản lý kết quả kiểm tra QC/AC

- 1. Chọn chức năng Quản lý kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Hiển thị danh sách kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC)
- 3. Chọn một kết quả để xem chi tiết (KetQuaKiemTraQCAC)
- 4. Hiển thị chi tiết kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham)
- 1. Nhân viên nhập điều kiện tìm kiếm hoặc lọc kết quả. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Kết quả đã ghi không được xóa; nếu sai, thực hiện điều chỉnh tại UC-12.2 để giữ lịch sử. UC-12.3 không còn được sử dụng để xóa kết quả. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

## UC-12.1 Thêm kết quả kiểm tra QC/AC

- 1. Chọn Thêm kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Hiển thị các đợt được phân công và từng phần lô còn chờ kiểm tra; gợi ý lượng cần kiểm. (LoLichKiemTra, PhanCongLichKiemTra, CongViec, PhanCongCongViec, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 3. Nhập lượng kiểm tra, lượng đạt, lượng lỗi và ghi chú của từng dòng lô; xác nhận.  (ChiTietKetQuaKiemTraQCAC, ChiTietLo)
- 4. Kiểm tra lượng đạt cộng lượng lỗi bằng toàn bộ lượng phải kiểm của từng dòng; lưu kết quả và cập nhật tiến độ đợt. Nguyên vật liệu lỗi được ghi nhận trả nhà cung cấp theo kết luận; phần đạt chưa tăng tồn, phải có yêu cầu và phiếu nhập. Thành phẩm lỗi được xử lý theo kết luận và ngoại lệ nếu cần. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, LoHang, ChiTietLo, LoLichKiemTra, CongViec, PhanCongLichKiemTra, ChiTietLoTraVe, DonMuaHang)
- 1. Nếu toàn bộ đạt, nhập lượng lỗi bằng 0. Nếu toàn bộ không đạt, nhập lượng đạt bằng 0. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Nếu có lượng lỗi, nhập mô tả lỗi. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 3. Tiếp tục kiểm tra và lưu ở bước 4. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Đợt chỉ hoàn tất khi đủ các nội dung được phân công; kết quả được tổng hợp vào một biên bản tại UC-28. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo chưa có dữ liệu hoặc chưa đến thời gian thực hiện. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Kiểm tra lại ghi nhận hàng về và thời gian đợt; giả lập chỉ cho phép bắt đầu sớm khi được xác nhận, không tạo phần lô. (LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo và không ghi kết quả trùng hoặc không đủ. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Nhân viên kiểm tra lại số lượng và dòng lô. (LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

## UC-12.2 Sửa kết quả kiểm tra QC/AC

- 1. Chọn kết quả cần điều chỉnh và mở Chứng từ bù QC. (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Hiển thị dòng lô, số lượng đạt, số lượng lỗi và nội dung lỗi hiện tại. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietLo)
- 3. Nhập số đạt, số lỗi mới, mô tả lỗi nếu có và lý do điều chỉnh; xác nhận. Số nhập là kết quả mới, không phải số chênh lệch. (ChungTuBuQC, ChiTietKetQuaKiemTraQCAC)
- 4. Kiểm tra người lập, dòng lô và tổng lượng không đổi; lưu chứng từ điều chỉnh và kết quả mới nếu đủ điều kiện. Không sửa phiếu kho hoặc tự thay đổi tồn kho. (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietLo)
- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Người dùng liên hệ Quản lý kho để xử lý theo chứng từ và phê duyệt tương ứng; không xóa kết quả cũ. (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (ChungTuBuQC, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

## UC-12.3 Xóa kết quả kiểm tra QC/AC

- 1. Mở chi tiết kết quả kiểm tra. (KetQuaKiemTraQCAC)
- 2. Hệ thống hiển thị kết quả đã ghi và không cung cấp thao tác xóa kết quả như một bước thực hiện thành công. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Nếu kết quả đã gắn với hàng nhập kho hoặc chứng từ khác, phải xử lý theo luồng điều chỉnh có liên quan; không xóa lịch sử. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống thông báo không xóa kết quả QC đã ghi. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Không thay đổi kết quả hoặc tồn kho. (TonKho, PhanCongKho, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

## UC-34 Lập phiếu báo cáo sản xuất

- 1. Chọn chức năng Lập phiếu báo cáo sản xuất. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Hiển thị form báo cáo sản xuất. (KeHoachSanXuat, Xuong)
- 3. Chọn kế hoạch sản xuất và mục đích báo cáo: tiến độ, sự cố hoặc nhu cầu nguyên vật liệu. (KeHoachSanXuat)
- 4. Hiển thị kế hoạch, xưởng và các nội dung phù hợp với mục đích báo cáo. Với báo cáo nhu cầu, lấy lượng nguyên vật liệu ước lượng từ kế hoạch. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang, NguyenVatLieu)
- 5. Với báo cáo nhu cầu, hiển thị lượng tồn khả dụng từ hệ thống; không coi toàn bộ lượng đã dành cho nhu cầu khác là lượng còn có thể cấp. (TonKho, PhanCongKho, ChiTietLo, MatHang, NguyenVatLieu)
- 6. Nhập tiến độ sản xuất hiện tại. (BanBaoCaoSanXuat)
- 7. Nhập mô tả tình hình sản xuất, vấn đề phát sinh hoặc nội dung cần báo cáo. (BanBaoCaoSanXuat)
- 8. Với báo cáo nhu cầu, đối chiếu lượng có thể cấp với lượng ước lượng cần dùng. (KeHoachSanXuat, ChiTietKeHoachSanXuat, TonKho, PhanCongKho, MatHang, NguyenVatLieu)
- 9. Tính lượng thiếu của từng nguyên vật liệu, không nhỏ hơn 0; xác định đủ hoặc thiếu. Báo cáo tiến độ hoặc sự cố không bắt buộc phải có dòng nguyên vật liệu. (ChiTietKeHoachSanXuat, TonKho, PhanCongKho, MatHang, NguyenVatLieu)
- 10. Hiển thị nội dung báo cáo và người nhận mặc định là Ban giám đốc. (BanBaoCaoSanXuat, NguoiDung, NguoiDungVaiTro, VaiTro)
- 11. Chọn gửi thêm Bộ phận lập kế hoạch nếu cần. Với báo cáo nhu cầu còn thiếu nguyên vật liệu, hệ thống tự gửi thêm bộ phận này. (BanBaoCaoSanXuat, NguoiDung, NguoiDungVaiTro, VaiTro)
- 13. Kiểm tra thông tin báo cáo, tiến độ và quyền đối với kế hoạch, xưởng. (KeHoachSanXuat, ChiTietKeHoachSanXuat, NguoiDungXuong, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 14. Lưu báo cáo sản xuất với thời gian lập, mục đích, tiến độ và mô tả, liên kết kế hoạch sản xuất và xưởng. (BanBaoCaoSanXuat)
- 15. Đối với báo cáo nhu cầu, lưu từng nguyên vật liệu, lượng có thể cấp, lượng cần dùng và lượng còn thiếu. (ChiTietBaoCaoSanXuat)
- 16. Gửi báo cáo đến Ban giám đốc. (BanBaoCaoSanXuat, ThongBao, NguoiDung, NguoiDungVaiTro, VaiTro)
- 17. Gửi thêm Bộ phận lập kế hoạch nếu Chủ xưởng đã chọn hoặc nếu là báo cáo nhu cầu còn thiếu nguyên vật liệu. (BanBaoCaoSanXuat, ThongBao, NguoiDung, NguoiDungVaiTro, VaiTro)
- 1. Chủ xưởng mở đối chiếu tồn từ kế hoạch và chọn lập báo cáo nhu cầu. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Hệ thống điền lượng cần dùng, lượng có thể cấp và lượng thiếu. (TonKho, PhanCongKho)
- 3. Chủ xưởng kiểm tra, bổ sung mô tả hoặc ảnh rồi tiếp tục bước 12. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Chủ xưởng chọn Lưu nháp. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Hệ thống lưu báo cáo chưa gửi, cho phép mở lại để hoàn thiện. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống hiển thị thông báo về thông tin cần bổ sung hoặc chỉnh sửa; không lưu và không gửi báo cáo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống hiển thị thông báo “Kế hoạch sản xuất không hợp lệ hoặc không thuộc xưởng”; không lưu và không gửi báo cáo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, Xuong)
- 1. Hệ thống hiển thị thông báo “Tiến độ báo cáo sản xuất phải từ 0% đến dưới 100%”; không lưu và không gửi báo cáo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống không tạo báo cáo nhu cầu trùng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Chủ xưởng xem lại báo cáo đang hiệu lực. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống không cho sửa đè báo cáo. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 2. Chủ xưởng xem lại báo cáo đã gửi; không tự thay đổi thông tin mà kế hoạch sau đang sử dụng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

## UC-15 Thực hiện kiểm kê

- 2. Hiển thị các công việc được giao; khi chọn công việc, hiển thị toàn bộ lô hoặc phần lô phải kiểm cùng mặt hàng, đơn vị và lượng hệ thống để đối chiếu. (CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra, LoHang, ChiTietLo, MatHang, DonViTinh, PhieuKiemKe, ChiTietPhieuKiemKe, TonKho)
- 3. Chọn công việc và nhập lượng thực đếm của từng dòng; có thể chọn Đạt ở một dòng hoặc Đạt tất cả để điền lượng bằng lượng hệ thống. (PhieuKiemKe, ChiTietPhieuKiemKe, PhanCongLichKiemTra)
- 4. Hiển thị chênh lệch theo số lượng vừa nhập; vẫn cho sửa lượng đã điền để đúng thực tế. Nút Đạt chỉ hỗ trợ kiểm số lượng, không thay kết luận chất lượng của QC/AC. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 6. Kiểm tra đủ dòng và quyền phân công; lưu số đếm, người đếm, thời điểm và tiến độ. Nếu đợt có QC/AC, vẫn chờ phần chất lượng hoàn tất. Không tự điều chỉnh tồn kho theo số đếm. (PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, LoLichKiemTra, PhanCongLichKiemTra)
- 1. Nhân viên chọn Đạt ở dòng cần điền hoặc Đạt tất cả. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Hệ thống điền lượng đối chiếu cho dòng chưa ghi nhận; không ghi đè các dòng đã có kết quả hoàn tất. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 3. Nhân viên kiểm tra và điều chỉnh số thực đếm, sau đó tiếp tục bước 5. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống không cho ghi số đếm. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Nhân viên kiểm tra lại thời gian, phân công và trạng thái công việc. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKiemKe, ChiTietPhieuKiemKe)

## UC-28 Lập biên bản kiểm kê

- 1. Chọn chức năng Lập biên bản kiểm kê (PhieuKiemKe, LoLichKiemTra)
- 2. Hiển thị công việc và kết quả đã hoàn tất. Đợt có cả QC/AC và Ban kiểm kê tổng hợp cả chất lượng và số đếm; đợt chỉ có một nhóm chỉ yêu cầu kết quả của nhóm được giao. (CongViec, PhanCongCongViec, LoLichKiemTra, PhanCongLichKiemTra, PhieuKiemKe, ChiTietPhieuKiemKe, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 3. Người được chỉ định nhập kết luận, nhận xét; chọn Không có ngoại lệ hoặc Nhập mô tả ngoại lệ; nếu có ngoại lệ thì nhập nội dung, xem lại và gửi biên bản. (PhieuKiemKe, LoLichKiemTra)
- 4. Kiểm tra người lập và kết quả đợt; lưu biên bản chung, nội dung ngoại lệ nếu có và gửi thông báo. Biên bản đã gửi giữ nguyên kết quả được tổng hợp tại thời điểm gửi. (PhieuKiemKe, LoLichKiemTra, PhanCongLichKiemTra, PhanCongKetLuanKiemKe, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietPhieuKiemKe, ThongBao)
- 1. Nhân viên chọn Lưu tạm (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Lưu tạm nội dung biên bản trên phiếu kiểm kê.  (PhieuKiemKe, LoLichKiemTra, ChiTietPhieuKiemKe)
- 1. Nhân viên vẫn mở được giao diện và xem dữ liệu trong phạm vi được phép. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Hệ thống không cho tạo, sửa hoặc gửi biên bản thay người được phân công. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra)
- 3. Người được phân công thấy thông tin nhiệm vụ lập biên bản. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra)
- 2. Hệ thống hiển thị ô mô tả; nhân viên nhập vấn đề và gửi cùng biên bản. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra, ChiTietPhieuKiemKe)
- 1. Người lập mở bản nháp, kiểm tra và sửa nội dung được phép. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 3. Hệ thống kiểm tra lại điều kiện rồi lưu bản gửi và thông báo. (PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống thông báo còn nội dung kiểm số lượng hoặc chất lượng được giao chưa hoàn tất; chưa cho lập biên bản chung. (PhieuKiemKe, LoLichKiemTra)
- 2. Nhân viên tải lại đợt và kiểm tra biên bản, phân công hiện tại. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuKiemKe, LoLichKiemTra, ChiTietPhieuKiemKe)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKiemKe, ChiTietPhieuKiemKe)

## UC-32 Phê duyệt kế hoạch mua/bán

- 1. Chọn chức năng Phê duyệt kế hoạch mua/bán (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Hiển thị danh sách kế hoạch đang chờ phê duyệt (KeHoachMuaBan)
- 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan)
- 4. Hiển thị kế hoạch, các dòng, ngày nhận hoặc ngày bán và nguồn nếu có. Kế hoạch mua trực tiếp không bắt buộc có báo cáo; kế hoạch mua theo báo cáo lấy nhu cầu nguyên vật liệu; kế hoạch bán đối chiếu báo cáo thành phẩm và lượng đạt chất lượng còn có thể sử dụng. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, NguyenVatLieu, ThanhPham, TonKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 5. Chọn Phê duyệt (KeHoachMuaBan)
- 6. Cập nhật kế hoạch thành Đã duyệt: MUA cho phép lập đơn mua; BAN cho phép triển khai xuất bán. Việc nhập kho chỉ thực hiện sau nhận hàng và QC đạt.  (KeHoachMuaBan, ThongBao)
- 2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (ThongBao, KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 1. Hệ thống hiển thị cảnh báo phần vượt. (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 3. Xác nhận vượt dự kiến không thay thế điều kiện tồn kho và chất lượng khi thực hiện. (TonKho, PhanCongKho)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (KeHoachMuaBan, ChiTietKeHoachMuaBan)

## UC-02 Đặt đơn hàng

- 1. Chọn chức năng Đặt đơn hàng (DonHang)
- 2. Hiển thị danh sách hàng mẫu để lựa chọn (MatHang, ThanhPham, LoaiHang, DonViTinh)
- 3. Chọn một hoặc nhiều mặt hàng, nhập số lượng theo đơn vị hiển thị, ghi chú từng dòng nếu có; nhập địa chỉ, ngày nhận trễ nhất và ghi chú chung. (MatHang, ThanhPham, DonViTinh)
- 5. Kiểm tra hàng còn được đặt, các mặt hàng không trùng, số lượng dương, địa chỉ và ngày nhận; lấy giá hiện hành của mặt hàng để tính tiền tham khảo. (MatHang, ThanhPham, KhachHang)
- 6. Lưu một đơn hàng với các dòng đã chọn, trạng thái Chờ tiếp nhận; thông báo đặt thành công và gửi thông báo cho Bộ phận lập kế hoạch. Đặt hàng chưa tạo lô hàng vật lý. (DonHang, ChiTietDonHang, KhachHang, ThongBao)
- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu chọn lại mặt hàng hợp lệ và gộp số lượng của cùng mặt hàng vào một dòng. (MatHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonHang, ChiTietDonHang)

## UC-03 Quản lý đơn hàng khách hàng

- 1. Chọn chức năng Quản lý đơn hàng (DonHang)
- 2. Hiển thị danh sách đơn hàng hiện có của khách hàng (DonHang, KhachHang)
- 3. Chọn một đơn hàng để xem chi tiết (DonHang)
- 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, ThanhPham)
- 2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang, ChiTietDonHang)
- 1. Hệ thống thông báo không có đơn hàng nào (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonHang, ChiTietDonHang)

## UC-03.1 Sửa đơn hàng khách hàng

- 1. Chọn Sửa đơn hàng (DonHang)
- 2. Hiển thị form với thông tin hiện tại của đơn hàng (DonHang, ChiTietDonHang, MatHang, ThanhPham)
- 3. Nhập thông tin muốn chỉnh sửa (số lượng, mô tả) (DonHang, ChiTietDonHang)
- 4. Chọn xác nhận (DonHang, ChiTietDonHang)
- 5. Kiểm tra thông tin mới (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat)
- 6. Cập nhật thông tin đơn hàng hợp lệ, giữ trạng thái xử lý hiện tại. (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu xác nhận việc thay đổi số lượng; khách hàng kiểm tra lại số lượng và ngày nhận mong muốn. (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu khách hàng kiểm tra và xác nhận việc giảm số lượng. (DonHang, ChiTietDonHang)
- 1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang, ChiTietDonHang)
- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu chỉnh sửa. (DonHang, ChiTietDonHang)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (DonHang, ChiTietDonHang)

## UC-22 Tra cứu dữ liệu trong kho

- 1. Chọn chức năng Tra cứu dữ liệu (Kho, ViTriKho, TonKho, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham)
- 2. Hiển thị danh sách danh mục hàng hóa (Kho, LoaiHang, MatHang)
- 3. Nhập tên (kho, danh mục, nguyên vật liệu, thành phẩm, tồn kho, lô nguyên vật liệu, lô thành phẩm) để tìm kiếm (Kho, LoaiHang, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo)
- 4. Hiển thị các danh mục/dữ liệu phù hợp (Kho, ViTriKho, LoaiHang, MatHang, NguyenVatLieu, ThanhPham, LoHang, ChiTietLo, TonKho)
- 5. Chọn một mục để xem chi tiết (Kho, ViTriKho, MatHang, ChiTietLo)
- 6. Hiển thị thông tin chi tiết (Kho, ViTriKho, MatHang, NguyenVatLieu, ThanhPham, DonViTinh, LoHang, ChiTietLo, TonKho, PhanCongKho)
- 2. Hệ thống hiển thị các vị trí, phân biệt vị trí có hàng, trống và đang chọn. (ViTriKho, Kho, TonKho, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham)
- 3. Chọn một vị trí để xem mặt hàng, phần lô, đơn vị, lượng tồn và lượng còn có thể sử dụng; vị trí trống hiển thị chưa có hàng. (LoHang, ChiTietLo, TonKho, PhanCongKho, ViTriKho, Kho, MatHang, DonViTinh, NguyenVatLieu, ThanhPham)
- 1. Chủ xưởng chọn kế hoạch của xưởng và mở đối chiếu tồn kho. (TonKho, PhanCongKho, Xuong)
- 2. Hệ thống lấy nhu cầu theo công thức và sản lượng, gồm dự phòng 10% một lần; đối chiếu lượng có thể cấp sau khi trừ phần đã dành cho nhu cầu khác. (KeHoachSanXuat, ChiTietKeHoachSanXuat, TonKho, PhanCongKho)
- 3. Hiển thị lượng cần dùng, có thể cấp và còn thiếu theo từng nguyên vật liệu, đúng đơn vị. (MatHang, NguyenVatLieu, DonViTinh, Kho, ViTriKho, TonKho, LoHang, ChiTietLo, ThanhPham)
- 1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, ViTriKho, TonKho, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (Kho, ViTriKho, TonKho, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham)

## UC-16 Xử lý chênh lệch kiểm kê

- 1. Chọn chức năng Xử lý chênh lệch kiểm kê (PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Tự hiển thị các ngoại lệ từ biên bản đã gửi và các chênh lệch cần xử lý; không yêu cầu Quản lý kho tự tạo lại vấn đề đã có. (PhieuKiemKe, ChiTietPhieuKiemKe, LoLichKiemTra, BanDeXuatXuLyNgoaiLe)
- 3. Chọn vấn đề cần xử lý. (PhieuKiemKe, LoLichKiemTra, BanDeXuatXuLyNgoaiLe)
- 4. Hiển thị biên bản, kết quả số lượng hoặc chất lượng, mặt hàng, lô, lượng liên quan và mô tả ngoại lệ; mở form xử lý. (PhieuKiemKe, ChiTietPhieuKiemKe, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, LoHang, ChiTietLo, MatHang, NguyenVatLieu, ThanhPham, BanDeXuatXuLyNgoaiLe)
- 5. Nhập cách xử lý; nếu cần xin ý kiến, chọn gửi đề xuất cho Chủ xưởng và nhập nội dung đề nghị. (PhieuKiemKe, LoLichKiemTra, BanDeXuatXuLyNgoaiLe)
- 7. Lưu cách xử lý hoặc gửi đề xuất chờ Chủ xưởng phê duyệt. Vấn đề đơn giản có thể xác nhận xử lý trực tiếp bằng mô tả; nếu cần điều chỉnh tồn kho, phải thực hiện bước chứng từ và phê duyệt tương ứng, không chỉ sửa số tồn bằng ghi chú. (PhieuKiemKe, LoLichKiemTra, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, ThongBao)
- 1. Quản lý kho chọn gửi phê duyệt, nhập cách xử lý đề xuất và nội dung cần Chủ xưởng xem xét. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Hệ thống lưu đề xuất Chờ phê duyệt, thông báo cho Chủ xưởng đúng xưởng; thực hiện quyết định tại UC-17. (Xuong, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, ThongBao, PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Quản lý kho mở vấn đề để xem quyết định. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Nếu đồng ý, thực hiện phương án được duyệt; nếu không đồng ý, xem lý do và hướng xử lý thay thế của Chủ xưởng. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 3. Ghi nhận kết quả theo quyền; không tự coi việc phê duyệt là đã thực hiện xong. (PhieuKiemKe, ChiTietPhieuKiemKe, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 1. Quản lý kho lập đề xuất điều chỉnh từ kết quả đã chốt. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe)
- 2. Ban giám đốc xem xét quyết định theo luồng điều chỉnh tồn. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe)
- 3. Quản lý kho chỉ áp dụng điều chỉnh được duyệt tại bước riêng; hệ thống ghi nhận thay đổi và giữ căn cứ. (PhieuKiemKe, ChiTietPhieuKiemKe, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 4. Không nhầm luồng này với việc Chủ xưởng cho ý kiến về mô tả ngoại lệ của biên bản lô. (PhieuKiemKe, LoLichKiemTra)
- 1. Hệ thống thông báo không có mặt hàng chênh lệch (MatHang, PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống thông báo và không ghi trùng kết quả. (PhieuKiemKe, ChiTietPhieuKiemKe, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 2. Quản lý kho kiểm tra lại chứng từ, quyết định và tồn kho hiện tại. (TonKho, PhanCongKho, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhieuKiemKe, ChiTietPhieuKiemKe)
- 1. Hệ thống yêu cầu đăng nhập lại hoặc thông báo không có quyền. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 1. Hệ thống thông báo và không lưu đè thông tin cũ. (PhieuKiemKe, ChiTietPhieuKiemKe, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)

## UC-BS01 Quản lý tài khoản và phân quyền

- 2. Hiển thị danh sách tài khoản, tên người dùng, trạng thái và quyền được cấp. (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong)
- 3. Chọn thêm tài khoản, nhập tên đăng nhập, họ tên, mật khẩu, quyền; nếu là Chủ xưởng thì chọn đúng một xưởng. (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong, Xuong)
- 4. Kiểm tra thông tin, tên đăng nhập và quyền; lưu tài khoản hợp lệ, thông báo thành công. (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong)
- 5. Mở tài khoản cần xem. (NguoiDung)
- 6. Hiển thị chi tiết và thao tác được phép. (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong, Xuong)
- 3. Hệ thống kiểm tra và lưu; thay đổi quyền, mật khẩu hoặc khóa tài khoản có thể yêu cầu người đang đăng nhập bằng tài khoản đó đăng nhập lại. (NguoiDung, NguoiDungVaiTro, VaiTro, PhienDangNhap)
- 2. Hệ thống ngừng sử dụng tài khoản theo điều kiện, giữ lịch sử chứng từ; không xóa dữ liệu nghiệp vụ liên quan. (PhieuKho, ChiTietPhieuKho, NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong)
- 2. Hệ thống giữ nguyên dữ liệu. (NguoiDung, NguoiDungVaiTro, VaiTro, NguoiDungXuong)
- 1. Hệ thống không lưu phân công không hợp lệ. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, VaiTro, NguoiDungXuong)
- 2. Quản trị viên chọn lại xưởng. (Xuong)

## UC-BS02 Quản lý đơn vị tính và giá nguyên vật liệu theo nhà cung cấp

- 1. Mở danh mục đơn vị tính hoặc bảng giá nguyên vật liệu theo nhà cung cấp. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 2. Hiển thị dữ liệu hiện tại và các thao tác theo quyền. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 3. Chọn thêm; nhập tên đơn vị, hoặc chọn nguyên vật liệu, nhà cung cấp, đơn giá và thông tin hiệu lực được yêu cầu. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 4. Kiểm tra dữ liệu, lưu nếu hợp lệ và thông báo thành công. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 5. Xem lại dữ liệu đã lưu. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 6. Hiển thị đúng đơn vị hoặc giá và nhà cung cấp tương ứng. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 1. Mở dòng đã có, chọn thao tác được phép rồi xác nhận. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 2. Hệ thống kiểm tra dữ liệu liên quan trước khi lưu. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 1. Bộ phận mua hàng chọn nguyên vật liệu và nhà cung cấp. (MatHang, NguyenVatLieu, NhaCungCap)
- 1. Hệ thống yêu cầu chỉnh sửa. (DonViTinh, MatHang, NguyenVatLieu, NhaCungCap)
- 2. Giữ đúng đơn vị của mặt hàng và chứng từ hiện có. (MatHang, DonViTinh)

## UC-BS03 Phân công thực hiện yêu cầu nhập hoặc xuất kho

- 1. Mở yêu cầu nhập hoặc xuất đang chờ xử lý. (PhieuYeuCauNhapXuat)
- 2. Hiển thị nguồn, xưởng, kho, ngày giờ đề nghị, các phần lô và lượng còn phải thực hiện. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, Xuong, Kho, LoHang, ChiTietLo, PhanCongKho)
- 3. Chọn Nhân viên kho, lô hoặc phần lô, vị trí và lượng phân công; xác nhận. (NguoiDung, NguoiDungVaiTro, LoHang, ChiTietLo, ViTriKho, PhanCongKho)
- 4. Kiểm tra người được giao, nguồn, chất lượng, lượng chưa thực hiện và lượng còn có thể cấp. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, PhanCongKho, NguoiDung)
- 5. Xem kết quả phân công. (CongViec, PhanCongCongViec, PhanCongKho)
- 6. Lưu công việc và thông báo cho nhân viên; với xuất kho, ghi nhận phần hàng đã dành để tránh cấp trùng. (CongViec, PhanCongCongViec, PhanCongKho, ThongBao)
- 2. Hệ thống ghi đúng phần phân công; phần chưa giao vẫn còn để xử lý tiếp. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)
- 2. Hệ thống giải phóng phần hàng chưa xuất đã dành; không xóa phiếu đã ghi và không hoàn tác lượng đã xuất. (PhieuKho, ChiTietPhieuKho, TonKho, PhanCongKho)
- 2. Không tạo công việc hoặc dành hàng. (TonKho, PhanCongKho)
- 1. Hệ thống không lưu phân công không hợp lệ. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhanCongKho)
- 2. Quản lý kho chọn lại dữ liệu. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, CongViec, PhanCongCongViec, PhanCongKho)
- 1. Hệ thống thông báo không thể phân công. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec)
- 2. Quản lý kho tải lại dữ liệu và điều chỉnh. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, CongViec, PhanCongCongViec, PhanCongKho)

## UC-BS04 Ghi nhận nguyên vật liệu thực nhận

- 1. Mở đơn mua và chọn ghi nhận hàng về. (DonMuaHang, ChiTietDonMuaHang)
- 2. Hiển thị mặt hàng, lượng đã đặt, lượng đã nhận, lượng còn nhận và nhà cung cấp. (DonMuaHang, ChiTietDonMuaHang, MatHang, NguyenVatLieu, DonViTinh, NhaCungCap, LoHang, ChiTietLo)
- 3. Nhập lượng thực nhận, mã lô, ngày nhận và thông tin ngày sản xuất, hạn dùng nếu được yêu cầu. (LoHang, ChiTietLo)
- 4. Kiểm tra lượng, lô và ngày; lưu phần hàng thực nhận phù hợp. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 5. Xem thông tin phần hàng đã nhận. (LoHang, ChiTietLo)
- 6. Hiển thị phần lô chờ kiểm tra chất lượng để lựa chọn trong đợt kiểm kê. (LoHang, ChiTietLo)
- 1. Mỗi lần giao nhập đúng lượng thực nhận mới. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 2. Hệ thống cộng dồn lượng đã nhận; không nhập lại lượng của lần trước. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 2. Người dùng kiểm tra và sửa. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 1. Hệ thống yêu cầu nhập lại. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 1. Chỉ có đơn mua hoặc đã đến ngày dự kiến chưa đủ tạo lô thực nhận. (DonMuaHang, ChiTietDonMuaHang, LoHang, ChiTietLo)
- 2. Người dùng ghi nhận hàng giao thực tế trước khi chọn phần lô để kiểm tra. (LoHang, ChiTietLo, DonMuaHang, ChiTietDonMuaHang)

## UC-BS05 Ghi nhận thành phẩm khách trả và cách ly

- 1. Mở chức năng ghi nhận khách trả hàng. (LoHang, ChiTietLo, ChiTietLoTraVe)
- 2. Hiển thị nguồn giao hàng được phép lựa chọn. (PhieuKho, ChiTietPhieuKho, DonHang, MatHang, ThanhPham)
- 3. Chọn dòng giao gốc, nhập lượng trả, lý do và kho nhận; xác nhận. (ChiTietPhieuKho, ChiTietLoTraVe, Kho)
- 4. Kiểm tra nguồn, lượng đã trả và lượng còn được trả; lưu hồ sơ hàng trả. (PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, ChiTietLoTraVe)
- 5. Người được phân công xác nhận thực nhận hàng trả theo hồ sơ. (LoHang, ChiTietLoTraVe)
- 6. Ghi nhận hàng vào khu cách ly; chưa đưa vào lượng có thể xuất bán. (LoHang, ChiTietLo, ChiTietLoTraVe, TonKho, BienDongKho)
- 1. Nhập đúng lượng khách trả của lần này. (LoHang, ChiTietLo, ChiTietLoTraVe)
- 2. Hệ thống cộng dồn các lần trả để đối chiếu dòng giao gốc. (PhieuKho, ChiTietPhieuKho)
- 1. Giao kiểm tra chất lượng theo phân công. (NguoiDung, NguoiDungVaiTro, CongViec, PhanCongCongViec, LoHang, ChiTietLo, ChiTietLoTraVe)
- 2. Dù kết quả đạt, hàng vẫn cần bước xử lý cho phép trước khi được xuất lại; không tự giải phóng hàng cách ly. (LoHang, ChiTietLo, ChiTietLoTraVe)
- 1. Hệ thống từ chối ghi nhận. (LoHang, ChiTietLo, ChiTietLoTraVe)
- 2. Kiểm tra lại phiếu giao gốc. (PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, ChiTietLoTraVe)

## UC-BS06 Điều chỉnh chất lượng hàng đã nhập và xử lý hàng cách ly

- 1. Quản lý kho mở hồ sơ hàng cần điều chỉnh hoặc xử lý cách ly, lập phương án và gửi duyệt. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy)
- 2. Hiển thị lô, lượng, kết quả chất lượng, vị trí và chứng từ nguồn; kiểm tra phương án. (LoHang, ChiTietLo, TonKho, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, PhieuKho, ChiTietPhieuKho, PhanBoXuLy)
- 3. Ban giám đốc xem phương án và phê duyệt khi đủ điều kiện. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 4. Lưu quyết định, thông báo cho người thực hiện; chưa tự thay đổi tồn kho. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, ThongBao)
- 5. Nhân viên QC/AC xác nhận phần chất lượng khi được yêu cầu; Quản lý kho áp dụng phương án được duyệt. (TaiKiemChatLuong, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy)
- 6. Kiểm tra lại quyết định, lượng và kết quả; ghi chứng từ điều chỉnh hoặc xử lý đúng bước, giữ lịch sử. (TaiKiemChatLuong, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy, PhieuKho, ChiTietPhieuKho, TonKho, BienDongKho, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Hệ thống lưu quyết định, chưa áp dụng phương án. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy)
- 2. Hệ thống chỉ áp dụng đúng lượng và đúng phương án đã duyệt. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy)
- 1. Hệ thống yêu cầu chỉnh sửa. (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, PhanBoXuLy)

## UC-BS07 Xem thông báo và số việc mới

- 2. Hiển thị thông báo của tài khoản và số việc mới ở chức năng liên quan bằng vòng tròn đỏ, số trắng. (ThongBao, CongViec, KeHoachSanXuat, KeHoachMuaBan, PhieuYeuCauNhapXuat, LoLichKiemTra)
- 3. Chọn thông báo hoặc chức năng có số mới. (ThongBao)
- 4. Mở chi tiết đối tượng liên quan nếu còn quyền; hiển thị nội dung và thao tác được phép. (ThongBao, NguoiDungVaiTro)
- 5. Xem hoặc đánh dấu thông báo đã đọc theo thao tác được cung cấp. (ThongBao)
- 6. Cập nhật tình trạng đọc của tài khoản; không tự duyệt kế hoạch, hoàn thành công việc hoặc ghi phiếu kho. (ThongBao)
- 1. Hệ thống hiển thị trạng thái không có thông báo mới, không hiển thị số đếm gây hiểu nhầm. (PhieuKiemKe, ChiTietPhieuKiemKe, ThongBao)
- 2. Hệ thống lấy số liệu mới trong phạm vi tài khoản. (ThongBao)

## UC-BS08 Xóa dữ liệu nghiệp vụ để thử nghiệm

- 1. Chọn nút Xóa dữ liệu gần Đăng xuất. (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, BienDongKho, DotKiemKe, PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, PhanCongCongViec, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 4. Kiểm tra quyền sử dụng, điều kiện môi trường và sao lưu cần thiết trước khi xóa. (NguoiDung, NguoiDungVaiTro)
- 5. Chờ thông báo kết quả và tải lại màn hình. (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, BienDongKho, DotKiemKe, PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, PhanCongCongViec, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 6. Xóa các đơn hàng, kế hoạch, báo cáo, phiếu và công việc trong phạm vi công cụ; giữ danh mục và tài khoản; thông báo kết quả. (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, BienDongKho, DotKiemKe, PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, PhanCongCongViec, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 1. Hệ thống thông báo thất bại hoặc cần kiểm tra lại. (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, BienDongKho, DotKiemKe, PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, PhanCongCongViec, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
- 2. Không thông báo đã xóa thành công khi chưa xác định kết quả; kiểm tra bản sao lưu và trạng thái trước khi thử lại. (DonHang, ChiTietDonHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan, DonMuaHang, ChiTietDonMuaHang, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho, LoHang, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, TonKho, BienDongKho, DotKiemKe, PhieuKiemKe, ChiTietPhieuKiemKe, CongViec, PhanCongCongViec, BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)
