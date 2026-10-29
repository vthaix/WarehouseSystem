# Danh mục tài liệu hiện hành

Giao diện theo actor, nhãn tiếng Việt, ngày giờ và sơ đồ kho UC-22: [GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md](GIAO_DIEN_THEO_QUYEN_VA_TRA_CUU_KHO.md).

Luồng kiểm kê, một người lập biên bản chung, xử lý ngoại lệ và số báo mới: [KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md](KIEM_KE_BIEN_BAN_VA_HUY_HIEU.md).

Bản Domain Model cũ đã khôi phục nguyên nội dung, gồm sơ đồ lớp: [DOMAIN_MODEL_RECOVERY.md](DOMAIN_MODEL_RECOVERY.md).

Cập nhật 14/10/2026. Toàn bộ đặc tả và tài liệu kiến trúc/vận hành đã hợp nhất theo runtime hiện hành; báo cáo kiểm chứng trong DOCS_SYNC.md. SRS/UC/domain/API/UI đã hợp nhất thành bản hiện hành; bản trước hợp nhất ở archive/before-full-sync-20261014, bản vận hành cũ ở archive/pre-microservice-doc-sync-20261014, chỉ để truy vết, không dùng làm hướng dẫn chạy.

| Nội dung | Tài liệu |
| --- | --- |
| Kiến trúc đang chạy và giới hạn | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Owner, database, tài khoản, migration | [SERVICE_DATABASES.md](SERVICE_DATABASES.md), [DATABASE.md](DATABASE.md) |
| Chạy và nâng cấp Docker | [DOCKER.md](DOCKER.md) |
| Nút xóa dữ liệu nghiệp vụ để test lại | [RESET_DU_LIEU_TEST.md](RESET_DU_LIEU_TEST.md) |
| Tài khoản mẫu, mật khẩu và quyền | [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md) |
| Test case theo đặc tả UC | [TEST_CASES.md](TEST_CASES.md) |
| Kịch bản nhập liệu QC/AC và Ban kiểm kê | [KICH_BAN_TEST_QCAC_KIEM_KE.md](KICH_BAN_TEST_QCAC_KIEM_KE.md) |
| Lập đợt kiểm kê, phần lô và quản lý công việc | [CONG_VIEC_KIEM_TRA_LO.md](CONG_VIEC_KIEM_TRA_LO.md) |
| Chủ xưởng yêu cầu nhập/xuất, phân công và ghi phiếu theo giấy | [YEU_CAU_NHAP_XUAT_CHU_XUONG.md](YEU_CAU_NHAP_XUAT_CHU_XUONG.md) |
| Ngoại lệ trong biên bản và chủ xưởng phê duyệt | [NGOAI_LE_TRONG_BIEN_BAN.md](NGOAI_LE_TRONG_BIEN_BAN.md) |
| Phiếu chấm 10 module nghiệp vụ | [PHIEU_CHAM.md](PHIEU_CHAM.md) |
| Luồng kiểm tra hệ thống thực tế | [LUONG_KIEM_TRA_THUC_TE.md](LUONG_KIEM_TRA_THUC_TE.md) |
| Đặt hàng, công thức NVL, đối chiếu tồn và ảnh báo cáo | [LUONG_DAT_HANG_TIEN_SAN_XUAT.md](LUONG_DAT_HANG_TIEN_SAN_XUAT.md) |
| Mua NVL theo NCC từng dòng và giới hạn ngày | [MUA_NVL_VA_RANG_BUOC_NGAY.md](MUA_NVL_VA_RANG_BUOC_NGAY.md) |
| Dữ liệu test khi clone máy mới | [DU_LIEU_TEST_MAY_MOI.md](DU_LIEU_TEST_MAY_MOI.md) |
| Bộ chứng từ test riêng từng UC và thư mục ảnh | [DEMO_FIXTURES.md](DEMO_FIXTURES.md) |
| Vị trí cấu hình CSDL và chuyển lên host | [CAU_HINH_CSDL_HOST.md](CAU_HINH_CSDL_HOST.md) |
| Kế thừa actor và UC | [ACTOR_UC_GENERALIZATION.md](ACTOR_UC_GENERALIZATION.md), [PlantUML](ACTOR_UC_GENERALIZATION.puml) |
| Kết quả kiểm thử và ma trận thực thi | [TEST_RESULTS.md](TEST_RESULTS.md), [TEST_EXECUTION_MATRIX.md](TEST_EXECUTION_MATRIX.md) |
| Triển khai tiếp / production | [IMPLEMENTATION.md](IMPLEMENTATION.md), [PRODUCTION.md](PRODUCTION.md) |
| Chuyển tiếp sang độc lập dữ liệu | [MICROSERVICE_MIGRATION.md](MICROSERVICE_MIGRATION.md) |
| Prompt bàn giao | [MICROSERVICE_HANDOFF_PROMPT.md](MICROSERVICE_HANDOFF_PROMPT.md) |
| Tiến độ / backlog | [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md), [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) |
| Yêu cầu và quy trình | [SRS.md](SRS.md), [USE_CASES.md](USE_CASES.md), [DOMAIN_MODEL.md](DOMAIN_MODEL.md), [BUSINESS_DECISIONS.md](BUSINESS_DECISIONS.md) |
| API / giao diện | [API.md](API.md), [UI_SPEC.md](UI_SPEC.md) |
| Ngoại lệ / cách ly / bù QC | [WAREHOUSE_EXCEPTION_WORKFLOWS.md](WAREHOUSE_EXCEPTION_WORKFLOWS.md) |
| Nhập từng phần | [PARTIAL_PRODUCTION_RECEIPTS.md](PARTIAL_PRODUCTION_RECEIPTS.md) |
| Đồng bộ tài liệu | [DOCS_SYNC.md](DOCS_SYNC.md) |

Bản hiện hành không chứa các đặc tả cũ để ghi đè bằng ghi chú đầu trang. Lịch sử chỉ trong archive. Kiến trúc deploy theo ARCHITECTURE/SERVICE_DATABASES; mức nghiệm thu theo IMPLEMENTATION_PROGRESS, chưa chứng nhận tất cả nhánh UC.

- [Cấu trúc hiện hành](STRUCTURE.md)
- [API routes từ router](generated/API_ROUTES.md)
- [Whitelist request từ code](generated/API_CONTRACT_FIELDS.md)
- [Đối tượng CSDL theo owner](generated/DATABASE_OBJECTS.md)

Sau thay đổi nguồn: npm run docs:sync, sau đó npm run check:sync. Cấu hình menu browser cũng được sinh từ navigation.js.
- [Ảnh danh mục và lưu trữ](CATEGORY_IMAGES.md)

C?p nh?t danh m?c b?nh, ??n v?/gi? NVL v? qu?n tr? t?i kho?n: [QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md](QUAN_TRI_TAI_KHOAN_VA_DANH_MUC_BANH.md).
