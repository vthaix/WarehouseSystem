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

1. BGĐ lập COUNT, phạm vi kho/loại hàng, người đếm và người lập kết luận; QUALITY_CHECK là lịch QC riêng.
2. Bắt đầu COUNT khóa kho/chụp snapshot; kho giữ khóa đến đóng đợt.
3. Theo dõi tiến độ từng kho; chỉ đóng khi kết luận/chênh lệch đã xử lý.
4. Chênh lệch chuyển UC-16/17; không tự sửa tồn từ số đếm.

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

## UC-31 Phê duyệt đơn hàng

**Actor chính:** Ban giám đốc

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Truy cập đơn thuộc phạm vi của actor; khách chỉ đọc/sửa đơn của mình.
2. BGĐ xem KHSX liên quan và duyệt/từ chối theo version; duyệt đơn và KHSX cùng transaction.
3. Lưu/đọc kết quả server, giữ lịch sử và phạm vi khách hàng.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-14 Xem/Quản lý đơn hàng mua

**Actor chính:** Bộ phận mua hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Bộ phận mua chọn nguồn PLAN/REPORT/MANUAL hoặc mở đơn mua.
2. Xem nguồn, các dòng mua, lượng nhận/trả và trạng thái đơn.
3. Server kiểm đúng loại báo cáo, hạn mức dùng chung và giá trị tiền; chưa tự mua bù khi trả NCC.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-23 Yêu cầu nhập/xuất

**Actor chính:** Chủ xưởng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Chủ xưởng chọn một trong bốn nhánh: nhập NVL, nhập TP từng phần, xuất NVL sản xuất, xuất TP bán.
2. Nhập NVL lấy phần đạt QC còn lại từ nguồn mua; nhập TP MANUAL theo KHSX và lượng thực mỗi đợt, chung đầu lô/KHSX.
3. Xuất NVL PLAN/REPORT kiểm nhu cầu chung; xuất TP lấy BAN đã duyệt và tổng kết hoàn tất, đúng ngày giao và tồn khả dụng.
4. Lưu yêu cầu sau kiểm lại nguồn; chưa tạo tồn hoặc tự duyệt.
5. Quản lý phân công; nhân viên được giao mới thực hiện phiếu thực nhập/xuất.

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

**Actor chính:** Bộ phận mua hàng

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Bộ phận mua chọn nguồn PLAN/REPORT/MANUAL hoặc mở đơn mua.
2. PLAN từ MUA đã duyệt, một đơn/kế hoạch; REPORT lấy thiếu còn lại, MANUAL không có nguồn giả. Nhập giá/NCC/điều kiện mua.
3. Server kiểm đúng loại báo cáo, hạn mức dùng chung và giá trị tiền; chưa tự mua bù khi trả NCC.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-04 Lập kế hoạch mua/bán

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

1. Chỉ lập tổng kết khi xưởng xác nhận hoàn tất toàn bộ.
2. Lấy lại mọi dòng lô nhập từng phần, giữ lượng/code/ngày thực tế; ghi NVL thực dùng không vượt đã cấp.
3. Lưu nháp/gửi; không tạo lô/phiếu nhập trùng. Gửi tổng kết đánh dấu KHSX COMPLETED, làm nguồn BAN.

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
3. Lưu nháp hoặc gửi; BGĐ luôn nhận, thêm planner tùy chọn. Một nguồn NHU_CAU hiệu lực/KHSX; không dùng tiến độ/sự cố làm nguồn mua/cấp.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-15 Thực hiện kiểm kê

**Actor chính:** Ban kiểm kê

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Người được giao mở các dòng snapshot của kho và nhập số đếm; null khác số 0.
2. Bắt đầu COUNT khóa kho/chụp snapshot; kho giữ khóa đến đóng đợt.
3. Lưu theo version, hoàn tất khi mọi dòng đã đếm.
4. Chênh lệch chuyển UC-16/17; không tự sửa tồn từ số đếm.

**Hậu điều kiện:** đọc trả dữ liệu trong phạm vi; ghi thành công cập nhật version/trạng thái và lịch sử theo service. Hủy form không tạo mutation; hủy chứng từ tuân thủ trạng thái/nguồn.

### Luồng thay thế và ngoại lệ

Danh sách rỗng vẫn trả kết quả hợp lệ. Sai dữ liệu, sai nguồn/quyền, version cũ, trạng thái không hợp lệ, nguồn hết hạn mức hoặc kho khóa phải bị chặn. Không tự đổi nguồn, tạo số liệu giả hoặc retry mutation khi chưa đối soát kết quả. Chi tiết điều kiện tương ứng trong SRS, API và service owner.

## UC-28 Lập biên bản kiểm kê

**Actor chính:** Ban kiểm kê, bộ phận QC/AC

**Tiền điều kiện:** phiên hợp lệ, vai trò/phạm vi được phép, nguồn/chứng từ ở trạng thái có thể thao tác.

### Luồng cơ bản

1. Người đếm hoặc QC được phân công lập kết luận của từng kho đã hoàn tất đếm.
2. Bắt đầu COUNT khóa kho/chụp snapshot; kho giữ khóa đến đóng đợt.
3. Lưu/sửa kết luận nháp, gửi và giữ bất biến; kết luận trên PhieuKiemKe, không tạo biên bản vật lý riêng.
4. Chênh lệch chuyển UC-16/17; không tự sửa tồn từ số đếm.

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
