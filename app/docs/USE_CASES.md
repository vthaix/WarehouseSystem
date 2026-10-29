# Đặc tả UC hiện hành

Hợp nhất 14/10/2026. Giữ 48 mã UC gốc và hai luồng UC-11.01/11.02. Những mô tả trước thay đổi được lưu trong archive/before-full-sync-20261014; bản này là luồng hiện hành, không còn cơ chế “ghi chú đầu trang ghi đè đoạn dưới”. Actor phụ và phạm vi chi tiết theo policy/service, không cấp quyền chỉ từ tên actor trong đặc tả.

Mọi thao tác cần đăng nhập, đúng quyền/scope; mutation kiểm dữ liệu/version/trạng thái, lỗi không để thay đổi một phần. Không coi toàn bộ nhánh UC đã nghiệm thu chỉ vì có handler. Đối chiếu [MODULE_MATRIX.md](MODULE_MATRIX.md).

## UC-29 Tiếp nhận đơn hàng

**Actor chính:** Bộ phận lập kế hoạch

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. Planner tiếp nhận trên DonHang hiện có, không tạo phiếu tiếp nhận riêng.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-06 Quản lý danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Lọc danh sách, mở chi tiết và thao tác có quyền.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-06.1 Thêm danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Nhập trường theo resource, kiểm mã trùng/FK/đơn vị/loại và dữ liệu hợp lệ.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-06.2 Xóa danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Xác nhận xóa/hủy; server chặn đối tượng có dữ liệu phụ thuộc.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-06.3 Sửa danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Tải bản hiện hành, sửa trường cho phép; không đổi nguồn lô/QC/chứng từ đã dùng.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-07 Quản lý dữ liệu danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Lọc danh sách, mở chi tiết và thao tác có quyền.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-07.1 Thêm dữ liệu danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Nhập trường theo resource, kiểm mã trùng/FK/đơn vị/loại và dữ liệu hợp lệ.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-07.2 Xóa dữ liệu danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Xác nhận xóa/hủy; server chặn đối tượng có dữ liệu phụ thuộc.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-07.3 Sửa dữ liệu danh mục kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Quản lý chọn đúng resource: loại hàng, hàng, NCC, kho/vị trí hoặc lô; danh mục hàng thuộc Business, kho/lô thuộc Warehouse.
2. Tải bản hiện hành, sửa trường cho phép; không đổi nguồn lô/QC/chứng từ đã dùng.
3. Lô NVL nhận theo dòng đơn mua; LoHang là đầu lô, ChiTietLo giữ từng mặt hàng. Ghi danh mục không tự thay đổi tồn.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-08 Quản lý nhập kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý xem/tổng hợp các phiếu đã ghi; không sửa lượng/lô lịch sử.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-09 Quản lý xuất kho

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý xem/tổng hợp các phiếu đã ghi; không sửa lượng/lô lịch sử.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-13 Lập đợt kiểm kê

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. BGĐ mở Lập đợt kiểm kê, chọn nhóm hàng, lô và các phần cần kiểm tra; ghi lịch, mô tả và chọn từng nhân viên Ban kiểm kê/QC/AC. Không chọn loại đợt.
2. Backend suy nội dung từ nhân viên: Ban kiểm kê kiểm số lượng, QC/AC kiểm chất lượng; chọn cả hai thì làm cả hai. Lưu đợt và công việc liên kết trong một giao dịch.
3. Công việc được xem, sửa hoặc hủy trong Quản lý công việc theo quyền/trạng thái. Màn hình này không tạo mới đợt.
4. Sau khi bắt đầu, nhân viên ghi kết quả đúng chuyên môn trên từng dòng lô. Đợt chỉ hoàn tất khi đủ kết quả của các nội dung được giao. Số đếm không tự điều chỉnh tồn. Nghiệp vụ COUNT tồn kho/chứng từ lịch sử vẫn được bảo toàn qua API tương thích.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-17 Phê duyệt đề xuất xử lý ngoại lệ

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Mở chênh lệch kiểm kê, dòng QC lỗi hoặc tồn cần cách ly; chọn lượng/vị trí và phương án.
2. BGĐ duyệt/từ chối theo version; người lập không tự duyệt, lưu KetQuaXuLyNgoaiLe.
3. Sau duyệt, QC tái kiểm nếu cần; quản lý áp dụng riêng, ghi biến động/bù QC và trạng thái.
4. Chặn lượng vượt nguồn, giữ chỗ, kho kiểm kê, giải phóng hàng hết hạn; giữ phiếu nhập/giao gốc.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-18 Xem danh sách hàng tồn kho

**Actor chính:** Ban giám đốc, Chủ xưởng, Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.
2. Xem hàng/lô/vị trí, bucket, tồn và khả dụng; không lấy lượng cách ly/hết hạn/giữ chỗ thành lượng xuất.
3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-19 Xem hồ sơ xuất kho

**Actor chính:** Ban giám đốc, Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.
2. Xem hồ sơ tổng hợp từ phiếu nhập/xuất gốc, ngày và nguồn; không tạo bảng hồ sơ riêng.
3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-20 Xem hồ sơ nhập kho

**Actor chính:** Ban giám đốc, Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.
2. Xem hồ sơ tổng hợp từ phiếu nhập/xuất gốc, ngày và nguồn; không tạo bảng hồ sơ riêng.
3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-21 Xem báo cáo kiểm kê

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.
2. Xem snapshot, số đếm, chênh lệch, kết luận và xử lý từng kho.
3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-25 Quản lý công việc

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Mở công việc thuộc quyền hoặc được giao.
2. Tạo/xem công việc, phân công và theo dõi tiến độ; công việc kho có thao tác ghi phiếu.
3. Kiểm vai trò người nhận, lịch giao nhau/version; chỉ hoàn tất việc kho sau ghi đủ lượng được giao.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-25.1 Chỉnh sửa công việc

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Mở công việc thuộc quyền hoặc được giao.
2. Sửa công việc chưa hoàn tất theo quyền, đồng bộ lịch QC khi áp dụng.
3. Kiểm vai trò người nhận, lịch giao nhau/version; chỉ hoàn tất việc kho sau ghi đủ lượng được giao.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-25.2 Xóa công việc

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Mở công việc thuộc quyền hoặc được giao.
2. Hủy/xóa khi trạng thái và nguồn cho phép; việc điều phối kho dùng hủy phân bổ, không bỏ phiếu đã ghi.
3. Kiểm vai trò người nhận, lịch giao nhau/version; chỉ hoàn tất việc kho sau ghi đủ lượng được giao.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-31 Phê duyệt kế hoạch sản xuất

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. BGĐ chọn KHSX và duyệt/từ chối theo version của kế hoạch; chỉ KHSX được chọn được duyệt; đơn nguồn tự cập nhật APPROVED trong cùng transaction.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-14 Xem/Quản lý đơn hàng mua

**Actor chính:** Bộ phận mua hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Bộ phận mua chọn kế hoạch mua nguyên vật liệu đã duyệt hoặc mở đơn mua hiện có.
2. Xem nguồn, các dòng mua, lượng nhận/trả và trạng thái đơn.
3. Server kiểm đúng loại báo cáo, hạn mức dùng chung và giá trị tiền; chưa tự mua bù khi trả NCC.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-23 Yêu cầu nhập/xuất

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng chọn Nhập hoặc Xuất; Nhập chọn NVL từ kế hoạch mua hoặc TP từ báo cáo thành phẩm; Xuất chọn NVL hoặc TP từ KHSX.
2. Xem lô nguồn, lượng QC đạt, lượng còn được đề nghị; chọn kho, quản lý, ngày giờ đề nghị và gửi. Nhập TP theo từng báo cáo phần, không trừ nhầm nhu cầu của các phần khác cùng KHSX.
3. Xuất NVL kiểm nhu cầu chung của KHSX; xuất TP đối chiếu kế hoạch BAN đã duyệt liên quan, hoàn tất sản xuất, ngày giao và tồn khả dụng. Có nhiều kế hoạch bán thì chọn rõ nguồn, không đoán.
4. Quản lý xem yêu cầu/lô/lịch, chọn nhân viên, lô, vị trí và lượng thực hiện; nhân viên nhận công việc.
5. Nhân viên đối chiếu giấy ngoài, hệ thống điền lượng phân công còn lại nhưng cho sửa trong hạn mức; xác nhận phiếu mới cập nhật tồn. Nhập/xuất một phần giữ lại nhu cầu chưa thực hiện.
6. Chủ xưởng, quản lý và giám đốc xem hồ sơ tổng hợp từ các phiếu đã ghi, gồm lô, lượng thực tế và ghi chú giấy tờ. API cũ PLAN/REPORT/MANUAL giữ để tương thích; form mới chỉ có bốn nhánh trên.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-24 Quản lý yêu cầu nhập xuất

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng chọn một trong bốn nhánh: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán.
2. Nhập NVL lấy phần đạt QC còn lại từ nguồn mua; nhập TP MANUAL theo KHSX và lượng thực mỗi đợt, chung đầu lô/KHSX.
3. Xuất NVL PLAN/REPORT kiểm nhu cầu chung; xuất TP lấy BAN đã duyệt và tổng kết hoàn tất, đúng ngày giao và tồn khả dụng.
4. Xem tiến độ yêu cầu và các thao tác được phép.
5. Quản lý phân công; nhân viên được giao mới thực hiện phiếu thực nhập/xuất.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-24.1 Sửa yêu cầu

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng chọn một trong bốn nhánh: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán.
2. Nhập NVL lấy phần đạt QC còn lại từ nguồn mua; nhập TP MANUAL theo KHSX và lượng thực mỗi đợt, chung đầu lô/KHSX.
3. Xuất NVL PLAN/REPORT kiểm nhu cầu chung; xuất TP lấy BAN đã duyệt và tổng kết hoàn tất, đúng ngày giao và tồn khả dụng.
4. Sửa nguồn/lượng khi trạng thái cho phép; đợt TP MANUAL không chỉnh sửa lô đã ghi.
5. Quản lý phân công; nhân viên được giao mới thực hiện phiếu thực nhập/xuất.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-24.2 Xóa yêu cầu

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng chọn một trong bốn nhánh: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán.
2. Nhập NVL lấy phần đạt QC còn lại từ nguồn mua; nhập TP MANUAL theo KHSX và lượng thực mỗi đợt, chung đầu lô/KHSX.
3. Xuất NVL PLAN/REPORT kiểm nhu cầu chung; xuất TP lấy BAN đã duyệt và tổng kết hoàn tất, đúng ngày giao và tồn khả dụng.
4. Hủy khi trạng thái/phân công/QC cho phép; không xóa phiếu đã ghi.
5. Quản lý phân công; nhân viên được giao mới thực hiện phiếu thực nhập/xuất.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-27 Mua hàng

Cập nhật: chỉ tạo đơn theo kế hoạch mua nguyên vật liệu đã duyệt; mỗi dòng chọn nhà cung cấp riêng. Ngày nhận và lượng lấy từ kế hoạch; không có đường mua trực tiếp bỏ qua duyệt. Xem [MONOLITH.md](MONOLITH.md).

**Actor chính:** Bộ phận mua hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Bộ phận mua chọn kế hoạch mua nguyên vật liệu đã duyệt hoặc mở đơn mua hiện có.
2. Tạo tối đa một đơn cho mỗi kế hoạch; lấy ngày và lượng từ kế hoạch, chọn nhà cung cấp riêng từng nguyên vật liệu, nhập giá và điều kiện mua. Chưa duyệt, từ chối, sai loại kế hoạch hoặc không có kế hoạch đều không được đặt mua.
3. Server kiểm đúng loại báo cáo, hạn mức dùng chung và giá trị tiền; chưa tự mua bù khi trả NCC.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-04 Lập kế hoạch mua/bán

Nhánh MUA không chọn NCC; planner chọn ngày mong nhận NVL trong thời hạn KHSX/đơn nguồn. NCC do purchaser chọn theo từng NVL lúc lập đơn. KHSX chặn ngày quá khứ hoặc vượt ngày giao đơn.

**Actor chính:** Bộ phận lập kế hoạch

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX hoặc kế hoạch MUA/BAN đúng nghiệp vụ.
2. KHSX lấy đơn/xưởng, dòng thành phẩm và lượng NVL gốc +10% một lần; MUA lấy NHU_CAU, BAN lấy tổng kết thành phẩm.
3. Nguồn NHU_CAU/THANH_PHAM đã dùng không sửa; nhập/import không tự tạo phiếu kho.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-05 Quản lý kế hoạch

**Actor chính:** Bộ phận lập kế hoạch

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX hoặc kế hoạch MUA/BAN đúng nghiệp vụ.
2. Xem danh sách/chi tiết kế hoạch và thao tác theo trạng thái.
3. Nguồn NHU_CAU/THANH_PHAM đã dùng không sửa; nhập/import không tự tạo phiếu kho.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-05.1 Sửa kế hoạch

**Actor chính:** Bộ phận lập kế hoạch

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX hoặc kế hoạch MUA/BAN đúng nghiệp vụ.
2. Planner sửa bản chưa bị khóa bởi trạng thái/chứng từ phụ thuộc, kiểm hạn mức mới.
3. Nguồn NHU_CAU/THANH_PHAM đã dùng không sửa; nhập/import không tự tạo phiếu kho.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-05.2 Xóa kế hoạch

**Actor chính:** Bộ phận lập kế hoạch

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX hoặc kế hoạch MUA/BAN đúng nghiệp vụ.
2. Planner hủy/xóa khi trạng thái và tham chiếu cho phép, không xóa lịch sử đã sử dụng.
3. Nguồn NHU_CAU/THANH_PHAM đã dùng không sửa; nhập/import không tự tạo phiếu kho.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-10 Nhập kho

**Actor chính:** Nhân viên kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý phân công theo lô/vị trí/lượng; nhân viên chọn công việc được giao và lượng thực ghi, có thể ghi từng phần.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-11 Xuất kho

**Actor chính:** Nhân viên kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý phân công theo lô/vị trí/lượng; nhân viên chọn công việc được giao và lượng thực ghi, có thể ghi từng phần.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-11.01 Xuất nguyên vật liệu

**Actor chính:** Nhân viên kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý phân công theo lô/vị trí/lượng; nhân viên chọn công việc được giao và lượng thực ghi, có thể ghi từng phần.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-11.02 Xuất thành phẩm

**Actor chính:** Nhân viên kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn yêu cầu/phiếu đúng nhập hoặc xuất; chỉ đọc/phân công/ghi theo vai trò.
2. Quản lý phân công theo lô/vị trí/lượng; nhân viên chọn công việc được giao và lượng thực ghi, có thể ghi từng phần.
3. Kiểm QC, hạn dùng, nguồn, giữ chỗ và khóa kiểm kê; xuất bán phải hoàn tất SX/đến ngày giao.
4. Ghi PhieuKho/ChiTietPhieuKho, TonKho/BienDongKho và trạng thái trong transaction. Gửi lại cùng key/payload trả phiếu cũ; lỗi rollback.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-35 Báo cáo thành phẩm

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng lập báo cáo thành phẩm cho từng phần hoàn thành của KHSX, nhập lượng thực tế phần mới, ngày và NVL đã dùng (nếu có).
2. Báo cáo tạo một phần gồm các dòng sản phẩm riêng trong cùng lô tổng của KHSX. Gửi báo cáo để giám đốc chọn phần này khi lập Công việc kiểm tra thành phẩm; QC rồi nhập riêng phần đạt.
3. Nhiều báo cáo phần được phép; không nhập lại tổng tích lũy. Báo cáo phần thường giữ KHSX IN_PROGRESS; chỉ phần cuối có xác nhận hoàn tất mới chuyển COMPLETED. Không tự tạo phiếu/tồn khi chỉ báo cáo. Báo cáo tiến độ UC-34 không tạo phần lô.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-01 Đăng nhập

**Actor chính:** Người dùng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Nhập tài khoản/mật khẩu và CSRF hợp lệ.
2. Identity xác thực, kiểm giới hạn đăng nhập; gateway tạo/đổi session và lấy vai trò/phạm vi.
3. Hiển thị dashboard/menu đúng quyền; không trả hash mật khẩu.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-12 Quản lý kết quả kiểm tra QC/AC

**Actor chính:** Bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. QC truy cập kết quả thuộc quyền/phân công.
2. Xem kết quả, nguồn lô, trạng thái và lịch sử bù/tái kiểm.
3. Phần lỗi không vào AVAILABLE; bù hàng đã nhập: giám đốc duyệt, QC xác nhận, quản lý áp dụng. Chi tiết WAREHOUSE_EXCEPTION_WORKFLOWS.md.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-12.1 Thêm kết quả kiểm tra QC/AC

**Actor chính:** Bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. QC truy cập kết quả thuộc quyền/phân công.
2. Chọn lịch QC đã bắt đầu, kiểm toàn bộ dòng lô: kiểm=đạt+lỗi; ghi lỗi và kết luận.
3. Phần lỗi không vào AVAILABLE; bù hàng đã nhập: giám đốc duyệt, QC xác nhận, quản lý áp dụng. Chi tiết WAREHOUSE_EXCEPTION_WORKFLOWS.md.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-12.2 Sửa kết quả kiểm tra QC/AC

**Actor chính:** Bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. QC truy cập kết quả thuộc quyền/phân công.
2. Kết quả chưa dùng sửa theo version; khi đã có nhập/phân bổ/trả, dùng ngoại lệ và chứng từ bù thay vì ghi đè.
3. Phần lỗi không vào AVAILABLE; bù hàng đã nhập: giám đốc duyệt, QC xác nhận, quản lý áp dụng. Chi tiết WAREHOUSE_EXCEPTION_WORKFLOWS.md.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-12.3 Xóa kết quả kiểm tra QC/AC

**Actor chính:** Bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. QC truy cập kết quả thuộc quyền/phân công.
2. Hủy kết quả chỉ khi chưa dùng và trạng thái cho phép; không xóa dấu vết chứng từ.
3. Phần lỗi không vào AVAILABLE; bù hàng đã nhập: giám đốc duyệt, QC xác nhận, quản lý áp dụng. Chi tiết WAREHOUSE_EXCEPTION_WORKFLOWS.md.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-34 Lập phiếu báo cáo sản xuất

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX chưa hoàn tất của xưởng và TIEN_DO/SU_CO/NHU_CAU.
2. Tiến độ/sự cố nhập mô tả, tiến độ tùy chọn; không bắt dòng NVL. NHU_CAU lấy dự kiến và sửa lượng cần, tồn/thiếu tính hệ thống.
3. Lưu nháp hoặc gửi; BGĐ luôn nhận. Cập nhật 22/10: NHU_CAU còn thiếu tự gửi thêm planner khi gửi; tiến độ/sự cố thêm planner tùy chọn. Có thể dán ảnh/chụp bảng đối chiếu vào mô tả. Một nguồn NHU_CAU hiệu lực/KHSX; không dùng tiến độ/sự cố làm nguồn mua/cấp. Luồng công thức, đối chiếu từ UC-22 và nguồn đơn của UC-04: [LUONG_DAT_HANG_TIEN_SAN_XUAT.md](LUONG_DAT_HANG_TIEN_SAN_XUAT.md).

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-15 Thực hiện kiểm kê

**Actor chính:** Ban kiểm kê

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Ban kiểm kê vào Quản lý kiểm kê → Tạo mới, chọn công việc được giao đã bắt đầu; hệ thống hiện toàn bộ dòng lô/phần lô của công việc.
2. Nhập mọi dòng chưa ghi và xác nhận một lần, null khác số 0; lưu nguyên tử theo version, không chấp nhận thiếu/trùng/dòng ngoài phạm vi.
3. Đợt kiểm tra lô hoàn tất khi đủ số đếm và QC theo bộ phận được giao. Không khóa cả kho chỉ vì kiểm tra lô.
4. Không tự sửa tồn từ số đếm. COUNT theo kho lịch sử vẫn giữ snapshot và khóa đến đóng đợt; không thay bằng luồng kiểm tra lô.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-28 Lập biên bản kiểm kê

**Actor chính:** Ban kiểm kê, bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Giám đốc chỉ định một nhân viên trong nhóm được giao khi lập đợt; chỉ người đó được lập/sửa/gửi biên bản chung.
2. Đủ kết quả theo phạm vi thì tổng hợp số đếm, chênh lệch và QC của toàn đợt trong một biên bản, kể cả khi người lập thuộc QC/AC.
3. Nhập kết luận, chọn không có ngoại lệ hoặc mô tả ngoại lệ; lưu nháp rồi gửi. Giám đốc nhận thông báo; bản gửi giữ bất biến.
4. Ngoại lệ xuất hiện tự động cho quản lý xử lý hoặc đề xuất chủ xưởng. Không tự sửa tồn từ biên bản. Kết luận COUNT lịch sử tiếp tục lưu theo kho; chi tiết [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md).

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-32 Phê duyệt kế hoạch mua/bán

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn KHSX hoặc kế hoạch MUA/BAN đúng nghiệp vụ.
2. BGĐ duyệt/từ chối MUA/BAN theo version và kiểm lại nguồn.
3. Nguồn NHU_CAU/THANH_PHAM đã dùng không sửa; nhập/import không tự tạo phiếu kho.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-02 Đặt đơn hàng

**Actor chính:** Khách hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. Chọn thành phẩm mẫu công khai, nhập lượng và thông tin giao; đơn giá/giá trị được kiểm tại server.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-03 Quản lý đơn hàng khách hàng

**Actor chính:** Khách hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. Xem danh sách/chi tiết đơn, trạng thái tiếp nhận/duyệt/giao và các thao tác còn hợp lệ.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-03.1 Sửa đơn hàng khách hàng

**Actor chính:** Khách hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. Sửa trước duyệt; kiểm nguồn kế hoạch phụ thuộc và không ghi đè đơn đã duyệt.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-22 Tra cứu dữ liệu trong kho

**Actor chính:** Quản lý kho, Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chọn bộ lọc trong phạm vi vai trò; chủ xưởng được đọc kho chung và hồ sơ xưởng của mình.
2. Xem hàng/lô/vị trí, bucket, tồn và khả dụng; không lấy lượng cách ly/hết hạn/giữ chỗ thành lượng xuất.
3. Phân trang/xuất CSV trong giới hạn, trạng thái rỗng và không quyền hiển thị rõ; chưa chứng nhận mọi nhánh bộ lọc theo phiếu chấm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-16 Xử lý chênh lệch kiểm kê

**Actor chính:** Quản lý kho

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Mở chênh lệch kiểm kê, dòng QC lỗi hoặc tồn cần cách ly; chọn lượng/vị trí và phương án.
2. Quản lý lập đề xuất; phần lỗi ngoài kho được xử lý nhiều lần trong lượng còn lại.
3. Sau duyệt, QC tái kiểm nếu cần; quản lý áp dụng riêng, ghi biến động/bù QC và trạng thái.
4. Chặn lượng vượt nguồn, giữ chỗ, kho kiểm kê, giải phóng hàng hết hạn; giữ phiếu nhập/giao gốc.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.
