# PHIẾU CHẤM CHỨC NĂNG WAREHOUSESYSTEM

Ngày lập: 15/10/2026.

| Thông tin | Nội dung |
| --- | --- |
| Người chấm | ........................................................ |
| Ngày chấm | ........................................................ |
| Phiên bản / commit | ........................................................ |
| Môi trường kiểm thử | ........................................................ |

## Thang điểm

Phiếu gồm **10 tiêu chí, mỗi tiêu chí là một module**. Đề xuất mỗi module tối đa 10 điểm, tổng 100 điểm. Các nội dung kiểm tra bên dưới dùng làm căn cứ chấm module, không tách thành tiêu chí tính điểm riêng.

**UC-01 Đăng nhập không thuộc phạm vi chấm theo yêu cầu.** Tài khoản đã đăng nhập là tiền điều kiện khi chấm các module; phân quyền thao tác vẫn được kiểm tra trong từng module. Module Công việc chỉ chấm nghiệp vụ phân công và thực hiện công việc, không mở rộng sang quản lý nhân viên.

| Mức đánh giá | Điểm gợi ý / module |
| --- | --- |
| Hoàn chỉnh: thực hiện được luồng chính, xử lý lỗi và phân quyền đúng, dữ liệu chính xác | 9–10 |
| Khá: luồng chính hoạt động, còn lỗi nhỏ hoặc thiếu một số nhánh phụ | 7–8 |
| Đạt một phần: thực hiện được một phần nghiệp vụ nhưng còn thiếu bước hoặc sai dữ liệu | 5–6 |
| Chưa đạt: lỗi nghiêm trọng, không hoàn thành luồng chính | 1–4 |
| Chưa có chức năng hoặc không thể thực hiện | 0 |

Nếu chưa thể chấm vì yêu cầu chưa thống nhất hoặc thiếu dữ liệu, ghi **Chưa chấm** và lý do; không tự quy thành 0 điểm. Điểm quy đổi thang 10 khi đã chấm đủ: **Tổng điểm / 10**.

## Bảng tổng hợp

| STT | Tiêu chí / module | Điểm tối đa | Điểm chấm | Đánh giá / ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Quản lý hàng trong kho | 10 | ........ | ................................ |
| 2 | Đặt hàng (khách hàng) | 10 | ........ | ................................ |
| 3 | Tiếp nhận hàng / tiếp nhận đơn hàng khách hàng | 10 | ........ | ................................ |
| 4 | Báo cáo sản xuất | 10 | ........ | ................................ |
| 5 | Mua nguyên vật liệu | 10 | ........ | ................................ |
| 6 | Nhập kho | 10 | ........ | ................................ |
| 7 | Báo cáo thành phẩm | 10 | ........ | ................................ |
| 8 | Xuất kho | 10 | ........ | ................................ |
| 9 | Kiểm kê | 10 | ........ | ................................ |
| 10 | Công việc | 10 | ........ | ................................ |
| | **Tổng điểm** | **100** | **........** | |
| | **Quy đổi thang 10** | **10** | **........** | Chỉ tính khi đã chấm đủ 10 module |

Trong phiếu này, module 3 được hiểu là **Bộ phận lập kế hoạch tiếp nhận đơn hàng khách hàng tại UC-29**. Tiếp nhận hàng vật lý từ nhà cung cấp được kiểm tra ở module Mua NVL và Nhập kho.

## 1. Quản lý hàng trong kho

**Tài khoản:** `manager`; đối chiếu quyền tra cứu của `workshop`.

**UC liên quan:** UC-06, UC-06.1, UC-06.2, UC-06.3, UC-07, UC-07.1, UC-07.2, UC-07.3, UC-18, UC-22.

Nội dung kiểm tra:

- [ ] Hiển thị danh sách, tìm kiếm và xem chi tiết danh mục, mặt hàng, kho, vị trí, nhà cung cấp và lô liên quan.
- [ ] Thêm, sửa, xóa hoặc ngừng sử dụng dữ liệu đúng điều kiện; chặn xóa dữ liệu đang được tham chiếu hoặc có giao dịch/tồn kho.
- [ ] Danh mục có ảnh; thêm, thay và bỏ ảnh được; xử lý ảnh không hợp lệ.
- [ ] Kiểm tra trường bắt buộc, trùng dữ liệu, định dạng và số lượng/giá trị không hợp lệ.
- [ ] Tra cứu đúng tồn kho, lô, vị trí và tình trạng chất lượng; phân biệt tồn thực tế với tồn khả dụng.
- [ ] Phân quyền đọc/ghi đúng; người không có quyền không thao tác được qua URL/API trực tiếp.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 2. Đặt hàng (khách hàng)

**Tài khoản:** `customer`, `customer2`.

**UC liên quan:** UC-02, UC-03, UC-03.1.

Nội dung kiểm tra:

- [ ] Khách hàng xem và chọn bánh mẫu đã công bố để đặt hàng.
- [ ] Nhập sản phẩm, số lượng, địa chỉ, ngày nhận hàng và ghi chú; tạo đơn và chi tiết đúng dữ liệu.
- [ ] Chặn thiếu thông tin, số lượng không hợp lệ và ngày nhận trong quá khứ; tổng tiền chính xác.
- [ ] Khách hàng xem, tìm kiếm và theo dõi đơn của chính mình.
- [ ] Sửa đơn trong trạng thái cho phép; xử lý xác nhận tăng/giảm số lượng theo đặc tả; hủy sửa không thay đổi dữ liệu.
- [ ] Không xem/sửa được đơn của khách hàng khác; không sửa được đơn đã qua trạng thái cho phép.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 3. Tiếp nhận hàng / tiếp nhận đơn hàng khách hàng

**Tài khoản:** `planner`, `director`.

**UC liên quan:** UC-29, nhánh lập kế hoạch sản xuất của UC-04, UC-31.

Nội dung kiểm tra:

- [ ] Bộ phận lập kế hoạch xem được đơn chờ tiếp nhận và thông tin khách hàng, thành phẩm, số lượng, hạn giao.
- [ ] Tiếp nhận đúng đơn; cập nhật trạng thái và không tiếp nhận trùng.
- [ ] Khi lập kế hoạch sản xuất, tự điền thông tin từ đơn nguồn; chọn xưởng và kiểm tra liên kết đơn–kế hoạch–xưởng.
- [ ] Xác định NVL dự kiến và dự phòng theo quy tắc thống nhất; không cộng dự phòng lặp lại.
- [ ] Ban giám đốc duyệt từng KHSX; đơn liên quan tự cập nhật đã duyệt. Từ chối trả KHSX về chỉnh sửa, không từ chối đơn hay tự duyệt kế hoạch khác.
- [ ] Xử lý danh sách rỗng, thiếu xưởng/nguồn, chứng từ đã được người khác xử lý và người dùng sai quyền.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 4. Báo cáo sản xuất

**Tài khoản:** `workshop`, `director`, `planner`.

**UC liên quan:** UC-34.

Nội dung kiểm tra:

- [ ] Chủ xưởng chọn kế hoạch đã duyệt thuộc xưởng và đang trong quá trình sản xuất.
- [ ] Lập được báo cáo tiến độ, sự cố hoặc nhu cầu/thiếu NVL; nhập mô tả và tiến độ từ 0% đến dưới 100%.
- [ ] Hiển thị NVL cần dùng, tồn khả dụng và lượng thiếu chính xác; không tính thiếu âm.
- [ ] Báo cáo mặc định gửi Ban giám đốc; chỉ gửi thêm Bộ phận lập kế hoạch khi được chọn.
- [ ] Người nhận xem được báo cáo đúng phạm vi; báo cáo không gửi planner không bị lộ qua URL/API.
- [ ] Hủy hoặc dữ liệu không hợp lệ thì không lưu/gửi; không dùng báo cáo sản xuất để thay báo cáo hoàn tất thành phẩm.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 5. Mua nguyên vật liệu

**Tài khoản:** `planner`, `director`, `purchaser`, `qc`.

**UC liên quan:** UC-04, UC-05, UC-05.1, UC-05.2, UC-32, UC-27, UC-14; UC-12 và các UC con cho QC NVL.

Nội dung kiểm tra:

- [ ] Lập kế hoạch MUA từ nhu cầu thiếu hợp lệ; xem, sửa/xóa đúng trạng thái và trình duyệt.
- [ ] Ban giám đốc duyệt/từ chối; lý do và trạng thái được ghi nhận đúng.
- [ ] Bộ phận mua hàng import nguồn được phép hoặc lập thủ công theo yêu cầu đã thống nhất.
- [ ] Đơn mua có NCC, mặt hàng, lượng mua, giá, ngày/điều kiện giao và liên kết nguồn đúng; tổng tiền chính xác.
- [ ] Chặn sai loại nguồn, sai báo cáo, lượng mua trùng/vượt nhu cầu; quản lý được danh sách và trạng thái đơn mua.
- [ ] Ghi nhận lô thực nhận, QC đạt/lỗi; phần NVL trả NCC không vào tồn khả dụng.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 6. Nhập kho

**Tài khoản:** `workshop`, `manager`, `staff`, `staff2`, `qc`.

**UC liên quan:** Nhánh nhập của UC-23, UC-24, UC-24.1, UC-24.2, UC-10, UC-08, UC-20; UC-12 và các UC con.

Nội dung kiểm tra:

- [ ] Chủ xưởng lập yêu cầu nhập NVL theo nguồn/lô thực nhận hợp lệ, chỉ lấy phần đạt còn được nhập.
- [ ] Chủ xưởng nhập tay thành phẩm từng phần; các lần cùng đợt sản xuất dùng cùng mã lô, không đợi báo cáo thành phẩm cuối cùng.
- [ ] Tạo/sửa/hủy yêu cầu đúng trạng thái; tạo yêu cầu chưa làm tăng tồn.
- [ ] QC đúng dòng lô, lượng đạt + lỗi = lượng kiểm; không nhập phần chưa đạt hoặc vượt lượng còn lại.
- [ ] Nhân viên được phân công ghi đúng kho, vị trí, lô, số lượng thực nhập và lý do chênh lệch khi cần.
- [ ] Ghi sổ tạo phiếu/chi tiết và tăng tồn chính xác một lần; lỗi giữa giao dịch không để dữ liệu dở dang; tra cứu hồ sơ nhập được.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 7. Báo cáo thành phẩm

**Tài khoản:** `workshop`, `director`.

**UC liên quan:** UC-35.

Nội dung kiểm tra:

- [ ] Chỉ lập báo cáo kết thúc khi toàn bộ đợt sản xuất đã hoàn tất; đúng kế hoạch và xưởng.
- [ ] Nhập thành phẩm thực tế, NVL đã sử dụng, ngày hoàn thành và ghi chú.
- [ ] Phân bổ lô khớp tổng báo cáo; dùng lại lô đã nhập từng phần, không tạo nhập kho lặp.
- [ ] Báo cáo lưu loại THANH_PHAM, đủ chi tiết và liên kết truy vết.
- [ ] Ban giám đốc nhận và xem được báo cáo; quyền sửa/gửi và tính bất biến đúng quy tắc đã thống nhất.
- [ ] Hủy không lưu/gửi; chặn thiếu dữ liệu, sai lượng, sai lô hoặc không đúng quyền/xưởng.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 8. Xuất kho

**Tài khoản:** `workshop`, `planner`, `director`, `manager`, `staff`, `staff2`.

**UC liên quan:** Nhánh xuất của UC-23, UC-24 và các UC con, UC-11, UC-11.01, UC-11.02, UC-09, UC-19; kế hoạch BAN tại UC-04/05/32.

Nội dung kiểm tra:

- [ ] Phân biệt xuất NVL để sản xuất và xuất thành phẩm để giao khách.
- [ ] Yêu cầu xuất NVL lấy đúng nhu cầu nguồn được thống nhất; trừ lượng đã cấp/còn cam kết và không cộng dự phòng lần nữa.
- [ ] Xuất TP dựa trên đơn/kế hoạch BAN đã duyệt, sản xuất hoàn tất, đến ngày giao và hàng đạt QC đã nhập kho.
- [ ] Chọn/phân bổ lô khả dụng; chặn hàng cách ly, lô không hợp lệ, thiếu tồn và lượng giao vượt đơn/nguồn.
- [ ] Nhân viên được phân công ghi lượng/lô thực xuất; cập nhật phiếu, tồn, yêu cầu, lượng đã giao và kế hoạch liên quan chính xác.
- [ ] Gửi lại hoặc hai người xuất đồng thời không trừ tồn trùng/âm; lỗi giao dịch rollback; hồ sơ xuất tra cứu đúng.
- [ ] Không thể thực hiện thì ghi lý do và xử lý đúng luồng ngoại lệ; không tự ghi sổ khi chưa thực xuất.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 9. Kiểm kê

**Tài khoản:** `director`, `stocktaker`, `qc`, `manager`.

**UC liên quan:** UC-13, UC-15, UC-28, UC-16, UC-17, UC-21.

Nội dung kiểm tra:

- [ ] Lập đợt kiểm kê đúng kho, thời gian, loại hàng và người được phân công.
- [ ] Chốt tồn hệ thống làm căn cứ; ngăn nghiệp vụ kho trong phạm vi khóa kiểm kê theo quy tắc đã thống nhất.
- [ ] Người được giao nhập số đếm đúng phạm vi; phân biệt số 0 với chưa đếm; lưu tạm và hoàn tất được.
- [ ] Xử lý mất mạng/lưu lại theo đặc tả; không mất hoặc nhân đôi số liệu khi thử lại.
- [ ] Lập/lưu tạm/gửi biên bản và kết luận đúng điều kiện; tính chênh lệch thiếu, đủ, thừa chính xác.
- [ ] Ghi nguyên nhân, lập đề xuất, duyệt và thực hiện điều chỉnh đúng vai trò; lưu lịch sử và không áp dụng hai lần.
- [ ] Đóng đợt đúng điều kiện; xem/lọc/xuất báo cáo kiểm kê khớp số liệu.

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## 10. Công việc

**Tài khoản:** `director`; đối chiếu công việc kho của `manager`, `staff`, `staff2`, `qc`, `stocktaker` và những người được phân công liên quan.

**UC liên quan:** UC-25, UC-25.1, UC-25.2. Công việc nhập/xuất, QC và kiểm kê được đối chiếu thêm với module nghiệp vụ tương ứng.

Nội dung kiểm tra:

- [ ] Ban giám đốc xem danh sách và chi tiết công việc: tên, mô tả, thời gian bắt đầu/kết thúc, độ ưu tiên, trạng thái và người được phân công; xử lý danh sách rỗng.
- [ ] Mở chỉnh sửa hiển thị đúng dữ liệu hiện tại; xác nhận lưu đúng thay đổi; chọn Hủy giữ nguyên dữ liệu.
- [ ] Kiểm tra thông tin bắt buộc, trường số, giá trị âm và thời gian không hợp lệ; lỗi không làm thay đổi công việc.
- [ ] Thêm/đổi người được phân công có kiểm tra trùng lịch; chặn lịch chồng lấn, kể cả khi hai người cập nhật đồng thời.
- [ ] Xóa công việc đủ điều kiện có bước xác nhận; Hủy không xóa; công việc đang thực hiện không bị xóa.
- [ ] Người được phân công chỉ xem và thực hiện công việc trong phạm vi được giao; không đọc/ghi công việc của người khác qua URL/API trực tiếp.
- [ ] Theo dõi tiến độ và trạng thái gắn với nghiệp vụ thực tế; không hoàn tất công việc kho khi chưa ghi nhận lượng thực hiện; bảo toàn chứng từ và kết quả đã hoàn tất.
- [ ] Khi cập nhật từ phiên bản cũ, hệ thống chặn ghi đè thay đổi mới và hướng dẫn tải lại dữ liệu.

**Ca kiểm thử đối chiếu:** Các ca `TC-25-*`, `TC-25-1-*`, `TC-25-2-*` trong [TEST_CASES.md](TEST_CASES.md); ca bổ sung về quyền chung và các bộ kiểm thử công việc ghi tại [TEST_RESULTS.md](TEST_RESULTS.md).

**Điểm:** ........ / 10

**Lỗi / bằng chứng / nội dung cần sửa:**

................................................................................................

................................................................................................

## Kết luận và nội dung cần hoàn thiện

| Nội dung | Ghi nhận |
| --- | --- |
| Module cần ưu tiên sửa | ................................................................ |
| Lỗi nghiêm trọng còn tồn tại | ................................................................ |
| Yêu cầu cần thống nhất | ................................................................ |
| Kết luận của người chấm | ................................................................ |
| Thời điểm chấm lại | ................................................................ |

Người chấm ký / xác nhận: ........................................................

## Tài liệu đối chiếu

- [Đặc tả UC](DacTa_WarehouseSystem.md).
- [Test case và các điểm chưa thống nhất](TEST_CASES.md), đặc biệt Q01–Q10 trước khi chấm những luồng liên quan.
- [Kết quả kiểm thử đã chạy](TEST_RESULTS.md) và [ma trận thực thi](TEST_EXECUTION_MATRIX.md); không dùng số test tự động đạt để tự điền điểm cho module.
- [Tài khoản mẫu và quyền](DEMO_ACCOUNTS.md).

Thang điểm 10/module là đề xuất cho phiếu này, không phải thang điểm chính thức đã được giảng viên xác nhận. Phiếu chưa có điểm chấm sẵn.
