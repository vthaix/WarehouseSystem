# Kết quả kiểm thử WarehouseSystem

Ngày chạy: 14/10/2026. Bộ ca thiết kế: [TEST_CASES.md](TEST_CASES.md). Đặc tả nguồn: [DacTa_WarehouseSystem.md](DacTa_WarehouseSystem.md).

## Kết quả đợt chạy

Xưởng/phân công biên bản 27/10/2026: 77/77 Node test đạt; browser warehouse-request-workflow và inspection-workflow đạt tên xưởng/default khóa ô, trang biên bản của QC và Ban kiểm kê, nút tạo chỉ bật cho người được chỉ định đủ điều kiện. Đã xác minh HTTP thật ba tài khoản trả đúng Xưởng ahtor/edxn/trnvnth; ID nội bộ không dùng làm tên. Full split MySQL acceptance đạt trên namespace `KhoHang_Acceptance_20261027`, kiểm metadata người lập và thông báo riêng chỉ gửi nhân viên được chọn, chặn người khác tạo/sửa/gửi. Route đọc đợt cho Ban kiểm kê vẫn giới hạn theo phân công. Harness kiểm copy trước khi migration thêm dữ liệu demo để tránh báo sai bảo toàn số dòng. Chi tiết [XUONG_PHU_TRACH_VA_NGUOI_LAP_BIEN_BAN.md](XUONG_PHU_TRACH_VA_NGUOI_LAP_BIEN_BAN.md).

Compose máy mới 24/10/2026: cấu hình root hợp lệ và project-sync đạt. Đã chép 478 file nguồn sang thư mục thử, không có host node_modules/.env/dữ liệu cũ, dùng image tag mới và năm volume mới trong project `warehouse-clean-20261024`. Một lệnh `up -d --build --wait` chạy thành công, các service thường trực healthy và job bootstrap exit 0. HTTP trên cổng thử 3307 xác nhận admin và ba chủ xưởng đăng nhập được, đúng ba xưởng, 12 danh mục và 33 mặt hàng hoạt động. Node/MySQL base image có thể dùng cache Docker của máy kiểm thử; không phải thử trên máy ảo chưa cài Docker và chưa kiểm CPU ARM. Project thử được dọn riêng sau kiểm tra, không đổi/xóa volume của ứng dụng đang dùng. Hướng dẫn: [KHOI_DONG_MAY_MOI.md](KHOI_DONG_MAY_MOI.md).

Chọn phần lô NVL ngay khi lập đợt kiểm kê 23/10/2026: 77/77 Node test đạt; browser inspection-workflow và source-imports đạt. Full split MySQL acceptance đạt: kế hoạch mua có hai phần thực nhận 0,4/0,6; chọn riêng 0,4 khi tạo đợt được gắn ngay và giữ liên kết kế hoạch nguồn; phần 0,6 vẫn có thể chọn; lô ngoài nguồn và danh sách rỗng khi có hàng thực nhận bị chặn. Đợt dự kiến chưa có hàng vẫn lập được. Các luồng bù QC trước/sau nhập kho tiếp tục đạt. Hướng dẫn tại [TEST_BU_QC_VA_CHON_LO_KIEM_KE.md](TEST_BU_QC_VA_CHON_LO_KIEM_KE.md).

Xác nhận vượt số lượng kế hoạch 23/10/2026: 77/77 Node test đạt. Full split MySQL acceptance qua 19 migration đạt: KHSX vượt đơn được tạo/sửa/duyệt sau xác nhận, chưa xác nhận không ghi/không tăng phiên bản; đơn nguồn cập nhật APPROVED. Kế hoạch mua vượt nhu cầu cũng lưu được sau xác nhận. Browser planning-confirmation đạt cả Đồng ý (gửi lại cờ boolean và khóa mới) và Hủy (không gửi thao tác ghi lần hai) cho KHSX và kế hoạch mua/bán. Mutation browser được giả lập; SQL chạy trên schema acceptance riêng. Chi tiết phạm vi tại [XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md](XAC_NHAN_VUOT_SO_LUONG_KE_HOACH.md).

Giao diện theo UC và Tra cứu kho 23/10/2026: 73/73 Node test đạt; full split MySQL acceptance qua 16 migration đạt, kiểm lượng nhập thực tế 38, tên hàng/đơn vị/vị trí và API lookup chỉ cho quản lý kho/chủ xưởng. Browser warehouse-lookup đạt hai actor được phép, bảy actor bị chặn cả trang/API, menu UC, vai trò có tên, timestamp theo giờ Việt Nam, chọn vị trí/lọc loại hàng/vị trí trống, đơn vị/hạn dùng và không tràn màn hình 390px. Dữ liệu sơ đồ 48 vị trí trong browser là mock kiểm tương tác; giao diện thật chỉ dùng vị trí CSDL thật. Browser source-imports, inspection-workflow và warehouse-request-workflow vẫn đạt sau thay đổi nhãn/ngày giờ và menu. Đã xem ảnh desktop của sơ đồ. Migration đổi hai tên xưởng demo biết trước, giữ tên tự sửa và dữ liệu nghiệp vụ. Chi tiết [GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md](GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md).

Kiểm kê/biên bản/huy hiệu 23/10/2026: 68/68 Node test đạt; full split MySQL acceptance đạt với 15 migration. Kiểm người lập biên bản chung, chặn nhân viên khác sửa/gửi, tổng hợp QC và số đếm, ngoại lệ OPEN → đề xuất → quyết định chủ xưởng → quản lý thực hiện. Acceptance còn xác nhận thông báo công việc cho người được giao, biên bản cho giám đốc và phiếu kho cho quản lý/chủ xưởng đúng phạm vi/giám đốc; không gửi nhân viên không liên quan. Unit mới kiểm nhập đủ nhiều dòng, thiếu/trùng/ngoài phạm vi, số 0, chờ QC, scope huy hiệu chủ xưởng và đếm KHSX DRAFT. Browser inspection-workflow đạt form người lập, hai dòng kiểm đếm, Chi tiết mở form xử lý có bằng chứng nguồn, gửi đề xuất, huy hiệu số trắng; API huy hiệu thật trả hợp lệ. Browser source-imports và warehouse-request-workflow đạt sau cập nhật fixture người lập. Mutation browser được mock; ghi thật chạy trong database acceptance riêng. Dữ liệu đang dùng giữ nguyên. Hướng dẫn [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md).

UC-23 nhập/xuất 23/10/2026: 64/64 Node test đạt. Full split MySQL acceptance đạt sau migration 014: tạo yêu cầu từ kế hoạch mua/BCTP/KHSX, giờ 10:30 +07 giữ đúng 03:30Z; nhập chỉ lấy lượng QC đạt; hai báo cáo phần không trừ nhầm hạn mức của nhau. Phân công trả đúng lô nguồn/nhân viên. Phiếu đầu 38/39 tạo tồn 38 và hồ sơ xem ngay bởi chủ xưởng/quản lý/giám đốc; ghi tiếp 1 và replay không trùng tồn. Browser warehouse-request-workflow đạt bốn nhánh, ngày giờ, lượng gợi ý quản lý và nhân viên sửa 10 thành 8 rồi còn 2; mutation được mock. Ca UI nguồn kho cũ đã chuyển sang file e2e riêng, source-imports còn kiểm các form nguồn/báo cáo/biên bản khác.

Ngoại lệ trong biên bản 23/10/2026: 62/62 Node test đạt; full split MySQL acceptance qua migration 013 đạt với xử lý trực tiếp, đề xuất gửi chủ xưởng, từ chối bắt buộc phương án thay thế, chặn quản lý đổi chỉ đạo, chủ xưởng đồng ý rồi quản lý xác nhận, và chặn QC/AC/Ban kiểm kê đọc/lập/xử lý ngoại lệ. Browser kiểm chọn mô tả/textarea, checkbox đề xuất, chọn xưởng, ô bắt buộc khi từ chối và chỉ đọc phương án khi thực hiện; mutation browser được mock. API kỹ thuật tái kiểm chất lượng cũ vẫn qua kiểm nguồn và không cấp quyền quản lý ngoại lệ cho QC. Giữ nguyên dữ liệu hiện có.

Báo cáo thành phẩm/còn lại 23/10/2026: browser source-imports đạt với 50/100 còn 50, tick đợt cuối điền 100, sửa xuống tự bỏ tick; trừ 40 đã ghi nên còn 60; nhiều mặt hàng chỉ tick khi đủ toàn bộ, kiểm số lẻ 0,001. Đối chiếu NVL: đã xuất 5.000, trước dùng 1.000, gợi ý 4.000; sửa 3.900 còn 100, payload chỉ gửi tiêu hao đợt này. Browser mutation được mock. Full split MySQL acceptance đạt, có đọc tổng báo cáo nháp 40 từ API kế hoạch. Chưa triển khai nhập trả NVL dư; không tự thay đổi tồn từ số liệu đối chiếu.

Biên bản kiểm tra lô 23/10/2026: 62/62 Node test đạt; full split MySQL acceptance đạt sau migration 012. Bổ sung ca lập trước hoàn tất bị chặn, tổng hợp 40 đếm/39 đạt/1 lỗi, lưu nháp, sửa bởi nhân viên cùng được phân công, gửi chụp dữ liệu, giám đốc xem/danh sách, chặn lập trùng và version cũ; đợt chỉ số lượng ghi 0 vẫn lập được biên bản và không suy kết quả QC. Sửa ngày chuẩn bị test stocktake-smoke theo múi giờ nghiệp vụ để không lệch ngày sau nửa đêm. Không xóa dữ liệu người dùng.

Đính chính lập đợt kiểm kê 22/10/2026: 58/58 Node test đạt; browser source-imports đạt với điểm tạo tại Lập đợt kiểm kê, không có selector loại đợt và Công việc không có nút tạo. Browser giả lập các mutation. Split MySQL acceptance đạt trên sáu schema riêng, bổ sung kiểm đợt có cả hai nhóm: QC xong vẫn IN_PROGRESS, người QC không được ghi số đếm, Ban kiểm kê ghi xong mới COMPLETED; đợt chỉ Ban kiểm kê ghi 0 hợp lệ và chặn ghi lại bằng version cũ. Migration 011 giữ nguyên dữ liệu, không tự điều chỉnh tồn từ số đếm. Chưa phải chứng nhận toàn bộ UC đã kiểm thử thủ công.

Mua NVL/ngày 22/10/2026: 57/57 Node test đạt. Split acceptance qua migration 008 và kiểm KHSX quá khứ/vượt hạn giao, MUA vượt hạn SX, tự điền ngày đơn PLAN, NCC riêng hai dòng, chặn REPORT mới và lô trộn NCC; giữ nguyên dữ liệu theo owner. Browser source-imports và preproduction kiểm nhãn nguồn, MUA không NCC, hai chế độ mua, NCC dòng, ngày PLAN và đổi nguồn; mutation browser được mock. Không chạy nút reset hay tạo chứng từ test vào CSDL người dùng. Xem [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md).

Nút xóa dữ liệu test ngày 22/10/2026: 55/55 Node test đạt, gồm kiểm tra mọi vai trò, CSRF, xác nhận, cờ tắt/production và chờ/chặn yêu cầu khi xóa. Split MySQL acceptance đạt với `reset-tools-smoke`: chữ ký nội bộ, backup sáu schema, dọn 46 bảng, giữ danh mục/tài khoản và replay không xóa dữ liệu mới. Browser `e2e/reset-data.cjs` đạt trên 11 tài khoản; thao tác xóa được mock, không dọn CSDL test tay.

UC-31 cập nhật 22/10/2026: 54/54 Node test và full split MySQL acceptance đạt. Bổ sung `order-smoke` vào acceptance: chặn API duyệt đơn trực tiếp, duyệt KHSX tự cập nhật đơn, replay không tăng version lần hai, từ chối trả kế hoạch nháp và giữ đơn RECEIVED, duyệt bản sửa không duyệt KHSX khác cùng đơn. Các test SQL chạy trên schema acceptance riêng, không sinh chứng từ vào CSDL test tay đã dọn sạch.

Sửa lỗi lưu/sửa ngày 22/10/2026: bỏ trường giao diện `module` khỏi query tải lại API, giữ nguyên kiểm tra trường hợp lệ ở backend. Browser `e2e/customer-order.cjs` đạt với tạo đơn thật, sửa thành 100 hộp (ô nhập hiện `100`), lưu và tải lại danh sách HTTP 200, đọc lại CSDL qua API vẫn 100; kiểm tra đơn vị ba bánh mới là hộp/gói/hộp. Job demo sửa nhãn đơn vị cũ `cái` của các mã bánh mẫu xác định sẵn, không quy đổi số lượng tồn/chứng từ và không cho API đổi đơn vị tùy ý.

Bổ sung UC-02 ngày 22/10/2026: `node e2e/customer-order.cjs` đạt trên stack Docker thật, không mock API. Kiểm tra menu/trang đặt hàng, ba bánh mẫu đã công bố, chặn chọn rỗng, đặt hai mặt hàng với ghi chú, tổng giá 156.000đ từ server, trạng thái SUBMITTED, planner đọc được đơn và trang đặt hàng trả 403 với planner. Script tạo một đơn có nhãn `[TEST UC-02]`, giữ lại để thử tiếp nhận thủ công.

Bổ sung ngày 22/10/2026: 54/54 test Node đạt; bộ split MySQL acceptance đạt với preproduction-smoke mới (đơn nhiều hàng, định lượng công thức + dự phòng một lần, quyền KHSX, thông báo sau duyệt, đối chiếu tồn, ảnh riêng tư, tự gửi báo cáo thiếu NVL cho planner và thông báo kế hoạch mua đã duyệt). Browser preproduction và source-imports đạt; phần ghi browser được mock, ghi thật kiểm trong SQL acceptance. Đây là kiểm chứng luồng đặt hàng/tiền sản xuất theo cập nhật mới, không phải đánh dấu toàn bộ 233 ca đã Pass.

Bổ sung ngày 17/10/2026: đã dựng và xác minh 36 nhóm chứng từ mẫu trên CSDL hiện có và một project Docker có volume mới. Kiểm tra lặp lại giữ nguyên số dòng các bảng Business/Warehouse. Bộ nghiệm thu split MySQL và 51 test tự động chạy lại đạt. Đã sửa lỗi khóa lịch TaskService trên tài khoản Warehouse chỉ có SELECT đối với Identity; không mở quyền UPDATE lên tài khoản người dùng. Chi tiết [DEMO_FIXTURES.md](DEMO_FIXTURES.md). Kết quả này không thay thế nghiệm thu từng ca trong 233 ca thiết kế bên dưới.

Đã chạy toàn bộ nhóm kiểm thử tự động có trong project: unit/HTTP, cú pháp, đồng bộ project, nghiệm thu MySQL microservice và các bộ trình duyệt. Hệ thống microservice vượt qua các bộ nghiệm thu hiện có. Bộ trình duyệt backend bộ nhớ cũ vẫn thất bại ở form tạo hồ sơ kho tổng hợp. Không kết luận 233 ca trong đặc tả đều Pass: các script hiện có chưa tương ứng đầy đủ từng thao tác và từng nhánh của 233 ca.

| Bộ kiểm thử | Kết quả thực tế | Phạm vi / giới hạn |
| --- | --- | --- |
| `node --test` | **51/51 Pass**, không skip | Nghiệp vụ, HTTP, phân quyền, rollback, giữ chỗ, chống trùng, nguồn, QC, cấu trúc service; nhiều ca dùng backend bộ nhớ hoặc kiểm tra thành phần |
| `node scripts/check.cjs` | Pass | Cú pháp JavaScript trong src/public/tests/e2e/scripts/database |
| `node scripts/check-project-sync.cjs` | Pass | Cấu trúc service, Compose, migration, owner/schema, tài liệu sinh, UC và liên kết |
| `docker compose build app split-databases` | Pass | Image chứa nguồn kiểm thử hiện tại; không reset volume |
| `docker compose run --rm --no-deps -T split-databases node scripts/split-acceptance.cjs` | **Pass** | Sáu tiến trình HTTP và sáu schema/tài khoản MySQL dành riêng cho acceptance |
| Đăng nhập API localhost:3000 | **11/11 Pass** | customer/customer2/planner/purchaser/manager/staff/staff2/qc/stocktaker/workshop/director với mật khẩu mẫu; kiểm tra session bằng auth/me |
| `node e2e/docker.cjs` | Pass | EJS không JavaScript; form nguồn đơn mua với JavaScript; loại MUA/BAN, quyền, schema trong Adminer |
| `node e2e/ssr.cjs` | Pass sau sửa selector | Đăng nhập, dashboard, thêm/sửa mặt hàng, đăng xuất khi tắt JavaScript; backend bộ nhớ |
| `node e2e/source-imports.cjs` | Pass | Import đơn/kế hoạch/báo cáo, phản hồi cũ, đổi chế độ mua, nguồn nhập và hai loại xuất; **request ghi được mock** |
| `node e2e/warehouse-exceptions.cjs` | Pass | Form/payload giải phóng, tiêu hủy, điều chỉnh QC đã nhập; **request ghi được mock** |
| `node e2e/admin-theme.cjs` | Pass | Dashboard, trắng/đỏ, tìm kiếm, sidebar desktop, drawer mobile, không tràn ngang |
| `node e2e/category-images.cjs` | Pass | Chọn/preview/upload/edit/bỏ ảnh; **request ghi được mock**, lưu thật kiểm tra riêng ở SQL acceptance |
| `node e2e/browser.cjs` | **Fail** | Workflow trình duyệt backend bộ nhớ cũ; lần cuối dừng ở tạo hồ sơ kho tổng hợp vì lỗi quyền |

`e2e/run.cjs` là wrapper chạy browser.cjs rồi ssr.cjs. Lần đầu dừng tại browser.cjs; các bộ con đã được chạy riêng để không bỏ qua bộ phía sau.

## Chi tiết nghiệm thu MySQL đã đạt

Các dòng dưới đây là kết quả do bộ acceptance trả về, không phải suy luận từ trạng thái container:

| Nhóm | Nội dung đạt |
| --- | --- |
| Bảo mật service | Từ chối chữ ký thiếu/sai, sai owner, truy cập SQL thô, giả role và session cũ; không trả password hash |
| Công việc | Vai trò/phạm vi, lịch trùng đồng thời, phiên bản cũ, tiến độ, không sửa công việc đã hoàn tất |
| Kiểm kê | Phân công; phân biệt chưa đếm và số 0; kết luận kho; duyệt và áp dụng riêng; lịch sử quyết định; điều chỉnh một lần; đóng đợt |
| Báo cáo sản xuất | Nhiều báo cáo tiến độ/sự cố; NVL không bắt buộc cho mọi mục đích; BGĐ nhận; planner chỉ đọc khi được gửi; gửi rồi bất biến |
| Import và mua | Mua thủ công/báo cáo; preview đúng phạm vi; lượng còn lại; tiền chính xác; cạnh tranh nguồn; hạn mức chung kế hoạch/đơn mua |
| Sản xuất | Nhu cầu/thiếu NVL, truy vết mua, lookup, vượt nhu cầu rollback, giới hạn đồng thời, duyệt và lô thành phẩm |
| Trả NCC sau nhập | Điều chỉnh QC có xác minh; trả được duyệt; giảm cách ly; truy vết lô gốc |
| Xử lý cách ly | Hạn mức QC, đề xuất đồng thời, BGĐ duyệt, khóa kiểm kê, giải phóng/tiêu hủy, không trùng biến động |
| Hàng khách trả | Không vượt phiếu giao gốc; cạnh tranh; phân công; nhập cách ly một lần; hủy; QC; giữ lịch sử đơn |
| Sản xuất và giao hàng | Nguồn báo cáo thực tế, giải phóng/phân bổ lại, hạn mức NVL tiêu hao, QC/nhập TP, kế hoạch bán duyệt và giao khách |
| Nhập/xuất | Kế hoạch mua → đơn mua → QC → yêu cầu → phân bổ → ghi sổ một lần |
| Điều chỉnh QC đã nhập | BGĐ duyệt; QC bắt buộc xác minh; cách ly/giải phóng/tiêu hủy; phiếu nhập bất biến và chứng từ bù |
| Nhập TP từng phần | Chung header lô, QC riêng từng phần, replay, tồn chính xác, báo cáo cuối dùng lô có sẵn và không nhập lại |
| Ảnh danh mục | Quyền, loại/bytes ảnh, upload/read, lưu thuộc tính thật, sửa từng phần, từ chối đường dẫn sai, bỏ ảnh |
| Tách schema | Sao chép bảo toàn dữ liệu; replay migration; FK; tài khoản/schema riêng; khôi phục checkpoint migration |

Acceptance dùng namespace `KhoHang_Acceptance_20261013` và các schema service con. Không xóa/reset CSDL ứng dụng, không chạy `docker compose down -v`. Các bộ trình duyệt Docker có đăng nhập và đọc dữ liệu; các bộ form mock không ghi chứng từ thật vào CSDL người dùng.

## Lỗi phát hiện và thay đổi trong kiểm thử

| Mã | Phát hiện | Xử lý / trạng thái |
| --- | --- | --- |
| T01 | ssr.cjs còn tìm heading “Không gian làm việc”, giao diện đã đổi thành “Tổng quan vận hành”. | Sửa selector trong test; chạy lại **Pass**. Không đổi giao diện để chiều theo test cũ. |
| T02 | browser.cjs tạo lịch QC nhưng chưa bắt đầu lịch, sau đó mở form ghi QC bị chặn. | Bổ sung thao tác Start của director trong fixture trình duyệt; chạy lại vượt qua bước QC và nhập NVL. |
| T03 | browser.cjs, bước tạo hồ sơ kho tổng hợp sau nhập NVL: form báo “Bạn không có quyền thực hiện thao tác”; không hiện data-form. | **Chưa sửa**. Tái hiện tại backend bộ nhớ của createApp; ảnh `artifacts/browser-failure.png`. Chưa có bằng chứng lỗi này xảy ra ở runtime MySQL. |

Không sửa luật nghiệp vụ/CSDL để tự giải quyết các mâu thuẫn Q01–Q10 trong TEST_CASES.md.

## Khoảng trống so với 233 ca

Ma trận chi tiết của từng ca nằm ở [TEST_EXECUTION_MATRIX.md](TEST_EXECUTION_MATRIX.md). Trạng thái Blocked giữ theo tài liệu thiết kế; Not Run nghĩa là chưa có bằng chứng hoàn tất toàn bộ ca. Có script kiểm tra một phần cùng nghiệp vụ không tự chuyển cả ca sang Pass.

Các phần còn cần chạy hoặc bổ sung fixture/assertion riêng:

- Toàn bộ nhánh tìm kiếm/lọc/không có dữ liệu và xuất file theo đặc tả, đối chiếu nội dung từng file.
- Validation từng trường và từng bộ dữ liệu của form thêm/sửa/xóa, tên trùng, hủy/nhập lại, cảnh báo tăng/giảm đơn.
- UC-15 mất mạng và phục hồi dữ liệu cục bộ; số liệu lưu tạm và biên bản lưu tạm qua đăng xuất/đăng nhập.
- Đối chiếu từng bước nguồn của UC-23/11.01/11.02/04/35 sau khi thống nhất Q02/Q03; actor duyệt và thời điểm điều chỉnh theo Q01.
- Giao diện lỗi/khôi phục khi service hoặc DB gián đoạn và rollback nhiều dòng cần fixture gây lỗi có kiểm soát cho từng luồng.
- Khắc phục/tách rõ bộ trình duyệt legacy bị lỗi T03 trước khi tuyên bố toàn bộ script xanh.

Chưa nghiệm thu toàn bộ đặc tả. Bước tiếp theo là giải quyết các mâu thuẫn yêu cầu và bổ sung chạy từng ca còn Not Run; các kết quả tự động ở trên là bằng chứng nền để tiếp tục.
# Kiểm tra luồng báo cáo thành phẩm từng phần và Công việc — 22/10/2026

Đính chính: phần lô được tạo từ báo cáo thành phẩm, không từ báo cáo tiến độ. `finished-parts-task-smoke.cjs` chạy trên CSDL acceptance riêng qua sáu HTTP service: hai báo cáo 40/60 cùng lô tổng, chỉ báo cáo đã gửi được chọn; chặn vượt lượng kế hoạch; công việc chọn đúng phần, phân công hai nhóm, scope, sửa, bắt đầu, QC tự hoàn tất, hủy giải phóng phần; nhập đúng lượng QC đạt 39 và replay không tăng tồn; phần đầu vẫn là nguồn bán sau xác nhận phần cuối, còn chặn giao trước ngày; NVL lấy MUA đã duyệt. Full split acceptance đạt, bao gồm migration 010, luồng cũ, QC/kiểm kê/ngoại lệ và reset trên schema biệt lập.

Browser source-imports kiểm hai loại Công việc, dropdown lô/phần theo BCTP, phần đã giao/đã QC khóa chọn, nhập NVL theo MUA, hồ sơ nhân viên và submit báo cáo phần không bắt hoàn tất toàn bộ. Request ghi được mock để không thêm dữ liệu test tay. 58 unit test, syntax và check-project-sync đạt. Đây là bằng chứng các luồng đã chạy, không thay kết quả chấm toàn bộ test case thủ công. Hướng dẫn [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md) và [KICH_BAN_TEST_QCAC_KIEM_KE.md](KICH_BAN_TEST_QCAC_KIEM_KE.md).
