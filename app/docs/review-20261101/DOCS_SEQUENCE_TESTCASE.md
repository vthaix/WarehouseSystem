# Đặc tả, sequence và test case đã chèn vào Word

Đã có bản kết quả thực thi: [Word kết quả](DacTa_TestCase_KetQua_20261101.docx), [báo cáo](KET_QUA_KIEM_THU_HE_THONG.md). Bản mẫu bên dưới vẫn để Chưa chạy; bản kết quả riêng đã điền 123 Pass, 0 Fail và giữ 828 ca chưa được kiểm chứng theo mã. Không gán Pass hàng loạt từ kết quả nhóm.

## Hai bản Word

1. [Đặc tả kèm sequence](DacTa_Kem_Sequence_20261101.docx): mỗi đặc tả có **một sequence tổng hợp ngay bên dưới**, gồm luồng cơ bản, thay thế và ngoại lệ. Sơ đồ dài được chia thành các phần tiếp nối của cùng UC để chữ đọc được, không thu nhỏ cả sơ đồ thành một ảnh bé. Không còn hiển thị xen các sequence cũ trong bản mới.
2. [Đặc tả kèm bảng test case](DacTa_Kem_TestCase_20261101.docx): mỗi đặc tả có một bảng test case ngay sau, gồm 8 cột theo mẫu: Test ID, Chức năng, Điều kiện trước, Mô tả, Dữ liệu Test, Kết quả mong muốn, Kết quả thực tế, Pass/Fail.

Bản nguồn trước khi chèn không bị ghi đè. Giữ cấu trúc, hàng, ô, đoạn và định dạng các bảng đặc tả hiện có. Riêng nội dung UC-12.2/12.3 được đối chiếu lại: sửa đè/xóa QC trực tiếp và nút Chứng từ bù không được mô tả như chức năng bình thường đang hiển thị. Giữ mã UC để truy vết, không xóa bảng gốc.

## Phạm vi

Có **54 đặc tả, 951 ca kiểm thử, 54 sequence tổng hợp**. Gồm 50 đặc tả gốc và bốn phần bổ sung ở cuối:

- UC-BS-01: quản lý tài khoản.
- UC-BS-02: hàng khách trả theo dòng giao gốc.
- UC-BS-03: thông báo và việc chờ xử lý.
- UC-BS-04: xóa dữ liệu thử nghiệm, chức năng tạm ngoài production.

Không tạo thêm chức năng ứng dụng hoặc bảng CSDL khi bổ sung tài liệu. Nội dung quản lý nhân viên không được thêm vào.

Các ca bao gồm luồng thành công, các nhánh thay thế/ngoại lệ, dữ liệu không hợp lệ, quyền, phạm vi, hiển thị, ngày giờ, đóng/hủy form, mất kết nối, nhập số dùng dấu phẩy và các nghiệp vụ quan trọng: dự toán NCC, nguồn mua được duyệt, nhập từng phần, FEFO rồi FIFO, giữ chỗ, QC/kiểm đếm, biên bản chung, thiếu hàng/bù, NVL thực dùng/thừa, xuất bán theo ngày và khách gốc.

Đối chiếu máy: **822 đoạn luồng đều có ca liên kết; 178 tuyến API có ánh xạ tới UC/test case**. Đây là kiểm tra độ phủ danh mục, không phải chứng minh mỗi tuyến hay mỗi điều kiện code đều đã được chạy. Nguồn truy vết đầy đủ: `spec-test-model.json`; thống kê: [TEST_TRACEABILITY.json](TEST_TRACEABILITY.json).

## Cách dùng và dữ liệu

T là ngày chạy thử theo UTC+7. Dùng dữ liệu riêng, không reset hoặc sửa CSDL đang vận hành. Tài khoản mẫu tra trong `app/docs/DEMO_ACCOUNTS.md`; mật khẩu demo hiện hành 123456 nếu chưa đổi.

Các con số trong cột dữ liệu là **fixture cần chuẩn bị**, không khẳng định đó là tồn kho/giá/công thức hiện có trên máy người thử. Ví dụ ca tính 13,2 kg/100 hộp yêu cầu công thức thử 0,12 kg bột mỗi hộp và dự phòng 10%; nếu dùng một mặt hàng seed có công thức khác thì phải lấy đúng công thức đó và tính lại kỳ vọng trước khi chạy. Ca giá trung bình 19.000đ/kg cần đúng hai NCC đang hoạt động, giá 18.000 và 20.000, không thêm NCC thứ ba vào phép tính. Ca 55/50 cần nguồn yêu cầu 55, kiểm 55, đạt 50 và lỗi 5.

Kiểm từng ca lỗi riêng, giữ các trường khác hợp lệ. Không đồng thời chuẩn bị “có đơn chờ” khi ca đang thử danh sách rỗng. Ca chưa đăng nhập không dùng tiền điều kiện đã đăng nhập của luồng thành công.

**Toàn bộ mã TC mới ghi Chưa chạy.** Không suy ra Pass từ 88 unit test, 12 nhóm SQL hoặc các ca UI đã chạy trong đợt trước: chúng chưa được đối chiếu và thực thi riêng theo từng mã TC mới. Sau mỗi lần thử điền kết quả thực tế, ngày/người thử, bằng chứng và Pass/Fail theo kết quả quan sát.

## Kiểm tra tệp xuất

- Bản sequence: 54 bảng đặc tả, 142 ảnh tiếp nối, đúng vị trí theo UC.
- Bản testcase: 108 bảng, gồm 54 đặc tả và 54 bảng testcase; 951 mã TC duy nhất, đúng 8 cột; không có Pass tự gán.
- [Kiểm tra cấu trúc và nội dung](INSERTED_DOCS_VERIFICATION.json), [bảo toàn bảng](TESTCASE_INSERT_PROOF.json).
- [Markdown test case](TEST_CASES_THEO_UC.md) để tìm kiếm/lọc nhanh; hai bản Word là đầu ra chính theo mẫu.
- PDF xem trước ở `render-inserted/`; việc phân trang khác bản nguồn là do thêm nội dung, không phải đổi định dạng bảng gốc.

Không thể dùng hữu hạn ca kiểm thử để bảo đảm đã thử mọi tổ hợp đầu vào/sự cố có thể tồn tại. Các số liệu trên là phạm vi đối chiếu thực tế của bộ tài liệu; phần chưa chạy không được gọi là đã đạt.
