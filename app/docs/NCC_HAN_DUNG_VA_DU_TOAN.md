# Hạn dùng theo NCC, dự toán mua và lượng còn được nhận — 31/10/2026

## Cấu hình hạn dùng

Quản lý mở **Đơn giá nguyên vật liệu**, chọn NVL rồi sửa bảng báo giá. Mỗi NCC có đơn giá và **hạn dùng tính bằng số ngày từ ngày sản xuất**. Khi một NCC có giá, form yêu cầu số ngày nguyên 1–36.500. Hai NCC của cùng NVL có thể có hai mức giá và hai hạn dùng khác nhau.

Dữ liệu mẫu bổ sung số ngày theo nhóm NVL một lần để thử nghiệm; đây là cấu hình demo, cần chỉnh theo điều kiện nhà cung cấp thực tế. Không tính lại hoặc sửa hạn dùng của lô lịch sử.

Đơn mua lưu số ngày của cặp NVL–NCC tại thời điểm đặt mua. Form QC hiển thị số ngày và ngày hết hạn gợi ý trước khi xác nhận; QC ghi ngày sản xuất trên hàng thực nhận. Ngày hết hạn = ngày sản xuất + số ngày đã lưu. Khi tạo lô phần đạt, quản lý không nhập lại ngày hết hạn; lô giữ đúng ngày đã ghi nhận. Thay cấu hình NCC sau đó không làm đổi đơn mua, kết quả QC hoặc lô đã ghi nhận. Lượng đạt của hàng đã hết hạn bị từ chối.

Migration 009 bổ sung `ChiTietDonMuaHang.SoNgayHanDung`, ngày sản xuất/hết hạn/số ngày trên `ThucKiemKeHoachMua`, và bảng giá ước lượng trên từng dòng kế hoạch. Cấu hình từng cặp NVL–NCC được giữ trong `NguyenVatLieu.BangGiaNCC`, không tạo thêm entity kế thừa.

## Ước lượng kế hoạch mua

Khi lập hoặc sửa kế hoạch MUA, hệ thống lấy báo giá của các NCC đang hoạt động và đang cung cấp từng NVL. Đơn giá ước lượng là trung bình các báo giá, làm tròn đến bốn chữ số thập phân ở máy chủ. Tổng kế hoạch = tổng số lượng × đơn giá ước lượng, tính bằng số nguyên theo độ chính xác lưu trữ.

Form hiển thị tổng dự toán, khoảng thấp nhất–cao nhất và báo giá từng NCC; không bắt planner chốt NCC thay purchaser. Khi không có báo giá phù hợp, giao diện ghi rõ chưa có báo giá; dữ liệu tương thích API cũ vẫn có thể dùng giá nhập trực tiếp, không giả vờ đã lấy được báo giá NCC.

Từng dòng lưu bản chụp báo giá đã dùng để tính; chi tiết kế hoạch xem lại bản này. Sau khi lưu/gửi duyệt, thay giá danh mục không tự đổi dự toán và phê duyệt không tự tính lại. Khi người lập sửa các dòng kế hoạch thì lấy báo giá hiện tại. Giá mua thực tế trong đơn mua vẫn do bộ phận mua hàng chốt, độc lập với dự toán.

## Nhận lô trùng lượng

Đơn `DM-NHIEUNHACUNGCAP-01` được kiểm tra khi người dùng báo lỗi: bột mì 60,5 kg và đậu xanh 9,9 kg đã có lô đủ lượng; chocolate đã có lô 30 và kết quả lỗi 3, tổng đủ 33. Không được tạo lại những lượng này.

Lượng còn được nhận = lượng đơn mua − lượng đã có lô − lượng đã thực kiểm chưa có lô − lượng lỗi còn được giữ trên kết quả thực kiểm sau khi đã tạo lô phần đạt. Không trừ cả lượng thực kiểm và lượng lô đạt hai lần.

Danh sách nguồn bỏ các dòng đã ghi nhận đủ. Xem nguồn hiển thị đúng phần còn lại; form có giới hạn lượng và nút tải lại. Trước khi lưu, giao diện đọc lại số liệu mới nhất để chặn form cũ đã lỗi thời. Máy chủ vẫn kiểm tra dưới khóa dòng đơn mua, không cho hai người nhận trùng lượng. Thông báo chỉ rõ mặt hàng, lượng đã ghi nhận và cách tải lại thay cho câu lỗi chung chung. Không xóa lô cũ, không giảm lượng đã nhận để cho phép tạo lại.

## Kiểm tra

- `tests/unit/supplier-terms.test.js`: trung bình giá chính xác, giá min/max, ngày hết hạn qua tháng/năm nhuận, số ngày không hợp lệ.
- `scripts/supplier-terms-smoke.cjs`: hai NCC giá 100/200 → giá dự toán 150; số lượng 2 → tổng 300; đổi bảng giá vẫn giữ kế hoạch cũ; PO lưu số ngày; QC và tạo lô dùng đúng số ngày đó, không nhận ngày hết hạn tùy ý từ bước tạo lô.
- `scripts/purchase-plan-check-smoke.cjs`: thực kiểm 37, đạt 35, lỗi 2; nguồn nhận lô không còn gợi ý thêm 2; không tạo lại lượng đã kiểm hoặc đã có lô.
- `e2e/supplier-terms.cjs`: tổng tiền cập nhật theo lượng, dấu phẩy thập phân, nhập hạn dùng từng NCC và màn hình nhỏ.
- `e2e/receipt-remaining.cjs`: form đang mở nhưng nguồn vừa hết lượng, chặn trước khi gửi tạo lô; tải lại cho biết đã ghi nhận đủ và khóa nút lưu.

Chỉ thao tác ghi thử nghiệm trên Compose riêng; dữ liệu nghiệp vụ chính không được reset.

Kết quả cuối: 84/84 kiểm thử đơn vị, 12/12 nhóm MySQL, hai kiểm tra API chuyên biệt và các bài trình duyệt dự toán/hạn dùng, lượng còn nhận, danh mục tài khoản, nhập nguồn, phân công kho đều đạt. Đã build dự án chính thành công, ứng dụng healthy. Trong khi cập nhật có một lô mới phát sinh ở môi trường chính; không dùng số lượng tổng để khẳng định dữ liệu bất biến. Phiếu kho, tồn và yêu cầu giữ nguyên trong khoảng kiểm tra; các thao tác thử nghiệm ghi đều nhắm cổng 3310 có cờ test_instance, không nhắm dữ liệu chính.
