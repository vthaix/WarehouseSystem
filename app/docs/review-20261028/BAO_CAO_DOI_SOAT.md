# Báo cáo kiểm thử và đối soát đặc tả Word

> Đính chính ngày 29/10/2026: bản Word biên tập ngày 28/10 không đáp ứng yêu cầu giữ cách trình bày của người dùng, không dùng làm bản bàn giao. Đã khôi phục file nguồn về bản gốc và làm bản sửa riêng tại [review-20261029](../review-20261029/README.md). Các kết quả kiểm thử dưới đây được giữ làm bằng chứng lịch sử; việc kiểm tra thuộc tính XML trước đây không đủ để kết luận bản biên tập đã giữ đúng cấu trúc trình bày người dùng yêu cầu.

Ngày 28/10/2026. Mã nguồn đối chiếu: commit `7c38df69dd75827c30f21543073298e5b60786c1` và working tree tại thời điểm chạy. Không sửa code nghiệp vụ trong đợt này để hợp thức hóa lỗi.

Đã cập nhật đúng file nguồn `T:\Năm 4\HK1\Phát triển ứng dụng\Tuan6_WarehouseTeam_ChiDacTaUC.docx` sau khi xác nhận nó chưa bị sửa trong lúc rà soát. Bản gốc vẫn có ở thư mục này; `SOURCE_UPDATE_RECEIPT.json` ghi hash trước/sau và vị trí backup.

## Tệp bàn giao

- `Tuan6_WarehouseTeam_ChiDacTaUC_DaRasoat_20261028.docx`: bản nội dung đã biên tập.
- `Tuan6_WarehouseTeam_ChiDacTaUC_Goc.docx`: bản sao nguyên gốc trước biên tập.
- `UC_TRACEABILITY.md`: đối chiếu đủ 50 bảng UC gốc, gồm 48 UC và hai nhánh UC-11.01/11.02.
- `TEST_CASES_REVIEW.md`, `test-case-inventory.json`: 364 mục kiểm tra thiết kế từ nội dung UC; không gắn PASS giả cho case chưa có assert/bằng chứng riêng.
- `branch-inventory.json`, `STATIC_BRANCH_REVIEW.md`: 1.775 vị trí kiểm tra/hợp đồng hàm được quét từ source, gồm 865 lời gọi lỗi/xác nhận tường minh. Đây là chỉ mục tĩnh, không phải số nhánh đã được thực thi.
- `UI_ROLE_MATRIX.json`: kết quả duyệt 122 lượt actor/màn hình của 18 tài khoản, nhãn trường/filter/form và thông báo khi mở form.
- Các log `unit-tests`, `sql-acceptance`, `browser-*`, `probes`, `ui-role-audit` ghi bằng chứng thực thi.

## Kết quả chạy

| Hạng mục | Kết quả và giới hạn |
| --- | --- |
| Node tests | 77/77 đạt |
| Cú pháp, project sync | Đạt |
| Full split MySQL acceptance | Đạt, stack review/schema acceptance riêng; gồm các luồng liên UC, scope/quyền, version, replay, lượng cộng dồn, giữ chỗ, QC, kiểm kê, ngoại lệ, hàng trả và reset có backup |
| Browser ban đầu | 11/14 bộ đạt; 3 bộ thất bại được giữ log, không xóa bằng chứng |
| Hai browser test đã cập nhật fixture | `customer-order`: dùng danh mục 33 mặt hàng hiện tại thay `TP-DEMO-*` tùy chọn; `admin-theme`: tìm menu được phép của manager thay menu kiểm kê của giám đốc. Cả hai chạy lại đạt. Không thay code ứng dụng để làm test xanh |
| Browser cuối theo tập trên | 13/14 đạt; bộ `browser.cjs` memory/legacy vẫn thất bại vì trông chờ luồng/nút tạo cũ, không dùng làm bằng chứng đầy đủ cho microservice hiện hành. Bộ SSR không JavaScript đạt |
| Duyệt màn hình theo actor | 122 lượt, 18 tài khoản, 26 lần có modal tạo. Không gặp HTTP 5xx/JS error ngoài dự kiến trong lượt audit; điều này không đồng nghĩa mọi modal đều hợp lệ. Modal lỗi nghiệp vụ/UI vẫn được ghi và phân loại dưới đây |
| Probe bổ sung | Hai lỗi mua hàng tái hiện bằng request hợp lệ trên stack review |

Chuỗi `test_reset_failed UNAUTHENTICATED` trong log SQL thuộc ca âm kiểm chữ ký/quyền, sau đó có `TEST RESET SQL PASS`; không tự coi chuỗi lỗi đó là môi trường thực bị reset sai.

## Lỗi/điểm chưa đạt

### R-01 — Kế hoạch MUA lập trực tiếp chưa nối được sang đơn mua

1. Planner lập kế hoạch MUA trực tiếp, không chọn báo cáo, có dòng NVL hợp lệ.
2. Giám đốc duyệt kế hoạch thành APPROVED.
3. Purchaser tạo đơn mua chế độ PLAN từ kế hoạch này, cung cấp NCC/dòng, giá và điều kiện giao hợp lệ.
4. Thực tế: `409 INVALID_STATE`, “Kế hoạch mua thiếu báo cáo nguồn.”

Yêu cầu đã chốt cho phép kế hoạch mua trực tiếp; vì vậy không sửa đặc tả để nói mọi kế hoạch MUA bắt buộc có báo cáo. Cần sửa `PurchaseOrderService.create` và kiểm nguồn tương ứng. Bằng chứng: `probe-results.json`, `probes.log`.

### R-02 — Kế hoạch MUA vượt nguồn đã xác nhận vẫn bị chặn khi đặt mua

1. Có báo cáo NHU_CAU hợp lệ đã gửi, NVL còn thiếu.
2. Planner lập MUA nhiều hơn lượng nguồn và xác nhận; giám đốc xác nhận và duyệt.
3. Purchaser lập đơn theo đúng kế hoạch đã duyệt.
4. Thực tế: `409 PLAN_CONFIRMATION_REQUIRED`; đường tạo đơn mua/giao diện purchaser chưa có cơ chế xác nhận tương ứng.

Cần thống nhất truyền quyết định vượt lượng sang bước mua hoặc hỏi xác nhận đúng ở purchaser. Không nới tồn thực tế/QC. Bằng chứng: `probe-results.json`, `probes.log`.

### R-03 — Nút tạo phiếu kho chung mở biểu mẫu chưa hỗ trợ

Tài khoản `staff` và `staff2`, màn hình Phiếu kho, nút Tạo mới đang mở modal “Không thể tạo chứng từ / Biểu mẫu này chưa được hỗ trợ.” Quan sát trong `UI_ROLE_MATRIX.json`.

Luồng nhân viên ghi phiếu từ công việc được quản lý phân công vẫn có và qua SQL/browser test. Cần ẩn nút chung hoặc điều hướng đúng công việc, không ghi rằng UC nhập/xuất hoàn toàn chưa có.

### R-04 — Xuất CSV từ giao diện thiếu tham số định dạng

Đã bấm nút thật trên ba màn hình báo cáo tồn kho/phiếu kho/kiểm kê bằng tài khoản director: request `/export?page=1&per_page=20` không có `format=csv`, trả `422 VALIDATION_ERROR: Chỉ hỗ trợ CSV.` thay vì tải file. Gọi đúng API với `format=csv` trả `200 text/csv`. Link SSR còn cần loại trường chọn màn hình `module` nếu có. Bằng chứng: `export-ui-probe.json`, `report-probe-results.json`, các log tương ứng.

Probe báo cáo có thêm các ca đọc thành công, sai quyền CUSTOMER, khoảng ngày ngược, as_of tương lai, bucket sai và định dạng xlsx; tất cả ca âm tương ứng được từ chối đúng. Không coi việc API export đúng là bằng chứng nút UI hoạt động.

## Các thay đổi trong đặc tả

- UC-31 đổi thành **Phê duyệt kế hoạch sản xuất**; duyệt trực tiếp đơn ngừng dùng. Duyệt KHSX cập nhật đơn nguồn; trả KHSX để sửa không tự từ chối đơn.
- UC-12.3 đánh dấu **ngừng sử dụng** thao tác xóa kết quả đã ghi, giữ bảng cũ để truy vết. UC-12.2 mô tả chứng từ bù, tách bù trực tiếp khỏi điều chỉnh hàng đã nhập.
- UC-04/05/32 bổ sung MUA trực tiếp/theo báo cáo, không chọn NCC ở planner, cảnh báo xác nhận vượt lượng, lịch không quá khứ/vượt hạn giao.
- UC-23/24 mô tả bốn nguồn yêu cầu, xưởng mặc định đúng tên, người quản lý phụ trách, lượng thực hiện/cam kết, không nhầm yêu cầu với phiếu/tồn.
- UC-13/15/28 mô tả phần lô, chọn NVL ngay khi lập đợt, nhân viên hai nhóm và người lập chung, giả lập bắt đầu sớm, số 0, Đạt/Đạt tất cả, biên bản nháp/gửi và ngoại lệ.
- UC-34/35 tách tiến độ/sự cố/nhu cầu khỏi thành phẩm từng phần/tổng kết, tồn khả dụng và NVL sử dụng, không tự nhập trả NVL dư.
- UC-16/17 tách ngoại lệ biên bản chủ xưởng duyệt khỏi quy trình điều chỉnh tồn kỹ thuật giám đốc duyệt; không mô tả duyệt là tự đổi tồn.
- UC-BS-01…08 được thêm ở cuối: tài khoản, đơn vị/giá NCC, phân công kho, ghi nhận thực nhận, khách trả, hàng cách ly/bù hàng đã nhập, thông báo và công cụ reset tạm.

## Giữ nguyên mẫu Word

`DOCX_STRUCTURE_PROOF.json`: cả 50 bảng gốc giữ nguyên số hàng, ô, đoạn, thuộc tính bảng/độ rộng/cột/gộp ô, trPr/tcPr, pPr/rPr, font/kiểu đoạn. Bảng lồng được giữ nguyên. Chỉ thêm 8 bảng UC bổ sung, đúng mẫu ở cuối; ghi chú/phụ lục BR là nội dung đoạn, không thêm bảng mới vào phần gốc.

`DOCX_PACKAGE_PROOF.json`: chỉ `word/document.xml` thay đổi. Tất cả phần ZIP còn lại có nội dung byte giống bản gốc, gồm styles, numbering, theme, ảnh, quan hệ, header/footer và thuộc tính package. Bản gốc được lưu trước khi biên tập. `DOCX_CONTENT_PROOF.json` kiểm mọi nội dung biên soạn đều có trong XML đầu ra, kể cả ô có bảng lồng.

Đã mở/render thành công bằng LibreOffice 7.4 trong container và xem các trang mẫu đầu, UC-31, UC-35, UC-28, UC bổ sung; PDF kiểm tra ở `render-final`. Bản render có 368 trang vì bổ sung nhiều nhánh và giữ độ cao tối thiểu của mẫu. Chưa chứng nhận phân trang chính xác của Microsoft Word (máy kiểm thử không cài Word). Văn bản PDF hai cột/diacritics không cho phép dùng so khớp chuỗi liên tục đơn giản làm bằng chứng mất chữ; dùng proof XML và mẫu render để đối chiếu.

## Những điều không được khẳng định

Không có kết luận “đã test mọi tổ hợp có thể xảy ra” hay “không còn nhánh nào chưa chạy”. Các case/guard chưa có bằng chứng assert riêng vẫn ghi rõ trạng thái đó. Bổ sung nhánh vào đặc tả không phải bằng chứng nhánh đã chạy.

Chưa đo tải lớn/NFR, hết mọi thời gian hết hạn phiên, mọi tổ hợp cạnh tranh/lỗi mạng liên service, khôi phục backup đầy đủ, CPU ARM, mọi glyph/vị trí in trên 368 trang trong Microsoft Word. Chưa tự triển khai nhập trả NVL dư, thanh toán/bồi thường/hoàn tiền, giao bù/mua bù, offline autosave hoặc realtime push chỉ bằng cách viết vào đặc tả.

## Cách chạy lại

Môi trường riêng: project `warehouse-docx-review-20261028`, cổng `3310`, cấu hình `review.env`. Bộ kiểm thử không dùng volume của project `warehouse-system`.

```powershell
docker compose --env-file app/docs/review-20261028/review.env -p warehouse-docx-review-20261028 up -d --build --wait
docker compose --env-file app/docs/review-20261028/review.env -p warehouse-docx-review-20261028 run --rm --no-deps -T -e ACCEPTANCE_SPLIT_SOURCE=KhoHang_Acceptance_20261028 split-databases node scripts/split-acceptance.cjs
```

Từ `app/`, có Node/test dependencies: `node scripts/docx-review-browser.cjs`, `node e2e/docx-role-audit.cjs`, `node scripts/docx-review-probes.cjs`. Probe tạo dữ liệu có nhãn trong stack review. Nếu lần acceptance thất bại để lại công việc còn lịch, dùng namespace acceptance mới hoặc dọn riêng namespace đó có kiểm soát; không reset dữ liệu người dùng.
