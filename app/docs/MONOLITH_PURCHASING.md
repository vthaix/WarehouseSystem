# Mua nguyên vật liệu sau phê duyệt

1. Bộ phận lập kế hoạch lập kế hoạch mua nguyên vật liệu, bằng cách lập trực tiếp hoặc lấy nhu cầu từ báo cáo sản xuất đã gửi. Chọn lượng, giá dự kiến và ngày mong nhận; chưa chọn nhà cung cấp.
2. Ban giám đốc xem xét kế hoạch và phê duyệt hoặc từ chối kèm lý do.
3. Bộ phận mua hàng chọn hình thức: theo kế hoạch Mua đã được duyệt (mỗi kế hoạch tối đa một đơn mua) hoặc lập trực tiếp không cần kế hoạch.
4. Hệ thống điền danh sách nguyên vật liệu, lượng và ngày nhận theo kế hoạch. Người mua chọn nhà cung cấp riêng cho từng dòng, nhập giá thỏa thuận và điều kiện giao hàng.
5. Xác nhận tạo đơn. Đặt mua chưa tạo lô thực nhận và chưa tăng tồn kho.
6. Khi hàng về, ghi nhận từng phần thực nhận, kiểm chất lượng, lập yêu cầu nhập, phân công và ghi phiếu nhập theo đúng luồng kho.

Đơn lập trực tiếp (UC-27 luồng 3.1): người mua tự chọn nguyên vật liệu, số lượng, nhà cung cấp có báo giá, giá và ngày nhận (không trước hôm nay); lô thực nhận của đơn vẫn qua QC và nhập kho như đơn theo kế hoạch. Không mua thẳng từ báo cáo. Kế hoạch mua lập trực tiếp vẫn dùng được sau khi duyệt, không bắt buộc có báo cáo sản xuất nguồn.

Giao diện có hai hình thức Theo kế hoạch và Lập trực tiếp. API và trigger MySQL (migration 017) kiểm tra lại: đơn theo kế hoạch phải gắn kế hoạch MUA đã duyệt, đơn lập trực tiếp không được gắn kế hoạch/báo cáo. Đã có kiểm thử từ chối kế hoạch chưa duyệt, hình thức mua không hợp lệ, sai lượng/nhà cung cấp và tạo hai đơn đồng thời cho một kế hoạch.

Ngày mới không nằm trong quá khứ. Ngày bắt đầu sản xuất không sau ngày kết thúc; ngày kết thúc không vượt ngày nhận trễ nhất của đơn hàng. Kế hoạch mua gắn nguồn sản xuất phải nằm trong giới hạn ngày liên quan; đơn mua lấy lại ngày của kế hoạch, không tự sửa khác ngày nguồn. Ngày lọc tra cứu lịch sử không bị buộc từ hôm nay trở đi.
