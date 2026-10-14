## MySQL theo service - cập nhật hiện hành

Đã tách bảng vật lý thành 6 database/tài khoản MySQL, có migration chuyển dữ liệu, checkpoint và backup. Vẫn dùng một MySQL server với FK/view/transaction xuyên schema để giữ nghiệp vụ. Các mô tả schema chung phía dưới là lịch sử. Xem [SERVICE_DATABASES.md](SERVICE_DATABASES.md) để biết cấu hình, ownership, migration, backup và giới hạn hiện tại.

# Kiến trúc hiện hành và trách nhiệm mục tiêu

Cập nhật runtime: hiện có sáu service HTTP/container, index/Dockerfile riêng dưới `src/services`; module thuộc từng owner. CSDL/schema hiện tại chưa tách theo yêu cầu người dùng. [Hướng dẫn cấu trúc và chạy](../src/services/README.md) là hiện trạng; các mô tả monolith bên dưới thuộc giai đoạn trước.

Kế hoạch chuyển microservice lập ngày 13/10/2026: [MICROSERVICE_MIGRATION.md](MICROSERVICE_MIGRATION.md), kèm [prompt bàn giao](MICROSERVICE_HANDOFF_PROMPT.md). Code hiện vẫn là monolith; tài liệu đích không có nghĩa đã tách service. Tiến độ mới nhất ở [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md); các đánh giá theo commit bên dưới là lịch sử.

Cập nhật 10/10/2026 theo bản Word đã chốt `Tuan6_WarehouseTeam_hoan_chinh_sequence.docx` và 12 quy tắc bổ sung của chủ đề tài. Word giữ nguyên, SHA-256: `19bbfb58491f8a220d838ea04291adc3381599550749e414c357868526482423`. Code đối chiếu tại commit `be92b4ef8aaface8152e4d429ba37e0041c60012`.

**Phân loại:** `[ĐÃ CHỐT]` là yêu cầu nghiệp vụ, không phải chứng nhận triển khai; `[ĐỀ XUẤT]` cần xác nhận trước khi lập trình; `[CẦN CHỐT]` còn mâu thuẫn/thiếu quy tắc; `[HIỆN TRẠNG]` chỉ có bằng chứng đọc code, chưa nghiệm thu MySQL trong lượt này. Truy vết và bằng chứng: [MODULE_MATRIX.md](MODULE_MATRIX.md); quyết định còn mở: [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md).

Code hiện dùng Express MVC, EJS và mysql2; server lựa chọn bootstrap MySQL trong src/shared/create-mysql-app.js. Demo bộ nhớ ở src/services/domain riêng với SQL; không dùng kết quả demo để nghiệm thu transaction bền vững.

| Lớp | Trách nhiệm mục tiêu | Source hiện hành |
| --- | --- | --- |
| Web/API | Render/JSON, input và response, gọi cùng service, không tính tồn ở view | src/shared/ModuleRoutes.js, FoundationWebRoutes/Controller; controllers/views |
| Service/policy | Nguồn báo cáo, loại chi tiết/lô, actor/scope, trạng thái, hạn mức, giữ, transaction | src/modules, src/services/domain/policy.js |
| Repository/SQL | Binding, FK, khóa hàng, đọc/ghi nguyên tử, audit/idempotency | mysql2 pool, config/vietnamese-sql.js, database migrations |
| UI | Tách lượng đề nghị/giữ/thực hiện, báo cáo đúng nguồn và trạng thái chưa triển khai | EJS và public/js |

Các entity hồ sơ/biên bản hoặc chi tiết NVL riêng không trở thành yêu cầu mục tiêu chỉ vì code/schema cũ đang có. Hợp đồng nghiệp vụ theo SRS/DOMAIN_MODEL; khoảng cách theo DOMAIN_ALIGNMENT. Phần SQL pending trả NOT_IMPLEMENTED/501 theo route; quyền và scope vẫn phải được kiểm server. Chưa có bằng chứng kiểm thử mới trong lượt docs.

[ĐỀ XUẤT] Mọi cập nhật nhu cầu, giữ, phiếu và tồn đi chung transaction sau chốt D-01/D-03/D-06; nguồn báo cáo và dòng tồn được khóa ổn định. Phương án schema vật lý theo DATABASE và quyết định còn mở; không coi sơ đồ lớp là một bảng cho mọi class.

Vận hành: [DOCKER.md](DOCKER.md), [PRODUCTION.md](PRODUCTION.md).
