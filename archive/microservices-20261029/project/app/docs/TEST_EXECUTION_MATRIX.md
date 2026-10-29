# Ma trận thực thi từng test case

Ngày 14/10/2026. Nguồn: [TEST_CASES.md](TEST_CASES.md). Bằng chứng chạy tự động: [TEST_RESULTS.md](TEST_RESULTS.md).

Tổng 233 ca: 36 Blocked theo thiết kế và 197 Not Run ở cấp ca đầy đủ. Các kiểm thử tự động đã chạy đạt được ghi ở TEST_RESULTS, nhưng chưa có liên kết assertion/bằng chứng hoàn chỉnh cho từng TC. Không đánh dấu Pass hàng loạt chỉ vì suite xanh. Not Run ở đây không có nghĩa chức năng chưa được kiểm thử ở bất kỳ mức nào.

| Mã TC | Tên ca | Tham chiếu | Trạng thái toàn ca | Ghi chú |
| --- | --- | --- | --- | --- |
| TC-29-01 | Luồng cơ bản | UC-29 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-29-02 | 2.1 Nếu không có đơn hàng nào | UC-29 / Ngoại lệ / 2.1 Nếu không có đơn hàng nào | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-01 | Luồng cơ bản | UC-06 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-02 | 3.1 Chọn Thêm | UC-06 / Thay thế / 3.1 Chọn Thêm | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-03 | 4.1 Chọn Xóa | UC-06 / Thay thế / 4.1 Chọn Xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-04 | 4.2 Chọn Sửa | UC-06 / Thay thế / 4.2 Chọn Sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-05 | 2.1 Không có danh mục nào trong danh sách | UC-06 / Ngoại lệ / 2.1 Không có danh mục nào trong danh sách | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-1-01 | Luồng cơ bản | UC-06.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-1-02 | 3.1 Quản lý kho chọn nhập lại | UC-06.1 / Thay thế / 3.1 Quản lý kho chọn nhập lại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-1-03 | 4.1 Tên danh mục đã tồn tại | UC-06.1 / Ngoại lệ / 4.1 Tên danh mục đã tồn tại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-1-04 | 4.2 Dữ liệu nhập bị bỏ trống | UC-06.1 / Ngoại lệ / 4.2 Dữ liệu nhập bị bỏ trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-1-05 | 4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ | UC-06.1 / Ngoại lệ / 4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-06-1-06 | 4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | UC-06.1 / Ngoại lệ / 4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-06-2-01 | Luồng cơ bản | UC-06.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-2-02 | 3.1 Hủy khi được yêu cầu xác nhận xóa | UC-06.2 / Thay thế / 3.1 Hủy khi được yêu cầu xác nhận xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-2-03 | 4.1 Danh mục đang được sử dụng | UC-06.2 / Ngoại lệ / 4.1 Danh mục đang được sử dụng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-3-01 | Luồng cơ bản | UC-06.3 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-3-02 | 4.1 Hủy trước khi xác nhận | UC-06.3 / Thay thế / 4.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-3-03 | 5.1 Tên danh mục đã tồn tại | UC-06.3 / Ngoại lệ / 5.1 Tên danh mục đã tồn tại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-06-3-04 | 5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ | UC-06.3 / Ngoại lệ / 5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-06-3-05 | 5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | UC-06.3 / Ngoại lệ / 5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-06-3-06 | 5.3 Nếu dữ liệu bị bỏ trống | UC-06.3 / Ngoại lệ / 5.3 Nếu dữ liệu bị bỏ trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-01 | Luồng cơ bản | UC-07 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-02 | 3.1 Tìm kiếm dữ liệu | UC-07 / Thay thế / 3.1 Tìm kiếm dữ liệu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-03 | 3.2 Chọn Thêm | UC-07 / Thay thế / 3.2 Chọn Thêm | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-04 | 4.1 Chọn Xóa | UC-07 / Thay thế / 4.1 Chọn Xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-05 | 4.2 Chọn Sửa | UC-07 / Thay thế / 4.2 Chọn Sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-06 | 2.1 Không có dữ liệu | UC-07 / Ngoại lệ / 2.1 Không có dữ liệu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-01 | Luồng cơ bản | UC-07.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-02 | 3.1 Hủy trước khi xác nhận | UC-07.1 / Thay thế / 3.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-03 | 3.1 Tên đã tồn tại | UC-07.1 / Ngoại lệ / 3.1 Tên đã tồn tại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-04 | 3.2 Dữ liệu để trống | UC-07.1 / Ngoại lệ / 3.2 Dữ liệu để trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-05 | 3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ | UC-07.1 / Ngoại lệ / 3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-1-06 | 3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | UC-07.1 / Ngoại lệ / 3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0 | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-2-01 | Luồng cơ bản | UC-07.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-2-02 | 4.1 Hủy khi được yêu cầu xác nhận xóa | UC-07.2 / Thay thế / 4.1 Hủy khi được yêu cầu xác nhận xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-2-03 | 2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng | UC-07.2 / Ngoại lệ / 2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-3-01 | Luồng cơ bản | UC-07.3 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-07-3-02 | 3.1 Hủy trước khi xác nhận | UC-07.3 / Thay thế / 3.1 Hủy trước khi xác nhận | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-07-3-03 | 4.1 Tên bị trùng | UC-07.3 / Ngoại lệ / 4.1 Tên bị trùng | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-07-3-04 | 4.2 Nếu dữ liệu bị nhập sai định dạng | UC-07.3 / Ngoại lệ / 4.2 Nếu dữ liệu bị nhập sai định dạng | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-07-3-05 | 4.3 Dữ liệu để trống | UC-07.3 / Ngoại lệ / 4.3 Dữ liệu để trống | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-08-01 | Luồng cơ bản | UC-08 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-08-02 | 3.1 Tìm kiếm phiếu nhập kho | UC-08 / Thay thế / 3.1 Tìm kiếm phiếu nhập kho | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-08-03 | 2.1 Không có phiếu nhập kho | UC-08 / Ngoại lệ / 2.1 Không có phiếu nhập kho | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-09-01 | Luồng cơ bản | UC-09 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-09-02 | 3.1 Tìm kiếm phiếu xuất kho | UC-09 / Thay thế / 3.1 Tìm kiếm phiếu xuất kho | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-09-03 | 2.1 Không có phiếu xuất kho phù hợp | UC-09 / Ngoại lệ / 2.1 Không có phiếu xuất kho phù hợp | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-13-01 | Luồng cơ bản | UC-13 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-13-02 | 5.1 Ban giám đốc chọn nhập lại | UC-13 / Thay thế / 5.1 Ban giám đốc chọn nhập lại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-13-03 | 4.1 Thời gian/phạm vi kiểm kê không hợp lệ | UC-13 / Ngoại lệ / 4.1 Thời gian/phạm vi kiểm kê không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-17-01 | Luồng cơ bản | UC-17 / Luồng cơ bản | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-17-02 | 5.1 Từ chối đề xuất và có nhập lý do | UC-17 / Thay thế / 5.1 Từ chối đề xuất và có nhập lý do | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-17-03 | 5.2 Từ chối đề xuất nhưng không nhập lý do | UC-17 / Thay thế / 5.2 Từ chối đề xuất nhưng không nhập lý do | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-17-04 | 2.1 Không có đề xuất nào đang chờ phê duyệt | UC-17 / Ngoại lệ / 2.1 Không có đề xuất nào đang chờ phê duyệt | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-17-05 | 4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác) | UC-17 / Ngoại lệ / 4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác) | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-18-01 | Luồng cơ bản | UC-18 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-18-02 | 2.1 Xuất báo cáo ra file | UC-18 / Thay thế / 2.1 Xuất báo cáo ra file | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-18-03 | 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | UC-18 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-18-04 | 4.1 Không có dữ liệu phù hợp với điều kiện lọc | UC-18 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-19-01 | Luồng cơ bản | UC-19 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-19-02 | 2.1 Xuất báo cáo ra file | UC-19 / Thay thế / 2.1 Xuất báo cáo ra file | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-19-03 | 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | UC-19 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-19-04 | 4.1 Không có dữ liệu phù hợp với điều kiện lọc | UC-19 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-20-01 | Luồng cơ bản | UC-20 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-20-02 | 2.1 Xuất báo cáo ra file | UC-20 / Thay thế / 2.1 Xuất báo cáo ra file | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-20-03 | 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | UC-20 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-20-04 | 4.1 Không có dữ liệu phù hợp với điều kiện lọc | UC-20 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-21-01 | Luồng cơ bản | UC-21 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-21-02 | 2.1 Xuất báo cáo ra file | UC-21 / Thay thế / 2.1 Xuất báo cáo ra file | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-21-03 | 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | UC-21 / Ngoại lệ / 3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-21-04 | 4.1 Không có dữ liệu phù hợp với điều kiện lọc | UC-21 / Ngoại lệ / 4.1 Không có dữ liệu phù hợp với điều kiện lọc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-01 | Luồng cơ bản | UC-25 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-02 | 4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa | UC-25 / Thay thế / 4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-03 | 4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá | UC-25 / Thay thế / 4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-04 | 2.1 Nếu danh sách công việc hiện đang trống | UC-25 / Ngoại lệ / 2.1 Nếu danh sách công việc hiện đang trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-01 | Luồng cơ bản | UC-25.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-02 | 4.1 Nếu giám đốc chọn Huỷ | UC-25.1 / Thay thế / 4.1 Nếu giám đốc chọn Huỷ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-03 | 5.1 Nếu giám đốc nhập chữ vào ô nhập số | UC-25.1 / Ngoại lệ / 5.1 Nếu giám đốc nhập chữ vào ô nhập số | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-04 | 5.2 Nếu giám đốc nhập số < 0 | UC-25.1 / Ngoại lệ / 5.2 Nếu giám đốc nhập số < 0 | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-05 | 5.3 Nếu bỏ trống thông tin bắt buộc | UC-25.1 / Ngoại lệ / 5.3 Nếu bỏ trống thông tin bắt buộc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-06 | 5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ | UC-25.1 / Ngoại lệ / 5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-1-07 | 6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc | UC-25.1 / Ngoại lệ / 6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-2-01 | Luồng cơ bản | UC-25.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-2-02 | 3.1 Nếu giám đốc chọn Huỷ | UC-25.2 / Thay thế / 3.1 Nếu giám đốc chọn Huỷ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-25-2-03 | 4.1 Nếu công việc hiện đang được diễn ra | UC-25.2 / Ngoại lệ / 4.1 Nếu công việc hiện đang được diễn ra | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-31-01 | Luồng cơ bản | UC-31 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-31-02 | 5.1 Từ chối kế hoạch sản xuất | UC-31 / Thay thế / 5.1 Từ chối kế hoạch sản xuất | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-31-03 | 2.1 Danh sách kế hoạch chờ phê duyệt rỗng | UC-31 / Ngoại lệ / 2.1 Danh sách kế hoạch chờ phê duyệt rỗng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-31-04 | 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt hoặc version cũ | UC-31 / Ngoại lệ / 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt hoặc version cũ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-14-01 | Luồng cơ bản | UC-14 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-14-02 | 2.1 Không có đơn hàng trong hệ thống | UC-14 / Ngoại lệ / 2.1 Không có đơn hàng trong hệ thống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-01 | Luồng cơ bản | UC-23 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-02 | 3.1 Import dữ liệu | UC-23 / Thay thế / 3.1 Import dữ liệu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-03 | 3.1 Nguồn hoặc lô không hợp lệ | UC-23 / Ngoại lệ / 3.1 Nguồn hoặc lô không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-04 | 5.1 Hủy trước khi gửi | UC-23 / Ngoại lệ / 5.1 Hủy trước khi gửi | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-05 | 6.1 Thiếu thông tin hoặc số lượng không hợp lệ | UC-23 / Ngoại lệ / 6.1 Thiếu thông tin hoặc số lượng không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-23-06 | 7.1 Không đủ điều kiện, trùng hoặc vượt lượng được phép | UC-23 / Ngoại lệ / 7.1 Không đủ điều kiện, trùng hoặc vượt lượng được phép | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-01 | Luồng cơ bản | UC-24 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-02 | 1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian | UC-24 / Thay thế / 1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-03 | 4.1 Chọn Sửa | UC-24 / Thay thế / 4.1 Chọn Sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-04 | 4.2 Chọn Xóa | UC-24 / Thay thế / 4.2 Chọn Xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-05 | 1.1 Tìm kiếm/lọc không có 1 t quả phù hợp | UC-24 / Ngoại lệ / 1.1 Tìm kiếm/lọc không có 1 t quả phù hợp | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-06 | 2.1 Không có yêu cầu trong hệ thống | UC-24 / Ngoại lệ / 2.1 Không có yêu cầu trong hệ thống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-1-01 | Luồng cơ bản | UC-24.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-1-02 | 5.1 Hủy trước khi xác nhận | UC-24.1 / Thay thế / 5.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-1-03 | 2.1 Yêu cầu đã được xử lý | UC-24.1 / Ngoại lệ / 2.1 Yêu cầu đã được xử lý | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-1-04 | 6.1 Thông tin không hợp lệ | UC-24.1 / Ngoại lệ / 6.1 Thông tin không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-2-01 | Luồng cơ bản | UC-24.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-2-02 | 3.1 Hủy trước khi xác nhận xóa | UC-24.2 / Thay thế / 3.1 Hủy trước khi xác nhận xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-24-2-03 | 3.1 Yêu cầu đã được xử lý | UC-24.2 / Ngoại lệ / 3.1 Yêu cầu đã được xử lý | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-27-01 | Luồng cơ bản | UC-27 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-27-02 | 7.1 Hủy trước khi xác nhận | UC-27 / Thay thế / 7.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-27-03 | 2.1 Không có kế hoạch mua hàng nào đang chờ xử lý | UC-27 / Ngoại lệ / 2.1 Không có kế hoạch mua hàng nào đang chờ xử lý | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-27-04 | 6.1 Thông tin đơn hàng mua không hợp lệ | UC-27 / Ngoại lệ / 6.1 Thông tin đơn hàng mua không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-04-01 | Luồng cơ bản | UC-04 / Luồng cơ bản | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-04-02 | 3.1 Chọn kế hoạch bán hàng | UC-04 / Thay thế / 3.1 Chọn kế hoạch bán hàng | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-04-03 | 3.2 Chọn kế hoạch sản xuất | UC-04 / Thay thế / 3.2 Chọn kế hoạch sản xuất | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-04-04 | 5.1 Nếu thông tin nhập là số và < 0 | UC-04 / Ngoại lệ / 5.1 Nếu thông tin nhập là số và < 0 | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-04-05 | 5.2 Nếu thông tin nhập là số mà người dùng nhập chữ | UC-04 / Ngoại lệ / 5.2 Nếu thông tin nhập là số mà người dùng nhập chữ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-04-06 | 5.3 Kế hoạch sản xuất chưa chọn đơn hàng hoặc xưởng được phân công | UC-04 / Ngoại lệ / 5.3 Kế hoạch sản xuất chưa chọn đơn hàng hoặc xưởng được phân công | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-05-01 | Luồng cơ bản | UC-05 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-02 | 3.1 Tìm kiếm/lọc kế hoạch | UC-05 / Thay thế / 3.1 Tìm kiếm/lọc kế hoạch | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-03 | 4.1 Chọn Sửa | UC-05 / Thay thế / 4.1 Chọn Sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-04 | 4.2 Chọn Xóa | UC-05 / Thay thế / 4.2 Chọn Xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-05 | 2.1 Không có kế hoạch nào | UC-05 / Ngoại lệ / 2.1 Không có kế hoạch nào | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-1-01 | Luồng cơ bản | UC-05.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-1-02 | 1.1 Hủy trước khi xác nhận | UC-05.1 / Thay thế / 1.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-1-03 | 4.1 Thông tin nhập không hợp lệ | UC-05.1 / Ngoại lệ / 4.1 Thông tin nhập không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-2-01 | Luồng cơ bản | UC-05.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-2-02 | 4.1 Hủy thao tác xóa | UC-05.2 / Thay thế / 4.1 Hủy thao tác xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-05-2-03 | 2.1 Kế hoạch đã được duyệt/đang thực hiện | UC-05.2 / Ngoại lệ / 2.1 Kế hoạch đã được duyệt/đang thực hiện | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-10-01 | Luồng cơ bản | UC-10 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-10-02 | 4.1 Số lượng thực nhập khác với kế hoạch | UC-10 / Thay thế / 4.1 Số lượng thực nhập khác với kế hoạch | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-10-03 | 4.1 Thông tin nhập kho không hợp lệ | UC-10 / Ngoại lệ / 4.1 Thông tin nhập kho không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-01 | Luồng cơ bản | UC-11 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-02 | 2.1 Chọn Xuất nguyên vật liệu | UC-11 / Thay thế / 2.1 Chọn Xuất nguyên vật liệu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-03 | 2.2 Chọn Xuất thành phẩm | UC-11 / Thay thế / 2.2 Chọn Xuất thành phẩm | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-01-01 | Luồng cơ bản | UC-11.01 / Luồng cơ bản | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-11-01-02 | 4.1 Phiếu yêu cầu không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) | UC-11.01 / Thay thế / 4.1 Phiếu yêu cầu không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-11-01-03 | 6.1 Tồn kho không đủ hoặc lô không còn khả dụng | UC-11.01 / Ngoại lệ / 6.1 Tồn kho không đủ hoặc lô không còn khả dụng | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-11-02-01 | Luồng cơ bản | UC-11.02 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-02-02 | 4.1 Nhu cầu xuất không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) | UC-11.02 / Thay thế / 4.1 Nhu cầu xuất không thực hiện được trên thực tế (lô hỏng, thiếu hàng…) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-11-02-03 | 6.1 Tồn kho không đủ hoặc lô không còn khả dụng | UC-11.02 / Ngoại lệ / 6.1 Tồn kho không đủ hoặc lô không còn khả dụng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-35-01 | Luồng cơ bản | UC-35 / Luồng cơ bản | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-35-02 | 5.1 Hủy trước khi xác nhận gửi báo cáo | UC-35 / Thay thế / 5.1 Hủy trước khi xác nhận gửi báo cáo | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-35-03 | 4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ | UC-35 / Ngoại lệ / 4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-01-01 | Luồng cơ bản | UC-01 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-01-02 | 3.1 Sai tên đăng nhập hoặc mật khẩu | UC-01 / Thay thế / 3.1 Sai tên đăng nhập hoặc mật khẩu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-01-03 | 3.2 Bỏ trống thông tin đăng nhập | UC-01 / Thay thế / 3.2 Bỏ trống thông tin đăng nhập | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-01-04 | 4.1 Tài khoản bị khóa | UC-01 / Ngoại lệ / 4.1 Tài khoản bị khóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-01 | Luồng cơ bản | UC-12 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-02 | 1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho) | UC-12 / Thay thế / 1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-03 | 2.1 Chọn Thêm | UC-12 / Thay thế / 2.1 Chọn Thêm | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-04 | 4.1 Chọn Sửa | UC-12 / Thay thế / 4.1 Chọn Sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-05 | 4.2 Chọn Xóa | UC-12 / Thay thế / 4.2 Chọn Xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-06 | 4.3 Kết quả ghi nhận "không đạt" | UC-12 / Thay thế / 4.3 Kết quả ghi nhận "không đạt" | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-07 | 1.1 Không có kết quả phù hợp | UC-12 / Ngoại lệ / 1.1 Không có kết quả phù hợp | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-1-01 | Luồng cơ bản | UC-12.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-1-02 | 3.1 Hủy trước khi xác nhận | UC-12.1 / Thay thế / 3.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-1-03 | 3.1 Thông tin nhập không hợp lệ | UC-12.1 / Ngoại lệ / 3.1 Thông tin nhập không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-1-04 | 3.2 Thông tin nhập bị bỏ trống | UC-12.1 / Ngoại lệ / 3.2 Thông tin nhập bị bỏ trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-2-01 | Luồng cơ bản | UC-12.2 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-2-02 | 3.1 Hủy trước khi xác nhận | UC-12.2 / Thay thế / 3.1 Hủy trước khi xác nhận | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-2-03 | 3.1 Thông tin nhập không hợp lệ | UC-12.2 / Ngoại lệ / 3.1 Thông tin nhập không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-2-04 | 3.2 Thông tin nhập bị bỏ trống | UC-12.2 / Ngoại lệ / 3.2 Thông tin nhập bị bỏ trống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-3-01 | Luồng cơ bản | UC-12.3 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-3-02 | 4.1 Hủy khi được yêu cầu xác nhận xóa | UC-12.3 / Thay thế / 4.1 Hủy khi được yêu cầu xác nhận xóa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-12-3-03 | 2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi | UC-12.3 / Ngoại lệ / 2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-34-01 | Luồng cơ bản | UC-34 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-34-02 | 12.1 Hủy trước khi gửi báo cáo | UC-34 / Thay thế / 12.1 Hủy trước khi gửi báo cáo | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-34-03 | 13.1 Thông tin báo cáo chưa đầy đủ hoặc không hợp lệ | UC-34 / Ngoại lệ / 13.1 Thông tin báo cáo chưa đầy đủ hoặc không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-34-04 | 13.2 Kế hoạch không hợp lệ hoặc không thuộc xưởng | UC-34 / Ngoại lệ / 13.2 Kế hoạch không hợp lệ hoặc không thuộc xưởng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-34-05 | 13.3 Tiến độ sản xuất không hợp lệ | UC-34 / Ngoại lệ / 13.3 Tiến độ sản xuất không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-15-01 | Luồng cơ bản | UC-15 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-15-02 | 2.1 Tạm dừng kiểm kê | UC-15 / Thay thế / 2.1 Tạm dừng kiểm kê | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-15-03 | 2.1 Mất kết nối trong khi nhập số liệu | UC-15 / Ngoại lệ / 2.1 Mất kết nối trong khi nhập số liệu | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-28-01 | Luồng cơ bản | UC-28 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-28-02 | 3.1 Lưu tạm biên bản | UC-28 / Thay thế / 3.1 Lưu tạm biên bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-28-03 | 2.1 Đợt kiểm kê chưa hoàn thành | UC-28 / Ngoại lệ / 2.1 Đợt kiểm kê chưa hoàn thành | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-32-01 | Luồng cơ bản | UC-32 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-32-02 | 5.1 Từ chối kế hoạch và có nhập lý do | UC-32 / Thay thế / 5.1 Từ chối kế hoạch và có nhập lý do | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-32-03 | 5.2 Từ chối kế hoạch và không nhập lý do | UC-32 / Thay thế / 5.2 Từ chối kế hoạch và không nhập lý do | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-32-04 | 4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống | UC-32 / Ngoại lệ / 4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-32-05 | 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác) | UC-32 / Ngoại lệ / 4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác) | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-02-01 | Luồng cơ bản | UC-02 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-02-02 | 4.1 Khách hàng chọn Quay lại | UC-02 / Thay thế / 4.1 Khách hàng chọn Quay lại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-02-03 | 2.1 Danh sách hàng mẫu không có | UC-02 / Ngoại lệ / 2.1 Danh sách hàng mẫu không có | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-02-04 | 5.1 Thông tin đơn hàng không hợp lệ | UC-02 / Ngoại lệ / 5.1 Thông tin đơn hàng không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-02-05 | 5.2 Thông tin ngày nhận là ngày trong quá khứ | UC-02 / Ngoại lệ / 5.2 Thông tin ngày nhận là ngày trong quá khứ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-01 | Luồng cơ bản | UC-03 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-02 | 1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian | UC-03 / Thay thế / 1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-03 | 4.1 Chọn Sửa đơn hàng | UC-03 / Thay thế / 4.1 Chọn Sửa đơn hàng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-04 | 2.1 Không có đơn hàng nào trong hệ thống | UC-03 / Ngoại lệ / 2.1 Không có đơn hàng nào trong hệ thống | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-01 | Luồng cơ bản | UC-03.1 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-02 | 2.1 Khách hàng chọn Quay lại | UC-03.1 / Thay thế / 2.1 Khách hàng chọn Quay lại | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-03 | 5.1 Nếu khách hàng tăng số lượng đơn hàng | UC-03.1 / Thay thế / 5.1 Nếu khách hàng tăng số lượng đơn hàng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-04 | 5.2 Nếu khách hàng giảm số lượng đơn hàng | UC-03.1 / Thay thế / 5.2 Nếu khách hàng giảm số lượng đơn hàng | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-05 | 1.1 Đơn hàng không ở trạng thái cho phép sửa | UC-03.1 / Ngoại lệ / 1.1 Đơn hàng không ở trạng thái cho phép sửa | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-03-1-06 | 5.1 Thông tin nhập không hợp lệ | UC-03.1 / Ngoại lệ / 5.1 Thông tin nhập không hợp lệ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-22-01 | Luồng cơ bản | UC-22 / Luồng cơ bản | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-22-02 | 5.1 Chỉ xem danh sách, không xem chi tiết | UC-22 / Thay thế / 5.1 Chỉ xem danh sách, không xem chi tiết | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-22-03 | 3.1 Không tìm thấy dữ liệu phù hợp | UC-22 / Ngoại lệ / 3.1 Không tìm thấy dữ liệu phù hợp | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-16-01 | Luồng cơ bản | UC-16 / Luồng cơ bản | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-16-02 | 4.1 Chênh lệch vượt hạn mức xử lý | UC-16 / Thay thế / 4.1 Chênh lệch vượt hạn mức xử lý | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-16-03 | 2.1 Không có chênh lệch cần xử lý | UC-16 / Ngoại lệ / 2.1 Không có chênh lệch cần xử lý | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-01 | Nhập TP từng phần cùng lô | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-02 | Nhập NVL theo phần QC đạt | UC-23, UC-10; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-03 | Xuất TP đúng ngày và hoàn tất | UC-23, UC-11.02; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-04 | Xuất NVL theo nhu cầu KHSX | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-05 | Sửa yêu cầu không tự tính trùng chính nó | UC-23, UC-24.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-06 | Hai phiên cùng yêu cầu phần còn lại | UC-23; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-07 | Nhập đúng một lần khi gửi lại | UC-10; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-08 | Xuất cạnh tranh không âm tồn | UC-11.01, UC-11.02; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-09 | Rollback khi lỗi ghi sổ | UC-10, UC-11; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-10 | Phân hoạch QC | UC-12.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-11 | QC đã dùng không phá lịch sử | UC-12.2, UC-12.3; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-12 | Biên tiến độ | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-13 | Báo sự cố chỉ gửi BGĐ | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-14 | Báo thiếu gửi thêm planner | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-15 | Đủ NVL không tạo thiếu âm | UC-34; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-16 | Chưa hoàn tất không báo thành phẩm | UC-35; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-17 | Đối chiếu tổng phân bổ lô | UC-35; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-18 | Dự phòng NVL một lần | UC-04; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-19 | Sai loại và sai báo cáo nguồn | UC-04, UC-27; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-20 | Duyệt KHSX và tự cập nhật đơn đồng bộ | UC-31; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-21 | Chênh lệch thiếu/đủ/thừa | UC-15, UC-28; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-22 | Phân công khu vực | UC-15; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-23 | File xuất khớp bộ lọc | UC-18, UC-19, UC-20, UC-21; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
| TC-BS-24 | Không truy cập đơn khách khác | UC-03, UC-03.1; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-25 | Chưa đăng nhập và sai vai trò | Tất cả UC; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-26 | Ảnh danh mục — yêu cầu bổ sung | UC-06.1, UC-06.3; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Not Run | Chưa xác nhận toàn bộ ca; không quy đổi kết quả suite thành Pass |
| TC-BS-27 | Mua NVL thủ công — yêu cầu đã trao đổi | UC-27; ca bổ sung từ quy tắc/điều kiện và rủi ro nghiệp vụ | Blocked | Chưa chốt kỳ vọng; xem mục 3 TEST_CASES.md |
