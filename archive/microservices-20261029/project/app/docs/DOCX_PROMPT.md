Hãy kiểm thử và đối soát toàn bộ WarehouseSystem với bộ đặc tả UC DOCX tôi cung cấp, sau đó cập nhật DOCX và xây dựng tài liệu test case từ kết quả thực tế.

1. Đọc và lập danh mục trước khi kiểm thử
- Đọc toàn bộ bộ DOCX, tài liệu hiện hành và các quyết định nghiệp vụ trong cuộc trao đổi.
- Liệt kê đầy đủ UC, actor, tiền điều kiện, hậu điều kiện, luồng chính, luồng thay thế, ngoại lệ và quy tắc nghiệp vụ.
- Tách từng bước thành các mục cần kiểm: thao tác, dữ liệu đầu vào, hiển thị, thông báo và thay đổi dữ liệu.
- Lập bảng truy vết để kiểm soát độ bao phủ; không chỉ kiểm đường đi thành công.

2. Nguyên tắc đối soát
- DOCX là đặc tả gốc; các thay đổi tôi đã xác nhận là yêu cầu bổ sung/thay thế.
- Code hiện tại chỉ là đối tượng được kiểm thử, không mặc nhiên là nghiệp vụ đúng.
- Phân biệt: lỗi triển khai, tài liệu lỗi thời, yêu cầu chưa rõ và chức năng còn thiếu.
- Với mâu thuẫn nghiệp vụ chưa được tôi xác nhận, ghi rõ phương án đề xuất và hỏi tôi trước khi thay đổi ý nghĩa của đặc tả.
- Không tự hợp thức hóa lỗi của hệ thống bằng cách sửa DOCX cho khớp code.

3. Thực hiện kiểm thử
- Dựng môi trường và dữ liệu kiểm thử biệt lập, có thể chạy lại; giữ nguyên dữ liệu tôi đang sử dụng.
- Kiểm giao diện thực tế theo từng actor và từng bước UC.
- Kiểm quyền, phạm vi dữ liệu, trạng thái, ngày tháng, số lượng, đơn vị tính, quan hệ nguồn và số liệu cộng dồn.
- Kiểm từng trường nhập, dropdown, bảng, chi tiết, bộ lọc, phân trang, nút, hộp thoại, xác nhận/hủy, thông báo thành công/lỗi và trạng thái không có dữ liệu.
- Kiểm dữ liệu hợp lệ, không hợp lệ, giá trị biên, bỏ trống, nhập trùng, thao tác lặp, hai người thao tác đồng thời và phiên bản dữ liệu cũ.
- Kiểm các luồng liên UC từ đầu đến cuối, đặc biệt báo cáo thành phẩm từng phần → lô tổng/phần → công việc → QC → nhập kho → tồn kho.
- Đối chiếu API/CSDL và lịch sử khi cần để chứng minh kết quả; không chỉ dựa vào thông báo thành công.
- Ghi nhận lỗi console/network và lỗi liên service nếu xuất hiện.
- Không gửi dữ liệu hoặc thực hiện hành động bên ngoài môi trường kiểm thử khi chưa được cho phép.

4. Xử lý sai khác
- Có thể sửa lỗi kỹ thuật rõ ràng trong phạm vi yêu cầu đã chốt, rồi kiểm thử lại và kiểm hồi quy các luồng bị ảnh hưởng.
- Không tự thay đổi quy trình nghiệp vụ chưa được xác nhận.
- Mục chưa chạy được phải ghi Chưa kiểm thử hoặc Bị chặn kèm lý do; không suy đoán kết quả.

5. Cập nhật tài liệu
- Giữ nguyên DOCX gốc và tạo bản DOCX cập nhật riêng.
- Giữ mã UC và cấu trúc/trình bày gốc tối đa có thể.
- Cập nhật actor, điều kiện, các luồng, quy tắc, hiển thị và thông báo theo yêu cầu đã xác nhận.
- Kèm nhật ký thay đổi: UC/bước, nội dung trước/sau, lý do và bằng chứng liên quan.
- Kiểm tra lại bản DOCX sau khi xuất, gồm bảng, đánh số, hình ảnh và bố cục.

6. Viết test case và báo cáo kết quả
Mỗi test case cần có:
- Mã test case và UC/bước liên quan.
- Actor, tiền điều kiện, dữ liệu và trạng thái ban đầu.
- Các bước thao tác cụ thể.
- Kết quả mong đợi.
- Kết quả thực tế và trạng thái kiểm thử.
- Bằng chứng, mã lỗi liên quan và kết quả kiểm thử lại nếu có.

Bàn giao:
- DOCX đặc tả đã cập nhật và bản gốc được giữ nguyên.
- Tài liệu test case.
- Bảng truy vết UC/bước/hiển thị/thông báo ↔ test case.
- Báo cáo thực thi, danh sách lỗi và nhật ký thay đổi.
- Danh sách rõ ràng những gì chưa kiểm được, còn thiếu hoặc cần tôi quyết định.

Bắt đầu bằng việc khảo sát và lập danh mục phạm vi. Trong suốt quá trình, báo cáo tiến độ dựa trên số mục đã kiểm và bằng chứng, không chỉ dựa trên số UC có chức năng.