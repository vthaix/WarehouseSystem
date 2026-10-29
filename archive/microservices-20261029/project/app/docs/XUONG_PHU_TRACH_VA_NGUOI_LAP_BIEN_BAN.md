# Xưởng phụ trách và người lập biên bản

Cập nhật 27/10/2026.

Form yêu cầu nhập/xuất kho lấy tên xưởng từ CSDL theo phạm vi tài khoản chủ xưởng, không ghép tên bằng ID. ID 13, chẳng hạn, là khóa nội bộ và không có nghĩa tồn tại “Xưởng 13”. Khi tài khoản có đúng một xưởng, form tự chọn và khóa lựa chọn đó; cả bốn nhánh yêu cầu dùng cùng giá trị. Backend tiếp tục kiểm nguồn và phạm vi xưởng, không dựa vào việc khóa ô trên giao diện để phân quyền.

Ba tài khoản demo: `workshop` → Xưởng ahtor, `workshop2` → Xưởng edxn, `workshop3` → Xưởng trnvnth.

QC/AC và Ban kiểm kê đều được mở màn hình Biên bản kiểm kê. Danh sách vẫn giới hạn theo phạm vi được phân công, không mở toàn bộ dữ liệu của các đợt khác. Người không được chỉ định vẫn có bảng và bộ lọc bình thường; nút tạo bị khóa. Người được chỉ định thấy thông tin các đợt được giao lập biên bản và trạng thái chờ kết quả/đã đủ điều kiện/đã có biên bản. Chỉ bật nút tạo khi đợt đã hoàn tất, chưa có biên bản và đúng người được chỉ định. Backend vẫn chặn tạo/sửa/gửi nếu không có quyền, kể cả gọi API trực tiếp.

Khi lập công việc kiểm kê hoặc thay đổi người lập biên bản, hệ thống gửi thông báo riêng cho nhân viên được chọn. Việc thay người lập cập nhật quyền theo phân công hiện tại; thông báo cũ là lịch sử, không tự cấp quyền tạo.
