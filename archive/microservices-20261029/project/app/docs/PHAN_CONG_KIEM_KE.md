# Công việc kiểm tra lô và báo cáo thành phẩm từng phần

Quy tắc hiện hành theo đính chính của chủ dự án ngày 22/10/2026. Tài liệu này thay hướng trước đó dùng báo cáo tiến độ làm phần lô hoặc yêu cầu người dùng chuyển sang một màn hình khác để tạo công việc kiểm tra.

## Luồng tạo phần thành phẩm

**Báo cáo thành phẩm → một phần của lô tổng → Công việc chọn phần → QC → Yêu cầu nhập phần đạt → Phiếu nhập → Tồn kho.**

Một KHSX dùng chung đầu lô `TP-SX-<mã kế hoạch>`. Chủ xưởng lập nhiều báo cáo thành phẩm; mỗi báo cáo gồm sản lượng thực tế của phần đó. Các dòng sản phẩm của báo cáo tạo ChiTietLo riêng nhưng cùng LoHang với những báo cáo trước thuộc KHSX này. Chỉ báo cáo đã gửi và phần chưa được giao kiểm tra/mới kiểm xong mới quyết định việc xuất hiện trong danh sách; phần đã QC không được phân công QC lần đầu lại.

UC-34 tiến độ/sự cố/nhu cầu vẫn hoạt động độc lập. **Báo cáo tiến độ không tạo phần lô**, không suy lượng bánh từ phần trăm tiến độ. Không tự liên kết các báo cáo cũ với đợt hàng bằng phỏng đoán.

## Form Lập đợt kiểm kê

Vào **Lập đợt kiểm kê → Tạo mới** của giám đốc. Công việc liên kết được tạo cùng đợt; **Quản lý công việc** không có Tạo mới. Chọn một người lập biên bản chung trong nhóm được phân công. Chi tiết hiện hành: [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md). Form chọn hai nhóm nguồn lô:

1. **Kiểm tra thành phẩm**: chọn một lô thành phẩm trong dropdown → hiện danh sách các phần, mỗi phần là một báo cáo thành phẩm đã gửi → tích một hoặc nhiều phần → chọn nhân viên → lưu ngay tại Công việc.
2. **Kiểm tra nguyên vật liệu**: chọn lô NVL được đối chiếu theo kế hoạch MUA đã duyệt. Hàng đã về hiển thị lô thực tế; hàng chưa về hiển thị NVL dự kiến theo mã kế hoạch. Chọn nhân viên rồi lưu. Không có danh sách phần theo báo cáo thành phẩm ở loại này.

Giữ hai nhóm chọn nhân viên **Ban kiểm kê** và **QC/AC**, nút mở hồ sơ, chọn từng người rồi xác nhận. Bên ngoài chỉ hiện tên người đã chọn. Tên công việc có gợi ý theo loại/lô và có thể sửa; có mức ưu tiên, giờ bắt đầu/kết thúc, địa điểm, mô tả.

Ngày mặc định lấy ngày hoàn thành phần trên báo cáo thành phẩm hoặc ngày nhận NVL theo kế hoạch mua; nếu đã qua thì dùng hôm nay. Chọn nhiều phần lấy ngày muộn nhất. Kết thúc phải sau bắt đầu, không trùng lịch công việc đang hiệu lực của nhân viên.

Khi NVL chưa về, công việc chờ gắn lô thực tế. Giám đốc mở chi tiết **Chọn lô NVL đã nhận**, chỉ chọn được hàng thuộc kế hoạch nguồn; chưa có hàng thì chưa bắt đầu. Không tạo lô hoặc tồn giả khi lập công việc dự kiến.

## Thực hiện

Giám đốc mở công việc → **Bắt đầu kiểm tra**. QC/AC được giao mở cùng công việc → **Ghi kết quả kiểm tra**, chọn đúng dòng/phần đã giao. Tổng kiểm là lượng của dòng trong phần đó, không phải toàn bộ đầu lô. Đạt + lỗi phải bằng lượng kiểm, lỗi có mô tả. Công việc hoàn tất khi mọi dòng đã chọn được QC; không bắt chờ các phần chưa được giao trong lô tổng.

Ban kiểm kê vào Quản lý kiểm kê/Tạo mới, chọn công việc rồi ghi đủ số đếm mọi dòng chưa ghi trong một lần. Quyền ghi QC thuộc QC/AC. Chọn cả hai bộ phận thì phải đủ số đếm lẫn QC mới hoàn tất đợt; người được chỉ định lập một biên bản chung. COUNT theo kho lịch sử giữ cơ chế riêng.

Giám đốc sửa tên, thời gian, nhân viên hoặc hủy công việc khi chưa bắt đầu. Sửa giữ phạm vi lô/phần đã chọn, đồng bộ phân công với lịch QC. Hủy giải phóng phần chưa kiểm để có thể giao công việc khác. Sau bắt đầu không sửa/hủy bằng đường này. Không dùng nút cập nhật tiến độ chung để đánh dấu kiểm tra xong khi chưa có QC.

## Báo cáo phần cuối

Form báo cáo thành phẩm không bắt xác nhận xong toàn bộ ở mọi lần. Chỉ tích **Đây là đợt cuối, đã hoàn tất toàn bộ kế hoạch** ở phần cuối. Gửi phần thường giữ KHSX IN_PROGRESS; gửi phần cuối chuyển COMPLETED. Không được gửi phần cuối khi còn báo cáo thành phẩm nháp của các phần trước. Tổng lượng các báo cáo phần không vượt lượng kế hoạch; NVL sử dụng cộng dồn không vượt đã cấp. Mỗi báo cáo chỉ ghi lượng phần mới, không nhập lại tổng tích lũy.

Ví dụ KHSX 100 hộp: báo cáo A = **40**, báo cáo B = **60**; B không nhập 100. Cả A/B có chung mã lô tổng nhưng mã báo cáo và dòng lô riêng. QC A đạt 40, B đạt 55/lỗi 5 thì nhập kho khả dụng tổng **95**, không phải 100 hoặc 195.

Ghi báo cáo/chọn công việc/ghi QC chưa tự cộng tồn. Sau QC chủ xưởng lập yêu cầu nhập từ đúng báo cáo thành phẩm, quản lý phân công và nhân viên kho ghi phiếu cho lượng đạt. Các lần nhập/báo cáo không được làm tăng tồn trùng.

## Dữ liệu, API và tương thích

- Migration `010_finished_report_parts` thêm `BanBaoCaoSanXuat.KieuThanhPham`, cập nhật view BaoCaoThanhPham; đủ 10 marker cho runtime. Không xóa dữ liệu cũ.
- API báo cáo phần: `POST /finished-reports`, `report_mode=PART`, `production_completed=false|true`, `outputs` là lượng phần mới. Báo cáo tổng kết cũ giữ FINAL để đọc/tiếp tục tương thích, không ép dữ liệu lịch sử thành phần mới.
- `GET /task-inspection-sources`: DIRECTOR, trả `finished_lots[].parts[]` theo báo cáo thành phẩm, cùng `material_lots` theo MUA.
- `POST /tasks`: FINISHED_PRODUCT dùng `lot_header_id` + `finished_report_ids`; MATERIAL dùng `material_source`. Giữ trường tên, thời gian, ưu tiên, nhân viên. Backend xác minh phần thuộc đúng lô, báo cáo đã gửi, chưa bị kiểm tra/phân công trùng.
- Công việc gắn lịch QC bằng `CongViec.MaDotKiemKe`, `task_type=LOT_INSPECTION`; tạo cùng một transaction, rollback cả hai nếu lỗi. Bắt đầu/QC xong đồng bộ trạng thái công việc. Không thêm bảng nhân viên hay cấp quyền QC cho Ban kiểm kê.

Kịch bản nhập liệu từng vai trò: [KICH_BAN_TEST_QCAC_KIEM_KE.md](KICH_BAN_TEST_QCAC_KIEM_KE.md).


Phần chọn nhân viên chia hai nhóm **Ban kiểm kê** và **QC/AC**. Mỗi nhóm có nút **Chọn nhân viên** mở hộp thoại hồ sơ (họ tên, tài khoản, bộ phận, trạng thái). Chọn từng người rồi **Xác nhận** mới cập nhật danh sách; **Hủy** giữ nguyên lựa chọn trước. Ngoài hộp thoại chỉ hiện tên người đã chọn dưới nhóm tương ứng. Tài khoản mẫu bổ sung: qc2, qc3, stocktaker2, stocktaker3; mật khẩu demo mặc định 123456, được băm và không ghi đè tài khoản đã có khi chạy seed lại.

Màn hình **Công việc** do giám đốc tạo cũng giới hạn nhân viên nhận ở Ban kiểm kê và QC/AC; cho phép chọn nhiều người thuộc cả hai bộ phận và giữ đầy đủ danh sách khi sửa. Kiểm tra này áp dụng ở backend, không chỉ ở danh sách chọn. Phân công nhập/xuất kho theo yêu cầu vẫn dùng nhân viên kho theo luồng điều phối riêng.

Giám đốc lập đợt kiểm kê COUNT và chọn từng nhân viên trong Ban kiểm kê hoặc QC/AC. Có thể chọn nhiều nhân viên, gồm cả hai bộ phận, trong cùng đợt và kho. Backend chỉ nhận nhân viên đang hoạt động thuộc hai vai trò này. Người được phân công có thể mở bảng đếm, lưu số đếm và hoàn tất kho; QC/AC không được thao tác kho chưa được phân công. Công việc cho phép phân công phối hợp cả hai nhóm; quyền ghi kết quả chất lượng vẫn thuộc QC/AC.

