# Công việc kiểm tra lô và báo cáo thành phẩm từng phần

Quy tắc hiện hành theo đính chính của chủ dự án ngày 22/10/2026. Tài liệu này thay hướng trước đó dùng báo cáo tiến độ làm phần lô hoặc yêu cầu người dùng chuyển sang một màn hình khác để tạo công việc kiểm tra.

## Luồng tạo phần thành phẩm

**Báo cáo thành phẩm → một phần của lô tổng → Công việc chọn phần → QC → Yêu cầu nhập phần đạt → Phiếu nhập → Tồn kho.**

Một KHSX dùng chung đầu lô `TP-SX-<mã kế hoạch>`. Chủ xưởng lập nhiều báo cáo thành phẩm; mỗi báo cáo gồm sản lượng thực tế của phần đó. Các dòng sản phẩm của báo cáo tạo ChiTietLo riêng nhưng cùng LoHang với những báo cáo trước thuộc KHSX này. Chỉ báo cáo đã gửi và phần chưa được giao kiểm tra/mới kiểm xong mới quyết định việc xuất hiện trong danh sách; phần đã QC không được phân công QC lần đầu lại.

UC-34 tiến độ/sự cố/nhu cầu vẫn hoạt động độc lập. **Báo cáo tiến độ không tạo phần lô**, không suy lượng bánh từ phần trăm tiến độ. Không tự liên kết các báo cáo cũ với đợt hàng bằng phỏng đoán.

## Form Lập đợt kiểm kê

Ban giám đốc vào **Lập đợt kiểm kê → Tạo mới**. Không chọn loại đợt kiểm đếm/QC. Chỉ chọn nhóm hàng để xác định nguồn lô:

1. **Thành phẩm**: chọn lô → chọn các phần theo báo cáo thành phẩm đã gửi → chọn nhân viên → lưu đợt và công việc liên kết trong cùng giao dịch.
2. **Nguyên vật liệu**: chọn lô thực tế hoặc nguồn dự kiến theo kế hoạch MUA đã duyệt → chọn nhân viên → lưu. Không có danh sách phần theo báo cáo thành phẩm ở nhóm này.

Chọn nhân viên QC/AC thì đợt kiểm chất lượng; chọn Ban kiểm kê thì kiểm số lượng; chọn cả hai thì thực hiện cả hai. Quy tắc do backend suy ra từ vai trò nhân viên được chọn, không nhập cờ loại đợt từ trình duyệt. Có mô tả để nêu yêu cầu cụ thể. Sửa nhân viên khi chưa bắt đầu sẽ cập nhật nội dung kiểm tra tương ứng.

**Quản lý công việc không có nút Tạo mới.** Đây là nơi xem, sửa, hủy và theo dõi công việc, bao gồm đợt kiểm kê và các loại công việc khác. Dữ liệu cũ vẫn đọc được; không tự chuyển loại các đợt lịch sử.

Giữ hai nhóm chọn nhân viên **Ban kiểm kê** và **QC/AC**, nút mở hồ sơ, chọn từng người rồi xác nhận. Bên ngoài chỉ hiện tên người đã chọn. Tên công việc có gợi ý theo loại/lô và có thể sửa; có mức ưu tiên, giờ bắt đầu/kết thúc, địa điểm, mô tả.

Ngày mặc định lấy ngày hoàn thành phần trên báo cáo thành phẩm hoặc ngày nhận NVL theo kế hoạch mua; nếu đã qua thì dùng hôm nay. Chọn nhiều phần lấy ngày muộn nhất. Kết thúc phải sau bắt đầu, không trùng lịch công việc đang hiệu lực của nhân viên.

Khi NVL chưa về, công việc chờ gắn lô thực tế. Giám đốc mở chi tiết **Chọn lô NVL đã nhận**, chỉ chọn được hàng thuộc kế hoạch nguồn; chưa có hàng thì chưa bắt đầu. Không tạo lô hoặc tồn giả khi lập công việc dự kiến.

## Thực hiện

Khi bấm bắt đầu, giám đốc có thể tick **Giả lập thử nghiệm – cho phép kiểm kê trước ngày nhận dự kiến**. Mặc định bỏ chọn ở mỗi lần mở. Không tick thì vẫn chặn trước ngày nhận kế hoạch; tick chỉ bỏ qua điều kiện ngày hiện tại so với ngày nhận, vẫn kiểm tra quyền, phiên bản, trạng thái, lịch hợp lệ và có lô thực tế. Lựa chọn `simulate_early_start` được ghi vào audit của thao tác START; không đổi ngày kế hoạch và không áp dụng cho các đợt khác.

Giám đốc mở công việc → **Bắt đầu kiểm tra**. QC/AC được giao mở cùng công việc → **Ghi kết quả kiểm tra**, chọn đúng dòng/phần đã giao. Tổng kiểm là lượng của dòng trong phần đó, không phải toàn bộ đầu lô. Đạt + lỗi phải bằng lượng kiểm, lỗi có mô tả. Công việc hoàn tất khi mọi dòng đã chọn được QC; không bắt chờ các phần chưa được giao trong lô tổng.

Ban kiểm kê được giao ghi số lượng đếm của từng dòng lô; QC/AC được giao ghi kết quả chất lượng. Nếu có cả hai bộ phận, đợt và công việc chỉ hoàn tất sau khi tất cả dòng đã có đủ hai nội dung. Số đếm bằng 0 là kết quả hợp lệ; chưa đếm được lưu NULL. Số đếm không tự điều chỉnh tồn hay tạo phiếu nhập/xuất. Kiểm kê tồn kho COUNT và chứng từ điều chỉnh lịch sử vẫn giữ riêng, không tự sinh hoặc suy diễn chênh lệch tồn từ số đếm lô trước nhập.

Giám đốc sửa tên, thời gian, nhân viên hoặc hủy công việc khi chưa bắt đầu. Sửa giữ phạm vi lô/phần đã chọn, đồng bộ phân công với lịch QC. Hủy giải phóng phần chưa kiểm để có thể giao công việc khác. Sau bắt đầu không sửa/hủy bằng đường này. Không dùng nút cập nhật tiến độ chung để đánh dấu kiểm tra xong khi chưa có QC.

## Báo cáo phần cuối

### Biên bản sau kiểm tra lô

Biên bản có lựa chọn ngoại lệ và mô tả; QC/AC/Ban kiểm kê chỉ ghi nhận tại đây, không xử lý ngoại lệ. Luồng quản lý xử lý trực tiếp hoặc đề xuất chủ xưởng phê duyệt/chỉ định phương án khác tại [NGOAI_LE_TRONG_BIEN_BAN.md](NGOAI_LE_TRONG_BIEN_BAN.md).

Sau khi đợt COMPLETED (hoặc đã đóng), nhân viên QC/AC hoặc Ban kiểm kê được phân công vào **Biên bản kiểm kê → Tạo mới**, chọn đợt kiểm tra lô, nhập kết luận và lưu nháp. Không bắt chọn kho đối với đợt kiểm tra lô. Biên bản tự tổng hợp từng dòng/phần: số lượng ghi nhận, số đếm và chênh lệch nếu có, lượng kiểm/đạt/lỗi và mô tả lỗi QC nếu có. Không tự thay số đếm còn NULL bằng 0 hoặc lượng lỗi QC bằng chênh lệch số lượng.

Mở biên bản để sửa kết luận khi còn nháp hoặc **Gửi**. Gửi chụp dữ liệu chi tiết để giữ lịch sử, biên bản không được sửa tiếp. Ban giám đốc xem trong cùng danh sách; không cần tự lập lại. Mỗi đợt chỉ có một biên bản; các nhân viên được giao cùng dùng bản đó. Đợt có cả hai bộ phận phải hoàn tất cả số đếm và QC trước khi lập. Luồng biên bản COUNT tồn kho cũ vẫn đọc và xử lý được.

API dùng chung `/stocktake-minutes`: tạo biên bản lô truyền `inspection_campaign_id, remarks`; ID biên bản lô có dạng `LOT-<id đợt>`, không trùng ID số của biên bản kho cũ. Sửa/gửi cần `version`. Migration `012_inspection_minutes` lưu kết luận, trạng thái, người lập, thời điểm gửi và snapshot chi tiết trên DotKiemKe; không thay đổi tồn kho hay xóa chứng từ cũ.

Form báo cáo thành phẩm không bắt xác nhận xong toàn bộ ở mọi lần. Chỉ tích **Đây là đợt cuối, đã hoàn tất toàn bộ kế hoạch** ở phần cuối. Gửi phần thường giữ KHSX IN_PROGRESS; gửi phần cuối chuyển COMPLETED. Không được gửi phần cuối khi còn báo cáo thành phẩm nháp của các phần trước. Tổng lượng các báo cáo phần không vượt lượng kế hoạch; NVL sử dụng cộng dồn không vượt đã cấp. Mỗi báo cáo chỉ ghi lượng phần mới, không nhập lại tổng tích lũy.

Form cập nhật 23/10/2026: mỗi thành phẩm của kế hoạch một dòng, có **Còn lại = lượng kế hoạch − lượng ở các báo cáo khác − lượng đang nhập**. Các báo cáo khác bao gồm nháp để không ghi trùng; sửa báo cáo sẽ loại lượng của chính báo cáo đang sửa khỏi tổng đã ghi. Không thêm dòng trùng mặt hàng. Tick đợt cuối điền toàn bộ phần còn thiếu; nhập đủ mọi mặt hàng thì tự tick, giảm lượng của một mặt hàng thì tự bỏ tick. Số lượng bằng 0 không gửi thành một dòng thành phẩm hay tiêu hao. Backend vẫn đối chiếu lại hạn mức khi lưu, không tin số còn lại từ trình duyệt.

NVL lấy tổng phiếu xuất cho xưởng đã POSTED, trừ lượng đã ghi dùng ở các báo cáo khác. Đợt cuối gợi ý phần chưa quyết toán này nhưng cho sửa theo thực tế; không ghi đè ô tiêu hao người dùng đã sửa. Bảng hiển thị lượng đã xuất, lượng đã dùng trước và lượng chưa dùng/cần đối chiếu trả kho. Báo cáo hiện tại chỉ ghi tiêu hao của phần này, không gửi lại tổng tiêu hao mọi đợt.

**Nhập trả NVL dư chưa triển khai trong thay đổi này.** Hướng tiếp theo là yêu cầu nhập trả từ xưởng gắn KHSX và các dòng phiếu xuất/lô gốc, thủ kho nhận thực tế rồi lập phiếu nhập trả; chỉ phiếu đã ghi sổ mới tăng tồn. Cần chọn lô gốc, kiểm soát tổng dùng + đã trả + đang trả không vượt đã cấp và xác định chất lượng phần dư. Không tạo lô mới mất nguồn, không tự tăng tồn từ số chênh lệch trên báo cáo.

Ví dụ KHSX 100 hộp: báo cáo A = **40**, báo cáo B = **60**; B không nhập 100. Cả A/B có chung mã lô tổng nhưng mã báo cáo và dòng lô riêng. QC A đạt 40, B đạt 55/lỗi 5 thì nhập kho khả dụng tổng **95**, không phải 100 hoặc 195.

Ghi báo cáo/chọn công việc/ghi QC chưa tự cộng tồn. Sau QC chủ xưởng lập yêu cầu nhập từ đúng báo cáo thành phẩm, quản lý phân công và nhân viên kho ghi phiếu cho lượng đạt. Các lần nhập/báo cáo không được làm tăng tồn trùng.

## Dữ liệu, API và tương thích

- Migration `010_finished_report_parts` thêm `BanBaoCaoSanXuat.KieuThanhPham`, cập nhật view BaoCaoThanhPham; đủ 10 marker cho runtime. Không xóa dữ liệu cũ.
- API báo cáo phần: `POST /finished-reports`, `report_mode=PART`, `production_completed=false|true`, `outputs` là lượng phần mới. Báo cáo tổng kết cũ giữ FINAL để đọc/tiếp tục tương thích, không ép dữ liệu lịch sử thành phần mới.
- `GET /task-inspection-sources`: DIRECTOR, trả `finished_lots[].parts[]` theo báo cáo thành phẩm, cùng `material_lots` theo MUA.
- `POST /tasks`: FINISHED_PRODUCT dùng `lot_header_id` + `finished_report_ids`; MATERIAL dùng `material_source`. Giữ trường tên, thời gian, ưu tiên, nhân viên. Backend xác minh phần thuộc đúng lô, báo cáo đã gửi, chưa bị kiểm tra/phân công trùng.
- Công việc gắn lịch QC bằng `CongViec.MaDotKiemKe`, `task_type=LOT_INSPECTION`; tạo cùng một transaction, rollback cả hai nếu lỗi. Bắt đầu/QC xong đồng bộ trạng thái công việc. Không thêm bảng nhân viên hay cấp quyền QC cho Ban kiểm kê.

Kịch bản nhập liệu từng vai trò: [KICH_BAN_TEST_QCAC_KIEM_KE.md](KICH_BAN_TEST_QCAC_KIEM_KE.md).

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
