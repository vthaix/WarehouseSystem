# Yêu cầu nhập / xuất kho của chủ xưởng

Luồng cập nhật ngày 23/10/2026: **Chủ xưởng gửi yêu cầu → quản lý phân công → nhân viên ghi phiếu theo giấy thực tế → chủ xưởng, quản lý và giám đốc xem hồ sơ.**

## Bốn nhánh trên giao diện

| Thao tác | Loại | Nguồn chủ xưởng chọn | Điều kiện |
|---|---|---|---|
| Nhập | Nguyên vật liệu | Kế hoạch mua NVL | Đơn mua thuộc kế hoạch, đã ghi lô, có lượng đạt QC chưa được yêu cầu nhập |
| Nhập | Thành phẩm | Báo cáo thành phẩm đã gửi | Đúng xưởng; chọn phần đạt QC của báo cáo; không tạo thêm lô trùng |
| Xuất | NVL để sản xuất | Kế hoạch sản xuất | Đã duyệt/đang thực hiện; lấy nhu cầu NVL của kế hoạch, không cộng dự phòng lần nữa |
| Xuất | Thành phẩm giao khách | Kế hoạch sản xuất đã hoàn tất | Đối chiếu kế hoạch bán đã duyệt, đơn khách, phần đạt QC đã nhập và tồn khả dụng |

Đơn mua trực tiếp không liên kết kế hoạch vẫn xuất hiện dưới tên **Đơn mua trực tiếp · mã đơn** để không mất khả năng nhận NVL mua trực tiếp. Đây không phải kế hoạch giả.

Xuất thành phẩm giữ các ràng buộc đã có về hoàn tất sản xuất và ngày giao đơn khách. Nếu KHSX có đúng một kế hoạch bán đang hiệu lực thì tự liên kết; nếu có nhiều kế hoạch bán theo các phần báo cáo thì chọn rõ kế hoạch bán cần giao. Không đoán nguồn hoặc gộp nhiều kế hoạch bán vào một yêu cầu.

## Chủ xưởng lập yêu cầu

Vào **Yêu cầu nhập / xuất → Tạo mới**:

1. Chọn Nhập kho hoặc Xuất kho, rồi chọn một trong hai loại của thao tác đó.
2. Chọn nguồn. Hệ thống tải lượng còn được đề nghị và thông tin lô/QC. Đổi nguồn xóa ngay dữ liệu cũ; phản hồi tải nguồn cũ không được ghi đè nguồn mới.
3. Chọn xưởng được phụ trách, kho, quản lý nhận yêu cầu và **ngày giờ đề nghị thực hiện**. Ngày giờ dùng múi giờ Việt Nam, không chọn ngày quá khứ.
4. Kiểm tra các dòng hàng và lượng đề nghị; có thể giảm để yêu cầu một phần, không vượt nguồn còn lại. Gửi yêu cầu để quản lý nhận thông báo.

Yêu cầu chỉ giữ nhu cầu; chưa tăng/giảm tồn. Sửa nguồn phải hủy yêu cầu chưa dùng rồi lập lại; sửa yêu cầu đang cho phép được cập nhật lịch, kho, quản lý, ghi chú và lượng trong hạn mức.

## Quản lý phân công

Quản lý nhận yêu cầu, xem lô nguồn, lượng đạt/lỗi và ngày giờ chủ xưởng đề nghị. Bấm **Phân công kho**:

- Lịch gợi ý lấy đúng giờ trên yêu cầu, kết thúc mặc định sau một giờ; quản lý được điều phối lịch.
- Chọn từng nhân viên kho, lô thực nhận/thực xuất, vị trí và lượng giao. Form gợi ý dòng hàng và lượng còn lại; nếu cần nhiều lô hoặc nhiều người thì thêm phân bổ tương ứng.
- Backend kiểm lại nguồn, hạn mức, lượng QC đạt, tồn khả dụng, khóa kiểm kê và lịch nhân viên. Lô hiển thị cho nhận NVL/thành phẩm và giao thành phẩm được giới hạn theo chứng từ nguồn.
- Phân công tạo công việc và thông báo cho nhân viên; quản lý không thay nhân viên ghi phiếu.

## Nhân viên ghi theo giấy thực tế

Vào **Quản lý công việc → mở công việc được giao → Ghi phần hàng được giao** (hoặc ghi phiếu từ yêu cầu được phân công):

1. Mỗi dòng thể hiện đúng lô và vị trí đã được giao, số lượng tự điền bằng **được giao − đã ghi trước**.
2. Đối chiếu giấy bên ngoài, sửa số lượng thực nhập/thực xuất, ghi chú chênh lệch và số phiếu giấy nếu cần.
3. Xác nhận ghi sổ. Chỉ lượng đã xác nhận mới thay đổi tồn và tạo lịch sử dịch chuyển.

Ví dụ được giao 10, thực nhập 8: phiếu ghi 8, tồn tăng 8; yêu cầu/công việc còn 2. Lần ghi sau tự điền 2. Không đánh dấu hoàn tất hoặc tạo tồn cho 2 chưa nhận. Số 0 bỏ qua, không sinh dòng phiếu. Vượt lượng phân công/QC/tồn sẽ bị chặn; cần quản lý điều chỉnh phân công trước. Retry cùng khóa không ghi tồn lần hai.

## Hồ sơ nhập / xuất

Ngay khi có phiếu đã ghi sổ, **Hồ sơ xuất / nhập** tổng hợp yêu cầu, các phiếu, lượng đề nghị/đã ghi và từng dòng hàng, mã lô, vị trí, đơn vị, lượng thực tế. Không cần tạo thêm hồ sơ thủ công và không phải đợi nhập đủ toàn bộ yêu cầu.

Chủ xưởng chỉ xem hồ sơ thuộc xưởng mình; quản lý và giám đốc xem theo quyền. Nhân viên chỉ ghi trong phần được giao.

## Kỹ thuật và kiểm tra

- Migration `014_stock_request_execution_time`: thêm ThoiDiemThucHien trên PhieuYeuCauNhapXuat; không xóa dữ liệu hoặc suy lại ngày giờ cho chứng từ lịch sử.
- API tạo hỗ trợ workflow_source_id và sale_plan_id khi cần; server chuyển thành nguồn canonical để dùng các kiểm tra ghi sổ hiện có. Không cho client gửi đồng thời nhiều nguồn.
- requested_at là ISO có múi giờ; requested_date phải khớp ngày theo Asia/Ho_Chi_Minh. API cũ chỉ có ngày vẫn hoạt động, mặc định lịch đề nghị 08:00.
- `e2e/warehouse-request-workflow.cjs`: giao diện bốn nhánh, giờ đề nghị, quản lý gợi ý phân bổ, nhân viên sửa thực nhập và phần còn lại; mutation được mock.
- `commerce-smoke.cjs`, `production-delivery-flow.cjs`, `finished-parts-task-smoke.cjs`: ghi/chọn nguồn thật trong CSDL acceptance riêng; kiểm soát QC, nhập một phần, tồn, hồ sơ và replay.

Nhập trả NVL dư từ xưởng vẫn là nghiệp vụ riêng chưa triển khai; không dùng nhập NVL từ kế hoạch mua để thay cho nhập trả.
