# Quyết định nghiệp vụ còn cần xác nhận

## UC-34/UC-35 đã được chủ dự án yêu cầu sửa

UC-34 chỉ dùng khi đang sản xuất để báo cáo tiến độ/sự cố hoặc thiếu NVL, mặc định gửi BGĐ và tùy chọn thêm planner. UC-35 là tổng kết khi hoàn tất toàn bộ, không lập từng phần; cùng bảng báo cáo, loại THANH_PHAM. Người lập xác nhận hoàn tất, không suy ra hoàn tất bằng việc sản lượng bằng kế hoạch. Gửi tổng kết đánh dấu kế hoạch hoàn thành. Quy tắc một báo cáo nhu cầu giữ riêng cho nguồn NVL; các báo cáo tiến độ/sự cố được lập nhiều lần và không làm nguồn mua/cấp NVL.

## Đã yêu cầu: import tùy chọn và mua NVL thủ công

Chủ dự án yêu cầu sáu luồng lấy nguồn và nêu rõ không chỉ khi có báo cáo mới được mua NVL: có thể chọn import hoặc tự nhập. Do đó đơn mua REPORT/MANUAL không cần kế hoạch mua; PLAN vẫn giữ quy tắc cũ. Chủ dự án cũng yêu cầu lấy kế hoạch SX để xuất NVL: thêm nguồn PLAN trực tiếp, giữ lựa chọn REPORT và kiểm tổng cấp chung. Không tự phê duyệt, ghi tồn hay tạo báo cáo hộ người dùng.

Xuất thành phẩm dùng QC/tồn sau kiểm kê và hiển thị kết luận kiểm kê gần nhất nếu có; không bắt kiểm kê mới cho mỗi lần giao. Kiểm kê không có được hiển thị rõ, không suy đoán số đếm. Các mô tả bắt buộc báo cáo/kế hoạch cho mọi đơn mua hoặc mọi yêu cầu xuất NVL ở bản cũ được thay thế trong phạm vi này.

## Đã chốt: hàng khách trả

Người dùng chọn “Ghi nhận trả và cách ly; chưa tự giao bù/hoàn tiền”. Liên kết dòng phiếu giao gốc, giữ lịch sử giao và trạng thái đơn. Quản lý lập, nhân viên được giao nhận vào cách ly, QC kiểm tra theo lịch. Hàng kiểm tra đạt vẫn chưa tự chuyển sang khả dụng. Xử lý tồn cách ly sau kết luận QC cần nghiệp vụ riêng.

## Xác nhận bổ sung 11/10/2026

Chủ dự án đã trả lời “Đồng ý bộ quy tắc đề xuất”: giữ chỗ lúc quản lý phân bổ, giải phóng phần chưa xuất khi hủy/đổi, không tự hết hạn; nhập NVL dự kiến số gốc, cộng 10% một lần và làm tròn lên 3 chữ số; một báo cáo nhu cầu đang hiệu lực mỗi kế hoạch; yêu cầu chỉ điều phối; kiểm kê khóa theo kho và kết luận từng kho; mọi điều chỉnh chênh lệch cần giám đốc duyệt, quản lý thực hiện riêng; sửa đơn trước duyệt và duyệt kế hoạch cùng đơn; chủ xưởng đọc kho chung, báo cáo lấy tồn hệ thống; QC một kết quả mỗi dòng lô, sửa sai bằng chứng từ bù; lô phân loại NVL/THÀNH_PHẨM/TRẢ_VỀ, hàng trả có hướng trả/dòng gốc; chưa tự mua bù khi trả NCC. Các đề xuất tương ứng bên dưới đã được chốt cho lượt triển khai này, không cần xin xác nhận lại.

## Xác nhận bổ sung trong lượt triển khai 10/10/2026

Chủ dự án đã đồng ý cả ba lựa chọn: báo cáo đã dùng làm nguồn bất biến; tiếp tục một đơn mua cho mỗi kế hoạch; giữ tên JSON/API hiện tại, thêm trường nguồn và không suy đoán nguồn dữ liệu lịch sử. Đây là xác nhận từng phần cho D-03/D-04/D-14; chính sách báo cáo bổ sung/thay thế, mua bù sau trả hàng, giữ chỗ và chuyển đổi toàn bộ schema vẫn còn mở. Các câu “không viết migration trong lượt này” bên dưới mô tả lượt sửa docs trước, không giới hạn lượt triển khai đã được yêu cầu tiếp theo.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

12 quy tắc BR đã được chốt. Các điểm sau chỉ là khoảng trống hoặc mâu thuẫn còn lại; phương án gợi ý không phải yêu cầu đã được chấp thuận. Không cần xác nhận lại nguồn MUA/BAN, báo cáo chung, chi tiết kế hoạch chung hoặc không tạo hồ sơ/biên bản riêng.

| Mã | Vấn đề | Bằng chứng mâu thuẫn / thiếu | Câu cần chốt / phương án đề xuất | UC và màn ảnh hưởng |
| --- | --- | --- | --- | --- |
| D-01 | Giữ chỗ tồn | BR-09 cần chống dùng chung, nhưng Word chưa nêu lúc giữ/giải phóng. | Đề xuất giữ lúc quản lý xác nhận phân bổ; giải phóng phần chưa xuất khi hủy/đổi; xuất một phần tiêu thụ tương ứng. Chốt có TTL, quyền hủy và xử lý giữ khi kho đóng băng không. | UC-08/09/11/23/24; UI-13/15/16/17 |
| D-02 | 10% và làm tròn | Đã chốt cộng 10% một lần; chưa có cách làm tròn/độ chính xác hoặc nhận biết dữ liệu cũ đã gồm dự phòng. | Chốt thuật toán/định mức ước lượng, độ chính xác theo đơn vị, chiều làm tròn; lưu nhu cầu gốc/nhu cầu đã gồm 10% và dấu vết, không suy đoán lại dữ liệu cũ. | UC-04/34; UI-30/28 |
| D-03 | Nhiều báo cáo và thiếu thực tế | Word tính thiếu bằng cần trừ tồn; nhiều báo cáo có thể cùng nhìn một tồn chưa giữ. Sửa báo cáo đã dùng mua/cấp chưa có chính sách. | Chốt báo cáo phiên bản/thay thế/bổ sung, thời điểm chụp tồn và cam kết nhu cầu; định nghĩa báo cáo nguồn bất biến hoặc vòng sửa-đối soát. Không cộng nhu cầu hai lần. | UC-34/04/27/23/11 |
| D-04 | Mua cộng dồn và hủy/trả | Đã chốt chặn vượt thiếu, chưa chốt nhiều đơn/kế hoạch và cách tính mua hiệu lực khi hủy/trả/nhận thiếu. Code đang một đơn cho một kế hoạch. | Chốt lượng cam kết mua gồm trạng thái nào, hủy có trả hạn mức không, hàng lỗi trả NCC có tạo nhu cầu mua bù không; tránh tính cùng một lượng ở kế hoạch và đơn hai lần. | UC-04/05/27/14/32 |
| D-05 | Subtype và hàng trả | Domain có LoHangTraVe nhưng chưa rõ hàng khách trả hay trả NCC; lô nhiều mặt hàng đã chốt. | Chốt chuyên biệt loại trừ nhau hay kết hợp; dùng bảng con/discriminator; hướng trả và dòng lô gốc; không gán mặc nhiên LoHangTraVe cho mọi QC lỗi. | UC-07/10/11/12 |
| D-06 | Duyệt yêu cầu và xuất bán | Word UC-23 dùng Chờ duyệt, UC-24/11 dùng Chờ xử lý; chưa nêu actor/bước duyệt. Nhánh UC-23 mới nói xuất NVL/nhập TP; xuất bán có yêu cầu riêng chưa rõ. | Chốt duyệt hay chỉ điều phối, ai duyệt, thời điểm cam kết nhu cầu; xuất bán từ kế hoạch/đơn hay phiếu riêng. Không tự thêm quyền xưởng lập mọi yêu cầu. | UC-23/24/08/09/11.02 |
| D-07 | Kiểm kê nhiều kho và khóa | Kết luận trên PhieuKiemKe đã chốt; một đợt nhiều kho, kết luận từng kho hoặc chung và thời điểm khóa/mở chưa rõ. | Chốt phạm vi PhieuKiemKe mỗi kho hay đợt, kết luận theo phạm vi, đóng băng toàn kho/dòng lô, giữ đang có hiệu lực, sửa kết luận sau gửi. | UC-13/15/28/21 |
| D-08 | Hạn mức chênh lệch | Word UC-16 cho quản lý xử lý trực tiếp hoặc gửi giám đốc khi nghiêm trọng; không có ngưỡng. Docs cũ bắt mọi chênh lệch giám đốc duyệt. | Chốt hạn mức theo lượng/giá trị/tỷ lệ hoặc duyệt mọi trường hợp. Chưa lựa chọn nào được công nhận đã chốt. | UC-16/17; UI-22/23 |
| D-09 | Ngoại lệ: duyệt và thực hiện | Hai entity và giám đốc phê duyệt đã chốt, nhưng trạng thái chi tiết, sửa/gửi lại, tự duyệt và thực hiện vật lý chưa rõ. | Chốt vòng nháp/gửi lại, quyết định theo phiên bản, người được thực hiện, duyệt và áp dụng cùng hay tách transaction; tái kiểm, lỗi thực hiện, quyết định kế tiếp. | UC-17/16/12; UI-23/23B |
| D-10 | Sửa đơn/đặt cọc | UC-03.1 sửa xong chờ phê duyệt nhưng trạng thái cho sửa và ảnh hưởng kế hoạch/giá/ngày giao/đặt cọc chưa đủ. | Chốt SUBMITTED/RECEIVED và đơn đã duyệt, có tiếp nhận lại không, cách vô hiệu kế hoạch/báo cáo phụ thuộc. Cảnh báo không đồng nghĩa tự tính bồi thường. | UC-03.1/29/31 |
| D-11 | UC-04 và duyệt kế hoạch sản xuất | Word UC-04 có nhánh sản xuất, tên UC vẫn mua/bán; UC-31 cập nhật kế hoạch liên quan nếu chốt duyệt đồng thời. Code duyệt kế hoạch cùng đơn. | Giữ tên/mã UC; chốt UC-31 duyệt cùng kế hoạch hay bước riêng, kế hoạch khi từ chối đơn; không tự thêm UC mới. | UC-04/31; UI-05/30 |
| D-12 | Kho xưởng và phạm vi tồn | Word nói tồn khả dụng của xưởng nhưng domain chỉ có Kho/TonKho; UC-18/22 thêm chủ xưởng, phạm vi kho dùng chung chưa rõ. | Chốt kho xưởng/sổ NVL đã cấp hay chỉ kho trung tâm; nguồn tồn hệ thống thay số tự khai; quyền đọc kho dùng chung; tiêu hao/thành phẩm liên hệ lượng đã cấp. | UC-18/22/34/35 |
| D-13 | Liên kết QC/nhập/trả và sửa sai | QC từng dòng và phần đạt nhập đã chốt; chưa rõ kiểm một phần/tái kiểm, chứng từ trả, QC→phiếu nhập, xử lý phiếu sai. | Chốt đối soát nhiều lần kiểm không tính đạt trùng, liên kết dòng lô/nguồn/phiếu, trả lỗi trước nhập và trả đã nhập; actor thực hiện, chứng từ điều chỉnh/bù. | UC-10/11/12/17 |
| D-14 | Tương thích API/CSDL cũ | Domain mới khác endpoints, JSON, enum và bảng vật lý cũ; Word không chọn chiến lược chuyển đổi. | Chốt tên JSON/enum, adapter tương thích, chuyển FK và dữ liệu lịch sử, lộ trình ngừng route/entity cũ; không viết migration trong lượt này. | API/DATABASE/IMPLEMENTATION_BACKLOG |
| D-15 | Thiếu class và lỗi đặc tả nhỏ | CongViec dùng trong Word nhưng hình domain thiếu class; UC-06.1/06.3 kiểm trường số dù form chỉ text; UC-07.3 lẫn tên danh mục, số bước trùng. | Bổ sung mô tả CongViec sau xác nhận; chốt trường theo resource; chỉnh số bước nếu cần đồng bộ sequence. Giữ nguyên mã UC và Word đã chốt ở lượt này. | UC-06/07/13/15/21/25 |
