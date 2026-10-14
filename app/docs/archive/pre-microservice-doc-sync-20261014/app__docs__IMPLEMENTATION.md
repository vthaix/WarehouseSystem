## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Hướng dẫn triển khai tiếp từ docs đã đồng bộ Word

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

## Thứ tự nguồn

Word đã chốt và 12 BR → SRS/USE_CASES/DOMAIN_MODEL → API/DATABASE/UI_SPEC. Nếu mâu thuẫn chưa được 12 BR giải quyết, xem BUSINESS_DECISIONS, không tự quyết rồi ghi thành đã được duyệt. Không đọc code cũ làm chuẩn nghiệp vụ thay Word.

## Cách tiếp tục code

1. Đọc tất cả docs; chọn backlog gắn UC và quyết định đã được chốt.
2. Sửa schema/service/validator/policy/UI trong một phạm vi nhất quán. Không chỉ đổi tên bảng hoặc thêm FK để kết luận hoàn thành domain.
3. Kiểm thử DB cô lập gồm cạnh tranh, rollback, idempotency, quyền và truy vết; ghi rõ commit/môi trường/kết quả.
4. Cập nhật trạng thái MODULE_MATRIX theo bằng chứng; phân biệt có code, pass memory, pass SQL và pass end-to-end. Chỉ công nhận yêu cầu mới khi các tiêu chí tương ứng pass.

## Hiện trạng và giới hạn

Express/EJS cùng origin, src/modules và src/shared cho SQL; src/services/domain giữ demo memory. Nhiều SQL service đã có; COUNT/ngoại lệ/quản lý công việc còn pending, cùng khoảng cách trong DOMAIN_ALIGNMENT. Không gọi toàn bộ chương trình ready chỉ vì đăng nhập hoặc CRUD chạy. Không coi report/lot/plan theo mô hình cũ là đủ mô hình Word.

Trong lượt này chỉ chỉnh docs; không sửa code, migration hoặc dữ liệu, không chạy smoke có ghi DB. Những nội dung lịch sử “đã pass” chưa được tái xác minh tại commit này. [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) là danh sách việc cần làm, [MODULE_MATRIX.md](MODULE_MATRIX.md) là bảng đối chiếu từng UC.
