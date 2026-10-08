# Đặc tả use case ứng dụng quản lý kho hàng

Tài liệu chuyển từ báo cáo thực hành Tuần 6 của Warehouse Team, phục vụ xây dựng chương trình theo kiến trúc nguyên khối. Bao gồm toàn bộ 48 đặc tả trong tệp nguồn; không bao gồm sơ đồ sequence, sơ đồ domain, kế hoạch phân công và trang bìa.

Nội dung nghiệp vụ, mã UC, số bước và tham chiếu được giữ theo bản gốc. Các tên lớp trong ngoặc thuộc nội dung đặc tả được giữ để đối chiếu; không phải thiết kế domain bổ sung. Những nhận xét và điểm cần làm rõ được đặt riêng ở cuối tài liệu, chưa tự động áp dụng vào luồng xử lý.

## Danh sách đặc tả

- UC-29 Tiếp nhận đơn hàng
- UC-06 Quản lý danh mục kho
- UC-06.1 Thêm danh mục kho
- UC-06.2 Xóa danh mục kho
- UC-06.3 Sửa danh mục kho
- UC-07 Quản lý dữ liệu danh mục kho
- UC-07.1 Thêm dữ liệu danh mục kho
- UC-07.2 Xóa dữ liệu danh mục kho
- UC-07.3 Sửa dữ liệu danh mục kho
- UC-08 Quản lý nhập kho
- UC-09 Quản lý xuất kho
- UC-13 Lập đợt kiểm kê
- UC-17 Phê duyệt đề xuất xử lý ngoại lệ
- UC-18 Xem danh sách hàng tồn kho
- UC-19 Xem hồ sơ xuất kho
- UC-20 Xem hồ sơ nhập kho
- UC-21 Xem báo cáo kiểm kê
- UC-25 Quản lý công việc
- UC-25.1 Chỉnh sửa công việc
- UC-25.2 Xóa công việc
- UC-31 Phê duyệt đơn hàng
- UC-14 Xem/Quản lý đơn hàng mua
- UC-23 Yêu cầu nhập/xuất
- UC-24 Quản lý yêu cầu nhập xuất
- UC-24.1 Sửa yêu cầu
- UC-24.2 Xóa yêu cầu
- UC-27 Mua hàng
- UC-04 Lập kế hoạch mua/bán
- UC-05 Quản lý kế hoạch
- UC-05.1 Sửa kế hoạch
- UC-05.2 Xóa kế hoạch
- UC-10 Nhập kho
- UC-11 Xuất kho
- UC-35 Báo cáo thành phẩm
- UC-01 Đăng nhập
- UC-12 Quản lý kết quả kiểm tra QC/AC
- UC-12.1 Thêm kết quả kiểm tra QC/AC
- UC-12.2 Sửa kết quả kiểm tra QC/AC
- UC-12.3 Xóa kết quả kiểm tra QC/AC
- UC-34 Lập phiếu báo cáo sản xuất
- UC-15 Thực hiện kiểm kê
- UC-28 Lập biên bản kiểm kê
- UC-32 Phê duyệt kế hoạch mua/bán
- UC-02 Đặt đơn hàng
- UC-03 Quản lý đơn hàng khách hàng
- UC-03.1 Sửa đơn hàng khách hàng
- UC-22 Tra cứu dữ liệu trong kho
- UC-16 Xử lý chênh lệch kiểm kê

## Nội dung đặc tả

### UC-29 Tiếp nhận đơn hàng

**Tiền điều kiện:** Bộ phận lập kế hoạch đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được tiếp nhận và chuyển sang trạng thái đã tiếp nhận, chờ Ban giám đốc phê duyệt (UC-31 Phê duyệt đơn hàng)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem đơn hàng | 2. Hiển thị danh sách các đơn hàng chưa được tiếp nhận (DonHang) |
| 3. Chọn một đơn hàng cần tiếp nhận (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, KhachHang) |
| 5. Chọn Tiếp nhận đơn hàng (DonHang) |  |
|  | 6. Cập nhật trạng thái đơn hàng thành Đã tiếp nhận |
|  | 7. Thông báo tiếp nhận đơn hàng thành công |
|  | 8. Kết thúc use case |

#### Luồng thay thế

Không có nội dung trong bản gốc.


#### Luồng ngoại lệ


**2.1 Nếu không có đơn hàng nào**

- 1. Hệ thống thông báo không có đơn hàng mới (DonHang)
- 2. Kết thúc use case

### UC-06 Quản lý danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập và có quyền quản lý danh mục kho

**Hậu điều kiện:** Danh sách danh mục kho (gồm khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) được hiển thị/chỉnh sửa/xoá theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý danh mục kho | 2. Hiển thị danh sách danh mục hiện có (LoaiHang) |
| 3. Chọn một danh mục để xem chi tiết (LoaiHang) | 4. Hiển thị chi tiết danh mục gồm (Mã danh mục, tên danh mục, mô tả, ngày tạo, ngày chỉnh sửa cuối cùng, số lượng dữ liệu hiện có, số lượng dữ liệu chưa được xuất bản) (LoaiHang, MatHang) |

#### Luồng thay thế


**3.1 Chọn Thêm**

- 1. Hệ thống thực hiện UC-06.1

**4.1 Chọn Xóa**

- 1. Hệ thống thực hiện UC-06.2

**4.2 Chọn Sửa**

- 1. Hệ thống thực hiện UC-06.3

#### Luồng ngoại lệ


**2.1 Không có danh mục nào trong danh sách**

- 1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)
- 2. Kết thúc UC

### UC-06.1 Thêm danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống

**Hậu điều kiện:** Danh mục kho mới được thêm vào hệ thống

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Thêm danh mục (LoaiHang) | 2. Hiển thị form thêm danh mục gồm (Tên danh mục, mô tả) (LoaiHang) |
| 3. Nhập tên danh mục, mô tả và xác nhận (LoaiHang) | 4. Kiểm tra dữ liệu vừa được nhập (LoaiHang) |
|  | 5. Lưu danh mục mới vào hệ thống và thông báo thêm thành công (LoaiHang) |

#### Luồng thay thế


**3.1 Quản lý kho chọn nhập lại**

- 1. Thông tin danh mục đã nhập bị xóa
- 2. Quay lại UC-06 bước 4

#### Luồng ngoại lệ


**4.1 Tên danh mục đã tồn tại**

- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

**4.2 Dữ liệu nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 2. Quay lại bước 2

**4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

**4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

### UC-06.2 Xóa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Danh mục được xóa khỏi danh sách

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Xoá danh mục (LoaiHang) | 2. Hệ thống yêu cầu xác nhận xóa (LoaiHang) |
| 3. Xác nhận xóa | 4. Hệ thống kiểm tra danh mục có đang được sử dụng hay không (LoaiHang, MatHang) |
|  | 5. Hệ thống xóa danh mục khỏi danh sách và thông báo xoá danh mục thành công (LoaiHang) |

#### Luồng thay thế


**3.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Danh mục đang được sử dụng**

- 1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang, MatHang)
- 2. Kết thúc use case

### UC-06.3 Sửa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Thông tin danh mục được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Sửa danh mục (LoaiHang) | 2. Hệ thống hiển thị form với thông tin có thể sửa là tên danh mục và mô tả (LoaiHang) |
| 3. Nhập thông tin muốn chỉnh sửa (LoaiHang) |  |
| 4. Chọn xác nhận | 5. Hệ thống kiểm tra dữ liệu vừa được nhập (LoaiHang) |
|  | 6. Hệ thống lưu thông tin danh mục đã chỉnh sửa và thông báo chỉnh sửa thành công (LoaiHang) |

#### Luồng thay thế


**4.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**5.1 Tên danh mục đã tồn tại**

- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.3 Nếu dữ liệu bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 2. Quay lại bước 3

### UC-07 Quản lý dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập thành công và có quyền quản lý dữ liệu danh mục kho

**Hậu điều kiện:** Danh sách dữ liệu gồm (khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) trong danh mục được hiển thị/chỉnh sửa/xóa theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý dữ liệu danh mục kho | 2. Hiển thị danh sách danh mục (LoaiHang) |
| 3. Chọn một danh mục để xem chi tiết dữ liệu (LoaiHang, MatHang) | 4. Hiển thị dữ liệu chi tiết (MatHang) |

#### Luồng thay thế


**3.1 Tìm kiếm dữ liệu**

- 1. Quản lý kho tên dữ liệu cần tìm (MatHang)
- 2. Hệ thống hiển thị dữ liệu phù hợp (MatHang)
- 3. Kết thúc UC

**3.2 Chọn Thêm**

- 1. Hệ thống thực hiện UC-07.1

**4.1 Chọn Xóa**

- 1. Hệ thống thực hiện UC-07.2

**4.2 Chọn Sửa**

- 1. Hệ thống thực hiện UC-07.3

#### Luồng ngoại lệ


**2.1 Không có dữ liệu**

- 1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang)
- 2. Quay lại bước 1

### UC-07.1 Thêm dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Dữ liệu mới được thêm vào danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Thêm dữ liệu (MatHang) | 2. Hiển thị form thêm dữ liệu yêu cầu nhập dữ liệu theo các cột tương ứng trong hệ thống ngoại trừ mã, ngày tạo, ngày cập nhật gần nhất (MatHang, LoaiHang) |
| 3. Nhập thông tin và xác nhận (MatHang) | 4. Kiểm tra dữ liệu nhập (MatHang) |
|  | 5. Lưu dữ liệu mới vào hệ thống và thông báo thêm thành công (MatHang) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Tên đã tồn tại**

- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**3.2 Dữ liệu để trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)
- 2. Quay lại bước 3

**3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

### UC-07.2 Xóa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Dữ liệu được xóa khỏi danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Xóa (MatHang) | 2. Hệ thống kiểm tra dữ liệu có còn tồn kho/phát sinh giao dịch hay không (MatHang, TonKho, ChiTietPhieuKho) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (MatHang) |
| 4. Xác nhận xóa | 5. Hệ thống xóa dữ liệu khỏi danh sách (MatHang) |

#### Luồng thay thế


**4.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng**

- 1. Hệ thống thông báo không thể xóa (MatHang)
- 2. Kết thúc use case

### UC-07.3 Sửa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Thông tin dữ liệu được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (MatHang) | 2. Hệ thống mở form nhập cho phép chỉnh sửa các thông tin được phép chỉnh sửa (MatHang) |
| 3. Chỉnh sửa thông tin (tên danh mục, mô tả danh mục) và xác nhận (MatHang, LoaiHang) | 4. Hệ thống kiểm tra thông tin vừa được nhập (MatHang) |
|  | 4. Hệ thống lưu thông tin mới vào hệ thống và thông báo chỉnh sửa thành công (MatHang) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Tên bị trùng**

- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**4.2 Nếu dữ liệu bị nhập sai định dạng**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**4.3 Dữ liệu để trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)
- 2. Quay lại bước 3

### UC-08 Quản lý nhập kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách chi tiết các phiếu nhập kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý nhập kho | 2. Hiển thị danh sách phiếu nhập kho (PhieuKho) |
| 3. Chọn một phiếu nhập kho để xem chi tiết (PhieuKho) | 4. Hiển thị thông tin chi tiết phiếu nhập kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**3.1 Tìm kiếm phiếu nhập kho**

- 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)
- 2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)
- 3. Đi đến bước 3

#### Luồng ngoại lệ


**2.1 Không có phiếu nhập kho**

- 1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho)
- 2. Kết thúc UC

### UC-09 Quản lý xuất kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách phiếu xuất kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý xuất kho | 2. Hiển thị danh sách phiếu xuất kho (PhieuKho) |
| 3. Chọn một phiếu xuất kho để xem chi tiết (PhieuKho) | 4. Hiển thị thông tin chi tiết phiếu xuất kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**3.1 Tìm kiếm phiếu xuất kho**

- 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)
- 2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)
- 3. Đi đến bước 3

#### Luồng ngoại lệ


**2.1 Không có phiếu xuất kho phù hợp**

- 1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho)
- 2. Quay lại bước 1

### UC-13 Lập đợt kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập vào hệ thống

**Hậu điều kiện:** Đợt kiểm kê mới được tạo, lưu vào hệ thống và gửi cho Ban kiểm kê

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập đợt kiểm kê | 2. Hiển thị form lập đợt kiểm kê (CongViec, Kho) |
| 3. Nhập thông tin đợt kiểm kê (thời gian, loại nguyên vật liệu/thành phẩm, chọn danh sách các kho cần kiểm, ngày kiểm kê) (CongViec, KiemKe, Kho, MatHang) | 4. Kiểm tra thông tin đợt kiểm kê (CongViec, KiemKe, Kho) |
| 5. Xác nhận lập đợt kiểm kê | 6. Lưu đợt kiểm kê, gửi cho Ban kiểm kê và thông báo tạo thành công (CongViec, KiemKe) |

#### Luồng thay thế


**5.1 Ban giám đốc chọn nhập lại**

- 2. Hệ thống hủy thông tin đã nhập
- 3. Quay lại bước 3

#### Luồng ngoại lệ


**4.1 Thời gian/phạm vi kiểm kê không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (CongViec, KiemKe)
- 2. Quay lại bước 2

### UC-17 Phê duyệt đề xuất xử lý ngoại lệ

**Tiền điều kiện:** Có đề xuất xử lý hàng lỗi hoặc chênh lệch kiểm kê đang chờ phê duyệt

**Hậu điều kiện:** Đề xuất được phê duyệt hoặc từ chối và trạng thái được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt đề xuất xử lý ngoại lệ | 2. Hiển thị danh sách đề xuất đang chờ phê duyệt (DeXuatXuLyNgoaiLe) |
| 3. Chọn một đề xuất để xem chi tiết (DeXuatXuLyNgoaiLe) | 4. Hiển thị thông tin chi tiết đề xuất, loại hàng, số lượng, hàng bị vấn đề gì (DeXuatXuLyNgoaiLe, MatHang, LoaiHang, ChiTietKetQuaKiemTraQCAC, ChiTietKiemKe) |
| 5. Chọn Phê duyệt (PheDuyetXuLyNgoaiLe) | 6. Cập nhật trạng thái đề xuất đã duyệt và áp dụng thay đổi liên quan (DeXuatXuLyNgoaiLe, PheDuyetXuLyNgoaiLe, TonKho) |

#### Luồng thay thế


**5.1 Từ chối đề xuất và có nhập lý do**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (DeXuatXuLyNgoaiLe)
- 2. Hệ thống cập nhật trạng thái đề xuất bị từ chối và thông báo cho người đề xuất (DeXuatXuLyNgoaiLe, PheDuyetXuLyNgoaiLe)
- 3. Quay lại bước 1

**5.2 Từ chối đề xuất nhưng không nhập lý do**

- 1. Ban giám đốc chọn Từ chối nhưng để trống lý do (DeXuatXuLyNgoaiLe)
- 2. Hệ thống thông báo yêu cầu nhập lý do từ chối (PheDuyetXuLyNgoaiLe)
- 3. Quay lại bước 4

#### Luồng ngoại lệ


**2.1 Không có đề xuất nào đang chờ phê duyệt**

- 1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (DeXuatXuLyNgoaiLe)
- 2. Kết thúc use case

**4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo đề xuất không còn hiệu lực (DeXuatXuLyNgoaiLe)
- 2. Quay lại bước 1

### UC-18 Xem danh sách hàng tồn kho

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo tồn kho

**Hậu điều kiện:** Danh sách hàng tồn kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem danh sách hàng tồn kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang) | 4. Tổng hợp và hiển thị danh sách hàng tồn kho tương ứng (TonKho, Kho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (TonKho)
- 2. Hệ thống tạo và tải về file báo cáo (TonKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (TonKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho)
- 2. Quay lại bước 1

### UC-19 Xem hồ sơ xuất kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ xuất kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc/Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem hồ sơ xuất kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) | 4. Tổng hợp và hiển thị hồ sơ xuất kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 1

### UC-20 Xem hồ sơ nhập kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ nhập kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc/Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem hồ sơ nhập kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) | 4. Tổng hợp và hiển thị hồ sơ nhập kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 1

### UC-21 Xem báo cáo kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo kiểm kê

**Hậu điều kiện:** Báo cáo kiểm kê được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem báo cáo kiểm kê | 2. Hiển thị form điều kiện lọc báo cáo (đợt kiểm kê, thời gian, khu vực) (KiemKe, CongViec, Kho) |
| 3. Chọn điều kiện lọc và xác nhận (KiemKe, CongViec, Kho) | 4. Tổng hợp và hiển thị báo cáo kiểm kê tương ứng (bao gồm số liệu chênh lệch) (KiemKe, ChiTietKiemKe, Kho, MatHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (KiemKe, ChiTietKiemKe)
- 2. Hệ thống tạo và tải về file báo cáo (KiemKe, ChiTietKiemKe)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (KiemKe, ChiTietKiemKe)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (KiemKe, ChiTietKiemKe)
- 2. Quay lại bước 1

### UC-25 Quản lý công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền quản lý công việc

**Hậu điều kiện:** Công việc được xem, cập nhật hoặc xoá theo thao tác của Ban giám đốc

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý công việc | 2. Hiển thị danh sách công việc (CongViec) |
| 3. Chọn công việc cụ thể (CongViec) | 4. Hiển thị thông tin chi tiết công việc gồm: tên công việc, mô tả, ngày bắt đầu, ngày kết thúc, độ ưu tiên, trạng thái, nhân viên được phân công (CongViec, NhanVien) |
|  | 5. Kết thúc UC |

#### Luồng thay thế


**4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa**

- 1. Đi đến UC-25.1 Chỉnh sửa công việc

**4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá**

- 1. Đi đến UC-25.2 Xóa công việc

#### Luồng ngoại lệ


**2.1 Nếu danh sách công việc hiện đang trống**

- 1. Hệ thống thông báo không có công việc hiện tại (CongViec)
- 2. Kết thúc use case

### UC-25.1 Chỉnh sửa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần chỉnh sửa

**Hậu điều kiện:** Công việc được cập nhật theo đúng thông tin Ban giám đốc xác nhận

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn Chỉnh sửa công việc (CongViec) | 2. Hiển thị form với thông tin hiện tại của công việc (CongViec, NhanVien) |
| 3. Nhập thông tin muốn chỉnh sửa (CongViec, NhanVien) | 4. Chọn Xác nhận |
|  | 5. Kiểm tra dữ liệu nhập (CongViec) |
|  | 6. Kiểm tra lịch trình nhân viên nếu có bổ sung/thay đổi nhân viên (NhanVien, CongViec) |
|  | 7. Lưu thông tin công việc được cập nhật vào hệ thống và thông báo cập nhật thành công (CongViec, NhanVien) |

#### Luồng thay thế


**4.1 Nếu giám đốc chọn Huỷ**

- 1. Hệ thống hủy thông tin đã chỉnh sửa
- 2. Kết thúc UC

#### Luồng ngoại lệ


**5.1 Nếu giám đốc nhập chữ vào ô nhập số**

- 1. Hệ thống thông báo lỗi định dạng (CongViec)
- 2. Quay lại bước 3

**5.2 Nếu giám đốc nhập số < 0**

- 1. Hệ thống thông báo số phải lớn hơn 0 (CongViec)
- 2. Quay lại bước 3

**5.3 Nếu bỏ trống thông tin bắt buộc**

- 1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec)
- 2. Quay lại bước 3

**5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ**

- 1. Hệ thống thông báo thời gian thực hiện công việc không hợp lệ (CongViec)
- 2. Quay lại bước 3

**6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc**

- 1. Hệ thống thông báo nhân viên đang không trống lịch, yêu cầu chọn nhân viên khác (NhanVien, CongViec)
- 2. Quay lại bước 3

### UC-25.2 Xóa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần xoá

**Hậu điều kiện:** Công việc được xoá khỏi hệ thống khi đáp ứng điều kiện xoá

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn Xóa công việc muốn xoá (CongViec) | 2. Hệ thống yêu cầu xác nhận (CongViec) |
| 3. Chọn Xác nhận | 4. Kiểm tra công việc có đang được thực hiện (CongViec) |
|  | 5. Xóa công việc khỏi hệ thống và thông báo xoá thành công (CongViec) |

#### Luồng thay thế


**3.1 Nếu giám đốc chọn Huỷ**

- 1. Hệ thống hủy thao tác xoá
- 2. Kết thúc UC

#### Luồng ngoại lệ


**4.1 Nếu công việc hiện đang được diễn ra**

- 1. Hệ thống thông báo công việc đang được tiến hành, không thể xoá (CongViec)
- 2. Kết thúc UC

### UC-31 Phê duyệt đơn hàng

**Tiền điều kiện:** Ban giám đốc đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được phê duyệt hoặc từ chối và trạng thái đơn hàng được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt đơn hàng | 2. Hiển thị danh sách đơn hàng đang chờ phê duyệt (DonHang) |
| 3. Chọn một đơn hàng để xem chi tiết (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (sản phẩm, số lượng, thông tin giao hàng) (DonHang, ChiTietDonHang, MatHang) |
| 5. Chọn Phê duyệt (DonHang) | 6. Cập nhật trạng thái đơn hàng thành Đã duyệt và thông báo cho Bộ phận lập kế hoạch (DonHang) |

#### Luồng thay thế


**5.1 Từ chối đơn hàng**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (DonHang)
- 2. Hệ thống cập nhật trạng thái đơn hàng bị từ chối và thông báo cho khách hàng (DonHang, KhachHang)
- 3. Quay lại bước 1

#### Luồng ngoại lệ


**2.1 Danh sách đơn hàng chờ phê duyệt rỗng**

- 1. Hệ thống hiển thị danh sách rỗng / thông báo không có đơn hàng nào cần phê duyệt. (DonHang)
- 2. Kết thúc UC.

**4.1 Đơn hàng không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo đơn hàng không còn hiệu lực để phê duyệt (DonHang)
- 2. Quay lại bước 1

### UC-14 Xem/Quản lý đơn hàng mua

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Hiển thị danh sách đơn mua hàng đã đặt

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận mua hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem/Quản lý đơn hàng mua | 2. Hiển thị danh sách đơn hàng đã đặt (DonMuaHang, NhaCungCap) |

#### Luồng thay thế

Không có nội dung trong bản gốc.


#### Luồng ngoại lệ


**2.1 Không có đơn hàng trong hệ thống**

- 1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonMuaHang)
- 2. Kết thúc UC

### UC-23 Yêu cầu nhập/xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống

**Hậu điều kiện:** Yêu cầu nhập/xuất của chủ xưởng được tạo và gửi đến bộ phận kho xử lý

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Yêu cầu nhập/xuất | 2. Hiển thị form tạo yêu cầu (loại yêu cầu: nhập/xuất) (YeuCauNhapXuat) |
| 3. Yêu cầu nhập/xuất được tạo từ chứng từ mua nguyên vật liệu/chứng từ bán thành phẩm (YeuCauNhapXuat, ChiTietYeuCauNhapXuat, DonMuaHang, KeHoachMuaBan, MatHang) | 4. Kiểm tra thông tin yêu cầu (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
| 5. Gửi yêu cầu (YeuCauNhapXuat) | 6. Lưu yêu cầu với trạng thái “Chờ duyệt ”và gửi thông báo đến bộ phận kho (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**3.1 Hủy yêu cầu trước khi gửi**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không tìm thấy chứng từ mua nguyên vật liệu/bán thành phẩm để tạo yêu cầu**

- 1. Hệ thống thông báo không có chứng từ hợp lệ để lập yêu cầu nhập xuất. (DonMuaHang, KeHoachMuaBan)
- 2. Kết thúc UC.

**4.1 Thiếu thông tin bắt buộc**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin (YeuCauNhapXuat, ChiTietYeuCauNhapXuat)
- 2. Quay lại bước 2

### UC-24 Quản lý yêu cầu nhập xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập; đã có yêu cầu được gửi (UC-23)

**Hậu điều kiện:** Danh sách yêu cầu của chủ xưởng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý yêu cầu | 2. Hiển thị danh sách yêu cầu đã gửi của chủ xưởng (YeuCauNhapXuat) |
| 3. Chọn một yêu cầu để xem chi tiết (YeuCauNhapXuat) | 4. Hiển thị thông tin và trạng thái xử lý yêu cầu (YeuCauNhapXuat, ChiTietYeuCauNhapXuat, MatHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian**

- 1. Chủ xưởng nhập điều kiện tìm kiếm (YeuCauNhapXuat)
- 2. Hệ thống hiển thị yêu cầu phù hợp (YeuCauNhapXuat)
- 3. Quay lại bước 1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-24.1

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-24.2

#### Luồng ngoại lệ


**1.1 Tìm kiếm/lọc không có 1 t quả phù hợp**

- 1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (YeuCauNhapXuat)
- 2. Quay lại bước 1

**2.1 Không có yêu cầu trong hệ thống**

- 1. Hệ thống thông báo không tìm thấy yêu cầu (YeuCauNhapXuat)
- 2. Quay lại bước 1

### UC-24.1 Sửa yêu cầu

**Tiền điều kiện:** Chủ xưởng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin yêu cầu được cập nhật chính xác

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) | 2. Kiểm tra yêu cầu chưa được xử lý (YeuCauNhapXuat) |
|  | 3. Hiển thị form với thông tin hiện tại (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
| 4. Chỉnh sửa thông tin muốn thay đổi (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |  |
| 5. Chọn xác nhận | 6. Hệ thống kiểm tra thông tin nhập (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
|  | 7. Hệ thống cập nhật thông tin sau khi chỉnh sửa (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**5.1 Hủy trước khi xác nhận**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Yêu cầu đã được xử lý**

- 1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (YeuCauNhapXuat)
- 2. Kết thúc use case

**6.1 Thông tin không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (YeuCauNhapXuat, ChiTietYeuCauNhapXuat)
- 2. Quay lại bước 3

### UC-24.2 Xóa yêu cầu

**Tiền điều kiện:** Yêu cầu đang ở trạng thái Chờ xử lý

**Hậu điều kiện:** Yêu cầu bị xóa/hủy khỏi danh sách

**Actor chính:** Chủ xưởng

**Actor phụ:** Bộ phận


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn một yêu cầu và chọn Xóa (YeuCauNhapXuat) | 2. Hệ thống yêu cầu xác nhận xóa (YeuCauNhapXuat) |
| 3. Xác nhận xóa | 4. Hệ thống hủy yêu cầu và thông báo đến bộ phận kho (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận xóa**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Yêu cầu đã được xử lý**

- 1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (YeuCauNhapXuat)
- 2. Kết thúc use case

### UC-27 Mua hàng

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống và kế hoạch mua hàng đã được duyệt

**Hậu điều kiện:** Đơn hàng mua (nguyên vật liệu) mới được tạo và đang trong trạng thái "Chờ xử lý"

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận mua hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Mua hàng | 2. Hiển thị danh sách kế hoạch mua cần xử lý (KeHoachMuaBan) |
| 3. Chọn một kế hoạch mua để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị chi tiết kế hoạch (mặt hàng, số lượng, thời gian) (KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang) |
| 5. Nhập thông tin nhà cung cấp, giá, điều kiện giao hàng (DonMuaHang, ChiTietDonMuaHang, NhaCungCap) | 6. Kiểm tra thông tin đơn hàng mua (DonMuaHang, ChiTietDonMuaHang) |
| 7. Xác nhận mua hàng | 8. Tạo đơn hàng mua với trạng thái "Chờ xử lý" và cập nhật trạng thái kế hoạch (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan) |

#### Luồng thay thế


**7.1 Hủy trước khi xác nhận**

- 1. Bộ phận mua hàng chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không có kế hoạch mua hàng nào đang chờ xử lý**

- 1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan)
- 2. Kết thúc UC.

**6.1 Thông tin đơn hàng mua không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)
- 2. Quay lại bước 5

### UC-04 Lập kế hoạch mua/bán

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập

**Hậu điều kiện:** Kế hoạch mua/bán mới được tạo, lưu vào hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-32 Phê duyệt kế hoạch mua/bán)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập kế hoạch mua/bán | 2. Hiển thị form lập kế hoạch (KeHoachMuaBan) |
| 3. Chọn loại kế hoạch mua nguyên vật liệu (KeHoachMuaBan) |  |
| 4. Chọn các thông tin cho kế hoạch mua nguyên vật liệu gồm: nhà cung cấp, nhập ghi chú, loại nguyên vật liệu, nhập số lượng (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, MatHang, LoaiHang) | 5. Kiểm tra thông tin nhập (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 6. Tính tổng tiền dựa trên đơn giá * số lượng (ChiTietKeHoachMuaBan, MatHang) |
| 7. Chọn Xác nhận | 8. Hệ thống lưu kế hoạch mua nguyên vật liệu, chuyển kế hoạch sang trạng thái chờ Ban giám đốc phê duyệt và thông báo lập kế hoạch thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**3.1 Chọn kế hoạch bán hàng**

- 1. Bộ phận lập kế hoạch chọn các thông tin cho kế hoạch bán hàng gồm: khách hàng, nhập ghi chú, loại thành phẩm, nhập số lượng; hệ thống kiểm tra số lượng tồn kho khả dụng của thành phẩm được chọn và cảnh báo nếu không đủ (KeHoachMuaBan, ChiTietKeHoachMuaBan, KhachHang, MatHang, TonKho)
- 2. Đi đến bước 5

#### Luồng ngoại lệ


**5.1 Nếu thông tin nhập là số và < 0**

- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 4

**5.2 Nếu thông tin nhập là số mà người dùng nhập chữ**

- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 4

### UC-05 Quản lý kế hoạch

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập và có quyền quản lý kế hoạch

**Hậu điều kiện:** Danh sách kế hoạch mua/bán được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý kế hoạch | 2. Hiển thị danh sách kế hoạch hiện có (KeHoachMuaBan) |
| 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị chi tiết kế hoạch (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, MatHang) |

#### Luồng thay thế


**3.1 Tìm kiếm/lọc kế hoạch**

- 1. Nhân viên nhập điều kiện tìm kiếm (loại kế hoạch, thời gian, trạng thái) (KeHoachMuaBan)
- 2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan)
- 3. Quay lại bước 1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-05.1

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-05.2

#### Luồng ngoại lệ


**2.1 Không có kế hoạch nào**

- 1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan)
- 2. Quay lại bước 1

### UC-05.1 Sửa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Thông tin kế hoạch được cập nhật chính xác

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (KeHoachMuaBan, ChiTietKeHoachMuaBan) | 2. Hiển thị form với thông tin kế hoạch hiện tại (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
| 3. Nhập thông tin cần chỉnh sửa và xác nhận (KeHoachMuaBan, ChiTietKeHoachMuaBan) | 4. Kiểm tra thông tin đã nhập (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 5. Lưu cập nhật vào hệ thống (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 6. Thông báo kế hoạch đã được cập nhật (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**1.1 Hủy trước khi xác nhận**

- 1. Nhân viên chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập, quay lại UC-05 bước 4

#### Luồng ngoại lệ


**4.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 3

### UC-05.2 Xóa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Kế hoạch được xóa khỏi danh sách

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn Xóa (KeHoachMuaBan) | 2. Hệ thống kiểm tra kế hoạch được chọn chưa được duyệt/thực hiện (KeHoachMuaBan) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (KeHoachMuaBan) |
| 4. Xác nhận xóa | 5. Hệ thống xóa kế hoạch khỏi danh sách và thông báo thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**4.1 Hủy thao tác xóa**

- 1. Nhân viên chọn Không đồng ý (KeHoachMuaBan)
- 2. Quay lại UC-05 bước 4

#### Luồng ngoại lệ


**2.1 Kế hoạch đã được duyệt/đang thực hiện**

- 1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan)
- 2. Kết thúc use case

### UC-10 Nhập kho

**Tiền điều kiện:** Nhân viên kho đăng nhập thành công vào hệ thống; có lô nguyên vật liệu đã được Bộ phận QC/AC kiểm tra chất lượng đạt yêu cầu, đang chờ nhập kho

**Hậu điều kiện:** Hàng hóa được cập nhật vào tồn kho, phiếu nhập kho được tạo

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


#### Luồng cơ bản

| Nhân viên kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Nhập kho | 2. Hiển thị danh sách lô nguyên vật liệu đã được kiểm tra chất lượng đạt, đang chờ nhập kho (LoNguyenVatLieu, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| 3. Chọn lô nguyên vật liệu và nhập thông tin thực nhập (vị trí lưu kho, ngày nhập); số lượng thực nhập mặc định theo số lượng đạt đã được Bộ phận QC/AC ghi nhận (ví dụ: 95) (LoNguyenVatLieu, Kho, ChiTietPhieuKho, ChiTietKetQuaKiemTraQCAC) | 4. Kiểm tra thông tin thực nhập (ChiTietPhieuKho, Kho) |
| 5. Xác nhận nhập kho | 6. Cập nhật tồn kho và tạo phiếu nhập kho (TonKho, PhieuKho, ChiTietPhieuKho) |

#### Luồng thay thế


**4.1 Số lượng thực nhập khác với kế hoạch**

- 1. Hệ thống ghi nhận chênh lệch giữa số lượng thực nhập và kế hoạch (ChiTietPhieuKho, ChiTietYeuCauNhapXuat)
- 2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)
- 3. Quay lại bước 3

#### Luồng ngoại lệ


**4.1 Thông tin nhập kho không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)
- 2. Quay lại bước 2

### UC-11 Xuất kho

**Tiền điều kiện:** Nhân viên kho đăng nhập thành công vào hệ thống; kế hoạch xuất hàng liên quan đã được Ban giám đốc phê duyệt (UC-32 Phê duyệt kế hoạch mua/bán) và thành phẩm đã đạt kiểm tra chất lượng

**Hậu điều kiện:** Thành phẩm trong kho được cập nhật lại số lượng

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


#### Luồng cơ bản

| Nhân viên kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xuất kho | 2. Hiển thị danh sách yêu cầu/kế hoạch chờ xuất kho (YeuCauNhapXuat, KeHoachMuaBan) |
| 3. Chọn yêu cầu và nhập thông tin thực xuất (số lượng, thành phẩm, ngày xuất) (YeuCauNhapXuat, ChiTietPhieuKho, MatHang, LoThanhPham) | 4. Kiểm tra số lượng tồn kho khả dụng (TonKho, LoThanhPham) |
| 5. Xác nhận xuất kho | 6. Cập nhật tồn kho và tạo phiếu xuất kho (TonKho, PhieuKho, ChiTietPhieuKho) |

#### Luồng thay thế


**4.1 Số lượng thực xuất khác với kế hoạch**

- 1. Hệ thống ghi nhận chênh lệch giữa số lượng thực xuất và kế hoạch (ChiTietPhieuKho, ChiTietYeuCauNhapXuat)
- 2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)
- 3. Đi đến bước 5

#### Luồng ngoại lệ


**4.1 Thông tin xuất kho không hợp lệ hoặc số lượng tồn kho không đủ khả dụng (kể cả do vừa được xuất bởi yêu cầu khác)**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)
- 2. Quay lại bước 2

### UC-35 Báo cáo thành phẩm

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống và lô thành phẩm đã hoàn thành sản xuất

**Hậu điều kiện:** Báo cáo thành phẩm được lưu và gửi cho Ban giám đốc

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Báo cáo thành phẩm | 2. Hiển thị form báo cáo thành phẩm |
| 3. Nhập số lượng thành phẩm, lượng nguyên vật liệu đã sử dụng, ngày hoàn thành, hạn sử dụng và ghi chú | 4. Kiểm tra thông tin báo cáo thành phẩm |
| 5. Xác nhận gửi báo cáo | 6. Lưu báo cáo thành phẩm và gửi cho Ban giám đốc |

#### Luồng thay thế


**5.1 Hủy trước khi xác nhận gửi báo cáo**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin báo cáo đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ**

- 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại
- 2. Quay lại bước 3

### UC-01 Đăng nhập

**Tiền điều kiện:** Người dùng đã được cấp tài khoản trong hệ thống

**Hậu điều kiện:** Người dùng đăng nhập thành công và truy cập được các chức năng theo quyền hạn được cấp

**Actor chính:** Người dùng

**Actor phụ:** Không


#### Luồng cơ bản

| Người dùng | Hệ thống |
| --- | --- |
| 1. Truy cập màn hình đăng nhập | 2. Hiển thị form đăng nhập gồm tên đăng nhập và mật khẩu (NguoiDung) |
| 3. Nhập tên đăng nhập, mật khẩu và chọn Đăng nhập (NguoiDung) | 4. Kiểm tra thông tin đăng nhập (NguoiDung) |
| 5. Xem kết quả đăng nhập | 6. Hiển thị màn hình chính theo quyền của người dùng (NguoiDung, VaiTro) |

#### Luồng thay thế


**3.1 Sai tên đăng nhập hoặc mật khẩu**

- 1. Hệ thống thông báo tên đăng nhập hoặc mật khẩu không đúng (NguoiDung)
- 2. Quay lại bước 2

**3.2 Bỏ trống thông tin đăng nhập**

- 1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)
- 2. Quay lại bước 2

#### Luồng ngoại lệ


**4.1 Tài khoản bị khóa**

- 1. Hệ thống thông báo tài khoản đã bị khóa, hướng dẫn liên hệ quản trị viên (NguoiDung)
- 2. Kết thúc use case

### UC-12 Quản lý kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập

**Hậu điều kiện:** Danh sách kết quả kiểm tra chất lượng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý kết quả kiểm tra chất lượng | 2. Hiển thị danh sách kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC) |
| 3. Chọn một kết quả để xem chi tiết (KetQuaKiemTraQCAC) | 4. Hiển thị chi tiết kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, MatHang, LoHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho)**

- 1. Nhân viên nhập điều kiện lọc (KetQuaKiemTraQCAC, PhieuKho)
- 2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC)
- 3. Quay lại bước 1

**2.1 Chọn Thêm**

- 1. Hệ thống thực hiện UC-12.1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-12.2

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-12.3

**4.3 Kết quả ghi nhận "không đạt"**

- 1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi

#### Luồng ngoại lệ


**1.1 Không có kết quả phù hợp**

- 1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC)
- 2. Quay lại bước 1

### UC-12.1 Thêm kết quả kiểm tra QC/AC

**Tiền điều kiện:** Có phiếu nhập kho/ mặt hàng cần kiểm tra chất lượng

**Hậu điều kiện:** Kết quả kiểm tra chất lượng mới được lưu vào hệ thống

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn Thêm kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 2. Hiển thị form thêm kết quả kiểm tra (KetQuaKiemTraQCAC, LoHang, MatHang) |
| 3. Nhập thông tin kết quả kiểm tra (đạt/không đạt, ghi chú) và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 4. Kiểm tra, lưu và cập nhật danh sách kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

**3.2 Thông tin nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

### UC-12.2 Sửa kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra chất lượng được cập nhật chính xác

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn một kết quả và chọn Sửa (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 2. Hệ thống hiển thị form với thông tin hiện tại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| 3. Chỉnh sửa thông tin và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 4. Hệ thống kiểm tra và cập nhật kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

**3.2 Thông tin nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

### UC-12.3 Xóa kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra bị xóa khỏi danh sách

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn một kết quả và chọn Xóa (KetQuaKiemTraQCAC) | 2. Hệ thống kiểm tra kết quả đã được sử dụng làm căn cứ xử lý hay chưa (KetQuaKiemTraQCAC, DeXuatXuLyNgoaiLe) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (KetQuaKiemTraQCAC) |
| 4. Xác nhận xóa | 5. Hệ thống xóa kết quả khỏi danh sách (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**4.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi**

- 1. Hệ thống thông báo không thể xóa (KetQuaKiemTraQCAC)
- 2. Kết thúc use case

### UC-34 Lập phiếu báo cáo sản xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống và có kế hoạch sản xuất cần báo cáo

**Hậu điều kiện:** Phiếu báo cáo sản xuất được lưu và gửi cho Bộ phận lập kế hoạch

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập phiếu báo cáo sản xuất | 2. Hiển thị form lập phiếu báo cáo sản xuất |
| 3. Nhập số lượng tồn kho, số lượng cần thiết và ghi chú yêu cầu nhập nguyên vật liệu | 4. Kiểm tra thông tin phiếu báo cáo sản xuất |
| 5. Xác nhận gửi phiếu | 6. Lưu phiếu báo cáo sản xuất và gửi cho Bộ phận lập kế hoạch |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận gửi phiếu**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin phiếu đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Thông tin phiếu báo cáo sản xuất chưa đầy đủ hoặc không hợp lệ**

- 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại
- 2. Quay lại bước 3

### UC-15 Thực hiện kiểm kê

**Tiền điều kiện:** Ban kiểm kê đã được phân công cho đợt kiểm kê

**Hậu điều kiện:** Số lượng thực tế của hàng hóa được ghi nhận cho đợt kiểm kê

**Actor chính:** Ban kiểm kê

**Actor phụ:** Không


#### Luồng cơ bản

| Ban kiểm kê | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Thực hiện kiểm kê | 2. Hiển thị danh sách mặt hàng cần kiểm kê thuộc khu vực được phân công (CongViec, KiemKe, ChiTietKiemKe, MatHang, Kho) |
| 3. Nhập số lượng thực tế đếm được cho từng mặt hàng (KiemKe, ChiTietKiemKe) | 4. Ghi nhận số liệu kiểm kê (KiemKe, ChiTietKiemKe) |
| 5. Xác nhận hoàn thành kiểm kê khu vực (KiemKe) | 6. Cập nhật trạng thái hoàn thành và lưu kết quả kiểm kê (KiemKe, ChiTietKiemKe) |

#### Luồng thay thế


**2.1 Tạm dừng kiểm kê**

- 1. Nhân viên chọn Lưu tạm để tiếp tục sau (KiemKe, ChiTietKiemKe)
- 2. Hệ thống lưu tạm số liệu đã nhập (KiemKe, ChiTietKiemKe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Mất kết nối trong khi nhập số liệu**

- 1. Hệ thống thông báo lỗi kết nối và giữ lại số liệu đã nhập cục bộ (KiemKe, ChiTietKiemKe)
- 2. Nhân viên thử lại khi có kết nối (KiemKe, ChiTietKiemKe)
- 3. Quay lại bước 2

### UC-28 Lập biên bản kiểm kê

**Tiền điều kiện:** Đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Biên bản kiểm kê được lập và gửi cho Ban giám đốc

**Actor chính:** Ban kiểm kê

**Actor phụ:** Không


#### Luồng cơ bản

| Ban kiểm kê | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập biên bản kiểm kê | 2. Hiển thị số liệu tổng hợp của đợt kiểm kê (số liệu thực tế, số liệu hệ thống, chênh lệch) (KiemKe, ChiTietKiemKe) |
| 3. Nhập nội dung biên bản (nhận xét, xác nhận) và xác nhận lập biên bản (KiemKe) | 4. Tạo biên bản kiểm kê và gửi cho Ban giám đốc (KiemKe) |

#### Luồng thay thế


**3.1 Lưu tạm biên bản**

- 1. Nhân viên chọn Lưu tạm (KiemKe)
- 2. Hệ thống lưu tạm nội dung đã nhập (KiemKe, ChiTietKiemKe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Đợt kiểm kê chưa hoàn thành**

- 1. Hệ thống thông báo còn khu vực chưa kiểm kê xong, chưa thể lập biên bản (KiemKe, ChiTietKiemKe)
- 2. Kết thúc use case

### UC-32 Phê duyệt kế hoạch mua/bán

**Tiền điều kiện:** Ban giám đốc đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Kế hoạch được phê duyệt hoặc từ chối và trạng thái kế hoạch được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt kế hoạch mua/bán | 2. Hiển thị danh sách kế hoạch đang chờ phê duyệt (KeHoachMuaBan) |
| 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị thông tin chi tiết kế hoạch (loại kế hoạch, nhà cung cấp/khách hàng, số lượng, tổng tiền) (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, KhachHang) |
| 5. Chọn Phê duyệt (KeHoachMuaBan) | 6. Cập nhật trạng thái kế hoạch thành Đã duyệt để chuyển sang thực hiện Mua hàng/Nhập kho hoặc Xuất kho (KeHoachMuaBan) |

#### Luồng thay thế


**5.1 Từ chối kế hoạch và có nhập lý do**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (KeHoachMuaBan)
- 2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (KeHoachMuaBan)
- 3. Kết thúc UC

**5.2 Từ chối kế hoạch và không nhập lý do**

- 1. Ban giám đốc chọn Từ chối và không nhập lý do (KeHoachMuaBan)
- 2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KeHoachMuaBan)
- 3. Quay lại bước 4

#### Luồng ngoại lệ


**4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống**

- 1. Hệ thống thông báo không có kế hoạch đang chờ phê duyệt (KeHoachMuaBan)
- 2. Kết thúc UC

**4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo kế hoạch không còn hiệu lực để phê duyệt (KeHoachMuaBan)
- 2. Quay lại bước 1

### UC-02 Đặt đơn hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập hệ thống

**Hậu điều kiện:** Đơn hàng mới được tạo và lưu vào hệ thống với trạng thái chờ xử lý

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Đặt đơn hàng | 2. Hiển thị danh sách hàng mẫu để lựa chọn (MatHang, LoaiHang) |
| 3. Chọn sản phẩm, nhập số lượng, thông tin giao hàng gồm: địa chỉ, ngày nhận hàng trễ nhất, ghi chú (MatHang, ChiTietDonHang, DonHang, KhachHang) |  |
| 4. Xác nhận đặt hàng | 5. Kiểm tra thông tin đơn hàng (DonHang, ChiTietDonHang) |
|  | 6. Lưu đơn hàng và thông báo đặt hàng thành công (DonHang, ChiTietDonHang, KhachHang) |

#### Luồng thay thế


**4.1 Khách hàng chọn Quay lại**

- 1. Quay lại bước 2

#### Luồng ngoại lệ


**2.1 Danh sách hàng mẫu không có**

- 1. Hệ thống thông báo danh sách hàng mẫu đang rỗng (MatHang)
- 2. Kết thúc UC

**5.1 Thông tin đơn hàng không hợp lệ**

- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

**5.2 Thông tin ngày nhận là ngày trong quá khứ**

- 1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

### UC-03 Quản lý đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Danh sách đơn hàng của khách hàng được hiển thị đúng thông tin và có thể thực hiện các chức năng mở rộng

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý đơn hàng | 2. Hiển thị danh sách đơn hàng hiện có của khách hàng (DonHang, KhachHang) |
| 3. Chọn một đơn hàng để xem chi tiết (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian**

- 1. Khách hàng nhập điều kiện tìm kiếm (DonHang)
- 2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang)
- 3. Quay lại bước 1

**4.1 Chọn Sửa đơn hàng**

- 1. Hệ thống thực hiện UC-03.1 Sửa đơn hàng khách hàng

#### Luồng ngoại lệ


**2.1 Không có đơn hàng nào trong hệ thống**

- 1. Hệ thống thông báo không có đơn hàng nào (DonHang)
- 2. Kết thúc UC

### UC-03.1 Sửa đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin đơn hàng khách hàng được cập nhật chính xác trong hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-31 Phê duyệt đơn hàng)

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn Sửa đơn hàng (DonHang) | 2. Hiển thị form với thông tin hiện tại của đơn hàng (DonHang, ChiTietDonHang) |
| 3. Nhập thông tin muốn chỉnh sửa (số lượng, mô tả) (DonHang, ChiTietDonHang) |  |
| 4. Chọn xác nhận | 5. Kiểm tra thông tin mới (DonHang, ChiTietDonHang) |
|  | 6. Cập nhật đơn hàng lên hệ thống với trạng thái chờ phê duyệt (DonHang, ChiTietDonHang) |
|  | 7. Thông báo đơn hàng đã được cập nhật và cần chờ phê duyệt (DonHang, ChiTietDonHang) |

#### Luồng thay thế


**2.1 Khách hàng chọn Quay lại**

- 1. Đi đến bước 4 của UC-03 (hủy thao tác sửa)

**5.1 Nếu khách hàng tăng số lượng đơn hàng**

- 1. Hệ thống thông báo thời gian nhận hàng dự kiến có thể tăng tùy theo quy mô đơn hàng (DonHang)
- 2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)
- 3. Đi đến bước 6

**5.2 Nếu khách hàng giảm số lượng đơn hàng**

- 1. Hệ thống thông báo việc giảm số lượng đơn hàng có thể phải chịu đền bù đặt cọc dựa vào hợp đồng (DonHang, ChiTietDonHang)
- 2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)
- 3. Đi đến bước 6

#### Luồng ngoại lệ


**1.1 Đơn hàng không ở trạng thái cho phép sửa**

- 1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang)
- 2. Kết thúc use case

**5.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

### UC-22 Tra cứu dữ liệu trong kho

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Người dùng xem được thông tin danh mục/dữ liệu phù hợp với nhu cầu tra cứu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Tra cứu dữ liệu | 2. Hiển thị danh sách danh mục hàng hóa (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |
| 3. Nhập tên (kho, danh mục, nguyên vật liệu, thành phẩm, tồn kho, lô nguyên vật liệu, lô thành phẩm) để tìm kiếm (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) | 4. Hiển thị các danh mục/dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |
| 5. Chọn một mục để xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) | 6. Hiển thị thông tin chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |

#### Luồng thay thế


**5.1 Chỉ xem danh sách, không xem chi tiết**

- 1. Quản lý kho chỉ xem danh sách phù hợp mà không chọn xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)
- 2. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Không tìm thấy dữ liệu phù hợp**

- 1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)
- 2. Quay lại bước 3

### UC-16 Xử lý chênh lệch kiểm kê

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống và đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Chênh lệch kiểm kê được ghi nhận nguyên nhân và phương án xử lý

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xử lý chênh lệch kiểm kê | 2. Hiển thị danh sách mặt hàng có chênh lệch sau kiểm kê (ChiTietKiemKe, MatHang) |
| 3. Chọn mặt hàng (ChiTietKiemKe, MatHang) | 4. Hiển thị thông tin chi tiết mặt hàng gồm: loại hàng, số lượng, bị vấn đề gì (ChiTietKiemKe, MatHang, LoaiHang, LoHang) |
| 5. Nhập đề xuất xử lý (KiemKe, ChiTietKiemKe) |  |
| 4. Xác nhận xử lý chênh lệch (ChiTietKiemKe) | 6. Cập nhật tồn kho theo phương án xử lý và lưu kết quả (TonKho, ChiTietKiemKe) |

#### Luồng thay thế


**4.1 Chênh lệch vượt hạn mức xử lý**

- 1. Nếu quản lý cảm thấy mức độ chênh lệch và độ nghiêm trọng cao có thể gửi đề xuất xử lý cho Ban giám đốc (DeXuatXuLyNgoaiLe)
- 2. Hệ thống chuyển đề xuất xử lý sang chờ phê duyệt (DeXuatXuLyNgoaiLe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không có chênh lệch cần xử lý**

- 1. Hệ thống thông báo không có mặt hàng chênh lệch (KiemKe, ChiTietKiemKe)
- 2. Kết thúc use case

## Nhận xét trong tài liệu nguồn

Các trích dẫn dưới đây giữ nguyên nội dung nhận xét và phản hồi trong Word. Nhận xét chỉ liên quan độ rõ của hình đã được bỏ vì tài liệu này không chứa hình.

### UC-28 — nhận xét

> Nên gộp UC này với UC Thực hiện kiểm kê

### UC-02 — nhận xét tại hình

> Có Entity hàng mẫu ko? Thông tin chi tiết đơn hàng được nhập vào và ghi nhận ở những message nào??

### UC-25 và các UC con — nhận xét

> 3 UC liên quan công việc nhằm mục đích gì? Có thể bỏ?

### UC-25 và các UC con — phản hồi

> giả sử UC-13 Lập đợt kiểm kê sắp. Tuy nhiên, nhân viên được phân công gặp khó khăn hoặc trục trặc dẫn đến có thể chậm tiến độ. Lúc này ban giám đốc có thể quản lý đợt kiểm kê bằng cách điều phối thêm nhân viên hỗ trợ,.... Ở UC xóa công việc, giả sử bên nhà cung cấp nguyên vật liệu gặp khó khăn phải tạm hoãn và chấp nhận đền bù hợp đồng. Lúc này ban giám đốc có thể xóa công việc đã phân công cho nhân viên trước đó, sau đó đặt lô NVL mới

### UC-29 — nhận xét

> UC này để làm gì? Có thể bỏ?

### UC-29 — phản hồi

> khi có nhiều khách hàng đặt hàng thì đơn hàng sẽ được quản lý bằng cách chia ra trường hợp đã tiếp nhận (tức đã chấp nhận để lên KH sản xuất) và những đơn hàng chưa tiếp nhận (đang xem xét). Nhằm để phân loại và quản lý trong những trường hợp đơn hàng ồ ạt

### UC-11 — nhận xét

> UC này chỉ xuất thành phẩm, UC nào xuất Nguyên liệu? Xuất thành phẩm phải lấy thông tin từ đơn hàng có thể có phiếu yêu cầu sau đó dựa vào thông tin điều phối mới có thể lập phiếu xuất kho, actor ko nhập DL vào phiếu xuất mà lấy DL từ thông tin điều phối theo phiếu yêu cầu. Sau đó cập nhật thông tin tồn kho và trạng thái của các lô hàng

### UC-28 — nhận xét tại hình

> Nên lập biên bản theo từng kho. Khi lập biên bản cần hiển thị ds các kho. Khi actor chọn 1 kho cần hiển thị ds hàng hóa trong kho đó: ds lô hàng của từng hàng hóa(Nguyên liệu/Thành phẩm), sau đó actor chỉ cần nhập vào số lượng thực trong kho của các lô hàng

### UC-23 — nhận xét tại hình

> Phiếu Yêu cầu xuất nguyên liệu dựa vào thông tin trong Kế hoạch sx. Thiếu các Entity cần thiết để lấy thông tin hiển thị trên giao diện: Nguyên liệu/Thành phẩm, kế hoạch sản xuất,...

### UC-20 — nhận xét tại hình

> Có entity Hồ sơ nhập kho ko? Cần xác định các entity cần thiết để lấy thông tin hiển thị trên GD

### UC-20 — phản hồi

> dạ có ạ

## Điểm cần làm rõ trước khi lập trình

Phần này là ghi chú đối chiếu, không thay thế nội dung đặc tả gốc.

- UC-09: luồng tìm kiếm phiếu xuất đang ghi “phiếu nhập kho” ở hai bước; cần thống nhất lại tên nghiệp vụ.
- UC-06.1 và UC-06.3: form chỉ nêu tên và mô tả nhưng có kiểm tra trường số; cần xác định trường nào thực sự có kiểu số.
- UC-07.3: nội dung chỉnh sửa đang nêu tên và mô tả danh mục; cần xác định các trường của từng loại dữ liệu được phép sửa. Luồng cơ bản có hai bước mang số 4.
- UC-06.3 và UC-32 có số nhánh bị trùng; UC-16 có bước xác nhận mang số 4 sau bước 5. Số bước được giữ nguyên để tránh tự thay đổi các tham chiếu.
- UC-10 yêu cầu QC/AC đạt trước khi tạo phiếu nhập, trong khi UC-12.1 nêu tiền điều kiện có phiếu nhập kho hoặc mặt hàng cần kiểm tra. Cần thống nhất chứng từ dùng khi kiểm tra trước nhập.
- UC-11 và UC-23: cần chốt luồng xuất nguyên vật liệu cho sản xuất, bên cạnh xuất thành phẩm; nhận xét giáo viên yêu cầu lấy dữ liệu từ kế hoạch và điều phối.
- UC-15 và UC-28: cần quyết định việc gộp UC và cách ghi nhận số lượng theo kho, mặt hàng và lô theo nhận xét giáo viên.
- UC-16 và UC-17: cần xác định hạn mức được xử lý trực tiếp và trường hợp phải chờ phê duyệt trước khi cập nhật tồn kho; bản gốc chưa quy định hạn mức cụ thể.
- UC-03.1: cần quy định rõ trạng thái cho phép sửa, ảnh hưởng đặt cọc và thời gian giao hàng. Bản gốc chưa quy định công thức đền bù hoặc thời gian điều chỉnh.
- UC-07.1: “các cột tương ứng trong hệ thống” chưa liệt kê đủ trường theo từng loại dữ liệu. Cần đối chiếu mô hình dữ liệu anh đã có trước khi tạo form và quy tắc kiểm tra.
