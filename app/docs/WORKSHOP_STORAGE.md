# Kho theo xưởng và khu lưu trữ

Quản lý nhập/xuất áp dụng FEFO rồi FIFO: hạn dùng sớm ưu tiên trước; cùng hạn dùng so sánh thời điểm ghi phiếu nhập đầu tiên tại chính kho đang điều phối. Lô chưa có hạn dùng xếp sau các lô có hạn dùng; cùng thời điểm dùng mã bản ghi để giữ thứ tự ổn định. Không dùng thời điểm tạo lô thay cho thời điểm nhập kho.

Form phân công xuất có bảng thứ tự đề xuất và nút bổ sung phân bổ theo hạn dùng/thứ tự nhập. Nút giữ các dòng đang nhập và bổ sung phần còn thiếu sang lô tiếp theo, trừ số lượng đã phân bổ trên form để tránh lấy trùng. Quản lý chọn nhân viên cho từng phần và xác nhận; đây là gợi ý điều phối, không tự ghi phiếu hoặc tăng/giảm tồn. Phân công vẫn phải qua kiểm tra số lượng, giữ chỗ và phân quyền hiện hành trên máy chủ.

Kiểm tra bổ sung: 80/80 kiểm thử đơn vị đạt; bài trình duyệt phân công xác minh chia 10 đơn vị thành 4 và 6 từ hai lô cùng hạn dùng; bộ MySQL commerce (mua, QC, phân công, nhập/xuất, trả hàng) đạt trên môi trường riêng.

Mỗi xưởng có ba kho: nguyên vật liệu, thành phẩm và hàng trả về. Ba xưởng ahtor, edxn, trnvnth tương ứng có tổng cộng chín kho; khi chọn một xưởng trên màn hình tra cứu chỉ hiển thị ba kho của xưởng đó.

Trong mỗi kho, các khu được đặt bằng chữ cái A, B, C… Mỗi khu có mười vị trí, ví dụ A01–A10. Tiêu đề khu ghi rõ nhóm hàng lưu trữ, ví dụ “Khu B · bột”. Kho hàng trả về có khu chờ kiểm tra, chờ xử lý và chờ trả nhà cung cấp. Các nhóm này không tự thay thế kết luận QC hoặc tự thay đổi trạng thái hàng.

Chiều bố trí: số nhỏ ở phía ngoài, số lớn ở phía trong. Khi phân công nhập, gợi ý vị trí dựa trên nhóm NVL và hạn dùng so với các lô cùng mặt hàng đang có: hạn dùng xa ưu tiên phía trong, hạn dùng gần hoặc chưa rõ ưu tiên phía ngoài. Khi xuất, danh sách lô được ưu tiên theo hạn dùng gần trước (FEFO). Quản lý vẫn xác nhận vị trí thực tế; hệ thống không tự di chuyển hàng vật lý và không mô phỏng sức chứa chưa được khai báo.

Migration `007_workshop_warehouses.sql` liên kết kho với xưởng và loại kho, ngăn trùng một loại kho trong cùng xưởng. Seeder `workshop-warehouses.js` chạy một lần, tái sử dụng KHO-01/KHO-02/KHO-03 cho xưởng đầu và bổ sung kho cho hai xưởng còn lại. Các mã vị trí mẫu dài được đổi sang mã ngắn trên cùng bản ghi nên lịch sử lô và tồn kho không đổi. Vị trí cũ chưa phân khu vẫn được giữ riêng; không tự xóa hoặc chuyển hàng đang có.

Màn hình tra cứu mặc định mở một khu để tránh dàn quá nhiều ô; có thể chọn khu khác hoặc tất cả khu. Biểu mẫu yêu cầu mới lọc kho theo xưởng và theo nguyên vật liệu/thành phẩm.

Card đặt bánh: ảnh và thông tin nằm ở phần trên; số lượng, ghi chú dùng toàn bộ chiều ngang bên dưới, loại bỏ khoảng trống bên trái của ô nhập.

Kiểm thử bổ sung: `e2e/workshop-storage.cjs` xác minh ba xưởng, ba kho mỗi xưởng, khu mười vị trí, chuyển xưởng, card và màn hình nhỏ. Chạy trên dự án kiểm thử riêng, không xóa dữ liệu chính.

Kết quả ngày 30/10/2026: 79/79 kiểm thử đơn vị, 12/12 nhóm MySQL, bốn bộ trình duyệt workshop-storage, actor-storage, warehouse-request-workflow, warehouse-lookup đều đạt. Kiểm tra cú pháp và đồng bộ cấu trúc đạt. Bản chạy chính đã được build và khởi động thành công. Dấu kiểm tra dữ liệu đơn hàng, kế hoạch sản xuất, tồn và phiếu kho trước/sau cập nhật khớp nhau.
