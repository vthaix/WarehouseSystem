# Mua NVL và ràng buộc ngày — 22/10/2026

## Luồng hiện hành

1. Planner lập kế hoạch MUA từ báo cáo nhu cầu thực tế, chọn NVL/số lượng và **Ngày mong nhận NVL**. Không chọn NCC. Trường API `planned_date` là ngày mong nhận ở nhánh MUA, không đổi tên JSON cũ.
2. Giám đốc duyệt kế hoạch MUA. Bộ phận mua hàng lập đơn với đúng hai nguồn: **Tự nhập** (`MANUAL`) hoặc **Kế hoạch mua NVL đã duyệt** (`PLAN`). Không lập đơn mới trực tiếp từ REPORT; chứng từ REPORT cũ vẫn đọc được.
3. PLAN điền toàn bộ mặt hàng, đơn vị, số lượng và ngày nhận theo kế hoạch. Purchaser chọn **NCC riêng cho từng NVL**, nhập đơn giá thực tế và điều kiện giao. Ngày nhận chỉ đọc; backend tự lấy lại từ kế hoạch và chặn giá trị bị sửa khác nguồn. MANUAL nhập NVL/lượng/NCC/giá và ngày nhận, không gắn báo cáo/kế hoạch giả.
4. Giữ một đơn mua cho mỗi kế hoạch. Một đơn có thể nhiều NCC; không tự tách thành nhiều đơn hoặc cộng dự phòng lần nữa. Mỗi NVL chỉ một dòng/NCC trong đơn. Mỗi lô thực giao chỉ thuộc một NCC; màn nhận hàng chọn NCC để lọc dòng theo đơn, backend chặn lô trộn NCC.

## Dữ liệu và tương thích

- `ChiTietDonMuaHang.MaNhaCungCap` / `lines[].supplier_id`: NCC của dòng; API trả tên NCC và đơn vị. Đơn mới bắt buộc NCC hoạt động cho từng dòng.
- `DonMuaHang.MaNhaCungCap`: cùng một NCC thì lưu NCC chung; nhiều NCC thì NULL. API danh sách dùng LEFT JOIN để vẫn hiện đơn nhiều NCC.
- `KeHoachMuaBan.MaNhaCungCap`: không chọn khi lập MUA. Payload cũ còn supplier_id được bỏ qua tại nhánh MUA, đơn mới lưu NULL; không dùng NCC kế hoạch làm ràng buộc đơn mua.
- Migration `008_purchase_line_suppliers` thêm cột/FK ở Business, điền NCC dòng từ đầu đơn lịch sử khi có, cho phép đầu đơn nhiều NCC và kế hoạch MUA không NCC, làm mới view tương thích và đủ tám checkpoint. Không xóa đơn/báo cáo/tồn, không chỉnh ownership cutover hay migration cũ.

## Ngày

Ngày mới chọn khi lập/sửa là hôm nay hoặc tương lai, theo múi giờ Việt Nam; ngày lọc tra cứu lịch sử không bị giới hạn này. Backend kiểm lại độc lập với min/max HTML.

- KHSX: hôm nay ≤ bắt đầu ≤ kết thúc ≤ ngày giao thành phẩm (`latest_delivery_date`) của đơn nguồn. Sửa KHSX và duyệt lại cũng kiểm; khách rút ngắn ngày giao xuống trước ngày kết thúc KHSX hiện có bị chặn.
- MUA: ngày mong nhận NVL không vượt kết thúc KHSX hoặc hạn giao của đơn nguồn. BAN: ngày dự kiến giao không vượt ngày giao của đơn.
- Đơn mua PLAN lấy ngày từ MUA đã duyệt; MANUAL chọn ngày không quá khứ. MUA cũ đã quá ngày bị chặn khi lập đơn, không sửa ngày âm thầm tại đơn mua.
- Các ngày nhập mới của yêu cầu kho, đợt kiểm kê, báo cáo hoàn tất và lô cũng kiểm không quá khứ. Lịch công việc không chọn ngày trước hôm nay. Ngày NSX/HSD của lô từng phần đã lưu được đưa vào báo cáo tổng kết dưới dạng bất biến: giữ lịch sử, không thay ngày cũ bằng ngày hôm nay.

Lỗi `[object Object]` được sửa tại hàm render option chung: dùng mã/tên/tiêu đề hoặc `#id`, không chuyển object thành chuỗi. Không đổi ID được gửi về API.

## Kiểm chứng

`planning-dates.test.js` kiểm ranh giới ngày. Split MySQL acceptance bổ sung kiểm tạo/sửa KHSX trễ, kế hoạch MUA trễ, NCC khác nhau từng NVL, tự lấy ngày nhận, chặn REPORT và lô trộn NCC. Browser source-imports kiểm nhãn báo cáo, MUA không chọn NCC, hai chế độ đơn mua, NCC dòng, ngày tự điền và đổi nguồn không giữ dữ liệu cũ. SQL dùng schema acceptance riêng; browser mock mutation để không thêm dữ liệu vào CSDL test tay.
# Cập nhật: hai hình thức lập kế hoạch mua NVL

Planner có thể chọn **Nhập tay** (tự chọn NVL, số lượng, đơn giá dự kiến và ngày mong nhận; không bắt buộc báo cáo nguồn) hoặc **Import từ báo cáo sản xuất** (báo cáo nhu cầu đã gửi cho planner, lấy các dòng thiếu thực tế và giữ liên kết nguồn). Không chọn nhà cung cấp tại kế hoạch; bộ phận mua hàng chọn trên từng dòng đơn mua. Chi tiết báo cáo nhu cầu có nút **Tạo kế hoạch mua NVL**, tự chọn báo cáo và điền dòng hàng. Giữ kiểm tra ngày, phê duyệt và giới hạn lượng theo nguồn đối với kế hoạch import.

