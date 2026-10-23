# Kịch bản nhập liệu kiểm thử QC/AC và Ban kiểm kê

> Đính chính điểm tạo 22/10/2026: tạo đợt tại **Lập đợt kiểm kê**, không tạo tại Công việc và không chọn loại đợt. Chọn nhân viên để suy nội dung số lượng/chất lượng. Quản lý công việc dùng để xem/sửa/hủy và thực hiện. Quy tắc cập nhật tại [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md); các bước cũ ghi “Công việc → Tạo mới” bên dưới phải áp dụng điểm tạo mới này.

Ngày soạn: 22/10/2026. Đây là kịch bản để tự nghiệm thu bằng trình duyệt, không phải khẳng định mọi UC đã được chấm đạt. Mã phiếu, mã lô tổng và mã đợt do hệ thống sinh; ghi lại mã thực tế sau mỗi bước, không nhập cứng ID trong tài liệu.

## Kịch bản nhập liệu hiện hành

**D** là ngày thực sự test; D+7 là sau bảy ngày. Tất cả tài khoản mẫu mặc định mật khẩu `123456`: director, workshop, planner, purchaser, manager, staff, qc/qc2/qc3, stocktaker/stocktaker2/stocktaker3, customer. Dùng giá trị đã đổi nếu môi trường có mật khẩu riêng. Không cần xóa dữ liệu đang có; ghi chú `TEST-QC-KK-02` để nhận diện.

### A. Công việc kiểm tra NVL

1. `planner`: tạo MUA bằng **Lập kế hoạch trực tiếp**; ngày mong nhận **D**, mặt hàng NVL-001 Bột mì, lượng **10 kg**, giá **25000**, ghi chú TEST-QC-KK-02. `director` duyệt.
2. `director`: Công việc → Tạo mới → **Kiểm tra nguyên vật liệu** → chọn **NVL dự kiến · mã MUA vừa duyệt**. Ngày bắt đầu tự lấy D, chọn giờ trống; QC/AC chọn qc và qc2, có thể thêm người Ban kiểm kê để phối hợp. Lưu ngay tại Công việc. Chưa có hàng thì chưa bắt đầu được.
3. `purchaser`: lập đơn mua theo MUA này, chọn NCC cho dòng bột mì, giá 25000; ngày nhận tự lấy D. `manager` ghi nhận lô NVL `TEST-NVL-QC-02`, lượng **10**, ngày sản xuất D, hạn dùng D+30.
4. `director` mở công việc đã tạo → **Chọn lô NVL đã nhận**, chọn dòng lô đúng MUA → lưu → **Bắt đầu kiểm tra**. Nếu tạo công việc sau khi hàng về, có thể chọn ngay lô thực tế ở dropdown lô NVL.
5. `qc` mở Công việc được giao → **Ghi kết quả kiểm tra**. Thử kiểm 10/đạt 9/lỗi 2: phải chặn. Thử kiểm 10/đạt 9/lỗi 1 nhưng thiếu mô tả: chặn. Lưu hợp lệ **kiểm 10, đạt 9, lỗi 1**, mô tả “Bao rách, bột vón cục”.
6. Công việc hoàn tất sau đủ dòng được chọn có QC. Phần lỗi 1 kg ghi trả NCC, chưa vào AVAILABLE. `workshop` yêu cầu nhập đúng lượng đạt **9**; manager phân công, staff ghi phiếu nhập. Tồn riêng dòng này **9 kg**, không phải 10.
7. qc3 không được giao không được xem/ghi ngoài phạm vi. qc2 được xem nhưng không ghi lần hai cho cùng dòng. Ban kiểm kê được xem công việc phối hợp, không được ghi QC thay vai trò QC/AC.

Nhánh ngày tương lai: tạo MUA riêng ngày D+1, duyệt và chọn trong Công việc; ngày bắt đầu phải tự lấy D+1, không nhận D. Không dùng ngày sản xuất của bột hoặc ngày tạo bản ghi để thay ngày nhận kế hoạch.

### B. Báo cáo thành phẩm tạo hai phần cùng lô

1. `customer` đặt **100 hộp TP-DEMO-01**, ngày giao **D+7**, ghi chú TEST-QC-KK-02. `planner` tiếp nhận, lập KHSX toàn bộ đơn, xưởng hiện có, ngày bắt đầu D/kết thúc D+5. `director` duyệt KHSX.
2. `workshop` → Báo cáo thành phẩm → Tạo mới → chọn KHSX. Ngày hoàn thành phần này **D**; dòng TP-DEMO-01 lượng **40**, giữ/sửa mã phần riêng, ngày sản xuất D, hạn dùng D+30; ghi chú **Phần 1**. **Không tích đợt cuối**. Lưu rồi gửi.
3. Ghi lại mã **BCTP phần 1** và mã **lô tổng TP-SX-...**. KHSX còn IN_PROGRESS. Ghi báo cáo chưa tự nhập 40 vào tồn. Có thể lập UC-34 tiến độ 40%, nhưng UC-34 không tạo phần mới.
4. `workshop` lập báo cáo thành phẩm khác cùng KHSX: lượng **60**, ngày D, ghi chú **Phần 2**; tích **Đây là đợt cuối...** nếu thực tế đã xong. Lưu/gửi. Hai báo cáo chung lô tổng nhưng dòng/mã phần riêng; KHSX chuyển COMPLETED khi gửi phần cuối. **Không nhập 100 ở phần 2.** Thử phần 2 bằng 61 khi đã báo 40: bị chặn vượt kế hoạch.
5. `director` → Công việc → Tạo mới → **Kiểm tra thành phẩm** → dropdown chọn lô tổng trên. Phải hiện **BCTP phần 1: 40** và **BCTP phần 2: 60**. Báo cáo còn nháp không hiện như phần được giao kiểm tra. Tích **chỉ phần 1**.
6. Chọn qc2 ở nhóm QC/AC; có thể chọn stocktaker2 phối hợp. Chọn giờ không trùng công việc đã giao, lưu ngay tại Công việc. Mở chi tiết, kiểm chỉ có dòng thuộc phần 1; director **Bắt đầu kiểm tra**.
7. `qc2` mở công việc → ghi kiểm **40**, đạt **40**, lỗi **0**. Công việc này hoàn tất, **không** bắt QC phần 2. Không dùng 100 làm lượng kiểm phần 1.
8. Director tạo công việc khác, cùng lô tổng nhưng chỉ chọn **BCTP phần 2** → giao qc → bắt đầu. qc ghi kiểm **60**, đạt **55**, lỗi **5**, mô tả “Mép bao bì hở”. Kết quả phần 1 không đổi; phần lỗi theo ngoại lệ, chưa nhập khả dụng.
9. `workshop` lập yêu cầu nhập **từ báo cáo thành phẩm phần 1**, lượng **40**; manager chọn đúng dòng phần 1, phân công staff, staff ghi phiếu nhập. Làm tương tự phần 2 lượng đạt **55**. Không tạo lại đợt nhập tay 40/60 theo KHSX vì báo cáo đã tạo các phần này.
10. Tồn lô tổng **95 hộp AVAILABLE**, riêng phần 1 = 40, phần 2 = 55. Chỉ lập báo cáo/ghi QC không tự cộng tồn. Lặp yêu cầu/phiếu không được nhập trùng. Sau hoàn tất SX, các kế hoạch BAN có thể lấy nguồn từng báo cáo phần; xuất vẫn cần đúng ngày giao, QC và tồn khả dụng.

Nếu muốn thử QC trước ngày giao cuối, thực hiện bước 5–9 ngay trong D. Ngày của phần lấy ngày hoàn thành ghi trên BCTP (D), không bắt đợi D+7 của đơn. Kiểm kê số lượng thực hiện sau khi phiếu nhập đã ghi sổ.

### C1. Chọn nhân viên, sửa và hủy công việc

- Trong form Công việc loại thành phẩm/NVL, chọn hai người Ban kiểm kê và hai người QC/AC qua hồ sơ. Xác nhận: tên hiện dưới đúng nhóm; bỏ người rồi Hủy: tên không đổi; xác nhận lại: danh sách cập nhật.
- Lưu công việc chưa bắt đầu, mở Sửa: giữ đủ người, lô/phần không tự đổi. Sửa thời gian phải cập nhật cùng lịch QC. Tạo công việc trùng giờ cùng người đang được giao phải bị chặn.
- Hủy công việc chưa bắt đầu: lịch liên quan bị hủy, phần lô được chọn lại cho công việc khác; không thay tồn. Sau bắt đầu không sửa/hủy theo đường này. Không có nút “hoàn thành” thủ công để bỏ qua QC.
- Chuẩn bị một đợt kiểm kê COUNT riêng để kiểm đếm kho: công việc kiểm tra chất lượng không tự sinh bảng đếm hoặc khóa kho.


### C2. Lập và bắt đầu kiểm kê

1. Sau khi nhập kho ở A4/B4, ghi lại tồn từng **dòng lô + vị trí + chất lượng**. Nếu cùng mặt hàng ở nhiều vị trí thì không cộng nhầm thành một dòng.
2. `director` → Đợt kiểm kê/QC → Tạo mới → **Kiểm kê số lượng**, ngày D, giờ 13:00–14:00, kho thành phẩm bộ B; chọn loại thành phẩm.
3. Chọn `stocktaker`, `stocktaker2` và `qc2` làm người đếm; nếu cần chọn `qc` làm người kết luận theo trường riêng. `stocktaker3` và `qc3` để ngoài phân công.
4. Lưu rồi **Bắt đầu kiểm kê**. Sau đó mới mở bảng đếm.

**Mong đợi:** kho này bị khóa nhập/xuất trong thời gian kiểm kê; kho khác không bị khóa theo. Lịch QC QUALITY_CHECK không tự khóa tồn kho như COUNT.

### C3. Nhập số đếm, lưu và hoàn tất

`stocktaker` mở đợt được giao → Mở bảng đếm kho. Với bộ B chưa có biến động khác:

| Dòng | Tồn hệ thống dự kiến | Lần nhập thử | Kết quả |
| --- | ---: | ---: | --- |
| Đợt 1 / AVAILABLE / vị trí nhập | 40 | 40 | Khớp |
| Đợt 2 / AVAILABLE / vị trí nhập | 55 | Để trống | Chưa đếm; không được hoàn tất |
| Đợt 2 / AVAILABLE / vị trí nhập | 55 | 53 | Thiếu 2; lưu được nhưng chưa tự điều chỉnh tồn |

Lưu; `stocktaker2` hoặc `qc2` được giao mở lại thấy số mới. Nếu giữ một tab cũ rồi lưu tiếp, phải báo dữ liệu đã đổi, không ghi đè âm thầm. Nhập đủ mọi dòng thực tế trong kho rồi hoàn tất kho.

Nhánh số 0: trong một đợt riêng, đếm một dòng hiện có thành **0**, lưu rồi tải lại. Số 0 phải là “đã đếm”, khác với để trống; chênh lệch vẫn cần xử lý. Không chạy nhánh này cùng bộ thiếu 2 nếu muốn giữ kết quả số học dễ đối chiếu.

### C4. Lập biên bản và xử lý thiếu 2

1. Người được giao kết luận/đếm (`qc` nếu có phân công kết luận riêng, hoặc người đếm đúng phạm vi) lập biên bản: “Đợt 1 đủ 40, đợt 2 thực đếm 53, thiếu 2 hộp; đề nghị xác minh”. Gửi biên bản.
2. `manager` mở chênh lệch → chọn dòng đợt 2, lý do `Thiếu 2 hộp khi kiểm kê`, ghi chú xử lý; tạo đề xuất điều chỉnh.
3. Thử thực hiện ngay khi chưa duyệt: phải bị chặn, tồn vẫn **40 + 55 = 95**.
4. `director` duyệt đề xuất. **Chỉ duyệt** thì tồn vẫn 95.
5. `manager` thực hiện đề xuất đã duyệt: đợt 2 còn **53**, tổng thành phẩm bộ B còn **93**. Thực hiện lại không trừ thêm 2 lần nữa.
6. `director` đóng đợt sau khi tất cả kho hoàn tất, biên bản đã gửi và mọi chênh lệch đã giải quyết. Sau đóng có thể tiếp tục nhập/xuất kho.
7. Xem báo cáo kiểm kê/tồn kho: lọc đúng đợt, kho và lô; báo cáo phải thể hiện hệ thống 55, thực đếm 53, thiếu 2, quyết định và người thực hiện. File xuất nếu có phải khớp bộ lọc.

## 5. Danh sách kiểm tra đầy đủ theo chức năng

Đánh dấu **Đạt / Lỗi / Chưa thử**, ghi mã phiếu và ảnh màn hình. Không đánh dấu Đạt chỉ vì thấy nút hoặc xem được danh sách.

| Mã | Chức năng cần kiểm | Kết quả cần chứng minh |
| --- | --- | --- |
| QC-01 | Lịch từ MUA đã duyệt, hàng chưa về | Đúng ngày nhận, không sinh tồn/lô giả |
| QC-02 | Lịch từ KHSX | Đúng ngày giao thành phẩm, loại hàng đúng |
| QC-03 | Chọn đợt TP hiện có | Phân biệt từng đợt cùng lô tổng |
| QC-04 | Gắn hàng vào lịch dự kiến | Đúng nguồn, phiên bản và phần hàng; sai nguồn bị chặn |
| QC-05 | Lịch chưa có hàng | Chưa bắt đầu/ghi QC được |
| QC-06 | Nhân viên/lịch ngoài phân công | Không đọc hoặc ghi ngoài quyền |
| QC-07 | Kiểm toàn dòng và đạt+lỗi | Chặn sai tổng, âm, thiếu mô tả |
| QC-08 | Ghi QC đúng một lần | Không hai kết quả hiệu lực cho cùng dòng |
| QC-09 | NVL đạt/lỗi | Chỉ đạt nhập AVAILABLE; lỗi ghi trả NCC |
| QC-10 | TP đạt/lỗi | Chỉ đạt nhập AVAILABLE; lỗi theo ngoại lệ |
| QC-11 | Danh sách, chi tiết, lọc QC | Đúng dòng, người kiểm, mã đợt và kết quả |
| QC-12 | Bù QC trước khi dùng | Đúng tác giả, lý do, phiên bản, lịch sử bù |
| QC-13 | Sửa/xóa hoặc bù khi đã dùng | Chặn sửa đè; đi theo ngoại lệ/chứng từ bù |
| QC-14 | Tái kiểm/xác minh ngoại lệ | Chỉ người có quyền, đủ bước mới được xử lý |
| QC-15 | QC hàng khách trả | Sau nhận cách ly, chọn đúng dòng trả; không tự sửa lịch sử giao |
| KK-01 | Chọn nhiều người hai bộ phận | Profile, xác nhận/hủy, tên theo nhóm, giữ khi sửa |
| KK-02 | Công việc chung | Tạo/sửa/xóa đúng trạng thái; chặn trùng giờ; tiến độ đúng người |
| KK-03 | Lập COUNT | Kho, mặt hàng, người đếm/kết luận đúng |
| KK-04 | Bắt đầu COUNT | Khóa đúng kho, chụp tồn hệ thống |
| KK-05 | Phạm vi người kiểm kê | Người ngoài không có bảng đếm/không lưu được |
| KK-06 | Số đếm và phiên bản | Phân biệt null với 0; không ghi đè tab cũ |
| KK-07 | Hoàn tất kho | Thiếu dòng chưa đếm thì chặn |
| KK-08 | Biên bản | Chỉ đúng phân công; hoàn tất đếm trước gửi kết luận |
| KK-09 | Đề xuất chênh lệch | Chưa duyệt không thực hiện; từ chối không đổi tồn |
| KK-10 | Duyệt và thực hiện riêng | Duyệt chưa đổi tồn; manager thực hiện đúng một lần |
| KK-11 | Đóng đợt | Còn chênh lệch chưa xử lý thì chặn; đóng xong mở kho |
| KK-12 | Báo cáo, lịch sử và xuất file | Đúng bộ lọc, số trước/sau, lý do, người thao tác |

QC-15 là nhánh mở rộng: cần giao hàng cho khách trước, tạo trả theo dòng phiếu giao gốc, nhận vào khu cách ly rồi mới lập QC cho dòng hàng trả. Không dùng một dòng thành phẩm đang nằm kho bình thường để giả lập “khách trả”. Quy trình ngoại lệ chi tiết và các điểm chưa nghiệm thu đối chiếu [USE_CASES.md](USE_CASES.md), [TEST_CASES.md](TEST_CASES.md), [PHIEU_CHAM.md](PHIEU_CHAM.md).

## 6. Bảng ghi kết quả khi tự test

| Mã kiểm | Tài khoản | Mã lịch/phiếu/đợt | Dữ liệu nhập | Kết quả thực tế | Đạt/Lỗi/Chưa thử |
| --- | --- | --- | --- | --- | --- |
| QC-01 | director | | | | |
| QC-03 | director/qc2 | | | | |
| QC-07 | qc | | | | |
| QC-10 | workshop/manager/staff | | | | |
| KK-06 | stocktaker/qc2 | | | | |
| KK-10 | director/manager | | | | |

Nếu lỗi, gửi mã bước, tài khoản, mã lịch/đợt, dữ liệu và mã hỗ trợ hiển thị. Nếu dữ liệu đã từng xuất/điều chỉnh thì tính theo tồn thực tế hiện tại, không mặc định vẫn là 40/55/95 như bộ dữ liệu mới.

## 7. Dữ liệu cụ thể cho các nhánh QC mở rộng

Các nhánh dưới đây độc lập, không thực hiện xen giữa C2 và C4 khi kho đang kiểm kê. Ghi kết quả vào QC-12 đến QC-15; nếu chưa chuẩn bị đủ chứng từ gốc thì đánh dấu Chưa thử.

### E1. Bù QC trước khi hàng được sử dụng

Tạo một đơn/KHSX độc lập **5 hộp TP-DEMO-01**, ngày giao D+7; chủ xưởng lập/gửi báo cáo thành phẩm phần **5**, ngày D. Director chọn riêng đợt này, giao `qc2`; qc2 ghi **kiểm 5, đạt 5, lỗi 0**. Chưa phân công kho, chưa nhập và chưa lập ngoại lệ.

`qc2` mở kết quả → **Chứng từ bù QC**: chọn đúng đợt, **đạt 4, lỗi 1**, mô tả “Phát hiện một hộp hở mép bao bì”, lý do “Bổ sung kết luận sau rà soát, hàng chưa nhập”. Mong đợi có lịch sử bù, tổng kiểm vẫn 5, lượng hợp lệ để nhập là 4. Không tự đổi tồn vì chưa có phiếu nhập.

Thử đạt 4/lỗi 2 phải bị chặn. Đăng nhập `qc` để bù kết quả của qc2 phải bị chặn. Sau phân công/nhập thì bù trực tiếp phải bị chặn. Chỉ ghi thêm bù nếu nội dung thực sự cần sửa; không cố làm mới trang để ghi đè bản cũ.

### E2. Điều chỉnh QC sau nhập, tái kiểm, cách ly và giải phóng

Làm **sau C4**, với giả định bộ B đang còn đợt 1 = 40, đợt 2 = 53, tổng AVAILABLE = **93** và không có phân bổ đang giữ chỗ.

1. `manager` → Đề xuất ngoại lệ → loại **Điều chỉnh QC hàng đã nhập** (`STOCK_QC_CORRECTION`), chọn dòng QC gốc của **đợt 1** và vị trí đang có hàng. Hành động **Cách ly**, lượng **3**, lý do “Phát hiện bao bì hở sau nhập”, ghi chú “Tái kiểm ba hộp”.
2. `director` duyệt. `manager` thực hiện ngay trước xác minh QC phải bị chặn; lượng chưa đổi.
3. `qc` thực hiện **Tái kiểm/xác minh** trên đề xuất đã duyệt: **Không đạt**, ghi chú “Xác nhận ba hộp cần cách ly”. Sau đó `manager` thực hiện.
4. Mong đợi AVAILABLE tổng **90**, QUARANTINE **3**. Lịch sử QC và phiếu nhập gốc không bị sửa/xóa. Lặp thực hiện không chuyển thêm 3 hộp.
5. `manager` lập đề xuất **Xử lý hàng cách ly** (`QUARANTINE_DISPOSITION`), đúng dòng/vị trí, hành động **Giải phóng phần đạt**, lượng **1**, lý do “Một hộp đạt sau kiểm tra lại”. Director duyệt; QC xác minh **Đạt**; manager thực hiện. AVAILABLE tổng **91**, QUARANTINE **2**.
6. Manager lập đề xuất khác, hành động **Loại bỏ phần lỗi**, lượng **2**, lý do “Hai hộp không bảo đảm chất lượng”; director duyệt rồi manager thực hiện theo điều kiện form. QUARANTINE còn **0**, AVAILABLE vẫn **91**.

Thử lấy lượng lớn hơn số còn lại, sai vị trí, thực hiện trước duyệt hoặc không có xác minh bắt buộc: đều phải chặn. Thử một đề xuất độc lập bị director từ chối: không đổi tồn. Không làm E2 trước C nếu vẫn muốn kiểm số 95 → 93 trong bộ C.

### E3. QC hàng khách trả

Chuẩn bị **đơn/KHSX riêng 5 hộp** có ngày giao **D**, bắt đầu/kết thúc sản xuất D để giao và trả trong cùng buổi. Nếu bạn chọn ngày giao tương lai thì đợi đến ngày đó để kiểm giao; không sửa ngày hệ thống để vượt ràng buộc.

1. Lập/gửi báo cáo thành phẩm phần 5 hộp, QC đạt **5/5**, nhập kho 5, xác nhận phần cuối đã hoàn tất KHSX. Planner lập kế hoạch BAN từ báo cáo; director duyệt; chủ xưởng yêu cầu xuất, quản lý phân công, staff giao **5 hộp** theo đúng dòng đơn và lô, ghi phiếu xuất.
2. `manager` mở hàng khách trả, chọn **dòng phiếu giao gốc** vừa ghi, lượng trả **2**, lý do “Bao bì bị móp”. Phân công nhận trả theo form; người được giao nhận vào **khu cách ly**, không nhập AVAILABLE.
3. Director lập QC nguồn **Lô / đợt hàng đã ghi nhận**, loại thành phẩm, chọn **dòng hàng trả mới**, không chọn dòng giao gốc; giao `qc`.
4. QC ghi **kiểm 2, đạt 1, lỗi 1**, mô tả “Một hộp bao bì hỏng”. Giữ hàng ở cách ly đến khi có phương án xử lý được duyệt; không tự đổi trạng thái giao đơn hay tự giao bù/hoàn tiền.
5. Manager lập phương án giải phóng 1 phần đạt và loại bỏ 1 phần lỗi, director duyệt; QC xác minh khi yêu cầu, manager thực hiện. Đối chiếu tồn theo chứng từ xử lý thực tế.

Thử trả **6** khi mới giao 5, trả lại vượt lượng còn được trả, nhận cách ly hai lần hoặc ghi QC lại cùng dòng trả: phải chặn. Thử hủy yêu cầu trả chưa nhận thì không tạo tồn; sau đã nhận không cho xóa lịch sử nhập trả bằng đường hủy đơn giản.
