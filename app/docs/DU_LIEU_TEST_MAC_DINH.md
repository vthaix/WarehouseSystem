# Dữ liệu test mặc định

Bấm nút **XÓA DỮ LIỆU TEST** là toàn bộ dữ liệu trở về đúng bộ này: đơn hàng, kế hoạch, kho, danh mục, nhà cung cấp và tài khoản. Những gì tự thêm hoặc sửa trước đó sẽ mất; hệ thống tự sao lưu trước khi khôi phục. Sau khi bấm, mọi người đăng nhập lại.

- Mật khẩu tất cả tài khoản: **123456**.
- Mỗi UC có dữ liệu riêng, test UC nào trước cũng được, không cần làm UC khác.
- Các bản ghi có nhãn **[UC-..]** trong ghi chú hoặc tên. Mã trong bảng dưới luôn giữ nguyên sau mỗi lần khôi phục.
- Ngày tháng tự dời theo ngày bấm nút: hạn giao sau khoảng 8 tháng, giờ thực hiện sau hơn 3 tháng, hạn dùng của lô từ 2 tháng trở lên. Vì vậy các thao tác "chỉ được làm trước ngày thực hiện" luôn còn thời gian. Nên bấm lại nút ít nhất mỗi 2 tháng.
- Riêng đơn để **xuất bán** có ngày giao là hôm trước, vì hệ thống chỉ cho xuất khi đã tới ngày giao.
- Kho KHO-KD-1 đến KHO-KD-7 dành riêng cho kiểm đếm tồn kho: kho đang kiểm kê bị khóa nhập/xuất nên không dùng chung với các UC khác.

| UC | Chức năng | Tài khoản | Màn hình | Cách test | Bản ghi dùng |
| --- | --- | --- | --- | --- | --- |
| UC-01 | Đăng nhập | mọi tài khoản | Đăng nhập | Mật khẩu chung 123456. Tài khoản khoa01 đang bị khóa; sai mật khẩu 5 lần thì tạm khóa 15 phút (bấm Xóa dữ liệu test để mở lại ngay). | khoa01 |
| UC-02 | Đặt đơn hàng | customer2 (lần đầu), customer | Đơn hàng | Đặt mới. customer2 chưa có người nhận trong hồ sơ nên phải nhập. | Mọi mặt hàng đang bán |
| UC-03 | Quản lý đơn hàng khách hàng | customer | Đơn hàng | Danh sách có đơn ở mọi trạng thái: chờ tiếp nhận, đã tiếp nhận, đã duyệt, đang làm, đã giao. | DH-KHACHHANG-112 |
| UC-03.1 | Sửa đơn hàng khách hàng | customer | Đơn hàng | Hai đơn chờ tiếp nhận sửa được; đơn thứ ba đã tiếp nhận; đơn cuối đã duyệt nên không còn nút sửa. | DH-KHACHHANG-113<br>DH-KHACHHANG-114<br>DH-KHACHHANG-115<br>DH-KHACHHANG-116 |
| UC-04 | Lập kế hoạch sản xuất | planner | Kế hoạch sản xuất | Tạo mới, chọn đơn đã tiếp nhận. | DH-KHACHHANG-50<br>DH-KHACHHANG-51<br>DH-KHACHHANG-52 |
| UC-04 | Lập kế hoạch mua | planner | Kế hoạch mua / bán | Tạo mới → Mua, chọn báo cáo thiếu nguyên vật liệu. | BCSX-KHACHHANG-01<br>BCSX-KHACHHANG-02<br>BCSX-KHACHHANG-03 |
| UC-04 | Lập kế hoạch bán | planner | Kế hoạch mua / bán | Tạo mới → Bán, chọn báo cáo thành phẩm (hàng đã nhập kho). | BCTP-KHACHHANG-38<br>BCTP-KHACHHANG-39<br>BCTP-KHACHHANG-40 |
| UC-05 | Sửa / hủy kế hoạch sản xuất | planner | Kế hoạch sản xuất | KHSX nháp chưa duyệt. | KHSX-KHACHHANG-61<br>KHSX-KHACHHANG-62 |
| UC-05 / 05.1 | Sửa kế hoạch | planner | Kế hoạch mua / bán | Kế hoạch đang chờ duyệt: hai kế hoạch mua, một kế hoạch bán. | KHMUA-NOIBO-28<br>KHMUA-NOIBO-29<br>KHBAN-KHACHHANG-28 |
| UC-05 / 05.1 | Sửa kế hoạch bị từ chối | planner | Kế hoạch mua / bán | Kế hoạch bị ban giám đốc từ chối, sửa rồi gửi lại. | KHMUA-NOIBO-33<br>KHMUA-NOIBO-34 |
| UC-05 / 05.2 | Xóa kế hoạch | planner | Kế hoạch mua / bán | Ba kế hoạch chờ duyệt xóa được; kế hoạch cuối đã duyệt nên không còn nút xóa. | KHMUA-NOIBO-30<br>KHMUA-NOIBO-31<br>KHBAN-KHACHHANG-29<br>KHMUA-NOIBO-32 |
| UC-06 / 06.1 | Quản lý, thêm danh mục kho | manager | Danh mục | Thêm mới; thử trùng tên với danh mục bên dưới. | [UC-06.1] Danh mục có sẵn 1 |
| UC-06.2 | Xóa danh mục kho | manager | Danh mục | Ba danh mục trống xóa được; danh mục cuối đang có mặt hàng nên bị chặn. | [UC-06.2] Danh mục để xóa 1<br>[UC-06.2] Danh mục để xóa 2<br>[UC-06.2] Danh mục để xóa 3<br>[UC-06.2] Đang có mặt hàng, không xóa được 1 |
| UC-06.3 | Sửa danh mục kho | manager | Danh mục | Sửa tên, mô tả, trạng thái. | [UC-06.3] Danh mục để sửa 1<br>[UC-06.3] Danh mục để sửa 2<br>[UC-06.3] Danh mục để sửa 3 |
| UC-07 / 07.1 | Quản lý, thêm dữ liệu danh mục | manager | Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp | Thêm mới; thử trùng mã KHO-THU-VT-1. | Kho để thử vị trí 1 |
| UC-07.1 | Ghi nhận lô hàng | manager | Lô hàng | Tạo mới, chọn đơn mua đang chờ nhận. | DM-NGUYENLIEUTAMANH-37<br>DM-NGUYENLIEUTAMANH-38<br>DM-THUCPHAMXUANHOAI-09 |
| UC-07.2 | Xóa dữ liệu danh mục | manager | Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp | Dữ liệu chưa dùng ở đâu nên xóa được; thử xóa Bột mì, KHO-01 để thấy bị chặn. | [UC-07.2] Mặt hàng để xóa 1<br>[UC-07.2] Mặt hàng để xóa 2<br>[UC-07.2] Mặt hàng để xóa 3<br>[UC-07.2] Kho để xóa 1<br>[UC-07.2] Kho để xóa 2<br>[UC-07.2] Vị trí để xóa 1<br>[UC-07.2] Vị trí để xóa 2<br>[UC-07.2] Nhà cung cấp để xóa 1<br>[UC-07.2] Nhà cung cấp để xóa 2 |
| UC-07.3 | Sửa dữ liệu danh mục | manager | Mặt hàng, Kho hàng, Vị trí lưu kho, Nhà cung cấp | Sửa thông tin rồi lưu. | [UC-07.3] Mặt hàng để sửa 1<br>[UC-07.3] Mặt hàng để sửa 2<br>[UC-07.3] Mặt hàng để sửa 3<br>[UC-07.3] Kho để sửa 1<br>[UC-07.3] Kho để sửa 2<br>[UC-07.3] Vị trí để sửa 1<br>[UC-07.3] Vị trí để sửa 2<br>[UC-07.3] Nhà cung cấp để sửa 1<br>[UC-07.3] Nhà cung cấp để sửa 2 |
| UC-08 | Quản lý nhập kho – phân công mới | manager | Quản lý nhập kho | Yêu cầu chờ phân công. | YC-NHAP-NVL-AHTOR-006<br>YC-NHAP-NVL-AHTOR-007<br>YC-NHAP-TP-AHTOR-014<br>YC-NHAP-TP-AHTOR-015 |
| UC-08 | Sửa / hủy phân công nhập | manager | Quản lý nhập kho | Đã phân công, giờ thực hiện còn hơn 3 tháng nên vẫn sửa, hủy được. | YC-NHAP-NVL-AHTOR-008<br>YC-NHAP-TP-AHTOR-016 |
| UC-09 | Quản lý xuất kho – phân công mới | manager | Quản lý xuất kho | Yêu cầu chờ phân công, kho đủ hàng. | YC-XUAT-NVL-AHTOR-004<br>YC-XUAT-NVL-AHTOR-005<br>YC-XUAT-TP-AHTOR-009<br>YC-XUAT-TP-AHTOR-010 |
| UC-09 | Sửa / hủy phân công xuất | manager | Quản lý xuất kho | Đã phân công, giờ thực hiện còn hơn 3 tháng nên vẫn sửa, hủy được. | YC-XUAT-NVL-AHTOR-006<br>YC-XUAT-TP-AHTOR-011 |
| UC-10 | Nhập kho | staff | Quản lý nhập kho | Phiếu đã giao cho nhân viên kho, chưa ghi. | YC-NHAP-NVL-AHTOR-009<br>YC-NHAP-NVL-AHTOR-010<br>YC-NHAP-TP-AHTOR-020<br>YC-NHAP-TP-AHTOR-021 |
| UC-10 | Nhập kho (nhân viên 2) | staff2 | Quản lý nhập kho | Phiếu giao cho nhân viên khác; tài khoản staff không thấy. | YC-NHAP-NVL-AHTOR-011 |
| UC-11.01 | Xuất nguyên vật liệu | staff | Quản lý xuất kho | Phiếu đã giao cho nhân viên kho, chưa ghi. | YC-XUAT-NVL-AHTOR-007<br>YC-XUAT-NVL-AHTOR-008<br>YC-XUAT-NVL-AHTOR-009 |
| UC-11.02 | Xuất thành phẩm | staff | Quản lý xuất kho | Phiếu đã giao cho nhân viên kho, đã tới ngày giao. | YC-XUAT-TP-AHTOR-012<br>YC-XUAT-TP-AHTOR-013<br>YC-XUAT-TP-AHTOR-014 |
| UC-12 / 12.1 | Thêm kết quả QC/AC | qc | Kiểm tra QA / QC | Đợt đang mở, lô chưa có kết quả. | [UC-12.1] Thành phẩm chờ QC 1 (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-048)<br>[UC-12.1] Thành phẩm chờ QC 2 (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-049)<br>[UC-12.1] Nguyên vật liệu chờ QC (DOT-KIEM-NVL-KHU-KIEM-TRA-LO-HANG-015)<br>[UC-12.1] Thực kiểm theo kế hoạch mua (DOT-KIEM-NVL-KHU-KIEM-TRA-LO-HANG-016) |
| UC-12 / 12.2 | Sửa kết quả QC/AC | qc | Kiểm tra QA / QC | Kết quả chưa lập biên bản, lô chưa nhập kho. | QC-TP-KHU-KIEM-TRA-LO-HANG-046<br>QC-TP-KHU-KIEM-TRA-LO-HANG-047<br>QC-NVL-KHU-KIEM-TRA-LO-HANG-015 |
| UC-12 / 12.3 | Xóa kết quả QC/AC | qc | Kiểm tra QA / QC | Kết quả chưa lập biên bản, lô chưa nhập kho. | QC-TP-KHU-KIEM-TRA-LO-HANG-048<br>QC-TP-KHU-KIEM-TRA-LO-HANG-049<br>QC-NVL-KHU-KIEM-TRA-LO-HANG-016 |
| UC-13 | Lập đợt kiểm kê thành phẩm | director | Lập đợt kiểm kê | Hai lô thành phẩm, mỗi lô 3 phần chưa ai kiểm. | BCTP-KHACHHANG-49 (lô LO-TP-AHTOR-049)<br>BCTP-KHACHHANG-50 (lô LO-TP-AHTOR-049)<br>BCTP-KHACHHANG-51 (lô LO-TP-AHTOR-049)<br>BCTP-KHACHHANG-52 (lô LO-TP-AHTOR-050)<br>BCTP-KHACHHANG-53 (lô LO-TP-AHTOR-050)<br>BCTP-KHACHHANG-54 (lô LO-TP-AHTOR-050) |
| UC-13 | Lập đợt kiểm kê nguyên vật liệu | director | Lập đợt kiểm kê | Hai đơn mua đã có lô; kế hoạch mua chưa về hàng (lập trước theo dự kiến). | DM-NGUYENLIEUTAMANH-20<br>DM-NGUYENLIEUTAMANH-21<br>KHMUA-NOIBO-38 |
| UC-14 | Xem/Quản lý đơn hàng mua | purchaser | Đơn mua hàng | Đơn chưa nhận, đơn nhận một phần và các đơn đã nhận đủ (tồn kho đầu kỳ). | DM-NGUYENLIEUTAMANH-35<br>DM-NGUYENLIEUTAMANH-36<br>DM-NGUYENLIEUTAMANH-34 |
| UC-15 | Thực hiện kiểm kê | stocktaker | Quản lý kiểm kê | Đợt đang mở, chưa nhập số đếm. | [UC-15] Đợt chờ đếm 1 (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-054)<br>[UC-15] Đợt chờ đếm 2 (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-055)<br>[UC-15] Đợt đếm và QC cùng làm (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-056) |
| UC-15 / 16 / 17 / 28 | Kiểm đếm tồn cả kho (kho riêng KHO-KD-1 … KHO-KD-7) | director, stocktaker, qc, manager, workshop | Lập đợt kiểm kê, Quản lý kiểm kê, Biên bản kiểm kê, Xử lý ngoại lệ | Lần lượt: chưa bắt đầu, đang đếm, đếm xong chờ biên bản, có chênh lệch chưa xử lý, đề xuất chờ duyệt, đề xuất đã duyệt chờ thực hiện, đã đóng. | DOT-KIEM-KE-2027-03-05-001<br>DOT-KIEM-KE-2027-03-05-002<br>DOT-KIEM-KE-2027-03-05-003<br>DOT-KIEM-KE-2027-03-05-004<br>DOT-KIEM-KE-2027-03-05-005<br>DOT-KIEM-KE-2027-03-05-006<br>DOT-KIEM-KE-2027-03-05-007 |
| UC-16 | Xử lý chênh lệch kiểm kê | manager | Xử lý ngoại lệ | Ngoại lệ chờ quản lý xử lý: tự xử lý hoặc gửi chủ xưởng duyệt. | NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-062<br>NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-063<br>NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-064 |
| UC-16 | Thực hiện phương án đã có ý kiến chủ xưởng | manager | Xử lý ngoại lệ | Một ngoại lệ đã được duyệt, một bị từ chối kèm hướng xử lý của chủ xưởng. | NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-068<br>NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-069 |
| UC-16 | Lập đề xuất xử lý hàng QC lỗi | manager | Xử lý ngoại lệ | Tạo mới, chọn kết quả QC có hàng lỗi chưa lập đề xuất. | QC-TP-KHU-KIEM-TRA-LO-HANG-065 (lô TP-AHTOR-BANH-QUY-BO-075)<br>QC-TP-KHU-KIEM-TRA-LO-HANG-066 (lô TP-AHTOR-BANH-QUY-BO-076) |
| UC-17 | Phê duyệt đề xuất xử lý ngoại lệ | workshop | Xử lý ngoại lệ | Đề xuất từ biên bản, đang chờ chủ xưởng duyệt hoặc từ chối. | NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-065<br>NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-066<br>NL-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-067 |
| UC-17 | Phê duyệt đề xuất hàng QC lỗi | workshop | Xử lý ngoại lệ | Đề xuất tiêu hủy hàng lỗi đang chờ duyệt. | DX-HANG-LOI-BANH-VO-BAO-BI-RACH-001<br>DX-HANG-LOI-BANH-VO-BAO-BI-RACH-002<br>DX-HANG-LOI-BANH-VO-BAO-BI-RACH-003 |
| UC-18 | Xem danh sách hàng tồn kho | director, workshop, manager | Báo cáo tồn kho | Có nguyên vật liệu, thành phẩm, hàng cách ly, nhiều lô với hạn dùng khác nhau. | Toàn bộ tồn kho |
| UC-19 | Xem hồ sơ xuất kho | director, workshop | Phiếu nhập / xuất | Lọc theo thời gian (phiếu rải trong 1 tháng), xuất CSV. | Các phiếu xuất |
| UC-20 | Xem hồ sơ nhập kho | director, workshop | Phiếu nhập / xuất | Lọc theo thời gian (phiếu rải trong 1 tháng), xuất CSV. | Các phiếu nhập |
| UC-21 | Xem báo cáo kiểm kê | director | Báo cáo kiểm kê | Đợt đã đếm, đã có biên bản, đủ số và thiếu số; lọc theo thời gian, xuất CSV. | Toàn bộ đợt trong báo cáo |
| UC-22 | Tra cứu dữ liệu trong kho | manager, workshop | Tra cứu kho | Tra theo mặt hàng, lô, vị trí. | Toàn bộ kho |
| UC-23 | Yêu cầu nhập nguyên vật liệu | workshop | Yêu cầu nhập / xuất | Tạo mới → Nhập nguyên vật liệu, chọn đơn mua trực tiếp. | DM-NGUYENLIEUTAMANH-08<br>DM-NGUYENLIEUTAMANH-09<br>DM-NGUYENLIEUTAMANH-10 |
| UC-23 | Yêu cầu nhập thành phẩm | workshop | Yêu cầu nhập / xuất | Tạo mới → Nhập thành phẩm, chọn báo cáo thành phẩm. | BCTP-KHACHHANG-07<br>BCTP-KHACHHANG-08<br>BCTP-KHACHHANG-09 |
| UC-23 | Yêu cầu xuất nguyên vật liệu | workshop | Yêu cầu nhập / xuất | Tạo mới → Xuất nguyên vật liệu, chọn KHSX. | KHSX-KHACHHANG-10<br>KHSX-KHACHHANG-11<br>KHSX-KHACHHANG-12 |
| UC-23 | Yêu cầu xuất thành phẩm | workshop | Yêu cầu nhập / xuất | Tạo mới → Xuất thành phẩm, chọn KHSX có kế hoạch bán đã duyệt (đã tới ngày giao). | KHSX-KHACHHANG-13<br>KHSX-KHACHHANG-14<br>KHSX-KHACHHANG-15 |
| UC-24 | Quản lý yêu cầu nhập xuất | workshop | Yêu cầu nhập / xuất | Xem, lọc theo trạng thái. Bên cạnh là yêu cầu đã hủy và yêu cầu xử lý một phần; chờ xử lý và đã xử lý đủ thì có sẵn rất nhiều. | YC-NHAP-NVL-AHTOR-003<br>YC-XUAT-NVL-AHTOR-001 |
| UC-24.1 | Sửa yêu cầu | workshop | Yêu cầu nhập / xuất | Yêu cầu chờ xử lý, kho chưa phân công. | YC-NHAP-NVL-AHTOR-004<br>YC-NHAP-TP-AHTOR-010<br>YC-XUAT-NVL-AHTOR-002<br>YC-XUAT-TP-AHTOR-007 |
| UC-24.2 | Xóa yêu cầu | workshop | Yêu cầu nhập / xuất | Yêu cầu chờ xử lý, kho chưa phân công. | YC-NHAP-NVL-AHTOR-005<br>YC-NHAP-TP-AHTOR-012<br>YC-XUAT-NVL-AHTOR-003<br>YC-XUAT-TP-AHTOR-008 |
| UC-25 | Quản lý công việc | director | Quản lý công việc | Xem danh sách, lọc theo trạng thái, mở chi tiết. | Toàn bộ công việc trong danh sách |
| UC-25.1 | Chỉnh sửa công việc | director | Quản lý công việc | Giờ bắt đầu còn hơn 3 tháng nữa nên luôn sửa được. | [UC-25.1] Công việc để sửa 1<br>[UC-25.1] Công việc để sửa 2<br>[UC-25.1] Đợt kiểm tra để sửa (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-046) |
| UC-25.2 | Xóa công việc | director | Quản lý công việc | Ba việc đầu xóa được; việc cuối đang thực hiện nên hệ thống không cho xóa. | [UC-25.2] Công việc để xóa 1<br>[UC-25.2] Công việc để xóa 2<br>[UC-25.2] Đợt kiểm tra để xóa (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-047)<br>[UC-25.2] Đang thực hiện, không xóa được |
| UC-27 | Mua hàng | purchaser | Đơn mua hàng | Tạo mới, chọn kế hoạch mua đã duyệt; hoặc lập trực tiếp không cần kế hoạch. | KHMUA-NOIBO-40<br>KHMUA-NOIBO-41<br>KHMUA-NOIBO-42 |
| UC-28 | Lập biên bản kiểm kê | stocktaker | Biên bản kiểm kê | Tạo mới, chọn đợt đã hoàn thành được giao lập biên bản. | [UC-28] Đợt đủ số, chờ lập biên bản (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-057)<br>[UC-28] Đợt thiếu hàng, chờ lập biên bản (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-058)<br>[UC-28] Đợt có hàng lỗi, chờ lập biên bản (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-059) |
| UC-28 | Biên bản đang lưu tạm | stocktaker | Biên bản kiểm kê | Sửa hoặc gửi biên bản nháp. | BB-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-060 |
| UC-28 | Đợt chưa hoàn thành | stocktaker | Biên bản kiểm kê | Đợt còn chưa đếm xong nên chưa lập được biên bản. | [UC-28] Đợt chưa hoàn thành (DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-061) |
| UC-29 | Tiếp nhận đơn hàng | planner | Đơn hàng | Mở đơn Chờ tiếp nhận rồi bấm Tiếp nhận. Đơn cuối có nhiều mặt hàng. | DH-KHACHHANG-109<br>DH-KHACHHANG-110<br>DH-KHACHHANG-111 |
| UC-31 | Phê duyệt kế hoạch sản xuất | director | Kế hoạch sản xuất | Duyệt hoặc từ chối KHSX đang nháp. | KHSX-KHACHHANG-63<br>KHSX-KHACHHANG-64<br>KHSX-KHACHHANG-65 |
| UC-32 | Phê duyệt kế hoạch mua | director | Kế hoạch mua / bán | Duyệt hoặc từ chối (phải nhập lý do). | KHMUA-NOIBO-35<br>KHMUA-NOIBO-36<br>KHMUA-NOIBO-37 |
| UC-32 | Phê duyệt kế hoạch bán | director | Kế hoạch mua / bán | Duyệt hoặc từ chối (phải nhập lý do). | KHBAN-KHACHHANG-30<br>KHBAN-KHACHHANG-31<br>KHBAN-KHACHHANG-32 |
| UC-34 | Lập phiếu báo cáo sản xuất | workshop | Báo cáo sản xuất | Tạo mới, chọn KHSX đã duyệt chưa có báo cáo. | KHSX-KHACHHANG-69<br>KHSX-KHACHHANG-70<br>KHSX-KHACHHANG-71 |
| UC-34 | Báo cáo sản xuất đang nháp | workshop | Báo cáo sản xuất | Sửa hoặc gửi báo cáo nháp. | BCSX-KHACHHANG-04 |
| UC-35 | Báo cáo thành phẩm | workshop | Báo cáo thành phẩm | Tạo mới, chọn KHSX đã được cấp nguyên vật liệu. | KHSX-KHACHHANG-73<br>KHSX-KHACHHANG-74<br>KHSX-KHACHHANG-75 |
| UC-35 | Báo cáo thành phẩm đang nháp | workshop | Báo cáo thành phẩm | Sửa hoặc gửi báo cáo nháp. | BCTP-KHACHHANG-46 |
| Tài khoản | Quản lý tài khoản | admin | Quản lý tài khoản | Sửa, khóa, xóa các tài khoản thử. | thu01<br>thu02<br>thu03 |
| Hàng khách trả | Lập phiếu hàng trả | manager | Hàng khách trả | Tạo mới, chọn phiếu đã giao. | PHIEU-XUAT-AHTOR-008<br>PHIEU-XUAT-AHTOR-009<br>PHIEU-XUAT-AHTOR-010 |
| Hàng khách trả | Nhận hàng trả / hủy phiếu | staff (nhận), manager (hủy) | Hàng khách trả | Phiếu trả chờ nhân viên kho nhận. | LO-TRA-KH-KHACH-HANG-001<br>LO-TRA-KH-KHACH-HANG-002<br>LO-TRA-KH-KHACH-HANG-003 |
| Hàng khách trả | QC hàng trả | qc | Kiểm tra QA / QC | Hàng trả đã nhận vào khu cách ly, đợt kiểm tra đang mở. | LO-TRA-KH-KHACH-HANG-004 (DOT-KIEM-TP-KHU-CACH-LY-HANG-TRA-001)<br>LO-TRA-KH-KHACH-HANG-005 (DOT-KIEM-TP-KHU-CACH-LY-HANG-TRA-002) |
| Hàng khách trả | Xử lý hàng cách ly | manager lập, workshop duyệt | Xử lý ngoại lệ | Tạo mới → Xử lý hàng cách ly: phần đạt giải phóng, phần lỗi tiêu hủy. | TP-TRA-BANH-QUY-BO-004 · Bánh quy bơ<br>TP-TRA-BANH-QUY-BO-003 · Bánh quy bơ |
| Hàng đã nhập | Điều chỉnh QC hàng đã nhập | manager lập, workshop duyệt, qc tái kiểm | Xử lý ngoại lệ | Tạo mới → Điều chỉnh QC hàng đã nhập, chọn lô đang tồn. | Mọi lô còn tồn khả dụng |
| Kế hoạch bù | Lập kế hoạch bù từ biên bản thiếu hàng | planner | Kế hoạch sản xuất | Tạo mới, nguồn lập kế hoạch chọn biên bản thiếu hàng. | BB-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-062<br>BB-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-063<br>BB-DOT-KIEM-TP-KHU-KIEM-TRA-LO-HANG-064 |
