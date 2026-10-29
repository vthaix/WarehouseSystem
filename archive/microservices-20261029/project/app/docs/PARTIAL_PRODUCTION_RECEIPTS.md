# UC-23: nhập thành phẩm từng phần

Chủ xưởng chọn **Nhập thành phẩm từng phần — tự ghi số lượng** trên màn hình yêu cầu nhập/xuất. Chọn KHSX đã duyệt thuộc xưởng, kho và quản lý; nhập lượng vừa sản xuất, ngày sản xuất và hạn sử dụng. Không cần báo cáo thành phẩm trước khi lập đợt nhập. Không tự lấy số lượng dự kiến làm số lượng thực tế.

Các đợt của một KHSX dùng chung một `LoHang`; từng mặt hàng của từng đợt là một `ChiTietLo` riêng, có liên kết đến yêu cầu nhập. Cách này giữ số lượng/ngày của từng đợt và cho phép QC một lần trên từng dòng, không tăng số lượng của dòng đã được QC. Nhiều mặt hàng có thể chung một lô tổng. Một yêu cầu không có hai dòng cùng mặt hàng.

## Luồng thao tác

1. **Chủ xưởng** lập đợt nhập, nhập số thực tế. Tạo yêu cầu và dòng lô ở trạng thái chờ QC; chưa có tồn kho.
2. **Ban giám đốc** lập lịch kiểm tra chất lượng, phân công QC/AC cho các dòng lô. QC ghi lượng kiểm tra = đạt + lỗi, có thể kiểm tra trước báo cáo tổng kết.
3. **Quản lý kho** phân công nhập phần đạt QC của đúng đợt; **nhân viên kho** ghi phiếu. Lô từ đợt khác bị từ chối, dù cùng mặt hàng/cùng lô tổng. Phần lỗi không được cộng tồn.
4. **Chủ xưởng** khi hoàn tất toàn bộ lập báo cáo thành phẩm. Chọn KHSX để tự lấy các dòng đã ghi nhận; giữ nguyên mặt hàng, mã dòng lô, số lượng, ngày của các dòng đó. Nhập NVL thực dùng và xác nhận hoàn tất. Có thể thêm sản lượng thực tế chưa ghi nhận; sản lượng thực tế không bị ép bằng hoặc dưới dự kiến, nhưng mặt hàng phải thuộc KHSX và NVL sử dụng không vượt lượng thực xuất.
5. Báo cáo dùng lại dòng lô cũ, không tạo thêm dòng cho cùng sản lượng. Gửi tổng kết đánh dấu KHSX hoàn tất và không cho lập đợt mới. Đợt cũ vẫn có thể hoàn tất nhập phần đạt QC còn lại. Không dùng báo cáo để tạo yêu cầu nhập lại phần đã ghi trong các đợt.

Request giữ lượng sản xuất thô; response từng dòng có `qc_passed_quantity`, `qc_failed_quantity`, `fulfilled_quantity` và `remaining_quantity`. Sau QC, lượng còn cần nhập tính theo phần đạt. Yêu cầu hoàn tất khi đã nhập hết phần đạt; nếu QC lỗi toàn bộ thì lượng cần nhập bằng 0, yêu cầu được xử lý xong mà không tạo phiếu/tồn. Lượng lỗi vẫn có trong lô/QC và sản lượng thô của báo cáo tổng kết. Sửa QC hợp lệ hoặc tái kiểm đã được duyệt cập nhật lại lượng cần nhập và trạng thái đợt.

## Tính nhất quán

- Tạo đợt cần `receipt_key`, UI giữ khóa khi retry. Hai request cùng khóa/nội dung trả cùng ID; đổi nội dung nhưng dùng lại khóa trả 409 `IDEMPOTENCY_CONFLICT`. Bản ghi chống trùng lưu cùng transaction với yêu cầu/lô.
- Không sửa đợt đã tạo để đổi lượng/ngày của dòng lô. Có thể hủy đợt chưa phân công, chưa lên lịch/ghi QC và chưa dùng trong tổng kết, rồi lập lại. Dữ liệu lô hủy giữ lịch sử; tổng kết không lấy đợt hủy chưa có phiếu.
- Tổng kết phải chứa đủ các dòng lô của các đợt có hiệu lực, kể cả phần QC lỗi. Bỏ dòng hoặc đổi nội dung của dòng cũ bị chặn. Sửa NVL của báo cáo nháp không xóa/tạo lại dòng lô đã QC/nhập.
- Phân công và ghi phiếu tiếp tục kiểm tra QC, tồn, kho khóa kiểm kê, phạm vi nhân viên và idempotency hiện có. Điều kiện bán sau hoàn tất/đến ngày giao giữ nguyên.

## API và schema

POST `/api/v1/stock-requests`:

```json
{
  "purpose": "PRODUCTION_RECEIPT",
  "production_source_mode": "MANUAL",
  "production_plan_id": "1",
  "workshop_id": "1",
  "warehouse_id": "1",
  "manager_id": "5",
  "requested_date": "2026-10-13",
  "receipt_key": "unique-uuid-for-this-batch",
  "lines": [{"item_id":"1","quantity":"0.750","manufactured_date":"2026-10-13","expiry_date":"2026-11-13"}]
}
```

GET `/api/v1/source-imports/finished-reports?source_id=<KHSX>` trả các dòng lô hiện có để điền tổng kết, có kiểm tra phạm vi xưởng. GET yêu cầu thủ công trả thêm `lots`, gồm mã dòng lô/lô tổng/ngày/số lượng/trạng thái QC.

Migration service **004_partial_receipts** thêm `LoHang.MaKeHoachNhapThanhPham` (unique theo KHSX), `ChiTietLo.MaYeuCauNhapThanhPham` và mode MANUAL riêng cho nhập TP. Không thêm entity/bảng nghiệp vụ mới. Chạy tự động qua `split-databases`, giữ dữ liệu hiện có; migration 001–026 nguồn không sửa. Warehouse vẫn cùng MySQL với Business theo kiến trúc hiện hành.

Kiểm thử SQL cô lập có ba đợt chung header: 0,750 đạt; 1,250 gồm 1,000 đạt và 0,250 lỗi; 0,100 lỗi toàn bộ. Tồn nhập đúng 1,750, tổng kết phản ánh 2,100 thực sản xuất trên kế hoạch 2,000; không tạo thêm dòng lô, không cho nhập lại qua nguồn báo cáo. Test còn kiểm tra replay cạnh tranh, sai dòng lô, chưa QC, sửa sản lượng cũ, đủ dòng tổng kết và chặn đợt mới sau tổng kết.
