## Cập nhật nghiệp vụ kho — 14/10/2026

Đã bổ sung xử lý hàng cách ly sau QC: đề xuất, giám đốc duyệt, quản lý giải phóng phần đạt hoặc loại bỏ phần lỗi. Điều chỉnh QC hàng đã nhập đi qua đề xuất cách ly, QC xác nhận và chứng từ bù/biến động tồn; không sửa phiếu nhập/giao cũ hoặc lượng đã giao. Giải phóng hàng điều chỉnh phải tái kiểm đạt. Không tự giao bù/hoàn tiền. Migration service hiện đến 006; chỉ làm nghiệp vụ kho, quản lý nhân viên/bộ phận ngoài phạm vi. Chi tiết API/quyền/quy trình: [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md).
## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

# Đặc tả use case theo bản Word đã chốt

## Cập nhật UC-34/UC-35 theo yêu cầu chủ dự án

UC-34: trong lúc sản xuất, chọn tiến độ/sự cố/thiếu NVL; ghi mô tả và tiến độ tùy chọn, chọn gửi thêm bộ phận lập kế hoạch hoặc chỉ BGĐ. BGĐ luôn nhận khi gửi. Tiến độ/sự cố không có dòng NVL bắt buộc, có thể lập nhiều báo cáo cho cùng kế hoạch chưa hoàn tất. Không dùng báo cáo tiến độ/sự cố làm nguồn mua hay xuất NVL.

UC-35: chỉ khi hoàn tất toàn bộ, chủ xưởng xác nhận hoàn tất rồi lập báo cáo tổng kết thành phẩm thực tế/ngày hoàn tất/NVL sử dụng. Gửi báo cáo chuyển kế hoạch sang hoàn thành; không lập báo cáo đang sản xuất mới. Hai UC lưu cùng bảng, phân biệt SAN_XUAT và THANH_PHAM. Nội dung bên dưới thuộc bản trước cập nhật này khi có mâu thuẫn.

## Bổ sung theo yêu cầu mới: tự điền nguồn liên UC

UC-04 lập kế hoạch SX tự lấy các dòng đơn còn cần sản xuất; UC-34 lấy NVL kế hoạch đã gồm dự phòng vào báo cáo và cho chỉnh theo thực tế. UC-27 có ba cách mua: nhập thủ công, lấy thiếu còn lại từ báo cáo SX, hoặc lấy kế hoạch mua đã duyệt. Vì vậy điều kiện bắt buộc mọi đơn mua có kế hoạch/báo cáo trong bản cũ dưới đây không áp dụng cho đơn MANUAL/REPORT mới.

UC-10: nhận lô lấy phần chưa nhận của đơn mua; yêu cầu nhập lấy phần QC đạt còn lại. UC-23/UC-11.01: lấy NVL từ kế hoạch đã duyệt hoặc báo cáo thực tế, kiểm tổng đã yêu cầu cùng kế hoạch. UC-11.02: chọn báo cáo thành phẩm và kế hoạch bán đã duyệt tương ứng, tự điền lượng còn cần giao đủ điều kiện, hiển thị QC và kiểm kê gần nhất nếu có; vẫn thực hiện phân công/ghi phiếu hiện hữu. Không tự nhập/xuất khi người dùng chỉ chọn nguồn.

Các cập nhật này được chủ dự án yêu cầu trực tiếp; không đổi mã UC hoặc tạo thêm entity nguồn giả.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Giữ 48 UC gốc và hai luồng UC-11.01/UC-11.02 của UC-11. Nội dung dưới được chuyển từ các bảng đặc tả Word, bao gồm tên entity trong ngoặc; sequence vẫn thuộc bản Word. BR-01…BR-12 ở [SRS.md](SRS.md) áp dụng cho các luồng này. Các câu trong Word chưa đủ rõ được đánh dấu trong [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md), không suy đoán đã được duyệt.

## UC-29 Tiếp nhận đơn hàng

**Tiền điều kiện:** Bộ phận lập kế hoạch đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được tiếp nhận và chuyển sang trạng thái đã tiếp nhận, chờ Ban giám đốc phê duyệt (UC-31 Phê duyệt đơn hàng)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận lập kế hoạch

Hệ thống

1. Chọn chức năng Xem đơn hàng

2. Hiển thị danh sách các đơn hàng chưa được tiếp nhận (DonHang)

3. Chọn một đơn hàng cần tiếp nhận (DonHang)

4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, KhachHang)

5. Chọn Tiếp nhận đơn hàng (DonHang)

6. Cập nhật trạng thái đơn hàng thành Đã tiếp nhận, chờ phê duyệt

7. Thông báo tiếp nhận đơn hàng thành công

8. Kết thúc use case


### Luồng thay thế


### Luồng ngoại lệ

2.1 Nếu không có đơn hàng nào

1. Hệ thống thông báo không có đơn hàng mới (DonHang)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-06 Quản lý danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập và có quyền quản lý danh mục kho

**Hậu điều kiện:** Danh sách danh mục kho (gồm khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) được hiển thị/chỉnh sửa/xoá theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Quản lý danh mục kho

2. Hiển thị danh sách danh mục hiện có (LoaiHang)

3. Chọn một danh mục để xem chi tiết (LoaiHang)

4. Hiển thị chi tiết danh mục gồm (Mã danh mục, tên danh mục, mô tả, ngày tạo, ngày chỉnh sửa cuối cùng, số lượng dữ liệu hiện có, số lượng dữ liệu chưa được xuất bản) (LoaiHang, MatHang)


### Luồng thay thế

3.1 Chọn Thêm

1. Hệ thống thực hiện UC-06.1

4.1 Chọn Xóa

1. Hệ thống thực hiện UC-06.2

4.2 Chọn Sửa

1. Hệ thống thực hiện UC-06.3


### Luồng ngoại lệ

2.1 Không có danh mục nào trong danh sách

1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)

2. Kết thúc UC

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-06.1 Thêm danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống

**Hậu điều kiện:** Danh mục kho mới được thêm vào hệ thống

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Thêm danh mục (LoaiHang)

2. Hiển thị form thêm danh mục gồm (Tên danh mục, mô tả) (LoaiHang)

3. Nhập tên danh mục, mô tả và xác nhận (LoaiHang)

4. Kiểm tra dữ liệu vừa được nhập (LoaiHang)

5. Lưu danh mục mới vào hệ thống và thông báo thêm thành công (LoaiHang)


### Luồng thay thế

3.1 Quản lý kho chọn nhập lại

1. Thông tin danh mục đã nhập bị xóa

2. Quay lại UC-06 bước 4


### Luồng ngoại lệ

4.1 Tên danh mục đã tồn tại

1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 2

4.2 Dữ liệu nhập bị bỏ trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)

2. Quay lại bước 2

4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ

1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 2

4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-06.2 Xóa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Danh mục được xóa khỏi danh sách

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Xoá danh mục (LoaiHang)

2. Hệ thống yêu cầu xác nhận xóa (LoaiHang)

3. Xác nhận xóa

4. Hệ thống kiểm tra danh mục có đang được sử dụng hay không (LoaiHang, MatHang)

5. Hệ thống xóa danh mục khỏi danh sách và thông báo xoá danh mục thành công (LoaiHang)


### Luồng thay thế

3.1 Hủy khi được yêu cầu xác nhận xóa

1. Quản lý kho chọn Hủy

2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục

3. Kết thúc use case


### Luồng ngoại lệ

4.1 Danh mục đang được sử dụng

1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang, MatHang)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-06.3 Sửa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Thông tin danh mục được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Sửa danh mục (LoaiHang)

2. Hệ thống hiển thị form với thông tin có thể sửa là tên danh mục và mô tả (LoaiHang)

3. Nhập thông tin muốn chỉnh sửa (LoaiHang)

4. Chọn xác nhận

5. Hệ thống kiểm tra dữ liệu vừa được nhập (LoaiHang)

6. Hệ thống lưu thông tin danh mục đã chỉnh sửa và thông báo chỉnh sửa thành công (LoaiHang)


### Luồng thay thế

4.1 Hủy trước khi xác nhận

1. Quản lý kho chọn Hủy

2. Hệ thống hủy thông tin đã chỉnh sửa

3. Quay lại bước 2


### Luồng ngoại lệ

5.1 Tên danh mục đã tồn tại

1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 3

5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ

1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 3

5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)

2. Quay lại bước 3

5.3 Nếu dữ liệu bị bỏ trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-07 Quản lý dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập thành công và có quyền quản lý dữ liệu danh mục kho

**Hậu điều kiện:** Danh sách dữ liệu gồm (khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) trong danh mục được hiển thị/chỉnh sửa/xóa theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Quản lý dữ liệu danh mục kho

2. Hiển thị danh sách danh mục (LoaiHang)

3. Chọn một danh mục để xem chi tiết dữ liệu (LoaiHang, MatHang)

4. Hiển thị dữ liệu chi tiết (MatHang)


### Luồng thay thế

3.1 Tìm kiếm dữ liệu

1. Quản lý kho tên dữ liệu cần tìm (MatHang)

2. Hệ thống hiển thị dữ liệu phù hợp (MatHang)

3. Kết thúc UC

3.2 Chọn Thêm

1. Hệ thống thực hiện UC-07.1

4.1 Chọn Xóa

1. Hệ thống thực hiện UC-07.2

4.2 Chọn Sửa

1. Hệ thống thực hiện UC-07.3


### Luồng ngoại lệ

2.1 Không có dữ liệu

1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-07.1 Thêm dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Dữ liệu mới được thêm vào danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Thêm dữ liệu (MatHang)

2. Hiển thị form thêm dữ liệu yêu cầu nhập dữ liệu theo các cột tương ứng trong hệ thống ngoại trừ mã, ngày tạo, ngày cập nhật gần nhất (MatHang, LoaiHang)

3. Nhập thông tin và xác nhận (MatHang)

4. Kiểm tra dữ liệu nhập (MatHang)

5. Lưu dữ liệu mới vào hệ thống và thông báo thêm thành công (MatHang)


### Luồng thay thế

3.1 Hủy trước khi xác nhận

1. Quản lý kho chọn Hủy

2. Hệ thống hủy thông tin đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

3.1 Tên đã tồn tại

1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)

2. Quay lại bước 3

3.2 Dữ liệu để trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)

2. Quay lại bước 3

3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ

1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)

2. Quay lại bước 3

3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0

1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-07.2 Xóa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Dữ liệu được xóa khỏi danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Xóa (MatHang)

2. Hệ thống kiểm tra dữ liệu có còn tồn kho/phát sinh giao dịch hay không (MatHang, TonKho, ChiTietPhieuKho)

3. Hệ thống yêu cầu xác nhận xóa (MatHang)

4. Xác nhận xóa

5. Hệ thống xóa dữ liệu khỏi danh sách (MatHang)


### Luồng thay thế

4.1 Hủy khi được yêu cầu xác nhận xóa

1. Quản lý kho chọn Hủy

2. Hệ thống hủy thao tác xóa

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng

1. Hệ thống thông báo không thể xóa (MatHang)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-07.3 Sửa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Thông tin dữ liệu được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn Sửa (MatHang)

2. Hệ thống mở form nhập cho phép chỉnh sửa các thông tin được phép chỉnh sửa (MatHang)

3. Chỉnh sửa thông tin (tên danh mục, mô tả danh mục) và xác nhận (MatHang, LoaiHang)

4. Hệ thống kiểm tra thông tin vừa được nhập (MatHang)

4. Hệ thống lưu thông tin mới vào hệ thống và thông báo chỉnh sửa thành công (MatHang)


### Luồng thay thế

3.1 Hủy trước khi xác nhận

1. Quản lý kho chọn Hủy

2. Hệ thống hủy thông tin đã chỉnh sửa

3. Kết thúc use case


### Luồng ngoại lệ

4.1 Tên bị trùng

1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)

2. Quay lại bước 3

4.2 Nếu dữ liệu bị nhập sai định dạng

1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)

2. Quay lại bước 3

4.3 Dữ liệu để trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-08 Quản lý nhập kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách chi tiết các phiếu nhập kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Quản lý nhập kho

2. Hiển thị danh sách phiếu nhập kho (PhieuKho)

3. Chọn một phiếu nhập kho để xem chi tiết (PhieuKho)

4. Hiển thị thông tin chi tiết phiếu nhập kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang)


### Luồng thay thế

3.1 Tìm kiếm phiếu nhập kho

1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)

2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)

3. Đi đến bước 3


### Luồng ngoại lệ

2.1 Không có phiếu nhập kho

1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho)

2. Kết thúc UC

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-09 Quản lý xuất kho

**Lưu ý đồng bộ:** Hai câu tìm kiếm “phiếu nhập kho” là lỗi chữ trong Word; tại UC-09 được chuẩn hóa là “phiếu xuất kho”, không đổi mã hay nghiệp vụ.

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách phiếu xuất kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Quản lý xuất kho

2. Hiển thị danh sách phiếu xuất kho (PhieuKho)

3. Chọn một phiếu xuất kho để xem chi tiết (PhieuKho)

4. Hiển thị thông tin chi tiết phiếu xuất kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang)


### Luồng thay thế

3.1 Tìm kiếm phiếu xuất kho

1. Nhập mã phiếu để tìm kiếm phiếu xuất kho (PhieuKho)

2. Hệ thống hiển thị các phiếu xuất kho phù hợp (PhieuKho)

3. Đi đến bước 3


### Luồng ngoại lệ

2.1 Không có phiếu xuất kho phù hợp

1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-13 Lập đợt kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập vào hệ thống

**Hậu điều kiện:** Đợt kiểm kê mới được tạo, lưu vào hệ thống và gửi cho Ban kiểm kê

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Lập đợt kiểm kê

2. Hiển thị form lập đợt kiểm kê (CongViec, Kho)

3. Nhập thông tin đợt kiểm kê (thời gian, loại nguyên vật liệu/thành phẩm, chọn danh sách các kho cần kiểm, ngày kiểm kê) (CongViec, PhieuKiemKe, Kho, MatHang)

4. Kiểm tra thông tin đợt kiểm kê (CongViec, PhieuKiemKe, Kho)

5. Xác nhận lập đợt kiểm kê

6. Lưu đợt kiểm kê, gửi cho Ban kiểm kê và thông báo tạo thành công (CongViec, PhieuKiemKe)


### Luồng thay thế

5.1 Ban giám đốc chọn nhập lại

2. Hệ thống hủy thông tin đã nhập

3. Quay lại bước 3


### Luồng ngoại lệ

4.1 Thời gian/phạm vi kiểm kê không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (CongViec, PhieuKiemKe)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-17 Phê duyệt đề xuất xử lý ngoại lệ

**Lưu ý đồng bộ:** Không hiểu bước áp dụng thay đổi là giảm tồn cho hàng lỗi chưa nhập. Phê duyệt, lịch sử và thực hiện vật lý theo BR-12/D-09.

**Tiền điều kiện:** Có đề xuất xử lý hàng lỗi hoặc chênh lệch kiểm kê đang chờ phê duyệt

**Hậu điều kiện:** Đề xuất được phê duyệt hoặc từ chối và trạng thái được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Phê duyệt đề xuất xử lý ngoại lệ

2. Hiển thị danh sách đề xuất đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)

3. Chọn một đề xuất để xem chi tiết (BanDeXuatXuLyNgoaiLe)

4. Hiển thị thông tin chi tiết đề xuất, loại hàng, số lượng, hàng bị vấn đề gì (BanDeXuatXuLyNgoaiLe, MatHang, LoaiHang, ChiTietKetQuaKiemTraQCAC, ChiTietPhieuKiemKe)

5. Chọn Phê duyệt (KetQuaXuLyNgoaiLe)

6. Cập nhật trạng thái đề xuất đã duyệt và áp dụng thay đổi liên quan (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe, TonKho)


### Luồng thay thế

5.1 Từ chối đề xuất và có nhập lý do

1. Ban giám đốc chọn Từ chối và nhập lý do (BanDeXuatXuLyNgoaiLe)

2. Hệ thống cập nhật trạng thái đề xuất bị từ chối và thông báo cho người đề xuất (BanDeXuatXuLyNgoaiLe, KetQuaXuLyNgoaiLe)

3. Quay lại bước 1

5.2 Từ chối đề xuất nhưng không nhập lý do

1. Ban giám đốc chọn Từ chối nhưng để trống lý do (BanDeXuatXuLyNgoaiLe)

2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KetQuaXuLyNgoaiLe)

3. Quay lại bước 4


### Luồng ngoại lệ

2.1 Không có đề xuất nào đang chờ phê duyệt

1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)

2. Kết thúc use case

4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác)

1. Hệ thống thông báo đề xuất không còn hiệu lực (BanDeXuatXuLyNgoaiLe)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-18 Xem danh sách hàng tồn kho

**Lưu ý đồng bộ:** Actor trong Word gồm Ban giám đốc, Chủ xưởng và Quản lý kho; nhãn bước chỉ ghi Ban giám đốc không thu hẹp danh sách actor. Phạm vi dữ liệu xem cần D-12.

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo tồn kho

**Hậu điều kiện:** Danh sách hàng tồn kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng, Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Xem danh sách hàng tồn kho

2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang)

3. Chọn điều kiện lọc và xác nhận (Kho, MatHang)

4. Tổng hợp và hiển thị danh sách hàng tồn kho tương ứng (TonKho, Kho, MatHang, LoHang, ChiTietLo)


### Luồng thay thế

2.1 Xuất báo cáo ra file

1. Ban giám đốc chọn Xuất file (TonKho)

2. Hệ thống tạo và tải về file báo cáo (TonKho)

3. Quay lại bước 2


### Luồng ngoại lệ

3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (TonKho)

2. Quay lại bước 2

4.1 Không có dữ liệu phù hợp với điều kiện lọc

1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-19 Xem hồ sơ xuất kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ xuất kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc/Chủ xưởng

Hệ thống

1. Chọn chức năng Xem hồ sơ xuất kho

2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)

3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho)

4. Tổng hợp và hiển thị hồ sơ xuất kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang, ChiTietLo)


### Luồng thay thế

2.1 Xuất báo cáo ra file

1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)

2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)

3. Quay lại bước 2


### Luồng ngoại lệ

3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)

2. Quay lại bước 2

4.1 Không có dữ liệu phù hợp với điều kiện lọc

1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-20 Xem hồ sơ nhập kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ nhập kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc/Chủ xưởng

Hệ thống

1. Chọn chức năng Xem hồ sơ nhập kho

2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho)

3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho)

4. Tổng hợp và hiển thị hồ sơ nhập kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang, ChiTietLo)


### Luồng thay thế

2.1 Xuất báo cáo ra file

1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)

2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)

3. Quay lại bước 2


### Luồng ngoại lệ

3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)

2. Quay lại bước 2

4.1 Không có dữ liệu phù hợp với điều kiện lọc

1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-21 Xem báo cáo kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo kiểm kê

**Hậu điều kiện:** Báo cáo kiểm kê được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Xem báo cáo kiểm kê

2. Hiển thị form điều kiện lọc báo cáo (đợt kiểm kê, thời gian, khu vực) (PhieuKiemKe, CongViec, Kho)

3. Chọn điều kiện lọc và xác nhận (PhieuKiemKe, CongViec, Kho)

4. Tổng hợp và hiển thị báo cáo kiểm kê tương ứng (bao gồm số liệu chênh lệch) (PhieuKiemKe, ChiTietPhieuKiemKe, Kho, MatHang)


### Luồng thay thế

2.1 Xuất báo cáo ra file

1. Ban giám đốc chọn Xuất file (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Hệ thống tạo và tải về file báo cáo (PhieuKiemKe, ChiTietPhieuKiemKe)

3. Quay lại bước 2


### Luồng ngoại lệ

3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)

1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Quay lại bước 2

4.1 Không có dữ liệu phù hợp với điều kiện lọc

1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-25 Quản lý công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền quản lý công việc

**Hậu điều kiện:** Công việc được xem, cập nhật hoặc xoá theo thao tác của Ban giám đốc

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Quản lý công việc

2. Hiển thị danh sách công việc (CongViec)

3. Chọn công việc cụ thể (CongViec)

4. Hiển thị thông tin chi tiết công việc gồm: tên công việc, mô tả, ngày bắt đầu, ngày kết thúc, độ ưu tiên, trạng thái, nhân viên được phân công (CongViec, NhanVien)

5. Kết thúc UC


### Luồng thay thế

4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa

1. Đi đến UC-25.1 Chỉnh sửa công việc

4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá

1. Đi đến UC-25.2 Xóa công việc


### Luồng ngoại lệ

2.1 Nếu danh sách công việc hiện đang trống

1. Hệ thống thông báo không có công việc hiện tại (CongViec)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-25.1 Chỉnh sửa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần chỉnh sửa

**Hậu điều kiện:** Công việc được cập nhật theo đúng thông tin Ban giám đốc xác nhận

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn Chỉnh sửa công việc (CongViec)

2. Hiển thị form với thông tin hiện tại của công việc (CongViec, NhanVien)

3. Nhập thông tin muốn chỉnh sửa (CongViec, NhanVien)

4. Chọn Xác nhận

5. Kiểm tra dữ liệu nhập (CongViec)

6. Kiểm tra lịch trình nhân viên nếu có bổ sung/thay đổi nhân viên (NhanVien, CongViec)

7. Lưu thông tin công việc được cập nhật vào hệ thống và thông báo cập nhật thành công (CongViec, NhanVien)


### Luồng thay thế

4.1 Nếu giám đốc chọn Huỷ

1. Hệ thống hủy thông tin đã chỉnh sửa

2. Kết thúc UC


### Luồng ngoại lệ

5.1 Nếu giám đốc nhập chữ vào ô nhập số

1. Hệ thống thông báo lỗi định dạng (CongViec)

2. Quay lại bước 3

5.2 Nếu giám đốc nhập số < 0

1. Hệ thống thông báo số phải lớn hơn 0 (CongViec)

2. Quay lại bước 3

5.3 Nếu bỏ trống thông tin bắt buộc

1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec)

2. Quay lại bước 3

5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ

1. Hệ thống thông báo thời gian thực hiện công việc không hợp lệ (CongViec)

2. Quay lại bước 3

6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc

1. Hệ thống thông báo nhân viên đang không trống lịch, yêu cầu chọn nhân viên khác (NhanVien, CongViec)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-25.2 Xóa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần xoá

**Hậu điều kiện:** Công việc được xoá khỏi hệ thống khi đáp ứng điều kiện xoá

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn Xóa công việc muốn xoá (CongViec)

2. Hệ thống yêu cầu xác nhận (CongViec)

3. Chọn Xác nhận

4. Kiểm tra công việc có đang được thực hiện (CongViec)

5. Xóa công việc khỏi hệ thống và thông báo xoá thành công (CongViec)


### Luồng thay thế

3.1 Nếu giám đốc chọn Huỷ

1. Hệ thống hủy thao tác xoá

2. Kết thúc UC


### Luồng ngoại lệ

4.1 Nếu công việc hiện đang được diễn ra

1. Hệ thống thông báo công việc đang được tiến hành, không thể xoá (CongViec)

2. Kết thúc UC

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-31 Phê duyệt đơn hàng

**Lưu ý đồng bộ:** Word còn điều kiện “nếu nghiệp vụ chốt duyệt đồng thời”; chưa công nhận duyệt kế hoạch cùng đơn là bắt buộc, xem D-11.

**Tiền điều kiện:** Ban giám đốc đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được phê duyệt hoặc từ chối và trạng thái đơn hàng được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Phê duyệt đơn hàng

2. Hiển thị danh sách đơn hàng đang chờ phê duyệt (DonHang)

3. Chọn một đơn hàng để xem chi tiết (DonHang)

4. Hiển thị đơn hàng, kế hoạch sản xuất và xưởng liên quan. (DonHang, ChiTietDonHang, MatHang, KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong)

5. Chọn Phê duyệt (DonHang)

6. Cập nhật đơn hàng và kế hoạch sản xuất liên quan thành Đã duyệt; thông báo cho Bộ phận lập kế hoạch. (DonHang, KeHoachSanXuat)


### Luồng thay thế

5.1 Từ chối đơn hàng

1. Ban giám đốc chọn Từ chối và nhập lý do (DonHang)

2. Cập nhật đơn hàng và kế hoạch sản xuất liên quan thành Từ chối, lưu lý do; thông báo cho khách hàng và Bộ phận lập kế hoạch. (DonHang, KeHoachSanXuat, KhachHang)

3. Quay lại bước 1


### Luồng ngoại lệ

2.1 Danh sách đơn hàng chờ phê duyệt rỗng

1. Hệ thống hiển thị danh sách rỗng / thông báo không có đơn hàng nào cần phê duyệt.  (DonHang)
2. Kết thúc UC.

4.1 Đơn hàng không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)

1. Hệ thống thông báo đơn hàng không còn hiệu lực để phê duyệt (DonHang)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-14 Xem/Quản lý đơn hàng mua

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Hiển thị danh sách đơn mua hàng đã đặt

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận mua hàng

Hệ thống

1. Chọn chức năng Xem/Quản lý đơn hàng mua

2. Hiển thị danh sách đơn hàng đã đặt (DonMuaHang, NhaCungCap)


### Luồng thay thế


### Luồng ngoại lệ

2.1 Không có đơn hàng trong hệ thống

1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonMuaHang)

2. Kết thúc UC

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-23 Yêu cầu nhập/xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống

**Hậu điều kiện:** Yêu cầu nhập/xuất của chủ xưởng được tạo và gửi đến bộ phận kho xử lý

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn chức năng Yêu cầu nhập/xuất

2. Hiển thị form chọn loại yêu cầu và báo cáo nguồn thuộc xưởng. (PhieuYeuCauNhapXuat, BanBaoCaoSanXuat, Xuong)

3. Chọn báo cáo SAN_XUAT để yêu cầu xuất NVL hoặc báo cáo THANH_PHAM để yêu cầu nhập thành phẩm; lấy mặt hàng và lượng thực tế, nhập lượng đề nghị. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, ChiTietPhieuYeuCauNhapXuat)

4. Kiểm tra loại báo cáo, xưởng, lượng đề nghị và lượng đã thực hiện để tránh yêu cầu trùng. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, PhieuKho, ChiTietPhieuKho)

5. Gửi yêu cầu (PhieuYeuCauNhapXuat)

6. Lưu yêu cầu với trạng thái Chờ xử lý, tham chiếu MaBaoCao và MaXuong; gửi thông báo đến bộ phận kho. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)


### Luồng thay thế

3.1 Hủy yêu cầu trước khi gửi

1. Chủ xưởng chọn Hủy

2. Hệ thống hủy thông tin đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Không tìm thấy báo cáo đúng loại, hợp lệ và thuộc xưởng để tạo yêu cầu

1. Hệ thống thông báo không có báo cáo nguồn hợp lệ để lập yêu cầu nhập/xuất. (BanBaoCaoSanXuat)

2. Kết thúc UC.

4.1 Thiếu thông tin bắt buộc

1. Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-24 Quản lý yêu cầu nhập xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập; đã có yêu cầu được gửi (UC-23)

**Hậu điều kiện:** Danh sách yêu cầu của chủ xưởng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn chức năng Quản lý yêu cầu

2. Hiển thị danh sách yêu cầu đã gửi của chủ xưởng (PhieuYeuCauNhapXuat)

3. Chọn một yêu cầu để xem chi tiết (PhieuYeuCauNhapXuat)

4. Hiển thị thông tin và trạng thái xử lý yêu cầu (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, MatHang)


### Luồng thay thế

1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian

1. Chủ xưởng nhập điều kiện tìm kiếm (PhieuYeuCauNhapXuat)

2. Hệ thống hiển thị yêu cầu phù hợp (PhieuYeuCauNhapXuat)

3. Quay lại bước 1

4.1 Chọn Sửa

1. Hệ thống thực hiện UC-24.1

4.2 Chọn Xóa

1. Hệ thống thực hiện UC-24.2


### Luồng ngoại lệ

1.1 Tìm kiếm/lọc không có 1 t quả phù hợp

1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (PhieuYeuCauNhapXuat)

2. Quay lại bước 1

2.1 Không có yêu cầu trong hệ thống

1. Hệ thống thông báo không tìm thấy yêu cầu (PhieuYeuCauNhapXuat)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-24.1 Sửa yêu cầu

**Tiền điều kiện:** Chủ xưởng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin yêu cầu được cập nhật chính xác

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn Sửa (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

2. Kiểm tra yêu cầu chưa được xử lý (PhieuYeuCauNhapXuat)

3. Hiển thị form với thông tin hiện tại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

4. Chỉnh sửa thông tin muốn thay đổi (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

5. Chọn xác nhận

6. Hệ thống kiểm tra thông tin nhập (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

7. Hệ thống cập nhật thông tin sau khi chỉnh sửa (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)


### Luồng thay thế

5.1 Hủy trước khi xác nhận

1. Chủ xưởng chọn Hủy

2. Hệ thống hủy thông tin đã chỉnh sửa

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Yêu cầu đã được xử lý

1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)

2. Kết thúc use case

6.1 Thông tin không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-24.2 Xóa yêu cầu

**Tiền điều kiện:** Yêu cầu đang ở trạng thái Chờ xử lý

**Hậu điều kiện:** Yêu cầu bị xóa/hủy khỏi danh sách

**Actor chính:** Chủ xưởng

**Actor phụ:** Bộ phận


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn một yêu cầu và chọn Xóa (PhieuYeuCauNhapXuat)

2. Hệ thống yêu cầu xác nhận xóa (PhieuYeuCauNhapXuat)

3. Xác nhận xóa

4. Hệ thống hủy yêu cầu và thông báo đến bộ phận kho (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat)


### Luồng thay thế

3.1 Hủy trước khi xác nhận xóa

1. Chủ xưởng chọn Hủy

2. Hệ thống hủy thao tác xóa

3. Kết thúc use case


### Luồng ngoại lệ

3.1 Yêu cầu đã được xử lý

1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (PhieuYeuCauNhapXuat)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-27 Mua hàng

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống và kế hoạch mua hàng đã được duyệt

**Hậu điều kiện:** Đơn hàng mua (nguyên vật liệu) mới được tạo và đang trong trạng thái "Chờ xử lý"

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận mua hàng

Hệ thống

1. Chọn chức năng Mua hàng

2. Hiển thị kế hoạch loại MUA đã được duyệt, còn nhu cầu cần xử lý. (KeHoachMuaBan)

3. Chọn một kế hoạch mua để xem chi tiết (KeHoachMuaBan)

4. Hiển thị chi tiết kế hoạch và báo cáo sản xuất nguồn. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang)

5. Nhập thông tin nhà cung cấp, giá, điều kiện giao hàng (DonMuaHang, ChiTietDonMuaHang, NhaCungCap)

6. Kiểm tra thông tin đơn mua, lượng đã mua và báo cáo nguồn phải là SAN_XUAT, trùng nguồn của kế hoạch MUA đã duyệt. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

7. Xác nhận mua hàng

8. Tạo đơn mua và chi tiết, tham chiếu kế hoạch MUA và MaBaoCao nguồn; cập nhật trạng thái thực hiện kế hoạch. (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan)


### Luồng thay thế

7.1 Hủy trước khi xác nhận

1. Bộ phận mua hàng chọn Hủy

2. Hệ thống hủy thông tin đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Không có kế hoạch mua hàng nào đang chờ xử lý

1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan)

2. Kết thúc UC.

6.1 Thông tin đơn hàng mua không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)

2. Quay lại bước 5

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-04 Lập kế hoạch mua/bán

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập

**Hậu điều kiện:** Kế hoạch mua/bán mới được tạo, lưu vào hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-32 Phê duyệt kế hoạch mua/bán)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận lập kế hoạch

Hệ thống

1. Chọn chức năng Lập kế hoạch mua/bán

2. Hiển thị form chọn loại kế hoạch và báo cáo nguồn. (KeHoachMuaBan, BanBaoCaoSanXuat)

3. Chọn kế hoạch MUA và báo cáo sản xuất có NVL còn thiếu. (KeHoachMuaBan, BanBaoCaoSanXuat)

4. Lấy danh sách NVL còn thiếu từ báo cáo; nhập giá dự kiến và ghi chú, đối chiếu lượng cần mua. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietKeHoachMuaBan, MatHang)

5. Kiểm tra loại báo cáo, số lượng còn thiếu và thông tin kế hoạch. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, KeHoachMuaBan, ChiTietKeHoachMuaBan)

6. Tính tổng tiền dựa trên đơn giá * số lượng (ChiTietKeHoachMuaBan, MatHang)

7. Chọn Xác nhận

8. Lưu kế hoạch MUA và chi tiết, tham chiếu MaBaoCao nguồn, chuyển sang Chờ phê duyệt; thông báo thành công. (KeHoachMuaBan, ChiTietKeHoachMuaBan)


### Luồng thay thế

3.1 Chọn kế hoạch bán hàng

1. Chọn báo cáo THANH_PHAM; lấy thành phẩm thực tế, đối chiếu phần đạt QC đã nhập kho và tồn khả dụng, nhập lượng bán và ghi chú. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, TonKho, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Thực hiện kiểm tra và tính tổng tiền như bước 5–6; khi xác nhận, lưu kế hoạch BAN và chi tiết, tham chiếu báo cáo thành phẩm, trạng thái Chờ phê duyệt. (KeHoachMuaBan, ChiTietKeHoachMuaBan)

3.2 Chọn kế hoạch sản xuất

1. Bộ phận lập kế hoạch chọn đơn hàng cần sản xuất; hệ thống lấy thông tin từ đơn hàng gồm thành phẩm, số lượng và ngày giao dự kiến (KeHoachSanXuat, ChiTietKeHoachSanXuat, DonHang, ChiTietDonHang, MatHang)

2. Chọn xưởng, nhập ghi chú; hệ thống ước lượng NVL bằng thuật toán, cộng 10% từng loại và đối chiếu tồn khả dụng để xác định lượng thiếu dự kiến. Chi tiết kế hoạch gồm thành phẩm và NVL, phân biệt bằng LoaiChiTiet. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang, TonKho, ChiTietLo)

3. Kiểm tra đơn hàng, xưởng và lượng dự kiến; khi xác nhận, lưu kế hoạch sản xuất và chi tiết để trình duyệt cùng đơn hàng tại UC-31. Không lưu vào kế hoạch mua/bán ở nhánh này. (KeHoachSanXuat, ChiTietKeHoachSanXuat)


### Luồng ngoại lệ

5.1 Nếu thông tin nhập là số và < 0

1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)

2. Quay lại bước 4

5.2 Nếu thông tin nhập là số mà người dùng nhập chữ

1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)

2. Quay lại bước 4

5.3 Kế hoạch sản xuất chưa chọn đơn hàng hoặc xưởng được phân công

1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachSanXuat, DonHang, Xuong)

2. Quay lại bước 4

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-05 Quản lý kế hoạch

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập và có quyền quản lý kế hoạch

**Hậu điều kiện:** Danh sách kế hoạch mua/bán được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận lập kế hoạch

Hệ thống

1. Chọn chức năng Quản lý kế hoạch

2. Hiển thị danh sách kế hoạch hiện có (KeHoachMuaBan)

3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan)

4. Hiển thị kế hoạch, chi tiết và báo cáo nguồn theo loại MUA/BAN. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang)


### Luồng thay thế

3.1 Tìm kiếm/lọc kế hoạch

1. Nhân viên nhập điều kiện tìm kiếm (loại kế hoạch, thời gian, trạng thái) (KeHoachMuaBan)

2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan)

3. Quay lại bước 1

4.1 Chọn Sửa

1. Hệ thống thực hiện UC-05.1

4.2 Chọn Xóa

1. Hệ thống thực hiện UC-05.2


### Luồng ngoại lệ

2.1 Không có kế hoạch nào

1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-05.1 Sửa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Thông tin kế hoạch được cập nhật chính xác

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận lập kế hoạch

Hệ thống

1. Chọn Sửa (KeHoachMuaBan, ChiTietKeHoachMuaBan)

2. Hiển thị form với thông tin kế hoạch hiện tại (KeHoachMuaBan, ChiTietKeHoachMuaBan)

3. Nhập thông tin cần chỉnh sửa và xác nhận (KeHoachMuaBan, ChiTietKeHoachMuaBan)

4. Kiểm tra thông tin, trạng thái kế hoạch và lượng sửa so với báo cáo nguồn. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

5. Lưu cập nhật vào hệ thống (KeHoachMuaBan, ChiTietKeHoachMuaBan)

6. Thông báo kế hoạch đã được cập nhật (KeHoachMuaBan, ChiTietKeHoachMuaBan)


### Luồng thay thế

1.1 Hủy trước khi xác nhận

1. Nhân viên chọn Hủy

2. Hệ thống hủy thông tin đã nhập, quay lại UC-05 bước 4


### Luồng ngoại lệ

4.1 Thông tin nhập không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-05.2 Xóa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Kế hoạch được xóa khỏi danh sách

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận lập kế hoạch

Hệ thống

1. Chọn Xóa (KeHoachMuaBan)

2. Hệ thống kiểm tra kế hoạch được chọn chưa được duyệt/thực hiện (KeHoachMuaBan)

3. Hệ thống yêu cầu xác nhận xóa (KeHoachMuaBan)

4. Xác nhận xóa

5. Hệ thống xóa kế hoạch khỏi danh sách và thông báo thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan)


### Luồng thay thế

4.1 Hủy thao tác xóa

1. Nhân viên chọn Không đồng ý (KeHoachMuaBan)

2. Quay lại UC-05 bước 4


### Luồng ngoại lệ

2.1 Kế hoạch đã được duyệt/đang thực hiện

1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-10 Nhập kho

**Tiền điều kiện:** Nhân viên kho đã đăng nhập; có lô NVL hoặc thành phẩm được QC/AC kết luận đạt, còn lượng chưa nhập kho.

**Hậu điều kiện:** Hàng hóa được cập nhật vào tồn kho, phiếu nhập kho được tạo

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


### Luồng cơ bản

Nhân viên kho

Hệ thống

1. Chọn chức năng Nhập kho

2. Hiển thị các dòng lô NVL/thành phẩm đạt QC còn chờ nhập. (LoHang, LoNguyenVatLieu, LoThanhPham, ChiTietLo, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

3. Chọn dòng lô, nhập vị trí kho/ngày nhập; lượng mặc định là phần đạt QC chưa nhập. Nhập thành phẩm đối chiếu báo cáo và yêu cầu nhập liên quan. (ChiTietLo, Kho, ChiTietPhieuKho, ChiTietKetQuaKiemTraQCAC, PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, BanBaoCaoSanXuat)

4. Kiểm tra kho, dòng lô và lượng thực nhập không vượt phần đạt còn chưa nhập. (ChiTietPhieuKho, Kho, ChiTietLo, ChiTietKetQuaKiemTraQCAC)

5. Xác nhận nhập kho

6. Cập nhật tồn kho và tạo phiếu nhập kho (TonKho, PhieuKho, ChiTietPhieuKho)


### Luồng thay thế

4.1 Số lượng thực nhập khác với kế hoạch

1. Hệ thống ghi nhận chênh lệch giữa số lượng thực nhập và kế hoạch (ChiTietPhieuKho, ChiTietPhieuYeuCauNhapXuat)

2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)

3. Quay lại bước 3


### Luồng ngoại lệ

4.1 Thông tin nhập kho không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-11 Xuất kho

**Tiền điều kiện:** Nhân viên kho đã đăng nhập hệ thống và có quyền xuất kho

**Hậu điều kiện:** Phiếu xuất kho được lập; tồn kho và trạng thái lô được cập nhật

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


### Luồng cơ bản

Nhân viên kho

Hệ thống

1. Chọn chức năng Xuất kho

2. Hiển thị các loại xuất kho gồm: xuất nguyên vật liệu, xuất thành phẩm


### Luồng thay thế

2.1 Chọn Xuất nguyên vật liệu

1. Hệ thống thực hiện UC-11.01

2.2 Chọn Xuất thành phẩm

1. Hệ thống thực hiện UC-11.02


### Luồng ngoại lệ

Xử lý trong UC-11.01 và UC-11.02

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-11.01 Xuất nguyên vật liệu

**Tiền điều kiện:** Nhân viên kho đã đăng nhập và chọn Xuất NVL (UC-11); có yêu cầu xuất từ báo cáo SAN_XUAT của xưởng, đang Chờ xử lý và đủ điều kiện xuất.

**Hậu điều kiện:** Phiếu xuất kho nguyên vật liệu được lập; tồn kho và trạng thái lô được cập nhật

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


### Luồng cơ bản

Nhân viên kho

Hệ thống

1. Chọn Xuất nguyên vật liệu

2. Hiển thị yêu cầu xuất NVL Chờ xử lý, chưa xuất hết và đủ điều kiện thực hiện. (PhieuYeuCauNhapXuat)

3. Chọn phiếu yêu cầu

4. Lấy yêu cầu và báo cáo SAN_XUAT nguồn; đối chiếu lượng cần cấp, tự phân bổ lô khả dụng theo mặt hàng và lượng yêu cầu, hiển thị phiếu xuất dự thảo. (PhieuYeuCauNhapXuat, ChiTietPhieuYeuCauNhapXuat, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, LoNguyenVatLieu, ChiTietLo, TonKho, Kho)

5. Xác nhận xuất kho

6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoNguyenVatLieu)

7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho)

8. Cập nhật trạng thái lô và phiếu yêu cầu (LoNguyenVatLieu, PhieuYeuCauNhapXuat)

9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho


### Luồng thay thế

4.1 Phiếu yêu cầu không thực hiện được trên thực tế (lô hỏng, thiếu hàng…)

1. Chọn Báo phiếu yêu cầu không thực hiện được và nêu lý do (BanDeXuatXuLyNgoaiLe)

2. Hệ thống ghi nhận đề xuất, chuyển phiếu yêu cầu sang “Chờ duyệt lại” và kết thúc UC (BanDeXuatXuLyNgoaiLe, PhieuYeuCauNhapXuat)


### Luồng ngoại lệ

6.1 Tồn kho không đủ hoặc lô không còn khả dụng

1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoNguyenVatLieu)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-11.02 Xuất thành phẩm

**Tiền điều kiện:** Nhân viên kho đã đăng nhập và chọn Xuất thành phẩm (UC-11); đơn hàng và kế hoạch BAN liên quan đã được duyệt, có thành phẩm đạt QC và tồn khả dụng.

**Hậu điều kiện:** Phiếu xuất kho thành phẩm được lập; tồn kho, trạng thái lô và đơn hàng được cập nhật

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


### Luồng cơ bản

Nhân viên kho

Hệ thống

1. Chọn Xuất thành phẩm

2. Hiển thị đơn hàng và kế hoạch BAN đã duyệt còn lượng chờ giao. (DonHang, KeHoachMuaBan)

3. Chọn đơn hàng và kế hoạch BAN để xuất giao.

4. Lấy chi tiết đơn, kế hoạch BAN và báo cáo thành phẩm nguồn; phân bổ lô đạt chất lượng còn khả dụng, hiển thị phiếu xuất dự thảo. (DonHang, ChiTietDonHang, KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, LoThanhPham, ChiTietLo, TonKho, Kho)

5. Xác nhận xuất kho

6. Kiểm tra lại tồn kho khả dụng và trạng thái lô (TonKho, LoThanhPham)

7. Lập phiếu xuất kho và trừ tồn kho (PhieuKho, ChiTietPhieuKho, TonKho)

8. Cập nhật trạng thái lô, lượng đã giao của đơn và lượng đã thực hiện của kế hoạch BAN. (LoThanhPham, DonHang, KeHoachMuaBan)

9. Thông báo xuất kho thành công và hiển thị phiếu xuất kho


### Luồng thay thế

4.1 Nhu cầu xuất không thực hiện được trên thực tế (lô hỏng, thiếu hàng…)

1. Chọn Báo không thể xuất giao và nhập lý do. (BanDeXuatXuLyNgoaiLe)

2. Ghi nhận đề xuất, tạm dừng phần giao hàng chưa thực hiện và kết thúc UC. (BanDeXuatXuLyNgoaiLe, DonHang, KeHoachMuaBan)


### Luồng ngoại lệ

6.1 Tồn kho không đủ hoặc lô không còn khả dụng

1. Hệ thống thông báo lỗi, không lập phiếu xuất kho (TonKho, LoThanhPham)

2. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-35 Báo cáo thành phẩm

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống và lô thành phẩm đã hoàn thành sản xuất

**Hậu điều kiện:** Báo cáo thành phẩm thực tế được lưu, liên kết kế hoạch sản xuất và xưởng; làm nguồn lập kế hoạch bán. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn chức năng Báo cáo thành phẩm

2. Hiển thị kế hoạch sản xuất, xưởng và dữ liệu xuất NVL thực tế liên quan. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, PhieuKho, ChiTietPhieuKho, ChiTietLo)

3. Nhập lượng thành phẩm thực tế, lượng NVL đã sử dụng, ngày hoàn thành và ghi chú; phân bổ theo lô nếu có. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat, ChiTietLo)

4. Kiểm tra thông tin và tổng lượng phân bổ theo lô. (ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat)

5. Xác nhận gửi báo cáo

6. Lưu báo cáo loại THANH_PHAM, liên kết kế hoạch và xưởng; lưu chi tiết và phân bổ lô nếu có, gửi cho Ban giám đốc và làm nguồn lập kế hoạch bán. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, ChiTietLoBaoCaoSanXuat)


### Luồng thay thế

5.1 Hủy trước khi xác nhận gửi báo cáo

1. Chủ xưởng chọn Hủy

2. Hệ thống hủy thông tin báo cáo đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ

1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-01 Đăng nhập

**Tiền điều kiện:** Người dùng đã được cấp tài khoản trong hệ thống

**Hậu điều kiện:** Người dùng đăng nhập thành công và truy cập được các chức năng theo quyền hạn được cấp

**Actor chính:** Người dùng

**Actor phụ:** Không


### Luồng cơ bản

Người dùng

Hệ thống

1. Truy cập màn hình đăng nhập

2. Hiển thị form đăng nhập gồm tên đăng nhập và mật khẩu (NguoiDung)

3. Nhập tên đăng nhập, mật khẩu và chọn Đăng nhập (NguoiDung)

4. Kiểm tra thông tin đăng nhập (NguoiDung)

5. Xem kết quả đăng nhập

6. Hiển thị màn hình chính theo quyền của người dùng (NguoiDung, VaiTro)


### Luồng thay thế

3.1 Sai tên đăng nhập hoặc mật khẩu

1. Hệ thống thông báo tên đăng nhập hoặc mật khẩu không đúng (NguoiDung)

2. Quay lại bước 2

3.2 Bỏ trống thông tin đăng nhập

1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)

2. Quay lại bước 2


### Luồng ngoại lệ

4.1 Tài khoản bị khóa

1. Hệ thống thông báo tài khoản đã bị khóa, hướng dẫn liên hệ quản trị viên (NguoiDung)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-12 Quản lý kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập

**Hậu điều kiện:** Danh sách kết quả kiểm tra chất lượng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận QC/AC

Hệ thống

1. Chọn chức năng Quản lý kết quả kiểm tra chất lượng

2. Hiển thị danh sách kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC)

3. Chọn một kết quả để xem chi tiết (KetQuaKiemTraQCAC)

4. Hiển thị chi tiết kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, MatHang, LoHang)


### Luồng thay thế

1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho)

1. Nhân viên nhập điều kiện lọc (KetQuaKiemTraQCAC, PhieuKho)

2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC)

3. Quay lại bước 1

2.1 Chọn Thêm

1. Hệ thống thực hiện UC-12.1

4.1 Chọn Sửa

1. Hệ thống thực hiện UC-12.2

4.2 Chọn Xóa

1. Hệ thống thực hiện UC-12.3

4.3 Kết quả ghi nhận "không đạt"

1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi


### Luồng ngoại lệ

1.1 Không có kết quả phù hợp

1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-12.1 Thêm kết quả kiểm tra QC/AC

**Tiền điều kiện:** Có lô và chi tiết lô NVL hoặc thành phẩm cần kiểm tra chất lượng trước khi nhập kho.

**Hậu điều kiện:** Kết quả kiểm tra chất lượng mới được lưu vào hệ thống

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận QC/AC

Hệ thống

1. Chọn Thêm kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Hiển thị form và các dòng lô cần kiểm tra. (KetQuaKiemTraQCAC, LoHang, ChiTietLo, MatHang)

3. Nhập lượng kiểm tra, lượng đạt, lượng lỗi và ghi chú của từng dòng lô; xác nhận. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

4. Kiểm tra lượng đạt + lượng lỗi bằng lượng kiểm tra; lưu kết quả. Chuyển phần đạt sang UC-10 để nhập kho; phần NVL lỗi xử lý trả NCC ngay, phần TP lỗi xử lý ngoại lệ khi cần. (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, ChiTietLo)


### Luồng thay thế

3.1 Hủy trước khi xác nhận

1. Bộ phận QC/AC chọn Hủy

2. Hệ thống hủy thông tin đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

3.1 Thông tin nhập không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Quay lại bước 3

3.2 Thông tin nhập bị bỏ trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-12.2 Sửa kết quả kiểm tra QC/AC

**Lưu ý đồng bộ:** BR-07: kiểm tra kết quả đã dùng nhập kho hoặc xử lý ngoại lệ trước sửa; không sửa âm thầm gây lệch tồn. Chính sách tái kiểm ở D-13.

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra chất lượng được cập nhật chính xác

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận QC/AC

Hệ thống

1. Chọn một kết quả và chọn Sửa (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Hệ thống hiển thị form với thông tin hiện tại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

3. Chỉnh sửa thông tin và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

4. Hệ thống kiểm tra và cập nhật kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)


### Luồng thay thế

3.1 Hủy trước khi xác nhận

1. Bộ phận QC/AC chọn Hủy

2. Hệ thống hủy thông tin đã chỉnh sửa

3. Kết thúc use case


### Luồng ngoại lệ

3.1 Thông tin nhập không hợp lệ

1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Quay lại bước 3

3.2 Thông tin nhập bị bỏ trống

1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-12.3 Xóa kết quả kiểm tra QC/AC

**Lưu ý đồng bộ:** BR-07: kết quả đã dùng để nhập phần đạt hoặc xử lý ngoại lệ không được xóa làm mất căn cứ tồn.

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra bị xóa khỏi danh sách

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


### Luồng cơ bản

Bộ phận QC/AC

Hệ thống

1. Chọn một kết quả và chọn Xóa (KetQuaKiemTraQCAC)

2. Hệ thống kiểm tra kết quả đã được sử dụng làm căn cứ xử lý hay chưa (KetQuaKiemTraQCAC, BanDeXuatXuLyNgoaiLe)

3. Hệ thống yêu cầu xác nhận xóa (KetQuaKiemTraQCAC)

4. Xác nhận xóa

5. Hệ thống xóa kết quả khỏi danh sách (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)


### Luồng thay thế

4.1 Hủy khi được yêu cầu xác nhận xóa

1. Bộ phận QC/AC chọn Hủy

2. Hệ thống hủy thao tác xóa

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi

1. Hệ thống thông báo không thể xóa (KetQuaKiemTraQCAC)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-34 Lập phiếu báo cáo sản xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập; có kế hoạch sản xuất đã được phê duyệt và được phân công cho xưởng.

**Hậu điều kiện:** Báo cáo sản xuất thực tế được lưu, liên kết kế hoạch sản xuất và xưởng; báo cáo được lập cả khi đủ và thiếu NVL. Chỉ phần còn thiếu làm căn cứ lập kế hoạch mua. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Chủ xưởng

Hệ thống

1. Chọn chức năng Lập phiếu báo cáo sản xuất

2. Hiển thị kế hoạch sản xuất, chi tiết thành phẩm/NVL dự kiến và tồn kho khả dụng của xưởng. (KeHoachSanXuat, ChiTietKeHoachSanXuat, Xuong, MatHang, TonKho, ChiTietLo)

3. Chọn kế hoạch, đối chiếu nhu cầu NVL thực tế với tồn khả dụng và nhập ghi chú. (KeHoachSanXuat, ChiTietKeHoachSanXuat, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)

4. Kiểm tra thông tin; tính lượng còn thiếu bằng max(0, lượng cần thiết − lượng tồn khả dụng). (TonKho, ChiTietLo, ChiTietBaoCaoSanXuat)

5. Xác nhận gửi phiếu

6. Lưu báo cáo loại SAN_XUAT cùng các dòng NVL cần/còn thiếu, tham chiếu kế hoạch và xưởng; gửi cho Bộ phận lập kế hoạch. (BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat)


### Luồng thay thế

3.1 Hủy trước khi xác nhận gửi phiếu

1. Chủ xưởng chọn Hủy

2. Hệ thống hủy thông tin phiếu đã nhập

3. Kết thúc use case


### Luồng ngoại lệ

4.1 Thông tin phiếu báo cáo sản xuất chưa đầy đủ hoặc không hợp lệ

1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-15 Thực hiện kiểm kê

**Tiền điều kiện:** Ban kiểm kê đã được phân công cho đợt kiểm kê

**Hậu điều kiện:** Số lượng thực tế của hàng hóa được ghi nhận cho đợt kiểm kê

**Actor chính:** Ban kiểm kê

**Actor phụ:** Không


### Luồng cơ bản

Ban kiểm kê

Hệ thống

1. Chọn chức năng Thực hiện kiểm kê

2. Hiển thị danh sách mặt hàng cần kiểm kê thuộc khu vực được phân công (CongViec, PhieuKiemKe, ChiTietPhieuKiemKe, MatHang, Kho)

3. Nhập số lượng thực tế đếm được cho từng mặt hàng (PhieuKiemKe, ChiTietPhieuKiemKe)

4. Ghi nhận số liệu kiểm kê (PhieuKiemKe, ChiTietPhieuKiemKe)

5. Xác nhận hoàn thành kiểm kê khu vực (PhieuKiemKe)

6. Cập nhật trạng thái hoàn thành và lưu kết quả kiểm kê (PhieuKiemKe, ChiTietPhieuKiemKe)


### Luồng thay thế

2.1 Tạm dừng kiểm kê

1. Nhân viên chọn Lưu tạm để tiếp tục sau (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Hệ thống lưu tạm số liệu đã nhập (PhieuKiemKe, ChiTietPhieuKiemKe)

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Mất kết nối trong khi nhập số liệu

1. Hệ thống thông báo lỗi kết nối và giữ lại số liệu đã nhập cục bộ (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Nhân viên thử lại khi có kết nối (PhieuKiemKe, ChiTietPhieuKiemKe)

3. Quay lại bước 2

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-28 Lập biên bản kiểm kê

**Tiền điều kiện:** Đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Biên bản kiểm kê được lập và gửi cho Quản lý kho

**Actor chính:** Ban kiểm kê, bộ phận QC/AC

**Actor phụ:** Không


### Luồng cơ bản

Ban kiểm kê / Bộ phận QC/AC

Hệ thống

1. Chọn chức năng Lập biên bản kiểm kê

2. Hiển thị số liệu tổng hợp của đợt kiểm kê (số liệu thực tế, số liệu hệ thống, chênh lệch) (PhieuKiemKe, ChiTietPhieuKiemKe)

3. Nhập nội dung biên bản (nhận xét, xác nhận) và xác nhận lập biên bản (PhieuKiemKe)

4. Lưu kết luận, nhận xét và trạng thái biên bản trên phiếu kiểm kê; gửi cho Quản lý kho. (PhieuKiemKe)


### Luồng thay thế

3.1 Lưu tạm biên bản

1. Nhân viên chọn Lưu tạm (PhieuKiemKe)

2. Lưu tạm nội dung biên bản trên phiếu kiểm kê. (PhieuKiemKe)

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Đợt kiểm kê chưa hoàn thành

1. Hệ thống thông báo còn khu vực chưa kiểm kê xong, chưa thể lập biên bản (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-32 Phê duyệt kế hoạch mua/bán

**Tiền điều kiện:** Ban giám đốc đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Kế hoạch được phê duyệt hoặc từ chối và trạng thái kế hoạch được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


### Luồng cơ bản

Ban giám đốc

Hệ thống

1. Chọn chức năng Phê duyệt kế hoạch mua/bán

2. Hiển thị danh sách kế hoạch đang chờ phê duyệt (KeHoachMuaBan)

3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan)

4. Hiển thị kế hoạch, chi tiết và báo cáo nguồn: MUA đối chiếu báo cáo SAN_XUAT; BAN đối chiếu báo cáo THANH_PHAM và tồn khả dụng. (KeHoachMuaBan, ChiTietKeHoachMuaBan, BanBaoCaoSanXuat, ChiTietBaoCaoSanXuat, MatHang, TonKho, ChiTietLo)

5. Chọn Phê duyệt (KeHoachMuaBan)

6. Cập nhật kế hoạch thành Đã duyệt: MUA cho phép lập đơn mua; BAN cho phép triển khai xuất bán. Việc nhập kho chỉ thực hiện sau nhận hàng và QC đạt. (KeHoachMuaBan)


### Luồng thay thế

5.1 Từ chối kế hoạch và có nhập lý do

1. Ban giám đốc chọn Từ chối và nhập lý do (KeHoachMuaBan)

2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (KeHoachMuaBan)

3. Kết thúc UC

5.2 Từ chối kế hoạch và không nhập lý do

1. Ban giám đốc chọn Từ chối và không nhập lý do (KeHoachMuaBan)

2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KeHoachMuaBan)

3. Quay lại bước 4


### Luồng ngoại lệ

4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống

1. Hệ thống thông báo không có kế hoạch đang chờ phê duyệt (KeHoachMuaBan)

2. Kết thúc UC

4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)

1. Hệ thống thông báo kế hoạch không còn hiệu lực để phê duyệt (KeHoachMuaBan)

2. Quay lại bước 1

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-02 Đặt đơn hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập hệ thống

**Hậu điều kiện:** Đơn hàng mới được tạo và lưu vào hệ thống với trạng thái “Chờ tiếp nhận”

**Actor chính:** Khách hàng

**Actor phụ:** Không


### Luồng cơ bản

Khách hàng

Hệ thống

1. Chọn chức năng Đặt đơn hàng

2. Hiển thị danh sách hàng mẫu để lựa chọn (MatHang, LoaiHang)

3. Chọn sản phẩm, nhập số lượng, thông tin giao hàng gồm: địa chỉ, ngày nhận hàng trễ nhất, ghi chú (MatHang, ChiTietDonHang, DonHang, KhachHang)

4. Xác nhận đặt hàng

5. Kiểm tra thông tin đơn hàng (DonHang, ChiTietDonHang)

6. Lưu đơn hàng và thông báo đặt hàng thành công (DonHang, ChiTietDonHang, KhachHang)


### Luồng thay thế

4.1 Khách hàng chọn Quay lại

1. Quay lại bước 2


### Luồng ngoại lệ

2.1 Danh sách hàng mẫu không có

1. Hệ thống thông báo danh sách hàng mẫu đang rỗng (MatHang)

2. Kết thúc UC

5.1 Thông tin đơn hàng không hợp lệ

1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)

2. Quay lại bước 3

5.2 Thông tin ngày nhận là ngày trong quá khứ

1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-03 Quản lý đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Danh sách đơn hàng của khách hàng được hiển thị đúng thông tin và có thể thực hiện các chức năng mở rộng

**Actor chính:** Khách hàng

**Actor phụ:** Không


### Luồng cơ bản

Khách hàng

Hệ thống

1. Chọn chức năng Quản lý đơn hàng

2. Hiển thị danh sách đơn hàng hiện có của khách hàng (DonHang, KhachHang)

3. Chọn một đơn hàng để xem chi tiết (DonHang)

4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang)


### Luồng thay thế

1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian

1. Khách hàng nhập điều kiện tìm kiếm (DonHang)

2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang)

3. Quay lại bước 1

4.1 Chọn Sửa đơn hàng

1. Hệ thống thực hiện UC-03.1 Sửa đơn hàng khách hàng


### Luồng ngoại lệ

2.1 Không có đơn hàng nào trong hệ thống

1. Hệ thống thông báo không có đơn hàng nào (DonHang)

2. Kết thúc UC

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-03.1 Sửa đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin đơn hàng khách hàng được cập nhật chính xác trong hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-31 Phê duyệt đơn hàng)

**Actor chính:** Khách hàng

**Actor phụ:** Không


### Luồng cơ bản

Khách hàng

Hệ thống

1. Chọn Sửa đơn hàng (DonHang)

2. Hiển thị form với thông tin hiện tại của đơn hàng (DonHang, ChiTietDonHang)

3. Nhập thông tin muốn chỉnh sửa (số lượng, mô tả) (DonHang, ChiTietDonHang)

4. Chọn xác nhận

5. Kiểm tra thông tin mới (DonHang, ChiTietDonHang)

6. Cập nhật đơn hàng lên hệ thống với trạng thái chờ phê duyệt (DonHang, ChiTietDonHang)

7. Thông báo đơn hàng đã được cập nhật và cần chờ phê duyệt (DonHang, ChiTietDonHang)


### Luồng thay thế

2.1 Khách hàng chọn Quay lại

1. Đi đến bước 4 của UC-03 (hủy thao tác sửa)

5.1 Nếu khách hàng tăng số lượng đơn hàng

1. Hệ thống thông báo thời gian nhận hàng dự kiến có thể tăng tùy theo quy mô đơn hàng (DonHang)

2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)

3. Đi đến bước 6

5.2 Nếu khách hàng giảm số lượng đơn hàng

1. Hệ thống thông báo việc giảm số lượng đơn hàng có thể phải chịu đền bù đặt cọc dựa vào hợp đồng (DonHang, ChiTietDonHang)

2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)

3. Đi đến bước 6


### Luồng ngoại lệ

1.1 Đơn hàng không ở trạng thái cho phép sửa

1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang)

2. Kết thúc use case

5.1 Thông tin nhập không hợp lệ

1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-22 Tra cứu dữ liệu trong kho

**Lưu ý đồng bộ:** Actor đã chốt gồm Quản lý kho và Chủ xưởng. Câu tiền điều kiện/nhãn cột chỉ ghi Quản lý kho trong Word được hiểu áp dụng cho cả hai actor có quyền, theo phạm vi D-12.

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Người dùng xem được thông tin danh mục/dữ liệu phù hợp với nhu cầu tra cứu

**Actor chính:** Quản lý kho, Chủ xưởng

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Tra cứu dữ liệu

2. Hiển thị danh sách danh mục hàng hóa (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

3. Nhập tên (kho, danh mục, nguyên vật liệu, thành phẩm, tồn kho, lô nguyên vật liệu, lô thành phẩm) để tìm kiếm (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

4. Hiển thị các danh mục/dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

5. Chọn một mục để xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

6. Hiển thị thông tin chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)


### Luồng thay thế

5.1 Chỉ xem danh sách, không xem chi tiết

1. Quản lý kho chỉ xem danh sách phù hợp mà không chọn xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

2. Kết thúc use case


### Luồng ngoại lệ

3.1 Không tìm thấy dữ liệu phù hợp

1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)

2. Quay lại bước 3

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.

## UC-16 Xử lý chênh lệch kiểm kê

**Lưu ý đồng bộ:** Chưa chốt hạn mức hoặc trường hợp bắt buộc giám đốc duyệt (D-08). Bước cập nhật tồn trong Word chỉ thực hiện sau phương án hợp lệ/được duyệt theo chính sách đã chốt; không suy ra quyền tự điều chỉnh mọi trường hợp.

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống và đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Chênh lệch kiểm kê được ghi nhận nguyên nhân và phương án xử lý

**Actor chính:** Quản lý kho

**Actor phụ:** Không


### Luồng cơ bản

Quản lý kho

Hệ thống

1. Chọn chức năng Xử lý chênh lệch kiểm kê

2. Hiển thị danh sách mặt hàng có chênh lệch sau kiểm kê (ChiTietPhieuKiemKe, MatHang)

3. Chọn mặt hàng (ChiTietPhieuKiemKe, MatHang)

4. Hiển thị thông tin chi tiết mặt hàng gồm: loại hàng, số lượng, bị vấn đề gì (ChiTietPhieuKiemKe, MatHang, LoaiHang, LoHang)

5. Nhập đề xuất xử lý (PhieuKiemKe, ChiTietPhieuKiemKe)

4. Xác nhận xử lý chênh lệch (ChiTietPhieuKiemKe)

6. Cập nhật tồn kho theo phương án xử lý và lưu kết quả (TonKho, ChiTietPhieuKiemKe)


### Luồng thay thế

4.1 Chênh lệch vượt hạn mức xử lý

1. Nếu quản lý cảm thấy mức độ chênh lệch và độ nghiêm trọng cao có thể gửi đề xuất xử lý cho Ban giám đốc (BanDeXuatXuLyNgoaiLe)

2. Hệ thống chuyển đề xuất xử lý sang chờ phê duyệt (BanDeXuatXuLyNgoaiLe)

3. Kết thúc use case


### Luồng ngoại lệ

2.1 Không có chênh lệch cần xử lý

1. Hệ thống thông báo không có mặt hàng chênh lệch (PhieuKiemKe, ChiTietPhieuKiemKe)

2. Kết thúc use case

**Ràng buộc bổ sung:** Xem dòng tương ứng trong [MODULE_MATRIX.md](MODULE_MATRIX.md). Nội dung này là yêu cầu mục tiêu; chưa khẳng định đã triển khai hoặc pass kiểm thử.
