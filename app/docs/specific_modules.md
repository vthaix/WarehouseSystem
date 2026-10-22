## 1. Module đặt hàng

Khách hàng sau khi đăng nhập (UC-01) vào hệ thống sẽ đặt đơn hàng (UC-02), đơn hàng sẽ được quản lý bằng UC-03, 3.1. Sau đó bộ phận lập kế hoạch sẽ thấy đơn hàng chờ tiếp nhận trong hệ thống và có thể tieeps nhận đơn hàng (UC-29).
Sau đó, bộ phận lập kế hoạch sẽ lập kế hoạch sản xuất (UC-04) và gửi cho giám đốc, giám đốc sẽ phê duyệt kế hoạch (UC-31), đơn hàng bên khách hàng sẽ cập nhật trạng thái đã phê duyệt.

# UC-01:

Hệ thống sẽ hiển thị danh sách mặt hàng có thể đặt, khách hàng chọn mặt hàng, số lượng, ghi chú, ngày muốn nhận dự kiến để đặt hàng (khách hàng có thể cùng lúc đặt nhiều mặt hàng trong 1 lần, tính cùng lô).

# UC-04:

Kế hoạch sản xuất sẽ bao gồm toàn bộ thông tin đơn hàng, xưởng phụ trách

## 2. Module tiền sản xuất

Sau khi đơn hàng được phê duyệt và phân công cho xưởng, chủ xưởng phụ trách sẽ nhận được thông báo về kế hoạch sản xuất,
lúc này chủ xưởng sẽ kiểm tra tồn kho (UC-22), xem thử đủ nguyên vật liệu hay không, và lập báo cáo sản xuất (UC-34) để báo cáo cho giám đốc và gửi luôn báo cáo cho bộ phận lập kế hoạch (nếu không đủ NVL).
Bộ phận lập kế hoạch sẽ lập kế hoạch mua bán (mua NVL) (UC-04) và gửi cho ban giám đốc, ban giám đốc sẽ duyệt kế hoạch mua/bán (UC-32). Và bộ phận mua hàng
sẽ nhận được kế hoạch mua NVL và thực hiện đặt hàng (UC-27) và có thể quản lý (UC-14)

# UC-22:

Chủ xưởng sau khi xem kế hoạch sản xuất sẽ có thể biết mặt hàng nào cần những loại NVL nào, chủ xưởng dựa vào định lượng công thức và nhân với số lượng
sẽ ra được NVL dự kiến, sau đó sẽ kiểm tra tồn kho bằng cách nhấn vào kế hoạch sản xuất, chọn đối chiếu tồn kho, hệ thống sẽ tự kiếm kê và đưa ra số 
lượng chênh lệch còn thiếu.

# UC-34:

Chủ xưởng từ lượng chênh lệch đó sẽ tạo luôn báo cáo sản xuất (chụp ảnh chênh lệch và dán vào mục mô tả kèm ghi chú), gửi cho ban giám đốc và bộ phận lập kế hoạch. Báo cáo sản xuất có thể lập bất kì thời điểm nào
ví dụ trong quá trình sản xuất máy móc hư cũng có thể lập, hoặc mỗi đơn hàng sẽ sản xuất thành nhiều đợt nhỏ, mỗi đợt thành phẩm nhỏ cùng mã lô sẽ được nhập kho TP trước,
lúc này cũng có thể lập.
