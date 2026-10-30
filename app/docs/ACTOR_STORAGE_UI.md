# Giao diện theo vai trò và bố trí kho

Cập nhật tiếp theo về ba kho mỗi xưởng và khu A01–A10 thay cho ba mức vị trí mẫu: [WORKSHOP_STORAGE.md](WORKSHOP_STORAGE.md).

Đợt cập nhật ngày 30/10/2026 đối chiếu với bản đặc tả trong `review-20261029/Tuan6_WarehouseTeam_ChiDacTaUC_BoSungEntity.docx`. Không sửa nội dung hoặc cấu trúc Word trong đợt này.

## Điểm vào theo vai trò

| Vai trò | Chức năng hiển thị |
| --- | --- |
| Quản lý kho | Quản lý nhập kho, Quản lý xuất kho; xem yêu cầu, phân công theo lô và vị trí, xem chứng từ đã thực hiện; quản lý danh mục và tra cứu kho |
| Nhân viên kho | Nhập kho, Xuất kho; chỉ thực hiện phần được phân công |
| Chủ xưởng | Yêu cầu nhập/xuất kho, kế hoạch được giao, báo cáo sản xuất/thành phẩm và hồ sơ kho theo quyền hiện hành |
| Ban giám đốc | Phê duyệt kế hoạch sản xuất, phê duyệt kế hoạch mua/bán, lập đợt kiểm kê, quản lý công việc và các báo cáo theo đặc tả |
| Bộ phận lập kế hoạch | Tiếp nhận đơn hàng, lập kế hoạch và xem báo cáo được gửi đến |
| Bộ phận mua hàng | Đơn mua NVL từ kế hoạch đã duyệt; không có mục quản lý kế hoạch mua/bán |
| QC/AC, Ban kiểm kê | Các chức năng kiểm tra, kiểm kê và lập biên bản theo phân công; không có mục quản lý toàn bộ công việc của giám đốc |

Quản lý kho và nhân viên kho không dùng màn hình yêu cầu của chủ xưởng. Danh sách nhập và xuất được lọc riêng ở máy chủ; mở mã yêu cầu sai hướng bị từ chối. Việc đọc kế hoạch hoặc báo cáo làm nguồn trong một chức năng được phép không đồng nghĩa có quyền quản lý chức năng nguồn.

Quyền ghi nhận hàng thực nhận của purchaser còn chờ xác nhận riêng; xem [RECEIPT_ACTOR_REVIEW.md](RECEIPT_ACTOR_REVIEW.md). Chưa coi điểm này đã đồng bộ hoàn toàn với UC-BS04.

## Khu và vị trí lưu kho

Migration `006_storage_zones.sql` bổ sung tên khu, nhóm hàng phụ trách và độ sâu vị trí. Dữ liệu mẫu tạo khu theo 12 danh mục, mỗi khu có ba mức ngoài, giữa và trong. Không chuyển hoặc xóa tồn kho đang có ở vị trí cũ.

Khi phân công nhập kho, quản lý chọn vị trí cho từng dòng lô. Hệ thống gợi ý vị trí đúng nhóm hàng: hạn dùng xa ở phía trong, hạn dùng gần ở phía ngoài. Chọn khu có nhóm hàng không phù hợp bị từ chối. Vị trí cũ chưa gắn nhóm vẫn được sử dụng để bảo toàn dữ liệu hiện có.

Khi xuất, danh sách lô ưu tiên hạn dùng gần trước. Đây là gợi ý FEFO; không tự di chuyển hàng vật lý và không ép đổi lựa chọn lô hợp lệ của quản lý.

## Nhà cung cấp và hình ảnh

Nhà cung cấp mẫu: Nguyên liệu Tâm Anh, Thực phẩm Xuân Hoài, Nguyên liệu Minh Châu và Bao bì An Phúc. Nhãn mặt hàng cung cấp được lấy từ bảng giá từng NVL, không chỉ là mô tả trang trí. Khi mua NVL, cả giao diện và máy chủ đều kiểm tra nhà cung cấp có cung cấp đúng mặt hàng.

Quản lý cập nhật quan hệ cung cấp trong màn hình đơn vị và đơn giá NVL: nhập đơn giá để thêm nhà cung cấp cho mặt hàng, để trống để bỏ khỏi danh sách cung cấp. Các đơn mua lịch sử không bị viết lại.

Ảnh gốc được giữ nguyên. Thẻ mặt hàng dùng khung vuông thống nhất, bố cục gọn với thông tin cạnh ảnh. Ảnh danh mục thiếu được lấy từ ảnh mặt hàng thực tế. Cả ba xưởng ahtor, edxn, trnvnth đều thực hiện toàn bộ quy trình sản xuất.

## Kiểm tra

- `tests/unit/storage-queue.test.js`: vị trí theo hạn dùng, thiếu hạn dùng, thiếu vị trí phù hợp và điểm vào theo vai trò.
- `scripts/actor-storage-smoke.cjs`: kiểm tra API nhà cung cấp, phân hướng nhập/xuất và từ chối khu không phù hợp trên môi trường riêng.
- `e2e/actor-storage.cjs`: kiểm tra menu của 10 vai trò, trang bị cấm, ảnh, nhãn nhà cung cấp, bộ lọc khu và màn hình nhỏ.

Kết quả chạy thực tế được ghi riêng; việc có tệp kiểm thử không có nghĩa toàn bộ các trường hợp đã đạt.
