## Cập nhật nghiệp vụ kho — 14/10/2026

Đã bổ sung xử lý hàng cách ly sau QC: đề xuất, giám đốc duyệt, quản lý giải phóng phần đạt hoặc loại bỏ phần lỗi. Điều chỉnh QC hàng đã nhập đi qua đề xuất cách ly, QC xác nhận và chứng từ bù/biến động tồn; không sửa phiếu nhập/giao cũ hoặc lượng đã giao. Giải phóng hàng điều chỉnh phải tái kiểm đạt. Không tự giao bù/hoàn tiền. Migration service hiện đến 006; chỉ làm nghiệp vụ kho, quản lý nhân viên/bộ phận ngoài phạm vi. Chi tiết API/quyền/quy trình: [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md).
## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

# Đặc tả yêu cầu hệ thống quản lý kho

## Quy tắc mới nhất cho UC-34 và UC-35

UC-34 là báo cáo trong khi chưa hoàn tất sản xuất: tiến độ, sự cố hoặc thiếu NVL. Chủ xưởng ghi mô tả, tiến độ tùy chọn (dưới 100%); tiến độ/sự cố không bắt nhập dòng NVL. Khi gửi, Ban giám đốc luôn nhận; chọn thêm bộ phận lập kế hoạch khi cần phối hợp. Mỗi kế hoạch có thể có nhiều báo cáo tiến độ/sự cố. Báo cáo nhu cầu NVL giữ một hồ sơ nguồn riêng trong cùng loại SAN_XUAT để không cấp/mua trùng.

UC-35 là báo cáo thành phẩm tổng kết khi hoàn tất toàn bộ, không phải báo cáo từng đợt nhập. Chủ xưởng phải xác nhận đã hoàn tất, ghi ngày hoàn tất, thành phẩm thực tế và NVL đã dùng. Không mặc định sản lượng thực tế bằng kế hoạch. Một kế hoạch có một báo cáo tổng kết mới; gửi báo cáo đánh dấu kế hoạch COMPLETED và chặn báo cáo đang sản xuất mới. Báo cáo đã gửi bất biến.

Hai UC dùng chung bảng vật lý BanBaoCaoSanXuat, LoaiBaoCao SAN_XUAT/THANH_PHAM; các view/API hiện hữu giữ tương thích. Các mô tả cũ coi mọi báo cáo SX là nhu cầu NVL hoặc coi báo cáo thành phẩm là báo cáo từng phần được thay thế bởi mục này. Thay đổi UC-23 nhập thành phẩm từng phần cùng lô chưa thuộc đợt sửa hai UC này.

## Cập nhật được yêu cầu: tự lấy dữ liệu giữa các UC

Yêu cầu mới của chủ dự án thay thế phần bắt buộc báo cáo/kế hoạch mua cho mọi đơn mua và bắt buộc báo cáo cho mọi yêu cầu xuất NVL trong mô tả cũ bên dưới:

- Đơn hàng → kế hoạch SX: tự điền thành phẩm và lượng còn chưa lập kế hoạch.
- Kế hoạch SX → báo cáo SX: tự điền NVL đã gồm dự phòng; chủ xưởng sửa theo thực tế, hệ thống tính tồn/thiếu khi lưu/gửi, không cộng 10% lại.
- Báo cáo SX → đơn mua: lấy thiếu còn lại chưa dành cho kế hoạch/đơn khác. Đơn mua có thể nhập thủ công không gắn báo cáo, hoặc lấy kế hoạch mua đã duyệt như luồng cũ. Mua thủ công không được coi là đã đáp ứng một báo cáo nào.
- Đơn mua → nhận lô NVL: lấy lượng chưa nhận, ghi hàng thực nhận; sau QC → yêu cầu nhập lấy phần đạt chưa được yêu cầu nhập. Ghi phiếu vẫn cần phân công và kiểm tra QC.
- Xuất thành phẩm: chọn báo cáo thành phẩm và kế hoạch bán đã duyệt tương ứng; tự lấy lượng còn cần giao trong giới hạn tồn QC đạt còn khả dụng, hiển thị kết quả kiểm kê gần nhất theo lô/vị trí nếu có. Không bắt lập kiểm kê mới cho mỗi lần giao; kho đang khóa kiểm kê vẫn chặn ghi phiếu. Không lấy số đếm cộng vào tồn.
- Kế hoạch SX → xuất NVL: có thể chọn PLAN trực tiếp hoặc REPORT nhu cầu thực tế. Giới hạn yêu cầu cộng dồn theo cùng kế hoạch giữa cả hai nguồn; nếu đã có báo cáo gửi, nguồn PLAN không vượt nhu cầu thực tế đã báo cáo.

Tự lấy nguồn chỉ điền form cho người dùng kiểm tra/chỉnh sửa trước lưu, không tự ghi chứng từ hay thay đổi tồn. API lưu kiểm tra lại dữ liệu hiện hành trong transaction. Vai trò hiện hữu được giữ; thông tin bổ sung được cấp qua API lấy nguồn riêng.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

## Phạm vi và nguồn chuẩn

Bản Word đã chốt là nguồn đặc tả, 12 quy tắc BR-01…BR-12 là yêu cầu bổ sung đã được chủ đề tài xác nhận. Không sửa Word trong lượt này. Giữ đủ 48 mã UC gốc; UC-11.01/UC-11.02 là hai luồng con đã có trong Word của UC-11, không tự nâng số UC gốc thành 50. Không bổ sung UC-26/30/33. UC-04 trong Word có nhánh lập kế hoạch sản xuất; UI-30/SUP-01 là phần hỗ trợ màn hình của nhánh này, không tạo UC mới.

Hệ thống kho, mua, sản xuất, QC và kiểm kê. Code hiện dùng Express MVC/EJS và MySQL, có demo bộ nhớ riêng. Đây là hiện trạng kỹ thuật, không đồng nghĩa toàn bộ yêu cầu đã đạt. Kế toán, thanh toán, công thức bồi thường, BOM tự động và vận chuyển chưa được bổ sung vào phạm vi.

## Quy trình nghiệp vụ theo Word



Khách hàng đăng nhập vào hệ thống và thực hiện đặt đơn hàng tại **UC-02**. Hệ thống ghi nhận thông tin đơn hàng trong `DonHang`, còn mặt hàng, số lượng và đơn giá được lưu trong `ChiTietDonHang`. Khách hàng sử dụng **UC-03** để xem, quản lý đơn hàng và **UC-03.1** để sửa đơn trong trạng thái được phép chỉnh sửa. Bộ phận lập kế hoạch thực hiện **UC-29** để tiếp nhận đơn, kiểm tra thông tin và xác định nhu cầu sản xuất; việc tiếp nhận cập nhật trên đơn hàng hiện có, không tạo thêm phiếu tiếp nhận riêng.

Sau khi tiếp nhận đơn hàng, bộ phận lập kế hoạch lập kế hoạch sản xuất dự kiến dựa trên `DonHang` và `ChiTietDonHang`, đồng thời xác định xưởng thực hiện trong `Xuong`. Kế hoạch được lưu trong `KeHoachSanXuat`; các dòng thành phẩm cần sản xuất và NVL dự kiến cần sử dụng được lưu chung trong `ChiTietKeHoachSanXuat`, phân biệt bằng `LoaiChiTiet`. Dòng thành phẩm ghi số lượng cần sản xuất; dòng NVL ghi số lượng cần thiết và số lượng còn thiếu dự kiến. Nhu cầu NVL dự kiến cộng thêm 10% một lần cho từng loại NVL; thuật toán/định mức và làm tròn chưa được mô tả đầy đủ (D-02); đơn vị tính lấy từ `MatHang`. Không tạo entity chi tiết NVL kế hoạch riêng. Ban giám đốc thực hiện **UC-31** để xem xét đơn hàng và kế hoạch sản xuất liên quan; việc duyệt đồng thời cần xác nhận tại D-11. Kế hoạch sản xuất là căn cứ định hướng ban đầu, không thay thế báo cáo nhu cầu thực tế của xưởng.

Khi nhận kế hoạch đã được phê duyệt, chủ xưởng thực hiện **UC-22** để tra cứu NVL đang có trong kho, sử dụng dữ liệu từ `TonKho`, `ChiTietLo` và `MatHang`. Việc đối chiếu sử dụng lượng tồn khả dụng, tức phần tồn đang rảnh có thể cấp cho đợt sản xuất, không tính phần đã dành cho nhu cầu khác. Chủ xưởng đối chiếu lượng NVL cần thiết với lượng tồn khả dụng để xác định lượng có thể sử dụng và lượng còn thiếu. Sau đó, chủ xưởng thực hiện **UC-34** để lập báo cáo sản xuất trong `BanBaoCaoSanXuat`, với `LoaiBaoCao=SAN_XUAT`, tham chiếu `KeHoachSanXuat` và `Xuong`. Từng mặt hàng, lượng NVL cần thiết và lượng còn thiếu thực tế được lưu trong `ChiTietBaoCaoSanXuat`. Báo cáo này được lập cả khi đủ và khi thiếu NVL; trường hợp đủ NVL thì số lượng còn thiếu bằng 0. Báo cáo sản xuất là căn cứ thực tế để đề nghị mua bổ sung và lập yêu cầu xuất NVL cho xưởng.

Nếu báo cáo sản xuất có NVL còn thiếu, bộ phận lập kế hoạch thực hiện **UC-04** để lập kế hoạch mua bổ sung. Kế hoạch được lưu trong `KeHoachMuaBan`, có `LoaiKeHoach=MUA` và tham chiếu báo cáo sản xuất nguồn bằng `MaBaoCao`; danh sách NVL và số lượng cần mua được lưu trong `ChiTietKeHoachMuaBan`. Nhu cầu mua lấy từ phần thiếu thực tế của báo cáo sản xuất, không lấy trực tiếp từ kế hoạch sản xuất ban đầu và không cộng thêm 10% lần nữa. **UC-05, UC-05.1 và UC-05.2** dùng để quản lý, sửa hoặc xóa kế hoạch trong trạng thái được phép. Ban giám đốc thực hiện **UC-32** để phê duyệt kế hoạch mua. Nếu báo cáo không có NVL còn thiếu thì không phát sinh kế hoạch mua bổ sung cho nhu cầu đó.

Sau khi kế hoạch mua được phê duyệt, bộ phận mua hàng thực hiện **UC-27** để tạo đơn mua NVL trong `DonMuaHang`, với các dòng mua lưu trong `ChiTietDonMuaHang`. Đơn mua liên kết kế hoạch mua đã duyệt và đồng thời tham chiếu báo cáo sản xuất làm phát sinh nhu cầu. Báo cáo được tham chiếu trên đơn mua phải trùng với báo cáo nguồn của kế hoạch mua; chỉ kế hoạch loại MUA mới được dùng để tạo đơn mua NVL. Thông tin nhà cung cấp lấy từ `NhaCungCap`, còn giá mua và điều kiện giao hàng được bổ sung khi lập đơn. Bộ phận mua hàng sử dụng **UC-14** để xem và quản lý đơn mua.

Khi nhà cung cấp giao NVL, thông tin hàng thực nhận được đối chiếu với đơn mua và ghi nhận bằng `LoHang`, `LoNguyenVatLieu` và `ChiTietLo`. Bộ phận QC/AC thực hiện **UC-12.1** để ghi kết quả kiểm tra vào `KetQuaKiemTraQCAC` và `ChiTietKetQuaKiemTraQCAC`, xác định lượng kiểm tra, lượng đạt và lượng lỗi của từng dòng lô. **UC-12, UC-12.2 và UC-12.3** phục vụ quản lý, sửa và xóa kết quả theo trạng thái cho phép. Ngay khi có kết luận QC/AC, phần NVL đạt được chuyển sang bước nhập kho tại **UC-10**, tạo `PhieuKho` loại nhập và `ChiTietPhieuKho`, sau đó cập nhật `TonKho`. Phần không đạt được xử lý trả nhà cung cấp ngay theo kết luận kiểm tra, không đưa vào tồn khả dụng cho sản xuất. Nếu có tình huống cần xử lý ngoại lệ, quản lý lập đề xuất để Ban giám đốc xem xét tại **UC-17**.

Khi cần NVL để sản xuất, chủ xưởng thực hiện **UC-23** để lập yêu cầu xuất dựa trên dữ liệu trong báo cáo sản xuất thực tế. Yêu cầu được lưu trong `PhieuYeuCauNhapXuat`, tham chiếu báo cáo bằng `MaBaoCao` và xưởng nhận bằng `MaXuong`; các mặt hàng và lượng yêu cầu được lưu trong `ChiTietPhieuYeuCauNhapXuat`. Không lấy trực tiếp lượng xuất từ kế hoạch sản xuất dự kiến. Lượng yêu cầu từng lần phải đối chiếu với nhu cầu thực tế trong báo cáo và lượng đã được cấp, tránh yêu cầu trùng. **UC-24, UC-24.1 và UC-24.2** phục vụ quản lý, sửa và hủy hoặc xóa yêu cầu trong trạng thái được phép. Nhân viên kho thực hiện **UC-11.01** để xuất NVL theo yêu cầu, chọn các lô thực xuất, tạo `PhieuKho` loại xuất và `ChiTietPhieuKho`, đồng thời cập nhật giảm tồn kho. Phiếu yêu cầu ghi lượng đề nghị; phiếu kho ghi lượng và lô thực tế đã xuất. Việc xuất chỉ thực hiện với lượng tồn khả dụng đủ điều kiện.

Sau khi sản xuất hoàn thành, chủ xưởng thực hiện **UC-35** để lập báo cáo thành phẩm. Báo cáo tiếp tục được lưu trong `BanBaoCaoSanXuat`, nhưng có `LoaiBaoCao=THANH_PHAM`, tham chiếu kế hoạch sản xuất và xưởng thực hiện. `ChiTietBaoCaoSanXuat` ghi lượng thành phẩm thực tế và lượng NVL đã sử dụng; trường hợp cần theo dõi NVL hoặc thành phẩm theo lô thì sử dụng `ChiTietLoBaoCaoSanXuat`. Thành phẩm được ghi nhận bằng `LoHang`, `LoThanhPham` và `ChiTietLo`. QC/AC kiểm tra chất lượng thành phẩm trước khi nhập kho. Chủ xưởng có thể lập yêu cầu nhập thành phẩm tại **UC-23**, tham chiếu báo cáo thành phẩm; nhân viên kho thực hiện **UC-10** để ghi nhận phần thành phẩm đạt chất lượng bằng phiếu nhập và cập nhật tồn kho. Phần thành phẩm lỗi được xử lý theo kết luận QC/AC hoặc trình phê duyệt ngoại lệ khi cần.

Bộ phận lập kế hoạch sử dụng báo cáo thành phẩm để lập kế hoạch bán tại **UC-04**. Kế hoạch bán được lưu trong `KeHoachMuaBan`, có `LoaiKeHoach=BAN`, tham chiếu báo cáo thành phẩm nguồn; danh sách thành phẩm và số lượng dự kiến bán nằm trong `ChiTietKeHoachMuaBan`. Khi xác định lượng có thể bán và giao, bộ phận lập kế hoạch đối chiếu kết quả sản xuất với lượng thành phẩm đạt chất lượng, đã nhập kho và còn khả dụng. Kế hoạch bán được quản lý tại **UC-05, UC-05.1, UC-05.2** và trình Ban giám đốc phê duyệt tại **UC-32**. Như vậy, kế hoạch MUA lấy nguồn từ báo cáo sản xuất, còn kế hoạch BAN lấy nguồn từ báo cáo thành phẩm; hai trường hợp dùng chung entity nhưng phải kiểm tra đúng loại báo cáo nguồn.

Khi giao thành phẩm cho khách hàng, nhân viên kho thực hiện **UC-11.02**, đối chiếu đơn hàng, các dòng hàng và kế hoạch bán đã được phê duyệt, lựa chọn lô thành phẩm đạt chất lượng còn khả dụng để lập `PhieuKho` loại xuất và `ChiTietPhieuKho`. Hệ thống ghi nhận lượng giao thực tế, cập nhật tồn kho và trạng thái thực hiện đơn hàng tương ứng. Quản lý kho sử dụng **UC-08** và **UC-09** để quản lý phiếu nhập, phiếu xuất. Ban giám đốc và chủ xưởng sử dụng **UC-19** và **UC-20** để xem hồ sơ xuất, nhập kho được tổng hợp từ các phiếu; không tạo entity hồ sơ riêng.

Ngoài luồng mua NVL, sản xuất và giao thành phẩm, Ban giám đốc thực hiện **UC-13** để lập đợt kiểm kê. Ban kiểm kê thực hiện **UC-15** để ghi số đếm thực tế và đối chiếu tồn hệ thống trong `PhieuKiemKe`, `ChiTietPhieuKiemKe`. Ban kiểm kê hoặc bộ phận QC/AC thực hiện **UC-28** để lập biên bản từ kết quả kiểm kê; với domain hiện tại, nội dung kết luận và ghi chú được lưu trên phiếu kiểm kê, không tạo thêm entity biên bản. Quản lý kho thực hiện **UC-16** để xử lý chênh lệch. Nếu chênh lệch hoặc hàng lỗi cần Ban giám đốc quyết định, đề xuất được lưu trong `BanDeXuatXuLyNgoaiLe`, kết quả phê duyệt tại **UC-17** được lưu trong `KetQuaXuLyNgoaiLe`. Ban giám đốc sử dụng **UC-18** để xem danh sách tồn kho và **UC-21** để xem báo cáo kiểm kê. Các chức năng quản lý danh mục kho, dữ liệu danh mục và công việc tiếp tục hoạt động độc lập theo đặc tả hiện có.


## 5 Yêu cầu chức năng và truy vết


Mỗi UC dưới đây là một yêu cầu chức năng bắt buộc. Mã FR tương ứng mã UC; các UC con vẫn là yêu cầu độc lập. Các tiêu chí nghiệm thu chung: actor hợp lệ thao tác thành công; actor không có quyền bị chặn; dữ liệu không hợp lệ không làm thay đổi CSDL; thao tác hủy giữ nguyên dữ liệu; thông báo và trạng thái phản ánh kết quả server.

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
| FR-31 | UC-31 | Phê duyệt đơn hàng | DIRECTOR | CustomerOrder | UI-04 / UI-05 |
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


## Quy tắc nghiệp vụ đã chốt

| Quy tắc | Nội dung đã chốt và giới hạn |
| --- | --- |
| BR-01 Tiếp nhận đơn | UC-29 cập nhật trạng thái DonHang thành đã tiếp nhận, chờ UC-31 phê duyệt. Không tạo phiếu tiếp nhận riêng. |
| BR-02 Chi tiết kế hoạch và dự phòng | ChiTietKeHoachSanXuat chứa dòng THANH_PHAM và NGUYEN_VAT_LIEU qua LoaiChiTiet. Nhu cầu NVL dự kiến = nhu cầu gốc × 1,10, chỉ áp dụng một lần. Không có entity chi tiết NVL kế hoạch riêng. Quy tắc làm tròn cần chốt D-02. |
| BR-03 Báo cáo chung | BanBaoCaoSanXuat phân biệt SAN_XUAT và THANH_PHAM bằng LoaiBaoCao, liên kết KeHoachSanXuat và Xuong. SAN_XUAT được lập cả khi đủ và thiếu NVL; thiếu = max(0, nhu cầu thực tế − tồn khả dụng đối chiếu). Báo cáo không tự thay đổi tồn. |
| BR-04 Nguồn mua và bán | KeHoachMuaBan MUA lấy phần thiếu thực tế từ báo cáo SAN_XUAT; BAN lấy nguồn báo cáo THANH_PHAM và đối chiếu đơn khách, QC, tồn khả dụng. Không mua trực tiếp từ kế hoạch dự kiến; không cộng 10% lần nữa. |
| BR-05 Đơn mua và giới hạn cộng dồn | DonMuaHang chỉ tạo từ kế hoạch MUA đã duyệt, tham chiếu cùng MaBaoCao. Tổng lượng mua có hiệu lực theo báo cáo/mặt hàng không vượt phần thiếu; kiểm lại lúc tạo, sửa, duyệt và mua, trong transaction chống cạnh tranh. Chính sách tính đơn bị hủy/trả hàng và nhiều đơn cho một kế hoạch cần chốt D-04. |
| BR-06 Lô nhiều mặt hàng | LoHang 1–N ChiTietLo; mỗi dòng tham chiếu MatHang. LoNguyenVatLieu, LoThanhPham, LoHangTraVe là các chuyên biệt của LoHang trong domain Word; không phải ba cách gọi tùy ý của một mặt hàng. Lựa chọn bảng vật lý và ý nghĩa hàng trả cần chốt D-05. |
| BR-07 QC từng dòng | ChiTietKetQuaKiemTraQCAC tham chiếu ChiTietLo. Lượng kiểm tra = lượng đạt + lượng lỗi. Chỉ phần đạt được chuyển UC-10 nhập kho; tổng nhập không vượt phần đạt chưa nhập. Lỗi trả NCC hoặc xử lý ngoại lệ, không thuộc tồn khả dụng. Không tự giảm tồn cho lượng lỗi chưa từng nhập. |
| BR-08 Xuất NVL thực tế | UC-23 tạo PhieuYeuCauNhapXuat từ báo cáo SAN_XUAT; ChiTietPhieuYeuCauNhapXuat ghi lượng đề nghị theo mặt hàng. UC-11.01 ghi lượng và ChiTietLo thực xuất trong ChiTietPhieuKho. Chặn cấp trùng/vượt nhu cầu thực tế, xét cả phần đã cấp và cam kết đang có hiệu lực. SoLuongConThieu dùng mua, không phải lượng mặc nhiên xuất. |
| BR-09 Tồn và giữ chỗ | Tồn khả dụng = lượng đã nhập và đạt QC, còn hạn, đủ điều kiện giao dịch − lượng giữ chỗ có hiệu lực; phần lỗi/cách ly không cộng vào. Giữ chỗ chưa làm giảm tồn vật lý, ghi xuất giảm tồn và tiêu thụ giữ chỗ đúng một lần. Thời điểm giữ/giải phóng và phạm vi khóa kiểm kê còn cần chốt D-01/D-07; phương án ở mục dưới là đề xuất. |
| BR-10 Hồ sơ kho | UC-19/20 đọc tổng hợp từ PhieuKho và ChiTietPhieuKho, liên kết ChiTietLo/MatHang/Kho. Không entity hồ sơ riêng, không ghi movement hoặc số lượng lần hai khi tổng hợp. |
| BR-11 Kết luận kiểm kê | UC-28 do Ban kiểm kê hoặc Bộ phận QC/AC thực hiện trong phạm vi được phân công; lưu kết luận, nhận xét, trạng thái trên PhieuKiemKe. ChiTietPhieuKiemKe lưu số đếm theo dòng lô. Không entity biên bản riêng; vẫn giữ mã UC-15 và UC-28. |
| BR-12 Ngoại lệ và lịch sử | Thống nhất BanDeXuatXuLyNgoaiLe 1–N KetQuaXuLyNgoaiLe. UC-17 thuộc Ban giám đốc; mỗi quyết định lưu người, thời điểm, kết quả, lý do, phiên bản nguồn và phương án. Giữ lịch sử, không ghi đè quyết định cũ. Duyệt khác thực hiện vật lý; hạn mức UC-16 và vòng sửa/gửi lại cần chốt D-08/D-09. |

## Tồn khả dụng và giữ chỗ

[ĐÃ CHỐT] Tính theo kho/vị trí/ChiTietLo và đơn vị của MatHang. Không cộng chung các đơn vị khác nhau. Lượng đã giữ không thể được phân bổ lại cho yêu cầu khác. Kiểm nhu cầu nguồn và số dư phải thực hiện nguyên tử, không chỉ kiểm lúc mở form. Preview và báo cáo thiếu là ảnh đối chiếu tại thời điểm đọc, không chứng minh lượng tồn đã dành riêng cho xưởng.

[ĐỀ XUẤT, D-01] Chỉ giữ chỗ khi quản lý kho xác nhận phân bổ lô; xem preview/lưu nháp/gửi yêu cầu không giữ. Khóa nguồn nhu cầu, yêu cầu và các dòng tồn theo thứ tự ổn định, rồi kiểm `giữ mới <= tồn đủ điều kiện - giữ đang hiệu lực`. Khi xuất một phần: giảm tồn vật lý và giảm giữ tương ứng trong cùng transaction. Hủy hoặc đổi phân bổ chưa xuất: giải phóng phần chưa dùng đúng một lần; phần đã xuất giữ lịch sử, không hoàn tồn tự động. Hủy yêu cầu cần kiểm lượng đã xuất và phần cam kết còn lại. Lỗi transaction không tạo giữ/phiếu một phần. Không tự đặt thời hạn hết giữ hoặc giải phóng vì mất phiên khi chưa chốt.

[ĐỀ XUẤT, D-03] Theo mỗi báo cáo/mặt hàng: `nhu cầu còn cấp = nhu cầu thực tế - đã xuất hợp lệ - lượng yêu cầu khác đang cam kết`; cam kết nhu cầu khác giữ chỗ lô. Phải chốt trạng thái nào bắt đầu cam kết, cách hợp nhất nhiều báo cáo của cùng kế hoạch và ảnh hưởng hoàn trả NVL. Tồn bổ sung làm thay đổi khả năng cấp; không âm thầm viết lại báo cáo nguồn đã gửi.

## Trạng thái nghiệp vụ và quyền

| Đối tượng | Trạng thái trong Word | Ràng buộc và điểm mở |
| --- | --- | --- |
| DonHang | Chờ tiếp nhận → Đã tiếp nhận, chờ duyệt → Đã duyệt / Từ chối | UC-29 không đồng nghĩa UC-31; sửa chỉ trạng thái được phép, cần D-10 |
| KeHoachSanXuat | Nháp / Chờ duyệt / Đã duyệt / Đang thực hiện / Hoàn thành | Duyệt cùng đơn và xử lý kế hoạch khi đơn bị từ chối cần D-11 |
| BanBaoCaoSanXuat | Nháp → Đã gửi | LoaiBaoCao quyết định nguồn; sửa/gửi lại sau phát sinh cần D-03 |
| KeHoachMuaBan | Chờ duyệt → Đã duyệt / Từ chối; xử lý/hủy theo quyền | Duyệt không tự nhập/xuất; mã enum vật lý cần ánh xạ |
| PhieuYeuCauNhapXuat | Chờ duyệt / Chờ xử lý; Đang xử lý / Một phần / Hoàn tất / Hủy | Word dùng hai tên ban đầu; chưa xác nhận người duyệt hoặc bỏ duyệt, D-06 |
| PhieuKho | Đã ghi sổ | Không sửa số lượng lịch sử trực tiếp; cách bù sai cần D-13 |
| PhieuKiemKe | Được lập → Đếm → Hoàn tất đếm → Lưu kết luận / Gửi | Có kết luận không tự điều chỉnh tồn; phạm vi theo kho cần D-07 |
| BanDeXuatXuLyNgoaiLe | Chờ phê duyệt → Đã duyệt / Từ chối | Ban giám đốc duyệt UC-17, lưu KetQuaXuLyNgoaiLe mỗi quyết định |

[ĐỀ XUẤT, D-09] Ngoại lệ có NHAP → CHO_PHE_DUYET → DA_DUYET hoặc TU_CHOI; bản từ chối sửa thành phiên bản mới rồi gửi lại; trạng thái thực hiện CHUA_THUC_HIEN / DANG_THUC_HIEN / DA_THUC_HIEN / THAT_BAI tách khỏi kết quả duyệt. Mỗi lần duyệt/từ chối lưu append-only lịch sử; đối chiếu phiên bản và khóa đề xuất để chống hai quyết định cạnh tranh. Người đề xuất không tự được quyền duyệt. Việc kiểm tra người duyệt có thể trùng người đề xuất cần xác nhận, không suy ra từ vai trò.

Quyền theo Word: UC-22 Quản lý kho và Chủ xưởng; UC-28 Ban kiểm kê và Bộ phận QC/AC; UC-18 Ban giám đốc, Chủ xưởng, Quản lý kho. Quyền xem không cấp quyền ghi phiếu/QC hoặc truy cập mọi xưởng. Phạm vi kho dùng chung chưa được chốt (D-12).

## Yêu cầu phi chức năng và kịch bản nghiệm thu giữ lại

Các NFR/AT dưới đây là mục tiêu kiểm thử, không phải kết quả đã đo. Chính sách bổ sung trong mục còn mở chưa được công nhận đã chốt.



Các mục tiêu định lượng dưới đây là [ĐỀ XUẤT] nghiệm thu, chưa phải kết quả đo hoặc thông số hệ thống đã có.

| Mã | Yêu cầu và cách kiểm tra |
| --- | --- |
| NFR-01 | Trên dữ liệu thử 10.000 mặt hàng, 100.000 dòng biến động và 20 người đồng thời, 95% truy vấn danh sách thông thường hoàn tất trong 2 giây; đo ở môi trường nghiệm thu đã ghi cấu hình |
| NFR-02 | Pagination mặc định 20, tối đa 100; lọc/sort server; export tối đa 50.000 dòng trong một lần, vượt giới hạn báo chọn lại phạm vi |
| NFR-03 | Không có số dư âm; hai request xuất cạnh tranh không vượt tồn; rollback không để lại phiếu hoặc số dư một phần |
| NFR-04 | Mật khẩu băm bằng cơ chế chuẩn framework; session cookie HttpOnly, Secure ở HTTPS, SameSite=Lax; CSRF cho toàn bộ request thay đổi dữ liệu |
| NFR-05 | Đăng nhập sai giới hạn 5 lần/15 phút theo tài khoản và IP; trả lỗi chung tránh tiết lộ tên tài khoản; session hết sau 30 phút không hoạt động và tối đa 8 giờ |
| NFR-06 | Mọi thao tác duyệt, ghi sổ, hủy, sửa số đếm phải có audit; audit không chứa mật khẩu/session/CSRF token |
| NFR-07 | Kiểm thử khôi phục bản backup MySQL; đề xuất backup mỗi ngày, giữ 7 bản; RPO 24 giờ, RTO 4 giờ trong môi trường đồ án |
| NFR-08 | UI dùng tiếng Việt, thao tác được bằng bàn phím, label cho input, lỗi hiển thị gần trường, không chỉ dùng màu để phân biệt trạng thái |
| NFR-09 | Desktop là chính, form/table sử dụng được từ 768px; bảng rộng có cuộn ngang, không cắt nút quan trọng |
| NFR-10 | View không chứa SQL; controller không tự tính tồn; cùng service được gọi từ UI và API; migration/seed có thể tạo môi trường mới |
| NFR-11 | HTTPS khi triển khai, SQL parameter binding/ORM, escape nội dung hiển thị, kiểm tra file ảnh chỉ JPEG/PNG/WebP tối đa 5MB nếu có upload |
| NFR-12 | Request lỗi có request_id; health endpoint không lộ connection string hoặc thông tin nhạy cảm |

## 8 Tiêu chí kiểm thử trọng yếu

| Mã | Kịch bản | Kết quả mong đợi |
| --- | --- | --- |
| AT-01 | Khách A đổi ID sang đơn khách B | Không đọc/sửa được; CSDL giữ nguyên |
| AT-02 | Hai giám đốc duyệt cùng đơn/version | Một thao tác có hiệu lực, thao tác kia 409 hoặc replay đúng kết quả cùng khóa |
| AT-03 | Hai request xuất mỗi request 7 trong khi tồn 10 | Chỉ một phiếu thành công; tồn cuối 3; không âm |
| AT-04 | Nhập vượt số lượng QC đạt cộng dồn | 422 hoặc 409 theo nguyên nhân; rollback toàn bộ |
| AT-05 | Lưu actual_quantity=0 và để dòng khác null | Dòng 0 là đã đếm; dòng null cản hoàn tất kho |
| AT-06 | Xuất trong kho đã bắt đầu kiểm kê | 409 WAREHOUSE_FROZEN; không tạo phiếu |
| AT-07 | Lỗi giả lập sau tạo phiếu trước cập nhật balance | Không còn phiếu, chi tiết, movement hay thay đổi balance |
| AT-08 | Gửi lại thao tác ghi sổ cùng khóa và payload | Trả kết quả cũ; không ghi thêm movement |
| AT-09 | Cùng khóa nhưng payload khác | 409 IDEMPOTENCY_CONFLICT |
| AT-10 | Sửa QC đã dùng để nhập | 409 RESOURCE_IN_USE |
| AT-11 | Báo cáo tồn hôm qua sau khi xuất hôm nay | Giá trị hôm qua không đổi; export khớp bộ lọc |
| AT-12 | Chủ xưởng thay kế hoạch/xưởng ngoài quyền | Server chặn, không chỉ ẩn trên UI |
| AT-13 | Sửa công việc giao nhau lịch nhân viên | 409 SCHEDULE_CONFLICT |
| AT-14 | Đề xuất điều chỉnh được duyệt hai lần | Chỉ một thay đổi tồn; audit và trạng thái nhất quán |
| AT-15 | Mất mạng khi kiểm kê, phục hồi với version đã thay đổi | Không ghi đè âm thầm; hiện lựa chọn tải mới/nhập lại |
| AT-16 | Hủy form/xóa rồi bấm Không | Không request mutation hoặc không thay đổi dữ liệu |


## Kiểm thử bổ sung cho quy trình mới

- Kế hoạch NVL gốc 100 → dự kiến 110; tạo báo cáo/mua không đổi thành 121. Thử lưu/sửa/gửi lại nhiều lần không nhân lặp 10%.
- Báo cáo cần 110, khả dụng 80 → thiếu 30; đủ 110 → thiếu 0 và vẫn lập báo cáo; trường hợp thiếu 0 không cho mua bổ sung.
- Hai kế hoạch hoặc hai đơn mua cùng nhu cầu thiếu 30, mỗi bên mua 20: chỉ tổng có hiệu lực tối đa 30; kiểm MySQL đồng thời, rollback và replay.
- Một lô có hai mặt hàng; QC, nhập, giữ và xuất từng ChiTietLo không lẫn dòng. Lượng kiểm 100, đạt 80, lỗi 20: tối đa nhập khả dụng 80.
- Hai yêu cầu dùng tồn 10, mỗi yêu cầu 7: không cùng giữ/xuất 14. Xuất một phần, hủy phần còn, retry và lỗi giữa transaction không cấp trùng.
- Hồ sơ nhập/xuất và kết luận kiểm kê không phát sinh bảng nghiệp vụ hoặc biến động tồn lần hai.
- Hai giám đốc duyệt cùng ngoại lệ: một quyết định có hiệu lực, lịch sử và tồn nhất quán. Lỗi chưa nhập không tạo movement giảm tồn.

## Tài liệu chi tiết

[USE_CASES.md](USE_CASES.md) giữ luồng chi tiết của Word; [DOMAIN_MODEL.md](DOMAIN_MODEL.md) định nghĩa domain; [DATABASE.md](DATABASE.md), [API.md](API.md), [UI_SPEC.md](UI_SPEC.md) mô tả mục tiêu kỹ thuật. [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md) tập hợp mâu thuẫn; [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) là việc làm sau chốt, không phải code đã hoàn thành.

## Điều kiện xác thực chung AUTH-01

Theo Word, actor phải đăng nhập và có quyền/phạm vi phù hợp. UC-01 là đăng nhập; các UC con extend dùng phiên hiện hữu, không yêu cầu đăng nhập lại. Giữ mã UC, không thêm actor Người dùng vào sơ đồ hiện có trong lượt docs.
