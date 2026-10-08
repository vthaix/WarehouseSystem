# Mô tả công việc

Sau khi khách hàng đăng nhập hệ thống (UC-01), khách hàng sẽ đặt đơn hàng (UC-02) và có thể quản lý đơn hàng (UC-03), trong đó nếu cần có thể sửa đơn hàng khách hàng (UC-03.1). Bộ phận lập kế hoạch sau khi nhận đơn hàng mới (UC-29) sẽ lập kế hoạch sản xuất cho đơn hàng, kế hoạch sẽ bao gồm mã đơn, số lượng, loại hàng, ngày nhận dự kiến, chọn xưởng phụ trách và gửi cho ban giám đốc. Ban giám đốc sẽ thấy đơn hàng đó ở trạng thái là đang chờ phê duyệt, lúc này giám đốc nếu phê duyệt đơn hàng (UC-31) thì đơn hàng bên khách hàng sẽ thấy trạng thái đã tiếp nhận. Sau khi kế hoạch được lập, bộ phận lập kế hoạch có thể quản lý kế hoạch (UC-05), trong đó có thể sửa kế hoạch (UC-05.1) hoặc xóa kế hoạch (UC-05.2) khi cần. Lúc này chủ xưởng tại xưởng được phụ trách sẽ nhận được thông báo về kế hoạch sản xuất mới. Lúc này chủ xưởng sẽ ước lượng số lượng NVL cần cho lô hàng, và sau đó gửi báo cáo qua lập phiếu báo cáo sản xuất (UC-34) số lượng tồn kho, số lượng cần thiết cho bộ phận lập kế hoạch kèm theo ghi chú yêu cầu nhập NVL để yêu cầu nhập thêm NVL (UC-23) và có thể quản lý qua UC-24, trong đó có thể sửa yêu cầu (UC-24.1) hoặc xóa yêu cầu (UC-24.2). Bộ phận lập kế hoạch sẽ lập kế hoạch mua NVL (UC-04) gồm chọn nhà CC, loại NVL, số lượng,... và gửi cho Ban giám đốc, ban giám đốc sẽ dựa vào đó xác định có nên mua NVL không (UC-32). Nếu ban giám đốc phê duyệt thì bộ phận mua hàng sẽ nhận được thông báo mua NVL, bộ phận mua hàng có thể dựa vào dữ liệu trong phiếu yêu cầu mua NVL đó để mua NVL (UC-27) và sẽ quản lý đơn mua trong UC-14. (phần không thể hiện) Sau khi mua, nhà cung cấp sẽ gọi điện cho giám đốc để xác nhận và bàn về ngày giao hàng, giá cả,.... Lúc này ban giám đốc sẽ dựa vào đó để lập đợt kiểm kê (UC-13) gồm chọn loại kiểm kê là kiểm tra chất lượng, phân công nhân viên, chọn ngày, địa điểm,... (tbl CongViec) (lưu ý lập đợt kiểm kê sẽ bao gồm kiểm kê tồn kho, thành phẩm, kiểm tra chất lượng QC...). Giám đốc có thể quản lý công việc bằng cách chọn công việc đã lập và thao tác sửa xóa trên nó (UC-25), trong đó có chỉnh sửa công việc (UC-25.1) và xóa công việc (UC-25.2). Sau khi lô NVL về đợt kiểm tra chất lượng sẽ ngay lập tức diễn ra tuy nhiên không đưa vào hệ thống. QCAC sẽ xác định những phần pass và phần lỗi, phần lỗi sẽ ngay lập tức trả về cho bộ phận giao hàng của NCC. Phần lỗi sẽ được thêm vào kết quả kiểm tra QC/AC (UC-12, UC-12.1) và có thể sửa (UC-12.2), xóa (UC-12.3) trên kết quả kiểm tra và gửi cho ban giám đốc. Phần pass sẽ được chủ xưởng yêu cầu nhập kho (UC-23) và quản lý tiếp nhận yêu cầu nhập kho, quản lý và điều phối nhân viên kho nhập kho (UC-08). Ban giám đốc có thể xem kết quả kiểm tra. (Phần này không thể hiện) Sau khi đơn hàng được sản xuất thành lô thành phẩm, chủ xưởng sẽ viết biên bản báo cáo thành phẩm (UC-35) gồm số lượng bao nhiêu, sử dụng bao nhiêu NVL, ngày hoàn thành, hạn sử dụng của lô và ghi chú. Ban giám đốc sẽ lại đợt kiểm kê cho ban QC/AC kiểm tra lô thành phẩm và tiếp tục báo cáo thành phẩm y hệt lúc báo cáo NVL, khi báo cáo thành phẩm sẽ không có trả hàng mà QC/AC sẽ nhập vào ghi chú tình trạng và gửi cho Ban giám đốc, lúc này ban giám đốc có thể phê duyệt đề xuất xử lý ngoại lệ trong ghi chú (UC-17). Sau khi kiểm tra những thành phẩm đạt chất lượng sẽ được chủ xưởng yêu cầu xuất kho (UC-23) và chọn quản lý, công việc, ngày xuất dựa vào thời gian mà khách hàng muốn nhận dự kiến gửi cho quản lý kho để quản lý kho (UC-09) theo dõi và điều phối nhân viên kho xuất kho (UC-11), nhân viên xuất kho sẽ nhận được thông báo vị trí cụ thể, phần hàng cụ thể mình phụ trách. Sau đó quản lý sẽ tổng hợp tất cả lại và lưu biên bản để giám đốc và chủ xưởng có thể xem hồ sơ xuất kho (UC-19), phần nhập kho cũng diễn ra tương tự để giám đốc và chủ xưởng có thể xem hồ sơ nhập kho (UC-20).
Nếu trong thời gian quản lý thông thường, quản lý kho nếu có lệnh sẽ tạo danh mục, thêm dữ liệu mới cho danh mục. Việc quản lý danh mục kho được thực hiện qua UC-06, trong đó có thể thêm danh mục kho (UC-06.1), xóa danh mục kho (UC-06.2) hoặc sửa danh mục kho (UC-06.3) khi cần. Quản lý kho cũng có thể quản lý dữ liệu danh mục kho (UC-07), bao gồm thêm dữ liệu danh mục kho (UC-07.1), xóa dữ liệu danh mục kho (UC-07.2) hoặc sửa dữ liệu danh mục kho (UC-07.3). Quản lý kho có thể tra cứu dữ liệu trong kho (UC-22) và ban giám đốc có thể xem danh sách hàng tồn kho (UC-18) khi cần. Ngoài ra, trong quá trình quản lý kế hoạch, bộ phận lập kế hoạch có thể sử dụng UC-05 để quản lý kế hoạch, bao gồm sửa kế hoạch (UC-05.1) và xóa kế hoạch (UC-05.2) khi cần. Tương tự, trong quá trình quản lý yêu cầu nhập xuất, chủ xưởng có thể sử dụng UC-24 để quản lý yêu cầu, bao gồm sửa yêu cầu (UC-24.1) và xóa yêu cầu (UC-24.2).
Hay ban giám đốc có thể lập đợt kiểm kê (UC-13) chọn loại hình là kiểm kê, sau đó sẽ gửi cho ban kiểm kê, ban kiểm kê sẽ thực hiện kiểm kê (UC-15) và lập biên bản kiểm kê dựa trên kết quả kiểm kê (UC-28), báo cáo kiểm kê sẽ được gửi đến quản lý kho để xử lý chênh lệch kiểm kê (UC-16), tuy nhiên nếu quy mô quá mức có thể gửi trực tiếp cho ban giám đốc để ban giám đốc phê duyệt đề xuất xử lý ngoại lệ (UC-17). Ban giám đốc có thể xem báo cáo kiểm kê (UC-21).


** **

# Đặc tả yêu cầu phần mềm hệ thống quản lý kho hàng

**Phiên bản:** 1.0 — bản thiết kế để triển khai và rà soát.  
**Ngày:** 08/10/2026.  
**Nguồn:** Báo cáo Tuần 6 Warehouse Team có nhận xét của giáo viên, gồm 48 đặc tả UC.  
**Định hướng đã xác nhận:** ứng dụng nguyên khối, mô hình MVC, CSDL MySQL, có giao diện.  
**Chưa được chọn:** ngôn ngữ/framework, thư viện giao diện, môi trường triển khai. Tài liệu không coi Laravel, Spring hoặc Express là quyết định đã được anh Thái xác nhận.

Quy ước: **[GỐC]** là nghiệp vụ lấy từ đặc tả; **[ĐỀ XUẤT]** là quyết định bổ sung để có thể xây dựng chương trình; **[CẦN CHỐT]** là điểm chưa đủ thông tin. Các đề xuất được dùng nhất quán trong bốn tài liệu nhưng chưa có nghĩa đã được giáo viên hoặc chủ hệ thống phê duyệt.

## 1 Mục đích và phạm vi

Hệ thống quản lý kho nguyên vật liệu và thành phẩm, liên kết đặt hàng, lập kế hoạch, mua hàng, QC/AC, nhập/xuất, sản xuất và kiểm kê. Các bộ phận dùng cùng một ứng dụng nguyên khối và một CSDL MySQL. Mục tiêu là quản lý chứng từ xuyên suốt, truy xuất lô hàng, kiểm soát quyền và duy trì tồn kho nhất quán.

[GỐC] Phạm vi gồm toàn bộ 48 UC trong báo cáo; số UC gồm các UC con, không đánh lại số để lấp khoảng trống. Không có UC-26, UC-30 hoặc UC-33 trong nguồn được cung cấp; không suy đoán nội dung các mã này.

[ĐỀ XUẤT] Bổ sung tối thiểu kế hoạch sản xuất, nguồn nhập thành phẩm, thông báo nội bộ, đăng xuất, dữ liệu chọn và công việc điều phối để các UC gốc có đủ đầu vào. Những phần này mang mã SUP, không giả là UC đã có.

Ngoài phạm vi phiên bản này: kế toán, thanh toán và hoàn tiền, vận chuyển/tối ưu tuyến, bán hàng công khai, email/SMS thật, BOM tự động, dự báo, nhiều công ty, microservices và đồng bộ ngoại tuyến toàn hệ thống. Cảnh báo mất kết nối khi kiểm kê vẫn thuộc phạm vi.

## 2 Tài liệu và thuật ngữ

| Thuật ngữ | Ý nghĩa |
| --- | --- |
| QC/AC | Tên bộ phận kiểm tra chất lượng giữ theo nguồn; cần xác nhận cách mở rộng chữ AC, không tự đổi thành QA |
| Danh mục | Nhóm loại hàng, quản lý tại categories |
| Dữ liệu danh mục kho | Kho, vị trí, nhà cung cấp, nguyên vật liệu, thành phẩm và lô qua hub dữ liệu |
| Lô | Một mặt hàng có nguồn mua hoặc sản xuất, ngày sản xuất/hạn dùng, kết quả QC |
| Tồn khả dụng | Số dư AVAILABLE, còn hạn, đáp ứng QC và kho không đang kiểm kê |
| Tồn cách ly | QUARANTINE, chưa được xuất cho sản xuất/bán |
| Ghi sổ | Thao tác nguyên tử tạo phiếu, biến động tồn và cập nhật nguồn |
| Snapshot kiểm kê | Số dư tại thời điểm bắt đầu kiểm kê, không thay đổi khi nhập số đếm |
| Nguyên khối MVC | Một ứng dụng triển khai; controller tiếp nhận request, model/service xử lý dữ liệu/nghiệp vụ, view hiển thị |

Bốn tài liệu đi cùng nhau: `SRS.md`, `DATABASE.md`, `API.md`, `UI_SPEC.md`. SRS quy định nghiệp vụ; CSDL quy định lưu trữ; API quy định hợp đồng; UI quy định tương tác. Nếu sửa quyết định phải đồng bộ cả bốn.

## 3 Vai trò và quyền

| Mã | Vai trò | Phạm vi |
| --- | --- | --- |
| CUSTOMER | Khách hàng | Hàng mẫu; tạo/xem/sửa đơn của chính mình |
| PLANNER | Bộ phận lập kế hoạch | Tiếp nhận đơn; lập/sửa/hủy kế hoạch mua/bán; xem báo cáo nhu cầu; SUP-01 kế hoạch sản xuất |
| PURCHASER | Bộ phận mua hàng | Xem kế hoạch mua đã duyệt, tạo và xem đơn mua |
| WAREHOUSE_MANAGER | Quản lý kho | Danh mục, dữ liệu, tra cứu, hồ sơ nhập/xuất, xử lý chênh lệch |
| WAREHOUSE_STAFF | Nhân viên kho | Xử lý yêu cầu; nhập/xuất theo lô/vị trí và chứng từ nguồn |
| QC_INSPECTOR | Bộ phận QC/AC | Quản lý kết quả chất lượng; đề xuất hàng lỗi SUP-02 |
| STOCKTAKER | Ban kiểm kê | Đếm kho được phân công; lập biên bản theo kho |
| WORKSHOP_OWNER | Chủ xưởng | Yêu cầu nhập/xuất; báo cáo sản xuất/thành phẩm; hồ sơ kho liên quan xưởng |
| DIRECTOR | Ban giám đốc | Duyệt đơn, kế hoạch, ngoại lệ; lập đợt kiểm kê; quản lý công việc; xem báo cáo |

[ĐỀ XUẤT] Tài khoản có nhiều vai trò qua user_roles; nhận một vai trò không tự có quyền của vai trò khác. DIRECTOR không mặc nhiên sửa QC hoặc ghi phiếu kho. Tài khoản quản trị kỹ thuật được seed/cấp ngoài luồng nghiệp vụ; chưa thêm UC quản trị tài khoản.

Khóa phạm vi được kiểm tra trên server kể cả khi người dùng sửa URL/ID. Vai trò là điều kiện cần; bản ghi sở hữu, xưởng, kho phân công và trạng thái là điều kiện tiếp theo. Trả 404 khi đối tượng ngoài phạm vi mà việc tiết lộ sự tồn tại không cần thiết; trả 403 khi chức năng bị cấm rõ ràng.

## 4 Quy trình nghiệp vụ đầu cuối

1. Khách chọn hàng mẫu và đặt đơn → planner tiếp nhận → giám đốc duyệt. Đơn bị từ chối giữ lịch sử và lý do.
2. Planner lập kế hoạch mua nguyên liệu → giám đốc duyệt → mua hàng tạo đơn mua → quản lý kho tạo lô tiếp nhận → QC ghi số đạt/lỗi → chủ xưởng lập yêu cầu nhận từ đơn mua → nhân viên kho nhập theo phân bổ hợp lệ.
3. [ĐỀ XUẤT] Đơn duyệt → kế hoạch sản xuất được giám đốc duyệt → chủ xưởng báo cáo nhu cầu và tạo yêu cầu cấp nguyên liệu → nhân viên kho xuất AVAILABLE → xưởng sản xuất và báo cáo thành phẩm → tạo lô thành phẩm → QC → yêu cầu nhập thành phẩm → phiếu nhập.
4. Planner lập kế hoạch bán từ đơn duyệt → giám đốc duyệt → chủ xưởng tạo yêu cầu giao thành phẩm → nhân viên kho lấy dữ liệu nguồn, chọn lô/vị trí và xuất. Cập nhật tiến độ đơn từ lượng giao tích lũy; không hoàn tất ngay khi chỉ giao một phần.
5. Giám đốc lập đợt kiểm kê và phân công → bắt đầu từng phạm vi kho cùng snapshot → ban kiểm kê nhập số đếm/lưu tạm/hoàn tất → biên bản theo kho → quản lý kho đề xuất xử lý chênh lệch → giám đốc duyệt và điều chỉnh → đóng đợt, mở kho.
6. Báo cáo dùng chứng từ đã ghi sổ và sổ biến động; xuất CSV từ đúng bộ lọc, phạm vi và mốc dữ liệu trên màn hình.

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
| FR-18 | UC-18 | Xem danh sách hàng tồn kho | DIRECTOR | Reporting | UI-24 / UI-25 / UI-26 |
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
| FR-28 | UC-28 | Lập biên bản kiểm kê | STOCKTAKER | Stocktake | UI-21 |
| FR-32 | UC-32 | Phê duyệt kế hoạch mua/bán | DIRECTOR | BusinessPlan | UI-06 / UI-07 |
| FR-02 | UC-02 | Đặt đơn hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-03 | UC-03 | Quản lý đơn hàng khách hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-03.1 | UC-03.1 | Sửa đơn hàng khách hàng | CUSTOMER | CustomerOrder | UI-02 / UI-03 |
| FR-22 | UC-22 | Tra cứu dữ liệu trong kho | WAREHOUSE_MANAGER | Catalog | UI-11 / UI-12 |
| FR-16 | UC-16 | Xử lý chênh lệch kiểm kê | WAREHOUSE_MANAGER | Exception | UI-22 / UI-23 |

## Quy tắc nghiệp vụ thống nhất

| Mã | Quy tắc | Nguồn và quyết định |
| --- | --- | --- |
| BR-01 | Đăng nhập mới được truy cập; server kiểm tra vai trò và phạm vi từng bản ghi | [GỐC] quyền theo actor; [ĐỀ XUẤT] kiểm tra server bắt buộc |
| BR-02 | Khách hàng chỉ xem/sửa đơn của chính mình; chủ xưởng chỉ thao tác dữ liệu xưởng được giao; kiểm kê viên chỉ nhập kho đã phân công | [ĐỀ XUẤT] phạm vi sở hữu |
| BR-03 | Số lượng dùng 3 chữ số thập phân, phải dương khi đặt/mua/nhập/xuất; số đếm thực tế và tồn có thể bằng 0 | [GỐC] kiểm tra số; [ĐỀ XUẤT] độ chính xác |
| BR-04 | Đơn đặt lưu SUBMITTED; tiếp nhận thành RECEIVED; giám đốc duyệt RECEIVED thành APPROVED hoặc REJECTED | [GỐC] UC-02, 29, 31; [ĐỀ XUẤT] mã trạng thái |
| BR-05 | Chỉ sửa đơn SUBMITTED hoặc RECEIVED. Sửa đơn RECEIVED giữ RECEIVED và chờ duyệt lại; sửa SUBMITTED vẫn cần tiếp nhận. Không tự bỏ qua UC-29 | [ĐỀ XUẤT] giải quyết mâu thuẫn UC-03.1 |
| BR-06 | Cảnh báo tăng thời gian giao hoặc đền bù khi đổi số lượng; không tự tính/thu tiền khi chưa có hợp đồng và công thức | [GỐC] UC-03.1; [CẦN CHỐT] điều khoản cụ thể |
| BR-07 | Kế hoạch mua dùng nhà cung cấp và nguyên liệu; kế hoạch bán dùng khách hàng, đơn đã duyệt và thành phẩm | [GỐC] mua/bán; [ĐỀ XUẤT] ràng buộc đơn nguồn |
| BR-08 | Tổng tiền do server tính từ chi tiết và đơn giá snapshot; tiền dùng DECIMAL, quy tắc làm tròn hiển thị VND 0 chữ số; không tin tổng tiền client | [ĐỀ XUẤT] |
| BR-09 | Chỉ sửa/xóa kế hoạch PENDING_APPROVAL hoặc REJECTED, chưa có chứng từ thực hiện. Sửa REJECTED chuyển về PENDING_APPROVAL | [GỐC] chưa duyệt/thực hiện; [ĐỀ XUẤT] cho sửa bị từ chối |
| BR-10 | Từ chối đơn/kế hoạch/đề xuất bắt buộc lý do; chỉ duyệt trạng thái chờ; duyệt đồng thời chỉ một lần thành công | [GỐC] luồng từ chối; [ĐỀ XUẤT] chống xử lý lặp |
| BR-11 | Một kế hoạch mua tạo một đơn mua trong phiên bản này; nhận hàng được chia nhiều đợt | [ĐỀ XUẤT] giới hạn MVP; mua từ kế hoạch duyệt là [GỐC] |
| BR-12 | Yêu cầu nhập/xuất lấy dòng hàng từ chứng từ hợp lệ, không nhập mặt hàng tùy ý. Nhãn “Chờ duyệt” UC-23 thống nhất thành “Chờ xử lý”; không tự thêm một cấp duyệt yêu cầu chưa có trong UC | [GỐC] chứng từ; [ĐỀ XUẤT] chuẩn hóa |
| BR-13 | Yêu cầu có bốn mục đích: nhận hàng mua, nhận thành phẩm sản xuất, cấp nguyên liệu sản xuất, giao thành phẩm bán | [ĐỀ XUẤT] bổ sung từ nhận xét giáo viên |
| BR-14 | Lô tạo trước QC; QC ghi số kiểm, số đạt và số không đạt. Một kết quả hiện hành/lô; số kiểm = đạt + không đạt | [ĐỀ XUẤT] tránh vòng phụ thuộc phiếu nhập và QC |
| BR-15 | Chỉ số lượng đạt vào AVAILABLE; hàng lỗi nếu thực nhận vào QUARANTINE. AVAILABLE chỉ xuất khi QC đạt/đạt một phần và chưa hết hạn | [GỐC] QC trước nhập/xuất; [ĐỀ XUẤT] tách tồn cách ly |
| BR-16 | Kết quả QC chỉ sửa/hủy khi chưa có phiếu kho hoặc đề xuất sử dụng; ghi sổ rồi không đổi trực tiếp | [GỐC] không xóa kết quả đã dùng; [ĐỀ XUẤT] mở rộng khóa sửa |
| BR-17 | Tổng nhập AVAILABLE từng lô không vượt số QC đạt; QUARANTINE không vượt số QC lỗi. Tổng nhập yêu cầu không vượt số được cấp. Sai khác cần lý do và vẫn không vượt hạn mức an toàn | [ĐỀ XUẤT] kiểm soát cộng dồn |
| BR-18 | Xuất theo phân bổ lô/vị trí đã chọn từ nguồn. Tồn không âm, không xuất quá số còn được yêu cầu, không thay đổi hàng trên phiếu tùy ý | [GỐC] đủ tồn; [ĐỀ XUẤT] phân bổ |
| BR-19 | Ghi phiếu, cập nhật số dư, sổ biến động, trạng thái nguồn và audit trong một transaction. Phiếu POSTED không sửa/xóa; muốn sửa phải có nghiệp vụ bù được duyệt | [ĐỀ XUẤT] toàn vẹn |
| BR-20 | Kiểm kê chốt snapshot theo kho/lô/vị trí/chất lượng. Không cho nhập/xuất kho đang kiểm kê cho đến khi hoàn tất xử lý chênh lệch | [ĐỀ XUẤT] MVP khóa nghiệp vụ kho |
| BR-21 | Chưa nhập số thực tế là null; 0 là đã đếm và không có hàng. Không hoàn tất kho khi còn dòng chưa đếm | [ĐỀ XUẤT] |
| BR-22 | UC-15 giữ vai trò nhập số đếm; UC-28 giữ biên bản tổng hợp theo từng kho. Giao diện nối liền hai bước, không bắt nhập số lại | [ĐỀ XUẤT] đáp ứng nhận xét gộp mà giữ truy vết UC |
| BR-23 | Chênh lệch = thực tế − snapshot. Mặc định mọi điều chỉnh phải qua giám đốc; hạn mức tự xử lý = 0 đến khi được chốt. UC-16 tạo đề xuất và UC-17 duyệt/áp dụng | [ĐỀ XUẤT] không đoán hạn mức |
| BR-24 | Duyệt và áp dụng đề xuất điều chỉnh trong cùng transaction; đề xuất lỗi không làm thay đổi tồn. Khi thất bại vẫn PENDING_APPROVAL | [ĐỀ XUẤT] |
| BR-25 | Không xóa vật lý danh mục/dữ liệu đã được chứng từ tham chiếu; dữ liệu chưa dùng được xóa theo UC; dữ liệu đang dùng chỉ ngừng hoạt động bằng thao tác riêng | [GỐC] cấm xóa đang dùng; [ĐỀ XUẤT] ngừng sử dụng |
| BR-26 | Công việc đang thực hiện không xóa; công việc chưa thực hiện hủy và lưu audit. Nhân viên không được phân công hai khoảng thời gian giao nhau | [GỐC] UC-25; [ĐỀ XUẤT] lưu trạng thái CANCELLED |
| BR-27 | Báo cáo thành phẩm không tự tăng tồn: báo cáo tạo lô, QC, yêu cầu nhập, phiếu nhập rồi mới tăng tồn | [ĐỀ XUẤT] hoàn thiện luồng nhập thành phẩm |
| BR-28 | Báo cáo tồn lịch sử tính từ inventory_movements tại mốc báo cáo; không lấy số dư hiện tại để giả làm tồn quá khứ | [ĐỀ XUẤT] |
| BR-29 | Thông báo trong ứng dụng tạo theo người nhận sau nghiệp vụ. Không gửi email/SMS thật trong phạm vi này | [GỐC] thông báo; [ĐỀ XUẤT] kênh nội bộ |
| BR-30 | Mỗi cập nhật có version; dữ liệu lỗi thời trả 409. Thao tác ghi sổ/duyệt có Idempotency-Key và khóa transaction | [ĐỀ XUẤT] |

## Trạng thái và chuyển trạng thái

| Đối tượng | Chuyển hợp lệ | Người thực hiện và tác động |
| --- | --- | --- |
| Đơn khách hàng | SUBMITTED → RECEIVED → APPROVED → IN_PROGRESS → COMPLETED; RECEIVED → REJECTED | PLANNER tiếp nhận; DIRECTOR duyệt/từ chối; service chuyển thực hiện khi có nguồn sản xuất/bán; hoàn tất khi tổng giao đạt |
| Kế hoạch mua/bán | PENDING_APPROVAL → APPROVED/REJECTED; REJECTED → PENDING_APPROVAL khi sửa; APPROVED → IN_PROGRESS → COMPLETED | DIRECTOR duyệt; PURCHASER tạo đơn mua; kho thực hiện giao/nhận; chưa thực hiện có thể CANCELLED theo BR-09 |
| Đơn mua | PENDING → PARTIALLY_RECEIVED → RECEIVED; PENDING → CANCELLED | Service cập nhật từ nhập tích lũy; hủy chưa nhận là chức năng bổ sung cần chốt |
| Yêu cầu kho | PENDING → PARTIALLY_FULFILLED → FULFILLED; PENDING → CANCELLED | Chủ xưởng gửi/hủy; nhân viên kho thực hiện từng phần |
| Kết quả QC | RECORDED → VOID khi chưa dùng | QC_INSPECTOR; trạng thái lô suy ra số đạt/lỗi |
| Đợt kiểm kê | PLANNED → IN_PROGRESS → COMPLETED → CLOSED; PLANNED → CANCELLED | Giám đốc lập/bắt đầu; ban kiểm kê hoàn tất đếm; CLOSED khi mọi biên bản gửi và chênh lệch xử lý |
| Kho trong kiểm kê | PLANNED → COUNTING → COMPLETED → CLOSED | COUNTING và COMPLETED đều chặn giao dịch kho; CLOSED mới mở lại |
| Đề xuất ngoại lệ | PENDING_APPROVAL → APPLIED hoặc REJECTED | APPROVED là bước nội bộ trong transaction trước APPLIED, không công khai duyệt mà chưa áp dụng |
| Công việc | PLANNED → IN_PROGRESS → COMPLETED; PLANNED → CANCELLED | Giám đốc quản lý; chuyển tiến độ là thao tác hỗ trợ [ĐỀ XUẤT] |
| Báo cáo/biên bản | DRAFT → SUBMITTED | Chủ xưởng hoặc ban kiểm kê; bản đã gửi chỉ đọc |
| Kế hoạch sản xuất | DRAFT → APPROVED → IN_PROGRESS → COMPLETED; DRAFT → CANCELLED | Module hỗ trợ [ĐỀ XUẤT], giám đốc duyệt; nguyên liệu chỉ cấp từ APPROVED/IN_PROGRESS |

## 6 Yêu cầu dữ liệu và báo cáo

Mỗi chứng từ có mã tự sinh, người tạo/người thao tác, thời gian, trạng thái và lịch sử. Chi tiết giữ mặt hàng, số lượng, đơn giá snapshot khi có giá; lô và vị trí là bắt buộc khi ghi sổ kho. Không đổi đơn vị tính mặt hàng đã phát sinh chứng từ.

Báo cáo tồn có kho, thời điểm as_of, loại hàng, mặt hàng, lô, vị trí và nhóm chất lượng. Báo cáo nhập/xuất có khoảng thời gian, loại IN/OUT, nguồn, mặt hàng và kho. Báo cáo kiểm kê có đợt, kho, lô, số snapshot, số thực tế, chênh lệch và tình trạng xử lý.

Tất cả khoảng thời gian từ ngày đến ngày dùng múi giờ Asia/Ho_Chi_Minh khi nhập/hiển thị. Server chuyển sang UTC cho DATETIME lưu trữ; khoảng ngày là [đầu ngày từ, đầu ngày sau ngày đến), tránh mất dữ liệu cuối ngày. Số DECIMAL trao đổi JSON bằng chuỗi; không để số thực nhị phân làm sai phép cộng tồn/tiền.

## 7 Yêu cầu phi chức năng

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

## 9 Triển khai và dữ liệu ban đầu

Seed các vai trò, tài khoản thử từng vai trò, khách hàng, xưởng, kho/vị trí, NCC, đơn vị tính, danh mục, nguyên liệu và thành phẩm mẫu. Không seed tồn bằng UPDATE balance trực tiếp: tạo nguồn, QC, yêu cầu, phiếu nhập để sổ và số dư khớp nhau. Không ghi mật khẩu seed thật trong Git; giá trị được cấp lúc dựng môi trường.

Từng giai đoạn có thể triển khai: nền đăng nhập/phân quyền/danh mục → đơn và kế hoạch → mua/QC/nhập → sản xuất/xuất → kiểm kê/ngoại lệ → báo cáo và kiểm thử đầu cuối. Được coi là hoàn thành khi toàn bộ 48 UC và các SUP đã chấp nhận có màn hình, route, ràng buộc dữ liệu và kiểm thử; chưa coi phần có CRUD là đủ toàn hệ thống.

## Các quyết định cần xác nhận trước khi đóng phạm vi

| Mã | Điểm chưa có trong nguồn hoặc chưa thống nhất | Phương án thiết kế đang dùng |
| --- | --- | --- |
| O-01 | Framework và thư viện UI | MVC trung lập framework, View server-rendered, session cookie cùng origin; chọn framework khi khởi tạo code |
| O-02 | Hạn mức điều chỉnh kiểm kê | Mọi chênh lệch phải giám đốc duyệt; không tự cho phép hạn mức tùy ý |
| O-03 | Kế hoạch sản xuất không có UC đầy đủ nhưng được giáo viên nhắc tới | Bổ sung chức năng tối thiểu SUP-01, ghi rõ ngoài 48 UC gốc |
| O-04 | Xuất nguyên liệu và nhập thành phẩm chưa đủ trong UC-10/11 | Mở rộng theo mục đích PRODUCTION_ISSUE/PRODUCTION_RECEIPT |
| O-05 | Gộp kiểm kê và biên bản | Giữ hai mã UC để đối chiếu; dùng một luồng màn hình theo kho |
| O-06 | Mục đích ba UC công việc bị giáo viên hỏi | Giữ để điều phối nhân viên và kiểm kê; có thể bỏ sau khi được thống nhất |
| O-07 | Đặt cọc và bồi thường thay đổi đơn | Chỉ cảnh báo và yêu cầu xác nhận; chưa xây kế toán/thanh toán |
| O-08 | “Danh mục” đang lẫn loại hàng với kho/NCC/lô | UC-06 quản lý categories; UC-07 là hub dữ liệu kho, NCC, mặt hàng, lô và vị trí |
| O-09 | Hàng mẫu có entity riêng không | Dùng items.is_sample cho thành phẩm, chưa cần bảng riêng |
| O-10 | Chủ xưởng tạo yêu cầu cho hàng mua ở UC-23 | Giữ quyền actor theo nguồn; cần quyết định có giao thêm quyền cho mua hàng/kho không |
| O-11 | Nhiều đơn mua cho một kế hoạch, nhiều đơn bán cho một đơn khách hàng | MVP một đơn mua/kế hoạch; nhiều kế hoạch bán được phép nhưng tổng phân bổ không quá số đơn |
| O-12 | Có cần tồn nguyên liệu tại xưởng và định mức BOM đầy đủ | Phiên bản này quản lý kho trung tâm và báo cáo sử dụng; chưa có sổ kho xưởng hoặc BOM tự động |
| O-13 | Kho kiểm kê có được hoạt động bình thường không | Khóa nhập/xuất trong phạm vi kho đến khi đóng kiểm kê; nếu cần hoạt động phải thiết kế đối soát snapshot khác |
| O-14 | Xử lý trả nhà cung cấp/hủy hàng ngoài kiểm kê | SUP-02 đề xuất xử lý hàng lỗi; phải chỉ rõ vị trí và số lượng, không tự ghi giảm lỗi chưa nhập kho |
| O-15 | Thêm màn quản trị tài khoản và tạo công việc chưa có UC | Không tự thêm màn quản trị tài khoản; dùng seed ban đầu. Công việc kiểm kê tạo từ lập đợt; tạo công việc mua hàng là SUP-03 |

## 10 Phụ lục đặc tả chi tiết từ nguồn

Phụ lục giữ nguyên luồng gốc để đối chiếu. Nếu khác quy tắc BR được đề xuất ở trên, cần xác nhận quyết định thay đổi trước khi đóng SRS; không hiểu hai phiên bản là đồng thời bắt buộc.


### UC-29 Tiếp nhận đơn hàng

**Tiền điều kiện:** Bộ phận lập kế hoạch đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được tiếp nhận và chuyển sang trạng thái đã tiếp nhận, chờ Ban giám đốc phê duyệt (UC-31 Phê duyệt đơn hàng)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem đơn hàng | 2. Hiển thị danh sách các đơn hàng chưa được tiếp nhận (DonHang) |
| 3. Chọn một đơn hàng cần tiếp nhận (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang, KhachHang) |
| 5. Chọn Tiếp nhận đơn hàng (DonHang) |  |
|  | 6. Cập nhật trạng thái đơn hàng thành Đã tiếp nhận |
|  | 7. Thông báo tiếp nhận đơn hàng thành công |
|  | 8. Kết thúc use case |

#### Luồng thay thế

Không có nội dung trong bản gốc.


#### Luồng ngoại lệ


**2.1 Nếu không có đơn hàng nào**

- 1. Hệ thống thông báo không có đơn hàng mới (DonHang)
- 2. Kết thúc use case

### UC-06 Quản lý danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập và có quyền quản lý danh mục kho

**Hậu điều kiện:** Danh sách danh mục kho (gồm khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) được hiển thị/chỉnh sửa/xoá theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý danh mục kho | 2. Hiển thị danh sách danh mục hiện có (LoaiHang) |
| 3. Chọn một danh mục để xem chi tiết (LoaiHang) | 4. Hiển thị chi tiết danh mục gồm (Mã danh mục, tên danh mục, mô tả, ngày tạo, ngày chỉnh sửa cuối cùng, số lượng dữ liệu hiện có, số lượng dữ liệu chưa được xuất bản) (LoaiHang, MatHang) |

#### Luồng thay thế


**3.1 Chọn Thêm**

- 1. Hệ thống thực hiện UC-06.1

**4.1 Chọn Xóa**

- 1. Hệ thống thực hiện UC-06.2

**4.2 Chọn Sửa**

- 1. Hệ thống thực hiện UC-06.3

#### Luồng ngoại lệ


**2.1 Không có danh mục nào trong danh sách**

- 1. Hệ thống thông báo không tìm thấy danh mục nào (LoaiHang)
- 2. Kết thúc UC

### UC-06.1 Thêm danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống

**Hậu điều kiện:** Danh mục kho mới được thêm vào hệ thống

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Thêm danh mục (LoaiHang) | 2. Hiển thị form thêm danh mục gồm (Tên danh mục, mô tả) (LoaiHang) |
| 3. Nhập tên danh mục, mô tả và xác nhận (LoaiHang) | 4. Kiểm tra dữ liệu vừa được nhập (LoaiHang) |
|  | 5. Lưu danh mục mới vào hệ thống và thông báo thêm thành công (LoaiHang) |

#### Luồng thay thế


**3.1 Quản lý kho chọn nhập lại**

- 1. Thông tin danh mục đã nhập bị xóa
- 2. Quay lại UC-06 bước 4

#### Luồng ngoại lệ


**4.1 Tên danh mục đã tồn tại**

- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

**4.2 Dữ liệu nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 2. Quay lại bước 2

**4.3 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

**4.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 2

### UC-06.2 Xóa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Danh mục được xóa khỏi danh sách

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Xoá danh mục (LoaiHang) | 2. Hệ thống yêu cầu xác nhận xóa (LoaiHang) |
| 3. Xác nhận xóa | 4. Hệ thống kiểm tra danh mục có đang được sử dụng hay không (LoaiHang, MatHang) |
|  | 5. Hệ thống xóa danh mục khỏi danh sách và thông báo xoá danh mục thành công (LoaiHang) |

#### Luồng thay thế


**3.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thao tác xóa, giữ nguyên danh mục
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Danh mục đang được sử dụng**

- 1. Hệ thống thông báo không thể xóa vì danh mục đang được sử dụng (LoaiHang, MatHang)
- 2. Kết thúc use case

### UC-06.3 Sửa danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; danh mục kho đang được chọn từ danh sách

**Hậu điều kiện:** Thông tin danh mục được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Sửa danh mục (LoaiHang) | 2. Hệ thống hiển thị form với thông tin có thể sửa là tên danh mục và mô tả (LoaiHang) |
| 3. Nhập thông tin muốn chỉnh sửa (LoaiHang) |  |
| 4. Chọn xác nhận | 5. Hệ thống kiểm tra dữ liệu vừa được nhập (LoaiHang) |
|  | 6. Hệ thống lưu thông tin danh mục đã chỉnh sửa và thông báo chỉnh sửa thành công (LoaiHang) |

#### Luồng thay thế


**4.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**5.1 Tên danh mục đã tồn tại**

- 1. Hệ thống thông báo tên danh mục đã tồn tại và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.2 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.3 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (LoaiHang)
- 2. Quay lại bước 3

**5.3 Nếu dữ liệu bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (LoaiHang)
- 2. Quay lại bước 3

### UC-07 Quản lý dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập thành công và có quyền quản lý dữ liệu danh mục kho

**Hậu điều kiện:** Danh sách dữ liệu gồm (khu vực kho, nhà cung cấp, nguyên vật liệu, thành phẩm, hàng lỗi, lô nguyên vật liệu, lô thành phẩm) trong danh mục được hiển thị/chỉnh sửa/xóa theo yêu cầu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý dữ liệu danh mục kho | 2. Hiển thị danh sách danh mục (LoaiHang) |
| 3. Chọn một danh mục để xem chi tiết dữ liệu (LoaiHang, MatHang) | 4. Hiển thị dữ liệu chi tiết (MatHang) |

#### Luồng thay thế


**3.1 Tìm kiếm dữ liệu**

- 1. Quản lý kho tên dữ liệu cần tìm (MatHang)
- 2. Hệ thống hiển thị dữ liệu phù hợp (MatHang)
- 3. Kết thúc UC

**3.2 Chọn Thêm**

- 1. Hệ thống thực hiện UC-07.1

**4.1 Chọn Xóa**

- 1. Hệ thống thực hiện UC-07.2

**4.2 Chọn Sửa**

- 1. Hệ thống thực hiện UC-07.3

#### Luồng ngoại lệ


**2.1 Không có dữ liệu**

- 1. Hệ thống thông báo không tìm thấy dữ liệu (MatHang)
- 2. Quay lại bước 1

### UC-07.1 Thêm dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Dữ liệu mới được thêm vào danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Thêm dữ liệu (MatHang) | 2. Hiển thị form thêm dữ liệu yêu cầu nhập dữ liệu theo các cột tương ứng trong hệ thống ngoại trừ mã, ngày tạo, ngày cập nhật gần nhất (MatHang, LoaiHang) |
| 3. Nhập thông tin và xác nhận (MatHang) | 4. Kiểm tra dữ liệu nhập (MatHang) |
|  | 5. Lưu dữ liệu mới vào hệ thống và thông báo thêm thành công (MatHang) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Tên đã tồn tại**

- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**3.2 Dữ liệu để trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)
- 2. Quay lại bước 3

**3.3 Nếu dữ liệu là số và Quản lý kho nhập chữ**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**3.4 Nếu dữ liệu là số và Quản lý kho nhập giá trị < 0**

- 1. Hệ thống thông báo giá trị phải lớn hơn 0 và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

### UC-07.2 Xóa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Dữ liệu được xóa khỏi danh mục

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Xóa (MatHang) | 2. Hệ thống kiểm tra dữ liệu có còn tồn kho/phát sinh giao dịch hay không (MatHang, TonKho, ChiTietPhieuKho) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (MatHang) |
| 4. Xác nhận xóa | 5. Hệ thống xóa dữ liệu khỏi danh sách (MatHang) |

#### Luồng thay thế


**4.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Dữ liệu còn tồn kho hoặc đang được sử dụng**

- 1. Hệ thống thông báo không thể xóa (MatHang)
- 2. Kết thúc use case

### UC-07.3 Sửa dữ liệu danh mục kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập hệ thống; dữ liệu đang được chọn từ danh mục

**Hậu điều kiện:** Thông tin dữ liệu được cập nhật chính xác

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (MatHang) | 2. Hệ thống mở form nhập cho phép chỉnh sửa các thông tin được phép chỉnh sửa (MatHang) |
| 3. Chỉnh sửa thông tin (tên danh mục, mô tả danh mục) và xác nhận (MatHang, LoaiHang) | 4. Hệ thống kiểm tra thông tin vừa được nhập (MatHang) |
|  | 4. Hệ thống lưu thông tin mới vào hệ thống và thông báo chỉnh sửa thành công (MatHang) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Quản lý kho chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Tên bị trùng**

- 1. Hệ thống thông báo tên đã tồn tại và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**4.2 Nếu dữ liệu bị nhập sai định dạng**

- 1. Hệ thống thông báo lỗi định dạng và yêu cầu nhập lại (MatHang)
- 2. Quay lại bước 3

**4.3 Dữ liệu để trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (MatHang)
- 2. Quay lại bước 3

### UC-08 Quản lý nhập kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách chi tiết các phiếu nhập kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý nhập kho | 2. Hiển thị danh sách phiếu nhập kho (PhieuKho) |
| 3. Chọn một phiếu nhập kho để xem chi tiết (PhieuKho) | 4. Hiển thị thông tin chi tiết phiếu nhập kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**3.1 Tìm kiếm phiếu nhập kho**

- 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)
- 2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)
- 3. Đi đến bước 3

#### Luồng ngoại lệ


**2.1 Không có phiếu nhập kho**

- 1. Hệ thống thông báo không tìm thấy phiếu nhập kho trong hệ thống (PhieuKho)
- 2. Kết thúc UC

### UC-09 Quản lý xuất kho

**Tiền điều kiện:** Quản lý kho đã đăng nhập

**Hậu điều kiện:** Danh sách phiếu xuất kho được hiển thị

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý xuất kho | 2. Hiển thị danh sách phiếu xuất kho (PhieuKho) |
| 3. Chọn một phiếu xuất kho để xem chi tiết (PhieuKho) | 4. Hiển thị thông tin chi tiết phiếu xuất kho (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**3.1 Tìm kiếm phiếu xuất kho**

- 1. Nhập mã phiếu để tìm kiếm phiếu nhập kho (PhieuKho)
- 2. Hệ thống hiển thị các phiếu nhập kho phù hợp (PhieuKho)
- 3. Đi đến bước 3

#### Luồng ngoại lệ


**2.1 Không có phiếu xuất kho phù hợp**

- 1. Hệ thống thông báo không tìm thấy phiếu xuất kho phù hợp (PhieuKho)
- 2. Quay lại bước 1

### UC-13 Lập đợt kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập vào hệ thống

**Hậu điều kiện:** Đợt kiểm kê mới được tạo, lưu vào hệ thống và gửi cho Ban kiểm kê

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập đợt kiểm kê | 2. Hiển thị form lập đợt kiểm kê (CongViec, Kho) |
| 3. Nhập thông tin đợt kiểm kê (thời gian, loại nguyên vật liệu/thành phẩm, chọn danh sách các kho cần kiểm, ngày kiểm kê) (CongViec, KiemKe, Kho, MatHang) | 4. Kiểm tra thông tin đợt kiểm kê (CongViec, KiemKe, Kho) |
| 5. Xác nhận lập đợt kiểm kê | 6. Lưu đợt kiểm kê, gửi cho Ban kiểm kê và thông báo tạo thành công (CongViec, KiemKe) |

#### Luồng thay thế


**5.1 Ban giám đốc chọn nhập lại**

- 2. Hệ thống hủy thông tin đã nhập
- 3. Quay lại bước 3

#### Luồng ngoại lệ


**4.1 Thời gian/phạm vi kiểm kê không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (CongViec, KiemKe)
- 2. Quay lại bước 2

### UC-17 Phê duyệt đề xuất xử lý ngoại lệ

**Tiền điều kiện:** Có đề xuất xử lý hàng lỗi hoặc chênh lệch kiểm kê đang chờ phê duyệt

**Hậu điều kiện:** Đề xuất được phê duyệt hoặc từ chối và trạng thái được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt đề xuất xử lý ngoại lệ | 2. Hiển thị danh sách đề xuất đang chờ phê duyệt (DeXuatXuLyNgoaiLe) |
| 3. Chọn một đề xuất để xem chi tiết (DeXuatXuLyNgoaiLe) | 4. Hiển thị thông tin chi tiết đề xuất, loại hàng, số lượng, hàng bị vấn đề gì (DeXuatXuLyNgoaiLe, MatHang, LoaiHang, ChiTietKetQuaKiemTraQCAC, ChiTietKiemKe) |
| 5. Chọn Phê duyệt (PheDuyetXuLyNgoaiLe) | 6. Cập nhật trạng thái đề xuất đã duyệt và áp dụng thay đổi liên quan (DeXuatXuLyNgoaiLe, PheDuyetXuLyNgoaiLe, TonKho) |

#### Luồng thay thế


**5.1 Từ chối đề xuất và có nhập lý do**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (DeXuatXuLyNgoaiLe)
- 2. Hệ thống cập nhật trạng thái đề xuất bị từ chối và thông báo cho người đề xuất (DeXuatXuLyNgoaiLe, PheDuyetXuLyNgoaiLe)
- 3. Quay lại bước 1

**5.2 Từ chối đề xuất nhưng không nhập lý do**

- 1. Ban giám đốc chọn Từ chối nhưng để trống lý do (DeXuatXuLyNgoaiLe)
- 2. Hệ thống thông báo yêu cầu nhập lý do từ chối (PheDuyetXuLyNgoaiLe)
- 3. Quay lại bước 4

#### Luồng ngoại lệ


**2.1 Không có đề xuất nào đang chờ phê duyệt**

- 1. Hệ thống thông báo không có đề xuất nào đang chờ phê duyệt (DeXuatXuLyNgoaiLe)
- 2. Kết thúc use case

**4.1 Đề xuất không còn hiệu lực (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo đề xuất không còn hiệu lực (DeXuatXuLyNgoaiLe)
- 2. Quay lại bước 1

### UC-18 Xem danh sách hàng tồn kho

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo tồn kho

**Hậu điều kiện:** Danh sách hàng tồn kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem danh sách hàng tồn kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang) | 4. Tổng hợp và hiển thị danh sách hàng tồn kho tương ứng (TonKho, Kho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (TonKho)
- 2. Hệ thống tạo và tải về file báo cáo (TonKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (TonKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu tồn kho phù hợp (TonKho)
- 2. Quay lại bước 1

### UC-19 Xem hồ sơ xuất kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ xuất kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc/Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem hồ sơ xuất kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) | 4. Tổng hợp và hiển thị hồ sơ xuất kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu xuất kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 1

### UC-20 Xem hồ sơ nhập kho

**Tiền điều kiện:** Ban giám đốc hoặc Chủ xưởng đã đăng nhập và có quyền xem hồ sơ kho

**Hậu điều kiện:** Hồ sơ nhập kho được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc, Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc/Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem hồ sơ nhập kho | 2. Hiển thị form điều kiện lọc (kho, thời gian, mặt hàng) (Kho, MatHang, PhieuKho) |
| 3. Chọn điều kiện lọc và xác nhận (Kho, MatHang, PhieuKho) | 4. Tổng hợp và hiển thị hồ sơ nhập kho tương ứng (PhieuKho, ChiTietPhieuKho, MatHang, LoHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (PhieuKho, ChiTietPhieuKho)
- 2. Hệ thống tạo và tải về file báo cáo (PhieuKho, ChiTietPhieuKho)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu nhập kho phù hợp (PhieuKho, ChiTietPhieuKho)
- 2. Quay lại bước 1

### UC-21 Xem báo cáo kiểm kê

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền xem báo cáo kiểm kê

**Hậu điều kiện:** Báo cáo kiểm kê được hiển thị theo điều kiện lựa chọn

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem báo cáo kiểm kê | 2. Hiển thị form điều kiện lọc báo cáo (đợt kiểm kê, thời gian, khu vực) (KiemKe, CongViec, Kho) |
| 3. Chọn điều kiện lọc và xác nhận (KiemKe, CongViec, Kho) | 4. Tổng hợp và hiển thị báo cáo kiểm kê tương ứng (bao gồm số liệu chênh lệch) (KiemKe, ChiTietKiemKe, Kho, MatHang) |

#### Luồng thay thế


**2.1 Xuất báo cáo ra file**

- 1. Ban giám đốc chọn Xuất file (KiemKe, ChiTietKiemKe)
- 2. Hệ thống tạo và tải về file báo cáo (KiemKe, ChiTietKiemKe)
- 3. Quay lại bước 2

#### Luồng ngoại lệ


**3.1 Điều kiện thời gian lọc không hợp lệ (ví dụ: từ ngày lớn hơn đến ngày)**

- 1. Hệ thống thông báo điều kiện thời gian không hợp lệ và yêu cầu chọn lại (KiemKe, ChiTietKiemKe)
- 2. Quay lại bước 2

**4.1 Không có dữ liệu phù hợp với điều kiện lọc**

- 1. Hệ thống thông báo không có dữ liệu kiểm kê phù hợp (KiemKe, ChiTietKiemKe)
- 2. Quay lại bước 1

### UC-25 Quản lý công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập và có quyền quản lý công việc

**Hậu điều kiện:** Công việc được xem, cập nhật hoặc xoá theo thao tác của Ban giám đốc

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý công việc | 2. Hiển thị danh sách công việc (CongViec) |
| 3. Chọn công việc cụ thể (CongViec) | 4. Hiển thị thông tin chi tiết công việc gồm: tên công việc, mô tả, ngày bắt đầu, ngày kết thúc, độ ưu tiên, trạng thái, nhân viên được phân công (CongViec, NhanVien) |
|  | 5. Kết thúc UC |

#### Luồng thay thế


**4.1 Nếu giám đốc muốn sửa công việc, chọn Chỉnh sửa**

- 1. Đi đến UC-25.1 Chỉnh sửa công việc

**4.2 Nếu giám đốc muốn xoá công việc, chọn Xoá**

- 1. Đi đến UC-25.2 Xóa công việc

#### Luồng ngoại lệ


**2.1 Nếu danh sách công việc hiện đang trống**

- 1. Hệ thống thông báo không có công việc hiện tại (CongViec)
- 2. Kết thúc use case

### UC-25.1 Chỉnh sửa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần chỉnh sửa

**Hậu điều kiện:** Công việc được cập nhật theo đúng thông tin Ban giám đốc xác nhận

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn Chỉnh sửa công việc (CongViec) | 2. Hiển thị form với thông tin hiện tại của công việc (CongViec, NhanVien) |
| 3. Nhập thông tin muốn chỉnh sửa (CongViec, NhanVien) | 4. Chọn Xác nhận |
|  | 5. Kiểm tra dữ liệu nhập (CongViec) |
|  | 6. Kiểm tra lịch trình nhân viên nếu có bổ sung/thay đổi nhân viên (NhanVien, CongViec) |
|  | 7. Lưu thông tin công việc được cập nhật vào hệ thống và thông báo cập nhật thành công (CongViec, NhanVien) |

#### Luồng thay thế


**4.1 Nếu giám đốc chọn Huỷ**

- 1. Hệ thống hủy thông tin đã chỉnh sửa
- 2. Kết thúc UC

#### Luồng ngoại lệ


**5.1 Nếu giám đốc nhập chữ vào ô nhập số**

- 1. Hệ thống thông báo lỗi định dạng (CongViec)
- 2. Quay lại bước 3

**5.2 Nếu giám đốc nhập số < 0**

- 1. Hệ thống thông báo số phải lớn hơn 0 (CongViec)
- 2. Quay lại bước 3

**5.3 Nếu bỏ trống thông tin bắt buộc**

- 1. Hệ thống thông báo yêu cầu nhập đầy đủ thông tin (CongViec)
- 2. Quay lại bước 3

**5.4 Nếu ngày bắt đầu/ngày kết thúc không hợp lệ**

- 1. Hệ thống thông báo thời gian thực hiện công việc không hợp lệ (CongViec)
- 2. Quay lại bước 3

**6.1 Nếu giám đốc thêm nhân viên có lịch trùng vào thời điểm thực hiện công việc**

- 1. Hệ thống thông báo nhân viên đang không trống lịch, yêu cầu chọn nhân viên khác (NhanVien, CongViec)
- 2. Quay lại bước 3

### UC-25.2 Xóa công việc

**Tiền điều kiện:** Ban giám đốc đã đăng nhập, có quyền quản lý công việc và đã chọn một công việc cần xoá

**Hậu điều kiện:** Công việc được xoá khỏi hệ thống khi đáp ứng điều kiện xoá

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn Xóa công việc muốn xoá (CongViec) | 2. Hệ thống yêu cầu xác nhận (CongViec) |
| 3. Chọn Xác nhận | 4. Kiểm tra công việc có đang được thực hiện (CongViec) |
|  | 5. Xóa công việc khỏi hệ thống và thông báo xoá thành công (CongViec) |

#### Luồng thay thế


**3.1 Nếu giám đốc chọn Huỷ**

- 1. Hệ thống hủy thao tác xoá
- 2. Kết thúc UC

#### Luồng ngoại lệ


**4.1 Nếu công việc hiện đang được diễn ra**

- 1. Hệ thống thông báo công việc đang được tiến hành, không thể xoá (CongViec)
- 2. Kết thúc UC

### UC-31 Phê duyệt đơn hàng

**Tiền điều kiện:** Ban giám đốc đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Đơn hàng được phê duyệt hoặc từ chối và trạng thái đơn hàng được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt đơn hàng | 2. Hiển thị danh sách đơn hàng đang chờ phê duyệt (DonHang) |
| 3. Chọn một đơn hàng để xem chi tiết (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (sản phẩm, số lượng, thông tin giao hàng) (DonHang, ChiTietDonHang, MatHang) |
| 5. Chọn Phê duyệt (DonHang) | 6. Cập nhật trạng thái đơn hàng thành Đã duyệt và thông báo cho Bộ phận lập kế hoạch (DonHang) |

#### Luồng thay thế


**5.1 Từ chối đơn hàng**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (DonHang)
- 2. Hệ thống cập nhật trạng thái đơn hàng bị từ chối và thông báo cho khách hàng (DonHang, KhachHang)
- 3. Quay lại bước 1

#### Luồng ngoại lệ


**2.1 Danh sách đơn hàng chờ phê duyệt rỗng**

- 1. Hệ thống hiển thị danh sách rỗng / thông báo không có đơn hàng nào cần phê duyệt. (DonHang)
- 2. Kết thúc UC.

**4.1 Đơn hàng không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo đơn hàng không còn hiệu lực để phê duyệt (DonHang)
- 2. Quay lại bước 1

### UC-14 Xem/Quản lý đơn hàng mua

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Hiển thị danh sách đơn mua hàng đã đặt

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận mua hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xem/Quản lý đơn hàng mua | 2. Hiển thị danh sách đơn hàng đã đặt (DonMuaHang, NhaCungCap) |

#### Luồng thay thế

Không có nội dung trong bản gốc.


#### Luồng ngoại lệ


**2.1 Không có đơn hàng trong hệ thống**

- 1. Hệ thống thông báo không có đơn hàng trong hệ thống / hiển thị danh sách rỗng. (DonMuaHang)
- 2. Kết thúc UC

### UC-23 Yêu cầu nhập/xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống

**Hậu điều kiện:** Yêu cầu nhập/xuất của chủ xưởng được tạo và gửi đến bộ phận kho xử lý

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Yêu cầu nhập/xuất | 2. Hiển thị form tạo yêu cầu (loại yêu cầu: nhập/xuất) (YeuCauNhapXuat) |
| 3. Yêu cầu nhập/xuất được tạo từ chứng từ mua nguyên vật liệu/chứng từ bán thành phẩm (YeuCauNhapXuat, ChiTietYeuCauNhapXuat, DonMuaHang, KeHoachMuaBan, MatHang) | 4. Kiểm tra thông tin yêu cầu (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
| 5. Gửi yêu cầu (YeuCauNhapXuat) | 6. Lưu yêu cầu với trạng thái “Chờ duyệt ”và gửi thông báo đến bộ phận kho (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**3.1 Hủy yêu cầu trước khi gửi**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không tìm thấy chứng từ mua nguyên vật liệu/bán thành phẩm để tạo yêu cầu**

- 1. Hệ thống thông báo không có chứng từ hợp lệ để lập yêu cầu nhập xuất. (DonMuaHang, KeHoachMuaBan)
- 2. Kết thúc UC.

**4.1 Thiếu thông tin bắt buộc**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin (YeuCauNhapXuat, ChiTietYeuCauNhapXuat)
- 2. Quay lại bước 2

### UC-24 Quản lý yêu cầu nhập xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập; đã có yêu cầu được gửi (UC-23)

**Hậu điều kiện:** Danh sách yêu cầu của chủ xưởng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý yêu cầu | 2. Hiển thị danh sách yêu cầu đã gửi của chủ xưởng (YeuCauNhapXuat) |
| 3. Chọn một yêu cầu để xem chi tiết (YeuCauNhapXuat) | 4. Hiển thị thông tin và trạng thái xử lý yêu cầu (YeuCauNhapXuat, ChiTietYeuCauNhapXuat, MatHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc yêu cầu theo trạng thái, thời gian**

- 1. Chủ xưởng nhập điều kiện tìm kiếm (YeuCauNhapXuat)
- 2. Hệ thống hiển thị yêu cầu phù hợp (YeuCauNhapXuat)
- 3. Quay lại bước 1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-24.1

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-24.2

#### Luồng ngoại lệ


**1.1 Tìm kiếm/lọc không có 1 t quả phù hợp**

- 1. Hệ thống thông báo không tìm thấy yêu cầu phù hợp. (YeuCauNhapXuat)
- 2. Quay lại bước 1

**2.1 Không có yêu cầu trong hệ thống**

- 1. Hệ thống thông báo không tìm thấy yêu cầu (YeuCauNhapXuat)
- 2. Quay lại bước 1

### UC-24.1 Sửa yêu cầu

**Tiền điều kiện:** Chủ xưởng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin yêu cầu được cập nhật chính xác

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) | 2. Kiểm tra yêu cầu chưa được xử lý (YeuCauNhapXuat) |
|  | 3. Hiển thị form với thông tin hiện tại (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
| 4. Chỉnh sửa thông tin muốn thay đổi (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |  |
| 5. Chọn xác nhận | 6. Hệ thống kiểm tra thông tin nhập (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |
|  | 7. Hệ thống cập nhật thông tin sau khi chỉnh sửa (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**5.1 Hủy trước khi xác nhận**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Yêu cầu đã được xử lý**

- 1. Hệ thống thông báo không thể chỉnh sửa yêu cầu đã được xử lý (YeuCauNhapXuat)
- 2. Kết thúc use case

**6.1 Thông tin không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (YeuCauNhapXuat, ChiTietYeuCauNhapXuat)
- 2. Quay lại bước 3

### UC-24.2 Xóa yêu cầu

**Tiền điều kiện:** Yêu cầu đang ở trạng thái Chờ xử lý

**Hậu điều kiện:** Yêu cầu bị xóa/hủy khỏi danh sách

**Actor chính:** Chủ xưởng

**Actor phụ:** Bộ phận


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn một yêu cầu và chọn Xóa (YeuCauNhapXuat) | 2. Hệ thống yêu cầu xác nhận xóa (YeuCauNhapXuat) |
| 3. Xác nhận xóa | 4. Hệ thống hủy yêu cầu và thông báo đến bộ phận kho (YeuCauNhapXuat, ChiTietYeuCauNhapXuat) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận xóa**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Yêu cầu đã được xử lý**

- 1. Hệ thống thông báo không thể xóa yêu cầu đã được xử lý (YeuCauNhapXuat)
- 2. Kết thúc use case

### UC-27 Mua hàng

**Tiền điều kiện:** Bộ phận mua hàng đăng nhập thành công vào hệ thống và kế hoạch mua hàng đã được duyệt

**Hậu điều kiện:** Đơn hàng mua (nguyên vật liệu) mới được tạo và đang trong trạng thái "Chờ xử lý"

**Actor chính:** Bộ phận mua hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận mua hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Mua hàng | 2. Hiển thị danh sách kế hoạch mua cần xử lý (KeHoachMuaBan) |
| 3. Chọn một kế hoạch mua để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị chi tiết kế hoạch (mặt hàng, số lượng, thời gian) (KeHoachMuaBan, ChiTietKeHoachMuaBan, MatHang) |
| 5. Nhập thông tin nhà cung cấp, giá, điều kiện giao hàng (DonMuaHang, ChiTietDonMuaHang, NhaCungCap) | 6. Kiểm tra thông tin đơn hàng mua (DonMuaHang, ChiTietDonMuaHang) |
| 7. Xác nhận mua hàng | 8. Tạo đơn hàng mua với trạng thái "Chờ xử lý" và cập nhật trạng thái kế hoạch (DonMuaHang, ChiTietDonMuaHang, KeHoachMuaBan) |

#### Luồng thay thế


**7.1 Hủy trước khi xác nhận**

- 1. Bộ phận mua hàng chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không có kế hoạch mua hàng nào đang chờ xử lý**

- 1. Hệ thống thông báo không có kế hoạch mua hàng cần xử lý / hiển thị danh sách rỗng. (KeHoachMuaBan)
- 2. Kết thúc UC.

**6.1 Thông tin đơn hàng mua không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (DonMuaHang, ChiTietDonMuaHang)
- 2. Quay lại bước 5

### UC-04 Lập kế hoạch mua/bán

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập

**Hậu điều kiện:** Kế hoạch mua/bán mới được tạo, lưu vào hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-32 Phê duyệt kế hoạch mua/bán)

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập kế hoạch mua/bán | 2. Hiển thị form lập kế hoạch (KeHoachMuaBan) |
| 3. Chọn loại kế hoạch mua nguyên vật liệu (KeHoachMuaBan) |  |
| 4. Chọn các thông tin cho kế hoạch mua nguyên vật liệu gồm: nhà cung cấp, nhập ghi chú, loại nguyên vật liệu, nhập số lượng (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, MatHang, LoaiHang) | 5. Kiểm tra thông tin nhập (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 6. Tính tổng tiền dựa trên đơn giá * số lượng (ChiTietKeHoachMuaBan, MatHang) |
| 7. Chọn Xác nhận | 8. Hệ thống lưu kế hoạch mua nguyên vật liệu, chuyển kế hoạch sang trạng thái chờ Ban giám đốc phê duyệt và thông báo lập kế hoạch thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**3.1 Chọn kế hoạch bán hàng**

- 1. Bộ phận lập kế hoạch chọn các thông tin cho kế hoạch bán hàng gồm: khách hàng, nhập ghi chú, loại thành phẩm, nhập số lượng; hệ thống kiểm tra số lượng tồn kho khả dụng của thành phẩm được chọn và cảnh báo nếu không đủ (KeHoachMuaBan, ChiTietKeHoachMuaBan, KhachHang, MatHang, TonKho)
- 2. Đi đến bước 5

#### Luồng ngoại lệ


**5.1 Nếu thông tin nhập là số và < 0**

- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 4

**5.2 Nếu thông tin nhập là số mà người dùng nhập chữ**

- 1. Hệ thống thông báo lỗi, yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 4

### UC-05 Quản lý kế hoạch

**Tiền điều kiện:** Bộ phận lập kế hoạch đã đăng nhập và có quyền quản lý kế hoạch

**Hậu điều kiện:** Danh sách kế hoạch mua/bán được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý kế hoạch | 2. Hiển thị danh sách kế hoạch hiện có (KeHoachMuaBan) |
| 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị chi tiết kế hoạch (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, MatHang) |

#### Luồng thay thế


**3.1 Tìm kiếm/lọc kế hoạch**

- 1. Nhân viên nhập điều kiện tìm kiếm (loại kế hoạch, thời gian, trạng thái) (KeHoachMuaBan)
- 2. Hệ thống hiển thị các kế hoạch phù hợp (KeHoachMuaBan)
- 3. Quay lại bước 1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-05.1

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-05.2

#### Luồng ngoại lệ


**2.1 Không có kế hoạch nào**

- 1. Hệ thống thông báo không tìm thấy kế hoạch (KeHoachMuaBan)
- 2. Quay lại bước 1

### UC-05.1 Sửa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Thông tin kế hoạch được cập nhật chính xác

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn Sửa (KeHoachMuaBan, ChiTietKeHoachMuaBan) | 2. Hiển thị form với thông tin kế hoạch hiện tại (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
| 3. Nhập thông tin cần chỉnh sửa và xác nhận (KeHoachMuaBan, ChiTietKeHoachMuaBan) | 4. Kiểm tra thông tin đã nhập (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 5. Lưu cập nhật vào hệ thống (KeHoachMuaBan, ChiTietKeHoachMuaBan) |
|  | 6. Thông báo kế hoạch đã được cập nhật (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**1.1 Hủy trước khi xác nhận**

- 1. Nhân viên chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập, quay lại UC-05 bước 4

#### Luồng ngoại lệ


**4.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KeHoachMuaBan, ChiTietKeHoachMuaBan)
- 2. Quay lại bước 3

### UC-05.2 Xóa kế hoạch

**Tiền điều kiện:** Kế hoạch được chọn chưa được duyệt/thực hiện

**Hậu điều kiện:** Kế hoạch được xóa khỏi danh sách

**Actor chính:** Bộ phận lập kế hoạch

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận lập kế hoạch | Hệ thống |
| --- | --- |
| 1. Chọn Xóa (KeHoachMuaBan) | 2. Hệ thống kiểm tra kế hoạch được chọn chưa được duyệt/thực hiện (KeHoachMuaBan) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (KeHoachMuaBan) |
| 4. Xác nhận xóa | 5. Hệ thống xóa kế hoạch khỏi danh sách và thông báo thành công (KeHoachMuaBan, ChiTietKeHoachMuaBan) |

#### Luồng thay thế


**4.1 Hủy thao tác xóa**

- 1. Nhân viên chọn Không đồng ý (KeHoachMuaBan)
- 2. Quay lại UC-05 bước 4

#### Luồng ngoại lệ


**2.1 Kế hoạch đã được duyệt/đang thực hiện**

- 1. Hệ thống thông báo không thể xóa kế hoạch đã được duyệt (KeHoachMuaBan)
- 2. Kết thúc use case

### UC-10 Nhập kho

**Tiền điều kiện:** Nhân viên kho đăng nhập thành công vào hệ thống; có lô nguyên vật liệu đã được Bộ phận QC/AC kiểm tra chất lượng đạt yêu cầu, đang chờ nhập kho

**Hậu điều kiện:** Hàng hóa được cập nhật vào tồn kho, phiếu nhập kho được tạo

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


#### Luồng cơ bản

| Nhân viên kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Nhập kho | 2. Hiển thị danh sách lô nguyên vật liệu đã được kiểm tra chất lượng đạt, đang chờ nhập kho (LoNguyenVatLieu, KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| 3. Chọn lô nguyên vật liệu và nhập thông tin thực nhập (vị trí lưu kho, ngày nhập); số lượng thực nhập mặc định theo số lượng đạt đã được Bộ phận QC/AC ghi nhận (ví dụ: 95) (LoNguyenVatLieu, Kho, ChiTietPhieuKho, ChiTietKetQuaKiemTraQCAC) | 4. Kiểm tra thông tin thực nhập (ChiTietPhieuKho, Kho) |
| 5. Xác nhận nhập kho | 6. Cập nhật tồn kho và tạo phiếu nhập kho (TonKho, PhieuKho, ChiTietPhieuKho) |

#### Luồng thay thế


**4.1 Số lượng thực nhập khác với kế hoạch**

- 1. Hệ thống ghi nhận chênh lệch giữa số lượng thực nhập và kế hoạch (ChiTietPhieuKho, ChiTietYeuCauNhapXuat)
- 2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)
- 3. Quay lại bước 3

#### Luồng ngoại lệ


**4.1 Thông tin nhập kho không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)
- 2. Quay lại bước 2

### UC-11 Xuất kho

**Tiền điều kiện:** Nhân viên kho đăng nhập thành công vào hệ thống; kế hoạch xuất hàng liên quan đã được Ban giám đốc phê duyệt (UC-32 Phê duyệt kế hoạch mua/bán) và thành phẩm đã đạt kiểm tra chất lượng

**Hậu điều kiện:** Thành phẩm trong kho được cập nhật lại số lượng

**Actor chính:** Nhân viên kho

**Actor phụ:** Không


#### Luồng cơ bản

| Nhân viên kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xuất kho | 2. Hiển thị danh sách yêu cầu/kế hoạch chờ xuất kho (YeuCauNhapXuat, KeHoachMuaBan) |
| 3. Chọn yêu cầu và nhập thông tin thực xuất (số lượng, thành phẩm, ngày xuất) (YeuCauNhapXuat, ChiTietPhieuKho, MatHang, LoThanhPham) | 4. Kiểm tra số lượng tồn kho khả dụng (TonKho, LoThanhPham) |
| 5. Xác nhận xuất kho | 6. Cập nhật tồn kho và tạo phiếu xuất kho (TonKho, PhieuKho, ChiTietPhieuKho) |

#### Luồng thay thế


**4.1 Số lượng thực xuất khác với kế hoạch**

- 1. Hệ thống ghi nhận chênh lệch giữa số lượng thực xuất và kế hoạch (ChiTietPhieuKho, ChiTietYeuCauNhapXuat)
- 2. Nhân viên nhập lý do chênh lệch (ChiTietPhieuKho)
- 3. Đi đến bước 5

#### Luồng ngoại lệ


**4.1 Thông tin xuất kho không hợp lệ hoặc số lượng tồn kho không đủ khả dụng (kể cả do vừa được xuất bởi yêu cầu khác)**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (PhieuKho, ChiTietPhieuKho, TonKho)
- 2. Quay lại bước 2

### UC-35 Báo cáo thành phẩm

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống và lô thành phẩm đã hoàn thành sản xuất

**Hậu điều kiện:** Báo cáo thành phẩm được lưu và gửi cho Ban giám đốc

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Báo cáo thành phẩm | 2. Hiển thị form báo cáo thành phẩm |
| 3. Nhập số lượng thành phẩm, lượng nguyên vật liệu đã sử dụng, ngày hoàn thành, hạn sử dụng và ghi chú | 4. Kiểm tra thông tin báo cáo thành phẩm |
| 5. Xác nhận gửi báo cáo | 6. Lưu báo cáo thành phẩm và gửi cho Ban giám đốc |

#### Luồng thay thế


**5.1 Hủy trước khi xác nhận gửi báo cáo**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin báo cáo đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Thông tin báo cáo thành phẩm chưa đầy đủ hoặc không hợp lệ**

- 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại
- 2. Quay lại bước 3

### UC-01 Đăng nhập

**Tiền điều kiện:** Người dùng đã được cấp tài khoản trong hệ thống

**Hậu điều kiện:** Người dùng đăng nhập thành công và truy cập được các chức năng theo quyền hạn được cấp

**Actor chính:** Người dùng

**Actor phụ:** Không


#### Luồng cơ bản

| Người dùng | Hệ thống |
| --- | --- |
| 1. Truy cập màn hình đăng nhập | 2. Hiển thị form đăng nhập gồm tên đăng nhập và mật khẩu (NguoiDung) |
| 3. Nhập tên đăng nhập, mật khẩu và chọn Đăng nhập (NguoiDung) | 4. Kiểm tra thông tin đăng nhập (NguoiDung) |
| 5. Xem kết quả đăng nhập | 6. Hiển thị màn hình chính theo quyền của người dùng (NguoiDung, VaiTro) |

#### Luồng thay thế


**3.1 Sai tên đăng nhập hoặc mật khẩu**

- 1. Hệ thống thông báo tên đăng nhập hoặc mật khẩu không đúng (NguoiDung)
- 2. Quay lại bước 2

**3.2 Bỏ trống thông tin đăng nhập**

- 1. Hệ thống thông báo yêu cầu nhập đầy đủ tên đăng nhập và mật khẩu (NguoiDung)
- 2. Quay lại bước 2

#### Luồng ngoại lệ


**4.1 Tài khoản bị khóa**

- 1. Hệ thống thông báo tài khoản đã bị khóa, hướng dẫn liên hệ quản trị viên (NguoiDung)
- 2. Kết thúc use case

### UC-12 Quản lý kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập

**Hậu điều kiện:** Danh sách kết quả kiểm tra chất lượng được hiển thị/tìm kiếm theo yêu cầu

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý kết quả kiểm tra chất lượng | 2. Hiển thị danh sách kết quả kiểm tra chất lượng (KetQuaKiemTraQCAC) |
| 3. Chọn một kết quả để xem chi tiết (KetQuaKiemTraQCAC) | 4. Hiển thị chi tiết kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC, MatHang, LoHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc kết quả (đạt/không đạt, thời gian, phiếu nhập kho)**

- 1. Nhân viên nhập điều kiện lọc (KetQuaKiemTraQCAC, PhieuKho)
- 2. Hệ thống hiển thị kết quả phù hợp (KetQuaKiemTraQCAC)
- 3. Quay lại bước 1

**2.1 Chọn Thêm**

- 1. Hệ thống thực hiện UC-12.1

**4.1 Chọn Sửa**

- 1. Hệ thống thực hiện UC-12.2

**4.2 Chọn Xóa**

- 1. Hệ thống thực hiện UC-12.3

**4.3 Kết quả ghi nhận "không đạt"**

- 1. Hệ thống lưu kết quả không đạt và ghi nhận trạng thái để tiếp tục xử lý hàng lỗi

#### Luồng ngoại lệ


**1.1 Không có kết quả phù hợp**

- 1. Hệ thống thông báo không tìm thấy kết quả phù hợp (KetQuaKiemTraQCAC)
- 2. Quay lại bước 1

### UC-12.1 Thêm kết quả kiểm tra QC/AC

**Tiền điều kiện:** Có phiếu nhập kho/ mặt hàng cần kiểm tra chất lượng

**Hậu điều kiện:** Kết quả kiểm tra chất lượng mới được lưu vào hệ thống

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn Thêm kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 2. Hiển thị form thêm kết quả kiểm tra (KetQuaKiemTraQCAC, LoHang, MatHang) |
| 3. Nhập thông tin kết quả kiểm tra (đạt/không đạt, ghi chú) và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 4. Kiểm tra, lưu và cập nhật danh sách kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thông tin đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

**3.2 Thông tin nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

### UC-12.2 Sửa kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra chất lượng được cập nhật chính xác

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn một kết quả và chọn Sửa (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 2. Hệ thống hiển thị form với thông tin hiện tại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |
| 3. Chỉnh sửa thông tin và xác nhận (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) | 4. Hệ thống kiểm tra và cập nhật kết quả kiểm tra (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thông tin đã chỉnh sửa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi và yêu cầu nhập lại (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

**3.2 Thông tin nhập bị bỏ trống**

- 1. Hệ thống thông báo vui lòng nhập đầy đủ thông tin (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC)
- 2. Quay lại bước 3

### UC-12.3 Xóa kết quả kiểm tra QC/AC

**Tiền điều kiện:** Bộ phận QC/AC đã đăng nhập hệ thống; kết quả kiểm tra đang được chọn từ danh sách

**Hậu điều kiện:** Kết quả kiểm tra bị xóa khỏi danh sách

**Actor chính:** Bộ phận QC/AC

**Actor phụ:** Không


#### Luồng cơ bản

| Bộ phận QC/AC | Hệ thống |
| --- | --- |
| 1. Chọn một kết quả và chọn Xóa (KetQuaKiemTraQCAC) | 2. Hệ thống kiểm tra kết quả đã được sử dụng làm căn cứ xử lý hay chưa (KetQuaKiemTraQCAC, DeXuatXuLyNgoaiLe) |
|  | 3. Hệ thống yêu cầu xác nhận xóa (KetQuaKiemTraQCAC) |
| 4. Xác nhận xóa | 5. Hệ thống xóa kết quả khỏi danh sách (KetQuaKiemTraQCAC, ChiTietKetQuaKiemTraQCAC) |

#### Luồng thay thế


**4.1 Hủy khi được yêu cầu xác nhận xóa**

- 1. Bộ phận QC/AC chọn Hủy
- 2. Hệ thống hủy thao tác xóa
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Kết quả đã được dùng làm căn cứ xử lý hàng lỗi**

- 1. Hệ thống thông báo không thể xóa (KetQuaKiemTraQCAC)
- 2. Kết thúc use case

### UC-34 Lập phiếu báo cáo sản xuất

**Tiền điều kiện:** Chủ xưởng đã đăng nhập hệ thống và có kế hoạch sản xuất cần báo cáo

**Hậu điều kiện:** Phiếu báo cáo sản xuất được lưu và gửi cho Bộ phận lập kế hoạch

**Actor chính:** Chủ xưởng

**Actor phụ:** Không


#### Luồng cơ bản

| Chủ xưởng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập phiếu báo cáo sản xuất | 2. Hiển thị form lập phiếu báo cáo sản xuất |
| 3. Nhập số lượng tồn kho, số lượng cần thiết và ghi chú yêu cầu nhập nguyên vật liệu | 4. Kiểm tra thông tin phiếu báo cáo sản xuất |
| 5. Xác nhận gửi phiếu | 6. Lưu phiếu báo cáo sản xuất và gửi cho Bộ phận lập kế hoạch |

#### Luồng thay thế


**3.1 Hủy trước khi xác nhận gửi phiếu**

- 1. Chủ xưởng chọn Hủy
- 2. Hệ thống hủy thông tin phiếu đã nhập
- 3. Kết thúc use case

#### Luồng ngoại lệ


**4.1 Thông tin phiếu báo cáo sản xuất chưa đầy đủ hoặc không hợp lệ**

- 1. Hệ thống thông báo thông tin không hợp lệ và yêu cầu nhập lại
- 2. Quay lại bước 3

### UC-15 Thực hiện kiểm kê

**Tiền điều kiện:** Ban kiểm kê đã được phân công cho đợt kiểm kê

**Hậu điều kiện:** Số lượng thực tế của hàng hóa được ghi nhận cho đợt kiểm kê

**Actor chính:** Ban kiểm kê

**Actor phụ:** Không


#### Luồng cơ bản

| Ban kiểm kê | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Thực hiện kiểm kê | 2. Hiển thị danh sách mặt hàng cần kiểm kê thuộc khu vực được phân công (CongViec, KiemKe, ChiTietKiemKe, MatHang, Kho) |
| 3. Nhập số lượng thực tế đếm được cho từng mặt hàng (KiemKe, ChiTietKiemKe) | 4. Ghi nhận số liệu kiểm kê (KiemKe, ChiTietKiemKe) |
| 5. Xác nhận hoàn thành kiểm kê khu vực (KiemKe) | 6. Cập nhật trạng thái hoàn thành và lưu kết quả kiểm kê (KiemKe, ChiTietKiemKe) |

#### Luồng thay thế


**2.1 Tạm dừng kiểm kê**

- 1. Nhân viên chọn Lưu tạm để tiếp tục sau (KiemKe, ChiTietKiemKe)
- 2. Hệ thống lưu tạm số liệu đã nhập (KiemKe, ChiTietKiemKe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Mất kết nối trong khi nhập số liệu**

- 1. Hệ thống thông báo lỗi kết nối và giữ lại số liệu đã nhập cục bộ (KiemKe, ChiTietKiemKe)
- 2. Nhân viên thử lại khi có kết nối (KiemKe, ChiTietKiemKe)
- 3. Quay lại bước 2

### UC-28 Lập biên bản kiểm kê

**Tiền điều kiện:** Đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Biên bản kiểm kê được lập và gửi cho Ban giám đốc

**Actor chính:** Ban kiểm kê

**Actor phụ:** Không


#### Luồng cơ bản

| Ban kiểm kê | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Lập biên bản kiểm kê | 2. Hiển thị số liệu tổng hợp của đợt kiểm kê (số liệu thực tế, số liệu hệ thống, chênh lệch) (KiemKe, ChiTietKiemKe) |
| 3. Nhập nội dung biên bản (nhận xét, xác nhận) và xác nhận lập biên bản (KiemKe) | 4. Tạo biên bản kiểm kê và gửi cho Ban giám đốc (KiemKe) |

#### Luồng thay thế


**3.1 Lưu tạm biên bản**

- 1. Nhân viên chọn Lưu tạm (KiemKe)
- 2. Hệ thống lưu tạm nội dung đã nhập (KiemKe, ChiTietKiemKe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Đợt kiểm kê chưa hoàn thành**

- 1. Hệ thống thông báo còn khu vực chưa kiểm kê xong, chưa thể lập biên bản (KiemKe, ChiTietKiemKe)
- 2. Kết thúc use case

### UC-32 Phê duyệt kế hoạch mua/bán

**Tiền điều kiện:** Ban giám đốc đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Kế hoạch được phê duyệt hoặc từ chối và trạng thái kế hoạch được cập nhật

**Actor chính:** Ban giám đốc

**Actor phụ:** Không


#### Luồng cơ bản

| Ban giám đốc | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Phê duyệt kế hoạch mua/bán | 2. Hiển thị danh sách kế hoạch đang chờ phê duyệt (KeHoachMuaBan) |
| 3. Chọn một kế hoạch để xem chi tiết (KeHoachMuaBan) | 4. Hiển thị thông tin chi tiết kế hoạch (loại kế hoạch, nhà cung cấp/khách hàng, số lượng, tổng tiền) (KeHoachMuaBan, ChiTietKeHoachMuaBan, NhaCungCap, KhachHang) |
| 5. Chọn Phê duyệt (KeHoachMuaBan) | 6. Cập nhật trạng thái kế hoạch thành Đã duyệt để chuyển sang thực hiện Mua hàng/Nhập kho hoặc Xuất kho (KeHoachMuaBan) |

#### Luồng thay thế


**5.1 Từ chối kế hoạch và có nhập lý do**

- 1. Ban giám đốc chọn Từ chối và nhập lý do (KeHoachMuaBan)
- 2. Hệ thống cập nhật trạng thái kế hoạch bị từ chối và thông báo cho Bộ phận lập kế hoạch (KeHoachMuaBan)
- 3. Kết thúc UC

**5.2 Từ chối kế hoạch và không nhập lý do**

- 1. Ban giám đốc chọn Từ chối và không nhập lý do (KeHoachMuaBan)
- 2. Hệ thống thông báo yêu cầu nhập lý do từ chối (KeHoachMuaBan)
- 3. Quay lại bước 4

#### Luồng ngoại lệ


**4.1 Không có kế hoạch đang chờ phê duyệt trong hệ thống**

- 1. Hệ thống thông báo không có kế hoạch đang chờ phê duyệt (KeHoachMuaBan)
- 2. Kết thúc UC

**4.1 Kế hoạch không còn ở trạng thái chờ phê duyệt (đã được xử lý bởi người khác)**

- 1. Hệ thống thông báo kế hoạch không còn hiệu lực để phê duyệt (KeHoachMuaBan)
- 2. Quay lại bước 1

### UC-02 Đặt đơn hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập hệ thống

**Hậu điều kiện:** Đơn hàng mới được tạo và lưu vào hệ thống với trạng thái chờ xử lý

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Đặt đơn hàng | 2. Hiển thị danh sách hàng mẫu để lựa chọn (MatHang, LoaiHang) |
| 3. Chọn sản phẩm, nhập số lượng, thông tin giao hàng gồm: địa chỉ, ngày nhận hàng trễ nhất, ghi chú (MatHang, ChiTietDonHang, DonHang, KhachHang) |  |
| 4. Xác nhận đặt hàng | 5. Kiểm tra thông tin đơn hàng (DonHang, ChiTietDonHang) |
|  | 6. Lưu đơn hàng và thông báo đặt hàng thành công (DonHang, ChiTietDonHang, KhachHang) |

#### Luồng thay thế


**4.1 Khách hàng chọn Quay lại**

- 1. Quay lại bước 2

#### Luồng ngoại lệ


**2.1 Danh sách hàng mẫu không có**

- 1. Hệ thống thông báo danh sách hàng mẫu đang rỗng (MatHang)
- 2. Kết thúc UC

**5.1 Thông tin đơn hàng không hợp lệ**

- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

**5.2 Thông tin ngày nhận là ngày trong quá khứ**

- 1. Hệ thống thông báo lỗi thông tin ngày nhận hàng không hợp lệ và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

### UC-03 Quản lý đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đã đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Danh sách đơn hàng của khách hàng được hiển thị đúng thông tin và có thể thực hiện các chức năng mở rộng

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Quản lý đơn hàng | 2. Hiển thị danh sách đơn hàng hiện có của khách hàng (DonHang, KhachHang) |
| 3. Chọn một đơn hàng để xem chi tiết (DonHang) | 4. Hiển thị thông tin chi tiết đơn hàng (DonHang, ChiTietDonHang, MatHang) |

#### Luồng thay thế


**1.1 Tìm kiếm/lọc đơn hàng theo trạng thái, thời gian**

- 1. Khách hàng nhập điều kiện tìm kiếm (DonHang)
- 2. Hệ thống hiển thị các đơn hàng phù hợp (DonHang)
- 3. Quay lại bước 1

**4.1 Chọn Sửa đơn hàng**

- 1. Hệ thống thực hiện UC-03.1 Sửa đơn hàng khách hàng

#### Luồng ngoại lệ


**2.1 Không có đơn hàng nào trong hệ thống**

- 1. Hệ thống thông báo không có đơn hàng nào (DonHang)
- 2. Kết thúc UC

### UC-03.1 Sửa đơn hàng khách hàng

**Tiền điều kiện:** Khách hàng đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Thông tin đơn hàng khách hàng được cập nhật chính xác trong hệ thống với trạng thái chờ phê duyệt (Ban giám đốc thực hiện UC-31 Phê duyệt đơn hàng)

**Actor chính:** Khách hàng

**Actor phụ:** Không


#### Luồng cơ bản

| Khách hàng | Hệ thống |
| --- | --- |
| 1. Chọn Sửa đơn hàng (DonHang) | 2. Hiển thị form với thông tin hiện tại của đơn hàng (DonHang, ChiTietDonHang) |
| 3. Nhập thông tin muốn chỉnh sửa (số lượng, mô tả) (DonHang, ChiTietDonHang) |  |
| 4. Chọn xác nhận | 5. Kiểm tra thông tin mới (DonHang, ChiTietDonHang) |
|  | 6. Cập nhật đơn hàng lên hệ thống với trạng thái chờ phê duyệt (DonHang, ChiTietDonHang) |
|  | 7. Thông báo đơn hàng đã được cập nhật và cần chờ phê duyệt (DonHang, ChiTietDonHang) |

#### Luồng thay thế


**2.1 Khách hàng chọn Quay lại**

- 1. Đi đến bước 4 của UC-03 (hủy thao tác sửa)

**5.1 Nếu khách hàng tăng số lượng đơn hàng**

- 1. Hệ thống thông báo thời gian nhận hàng dự kiến có thể tăng tùy theo quy mô đơn hàng (DonHang)
- 2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)
- 3. Đi đến bước 6

**5.2 Nếu khách hàng giảm số lượng đơn hàng**

- 1. Hệ thống thông báo việc giảm số lượng đơn hàng có thể phải chịu đền bù đặt cọc dựa vào hợp đồng (DonHang, ChiTietDonHang)
- 2. Khách hàng chọn xác nhận (DonHang, ChiTietDonHang)
- 3. Đi đến bước 6

#### Luồng ngoại lệ


**1.1 Đơn hàng không ở trạng thái cho phép sửa**

- 1. Hệ thống thông báo đơn hàng đã được xử lý/duyệt, không thể chỉnh sửa (DonHang)
- 2. Kết thúc use case

**5.1 Thông tin nhập không hợp lệ**

- 1. Hệ thống thông báo lỗi (thiếu thông tin/số lượng không hợp lệ) và yêu cầu nhập lại (DonHang, ChiTietDonHang)
- 2. Quay lại bước 3

### UC-22 Tra cứu dữ liệu trong kho

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống

**Hậu điều kiện:** Người dùng xem được thông tin danh mục/dữ liệu phù hợp với nhu cầu tra cứu

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Tra cứu dữ liệu | 2. Hiển thị danh sách danh mục hàng hóa (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |
| 3. Nhập tên (kho, danh mục, nguyên vật liệu, thành phẩm, tồn kho, lô nguyên vật liệu, lô thành phẩm) để tìm kiếm (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) | 4. Hiển thị các danh mục/dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |
| 5. Chọn một mục để xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) | 6. Hiển thị thông tin chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham) |

#### Luồng thay thế


**5.1 Chỉ xem danh sách, không xem chi tiết**

- 1. Quản lý kho chỉ xem danh sách phù hợp mà không chọn xem chi tiết (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)
- 2. Kết thúc use case

#### Luồng ngoại lệ


**3.1 Không tìm thấy dữ liệu phù hợp**

- 1. Hệ thống thông báo không tìm thấy dữ liệu phù hợp (Kho, LoaiHang, MatHang, TonKho, LoNguyenVatLieu, LoThanhPham)
- 2. Quay lại bước 3

### UC-16 Xử lý chênh lệch kiểm kê

**Tiền điều kiện:** Quản lý kho đăng nhập thành công vào hệ thống và đợt kiểm kê đã hoàn thành

**Hậu điều kiện:** Chênh lệch kiểm kê được ghi nhận nguyên nhân và phương án xử lý

**Actor chính:** Quản lý kho

**Actor phụ:** Không


#### Luồng cơ bản

| Quản lý kho | Hệ thống |
| --- | --- |
| 1. Chọn chức năng Xử lý chênh lệch kiểm kê | 2. Hiển thị danh sách mặt hàng có chênh lệch sau kiểm kê (ChiTietKiemKe, MatHang) |
| 3. Chọn mặt hàng (ChiTietKiemKe, MatHang) | 4. Hiển thị thông tin chi tiết mặt hàng gồm: loại hàng, số lượng, bị vấn đề gì (ChiTietKiemKe, MatHang, LoaiHang, LoHang) |
| 5. Nhập đề xuất xử lý (KiemKe, ChiTietKiemKe) |  |
| 4. Xác nhận xử lý chênh lệch (ChiTietKiemKe) | 6. Cập nhật tồn kho theo phương án xử lý và lưu kết quả (TonKho, ChiTietKiemKe) |

#### Luồng thay thế


**4.1 Chênh lệch vượt hạn mức xử lý**

- 1. Nếu quản lý cảm thấy mức độ chênh lệch và độ nghiêm trọng cao có thể gửi đề xuất xử lý cho Ban giám đốc (DeXuatXuLyNgoaiLe)
- 2. Hệ thống chuyển đề xuất xử lý sang chờ phê duyệt (DeXuatXuLyNgoaiLe)
- 3. Kết thúc use case

#### Luồng ngoại lệ


**2.1 Không có chênh lệch cần xử lý**

- 1. Hệ thống thông báo không có mặt hàng chênh lệch (KiemKe, ChiTietKiemKe)
- 2. Kết thúc use case

