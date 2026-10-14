# Báo cáo đồng bộ docs theo Word

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

## Kết quả

Đồng bộ tài liệu mục tiêu từ Word; chuyển đủ bảng đặc tả 48 UC và hai luồng UC-11, giữ tên/mã và actor nguồn. SRS không lặp phụ lục UC phiên bản cũ; USE_CASES là nguồn chi tiết duy nhất. Domain giữ lớp/thuộc tính Word và bổ sung 12 quy tắc rõ trạng thái đã chốt/đề xuất. API/UI/CSDL thay nguồn và quan hệ cũ; vận hành giữ hướng dẫn nhưng bỏ công nhận hoàn thành thiếu bằng chứng.

## Đầu vào đã đọc

13 tài liệu Markdown trong app/docs trước chỉnh sửa: API, ARCHITECTURE, DATABASE, DOCKER, DOCKER_IMPLEMENTATION, DOMAIN_ALIGNMENT, DOMAIN_MODEL, IMPLEMENTATION, MODULE_MATRIX, PRODUCTION, SRS, UI_SPEC, USE_CASES. Bản Word nguồn đã chốt có 50 bảng UC, trong đó 48 UC gốc và hai luồng UC-11.01/UC-11.02; không chỉnh Word. Source/service/schema đối chiếu tại commit đầu tài liệu.

## Các đầu ra để tiếp tục triển khai

- MODULE_MATRIX: từng UC → entity → BR → màn hình → hiện trạng/bằng chứng.
- BUSINESS_DECISIONS: 15 điểm còn thiếu/mâu thuẫn cần chốt, không hỏi lại 12 BR đã xác nhận.
- IMPLEMENTATION_BACKLOG: việc code/CSDL, phụ thuộc quyết định và tiêu chí kiểm thử.
- DOMAIN_ALIGNMENT: khoảng cách Word với code/schema, bao gồm thay đổi nguồn MUA đã có ở migration 007.

## Phạm vi kiểm chứng

Kiểm tra tài liệu, mã UC, actor, nguồn báo cáo, link cục bộ, diff chỉ docs và patch. Chưa chạy ứng dụng/MySQL/browser/smoke DB; chưa công nhận chức năng hoàn thành. Không sửa code, migration, seed, Word hoặc dữ liệu. Các tài liệu Word có tên entity nhưng các quan hệ/chính sách chưa đủ được liệt kê D-01…D-15, không tự bổ sung thành quyết định đã chốt.
