# Test case đối soát DOCX ngày 28/10/2026

Mỗi case là yêu cầu kiểm riêng, không mặc định PASS. Kết quả bộ test có trong log; các case dưới chưa gắn assert cụ thể được ghi CHƯA CÓ BẰNG CHỨNG RIÊNG.

## UC-29

Tiền điều kiện: PLANNER đăng nhập, có đơn SUBMITTED chưa tiếp nhận.

- **UC-29-MAIN-01** [MAIN] 1. Mở danh sách đơn chờ tiếp nhận. -> 2. Hiển thị các đơn trong phạm vi và trạng thái.
3. Xem chi tiết khách, địa chỉ, ngày, ghi chú và dòng hàng. -> 4. Trả dữ liệu đơn/dòng hiện tại.
5. Chọn Tiếp nhận. -> 6. Khóa/kiểm version và SUBMITTED; cập nhật RECEIVED, ghi nhận kết quả; planner có thể lập KHSX ở UC-04.
  Kết quả yêu cầu: Đơn hiện có sang RECEIVED, tăng version/lưu lịch sử; không tạo phiếu tiếp nhận riêng, không tự duyệt KHSX/đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-29-ALT-02** [ALT] A1. Hủy/đóng chi tiết chỉ xem, không tiếp nhận.
  Kết quả yêu cầu: A1. Hủy/đóng chi tiết chỉ xem, không tiếp nhận.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-29-ALT-03** [ALT] A2. Đơn đã tiếp nhận dùng làm nguồn KHSX; không chuyển thẳng sang chờ giám đốc duyệt đơn trực tiếp.
  Kết quả yêu cầu: A2. Đơn đã tiếp nhận dùng làm nguồn KHSX; không chuyển thẳng sang chờ giám đốc duyệt đơn trực tiếp.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-29-EX-04** [EX] E1. Hai planner tiếp nhận cùng version: không tiếp nhận hai lần; một thao tác stale/invalid state.
  Kết quả yêu cầu: E1. Hai planner tiếp nhận cùng version: không tiếp nhận hai lần; một thao tác stale/invalid state.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-29-EX-05** [EX] E2. Không có đơn mới: danh sách rỗng bình thường.
  Kết quả yêu cầu: E2. Không có đơn mới: danh sách rỗng bình thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-06

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn đúng loại danh mục hàng.

- **UC-06-MAIN-01** [MAIN] 1. Mở Danh mục → Thành phẩm hoặc Nguyên vật liệu. -> 2. Hiển thị các danh mục hoạt động đúng nhánh; Bao bì nằm trong Nguyên vật liệu.
3. Chọn danh mục để xem mặt hàng; hoặc chọn thao tác Thêm/Sửa/Xóa được phép. -> 4. Form gồm mã khi tạo, tên, nhóm danh mục, mô tả, trạng thái và ảnh; sửa không đổi mã tùy tiện.
5. Lưu hoặc xác nhận Xóa. -> 6. Kiểm dữ liệu, mã trùng và tham chiếu; lưu đúng danh mục hoặc chặn; ảnh được xử lý theo quyền.
  Kết quả yêu cầu: Danh mục hiển thị/tạo/sửa/xóa theo thao tác được phép; không tự làm đổi tồn kho.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-ALT-02** [ALT] A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Kết quả yêu cầu: A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-ALT-03** [ALT] A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Kết quả yêu cầu: A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-ALT-04** [ALT] A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Kết quả yêu cầu: A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-EX-05** [EX] E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Kết quả yêu cầu: E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-EX-06** [EX] E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Kết quả yêu cầu: E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06-EX-07** [EX] E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Kết quả yêu cầu: E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-06.1

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn đúng loại danh mục hàng.

- **UC-06.1-MAIN-01** [MAIN] 1. Mở danh mục/dữ liệu đúng nhóm và chọn Thêm. -> 2. Hiển thị các danh mục hoạt động đúng nhánh; Bao bì nằm trong Nguyên vật liệu.
3. Chọn danh mục để xem mặt hàng; hoặc chọn thao tác Thêm/Sửa/Xóa được phép. -> 4. Form gồm mã khi tạo, tên, nhóm danh mục, mô tả, trạng thái và ảnh; sửa không đổi mã tùy tiện.
5. Lưu hoặc xác nhận Xóa. -> 6. Kiểm dữ liệu, mã trùng và tham chiếu; lưu đúng danh mục hoặc chặn; ảnh được xử lý theo quyền.
  Kết quả yêu cầu: Thêm đúng một danh mục mới với mã/nhóm/tên/ảnh và trạng thái hợp lệ; không tạo mặt hàng hoặc tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-ALT-02** [ALT] A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Kết quả yêu cầu: A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-ALT-03** [ALT] A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Kết quả yêu cầu: A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-ALT-04** [ALT] A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Kết quả yêu cầu: A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-EX-05** [EX] E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Kết quả yêu cầu: E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-EX-06** [EX] E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Kết quả yêu cầu: E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.1-EX-07** [EX] E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Kết quả yêu cầu: E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-06.2

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn đúng loại danh mục hàng.

- **UC-06.2-MAIN-01** [MAIN] 1. Chọn đối tượng rồi Xóa. -> 2. Hiển thị xác nhận; chưa thay đổi dữ liệu.
3. Đồng ý hoặc Hủy. -> 4. Đồng ý thì kiểm quyền, version khi áp dụng và toàn bộ tham chiếu/tồn/chứng từ; chỉ xóa khi đủ điều kiện, nếu không báo không thể xóa. Hủy giữ dữ liệu.
  Kết quả yêu cầu: Xóa danh mục chỉ khi chưa bị tham chiếu; không xóa mặt hàng/chứng từ để vượt ràng buộc.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.2-ALT-02** [ALT] A1. Hủy hộp xác nhận: không xóa, giữ danh sách/chi tiết.
  Kết quả yêu cầu: A1. Hủy hộp xác nhận: không xóa, giữ danh sách/chi tiết.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.2-ALT-03** [ALT] A2. Đối tượng có chứng từ/tham chiếu phải giữ lịch sử; không dùng xóa để thay cho điều chỉnh nghiệp vụ.
  Kết quả yêu cầu: A2. Đối tượng có chứng từ/tham chiếu phải giữ lịch sử; không dùng xóa để thay cho điều chỉnh nghiệp vụ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.2-EX-04** [EX] E1. Đối tượng đang được sử dụng, còn tồn/tham chiếu hoặc không tồn tại: chặn xóa theo resource.
  Kết quả yêu cầu: E1. Đối tượng đang được sử dụng, còn tồn/tham chiếu hoặc không tồn tại: chặn xóa theo resource.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.2-EX-05** [EX] E2. Sai quyền, trường ngoài hợp đồng hoặc version cũ khi resource yêu cầu version: không xóa.
  Kết quả yêu cầu: E2. Sai quyền, trường ngoài hợp đồng hoặc version cũ khi resource yêu cầu version: không xóa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-06.3

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn đúng loại danh mục hàng.

- **UC-06.3-MAIN-01** [MAIN] 1. Chọn đối tượng rồi Sửa. -> 2. Hiển thị thông tin hiện tại và chỉ các trường được phép sửa.
3. Sửa thông tin và Lưu hoặc Hủy. -> 4. Kiểm dữ liệu/version/tham chiếu; lưu/audit nếu hợp lệ, không đổi các trường nguồn bất biến. Hủy giữ bản cũ.
  Kết quả yêu cầu: Cập nhật trường được phép của danh mục; giữ mã và ảnh cũ nếu không yêu cầu thay/bỏ; không đổi nhóm trái với mặt hàng hoạt động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-ALT-02** [ALT] A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Kết quả yêu cầu: A1. Bấm danh mục đưa tới mặt hàng được lọc sẵn theo nhóm/danh mục.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-ALT-03** [ALT] A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Kết quả yêu cầu: A2. Chọn ảnh PNG/JPEG/WebP, xem trước; thay/bỏ ảnh có chủ ý. Chỉ cập nhật thông tin khác phải giữ ảnh cũ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-ALT-04** [ALT] A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Kết quả yêu cầu: A3. Hủy tạo/sửa/xóa giữ dữ liệu server. Không có thao tác “Nhập lại” riêng thì sửa trực tiếp các ô, không mô tả nút không tồn tại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-EX-05** [EX] E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Kết quả yêu cầu: E1. Mã trùng bị chặn; không khẳng định tên là duy nhất nếu DB/API chỉ ràng buộc mã. Thiếu mã/tên, sai loại, quá độ dài, trường ngoài hợp đồng: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-EX-06** [EX] E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Kết quả yêu cầu: E2. Danh mục đang được mặt hàng tham chiếu không xóa; đổi nhóm không khớp mặt hàng hoạt động bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-06.3-EX-07** [EX] E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Kết quả yêu cầu: E3. Ảnh quá 5 MB, MIME/bytes sai, SVG/đường dẫn giả/ngoài thư mục cho phép: từ chối. Không mô tả trường số âm nếu form danh mục không có trường số.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-07

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn resource Mặt hàng/Kho/Vị trí/NCC/Lô đúng quyền; FK nguồn hoạt động khi được yêu cầu.

- **UC-07-MAIN-01** [MAIN] 1. Mở dữ liệu danh mục hoặc mặt hàng của danh mục đã chọn. -> 2. Hiển thị bảng, chi tiết và trường theo resource; không dùng form mặt hàng cho tất cả resource.
3. Thêm/sửa các trường được phép hoặc yêu cầu xóa. -> 4. Kiểm mã, loại, đơn vị, liên kết, số/giá, trạng thái và version khi yêu cầu.
5. Lưu/xác nhận. -> 6. Ghi/audit hoặc báo điều kiện không cho phép; không tác động tồn nếu chưa có phiếu kho được ghi.
  Kết quả yêu cầu: Dữ liệu danh mục lưu đúng resource; lô thực nhận ghi nhận nguồn/chi tiết, chưa tăng tồn chỉ vì thêm dữ liệu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-ALT-02** [ALT] A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Kết quả yêu cầu: A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-ALT-03** [ALT] A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Kết quả yêu cầu: A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-ALT-04** [ALT] A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Kết quả yêu cầu: A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-EX-05** [EX] E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Kết quả yêu cầu: E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-EX-06** [EX] E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Kết quả yêu cầu: E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07-EX-07** [EX] E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Kết quả yêu cầu: E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-07.1

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn resource Mặt hàng/Kho/Vị trí/NCC/Lô đúng quyền; FK nguồn hoạt động khi được yêu cầu.

- **UC-07.1-MAIN-01** [MAIN] 1. Mở danh mục/dữ liệu đúng nhóm và chọn Thêm. -> 2. Hiển thị bảng, chi tiết và trường theo resource; không dùng form mặt hàng cho tất cả resource.
3. Thêm/sửa các trường được phép hoặc yêu cầu xóa. -> 4. Kiểm mã, loại, đơn vị, liên kết, số/giá, trạng thái và version khi yêu cầu.
5. Lưu/xác nhận. -> 6. Ghi/audit hoặc báo điều kiện không cho phép; không tác động tồn nếu chưa có phiếu kho được ghi.
  Kết quả yêu cầu: Thêm một bản ghi đúng loại dữ liệu và nguồn hợp lệ; không tự tạo tồn kho.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-ALT-02** [ALT] A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Kết quả yêu cầu: A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-ALT-03** [ALT] A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Kết quả yêu cầu: A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-ALT-04** [ALT] A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Kết quả yêu cầu: A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-EX-05** [EX] E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Kết quả yêu cầu: E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-EX-06** [EX] E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Kết quả yêu cầu: E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.1-EX-07** [EX] E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Kết quả yêu cầu: E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-07.2

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn resource Mặt hàng/Kho/Vị trí/NCC/Lô đúng quyền; FK nguồn hoạt động khi được yêu cầu.

- **UC-07.2-MAIN-01** [MAIN] 1. Chọn đối tượng rồi Xóa. -> 2. Hiển thị xác nhận; chưa thay đổi dữ liệu.
3. Đồng ý hoặc Hủy. -> 4. Đồng ý thì kiểm quyền, version khi áp dụng và toàn bộ tham chiếu/tồn/chứng từ; chỉ xóa khi đủ điều kiện, nếu không báo không thể xóa. Hủy giữ dữ liệu.
  Kết quả yêu cầu: Xóa bản ghi chưa được sử dụng khi service cho phép; dữ liệu có tham chiếu được bảo vệ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.2-ALT-02** [ALT] A1. Hủy hộp xác nhận: không xóa, giữ danh sách/chi tiết.
  Kết quả yêu cầu: A1. Hủy hộp xác nhận: không xóa, giữ danh sách/chi tiết.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.2-ALT-03** [ALT] A2. Đối tượng có chứng từ/tham chiếu phải giữ lịch sử; không dùng xóa để thay cho điều chỉnh nghiệp vụ.
  Kết quả yêu cầu: A2. Đối tượng có chứng từ/tham chiếu phải giữ lịch sử; không dùng xóa để thay cho điều chỉnh nghiệp vụ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.2-EX-04** [EX] E1. Đối tượng đang được sử dụng, còn tồn/tham chiếu hoặc không tồn tại: chặn xóa theo resource.
  Kết quả yêu cầu: E1. Đối tượng đang được sử dụng, còn tồn/tham chiếu hoặc không tồn tại: chặn xóa theo resource.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.2-EX-05** [EX] E2. Sai quyền, trường ngoài hợp đồng hoặc version cũ khi resource yêu cầu version: không xóa.
  Kết quả yêu cầu: E2. Sai quyền, trường ngoài hợp đồng hoặc version cũ khi resource yêu cầu version: không xóa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-07.3

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập; chọn resource Mặt hàng/Kho/Vị trí/NCC/Lô đúng quyền; FK nguồn hoạt động khi được yêu cầu.

- **UC-07.3-MAIN-01** [MAIN] 1. Chọn đối tượng rồi Sửa. -> 2. Hiển thị thông tin hiện tại và chỉ các trường được phép sửa.
3. Sửa thông tin và Lưu hoặc Hủy. -> 4. Kiểm dữ liệu/version/tham chiếu; lưu/audit nếu hợp lệ, không đổi các trường nguồn bất biến. Hủy giữ bản cũ.
  Kết quả yêu cầu: Cập nhật các trường được phép đúng resource và version khi áp dụng; không tùy đổi nguồn/nhóm/đơn vị/mã bất biến.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-ALT-02** [ALT] A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Kết quả yêu cầu: A1. Mặt hàng tạo có danh mục, đơn vị, mã, tên, MATERIAL/FINISHED_PRODUCT, mô tả, giá tham khảo, cờ mẫu/công bố/hoạt động; nhóm phải khớp danh mục. Sửa chỉ các trường được API cho phép, không tùy đổi mã/nhóm/đơn vị qua form sửa thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-ALT-03** [ALT] A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Kết quả yêu cầu: A2. Kho có mã/tên/địa chỉ; vị trí có kho/mã/tên; NCC có mã/tên/liên hệ/thuế. Lô NVL theo dòng đơn mua còn được nhận; không tự lập lô ảo ngay lúc đặt mua.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-ALT-04** [ALT] A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Kết quả yêu cầu: A3. Đơn vị/giá NVL theo NCC có màn hình riêng: quản lý sửa, purchaser xem/nhận giá gợi ý; không gửi bảng giá NCC cho khách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-EX-05** [EX] E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Kết quả yêu cầu: E1. Mã trùng, thiếu bắt buộc, loại/đơn vị/danh mục/NCC không hợp lệ, sai số/giá, email/điện thoại sai hợp đồng: chặn theo resource.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-EX-06** [EX] E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Kết quả yêu cầu: E2. Mặt hàng/kho/vị trí/NCC/lô có tồn, chứng từ hoặc tham chiếu được bảo vệ: không xóa phá lịch sử. Không coi mọi xóa là xóa mềm nếu service đang chặn hoặc xóa thật khi chưa dùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-07.3-EX-07** [EX] E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Kết quả yêu cầu: E3. Đổi đơn vị NVL đã có lô/đơn mua/dòng kế hoạch bị chặn; số thập phân nhập dấu phẩy, giá 0 được phép khi API cho phép, lượng thực nhận phải dương.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-08

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập, có quyền xem hồ sơ phiếu kho.

- **UC-08-MAIN-01** [MAIN] 1. Mở Quản lý nhập kho hoặc Quản lý xuất kho. -> 2. Lọc đúng loại IN/OUT, hiển thị mã, nguồn, thời gian, trạng thái, phân trang.
3. Tìm phiếu và mở chi tiết. -> 4. Hiển thị nguồn yêu cầu/công việc, mặt hàng, lô/vị trí, lượng thực tế và người ghi; phân biệt bản nháp và POSTED.
  Kết quả yêu cầu: Chỉ đọc phiếu IN cho UC-08 hoặc OUT cho UC-09; không ghi mới/điều chỉnh tồn khi xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-08-ALT-02** [ALT] A1. Đổi bộ lọc, xóa lọc, chuyển trang hoặc quay lại danh sách.
  Kết quả yêu cầu: A1. Đổi bộ lọc, xóa lọc, chuyển trang hoặc quay lại danh sách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-08-ALT-03** [ALT] A2. Muốn nhập/xuất mới phải qua phân công và UC-10/11, không chỉnh phiếu POSTED ngay trên hồ sơ.
  Kết quả yêu cầu: A2. Muốn nhập/xuất mới phải qua phân công và UC-10/11, không chỉnh phiếu POSTED ngay trên hồ sơ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-08-EX-04** [EX] E1. Phiếu không tồn tại/không đúng phạm vi hoặc query sai: báo lỗi; danh sách rỗng không phải lỗi.
  Kết quả yêu cầu: E1. Phiếu không tồn tại/không đúng phạm vi hoặc query sai: báo lỗi; danh sách rỗng không phải lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-08-EX-05** [EX] E2. Không nhầm nhãn “phiếu nhập” trong UC-09: tất cả dữ liệu/nhãn nhánh này là phiếu xuất.
  Kết quả yêu cầu: E2. Không nhầm nhãn “phiếu nhập” trong UC-09: tất cả dữ liệu/nhãn nhánh này là phiếu xuất.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-09

Tiền điều kiện: WAREHOUSE_MANAGER đăng nhập, có quyền xem hồ sơ phiếu kho.

- **UC-09-MAIN-01** [MAIN] 1. Mở Quản lý nhập kho hoặc Quản lý xuất kho. -> 2. Lọc đúng loại IN/OUT, hiển thị mã, nguồn, thời gian, trạng thái, phân trang.
3. Tìm phiếu và mở chi tiết. -> 4. Hiển thị nguồn yêu cầu/công việc, mặt hàng, lô/vị trí, lượng thực tế và người ghi; phân biệt bản nháp và POSTED.
  Kết quả yêu cầu: Chỉ đọc phiếu IN cho UC-08 hoặc OUT cho UC-09; không ghi mới/điều chỉnh tồn khi xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-09-ALT-02** [ALT] A1. Đổi bộ lọc, xóa lọc, chuyển trang hoặc quay lại danh sách.
  Kết quả yêu cầu: A1. Đổi bộ lọc, xóa lọc, chuyển trang hoặc quay lại danh sách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-09-ALT-03** [ALT] A2. Muốn nhập/xuất mới phải qua phân công và UC-10/11, không chỉnh phiếu POSTED ngay trên hồ sơ.
  Kết quả yêu cầu: A2. Muốn nhập/xuất mới phải qua phân công và UC-10/11, không chỉnh phiếu POSTED ngay trên hồ sơ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-09-EX-04** [EX] E1. Phiếu không tồn tại/không đúng phạm vi hoặc query sai: báo lỗi; danh sách rỗng không phải lỗi.
  Kết quả yêu cầu: E1. Phiếu không tồn tại/không đúng phạm vi hoặc query sai: báo lỗi; danh sách rỗng không phải lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-09-EX-05** [EX] E2. Không nhầm nhãn “phiếu nhập” trong UC-09: tất cả dữ liệu/nhãn nhánh này là phiếu xuất.
  Kết quả yêu cầu: E2. Không nhầm nhãn “phiếu nhập” trong UC-09: tất cả dữ liệu/nhãn nhánh này là phiếu xuất.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-13

Tiền điều kiện: DIRECTOR đăng nhập; có nguồn hợp lệ và nhân viên QC/AC/Ban kiểm kê hoạt động.

- **UC-13-MAIN-01** [MAIN] 1. Mở Lập đợt kiểm kê (không tạo mới từ Quản lý công việc). -> 2. Hiển thị nhóm Thành phẩm/Nguyên vật liệu, nguồn lô, phần lô, tên/ưu tiên/địa điểm, ngày giờ, mô tả và chọn nhân viên.
3. Chọn nhóm và nguồn; chọn từng phần thực nhận/báo cáo thành phẩm đã gửi; chọn nhân viên theo hai nhãn và xác nhận danh sách. -> 4. Chỉ chấp nhận QC/AC và Ban kiểm kê. Chọn QC là kiểm chất lượng; Ban kiểm kê là kiểm lượng; chọn cả hai làm cả hai, không thêm selector loại đợt riêng.
5. Chọn một người trong danh sách làm người lập biên bản chung; đặt lịch và lưu. -> 6. Kiểm nguồn, lịch, trùng phân công; tạo đợt/công việc/nhân viên, thông báo công việc và thông báo riêng người lập.
  Kết quả yêu cầu: Tạo đợt kiểm kê và CôngViec liên kết; gắn đúng phần lô nếu có, phân công nhóm và người lập biên bản; gửi thông báo. Chưa tạo QC/số đếm/tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-ALT-02** [ALT] A1. Thành phẩm: chọn đầu lô → chọn một/nhiều báo cáo phần đã SUBMITTED; mỗi phần là một báo cáo UC-35, không phải UC-34 tiến độ. Phần đã giao kiểm/đã có kết quả không chọn lại.
  Kết quả yêu cầu: A1. Thành phẩm: chọn đầu lô → chọn một/nhiều báo cáo phần đã SUBMITTED; mỗi phần là một báo cáo UC-35, không phải UC-34 tiến độ. Phần đã giao kiểm/đã có kết quả không chọn lại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-ALT-03** [ALT] A2. NVL: chọn lô hoặc kế hoạch MUA đã duyệt; ngay trong form chọn từng phần thực nhận chờ QC. Chưa có hàng thì cho lập dự kiến, không coi đã đặt mua là có lô. Khi có thực nhận, bổ sung qua chi tiết công việc.
  Kết quả yêu cầu: A2. NVL: chọn lô hoặc kế hoạch MUA đã duyệt; ngay trong form chọn từng phần thực nhận chờ QC. Chưa có hàng thì cho lập dự kiến, không coi đã đặt mua là có lô. Khi có thực nhận, bổ sung qua chi tiết công việc.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-ALT-04** [ALT] A3. Mở hồ sơ để bắt đầu: chỉ có phần thực tế mới bắt đầu được. Chưa tới ngày nhận: bị chặn; tick Giả lập thử nghiệm mới cho bắt đầu sớm, vẫn kiểm quyền/lô.
  Kết quả yêu cầu: A3. Mở hồ sơ để bắt đầu: chỉ có phần thực tế mới bắt đầu được. Chưa tới ngày nhận: bị chặn; tick Giả lập thử nghiệm mới cho bắt đầu sớm, vẫn kiểm quyền/lô.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-ALT-05** [ALT] A4. Có thể giao nhiều nhân viên mỗi nhóm, chọn cả hai nhóm; người lập biên bản có thể là QC hoặc Ban kiểm kê trong danh sách.
  Kết quả yêu cầu: A4. Có thể giao nhiều nhân viên mỗi nhóm, chọn cả hai nhóm; người lập biên bản có thể là QC hoặc Ban kiểm kê trong danh sách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-EX-06** [EX] E1. Không chọn phần khi có phần thực nhận, lô sai nguồn/nhóm, chưa gửi báo cáo, phần đã được giao hoặc trùng ID: chặn.
  Kết quả yêu cầu: E1. Không chọn phần khi có phần thực nhận, lô sai nguồn/nhóm, chưa gửi báo cáo, phần đã được giao hoặc trùng ID: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-EX-07** [EX] E2. Ngày không quá khứ, kết thúc sau bắt đầu, bắt đầu không trước ngày nhận nguồn; lịch giao nhau của nhân viên bị chặn.
  Kết quả yêu cầu: E2. Ngày không quá khứ, kết thúc sau bắt đầu, bắt đầu không trước ngày nhận nguồn; lịch giao nhau của nhân viên bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-13-EX-08** [EX] E3. Người không hoạt động/sai vai trò, trùng danh sách hoặc người lập không thuộc phân công: không tạo. Không thêm nhân viên quản lý/nhân viên kho vào đợt QC/kiểm đếm bằng form này.
  Kết quả yêu cầu: E3. Người không hoạt động/sai vai trò, trùng danh sách hoặc người lập không thuộc phân công: không tạo. Không thêm nhân viên quản lý/nhân viên kho vào đợt QC/kiểm đếm bằng form này.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-17

Tiền điều kiện: Có đề xuất đúng phạm vi đang PENDING_APPROVAL và tài khoản đúng người duyệt theo loại.

- **UC-17-MAIN-01** [MAIN] 1. Mở ngoại lệ chờ phản hồi của mình. -> 2. Hiển thị nguồn biên bản/lô, kết quả kiểm và phương án quản lý gửi.
3. Chọn Đồng ý hoặc Không đồng ý. -> 4. Đồng ý giữ phương án; Không đồng ý yêu cầu nhập phương án xử lý theo ý chủ xưởng.
5. Xác nhận quyết định. -> 6. Kiểm quyền/xưởng/version/trạng thái; lưu kết quả và thông báo người xử lý.
  Kết quả yêu cầu: Ghi quyết định/lý do và thông báo quản lý; duyệt không tự áp dụng biến động tồn. Chỉ quản lý thực hiện ở bước riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-17-ALT-02** [ALT] A1. Người duyệt hủy form không đổi trạng thái.
  Kết quả yêu cầu: A1. Người duyệt hủy form không đổi trạng thái.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-17-ALT-03** [ALT] A2. Luồng điều chỉnh tồn thuộc DIRECTOR theo nguồn kỹ thuật; người lập không tự duyệt; từ chối có lý do, áp dụng sau duyệt là bước khác.
  Kết quả yêu cầu: A2. Luồng điều chỉnh tồn thuộc DIRECTOR theo nguồn kỹ thuật; người lập không tự duyệt; từ chối có lý do, áp dụng sau duyệt là bước khác.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-17-EX-04** [EX] E1. Từ chối không nhập lý do/phương án thay thế: chặn; quản lý không được thay chỉ đạo đã phê duyệt.
  Kết quả yêu cầu: E1. Từ chối không nhập lý do/phương án thay thế: chặn; quản lý không được thay chỉ đạo đã phê duyệt.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-17-EX-05** [EX] E2. Người khác xưởng, đề xuất đã xử lý/version cũ hoặc tự duyệt: chặn, tải lại hồ sơ.
  Kết quả yêu cầu: E2. Người khác xưởng, đề xuất đã xử lý/version cũ hoặc tự duyệt: chặn, tải lại hồ sơ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-18

Tiền điều kiện: Đăng nhập và đúng quyền loại báo cáo/hồ sơ.

- **UC-18-MAIN-01** [MAIN] 1. Mở loại báo cáo/hồ sơ cần xem. -> 2. Hiển thị bộ lọc thực tế của từng báo cáo và danh sách phân trang.
3. Nhập điều kiện rồi Lọc. -> 4. Truy vấn nguồn phiếu/biến động/kiểm kê đúng loại và phạm vi; hiển thị kết quả, thời điểm tổng hợp.
5. Xem chi tiết hoặc Xuất CSV nếu màn hình có nút. -> 6. Xuất theo chính bộ lọc được hỗ trợ; không coi CSV là Excel/PDF.
  Kết quả yêu cầu: Chỉ đọc hoặc xuất CSV trong quyền, không tạo entity hồ sơ mới và không làm thay đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-ALT-02** [ALT] A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Kết quả yêu cầu: A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-ALT-03** [ALT] A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Kết quả yêu cầu: A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-ALT-04** [ALT] A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Kết quả yêu cầu: A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-EX-05** [EX] E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Kết quả yêu cầu: E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-EX-06** [EX] E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Kết quả yêu cầu: E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-EX-07** [EX] E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Kết quả yêu cầu: E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-18-EX-08** [EX] E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Kết quả yêu cầu: E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-19

Tiền điều kiện: Đăng nhập và đúng quyền loại báo cáo/hồ sơ.

- **UC-19-MAIN-01** [MAIN] 1. Mở loại báo cáo/hồ sơ cần xem. -> 2. Hiển thị bộ lọc thực tế của từng báo cáo và danh sách phân trang.
3. Nhập điều kiện rồi Lọc. -> 4. Truy vấn nguồn phiếu/biến động/kiểm kê đúng loại và phạm vi; hiển thị kết quả, thời điểm tổng hợp.
5. Xem chi tiết hoặc Xuất CSV nếu màn hình có nút. -> 6. Xuất theo chính bộ lọc được hỗ trợ; không coi CSV là Excel/PDF.
  Kết quả yêu cầu: Chỉ đọc hoặc xuất CSV trong quyền, không tạo entity hồ sơ mới và không làm thay đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-ALT-02** [ALT] A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Kết quả yêu cầu: A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-ALT-03** [ALT] A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Kết quả yêu cầu: A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-ALT-04** [ALT] A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Kết quả yêu cầu: A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-EX-05** [EX] E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Kết quả yêu cầu: E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-EX-06** [EX] E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Kết quả yêu cầu: E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-EX-07** [EX] E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Kết quả yêu cầu: E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-EX-08** [EX] E4. Chủ xưởng chỉ đọc phiếu có yêu cầu thuộc workshop_ids của tài khoản; API lọc r.workshop_id trong truy vấn. Phiếu ngoài xưởng hoặc không thuộc nguồn phạm vi không được đưa vào hồ sơ của chủ xưởng.
  Kết quả yêu cầu: E4. Chủ xưởng chỉ đọc phiếu có yêu cầu thuộc workshop_ids của tài khoản; API lọc r.workshop_id trong truy vấn. Phiếu ngoài xưởng hoặc không thuộc nguồn phạm vi không được đưa vào hồ sơ của chủ xưởng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-19-EX-09** [EX] E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Kết quả yêu cầu: E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-20

Tiền điều kiện: Đăng nhập và đúng quyền loại báo cáo/hồ sơ.

- **UC-20-MAIN-01** [MAIN] 1. Mở loại báo cáo/hồ sơ cần xem. -> 2. Hiển thị bộ lọc thực tế của từng báo cáo và danh sách phân trang.
3. Nhập điều kiện rồi Lọc. -> 4. Truy vấn nguồn phiếu/biến động/kiểm kê đúng loại và phạm vi; hiển thị kết quả, thời điểm tổng hợp.
5. Xem chi tiết hoặc Xuất CSV nếu màn hình có nút. -> 6. Xuất theo chính bộ lọc được hỗ trợ; không coi CSV là Excel/PDF.
  Kết quả yêu cầu: Chỉ đọc hoặc xuất CSV trong quyền, không tạo entity hồ sơ mới và không làm thay đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-ALT-02** [ALT] A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Kết quả yêu cầu: A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-ALT-03** [ALT] A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Kết quả yêu cầu: A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-ALT-04** [ALT] A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Kết quả yêu cầu: A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-EX-05** [EX] E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Kết quả yêu cầu: E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-EX-06** [EX] E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Kết quả yêu cầu: E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-EX-07** [EX] E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Kết quả yêu cầu: E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-EX-08** [EX] E4. Chủ xưởng chỉ đọc phiếu có yêu cầu thuộc workshop_ids của tài khoản; API lọc r.workshop_id trong truy vấn. Phiếu ngoài xưởng hoặc không thuộc nguồn phạm vi không được đưa vào hồ sơ của chủ xưởng.
  Kết quả yêu cầu: E4. Chủ xưởng chỉ đọc phiếu có yêu cầu thuộc workshop_ids của tài khoản; API lọc r.workshop_id trong truy vấn. Phiếu ngoài xưởng hoặc không thuộc nguồn phạm vi không được đưa vào hồ sơ của chủ xưởng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-20-EX-09** [EX] E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Kết quả yêu cầu: E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-21

Tiền điều kiện: Đăng nhập và đúng quyền loại báo cáo/hồ sơ.

- **UC-21-MAIN-01** [MAIN] 1. Mở loại báo cáo/hồ sơ cần xem. -> 2. Hiển thị bộ lọc thực tế của từng báo cáo và danh sách phân trang.
3. Nhập điều kiện rồi Lọc. -> 4. Truy vấn nguồn phiếu/biến động/kiểm kê đúng loại và phạm vi; hiển thị kết quả, thời điểm tổng hợp.
5. Xem chi tiết hoặc Xuất CSV nếu màn hình có nút. -> 6. Xuất theo chính bộ lọc được hỗ trợ; không coi CSV là Excel/PDF.
  Kết quả yêu cầu: Chỉ đọc hoặc xuất CSV trong quyền, không tạo entity hồ sơ mới và không làm thay đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-ALT-02** [ALT] A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Kết quả yêu cầu: A1. UC-18: kho, hàng, loại, lô, bucket và mốc as_of hợp lệ không ở tương lai; tổng hợp biến động đến mốc, không dùng tồn hiện tại thay số lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-ALT-03** [ALT] A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Kết quả yêu cầu: A2. UC-19 chỉ OUT, UC-20 chỉ IN; từ ngày ≤ đến ngày. Hồ sơ chủ xưởng qua truy vấn có phạm vi xưởng; không suy quyền đọc hồ sơ mọi xưởng chỉ từ quyền xem kho chung.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-ALT-04** [ALT] A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Kết quả yêu cầu: A3. UC-21 đối chiếu báo cáo kiểm kê kho cũ và biên bản phần lô mới riêng; không mặc định báo cáo legacy đã bao phủ mọi biên bản công việc nếu truy vấn chưa có dữ liệu đó.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-EX-05** [EX] E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Kết quả yêu cầu: E1. Sai quyền/ID/kho/loại/bucket/ngày/query; khoảng ngày ngược hoặc as_of tương lai: báo lỗi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-EX-06** [EX] E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Kết quả yêu cầu: E2. Export chỉ CSV, tối đa 50.000 dòng; vượt giới hạn phải thu hẹp bộ lọc, không âm thầm cắt file.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-EX-07** [EX] E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Kết quả yêu cầu: E3. Không có kết quả: bảng rỗng/CSV không dữ liệu phù hợp; không tạo số tồn/báo cáo giả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-21-EX-08** [EX] E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Kết quả yêu cầu: E-CSV. Lỗi đã tái hiện: nút Xuất CSV hiện gửi thiếu format=csv, trả 422 “Chỉ hỗ trợ CSV.” trên báo cáo tồn/phiếu kho/kiểm kê. API xuất với format=csv trả 200 text/csv. Đây là lỗi giao diện cần sửa, không xóa yêu cầu xuất báo cáo khỏi đặc tả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-25

Tiền điều kiện: Đúng vai trò/phạm vi.

- **UC-25-MAIN-01** [MAIN] 1. Mở Quản lý công việc. -> 2. Hiển thị danh sách theo vai trò, trạng thái và người được phân công.
3. Mở chi tiết. -> 4. Hiển thị tên, mô tả, lịch, ưu tiên, nhân viên, đợt/lô/phần liên quan, người lập biên bản và thao tác phù hợp.
  Kết quả yêu cầu: Hiển thị công việc, tiến độ/phân công và liên kết đợt; xem không tạo đợt mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25-ALT-02** [ALT] A1. Giám đốc sửa UC-25.1 hoặc hủy UC-25.2; đổi người lập biên bản trong danh sách đã phân công trước khi gửi biên bản.
  Kết quả yêu cầu: A1. Giám đốc sửa UC-25.1 hoặc hủy UC-25.2; đổi người lập biên bản trong danh sách đã phân công trước khi gửi biên bản.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25-ALT-03** [ALT] A2. Tạo đợt kiểm kê chỉ ở UC-13. Công việc không có nút tạo mới kiểm kê/QC riêng.
  Kết quả yêu cầu: A2. Tạo đợt kiểm kê chỉ ở UC-13. Công việc không có nút tạo mới kiểm kê/QC riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25-ALT-04** [ALT] A3. Đợt dự kiến NVL có thể bổ sung phần thực nhận, bắt đầu thường hoặc giả lập sớm; người được giao thực hiện UC-12.1/15.
  Kết quả yêu cầu: A3. Đợt dự kiến NVL có thể bổ sung phần thực nhận, bắt đầu thường hoặc giả lập sớm; người được giao thực hiện UC-12.1/15.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25-EX-05** [EX] E1. Nhân viên ngoài phân công không được mở chi tiết/API, dù biết ID.
  Kết quả yêu cầu: E1. Nhân viên ngoài phân công không được mở chi tiết/API, dù biết ID.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25-EX-06** [EX] E2. Không có dữ liệu hiển thị bảng rỗng; nút/số huy hiệu không tự cấp quyền.
  Kết quả yêu cầu: E2. Không có dữ liệu hiển thị bảng rỗng; nút/số huy hiệu không tự cấp quyền.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-25.1

Tiền điều kiện: Công việc còn được chỉnh sửa, version mới; thay người lập phải thuộc nhân viên được giao và biên bản chưa gửi.

- **UC-25.1-MAIN-01** [MAIN] 1. Chọn Sửa công việc. -> 2. Hiển thị các trường được phép và danh sách nhân viên hiện tại.
3. Sửa lịch/tiêu đề/mô tả/ưu tiên/phân công hoặc chọn người lập biên bản. -> 4. Kiểm người hoạt động/đúng vai trò, lịch không trùng, trạng thái và version; đồng bộ phạm vi đợt nếu cần.
5. Xác nhận. -> 6. Lưu/audit và thông báo theo thao tác.
  Kết quả yêu cầu: Cập nhật công việc và phân công liên kết, tăng version/lưu lịch sử; thông báo riêng khi đổi người lập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.1-ALT-02** [ALT] A1. Hủy giữ bản cũ. Đổi người lập thu hồi quyền tạo/sửa/gửi của người cũ theo phân công hiện tại, không xóa lịch sử thông báo.
  Kết quả yêu cầu: A1. Hủy giữ bản cũ. Đổi người lập thu hồi quyền tạo/sửa/gửi của người cũ theo phân công hiện tại, không xóa lịch sử thông báo.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.1-ALT-03** [ALT] A2. Không coi việc đổi nhân viên là xóa QC/số đếm đã ghi.
  Kết quả yêu cầu: A2. Không coi việc đổi nhân viên là xóa QC/số đếm đã ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.1-EX-04** [EX] E1. Công việc hoàn thành/hủy hoặc trạng thái không cho sửa; lịch không hợp lệ/quá khứ/giao nhau; người sai vai trò; người lập ngoài phân công: chặn.
  Kết quả yêu cầu: E1. Công việc hoàn thành/hủy hoặc trạng thái không cho sửa; lịch không hợp lệ/quá khứ/giao nhau; người sai vai trò; người lập ngoài phân công: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.1-EX-05** [EX] E2. Biên bản đã gửi không đổi người lập để sửa bản chụp.
  Kết quả yêu cầu: E2. Biên bản đã gửi không đổi người lập để sửa bản chụp.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-25.2

Tiền điều kiện: Công việc còn được hủy và không bị phần đã thực hiện khóa.

- **UC-25.2-MAIN-01** [MAIN] 1. Chọn Hủy/Xóa công việc. -> 2. Hiển thị xác nhận, chưa thay đổi dữ liệu.
3. Đồng ý. -> 4. Kiểm trạng thái/version/phụ thuộc, cập nhật công việc và đợt liên quan theo quy tắc.
  Kết quả yêu cầu: Chuyển trạng thái hủy theo service, giải phóng phần chưa làm/không còn chiếm lịch; giữ lịch sử đã ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.2-ALT-02** [ALT] A1. Hủy hộp xác nhận giữ nguyên công việc.
  Kết quả yêu cầu: A1. Hủy hộp xác nhận giữ nguyên công việc.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.2-ALT-03** [ALT] A2. Phân công kho đã ghi một phần chỉ giải phóng phần chưa làm qua luồng quản lý, không xóa biến động đã ghi.
  Kết quả yêu cầu: A2. Phân công kho đã ghi một phần chỉ giải phóng phần chưa làm qua luồng quản lý, không xóa biến động đã ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.2-EX-04** [EX] E1. Công việc đang thực hiện/đã hoàn tất/đã có kết quả theo điều kiện không hủy được: chặn.
  Kết quả yêu cầu: E1. Công việc đang thực hiện/đã hoàn tất/đã có kết quả theo điều kiện không hủy được: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-25.2-EX-05** [EX] E2. Hủy không phải xóa vật lý mọi hồ sơ; không dùng để hợp thức hóa mất lịch sử.
  Kết quả yêu cầu: E2. Hủy không phải xóa vật lý mọi hồ sơ; không dùng để hợp thức hóa mất lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-31 Phê duyệt kế hoạch sản xuất

Tiền điều kiện: DIRECTOR đăng nhập; KHSX DRAFT, đơn nguồn RECEIVED/APPROVED/IN_PROGRESS hợp lệ và còn đúng lịch.

- **UC-31-MAIN-01** [MAIN] 1. Mở Kế hoạch sản xuất chờ duyệt, chọn KHSX. -> 2. Hiển thị đơn nguồn, dòng thành phẩm/NVL, xưởng, lịch và ghi chú.
3. Chọn Phê duyệt. -> 4. Kiểm version, nguồn, lịch và tổng sản lượng dự kiến.
5. Nếu vượt lượng đơn, chọn Xác nhận tiếp tục hoặc Quay lại chỉnh sửa. -> 6. Đồng ý thì lưu quyết định, cập nhật đúng KHSX/đơn liên quan và gửi thông báo; không cập nhật tồn.
  Kết quả yêu cầu: APPROVE: chỉ KHSX được chọn sang APPROVED; đơn RECEIVED sang APPROVED cùng transaction; thông báo chủ xưởng/planner/khách theo trường hợp. REJECT: trả KHSX để sửa, không từ chối đơn nguồn và không duyệt/hủy KHSX anh em.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-31-ALT-02** [ALT] A1. Chọn Không đồng ý và nhập lý do: KHSX vẫn là bản cần chỉnh sửa; tăng version, gửi planner. Đơn không tự chuyển REJECTED.
  Kết quả yêu cầu: A1. Chọn Không đồng ý và nhập lý do: KHSX vẫn là bản cần chỉnh sửa; tăng version, gửi planner. Đơn không tự chuyển REJECTED.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-31-ALT-03** [ALT] A2. Cảnh báo vượt nguồn dùng modal trắng–đỏ; Hủy/×/Esc không duyệt. Giám đốc xác nhận riêng dù planner đã xác nhận lúc lập/sửa.
  Kết quả yêu cầu: A2. Cảnh báo vượt nguồn dùng modal trắng–đỏ; Hủy/×/Esc không duyệt. Giám đốc xác nhận riêng dù planner đã xác nhận lúc lập/sửa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-31-ALT-04** [ALT] A3. Duyệt lặp cùng khóa/nội dung trả kết quả cũ; khác nội dung cùng khóa bị chặn.
  Kết quả yêu cầu: A3. Duyệt lặp cùng khóa/nội dung trả kết quả cũ; khác nội dung cùng khóa bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-31-EX-05** [EX] E1. API duyệt DonHang trực tiếp ngừng dùng, trả PLAN_REVIEW_REQUIRED. Không mô tả duyệt đồng loạt tất cả KHSX của một đơn.
  Kết quả yêu cầu: E1. API duyệt DonHang trực tiếp ngừng dùng, trả PLAN_REVIEW_REQUIRED. Không mô tả duyệt đồng loạt tất cả KHSX của một đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-31-EX-06** [EX] E2. Thiếu lý do từ chối, KHSX không DRAFT, đơn chưa tiếp nhận, version cũ hoặc ngày quá hạn/quá khứ: không duyệt.
  Kết quả yêu cầu: E2. Thiếu lý do từ chối, KHSX không DRAFT, đơn chưa tiếp nhận, version cũ hoặc ngày quá hạn/quá khứ: không duyệt.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-14

Tiền điều kiện: PURCHASER đăng nhập.

- **UC-14-MAIN-01** [MAIN] 1. Mở Đơn mua NVL. -> 2. Hiển thị danh sách PENDING/PARTIALLY_RECEIVED/... theo trạng thái thực tế, mã, ngày nhận và nguồn.
3. Tìm/lọc hoặc chọn chi tiết. -> 4. Hiển thị từng NVL, đơn vị, lượng, giá, NCC theo dòng, kế hoạch/báo cáo nguồn nếu có và lượng đã nhận/còn được nhận.
  Kết quả yêu cầu: Danh sách/chi tiết đơn mua và nguồn đúng phạm vi; xem không tạo lô hoặc tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-14-ALT-02** [ALT] A1. Tạo mới theo UC-27; MANUAL không buộc báo cáo. PLAN liên kết nguồn đã duyệt.
  Kết quả yêu cầu: A1. Tạo mới theo UC-27; MANUAL không buộc báo cáo. PLAN liên kết nguồn đã duyệt.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-14-ALT-03** [ALT] A2. REPORT là dữ liệu lịch sử, không cho tạo mới theo chế độ này.
  Kết quả yêu cầu: A2. REPORT là dữ liệu lịch sử, không cho tạo mới theo chế độ này.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-14-EX-04** [EX] E1. Không khẳng định có sửa/xóa đơn mua nếu actions/route không cung cấp. Đơn đã dùng không được chỉnh phá nguồn.
  Kết quả yêu cầu: E1. Không khẳng định có sửa/xóa đơn mua nếu actions/route không cung cấp. Đơn đã dùng không được chỉnh phá nguồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-14-EX-05** [EX] E2. Lọc sai, nguồn không tồn tại hoặc không đúng quyền: chặn; dữ liệu rỗng hiển thị bình thường.
  Kết quả yêu cầu: E2. Lọc sai, nguồn không tồn tại hoặc không đúng quyền: chặn; dữ liệu rỗng hiển thị bình thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-23

Tiền điều kiện: WORKSHOP_OWNER có đúng một xưởng phụ trách; nguồn đúng xưởng/hợp lệ, kho và quản lý kho hoạt động.

- **UC-23-MAIN-01** [MAIN] 1. Mở Gửi yêu cầu nhập/xuất. -> 2. Hiển thị Thao tác, Mục đích, Nguồn, tên xưởng thật mặc định/khóa, kho, quản lý phụ trách, ngày giờ và ghi chú.
3. Chọn một trong bốn nhánh nguồn bên dưới. -> 4. Tự tải mặt hàng, phần lô/nguồn và lượng còn đủ điều kiện; cho sửa lượng đề nghị, không đổi hàng sang ngoài nguồn.
5. Chọn ngày giờ, kho/quản lý và Gửi yêu cầu. -> 6. Kiểm lại phạm vi, trạng thái, ngày, QC/tồn, lượng cộng dồn/đã cam kết; lưu yêu cầu/dòng và thông báo.
  Kết quả yêu cầu: Tạo PhieuYeuCauNhapXuat PENDING và dòng đề nghị, thông báo quản lý được chọn; chưa tạo tồn hay phiếu kho thực tế.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-ALT-02** [ALT] A1. Nhập NVL: chọn kế hoạch MUA đã có đơn mua hoặc đơn mua trực tiếp theo danh sách nguồn; lấy phần thực nhận QC đạt chưa nhập, trừ phần trả/lượng đã yêu cầu. Chỉ đặt mua chưa có hàng/QC thì chưa đủ lượng nhập.
  Kết quả yêu cầu: A1. Nhập NVL: chọn kế hoạch MUA đã có đơn mua hoặc đơn mua trực tiếp theo danh sách nguồn; lấy phần thực nhận QC đạt chưa nhập, trừ phần trả/lượng đã yêu cầu. Chỉ đặt mua chưa có hàng/QC thì chưa đủ lượng nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-ALT-03** [ALT] A2. Nhập TP: chọn báo cáo thành phẩm đã SUBMITTED; chỉ phần đạt QC của báo cáo/phần lô chưa được nhập/yêu cầu. Nhiều báo cáo có cùng đầu lô nhưng từng phần riêng.
  Kết quả yêu cầu: A2. Nhập TP: chọn báo cáo thành phẩm đã SUBMITTED; chỉ phần đạt QC của báo cáo/phần lô chưa được nhập/yêu cầu. Nhiều báo cáo có cùng đầu lô nhưng từng phần riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-ALT-04** [ALT] A3. Xuất NVL: chọn KHSX đã duyệt/đang SX; lấy nhu cầu vật tư, đối chiếu báo cáo nhu cầu thực tế đã gửi nếu có, trừ đã cấp/cam kết; không xuất “lượng thiếu”.
  Kết quả yêu cầu: A3. Xuất NVL: chọn KHSX đã duyệt/đang SX; lấy nhu cầu vật tư, đối chiếu báo cáo nhu cầu thực tế đã gửi nếu có, trừ đã cấp/cam kết; không xuất “lượng thiếu”.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-ALT-05** [ALT] A4. Xuất TP: chọn KHSX COMPLETED, kế hoạch BAN đã duyệt liên quan; nếu nhiều BAN thì chọn rõ một. Đến ngày giao, thành phẩm QC đạt/đã nhập/còn khả dụng; không lấy bản báo cáo tiến độ.
  Kết quả yêu cầu: A4. Xuất TP: chọn KHSX COMPLETED, kế hoạch BAN đã duyệt liên quan; nếu nhiều BAN thì chọn rõ một. Đến ngày giao, thành phẩm QC đạt/đã nhập/còn khả dụng; không lấy bản báo cáo tiến độ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-ALT-06** [ALT] A5. Quản lý xem yêu cầu và phân công nhân viên/lô/vị trí; nhân viên UC-10/11 nhập số thực tế từ giấy tờ có thể thấp hơn lượng giao. Phần còn lại tiếp tục theo hạn mức.
  Kết quả yêu cầu: A5. Quản lý xem yêu cầu và phân công nhân viên/lô/vị trí; nhân viên UC-10/11 nhập số thực tế từ giấy tờ có thể thấp hơn lượng giao. Phần còn lại tiếp tục theo hạn mức.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-EX-07** [EX] E1. Không có nguồn hợp lệ: hiện hướng dẫn và khóa gửi, không hiện select [object Object] hoặc tạo nguồn giả.
  Kết quả yêu cầu: E1. Không có nguồn hợp lệ: hiện hướng dẫn và khóa gửi, không hiện select [object Object] hoặc tạo nguồn giả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-EX-08** [EX] E2. Xưởng hiển thị theo tên ahtor/edxn/trnvnth; ID như 13 là khóa nội bộ. Nguồn khác xưởng hoặc đổi ID ngoài quyền bị server chặn.
  Kết quả yêu cầu: E2. Xưởng hiển thị theo tên ahtor/edxn/trnvnth; ID như 13 là khóa nội bộ. Nguồn khác xưởng hoặc đổi ID ngoài quyền bị server chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-23-EX-09** [EX] E3. Ngày giờ sai/không cùng ngày yêu cầu/quá khứ; thiếu kho/quản lý; lượng≤0, vượt phần đủ điều kiện, trùng/cộng dồn vượt nhu cầu: chặn. Không dùng xác nhận vượt kế hoạch để vượt lượng thực nhập/xuất.
  Kết quả yêu cầu: E3. Ngày giờ sai/không cùng ngày yêu cầu/quá khứ; thiếu kho/quản lý; lượng≤0, vượt phần đủ điều kiện, trùng/cộng dồn vượt nhu cầu: chặn. Không dùng xác nhận vượt kế hoạch để vượt lượng thực nhập/xuất.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-24

Tiền điều kiện: Đăng nhập và có yêu cầu thuộc xưởng/phạm vi.

- **UC-24-MAIN-01** [MAIN] 1. Mở Yêu cầu nhập/xuất. -> 2. Hiển thị danh sách trong quyền, mục đích, nguồn, ngày giờ và trạng thái.
3. Lọc/tìm hoặc xem chi tiết. -> 4. Hiển thị dòng đề nghị, phân công/đã thực hiện và thao tác được phép.
  Kết quả yêu cầu: Đọc danh sách/chi tiết và trạng thái xử lý; không tự sửa/xóa dữ liệu khi xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24-ALT-02** [ALT] A1. Sửa đi UC-24.1; hủy đi UC-24.2.
  Kết quả yêu cầu: A1. Sửa đi UC-24.1; hủy đi UC-24.2.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24-ALT-03** [ALT] A2. Quản lý chọn phân công chuyển sang luồng điều phối kho; chủ xưởng không tự chọn nhân viên kho thay quản lý.
  Kết quả yêu cầu: A2. Quản lý chọn phân công chuyển sang luồng điều phối kho; chủ xưởng không tự chọn nhân viên kho thay quản lý.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24-EX-04** [EX] E1. Lọc không có kết quả giữ giao diện, không đổi dữ liệu; đổi ID sang xưởng khác bị chặn.
  Kết quả yêu cầu: E1. Lọc không có kết quả giữ giao diện, không đổi dữ liệu; đổi ID sang xưởng khác bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-24.1

Tiền điều kiện: Đúng xưởng, yêu cầu còn PENDING và chưa bị phân công/thực hiện/sử dụng làm nguồn theo quy tắc.

- **UC-24.1-MAIN-01** [MAIN] 1. Chọn Sửa yêu cầu. -> 2. Tải bản hiện tại và dòng còn đủ điều kiện; xưởng/nguồn được giữ.
3. Sửa trường được phép rồi Lưu. -> 4. Kiểm version/trạng thái/ngày/kho/người quản lý và lượng cộng dồn, cập nhật transaction.
  Kết quả yêu cầu: Lưu ngày giờ/kho/quản lý/ghi chú/lượng được phép và version; không đổi nguồn/loại tùy tiện.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.1-ALT-02** [ALT] A1. Hủy form giữ yêu cầu cũ.
  Kết quả yêu cầu: A1. Hủy form giữ yêu cầu cũ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.1-ALT-03** [ALT] A2. Nhu cầu khác nguồn cần tạo yêu cầu mới hợp lệ; không sửa để chuyển chứng từ sang xưởng khác.
  Kết quả yêu cầu: A2. Nhu cầu khác nguồn cần tạo yêu cầu mới hợp lệ; không sửa để chuyển chứng từ sang xưởng khác.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.1-EX-04** [EX] E1. Đã phân công/đang thực hiện/hoàn tất/hủy hoặc đã dùng: không sửa tùy tiện.
  Kết quả yêu cầu: E1. Đã phân công/đang thực hiện/hoàn tất/hủy hoặc đã dùng: không sửa tùy tiện.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.1-EX-05** [EX] E2. Ngày quá khứ, trường ngoài hợp đồng, lượng không hợp lệ hoặc vượt còn được phép: chặn.
  Kết quả yêu cầu: E2. Ngày quá khứ, trường ngoài hợp đồng, lượng không hợp lệ hoặc vượt còn được phép: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-24.2

Tiền điều kiện: Đúng xưởng/version, yêu cầu còn trạng thái cho phép hủy và chưa có thực hiện/phụ thuộc bị khóa.

- **UC-24.2-MAIN-01** [MAIN] 1. Chọn Hủy/Xóa yêu cầu. -> 2. Hiển thị xác nhận.
3. Đồng ý. -> 4. Kiểm lại trạng thái/version/tham chiếu; hủy hợp lệ, cập nhật lượng cam kết và thông báo theo luồng.
  Kết quả yêu cầu: Yêu cầu chuyển CANCELLED hoặc xử lý hủy theo service; không xóa phiếu kho đã ghi hoặc lịch sử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.2-ALT-02** [ALT] A1. Không đồng ý/đóng form: không hủy.
  Kết quả yêu cầu: A1. Không đồng ý/đóng form: không hủy.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.2-ALT-03** [ALT] A2. Đã phân công cần quản lý giải phóng phần chưa làm theo luồng riêng; không tự hoàn tác hàng thực nhập/xuất.
  Kết quả yêu cầu: A2. Đã phân công cần quản lý giải phóng phần chưa làm theo luồng riêng; không tự hoàn tác hàng thực nhập/xuất.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-24.2-EX-04** [EX] E1. Yêu cầu đã thực hiện/đã được sử dụng hoặc version đổi: chặn. Không hứa xóa vật lý khỏi CSDL.
  Kết quả yêu cầu: E1. Yêu cầu đã thực hiện/đã được sử dụng hoặc version đổi: chặn. Không hứa xóa vật lý khỏi CSDL.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-27

Tiền điều kiện: PURCHASER đăng nhập; chọn lập trực tiếp hoặc kế hoạch MUA APPROVED còn chưa có đơn theo chính sách một đơn/kế hoạch.

- **UC-27-MAIN-01** [MAIN] 1. Mở Tạo đơn mua NVL. -> 2. Hiển thị lựa chọn Lập trực tiếp/Theo kế hoạch mua NVL.
3. Chọn nguồn, từng NVL và NCC của từng dòng; nhập giá/điều kiện giao/ghi chú. -> 4. PLAN lấy danh sách và ngày nhận từ kế hoạch; MANUAL tự chọn NVL, lượng và ngày. Đổi NVL/NCC gợi ý giá theo bảng giá nhưng cho sửa giá thỏa thuận.
5. Xác nhận mua. -> 6. Kiểm nguồn, lượng, ngày, NCC hoạt động, một đơn/kế hoạch và tổng tiền; lưu đơn/dòng trong transaction.
  Kết quả yêu cầu: Tạo DonMuaHang PENDING và dòng NVL/NCC/giá, nguồn khi PLAN; không tự tạo hàng thực nhận hoặc tăng tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-ALT-02** [ALT] A1. MANUAL không cần báo cáo/KHSX/kế hoạch; không tự đáp ứng nhu cầu của báo cáo khác.
  Kết quả yêu cầu: A1. MANUAL không cần báo cáo/KHSX/kế hoạch; không tự đáp ứng nhu cầu của báo cáo khác.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-ALT-03** [ALT] A2. PLAN không chọn trực tiếp báo cáo làm nguồn đơn mua; báo cáo trùng với nguồn kế hoạch. NCC có thể khác nhau giữa các dòng; planner không chọn NCC.
  Kết quả yêu cầu: A2. PLAN không chọn trực tiếp báo cáo làm nguồn đơn mua; báo cáo trùng với nguồn kế hoạch. NCC có thể khác nhau giữa các dòng; planner không chọn NCC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-ALT-04** [ALT] A3. REPORT chỉ đọc dữ liệu lịch sử, không cho tạo mới. Hủy form không tạo đơn.
  Kết quả yêu cầu: A3. REPORT chỉ đọc dữ liệu lịch sử, không cho tạo mới. Hủy form không tạo đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-EX-05** [EX] E1. PLAN chưa duyệt/sai loại/đã có đơn, ngày nhận sửa khác kế hoạch, báo cáo nguồn sai/chưa gửi: chặn.
  Kết quả yêu cầu: E1. PLAN chưa duyệt/sai loại/đã có đơn, ngày nhận sửa khác kế hoạch, báo cáo nguồn sai/chưa gửi: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-EX-06** [EX] E2. Kế hoạch MUA trực tiếp thiếu báo cáo hiện bị code chặn khi tạo đơn PLAN; đây là điểm lệch cần sửa, không nói nhánh này đã hoàn thiện.
  Kết quả yêu cầu: E2. Kế hoạch MUA trực tiếp thiếu báo cáo hiện bị code chặn khi tạo đơn PLAN; đây là điểm lệch cần sửa, không nói nhánh này đã hoàn thiện.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-27-EX-07** [EX] E3. NVL trùng, NCC không hoạt động/sai ID, lượng/giá/đơn vị sai, ngày quá khứ: chặn. Nhận hàng thực tế và QC là bước khác.
  Kết quả yêu cầu: E3. NVL trùng, NCC không hoạt động/sai ID, lượng/giá/đơn vị sai, ngày quá khứ: chặn. Nhận hàng thực tế và QC là bước khác.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-04 Lập kế hoạch mua/bán/sản xuất

Tiền điều kiện: PLANNER đăng nhập. Nhánh SX có đơn đã tiếp nhận và xưởng hoạt động; nhánh MUA/BAN có nguồn hợp lệ khi chọn dùng nguồn.

- **UC-04-MAIN-01** [MAIN] 1. Mở Lập kế hoạch theo loại SX hoặc Mua/bán. -> 2. Hiển thị form và nguồn đúng loại; phân biệt KHSX với KeHoachMuaBan.
3. Nhập các trường và dòng theo nhánh; chọn ngày và ghi chú. -> 4. Đối chiếu nguồn, quyền, lượng cộng dồn và thời gian; tính tổng tiền đối với MUA/BAN.
5. Lưu; nếu số lượng vượt nguồn thì xem cảnh báo và xác nhận tiếp tục khi đồng ý. -> 6. Lưu kế hoạch/dòng/version/lịch sử trong transaction và gửi đúng người duyệt.
  Kết quả yêu cầu: KHSX lưu DRAFT để UC-31 duyệt; MUA/BAN lưu PENDING_APPROVAL để UC-32 duyệt. Không tự tạo đơn mua, lô vật lý, phiếu kho hay tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-ALT-02** [ALT] A1. SX: chọn đơn, tự điền toàn bộ thông tin đơn và sản lượng; chọn xưởng ahtor/edxn/trnvnth. NVL theo công thức cấu hình × sản lượng, cộng gộp và cộng dự phòng 10% một lần, làm tròn lên 3 số lẻ; hoặc khai NVL gốc được phép. Công thức là mẫu, không tự đổi đơn vị.
  Kết quả yêu cầu: A1. SX: chọn đơn, tự điền toàn bộ thông tin đơn và sản lượng; chọn xưởng ahtor/edxn/trnvnth. NVL theo công thức cấu hình × sản lượng, cộng gộp và cộng dự phòng 10% một lần, làm tròn lên 3 số lẻ; hoặc khai NVL gốc được phép. Công thức là mẫu, không tự đổi đơn vị.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-ALT-03** [ALT] A2. MUA: Lập trực tiếp hoặc Theo báo cáo nhu cầu NVL đã gửi cho planner. Dùng phần thiếu thực tế, không cộng lại 10%; planner chọn ngày nhận mong muốn, không chọn NCC. Nút tạo kế hoạch từ chi tiết báo cáo đưa đúng nguồn vào form.
  Kết quả yêu cầu: A2. MUA: Lập trực tiếp hoặc Theo báo cáo nhu cầu NVL đã gửi cho planner. Dùng phần thiếu thực tế, không cộng lại 10%; planner chọn ngày nhận mong muốn, không chọn NCC. Nút tạo kế hoạch từ chi tiết báo cáo đưa đúng nguồn vào form.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-ALT-04** [ALT] A3. BAN: chọn đơn/khách và báo cáo thành phẩm tổng kết đã gửi; lấy sản lượng nguồn, xem QC/tồn khả dụng. Không lấy báo cáo tiến độ/sự cố làm nguồn thành phẩm.
  Kết quả yêu cầu: A3. BAN: chọn đơn/khách và báo cáo thành phẩm tổng kết đã gửi; lấy sản lượng nguồn, xem QC/tồn khả dụng. Không lấy báo cáo tiến độ/sự cố làm nguồn thành phẩm.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-ALT-05** [ALT] A4. Hủy cảnh báo vượt lượng giữ form; đồng ý chỉ nới lượng dự kiến kế hoạch, không cho xuất thiếu tồn/QC.
  Kết quả yêu cầu: A4. Hủy cảnh báo vượt lượng giữ form; đồng ý chỉ nới lượng dự kiến kế hoạch, không cho xuất thiếu tồn/QC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-EX-06** [EX] E1. Ngày nhập mới không quá khứ; bắt đầu SX ≤ kết thúc SX ≤ hạn giao; ngày MUA không vượt kết thúc SX/hạn giao, BAN không vượt hạn giao.
  Kết quả yêu cầu: E1. Ngày nhập mới không quá khứ; bắt đầu SX ≤ kết thúc SX ≤ hạn giao; ngày MUA không vượt kết thúc SX/hạn giao, BAN không vượt hạn giao.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-EX-07** [EX] E2. Sai loại báo cáo, báo cáo chưa gửi/không gửi planner, nguồn không hiệu lực, mặt hàng sai loại, trùng dòng hoặc dữ liệu sai: chặn.
  Kết quả yêu cầu: E2. Sai loại báo cáo, báo cáo chưa gửi/không gửi planner, nguồn không hiệu lực, mặt hàng sai loại, trùng dòng hoặc dữ liệu sai: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-EX-08** [EX] E3. Theo code hiện tại, kế hoạch MUA lập trực tiếp không có báo cáo có thể lưu/duyệt nhưng đơn mua PLAN từ nó bị chặn “Kế hoạch mua thiếu báo cáo nguồn.”; ghi nhận lỗi/giới hạn, không coi nhánh này đã nối thông.
  Kết quả yêu cầu: E3. Theo code hiện tại, kế hoạch MUA lập trực tiếp không có báo cáo có thể lưu/duyệt nhưng đơn mua PLAN từ nó bị chặn “Kế hoạch mua thiếu báo cáo nguồn.”; ghi nhận lỗi/giới hạn, không coi nhánh này đã nối thông.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-04-EX-09** [EX] E4. Kế hoạch MUA vượt nguồn đã được xác nhận vẫn có thể bị kiểm lại khi tạo đơn mua; đối chiếu báo cáo lỗi trong phụ lục kiểm thử.
  Kết quả yêu cầu: E4. Kế hoạch MUA vượt nguồn đã được xác nhận vẫn có thể bị kiểm lại khi tạo đơn mua; đối chiếu báo cáo lỗi trong phụ lục kiểm thử.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-05

Tiền điều kiện: PLANNER đăng nhập; danh sách kế hoạch thuộc module được phép.

- **UC-05-MAIN-01** [MAIN] 1. Mở danh sách KHSX hoặc Kế hoạch mua/bán. -> 2. Hiển thị mã, loại, nguồn, ngày, trạng thái, tổng và phân trang theo màn hình.
3. Tìm/lọc và chọn chi tiết. -> 4. Hiển thị dòng hàng, xưởng/đơn/báo cáo liên quan và thao tác theo trạng thái.
  Kết quả yêu cầu: Hiển thị danh sách/chi tiết đúng nguồn, không đổi dữ liệu khi chỉ xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05-ALT-02** [ALT] A1. Sửa đi UC-05.1; hủy/xóa đi UC-05.2.
  Kết quả yêu cầu: A1. Sửa đi UC-05.1; hủy/xóa đi UC-05.2.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05-ALT-03** [ALT] A2. Kế hoạch đã duyệt/đã dùng làm nguồn không được tùy ý sửa/xóa như bản nháp; xem lịch sử thay thế nếu cần nghiệp vụ mới.
  Kết quả yêu cầu: A2. Kế hoạch đã duyệt/đã dùng làm nguồn không được tùy ý sửa/xóa như bản nháp; xem lịch sử thay thế nếu cần nghiệp vụ mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05-EX-04** [EX] E1. Lọc không có kết quả giữ bộ lọc và bảng rỗng; nguồn/ID không tồn tại báo không tìm thấy.
  Kết quả yêu cầu: E1. Lọc không có kết quả giữ bộ lọc và bảng rỗng; nguồn/ID không tồn tại báo không tìm thấy.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-05.1

Tiền điều kiện: KHSX DRAFT hoặc MUA/BAN PENDING_APPROVAL/REJECTED theo loại; đúng quyền và version; chưa bị khóa bởi chứng từ phụ thuộc.

- **UC-05.1-MAIN-01** [MAIN] 1. Mở Sửa kế hoạch. -> 2. Hiển thị thông tin hiện hành và các trường được phép.
3. Chỉnh ngày, ghi chú, xưởng/dòng theo loại kế hoạch rồi Lưu. -> 4. Kiểm phiên bản, trạng thái, chứng từ phụ thuộc, lịch và nguồn; tính lại lượng/tổng cần thiết.
5. Xác nhận nếu kế hoạch vượt lượng nguồn. -> 6. Đồng ý mới lưu; Hủy giữ bản cũ.
  Kết quả yêu cầu: Lưu nội dung hợp lệ, tăng version; MUA/BAN trở lại PENDING_APPROVAL và xóa lý do từ chối cũ. Không sửa nguồn lịch sử bằng suy đoán.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.1-ALT-02** [ALT] A1. KHSX chỉnh sản lượng/NVL chỉ khi còn nháp. Cảnh báo vượt lượng đơn thay cho chặn tuyệt đối, áp dụng tổng các KHSX chưa hủy.
  Kết quả yêu cầu: A1. KHSX chỉnh sản lượng/NVL chỉ khi còn nháp. Cảnh báo vượt lượng đơn thay cho chặn tuyệt đối, áp dụng tổng các KHSX chưa hủy.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.1-ALT-03** [ALT] A2. MUA/BAN vượt nguồn hỏi xác nhận; giá trị xác nhận chỉ cho lần gửi hiện tại. Không cho đổi nguồn đơn/báo cáo tùy tiện qua PATCH.
  Kết quả yêu cầu: A2. MUA/BAN vượt nguồn hỏi xác nhận; giá trị xác nhận chỉ cho lần gửi hiện tại. Không cho đổi nguồn đơn/báo cáo tùy tiện qua PATCH.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.1-EX-04** [EX] E1. Đã duyệt/đang thực hiện/đã có chứng từ nguồn bị ràng buộc; không có trường cần sửa; dữ liệu sai hoặc stale: không lưu.
  Kết quả yêu cầu: E1. Đã duyệt/đang thực hiện/đã có chứng từ nguồn bị ràng buộc; không có trường cần sửa; dữ liệu sai hoặc stale: không lưu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.1-EX-05** [EX] E2. Ngày mới làm sai lịch KHSX/đơn nguồn hoặc ngày quá khứ: chặn, không chuyển thành cảnh báo lượng.
  Kết quả yêu cầu: E2. Ngày mới làm sai lịch KHSX/đơn nguồn hoặc ngày quá khứ: chặn, không chuyển thành cảnh báo lượng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-05.2

Tiền điều kiện: Đúng quyền/version; kế hoạch ở trạng thái cho phép và không bị chứng từ phụ thuộc sử dụng.

- **UC-05.2-MAIN-01** [MAIN] 1. Chọn Hủy/Xóa kế hoạch. -> 2. Hiển thị xác nhận, chưa thay đổi dữ liệu.
3. Đồng ý. -> 4. Kiểm lại version/trạng thái/tham chiếu; hủy hoặc xóa đúng loại, giải phóng lượng kế hoạch theo quy tắc; báo kết quả.
  Kết quả yêu cầu: KHSX được hủy theo trạng thái; MUA/BAN bị xóa khi đủ điều kiện; bảo toàn nguồn và lịch sử được bảo vệ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.2-ALT-02** [ALT] A1. Chọn Hủy ở hộp xác nhận: không gửi mutation hoặc không đổi dữ liệu.
  Kết quả yêu cầu: A1. Chọn Hủy ở hộp xác nhận: không gửi mutation hoặc không đổi dữ liệu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.2-ALT-03** [ALT] A2. Không dùng xóa kế hoạch để xóa lô/tồn/đơn hàng hay hoàn tác phiếu đã ghi.
  Kết quả yêu cầu: A2. Không dùng xóa kế hoạch để xóa lô/tồn/đơn hàng hay hoàn tác phiếu đã ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.2-EX-04** [EX] E1. Kế hoạch đã duyệt/đang dùng/đã tạo đơn mua, yêu cầu, báo cáo hoặc dữ liệu phụ thuộc: chặn theo loại.
  Kết quả yêu cầu: E1. Kế hoạch đã duyệt/đang dùng/đã tạo đơn mua, yêu cầu, báo cáo hoặc dữ liệu phụ thuộc: chặn theo loại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-05.2-EX-05** [EX] E2. Hai người cùng hủy/sửa: kiểm version và trạng thái, không xóa nhầm dữ liệu mới.
  Kết quả yêu cầu: E2. Hai người cùng hủy/sửa: kiểm version và trạng thái, không xóa nhầm dữ liệu mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-10

Tiền điều kiện: Yêu cầu/nguồn đủ điều kiện, quản lý đã phân công đúng người và phần lô/vị trí; kho không bị khóa, quyền/version còn hợp lệ.

- **UC-10-MAIN-01** [MAIN] 1. Mở công việc nhập hoặc xuất đã được giao. -> 2. Hiển thị yêu cầu, nguồn, lô/vị trí/bucket và lượng phân công còn được thực hiện.
3. Đối chiếu giấy tờ thực tế, nhập lượng thực nhập/xuất và thông tin phiếu. -> 4. Tự gợi ý đúng lượng còn lại nhưng cho sửa trong hạn mức; kiểm người thực hiện và lô/vị trí thực tế.
5. Xác nhận ghi phiếu. -> 6. Khóa/kiểm lại tồn, QC, hạn dùng, kho kiểm kê, nguồn/cam kết và phiên bản; ghi phiếu/chi tiết/biến động/tồn một lần; cập nhật trạng thái công việc/yêu cầu/đơn theo nhánh.
  Kết quả yêu cầu: Lưu phiếu nháp hoặc POSTED theo bước; chỉ khi ghi phiếu mới tạo biến động và cập nhật tồn/lượng đã thực hiện trong transaction, không ghi trùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-ALT-02** [ALT] A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Kết quả yêu cầu: A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-ALT-03** [ALT] A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Kết quả yêu cầu: A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-ALT-04** [ALT] A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Kết quả yêu cầu: A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-ALT-05** [ALT] A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Kết quả yêu cầu: A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-ALT-06** [ALT] A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Kết quả yêu cầu: A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-EX-07** [EX] E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Kết quả yêu cầu: E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-EX-08** [EX] E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Kết quả yêu cầu: E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-EX-09** [EX] E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Kết quả yêu cầu: E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-10-EX-10** [EX] E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Kết quả yêu cầu: E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-11

Tiền điều kiện: Yêu cầu/nguồn đủ điều kiện, quản lý đã phân công đúng người và phần lô/vị trí; kho không bị khóa, quyền/version còn hợp lệ.

- **UC-11-MAIN-01** [MAIN] 1. Mở công việc nhập hoặc xuất đã được giao. -> 2. Hiển thị yêu cầu, nguồn, lô/vị trí/bucket và lượng phân công còn được thực hiện.
3. Đối chiếu giấy tờ thực tế, nhập lượng thực nhập/xuất và thông tin phiếu. -> 4. Tự gợi ý đúng lượng còn lại nhưng cho sửa trong hạn mức; kiểm người thực hiện và lô/vị trí thực tế.
5. Xác nhận ghi phiếu. -> 6. Khóa/kiểm lại tồn, QC, hạn dùng, kho kiểm kê, nguồn/cam kết và phiên bản; ghi phiếu/chi tiết/biến động/tồn một lần; cập nhật trạng thái công việc/yêu cầu/đơn theo nhánh.
  Kết quả yêu cầu: Lưu phiếu nháp hoặc POSTED theo bước; chỉ khi ghi phiếu mới tạo biến động và cập nhật tồn/lượng đã thực hiện trong transaction, không ghi trùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-ALT-02** [ALT] A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Kết quả yêu cầu: A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-ALT-03** [ALT] A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Kết quả yêu cầu: A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-ALT-04** [ALT] A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Kết quả yêu cầu: A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-ALT-05** [ALT] A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Kết quả yêu cầu: A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-ALT-06** [ALT] A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Kết quả yêu cầu: A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-EX-07** [EX] E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Kết quả yêu cầu: E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-EX-08** [EX] E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Kết quả yêu cầu: E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-EX-09** [EX] E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Kết quả yêu cầu: E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11-EX-10** [EX] E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Kết quả yêu cầu: E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-11.01

Tiền điều kiện: Yêu cầu/nguồn đủ điều kiện, quản lý đã phân công đúng người và phần lô/vị trí; kho không bị khóa, quyền/version còn hợp lệ.

- **UC-11.01-MAIN-01** [MAIN] 1. Mở công việc nhập hoặc xuất đã được giao. -> 2. Hiển thị yêu cầu, nguồn, lô/vị trí/bucket và lượng phân công còn được thực hiện.
3. Đối chiếu giấy tờ thực tế, nhập lượng thực nhập/xuất và thông tin phiếu. -> 4. Tự gợi ý đúng lượng còn lại nhưng cho sửa trong hạn mức; kiểm người thực hiện và lô/vị trí thực tế.
5. Xác nhận ghi phiếu. -> 6. Khóa/kiểm lại tồn, QC, hạn dùng, kho kiểm kê, nguồn/cam kết và phiên bản; ghi phiếu/chi tiết/biến động/tồn một lần; cập nhật trạng thái công việc/yêu cầu/đơn theo nhánh.
  Kết quả yêu cầu: Lưu phiếu nháp hoặc POSTED theo bước; chỉ khi ghi phiếu mới tạo biến động và cập nhật tồn/lượng đã thực hiện trong transaction, không ghi trùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-ALT-02** [ALT] A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Kết quả yêu cầu: A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-ALT-03** [ALT] A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Kết quả yêu cầu: A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-ALT-04** [ALT] A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Kết quả yêu cầu: A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-ALT-05** [ALT] A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Kết quả yêu cầu: A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-ALT-06** [ALT] A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Kết quả yêu cầu: A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-EX-07** [EX] E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Kết quả yêu cầu: E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-EX-08** [EX] E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Kết quả yêu cầu: E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-EX-09** [EX] E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Kết quả yêu cầu: E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.01-EX-10** [EX] E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Kết quả yêu cầu: E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-11.02

Tiền điều kiện: Yêu cầu/nguồn đủ điều kiện, quản lý đã phân công đúng người và phần lô/vị trí; kho không bị khóa, quyền/version còn hợp lệ.

- **UC-11.02-MAIN-01** [MAIN] 1. Mở công việc nhập hoặc xuất đã được giao. -> 2. Hiển thị yêu cầu, nguồn, lô/vị trí/bucket và lượng phân công còn được thực hiện.
3. Đối chiếu giấy tờ thực tế, nhập lượng thực nhập/xuất và thông tin phiếu. -> 4. Tự gợi ý đúng lượng còn lại nhưng cho sửa trong hạn mức; kiểm người thực hiện và lô/vị trí thực tế.
5. Xác nhận ghi phiếu. -> 6. Khóa/kiểm lại tồn, QC, hạn dùng, kho kiểm kê, nguồn/cam kết và phiên bản; ghi phiếu/chi tiết/biến động/tồn một lần; cập nhật trạng thái công việc/yêu cầu/đơn theo nhánh.
  Kết quả yêu cầu: Lưu phiếu nháp hoặc POSTED theo bước; chỉ khi ghi phiếu mới tạo biến động và cập nhật tồn/lượng đã thực hiện trong transaction, không ghi trùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-ALT-02** [ALT] A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Kết quả yêu cầu: A1. UC-10: nhập NVL từ phần thực nhận QC đạt; nhập TP từ phần báo cáo đã gửi QC đạt. Có thể nhập thiếu một phần phân công, phần còn lại tiếp tục; không nhập lại lượng đã nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-ALT-03** [ALT] A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Kết quả yêu cầu: A2. UC-11.01: xuất NVL theo KHSX hoặc báo cáo nhu cầu được phép; sử dụng lượng AVAILABLE hợp lệ đã phân công/giữ chỗ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-ALT-04** [ALT] A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Kết quả yêu cầu: A3. UC-11.02: xuất TP theo yêu cầu liên quan KHSX hoàn tất và BAN đã duyệt, đúng ngày giao; cập nhật lượng giao thực tế của đơn/kế hoạch.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-ALT-05** [ALT] A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Kết quả yêu cầu: A4. Quản lý phân công mới tạo giữ chỗ, không tự chọn FIFO thay người nếu chưa có cơ chế đó. Hủy phân công chỉ giải phóng phần chưa ghi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-ALT-06** [ALT] A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Kết quả yêu cầu: A5. Bản nháp không làm đổi tồn. Bấm lại ghi phiếu cùng khóa/nội dung không tạo thêm biến động; khác nội dung cùng khóa bị chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-EX-07** [EX] E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Kết quả yêu cầu: E1. Vượt lượng được giao/QC đạt/chưa nhập hoặc thiếu khả dụng; lô hết hạn/cách ly, vị trí khác kho, kho bị kiểm kê khóa hoặc source đã thay đổi: không ghi phiếu/rollback.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-EX-08** [EX] E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Kết quả yêu cầu: E2. Không tự tạo đề xuất “Chờ duyệt lại” chỉ vì nhân viên bấm báo không thể xuất nếu giao diện hiện chưa có bước đó. Khi sự cố, liên hệ quản lý/luồng ngoại lệ; ghi rõ chức năng tự báo không thể xuất là chưa được triển khai.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-EX-09** [EX] E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Kết quả yêu cầu: E3. Người khác được giao, nhân viên tự đổi nguồn/phân công, lỗi giữa chừng hoặc version cũ: chặn/rollback; phiếu đã ghi không sửa đè/xóa để đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-11.02-EX-10** [EX] E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Kết quả yêu cầu: E4. Lỗi giao diện đã quan sát: nút Tạo mới chung ở màn hình Phiếu kho của nhân viên mở “Biểu mẫu này chưa được hỗ trợ.” Luồng ghi phiếu từ công việc được phân công vẫn có và đã kiểm; cần ẩn nút chung hoặc điều hướng đúng, không coi nút đang hoạt động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-35

Tiền điều kiện: KHSX APPROVED/IN_PROGRESS đúng xưởng; chưa có tổng kết khóa; có thành phẩm mới hoàn thành cần báo cáo.

- **UC-35-MAIN-01** [MAIN] 1. Mở Báo cáo thành phẩm từng phần, chọn KHSX. -> 2. Hiển thị sản lượng kế hoạch/đã báo cáo/còn lại từng mặt hàng và NVL đã xuất/đã báo dùng.
3. Nhập lượng của phần mới, mã phần lô/ngày SX/hạn dùng và ghi chú. -> 4. Còn lại tự cập nhật; tick đợt cuối điền phần còn lại; khi mọi thành phẩm còn 0 tự tick đợt cuối.
5. Khi đợt cuối, đối chiếu NVL thực tế và sửa lượng dùng của phần này; lưu rồi gửi. -> 6. Kiểm tổng sản lượng và NVL cộng dồn; tạo phần lô đúng đầu lô, gửi đúng người nhận; tổng kết mới làm nguồn BAN.
  Kết quả yêu cầu: Lưu báo cáo THANH_PHAM DRAFT; gửi báo cáo phần tạo các dòng phần trong cùng đầu lô của KHSX, không tự nhập tồn. Phần thường giữ IN_PROGRESS; phần cuối đủ điều kiện chuyển COMPLETED.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-ALT-02** [ALT] A1. Nhiều báo cáo phần cùng đầu lô nhưng từng dòng phần riêng; QC/đợt kiểm kê và nhập kho theo phần đã gửi. Không gộp lại toàn bộ lượng đầu lô để nhập lần nữa.
  Kết quả yêu cầu: A1. Nhiều báo cáo phần cùng đầu lô nhưng từng dòng phần riêng; QC/đợt kiểm kê và nhập kho theo phần đã gửi. Không gộp lại toàn bộ lượng đầu lô để nhập lần nữa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-ALT-03** [ALT] A2. NVL thực tế dùng gợi ý = đã xuất cộng dồn − đã báo dùng trước. Ví dụ xuất 5.000, dùng tổng 4.900: còn 100 để đối chiếu trả kho; báo cáo không tự nhập trả. Luồng nhập trả NVL dư chưa hoàn thiện, phải ghi là giới hạn.
  Kết quả yêu cầu: A2. NVL thực tế dùng gợi ý = đã xuất cộng dồn − đã báo dùng trước. Ví dụ xuất 5.000, dùng tổng 4.900: còn 100 để đối chiếu trả kho; báo cáo không tự nhập trả. Luồng nhập trả NVL dư chưa hoàn thiện, phải ghi là giới hạn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-ALT-04** [ALT] A3. Bản tổng kết FINAL kiểu cũ khác PART; có thể tham chiếu lô đã ghi theo điều kiện riêng để không tạo lô/tồn trùng. Bản nháp sửa được; đã gửi/bị dùng bị khóa.
  Kết quả yêu cầu: A3. Bản tổng kết FINAL kiểu cũ khác PART; có thể tham chiếu lô đã ghi theo điều kiện riêng để không tạo lô/tồn trùng. Bản nháp sửa được; đã gửi/bị dùng bị khóa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-EX-05** [EX] E1. Tổng báo cáo vượt lượng KHSX, lượng dùng vượt NVL đã cấp chưa quyết toán, mặt hàng ngoài kế hoạch, lô sai nguồn/trùng không hợp lệ: chặn. Đây là lượng thực tế, không phải cảnh báo nới dự kiến.
  Kết quả yêu cầu: E1. Tổng báo cáo vượt lượng KHSX, lượng dùng vượt NVL đã cấp chưa quyết toán, mặt hàng ngoài kế hoạch, lô sai nguồn/trùng không hợp lệ: chặn. Đây là lượng thực tế, không phải cảnh báo nới dự kiến.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-EX-06** [EX] E2. Đánh dấu cuối khi chưa đủ sản lượng theo quy tắc hiện tại hoặc đã có bản cuối: chặn. UI tự tính không được coi là thay kiểm tra server.
  Kết quả yêu cầu: E2. Đánh dấu cuối khi chưa đủ sản lượng theo quy tắc hiện tại hoặc đã có bản cuối: chặn. UI tự tính không được coi là thay kiểm tra server.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-35-EX-07** [EX] E3. Không có lệnh xuất NVL đã ghi thì không tự bịa lượng dùng. Ngày/hạn dùng sai hoặc ngày mới quá khứ bị chặn; giữ ngày lịch sử của lô đã ghi ở nhánh được phép.
  Kết quả yêu cầu: E3. Không có lệnh xuất NVL đã ghi thì không tự bịa lượng dùng. Ngày/hạn dùng sai hoặc ngày mới quá khứ bị chặn; giữ ngày lịch sử của lô đã ghi ở nhánh được phép.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-01 Đăng nhập

Tiền điều kiện: Có tài khoản hoạt động; truy cập màn hình đăng nhập. Không cần phiên đăng nhập trước đó.

- **UC-01-MAIN-01** [MAIN] 1. Mở trang Đăng nhập. -> 2. Hiển thị Tên đăng nhập, Mật khẩu và nút Đăng nhập.
3. Nhập thông tin và gửi. -> 4. Kiểm tra dữ liệu, giới hạn đăng nhập theo tài khoản/IP; xác minh mật khẩu băm và trạng thái tài khoản.
5. Vào hệ thống theo kết quả. -> 6. Luân chuyển phiên, trả thông tin vai trò/phạm vi xưởng, hiển thị dashboard và menu đúng quyền.
  Kết quả yêu cầu: Thành công tạo/luân chuyển phiên, CSRF và hiển thị chức năng theo vai trò hiện tại; thất bại không cấp phiên.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-01-ALT-02** [ALT] A1. Đăng xuất: hủy phiên; vào lại trang bảo vệ phải đăng nhập.
  Kết quả yêu cầu: A1. Đăng xuất: hủy phiên; vào lại trang bảo vệ phải đăng nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-01-ALT-03** [ALT] A2. Tài khoản nhiều vai trò có hợp quyền đã cấp; ADMIN không tự có quyền nghiệp vụ nếu chưa được cấp vai trò tương ứng.
  Kết quả yêu cầu: A2. Tài khoản nhiều vai trò có hợp quyền đã cấp; ADMIN không tự có quyền nghiệp vụ nếu chưa được cấp vai trò tương ứng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-01-EX-04** [EX] E1. Sai tên/mật khẩu hoặc tài khoản không ACTIVE: thông báo chung “Tên đăng nhập hoặc mật khẩu không đúng.”, không tiết lộ tài khoản có tồn tại. Không mô tả thông báo riêng cho tài khoản khóa nếu code chưa cung cấp.
  Kết quả yêu cầu: E1. Sai tên/mật khẩu hoặc tài khoản không ACTIVE: thông báo chung “Tên đăng nhập hoặc mật khẩu không đúng.”, không tiết lộ tài khoản có tồn tại. Không mô tả thông báo riêng cho tài khoản khóa nếu code chưa cung cấp.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-01-EX-05** [EX] E2. Bỏ trống, sai kiểu hoặc quá độ dài: báo kiểm tra trường. Sau 5 lần sai trong cửa sổ 15 phút theo tài khoản hoặc IP: chặn tạm 429; không thử liên tục.
  Kết quả yêu cầu: E2. Bỏ trống, sai kiểu hoặc quá độ dài: báo kiểm tra trường. Sau 5 lần sai trong cửa sổ 15 phút theo tài khoản hoặc IP: chặn tạm 429; không thử liên tục.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-01-EX-06** [EX] E3. Phiên hết hạn không hoạt động/tối đa thời gian, đổi mật khẩu/quyền/khóa/xóa mềm: yêu cầu đăng nhập lại; cookie và CSRF cũ không cấp quyền.
  Kết quả yêu cầu: E3. Phiên hết hạn không hoạt động/tối đa thời gian, đổi mật khẩu/quyền/khóa/xóa mềm: yêu cầu đăng nhập lại; cookie và CSRF cũ không cấp quyền.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-12

Tiền điều kiện: Đăng nhập đúng quyền; QC chỉ xem các kết quả thuộc đợt được phân công.

- **UC-12-MAIN-01** [MAIN] 1. Mở Kết quả kiểm tra QC/AC. -> 2. Hiển thị mã, đợt, ngày và trạng thái; lọc/tìm/phân trang theo trường API được hỗ trợ.
3. Mở chi tiết. -> 4. Hiển thị từng dòng lô, lượng kiểm/đạt/lỗi, mô tả; chỉ người lập gốc có thao tác bù theo điều kiện.
  Kết quả yêu cầu: Hiển thị kết quả và thao tác hợp lệ; không đổi tồn khi chỉ xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12-ALT-02** [ALT] A1. Tạo kết quả tại UC-12.1; điều chỉnh dùng UC-12.2. Kết quả RECORDED không xóa ở UC-12.3.
  Kết quả yêu cầu: A1. Tạo kết quả tại UC-12.1; điều chỉnh dùng UC-12.2. Kết quả RECORDED không xóa ở UC-12.3.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12-ALT-03** [ALT] A2. Kết quả QC không tự là biên bản chung; người được chỉ định lập UC-28 tổng hợp cả QC và số đếm.
  Kết quả yêu cầu: A2. Kết quả QC không tự là biên bản chung; người được chỉ định lập UC-28 tổng hợp cả QC và số đếm.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12-EX-04** [EX] E1. Không có kết quả/lọc không phù hợp: bảng rỗng. Kết quả ngoài phân công không đọc được.
  Kết quả yêu cầu: E1. Không có kết quả/lọc không phù hợp: bảng rỗng. Kết quả ngoài phân công không đọc được.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12-EX-05** [EX] E2. QC/AC không được xử lý ngoại lệ; ghi lỗi trong kết quả và mô tả ngoại lệ trên biên bản, quản lý thực hiện xử lý.
  Kết quả yêu cầu: E2. QC/AC không được xử lý ngoại lệ; ghi lỗi trong kết quả và mô tả ngoại lệ trên biên bản, quản lý thực hiện xử lý.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-12.1

Tiền điều kiện: Đợt/công việc IN_PROGRESS, có dòng lô PENDING chưa có kết quả; QC được giao trong phạm vi.

- **UC-12.1-MAIN-01** [MAIN] 1. Tạo kiểm tra hoặc chọn Ghi kết quả kiểm tra trong công việc. -> 2. Hiển thị đợt được giao và các phần lô chờ QC, gợi ý lượng kiểm/đạt.
3. Nhập thời điểm kiểm, kiểm/đạt/lỗi và mô tả từng dòng. -> 4. Kiểm toàn bộ lượng của dòng; đạt+lỗi=kiểm=thực nhận của dòng, không kiểm lặp cùng dòng.
5. Xác nhận. -> 6. Lưu kết quả/lịch sử, trạng thái lô; chỉ khi các nhiệm vụ lượng/QC được giao đều xong mới hoàn thành đợt.
  Kết quả yêu cầu: Lưu RECORDED và các dòng kết quả; cập nhật PASSED/FAILED/PARTIAL của lô, tiến độ đợt; phần NVL lỗi trước nhập được ghi chứng từ trả theo quy tắc. Chưa tăng tồn phần đạt.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.1-ALT-02** [ALT] A1. Toàn đạt: failed=0; toàn lỗi: passed=0; hỗn hợp: PARTIAL. Lượng lỗi>0 phải có mô tả.
  Kết quả yêu cầu: A1. Toàn đạt: failed=0; toàn lỗi: passed=0; hỗn hợp: PARTIAL. Lượng lỗi>0 phải có mô tả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.1-ALT-03** [ALT] A2. Phần đạt cần UC-23 → quản lý phân công → UC-10 mới vào tồn. NVL lỗi trả NCC trước nhập, TP lỗi xử lý theo ngoại lệ; không đưa phần lỗi vào AVAILABLE.
  Kết quả yêu cầu: A2. Phần đạt cần UC-23 → quản lý phân công → UC-10 mới vào tồn. NVL lỗi trả NCC trước nhập, TP lỗi xử lý theo ngoại lệ; không đưa phần lỗi vào AVAILABLE.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.1-ALT-04** [ALT] A3. Hàng khách trả đã nhận vào cách ly có thể QC theo luồng riêng, không tự giải phóng tồn từ việc đạt QC.
  Kết quả yêu cầu: A3. Hàng khách trả đã nhận vào cách ly có thể QC theo luồng riêng, không tự giải phóng tồn từ việc đạt QC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.1-EX-05** [EX] E1. Đợt chưa bắt đầu/hoàn tất, không giao cho QC, lô đã có kết quả/trùng dòng/sai nguồn, kiểm không đủ toàn bộ, tổng đạt+lỗi không bằng kiểm: chặn.
  Kết quả yêu cầu: E1. Đợt chưa bắt đầu/hoàn tất, không giao cho QC, lô đã có kết quả/trùng dòng/sai nguồn, kiểm không đủ toàn bộ, tổng đạt+lỗi không bằng kiểm: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.1-EX-06** [EX] E2. Sai thời điểm kiểm, số âm/sai độ chính xác/thiếu mô tả lỗi hoặc thông tin bắt buộc: không ghi một phần.
  Kết quả yêu cầu: E2. Sai thời điểm kiểm, số âm/sai độ chính xác/thiếu mô tả lỗi hoặc thông tin bắt buộc: không ghi một phần.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-12.2 Điều chỉnh kết quả kiểm tra QC/AC bằng chứng từ bù

Tiền điều kiện: Kết quả RECORDED thuộc người lập, version mới; dòng chưa nhập/phân bổ/trả/được đề xuất ngoại lệ bảo vệ để bù trực tiếp.

- **UC-12.2-MAIN-01** [MAIN] 1. Mở chi tiết kết quả và chọn Chứng từ bù QC. -> 2. Hiển thị dòng và số đạt/lỗi/mô tả hiện tại, giải thích nhập kết quả mới chứ không phải số chênh.
3. Chọn dòng, nhập số đạt/lỗi mới và lý do; mô tả nếu có lỗi. -> 4. Kiểm đúng người lập/version, đạt+lỗi bằng lượng kiểm gốc, dòng đúng kết quả và chưa có tham chiếu khóa.
5. Lưu. -> 6. Ghi trước/sau vào lịch sử bù, cập nhật kết quả/lô và version trong transaction; giữ lịch sử gốc qua chứng từ bù.
  Kết quả yêu cầu: Lưu chứng từ bù trước/sau/lý do, cập nhật kết quả và qc_status/version; không thay phiếu kho gốc hoặc tự đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.2-ALT-02** [ALT] A1. Hủy giữ kết quả cũ. Có thể bù nhiều lần khi vẫn đủ điều kiện, mỗi lần có version/lý do riêng.
  Kết quả yêu cầu: A1. Hủy giữ kết quả cũ. Có thể bù nhiều lần khi vẫn đủ điều kiện, mỗi lần có version/lý do riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.2-ALT-03** [ALT] A2. Hàng đã nhập: chuyển luồng điều chỉnh QC qua ngoại lệ được giám đốc duyệt, QC xác nhận và quản lý áp dụng riêng. Không dùng nút bù trực tiếp để sửa tồn.
  Kết quả yêu cầu: A2. Hàng đã nhập: chuyển luồng điều chỉnh QC qua ngoại lệ được giám đốc duyệt, QC xác nhận và quản lý áp dụng riêng. Không dùng nút bù trực tiếp để sửa tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.2-EX-04** [EX] E1. PATCH sửa đè kết quả bị chặn COMPENSATION_REQUIRED. Dòng đã có phiếu/phân bổ còn hiệu lực/hàng trả/đề xuất chưa bị từ chối bị chặn IN_USE.
  Kết quả yêu cầu: E1. PATCH sửa đè kết quả bị chặn COMPENSATION_REQUIRED. Dòng đã có phiếu/phân bổ còn hiệu lực/hàng trả/đề xuất chưa bị từ chối bị chặn IN_USE.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.2-EX-05** [EX] E2. NVL từ đơn mua mà kết quả mới còn lỗi bị chặn ở đường bù trực tiếp; cần chứng từ trả đúng kết luận.
  Kết quả yêu cầu: E2. NVL từ đơn mua mà kết quả mới còn lỗi bị chặn ở đường bù trực tiếp; cần chứng từ trả đúng kết luận.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.2-EX-06** [EX] E3. Đạt+lỗi sai tổng, số sai, lý do trống, mô tả lỗi thiếu, trùng dòng, dòng ngoài kết quả hoặc QC khác người lập: không bù.
  Kết quả yêu cầu: E3. Đạt+lỗi sai tổng, số sai, lý do trống, mô tả lỗi thiếu, trùng dòng, dòng ngoài kết quả hoặc QC khác người lập: không bù.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-12.3 Xóa kết quả kiểm tra QC/AC — NGỪNG SỬ DỤNG

Tiền điều kiện: Có kết quả QC đã RECORDED; hành vi xóa không được cung cấp như nghiệp vụ thành công.

- **UC-12.3-MAIN-01** [MAIN] 1. Người dùng xem kết quả đã ghi. -> 2. Giao diện không cấp thao tác xóa kết quả như quy trình hợp lệ.
3. Nếu gọi DELETE trực tiếp. -> 4. Server trả 409 COMPENSATION_REQUIRED: “Không xóa kết quả QC đã ghi.”; không thay đổi dữ liệu.
  Kết quả yêu cầu: Không xóa kết quả đã ghi, không mất lịch sử; muốn sửa sai dùng UC-12.2 hoặc luồng ngoại lệ hàng đã nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.3-ALT-02** [ALT] A1. Thay thế bằng chứng từ bù UC-12.2 cho sai sót đủ điều kiện.
  Kết quả yêu cầu: A1. Thay thế bằng chứng từ bù UC-12.2 cho sai sót đủ điều kiện.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.3-ALT-03** [ALT] A2. Kết quả đã làm căn cứ nhập kho phải theo luồng điều chỉnh/phê duyệt; không xóa hồ sơ gốc.
  Kết quả yêu cầu: A2. Kết quả đã làm căn cứ nhập kho phải theo luồng điều chỉnh/phê duyệt; không xóa hồ sơ gốc.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.3-EX-04** [EX] E1. Không giữ luồng “kiểm chưa dùng rồi xóa thành công”: route hiện không cho xóa ngay cả khi chưa có phiếu nhập.
  Kết quả yêu cầu: E1. Không giữ luồng “kiểm chưa dùng rồi xóa thành công”: route hiện không cho xóa ngay cả khi chưa có phiếu nhập.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-12.3-EX-05** [EX] E2. Giữ bảng UC cũ để truy vết theo yêu cầu không đổi cấu trúc; ghi quyết định ngừng dùng ở phần cuối tài liệu.
  Kết quả yêu cầu: E2. Giữ bảng UC cũ để truy vết theo yêu cầu không đổi cấu trúc; ghi quyết định ngừng dùng ở phần cuối tài liệu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-34

Tiền điều kiện: KHSX APPROVED/IN_PROGRESS đúng xưởng, chưa hoàn tất; không dùng UC này để tạo phần lô.

- **UC-34-MAIN-01** [MAIN] 1. Mở Lập báo cáo sản xuất, chọn KHSX và mục đích TIEN_DO/SU_CO/NHU_CAU. -> 2. Hiển thị kế hoạch/xưởng và nội dung theo mục đích; có đối chiếu NVL khi nhu cầu.
3. Nhập tiến độ 0 đến dưới 100%, mô tả/ghi chú và dữ liệu NVL nếu là báo cáo nhu cầu. -> 4. Tồn khả dụng lấy hệ thống, tính thiếu=max(cần−khả dụng,0); không tin lượng tồn client tự khai.
5. Dán/tải ảnh trong mô tả nếu cần, lưu nháp và chọn gửi. -> 6. Kiểm quyền/kế hoạch/version/mục đích; gửi giám đốc luôn, planner khi tùy chọn hoặc bắt buộc khi NHU_CAU có thiếu.
  Kết quả yêu cầu: Báo cáo SAN_XUAT lưu DRAFT, khi SUBMITTED gửi giám đốc; NHU_CAU còn thiếu tự gửi thêm planner. Không tạo lô/tồn từ báo cáo tiến độ/sự cố.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-ALT-02** [ALT] A1. Tiến độ/sự cố có thể lập nhiều lần, không bắt buộc có dòng NVL và không trở thành nguồn kế hoạch MUA.
  Kết quả yêu cầu: A1. Tiến độ/sự cố có thể lập nhiều lần, không bắt buộc có dòng NVL và không trở thành nguồn kế hoạch MUA.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-ALT-03** [ALT] A2. NHU_CAU có thể từ bảng đối chiếu, tự chụp ảnh/dán vào mô tả; một báo cáo nhu cầu đang hiệu lực/KHSX, không bổ sung dự phòng lần nữa.
  Kết quả yêu cầu: A2. NHU_CAU có thể từ bảng đối chiếu, tự chụp ảnh/dán vào mô tả; một báo cáo nhu cầu đang hiệu lực/KHSX, không bổ sung dự phòng lần nữa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-ALT-04** [ALT] A3. Chọn không gửi planner chỉ có tác dụng nếu quy tắc cho phép; NHU_CAU còn thiếu vẫn tự gửi planner. Báo cáo đã gửi bất biến, chỉ lưu nháp không phải đã gửi.
  Kết quả yêu cầu: A3. Chọn không gửi planner chỉ có tác dụng nếu quy tắc cho phép; NHU_CAU còn thiếu vẫn tự gửi planner. Báo cáo đã gửi bất biến, chỉ lưu nháp không phải đã gửi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-EX-05** [EX] E1. Tiến độ 100%/âm/sai số; KHSX completed/ngoài xưởng/chưa duyệt; báo cáo nhu cầu hiệu lực trùng hoặc trường sai: chặn.
  Kết quả yêu cầu: E1. Tiến độ 100%/âm/sai số; KHSX completed/ngoài xưởng/chưa duyệt; báo cáo nhu cầu hiệu lực trùng hoặc trường sai: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-EX-06** [EX] E2. Ảnh không đúng PNG/JPEG/WebP, quá giới hạn hoặc truy cập ảnh ngoài quyền: chặn; không hứa ảnh dán từ nguồn ngoài luôn tải được.
  Kết quả yêu cầu: E2. Ảnh không đúng PNG/JPEG/WebP, quá giới hạn hoặc truy cập ảnh ngoài quyền: chặn; không hứa ảnh dán từ nguồn ngoài luôn tải được.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-34-EX-07** [EX] E3. Không tự sửa nội dung báo cáo nguồn đã gửi/đã dùng. Tiến độ máy hỏng không tự tạo kế hoạch mua/đợt kiểm kê.
  Kết quả yêu cầu: E3. Không tự sửa nội dung báo cáo nguồn đã gửi/đã dùng. Tiến độ máy hỏng không tự tạo kế hoạch mua/đợt kiểm kê.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-15

Tiền điều kiện: STOCKTAKER đăng nhập, được phân công; đợt/công việc đã bắt đầu và còn dòng chưa kiểm lượng.

- **UC-15-MAIN-01** [MAIN] 1. Mở Quản lý kiểm kê → Tạo mới, chọn công việc. -> 2. Hiển thị toàn bộ dòng lô trong công việc: lượng ghi nhận, số đếm còn trống hoặc đã ghi.
3. Nhập số đếm thực tế cho tất cả dòng chưa kiểm. -> 4. Cho số 0; trống khác 0. Tick Đạt từng dòng điền bằng lượng ghi nhận; Đạt tất cả điền toàn bộ dòng chưa ghi.
5. Xác nhận lưu. -> 6. Kiểm đủ dòng, không trùng/ngoài phạm vi, version và trạng thái; ghi một lần theo transaction; đợt có cả QC chỉ hoàn tất khi cả hai nội dung xong.
  Kết quả yêu cầu: Ghi số đếm thực tế và người/thời điểm kiểm; hoàn thành phần kiểm lượng khi đủ dòng. Không tự thay đổi TonKho hoặc kết luận QC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-ALT-02** [ALT] A1. Sửa lượng khác lượng ghi nhận tự bỏ tick; bỏ tick bằng tay xóa gợi ý để nhập lại. Nút Đạt không phải kết luận đạt chất lượng.
  Kết quả yêu cầu: A1. Sửa lượng khác lượng ghi nhận tự bỏ tick; bỏ tick bằng tay xóa gợi ý để nhập lại. Nút Đạt không phải kết luận đạt chất lượng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-ALT-03** [ALT] A2. Các dòng đã ghi không bị Đạt tất cả sửa; không ghi đè số đếm đã xác nhận.
  Kết quả yêu cầu: A2. Các dòng đã ghi không bị Đạt tất cả sửa; không ghi đè số đếm đã xác nhận.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-ALT-04** [ALT] A3. Luồng kiểm kê kho cũ dùng snapshot theo kho/vị trí/bucket, khóa kho khi bắt đầu, kết luận từng kho; phân biệt với kiểm lượng phần lô trong công việc mới.
  Kết quả yêu cầu: A3. Luồng kiểm kê kho cũ dùng snapshot theo kho/vị trí/bucket, khóa kho khi bắt đầu, kết luận từng kho; phân biệt với kiểm lượng phần lô trong công việc mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-EX-05** [EX] E1. Chưa bắt đầu/chưa tới ngày mà chưa bật giả lập, không được phân công, thiếu dòng, số âm/sai kiểu/trùng dòng/ngoài lô: chặn.
  Kết quả yêu cầu: E1. Chưa bắt đầu/chưa tới ngày mà chưa bật giả lập, không được phân công, thiếu dòng, số âm/sai kiểu/trùng dòng/ngoài lô: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-EX-06** [EX] E2. Không mô tả Lưu tạm hoặc tự lưu offline cho bảng toàn công việc nếu giao diện không có. Lỗi request giữ form hiện tại; đóng/reload không được hứa khôi phục cục bộ.
  Kết quả yêu cầu: E2. Không mô tả Lưu tạm hoặc tự lưu offline cho bảng toàn công việc nếu giao diện không có. Lỗi request giữ form hiện tại; đóng/reload không được hứa khôi phục cục bộ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-15-EX-07** [EX] E3. Đã có số đếm hoặc version đổi: không ghi lại âm thầm.
  Kết quả yêu cầu: E3. Đã có số đếm hoặc version đổi: không ghi lại âm thầm.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-28

Tiền điều kiện: Đợt đã hoàn tất đủ các nội dung được giao; người lập thuộc danh sách phân công; chưa có biên bản hoặc bản nháp còn được sửa.

- **UC-28-MAIN-01** [MAIN] 1. Mở Biên bản kiểm kê. -> 2. Mọi QC/Ban kiểm kê vẫn có giao diện danh sách trong phạm vi; chỉ người được chỉ định thấy phân công và nút tạo khi đủ điều kiện.
3. Người được chỉ định chọn đợt, nhập kết luận; chọn Không có ngoại lệ hoặc Nhập mô tả ngoại lệ. -> 4. Nếu có ngoại lệ hiện textarea bắt buộc; tổng hợp cả số đếm và QC theo nhiệm vụ, không ép đợt chỉ QC phải có số đếm.
5. Lưu nháp rồi xem lại/Sửa/Gửi. -> 6. Gửi tạo bản chụp dữ liệu chung, lưu người/thời điểm, gửi giám đốc; có ngoại lệ gửi quản lý xử lý.
  Kết quả yêu cầu: Lưu nháp hoặc gửi một biên bản chung của đợt; gửi chụp số đếm+QC và khóa sửa; báo giám đốc, ngoại lệ đã gửi hiện cho quản lý.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-28-ALT-02** [ALT] A1. Đợt có cả hai nhóm chờ cả hai; chỉ QC/chỉ kiểm lượng tổng hợp đúng nội dung được giao.
  Kết quả yêu cầu: A1. Đợt có cả hai nhóm chờ cả hai; chỉ QC/chỉ kiểm lượng tổng hợp đúng nội dung được giao.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-28-ALT-03** [ALT] A2. Người khác vẫn xem danh sách/biên bản trong phạm vi nhưng không tạo/sửa/gửi. Đổi người lập trước gửi làm quyền đổi theo phân công mới.
  Kết quả yêu cầu: A2. Người khác vẫn xem danh sách/biên bản trong phạm vi nhưng không tạo/sửa/gửi. Đổi người lập trước gửi làm quyền đổi theo phân công mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-28-ALT-04** [ALT] A3. Biên bản legacy theo từng kho được phân công khác với biên bản lô chung của công việc mới.
  Kết quả yêu cầu: A3. Biên bản legacy theo từng kho được phân công khác với biên bản lô chung của công việc mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-28-EX-05** [EX] E1. Chưa hoàn thành, chưa chỉ định/không đúng người, đợt ngoài phân công, thiếu kết luận hoặc chọn ngoại lệ không mô tả: chặn.
  Kết quả yêu cầu: E1. Chưa hoàn thành, chưa chỉ định/không đúng người, đợt ngoài phân công, thiếu kết luận hoặc chọn ngoại lệ không mô tả: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-28-EX-06** [EX] E2. Lập trùng, bản đã gửi, version cũ: không ghi đè. Sửa QC sau đó không tự viết lại bản chụp biên bản đã gửi.
  Kết quả yêu cầu: E2. Lập trùng, bản đã gửi, version cũ: không ghi đè. Sửa QC sau đó không tự viết lại bản chụp biên bản đã gửi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-32

Tiền điều kiện: Kế hoạch MUA/BAN PENDING_APPROVAL và version mới; nguồn/lịch đủ điều kiện.

- **UC-32-MAIN-01** [MAIN] 1. Mở kế hoạch mua/bán chờ duyệt. -> 2. Hiển thị loại, dòng, ngày, tổng và nguồn; BAN đối chiếu thành phẩm/tồn, MUA nguồn nhu cầu nếu có.
3. Chọn Phê duyệt hoặc Từ chối. -> 4. Kiểm lại nguồn, lịch, trạng thái/version và lượng; vượt lượng dự kiến hỏi xác nhận.
5. Xác nhận tiếp tục hoặc nhập lý do từ chối. -> 6. Lưu quyết định, người/thời gian/lịch sử và thông báo theo nhánh; planner có thể sửa kế hoạch REJECTED.
  Kết quả yêu cầu: Duyệt sang APPROVED hoặc từ chối sang REJECTED kèm lý do; không tự mua/nhập/xuất/tăng tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-32-ALT-02** [ALT] A1. Duyệt MUA cho purchaser thực hiện UC-27. Duyệt BAN cho triển khai yêu cầu/giao hàng đủ điều kiện; không tự xuất bán.
  Kết quả yêu cầu: A1. Duyệt MUA cho purchaser thực hiện UC-27. Duyệt BAN cho triển khai yêu cầu/giao hàng đủ điều kiện; không tự xuất bán.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-32-ALT-03** [ALT] A2. Hủy modal hoặc từ chối cảnh báo không duyệt. Cùng khóa cùng quyết định replay đúng kết quả.
  Kết quả yêu cầu: A2. Hủy modal hoặc từ chối cảnh báo không duyệt. Cùng khóa cùng quyết định replay đúng kết quả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-32-EX-04** [EX] E1. Từ chối thiếu lý do, sai trạng thái/version/loại nguồn/ngày: chặn.
  Kết quả yêu cầu: E1. Từ chối thiếu lý do, sai trạng thái/version/loại nguồn/ngày: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-32-EX-05** [EX] E2. BAN không đủ thành phẩm QC đạt/đã nhập/còn khả dụng có thể bị chặn INSUFFICIENT_STOCK; xác nhận vượt lượng kế hoạch không thay thế điều kiện thực tế.
  Kết quả yêu cầu: E2. BAN không đủ thành phẩm QC đạt/đã nhập/còn khả dụng có thể bị chặn INSUFFICIENT_STOCK; xác nhận vượt lượng kế hoạch không thay thế điều kiện thực tế.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-02

Tiền điều kiện: Đăng nhập vai trò CUSTOMER, có hồ sơ khách hàng và có thành phẩm mẫu đang công bố/hoạt động.

- **UC-02-MAIN-01** [MAIN] 1. Mở Đặt bánh. -> 2. Hiển thị thành phẩm được đặt, danh mục, đơn vị, giá tham khảo và form giao hàng.
3. Chọn một hoặc nhiều mặt hàng, lượng, ghi chú từng dòng; nhập địa chỉ, ngày muốn nhận trễ nhất và ghi chú chung. -> 4. Tính tổng tham khảo; server lấy giá hiện hành của mặt hàng, không tin đơn giá client tự gửi.
5. Gửi đơn đặt hàng. -> 6. Kiểm tra 1–100 dòng, không trùng, lượng dương, hàng được công bố, địa chỉ và ngày không quá khứ; lưu đơn/dòng trong transaction, hiển thị kết quả và chuyển chi tiết.
  Kết quả yêu cầu: Tạo một DonHang trạng thái SUBMITTED (Chờ tiếp nhận), các dòng ChiTietDonHang và thông báo planner; chưa tạo tồn kho hay lô vật lý.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-02-ALT-02** [ALT] A1. Thay đổi lượng trên form cập nhật tổng; chưa gửi thì chưa có đơn.
  Kết quả yêu cầu: A1. Thay đổi lượng trên form cập nhật tổng; chưa gửi thì chưa có đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-02-ALT-03** [ALT] A2. Nhiều thành phẩm nằm chung một đơn; không coi việc đặt đơn là đã tạo một đầu lô/thực nhận kho.
  Kết quả yêu cầu: A2. Nhiều thành phẩm nằm chung một đơn; không coi việc đặt đơn là đã tạo một đầu lô/thực nhận kho.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-02-EX-04** [EX] E1. Không chọn mặt hàng, lượng không hợp lệ, trùng mặt hàng, hàng không phải thành phẩm mẫu hoặc đã ngừng công bố: không tạo đơn.
  Kết quả yêu cầu: E1. Không chọn mặt hàng, lượng không hợp lệ, trùng mặt hàng, hàng không phải thành phẩm mẫu hoặc đã ngừng công bố: không tạo đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-02-EX-05** [EX] E2. Ngày không hợp lệ/quá khứ; thiếu địa chỉ/hồ sơ khách: từ chối, giữ form.
  Kết quả yêu cầu: E2. Ngày không hợp lệ/quá khứ; thiếu địa chỉ/hồ sơ khách: từ chối, giữ form.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-02-EX-06** [EX] E3. Tổng tiền vượt giới hạn lưu trữ: chặn. Không có giao dịch thanh toán, đặt cọc, giữ hàng hoặc giao vận tự động.
  Kết quả yêu cầu: E3. Tổng tiền vượt giới hạn lưu trữ: chặn. Không có giao dịch thanh toán, đặt cọc, giữ hàng hoặc giao vận tự động.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-03

Tiền điều kiện: Đã đăng nhập; quyền chỉ trên đơn thuộc hồ sơ khách của chính tài khoản.

- **UC-03-MAIN-01** [MAIN] 1. Mở Đơn hàng. -> 2. Hiển thị danh sách, mã, trạng thái, giá trị, hạn giao; tìm kiếm/lọc/phân trang theo trường thực tế của màn hình.
3. Chọn chi tiết. -> 4. Hiển thị địa chỉ, ghi chú, các dòng hàng/đơn vị/giá/lượng và KHSX liên quan nếu được cung cấp; chỉ hiện thao tác đúng trạng thái.
  Kết quả yêu cầu: Danh sách/chi tiết đúng phạm vi, không thay đổi đơn khi chỉ xem.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03-ALT-02** [ALT] A1. Chọn Sửa đi UC-03.1. Không có nút trực tiếp phê duyệt đơn cho khách.
  Kết quả yêu cầu: A1. Chọn Sửa đi UC-03.1. Không có nút trực tiếp phê duyệt đơn cho khách.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03-ALT-03** [ALT] A2. Theo dõi trạng thái: planner tiếp nhận; duyệt KHSX tại UC-31 làm đơn nguồn APPROVED; ghi giao thực tế cập nhật thực hiện đơn.
  Kết quả yêu cầu: A2. Theo dõi trạng thái: planner tiếp nhận; duyệt KHSX tại UC-31 làm đơn nguồn APPROVED; ghi giao thực tế cập nhật thực hiện đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03-EX-04** [EX] E1. Đổi ID sang đơn của khách khác hoặc tài khoản không có hồ sơ: không đọc/sửa được.
  Kết quả yêu cầu: E1. Đổi ID sang đơn của khách khác hoặc tài khoản không có hồ sơ: không đọc/sửa được.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03-EX-05** [EX] E2. Bộ lọc/status/sort hoặc trang không hợp lệ: báo kiểm tra; không tự mở dữ liệu ngoài phạm vi.
  Kết quả yêu cầu: E2. Bộ lọc/status/sort hoặc trang không hợp lệ: báo kiểm tra; không tự mở dữ liệu ngoài phạm vi.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-03.1

Tiền điều kiện: Đơn của chính khách ở SUBMITTED hoặc RECEIVED, còn được sửa và có version mới nhất.

- **UC-03.1-MAIN-01** [MAIN] 1. Mở chi tiết và chọn Sửa. -> 2. Hiển thị dữ liệu hiện tại; số nguyên 100 không hiển thị thành 100,000 để gây nhầm.
3. Sửa địa chỉ, ngày, ghi chú hoặc dòng hàng/lượng và xác nhận thay đổi lượng khi có đổi. -> 4. Kiểm quyền/version/trạng thái, hàng được phép và nguồn KHSX đã lập.
5. Lưu. -> 6. Cập nhật dòng/giá tham khảo/tổng và version trong transaction, thông báo kết quả; hủy thì giữ dữ liệu cũ.
  Kết quả yêu cầu: Cập nhật dữ liệu hợp lệ/version/lịch sử; giữ trạng thái hiện tại, không tự đặt lại trạng thái chờ duyệt hoặc tự phê duyệt.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03.1-ALT-02** [ALT] A1. Tăng hoặc giảm/thêm bỏ dòng phải có quantity_change_acknowledged=true; không tự tính đền bù/đặt cọc.
  Kết quả yêu cầu: A1. Tăng hoặc giảm/thêm bỏ dòng phải có quantity_change_acknowledged=true; không tự tính đền bù/đặt cọc.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03.1-ALT-03** [ALT] A2. Hủy sửa đóng form; thay đổi chưa lưu không làm đổi đơn.
  Kết quả yêu cầu: A2. Hủy sửa đóng form; thay đổi chưa lưu không làm đổi đơn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03.1-EX-04** [EX] E1. Đơn đã APPROVED/IN_PROGRESS hoặc trạng thái khác được phép: chặn sửa.
  Kết quả yêu cầu: E1. Đơn đã APPROVED/IN_PROGRESS hoặc trạng thái khác được phép: chặn sửa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03.1-EX-05** [EX] E2. Ngày nhận mới trước kết thúc KHSX còn hiệu lực: chặn. Số lượng mới thấp hơn tổng KHSX đã lập hiện bị chặn SOURCE_LIMIT_EXCEEDED; đây là giới hạn thực tế cần phân biệt với cảnh báo vượt lượng khi sửa KHSX.
  Kết quả yêu cầu: E2. Ngày nhận mới trước kết thúc KHSX còn hiệu lực: chặn. Số lượng mới thấp hơn tổng KHSX đã lập hiện bị chặn SOURCE_LIMIT_EXCEEDED; đây là giới hạn thực tế cần phân biệt với cảnh báo vượt lượng khi sửa KHSX.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-03.1-EX-06** [EX] E3. Chưa tick xác nhận thay đổi lượng, version cũ, hàng không công bố hoặc dữ liệu sai: không lưu.
  Kết quả yêu cầu: E3. Chưa tick xác nhận thay đổi lượng, version cũ, hàng không công bố hoặc dữ liệu sai: không lưu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-22

Tiền điều kiện: Đúng vai trò; quyền đọc kho chung không cấp quyền quản lý danh mục hoặc chứng từ xưởng khác.

- **UC-22-MAIN-01** [MAIN] 1. Mở Tra cứu kho. -> 2. Hiển thị kho, nhóm danh mục, tìm kiếm và sơ đồ vị trí có trong CSDL, không tự vẽ thêm 48 vị trí giả.
3. Chọn kho/loại/danh mục/từ khóa/vị trí. -> 4. Hiển thị mặt hàng/lô, đơn vị, lượng hiện có/giữ chỗ/khả dụng và hạn dùng; vị trí trống có trạng thái rõ.
5. Chủ xưởng mở KHSX và chọn Đối chiếu tồn nếu muốn xét nhu cầu SX. -> 6. Tính theo định lượng KHSX đã lưu và tồn khả dụng; thiếu=max(nhu cầu−khả dụng,0), không tự cộng dự phòng lần hai.
  Kết quả yêu cầu: Hiển thị kho/vị trí/mặt hàng và tồn khả dụng thực tế, không tự kiểm đếm vật lý hay thay tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-22-ALT-02** [ALT] A1. Chủ xưởng đọc kho chung nhưng không sửa danh mục; quản lý có quyền quản lý riêng ở UC-06/07.
  Kết quả yêu cầu: A1. Chủ xưởng đọc kho chung nhưng không sửa danh mục; quản lý có quyền quản lý riêng ở UC-06/07.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-22-ALT-03** [ALT] A2. Đối chiếu có thể chụp bảng/dán ảnh vào mô tả báo cáo; đây không phải phiếu kiểm kê.
  Kết quả yêu cầu: A2. Đối chiếu có thể chụp bảng/dán ảnh vào mô tả báo cáo; đây không phải phiếu kiểm kê.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-22-EX-04** [EX] E1. Vai trò khác bị chặn cả trang/API. Không có vị trí/hàng phù hợp giữ danh sách rỗng.
  Kết quả yêu cầu: E1. Vai trò khác bị chặn cả trang/API. Không có vị trí/hàng phù hợp giữ danh sách rỗng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-22-EX-05** [EX] E2. Hàng cách ly, hết hạn và lượng đã giữ cho nhu cầu khác không được tính AVAILABLE khả dụng.
  Kết quả yêu cầu: E2. Hàng cách ly, hết hạn và lượng đã giữ cho nhu cầu khác không được tính AVAILABLE khả dụng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-22-EX-06** [EX] E3. KHSX chưa duyệt/ngoài xưởng/không có định lượng hoặc công thức mẫu thiếu: báo rõ không đủ căn cứ; không tự kết luận đủ NVL.
  Kết quả yêu cầu: E3. KHSX chưa duyệt/ngoài xưởng/không có định lượng hoặc công thức mẫu thiếu: báo rõ không đủ căn cứ; không tự kết luận đủ NVL.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-16

Tiền điều kiện: Biên bản đã SUBMITTED có ngoại lệ OPEN, hoặc có chênh lệch/hàng lỗi đủ điều kiện trong luồng điều chỉnh tồn.

- **UC-16-MAIN-01** [MAIN] 1. Mở Xử lý ngoại lệ/hàng lỗi. -> 2. Tự liệt kê ngoại lệ từ biên bản đã gửi và chứng từ lỗi liên quan, không yêu cầu QC/Ban kiểm kê tạo đề xuất riêng.
3. Mở chi tiết. -> 4. Hiển thị số ghi nhận/đếm/chênh lệch, QC đạt/lỗi, vấn đề và phương án.
5. Nhập cách xử lý, xác nhận trực tiếp hoặc tick đề xuất gửi chủ xưởng, chọn xưởng nhận và ghi mô tả. -> 6. Trực tiếp: lưu RESOLVED. Đề xuất: PENDING_APPROVAL, gửi đúng chủ xưởng, chưa tự điều chỉnh tồn.
  Kết quả yêu cầu: Lưu phương án/trạng thái ngoại lệ và lịch sử; chỉ luồng điều chỉnh tồn có đủ duyệt/kiểm tra và bước thực hiện riêng mới đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-16-ALT-02** [ALT] A1. Chủ xưởng duyệt: quản lý xác nhận thực hiện đúng phương án đã duyệt. Chủ xưởng từ chối: bắt buộc phương án thay thế; quản lý thực hiện đúng chỉ đạo, không sửa khác hoặc gửi lại như đề xuất mới.
  Kết quả yêu cầu: A1. Chủ xưởng duyệt: quản lý xác nhận thực hiện đúng phương án đã duyệt. Chủ xưởng từ chối: bắt buộc phương án thay thế; quản lý thực hiện đúng chỉ đạo, không sửa khác hoặc gửi lại như đề xuất mới.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-16-ALT-03** [ALT] A2. Điều chỉnh số dư kho/bù QC đã nhập thuộc quy trình kỹ thuật: lập đề xuất → DIRECTOR duyệt → QC tái kiểm nếu loại cần → quản lý áp dụng đúng một lần. Không nhầm với ghi cách xử lý ngoại lệ biên bản.
  Kết quả yêu cầu: A2. Điều chỉnh số dư kho/bù QC đã nhập thuộc quy trình kỹ thuật: lập đề xuất → DIRECTOR duyệt → QC tái kiểm nếu loại cần → quản lý áp dụng đúng một lần. Không nhầm với ghi cách xử lý ngoại lệ biên bản.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-16-ALT-04** [ALT] A3. Không có ngoại lệ thì danh sách rỗng; QC/Ban kiểm kê không có quyền xử lý, chỉ ghi mô tả trên biên bản.
  Kết quả yêu cầu: A3. Không có ngoại lệ thì danh sách rỗng; QC/Ban kiểm kê không có quyền xử lý, chỉ ghi mô tả trên biên bản.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-16-EX-05** [EX] E1. Xử lý/duyệt lại sai trạng thái, tự duyệt, sai xưởng, thiếu mô tả hoặc không có chủ xưởng hoạt động khác người xử lý: chặn.
  Kết quả yêu cầu: E1. Xử lý/duyệt lại sai trạng thái, tự duyệt, sai xưởng, thiếu mô tả hoặc không có chủ xưởng hoạt động khác người xử lý: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-16-EX-06** [EX] E2. Sai version, kho đang kiểm kê khóa, lượng vượt nguồn, có giữ chỗ hoặc chưa đủ xác nhận QC: không điều chỉnh tồn.
  Kết quả yêu cầu: E2. Sai version, kho đang kiểm kê khóa, lượng vượt nguồn, có giữ chỗ hoặc chưa đủ xác nhận QC: không điều chỉnh tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-01 Quản lý tài khoản và phân quyền

Tiền điều kiện: ADMIN đang hoạt động; tài khoản đích thuộc hệ thống.

- **UC-BS-01-MAIN-01** [MAIN] 1. Mở Quản lý tài khoản. -> 2. Hiển thị danh sách, tìm kiếm, trạng thái và vai trò bằng tên.
3. Thêm hoặc sửa tên/email/mật khẩu/trạng thái/vai trò; chủ xưởng chọn đúng một xưởng. -> 4. Kiểm username 3–80, mật khẩu 6–128, vai trò không trùng và có thật, xưởng hoạt động; tạo hồ sơ khách khi cấp CUSTOMER.
5. Lưu hoặc Xóa tài khoản có xác nhận. -> 6. Xóa là khóa/ẩn và giữ lịch sử; tăng version/session_version, không cấp ADMIN quyền kho tự động.
  Kết quả yêu cầu: Thêm/sửa/khóa/xóa mềm và quyền/phạm vi cập nhật; chỉnh tài khoản thu hồi phiên cũ, có audit không chứa mật khẩu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-01-ALT-02** [ALT] A1. Sửa để trống mật khẩu giữ mật khẩu cũ; seed không khôi phục mật khẩu/quyền đã chỉnh.
  Kết quả yêu cầu: A1. Sửa để trống mật khẩu giữ mật khẩu cũ; seed không khôi phục mật khẩu/quyền đã chỉnh.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-01-ALT-03** [ALT] A2. ADMIN có thêm vai trò nào thì có quyền nghiệp vụ vai trò đó, không mặc định toàn quyền kho.
  Kết quả yêu cầu: A2. ADMIN có thêm vai trò nào thì có quyền nghiệp vụ vai trò đó, không mặc định toàn quyền kho.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-01-EX-04** [EX] E1. Không tự khóa/xóa/gỡ ADMIN của chính mình; không loại bỏ ADMIN hoạt động cuối cùng.
  Kết quả yêu cầu: E1. Không tự khóa/xóa/gỡ ADMIN của chính mình; không loại bỏ ADMIN hoạt động cuối cùng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-01-EX-05** [EX] E2. Tên đăng nhập/email trùng, email sai, thiếu vai trò, WORKSHOP_OWNER không có đúng một xưởng hoặc vai trò khác gắn xưởng: chặn.
  Kết quả yêu cầu: E2. Tên đăng nhập/email trùng, email sai, thiếu vai trò, WORKSHOP_OWNER không có đúng một xưởng hoặc vai trò khác gắn xưởng: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-01-EX-06** [EX] E3. Non-admin bị chặn UI/API, version cũ không ghi đè.
  Kết quả yêu cầu: E3. Non-admin bị chặn UI/API, version cũ không ghi đè.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-02 Quản lý đơn vị và giá NVL theo nhà cung cấp

Tiền điều kiện: Vai trò được phép; NVL hoạt động, đơn vị/NCC hợp lệ.

- **UC-BS-02-MAIN-01** [MAIN] 1. Mở Đơn vị và giá NVL, chọn NVL. -> 2. Hiển thị đơn vị, giá tham khảo và từng NCC.
3. Quản lý sửa đơn vị/giá hoặc thêm dòng NCC. -> 4. Kiểm version, NCC, trùng NCC, đơn vị và giá 4 số lẻ; lưu/audit.
  Kết quả yêu cầu: Lưu đơn vị/giá tham khảo/bảng giá NCC; đơn mua nhận giá gợi ý nhưng vẫn lưu giá thỏa thuận riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-02-ALT-02** [ALT] A1. Purchaser xem nhưng không sửa bảng giá; chọn NVL/NCC trên đơn mua tự gợi ý giá.
  Kết quả yêu cầu: A1. Purchaser xem nhưng không sửa bảng giá; chọn NVL/NCC trên đơn mua tự gợi ý giá.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-02-ALT-03** [ALT] A2. Khách chỉ thấy giá tham khảo mặt hàng, không nhận JSON giá NCC.
  Kết quả yêu cầu: A2. Khách chỉ thấy giá tham khảo mặt hàng, không nhận JSON giá NCC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-02-EX-04** [EX] E1. NVL đã có lô/đơn mua/dòng kế hoạch không đổi đơn vị.
  Kết quả yêu cầu: E1. NVL đã có lô/đơn mua/dòng kế hoạch không đổi đơn vị.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-02-EX-05** [EX] E2. Giá âm/sai số, NCC không hoạt động/trùng hoặc quyền sai: chặn.
  Kết quả yêu cầu: E2. Giá âm/sai số, NCC không hoạt động/trùng hoặc quyền sai: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-03 Điều phối yêu cầu và phân công kho

Tiền điều kiện: Yêu cầu nguồn đủ điều kiện, quản lý được chọn đúng phạm vi, nhân viên kho hoạt động.

- **UC-BS-03-MAIN-01** [MAIN] 1. Mở yêu cầu cần xử lý, xem nguồn/lô/ngày giờ. -> 2. Gợi ý lượng còn lại và lô đủ điều kiện.
3. Chọn nhân viên, thời gian, dòng/lô/vị trí/bucket và lượng; xác nhận. -> 4. Kiểm vai trò/lịch/kho khóa/khả dụng/QC, tạo giữ chỗ không tự hết hạn và thông báo nhân viên.
  Kết quả yêu cầu: Tạo công việc/phân công/giữ chỗ; chưa đổi tồn. Ghi phiếu ở UC-10/11 mới đổi tồn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-03-ALT-02** [ALT] A1. Nhiều nhân viên nhận phần riêng; mỗi người chỉ ghi phần được giao.
  Kết quả yêu cầu: A1. Nhiều nhân viên nhận phần riêng; mỗi người chỉ ghi phần được giao.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-03-ALT-03** [ALT] A2. Hủy phân công giải phóng phần chưa ghi, không hoàn tác lượng đã POSTED.
  Kết quả yêu cầu: A2. Hủy phân công giải phóng phần chưa ghi, không hoàn tác lượng đã POSTED.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-03-EX-04** [EX] E1. Không đủ khả dụng, lô lỗi/hết hạn/cách ly, vượt nguồn, trùng giữ chỗ, sai người hoặc lịch: chặn.
  Kết quả yêu cầu: E1. Không đủ khả dụng, lô lỗi/hết hạn/cách ly, vượt nguồn, trùng giữ chỗ, sai người hoặc lịch: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-03-EX-05** [EX] E2. Hai phân công tranh cùng tồn không được vượt khả dụng; khóa/transaction kiểm lại.
  Kết quả yêu cầu: E2. Hai phân công tranh cùng tồn không được vượt khả dụng; khóa/transaction kiểm lại.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-04 Ghi nhận lô NVL thực nhận

Tiền điều kiện: Có đơn mua và dòng NVL còn lượng nhận, NCC/nguồn hợp lệ.

- **UC-BS-04-MAIN-01** [MAIN] 1. Chọn đơn mua hoặc dòng mua khi ghi nhận lô. -> 2. Hiển thị lượng còn có thể nhận theo từng NVL/NCC.
3. Nhập mã lô, lượng thực nhận, ngày/hạn dùng theo trường được hỗ trợ. -> 4. Kiểm tổng nhận cộng dồn, loại, nguồn và lô; tạo đúng các dòng/đầu lô.
  Kết quả yêu cầu: Tạo đầu lô/dòng lô thực nhận PENDING QC; không tự tạo tồn AVAILABLE.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-04-ALT-02** [ALT] A1. Có thể nhiều lần nhận/multiple lines theo quy tắc nguồn; QC theo từng dòng phần.
  Kết quả yêu cầu: A1. Có thể nhiều lần nhận/multiple lines theo quy tắc nguồn; QC theo từng dòng phần.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-04-ALT-03** [ALT] A2. Purchaser đặt mua xong chưa có lô thực nhận là bình thường; không tự sinh lô chỉ vì tới ngày giao.
  Kết quả yêu cầu: A2. Purchaser đặt mua xong chưa có lô thực nhận là bình thường; không tự sinh lô chỉ vì tới ngày giao.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-04-EX-04** [EX] E1. Vượt lượng mua còn lại, dòng sai đơn, trùng mã, NCC trộn không hợp lệ hoặc dữ liệu sai: chặn.
  Kết quả yêu cầu: E1. Vượt lượng mua còn lại, dòng sai đơn, trùng mã, NCC trộn không hợp lệ hoặc dữ liệu sai: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-04-EX-05** [EX] E2. Chỉ phần đã được ghi nhận mới chọn QC thực tế; đợt dự kiến có thể lập trước.
  Kết quả yêu cầu: E2. Chỉ phần đã được ghi nhận mới chọn QC thực tế; đợt dự kiến có thể lập trước.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-05 Ghi nhận hàng khách trả và nhận cách ly

Tiền điều kiện: Có dòng phiếu giao OUT/POSTED gốc còn hạn mức được trả.

- **UC-BS-05-MAIN-01** [MAIN] 1. Quản lý chọn dòng giao gốc, lượng/lý do và người nhận/vị trí cách ly. -> 2. Kiểm nguồn, lượng giao trừ đã trả/cam kết và quyền.
3. Người được giao xác nhận nhận thực tế. -> 4. Tạo lô trả/phiếu nhập cách ly đúng một lần, liên kết dòng gốc.
  Kết quả yêu cầu: Đề nghị trả có nguồn dòng giao; nhận đúng một lần tạo phiếu vào QUARANTINE, giữ lịch sử đơn/giao; chưa tự hoàn tiền/giao bù.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-05-ALT-02** [ALT] A1. Chưa nhận có thể hủy theo quyền, giải phóng hạn mức trả.
  Kết quả yêu cầu: A1. Chưa nhận có thể hủy theo quyền, giải phóng hạn mức trả.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-05-ALT-03** [ALT] A2. QC kiểm hàng trả; phần đạt chỉ giải phóng khỏi cách ly theo quy trình duyệt, không tự giao bù.
  Kết quả yêu cầu: A2. QC kiểm hàng trả; phần đạt chỉ giải phóng khỏi cách ly theo quy trình duyệt, không tự giao bù.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-05-EX-04** [EX] E1. Vượt lượng giao/đã trả, nhận lặp, sai vị trí/người, nguồn không POSTED hoặc sai quyền: chặn.
  Kết quả yêu cầu: E1. Vượt lượng giao/đã trả, nhận lặp, sai vị trí/người, nguồn không POSTED hoặc sai quyền: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-05-EX-05** [EX] E2. Giữ nguyên trạng thái/hồ sơ giao lịch sử; không nhập hàng trả vào AVAILABLE trực tiếp.
  Kết quả yêu cầu: E2. Giữ nguyên trạng thái/hồ sơ giao lịch sử; không nhập hàng trả vào AVAILABLE trực tiếp.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-06 Điều chỉnh QC hàng đã nhập và xử lý hàng cách ly

Tiền điều kiện: Có nguồn QC/tồn/phiếu gốc hợp lệ; không có giữ chỗ/kho khóa hoặc phụ thuộc cản trở.

- **UC-BS-06-MAIN-01** [MAIN] 1. Quản lý lập đề xuất loại phù hợp và mô tả/lượng nguồn. -> 2. Kiểm hạn mức nguồn và hiện kế hoạch xử lý; chưa đổi tồn.
3. Giám đốc duyệt; QC tái kiểm/xác nhận theo loại; quản lý chọn Thực hiện. -> 4. Kiểm từng trạng thái/version/quyền trước áp dụng; ghi biến động, cập nhật QC/bucket và lịch sử đúng một lần.
  Kết quả yêu cầu: Biến động điều chỉnh/giải phóng/loại bỏ/trả NCC đúng lượng, audit và chứng từ bù; giữ phiếu gốc, không áp dụng lặp.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-06-ALT-02** [ALT] A1. RELEASE phần đạt, SCRAP phần lỗi hoặc RETURN_SUPPLIER khi có nguồn NCC hợp lệ.
  Kết quả yêu cầu: A1. RELEASE phần đạt, SCRAP phần lỗi hoặc RETURN_SUPPLIER khi có nguồn NCC hợp lệ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-06-ALT-03** [ALT] A2. STOCK_QC_CORRECTION cách ly hàng đã nhập rồi QC xác minh; khác đường bù trực tiếp UC-12.2.
  Kết quả yêu cầu: A2. STOCK_QC_CORRECTION cách ly hàng đã nhập rồi QC xác minh; khác đường bù trực tiếp UC-12.2.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-06-ALT-04** [ALT] A3. Từ chối hoặc hủy chưa thực hiện không tự sửa tồn; chưa tự mua bù sau trả NCC.
  Kết quả yêu cầu: A3. Từ chối hoặc hủy chưa thực hiện không tự sửa tồn; chưa tự mua bù sau trả NCC.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-06-EX-05** [EX] E1. Người lập tự duyệt, chưa duyệt/chưa QC, sai lượng/bucket, vượt nguồn/còn giữ chỗ/kho khóa: chặn.
  Kết quả yêu cầu: E1. Người lập tự duyệt, chưa duyệt/chưa QC, sai lượng/bucket, vượt nguồn/còn giữ chỗ/kho khóa: chặn.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-06-EX-06** [EX] E2. Replay không ghi hai lần, phiếu gốc bất biến; lỗi giữa chừng rollback.
  Kết quả yêu cầu: E2. Replay không ghi hai lần, phiếu gốc bất biến; lỗi giữa chừng rollback.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-07 Xem thông báo và huy hiệu công việc

Tiền điều kiện: Có phiên hợp lệ.

- **UC-BS-07-MAIN-01** [MAIN] 1. Mở thông báo hoặc quan sát huy hiệu trên menu. -> 2. Đếm các việc cần chú ý trong quyền; huy hiệu tròn đỏ số trắng khi có số.
3. Mở thông báo/chi tiết và đánh dấu đã đọc. -> 4. Cập nhật read_at; liên kết chứng từ vẫn kiểm quyền độc lập.
  Kết quả yêu cầu: Hiển thị thông báo/huy hiệu của chính người dùng; đọc thông báo không cấp quyền chứng từ.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-07-ALT-02** [ALT] A1. Thông báo công việc gửi người được giao; người lập biên bản nhận thông báo riêng.
  Kết quả yêu cầu: A1. Thông báo công việc gửi người được giao; người lập biên bản nhận thông báo riêng.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-07-ALT-03** [ALT] A2. Mở lại/làm mới/focus có thể tải số mới; không hứa realtime WebSocket nếu chưa triển khai.
  Kết quả yêu cầu: A2. Mở lại/làm mới/focus có thể tải số mới; không hứa realtime WebSocket nếu chưa triển khai.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-07-EX-04** [EX] E1. Không đọc/đánh dấu thông báo của người khác; phiên hết hạn không trả dữ liệu.
  Kết quả yêu cầu: E1. Không đọc/đánh dấu thông báo của người khác; phiên hết hạn không trả dữ liệu.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-07-EX-05** [EX] E2. Không có thông báo/huy hiệu bằng 0 hiển thị bình thường.
  Kết quả yêu cầu: E2. Không có thông báo/huy hiệu bằng 0 hiển thị bình thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

## UC-BS-08 Xóa dữ liệu thử nghiệm — CHỨC NĂNG TẠM

Tiền điều kiện: Môi trường development, ENABLE_TEST_RESET=true, worker nội bộ và quyền gọi hợp lệ.

- **UC-BS-08-MAIN-01** [MAIN] 1. Chọn Xóa dữ liệu gần Đăng xuất. -> 2. Hiển thị cảnh báo và ô xác nhận.
3. Nhập chính xác XOA DU LIEU TEST rồi xác nhận. -> 4. Kiểm CSRF, chữ xác nhận, chữ ký nội bộ và idempotency; backup rồi dọn workflow trong phạm vi đã định, trả kết quả.
  Kết quả yêu cầu: Backup các schema trước khi dọn chứng từ nghiệp vụ; giữ tài khoản/danh mục theo quy tắc; yêu cầu đăng nhập lại. Không dùng để xóa dữ liệu production.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-08-ALT-02** [ALT] A1. Hủy/chuỗi không đúng không xóa.
  Kết quả yêu cầu: A1. Hủy/chuỗi không đúng không xóa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-08-ALT-03** [ALT] A2. Replay không xóa lại dữ liệu mới đã tạo sau lần trước; tắt cờ hoặc production không cung cấp đường dùng bình thường.
  Kết quả yêu cầu: A2. Replay không xóa lại dữ liệu mới đã tạo sau lần trước; tắt cờ hoặc production không cung cấp đường dùng bình thường.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-08-EX-04** [EX] E1. Backup thất bại, worker/chữ ký sai, phiên/CSRF thiếu hoặc cờ tắt: từ chối, không tuyên bố đã xóa.
  Kết quả yêu cầu: E1. Backup thất bại, worker/chữ ký sai, phiên/CSRF thiếu hoặc cờ tắt: từ chối, không tuyên bố đã xóa.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module
- **UC-BS-08-EX-05** [EX] E2. Đây là công cụ test sẽ bỏ khi nghiệm thu chính thức, không phải nghiệp vụ quản lý kho thường xuyên.
  Kết quả yêu cầu: E2. Đây là công cụ test sẽ bỏ khi nghiệm thu chính thức, không phải nghiệp vụ quản lý kho thường xuyên.
  Thực thi riêng: CHƯA CÓ BẰNG CHỨNG ASSERT RIÊNG — đối chiếu bộ test/log theo module

