## Cập nhật: UC-23 nhập thành phẩm từng phần

Đã triển khai nhập tay từng đợt theo KHSX, chung một LoHang, mỗi đợt có ChiTietLo riêng để QC. Chưa cần báo cáo tổng kết khi lập đợt; chỉ phần đạt QC vào tồn. Tổng kết lấy lại các dòng lô đã ghi nhận, không tạo lô/nhập trùng; giữ lượng thực sản xuất, không ép bằng hoặc dưới dự kiến. Migration service 004 giữ dữ liệu cũ. Chi tiết, quyền và API: [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md). Các ghi chú bên dưới nói UC-23 từng phần chưa làm thuộc mốc trước thay đổi này.

## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Tiến độ triển khai theo docs cập nhật

## Mới nhất: runtime microservice, CSDL giữ nguyên theo yêu cầu

Đã chuyển 15 module và registry vào `src/services` theo owner. Mỗi Identity/Business/Warehouse/Notification/Reporting/Web Gateway có index.js và Dockerfile riêng. Các thư mục service/app ngoài src và src/modules cũ đã bỏ. Compose chạy sáu container/process độc lập; chỉ gateway publish 3000, backend trong network private. API gateway proxy về owner, SSR dùng HTTP clients; backend lấy lại actor từ Identity, ký request nội bộ, có allowlist RPC, timeout và không tự retry mutation.

Setup thêm khóa internal_secret mà không xoay khóa cũ; migration/seed được chạy bởi job migrate trước backend. Không thêm migration, schema vẫn 026 và volume cũ. Chưa tách database/account, JOIN/FK xuyên boundary hoặc thông báo SQL trực tiếp; Reporting chưa là projection, chưa broker/outbox/inbox/claims/saga. Các việc dữ liệu được hoãn đúng yêu cầu người dùng.

33 kiểm thử Node và syntax đạt. Nghiệm thu MySQL cô lập đã chạy sáu HTTP process riêng: signature/owner/raw-SQL guard, user hash không trả, role giả/phiên cũ bị chặn; các luồng đơn/kế hoạch/mua/nhận lô/QC/nhập/xuất/kiểm kê/báo cáo/hàng trả đạt. Sau lần chuyển module và build cuối, đã chạy lại thành công nghiệm thu MySQL, browser form import và EJS/Adminer qua gateway; sáu container service đều healthy. Hướng dẫn: [services README](../src/services/README.md). Backlog UC và kế hoạch tách dữ liệu không được coi là hoàn tất chỉ vì runtime đã tách.

## Lịch sử — 13/10/2026: chia code theo tám boundary (đã được thay bằng runtime ở trên)

Runtime MySQL khởi tạo Identity, Catalog, Sales, Production, Procurement, Warehouse & Quality, Notification, Reporting qua composition riêng. `app/services` có năm nhóm backend, `app/apps/web-gateway` có entrypoint Express/EJS được bootstrap gọi; vẫn chạy cùng process/CSDL. Catalog và Warehouse có repository/writer giới hạn resource; lô chuyển sang LotService ở warehouse. Kế hoạch SALE/PURCHASE có port riêng và adapter điều phối mutation theo owner; transaction cũ vẫn giữ.

Không thêm migration, schema vẫn 026 và giữ dữ liệu. Dockerfile copy cấu trúc mới; Compose vẫn chạy app monolith. 30 kiểm thử Node (gồm bốn kiểm thử boundary), syntax, nghiệm thu MySQL cô lập và browser form import đạt. Kiểm thử SQL đã chạy lại duyệt đơn/kế hoạch, mua cạnh tranh/hạn mức, nhận lô, QC, giữ chỗ, nhập/xuất, kiểm kê/ngoại lệ, hai loại báo cáo và hàng trả.

Còn lại của P1: tách SQL/routes/source clients theo owner, UnitOfWork và hợp đồng liên boundary đầy đủ. Chưa chuyển thành microservice deploy độc lập; chưa outbox/inbox/broker, DB/accounts riêng, projections hay source claims/saga. P0 backup/restore cho cutover chưa được thực hiện trong đợt refactor này. Backlog UC-23 nhập TP từng phần cùng lô và các phần còn thiếu giữ nguyên.

## Mới nhất — 12/10/2026: UC-34/UC-35

UC-34 có tiến độ/sự cố/thiếu NVL khi kế hoạch còn đang sản xuất. Tiến độ/sự cố không bắt nhập NVL, lập được nhiều báo cáo; mô tả bắt buộc, tiến độ tùy chọn dưới 100%. BGĐ luôn nhận khi gửi; planner chỉ xem/nhận khi chọn gửi thêm. NHU_CAU giữ nguồn NVL và một hồ sơ mỗi kế hoạch để không cấp/mua trùng; các mục đích khác không xuất hiện trong nguồn mua/cấp.

UC-35 là báo cáo tổng kết khi chủ xưởng xác nhận hoàn tất toàn bộ, có thành phẩm thực tế/ngày hoàn tất/NVL sử dụng. Không ép sản lượng thực tế bằng kế hoạch. Một báo cáo tổng kết mới mỗi kế hoạch; gửi chuyển kế hoạch COMPLETED và chặn báo cáo đang sản xuất mới. Báo cáo đã gửi giữ bất biến.

Migration 026 mở rộng cùng bảng BanBaoCaoSanXuat, giữ view/API và dữ liệu cũ; xác nhận hoàn tất báo cáo lịch sử để NULL, không suy đoán. Không sửa UC-23 nhập thành phẩm từng phần cùng lô trong đợt này.

Docker đã khởi động lại, migration 026 áp dụng và app healthy. Nghiệm thu MySQL cô lập đạt nhiều báo cáo, sửa nháp/gửi/bất biến, thông báo và quyền người nhận, nguồn mua/cấp không nhận báo cáo sự cố, hoàn tất kế hoạch và các luồng mua–QC–nhập/xuất cũ. 26 kiểm thử Node và cú pháp đạt. Browser form báo cáo mới và hồi quy form import đạt; thao tác ghi ở browser được giả lập, backend được kiểm trên SQL thật.

## Mới nhất: sáu luồng lấy nguồn vào form

Đã bổ sung tự điền đơn → kế hoạch SX, kế hoạch → báo cáo SX, báo cáo → đơn mua, đơn mua → nhận lô/nhập QC đạt, báo cáo thành phẩm + QC/tồn/kiểm kê → xuất thành phẩm và kế hoạch → xuất NVL. Chỉ điền form, người dùng kiểm tra/chỉnh trước lưu; phân công/QC/ghi phiếu vẫn dùng luồng hiện hữu.

Đơn mua hỗ trợ MANUAL/REPORT/PLAN. REPORT có hạn mức chung với kế hoạch mua; MANUAL không tự gắn báo cáo. NVL xuất PLAN/REPORT cùng tính tổng yêu cầu theo kế hoạch; PLAN dùng nhu cầu nhỏ hơn nếu báo cáo thực tế đã gửi. Xuất thành phẩm chọn kế hoạch bán đã duyệt của báo cáo, đối chiếu tồn QC đạt còn khả dụng và kết quả kiểm kê gần nhất nếu có. Chưa có kiểm kê không tạo số đếm giả; kho khóa không được ghi phiếu.

Migration 025 giữ dữ liệu cũ. API import chỉ trả thông tin cần thiết theo vai trò; không mở quyền đọc báo cáo/đơn mua tổng quát. Nghiệm thu MySQL cô lập đạt gồm mua trực tiếp cạnh tranh, hạn mức chung, nhận mua thủ công, tính tiền chính xác, lượng còn lại, cấp NVL nguồn PLAN và các luồng cũ. 26 Node tests và syntax đạt. Browser import đạt đổi nguồn/đổi chế độ, bỏ phản hồi cũ, payload không giữ nguồn ẩn; nguồn và thao tác ghi trong browser được giả lập để không tác động DB chính. Browser Docker hồi quy đạt.

Docker đã build và healthy, migration đến 025; dữ liệu cũ được giữ. Phạm vi triển khai MySQL; demo bộ nhớ giữ luồng cũ. Chưa bổ sung BOM tự tính NVL từ loại bánh, giao bù/hoàn tiền, xử lý tồn cách ly sau QC hoặc bù QC hàng đã nhập. Các ghi chú dưới đây là lịch sử.

## Mới nhất: tiếp nhận hàng khách trả

Đã triển khai màn hình `/customer-returns`: quản lý lập lô trả theo dòng phiếu giao khách đã ghi sổ, chọn kho/vị trí và nhân viên nhận. Mỗi lô trả thuộc một đơn hàng. Giới hạn cộng dồn gồm lượng chờ nhận và đã nhận; hủy trước nhận giải phóng hạn mức. Nhân viên được giao xác nhận để tạo phiếu nhập, dòng lô mới, tồn QUARANTINE và movement trong một transaction; gửi lại không nhập trùng. Kho đang khóa kiểm kê không được nhận.

Migration 024 bổ sung nguồn trả trên LoHang, ChiTietLoTraVe, PhieuKho và ChiTietPhieuKho, giữ dữ liệu cũ. QC kiểm tra lô trả qua lịch QC hiện hữu; hàng vẫn cách ly kể cả đạt. Giữ lịch sử giao và trạng thái đơn; không tự giao bù, hoàn tiền hoặc chuyển sang tồn khả dụng. Chặn áp dụng ngoại lệ QC trên hàng đã nhập có tồn vì cần quy trình điều chỉnh tồn riêng.

Nghiệm thu MySQL cô lập đạt: trả cạnh tranh không vượt lượng giao, quyền tạo/nhận, phạm vi nhân viên, nhận lại không tăng tồn, hủy, QC hàng trả và đơn hàng không đổi. 26 kiểm thử Node đạt; kiểm tra cú pháp và trình duyệt Docker đạt. Màn hình hàng trả mở được cho bốn vai trò; form quản lý và lọc vị trí đã kiểm tra với nguồn giao giả lập trên trình duyệt, không ghi vào DB chính; backend dùng dữ liệu thật trên DB kiểm thử. Ảnh form tại `app/artifacts/customer-return-form.png`. Docker healthy, migration đến 024. Các ghi chú bên dưới là lịch sử đợt trước.

Còn cần triển khai/nghiệm thu: xử lý tồn cách ly sau QC, bù QC khi hàng đã nhập/phân bổ/trả và quản trị phòng ban/chức danh. Chưa chứng nhận toàn bộ 48 UC và mọi nhánh.

## Nghiệp vụ bổ sung — tái kiểm và kết luận QC

Migration 022 tạo TaiKiemChatLuong, lưu từng kết luận tái kiểm theo phiên bản đề xuất. RELEASE: đề xuất từ QC lỗi chưa trả → giám đốc duyệt → QC phụ trách tái kiểm → quản lý áp dụng khi lần kiểm mới nhất đạt. Không tự nhập kho; cập nhật phần đạt/lỗi có chứng từ bù QC và giữ ảnh trước/sau. Hàng hết hạn, chưa duyệt, chưa kiểm, kiểm không đạt, sai actor hoặc sai phiên bản đều bị chặn. Ghi nhận lần kiểm lỗi rồi kiểm đạt vẫn giữ cả hai lần; thực hiện lần hai bị chặn.

Migration 023 tạo phân công QC lập kết luận trên từng PhieuKiemKe, nhận conclusion_assignee_ids tùy chọn tại lập đợt COUNT. QC được giao xem số đếm và lập/sửa/gửi kết luận khi kho đã hoàn tất đếm; không được nhập số đếm. Ban kiểm kê vẫn có quyền kết luận hiện hữu. Không mở quyền trên kho ngoài phân công.

UC-22 mở đọc mặt hàng, loại hàng, kho, vị trí và dòng lô cho chủ xưởng; menu EJS/JavaScript và API cùng quyền. catalog-data mặc định vẫn trả báo cáo tồn, thêm resource để tra danh mục. Quyền tạo/sửa/xóa giữ cho quản lý kho.

Nghiệm thu MySQL trên KhoHang_Acceptance_20261012: tái kiểm trước duyệt bị chặn; quản lý áp dụng trước/không đạt bị chặn; QC khác vai trò bị chặn; lịch sử hai lần kiểm; bù QC; không có movement trước nhập; nhập/giao tiếp theo thành công. QC được phân công lập/gửi kết luận, không đếm và không lập trước hoàn tất. Kiểm tra chủ xưởng đọc danh mục nhưng không ghi.

Phần còn lại: tiếp nhận hàng khách trả và chính sách giao bù; bù QC giảm lượng đạt sau khi đã nhập/phân bổ/trả cần quy trình cách ly/điều chỉnh riêng; quản trị phòng ban/chức danh. Các phần này chưa được chứng nhận hoàn tất bởi kiểm thử trên.

Kết quả cuối: Docker healthy, migration đến 023; 26 kiểm thử Node và kiểm tra cú pháp đạt. Bộ nghiệm thu MySQL cô lập đạt sau ràng buộc bù QC không đảo ngoại lệ đã có hiệu lực. Trình duyệt đạt form RELEASE, phân công QC lập kết luận, màn hình QC biên bản và danh mục chủ xưởng chỉ đọc. Chưa chứng nhận toàn bộ 48 UC và mọi nhánh.

## Cập nhật nhận diện xưởng bánh — 11/10/2026

Giao diện EJS/JavaScript chuyển sang Sweet Bakery, hồng–đen–trắng, tăng cỡ chữ và cải thiện thẻ, nút, bảng, đăng nhập, dashboard và bố cục điện thoại. Migration 020 đổi tên danh mục mẫu theo mã/tên gốc; 021 cập nhật giá tham khảo mặc định và chỉ đổi đơn vị nguyên liệu khi chưa có chứng từ tham chiếu. Giữ ID, giá và số lượng chứng từ lịch sử, tồn kho và mật khẩu. Seed mới dùng danh mục bánh đóng gói; dữ liệu hiện có được chuyển bằng migration, không phụ thuộc chạy lại seed.

Docker app healthy, migration đến 021. Kiểm tra cú pháp và 26 kiểm thử Node đạt; kiểm thử trình duyệt Docker đạt. Kiểm tra desktop 1440px, điện thoại 390px không tràn ngang trang đăng nhập/dashboard; ảnh tại app/artifacts/bakery-*.png. Đợt này không bổ sung hoặc nghiệm thu các UC còn thiếu bên dưới.

## Hiện trạng mới nhất — 11/10/2026

Phần này thay thế các nhận định hiện trạng trong ghi chú đợt trước bên dưới. Chưa nghiệm thu toàn bộ UC hoặc BR-01…BR-12.

### Đã triển khai trên Express/EJS/MySQL

- MUA lấy phần thiếu thực tế từ báo cáo sản xuất; BAN lấy nguồn báo cáo thành phẩm đúng đơn. Đối soát hạn mức cộng dồn trong transaction. Đơn mua lưu báo cáo nguồn trùng kế hoạch; một đơn mua/kế hoạch. Không suy đoán nguồn lịch sử.
- ChiTietKeHoachSanXuat là bảng chung thành phẩm/NVL; JSON outputs/materials giữ tương thích qua view. BanBaoCaoSanXuat và ChiTietBaoCaoSanXuat là bảng báo cáo chung; ChiTietLoBaoCaoSanXuat liên kết thành phẩm thực tế với dòng lô. Báo cáo thực tế không ghi đè dự kiến NVL của kế hoạch.
- LoHang là đầu lô, ChiTietLo là từng mặt hàng. Tiếp nhận nhiều dòng cùng nhà cung cấp trong một transaction. QC, phiếu, tồn và phân công tham chiếu dòng lô. Chặn lô hết hạn khi phân bổ và ghi phiếu.
- HoSoKho là view tổng hợp từ phiếu đã ghi; API tạo cũ trả hồ sơ suy ra, không tạo entity riêng.
- CongViec hỗ trợ phân công, chống lịch giao nhau kể cả request cạnh tranh, kiểm version và quyền cập nhật tiến độ. Công việc kho/QC xử lý qua nghiệp vụ nguồn.
- Chủ xưởng được đọc tồn; PLANNER được đọc báo cáo thành phẩm. Tổng tồn không cộng lẫn nhiều đơn vị tính.
- Thêm NhanVien/BoPhan và hồ sơ nhân viên theo tài khoản; chưa có quản trị phòng ban/chức danh đầy đủ.
- Yêu cầu xuất NVL/nhập thành phẩm nhận báo cáo thực tế đúng loại, tự suy ra kế hoạch/xưởng và chặn vượt nguồn cộng dồn. Tiêu hao không vượt NVL đã ghi phiếu cấp. Giao thành phẩm đối chiếu nguồn kế hoạch bán, cập nhật đơn khách IN_PROGRESS/COMPLETED.
- NVL dự kiến nhận số gốc, cộng 10% đúng một lần, làm tròn lên 3 chữ số, lưu SoLuongGoc/TyLeDuPhong/thiếu dự kiến. Báo cáo nhu cầu lấy tồn hệ thống trừ giữ chỗ và hàng hết hạn; chụp lại lúc gửi. Một báo cáo nhu cầu mỗi kế hoạch.
- Giữ chỗ khi phân công; quản lý hủy phần phân công chưa ghi để giải phóng, giữ nguyên phiếu đã ghi. Không tự hết hạn giữ chỗ.
- Kiểm kê SQL chụp snapshot theo kho, phân quyền người đếm, phân biệt null/0, khóa kho đến đóng đợt. Kết luận lưu trên PhieuKiemKe; BienBanKiemKe là view tương thích. Mọi chênh lệch cần giám đốc duyệt; quản lý áp dụng riêng, kiểm snapshot/giữ chỗ và chỉ tạo một biến động.
- BanDeXuatXuLyNgoaiLe có lịch sử KetQuaXuLyNgoaiLe; quyết định không tự ghi tồn. NVL lỗi tạo chứng từ trả NCC tham chiếu dòng QC và dòng lô gốc, không vào tồn khả dụng và không tự mua bù.
- QC đã ghi không sửa/xóa đè. Chứng từ bù giữ ảnh trước/sau và phiên bản cho dòng chưa nhập/phân bổ/trả. Dòng đã sử dụng bị chặn sửa trực tiếp, phải qua quy trình xử lý ngoại lệ/điều chỉnh.

Migration 008–019 bổ sung nguồn, bảng chung, chi tiết lô, hồ sơ suy ra, nhân viên, kết luận kiểm kê, lịch sử quyết định, dấu vết dự phòng, nguồn yêu cầu thực tế, trả NCC và chứng từ bù QC. Giữ bảng LuuTru để đối soát, không dùng cho nghiệp vụ mới; không sửa checksum migration đã chạy. JSON/API giữ tên tiếng Anh. lot_id là ID ChiTietLo; lot_header_id là ID LoHang. ID báo cáo thành phẩm sau gộp thuộc bảng chung; ID biên bản tương thích là ID phiếu kiểm kê, bản cũ nằm trong bảng lưu trữ để đối soát.

### Bằng chứng mới

- 26 kiểm thử Node pass; kiểm tra cú pháp JavaScript pass. Kiểm thử memory không chứng nhận các chức năng SQL còn thiếu.
- KhoHang_Acceptance_20261011 được tạo riêng từ rỗng, chạy migration/seed và kiểm thử schema, công việc, sản xuất, mua–QC–nhập kho: pass. Chạy lại sau sửa cuối: pass.
- KhoHang_Acceptance_20261012 xác nhận 0 đối tượng trước khi chạy, khởi tạo toàn bộ 001–019/seed và nghiệm thu cùng các luồng: pass. Kiểm thử cuối có nhập một phần và xuất phần đã nhập khi còn phân công nhập, không trừ nhầm giữ chỗ IN vào tồn OUT.
- Schema có 68 đối tượng SQL: 60 bảng, 8 view, bao gồm bảng kỹ thuật/lưu trữ/liên kết; không phải 60 entity nghiệp vụ. Kiểm tra 8 FK về ChiTietLo, bảng báo cáo chung, hồ sơ suy ra và chạy lại migration giữ ID/hash mật khẩu/lịch sử.
- Nghiệp vụ đã kiểm nguồn sai, giới hạn nhu cầu, request cạnh tranh, lô hai mặt hàng, QC theo dòng, ghi tồn đúng một lần, hồ sơ tự phát sinh và quyền.
- Kiểm kê–kết luận–duyệt–áp dụng–đóng đợt pass. Luồng mua–QC/trả–nhập NVL–cấp NVL–tiêu hao–QC/bù QC–nhập thành phẩm–duyệt bán–giao khách pass; hủy/phân bổ lại giải phóng giữ chỗ pass.
- Trình duyệt Docker pass: EJS không JavaScript, form MUA/BAN, form kiểm kê COUNT, trang công việc, phân quyền và Adminer.

Lệnh kiểm thử bổ sung: npm run test:tasks:db, test:stocktakes:db và test:acceptance:db. Lệnh acceptance yêu cầu DB_NAME theo mẫu KhoHang_Acceptance_YYYYMMDD và CSDL kiểm thử được tạo riêng.

### Phần còn lại

Các luồng chính ở trên đã có nghiệm thu SQL. Chưa chứng nhận mọi nhánh của toàn bộ UC: bù QC sau khi hàng đã nhập/trả/phân bổ bị chặn; chưa có màn hình chuyên biệt cho trả khách, tái kiểm/RELEASE sau xử lý ngoại lệ và quản trị phòng ban/chức danh. Điều chỉnh tồn kiểm kê cần số thực tế không thấp hơn giữ chỗ; quản lý giải phóng phân công trước nếu thiếu. Không tự suy đoán lịch sử hoặc tự mua bù.

Ba lựa chọn D-03/D-04/D-14 và bộ quy tắc bổ sung đã được chủ dự án đồng ý, ghi tại BUSINESS_DECISIONS.md. Không còn câu hỏi chờ xác nhận trong lượt này. Docker giữ volume hiện có; không dùng down -v để cập nhật schema.

## Ghi chú các đợt trước (lịch sử, không phải hiện trạng)

## Bổ sung 11/10/2026: nguồn kế hoạch BAN

Migration 010 thêm MaBaoCaoThanhPham/FK và kiểm đúng loại nguồn trên KeHoachMuaBan. Kế hoạch BAN mới cần finished_report_id trỏ báo cáo SUBMITTED thuộc đúng đơn khách; MUA không nhận nguồn thành phẩm. Đối soát lượng bán theo báo cáo và đơn, kiểm tổng kế hoạch còn hiệu lực tại tạo/sửa/duyệt trong transaction. Các báo cáo vẫn là hai bảng cũ; chưa hợp nhất thành BanBaoCaoSanXuat.

PLANNER được đọc báo cáo thành phẩm để lập kế hoạch, không được ghi/sửa báo cáo. Form BAN chọn báo cáo và tự gộp dòng thành phẩm theo mặt hàng, giữ chọn khách/đơn để server đối chiếu. Lookup trả chi tiết báo cáo. Duyệt kiểm phần thành phẩm nguồn đạt QC, đã nhập AVAILABLE và còn hạn. Kiểm này là ảnh tại thời điểm duyệt, chưa giữ chỗ và chưa hoàn tất toàn bộ BR-09; xuất vẫn phải kiểm lại tồn trong transaction. Nguồn lịch sử không tự gán.

Kiểm thử MySQL production-smoke đã mở rộng: thiếu/sai nguồn BAN, hạn mức thành phẩm, từ chối duyệt khi chưa nhập QC; pass. Browser form chuyển MUA/BAN, nguồn thành phẩm bắt buộc, phân quyền và Adminer pass. Node 26 tests và syntax pass trước lần bổ sung fixture SQL cuối.

## Bổ sung 11/10/2026: bảng chi tiết kế hoạch chung

Migration 009 đã gộp dòng thành phẩm và NVL vào bảng vật lý ChiTietKeHoachSanXuat, phân biệt LoaiChiTiet. Giữ ID thành phẩm; ID NVL cũ lưu trong MaNguyenLieuCu vì hai bảng cũ có thể trùng ID. Dữ liệu NVL cũ giữ tại LuuTruNguyenLieuKeHoachTruoc009 để đối soát; không dùng bảng lưu trữ cho nghiệp vụ mới. ChiTietNguyenLieuKeHoachSanXuat và ThanhPhamKeHoachTuongThich là VIEW lọc cùng bảng chung, không phải entity/bảng nghiệp vụ độc lập.

Backend ghi NVL với discriminator; JSON outputs/materials vẫn tương thích và bổ sung details phân biệt loại. Thêm SoLuongConThieu dự kiến nullable: dữ liệu cũ chưa có số đối chiếu được giữ null, không suy đoán thành 0. Chưa tự áp dụng/ước lượng lại 10% vì D-02 chưa chốt làm tròn và nguồn số gốc. Báo cáo thực tế, lô nhiều mặt hàng và các phần còn lại chưa hợp nhất.

Kiểm thử sau migration: 26 Node tests pass; syntax pass; production-smoke MySQL pass; domain-schema-smoke pass và xác nhận một BASE TABLE, hai VIEW, tổng dòng bảng chung bằng tổng hai loại. SHOW TABLES trả cả view/bảng lưu trữ nên không dùng số đối tượng đó làm số entity đã hoàn thiện.

## Phần triển khai trong lượt này

- Form MUA chọn báo cáo sản xuất SUBMITTED; lookup trả kèm chi tiết, tự điền phần thiếu thực tế. Không còn lấy lượng mua từ kế hoạch dự kiến trên form.
- KeHoachMuaBan lưu production_report_id (MaBaoCaoSanXuat); kiểm nguồn, phần thiếu và lượng mua cộng dồn trong transaction, kiểm lại khi sửa/duyệt.
- DonMuaHang lưu cùng production_report_id với kế hoạch. Nếu client cung cấp nguồn khác thì từ chối. Kiểm lại hạn mức tại thời điểm mua; giữ một đơn mua cho mỗi kế hoạch.
- Kế hoạch lịch sử thiếu báo cáo nguồn không được tạo đơn mua mới; không tự suy đoán báo cáo nguồn.
- Migration 008 thêm FK báo cáo trên đơn mua, backfill từ liên kết kế hoạch có sẵn. Migration 007/008 đã chạy trên Docker, giữ nguyên volume.
- Kiểm checksum migration chấp nhận đổi LF/CRLF khi qua Git, vẫn từ chối thay đổi nội dung SQL và giữ nguyên checksum lịch sử.

## Bằng chứng kiểm thử

- Node: 26 kiểm thử pass; kiểm tra cú pháp JavaScript pass.
- Docker/MySQL: production-smoke pass, gồm nguồn báo cáo, mua vượt nhu cầu, giao dịch cạnh tranh, nguồn đơn mua sai, đơn mua trùng và sửa báo cáo đã gửi.
- domain-schema-smoke pass: 54 bảng, FK nguồn, chạy lại migration, giữ ID/hash mật khẩu/lịch sử.
- Docker browser pass: EJS khi tắt JavaScript, form chọn báo cáo nguồn MUA và chuyển MUA/BAN, phân quyền, đăng nhập Adminer xem schema tiếng Việt.

API bổ sung: POST /api/v1/purchase-orders nhận production_report_id tùy chọn để đối chiếu; server luôn lưu nguồn từ kế hoạch, trả production_report_id trong DTO. Lookup production-reports trả kèm lines. Form kế hoạch MUA gửi production_report_id hoặc source_request_id có báo cáo tương ứng. Không tự cộng 10% vào lượng thiếu.

## Phần còn lại

BAN chưa chuyển sang báo cáo thành phẩm. Báo cáo/chi tiết kế hoạch vẫn tách bảng cũ; chưa hoàn tất ChiTietLo, giữ chỗ, QC theo dòng lô, kiểm kê, ngoại lệ và bỏ entity hồ sơ/biên bản riêng. Không xem lượt này là nghiệm thu toàn bộ BR-01…BR-12. Các điểm chưa chốt tiếp tục theo BUSINESS_DECISIONS.md.
# Mới nhất: điều kiện xuất thành phẩm UC-23 / UC-11.02

Warehouse kiểm tra chung tại preview/lập/sửa yêu cầu, phân công và ghi phiếu: kế hoạch bán đã duyệt, báo cáo thành phẩm nguồn đã gửi và xác nhận hoàn tất, KHSX COMPLETED, đơn khách trùng nguồn và đúng xưởng. Ngày hiện tại theo UTC+7 phải đến ngày `latest_delivery_date` của đơn khách (hiện chưa có trường ngày giao dự kiến riêng). Không dùng requested_date do caller nhập để bỏ qua ngày giao. Replay chứng từ đã commit vẫn giữ kết quả cũ.

Kiểm thử trên 6 database/account: chưa đến ngày không tạo yêu cầu; chưa hoàn tất SX bị chặn; thay ngày sau khi tạo YC chặn phân công; thay ngày sau phân công chặn ghi phiếu và giữ nguyên tồn; đến ngày giao thì xuất thành công. Bộ nghiệm thu SQL và 2 test rule đạt. Không thêm migration cho thay đổi này.

UC-23 nhập thành phẩm từng phần cùng một lô vẫn còn cần triển khai đồng bộ lô/QC/báo cáo tổng kết để tránh nhập hoặc báo cáo sản lượng hai lần. Chưa coi backlog UC là hoàn tất.

