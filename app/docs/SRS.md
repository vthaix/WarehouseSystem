# Đặc tả yêu cầu WarehouseSystem

Bản hiện hành hợp nhất ngày 14/10/2026, theo các yêu cầu/đồng ý của chủ dự án và code hiện tại. Bản Word và bản trước hợp nhất được giữ để truy vết; không dùng chúng để ghi đè những thay đổi đã chốt ở đây. Giữ 48 UC gốc và hai luồng UC-11.01/11.02; không thêm UC-26/30/33.

## Phạm vi

Quản lý kho và sản xuất bánh ngọt đóng gói: đơn hàng, kế hoạch, mua NVL, sản xuất, QC, nhập/xuất, kiểm kê, công việc và ngoại lệ. Quản lý nhân viên/bộ phận ngoài phạm vi giao diện nghiệp vụ; dữ liệu người dùng/vai trò/phân công vẫn cần để xác thực. Không có thanh toán, hoàn tiền, vận chuyển hoặc tự mua/giao bù. Cập nhật 22/10/2026: tự tính định lượng từ công thức cấu hình, đối chiếu tồn theo KHSX và ảnh báo cáo; chi tiết [LUONG_DAT_HANG_TIEN_SAN_XUAT.md](LUONG_DAT_HANG_TIEN_SAN_XUAT.md).

Express + EJS, năm backend HTTP và web-gateway; sáu database/tài khoản MySQL cùng server. Còn FK/JOIN/view/transaction xuyên schema. Chi tiết kỹ thuật: [ARCHITECTURE.md](ARCHITECTURE.md), [STRUCTURE.md](STRUCTURE.md), [SERVICE_DATABASES.md](SERVICE_DATABASES.md).

## Quy trình hiện hành

1. Khách đặt đơn; planner tiếp nhận và lập KHSX cho xưởng. BGĐ duyệt KHSX; đơn hàng liên quan tự chuyển sang đã phê duyệt.
2. Chủ xưởng mở KHSX đã duyệt để đối chiếu NVL với tồn khả dụng. Khi đang sản xuất, có thể gửi tiến độ/sự cố cho BGĐ; báo cáo NHU_CAU còn thiếu NVL tự gửi thêm planner. Có thể chụp bảng đối chiếu hoặc dán ảnh vào mô tả báo cáo.
3. Mua nguyên vật liệu chỉ từ kế hoạch MUA đã được phê duyệt, chọn nhà cung cấp theo từng dòng. Kế hoạch mua có thể lập trực tiếp hoặc theo báo cáo nhu cầu nhưng đều phải được duyệt trước khi mua. Nhận hàng tạo lô/dòng lô, QC; phần đạt lập yêu cầu nhập, quản lý phân công, nhân viên ghi phiếu. QC không tự tạo tồn.
4. Xuất NVL lấy KHSX PLAN hoặc báo cáo NHU_CAU REPORT; kiểm nhu cầu cộng dồn, giữ chỗ và lô thực xuất.
5. Thành phẩm hoàn thành phần nào, chủ xưởng lập báo cáo thành phẩm UC-35 cho phần đó; mỗi báo cáo tạo một phần trong cùng đầu lô/KHSX, có các dòng lô riêng. Báo cáo tiến độ UC-34 không tạo phần lô. Giám đốc lập Công việc, chọn loại kiểm tra thành phẩm → lô → phần theo báo cáo đã gửi → nhân viên. QC đạt mới lập yêu cầu và phiếu nhập phần đạt.
6. Có thể lập nhiều báo cáo thành phẩm cho KHSX; mỗi báo cáo chỉ ghi lượng phần mới. Phần thường giữ KHSX IN_PROGRESS; chỉ báo cáo phần cuối có xác nhận hoàn tất mới chuyển COMPLETED. Không tạo phiếu/tồn kho trùng; NVL dùng cộng dồn không vượt đã cấp. Chi tiết [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md).
7. Planner lập BAN từ tổng kết, BGĐ duyệt. Xuất bán khi đã hoàn tất SX, đến ngày giao, còn thành phẩm QC đạt khả dụng; ghi lượng giao và trạng thái đơn. Hiện code dùng latest_delivery_date làm điều kiện ngày giao, chưa có lịch giao riêng.
8. Kiểm kê, công việc, kết luận, ngoại lệ và hàng trả vận hành theo quyền/phân công. Hàng cách ly chỉ giải phóng/loại bỏ/trả NCC sau phê duyệt; bù QC không sửa lịch sử phiếu.

## Quy tắc nghiệp vụ

| Mã | Quy tắc hiện hành |
| --- | --- |
| BR-01 | Khách đặt đơn; planner tiếp nhận trên DonHang. Chỉ sửa trước duyệt. Giám đốc duyệt từng KHSX; duyệt thành công tự cập nhật đơn nguồn sang APPROVED trong cùng transaction. Không duyệt trực tiếp đơn, không tự duyệt các KHSX khác. |
| BR-02 | KHSX gồm dòng thành phẩm/NVL chung ChiTietKeHoachSanXuat. NVL gốc tính theo công thức cấu hình × lượng từng bánh rồi cộng gộp, hoặc nhập tay; cộng 10% đúng một lần, làm tròn lên 3 chữ số thập phân. Công thức minh họa cần xác nhận trước dùng chính thức. |
| BR-03 | Một báo cáo nhu cầu hiệu lực/KHSX. Nguồn đã gửi/đã sử dụng bất biến; tồn/thiếu lấy hệ thống, không tự khai tồn. |
| BR-04 | Planner lập kế hoạch MUA bằng nhập tay hoặc import báo cáo SAN_XUAT mục đích NHU_CAU đã gửi cho planner; kế hoạch BAN lấy tổng kết THANH_PHAM. Không dùng tiến độ/sự cố làm nguồn nhu cầu. |
| BR-05 | Đơn mua mới chỉ theo kế hoạch MUA đã duyệt, tối đa một đơn/kế hoạch; ngày nhận và lượng lấy từ kế hoạch. Bộ phận lập kế hoạch không chọn nhà cung cấp; bộ phận mua hàng chọn riêng từng nguyên vật liệu. Không tạo đơn mua trực tiếp hoặc thẳng từ báo cáo để bỏ qua phê duyệt. |
| BR-06 | LoHang là đầu lô, ChiTietLo là dòng hàng. QC kiểm toàn bộ mỗi dòng, kiểm=đạt+lỗi; chỉ phần đạt được nhập AVAILABLE. Lỗi NVL trước nhập ghi trả NCC theo kết luận. |
| BR-07 | Ngoại lệ: lập → giám đốc duyệt/từ chối → quản lý áp dụng riêng; người lập không tự duyệt. Điều chỉnh hàng đã nhập cần xác nhận QC và chứng từ bù, giữ phiếu gốc. |
| BR-08 | Yêu cầu NVL PLAN hoặc REPORT; tổng yêu cầu/cấp đối chiếu cùng KHSX. Nếu đã có báo cáo nhu cầu gửi, PLAN không vượt nhu cầu thực tế. Yêu cầu không có bước duyệt riêng. |
| BR-09 | Quản lý phân công tạo giữ chỗ, không TTL. Khả dụng là lượng AVAILABLE hợp lệ trừ phần giữ chưa xuất; hủy chỉ giải phóng phần chưa ghi. Không xuất hàng cách ly/hết hạn hoặc tồn âm. |
| BR-10 | UC-34 khi chưa hoàn tất: TIEN_DO/SU_CO/NHU_CAU, BGĐ luôn nhận; NHU_CAU còn thiếu tự gửi thêm planner, tiến độ/sự cố tùy chọn thêm planner. Có thể dán ảnh/chụp đối chiếu vào mô tả. UC-35 chỉ tổng kết khi xác nhận hoàn tất toàn bộ; sản lượng là thực tế, không ép bằng dự kiến. |
| BR-11 | Kiểm kê khóa từng kho, snapshot và đếm theo dòng lô/vị trí/bucket; trống khác 0. Kết luận từng kho, mọi chênh lệch qua giám đốc duyệt, quản lý áp dụng rồi đóng đợt. |
| BR-12 | Phiếu đã ghi, biến động và lịch sử duyệt không ghi đè. Hàng khách trả theo dòng giao gốc, nhận đúng một lần vào cách ly; chưa tự giao bù/hoàn tiền. Trả NCC chưa tự tạo mua bù. |
| BR-13 | Ngày nhập mới không quá khứ theo múi giờ Việt Nam. KHSX: hôm nay ≤ bắt đầu ≤ kết thúc ≤ hạn giao đơn. MUA nhận NVL không vượt kết thúc SX/hạn giao, BAN không vượt hạn giao. Đơn PLAN lấy ngày từ kế hoạch mua, không sửa khác nguồn. Giữ nguyên ngày lịch sử của lô đã ghi khi tổng kết. |

## Yêu cầu chức năng

| Yêu cầu | UC | Chức năng | Vai trò | Module | Màn hình |
| --- | --- | --- | --- | --- | --- |
| FR-29 | UC-29 | Tiếp nhận đơn hàng | PLANNER | CustomerOrder | UI-04 / UI-05 |
| FR-06 | UC-06 | Quản lý danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-10 |
| FR-06.1 | UC-06.1 | Thêm danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-10 |
| FR-06.2 | UC-06.2 | Xóa danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-10 |
| FR-06.3 | UC-06.3 | Sửa danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-10 |
| FR-07 | UC-07 | Quản lý dữ liệu danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-11 / UI-12 |
| FR-07.1 | UC-07.1 | Thêm dữ liệu danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-11 / UI-12 |
| FR-07.2 | UC-07.2 | Xóa dữ liệu danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-11 / UI-12 |
| FR-07.3 | UC-07.3 | Sửa dữ liệu danh mục kho | WAREHOUSE_MANAGER | Catalog | UI-11 / UI-12 |
| FR-08 | UC-08 | Quản lý nhập kho | WAREHOUSE_MANAGER | Warehouse | UI-13 |
| FR-09 | UC-09 | Quản lý xuất kho | WAREHOUSE_MANAGER | Warehouse | UI-13 |
| FR-13 | UC-13 | Lập đợt kiểm kê | DIRECTOR | Stocktake | UI-19 |
| FR-17 | UC-17 | Phê duyệt đề xuất xử lý ngoại lệ | DIRECTOR | Exception | UI-22 / UI-23 |
| FR-18 | UC-18 | Xem danh sách hàng tồn kho | DIRECTOR, WORKSHOP_OWNER, WAREHOUSE_MANAGER | Reporting | UI-24 / UI-25 / UI-26 |
| FR-19 | UC-19 | Xem hồ sơ xuất kho | DIRECTOR, WORKSHOP_OWNER | Reporting | UI-24 / UI-25 / UI-26 |
| FR-20 | UC-20 | Xem hồ sơ nhập kho | DIRECTOR, WORKSHOP_OWNER | Reporting | UI-24 / UI-25 / UI-26 |
| FR-21 | UC-21 | Xem báo cáo kiểm kê | DIRECTOR | Reporting | UI-24 / UI-25 / UI-26 |
| FR-25 | UC-25 | Quản lý công việc | DIRECTOR | Task | UI-27 |
| FR-25.1 | UC-25.1 | Chỉnh sửa công việc | DIRECTOR | Task | UI-27 |
| FR-25.2 | UC-25.2 | Xóa công việc | DIRECTOR | Task | UI-27 |
| FR-31 | UC-31 | Phê duyệt kế hoạch sản xuất | DIRECTOR | ProductionPlan | UI-04 / UI-05 |
| FR-14 | UC-14 | Xem/Quản lý đơn hàng mua | PURCHASER | Purchasing | UI-08 / UI-09 |
| FR-23 | UC-23 | Yêu cầu nhập/xuất | WORKSHOP_OWNER | StockRequest | UI-16 / UI-17 |
| FR-24 | UC-24 | Quản lý yêu cầu nhập xuất | WORKSHOP_OWNER | StockRequest | UI-16 / UI-17 |
| FR-24.1 | UC-24.1 | Sửa yêu cầu | WORKSHOP_OWNER | StockRequest | UI-16 / UI-17 |
| FR-24.2 | UC-24.2 | Xóa yêu cầu | WORKSHOP_OWNER | StockRequest | UI-16 / UI-17 |
| FR-27 | UC-27 | Mua hàng | PURCHASER | Purchasing | UI-08 / UI-09 |
| FR-04 | UC-04 | Lập kế hoạch mua/bán | PLANNER | BusinessPlan | UI-06 / UI-07 |
| FR-05 | UC-05 | Quản lý kế hoạch | PLANNER | BusinessPlan | UI-06 / UI-07 |
| FR-05.1 | UC-05.1 | Sửa kế hoạch | PLANNER | BusinessPlan | UI-06 / UI-07 |
| FR-05.2 | UC-05.2 | Xóa kế hoạch | PLANNER | BusinessPlan | UI-06 / UI-07 |
| FR-10 | UC-10 | Nhập kho | WAREHOUSE_STAFF | Warehouse | UI-14 / UI-15 |
| FR-11 | UC-11 | Xuất kho | WAREHOUSE_STAFF | Warehouse | UI-14 / UI-15 |
| FR-35 | UC-35 | Báo cáo thành phẩm | WORKSHOP_OWNER | Production | UI-28 / UI-29 |
| FR-01 | UC-01 | Đăng nhập | AUTHENTICATED | Auth | UI-01 |
| FR-12 | UC-12 | Quản lý kết quả kiểm tra QC/AC | QC_INSPECTOR | Quality | UI-18 |
| FR-12.1 | UC-12.1 | Thêm kết quả kiểm tra QC/AC | QC_INSPECTOR | Quality | UI-18 |
| FR-12.2 | UC-12.2 | Sửa kết quả kiểm tra QC/AC | QC_INSPECTOR | Quality | UI-18 |
| FR-12.3 | UC-12.3 | Xóa kết quả kiểm tra QC/AC | QC_INSPECTOR | Quality | UI-18 |
| FR-34 | UC-34 | Lập phiếu báo cáo sản xuất | WORKSHOP_OWNER | Production | UI-28 / UI-29 |
| FR-15 | UC-15 | Thực hiện kiểm kê | STOCKTAKER | Stocktake | UI-20 |
| FR-28 | UC-28 | Lập biên bản kiểm kê | STOCKTAKER, QC_INSPECTOR | Stocktake | UI-21 |
| FR-32 | UC-32 | Phê duyệt kế hoạch mua/bán | DIRECTOR | BusinessPlan | UI-06 / UI-07 |
| FR-02 | UC-02 | Đặt đơn hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-03 | UC-03 | Quản lý đơn hàng khách hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-03.1 | UC-03.1 | Sửa đơn hàng khách hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-22 | UC-22 | Tra cứu dữ liệu trong kho | WAREHOUSE_MANAGER, WORKSHOP_OWNER | Catalog | UI-11 / UI-12 |
| FR-16 | UC-16 | Xử lý chênh lệch kiểm kê | WAREHOUSE_MANAGER | Exception | UI-22 / UI-23 |

Chi tiết 50 mục ở [USE_CASES.md](USE_CASES.md); triển khai/bằng chứng ở [MODULE_MATRIX.md](MODULE_MATRIX.md). Mã UI/FR là định danh truy vết, không bắt buộc mỗi mã là trang riêng.

## Yêu cầu phi chức năng

Đây là tiêu chí cần nghiệm thu, không phải các chỉ số đã đo. Hiệu năng, RPO/RTO và mọi nhánh UX chưa được chứng nhận chỉ vì test chức năng đạt.

| Mã | Yêu cầu |
| --- | --- |
| NFR-01 | Trên dữ liệu thử 10.000 mặt hàng, 100.000 dòng biến động và 20 người đồng thời, 95% truy vấn danh sách thông thường hoàn tất trong 2 giây; đo ở môi trường nghiệm thu đã ghi cấu hình |
| NFR-02 | Pagination mặc định 20, tối đa 100; lọc/sort server; export tối đa 50.000 dòng trong một lần, vượt giới hạn báo chọn lại phạm vi |
| NFR-03 | Không có số dư âm; hai request xuất cạnh tranh không vượt tồn; rollback không để lại phiếu hoặc số dư một phần |
| NFR-04 | Mật khẩu băm scrypt với salt riêng; session cookie HttpOnly, Secure ở HTTPS, SameSite=Lax; CSRF cho toàn bộ request thay đổi dữ liệu |
| NFR-05 | Đăng nhập sai giới hạn 5 lần/15 phút theo tài khoản và IP; trả lỗi chung tránh tiết lộ tên tài khoản; session hết sau 30 phút không hoạt động và tối đa 8 giờ |
| NFR-06 | Mọi thao tác duyệt, ghi sổ, hủy, sửa số đếm phải có audit; audit không chứa mật khẩu/session/CSRF token |
| NFR-07 | Kiểm thử khôi phục bản backup MySQL; đề xuất backup mỗi ngày, giữ 7 bản; RPO 24 giờ, RTO 4 giờ trong môi trường đồ án |
| NFR-08 | UI dùng tiếng Việt, thao tác được bằng bàn phím, label cho input, lỗi hiển thị gần trường, không chỉ dùng màu để phân biệt trạng thái |
| NFR-09 | Desktop là chính, form/table sử dụng được từ 768px; bảng rộng có cuộn ngang, không cắt nút quan trọng |
| NFR-10 | View không chứa SQL; controller không tự tính tồn; cùng service được gọi từ UI và API; migration/seed có thể tạo môi trường mới |
| NFR-11 | HTTPS khi triển khai, SQL parameter binding/ORM, escape nội dung hiển thị, kiểm tra file ảnh chỉ JPEG/PNG/WebP tối đa 5MB nếu có upload |
| NFR-12 | Request lỗi có request_id; health endpoint không lộ connection string hoặc thông tin nhạy cảm |

## Kịch bản nghiệm thu

| Mã | Kịch bản | Kết quả yêu cầu |
| --- | --- | --- |
| AT-01 | Khách A đổi ID sang đơn khách B | Không đọc/sửa được; CSDL giữ nguyên |
| AT-02 | Hai giám đốc duyệt cùng KHSX/version | Một thao tác có hiệu lực, thao tác kia 409 hoặc replay đúng kết quả cùng khóa |
| AT-03 | Hai request xuất mỗi request 7 trong khi tồn 10 | Chỉ một phiếu thành công; tồn cuối 3; không âm |
| AT-04 | Nhập vượt số lượng QC đạt cộng dồn | 422 hoặc 409 theo nguyên nhân; rollback toàn bộ |
| AT-05 | Lưu actual_quantity=0 và để dòng khác null | Dòng 0 là đã đếm; dòng null cản hoàn tất kho |
| AT-06 | Xuất trong kho đã bắt đầu kiểm kê | 409 WAREHOUSE_FROZEN; không tạo phiếu |
| AT-07 | Lỗi giả lập sau tạo phiếu trước cập nhật balance | Không còn phiếu, chi tiết, movement hay thay đổi balance |
| AT-08 | Gửi lại thao tác ghi sổ cùng khóa và payload | Trả kết quả cũ; không ghi thêm movement |
| AT-09 | Cùng khóa nhưng payload khác | 409 IDEMPOTENCY_CONFLICT |
| AT-10 | Sửa QC đã dùng để nhập | 409 IN_USE |
| AT-11 | Báo cáo tồn hôm qua sau khi xuất hôm nay | Giá trị hôm qua không đổi; export khớp bộ lọc |
| AT-12 | Chủ xưởng thay kế hoạch/xưởng ngoài quyền | Server chặn, không chỉ ẩn trên UI |
| AT-13 | Sửa công việc giao nhau lịch nhân viên | 409 SCHEDULE_CONFLICT |
| AT-14 | Đề xuất điều chỉnh được duyệt hai lần | Chỉ một thay đổi tồn; audit và trạng thái nhất quán |
| AT-15 | Mất mạng khi kiểm kê, phục hồi với version đã thay đổi | Không ghi đè âm thầm; hiện lựa chọn tải mới/nhập lại |
| AT-16 | Hủy form/xóa rồi bấm Không | Không request mutation hoặc không thay đổi dữ liệu |

Kiểm thêm nhập từng phần chung lô/tổng kết không trùng, đơn mua PLAN/MANUAL và REPORT lịch sử, hạn mức báo cáo/kế hoạch dùng chung, hết hạn/cách ly, bù QC/đối soát phiếu gốc, phần lỗi xử lý nhiều lần, migration giữ dữ liệu và lỗi mạng liên service. Kết quả test hiện có trong [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).

## Quyền và nguồn chuẩn

Menu không cấp quyền. Middleware/service kiểm actor mới nhất từ Identity, scope đơn khách/xưởng/phân công, version và trạng thái. Policy thực tế được sinh trong [generated/PROJECT_MANIFEST.json](generated/PROJECT_MANIFEST.json); các điều kiện scope nằm trong service tương ứng. Quyết định hiện hành: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).


Ảnh danh mục: LoaiHang.DuongDanAnh / image_path, chọn/xem trước/bỏ ảnh, PNG/JPEG/WebP ≤5 MB. Migration service 007; file ở src/images/categories, Docker lưu volume category_images. Chi tiết: [CATEGORY_IMAGES.md](CATEGORY_IMAGES.md).
