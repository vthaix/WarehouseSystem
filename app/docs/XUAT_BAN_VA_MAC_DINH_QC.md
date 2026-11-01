# Xuất thành phẩm và số lượng mặc định QC — 31/10/2026

Kế hoạch bán lấy báo cáo thành phẩm → kế hoạch sản xuất → đơn hàng → khách hàng. Form không cho chọn lại khách hàng hoặc đổi đơn nguồn. Máy chủ tự xác định khách và đơn từ báo cáo; nếu lời gọi tương thích cũ truyền khách khác đơn gốc thì bị từ chối.

Kế hoạch bán phải được giám đốc phê duyệt trước khi chủ xưởng lập yêu cầu xuất. Chỉ xuất sau khi hoàn tất sản xuất, có báo cáo đã gửi, hàng đạt QC/đã nhập/còn khả dụng và đã đến ngày giao. Người dùng xác nhận ngày 31/10 rằng **chỉ xuất từ ngày giao**, không cho xuất sớm. Không tự sửa ngày của đơn để vượt điều kiện này. Thông báo chưa đến ngày giao hiển thị ngày cụ thể.

Khi báo cáo đợt cuối thuộc chuỗi thành phẩm từng phần, nguồn lập kế hoạch bán bao gồm các phần đã gửi của cùng kế hoạch sản xuất; không chỉ lấy riêng số lượng của đợt cuối. Kiểm tra số lượng nguồn, tồn khi duyệt, xem lô có thể xuất và phân công đều dùng cùng phạm vi này. Báo cáo phần chưa phải đợt cuối vẫn chỉ đại diện cho phần của chính nó. Hàng chưa QC, lỗi, chưa nhập hoặc ngoài nguồn không tự trở thành hàng có thể xuất.

QC theo lô có số mặc định: lượng kiểm = lượng lô; lượng đạt = lượng kiểm; lỗi = 0. QC theo kế hoạch mua ưu tiên số đếm thực tế đã ghi nếu có, nếu chưa thì lấy số theo kế hoạch làm gợi ý. Các giá trị vẫn sửa được trước khi xác nhận. Sửa số lỗi thì tính lại số đạt; sửa số đạt thì tính lại lỗi; sửa lượng kiểm thì giữ lượng lỗi đang nhập và tính lại đạt nếu số hợp lệ. Đổi lô phải đặt lại số của lô mới và lỗi bằng 0, không giữ số lỗi từ lô cũ. Máy chủ vẫn kiểm tra đạt + lỗi = kiểm và giới hạn nguồn; không tự lưu kết quả đạt khi chưa xác nhận.

Khi rà soát dữ liệu ban đầu cho yêu cầu này: đơn hiện tại có ngày giao 31/12/2026 và chưa có kế hoạch bán được duyệt. Đây là hai điều kiện cần hoàn tất, không phải lý do bỏ kiểm tra ngày hoặc tự duyệt kế hoạch.

Kiểm tra đã chạy: 84 kiểm thử đơn vị và 12 nhóm MySQL đạt. Bài production-delivery tạo kế hoạch bán không truyền khách/đơn, kiểm đúng liên kết và luồng xuất thật. Bài finished-parts-task lập kế hoạch bán từ báo cáo đợt cuối, duyệt bằng tồn của phần trước, kiểm ngày giao và phân công phần trước; không tự bỏ chặn giao sớm. Bài trình duyệt sale-qc-defaults kiểm khách hàng cố định, lượng cả chuỗi, giá trị QC mặc định/sửa/tính lại và đổi lô.
