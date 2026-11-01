# Đối soát hệ thống — 01/11/2026

**Kết quả thực thi mới nhất:** [Word đã điền kết quả theo mã TC](DacTa_TestCase_KetQua_20261101.docx) · [Báo cáo và phạm vi thực thi](KET_QUA_KIEM_THU_HE_THONG.md). Có 123 mã Pass, 0 Fail, 828 chưa chạy riêng; không coi toàn bộ 951 ca là đã đạt. Bộ kiểm thử hệ thống và các ca bổ sung đều có log tại `app/artifacts/final-system-test/`.

**Bản xuất mới theo yêu cầu chèn dưới từng đặc tả:** [Word kèm sequence](DacTa_Kem_Sequence_20261101.docx), [Word kèm bảng test case](DacTa_Kem_TestCase_20261101.docx). Chi tiết [951 ca, truy vết và trạng thái chưa chạy](DOCS_SEQUENCE_TESTCASE.md). Các tệp và mô tả phần dưới là đợt đối soát trước khi chèn; không nhầm ảnh nhúng cũ của bản trước với sequence mới trong bản chèn.

## Tài liệu

- [Đặc tả Word](Tuan6_DacTaUC_CapNhat_20261101.docx), [PDF xem trước](render/Tuan6_DacTaUC_CapNhat_20261101.pdf).
- [Sequence HTML](SEQUENCE_20261101.html), [PDF](SEQUENCE_20261101.pdf), [nội dung luồng](SEQUENCE_20261101.md): 149 hình tương tác Actor–Hệ thống từ các luồng của 50 bảng. Có nguyên văn các bước dưới hình, SVG riêng trong `sequences/`.

**Hình sequence nhúng cũ trong Word giữ nguyên, chưa thay ảnh.** Sequence xuất riêng là bản đồng hành mới; không tuyên bố ảnh nhúng đã đồng bộ. Hình tổng hợp từ các ô luồng, không phải sơ đồ lời gọi giữa các lớp lập trình.

Word giữ 50 bảng, 3.195 đoạn, cấu trúc và định dạng bản nguồn ngày 30/10. Có 43 lượt sửa nội dung ở đoạn có sẵn; không thêm/xóa UC, hàng, ô, đoạn, run hoặc ảnh. Ngoài văn bản `word/document.xml`, 783 thành phần giữ nguyên, gồm 767 ảnh. Xem [kiểm chứng](KIEM_TRA_BAO_TOAN.json) và [trước/sau](THAY_DOI_NOI_DUNG.json). Nguồn được giữ ở `NGUON_GOC.docx`. PDF đọc được 902 trang, đã xem mẫu trang UC-08. Nội dung dài hơn có thể đổi phân trang mà không đổi form.

## Đã sửa

Giám đốc xem đơn hàng, không tạo/sửa/tiếp nhận hoặc duyệt trực tiếp. Công việc chờ nổi bật theo trạng thái, còn sau khi đọc thông báo hoặc tải lại, lọc theo phân công/xưởng. Kết quả QC đã ghi không bị nhầm với đợt chờ có cùng số định danh. Sửa lỗi tải bất đồng bộ vào form vị trí kho đã đóng khi chuyển màn hình nhanh.

Phân biệt ngày thực tế/dự kiến; kiểm tra lịch hợp lệ, múi giờ, bắt đầu/kết thúc, hạn giao, NSX/hạn dùng, ngày xuất bán. SQL kiểm tra hết hạn thống nhất ngày UTC+7. [Quy tắc và giới hạn chi tiết](../CHO_XU_LY_VA_NGAY_GIO.md).

## Kiểm thử

| Nhóm | Kết quả |
| --- | --- |
| Cú pháp / đồng bộ | Đạt; 1 ứng dụng, 1 CSDL, 10 migration, 178 tuyến API |
| Đơn vị | 88/88; [log](unit-tests-final.log) |
| MySQL | 12/12 nhóm; [log cuối](sql-acceptance-final.log) |
| Actor / giao diện | 93 màn hình, 18 tài khoản, 0 lỗi bất thường; [log cuối](role-audit-final.log) |
| Việc chờ | API kiểm 18 tài khoản, đọc không hết chờ, duyệt chuyển việc, mua xong hết chờ; [UI](browser-pending-work-final.log) |
| Trình duyệt hiện hành | 24 nhóm đạt sau chạy lại; giữ kết quả thô ban đầu `browser-results.json` và các log `*-final.log` / `*-rerun.log` riêng |
| Xuất CSV | Tồn kho, nhập/xuất, kiểm kê trả 200; menu nhập/xuất riêng đã ẩn được kiểm bằng API có quyền |
| Luồng bổ sung | Kế hoạch bù, báo giá/hạn dùng NCC, thực kiểm kế hoạch mua: các kiểm thử API riêng đạt |

Bộ MySQL bao gồm schema/kế thừa, công việc, kiểm kê, đơn hàng, sản xuất, mua/giao hàng/trả hàng, nhập từng phần, ảnh danh mục, tiền sản xuất, thành phẩm từng phần, tài khoản/danh mục và xác nhận lượng vượt dự kiến. Có kiểm nguồn, quyền, phiên bản cũ, đồng thời, rollback và không ghi trùng.

Trình duyệt bao gồm SSR, nhập nguồn, yêu cầu kho, kiểm kê/QC, tài khoản/danh mục, tra cứu, tiền sản xuất, đặt hàng, reset thử nghiệm, ngoại lệ, theme, ảnh, xác nhận kế hoạch, dashboard/form, ba kho theo xưởng, NCC/hạn dùng, lượng còn được nhận, thực kiểm, xuất bán/QC, kế hoạch bù và việc chờ. Các ca UI giả lập ghi không được coi là bằng chứng ghi thật; API/MySQL kiểm việc ghi riêng.

### Lỗi ban đầu và chạy lại

- Hai bài kho còn đòi kệ/ô, nhãn Khu A đã bị thay bằng tên khu có nghĩa: sửa kỳ vọng và chạy lại đạt.
- Bài xuất báo cáo điều hướng menu nhập/xuất đã ẩn: kiểm API xuất CSV có quyền và chạy lại đạt.
- Rà actor phát hiện lỗi form vị trí bất đồng bộ: sửa code và chạy lại đủ 93 màn hình không lỗi.
- Một lượt rà actor trùng lúc bộ MySQL reset phiên test: chạy lại sau khi reset kết thúc; dùng `role-audit-final.log`.
- `e2e/browser.cjs` dùng adapter bộ nhớ cũ, thất bại vì chờ nút `#create` đã thay bằng trang đặt hàng riêng. **Không tính bài này là đạt.** Không dùng nó làm bằng chứng cho MySQL; luồng đặt hàng hiện hành đã kiểm bằng customer-order, API/MySQL và rà actor. Chưa viết lại adapter cũ trong đợt này, không xóa lịch sử để làm xanh báo cáo.

## Giới hạn

Không thể từ hữu hạn ca kiểm thử khẳng định đã thử mọi tổ hợp dữ liệu, mất mạng, lỗi máy và đồng thời có thể xảy ra. Các nhánh chưa tái hiện không tự được gán đã đạt. Bản sequence đồng hành chưa thay các ảnh nhúng cũ trong Word.

Ghi/reset chỉ trên Docker test `warehouse-mono-review-20261029`, cổng 3310, kiểm `test_instance=true`. CSDL chính cổng 3000 không bị reset hoặc chèn dữ liệu thử của đợt này. Không thêm schema sau migration 010, không xóa volume, không commit/push Git.
